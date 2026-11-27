"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { api, ApiError, eur } from "@/lib/api";
import type { Order, Shipping } from "@/lib/types";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, setQuantity, refresh } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [shipping, setShipping] = useState<Shipping>({ name: "", address: "", city: "", postalCode: "", country: "" });

  // Pre-fill the name from the account until the user types something else.
  const form: Shipping = { ...shipping, name: shipping.name || user?.displayName || "" };

  async function change(variantId: string, quantity: number) {
    setError(await setQuantity(variantId, quantity));
  }

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const order = await api<Order>("/orders", { body: { shipping: form } });
      setPlaced(order);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Checkout failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placed)
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-green-200 bg-green-50 p-8 text-center" data-testid="order-confirmation">
        <h1 className="text-2xl font-extrabold text-green-900">Thank you for your order!</h1>
        <p className="mt-2">
          Your order number is <strong data-testid="order-number">{placed.number}</strong>.
        </p>
        <p className="mt-1 text-sm text-green-900">
          Total paid: <span data-testid="order-total">{eur(placed.total)}</span>. No real payment was taken.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/account" className="btn btn-dark" data-testid="view-orders">
            View my orders
          </Link>
          <Link href="/products" className="btn btn-outline">
            Keep shopping
          </Link>
        </div>
      </div>
    );

  if (loading || authLoading) return <p className="py-10 text-center text-zinc-500">Loading your cart…</p>;

  if (cart.items.length === 0)
    return (
      <div className="py-16 text-center" data-testid="cart-empty">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-zinc-600">Time to find some new gear.</p>
        <Link href="/products" className="btn btn-primary mt-6">
          Browse products
        </Link>
      </div>
    );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Your cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section aria-label="Cart items">
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white" data-testid="cart-items">
            {cart.items.map((line) => (
              <li key={line.variantId} className="flex items-center gap-4 p-4" data-testid="cart-line" data-variant-id={line.variantId}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/product-image/${line.productSlug}`} alt="" className="h-20 w-20 rounded-md object-cover" />
                <div className="flex-1">
                  <Link href={`/products/${line.productSlug}`} className="font-semibold hover:underline" data-testid="cart-line-name">
                    {line.productName}
                  </Link>
                  <p className="text-sm text-zinc-500">
                    {line.color} · {line.size} · {eur(line.unitPrice)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button className="btn btn-outline h-8 w-8 !p-0" onClick={() => change(line.variantId, line.quantity - 1)} aria-label={`Decrease quantity of ${line.productName}`} data-testid="qty-decrease">
                      −
                    </button>
                    <span className="w-6 text-center" data-testid="cart-line-qty">
                      {line.quantity}
                    </span>
                    <button className="btn btn-outline h-8 w-8 !p-0" onClick={() => change(line.variantId, line.quantity + 1)} aria-label={`Increase quantity of ${line.productName}`} data-testid="qty-increase">
                      +
                    </button>
                    <button className="ml-3 text-sm text-red-700 hover:underline" onClick={() => change(line.variantId, 0)} data-testid="remove-line">
                      Remove
                    </button>
                  </div>
                </div>
                <p className="font-bold" data-testid="cart-line-total">
                  {eur(line.lineTotal)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4" data-testid="cart-summary">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd data-testid="cart-subtotal">{eur(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd data-testid="cart-shipping">{cart.shipping === 0 ? "Free" : eur(cart.shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd data-testid="cart-total">{eur(cart.total)}</dd>
              </div>
            </dl>
          </div>

          {error && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800" data-testid="cart-error">
              {error}
            </p>
          )}

          {!user ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm" data-testid="checkout-login-prompt">
              <p className="mb-3">Log in or create an account to check out. Your cart will be kept.</p>
              <Link href="/account?next=/cart" className="btn btn-primary w-full" data-testid="checkout-login">
                Log in to check out
              </Link>
            </div>
          ) : (
            <form onSubmit={checkout} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4" data-testid="checkout-form">
              <h2 className="font-bold">Shipping details</h2>
              {(
                [
                  ["name", "Full name"],
                  ["address", "Address"],
                  ["city", "City"],
                  ["postalCode", "Postal code"],
                  ["country", "Country"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label htmlFor={`ship-${key}`} className="label">
                    {label}
                  </label>
                  <input id={`ship-${key}`} className="input" value={form[key]} onChange={(e) => setShipping({ ...shipping, [key]: e.target.value })} required data-testid={`shipping-${key}`} />
                </div>
              ))}
              <p className="text-xs text-zinc-500">Demo store: no payment is taken.</p>
              <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3" data-testid="checkout-submit">
                {submitting ? "Placing order…" : `Place order · ${eur(cart.total)}`}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
