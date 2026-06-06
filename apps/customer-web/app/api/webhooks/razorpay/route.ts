import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@rrs/database";
import { getPaymentProvider } from "@/lib/payment";
import { sendOrderConfirmationEmail } from "@rrs/notifications";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  const provider = getPaymentProvider();
  if (!provider.verifyWebhook(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  const supabase = createServiceClient();

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;

    // Find order by provider_order_id
    const { data: paymentRecord } = await supabase
      .from("payments")
      .select("id, order_id")
      .eq("provider_order_id", payment.order_id)
      .single();

    if (paymentRecord) {
      // Update payment status
      await supabase.from("payments").update({
        provider_payment_id: payment.id,
        status: "captured",
        captured_at: new Date().toISOString(),
        metadata: payment,
      }).eq("id", paymentRecord.id);

      // Update order status
      await supabase.from("orders").update({ status: "confirmed" }).eq("id", paymentRecord.order_id);

      // Add tracking update
      await supabase.from("tracking_updates").insert({
        order_id: paymentRecord.order_id,
        status: "confirmed",
        description: "Payment received. Order confirmed.",
      });

      // Clear cart & send email
      const { data: order } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("id", paymentRecord.order_id)
        .single();

      if (order) {
        // Clear cart
        const { data: cart } = await supabase.from("carts").select("id").eq("user_id", order.user_id).single();
        if (cart) await supabase.from("cart_items").delete().eq("cart_id", cart.id);

        // Send email
        const { data: user } = await supabase.auth.admin.getUserById(order.user_id);
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", order.user_id).single();
        const addr = order.address_snapshot as { line1: string; city: string; state: string; pincode: string };

        if (user?.user?.email) {
          await sendOrderConfirmationEmail({
            to: user.user.email,
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
    }
  }

  if (event.event === "payment.failed") {
    const payment = event.payload.payment.entity;
    await supabase.from("payments").update({ status: "failed" }).eq("provider_order_id", payment.order_id);
  }

  return NextResponse.json({ received: true });
}
