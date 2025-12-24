# Power Development Guide

This guide explains how to create custom Kiro Powers for the agent-kit CLI.

## What is a Power?

A Power is a specialized package for Kiro that contains:
- **MCP Servers**: Model Context Protocol servers providing tools and capabilities
- **Steering Files**: Markdown files with context and instructions for specific domains
- **Examples**: Usage examples and best practices (optional)
- **Documentation**: POWER.md and README.md files

## Power Package Structure

```
my-power/
├── POWER.md              # Main documentation (required)
├── README.md             # Detailed documentation (optional)
├── package.json          # Power metadata and dependencies (required)
├── mcp.json              # MCP server configurations (required if using MCP)
├── steering/             # Steering files (optional)
│   ├── getting-started.md
│   └── advanced-usage.md
├── examples/             # Usage examples (optional)
│   └── basic-usage.md
└── servers/              # MCP server implementations (optional)
    └── my-server.js
```

## Required Files

### package.json

The `package.json` file defines your Power's metadata:

```json
{
  "name": "my-power",
  "version": "1.0.0",
  "description": "A Kiro power for [your domain]",
  "type": "module",
  "main": "servers/my-server.js",
  "scripts": {
    "start": "node servers/my-server.js"
  },
  "keywords": ["kiro", "mcp", "your-keywords"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### POWER.md

The main documentation file that describes your Power:

```markdown
# My Power

Brief description of what this Power does.

## Overview

Detailed explanation of the Power's capabilities.

## Features

- Feature 1
- Feature 2
- Feature 3

## Usage

How to use the Power's tools and capabilities.

## Supported Patterns

What patterns/frameworks/technologies this Power supports.

## Output Format

Description of what the Power produces.
```

### mcp.json

Configuration for MCP servers included in your Power:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./servers/my-server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Creating an MCP Server

MCP servers provide tools that Kiro can use. Here's a basic template:

```javascript
// servers/my-server.js
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "my-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "my_tool",
        description: "Description of what this tool does",
        inputSchema: {
          type: "object",
          properties: {
            param1: {
              type: "string",
              description: "Description of param1",
            },
            param2: {
              type: "number",
              description: "Description of param2",
            },
          },
          required: ["param1"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "my_tool") {
    const { param1, param2 } = args;
    
    // Your tool implementation here
    const result = `Processed: ${param1}`;
    
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running on stdio");
}

main().catch(console.error);
```

## Steering Files

Steering files provide context and instructions to Kiro. They should be placed in the `steering/` directory.

### Best Practices for Steering Files

1. **Clear Structure**: Use headings and sections
2. **Practical Examples**: Include code examples
3. **Step-by-Step Guides**: Break down complex tasks
4. **Troubleshooting**: Include common issues and solutions

Example steering file:

```markdown
# Getting Started with My Power

This guide helps you use My Power effectively.

## Prerequisites

- Requirement 1
- Requirement 2

## Quick Start

### Step 1: Basic Usage

\`\`\`typescript
// Example code
\`\`\`

### Step 2: Advanced Configuration

\`\`\`typescript
// More examples
\`\`\`

## Best Practices

1. Practice 1
2. Practice 2

## Troubleshooting

### Common Issue 1

Solution...

### Common Issue 2

Solution...
```

## Publishing Your Power

### Local Development

Test your Power locally before publishing:

```bash
# Install your Power locally
agent-kit init -t kiro -p

# Or copy directly to .kiro/
cp -r my-power ~/.kiro/powers/
```

### Registry Submission

To add your Power to the agent-kit registry:

1. Fork the agent-kit repository
2. Add your Power to the `powers/` directory
3. Update the Power registry manifest
4. Submit a pull request

## Power Validation

Your Power should pass these validation checks:

1. **Required Files**: `package.json` and `POWER.md` must exist
2. **Valid JSON**: `package.json` and `mcp.json` must be valid JSON
3. **Version Format**: Version must follow semver (e.g., `1.0.0`)
4. **Node Version**: Must specify Node.js >= 18.0.0

## Example Powers

See the `nestjs-swagger-power` in the repository for a complete example:

- Full MCP server implementation
- Comprehensive steering files
- Usage examples
- Proper package structure

## Troubleshooting

### Power Not Detected

- Ensure `package.json` exists and is valid
- Check that `POWER.md` is present
- Verify the Power directory structure

### MCP Server Not Starting

- Check Node.js version (>= 18.0.0)
- Verify dependencies are installed
- Check server logs for errors

### Steering Files Not Copied

- Ensure files are in the `steering/` directory
- Check file permissions
- Verify `.md` extension

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP SDK on npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [agent-kit Repository](https://github.com/duongductrong/agent-kit)
