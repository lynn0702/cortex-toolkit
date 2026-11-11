import {
	ref,
	computed,
	onMounted,
	onUnmounted,
	onUpdated,
	watch,
	nextTick,
	provide,
	inject,
	getCurrentInstance,
	toRaw,
	type InjectionKey,
} from 'vue';
import { characterCurioFunctions } from './functions.ts';
import { buildParts, formatPct, parsePct, KNOWN_PARTS } from './sheet-grid.ts';
import {
	getView,
	ensureView,
	isNameSet,
	getRating,
	ratingDice,
	setRatingDie,
	resolveVisibility,
	nextVisibility,
	resolveSetPillar,
	resolveSubtraitNoun,
	resolveSubtraitPlural,
} from './model.ts';
import { resolveFrame, type FrameConfig } from './frame-geometry.ts';
import type {
	Character,
	TraitSet,
	CharacterCurioCustom,
	RingConfig,
	ImageConfig,
	PipsConfig,
	Visibility,
} from './model.ts';

export type TraitSetEditorApi = ReturnType<typeof useTraitSetEditor>;

// Pure branch-share normalization shared by the editor miniature and the
// subtrait-columns renderer: finite numbers >= 0 win, else the CSS
// defaults (1.4 / 1 / 1.4). Null when no branch object is stored.
export function resolveBranchShares(branch: unknown): { left: number; center: number; right: number } | null {
	const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback);
	if (!branch || typeof branch !== 'object' || Array.isArray(branch)) return null;
	const r = branch as Record<string, unknown>;
	return { left: num(r.left, 1.4), center: num(r.center, 1), right: num(r.right, 1.4) };
}

export interface TraitSetEditorProps {
	character: Character;
	traitSetID: number;
	open?: boolean;
	viewY?: number | null;
}

export const TRAIT_SET_EDITOR_KEY: InjectionKey<TraitSetEditorApi> = Symbol('traitSetEditorApi');

