"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingCart, Heart, User, X, Menu } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface NavbarClientProps {
  user: SupabaseUser | null;
  cartCount: number;
}

export function NavbarClient({ user, cartCount }: NavbarClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Search toggle */}
      <button
        onClick={() => setSearchOpen(true)}
        className="p-2 rounded-lg hover:bg-royal-gold-50 text-gray-600 hover:text-royal-gold-600 transition-colors"
        aria-label="Search"
      >
        <Search size={20} />
      </button>

      {/* Wishlist */}
      {user && (
        <Link href="/account/wishlist" className="p-2 rounded-lg hover:bg-royal-gold-50 text-gray-600 hover:text-royal-gold-600 transition-colors" aria-label="Wishlist">
          <Heart size={20} />
        </Link>
      )}

      {/* Cart */}
      <Link href="/cart" className="relative p-2 rounded-lg hover:bg-royal-gold-50 text-gray-600 hover:text-royal-gold-600 transition-colors" aria-label="Cart">
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-maroon-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Link>

      {/* Account */}
      {user ? (
        <Link href="/account" className="p-2 rounded-lg hover:bg-royal-gold-50 text-gray-600 hover:text-royal-gold-600 transition-colors" aria-label="Account">
          <User size={20} />
        </Link>
      ) : (
        <Link href="/login" className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-maroon-500 text-white text-sm font-medium rounded-lg hover:bg-maroon-600 transition-colors">
          Sign In
        </Link>
      )}

      {/* Mobile menu */}
      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2" aria-label="Menu">
        <Menu size={20} />
      </button>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <SearchBar autoFocus onClose={() => setSearchOpen(false)} />
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 bg-white rounded-lg text-gray-600 hover:text-maroon-500"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex justify-between items-center p-4 border-b border-royal-gold-200">
            <span className="font-display text-maroon-500 text-xl font-bold">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
          </div>
          <nav className="p-4 space-y-2">
            {[
              { label: "Home", href: "/" },
              { label: "Shop All Spices", href: "/products" },
              { label: "Categories", href: "/categories" },
              { label: "About Us", href: "/about" },
              { label: "Blog", href: "/blog" },
              { label: "My Account", href: user ? "/account" : "/login" },
            ].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-4 text-gray-800 hover:bg-royal-gold-50 rounded-lg font-medium">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
