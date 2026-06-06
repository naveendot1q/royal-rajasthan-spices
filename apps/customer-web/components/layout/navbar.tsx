import Link from "next/link";
import { Search, ShoppingCart, Heart, User, Menu } from "lucide-react";
import { createSupabaseServer, getUser } from "@/lib/supabase/server";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const user = await getUser();

  // Get cart count server-side
  let cartCount = 0;
  if (user) {
    const supabase = await createSupabaseServer();
    const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single();
    if (cart) {
      const { count } = await supabase.from("cart_items").select("*", { count: "exact", head: true }).eq("cart_id", cart.id).eq("saved_for_later", false);
      cartCount = count || 0;
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-royal-gold-200 shadow-sm">
      {/* Top announcement bar */}
      <div className="bg-maroon-500 text-white text-xs text-center py-1.5 px-4 pattern-overlay">
        🌶️ Free shipping on orders above ₹499 &nbsp;|&nbsp; 100% Authentic Rajasthani Spices &nbsp;|&nbsp; 
        <span className="text-royal-gold-300">Use code ROYAL20 for 20% off</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-gold-500 to-maroon-500 flex items-center justify-center shadow-gold">
              <span className="text-white font-display font-bold text-lg">🌶</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-display font-bold text-maroon-500 text-lg leading-tight">Royal Rajasthan</div>
              <div className="text-xs text-royal-gold-600 tracking-widest uppercase">Spice Market</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/products" },
              { label: "Categories", href: "/categories" },
              { label: "About", href: "/about" },
              { label: "Blog", href: "/blog" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-royal-gold-600 transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-royal-gold-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <NavbarClient user={user} cartCount={cartCount} />
          </div>
        </div>
      </div>
    </header>
  );
}
