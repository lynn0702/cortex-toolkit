<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import { getView, ensureView } from './model.ts';
import { getSpotlightSections, parsePct, formatPct, getTraitSetColumn, isFullWidthClassic } from './spotlight-grid.ts';
import TraitSetMini from './trait-set-mini.vue';

// Page-level arrangement: every set on every page as a draggable box on
// the page grid (the layout engine section walk: grid groups in document
// order, unplaced sets as stacked bands). Dragging moves the box; across
// minis it changes page too, reordering the sets so the drop slot reads
// true on the sheet (vertical position is document order; tops group).
// Click selects; the readout beneath edits the selection. Right and
// bottom edges resize in place. The model commits once, on release.
const props = defineProps<{
	character: any;
}>();

const emit = defineEmits<{
	( e: 'updateCharacter', character: any ): void;
	( e: 'openSet', index: number ): void;
}>();

const ROW_H = 20;

const pageCount = computed( () => {
	const n = Number( getView( props.character )?.pageCount ) || 1;
	return Math.max( 1, Math.min( 3, n ) );
} );

const selected = ref<number | null>( null );
const editingSetIndex = ref<number | null>( null );

interface Block {
	kind: 'box' | 'band';
	index: number;
	name: string;
	left: number;
	width: number;
	top: number;
	height: number;
	base: number;
	set: any;
}

function layoutFor( page: number, setsInput?: any[] ): { blocks: Block[]; rows: number } {
	const sets = setsInput ?? props.character?.traitSets ?? [];
	const isClassic = getView( props.character )?.style?.sheet === 'classic';
	const sections = getSpotlightSections( sets as any, page );
	const out: Block[] = [];
	let cursor = 0;
	const labelOf = ( i: number ) => {
		const s = ( sets as any[] )[ i ] as any;
		return s?.name || ( '#' + ( i + 1 ) );
	};
	for ( const section of sections ) {
		if ( section.type !== 'grid' ) {
			for ( const item of section.ordered || [] ) {
				const sObj = ( sets as any[] )[ item.index ];
				let left = 0;
				let width = 100;
				if ( isClassic ) {
					const isFull = isFullWidthClassic( sObj );
					if ( !isFull ) {
						const col = getTraitSetColumn( sObj );
						if ( col === 'left' ) {
							left = 0;
							width = 50;
						} else {
							left = 50;
							width = 50;
						}
					}
				}
				out.push( { kind: 'band', index: item.index, name: labelOf( item.index ), left, width, top: cursor, height: 1, base: -1, set: sObj } );
				cursor += 1;
			}
			continue;
		}
		let minTop = Infinity;
		let maxBottom = -Infinity;
		const members: { index: number; left: number; width: number; top: number; height: number }[] = [];
		for ( const item of section.ordered || [] ) {
			const set = ( sets as any[] )[ item.index ];
			const p = getView( set )?.place as any;
			const left = p ? Number( String( p.left ).replace( '%', '' ) ) : 0;
			const width = p ? Number( String( p.width ).replace( '%', '' ) ) : 100;
			const top = p && Number.isInteger( p.top ) && p.top >= 0 ? p.top : 0;
			const height = p && Number.isInteger( p.height ) && p.height >= 1 ? p.height : 1;
			if ( !Number.isFinite( left ) || !Number.isFinite( width ) ) continue;
			members.push( { index: item.index, left, width, top, height } );
			minTop = Math.min( minTop, top );
			maxBottom = Math.max( maxBottom, top + height );
		}
		if ( !members.length ) continue;
		if ( !Number.isFinite( minTop ) ) minTop = 0;
		for ( const m of members ) {
			out.push( { kind: 'box', index: m.index, name: labelOf( m.index ), left: m.left, width: m.width, top: cursor + ( m.top - minTop ), height: m.height, base: minTop, set: ( sets as any[] )[ m.index ] } );
		}
		cursor += Math.max( 1, maxBottom - minTop );
	}
	return { blocks: out, rows: Math.max( 2, cursor + 1 ) };
}

