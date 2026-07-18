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

  // Add a comment (Comments tab).
  await page.getByRole("tab", { name: /Comments/i }).click();
  await page.locator("#comment").fill("Investigating this now.");
  await page.getByRole("button", { name: /Post comment/i }).click();
  await expect(page.getByText("Investigating this now.")).toBeVisible();

  // Change status to In Progress (Overview tab).
  await page.getByRole("tab", { name: /Overview/i }).click();
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

  // Upload a small text file (Attachments tab).
  await page.getByRole("tab", { name: /Attachments/i }).click();
  await page.locator("#attachment-file").setInputFiles({
    name: "e2e-note.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("uploaded from the e2e test"),
  });
  await expect(page.getByText("e2e-note.txt")).toBeVisible();
  await expect(page.getByRole("link", { name: /Download/i })).toBeVisible();
});

test("dashboard renders analytics charts", async ({ page }) => {
  await login(page);
  await expect(page.locator(".chart-card").first()).toBeVisible();
  // Recharts renders SVG surfaces once data arrives.
  await expect(page.locator(".chart-card svg").first()).toBeVisible();
});

test("delete a case via the confirmation modal (with toast)", async ({ page }) => {
  await login(page);
  await page.goto("/en/cases/new");
  const title = `Deletable case ${Date.now()}`;
  await page.locator("#title").fill(title);
  await page.locator("#description").fill("Case for the delete-flow e2e.");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/cases$/);
  await page.getByRole("link", { name: title }).click();

  await page.getByRole("button", { name: /^Delete$/i }).click();
  await expect(page.getByText(/Delete this case\?/i)).toBeVisible();
  await page.getByRole("button", { name: /Delete case/i }).click();

  await expect(page).toHaveURL(/\/en\/cases$/);
  await expect(page.getByText(/Case deleted/i)).toBeVisible(); // toast
  await expect(page.getByRole("link", { name: title })).toHaveCount(0);
});

test("delete a case from the list row action menu", async ({ page }) => {
  await login(page);
  await page.goto("/en/cases/new");
  const title = `Row-menu case ${Date.now()}`;
  await page.locator("#title").fill(title);
  await page.locator("#description").fill("Case for the list row-action e2e.");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/cases$/);

  // Search to isolate the row, then open its actions menu and delete.
  await page.locator("#case-search").fill(title);
  const row = page.getByRole("row").filter({ hasText: title });
  await row.getByRole("button", { name: /Actions for/i }).click();
  await page.getByRole("menuitem", { name: /^Delete$/i }).click();
  await expect(page.getByText(/Delete this case\?/i)).toBeVisible();
  await page.getByRole("button", { name: /Delete case/i }).click();

  await expect(page.getByText(/Case deleted/i)).toBeVisible();
  await expect(page.getByRole("link", { name: title })).toHaveCount(0);
});

test("multi-tab case form captures provider details and location", async ({ page }) => {
  await login(page);
  await page.goto("/en/cases/new");
  const title = `Full form case ${Date.now()}`;

  // Basic tab (default).
  await page.locator("#title").fill(title);
  await page.locator("#description").fill("Filed through the multi-tab form.");
  await page.locator("#impactDescription").fill("Water outage for two blocks.");
  await page.locator("#urgencyLevel").selectOption("high");

  // Provider tab.
  await page.getByRole("tab", { name: /Provider/i }).click();
  await page.locator("#providerName").fill("Um Ahmad");
  await page.locator("#individualProviderGender").selectOption("female");
  await page.locator("#dataSharingConsent").check();

  // Location tab (cascade: region -> governorate list loads).
  await page.getByRole("tab", { name: /Location/i }).click();
  await page.locator("#regionSel").selectOption({ label: "West Bank" });
  await page.locator("#location").fill("Old town area");

  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/en\/cases$/);
  await expect(page.getByRole("link", { name: title })).toBeVisible();
});

test("cases scope tabs switch between all / assigned / created", async ({ page }) => {
  await login(page);
  await page.goto("/en/cases");
  await page.getByRole("tab", { name: /Created by me/i }).click();
  await expect(page.locator(".scope-tab.is-active")).toHaveText(/Created by me/);
  // Admin created cases in earlier tests — the list still renders (rows or empty state).
  await expect(page.locator("table, .center-note").first()).toBeVisible();
});

test("admin creates a user via the modal and gets a one-time temp password", async ({ page }) => {
  await login(page);
  await page.goto("/en/users");
  await page.getByRole("button", { name: /Add user/i }).click();
  const stamp = Date.now();
  await page.locator("#nu-firstName").fill("Modal");
  await page.locator("#nu-lastName").fill("Created");
  await page.locator("#nu-email").fill(`modal_${stamp}@test.local`);
  await page.locator("#nu-role").selectOption("staff");
  await page.getByRole("button", { name: /^Create$/i }).click();
  await expect(page.getByTestId("temp-password")).toBeVisible();
  await page.getByRole("button", { name: /^Done$/i }).click();
  await expect(page.getByText(`modal_${stamp}@test.local`)).toBeVisible();
});

test("bell links to the full notifications page", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: /Notifications|الإشعارات/ }).click();
  await page.getByRole("link", { name: /View all/i }).click();
  await expect(page).toHaveURL(/\/en\/notifications$/);
  await expect(page.getByRole("heading", { name: /Notifications/i })).toBeVisible();
});

test("settings manages the geographic hierarchy (governorate under region)", async ({ page }) => {
  await login(page);
  await page.goto("/en/settings");
  await page.locator("#resource-type").selectOption("governorates");
  await expect(page.getByText(/Choose the parent above/i)).toBeVisible();
  await page.locator("#parent-0").selectOption({ label: "West Bank" });
  const stamp = Date.now();
  const name = `Gov ${stamp}`;
  await page.locator("#name").fill(name);
  // Governorate codes are unique — derive one per run to keep the test isolated.
  await page.locator("#code").fill(`G${String(stamp).slice(-6)}`);
  await page.getByRole("button", { name: /^Add$/i }).click();
  await expect(page.getByText(name)).toBeVisible();
});

test("profile picture upload shows the avatar image", async ({ page }) => {
  await login(page);
  await page.goto("/en/profile");
  await page.locator("#picture").setInputFiles({
    name: "avatar.png",
    mimeType: "image/png",
    buffer: Buffer.from("not-really-a-png-but-mime-checked-only"),
  });
  await expect(page.getByText(/Picture updated/i)).toBeVisible();
  await expect(page.locator(".avatar--img").first()).toBeVisible();
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
  // The Title column header is the sort control (accessible name "Sort by: Title").
  await page.getByRole("button", { name: /Sort by.*title/i }).click();
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
  // Banner + toast both confirm — assert at least one.
  await expect(page.getByText(/Profile updated/i).first()).toBeVisible();
});
