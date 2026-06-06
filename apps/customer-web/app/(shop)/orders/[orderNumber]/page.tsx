import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getOrderDetails } from "@/lib/actions/orders";
import { OrderTimeline } from "@/components/checkout/order-timeline";
import { formatCurrency, formatDate } from "@rrs/shared";
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from "@rrs/types";
import type { Metadata } from "next";
import Image from "next/image";
import { Package, MapPin, Phone } from "lucide-react";

interface OrderPageProps { params: Promise<{ orderNumber: string }> }

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;
  const user = await getUser();
  if (!user) redirect(`/login?redirect=/orders/${orderNumber}`);

  const order = await getOrderDetails(orderNumber);
  if (!order) notFound();

  const addr = order.address_snapshot as { full_name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string };
  const isTerminal = ["delivered", "cancelled", "returned", "refunded"].includes(order.status);
  const currentStep = ORDER_STATUS_SEQUENCE.indexOf(order.status as typeof ORDER_STATUS_SEQUENCE[number]);

  return (
    <div className="min-h-screen bg-palace-ivory">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon-800 to-maroon-700 text-white pattern-overlay">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-royal-gold-300 text-sm font-medium mb-1">Track Your Order</p>
              <h1 className="font-display text-3xl font-bold">#{order.order_number}</h1>
              <p className="text-gray-300 text-sm mt-1">Placed on {formatDate(order.created_at)}</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                order.status === "delivered" ? "bg-emerald-spice-500/20 text-emerald-spice-300" :
                order.status === "cancelled" ? "bg-red-500/20 text-red-300" :
                "bg-royal-gold-500/20 text-royal-gold-300"
              }`}>
                {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
              </div>
              <p className="text-gray-300 text-sm mt-2">Total: {formatCurrency(order.total)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline + Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status timeline */}
            {!["cancelled", "returned", "refunded"].includes(order.status) && (
              <div className="bg-white rounded-2xl border border-royal-gold-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-6">Order Progress</h2>
                <OrderTimeline currentStatus={order.status as typeof ORDER_STATUS_SEQUENCE[number]} />
              </div>
            )}

            {/* Tracking updates */}
            {(order.tracking as { id: string; status: string; description: string; location: string | null; occurred_at: string }[])?.length > 0 && (
              <div className="bg-white rounded-2xl border border-royal-gold-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Tracking History</h2>
                <div className="space-y-4">
                  {(order.tracking as { id: string; status: string; description: string; location: string | null; occurred_at: string }[])
                    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
                    .map((update) => (
                      <div key={update.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-royal-gold-500 flex-shrink-0 mt-1" />
                          <div className="w-0.5 bg-royal-gold-200 flex-1 mt-1" />
                        </div>
                        <div className="pb-4">
                          <p className="font-medium text-gray-800 text-sm">{update.description}</p>
                          {update.location && <p className="text-xs text-gray-500">{update.location}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(update.occurred_at, { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Order items */}
            <div className="bg-white rounded-2xl border border-royal-gold-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Order Items ({(order.items as { id: string }[])?.length})</h2>
              <div className="space-y-4">
                {(order.items as { id: string; name_snapshot: string; image_snapshot: string | null; price: number; quantity: number }[])?.map((item) => (
                  <div key={item.id} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                    <div className="w-16 h-16 rounded-lg bg-desert-sand overflow-hidden flex-shrink-0">
                      {item.image_snapshot ? (
                        <Image src={item.image_snapshot} alt={item.name_snapshot} width={64} height={64} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🌶</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.name_snapshot}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-maroon-600">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-royal-gold-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-royal-gold-600" />
                <h3 className="font-semibold text-gray-800">Delivery Address</h3>
              </div>
              <p className="font-medium text-gray-800 text-sm">{addr.full_name}</p>
              <p className="text-sm text-gray-600 mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
              <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                <Phone size={13} />
                {addr.phone}
              </div>
            </div>

            {/* Payment summary */}
            <div className="bg-white rounded-2xl border border-royal-gold-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-spice-600">
                    <span>Discount</span>
                    <span>−{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{order.shipping_fee === 0 ? "Free" : formatCurrency(order.shipping_fee)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>GST (5%)</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-maroon-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">Payment: </span>
                <span className="text-xs font-medium text-gray-700 uppercase">{order.payment_method}</span>
              </div>
            </div>

            {/* Invoice download */}
            {order.gst_invoice_url && (
              <a href={order.gst_invoice_url} target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 text-center border-2 border-royal-gold-300 text-royal-gold-700 rounded-xl text-sm font-medium hover:bg-royal-gold-50 transition-colors">
                📄 Download GST Invoice
              </a>
            )}

            {/* Cancel order */}
            {["pending", "confirmed"].includes(order.status) && (
              <button className="block w-full py-2.5 text-center border-2 border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
