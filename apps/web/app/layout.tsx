import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart-provider";
import { ChatWidget } from "@/components/chat-widget";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { default: "Gym Shop – gym clothes & shoes", template: "%s · Gym Shop" },
  description: "Gym clothes, shoes and accessories. (Demo store: nothing is real, nothing ships.)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <CartProvider>
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
            <footer className="border-t border-zinc-200 bg-white">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-zinc-500">
                <p>© Gym Shop. Demo store used for testing: nothing is real and nothing ships.</p>
                <p>
                  <Link href="/products" className="hover:underline">
                    Shop
                  </Link>{" "}
                  · Free shipping over €100 · 30-day returns
                </p>
              </div>
            </footer>
            <ChatWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
