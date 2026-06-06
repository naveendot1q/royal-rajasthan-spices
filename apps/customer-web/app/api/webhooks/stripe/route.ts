import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@rrs/database";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata.order_id;

    await supabase.from("payments").update({
      provider_payment_id: intent.id,
      status: "captured",
      captured_at: new Date().toISOString(),
    }).eq("provider_order_id", intent.id);

    await supabase.from("orders").update({ status: "confirmed" }).eq("id", orderId);
    await supabase.from("tracking_updates").insert({
      order_id: orderId,
      status: "confirmed",
      description: "Payment received via Stripe. Order confirmed.",
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    await supabase.from("payments").update({ status: "failed" }).eq("provider_order_id", intent.id);
  }

  return NextResponse.json({ received: true });
}
