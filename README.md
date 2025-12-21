
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
- **🔄 Sync** - Keep configurations updated from the community
- **🎯 Multi-Agent** - Support for Cursor IDE, GitHub Copilot, Windsurf, Kiro, and more
- **🎨 Beautiful CLI** - Delightful terminal experience

## 📦 Commands

### `init`

Initialize commands, rules, and skills in your project with curated templates. Supports all major AI coding agents.

```bash
agent-kit init                       # Interactive: choose target agent
agent-kit init -t cursor             # Initialize for Cursor IDE (.cursor/)
agent-kit init -t github-copilot     # Initialize for GitHub Copilot (.github/copilot-instructions/)
agent-kit init -t windsurf           # Initialize for Windsurf (.windsurf/)
agent-kit init -t kiro               # Initialize for Kiro (.kiro/steering/)
agent-kit init -c                    # Only initialize commands
agent-kit init -r                    # Only initialize rules
agent-kit init -s                    # Only initialize skills
agent-kit init -f                    # Force overwrite existing files
agent-kit init -a                    # Install all templates without selection prompts
```

**Target options:**
- `cursor` - Creates `.cursor/` directory structure for Cursor IDE
- `github-copilot` - Creates `.github/copilot-instructions.md` and related structure for GitHub Copilot. Skills are created in `.claude/skills/` for automatic discovery by GitHub Copilot Agent Skills
- `windsurf` - Creates `.windsurf/` directory with rules and workflows for Windsurf
- `kiro` - Creates `.kiro/steering/` directory with steering files for Kiro

### `add`

Interactively create a new command, rule, or skill with a starter template. Supports targeting different AI coding agents.

```bash
agent-kit add                              # Interactive mode (prompts for target)
agent-kit add --target cursor              # Add to Cursor IDE
agent-kit add --target github-copilot      # Add to GitHub Copilot
agent-kit add --target windsurf            # Add to Windsurf
agent-kit add --target kiro                # Add to Kiro
agent-kit add -t command                   # Add a command
agent-kit add -t rule                      # Add a rule
agent-kit add -t skill                     # Add a skill
agent-kit add -t command -n my-command     # Quick create
agent-kit add --target cursor -t rule -n my-rule  # Full example
```

### `pull`

Fetch the latest updates from the agent-kit repository. Supports targeting different AI coding agents.

```bash
agent-kit pull                         # Interactive mode (prompts for target)
agent-kit pull -t cursor               # Pull to Cursor IDE
agent-kit pull -t github-copilot       # Pull to GitHub Copilot
agent-kit pull -t windsurf             # Pull to Windsurf
agent-kit pull -t kiro                 # Pull to Kiro
agent-kit pull -c                      # Only pull commands
agent-kit pull -r                      # Only pull rules
agent-kit pull -s                      # Only pull skills
agent-kit pull -f                      # Force overwrite without confirmation
agent-kit pull -t cursor -r -f         # Pull rules to Cursor with force
```

### `list`

Display all available commands, rules, and skills in your project.

```bash
agent-kit list           # List everything
agent-kit list -c        # Only list commands
agent-kit list -r        # Only list rules
agent-kit list -s        # Only list skills
agent-kit list -v        # Verbose mode with file paths
```

### `remove`

Remove a command, rule, or skill from your project. Supports targeting different AI coding agents.

```bash
agent-kit remove                        # Interactive mode (prompts for target)
agent-kit remove --target cursor        # Remove from Cursor IDE
agent-kit remove --target github-copilot       # Remove from GitHub Copilot
agent-kit remove --target windsurf             # Remove from Windsurf
agent-kit remove --target kiro                 # Remove from Kiro
agent-kit remove -t command -n my-command      # Quick remove
agent-kit remove -f                     # Skip confirmation
agent-kit remove --target cursor -t rule -n my-rule -f  # Full example
```

## 📁 Directory Structure

After running `agent-kit init`, your project will have different structures depending on the target agent:

### Cursor IDE (default)

```
your-project/
└── .cursor/
    ├── commands/              # Prompt templates (.md)
    │   ├── docs.md
    │   ├── explain.md
    │   ├── fix.md
    │   ├── implement.md
    │   ├── refactor.md
    │   ├── review.md
    │   └── test.md
    ├── rules/                 # AI behavior rules (.mdc)
    │   ├── coding-style.mdc
    │   ├── git.mdc
    │   └── toc.mdc
    └── skills/                # Comprehensive guides with references
        ├── aesthetic/
        │   ├── SKILL.mdc
        │   ├── assets/
        │   └── references/
        ├── backend-development/
        │   ├── SKILL.mdc
        │   └── references/
        ├── frontend-design/
        │   ├── SKILL.mdc
        │   └── references/
        ├── frontend-development/
        │   ├── SKILL.mdc
        │   └── resources/
        ├── problem-solving/
        │   ├── SKILL.mdc
        │   └── references/
        ├── research/
        │   └── SKILL.mdc
        ├── sequential-thinking/
        │   ├── SKILL.mdc
        │   ├── references/
        │   └── scripts/
        └── ui-styling/
            ├── SKILL.mdc
            └── references/
```