const pages = computed( () => {
	const out: { page: number; blocks: Block[]; rows: number }[] = [];
	for ( let p = 1; p <= pageCount.value; p++ ) {
		out.push( { page: p, ...layoutFor( p ) } );
	}
	return out;
} );

// Live drag state. The origin box stays dimmed at base; a ghost follows
// the pointer and an insertion line marks the drop row. Readouts track
// the mapped values; the model commits once, on release.
interface DragState {
	index: number;
	setObj: any;
	mode: 'move' | 'w' | 'h';
	base: { left: number; width: number; top: number; height: number };
	page: number;
	left: number;
	width: number;
	top: number;
	height: number;
	overPage: number;
	overRow: number;
	cx: number;
	cy: number;
}
const drag = ref<DragState | null>( null );

function setNameOf( index: number ) {
	const sets = props.character?.traitSets || [];
	return ( sets[ index ] as any )?.name || ( '#' + ( index + 1 ) );
}

function getOtherPlacedBlocks( page: number, excludeIndex: number ): { index: number; left: number; width: number; top: number; height: number }[] {
	const sets = props.character?.traitSets || [];
	const list: { index: number; left: number; width: number; top: number; height: number }[] = [];
	sets.forEach( ( s: any, idx: number ) => {
		if ( idx === excludeIndex ) return;
		if ( ( Number( getView( s )?.page ) || 1 ) !== page ) return;
		const p = getView( s )?.place;
		if ( !p ) return;
		const left = parsePct( p.left ) ?? 0;
		const width = parsePct( p.width ) ?? 100;
		const top = Number.isInteger( p.top ) ? p.top : 0;
		const height = Number.isInteger( p.height ) ? p.height : 1;
		list.push( { index: idx, left, width, top, height } );
	} );
	return list;
}

function checkOverlap(
	a: { left: number; width: number; top: number; height: number },
	b: { left: number; width: number; top: number; height: number }
): boolean {
	const h = a.left < b.left + b.width - 1e-6 && b.left < a.left + a.width - 1e-6;
	const v = a.top < b.top + b.height && b.top < a.top + a.height;
	return h && v;
}

function writePlace( index: number, rect: { left: number; width: number; top: number; height: number } ) {
	const set = props.character?.traitSets?.[ index ];
	if ( !set || typeof set !== 'object' ) return;
	const view = ensureView( set );
	const page = Number( view.page ) || 1;
	const cl = Math.max( 0, Math.min( 100, Number( rect.left ) || 0 ) );
	let cw = Math.max( 1, Math.min( 100 - cl, Number( rect.width ) || 100 ) );
	const top = Number.isInteger( rect.top ) ? Math.max( 0, rect.top ) : 0;
	let height = Number.isInteger( rect.height ) ? Math.max( 1, rect.height ) : 1;

	// Clamp against other blocks on the same page
	const others = getOtherPlacedBlocks( page, index );
	for ( const o of others ) {
		if ( top < o.top + o.height && o.top < top + height ) {
			if ( cl < o.left + o.width - 1e-6 && o.left < cl + cw - 1e-6 ) {
				if ( cl < o.left ) {
					cw = Math.max( 1, o.left - cl );
				}
			}
		}
	}

	if ( !view.place || typeof view.place !== 'object' ) {
		view.place = { left: '0%', top: 0, width: '100%', height: 1 };
	}
	const place = view.place as unknown as Record<string, unknown>;
	place.left = formatPct( Math.round( cl * 10 ) / 10 );
	place.width = formatPct( Math.round( cw * 10 ) / 10 );
	place.top = top;
	place.height = height;
	emit( 'updateCharacter', props.character );
}

function clearPlace( index: number ) {
	const set = props.character?.traitSets?.[ index ];
	const view = set ? getView( set ) : undefined;
	if ( view && typeof view === 'object' ) delete ( view as Record<string, unknown> ).place;
	emit( 'updateCharacter', props.character );
}

