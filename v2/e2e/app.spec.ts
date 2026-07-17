import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@sunflower-cfm.org";
const ADMIN_PASSWORD = "admin123";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/en/login");
  await page.locator("#email").fill(ADMIN_EMAIL);
  await page.locator("#password").fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);
}

test("login redirects to the dashboard and greets the user", async ({ page }) => {
  await login(page);
  await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();
  await expect(page.getByText(/Welcome back/i)).toBeVisible();
  // admin sees the Users nav item (RBAC UI gating)
  await expect(page.getByRole("link", { name: /Users/i })).toBeVisible();
});

test("unauthenticated access to an app route redirects to login", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/en/cases");
  await expect(page).toHaveURL(/\/en\/login$/);
});

test("create a case through the UI and see it in the list", async ({ page }) => {
  await login(page);
  await page.goto("/en/cases/new");

  const title = `E2E case ${Date.now()}`;
  await page.locator("#title").fill(title);
  await page
    .locator("#description")
    .fill("Created by the Phase 5 authed e2e test.");
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/en\/cases$/);
  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText(/CFM-\d{8}-\d{4}/).first()).toBeVisible();
});

test("login page renders RTL in Arabic", async ({ page }) => {
  await page.goto("/ar/login");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
