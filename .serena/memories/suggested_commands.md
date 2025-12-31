# Development Commands

## Package Manager
This project uses **pnpm** as the package manager.

## Essential Commands

### Installation
```bash
pnpm install              # Install dependencies
```

### Development
```bash
pnpm dev                  # Watch mode for development (tsup --watch)
pnpm build                # Build for production (tsup)
node dist/cli.js          # Run built CLI
```

### Quality Checks
```bash
pnpm typecheck            # TypeScript type checking (tsc --noEmit)
pnpm lint                 # Lint and format with Biome (biome check --write)
```

### Testing the CLI Locally
```bash
# After building
node dist/cli.js init
node dist/cli.js add
node dist/cli.js pull
node dist/cli.js list
node dist/cli.js remove
node dist/cli.js mcp
```

### Publishing
```bash
pnpm prepublishOnly       # Runs build before publish
npm publish               # Publish to npm
```

## System Commands (macOS/Darwin)
```bash
ls -la                    # List files with details
find . -name "*.ts"       # Find TypeScript files
grep -r "pattern" .       # Search for pattern recursively
git status                # Check git status
git log --oneline -10     # View recent commits
```

## Task Completion Checklist
Before completing any task, ensure:
1. ✅ Run `pnpm typecheck` - No TypeScript errors
2. ✅ Run `pnpm lint` - Code is formatted and linted
3. ✅ Run `pnpm build` - Build succeeds
4. ✅ Test the CLI manually if changes affect commands
