import { join } from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../types/init";
import { highlight } from "../utils/branding";
import { deleteFile, dirExists, ensureDir, fileExists, readFile, writeFile } from "../utils/fs";
import {
  getTargetConfig,
  getTargetDirectories,
  isValidTarget,
  promptTargetSelection,
} from "../utils/target";
import { convertMdToMdc } from "../utils/templates";

type ItemType = "command" | "rule" | "skill";

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

const SKILL_TEMPLATE = `---
description: Describe when this skill should be activated
globs:
alwaysApply: false
---

# Skill Name

Brief description of what this skill enables.

## Core Capabilities

- Capability 1
- Capability 2

## When to Use

Use this skill when:
- Condition 1
- Condition 2

## References

For detailed guidance, see the references folder:
- [Reference 1](./references/example.md) - Description
`;

const SKILL_REFERENCE_TEMPLATE = `# Reference Title

Detailed reference content goes here.

## Section 1

Content...

## Section 2

Content...
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
    description: "Add a new command, rule, or skill",
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
      description: "Name of the command, rule, or skill",
    },
    target: {
      type: "string",
      description: "Target IDE: 'cursor', 'github-copilot', or 'google-antigravity'",
    },
  },
  async run({ args }) {
    p.intro(pc.bgCyan(pc.black(" cursor-kit add ")));

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

    let itemType: ItemType;
    let itemName: string;

    if (args.type && ["command", "rule", "skill"].includes(args.type)) {
      itemType = args.type as ItemType;
    } else {
      const typeResult = await p.select({
        message: "What do you want to add?",
        options: [
          {
            value: "command",
            label: target === "google-antigravity" ? "Workflow" : "Command",
            hint:
              target === "google-antigravity"
                ? "A workflow template"
                : "A reusable prompt template",
          },
          {
            value: "rule",
            label: "Rule",
            hint: "Project-specific AI behavior rules",
          },
          {
            value: "skill",
            label: "Skill",
            hint: "Comprehensive guide with references",
          },
        ],
      });

      if (p.isCancel(typeResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemType = typeResult as ItemType;
    }

    const itemLabel = itemType === "command" ? targetConfig.commandsLabel : itemType;

    if (args.name) {
      itemName = args.name;
    } else {
      const nameResult = await p.text({
        message: `Enter ${itemLabel} name:`,
        placeholder:
          itemType === "command" ? "my-command" : itemType === "rule" ? "my-rule" : "my-skill",
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
    const isSkill = itemType === "skill";
    const isRule = itemType === "rule";

    let targetPath: string;
    let displayPath: string;

    if (isSkill) {
      targetPath = join(directories.skillsDir, slug);
      displayPath = targetPath;
    } else {
      const targetDir = isCommand ? directories.commandsDir : directories.rulesDir;
      const extension = ".md";
      targetPath = join(targetDir, `${slug}${extension}`);
      displayPath = targetPath;
    }

    const getExpectedExtension = (): string => {
      if (isSkill) return "";
      if (isCommand) return targetConfig.commandsExtension;
      return targetConfig.rulesExtension;
    };

    const checkPath = isSkill
      ? targetPath
      : isCommand
        ? targetPath
        : join(directories.rulesDir, `${slug}${getExpectedExtension()}`);

    const exists = isSkill
      ? dirExists(targetPath)
      : fileExists(targetPath) || (!isCommand && fileExists(checkPath));

    if (exists) {
      const displayName = isSkill
        ? slug
        : isCommand
          ? `${slug}.md`
          : `${slug}${getExpectedExtension()}`;
      const shouldOverwrite = await p.confirm({
        message: `${highlight(displayName)} already exists. Overwrite?`,
        initialValue: false,
      });

      if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
    }

    const s = p.spinner();
    s.start(`Creating ${itemLabel}...`);

    try {
      if (isSkill) {
        ensureDir(targetPath);
        ensureDir(join(targetPath, "references"));
        const skillMdPath = join(targetPath, "SKILL.md");
        writeFile(skillMdPath, SKILL_TEMPLATE);
        writeFile(join(targetPath, "references", "example.md"), SKILL_REFERENCE_TEMPLATE);

        if (target === "cursor") {
          const skillMdcPath = join(targetPath, "SKILL.mdc");
          const content = readFile(skillMdPath);
          writeFile(skillMdcPath, content);
          deleteFile(skillMdPath);
        }
      } else {
        const targetDir = isCommand ? directories.commandsDir : directories.rulesDir;
        ensureDir(targetDir);
        const template = isCommand ? COMMAND_TEMPLATE : RULE_TEMPLATE;

        if (isCommand) {
          writeFile(targetPath, template);
        } else if (isRule) {
          writeFile(targetPath, template);
          if (target === "cursor") {
            const mdcPath = join(targetDir, convertMdToMdc(`${slug}.md`));
            const content = readFile(targetPath);
            writeFile(mdcPath, content);
            deleteFile(targetPath);
          }
        }
      }

      s.stop(`${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)} created`);

      console.log();
      console.log(pc.dim("  Target: ") + highlight(targetConfig.label));
      if (isSkill) {
        console.log(pc.dim("  Directory: ") + highlight(displayPath));
        const skillFileName = target === "cursor" ? "SKILL.mdc" : "SKILL.md";
        console.log(pc.dim("  Main file: ") + highlight(join(displayPath, skillFileName)));
      } else if (isCommand) {
        console.log(pc.dim("  File: ") + highlight(displayPath));
      } else {
        const finalPath =
          target === "cursor"
            ? join(directories.rulesDir, convertMdToMdc(`${slug}.md`))
            : targetPath;
        console.log(pc.dim("  File: ") + highlight(finalPath));
      }
      console.log();

      p.outro(
        pc.green(
          `✨ ${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)} created! Edit the file to customize it.`,
        ),
      );
    } catch (error) {
      s.stop("Failed");
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});
