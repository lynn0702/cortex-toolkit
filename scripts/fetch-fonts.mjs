#!/usr/bin/env node
/**
 * Fetches and subsets the default sheet fonts (Josefin Sans, Open Sans,
 * Alegreya Sans SC) into fonts/*.woff2 (latin + latin-ext) and writes css/fonts.css.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const fontsDir = path.join(root, 'fonts');
const cssOut = path.join(root, 'css', 'fonts.css');

const CSS_URL =
	'https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,400..700;1,400..700&family=Open+Sans:ital,wght@0,400..800;1,400..700&family=Alegreya+Sans+SC:wght@400;500;700;800;900&display=swap';
const UA =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const KEEP_SUBSETS = new Set(['latin', 'latin-ext']);

function extractProp(body, prop) {
	const m = body.match(new RegExp(`${prop}\\s*:\\s*([^;]+);`));
	return m ? m[1].trim() : null;
}

async function main() {
	fs.mkdirSync(fontsDir, { recursive: true });
	const res = await fetch(CSS_URL, { headers: { 'User-Agent': UA } });
	if (!res.ok) {
		throw new Error(`Google Fonts CSS request failed: ${res.status} ${res.statusText}`);
	}
	const cssText = await res.text();
	const blocks = [...cssText.matchAll(/\/\*\s*([^*]+?)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)];
	const selected = blocks.filter((b) => KEEP_SUBSETS.has(b[1].trim()));
	if (!selected.length) {
		throw new Error('No latin / latin-ext @font-face blocks found in Google Fonts response.');
	}

	const cssBlocks = ['/* Self-hosted default sheet fonts (latin + latin-ext) */'];
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

	fs.writeFileSync(cssOut, cssBlocks.join('\n\n') + '\n', 'utf8');
	console.log(`fetch-fonts: downloaded ${seenFiles.size} woff2 files and wrote css/fonts.css`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
