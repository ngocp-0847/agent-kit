import { createRequire } from "node:module";
import { defineCommand, runMain } from "citty";
import { addCommand } from "./commands/add";
import { initCommand } from "./commands/init";
import { listCommand } from "./commands/list";
import { mcpCommand } from "./commands/mcp";
import { pullCommand } from "./commands/pull";
import { removeCommand } from "./commands/remove";
import { printBanner, printVersion } from "./utils/branding";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

const main = defineCommand({
  meta: {
    name: "agent-kit",
    version: pkg.version,
    description: "CLI toolkit to manage AI coding agent rules, commands, and MCP servers",
  },
  setup() {
    printBanner();
    printVersion(pkg.version);
  },
  subCommands: {
    init: initCommand,
    add: addCommand,
    pull: pullCommand,
    list: listCommand,
    remove: removeCommand,
    mcp: mcpCommand,
  },
});

runMain(main);
