import { join } from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { downloadTemplate } from "giget";
import pc from "picocolors";
import type { InstructionTarget } from "../types/init";
import { highlight, printDivider, printInfo, printSuccess } from "../utils/branding";
import { REPO_REF, REPO_URL } from "../utils/constants";
import { ensureDir, listDirs, listFiles, readFile, writeFile } from "../utils/fs";
import {
  getTargetConfig,
  getTargetDirectories,
  isValidTarget,
  promptTargetSelection,
} from "../utils/target";
import {
  convertMdToMdc,
  transformCommandToWorkflow,
  transformRuleForAntiGravity,
  transformTocContentForCursor,
} from "../utils/templates";
import {
  getInstalledPowers,
  installPowerFromLocal,
  getPowerDisplayName,
  validatePowerCompatibility,
  listAvailablePowers,
} from "../utils/power";

async function convertPulledFilesForTarget(
  target: InstructionTarget,
  directories: ReturnType<typeof getTargetDirectories>,
): Promise<void> {
  const { commandsDir, rulesDir, skillsDir } = directories;

  if (target === "cursor") {
    const ruleFiles = listFiles(rulesDir, ".md");
    for (const file of ruleFiles) {
      const sourcePath = join(rulesDir, file);
      const content = readFile(sourcePath);
      const mdcFilename = convertMdToMdc(file);
      const destPath = join(rulesDir, mdcFilename);

      let transformedContent = content;
      if (file === "toc.md") {
        transformedContent = transformTocContentForCursor(content);
      }

      writeFile(destPath, transformedContent);

      const { rmSync } = await import("node:fs");
      rmSync(sourcePath);
    }

    const skillDirs = listDirs(skillsDir);
    for (const skillDir of skillDirs) {
      const skillPath = join(skillsDir, skillDir);
      const skillMdPath = join(skillPath, "SKILL.md");
      const skillMdcPath = join(skillPath, "SKILL.mdc");

      const { existsSync } = await import("node:fs");
      if (existsSync(skillMdPath)) {
        const content = readFile(skillMdPath);
        writeFile(skillMdcPath, content);
        const { rmSync } = await import("node:fs");
        rmSync(skillMdPath);
      }
    }
  } else if (target === "google-antigravity") {
    const ruleFiles = listFiles(rulesDir, ".md");
    for (const file of ruleFiles) {
      const sourcePath = join(rulesDir, file);
      const content = readFile(sourcePath);
      const transformedContent = transformRuleForAntiGravity(content, file);
      writeFile(sourcePath, transformedContent);
    }

    const commandFiles = listFiles(commandsDir, ".md");
    for (const file of commandFiles) {
      const sourcePath = join(commandsDir, file);
      const content = readFile(sourcePath);
      const transformedContent = transformCommandToWorkflow(content, file);
      writeFile(sourcePath, transformedContent);
    }
  }
}

/**
 * Updates all installed Powers to their latest versions
 */