function setPage( index: number, page: number ) {
	const set = props.character?.traitSets?.[ index ];
	if ( !set || typeof set !== 'object' ) return;
	ensureView( set ).page = Math.max( 1, Math.min( 3, page ) );
	emit( 'updateCharacter', props.character );
}

function pageOfSet( index: number ) {
	if ( drag.value && drag.value.index === index ) return drag.value.page;
	const set = props.character?.traitSets?.[ index ];
	return Number( getView( set )?.page ) || 1;
}

function hasPlaceSet( index: number ) {
	if ( drag.value && drag.value.index === index ) return true;
	const p = getView( props.character?.traitSets?.[ index ] )?.place;
	return Boolean( p && typeof p === 'object' && !Array.isArray( p ) );
}

function numOf( index: number, field: 'left' | 'width' | 'top' | 'height' ) {
	if ( drag.value && drag.value.index === index && typeof drag.value[ field ] === 'number' ) {
		return drag.value[ field ];
	}
	const p = getView( props.character?.traitSets?.[ index ] )?.place as any;
	if ( field === 'left' ) {
		const v = parsePct( p?.left );
		return v === null ? 0 : Math.round( v * 1000 ) / 1000;
	}
	if ( field === 'width' ) {
		const v = parsePct( p?.width );
		return v === null ? 100 : Math.round( v * 1000 ) / 1000;
	}
	if ( field === 'top' ) {
		return Number.isInteger( p?.top ) && ( p.top as number ) >= 0 ? p.top as number : 0;
	}
	const h = p?.height;
	return Number.isInteger( h ) && ( h as number ) >= 1 ? h as number : 1;
}

function setNum( index: number, field: 'left' | 'width' | 'top' | 'height', val: number ) {
	const cur = {
		left: numOf( index, 'left' ),
		width: numOf( index, 'width' ),
		top: numOf( index, 'top' ),
		height: numOf( index, 'height' ),
	};
	cur[ field ] = val;
	writePlace( index, cur );
}

function targetNum( e: Event ) {
	return Number( ( e.target as HTMLInputElement )?.value );
}

const rootEls = ref<HTMLElement[]>( [] );

const snapPct = ( n: number ) => Math.round( n * 2 ) / 2;

// Map a drop (page miniature + row) to model truth, computed against an
// array the dragged set was already removed from: the doc slot
// (insert-before index) and the top (the landed group's key, or a fresh
// row past the last top).
function mapDrop( sets: any[], page: number, row: number ): { to: number; top: number } {
	const layout = layoutFor( page, sets );
	const over = layout.blocks.find( ( b ) => row >= b.top && row < b.top + b.height );
	let to: number;
	if ( over ) {
		to = sets.indexOf( over.set );
	} else {
		const samePage = sets.filter( ( s: any ) => ( Number( getView( s )?.page ) || 1 ) === page );
		to = samePage.length ? sets.indexOf( samePage[ samePage.length - 1 ] ) + 1 : sets.length;
	}
	let top: number;
	if ( over && over.kind === 'box' ) {
		top = over.base;
	} else {
		let maxTop = -1;
		for ( const s of sets ) {
			if ( ( Number( getView( s )?.page ) || 1 ) !== page ) continue;
			const t = getView( s )?.place?.top;
			if ( Number.isInteger( t ) && ( t as number ) >= 0 ) maxTop = Math.max( maxTop, t as number );
		}
		top = maxTop + 1;
	}
	return { to, top };
}

