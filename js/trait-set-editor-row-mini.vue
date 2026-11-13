<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import { getView } from './model.ts';
import { partsGrid, formatPct, parsePct } from './sheet-grid.ts';
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	traitSet,
	effectivePartCells,
	setPartCell,
	removePartCell,
	hasCustomParts,
	partPreview,
	headerMode,
	headerAlign,
	imageWidth,
	imageHeight,
	branchShares,
	setBranchShare,
} = injectTraitSetEditor();

const PART_TITLES: Record<string, string> = {
	name: 'Name',
	rating: 'Rating',
	description: 'Description',
	badge: 'Badge',
	block: 'Block',
	subtraits: 'Subtraits',
	trackLabel: 'Track Label',
	track: 'Track',
};

function partBoxLabel(key: string): string {
	const setNoun = (traitSet.value as any)?.noun || (traitSet.value as any)?.name || 'Trait';
	const trackNoun = getView(traitSet.value)?.labels?.track || 'Stress';
	if (key === 'trackLabel') return `${trackNoun} · Label`;
	if (key === 'track') return `${trackNoun} · Rating`;
	if (key.startsWith('child:')) {
		const segs = key.slice(6).split(':');
		const cNoun = segs[0] || 'Subtrait';
		const cKind = segs[1] === 'rating' ? 'Rating' : 'Label';
		return `${cNoun} · ${cKind}`;
	}
	if (key === 'subtraits') {
		let sNoun = 'Subtrait';
		for (const t of (traitSet.value as any)?.traits || []) {
			for (const sub of t?.traits || []) {
				const cand = (sub?.noun || sub?.name || '').trim();
				if (cand && cand.toLowerCase() !== trackNoun.toLowerCase() && !characterCurioFunctions.isSfxContainer(sub)) {
					sNoun = cand;
					break;
				}
			}
			if (sNoun !== 'Subtrait') break;
		}
		return `${sNoun} · Subtraits`;
	}
	return `${setNoun} · ${PART_TITLES[key] || key}`;
}

const NON_ROW = ['image', 'pips', 'portrait-ring'];

const bodyOf = computed(() => getView(traitSet.value)?.style?.body);
const isBranchBody = computed(() => bodyOf.value === 'subtrait-columns');
const isNonRowBody = computed(
	() => typeof bodyOf.value === 'string' && (NON_ROW as readonly string[]).includes(bodyOf.value),
);
// Generic part boxes show only where the grid drives; branch sets get
// branch boxes instead (stored part cells there stay JSON-side: the
// flex renderer would ignore them, so the miniature must not offer
// them as live controls).
const showGenericBoxes = computed(() => !isBranchBody.value && boxes.value.boxes.length > 0);

const isImageBody = computed(() => bodyOf.value === 'image');
const imageWidthPct = computed(() => parsePct(imageWidth.value) ?? 100);
const imageHeightPx = computed(() => {
	const m = String(imageHeight.value || '').match(/^(\d+(?:\.\d+)?)px$/);
	return m ? Number(m[1]) : 140;
});
const imageDrag = ref<{ width: number; height: number } | null>(null);

// Resize the image block from the miniature: width in 5% steps, height in
// 10px steps, written to the same imageConfig the sheet renders.
function startImageDrag(event: MouseEvent | TouchEvent, mode: 'w' | 'h') {
	event.preventDefault();
	event.stopPropagation();
	const host = imageHostEl.value;
	if (!host) return;
	const hostW = host.getBoundingClientRect().width || 1;
	const startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
	const startY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
	const baseW = imageWidthPct.value;
	const baseH = imageHeightPx.value;
	let moved = false;

	const onMove = (e: any) => {
		const cx = e.clientX ?? e.touches?.[0]?.clientX;
		const cy = e.clientY ?? e.touches?.[0]?.clientY;
		if (cx === undefined || cy === undefined) return;
		moved = true;
		const w = mode === 'w' ? Math.round((baseW + ((cx - startX) / hostW) * 100) / 5) * 5 : baseW;
		const h = mode === 'h' ? Math.round((baseH + (cy - startY)) / 10) * 10 : baseH;
		imageDrag.value = { width: Math.max(10, Math.min(100, w)), height: Math.max(40, Math.min(480, h)) };
	};

	const onUp = () => {
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('mouseup', onUp);
		window.removeEventListener('touchmove', onMove);
		window.removeEventListener('touchend', onUp);
		const d = imageDrag.value;
		imageDrag.value = null;
		if (!moved || !d) return;
		if (mode === 'w') imageWidth.value = formatPct(d.width);
		else imageHeight.value = d.height + 'px';
	};

	window.addEventListener('mousemove', onMove);
	window.addEventListener('mouseup', onUp);
	window.addEventListener('touchmove', onMove, { passive: false });
	window.addEventListener('touchend', onUp);
}

