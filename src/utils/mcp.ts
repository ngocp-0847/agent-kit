import { join } from "node:path";
import * as p from "@clack/prompts";
import type { InstructionTarget } from "../types/init";
import { ensureDir, fileExists, readFile, writeFile } from "./fs";

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

export interface McpServerTemplate {
  name: string;
  displayName: string;
  description: string;
  config: McpServer;
  setupInstructions?: string;
}

// Predefined MCP server templates
export const MCP_SERVER_TEMPLATES: Record<string, McpServerTemplate> = {
  context7: {
    name: "context7",
    displayName: "Context7",
    description: "Upstash Context7 MCP server for vector search and context management",
    config: {
      command: "npx -y @upstash/context7-mcp",
      args: [],
      env: {
        FASTMCP_LOG_LEVEL: "ERROR",
        // Users need to set these environment variables
        UPSTASH_VECTOR_REST_URL: "",
        UPSTASH_VECTOR_REST_TOKEN: "",
      },
      disabled: false,
      autoApprove: [],
    },
    setupInstructions: `
To use Context7 MCP server, you need to:

1. Create an Upstash Vector database at https://console.upstash.com/vector
2. Set the following environment variables:
   - UPSTASH_VECTOR_REST_URL: Your vector database REST URL
   - UPSTASH_VECTOR_REST_TOKEN: Your vector database REST token

3. Ensure you have Node.js and npm installed for npx command

For more information, visit: https://github.com/upstash/context7
    `.trim(),
  },
  serena: {
    name: "serena",
    displayName: "Serena",
    description: "Serena MCP server for enhanced AI capabilities",
    config: {
      command: "uvx",
      args: ["serena-mcp"],
      env: {
        FASTMCP_LOG_LEVEL: "ERROR",
      },
      disabled: false,
      autoApprove: [],
    },
    setupInstructions: `
To use Serena MCP server, you need to:

1. Install uv and uvx:
   - Visit https://docs.astral.sh/uv/getting-started/installation/
   - Or use: curl -LsSf https://astral.sh/uv/install.sh | sh

2. The server will be automatically available after installation.

For more information, visit: https://github.com/oraios/serena
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
  return join(cwd, ".vscode", "settings", "mcp.json");
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

export function writeMcpConfig(configPath: string, config: McpConfig): void {
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
  _target?: InstructionTarget,
): { added: string[]; skipped: string[] } {
  const result = { added: [] as string[], skipped: [] as string[] };

  if (selectedServers.length === 0) {
    return result;
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
