import { defineCommand, runMain } from "citty";
import { printBanner, printVersion } from "./utils/branding";
import { initCommand } from "./commands/init";
import { addCommand } from "./commands/add";
import { pullCommand } from "./commands/pull";
import { listCommand } from "./commands/list";
import { removeCommand } from "./commands/remove";

const main = defineCommand({
  meta: {
    name: "cursor-kit",
    version: "0.1.0",
    description: "CLI toolkit to manage Cursor IDE rules and commands",
  },
  setup() {
    printBanner();
    printVersion("0.1.0");
  },
  subCommands: {
    init: initCommand,
    add: addCommand,
    pull: pullCommand,
    list: listCommand,
    remove: removeCommand,
  },
});

runMain(main);

