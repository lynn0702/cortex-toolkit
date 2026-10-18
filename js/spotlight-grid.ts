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

// Compute band widths [w1, w2, w3] from anchor set, declared widths, or defaults.
function computeBandWidths( items: SpotlightSectionItem[] ): [number, number, number] {
	if ( !items.length ) return [33.333, 33.333, 33.334];

	// 1. Anchor set widths
	const anchorCtk = getView( items[0]?.traitSet );
	if ( Array.isArray( anchorCtk?.widths ) && anchorCtk.widths.length === 3 ) {
		return [ Number( anchorCtk.widths[0] ), Number( anchorCtk.widths[1] ), Number( anchorCtk.widths[2] ) ];
	}

	// 2. Any set in band declares widths
	for ( const item of items ) {
		const ctk = getView( item.traitSet );
		if ( Array.isArray( ctk?.widths ) && ctk.widths.length === 3 ) {
			return [ Number( ctk.widths[0] ), Number( ctk.widths[1] ), Number( ctk.widths[2] ) ];
		}
	}

	// 3. Legacy colWidth declarations
	const declared: ( number | null )[] = [ null, null, null ];
	for ( const item of items ) {
		const ctk = getView( item.traitSet );
		const w = Number( ctk?.colWidth );
		if ( w >= 10 && w <= 90 ) {
			const tr = spotlightTrackForSet( item.traitSet );
			if ( declared[ tr - 1 ] === null ) {
				declared[ tr - 1 ] = Math.round( w );
			}
		}
	}

	// Determine if track 3 is present or active
	const hasTrack3 = items.some( item => spotlightTrackForSet( item.traitSet ) === 3 );
	const isLegacyTwoTrack = !hasTrack3 && declared[2] === null;

	if ( isLegacyTwoTrack ) {
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

// Bands a page's sets into full-width sections and column bands. A row break
// starts a fresh band so consecutive bands can carry different column shares.
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

	const finalizeSection = ( sec: SpotlightSection ) => {
		sec.widths = computeBandWidths( sec.ordered );
	};

	pageSets.forEach( item => {
		const ts = item.traitSet;
		const ctk = getView( ts ) || {};
		const span = spotlightSpanForSet( ts );
		const isFullWidth = ( span === 3 );

		if ( isFullWidth ) {
			if ( currentCols ) {
				finalizeSection( currentCols );
				sections.push( currentCols );
				currentCols = null;
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

		if ( !currentCols ) currentCols = newSection();
		else if ( ctk.rowBreak === true ) {
			finalizeSection( currentCols );
			sections.push( currentCols );
			currentCols = newSection();
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
