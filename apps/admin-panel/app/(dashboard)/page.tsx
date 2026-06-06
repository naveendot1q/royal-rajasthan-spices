import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { TopProducts } from "@/components/dashboard/top-products";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData() {
  const supabase = await createAdminSupabaseServer();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const [ordersResult, revenueResult, customersResult, productsResult,
    todayOrdersResult, recentOrdersResult, topProductsResult, lowStockResult, chartResult] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).neq("status", "cancelled").gte("created_at", thirtyDaysAgo),
      supabase.from("orders").select("total").neq("status", "cancelled").neq("status", "refunded").gte("created_at", thirtyDaysAgo),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
      supabase.from("orders").select("id, total").neq("status", "cancelled").gte("created_at", todayStart),
      supabase.from("orders")
        .select("id, order_number, status, total, created_at, user:profiles(full_name)")
        .order("created_at", { ascending: false }).limit(10),
      supabase.from("products")
        .select("id, name, sales_count, avg_rating, base_price, images:product_images(url, is_primary)")
        .eq("status", "active").order("sales_count", { ascending: false }).limit(5),
      supabase.from("inventory")
        .select("quantity, low_stock_threshold, variant:product_variants(id, name, sku, product:products(name))")
        .lte("quantity", 10).order("quantity").limit(8),
      supabase.from("orders").select("created_at, total").neq("status", "cancelled").neq("status", "refunded").gte("created_at", thirtyDaysAgo).order("created_at"),
    ]);

  const revenue30d = (revenueResult.data || []).reduce((s, o) => s + o.total, 0);
  const todayRevenue = (todayOrdersResult.data || []).reduce((s, o) => s + o.total, 0);
  const dailySales: Record<string, number> = {};
  (chartResult.data || []).forEach((o) => {
    const d = o.created_at.slice(0, 10);
    dailySales[d] = (dailySales[d] || 0) + o.total;
  });
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    return { date: key, revenue: dailySales[key] || 0, label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) };
  });

  return {
    kpis: { orders30d: ordersResult.count || 0, revenue30d, customers30d: customersResult.count || 0, activeProducts: productsResult.count || 0, todayOrders: todayOrdersResult.data?.length || 0, todayRevenue },
    recentOrders: recentOrdersResult.data || [],
    topProducts: topProductsResult.data || [],
    lowStock: lowStockResult.data || [],
    chartData,
  };
}

export default async function DashboardPage() {
  const { kpis, recentOrders, topProducts, lowStock, chartData } = await getDashboardData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Royal Rajasthan Spice Market — Operations Overview</p>
      </div>
      <KPICards kpis={kpis} />
      <SalesChart data={chartData} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders orders={recentOrders as Parameters<typeof RecentOrders>[0]["orders"]} />
        </div>
        <div className="space-y-6">
          <TopProducts products={topProducts as Parameters<typeof TopProducts>[0]["products"]} />
          <LowStockAlert items={lowStock as Parameters<typeof LowStockAlert>[0]["items"]} />
        </div>
      </div>
    </div>
  );
}
