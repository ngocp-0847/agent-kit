import * as p from "@clack/prompts";
import type { InstructionTarget } from "../types/init";
import {
  getAgentDir,
  getAgentRulesDir,
  getAgentSkillsDir,
  getAgentWorkflowsDir,
  getCommandsDir,
  getCopilotCommandsDir,
  getCopilotInstructionsDir,
  getCopilotRulesDir,
  getCopilotSkillsDir,
  getCursorDir,
  getRulesDir,
  getSkillsDir,
} from "./fs";

interface TargetDirectories {
  rootDir: string;
  commandsDir: string;
  rulesDir: string;
  skillsDir: string;
}

interface TargetConfig {
  label: string;
  hint: string;
  commandsLabel: string;
  rulesLabel: string;
  rulesExtension: string;
  commandsExtension: string;
}

export const TARGET_CONFIGS: Record<InstructionTarget, TargetConfig> = {
  cursor: {
    label: "Cursor",
    hint: ".cursor/ directory",
    commandsLabel: "commands",
    rulesLabel: "rules",
    rulesExtension: ".mdc",
    commandsExtension: ".md",
  },
  "github-copilot": {
    label: "GitHub Copilot",
    hint: ".github/copilot-instructions/ directory",
    commandsLabel: "commands",
    rulesLabel: "rules",
    rulesExtension: ".md",
    commandsExtension: ".md",
  },
  "google-antigravity": {
    label: "Google AntiGravity",
    hint: ".agent/ directory",
    commandsLabel: "workflows",
    rulesLabel: "rules",
    rulesExtension: ".md",
    commandsExtension: ".md",
  },
};

export async function promptTargetSelection(): Promise<InstructionTarget | symbol> {
  return await p.select({
    message: "Which AI IDE are you targeting?",
    options: [
      {
        value: "cursor" as const,
        label: "Cursor",
        hint: "Work with .cursor/ directory",
      },
      {
        value: "github-copilot" as const,
        label: "GitHub Copilot",
        hint: "Work with .github/copilot-instructions/",
      },
      {
        value: "google-antigravity" as const,
        label: "Google AntiGravity",
        hint: "Work with .agent/ directory",
      },
    ],
    initialValue: "cursor",
  });
}

export function isValidTarget(value: string | undefined): value is InstructionTarget {
  return value === "cursor" || value === "github-copilot" || value === "google-antigravity";
}

export function getTargetDirectories(
  target: InstructionTarget,
  cwd: string = process.cwd(),
): TargetDirectories {
  switch (target) {
    case "cursor":
      return {
        rootDir: getCursorDir(cwd),
        commandsDir: getCommandsDir(cwd),
        rulesDir: getRulesDir(cwd),
        skillsDir: getSkillsDir(cwd),
      };
    case "github-copilot":
      return {
        rootDir: getCopilotInstructionsDir(cwd),
        commandsDir: getCopilotCommandsDir(cwd),
        rulesDir: getCopilotRulesDir(cwd),
        skillsDir: getCopilotSkillsDir(cwd),
      };
    case "google-antigravity":
      return {
        rootDir: getAgentDir(cwd),
        commandsDir: getAgentWorkflowsDir(cwd),
        rulesDir: getAgentRulesDir(cwd),
        skillsDir: getAgentSkillsDir(cwd),
      };
  }
}

export function getTargetConfig(target: InstructionTarget): TargetConfig {
  return TARGET_CONFIGS[target];
}
