import { getWishlist } from "@/lib/actions/wishlist";
import { ProductCard } from "@/components/product/product-card";
import { Heart } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Wishlist" };

export default async function WishlistPage() {
  const items = await getWishlist();

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-royal-gold-100">
        <Heart size={48} className="mx-auto text-royal-gold-200 mb-4" />
        <h2 className="font-display text-2xl text-maroon-600 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Save spices you love for later</p>
        <Link href="/products" className="btn-primary inline-flex">Explore Spices</Link>
      </div>
    );
  }

  const products = items.map((item) => {
    const variant = item.variant as {
      id: string; name: string; price_modifier: number;
      product: {
        id: string; name: string; slug: string;
        base_price: number; avg_rating: number;
        images: { url: string; is_primary: boolean }[];
      } | null;
    } | null;

    const product = variant?.product;
    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      base_price: product.base_price + (variant?.price_modifier || 0),
      compare_price: null,
      avg_rating: product.avg_rating,
      review_count: 0,
      sales_count: 0,
      is_featured: false,
      primary_image: product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url || null,
      has_stock: true,
      default_variant_id: variant?.id,
    };
  }).filter(Boolean) as NonNullable<ReturnType<typeof items[number]["variant"]> extends null ? never : {
    id: string; name: string; slug: string; base_price: number; compare_price: null;
    avg_rating: number; review_count: number; sales_count: number; is_featured: boolean;
    primary_image: string | null; has_stock: boolean; default_variant_id: string | undefined;
  }>[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-maroon-700">My Wishlist</h1>
        <span className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {products.map((p) => p && <ProductCard key={p.id} product={p} isWishlisted />)}
      </div>
    </div>
  );
}
