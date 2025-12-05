import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, chmodSync, readdirSync } from "node:fs";
import { highlight, printDivider, printSuccess, printInfo, printWarning } from "../utils/branding";

type InstanceAction = "create" | "remove" | "reinstall";

interface InstanceInfo {
  name: string;
  path: string;
}

function getBinPath(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const possiblePaths = [
    join(currentDir, "..", "..", "bin"),
    join(currentDir, "..", "bin"),
  ];

  for (const binPath of possiblePaths) {
    if (existsSync(binPath)) {
      return binPath;
    }
  }

  return possiblePaths[0];
}

function ensureExecutable(scriptPath: string): void {
  try {
    chmodSync(scriptPath, 0o755);
  } catch {
    // Ignore permission errors
  }
}

function getExistingInstances(): InstanceInfo[] {
  const userAppsDir = join(process.env.HOME ?? "", "Applications");
  if (!existsSync(userAppsDir)) return [];

  try {
    const apps = readdirSync(userAppsDir);
    return apps
      .filter((app) => app.startsWith("Cursor") && app.endsWith(".app") && app !== "Cursor.app")
      .map((app) => ({
        name: app.replace(".app", ""),
        path: join(userAppsDir, app),
      }));
  } catch {
    return [];
  }
}

function runScript(scriptPath: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    ensureExecutable(scriptPath);

    const child = spawn(scriptPath, args, {
      stdio: "inherit",
    });

    child.on("close", (code) => {
      resolve(code ?? 1);
    });

    child.on("error", () => {
      resolve(1);
    });
  });
}

