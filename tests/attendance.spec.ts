/**
 * TC-006  Class teacher sees editable attendance form for their class
 * TC-007  Non-class-teacher staff sees read-only attendance for other classes
 */
import { test, expect, Page } from "@playwright/test";

const BASE = "http://localhost:3000";

async function staffLogin(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/staff/, { timeout: 10_000 });
}

test.describe("Staff Attendance", () => {
  // TC-006: Class teacher can mark attendance
  test("TC-006: class teacher can edit attendance for their class", async ({ page }) => {
    // teacher1 is assumed to be a class teacher of their assigned class
    await staffLogin(page, "teacher1@gmail.com", "teacher1@2024");
    await page.goto(`${BASE}/staff/attendance`);
    await page.waitForLoadState("networkidle");

    // The save/submit button should be enabled for their class
    const saveBtn = page.locator(
      'button:has-text("Save"), button:has-text("Submit"), button:has-text("Mark")'
    ).first();
    const saveBtnVisible = await saveBtn.isVisible().catch(() => false);
    expect(saveBtnVisible).toBeTruthy();

    // P/A/L buttons should be clickable (not disabled/opacity-60)
    const attendanceBtn = page.locator('button:has-text("P"), button:has-text("A"), button:has-text("L")').first();
    const isDisabled = await attendanceBtn.getAttribute("disabled").catch(() => null);
    expect(isDisabled).toBeNull();
  });

  // TC-007: Read-only view for non-class-teacher class
  test("TC-007: non-class-teacher class shows read-only attendance view", async ({ page }) => {
    // teacher1 should have only one class assigned (their CT class)
    // Navigating to another class should show the read-only banner
    await staffLogin(page, "teacher1@gmail.com", "teacher1@2024");
    await page.goto(`${BASE}/staff/attendance`);
    await page.waitForLoadState("networkidle");

    // If there are multiple class buttons, click the second one (non-CT class)
    const classButtons = page.locator('[data-class-button], button[data-grade]');
    const count = await classButtons.count();

    if (count >= 2) {
      // Click a class that is NOT the CT class
      await classButtons.nth(1).click();
      await page.waitForTimeout(1_000);

      // Read-only amber banner should appear
      const readOnlyBanner = page.locator('text=/read.only|view only|not the class teacher/i').first();
      const bannerVisible = await readOnlyBanner.isVisible().catch(() => false);
      expect(bannerVisible).toBeTruthy();

      // Save button should NOT be visible
      const saveBtn = page.locator('button:has-text("Save Attendance"), button[data-save-attendance]').first();
      const saveBtnVisible = await saveBtn.isVisible().catch(() => false);
      expect(saveBtnVisible).toBeFalsy();
    } else {
      // Only one class assigned — attendance is editable by default; skip second assertion
      test.skip(true, "Teacher only has one class assigned — TC-007 requires ≥2 classes");
    }
  });
});
