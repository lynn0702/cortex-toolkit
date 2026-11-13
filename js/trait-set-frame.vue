<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { TraitSet } from './model.ts';
import { resolveBorder, resolveFrame, buildBlockPath, buildPortraitFramePath } from './frame-geometry.ts';
import { resolveFrameColorPresentation } from './color-palette.ts';

const props = withDefaults(
	defineProps<{
		traitSet: TraitSet | any;
		headerMode?: string;
		hasHeader?: boolean;
		mode?: 'auto' | 'border' | 'portrait';
		width?: number;
		height?: number;
		headerWidth?: number;
		headerHeight?: number;
	}>(),
	{
		headerMode: 'top',
		hasHeader: true,
		mode: 'auto',
	},
);

const svgEl = ref<SVGSVGElement | null>(null);
const w = ref(100);
const h = ref(100);
const observedHeaderW = ref(30.4);
const observedHeaderH = ref(24);

let observer: ResizeObserver | null = null;

function updateSize() {
	const el = svgEl.value;
	if (!el) return;
	const host = el.parentElement;
	if (host) {
		const nextW = host.offsetWidth || host.clientWidth;
		const nextH = host.offsetHeight || host.clientHeight;
		if (nextW > 0) w.value = nextW;
		if (nextH > 0) h.value = nextH;

		const headerEl = host.querySelector(':scope > .trait-set-header') as HTMLElement | null;
		if (headerEl) {
			const hw = headerEl.offsetWidth || headerEl.clientWidth;
			const hh = headerEl.offsetHeight || headerEl.clientHeight;
			if (hw > 0) observedHeaderW.value = hw;
			if (hh > 0) observedHeaderH.value = hh;
		}
	}
}

onMounted(() => {
	nextTick(updateSize);
	if (typeof ResizeObserver !== 'undefined' && svgEl.value?.parentElement) {
		observer = new ResizeObserver(updateSize);
		observer.observe(svgEl.value.parentElement);
	}
});

onUnmounted(() => {
	if (observer) {
		observer.disconnect();
		observer = null;
	}
});

watch(
	() => [props.traitSet, props.headerMode, props.hasHeader, props.mode],
	() => nextTick(updateSize),
	{ deep: true },
);

const effectiveW = computed(() => (typeof props.width === 'number' && props.width > 0 ? props.width : w.value));
const effectiveH = computed(() => (typeof props.height === 'number' && props.height > 0 ? props.height : h.value));
const effectiveHeaderW = computed(() =>
	typeof props.headerWidth === 'number' && props.headerWidth > 0 ? props.headerWidth : observedHeaderW.value,
);
const effectiveHeaderH = computed(() =>
	typeof props.headerHeight === 'number' && props.headerHeight > 0 ? props.headerHeight : observedHeaderH.value,
);

const resolvedBorder = computed(() => resolveBorder(props.traitSet));
const resolvedFrame = computed(() => resolveFrame(props.traitSet));

const renderKind = computed<'block' | 'line' | 'portrait' | 'none'>(() => {
	const b = resolvedBorder.value;
	const f = resolvedFrame.value;
	if (props.mode === 'border') {
		if (b.shape === 'block') return 'block';
		if (b.shape === 'line') return 'line';
		return 'none';
	}
	if (props.mode === 'portrait') {
		return f && f.portraitShape !== 'none' ? 'portrait' : 'none';
	}
	if (b.shape === 'block' && b.explicit) return 'block';
	if (b.shape === 'line') return 'line';
	if (f && f.portraitShape !== 'none') return 'portrait';
	return 'none';
});

const shapeClass = computed(() => {
	const kind = renderKind.value;
	if (kind === 'block') return 'frame-block-svg';
	if (kind === 'line') return 'frame-line-svg';
	if (kind === 'portrait' && resolvedFrame.value) {
		return 'frame-radial-svg frame-' + resolvedFrame.value.portraitShape + '-svg';
	}
	return '';
});

const activeColorPresentation = computed(() => {
	const kind = renderKind.value;
	const rawColor =
		kind === 'block' || kind === 'line' ? resolvedBorder.value.color : resolvedFrame.value?.color || 'primary';
	return resolveFrameColorPresentation(rawColor);
});

const frameColorClass = computed(() => activeColorPresentation.value.className);

watch(
	[renderKind, activeColorPresentation],
	([kind, pres]) => {
		if (kind !== 'none' && pres.unknownToken) {
			console.warn(`[TraitSetFrame] Unknown frame color token "${pres.unknownToken}", falling back to primary`);
		}
	},
	{ immediate: true },
);

const frameStrokeStyle = computed(() => {
	const kind = renderKind.value;
	const isBorder = kind === 'block' || kind === 'line';
	const strokeWidth = isBorder ? resolvedBorder.value.stroke : resolvedFrame.value?.stroke || '2px';
	const dash = isBorder ? resolvedBorder.value.dash : resolvedFrame.value?.dash;
	const styles: Record<string, string> = {
		'--frame-stroke-width': strokeWidth,
		'--frame-stroke-dash': dash || 'none',
	};
	if (activeColorPresentation.value.customColor) {
		styles['--frame-color'] = activeColorPresentation.value.customColor;
	}
	return styles;
});

const viewBoxString = computed(() => {
	const kind = renderKind.value;
	if (kind === 'line') return `0 0 ${effectiveW.value} 12`;
	if (kind === 'block') return `0 0 ${effectiveW.value} ${effectiveH.value}`;
	return '0 0 100 100';
});

const perimeterPath = computed(() => {
	const kind = renderKind.value;
	if (kind === 'line') {
		return `M 0,6 L ${effectiveW.value},6`;
	}
	if (kind === 'block') {
		return buildBlockPath(resolvedBorder.value.corner, effectiveW.value, effectiveH.value);
	}
	if (kind === 'portrait' && resolvedFrame.value) {
		return buildPortraitFramePath(resolvedFrame.value.portraitShape, resolvedFrame.value.span);
	}
	return '';
});

const perimeterStyle = computed(() => {
	if (renderKind.value === 'block') {
		return resolvedBorder.value.tint ? { fill: resolvedBorder.value.tint } : undefined;
	}
	return { fill: 'none' };
});

const spinePath = computed(() => {
	if (renderKind.value !== 'block') return '';
	if (!props.hasHeader || props.headerMode === 'none') return '';
	const ew = effectiveW.value;
	const eh = effectiveH.value;
	if (props.headerMode === 'sidebar') {
		const hw = Math.max(8, Math.min(ew - 8, effectiveHeaderW.value));
		return `M ${hw},1 L ${hw},${eh - 1}`;
	}
	const hh = Math.max(8, Math.min(eh - 8, effectiveHeaderH.value));
	if (props.headerMode === 'bottom') {
		const y = eh - hh;
		return `M 1,${y} L ${ew - 1},${y}`;
	}
	return `M 1,${hh} L ${ew - 1},${hh}`;
});
</script>

<template>
	<svg
		ref="svgEl"
		class="trait-set-frame-svg"
		:class="[shapeClass, frameColorClass]"
		:style="frameStrokeStyle"
		aria-hidden="true"
		focusable="false"
		:viewBox="viewBoxString"
		preserveAspectRatio="none"
	>
		<path class="frame-perimeter-path" :d="perimeterPath" :style="perimeterStyle" vector-effect="non-scaling-stroke" />
		<path v-if="spinePath" class="frame-spine-path" :d="spinePath" fill="none" vector-effect="non-scaling-stroke" />
	</svg>
</template>
