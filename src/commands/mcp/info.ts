import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import pc from "picocolors";
import { MCP_SERVER_TEMPLATES } from "../../utils/mcp";

export const mcpInfoCommand = defineCommand({
  meta: {
    name: "info",
    description: "Show information about a specific MCP server",
  },
  args: {
    serverName: {
      type: "positional",
      description: "Name of the MCP server (e.g., chrome-devtools, context7)",
      required: true,
    },
  },
  async run({ args }) {
    const serverName = args.serverName as string;

    if (!serverName) {
      console.log();
      console.log(pc.red("Please specify a server name"));
      console.log();
      console.log(pc.dim("Usage: agent-kit mcp info <server-name>"));
      console.log(pc.dim("Example: agent-kit mcp info chrome-devtools"));
      console.log();
      p.outro("Use 'agent-kit mcp list' to see available servers");
      process.exit(1);
    }

    const template = MCP_SERVER_TEMPLATES[serverName];

    if (!template) {
      console.log();
      console.log(pc.red(`MCP server '${serverName}' not found`));
      console.log();
      console.log(pc.dim("Available servers:"));
      for (const [name, tmpl] of Object.entries(MCP_SERVER_TEMPLATES)) {
        console.log(pc.dim(`  - ${name} (${tmpl.displayName})`));
      }
      console.log();
      p.outro("Use 'agent-kit mcp list' for more details");
      process.exit(1);
    }

    console.log();
    console.log(pc.bold(pc.cyan(template.displayName)));
    console.log(pc.dim(template.description));
    console.log();

    if (template.setupInstructions) {
      console.log(pc.bold("Setup Instructions:"));
      console.log();
      console.log(template.setupInstructions);
      console.log();
    }

    console.log(pc.bold("Configuration:"));
    console.log(pc.dim(JSON.stringify(template.config, null, 2)));
    console.log();

    if (template.customPrompts && template.customPrompts.length > 0) {
      console.log(pc.bold("Configurable Options:"));
      for (const prompt of template.customPrompts) {
        console.log(pc.dim(`  - ${prompt.id}: ${prompt.message}`));
        for (const opt of prompt.options) {
          const defaultMark = opt.value === prompt.defaultValue ? pc.green(" (default)") : "";
          console.log(pc.dim(`      ${opt.value}: ${opt.label}${defaultMark}`));
        }
      }
      console.log();
    }

    p.outro(`Use 'agent-kit mcp add ${serverName}' to install this server`);
  },
});
