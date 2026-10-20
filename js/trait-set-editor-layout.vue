<script setup lang="ts">
import { computed, ref } from 'vue';
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	isRing, pageNumber, track, span, bandWidths, setRow, maxPageRow, flex,
	canMoveUp, canMoveDown, moveTraitSetUp, moveTraitSetDown,
	editorDock, isSpotlightSheet, targetValue
} = injectTraitSetEditor();

const WIDTH_PRESETS: { label: string; widths: [number, number, number] }[] = [
	{ label: 'Equal', widths: [33.333, 33.333, 33.334] },
	{ label: '33/67', widths: [33, 67, 0] },
	{ label: '50/50', widths: [50, 50, 0] },
	{ label: '25/50/25', widths: [25, 50, 25] },
	{ label: '30/50/20', widths: [30, 50, 20] },
	{ label: '100', widths: [100, 0, 0] },
];

function isPresetActive( preset: [number, number, number] ): boolean {
	const current = bandWidths.value;
	return Math.round( current[0] ) === Math.round( preset[0] ) &&
		Math.round( current[1] ) === Math.round( preset[1] ) &&
		Math.round( current[2] ) === Math.round( preset[2] );
}

// Widths bar: one bar, two dividers, three sections. Dividers cannot cross.
// Dragging redistributes between neighbors; the third section stays fixed.
const widthsBar = ref<HTMLElement | null>( null );
const draggingDivider = ref<0 | 1 | null>( null );

const widthsBase = computed( () => {
	const raw = [ Number( bandWidths.value[0] ) || 0, Number( bandWidths.value[1] ) || 0, Number( bandWidths.value[2] ) || 0 ];
	const sum = raw[0] + raw[1] + raw[2];
	if ( sum <= 0 ) return [ 33.333, 33.333, 33.334 ];
	return raw;
} );

const widthsTotal = computed( () => widthsBase.value[0] + widthsBase.value[1] + widthsBase.value[2] );
const dividerA = computed( () => ( widthsBase.value[0] / widthsTotal.value ) * 100 );
const dividerB = computed( () => ( ( widthsBase.value[0] + widthsBase.value[1] ) / widthsTotal.value ) * 100 );

function barPercent( event: PointerEvent ) {
	const el = widthsBar.value;
	if ( !el ) return 0;
	const rect = el.getBoundingClientRect();
	if ( rect.width <= 0 ) return 0;
	return Math.max( 0, Math.min( 100, ( ( event.clientX - rect.left ) / rect.width ) * 100 ) );
}

// Widths are shares of one band: the combined total can never exceed 100.
// Over-totals (e.g. hand-typed 28/90/0) scale down proportionally.
function writeWidths( a: number, b: number, c: number ) {
	let na = Math.max( 0, Math.round( a ) );
	let nb = Math.max( 0, Math.round( b ) );
	let nc = Math.max( 0, Math.round( c ) );
	const total = na + nb + nc;
	if ( total > 100 ) {
		na = Math.round( ( na / total ) * 100 );
		nb = Math.round( ( nb / total ) * 100 );
		nc = Math.max( 0, 100 - na - nb );
	}
	bandWidths.value = [ na, nb, nc ];
}

function startDividerDrag( which: 0 | 1, event: PointerEvent ) {
	draggingDivider.value = which;
	( event.target as HTMLElement ).setPointerCapture?.( event.pointerId );
	moveDivider( event );
	event.preventDefault();
}

function moveDivider( event: PointerEvent ) {
	if ( draggingDivider.value === null ) return;
	const q = barPercent( event );
	const [ a, b, c ] = widthsBase.value;
	const total = a + b + c;
	const toRaw = ( pct: number ) => ( pct / 100 ) * total;
	if ( draggingDivider.value === 0 ) {
		const na = Math.max( 0, Math.min( a + b, toRaw( q ) ) );
		writeWidths( na, a + b - na, c );
	} else {
		const nab = Math.max( a, Math.min( total, toRaw( q ) ) );
		writeWidths( a, nab - a, total - nab );
	}
}

function endDividerDrag() {
	draggingDivider.value = null;
}

function nudgeDivider( which: 0 | 1, delta: number ) {
	const [ a, b, c ] = widthsBase.value;
	const total = a + b + c;
	if ( which === 0 ) {
		const na = Math.max( 0, Math.min( a + b, a + delta ) );
		writeWidths( na, a + b - na, c );
	} else {
		const nab = Math.max( a, Math.min( total, a + b + delta ) );
		writeWidths( a, nab - a, total - nab );
	}
}
</script>

