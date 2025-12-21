import { join } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { printSuccess } from "./branding";
import {
  deleteFile,
  dirExists,
  ensureDir,
  fileExists,
  getCopilotCommandsDir,
  getCopilotInstructionsDir,
  getCopilotInstructionsPath,
  getCopilotRulesDir,
  getCopilotSkillsDir,
  readFile,
  writeFile,
} from "./fs";
import {
  copyLocalSkill,
  extractFrontmatter,
  fetchMultipleTemplates,
  generateCopilotIndex,
  stripFrontmatter,
} from "./templates";

export interface CopilotInstallResult {
  commands: string[];
  rules: string[];
  skills: string[];
  alwaysApplyRules: string[];
}

async function installCopilotCommands(
  commandsDir: string,
  selectedCommands: string[],
): Promise<string[]> {
  if (selectedCommands.length === 0) return [];

  ensureDir(commandsDir);
  const commandsMap = await fetchMultipleTemplates("commands", selectedCommands);
  const installed: string[] = [];

  for (const [filename, content] of commandsMap) {
    const cleanContent = stripFrontmatter(content);
    const filePath = join(commandsDir, filename);
    writeFile(filePath, cleanContent);
    installed.push(filename);
  }

  return installed;
}

async function installCopilotRules(
  rulesDir: string,
  selectedRules: string[],
): Promise<{ installed: string[]; alwaysApply: string[] }> {
  if (selectedRules.length === 0) return { installed: [], alwaysApply: [] };

  ensureDir(rulesDir);
  const rulesMap = await fetchMultipleTemplates("rules", selectedRules);
  const installed: string[] = [];
  const alwaysApply: string[] = [];

  for (const [filename, content] of rulesMap) {
    const frontmatter = extractFrontmatter(content);
    const cleanContent = stripFrontmatter(content);

    // Templates are now .md, but handle .mdc for backward compatibility
    const mdFilename = filename.endsWith(".md") ? filename : filename.replace(/\.mdc$/, ".md");
    const filePath = join(rulesDir, mdFilename);
    writeFile(filePath, cleanContent);

    installed.push(mdFilename);

    if (frontmatter.alwaysApply) {
      alwaysApply.push(mdFilename);
    }
  }

  return { installed, alwaysApply };
}

async function installCopilotSkills(
  skillsDir: string,
  selectedSkills: string[],
): Promise<string[]> {
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

  const hasExistingDir = dirExists(copilotDir);
  const hasExistingIndex = fileExists(copilotIndexPath);
  const hasExistingSkills = dirExists(claudeSkillsDir);

  if ((hasExistingDir || hasExistingIndex || hasExistingSkills) && !force) {
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

export async function installCopilotInstructions(
  cwd: string,
  selectedCommands: string[],
  selectedRules: string[],
  selectedSkills: string[],
): Promise<CopilotInstallResult> {
  const commandsDir = getCopilotCommandsDir(cwd);
  const rulesDir = getCopilotRulesDir(cwd);
  const skillsDir = getCopilotSkillsDir(cwd);
  const copilotIndexPath = getCopilotInstructionsPath(cwd);

  const [installedCommands, rulesResult, installedSkills] = await Promise.all([
    installCopilotCommands(commandsDir, selectedCommands),
    installCopilotRules(rulesDir, selectedRules),
    installCopilotSkills(skillsDir, selectedSkills),
  ]);

  const installedRules = rulesResult.installed;
  const alwaysApplyRules = rulesResult.alwaysApply;

  const indexContent = generateCopilotIndex(
    installedCommands,
    installedRules,
    installedSkills,
    alwaysApplyRules,
  );

  writeFile(copilotIndexPath, indexContent);

  printSuccess("GitHub Copilot instructions generated");
  console.log(pc.dim(`   └─ ${copilotIndexPath}`));
  console.log(pc.dim(`   └─ ${getCopilotInstructionsDir(cwd)}/`));
  if (installedSkills.length > 0) {
    console.log(pc.dim(`   └─ ${getCopilotSkillsDir(cwd)}/`));
  }

  return {
    commands: installedCommands,
    rules: installedRules.map((r) => r.replace(/\.md$/, "")),
    skills: installedSkills,
    alwaysApplyRules,
  };
}
