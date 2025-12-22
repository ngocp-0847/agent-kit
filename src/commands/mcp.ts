import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../types/init";
import { highlight, printDivider, printSuccess } from "../utils/branding";
import {
  MCP_SERVER_TEMPLATES,
  getMcpConfigPath,
  getMcpServerSetupInstructions,
  installMcpServers,
  promptMcpServerSelection,
  readMcpConfig,
} from "../utils/mcp";
import { isValidTarget, promptTargetSelection } from "../utils/target";

export const mcpCommand = defineCommand({
  meta: {
    name: "mcp",
    description: "Manage MCP servers for AI IDEs",
  },
  args: {
    add: {
      type: "boolean",
      alias: "a",
      description: "Add MCP servers",
      default: false,
    },
    list: {
      type: "boolean",
      alias: "l",
      description: "List available MCP servers",
      default: false,
    },
    status: {
      type: "boolean",
      alias: "s",
      description: "Show status of configured MCP servers",
      default: false,
    },
    info: {
      type: "string",
      alias: "i",
      description: "Show information about a specific MCP server",
      default: undefined,
    },
    target: {
      type: "string",
      alias: "t",
      description: "Target AI IDE: 'cursor', 'github-copilot', 'google-antigravity', or 'kiro'",
      default: undefined,
    },
  },
  async run({ args }) {
    const cwd = process.cwd();

    p.intro(pc.bgCyan(pc.black(" agent-kit mcp ")));

    // Determine target
    let target: InstructionTarget;
    if (isValidTarget(args.target)) {
      target = args.target;
    } else {
      // Default to github-copilot (VSCode Copilot) instead of cursor
      const selection = await promptTargetSelection();
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      target = selection;
    }

    const mcpConfigPath = getMcpConfigPath(target, cwd);

    if (args.list) {
      console.log();
      console.log(pc.bold("Available MCP Servers:"));
      console.log();

      for (const [name, template] of Object.entries(MCP_SERVER_TEMPLATES)) {
        console.log(pc.cyan(`${template.displayName} (${name})`));
        console.log(pc.dim(`  ${template.description}`));
        console.log();
      }

      p.outro("Use 'agent-kit mcp --add' to install MCP servers");
      return;
    }

    if (args.status) {
      const config = readMcpConfig(mcpConfigPath);
      
      console.log();
      if (!config || Object.keys(config.mcpServers).length === 0) {
        console.log(pc.yellow("No MCP servers configured"));
        console.log();
        p.outro("Use 'agent-kit mcp --add' to install MCP servers");
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
      return;
    }

    if (args.info) {
      const template = MCP_SERVER_TEMPLATES[args.info];
      
      if (!template) {
        p.cancel(`MCP server '${args.info}' not found. Use --list to see available servers.`);
        process.exit(1);
      }

      console.log();
      console.log(pc.bold(pc.cyan(template.displayName)));
      console.log(pc.dim(template.description));
      console.log();

      if (template.setupInstructions) {
        console.log(pc.bold("Setup Instructions:"));
        console.log();
        console.log(template.setupInstructions);
        console.log();
      }

      console.log(pc.bold("Configuration:"));
      console.log(pc.dim(JSON.stringify(template.config, null, 2)));
      console.log();

      p.outro("MCP server information displayed");
      return;
    }

    if (args.add) {
      const selectedServers = await promptMcpServerSelection();
      
      if (p.isCancel(selectedServers)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      if (selectedServers.length === 0) {
        p.outro("No MCP servers selected");
        return;
      }

      const s = p.spinner();
      
      try {
        s.start("Installing MCP servers...");
        const result = installMcpServers(mcpConfigPath, selectedServers, target);
        s.stop("MCP servers installed");

        printDivider();
        console.log();

        if (result.added.length > 0 || result.skipped.length > 0) {
          printSuccess(
            `MCP servers: ${highlight(result.added.length.toString())} added${
              result.skipped.length > 0
                ? `, ${pc.yellow(result.skipped.length.toString())} skipped`
                : ""
            }`,
          );
          
          for (const server of result.added) {
            console.log(pc.dim(`   └─ ${pc.green("+")} ${server}`));
          }
          
          for (const server of result.skipped) {
            console.log(pc.dim(`   └─ ${pc.yellow("○")} ${server} (already exists)`));
          }
        }

        // Show setup instructions for added servers
        if (result.added.length > 0) {
          console.log();
          console.log(pc.cyan("📋 MCP Server Setup Instructions:"));
          console.log();
          const instructions = getMcpServerSetupInstructions(result.added);
          console.log(pc.dim(instructions));
        }

        console.log();
        p.outro(pc.green("✨ MCP servers configured successfully!"));
      } catch (error) {
        s.stop("Failed");
        p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        process.exit(1);
      }
      
      return;
    }

    // Default behavior - show help
    console.log();
    console.log(pc.bold("MCP Server Management"));
    console.log();
    console.log("Available commands:");
    console.log(pc.dim("  --add, -a      Add MCP servers"));
    console.log(pc.dim("  --list, -l     List available MCP servers"));
    console.log(pc.dim("  --status, -s   Show status of configured servers"));
    console.log(pc.dim("  --info, -i     Show information about a specific server"));
    console.log();
    console.log("Examples:");
    console.log(pc.dim("  agent-kit mcp --add"));
    console.log(pc.dim("  agent-kit mcp --list"));
    console.log(pc.dim("  agent-kit mcp --status"));
    console.log(pc.dim("  agent-kit mcp --info context7"));
    console.log();

    p.outro("Use one of the commands above to manage MCP servers");
  },
});