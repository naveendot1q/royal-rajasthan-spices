import { getCartItems } from "@/lib/actions/cart";
import { CartContents } from "@/components/cart/cart-contents";
import { CartSummary } from "@/components/cart/cart-summary";
import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = { title: "Your Cart" };

export default async function CartPage() {
  const { items, savedItems } = await getCartItems();
  const subtotal = items.reduce((sum, item) => sum + item.price_snapshot * item.quantity, 0);

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-screen bg-palace-ivory flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-desert-sand rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-royal-gold-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-maroon-700 mb-3">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">Discover our premium collection of authentic Rajasthani spices</p>
          <Link href="/products" className="btn-primary inline-flex">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-palace-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-3xl font-bold text-maroon-700 mb-8">
          Your Cart <span className="text-lg font-normal text-gray-500 ml-2">({items.length} {items.length === 1 ? "item" : "items"})</span>
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartContents items={items} savedItems={savedItems} />
          </div>
          <div>
            <CartSummary subtotal={subtotal} itemCount={items.length} />
          </div>
        </div>
      </div>
    </div>
  );
}
