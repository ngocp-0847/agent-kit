import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  getCommandsDir,
  getRulesDir,
  getSkillsDir,
  listFiles,
  listDirs,
  removeFile,
  fileExists,
  dirExists,
} from "../utils/fs";
import { highlight, printSuccess } from "../utils/branding";
import { join } from "node:path";

type ItemType = "command" | "rule" | "skill";

interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

export const removeCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove a command, rule, or skill",
  },
  args: {
    type: {
      type: "string",
      alias: "t",
      description: "Type: 'command', 'rule', or 'skill'",
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
  },
  async run({ args }) {
    p.intro(pc.bgCyan(pc.black(" cursor-kit remove ")));

    const commandsDir = getCommandsDir();
    const rulesDir = getRulesDir();
    const skillsDir = getSkillsDir();

    const commands = listFiles(commandsDir, ".md").map((f) => f.replace(".md", ""));
    const rules = listFiles(rulesDir, ".mdc").map((f) => f.replace(".mdc", ""));
    const skills = listDirs(skillsDir);

    if (commands.length === 0 && rules.length === 0 && skills.length === 0) {
      console.log();
      console.log(pc.yellow("  No commands, rules, or skills to remove."));
      console.log();
      p.outro(pc.dim("Nothing to do"));
      return;
    }

    let itemType: ItemType;
    let itemName: string;

    if (args.type && ["command", "rule", "skill"].includes(args.type)) {
      itemType = args.type as ItemType;
    } else {
      const typeOptions: SelectOption[] = [];

      if (commands.length > 0) {
        typeOptions.push({
          value: "command",
          label: "Command",
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
    const items = isCommand ? commands : isRule ? rules : skills;
    const dir = isCommand ? commandsDir : isRule ? rulesDir : skillsDir;
    const extension = isCommand ? ".md" : isRule ? ".mdc" : "";

    if (items.length === 0) {
      p.cancel(`No ${itemType}s found`);
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
        message: `Select ${itemType} to remove:`,
        options: itemOptions,
      });

      if (p.isCancel(nameResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemName = nameResult as string;
    }

    const targetPath = isSkill
      ? join(dir, itemName)
      : join(dir, `${itemName}${extension}`);

    const exists = isSkill ? dirExists(targetPath) : fileExists(targetPath);

    if (!exists) {
      p.cancel(`${itemType} '${itemName}' not found`);
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
      printSuccess(`Removed ${highlight(displayName)}`);
      console.log();
      p.outro(pc.green("✨ Done!"));
    } catch (error) {
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});
