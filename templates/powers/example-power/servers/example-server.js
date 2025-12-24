/**
 * Example MCP Server for Kiro Power
 * 
 * This server demonstrates how to create MCP tools for a Kiro Power.
 * It includes basic tools for text manipulation as examples.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Create the MCP server
const server = new Server(
  {
    name: "example-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Define available tools
 * 
 * Each tool has:
 * - name: Unique identifier for the tool
 * - description: What the tool does
 * - inputSchema: JSON Schema defining the parameters
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "echo",
        description: "Echo the input text back unchanged. Useful for testing.",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The text to echo back",
            },
          },
          required: ["text"],
        },
      },
      {
        name: "transform",
        description: "Transform text using various operations like uppercase, lowercase, reverse, or get length.",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The text to transform",
            },
            operation: {
              type: "string",
              enum: ["uppercase", "lowercase", "reverse", "length"],
              description: "The transformation operation to apply",
            },
          },
          required: ["text", "operation"],
        },
      },
      {
        name: "analyze",
        description: "Analyze text and return statistics like word count, character count, and line count.",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The text to analyze",
            },
          },
          required: ["text"],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 * 
 * This is where the actual tool logic is implemented.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Echo tool - returns input unchanged
  if (name === "echo") {
    const { text } = args;
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            result: text,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  // Transform tool - applies text transformations
  if (name === "transform") {
    const { text, operation } = args;
    let result;

    switch (operation) {
      case "uppercase":
        result = text.toUpperCase();
        break;
      case "lowercase":
        result = text.toLowerCase();
        break;
      case "reverse":
        result = text.split("").reverse().join("");
        break;
      case "length":
        result = text.length.toString();
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            operation,
            input: text,
            result,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  // Analyze tool - returns text statistics
  if (name === "analyze") {
    const { text } = args;
    
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const lines = text.split(/\r?\n/);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            statistics: {
              wordCount: words.length,
              lineCount: lines.length,
              characterCount: characters,
              characterCountNoSpaces: charactersNoSpaces,
            },
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

/**
 * Start the server
 * 
 * The server uses stdio transport for communication with Kiro.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Example MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