const branchView = computed(() => branchShares());

// Branch column shares for split rows (left | skill | right around the
// fixed link): normalized to the row for display, dragged in fr units
// with the pair sum conserved. Always shown for branch sets; stored
// shares render wherever a split row does.
const branch = computed(() => {
	const s = branchShares();
	const total = s.left + s.center + s.right || 1;
	return {
		left: (s.left / total) * 100,
		center: (s.center / total) * 100,
		right: (s.right / total) * 100,
		implicit: s.implicit,
		sum: total,
	};
});

const branchDrag = ref<{
	leftKey: 'left' | 'center';
	rightKey: 'center' | 'right';
	left: number;
	center: number;
	right: number;
} | null>(null);

function branchShown(key: 'left' | 'center' | 'right') {
	if (branchDrag.value) return branchDrag.value[key];
	const b = branch.value;
	return b[key];
}

function startBranchDivider(event: MouseEvent | TouchEvent, leftKey: 'left' | 'center', rightKey: 'center' | 'right') {
	event.preventDefault();
	event.stopPropagation();
	const track = (event.target as HTMLElement).closest('.branch-mini') as HTMLElement | null;
	const trackW = track ? track.getBoundingClientRect().width : 1;
	const b = branch.value;
	const startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
	const baseL = leftKey === 'left' ? b.left : b.center;
	const baseR = rightKey === 'center' ? b.center : b.right;
	const sum = b.sum;
	let moved = false;

	const toFr = (pct: number) => Math.round((pct / 100) * sum * 10) / 10;
	const onMove = (e: any) => {
		const cx = e.clientX ?? e.touches?.[0]?.clientX;
		if (cx === undefined) return;
		if (Math.abs(cx - startX) < 3 && !moved) return;
		moved = true;
		const dxPct = ((cx - startX) / trackW) * 100;
		const pair = baseL + baseR;
		let nl = Math.max(2, Math.min(pair - 2, baseL + dxPct));
		nl = Math.round(nl * 10) / 10;
		const nr = Math.round((pair - nl) * 10) / 10;
		branchDrag.value = {
			leftKey,
			rightKey,
			left: leftKey === 'left' ? nl : b.left,
			center: leftKey === 'left' ? nr : rightKey === 'center' ? nr : nl,
			right: rightKey === 'right' ? nr : b.right,
		};
	};

	const onUp = () => {
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('mouseup', onUp);
		window.removeEventListener('touchmove', onMove);
		window.removeEventListener('touchend', onUp);
		const d = branchDrag.value;
		branchDrag.value = null;
		if (!moved || !d) return;
		setBranchShare(leftKey, toFr(leftKey === 'left' ? d.left : d.center));
		setBranchShare(rightKey, toFr(rightKey === 'center' ? d.center : d.right));
	};

	window.addEventListener('mousemove', onMove);
	window.addEventListener('mouseup', onUp);
	window.addEventListener('touchmove', onMove, { passive: false });
	window.addEventListener('touchend', onUp);
}

const ROW_H = 30;
const TOP_ZONE = 34;
const SIDE_ZONE = 48;

const isTop = computed(() => headerMode.value === 'top');
const isBottom = computed(() => headerMode.value === 'bottom');
const isSidebar = computed(() => headerMode.value === 'sidebar');
const isNone = computed(() => headerMode.value === 'none');
const align = computed(() => headerAlign.value);
const setName = computed(() => (traitSet.value as any)?.name || '');

// Shared hinder banner (distinctions sets): section chrome with no

