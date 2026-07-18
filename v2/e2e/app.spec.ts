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

test("forgot-password flow shows the anti-enumeration confirmation", async ({ page }) => {
  await page.goto("/en/login");
  await page.getByRole("link", { name: /Forgot password/i }).click();
  await expect(page).toHaveURL(/\/en\/forgot-password$/);
  await page.locator("#email").fill("whoever@example.com");
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText(/a reset message has been sent/i)).toBeVisible();
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

test("edit a case through the UI", async ({ page }) => {
  await login(page);
  await page.goto("/en/cases/new");
  const title = `Editable case ${Date.now()}`;
  await page.locator("#title").fill(title);
  await page.locator("#description").fill("Case for the edit e2e test.");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/cases$/);
  await page.getByRole("link", { name: title }).click();

  await page.getByRole("link", { name: /^Edit$/i }).click();
  await expect(page).toHaveURL(/\/en\/cases\/\d+\/edit$/);
  const newTitle = `${title} (edited)`;
  await page.locator("#title").fill(newTitle);
  await page.getByRole("button", { name: /Save changes/i }).click();

  await expect(page).toHaveURL(/\/en\/cases\/\d+$/);
  await expect(page.getByText(newTitle)).toBeVisible();
});

test("cases list search filters results", async ({ page }) => {
  await login(page);
  await page.goto("/en/cases/new");
  const unique = `Searchable${Date.now()}`;
  await page.locator("#title").fill(unique);
  await page.locator("#description").fill("Case for the search filter e2e.");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/cases$/);

  await page.locator("#case-search").fill(unique);
  await expect(page.getByRole("link", { name: unique })).toBeVisible();
  // A miss shows the empty state.
  await page.locator("#case-search").fill(`zz-no-match-${Date.now()}`);
  await expect(page.getByText(/No cases yet/i)).toBeVisible();
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

test("account menu shows identity and signs out", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: /Account|الحساب/ }).click();
  await expect(page.getByText(ADMIN_EMAIL)).toBeVisible();
  await page.getByRole("menuitem", { name: /Sign out/i }).click();
  await expect(page).toHaveURL(/\/en\/login$/);
});

test("cases table sorts by title", async ({ page }) => {
  await login(page);
  await page.goto("/en/cases");
  await page.getByRole("button", { name: /Sort by title/i }).click();
  await expect(page.locator("tbody tr").first()).toBeVisible();
  // Status badges render colored reference values.
  await expect(page.locator("tbody .badge").first()).toBeVisible();
});

test("escalate a case from the detail view", async ({ page }) => {
  await login(page);
  await page.goto("/en/cases/new");
  const title = `Escalate case ${Date.now()}`;
  await page.locator("#title").fill(title);
  await page.locator("#description").fill("Case for the escalate e2e test.");
  await page.locator('button[type="submit"]').click();
  await page.getByRole("link", { name: title }).click();

  await page.locator("#escalateReason").fill("No response from the field team");
  await page.getByRole("button", { name: /^Escalate$/i }).click();
  await expect(page.getByText(/Escalate ×1/)).toBeVisible();
});

test("settings screen adds a category", async ({ page }) => {
  await login(page);
  await page.goto("/en/settings");
  const name = `E2E Cat ${Date.now()}`;
  await page.locator("#name").fill(name);
  await page.locator("#arabicName").fill("فئة تجريبية");
  await page.getByRole("button", { name: /^Add$/i }).click();
  await expect(page.getByText(name)).toBeVisible();
});

test("mobile drawer opens the sidebar", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 900 });
  await login(page);
  const sidebar = page.locator(".sidebar");
  await expect(sidebar).not.toBeInViewport();
  await page.getByRole("button", { name: /Menu|القائمة/ }).click();
  await expect(sidebar).toBeInViewport();
  // Navigating closes the drawer.
  await sidebar.getByRole("link", { name: /Cases/i }).click();
  await expect(page).toHaveURL(/\/en\/cases$/);
  await expect(sidebar).not.toBeInViewport();
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
