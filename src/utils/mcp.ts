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

export function mergeMcpConfig(existing: McpConfig | null, newServers: Record<string, McpServer>): McpConfig {
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

export function installMcpServers(
  configPath: string,
  selectedServers: string[],
  target?: InstructionTarget,
): { added: string[]; skipped: string[] } {
  const result = { added: [] as string[], skipped: [] as string[] };
  
  if (selectedServers.length === 0) {
    return result;
  }

  // Use VS Code format for github-copilot target
  if (target === "github-copilot") {
    return installVsCodeMcpServers(configPath, selectedServers);
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

    newServers[serverName] = template.config;
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

    newServers[serverName] = template.vsCodeConfig;
    
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