<template>
	<!-- PAGE -->
	<div class="editor-field" v-if="!isRing">
		<div class="editor-label">Page</div>
		<div class="editor-position-controls">
			<div class="editor-button-group">
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: pageNumber === 1 }"
					@click.stop="pageNumber = 1"
				>
					Page 1
				</button>
				<button
					type="button"
					class="editor-group-btn"
					:class="{ active: pageNumber === 2 }"
					@click.stop="pageNumber = 2"
				>
					Page 2
				</button>
			</div>
			<div class="editor-reorder-buttons">
				<button
					type="button"
					class="editor-step-btn"
					:disabled="!canMoveUp"
					@click.stop="moveTraitSetUp"
				>
					<i class="fas fa-arrow-up"></i>
				</button>
				<button
					type="button"
					class="editor-step-btn"
					:disabled="!canMoveDown"
					@click.stop="moveTraitSetDown"
				>
					<i class="fas fa-arrow-down"></i>
				</button>
			</div>
		</div>
	</div>

	<!-- COLUMN (sheet track) -->
	<div class="editor-field" v-if="!isRing">
		<div class="editor-label">Column</div>
		<div class="editor-button-group">
			<button
				v-for="t in [1, 2, 3]"
				:key="'track-' + t"
				type="button"
				class="editor-group-btn"
				:class="{ active: track === t }"
				@click.stop="track = t"
			>
				Column {{ t }}
			</button>
		</div>
	</div>

	<!-- SPAN -->
	<div class="editor-field" v-if="!isRing">
		<div class="editor-label">Span</div>
		<div class="editor-button-group">
			<button
				v-for="s in [1, 2, 3]"
				:key="'span-' + s"
				type="button"
				class="editor-group-btn"
				:class="{ active: span === s }"
				@click.stop="span = s"
			>
				{{ s }}
			</button>
		</div>
	</div>

	<!-- WIDTHS (band shares; hidden for full-width sets) -->
	<div class="editor-field" v-if="!isRing && isSpotlightSheet && span !== 3">
		<div class="editor-label">Widths</div>
		<div class="editor-button-group">
			<button
				v-for="p in WIDTH_PRESETS"
				:key="p.label"
				type="button"
				class="editor-group-btn"
				:class="{ active: isPresetActive( p.widths ) }"
				@click.stop="bandWidths = p.widths"
			>
				{{ p.label }}
			</button>
		</div>
		<div class="widths-bar" ref="widthsBar">
			<div class="widths-seg widths-seg-0" :style="{ width: dividerA + '%' }">
				<span v-if="dividerA >= 14">{{ Math.round( bandWidths[0] ) }}</span>
			</div>
			<div class="widths-seg widths-seg-1" :style="{ width: ( dividerB - dividerA ) + '%' }">
				<span v-if="( dividerB - dividerA ) >= 14">{{ Math.round( bandWidths[1] ) }}</span>
			</div>
			<div class="widths-seg widths-seg-2" :style="{ width: ( 100 - dividerB ) + '%' }">
				<span v-if="( 100 - dividerB ) >= 14">{{ Math.round( bandWidths[2] ) }}</span>
			</div>
			<div
				class="widths-handle"
				:style="{ left: dividerA + '%' }"
				@pointerdown.stop="startDividerDrag( 0, $event )"
				@pointermove.stop="moveDivider( $event )"
				@pointerup.stop="endDividerDrag()"
				@pointercancel.stop="endDividerDrag()"
				@keydown.left.prevent="nudgeDivider( 0, -1 )"
				@keydown.right.prevent="nudgeDivider( 0, 1 )"
				tabindex="0"
				role="slider"
				aria-label="Column 1 and 2 divider"
				aria-valuemin="0"
				aria-valuemax="100"
				:aria-valuenow="Math.round( dividerA )"
				title="Drag to split columns 1 and 2"
			></div>
			<div
				class="widths-handle"
				:style="{ left: dividerB + '%' }"
				@pointerdown.stop="startDividerDrag( 1, $event )"
				@pointermove.stop="moveDivider( $event )"
				@pointerup.stop="endDividerDrag()"
				@pointercancel.stop="endDividerDrag()"
				@keydown.left.prevent="nudgeDivider( 1, -1 )"
				@keydown.right.prevent="nudgeDivider( 1, 1 )"
				tabindex="0"
				role="slider"
				aria-label="Column 2 and 3 divider"
				aria-valuemin="0"
				aria-valuemax="100"
				:aria-valuenow="Math.round( dividerB )"
				title="Drag to split columns 2 and 3"
			></div>
		</div>
	</div>

	<!-- ROW (sets sharing a page and row band together) -->
	<div class="editor-field" v-if="!isRing && isSpotlightSheet">
		<div class="editor-label">Row</div>
		<div class="editor-button-group">
			<button
				type="button"
				class="editor-group-btn"
				:disabled="!canMoveUp"
				@click.stop="moveTraitSetUp"
				title="Move to previous row"
			>
				<i class="fas fa-arrow-up"></i>
			</button>
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: true }"
				title="Row number within the page"
			>
				{{ setRow }}
			</button>
			<button
				type="button"
				class="editor-group-btn"
				:disabled="!canMoveDown"
				@click.stop="moveTraitSetDown"
				title="Move to next row"
			>
				<i class="fas fa-arrow-down"></i>
			</button>
		</div>
		<div class="editor-field-hint" style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.3rem;">
			Row {{ setRow }} · Column {{ track }}{{ span > 1 ? '–' + Math.min( 3, track + span - 1 ) : '' }}
		</div>
	</div>

	<!-- FLEX -->
	<div class="editor-field" v-if="!isRing && isSpotlightSheet">
		<div class="editor-label">Flex</div>
		<div class="editor-button-group">
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: !flex }"
				@click.stop="flex = false"
			>
				Content
			</button>
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: flex }"
				@click.stop="flex = true"
			>
				Fill Stack
			</button>
		</div>
	</div>

	<!-- PANEL POSITION (SPAN 3 FULL-WIDTH) -->
	<div class="editor-field" v-if="span === 3">
		<div class="editor-label">Panel Position</div>
		<div class="editor-button-group">
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: editorDock === 'left' }"
				@click.stop="editorDock = 'left'"
			>
				Left
			</button>
			<button
				type="button"
				class="editor-group-btn"
				:class="{ active: editorDock === 'right' }"
				@click.stop="editorDock = 'right'"
			>
				Right
			</button>
		</div>
	</div>
</template>
