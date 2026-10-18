import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // source.test.ts imports the sheets source (next/cache) and the snapshot
    // store; first module load is slow on Windows under parallel runs, so give
    // it generous headroom to avoid flaky timeouts (the tests themselves are fast).
    testTimeout: 90000,
  },
});
