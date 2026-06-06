import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Welcome Back");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("register page renders", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1")).toContainText("Create Account");
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
  });

  test("login redirects to redirect param", async ({ page }) => {
    await page.goto("/login?redirect=/account/orders");
    await expect(page).toHaveURL("/login?redirect=/account/orders");
  });

  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);
  });

  test("checkout redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login/);
  });
});
