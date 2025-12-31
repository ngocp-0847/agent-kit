import { join } from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import type { InstructionTarget } from "../types/init";
import type { PowerInfo } from "../types/power";
import { highlight, printDivider, printSuccess } from "../utils/branding";
import { checkCopilotConflicts, installCopilotInstructions } from "../utils/copilot";
import {
  ensureDir,
  getAgentDir,
  getAgentRulesDir,
  getAgentSkillsDir,
  getAgentWorkflowsDir,
  getCommandsDir,
  getConflictingDirs,
  getConflictingFiles,
  getCursorDir,
  getKiroMcpConfigPath,
  getKiroSettingsDir,
  getKiroSkillsDir,
  getKiroSteeringDir,
  getRulesDir,
  getSkillsDir,
  writeFile,
} from "../utils/fs";
import {
  MCP_SERVER_TEMPLATES,
  getMcpConfigPath,
  getMcpServerSetupInstructions,
  installMcpServers,
  promptMcpServerSelection,
} from "../utils/mcp";
import {
  formatPowerRequirements,
  getPowerComponentInfo,
  getPowerRegistry,
  installPowerFromLocal,
  isPowerInstalled,
} from "../utils/power";
import {
  type TemplateManifest,
  type TemplateType,
  convertMdToMdc,
  copyLocalSkill,
  copyLocalSkillForAntiGravity,
  fetchMultipleTemplates,
  fetchTemplateManifest,
  getSkillLabel,
  getTemplateLabel,
  transformCommandToWorkflow,
  transformRuleForAntiGravity,
  transformTocContentForCursor,
} from "../utils/templates";

type ConflictStrategy = "overwrite" | "merge" | "cancel";

interface InitResult {
  added: string[];
  skipped: string[];
}

async function promptTargetSelection(): Promise<InstructionTarget | symbol> {
  return await p.select({
    message: "Which AI IDE are you using?",
    options: [
      {
        value: "github-copilot" as const,
        label: "GitHub Copilot (VSCode)",
        hint: "Generate .github/copilot-instructions.md",
      },
      {
        value: "cursor" as const,
        label: "Cursor",
        hint: "Generate .cursor/ directory structure",
      },
      {
        value: "google-antigravity" as const,
        label: "Google AntiGravity",
        hint: "Generate .agent/ directory with rules and workflows",
      },
      {
        value: "kiro" as const,
        label: "Kiro",
        hint: "Generate .kiro/steering/ directory with MCP support",
      },
    ],
    initialValue: "github-copilot",
  });
}

