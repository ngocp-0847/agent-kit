import { join } from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../types/init";
import { highlight } from "../utils/branding";
import { deleteFile, dirExists, ensureDir, fileExists, readFile, writeFile } from "../utils/fs";
import {
  checkPowerScaffoldConflicts,
  getProjectPowerTargetDir,
  listAvailablePowers,
  scaffoldPowerToProject,
} from "../utils/power";
import {
  getTargetConfig,
  getTargetDirectories,
  isValidTarget,
  promptTargetSelection,
} from "../utils/target";
import { convertMdToMdc } from "../utils/templates";

type ItemType = "command" | "rule" | "skill" | "power";

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
    description: "Add a new command, rule, skill, or power",
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
      description: "Name of the command, rule, skill, or power template",
    },
    target: {
      type: "string",
      description: "Target IDE: 'cursor', 'github-copilot', or 'google-antigravity'",
    },
    force: {
      type: "boolean",
      alias: "f",
      description: "Force overwrite existing files",
      default: false,
    },
  },
  async run({ args }) {
    p.intro(pc.bgCyan(pc.black(" cursor-kit add ")));

    // Check if adding a power (doesn't need target selection)
    if (args.type === "power") {
      await handleAddPower(args.name, args.force);
      return;
    }

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

    if (args.type && ["command", "rule", "skill", "power"].includes(args.type)) {
      itemType = args.type as ItemType;
      // Handle power type selected via interactive menu
      if (itemType === "power") {
        await handleAddPower(args.name, args.force);
        return;
      }
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
          {
            value: "power",
            label: "Power",
            hint: "Scaffold a Kiro power from template to project root",
          },
        ],
      });

      if (p.isCancel(typeResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemType = typeResult as ItemType;

      // Handle power type selected via interactive menu
      if (itemType === "power") {
        await handleAddPower(args.name, args.force);
        return;
      }
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

/**
 * Handle adding a power from template to project root
 */
async function handleAddPower(templateName?: string, force?: boolean): Promise<void> {
  const cwd = process.cwd();
  const availablePowers = listAvailablePowers(cwd);

  if (availablePowers.length === 0) {
    p.cancel("No power templates available");
    process.exit(1);
  }

  let selectedPower: string;

  if (templateName) {
    const found = availablePowers.find((p) => p.name === templateName);
    if (!found) {
      p.cancel(
        `Power template '${templateName}' not found. Available: ${availablePowers.map((p) => p.name).join(", ")}`,
      );
      process.exit(1);
    }
    selectedPower = templateName;
  } else {
    const selection = await p.select({
      message: "Select a power template to scaffold:",
      options: availablePowers.map((power) => ({
        value: power.name,
        label: power.displayName || power.name,
        hint: power.description,
      })),
    });

    if (p.isCancel(selection)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    selectedPower = selection as string;
  }

  // Check for conflicts
  const conflicts = checkPowerScaffoldConflicts(selectedPower, cwd);
  if (!conflicts.valid && !force) {
    const shouldOverwrite = await p.confirm({
      message: `${conflicts.errors.join(". ")} Overwrite?`,
      initialValue: false,
    });

    if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }
    force = true;
  }

  const s = p.spinner();
  s.start(`Scaffolding power '${selectedPower}'...`);

  const result = scaffoldPowerToProject(selectedPower, cwd, force);

  if (result.errors.length > 0) {
    s.stop("Failed");
    p.cancel(`Error: ${result.errors.join(", ")}`);
    process.exit(1);
  }

  s.stop("Power scaffolded");

  const targetDir = getProjectPowerTargetDir(selectedPower, cwd);
  console.log();
  console.log(pc.dim("  Directory: ") + highlight(targetDir));
  console.log(pc.dim("  Files created:"));
  for (const item of result.added.slice(1)) {
    // Skip first "Power scaffolded" message
    console.log(pc.dim(`    ${item}`));
  }

  if (result.warnings.length > 0) {
    console.log();
    for (const warning of result.warnings) {
      console.log(pc.yellow(`  ⚠ ${warning}`));
    }
  }

  console.log();
  p.outro(pc.green(`✨ Power '${selectedPower}' scaffolded to project root!`));
}
