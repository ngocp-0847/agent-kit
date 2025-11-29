import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  getCommandsDir,
  getRulesDir,
  listFiles,
  removeFile,
  fileExists,
} from "../utils/fs";
import { highlight, printSuccess } from "../utils/branding";
import { join } from "node:path";

type ItemType = "command" | "rule";

interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

export const removeCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove a command or rule",
  },
  args: {
    type: {
      type: "string",
      alias: "t",
      description: "Type: 'command' or 'rule'",
    },
    name: {
      type: "string",
      alias: "n",
      description: "Name of the command or rule to remove",
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

    const commands = listFiles(commandsDir, ".md").map((f) => f.replace(".md", ""));
    const rules = listFiles(rulesDir, ".mdc").map((f) => f.replace(".mdc", ""));

    if (commands.length === 0 && rules.length === 0) {
      console.log();
      console.log(pc.yellow("  No commands or rules to remove."));
      console.log();
      p.outro(pc.dim("Nothing to do"));
      return;
    }

    let itemType: ItemType;
    let itemName: string;

    if (args.type && ["command", "rule"].includes(args.type)) {
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
    const items = isCommand ? commands : rules;
    const dir = isCommand ? commandsDir : rulesDir;
    const extension = isCommand ? ".md" : ".mdc";

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

    const filePath = join(dir, `${itemName}${extension}`);

    if (!fileExists(filePath)) {
      p.cancel(`${itemType} '${itemName}' not found`);
      process.exit(1);
    }

    if (!args.force) {
      const shouldDelete = await p.confirm({
        message: `Are you sure you want to delete ${highlight(itemName + extension)}?`,
        initialValue: false,
      });

      if (p.isCancel(shouldDelete) || !shouldDelete) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
    }

    try {
      removeFile(filePath);
      console.log();
      printSuccess(`Removed ${highlight(itemName + extension)}`);
      console.log();
      p.outro(pc.green("✨ Done!"));
    } catch (error) {
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});

