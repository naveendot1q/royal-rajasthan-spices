import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

async function getAnalyticsData() {
  const supabase = await createAdminSupabaseServer();
  const now = new Date();

  // Last 90 days
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [ordersRes, revenueByDay, topCategories, customerGrowth, ordersByStatus, avgOrderValue] =
    await Promise.all([
      // Orders by day (90d)
      supabase.from("orders").select("created_at, total, status")
        .gte("created_at", ninetyDaysAgo).neq("status", "cancelled"),

      // Revenue per category via order items + products
      supabase.from("order_items")
        .select("price, quantity, variant:product_variants(product:products(category:product_categories(name)))")
        .gte("created_at", ninetyDaysAgo),

      // Top categories by product count
      supabase.from("products")
        .select("category:product_categories(name), sales_count")
        .eq("status", "active")
        .is("deleted_at", null),

      // Customer signups per week (last 12 weeks)
      supabase.from("profiles").select("created_at")
        .gte("created_at", new Date(now.getTime() - 84 * 24 * 60 * 60 * 1000).toISOString()),

      // Orders by status distribution
      supabase.from("orders").select("status").gte("created_at", ninetyDaysAgo),

      // Average order value
      supabase.from("orders").select("total")
        .gte("created_at", ninetyDaysAgo).neq("status", "cancelled").neq("status", "refunded"),
    ]);

  // Build daily revenue chart (last 30 days)
  const dailyData: Record<string, { revenue: number; orders: number }> = {};
  (ordersRes.data || []).forEach((o) => {
    const day = o.created_at.slice(0, 10);
    if (!dailyData[day]) dailyData[day] = { revenue: 0, orders: 0 };
    dailyData[day].revenue += o.total;
    dailyData[day].orders += 1;
  });

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    return {
      date: key,
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenue: dailyData[key]?.revenue || 0,
      orders: dailyData[key]?.orders || 0,
    };
  });

  // Status distribution
  const statusDist: Record<string, number> = {};
  (ordersByStatus.data || []).forEach((o) => {
    statusDist[o.status] = (statusDist[o.status] || 0) + 1;
  });

  const totalRevenue = (avgOrderValue.data || []).reduce((s, o) => s + o.total, 0);
  const avgOrder = avgOrderValue.data?.length ? totalRevenue / avgOrderValue.data.length : 0;

  return {
    chartData,
    statusDist,
    totalRevenue,
    avgOrder,
    totalOrders: ordersRes.data?.length || 0,
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Last 90 days performance overview</p>
      </div>
      <AnalyticsDashboard data={data} />
    </div>
  );
}