function startBoxDrag( event: MouseEvent | TouchEvent, b: Block, pg: number, mode: 'move' | 'w' | 'h' ) {
	event.preventDefault();
	event.stopPropagation();
	selected.value = b.index;
	pressBox( b.index, event );
	const startX = event instanceof MouseEvent ? event.clientX : event.touches[ 0 ].clientX;
	const startY = event instanceof MouseEvent ? event.clientY : event.touches[ 0 ].clientY;
	const sets = props.character?.traitSets || [];
	const origin = rootEls.value[ pg ];
	const originRect = origin ? origin.getBoundingClientRect() : null;
	const minis = rootEls.value
		.map( ( el, i ) => el ? { page: i, rect: el.getBoundingClientRect(), rows: pages.value.find( ( p ) => p.page === i )?.rows ?? 2 } : null )
		.filter( ( m ): m is { page: number; rect: DOMRect; rows: number } => m !== null );
	const base = { left: b.left, width: b.width, top: b.top, height: b.height };
	const setObj = b.set;
	let moved = false;
	let cancelled = false;

	const overAt = ( cx: number, cy: number ) => {
		const hit = minis.find( ( m ) => cx >= m.rect.left && cx <= m.rect.right && cy >= m.rect.top && cy <= m.rect.bottom );
		if ( !hit ) return null;
		const row = Math.max( 0, Math.min( hit.rows, Math.round( ( cy - hit.rect.top - 4 ) / ROW_H ) ) );
		return { page: hit.page, row };
	};

	const onKeydown = ( e: KeyboardEvent ) => {
		if ( e.key === 'Escape' ) {
			e.preventDefault();
			e.stopPropagation();
			cancelled = true;
			drag.value = null;
			cleanup();
		}
	};

	const cleanup = () => {
		window.removeEventListener( 'mousemove', onMove );
		window.removeEventListener( 'mouseup', onUp );
		window.removeEventListener( 'touchmove', onMove );
		window.removeEventListener( 'touchend', onUp );
		window.removeEventListener( 'keydown', onKeydown );
	};

	const onMove = ( e: any ) => {
		if ( cancelled ) return;
		const cx = e.clientX ?? e.touches?.[ 0 ]?.clientX;
		const cy = e.clientY ?? e.touches?.[ 0 ]?.clientY;
		if ( cx === undefined || cy === undefined ) return;
		if ( Math.hypot( cx - startX, cy - startY ) < 3 && !moved ) return;
		moved = true;
		const w = originRect ? originRect.width : 1;
		const dxPct = ( cx - startX ) / w * 100;
		if ( mode !== 'move' ) {
			if ( mode === 'w' ) {
				let targetW = snapPct( Math.max( 5, Math.min( 100 - base.left, base.width + dxPct ) ) );
				// Live clamp against other placed blocks on the same page
				const others = getOtherPlacedBlocks( pageOfSet( b.index ), b.index );
				for ( const o of others ) {
					if ( base.top < o.top + o.height && o.top < base.top + base.height ) {
						if ( o.left >= base.left + 1e-6 ) {
							targetW = Math.min( targetW, o.left - base.left );
						}
					}
				}
				targetW = Math.max( 5, targetW );
				drag.value = {
					index: b.index, setObj, mode, base,
					page: pageOfSet( b.index ),
					left: base.left, width: targetW, top: base.top, height: base.height,
					overPage: pg, overRow: base.top, cx, cy,
				};
			} else {
				const dyRows = ( cy - startY ) / ROW_H;
				let targetH = Math.max( 1, Math.round( base.height + dyRows ) );
				// Live clamp against other placed blocks below
				const others = getOtherPlacedBlocks( pageOfSet( b.index ), b.index );
				for ( const o of others ) {
					if ( base.left < o.left + o.width - 1e-6 && o.left < base.left + base.width - 1e-6 ) {
						if ( o.top >= base.top + 1 ) {
							targetH = Math.min( targetH, o.top - base.top );
						}
					}
				}
				targetH = Math.max( 1, targetH );
				drag.value = {
					index: b.index, setObj, mode, base,
					page: pageOfSet( b.index ),
					left: base.left, width: base.width, top: base.top,
					height: targetH,
					overPage: pg, overRow: base.top, cx, cy,
				};
			}
			return;
		}

		let left = snapPct( Math.max( 0, Math.min( 100 - base.width, base.left + dxPct ) ) );
		const over = overAt( cx, cy );
		const overPage = over ? over.page : pg;
		const overRow = over ? over.row : base.top;
		const mapped = mapDrop( sets.filter( ( s: any ) => s !== setObj ), overPage, overRow );

		// Live clamp left against other placed blocks on overPage that share target top
		const targetTop = mapped.top;
		const others = getOtherPlacedBlocks( overPage, b.index );
		for ( const o of others ) {
			if ( targetTop < o.top + o.height && o.top < targetTop + base.height ) {
				if ( base.left + base.width <= o.left + 1e-6 ) {
					left = Math.min( left, o.left - base.width );
				} else if ( o.left + o.width <= base.left + 1e-6 ) {
					left = Math.max( left, o.left + o.width );
				} else if ( left < o.left + o.width - 1e-6 && o.left < left + base.width - 1e-6 ) {
					if ( left + base.width / 2 < o.left + o.width / 2 ) {
						left = Math.max( 0, o.left - base.width );
					} else {
						left = Math.min( 100 - base.width, o.left + o.width );
					}
				}
			}
		}
		left = snapPct( Math.max( 0, Math.min( 100 - base.width, left ) ) );

		drag.value = {
			index: b.index, setObj, mode, base,
			page: overPage, left, width: base.width, top: targetTop, height: base.height,
			overPage, overRow, cx, cy,
		};
	};

	const onUp = ( e?: any ) => {
		cleanup();
		if ( cancelled ) return;
		const d = drag.value;
		drag.value = null;
		if ( !moved || !d ) return;

		const cx = e ? ( e.clientX ?? e.changedTouches?.[ 0 ]?.clientX ?? d.cx ) : d.cx;
		const cy = e ? ( e.clientY ?? e.changedTouches?.[ 0 ]?.clientY ?? d.cy ) : d.cy;
		const hit = overAt( cx, cy );
		if ( !hit ) {
			// Dropped outside all page miniatures: cancel gesture, leave model untouched
			return;
		}

		if ( d.mode !== 'move' ) {
			writePlace( b.index, { left: d.left, width: d.width, top: d.top, height: d.height } );
			return;
		}
		const live: any[] = props.character?.traitSets || [];
		let from = live.indexOf( d.setObj );
		if ( from === -1 ) {
			const sid = ( d.setObj as any )?.id;
			if ( sid !== undefined ) from = live.findIndex( ( s: any ) => s?.id === sid );
		}
		if ( from === -1 ) return;
		const mapped = mapDrop( live.filter( ( _, i ) => i !== from ), d.overPage, d.overRow );
		const [ moved2 ] = live.splice( from, 1 );
		const to = Math.max( 0, Math.min( mapped.to, live.length ) );
		live.splice( to, 0, moved2 );
		ensureView( moved2 ).page = Math.max( 1, Math.min( 3, d.overPage ) );
		writePlace( to, { left: d.left, width: d.width, top: mapped.top, height: d.base.height } );
		selected.value = to;
	};

	window.addEventListener( 'mousemove', onMove );
	window.addEventListener( 'mouseup', onUp );
	window.addEventListener( 'touchmove', onMove, { passive: false } );
	window.addEventListener( 'touchend', onUp );
	window.addEventListener( 'keydown', onKeydown );
}

