export interface ParsedSource {
	owner: string
	repo: string
	ref: string
	path: string
}

export function parseSource(input: string): ParsedSource {
	const trimmed = input.trim()

	// Check if it's a URL
	if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
		return parseUrl(trimmed)
	}

	// Otherwise it's owner/repo or owner/repo/path
	return parseShorthand(trimmed)
}

function parseUrl(url: string): ParsedSource {
	const parsedUrl = new URL(url)

	if (
		parsedUrl.hostname !== 'github.com' &&
		parsedUrl.hostname !== 'www.github.com'
	) {
		throw new Error('Only GitHub URLs are supported')
	}

	const pathParts = parsedUrl.pathname.split('/').filter(Boolean)

	if (pathParts.length < 2) {
		throw new Error(
			'Invalid GitHub URL. Expected: owner/repo or owner/repo/path',
		)
	}

	const owner = pathParts[0]!
	const repo = pathParts[1]!.replace(/\.git$/, '')

	let path = ''
	let ref = ''

	// Check the URL pattern
	const afterRepo = pathParts.slice(2)

	if (afterRepo.length === 0) {
		// https://github.com/owner/repo
		ref = '' // Will fetch default branch later
		path = ''
	} else if (afterRepo[0] === 'tree') {
		// https://github.com/owner/repo/tree/main/path
		ref = afterRepo[1] || ''
		path = afterRepo.slice(2).join('/')
	} else if (afterRepo[0] === 'blob') {
		// https://github.com/owner/repo/blob/main/path
		ref = afterRepo[1] || ''
		path = afterRepo.slice(2).join('/')
	} else if (afterRepo[0] === 'raw') {
		// https://github.com/owner/repo/raw/main/path - redirect handled elsewhere
		ref = afterRepo[1] || ''
		path = afterRepo.slice(2).join('/')
	}

	return {owner, repo, ref, path}
}

function parseShorthand(input: string): ParsedSource {
	const parts = input.split('/')

	if (parts.length < 2) {
		throw new Error('Invalid input. Expected: owner/repo or owner/repo/path')
	}

	const owner = parts[0]!
	const repo = parts[1]!.replace(/\.git$/, '')
	const path = parts.slice(2).join('/')

	return {owner, repo, ref: '', path}
}

export function getDisplayName(parsed: ParsedSource): string {
	return parsed.repo
}
