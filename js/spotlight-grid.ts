// spotlight-grid — pure grid geometry for the spotlight sheet layout.
// Extracted from character.js so the placement math is isolated and testable.
import type { Character, TraitSet } from './model.ts';
import { getView } from './model.ts';

// Track count is always 3 under the banded layout engine (Rule of 3).
export function columnsForPage( _character?: Character | null, _pageIndex?: number, _defaultColumnCount?: number ): number {
	return 3;
}

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

export interface SpotlightSectionItem {
	traitSet: TraitSet;
	index: number;
}

export interface SpotlightSection {
	type: 'columns' | 'full-width';
	trackCount: 3;
	widths: [number, number, number];
	ordered: SpotlightSectionItem[];
	itemsByColumn: Record<number | string, SpotlightSectionItem[]>;
}

export interface SpotlightCell {
	s: number;
	col: number;
	track: number;
	span: number;
	style?: string;
}

export interface SpotlightClusterGroup {
	isCluster: boolean;
	clusterId?: string;
	items: SpotlightSectionItem[];
}

export function spotlightTrackForSet( traitSet: TraitSet ): 1 | 2 | 3 {
	const ctk = getView( traitSet ) || {};
	if ( ctk.track === 1 || ctk.track === 2 || ctk.track === 3 ) return ctk.track;
	const loc = String( ctk.location || '' ).toLowerCase().trim();
	if ( loc === 'center' || loc === 'middle' || loc === '2' || loc === 'col-2' ) return 2;
	if ( loc === 'right' || loc === '3' || loc === 'col-3' ) return 3;
	return 1;
}

export function spotlightSpanForSet( traitSet: TraitSet ): 1 | 2 | 3 {
	const ctk = getView( traitSet ) || {};
	const raw = ctk.span ?? ctk.colSpan ?? ctk.columnSpan;
	if ( raw === 'full' || Number( raw ) >= 3 ) return 3;
	if ( Number( raw ) === 2 ) return 2;
	return 1;
}

// Compute band widths [w1, w2, w3] from per-set singular colWidth shares.
// Widths belong to the band, not to any one set: each member declares only
// its own share (e.g. Attributes 28, Distinctions 72); the band derives the
// columns. Triples on sets are no longer read (removed corpus-wide).
function computeBandWidths( items: SpotlightSectionItem[] ): [number, number, number] {
	if ( !items.length ) return [33.333, 33.333, 33.334];

	const declared: ( number | null )[] = [ null, null, null ];
	for ( const item of items ) {
		const ctk = getView( item.traitSet );
		const w = Number( ctk?.colWidth );
		if ( Number.isFinite( w ) && w > 0 && w <= 100 ) {
			const tr = spotlightTrackForSet( item.traitSet );
			if ( declared[ tr - 1 ] === null ) {
				declared[ tr - 1 ] = w;
			}
		}
	}

	// Determine if track 3 is present or active
	const hasTrack3 = items.some( item => spotlightTrackForSet( item.traitSet ) === 3 );
	const isTwoTrack = !hasTrack3 && declared[2] === null;

	if ( isTwoTrack ) {
		if ( declared[0] !== null ) return [ declared[0], 100 - declared[0], 0 ];
		if ( declared[1] !== null ) return [ 100 - declared[1], declared[1], 0 ];
		return [ 50, 50, 0 ];
	}

	// 3-track page
	const declaredCount = declared.filter( ( d ): d is number => d !== null ).length;
	if ( declaredCount > 0 ) {
		const sumDeclared = declared.reduce( ( a: number, b ) => a + ( b || 0 ), 0 );
		const remaining = Math.max( 0, 100 - sumDeclared );
		const emptyCount = 3 - declaredCount;
		const share = emptyCount > 0 ? Math.round( remaining / emptyCount * 100 ) / 100 : 0;
		return [
			declared[0] !== null ? declared[0] : share,
			declared[1] !== null ? declared[1] : share,
			declared[2] !== null ? declared[2] : share,
		];
	}

	return [ 33.333, 33.333, 33.334 ];
}

// Bands a page's sets into full-width sections and column bands. Bands are
// explicit rows: sets sharing a page and row number band together; a set
// without a row continues the previous set's band. Consecutive bands carry
// their own column shares.
export function spotlightRowForSet( traitSet: TraitSet ): number | null {
	const raw: unknown = getView( traitSet )?.row;
	if ( raw === undefined || raw === null || raw === '' ) return null;
	const n = Number( raw );
	if ( !Number.isFinite( n ) || n < 1 ) return null;
	return Math.floor( n );
}

export function getSpotlightSections( traitSets: TraitSet[], pageIndex: number ): SpotlightSection[] {
	const pageSets: SpotlightSectionItem[] = [];
	( traitSets || [] ).forEach( ( traitSet, s ) => {
		const page = getView( traitSet )?.page || 1;
		if ( page === pageIndex ) {
			pageSets.push( { traitSet, index: s } );
		}
	} );

	const newSection = (): SpotlightSection => ({
		type: 'columns',
		trackCount: 3,
		widths: [ 33.333, 33.333, 33.334 ],
		ordered: [],
		itemsByColumn: { 1: [], 2: [], 3: [] },
	});

	const sections: SpotlightSection[] = [];
	let currentCols: SpotlightSection | null = null;
	let currentRow: number | null = null;

	const finalizeSection = ( sec: SpotlightSection ) => {
		sec.widths = computeBandWidths( sec.ordered );
	};

	pageSets.forEach( item => {
		const ts = item.traitSet;
		const span = spotlightSpanForSet( ts );
		const isFullWidth = ( span === 3 );

		if ( isFullWidth ) {
			if ( currentCols ) {
				finalizeSection( currentCols );
				sections.push( currentCols );
				currentCols = null;
				currentRow = null;
			}
			sections.push({
				type: 'full-width',
				trackCount: 3,
				widths: [ 100, 0, 0 ],
				ordered: [ item ],
				itemsByColumn: {
					full: [ item ],
					1: [ item ],
				},
			});
			return;
		}

		const row = spotlightRowForSet( ts ) ?? currentRow ?? 1;
		if ( !currentCols || row !== currentRow ) {
			if ( currentCols ) {
				finalizeSection( currentCols );
				sections.push( currentCols );
			}
			currentCols = newSection();
			currentRow = row;
		}
		currentCols.ordered.push( item );
		const tr = spotlightTrackForSet( ts );
		currentCols.itemsByColumn[ tr ].push( item );
	} );

	if ( currentCols ) {
		finalizeSection( currentCols );
		sections.push( currentCols );
	}

	return sections;
}

