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
  getKiroSkillsDir,
  getKiroSteeringDir,
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
  kiro: {
    label: "Kiro",
    hint: ".kiro/steering/ directory",
    commandsLabel: "steering",
    rulesLabel: "steering",
    rulesExtension: ".md",
    commandsExtension: ".md",
  },
};

export async function promptTargetSelection(): Promise<InstructionTarget | symbol> {
  return await p.select({
    message: "Which AI IDE are you targeting?",
    options: [
      {
        value: "github-copilot" as const,
        label: "GitHub Copilot (VSCode)",
        hint: "Work with .vscode/settings/ directory",
      },
      {
        value: "cursor" as const,
        label: "Cursor",
        hint: "Work with .cursor/ directory",
      },
      {
        value: "google-antigravity" as const,
        label: "Google AntiGravity",
        hint: "Work with .agent/ directory",
      },
      {
        value: "kiro" as const,
        label: "Kiro",
        hint: "Work with .kiro/steering/ directory",
      },
    ],
    initialValue: "github-copilot",
  });
}

export function isValidTarget(value: string | undefined): value is InstructionTarget {
  return (
    value === "cursor" ||
    value === "github-copilot" ||
    value === "google-antigravity" ||
    value === "kiro"
  );
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
    case "kiro":
      return {
        rootDir: getKiroSteeringDir(cwd),
        commandsDir: getKiroSteeringDir(cwd),
        rulesDir: getKiroSteeringDir(cwd),
        skillsDir: getKiroSkillsDir(cwd),
      };
  }
}

export function getTargetConfig(target: InstructionTarget): TargetConfig {
  return TARGET_CONFIGS[target];
}