export const instanceCommand = defineCommand({
  meta: {
    name: "instance",
    description: "Manage Cursor IDE instances for multi-account login (macOS only)",
  },
  args: {
    action: {
      type: "string",
      alias: "a",
      description: "Action: 'create', 'reinstall', or 'remove'",
    },
    name: {
      type: "string",
      alias: "n",
      description: "Name of the instance (e.g. 'Cursor Enterprise')",
    },
    list: {
      type: "boolean",
      alias: "l",
      description: "List existing Cursor instances",
      default: false,
    },
  },
  async run({ args }) {
    p.intro(pc.bgCyan(pc.black(" cursor-kit instance ")));

    // OS check
    if (process.platform !== "darwin") {
      console.log();
      printWarning("This command only works on macOS.");
      console.log(pc.dim("  Cursor instance management requires macOS-specific features."));
      console.log();
      p.outro(pc.dim("Exiting"));
      process.exit(1);
    }

    // List mode
    if (args.list) {
      const instances = getExistingInstances();
      printDivider();
      console.log();

      if (instances.length === 0) {
        printInfo("No custom Cursor instances found.");
        console.log(pc.dim("  Run ") + highlight("cursor-kit instance") + pc.dim(" to create one."));
      } else {
        console.log(pc.bold(pc.cyan("  🖥  Cursor Instances")) + pc.dim(` (${instances.length})`));
        console.log();
        for (const instance of instances) {
          console.log(`  ${pc.green("●")} ${highlight(instance.name)}`);
          console.log(pc.dim(`    └─ ${instance.path}`));
        }
      }

      console.log();
      printDivider();
      p.outro(pc.dim(`Total: ${instances.length} instance${instances.length !== 1 ? "s" : ""}`));
      return;
    }

    const s = p.spinner();

    // Check prerequisites
    s.start("Checking prerequisites...");
    const binPath = getBinPath();
    const createScript = join(binPath, "cursor-new-instance");
    const removeScript = join(binPath, "cursor-remove-instance");
    const reinstallScript = join(binPath, "cursor-reinstall-instance.sh");

    const scriptsExist = existsSync(createScript) && existsSync(removeScript) && existsSync(reinstallScript);
    if (!scriptsExist) {
      s.stop("Prerequisites check failed");
      console.log();
      printWarning("Required scripts not found.");
      console.log(pc.dim(`  Expected at: ${binPath}`));
      console.log();
      p.outro(pc.red("Installation may be corrupted"));
      process.exit(1);
    }

    const originalCursor = "/Applications/Cursor.app";
    if (!existsSync(originalCursor)) {
      s.stop("Prerequisites check failed");
      console.log();
      printWarning("Cursor.app not found in /Applications");
      console.log(pc.dim("  Please install Cursor IDE first."));
      console.log();
      p.outro(pc.red("Cursor IDE required"));
      process.exit(1);
    }

    s.stop("Prerequisites verified");

    // Get existing instances for context
    const existingInstances = getExistingInstances();

    let action: InstanceAction;
    let instanceName: string;

    // Determine action
    if (args.action && ["create", "remove", "reinstall"].includes(args.action)) {
      action = args.action as InstanceAction;
    } else {
      const actionResult = await p.select({
        message: "What would you like to do?",
        options: [
          {
            value: "create",
            label: "Create new instance",
            hint: "Clone Cursor with separate identity",
          },
          {
            value: "reinstall",
            label: "Reinstall instance",
            hint: existingInstances.length > 0
              ? "Fix broken instance after Cursor update"
              : "No instances to reinstall",
          },
          {
            value: "remove",
            label: "Remove instance",
            hint: existingInstances.length > 0
              ? `${existingInstances.length} instance${existingInstances.length !== 1 ? "s" : ""} available`
              : "No instances to remove",
          },
        ],
      });

      if (p.isCancel(actionResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      action = actionResult as InstanceAction;
    }

    // Get instance name
    if (args.name) {
      instanceName = args.name;
    } else if ((action === "remove" || action === "reinstall") && existingInstances.length > 0) {
      // For remove/reinstall actions, show existing instances to select from
      const actionLabel = action === "remove" ? "remove" : "reinstall";
      const instanceResult = await p.select({
        message: `Select instance to ${actionLabel}:`,
        options: existingInstances.map((inst) => ({
          value: inst.name,
          label: inst.name,
          hint: inst.path,
        })),
      });

      if (p.isCancel(instanceResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      instanceName = instanceResult as string;
    } else if ((action === "remove" || action === "reinstall") && existingInstances.length === 0) {
      console.log();
      printInfo(`No custom Cursor instances found to ${action}.`);
      console.log();
      p.outro(pc.dim("Nothing to do"));
      return;
    } else {
      // For create action, prompt for name
      const nameResult = await p.text({
        message: "Enter a name for the new instance:",
        placeholder: "Cursor Enterprise",
        validate: (value) => {
          if (!value.trim()) return "Instance name is required";
          if (value.length < 2) return "Name must be at least 2 characters";
          const existing = existingInstances.find(
            (i) => i.name.toLowerCase() === value.toLowerCase()
          );
          if (existing) return `Instance "${value}" already exists`;
          return undefined;
        },
      });

      if (p.isCancel(nameResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      instanceName = nameResult;
    }

    // Show summary
    printDivider();
    console.log();
    console.log(pc.bold(pc.cyan("  📋 Summary")));
    console.log();
    const actionColor = action === "create" ? pc.green : action === "reinstall" ? pc.blue : pc.yellow;
    const actionLabel = action === "create" ? "Create" : action === "reinstall" ? "Reinstall" : "Remove";
    console.log(`  ${pc.dim("Action:")}    ${actionColor(actionLabel)}`);
    console.log(`  ${pc.dim("Instance:")}  ${highlight(instanceName)}`);

    if (action === "create" || action === "reinstall") {
      const slug = instanceName.toLowerCase().replace(/[^a-z0-9]/g, "");
      console.log(`  ${pc.dim("Bundle ID:")} ${pc.dim("com.cursor.")}${highlight(slug)}`);
      console.log(`  ${pc.dim("Location:")}  ${pc.dim("~/Applications/")}${highlight(instanceName + ".app")}`);
      if (action === "reinstall") {
        const dataDir = join(process.env.HOME ?? "", "Library", "Application Support", instanceName.replace(/ /g, ""));
        console.log(`  ${pc.dim("Data:")}      ${pc.green("✓")} ${pc.dim("Preserved at")} ${pc.dim(dataDir)}`);
      }
    } else {
      const targetPath = join(process.env.HOME ?? "", "Applications", `${instanceName}.app`);
      console.log(`  ${pc.dim("Path:")}      ${pc.dim(targetPath)}`);
    }

    console.log();
    printDivider();
    console.log();

    const shouldContinue = await p.confirm({
      message: action === "create"
        ? "Create this Cursor instance?"
        : action === "reinstall"
        ? "Reinstall this instance? (User data will be preserved)"
        : "Remove this Cursor instance? This cannot be undone.",
      initialValue: action !== "remove",
    });

    if (p.isCancel(shouldContinue) || !shouldContinue) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    // Execute script
    console.log();
    printDivider();
    console.log();

    const scriptPath = action === "create" 
      ? createScript 
      : action === "reinstall"
      ? reinstallScript
      : removeScript;
    // Pass --yes to remove/reinstall scripts since we already confirmed in the CLI
    const scriptArgs = action === "remove" || action === "reinstall" 
      ? ["--yes", instanceName] 
      : [instanceName];
    const exitCode = await runScript(scriptPath, scriptArgs);

    console.log();
    printDivider();
    console.log();

    if (exitCode === 0) {
      if (action === "create") {
        printSuccess(`Instance ${highlight(instanceName)} created successfully!`);
        console.log();
        console.log(pc.dim("  Next steps:"));
        console.log(pc.dim("  • The new instance should launch automatically"));
        console.log(pc.dim("  • Sign in with a different Cursor account"));
        console.log(pc.dim("  • Find it in ~/Applications/"));
      } else if (action === "reinstall") {
        printSuccess(`Instance ${highlight(instanceName)} reinstalled successfully!`);
        console.log();
        console.log(pc.dim("  The instance has been:"));
        console.log(pc.dim("  • Refreshed with the latest Cursor version"));
        console.log(pc.dim("  • Relaunched with your preserved data"));
        console.log(pc.dim("  • Ready to use with your existing account"));
      } else {
        printSuccess(`Instance ${highlight(instanceName)} removed successfully!`);
      }
      console.log();
      p.outro(pc.green("✨ Done!"));
    } else {
      printWarning(`Operation completed with exit code ${exitCode}`);
      console.log();
      p.outro(pc.yellow("Check the output above for details"));
      process.exit(exitCode);
    }
  },
});
