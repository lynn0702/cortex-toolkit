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
import { buildParts, parsePct } from './sheet-grid.ts';
import { FLEX_BODIES, useTraitSetParts, resolveBranchShares, type PartCellRecord } from './use-trait-set-parts.ts';
export { resolveBranchShares };
import {
	DIE_LADDER,
	getView,
	ensureView,
	isNameSet,
	getRating,
	preserveInheritedTraitTypes,
	ratingDice,
	resolveRating,
	setRatingDie,
	resolveVisibility,
	nextVisibility,
	resolveSetPillar,
	resolveSubtraitNoun,
	resolveSubtraitPlural,
	resolvePpDelta,
} from './model.ts';
import { useTraitSetFrame, type MutableFrameConfig } from './use-trait-set-frame.ts';
import type { ToastOptions } from './use-toast.ts';
import type {
	Character,
	Trait,
	TraitSet,
	SheetTemplate,
	CharacterCurioCustom,
	PipsConfig,
	Visibility,
} from './model.ts';

export type TraitSetEditorApi = ReturnType<typeof useTraitSetEditor>;

export interface SetSubtraitItem {
	idx: number;
	sub: Trait;
	label: string;
	summary: string;
}

export interface TraitSetEditorEmit {
	(event: 'selectElement', selector: Array<string | number>): void;
	(event: 'updateCharacter', character: Character): void;
	(event: 'removeTraitSet', traitSetID: number): void;
}

export interface TraitSetEditorProps {
	character: Character;
	traitSetID: number;
	open?: boolean;
	viewY?: number | null;
}

export const TRAIT_SET_EDITOR_KEY: InjectionKey<TraitSetEditorApi> = Symbol('traitSetEditorApi');

