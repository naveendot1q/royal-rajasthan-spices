import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product/product-card";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServer();
  const { data: cat } = await supabase
    .from("product_categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!cat) return { title: "Category Not Found" };
  return {
    title: cat.name,
    description: cat.description || `Shop ${cat.name} at Royal Rajasthan Spice Market`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageStr = "1", sort = "sales_count:desc" } = await searchParams;
  const supabase = await createSupabaseServer();
  const page = Number(pageStr);
  const pageSize = 24;

  const { data: category } = await supabase
    .from("product_categories")
    .select("id, name, description, image_url")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const [sortField, sortDir] = sort.split(":");
  const { data: products, count } = await supabase
    .from("products")
    .select(`
      id, name, slug, base_price, compare_price, avg_rating, review_count,
      sales_count, is_featured,
      images:product_images(url, is_primary),
      variants:product_variants(id, is_active)
    `, { count: "exact" })
    .eq("category_id", category.id)
    .eq("status", "active")
    .is("deleted_at", null)
    .order(sortField || "sales_count", { ascending: sortDir === "asc" })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const normalised = (products || []).map((p) => ({
    id: p.id, name: p.name, slug: p.slug,
    base_price: p.base_price, compare_price: p.compare_price,
    avg_rating: p.avg_rating, review_count: p.review_count,
    sales_count: p.sales_count, is_featured: p.is_featured,
    primary_image: (p.images as { url: string; is_primary: boolean }[])?.find((i) => i.is_primary)?.url || null,
    category_name: category.name,
    has_stock: (p.variants as { is_active: boolean }[])?.some((v) => v.is_active),
    default_variant_id: (p.variants as { id: string; is_active: boolean }[])?.find((v) => v.is_active)?.id,
  }));

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="min-h-screen bg-palace-ivory">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-maroon-800 to-maroon-700 text-white py-16 overflow-hidden pattern-overlay">
        {category.image_url && (
          <div className="absolute inset-0 opacity-20">
            <img src={category.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4 flex gap-2">
            <a href="/" className="hover:text-royal-gold-400">Home</a>
            <span>/</span>
            <a href="/products" className="hover:text-royal-gold-400">Shop</a>
            <span>/</span>
            <span className="text-white">{category.name}</span>
          </nav>
          <h1 className="font-display text-4xl font-bold">{category.name}</h1>
          {category.description && <p className="text-gray-300 mt-2 max-w-xl">{category.description}</p>}
          <p className="text-royal-gold-400 text-sm mt-2">{count?.toLocaleString("en-IN")} products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <p className="text-sm text-gray-500">{count?.toLocaleString("en-IN")} products</p>
          <select
            defaultValue={sort}
            className="text-sm border border-royal-gold-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set("sort", e.target.value);
              window.location.href = url.toString();
            }}
          >
            {[
              ["sales_count:desc", "Best Selling"],
              ["created_at:desc", "Newest"],
              ["base_price:asc", "Price: Low to High"],
              ["base_price:desc", "Price: High to Low"],
              ["avg_rating:desc", "Top Rated"],
            ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {normalised.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No products in this category yet</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {normalised.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
              <a key={p} href={`/categories/${slug}?page=${p}&sort=${sort}`}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                  ${p === page ? "bg-maroon-600 text-white" : "bg-white border border-royal-gold-200 text-gray-700 hover:bg-royal-gold-50"}`}>
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
