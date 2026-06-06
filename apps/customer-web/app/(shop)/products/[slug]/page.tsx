import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductCarousel } from "@/components/home/product-carousel";
import type { Metadata } from "next";
import { formatCurrency } from "@rrs/shared";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("products")
    .select(`
      *,
      category:product_categories(id, name, slug),
      images:product_images(id, url, alt_text, is_primary, sort_order),
      variants:product_variants(
        id, name, sku, price_modifier, weight_grams, is_active, sort_order,
        inventory(quantity, reserved_qty)
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  return data;
}

async function getRelatedProducts(categoryId: string, excludeId: string) {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("products")
    .select(`
      id, name, slug, base_price, compare_price, avg_rating, review_count, sales_count, is_featured,
      images:product_images(url, is_primary),
      variants:product_variants(id, is_active)
    `)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .eq("status", "active")
    .is("deleted_at", null)
    .limit(8);

  return (data || []).map((p) => ({
    id: p.id, name: p.name, slug: p.slug,
    base_price: p.base_price, compare_price: p.compare_price,
    avg_rating: p.avg_rating, review_count: p.review_count,
    sales_count: p.sales_count, is_featured: p.is_featured,
    primary_image: (p.images as { url: string; is_primary: boolean }[])?.find((i) => i.is_primary)?.url || null,
    has_stock: (p.variants as { is_active: boolean }[])?.some((v) => v.is_active),
    default_variant_id: (p.variants as { id: string; is_active: boolean }[])?.find((v) => v.is_active)?.id,
  }));
}

async function getReviews(productId: string) {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("reviews")
    .select(`
      id, rating, title, body, images, is_verified_purchase, is_featured, helpful_count, created_at,
      author:profiles(full_name, avatar_url)
    `)
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("is_featured", { ascending: false })
    .order("helpful_count", { ascending: false })
    .limit(20);
  return data || [];
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const image = (product.images as { url: string; is_primary: boolean }[])?.find((i) => i.is_primary)?.url;

  return {
    title: product.name,
    description: product.description || `Buy ${product.name} online — authentic Rajasthani spice`,
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description || undefined,
      images: image ? [{ url: image, width: 800, height: 800, alt: product.name }] : undefined,
    },
    other: {
      "product:price:amount": String(product.base_price),
      "product:price:currency": "INR",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [relatedProducts, reviews] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getReviews(product.id),
  ]);

  const images = (product.images as { id: string; url: string; alt_text: string | null; is_primary: boolean; sort_order: number }[])
    ?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const variants = (product.variants as { id: string; name: string; sku: string | null; price_modifier: number; weight_grams: number | null; is_active: boolean; sort_order: number; inventory: { quantity: number; reserved_qty: number } | null }[])
    ?.filter((v) => v.is_active)
    ?.sort((a, b) => a.sort_order - b.sort_order) || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.map((i) => i.url),
    sku: product.sku,
    brand: { "@type": "Brand", name: "Royal Rajasthan Spice Market" },
    offers: {
      "@type": "Offer",
      price: product.base_price,
      priceCurrency: "INR",
      availability: variants.some((v) => (v.inventory?.quantity || 0) - (v.inventory?.reserved_qty || 0) > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Royal Rajasthan Spice Market" },
    },
    ...(product.review_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.avg_rating,
        reviewCount: product.review_count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-palace-ivory">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-royal-gold-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <a href="/" className="hover:text-royal-gold-600">Home</a>
              <span>/</span>
              <a href="/products" className="hover:text-royal-gold-600">Products</a>
              <span>/</span>
              <a href={`/categories/${(product.category as { slug: string })?.slug}`} className="hover:text-royal-gold-600">
                {(product.category as { name: string })?.name}
              </a>
              <span>/</span>
              <span className="text-gray-800 font-medium truncate">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <ProductGallery images={images} productName={product.name} />
            <ProductInfo product={product} variants={variants} />
          </div>

          {/* Reviews */}
          <ProductReviews reviews={reviews} productId={product.id} avgRating={product.avg_rating} reviewCount={product.review_count} />

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <ProductCarousel
                title="You May Also Like"
                products={relatedProducts}
                viewAllHref={`/categories/${(product.category as { slug: string })?.slug}`}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
