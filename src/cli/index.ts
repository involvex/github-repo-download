import pkg from '../../package.json' with {type: 'json'}
import process from 'node:process'
import {parseArgs} from 'util'
import bun from 'bun'

export interface GlobalFlags {
	help: boolean
	version: boolean
	config: string | undefined
	verbose: boolean
	include: string | undefined
	exclude: string | undefined
}

export function parseGlobalFlags(args: string[]): {
	values: GlobalFlags
	positionals: string[]
} {
	const {values, positionals} = parseArgs({
		args,
		options: {
			help: {
				type: 'boolean',
				short: 'h',
			},
			version: {
				type: 'boolean',
				short: 'v',
			},
		},
		strict: false,
	})

	return {
		values: {
			help: Boolean(values.help),
			version: Boolean(values.version),
			config: values.config as string | undefined,
			verbose: Boolean(values.verbose),
			include: values.include as string | undefined,
			exclude: values.exclude as string | undefined,
		},
		positionals,
	}
}

export async function cli() {
	const args = process.argv.slice(2)

	try {
		const {values, positionals} = parseGlobalFlags(args)

		if (values.help) {
			await import('./commands/help')
			return
		}

		if (values.version) {
			bun.stdout.write(`v${pkg.version}\n`)
			return
		}

		const command = positionals[0]

		// If no command or command looks like a source (owner/repo or URL), treat as download
		if (!command || command.startsWith('http') || command.includes('/')) {
			await import('./commands/download').then(m => m.downloadCommand(args))
			return
		}

		switch (command) {
			case 'help':
				await import('./commands/help')
				break
			case 'about':
				await import('./commands/about')
				break
			case 'download':
				await import('./commands/download').then(m =>
					m.downloadCommand(args.slice(1)),
				)
				break
			default:
				await import('./commands/help')
				break
		}
	} catch (error) {
		bun.stderr.write('Error:', error as undefined)
		process.exit(1)
	}
}
