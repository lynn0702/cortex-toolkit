<script setup lang="ts">
import { computed, ref } from 'vue';
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const { partCells, setPartCell } = injectTraitSetEditor();

const PART_TITLES: Record<string, string> = {
	name: 'Name', rating: 'Rating', description: 'Description', sfx: 'SFX',
	subtraits: 'Subtraits', stressLabel: 'Stress Label', stress: 'Stress'
};

// Cells grouped into visual rows by their top unit; dividers join adjacent
// cells of the same row. Widths change on the strip; top/height stay numeric.
const stripRows = computed( () => {
	const byTop = new Map<number, { key: string; left: number; width: number; top: number; height: number }[]>();
	for ( const cell of partCells.value ) {
		const row = byTop.get( cell.top ) || [];
		row.push( cell );
		byTop.set( cell.top, row );
	}
	return [ ...byTop.entries() ]
		.sort( ( a, b ) => a[ 0 ] - b[ 0 ] )
		.map( ( [ , cells ] ) => ( [ ...cells ].sort( ( a, b ) => a.left - b.left ) ) );
} );

const drag = ref<{ leftKey: string; rightKey: string; baseLeft: number; baseRight: number; baseSplit: number } | null>( null );

function startDividerDrag( event: MouseEvent | TouchEvent, leftKey: string, rightKey: string ) {
	event.preventDefault();
	event.stopPropagation();
	const left = partCells.value.find( ( c: any ) => c.key === leftKey );
	const right = partCells.value.find( ( c: any ) => c.key === rightKey );
	if ( !left || !right ) return;
	const startX = event instanceof MouseEvent ? event.clientX : event.touches[ 0 ].clientX;
	const track = ( event.target as HTMLElement ).closest( '.parts-strip-row' ) as HTMLElement | null;
	const trackW = track ? track.getBoundingClientRect().width : 1;
	const baseLeft = left.width;
	const baseRight = right.width;
	const baseSplit = right.left;
	let moved = false;

	const onMove = ( e: any ) => {
		const cx = e.clientX ?? e.touches?.[ 0 ]?.clientX;
		if ( cx === undefined ) return;
		if ( Math.abs( cx - startX ) < 3 && !moved ) return;
		moved = true;
		const dxPct = ( cx - startX ) / trackW * 100;
		const w1 = Math.max( 5, Math.round( ( baseLeft + dxPct ) * 10 ) / 10 );
		const w2 = Math.max( 5, Math.round( ( baseRight - dxPct ) * 10 ) / 10 );
		// The pair keeps its outer edges: the actually-moved amount is what
		// both sides could take.
		const take = Math.min( w1 - baseLeft, baseRight - w2 );
		drag.value = {
			leftKey, rightKey,
			baseLeft: Math.round( ( baseLeft + take ) * 10 ) / 10,
			baseRight: Math.round( ( baseRight - take ) * 10 ) / 10,
			baseSplit: Math.round( ( baseSplit + take ) * 10 ) / 10,
		};
	};

	const onUp = () => {
		window.removeEventListener( 'mousemove', onMove );
		window.removeEventListener( 'mouseup', onUp );
		window.removeEventListener( 'touchmove', onMove );
		window.removeEventListener( 'touchend', onUp );
		if ( moved && drag.value ) {
			setPartCell( drag.value.leftKey, 'width', drag.value.baseLeft );
			setPartCell( drag.value.rightKey, 'width', drag.value.baseRight );
			setPartCell( drag.value.rightKey, 'left', drag.value.baseSplit );
		}
		drag.value = null;
	};

	window.addEventListener( 'mousemove', onMove );
	window.addEventListener( 'mouseup', onUp );
	window.addEventListener( 'touchmove', onMove, { passive: false } );
	window.addEventListener( 'touchend', onUp );
}

function segWidth( key: string, fallback: number ) {
	if ( drag.value && ( drag.value.leftKey === key || drag.value.rightKey === key ) ) {
		return drag.value.leftKey === key ? drag.value.baseLeft : drag.value.baseRight;
	}
	return fallback;
}

function segLeft( key: string, fallback: number ) {
	if ( drag.value && drag.value.rightKey === key ) return drag.value.baseSplit;
	return fallback;
}
</script>

<template>
	<div class="parts-strip" role="application" aria-label="Trait row cells: drag dividers to change widths">
		<div
			v-for="(row, ri) in stripRows"
			:key="'srow-' + ri"
			class="parts-strip-row"
		>
			<template v-for="(cell, ci) in row" :key="cell.key">
				<div
					class="parts-strip-seg"
					:style="'left: ' + segLeft(cell.key, cell.left) + '%; width: ' + segWidth(cell.key, cell.width) + '%;'"
					:title="(PART_TITLES[cell.key] || cell.key) + ' ' + cell.width + '%'"
				>
					<span class="parts-strip-name">{{ PART_TITLES[cell.key] || cell.key }}</span>
				</div>
				<div
					v-if="ci < row.length - 1"
					class="parts-strip-divider"
					:style="'left: calc(' + segLeft(row[ci + 1].key, row[ci + 1].left) + '% - 4px);'"
					@mousedown="startDividerDrag($event, cell.key, row[ci + 1].key)"
					@touchstart="startDividerDrag($event, cell.key, row[ci + 1].key)"
				></div>
			</template>
		</div>
	</div>
</template>
