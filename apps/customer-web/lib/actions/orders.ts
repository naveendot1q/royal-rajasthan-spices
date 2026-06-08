"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payment";
import { sendOrderConfirmationEmail, sendOrderConfirmationSMS } from "@rrs/notifications";
import { calculateGST, generateOrderNumber } from "@rrs/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(["razorpay", "stripe", "cod"]),
  couponCode: z.string().optional(),
  shippingMethodId: z.string().uuid().optional(),
});

type CartVariantProduct = { name: string; images?: { url: string; is_primary: boolean }[] };
type CartVariant = { id: string; name: string; sku: string | null; product: CartVariantProduct | null };
type CartItemRaw = { id: string; quantity: number; price_snapshot: number; variant: CartVariant | null };

export async function createOrder(formData: FormData) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to place an order" };

  const parsed = createOrderSchema.safeParse({
    addressId: formData.get("addressId"),
    paymentMethod: formData.get("paymentMethod"),
    couponCode: formData.get("couponCode") || undefined,
    shippingMethodId: formData.get("shippingMethodId") || undefined,
  });
  if (!parsed.success) return { error: "Invalid checkout data" };

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!cart) return { error: "Cart is empty" };

  const { data: rawCartItems } = await supabase
    .from("cart_items")
    .select(`
      id, quantity, price_snapshot,
      variant:product_variants(id, name, sku, product:products(name, images:product_images(url, is_primary)))
    `)
    .eq("cart_id", cart.id)
    .eq("saved_for_later", false);

  if (!rawCartItems || rawCartItems.length === 0) return { error: "Cart is empty" };
  const cartItems = rawCartItems as unknown as CartItemRaw[];

  const { data: address } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", parsed.data.addressId)
    .eq("user_id", user.id)
    .single();
  if (!address) return { error: "Address not found" };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price_snapshot * item.quantity, 0);
  let discountAmount = 0;
  let couponId: string | null = null;

  if (parsed.data.couponCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", parsed.data.couponCode.toUpperCase())
      .eq("is_active", true)
      .single();

    if (coupon) {
      if (!coupon.min_order || subtotal >= coupon.min_order) {
        if (coupon.type === "percentage") {
          discountAmount = Math.min(subtotal * (coupon.value / 100), coupon.max_discount || Infinity);
        } else if (coupon.type === "fixed") {
          discountAmount = Math.min(coupon.value, subtotal);
        }
        couponId = coupon.id;
        await supabase.from("coupons").update({ used_count: (coupon.used_count || 0) + 1 }).eq("id", coupon.id);
      }
    }
  }

  const shippingFee = subtotal >= 499 ? 0 : 60;
  const afterDiscount = subtotal - discountAmount + shippingFee;
  const gstCalc = calculateGST(afterDiscount);
  const total = gstCalc.total;

  const orderNumber = generateOrderNumber();
  const addressSnapshot = {
    full_name: address.full_name,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country,
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      status: "pending",
      subtotal,
      discount_amount: discountAmount,
      shipping_fee: shippingFee,
      tax_amount: gstCalc.gst,
      total,
      currency: "INR",
      payment_method: parsed.data.paymentMethod,
      coupon_id: couponId,
      address_snapshot: addressSnapshot,
    })
    .select()
    .single();

  if (orderError || !order) return { error: "Failed to create order" };

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    variant_id: item.variant?.id,
    name_snapshot: `${item.variant?.product?.name} - ${item.variant?.name}`,
    image_snapshot: item.variant?.product?.images?.find((i) => i.is_primary)?.url || null,
    sku_snapshot: item.variant?.sku || null,
    price: item.price_snapshot,
    quantity: item.quantity,
  }));

  await supabase.from("order_items").insert(orderItems);

  const paymentProvider = getPaymentProvider();

  if (parsed.data.paymentMethod === "cod") {
    await supabase.from("payments").insert({
      order_id: order.id,
      provider: "cod",
      amount: total,
      status: "pending",
    });

    await supabase.from("orders").update({ status: "confirmed" }).eq("id", order.id);

    await supabase.from("tracking_updates").insert({
      order_id: order.id,
      status: "confirmed",
      description: "Order confirmed. Payment to be collected on delivery.",
    });

    await supabase.from("cart_items").delete().eq("cart_id", cart.id);

    const { data: profile } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).single();
    await sendOrderConfirmationEmail({
      to: user.email!,
      orderNumber,
      customerName: profile?.full_name || "Valued Customer",
      total,
      items: cartItems.map((i) => ({
        name: `${i.variant?.product?.name} - ${i.variant?.name}`,
        qty: i.quantity,
        price: i.price_snapshot,
      })),
      deliveryAddress: `${addressSnapshot.line1}, ${addressSnapshot.city}, ${addressSnapshot.state} ${addressSnapshot.pincode}`,
    });

    if (profile?.phone) {
      await sendOrderConfirmationSMS(profile.phone, orderNumber);
    }

    revalidatePath("/account/orders");
    return { success: true, orderId: order.id, orderNumber };
  }

  const paymentOrder = await paymentProvider.createOrder(total, order.id);
  await supabase.from("payments").insert({
    order_id: order.id,
    provider: parsed.data.paymentMethod,
    provider_order_id: paymentOrder.id,
    amount: total,
    status: "pending",
  });

  return {
    success: true,
    requiresPayment: true,
    orderId: order.id,
    orderNumber,
    paymentOrderId: paymentOrder.id,
    amount: total,
    currency: "INR",
  };
}

export async function getOrderDetails(orderNumber: string) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(*),
      payment:payments(*),
      tracking:tracking_updates(*)
    `)
    .eq("order_number", orderNumber)
    .eq("user_id", user?.id || "")
    .single();

  return order;
}

export async function cancelOrder(orderId: string) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) return { error: "Order not found" };
  if (!["pending", "confirmed"].includes(order.status)) {
    return { error: "This order cannot be cancelled" };
  }

  await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
  await supabase.from("tracking_updates").insert({
    order_id: orderId,
    status: "cancelled",
    description: "Order cancelled by customer",
    created_by: user.id,
  });

  revalidatePath("/account/orders");
  return { success: true };
}
