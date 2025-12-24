import { join } from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import { highlight, printDivider } from "../utils/branding";
import {
  fileExists,
  getCommandsDir,
  getRulesDir,
  getSkillsDir,
  listDirs,
  listFiles,
  readFile,
} from "../utils/fs";
import {
  getInstalledPowers,
  getPowerDisplayName,
  getPowerDescription,
  getPowerComponentInfo,
} from "../utils/power";

interface ItemInfo {
  name: string;
  path: string;
  description?: string;
}

interface PowerItemInfo {
  name: string;
  displayName: string;
  version: string;
  description?: string;
  componentCount: {
    mcpServers: number;
    steeringFiles: number;
    examples: number;
  };
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

function getPowers(cwd: string = process.cwd()): PowerItemInfo[] {
  const installedPowers = getInstalledPowers(cwd);
  
  return installedPowers.map((power) => {
    const displayName = getPowerDisplayName(power.name, cwd);
    const description = getPowerDescription(power.name, cwd);
    
    return {
      name: power.name,
      displayName,
      version: power.version,
      description,
      componentCount: {
        mcpServers: power.components.mcpServers.length,
        steeringFiles: power.components.steeringFiles.length,
        examples: 0, // Not tracked in current implementation
      },
    };
  });
}

function getSkills(dir: string): ItemInfo[] {
  const skillDirs = listDirs(dir);
  return skillDirs.map((skillName) => {
    const skillPath = join(dir, skillName);
    const skillFile = join(skillPath, "SKILL.mdc");
    const altSkillFile = join(skillPath, "SKILL.md");

    let description: string | undefined;

    if (fileExists(skillFile)) {
      const content = readFile(skillFile);
      description = extractDescription(content, false);
    } else if (fileExists(altSkillFile)) {
      const content = readFile(altSkillFile);
      description = extractDescription(content, false);
    }

    return {
      name: skillName,
      path: skillPath,
      description,
    };
  });
}

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description: "List all commands, rules, skills, and powers in your project",
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
    skills: {
      type: "boolean",
      alias: "s",
      description: "Only list skills",
      default: false,
    },
    powers: {
      type: "boolean",
      alias: "p",
      description: "Only list installed Powers (Kiro)",
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
    const listAll = !args.commands && !args.rules && !args.skills && !args.powers;
    const shouldListCommands = listAll || args.commands;
    const shouldListRules = listAll || args.rules;
    const shouldListSkills = listAll || args.skills;
    const shouldListPowers = listAll || args.powers;

    p.intro(pc.bgCyan(pc.black(" cursor-kit list ")));

    const commandsDir = getCommandsDir();
    const rulesDir = getRulesDir();
    const skillsDir = getSkillsDir();

    const commands = shouldListCommands ? getItems(commandsDir, ".md", true) : [];
    const rules = shouldListRules ? getItems(rulesDir, ".mdc", false) : [];
    const skills = shouldListSkills ? getSkills(skillsDir) : [];
    const powers = shouldListPowers ? getPowers() : [];

    if (commands.length === 0 && rules.length === 0 && skills.length === 0 && powers.length === 0) {
      console.log();
      console.log(pc.yellow("  No commands, rules, skills, or powers found."));
      console.log(pc.dim("  Run ") + highlight("agent-kit init") + pc.dim(" to get started."));
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

    if (shouldListSkills && skills.length > 0) {
      console.log();
      console.log(pc.bold(pc.cyan("  🎯 Skills")) + pc.dim(` (${skills.length})`));
      console.log();

      skills.forEach((skill) => {
        console.log(`  ${pc.green("●")} ${highlight(skill.name)}`);
        if (skill.description) {
          console.log(pc.dim(`    ${skill.description}`));
        }
        if (args.verbose) {
          console.log(pc.dim(`    ${skill.path}`));
        }
      });
    }

    if (shouldListPowers && powers.length > 0) {
      console.log();
      console.log(pc.bold(pc.cyan("  ⚡ Powers")) + pc.dim(` (${powers.length})`));
      console.log();

      powers.forEach((power) => {
        console.log(`  ${pc.green("●")} ${highlight(power.displayName)} ${pc.dim(`v${power.version}`)}`);
        if (power.description) {
          console.log(pc.dim(`    ${power.description}`));
        }
        
        // Show component counts
        const components = [];
        if (power.componentCount.mcpServers > 0) {
          components.push(`${power.componentCount.mcpServers} MCP server${power.componentCount.mcpServers !== 1 ? 's' : ''}`);
        }
        if (power.componentCount.steeringFiles > 0) {
          components.push(`${power.componentCount.steeringFiles} steering file${power.componentCount.steeringFiles !== 1 ? 's' : ''}`);
        }
        if (power.componentCount.examples > 0) {
          components.push(`${power.componentCount.examples} example${power.componentCount.examples !== 1 ? 's' : ''}`);
        }
        
        if (components.length > 0) {
          console.log(pc.dim(`    Components: ${components.join(', ')}`));
        }
        
        if (args.verbose) {
          console.log(pc.dim(`    Name: ${power.name}`));
        }
      });
    }

    console.log();
    printDivider();

    const total = commands.length + rules.length + skills.length + powers.length;
    p.outro(pc.dim(`Total: ${total} item${total !== 1 ? "s" : ""}`));
  },
});
