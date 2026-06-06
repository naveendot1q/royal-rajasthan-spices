import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-palace-ivory flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🌶</div>
        <h1 className="font-display text-6xl font-bold text-royal-gold-500 mb-2">404</h1>
        <h2 className="font-display text-2xl font-semibold text-maroon-700 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Hmm, this page seems to have wandered off into the desert. Let's get you back on the spice trail.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/" className="btn-primary flex items-center gap-2">
            <Home size={16} /> Back to Home
          </Link>
          <Link href="/products" className="btn-secondary flex items-center gap-2">
            <Search size={16} /> Browse Spices
          </Link>
        </div>
      </div>
    </div>
  );
}
