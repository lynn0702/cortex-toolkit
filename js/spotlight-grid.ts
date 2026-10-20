// spotlight-grid — nested-grid geometry with explicit coordinates.
//
// Layout is a grid at every level (page, set, trait) with placement local
// to the parent (2026-10-19, supersedes the band model). A set carries
// view.place {left, top, width, height}: left/width are percent of the
// parent width ("%"), top/height are relative row units, height is a floor
// (rows stay content-sized, nothing clips). place is sparse: omitted for a
// full-width set stacked in document order. Inside a set, view.parts places
// trait parts (name, rating, description, sfx, subtraits, stressLabel,
// stress) as cells in the trait's grid, percent of the set.
import type { Character, TraitSet } from './model.ts';
import { getView } from './model.ts';

// Classic flow has left/right tracks only; 'center' (and anything
// unexpected) folds left so no set ever vanishes.
export function getTraitSetColumn( traitSet: TraitSet ): 'left' | 'right' {
	const ctk = getView( traitSet );
	if ( ctk?.track === 2 || ctk?.track === 3 || ctk?.location === 'right' ) {
		return 'right';
	}
	return 'left';
}

export function isFullWidthClassic( traitSet: TraitSet ): boolean {
	const ctk = getView( traitSet );
	const span = ctk?.span ?? ctk?.colSpan ?? ctk?.columnSpan;
	return span === 'full' || Number( span ) >= 2;
}

export function hasClassicFullSets( traitSets: TraitSet[], ringTraitID: number, pageIndex: number ): boolean {
	return ( traitSets || [] ).some( ( traitSet, s ) =>
		s !== ringTraitID &&
		( ( getView( traitSet )?.page || 1 ) === pageIndex ) &&
		isFullWidthClassic( traitSet )
	);
}

// ---------- place primitives ----------

// Known trait-part names. Anything else in view.parts is an error.
export const KNOWN_PARTS = [ 'name', 'rating', 'description', 'sfx', 'subtraits', 'stressLabel', 'stress' ] as const;
export type PartName = ( typeof KNOWN_PARTS )[ number ];

// Parse a percent-of-parent value: "%" strings ("25%", decimals allowed)
// or a bare number (import-time form, normalized to "%" on the way in).
export function parsePct( value: unknown ): number | null {
	if ( typeof value === 'number' ) {
		return Number.isFinite( value ) ? value : null;
	}
	if ( typeof value === 'string' ) {
		const m = value.trim().match( /^(-?\d+(?:\.\d+)?)\s*%$/ );
		if ( !m ) return null;
		const n = Number( m[1] );
		return Number.isFinite( n ) ? n : null;
	}
	return null;
}

// Emit the canonical stored form: a "%" string, up to 3 decimals.
export function formatPct( n: number ): string {
	const r = Math.round( n * 1000 ) / 1000;
	return String( r ) + '%';
}

export interface ParsedPlace {
	left: number;
	top: number;
	width: number;
	height: number;
}

// The parsed view.place, or null when absent (sparse full-width stacking)
// or malformed (validation reports it; the renderer stacks it).
export function placeOf( traitSet: TraitSet ): ParsedPlace | null {
	const raw = getView( traitSet )?.place as unknown as Record<string, unknown> | undefined;
	if ( !raw || typeof raw !== 'object' || Array.isArray( raw ) ) return null;
	const left = parsePct( raw.left );
	const width = parsePct( raw.width );
	const top = raw.top;
	const height = raw.height;
	if ( left === null || width === null ) return null;
	if ( !Number.isInteger( top ) || ( top as number ) < 0 ) return null;
	if ( !Number.isInteger( height ) || ( height as number ) < 1 ) return null;
	if ( width <= 0 || left < 0 || left + width > 100 + 1e-6 ) return null;
	return { left, top: top as number, width, height: height as number };
}

// Normalize import-time forms in place: bare-number left/width become "%"
// strings. Returns true when the bag was rewritten. Stored files always
// carry the unit; a bare number at rest is a validation error, not valid.
export function normalizePlace( traitSet: unknown ): boolean {
	const bag = getView( traitSet ) as Record<string, unknown> | undefined;
	const raw = bag?.place as Record<string, unknown> | undefined;
	if ( !raw || typeof raw !== 'object' || Array.isArray( raw ) ) return false;
	let changed = false;
	for ( const k of [ 'left', 'width' ] ) {
		if ( typeof raw[ k ] === 'number' && Number.isFinite( raw[ k ] as number ) ) {
			raw[ k ] = formatPct( raw[ k ] as number );
			changed = true;
		}
	}
	return changed;
}

