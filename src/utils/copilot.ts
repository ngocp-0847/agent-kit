import { join } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { printSuccess } from "./branding";
import {
  dirExists,
  ensureDir,
  fileExists,
  getCopilotInstructionsDir,
  getCopilotInstructionsPath,
  getCopilotPromptsDir,
  getCopilotRulesDir,
  getCopilotSkillsDir,
  writeFile,
} from "./fs";
import {
  copyLocalSkill,
  fetchMultipleTemplates,
  generateCopilotIndex,
  stripFrontmatter,
} from "./templates";

export interface CopilotInstallResult {
  commands: string[];
  rules: string[];
  skills: string[];
}

function installCopilotCommands(
  promptsDir: string,
  selectedCommands: string[],
): string[] {
  if (selectedCommands.length === 0) return [];

  ensureDir(promptsDir);
  const commandsMap = fetchMultipleTemplates("commands", selectedCommands);
  const installed: string[] = [];

  for (const [filename, content] of commandsMap) {
    const cleanContent = stripFrontmatter(content);
    // Convert .md to .prompt.md for VS Code Copilot prompt files
    const promptFilename = filename.replace(/\.md$/, ".prompt.md");
    const filePath = join(promptsDir, promptFilename);
    writeFile(filePath, cleanContent);
    installed.push(promptFilename);
  }

  return installed;
}

function installCopilotRules(
  rulesDir: string,
  selectedRules: string[],
): { installed: string[] } {
  if (selectedRules.length === 0) return { installed: [] };

  ensureDir(rulesDir);
  const rulesMap = fetchMultipleTemplates("rules", selectedRules);
  const installed: string[] = [];

  for (const [filename, content] of rulesMap) {
    // Convert to .instructions.md format for VS Code Copilot
    // Keep frontmatter with applyTo glob pattern
    const baseName = filename.replace(/\.(md|mdc)$/, "");
    const instructionsFilename = `${baseName}.instructions.md`;
    const filePath = join(rulesDir, instructionsFilename);
    writeFile(filePath, content);

    installed.push(instructionsFilename);
  }

  return { installed };
}

function installCopilotSkills(
  skillsDir: string,
  selectedSkills: string[],
): string[] {
  if (selectedSkills.length === 0) return [];

  ensureDir(skillsDir);
  const installed: string[] = [];

  for (const skillName of selectedSkills) {
    const success = copyLocalSkill(skillName, skillsDir, false); // Don't convert to .mdc for GitHub Copilot
    if (!success) continue;

    const skillTargetDir = join(skillsDir, skillName);
    const skillMdPath = join(skillTargetDir, "SKILL.md");

    // For GitHub Copilot, keep the frontmatter with name and description
    if (fileExists(skillMdPath)) {
      // Skills should keep their frontmatter for GitHub Copilot (Claude format)
      // No need to strip frontmatter like we do for other templates
      installed.push(skillName);
    }
  }

  return installed;
}

export async function checkCopilotConflicts(cwd: string, force: boolean): Promise<boolean> {
  const copilotDir = getCopilotInstructionsDir(cwd);
  const copilotIndexPath = getCopilotInstructionsPath(cwd);
  const claudeSkillsDir = getCopilotSkillsDir(cwd);
  const promptsDir = getCopilotPromptsDir(cwd);

  const hasExistingDir = dirExists(copilotDir);
  const hasExistingIndex = fileExists(copilotIndexPath);
  const hasExistingSkills = dirExists(claudeSkillsDir);
  const hasExistingPrompts = dirExists(promptsDir);

  if ((hasExistingDir || hasExistingIndex || hasExistingSkills || hasExistingPrompts) && !force) {
    const overwrite = await p.confirm({
      message: "GitHub Copilot instructions already exist. Overwrite?",
      initialValue: false,
    });

    if (p.isCancel(overwrite) || !overwrite) {
      return false;
    }
  }

  return true;
}

export function installCopilotInstructions(
  cwd: string,
  selectedCommands: string[],
  selectedRules: string[],
  selectedSkills: string[],
): CopilotInstallResult {
  const promptsDir = getCopilotPromptsDir(cwd);
  const instructionsDir = getCopilotRulesDir(cwd);
  const skillsDir = getCopilotSkillsDir(cwd);
  const copilotIndexPath = getCopilotInstructionsPath(cwd);

  const installedCommands = installCopilotCommands(promptsDir, selectedCommands);
  const rulesResult = installCopilotRules(instructionsDir, selectedRules);
  const installedSkills = installCopilotSkills(skillsDir, selectedSkills);

  const installedRules = rulesResult.installed;

  const indexContent = generateCopilotIndex(
    installedCommands,
    installedRules,
    installedSkills,
  );

  writeFile(copilotIndexPath, indexContent);

  printSuccess("GitHub Copilot instructions generated");
  console.log(pc.dim(`   └─ ${copilotIndexPath}`));
  if (installedCommands.length > 0) {
    console.log(pc.dim(`   └─ ${promptsDir}/`));
  }
  if (installedRules.length > 0) {
    console.log(pc.dim(`   └─ ${instructionsDir}/`));
  }
  if (installedSkills.length > 0) {
    console.log(pc.dim(`   └─ ${skillsDir}/`));
  }

  return {
    commands: installedCommands,
    rules: installedRules.map((r) => r.replace(/\.instructions\.md$/, "")),
    skills: installedSkills,
  };
}
