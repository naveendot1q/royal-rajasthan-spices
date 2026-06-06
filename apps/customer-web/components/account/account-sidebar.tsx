"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User, Package, Heart, Star, LifeBuoy,
  MapPin, Shield, LogOut, Gift
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { label: "Profile",    href: "/account/profile",   icon: User },
  { label: "Orders",     href: "/account/orders",    icon: Package },
  { label: "Wishlist",   href: "/account/wishlist",  icon: Heart },
  { label: "Addresses",  href: "/account/addresses", icon: MapPin },
  { label: "Reviews",    href: "/account/reviews",   icon: Star },
  { label: "Support",    href: "/account/support",   icon: LifeBuoy },
  { label: "Security",   href: "/account/security",  icon: Shield },
];

interface AccountSidebarProps {
  email: string;
  fullName: string | null;
  loyaltyPts: number;
}

export function AccountSidebar({ email, fullName, loyaltyPts }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-3">
      {/* User card */}
      <div className="bg-white rounded-2xl border border-royal-gold-100 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-gold-400 to-maroon-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {fullName?.[0]?.toUpperCase() || email[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{fullName || "My Account"}</p>
            <p className="text-xs text-gray-400 truncate">{email}</p>
          </div>
        </div>
        {loyaltyPts > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-royal-gold-50 rounded-lg border border-royal-gold-200">
            <Gift size={14} className="text-royal-gold-600" />
            <span className="text-xs text-royal-gold-700 font-medium">{loyaltyPts} Loyalty Points</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="bg-white rounded-2xl border border-royal-gold-100 overflow-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                isActive
                  ? "bg-royal-gold-50 text-royal-gold-700 border-l-2 border-l-royal-gold-500 pl-3.5"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={16} className={isActive ? "text-royal-gold-600" : "text-gray-400"} />
              {item.label}
            </Link>
          );
        })}
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 w-full text-left transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
