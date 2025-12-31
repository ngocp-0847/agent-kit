import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../../types/init";
import { highlight, printDivider, printSuccess } from "../../utils/branding";
import {
  MCP_SERVER_TEMPLATES,
  type ServerCustomArgs,
  getMcpConfigPath,
  getMcpServerSetupInstructions,
  installMcpServers,
  promptMcpServerSelection,
  promptServerOptions,
} from "../../utils/mcp";
import { isValidTarget, promptTargetSelection } from "../../utils/target";

export const mcpAddCommand = defineCommand({
  meta: {
    name: "add",
    description: "Add MCP servers to your project",
  },
  args: {
    servers: {
      type: "positional",
      description: "Server names to add (e.g., chrome-devtools context7)",
      required: false,
    },
    target: {
      type: "string",
      alias: "t",
      description: "Target AI IDE: 'cursor', 'github-copilot', 'google-antigravity', or 'kiro'",
      default: undefined,
    },
  },
  async run({ args, rawArgs }) {
    const cwd = process.cwd();

    // Extract positional arguments (server names) from rawArgs
    // rawArgs contains all arguments after the command name
    const serverNames = rawArgs.filter(
      (arg) => !arg.startsWith("-") && !arg.startsWith("--") && arg !== args.target,
    );

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

    let selectedServers: string[];

    if (serverNames.length > 0) {
      // Direct add mode: validate server names
      const invalidServers = serverNames.filter((name) => !MCP_SERVER_TEMPLATES[name]);

      if (invalidServers.length > 0) {
        console.log();
        console.log(pc.red(`Unknown MCP server(s): ${invalidServers.join(", ")}`));
        console.log();
        console.log(pc.dim("Available servers:"));
        for (const [name, template] of Object.entries(MCP_SERVER_TEMPLATES)) {
          console.log(pc.dim(`  - ${name} (${template.displayName})`));
        }
        console.log();
        p.cancel("Use 'agent-kit mcp list' to see all available servers");
        process.exit(1);
      }

      selectedServers = serverNames;
    } else {
      // Interactive mode
      const selection = await promptMcpServerSelection();

      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      if (selection.length === 0) {
        p.outro("No MCP servers selected");
        return;
      }

      selectedServers = selection;
    }

    // Collect custom args for servers that have customPrompts
    const customArgs: ServerCustomArgs = {};
    for (const serverName of selectedServers) {
      const template = MCP_SERVER_TEMPLATES[serverName];
      if (template?.customPrompts && template.customPrompts.length > 0) {
        console.log();
        console.log(pc.cyan(`Configure ${template.displayName}:`));

        const serverArgs = await promptServerOptions(serverName);
        if (p.isCancel(serverArgs)) {
          p.cancel("Operation cancelled");
          process.exit(0);
        }

        if (serverArgs.length > 0) {
          customArgs[serverName] = serverArgs;
        }
      }
    }

    const s = p.spinner();

    try {
      s.start("Installing MCP servers...");
      const result = installMcpServers(mcpConfigPath, selectedServers, target, customArgs);
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
  },
});
