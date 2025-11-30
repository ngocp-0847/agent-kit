import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { join } from "node:path";
import {
  ensureDir,
  getCursorDir,
  getCommandsDir,
  getRulesDir,
  getConflictingFiles,
  writeFile,
} from "../utils/fs";
import { highlight, printDivider, printSuccess } from "../utils/branding";
import {
  fetchTemplateManifest,
  fetchMultipleTemplates,
  getTemplateLabel,
  type TemplateManifest,
  type TemplateType,
} from "../utils/templates";

type ConflictStrategy = "overwrite" | "merge" | "cancel";

interface InitResult {
  added: string[];
  skipped: string[];
}

async function selectTemplates(
  type: TemplateType,
  availableTemplates: string[]
): Promise<string[] | symbol> {
  const selectionMode = await p.select({
    message: `How would you like to add ${type}?`,
    options: [
      {
        value: "all",
        label: `Add all ${availableTemplates.length} ${type}`,
        hint: "Install everything",
      },
      {
        value: "select",
        label: "Select specific items",
        hint: "Choose which ones to install",
      },
    ],
  });

  if (p.isCancel(selectionMode)) return selectionMode;

  if (selectionMode === "all") {
    return availableTemplates;
  }

  const selectedTemplates = await p.multiselect({
    message: `Select ${type} to add:`,
    options: availableTemplates.map((template) => ({
      value: template,
      label: getTemplateLabel(template),
      hint: template,
    })),
    required: true,
  });

  return selectedTemplates as string[] | symbol;
}

async function handleConflicts(
  type: TemplateType,
  conflictingFiles: string[]
): Promise<ConflictStrategy | symbol> {
  console.log();
  console.log(
    pc.yellow(`⚠ ${conflictingFiles.length} existing ${type} found:`)
  );
  for (const file of conflictingFiles) {
    console.log(pc.dim(`   └─ ${file}`));
  }
  console.log();

  const strategy = await p.select({
    message: "How would you like to handle conflicts?",
    options: [
      {
        value: "overwrite" as ConflictStrategy,
        label: "Overwrite existing files",
        hint: "Replace all conflicting files",
      },
      {
        value: "merge" as ConflictStrategy,
        label: "Merge (keep existing, add new only)",
        hint: "Skip files that already exist",
      },
      {
        value: "cancel" as ConflictStrategy,
        label: "Cancel",
        hint: "Abort the operation",
      },
    ],
  });

  return strategy as ConflictStrategy | symbol;
}

async function installTemplates(
  type: TemplateType,
  targetDir: string,
  selectedTemplates: string[],
  conflictStrategy: ConflictStrategy
): Promise<InitResult> {
  const result: InitResult = { added: [], skipped: [] };
  const conflictingFiles = getConflictingFiles(targetDir, selectedTemplates);

  let templatesToInstall: string[];

  if (conflictStrategy === "merge") {
    templatesToInstall = selectedTemplates.filter(
      (t) => !conflictingFiles.includes(t)
    );
    result.skipped = conflictingFiles.filter((f) =>
      selectedTemplates.includes(f)
    );
  } else {
    templatesToInstall = selectedTemplates;
  }

  if (templatesToInstall.length === 0) {
    return result;
  }

  const templates = await fetchMultipleTemplates(type, templatesToInstall);

  ensureDir(targetDir);

  for (const [filename, content] of templates) {
    const filePath = join(targetDir, filename);
    writeFile(filePath, content);
    result.added.push(filename);
  }

  return result;
}

