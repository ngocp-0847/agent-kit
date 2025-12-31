import { join } from "node:path";
import * as p from "@clack/prompts";
import type { InstructionTarget } from "../types/init";
import { ensureDir, fileExists, readFile, writeFile } from "./fs";

// ============================================
// Standard MCP Config (Cursor, Kiro, etc.)
// ============================================

export interface McpServer {
  command: string;
  args: string[];
  env?: Record<string, string>;
  disabled?: boolean;
  autoApprove?: string[];
}

export interface McpConfig {
  mcpServers: Record<string, McpServer>;
}

// ============================================
// VS Code MCP Config (GitHub Copilot)
// ============================================

export interface VsCodeMcpServer {
  type: "stdio" | "http" | "sse";
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  envFile?: string;
  url?: string;
  headers?: Record<string, string>;
}

export interface VsCodeMcpInput {
  type: "promptString";
  id: string;
  description: string;
  password?: boolean;
}

export interface VsCodeMcpConfig {
  servers: Record<string, VsCodeMcpServer>;
  inputs?: VsCodeMcpInput[];
}

// ============================================
// Server Template Definition
// ============================================

export interface McpServerPromptOption {
  value: string;
  label: string;
  hint?: string;
}

export interface McpServerPrompt {
  id: string;
  type: "select" | "multiselect";
  message: string;
  options: McpServerPromptOption[];
  defaultValue?: string | string[];
  /** Prefix for CLI args (e.g., "--browser" generates "--browser chrome") */
  argPrefix?: string;
  /** If true, each selected value becomes a separate arg pair */
  multipleArgs?: boolean;
}

export interface McpServerTemplate {
  name: string;
  displayName: string;
  description: string;
  config: McpServer;
  /** VS Code specific config with type field */
  vsCodeConfig: VsCodeMcpServer;
  /** Environment variables that require user input (for VS Code inputs) */
  requiredInputs?: Array<{
    envKey: string;
    id: string;
    description: string;
    password?: boolean;
  }>;
  setupInstructions?: string;
  /** Custom prompts for server-specific options (browser, mode, capabilities) */
  customPrompts?: McpServerPrompt[];
}

