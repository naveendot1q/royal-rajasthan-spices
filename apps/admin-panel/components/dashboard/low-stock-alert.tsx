import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface LowStockItem {
  quantity: number;
  low_stock_threshold: number;
  variant: { id: string; name: string; sku: string | null; product: { name: string } | null } | null;
}

export function LowStockAlert({ items }: { items: LowStockItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="card-admin border-l-4 border-amber-400">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <AlertTriangle size={16} className="text-amber-500" />
        <h2 className="font-semibold text-gray-900">Low Stock Alert</h2>
        <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">{items.length}</span>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <Link
            key={item.variant?.id}
            href="/inventory"
            className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.variant?.product?.name}</p>
              <p className="text-xs text-gray-400">{item.variant?.name}</p>
            </div>
            <span className={`text-sm font-bold px-2 py-0.5 rounded ${item.quantity === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
              {item.quantity} left
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
