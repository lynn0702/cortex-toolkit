<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { getView } from './model.ts';
import { resolveFrame, buildBlockPath, buildRadialShapePath, type FrameConfig } from './frame-geometry.ts';

const props = withDefaults(
	defineProps<{
		traitSet: any;
		headerMode?: 'sidebar' | 'top';
		hasHeader?: boolean;
		width?: number;
		height?: number;
		headerWidth?: number;
		headerHeight?: number;
	}>(),
	{
		headerMode: undefined,
		hasHeader: undefined,
		width: undefined,
		height: undefined,
		headerWidth: undefined,
		headerHeight: undefined,
	},
);

const svgEl = ref<SVGSVGElement | null>(null);
const w = ref<number>(props.width ?? 100);
const h = ref<number>(props.height ?? 100);
const observedHeaderW = ref<number | null>(null);
const observedHeaderH = ref<number | null>(null);

let ro: ResizeObserver | null = null;

function updateDimensions(el: HTMLElement) {
	const newW = Math.max(1, Math.round(el.offsetWidth));
	const newH = Math.max(1, Math.round(el.offsetHeight));
	if ((newW > 0 && newW !== w.value) || (newH > 0 && newH !== h.value)) {
		w.value = newW;
		h.value = newH;
	}

	const headerEl = el.querySelector('.trait-set-header') as HTMLElement | null;
	if (headerEl) {
		const hw = Math.round(headerEl.offsetWidth * 100) / 100;
		const hh = Math.round(headerEl.offsetHeight * 100) / 100;
		if (hw > 0 && hw !== observedHeaderW.value) observedHeaderW.value = hw;
		if (hh > 0 && hh !== observedHeaderH.value) observedHeaderH.value = hh;
	}
}

onMounted(() => {
	const parent = svgEl.value?.parentElement;
	if (parent) {
		updateDimensions(parent);
		if (typeof ResizeObserver !== 'undefined') {
			ro = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const cr = entry.contentRect;
					if (cr && cr.width > 0 && cr.height > 0) {
						const rw = Math.max(1, Math.round(cr.width));
						const rh = Math.max(1, Math.round(cr.height));
						if (rw !== w.value || rh !== h.value) {
							w.value = rw;
							h.value = rh;
						}
						const headerEl = parent.querySelector('.trait-set-header') as HTMLElement | null;
						if (headerEl) {
							const hw = Math.round(headerEl.offsetWidth * 100) / 100;
							const hh = Math.round(headerEl.offsetHeight * 100) / 100;
							if (hw > 0 && hw !== observedHeaderW.value) observedHeaderW.value = hw;
							if (hh > 0 && hh !== observedHeaderH.value) observedHeaderH.value = hh;
						}
					} else {
						updateDimensions(parent);
					}
				}
			});
			ro.observe(parent);
		}
	}
});

onBeforeUnmount(() => {
	if (ro) {
		ro.disconnect();
		ro = null;
	}
});

const resolvedFrame = computed<FrameConfig | null>(() => resolveFrame(props.traitSet));

const shape = computed(() => resolvedFrame.value?.shape || 'block');

const isBlock = computed(() => shape.value === 'block');
const isLine = computed(() => shape.value === 'line');
const isRadial = computed(
	() => shape.value === 'ring' || shape.value === 'ellipse' || shape.value === 'arc' || (shape.value as any) === 'path',
);

const headerModeComputed = computed(() => {
	if (props.headerMode) return props.headerMode;
	return getView(props.traitSet)?.header === 'top' ? 'top' : 'sidebar';
});

const hasHeaderComputed = computed(() => {
	if (props.hasHeader !== undefined) return props.hasHeader;
	return Boolean(props.traitSet?.name);
});

const VALID_COLORS = ['primary', 'accent', 'muted', 'strong', 'black'];
const frameColorClass = computed(() => {
	const raw = resolvedFrame.value?.color || 'primary';
	if (VALID_COLORS.includes(raw)) {
		return 'frame-color-' + raw;
	}
	console.warn(`[frame] Unrecognized color token "${raw}", falling back to "primary"`);
	return 'frame-color-primary';
});

const frameStrokeStyle = computed(() => {
	const f = resolvedFrame.value;
	if (!f) return undefined;
	const style: Record<string, string> = {};
	if (f.stroke) {
		style['--frame-stroke-width'] = f.stroke;
	}
	if (f.dash) {
		style['--frame-stroke-dash'] = f.dash;
	}
	return Object.keys(style).length > 0 ? style : undefined;
});

const shapeClass = computed(() => {
	if (isBlock.value) return 'frame-block-svg';
	if (isLine.value) return 'frame-line-svg';
	return 'frame-radial-svg';
});

const viewBoxString = computed(() => {
	if (isBlock.value) return `0 0 ${w.value} ${h.value}`;
	if (isLine.value) return `0 0 ${w.value} 12`;
	return '0 0 100 100';
});

const boxPath = computed(() => {
	if (!resolvedFrame.value || !resolvedFrame.value.box) return '';
	if (!isRadial.value) return '';
	return buildBlockPath(resolvedFrame.value.corner, 100, 100);
});

const perimeterPath = computed(() => {
	if (!resolvedFrame.value) return '';
	if (resolvedFrame.value.path) return resolvedFrame.value.path;

	if (isLine.value) {
		return `M 0,6 L ${w.value},6`;
	}

	if (isBlock.value) {
		return buildBlockPath(resolvedFrame.value.corner, w.value, h.value);
	}

	return buildRadialShapePath(resolvedFrame.value);
});

const spinePath = computed(() => {
	if (!isBlock.value || !hasHeaderComputed.value) return '';

	if (headerModeComputed.value === 'sidebar') {
		const hw = props.headerWidth ?? observedHeaderW.value ?? 30.39;
		return `M ${hw},1 L ${hw},${h.value - 1}`;
	}

	if (headerModeComputed.value === 'top') {
		const hh = props.headerHeight ?? observedHeaderH.value ?? 32.39;
		return `M 1,${hh} L ${w.value - 1},${hh}`;
	}

	return '';
});

const perimeterStyle = computed(() => {
	if (!isBlock.value) return undefined;
	const view = getView(props.traitSet);
	const tint = view?.tint || (view as any)?.background;
	return {
		fill: tint || 'var(--bg-surface-card, #ffffff)',
	};
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
		<!-- Box path for radial shapes with box: true -->
		<path v-if="boxPath" class="frame-box-path" :d="boxPath" fill="none" vector-effect="non-scaling-stroke" />
		<!-- Perimeter / background fill -->
		<path class="frame-perimeter-path" :d="perimeterPath" :style="perimeterStyle" vector-effect="non-scaling-stroke" />
		<!-- Spine line for block with header (sidebar or top) -->
		<path v-if="spinePath" class="frame-spine-path" :d="spinePath" fill="none" vector-effect="non-scaling-stroke" />
	</svg>
</template>
