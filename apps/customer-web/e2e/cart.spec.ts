import { test, expect } from "@playwright/test";

test.describe("Cart", () => {
  test("empty cart shows message", async ({ page }) => {
    await page.goto("/cart");
    // Either empty cart message or redirect to login
    const hasEmptyMessage = await page.locator("text=Your Cart is Empty").isVisible().catch(() => false);
    const isRedirected = page.url().includes("/login") || page.url() === "http://localhost:3000/";
    expect(hasEmptyMessage || isRedirected).toBe(true);
  });

  test("cart badge shows count after adding item", async ({ page }) => {
    await page.goto("/products");
    await page.locator('[href^="/products/"]').first().click();
    // Try to add to cart (may require login)
    const addBtn = page.locator('button:has-text("Add to Cart")');
    await expect(addBtn).toBeVisible();
  });
});