// Predefined MCP server templates
export const MCP_SERVER_TEMPLATES: Record<string, McpServerTemplate> = {
  context7: {
    name: "context7",
    displayName: "Context7",
    description: "Context7 MCP server for fetching up-to-date library documentation",
    config: {
      command: "npx",
      args: ["-y", "@upstash/context7-mcp"],
      env: {
        FASTMCP_LOG_LEVEL: "ERROR",
      },
      disabled: false,
      autoApprove: [],
    },
    vsCodeConfig: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@upstash/context7-mcp"],
      env: {
        FASTMCP_LOG_LEVEL: "ERROR",
      },
    },
    setupInstructions: `
To use Context7 MCP server, you need to:

1. Ensure you have Node.js and npm installed for npx command
2. The server will be automatically available after installation.

For more information, visit: https://github.com/upstash/context7-mcp
    `.trim(),
  },
  serena: {
    name: "serena",
    displayName: "Serena",
    description:
      "Serena MCP server - IDE-like semantic code retrieval and editing tools for AI coding agents",
    config: {
      command: "uvx",
      args: [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--context",
        "ide",
      ],
      env: {},
      disabled: false,
      autoApprove: [],
    },
    vsCodeConfig: {
      type: "stdio",
      command: "uvx",
      args: [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--context",
        "ide",
        "--project",
        "${workspaceFolder}",
      ],
    },
    setupInstructions: `
To use Serena MCP server, you need to:

1. Install uv and uvx:
   - Visit https://docs.astral.sh/uv/getting-started/installation/
   - Or use: curl -LsSf https://astral.sh/uv/install.sh | sh

2. The server will automatically download and run from GitHub.

3. Some language servers may require additional dependencies:
   - See https://oraios.github.io/serena/01-about/020_programming-languages.html

Serena provides semantic code retrieval and editing tools:
- find_symbol, find_referencing_symbols
- insert_after_symbol, replace_symbol_body
- Supports 30+ programming languages via LSP

For more information: https://oraios.github.io/serena/
    `.trim(),
  },
  playwright: {
    name: "playwright",
    displayName: "Playwright",
    description: "Browser automation via Playwright for web testing and interaction",
    config: {
      command: "npx",
      args: ["@playwright/mcp@latest"],
      env: {},
      disabled: false,
      autoApprove: [],
    },
    vsCodeConfig: {
      type: "stdio",
      command: "npx",
      args: ["@playwright/mcp@latest"],
    },
    setupInstructions: `
⚠️  REQUIREMENT: Node.js >= 18 is required for Playwright MCP.

To use Playwright MCP server:

1. Ensure you have Node.js 18+ installed:
   node --version  # Should show v18.x.x or higher

2. The server will be automatically available after installation.

3. The browser will open in headed mode by default (you can see it).

Playwright MCP provides browser automation tools:
- browser_navigate, browser_click, browser_type
- browser_fill_form, browser_snapshot, browser_take_screenshot
- browser_tabs (list, create, close, select tabs)

For more information: https://github.com/microsoft/playwright-mcp
    `.trim(),
    customPrompts: [
      {
        id: "browser",
        type: "select",
        message: "Select browser to use:",
        options: [
          { value: "chrome", label: "Chrome", hint: "Google Chrome (recommended)" },
          { value: "chromium", label: "Chromium", hint: "Playwright's bundled Chromium" },
          { value: "firefox", label: "Firefox", hint: "Mozilla Firefox" },
          { value: "webkit", label: "WebKit", hint: "Safari's rendering engine" },
          { value: "msedge", label: "Microsoft Edge", hint: "Chromium-based Edge" },
        ],
        defaultValue: "chrome",
        argPrefix: "--browser",
      },
      {
        id: "mode",
        type: "select",
        message: "Select browser mode:",
        options: [
          { value: "headed", label: "Headed", hint: "Browser window visible (default)" },
          { value: "headless", label: "Headless", hint: "No visible browser window" },
        ],
        defaultValue: "headed",
        argPrefix: "",
      },
      {
        id: "capabilities",
        type: "multiselect",
        message: "Select additional capabilities:",
        options: [
          {
            value: "vision",
            label: "Vision",
            hint: "Enable screenshot and coordinate-based interactions",
          },
          { value: "pdf", label: "PDF", hint: "Enable PDF generation" },
          { value: "testing", label: "Testing", hint: "Enable test assertions (expect)" },
          { value: "tracing", label: "Tracing", hint: "Enable Playwright tracing for debugging" },
        ],
        defaultValue: [],
        argPrefix: "--caps",
        multipleArgs: true,
      },
    ],
  },
  "playwright-headless": {
    name: "playwright-headless",
    displayName: "Playwright (Headless)",
    description: "Headless browser automation with Playwright - no visible browser window",
    config: {
      command: "npx",
      args: ["@playwright/mcp@latest", "--headless", "--browser", "chrome"],
      env: {},
      disabled: false,
      autoApprove: [],
    },
    vsCodeConfig: {
      type: "stdio",
      command: "npx",
      args: ["@playwright/mcp@latest", "--headless", "--browser", "chrome"],
    },
    setupInstructions: `
⚠️  REQUIREMENT: Node.js >= 18 is required for Playwright MCP.

Playwright Headless preset:
- Runs Chrome in headless mode (no visible browser window)
- Ideal for CI/CD pipelines and background automation

For more information: https://github.com/microsoft/playwright-mcp
    `.trim(),
  },
  "playwright-testing": {
    name: "playwright-testing",
    displayName: "Playwright (Testing)",
    description: "Playwright with testing capabilities - includes expect assertions",
    config: {
      command: "npx",
      args: ["@playwright/mcp@latest", "--browser", "chrome", "--caps", "testing"],
      env: {},
      disabled: false,
      autoApprove: [],
    },
    vsCodeConfig: {
      type: "stdio",
      command: "npx",
      args: ["@playwright/mcp@latest", "--browser", "chrome", "--caps", "testing"],
    },
    setupInstructions: `
⚠️  REQUIREMENT: Node.js >= 18 is required for Playwright MCP.

Playwright Testing preset:
- Uses Chrome browser in headed mode
- Includes testing capabilities (expect assertions)
- Ideal for E2E testing workflows

For more information: https://github.com/microsoft/playwright-mcp
    `.trim(),
  },
  "playwright-vision": {
    name: "playwright-vision",
    displayName: "Playwright (Vision)",
    description:
      "Playwright with vision capabilities - screenshot and coordinate-based interactions",
    config: {
      command: "npx",
      args: ["@playwright/mcp@latest", "--browser", "chrome", "--caps", "vision"],
      env: {},
      disabled: false,
      autoApprove: [],
    },
    vsCodeConfig: {
      type: "stdio",
      command: "npx",
      args: ["@playwright/mcp@latest", "--browser", "chrome", "--caps", "vision"],
    },
    setupInstructions: `
⚠️  REQUIREMENT: Node.js >= 18 is required for Playwright MCP.

Playwright Vision preset:
- Uses Chrome browser in headed mode
- Includes vision capabilities (screenshots, coordinate-based clicks)
- Useful when element selectors are unreliable

For more information: https://github.com/microsoft/playwright-mcp
    `.trim(),
  },
};

