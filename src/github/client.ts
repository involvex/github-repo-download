export interface GitHubContent {
	type: 'file' | 'dir'
	name: string
	path: string
	download_url: string | null
	size: number
	sha: string
}

export interface GitHubTreeItem {
	path: string
	mode: string
	type: 'blob' | 'tree'
	sha: string
	size?: number
	url: string
}

export interface GitHubRepository {
	default_branch: string
}

const GITHUB_API_BASE = 'https://api.github.com'

export async function getRepository(
	owner: string,
	repo: string,
): Promise<GitHubRepository> {
	const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
		headers: {
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'github-repo-download-cli',
		},
	})

	if (!response.ok) {
		if (response.status === 404) {
			throw new Error(`Repository not found: ${owner}/${repo}`)
		}
		throw new Error(`Failed to fetch repository: ${response.statusText}`)
	}

	return response.json() as Promise<GitHubRepository>
}

export async function getContents(
	owner: string,
	repo: string,
	path: string,
	ref: string,
): Promise<GitHubContent | GitHubContent[]> {
	const endpoint = path
		? `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`
		: `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents`

	const url = ref ? `${endpoint}?ref=${ref}` : endpoint

	const response = await fetch(url, {
		headers: {
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'github-repo-download-cli',
		},
	})

	if (!response.ok) {
		if (response.status === 404) {
			throw new Error(`Path not found: ${path}`)
		}
		throw new Error(`Failed to fetch contents: ${response.statusText}`)
	}

	return response.json() as Promise<GitHubContent | GitHubContent[]>
}

export async function getTree(
	owner: string,
	repo: string,
	ref: string,
): Promise<{tree: GitHubTreeItem[]}> {
	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${ref}?recursive=1`,
		{
			headers: {
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'github-repo-download-cli',
			},
		},
	)

	if (!response.ok) {
		if (response.status === 404) {
			throw new Error(`Ref not found: ${ref}`)
		}
		throw new Error(`Failed to fetch tree: ${response.statusText}`)
	}

	return response.json() as Promise<{tree: GitHubTreeItem[]}>
}

export async function downloadFile(downloadUrl: string): Promise<Uint8Array> {
	const response = await fetch(downloadUrl)

	if (!response.ok) {
		throw new Error(`Failed to download file: ${response.statusText}`)
	}

	const arrayBuffer = await response.arrayBuffer()
	return new Uint8Array(arrayBuffer)
}
