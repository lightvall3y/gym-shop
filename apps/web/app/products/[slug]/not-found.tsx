import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="py-20 text-center" data-testid="product-not-found">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <p className="mt-2 text-zinc-600">That product doesn&apos;t exist or is no longer sold.</p>
      <Link href="/products" className="btn btn-primary mt-6">
        Back to shop
      </Link>
    </div>
  );
}
