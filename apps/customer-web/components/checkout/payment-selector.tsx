"use client";
import { CreditCard, Wallet, Banknote, ShieldCheck } from "lucide-react";

type PaymentMethod = "razorpay" | "stripe" | "cod";

interface PaymentSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof CreditCard;
  badge?: string;
  available: boolean;
}[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives. No online payment needed.",
    icon: Banknote,
    available: true,
  },
  {
    id: "razorpay",
    label: "Pay Online (Razorpay)",
    description: "UPI, Net Banking, Cards, Wallets — all supported",
    icon: Wallet,
    badge: "Recommended",
    available: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },
  {
    id: "stripe",
    label: "International Card (Stripe)",
    description: "Visa, Mastercard, American Express",
    icon: CreditCard,
    available: false, // Enable when STRIPE configured
  },
];

export function PaymentSelector({ selected, onSelect }: PaymentSelectorProps) {
  return (
    <div className="space-y-3">
      {PAYMENT_METHODS.filter((m) => m.available || m.id === "cod").map((method) => (
        <label
          key={method.id}
          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selected === method.id
              ? "border-royal-gold-500 bg-royal-gold-50"
              : "border-gray-200 hover:border-royal-gold-200"
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={selected === method.id}
            onChange={() => onSelect(method.id)}
            className="text-royal-gold-600 w-4 h-4"
          />
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            selected === method.id ? "bg-royal-gold-500" : "bg-gray-100"
          }`}>
            <method.icon size={18} className={selected === method.id ? "text-white" : "text-gray-500"} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800 text-sm">{method.label}</span>
              {method.badge && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  {method.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
          </div>
        </label>
      ))}

      <div className="flex items-center gap-2 pt-2 text-xs text-gray-400">
        <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
        Your payment information is encrypted and secure. We never store card details.
      </div>
    </div>
  );
}
