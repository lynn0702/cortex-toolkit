#!/usr/bin/env node
const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');

function run(label, command) {
	const start = Date.now();
	process.stdout.write(`\n[GATE] === ${label} ===\n$ ${command}\n`);
	try {
		execSync(command, { cwd: root, stdio: 'inherit' });
		const duration = ((Date.now() - start) / 1000).toFixed(2);
		console.log(`[PASS] ${label} (${duration}s)`);
	} catch (err) {
		console.error(`\n[FAIL] ${label} failed!`);
		process.exit(1);
	}
}

// 1. Production Build (formats with prettier, compiles types, bundles assets)
run('1. Production Build (vite + asset versioning)', 'npm run build');

// 2. Code Style
run('2. Code Style (prettier)', 'npx prettier --check --cache .');

// 3. Type Check
run('3. Type Check (vue-tsc)', 'npm run check');

// 4. Test Suites
run('4. Test Suites (vitest + 8 node suites)', 'npm test');

// 5. Schema & Data Validation
run('5. Schema & Corpus Validation', 'npm run validate');

// 6. Security audit (v-html check)
console.log('\n[GATE] === 6. Security Audit: v-html scan ===');
const allowedPatterns = [
	'renderText',
	'renderMarkdown',
	'renderNotesText',
	'renderNameHtml',
	'getDieDisplayValue',
	'renderDieValueForPrint',
	'renderDieValue',
	'renderDate',
	'renderDicePreview',
	'singleDieSVG',
	'bundleDiceSVG',
	'renderDieconSVG',
];

function checkVHtml(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			checkVHtml(full);
		} else if (
			/\.(vue|ts|js)$/.test(entry.name) &&
			!entry.name.endsWith('.min.js') &&
			!entry.name.endsWith('.bundle.js')
		) {
			const content = fs.readFileSync(full, 'utf8');
			const regex = /v-html\s*=\s*(["'])([\s\S]*?)\1/g;
			let match;
			while ((match = regex.exec(content)) !== null) {
				const expr = match[2];
				const isSafe = allowedPatterns.some((p) => expr.includes(p));
				if (!isSafe) {
					console.error(`[FAIL] Unsafe or unvetted v-html found in ${path.relative(root, full)}`);
					console.error(`Expr: ${expr.trim()}`);
					process.exit(1);
				}
			}
		}
	}
}
checkVHtml(path.join(root, 'js'));

// Verify index.html security & SEO head metadata + inline script CSP SHA-256 hash
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
if (!/<meta\s+name="description"\s+content="[^"]{20,}"/i.test(indexHtml)) {
	console.error('[FAIL] index.html is missing a non-empty <meta name="description"> tag');
	process.exit(1);
}
if (!/<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin"/i.test(indexHtml)) {
	console.error('[FAIL] index.html is missing <meta name="referrer" content="strict-origin-when-cross-origin">');
	process.exit(1);
}
const cspMatch = indexHtml.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
const inlineScriptMatch = indexHtml.match(/<script>([\s\S]*?)<\/script>/i);
if (!cspMatch) {
	console.error('[FAIL] index.html is missing <meta http-equiv="Content-Security-Policy">');
	process.exit(1);
}
if (inlineScriptMatch && cspMatch.index > inlineScriptMatch.index) {
	console.error('[FAIL] <meta http-equiv="Content-Security-Policy"> must appear before inline <script> in index.html');
	process.exit(1);
}
const cspContent = cspMatch[1];
if (
	!cspContent.includes("object-src 'none'") ||
	!cspContent.includes("base-uri 'self'") ||
	/frame-ancestors/i.test(cspContent)
) {
	console.error(
		"[FAIL] CSP meta tag must include object-src 'none', base-uri 'self', and omit header-only frame-ancestors",
	);
	process.exit(1);
}
if (inlineScriptMatch) {
	const expectedHash = `sha256-${crypto.createHash('sha256').update(inlineScriptMatch[1], 'utf8').digest('base64')}`;
	if (!cspContent.includes(`'${expectedHash}'`)) {
		console.error(`[FAIL] index.html CSP script-src hash mismatch! Expected '${expectedHash}'`);
		process.exit(1);
	}
}
console.log('[PASS] Security Audit: all v-html instances use vetted renderers & CSP hash verified');

