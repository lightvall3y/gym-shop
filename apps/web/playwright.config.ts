import { defineConfig } from "@playwright/test";

// Runs against an already running stack (docker compose up).
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  workers: 1, // tests share one database
  use: { baseURL: process.env.WEB_URL ?? "http://localhost:3001", trace: "retain-on-failure" },
});