export function getKiroMcpConfigPath(cwd: string = process.cwd()): string {
  return join(cwd, ".kiro", "settings", "mcp.json");
}

export function getCursorMcpConfigPath(cwd: string = process.cwd()): string {
  return join(cwd, ".cursor", "settings", "mcp.json");
}

export function getCopilotMcpConfigPath(cwd: string = process.cwd()): string {
  return join(cwd, ".vscode", "mcp.json");
}

export function getAntiGravityMcpConfigPath(cwd: string = process.cwd()): string {
  return join(cwd, ".agent", "settings", "mcp.json");
}

export function getMcpConfigPath(target: InstructionTarget, cwd: string = process.cwd()): string {
  switch (target) {
    case "cursor":
      return getCursorMcpConfigPath(cwd);
    case "github-copilot":
      return getCopilotMcpConfigPath(cwd);
    case "google-antigravity":
      return getAntiGravityMcpConfigPath(cwd);
    case "kiro":
      return getKiroMcpConfigPath(cwd);
    default:
      return getCopilotMcpConfigPath(cwd); // Default to VSCode Copilot
  }
}

export function readMcpConfig(configPath: string): McpConfig | null {
  if (!fileExists(configPath)) {
    return null;
  }

  try {
    const content = readFile(configPath);
    return JSON.parse(content) as McpConfig;
  } catch {
    return null;
  }
}

export function readVsCodeMcpConfig(configPath: string): VsCodeMcpConfig | null {
  if (!fileExists(configPath)) {
    return null;
  }

  try {
    const content = readFile(configPath);
    return JSON.parse(content) as VsCodeMcpConfig;
  } catch {
    return null;
  }
}

export function writeMcpConfig(configPath: string, config: McpConfig): void {
  ensureDir(join(configPath, ".."));
  writeFile(configPath, JSON.stringify(config, null, 2));
}

export function writeVsCodeMcpConfig(configPath: string, config: VsCodeMcpConfig): void {
  ensureDir(join(configPath, ".."));
  writeFile(configPath, JSON.stringify(config, null, 2));
}

export function mergeMcpConfig(
  existing: McpConfig | null,
  newServers: Record<string, McpServer>,
): McpConfig {
  const base: McpConfig = existing || { mcpServers: {} };

  return {
    mcpServers: {
      ...base.mcpServers,
      ...newServers,
    },
  };
}

export function mergeVsCodeMcpConfig(
  existing: VsCodeMcpConfig | null,
  newServers: Record<string, VsCodeMcpServer>,
  newInputs: VsCodeMcpInput[],
): VsCodeMcpConfig {
  const base: VsCodeMcpConfig = existing || { servers: {} };
  const existingInputs = base.inputs || [];

  // Merge inputs, avoiding duplicates by id
  const existingInputIds = new Set(existingInputs.map((input) => input.id));
  const uniqueNewInputs = newInputs.filter((input) => !existingInputIds.has(input.id));

  return {
    servers: {
      ...base.servers,
      ...newServers,
    },
    inputs: [...existingInputs, ...uniqueNewInputs],
  };
}