function round3( n: number ): number {
	return Math.round( n * 1000 ) / 1000;
}

// Column intervals (%) from the union of left / left+width edges across a
// set of rects, anchored at 0 and 100 so leading/trailing gaps survive as
// their own intervals and every cell renders its exact rectangle.
export function columnsFromEdges( rects: { left: number; width: number }[] ): number[] {
	const edges = new Set<number>( [ 0, 100 ] );
	rects.forEach( ( r ) => {
		edges.add( round3( r.left ) );
		edges.add( round3( r.left + r.width ) );
	} );
	const sorted = [ ...edges ].sort( ( a, b ) => a - b );
	if ( sorted.length < 2 ) return [ 100 ];
	const cols: number[] = [];
	for ( let i = 0; i + 1 < sorted.length; i++ ) {
		const w = round3( sorted[ i + 1 ] - sorted[ i ] );
		if ( w > 0 ) cols.push( w );
	}
	return cols.length ? cols : [ 100 ];
}

// Grid lines (1-based) for a rect within page-union columns.
export function linesForRect( columns: number[], left: number, width: number ): { col: number; span: number } {
	let acc = 0;
	let col = 1;
	let span = columns.length;
	for ( let i = 0; i < columns.length; i++ ) {
		if ( Math.abs( acc - left ) < 1e-6 ) col = i + 1;
		acc = round3( acc + columns[ i ] );
		if ( Math.abs( acc - ( left + width ) ) < 1e-6 ) {
			span = ( i + 1 ) - col + 1;
			break;
		}
	}
	return { col, span: Math.max( 1, span ) };
}

export interface SpotlightSectionItem {
	traitSet: TraitSet;
	index: number;
}

export interface SpotlightCell {
	s: number;
	col: number;
	span: number;
	rowSpan: number;
	style?: string;
}

export interface SpotlightSection {
	type: 'grid' | 'full-width';
	columns: number[];
	ordered: SpotlightSectionItem[];
	cells: Record<number, SpotlightCell>;
}

