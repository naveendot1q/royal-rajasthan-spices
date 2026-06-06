"use client";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Star, CheckCircle, XCircle, Award } from "lucide-react";
import { formatRelativeTime } from "@rrs/shared";
import Image from "next/image";

interface Review {
  id: string; rating: number; title: string | null; body: string | null;
  images: string[]; status: string; is_verified_purchase: boolean;
  is_featured: boolean; helpful_count: number; created_at: string;
  author: { full_name: string | null; avatar_url: string | null } | null;
  product: { id: string; name: string; slug: string } | null;
}

export function ReviewModerationTable({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);

  const updateReview = async (id: string, updates: Record<string, unknown>) => {
    setProcessing(id);
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("reviews").update(updates).eq("id", id);
    setProcessing(null);
    if (error) { toast.error("Failed to update review"); return; }
    toast.success("Review updated");
    router.refresh();
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="card-admin p-12 text-center text-gray-400">
        <Star size={40} className="mx-auto mb-3 opacity-30" />
        <p>No reviews in this status</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="card-admin p-5">
          <div className="flex items-start gap-4">
            {/* Author */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-gold-400 to-maroon-600 flex items-center justify-center text-white font-bold text-sm">
                {review.author?.full_name?.[0]?.toUpperCase() || "A"}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800 text-sm">{review.author?.full_name || "Anonymous"}</span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle size={11} /> Verified
                      </span>
                    )}
                    {review.is_featured && (
                      <span className="flex items-center gap-1 text-xs text-royal-gold-600 font-medium">
                        <Award size={11} /> Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "fill-royal-gold-400 text-royal-gold-400" : "fill-gray-200 text-gray-200"} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{formatRelativeTime(review.created_at)}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <a href={`/products/${review.product?.id}/edit`} className="text-xs text-royal-gold-600 hover:underline truncate max-w-[200px]">
                      {review.product?.name}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => updateReview(review.id, { status: "approved" })}
                      disabled={processing === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={12} /> Approve
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      onClick={() => updateReview(review.id, { status: "rejected" })}
                      disabled={processing === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  )}
                  {review.status === "approved" && (
                    <button
                      onClick={() => updateReview(review.id, { is_featured: !review.is_featured })}
                      disabled={processing === review.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                        review.is_featured ? "bg-royal-gold-100 text-royal-gold-700 hover:bg-royal-gold-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Award size={12} /> {review.is_featured ? "Unfeature" : "Feature"}
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              {review.title && <h4 className="font-semibold text-gray-800 text-sm mt-3">{review.title}</h4>}
              {review.body && <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.body}</p>}

              {/* Images */}
              {review.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((img, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
