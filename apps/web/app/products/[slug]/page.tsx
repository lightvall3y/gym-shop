import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { eur } from "@/lib/api";
import { API_URL } from "@/lib/server-api";
import type { ProductDetail } from "@/lib/types";

async function getProduct(slug: string): Promise<ProductDetail | null> {
  const res = await fetch(`${API_URL}/api/products/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Product API returned ${res.status}`);
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return { title: product?.name ?? "Product not found" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  return (
    <div>
      <nav className="mb-4 text-sm text-zinc-500" aria-label="Breadcrumb">
        <Link href="/products" className="hover:underline">
          Shop
        </Link>{" "}
        /{" "}
        <Link href={`/products?category=${product.categorySlug}`} className="hover:underline">
          {product.category}
        </Link>
      </nav>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/product-image/${product.slug}`} alt={product.name} className="aspect-square w-full object-cover" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-500">
            {product.brand} · {product.gender}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold" data-testid="product-title">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl font-bold" data-testid="product-price">
            {eur(product.price)}
          </p>
          <p className="mt-4 text-zinc-700" data-testid="product-description">
            {product.description}
          </p>
          <div className="mt-6">
            <AddToCart product={product} />
          </div>
          <ul className="mt-8 space-y-1 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
            <li>Free shipping over €100</li>
            <li>30-day returns on unworn items</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
