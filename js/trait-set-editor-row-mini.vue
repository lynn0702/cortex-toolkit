<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import { getView } from './model.ts';
import { partsGrid, formatPct } from './spotlight-grid.ts';
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const { traitSet, effectivePartCells, setPartCell, partPreview, headerMode, headerAlign, branchShares, setBranchShare } = injectTraitSetEditor();

const PART_TITLES: Record<string, string> = {
	name: 'Name', rating: 'Rating', description: 'Description', sfx: 'SFX',
	subtraits: 'Subtraits', stressLabel: 'Stress Label', stress: 'Stress'
};

const NON_ROW = [ 'image', 'notes', 'pips', 'session-record', 'angled-lines', 'portrait-ring' ];

const bodyOf = computed( () => getView( traitSet.value )?.style?.body );
const isBranchBody = computed( () => bodyOf.value === 'subtrait-columns' );
const isNonRowBody = computed( () => typeof bodyOf.value === 'string' && ( NON_ROW as readonly string[] ).includes( bodyOf.value ) );
// Generic part boxes show only where the grid drives; branch sets get
// branch boxes instead (stored part cells there stay JSON-side: the
// flex renderer would ignore them, so the miniature must not offer
// them as live controls).
const showGenericBoxes = computed( () => !isBranchBody.value && boxes.value.boxes.length > 0 );

const branchView = computed( () => branchShares() );

// Branch column shares for split rows (left | skill | right around the
// fixed link): normalized to the row for display, dragged in fr units
// with the pair sum conserved. Always shown for branch sets; stored
// shares render wherever a split row does.
const branch = computed( () => {
	const s = branchShares();
	const total = ( s.left + s.center + s.right ) || 1;
	return {
		left: s.left / total * 100,
		center: s.center / total * 100,
		right: s.right / total * 100,
		implicit: s.implicit,
		sum: total,
	};
} );

const branchDrag = ref<{ leftKey: 'left' | 'center'; rightKey: 'center' | 'right'; left: number; center: number; right: number } | null>( null );

function branchShown( key: 'left' | 'center' | 'right' ) {
	if ( branchDrag.value ) return branchDrag.value[ key ];
	const b = branch.value;
	return b[ key ];
}

function startBranchDivider( event: MouseEvent | TouchEvent, leftKey: 'left' | 'center', rightKey: 'center' | 'right' ) {
	event.preventDefault();
	event.stopPropagation();
	const track = ( event.target as HTMLElement ).closest( '.branch-mini' ) as HTMLElement | null;
	const trackW = track ? track.getBoundingClientRect().width : 1;
	const b = branch.value;
	const startX = event instanceof MouseEvent ? event.clientX : event.touches[ 0 ].clientX;
	const baseL = leftKey === 'left' ? b.left : b.center;
	const baseR = rightKey === 'center' ? b.center : b.right;
	const sum = b.sum;
	let moved = false;

	const toFr = ( pct: number ) => Math.round( pct / 100 * sum * 10 ) / 10;
	const onMove = ( e: any ) => {
		const cx = e.clientX ?? e.touches?.[ 0 ]?.clientX;
		if ( cx === undefined ) return;
		if ( Math.abs( cx - startX ) < 3 && !moved ) return;
		moved = true;
		const dxPct = ( cx - startX ) / trackW * 100;
		const pair = baseL + baseR;
		let nl = Math.max( 2, Math.min( pair - 2, baseL + dxPct ) );
		nl = Math.round( nl * 10 ) / 10;
		const nr = Math.round( ( pair - nl ) * 10 ) / 10;
		branchDrag.value = {
			leftKey,
			rightKey,
			left: leftKey === 'left' ? nl : b.left,
			center: leftKey === 'left' ? nr : ( rightKey === 'center' ? nr : nl ),
			right: rightKey === 'right' ? nr : b.right,
		};
	};

	const onUp = () => {
		window.removeEventListener( 'mousemove', onMove );
		window.removeEventListener( 'mouseup', onUp );
		window.removeEventListener( 'touchmove', onMove );
		window.removeEventListener( 'touchend', onUp );
		const d = branchDrag.value;
		branchDrag.value = null;
		if ( !moved || !d ) return;
		setBranchShare( leftKey, toFr( leftKey === 'left' ? d.left : d.center ) );
		setBranchShare( rightKey, toFr( rightKey === 'center' ? d.center : d.right ) );
	};

	window.addEventListener( 'mousemove', onMove );
	window.addEventListener( 'mouseup', onUp );
	window.addEventListener( 'touchmove', onMove, { passive: false } );
	window.addEventListener( 'touchend', onUp );
}

const ROW_H = 30;
const TOP_ZONE = 34;
const SIDE_ZONE = 48;

