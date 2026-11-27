import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { apiGet } from "@/lib/server-api";
import type { Category, Paged, ProductSummary } from "@/lib/types";

// @uxid apps/web/app/page::HomePage
export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    apiGet<Paged<ProductSummary>>("/api/products?featured=true&pageSize=8"),
    apiGet<Category[]>("/api/categories"),
  ]);

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-2xl bg-zinc-900 px-6 py-14 text-white sm:px-12" data-testid="hero">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">New season</p>
        <h1 className="mt-2 max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">Gear that keeps up with your training.</h1>
        <p className="mt-4 max-w-lg text-zinc-300">Clothes, shoes and accessories for lifting, running and everything in between. Free shipping over €100.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link /* @uxid apps/web/app/page::HomePage.link */ href="/products" className="btn btn-primary" data-testid="hero-shop-all">
            Shop all
          </Link>
          <Link /* @uxid apps/web/app/page::HomePage.link-2 */ href="/products?category=shoes" className="btn btn-outline" data-testid="hero-shop-shoes">
            Shop shoes
          </Link>
        </div>
      </section>

      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="mb-4 text-xl font-bold">
          Shop by category
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => (
            <Link /* @uxid apps/web/app/page::HomePage.link-3 */
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="rounded-lg border border-zinc-200 bg-white p-5 text-center font-semibold hover:border-brand hover:text-brand"
              data-testid={`category-tile-${c.slug}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="featured-heading">
        <h2 id="featured-heading" className="mb-4 text-xl font-bold">
          Featured
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4" data-testid="featured-products">
          {featured.items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
