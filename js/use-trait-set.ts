import { computed, provide, inject, ref, onBeforeUnmount, type InjectionKey } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import {
	resolveBorder,
	resolveFrame,
	computeFrameAnchors,
	buildFrameSvgPath,
	normalizeZoom,
	type PortraitFrameShape,
	type TraitArrayMode,
} from './frame-geometry.ts';
import { resolveFrameColorPresentation } from './color-palette.ts';
import {
	getView,
	ensureView,
	getRating,
	resolveRating,
	ratingDice,
	setRatingDice,
	setRatingDie,
	resolveHitches,
	rollSeparate,
	keepsExtraDice,
	availableDice,
	getSpentIndices,
	isRated,
	resolveVisibility,
	isHiddenIn,
	hasOutRange,
	rangeTop,
	isOutDie,
	isNameSet,
	isNameIdentitySlotTrait,
	resolveAltRoll,
	resolvePpDelta,
	resolveSubtraitNoun,
	type AltRollOption,
} from './model.ts';
import { KNOWN_PARTS, isKnownPart, buildParts, partsGrid, partCellStyle, partsGridStyle } from './sheet-grid.ts';
import type { Character, Trait, TraitSet } from './model.ts';
import { useTraitSetPips } from './use-trait-set-pips.ts';
import {
	branchSubs,
	getBranchGroups,
	getBranchRole,
	getBranchSide,
	getFlankColumns,
	getImageSetContainerStyle,
	getImageSetGraphicStyle,
	getSetRatingDie,
	hasBranchFlank,
	hasBranchSplit,
	type BranchGroup,
	type BranchSubEntry,
	type RenderedTraitItem,
} from './trait-set-layout.ts';

export type { BranchGroup, BranchSubEntry, RenderedTraitItem };

export type TraitSetApi = ReturnType<typeof useTraitSet>;

export interface StagedDiePayload {
	size: number;
	qty: number;
	source?: string;
	hitches?: number;
	keepsExtra?: number;
	ppDelta?: number;
	ppCommitted?: boolean;
}

export interface TraitSetEmit {
	(event: 'selectElement', selector: Array<string | number>): void;
	(event: 'updateCharacter', character: Character): void;
	(event: 'addTrait', traitSetID: number): void;
	(event: 'removeTrait', traitSetID: number, traitID: number): void;
	(event: 'removeTraitSet', traitSetID: number): void;
	(event: 'addDieToRoller', payload: StagedDiePayload | StagedDiePayload[]): void;
}

export interface TraitSetProps {
	character: Character;
	traitSetID?: number;
	submode?: string | null;
	editing?: unknown[] | null;
	viewY?: number | null;
	printBlank?: boolean;
}

export const TRAIT_SET_KEY: InjectionKey<TraitSetApi> = Symbol('traitSetApi');

export function isPlayMutableSet(traitSetArg: TraitSet): boolean {
	return characterCurioFunctions.isPlayMutableSet(traitSetArg);
}

