# github-repo-download

A CLI tool to download GitHub repositories.

## Installation

```bash
bun install
bun run build
```

## Usage

```bash
# Download entire repository
bun run start owner/repo

# Download to specific directory
bun run start owner/repo -o my-folder

# Download from GitHub URL
bun run start https://github.com/owner/repo

# Download specific file
bun run start https://github.com/owner/repo/blob/main/path/to/file.ts

# Download specific directory
bun run start https://github.com/owner/repo/tree/main/path/to/dir
```

## Options

- `-o, --output <dir>` - Output directory (default: repository name)
- `-h, --help` - Show help

## Development

```bash
bun run dev      # Run in development
bun run build    # Build for production
bun run lint     # Lint code
bun run format   # Format code
bun run typecheck # Type check
```