async function updateInstalledPowers(spinner: any): Promise<void> {
  const installedPowers = getInstalledPowers();
  
  if (installedPowers.length === 0) {
    return;
  }

  spinner.start("Checking for Power updates...");
  
  try {
    // Get available powers from local templates
    const availablePowers = listAvailablePowers();
    const updatesAvailable: Array<{ current: any; latest: any }> = [];
    
    // Check each installed Power for updates
    for (const installedPower of installedPowers) {
      const latestPower = availablePowers.find(p => p.name === installedPower.name);
      
      if (latestPower && latestPower.version !== installedPower.version) {
        updatesAvailable.push({
          current: installedPower,
          latest: latestPower,
        });
      }
    }
    
    if (updatesAvailable.length === 0) {
      spinner.stop("All Powers are up to date");
      return;
    }
    
    spinner.stop(`Found ${updatesAvailable.length} Power update${updatesAvailable.length !== 1 ? 's' : ''}`);
    
    // Update each Power
    for (const { current, latest } of updatesAvailable) {
      spinner.start(`Updating ${getPowerDisplayName(current.name)} v${current.version} → v${latest.version}...`);
      
      try {
        // Validate compatibility
        const compatibility = validatePowerCompatibility(latest);
        if (!compatibility.valid) {
          spinner.stop(`Skipped ${current.name}: ${compatibility.errors.join(', ')}`);
          continue;
        }
        
        // Install from local templates
        const updateResult = await installPowerFromLocal(latest.name, process.cwd());
        
        if (updateResult.errors.length > 0) {
          spinner.stop(`Failed to update ${current.name}: ${updateResult.errors.join(', ')}`);
          continue;
        }
        
        spinner.stop(`Updated ${getPowerDisplayName(current.name)} to v${latest.version}`);
        
      } catch (error) {
        spinner.stop(`Failed to update ${current.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
  } catch (error) {
    spinner.stop(`Failed to check for updates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const pullCommand = defineCommand({
  meta: {
    name: "pull",
    description: "Pull latest updates from agent-kit repository and update installed Powers",
  },
  args: {
    commands: {
      type: "boolean",
      alias: "c",
      description: "Only pull commands",
      default: false,
    },
    rules: {
      type: "boolean",
      alias: "r",
      description: "Only pull rules",
      default: false,
    },
    skills: {
      type: "boolean",
      alias: "s",
      description: "Only pull skills",
      default: false,
    },
    powers: {
      type: "boolean",
      alias: "p",
      description: "Only update installed Powers to latest versions (Kiro only)",
      default: false,
    },
    force: {
      type: "boolean",
      alias: "f",
      description: "Force overwrite without confirmation",
      default: false,
    },
    target: {
      type: "string",
      alias: "t",
      description: "Target IDE: 'cursor', 'github-copilot', or 'google-antigravity'",
    },
  },
  async run({ args }) {
    const pullAll = !args.commands && !args.rules && !args.skills && !args.powers;
    const shouldPullCommands = pullAll || args.commands;
    const shouldPullRules = pullAll || args.rules;
    const shouldPullSkills = pullAll || args.skills;
    const shouldUpdatePowers = pullAll || args.powers;

    p.intro(pc.bgCyan(pc.black(" cursor-kit pull ")));

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
    const { rootDir, commandsDir, rulesDir, skillsDir } = directories;

    const rulesExtension = target === "cursor" ? ".mdc" : ".md";
    const existingCommands = listFiles(commandsDir, ".md");
    const existingRules = listFiles(rulesDir, rulesExtension);
    const existingSkills = listDirs(skillsDir);
    const existingPowers = getInstalledPowers();
    const hasExisting =
      existingCommands.length > 0 || existingRules.length > 0 || existingSkills.length > 0 || existingPowers.length > 0;

    console.log(pc.dim(`  Target: ${highlight(targetConfig.label)}`));
    console.log();

    if (hasExisting && !args.force) {
      printInfo("Current status:");
      if (existingCommands.length > 0) {
        console.log(pc.dim(`  ${targetConfig.commandsLabel}: ${existingCommands.length} files`));
      }
      if (existingRules.length > 0) {
        console.log(pc.dim(`  ${targetConfig.rulesLabel}: ${existingRules.length} files`));
      }
      if (existingSkills.length > 0) {
        console.log(pc.dim(`  Skills: ${existingSkills.length} directories`));
      }
      if (existingPowers.length > 0) {
        console.log(pc.dim(`  Powers: ${existingPowers.length} installed`));
      }
      console.log();

      const shouldContinue = await p.confirm({
        message: "This will merge with existing files. Continue?",
        initialValue: true,
      });

      if (p.isCancel(shouldContinue) || !shouldContinue) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
    }

    const s = p.spinner();

    try {
      ensureDir(rootDir);

      if (shouldPullCommands) {
        s.start(`Pulling ${targetConfig.commandsLabel}...`);
        await downloadTemplate(`${REPO_URL}/templates/commands#${REPO_REF}`, {
          dir: commandsDir,
          force: true,
        });
        s.stop(
          `${targetConfig.commandsLabel.charAt(0).toUpperCase() + targetConfig.commandsLabel.slice(1)} updated`,
        );
      }

      if (shouldPullRules) {
        s.start(`Pulling ${targetConfig.rulesLabel}...`);
        await downloadTemplate(`${REPO_URL}/templates/rules#${REPO_REF}`, {
          dir: rulesDir,
          force: true,
        });
        s.stop(
          `${targetConfig.rulesLabel.charAt(0).toUpperCase() + targetConfig.rulesLabel.slice(1)} updated`,
        );
      }

      if (shouldPullSkills) {
        s.start("Pulling skills...");
        await downloadTemplate(`${REPO_URL}/templates/skills#${REPO_REF}`, {
          dir: skillsDir,
          force: true,
        });
        s.stop("Skills updated");
      }

      if (shouldUpdatePowers) {
        await updateInstalledPowers(s);
      }

      if (target !== "github-copilot") {
        s.start("Converting files for target...");
        await convertPulledFilesForTarget(target, directories);
        s.stop("Files converted");
      }

      printDivider();
      console.log();

      const newRulesExtension = target === "cursor" ? ".mdc" : ".md";
      const newCommands = listFiles(commandsDir, ".md");
      const newRules = listFiles(rulesDir, newRulesExtension);
      const newSkills = listDirs(skillsDir);

      if (shouldPullCommands) {
        const added = newCommands.length - existingCommands.length;
        printSuccess(
          `${targetConfig.commandsLabel.charAt(0).toUpperCase() + targetConfig.commandsLabel.slice(1)}: ${highlight(newCommands.length.toString())} total` +
            (added > 0 ? pc.green(` (+${added} new)`) : ""),
        );
      }

      if (shouldPullRules) {
        const added = newRules.length - existingRules.length;
        printSuccess(
          `${targetConfig.rulesLabel.charAt(0).toUpperCase() + targetConfig.rulesLabel.slice(1)}: ${highlight(newRules.length.toString())} total` +
            (added > 0 ? pc.green(` (+${added} new)`) : ""),
        );
      }

      if (shouldPullSkills) {
        const added = newSkills.length - existingSkills.length;
        printSuccess(
          `Skills: ${highlight(newSkills.length.toString())} total` +
            (added > 0 ? pc.green(` (+${added} new)`) : ""),
        );
      }

      if (shouldUpdatePowers) {
        const updatedPowers = getInstalledPowers();
        const updated = updatedPowers.length - existingPowers.length;
        printSuccess(
          `Powers: ${highlight(updatedPowers.length.toString())} total` +
            (updated !== 0 ? pc.green(` (${updated > 0 ? '+' : ''}${updated} changes)`) : ""),
        );
      }

      console.log();
      p.outro(pc.green(`✨ Successfully pulled latest updates for ${targetConfig.label}!`));
    } catch (error) {
      s.stop("Failed");
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});
