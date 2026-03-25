# Agents.md - Development Guidelines for AI Assistants

This file provides instructions and guidelines for AI agents (Claude, Gemini, or other assistants) working on this project.

## Project Overview

This is a GitHub repository downloader CLI tool built with Bun and TypeScript. It allows users to download GitHub repositories via the command line.

---

## Useful Commands

### Development Commands

```bash
# Run the CLI tool in development mode
bun run dev

# Build the project for production
bun run build

# Run the built CLI tool
bun run start

# Run development with specific arguments
bun run src/index.ts <args>
```

### Code Quality Commands

```bash
# Format code with Prettier
bun run format

# Lint code with ESLint
bun run lint

# Fix linting issues automatically
bun run lint:fix

# Type check with TypeScript
bun run typecheck
```

### Build Pipeline

```bash
# Full build pipeline (format, lint:fix, typecheck, then build)
bun run prebuild
```

---

## Technologies

### Core Technologies

- **Runtime**: Bun (^1.3.11)
- **Language**: TypeScript (5.9.3)
- **Module System**: ES Modules (ESM)

### Development Tools

- **Package Manager**: Bun
- **Code Formatting**: Prettier (@involvex/prettier-config)
- **Code Linting**: ESLint (^10.1.0) with TypeScript support
- **Type Checking**: TypeScript (^5.9.3)
- **Module Resolution**: jiti (^2.6.1) for TypeScript execution

### Project Structure

```
src/
├── index.ts              # Main entry point
├── cli/
│   ├── index.ts         # CLI setup
│   └── commands/
│       ├── about.ts     # About command
│       ├── download.ts  # Download command
│       └── help.ts      # Help command
└── github/
    ├── client.ts        # GitHub API client
    ├── download.ts      # Download logic
    └── parser.ts        # URL parsing
```

---

## Best Practices and Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules defined in `eslint.config.ts`
- Use Prettier for code formatting
- Enable strict type checking

### Git Conventions

- Use conventional commit messages
- Keep commits atomic and focused
- Write descriptive commit messages

### Error Handling

- Handle errors gracefully with meaningful messages
- Use proper error types and propagation
- Log errors appropriately for debugging

### Performance

- Use Bun's native APIs where possible
- Optimize for fast execution
- Consider async/await patterns for I/O operations

### Testing

- Test CLI commands with various inputs
- Verify error handling scenarios
- Test with real GitHub repositories

### CLI Design

- Provide helpful usage information
- Include `--help` flag support
- Show clear error messages for invalid inputs
- Support both short and long flags where appropriate

---

## Configuration Files

| File               | Purpose                          |
| ------------------ | -------------------------------- |
| `package.json`     | Project dependencies and scripts |
| `tsconfig.json`    | TypeScript configuration         |
| `eslint.config.ts` | ESLint configuration             |
| `.prettierignore`  | Prettier ignore patterns         |
| `.gitignore`       | Git ignore patterns              |

---

## Common Tasks

### Adding a New CLI Command

1. Create a new file in `src/cli/commands/`
2. Export a function that handles the command
3. Register the command in `src/cli/index.ts`
4. Add appropriate tests

### Modifying GitHub Integration

- Edit files in `src/github/`
- The `client.ts` handles GitHub API communication
- The `parser.ts` handles URL parsing
- The `download.ts` handles repository downloading

### Updating Dependencies

1. Update version in `package.json`
2. Run `bun install` to update lockfile
3. Run full build to verify changes
4. Update this file if new technologies are added
