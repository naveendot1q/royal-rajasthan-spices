import { HeroSection } from "@/components/home/hero-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductCarousel } from "@/components/home/product-carousel";
import { Testimonials } from "@/components/home/testimonials";
import { createSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Flame, TrendingUp, Star, Tag } from "lucide-react";

export const revalidate = 3600; // ISR: revalidate hourly

async function getHomeData() {
  const supabase = await createSupabaseServer();

  const [categoriesResult, featuredResult, bestSellersResult, newArrivalsResult] =
    await Promise.all([
      supabase
        .from("product_categories")
        .select("id, name, slug, image_url, sort_order")
        .eq("is_active", true)
        .is("parent_id", null)
        .is("deleted_at", null)
        .order("sort_order")
        .limit(6),

      supabase
        .from("products")
        .select(`
          id, name, slug, base_price, compare_price,
          avg_rating, review_count, sales_count, is_featured,
          images:product_images(url, is_primary),
          category:product_categories(name),
          variants:product_variants(id)
        `)
        .eq("status", "active")
        .eq("is_featured", true)
        .is("deleted_at", null)
        .limit(8),

      supabase
        .from("products")
        .select(`
          id, name, slug, base_price, compare_price,
          avg_rating, review_count, sales_count, is_featured,
          images:product_images(url, is_primary),
          category:product_categories(name),
          variants:product_variants(id)
        `)
        .eq("status", "active")
        .is("deleted_at", null)
        .order("sales_count", { ascending: false })
        .limit(10),

      supabase
        .from("products")
        .select(`
          id, name, slug, base_price, compare_price,
          avg_rating, review_count, sales_count, is_featured,
          images:product_images(url, is_primary),
          category:product_categories(name),
          variants:product_variants(id)
        `)
        .eq("status", "active")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const normalizeProducts = (items: typeof featuredResult.data) =>
    (items || []).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      base_price: p.base_price,
      compare_price: p.compare_price,
      avg_rating: p.avg_rating,
      review_count: p.review_count,
      sales_count: p.sales_count,
      is_featured: p.is_featured,
      primary_image: (p.images as { url: string; is_primary: boolean }[])?.find((i) => i.is_primary)?.url || (p.images as { url: string }[])?.[0]?.url || null,
      category_name: (p.category as { name: string } | null)?.name,
      has_stock: true,
      default_variant_id: (p.variants as { id: string }[])?.[0]?.id,
    }));

  return {
    categories: categoriesResult.data || [],
    featured: normalizeProducts(featuredResult.data),
    bestSellers: normalizeProducts(bestSellersResult.data),
    newArrivals: normalizeProducts(newArrivalsResult.data),
  };
}

export default async function HomePage() {
  const { categories, featured, bestSellers, newArrivals } = await getHomeData();

  return (
    <>
      <HeroSection />

      {/* Stats bar */}
      <div className="bg-royal-gold-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "150+", label: "Spice Varieties" },
              { value: "50K+", label: "Happy Customers" },
              { value: "4.9★", label: "Average Rating" },
              { value: "100%", label: "Authentic Source" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl font-bold">{stat.value}</div>
                <div className="text-royal-gold-100 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <CategoryGrid categories={categories as Parameters<typeof CategoryGrid>[0]["categories"]} />

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <Star size={20} className="text-royal-gold-500" />
              <span className="text-royal-gold-600 text-sm font-medium tracking-widest uppercase">Editor's Pick</span>
            </div>
            <ProductCarousel
              title="Featured Spices"
              subtitle="Hand-selected premium picks"
              products={featured}
              viewAllHref="/products?filter=featured"
            />
          </div>
        </section>
      )}

      {/* Banner strip */}
      <div className="bg-desert-sand border-y border-royal-gold-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🏆",
                title: "Royal Quality Promise",
                desc: "Every batch lab-tested. 100% pure, no adulterants, no artificial colors.",
                href: "/quality",
              },
              {
                icon: "🚚",
                title: "Farm to Doorstep",
                desc: "Sourced directly from Rajasthani farms. Packed fresh within 24 hours of your order.",
                href: "/sourcing",
              },
              {
                icon: "💛",
                title: "Generational Recipes",
                desc: "Spice blends crafted from centuries-old royal kitchen recipes.",
                href: "/heritage",
              },
            ].map((b) => (
              <Link key={b.title} href={b.href} className="flex gap-4 items-start p-4 rounded-xl hover:bg-white/60 transition-colors group">
                <div className="text-4xl">{b.icon}</div>
                <div>
                  <div className="font-semibold text-maroon-700 mb-1 group-hover:text-royal-gold-700 transition-colors">{b.title}</div>
                  <div className="text-sm text-gray-600">{b.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-20 bg-palace-ivory">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={20} className="text-saffron-500" />
              <span className="text-saffron-600 text-sm font-medium tracking-widest uppercase">Trending Now</span>
            </div>
            <ProductCarousel
              title="Best Sellers"
              subtitle="What our customers can't get enough of"
              products={bestSellers}
              viewAllHref="/products?sort=sales_count:desc"
            />
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-emerald-spice-500" />
              <span className="text-emerald-spice-600 text-sm font-medium tracking-widest uppercase">Just In</span>
            </div>
            <ProductCarousel
              title="New Arrivals"
              subtitle="Fresh flavors, just added"
              products={newArrivals}
              viewAllHref="/products?sort=created_at:desc"
            />
          </div>
        </section>
      )}

      <Testimonials />

      {/* Newsletter CTA */}
      <section className="py-20 bg-desert-sand pattern-overlay">
        <div className="max-w-xl mx-auto text-center px-4">
          <div className="text-4xl mb-4">📮</div>
          <h2 className="font-display text-3xl font-bold text-maroon-700 mb-3">
            Royal Recipes & Offers
          </h2>
          <p className="text-gray-600 mb-6">
            Get curated Rajasthani recipes, exclusive discounts, and new arrival alerts — straight to your inbox.
          </p>
          <form className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 border-2 border-royal-gold-300 rounded-xl bg-white focus:outline-none focus:border-royal-gold-500 text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-maroon-600 hover:bg-maroon-700 text-white font-medium rounded-xl transition-colors text-sm whitespace-nowrap flex items-center gap-1.5"
            >
              Subscribe <ArrowRight size={14} />
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3">No spam, unsubscribe anytime.</p>
        </div>
      </section>
    </>
  );
}