// Page layout: placed sets group by top across document distance (the old
// band join); groups order by first-seen document position, interleaved
// with one full-width group per unplaced set (sparse stacking in document
// order). Adjacent placed groups merge into one grid whose rows come from
// the distinct top / top+height edges (auto-sized), so a tall cell runs
// the full height; unplaced sets stay full-width blocks between grids.
// Columns come from the page-union edges, so every cell renders its exact
// rectangle and vertical edges align across rows. Height is a floor via
// grid-row span plus min-height; rows stay content-sized.
export function getSpotlightSections( traitSets: TraitSet[], pageIndex: number ): SpotlightSection[] {
	const pageSets: SpotlightSectionItem[] = [];
	( traitSets || [] ).forEach( ( traitSet, s ) => {
		const page = getView( traitSet )?.page || 1;
		if ( page === pageIndex ) {
			pageSets.push( { traitSet, index: s } );
		}
	} );

	const placed = pageSets
		.map( ( item ) => ( { item, place: placeOf( item.traitSet ) } ) )
		.filter( ( e ) => e.place !== null ) as { item: SpotlightSectionItem; place: ParsedPlace }[];
	const columns = columnsFromEdges( placed.map( ( e ) => e.place ) );

	// Sequence slots in document order: each top's group (first-seen) and
	// each unplaced set take one slot; adjacent placed slots merge.
	const order: ({ kind: 'top'; top: number } | { kind: 'single'; index: number })[] = [];
	const seenTops = new Set<number>();
	pageSets.forEach( ( item ) => {
		const place = placeOf( item.traitSet );
		if ( !place ) {
			order.push( { kind: 'single', index: item.index } );
			return;
		}
		if ( !seenTops.has( place.top ) ) {
			seenTops.add( place.top );
			order.push( { kind: 'top', top: place.top } );
		}
	} );

	const byIndex = new Map<number, { item: SpotlightSectionItem; place: ParsedPlace }>();
	placed.forEach( ( e ) => byIndex.set( e.item.index, e ) );
	const bySetIndex = new Map<number, SpotlightSectionItem>();
	pageSets.forEach( ( item ) => bySetIndex.set( item.index, item ) );

	const cellFor = ( entry: { item: SpotlightSectionItem; place: ParsedPlace }, lines: number[] ): SpotlightCell => {
		const { col, span } = linesForRect( columns, entry.place.left, entry.place.width );
		const start = lineFor( lines, entry.place.top );
		const end = lineFor( lines, entry.place.top + entry.place.height );
		let st = `grid-column: ${col} / span ${span}; grid-row: ${start} / ${end}; min-width: 0;`;
		if ( entry.place.height > 1 ) {
			st += ` min-height: calc(( ${entry.place.height} - 1 ) * var(--place-row-unit, 3rem));`;
		}
		return { s: entry.item.index, col, span, rowSpan: entry.place.height, style: st };
	};

	const sections: SpotlightSection[] = [];
	let pending: { item: SpotlightSectionItem; place: ParsedPlace }[] = [];
	const flushGrid = () => {
		if ( !pending.length ) return;
		// Rows from the distinct top / top+height edges, auto-sized.
		const edgeSet = new Set<number>();
		pending.forEach( ( e ) => {
			edgeSet.add( round3( e.place.top ) );
			edgeSet.add( round3( e.place.top + e.place.height ) );
		} );
		const lines = [ ...edgeSet ].sort( ( a, b ) => a - b );
		const ordered: SpotlightSectionItem[] = [];
		const cells: Record<number, SpotlightCell> = {};
		pending.forEach( ( e ) => {
			ordered.push( e.item );
			cells[ e.item.index ] = cellFor( e, lines );
		} );
		sections.push( { type: 'grid', columns, ordered, cells } );
		pending = [];
	};

	order.forEach( ( slot ) => {
		if ( slot.kind === 'single' ) {
			flushGrid();
			const item = bySetIndex.get( slot.index )!;
			sections.push( { type: 'full-width', columns: [ 100 ], ordered: [ item ], cells: {} } );
			return;
		}
		pageSets.forEach( ( item ) => {
			const e = byIndex.get( item.index );
			if ( e && e.place.top === slot.top ) pending.push( e );
		} );
	} );
	flushGrid();

	return sections;
}

function lineFor( lines: number[], edge: number ): number {
	for ( let i = 0; i < lines.length; i++ ) {
		if ( Math.abs( lines[ i ] - edge ) < 1e-6 ) return i + 1;
	}
	return lines.length + 1;
}

// grid-template-columns value for a section from its column intervals.
export function getSpotlightGridStyle( section: SpotlightSection ): string {
	const cols = section.columns && section.columns.length ? section.columns : [ 100 ];
	return 'grid-template-columns: ' + cols.map( ( c ) => `${round3( c )}%` ).join( ' ' ) + ';';
}

export function getSpotlightGridCells( section: SpotlightSection ): SpotlightCell[] {
	return ( section.ordered || [] )
		.map( ( entry ) => section.cells[ entry.index ] )
		.filter( Boolean );
}

// Overlapping (page, top) rectangles: strict 2D overlap (shared edges are
// fine, gaps are legal). Returns pairs of trait-set indices.
export function findPlaceOverlaps( entries: { index: number; place: ParsedPlace }[] ): [number, number][] {
	const out: [number, number][] = [];
	for ( let i = 0; i < entries.length; i++ ) {
		for ( let j = i + 1; j < entries.length; j++ ) {
			const a = entries[ i ].place;
			const b = entries[ j ].place;
			const h = a.left < b.left + b.width - 1e-6 && b.left < a.left + a.width - 1e-6;
			const v = a.top < b.top + b.height && b.top < a.top + a.height;
			if ( h && v ) out.push( [ entries[ i ].index, entries[ j ].index ] );
		}
	}
	return out;
}

// ---------- trait parts ----------

export interface PartsSpec {
	rating: 'inline' | 'above' | 'below' | 'none';
	ratingDice: number;
	stressDice: number; // 0 when no attached stress
	description: boolean; // effective: feature on, not a statement set, rating not above (above carries desc in its asset box)
	sfx: boolean;
	subtraits: boolean;
}