function onBoxKeydown( e: KeyboardEvent, b: Block ) {
	if ( e.key === 'Enter' || e.key === ' ' ) {
		e.preventDefault();
		openBlockMini( b.index );
		return;
	}
	if ( !e.key.startsWith( 'Arrow' ) ) return;
	e.preventDefault();
	selected.value = b.index;

	const curLeft = numOf( b.index, 'left' );
	const curWidth = numOf( b.index, 'width' );
	const curTop = numOf( b.index, 'top' );
	const curHeight = numOf( b.index, 'height' );
	const page = pageOfSet( b.index );
	const others = getOtherPlacedBlocks( page, b.index );

	let newLeft = curLeft;
	let newWidth = curWidth;
	let newTop = curTop;
	let newHeight = curHeight;

	if ( e.key === 'ArrowLeft' ) {
		if ( e.shiftKey ) {
			newWidth = Math.max( 5, curWidth - 5 );
		} else {
			newLeft = Math.max( 0, curLeft - 5 );
			const obs = others.filter( o => curTop < o.top + o.height && o.top < curTop + curHeight && o.left + o.width <= curLeft + 1e-6 );
			for ( const o of obs ) {
				newLeft = Math.max( newLeft, o.left + o.width );
			}
		}
	} else if ( e.key === 'ArrowRight' ) {
		if ( e.shiftKey ) {
			newWidth = Math.min( 100 - curLeft, curWidth + 5 );
			const obs = others.filter( o => curTop < o.top + o.height && o.top < curTop + curHeight && o.left >= curLeft + 1e-6 );
			for ( const o of obs ) {
				newWidth = Math.min( newWidth, o.left - curLeft );
			}
		} else {
			newLeft = Math.min( 100 - curWidth, curLeft + 5 );
			const obs = others.filter( o => curTop < o.top + o.height && o.top < curTop + curHeight && o.left >= curLeft + curWidth - 1e-6 );
			for ( const o of obs ) {
				newLeft = Math.min( newLeft, o.left - curWidth );
			}
		}
	} else if ( e.key === 'ArrowUp' ) {
		if ( e.shiftKey ) {
			newHeight = Math.max( 1, curHeight - 1 );
		} else {
			newTop = Math.max( 0, curTop - 1 );
			const overlaps = others.some( o => checkOverlap( { left: curLeft, width: curWidth, top: newTop, height: curHeight }, o ) );
			if ( overlaps ) newTop = curTop;
		}
	} else if ( e.key === 'ArrowDown' ) {
		if ( e.shiftKey ) {
			newHeight = curHeight + 1;
			const overlaps = others.some( o => checkOverlap( { left: curLeft, width: curWidth, top: curTop, height: newHeight }, o ) );
			if ( overlaps ) newHeight = curHeight;
		} else {
			newTop = curTop + 1;
			const overlaps = others.some( o => checkOverlap( { left: curLeft, width: curWidth, top: newTop, height: curHeight }, o ) );
			if ( overlaps ) newTop = curTop;
		}
	}

	writePlace( b.index, { left: newLeft, width: newWidth, top: newTop, height: newHeight } );
}

