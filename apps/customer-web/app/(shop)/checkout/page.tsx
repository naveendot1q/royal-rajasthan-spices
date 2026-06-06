import { redirect } from "next/navigation";
import { getUser, createSupabaseServer } from "@/lib/supabase/server";
import { getCartItems } from "@/lib/actions/cart";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { formatCurrency } from "@rrs/shared";
import type { Metadata } from "next";
import { ShieldCheck, Lock } from "lucide-react";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/checkout");

  const { items } = await getCartItems();
  if (items.length === 0) redirect("/cart");

  const supabase = await createSupabaseServer();
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("is_default", { ascending: false });

  const { data: shippingMethods } = await supabase
    .from("shipping_methods")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  const subtotal = items.reduce((sum, item) => sum + item.price_snapshot * item.quantity, 0);

  return (
    <div className="min-h-screen bg-palace-ivory">
      {/* Header */}
      <div className="bg-white border-b border-royal-gold-100 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-gold-500 to-maroon-600 flex items-center justify-center text-sm">🌶</div>
            <span className="font-display font-bold text-maroon-700">Checkout</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Lock size={12} />
            Secured by SSL
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <CheckoutForm
              addresses={addresses || []}
              shippingMethods={shippingMethods || []}
              userId={user.id}
            />
          </div>
          <div className="lg:col-span-2">
            <CheckoutSummary items={items as Parameters<typeof CheckoutSummary>[0]["items"]} subtotal={subtotal} />
          </div>
        </div>
      </div>
    </div>
  );
}
