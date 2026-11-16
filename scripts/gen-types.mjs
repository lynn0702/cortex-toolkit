/**
 * Generate TypeScript model types from the JSON schemas.
 *
 * The schemas in `schema/0.2/` are the source of truth for the curiosity and
 * sheet-template shapes. `js/model.generated.ts` is the raw projection of those
 * schemas; `js/model.ts` re-exports it and adds the app-only `view` layer (which the schema deliberately leaves open).
 *
 * Run via `npm run types` (also chained into `npm run build`).
 */
import { compile } from 'json-schema-to-typescript';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const BASE_OPTIONS = {
	bannerComment: '',
	additionalProperties: false,
	declareExternallyReferenced: true,
	cwd: path.join(root, 'schema/0.2'),
};

async function generate(relPath, typeName) {
	const schema = JSON.parse(readFileSync(path.join(root, relPath), 'utf8'));
	// Use a stable root type name regardless of the schema's human-readable title.
	schema.title = typeName;
	return compile(schema, typeName, BASE_OPTIONS);
}

const curiosity = await generate('schema/0.2/curiosity.schema.json', 'Curiosity');
const sheetTemplate = await generate('schema/0.2/sheet-template.schema.json', 'SheetTemplate');

const banner =
	'/* eslint-disable */\n' +
	'/* AUTO-GENERATED from schema/0.2/*.schema.json by scripts/gen-types.mjs. Do not edit — run `npm run types`. */\n\n';

const outPath = path.join(root, 'js/model.generated.ts');
const nextContent = banner + curiosity + '\nexport type Character = Curiosity;\n\n' + sheetTemplate + '\n';
const prevContent = existsSync(outPath) ? readFileSync(outPath, 'utf8') : null;

if (prevContent !== nextContent) {
	writeFileSync(outPath, nextContent);
	console.log('gen-types: wrote js/model.generated.ts');
} else {
	console.log('gen-types: js/model.generated.ts up to date');
}
