<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { getView } from './model.ts';
import { resolveFrame, buildFrameSvgPath, type FrameConfig } from './frame-geometry.ts';

const props = withDefaults( defineProps<{
	traitSet: any;
	headerMode?: 'sidebar' | 'top';
	hasHeader?: boolean;
	width?: number;
	height?: number;
	headerWidth?: number;
	headerHeight?: number;
}>(), {
	headerMode: undefined,
	hasHeader: undefined,
	width: undefined,
	height: undefined,
	headerWidth: undefined,
	headerHeight: undefined
} );

const svgEl = ref<SVGSVGElement | null>( null );
const w = ref<number>( props.width ?? 100 );
const h = ref<number>( props.height ?? 100 );
const observedHeaderW = ref<number | null>( null );
const observedHeaderH = ref<number | null>( null );

let ro: ResizeObserver | null = null;

function updateDimensions( el: HTMLElement ) {
	const newW = Math.max( 1, Math.round( el.offsetWidth ) );
	const newH = Math.max( 1, Math.round( el.offsetHeight ) );
	if ( ( newW > 0 && newW !== w.value ) || ( newH > 0 && newH !== h.value ) ) {
		w.value = newW;
		h.value = newH;
	}

	const headerEl = el.querySelector( '.trait-set-header' ) as HTMLElement | null;
	if ( headerEl ) {
		const hw = Math.round( headerEl.offsetWidth * 100 ) / 100;
		const hh = Math.round( headerEl.offsetHeight * 100 ) / 100;
		if ( hw > 0 && hw !== observedHeaderW.value ) observedHeaderW.value = hw;
		if ( hh > 0 && hh !== observedHeaderH.value ) observedHeaderH.value = hh;
	}
}

onMounted( () => {
	const parent = svgEl.value?.parentElement;
	if ( parent ) {
		updateDimensions( parent );
		if ( typeof ResizeObserver !== 'undefined' ) {
			ro = new ResizeObserver( ( entries ) => {
				for ( const entry of entries ) {
					const cr = entry.contentRect;
					if ( cr && cr.width > 0 && cr.height > 0 ) {
						const rw = Math.max( 1, Math.round( cr.width ) );
						const rh = Math.max( 1, Math.round( cr.height ) );
						if ( rw !== w.value || rh !== h.value ) {
							w.value = rw;
							h.value = rh;
						}
						const headerEl = parent.querySelector( '.trait-set-header' ) as HTMLElement | null;
						if ( headerEl ) {
							const hw = Math.round( headerEl.offsetWidth * 100 ) / 100;
							const hh = Math.round( headerEl.offsetHeight * 100 ) / 100;
							if ( hw > 0 && hw !== observedHeaderW.value ) observedHeaderW.value = hw;
							if ( hh > 0 && hh !== observedHeaderH.value ) observedHeaderH.value = hh;
						}
					} else {
						updateDimensions( parent );
					}
				}
			} );
			ro.observe( parent );
		}
	}
} );

onBeforeUnmount( () => {
	if ( ro ) {
		ro.disconnect();
		ro = null;
	}
} );

const resolvedFrame = computed<FrameConfig | null>( () => resolveFrame( props.traitSet ) );

const shape = computed( () => resolvedFrame.value?.shape || 'block' );

const isBlock = computed( () => shape.value === 'block' );
const isLine = computed( () => shape.value === 'line' );
const isRadial = computed( () =>
	shape.value === 'ring' || shape.value === 'ellipse' || shape.value === 'arc' || ( shape.value as any ) === 'path'
);

const headerModeComputed = computed( () => {
	if ( props.headerMode ) return props.headerMode;
	return getView( props.traitSet )?.header === 'top' ? 'top' : 'sidebar';
} );

const hasHeaderComputed = computed( () => {
	if ( props.hasHeader !== undefined ) return props.hasHeader;
	return Boolean( props.traitSet?.name ) && shape.value !== 'line';
} );

