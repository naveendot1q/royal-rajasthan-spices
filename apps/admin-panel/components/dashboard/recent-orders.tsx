"use client";
import Link from "next/link";
import { formatCurrency, formatRelativeTime } from "@rrs/shared";
import { ORDER_STATUS_LABELS } from "@rrs/types";
import { ExternalLink } from "lucide-react";

interface Order {
  id: string; order_number: string; status: string;
  total: number; created_at: string;
  user: { full_name: string | null } | null;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-status-pending",
  confirmed: "badge-status-confirmed",
  packed: "px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full",
  shipped: "badge-status-shipped",
  out_for_delivery: "px-2.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full",
  delivered: "badge-status-delivered",
  cancelled: "badge-status-cancelled",
  returned: "px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full",
  refunded: "px-2.5 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full",
};

export function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <div className="card-admin">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        <Link href="/orders" className="text-xs text-royal-gold-600 hover:underline flex items-center gap-1">
          View all <ExternalLink size={12} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-medium">Order</th>
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Total</th>
              <th className="text-right px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <Link href={`/orders/${order.id}`} className="font-medium text-gray-800 hover:text-royal-gold-600 text-sm font-mono">
                    #{order.order_number}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{order.user?.full_name || "Guest"}</td>
                <td className="px-5 py-3.5">
                  <span className={STATUS_BADGE[order.status] || "px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"}>
                    {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-medium text-gray-900 text-sm">{formatCurrency(order.total)}</td>
                <td className="px-5 py-3.5 text-right text-xs text-gray-400">{formatRelativeTime(order.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
