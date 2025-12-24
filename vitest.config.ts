import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['src/**/*.integration.{test,spec}.{js,ts}', 'node_modules/**'],
    testTimeout: 30000,
  },
});