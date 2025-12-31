/**
 * Power utilities - Unified module for Power management
 * Combines: power-cache, power-dev, power-errors, power-validation, power
 */

import { cpSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  InstallResult,
  InstalledComponents,
  InstalledPower,
  McpServerInfo,
  PowerComponents,
  PowerInfo,
  PowerManager,
  PowerManifest,
  PowerMcpConfig,
  PowerMetadata,
  PowerPackageJson,
  PowerRequirements,
  ValidationResult,
} from "../types/power";
import {
  POWER_EXAMPLES_DIR,
  POWER_MANIFEST_FILE,
  POWER_MCP_CONFIG_FILE,
  POWER_PACKAGE_FILE,
  POWER_SERVERS_DIR,
  POWER_STEERING_DIR,
  POWER_TEMPLATES_DIR,
} from "./constants";
import {
  ensureDir,
  fileExists,
  getKiroPowerInstallDir,
  getKiroPowersCacheDir,
  getKiroPowersDir,
  getKiroPowersInstalledPath,
  readFile,
  removeFile,
  writeFile,
} from "./fs";

// ============================================================================
// ERROR TYPES
// ============================================================================

export type PowerInstallationPhase = "download" | "extract" | "validate" | "install";

export interface PowerErrorInfo {
  code: string;
  message: string;
  powerName: string;
  phase: PowerInstallationPhase;
  recoverable: boolean;
  troubleshooting: string[];
  context?: Record<string, unknown>;
  timestamp: string;
}

export abstract class PowerError extends Error {
  abstract readonly code: string;
  abstract readonly phase: PowerInstallationPhase;
  abstract readonly recoverable: boolean;
  abstract readonly troubleshooting: string[];

  constructor(
    message: string,
    public readonly powerName: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  getUserMessage(): string {
    const troubleshootingText =
      this.troubleshooting.length > 0
        ? `\n\nTroubleshooting:\n${this.troubleshooting.map((tip) => `• ${tip}`).join("\n")}`
        : "";
    return `${this.message}${troubleshootingText}`;
  }

  getErrorInfo(): PowerErrorInfo {
    return {
      code: this.code,
      message: this.message,
      powerName: this.powerName,
      phase: this.phase,
      recoverable: this.recoverable,
      troubleshooting: this.troubleshooting,
      context: this.context,
      timestamp: new Date().toISOString(),
    };
  }
}

export class PowerNetworkError extends PowerError {
  readonly code = "POWER_NETWORK_ERROR";
  readonly phase = "download" as const;
  readonly recoverable = true;
  readonly troubleshooting = [
    "Check your internet connection",
    "Verify the Power registry URL is accessible",
    "Try again in a few minutes",
  ];
  constructor(powerName: string, operation: string, cause?: string) {
    super(
      `Network error during ${operation} for Power '${powerName}'${cause ? `: ${cause}` : ""}`,
      powerName,
      { operation, cause },
    );
  }
}

export class PowerValidationError extends PowerError {
  readonly code = "POWER_VALIDATION_ERROR";
  readonly phase = "validate" as const;
  readonly recoverable = false;
  readonly troubleshooting = [
    "Verify the Power package structure is correct",
    "Check that package.json and POWER.md files exist",
  ];
  constructor(powerName: string, validationErrors: string[]) {
    super(`Power '${powerName}' failed validation: ${validationErrors.join(", ")}`, powerName, {
      validationErrors,
    });
  }
}

export class PowerFileSystemError extends PowerError {
  readonly code = "POWER_FILESYSTEM_ERROR";
  readonly phase = "install" as const;
  readonly recoverable = true;
  readonly troubleshooting = [
    "Check that you have sufficient disk space",
    "Verify you have read/write permissions",
  ];
  constructor(powerName: string, operation: string, path: string, cause?: string) {
    super(
      `File system error during ${operation} for Power '${powerName}' at ${path}${cause ? `: ${cause}` : ""}`,
      powerName,
      { operation, path, cause },
    );
  }
}

export class PowerMcpConfigError extends PowerError {
  readonly code = "POWER_MCP_CONFIG_ERROR";
  readonly phase = "install" as const;
  readonly recoverable = true;
  readonly troubleshooting = [
    "Check that the MCP configuration file is valid JSON",
    "Verify you have write permissions to the .kiro/settings directory",
  ];
  constructor(powerName: string, operation: string, cause?: string) {
    super(
      `MCP configuration error during ${operation} for Power '${powerName}'${cause ? `: ${cause}` : ""}`,
      powerName,
      { operation, cause },
    );
  }
}

export function createPowerErrorFromGeneric(
  error: unknown,
  powerName: string,
  phase: PowerInstallationPhase,
  operation: string,
): PowerError {
  const message = error instanceof Error ? error.message : String(error);
  switch (phase) {
    case "download":
      return new PowerNetworkError(powerName, operation, message);
    case "validate":
      return new PowerValidationError(powerName, [message]);
    default:
      return new PowerFileSystemError(powerName, operation, "unknown", message);
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function validatePowerPackageStructure(powerPath: string): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  const packageJsonPath = join(powerPath, POWER_PACKAGE_FILE);
  const powerMdPath = join(powerPath, POWER_MANIFEST_FILE);

  if (!fileExists(packageJsonPath)) {
    result.errors.push("Missing package.json file");
    result.valid = false;
  }
  if (!fileExists(powerMdPath)) {
    result.errors.push("Missing POWER.md file");
    result.valid = false;
  }

  if (fileExists(packageJsonPath)) {
    const pkgValidation = validatePackageJson(packageJsonPath);
    result.errors.push(...pkgValidation.errors);
    result.warnings.push(...pkgValidation.warnings);
    if (!pkgValidation.valid) result.valid = false;
  }

  const mcpConfigPath = join(powerPath, POWER_MCP_CONFIG_FILE);
  if (fileExists(mcpConfigPath)) {
    const mcpValidation = validateMcpConfiguration(mcpConfigPath);
    result.errors.push(...mcpValidation.errors);
    result.warnings.push(...mcpValidation.warnings);
    if (!mcpValidation.valid) result.valid = false;
  }

  if (!fileExists(mcpConfigPath) && !fileExists(join(powerPath, POWER_STEERING_DIR))) {
    result.warnings.push("Power contains no MCP servers or steering files");
  }

  return result;
}

export function validatePackageJson(packageJsonPath: string): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  try {
    const content = readFile(packageJsonPath);
    const pkg = JSON.parse(content) as PowerPackageJson;

    if (!pkg.name || typeof pkg.name !== "string") {
      result.errors.push("package.json missing or invalid 'name' field");
      result.valid = false;
    }
    if (!pkg.version || typeof pkg.version !== "string") {
      result.errors.push("package.json missing or invalid 'version' field");
      result.valid = false;
    }
    if (!pkg.description) result.warnings.push("package.json missing 'description' field");
    if (!pkg.author) result.warnings.push("package.json missing 'author' field");
  } catch (error) {
    result.errors.push(
      `Invalid package.json format: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    result.valid = false;
  }
  return result;
}

export function validateMcpConfiguration(mcpConfigPath: string): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  try {
    const content = readFile(mcpConfigPath);
    const mcpConfig = JSON.parse(content) as PowerMcpConfig;

    if (!mcpConfig.mcpServers || typeof mcpConfig.mcpServers !== "object") {
      result.errors.push("MCP configuration missing 'mcpServers' object");
      result.valid = false;
      return result;
    }

    for (const [serverName, serverConfig] of Object.entries(mcpConfig.mcpServers)) {
      const serverValidation = validateMcpServerConfig(serverName, serverConfig);
      result.errors.push(...serverValidation.errors);
      result.warnings.push(...serverValidation.warnings);
      if (!serverValidation.valid) result.valid = false;
    }
  } catch (error) {
    result.errors.push(
      `Invalid MCP configuration format: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    result.valid = false;
  }
  return result;
}

export function validateMcpServerConfig(
  serverName: string,
  serverConfig: McpServerInfo,
): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  const prefix = `MCP server '${serverName}'`;

  if (!serverConfig.name || typeof serverConfig.name !== "string") {
    result.errors.push(`${prefix} missing or invalid 'name' field`);
    result.valid = false;
  }
  if (!serverConfig.command || typeof serverConfig.command !== "string") {
    result.errors.push(`${prefix} missing or invalid 'command' field`);
    result.valid = false;
  }
  if (!Array.isArray(serverConfig.args)) {
    result.errors.push(`${prefix} 'args' must be an array`);
    result.valid = false;
  }
  if (!serverConfig.description) result.warnings.push(`${prefix} missing 'description' field`);

  return result;
}

export function validatePowerComprehensive(
  powerPath: string,
  powerInfo?: PowerInfo,
): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  const structureValidation = validatePowerPackageStructure(powerPath);
  result.errors.push(...structureValidation.errors);
  result.warnings.push(...structureValidation.warnings);
  if (!structureValidation.valid) result.valid = false;

