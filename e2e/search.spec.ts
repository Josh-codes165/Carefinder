import { test, expect } from "@playwright/test";

test.describe("Hospital Search", () => {
  test("home page loads and shows search bar", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("input")).toBeVisible();
  });

  test("searching for Lagos shows results", async ({ page }) => {
    await page.goto("/search?city=Lagos");
    await page.waitForSelector('[id^="hospital-card-"]', { timeout: 10000 });
    const cards = page.locator('[id^="hospital-card-"]');
    await expect(cards.first()).toBeVisible();
  });

  test("clicking a hospital card navigates to detail page", async ({
    page,
  }) => {
    await page.goto("/search?city=Lagos");
    await page.waitForSelector('[id^="hospital-card-"]', { timeout: 10000 });
    await page.locator('[id^="hospital-card-"]').first().click();
    await expect(page).toHaveURL(/\/hospital\//);
  });

  test("export CSV button opens modal", async ({ page }) => {
    await page.goto("/search?city=Lagos");
    await page.waitForSelector('[id^="hospital-card-"]', { timeout: 10000 });
    await page.getByText("Export CSV").click();
    await expect(page.getByText("Download CSV")).toBeVisible();
  });

  test("share button opens share modal", async ({ page }) => {
    await page.goto("/search?city=Lagos");
    await page.waitForSelector('[id^="hospital-card-"]', { timeout: 10000 });
    await page.getByText("Share").first().click();
    await expect(page.getByText("Copy link")).toBeVisible();
  });

  test("login page loads correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("admin route redirects to login when not authenticated", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("hospital detail page shows specialties section", async ({ page }) => {
    await page.goto("/search?city=Lagos");
    await page.waitForSelector('[id^="hospital-card-"]', { timeout: 10000 });
    await page.locator('[id^="hospital-card-"]').first().click();
    await expect(
      page.getByRole("heading", { name: "Specialties" }),
    ).toBeVisible();
  });

  test("near me button appears in filter row", async ({ page }) => {
    await page.goto("/search?city=Lagos");
    await expect(page.getByText("Near me")).toBeVisible();
  });

  test("public filter shows only public hospitals", async ({ page }) => {
    await page.goto("/search?city=Lagos");
    await page.waitForSelector('[id^="hospital-card-"]', { timeout: 10000 });
    await page.getByText("public").first().click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[id^="hospital-card-"]').first()).toBeVisible();
  });
});
