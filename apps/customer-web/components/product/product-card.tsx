"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { formatCurrency, calculateDiscount } from "@rrs/shared";
import { useState } from "react";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { addToCart } from "@/lib/actions/cart";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    compare_price: number | null;
    avg_rating: number;
    review_count: number;
    is_featured: boolean;
    primary_image?: string | null;
    category_name?: string;
    has_stock?: boolean;
    default_variant_id?: string;
  };
  isWishlisted?: boolean;
}

export function ProductCard({ product, isWishlisted: initialWishlisted = false }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [addingToCart, setAddingToCart] = useState(false);
  const discount = calculateDiscount(product.base_price, product.compare_price);
  const inStock = product.has_stock !== false;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.default_variant_id) return;
    const result = await toggleWishlist(product.default_variant_id);
    if (result.error) { toast.error("Please log in to save items"); return; }
    setWishlisted(result.action === "added");
    toast.success(result.action === "added" ? "Added to wishlist" : "Removed from wishlist");
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.default_variant_id || !inStock) return;
    setAddingToCart(true);
    const fd = new FormData();
    fd.append("variantId", product.default_variant_id);
    fd.append("quantity", "1");
    const result = await addToCart(fd);
    setAddingToCart(false);
    if (result.error) toast.error(result.error);
    else toast.success("Added to cart!");
  };

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="card-royal overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-desert-sand overflow-hidden">
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl pattern-overlay">🌶</div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="px-2 py-0.5 bg-maroon-500 text-white text-xs font-bold rounded">
                {discount}% OFF
              </span>
            )}
            {product.is_featured && (
              <span className="px-2 py-0.5 bg-royal-gold-500 text-white text-xs font-medium rounded">
                Featured
              </span>
            )}
            {!inStock && (
              <span className="px-2 py-0.5 bg-gray-500 text-white text-xs rounded">Out of Stock</span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Add to wishlist"
          >
            <Heart
              size={15}
              className={wishlisted ? "fill-maroon-500 text-maroon-500" : "text-gray-400"}
            />
          </button>

          {/* Quick add to cart */}
          {inStock && product.default_variant_id && (
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="absolute bottom-0 left-0 right-0 py-2 bg-maroon-500/90 hover:bg-maroon-600 text-white text-xs font-medium flex items-center justify-center gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            >
              <ShoppingCart size={13} />
              {addingToCart ? "Adding…" : "Quick Add"}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          {product.category_name && (
            <span className="text-xs text-royal-gold-600 font-medium uppercase tracking-wider mb-1">
              {product.category_name}
            </span>
          )}
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-maroon-600 transition-colors flex-1">
            {product.name}
          </h3>

          {/* Rating */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={i < Math.round(product.avg_rating) ? "fill-royal-gold-400 text-royal-gold-400" : "text-gray-200 fill-gray-200"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.review_count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-maroon-600">
              {formatCurrency(product.base_price)}
            </span>
            {product.compare_price && product.compare_price > product.base_price && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