function cycleAlign() {
	headerAlign.value = align.value === 'left' ? 'center' : align.value === 'center' ? 'right' : 'left';
}

// Every stored part as a box, arranged as the sheet renders it: the same
// grid math (columns from part edges, rows from top/height) the renderer
// uses, so the miniature's arrangement and the rendered row agree.
const boxes = computed(() => {
	const eff = effectivePartCells.value.map((c: any) => {
		if (partPreview.value && partPreview.value.key === c.key) {
			const p = partPreview.value;
			return { key: c.key, left: p.left, width: p.width, top: p.top, height: p.height, implicit: false };
		}
		return { key: c.key, left: c.left, width: c.width, top: c.top, height: c.height, implicit: Boolean(c.implicit) };
	});
	const map: Record<string, { left: string; top: number; width: string; height: number }> = {};
	for (const b of eff) {
		map[b.key] = { left: formatPct(b.left), top: b.top, width: formatPct(b.width), height: b.height };
	}
	const grid = partsGrid(map);
	let rows = 1;
	for (const b of eff) {
		rows = Math.max(rows, b.top + b.height);
	}
	return { boxes: eff, grid, rows };
});

const gridTemplate = computed(() => {
	const cols = boxes.value.grid?.columns?.length ? boxes.value.grid.columns : [100];
	return cols.map((c: number) => Math.round(c * 1000) / 1000 + '%').join(' ');
});

function cellPlace(key: string) {
	const cell = boxes.value.grid?.cells?.[key];
	if (!cell) return '';
	return `grid-column: ${cell.col} / span ${cell.span}; grid-row: ${cell.row} / span ${cell.rowSpan}; min-width: 0;`;
}

const rootEl = ref<HTMLElement | null>(null);
const imageHostEl = ref<HTMLElement | null>(null);
const sectionEl = ref<HTMLElement | null>(null);

const snapPct = (n: number) => Math.round(n * 2) / 2;

function startBoxDrag(event: MouseEvent | TouchEvent, key: string, mode: 'move' | 'w' | 'h') {
	event.preventDefault();
	event.stopPropagation();
	const host = rootEl.value;
	if (!host) return;
	const rect = host.getBoundingClientRect();
	const startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
	const startY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
	const cell = effectivePartCells.value.find((c: any) => c.key === key);
	if (!cell) return;
	const base = { left: cell.left, width: cell.width, top: cell.top, height: cell.height };
	let moved = false;

	const onMove = (e: any) => {
		const cx = e.clientX ?? e.touches?.[0]?.clientX;
		const cy = e.clientY ?? e.touches?.[0]?.clientY;
		if (cx === undefined || cy === undefined) return;
		if (Math.hypot(cx - startX, cy - startY) < 3 && !moved) return;
		moved = true;
		const dxPct = ((cx - startX) / rect.width) * 100;
		const dyRows = (cy - startY) / ROW_H;
		if (mode === 'move') {
			partPreview.value = {
				key,
				left: snapPct(Math.max(0, Math.min(100 - base.width, base.left + dxPct))),
				width: base.width,
				top: Math.max(0, Math.round(base.top + dyRows)),
				height: base.height,
			};
		} else if (mode === 'w') {
			partPreview.value = {
				key,
				left: base.left,
				width: snapPct(Math.max(5, Math.min(100 - base.left, base.width + dxPct))),
				top: base.top,
				height: base.height,
			};
		} else {
			partPreview.value = {
				key,
				left: base.left,
				width: base.width,
				top: base.top,
				height: Math.max(1, Math.round(base.height + dyRows)),
			};
		}
	};

	const onUp = () => {
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('mouseup', onUp);
		window.removeEventListener('touchmove', onMove);
		window.removeEventListener('touchend', onUp);
		if (moved && partPreview.value) {
			const p = partPreview.value;
			if (p.left !== cell.left) setPartCell(key, 'left', p.left);
			if (p.width !== cell.width) setPartCell(key, 'width', p.width);
			if (p.top !== cell.top) setPartCell(key, 'top', p.top);
			if (p.height !== cell.height) setPartCell(key, 'height', p.height);
		}
		partPreview.value = null;
	};

	window.addEventListener('mousemove', onMove);
	window.addEventListener('mouseup', onUp);
	window.addEventListener('touchmove', onMove, { passive: false });
	window.addEventListener('touchend', onUp);
}

