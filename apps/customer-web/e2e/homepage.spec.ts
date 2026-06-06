import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders hero section with CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Flavors");
    await expect(page.locator('a:has-text("Shop All Spices")')).toBeVisible();
  });

  test("has working navbar", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    await page.click('a:has-text("Shop")');
    await expect(page).toHaveURL("/products");
  });

  test("search bar opens on click", async ({ page }) => {
    await page.goto("/");
    await page.click('[aria-label="Search"]');
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test("has footer with links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator('footer a:has-text("Privacy Policy")')).toBeVisible();
  });
});
