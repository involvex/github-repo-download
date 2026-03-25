import pkg from '../../../package.json' with {type: 'json'}
import bun from 'bun'
export default function showAbout() {
	bun.stdout.write(`
involvex-formatter v${pkg.version}
A code formatting and linting tool for JavaScript and TypeScript projects.

Author:        ${pkg.author}
Sponsor:       ${pkg.sponsor.url}
Repository:    ${pkg.repository.url}
`)
}

showAbout()
