"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/actions/orders";
import { toast } from "sonner";
import { AddressSelector } from "./address-selector";
import { PaymentSelector } from "./payment-selector";
import { formatCurrency } from "@rrs/shared";
import { Loader2, ChevronRight, MapPin, CreditCard, Package } from "lucide-react";

type Address = {
  id: string; label: string; full_name: string; phone: string;
  line1: string; line2: string | null; city: string; state: string;
  pincode: string; country: string; is_default: boolean;
};

type ShippingMethod = {
  id: string; name: string; description: string | null;
  base_price: number; free_above: number | null; estimated_days: number | null;
};

interface CheckoutFormProps {
  addresses: Address[];
  shippingMethods: ShippingMethod[];
  userId: string;
}

type Step = "address" | "shipping" | "payment";

export function CheckoutForm({ addresses, shippingMethods, userId }: CheckoutFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("address");
  const [selectedAddress, setSelectedAddress] = useState<string>(
    addresses.find((a) => a.is_default)?.id || addresses[0]?.id || ""
  );
  const [selectedShipping, setSelectedShipping] = useState<string>(
    shippingMethods[0]?.id || ""
  );
  const [selectedPayment, setSelectedPayment] = useState<"razorpay" | "stripe" | "cod">("cod");
  const [couponCode, setCouponCode] = useState("");
  const [placing, setPlacing] = useState(false);

  const steps: { id: Step; label: string; icon: typeof MapPin }[] = [
    { id: "address", label: "Delivery Address", icon: MapPin },
    { id: "shipping", label: "Shipping", icon: Package },
    { id: "payment", label: "Payment", icon: CreditCard },
  ];

  const currentStepIdx = steps.findIndex((s) => s.id === step);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error("Please select a delivery address"); return; }
    setPlacing(true);
    const fd = new FormData();
    fd.append("addressId", selectedAddress);
    fd.append("paymentMethod", selectedPayment);
    fd.append("shippingMethodId", selectedShipping);
    if (couponCode) fd.append("couponCode", couponCode);

    const result = await createOrder(fd);
    setPlacing(false);

    if (result.error) { toast.error(result.error); return; }

    if (result.requiresPayment && result.paymentOrderId) {
      // Razorpay: open checkout
      if (selectedPayment === "razorpay") {
        openRazorpay({
          orderId: result.orderId!,
          orderNumber: result.orderNumber!,
          paymentOrderId: result.paymentOrderId,
          amount: result.amount!,
        });
        return;
      }
      // Stripe: redirect to payment page
      if (selectedPayment === "stripe") {
        router.push(`/checkout/payment?order=${result.orderNumber}&intent=${result.paymentOrderId}`);
        return;
      }
    }

    toast.success("🎉 Order placed successfully!");
    router.push(`/orders/${result.orderNumber}`);
  };

  const openRazorpay = (params: { orderId: string; orderNumber: string; paymentOrderId: string; amount: number }) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const rzp = new (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: params.amount * 100,
        currency: "INR",
        name: "Royal Rajasthan Spice Market",
        description: `Order #${params.orderNumber}`,
        order_id: params.paymentOrderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const res = await fetch("/api/payments/verify-razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: params.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });
          const data = await res.json();
          if (data.success) {
            toast.success("Payment successful! 🎉");
            router.push(`/orders/${params.orderNumber}`);
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#B8860B" },
      });
      rzp.open();
    };
    document.body.appendChild(script);
  };

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <button
              onClick={() => i < currentStepIdx && setStep(s.id)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                step === s.id ? "text-maroon-600" :
                i < currentStepIdx ? "text-royal-gold-600 cursor-pointer" :
                "text-gray-400 cursor-not-allowed"
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step === s.id ? "bg-maroon-600 text-white" :
                i < currentStepIdx ? "bg-royal-gold-500 text-white" :
                "bg-gray-200 text-gray-500"
              }`}>
                {i < currentStepIdx ? "✓" : i + 1}
              </div>
              <span className="hidden sm:block">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < currentStepIdx ? "bg-royal-gold-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === "address" && (
        <div className="bg-white rounded-2xl border border-royal-gold-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <MapPin size={18} className="text-royal-gold-600" /> Delivery Address
          </h2>
          <AddressSelector
            addresses={addresses}
            selected={selectedAddress}
            onSelect={setSelectedAddress}
            userId={userId}
          />
          <button
            onClick={() => { if (!selectedAddress) { toast.error("Select an address"); return; } setStep("shipping"); }}
            className="mt-5 btn-primary flex items-center gap-2 w-full sm:w-auto justify-center py-3"
          >
            Continue to Shipping <ChevronRight size={16} />
          </button>
        </div>
      )}

      {step === "shipping" && (
        <div className="bg-white rounded-2xl border border-royal-gold-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Package size={18} className="text-royal-gold-600" /> Shipping Method
          </h2>
          <div className="space-y-3">
            {shippingMethods.map((method) => (
              <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedShipping === method.id ? "border-royal-gold-500 bg-royal-gold-50" : "border-gray-200 hover:border-royal-gold-200"
              }`}>
                <input
                  type="radio"
                  name="shipping"
                  value={method.id}
                  checked={selectedShipping === method.id}
                  onChange={() => setSelectedShipping(method.id)}
                  className="text-royal-gold-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{method.name}</p>
                  {method.description && <p className="text-sm text-gray-500">{method.description}</p>}
                  {method.estimated_days && (
                    <p className="text-xs text-gray-400 mt-0.5">Estimated {method.estimated_days} business days</p>
                  )}
                </div>
                <span className="font-bold text-gray-900">
                  {method.base_price === 0 ? "FREE" : formatCurrency(method.base_price)}
                </span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep("address")} className="btn-secondary px-5 py-3">Back</button>
            <button onClick={() => setStep("payment")} className="btn-primary flex items-center gap-2 px-5 py-3">
              Continue to Payment <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="bg-white rounded-2xl border border-royal-gold-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <CreditCard size={18} className="text-royal-gold-600" /> Payment Method
          </h2>
          <PaymentSelector selected={selectedPayment} onSelect={setSelectedPayment} />

          {/* Coupon */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
            <div className="flex gap-2 max-w-sm">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="ROYAL20"
                className="input-royal flex-1 text-sm"
              />
              <button className="px-4 py-2 bg-royal-gold-500 text-white text-sm font-medium rounded-lg hover:bg-royal-gold-600 transition-colors">
                Apply
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep("shipping")} className="btn-secondary px-5 py-3">Back</button>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="flex-1 sm:flex-none btn-maroon flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold disabled:opacity-60"
            >
              {placing ? <><Loader2 size={18} className="animate-spin" /> Placing Order…</> : "🌶 Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
