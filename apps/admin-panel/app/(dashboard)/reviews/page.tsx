import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { ReviewModerationTable } from "@/components/reviews/review-moderation-table";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reviews" };

interface ReviewsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const { status = "pending" } = await searchParams;
  const supabase = await createAdminSupabaseServer();

  const { data: reviews, count } = await supabase
    .from("reviews")
    .select(`
      id, rating, title, body, images, status, is_verified_purchase,
      is_featured, helpful_count, created_at,
      author:profiles(full_name, avatar_url),
      product:products(id, name, slug)
    `, { count: "exact" })
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: counts } = await supabase
    .from("reviews")
    .select("status")
    .then(({ data }) => ({
      data: {
        pending: data?.filter((r) => r.status === "pending").length || 0,
        approved: data?.filter((r) => r.status === "approved").length || 0,
        rejected: data?.filter((r) => r.status === "rejected").length || 0,
      }
    }));

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-gray-900">Review Moderation</h1>

      {/* Status tabs with counts */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "Pending", value: "pending", count: counts?.pending || 0, color: "amber" },
          { label: "Approved", value: "approved", count: counts?.approved || 0, color: "emerald" },
          { label: "Rejected", value: "rejected", count: counts?.rejected || 0, color: "red" },
        ].map((tab) => (
          <a
            key={tab.value}
            href={`/reviews?status=${tab.value}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === tab.value
                ? "bg-royal-gold-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
              status === tab.value ? "bg-white/20 text-white" : `bg-${tab.color}-100 text-${tab.color}-700`
            }`}>
              {tab.count}
            </span>
          </a>
        ))}
      </div>

      <ReviewModerationTable reviews={reviews as Parameters<typeof ReviewModerationTable>[0]["reviews"]} />
    </div>
  );
}
