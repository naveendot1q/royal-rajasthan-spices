import type { IPaymentProvider, PaymentOrder, PaymentCapture, RefundResult } from "@rrs/types";

export class CodProvider implements IPaymentProvider {
  async createOrder(amount: number, orderId: string): Promise<PaymentOrder> {
    return { id: `cod_${orderId}`, amount, currency: "INR", receipt: orderId };
  }
  async capturePayment(_: PaymentCapture): Promise<boolean> {
    return true; // COD auto-confirms
  }
  async refund(_paymentId: string, amount: number): Promise<RefundResult> {
    return { refundId: `cod_refund_${Date.now()}`, status: "processed", amount };
  }
  verifyWebhook(_payload: string, _signature: string): boolean {
    return true;
  }
}
