import {afterEach, describe, expect, it, mock} from 'bun:test'
import {mkdtemp, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import type {GitHubContent} from '../src/github/client'

function content(path: string, type: 'file' | 'dir'): GitHubContent {
	return {
		type,
		name: path.split('/').pop()!,
		path,
		download_url: type === 'file' ? `https://raw.example/${path}` : null,
		size: 1,
		sha: 'x',
	}
}

// The contents API only returns immediate children, so each directory needs
// its own entry here - that is exactly what caused the empty-subdir bug.
const contentsByPath: Record<string, GitHubContent[]> = {
	cli: [
		content('cli/index.ts', 'file'),
		content('cli/src', 'dir'),
		content('cli/.github', 'dir'),
	],
	'cli/src': [
		content('cli/src/app.ts', 'file'),
		content('cli/src/deep', 'dir'),
	],
	'cli/src/deep': [content('cli/src/deep/nested.ts', 'file')],
	'cli/.github': [content('cli/.github/config.yml', 'file')],
}

const getContents = mock(
	async (_owner: string, _repo: string, path: string) => {
		const result = contentsByPath[path]
		if (!result) {
			throw new Error(`Unexpected path: ${path}`)
		}
		return result
	},
)

const downloadFile = mock(async (url: string) =>
	new TextEncoder().encode(`contents of ${url}`),
)

mock.module('../src/github/client', () => ({
	getRepository: mock(async () => ({default_branch: 'main'})),
	getContents,
	downloadFile,
	getTree: mock(async () => ({tree: []})),
}))

const {download} = await import('../src/github/download')

describe('download() for a directory path', () => {
	let dir = ''

	afterEach(async () => {
		if (dir) {
			await rm(dir, {recursive: true, force: true})
		}
	})

	it('populates nested subdirectories instead of leaving them empty', async () => {
		dir = await mkdtemp(join(tmpdir(), 'ghd-test-'))

		await download('https://github.com/owner/repo/tree/main/cli', {
			output: dir,
		})

		const expected: Record<string, string> = {
			'index.ts': 'contents of https://raw.example/cli/index.ts',
			'src/app.ts': 'contents of https://raw.example/cli/src/app.ts',
			'src/deep/nested.ts':
				'contents of https://raw.example/cli/src/deep/nested.ts',
			'.github/config.yml':
				'contents of https://raw.example/cli/.github/config.yml',
		}

		for (const [relativePath, contents] of Object.entries(expected)) {
			expect(await readFile(join(dir, relativePath), 'utf8')).toBe(contents)
		}

		// The requested directory plus each nested directory was fetched once.
		expect(getContents).toHaveBeenCalledTimes(4)
	})
})
