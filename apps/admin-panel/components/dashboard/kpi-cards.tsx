"use client";
import { ShoppingCart, DollarSign, Users, Package, TrendingUp, Calendar } from "lucide-react";
import { formatCurrency } from "@rrs/shared";

interface KPICardsProps {
  kpis: {
    orders30d: number;
    revenue30d: number;
    customers30d: number;
    activeProducts: number;
    todayOrders: number;
    todayRevenue: number;
  };
}

export function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      label: "Revenue (30d)",
      value: formatCurrency(kpis.revenue30d),
      sub: `Today: ${formatCurrency(kpis.todayRevenue)}`,
      icon: DollarSign,
      color: "bg-royal-gold-50 text-royal-gold-600",
      border: "border-royal-gold-200",
    },
    {
      label: "Orders (30d)",
      value: kpis.orders30d.toLocaleString("en-IN"),
      sub: `Today: ${kpis.todayOrders} orders`,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-200",
    },
    {
      label: "New Customers (30d)",
      value: kpis.customers30d.toLocaleString("en-IN"),
      sub: "Verified accounts",
      icon: Users,
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-200",
    },
    {
      label: "Active Products",
      value: kpis.activeProducts.toLocaleString("en-IN"),
      sub: "Live in store",
      icon: Package,
      color: "bg-purple-50 text-purple-600",
      border: "border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`card-admin p-5 border ${card.border}`}>
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
              <card.icon size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-0.5">{card.value}</div>
          <div className="text-sm text-gray-500">{card.label}</div>
          <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
