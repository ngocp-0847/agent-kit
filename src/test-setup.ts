import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach } from "vitest";

// Global test cleanup
const testDirs: string[] = [];

beforeEach(() => {
  // Track test directories for cleanup
});

afterEach(() => {
  // Clean up test directories
  for (const dir of testDirs) {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  testDirs.length = 0;
});

// Helper to register test directory for cleanup
export function registerTestDir(dir: string) {
  testDirs.push(dir);
}

// Helper to create temporary test directory
export function createTempTestDir(name: string): string {
  const tempDir = join(process.cwd(), "temp-test", name);
  registerTestDir(tempDir);
  return tempDir;
}
