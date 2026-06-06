import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}

export function StarRating({ rating, count, size = 16, showCount = true }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} size={size} className="fill-royal-gold-400 text-royal-gold-400" />;
          } else if (i === fullStars && hasHalf) {
            return <StarHalf key={i} size={size} className="fill-royal-gold-400 text-royal-gold-400" />;
          } else {
            return <Star key={i} size={size} className="fill-gray-200 text-gray-200" />;
          }
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-sm text-gray-500">
          {rating.toFixed(1)} ({count.toLocaleString("en-IN")} reviews)
        </span>
      )}
    </div>
  );
}
