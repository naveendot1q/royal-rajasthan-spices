import Image from "next/image";
import { formatCurrency, calculateGST } from "@rrs/shared";
import { ShieldCheck } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  price_snapshot: number;
  variant: {
    id: string; name: string;
    product: { id: string; name: string; slug: string; images: { url: string; is_primary: boolean }[] } | null;
  } | null;
}

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
}

export function CheckoutSummary({ items, subtotal }: CheckoutSummaryProps) {
  const shippingFee = subtotal >= 499 ? 0 : 60;
  const gstCalc = calculateGST(subtotal + shippingFee);

  return (
    <div className="bg-white rounded-2xl border border-royal-gold-100 p-5 sticky top-24">
      <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

      {/* Items */}
      <div className="space-y-3 mb-5 max-h-72 overflow-y-auto">
        {items.map((item) => {
          const image = item.variant?.product?.images?.find((i) => i.is_primary)?.url;
          return (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="relative w-12 h-12 rounded-lg bg-desert-sand overflow-hidden flex-shrink-0">
                {image ? (
                  <Image src={image} alt={item.variant?.product?.name || ""} fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">🌶</div>
                )}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-maroon-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{item.variant?.product?.name}</p>
                <p className="text-xs text-gray-400">{item.variant?.name}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                {formatCurrency(item.price_snapshot * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({items.length} items)</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={shippingFee === 0 ? "text-emerald-600 font-medium" : ""}>
            {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
          </span>
        </div>
        <div className="flex justify-between text-gray-500 text-xs">
          <span>GST (5%)</span>
          <span>{formatCurrency(gstCalc.gst)}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
          <span>Total</span>
          <span className="text-maroon-600">{formatCurrency(gstCalc.total)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <ShieldCheck size={13} className="text-emerald-500" />
        Secure checkout · GST invoice included
      </div>
    </div>
  );
}
