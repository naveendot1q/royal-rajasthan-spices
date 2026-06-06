"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { ProductListItem } from "@rrs/types";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: ProductListItem[];
  viewAllHref?: string;
}

export function ProductCarousel({ title, subtitle, products, viewAllHref }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-semibold text-maroon-500">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => scroll("left")} className="w-9 h-9 rounded-full border-2 border-royal-gold-300 hover:bg-royal-gold-50 flex items-center justify-center text-royal-gold-600 transition-colors" aria-label="Previous">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll("right")} className="w-9 h-9 rounded-full border-2 border-royal-gold-300 hover:bg-royal-gold-50 flex items-center justify-center text-royal-gold-600 transition-colors" aria-label="Next">
            <ChevronRight size={18} />
          </button>
          {viewAllHref && (
            <a href={viewAllHref} className="text-sm text-royal-gold-600 font-medium hover:text-royal-gold-800 underline underline-offset-4">
              View all
            </a>
          )}
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((p) => (
          <div key={p.id} className="flex-none w-56 sm:w-64 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
