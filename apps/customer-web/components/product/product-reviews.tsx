"use client";
import { useState } from "react";
import { StarRating } from "./star-rating";
import { Star, ThumbsUp, CheckCircle, Image as ImageIcon } from "lucide-react";
import { formatRelativeTime } from "@rrs/shared";
import { submitReview } from "@/lib/actions/reviews";
import { toast } from "sonner";
import Image from "next/image";

interface Review {
  id: string; rating: number; title: string | null; body: string | null;
  images: string[]; is_verified_purchase: boolean; is_featured: boolean;
  helpful_count: number; created_at: string;
  author: { full_name: string | null; avatar_url: string | null } | null;
}

interface ProductReviewsProps {
  reviews: Review[];
  productId: string;
  avgRating: number;
  reviewCount: number;
}

export function ProductReviews({ reviews, productId, avgRating, reviewCount }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rev) => rev.rating === r).length,
    pct: reviewCount > 0 ? (reviews.filter((rev) => rev.rating === r).length / reviewCount) * 100 : 0,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("rating", String(rating));
    const result = await submitReview(productId, null, fd);
    setSubmitting(false);
    if (result.error) toast.error(result.error);
    else { toast.success("Review submitted! It will appear after moderation."); setShowForm(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-royal-gold-100 p-8">
      <h2 className="font-display text-2xl font-semibold text-maroon-700 mb-8">Customer Reviews</h2>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-royal-gold-100">
        <div className="flex flex-col items-center justify-center">
          <div className="font-display text-6xl font-bold text-maroon-600">{avgRating.toFixed(1)}</div>
          <StarRating rating={avgRating} size={20} showCount={false} />
          <div className="text-sm text-gray-500 mt-1">{reviewCount.toLocaleString("en-IN")} reviews</div>
        </div>
        <div className="md:col-span-2 space-y-2">
          {ratingDist.map((d) => (
            <div key={d.stars} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-8">{d.stars}★</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-royal-gold-400 rounded-full transition-all" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="text-xs text-gray-500 w-6">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write review button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-800">{reviews.length > 0 ? `${reviews.length} Reviews` : "No reviews yet"}</h3>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-maroon-600 text-white text-sm font-medium rounded-lg hover:bg-maroon-700 transition-colors">
          Write a Review
        </button>
      </div>

      {/* Review form */}
      {showForm && (
        <div className="mb-8 p-6 bg-desert-sand rounded-xl border border-royal-gold-200">
          <h4 className="font-semibold text-maroon-700 mb-4">Share Your Experience</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onMouseEnter={() => setHoveredRating(r)} onMouseLeave={() => setHoveredRating(0)} onClick={() => setRating(r)}>
                    <Star size={28} className={r <= (hoveredRating || rating) ? "fill-royal-gold-400 text-royal-gold-400" : "text-gray-300 fill-gray-300"} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input name="title" placeholder="Sum up your experience" className="input-royal" maxLength={100} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review *</label>
              <textarea name="body" required minLength={10} maxLength={2000} rows={4} placeholder="Tell others what you think…" className="input-royal resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-maroon text-sm px-6 py-2.5 disabled:opacity-50">
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className={`border-b border-gray-100 pb-6 last:border-0 ${review.is_featured ? "p-4 bg-royal-gold-50/50 rounded-xl border border-royal-gold-200" : ""}`}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-gold-400 to-maroon-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {review.author?.avatar_url ? (
                  <Image src={review.author.avatar_url} alt="" width={40} height={40} className="rounded-full" />
                ) : (
                  (review.author?.full_name?.[0] || "A").toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800 text-sm">{review.author?.full_name || "Anonymous"}</span>
                  {review.is_verified_purchase && (
                    <span className="flex items-center gap-1 text-xs text-emerald-spice-600 font-medium">
                      <CheckCircle size={12} /> Verified Purchase
                    </span>
                  )}
                  {review.is_featured && (
                    <span className="px-2 py-0.5 bg-royal-gold-100 text-royal-gold-700 text-xs rounded-full font-medium">⭐ Featured</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating rating={review.rating} showCount={false} size={13} />
                  <span className="text-xs text-gray-400">{formatRelativeTime(review.created_at)}</span>
                </div>
              </div>
            </div>
            {review.title && <h4 className="font-semibold text-gray-800 mb-1 text-sm">{review.title}</h4>}
            {review.body && <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.body}</p>}
            {review.images.length > 0 && (
              <div className="flex gap-2 mb-3">
                {review.images.map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={img} alt={`Review image ${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            )}
            <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-royal-gold-600 transition-colors">
              <ThumbsUp size={12} />
              Helpful ({review.helpful_count})
            </button>
          </div>
        ))}
        {reviews.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400">
            <Star size={40} className="mx-auto mb-3 opacity-30" />
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
}
