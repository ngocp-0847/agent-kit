# Example Power for Kiro

A template Power demonstrating best practices for creating custom Kiro Powers.

## Purpose

This Power serves as a reference implementation for developers who want to create their own Powers. It includes:

- Complete MCP server implementation
- Steering files with usage guidance
- Example files showing common patterns
- Proper package configuration

## Installation

This Power is included as a template in agent-kit. To use it as a starting point:

```bash
# Copy the template
cp -r templates/powers/example-power my-power

# Customize the Power
cd my-power
# Edit POWER.md, package.json, and server implementation
```

## Structure

```
example-power/
├── POWER.md              # Main documentation
├── README.md             # This file
├── package.json          # Package metadata
├── mcp.json              # MCP server configuration
├── steering/
│   ├── getting-started.md
│   └── advanced-usage.md
├── examples/
│   └── basic-usage.md
└── servers/
    └── example-server.js
```

## Available Tools

### `echo`

Simple echo tool that returns input unchanged.

**Parameters:**
- `text` (string, required): Text to echo

**Example:**
```json
{
  "text": "Hello, World!"
}
```

### `transform`

Transforms text based on the specified operation.

**Parameters:**
- `text` (string, required): Text to transform
- `operation` (string, required): One of "uppercase", "lowercase", "reverse", "length"

**Example:**
```json
{
  "text": "Hello",
  "operation": "uppercase"
}
```

## Customization

To create your own Power based on this template:

1. **Update package.json**
   - Change `name` to your Power name
   - Update `description` and `keywords`
   - Add any required dependencies

2. **Update POWER.md**
   - Describe your Power's purpose
   - Document features and usage

3. **Modify the MCP Server**
   - Add your custom tools
   - Implement tool handlers
   - Update tool schemas

4. **Create Steering Files**
   - Add domain-specific guidance
   - Include examples and best practices

5. **Update mcp.json**
   - Configure your server settings
   - Add environment variables if needed

## Testing

Test your Power locally:

```bash
# Install dependencies
npm install

# Run the server
node servers/example-server.js

# The server will start on stdio
```

## License

MIT