### GitHub Copilot

```
your-project/
├── .github/
│   ├── copilot-instructions.md    # Main instructions file
│   └── copilot-instructions/      # Organized instructions
│       ├── commands/              # Prompt templates (.md)
│       │   ├── docs.md
│       │   ├── explain.md
│       │   ├── fix.md
│       │   ├── implement.md
│       │   ├── refactor.md
│       │   ├── review.md
│       │   └── test.md
│       └── rules/                 # AI behavior rules (.md)
│           ├── coding-style.md
│           ├── git.md
│           └── toc.md
└── .claude/
    └── skills/                    # Agent Skills (auto-discovered by GitHub Copilot)
        ├── aesthetic/
        │   ├── SKILL.md
        │   ├── assets/
        │   └── references/
        ├── backend-development/
        │   ├── SKILL.md
        │   └── references/
        └── ... (other skills)
```

> **Note**: Skills are created in `.claude/skills/` to leverage GitHub Copilot's [Agent Skills feature](https://github.blog/changelog/2025-12-18-github-copilot-now-supports-agent-skills/), which automatically discovers and loads skills from this directory when relevant to your tasks.

### Windsurf

```
your-project/
└── .windsurf/
    ├── workflows/                 # Workflow templates (.md)
    │   ├── docs.md
    │   ├── explain.md
    │   ├── fix.md
    │   ├── implement.md
    │   ├── refactor.md
    │   ├── review.md
    │   └── test.md
    ├── rules/                     # AI behavior rules (.md)
    │   ├── coding-style.md
    │   ├── git.md
    │   └── toc.md
    └── skills/                    # Comprehensive guides with references
        ├── aesthetic/
        │   ├── SKILL.md
        │   ├── assets/
        │   └── references/
        ├── backend-development/
        │   ├── SKILL.md
        │   └── references/
        └── ... (other skills)
```

### Kiro

```
your-project/
└── .kiro/
    └── steering/                  # Steering files (.md)
        ├── docs.md
        ├── explain.md
        ├── fix.md
        ├── implement.md
        ├── refactor.md
        ├── review.md
        ├── test.md
        ├── coding-style.md
        ├── git.md
        └── skills/                # Comprehensive guides with references
            ├── aesthetic/
            │   ├── SKILL.md
            │   ├── assets/
            │   └── references/
            ├── backend-development/
            │   ├── SKILL.md
            │   └── references/
            └── ... (other skills)
```

## 🎯 Included Templates

### Commands

| Command     | Description                                    |
| ----------- | ---------------------------------------------- |
| `docs`      | Create or update documentation                 |
| `explain`   | Clear technical explanations                   |
| `fix`       | Diagnose and fix bugs with root cause analysis |
| `implement` | Convert feature ideas into actionable plans    |
| `refactor`  | Improve code quality without changing behavior |
| `review`    | Comprehensive code review checklist            |
| `test`      | Generate comprehensive test suites             |

### Rules

| Rule           | Description                                |
| -------------- | ------------------------------------------ |
| `coding-style` | Core coding conventions and best practices |
| `git`          | Commit and branching conventions           |
| `toc`          | Table of contents for rule selection      |

### Skills

| Skill                  | Description                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `aesthetic`            | Visual design principles, storytelling, and micro-interactions for distinctive interfaces |
| `backend-development`  | API design, architecture, authentication, security, and DevOps patterns           |
| `frontend-design`      | Create distinctive, production-grade interfaces with bold aesthetics (avoid generic AI slop) |
| `frontend-development` | React/TypeScript patterns: Suspense, lazy loading, TanStack Query/Router, MUI v7, file organization |
| `problem-solving`      | Techniques for complexity spirals, innovation blocks, meta-patterns, and scale testing |
| `research`             | Systematic research methodology for technical solutions with report generation     |
| `sequential-thinking`  | Structured problem-solving with revision, branching, and hypothesis verification   |
| `ui-styling`           | shadcn/ui components, Tailwind CSS utilities, theming, accessibility, and canvas-based visual design |

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/duongductrong/agent-kit.git
cd agent-kit

# Install dependencies
pnpm install

# Build
pnpm build

# Run locally
node dist/cli.js

# Development mode (watch)
pnpm dev
```

### Requirements

- Node.js >= 18.0.0

## 📄 License

MIT © [duongductrong](https://github.com/duongductrong)

---

<p align="center">
  Made with ♥ for the AI coding agent community
</p>