// 7. Icon Subset Coverage
console.log('\n[GATE] === 7. Icon Subset Coverage ===');
const faCss = fs.readFileSync(path.join(root, 'css', 'fontawesome.css'), 'utf8');
const definedIcons = new Set([...faCss.matchAll(/\.fa-([a-z0-9-]+):before/g)].map((m) => `fa-${m[1]}`));
const ignoredFaClasses = new Set([
	'fa-solid',
	'fa-regular',
	'fa-brands',
	'fa-fw',
	'fa-xs',
	'fa-sm',
	'fa-lg',
	'fa-xl',
	'fa-2x',
	'fa-spin',
]);
const missingIcons = new Map();
function checkIcons(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			checkIcons(full);
		} else if (
			/\.(vue|ts)$/.test(entry.name) &&
			!entry.name.endsWith('.min.js') &&
			!entry.name.endsWith('.bundle.js')
		) {
			const content = fs.readFileSync(full, 'utf8');
			for (const match of content.matchAll(/\bfa-([a-z0-9-]+)\b/g)) {
				const cls = `fa-${match[1]}`;
				if (ignoredFaClasses.has(cls) || definedIcons.has(cls)) continue;
				if (!missingIcons.has(cls)) missingIcons.set(cls, []);
				const rel = path.relative(root, full);
				if (!missingIcons.get(cls).includes(rel)) missingIcons.get(cls).push(rel);
			}
		}
	}
}
checkIcons(path.join(root, 'js'));
if (missingIcons.size > 0) {
	const detail = [...missingIcons.entries()].map(([cls, files]) => `${cls} (${files.join(', ')})`).join('; ');
	console.error(`[FAIL] Missing Font Awesome subset icon(s): ${detail}`);
	process.exit(1);
}
console.log('[PASS] Icon Subset Coverage: all fa-* classes exist in css/fontawesome.css');

// 8. CSS Syntax Validation (Lightning CSS), Style Controls & Gzip Payload Budgets
console.log('\n[GATE] === 8. CSS Validation, Style Controls & Payload Budgets ===');
const lcssPath = require.resolve('lightningcss', {
	paths: [path.join(root, 'node_modules', 'vite'), root],
});
const lightningcss = require(lcssPath);
const allCssFiles = fs.readdirSync(path.join(root, 'css')).filter((f) => f.endsWith('.css'));
for (const file of allCssFiles) {
	const full = path.join(root, 'css', file);
	const res = lightningcss.transform({
		filename: `css/${file}`,
		code: fs.readFileSync(full),
		minify: false,
		errorRecovery: true,
	});
	if (res.warnings && res.warnings.length > 0) {
		console.error(`[FAIL] Lightning CSS syntax warning(s) in css/${file}:`);
		for (const w of res.warnings) {
			console.error(`  line ${w.loc?.line}:${w.loc?.column} - ${w.message}`);
		}
		process.exit(1);
	}
}

const sourceScreenCss = allCssFiles.filter(
	(f) => !['app.min.css', 'print.css', 'fonts.css', 'fontawesome.css'].includes(f),
);
let importantCount = 0;
let zHard = 0;
let emptyRulesets = 0;
for (const file of sourceScreenCss) {
	const s = fs.readFileSync(path.join(root, 'css', file), 'utf8');
	importantCount += (s.match(/!important/g) || []).length;
	zHard += (s.match(/z-index:\s*\d+/g) || []).length;
	emptyRulesets += (s.match(/\{\s*\}/g) || []).length;
}
let staticStyle = 0;
(function walkVue(dir) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const fp = path.join(dir, e.name);
		if (e.isDirectory()) walkVue(fp);
		else if (e.name.endsWith('.vue')) {
			const s = fs.readFileSync(fp, 'utf8');
			staticStyle += (s.match(/\sstyle="/g) || []).length;
		}
	}
})(path.join(root, 'js'));

if (staticStyle > 0 || emptyRulesets > 0 || importantCount > 4 || zHard > 3) {
	console.error(
		`[FAIL] Style control budget exceeded: ${JSON.stringify({ staticStyle, emptyRulesets, importantCount, zHard })}`,
	);
	process.exit(1);
}

const cssGzipKb = zlib.gzipSync(fs.readFileSync(path.join(root, 'css', 'app.min.css'))).length / 1024;
const jsGzipKb = zlib.gzipSync(fs.readFileSync(path.join(root, 'js', 'app.min.js'))).length / 1024;
const CSS_GZIP_LIMIT_KB = 90;
const JS_GZIP_LIMIT_KB = 280;
if (cssGzipKb > CSS_GZIP_LIMIT_KB || jsGzipKb > JS_GZIP_LIMIT_KB) {
	console.error(
		`[FAIL] Gzip bundle budget exceeded: css=${cssGzipKb.toFixed(1)}kB (max ${CSS_GZIP_LIMIT_KB}kB), js=${jsGzipKb.toFixed(1)}kB (max ${JS_GZIP_LIMIT_KB}kB)`,
	);
	process.exit(1);
}
console.log(
	`[PASS] CSS Validation (${allCssFiles.length} files, 0 warnings), Style Controls (!important=${importantCount}/4, staticStyle=0) & Gzip Budgets (CSS=${cssGzipKb.toFixed(1)}kB/${CSS_GZIP_LIMIT_KB}kB, JS=${jsGzipKb.toFixed(1)}kB/${JS_GZIP_LIMIT_KB}kB)`,
);

console.log('\n=========================================');
console.log(' ALL GATES PASSED (Definition of Done) ');
console.log('=========================================\n');
