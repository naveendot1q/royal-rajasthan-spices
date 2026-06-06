import { redirect } from "next/navigation";
import { getUser, createSupabaseServer } from "@/lib/supabase/server";
import { formatRelativeTime } from "@rrs/shared";
import { Star } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Reviews" };

export default async function ReviewsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createSupabaseServer();
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id, rating, title, body, status, created_at,
      product:products(id, name, slug, images:product_images(url, is_primary))
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
    pending: { label: "Under Review", cls: "bg-amber-100 text-amber-700" },
    approved: { label: "Published", cls: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Not Published", cls: "bg-red-100 text-red-600" },
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-maroon-700 mb-6">My Reviews</h1>

      {(!reviews || reviews.length === 0) ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-royal-gold-100">
          <Star size={40} className="mx-auto text-royal-gold-200 mb-4" />
          <h2 className="font-display text-xl text-maroon-600 mb-2">No reviews yet</h2>
          <p className="text-gray-500 mb-6">Your reviews on purchased products will appear here</p>
          <Link href="/account/orders" className="btn-primary inline-flex">View Orders</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const product = review.product as { id: string; name: string; slug: string; images: { url: string; is_primary: boolean }[] } | null;
            const image = product?.images?.find((i) => i.is_primary)?.url || product?.images?.[0]?.url;
            const statusInfo = STATUS_LABELS[review.status] || STATUS_LABELS.pending;

            return (
              <div key={review.id} className="bg-white rounded-2xl border border-royal-gold-100 p-5">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-desert-sand overflow-hidden flex-shrink-0">
                    {image ? (
                      <img src={image} alt={product?.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🌶</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <Link href={`/products/${product?.slug}`} className="font-medium text-gray-800 hover:text-maroon-600 text-sm">
                          {product?.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={13} className={i < review.rating ? "fill-royal-gold-400 text-royal-gold-400" : "fill-gray-200 text-gray-200"} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{formatRelativeTime(review.created_at)}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    {review.title && <p className="font-semibold text-gray-800 text-sm mt-2">{review.title}</p>}
                    {review.body && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.body}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
