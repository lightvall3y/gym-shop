import { expect, test } from "@playwright/test";

const API = process.env.API_URL ?? "http://localhost:5080";
const ADMIN = { "x-admin-key": process.env.ADMIN_API_KEY ?? "dev-admin-key" };

test.beforeEach(async ({ request }) => {
  const res = await request.post(`${API}/api/admin/reset`, { headers: ADMIN });
  expect(res.ok()).toBeTruthy();
});

test("guest can browse, filter and add to cart; login merges the cart; checkout creates an order", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("hero")).toBeVisible();

  // catalog + filter
  await page.getByTestId("nav-products").click();
  await expect(page.getByTestId("result-count")).toHaveText("30 products");
  await page.getByTestId("filter-category").selectOption("accessories");
  await page.getByTestId("filter-apply").click();
  await expect(page.getByTestId("result-count")).toHaveText("6 products");

  // product page -> add to cart as guest
  await page.getByTestId("product-card").filter({ hasText: "Forge Lifting Straps" }).click();
  await expect(page.getByTestId("product-title")).toHaveText("Forge Lifting Straps");
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByTestId("add-to-cart-feedback")).toContainText("select a size");
  await page.getByTestId("size-one-size").click();
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByTestId("add-to-cart-feedback")).toContainText("Added 1");
  await expect(page.getByTestId("cart-count")).toHaveText("1");

  // cart requires login to check out
  await page.getByTestId("nav-cart").click();
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await page.getByTestId("checkout-login").click();

  // login (redirects back to the cart, guest cart merged into server cart)
  await page.getByTestId("auth-email").fill("demo@gymshop.test");
  await page.getByTestId("auth-password").fill("Demo123!");
  await page.getByTestId("auth-submit").click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(page.getByTestId("shipping-name")).toHaveValue("Alex Demo");

  // checkout
  await page.getByTestId("shipping-address").fill("Storgatan 12");
  await page.getByTestId("shipping-city").fill("Stockholm");
  await page.getByTestId("shipping-postalCode").fill("111 29");
  await page.getByTestId("shipping-country").fill("Sweden");
  await page.getByTestId("checkout-submit").click();
  await expect(page.getByTestId("order-confirmation")).toBeVisible();
  const orderNumber = await page.getByTestId("order-number").innerText();

  // order shows up in the account page
  await page.getByTestId("view-orders").click();
  await expect(page.getByTestId("order").filter({ hasText: orderNumber })).toBeVisible();
  await expect(page.getByTestId("cart-count")).toHaveText("0");
});

test("login errors, register and logout", async ({ page }) => {
  await page.goto("/account");
  await page.getByTestId("auth-email").fill("demo@gymshop.test");
  await page.getByTestId("auth-password").fill("wrong-password");
  await page.getByTestId("auth-submit").click();
  await expect(page.getByTestId("auth-error")).toHaveText("Invalid email or password.");

  await page.getByTestId("tab-register").click();
  await page.getByTestId("register-name").fill("Test Person");
  await page.getByTestId("auth-email").fill(`test-${Date.now()}@gymshop.test`);
  await page.getByTestId("auth-password").fill("Passw0rd!");
  await page.getByTestId("auth-submit").click();
  await expect(page.getByTestId("account-name")).toHaveText("Test Person");
  await expect(page.getByTestId("no-orders")).toBeVisible();

  await page.getByTestId("logout").click();
  await expect(page.getByTestId("tab-login")).toBeVisible();
});

test("order history, tracking and cancelling", async ({ page }) => {
  await page.goto("/account");
  await page.getByTestId("auth-email").fill("demo@gymshop.test");
  await page.getByTestId("auth-password").fill("Demo123!");
  await page.getByTestId("auth-submit").click();

  const shipped = page.locator('[data-order-number="GS-1002"]');
  await expect(shipped.getByTestId("order-status")).toHaveText("Shipped");
  await expect(shipped.getByTestId("order-tracking")).toHaveText("TRK-1002-SE");
  await expect(shipped.getByTestId("cancel-order")).toHaveCount(0);

  const placed = page.locator('[data-order-number="GS-1003"]');
  await placed.getByTestId("cancel-order").click();
  await expect(placed.getByTestId("order-status")).toHaveText("Cancelled");
});

test("sold-out products can't be added", async ({ page }) => {
  await page.goto("/products/apex-compression-tee");
  await expect(page.getByTestId("product-sold-out")).toBeVisible();
  await page.goto("/products/velocity-runner");
  await expect(page.getByTestId("size-43")).toBeDisabled();
  await page.getByTestId("size-42").click();
  await expect(page.getByTestId("low-stock")).toHaveText("Only 2 left!");
});

test("chat widget opens and answers", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("chat-toggle").click();
  await expect(page.getByTestId("chat-greeting")).toBeVisible();
  await page.getByTestId("chat-input").fill("What is your return policy?");
  await page.getByTestId("chat-send").click();
  await expect(page.getByTestId("chat-message-user")).toHaveText("What is your return policy?");
  // With an ANTHROPIC_API_KEY this is a real answer; without one it's the "not configured" notice.
  await expect(page.getByTestId("chat-message-assistant")).not.toHaveText("…", { timeout: 25_000 });
  await expect(page.getByTestId("chat-message-assistant")).toContainText(/.{10,}/);
});
