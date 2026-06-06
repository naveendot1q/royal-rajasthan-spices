import type { Metadata } from "next";
import { Providers } from "@/components/layout/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://shop.royalrajasthanspices.com"),
  title: {
    default: "Royal Rajasthan Spice Market — Authentic Indian Spices",
    template: "%s | Royal Rajasthan Spice Market",
  },
  description:
    "Discover the finest authentic spices from the royal kitchens of Rajasthan. Premium quality, direct from source. Free shipping above ₹499.",
  keywords: ["spices", "Indian spices", "Rajasthan", "authentic spices", "masala", "organic spices"],
  openGraph: {
    type: "website",
    siteName: "Royal Rajasthan Spice Market",
    title: "Royal Rajasthan Spice Market",
    description: "Authentic spices from the royal heritage of Rajasthan",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@RRSpiceMarket",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#B8860B" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Royal Rajasthan Spice Market",
              url: process.env.NEXT_PUBLIC_APP_URL,
              logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: ["English", "Hindi"],
              },
            }),
          }}
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#FDF6E3",
                border: "1px solid #DAA520",
                color: "#1A0A00",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
