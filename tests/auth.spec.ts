/**
 * TC-001  Valid admin login redirects to /admin dashboard
 * TC-002  Valid staff login redirects to /staff dashboard
 * TC-003  Invalid credentials shows error message
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
  });

  // TC-001: Admin login
  test("TC-001: valid admin login reaches admin dashboard", async ({ page }) => {
    await page.fill('input[name="email"], input[type="email"]', "admin@sunwayglobalschool.edu");
    await page.fill('input[name="password"], input[type="password"]', "admin123");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/admin/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/admin/);
  });

  // TC-002: Staff login
  test("TC-002: valid staff login reaches staff dashboard", async ({ page }) => {
    // Uses a staff account that was seeded / created via admin panel
    await page.fill('input[name="email"], input[type="email"]', "teacher1@gmail.com");
    await page.fill('input[name="password"], input[type="password"]', "teacher1@2024");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/staff/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/staff/);
  });

  // TC-003: Invalid credentials
  test("TC-003: wrong credentials shows an error message", async ({ page }) => {
    await page.fill('input[name="email"], input[type="email"]', "notauser@example.com");
    await page.fill('input[name="password"], input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Should NOT navigate away; error text should be visible
    await page.waitForTimeout(2_000);
    await expect(page).toHaveURL(/\/login/);

    const errorVisible = await page
      .locator("text=/invalid|incorrect|wrong|error|failed/i")
      .first()
      .isVisible()
      .catch(() => false);
    expect(errorVisible).toBeTruthy();
  });

  // Extra: unauthenticated access to admin redirects to login
  test("TC-003b: unauthenticated visit to /admin redirects to /login", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForURL(/\/login/, { timeout: 8_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
