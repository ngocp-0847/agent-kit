export interface PowerManifest {
  powers: PowerInfo[];
  version: string;
  lastUpdated: string;
}

export interface PowerInfo {
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  keywords: string[];
  repository: string;
  downloadUrl: string;
  components: PowerComponents;
  requirements?: PowerRequirements;
  setupInstructions?: string;
}

export interface PowerComponents {
  mcpServers: McpServerInfo[];
  steeringFiles: SteeringFileInfo[];
  examples?: ExampleInfo[];
}

export interface McpServerInfo {
  name: string;
  description: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface SteeringFileInfo {
  name: string;
  description: string;
  category: string;
}

export interface ExampleInfo {
  name: string;
  description: string;
  category: string;
}

export interface PowerRequirements {
  node?: string;
  dependencies?: string[];
  environment?: string[];
}

export interface PowerInstaller {
  downloadPower(powerInfo: PowerInfo): Promise<string>;
  extractPower(archivePath: string, targetDir: string): Promise<void>;
  installMcpServers(powerPath: string, mcpConfigPath: string): Promise<InstallResult>;
  installSteeringFiles(powerPath: string, steeringDir: string): Promise<InstallResult>;
  validatePower(powerPath: string): Promise<ValidationResult>;
}

export interface InstallResult {
  added: string[];
  skipped: string[];
  errors: string[];
  warnings: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PowerManager {
  listInstalled(): Promise<InstalledPower[]>;
  isInstalled(powerName: string): boolean;
  getInstalledVersion(powerName: string): string | null;
  uninstall(powerName: string): Promise<void>;
  update(powerName: string): Promise<void>;
  getMetadata(powerName: string): Promise<PowerMetadata | null>;
}

export interface InstalledPower {
  name: string;
  version: string;
  installedAt: string;
  components: InstalledComponents;
}

export interface InstalledComponents {
  mcpServers: string[];
  steeringFiles: string[];
}

export interface PowerMetadata {
  name: string;
  version: string;
  installedAt: string;
  components: InstalledComponents;
  powerInfo?: PowerInfo;
}

export interface PowerPackageJson {
  name: string;
  version: string;
  displayName?: string;
  description?: string;
  author?: string;
  repository?: string;
  keywords?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  engines?: {
    node?: string;
  };
}

export interface PowerMcpConfig {
  mcpServers: Record<string, McpServerInfo>;
}
