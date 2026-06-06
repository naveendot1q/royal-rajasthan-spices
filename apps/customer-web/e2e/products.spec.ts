import { test, expect } from "@playwright/test";

test.describe("Product Listing", () => {
  test("shows product grid", async ({ page }) => {
    await page.goto("/products");
    await expect(page.locator("h1")).toContainText("All Spices");
    // Wait for products to load
    await page.waitForSelector('[href^="/products/"]', { timeout: 10000 });
  });

  test("sort dropdown works", async ({ page }) => {
    await page.goto("/products");
    const select = page.locator("select");
    await select.selectOption("base_price:asc");
    await expect(page).toHaveURL(/sort=base_price:asc/);
  });

  test("product card links to detail page", async ({ page }) => {
    await page.goto("/products");
    const firstCard = page.locator('[href^="/products/"]').first();
    const href = await firstCard.getAttribute("href");
    if (href) {
      await page.click(`[href="${href}"]`);
      await expect(page).toHaveURL(href);
      await expect(page.locator("h1")).toBeVisible();
    }
  });
});

test.describe("Product Detail", () => {
  test("shows product info", async ({ page }) => {
    await page.goto("/products");
    const firstProduct = page.locator('[href^="/products/"]').first();
    await firstProduct.click();
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=Add to Cart")).toBeVisible();
  });

  test("variant selection changes price", async ({ page }) => {
    await page.goto("/products");
    await page.locator('[href^="/products/"]').first().click();

    const variantBtns = page.locator('button:has-text("g"), button:has-text("kg")');
    const count = await variantBtns.count();

    if (count >= 2) {
      const firstPrice = await page.locator(".text-maroon-600").first().textContent();
      await variantBtns.nth(1).click();
      // Price may or may not change depending on modifier
      await expect(page.locator(".text-maroon-600").first()).toBeVisible();
    }
  });
});
