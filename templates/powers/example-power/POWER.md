# Example Power

A template Kiro Power demonstrating the standard structure and best practices for Power development.

## Overview

This example Power shows how to create a custom Power for Kiro with:
- MCP server implementation
- Steering files for context
- Usage examples
- Proper package structure

## Features

- **Example Tool**: Demonstrates basic MCP tool implementation
- **Echo Tool**: Simple tool that echoes input back
- **Transform Tool**: Shows parameter handling and data transformation

## Usage

### Echo Tool

Returns the input text unchanged:

```
Input: "Hello, World!"
Output: "Hello, World!"
```

### Transform Tool

Transforms text based on the specified operation:

```
Input: { text: "hello", operation: "uppercase" }
Output: "HELLO"
```

## Supported Operations

- `uppercase` - Convert text to uppercase
- `lowercase` - Convert text to lowercase
- `reverse` - Reverse the text
- `length` - Return the length of the text

## Output Format

All tools return JSON responses with:
- `success`: Boolean indicating operation success
- `result`: The operation result
- `timestamp`: ISO timestamp of the operation