function openBlockMini( index: number ) {
	selected.value = index;
	editingSetIndex.value = index;
}

function onApplyBlockMini( updatedSet: any ) {
	if ( editingSetIndex.value !== null && props.character?.traitSets?.[ editingSetIndex.value ] ) {
		props.character.traitSets[ editingSetIndex.value ] = updatedSet;
		emit( 'updateCharacter', props.character );
	}
	editingSetIndex.value = null;
}

onUnmounted( () => { drag.value = null; clearArm(); lastPress.value = null; } );

// Drill into the block mini on double-press:
const lastPress = ref<{ index: number; at: number } | null>( null );
let armCleanup: ( () => void ) | null = null;
function clearArm() {
	if ( armCleanup ) { armCleanup(); armCleanup = null; }
}
function pressBox( index: number, event: MouseEvent | TouchEvent ) {
	const cx = event instanceof MouseEvent ? event.clientX : event.touches[ 0 ].clientX;
	const cy = event instanceof MouseEvent ? event.clientY : event.touches[ 0 ].clientY;
	const now = Date.now();
	const quick = lastPress.value && lastPress.value.index === index && now - lastPress.value.at < 500;
	lastPress.value = { index, at: now };
	if ( !quick ) return;
	lastPress.value = null;
	clearArm();
	let settled = false;
	const done = () => {
		if ( settled ) return;
		settled = true;
		window.removeEventListener( 'mousemove', onMove );
		window.removeEventListener( 'mouseup', onUp );
		window.removeEventListener( 'touchmove', onMove );
		window.removeEventListener( 'touchend', onUp );
		armCleanup = null;
	};
	const onMove = ( e: any ) => {
		const x = e.clientX ?? e.touches?.[ 0 ]?.clientX;
		const y = e.clientY ?? e.touches?.[ 0 ]?.clientY;
		if ( x === undefined || y === undefined ) return;
		if ( Math.hypot( x - cx, y - cy ) > 4 ) done();
	};
	const onUp = () => {
		if ( settled ) return;
		done();
		openBlockMini( index );
	};
	armCleanup = done;
	window.addEventListener( 'mousemove', onMove );
	window.addEventListener( 'mouseup', onUp );
	window.addEventListener( 'touchmove', onMove, { passive: true } );
	window.addEventListener( 'touchend', onUp );
}
</script>

