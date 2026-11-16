#!/usr/bin/env node
/**
 * Data-driven self-hosted font sync.
 * Subsets the base UI sheet fonts (Josefin Sans, Open Sans, Alegreya Sans SC)
 * plus any Google Fonts declared in data/templates/Dreamer_Architect.curio.json
 * into fonts/*.woff2 (latin + latin-ext) and writes css/fonts.css.
 *
 * Usage:
 *   node scripts/fetch-fonts.mjs           # Force re-fetch all required fonts
 *   node scripts/fetch-fonts.mjs --ensure  # Fast offline check; fetches only when splash JSON fonts change
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const fontsDir = path.join(root, 'fonts');
const cssOut = path.join(root, 'css', 'fonts.css');
const splashJsonPath = path.join(root, 'data', 'templates', 'Dreamer_Architect.curio.json');

const BASE_FONT_SPECS = new Map([
	['Josefin Sans', 'ital,wght@0,400..700;1,400..700'],
	['Open Sans', 'ital,wght@0,400..800;1,400..700'],
	['Alegreya Sans SC', 'wght@400;500;700;800;900'],
]);

const UA =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const KEEP_SUBSETS = new Set(['latin', 'latin-ext']);

function discoverRequiredFamilies() {
	const required = new Map();
	for (const [fam, axis] of BASE_FONT_SPECS.entries()) {
		required.set(fam.toLowerCase(), { family: fam, axisCandidates: [axis] });
	}

	if (fs.existsSync(splashJsonPath)) {
		const raw = JSON.parse(fs.readFileSync(splashJsonPath, 'utf8'));
		const theme = raw?.view?.theme || {};
		const customUrls = new Set(
			Array.isArray(theme.customFonts)
				? theme.customFonts
						.map((cf) =>
							String(cf?.name || '')
								.trim()
								.toLowerCase(),
						)
						.filter(Boolean)
				: [],
		);
		const fontsObj = theme.fonts && typeof theme.fonts === 'object' ? theme.fonts : {};
		for (const val of Object.values(fontsObj)) {
			if (typeof val !== 'string') continue;
			const fam = val.trim();
			const key = fam.toLowerCase();
			if (!fam || customUrls.has(key) || required.has(key)) continue;
			required.set(key, {
				family: fam,
				axisCandidates: [
					'ital,wght@0,400..800;1,400..800',
					'ital,wght@0,400;0,600;0,700;1,400',
					'wght@400;600;700',
					'wght@400;700',
					'',
				],
			});
		}
	}
	return required;
}

function isAlreadySynced(required) {
	if (!fs.existsSync(cssOut)) return false;
	const css = fs.readFileSync(cssOut, 'utf8');
	const presentFamilies = new Set(
		[...css.matchAll(/font-family:\s*['"]([^'"]+)['"]/g)].map((m) => m[1].trim().toLowerCase()),
	);
	if (presentFamilies.size !== required.size) return false;
	for (const key of required.keys()) {
		if (!presentFamilies.has(key)) return false;
	}
	const referencedFiles = [...css.matchAll(/url\(['"]?\.\.\/fonts\/([^'")]+)['"]?\)/g)].map((m) => m[1]);
	if (!referencedFiles.length) return false;
	for (const f of referencedFiles) {
		if (!fs.existsSync(path.join(fontsDir, f))) return false;
	}
	return true;
}

function extractProp(body, prop) {
	const m = body.match(new RegExp(`${prop}\\s*:\\s*([^;]+);`));
	return m ? m[1].trim() : null;
}

async function fetchFamilyCss(family, axisCandidates) {
	const encoded = encodeURIComponent(family);
	let lastStatus = '';
	for (const axis of axisCandidates) {
		const spec = axis ? `${encoded}:${axis}` : encoded;
		const url = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
		const res = await fetch(url, { headers: { 'User-Agent': UA } });
		if (res.ok) {
			return await res.text();
		}
		lastStatus = `${res.status} ${res.statusText}`;
	}
	throw new Error(`Google Fonts CSS request failed for "${family}": ${lastStatus}`);
}

async function main() {
	const ensureOnly = process.argv.includes('--ensure');
	const required = discoverRequiredFamilies();

	if (ensureOnly && isAlreadySynced(required)) {
		const names = [...required.values()].map((r) => r.family).join(', ');
		console.log(`fetch-fonts: verified self-hosted fonts (${names})`);
		return;
	}

	fs.mkdirSync(fontsDir, { recursive: true });
	const combinedCssParts = [];
	for (const { family, axisCandidates } of required.values()) {
		combinedCssParts.push(await fetchFamilyCss(family, axisCandidates));
	}
	const cssText = combinedCssParts.join('\n');

	const blocks = [...cssText.matchAll(/\/\*\s*([^*]+?)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)];
	const selected = blocks.filter((b) => KEEP_SUBSETS.has(b[1].trim()));
	if (!selected.length) {
		throw new Error('No latin / latin-ext @font-face blocks found in Google Fonts response.');
	}

	const cssBlocks = ['/* Self-hosted default & splash sheet fonts (latin + latin-ext) */'];
	const seenFiles = new Set();

	for (const match of selected) {
		const subset = match[1].trim();
		const body = match[2];
		const family = extractProp(body, 'font-family')?.replace(/^['"]|['"]$/g, '');
		const style = extractProp(body, 'font-style') || 'normal';
		const weight = extractProp(body, 'font-weight') || '400';
		const stretch = extractProp(body, 'font-stretch');
		const unicodeRange = extractProp(body, 'unicode-range');
		const srcRaw = extractProp(body, 'src');
		const urlMatch = srcRaw?.match(/url\((https:\/\/[^)]+\.woff2)\)/);
		if (!family || !urlMatch || !unicodeRange) {
			throw new Error(`Could not parse @font-face block for ${subset}`);
		}

		const famSlug = family.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		const weightSlug = weight.replace(/\s+/g, '-');
		let fileName = `${famSlug}-${style}-${weightSlug}-${subset}.woff2`;
		if (seenFiles.has(fileName)) {
			let n = 2;
			while (seenFiles.has(`${famSlug}-${style}-${weightSlug}-${subset}-${n}.woff2`)) n++;
			fileName = `${famSlug}-${style}-${weightSlug}-${subset}-${n}.woff2`;
		}
		seenFiles.add(fileName);

		const woffRes = await fetch(urlMatch[1], { headers: { 'User-Agent': UA } });
		if (!woffRes.ok) {
			throw new Error(`Failed to download ${urlMatch[1]}: ${woffRes.status}`);
		}
		const buf = Buffer.from(await woffRes.arrayBuffer());
		fs.writeFileSync(path.join(fontsDir, fileName), buf);

		const lines = [
			`/* ${subset} */`,
			'@font-face {',
			`\tfont-family: '${family}';`,
			`\tfont-style: ${style};`,
			`\tfont-weight: ${weight};`,
		];
		if (stretch) lines.push(`\tfont-stretch: ${stretch};`);
		lines.push('\tfont-display: swap;');
		lines.push(`\tsrc: url('../fonts/${fileName}') format('woff2');`);
		lines.push(`\tunicode-range: ${unicodeRange};`);
		lines.push('}');
		cssBlocks.push(lines.join('\n'));
	}

	// Remove orphaned sheet font woff2 files (preserving Font Awesome fa-*.woff2)
	for (const existing of fs.readdirSync(fontsDir)) {
		if (existing.endsWith('.woff2') && !existing.startsWith('fa-') && !seenFiles.has(existing)) {
			fs.unlinkSync(path.join(fontsDir, existing));
		}
	}

	fs.writeFileSync(cssOut, cssBlocks.join('\n\n') + '\n', 'utf8');
	console.log(`fetch-fonts: downloaded ${seenFiles.size} woff2 files and wrote css/fonts.css`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
