/**
 * Post-build cache-busting.
 *
 * Rewrites asset URLs to content hashes (`?v=<sha1-10>`), so browsers fetch
 * fresh bytes exactly when content changes and reuse cache otherwise.
 *
 * Modes:
 *  - Default (repo root, `npm run build`): stamps `js/templates.bundle.js?v=<hash>`
 *    inside `js/app.min.js` without modifying tracked `index.html`.
 *  - `--site <dir>` (Pages CI staging): stamps `js/templates.bundle.js?v=<hash>`
 *    inside `<dir>/js/app.min.js` and stamps `?v=<hash>` onto `css/fonts.css`,
 *    `css/app.min.css`, and `js/app.min.js` inside `<dir>/index.html`.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');

function resolveTargetDir(argv) {
	const idx = argv.indexOf('--site');
	if (idx === -1) return { targetDir: root, stampHtml: false };
	const dirArg = argv[idx + 1];
	if (!dirArg || dirArg.startsWith('--')) {
		throw new Error('version-assets: --site requires a target directory argument');
	}
	return { targetDir: path.resolve(root, dirArg), stampHtml: true };
}

function hashOf(targetDir, relPath) {
	const abs = path.join(targetDir, relPath);
	return crypto.createHash('sha1').update(fs.readFileSync(abs)).digest('hex').slice(0, 10);
}

function rewrite(targetDir, relPath, replacements) {
	const abs = path.join(targetDir, relPath);
	let text = fs.readFileSync(abs, 'utf8');
	for (const [pattern, replacement] of replacements) {
		if (!pattern.test(text)) {
			throw new Error(`version-assets: pattern ${pattern} not found in ${relPath}`);
		}
		text = text.replace(pattern, replacement);
	}
	fs.writeFileSync(abs, text);
}

const { targetDir, stampHtml } = resolveTargetDir(process.argv.slice(2));

// Order matters: the chunk URL is patched into the bundle first,
// then the bundle (final bytes) is hashed for index.html.
const tplHash = hashOf(targetDir, 'js/templates.bundle.js');

rewrite(targetDir, 'js/app.min.js', [
	[/js\/templates\.bundle\.js(?:\?v=[\w-]+)?/g, `js/templates.bundle.js?v=${tplHash}`],
]);

if (stampHtml) {
	const appHash = hashOf(targetDir, 'js/app.min.js');
	const cssHash = hashOf(targetDir, 'css/app.min.css');
	const fontsHash = hashOf(targetDir, 'css/fonts.css');

	rewrite(targetDir, 'index.html', [
		[/js\/app\.min\.js(?:\?v=[\w-]+)?/g, `js/app.min.js?v=${appHash}`],
		[/css\/app\.min\.css(?:\?v=[\w-]+)?/g, `css/app.min.css?v=${cssHash}`],
		[/css\/fonts\.css(?:\?v=[\w-]+)?/g, `css/fonts.css?v=${fontsHash}`],
	]);

	console.log(
		`version-assets: site=${targetDir} app=${appHash} css=${cssHash} fonts=${fontsHash} templates=${tplHash}`,
	);
} else {
	console.log(`version-assets: templates=${tplHash}`);
}
