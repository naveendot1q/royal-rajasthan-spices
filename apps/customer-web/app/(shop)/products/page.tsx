import { createSupabaseServer } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductSortBar } from "@/components/product/product-sort-bar";
import { ProductsGrid } from "@/components/product/products-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Spices",
  description: "Browse our complete collection of authentic Rajasthani spices, masalas, and blends.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string; sort?: string; category?: string;
    min_price?: string; max_price?: string; rating?: string;
    tag?: string; origin?: string; filter?: string;
  }>;
}

type RawProduct = {
  id: string; name: string; slug: string; base_price: number; compare_price: number | null;
  avg_rating: number; review_count: number; sales_count: number; is_featured: boolean;
  images: { url: string; is_primary: boolean }[];
  category: { name: string } | null;
  variants: { id: string; is_active: boolean }[];
};

async function getProducts(params: Awaited<ProductsPageProps["searchParams"]>) {
  const supabase = await createSupabaseServer();
  const page = Number(params.page || 1);
  const pageSize = 24;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("products")
    .select(`
      id, name, slug, base_price, compare_price, avg_rating, review_count,
      sales_count, is_featured, tags, origin,
      images:product_images(url, is_primary),
      category:product_categories(id, name, slug),
      variants:product_variants(id, is_active)
    `, { count: "exact" })
    .eq("status", "active")
    .is("deleted_at", null);

  if (params.category) query = query.eq("product_categories.slug", params.category);
  if (params.tag) query = query.contains("tags", [params.tag]);
  if (params.origin) query = query.ilike("origin", `%${params.origin}%`);
  if (params.min_price) query = query.gte("base_price", Number(params.min_price));
  if (params.max_price) query = query.lte("base_price", Number(params.max_price));
  if (params.rating) query = query.gte("avg_rating", Number(params.rating));
  if (params.filter === "featured") query = query.eq("is_featured", true);

  const sort = params.sort || "sales_count:desc";
  const [sortField, sortDir] = sort.split(":");
  query = query.order(sortField || "sales_count", { ascending: sortDir === "asc" });

  const { data: rawData, count } = await query.range(from, from + pageSize - 1);
  const data = (rawData ?? []) as unknown as RawProduct[];

  return {
    products: data.map((p) => ({
      id: p.id, name: p.name, slug: p.slug,
      base_price: p.base_price, compare_price: p.compare_price,
      avg_rating: p.avg_rating, review_count: p.review_count,
      sales_count: p.sales_count, is_featured: p.is_featured,
      primary_image: p.images?.find((i) => i.is_primary)?.url || null,
      category_name: p.category?.name,
      has_stock: p.variants?.some((v) => v.is_active),
      default_variant_id: p.variants?.find((v) => v.is_active)?.id,
    })),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

async function getCategories() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("product_categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("name");
  return data || [];
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [{ products, total, page, totalPages }, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-palace-ivory">
      <div className="bg-gradient-to-r from-maroon-800 to-maroon-700 text-white py-12 pattern-overlay">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold mb-2">All Spices</h1>
          <p className="text-gray-300">{total.toLocaleString("en-IN")} authentic spices & blends</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilters categories={categories} currentParams={params} />
          </aside>

          <div className="flex-1 min-w-0">
            <ProductSortBar total={total} currentSort={params.sort} currentParams={params} />

            {products.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🌶</div>
                <h2 className="font-display text-2xl text-maroon-600 mb-2">No spices found</h2>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              <ProductsGrid products={products} />
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`/products?${new URLSearchParams({ ...params, page: String(p) })}`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                      ${p === page ? "bg-maroon-600 text-white" : "bg-white border border-royal-gold-200 text-gray-700 hover:bg-royal-gold-50"}`}
                  >
                    {p}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
