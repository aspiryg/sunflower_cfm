import { test, expect } from "@playwright/test";

test("landing renders in English (LTR)", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Submit Feedback/i }).first(),
  ).toBeVisible();
});

test("landing renders in Arabic (RTL)", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
});

test("locale switcher flips language and direction", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: /Switch language to Arabic/i }).click();
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("public feedback form submits to the live API and shows a reference number", async ({
  page,
}) => {
  await page.goto("/en/submit-feedback");
  await page
    .locator("#description")
    .fill("The clinic was closed during its posted opening hours today.");
  await page.locator("#name").fill("E2E Tester");
  await page.locator('button[type="submit"]').click();

  // Success state with a CFM reference number.
  await expect(page.getByText(/Thank you for your feedback/i)).toBeVisible();
  await expect(page.getByText(/CFM-\d{8}-\d{4}/)).toBeVisible();
});

test("theme toggle cycles to dark", async ({ page }) => {
  await page.goto("/en");
  // Cycle is system → light → dark; from the default (system) that's two clicks.
  const toggle = page.getByRole("button", { name: /Theme:/i });
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