export async function promptMcpServerSelection(): Promise<string[] | symbol> {
  const availableServers = Object.keys(MCP_SERVER_TEMPLATES);

  const selectionMode = await p.select({
    message: "How would you like to add MCP servers?",
    options: [
      {
        value: "all",
        label: `Add all ${availableServers.length} MCP servers`,
        hint: "Install all available servers",
      },
      {
        value: "select",
        label: "Select specific servers",
        hint: "Choose which servers to install",
      },
      {
        value: "none",
        label: "Skip MCP server setup",
        hint: "Don't install any MCP servers",
      },
    ],
  });

  if (p.isCancel(selectionMode)) return selectionMode;

  if (selectionMode === "none") {
    return [];
  }

  if (selectionMode === "all") {
    return availableServers;
  }

  const selectedServers = await p.multiselect({
    message: "Select MCP servers to add:",
    options: availableServers.map((serverName) => {
      const template = MCP_SERVER_TEMPLATES[serverName];
      return {
        value: serverName,
        label: template.displayName,
        hint: template.description,
      };
    }),
    required: false,
  });

  return selectedServers as string[] | symbol;
}

/**
 * Prompt user for server-specific options defined in customPrompts
 * Returns additional args to append to the server config
 */
export async function promptServerOptions(serverName: string): Promise<string[] | symbol> {
  const template = MCP_SERVER_TEMPLATES[serverName];
  if (!template?.customPrompts || template.customPrompts.length === 0) {
    return [];
  }

  const additionalArgs: string[] = [];

  for (const prompt of template.customPrompts) {
    if (prompt.type === "select") {
      const result = await p.select({
        message: prompt.message,
        options: prompt.options.map((opt) => ({
          value: opt.value,
          label: opt.label,
          hint: opt.hint,
        })),
        initialValue: prompt.defaultValue as string | undefined,
      });

      if (p.isCancel(result)) {
        return result;
      }

      // Handle special cases
      if (prompt.id === "mode") {
        // Only add --headless flag if headless mode selected
        if (result === "headless") {
          additionalArgs.push("--headless");
        }
        // headed mode is default, no flag needed
      } else if (prompt.argPrefix && result) {
        additionalArgs.push(prompt.argPrefix, result as string);
      }
    } else if (prompt.type === "multiselect") {
      const result = await p.multiselect({
        message: prompt.message,
        options: prompt.options.map((opt) => ({
          value: opt.value,
          label: opt.label,
          hint: opt.hint,
        })),
        initialValues: (prompt.defaultValue as string[]) || [],
        required: false,
      });

      if (p.isCancel(result)) {
        return result;
      }

      const selectedValues = result as string[];
      if (selectedValues.length > 0 && prompt.argPrefix) {
        if (prompt.multipleArgs) {
          // Each value becomes a separate --caps value pair
          for (const value of selectedValues) {
            additionalArgs.push(prompt.argPrefix, value);
          }
        } else {
          // All values as single comma-separated arg
          additionalArgs.push(prompt.argPrefix, selectedValues.join(","));
        }
      }
    }
  }

  return additionalArgs;
}

/** Store custom args for servers that have been configured via prompts */
export type ServerCustomArgs = Record<string, string[]>;

export function installMcpServers(
  configPath: string,
  selectedServers: string[],
  target?: InstructionTarget,
  customArgs?: ServerCustomArgs,
): { added: string[]; skipped: string[] } {
  const result = { added: [] as string[], skipped: [] as string[] };

  if (selectedServers.length === 0) {
    return result;
  }

  // Use VS Code format for github-copilot target
  if (target === "github-copilot") {
    return installVsCodeMcpServers(configPath, selectedServers, customArgs);
  }

  const existingConfig = readMcpConfig(configPath);
  const newServers: Record<string, McpServer> = {};

  for (const serverName of selectedServers) {
    const template = MCP_SERVER_TEMPLATES[serverName];
    if (!template) continue;

    // Check if server already exists
    if (existingConfig?.mcpServers[serverName]) {
      result.skipped.push(serverName);
      continue;
    }

    // Clone config and append custom args if provided
    const serverConfig = { ...template.config };
    if (customArgs?.[serverName]) {
      serverConfig.args = [...template.config.args, ...customArgs[serverName]];
    }

    newServers[serverName] = serverConfig;
    result.added.push(serverName);
  }

  if (Object.keys(newServers).length > 0) {
    const mergedConfig = mergeMcpConfig(existingConfig, newServers);
    writeMcpConfig(configPath, mergedConfig);
  }

  return result;
}

