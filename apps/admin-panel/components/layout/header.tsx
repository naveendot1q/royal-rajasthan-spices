"use client";
import { Bell, Settings } from "lucide-react";
import Link from "next/link";

export function AdminHeader({ user }: { user: { email?: string; role: string } }) {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div className="text-sm text-gray-500">
        Welcome back, <span className="text-gray-800 font-medium">{user.email}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <Link href="/settings" className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50">
          <Settings size={18} />
        </Link>
        <a href={process.env.NEXT_PUBLIC_CUSTOMER_URL || "https://shop.royalrajasthanspices.com"} target="_blank" rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 border border-royal-gold-300 text-royal-gold-700 rounded-lg hover:bg-royal-gold-50 transition-colors">
          View Store ↗
        </a>
      </div>
    </header>
  );
}
