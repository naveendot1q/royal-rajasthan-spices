"use client";
import { useRouter } from "next/navigation";

interface ProductSortBarProps {
  total: number;
  currentSort?: string;
  currentParams: Record<string, string | undefined>;
}

const SORT_OPTIONS = [
  { label: "Best Selling", value: "sales_count:desc" },
  { label: "Newest First", value: "created_at:desc" },
  { label: "Price: Low to High", value: "base_price:asc" },
  { label: "Price: High to Low", value: "base_price:desc" },
  { label: "Top Rated", value: "avg_rating:desc" },
];

export function ProductSortBar({ total, currentSort, currentParams }: ProductSortBarProps) {
  const router = useRouter();

  const handleSort = (sort: string) => {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([k, v]) => { if (v && k !== "sort" && k !== "page") params.set(k, v); });
    params.set("sort", sort);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <p className="text-sm text-gray-500">{total.toLocaleString("en-IN")} products</p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Sort by:</span>
        <select
          value={currentSort || "sales_count:desc"}
          onChange={(e) => handleSort(e.target.value)}
          className="text-sm border border-royal-gold-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-royal-gold-400"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