  if (powerInfo) {
    const compatValidation = validatePowerCompatibility(powerInfo);
    result.errors.push(...compatValidation.errors);
    result.warnings.push(...compatValidation.warnings);
    if (!compatValidation.valid) result.valid = false;
  }
  return result;
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

const DEFAULT_CACHE_TTL = 1000 * 60 * 60;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  lastCleanup: number;
}

export class PowerCacheManager {
  private cacheDir: string;
  private stats: CacheStats;
  private memoryCache: Map<string, CacheEntry<unknown>>;
  private maxMemoryCacheSize: number;

  constructor(cwd: string = process.cwd(), maxMemoryCacheSize = 100) {
    this.cacheDir = getKiroPowersCacheDir(cwd);
    this.maxMemoryCacheSize = maxMemoryCacheSize;
    this.memoryCache = new Map();
    this.stats = { hits: 0, misses: 0, evictions: 0, totalSize: 0, lastCleanup: Date.now() };
    ensureDir(this.cacheDir);
  }

  async getCachedRegistry(): Promise<PowerManifest | null> {
    const cached = await this.get<PowerManifest>("registry");
    if (cached) {
      this.stats.hits++;
      return cached;
    }
    this.stats.misses++;
    return null;
  }

  async setCachedRegistry(manifest: PowerManifest, ttl: number = DEFAULT_CACHE_TTL): Promise<void> {
    await this.set("registry", manifest, ttl);
  }

  async getCachedPowerMetadata(powerName: string): Promise<PowerMetadata | null> {
    const cached = await this.get<PowerMetadata>(`power-metadata-${powerName}`);
    if (cached) {
      this.stats.hits++;
      return cached;
    }
    this.stats.misses++;
    return null;
  }

  async setCachedPowerMetadata(
    powerName: string,
    metadata: PowerMetadata,
    ttl: number = DEFAULT_CACHE_TTL,
  ): Promise<void> {
    await this.set(`power-metadata-${powerName}`, metadata, ttl);
  }

  private async get<T>(key: string): Promise<T | null> {
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isEntryValid(memoryEntry)) return memoryEntry.data as T;

