import { redirect } from "next/navigation";
import { getUser, createSupabaseServer } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@rrs/shared";
import { ORDER_STATUS_LABELS } from "@rrs/types";
import Link from "next/link";
import type { Metadata } from "next";
import { Package } from "lucide-react";

export const metadata: Metadata = { title: "My Orders" };

type OrderItem = { id: string; name_snapshot: string; image_snapshot: string | null };
type Order = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
};

export default async function OrdersPage() {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/account/orders");

  const supabase = await createSupabaseServer();
  const { data: rawOrders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at, items:order_items(id, name_snapshot, image_snapshot)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const orders = (rawOrders ?? []) as unknown as Order[];

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    packed: "bg-indigo-100 text-indigo-700",
    shipped: "bg-purple-100 text-purple-700",
    out_for_delivery: "bg-orange-100 text-orange-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    returned: "bg-gray-100 text-gray-700",
    refunded: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-maroon-700 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-royal-gold-100">
          <Package size={48} className="mx-auto text-royal-gold-300 mb-4" />
          <h2 className="font-display text-xl text-maroon-600 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start exploring our premium spice collection</p>
          <Link href="/products" className="btn-primary inline-flex">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = order.items;
            return (
              <Link key={order.id} href={`/orders/${order.order_number}`}>
                <div className="bg-white rounded-2xl border border-royal-gold-100 p-5 hover:shadow-gold transition-shadow group">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-gray-800">#{order.order_number}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-maroon-600">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* Item previews */}
                  <div className="mt-3 flex gap-2">
                    {items.slice(0, 4).map((item) => (
                      <div key={item.id} className="w-10 h-10 rounded-lg bg-desert-sand overflow-hidden border border-royal-gold-100 flex-shrink-0">
                        {item.image_snapshot ? (
                          <img src={item.image_snapshot} alt={item.name_snapshot} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">🌶</div>
                        )}
                      </div>
                    ))}
                    {items.length > 4 && (
                      <div className="w-10 h-10 rounded-lg bg-desert-sand flex items-center justify-center text-xs text-gray-500 border border-royal-gold-100">
                        +{items.length - 4}
                      </div>
                    )}
                    <span className="ml-2 text-sm text-gray-600 self-center truncate">
                      {items[0]?.name_snapshot}{items.length > 1 ? ` +${items.length - 1} more` : ""}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
