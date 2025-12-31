import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import {
  mcpAddCommand,
  mcpInfoCommand,
  mcpListCommand,
  mcpRemoveCommand,
  mcpStatusCommand,
} from "./mcp/index";

export const mcpCommand = defineCommand({
  meta: {
    name: "mcp",
    description: "Manage MCP servers for AI IDEs",
  },
  subCommands: {
    add: mcpAddCommand,
    list: mcpListCommand,
    status: mcpStatusCommand,
    info: mcpInfoCommand,
    remove: mcpRemoveCommand,
  },
});
