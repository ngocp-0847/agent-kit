
# ✦ Agent Kit ✦

<p align="center">
  <b>Supercharge your AI coding agents with rules & commands</b><br/>
  <sub>A universal CLI toolkit to manage, share, and sync configurations for all AI coding agents</sub>
</p>

## 🚀 Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/duongductrong/agent-kit.git
cd agent-kit

# 2. Install dependencies
./install.sh

# 3. Initialize for GitHub Copilot (VSCode)
agentkit init -t github-copilot
```

**Done!** Your Copilot is now supercharged with rules, commands, and skills.

**Tip:** You can use `agent-kit`, `agentkit`, or `ak` as CLI aliases.


## ✨ Features

- **Commands**: Reusable prompt templates
- **Rules**: Project-specific AI guidelines
- **Skills**: Guides for specialized domains
- **Multi-Agent**: Works with Copilot, Cursor, Windsurf, Kiro, etc.


## 📦 Main CLI Commands

- `init` – Initialize rules, commands, and skills for your agent
- `add` – Add a new command, rule, or skill
- `list` – List available commands, rules, skills, or MCP servers
- `mcp` – Manage MCP servers (add, list, status, info, remove)
- `remove` – Remove a command, rule, or skill


## 📁 Directory Structure

- `.github/` – Copilot instructions, prompts, skills
- `.vscode/mcp.json` – MCP server config
- `templates/` – Command, rule, and skill templates


## 🎯 Templates & Skills

- **Commands:** docs, explain, fix, implement, refactor, review, test
- **Rules:** coding-style, git, toc
- **Skills:** aesthetic, backend-development, chrome-devtools, frontend-design, frontend-development, mermaidjs-v11, problem-solving, research, sequential-thinking, skill-builder, spec-builder, ui-styling, and more


## 🛠️ Development

```bash
git clone https://github.com/duongductrong/agent-kit.git
cd agent-kit
pnpm install
pnpm build
pnpm dev   # Watch mode
```

**Requires:** Node.js >= 18.0.0


## 📄 License

MIT © [ngocp-0847]

---

<p align="center">
  Made with ♥ for the AI coding agent community
</p>