export function useTraitSetEditor(props: TraitSetEditorProps, emit: any) {
	const inst = getCurrentInstance();

	const rootEl = ref<any>(null);
	const inputName = ref<any>(null);
	const imageFileInput = ref<any>(null);

	const scrollPosition = ref('none');
	const anchorPosition = ref('top');
	const showDeleteConfirm = ref(false);
	const uploadError = ref('');

	// Live drag preview for the row miniature: the miniature writes the
	// box as it moves and commits on release. Cleared on set switch so
	// no stale box survives.
	const partPreview = ref<{ key: string; left: number; width: number; top: number; height: number } | null>(null);

	const styleOptions = [
		{ id: 'default', label: 'Default' },
		{ id: 'portrait-ring', label: 'Portrait Ring' },
		{ id: 'two-columns-compact', label: 'Compact Columns' },
		{ id: 'two-columns-detailed', label: 'Detailed Columns' },
		{ id: 'pool-rows', label: 'Pool Rows' },
		{ id: 'dice-count', label: 'Dice Count' },
		{ id: 'subtrait-columns', label: 'Subtrait Columns' },
		{ id: 'die-rows', label: 'Die Rows' },
		{ id: 'die-track', label: 'Die Track' },
		{ id: 'list', label: 'List' },
		{ id: 'image', label: 'Image' },
		{ id: 'pips', label: 'Pips' },
	];

	const traitSet = computed(() => props.character?.traitSets?.[props.traitSetID] || null);
	const character = computed(() => props.character);
	const traitSetID = computed(() => props.traitSetID);

	const name = computed({
		get: () => traitSet.value?.name ?? '',
		set: (v: string) => setProperty('name', v),
	});

	const description = computed({
		get: () => traitSet.value?.description ?? '',
		set: (v: string) => setProperty('description', v),
	});

	const noun = computed({
		get: () => traitSet.value?.noun ?? '',
		set: (v: string) => setProperty('noun', v),
	});

	const plural = computed({
		get: () => {
			const stored = traitSet.value?.plural;
			if (stored !== undefined && stored !== null && stored !== '') return stored;
			const singular = traitSet.value?.noun;
			return singular && singular.length ? singular + 's' : '';
		},
		set: (v: string) => setProperty('plural', v),
	});

	const setEditableOnSheet = computed({
		get: () => Boolean(getView(traitSet.value)?.editableOnSheet),
		set: (v: boolean) => {
			const view = ensureView(traitSet.value);
			if (v) view.editableOnSheet = true;
			else delete view.editableOnSheet;
			updateCharacter(props.character);
		},
	});

	const styleBody = computed({
		get: () => {
			const view = getView(traitSet.value);
			const body = view?.style?.body;
			if (body === 'portrait-ring') {
				return 'portrait-ring';
			}
			return body || 'default';
		},
		set: (value: string) => {
			if (value === 'portrait-ring') {
				// 1. Unset ring on any other trait sets in this character
				props.character.traitSets.forEach((ts: any, idx: number) => {
					if (idx !== props.traitSetID) {
						const tsBody = getView(ts)?.style?.body;
						if (tsBody === 'portrait-ring') {
							const view = ensureView(ts);
							if (!view.style) view.style = {};
							view.style.body = 'default';
							view.style.header = 'default';
							delete (view as Record<string, unknown>).location;
						}
					}
				});

				// 2. Set ring on this trait set
				const view = ensureView(traitSet.value);
				if (!view.style) view.style = {};
				view.style.body = 'portrait-ring';
				view.style.header = 'portrait-ring';
				delete (view as Record<string, unknown>).location;
			} else {
				const view = ensureView(traitSet.value);
				if (!view.style) view.style = {};
				view.style.body = value;
				view.style.header = value;
				// Preset flex layouts author their own rows: stale part
				// cells would hide, so re-selecting one clears them; branch
				// shares only survive on subtrait-columns.
				if ((FLEX_BODIES as readonly string[]).includes(value)) {
					delete view.parts;
				}
				if (value !== 'subtrait-columns') {
					delete (view as Record<string, unknown>).branch;
				}
				delete (view as Record<string, unknown>).location;
			}
			updateCharacter(props.character);
		},
	});

	const isRing = computed(() => styleBody.value === 'portrait-ring');
	const isName = computed(() => isNameSet(traitSet.value));

	const isFullWidthSpan = computed(() => {
		const place = getView(traitSet.value)?.place;
		if (!place || typeof place !== 'object' || Array.isArray(place)) return true;
		const w = parsePct((place as unknown as Record<string, unknown>).width);
		return w === null || w >= 99.9;
	});

	// Trait-part cells (view.parts): the generator spec shared by rebuilds
	// and the default comparison, so hand-tuned widths survive control
	// changes and Reset restores exactly what the generator would emit.
	function partsSpec() {
		const view = getView(traitSet.value) || {};
		const scale =
			Array.isArray((view as any).ratingLadder) && (view as any).ratingLadder.length
				? (view as any).ratingLadder
				: [4, 6, 8, 10, 12];
		const trackOn = partsHaveTrack();
		const tScale = characterCurioFunctions.getTrackScale(traitSet.value);
		const rating =
			currentRatingPosition() === 'vertical'
				? 'inline'
				: (currentRatingPosition() as 'inline' | 'above' | 'below' | 'none');
		const statement = Boolean((traitSet.value as any)?.statement);
		const traits = Array.isArray(traitSet.value?.traits)
			? traitSet.value.traits
			: traitSet.value?.traits
				? Object.values(traitSet.value.traits)
				: [];
		const hasDesc = traits.some((t: any) => typeof t?.description === 'string' && t.description.trim().length > 0);
		const hasSfx = traits.some(
			(t: any) =>
				Array.isArray(characterCurioFunctions.sfxChildren(t)) && characterCurioFunctions.sfxChildren(t).length > 0,
		);
		const trackNameLower = String(trackLabel.value || 'Stress')
			.trim()
			.toLowerCase();
		const hasSub = traits.some((t: any) => {
			const subs = Array.isArray(t?.traits)
				? t.traits
				: t?.traits && typeof t.traits === 'object'
					? Object.values(t.traits)
					: [];
			return subs.some((s: any) => {
				if (!s || typeof s !== 'object' || characterCurioFunctions.isSfxContainer(s)) return false;
				const sNoun = resolveSubtraitNoun(s).toLowerCase();
				const sName = String(s.name || '')
					.trim()
					.toLowerCase();
				if (sNoun === 'statement' || sName === 'statement' || getRating(s)?.type === 'Pip') return false;
				if (trackOn && (sNoun === trackNameLower || sName === trackNameLower)) return false;
				return true;
			});
		});
		return {
			rating,
			ratingDice: scale.length,
			trackDice: trackOn ? tScale.length : 0,
			description: hasDesc && !statement && rating !== 'above',
			block: hasSfx,
			subtraits: hasSub,
		};
	}

	function isRingFrame(): boolean {
		const f = getView(traitSet.value)?.frame;
		const shape = typeof f === 'string' ? f : f?.shape;
		return shape === 'ring';
	}

	function normalizeEffectiveParts(
		rawParts: Record<string, any> | null | undefined,
	): Record<string, { left: string; top: number; width: string; height: number }> {
		const spec = partsSpec();
		const base =
			rawParts && typeof rawParts === 'object' && !Array.isArray(rawParts)
				? (structuredClone(toRaw(rawParts)) as Record<string, any>)
				: buildParts(spec);
		if (!spec.subtraits && base.subtraits) {
			delete base.subtraits;
		}
		if (isRingFrame()) {
			const hasFour = Boolean(base.name && base.rating && base.trackLabel && base.track);
			const isStaleInlineOrTwoRow =
				hasFour &&
				((Number(base.name.top) === 0 &&
					Number(base.rating.top) === 0 &&
					Number(base.trackLabel.top) === 0 &&
					Number(base.track.top) === 0) ||
					(Number(base.name.top) === 0 &&
						Number(base.rating.top) === 0 &&
						Number(base.trackLabel.top) === 1 &&
						Number(base.track.top) === 1));
			if (isStaleInlineOrTwoRow) {
				base.name = { ...base.name, left: '0%', top: 0, width: '100%', height: 1 };
				base.rating = { ...base.rating, left: '0%', top: 1, width: '100%', height: 1 };
				base.trackLabel = { ...base.trackLabel, left: '0%', top: 2, width: '100%', height: 1 };
				base.track = { ...base.track, left: '0%', top: 3, width: '100%', height: 1 };
			}
		}
		const traits = Array.isArray(traitSet.value?.traits) ? traitSet.value.traits : [];
		const hasStatementPip = traits.some(
			(t: any) =>
				Array.isArray(t?.traits) &&
				t.traits.some((sub: any) => {
					const r = getRating(sub);
					return r?.type === 'Pip' && (!Array.isArray(r.value) || r.value.length <= 1);
				}),
		);
		if (
			hasStatementPip &&
			base.name &&
			base.rating &&
			Number(base.name.top || 0) === 0 &&
			Number(base.rating.top || 0) === 0 &&
			!base['child:Statement:rating'] &&
			!base['child:Statement:label'] &&
			!base['child:Statement']
		) {
			let nextTop = 1;
			for (const k of Object.keys(base)) {
				if (k === 'name' || k === 'rating') continue;
				const top = Number(base[k]?.top);
				if (Number.isInteger(top) && top >= 1) {
					base[k] = { ...base[k], top: top + 1 };
					nextTop = Math.max(nextTop, top + 2);
				}
			}
			base.name = { ...base.name, left: '0%', top: 0, width: '40%', height: 1 };
			base['child:Statement:rating'] = { left: '40%', top: 0, width: '10%', height: 1 };
			base.rating = { ...base.rating, left: '50%', top: 0, width: '50%', height: 1 };
			base['child:Statement:label'] = { left: '0%', top: nextTop, width: '100%', height: 1 };
		}
		return base;
	}

	type PartCellEdit = { key: string; left: number; width: number; top: number; height: number };

	// Explicit part cells in stable part order. Absent = generated layout.
	const partCells = computed((): PartCellEdit[] => {
		const rawParts = getView(traitSet.value)?.parts;
		if (!rawParts || typeof rawParts !== 'object') return [];
		const parts = normalizeEffectiveParts(rawParts);
		const out: PartCellEdit[] = [];
		const orderedKeys = [
			...(KNOWN_PARTS as readonly string[]),
			...Object.keys(parts).filter((k) => !(KNOWN_PARTS as readonly string[]).includes(k)),
		];
		for (const key of orderedKeys) {
			const cell = (parts as Record<string, any>)[key];
			if (!cell || typeof cell !== 'object') continue;
			const left = parsePct(cell.left);
			const width = parsePct(cell.width);
			out.push({
				key,
				left: left === null ? 0 : Math.round(left * 1000) / 1000,
				width: width === null ? 100 : Math.round(width * 1000) / 1000,
				top: Number.isInteger(cell.top) && cell.top >= 0 ? cell.top : 0,
				height: Number.isInteger(cell.height) && cell.height >= 1 ? cell.height : 1,
			});
		}
		return out;
	});

	// Explicit part cells: hand-tuning shows whenever a parts layout
	// exists (generated or hand-tuned); Reset restores the default.
	const hasParts = computed(() => {
		const parts = getView(traitSet.value)?.parts;
		return Boolean(parts && typeof parts === 'object' && Object.keys(parts).length);
	});

	// Style presets fall into three kinds: dedicated flex renderers (the
	// list below), non-row bodies with no trait rows at all, and everything
	// else, which the list renderer draws from the parts grid. The grid
	// never takes over a bespoke body: arranging one writes only what
	// that body can render (branch shares for subtrait-columns).
	// Ladders keep the legacy flag (no parts form).
	const FLEX_BODIES = ['image', 'pips', 'subtrait-columns', 'die-rows', 'dice-count', 'portrait-ring'];
	const NON_ROW_BODIES = ['image', 'pips', 'portrait-ring'];
	function isPartsDriven() {
		const body = getView(traitSet.value)?.style?.body;
		if (typeof body === 'string' && (FLEX_BODIES as readonly string[]).includes(body)) return false;
		return currentRatingPosition() !== 'vertical';
	}
	function isRowBody() {
		const body = getView(traitSet.value)?.style?.body;
		if (typeof body === 'string' && (NON_ROW_BODIES as readonly string[]).includes(body)) return false;
		return currentRatingPosition() !== 'vertical';
	}

	// Effective part cells: stored cells, or — for grid-driven sets with
	// no stored layout — the generated preview, marked implicit. The row
	// miniature shows both; the first drag on an implicit box writes the
	// generated map (the seed setPartCell uses) plus the change, so the
	// sheet switches from flex to the grid it previews.
	const effectivePartCells = computed((): (PartCellEdit & { implicit: boolean })[] => {
		const rawParts = getView(traitSet.value)?.parts;
		if (rawParts && typeof rawParts === 'object' && !Array.isArray(rawParts)) {
			return partCells.value.map((c) => ({ ...c, implicit: false }));
		}
		if (!isPartsDriven()) return [];
		const gen = normalizeEffectiveParts(null);
		const out: (PartCellEdit & { implicit: boolean })[] = [];
		const orderedKeys = [
			...(KNOWN_PARTS as readonly string[]),
			...Object.keys(gen).filter((k) => !(KNOWN_PARTS as readonly string[]).includes(k)),
		];
		for (const key of orderedKeys) {
			const cell = (gen as Record<string, any>)[key];
			if (!cell || typeof cell !== 'object') continue;
			const left = parsePct(cell.left);
			const width = parsePct(cell.width);
			out.push({
				key,
				left: left === null ? 0 : Math.round(left * 1000) / 1000,
				width: width === null ? 100 : Math.round(width * 1000) / 1000,
				top: Number.isInteger(cell.top) && cell.top >= 0 ? cell.top : 0,
				height: Number.isInteger(cell.height) && cell.height >= 1 ? cell.height : 1,
				implicit: true,
			});
		}
		return out;
	});

	// Generated preview on screen (no stored layout yet).
	const isPartsPreview = computed(() => partCells.value.length === 0 && effectivePartCells.value.length > 0);

	// Non-default explicit parts: Reset restores the generated layout.
	// (No stored parts means nothing custom, however the preview reads.)
	const hasCustomParts = computed(() => {
		const parts = getView(traitSet.value)?.parts;
		if (!parts || typeof parts !== 'object' || Array.isArray(parts)) return false;
		const canon = (o: Record<string, unknown>) => {
			const out: Record<string, unknown> = {};
			Object.keys(o)
				.sort()
				.forEach((k) => {
					out[k] = o[k];
				});
			return JSON.stringify(out);
		};
		return canon(parts as Record<string, unknown>) !== canon(buildParts(partsSpec()) as Record<string, unknown>);
	});

	function setPartCell(key: string, field: 'left' | 'width' | 'top' | 'height', val: number) {
		const view = ensureView(traitSet.value);
		view.parts = normalizeEffectiveParts(view.parts as Record<string, any> | undefined);
		const cells = view.parts as Record<string, any>;
		if (!cells[key] || typeof cells[key] !== 'object') {
			cells[key] = { left: '0%', top: 0, width: '100%', height: 1 };
		}
		const cell = cells[key];
		if (field === 'left') {
			const n = Number.isFinite(Number(val)) ? Math.max(0, Math.min(100, Number(val))) : 0;
			cell.left = formatPct(Math.round(n * 10) / 10);
		} else if (field === 'width') {
			const n = Number.isFinite(Number(val)) ? Math.max(1, Math.min(100, Number(val))) : 100;
			cell.width = formatPct(Math.round(n * 10) / 10);
		} else if (field === 'top') {
			cell.top = Number.isInteger(Number(val)) ? Math.max(0, Number(val)) : 0;
		} else {
			cell.height = Number.isInteger(Number(val)) ? Math.max(1, Number(val)) : 1;
		}
		updateCharacter(props.character);
	}

	function removePartCell(key: string) {
		const view = ensureView(traitSet.value);
		view.parts = normalizeEffectiveParts(view.parts as Record<string, any> | undefined);
		const cells = view.parts as Record<string, any>;
		if (!cells[key]) return;
		delete cells[key];
		updateCharacter(props.character);
	}

	// Branch column shares (subtrait-columns split rows): the three fr
	// shares around the fixed 2rem link column. Absent means the CSS
	// default (1.4 / 1 / 1.4); stored shares render wherever a split
	// row does, sheet and print alike.
	function branchShares() {
		const resolved = resolveBranchShares(getView(traitSet.value)?.branch);
		if (!resolved) {
			return { left: 1.4, center: 1, right: 1.4, implicit: true };
		}
		return { ...resolved, implicit: false };
	}

	function setBranchShare(key: 'left' | 'center' | 'right', val: number) {
		const view = ensureView(traitSet.value);
		const cur = branchShares();
		const next = {
			left: key === 'left' ? val : cur.left,
			center: key === 'center' ? val : cur.center,
			right: key === 'right' ? val : cur.right,
		};
		(view as Record<string, unknown>).branch = {
			left: Math.round(Math.max(0, Number(next.left) || 0) * 100) / 100,
			center: Math.round(Math.max(0, Number(next.center) || 0) * 100) / 100,
			right: Math.round(Math.max(0, Number(next.right) || 0) * 100) / 100,
		};
		updateCharacter(props.character);
	}

	const hasCustomBranch = computed(() => {
		const branch = getView(traitSet.value)?.branch;
		return Boolean(branch && typeof branch === 'object' && !Array.isArray(branch));
	});

	function resetParts() {
		const view = getView(traitSet.value);
		if (view && typeof view === 'object') {
			delete (view as Record<string, unknown>).branch;
		}
		const body = getView(traitSet.value)?.style?.body;
		if (typeof body === 'string' && (FLEX_BODIES as readonly string[]).includes(body)) {
			// Flex layouts author their own rows: reset means no stored
			// geometry at all, not a generated map they would ignore.
			if (view && typeof view === 'object') {
				delete (view as Record<string, unknown>).parts;
				updateCharacter(props.character);
			}
			return;
		}
		if (isRingFrame() && partsHaveTrack()) {
			rebuildParts('below');
			return;
		}
		rebuildParts(
			currentRatingPosition() === 'vertical'
				? 'inline'
				: (currentRatingPosition() as 'inline' | 'above' | 'below' | 'none'),
		);
		const refreshed = ensureView(traitSet.value);
		refreshed.parts = normalizeEffectiveParts(refreshed.parts as Record<string, any> | undefined);
		updateCharacter(props.character);
	}

	const templateEntry = computed(() => {
		const root = inst?.proxy?.$root as any;
		return characterCurioFunctions.resolveTemplateFor(props.character, root ? root.sheetTemplates : null);
	});

	// Template traits by name not currently on this sheet (D19 restore menu).
	const restorableTraitNames = computed(() =>
		characterCurioFunctions.restorableTraits(props.character, templateEntry.value, props.traitSetID),
	);

	const ringSpread = computed({
		get: () => {
			const view = getView(traitSet.value);
			return (view?.frame as any)?.ring?.arcSpread ?? view?.ringConfig?.arcSpread ?? 100;
		},
		set: (val: number) => {
			setRingConfig('arcSpread', Number(val));
		},
	});

	const ringDistance = computed({
		get: () => {
			const view = getView(traitSet.value);
			return (view?.frame as any)?.ring?.arcDistance ?? view?.ringConfig?.arcDistance ?? 0;
		},
		set: (val: number) => {
			setRingConfig('arcDistance', Number(val));
		},
	});

	const ringAngle = computed({
		get: () => {
			const view = getView(traitSet.value);
			const cfg = (view?.frame as any)?.ring ?? view?.ringConfig;
			return cfg?.arcAngle ?? (cfg?.arcSlide !== undefined ? cfg.arcSlide * 3 : -90);
		},
		set: (val: number) => {
			setRingConfig('arcAngle', Number(val));
		},
	});

	const ringAngleLabel = computed(() => {
		const a = ringAngle.value;
		if (a === 0) return 'Bottom';
		if (a === -90) return 'Right';
		if (a === 90) return 'Left';
		if (a === 180 || a === -180) return 'Top';
		return (a > 0 ? '+' + a : a) + '°';
	});

	const scaleAngle = computed({
		get: () => {
			const view = getView(traitSet.value);
			return (view?.frame as any)?.ring?.scaleAngle ?? view?.ringConfig?.scaleAngle ?? 0;
		},
		set: (val: number) => {
			setRingConfig('scaleAngle', Number(val));
		},
	});

	const scaleAngleLabel = computed(() => {
		const a = scaleAngle.value;
		if (a === 0) return 'Bottom';
		if (a === -90) return 'Right';
		if (a === 90) return 'Left';
		if (a === 180 || a === -180) return 'Top';
		return (a > 0 ? '+' + a : a) + '°';
	});

	const scaleDistance = computed({
		get: () => {
			const view = getView(traitSet.value);
			return (view?.frame as any)?.ring?.scaleDistance ?? view?.ringConfig?.scaleDistance ?? 0;
		},
		set: (val: number) => {
			setRingConfig('scaleDistance', Number(val));
		},
	});

	const ringScaleY = computed({
		get: () => {
			const view = getView(traitSet.value);
			return (view?.frame as any)?.ring?.scaleDieY ?? view?.ringConfig?.scaleDieY ?? 0;
		},
		set: (val: number) => {
			setRingConfig('scaleDieY', Number(val));
		},
	});

	const ringScaleX = computed({
		get: () => {
			const view = getView(traitSet.value);
			return (view?.frame as any)?.ring?.scaleDieX ?? view?.ringConfig?.scaleDieX ?? 0;
		},
		set: (val: number) => {
			setRingConfig('scaleDieX', Number(val));
		},
	});

	const scaleDieValue = computed({
		get: () => getView(traitSet.value)?.scaleDie || getView(props.character)?.scale || 0,
		set: (val: number) => {
			ensureView(traitSet.value).scaleDie = val;
			ensureView(props.character).scale = val;
			updateCharacter(props.character);
		},
	});

	const imageURL = computed({
		get: () => {
			const cfgUrl = getView(traitSet.value)?.imageConfig?.url;
			if (cfgUrl) return cfgUrl;
			if (isName.value || isRing.value) return props.character?.portrait?.url ?? '';
			return '';
		},
		set: (val: string) => {
			setImageConfig('url', val);
		},
	});

	const imageAlignment = computed({
		get: () => {
			const cfgAlign = getView(traitSet.value)?.imageConfig?.alignment;
			if (cfgAlign) return cfgAlign;
			if (isName.value || isRing.value) return getView(props.character?.portrait)?.alignment ?? 'center';
			return 'center';
		},
		set: (val: string) => {
			setImageConfig('alignment', val);
		},
	});

	const imageHeight = computed({
		get: () => getView(traitSet.value)?.imageConfig?.height ?? 'auto',
		set: (val: string) => {
			setImageConfig('height', val);
		},
	});

	const imageWidth = computed({
		get: () => getView(traitSet.value)?.imageConfig?.width ?? '100%',
		set: (val: string) => {
			setImageConfig('width', val);
		},
	});

	const imageCaption = computed({
		get: () => {
			const cfgCap = getView(traitSet.value)?.imageConfig?.caption;
			if (cfgCap !== undefined) return cfgCap;
			if (isName.value) {
				const t = characterCurioFunctions.getNameTrait(props.character, 'caption');
				return typeof t?.label === 'string' ? t.label : '';
			}
			return '';
		},
		set: (val: string) => {
			setImageConfig('caption', val);
		},
	});

	const imageZoom = computed({
		get: () => {
			const cfgZoom = getView(traitSet.value)?.imageConfig?.zoom;
			if (typeof cfgZoom === 'number') return cfgZoom;
			if (isName.value || isRing.value) {
				const pZoom = getView(props.character?.portrait)?.zoom;
				if (typeof pZoom === 'number') return pZoom;
			}
			return 1;
		},
		set: (val: number) => {
			setImageConfig('zoom', Number(val));
		},
	});

	const frameImageUrl = computed({
		get: () => {
			const f = getView(traitSet.value)?.frame;
			return typeof f === 'object' && f !== null ? ((f as any)?.image?.url ?? '') : '';
		},
		set: (val: string) => {
			setFrameImage('url', val);
		},
	});

	const frameImageAlignment = computed({
		get: () => {
			const f = getView(traitSet.value)?.frame;
			return typeof f === 'object' && f !== null ? ((f as any)?.image?.alignment ?? 'center') : 'center';
		},
		set: (val: string) => {
			setFrameImage('alignment', val);
		},
	});

	const frameImageZoom = computed({
		get: () => {
			const f = getView(traitSet.value)?.frame;
			const z = typeof f === 'object' && f !== null ? (f as any)?.image?.zoom : undefined;
			return typeof z === 'number' ? z : 1;
		},
		set: (val: number) => {
			setFrameImage('zoom', Number(val));
		},
	});

	function setFrameImage(key: 'url' | 'alignment' | 'zoom', value: any) {
		let s = props.traitSetID;
		const ctk = ctkFor(s);
		ctk.frame ??= { shape: 'block' };
		const frameObj = typeof ctk.frame === 'object' && ctk.frame !== null ? (ctk.frame as any) : { shape: ctk.frame };
		ctk.frame = frameObj;
		frameObj.image ??= {};
		if (value === '' || value === undefined) {
			delete frameObj.image[key];
			if (Object.keys(frameObj.image).length === 0) {
				delete frameObj.image;
			}
		} else {
			frameObj.image[key] = value;
		}
		updateCharacter(props.character);
	}

	const namePortraitVisibility = computed<Visibility>(() => {
		const t = characterCurioFunctions.getNameTrait(props.character, 'portrait');
		const v = getView(t) as Record<string, unknown> | undefined;
		const word = v?.visibility;
		if (word === 'hidden' || word === 'editor-only' || word === 'play-only' || word === 'shown') return word;
		return 'shown';
	});

	function toggleNamePortraitVisibility() {
		const cur = namePortraitVisibility.value;
		const next = nextVisibility(cur);
		const t = characterCurioFunctions.ensureNameTrait(props.character, 'portrait');
		if (!t) return;
		const v = ensureView(t) as Record<string, unknown>;
		if (next === 'shown') {
			delete v.visibility;
		} else {
			v.visibility = next;
		}
		updateCharacter(props.character);
	}

	// Generic Out indicator (default off).
	const includeOut = computed({
		get: () => {
			const view = getView(traitSet.value);
			if (view && typeof view.outIndicator === 'boolean') return view.outIndicator;
			return false;
		},
		set: (value: boolean) => {
			setCustomProperty('outIndicator', Boolean(value));
		},
	});

	const endWord = computed({
		get: () => {
			const view = getView(traitSet.value);
			if (view && typeof view.endWord === 'string') return view.endWord;
			if (view && view.labels && typeof view.labels.out === 'string') return view.labels.out;
			return 'OUT';
		},
		set: (val: string) => {
			setCustomProperty('endWord', val);
			const view = ensureView(traitSet.value);
			if (!view.labels) view.labels = {};
			view.labels.out = val;
			updateCharacter(structuredClone(toRaw(props.character)));
		},
	});

	const hasCounterTrait = computed(() => {
		const traits = Array.isArray(traitSet.value?.traits) ? traitSet.value.traits : [];
		return traits.some((t: any) => t?.rating?.type === 'Counter');
	});

	const ratingLadder = computed({
		get: () => characterCurioFunctions.getTraitSetRatings(traitSet.value),
		set: (scale: number[]) => {
			let s = props.traitSetID;
			ctkFor(s).ratingLadder = scale;
			updateCharacter(structuredClone(toRaw(props.character)));
		},
	});

	// Pool sets add a whole trait pool to the roller on click, and their
	// dice are never flagged as resources (e.g. Growth Pool). Pool lives
	// on the set node.
	const isPool = computed({
		get: () => {
			const ts = traitSet.value as unknown as Record<string, unknown> | null;
			return ts !== null && ts.pool === true;
		},
		set: (value: boolean) => {
			const ts = traitSet.value as unknown as Record<string, any>;
			if (!ts) return;
			ts.pool = Boolean(value);
			updateCharacter(structuredClone(toRaw(props.character)));
		},
	});

	// The set-level die is the set node's own Rating; unrated traits fall
	// through to it.
	const setRating = computed({
		get: () => {
			const dice = ratingDice(getRating(traitSet.value));
			if (dice.length) return dice[0];
			return null;
		},
		set: (value: number | null) => {
			const ts = traitSet.value as unknown as Record<string, any>;
			if (!ts) return;
			if (Number(value) > 0) {
				setRatingDie(ts, Number(value));
			} else {
				delete ts.rating;
			}
			updateCharacter(structuredClone(toRaw(props.character)));
		},
	});

	// Spendable on the set node drives spend controls for its traits
	// unless a trait overrides it. Challenge/boss pools carry pool +
	// spendable together; no flag survives them.
	const setSpendable = computed({
		get: () => {
			const ts = traitSet.value as unknown as Record<string, unknown> | null;
			if (ts && typeof ts.spendable === 'boolean') return ts.spendable;
			return false;
		},
		set: (value: boolean) => {
			const ts = traitSet.value as unknown as Record<string, any>;
			if (!ts) return;
			ts.spendable = Boolean(value);
			updateCharacter(structuredClone(toRaw(props.character)));
		},
	});

	// Hitches on the set node: the top of the inheritance chain.
	const setHitches = computed({
		get: () => {
			const ts = traitSet.value as unknown as Record<string, unknown> | null;
			return ts && typeof ts.hitches === 'number' ? ts.hitches : null;
		},
		set: (value: number | null) => {
			const ts = traitSet.value as unknown as Record<string, any>;
			if (!ts) return;
			if (value === null || value === undefined || value === ('' as unknown as number)) {
				delete ts.hitches;
			} else {
				const n = Math.floor(Number(value));
				if (Number.isFinite(n) && n >= 0) ts.hitches = n;
			}
			updateCharacter(structuredClone(toRaw(props.character)));
		},
	});

	const reservedSlots = computed({
		get: () => {
			const val = getView(traitSet.value)?.reservedSlots;
			return val !== undefined && val !== null && String(val) !== '' ? Number(val) : '';
		},
		set: (val: number | '') => {
			const num = val === '' || val === null || isNaN(val) ? null : Math.max(0, parseInt(String(val), 10));
			setCustomProperty('reservedSlots', num);
		},
	});

	const traitColumns = computed({
		get: () => getView(traitSet.value)?.traitColumns ?? 1,
		set: (val: number) => {
			setCustomProperty('traitColumns', parseInt(String(val), 10) || 1);
		},
	});

	const setVisibility = computed<Visibility>({
		get: () => resolveVisibility(traitSet.value),
		set: (val: Visibility) => {
			if (!traitSet.value) return;
			const v = ensureView(traitSet.value);
			if (val === 'shown') {
				delete v.visibility;
			} else {
				v.visibility = val;
			}
			updateCharacter(props.character);
		},
	});

	function cycleSetVisibility() {
		setVisibility.value = nextVisibility(setVisibility.value);
	}

	const setPillar = computed<string>({
		get: () => getView(traitSet.value)?.pillar ?? '',
		set: (val: string) => {
			if (!traitSet.value) return;
			const v = ensureView(traitSet.value);
			const trimmed = String(val || '').trim();
			if (trimmed) {
				v.pillar = trimmed;
			} else {
				delete v.pillar;
			}
			updateCharacter(props.character);
		},
	});

	const resolvedPillar = computed<string>(() => resolveSetPillar(traitSet.value));

	const presetSaved = ref(false);
	function saveSetAsPreset() {
		if (!traitSet.value) return;
		characterCurioFunctions.saveCustomSetPreset(toRaw(traitSet.value));
		presetSaved.value = true;
		setTimeout(() => {
			presetSaved.value = false;
		}, 1600);
	}

	const showBlockMini = ref(false);
	function openBlockMini() {
		showBlockMini.value = true;
	}
	function closeBlockMini() {
		showBlockMini.value = false;
	}

	const characterCustomPillars = computed<string[]>(() => {
		const list: string[] = [];
		const std = ['prime', 'plus', 'play', 'identity'];
		for (const ts of props.character?.traitSets || []) {
			const p = getView(ts)?.pillar;
			if (typeof p === 'string' && p.trim()) {
				const low = p.trim().toLowerCase();
				if (!std.includes(low) && !list.includes(low)) {
					list.push(low);
				}
			}
		}
		return list;
	});

	// Rebuild this set's trait-part layout, preserving its track setup,
	// dice counts, features, and statement mode. Vertical ladders keep
	// the legacy flag (no parts form); bespoke bodies are left alone.
	// Pass track true/false to force the track on/off (the toggle);
	// otherwise the current setup carries over.
	function rebuildParts(rating: 'inline' | 'above' | 'below' | 'none', track?: boolean) {
		const view = ensureView(traitSet.value);
		const spec = partsSpec();
		if (track === true && !spec.trackDice) spec.trackDice = 5;
		if (track === false) spec.trackDice = 0;
		view.parts = buildParts({ ...spec, rating });
		if (traitSet.value && typeof traitSet.value === 'object') delete (traitSet.value as any).ratingPosition;
		delete view.ratingPosition;
		updateCharacter(props.character);
	}

	function partsHaveTrack() {
		return characterCurioFunctions.hasTrackPart(traitSet.value);
	}

	function currentRatingPosition(): 'inline' | 'above' | 'below' | 'none' | 'vertical' {
		const rawParts = getView(traitSet.value)?.parts;
		if (rawParts && typeof rawParts === 'object') {
			if (isRingFrame()) {
				const raw = rawParts as Record<string, { top?: unknown }>;
				if (
					raw.name &&
					raw.rating &&
					raw.trackLabel &&
					raw.track &&
					Number(raw.name.top || 0) === 0 &&
					Number(raw.rating.top || 0) === 0
				) {
					return 'below';
				}
			}
			const cells = rawParts as Record<string, { top?: unknown }>;
			if (!cells.rating) return 'none';
			const rTop = Number(cells.rating.top) || 0;
			const nTop = cells.name ? Number(cells.name.top) || 0 : 0;
			if (rTop === 0 && nTop === 0) return 'inline';
			if (rTop === 0) return 'above';
			return 'below';
		}
		if (isRingFrame() && partsHaveTrack()) return 'below';
		const legacy = (traitSet.value as any)?.ratingPosition || getView(traitSet.value)?.ratingPosition;
		if (legacy === 'above' || legacy === 'below' || legacy === 'none' || legacy === 'vertical') return legacy;
		return 'inline';
	}

	const hasTrackPart = computed({
		get: () => partsHaveTrack(),
		set: (val: boolean) => {
			if (!val) {
				const parts = getView(traitSet.value)?.parts;
				if (parts && typeof parts !== 'string') {
					delete (parts as Record<string, unknown>).trackLabel;
					delete (parts as Record<string, unknown>).track;
				}
				updateCharacter(props.character);
				return;
			}
			rebuildParts(
				currentRatingPosition() === 'vertical'
					? 'inline'
					: (currentRatingPosition() as 'inline' | 'above' | 'below' | 'none'),
				true,
			);
		},
	});

	const setSubtraits = computed(() => {
		const traits = traitSet.value?.traits;
		if (!Array.isArray(traits) || traits.length === 0) return [];
		const firstTrait =
			traits.find((tr: any) => tr && typeof tr === 'object' && Array.isArray(tr.traits) && tr.traits.length > 0) ||
			traits[0];
		const subs = firstTrait?.traits;
		if (!Array.isArray(subs)) return [];
		const result: Array<{
			idx: number;
			sfxIdx?: number;
			isSfx?: boolean;
			sub: any;
			label: string;
			summary: string;
		}> = [];
		subs.forEach((sub: any, idx: number) => {
			if (!sub || typeof sub !== 'object') return;
			if (characterCurioFunctions.isSfxContainer(sub)) {
				const sfxList = Array.isArray(sub.traits) ? sub.traits : [];
				sfxList.forEach((sfx: any, sIdx: number) => {
					if (!sfx || typeof sfx !== 'object') return;
					const label = sfx.name || 'SFX';
					result.push({
						idx,
						sfxIdx: sIdx,
						isSfx: true,
						sub: sfx,
						label: String(label).trim() || 'SFX',
						summary: 'SFX',
					});
				});
				return;
			}
			const label = resolveSubtraitNoun(sub);
			const r = getRating(sub);
			const summary = r?.type ? r.type : 'Unrated';
			result.push({ idx, sub, label, summary });
		});
		return result;
	});

	function openSetSubtrait(item: any) {
		const targetItem = typeof item === 'number' ? setSubtraits.value[item] || { idx: item } : item;
		const subIdx = targetItem?.idx ?? 0;
		if (targetItem?.isSfx && targetItem.sfxIdx !== undefined) {
			selectElement(['subtrait', props.traitSetID, 0, subIdx, targetItem.sfxIdx]);
		} else {
			selectElement(['subtrait', props.traitSetID, 0, subIdx]);
		}
	}

	function removeSetSubtrait(item: any) {
		if (!traitSet.value || !Array.isArray(traitSet.value.traits)) return;
		const targetItem = typeof item === 'number' ? setSubtraits.value[item] || { idx: item } : item;
		if (targetItem?.isSfx && targetItem.sfxIdx !== undefined) {
			const sfxIdx = targetItem.sfxIdx;
			traitSet.value.traits.forEach((tr: any) => {
				characterCurioFunctions.removeSfxAt(tr, sfxIdx);
			});
			const hasRemainingSfx = traitSet.value.traits.some(
				(tr: any) => characterCurioFunctions.sfxChildren(tr).length > 0,
			);
			if (!hasRemainingSfx) {
				const v = getView(traitSet.value);
				if (v?.parts?.block) {
					delete v.parts.block;
				}
			}
			updateCharacter(structuredClone(toRaw(props.character)));
			return;
		}
		const subIdx = targetItem?.idx ?? 0;
		const firstSubs = traitSet.value.traits[0]?.traits;
		const target: any = Array.isArray(firstSubs) ? firstSubs[subIdx] : null;
		const targetKey = String(target?.noun || target?.name || '')
			.trim()
			.toLowerCase();
		traitSet.value.traits.forEach((tr: any) => {
			if (!tr || typeof tr !== 'object' || !Array.isArray(tr.traits)) return;
			if (targetKey) {
				const matchIdx = tr.traits.findIndex(
					(st: any) =>
						st &&
						typeof st === 'object' &&
						(String(st.noun || '')
							.trim()
							.toLowerCase() === targetKey ||
							String(st.name || '')
								.trim()
								.toLowerCase() === targetKey),
				);
				if (matchIdx !== -1) {
					tr.traits.splice(matchIdx, 1);
					return;
				}
			}
			if (subIdx >= 0 && subIdx < tr.traits.length) {
				tr.traits.splice(subIdx, 1);
			}
		});
		if (targetKey && targetKey === (trackLabel.value || 'Stress').toLowerCase()) {
			const parts = getView(traitSet.value)?.parts;
			if (parts && typeof parts !== 'string') {
				delete (parts as Record<string, unknown>).trackLabel;
				delete (parts as Record<string, unknown>).track;
			}
		}
		updateCharacter(props.character);
	}

	function createSubtrait() {
		if (!traitSet.value) return;
		if (!Array.isArray(traitSet.value.traits)) {
			traitSet.value.traits = [];
		}
		if (traitSet.value.traits.length === 0) {
			const baseTrait: any = structuredClone(characterCurioFunctions.defaultTrait);
			baseTrait.name = 'New ' + (traitSet.value.noun || 'Trait');
			traitSet.value.traits.push(baseTrait);
		}
		const firstTrait = traitSet.value.traits[0];
		const existingSubs = Array.isArray(firstTrait?.traits) ? firstTrait.traits : [];
		const defaultTrackNoun = trackLabel.value || 'Stress';
		const hasTrackSub = existingSubs.some(
			(st: any) =>
				st &&
				typeof st === 'object' &&
				(String(st.name || '')
					.trim()
					.toLowerCase() === defaultTrackNoun.toLowerCase() ||
					String(st.noun || '')
						.trim()
						.toLowerCase() === defaultTrackNoun.toLowerCase()),
		);
		let subNoun = defaultTrackNoun;
		if (hasTrackSub) {
			let n = existingSubs.length + 1;
			subNoun = `Subtrait ${n}`;
			while (
				existingSubs.some(
					(st: any) =>
						st &&
						typeof st === 'object' &&
						(String(st.name || '')
							.trim()
							.toLowerCase() === subNoun.toLowerCase() ||
							String(st.noun || '')
								.trim()
								.toLowerCase() === subNoun.toLowerCase()),
				)
			) {
				n++;
				subNoun = `Subtrait ${n}`;
			}
		}
		let targetSubIdx = 0;
		traitSet.value.traits.forEach((tr: any, tIdx: number) => {
			if (!tr || typeof tr !== 'object') return;
			if (!Array.isArray(tr.traits)) tr.traits = [];
			const sub: any = {
				name: subNoun,
				noun: subNoun,
				description: '',
				tags: [],
				rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
				traits: [],
			};
			tr.traits.push(sub);
			if (tIdx === 0) targetSubIdx = tr.traits.length - 1;
		});
		if (
			subNoun.toLowerCase() === (trackLabel.value || 'Stress').toLowerCase() &&
			allowsTraitColumns.value &&
			styleBody.value !== 'image' &&
			styleBody.value !== 'pips' &&
			styleBody.value !== 'die-track'
		) {
			rebuildParts(
				currentRatingPosition() === 'vertical'
					? 'inline'
					: (currentRatingPosition() as 'inline' | 'above' | 'below' | 'none'),
				true,
			);
		} else {
			updateCharacter(props.character);
		}
		selectElement(['subtrait', props.traitSetID, 0, targetSubIdx]);
	}

	const trackLabel = computed({
		get: () => {
			const labels = getView(traitSet.value)?.labels;
			if (labels && typeof labels.track === 'string' && labels.track.length) return labels.track;
			return 'Stress';
		},
		set: (val: string) => {
			const view = ensureView(traitSet.value);
			const prev = getView(traitSet.value)?.labels?.track ?? 'Stress';
			if (!view.labels || typeof view.labels !== 'object') view.labels = {};
			if (typeof val === 'string' && val.length) view.labels.track = val;
			else delete view.labels.track;
			delete (view.labels as any).stress;
			// Keep track companions (subtraits named for the label) glued
			// to the label: rename matches, never clobbering an occupant.
			const next = typeof val === 'string' && val.length ? val : 'Stress';
			if (next !== prev && Array.isArray((traitSet.value as any)?.traits)) {
				(traitSet.value as any).traits.forEach((tr: any) => {
					if (!tr || typeof tr !== 'object' || !Array.isArray(tr.traits)) return;
					const hit = tr.traits.findIndex((st: any) => st && typeof st === 'object' && st.name === prev);
					if (hit === -1) return;
					const occupied = tr.traits.some((st: any) => st && typeof st === 'object' && st.name === next);
					if (!occupied) tr.traits[hit].name = next;
				});
			}
			updateCharacter(props.character);
		},
	});

	const ratingPosition = computed({
		get: () => currentRatingPosition(),
		set: (val: 'inline' | 'above' | 'below' | 'none' | 'vertical') => {
			if (val === 'vertical') {
				const view = ensureView(traitSet.value);
				delete view.parts;
				(traitSet.value as any).ratingPosition = val;
				view.ratingPosition = val;
				updateCharacter(props.character);
				return;
			}
			rebuildParts(val);
		},
	});

	const ratingDisplay = computed<'track' | 'rating'>({
		get: () => {
			const v = getView(traitSet.value);
			return (v?.ratingDisplay as 'track' | 'rating') || (traitSet.value as any)?.ratingDisplay || 'track';
		},
		set: (val: 'track' | 'rating') => {
			const view = ensureView(traitSet.value);
			if (val === 'track') {
				delete view.ratingDisplay;
				if (traitSet.value && typeof traitSet.value === 'object') {
					delete (traitSet.value as any).ratingDisplay;
				}
			} else {
				view.ratingDisplay = val;
			}
			updateCharacter(structuredClone(toRaw(props.character)));
		},
	});

	// Ladder rung label direction: horizontal text or rotated vertical
	// (sidebar-style) for narrow tracks such as Initiative and Hero Dice.
	const labelPosition = computed({
		get: () => (getView(traitSet.value)?.labelPosition === 'vertical' ? 'vertical' : 'horizontal'),
		set: (val: 'horizontal' | 'vertical') => {
			setCustomProperty('labelPosition', val === 'vertical' ? 'vertical' : null);
		},
	});

	const counterLabel = computed({
		get: () => traitSet.value?.counterLabel || getView(traitSet.value)?.counterLabel || 'XP',
		set: (val: string) => {
			setProperty('counterLabel', val);
			setCustomProperty('counterLabel', val);
		},
	});

	const pipCount = computed({
		get: () => {
			const rating = getRating(traitSet.value);
			if (rating && rating.type === 'Pip' && Array.isArray(rating.value)) {
				return rating.value.length;
			}
			return 25;
		},
		set: (val: number) => {
			setPipTrack(Math.max(1, parseInt(String(val), 10) || 25), pipsFilled.value);
		},
	});

	const pipsPerRow = computed({
		get: () => getView(traitSet.value)?.pips?.perRow ?? 5,
		set: (val: number) => {
			setPipProperty('perRow', Math.max(1, parseInt(String(val), 10) || 5));
		},
	});

	const pipsConnected = computed({
		get: () => getView(traitSet.value)?.pips?.connected !== false,
		set: (val: any) => {
			setPipProperty('connected', Boolean(val));
		},
	});

	const pipLabels = computed({
		get: () => getView(traitSet.value)?.pips?.labels === true,
		set: (val: any) => {
			setPipProperty('labels', Boolean(val));
		},
	});

	const frameOptions = [
		{ id: 'none', label: 'None' },
		{ id: 'block', label: 'Block' },
		{ id: 'ring', label: 'Ring' },
		{ id: 'ellipse', label: 'Ellipse' },
		{ id: 'arc', label: 'Arc' },
		{ id: 'line', label: 'Line' },
	];

	const frameShape = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return res?.shape ?? 'none';
		},
		set: (shape: string) => {
			setFrameShape(shape);
		},
	});

	function setFrameShape(shape: string) {
		const s = props.traitSetID;
		const ctk = ctkFor(s);
		if (shape === 'none' || !shape) {
			delete ctk.frame;
		} else {
			const existing = resolveFrame(props.character.traitSets[s]);
			const defaultSpan: [number, number] = shape === 'arc' ? [45, 135] : [0, 360];
			if (existing) {
				const hasFullSpan = Math.abs(existing.span[1] - existing.span[0]) >= 360;
				ctk.frame = {
					...existing,
					shape: shape as any,
					span: shape === 'arc' && hasFullSpan ? defaultSpan : existing.span,
				};
			} else {
				ctk.frame = {
					shape: shape as any,
					span: defaultSpan,
					corner: 8,
					color: 'primary',
					stroke: '2px',
					path: null,
				};
			}
		}
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	const defaultEditorFrame: FrameConfig = {
		shape: 'block',
		span: [0, 360],
		corner: 8,
		color: 'primary',
		stroke: '2px',
		box: false,
	};

	const frameWidth = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return res?.stroke ?? '2px';
		},
		set: (stroke: string) => {
			setFrameWidth(stroke);
		},
	});

	function setFrameWidth(stroke: string) {
		const s = props.traitSetID;
		const ctk = ctkFor(s);
		const existing = resolveFrame(props.character.traitSets[s]);
		const f: any = {
			...(existing || defaultEditorFrame),
		};
		if (stroke && stroke.trim() && stroke.trim() !== '2px') {
			f.stroke = stroke.trim();
		} else {
			delete f.stroke;
		}
		ctk.frame = f;
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	const frameColor = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return res?.color ?? 'primary';
		},
		set: (color: string) => {
			setFrameColor(color);
		},
	});

	function setFrameColor(color: string) {
		const s = props.traitSetID;
		const ctk = ctkFor(s);
		const existing = resolveFrame(props.character.traitSets[s]);
		const f: any = {
			...(existing || defaultEditorFrame),
		};
		if (color && color !== 'primary') {
			f.color = color as any;
		} else {
			delete f.color;
		}
		ctk.frame = f;
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	const frameDash = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return res?.dash ?? '';
		},
		set: (dash: string) => {
			setFrameDash(dash);
		},
	});

	function setFrameDash(dash: string) {
		const s = props.traitSetID;
		const ctk = ctkFor(s);
		const existing = resolveFrame(props.character.traitSets[s]);
		const f: any = {
			...(existing || defaultEditorFrame),
		};
		if (dash && dash.trim()) {
			f.dash = dash.trim();
		} else {
			delete f.dash;
		}
		ctk.frame = f;
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	const frameBox = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return Boolean(res?.box);
		},
		set: (box: boolean) => {
			setFrameBox(box);
		},
	});

	function setFrameBox(box: boolean) {
		const s = props.traitSetID;
		const ctk = ctkFor(s);
		const existing = resolveFrame(props.character.traitSets[s]);
		const f: any = {
			...(existing || { ...defaultEditorFrame, shape: 'ring' }),
		};
		if (box) {
			f.box = true;
		} else {
			delete f.box;
		}
		ctk.frame = f;
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	const pipsFilled = computed({
		get: () => {
			const rating = getRating(traitSet.value);
			if (rating && rating.type === 'Pip' && Array.isArray(rating.value)) {
				return rating.value.filter((v) => v === true).length;
			}
			return 0;
		},
		set: (val: number) => {
			setPipTrack(pipCount.value, Math.max(0, parseInt(String(val), 10) || 0));
		},
	});

	const scrollable = computed(() => true);

	// Styles sampled from the official character sheet PDFs.
	// Talents rows and dossier fields carry no dice.
	const needsDiceUI = computed(() => styleBody.value !== 'name');

	// Fixed-layout styles manage their own internal columns.
	const allowsTraitColumns = computed(
		() => !['subtrait-columns', 'die-rows', 'dice-count', 'name'].includes(styleBody.value),
	);

	const editorDock = computed({
		get: () => (getView(traitSet.value)?.editorDock === 'right' ? 'right' : 'left'),
		set: (val: 'left' | 'right') => {
			setCustomProperty('editorDock', val === 'right' ? 'right' : 'left');
		},
	});

	// Set header placement + alignment (generic; applies to every style).
	const headerMode = computed<'sidebar' | 'top' | 'bottom' | 'none'>({
		get: () => {
			const h = getView(traitSet.value)?.header;
			return h === 'top' || h === 'bottom' || h === 'none' ? h : 'sidebar';
		},
		set: (val: 'sidebar' | 'top' | 'bottom' | 'none') => {
			setCustomProperty('header', val === 'top' || val === 'bottom' || val === 'none' ? val : 'sidebar');
		},
	});

	const borderless = computed<boolean>({
		get: () => Boolean(getView(traitSet.value)?.borderless),
		set: (val: boolean) => {
			setCustomProperty('borderless', Boolean(val));
		},
	});

	const headerAlign = computed<'left' | 'center' | 'right'>({
		get: () => {
			const a = getView(traitSet.value)?.headerAlign;
			return a === 'center' || a === 'right' ? a : 'left';
		},
		set: (val: 'left' | 'center' | 'right') => {
			setCustomProperty('headerAlign', val === 'center' || val === 'right' ? val : 'left');
		},
	});

	// Branched Skills connectors (per-specialty arrows) are optional.
	const branchArrows = computed({
		get: () => {
			const v = getView(traitSet.value)?.branchArrows;
			return v !== false;
		},
		set: (val: boolean) => {
			setCustomProperty('branchArrows', Boolean(val));
		},
	});

	const cssClass = computed(() => {
		let css: Record<string, boolean> = {
			editor: true,
			open: props.open === true,
			scrollable: scrollable.value,
		};

		css['anchor-position-' + anchorPosition.value] = true;

		if (isFullWidthSpan.value) {
			css['dock-' + editorDock.value] = true;
		}

		if (scrollable.value) {
			css['scroll-position-' + scrollPosition.value] = true;
		}

		return css;
	});

	function selectElement(selector: any) {
		emit('selectElement', selector);
	}

	function targetValue(event: any) {
		return (event?.target as any)?.value;
	}

	async function focusFirstInput() {
		await nextTick();
		if (inputName.value) {
			inputName.value.focus({ preventScroll: true });
		}
	}

	// Ensure + return this set's view bag (typed).
	function ctkFor(s: number): CharacterCurioCustom {
		return ensureView(props.character.traitSets[s]);
	}

	function setProperty(key: keyof TraitSet, value: any) {
		let character = props.character;
		let s = props.traitSetID;

		character.traitSets[s][key] = value as never;

		updateCharacter(character);
	}

	function promptDeleteTraitSet() {
		if (isName.value) return;
		showDeleteConfirm.value = true;
	}

	function cancelDeleteTraitSet() {
		showDeleteConfirm.value = false;
	}

	function confirmDeleteTraitSet() {
		if (isName.value) return;
		showDeleteConfirm.value = false;
		emit('removeTraitSet', props.traitSetID);
	}

	function restoreTrait(name: string) {
		if (characterCurioFunctions.restoreTraitOnSheet(props.character, templateEntry.value, props.traitSetID, name)) {
			updateCharacter(props.character);
		}
	}

	function setRingConfig(key: keyof RingConfig, value: any) {
		let s = props.traitSetID;
		const ctk = ctkFor(s);
		ctk.frame ??= { shape: 'ring' };
		const frameObj = typeof ctk.frame === 'object' && ctk.frame !== null ? (ctk.frame as any) : { shape: ctk.frame };
		ctk.frame = frameObj;
		const existingRing = frameObj.ring || ctk.ringConfig;
		frameObj.ring ??= {
			arcAngle: existingRing?.arcAngle ?? (existingRing?.arcSlide !== undefined ? existingRing.arcSlide * 3 : -90),
			arcSpread: existingRing?.arcSpread ?? 100,
			arcDistance: existingRing?.arcDistance ?? 0,
			scaleAngle: existingRing?.scaleAngle ?? 0,
			scaleDistance: existingRing?.scaleDistance ?? 0,
			scaleDieX: existingRing?.scaleDieX ?? 0,
			scaleDieY: existingRing?.scaleDieY ?? 0,
			arcSlide: existingRing?.arcSlide ?? 0,
		};
		frameObj.ring[key] = value;
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	function resetRingPlacement() {
		let s = props.traitSetID;
		const ctk = ctkFor(s);
		ctk.frame ??= { shape: 'ring' };
		const frameObj = typeof ctk.frame === 'object' && ctk.frame !== null ? (ctk.frame as any) : { shape: ctk.frame };
		ctk.frame = frameObj;
		frameObj.ring = {
			arcAngle: -90,
			arcSpread: 100,
			arcDistance: 0,
			scaleAngle: 0,
			scaleDistance: 0,
			scaleDieX: 0,
			scaleDieY: 0,
			arcSlide: 0,
		};
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	function setCustomProperty(key: string, value: any) {
		let s = props.traitSetID;
		ctkFor(s)[key] = value;
		updateCharacter(props.character);
	}

	// Generic trait-set label store: one flat dictionary for every
	// style's named regions; defaults resolve centrally per style.
	// Inputs bind :value/@change (and placeholder) to it.
	function styleLabel(key: string) {
		const labels = getView(traitSet.value)?.labels;
		if (labels && labels[key] !== undefined && labels[key] !== null && String(labels[key]).length) {
			return labels[key];
		}
		return characterCurioFunctions.labelDefaultForStyle(styleBody.value, key);
	}

	function setStyleLabel(key: string, value: any) {
		let s = props.traitSetID;
		const ctk = ctkFor(s);
		ctk.labels ??= {};
		ctk.labels[key] = value;

		updateCharacter(props.character);
	}

	// Labels group content: style-region headings, nouns, stress label, or
	// hinder sentence. The group hides when nothing in it applies, so no
	// editor section can render empty.
	const hasLabelContent = computed(() => {
		const body = styleBody.value;
		if (body === 'subtrait-columns' || body === 'dice-count') return true;
		if (hasTrackPart.value) return true;
		return body !== 'image' && body !== 'pips' && body !== 'name';
	});

	function setImageConfig(key: keyof ImageConfig, value: any) {
		let s = props.traitSetID;
		const ctk = ctkFor(s);
		ctk.imageConfig ??= {};
		ctk.imageConfig[key] = value;

		if ((isName.value || isRing.value) && props.character) {
			if (key === 'url') {
				props.character.portrait ??= {};
				props.character.portrait.url = value;
			} else if (key === 'alignment') {
				props.character.portrait ??= {};
				ensureView(props.character.portrait).alignment = value;
			} else if (key === 'zoom') {
				props.character.portrait ??= {};
				ensureView(props.character.portrait).zoom = value;
			} else if (key === 'caption' && isName.value) {
				const t = characterCurioFunctions.ensureNameTrait(props.character, 'caption');
				if (t) {
					if (typeof value === 'string' && value.trim().length) t.label = value.trim();
					else delete t.label;
				}
			}
		}

		updateCharacter(props.character);
	}

	function uploadImageStart() {
		if (imageFileInput.value) {
			imageFileInput.value.click();
		}
	}

	function uploadImageProcess(event: any) {
		uploadError.value = '';
		if (!event.target.files || !event.target.files.length) {
			imageURL.value = '';
			return;
		}
		characterCurioFunctions.processImageFile(event.target.files[0], 1280, 0.85).then(
			(dataURL: string) => {
				imageURL.value = dataURL;
				event.target.value = null;
			},
			(error: any) => {
				uploadError.value = error?.message || 'Could not process that image.';
				event.target.value = null;
			},
		);
	}

	function removeImage() {
		imageURL.value = '';
	}

	function isRatingIncluded(size: any) {
		return ratingLadder.value.includes(size);
	}

	function toggleRatingOption(size: any) {
		let current = [...ratingLadder.value];
		if (current.includes(size)) {
			if (current.length > 1) {
				current = current.filter((s: number) => s !== size);
			}
		} else {
			current.push(size);
			current.sort((a, b) => a - b);
		}
		ratingLadder.value = current;
	}

	function getDieDisplayValue(value: any) {
		return characterCurioFunctions.renderDieconSVG(value, false, '', getView(props.character)?.diceConfig);
	}

	function updateCharacter(character?: any) {
		emit('updateCharacter', character);
	}

	function ensurePipStruct() {
		const ctk = ctkFor(props.traitSetID);
		ctk.pips ??= {
			perRow: 5,
			connected: true,
		};
		const ts = traitSet.value as unknown as Record<string, any>;
		if (ts && (!ts.rating || typeof ts.rating !== 'object' || (ts.rating as any).type !== 'Pip')) {
			ts.rating = { type: 'Pip', value: Array.from({ length: 25 }, () => false) };
		}
	}

	// The track count and fill live on the set node's Pip rating;
	// perRow/connected/labels stay presentation in view.pips.
	function setPipTrack(count: number, filled: number) {
		const ts = traitSet.value as unknown as Record<string, any>;
		if (!ts) return;
		const bubbles: boolean[] = [];
		for (let i = 0; i < count; i++) bubbles.push(i < filled);
		ts.rating = { type: 'Pip', value: bubbles };
		updateCharacter(props.character);
	}

	function setPipProperty(key: keyof PipsConfig, value: any) {
		ensurePipStruct();
		let s = props.traitSetID;
		ctkFor(s).pips![key] = value;
		updateCharacter(props.character);
	}

	function checkAnchorPosition() {
		if (!rootEl.value || !rootEl.value.parentElement) return;

		let windowHeight = window.innerHeight || document.documentElement.clientHeight;
		let parentRect = rootEl.value.parentElement.getBoundingClientRect();
		let traitMidpoint = parentRect.top + parentRect.height / 2;

		if (traitMidpoint < windowHeight / 2) {
			anchorPosition.value = 'top';
		} else {
			anchorPosition.value = 'bottom';
		}

		nextTick(() => {
			if (!rootEl.value) return;

			rootEl.value.style.setProperty('--editor-shift-y', '0px');
			rootEl.value.style.setProperty('--arrow-shift-y', '0px');

			let rect = rootEl.value.getBoundingClientRect();
			let pad = 16;
			let shiftY = 0;

			if (rect.top < pad) {
				shiftY = pad - rect.top;
			} else if (rect.bottom > windowHeight - pad) {
				shiftY = windowHeight - pad - rect.bottom;
			}

			if (Math.abs(shiftY) > 0.5) {
				rootEl.value.style.setProperty('--editor-shift-y', `${shiftY}px`);
				let arrowNaturalY = anchorPosition.value === 'bottom' ? rect.height - 16 : 16;
				let targetArrowY = arrowNaturalY - shiftY;
				let clampedArrowY = Math.max(16, Math.min(rect.height - 16, targetArrowY));
				let arrowShift = clampedArrowY - arrowNaturalY;
				rootEl.value.style.setProperty('--arrow-shift-y', `${arrowShift}px`);
			}
			checkScrollPosition();
		});
	}

	function checkScrollPosition() {
		if (!rootEl.value || typeof rootEl.value.querySelector !== 'function') return;
		let element = rootEl.value.querySelector('.editor-inner > div');
		if (!element) return;

		let distance = element.scrollTop;
		let max = element.scrollHeight - element.clientHeight;

		if (max <= 0) {
			scrollPosition.value = 'none';
			return;
		}

		if (distance === 0) {
			scrollPosition.value = 'top';
			return;
		}

		if (distance >= max) {
			scrollPosition.value = 'bottom';
			return;
		}

		scrollPosition.value = 'middle';
	}

	const api = {
		rootEl,
		inputName,
		imageFileInput,
		scrollPosition,
		anchorPosition,
		showDeleteConfirm,
		uploadError,
		styleOptions,
		traitSet,
		character,
		traitSetID,
		name,
		description,
		noun,
		plural,
		styleBody,
		isRing,
		isName,
		isFullWidthSpan,
		partPreview,
		partCells,
		effectivePartCells,
		isPartsPreview,
		isRowBody,
		hasParts,
		hasCustomParts,
		setPartCell,
		removePartCell,
		resetParts,
		branchShares,
		setBranchShare,
		hasCustomBranch,
		templateEntry,
		restorableTraitNames,
		ringSpread,
		ringDistance,
		ringAngle,
		ringAngleLabel,
		scaleAngle,
		scaleAngleLabel,
		scaleDistance,
		ringScaleY,
		ringScaleX,
		scaleDieValue,
		imageURL,
		imageAlignment,
		imageHeight,
		imageWidth,
		imageCaption,
		namePortraitVisibility,
		toggleNamePortraitVisibility,
		includeOut,
		endWord,
		hasCounterTrait,
		ratingLadder,
		isPool,
		setRating,
		setSpendable,
		setEditableOnSheet,
		setHitches,
		reservedSlots,
		traitColumns,
		setVisibility,
		cycleSetVisibility,
		setPillar,
		resolvedPillar,
		presetSaved,
		saveSetAsPreset,
		showBlockMini,
		openBlockMini,
		closeBlockMini,
		characterCustomPillars,
		hasTrackPart,
		setSubtraits,
		openSetSubtrait,
		removeSetSubtrait,
		createSubtrait,
		trackLabel,
		ratingPosition,
		ratingDisplay,
		labelPosition,
		counterLabel,
		pipCount,
		pipsPerRow,
		pipsConnected,
		pipsFilled,
		pipLabels,
		frameOptions,
		frameShape,
		setFrameShape,
		frameWidth,
		setFrameWidth,
		frameColor,
		setFrameColor,
		frameDash,
		setFrameDash,
		frameBox,
		setFrameBox,
		frameImageUrl,
		frameImageAlignment,
		frameImageZoom,
		setFrameImage,
		imageZoom,
		scrollable,
		needsDiceUI,
		allowsTraitColumns,
		editorDock,
		branchArrows,
		headerMode,
		headerAlign,
		borderless,
		cssClass,
		selectElement,
		focusFirstInput,
		targetValue,
		setProperty,
		promptDeleteTraitSet,
		cancelDeleteTraitSet,
		confirmDeleteTraitSet,
		restoreTrait,
		setRingConfig,
		resetRingPlacement,
		setCustomProperty,
		styleLabel,
		setStyleLabel,
		hasLabelContent,
		setImageConfig,
		uploadImageStart,
		uploadImageProcess,
		removeImage,
		isRatingIncluded,
		toggleRatingOption,
		getDieDisplayValue,
		updateCharacter,
		ensurePipStruct,
		setPipProperty,
		checkAnchorPosition,
		checkScrollPosition,
	};

	onMounted(() => {
		checkAnchorPosition();
		window.addEventListener('resize', checkAnchorPosition);
	});

	onUnmounted(() => {
		window.removeEventListener('resize', checkAnchorPosition);
	});

	onUpdated(() => {
		if (props.open) {
			checkAnchorPosition();
		}
	});

	watch(
		() => props.traitSetID,
		() => {
			showDeleteConfirm.value = false;
			partPreview.value = null;
		},
	);
	watch(
		() => props.character,
		() => {
			checkAnchorPosition();
		},
	);
	watch(
		() => props.viewY,
		() => {
			checkAnchorPosition();
		},
	);
	watch(
		() => props.open,
		(isOpen: boolean | undefined, wasOpen: boolean | undefined) => {
			showDeleteConfirm.value = false;
			if (isOpen && !wasOpen) {
				focusFirstInput();
				nextTick(() => {
					checkAnchorPosition();
					setTimeout(() => {
						checkAnchorPosition();
					}, 220);
				});
			} else if (!isOpen) {
				if (rootEl.value) {
					rootEl.value.style.setProperty('--editor-shift-y', '0px');
					rootEl.value.style.setProperty('--arrow-shift-y', '0px');
				}
			}
		},
	);

	provide(TRAIT_SET_EDITOR_KEY, api);
	return api;
}

export function injectTraitSetEditor(): TraitSetEditorApi {
	const api = inject(TRAIT_SET_EDITOR_KEY);
	if (!api) throw new Error('use-trait-set-editor: injectTraitSetEditor() called outside TraitSetEditor');
	return api;
}
