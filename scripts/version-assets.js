/**
 * Post-build cache-busting.
 *
 * Rewrites every manual `?v=…` asset URL to a content hash (`?v=<sha1-10>`),
 * so browsers fetch fresh bytes exactly when content changes and reuse cache
 * otherwise. Runs automatically as part of `npm run build` (local and CI).
 *
 * Covered assets:
 *  - index.html -> js/app.min.js, css/app.min.css
 *  - js/app.min.js -> js/templates.bundle.js (lazy chunk URL)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');

function hashOf( relPath ) {
	const abs = path.join(root, relPath);
	return crypto.createHash('sha1').update( fs.readFileSync(abs) ).digest('hex').slice(0, 10);
}

function rewrite( relPath, replacements ) {
	const abs = path.join(root, relPath);
	let text = fs.readFileSync(abs, 'utf8');
	for ( const [ pattern, replacement ] of replacements ) {
		if ( !pattern.test(text) ) {
			throw new Error(`version-assets: pattern ${pattern} not found in ${relPath}`);
		}
		text = text.replace(pattern, replacement);
	}
	fs.writeFileSync(abs, text);
}

// Order matters: the chunk URL is patched into the bundle first,
// then the bundle (final bytes) is hashed for index.html.
const tplHash = hashOf('js/templates.bundle.js');

rewrite('js/app.min.js', [
	[/js\/templates\.bundle\.js\?v=[\w-]+/g, `js/templates.bundle.js?v=${tplHash}`],
]);

const appHash = hashOf('js/app.min.js');
const cssHash = hashOf('css/app.min.css');

rewrite('index.html', [
	[/js\/app\.min\.js\?v=[\w-]+/g, `js/app.min.js?v=${appHash}`],
	[/css\/app\.min\.css\?v=[\w-]+/g, `css/app.min.css?v=${cssHash}`],
]);

console.log(`version-assets: app=${appHash} css=${cssHash} templates=${tplHash}`);
