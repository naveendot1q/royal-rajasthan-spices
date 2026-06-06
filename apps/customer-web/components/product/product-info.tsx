"use client";
import { useState } from "react";
import { ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw, ChevronDown } from "lucide-react";
import { StarRating } from "./star-rating";
import { formatCurrency, calculateDiscount } from "@rrs/shared";
import { addToCart } from "@/lib/actions/cart";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ProductInfoProps {
  product: {
    id: string; name: string; slug: string; description: string | null;
    base_price: number; compare_price: number | null; sku: string | null;
    origin: string | null; avg_rating: number; review_count: number;
    nutritional_info: Record<string, string>; tags: string[];
  };
  variants: {
    id: string; name: string; sku: string | null; price_modifier: number;
    weight_grams: number | null; inventory: { quantity: number; reserved_qty: number } | null;
  }[];
}

export function ProductInfo({ product, variants }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("description");

  const price = product.base_price + (selectedVariant?.price_modifier || 0);
  const discount = calculateDiscount(price, product.compare_price);
  const available = selectedVariant
    ? (selectedVariant.inventory?.quantity || 0) - (selectedVariant.inventory?.reserved_qty || 0)
    : 0;
  const inStock = available > 0;

  const handleAddToCart = async () => {
    if (!selectedVariant || !inStock) return;
    setAdding(true);
    const fd = new FormData();
    fd.append("variantId", selectedVariant.id);
    fd.append("quantity", String(quantity));
    const result = await addToCart(fd);
    setAdding(false);
    if (result.error) toast.error(result.error);
    else toast.success("Added to cart!");
  };

  const handleWishlist = async () => {
    if (!selectedVariant) return;
    const result = await toggleWishlist(selectedVariant.id);
    if (result.error) toast.error("Please log in to save items");
    else {
      setWishlisted(result.action === "added");
      toast.success(result.action === "added" ? "Saved to wishlist" : "Removed from wishlist");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  const AccordionSection = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border-b border-royal-gold-100">
      <button onClick={() => setExpandedSection(expandedSection === id ? null : id)} className="flex items-center justify-between w-full py-4 text-left">
        <span className="font-medium text-gray-800">{title}</span>
        <motion.div animate={{ rotate: expandedSection === id ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {expandedSection === id && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        {product.origin && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-royal-gold-50 text-royal-gold-700 text-xs font-medium rounded-full border border-royal-gold-200 mb-3">
            📍 {product.origin}
          </div>
        )}
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-maroon-700 mb-3">{product.name}</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <StarRating rating={product.avg_rating} count={product.review_count} size={16} />
          {product.sku && <span className="text-xs text-gray-400 font-mono">SKU: {product.sku}</span>}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-display text-4xl font-bold text-maroon-600">{formatCurrency(price)}</span>
        {product.compare_price && product.compare_price > price && (
          <>
            <span className="text-lg text-gray-400 line-through">{formatCurrency(product.compare_price)}</span>
            <span className="px-2.5 py-0.5 bg-maroon-500 text-white text-sm font-bold rounded">{discount}% OFF</span>
          </>
        )}
      </div>

      {/* Variants */}
      {variants.length > 1 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Size: <span className="text-maroon-600 font-semibold">{selectedVariant?.name}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {variants.map((v) => {
              const vAvailable = (v.inventory?.quantity || 0) - (v.inventory?.reserved_qty || 0);
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  disabled={vAvailable <= 0}
                  className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedVariant?.id === v.id
                      ? "border-royal-gold-500 bg-royal-gold-50 text-royal-gold-700"
                      : vAvailable <= 0
                      ? "border-gray-200 text-gray-300 line-through cursor-not-allowed"
                      : "border-gray-200 hover:border-royal-gold-300 text-gray-700"
                  }`}
                >
                  {v.name}
                  {v.price_modifier !== 0 && (
                    <span className="ml-1 text-xs text-gray-500">
                      {v.price_modifier > 0 ? "+" : ""}{formatCurrency(Math.abs(v.price_modifier))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {inStock && available <= 5 && (
            <p className="text-sm text-saffron-600 mt-2 font-medium">⚠️ Only {available} left in stock!</p>
          )}
        </div>
      )}

      {/* Quantity & Add to cart */}
      <div className="flex gap-3">
        <div className="flex items-center border-2 border-royal-gold-200 rounded-xl overflow-hidden">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center text-royal-gold-600 hover:bg-royal-gold-50 text-xl font-medium transition-colors">−</button>
          <span className="w-12 text-center font-semibold text-gray-800 text-sm">{quantity}</span>
          <button onClick={() => setQuantity((q) => Math.min(available, q + 1))} className="w-12 h-12 flex items-center justify-center text-royal-gold-600 hover:bg-royal-gold-50 text-xl font-medium transition-colors">+</button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!inStock || adding}
          className="flex-1 h-12 flex items-center justify-center gap-2 bg-maroon-600 hover:bg-maroon-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors shadow-maroon"
        >
          <ShoppingCart size={18} />
          {adding ? "Adding…" : inStock ? "Add to Cart" : "Out of Stock"}
        </button>

        <button onClick={handleWishlist} className="w-12 h-12 flex items-center justify-center border-2 border-royal-gold-200 hover:border-royal-gold-400 rounded-xl transition-colors" aria-label="Wishlist">
          <Heart size={18} className={wishlisted ? "fill-maroon-500 text-maroon-500" : "text-gray-400"} />
        </button>

        <button onClick={handleShare} className="w-12 h-12 flex items-center justify-center border-2 border-royal-gold-200 hover:border-royal-gold-400 rounded-xl transition-colors" aria-label="Share">
          <Share2 size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 py-4 border-y border-royal-gold-100">
        {[
          { icon: Truck, text: "Free shipping above ₹499" },
          { icon: Shield, text: "100% authentic guarantee" },
          { icon: RotateCcw, text: "Easy 7-day returns" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex flex-col items-center gap-1.5 text-center">
            <div className="w-9 h-9 rounded-xl bg-royal-gold-50 flex items-center justify-center">
              <Icon size={16} className="text-royal-gold-600" />
            </div>
            <span className="text-xs text-gray-600">{text}</span>
          </div>
        ))}
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <a key={tag} href={`/products?tag=${encodeURIComponent(tag)}`} className="px-3 py-1 bg-royal-gold-50 border border-royal-gold-200 text-royal-gold-700 text-xs rounded-full hover:bg-royal-gold-100 transition-colors">
              #{tag}
            </a>
          ))}
        </div>
      )}

      {/* Accordions */}
      <div>
        <AccordionSection id="description" title="Description">
          <p className="text-gray-600 text-sm leading-relaxed">{product.description || "No description available."}</p>
        </AccordionSection>

        {Object.keys(product.nutritional_info).length > 0 && (
          <AccordionSection id="nutrition" title="Nutritional Information">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(product.nutritional_info).map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                  <span className="text-gray-600">{k}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          </AccordionSection>
        )}

        <AccordionSection id="shipping" title="Shipping & Returns">
          <div className="text-sm text-gray-600 space-y-2">
            <p>🚚 <strong>Free shipping</strong> on orders above ₹499</p>
            <p>📦 Delivered in <strong>5-7 business days</strong> (standard) or 2-3 days (express)</p>
            <p>✅ <strong>7-day easy return</strong> for unopened packages</p>
            <p>🏭 Packed fresh in our Jaipur facility</p>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}
