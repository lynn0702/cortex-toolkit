// spotlight-grid — pure grid geometry for the spotlight sheet layout.
// Extracted from character.js so the placement math is isolated and testable.
import type { Character, TraitSet } from './model.ts';

export function columnsForPage( character: Character | null | undefined, pageIndex: number, defaultColumnCount: number ): number {
	if ( Number( pageIndex ) === 2 ) {
		const override = Number( character?.custom?.cortexToolkit?.columnsPage2 );
		if ( override === 2 || override === 3 ) return override;
	}
	return defaultColumnCount;
}

// Classic flow has left/right tracks only; 'center' (and anything
// unexpected) folds left so no set ever vanishes. Full-width sets
// are handled separately by isFullWidthClassic.
export function getTraitSetColumn( traitSet: TraitSet ): 'left' | 'right' {
	if ( traitSet?.custom?.cortexToolkit?.location === 'right' ) {
		return 'right';
	}
	return 'left';
}

export function isFullWidthClassic( traitSet: TraitSet ): boolean {
	const ctk = traitSet?.custom?.cortexToolkit;
	const span = ctk?.colSpan ?? ctk?.columnSpan;
	return span === 'full' || Number( span ) >= 2;
}

export function hasClassicFullSets( traitSets: TraitSet[], haloTraitID: number, pageIndex: number ): boolean {
	return ( traitSets || [] ).some( ( traitSet, s ) =>
		s !== haloTraitID &&
		( ( traitSet.custom?.cortexToolkit?.page || 1 ) === pageIndex ) &&
		isFullWidthClassic( traitSet )
	);
}

export interface SpotlightSectionItem {
	traitSet: TraitSet;
	index: number;
}

export interface SpotlightSection {
	type: 'columns' | 'full-width';
	trackCount: number;
	ordered: SpotlightSectionItem[];
	itemsByColumn: Record<string, SpotlightSectionItem[]>;
}

export interface SpotlightCell {
	s: number;
	row: number;
	col: number;
	span: number;
	rowspan: number;
	explicitRs: boolean;
	style?: string;
}

// Bands a page's sets into full-width rows and column sections. A row break
// starts a fresh band so consecutive bands can carry different column shares.
export function getSpotlightSections( traitSets: TraitSet[], pageIndex: number, maxCols: number ): SpotlightSection[] {
	const pageSets: SpotlightSectionItem[] = [];
	( traitSets || [] ).forEach( ( traitSet, s ) => {
		const page = traitSet.custom?.cortexToolkit?.page || 1;
		if ( page === pageIndex ) {
			pageSets.push( { traitSet, index: s } );
		}
	} );

	const newSection = (): SpotlightSection => ({
		type: 'columns',
		trackCount: maxCols,
		ordered: [],
		itemsByColumn: maxCols === 3 ? { left: [], center: [], right: [] } : { left: [], right: [] }
	});

	const columnKeyFor = ( loc: string | number | null | undefined ): string => {
		if ( maxCols === 3 ) {
			if ( loc === 'center' || loc === 'middle' || loc === 2 ) return 'center';
			if ( loc === 'right' || loc === 3 ) return 'right';
			return 'left';
		}
		return ( loc === 'right' || loc === 2 ) ? 'right' : 'left';
	};

	const sections: SpotlightSection[] = [];
	let currentCols: SpotlightSection | null = null;

	pageSets.forEach( item => {
		const ctk = item.traitSet?.custom?.cortexToolkit || {};
		const rawSpan = ctk.colSpan ?? ctk.columnSpan;
		const isFullWidth = ( rawSpan === 'full' || Number( rawSpan ) >= maxCols );

		if ( isFullWidth ) {
			if ( currentCols ) {
				sections.push( currentCols );
				currentCols = null;
			}
			sections.push({
				type: 'full-width',
				trackCount: maxCols,
				ordered: [ item ],
				itemsByColumn: {
					full: [ item ]
				}
			});
			return;
		}

		if ( !currentCols ) currentCols = newSection();
		else if ( ctk.rowBreak === true ) {
			sections.push( currentCols );
			currentCols = newSection();
		}
		currentCols.ordered.push( item );
		currentCols.itemsByColumn[ columnKeyFor( ctk.location ) ].push( item );
	} );

	if ( currentCols ) {
		sections.push( currentCols );
	}

	return sections;
}

// 1-based grid track for a set location within trackCount tracks.
function spotlightTrackForLocation( location: string | number | null | undefined, trackCount: number ): number {
	if ( trackCount === 3 ) {
		if ( location === 'center' || location === 'middle' || location === 2 ) return 2;
		if ( location === 'right' || location === 3 ) return 3;
		return 1;
	}
	return ( location === 'right' || location === 2 ) ? 2 : 1;
}

