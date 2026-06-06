"use client";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface GalleryImage {
  id: string; url: string; alt_text: string | null; is_primary: boolean;
}

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-desert-sand flex items-center justify-center text-8xl pattern-overlay">🌶</div>
    );
  }

  const prev = () => setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-desert-sand border border-royal-gold-100 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIdx].url}
              alt={images[activeIdx].alt_text || productName}
              fill
              className="object-cover cursor-zoom-in"
              onClick={() => setZoomed(true)}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        <button onClick={() => setZoomed(true)} className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" aria-label="Zoom">
          <ZoomIn size={16} className="text-gray-700" />
        </button>

        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white" aria-label="Previous">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white" aria-label="Next">
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setActiveIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIdx ? "w-4 bg-royal-gold-500" : "bg-white/60"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                i === activeIdx ? "border-royal-gold-500 shadow-gold" : "border-transparent hover:border-royal-gold-200"
              }`}
            >
              <Image src={img.url} alt={img.alt_text || `Image ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* Zoom modal */}
      {zoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomed(false)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[activeIdx].url}
              alt={images[activeIdx].alt_text || productName}
              width={1200}
              height={1200}
              className="object-contain max-h-[90vh] w-full rounded-xl"
            />
            <button onClick={() => setZoomed(false)} className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-800 font-bold">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
