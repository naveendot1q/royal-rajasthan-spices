"use client";
import { useState } from "react";
import { ORDER_STATUS_LABELS } from "@rrs/types";
import { createAdminSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Loader2 } from "lucide-react";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending:          ["confirmed", "cancelled"],
  confirmed:        ["packed", "cancelled"],
  packed:           ["shipped"],
  shipped:          ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered:        [],
  cancelled:        ["refunded"],
  returned:         ["refunded"],
  refunded:         [],
};

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [newStatus, setNewStatus] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];

  const handleUpdate = async () => {
    if (!newStatus) return;
    setLoading(true);

    try {
      const supabase = createAdminSupabaseClient();

      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Add tracking update
      await supabase.from("tracking_updates").insert({
        order_id: orderId,
        status: newStatus,
        location: location || null,
        description: description || `Order status updated to ${ORDER_STATUS_LABELS[newStatus as keyof typeof ORDER_STATUS_LABELS]}`,
      });

      toast.success(`Order updated to "${ORDER_STATUS_LABELS[newStatus as keyof typeof ORDER_STATUS_LABELS]}"`);
      router.refresh();
      setNewStatus("");
      setLocation("");
      setDescription("");
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  if (allowedNext.length === 0) {
    return (
      <div className="card-admin p-5 bg-gray-50 border-dashed">
        <p className="text-sm text-gray-500 text-center">This order is in a terminal state: <strong>{ORDER_STATUS_LABELS[currentStatus as keyof typeof ORDER_STATUS_LABELS]}</strong></p>
      </div>
    );
  }

  return (
    <div className="card-admin p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Update Order Status</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">New Status</label>
          <div className="relative">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="input-admin appearance-none pr-8"
            >
              <option value="">Select status…</option>
              {allowedNext.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABELS[s as keyof typeof ORDER_STATUS_LABELS]}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Location (optional)</label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mumbai Hub"
              className="input-admin pl-8"
            />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Update Message (optional)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a note for this status update…"
          className="input-admin"
        />
      </div>
      <button
        onClick={handleUpdate}
        disabled={!newStatus || loading}
        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        Update Status
      </button>
    </div>
  );
}
