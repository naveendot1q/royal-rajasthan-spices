import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payment";
import { sendOrderConfirmationEmail } from "@rrs/notifications";

export async function POST(req: NextRequest) {
  const { orderId, razorpayOrderId, razorpayPaymentId, signature } = await req.json();

  const provider = getPaymentProvider();
  const isValid = await provider.capturePayment({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature,
  });

  if (!isValid) {
    return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  await supabase.from("payments").update({
    provider_payment_id: razorpayPaymentId,
    status: "captured",
    captured_at: new Date().toISOString(),
  }).eq("order_id", orderId);

  await supabase.from("orders").update({ status: "confirmed" }).eq("id", orderId);

  await supabase.from("tracking_updates").insert({
    order_id: orderId,
    status: "confirmed",
    description: "Payment received. Order confirmed!",
  });

  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .single();

  if (order) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single();
      if (cart) await supabase.from("cart_items").delete().eq("cart_id", cart.id);

      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      const addr = order.address_snapshot as { line1: string; city: string; state: string; pincode: string };

      await sendOrderConfirmationEmail({
        to: user.email!,
        orderNumber: order.order_number,
        customerName: profile?.full_name || "Valued Customer",
        total: order.total,
        items: (order.items as { name_snapshot: string; quantity: number; price: number }[]).map((i) => ({
          name: i.name_snapshot, qty: i.quantity, price: i.price,
        })),
        deliveryAddress: `${addr.line1}, ${addr.city}, ${addr.state} ${addr.pincode}`,
      });
    }
  }

  return NextResponse.json({ success: true });
}
