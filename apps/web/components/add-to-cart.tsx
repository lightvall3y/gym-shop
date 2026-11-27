"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ProductDetail } from "@/lib/types";
import { useCart } from "./cart-provider";

// @uxid apps/web/components/add-to-cart::AddToCart
export function AddToCart({ product }: { product: ProductDetail }) {
  const { add } = useCart();
  const colors = useMemo(() => [...new Set(product.variants.map((v) => v.color))], [product]);
  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const variants = product.variants.filter((v) => v.color === color);
  const selected = variants.find((v) => v.size === size) ?? null;
  const allSoldOut = product.variants.every((v) => v.stock === 0);

  async function onAdd() {
    if (!selected) {
      setFeedback({ ok: false, text: "Please select a size." });
      return;
    }
    setBusy(true);
    const error = await add(selected.id, quantity);
    setBusy(false);
    setFeedback(error ? { ok: false, text: error } : { ok: true, text: `Added ${quantity} × ${product.name} (${color}, ${selected.size}) to your cart.` });
  }

  if (allSoldOut)
    return (
      <p className="rounded-md bg-zinc-100 p-4 font-semibold" data-testid="product-sold-out">
        This product is sold out.
      </p>
    );

  return (
    <div className="space-y-5">
      {colors.length > 1 && (
        <fieldset /* @uxid apps/web/components/add-to-cart::AddToCart.fieldset */>
          <legend className="label">Colour: {color}</legend>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button /* @uxid apps/web/components/add-to-cart::AddToCart.button */
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  setSize(null);
                }}
                aria-pressed={c === color}
                className={`btn ${c === color ? "btn-dark" : "btn-outline"}`}
                data-testid={`color-${c.toLowerCase()}`}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset /* @uxid apps/web/components/add-to-cart::AddToCart.fieldset-2 */>
        <legend className="label">Size{selected ? `: ${selected.size}` : ""}</legend>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button /* @uxid apps/web/components/add-to-cart::AddToCart.button-2 */
              key={v.id}
              type="button"
              disabled={v.stock === 0}
              onClick={() => {
                setSize(v.size);
                setQuantity(1);
                setFeedback(null);
              }}
              aria-pressed={v.size === size}
              title={v.stock === 0 ? "Sold out" : undefined}
              className={`btn min-w-12 ${v.size === size ? "btn-dark" : "btn-outline"} ${v.stock === 0 ? "line-through" : ""}`}
              data-testid={`size-${v.size.toLowerCase().replace(/\s/g, "-")}`}
            >
              {v.size}
            </button>
          ))}
        </div>
        {selected && selected.stock <= 3 && (
          <p className="mt-2 text-sm font-medium text-orange-700" data-testid="low-stock">
            Only {selected.stock} left!
          </p>
        )}
      </fieldset>

      <div className="flex items-end gap-3">
        <div>
          <label /* @uxid apps/web/components/add-to-cart::AddToCart.label */ htmlFor="qty" className="label">
            Quantity
          </label>
          <select /* @uxid apps/web/components/add-to-cart::AddToCart.select */ id="qty" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="input w-20" data-testid="quantity">
            {Array.from({ length: Math.min(selected?.stock || 10, 10) }, (_, i) => i + 1).map((n) => (
              <option /* @uxid apps/web/components/add-to-cart::AddToCart.option */ key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <button /* @uxid apps/web/components/add-to-cart::AddToCart.button-3 */ type="button" onClick={onAdd} disabled={busy} className="btn btn-primary flex-1 py-3" data-testid="add-to-cart">
          {busy ? "Adding…" : "Add to cart"}
        </button>
      </div>

      {feedback && (
        <p /* @uxid apps/web/components/add-to-cart::AddToCart.p */ role="status" className={`rounded-md p-3 text-sm ${feedback.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`} data-testid="add-to-cart-feedback">
          {feedback.text}{" "}
          {feedback.ok && (
            <Link /* @uxid apps/web/components/add-to-cart::AddToCart.link */ href="/cart" className="font-semibold underline" data-testid="go-to-cart">
              View cart
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
