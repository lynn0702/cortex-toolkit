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
} from './model.ts';
import { KNOWN_PARTS, isKnownPart, partsGrid, partCellStyle, partsGridStyle } from './sheet-grid.ts';
import type { Character, Trait, TraitSet } from './model.ts';

export type TraitSetApi = ReturnType<typeof useTraitSet>;

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

export function useTraitSet(props: TraitSetProps, emit: any) {
	const traitSet = computed(() => props.character?.traitSets?.[props.traitSetID as any]);
	const s = computed<number>(() => props.traitSetID as number);
	const traitSets = computed(() => props.character?.traitSets ?? []);
	const character = computed(() => props.character);
	const submode = computed(() => props.submode);
	const editing = computed(() => props.editing);
	const printBlank = computed(() => props.printBlank);
	const viewY = computed(() => props.viewY);

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

	const effectiveImageUrl = computed(() => {
		if (setOwnImageUrl.value) return setOwnImageUrl.value;
		if (traitArrayMode.value !== 'none' || getView(traitSet.value)?.style?.body === 'portrait-ring') {
			return props.character?.portrait?.url || '';
		}
		return '';
	});

	const effectiveAlignment = computed(() => {
		const fAlign = resolvedFrame.value?.image?.alignment;
		const view = getView(traitSet.value);
		const sAlign = view?.imageConfig?.alignment;
		const charAlign =
			(getView(props.character?.portrait)?.alignment as string | undefined) ||
			(props.character?.portrait as any)?.alignment;
		return fAlign || sAlign || charAlign || 'center';
	});

	const effectiveZoom = computed(() => {
		const fZoom = normalizeZoom(resolvedFrame.value?.image?.zoom);
		if (typeof fZoom === 'number') return fZoom;
		const view = getView(traitSet.value);
		const sZoom = normalizeZoom(view?.imageConfig?.zoom);
		if (typeof sZoom === 'number') return sZoom;
		const charZoom = normalizeZoom(getView(props.character?.portrait)?.zoom);
		if (typeof charZoom === 'number') return charZoom;
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
		if (labels && labels[key] !== undefined && labels[key] !== null && String(labels[key]).length) {
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

		const bodyStyle = getView(traitSetArg)?.style?.body || 'default';
		classes['trait-set-style-' + bodyStyle] = true;

		if (bodyStyle === 'subtrait-columns' && getView(traitSetArg)?.branchArrows === false) {
			classes['hide-branch-arrows'] = true;
		}

		const ratingPos = getRatingPlacement(traitSetArg);
		if (ratingPos && ratingPos !== 'inline') {
			classes['rating-pos-' + ratingPos] = true;
		}

		const hasPip =
			Array.isArray(traitSetArg?.traits) && traitSetArg.traits.some((t: any) => getPipChild(t) !== undefined);
		if (hasPip) {
			classes['trait-set-pip-mode'] = true;
		}

		const hasCounter = (Array.isArray(traitSetArg?.traits) ? traitSetArg.traits : []).some(
			(t: any) => getRating(t)?.type === 'Counter',
		);
		if (hasCounter) {
			classes['trait-set-has-counter'] = true;
		}

		const traits = Array.isArray(traitSetArg?.traits)
			? traitSetArg.traits
			: traitSetArg?.traits
				? Object.values(traitSetArg.traits)
				: [];
		if (traits.some((t: any) => typeof t?.description === 'string' && t.description.trim().length > 0)) {
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
		if ((ctk?.pips as any) === false) {
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
		return (traitSetArg as any)?.ratingDisplay || getView(traitSetArg)?.ratingDisplay || 'track';
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

		const hasStatementPip =
			Array.isArray(traitSetArg?.traits) &&
			traitSetArg.traits.some((t: any) => {
				const r = getRating(t);
				if (r?.type === 'Pip') return true;
				return Array.isArray(t?.traits) && t.traits.some((sub: any) => getRating(sub)?.type === 'Pip');
			});

		if (
			hasStatementPip &&
			parts.name &&
			parts.rating &&
			Number(parts.name.top || 0) === 0 &&
			Number(parts.rating.top || 0) === 0 &&
			!parts['child:Statement:rating'] &&
			!parts['child:Statement:label'] &&
			!parts['child:Statement']
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
			parts['child:Statement:rating'] = { left: '40%', top: 0, width: '10%', height: 1 };
			parts.rating = { ...parts.rating, left: '50%', top: 0, width: '50%', height: 1 };
			parts['child:Statement:label'] = { left: '0%', top: nextTop, width: '100%', height: 1 };
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

	function getPipChild(node: any): Trait | undefined {
		if (!node || !Array.isArray(node.traits)) return undefined;
		for (const ch of node.traits) {
			if (!ch || typeof ch !== 'object') continue;
			const r = getRating(ch);
			if (r && r.type === 'Pip') return ch;
			if (Array.isArray(ch.traits)) {
				const nested = ch.traits.find((sub: any) => getRating(sub)?.type === 'Pip');
				if (nested) return nested;
			}
		}
		return undefined;
	}

	function isChildPipFilled(node: any): boolean {
		const child = getPipChild(node);
		return Boolean(child?.rating?.type === 'Pip' && child.rating.value?.[0] === true);
	}

	function togglePip(sArg: any, t: any, traitArg?: Trait) {
		if (props.submode === 'print') return;
		const trait = traitArg ?? props.character?.traitSets?.[sArg]?.traits?.[t];
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

	function canEditChildOnSheet(trait: any, traitSetArg: any): boolean {
		if (props.submode === 'print') return false;
		return Boolean(
			getView(trait)?.editableOnSheet || getView(traitSetArg)?.editableOnSheet || getView(traitSetArg)?.playMutable,
		);
	}

	function setPipChildName(trait: any, val: string) {
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

	function getCounterLabel(traitSetArg: TraitSet) {
		return traitSetArg?.counterLabel || getView(traitSetArg)?.counterLabel || 'XP';
	}

	function getTraitCounter(trait: Trait) {
		return trait?.xp ?? trait?.counter ?? trait?.custom?.xp ?? trait?.custom?.counter ?? getView(trait)?.xp ?? '';
	}

	function renderDieValue(value: number, isActive = true) {
		return characterCurioFunctions.renderDieconSVG(value, isActive, '', getView(props.character)?.diceConfig);
	}

	function selectElement(selector: unknown[]) {
		emit('selectElement', selector);
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
		if (characterCurioFunctions.sfxChildren(trait).length) classes['trait-has-sfx'] = true;
		if (nonSfxSubtraits(trait).length) classes['trait-has-subtraits'] = true;
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

		const existing = existingAll.filter((t: Trait) => {
			if (getView(t)?.ring) return false;
			if (isPureRingWithoutImage) return false;
			return true;
		});

		if (props.printBlank) {
			const targetCount = getTraitSetSlotCount(traitSetArg);
			const list: any[] = [];
			const visible = existing
				.map((t: Trait, idx: number) => ({ trait: t, originalIndex: idx }))
				.filter(({ trait }: { trait: Trait }) => isTraitShown(trait));
			for (let i = 0; i < targetCount; i++) {
				if (i < visible.length) {
					list.push({ trait: visible[i].trait, originalIndex: visible[i].originalIndex, isPlaceholder: false });
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
		const mapped = existing.map((t: Trait, idx: number) => ({ trait: t, originalIndex: idx, isPlaceholder: false }));
		const visible = mapped.filter(({ trait }: { trait: Trait }) => isTraitShown(trait));
		const targetCount = Math.max(getTraitSetSlotCount(traitSetArg), visible.length);
		const list: any[] = [...visible];
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
	function openTraitAt(sArg: any, item: any) {
		if (!item) return;
		if (item.isPlaceholder) {
			if (props.submode === 'play' && !isPlayMutableSet(traitSet.value)) {
				return;
			}
			fillPlaceholder(sArg);
			return;
		}
		selectElement(['trait', sArg, item.originalIndex]);
	}

	function fillPlaceholder(sArg: any) {
		const set = props.character.traitSets[sArg];
		if (!set || !Array.isArray(set.traits)) return;
		set.traits.push(createBlankSlotTrait(set));
		updateCharacter(props.character);
		selectElement(['trait', sArg, set.traits.length - 1]);
	}

	function createBlankSlotTrait(traitSetArg: TraitSet): any {
		const traits = Array.isArray(traitSetArg?.traits)
			? traitSetArg.traits
			: traitSetArg?.traits && typeof traitSetArg.traits === 'object'
				? Object.values(traitSetArg.traits)
				: [];
		const hasSubtraits = traits.some((t: any) => {
			const subs = Array.isArray(t?.traits)
				? t.traits
				: t?.traits && typeof t.traits === 'object'
					? Object.values(t.traits)
					: [];
			return subs.some((s: any) => !characterCurioFunctions.isSfxContainer(s) && getRating(s)?.type !== 'Pip');
		});
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
		const name = trait.name.trim();
		if (name.endsWith(':')) return false;
		const tsBody = getView(traitSetArg)?.style?.body;
		const tsName = (traitSetArg?.name || '').toLowerCase();
		if (
			tsBody === 'portrait-ring' ||
			tsBody === 'die-track' ||
			characterCurioFunctions.isFixedNameSet(tsName) ||
			(getView(traitSetArg)?.traitColumns ?? 0) > 1 ||
			characterCurioFunctions.hasTrackPart(traitSetArg)
		) {
			return true;
		}
		const templateId = getView(props.character)?.template;
		if (templateId) {
			let tpl: any = null;
			// 1. Local first: check user-owned templates & characters
			try {
				if (typeof (window as any)?.characterCurioStorage?.loadData === 'function') {
					const data = (window as any).characterCurioStorage.loadData();
					if (data) {
						const localTemplates = data.templates || [];
						const localChars = data.characters || [];
						tpl =
							localTemplates.find(
								(t: any) =>
									t.id === templateId || t.title === templateId || t.template === templateId || t.name === templateId,
							) ||
							localChars.find(
								(c: any) => (c.isTemplate || c.id === templateId) && (c.id === templateId || c.name === templateId),
							) ||
							null;
					}
				}
			} catch {}
			// 2. Library second
			if (!tpl && typeof (window as any)?.characterCurioLibraryTemplates !== 'undefined') {
				const tpls = (window as any).characterCurioLibraryTemplates;
				if (Array.isArray(tpls)) {
					tpl =
						tpls.find((t: any) => t.id === templateId || t.title === templateId || t.template === templateId) || null;
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
		return characterCurioFunctions.getTraitDice(trait);
	}

	// Positional subtrait access: paired slots keep complication at 0
	// and bonus at 1. Index is the truth; names are labels. The SFX
	// container is a child trait, not a subtrait, so positional access
	// reads past it.
	function nonSfxSubtraits(trait: Trait) {
		const subs = (trait as any)?.traits;
		return (Array.isArray(subs) ? subs : []).filter(
			(st: any) => !characterCurioFunctions.isSfxContainer(st) && getRating(st)?.type !== 'Pip',
		);
	}

	function getSubtraitAt(trait: Trait, index: number) {
		return nonSfxSubtraits(trait)[index] || null;
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

	function toggleDieSpentInPlay(sArg: any, t: any, index: number) {
		const trait = props.character.traitSets[sArg].traits[t];
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
		const dice = availableDice(trait);
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

	function handleDieClick(trait: Trait, dieSize: number, dIdx: number, traitSetArg: TraitSet, sArg: any, t: any) {
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
		} else {
			selectElement(['trait', sArg, t]);
		}
	}

	function handleSingleDieClick(
		trait: Trait,
		value: number | null | undefined,
		traitSetArg: TraitSet,
		sArg: any,
		t: any,
	) {
		if (props.submode === 'play') {
			const first = ratingDice(getRating(trait))[0];
			const targetVal = value || first;
			if (value !== undefined && value !== null) {
				if (!first || first !== value) {
					setRatingDie(trait as unknown as Record<string, any>, value);
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
		} else {
			selectElement(['trait', sArg, t]);
		}
	}

	function traitHasHinder(trait: Trait, traitSetArg: TraitSet): boolean {
		if (!trait || !isTraitRated(trait)) return false;
		const children = characterCurioFunctions.sfxChildren(trait);
		return children.some((e: any) => String(e.name || '').toLowerCase() === 'hinder');
	}

	function hinderDie(trait: Trait): number {
		const children = characterCurioFunctions.sfxChildren(trait);
		const hinder = children.find((e: any) => String(e.name || '').toLowerCase() === 'hinder');
		return ratingDice(getRating(hinder))[0] || 0;
	}

	function handleHinderDieClick(trait: Trait, traitSetArg: TraitSet, sArg: any, t: any) {
		if (props.submode === 'play') {
			const children = characterCurioFunctions.sfxChildren(trait);
			const hinder = children.find((e: any) => String(e.name || '').toLowerCase() === 'hinder');
			const size = ratingDice(getRating(hinder))[0] || 4;
			emit('addDieToRoller', {
				size: size,
				qty: 1,
				source: trait.name ? `${trait.name} (Hinder)` : 'Hinder',
				hitches: resolveHitches(trait, [traitSetArg]),
				ppDelta: 1,
				ppCommitted: false,
			});
		}
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

	function handleSteppedDieClick(sArg: any, t: any, value: number) {
		if (props.submode === 'play') {
			const trait = props.character.traitSets[sArg].traits[t];
			const cur = ratingDice(getRating(trait))[0];
			if (cur === value && !trait.isOut) {
				setRatingDie(trait as unknown as Record<string, any>, null);
			} else {
				setRatingDie(trait as unknown as Record<string, any>, value);
				trait.isOut = false;
			}
			updateCharacter(props.character);
		} else {
			selectElement(['trait', sArg, t]);
		}
	}

	function handleOutClick(sArg: any, t: any) {
		if (props.submode === 'play') {
			const trait = props.character.traitSets[sArg].traits[t];
			const traitSetArg = props.character.traitSets[sArg];
			trait.isOut = !trait.isOut;
			if (trait.isOut) {
				setRatingDie(trait as unknown as Record<string, any>, rangeTop(trait, [traitSetArg]) + 2);
				const r = (trait as any).rating;
				if (r && typeof r === 'object' && (r.type === 'Die' || r.type === 'Dice')) r.out = true;
			} else {
				setRatingDie(trait as unknown as Record<string, any>, null);
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
		const companion = getTrackCompanion(traitSetArg, trait);
		if (companion && typeof companion.name === 'string' && companion.name.trim().length > 0) {
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
		const subs = (trait as any)?.traits;
		if (!Array.isArray(subs)) return undefined;
		const fallbackName = getTrackLabel(traitSetArg).toLowerCase();
		// 1. Direct match by set's track label
		const direct = subs.find(
			(st: any) =>
				st && typeof st === 'object' && typeof st.name === 'string' && st.name.toLowerCase() === fallbackName,
		);
		if (direct) return direct;
		// 2. Trait-specific companion track (e.g. Physical's companion is named "Injured", Mental is "Worried")
		if (hasTrackPart(traitSetArg)) {
			return subs.find(
				(st: any) =>
					st &&
					typeof st === 'object' &&
					st.rating &&
					!characterCurioFunctions.isSfxContainer(st) &&
					Array.isArray(st.rating.range),
			);
		}
		return undefined;
	}

	function isTrackCompanion(traitSetArg: TraitSet, sub: unknown, trait?: Trait) {
		if (!hasTrackPart(traitSetArg) || !sub || typeof sub !== 'object') return false;
		if (trait) {
			return getTrackCompanion(traitSetArg, trait) === sub;
		}
		const subName = (sub as any)?.name;
		if (typeof subName === 'string' && subName.toLowerCase() === getTrackLabel(traitSetArg).toLowerCase()) {
			return true;
		}
		const r = (sub as any)?.rating;
		return Boolean(r && !characterCurioFunctions.isSfxContainer(sub) && Array.isArray(r.range));
	}

	function visibleSubtraits(traitSetArg: TraitSet, trait: Trait) {
		const subs = nonSfxSubtraits(trait);
		if (!subs.length) return [];
		const pipChild = getPipChild(trait);
		const nonStatementSubs = pipChild ? subs.filter((st: any) => st !== pipChild) : subs;
		if (!nonStatementSubs.length) return [];
		const comp = hasTrackPart(traitSetArg) ? getTrackCompanion(traitSetArg, trait) : null;
		const list = comp ? nonStatementSubs.filter((st: any) => st !== comp) : nonStatementSubs;
		return list.filter((st: any) => isTraitShown(st));
	}

	function shouldShowTrackOut(traitSetArg: TraitSet) {
		return Boolean(getView(traitSetArg)?.outIndicator === true);
	}

	function isTrackOut(trait: Trait, traitSetArg?: TraitSet) {
		const companion = traitSetArg ? getTrackCompanion(traitSetArg, trait) : undefined;
		if (!companion) return false;
		return isOutDie(companion, traitSetArg ? [traitSetArg] : undefined);
	}

	function handleTrackClick(sArg: any, t: any, size: number) {
		if (props.submode === 'print') return;
		const set = props.character.traitSets[sArg];
		const trait = set?.traits?.[t];
		if (!trait) return;
		if (!Array.isArray(trait.traits)) trait.traits = [];
		const companion: any = getTrackCompanion(set, trait);
		if (companion) {
			const cur = getTraitDice(companion)[0] || 0;
			if (cur === size) {
				const idx = trait.traits.indexOf(companion);
				if (idx !== -1) trait.traits.splice(idx, 1);
			} else {
				characterCurioFunctions.setTraitDice(companion, [size]);
			}
		} else {
			const name = getTrackLabel(set);
			(trait.traits as any[]).push({ name, rating: { type: 'Die', value: [size], range: getTrackScale(set).slice() } });
		}
		updateCharacter(props.character);
	}

	function handleTrackOutClick(sArg: any, t: any) {
		if (props.submode === 'print') return;
		const set = props.character.traitSets[sArg];
		const trait = set?.traits?.[t];
		if (!trait) return;
		if (!Array.isArray(trait.traits)) trait.traits = [];
		let companion: any = getTrackCompanion(set, trait);
		if (!companion) {
			const name = getTrackLabel(set);
			const scale = getTrackScale(set);
			companion = { name, rating: { type: 'Die', value: [scale[0] || 4], range: scale.slice(), out: true } };
			(trait.traits as any[]).push(companion);
		} else {
			companion.isOut = !companion.isOut;
			const r = companion.rating;
			if (r && typeof r === 'object' && (r.type === 'Die' || r.type === 'Dice')) {
				r.out = Boolean(companion.isOut);
			}
			if (!companion.isOut && !((getTraitDice(companion)[0] || 0) > 0)) {
				trait.traits.splice(trait.traits.indexOf(companion), 1);
			}
		}
		updateCharacter(props.character);
	}

	function getPipConfig(traitSetArg: TraitSet) {
		const ctk = getView(traitSetArg);
		const p = ctk?.pips;
		const perRow = (p as any)?.perRow ?? 5;
		const connected = (p as any)?.connected !== false;
		return {
			perRow: Math.max(1, perRow),
			connected,
			labels: (p as any)?.labels === true,
		};
	}

	function getPipRowCount(traitSetArg: TraitSet) {
		const cfg = getPipConfig(traitSetArg);
		return Math.ceil(getPipTrack(traitSetArg).count / cfg.perRow);
	}

	function getPipRowCols(traitSetArg: TraitSet, rowIdx: number) {
		const cfg = getPipConfig(traitSetArg);
		const remaining = getPipTrack(traitSetArg).count - (rowIdx - 1) * cfg.perRow;
		return Math.min(cfg.perRow, Math.max(0, remaining));
	}

	function getPipIndex(traitSetArg: TraitSet, rowIdx: number, colIdx: number) {
		const cfg = getPipConfig(traitSetArg);
		return (rowIdx - 1) * cfg.perRow + (colIdx - 1);
	}

	// Pure-track state lives on the set node's own Pip rating: value is
	// the list of bubbles, range[0] the bubble count.
	function getPipTrack(traitSetArg: TraitSet): { count: number; filled: number } {
		const rating = getRating(traitSetArg);
		let count = 25;
		let filled = 0;
		if (rating && rating.type === 'Pip') {
			if (Array.isArray(rating.range) && typeof rating.range[0] === 'number' && rating.range[0] > 0) {
				count = Math.floor(rating.range[0]);
			} else if (Array.isArray(rating.value) && rating.value.length > 0) {
				count = rating.value.length;
			}
			if (Array.isArray(rating.value)) {
				filled = rating.value.filter((v) => v === true).length;
			}
		}
		return { count, filled };
	}

	function setPipTrack(traitSetIndex: number, count: number, filled: number) {
		const ts = traitSets.value[traitSetIndex];
		if (!ts) return;
		const bubbles: boolean[] = [];
		for (let i = 0; i < count; i++) bubbles.push(i < filled);
		(ts as unknown as Record<string, any>).rating = { type: 'Pip', value: bubbles };
		updateCharacter(props.character);
	}

	function isPipFilled(traitSetArg: TraitSet, pipIdx: number) {
		if (props.printBlank) return false;
		return pipIdx < getPipTrack(traitSetArg).filled;
	}

	function handlePipClick(traitSetIndex: number, pipIdx: number) {
		if (props.submode === 'print') return;
		const ts = traitSets.value[traitSetIndex];
		if (!ts) return;
		const track = getPipTrack(ts);
		const curFilled = track.filled;
		const next = curFilled === pipIdx + 1 ? pipIdx : pipIdx + 1;
		setPipTrack(traitSetIndex, track.count, next);
	}

	// Pip-with-label rows (the unified pips style): row i pairs the count
	// grid with the i-th trait, if any. Named traits render beside their
	// bubble; blank rows render bare. Filled prefers the trait's own Pip
	// rating, then its checked flag, then the filled count.
	function isPipLabels(traitSetArg: TraitSet) {
		return getPipConfig(traitSetArg).labels === true;
	}

	function pipRowFilled(t: any, index: number, filledCount: number): boolean {
		if (t && typeof t === 'object') {
			const rating = getRating(t);
			if (rating && rating.type === 'Pip' && Array.isArray(rating.value) && rating.value.length) {
				return rating.value[0] === true;
			}
		}
		return !props.printBlank && index < filledCount;
	}

	function pipRows(traitSetArg: TraitSet) {
		const cfg = getPipConfig(traitSetArg);
		const track = getPipTrack(traitSetArg);
		const traits = Array.isArray(traitSetArg?.traits) ? traitSetArg.traits : [];
		const n = Math.max(track.count, traits.length);
		const rows: { index: number; trait: any; filled: boolean; name: string }[] = [];
		for (let i = 0; i < n; i++) {
			const t = traits[i];
			const named = t && typeof t === 'object' && typeof t.name === 'string' && t.name.length ? t : null;
			rows.push({
				index: i,
				trait: named,
				filled: pipRowFilled(t, i, track.filled),
				name: named ? (named as any).name : '',
			});
		}
		return rows;
	}

	function getTraitPipBubbles(trait: Trait | undefined): boolean[] {
		const r = getRating(trait);
		if (r && r.type === 'Pip' && Array.isArray(r.value)) {
			const count = Array.isArray(r.range) && r.range[0] ? r.range[0] : r.value.length || 5;
			const bubbles: boolean[] = [];
			for (let i = 0; i < count; i++) bubbles.push(Boolean(r.value[i] === true));
			return bubbles;
		}
		return [];
	}

	function toggleTraitPipBubble(trait: Trait | undefined, pipIndex: number) {
		if (props.submode === 'print' || !trait) return;
		const r = getRating(trait);
		if (!r || r.type !== 'Pip') return;
		const count = r.value.length || 5;
		const bubbles: boolean[] = [];
		for (let i = 0; i < count; i++) bubbles.push(Boolean(r.value[i] === true));
		bubbles[pipIndex] = !bubbles[pipIndex];
		(trait as any).rating = { type: 'Pip', value: bubbles };
		updateCharacter(props.character);
	}

	function getDynamicChildParts(traitSetArg: TraitSet): string[] {
		const parts = getParts(traitSetArg) || {};
		return Object.keys(parts).filter((k) => k.startsWith('child:') || k.startsWith('child_'));
	}

	function parseChildPartKey(partKey: string): { noun: string; kind: 'label' | 'rating' } {
		if (partKey.startsWith('child:')) {
			const segs = partKey.slice(6).split(':');
			return { noun: segs[0] || 'Child', kind: segs[1] === 'rating' ? 'rating' : 'label' };
		}
		if (partKey.startsWith('child_')) {
			const rest = partKey.slice(6);
			if (rest.endsWith('_rating')) {
				return { noun: rest.slice(0, -7), kind: 'rating' };
			}
			if (rest.endsWith('_text') || rest.endsWith('_label')) {
				return { noun: rest.slice(0, -5), kind: 'label' };
			}
			return { noun: rest, kind: 'label' };
		}
		return { noun: partKey, kind: 'label' };
	}

	function isPipChildPart(partKey: string): boolean {
		const n = parseChildPartKey(partKey).noun.toLowerCase();
		return n === 'pip' || n === 'statement';
	}

	function hasChildPartCell(traitSetArg: TraitSet, noun: string, kind?: 'label' | 'rating'): boolean {
		const grid = partsGridFor(traitSetArg);
		if (!grid?.cells) return false;
		const n = noun.toLowerCase();
		return Object.keys(grid.cells).some((k) => {
			const parsed = parseChildPartKey(k);
			const cellNoun = parsed.noun.toLowerCase();
			if (cellNoun !== n && !(n === 'pip' && cellNoun === 'statement')) return false;
			if (kind && parsed.kind !== kind) return false;
			return true;
		});
	}

	function getChildTraitByNoun(trait: Trait | undefined, noun: string): Trait | undefined {
		if (!trait) return undefined;
		const n = noun.trim().toLowerCase();
		if (n === 'sfx') {
			const entries = characterCurioFunctions.sfxChildren(trait);
			return entries.find(
				(e: any) =>
					String(e?.name || '')
						.trim()
						.toLowerCase() !== 'hinder',
			) as Trait | undefined;
		}
		if (!Array.isArray(trait.traits)) return undefined;
		return trait.traits.find((t: Trait) => (t?.name || '').trim().toLowerCase() === n);
	}

	function blankPipTrait(): any {
		return { name: '', description: '', traits: [], tags: [], custom: {} };
	}

	function ensurePipTrait(traitSetIndex: number, itemIndex: number) {
		const ts = traitSets.value[traitSetIndex];
		if (!ts) return null;
		if (!ts.traits) ts.traits = [];
		while (ts.traits.length <= itemIndex) {
			ts.traits.push(blankPipTrait());
		}
		return ts.traits[itemIndex];
	}

	function togglePipRow(traitSetIndex: number, itemIndex: number) {
		if (props.submode === 'print') return;
		const ts = traitSets.value[traitSetIndex];
		if (!ts) return;
		if (!isPipLabels(ts)) return handlePipClick(traitSetIndex, itemIndex);
		const trait = ensurePipTrait(traitSetIndex, itemIndex);
		if (!trait) return;
		const next = !pipRowFilled(trait, itemIndex, 0);
		(trait as unknown as Record<string, any>).rating = { type: 'Pip', value: [next] };
		updateCharacter(props.character);
	}

	function openPipRow(traitSetIndex: number, itemIndex: number) {
		if (props.submode === 'print') return;
		ensurePipTrait(traitSetIndex, itemIndex);
		updateCharacter(props.character);
		selectElement(['trait', traitSetIndex, itemIndex]);
	}

	// Inline rename for labeled rows: the name is a write-in line on the
	// row itself. Position (and the Pip rating) is untouched.
	function setPipRowName(traitSetIndex: number, itemIndex: number, name: string) {
		if (props.submode === 'print') return;
		const trait = ensurePipTrait(traitSetIndex, itemIndex);
		if (!trait) return;
		const clean = typeof name === 'string' ? name.trim() : '';
		if ((trait as any).name === clean) return;
		(trait as any).name = clean;
		updateCharacter(props.character);
	}

	function addPipRow(traitSetIndex: number) {
		const ts = traitSets.value[traitSetIndex];
		if (!ts) return;
		if (!ts.traits) ts.traits = [];
		ts.traits.push(blankPipTrait());
		const track = getPipTrack(ts);
		if (track.count < ts.traits.length) {
			setPipTrack(traitSetIndex, ts.traits.length, track.filled);
			const view = ensureView(ts);
			view.reservedSlots = ts.traits.length;
		}
		updateCharacter(props.character);
	}

	function getImageSetContainerStyle(traitSetArg: TraitSet) {
		const cfg = getView(traitSetArg)?.imageConfig;
		const h = cfg?.height;
		const w = cfg?.width;
		const widthStyle = w && w !== '100%' ? { width: w, marginInline: 'auto' } : {};
		if (h && h !== 'auto') {
			return { height: h, ...widthStyle };
		}
		if (isNameSet(traitSetArg)) return { minHeight: '96px', height: '100%', ...widthStyle };
		return { minHeight: '140px', height: 'auto', ...widthStyle };
	}

	function getImageSetGraphicStyle(traitSetArg: TraitSet) {
		const rawUrl =
			getView(traitSetArg)?.imageConfig?.url || (isNameSet(traitSetArg) ? props.character?.portrait?.url : '');
		const url = characterCurioFunctions.safeImageUrl(rawUrl);
		if (!url) return {};
		return {
			backgroundImage: `url("${url}")`,
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
		};
	}

	function getBranchGroups(traitSetArg: TraitSet, items: any[]) {
		const list = items || [];
		const parents = list.filter((it: any) => getBranchRole(it.trait) !== 'specialty');
		const flats = list.filter((it: any) => !it.isPlaceholder && getBranchRole(it.trait) === 'specialty');
		const parentIdx = new Set(
			parents
				.filter((p: any) => p.originalIndex !== null && p.originalIndex !== undefined)
				.map((p: any) => p.originalIndex),
		);
		const groups: any[] = parents.map((traitItem: any) => {
			const tIdx = traitItem.originalIndex;
			const nested = (traitItem.trait?.traits || [])
				.filter((sub: any) => getRating(sub)?.type !== 'Pip')
				.map((sub: any, u: number) => ({ kind: 'sub', sub, u }));
			const linked = flats
				.filter((f: any) => getView(f.trait)?.linkTo === tIdx)
				.map((f: any) => ({ kind: 'flat', item: f }));
			return { traitItem, subs: [...nested, ...linked] };
		});
		const orphans = flats
			.filter((f: any) => {
				const lt = getView(f.trait)?.linkTo;
				return !(typeof lt === 'number' && parentIdx.has(lt));
			})
			.map((f: any) => ({ kind: 'flat', item: f }));
		if (orphans.length) {
			groups.push({ traitItem: null, subs: orphans });
		}
		const split = groups.some((g: any) =>
			(g.subs || []).some((e: any) => {
				const t = e.kind === 'sub' ? e.sub : e.item ? e.item.trait : null;
				return getBranchSide(t) === 'left';
			}),
		);
		groups.forEach((g: any) => {
			g.split = split;
		});
		return groups;
	}

	function hasBranchSplit(traitSetArg: TraitSet, items: any[]) {
		if (getView(traitSetArg)?.style?.body !== 'subtrait-columns') return false;
		return getBranchGroups(traitSetArg, items).some((g: any) => g.split);
	}

	// Flank layout: a subtrait-columns set with traitColumns 2 spreads
	// parent traits across outer columns with subtraits down the middle.
	// Explicit left-side subtraits (split) win over it.
	function hasBranchFlank(traitSetArg: TraitSet, items: any[]) {
		if (getView(traitSetArg)?.style?.body !== 'subtrait-columns') return false;
		if (Number(getView(traitSetArg)?.traitColumns) !== 2) return false;
		return !hasBranchSplit(traitSetArg, items);
	}

	function getFlankColumns(traitSetArg: TraitSet, items: any[]) {
		const groups = getBranchGroups(traitSetArg, items);
		const parents = groups.filter((g: any) => g.traitItem);
		const mid = Math.ceil(parents.length / 2);
		const center: any[] = [];
		groups.forEach((g: any) => {
			const tIdx = g.traitItem ? g.traitItem.originalIndex : null;
			(g.subs || []).forEach((e: any) => {
				center.push({ ...e, traitIndex: tIdx, traitItem: g.traitItem });
			});
		});
		return { left: parents.slice(0, mid), right: parents.slice(mid), center: center };
	}

	function getBranchRole(trait: Trait) {
		return getView(trait)?.branchRole === 'specialty' ? 'specialty' : 'skill';
	}

	// The set-level die is the set node's own Rating; traits without a
	// rating of their own fall through to it.
	function getSetRatingDie(traitSetArg: TraitSet) {
		const dice = ratingDice(getRating(traitSetArg));
		if (dice.length) return dice[0];
		return null;
	}

	function getBranchSide(trait: Trait) {
		return getView(trait)?.branchSide === 'left' ? 'left' : 'right';
	}

	function branchSubs(subs: any[], side: string) {
		return (subs || []).filter((e: any) => {
			const t = e.kind === 'sub' ? e.sub : e.item ? e.item.trait : null;
			const sd = getBranchSide(t);
			return side === 'left' ? sd === 'left' : sd !== 'left';
		});
	}

	function handleBranchFlatClick(sArg: any, t: any, trait: Trait) {
		if (props.submode === 'play') {
			const first = ratingDice(getRating(trait))[0];
			if (first) {
				const traitSetArg = props.character.traitSets[sArg];
				handleSingleDieClick(trait, first, traitSetArg, sArg, t);
			}
		} else {
			selectElement(['trait', sArg, t]);
		}
	}

	function getSubtraitNameOr(trait: Trait, traitSetArg: TraitSet, index: number) {
		const sub = nonSfxSubtraits(trait)[index];
		if (sub && sub.name && String(sub.name).trim().length) {
			return sub.name;
		}
		return getTraitSetLabel(traitSetArg, 'slot' + index);
	}

	function getThreeColEffect(trait: Trait) {
		const entries = characterCurioFunctions.sfxChildren(trait);
		const sfx = entries.find((e: any) => String(e.name || '').toLowerCase() !== 'hinder');
		if (!sfx) return '';
		return sfx.description || sfx.name || '';
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

	function setDiceCount(sArg: any, t: any, count: number) {
		const traitSetArg = props.character.traitSets[sArg];
		const trait = traitSetArg?.traits?.[t];
		if (!trait) return;
		const clamped = Math.max(1, Math.min(5, Number(count) || 1));
		const ratings = getTraitSetRatings(traitSetArg);
		const size = ratingDice(getRating(trait))[0] || ratings[0] || 6;
		const dice = [];
		for (let i = 0; i < clamped; i++) dice.push(size);
		characterCurioFunctions.setTraitDice(trait, dice);
		ensureView(trait).poolCount = clamped;
		updateCharacter(props.character);
	}

	function addTraitSetDiceToRoller(traitSetArg: TraitSet) {
		if (!traitSetArg) return;
		const diceToAdd: any[] = [];
		const poolName = traitSetArg.name || props.character.name || 'Challenge Pool';
		for (const tr of traitSetArg.traits || []) {
			const dice = availableDice(tr);
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
		return ratingDice(getRating(trait))[0] || 0;
	}

	function isDieActive(trait: Trait, size: number) {
		return firstDie(trait) === size;
	}

	function isTraitRated(trait: Trait) {
		return isRated(trait);
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

	function getTraitSetSlotCount(traitSetArg: TraitSet) {
		const custom = getView(traitSetArg);
		const bodyStyle = custom?.style?.body;
		if (bodyStyle === 'image') return 0;

		const traitsAll = traitSetArg.traits || [];
		const frameCfg = resolveFrame(traitSetArg);
		const hasExplicitRingTraits = traitsAll.some((t: Trait) => Boolean(getView(t)?.ring));
		const isPureRingWithoutImage =
			(frameCfg?.shape === 'ring' || bodyStyle === 'portrait-ring') && !frameCfg?.image?.url && !hasExplicitRingTraits;
		const listTraitsCount = traitsAll.filter((t: Trait) => {
			if (getView(t)?.ring) return false;
			if (isPureRingWithoutImage) return false;
			return true;
		}).length;

		const configured = custom?.reservedSlots;
		if (configured !== undefined && configured !== null && String(configured) !== '') {
			return Math.max(Number(configured) || 0, listTraitsCount);
		}

		return listTraitsCount;
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
		traitHasHinder,
		hinderDie,
		handleHinderDieClick,
		stageTrackDie,
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
