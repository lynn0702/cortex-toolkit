<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import { getView, ensureView } from './model.ts';
import { getSpotlightSections, parsePct, formatPct } from './spotlight-grid.ts';

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
				out.push( { kind: 'band', index: item.index, name: labelOf( item.index ), left: 0, width: 100, top: cursor, height: 1, base: -1, set: ( sets as any[] )[ item.index ] } );
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

function writePlace( index: number, rect: { left: number; width: number; top: number; height: number } ) {
	const set = props.character?.traitSets?.[ index ];
	if ( !set || typeof set !== 'object' ) return;
	const view = ensureView( set );
	if ( !view.place || typeof view.place !== 'object' ) {
		view.place = { left: '0%', top: 0, width: '100%', height: 1 };
	}
	const place = view.place as unknown as Record<string, unknown>;
	const cl = Math.max( 0, Math.min( 100, Number( rect.left ) || 0 ) );
	const cw = Math.max( 1, Math.min( 100, Number( rect.width ) || 100 ) );
	place.left = formatPct( Math.round( cl * 10 ) / 10 );
	place.width = formatPct( Math.round( cw * 10 ) / 10 );
	place.top = Number.isInteger( rect.top ) ? Math.max( 0, rect.top ) : 0;
	place.height = Number.isInteger( rect.height ) ? Math.max( 1, rect.height ) : 1;
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

	const overAt = ( cx: number, cy: number ) => {
		const hit = minis.find( ( m ) => cx >= m.rect.left && cx <= m.rect.right && cy >= m.rect.top && cy <= m.rect.bottom );
		if ( !hit ) return null;
		const row = Math.max( 0, Math.min( hit.rows, Math.round( ( cy - hit.rect.top - 4 ) / ROW_H ) ) );
		return { page: hit.page, row };
	};

	const onMove = ( e: any ) => {
		const cx = e.clientX ?? e.touches?.[ 0 ]?.clientX;
		const cy = e.clientY ?? e.touches?.[ 0 ]?.clientY;
		if ( cx === undefined || cy === undefined ) return;
		if ( Math.hypot( cx - startX, cy - startY ) < 3 && !moved ) return;
		moved = true;
		const w = originRect ? originRect.width : 1;
		const dxPct = ( cx - startX ) / w * 100;
		if ( mode !== 'move' ) {
			if ( mode === 'w' ) {
				const w = snapPct( Math.max( 5, Math.min( 100 - base.left, base.width + dxPct ) ) );
				drag.value = {
					index: b.index, setObj, mode, base,
					page: pageOfSet( b.index ),
					left: base.left, width: w, top: base.top, height: base.height,
					overPage: pg, overRow: base.top, cx, cy,
				};
			} else {
				const dyRows = ( cy - startY ) / ROW_H;
				drag.value = {
					index: b.index, setObj, mode, base,
					page: pageOfSet( b.index ),
					left: base.left, width: base.width, top: base.top,
					height: Math.max( 1, Math.round( base.height + dyRows ) ),
					overPage: pg, overRow: base.top, cx, cy,
				};
			}
			return;
		}
		const left = snapPct( Math.max( 0, Math.min( 100 - base.width, base.left + dxPct ) ) );
		const over = overAt( cx, cy ) ?? { page: pg, row: base.top };
		const mapped = mapDrop( sets.filter( ( s: any ) => s !== setObj ), over.page, over.row );
		drag.value = {
			index: b.index, setObj, mode, base,
			page: over.page, left, width: base.width, top: mapped.top, height: base.height,
			overPage: over.page, overRow: over.row, cx, cy,
		};
	};

	const onUp = () => {
		window.removeEventListener( 'mousemove', onMove );
		window.removeEventListener( 'mouseup', onUp );
		window.removeEventListener( 'touchmove', onMove );
		window.removeEventListener( 'touchend', onUp );
		const d = drag.value;
		drag.value = null;
		if ( !moved || !d ) return;
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
}

onUnmounted( () => { drag.value = null; clearArm(); lastPress.value = null; } );

// Drill into the set editor on double-press: a real dblclick never
// completes here (selecting swaps ghost for block between press and
// release, retargeting the click), so two quick presses arm a drill
// that fires on a clean release — any move first cancels it, exactly
// like the OS (click-then-drag never drills).
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
		emit( 'openSet', index );
	};
	armCleanup = done;
	window.addEventListener( 'mousemove', onMove );
	window.addEventListener( 'mouseup', onUp );
	window.addEventListener( 'touchmove', onMove, { passive: true } );
	window.addEventListener( 'touchend', onUp );
}
</script>

<template>
	<div>
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
						:style="'left: ' + b.left + '%; top: ' + (b.top * ROW_H + 4) + 'px; width: ' + b.width + '%; height: ' + (b.height * ROW_H - 3) + 'px;'"
						:title="b.name + (b.kind === 'band' ? ' (stacked)' : '') + ' — click to select, double-click to edit'"
						@mousedown="selected = b.index; pressBox(b.index, $event)"
						v-if="selected !== b.index"
					>
						<span class="place-mini-ghostname">{{ b.name }}</span>
					</div>
					<div
						v-else
						class="place-mini-block"
						:class="{ 'place-mini-stacked': b.kind === 'band', 'place-mini-dragging': drag && drag.index === b.index }"
						:data-index="b.index"
						:style="'left: ' + b.left + '%; top: ' + (b.top * ROW_H + 4) + 'px; width: ' + b.width + '%; height: ' + (b.height * ROW_H - 3) + 'px;'"
						@mousedown="startBoxDrag($event, b, pg.page, 'move')"
						@touchstart="startBoxDrag($event, b, pg.page, 'move')"
						:title="'Drag to move within and between pages · right and bottom edges resize · double-click to edit'"
					>
						<span class="place-mini-name">{{ b.name }}</span>
						<span
							class="place-mini-edge place-mini-edge-e"
							@mousedown.stop="startBoxDrag($event, b, pg.page, 'w')"
							@touchstart.stop="startBoxDrag($event, b, pg.page, 'w')"
						></span>
						<span
							class="place-mini-edge place-mini-edge-s"
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
			<div class="editor-button-group" style="margin-bottom: 0.4rem; display: flex; gap: 0.4rem;">
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
	</div>
</template>
