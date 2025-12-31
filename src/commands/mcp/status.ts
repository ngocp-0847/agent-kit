import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../../types/init";
import {
  MCP_SERVER_TEMPLATES,
  getMcpConfigPath,
  readMcpConfig,
  readVsCodeMcpConfig,
} from "../../utils/mcp";
import { isValidTarget, promptTargetSelection } from "../../utils/target";

export const mcpStatusCommand = defineCommand({
  meta: {
    name: "status",
    description: "Show status of configured MCP servers",
  },
  args: {
    target: {
      type: "string",
      alias: "t",
      description: "Target AI IDE: 'cursor', 'github-copilot', 'google-antigravity', or 'kiro'",
      default: undefined,
    },
  },
  async run({ args }) {
    const cwd = process.cwd();

    // Determine target
    let target: InstructionTarget;
    if (isValidTarget(args.target)) {
      target = args.target;
    } else {
      const selection = await promptTargetSelection();
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      target = selection;
    }

    const mcpConfigPath = getMcpConfigPath(target, cwd);

    console.log();

    // Use different config format for github-copilot (VS Code format)
    if (target === "github-copilot") {
      const config = readVsCodeMcpConfig(mcpConfigPath);

      if (!config || Object.keys(config.servers).length === 0) {
        console.log(pc.yellow("No MCP servers configured"));
        console.log();
        p.outro("Use 'agent-kit mcp add' to install MCP servers");
        return;
      }

      console.log(pc.bold("Configured MCP Servers:"));
      console.log(pc.dim(`(VS Code format: ${mcpConfigPath})`));
      console.log();

      for (const [name, serverConfig] of Object.entries(config.servers)) {
        const template = MCP_SERVER_TEMPLATES[name];

        console.log(`${pc.cyan(template?.displayName || name)} (${name})`);
        console.log(pc.dim(`  Type: ${serverConfig.type}`));

        if (serverConfig.command) {
          const argsStr = serverConfig.args?.join(" ") || "";
          console.log(pc.dim(`  Command: ${serverConfig.command} ${argsStr}`));
        }

        if (serverConfig.url) {
          console.log(pc.dim(`  URL: ${serverConfig.url}`));
        }

        if (serverConfig.env && Object.keys(serverConfig.env).length > 0) {
          console.log(pc.dim("  Environment variables:"));
          for (const [key, value] of Object.entries(serverConfig.env)) {
            const displayValue = value.startsWith("${input:")
              ? pc.cyan(value)
              : value || pc.yellow("<not set>");
            console.log(pc.dim(`    ${key}: ${displayValue}`));
          }
        }

        console.log();
      }

      // Show configured inputs
      if (config.inputs && config.inputs.length > 0) {
        console.log(pc.bold("Configured Input Variables:"));
        for (const input of config.inputs) {
          const passwordIndicator = input.password ? pc.yellow(" (password)") : "";
          console.log(pc.dim(`  - ${input.id}: ${input.description}${passwordIndicator}`));
        }
        console.log();
      }

      p.outro("MCP server status displayed");
      return;
    }

    // Standard format for other targets
    const config = readMcpConfig(mcpConfigPath);

    if (!config || Object.keys(config.mcpServers).length === 0) {
      console.log(pc.yellow("No MCP servers configured"));
      console.log();
      p.outro("Use 'agent-kit mcp add' to install MCP servers");
      return;
    }

    console.log(pc.bold("Configured MCP Servers:"));
    console.log();

    for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
      const template = MCP_SERVER_TEMPLATES[name];
      const status = serverConfig.disabled ? pc.red("disabled") : pc.green("enabled");

      console.log(`${pc.cyan(template?.displayName || name)} (${name}) - ${status}`);
      console.log(pc.dim(`  Command: ${serverConfig.command} ${serverConfig.args.join(" ")}`));

      if (serverConfig.env && Object.keys(serverConfig.env).length > 0) {
        console.log(pc.dim("  Environment variables:"));
        for (const [key, value] of Object.entries(serverConfig.env)) {
          const displayValue = value || pc.yellow("<not set>");
          console.log(pc.dim(`    ${key}: ${displayValue}`));
        }
      }

      if (serverConfig.autoApprove && serverConfig.autoApprove.length > 0) {
        console.log(pc.dim(`  Auto-approved tools: ${serverConfig.autoApprove.join(", ")}`));
      }

      console.log();
    }

    p.outro("MCP server status displayed");
  },
});
