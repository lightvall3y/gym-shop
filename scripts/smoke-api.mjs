#!/usr/bin/env node
// End-to-end smoke test against a running API (no browser, no LLM needed).
// Usage: node scripts/smoke-api.mjs [api-url] [admin-key]
const API = process.argv[2] ?? process.env.API_URL ?? "http://localhost:5080";
const ADMIN_KEY = process.argv[3] ?? process.env.ADMIN_API_KEY ?? "dev-admin-key";

let passed = 0;
let failed = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  ok ? passed++ : failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : ` (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`}`);
};

async function call(method, path, { token, admin, body } = {}) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  if (admin) headers["x-admin-key"] = ADMIN_KEY;
  const res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* not json */ }
  return { status: res.status, json };
}
const get = (p, o) => call("GET", p, o);
const post = (p, body, o) => call("POST", p, { ...o, body });

const SHIP = { shipping: { name: "Alex", address: "Storgatan 1", city: "Stockholm", postalCode: "11129", country: "Sweden" } };

console.log("Reset to seed state");
check("reset ok", (await post("/api/admin/reset", undefined, { admin: true })).status, 200);

console.log("Auth");
const login = await post("/api/auth/login", { email: "demo@gymshop.test", password: "Demo123!" });
const token = login.json.token;
const auth = { token };
check("wrong password message", (await post("/api/auth/login", { email: "demo@gymshop.test", password: "nope" })).json.error, "Invalid email or password.");
check("/me returns display name", (await get("/api/auth/me", auth)).json.displayName, "Alex Demo");
check("orders need login", (await get("/api/orders")).status, 401);
const reg = await post("/api/auth/register", { email: "smoke@gymshop.test", password: "Smoke123!", displayName: "Smoke" });
check("register new user", reg.status, 201);
check("duplicate email rejected", (await post("/api/auth/register", { email: "smoke@gymshop.test", password: "Smoke123!", displayName: "Smoke" })).status, 409);

console.log("Catalog");
check("30 products", (await get("/api/products?pageSize=48")).json.total, 30);
check("filter by category", (await get("/api/products?category=shoes")).json.total, 8);
check("sold-out product flagged", (await get("/api/products?q=compression")).json.items[0].inStock, false);
check("unknown product 404", (await get("/api/products/nope")).status, 404);

console.log("Cart + checkout");
const straps = (await get("/api/products/forge-lifting-straps")).json.variants[0];
const stockBefore = straps.stock;
check("add 2 straps (14.00 each)", (await post("/api/cart/items", { variantId: straps.id, quantity: 2 }, auth)).json.subtotal, 28);
check("shipping fee under 100", (await get("/api/cart", auth)).json.shipping, 7.9);
const soldOut = (await get("/api/products/apex-compression-tee")).json.variants[0];
check("sold-out item rejected", (await post("/api/cart/items", { variantId: soldOut.id, quantity: 1 }, auth)).status, 409);
check("incomplete shipping rejected", (await post("/api/orders", { shipping: { ...SHIP.shipping, city: "" } }, auth)).status, 400);
const order = await post("/api/orders", SHIP, auth);
check("order created", order.status, 201);
check("order total = 28 + 7.90", order.json.total, 35.9);
check("cart emptied after order", (await get("/api/cart", auth)).json.itemCount, 0);
check("stock decremented by 2", (await get("/api/products/forge-lifting-straps")).json.variants[0].stock, stockBefore - 2);
check("cancel placed order", (await post(`/api/orders/${order.json.id}/cancel`, undefined, auth)).json.status, "Cancelled");
check("stock restored after cancel", (await get("/api/products/forge-lifting-straps")).json.variants[0].stock, stockBefore);
check("shipped order can't be cancelled", (await post(`/api/orders/${(await get("/api/orders", auth)).json.find((o) => o.number === "GS-1002").id}/cancel`, undefined, auth)).status, 409);

console.log("Guest cart quote");
check("anonymous quote", (await post("/api/cart/quote", { items: [{ variantId: straps.id, quantity: 3 }] })).json.subtotal, 42);

console.log("Ownership");
const samLogin = await post("/api/auth/login", { email: "sam@gymshop.test", password: "Demo123!" });
const samOrder = (await get("/api/orders", { token: samLogin.json.token })).json[0];
check("other user's order is 404", (await get(`/api/orders/${samOrder.id}`, auth)).status, 404);

console.log("Bug flags");
check("admin needs key", (await get("/api/admin/flags")).status, 401);
await call("PUT", "/api/admin/flags", { admin: true, body: { flags: { cart_total_wrong: true } } });
await post("/api/cart/items", { variantId: straps.id, quantity: 2 }, auth);
check("cart_total_wrong ignores quantity", (await get("/api/cart", auth)).json.subtotal, 14);
await call("PUT", "/api/admin/flags", { admin: true, body: { flags: { cart_total_wrong: false, checkout_500: true } } });
check("checkout_500 returns 500", (await post("/api/orders", SHIP, auth)).status, 500);
await call("PUT", "/api/admin/flags", { admin: true, body: { flags: { checkout_500: false, login_wrong_error: true } } });
check("login_wrong_error swaps message", (await post("/api/auth/login", { email: "demo@gymshop.test", password: "nope" })).json.error, "No account found with that email.");
check("unknown flag rejected", (await call("PUT", "/api/admin/flags", { admin: true, body: { flags: { nope: true } } })).status, 400);
await post("/api/admin/reset", undefined, { admin: true });
check("reset clears flags", (await get("/api/admin/flags", { admin: true })).json.login_wrong_error, false);
check("reset restores seed orders", (await get("/api/orders", { token: (await post("/api/auth/login", { email: "demo@gymshop.test", password: "Demo123!" })).json.token })).json.length, 4);

console.log(`\npassed: ${passed}  failed: ${failed}`);
process.exit(failed ? 1 : 0);
