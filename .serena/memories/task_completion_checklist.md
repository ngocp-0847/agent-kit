# Task Completion Checklist

When a coding task is completed, follow these steps in order:

## 1. Type Checking
```bash
pnpm typecheck
```
Ensure there are no TypeScript errors before proceeding.

## 2. Linting & Formatting
```bash
pnpm lint
```
This runs `biome check --write` which:
- Fixes formatting issues
- Auto-fixes lint errors where possible
- Organizes imports

## 3. Build Verification
```bash
pnpm build
```
Ensure the project builds successfully with tsup.

## 4. Manual Testing (if applicable)
If changes affect CLI functionality:
```bash
node dist/cli.js <command>
```
Test the specific commands that were modified.

## 5. Commit Message
Use Conventional Commits format:
```bash
git add .
git commit -m "feat(scope): description"
```

### Commit Types & Version Impact
| Type | Version Bump |
|------|-------------|
| `feat` | MINOR |
| `fix` | PATCH |
| `docs` | PATCH |
| `refactor` | PATCH |
| `feat!` or `BREAKING CHANGE:` | MAJOR |
| `style`, `test`, `chore`, `ci` | No release |

## Automated Release Process
1. Push commits to `master` branch
2. Release Please creates Release PR
3. Merge PR to trigger npm publish