/**
 * Install MCP servers using VS Code format (.vscode/mcp.json)
 * This format uses "servers" instead of "mcpServers" and supports input variables
 */
export function installVsCodeMcpServers(
  configPath: string,
  selectedServers: string[],
  customArgs?: ServerCustomArgs,
): { added: string[]; skipped: string[] } {
  const result = { added: [] as string[], skipped: [] as string[] };

  if (selectedServers.length === 0) {
    return result;
  }

  const existingConfig = readVsCodeMcpConfig(configPath);
  const newServers: Record<string, VsCodeMcpServer> = {};
  const newInputs: VsCodeMcpInput[] = [];

  for (const serverName of selectedServers) {
    const template = MCP_SERVER_TEMPLATES[serverName];
    if (!template) continue;

    // Check if server already exists
    if (existingConfig?.servers[serverName]) {
      result.skipped.push(serverName);
      continue;
    }

    // Clone config and append custom args if provided
    const serverConfig = { ...template.vsCodeConfig };
    if (customArgs?.[serverName]) {
      serverConfig.args = [...(template.vsCodeConfig.args || []), ...customArgs[serverName]];
    }

    newServers[serverName] = serverConfig;

    // Collect required inputs
    if (template.requiredInputs) {
      for (const input of template.requiredInputs) {
        newInputs.push({
          type: "promptString",
          id: input.id,
          description: input.description,
          password: input.password,
        });
      }
    }

    result.added.push(serverName);
  }

  if (Object.keys(newServers).length > 0) {
    const mergedConfig = mergeVsCodeMcpConfig(existingConfig, newServers, newInputs);
    writeVsCodeMcpConfig(configPath, mergedConfig);
  }

  return result;
}

export function getMcpServerSetupInstructions(serverNames: string[]): string {
  let instructions = "# MCP Server Setup Instructions\n\n";

  for (const serverName of serverNames) {
    const template = MCP_SERVER_TEMPLATES[serverName];
    if (template?.setupInstructions) {
      instructions += `## ${template.displayName}\n\n`;
      instructions += template.setupInstructions + "\n\n";
    }
  }

  return instructions;
}

export interface ConfiguredMcpServer {
  name: string;
  configPath: string;
}

/**
 * Get list of configured MCP servers from the config file
 * Handles both VS Code format (github-copilot) and standard format (cursor, kiro, etc.)
 */
export function getConfiguredMcpServers(
  target: InstructionTarget,
  cwd: string = process.cwd(),
): ConfiguredMcpServer[] {
  const configPath = getMcpConfigPath(target, cwd);

  if (target === "github-copilot") {
    const config = readVsCodeMcpConfig(configPath);
    if (!config?.servers) return [];
    return Object.keys(config.servers).map((name) => ({ name, configPath }));
  }

  const config = readMcpConfig(configPath);
  if (!config?.mcpServers) return [];
  return Object.keys(config.mcpServers).map((name) => ({ name, configPath }));
}

/**
 * Remove an MCP server from the config file
 * Leaves empty structure to preserve file for future additions
 */
export function removeMcpServer(
  target: InstructionTarget,
  serverName: string,
  cwd: string = process.cwd(),
): boolean {
  const configPath = getMcpConfigPath(target, cwd);

  if (target === "github-copilot") {
    const config = readVsCodeMcpConfig(configPath);
    if (!config?.servers[serverName]) return false;

    delete config.servers[serverName];
    writeVsCodeMcpConfig(configPath, config);
    return true;
  }

  const config = readMcpConfig(configPath);
  if (!config?.mcpServers[serverName]) return false;

  delete config.mcpServers[serverName];
  writeMcpConfig(configPath, config);
  return true;
}
