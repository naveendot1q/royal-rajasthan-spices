import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@rrs/shared";
import { ORDER_STATUS_LABELS } from "@rrs/types";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders" };

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { status, page: pageStr = "1", q } = await searchParams;
  const supabase = await createAdminSupabaseServer();
  const page = Number(pageStr);
  const pageSize = 25;

  let query = supabase
    .from("orders")
    .select(`id, order_number, status, total, created_at, payment_method, user:profiles(full_name, phone)`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status && status !== "all") query = query.eq("status", status);
  if (q) query = query.ilike("order_number", `%${q}%`);

  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count || 0) / pageSize);

  const STATUS_TABS = ["all", "pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned", "refunded"];
  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700", confirmed: "bg-blue-100 text-blue-700",
    packed: "bg-indigo-100 text-indigo-700", shipped: "bg-purple-100 text-purple-700",
    out_for_delivery: "bg-orange-100 text-orange-700", delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700", returned: "bg-gray-100 text-gray-700",
    refunded: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{count?.toLocaleString("en-IN")} total orders</p>
        </div>
        <a href={`/api/orders/export?status=${status || "all"}`} className="btn-secondary flex items-center gap-2">
          Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="card-admin p-4">
        <div className="flex gap-3 flex-wrap mb-4">
          {STATUS_TABS.map((s) => (
            <Link
              key={s}
              href={`/orders?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                (status || "all") === s ? "bg-royal-gold-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "All" : ORDER_STATUS_LABELS[s as keyof typeof ORDER_STATUS_LABELS] || s}
            </Link>
          ))}
        </div>
        <input
          defaultValue={q}
          placeholder="Search order number…"
          className="input-admin max-w-xs"
        />
      </div>

      {/* Table */}
      <div className="card-admin overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500">
                <th className="text-left px-5 py-3 font-medium">Order</th>
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Payment</th>
                <th className="text-right px-5 py-3 font-medium">Total</th>
                <th className="text-right px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(orders || []).map((order) => {
                const user = order.user as { full_name: string | null; phone: string | null } | null;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-medium text-gray-800">#{order.order_number}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-gray-800">{user?.full_name || "—"}</div>
                      {user?.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs uppercase font-mono text-gray-600 px-2 py-0.5 bg-gray-100 rounded">
                        {order.payment_method || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatCurrency(order.total)}</td>
                    <td className="px-5 py-4 text-right text-xs text-gray-400">{formatDate(order.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/orders/${order.id}`} className="text-xs text-royal-gold-600 hover:underline font-medium">Manage</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={`/orders?page=${page - 1}&status=${status || "all"}`} className="btn-secondary px-3 py-1.5 text-xs">Previous</Link>}
              {page < totalPages && <Link href={`/orders?page=${page + 1}&status=${status || "all"}`} className="btn-secondary px-3 py-1.5 text-xs">Next</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
