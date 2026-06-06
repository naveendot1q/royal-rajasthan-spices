import type { IPaymentProvider, PaymentOrder, PaymentCapture, RefundResult } from "@rrs/types";
import crypto from "crypto";

export class RazorpayProvider implements IPaymentProvider {
  private keyId = process.env.RAZORPAY_KEY_ID!;
  private keySecret = process.env.RAZORPAY_KEY_SECRET!;

  private get auth() {
    return Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
  }

  async createOrder(amount: number, orderId: string, currency = "INR"): Promise<PaymentOrder> {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency,
        receipt: orderId,
        notes: { order_id: orderId, platform: "royal-rajasthan-spices" },
      }),
    });
    if (!res.ok) throw new Error("Razorpay order creation failed");
    const data = await res.json();
    return { id: data.id, amount: data.amount, currency: data.currency, receipt: data.receipt };
  }

  async capturePayment(capture: PaymentCapture): Promise<boolean> {
    const { orderId, paymentId, signature } = capture;
    const expectedSig = crypto
      .createHmac("sha256", this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    return expectedSig === signature;
  }

  async refund(paymentId: string, amount: number): Promise<RefundResult> {
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.auth}`,
      },
      body: JSON.stringify({ amount: Math.round(amount * 100) }),
    });
    const data = await res.json();
    return { refundId: data.id, status: data.status, amount: data.amount / 100 };
  }

  verifyWebhook(payload: string, signature: string): boolean {
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");
    return expected === signature;
  }
}
