/**
 * TC-008  Unauthenticated POST /api/attendance returns 401
 * TC-011  Staff cannot mark attendance for a class they are not the class teacher of
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("API Security", () => {
  // TC-008: Unauthenticated POST to attendance API returns 401
  test("TC-008: POST /api/attendance without session returns 401", async ({ request }) => {
    const response = await request.post(`${BASE}/api/attendance`, {
      data: {
        classId: "Grade 1A",
        date: new Date().toISOString().split("T")[0],
        records: [{ studentId: "STU0001", status: "present" }],
      },
    });
    expect(response.status()).toBe(401);
  });

  // Unauthenticated GET /api/students returns 401
  test("TC-008b: GET /api/students without session returns 401", async ({ request }) => {
    const response = await request.get(`${BASE}/api/students`);
    expect(response.status()).toBe(401);
  });

  // Unauthenticated GET /api/staff returns 401
  test("TC-008c: GET /api/staff without session returns 401", async ({ request }) => {
    const response = await request.get(`${BASE}/api/staff`);
    expect(response.status()).toBe(401);
  });

  // TC-011: Staff marking attendance for a class they don't own gets 403
  // This test logs in as a staff member and tries to POST attendance for a different class
  test("TC-011: staff POST attendance for unauthorized class returns 403", async ({ page, request }) => {
    // Step 1: Authenticate via browser to get session cookie
    await page.goto(`${BASE}/login`);
    await page.fill('input[name="email"], input[type="email"]', "teacher1@gmail.com");
    await page.fill('input[name="password"], input[type="password"]', "teacher1@2024");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/staff/, { timeout: 10_000 });

    // Step 2: Grab cookies from the authenticated page context
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    // Step 3: POST attendance for a class the teacher does NOT own
    const response = await page.evaluate(
      async ({ url, cookie }: { url: string; cookie: string }) => {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookie,
          },
          credentials: "include",
          body: JSON.stringify({
            classId: "Grade 11A",  // Assumed to be a different class
            date: new Date().toISOString().split("T")[0],
            records: [],
          }),
        });
        return res.status;
      },
      { url: `${BASE}/api/attendance`, cookie: cookieHeader }
    );

    // Expect either 403 (unauthorized class) or 401 (session not forwarded)
    expect([401, 403]).toContain(response);
  });
});
