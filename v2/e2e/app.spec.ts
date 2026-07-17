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

test("open a case, add a comment, and change status", async ({ page }) => {
  await login(page);
  // Create a case to operate on.
  await page.goto("/en/cases/new");
  const title = `Detail case ${Date.now()}`;
  await page.locator("#title").fill(title);
  await page.locator("#description").fill("Case for the detail-view e2e test.");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/cases$/);

  // Open it.
  await page.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(/\/en\/cases\/\d+$/);
  await expect(page.getByRole("heading", { name: /CFM-\d{8}-\d{4}/ })).toBeVisible();

  // Add a comment.
  await page.locator("#comment").fill("Investigating this now.");
  await page.getByRole("button", { name: /Post comment/i }).click();
  await expect(page.getByText("Investigating this now.")).toBeVisible();

  // Change status to In Progress.
  await page.locator("#statusSel").selectOption({ label: "In Progress" });
  await page.getByRole("button", { name: /Apply/i }).click();
  await expect(page.locator(".badge").filter({ hasText: "In Progress" })).toBeVisible();
});

test("users admin page lists users (admin only)", async ({ page }) => {
  await login(page);
  await page.goto("/en/users");
  await expect(page.getByRole("heading", { name: /Users/i })).toBeVisible();
  await expect(page.getByText(ADMIN_EMAIL)).toBeVisible();
});

test("upload an attachment through the case detail UI", async ({ page }) => {
  await login(page);
  // Create a fresh case.
  await page.goto("/en/cases/new");
  const title = `Attach case ${Date.now()}`;
  await page.locator("#title").fill(title);
  await page.locator("#description").fill("Case for the attachment e2e test.");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/cases$/);
  await page.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(/\/en\/cases\/\d+$/);

  // Upload a small text file.
  await page.locator("#attachment-file").setInputFiles({
    name: "e2e-note.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("uploaded from the e2e test"),
  });
  await expect(page.getByText("e2e-note.txt")).toBeVisible();
  await expect(page.getByRole("link", { name: /Download/i })).toBeVisible();
});

test("notifications bell opens its dropdown", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: /Notifications|الإشعارات/ }).click();
  await expect(page.locator(".bell__menu")).toBeVisible();
});

test("profile page saves changes", async ({ page }) => {
  await login(page);
  await page.goto("/en/profile");
  await page.locator("#organization").fill("Sunflower Org QA");
  await page.getByRole("button", { name: /Save changes/i }).click();
  await expect(page.getByText(/Profile updated/i)).toBeVisible();
});