export function useTraitSet(props: TraitSetProps, emit: TraitSetEmit) {
	const traitSet = computed<TraitSet>(() => props.character?.traitSets?.[props.traitSetID ?? 0]);
	const s = computed<number>(() => props.traitSetID as number);

	const fallbackActiveTrait = ref<[number, number] | null>(null);
	const fallbackActiveSet = ref<number | null>(null);
	const fallbackActivePartSet = ref<number | null>(null);
	const fallbackTraitPartMenu = ref<[number, number] | null>(null);
	const canvasInline = inject<{
		activeTrait: { value: [number, number] | null };
		activeSet: { value: number | null };
		activePartSet: { value: number | null };
		activePartTrait?: { value: [number, number] | null };
		setActiveTrait: (target: [number, number] | null) => void;
		setActiveSet: (setIdx: number | null) => void;
		setActivePartSet: (setIdx: number | null) => void;
		setActivePartTrait?: (target: [number, number] | null, triggerEl?: HTMLElement | null) => void;
		requestCanvasFocus?: (targetEl?: HTMLElement | null) => void;
	}>('curioCanvasInline', {
		activeTrait: fallbackActiveTrait,
		activeSet: fallbackActiveSet,
		activePartSet: fallbackActivePartSet,
		activePartTrait: fallbackTraitPartMenu,
		setActiveTrait: (target) => {
			fallbackActiveTrait.value = target;
			if (target) {
				fallbackActiveSet.value = null;
				if (
					fallbackTraitPartMenu.value &&
					(fallbackTraitPartMenu.value[0] !== target[0] || fallbackTraitPartMenu.value[1] !== target[1])
				) {
					fallbackTraitPartMenu.value = null;
				}
			} else {
				fallbackTraitPartMenu.value = null;
			}
		},
		setActiveSet: (setIdx) => {
			fallbackActiveSet.value = setIdx;
			if (setIdx !== null) {
				fallbackActiveTrait.value = null;
				fallbackTraitPartMenu.value = null;
			}
		},
		setActivePartSet: (setIdx) => {
			fallbackActivePartSet.value = setIdx;
			if (setIdx !== null) fallbackTraitPartMenu.value = null;
		},
		setActivePartTrait: (target) => {
			fallbackTraitPartMenu.value = target;
			if (target && fallbackActiveTrait.value) {
				if (fallbackActiveTrait.value[0] !== target[0] || fallbackActiveTrait.value[1] !== target[1]) {
					fallbackActiveTrait.value = null;
				}
			}
		},
		requestCanvasFocus: () => {},
	});

	function canInlineEditOnCanvas(): boolean {
		return (
			props.submode === 'edit' ||
			(props.submode === 'play' && Boolean(traitSet.value && isPlayMutableSet(traitSet.value)))
		);
	}

	function isCanvasTraitActive(sArg: number, tIdx: number | null | undefined): boolean {
		if (!canInlineEditOnCanvas() || typeof tIdx !== 'number') return false;
		const cur = canvasInline.activeTrait.value;
		return Boolean(cur && cur[0] === sArg && cur[1] === tIdx);
	}

	function toggleCanvasTrait(sArg: number, tIdx: number | null | undefined) {
		if (!canInlineEditOnCanvas() || typeof tIdx !== 'number') return;
		if (isCanvasTraitActive(sArg, tIdx)) {
			canvasInline.setActiveTrait(null);
		} else {
			if (canvasInline.setActivePartTrait) canvasInline.setActivePartTrait(null);
			else fallbackTraitPartMenu.value = null;
			canvasInline.setActiveTrait([sArg, tIdx]);
		}
	}

	function openCanvasTrait(sArg: number, tIdx: number | null | undefined) {
		if (!canInlineEditOnCanvas() || typeof tIdx !== 'number') return;
		if (!isCanvasTraitActive(sArg, tIdx)) {
			canvasInline.setActiveTrait([sArg, tIdx]);
		}
	}

	function closeCanvasTrait() {
		if (canvasInline.setActivePartTrait) canvasInline.setActivePartTrait(null);
		else fallbackTraitPartMenu.value = null;
		canvasInline.setActiveTrait(null);
	}

	function isTraitPartMenuOpen(sArg: number, tIdx: number | null | undefined): boolean {
		if (props.submode !== 'edit' || typeof tIdx !== 'number') return false;
		const cur = (canvasInline.activePartTrait ?? fallbackTraitPartMenu).value;
		return Boolean(cur && cur[0] === sArg && cur[1] === tIdx);
	}

	function toggleTraitPartMenu(sArg: number, tIdx: number | null | undefined, triggerEl?: HTMLElement | null) {
		if (props.submode !== 'edit' || typeof tIdx !== 'number') return;
		const opening = !isTraitPartMenuOpen(sArg, tIdx);
		const targetEl = (triggerEl?.closest?.('.trait') as HTMLElement | null) || triggerEl || null;
		if (canvasInline.setActivePartTrait) {
			canvasInline.setActivePartTrait(opening ? [sArg, tIdx] : null, targetEl);
		} else {
			fallbackTraitPartMenu.value = opening ? [sArg, tIdx] : null;
			if (opening) canvasInline.requestCanvasFocus?.(targetEl);
		}
	}

	function requestCanvasFocus(targetEl?: HTMLElement | null) {
		canvasInline.requestCanvasFocus?.(targetEl);
	}

	function isCanvasSetActive(sArg: number): boolean {
		if (!canInlineEditOnCanvas()) return false;
		return canvasInline.activeSet.value === sArg;
	}

	function openCanvasSet(sArg: number) {
		if (!canInlineEditOnCanvas()) return;
		canvasInline.setActiveSet(sArg);
	}

	function closeCanvasSet() {
		canvasInline.setActiveSet(null);
	}

	const activeTrackLabelIndex = ref<number | null>(null);
	const activePoolAddIndex = ref<number | null>(null);

	function isInlineTrackLabelOpen(tIdx: number | null | undefined): boolean {
		return props.submode === 'play' && typeof tIdx === 'number' && activeTrackLabelIndex.value === tIdx;
	}

	function openInlineTrackLabel(tIdx: number | null | undefined) {
		if (props.submode !== 'play' || typeof tIdx !== 'number') return;
		activeTrackLabelIndex.value = tIdx;
	}

	function closeInlineTrackLabel() {
		activeTrackLabelIndex.value = null;
	}

	function isPoolAddOpen(tIdx: number | null | undefined): boolean {
		return (
			(props.submode === 'edit' || props.submode === 'play') &&
			typeof tIdx === 'number' &&
			activePoolAddIndex.value === tIdx
		);
	}

	function togglePoolAdd(tIdx: number | null | undefined) {
		if ((props.submode !== 'edit' && props.submode !== 'play') || typeof tIdx !== 'number') return;
		activePoolAddIndex.value = activePoolAddIndex.value === tIdx ? null : tIdx;
	}

	function closePoolAdd() {
		activePoolAddIndex.value = null;
	}

	function isCanvasPartDrawerOpen(sArg: number): boolean {
		if (props.submode !== 'edit') return false;
		return canvasInline.activePartSet.value === sArg;
	}

	function toggleCanvasPartDrawer(sArg: number) {
		if (props.submode !== 'edit') return;
		canvasInline.setActivePartSet(isCanvasPartDrawerOpen(sArg) ? null : sArg);
	}
	const traitSets = computed(() => props.character?.traitSets ?? []);
	const character = computed(() => props.character);
	const submode = computed(() => props.submode);
	const editing = computed(() => props.editing);
	const printBlank = computed(() => props.printBlank);
	const viewY = computed(() => props.viewY);

	function resolveTraitRating(node: unknown, extra?: Array<unknown>) {
		return resolveRating(node, extra ? [...extra, traitSet.value] : [traitSet.value]);
	}

	// Orthogonal Border, Portrait Frame & Radial Array
	const resolvedBorder = computed(() => resolveBorder(traitSet.value));
	const resolvedFrame = computed(() => resolveFrame(traitSet.value));
	const frameToggledOff = ref(false);
	const containerWidth = ref<number>(600);
	let resizeObserver: ResizeObserver | null = null;

	function observeContainer(el: HTMLElement | null) {
		if (resizeObserver) {
			resizeObserver.disconnect();
			resizeObserver = null;
		}
		if (el && typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const cr = entry.contentRect;
					if (cr && cr.width > 0) {
						containerWidth.value = cr.width;
					}
				}
			});
			resizeObserver.observe(el);
		}
	}

	onBeforeUnmount(() => {
		if (resizeObserver) {
			resizeObserver.disconnect();
			resizeObserver = null;
		}
	});

	const isFrameForcedOff = computed(() => false);

	const isFrameActive = computed(() => Boolean(resolvedFrame.value) && !frameToggledOff.value);

	const isPositionalFrameActive = computed(() => false);

	const traitArrayMode = computed<TraitArrayMode>(() =>
		isFrameActive.value ? (resolvedFrame.value?.array ?? 'none') : 'none',
	);

	const portraitFrameShape = computed<PortraitFrameShape>(() => {
		if (!isFrameActive.value || !resolvedFrame.value) return 'none';
		return resolvedFrame.value.portraitShape;
	});

	const setOwnImageUrl = computed(() => {
		const view = getView(traitSet.value);
		if (view?.style?.body === 'image') return '';
		return resolvedFrame.value?.image?.url || view?.imageConfig?.url || '';
	});

	const showPortraitHub = computed(
		() =>
			!isNameSet(traitSet.value) &&
			getView(traitSet.value)?.style?.body !== 'image' &&
			(traitArrayMode.value !== 'none' || Boolean(setOwnImageUrl.value) || portraitFrameShape.value !== 'none'),
	);

	const frameSvgPath = computed(() => {
		if (!resolvedFrame.value) return '';
		return buildFrameSvgPath(resolvedFrame.value);
	});

	const frameColorPresentation = computed(() =>
		resolveFrameColorPresentation(resolvedFrame.value?.color ?? resolvedBorder.value?.color),
	);
	const frameColorClass = computed(() => {
		const res = frameColorPresentation.value;
		if (res.unknownToken) {
			console.warn(`[frame] Unrecognized color token "${res.unknownToken}", falling back to "primary"`);
		}
		return res.className;
	});
	const frameStrokeClass = frameColorClass;

	const traitSetFrameStyle = computed(() => {
		const style: Record<string, string> = {};
		const c = frameColorPresentation.value.customColor;
		if (c) style['--frame-color'] = c;
		const sz = resolvedFrame.value?.size;
		if (typeof sz === 'number' && sz > 0) {
			style['--portrait-size'] = `${Math.round((sz / 16) * 1000) / 1000}rem`;
		}
		return Object.keys(style).length > 0 ? style : undefined;
	});

	const frameStrokeStyle = computed(() => {
		const f = resolvedFrame.value;
		if (!f) return undefined;
		const style: Record<string, string> = {};
		if (frameColorPresentation.value.customColor) {
			style['--frame-color'] = frameColorPresentation.value.customColor;
		}
		if (f.stroke) {
			style['--frame-stroke-width'] = f.stroke;
		}
		if (f.dash) {
			style['--frame-stroke-dash'] = f.dash;
		}
		return Object.keys(style).length > 0 ? style : undefined;
	});

	const frameAnchors = computed(() => {
		if (!isPositionalFrameActive.value || !resolvedFrame.value) return [];
		const rendered = getRenderedTraits(traitSet.value, s.value);
		return computeFrameAnchors(rendered.length, resolvedFrame.value);
	});

	function getTraitAnchorStyle(_t: number): Record<string, string> | undefined {
		return undefined;
	}

	function getTraitNameAnchorStyle(_t: number): Record<string, string> | undefined {
		return undefined;
	}

	function getTraitAnchorDock(_t: number): string | undefined {
		return undefined;
	}

	function getTraitAnchorHemisphere(_t: number): 'top' | 'bottom' | 'center' | undefined {
		return undefined;
	}

	const effectiveImageUrl = computed(() => setOwnImageUrl.value);

	const effectiveAlignment = computed(() => {
		const fAlign = resolvedFrame.value?.image?.alignment;
		const sAlign = getView(traitSet.value)?.imageConfig?.alignment;
		return fAlign || sAlign || 'center';
	});

	const effectiveZoom = computed(() => {
		const fZoom = normalizeZoom(resolvedFrame.value?.image?.zoom);
		if (typeof fZoom === 'number') return fZoom;
		const sZoom = normalizeZoom(getView(traitSet.value)?.imageConfig?.zoom);
		if (typeof sZoom === 'number') return sZoom;
		return 1;
	});

	const effectivePortraitStyle = computed(() => {
		if (!effectiveImageUrl.value) return undefined;
		const zoom = effectiveZoom.value;
		const bgSize = zoom !== 1 ? `${Math.round(zoom * 100)}%` : 'cover';
		return `background-image: url(${characterCurioFunctions.safeImageUrl(effectiveImageUrl.value)}); background-size: ${bgSize};`;
	});

	function getTraitSetLabel(traitSetArg: TraitSet, key: string) {
		const labels = getView(traitSetArg)?.labels;
		if (labels && typeof labels[key] === 'string') {
			return labels[key];
		}
		const style = getView(traitSetArg)?.style?.body;
		return characterCurioFunctions.labelDefaultForStyle(style, key);
	}

	function isSelected(selector: unknown[]) {
		return characterCurioFunctions.arraysMatch(props.editing, selector);
	}

	function renderText(text: unknown) {
		return characterCurioFunctions.renderText(text);
	}

	function renderNotesText(text: unknown) {
		if (!text) return '';
		return characterCurioFunctions.renderMarkdown(text);
	}

	function getTraitSetClasses(traitSetArg: TraitSet) {
		const classes: Record<string, boolean> = { 'trait-set': true };

		const bodyStyle = getView(traitSetArg)?.style?.body || (isNameSet(traitSetArg) ? 'name' : 'default');
		classes['trait-set-style-' + bodyStyle] = true;

		if (bodyStyle === 'subtrait-columns' && getView(traitSetArg)?.branchArrows === false) {
			classes['hide-branch-arrows'] = true;
		}

		const ratingPos = getRatingPlacement(traitSetArg);
		if (ratingPos && ratingPos !== 'inline') {
			classes['rating-pos-' + ratingPos] = true;
		}

		const hasPip = Array.isArray(traitSetArg?.traits) && traitSetArg.traits.some((t) => getPipChild(t) !== undefined);
		if (hasPip) {
			classes['trait-set-pip-mode'] = true;
		}

		const hasCounter = (Array.isArray(traitSetArg?.traits) ? traitSetArg.traits : []).some(
			(t) => resolveRating(t, [traitSetArg])?.type === 'Counter',
		);
		if (hasCounter) {
			classes['trait-set-has-counter'] = true;
		}

		const traits: Trait[] = Array.isArray(traitSetArg?.traits)
			? traitSetArg.traits
			: traitSetArg?.traits
				? Object.values(traitSetArg.traits as Record<string, Trait>)
				: [];
		if (traits.some((t) => typeof t?.description === 'string' && t.description.trim().length > 0)) {
			classes['trait-set-has-feature-description'] = true;
		}

		const ctk = getView(traitSetArg);
		if (ctk?.header === 'top') {
			classes['trait-set-header-top'] = true;
		} else if (ctk?.header === 'bottom') {
			classes['trait-set-header-bottom'] = true;
		} else if (ctk?.header === 'none') {
			classes['trait-set-header-none'] = true;
		}
		const borderCfg = resolveBorder(traitSetArg);
		if (
			borderCfg.shape === 'none' ||
			borderCfg.shape === 'line' ||
			(borderCfg.shape === 'block' && borderCfg.explicit)
		) {
			classes['trait-set-borderless'] = true;
		}
		if ((ctk?.pips as unknown) === false) {
			classes['trait-set-no-pips'] = true;
		}

		const frameCfg = resolveFrame(traitSetArg);
		const pos = frameCfg?.position || (ctk?.portraitPosition as string);
		if (pos) {
			classes['portrait-pos-' + pos] = true;
		}

		const align = ctk?.headerAlign;
		classes['trait-set-header-align-' + (align === 'center' || align === 'right' ? align : 'left')] = true;

		if (ctk?.verticalAlign === 'center') {
			classes['trait-set-valign-center'] = true;
		} else if (ctk?.verticalAlign === 'bottom') {
			classes['trait-set-valign-bottom'] = true;
		}

		const vis = resolveVisibility(traitSetArg);
		if (vis === 'play-only') classes['trait-set-play-only'] = true;
		if (vis === 'editor-only') classes['trait-set-editor-only'] = true;

		const hasArray = Boolean(frameCfg && frameCfg.array !== 'none');
		const hasPortrait =
			!isNameSet(traitSetArg) &&
			ctk?.style?.body !== 'image' &&
			(hasArray ||
				Boolean(frameCfg?.image?.url || ctk?.imageConfig?.url) ||
				Boolean(frameCfg && frameCfg.portraitShape !== 'none'));
		if (hasPortrait) {
			classes['trait-set-has-portrait'] = true;
		}

		if (borderCfg.explicit && (borderCfg.shape === 'block' || borderCfg.shape === 'line')) {
			classes['trait-set-framed'] = true;
			classes['trait-set-frame-' + borderCfg.shape] = true;
		} else if (hasArray) {
			classes['trait-set-framed'] = true;
			classes['trait-set-frame-' + frameCfg!.array] = true;
		} else if (hasPortrait && frameCfg?.portraitShape && frameCfg.portraitShape !== 'none') {
			classes['trait-set-framed'] = true;
		}

		if (borderCfg.explicit || frameCfg) {
			const cRes = resolveFrameColorPresentation(frameCfg?.color ?? borderCfg.color);
			classes[cRes.className] = true;
		}

		return classes;
	}

	function getRatingPlacement(traitSetArg: TraitSet) {
		const parts = getParts(traitSetArg);
		if (parts && parts.rating) {
			const rTop = Number(parts.rating.top) || 0;
			const nTop = parts.name ? Number(parts.name.top) || 0 : 0;
			if (rTop === 0 && nTop === 0) return 'inline';
			if (rTop === 0) return 'above';
			return 'below';
		}
		if (parts) return 'none';
		return 'inline';
	}

	function getRatingDisplay(traitSetArg: TraitSet | null | undefined): 'track' | 'rating' {
		const raw =
			(traitSetArg as { ratingDisplay?: unknown } | null | undefined)?.ratingDisplay ||
			getView(traitSetArg)?.ratingDisplay;
		return raw === 'track' ? 'track' : 'rating';
	}

	// Trait-part layout (view.parts), or null for flex rows.
	// Unknown part names never reach the grid: validation rejects them.
	function getParts(traitSetArg: TraitSet) {
		const raw = getView(traitSetArg)?.parts;
		if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
		if (Object.keys(raw).length === 0) return {};
		const known = Object.keys(raw).filter((k) => isKnownPart(k));
		if (!known.length) return null;
		const parts: Record<
			string,
			{
				left: string;
				top: number;
				width: string;
				height: number;
				marker?: string;
				ratingType?: string;
				range?: number[];
			}
		> = { ...raw };

		let pipChildNoun = '';
		if (Array.isArray(traitSetArg?.traits)) {
			for (const t of traitSetArg.traits) {
				if (!Array.isArray(t?.traits)) continue;
				const match = t.traits.find((sub) => resolveRating(sub, [t, traitSetArg])?.type === 'Pip');
				if (match) {
					pipChildNoun = String(match.noun || match.name || 'Pip').trim() || 'Pip';
					break;
				}
			}
		}

		const hasExistingChildPart = Object.keys(parts).some((k) => k.startsWith('child:') || k.startsWith('child_'));

		if (
			pipChildNoun &&
			parts.name &&
			parts.rating &&
			Number(parts.name.top || 0) === 0 &&
			Number(parts.rating.top || 0) === 0 &&
			!hasExistingChildPart
		) {
			let nextTop = 1;
			for (const k of Object.keys(parts)) {
				if (k === 'name' || k === 'rating') continue;
				const top = Number(parts[k]?.top);
				if (Number.isInteger(top) && top >= 1) {
					parts[k] = { ...parts[k], top: top + 1 };
					nextTop = Math.max(nextTop, top + 2);
				}
			}
			parts.name = { ...parts.name, left: '0%', top: 0, width: '40%', height: 1 };
			parts[`child:${pipChildNoun}:rating`] = { left: '40%', top: 0, width: '10%', height: 1 };
			parts.rating = { ...parts.rating, left: '50%', top: 0, width: '50%', height: 1 };
			parts[`child:${pipChildNoun}:label`] = { left: '0%', top: nextTop, width: '100%', height: 1 };
		}
		return parts;
	}

	function partsGridFor(traitSetArg: TraitSet) {
		const parts = getParts(traitSetArg);
		if (!parts) return null;
		return partsGrid(parts);
	}

	// Name and rating share row 0 (inline): the stacked-vs-inline divider rules key off this.
	function isPartsInline(traitSetArg: TraitSet) {
		const grid = partsGridFor(traitSetArg);
		const name = grid?.cells?.name;
		const rating = grid?.cells?.rating;
		return Boolean(grid && name && rating && name.row === 1 && rating.row === 1);
	}

	function getPipChild(node: unknown): Trait | undefined {
		if (!node || typeof node !== 'object') return undefined;
		const subs = (node as { traits?: Trait[] }).traits;
		if (!Array.isArray(subs)) return undefined;
		return subs.find((ch) => {
			if (!ch || typeof ch !== 'object') return false;
			const r = resolveTraitRating(ch, [node]);
			return Boolean(r && r.type === 'Pip');
		});
	}

	function isChildPipFilled(node: unknown): boolean {
		const child = getPipChild(node);
		const r = child ? resolveTraitRating(child, [node]) : undefined;
		return Boolean(r?.type === 'Pip' && r.value?.[0] === true);
	}

	function togglePip(sArg: number, t: number | null | undefined, traitArg?: Trait) {
		if (props.submode === 'print') return;
		const trait = traitArg ?? (typeof t === 'number' ? props.character?.traitSets?.[sArg]?.traits?.[t] : undefined);
		if (!trait) return;
		let child = getPipChild(trait);
		if (!child) {
			if (!Array.isArray(trait.traits)) trait.traits = [];
			child = {
				name: '',
				description: '',
				tags: [],
				rating: { type: 'Pip', value: [false] },
				traits: [],
				view: {},
			};
			trait.traits.push(child);
		}
		if (!child.rating || child.rating.type !== 'Pip') {
			child.rating = { type: 'Pip', value: [false] };
		}
		if (!Array.isArray(child.rating.value) || child.rating.value.length === 0) {
			child.rating.value = [false];
		}
		child.rating.value[0] = !child.rating.value[0];
		updateCharacter(props.character);
	}

	function canEditChildOnSheet(trait: unknown, traitSetArg: unknown): boolean {
		if (props.submode === 'print') return false;
		return Boolean(
			getView(trait)?.editableOnSheet || getView(traitSetArg)?.editableOnSheet || getView(traitSetArg)?.playMutable,
		);
	}

	function setPipChildName(trait: Trait, val: string) {
		let child = getPipChild(trait);
		if (child) {
			child.name = val;
		} else {
			if (!Array.isArray(trait.traits)) trait.traits = [];
			child = {
				name: val,
				description: '',
				tags: [],
				rating: { type: 'Pip', value: [false] },
				traits: [],
				view: {},
			};
			trait.traits.push(child);
		}
		updateCharacter(props.character);
	}

	function getCounterLabel(traitSetArg: TraitSet): string {
		const fromLabels = (getView(traitSetArg)?.labels as Record<string, unknown> | undefined)?.counter;
		return typeof fromLabels === 'string' ? fromLabels : '';
	}

	function getTraitCounter(trait: Trait): number | '' {
		const direct = resolveTraitRating(trait);
		if (direct?.type === 'Counter') {
			const val = direct.value?.[0];
			return typeof val === 'number' ? val : 0;
		}
		if (Array.isArray(trait?.traits)) {
			for (const c of trait.traits) {
				const cr = resolveTraitRating(c, [trait]);
				if (cr?.type === 'Counter') {
					const val = cr.value?.[0];
					return typeof val === 'number' ? val : 0;
				}
			}
		}
		return '';
	}

	function hasTraitCounter(trait: Trait): boolean {
		return getTraitCounter(trait) !== '';
	}

	function renderDieValue(value: number, isActive = true) {
		return characterCurioFunctions.renderDieconSVG(value, isActive, '', getView(props.character)?.diceConfig);
	}

	function selectElement(selector: Array<string | number | null | undefined>) {
		emit(
			'selectElement',
			selector.filter((x): x is string | number => x !== null && x !== undefined),
		);
	}

	function updateCharacter(character: Character) {
		emit('updateCharacter', character);
	}

	function addTrait(traitSetID: number) {
		emit('addTrait', traitSetID);
	}

	function removeTrait(traitSetID: number, traitID: number) {
		emit('removeTrait', traitSetID, traitID);
	}

	function removeTraitSet(traitSetID: number) {
		emit('removeTraitSet', traitSetID);
	}

	function getTraitClasses(trait: Trait) {
		const classes: Record<string, boolean> = { trait: true };
		if (trait?.description?.length) classes['trait-has-description'] = true;
		if (characterCurioFunctions.blockChildren(trait, traitSet.value).length) classes['trait-has-sfx'] = true;
		if (characterCurioFunctions.ratedSubtraits(trait, traitSet.value).length) classes['trait-has-subtraits'] = true;
		const vis = resolveVisibility(trait);
		if (vis === 'play-only') classes['trait-play-only'] = true;
		if (vis === 'editor-only') classes['trait-editor-only'] = true;
		return classes;
	}

	function getRenderedTraits(traitSetArg: TraitSet, sArg: number) {
		const existingAll = traitSetArg?.traits || [];
		const frameCfg = resolveFrame(traitSetArg);
		const hasExplicitRingTraits = existingAll.some((t: Trait) => Boolean(getView(t)?.ring));
		const isPureRingWithoutImage =
			(frameCfg?.shape === 'ring' || getView(traitSetArg)?.style?.body === 'portrait-ring') &&
			!frameCfg?.image?.url &&
			!hasExplicitRingTraits;
		const isName = isNameSet(traitSetArg);

		const visible = existingAll
			.map((t: Trait, idx: number) => ({ trait: t, originalIndex: idx, isPlaceholder: false }))
			.filter(({ trait }: { trait: Trait }) => {
				if (getView(trait)?.ring) return false;
				if (isPureRingWithoutImage) return false;
				if (isName && isNameIdentitySlotTrait(trait)) return false;
				return isTraitShown(trait);
			});

		if (props.printBlank) {
			const targetCount = getTraitSetSlotCount(traitSetArg);
			const list: RenderedTraitItem[] = [];
			for (let i = 0; i < targetCount; i++) {
				if (i < visible.length) {
					list.push(visible[i]);
				} else {
					list.push({ trait: createBlankSlotTrait(traitSetArg), originalIndex: null, isPlaceholder: true });
				}
			}
			return list;
		}

		// Slots are not traits: every mode expands trailing blank slots to
		// the slot count (reservedSlots floor). Placeholders are render-time
		// objects — clicking one fills it (openTraitAt); nothing blank is stored.
		// Visibility filters first (hidden traits leave no row), so counts
		// stay stable. Original indices survive the filter for editor routing.
		const targetCount = Math.max(getTraitSetSlotCount(traitSetArg), visible.length);
		const list: RenderedTraitItem[] = [...visible];
		for (let i = visible.length; i < targetCount; i++) {
			list.push({ trait: createBlankSlotTrait(traitSetArg), originalIndex: null, isPlaceholder: true });
		}
		return list;
	}

	// Trait visibility (shown | editor-only | hidden): hidden leaves no row
	// anywhere, editor-only renders in Edit only. Editors bypass the
	// filter; only sheet rendering applies it.
	function isTraitShown(trait: Trait) {
		return !isHiddenIn(trait, props.submode);
	}

	// Open a trait row for editing; a blank placeholder becomes a real
	// (still unnamed) trait first, so pencil rows fill in place.
	function openTraitAt(sArg: number, item: RenderedTraitItem | null | undefined) {
		if (!item) return;
		if (item.isPlaceholder) {
			if (props.submode === 'play' && !isPlayMutableSet(traitSet.value)) {
				return;
			}
			fillPlaceholder(sArg);
			return;
		}
		if (props.submode === 'play' && traitSet.value && isPlayMutableSet(traitSet.value)) {
			if (typeof item.originalIndex === 'number') {
				canvasInline.setActiveTrait([Number(sArg), item.originalIndex]);
			}
			return;
		}
		selectElement(['trait', sArg, item.originalIndex]);
	}

	function fillPlaceholder(sArg: number) {
		const set = props.character.traitSets[sArg];
		if (!set) return;
		if (!Array.isArray(set.traits)) set.traits = [];
		const nextSlot = createBlankSlotTrait(set);
		if (!getRating(set) && (set as { rating?: unknown }).rating !== null && getView(set)?.style?.body !== 'list') {
			const scale = characterCurioFunctions.getTraitSetRatings(set);
			nextSlot.rating = { type: 'Die', value: [scale.includes(8) ? 8 : scale[0] || 8] };
		}
		set.traits.push(nextSlot);
		updateCharacter(props.character);
		const newIdx = set.traits.length - 1;
		if (props.submode === 'play' && isPlayMutableSet(set)) {
			canvasInline.setActiveTrait([Number(sArg), newIdx]);
		} else {
			selectElement(['trait', sArg, newIdx]);
		}
	}

	function createBlankSlotTrait(traitSetArg: TraitSet): Trait {
		const traits: Trait[] = Array.isArray(traitSetArg?.traits)
			? traitSetArg.traits
			: traitSetArg?.traits && typeof traitSetArg.traits === 'object'
				? Object.values(traitSetArg.traits as Record<string, Trait>)
				: [];
		const hasSubtraits = traits.some((t) => characterCurioFunctions.ratedSubtraits(t, traitSetArg).length > 0);
		return {
			name: '',
			description: '',
			traits: hasSubtraits ? [{ name: '' }] : [],
			tags: [],
			custom: {},
		};
	}

	function isFixedSystemTrait(traitSetArg: TraitSet, trait: Trait) {
		if (!trait || !trait.name) return false;
		if (getView(trait)?.prompt) return false;
		const name = trait.name.trim();
		if (characterCurioFunctions.isFixedTraitNamesSet(traitSetArg)) {
			return true;
		}
		const templateId = getView(props.character)?.template;
		if (templateId) {
			type TemplateLike = {
				id?: unknown;
				title?: unknown;
				template?: unknown;
				name?: unknown;
				isTemplate?: unknown;
				sets?: Record<string, { traits?: Record<string, unknown> }>;
			};
			const win = window as unknown as {
				characterCurioStorage?: { loadData?: () => { templates?: TemplateLike[]; characters?: TemplateLike[] } | null };
				characterCurioLibraryTemplates?: TemplateLike[];
			};
			let tpl: TemplateLike | null = null;
			// 1. Local first: check user-owned templates & characters
			try {
				if (typeof win?.characterCurioStorage?.loadData === 'function') {
					const data = win.characterCurioStorage.loadData();
					if (data) {
						const localTemplates = data.templates || [];
						const localChars = data.characters || [];
						tpl =
							localTemplates.find(
								(t) =>
									t.id === templateId || t.title === templateId || t.template === templateId || t.name === templateId,
							) ||
							localChars.find(
								(c) => (c.isTemplate || c.id === templateId) && (c.id === templateId || c.name === templateId),
							) ||
							null;
					}
				}
			} catch {}
			// 2. Library second
			if (!tpl && typeof win?.characterCurioLibraryTemplates !== 'undefined') {
				const tpls = win.characterCurioLibraryTemplates;
				if (Array.isArray(tpls)) {
					tpl = tpls.find((t) => t.id === templateId || t.title === templateId || t.template === templateId) || null;
				}
			}
			if (tpl?.sets) {
				for (const sKey of Object.keys(tpl.sets)) {
					const setDef = tpl.sets[sKey];
					if (setDef?.traits && Object.hasOwn(setDef.traits, name)) return true;
				}
			}
		}
		return false;
	}

	function renderDieValueForPrint(size: number | null | undefined, isActive = false) {
		const isFilled = props.printBlank ? false : Boolean(isActive);
		return characterCurioFunctions.renderDieconSVG(size || 0, isFilled, '', getView(props.character)?.diceConfig);
	}

	function getTraitSetRatings(traitSetArg: TraitSet) {
		return characterCurioFunctions.getTraitSetRatings(traitSetArg);
	}

	function getSubtraitRatings(traitSetArg: TraitSet) {
		return characterCurioFunctions.getSubtraitRatings(traitSetArg);
	}

	function getTraitDice(trait: Trait) {
		return characterCurioFunctions.getTraitDice(trait, [traitSet.value]);
	}

	// Positional subtrait access: paired slots keep complication at 0
	// and bonus at 1. Index is the truth; names are labels. The SFX
	// container is a child trait, not a subtrait, so positional access
	// reads past it.
	function getSubtraitAt(trait: Trait, index: number) {
		return characterCurioFunctions.ratedSubtraits(trait, traitSet.value)[index] || null;
	}

	function getSubtraitSlotRatings(traitSetArg: TraitSet, slot: number) {
		return characterCurioFunctions.getSubtraitSlotRatings(traitSetArg, slot);
	}

	// A pool set (e.g. Growth Pool) is a plain multi-die pool, not apart-rolling:
	// clicking a trait adds its whole pool to the roller. Apart-rolling
	// derives from hitches (0 rolls apart), never from names.
	function isPoolSet(traitSetArg: TraitSet) {
		return nodePool(traitSetArg) === true;
	}

	function isDieSpent(trait: Trait, index: number) {
		const spent = getView(trait)?.spentDice;
		return Array.isArray(spent) && spent.includes(index);
	}

	function toggleDieSpentInPlay(sArg: number, t: number | null | undefined, index: number) {
		if (typeof t !== 'number') return;
		const trait = props.character.traitSets[sArg]?.traits?.[t];
		if (!trait) return;
		const view = ensureView(trait);
		if (!Array.isArray(view.spentDice)) {
			view.spentDice = [];
		}
		const spentList = view.spentDice;
		const idx = spentList.indexOf(index);
		if (idx !== -1) {
			spentList.splice(idx, 1);
		} else {
			spentList.push(index);
		}
		updateCharacter(props.character);
	}

	// Pool staging (one recursive shape): a trait stages its whole array
	// of available dice when it carries pool itself or inherits it from
	// its set. Challenge/boss pools are not flags — both are Dice ratings
	// with pool and spendable on the set, differing only in size.
	function nodePool(node: unknown): boolean | undefined {
		const n = (node && typeof node === 'object' ? node : undefined) as { pool?: unknown } | undefined;
		if (n && typeof n.pool === 'boolean') return n.pool;
		return undefined;
	}

	function stagesWholePool(trait: Trait, traitSetArg: TraitSet) {
		return (nodePool(trait) ?? nodePool(traitSetArg)) === true;
	}

	// Stage entries carry hitches (resolved with inheritance) and keepsExtra
	// so the roller never re-resolves trait data from a source name.
	function stageTraitDice(trait: Trait, traitSetArg: TraitSet) {
		const dice = availableDice(trait, [traitSetArg]);
		if (!dice.length) return [];
		const hitches = resolveHitches(trait, [traitSetArg]);
		const keep = keepsExtraDice(trait);
		return dice.map((size: number) => ({
			size: size,
			qty: 1,
			source: trait.name,
			hitches: hitches,
			keepsExtra: keep,
		}));
	}

	function handleDieClick(
		trait: Trait,
		dieSize: number,
		dIdx: number,
		traitSetArg: TraitSet,
		sArg: number,
		t: number | null | undefined,
	) {
		if (props.submode === 'play') {
			if (isDieSpent(trait, dIdx)) {
				toggleDieSpentInPlay(sArg, t, dIdx);
				return;
			}
			if (stagesWholePool(trait, traitSetArg)) {
				// Pools add whole: every available die on the trait enters
				// the roller, and the roller sheds dice individually.
				const staged = stageTraitDice(trait, traitSetArg);
				if (!staged.length) return;
				emit('addDieToRoller', staged);
				return;
			}
			emit('addDieToRoller', {
				size: dieSize,
				qty: 1,
				source: trait.name,
				hitches: resolveHitches(trait, [traitSetArg]),
			});
		} else if (props.submode === 'edit') {
			toggleCanvasTrait(Number(sArg), typeof t === 'number' ? t : null);
		} else {
			selectElement(['trait', sArg, t]);
		}
	}

	function stageSetDie(dieSize: number, sourceName?: string) {
		if (props.submode !== 'play' || !dieSize) return;
		emit('addDieToRoller', {
			size: dieSize,
			qty: 1,
			source: sourceName || traitSet.value?.name || 'Sheet',
			hitches: resolveHitches(traitSet.value),
			ppDelta: 0,
		});
	}

	function stepTraitCounter(trait: Trait, traitSetArg: TraitSet, delta: number) {
		if (props.submode === 'print' || !trait) return;
		const resolved = resolveRating(trait, [traitSetArg]);
		if (resolved?.type !== 'Counter') return;
		const bounds =
			Array.isArray(resolved.range) && resolved.range.length >= 2
				? [Number(resolved.range[0]) || 0, Number(resolved.range[1]) || 20]
				: [0, 20];
		const lo = Math.min(bounds[0], bounds[1]);
		const hi = Math.max(bounds[0], bounds[1]);
		const cur = typeof resolved.value?.[0] === 'number' ? (resolved.value[0] as number) : lo;
		const next = Math.max(lo, Math.min(hi, cur + delta));
		trait.rating = {
			type: 'Counter',
			value: [next],
			range: [lo, hi],
		};
		updateCharacter(props.character);
	}

	function seedSetParts(ts: TraitSet): Record<string, Record<string, unknown>> {
		const view = ensureView(ts);
		if (view.parts && typeof view.parts === 'object' && !Array.isArray(view.parts) && Object.keys(view.parts).length) {
			return view.parts as unknown as Record<string, Record<string, unknown>>;
		}
		const scale = characterCurioFunctions.getTraitSetRatings(ts);
		const trackOn = characterCurioFunctions.hasTrackPart(ts);
		const tScale = characterCurioFunctions.getTrackScale(ts);
		const traits = Array.isArray(ts?.traits) ? ts.traits : [];
		const hasDesc = traits.some((t) => typeof t?.description === 'string' && t.description.trim().length > 0);
		const hasSfx = traits.some((t) => characterCurioFunctions.blockChildren(t, ts).length > 0);
		const hasSub = traits.some((t) => characterCurioFunctions.ratedSubtraits(t, ts).length > 0);
		view.parts = buildParts({
			rating: getRatingPlacement(ts) as 'inline' | 'above' | 'below' | 'none',
			ratingDice: getRatingDisplay(ts) === 'rating' ? 1 : scale.length || 5,
			trackDice: trackOn ? tScale.length || 5 : 0,
			description: hasDesc,
			block: hasSfx,
			subtraits: hasSub,
		}) as unknown as typeof view.parts;
		return view.parts as unknown as Record<string, Record<string, unknown>>;
	}

	function isSetPartActive(partKey: 'description' | 'block' | 'track' | 'badge', tsArg?: TraitSet): boolean {
		const ts = tsArg ?? traitSet.value;
		if (!ts) return false;
		if (partKey === 'track') return characterCurioFunctions.hasTrackPart(ts);
		const raw = getView(ts)?.parts as Record<string, unknown> | undefined;
		if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
			return Boolean(raw[partKey]);
		}
		const traits = Array.isArray(ts.traits) ? ts.traits : [];
		if (partKey === 'description') {
			return traits.some((t) => typeof t?.description === 'string' && t.description.trim().length > 0);
		}
		if (partKey === 'block') {
			return traits.some((t) => characterCurioFunctions.blockChildren(t, ts).length > 0);
		}
		return false;
	}

	function toggleSetPart(partKey: 'description' | 'block' | 'track' | 'badge', tsArg?: TraitSet) {
		const ts = tsArg ?? traitSet.value;
		if (!ts) return;
		const cells = seedSetParts(ts);
		if (partKey === 'track') {
			if (characterCurioFunctions.hasTrackPart(ts)) {
				delete cells.trackLabel;
				delete cells.track;
			} else {
				const maxTop = Object.values(cells).reduce((m: number, c) => Math.max(m, Number(c?.top) || 0), -1);
				const tScale = characterCurioFunctions.getTrackScale(ts);
				cells.trackLabel = { left: '0%', top: maxTop + 1, width: '35%', height: 1, marker: 'L' };
				cells.track = {
					left: '35%',
					top: maxTop + 1,
					width: '65%',
					height: 1,
					ratingType: 'Die',
					range: tScale.length ? tScale : [4, 6, 8, 10, 12],
				};
			}
			updateCharacter(props.character);
			return;
		}
		if (cells[partKey]) {
			if (Object.keys(cells).length > 1) {
				delete cells[partKey];
				updateCharacter(props.character);
			}
			return;
		}
		const maxTop = Object.values(cells).reduce((m: number, c) => Math.max(m, Number(c?.top) || 0), -1);
		cells[partKey] = {
			left: '0%',
			top: maxTop + 1,
			width: '100%',
			height: 1,
			marker: partKey === 'badge' ? 'L' : 'T',
		};
		updateCharacter(props.character);
	}

	const openInlineDescTraits = ref<Record<string, boolean>>({});

	function traitPartKeyId(trait: Trait, tIdx: number | null | undefined): string {
		const lid = trait?._lid;
		return lid ? String(lid) : `${s.value}:${tIdx ?? 'p'}`;
	}

	function isTraitDescInlineOpen(trait: Trait, tIdx: number | null | undefined): boolean {
		return Boolean(openInlineDescTraits.value[traitPartKeyId(trait, tIdx)]);
	}

	function ensureExplicitPartCell(ts: TraitSet, partKey: 'description' | 'block' | 'subtraits' | 'badge') {
		const view = getView(ts);
		if (!view?.parts || typeof view.parts !== 'object' || Array.isArray(view.parts)) return;
		const cells = view.parts as unknown as Record<string, Record<string, unknown>>;
		if (cells[partKey]) return;
		const maxTop = Object.values(cells).reduce((m: number, c) => Math.max(m, Number(c?.top) || 0), -1);
		cells[partKey] = {
			left: '0%',
			top: maxTop + 1,
			width: '100%',
			height: 1,
			marker: partKey === 'badge' ? 'L' : partKey === 'subtraits' ? 'S' : 'T',
		};
	}

	function hasTraitPartActive(
		trait: Trait,
		partKey: 'description' | 'subtraits' | 'block' | 'track' | 'badge',
		tIdx: number | null | undefined,
	): boolean {
		const ts = traitSet.value;
		if (!trait || !ts) return false;
		if (partKey === 'description') {
			return (
				isTraitDescInlineOpen(trait, tIdx) ||
				(typeof trait.description === 'string' && trait.description.trim().length > 0)
			);
		}
		if (partKey === 'subtraits') return visibleSubtraits(ts, trait).length > 0;
		if (partKey === 'block') return characterCurioFunctions.blockChildren(trait, ts).length > 0;
		if (partKey === 'track') return hasTrackPart(ts);
		if (partKey === 'badge') return Boolean(getView(trait)?.badge);
		return false;
	}

	function toggleTraitPart(
		trait: Trait,
		partKey: 'description' | 'subtraits' | 'block' | 'track' | 'badge',
		tIdx: number | null | undefined,
	) {
		const ts = traitSet.value;
		if (!trait || !ts) return;
		if (partKey === 'track') {
			toggleSetPart('track', ts);
			return;
		}
		if (partKey === 'description') {
			const k = traitPartKeyId(trait, tIdx);
			if (hasTraitPartActive(trait, 'description', tIdx)) {
				delete openInlineDescTraits.value[k];
				trait.description = '';
			} else {
				openInlineDescTraits.value[k] = true;
				ensureExplicitPartCell(ts, 'description');
			}
			updateCharacter(props.character);
			return;
		}
		if (partKey === 'subtraits') {
			if (!Array.isArray(trait.traits)) trait.traits = [];
			trait.traits.push({
				name: characterCurioFunctions.nextUniqueName(
					trait.traits.map((ct) => ct?.name ?? ''),
					'New Subtrait',
				),
				description: '',
				tags: [],
				traits: [],
				rating: { type: 'Die', value: [6] },
			});
			ensureExplicitPartCell(ts, 'subtraits');
			openCanvasTrait(s.value, tIdx);
			updateCharacter(props.character);
			return;
		}
		if (partKey === 'block') {
			if (!Array.isArray(trait.traits)) trait.traits = [];
			trait.traits.push({
				name: 'SFX',
				description: '',
				noun: 'SFX',
				tags: [],
				traits: [],
				view: { part: 'block' },
			});
			ensureExplicitPartCell(ts, 'block');
			openCanvasTrait(s.value, tIdx);
			updateCharacter(props.character);
			return;
		}
		if (partKey === 'badge') {
			const tv = ensureView(trait);
			if (tv.badge) {
				delete tv.badge;
			} else {
				tv.badge = { text: 'Badge', shape: 'vertical-bar', color: 'primary' };
				ensureExplicitPartCell(ts, 'badge');
			}
			updateCharacter(props.character);
		}
	}

	function handleSingleDieClick(
		trait: Trait,
		value: number | null | undefined,
		traitSetArg: TraitSet,
		sArg: number,
		t: number | null | undefined,
	) {
		if (props.submode === 'play') {
			if (getRatingDisplay(traitSetArg) === 'rating' && isTraitOut(trait, traitSetArg)) {
				selectElement(['trait', sArg, t]);
				return;
			}
			const first = ratingDice(resolveRating(trait, [traitSetArg]))[0];
			const targetVal = value || first;
			if (value !== undefined && value !== null) {
				if (!first || first !== value) {
					setRatingDie(trait, value);
					trait.isOut = false;
					updateCharacter(props.character);
				}
			}
			if (targetVal) {
				if (stagesWholePool(trait, traitSetArg)) {
					const staged = stageTraitDice(trait, traitSetArg);
					if (!staged.length) return;
					emit('addDieToRoller', staged);
					return;
				}
				emit('addDieToRoller', {
					size: targetVal,
					qty: 1,
					source: trait.name,
					hitches: resolveHitches(trait, [traitSetArg]),
					ppDelta: 0,
				});
			}
		} else if (props.submode === 'edit') {
			if (
				typeof value === 'number' &&
				value > 0 &&
				getRatingDisplay(traitSetArg) !== 'rating' &&
				(isTraitOut(trait, traitSetArg) || firstDie(trait) !== value)
			) {
				const prevRange = Array.isArray(getRating(trait)?.range)
					? [...(getRating(trait)!.range as number[])]
					: undefined;
				trait.isOut = false;
				setRatingDie(trait, value, prevRange);
				updateCharacter(props.character);
			} else {
				toggleCanvasTrait(Number(sArg), typeof t === 'number' ? t : null);
			}
		} else {
			selectElement(['trait', sArg, t]);
		}
	}

	function getAltRoll(trait: Trait, traitSetArg: TraitSet): AltRollOption | null {
		if (!trait || !isTraitRated(trait)) return null;
		return resolveAltRoll(trait, traitSetArg);
	}

	function handleAltRollClick(trait: Trait, traitSetArg: TraitSet) {
		if (props.submode !== 'play') return;
		const alt = getAltRoll(trait, traitSetArg);
		if (!alt) return;
		const source = alt.label
			? trait.name
				? `${trait.name} (${alt.label})`
				: alt.label
			: trait.name || 'Alternate Roll';
		emit('addDieToRoller', {
			size: alt.die || 4,
			qty: 1,
			source,
			hitches: resolveHitches(trait, [traitSetArg]),
			ppDelta: alt.ppDelta,
			ppCommitted: false,
		});
	}

	function stageTrackDie(trait: Trait, size: number, label: string, traitSetArg: TraitSet) {
		if (props.submode === 'play' && size > 0) {
			emit('addDieToRoller', {
				size: size,
				qty: 1,
				source: label || trait.name || traitSetArg?.noun || 'Trait',
				hitches: resolveHitches(trait, [traitSetArg]),
				ppDelta: 0,
			});
		}
	}

	function handleSteppedDieClick(sArg: number, t: number | null | undefined, value: number) {
		if (props.submode === 'play') {
			if (typeof t !== 'number') return;
			const traitSetArg = props.character.traitSets[sArg];
			const trait = traitSetArg?.traits?.[t];
			if (!trait) return;
			const cur = ratingDice(resolveRating(trait, [traitSetArg]))[0];
			if (cur === value && !trait.isOut) {
				setRatingDie(trait, null);
			} else {
				setRatingDie(trait, value);
				trait.isOut = false;
			}
			updateCharacter(props.character);
		} else {
			selectElement(['trait', sArg, t]);
		}
	}

	function handleOutClick(sArg: number, t: number | null | undefined) {
		if (props.submode === 'play') {
			if (typeof t !== 'number') return;
			const traitSetArg = props.character.traitSets[sArg];
			const trait = traitSetArg?.traits?.[t];
			if (!trait) return;
			trait.isOut = !trait.isOut;
			if (trait.isOut) {
				setRatingDie(trait, rangeTop(trait, [traitSetArg]) + 2);
				const r = trait.rating as Record<string, unknown> | null | undefined;
				if (r && typeof r === 'object' && (r.type === 'Die' || r.type === 'Dice')) r.out = true;
			} else {
				setRatingDie(trait, null);
			}
			updateCharacter(props.character);
		} else {
			selectElement(['trait', sArg, t]);
		}
	}

	// Generic Out indicator: any stepped track (stress, complications, or any
	// hack's renamed equivalent) may offer an Out badge. Default off — most
	// sets aren't complications.
	function shouldShowOut(traitSetArg: TraitSet) {
		const view = getView(traitSetArg);
		if (view && typeof view.outIndicator === 'boolean') return view.outIndicator;
		return false;
	}

	function isTraitOut(trait: Trait, traitSetArg?: TraitSet) {
		return isOutDie(trait, traitSetArg ? [traitSetArg] : undefined);
	}

	function hasTrackPart(traitSetArg: TraitSet) {
		return characterCurioFunctions.hasTrackPart(traitSetArg);
	}

	function getTrackLabel(traitSetArg: TraitSet) {
		return characterCurioFunctions.getTrackLabel(traitSetArg);
	}

	function getTraitTrackLabel(traitSetArg: TraitSet, trait: Trait): string {
		const explicitSetLabel = getView(traitSetArg)?.labels?.track;
		const companion = getTrackCompanion(traitSetArg, trait);
		if (companion && typeof companion.name === 'string' && companion.name.trim().length > 0) {
			if (explicitSetLabel === '' && companion.name.trim() === 'Track' && getView(companion)?.part !== 'track') {
				return '';
			}
			return companion.name.trim();
		}
		return getTrackLabel(traitSetArg);
	}

	function getTrackScale(traitSetArg: TraitSet) {
		return characterCurioFunctions.getTrackScale(traitSetArg);
	}

	function getTrackValue(trait: Trait, traitSetArg?: TraitSet) {
		const companion = traitSetArg ? getTrackCompanion(traitSetArg, trait) : undefined;
		if (companion) return getTraitDice(companion)[0] || 0;
		return 0;
	}

	// The track companion is an ordinary subtrait on the trait. Its name
	// defaults to the set's track label (fallback "Stress"), but can be
	// customized individually (e.g. Physical's companion is "Injured", Mental is "Worried").
	function getTrackCompanion(traitSetArg: TraitSet, trait: Trait) {
		return characterCurioFunctions.getTrackCompanion(traitSetArg, trait);
	}

	function isTrackCompanion(traitSetArg: TraitSet, sub: unknown, trait?: Trait) {
		if (trait) return characterCurioFunctions.isTrackCompanion(traitSetArg, sub, trait);
		if (!hasTrackPart(traitSetArg) || !sub || typeof sub !== 'object') return false;
		const subRec = sub as Record<string, unknown>;
		const subName = String(subRec.noun || subRec.name || '')
			.trim()
			.toLowerCase();
		const explicitLabel = getView(traitSetArg)?.labels?.track;
		if (explicitLabel && subName === String(explicitLabel).trim().toLowerCase()) {
			return true;
		}
		if (getView(sub)?.part === 'block' || resolvePpDelta(sub) !== 0) return false;
		const r = subRec.rating as { range?: unknown } | null | undefined;
		return Boolean(r && Array.isArray(r.range));
	}

	function visibleSubtraits(traitSetArg: TraitSet, trait: Trait) {
		return characterCurioFunctions.ratedSubtraits(trait, traitSetArg).filter((st) => isTraitShown(st));
	}

	function shouldShowTrackOut(traitSetArg: TraitSet) {
		return Boolean(getView(traitSetArg)?.outIndicator === true);
	}

	function isTrackOut(trait: Trait, traitSetArg?: TraitSet) {
		const companion = traitSetArg ? getTrackCompanion(traitSetArg, trait) : undefined;
		if (!companion) return false;
		return isOutDie(companion, traitSetArg ? [traitSetArg] : undefined);
	}

	function setTraitTrackLabel(sArg: number, t: number | null | undefined, rawName: string) {
		if (props.submode !== 'play' || typeof t !== 'number') return;
		const set = props.character.traitSets[sArg];
		const trait = set?.traits?.[t];
		if (!trait) return;
		if (!Array.isArray(trait.traits)) trait.traits = [];
		let companion = getTrackCompanion(set, trait);
		if (!companion) {
			companion = {
				name: rawName,
				rating: { type: 'Die', value: [], range: getTrackScale(set).slice() },
				view: { part: 'track' },
			};
			trait.traits.push(companion);
		} else {
			companion.name = rawName;
			ensureView(companion).part = 'track';
		}
		updateCharacter(props.character);
	}

	function finalizeTraitTrackLabel(sArg: number, t: number | null | undefined) {
		const set = props.character?.traitSets?.[sArg];
		const trait = typeof t === 'number' ? set?.traits?.[t] : undefined;
		if (trait && Array.isArray(trait.traits)) {
			const companion = getTrackCompanion(set, trait);
			if (companion && !String(companion.name || '').trim()) {
				const hasVal = (getTraitDice(companion)[0] || 0) > 0 || Boolean(companion.isOut);
				if (!hasVal) {
					const idx = trait.traits.indexOf(companion);
					if (idx !== -1) trait.traits.splice(idx, 1);
				} else {
					companion.name = getTrackLabel(set) || 'Track';
				}
				updateCharacter(props.character);
			}
		}
		closeInlineTrackLabel();
	}

	function handleTrackClick(sArg: number, t: number | null | undefined, size: number) {
		if (props.submode === 'print' || typeof t !== 'number') return;
		const set = props.character.traitSets[sArg];
		const trait = set?.traits?.[t];
		if (!trait) return;
		if (!Array.isArray(trait.traits)) trait.traits = [];
		const companion = getTrackCompanion(set, trait);
		if (companion) {
			const cur = getTraitDice(companion)[0] || 0;
			if (cur === size) {
				const customNamed =
					getView(companion)?.part === 'track' &&
					Boolean(String(companion.name || '').trim()) &&
					String(companion.name || '').trim() !== getTrackLabel(set);
				if (customNamed || companion.isOut) {
					if (companion.rating && typeof companion.rating === 'object') {
						companion.rating.value = [];
					}
				} else {
					const idx = trait.traits.indexOf(companion);
					if (idx !== -1) trait.traits.splice(idx, 1);
				}
			} else {
				characterCurioFunctions.setTraitDice(companion, [size]);
			}
		} else {
			const name = getTrackLabel(set) || 'Track';
			trait.traits.push({ name, rating: { type: 'Die', value: [size], range: getTrackScale(set).slice() } });
		}
		updateCharacter(props.character);
	}

	function handleTrackOutClick(sArg: number, t: number | null | undefined) {
		if (props.submode === 'print' || typeof t !== 'number') return;
		const set = props.character.traitSets[sArg];
		const trait = set?.traits?.[t];
		if (!trait) return;
		if (!Array.isArray(trait.traits)) trait.traits = [];
		let companion = getTrackCompanion(set, trait);
		if (!companion) {
			const name = getTrackLabel(set) || 'Track';
			const scale = getTrackScale(set);
			companion = {
				name,
				rating: { type: 'Die', value: [scale[0] || 4], range: scale.slice(), out: true } as Trait['rating'],
			};
			trait.traits.push(companion);
		} else {
			companion.isOut = !companion.isOut;
			const r = companion.rating as Record<string, unknown> | null | undefined;
			if (r && typeof r === 'object' && (r.type === 'Die' || r.type === 'Dice')) {
				r.out = Boolean(companion.isOut);
			}
			const customNamed =
				getView(companion)?.part === 'track' &&
				Boolean(String(companion.name || '').trim()) &&
				String(companion.name || '').trim() !== getTrackLabel(set);
			if (!companion.isOut && !((getTraitDice(companion)[0] || 0) > 0) && !customNamed) {
				trait.traits.splice(trait.traits.indexOf(companion), 1);
			}
		}
		updateCharacter(props.character);
	}

	const {
		getPipConfig,
		getPipRowCount,
		getPipRowCols,
		getPipIndex,
		getPipTrack,
		setPipTrack,
		isPipFilled,
		handlePipClick,
		isPipLabels,
		pipRowFilled,
		pipRows,
		getTraitPipBubbles,
		toggleTraitPipBubble,
		getDynamicChildParts,
		parseChildPartKey,
		pipChildNouns,
		isPipChildPart,
		hasChildPartCell,
		getChildTraitByNoun,
		ensurePipTrait,
		togglePipRow,
		openPipRow,
		setPipRowName,
		addPipRow,
	} = useTraitSetPips({
		character,
		traitSet,
		traitSets,
		submode,
		printBlank,
		resolveTraitRating,
		getParts,
		partsGridFor,
		getPipChild,
		selectElement,
		updateCharacter,
	});

	function handleBranchFlatClick(sArg: number, t: number | null | undefined, trait: Trait) {
		if (props.submode === 'play') {
			const traitSetArg = props.character.traitSets[sArg];
			const first = ratingDice(resolveRating(trait, [traitSetArg]))[0];
			if (first) {
				handleSingleDieClick(trait, first, traitSetArg, sArg, t);
			}
		} else {
			selectElement(['trait', sArg, t]);
		}
	}

	function getSubtraitNameOr(trait: Trait, traitSetArg: TraitSet, index: number) {
		const sub = characterCurioFunctions.ratedSubtraits(trait, traitSetArg)[index];
		if (sub && sub.name && String(sub.name).trim().length) {
			return sub.name;
		}
		return getTraitSetLabel(traitSetArg, 'slot' + index);
	}

	function getThreeColEffect(trait: Trait) {
		const entries = characterCurioFunctions.blockChildren(trait, traitSet.value);
		const effect = entries.find((e) => resolvePpDelta(e) <= 0 && !getView(e)?.altRoll) || entries[0];
		if (!effect) return '';
		return effect.description || effect.name || '';
	}

	function getExplicitPoolCount(trait: Trait) {
		const raw = getView(trait)?.poolCount;
		if (raw === undefined || raw === null || raw === '') return null;
		const n = Number(raw);
		if (!Number.isFinite(n) || n < 0) return null;
		return Math.floor(n);
	}

	function getDiceCount(trait: Trait) {
		const dice = characterCurioFunctions.getTraitDice(trait);
		if (dice.length > 1) return dice.length;
		const poolCount = getExplicitPoolCount(trait);
		if (poolCount !== null) return poolCount;
		return dice.length;
	}

	function getDiceCountPool(trait: Trait, traitSetArg?: TraitSet) {
		if (!trait) return [];
		const dice = characterCurioFunctions.getTraitDice(trait);
		if (dice.length > 1) return dice;
		const poolCount = getExplicitPoolCount(trait);
		const val = dice[0] || (traitSetArg ? getTraitSetRatings(traitSetArg)[0] : 6) || 6;
		if (poolCount !== null) {
			const res: number[] = [];
			for (let i = 0; i < poolCount; i++) res.push(val);
			return res;
		}
		return dice.length > 0 ? dice : [val];
	}

	// Print tally pips: the fixed 1–5 track saturates, so extend the track
	// to the live count for bigger pools (growth pools grow past 5).
	function getPrintTallyPips(trait: Trait) {
		const count = getDiceCount(trait);
		const total = Math.max(5, count);
		const list: number[] = [];
		for (let n = 1; n <= total; n++) list.push(n);
		return list;
	}

	function setDiceCount(sArg: number, t: number | null | undefined, count: number) {
		if (typeof t !== 'number') return;
		const traitSetArg = props.character.traitSets[sArg];
		const trait = traitSetArg?.traits?.[t];
		if (!trait) return;
		const clamped = Math.max(1, Math.min(5, Number(count) || 1));
		const ratings = getTraitSetRatings(traitSetArg);
		const size = ratingDice(resolveRating(trait, [traitSetArg]))[0] || ratings[0] || 6;
		const dice = [];
		for (let i = 0; i < clamped; i++) dice.push(size);
		characterCurioFunctions.setTraitDice(trait, dice);
		ensureView(trait).poolCount = clamped;
		updateCharacter(props.character);
	}

	function addTraitSetDiceToRoller(traitSetArg: TraitSet) {
		if (!traitSetArg) return;
		const diceToAdd: StagedDiePayload[] = [];
		const poolName = traitSetArg.name || props.character.name || 'Challenge Pool';
		for (const tr of traitSetArg.traits || []) {
			const dice = availableDice(tr, [traitSetArg]);
			const hitches = resolveHitches(tr, [traitSetArg]);
			const keep = keepsExtraDice(tr);
			for (const d of dice) {
				diceToAdd.push({ size: d, qty: 1, source: tr.name || poolName, hitches: hitches, keepsExtra: keep });
			}
		}
		if (diceToAdd.length > 0) {
			emit('addDieToRoller', diceToAdd);
		}
	}

	// Template-facing rating reads (one shape; no value/dice in templates).
	function firstDie(trait: Trait) {
		return ratingDice(resolveTraitRating(trait))[0] || 0;
	}

	function isDieActive(trait: Trait, size: number) {
		return firstDie(trait) === size;
	}

	function isTraitRated(trait: Trait) {
		return isRated(trait, [traitSet.value]);
	}

	// Spendable drives the spend control (trait wins, set inherits).
	function nodeSpendable(node: unknown): boolean | undefined {
		const n = (node && typeof node === 'object' ? node : undefined) as { spendable?: unknown } | undefined;
		if (n && typeof n.spendable === 'boolean') return n.spendable;
		return undefined;
	}

	function isSpendable(trait: Trait, traitSetArg?: TraitSet) {
		const t = nodeSpendable(trait);
		if (t !== undefined) return t;
		if (traitSetArg) {
			const s = nodeSpendable(traitSetArg);
			if (s !== undefined) return s;
		}
		return false;
	}

	function canMutatePoolOnCanvas(trait: Trait, traitSetArg?: TraitSet): boolean {
		if (props.printBlank) return false;
		if (props.submode === 'edit') return true;
		if (props.submode !== 'play') return false;
		const ts = traitSetArg ?? traitSet.value;
		return Boolean(
			nodePool(trait) === true ||
			(ts && nodePool(ts) === true) ||
			isSpendable(trait, ts) ||
			(ts && isPlayMutableSet(ts)),
		);
	}

	function getPoolAddRange(trait: Trait, traitSetArg?: TraitSet): number[] {
		const ts = traitSetArg ?? traitSet.value;
		const resolved = resolveRating(trait, ts ? [ts] : undefined);
		if (resolved && Array.isArray(resolved.range) && resolved.range.length > 0) {
			return resolved.range;
		}
		const rCell = (getView(ts)?.parts as Record<string, { range?: number[] }> | undefined)?.rating;
		if (rCell && Array.isArray(rCell.range) && rCell.range.length > 0) {
			return rCell.range;
		}
		const setLadder = ts ? getTraitSetRatings(ts) : [];
		return setLadder.length > 0 ? setLadder : [4, 6, 8, 10, 12];
	}

	function addDieToPoolTrait(sArg: number, tIdx: number | null | undefined, dieSize: number) {
		if (props.submode === 'print' || typeof tIdx !== 'number') return;
		const set = props.character?.traitSets?.[sArg];
		const trait = set?.traits?.[tIdx];
		if (!trait || !Number.isFinite(dieSize) || dieSize <= 0) return;
		const cur = characterCurioFunctions.getTraitDice(trait, [set]);
		characterCurioFunctions.setTraitDice(trait, [...cur, Number(dieSize)]);
		if (trait.rating && typeof trait.rating === 'object') {
			trait.rating.type = 'Dice';
		}
		updateCharacter(props.character);
	}

	function removeDieFromPoolTrait(sArg: number, tIdx: number | null | undefined, dieIndex: number) {
		if (props.submode === 'print' || typeof tIdx !== 'number') return;
		const set = props.character?.traitSets?.[sArg];
		const trait = set?.traits?.[tIdx];
		if (!trait) return;
		const cur = characterCurioFunctions.getTraitDice(trait, [set]);
		if (dieIndex < 0 || dieIndex >= cur.length) return;
		const next = [...cur];
		next.splice(dieIndex, 1);
		characterCurioFunctions.setTraitDice(trait, next);
		if (next.length > 0 && trait.rating && typeof trait.rating === 'object') {
			trait.rating.type = 'Dice';
		}
		const viewBag = getView(trait);
		if (viewBag && Array.isArray(viewBag.spentDice)) {
			viewBag.spentDice = viewBag.spentDice
				.filter((i: number) => i !== dieIndex)
				.map((i: number) => (i > dieIndex ? i - 1 : i));
			if (!viewBag.spentDice.length) delete viewBag.spentDice;
		}
		updateCharacter(props.character);
	}

	function getTraitSetSlotCount(traitSetArg: TraitSet) {
		const custom = getView(traitSetArg);
		const bodyStyle = custom?.style?.body;

		const traitsAll = traitSetArg.traits || [];
		const frameCfg = resolveFrame(traitSetArg);
		const hasExplicitRingTraits = traitsAll.some((t: Trait) => Boolean(getView(t)?.ring));
		const isPureRingWithoutImage =
			(frameCfg?.shape === 'ring' || bodyStyle === 'portrait-ring') && !frameCfg?.image?.url && !hasExplicitRingTraits;
		const isName = isNameSet(traitSetArg);
		const listTraitsCount = traitsAll.filter((t: Trait) => {
			if (getView(t)?.ring) return false;
			if (isPureRingWithoutImage) return false;
			if (isName && isNameIdentitySlotTrait(t)) return false;
			return true;
		}).length;

		const configured = custom?.reservedSlots;
		if (configured !== undefined && configured !== null && String(configured) !== '') {
			return Math.max(Number(configured) || 0, listTraitsCount);
		}

		return listTraitsCount;
	}

	function stageRawDie(payload: StagedDiePayload | StagedDiePayload[]) {
		emit('addDieToRoller', payload);
	}

	const api = {
		traitSet,
		s,
		traitSets,
		character,
		submode,
		editing,
		printBlank,
		viewY,
		getView,
		ensureView,
		getTraitSetLabel,
		isSelected,
		renderText,
		renderNotesText,
		getTraitSetClasses,
		getRatingPlacement,
		getRatingDisplay,
		getPipChild,
		isChildPipFilled,
		togglePip,
		canEditChildOnSheet,
		setPipChildName,
		getParts,
		partsGridFor,
		partCellStyle,
		partsGridStyle,
		isPartsInline,
		getCounterLabel,
		getTraitCounter,
		hasTraitCounter,
		renderDieValue,
		selectElement,
		updateCharacter,
		addTrait,
		removeTrait,
		removeTraitSet,
		getTraitClasses,
		getRenderedTraits,
		createBlankSlotTrait,
		isFixedSystemTrait,
		renderDieValueForPrint,
		openTraitAt,
		fillPlaceholder,
		isTraitShown,
		getTraitSetRatings,
		getSubtraitRatings,
		getTraitDice,
		isDieSpent,
		toggleDieSpentInPlay,
		handleDieClick,
		handleSingleDieClick,
		handleSteppedDieClick,
		handleOutClick,
		shouldShowOut,
		isTraitOut,
		hasTrackPart,
		getTrackLabel,
		getTraitTrackLabel,
		getTrackScale,
		getTrackValue,
		getTrackCompanion,
		isTrackCompanion,
		visibleSubtraits,
		shouldShowTrackOut,
		isTrackOut,
		handleTrackClick,
		handleTrackOutClick,
		getPipConfig,
		getPipRowCount,
		getPipRowCols,
		getPipIndex,
		isPipFilled,
		handlePipClick,
		getPipTrack,
		setPipTrack,
		pipRowFilled,
		isPipLabels,
		pipRows,
		ensurePipTrait,
		togglePipRow,
		openPipRow,
		addPipRow,
		setPipRowName,
		getImageSetContainerStyle,
		getImageSetGraphicStyle,
		getBranchGroups,
		hasBranchSplit,
		hasBranchFlank,
		getFlankColumns,
		getBranchRole,
		getSetRatingDie,
		getBranchSide,
		branchSubs,
		handleBranchFlatClick,
		getSubtraitAt,
		getSubtraitSlotRatings,
		getSubtraitNameOr,
		getThreeColEffect,
		getDiceCount,
		setDiceCount,
		getDiceCountPool,
		getPrintTallyPips,
		isPoolSet,
		addTraitSetDiceToRoller,
		nodePool,
		stagesWholePool,
		stageTraitDice,
		nodeSpendable,
		isSpendable,
		firstDie,
		isDieActive,
		isTraitRated,
		resolveTraitRating,
		getRating,
		ratingDice,
		isRated,
		availableDice,
		resolveHitches,
		rollSeparate,
		keepsExtraDice,
		isHiddenIn,
		getTraitSetSlotCount,
		isPlayMutableSet,
		getAltRoll,
		handleAltRollClick,
		stageTrackDie,
		stageSetDie,
		stageRawDie,
		isSetPartActive,
		toggleSetPart,
		stepTraitCounter,
		isCanvasTraitActive,
		toggleCanvasTrait,
		openCanvasTrait,
		closeCanvasTrait,
		isTraitPartMenuOpen,
		toggleTraitPartMenu,
		requestCanvasFocus,
		isTraitDescInlineOpen,
		hasTraitPartActive,
		toggleTraitPart,
		isCanvasSetActive,
		openCanvasSet,
		closeCanvasSet,
		isInlineTrackLabelOpen,
		openInlineTrackLabel,
		closeInlineTrackLabel,
		setTraitTrackLabel,
		finalizeTraitTrackLabel,
		isPoolAddOpen,
		togglePoolAdd,
		closePoolAdd,
		canMutatePoolOnCanvas,
		getPoolAddRange,
		addDieToPoolTrait,
		removeDieFromPoolTrait,
		isCanvasPartDrawerOpen,
		toggleCanvasPartDrawer,
		getTraitPipBubbles,
		toggleTraitPipBubble,
		getDynamicChildParts,
		parseChildPartKey,
		isPipChildPart,
		hasChildPartCell,
		getChildTraitByNoun,
		resolvedBorder,
		resolvedFrame,
		traitArrayMode,
		portraitFrameShape,
		showPortraitHub,
		setOwnImageUrl,
		isFrameForcedOff,
		frameToggledOff,
		isFrameActive,
		isPositionalFrameActive,
		frameSvgPath,
		frameColorClass,
		frameStrokeClass,
		frameStrokeStyle,
		traitSetFrameStyle,
		frameAnchors,
		getTraitAnchorStyle,
		getTraitAnchorDock,
		getTraitAnchorHemisphere,
		getTraitNameAnchorStyle,
		containerWidth,
		observeContainer,
		effectiveImageUrl,
		effectiveAlignment,
		effectiveZoom,
		effectivePortraitStyle,
	};

	provide(TRAIT_SET_KEY, api);
	return api;
}

export function injectTraitSet(): TraitSetApi {
	const api = inject(TRAIT_SET_KEY);
	if (!api) throw new Error('use-trait-set: injectTraitSet() called outside a TraitSetBlock');
	return api;
}