// Set header placement + alignment, dragged on the section canvas: drop
// in the top or bottom slot for a horizontal bar (the drop third aims the text),
// or in the side slot for a sidebar. A click with no drag cycles the alignment.
const headerDrag = ref<{
	dx: number;
	dy: number;
	zone: 'top' | 'bottom' | 'side' | null;
	third: 'left' | 'center' | 'right';
} | null>(null);

function zoneOf(cx: number, cy: number) {
	const sec = sectionEl.value;
	if (!sec) return { zone: null as 'top' | 'bottom' | 'side' | null, third: align.value };
	const r = sec.getBoundingClientRect();
	const x = cx - r.left;
	const y = cy - r.top;
	const edgeBand = Math.min(TOP_ZONE, Math.max(18, r.height * 0.35));
	const third = (x < r.width / 3 ? 'left' : x > (r.width * 2) / 3 ? 'right' : 'center') as 'left' | 'center' | 'right';
	if (y < edgeBand) {
		return { zone: 'top' as const, third };
	}
	if (y > r.height - edgeBand) {
		return { zone: 'bottom' as const, third };
	}
	if (x < SIDE_ZONE) {
		return { zone: 'side' as const, third: align.value };
	}
	return { zone: null as 'top' | 'bottom' | 'side' | null, third: align.value };
}

function startHeaderDrag(event: MouseEvent | TouchEvent) {
	event.preventDefault();
	event.stopPropagation();
	if (!sectionEl.value) return;
	const startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
	const startY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
	let moved = false;

	const onMove = (e: any) => {
		const cx = e.clientX ?? e.touches?.[0]?.clientX;
		const cy = e.clientY ?? e.touches?.[0]?.clientY;
		if (cx === undefined || cy === undefined) return;
		if (Math.hypot(cx - startX, cy - startY) < 3 && !moved) return;
		moved = true;
		const z = zoneOf(cx, cy);
		headerDrag.value = { dx: cx - startX, dy: cy - startY, zone: z.zone, third: z.third };
	};

	const onUp = () => {
		window.removeEventListener('mousemove', onMove);
		window.removeEventListener('mouseup', onUp);
		window.removeEventListener('touchmove', onMove);
		window.removeEventListener('touchend', onUp);
		const drag = headerDrag.value;
		headerDrag.value = null;
		if (!moved) {
			cycleAlign();
			return;
		}
		if (!drag || !drag.zone) return;
		if (drag.zone === 'top' || drag.zone === 'bottom') {
			headerMode.value = drag.zone;
			headerAlign.value = drag.third;
		} else if (drag.zone === 'side') {
			headerMode.value = 'sidebar';
		}
	};

	window.addEventListener('mousemove', onMove);
	window.addEventListener('mouseup', onUp);
	window.addEventListener('touchmove', onMove, { passive: false });
	window.addEventListener('touchend', onUp);
}

const headerTitle = computed(() => {
	const posLabel = isTop.value ? 'Top bar' : isBottom.value ? 'Bottom bar' : 'Sidebar';
	return 'Header · ' + posLabel + ' · ' + align.value + ' — drag to top, bottom, or side; click to cycle alignment';
});

onUnmounted(() => {
	partPreview.value = null;
});

function onHeaderKeydown(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		cycleAlign();
	} else if (event.key === 'ArrowUp') {
		event.preventDefault();
		headerMode.value = 'top';
	} else if (event.key === 'ArrowDown') {
		event.preventDefault();
		headerMode.value = 'bottom';
	} else if (event.key === 'ArrowLeft') {
		event.preventDefault();
		if (headerMode.value === 'sidebar') return;
		if (headerAlign.value === 'left') {
			headerMode.value = 'sidebar';
		} else {
			headerAlign.value = 'left';
		}
	} else if (event.key === 'ArrowRight') {
		event.preventDefault();
		if (headerMode.value === 'sidebar') {
			headerMode.value = 'top';
			headerAlign.value = 'left';
		} else {
			headerAlign.value = 'right';
		}
	}
}

