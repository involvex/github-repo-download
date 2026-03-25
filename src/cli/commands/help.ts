import bun from 'bun'

export default function showHelp() {
	bun.stdout.write(`
Usage: github-repo-download <source> [options]

Arguments:
  source               URL or owner/repo (with optional path)

Commands:
  help            Show this help message
  about           Show information about this tool

Options:
  -o, --output <dir>  Output directory (default: repository name)
  -h, --help          Display this help message

Examples:
  github-repo-download involvex/create-expo-stack
  github-repo-download https://github.com/involvex/create-expo-stack/tree/main/cli
  github-repo-download https://github.com/involvex/create-expo-stack/blob/main/cli/package.json
`)
}

showHelp()