const isTop = computed( () => headerMode.value === 'top' );
const align = computed( () => headerAlign.value );
const setName = computed( () => ( traitSet.value as any )?.name || '' );

// Shared hinder banner (distinctions sets): section chrome with no
// stored geometry, so display-only — but shown, as it renders, above
// the rows inside the body column.
const hinderText = computed( () => {
	const ts = traitSet.value as any;
	if ( getView( ts )?.style?.body !== 'distinctions' || !getView( ts )?.sharedHinder ) return '';
	const custom = typeof getView( ts )?.sharedHinderText === 'string' ? ( getView( ts )?.sharedHinderText as string ).trim() : '';
	if ( custom ) return custom;
	const noun = ts?.nounSingular?.length ? String( ts.nounSingular ).toLowerCase() : 'distinction';
	return 'Gain a PP when you trade out your ' + noun + '\'s d8 rating for a d4.';
} );

function cycleAlign() {
	headerAlign.value = align.value === 'left' ? 'center' : align.value === 'center' ? 'right' : 'left';
}

// Every stored part as a box, arranged as the sheet renders it: the same
// grid math (columns from part edges, rows from top/height) the renderer
// uses, so the miniature's arrangement and the rendered row agree.
const boxes = computed( () => {
	const eff = effectivePartCells.value.map( ( c: any ) => {
		if ( partPreview.value && partPreview.value.key === c.key ) {
			const p = partPreview.value;
			return { key: c.key, left: p.left, width: p.width, top: p.top, height: p.height, implicit: false };
		}
		return { key: c.key, left: c.left, width: c.width, top: c.top, height: c.height, implicit: Boolean( c.implicit ) };
	} );
	const map: Record<string, { left: string; top: number; width: string; height: number }> = {};
	for ( const b of eff ) {
		map[ b.key ] = { left: formatPct( b.left ), top: b.top, width: formatPct( b.width ), height: b.height };
	}
	const grid = partsGrid( map );
	let rows = 1;
	for ( const b of eff ) {
		rows = Math.max( rows, b.top + b.height );
	}
	return { boxes: eff, grid, rows };
} );

const gridTemplate = computed( () => {
	const cols = boxes.value.grid?.columns?.length ? boxes.value.grid.columns : [ 100 ];
	return cols.map( ( c: number ) => Math.round( c * 1000 ) / 1000 + '%' ).join( ' ' );
} );

function cellPlace( key: string ) {
	const cell = boxes.value.grid?.cells?.[ key ];
	if ( !cell ) return '';
	return `grid-column: ${cell.col} / span ${cell.span}; grid-row: ${cell.row} / span ${cell.rowSpan}; min-width: 0;`;
}

const rootEl = ref<HTMLElement | null>( null );
const sectionEl = ref<HTMLElement | null>( null );

const snapPct = ( n: number ) => Math.round( n * 2 ) / 2;

function startBoxDrag( event: MouseEvent | TouchEvent, key: string, mode: 'move' | 'w' | 'h' ) {
	event.preventDefault();
	event.stopPropagation();
	const host = rootEl.value;
	if ( !host ) return;
	const rect = host.getBoundingClientRect();
	const startX = event instanceof MouseEvent ? event.clientX : event.touches[ 0 ].clientX;
	const startY = event instanceof MouseEvent ? event.clientY : event.touches[ 0 ].clientY;
	const cell = effectivePartCells.value.find( ( c: any ) => c.key === key );
	if ( !cell ) return;
	const base = { left: cell.left, width: cell.width, top: cell.top, height: cell.height };
	let moved = false;

	const onMove = ( e: any ) => {
		const cx = e.clientX ?? e.touches?.[ 0 ]?.clientX;
		const cy = e.clientY ?? e.touches?.[ 0 ]?.clientY;
		if ( cx === undefined || cy === undefined ) return;
		if ( Math.hypot( cx - startX, cy - startY ) < 3 && !moved ) return;
		moved = true;
		const dxPct = ( cx - startX ) / rect.width * 100;
		const dyRows = ( cy - startY ) / ROW_H;
		if ( mode === 'move' ) {
			partPreview.value = {
				key,
				left: snapPct( Math.max( 0, Math.min( 100 - base.width, base.left + dxPct ) ) ),
				width: base.width,
				top: Math.max( 0, Math.round( base.top + dyRows ) ),
				height: base.height,
			};
		} else if ( mode === 'w' ) {
			partPreview.value = {
				key,
				left: base.left,
				width: snapPct( Math.max( 5, Math.min( 100 - base.left, base.width + dxPct ) ) ),
				top: base.top,
				height: base.height,
			};
		} else {
			partPreview.value = {
				key,
				left: base.left,
				width: base.width,
				top: base.top,
				height: Math.max( 1, Math.round( base.height + dyRows ) ),
			};
		}
	};

	const onUp = () => {
		window.removeEventListener( 'mousemove', onMove );
		window.removeEventListener( 'mouseup', onUp );
		window.removeEventListener( 'touchmove', onMove );
		window.removeEventListener( 'touchend', onUp );
		if ( moved && partPreview.value ) {
			const p = partPreview.value;
			if ( p.left !== cell.left ) setPartCell( key, 'left', p.left );
			if ( p.width !== cell.width ) setPartCell( key, 'width', p.width );
			if ( p.top !== cell.top ) setPartCell( key, 'top', p.top );
			if ( p.height !== cell.height ) setPartCell( key, 'height', p.height );
		}
		partPreview.value = null;
	};

	window.addEventListener( 'mousemove', onMove );
	window.addEventListener( 'mouseup', onUp );
	window.addEventListener( 'touchmove', onMove, { passive: false } );
	window.addEventListener( 'touchend', onUp );
}