export const initCommand = defineCommand({
  meta: {
    name: "init",
    description:
      "Initialize .cursor/commands and .cursor/rules in your project",
  },
  args: {
    force: {
      type: "boolean",
      alias: "f",
      description: "Overwrite existing files without prompting",
      default: false,
    },
    commands: {
      type: "boolean",
      alias: "c",
      description: "Only initialize commands",
      default: false,
    },
    rules: {
      type: "boolean",
      alias: "r",
      description: "Only initialize rules",
      default: false,
    },
    all: {
      type: "boolean",
      alias: "a",
      description: "Install all templates without selection prompts",
      default: false,
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const cursorDir = getCursorDir(cwd);
    const commandsDir = getCommandsDir(cwd);
    const rulesDir = getRulesDir(cwd);

    const initBoth = !args.commands && !args.rules;
    const shouldInitCommands = initBoth || args.commands;
    const shouldInitRules = initBoth || args.rules;

    p.intro(pc.bgCyan(pc.black(" cursor-kit init ")));

    const s = p.spinner();

    let manifest: TemplateManifest;

    try {
      s.start("Fetching template manifest...");
      manifest = await fetchTemplateManifest();
      s.stop("Template manifest loaded");
    } catch (error) {
      s.stop("Failed to fetch manifest");
      p.cancel(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      process.exit(1);
    }

    const results: {
      commands?: InitResult;
      rules?: InitResult;
    } = {};

    try {
      ensureDir(cursorDir);

      if (shouldInitCommands) {
        let selectedCommands: string[];

        if (args.all) {
          selectedCommands = manifest.commands;
        } else {
          const selection = await selectTemplates("commands", manifest.commands);
          if (p.isCancel(selection)) {
            p.cancel("Operation cancelled");
            process.exit(0);
          }
          selectedCommands = selection;
        }

        const conflictingCommands = getConflictingFiles(
          commandsDir,
          selectedCommands
        );
        let commandStrategy: ConflictStrategy = "overwrite";

        if (conflictingCommands.length > 0 && !args.force) {
          const strategy = await handleConflicts("commands", conflictingCommands);
          if (p.isCancel(strategy) || strategy === "cancel") {
            p.cancel("Operation cancelled");
            process.exit(0);
          }
          commandStrategy = strategy;
        }

        s.start("Installing commands...");
        results.commands = await installTemplates(
          "commands",
          commandsDir,
          selectedCommands,
          commandStrategy
        );
        s.stop("Commands installed");
      }

      if (shouldInitRules) {
        let selectedRules: string[];

        if (args.all) {
          selectedRules = manifest.rules;
        } else {
          const selection = await selectTemplates("rules", manifest.rules);
          if (p.isCancel(selection)) {
            p.cancel("Operation cancelled");
            process.exit(0);
          }
          selectedRules = selection;
        }

        const conflictingRules = getConflictingFiles(rulesDir, selectedRules);
        let ruleStrategy: ConflictStrategy = "overwrite";

        if (conflictingRules.length > 0 && !args.force) {
          const strategy = await handleConflicts("rules", conflictingRules);
          if (p.isCancel(strategy) || strategy === "cancel") {
            p.cancel("Operation cancelled");
            process.exit(0);
          }
          ruleStrategy = strategy;
        }

        s.start("Installing rules...");
        results.rules = await installTemplates(
          "rules",
          rulesDir,
          selectedRules,
          ruleStrategy
        );
        s.stop("Rules installed");
      }

      printDivider();
      console.log();

      if (results.commands) {
        const { added, skipped } = results.commands;
        if (added.length > 0 || skipped.length > 0) {
          printSuccess(
            `Commands: ${highlight(added.length.toString())} added${skipped.length > 0 ? `, ${pc.yellow(skipped.length.toString())} skipped` : ""}`
          );
          for (const f of added) {
            console.log(pc.dim(`   └─ ${pc.green("+")} ${f}`));
          }
          for (const f of skipped) {
            console.log(pc.dim(`   └─ ${pc.yellow("○")} ${f} (kept existing)`));
          }
        }
      }

      if (results.rules) {
        const { added, skipped } = results.rules;
        if (added.length > 0 || skipped.length > 0) {
          printSuccess(
            `Rules: ${highlight(added.length.toString())} added${skipped.length > 0 ? `, ${pc.yellow(skipped.length.toString())} skipped` : ""}`
          );
          for (const f of added) {
            console.log(pc.dim(`   └─ ${pc.green("+")} ${f}`));
          }
          for (const f of skipped) {
            console.log(pc.dim(`   └─ ${pc.yellow("○")} ${f} (kept existing)`));
          }
        }
      }

      const totalAdded =
        (results.commands?.added.length ?? 0) +
        (results.rules?.added.length ?? 0);
      const totalSkipped =
        (results.commands?.skipped.length ?? 0) +
        (results.rules?.skipped.length ?? 0);

      if (totalAdded === 0 && totalSkipped > 0) {
        console.log();
        p.outro(pc.yellow("No new templates added (all selected files already exist)"));
      } else {
        console.log();
        p.outro(pc.green("✨ Cursor Kit initialized successfully!"));
      }
    } catch (error) {
      s.stop("Failed");
      p.cancel(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      process.exit(1);
    }
  },
});
