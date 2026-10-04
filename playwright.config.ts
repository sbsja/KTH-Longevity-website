import { defineConfig } from "@playwright/test";

/**
 * End-to-end checks run against the static export (./out) served locally,
 * which is what a static host will serve. Build first: `npm run build`.
 * Uses the installed Microsoft Edge; no browser download needed.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3011",
    channel: "msedge",
    headless: true,
    launchOptions: { args: ["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"] },
    trace: "retain-on-failure",
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "node scripts/serve-out.mjs 3011",
        url: "http://localhost:3011/",
        reuseExistingServer: true,
        timeout: 30_000,
      },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