async function handleCopilotInstallation(
  cwd: string,
  manifest: TemplateManifest,
  args: {
    all?: boolean;
    commands?: boolean;
    rules?: boolean;
    skills?: boolean;
    force?: boolean;
  },
  shouldInitCommands: boolean,
  shouldInitRules: boolean,
  shouldInitSkills: boolean,
): Promise<void> {
  const s = p.spinner();

  const canProceed = await checkCopilotConflicts(cwd, args.force ?? false);
  if (!canProceed) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  let selectedCommands: string[] = [];
  let selectedRules: string[] = [];
  let selectedSkills: string[] = [];

  if (shouldInitCommands) {
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
  }

  if (shouldInitRules) {
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
  }

  if (shouldInitSkills) {
    if (args.all) {
      selectedSkills = manifest.skills;
    } else {
      const selection = await selectTemplates("skills", manifest.skills);
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      selectedSkills = selection;
    }
  }

  // Prompt for MCP servers
  let selectedMcpServers: string[] = [];
  if (args.all) {
    selectedMcpServers = Object.keys(MCP_SERVER_TEMPLATES);
  } else {
    const mcpSelection = await promptMcpServerSelection();
    if (p.isCancel(mcpSelection)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }
    selectedMcpServers = mcpSelection;
  }

  if (
    selectedCommands.length === 0 &&
    selectedRules.length === 0 &&
    selectedSkills.length === 0 &&
    selectedMcpServers.length === 0
  ) {
    p.cancel("No templates selected");
    process.exit(0);
  }

  try {
    s.start("Installing GitHub Copilot instructions...");
    const result = await installCopilotInstructions(
      cwd,
      selectedCommands,
      selectedRules,
      selectedSkills,
    );

    // Install MCP servers
    let mcpResult = { added: [] as string[], skipped: [] as string[] };
    if (selectedMcpServers.length > 0) {
      const mcpConfigPath = getMcpConfigPath("github-copilot", cwd);
      mcpResult = installMcpServers(mcpConfigPath, selectedMcpServers, "github-copilot");
    }

    s.stop("GitHub Copilot instructions installed");

    printDivider();
    console.log();

    if (result.commands.length > 0) {
      printSuccess(`Commands: ${highlight(result.commands.length.toString())} added`);
      for (const cmd of result.commands) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${cmd}`));
      }
    }

    if (result.rules.length > 0) {
      printSuccess(`Rules: ${highlight(result.rules.length.toString())} added`);
      for (const rule of result.rules) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${rule}`));
      }
    }

    if (result.skills.length > 0) {
      printSuccess(`Skills: ${highlight(result.skills.length.toString())} added`);
      for (const skill of result.skills) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${skill}`));
      }
    }

    if (mcpResult.added.length > 0 || mcpResult.skipped.length > 0) {
      printSuccess(
        `MCP servers: ${highlight(mcpResult.added.length.toString())} added${
          mcpResult.skipped.length > 0
            ? `, ${pc.yellow(mcpResult.skipped.length.toString())} skipped`
            : ""
        }`,
      );
      for (const server of mcpResult.added) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${server}`));
      }
      for (const server of mcpResult.skipped) {
        console.log(pc.dim(`   └─ ${pc.yellow("○")} ${server} (already exists)`));
      }
    }

    // Show MCP setup instructions if servers were added
    if (mcpResult.added.length > 0) {
      console.log();
      console.log(pc.cyan("📋 MCP Server Setup Instructions:"));
      console.log();
      const instructions = getMcpServerSetupInstructions(mcpResult.added);
      console.log(pc.dim(instructions));
    }

    console.log();
    p.outro(pc.green("✨ GitHub Copilot instructions created successfully!"));
  } catch (error) {
    s.stop("Failed");
    p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    process.exit(1);
  }
}

