"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MapPin, Plus, Trash2, Star } from "lucide-react";
import { INDIAN_STATES } from "@rrs/shared";
import { AddressSelector } from "@/components/checkout/address-selector";

type Address = {
  id: string; label: string; full_name: string; phone: string;
  line1: string; line2: string | null; city: string; state: string;
  pincode: string; country: string; is_default: boolean;
};

interface AddressManagerProps {
  addresses: Address[];
  userId: string;
}

export function AddressManager({ addresses, userId }: AddressManagerProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(addresses[0]?.id || "");

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const supabase = createSupabaseClient();
    await supabase.from("addresses").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    toast.success("Address deleted");
    router.refresh();
  };

  const setDefault = async (id: string) => {
    const supabase = createSupabaseClient();
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    toast.success("Default address updated");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {addresses.map((addr) => (
        <div key={addr.id} className={`bg-white rounded-2xl border-2 p-5 transition-all ${
          addr.is_default ? "border-royal-gold-400" : "border-gray-100"
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-royal-gold-50 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-royal-gold-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-gray-800">{addr.full_name}</span>
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded capitalize">{addr.label}</span>
                  {addr.is_default && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-royal-gold-100 text-royal-gold-700 rounded font-medium">
                      <Star size={10} fill="currentColor" /> Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                <p className="text-sm text-gray-600">{addr.city}, {addr.state} — {addr.pincode}</p>
                <p className="text-xs text-gray-400 mt-0.5">📱 {addr.phone}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              {!addr.is_default && (
                <button onClick={() => setDefault(addr.id)} className="text-xs text-royal-gold-600 hover:underline font-medium whitespace-nowrap">
                  Set Default
                </button>
              )}
              <button onClick={() => handleDelete(addr.id)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Add new address inline */}
      <div className="bg-white rounded-2xl border border-royal-gold-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-royal-gold-600" /> Add New Address
        </h3>
        <AddressSelector
          addresses={[]}
          selected=""
          onSelect={() => {}}
          userId={userId}
        />
      </div>
    </div>
  );
}
