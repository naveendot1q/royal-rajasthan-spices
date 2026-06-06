import type { IPaymentProvider } from "@rrs/types";
import { RazorpayProvider } from "./razorpay";
import { StripeProvider } from "./stripe";
import { CodProvider } from "./cod";

export function getPaymentProvider(): IPaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? "cod";
  switch (provider) {
    case "razorpay": return new RazorpayProvider();
    case "stripe":   return new StripeProvider();
    default:         return new CodProvider();
  }
}

export { RazorpayProvider, StripeProvider, CodProvider };
