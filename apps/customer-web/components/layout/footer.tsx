import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-maroon-900 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-gold-400 to-saffron-500 flex items-center justify-center text-2xl">🌶</div>
              <div>
                <div className="font-display font-bold text-palace-ivory text-xl">Royal Rajasthan</div>
                <div className="text-royal-gold-400 text-xs tracking-widest uppercase">Spice Market</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Bringing the authentic flavors of Rajasthan's royal kitchens to your home. 
              Sourced directly from trusted farmers, crafted with heritage recipes.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-maroon-700 hover:bg-royal-gold-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-royal-gold-400 text-lg font-semibold mb-6 ornament">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: "All Spices", href: "/products" },
                { label: "Best Sellers", href: "/products?sort=sales_count:desc" },
                { label: "New Arrivals", href: "/products?sort=created_at:desc" },
                { label: "Deals & Offers", href: "/products?filter=deals" },
                { label: "Gift Sets", href: "/products?category=gift-sets" },
                { label: "Organic Collection", href: "/products?tag=organic" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-royal-gold-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="font-display text-royal-gold-400 text-lg font-semibold mb-6 ornament">Support</h4>
            <ul className="space-y-3">
              {[
                { label: "My Account", href: "/account" },
                { label: "Track Order", href: "/account/orders" },
                { label: "Return & Refund", href: "/returns" },
                { label: "FAQ", href: "/faq" },
                { label: "Contact Us", href: "/contact" },
                { label: "Bulk Orders", href: "/bulk-orders" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-royal-gold-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-royal-gold-400 text-lg font-semibold mb-6 ornament">Contact</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin size={16} className="text-royal-gold-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Johari Bazaar, Jaipur<br />Rajasthan 302001, India
                </span>
              </div>
              <div className="flex gap-3">
                <Phone size={16} className="text-royal-gold-400 flex-shrink-0" />
                <a href="tel:+911234567890" className="text-gray-400 text-sm hover:text-royal-gold-400">
                  +91 12345 67890
                </a>
              </div>
              <div className="flex gap-3">
                <Mail size={16} className="text-royal-gold-400 flex-shrink-0" />
                <a href="mailto:support@royalrajasthanspices.com" className="text-gray-400 text-sm hover:text-royal-gold-400 break-all">
                  support@royalrajasthanspices.com
                </a>
              </div>
            </div>
            <div className="mt-6 p-4 bg-maroon-800 rounded-lg border border-royal-gold-800">
              <p className="text-xs text-gray-400 mb-2">Subscribe for exclusive offers</p>
              <div className="flex gap-2">
                <input type="email" placeholder="your@email.com" className="flex-1 px-3 py-2 bg-maroon-700 border border-maroon-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-royal-gold-400" />
                <button className="px-3 py-2 bg-royal-gold-600 text-white text-sm rounded hover:bg-royal-gold-500 transition-colors font-medium">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-maroon-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Royal Rajasthan Spice Market. All rights reserved. GSTIN: 08XXXXX1234Z1
            </p>
            <div className="flex gap-6">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Refund Policy", href: "/refunds" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-gray-500 hover:text-royal-gold-400 text-xs transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
            {/* Payment logos */}
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span>Secure payments:</span>
              {["UPI", "VISA", "MC", "RuPay", "COD"].map((p) => (
                <span key={p} className="px-2 py-0.5 bg-maroon-800 border border-maroon-600 rounded text-xs font-mono">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