// Set header placement + alignment, dragged on the section canvas: drop
// in the top slot for a top bar (the drop third aims the text), in the
// side slot for a sidebar. A click with no drag cycles the alignment.
const headerDrag = ref<{ dx: number; dy: number; zone: 'top' | 'side' | null; third: 'left' | 'center' | 'right' } | null>( null );

function zoneOf( cx: number, cy: number ) {
	const sec = sectionEl.value;
	if ( !sec ) return { zone: null as 'top' | 'side' | null, third: align.value };
	const r = sec.getBoundingClientRect();
	const x = cx - r.left;
	const y = cy - r.top;
	if ( y < TOP_ZONE ) {
		return { zone: 'top' as const, third: ( x < r.width / 3 ? 'left' : x > r.width * 2 / 3 ? 'right' : 'center' ) as 'left' | 'center' | 'right' };
	}
	if ( x < SIDE_ZONE ) {
		return { zone: 'side' as const, third: align.value };
	}
	return { zone: null as 'top' | 'side' | null, third: align.value };
}

function startHeaderDrag( event: MouseEvent | TouchEvent ) {
	event.preventDefault();
	event.stopPropagation();
	if ( !sectionEl.value ) return;
	const startX = event instanceof MouseEvent ? event.clientX : event.touches[ 0 ].clientX;
	const startY = event instanceof MouseEvent ? event.clientY : event.touches[ 0 ].clientY;
	let moved = false;

	const onMove = ( e: any ) => {
		const cx = e.clientX ?? e.touches?.[ 0 ]?.clientX;
		const cy = e.clientY ?? e.touches?.[ 0 ]?.clientY;
		if ( cx === undefined || cy === undefined ) return;
		if ( Math.hypot( cx - startX, cy - startY ) < 3 && !moved ) return;
		moved = true;
		const z = zoneOf( cx, cy );
		headerDrag.value = { dx: cx - startX, dy: cy - startY, zone: z.zone, third: z.third };
	};

	const onUp = () => {
		window.removeEventListener( 'mousemove', onMove );
		window.removeEventListener( 'mouseup', onUp );
		window.removeEventListener( 'touchmove', onMove );
		window.removeEventListener( 'touchend', onUp );
		const drag = headerDrag.value;
		headerDrag.value = null;
		if ( !moved ) {
			cycleAlign();
			return;
		}
		if ( !drag || !drag.zone ) return;
		if ( drag.zone === 'top' ) {
			headerMode.value = 'top';
			headerAlign.value = drag.third;
		} else {
			headerMode.value = 'sidebar';
		}
	};

	window.addEventListener( 'mousemove', onMove );
	window.addEventListener( 'mouseup', onUp );
	window.addEventListener( 'touchmove', onMove, { passive: false } );
	window.addEventListener( 'touchend', onUp );
}

const headerTitle = computed( () => {
	return 'Header · ' + ( isTop.value ? 'Top bar' : 'Sidebar' ) + ' · ' + align.value + ' — drag to move, click to cycle alignment';
} );

onUnmounted( () => { partPreview.value = null; } );
</script>