// Grid column span for a set: full width, 2-of-3, or a single track.
function spotlightSpanForSet( traitSet: TraitSet, trackCount: number ): number {
	const raw = traitSet?.custom?.cortexToolkit?.colSpan ?? traitSet?.custom?.cortexToolkit?.columnSpan;
	if ( raw === 'full' || Number( raw ) >= trackCount ) return trackCount;
	if ( trackCount === 3 && Number( raw ) === 2 ) return 2;
	return 1;
}

// Explicit width share (10-90) for a grid track: first value found in array
// order among single-track sets placed in that track. Returns 0 for equal share.
function spotlightTrackWidth( section: SpotlightSection, track: number ): number {
	const n = section.trackCount || 2;
	for ( const entry of ( section.ordered || [] ) ) {
		const ts = entry.traitSet;
		if ( spotlightSpanForSet( ts, n ) !== 1 ) continue;
		if ( spotlightTrackForLocation( ts?.custom?.cortexToolkit?.location, n ) !== track ) continue;
		const w = Number( ts?.custom?.cortexToolkit?.colWidth );
		if ( w >= 10 && w <= 90 ) return Math.round( w );
	}
	return 0;
}

// grid-template-columns value for a band section, e.g. "25fr 50fr 25fr".
export function getSpotlightGridStyle( section: SpotlightSection ): string {
	const n = section.trackCount || 2;
	const grows: number[] = [];
	for ( let t = 1; t <= n; t++ ) grows.push( spotlightTrackWidth( section, t ) );
	if ( !grows.some( g => g > 0 ) ) return '';
	const explicit = grows.reduce( (a, g) => a + ( g > 0 ? g : 0 ), 0 );
	const autoIdx = grows.map( (g, i) => g > 0 ? -1 : i ).filter( i => i >= 0 );
	let final = grows;
	if ( autoIdx.length ) {
		const rest = 100 - explicit;
		if ( rest < autoIdx.length * 5 ) return ''; // Over-constrained: equal shares.
		final = grows.map( g => g > 0 ? g : Math.round( rest / autoIdx.length * 100 ) / 100 );
	}
	return `grid-template-columns: ${final.map( g => `minmax(0, ${g}fr)` ).join( ' ' )};`;
}

// Explicit grid placement for every set in a band section, in array order.
export function getSpotlightGridCells( section: SpotlightSection ): SpotlightCell[] {
	const n = section.trackCount || 2;
	const cursors: Record<number, number> = {};
	for ( let t = 1; t <= n; t++ ) cursors[t] = 1;
	const cells: SpotlightCell[] = [];
	( section.ordered || [] ).forEach( entry => {
		const ts = entry.traitSet;
		let span = spotlightSpanForSet( ts, n );
		if ( span > n ) span = n;
		const home = spotlightTrackForLocation( ts?.custom?.cortexToolkit?.location, n );
		let tracks: number[];
		if ( span >= n ) tracks = Array.from( { length: n }, (_, i) => i + 1 );
		else if ( span === 2 ) tracks = ( home >= n ) ? [n - 1, n] : [home, home + 1];
		else tracks = [home];
		let row = 0;
		tracks.forEach( t => { row = Math.max( row, cursors[t] ); } );
		const rsRaw = Number( ts?.custom?.cortexToolkit?.rowSpan );
		const rowspan = ( rsRaw >= 2 && rsRaw <= 12 ) ? Math.floor( rsRaw ) : 1;
		tracks.forEach( t => { cursors[t] = row + rowspan; } );
		cells.push({ s: entry.index, row, col: tracks[0], span: tracks.length, rowspan, explicitRs: rowspan > 1 });
	} );
	const maxRow = cells.reduce( (a, c) => Math.max( a, c.row + c.rowspan - 1 ), 1 );
	if ( maxRow > 1 ) {
		const perTrack: Record<number, SpotlightCell[]> = {};
		cells.forEach( c => {
			for ( let t = c.col; t < c.col + c.span; t++ ) {
				( perTrack[t] = perTrack[t] || [] ).push( c );
			}
		} );
		Object.keys( perTrack ).forEach( t => {
			const arr = perTrack[ Number( t ) ];
			if ( arr.length === 1 && arr[0].rowspan === 1 ) {
				arr[0].rowspan = maxRow - arr[0].row + 1;
			}
		} );
	}
	cells.forEach( c => {
		let st = `grid-row: ${c.row} / span ${c.rowspan}; grid-column: ${c.col} / span ${c.span}; min-width: 0;`;
		if ( c.row > 1 ) st += ' margin-top: -2px;';
		if ( c.col > 1 ) st += ' margin-left: -2px;';
		c.style = st;
	} );
	return cells;
}
