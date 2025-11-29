import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

export function fileExists(path: string): boolean {
  return existsSync(path);
}

export function dirExists(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}

export function readFile(path: string): string {
  return readFileSync(path, "utf-8");
}

export function writeFile(path: string, content: string): void {
  ensureDir(dirname(path));
  writeFileSync(path, content, "utf-8");
}

export function removeFile(path: string): void {
  if (existsSync(path)) {
    rmSync(path, { recursive: true });
  }
}

export function listFiles(dir: string, extension?: string): string[] {
  if (!dirExists(dir)) return [];
  
  const files = readdirSync(dir);
  if (extension) {
    return files.filter((f) => f.endsWith(extension));
  }
  return files;
}

export function getCursorDir(cwd: string = process.cwd()): string {
  return join(cwd, ".cursor");
}

export function getCommandsDir(cwd: string = process.cwd()): string {
  return join(getCursorDir(cwd), "commands");
}

export function getRulesDir(cwd: string = process.cwd()): string {
  return join(getCursorDir(cwd), "rules");
}

export function resolveFromCwd(...paths: string[]): string {
  return resolve(process.cwd(), ...paths);
}

export function getPackageJson(cwd: string = process.cwd()): Record<string, unknown> | null {
  const pkgPath = join(cwd, "package.json");
  if (!fileExists(pkgPath)) return null;
  
  try {
    return JSON.parse(readFile(pkgPath));
  } catch {
    return null;
  }
}

