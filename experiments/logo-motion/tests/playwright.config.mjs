import { defineConfig } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Focused checks for the lab's controls and lifecycle (not the site's suite).
 *   npx playwright test -c experiments/logo-motion/tests/playwright.config.mjs
 * Starts its own copy of the lab server on port 3021 unless LAB_URL is set.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../../..");

export default defineConfig({
  testDir: here,
  testMatch: /lab\.e2e\.mjs$/,
  timeout: 90_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.LAB_URL ?? "http://localhost:3021",
    channel: "msedge",
    headless: true,
    viewport: { width: 1500, height: 1000 },
    launchOptions: { args: ["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"] },
    trace: "retain-on-failure",
  },
  webServer: process.env.LAB_URL
    ? undefined
    : {
        command: "node experiments/logo-motion/serve.mjs 3021",
        url: "http://localhost:3021/",
        cwd: repo,
        reuseExistingServer: true,
        timeout: 30_000,
      },
});
