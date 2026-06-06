"use client";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDate } from "@rrs/shared";
import { Edit2, Check, X } from "lucide-react";

interface InventoryItem {
  id: string;
  quantity: number;
  reserved_qty: number;
  low_stock_threshold: number;
  updated_at: string;
  variant: {
    id: string; name: string; sku: string | null;
    product: { id: string; name: string; slug: string; status: string } | null;
  } | null;
}

export function InventoryTable({ items }: { items: InventoryItem[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ quantity: 0, low_stock_threshold: 10, reason: "" });
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [search, setSearch] = useState("");

  const filtered = (items || []).filter((item) => {
    if (filter === "low") return item.quantity > 0 && item.quantity <= item.low_stock_threshold;
    if (filter === "out") return item.quantity === 0;
    return true;
  }).filter((item) => {
    if (!search) return true;
    const productName = item.variant?.product?.name?.toLowerCase() || "";
    const variantName = item.variant?.name?.toLowerCase() || "";
    return productName.includes(search.toLowerCase()) || variantName.includes(search.toLowerCase());
  });

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditValues({ quantity: item.quantity, low_stock_threshold: item.low_stock_threshold, reason: "manual_adjustment" });
  };

  const saveEdit = async (item: InventoryItem) => {
    const supabase = createSupabaseClient();
    const delta = editValues.quantity - item.quantity;

    const { error } = await supabase
      .from("inventory")
      .update({ quantity: editValues.quantity, low_stock_threshold: editValues.low_stock_threshold })
      .eq("id", item.id);

    if (error) { toast.error("Failed to update inventory"); return; }

    if (delta !== 0) {
      await supabase.from("inventory_logs").insert({
        variant_id: item.variant?.id,
        delta,
        reason: editValues.reason || "manual_adjustment",
        reference_id: null,
      });
    }

    toast.success("Inventory updated");
    setEditingId(null);
    router.refresh();
  };

  return (
    <div className="card-admin overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-100 flex gap-4 flex-wrap items-center">
        <div className="flex gap-2">
          {(["all", "low", "out"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? "bg-royal-gold-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="input-admin max-w-xs"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-xs text-gray-500">
              <th className="text-left px-5 py-3 font-medium">Product / Variant</th>
              <th className="text-left px-5 py-3 font-medium">SKU</th>
              <th className="text-right px-5 py-3 font-medium">In Stock</th>
              <th className="text-right px-5 py-3 font-medium">Reserved</th>
              <th className="text-right px-5 py-3 font-medium">Available</th>
              <th className="text-right px-5 py-3 font-medium">Low Stock At</th>
              <th className="text-right px-5 py-3 font-medium">Updated</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((item) => {
              const available = item.quantity - item.reserved_qty;
              const isEditing = editingId === item.id;
              const isLow = item.quantity > 0 && item.quantity <= item.low_stock_threshold;
              const isOut = item.quantity === 0;

              return (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isOut ? "bg-red-50/30" : isLow ? "bg-amber-50/30" : ""}`}>
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-gray-800">{item.variant?.product?.name}</div>
                    <div className="text-xs text-gray-400">{item.variant?.name}</div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{item.variant?.sku || "—"}</td>
                  <td className="px-5 py-3.5 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.quantity}
                        onChange={(e) => setEditValues({ ...editValues, quantity: Number(e.target.value) })}
                        className="input-admin w-20 text-right text-sm"
                      />
                    ) : (
                      <span className={`font-semibold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-gray-800"}`}>
                        {item.quantity}
                        {isOut && <span className="ml-1 text-xs font-normal text-red-500">⚠ OUT</span>}
                        {isLow && !isOut && <span className="ml-1 text-xs font-normal text-amber-500">⚠ LOW</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm text-gray-500">{item.reserved_qty}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-sm font-medium ${available <= 0 ? "text-red-600" : "text-gray-800"}`}>{available}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.low_stock_threshold}
                        onChange={(e) => setEditValues({ ...editValues, low_stock_threshold: Number(e.target.value) })}
                        className="input-admin w-20 text-right text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">{item.low_stock_threshold}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-gray-400">{formatDate(item.updated_at)}</td>
                  <td className="px-5 py-3.5 text-right">
                    {isEditing ? (
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => saveEdit(item)} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                          <Check size={13} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(item)} className="p-1.5 text-gray-400 hover:text-royal-gold-600 hover:bg-royal-gold-50 rounded-lg transition-colors">
                        <Edit2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No inventory items match your filters</div>
        )}
      </div>
    </div>
  );
}
