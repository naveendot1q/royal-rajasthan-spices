import type { Order } from "./order";

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentCapture {
  orderId: string;
  paymentId: string;
  signature?: string;
}

export interface RefundResult {
  refundId: string;
  status: string;
  amount: number;
}

export interface ShippingRate {
  carrier: string;
  name: string;
  price: number;
  estimated_days: number;
}

export interface Shipment {
  trackingNumber: string;
  carrier: string;
  labelUrl: string | null;
  estimatedDelivery: Date | null;
}

export interface IPaymentProvider {
  createOrder(amount: number, orderId: string, currency?: string): Promise<PaymentOrder>;
  capturePayment(capture: PaymentCapture): Promise<boolean>;
  refund(paymentId: string, amount: number): Promise<RefundResult>;
  verifyWebhook(payload: string, signature: string): boolean;
}

export interface IShippingProvider {
  createShipment(order: Order): Promise<Shipment>;
  trackOrder(trackingNumber: string): Promise<import("./order").TrackingUpdate[]>;
  cancelShipment(trackingNumber: string): Promise<boolean>;
  getLabel(trackingNumber: string): Promise<string>;
  getRates(fromPincode: string, toPincode: string, weightGrams: number): Promise<ShippingRate[]>;
}
