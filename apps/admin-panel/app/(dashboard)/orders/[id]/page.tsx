import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@rrs/shared";
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from "@rrs/types";
import { OrderStatusUpdater } from "@/components/orders/order-status-updater";
import Image from "next/image";
import type { Metadata } from "next";

interface OrderDetailPageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id.slice(0, 8)}…` };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createAdminSupabaseServer();

  const { data: order } = await supabase
    .from("orders")
    .select(`*, items:order_items(*), payment:payments(*), tracking:tracking_updates(*), user:profiles(full_name, phone)`)
    .eq("id", id)
    .single();

  if (!order) notFound();

  type OrderItem = { id: string; name_snapshot: string; image_snapshot: string | null; price: number; quantity: number; sku_snapshot: string | null };
  type TrackingUpdate = { id: string; status: string; description: string; location: string | null; occurred_at: string };
  type PaymentRecord = { provider: string; status: string; amount: number; provider_payment_id: string | null; captured_at: string | null };

  const addr = order.address_snapshot as { full_name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string };
  const user = order.user as { full_name: string | null; phone: string | null } | null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-gray-900">Order #{order.order_number}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
              order.status === "cancelled" ? "bg-red-100 text-red-700" :
              "bg-blue-100 text-blue-700"
            }`}>
              {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Placed {formatDate(order.created_at, { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="flex gap-3">
          {order.gst_invoice_url && (
            <a href={order.gst_invoice_url} target="_blank" className="btn-secondary">📄 GST Invoice</a>
          )}
          <button className="btn-secondary">🖨 Print</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status updater */}
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />

          {/* Items */}
          <div className="card-admin p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Order Items ({(order.items as OrderItem[])?.length})</h2>
            <div className="space-y-3">
              {(order.items as OrderItem[])?.map((item) => (
                <div key={item.id} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.image_snapshot ? (
                      <Image src={item.image_snapshot} alt={item.name_snapshot} width={56} height={56} className="object-cover w-full h-full" />
                    ) : <div className="w-full h-full flex items-center justify-center text-xl">🌶</div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.name_snapshot}</p>
                    {item.sku_snapshot && <p className="text-xs text-gray-400 font-mono">{item.sku_snapshot}</p>}
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>−{formatCurrency(order.discount_amount)}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shipping_fee === 0 ? "Free" : formatCurrency(order.shipping_fee)}</span></div>
              <div className="flex justify-between text-gray-500 text-xs"><span>GST (5%)</span><span>{formatCurrency(order.tax_amount)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100"><span>Total</span><span className="text-maroon-600">{formatCurrency(order.total)}</span></div>
            </div>
          </div>

          {/* Tracking */}
          <div className="card-admin p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Tracking History</h2>
            <div className="space-y-3">
              {(order.tracking as TrackingUpdate[])?.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()).map((t) => (
                <div key={t.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-royal-gold-500 mt-1.5 flex-shrink-0" />
                    <div className="w-0.5 bg-gray-100 flex-1 mt-1" />
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium text-gray-800">{t.description}</p>
                    {t.location && <p className="text-xs text-gray-500">{t.location}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.occurred_at, { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="card-admin p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Customer</h3>
            <p className="text-sm font-medium text-gray-800">{user?.full_name || "Guest"}</p>
            {user?.phone && <p className="text-sm text-gray-600 mt-0.5">{user.phone}</p>}
          </div>

          {/* Address */}
          <div className="card-admin p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Delivery Address</h3>
            <p className="text-sm font-medium text-gray-800">{addr.full_name}</p>
            <p className="text-sm text-gray-600 mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
            <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
            <p className="text-sm text-gray-500 mt-0.5">{addr.phone}</p>
          </div>

          {/* Payment */}
          <div className="card-admin p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Payment</h3>
            {(order.payment as PaymentRecord[])?.map((p, i) => (
              <div key={i} className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Provider</span>
                  <span className="font-mono uppercase text-xs font-medium">{p.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`text-xs font-medium ${p.status === "captured" ? "text-emerald-600" : p.status === "failed" ? "text-red-600" : "text-amber-600"}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold">{formatCurrency(p.amount)}</span>
                </div>
                {p.provider_payment_id && (
                  <div>
                    <span className="text-gray-500">Ref:</span>
                    <span className="font-mono text-xs ml-1 text-gray-600">{p.provider_payment_id.slice(0, 16)}…</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
