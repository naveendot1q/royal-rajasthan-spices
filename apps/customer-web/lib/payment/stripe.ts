import type { IPaymentProvider, PaymentOrder, PaymentCapture, RefundResult } from "@rrs/types";
import Stripe from "stripe";

export class StripeProvider implements IPaymentProvider {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

  async createOrder(amount: number, orderId: string, currency = "inr"): Promise<PaymentOrder> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: { order_id: orderId },
    });
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      receipt: orderId,
    };
  }

  async capturePayment(capture: PaymentCapture): Promise<boolean> {
    const intent = await this.stripe.paymentIntents.retrieve(capture.paymentId);
    return intent.status === "succeeded";
  }

  async refund(paymentId: string, amount: number): Promise<RefundResult> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentId,
      amount: Math.round(amount * 100),
    });
    return { refundId: refund.id, status: refund.status, amount: (refund.amount ?? 0) / 100 };
  }

  verifyWebhook(payload: string, signature: string): boolean {
    try {
      this.stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
      return true;
    } catch {
      return false;
    }
  }
}
