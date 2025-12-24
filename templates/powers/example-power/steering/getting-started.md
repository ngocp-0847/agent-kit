# Getting Started with Example Power

This guide helps you understand how to use the Example Power and its tools.

## Prerequisites

- Kiro IDE installed
- Node.js >= 18.0.0
- agent-kit CLI installed

## Quick Start

### 1. Install the Power

```bash
agent-kit init -t kiro -p
# Select "example-power" from the list
```

### 2. Verify Installation

```bash
agent-kit list -p
# Should show "Example Power" in the list
```

### 3. Use the Tools

The Example Power provides three tools:

#### Echo Tool

Simply returns your input unchanged. Great for testing:

```
Use the echo tool with text "Hello, Kiro!"
```

#### Transform Tool

Transforms text using various operations:

```
Use the transform tool to convert "hello world" to uppercase
```

Available operations:
- `uppercase` - Convert to UPPERCASE
- `lowercase` - Convert to lowercase
- `reverse` - Reverse the text
- `length` - Get the character count

#### Analyze Tool

Get statistics about your text:

```
Use the analyze tool on this paragraph to get word and character counts
```

Returns:
- Word count
- Line count
- Character count (with and without spaces)

## Example Workflows

### Text Processing Workflow

1. Start with raw text
2. Use `analyze` to understand the content
3. Use `transform` to format as needed
4. Use `echo` to verify the result

### Testing Workflow

1. Use `echo` to verify the server is responding
2. Test each operation with `transform`
3. Verify statistics with `analyze`

## Best Practices

1. **Start Simple**: Use `echo` first to verify connectivity
2. **Check Parameters**: Ensure you're using valid operation names
3. **Handle Errors**: The tools return clear error messages

## Troubleshooting

### Tool Not Found

If tools aren't available:
1. Check that the Power is installed: `agent-kit list -p`
2. Restart Kiro to reload MCP configurations
3. Verify `.kiro/settings/mcp.json` contains the server

### Server Not Starting

If the server fails to start:
1. Check Node.js version: `node --version`
2. Install dependencies: `npm install` in the Power directory
3. Test manually: `node servers/example-server.js`

## Next Steps

- Read the [Advanced Usage](./advanced-usage.md) guide
- Check the [Examples](../examples/basic-usage.md) for more patterns
- Create your own Power based on this template