<template>
	<div class="page-layout-mini-wrap">
		<div v-for="pg in pages" :key="'page-mini-' + pg.page" style="margin-bottom: 0.6rem;">
			<div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.2rem;">Page {{ pg.page }}</div>
			<div
				:ref="(el) => { rootEls[pg.page] = el as HTMLElement; }"
				class="place-mini"
				:style="'height: ' + (pg.rows * ROW_H + 8) + 'px;'"
				role="application"
				:aria-label="'Page ' + pg.page + ' layout: drag a set to move it between pages, its right and bottom edges to resize'"
			>
				<div
					v-for="r in pg.rows"
					:key="'row-' + r"
					class="place-mini-rowline"
					:style="'top: ' + ((r - 1) * ROW_H + 4) + 'px;'"
				></div>
				<div
					v-if="drag && drag.mode === 'move' && drag.overPage === pg.page"
					class="place-mini-insert"
					:style="'top: ' + (drag.overRow * ROW_H + 3) + 'px;'"
				></div>
				<template v-for="b in pg.blocks" :key="b.kind + '-' + b.index">
					<div
						class="place-mini-ghost place-mini-pick"
						:class="{ 'place-mini-band': b.kind === 'band' }"
						:data-index="b.index"
						:data-page="pg.page"
						:style="'left: ' + b.left + '%; top: ' + (b.top * ROW_H + 4) + 'px; width: ' + b.width + '%; height: ' + (b.height * ROW_H - 3) + 'px;'"
						:title="b.name + (b.kind === 'band' ? ' (stacked)' : '') + ' — click to select, double-click or Enter to edit parts'"
						tabindex="0"
						role="button"
						:aria-label="b.name + (b.kind === 'band' ? ' (stacked)' : '') + ' — click to select, double-click or Enter to edit parts'"
						@mousedown="selected = b.index; pressBox(b.index, $event)"
						@keydown="onBoxKeydown($event, b)"
						v-if="selected !== b.index"
					>
						<span class="place-mini-ghostname">{{ b.name }}</span>
					</div>
					<div
						v-else
						class="place-mini-block"
						:class="{ 'place-mini-stacked': b.kind === 'band', 'place-mini-dragging': drag && drag.index === b.index }"
						:data-index="b.index"
						:data-page="pg.page"
						:style="'left: ' + b.left + '%; top: ' + (b.top * ROW_H + 4) + 'px; width: ' + b.width + '%; height: ' + (b.height * ROW_H - 3) + 'px;'"
						tabindex="0"
						role="button"
						:aria-label="b.name + ' — arrows to move, shift+arrows to resize, enter to edit parts'"
						@mousedown="startBoxDrag($event, b, pg.page, 'move')"
						@touchstart="startBoxDrag($event, b, pg.page, 'move')"
						@keydown="onBoxKeydown($event, b)"
						:title="'Drag to move within and between pages · right and bottom edges resize · double-click or Enter to edit parts'"
					>
						<span class="place-mini-name">{{ b.name }}</span>
						<span
							class="place-mini-edge place-mini-edge-e"
							title="Resize width"
							@mousedown.stop="startBoxDrag($event, b, pg.page, 'w')"
							@touchstart.stop="startBoxDrag($event, b, pg.page, 'w')"
						></span>
						<span
							class="place-mini-edge place-mini-edge-s"
							title="Resize height"
							@mousedown.stop="startBoxDrag($event, b, pg.page, 'h')"
							@touchstart.stop="startBoxDrag($event, b, pg.page, 'h')"
						></span>
					</div>
				</template>
			</div>
		</div>
		<div
			v-if="drag"
			class="place-mini-ghost-drag"
			:style="'left: ' + (drag.cx + 14) + 'px; top: ' + (drag.cy + 16) + 'px;'"
		>
			{{ setNameOf(drag.index) }}
		</div>
		<div class="editor-field" v-if="selected !== null && props.character?.traitSets?.[selected]">
			<div class="editor-label">{{ setNameOf(selected) }}</div>
			<div class="editor-button-group" style="margin-bottom: 0.4rem; display: flex; gap: 0.4rem; flex-wrap: wrap;">
				<button
					v-for="p in pageCount"
					:key="'sel-page-' + p"
					type="button"
					class="editor-group-btn"
					:class="{ active: pageOfSet(selected) === p }"
					@click.stop="setPage(selected as number, p)"
				>
					Page {{ p }}
				</button>
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: !hasPlaceSet(selected as number) }"
					@click.stop="clearPlace(selected as number)"
					title="Full width, stacked in document order"
				>
					Full Width
				</button>
				<button
					type="button"
					class="editor-group-btn btn-open-block-mini"
					@click.stop="openBlockMini(selected as number)"
					title="Open trait-block mini to edit set parts and layout"
				>
					<i class="fas fa-th"></i> Edit Parts
				</button>
			</div>
			<div style="display: flex; gap: 0.5rem; margin-bottom: 0.4rem;">
				<div style="flex: 1;">
					<label :for="'page-mini-left'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Left %</label>
					<input type="number" id="page-mini-left" name="pageMiniLeft" min="0" max="100" step="0.5" :value="numOf(selected as number, 'left')" @change="setNum(selected as number, 'left', targetNum($event))">
				</div>
				<div style="flex: 1;">
					<label :for="'page-mini-width'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Width %</label>
					<input type="number" id="page-mini-width" name="pageMiniWidth" min="1" max="100" step="0.5" :value="numOf(selected as number, 'width')" @change="setNum(selected as number, 'width', targetNum($event))">
				</div>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<div style="flex: 1;">
					<label :for="'page-mini-top'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Top</label>
					<input type="number" id="page-mini-top" name="pageMiniTop" min="0" step="1" :value="numOf(selected as number, 'top')" @change="setNum(selected as number, 'top', Math.max(0, Math.round(targetNum($event) || 0)))">
				</div>
				<div style="flex: 1;">
					<label :for="'page-mini-height'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Height</label>
					<input type="number" id="page-mini-height" name="pageMiniHeight" min="1" step="1" :value="numOf(selected as number, 'height')" @change="setNum(selected as number, 'height', Math.max(1, Math.round(targetNum($event) || 1)))">
				</div>
			</div>
			<div class="editor-field-hint" style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.3rem;">
				<span v-if="hasPlaceSet(selected as number)">Page {{ pageOfSet(selected as number) }} · Left {{ numOf(selected as number, 'left') }}% · Width {{ numOf(selected as number, 'width') }}% · Top {{ numOf(selected as number, 'top') }} · Height {{ numOf(selected as number, 'height') }}</span>
				<span v-else>Full width · stacked in document order</span>
			</div>
		</div>
		<div class="editor-field-hint" v-else style="font-size: 0.72rem; color: #94a3b8;">
			Select a set on the miniature to edit its placement.
		</div>

		<!-- Teleport: Trait Block Mini Handoff -->
		<teleport to="body">
			<TraitSetMini
				v-if="editingSetIndex !== null && props.character?.traitSets?.[editingSetIndex]"
				:initialSet="props.character.traitSets[editingSetIndex]"
				@close="editingSetIndex = null"
				@applyToSet="onApplyBlockMini"
			/>
		</teleport>
	</div>
</template>
