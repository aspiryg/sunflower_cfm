import { defineConfig, devices } from "@playwright/test";

// Default to 3100 (the port the app is served on here) so a plain
// `npx playwright test` reuses an already-running server instead of spawning
// a second one on a different port and then waiting for a URL that never
// comes up.
const PORT = process.env.PORT ?? "3100";
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Boot the production build for e2e so it mirrors deploy.
  webServer: {
    // Bind the spawned server to the same PORT the tests target — otherwise
    // it starts on Next's default 3000 while Playwright waits on `baseURL`
    // and the run hangs until timeout.
    command: `npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
