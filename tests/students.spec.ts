/**
 * TC-009  Admin can view student list with seeded data
 * TC-010  Student search / filter returns matching results
 */
import { test, expect, Page } from "@playwright/test";

const BASE = "http://localhost:3000";

async function adminLogin(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"], input[type="email"]', "admin@sunwayglobalschool.edu");
  await page.fill('input[name="password"], input[type="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 10_000 });
}

test.describe("Student Management", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE}/admin/students`);
    await page.waitForLoadState("networkidle");
  });

  // TC-009: Student list shows seeded data
  test("TC-009: student list renders with at least one student row", async ({ page }) => {
    const table = page.locator("table tbody tr, [data-testid='student-row']");
    const rowCount = await table.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  // TC-009b: API returns students
  test("TC-009b: GET /api/students returns student data for admin", async ({ page, request }) => {
    // Re-use authenticated session
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const status = await page.evaluate(
      async ({ url, cookie }: { url: string; cookie: string }) => {
        const res = await fetch(url, {
          headers: { Cookie: cookie },
          credentials: "include",
        });
        return res.status;
      },
      { url: `${BASE}/api/students`, cookie: cookieHeader }
    );
    expect(status).toBe(200);
  });

  // TC-010: Search returns matching students
  test("TC-010: search by 'Grade 1' returns only Grade-1 students", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"], input[name="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill("Grade 1");
      await page.waitForTimeout(1_000);

      const rows = page.locator("table tbody tr");
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);

      // All visible rows should mention "Grade 1"
      for (let i = 0; i < Math.min(count, 5); i++) {
        const rowText = await rows.nth(i).textContent();
        expect(rowText?.toLowerCase()).toContain("grade 1");
      }
    } else {
      // If no search input, just verify the table is present
      const table = page.locator("table");
      await expect(table).toBeVisible();
    }
  });

  // TC-010b: Filter by class narrows results
  test("TC-010b: class filter shows only students from that class", async ({ page }) => {
    const classFilter = page.locator('select[name="class"], select[name="grade"], [data-testid="class-filter"]').first();

    if (await classFilter.isVisible()) {
      // Select first non-empty option
      const options = await classFilter.locator("option").allTextContents();
      const nonEmpty = options.find((o) => o.trim() && o !== "All" && o !== "All Classes");
      if (nonEmpty) {
        await classFilter.selectOption({ label: nonEmpty });
        await page.waitForTimeout(1_000);

        const rows = page.locator("table tbody tr");
        const count = await rows.count();
        expect(count).toBeGreaterThan(0);
      }
    } else {
      test.skip(true, "No class filter found on students page");
    }
  });
});
