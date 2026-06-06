export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

export type PaymentProvider = "razorpay" | "stripe" | "cod";
export type PaymentStatus = "pending" | "captured" | "failed" | "refunded";

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  name_snapshot: string;
  image_snapshot: string | null;
  sku_snapshot: string | null;
  price: number;
  quantity: number;
  fulfilled_qty: number;
}

export interface AddressSnapshot {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  tax_amount: number;
  total: number;
  currency: string;
  payment_method: PaymentProvider | null;
  coupon_id: string | null;
  address_snapshot: AddressSnapshot;
  notes: string | null;
  gst_invoice_url: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment;
  tracking?: TrackingUpdate[];
}

export interface Payment {
  id: string;
  order_id: string;
  provider: PaymentProvider;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  captured_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TrackingUpdate {
  id: string;
  order_id: string;
  status: OrderStatus;
  location: string | null;
  description: string;
  occurred_at: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:          "Payment Pending",
  confirmed:        "Order Confirmed",
  packed:           "Being Packed",
  shipped:          "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
  returned:         "Return Requested",
  refunded:         "Refunded",
};

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered",
];
