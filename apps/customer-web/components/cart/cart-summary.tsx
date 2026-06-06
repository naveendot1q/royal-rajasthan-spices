"use client";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency, calculateGST } from "@rrs/shared";
import { Tag, ShieldCheck } from "lucide-react";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
}

export function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const shippingFee = subtotal >= 499 ? 0 : 60;
  const afterDiscount = subtotal - couponDiscount + shippingFee;
  const gstCalc = calculateGST(afterDiscount);
  const total = gstCalc.total;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    // TODO: validate coupon via server action
    toast.success("Coupon applied!");
    setCouponApplied(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-royal-gold-100 p-5 sticky top-24">
      <h2 className="font-semibold text-gray-800 mb-5">Order Summary</h2>

      {/* Coupon */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Coupon Code</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="ROYAL20"
              className="w-full pl-8 pr-3 py-2.5 border border-royal-gold-200 rounded-lg text-sm focus:outline-none focus:border-royal-gold-400"
            />
          </div>
          <button onClick={applyCoupon} className="px-3 py-2.5 bg-maroon-600 text-white text-sm font-medium rounded-lg hover:bg-maroon-700 transition-colors">
            Apply
          </button>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 text-sm pb-4 border-b border-royal-gold-100">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-spice-600">
            <span>Coupon Discount</span>
            <span>−{formatCurrency(couponDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={shippingFee === 0 ? "text-emerald-spice-600 font-medium" : ""}>
            {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
          </span>
        </div>
        <div className="flex justify-between text-gray-500 text-xs">
          <span>GST (5%)</span>
          <span>{formatCurrency(gstCalc.gst)}</span>
        </div>
      </div>

      <div className="flex justify-between font-bold text-lg pt-4 mb-5">
        <span className="text-gray-800">Total</span>
        <span className="text-maroon-600">{formatCurrency(total)}</span>
      </div>

      {subtotal < 499 && (
        <div className="mb-4 p-3 bg-royal-gold-50 border border-royal-gold-200 rounded-xl text-xs text-royal-gold-700">
          Add <strong>{formatCurrency(499 - subtotal)}</strong> more to get free shipping!
          <div className="mt-2 h-1.5 bg-royal-gold-200 rounded-full overflow-hidden">
            <div className="h-full bg-royal-gold-500 rounded-full transition-all" style={{ width: `${(subtotal / 499) * 100}%` }} />
          </div>
        </div>
      )}

      <Link href="/checkout" className="btn-primary block text-center w-full py-3.5 text-base">
        Proceed to Checkout
      </Link>

      <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 justify-center">
        <ShieldCheck size={14} className="text-emerald-spice-500" />
        Secure checkout · 256-bit SSL encryption
      </div>
    </div>
  );
}
