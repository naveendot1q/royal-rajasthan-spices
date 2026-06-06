import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@rrs/shared";
import { ORDER_STATUS_LABELS } from "@rrs/types";
import Link from "next/link";
import type { Metadata } from "next";
import { User, Package, Star, MessageSquare, MapPin } from "lucide-react";

interface CustomerDetailPageProps { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Customer" };

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const supabase = await createAdminSupabaseServer();

  const [profileRes, ordersRes, reviewsRes, ticketsRes, addressesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("orders").select("id, order_number, status, total, created_at, payment_method").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
    supabase.from("reviews").select("id, rating, title, status, created_at, product:products(name)").eq("user_id", id).order("created_at", { ascending: false }).limit(5),
    supabase.from("support_tickets").select("id, ticket_number, subject, status, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(5),
    supabase.from("addresses").select("*").eq("user_id", id).is("deleted_at", null),
  ]);

  if (!profileRes.data) notFound();

  const profile = profileRes.data;
  const orders = ordersRes.data || [];
  const totalSpent = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0);

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700", confirmed: "bg-blue-100 text-blue-700",
    delivered: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-5 card-admin p-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-gold-400 to-maroon-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {profile.full_name?.[0]?.toUpperCase() || <User size={24} />}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-gray-900">{profile.full_name || "Unnamed Customer"}</h1>
          <div className="flex gap-4 mt-2 flex-wrap text-sm text-gray-500">
            {profile.phone && <span>📱 {profile.phone}</span>}
            <span>📅 Joined {formatDate(profile.created_at)}</span>
            {profile.is_verified && <span className="text-emerald-600 font-medium">✓ Email Verified</span>}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-maroon-600">{formatCurrency(totalSpent)}</div>
          <div className="text-xs text-gray-400">lifetime value</div>
          <div className="mt-1">
            <span className="px-2 py-0.5 bg-royal-gold-100 text-royal-gold-700 text-xs font-medium rounded-full">
              {profile.loyalty_pts} pts
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Package, label: "Total Orders", value: orders.length },
          { icon: Package, label: "Delivered", value: orders.filter((o) => o.status === "delivered").length },
          { icon: Star, label: "Reviews", value: (reviewsRes.data || []).length },
          { icon: MessageSquare, label: "Support Tickets", value: (ticketsRes.data || []).length },
        ].map((stat) => (
          <div key={stat.label} className="card-admin p-4 text-center">
            <stat.icon size={20} className="mx-auto text-royal-gold-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card-admin overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 5).map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-mono text-xs text-gray-600">#{order.order_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                  </span>
                </div>
              </Link>
            ))}
            {orders.length === 0 && <p className="text-center py-8 text-sm text-gray-400">No orders yet</p>}
          </div>
        </div>

        {/* Addresses */}
        <div className="card-admin overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><MapPin size={15} /> Saved Addresses</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(addressesRes.data || []).map((addr) => (
              <div key={addr.id} className="px-5 py-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-gray-700 capitalize">{addr.label}</span>
                  {addr.is_default && <span className="text-xs text-royal-gold-600 font-medium">Default</span>}
                </div>
                <p className="text-xs text-gray-500">{addr.line1}, {addr.city}, {addr.state} {addr.pincode}</p>
                <p className="text-xs text-gray-400">{addr.full_name} · {addr.phone}</p>
              </div>
            ))}
            {(addressesRes.data || []).length === 0 && <p className="text-center py-8 text-sm text-gray-400">No addresses saved</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