    const cacheFile = join(this.cacheDir, `${key}.json`);
    if (!fileExists(cacheFile)) return null;

    try {
      const content = readFile(cacheFile);
      const entry = JSON.parse(content) as CacheEntry<T>;
      if (!this.isEntryValid(entry)) {
        removeFile(cacheFile);
        this.memoryCache.delete(key);
        return null;
      }
      if (this.memoryCache.size < this.maxMemoryCacheSize) this.memoryCache.set(key, entry);
      return entry.data;
    } catch {
      removeFile(cacheFile);
      this.memoryCache.delete(key);
      return null;
    }
  }

  private async set<T>(key: string, data: T, ttl: number): Promise<void> {
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl, version: "1.0.0" };

    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) this.memoryCache.delete(oldestKey);
      this.stats.evictions++;
    }
    this.memoryCache.set(key, entry);

    const cacheFile = join(this.cacheDir, `${key}.json`);
    try {
      writeFile(cacheFile, JSON.stringify(entry, null, 2));
    } catch {
      /* ignore */
    }
  }

  private isEntryValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  async cleanup(): Promise<{ removed: number; errors: string[] }> {
    const result = { removed: 0, errors: [] as string[] };
    try {
      const fs = require("fs");
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const filePath = join(this.cacheDir, file);
        try {
          const content = readFile(filePath);
          const entry = JSON.parse(content) as CacheEntry<unknown>;
          if (!this.isEntryValid(entry)) {
            removeFile(filePath);
            result.removed++;
            this.memoryCache.delete(file.replace(".json", ""));
          }
        } catch {
          removeFile(filePath);
          result.removed++;
        }
      }
      this.stats.lastCleanup = Date.now();
    } catch (error) {
      result.errors.push(
        `Failed to cleanup cache: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
    return result;
  }

  async clear(): Promise<{ removed: number; errors: string[] }> {
    const result = { removed: 0, errors: [] as string[] };
    this.memoryCache.clear();
    try {
      const fs = require("fs");
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        try {
          removeFile(join(this.cacheDir, file));
          result.removed++;
        } catch {
          /* ignore */
        }
      }
    } catch (error) {
      result.errors.push(
        `Failed to clear cache: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
    return result;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }
}

let globalCacheManager: PowerCacheManager | null = null;

export function getCacheManager(cwd: string = process.cwd()): PowerCacheManager {
  if (!globalCacheManager) globalCacheManager = new PowerCacheManager(cwd);
  return globalCacheManager;
}

export async function getOptimizedPowerRegistry(
  cwd: string = process.cwd(),
): Promise<PowerManifest> {
  const cacheManager = getCacheManager(cwd);
  const cached = await cacheManager.getCachedRegistry();
  if (cached) return cached;
  const manifest = await fetchPowerRegistry();
  await cacheManager.setCachedRegistry(manifest);
  return manifest;
}

export async function getOptimizedPowerMetadata(
  powerName: string,
  cwd: string = process.cwd(),
): Promise<PowerMetadata | null> {
  const cacheManager = getCacheManager(cwd);
  const cached = await cacheManager.getCachedPowerMetadata(powerName);
  if (cached) return cached;
  const metadata = getInstalledPowerMetadata(powerName, cwd);
  if (metadata) await cacheManager.setCachedPowerMetadata(powerName, metadata);
  return metadata;
}

// ============================================================================
// CORE POWER UTILITIES
// ============================================================================

function getCliPackageRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);
  if (currentDir.endsWith("dist") || currentDir.endsWith("dist/")) return join(currentDir, "..");
  return join(currentDir, "..", "..");
}

export function getLocalPowersTemplateDir(cwd: string = process.cwd()): string {
  const localTemplates = join(cwd, POWER_TEMPLATES_DIR);
  if (existsSync(localTemplates)) return localTemplates;
  const nodeModulesPath = join(cwd, "node_modules", "agent-kit-cli", POWER_TEMPLATES_DIR);
  if (existsSync(nodeModulesPath)) return nodeModulesPath;
  const cliPackageTemplates = join(getCliPackageRoot(), POWER_TEMPLATES_DIR);
  if (existsSync(cliPackageTemplates)) return cliPackageTemplates;
  return localTemplates;
}

export function listAvailablePowers(cwd: string = process.cwd()): PowerInfo[] {
  const templatesDir = getLocalPowersTemplateDir(cwd);
  const powers: PowerInfo[] = [];
  if (!existsSync(templatesDir)) return powers;

  try {
    const entries = readdirSync(templatesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const powerPath = join(templatesDir, entry.name);
      const powerInfo = createPowerInfoFromPackage(powerPath);
      if (powerInfo) powers.push(powerInfo);
    }
  } catch {
    /* ignore */
  }
  return powers;
}

export async function getPowerRegistry(cwd: string = process.cwd()): Promise<PowerManifest> {
  const powers = listAvailablePowers(cwd);
  return { version: "1.0.0", lastUpdated: new Date().toISOString(), powers };
}

export async function fetchPowerRegistry(): Promise<PowerManifest> {
  return getPowerRegistry();
}

export function getInstalledPowers(cwd: string = process.cwd()): InstalledPower[] {
  const installedPath = getKiroPowersInstalledPath(cwd);
  if (!fileExists(installedPath)) return [];
  try {
    const content = readFile(installedPath);
    return JSON.parse(content) as InstalledPower[];
  } catch {
    return [];
  }
}

export function saveInstalledPowers(powers: InstalledPower[], cwd: string = process.cwd()): void {
  const installedPath = getKiroPowersInstalledPath(cwd);
  ensureDir(getKiroPowersDir(cwd));
  writeFile(installedPath, JSON.stringify(powers, null, 2));
}

