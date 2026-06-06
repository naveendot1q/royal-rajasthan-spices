"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, X } from "lucide-react";
import { formatDate } from "@rrs/shared";

type CMSPage = {
  id: string; slug: string; title: string; is_active: boolean;
  created_at: string; updated_at: string;
};

const DEFAULT_PAGES = [
  { slug: "about", title: "About Us" },
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms of Service" },
  { slug: "faq", title: "Frequently Asked Questions" },
  { slug: "refunds", title: "Refund Policy" },
  { slug: "shipping-policy", title: "Shipping Policy" },
];

export function CMSPagesManager({ pages }: { pages: CMSPage[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [form, setForm] = useState({ slug: "", title: "", body: "", is_active: true });
  const [saving, setSaving] = useState(false);

  const openCreate = (template?: { slug: string; title: string }) => {
    setForm({ slug: template?.slug || "", title: template?.title || "", body: "", is_active: true });
    setEditingPage(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.slug || !form.title) { toast.error("Slug and title are required"); return; }
    setSaving(true);
    const supabase = createSupabaseClient();

    if (editingPage) {
      const { error } = await supabase.from("cms_pages").update({
        title: form.title,
        body: form.body,
        is_active: form.is_active,
      }).eq("id", editingPage.id);
      if (error) toast.error("Failed to update page");
      else toast.success("Page updated!");
    } else {
      const { error } = await supabase.from("cms_pages").insert({
        slug: form.slug,
        title: form.title,
        body: form.body,
        is_active: form.is_active,
      });
      if (error) toast.error(error.code === "23505" ? "A page with this slug already exists" : "Failed to create page");
      else toast.success("Page created!");
    }

    setSaving(false);
    setShowForm(false);
    router.refresh();
  };

  const toggleActive = async (page: CMSPage) => {
    const supabase = createSupabaseClient();
    await supabase.from("cms_pages").update({ is_active: !page.is_active }).eq("id", page.id);
    router.refresh();
  };

  const existingSlugs = new Set(pages.map((p) => p.slug));
  const missingTemplates = DEFAULT_PAGES.filter((d) => !existingSlugs.has(d.slug));

  return (
    <div className="space-y-5">
      {/* Quick create from templates */}
      {missingTemplates.length > 0 && (
        <div className="card-admin p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">QUICK CREATE STANDARD PAGES</p>
          <div className="flex gap-2 flex-wrap">
            {missingTemplates.map((tmpl) => (
              <button key={tmpl.slug} onClick={() => openCreate(tmpl)}
                className="px-3 py-1.5 border border-dashed border-royal-gold-300 text-royal-gold-600 text-xs rounded-lg hover:bg-royal-gold-50 transition-colors">
                + {tmpl.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <div className="card-admin p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">{editingPage ? "Edit Page" : "New Page"}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">URL Slug *</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  disabled={!!editingPage}
                  className="input-admin font-mono disabled:opacity-50"
                  placeholder="about-us"
                />
                <p className="text-xs text-gray-400 mt-1">Will be accessible at /{form.slug}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Page Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-admin" placeholder="About Us" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Content (HTML/Markdown)</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={12}
                className="input-admin font-mono text-xs resize-y"
                placeholder="<h2>About Royal Rajasthan</h2>&#10;<p>We are...</p>"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="cms_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300 text-royal-gold-600 w-4 h-4" />
              <label htmlFor="cms_active" className="text-sm text-gray-700">Page is live (visible to visitors)</label>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? "Saving…" : editingPage ? "Update Page" : "Create Page"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Pages table */}
      <div className="card-admin overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Pages ({pages.length})</h2>
          <button onClick={() => openCreate()} className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5">
            <Plus size={13} /> New Page
          </button>
        </div>
        {pages.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No CMS pages yet. Create your first page above.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500">
                <th className="text-left px-5 py-3 font-medium">Title</th>
                <th className="text-left px-5 py-3 font-medium">Slug</th>
                <th className="text-center px-5 py-3 font-medium">Active</th>
                <th className="text-right px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pages.map((page) => (
                <tr key={page.id} className={`hover:bg-gray-50 transition-colors ${!page.is_active ? "opacity-50" : ""}`}>
                  <td className="px-5 py-3.5 font-medium text-gray-800 text-sm">{page.title}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">/{page.slug}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => toggleActive(page)}>
                      {page.is_active
                        ? <ToggleRight size={22} className="text-emerald-500 mx-auto" />
                        : <ToggleLeft size={22} className="text-gray-400 mx-auto" />}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-gray-400">{formatDate(page.updated_at)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <a href={`${process.env.NEXT_PUBLIC_CUSTOMER_URL || "http://localhost:3000"}/${page.slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-gray-400 hover:text-royal-gold-600 p-1 transition-colors"><Eye size={14} /></a>
                      <button onClick={() => { setEditingPage(page); setForm({ slug: page.slug, title: page.title, body: "", is_active: page.is_active }); setShowForm(true); }}
                        className="text-gray-400 hover:text-royal-gold-600 p-1 transition-colors"><Edit2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