// Compose a set's trait-part layout per the additive rules: base trait is
// the name cell; rating inline adds a column, below/above add a row, none
// adds nothing; attached stress inline appends label + track columns in
// row 0, otherwise stacked full-width rows below; description and SFX are
// full-width cells in rows below, in that order. Widths are calibrated to
// the current rendering (5-die track ≈ 30%: rating 6% per die, stress
// label 13%, stress 5.4% per die, name takes the remainder).
export function buildParts( spec: PartsSpec ): Record<string, { left: string; top: number; width: string; height: number }> {
	const ratingW = Math.round( 6 * Math.max( 1, Math.round( spec.ratingDice ) ) * 10 ) / 10;
	const hasStress = spec.stressDice > 0;
	const stressW = hasStress ? Math.round( 5.4 * Math.max( 1, Math.round( spec.stressDice ) ) * 10 ) / 10 : 0;
	const labelW = hasStress ? 13 : 0;
	const parts: Record<string, { left: string; top: number; width: string; height: number }> = {};
	let row = 0;

	if ( spec.rating === 'inline' ) {
		const nameW = Math.round( ( 100 - ratingW - labelW - stressW ) * 10 ) / 10;
		let cursor = 0;
		parts.name = { left: formatPct( cursor ), top: 0, width: formatPct( nameW ), height: 1 };
		cursor = Math.round( ( cursor + nameW ) * 10 ) / 10;
		parts.rating = { left: formatPct( cursor ), top: 0, width: formatPct( ratingW ), height: 1 };
		cursor = Math.round( ( cursor + ratingW ) * 10 ) / 10;
		if ( hasStress ) {
			parts.stressLabel = { left: formatPct( cursor ), top: 0, width: formatPct( labelW ), height: 1 };
			cursor = Math.round( ( cursor + labelW ) * 10 ) / 10;
			// Last cell absorbs rounding drift so the row sums to 100.
			parts.stress = { left: formatPct( cursor ), top: 0, width: formatPct( Math.round( ( 100 - cursor ) * 10 ) / 10 ), height: 1 };
		}
		row = 1;
	} else if ( spec.rating === 'above' ) {
		parts.rating = { left: '0%', top: 0, width: '100%', height: 1 };
		parts.name = { left: '0%', top: 1, width: '100%', height: 1 };
		row = 2;
	} else if ( spec.rating === 'below' ) {
		parts.name = { left: '0%', top: 0, width: '100%', height: 1 };
		parts.rating = { left: '0%', top: 1, width: '100%', height: 1 };
		row = 2;
	} else {
		parts.name = { left: '0%', top: 0, width: '100%', height: 1 };
		row = 1;
	}

	if ( hasStress && spec.rating !== 'inline' ) {
		parts.stressLabel = { left: '0%', top: row, width: '100%', height: 1 };
		parts.stress = { left: '0%', top: row + 1, width: '100%', height: 1 };
		row += 2;
	}
	if ( spec.description ) {
		parts.description = { left: '0%', top: row, width: '100%', height: 1 };
		row += 1;
	}
	if ( spec.sfx ) {
		parts.sfx = { left: '0%', top: row, width: '100%', height: 1 };
		row += 1;
	}
	if ( spec.subtraits ) {
		parts.subtraits = { left: '0%', top: row, width: '100%', height: 1 };
		row += 1;
	}
	return parts;
}

export interface PartGridCell {
	col: number;
	span: number;
	row: number;
	rowSpan: number;
}

// Trait-grid lines for a parts map: columns from the union of part edges,
// rows from top/height (1-based line = top + 1).
export function partsGrid( parts: Record<string, { left: string; top: number; width: string; height: number }> ): { columns: number[]; cells: Record<string, PartGridCell> } {
	const rects: { name: string; left: number; width: number; top: number; height: number }[] = [];
	for ( const name of Object.keys( parts || {} ) ) {
		const cell = parts[ name ];
		if ( !cell || typeof cell !== 'object' ) continue;
		const left = parsePct( cell.left );
		const width = parsePct( cell.width );
		if ( left === null || width === null ) continue;
		rects.push( { name, left, width, top: cell.top, height: cell.height } );
	}
	const columns = columnsFromEdges( rects );
	const cells: Record<string, PartGridCell> = {};
	rects.forEach( ( r ) => {
		const { col, span } = linesForRect( columns, r.left, r.width );
		cells[ r.name ] = { col, span, row: r.top + 1, rowSpan: Math.max( 1, r.height ) };
	} );
	return { columns, cells };
}