<template>
	<div
		ref="sectionEl"
		class="row-mini-section"
		role="application"
		aria-label="Section layout miniature: drag parts to move them, the header between the top and side slots"
	>
		<div v-if="isTop" class="row-mini-headerbar">
			<div
				class="row-mini-headerbox"
				:style="'text-align: ' + align + (headerDrag ? '; transform: translate(' + headerDrag.dx + 'px,' + headerDrag.dy + 'px); z-index: 5;' : '')"
				@mousedown="startHeaderDrag($event)"
				@touchstart="startHeaderDrag($event)"
				:title="headerTitle"
			>
				<span class="row-mini-headername">{{ setName }}</span>
			</div>
		</div>
		<div class="row-mini-main" :class="{ 'row-mini-main-sideways': !isTop }">
			<div v-if="!isTop" class="row-mini-side">
				<div
					class="row-mini-headerbox row-mini-vertical"
					:style="headerDrag ? 'transform: translate(' + headerDrag.dx + 'px,' + headerDrag.dy + 'px); z-index: 5;' : ''"
					@mousedown="startHeaderDrag($event)"
					@touchstart="startHeaderDrag($event)"
					:title="headerTitle"
				>
					<span class="row-mini-headername">{{ setName }}</span>
				</div>
			</div>
			<div class="row-mini-bodycol">
				<div
					v-if="hinderText"
					class="row-mini-hinder"
					:title="hinderText + ' (shared hinder banner — fixed above the rows)'"
				>
					<span class="row-mini-hindername">Hinder · {{ hinderText }}</span>
				</div>
			<div
				v-if="isBranchBody"
				class="branch-mini"
				role="application"
				aria-label="Branch columns: drag dividers to share the row"
			>
				<div
					class="branch-box"
					:style="'width: ' + branchShown('left') + '%;'"
					:title="'Left specialties' + (branchView.implicit ? ' (preset)' : '')"
				>
					<span class="branch-name">Left</span>
					<span class="branch-dims">{{ branchView.implicit ? '' : branchView.left + 'fr' }}</span>
				</div>
				<div
					class="branch-divider"
					@mousedown="startBranchDivider($event, 'left', 'center')"
					@touchstart="startBranchDivider($event, 'left', 'center')"
				></div>
				<div
					class="branch-box"
					:style="'width: ' + branchShown('center') + '%;'"
					:title="'Skill column'"
				>
					<span class="branch-name">Skill</span>
				</div>
				<div
					class="branch-divider"
					@mousedown="startBranchDivider($event, 'center', 'right')"
					@touchstart="startBranchDivider($event, 'center', 'right')"
				></div>
				<div
					class="branch-box"
					:style="'width: ' + branchShown('right') + '%;'"
					:title="'Right specialties'"
				>
					<span class="branch-name">Right</span>
					<span class="branch-dims">{{ branchView.implicit ? '' : branchView.right + 'fr' }}</span>
				</div>
			</div>
			<div
				v-else-if="showGenericBoxes"
				ref="rootEl"
				class="row-mini"
				:style="'grid-template-columns: ' + gridTemplate + '; min-height: ' + (boxes.rows * ROW_H + 8) + 'px;'"
			>
				<div
					v-for="b in boxes.boxes"
					:key="b.key"
					class="row-mini-box"
					:class="{ 'row-mini-implicit': b.implicit }"
					:style="cellPlace(b.key)"
					@mousedown="startBoxDrag($event, b.key, 'move')"
					@touchstart="startBoxDrag($event, b.key, 'move')"
					:title="(PART_TITLES[b.key] || b.key) + ' ' + b.left + '% · top ' + b.top + ' · ' + b.width + '% × ' + b.height"
				>
					<span class="row-mini-name">{{ PART_TITLES[b.key] || b.key }}</span>
					<span class="row-mini-dims">{{ b.width }}%</span>
					<span
						class="row-mini-edge row-mini-edge-e"
						@mousedown.stop="startBoxDrag($event, b.key, 'w')"
						@touchstart.stop="startBoxDrag($event, b.key, 'w')"
					></span>
					<span
						class="row-mini-edge row-mini-edge-s"
						@mousedown.stop="startBoxDrag($event, b.key, 'h')"
						@touchstart.stop="startBoxDrag($event, b.key, 'h')"
					></span>
				</div>
			</div>
			<div
				v-else
				class="row-mini-norows"
			>
				{{ isNonRowBody ? 'No trait rows to arrange — the header above is draggable.' : 'Column arrangement for this row style is not yet adjustable here — the header above is draggable.' }}
			</div>
		</div>
		</div>
		<div v-if="headerDrag" class="row-mini-slots" aria-hidden="true">
			<div class="row-mini-slot-top" :class="{ active: headerDrag.zone === 'top' }">
				<div class="row-mini-third" :class="{ active: headerDrag.zone === 'top' && headerDrag.third === 'left' }"></div>
				<div class="row-mini-third" :class="{ active: headerDrag.zone === 'top' && headerDrag.third === 'center' }"></div>
				<div class="row-mini-third" :class="{ active: headerDrag.zone === 'top' && headerDrag.third === 'right' }"></div>
			</div>
			<div class="row-mini-slot-side" :class="{ active: headerDrag.zone === 'side' }"></div>
		</div>
	</div>
</template>