export function useTraitSetEditor(props: TraitSetEditorProps, emit: TraitSetEditorEmit) {
	const inst = getCurrentInstance();

	const rootEl = ref<HTMLElement | null>(null);
	const inputName = ref<HTMLInputElement | null>(null);
	const imageFileInput = ref<HTMLInputElement | null>(null);

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
		{ id: 'curiosity', label: 'Curiosity' },
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

	const tags = computed<string[]>({
		get: () => (Array.isArray(traitSet.value?.tags) ? traitSet.value.tags : []),
		set: (v: string[]) => setProperty('tags', v),
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
			const view = ensureView(traitSet.value);
			if (!view.style) view.style = {};
			if (value === 'portrait-ring') {
				// Non-exclusive presetter: presets orthogonal border + portrait circle + ring array
				// without disturbing other trait sets or wiping an existing portrait/size/position.
				view.style.body = 'portrait-ring';
				view.style.header = 'portrait-ring';
				delete (view as Record<string, unknown>).location;
				(view as Record<string, unknown>).border = 'none';
				const prev = normalizedFrameBase();
				const nextFrame: MutableFrameConfig = {
					...prev,
					shape: 'circle',
					array: 'ring',
					span: [0, 360],
				};
				delete nextFrame.traitsSpan;
				view.frame = nextFrame;
			} else {
				view.style.body = value;
				view.style.header = value;
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

	const isName = computed(() => isNameSet(traitSet.value));

	const isFullWidthSpan = computed(() => {
		const place = getView(traitSet.value)?.place;
		if (!place || typeof place !== 'object' || Array.isArray(place)) return true;
		const w = parsePct((place as unknown as Record<string, unknown>).width);
		return w === null || w >= 99.9;
	});

	// Trait-part cells (view.parts): the generator spec shared by rebuilds
	// and the default comparison, so hand-tuned widths survive control
	const {
		partsSpec,
		isRingFrame,
		normalizeEffectiveParts,
		partCells,
		hasParts,
		isPartsDriven,
		isRowBody,
		effectivePartCells,
		isPartsPreview,
		hasCustomParts,
		editablePartCells,
		setPartCell,
		removePartCell,
		activePartKeys,
		togglePartCell,
		getPartMarker,
		setPartMarker,
		addChildPartSlot,
		branchShares,
		setBranchShare,
		hasCustomBranch,
		resetParts,
	} = useTraitSetParts({
		character,
		traitSet,
		styleBody,
		getRatingLadder: () => ratingLadder.value,
		toggleTrackPart: () => {
			hasTrackPart.value = !hasTrackPart.value;
		},
		partsHaveTrack,
		currentPartRatingPlacement,
		rebuildParts,
		updateCharacter,
	});

	const templateEntry = computed(() => {
		const root = inst?.proxy?.$root as { sheetTemplates?: SheetTemplate[] } | null | undefined;
		return characterCurioFunctions.resolveTemplateFor(props.character, root?.sheetTemplates ?? null);
	});

	// Template traits by name not currently on this sheet (D19 restore menu).
	const restorableTraitNames = computed(() =>
		characterCurioFunctions.restorableTraits(props.character, templateEntry.value, props.traitSetID),
	);

	const {
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
		setRingConfig,
		resetRingPlacement,
		imageURL,
		imageAlignment,
		imageHeight,
		imageWidth,
		imageCaption,
		imageZoom,
		imageLayout,
		setImageConfig,
		uploadImageStart,
		uploadImageProcess,
		removeImage,
		normalizedFrameBase,
		frameImageUrl,
		frameImageAlignment,
		frameImageZoom,
		setFrameImage,
		uploadPortraitImageProcess,
		frameColorTokens,
		borderOptions,
		resolvedBorder,
		borderShape,
		setBorderShape,
		borderWidth,
		borderColor,
		borderCorner,
		borderDash,
		setBorderProp,
		frameTint,
		setFrameTint,
		portraitFrameOptions,
		traitArrayOptions,
		portraitFrameShape,
		traitArrayMode,
		arcStrokeMode,
		frameWidth,
		setFrameWidth,
		frameColor,
		setFrameColor,
		frameDash,
		setFrameDash,
		frameSize,
		setFrameSize,
		framePosition,
		setFramePosition,
		hasPortraitOrArray,
	} = useTraitSetFrame({
		character,
		traitSetID,
		traitSet,
		styleBody,
		imageFileInput,
		uploadError,
		ctkFor,
		updateCharacter,
	});

	function addTraitInEditor() {
		const ts = traitSet.value;
		if (!ts) return;
		const n = ts.noun && ts.noun.length ? ts.noun : 'Trait';
		const trait = structuredClone(characterCurioFunctions.defaultTrait) as Trait;
		trait.name = characterCurioFunctions.nextUniqueName(
			(Array.isArray(ts.traits) ? ts.traits : []).map((tr) => tr?.name ?? ''),
			'New ' + n,
		);
		const allowed = characterCurioFunctions.getTraitSetRatings(ts);
		const cur =
			trait.rating && trait.rating.type === 'Die' && Array.isArray(trait.rating.value)
				? Number(trait.rating.value[0])
				: 0;
		const isDefaultLadder = allowed.length === DIE_LADDER.length && allowed.every((x, i) => x === DIE_LADDER[i]);
		if (allowed.length > 0 && !allowed.includes(cur)) {
			trait.rating = isDefaultLadder
				? { type: 'Die', value: [allowed[0]] }
				: { type: 'Die', value: [allowed[0]], range: allowed.slice() };
		} else if (!isDefaultLadder && allowed.length > 0 && trait.rating) {
			trait.rating.range = allowed.slice();
		}
		if (!Array.isArray(ts.traits)) ts.traits = [];
		ts.traits.push(trait);
		if (styleBody.value === 'image' && !getView(ts)?.parts) {
			ensureView(ts).parts = buildParts(partsSpec());
		}
		updateCharacter(props.character);
		selectElement(['trait', props.traitSetID, ts.traits.length - 1]);
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
			if (view && view.labels && typeof view.labels.out === 'string') return view.labels.out;
			if (view && typeof view.endWord === 'string') return view.endWord;
			return 'OUT';
		},
		set: (val: string) => {
			const str = typeof val === 'string' ? val : '';
			setCustomProperty('endWord', str);
			const view = ensureView(traitSet.value);
			if (!view.labels) view.labels = {};
			view.labels.out = str;
			updateCharacter(structuredClone(toRaw(props.character)));
		},
	});

	const hasCounterTrait = computed(() => {
		const traits = Array.isArray(traitSet.value?.traits) ? traitSet.value.traits : [];
		return traits.some((t) => resolveRating(t, [traitSet.value])?.type === 'Counter');
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
			const ts = traitSet.value as unknown as Record<string, unknown> | null;
			if (!ts) return;
			const next = Boolean(value);
			ts.pool = next;
			if (next) {
				const scale = ratingLadder.value;
				const defaultDie = Array.isArray(scale) && scale.length ? scale[0] : 8;
				const cur = getRating(ts);
				if (cur && cur.type !== 'Dice') {
					const dice = ratingDice(cur);
					const ownRange = Array.isArray(cur.range) && cur.range.length ? [...cur.range] : undefined;
					ts.rating = {
						type: 'Dice',
						value: dice.length ? dice : [defaultDie],
						...(ownRange ? { range: ownRange } : {}),
						...((cur as { out?: unknown }).out === true ? { out: true } : {}),
					};
				}
				let hasRatedTrait = false;
				if (Array.isArray(ts.traits)) {
					(ts.traits as Trait[]).forEach((ct) => {
						if (!ct || typeof ct !== 'object' || !ct.rating || typeof ct.rating !== 'object') return;
						hasRatedTrait = true;
						const trCur = getRating(ct);
						if (trCur) {
							if (trCur.type !== 'Dice') {
								const dice = ratingDice(trCur);
								const ownRange = Array.isArray(trCur.range) && trCur.range.length ? [...trCur.range] : undefined;
								ct.rating = {
									type: 'Dice',
									value: dice.length ? dice : [defaultDie],
									...(ownRange ? { range: ownRange } : {}),
									...((trCur as { out?: unknown }).out === true ? { out: true } : {}),
								} as Trait['rating'];
							}
						} else {
							const rawVals = Array.isArray(ct.rating.value)
								? ct.rating.value.filter((v: unknown): v is number => typeof v === 'number' && v > 0)
								: [];
							ct.rating.value = rawVals.length ? rawVals : [defaultDie];
						}
					});
				}
				if (!ts.rating && !hasRatedTrait) {
					ts.rating = { type: 'Dice', value: [defaultDie] };
				}
			}
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
			const ts = traitSet.value as unknown as Record<string, unknown> | null;
			if (!ts) return;
			if (Number(value) > 0) {
				setRatingDie(ts, Number(value));
				delete ts.pool;
			} else {
				preserveInheritedTraitTypes(ts);
				delete ts.rating;
				delete ts.pool;
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
			const ts = traitSet.value as unknown as Record<string, unknown> | null;
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
			const ts = traitSet.value as unknown as Record<string, unknown> | null;
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

	const showToast = inject<((msg: string, options?: ToastOptions) => void) | null>('showToast', null);
	const presetSaved = ref(false);
	function saveSetAsPreset() {
		if (!traitSet.value) return;
		const saved = characterCurioFunctions.saveCustomSetPreset(toRaw(traitSet.value), {
			overwriteExistingCustom: true,
			disambiguateBuiltIn: true,
		});
		if (!saved) {
			showToast?.('Could not save preset', { tone: 'error' });
			return;
		}
		presetSaved.value = true;
		showToast?.(`Saved preset "${saved.label}"`);
		setTimeout(() => {
			presetSaved.value = false;
		}, 1600);
	}

	const characterCustomPillars = computed<string[]>(() => {
		const list: string[] = [];
		const std = ['prime', 'plus', 'play'];
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
	// view.ladder (no parts form); bespoke bodies are left alone.
	// Pass track true/false to force the track on/off (the toggle);
	// otherwise the current setup carries over.
	function rebuildParts(rating: 'inline' | 'above' | 'below' | 'none', track?: boolean) {
		const view = ensureView(traitSet.value);
		const spec = partsSpec();
		if (track === true && !spec.trackDice) spec.trackDice = 5;
		if (track === false) spec.trackDice = 0;
		view.parts = buildParts({ ...spec, rating });
		updateCharacter(props.character);
	}

	function partsHaveTrack() {
		return characterCurioFunctions.hasTrackPart(traitSet.value);
	}

	function currentPartRatingPlacement(): 'inline' | 'above' | 'below' | 'none' {
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
			rebuildParts(currentPartRatingPlacement(), true);
		},
	});

	const setSubtraits = computed<SetSubtraitItem[]>(() => {
		const traits = traitSet.value?.traits;
		if (!Array.isArray(traits) || traits.length === 0) return [];
		const firstTrait =
			traits.find((tr) => tr && typeof tr === 'object' && Array.isArray(tr.traits) && tr.traits.length > 0) ||
			traits[0];
		const subs = firstTrait?.traits;
		if (!Array.isArray(subs)) return [];
		const result: SetSubtraitItem[] = [];
		subs.forEach((sub, idx: number) => {
			if (!sub || typeof sub !== 'object') return;
			const r = resolveRating(sub, [firstTrait, traitSet.value]);
			const isBlockOrMod = resolvePpDelta(sub) !== 0 || !r || getView(sub)?.part === 'block';
			const label =
				String((isBlockOrMod ? sub.name || sub.noun : resolveSubtraitNoun(sub, traitSet.value)) || 'Subtrait').trim() ||
				'Subtrait';
			const nounStr = typeof sub.noun === 'string' ? sub.noun.trim() : '';
			const summary = nounStr && nounStr.toLowerCase() !== label.toLowerCase() ? nounStr : r?.type ? r.type : 'Unrated';
			result.push({ idx, sub, label, summary });
		});
		return result;
	});

	function openSetSubtrait(item: number | SetSubtraitItem | { idx?: number }) {
		const targetItem = typeof item === 'number' ? setSubtraits.value[item] || { idx: item } : item;
		const subIdx = targetItem?.idx ?? 0;
		selectElement(['subtrait', props.traitSetID, 0, subIdx]);
	}

	function removeSetSubtrait(item: number | SetSubtraitItem | { idx?: number }) {
		if (!traitSet.value || !Array.isArray(traitSet.value.traits)) return;
		const targetItem = typeof item === 'number' ? setSubtraits.value[item] || { idx: item } : item;
		const subIdx = targetItem?.idx ?? 0;
		const firstTrait = traitSet.value.traits[0];
		const firstSubs = firstTrait?.traits;
		const target: Trait | null = Array.isArray(firstSubs) ? (firstSubs[subIdx] ?? null) : null;
		const targetRating = target ? resolveRating(target, [firstTrait, traitSet.value]) : undefined;
		const targetIsBlock = Boolean(
			target && (resolvePpDelta(target) !== 0 || !targetRating || getView(target)?.part === 'block'),
		);
		const targetNameKey = String(target?.name || '')
			.trim()
			.toLowerCase();
		const targetKey = String(target?.noun || target?.name || '')
			.trim()
			.toLowerCase();
		traitSet.value.traits.forEach((tr) => {
			if (!tr || typeof tr !== 'object' || !Array.isArray(tr.traits)) return;
			if (targetIsBlock && targetNameKey) {
				const nameHit = tr.traits.findIndex(
					(st) =>
						st &&
						typeof st === 'object' &&
						String(st.name || '')
							.trim()
							.toLowerCase() === targetNameKey,
				);
				if (nameHit !== -1) {
					tr.traits.splice(nameHit, 1);
					return;
				}
			}
			if (targetKey) {
				const matchIdx = tr.traits.findIndex(
					(st) =>
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
		const hasRemainingBlock = traitSet.value.traits.some(
			(tr) => characterCurioFunctions.blockChildren(tr, traitSet.value).length > 0,
		);
		if (!hasRemainingBlock) {
			const v = getView(traitSet.value);
			if (v?.parts?.block) {
				delete v.parts.block;
			}
		}
		if (targetKey && targetKey === trackLabel.value.toLowerCase()) {
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
			const baseTrait = structuredClone(characterCurioFunctions.defaultTrait) as Trait;
			baseTrait.name = 'New ' + (traitSet.value.noun || 'Trait');
			traitSet.value.traits.push(baseTrait);
		}
		const firstTrait = traitSet.value.traits[0];
		const existingSubs = Array.isArray(firstTrait?.traits) ? firstTrait.traits : [];
		let subNoun = '';
		if (existingSubs.length === 0) {
			subNoun = getView(traitSet.value)?.labels?.subtrait || trackLabel.value;
		} else {
			let n = existingSubs.length + 1;
			subNoun = `Subtrait ${n}`;
			while (
				existingSubs.some(
					(st) =>
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
		traitSet.value.traits.forEach((tr, tIdx: number) => {
			if (!tr || typeof tr !== 'object') return;
			if (!Array.isArray(tr.traits)) tr.traits = [];
			const sub: Trait = {
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
			subNoun.toLowerCase() === trackLabel.value.toLowerCase() &&
			allowsTraitColumns.value &&
			styleBody.value !== 'pips' &&
			styleBody.value !== 'die-track'
		) {
			rebuildParts(currentPartRatingPlacement(), true);
		} else {
			updateCharacter(props.character);
		}
		selectElement(['subtrait', props.traitSetID, 0, targetSubIdx]);
	}

	const trackLabel = computed({
		get: () => {
			const labels = getView(traitSet.value)?.labels;
			if (labels && typeof labels.track === 'string') return labels.track;
			return characterCurioFunctions.getTrackLabel(traitSet.value);
		},
		set: (val: string) => {
			const view = ensureView(traitSet.value);
			const prev = getView(traitSet.value)?.labels?.track ?? characterCurioFunctions.getTrackLabel(traitSet.value);
			if (!view.labels || typeof view.labels !== 'object') view.labels = {};
			if (typeof val === 'string') view.labels.track = val;
			else delete view.labels.track;
			// Keep track companions (subtraits named for the label) glued
			// to the label: rename matches, never clobbering an occupant.
			const next = typeof val === 'string' ? val : '';
			if (prev.length > 0 && next.length > 0 && next !== prev && Array.isArray(traitSet.value?.traits)) {
				traitSet.value.traits.forEach((tr) => {
					if (!tr || typeof tr !== 'object' || !Array.isArray(tr.traits)) return;
					const hit = tr.traits.findIndex((st) => st && typeof st === 'object' && st.name === prev);
					if (hit === -1) return;
					const occupied = tr.traits.some((st) => st && typeof st === 'object' && st.name === next);
					if (!occupied) tr.traits[hit].name = next;
				});
			}
			updateCharacter(props.character);
		},
	});

	const ratingDisplay = computed<'track' | 'rating'>({
		get: () => {
			const v = getView(traitSet.value);
			const raw =
				(v?.ratingDisplay as 'track' | 'rating') ||
				(traitSet.value as { ratingDisplay?: unknown } | null)?.ratingDisplay;
			return raw === 'track' ? 'track' : 'rating';
		},
		set: (val: 'track' | 'rating') => {
			const view = ensureView(traitSet.value);
			view.ratingDisplay = val === 'track' ? 'track' : 'rating';
			if (traitSet.value && typeof traitSet.value === 'object') {
				delete (traitSet.value as Record<string, unknown>).ratingDisplay;
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
		get: () => {
			const fromLabels = (getView(traitSet.value)?.labels as Record<string, unknown> | undefined)?.counter;
			return typeof fromLabels === 'string' ? fromLabels : '';
		},
		set: (val: string) => {
			const view = ensureView(traitSet.value);
			const str = typeof val === 'string' ? val : '';
			if (!view.labels || typeof view.labels !== 'object') view.labels = {};
			if (str.length > 0) view.labels.counter = str;
			else delete view.labels.counter;
			updateCharacter(props.character);
		},
	});

	const ringNoun = computed({
		get: () => {
			const v = getView(traitSet.value)?.ringNoun;
			return typeof v === 'string' ? v : '';
		},
		set: (val: string) => {
			const view = ensureView(traitSet.value);
			const trimmed = typeof val === 'string' ? val.trim() : '';
			if (trimmed.length) view.ringNoun = trimmed;
			else delete view.ringNoun;
			updateCharacter(props.character);
		},
	});

	const pipCount = computed({
		get: () => {
			const rating = getRating(traitSet.value);
			if (rating && rating.type === 'Pip' && Array.isArray(rating.value)) {
				return rating.value.length;
			}
			return 5;
		},
		set: (val: number) => {
			setPipTrack(Math.max(1, parseInt(String(val), 10) || 5), pipsFilled.value);
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
		set: (val: boolean) => {
			setPipProperty('connected', Boolean(val));
		},
	});

	const pipLabels = computed({
		get: () => getView(traitSet.value)?.pips?.labels === true,
		set: (val: boolean) => {
			setPipProperty('labels', Boolean(val));
		},
	});

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

	const headerAlign = computed<'left' | 'center' | 'right'>({
		get: () => {
			const a = getView(traitSet.value)?.headerAlign;
			return a === 'center' || a === 'right' ? a : 'left';
		},
		set: (val: 'left' | 'center' | 'right') => {
			setCustomProperty('headerAlign', val === 'center' || val === 'right' ? val : 'left');
		},
	});

	const verticalAlign = computed<'top' | 'center' | 'bottom'>({
		get: () => {
			const v = getView(traitSet.value)?.verticalAlign;
			return v === 'center' || v === 'bottom' ? v : 'top';
		},
		set: (val: 'top' | 'center' | 'bottom') => {
			setCustomProperty('verticalAlign', val === 'center' || val === 'bottom' ? val : 'top');
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

	function selectElement(selector: Array<string | number>) {
		emit('selectElement', selector);
	}

	function targetValue(event: Event): string {
		const el = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
		return el?.value ?? '';
	}

	async function focusFirstInput() {
		if (typeof window !== 'undefined' && window.matchMedia?.('(max-width: 56.25rem), (pointer: coarse)').matches) {
			return;
		}
		await nextTick();
		if (inputName.value) {
			inputName.value.focus({ preventScroll: true });
		}
	}

	// Ensure + return this set's view bag (typed).
	function ctkFor(s: number): CharacterCurioCustom {
		return ensureView(props.character.traitSets[s]);
	}

	function setProperty<K extends keyof TraitSet>(key: K, value: TraitSet[K]) {
		let character = props.character;
		let s = props.traitSetID;

		character.traitSets[s][key] = value;

		updateCharacter(character);
	}

	function promptDeleteTraitSet() {
		if (isName.value) return;
		const setNode = traitSet.value;
		const hasPopulatedTraits = (setNode?.traits || []).some(
			(t) =>
				(typeof t?.name === 'string' && t.name.trim().length > 0) ||
				(typeof t?.description === 'string' && t.description.trim().length > 0),
		);
		const setR = getRating(setNode);
		const hasSetRating = Boolean(
			setR &&
			(ratingDice(setR).length > 0 ||
				(setR.type === 'Pip' && Array.isArray(setR.value) && setR.value.length > 0) ||
				setR.type === 'Counter'),
		);
		const hasSetMediaOrRef = Boolean(frameImageUrl.value || imageURL.value || setNode?.ref);
		if (!hasPopulatedTraits && !hasSetRating && !hasSetMediaOrRef) {
			confirmDeleteTraitSet();
			return;
		}
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

	function setCustomProperty(key: string, value: unknown) {
		let s = props.traitSetID;
		ctkFor(s)[key] = value;
		updateCharacter(props.character);
	}

	// Generic trait-set label store: one flat dictionary for every
	// style's named regions; defaults resolve centrally per style.
	// Inputs bind :value/@change (and placeholder) to it.
	function styleLabel(key: string) {
		const labels = getView(traitSet.value)?.labels;
		if (labels && typeof labels[key] === 'string') {
			return labels[key];
		}
		return characterCurioFunctions.labelDefaultForStyle(styleBody.value, key);
	}

	function styleLabelPlaceholder(key: string) {
		return characterCurioFunctions.labelDefaultForStyle(styleBody.value, key);
	}

	function setStyleLabel(key: string, value: unknown) {
		let s = props.traitSetID;
		const ctk = ctkFor(s);
		ctk.labels ??= {};
		ctk.labels[key] = typeof value === 'string' ? value : '';

		updateCharacter(props.character);
	}

	// Labels group content: style-region headings, nouns, stress label, or
	// counter column. The group hides when nothing in it applies, so no
	// editor section can render empty.
	const hasLabelContent = computed(() => {
		const body = styleBody.value;
		if (
			body === 'subtrait-columns' ||
			body === 'dice-count' ||
			body === 'three-column-table' ||
			body === 'paired-slots'
		) {
			return true;
		}
		if (hasCounterTrait.value || hasTrackPart.value || traitArrayMode.value === 'ring' || Boolean(ringNoun.value)) {
			return true;
		}
		return body !== 'pips' && body !== 'name';
	});

	function isRatingIncluded(size: number) {
		return ratingLadder.value.includes(size);
	}

	function toggleRatingOption(size: number) {
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

	function getDieDisplayValue(value: number, isFilled = false) {
		return characterCurioFunctions.renderDieconSVG(value, isFilled, '', getView(props.character)?.diceConfig);
	}

	function updateCharacter(character?: Character) {
		if (character) emit('updateCharacter', character);
	}

	function commitCharacter() {
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	function ensurePipStruct() {
		const ctk = ctkFor(props.traitSetID);
		ctk.pips ??= {
			perRow: 5,
			connected: true,
		};
		const ts = traitSet.value;
		if (ts && (!ts.rating || typeof ts.rating !== 'object' || ts.rating.type !== 'Pip')) {
			ts.rating = { type: 'Pip', value: Array.from({ length: 25 }, () => false) };
		}
	}

	// The track count and fill live on the set node's Pip rating;
	// perRow/connected/labels stay presentation in view.pips.
	function setPipTrack(count: number, filled: number) {
		const ts = traitSet.value;
		if (!ts) return;
		const bubbles: boolean[] = [];
		for (let i = 0; i < count; i++) bubbles.push(i < filled);
		ts.rating = { type: 'Pip', value: bubbles };
		updateCharacter(props.character);
	}

	function setPipProperty<K extends keyof PipsConfig>(key: K, value: PipsConfig[K]) {
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

			checkScrollPosition();

			const applied = parseFloat(getComputedStyle(rootEl.value).getPropertyValue('--editor-shift-y') || '0');
			const currentShift = Number.isFinite(applied) ? applied : 0;
			const rect = rootEl.value.getBoundingClientRect();
			const naturalTop = rect.top - currentShift;
			const naturalBottom = rect.bottom - currentShift;
			const pad = 16;
			let shiftY = 0;

			if (naturalTop < pad) {
				shiftY = pad - naturalTop;
			} else if (naturalBottom > windowHeight - pad) {
				shiftY = windowHeight - pad - naturalBottom;
			}

			if (Math.abs(shiftY) > 0.5) {
				rootEl.value.style.setProperty('--editor-shift-y', `${shiftY}px`);
				const arrowNaturalY = anchorPosition.value === 'bottom' ? rect.height - 16 : 16;
				const targetArrowY = arrowNaturalY - shiftY;
				const clampedArrowY = Math.max(16, Math.min(rect.height - 16, targetArrowY));
				rootEl.value.style.setProperty('--arrow-shift-y', `${clampedArrowY - arrowNaturalY}px`);
			} else {
				rootEl.value.style.setProperty('--editor-shift-y', '0px');
				rootEl.value.style.setProperty('--arrow-shift-y', '0px');
			}
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
		tags,
		noun,
		plural,
		styleBody,
		isName,
		isFullWidthSpan,
		partPreview,
		partCells,
		effectivePartCells,
		isPartsPreview,
		isRowBody,
		hasParts,
		hasCustomParts,
		activePartKeys,
		togglePartCell,
		getPartMarker,
		setPartMarker,
		addChildPartSlot,
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
		imageLayout,
		addTraitInEditor,
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
		characterCustomPillars,
		hasTrackPart,
		setSubtraits,
		openSetSubtrait,
		removeSetSubtrait,
		createSubtrait,
		trackLabel,
		ratingDisplay,
		labelPosition,
		counterLabel,
		ringNoun,
		pipCount,
		pipsPerRow,
		pipsConnected,
		pipsFilled,
		pipLabels,
		frameColorTokens,
		borderOptions,
		resolvedBorder,
		borderShape,
		setBorderShape,
		borderWidth,
		borderColor,
		borderCorner,
		borderDash,
		frameTint,
		setFrameTint,
		portraitFrameOptions,
		traitArrayOptions,
		portraitFrameShape,
		traitArrayMode,
		arcStrokeMode,
		hasPortraitOrArray,
		frameWidth,
		setFrameWidth,
		frameColor,
		setFrameColor,
		frameDash,
		setFrameDash,
		frameSize,
		setFrameSize,
		framePosition,
		setFramePosition,
		frameImageUrl,
		frameImageAlignment,
		frameImageZoom,
		setFrameImage,
		uploadPortraitImageProcess,
		imageZoom,
		scrollable,
		needsDiceUI,
		allowsTraitColumns,
		editorDock,
		branchArrows,
		headerMode,
		headerAlign,
		verticalAlign,
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
		styleLabelPlaceholder,
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
		commitCharacter,
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
