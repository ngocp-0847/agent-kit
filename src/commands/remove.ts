import { join } from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../types/init";
import { highlight, printSuccess } from "../utils/branding";
import {
  dirExists,
  fileExists,
  getCopilotPromptsDir,
  listDirs,
  listFiles,
  removeFile,
} from "../utils/fs";
import {
  getConfiguredMcpServers,
  getMcpConfigPath,
  removeMcpServer,
} from "../utils/mcp";
import {
  getTargetConfig,
  getTargetDirectories,
  isValidTarget,
  promptTargetSelection,
} from "../utils/target";

type ItemType = "command" | "rule" | "skill" | "mcp";

interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

export const removeCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove a command, rule, skill, or MCP server",
  },
  args: {
    type: {
      type: "string",
      alias: "t",
      description: "Type: 'command', 'rule', 'skill', or 'mcp'",
    },
    name: {
      type: "string",
      alias: "n",
      description: "Name of the command, rule, or skill to remove",
    },
    force: {
      type: "boolean",
      alias: "f",
      description: "Skip confirmation",
      default: false,
    },
    target: {
      type: "string",
      description: "Target IDE: 'cursor', 'github-copilot', or 'google-antigravity'",
    },
  },
  async run({ args }) {
    p.intro(pc.bgCyan(pc.black(" cursor-kit remove ")));

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

    const cwd = process.cwd();
    const targetConfig = getTargetConfig(target);
    const directories = getTargetDirectories(target, cwd);
    const { commandsDir, rulesDir, skillsDir } = directories;

    const rulesExtension = targetConfig.rulesExtension;
    
    // Get commands from standard commands directory
    let commands = listFiles(commandsDir, ".md").map((f) => ({
      name: f.replace(".md", ""),
      path: join(commandsDir, f),
      source: "commands" as const,
    }));
    
    // For GitHub Copilot, also include prompt files from .github/prompts/
    if (target === "github-copilot") {
      const promptsDir = getCopilotPromptsDir(cwd);
      const prompts = listFiles(promptsDir, ".prompt.md").map((f) => ({
        name: f.replace(".prompt.md", ""),
        path: join(promptsDir, f),
        source: "prompts" as const,
      }));
      commands = [...commands, ...prompts];
    }
    
    const rules = listFiles(rulesDir, rulesExtension).map((f) => f.replace(rulesExtension, ""));
    const skills = listDirs(skillsDir);
    const configuredMcpServers = getConfiguredMcpServers(target, cwd);

    console.log(pc.dim(`  Target: ${highlight(targetConfig.label)}`));
    console.log();

    if (commands.length === 0 && rules.length === 0 && skills.length === 0 && configuredMcpServers.length === 0) {
      console.log();
      console.log(
        pc.yellow(
          `  No ${targetConfig.commandsLabel}, ${targetConfig.rulesLabel}, skills, or MCP servers to remove.`,
        ),
      );
      console.log();
      p.outro(pc.dim("Nothing to do"));
      return;
    }

    let itemType: ItemType;
    let itemName: string;

    if (args.type && ["command", "rule", "skill", "mcp"].includes(args.type)) {
      itemType = args.type as ItemType;
    } else {
      const typeOptions: SelectOption[] = [];

      if (commands.length > 0) {
        typeOptions.push({
          value: "command",
          label: target === "google-antigravity" ? "Workflow" : "Command",
          hint: `${commands.length} available`,
        });
      }

      if (rules.length > 0) {
        typeOptions.push({
          value: "rule",
          label: "Rule",
          hint: `${rules.length} available`,
        });
      }

      if (skills.length > 0) {
        typeOptions.push({
          value: "skill",
          label: "Skill",
          hint: `${skills.length} available`,
        });
      }

      if (configuredMcpServers.length > 0) {
        typeOptions.push({
          value: "mcp",
          label: "MCP Server",
          hint: `${configuredMcpServers.length} configured`,
        });
      }

      const typeResult = await p.select({
        message: "What do you want to remove?",
        options: typeOptions,
      });

      if (p.isCancel(typeResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemType = typeResult as ItemType;
    }

    // Handle MCP server removal separately
    if (itemType === "mcp") {
      if (configuredMcpServers.length === 0) {
        p.cancel("No MCP servers configured");
        process.exit(0);
      }

      if (args.name && configuredMcpServers.some((s) => s.name === args.name)) {
        itemName = args.name;
      } else {
        const mcpOptions: SelectOption[] = configuredMcpServers.map((server) => ({
          value: server.name,
          label: server.name,
        }));

        const nameResult = await p.select({
          message: "Select MCP server to remove:",
          options: mcpOptions,
        });

        if (p.isCancel(nameResult)) {
          p.cancel("Operation cancelled");
          process.exit(0);
        }

        itemName = nameResult as string;
      }

      const mcpConfigPath = getMcpConfigPath(target, cwd);

      if (!args.force) {
        const shouldDelete = await p.confirm({
          message: `Are you sure you want to remove MCP server ${highlight(itemName)}?\n  ${pc.dim(`Config: ${mcpConfigPath}`)}`,
          initialValue: false,
        });

        if (p.isCancel(shouldDelete) || !shouldDelete) {
          p.cancel("Operation cancelled");
          process.exit(0);
        }
      }

      try {
        const removed = removeMcpServer(target, itemName, cwd);
        if (!removed) {
          p.cancel(`MCP server '${itemName}' not found in config`);
          process.exit(1);
        }
        console.log();
        printSuccess(`Removed MCP server ${highlight(itemName)} from ${targetConfig.label}`);
        console.log(pc.dim(`  Config: ${mcpConfigPath}`));
        console.log();
        p.outro(pc.green("✨ Done!"));
      } catch (error) {
        p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        process.exit(1);
      }
      return;
    }

    const isCommand = itemType === "command";
    const isRule = itemType === "rule";
    const isSkill = itemType === "skill";
    const itemLabel = isCommand ? targetConfig.commandsLabel : itemType;

    // Handle command removal with unified commands/prompts
    if (isCommand) {
      if (commands.length === 0) {
        p.cancel(`No ${itemLabel}s found`);
        process.exit(0);
      }

      let selectedCommand: typeof commands[0] | undefined;

      if (args.name) {
        selectedCommand = commands.find((c) => c.name === args.name);
      }
      
      if (!selectedCommand) {
        const commandOptions: SelectOption[] = commands.map((cmd) => ({
          value: cmd.name,
          label: cmd.name,
          hint: cmd.source === "prompts" ? "prompt file" : undefined,
        }));

        const nameResult = await p.select({
          message: `Select ${itemLabel} to remove:`,
          options: commandOptions,
        });

        if (p.isCancel(nameResult)) {
          p.cancel("Operation cancelled");
          process.exit(0);
        }

        selectedCommand = commands.find((c) => c.name === nameResult);
      }

      if (!selectedCommand || !fileExists(selectedCommand.path)) {
        p.cancel(`${itemLabel} '${args.name || "selected"}' not found`);
        process.exit(1);
      }

      const displayName = selectedCommand.source === "prompts" 
        ? `${selectedCommand.name}.prompt.md`
        : `${selectedCommand.name}.md`;

      if (!args.force) {
        const shouldDelete = await p.confirm({
          message: `Are you sure you want to delete ${highlight(displayName)}?\n  ${pc.dim(`Path: ${selectedCommand.path}`)}`,
          initialValue: false,
        });

        if (p.isCancel(shouldDelete) || !shouldDelete) {
          p.cancel("Operation cancelled");
          process.exit(0);
        }
      }

      try {
        removeFile(selectedCommand.path);
        console.log();
        printSuccess(`Removed ${highlight(displayName)} from ${targetConfig.label}`);
        console.log(pc.dim(`  Path: ${selectedCommand.path}`));
        console.log();
        p.outro(pc.green("✨ Done!"));
      } catch (error) {
        p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        process.exit(1);
      }
      return;
    }

    // Handle rules and skills
    const items = isRule ? rules : skills;
    const dir = isRule ? rulesDir : skillsDir;
    const extension = isRule ? rulesExtension : "";

    if (items.length === 0) {
      p.cancel(`No ${itemLabel}s found`);
      process.exit(0);
    }

    if (args.name && items.includes(args.name)) {
      itemName = args.name;
    } else {
      const itemOptions: SelectOption[] = items.map((item) => ({
        value: item,
        label: item,
      }));

      const nameResult = await p.select({
        message: `Select ${itemLabel} to remove:`,
        options: itemOptions,
      });

      if (p.isCancel(nameResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemName = nameResult as string;
    }

    const targetPath = isSkill ? join(dir, itemName) : join(dir, `${itemName}${extension}`);

    const exists = isSkill ? dirExists(targetPath) : fileExists(targetPath);

    if (!exists) {
      p.cancel(`${itemLabel} '${itemName}' not found`);
      process.exit(1);
    }

    if (!args.force) {
      const displayName = isSkill ? itemName : itemName + extension;
      const shouldDelete = await p.confirm({
        message: `Are you sure you want to delete ${highlight(displayName)}?${isSkill ? " (This will remove the entire skill directory)" : ""}\n  ${pc.dim(`Path: ${targetPath}`)}`,
        initialValue: false,
      });

      if (p.isCancel(shouldDelete) || !shouldDelete) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
    }

    try {
      removeFile(targetPath);
      const displayName = isSkill ? itemName : itemName + extension;
      console.log();
      printSuccess(`Removed ${highlight(displayName)} from ${targetConfig.label}`);
      console.log(pc.dim(`  Path: ${targetPath}`));
      console.log();
      p.outro(pc.green("✨ Done!"));
    } catch (error) {
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});
