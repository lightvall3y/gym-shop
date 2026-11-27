import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { apiGet } from "@/lib/server-api";
import type { Category, Paged, ProductSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Shop" };

const SIZES = ["S", "M", "L", "XL", "40", "41", "42", "43", "44", "45", "46"];
type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const filters = { q: one(sp.q), category: one(sp.category), size: one(sp.size), minPrice: one(sp.minPrice), maxPrice: one(sp.maxPrice), sort: one(sp.sort) };
  const page = Math.max(parseInt(one(sp.page)) || 1, 1);

  const query = new URLSearchParams({ pageSize: "12", page: String(page) });
  for (const [k, v] of Object.entries(filters)) if (v) query.set(k, v);

  const [result, categories] = await Promise.all([apiGet<Paged<ProductSummary>>(`/api/products?${query}`), apiGet<Category[]>("/api/categories")]);
  const pages = Math.max(Math.ceil(result.total / result.pageSize), 1);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v);
    params.set("page", String(p));
    return `/products?${params}`;
  };

  return (
    <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
      <aside>
        <form method="GET" action="/products" className="space-y-4" data-testid="filters">
          <div>
            <label htmlFor="q" className="label">
              Search
            </label>
            <input id="q" name="q" defaultValue={filters.q} placeholder="e.g. leggings" className="input" data-testid="filter-search" />
          </div>
          <div>
            <label htmlFor="category" className="label">
              Category
            </label>
            <select id="category" name="category" defaultValue={filters.category} className="input" data-testid="filter-category">
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="size" className="label">
              Size
            </label>
            <select id="size" name="size" defaultValue={filters.size} className="input" data-testid="filter-size">
              <option value="">Any</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="minPrice" className="label">
                Min €
              </label>
              <input id="minPrice" name="minPrice" type="number" min="0" defaultValue={filters.minPrice} className="input" data-testid="filter-min-price" />
            </div>
            <div>
              <label htmlFor="maxPrice" className="label">
                Max €
              </label>
              <input id="maxPrice" name="maxPrice" type="number" min="0" defaultValue={filters.maxPrice} className="input" data-testid="filter-max-price" />
            </div>
          </div>
          <div>
            <label htmlFor="sort" className="label">
              Sort by
            </label>
            <select id="sort" name="sort" defaultValue={filters.sort} className="input" data-testid="filter-sort">
              <option value="">Name</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-dark flex-1" data-testid="filter-apply">
              Apply
            </button>
            <Link href="/products" className="btn btn-outline" data-testid="filter-clear">
              Clear
            </Link>
          </div>
        </form>
      </aside>

      <section>
        <h1 className="mb-1 text-2xl font-bold">{filters.category ? (categories.find((c) => c.slug === filters.category)?.name ?? "Shop") : "All products"}</h1>
        <p className="mb-4 text-sm text-zinc-500" data-testid="result-count">
          {result.total} {result.total === 1 ? "product" : "products"}
        </p>

        {result.items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500" data-testid="no-results">
            No products match your filters.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3" data-testid="product-grid">
            {result.items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination" data-testid="pagination">
            {page > 1 && (
              <Link href={pageHref(page - 1)} className="btn btn-outline" data-testid="page-prev">
                Previous
              </Link>
            )}
            <span className="text-sm text-zinc-600">
              Page {page} of {pages}
            </span>
            {page < pages && (
              <Link href={pageHref(page + 1)} className="btn btn-outline" data-testid="page-next">
                Next
              </Link>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