async function handleAntiGravityInstallation(
  cwd: string,
  manifest: TemplateManifest,
  args: {
    all?: boolean;
    commands?: boolean;
    rules?: boolean;
    skills?: boolean;
    force?: boolean;
  },
  shouldInitCommands: boolean,
  shouldInitRules: boolean,
  shouldInitSkills: boolean,
): Promise<void> {
  const s = p.spinner();
  const agentDir = getAgentDir(cwd);
  const rulesDir = getAgentRulesDir(cwd);
  const workflowsDir = getAgentWorkflowsDir(cwd);
  const skillsDir = getAgentSkillsDir(cwd);

  // Check for existing conflicts
  const existingRules = getConflictingFiles(rulesDir, manifest.rules);
  const existingWorkflows = getConflictingFiles(workflowsDir, manifest.commands);
  const existingSkills = getConflictingDirs(skillsDir, manifest.skills);

  if (
    (existingRules.length > 0 || existingWorkflows.length > 0 || existingSkills.length > 0) &&
    !args.force
  ) {
    console.log();
    console.log(pc.yellow("⚠ Existing files found:"));
    for (const file of [...existingRules, ...existingWorkflows, ...existingSkills]) {
      console.log(pc.dim(`   └─ ${file}`));
    }
    console.log();

    const proceed = await p.confirm({
      message: "Overwrite existing files?",
      initialValue: false,
    });

    if (p.isCancel(proceed) || !proceed) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }
  }

  let selectedCommands: string[] = [];
  let selectedRules: string[] = [];
  let selectedSkills: string[] = [];

  // Commands become workflows in AntiGravity
  if (shouldInitCommands) {
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
  }

  if (shouldInitRules) {
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
  }

  if (shouldInitSkills) {
    if (args.all) {
      selectedSkills = manifest.skills;
    } else {
      const selection = await selectTemplates("skills", manifest.skills);
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      selectedSkills = selection;
    }
  }

  if (selectedCommands.length === 0 && selectedRules.length === 0 && selectedSkills.length === 0) {
    p.cancel("No templates selected");
    process.exit(0);
  }

  const results = {
    workflows: [] as string[],
    rules: [] as string[],
    skills: [] as string[],
  };

  try {
    ensureDir(agentDir);
    ensureDir(rulesDir);
    ensureDir(workflowsDir);
    ensureDir(skillsDir);

    // Install commands as workflows
    if (selectedCommands.length > 0) {
      s.start("Installing workflows...");
      const templates = await fetchMultipleTemplates("commands", selectedCommands);

      for (const [filename, content] of templates) {
        const transformedContent = transformCommandToWorkflow(content, filename);
        const filePath = join(workflowsDir, filename);
        writeFile(filePath, transformedContent);
        results.workflows.push(filename);
      }
      s.stop("Workflows installed");
    }

    // Install rules with AntiGravity format
    if (selectedRules.length > 0) {
      s.start("Installing rules...");
      const templates = await fetchMultipleTemplates("rules", selectedRules);

      for (const [filename, content] of templates) {
        const transformedContent = transformRuleForAntiGravity(content, filename);
        const filePath = join(rulesDir, filename);
        writeFile(filePath, transformedContent);
        results.rules.push(filename);
      }
      s.stop("Rules installed");
    }

    // Install skills with AntiGravity format
    if (selectedSkills.length > 0) {
      s.start("Installing skills...");
      for (const skillName of selectedSkills) {
        const success = copyLocalSkillForAntiGravity(skillName, skillsDir);
        if (success) {
          results.skills.push(skillName);
        }
      }
      s.stop("Skills installed");
    }

    printDivider();
    console.log();

    if (results.workflows.length > 0) {
      printSuccess(`Workflows: ${highlight(results.workflows.length.toString())} added`);
      for (const wf of results.workflows) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${wf}`));
      }
    }

    if (results.rules.length > 0) {
      printSuccess(`Rules: ${highlight(results.rules.length.toString())} added`);
      for (const rule of results.rules) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${rule}`));
      }
    }

    if (results.skills.length > 0) {
      printSuccess(`Skills: ${highlight(results.skills.length.toString())} added`);
      for (const skill of results.skills) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${skill}`));
      }
    }

    console.log();
    p.outro(pc.green("✨ Google AntiGravity configuration created successfully!"));
  } catch (error) {
    s.stop("Failed");
    p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    process.exit(1);
  }
}

async function handleKiroInstallation(
  cwd: string,
  manifest: TemplateManifest,
  args: {
    all?: boolean;
    commands?: boolean;
    rules?: boolean;
    skills?: boolean;
    mcp?: boolean;
    powers?: boolean;
    force?: boolean;
  },
  shouldInitCommands: boolean,
  shouldInitRules: boolean,
  shouldInitSkills: boolean,
  shouldInitMcp: boolean,
  shouldInitPowers: boolean,
): Promise<void> {
  const s = p.spinner();
  const kiroDir = getKiroSteeringDir(cwd);
  const skillsDir = getKiroSkillsDir(cwd);
  const mcpConfigPath = getKiroMcpConfigPath(cwd);

  // Check for existing conflicts
  const allTemplates = [...manifest.commands, ...manifest.rules];
  const existingFiles = getConflictingFiles(kiroDir, allTemplates);
  const existingSkills = getConflictingDirs(skillsDir, manifest.skills);

  if ((existingFiles.length > 0 || existingSkills.length > 0) && !args.force) {
    console.log();
    console.log(pc.yellow("⚠ Existing files found:"));
    for (const file of [...existingFiles, ...existingSkills]) {
      console.log(pc.dim(`   └─ ${file}`));
    }
    console.log();

    const proceed = await p.confirm({
      message: "Overwrite existing files?",
      initialValue: false,
    });

    if (p.isCancel(proceed) || !proceed) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }
  }

  let selectedCommands: string[] = [];
  let selectedRules: string[] = [];
  let selectedSkills: string[] = [];
  let selectedMcpServers: string[] = [];
  let selectedPowers: PowerInfo[] = [];

  // Commands and rules go to the same steering directory in Kiro
  if (shouldInitCommands) {
    if (args.all) {
      selectedCommands = manifest.commands;
    } else {
      const selection = await selectTemplates("commands", manifest.commands);
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      selectedCommands = selection as string[];
    }
  }

  if (shouldInitRules) {
    if (args.all) {
      selectedRules = manifest.rules;
    } else {
      const selection = await selectTemplates("rules", manifest.rules);
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      selectedRules = selection as string[];
    }
  }

  if (shouldInitSkills) {
    if (args.all) {
      selectedSkills = manifest.skills;
    } else {
      const selection = await selectTemplates("skills", manifest.skills);
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      selectedSkills = selection as string[];
    }
  }

  if (shouldInitMcp) {
    if (args.all) {
      selectedMcpServers = ["context7", "serena"];
    } else {
      const selection = await promptMcpServerSelection();
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      selectedMcpServers = selection as string[];
    }
  }

  if (shouldInitPowers) {
    try {
      const powerRegistry = await getPowerRegistry(cwd);
      if (args.all) {
        selectedPowers = powerRegistry.powers;
      } else {
        const selection = await promptPowerSelection(powerRegistry.powers);
        if (p.isCancel(selection)) {
          p.cancel("Operation cancelled");
          process.exit(0);
        }
        selectedPowers = selection as PowerInfo[];
      }
    } catch (error) {
      p.cancel(
        `Failed to fetch Power registry: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      process.exit(1);
    }
  }

  if (
    selectedCommands.length === 0 &&
    selectedRules.length === 0 &&
    selectedSkills.length === 0 &&
    selectedMcpServers.length === 0 &&
    selectedPowers.length === 0
  ) {
    p.cancel("No templates selected");
    process.exit(0);
  }

  const results = {
    steering: [] as string[],
    skills: [] as string[],
    mcpServers: { added: [] as string[], skipped: [] as string[] },
    powers: { added: [] as string[], skipped: [] as string[], errors: [] as string[] },
  };

  try {
    ensureDir(kiroDir);
    ensureDir(skillsDir);
    ensureDir(getKiroSettingsDir(cwd));

    // Install commands and rules as steering files
    const allSteeringTemplates = [...selectedCommands, ...selectedRules];
    if (allSteeringTemplates.length > 0) {
      s.start("Installing steering files...");
      const templates = await fetchMultipleTemplates("commands", selectedCommands);
      const ruleTemplates = await fetchMultipleTemplates("rules", selectedRules);

      // Merge templates
      for (const [filename, content] of templates) {
        const filePath = join(kiroDir, filename);
        writeFile(filePath, content);
        results.steering.push(filename);
      }

      for (const [filename, content] of ruleTemplates) {
        const filePath = join(kiroDir, filename);
        writeFile(filePath, content);
        results.steering.push(filename);
      }
      s.stop("Steering files installed");
    }

    // Install skills
    if (selectedSkills.length > 0) {
      s.start("Installing skills...");
      for (const skillName of selectedSkills) {
        const success = copyLocalSkill(skillName, skillsDir, false); // Keep .md for Kiro
        if (success) {
          results.skills.push(skillName);
        }
      }
      s.stop("Skills installed");
    }

    // Install MCP servers
    if (selectedMcpServers.length > 0) {
      s.start("Installing MCP servers...");
      results.mcpServers = installMcpServers(mcpConfigPath, selectedMcpServers, "kiro");
      s.stop("MCP servers installed");
    }

    // Install Powers
    if (selectedPowers.length > 0) {
      s.start("Installing Powers...");
      results.powers = await installPowers(selectedPowers, cwd);
      s.stop("Powers installed");
    }

    printDivider();
    console.log();

    if (results.steering.length > 0) {
      printSuccess(`Steering files: ${highlight(results.steering.length.toString())} added`);
      for (const file of results.steering) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${file}`));
      }
    }

    if (results.skills.length > 0) {
      printSuccess(`Skills: ${highlight(results.skills.length.toString())} added`);
      for (const skill of results.skills) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${skill}`));
      }
    }

    if (results.mcpServers.added.length > 0 || results.mcpServers.skipped.length > 0) {
      printSuccess(
        `MCP servers: ${highlight(results.mcpServers.added.length.toString())} added${
          results.mcpServers.skipped.length > 0
            ? `, ${pc.yellow(results.mcpServers.skipped.length.toString())} skipped`
            : ""
        }`,
      );
      for (const server of results.mcpServers.added) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${server}`));
      }
      for (const server of results.mcpServers.skipped) {
        console.log(pc.dim(`   └─ ${pc.yellow("○")} ${server} (already exists)`));
      }
    }

    if (
      results.powers.added.length > 0 ||
      results.powers.skipped.length > 0 ||
      results.powers.errors.length > 0
    ) {
      printSuccess(
        `Powers: ${highlight(results.powers.added.length.toString())} added${
          results.powers.skipped.length > 0
            ? `, ${pc.yellow(results.powers.skipped.length.toString())} skipped`
            : ""
        }${
          results.powers.errors.length > 0
            ? `, ${pc.red(results.powers.errors.length.toString())} failed`
            : ""
        }`,
      );
      for (const power of results.powers.added) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${power}`));
      }
      for (const power of results.powers.skipped) {
        console.log(pc.dim(`   └─ ${pc.yellow("○")} ${power} (already exists)`));
      }
      for (const error of results.powers.errors) {
        console.log(pc.dim(`   └─ ${pc.red("✗")} ${error}`));
      }
    }

    // Show setup instructions for MCP servers
    if (results.mcpServers.added.length > 0) {
      console.log();
      console.log(pc.cyan("📋 MCP Server Setup Instructions:"));
      console.log();
      const instructions = getMcpServerSetupInstructions(results.mcpServers.added);
      console.log(pc.dim(instructions));
    }

    // Show setup instructions for Powers
    if (results.powers.added.length > 0) {
      console.log();
      console.log(pc.cyan("🔌 Power Setup Instructions:"));
      console.log();

      for (const powerName of results.powers.added) {
        const powerInfo = selectedPowers.find((p) => p.name === powerName);
        if (powerInfo?.setupInstructions) {
          console.log(pc.dim(`${powerInfo.displayName}:`));
          console.log(pc.dim(powerInfo.setupInstructions));
          console.log();
        }
      }

      console.log(
        pc.dim("Powers have been installed and configured. MCP servers are ready to use in Kiro."),
      );
      console.log(pc.dim("Steering files are available in .kiro/steering/ directory."));
    }

    console.log();
    p.outro(pc.green("✨ Kiro configuration created successfully!"));
  } catch (error) {
    s.stop("Failed");
    p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    process.exit(1);
  }
}

