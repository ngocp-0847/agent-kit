import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../../types/init";
import { highlight, printDivider, printSuccess } from "../../utils/branding";
import { getConfiguredMcpServers, removeMcpServer } from "../../utils/mcp";
import { isValidTarget, promptTargetSelection } from "../../utils/target";

export const mcpRemoveCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove MCP servers from your project",
  },
  args: {
    servers: {
      type: "positional",
      description: "Server names to remove (e.g., chrome-devtools context7)",
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

    // Get currently configured servers
    const configuredServers = getConfiguredMcpServers(target, cwd);

    if (configuredServers.length === 0) {
      console.log();
      console.log(pc.yellow("No MCP servers configured"));
      console.log();
      p.outro("Use 'agent-kit mcp add' to install MCP servers first");
      return;
    }

    let selectedServers: string[];

    if (serverNames.length > 0) {
      // Direct remove mode: validate server names
      const configuredNames = configuredServers.map((s) => s.name);
      const invalidServers = serverNames.filter((name) => !configuredNames.includes(name));

      if (invalidServers.length > 0) {
        console.log();
        console.log(pc.red(`Server(s) not configured: ${invalidServers.join(", ")}`));
        console.log();
        console.log(pc.dim("Currently configured servers:"));
        for (const server of configuredServers) {
          console.log(pc.dim(`  - ${server.name}`));
        }
        console.log();
        p.cancel("Use 'agent-kit mcp status' to see configured servers");
        process.exit(1);
      }

      selectedServers = serverNames;
    } else {
      // Interactive mode
      const selection = await p.multiselect({
        message: "Select MCP servers to remove:",
        options: configuredServers.map((server) => ({
          value: server.name,
          label: server.name,
        })),
        required: false,
      });

      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      if ((selection as string[]).length === 0) {
        p.outro("No MCP servers selected");
        return;
      }

      selectedServers = selection as string[];
    }

    // Confirm removal
    const confirmMessage =
      selectedServers.length === 1
        ? `Remove ${selectedServers[0]}?`
        : `Remove ${selectedServers.length} servers?`;

    const confirmed = await p.confirm({
      message: confirmMessage,
      initialValue: false,
    });

    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    const s = p.spinner();

    try {
      s.start("Removing MCP servers...");

      const removed: string[] = [];
      const failed: string[] = [];

      for (const serverName of selectedServers) {
        const success = removeMcpServer(target, serverName, cwd);
        if (success) {
          removed.push(serverName);
        } else {
          failed.push(serverName);
        }
      }

      s.stop("MCP servers removed");

      printDivider();
      console.log();

      if (removed.length > 0) {
        printSuccess(`MCP servers: ${highlight(removed.length.toString())} removed`);

        for (const server of removed) {
          console.log(pc.dim(`   └─ ${pc.red("-")} ${server}`));
        }
      }

      if (failed.length > 0) {
        console.log();
        console.log(pc.yellow(`Failed to remove: ${failed.join(", ")}`));
      }

      console.log();
      p.outro(pc.green("✨ MCP servers updated!"));
    } catch (error) {
      s.stop("Failed");
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});
