import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { CMSPagesManager } from "@/components/cms/cms-pages-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "CMS Pages" };

export default async function CMSPagesPage() {
  const supabase = await createAdminSupabaseServer();
  const { data: pages } = await supabase
    .from("cms_pages")
    .select("id, slug, title, is_active, created_at, updated_at")
    .order("slug");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">CMS Pages</h1>
          <p className="text-sm text-gray-500">Manage static pages like About, Privacy, FAQ</p>
        </div>
      </div>
      <CMSPagesManager pages={pages || []} />
    </div>
  );
}
