"use client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { formatCurrency } from "@rrs/shared";
import { ORDER_STATUS_LABELS } from "@rrs/types";

interface AnalyticsData {
  chartData: Array<{ date: string; label: string; revenue: number; orders: number }>;
  statusDist: Record<string, number>;
  totalRevenue: number;
  avgOrder: number;
  totalOrders: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B", confirmed: "#3B82F6", packed: "#6366F1",
  shipped: "#8B5CF6", out_for_delivery: "#F97316",
  delivered: "#10B981", cancelled: "#EF4444",
  returned: "#6B7280", refunded: "#14B8A6",
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg text-xs">
        <p className="text-gray-500 mb-2 font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-semibold">
            {p.name === "revenue" ? formatCurrency(p.value) : `${p.value} orders`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const pieData = Object.entries(data.statusDist).map(([status, count]) => ({
    name: ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || status,
    value: count,
    color: STATUS_COLORS[status] || "#94A3B8",
  }));

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Revenue (90d)", value: formatCurrency(data.totalRevenue) },
          { label: "Total Orders (90d)", value: data.totalOrders.toLocaleString("en-IN") },
          { label: "Avg Order Value", value: formatCurrency(data.avgOrder) },
        ].map((k) => (
          <div key={k.label} className="card-admin p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="card-admin p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Daily Revenue (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data.chartData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B8860B" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#B8860B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="revenue" stroke="#B8860B" strokeWidth={2.5} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders per day */}
        <div className="card-admin p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Daily Orders (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="orders" fill="#6B1A1A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="card-admin p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Order Status Distribution</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "orders"]} />
                <Legend
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                  iconSize={8}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
