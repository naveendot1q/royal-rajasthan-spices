import { searchProducts } from "@rrs/search";
import { ProductCard } from "@/components/product/product-card";
import type { Metadata } from "next";
import { Search } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
    category?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Search: "${q}"` : "Search" };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page: pageStr = "1", sort, category } = await searchParams;
  const page = Number(pageStr);

  let results: Awaited<ReturnType<typeof searchProducts>> | null = null;
  let error = false;

  if (q.length >= 2) {
    try {
      const filters: string[] = [];
      if (category) filters.push(`category_name = "${category}"`);

      results = await searchProducts(q, {
        page,
        hitsPerPage: 24,
        filter: filters.length > 0 ? filters : undefined,
        sort: sort ? [sort] : undefined,
        facets: ["category_name", "tags", "origin"],
      });
    } catch {
      error = true;
    }
  }

  return (
    <div className="min-h-screen bg-palace-ivory">
      {/* Header */}
      <div className="bg-white border-b border-royal-gold-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {q ? (
            <div>
              <h1 className="font-display text-2xl font-semibold text-maroon-700">
                Results for "<span className="text-royal-gold-600">{q}</span>"
              </h1>
              {results && (
                <p className="text-gray-500 text-sm mt-1">
                  {results.totalHits} product{results.totalHits !== 1 ? "s" : ""} found
                </p>
              )}
            </div>
          ) : (
            <h1 className="font-display text-2xl font-semibold text-maroon-700">Search</h1>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!q && (
          <div className="text-center py-24">
            <Search size={48} className="mx-auto text-royal-gold-300 mb-4" />
            <p className="text-gray-500">Start typing to search for spices, masalas, and more…</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-gray-500">
            Search is temporarily unavailable. Please try again.
          </div>
        )}

        {results && results.hits.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="font-display text-xl text-maroon-600 mb-2">No results found</h2>
            <p className="text-gray-500">Try different keywords or browse our categories</p>
          </div>
        )}

        {results && results.hits.length > 0 && (
          <>
            {/* Facets */}
            {results.facetDistribution && Object.keys(results.facetDistribution).length > 0 && (
              <div className="flex gap-3 flex-wrap mb-6">
                {Object.entries(results.facetDistribution).map(([facet, values]) =>
                  Object.entries(values as Record<string, number>).slice(0, 4).map(([val, count]) => (
                    <a
                      key={`${facet}-${val}`}
                      href={`/search?q=${encodeURIComponent(q)}&${facet === "category_name" ? "category" : facet}=${encodeURIComponent(val)}`}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        (facet === "category_name" && category === val)
                          ? "bg-maroon-600 text-white border-maroon-600"
                          : "bg-white border-royal-gold-200 text-gray-600 hover:border-royal-gold-400"
                      }`}
                    >
                      {val} <span className="text-xs opacity-60">({count})</span>
                    </a>
                  ))
                )}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(results.hits as { id: string; name: string; slug: string; base_price: number; compare_price?: number; avg_rating: number; review_count: number; sales_count: number; is_featured: boolean; primary_image?: string; category_name?: string; _formatted?: { name: string } }[]).map((hit) => (
                <ProductCard
                  key={hit.id}
                  product={{
                    id: hit.id,
                    name: hit._formatted?.name || hit.name,
                    slug: hit.slug,
                    base_price: hit.base_price,
                    compare_price: hit.compare_price || null,
                    avg_rating: hit.avg_rating,
                    review_count: hit.review_count,
                    sales_count: hit.sales_count,
                    is_featured: hit.is_featured,
                    primary_image: hit.primary_image || null,
                    category_name: hit.category_name,
                    has_stock: true,
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {results.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: Math.min(results.totalPages, 10) }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`/search?q=${encodeURIComponent(q)}&page=${p}`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                      ${p === page ? "bg-maroon-600 text-white" : "bg-white border border-royal-gold-200 text-gray-700 hover:bg-royal-gold-50"}`}
                  >
                    {p}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
