"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Cart, CartInput } from "@/lib/types";
import { useAuth } from "./auth-provider";

const LS_KEY = "gs_cart";
const MAX_PER_LINE = 10;
const EMPTY: Cart = { items: [], subtotal: 0, shipping: 0, total: 0, itemCount: 0 };

type CartContext = {
  cart: Cart;
  loading: boolean;
  /** Each mutation resolves to an error message (or null on success). */
  add: (variantId: string, quantity?: number) => Promise<string | null>;
  setQuantity: (variantId: string, quantity: number) => Promise<string | null>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<CartContext | null>(null);

const readLocal = (): CartInput[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
};
const writeLocal = (items: CartInput[]) => localStorage.setItem(LS_KEY, JSON.stringify(items));

/**
 * Signed-in users have a server-side cart. Guests keep a list in localStorage that is priced by the
 * anonymous /cart/quote endpoint, then merged into the server cart on login.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (authLoading) return;
    try {
      if (user) {
        setCart(await api<Cart>("/cart"));
      } else {
        const items = readLocal();
        setCart(items.length ? await api<Cart>("/cart/quote", { body: { items } }) : EMPTY);
      }
    } catch {
      setCart(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Load the cart whenever the user changes; merge the guest cart on login.
  useEffect(() => {
    if (authLoading) return;
    (async () => {
      const guestItems = readLocal();
      if (user && guestItems.length) {
        try {
          setCart(await api<Cart>("/cart/merge", { body: { items: guestItems } }));
          localStorage.removeItem(LS_KEY);
          setLoading(false);
          return;
        } catch {
          /* fall through to a plain refresh */
        }
      }
      await refresh();
    })();
  }, [user, authLoading, refresh]);

  const guestSet = useCallback(async (variantId: string, quantity: number): Promise<string | null> => {
    const items = readLocal().filter((i) => i.variantId !== variantId);
    if (quantity > 0) items.push({ variantId, quantity: Math.min(quantity, MAX_PER_LINE) });
    let quoted = items.length ? await api<Cart>("/cart/quote", { body: { items } }) : EMPTY;

    let error: string | null = quantity > MAX_PER_LINE ? `You can order at most ${MAX_PER_LINE} of the same item.` : null;
    const line = quoted.items.find((l) => l.variantId === variantId);
    if (line && line.quantity > line.stock) {
      error = line.stock === 0 ? `${line.productName} (${line.size}) is out of stock.` : `Only ${line.stock} left of ${line.productName} (${line.size}).`;
      const clamped = items.filter((i) => i.variantId !== variantId);
      if (line.stock > 0) clamped.push({ variantId, quantity: line.stock });
      items.length = 0;
      items.push(...clamped);
      quoted = items.length ? await api<Cart>("/cart/quote", { body: { items } }) : EMPTY;
    }
    writeLocal(items);
    setCart(quoted);
    return error;
  }, []);

  const add = useCallback(
    async (variantId: string, quantity = 1) => {
      try {
        if (user) {
          setCart(await api<Cart>("/cart/items", { body: { variantId, quantity } }));
          return null;
        }
        const existing = readLocal().find((i) => i.variantId === variantId)?.quantity ?? 0;
        return await guestSet(variantId, existing + quantity);
      } catch (e) {
        return e instanceof ApiError ? e.message : "Could not update the cart.";
      }
    },
    [user, guestSet],
  );

  const setQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      try {
        if (user) {
          setCart(await api<Cart>(`/cart/items/${variantId}`, { method: "PATCH", body: { quantity } }));
          return null;
        }
        return await guestSet(variantId, quantity);
      } catch (e) {
        return e instanceof ApiError ? e.message : "Could not update the cart.";
      }
    },
    [user, guestSet],
  );

  const value = useMemo(() => ({ cart, loading, add, setQuantity, refresh }), [cart, loading, add, setQuantity, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
