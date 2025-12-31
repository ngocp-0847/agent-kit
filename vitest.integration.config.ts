import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.integration.{test,spec}.{js,ts}"],
    testTimeout: 60000,
    setupFiles: ["./src/test-setup.ts"],
  },
});