async function selectTemplates(
  type: TemplateType,
  availableTemplates: string[],
): Promise<string[] | symbol> {
  const labelFn = type === "skills" ? getSkillLabel : getTemplateLabel;

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
      label: labelFn(template),
      hint: template,
    })),
    required: true,
  });

  return selectedTemplates as string[] | symbol;
}

async function handleConflicts(
  type: TemplateType,
  conflictingFiles: string[],
): Promise<ConflictStrategy | symbol> {
  console.log();
  console.log(pc.yellow(`⚠ ${conflictingFiles.length} existing ${type} found:`));
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
  conflictStrategy: ConflictStrategy,
  target: InstructionTarget,
): Promise<InitResult> {
  const result: InitResult = { added: [], skipped: [] };

  // For Cursor target, rules need .mdc extension, commands stay .md
  // For GitHub Copilot, everything stays .md
  const expectedFilenames = selectedTemplates.map((filename) => {
    if (target === "cursor" && type === "rules" && filename.endsWith(".md")) {
      return convertMdToMdc(filename);
    }
    return filename;
  });

  const conflictingFiles = getConflictingFiles(targetDir, expectedFilenames);

  let templatesToInstall: string[];

  if (conflictStrategy === "merge") {
    templatesToInstall = selectedTemplates.filter((t) => {
      const expectedName =
        target === "cursor" && type === "rules" && t.endsWith(".md") ? convertMdToMdc(t) : t;
      return !conflictingFiles.includes(expectedName);
    });
    result.skipped = conflictingFiles.filter((f) => expectedFilenames.includes(f));
  } else {
    templatesToInstall = selectedTemplates;
  }

  if (templatesToInstall.length === 0) {
    return result;
  }

  const templates = await fetchMultipleTemplates(type, templatesToInstall);

  ensureDir(targetDir);

  for (const [filename, content] of templates) {
    // Convert .md to .mdc for rules when target is cursor
    const outputFilename =
      target === "cursor" && type === "rules" && filename.endsWith(".md")
        ? convertMdToMdc(filename)
        : filename;

    // Transform toc.md content for Cursor to fix links
    let transformedContent = content;
    if (target === "cursor" && type === "rules" && filename === "toc.md") {
      transformedContent = transformTocContentForCursor(content);
    }

    const filePath = join(targetDir, outputFilename);
    writeFile(filePath, transformedContent);
    result.added.push(outputFilename);
  }

  return result;
}

