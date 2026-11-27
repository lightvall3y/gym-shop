"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";
import { useCart } from "./cart-provider";

export function SiteHeader() {
  const { user, loading } = useAuth();
  const { cart } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-zinc-900 text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight" data-testid="nav-home">
          GYM<span className="text-brand">SHOP</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium" aria-label="Main">
          <Link href="/products" className="rounded-md px-3 py-2 hover:bg-zinc-800" data-testid="nav-products">
            Shop
          </Link>
          <Link href="/products?category=shoes" className="hidden rounded-md px-3 py-2 hover:bg-zinc-800 sm:block" data-testid="nav-shoes">
            Shoes
          </Link>
          <Link href="/account" className="rounded-md px-3 py-2 hover:bg-zinc-800" data-testid="nav-account">
            {loading ? "Account" : user ? user.displayName.split(" ")[0] : "Log in"}
          </Link>
          <Link href="/cart" className="relative rounded-md px-3 py-2 hover:bg-zinc-800" data-testid="nav-cart" aria-label={`Cart, ${cart.itemCount} items`}>
            Cart
            <span
              className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold"
              data-testid="cart-count"
            >
              {cart.itemCount}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
