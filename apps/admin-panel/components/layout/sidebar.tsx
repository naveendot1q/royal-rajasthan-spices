"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Warehouse,
  Tag, Star, FileText, LifeBuoy, BarChart3, Settings,
  ChevronDown, ChevronRight, LogOut, Search
} from "lucide-react";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  {
    label: "Products", icon: Package, children: [
      { label: "All Products", href: "/products" },
      { label: "Add Product", href: "/products/new" },
      { label: "Categories", href: "/products/categories" },
    ],
  },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Inventory", href: "/inventory", icon: Warehouse },
  { label: "Coupons", href: "/coupons", icon: Tag },
  { label: "Reviews", href: "/reviews", icon: Star },
  {
    label: "CMS", icon: FileText, children: [
      { label: "Banners", href: "/cms/banners" },
      { label: "Pages", href: "/cms/pages" },
    ],
  },
  { label: "Support", href: "/support", icon: LifeBuoy },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AdminSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState<string[]>(["Products", "CMS"]);

  const toggleExpanded = (label: string) =>
    setExpanded((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-royal-gold-500 to-maroon-600 flex items-center justify-center text-lg flex-shrink-0">🌶</div>
          <div>
            <div className="font-display text-white font-bold text-sm leading-tight">Royal Rajasthan</div>
            <div className="text-slate-400 text-xs">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
          <Search size={14} className="text-slate-400" />
          <input placeholder="Search…" className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none flex-1 w-0" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map((item) => {
          if ("children" in item) {
            const isOpen = expanded.includes(item.label);
            const isChildActive = item.children.some((c) => isActive(c.href));
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleExpanded(item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                    isChildActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <item.icon size={17} className={isChildActive ? "text-royal-gold-400" : ""} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isOpen && (
                  <div className="ml-8 mb-1 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive(child.href)
                            ? "bg-royal-gold-600 text-white font-medium"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                isActive(item.href)
                  ? "bg-royal-gold-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-slate-700">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-royal-gold-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">Admin</div>
            <div className="text-slate-400 text-xs capitalize">{userRole.replace("_", " ")}</div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