function onBoxKeydown(event: KeyboardEvent, key: string) {
	const cells = effectivePartCells.value as Array<{
		key: string;
		left: number;
		width: number;
		top: number;
		height: number;
	}>;
	const cell = cells.find((c) => c.key === key);
	if (!cell) return;

	if (event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
		event.preventDefault();
		const delta = event.key === 'ArrowLeft' ? -5 : 5;
		const nextWidth = snapPct(Math.max(5, Math.min(100 - cell.left, cell.width + delta)));
		if (nextWidth !== cell.width) {
			setPartCell(key, 'width', nextWidth);
		}
		return;
	}

	if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
		event.preventDefault();
		const sameRow = cells.filter((c) => c.top === cell.top).sort((a, b) => a.left - b.left);
		const idx = sameRow.findIndex((c) => c.key === key);
		const neighbor = event.key === 'ArrowLeft' ? sameRow[idx - 1] : sameRow[idx + 1];
		if (!neighbor) return;
		const first = event.key === 'ArrowLeft' ? neighbor : cell;
		const second = event.key === 'ArrowLeft' ? cell : neighbor;
		const gap = Math.max(0, second.left - (first.left + first.width));
		const nextSecondLeft = first.left;
		const nextFirstLeft = Math.min(100 - first.width, first.left + second.width + gap);
		setPartCell(second.key, 'left', nextSecondLeft);
		setPartCell(first.key, 'left', nextFirstLeft);
		return;
	}

	if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
		event.preventDefault();
		if (event.key === 'ArrowUp') {
			if (cell.top > 0) {
				setPartCell(key, 'top', cell.top - 1);
			}
			return;
		}
		const sameRowCount = cells.filter((c) => c.top === cell.top).length;
		const maxTop = cells.reduce((m, c) => Math.max(m, c.top), 0);
		if (sameRowCount > 1 || cell.top < maxTop) {
			setPartCell(key, 'top', cell.top + 1);
		}
	}
}

function onImageKeydown(event: KeyboardEvent) {
	if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
		event.preventDefault();
		const delta = event.key === 'ArrowLeft' ? -5 : 5;
		const w = Math.max(10, Math.min(100, Math.round((imageWidthPct.value + delta) / 5) * 5));
		imageWidth.value = formatPct(w);
	} else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
		event.preventDefault();
		const delta = event.key === 'ArrowUp' ? -10 : 10;
		const h = Math.max(40, Math.min(480, Math.round((imageHeightPx.value + delta) / 10) * 10));
		imageHeight.value = h + 'px';
	}
}

function onBranchDividerKeydown(event: KeyboardEvent, leftKey: 'left' | 'center', rightKey: 'center' | 'right') {
	if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
	event.preventDefault();
	const deltaPct = event.key === 'ArrowLeft' ? -5 : 5;
	const b = branch.value;
	const baseL = leftKey === 'left' ? b.left : b.center;
	const baseR = rightKey === 'center' ? b.center : b.right;
	const pair = baseL + baseR;
	const nl = Math.round(Math.max(2, Math.min(pair - 2, baseL + deltaPct)) * 10) / 10;
	const nr = Math.round((pair - nl) * 10) / 10;
	const toFr = (pct: number) => Math.round((pct / 100) * b.sum * 10) / 10;
	setBranchShare(leftKey, toFr(nl));
	setBranchShare(rightKey, toFr(nr));
}
</script>