async function installSkills(
  targetDir: string,
  selectedSkills: string[],
  conflictStrategy: ConflictStrategy,
  target: InstructionTarget,
): Promise<InitResult> {
  const result: InitResult = { added: [], skipped: [] };
  const conflictingDirs = getConflictingDirs(targetDir, selectedSkills);

  let skillsToInstall: string[];

  if (conflictStrategy === "merge") {
    skillsToInstall = selectedSkills.filter((s) => !conflictingDirs.includes(s));
    result.skipped = conflictingDirs.filter((d) => selectedSkills.includes(d));
  } else {
    skillsToInstall = selectedSkills;
  }

  if (skillsToInstall.length === 0) {
    return result;
  }

  ensureDir(targetDir);

  // Convert SKILL.md to SKILL.mdc for Cursor target
  const convertToMdc = target === "cursor";

  for (const skillName of skillsToInstall) {
    const success = copyLocalSkill(skillName, targetDir, convertToMdc);
    if (success) {
      result.added.push(skillName);
    }
  }

  return result;
}

/**
 * Prompts user to select Powers from the registry
 */
async function promptPowerSelection(availablePowers: PowerInfo[]): Promise<PowerInfo[] | symbol> {
  if (availablePowers.length === 0) {
    p.cancel("No Powers available in registry");
    process.exit(0);
  }

  const selectionMode = await p.select({
    message: `How would you like to add Powers?`,
    options: [
      {
        value: "all",
        label: `Add all ${availablePowers.length} Powers`,
        hint: "Install everything",
      },
      {
        value: "select",
        label: "Select specific Powers",
        hint: "Choose which ones to install",
      },
    ],
  });

  if (p.isCancel(selectionMode)) return selectionMode;

  if (selectionMode === "all") {
    return availablePowers;
  }

  const selectedPowers = await p.multiselect({
    message: `Select Powers to add:`,
    options: availablePowers.map((power) => {
      const componentInfo = getPowerComponentInfo(power);
      const requirements = formatPowerRequirements(power.requirements);

      let hint = `${componentInfo.mcpServerCount} MCP servers, ${componentInfo.steeringFileCount} steering files`;
      if (componentInfo.exampleCount > 0) {
        hint += `, ${componentInfo.exampleCount} examples`;
      }
      if (requirements.length > 0) {
        hint += ` | Requires: ${requirements.join(", ")}`;
      }

      return {
        value: power,
        label: `${power.displayName} (v${power.version})`,
        hint: `${power.description} | ${hint}`,
      };
    }),
    required: true,
  });

  return selectedPowers as PowerInfo[] | symbol;
}

