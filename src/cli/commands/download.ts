import {download} from '../../github/download'
import {parseArgs} from 'util'

interface DownloadFlags {
	help: boolean
	output: string | undefined
}

export async function downloadCommand(args: string[]) {
	const {values, positionals} = parseArgs({
		args,
		options: {
			help: {
				type: 'boolean',
				short: 'h',
			},
			output: {
				type: 'string',
				short: 'o',
			},
		},
		strict: false,
	})

	const flags = values as DownloadFlags

	if (flags.help) {
		showHelp()
		return
	}

	const source = positionals[0]

	if (!source) {
		console.error('Error: Source is required')
		showHelp()
		process.exit(1)
	}

	try {
		await download(source, {
			output: flags.output,
		})
	} catch (error) {
		console.error('Error:', (error as Error).message)
		process.exit(1)
	}
}

function showHelp() {
	console.log(`
Usage: github-repo-download <source> [options]

Arguments:
  source               URL or owner/repo (with optional path)

Options:
  -o, --output <dir>  Output directory (default: repository name)
  -h, --help          Show help

Examples:
  github-repo-download involvex/create-expo-stack
  github-repo-download https://github.com/involvex/create-expo-stack/tree/main/cli
  github-repo-download https://github.com/involvex/create-expo-stack/blob/main/cli/package.json
`)
}
