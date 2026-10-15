import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "node e2e/mock-api.mjs",
      port: 4100,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm exec next dev --webpack -p 3000 --hostname 127.0.0.1",
      url: "http://127.0.0.1:3000/hy",
      reuseExistingServer: !process.env.CI,
      env: {
        API_URL: "http://127.0.0.1:4100",
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:4100",
        WEB_URL: "http://127.0.0.1:3000",
      },
    },
  ],
});
