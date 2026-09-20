import { defineConfig, devices } from "@playwright/test";

import { e2eEnvironment } from "./e2e/load-environment";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
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
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3100",
    url: e2eEnvironment.BETTER_AUTH_URL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
