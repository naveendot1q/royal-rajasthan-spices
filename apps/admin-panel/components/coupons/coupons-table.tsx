"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatCurrency, formatDate } from "@rrs/shared";
import { Plus, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";

type Coupon = {
  id: string; code: string; type: string; value: number;
  min_order: number; max_discount: number | null; max_uses: number | null;
  used_count: number; user_limit: number; is_active: boolean;
  starts_at: string | null; expires_at: string | null; created_at: string;
};

const couponSchema = z.object({
  code: z.string().min(3).max(20),
  type: z.enum(["percentage", "fixed", "free_shipping"]),
  value: z.number().positive(),
  min_order: z.number().min(0).default(0),
  max_discount: z.number().positive().optional(),
  max_uses: z.number().int().positive().optional(),
  user_limit: z.number().int().positive().default(1),
  expires_at: z.string().optional(),
});

export function CouponsTable({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    defaultValues: { type: "percentage", value: 10, min_order: 0, user_limit: 1 },
  });

  const onCreate = async (data: z.infer<typeof couponSchema>) => {
    setSaving(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("coupons").insert({
      ...data,
      code: data.code.toUpperCase(),
      expires_at: data.expires_at || null,
      max_discount: data.max_discount || null,
      max_uses: data.max_uses || null,
    });
    setSaving(false);
    if (error) { toast.error("Failed to create coupon"); return; }
    toast.success("Coupon created!");
    reset();
    setShowForm(false);
    router.refresh();
  };

  const toggleActive = async (coupon: Coupon) => {
    const supabase = createSupabaseClient();
    await supabase.from("coupons").update({ is_active: !coupon.is_active }).eq("id", coupon.id);
    router.refresh();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const supabase = createSupabaseClient();
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Coupon deleted");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Create form */}
      {showForm && (
        <div className="card-admin p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Create Coupon</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit(onCreate)} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Coupon Code *</label>
              <input {...register("code")} className="input-admin font-mono uppercase" placeholder="ROYAL20" />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Type *</label>
              <select {...register("type")} className="input-admin">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Value *</label>
              <input {...register("value", { valueAsNumber: true })} type="number" step="0.01" className="input-admin" placeholder="20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Min Order (₹)</label>
              <input {...register("min_order", { valueAsNumber: true })} type="number" className="input-admin" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Max Discount (₹)</label>
              <input {...register("max_discount", { valueAsNumber: true })} type="number" className="input-admin" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Max Total Uses</label>
              <input {...register("max_uses", { valueAsNumber: true })} type="number" className="input-admin" placeholder="Unlimited" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Uses per User</label>
              <input {...register("user_limit", { valueAsNumber: true })} type="number" className="input-admin" defaultValue={1} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Expires At</label>
              <input {...register("expires_at")} type="datetime-local" className="input-admin" />
            </div>
            <div className="col-span-full flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Creating…" : "Create Coupon"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={15} /> Create New Coupon
        </button>
      )}

      {/* Table */}
      <div className="card-admin overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500">
                <th className="text-left px-5 py-3 font-medium">Code</th>
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-right px-5 py-3 font-medium">Value</th>
                <th className="text-right px-5 py-3 font-medium">Min Order</th>
                <th className="text-center px-5 py-3 font-medium">Usage</th>
                <th className="text-left px-5 py-3 font-medium">Expires</th>
                <th className="text-center px-5 py-3 font-medium">Active</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className={`hover:bg-gray-50 transition-colors ${!coupon.is_active ? "opacity-50" : ""}`}>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-sm text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{coupon.code}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 capitalize">{coupon.type.replace("_", " ")}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-gray-900 text-sm">
                    {coupon.type === "percentage" ? `${coupon.value}%` :
                     coupon.type === "fixed" ? formatCurrency(coupon.value) : "Free Shipping"}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm text-gray-600">
                    {coupon.min_order > 0 ? formatCurrency(coupon.min_order) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-center text-sm">
                    <span className="text-gray-800 font-medium">{coupon.used_count}</span>
                    <span className="text-gray-400">/{coupon.max_uses || "∞"}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {coupon.expires_at ? formatDate(coupon.expires_at) : "Never"}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => toggleActive(coupon)} className="text-gray-400 hover:text-royal-gold-600 transition-colors">
                      {coupon.is_active ? <ToggleRight size={22} className="text-emerald-500" /> : <ToggleLeft size={22} />}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => deleteCoupon(coupon.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No coupons yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