// grid-template-columns value for a band section from its widths (percentages).
export function getSpotlightGridStyle( section: SpotlightSection ): string {
	const w = section.widths || [ 33.333, 33.333, 33.334 ];
	const p0 = Math.round( w[0] * 1000 ) / 1000;
	const p1 = Math.round( w[1] * 1000 ) / 1000;
	const p2 = Math.round( w[2] * 1000 ) / 1000;
	return `grid-template-columns: ${p0}% ${p1}% ${p2}%;`;
}

// Explicit grid placement for every set in a band section, in array order.
// Retired rowspan machinery per the banded layout model; rows are auto.
export function getSpotlightGridCells( section: SpotlightSection ): SpotlightCell[] {
	const cells: SpotlightCell[] = [];
	( section.ordered || [] ).forEach( entry => {
		const ts = entry.traitSet;
		const track = spotlightTrackForSet( ts );
		let span = spotlightSpanForSet( ts );
		if ( track + span - 1 > 3 ) span = ( 4 - track ) as 1 | 2 | 3;
		let st = `grid-column: ${track} / span ${span}; min-width: 0;`;
		if ( track > 1 ) st += ' margin-left: -2px;';
		cells.push({ s: entry.index, col: track, track, span, style: st });
	} );
	return cells;
}

export interface SpotlightCellGroup {
	isCluster: boolean;
	clusterId?: string;
	items: SpotlightSectionItem[];
	cells: SpotlightCell[];
}

// Section content as render groups: consecutive same-cluster sets share one
// cluster band; every other set is placed by its own grid cell (track/span),
// so spanning sets actually span. Cluster bands take the first member's cell.
export function getSpotlightCellGroups( section: SpotlightSection ): SpotlightCellGroup[] {
	const cells = getSpotlightGridCells( section );
	const byIndex = new Map<number, SpotlightCell>();
	cells.forEach( ( cell ) => byIndex.set( cell.s, cell ) );
	const groups: SpotlightCellGroup[] = [];
	let current: SpotlightCellGroup | null = null;
	( section.ordered || [] ).forEach( ( item ) => {
		const clusterId = getView( item.traitSet )?.cluster;
		const cell = byIndex.get( item.index );
		if ( !cell ) return;
		if ( clusterId && current && current.isCluster && current.clusterId === clusterId ) {
			current.items.push( item );
			current.cells.push( cell );
		} else {
			if ( current ) groups.push( current );
			current = clusterId
				? { isCluster: true, clusterId, items: [ item ], cells: [ cell ] }
				: { isCluster: false, items: [ item ], cells: [ cell ] };
		}
	} );
	if ( current ) groups.push( current );
	return groups;
}

// Simulate sparse grid auto-flow for one band: members in order claim
// tracks, stacking below on conflict. Returns the 0-based visual row per
// member. Same-track adjacency stacks (no split); overlapping spans push
// down. Mirrors what the renderer resolves from explicit row data.
export function simulateVisualRows( members: { track: number; span: number }[] ): number[] {
	const taken: Set<number>[] = [ new Set(), new Set(), new Set() ];
	const rows: number[] = [];
	for ( const m of members ) {
		const track = Math.max( 1, Math.min( 3, m.track || 1 ) );
		let span = Math.max( 1, Math.min( 3, m.span || 1 ) );
		if ( track + span - 1 > 3 ) span = 4 - track;
		let r = 0;
		for ( ;; r++ ) {
			let free = true;
			for ( let t = track; t < track + span; t++ ) {
				if ( taken[t - 1].has( r ) ) { free = false; break; }
			}
			if ( free ) break;
		}
		for ( let t = track; t < track + span; t++ ) taken[t - 1].add( r );
		rows.push( r );
	}
	return rows;
}

// Groups sibling sets within a column stack that share a cluster id into a cluster band.
export function getTrackClusterGroups( items: SpotlightSectionItem[] ): SpotlightClusterGroup[] {
	const groups: SpotlightClusterGroup[] = [];
	let currentCluster: SpotlightClusterGroup | null = null;

	( items || [] ).forEach( item => {
		const clusterId = getView( item.traitSet )?.cluster;
		if ( clusterId ) {
			if ( currentCluster && currentCluster.clusterId === clusterId ) {
				currentCluster.items.push( item );
			} else {
				if ( currentCluster ) groups.push( currentCluster );
				currentCluster = {
					isCluster: true,
					clusterId,
					items: [ item ],
				};
			}
		} else {
			if ( currentCluster ) {
				groups.push( currentCluster );
				currentCluster = null;
			}
			groups.push({
				isCluster: false,
				items: [ item ],
			});
		}
	} );

	if ( currentCluster ) groups.push( currentCluster );
	return groups;
}
