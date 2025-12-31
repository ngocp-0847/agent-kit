import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import { MCP_SERVER_TEMPLATES } from "../../utils/mcp";

export const mcpListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List available MCP servers",
  },
  args: {},
  async run() {
    console.log();
    console.log(pc.bold("Available MCP Servers:"));
    console.log();

    for (const [name, template] of Object.entries(MCP_SERVER_TEMPLATES)) {
      console.log(pc.cyan(`${template.displayName} (${name})`));
      console.log(pc.dim(`  ${template.description}`));
      console.log();
    }

    p.outro("Use 'agent-kit mcp add <server-name>' to install MCP servers");
  },
});
