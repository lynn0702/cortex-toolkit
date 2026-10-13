/**
 * Generate TypeScript model types from the JSON schemas.
 *
 * The schemas in `schema/0.1/` are the source of truth for the character and
 * sheet-template shapes. `js/model.generated.ts` is the raw projection of those
 * schemas; `js/model.ts` re-exports it and adds the app-only `custom.cortexToolkit`
 * layer (which the schema deliberately leaves open).
 *
 * Run via `npm run types` (also chained into `npm run build`).
 */
import { compile } from 'json-schema-to-typescript';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );

const BASE_OPTIONS = {
	bannerComment: '',
	additionalProperties: false,
	declareExternallyReferenced: true,
	cwd: path.join( root, 'schema/0.1' ),
};

async function generate( relPath, typeName ) {
	const schema = JSON.parse( readFileSync( path.join( root, relPath ), 'utf8' ) );
	// Use a stable root type name regardless of the schema's human-readable title.
	schema.title = typeName;
	return compile( schema, typeName, BASE_OPTIONS );
}

const character = await generate( 'schema/0.1/character.schema.json', 'Character' );
const sheetTemplate = await generate( 'schema/0.1/sheet-template.schema.json', 'SheetTemplate' );

const banner =
	'/* eslint-disable */\n' +
	'/* AUTO-GENERATED from schema/0.1/*.schema.json by scripts/gen-types.mjs. Do not edit — run `npm run types`. */\n\n';

writeFileSync( path.join( root, 'js/model.generated.ts' ), banner + character + '\n' + sheetTemplate + '\n' );
console.log( 'gen-types: wrote js/model.generated.ts' );
