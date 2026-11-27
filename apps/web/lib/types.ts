// Mirrors the DTOs in backend/src/GymShop.Api/Services/Dtos.cs

export type User = { id: string; email: string; displayName: string };
export type AuthResponse = { user: User };

export type Category = { slug: string; name: string };
export type ProductSummary = {
  slug: string;
  name: string;
  brand: string;
  gender: string;
  price: number;
  category: string;
  inStock: boolean;
  featured: boolean;
};
export type Variant = { id: string; sku: string; size: string; color: string; stock: number };
export type ProductDetail = {
  slug: string;
  name: string;
  description: string;
  brand: string;
  gender: string;
  price: number;
  category: string;
  categorySlug: string;
  variants: Variant[];
};
export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };

export type CartLine = {
  variantId: string;
  productSlug: string;
  productName: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stock: number;
};
export type Cart = { items: CartLine[]; subtotal: number; shipping: number; total: number; itemCount: number };
export type CartInput = { variantId: string; quantity: number };

export type Shipping = { name: string; address: string; city: string; postalCode: string; country: string };
export type Order = {
  id: string;
  number: string;
  status: "Placed" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
  subtotal: number;
  shipping: number;
  total: number;
  trackingNumber: string | null;
  shippingTo: Shipping;
  items: { productName: string; productSlug: string; size: string; color: string; unitPrice: number; quantity: number }[];
};