const VALID_STROKES = [ 'primary', 'accent', 'muted', 'strong', 'dashed' ];
const frameStrokeClass = computed( () => {
	const raw = resolvedFrame.value?.stroke || 'primary';
	if ( VALID_STROKES.includes( raw ) ) {
		return 'frame-stroke-' + raw;
	}
	console.warn( `[frame] Unrecognized stroke token "${ raw }", falling back to "primary"` );
	return 'frame-stroke-primary';
} );

const shapeClass = computed( () => {
	if ( isBlock.value ) return 'frame-block-svg';
	if ( isLine.value ) return 'frame-line-svg';
	return 'frame-radial-svg';
} );

const viewBoxString = computed( () => {
	if ( isBlock.value ) return `0 0 ${ w.value } ${ h.value }`;
	if ( isLine.value ) return `0 0 ${ w.value } 12`;
	return '0 0 100 100';
} );

const perimeterPath = computed( () => {
	if ( !resolvedFrame.value ) return '';
	if ( resolvedFrame.value.path ) return resolvedFrame.value.path;

	if ( isLine.value ) {
		return `M 0,6 L ${ w.value },6`;
	}

	if ( isBlock.value ) {
		const width = w.value;
		const height = h.value;
		if ( resolvedFrame.value.corner === 'cut' ) {
			return `M 6,1 L ${ width - 6 },1 L ${ width - 1 },6 L ${ width - 1 },${ height - 6 } L ${ width - 6 },${ height - 1 } L 6,${ height - 1 } L 1,${ height - 6 } L 1,6 Z`;
		}
		// Measured classic baseline radius is 4px
		let r = 4;
		if ( typeof resolvedFrame.value.corner === 'number' && resolvedFrame.value.corner !== 8 ) {
			r = Math.min( Math.min( ( width - 2 ) / 2, ( height - 2 ) / 2 ), Math.max( 0, resolvedFrame.value.corner ) );
		}
		if ( r <= 0 ) {
			return `M 1,1 L ${ width - 1 },1 L ${ width - 1 },${ height - 1 } L 1,${ height - 1 } Z`;
		}
		return `M ${ 1 + r },1 L ${ width - 1 - r },1 Q ${ width - 1 },1 ${ width - 1 },${ 1 + r } L ${ width - 1 },${ height - 1 - r } Q ${ width - 1 },${ height - 1 } ${ width - 1 - r },${ height - 1 } L ${ 1 + r },${ height - 1 } Q 1,${ height - 1 } 1,${ height - 1 - r } L 1,${ 1 + r } Q 1,1 ${ 1 + r },1 Z`;
	}

	return buildFrameSvgPath( resolvedFrame.value );
} );

const spinePath = computed( () => {
	if ( !isBlock.value || !hasHeaderComputed.value ) return '';

	if ( headerModeComputed.value === 'sidebar' ) {
		const hw = props.headerWidth ?? observedHeaderW.value ?? 30.39;
		return `M ${ hw },1 L ${ hw },${ h.value - 1 }`;
	}

	if ( headerModeComputed.value === 'top' ) {
		const hh = props.headerHeight ?? observedHeaderH.value ?? 32.39;
		return `M 1,${ hh } L ${ w.value - 1 },${ hh }`;
	}

	return '';
} );

const perimeterStyle = computed( () => {
	if ( !isBlock.value ) return undefined;
	const view = getView( props.traitSet );
	const tint = view?.tint || ( view as any )?.background;
	return {
		fill: tint || 'var(--bg-surface-card, #ffffff)'
	};
} );
</script>

<template>
	<svg
		ref="svgEl"
		class="trait-set-frame-svg"
		:class="[shapeClass, frameStrokeClass]"
		aria-hidden="true"
		focusable="false"
		:viewBox="viewBoxString"
		preserveAspectRatio="none"
	>
		<!-- Perimeter / background fill -->
		<path
			class="frame-perimeter-path"
			:d="perimeterPath"
			:style="perimeterStyle"
			vector-effect="non-scaling-stroke"
		/>
		<!-- Spine line for block with header (sidebar or top) -->
		<path
			v-if="spinePath"
			class="frame-spine-path"
			:d="spinePath"
			fill="none"
			vector-effect="non-scaling-stroke"
		/>
	</svg>
</template>

