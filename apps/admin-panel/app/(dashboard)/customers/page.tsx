import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { formatDate, formatCurrency } from "@rrs/shared";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customers" };

interface CustomersPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const { q, page: pageStr = "1" } = await searchParams;
  const supabase = await createAdminSupabaseServer();
  const page = Number(pageStr);
  const pageSize = 25;

  // Get user profiles with order stats
  const { data: profiles, count } = await supabase
    .from("profiles")
    .select(`
      id, full_name, phone, created_at, loyalty_pts, is_verified
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  // Enrich with order counts
  const enriched = await Promise.all(
    (profiles || []).map(async (profile) => {
      const { count: orderCount } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id);

      const { data: totalSpent } = await supabase
        .from("orders")
        .select("total")
        .eq("user_id", profile.id)
        .eq("status", "delivered");

      const spent = (totalSpent || []).reduce((s, o) => s + o.total, 0);

      return { ...profile, orderCount: orderCount || 0, totalSpent: spent };
    })
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">{count?.toLocaleString("en-IN")} registered users</p>
        </div>
        <button className="btn-secondary">Export CSV</button>
      </div>

      <div className="card-admin p-4">
        <input defaultValue={q} placeholder="Search by name or phone…" className="input-admin max-w-xs" />
      </div>

      <div className="card-admin overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-xs text-gray-500">
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Joined</th>
              <th className="text-center px-5 py-3 font-medium">Verified</th>
              <th className="text-right px-5 py-3 font-medium">Orders</th>
              <th className="text-right px-5 py-3 font-medium">Total Spent</th>
              <th className="text-right px-5 py-3 font-medium">Loyalty Pts</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {enriched.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-gold-400 to-maroon-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {customer.full_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{customer.full_name || "—"}</div>
                      {customer.phone && <div className="text-xs text-gray-400">{customer.phone}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{formatDate(customer.created_at)}</td>
                <td className="px-5 py-4 text-center">
                  <span className={`text-xs font-medium ${customer.is_verified ? "text-emerald-600" : "text-gray-400"}`}>
                    {customer.is_verified ? "✓ Yes" : "No"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right text-sm font-medium text-gray-900">{customer.orderCount}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-maroon-600">{formatCurrency(customer.totalSpent)}</td>
                <td className="px-5 py-4 text-right text-sm text-royal-gold-600 font-medium">{customer.loyalty_pts}</td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/customers/${customer.id}`} className="text-xs text-royal-gold-600 hover:underline font-medium">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
