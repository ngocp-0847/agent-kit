# Contributing to cursor-kit

Thank you for contributing! This guide will help you understand our development workflow.

## Commit Message Convention

We use **Conventional Commits** for automatic versioning and changelog generation.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types and Version Impact

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | MINOR (0.x.0) |
| `fix` | Bug fix | PATCH (0.0.x) |
| `docs` | Documentation only | PATCH |
| `style` | Code style (formatting) | No release |
| `refactor` | Code refactoring | PATCH |
| `perf` | Performance improvement | PATCH |
| `test` | Adding/updating tests | No release |
| `chore` | Build, dependencies | No release |
| `ci` | CI/CD changes | No release |

### Breaking Changes → MAJOR Version

Add `BREAKING CHANGE:` in the footer or `!` after the type:

```bash
feat!: remove deprecated API endpoint

BREAKING CHANGE: The /v1/rules endpoint has been removed. Use /v2/rules instead.
```

### Examples

```bash
# Feature → bumps MINOR
feat(cli): add interactive mode for init command

# Bug fix → bumps PATCH
fix(pull): resolve file path issues on Windows

# Breaking change → bumps MAJOR
feat!: rename cursor-kit commands to ck shorthand

BREAKING CHANGE: All commands now use `ck` prefix instead of `cursor-kit`
```

## Release Process

Releases are **fully automated**:

1. **Push commits** to `master`/`main` branch
2. **Release Please** analyzes commits and creates a Release PR
3. **Merge the Release PR** to trigger:
   - Version bump in `package.json`
   - Git tag creation
   - GitHub Release with auto-generated changelog
   - npm publish

## Development Setup

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Development mode
pnpm dev

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Pull Request Guidelines

1. Create a feature branch from `master`
2. Follow the commit message convention
3. Ensure all checks pass
4. Request review

