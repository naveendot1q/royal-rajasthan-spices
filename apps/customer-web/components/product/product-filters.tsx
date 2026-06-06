"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

interface Category { id: string; name: string; slug: string; }

interface ProductFiltersProps {
  categories: Category[];
  currentParams: Record<string, string | undefined>;
}

export function ProductFilters({ categories, currentParams }: ProductFiltersProps) {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<string[]>(["category", "price", "rating"]);

  const toggle = (section: string) =>
    setOpenSections((prev) => prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([k, v]) => { if (v && k !== key && k !== "page") params.set(k, v); });
    if (value) params.set(key, value);
    router.push(`/products?${params.toString()}`);
  };

  const FilterSection = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border-b border-royal-gold-100 pb-4 mb-4">
      <button onClick={() => toggle(id)} className="flex items-center justify-between w-full text-left mb-3">
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        {openSections.includes(id) ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {openSections.includes(id) && children}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-royal-gold-100 p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal size={16} className="text-royal-gold-600" />
        <h2 className="font-semibold text-gray-800">Filters</h2>
        {Object.values(currentParams).some(Boolean) && (
          <button onClick={() => router.push("/products")} className="ml-auto text-xs text-royal-gold-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      <FilterSection id="category" title="Category">
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="category" checked={!currentParams.category} onChange={() => updateFilter("category", null)} className="text-royal-gold-500" />
            <span className="text-sm text-gray-700">All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="category" checked={currentParams.category === cat.slug} onChange={() => updateFilter("category", cat.slug)} className="text-royal-gold-500" />
              <span className="text-sm text-gray-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection id="price" title="Price Range">
        <div className="space-y-2">
          {[
            { label: "Under ₹100", min: "0", max: "100" },
            { label: "₹100 – ₹250", min: "100", max: "250" },
            { label: "₹250 – ₹500", min: "250", max: "500" },
            { label: "Above ₹500", min: "500", max: "" },
          ].map((range) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={currentParams.min_price === range.min && (currentParams.max_price || "") === range.max}
                onChange={() => {
                  updateFilter("min_price", range.min);
                  if (range.max) updateFilter("max_price", range.max);
                }}
                className="text-royal-gold-500"
              />
              <span className="text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection id="rating" title="Minimum Rating">
        <div className="space-y-2">
          {[4, 3, 2].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="rating" checked={currentParams.rating === String(r)} onChange={() => updateFilter("rating", String(r))} className="text-royal-gold-500" />
              <span className="text-sm text-gray-700">{"★".repeat(r)} & above</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
