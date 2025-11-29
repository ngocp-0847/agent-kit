import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  getCommandsDir,
  getRulesDir,
  listFiles,
  readFile,
  fileExists,
} from "../utils/fs";
import { highlight, printDivider } from "../utils/branding";
import { join } from "node:path";

interface ItemInfo {
  name: string;
  path: string;
  description?: string;
}

function extractDescription(content: string, isCommand: boolean): string | undefined {
  if (isCommand) {
    const firstLine = content.trim().split("\n")[0];
    if (firstLine && !firstLine.startsWith("#") && !firstLine.startsWith("---")) {
      return firstLine.slice(0, 60) + (firstLine.length > 60 ? "..." : "");
    }
  } else {
    const match = content.match(/description:\s*(.+)/);
    if (match) {
      return match[1].trim().slice(0, 60) + (match[1].length > 60 ? "..." : "");
    }
  }
  return undefined;
}

function getItems(dir: string, extension: string, isCommand: boolean): ItemInfo[] {
  const files = listFiles(dir, extension);
  return files.map((file) => {
    const filePath = join(dir, file);
    const content = fileExists(filePath) ? readFile(filePath) : "";
    return {
      name: file.replace(extension, ""),
      path: filePath,
      description: extractDescription(content, isCommand),
    };
  });
}

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description: "List all commands and rules",
  },
  args: {
    commands: {
      type: "boolean",
      alias: "c",
      description: "Only list commands",
      default: false,
    },
    rules: {
      type: "boolean",
      alias: "r",
      description: "Only list rules",
      default: false,
    },
    verbose: {
      type: "boolean",
      alias: "v",
      description: "Show full file paths",
      default: false,
    },
  },
  async run({ args }) {
    const listBoth = !args.commands && !args.rules;
    const shouldListCommands = listBoth || args.commands;
    const shouldListRules = listBoth || args.rules;

    p.intro(pc.bgCyan(pc.black(" cursor-kit list ")));

    const commandsDir = getCommandsDir();
    const rulesDir = getRulesDir();

    const commands = shouldListCommands ? getItems(commandsDir, ".md", true) : [];
    const rules = shouldListRules ? getItems(rulesDir, ".mdc", false) : [];

    if (commands.length === 0 && rules.length === 0) {
      console.log();
      console.log(pc.yellow("  No commands or rules found."));
      console.log(pc.dim("  Run ") + highlight("cursor-kit init") + pc.dim(" to get started."));
      console.log();
      p.outro(pc.dim("Nothing to show"));
      return;
    }

    printDivider();

    if (shouldListCommands && commands.length > 0) {
      console.log();
      console.log(pc.bold(pc.cyan("  📜 Commands")) + pc.dim(` (${commands.length})`));
      console.log();

      commands.forEach((cmd) => {
        console.log(`  ${pc.green("●")} ${highlight(cmd.name)}`);
        if (cmd.description) {
          console.log(pc.dim(`    ${cmd.description}`));
        }
        if (args.verbose) {
          console.log(pc.dim(`    ${cmd.path}`));
        }
      });
    }

    if (shouldListRules && rules.length > 0) {
      console.log();
      console.log(pc.bold(pc.cyan("  📋 Rules")) + pc.dim(` (${rules.length})`));
      console.log();

      rules.forEach((rule) => {
        console.log(`  ${pc.green("●")} ${highlight(rule.name)}`);
        if (rule.description) {
          console.log(pc.dim(`    ${rule.description}`));
        }
        if (args.verbose) {
          console.log(pc.dim(`    ${rule.path}`));
        }
      });
    }

    console.log();
    printDivider();

    const total = commands.length + rules.length;
    p.outro(pc.dim(`Total: ${total} item${total !== 1 ? "s" : ""}`));
  },
});

