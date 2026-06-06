"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MapPin, Plus, Check } from "lucide-react";
import { INDIAN_STATES } from "@rrs/shared";

type Address = {
  id: string; label: string; full_name: string; phone: string;
  line1: string; line2: string | null; city: string; state: string;
  pincode: string; country: string; is_default: boolean;
};

interface AddressSelectorProps {
  addresses: Address[];
  selected: string;
  onSelect: (id: string) => void;
  userId: string;
}

export function AddressSelector({ addresses, selected, onSelect, userId }: AddressSelectorProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: "home", full_name: "", phone: "", line1: "", line2: "",
    city: "", state: "", pincode: "", country: "IN", is_default: addresses.length === 0,
  });

  const handleSave = async () => {
    if (!form.full_name || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("addresses")
      .insert({ ...form, user_id: userId })
      .select()
      .single();
    setSaving(false);
    if (error) { toast.error("Could not save address"); return; }
    toast.success("Address saved!");
    onSelect(data.id);
    setShowForm(false);
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {addresses.map((addr) => (
        <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          selected === addr.id ? "border-royal-gold-500 bg-royal-gold-50" : "border-gray-200 hover:border-royal-gold-200"
        }`}>
          <div className="flex items-center h-5 mt-0.5">
            <input
              type="radio"
              name="address"
              checked={selected === addr.id}
              onChange={() => onSelect(addr.id)}
              className="text-royal-gold-600 w-4 h-4"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{addr.full_name}</span>
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded capitalize">{addr.label}</span>
              {addr.is_default && <span className="px-2 py-0.5 text-xs bg-royal-gold-100 text-royal-gold-700 rounded">Default</span>}
            </div>
            <p className="text-sm text-gray-600 mt-0.5">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
            <p className="text-sm text-gray-600">{addr.city}, {addr.state} — {addr.pincode}</p>
            <p className="text-sm text-gray-500 mt-0.5">📱 {addr.phone}</p>
          </div>
          {selected === addr.id && (
            <div className="w-6 h-6 rounded-full bg-royal-gold-500 flex items-center justify-center flex-shrink-0">
              <Check size={14} className="text-white" />
            </div>
          )}
        </label>
      ))}

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-royal-gold-300 rounded-xl text-royal-gold-600 hover:bg-royal-gold-50 transition-colors w-full justify-center text-sm font-medium">
          <Plus size={16} /> Add New Address
        </button>
      )}

      {showForm && (
        <div className="border-2 border-royal-gold-200 rounded-xl p-5 bg-royal-gold-50/30">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-royal-gold-600" /> New Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-royal text-sm" placeholder="Priya Sharma" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
              <div className="flex">
                <span className="px-3 py-2.5 border border-r-0 border-royal-gold-200 bg-desert-sand text-gray-600 text-sm rounded-l-lg">+91</span>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="flex-1 px-3 py-2.5 border border-royal-gold-200 rounded-r-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-royal-gold-400" placeholder="9876543210" maxLength={10} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
              <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="input-royal text-sm">
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1 *</label>
              <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="input-royal text-sm" placeholder="House / Flat No., Building Name, Street" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label>
              <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="input-royal text-sm" placeholder="Area, Landmark (optional)" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-royal text-sm" placeholder="Jaipur" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pincode *</label>
              <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input-royal text-sm" placeholder="302001" maxLength={6} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">State *</label>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-royal text-sm">
                <option value="">Select state…</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="is_default" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="rounded border-gray-300 text-royal-gold-600 w-4 h-4" />
              <label htmlFor="is_default" className="text-sm text-gray-600">Set as default address</label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-5 py-2.5 disabled:opacity-50">
              {saving ? "Saving…" : "Save Address"}
            </button>
            {addresses.length > 0 && (
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm px-5 py-2.5">Cancel</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
