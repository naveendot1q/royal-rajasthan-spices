import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { InventoryTable } from "@/components/inventory/inventory-table";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const supabase = await createAdminSupabaseServer();

  const { data: inventory } = await supabase
    .from("inventory")
    .select(`
      id, quantity, reserved_qty, low_stock_threshold, updated_at,
      variant:product_variants(
        id, name, sku,
        product:products(id, name, slug, status)
      )
    `)
    .order("quantity", { ascending: true });

  const lowStockCount = (inventory || []).filter(
    (i) => i.quantity <= i.low_stock_threshold
  ).length;
  const outOfStockCount = (inventory || []).filter((i) => i.quantity === 0).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">{inventory?.length} variants tracked</p>
        </div>
        <button className="btn-secondary">Export CSV</button>
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Variants", value: inventory?.length || 0, color: "border-blue-200 bg-blue-50", text: "text-blue-700" },
          { label: "Low Stock", value: lowStockCount, color: "border-amber-200 bg-amber-50", text: "text-amber-700" },
          { label: "Out of Stock", value: outOfStockCount, color: "border-red-200 bg-red-50", text: "text-red-700" },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
            <div className={`text-3xl font-bold ${card.text}`}>{card.value}</div>
            <div className={`text-sm ${card.text} mt-0.5`}>{card.label}</div>
          </div>
        ))}
      </div>

      <InventoryTable items={inventory as Parameters<typeof InventoryTable>[0]["items"]} />
    </div>
  );
}
