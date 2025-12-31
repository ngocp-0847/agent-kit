
# ✦ Agent Kit ✦

<p align="center">
  <b>Supercharge your AI coding agents with rules & commands</b><br/>
  <sub>A universal CLI toolkit to manage, share, and sync configurations for all AI coding agents</sub>
</p>

<p align="center">
  <a style="text-decoration: none;" href="https://www.npmjs.com/package/agent-kit-cli" target="_blank">
    <img src="https://img.shields.io/npm/v/agent-kit-cli?style=flat-square&color=000000" alt="npm version" />
  </a>
  <a style="text-decoration: none;" href="https://www.npmjs.com/package/agent-kit-cli" target="_blank">
    <img src="https://img.shields.io/npm/dm/agent-kit-cli?style=flat-square&color=000000" alt="npm downloads" />
  </a>
  <!-- <img src="https://img.shields.io/github/license/duongductrong/agent-kit?style=flat-square&color=0047E1" alt="license" /> -->
</p>

## 🚀 Quick Start

```bash
# Install globally
npm install -g agent-kit-cli

# Or use directly with npx
npx agent-kit-cli init
```

**CLI Aliases:** `agent-kit`, `agentkit`, or `ak`

```bash
# All of these work
agent-kit init
agentkit init
ak init
```

## ✨ Features

- **📜 Commands** - Reusable prompt templates for common tasks
- **📋 Rules** - Project-specific AI behavior guidelines
- **🎓 Skills** - Comprehensive guides with references for specialized domains
- **⚡ Powers** - MCP servers and steering files for enhanced Kiro capabilities
- **🎯 Multi-Agent** - Support for Cursor IDE, GitHub Copilot, Windsurf, Kiro, and more
- **🎨 Beautiful CLI** - Delightful terminal experience

## 📦 Commands

### `init`

Initialize commands, rules, and skills for your AI coding agent.

```bash
agent-kit init                       # Interactive mode
agent-kit init -t cursor             # Cursor IDE
agent-kit init -t github-copilot     # GitHub Copilot (VSCode)
agent-kit init -t windsurf           # Windsurf
agent-kit init -t kiro               # Kiro
agent-kit init -c                    # Only commands
agent-kit init -r                    # Only rules
agent-kit init -s                    # Only skills
agent-kit init -f                    # Force overwrite
agent-kit init -a                    # Install all without prompts
```

### `add`

Create a new command, rule, or skill.

```bash
agent-kit add                              # Interactive mode
agent-kit add -t command -n my-command     # Quick create command
agent-kit add -t rule -n my-rule           # Quick create rule
agent-kit add -t skill -n my-skill         # Quick create skill
agent-kit add --target cursor -t rule      # Target specific IDE
```

### `list`

Display available commands, rules, skills, and MCP servers.

```bash
agent-kit list           # List everything
agent-kit list -c        # Only commands
agent-kit list -s        # Only skills
agent-kit list -v        # Verbose with paths
```

### `mcp`

Manage MCP (Model Context Protocol) servers for AI IDEs.

```bash
agent-kit mcp                              # Show available commands
agent-kit mcp add                          # Interactive server selection
agent-kit mcp add chrome-devtools          # Add single server
agent-kit mcp add context7 chrome-devtools # Add multiple servers
agent-kit mcp list                         # List available servers
agent-kit mcp status                       # Show configured servers
agent-kit mcp info chrome-devtools         # Show server details
agent-kit mcp remove context7              # Remove single server
agent-kit mcp remove context7 serena       # Remove multiple servers
agent-kit mcp add -t github-copilot        # Target specific IDE
```

**Available MCP Servers:**

| Server | Description |
| ------ | ----------- |
| `chrome-devtools` | Chrome DevTools for browser automation, debugging, and performance analysis |
| `context7` | Context7 for fetching up-to-date library documentation |
| `serena` | IDE-like semantic code retrieval and editing tools |
| `playwright` | Browser automation via Playwright for web testing |

### `remove`

Remove a command, rule, or skill.

```bash
agent-kit remove                           # Interactive mode
agent-kit remove -t command -n my-command  # Quick remove
agent-kit remove -f                        # Skip confirmation
```

## 📁 Directory Structure

### Cursor IDE

```
.cursor/
├── commands/     # Prompt templates (.md)
├── rules/        # AI behavior rules (.mdc)
└── skills/       # Comprehensive guides
```

### GitHub Copilot

```
.vscode/mcp.json              # MCP server configuration
.github/
├── copilot-instructions.md   # Main instructions
└── copilot-instructions/
    ├── commands/             # Prompt templates
    └── rules/                # AI behavior rules
.claude/skills/               # Agent Skills (auto-discovered)
```

### Windsurf

```
.windsurf/
├── workflows/    # Workflow templates
├── rules/        # AI behavior rules
└── skills/       # Comprehensive guides
```

### Kiro

```
.kiro/
├── settings/mcp.json    # MCP server configs
├── steering/            # Steering files + skills
└── powers/              # Installed Powers
```

## 🎯 Included Templates

### Commands

`docs` · `explain` · `fix` · `implement` · `refactor` · `review` · `test`

### Rules

`coding-style` · `git` · `toc`

### Skills

| Skill | Description |
| ----- | ----------- |
| `aesthetic` | Visual design, storytelling, micro-interactions |
| `backend-development` | API design, architecture, auth, security |
| `chrome-devtools` | Browser debugging with Chrome DevTools MCP |
| `frontend-design` | Distinctive UI design (avoid generic AI slop) |
| `frontend-development` | React/TypeScript, TanStack, MUI patterns |
| `gherkin-e2e-automation` | E2E testing with Gherkin syntax |
| `mermaidjs-v11` | Diagrams and flowcharts with Mermaid.js |
| `problem-solving` | Techniques for complexity and innovation |
| `research` | Systematic research methodology |
| `sequential-thinking` | Structured problem-solving with MCP |
| `skill-builder` | Create new skills for Agent Kit |
| `spec-builder` | Generate specifications from requirements |
| `ui-styling` | shadcn/ui, Tailwind CSS, theming |

### Powers (Kiro)

Specialized packages with MCP servers and steering files.

```bash
agent-kit init -t kiro -p    # Install Powers
agent-kit list -p            # List installed Powers
```

## 🛠️ Development

```bash
git clone https://github.com/duongductrong/agent-kit.git
cd agent-kit && pnpm install
pnpm build
pnpm dev          # Watch mode
```

**Requirements:** Node.js >= 18.0.0

## 📄 License

MIT © [ngocp-0847]

---

<p align="center">
  Made with ♥ for the AI coding agent community
</p>
