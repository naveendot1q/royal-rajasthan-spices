"use client";
import { motion } from "framer-motion";
import { ProductCard } from "./product-card";
import type { ProductListItem } from "@rrs/types";

export function ProductsGrid({ products }: { products: ProductListItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
        >
          <ProductCard product={p} />
        </motion.div>
      ))}
    </div>
  );
}
