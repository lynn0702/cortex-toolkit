<script setup lang="ts">
import { computed, ref } from 'vue';
import { getView } from './model.ts';
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	traitSet, traitSetID, character,
	placeLeft, placeWidth, placeTop, placeHeight,
} = injectTraitSetEditor();

const ROW_H = 18;

const pageOf = computed( () => Number( getView( traitSet.value )?.page ) || 1 );

// Same-page sets with explicit places, as ghost blocks behind the set.
const ghosts = computed( () => {
	const sets = character.value?.traitSets || [];
	const out: { name: string; left: number; top: number; width: number; height: number }[] = [];
	sets.forEach( ( s: any, i: number ) => {
		if ( i === traitSetID.value ) return;
		const view = getView( s );
		if ( ( Number( view?.page ) || 1 ) !== pageOf.value ) return;
		const p = view?.place;
		if ( !p || typeof p !== 'object' ) return;
		const left = Number( String( p.left ).replace( '%', '' ) );
		const width = Number( String( p.width ).replace( '%', '' ) );
		if ( !Number.isFinite( left ) || !Number.isFinite( width ) ) return;
		out.push( {
			name: s?.name || '',
			left, width,
			top: Number.isInteger( p.top ) && p.top >= 0 ? p.top : 0,
			height: Number.isInteger( p.height ) && p.height >= 1 ? p.height : 1,
		} );
	} );
	return out;
} );

const rows = computed( () => {
	let top = 2;
	const consider = ( t: number, h: number ) => { top = Math.max( top, t + h ); };
	ghosts.value.forEach( ( g ) => consider( g.top, g.height ) );
	consider( placeTop.value, placeHeight.value );
	return Math.max( 2, top + 1 );
} );

// Live drag preview; committed to the model on release (ring-drag pattern:
// no persist storm mid-gesture).
const preview = ref<{ left: number; width: number; top: number; height: number } | null>( null );
const shown = computed( () => preview.value || {
	left: placeLeft.value, width: placeWidth.value, top: placeTop.value, height: placeHeight.value,
} );

const rootEl = ref<HTMLElement | null>( null );

function startBlockDrag( event: MouseEvent | TouchEvent, mode: 'move' | 'resize' ) {
	event.preventDefault();
	const host = rootEl.value;
	if ( !host ) return;
	const rect = host.getBoundingClientRect();
	const startX = event instanceof MouseEvent ? event.clientX : event.touches[ 0 ].clientX;
	const startY = event instanceof MouseEvent ? event.clientY : event.touches[ 0 ].clientY;
	const base = { left: placeLeft.value, width: placeWidth.value, top: placeTop.value, height: placeHeight.value };
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
			preview.value = {
				left: Math.max( 0, Math.min( 100 - base.width, Math.round( base.left + dxPct ) ) ),
				width: base.width,
				top: Math.max( 0, Math.round( base.top + dyRows ) ),
				height: base.height,
			};
		} else {
			preview.value = {
				left: base.left,
				width: Math.max( 5, Math.min( 100 - base.left, Math.round( base.width + dxPct ) ) ),
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
		if ( moved && preview.value ) {
			const p = preview.value;
			placeLeft.value = p.left;
			placeTop.value = p.top;
			placeWidth.value = p.width;
			placeHeight.value = p.height;
		}
		preview.value = null;
	};

	window.addEventListener( 'mousemove', onMove );
	window.addEventListener( 'mouseup', onUp );
	window.addEventListener( 'touchmove', onMove, { passive: false } );
	window.addEventListener( 'touchend', onUp );
}
</script>

<template>
	<div
		ref="rootEl"
		class="place-mini"
		:style="'height: ' + (rows * ROW_H + 8) + 'px;'"
		role="application"
		aria-label="Page placement miniature: drag the block to move, drag its corner to resize"
	>
		<div
			v-for="(g, gi) in ghosts"
			:key="'ghost-' + gi"
			class="place-mini-ghost"
			:style="'left: ' + g.left + '%; top: ' + (g.top * ROW_H + 4) + 'px; width: ' + g.width + '%; height: ' + (g.height * ROW_H - 3) + 'px;'"
			:title="g.name"
		></div>
		<div
			class="place-mini-block"
			:style="'left: ' + shown.left + '%; top: ' + (shown.top * ROW_H + 4) + 'px; width: ' + shown.width + '%; height: ' + (shown.height * ROW_H - 3) + 'px;'"
			@mousedown="startBlockDrag($event, 'move')"
			@touchstart="startBlockDrag($event, 'move')"
			:title="'Drag to move · corner resizes'"
		>
			<span class="place-mini-name">{{ traitSet?.name }}</span>
			<span
				class="place-mini-handle"
				@mousedown.stop="startBlockDrag($event, 'resize')"
				@touchstart.stop="startBlockDrag($event, 'resize')"
			></span>
		</div>
		<div
			v-for="r in rows"
			:key="'row-' + r"
			class="place-mini-rowline"
			:style="'top: ' + ((r - 1) * ROW_H + 4) + 'px;'"
		></div>
	</div>
</template>
