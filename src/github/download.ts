import {existsSync} from 'node:fs'
import {mkdir, writeFile} from 'node:fs/promises'
import {resolve, sep} from 'node:path'
import {
	downloadFile,
	getContents,
	getRepository,
	getTree,
	type GitHubTreeItem,
} from './client'
import {getDisplayName, parseSource} from './parser'

export interface DownloadOptions {
	output?: string
}

export async function download(source: string, options: DownloadOptions = {}) {
	const parsed = parseSource(source)
	const {owner, repo, ref, path} = parsed

	// Get default branch if not specified
	const repoInfo = await getRepository(owner, repo)
	const branch = ref || repoInfo.default_branch

	console.log(
		`Fetching from ${owner}/${repo} (${branch})${path ? `/${path}` : ''}...`,
	)

	const outputDir = options.output || getDisplayName(parsed)

	if (path) {
		// Download specific path (file or directory)
		await downloadPath(owner, repo, branch, path, outputDir)
	} else {
		// Download entire repository
		await downloadRepository(owner, repo, branch, outputDir)
	}

	console.log(`✓ Downloaded to ./${outputDir}`)
}

async function downloadPath(
	owner: string,
	repo: string,
	branch: string,
	path: string,
	outputDir: string,
) {
	const contents = await getContents(owner, repo, path, branch)

	// Check if it's a file
	if (!Array.isArray(contents) && contents.type === 'file') {
		const fileName = path.split('/').pop() || 'file'
		// If outputDir is the same as the filename, don't double it
		const destPath =
			outputDir === fileName ? fileName : outputDir + sep + fileName
		await downloadSingleFile(contents.download_url!, destPath)
		return
	}

	// It's a directory - need to strip the requested path prefix
	const items = Array.isArray(contents) ? contents : []
	const prefix = path + '/'
	const normalizedItems = items.map(item => ({
		...item,
		path: item.path.replace(new RegExp('^' + prefix), ''),
	}))
	await downloadDirectoryContents(
		owner,
		repo,
		branch,
		normalizedItems,
		outputDir,
	)
}

async function downloadSingleFile(downloadUrl: string, destPath: string) {
	console.log(`Downloading file: ${destPath}...`)
	const data = await downloadFile(downloadUrl)

	const dir = destPath.substring(0, destPath.lastIndexOf(sep))
	if (dir) {
		await mkdir(dir, {recursive: true})
	}

	await writeFile(destPath, data)
}

async function downloadDirectoryContents(
	owner: string,
	repo: string,
	branch: string,
	items: {
		name: string
		path: string
		type: string
		download_url: string | null
	}[],
	outputDir: string,
) {
	for (const item of items) {
		const itemPath = resolve(outputDir, item.path)

		if (item.type === 'dir') {
			await mkdir(itemPath, {recursive: true})
		} else if (item.download_url) {
			console.log(`Downloading: ${item.path}`)
			const data = await downloadFile(item.download_url)

			const dir = itemPath.substring(0, itemPath.lastIndexOf(sep))
			if (dir) {
				await mkdir(dir, {recursive: true})
			}

			await writeFile(itemPath, data)
		}
	}
}

async function downloadRepository(
	owner: string,
	repo: string,
	branch: string,
	outputDir: string,
) {
	console.log(`Fetching repository tree...`)
	const {tree} = await getTree(owner, repo, branch)

	// Filter to only files (blobs)
	const files = tree.filter((item): item is GitTreeItem => item.type === 'blob')

	console.log(`Downloading ${files.length} files...`)

	// Create base directory
	if (!existsSync(outputDir)) {
		await mkdir(outputDir, {recursive: true})
	}

	// Download each file
	let downloaded = 0
	for (const file of files) {
		const destPath = resolve(outputDir, file.path)

		const dir = destPath.substring(0, destPath.lastIndexOf(sep))
		if (dir) {
			await mkdir(dir, {recursive: true})
		}

		const response = await fetch(
			`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`,
		)

		if (!response.ok) {
			console.warn(`Failed to download: ${file.path}`)
			continue
		}

		const arrayBuffer = await response.arrayBuffer()
		await writeFile(destPath, new Uint8Array(arrayBuffer))

		downloaded++
		if (downloaded % 50 === 0) {
			console.log(`Downloaded ${downloaded}/${files.length} files...`)
		}
	}

	console.log(`Downloaded ${downloaded} files`)
}

interface GitTreeItem extends GitHubTreeItem {
	type: 'blob'
}
