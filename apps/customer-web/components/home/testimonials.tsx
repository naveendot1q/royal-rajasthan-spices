"use client";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Priya Sharma", location: "Mumbai", rating: 5, text: "The Lal Mirch from Royal Rajasthan is unlike anything I've had before. The color is so vibrant and the aroma fills the entire kitchen!", avatar: "PS" },
  { name: "Rohit Verma", location: "Delhi", rating: 5, text: "I've been ordering their Garam Masala for 3 years now. Never going back to store-bought. The blend is absolutely perfect.", avatar: "RV" },
  { name: "Anjali Patel", location: "Bangalore", rating: 5, text: "The packaging is beautiful, delivery was fast, and the spices are incredibly fresh. The turmeric has such a rich, deep color.", avatar: "AP" },
  { name: "Vikram Singh", location: "Jaipur", rating: 5, text: "Being from Rajasthan myself, I can vouch that these spices are the real deal. Reminds me of my grandmother's cooking.", avatar: "VS" },
  { name: "Meera Krishnan", location: "Chennai", rating: 4, text: "Excellent quality spices. The cumin has such a strong aroma. I especially love the Kerala blend — it's spot on!", avatar: "MK" },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-maroon-900 relative overflow-hidden">
      <div className="absolute inset-0 pattern-overlay opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-royal-gold-400 text-sm font-medium tracking-widest uppercase mb-3 ornament">
            What Our Customers Say
          </p>
          <h2 className="font-display text-4xl font-bold text-white">Loved by Food Lovers</h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} className="fill-royal-gold-400 text-royal-gold-400" />)}
            </div>
            <span className="text-gray-400 text-sm">4.9/5 from 2,400+ reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-maroon-800/60 border border-royal-gold-800/50 rounded-2xl p-6 backdrop-blur-sm"
            >
              <Quote size={24} className="text-royal-gold-600 mb-3" />
              <p className="text-gray-300 text-sm leading-relaxed mb-5">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-royal-gold-700 flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.location}</div>
                </div>
                <div className="ml-auto flex">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={13} className="fill-royal-gold-400 text-royal-gold-400" />)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