export function isPowerInstalled(powerName: string, cwd: string = process.cwd()): boolean {
  return getInstalledPowers(cwd).some((power) => power.name === powerName);
}

export function getInstalledPowerVersion(
  powerName: string,
  cwd: string = process.cwd(),
): string | null {
  const power = getInstalledPowers(cwd).find((p) => p.name === powerName);
  return power?.version || null;
}

export function getInstalledPowerMetadata(
  powerName: string,
  cwd: string = process.cwd(),
): PowerMetadata | null {
  const power = getInstalledPowers(cwd).find((p) => p.name === powerName);
  if (!power) return null;
  return {
    name: power.name,
    version: power.version,
    installedAt: power.installedAt,
    components: power.components,
  };
}

export function validatePowerPackage(powerPath: string): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  const packageJsonPath = join(powerPath, POWER_PACKAGE_FILE);
  const powerMdPath = join(powerPath, POWER_MANIFEST_FILE);

  if (!fileExists(packageJsonPath)) {
    result.errors.push("Missing package.json file");
    result.valid = false;
  }
  if (!fileExists(powerMdPath)) {
    result.errors.push("Missing POWER.md file");
    result.valid = false;
  }

  if (fileExists(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFile(packageJsonPath)) as PowerPackageJson;
      if (!pkg.name) {
        result.errors.push("package.json missing 'name' field");
        result.valid = false;
      }
      if (!pkg.version) {
        result.errors.push("package.json missing 'version' field");
        result.valid = false;
      }
    } catch {
      result.errors.push("Invalid package.json format");
      result.valid = false;
    }
  }
  return result;
}

export function readPowerPackageJson(powerPath: string): PowerPackageJson | null {
  const packageJsonPath = join(powerPath, POWER_PACKAGE_FILE);
  if (!fileExists(packageJsonPath)) return null;
  try {
    return JSON.parse(readFile(packageJsonPath)) as PowerPackageJson;
  } catch {
    return null;
  }
}

export function readPowerMcpConfig(powerPath: string): PowerMcpConfig | null {
  const mcpConfigPath = join(powerPath, POWER_MCP_CONFIG_FILE);
  if (!fileExists(mcpConfigPath)) return null;
  try {
    return JSON.parse(readFile(mcpConfigPath)) as PowerMcpConfig;
  } catch {
    return null;
  }
}

export function getPowerDisplayName(powerName: string, cwd: string = process.cwd()): string {
  const powerPath = getKiroPowerInstallDir(powerName, cwd);
  const packageJson = readPowerPackageJson(powerPath);
  return packageJson?.name || powerName;
}

export function getPowerDescription(
  powerName: string,
  cwd: string = process.cwd(),
): string | undefined {
  const powerPath = getKiroPowerInstallDir(powerName, cwd);
  return readPowerPackageJson(powerPath)?.description;
}

export function createInstallResult(): InstallResult {
  return { added: [], skipped: [], errors: [], warnings: [] };
}

export function copyPowerFromTemplate(
  powerName: string,
  targetDir: string,
  cwd: string = process.cwd(),
): void {
  const templatesDir = getLocalPowersTemplateDir(cwd);
  const sourcePath = join(templatesDir, powerName);

  if (!existsSync(sourcePath)) {
    throw new PowerFileSystemError(
      powerName,
      "copy",
      sourcePath,
      `Power '${powerName}' not found in templates`,
    );
  }

  const validation = validatePowerPackage(sourcePath);
  if (!validation.valid) throw new PowerValidationError(powerName, validation.errors);

  ensureDir(targetDir);
  cpSync(sourcePath, targetDir, { recursive: true });
}

export function getProjectPowerTargetDir(powerName: string, cwd: string = process.cwd()): string {
  return join(cwd, powerName);
}

export function checkPowerScaffoldConflicts(
  powerName: string,
  cwd: string = process.cwd(),
): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  const targetDir = getProjectPowerTargetDir(powerName, cwd);

  if (existsSync(targetDir)) {
    const importantFiles = [POWER_MANIFEST_FILE, POWER_PACKAGE_FILE, POWER_MCP_CONFIG_FILE];
    const existingFiles = importantFiles.filter((f) => existsSync(join(targetDir, f)));
    if (existingFiles.length > 0) {
      result.errors.push(
        `Directory '${powerName}' already exists with power files: ${existingFiles.join(", ")}`,
      );
      result.valid = false;
    } else if (readdirSync(targetDir).length > 0) {
      result.warnings.push(`Directory '${powerName}' exists but contains no power files`);
    }
  }
  return result;
}

