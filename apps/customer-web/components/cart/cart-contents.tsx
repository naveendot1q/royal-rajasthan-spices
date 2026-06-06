"use client";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Bookmark, ShoppingCart, Minus, Plus } from "lucide-react";
import { formatCurrency } from "@rrs/shared";
import { updateCartQuantity, removeFromCart, saveForLater, moveToCart } from "@/lib/actions/cart";
import { toast } from "sonner";

interface CartItem {
  id: string; quantity: number; price_snapshot: number; saved_for_later: boolean;
  variant: { id: string; name: string; sku: string | null;
    product: { id: string; name: string; slug: string; images: { url: string; is_primary: boolean }[] } | null } | null;
}

interface CartContentsProps {
  items: CartItem[];
  savedItems: CartItem[];
}

function CartItemRow({ item, isSaved = false }: { item: CartItem; isSaved?: boolean }) {
  const image = item.variant?.product?.images?.find((i) => i.is_primary)?.url || item.variant?.product?.images?.[0]?.url;
  const productName = item.variant?.product?.name || "Product";
  const variantName = item.variant?.name || "";

  const handleQtyChange = async (delta: number) => {
    const newQty = item.quantity + delta;
    const result = await updateCartQuantity(item.id, newQty);
    if (result.error) toast.error("Could not update quantity");
  };

  const handleRemove = async () => {
    await removeFromCart(item.id);
    toast.success("Item removed");
  };

  const handleSaveForLater = async () => {
    await saveForLater(item.id);
    toast.success("Saved for later");
  };

  const handleMoveToCart = async () => {
    await moveToCart(item.id);
    toast.success("Moved to cart");
  };

  return (
    <div className="flex gap-4 py-4 border-b border-royal-gold-100 last:border-0">
      {/* Image */}
      <Link href={`/products/${item.variant?.product?.slug}`} className="flex-shrink-0">
        <div className="w-20 h-20 rounded-xl bg-desert-sand overflow-hidden border border-royal-gold-100">
          {image ? (
            <Image src={image} alt={productName} width={80} height={80} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🌶</div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.variant?.product?.slug}`}>
          <h3 className="font-medium text-gray-800 hover:text-maroon-600 transition-colors text-sm line-clamp-2">{productName}</h3>
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">{variantName}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 border border-royal-gold-200 rounded-lg">
            <button onClick={() => handleQtyChange(-1)} className="w-8 h-8 flex items-center justify-center hover:bg-royal-gold-50 rounded-l-lg transition-colors text-gray-600">
              <Minus size={13} />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button onClick={() => handleQtyChange(1)} className="w-8 h-8 flex items-center justify-center hover:bg-royal-gold-50 rounded-r-lg transition-colors text-gray-600">
              <Plus size={13} />
            </button>
          </div>
          <span className="font-bold text-maroon-600">{formatCurrency(item.price_snapshot * item.quantity)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          {!isSaved ? (
            <button onClick={handleSaveForLater} className="flex items-center gap-1 text-xs text-gray-400 hover:text-royal-gold-600 transition-colors">
              <Bookmark size={12} /> Save for later
            </button>
          ) : (
            <button onClick={handleMoveToCart} className="flex items-center gap-1 text-xs text-gray-400 hover:text-royal-gold-600 transition-colors">
              <ShoppingCart size={12} /> Move to cart
            </button>
          )}
          <button onClick={handleRemove} className="flex items-center gap-1 text-xs text-gray-400 hover:text-maroon-500 transition-colors">
            <Trash2 size={12} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartContents({ items, savedItems }: CartContentsProps) {
  return (
    <div className="space-y-6">
      {/* Active cart items */}
      <div className="bg-white rounded-2xl border border-royal-gold-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-1">Cart Items</h2>
        {items.map((item) => <CartItemRow key={item.id} item={item as CartItem} />)}
      </div>

      {/* Saved for later */}
      {savedItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-royal-gold-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Saved for Later ({savedItems.length})</h2>
          {savedItems.map((item) => <CartItemRow key={item.id} item={item as CartItem} isSaved />)}
        </div>
      )}
    </div>
  );
}
