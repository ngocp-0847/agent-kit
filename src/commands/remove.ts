import { join } from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../types/init";
import { highlight, printSuccess } from "../utils/branding";
import { dirExists, fileExists, listDirs, listFiles, removeFile } from "../utils/fs";
import {
  getTargetConfig,
  getTargetDirectories,
  isValidTarget,
  promptTargetSelection,
} from "../utils/target";
import {
  getInstalledPowers,
  getPowerDisplayName,
  uninstallPower,
  uninstallPowerWithErrorHandling,
  validatePowerRemoval,
} from "../utils/power";

type ItemType = "command" | "rule" | "skill" | "power";

interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

export const removeCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove a command, rule, skill, or power from your project",
  },
  args: {
    type: {
      type: "string",
      alias: "t",
      description: "Type: 'command', 'rule', 'skill', or 'power'",
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

    const targetConfig = getTargetConfig(target);
    const directories = getTargetDirectories(target);
    const { commandsDir, rulesDir, skillsDir } = directories;

    const rulesExtension = targetConfig.rulesExtension;
    const commands = listFiles(commandsDir, ".md").map((f) => f.replace(".md", ""));
    const rules = listFiles(rulesDir, rulesExtension).map((f) => f.replace(rulesExtension, ""));
    const skills = listDirs(skillsDir);
    const powers = getInstalledPowers().map((p) => p.name);

    console.log(pc.dim(`  Target: ${highlight(targetConfig.label)}`));
    console.log();

    if (commands.length === 0 && rules.length === 0 && skills.length === 0 && powers.length === 0) {
      console.log();
      console.log(
        pc.yellow(
          `  No ${targetConfig.commandsLabel}, ${targetConfig.rulesLabel}, skills, or powers to remove.`,
        ),
      );
      console.log();
      p.outro(pc.dim("Nothing to do"));
      return;
    }

    let itemType: ItemType;
    let itemName: string;

    if (args.type && ["command", "rule", "skill", "power"].includes(args.type)) {
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

      if (powers.length > 0) {
        typeOptions.push({
          value: "power",
          label: "Power",
          hint: `${powers.length} available`,
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

    const isCommand = itemType === "command";
    const isRule = itemType === "rule";
    const isSkill = itemType === "skill";
    const isPower = itemType === "power";
    const items = isCommand ? commands : isRule ? rules : isSkill ? skills : powers;
    const dir = isCommand ? commandsDir : isRule ? rulesDir : isSkill ? skillsDir : "";
    const extension = isCommand ? ".md" : isRule ? rulesExtension : "";
    const itemLabel = isCommand ? targetConfig.commandsLabel : itemType;

    if (items.length === 0) {
      p.cancel(`No ${itemLabel}s found`);
      process.exit(0);
    }

    if (args.name && items.includes(args.name)) {
      itemName = args.name;
    } else {
      const itemOptions: SelectOption[] = items.map((item) => {
        if (isPower) {
          const displayName = getPowerDisplayName(item);
          return {
            value: item,
            label: displayName !== item ? `${displayName} (${item})` : item,
          };
        }
        return {
          value: item,
          label: item,
        };
      });

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

    // Handle Power removal differently
    if (isPower) {
      // Validate Power removal
      const validation = validatePowerRemoval(itemName);
      if (!validation.valid) {
        p.cancel(`Cannot remove Power '${itemName}': ${validation.errors.join(', ')}`);
        process.exit(1);
      }

      // Show warnings if any
      if (validation.warnings.length > 0 && !args.force) {
        console.log();
        console.log(pc.yellow("  Warnings:"));
        validation.warnings.forEach(warning => {
          console.log(pc.dim(`    • ${warning}`));
        });
        console.log();

        const shouldContinue = await p.confirm({
          message: `Are you sure you want to remove Power ${highlight(getPowerDisplayName(itemName))}?`,
          initialValue: false,
        });

        if (p.isCancel(shouldContinue) || !shouldContinue) {
          p.cancel("Operation cancelled");
          process.exit(0);
        }
      }

      try {
        const result = await uninstallPowerWithErrorHandling(itemName);
        
        if (result.errors.length > 0) {
          console.log();
          console.log(pc.red("  Errors during removal:"));
          result.errors.forEach(error => {
            console.log(pc.dim(`    • ${error}`));
          });
        }

        if (result.warnings.length > 0) {
          console.log();
          console.log(pc.yellow("  Warnings:"));
          result.warnings.forEach(warning => {
            console.log(pc.dim(`    • ${warning}`));
          });
        }

        if (result.added.length > 0) {
          console.log();
          console.log(pc.green("  Removed components:"));
          result.added.forEach(component => {
            console.log(pc.dim(`    • ${component}`));
          });
        }

        console.log();
        printSuccess(`Removed Power ${highlight(getPowerDisplayName(itemName))}`);
        console.log();
        p.outro(pc.green("✨ Done!"));
      } catch (error) {
        p.cancel(`Error removing Power: ${error instanceof Error ? error.message : "Unknown error"}`);
        process.exit(1);
      }
    } else {
      // Handle regular file/directory removal
      const targetPath = isSkill ? join(dir, itemName) : join(dir, `${itemName}${extension}`);
      const exists = isSkill ? dirExists(targetPath) : fileExists(targetPath);

      if (!exists) {
        p.cancel(`${itemLabel} '${itemName}' not found`);
        process.exit(1);
      }

      if (!args.force) {
        const displayName = isSkill ? itemName : itemName + extension;
        const shouldDelete = await p.confirm({
          message: `Are you sure you want to delete ${highlight(displayName)}?${isSkill ? " (This will remove the entire skill directory)" : ""}`,
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
        console.log();
        p.outro(pc.green("✨ Done!"));
      } catch (error) {
        p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        process.exit(1);
      }
    }
  },
});
