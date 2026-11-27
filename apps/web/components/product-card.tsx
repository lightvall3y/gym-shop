import Link from "next/link";
import { eur } from "@/lib/api";
import type { ProductSummary } from "@/lib/types";

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-lg border border-zinc-200 bg-white transition-shadow hover:shadow-md"
      data-testid="product-card"
      data-product-slug={product.slug}
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/product-image/${product.slug}`} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        {!product.inStock && (
          <span className="absolute left-2 top-2 rounded bg-zinc-900 px-2 py-1 text-xs font-semibold text-white" data-testid="sold-out-badge">
            Sold out
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {product.brand} · {product.category}
        </p>
        <h3 className="mt-0.5 font-semibold leading-tight" data-testid="product-name">
          {product.name}
        </h3>
        <p className="mt-1 font-bold" data-testid="product-price">
          {eur(product.price)}
        </p>
      </div>
    </Link>
  );
}
