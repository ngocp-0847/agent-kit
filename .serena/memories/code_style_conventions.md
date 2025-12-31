# Code Style & Conventions

## TypeScript Standards
- **Target:** ES2022
- **Module:** ESNext with bundler resolution
- **Strict mode:** Enabled with all strict checks

### Type Safety
- ✅ Explicit types on public functions, props, and return values
- ❌ Avoid `any` and implicit `any`
- ✅ Use TypeScript strict mode features

### Naming Conventions
- **Variables/Functions:** camelCase (`handleClick`, `initCommand`)
- **Components/Classes:** PascalCase
- **Constants:** Exported constants use camelCase (e.g., `initCommand`)
- **Event handlers:** Prefix with "handle" (`handleClick`, `handleKeyDown`)

### Code Organization
- Keep related logic grouped in appropriate directories
- `/commands/` - CLI commands
- `/utils/` - Utility functions
- `/types/` - Type definitions

### Best Practices
- ✅ Guard clauses over deep nesting - Use early returns
- ✅ Small, single-purpose functions
- ✅ Pure functions when possible - Move side effects to edges
- ✅ Descriptive variable and function names
- ❌ Avoid unnecessary comments in generated code

## Biome Configuration
- **Indent:** 2 spaces
- **Line width:** 100 characters
- **Quotes:** Double quotes (`"`)
- **Semicolons:** Always required
- **Import organization:** Enabled

## File Patterns
- **Ignored:** `dist/`, `node_modules/`, `*.md`, `*.mdc`

## Git Conventions
- Use **Conventional Commits** format
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- Subject: imperative mood, no capital, no period, max 50 chars
- Branch naming: `feature/<desc>`, `fix/<desc>`, `hotfix/<desc>`, `chore/<desc>`