export function scaffoldPowerToProject(
  powerName: string,
  cwd: string = process.cwd(),
  force = false,
): InstallResult {
  const result = createInstallResult();
  try {
    const templatesDir = getLocalPowersTemplateDir(cwd);
    const sourcePath = join(templatesDir, powerName);

    if (!existsSync(sourcePath)) {
      result.errors.push(`Power template '${powerName}' not found`);
      return result;
    }

    const validation = validatePowerPackage(sourcePath);
    if (!validation.valid) {
      result.errors.push(...validation.errors);
      return result;
    }
    result.warnings.push(...validation.warnings);

    const targetDir = getProjectPowerTargetDir(powerName, cwd);
    const conflicts = checkPowerScaffoldConflicts(powerName, cwd);
    if (!conflicts.valid && !force) {
      result.errors.push(...conflicts.errors);
      return result;
    }
    result.warnings.push(...conflicts.warnings);

    copyPowerFromTemplate(powerName, targetDir, cwd);

    const createdFiles: string[] = [];
    if (existsSync(join(targetDir, POWER_MANIFEST_FILE))) createdFiles.push(POWER_MANIFEST_FILE);
    if (existsSync(join(targetDir, POWER_PACKAGE_FILE))) createdFiles.push(POWER_PACKAGE_FILE);
    if (existsSync(join(targetDir, POWER_MCP_CONFIG_FILE)))
      createdFiles.push(POWER_MCP_CONFIG_FILE);
    if (existsSync(join(targetDir, POWER_STEERING_DIR)))
      createdFiles.push(`${POWER_STEERING_DIR}/`);
    if (existsSync(join(targetDir, POWER_EXAMPLES_DIR)))
      createdFiles.push(`${POWER_EXAMPLES_DIR}/`);
    if (existsSync(join(targetDir, POWER_SERVERS_DIR))) createdFiles.push(`${POWER_SERVERS_DIR}/`);

    result.added.push(`Power scaffolded: ${powerName}`);
    result.added.push(...createdFiles.map((f) => `  ${f}`));
  } catch (error) {
    result.errors.push(
      error instanceof PowerError
        ? error.message
        : `Failed to scaffold power: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
  return result;
}

export async function installMcpServers(
  powerPath: string,
  mcpConfigPath: string,
): Promise<InstallResult> {
  const result = createInstallResult();
  try {
    const powerMcpConfig = readPowerMcpConfig(powerPath);
    if (!powerMcpConfig?.mcpServers) return result;

    let existingConfig: { mcpServers?: Record<string, unknown> } = {};
    if (fileExists(mcpConfigPath)) {
      try {
        existingConfig = JSON.parse(readFile(mcpConfigPath));
      } catch (error) {
        result.errors.push(
          `Failed to parse existing MCP config: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        return result;
      }
    }
    if (!existingConfig.mcpServers) existingConfig.mcpServers = {};

    for (const [serverName, serverConfig] of Object.entries(powerMcpConfig.mcpServers)) {
      if (existingConfig.mcpServers[serverName]) result.skipped.push(serverName);
      else {
        existingConfig.mcpServers[serverName] = serverConfig;
        result.added.push(serverName);
      }
    }

    ensureDir(dirname(mcpConfigPath));
    writeFile(mcpConfigPath, JSON.stringify(existingConfig, null, 2));
  } catch (error) {
    result.errors.push(
      `Failed to install MCP servers: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
  return result;
}

export async function installSteeringFiles(
  powerPath: string,
  steeringDir: string,
): Promise<InstallResult> {
  const result = createInstallResult();
  try {
    const powerSteeringDir = join(powerPath, POWER_STEERING_DIR);
    if (!existsSync(powerSteeringDir)) return result;

    ensureDir(steeringDir);
    const files = readdirSync(powerSteeringDir).filter((file: string) => file.endsWith(".md"));

    for (const fileName of files) {
      const sourcePath = join(powerSteeringDir, fileName);
      const targetPath = join(steeringDir, fileName);
      if (fileExists(targetPath)) result.skipped.push(fileName);
      else {
        try {
          writeFile(targetPath, readFile(sourcePath));
          result.added.push(fileName);
        } catch (error) {
          result.errors.push(
            `Failed to copy ${fileName}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }
    }
  } catch (error) {
    result.errors.push(
      `Failed to install steering files: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
  return result;
}

export async function removeMcpServers(
  powerName: string,
  mcpConfigPath: string,
  cwd: string = process.cwd(),
): Promise<InstallResult> {
  const result = createInstallResult();
  try {
    if (!fileExists(mcpConfigPath)) return result;

    let existingConfig: { mcpServers?: Record<string, unknown> } = {};
    try {
      existingConfig = JSON.parse(readFile(mcpConfigPath));
    } catch (error) {
      result.errors.push(
        `Failed to parse MCP config: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return result;
    }

    if (!existingConfig.mcpServers) return result;

    const powerPath = getKiroPowerInstallDir(powerName, cwd);
    const powerMcpConfig = readPowerMcpConfig(powerPath);
    if (!powerMcpConfig?.mcpServers) return result;

    for (const serverName of Object.keys(powerMcpConfig.mcpServers)) {
      if (existingConfig.mcpServers[serverName]) {
        delete existingConfig.mcpServers[serverName];
        result.added.push(serverName);
      }
    }
    writeFile(mcpConfigPath, JSON.stringify(existingConfig, null, 2));
  } catch (error) {
    result.errors.push(
      `Failed to remove MCP servers: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
  return result;
}

export async function removeSteeringFiles(
  powerName: string,
  steeringDir: string,
  cwd: string = process.cwd(),
): Promise<InstallResult> {
  const result = createInstallResult();
  try {
    const powerPath = getKiroPowerInstallDir(powerName, cwd);
    const powerSteeringDir = join(powerPath, POWER_STEERING_DIR);
    if (!existsSync(powerSteeringDir)) return result;

    const files = readdirSync(powerSteeringDir).filter((file: string) => file.endsWith(".md"));
    for (const fileName of files) {
      const targetPath = join(steeringDir, fileName);
      if (fileExists(targetPath)) {
        try {
          removeFile(targetPath);
          result.added.push(fileName);
        } catch (error) {
          result.errors.push(
            `Failed to remove ${fileName}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }
    }
  } catch (error) {
    result.errors.push(
      `Failed to remove steering files: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
  return result;
}

export function addInstalledPower(
  powerInfo: PowerInfo,
  components: InstalledComponents,
  cwd: string = process.cwd(),
): void {
  const installedPowers = getInstalledPowers(cwd).filter((power) => power.name !== powerInfo.name);
  installedPowers.push({
    name: powerInfo.name,
    version: powerInfo.version,
    installedAt: new Date().toISOString(),
    components,
  });
  saveInstalledPowers(installedPowers, cwd);
}

export async function installPowerFromLocal(
  powerName: string,
  cwd: string = process.cwd(),
): Promise<InstallResult> {
  const result = createInstallResult();
  try {
    const templatesDir = getLocalPowersTemplateDir(cwd);
    const sourcePath = join(templatesDir, powerName);

    if (!existsSync(sourcePath)) {
      result.errors.push(`Power '${powerName}' not found in templates directory`);
      return result;
    }

    const validation = validatePowerPackage(sourcePath);
    if (!validation.valid) {
      result.errors.push(...validation.errors);
      return result;
    }
    result.warnings.push(...validation.warnings);

    const powerInfo = createPowerInfoFromPackage(sourcePath);
    if (!powerInfo) {
      result.errors.push(`Failed to read Power package info`);
      return result;
    }

    // Copy entire power folder to .kiro/powers/<power-name>/
    const powerInstallDir = getKiroPowerInstallDir(powerName, cwd);
    ensureDir(powerInstallDir);
    cpSync(sourcePath, powerInstallDir, { recursive: true });
    result.added.push(`Power folder: ${powerName}`);

    // Merge MCP config into .kiro/settings/mcp.json
    const mcpConfigPath = join(cwd, ".kiro", "settings", "mcp.json");
    const mcpResult = await installMcpServers(powerInstallDir, mcpConfigPath);
    result.added.push(...mcpResult.added.map((s) => `MCP server: ${s}`));
    result.skipped.push(...mcpResult.skipped.map((s) => `MCP server: ${s}`));
    result.errors.push(...mcpResult.errors);

    // Copy steering files to .kiro/steering/
    const steeringDir = join(cwd, ".kiro", "steering");
    const steeringResult = await installSteeringFiles(powerInstallDir, steeringDir);
    result.added.push(...steeringResult.added.map((f) => `Steering file: ${f}`));
    result.skipped.push(...steeringResult.skipped.map((f) => `Steering file: ${f}`));
    result.errors.push(...steeringResult.errors);

    addInstalledPower(
      powerInfo,
      { mcpServers: mcpResult.added, steeringFiles: steeringResult.added },
      cwd,
    );
    result.added.push(`Power: ${powerName}`);
  } catch (error) {
    result.errors.push(
      error instanceof PowerError
        ? error.message
        : `Failed to install Power: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
  return result;
}

export function validatePowerRemoval(
  powerName: string,
  cwd: string = process.cwd(),
): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  if (!isPowerInstalled(powerName, cwd)) {
    result.errors.push(`Power '${powerName}' is not installed`);
    result.valid = false;
    return result;
  }

  const metadata = getInstalledPowerMetadata(powerName, cwd);
  if (metadata?.components) {
    if (metadata.components.mcpServers?.length)
      result.warnings.push(`Will remove ${metadata.components.mcpServers.length} MCP server(s)`);
    if (metadata.components.steeringFiles?.length)
      result.warnings.push(
        `Will remove ${metadata.components.steeringFiles.length} steering file(s)`,
      );
  }
  return result;
}