/**
 * Installs selected Powers with progress tracking and detailed feedback
 */
async function installPowers(
  selectedPowers: PowerInfo[],
  cwd: string,
): Promise<{ added: string[]; skipped: string[]; errors: string[] }> {
  const result = { added: [] as string[], skipped: [] as string[], errors: [] as string[] };

  for (let i = 0; i < selectedPowers.length; i++) {
    const powerInfo = selectedPowers[i];
    const progress = `(${i + 1}/${selectedPowers.length})`;

    try {
      // Check if already installed
      if (isPowerInstalled(powerInfo.name, cwd)) {
        console.log(
          pc.dim(`   ${progress} ${pc.yellow("○")} ${powerInfo.displayName} (already installed)`),
        );
        result.skipped.push(powerInfo.name);
        continue;
      }

      // Show Power details
      const componentInfo = getPowerComponentInfo(powerInfo);
      console.log(pc.dim(`   ${progress} ${pc.blue("↓")} ${powerInfo.displayName}`));
      console.log(
        pc.dim(
          `       └─ ${componentInfo.mcpServerCount} MCP servers, ${componentInfo.steeringFileCount} steering files`,
        ),
      );

      if (componentInfo.exampleCount > 0) {
        console.log(pc.dim(`       └─ ${componentInfo.exampleCount} examples included`));
      }

      // Install Power from local templates
      console.log(pc.dim(`       └─ Installing from local templates...`));
      const installResult = await installPowerFromLocal(powerInfo.name, cwd);

      // Process installation results
      if (installResult.errors.length > 0) {
        console.log(pc.dim(`       └─ ${pc.red("✗")} Installation failed`));
        result.errors.push(...installResult.errors.map((err) => `${powerInfo.name}: ${err}`));
        continue;
      }

      // Show success details
      console.log(pc.dim(`       └─ ${pc.green("✓")} Installation completed successfully`));

      const addedMcpServers = installResult.added.filter((item) => item.startsWith("MCP server:"));
      const addedSteeringFiles = installResult.added.filter((item) =>
        item.startsWith("Steering file:"),
      );
      const skippedMcpServers = installResult.skipped.filter((item) =>
        item.startsWith("MCP server:"),
      );
      const skippedSteeringFiles = installResult.skipped.filter((item) =>
        item.startsWith("Steering file:"),
      );

      if (addedMcpServers.length > 0) {
        const serverNames = addedMcpServers.map((item) => item.replace("MCP server: ", ""));
        console.log(
          pc.dim(
            `       └─ ${pc.green("✓")} Added ${serverNames.length} MCP server(s): ${serverNames.join(", ")}`,
          ),
        );
      }

      if (skippedMcpServers.length > 0) {
        const serverNames = skippedMcpServers.map((item) => item.replace("MCP server: ", ""));
        console.log(
          pc.dim(
            `       └─ ${pc.yellow("○")} Skipped ${serverNames.length} existing MCP server(s): ${serverNames.join(", ")}`,
          ),
        );
      }

      if (addedSteeringFiles.length > 0) {
        const fileNames = addedSteeringFiles.map((item) => item.replace("Steering file: ", ""));
        console.log(
          pc.dim(
            `       └─ ${pc.green("✓")} Added ${fileNames.length} steering file(s): ${fileNames.join(", ")}`,
          ),
        );
      }

      if (skippedSteeringFiles.length > 0) {
        const fileNames = skippedSteeringFiles.map((item) => item.replace("Steering file: ", ""));
        console.log(
          pc.dim(
            `       └─ ${pc.yellow("○")} Skipped ${fileNames.length} existing steering file(s): ${fileNames.join(", ")}`,
          ),
        );
      }

      // Show warnings if any
      if (installResult.warnings.length > 0) {
        for (const warning of installResult.warnings) {
          console.log(pc.dim(`       └─ ${pc.yellow("⚠")} ${warning}`));
        }
      }

      console.log(
        pc.dim(`       └─ ${pc.green("✓")} ${powerInfo.displayName} installed successfully`),
      );
      result.added.push(powerInfo.name);
    } catch (error) {
      console.log(pc.dim(`       └─ ${pc.red("✗")} Failed to install ${powerInfo.displayName}`));
      result.errors.push(
        `${powerInfo.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  return result;
}

export const initCommand = defineCommand({
  meta: {
    name: "init",
    description: "Initialize .cursor/commands, .cursor/rules, and .cursor/skills in your project",
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
    skills: {
      type: "boolean",
      alias: "s",
      description: "Only initialize skills",
      default: false,
    },
    mcp: {
      type: "boolean",
      alias: "m",
      description: "Only initialize MCP servers for enhanced AI capabilities (Kiro only)",
      default: false,
    },
    powers: {
      type: "boolean",
      alias: "p",
      description:
        "Only initialize Powers - MCP servers and steering files for enhanced Kiro capabilities (Kiro only)",
      default: false,
    },
    all: {
      type: "boolean",
      alias: "a",
      description: "Install all templates without selection prompts",
      default: false,
    },
    target: {
      type: "string",
      alias: "t",
      description: "Target AI IDE: 'cursor', 'github-copilot', 'google-antigravity', or 'kiro'",
      default: undefined,
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const cursorDir = getCursorDir(cwd);
    const commandsDir = getCommandsDir(cwd);
    const rulesDir = getRulesDir(cwd);
    const skillsDir = getSkillsDir(cwd);

    const initAll = !args.commands && !args.rules && !args.skills && !args.mcp && !args.powers;
    const shouldInitCommands = initAll || args.commands;
    const shouldInitRules = initAll || args.rules;
    const shouldInitSkills = initAll || args.skills;
    const shouldInitMcp = initAll || args.mcp;
    const shouldInitPowers = initAll || args.powers;

    p.intro(pc.bgCyan(pc.black(" agent-kit init ")));

    let target: InstructionTarget;
    if (
      args.target === "github-copilot" ||
      args.target === "cursor" ||
      args.target === "google-antigravity" ||
      args.target === "kiro"
    ) {
      target = args.target;
    } else {
      const selection = await promptTargetSelection();
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      target = selection;
    }

    const s = p.spinner();

    let manifest: TemplateManifest;

    try {
      s.start("Fetching template manifest...");
      manifest = await fetchTemplateManifest();
      s.stop("Template manifest loaded");
    } catch (error) {
      s.stop("Failed to fetch manifest");
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }

    if (target === "github-copilot") {
      await handleCopilotInstallation(
        cwd,
        manifest,
        args,
        shouldInitCommands,
        shouldInitRules,
        shouldInitSkills,
      );
      return;
    }

    if (target === "google-antigravity") {
      await handleAntiGravityInstallation(
        cwd,
        manifest,
        args,
        shouldInitCommands,
        shouldInitRules,
        shouldInitSkills,
      );
      return;
    }

    if (target === "kiro") {
      await handleKiroInstallation(
        cwd,
        manifest,
        args,
        shouldInitCommands,
        shouldInitRules,
        shouldInitSkills,
        shouldInitMcp,
        shouldInitPowers,
      );
      return;
    }

    const results: {
      commands?: InitResult;
      rules?: InitResult;
      skills?: InitResult;
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

        const conflictingCommands = getConflictingFiles(commandsDir, selectedCommands);
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
          commandStrategy,
          target,
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

        // For Cursor, rules need .mdc extension, so check for .mdc files
        const expectedRuleFilenames = selectedRules.map((filename) => {
          return target === "cursor" && filename.endsWith(".md")
            ? convertMdToMdc(filename)
            : filename;
        });
        const conflictingRules = getConflictingFiles(rulesDir, expectedRuleFilenames);
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
          ruleStrategy,
          target,
        );
        s.stop("Rules installed");
      }

      if (shouldInitSkills) {
        let selectedSkills: string[];

        if (args.all) {
          selectedSkills = manifest.skills;
        } else {
          const selection = await selectTemplates("skills", manifest.skills);
          if (p.isCancel(selection)) {
            p.cancel("Operation cancelled");
            process.exit(0);
          }
          selectedSkills = selection;
        }

        const conflictingSkills = getConflictingDirs(skillsDir, selectedSkills);
        let skillStrategy: ConflictStrategy = "overwrite";

        if (conflictingSkills.length > 0 && !args.force) {
          const strategy = await handleConflicts("skills", conflictingSkills);
          if (p.isCancel(strategy) || strategy === "cancel") {
            p.cancel("Operation cancelled");
            process.exit(0);
          }
          skillStrategy = strategy;
        }

        s.start("Installing skills...");
        results.skills = await installSkills(skillsDir, selectedSkills, skillStrategy, target);
        s.stop("Skills installed");
      }

      printDivider();
      console.log();

      if (results.commands) {
        const { added, skipped } = results.commands;
        if (added.length > 0 || skipped.length > 0) {
          printSuccess(
            `Commands: ${highlight(added.length.toString())} added${skipped.length > 0 ? `, ${pc.yellow(skipped.length.toString())} skipped` : ""}`,
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
            `Rules: ${highlight(added.length.toString())} added${skipped.length > 0 ? `, ${pc.yellow(skipped.length.toString())} skipped` : ""}`,
          );
          for (const f of added) {
            console.log(pc.dim(`   └─ ${pc.green("+")} ${f}`));
          }
          for (const f of skipped) {
            console.log(pc.dim(`   └─ ${pc.yellow("○")} ${f} (kept existing)`));
          }
        }
      }

      if (results.skills) {
        const { added, skipped } = results.skills;
        if (added.length > 0 || skipped.length > 0) {
          printSuccess(
            `Skills: ${highlight(added.length.toString())} added${skipped.length > 0 ? `, ${pc.yellow(skipped.length.toString())} skipped` : ""}`,
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
        (results.rules?.added.length ?? 0) +
        (results.skills?.added.length ?? 0);
      const totalSkipped =
        (results.commands?.skipped.length ?? 0) +
        (results.rules?.skipped.length ?? 0) +
        (results.skills?.skipped.length ?? 0);

      if (totalAdded === 0 && totalSkipped > 0) {
        console.log();
        p.outro(pc.yellow("No new templates added (all selected files already exist)"));
      } else {
        console.log();
        p.outro(pc.green("✨ Agent Kit initialized successfully!"));
      }
    } catch (error) {
      s.stop("Failed");
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});
