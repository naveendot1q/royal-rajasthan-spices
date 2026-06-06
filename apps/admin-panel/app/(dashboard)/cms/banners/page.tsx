import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { BannerManager } from "@/components/cms/banner-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Banners" };

export default async function BannersPage() {
  const supabase = await createAdminSupabaseServer();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500">Manage homepage and promotional banners</p>
        </div>
      </div>
      <BannerManager banners={banners || []} />
    </div>
  );
}
