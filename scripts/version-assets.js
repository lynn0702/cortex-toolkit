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

function discoverSplashPreloadImage(targetDir) {
	const jsonPath = path.join(targetDir, 'data', 'templates', 'Dreamer_Architect.curio.json');
	if (!fs.existsSync(jsonPath)) return null;
	try {
		const doc = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
		const candidates = [];
		for (const ts of doc?.traitSets || []) {
			candidates.push(ts?.portrait?.url, ts?.view?.frame?.image?.url, ts?.view?.portrait?.url);
		}
		candidates.push(doc?.portrait?.url, doc?.view?.portrait?.url, doc?.view?.listing?.image);
		for (const raw of candidates) {
			if (typeof raw !== 'string') continue;
			const trimmed = raw.trim();
			if (!trimmed || /^(?:https?:|data:|blob:|\/)/i.test(trimmed)) continue;
			if (/[<>"'\s]/.test(trimmed)) continue;
			if (fs.existsSync(path.join(targetDir, trimmed))) {
				return trimmed;
			}
		}
	} catch {
		// ignore malformed or absent showcase file
	}
	return null;
}

const { targetDir, stampHtml } = resolveTargetDir(process.argv.slice(2));

// Order matters: the chunk URL is patched into the bundle (and any lazy chunks) first,
// then the bundle (final bytes) is hashed for index.html.
const tplHash = hashOf(targetDir, 'js/templates.bundle.js');
const tplPattern = /js\/templates\.bundle\.js(?:\?v=[\w-]+)?/g;

rewrite(targetDir, 'js/app.min.js', [[tplPattern, `js/templates.bundle.js?v=${tplHash}`]]);

const chunksDir = path.join(targetDir, 'js', 'chunks');
if (fs.existsSync(chunksDir)) {
	for (const entry of fs.readdirSync(chunksDir)) {
		if (!entry.endsWith('.js')) continue;
		const relChunk = path.join('js', 'chunks', entry);
		const chunkText = fs.readFileSync(path.join(targetDir, relChunk), 'utf8');
		if (tplPattern.test(chunkText)) {
			tplPattern.lastIndex = 0;
			rewrite(targetDir, relChunk, [[tplPattern, `js/templates.bundle.js?v=${tplHash}`]]);
		}
		tplPattern.lastIndex = 0;
	}
}

if (stampHtml) {
	const appHash = hashOf(targetDir, 'js/app.min.js');
	const cssHash = hashOf(targetDir, 'css/app.min.css');
	const fontsHash = hashOf(targetDir, 'css/fonts.css');
	const splashLcpImg = discoverSplashPreloadImage(targetDir);

	// Discover static ESM imports at the top of js/app.min.js so the browser preload
	// scanner fetches them in parallel with app.min.js (eliminating 2-RTT ESM waterfalls).
	const appJsHead = fs.readFileSync(path.join(targetDir, 'js', 'app.min.js'), 'utf8').slice(0, 4096);
	const staticImports = [
		...new Set([...appJsHead.matchAll(/from\s*["']\.\/(chunks\/[^"']+\.js)["']/g)].map((m) => `js/${m[1]}`)),
	];

	const htmlReplacements = [
		[/js\/app\.min\.js(?:\?v=[\w-]+)?/g, `js/app.min.js?v=${appHash}`],
		[/css\/app\.min\.css(?:\?v=[\w-]+)?/g, `css/app.min.css?v=${cssHash}`],
		[/css\/fonts\.css(?:\?v=[\w-]+)?/g, `css/fonts.css?v=${fontsHash}`],
	];

	const htmlAbs = path.join(targetDir, 'index.html');
	const existingHtml = fs.readFileSync(htmlAbs, 'utf8');
	const preloadTags = [];
	if (splashLcpImg && !existingHtml.includes('rel="preload" as="image"')) {
		preloadTags.push(`\t<link rel="preload" as="image" href="${splashLcpImg}" fetchpriority="high">`);
	}
	for (const chunkRel of staticImports) {
		if (!existingHtml.includes(chunkRel)) {
			preloadTags.push(`\t<link rel="modulepreload" href="${chunkRel}">`);
		}
	}
	if (preloadTags.length > 0) {
		htmlReplacements.push([/(\t<!-- FONTS -->)/, `${preloadTags.join('\n')}\n\n$1`]);
	}

	rewrite(targetDir, 'index.html', htmlReplacements);

	console.log(
		`version-assets: site=${targetDir} app=${appHash} css=${cssHash} fonts=${fontsHash} templates=${tplHash} modulepreloads=${staticImports.length}${splashLcpImg ? ` lcp=${splashLcpImg}` : ''}`,
	);
} else {
	console.log(`version-assets: templates=${tplHash}`);
}