export async function uninstallPower(
  powerName: string,
  cwd: string = process.cwd(),
): Promise<InstallResult> {
  const result = createInstallResult();
  try {
    if (!isPowerInstalled(powerName, cwd)) {
      result.errors.push(`Power '${powerName}' is not installed`);
      return result;
    }

    const metadata = getInstalledPowerMetadata(powerName, cwd);
    if (!metadata) {
      result.errors.push(`Could not get metadata for Power '${powerName}'`);
      return result;
    }

    const mcpConfigPath = join(cwd, ".kiro", "settings", "mcp.json");
    const mcpResult = await removeMcpServers(powerName, mcpConfigPath, cwd);
    result.added.push(...mcpResult.added.map((s) => `MCP server: ${s}`));
    result.errors.push(...mcpResult.errors);

    const steeringDir = join(cwd, ".kiro", "steering");
    const steeringResult = await removeSteeringFiles(powerName, steeringDir, cwd);
    result.added.push(...steeringResult.added.map((f) => `Steering file: ${f}`));
    result.errors.push(...steeringResult.errors);

    // Remove power folder from .kiro/powers/<power-name>/
    const powerInstallDir = getKiroPowerInstallDir(powerName, cwd);
    if (existsSync(powerInstallDir)) {
      removeFile(powerInstallDir);
      result.added.push(`Power folder: ${powerName}`);
    }

    const updatedPowers = getInstalledPowers(cwd).filter((power) => power.name !== powerName);
    saveInstalledPowers(updatedPowers, cwd);
    result.added.push(`Power: ${powerName}`);
  } catch (error) {
    result.errors.push(
      `Failed to uninstall Power '${powerName}': ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
  return result;
}

export async function uninstallPowerWithErrorHandling(
  powerName: string,
  cwd: string = process.cwd(),
): Promise<InstallResult> {
  return uninstallPower(powerName, cwd);
}

export function createPowerInfoFromPackage(powerPath: string): PowerInfo | null {
  const packageJson = readPowerPackageJson(powerPath);
  if (!packageJson) return null;

  const components: PowerComponents = { mcpServers: [], steeringFiles: [], examples: [] };

  const mcpConfig = readPowerMcpConfig(powerPath);
  if (mcpConfig?.mcpServers) {
    components.mcpServers = Object.entries(mcpConfig.mcpServers).map(([name, config]) => ({
      name,
      description: config.description || `MCP server: ${name}`,
      command: config.command,
      args: config.args,
      env: config.env,
    }));
  }

  const steeringDir = join(powerPath, POWER_STEERING_DIR);
  if (existsSync(steeringDir)) {
    try {
      components.steeringFiles = readdirSync(steeringDir)
        .filter((file: string) => file.endsWith(".md"))
        .map((file: string) => ({
          name: file,
          description: `Steering file: ${file}`,
          category: "guide",
        }));
    } catch {
      /* ignore */
    }
  }

  const examplesDir = join(powerPath, POWER_EXAMPLES_DIR);
  if (existsSync(examplesDir)) {
    try {
      components.examples = readdirSync(examplesDir)
        .filter((file: string) => file.endsWith(".md"))
        .map((file: string) => ({
          name: file,
          description: `Example: ${file}`,
          category: "example",
        }));
    } catch {
      /* ignore */
    }
  }

  return {
    name: packageJson.name,
    displayName: packageJson.displayName || packageJson.name,
    description: packageJson.description || "",
    version: packageJson.version,
    author: packageJson.author || "",
    keywords: packageJson.keywords || [],
    repository: packageJson.repository || "",
    downloadUrl: "",
    components,
  };
}

export function validatePowerCompatibility(powerInfo: PowerInfo): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  if (powerInfo.requirements?.node) {
    const currentNodeVersion = process.version;
    const requiredVersion = powerInfo.requirements.node;
    if (requiredVersion.includes(">=")) {
      const minVersion = requiredVersion.replace(">=", "").trim();
      if (currentNodeVersion < `v${minVersion}`) {
        result.errors.push(`Requires Node.js ${requiredVersion}, current: ${currentNodeVersion}`);
        result.valid = false;
      }
    }
  }
  return result;
}

export function validateRegistryManifest(data: unknown): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  if (!data || typeof data !== "object") {
    result.errors.push("Registry manifest must be an object");
    result.valid = false;
    return result;
  }
  const manifest = data as Record<string, unknown>;
  if (!manifest.version || typeof manifest.version !== "string") {
    result.errors.push("Registry manifest missing or invalid 'version' field");
    result.valid = false;
  }
  if (!Array.isArray(manifest.powers)) {
    result.errors.push("Registry manifest missing or invalid 'powers' array");
    result.valid = false;
  }
  return result;
}

// ============================================================================
// POWER MANAGER CLASS
// ============================================================================

export class PowerManagerImpl implements PowerManager {
  constructor(private cwd: string = process.cwd()) {}

  async listInstalled(): Promise<InstalledPower[]> {
    return getInstalledPowers(this.cwd);
  }
  isInstalled(powerName: string): boolean {
    return isPowerInstalled(powerName, this.cwd);
  }
  getInstalledVersion(powerName: string): string | null {
    return getInstalledPowerVersion(powerName, this.cwd);
  }

  async uninstall(powerName: string): Promise<void> {
    const result = await uninstallPower(powerName, this.cwd);
    if (result.errors.length > 0)
      throw new Error(`Failed to uninstall Power '${powerName}': ${result.errors.join(", ")}`);
  }

  async update(_powerName: string): Promise<void> {
    throw new Error("Power update functionality not yet implemented");
  }
  async getMetadata(powerName: string): Promise<PowerMetadata | null> {
    return getInstalledPowerMetadata(powerName, this.cwd);
  }

  async installLocalPower(powerPath: string, powerName: string): Promise<void> {
    const packageJsonPath = join(powerPath, "package.json");
    if (!fileExists(packageJsonPath))
      throw new Error(`Invalid Power: package.json not found at ${packageJsonPath}`);

    const powerInfo = createPowerInfoFromPackage(powerPath);
    if (!powerInfo) throw new Error(`Failed to read Power package info from ${powerPath}`);

    // Copy entire power folder to .kiro/powers/<power-name>/
    const powerInstallDir = getKiroPowerInstallDir(powerName, this.cwd);
    ensureDir(powerInstallDir);
    cpSync(powerPath, powerInstallDir, { recursive: true });

    // Merge MCP config into .kiro/settings/mcp.json
    const mcpConfigPath = join(this.cwd, ".kiro", "settings", "mcp.json");
    await installMcpServers(powerInstallDir, mcpConfigPath);

    // Copy steering files to .kiro/steering/
    const steeringDir = join(this.cwd, ".kiro", "steering");
    await installSteeringFiles(powerInstallDir, steeringDir);

    const components: InstalledComponents = { mcpServers: [], steeringFiles: [] };
    const mcpConfig = readPowerMcpConfig(powerInstallDir);
    if (mcpConfig?.mcpServers) components.mcpServers = Object.keys(mcpConfig.mcpServers);

    const powerSteeringDir = join(powerInstallDir, "steering");
    if (existsSync(powerSteeringDir))
      components.steeringFiles = readdirSync(powerSteeringDir).filter((f: string) =>
        f.endsWith(".md"),
      );

    addInstalledPower(powerInfo, components, this.cwd);
  }
}

// ============================================================================
// POWER DEV UTILITIES
// ============================================================================

interface PowerStructureInfo {
  hasPackageJson: boolean;
  hasPowerMd: boolean;
  hasMcpConfig: boolean;
  hasSteeringFiles: boolean;
  hasExamples: boolean;
  hasServers: boolean;
  fileCount: { steering: number; examples: number; servers: number };
  mcpServerCount: number;
}

interface PowerStructureResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  structure: PowerStructureInfo;
}

export class PowerDevUtils {
  constructor(_cwd: string = process.cwd()) {}

  async validatePowerForDevelopment(powerPath: string): Promise<PowerStructureResult> {
    const result: PowerStructureResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      structure: {
        hasPackageJson: false,
        hasPowerMd: false,
        hasMcpConfig: false,
        hasSteeringFiles: false,
        hasExamples: false,
        hasServers: false,
        fileCount: { steering: 0, examples: 0, servers: 0 },
        mcpServerCount: 0,
      },
    };

    if (!fileExists(powerPath)) {
      result.errors.push("Power path does not exist");
      result.valid = false;
      return result;
    }

    result.structure = await this.analyzePowerStructure(powerPath);
    const validation = validatePowerComprehensive(powerPath);
    result.errors.push(...validation.errors);
    result.warnings.push(...validation.warnings);
    if (!validation.valid) result.valid = false;
    result.suggestions = this.generateDevelopmentSuggestions(result.structure);

    return result;
  }

  private async analyzePowerStructure(powerPath: string): Promise<PowerStructureInfo> {
    const structure: PowerStructureInfo = {
      hasPackageJson: false,
      hasPowerMd: false,
      hasMcpConfig: false,
      hasSteeringFiles: false,
      hasExamples: false,
      hasServers: false,
      fileCount: { steering: 0, examples: 0, servers: 0 },
      mcpServerCount: 0,
    };

    structure.hasPackageJson = fileExists(join(powerPath, POWER_PACKAGE_FILE));
    structure.hasPowerMd = fileExists(join(powerPath, POWER_MANIFEST_FILE));
    structure.hasMcpConfig = fileExists(join(powerPath, POWER_MCP_CONFIG_FILE));

    const steeringDir = join(powerPath, POWER_STEERING_DIR);
    if (fileExists(steeringDir)) {
      structure.hasSteeringFiles = true;
      structure.fileCount.steering = this.countFiles(steeringDir, ".md");
    }

    const examplesDir = join(powerPath, POWER_EXAMPLES_DIR);
    if (fileExists(examplesDir)) {
      structure.hasExamples = true;
      structure.fileCount.examples = this.countFiles(examplesDir, ".md");
    }

    const serversDir = join(powerPath, POWER_SERVERS_DIR);
    if (fileExists(serversDir)) {
      structure.hasServers = true;
      structure.fileCount.servers = this.countFiles(serversDir, ".js", ".ts", ".py");
    }

    if (structure.hasMcpConfig) {
      const mcpConfig = readPowerMcpConfig(powerPath);
      if (mcpConfig) structure.mcpServerCount = Object.keys(mcpConfig.mcpServers).length;
    }

    return structure;
  }

  private countFiles(dirPath: string, ...extensions: string[]): number {
    try {
      const fs = require("fs");
      return fs
        .readdirSync(dirPath)
        .filter((file: string) => extensions.some((ext) => file.endsWith(ext))).length;
    } catch {
      return 0;
    }
  }

  private generateDevelopmentSuggestions(structure: PowerStructureInfo): string[] {
    const suggestions: string[] = [];
    if (!structure.hasPackageJson)
      suggestions.push("Create a package.json file with Power metadata");
    if (!structure.hasPowerMd) suggestions.push("Create a POWER.md file with documentation");
    if (!structure.hasMcpConfig && !structure.hasSteeringFiles && !structure.hasExamples)
      suggestions.push("Add at least one component: MCP servers, steering files, or examples");
    return suggestions;
  }
}

export function createPowerDevUtils(cwd?: string): PowerDevUtils {
  return new PowerDevUtils(cwd);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getPowerComponentInfo(powerInfo: PowerInfo): {
  mcpServerCount: number;
  steeringFileCount: number;
  exampleCount: number;
  hasRequirements: boolean;
} {
  return {
    mcpServerCount: powerInfo.components.mcpServers.length,
    steeringFileCount: powerInfo.components.steeringFiles.length,
    exampleCount: powerInfo.components.examples?.length || 0,
    hasRequirements: Boolean(powerInfo.requirements),
  };
}

export function formatPowerRequirements(requirements?: PowerRequirements): string[] {
  if (!requirements) return [];
  const formatted: string[] = [];
  if (requirements.node) formatted.push(`Node.js ${requirements.node}`);
  if (requirements.dependencies?.length)
    formatted.push(`Dependencies: ${requirements.dependencies.join(", ")}`);
  if (requirements.environment?.length)
    formatted.push(`Environment: ${requirements.environment.join(", ")}`);
  return formatted;
}

export const CacheUtils = {
  formatCacheSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },
  calculateHitRatio(stats: { hits: number; misses: number }): number {
    const total = stats.hits + stats.misses;
    return total > 0 ? stats.hits / total : 0;
  },
};

// Backward compatibility aliases
export { PowerDevUtils as PowerDevUtilsImpl };
export const PowerTestUtils = {
  async createTestPower(
    name: string,
    _options: { includeMcp?: boolean; includeSteering?: boolean; includeExamples?: boolean } = {},
  ): Promise<{ path: string; cleanup: () => void }> {
    const os = require("os");
    const fs = require("fs");
    const tempDir = fs.mkdtempSync(join(os.tmpdir(), `test-power-${name}-`));
    return {
      path: join(tempDir, name),
      cleanup: () => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {
          /* ignore */
        }
      },
    };
  },
  async validateTestPower(powerPath: string): Promise<ValidationResult> {
    const devUtils = new PowerDevUtils();
    const result = await devUtils.validatePowerForDevelopment(powerPath);
    return { valid: result.valid, errors: result.errors, warnings: result.warnings };
  },
};