<template>
	<div
		ref="sectionEl"
		class="row-mini-section"
		role="application"
		aria-label="Section layout miniature: drag parts or remove them; drag the header between top, bottom, and side slots"
	>
		<div v-if="isTop" class="row-mini-headerbar">
			<div
				class="row-mini-headerbox"
				:class="['align-' + align, { 'is-dragging': !!headerDrag }]"
				:style="headerDrag ? 'transform: translate(' + headerDrag.dx + 'px,' + headerDrag.dy + 'px);' : ''"
				tabindex="0"
				role="group"
				aria-label="Header position — use Arrow keys to move"
				@keydown.self="onHeaderKeydown"
				@mousedown="startHeaderDrag($event)"
				@touchstart="startHeaderDrag($event)"
				:title="headerTitle"
			>
				<span class="row-mini-headername">{{ setName }}</span>
				<button
					type="button"
					class="row-mini-remove row-mini-header-remove"
					aria-label="Remove header"
					title="Remove header"
					@mousedown.stop
					@touchstart.stop
					@click.stop="headerMode = 'none'"
				>
					&times;
				</button>
			</div>
		</div>
		<div v-else-if="isNone" class="row-mini-header-off">
			<button
				type="button"
				class="row-mini-restore-header"
				aria-label="Restore header"
				title="Restore header"
				@click.stop="headerMode = 'top'"
			>
				+ Header
			</button>
		</div>
		<div class="row-mini-main" :class="{ 'row-mini-main-sideways': isSidebar }">
			<div v-if="isSidebar" class="row-mini-side">
				<div
					class="row-mini-headerbox row-mini-vertical"
					:class="{ 'is-dragging': !!headerDrag }"
					:style="headerDrag ? 'transform: translate(' + headerDrag.dx + 'px,' + headerDrag.dy + 'px);' : ''"
					tabindex="0"
					role="group"
					aria-label="Header position — use Arrow keys to move"
					@keydown.self="onHeaderKeydown"
					@mousedown="startHeaderDrag($event)"
					@touchstart="startHeaderDrag($event)"
					:title="headerTitle"
				>
					<span class="row-mini-headername">{{ setName }}</span>
					<button
						type="button"
						class="row-mini-remove row-mini-header-remove"
						aria-label="Remove header"
						title="Remove header"
						@mousedown.stop
						@touchstart.stop
						@click.stop="headerMode = 'none'"
					>
						&times;
					</button>
				</div>
			</div>
			<div class="row-mini-bodycol">
				<div
					v-if="isBranchBody"
					class="branch-mini"
					role="application"
					aria-label="Branch columns: drag dividers to share the row"
				>
					<div
						class="branch-box"
						:style="'width: ' + branchShown('left') + '%;'"
						:title="'Left subtraits' + (branchView.implicit ? ' (preset)' : '')"
					>
						<span class="branch-name">Left</span>
						<span class="branch-dims">{{ branchView.implicit ? '' : branchView.left + 'fr' }}</span>
					</div>
					<div
						class="branch-divider"
						tabindex="0"
						role="separator"
						aria-orientation="vertical"
						aria-label="Subtrait column split"
						:aria-valuenow="Math.round(branch.left)"
						aria-valuemin="20"
						aria-valuemax="80"
						@keydown="onBranchDividerKeydown($event, 'left', 'center')"
						@mousedown="startBranchDivider($event, 'left', 'center')"
						@touchstart="startBranchDivider($event, 'left', 'center')"
					></div>
					<div class="branch-box" :style="'width: ' + branchShown('center') + '%;'" :title="'Center column'">
						<span class="branch-name">Trait</span>
					</div>
					<div
						class="branch-divider"
						tabindex="0"
						role="separator"
						aria-orientation="vertical"
						aria-label="Subtrait column split"
						:aria-valuenow="Math.round(branch.left + branch.center)"
						aria-valuemin="20"
						aria-valuemax="80"
						@keydown="onBranchDividerKeydown($event, 'center', 'right')"
						@mousedown="startBranchDivider($event, 'center', 'right')"
						@touchstart="startBranchDivider($event, 'center', 'right')"
					></div>
					<div class="branch-box" :style="'width: ' + branchShown('right') + '%;'" :title="'Right subtraits'">
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
						tabindex="0"
						:aria-label="partBoxLabel(b.key) + ' — Arrow keys to reorder, Shift+Left/Right to resize'"
						@keydown.self="onBoxKeydown($event, b.key)"
						@mousedown="startBoxDrag($event, b.key, 'move')"
						@touchstart="startBoxDrag($event, b.key, 'move')"
						:title="partBoxLabel(b.key) + ' ' + b.left + '% · top ' + b.top + ' · ' + b.width + '% × ' + b.height"
					>
						<span class="row-mini-name">{{ partBoxLabel(b.key) }}</span>
						<span class="row-mini-dims">{{ b.width }}%</span>
						<button
							type="button"
							class="row-mini-remove"
							:aria-label="'Remove ' + partBoxLabel(b.key)"
							:title="'Remove ' + partBoxLabel(b.key)"
							@mousedown.stop
							@touchstart.stop
							@click.stop="removePartCell(b.key)"
						>
							&times;
						</button>
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
				<div v-else-if="isImageBody" ref="imageHostEl" class="row-mini-imagehost">
					<div
						class="row-mini-box row-mini-imagebox"
						tabindex="0"
						role="group"
						aria-label="Image size — Left/Right for width, Up/Down for height"
						:style="
							'width: ' +
							(imageDrag ? imageDrag.width : imageWidthPct) +
							'%; height: ' +
							(imageDrag ? imageDrag.height : imageHeightPx) +
							'px;'
						"
						:title="
							'Image ' +
							(imageDrag ? imageDrag.width : imageWidthPct) +
							'% × ' +
							(imageDrag ? imageDrag.height : imageHeightPx) +
							'px'
						"
						@keydown.self="onImageKeydown"
					>
						<span class="row-mini-name">Image</span>
						<span class="row-mini-dims">
							{{ imageDrag ? imageDrag.width : imageWidthPct }}% × {{ imageDrag ? imageDrag.height : imageHeightPx }}px
						</span>
						<span
							class="row-mini-edge row-mini-edge-e"
							@mousedown.stop="startImageDrag($event, 'w')"
							@touchstart.stop="startImageDrag($event, 'w')"
						></span>
						<span
							class="row-mini-edge row-mini-edge-s"
							@mousedown.stop="startImageDrag($event, 'h')"
							@touchstart.stop="startImageDrag($event, 'h')"
						></span>
					</div>
				</div>
				<div v-else class="row-mini-norows">
					{{
						isNonRowBody
							? 'No trait rows to arrange.'
							: hasCustomParts
								? 'All trait elements removed — Reset to restore.'
								: 'Column arrangement for this row style is not adjustable here.'
					}}
				</div>
			</div>
		</div>
		<div v-if="isBottom" class="row-mini-headerbar row-mini-headerbar-bottom">
			<div
				class="row-mini-headerbox"
				:class="['align-' + align, { 'is-dragging': !!headerDrag }]"
				:style="headerDrag ? 'transform: translate(' + headerDrag.dx + 'px,' + headerDrag.dy + 'px);' : ''"
				tabindex="0"
				role="group"
				aria-label="Header position — use Arrow keys to move"
				@keydown.self="onHeaderKeydown"
				@mousedown="startHeaderDrag($event)"
				@touchstart="startHeaderDrag($event)"
				:title="headerTitle"
			>
				<span class="row-mini-headername">{{ setName }}</span>
				<button
					type="button"
					class="row-mini-remove row-mini-header-remove"
					aria-label="Remove header"
					title="Remove header"
					@mousedown.stop
					@touchstart.stop
					@click.stop="headerMode = 'none'"
				>
					&times;
				</button>
			</div>
		</div>
		<div v-if="headerDrag" class="row-mini-slots" aria-hidden="true">
			<div class="row-mini-slot-top" :class="{ active: headerDrag.zone === 'top' }">
				<div class="row-mini-third" :class="{ active: headerDrag.zone === 'top' && headerDrag.third === 'left' }"></div>
				<div
					class="row-mini-third"
					:class="{ active: headerDrag.zone === 'top' && headerDrag.third === 'center' }"
				></div>
				<div
					class="row-mini-third"
					:class="{ active: headerDrag.zone === 'top' && headerDrag.third === 'right' }"
				></div>
			</div>
			<div class="row-mini-slot-bottom" :class="{ active: headerDrag.zone === 'bottom' }">
				<div
					class="row-mini-third"
					:class="{ active: headerDrag.zone === 'bottom' && headerDrag.third === 'left' }"
				></div>
				<div
					class="row-mini-third"
					:class="{ active: headerDrag.zone === 'bottom' && headerDrag.third === 'center' }"
				></div>
				<div
					class="row-mini-third"
					:class="{ active: headerDrag.zone === 'bottom' && headerDrag.third === 'right' }"
				></div>
			</div>
			<div class="row-mini-slot-side" :class="{ active: headerDrag.zone === 'side' }"></div>
		</div>
	</div>
</template>
