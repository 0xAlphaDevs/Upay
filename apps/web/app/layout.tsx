import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "UPay — Any coin. Any chain. One button.",
  description:
    "The Stripe-style crypto checkout. Pay with any token on any chain. Merchants settle in their chosen stablecoin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
