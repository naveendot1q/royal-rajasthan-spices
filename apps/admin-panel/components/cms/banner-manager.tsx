"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, ToggleLeft, ToggleRight, GripVertical, X } from "lucide-react";

type Banner = {
  id: string; title: string; subtitle: string | null; image_url: string;
  link: string | null; cta_text: string | null; position: string;
  sort_order: number; is_active: boolean; starts_at: string | null; ends_at: string | null;
};

export function BannerManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", subtitle: "", image_url: "", link: "", cta_text: "",
    position: "hero", is_active: true, starts_at: "", ends_at: "",
  });

  const handleCreate = async () => {
    if (!form.title || !form.image_url) { toast.error("Title and image URL are required"); return; }
    setSaving(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("banners").insert({
      ...form,
      subtitle: form.subtitle || null,
      link: form.link || null,
      cta_text: form.cta_text || null,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      sort_order: banners.length,
    });
    setSaving(false);
    if (error) { toast.error("Failed to create banner"); return; }
    toast.success("Banner created!");
    setShowForm(false);
    setForm({ title: "", subtitle: "", image_url: "", link: "", cta_text: "", position: "hero", is_active: true, starts_at: "", ends_at: "" });
    router.refresh();
  };

  const toggleBanner = async (id: string, isActive: boolean) => {
    const supabase = createSupabaseClient();
    await supabase.from("banners").update({ is_active: !isActive }).eq("id", id);
    router.refresh();
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    const supabase = createSupabaseClient();
    await supabase.from("banners").delete().eq("id", id);
    toast.success("Banner deleted");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Add Banner
        </button>
      )}

      {showForm && (
        <div className="card-admin p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">New Banner</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-admin" placeholder="Welcome to Royal Rajasthan" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Image URL *</label>
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-admin" placeholder="https://…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Subtitle</label>
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-admin" placeholder="Authentic Rajasthani Spices" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Link URL</label>
              <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input-admin" placeholder="/products" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">CTA Button Text</label>
              <input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className="input-admin" placeholder="Shop Now" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Position</label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input-admin">
                <option value="hero">Hero (Homepage top)</option>
                <option value="mid_page">Mid Page</option>
                <option value="sidebar">Sidebar</option>
                <option value="popup">Popup</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
              <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="input-admin" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
              <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className="input-admin" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="banner_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300 text-royal-gold-600 w-4 h-4" />
              <label htmlFor="banner_active" className="text-sm text-gray-700">Active immediately</label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Creating…" : "Create Banner"}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Banner list */}
      <div className="card-admin overflow-hidden">
        {banners.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No banners yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map((banner) => (
              <div key={banner.id} className={`flex items-center gap-4 p-4 ${!banner.is_active ? "opacity-50" : ""}`}>
                <GripVertical size={16} className="text-gray-300 flex-shrink-0 cursor-grab" />
                <div className="w-20 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{banner.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 capitalize">{banner.position.replace("_", " ")}</span>
                    {banner.link && <span className="text-xs text-royal-gold-600 truncate max-w-[150px]">{banner.link}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleBanner(banner.id, banner.is_active)} className="text-gray-400 hover:text-royal-gold-600 transition-colors">
                    {banner.is_active ? <ToggleRight size={22} className="text-emerald-500" /> : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => deleteBanner(banner.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
