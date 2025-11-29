import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  ensureDir,
  getCommandsDir,
  getRulesDir,
  writeFile,
  fileExists,
} from "../utils/fs";
import { highlight } from "../utils/branding";
import { join } from "node:path";

type ItemType = "command" | "rule";

const COMMAND_TEMPLATE = `You are a helpful assistant. Describe what this command does.

## Instructions
- Step 1: ...
- Step 2: ...

## Rules
- Be concise
- Focus on the task

START: Wait for user input.
`;

const RULE_TEMPLATE = `---
description: Describe when this rule should apply
globs: 
alwaysApply: false
---

# Rule Title

Describe the rule behavior here.

## Guidelines
- Guideline 1
- Guideline 2
`;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const addCommand = defineCommand({
  meta: {
    name: "add",
    description: "Add a new command or rule",
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
      description: "Name of the command or rule",
    },
  },
  async run({ args }) {
    p.intro(pc.bgCyan(pc.black(" cursor-kit add ")));

    let itemType: ItemType;
    let itemName: string;

    if (args.type && ["command", "rule"].includes(args.type)) {
      itemType = args.type as ItemType;
    } else {
      const typeResult = await p.select({
        message: "What do you want to add?",
        options: [
          {
            value: "command",
            label: "Command",
            hint: "A reusable prompt template",
          },
          {
            value: "rule",
            label: "Rule",
            hint: "Project-specific AI behavior rules",
          },
        ],
      });

      if (p.isCancel(typeResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemType = typeResult as ItemType;
    }

    if (args.name) {
      itemName = args.name;
    } else {
      const nameResult = await p.text({
        message: `Enter ${itemType} name:`,
        placeholder: itemType === "command" ? "my-command" : "my-rule",
        validate: (value) => {
          if (!value.trim()) return "Name is required";
          if (value.length < 2) return "Name must be at least 2 characters";
          return undefined;
        },
      });

      if (p.isCancel(nameResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemName = nameResult;
    }

    const slug = generateSlug(itemName);
    const isCommand = itemType === "command";
    const targetDir = isCommand ? getCommandsDir() : getRulesDir();
    const extension = isCommand ? ".md" : ".mdc";
    const filePath = join(targetDir, `${slug}${extension}`);

    if (fileExists(filePath)) {
      const shouldOverwrite = await p.confirm({
        message: `${highlight(slug + extension)} already exists. Overwrite?`,
        initialValue: false,
      });

      if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
    }

    const s = p.spinner();
    s.start(`Creating ${itemType}...`);

    try {
      ensureDir(targetDir);
      const template = isCommand ? COMMAND_TEMPLATE : RULE_TEMPLATE;
      writeFile(filePath, template);

      s.stop(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} created`);

      console.log();
      console.log(pc.dim("  File: ") + highlight(filePath));
      console.log();

      p.outro(
        pc.green(`✨ ${itemType.charAt(0).toUpperCase() + itemType.slice(1)} created! Edit the file to customize it.`)
      );
    } catch (error) {
      s.stop("Failed");
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});

