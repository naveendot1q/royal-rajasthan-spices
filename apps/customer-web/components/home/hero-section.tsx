"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, Award, Leaf } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-maroon-900 via-maroon-800 to-maroon-700">
      {/* Rajasthan pattern overlay */}
      <div className="absolute inset-0 pattern-overlay opacity-30" />

      {/* Decorative gold border */}
      <div className="absolute inset-4 border border-royal-gold-600/30 rounded-2xl pointer-events-none" />
      <div className="absolute inset-6 border border-royal-gold-600/15 rounded-2xl pointer-events-none" />

      {/* Background spice images */}
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none hidden lg:block">
        <div className="absolute top-10 right-10 text-9xl animate-float">🌶</div>
        <div className="absolute top-40 right-40 text-7xl animate-float" style={{ animationDelay: "1s" }}>⭐</div>
        <div className="absolute bottom-20 right-20 text-8xl animate-float" style={{ animationDelay: "2s" }}>🫚</div>
        <div className="absolute top-60 right-16 text-6xl animate-float" style={{ animationDelay: "0.5s" }}>🌿</div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-royal-gold-500/20 border border-royal-gold-500/40 rounded-full mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-royal-gold-400 animate-pulse" />
            <span className="text-royal-gold-300 text-sm font-medium">Authentic Since Tradition</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            The Royal{" "}
            <span className="gold-shimmer">Flavors</span>
            {" "}of{" "}
            <span className="text-royal-gold-400">Rajasthan</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed"
          >
            Discover hand-curated spices sourced directly from the fertile farms of Rajasthan. 
            Each batch is sun-dried, stone-ground, and packed with the spirit of ancient royal kitchens.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-royal-gold-500 hover:bg-royal-gold-400 text-white font-semibold rounded-xl shadow-gold-lg hover:shadow-gold transition-all duration-300 text-base"
            >
              Shop All Spices
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/products?filter=bestseller"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium rounded-xl transition-all duration-300 text-base backdrop-blur-sm"
            >
              Best Sellers
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { icon: Truck, text: "Free shipping ₹499+" },
              { icon: ShieldCheck, text: "100% Authentic" },
              { icon: Award, text: "Premium Quality" },
              { icon: Leaf, text: "No Preservatives" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-8 h-8 rounded-lg bg-royal-gold-500/20 border border-royal-gold-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-royal-gold-400" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-palace-ivory to-transparent pointer-events-none" />
    </section>
  );
}
