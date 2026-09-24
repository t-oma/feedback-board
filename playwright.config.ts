import { defineConfig, devices } from "@playwright/test";

import { e2eEnvironment } from "./e2e/load-environment";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // With retries on, a test that fails once and then passes leaves the run
  // green, and the log it is mentioned in is one nobody opens. The GitHub
  // reporter puts failures on the pull request and counts flaky tests in the
  // run's summary, where a green run still shows them.
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: e2eEnvironment.BETTER_AUTH_URL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // The suite runs against the production server rather than `next dev`, and
    // with `cacheComponents` that is not a cosmetic difference: the static
    // shell of a partially prerendered route is produced by the build, so what
    // a browser receives first -- and with it every Suspense boundary these
    // tests observe -- only behaves as it ships once the app has been built.
    //
    // The build runs here rather than in the `test:e2e` script because this
    // config is what loads the test environment. Everything Playwright spawns
    // inherits that environment; a shell running `pnpm build` beforehand would
    // build against `.env` and point the production bundle at the dev database.
    command:
      "pnpm exec next build && pnpm exec next start --hostname 127.0.0.1 --port 3100",
    url: e2eEnvironment.BETTER_AUTH_URL,
    reuseExistingServer: false,
    timeout: 180_000,
    // Server output is often the only record of why a server action did not
    // do what the test expected. Playwright pipes stderr by default but drops
    // stdout, which is where `console.log` and the build's progress go.
    stdout: "pipe",
    stderr: "pipe",
  },
});
