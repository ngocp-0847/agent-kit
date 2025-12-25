# Project Overview: Agent Kit

## Purpose
Agent Kit is a **CLI toolkit** to manage AI coding agent configurations including rules, commands, skills, and MCP servers. It supports multiple AI coding agents such as:
- **Cursor IDE** (`.cursor/`)
- **GitHub Copilot** (`.github/copilot-instructions/`)
- **Windsurf** (`.windsurf/`)
- **Kiro** (`.kiro/steering/`)

## Key Features
- 📜 **Commands** - Reusable prompt templates for common tasks
- 📋 **Rules** - Project-specific AI behavior guidelines
- 🎓 **Skills** - Comprehensive guides with references for specialized domains
- 🔄 **Sync** - Keep configurations updated from the community
- 🎯 **Multi-Agent Support** - Works with all major AI coding agents

## Package Info
- **Name:** `agent-kit-cli`
- **Version:** 1.5.0
- **License:** MIT
- **CLI Aliases:** `agent-kit`, `agentkit`, `ak`
- **Node Requirement:** >=18.0.0

## Tech Stack
- **Runtime:** Node.js (>=18)
- **Language:** TypeScript (ES2022)
- **Build Tool:** tsup (ESM + CJS output)
- **Package Manager:** pnpm
- **Linter/Formatter:** Biome
- **Type Checking:** TypeScript compiler

## Key Dependencies
- `citty` - CLI framework
- `@clack/prompts` - Interactive prompts
- `consola` - Console utilities
- `giget` - Template downloading
- `picocolors` - Terminal colors
- `figlet` + `gradient-string` - CLI branding

## Repository Structure
```
src/
├── cli.ts           # CLI entry point
├── index.ts         # Library exports
├── commands/        # CLI commands (init, add, pull, list, remove, mcp)
├── types/           # TypeScript type definitions
└── utils/           # Utility functions (fs, templates, mcp, etc.)

templates/           # Built-in templates
├── commands/        # Command templates (docs, explain, fix, etc.)
├── rules/           # Rule templates (coding-style, git, toc)
└── skills/          # Skill templates (various domains)

dist/               # Build output (ESM + CJS)
```

## Main CLI Commands
- `agent-kit init` - Initialize templates for an AI agent
- `agent-kit add` - Add new command/rule/skill
- `agent-kit pull` - Fetch latest updates from repository
- `agent-kit list` - List available templates
- `agent-kit remove` - Remove templates
- `agent-kit mcp` - Manage MCP server configurations
