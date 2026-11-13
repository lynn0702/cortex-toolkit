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
import {
	resolveBorder,
	resolveFrame,
	normalizeZoom,
	normalizeRingSize,
	type BorderShape,
	type PortraitFrameShape,
	type TraitArrayMode,
	type FrameConfig,
} from './frame-geometry.ts';
import { getCharacterColorTokens } from './color-palette.ts';
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

	const tags = computed<string[]>({
		get: () => (Array.isArray(traitSet.value?.tags) ? traitSet.value.tags : []),
		set: (v: string[]) => setProperty('tags', v),
	});

	const portraitTags = computed<string[]>({
		get: () => (Array.isArray(props.character?.portrait?.tags) ? props.character.portrait.tags : []),
		set: (v: string[]) => {
			if (!props.character) return;
			props.character.portrait ??= { url: '', alt: '', tags: [] };
			props.character.portrait.alt ??= '';
			props.character.portrait.tags = v;
			updateCharacter(props.character);
		},
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
				delete (view as Record<string, unknown>).borderless;
				const prev = normalizedFrameBase();
				(view as any).frame = {
					...prev,
					shape: 'circle',
					array: 'ring',
					span: [0, 360],
				};
				delete (view as any).frame.traitsSpan;
				delete (view as any).frame.box;
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
		const rating = currentPartRatingPlacement();
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
		const f = resolveFrame(traitSet.value);
		return Boolean(f && f.array !== 'none');
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
	// Ladders keep view.ladder (no parts form).
	const FLEX_BODIES = ['image', 'pips', 'subtrait-columns', 'die-rows', 'dice-count'];
	const NON_ROW_BODIES = ['image', 'pips'];
	function isPartsDriven() {
		const body = getView(traitSet.value)?.style?.body;
		if (typeof body === 'string' && (FLEX_BODIES as readonly string[]).includes(body)) return false;
		return true;
	}
	function isRowBody() {
		const body = getView(traitSet.value)?.style?.body;
		if (typeof body === 'string' && (NON_ROW_BODIES as readonly string[]).includes(body)) return false;
		return true;
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

	const activePartKeys = computed(() => new Set(effectivePartCells.value.map((c) => c.key)));

	function togglePartCell(partKey: string) {
		if (!traitSet.value) return;
		if (partKey === 'track') {
			hasTrackPart.value = !hasTrackPart.value;
			return;
		}
		const view = ensureView(traitSet.value);
		view.parts = normalizeEffectiveParts(view.parts as Record<string, any> | undefined);
		const cells = view.parts as Record<string, any>;
		if (cells[partKey]) {
			if (Object.keys(cells).length <= 1) return;
			delete cells[partKey];
			updateCharacter(props.character);
			return;
		}
		const maxTop = Object.values(cells).reduce((m: number, c: any) => Math.max(m, Number(c?.top) || 0), -1);
		if (partKey === 'rating' && cells.name && Number(cells.name.top || 0) === 0 && parsePct(cells.name.width) === 100) {
			cells.name.width = '65%';
			cells.rating = {
				left: '65%',
				top: 0,
				width: '35%',
				height: 1,
				ratingType: 'Die',
				range: ratingLadder.value,
			};
		} else {
			const cell: Record<string, unknown> = { left: '0%', top: maxTop + 1, width: '100%', height: 1 };
			if (partKey === 'name' || partKey === 'badge') {
				cell.marker = 'L';
			} else if (partKey === 'description' || partKey === 'block') {
				cell.marker = 'T';
			} else if (partKey === 'rating') {
				cell.ratingType = 'Die';
				cell.range = ratingLadder.value;
			}
			cells[partKey] = cell;
		}
		updateCharacter(props.character);
	}

	function getPartMarker(key: string): 'L' | 'T' | null {
		if (!key) return null;
		const textCapable =
			key === 'name' ||
			key === 'description' ||
			key === 'block' ||
			key === 'badge' ||
			key === 'trackLabel' ||
			(key.startsWith('child:') && !key.endsWith(':rating'));
		if (!textCapable) return null;
		const rawParts = getView(traitSet.value)?.parts as Record<string, any> | undefined;
		const cell = rawParts?.[key];
		if (cell?.marker === 'L' || cell?.marker === 'T') return cell.marker;
		return key === 'description' || key === 'block' || key.startsWith('child:') ? 'T' : 'L';
	}

	function setPartMarker(key: string, marker: 'L' | 'T') {
		if (!traitSet.value || !key) return;
		const view = ensureView(traitSet.value);
		view.parts = normalizeEffectiveParts(view.parts as Record<string, any> | undefined);
		const cells = view.parts as Record<string, any>;
		if (!cells[key]) return;
		cells[key].marker = marker;
		updateCharacter(props.character);
	}

	function addChildPartSlot(
		rawNoun: string,
		kind: 'both' | 'label' | 'rating' = 'both',
		ratingType: 'Pip' | 'Die' | 'Counter' = 'Pip',
	) {
		if (!traitSet.value) return;
		const noun = String(rawNoun || '')
			.trim()
			.replace(/:/g, '');
		if (!noun) return;
		const view = ensureView(traitSet.value);
		view.parts = normalizeEffectiveParts(view.parts as Record<string, any> | undefined);
		const cells = view.parts as Record<string, any>;
		const nextTop = Object.values(cells).reduce((m: number, c: any) => Math.max(m, Number(c?.top) || 0), -1) + 1;
		if (kind === 'both') {
			cells[`child:${noun}:label`] = { left: '0%', top: nextTop, width: '75%', height: 1, marker: 'T' };
			cells[`child:${noun}:rating`] = { left: '75%', top: nextTop, width: '25%', height: 1, ratingType };
		} else if (kind === 'label') {
			cells[`child:${noun}:label`] = { left: '0%', top: nextTop, width: '100%', height: 1, marker: 'T' };
		} else {
			cells[`child:${noun}:rating`] = { left: '0%', top: nextTop, width: '100%', height: 1, ratingType };
		}
		if (Array.isArray(traitSet.value.traits)) {
			const lower = noun.toLowerCase();
			for (const tr of traitSet.value.traits as any[]) {
				if (!tr || typeof tr !== 'object') continue;
				if (!Array.isArray(tr.traits)) tr.traits = [];
				const hasMatch = tr.traits.some(
					(st: any) =>
						st &&
						typeof st === 'object' &&
						(String(st.noun || '')
							.trim()
							.toLowerCase() === lower ||
							String(st.name || '')
								.trim()
								.toLowerCase() === lower),
				);
				if (!hasMatch) {
					const defaultRating =
						ratingType === 'Pip'
							? { type: 'Pip', value: [false] }
							: ratingType === 'Counter'
								? { type: 'Counter', value: [0] }
								: { type: 'Die', value: [8], range: ratingLadder.value };
					tr.traits.push({ name: '', noun, rating: defaultRating });
				}
			}
		}
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
		rebuildParts(currentPartRatingPlacement());
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

	function syncArcTraitsSpan(ctk: CharacterCurioCustom, angle: number, spread: number) {
		const frameObj = typeof ctk.frame === 'object' && ctk.frame !== null ? (ctk.frame as any) : null;
		if (!frameObj || frameObj.array !== 'arc') return;
		const centerClock = angle + 180;
		const totalSpan = Math.max(15, (spread / 100) * 360);
		const nextSpan: [number, number] = [
			Math.round(centerClock - totalSpan / 2),
			Math.round(centerClock + totalSpan / 2),
		];
		frameObj.traitsSpan = nextSpan;
		if (Array.isArray(frameObj.span) && Math.abs((frameObj.span[1] ?? 360) - (frameObj.span[0] ?? 0)) < 360) {
			frameObj.span = [...nextSpan];
		}
	}

	const ringSpread = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			if (res?.array === 'arc' && res.traitsSpan) {
				const raw = ((res.traitsSpan[1] - res.traitsSpan[0]) / 360) * 100;
				return Math.max(10, Math.min(100, Math.round(raw)));
			}
			const view = getView(traitSet.value);
			return (view?.frame as any)?.ring?.arcSpread ?? view?.ringConfig?.arcSpread ?? 100;
		},
		set: (val: number) => {
			const num = Number(val);
			setRingConfig('arcSpread', num);
			const ctk = ctkFor(props.traitSetID);
			syncArcTraitsSpan(ctk, ringAngle.value, num);
			updateCharacter(structuredClone(toRaw(props.character)));
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
			const res = resolveFrame(traitSet.value);
			if (res?.array === 'arc' && res.traitsSpan) {
				let a = Math.round((res.traitsSpan[0] + res.traitsSpan[1]) / 2 - 180);
				while (a > 180) a -= 360;
				while (a < -180) a += 360;
				return a;
			}
			const view = getView(traitSet.value);
			const cfg = (view?.frame as any)?.ring ?? view?.ringConfig;
			return cfg?.arcAngle ?? (cfg?.arcSlide !== undefined ? cfg.arcSlide * 3 : -90);
		},
		set: (val: number) => {
			const num = Number(val);
			setRingConfig('arcAngle', num);
			const ctk = ctkFor(props.traitSetID);
			syncArcTraitsSpan(ctk, num, ringSpread.value);
			updateCharacter(structuredClone(toRaw(props.character)));
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
			const cfgZoom = normalizeZoom(getView(traitSet.value)?.imageConfig?.zoom);
			if (typeof cfgZoom === 'number') return cfgZoom;
			if (isName.value || isRing.value) {
				const pZoom = normalizeZoom(getView(props.character?.portrait)?.zoom);
				if (typeof pZoom === 'number') return pZoom;
			}
			return 1;
		},
		set: (val: number) => {
			setImageConfig('zoom', Number(val));
		},
	});

	function normalizedFrameBase(): Record<string, any> {
		const raw = getView(traitSet.value)?.frame;
		const res = resolveFrame(traitSet.value);
		if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
			const copy = structuredClone(toRaw(raw)) as Record<string, any>;
			if (res) {
				copy.shape = res.portraitShape;
				copy.array = res.array;
			}
			delete copy.box;
			return copy;
		}
		if (res) {
			return {
				shape: res.portraitShape,
				array: res.array,
				span: [...res.span],
				...(res.traitsSpan ? { traitsSpan: [...res.traitsSpan] } : {}),
				color: res.color,
				stroke: res.stroke,
				...(res.size !== undefined ? { size: res.size } : {}),
				...(res.position ? { position: res.position } : {}),
				...(res.image ? { image: structuredClone(res.image) } : {}),
				...(res.ringConfig ? { ring: structuredClone(res.ringConfig) } : {}),
			};
		}
		return {
			shape: 'none',
			array: 'none',
			span: [0, 360],
			color: 'primary',
			stroke: '2px',
		};
	}

	const frameImageUrl = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return res?.image?.url || getView(traitSet.value)?.imageConfig?.url || '';
		},
		set: (val: string) => {
			setFrameImage('url', val);
		},
	});

	const frameImageAlignment = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return res?.image?.alignment || getView(traitSet.value)?.imageConfig?.alignment || 'center';
		},
		set: (val: string) => {
			setFrameImage('alignment', val);
		},
	});

	const frameImageZoom = computed({
		get: () => {
			const res = resolveFrame(traitSet.value);
			const z = normalizeZoom(res?.image?.zoom ?? getView(traitSet.value)?.imageConfig?.zoom);
			return typeof z === 'number' ? z : 1;
		},
		set: (val: number) => {
			setFrameImage('zoom', Number(val));
		},
	});

	function setFrameImage(key: 'url' | 'alignment' | 'zoom', value: any) {
		const s = props.traitSetID;
		const ctk = ctkFor(s);
		const frameObj = normalizedFrameBase();
		if (key === 'url' && value && (!frameObj.shape || frameObj.shape === 'none')) {
			frameObj.shape = 'circle';
		}
		frameObj.image ??= {};
		if (value === '' || value === undefined) {
			delete frameObj.image[key];
			if (key === 'url' && ctk.imageConfig && typeof ctk.imageConfig === 'object') {
				delete ctk.imageConfig.url;
			}
			if (Object.keys(frameObj.image).length === 0) {
				delete frameObj.image;
			}
		} else {
			frameObj.image[key] = value;
		}
		ctk.frame = frameObj as any;
		updateCharacter(props.character);
	}

	function uploadPortraitImageProcess(event: any) {
		uploadError.value = '';
		const files = event?.target?.files;
		if (!files || !files.length) return;
		characterCurioFunctions.processImageFile(files[0], 1280, 0.85).then(
			(dataURL: string) => {
				frameImageUrl.value = dataURL;
				event.target.value = null;
			},
			(error: any) => {
				uploadError.value = error?.message || 'Could not process that image.';
				event.target.value = null;
			},
		);
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
			rebuildParts(currentPartRatingPlacement(), true);
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

	const frameColorTokens = computed(() => getCharacterColorTokens(props.character, 'frame'));

	// ---------- Section Border (None | Block | Line) ----------
	const borderOptions = [
		{ id: 'none', label: 'None' },
		{ id: 'block', label: 'Block' },
		{ id: 'line', label: 'Line' },
	];

	const resolvedBorder = computed(() => resolveBorder(traitSet.value));

	const borderShape = computed<BorderShape>({
		get: () => resolvedBorder.value.shape,
		set: (shape: BorderShape) => setBorderShape(shape),
	});

	function normalizedBorderObj(defaultShape: BorderShape): Record<string, any> {
		const cur = resolveBorder(props.character.traitSets[props.traitSetID]);
		const obj: Record<string, any> = {
			shape: defaultShape,
			color: cur.color || (defaultShape === 'line' ? 'strong' : 'primary'),
			stroke: cur.stroke || '2px',
		};
		if (defaultShape === 'block') {
			obj.corner = cur.corner === 'cut' ? 'cut' : cur.corner === 0 ? 0 : 8;
		}
		if (cur.dash) {
			obj.dash = cur.dash;
		}
		return obj;
	}

	function setBorderShape(shape: BorderShape) {
		const ctk = ctkFor(props.traitSetID);
		delete (ctk as Record<string, unknown>).borderless;
		if (shape === 'none') {
			ctk.border = 'none';
			if (ctk.frame && typeof ctk.frame === 'object') {
				delete (ctk.frame as any).box;
				if ((ctk.frame as any).shape === 'block' || (ctk.frame as any).shape === 'line') {
					(ctk.frame as any).shape = (ctk.frame as any).image?.url ? 'circle' : 'none';
				}
			}
		} else {
			ctk.border = normalizedBorderObj(shape) as any;
			if (ctk.frame && typeof ctk.frame === 'object') {
				delete (ctk.frame as any).box;
				if ((ctk.frame as any).shape === 'block' || (ctk.frame as any).shape === 'line') {
					(ctk.frame as any).shape = (ctk.frame as any).image?.url ? 'circle' : 'none';
				}
			}
		}
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	const borderWidth = computed({
		get: () => resolvedBorder.value.stroke || '2px',
		set: (stroke: string) => setBorderProp('stroke', stroke && stroke.trim() ? stroke.trim() : '2px'),
	});

	const borderColor = computed({
		get: () => resolvedBorder.value.color || 'primary',
		set: (color: string) => setBorderProp('color', color || 'primary'),
	});

	const borderCorner = computed<'square' | 'round' | 'cut'>({
		get: () => {
			const c = resolvedBorder.value.corner;
			if (c === 'cut') return 'cut';
			if (c === 0) return 'square';
			return 'round';
		},
		set: (val: 'square' | 'round' | 'cut') => {
			const mapped = val === 'cut' ? 'cut' : val === 'square' ? 0 : 8;
			setBorderProp('corner', mapped);
		},
	});

	const borderDash = computed({
		get: () => resolvedBorder.value.dash || '',
		set: (dash: string) => setBorderProp('dash', dash.trim() || undefined),
	});

	function setBorderProp(key: string, value: any) {
		const ctk = ctkFor(props.traitSetID);
		delete (ctk as Record<string, unknown>).borderless;
		const shape = resolvedBorder.value.shape === 'none' ? 'block' : resolvedBorder.value.shape;
		const obj = normalizedBorderObj(shape);
		if (value === undefined || value === '') {
			delete obj[key];
		} else {
			obj[key] = value;
		}
		ctk.border = obj as any;
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	const frameTint = computed<string>({
		get: () => {
			const t = getView(traitSet.value)?.tint;
			return typeof t === 'string' ? t : '';
		},
		set: (tint: string) => {
			setFrameTint(tint);
		},
	});

	function setFrameTint(tint: string) {
		const ctk = ctkFor(props.traitSetID);
		const trimmed = String(tint || '').trim();
		if (trimmed) {
			ctk.tint = trimmed;
		} else {
			delete ctk.tint;
		}
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	// ---------- Portrait & Portrait Frame + Trait Array ----------
	const portraitFrameOptions = [
		{ id: 'none', label: 'None' },
		{ id: 'circle', label: 'Circle' },
		{ id: 'square', label: 'Square' },
		{ id: 'round', label: 'Round' },
		{ id: 'cut', label: 'Cut' },
	];

	const traitArrayOptions = [
		{ id: 'none', label: 'None' },
		{ id: 'ring', label: 'Ring' },
		{ id: 'arc', label: 'Arc' },
	];

	const portraitFrameShape = computed<PortraitFrameShape>({
		get: () => resolveFrame(traitSet.value)?.portraitShape ?? 'none',
		set: (shape: PortraitFrameShape) => {
			const ctk = ctkFor(props.traitSetID);
			const f = normalizedFrameBase();
			f.shape = shape;
			if (!f.array) f.array = 'none';
			ctk.frame = f as any;
			updateCharacter(structuredClone(toRaw(props.character)));
		},
	});

	const traitArrayMode = computed<TraitArrayMode>({
		get: () => resolveFrame(traitSet.value)?.array ?? 'none',
		set: (mode: TraitArrayMode) => {
			const ctk = ctkFor(props.traitSetID);
			const f = normalizedFrameBase();
			f.array = mode;
			if (mode === 'ring') {
				if (!f.shape || f.shape === 'block' || f.shape === 'line') {
					f.shape = 'circle';
				}
				f.span = [0, 360];
				delete f.traitsSpan;
			} else if (mode === 'arc') {
				if (!f.shape || f.shape === 'block' || f.shape === 'line') {
					f.shape = 'circle';
				}
				if (!Array.isArray(f.traitsSpan) || f.traitsSpan.length < 2) {
					f.traitsSpan = [45, 135];
				}
				f.ring ??= {};
				let a = Math.round((f.traitsSpan[0] + f.traitsSpan[1]) / 2 - 180);
				while (a > 180) a -= 360;
				while (a < -180) a += 360;
				f.ring.arcAngle = a;
				f.ring.arcSpread = Math.max(10, Math.min(100, Math.round(((f.traitsSpan[1] - f.traitsSpan[0]) / 360) * 100)));
				f.span ??= [0, 360];
			} else {
				if (f.shape === 'ring' || f.shape === 'arc') {
					f.shape = 'circle';
				}
			}
			ctk.frame = f as any;
			updateCharacter(structuredClone(toRaw(props.character)));
		},
	});

	const arcStrokeMode = computed<'full' | 'arc'>({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return res && Math.abs((res.span?.[1] ?? 360) - (res.span?.[0] ?? 0)) < 360 ? 'arc' : 'full';
		},
		set: (val: 'full' | 'arc') => {
			const ctk = ctkFor(props.traitSetID);
			const f = normalizedFrameBase();
			if (val === 'arc') {
				const tSpan = Array.isArray(f.traitsSpan) && f.traitsSpan.length >= 2 ? f.traitsSpan : [45, 135];
				f.span = [Number(tSpan[0]) || 45, Number(tSpan[1]) || 135];
			} else {
				f.span = [0, 360];
			}
			ctk.frame = f as any;
			updateCharacter(structuredClone(toRaw(props.character)));
		},
	});

	const frameWidth = computed({
		get: () => resolveFrame(traitSet.value)?.stroke ?? '2px',
		set: (stroke: string) => setFrameWidth(stroke),
	});

	function setFrameWidth(stroke: string) {
		const ctk = ctkFor(props.traitSetID);
		const f = normalizedFrameBase();
		if (stroke && stroke.trim() && stroke.trim() !== '2px') {
			f.stroke = stroke.trim();
		} else {
			delete f.stroke;
		}
		ctk.frame = f as any;
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	const frameColor = computed({
		get: () => resolveFrame(traitSet.value)?.color ?? 'primary',
		set: (color: string) => setFrameColor(color),
	});

	function setFrameColor(color: string) {
		const ctk = ctkFor(props.traitSetID);
		const f = normalizedFrameBase();
		if (color && color !== 'primary') {
			f.color = color;
		} else {
			delete f.color;
		}
		ctk.frame = f as any;
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	const frameDash = computed({
		get: () => resolveFrame(traitSet.value)?.dash ?? '',
		set: (dash: string) => setFrameDash(dash),
	});

	function setFrameDash(dash: string) {
		const ctk = ctkFor(props.traitSetID);
		const f = normalizedFrameBase();
		if (dash && dash.trim()) {
			f.dash = dash.trim();
		} else {
			delete f.dash;
		}
		ctk.frame = f as any;
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	const frameSize = computed<number | null>({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return typeof res?.size === 'number' ? res.size : null;
		},
		set: (size: number | null) => setFrameSize(size),
	});

	function setFrameSize(size: number | null) {
		const ctk = ctkFor(props.traitSetID);
		const f = normalizedFrameBase();
		const normalized = size === null ? undefined : normalizeRingSize(size);
		if (normalized !== undefined) {
			f.size = normalized;
		} else {
			delete f.size;
		}
		ctk.frame = f as any;
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	const framePosition = computed<'left' | 'center' | 'right'>({
		get: () => {
			const res = resolveFrame(traitSet.value);
			return res?.position === 'center' || res?.position === 'right' ? res.position : 'left';
		},
		set: (pos: 'left' | 'center' | 'right') => setFramePosition(pos),
	});

	function setFramePosition(pos: 'left' | 'center' | 'right') {
		const ctk = ctkFor(props.traitSetID);
		const f = normalizedFrameBase();
		if (pos === 'center' || pos === 'right') {
			f.position = pos;
		} else {
			delete f.position;
		}
		ctk.frame = f as any;
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	const hasPortraitOrArray = computed(
		() =>
			portraitFrameShape.value !== 'none' ||
			Boolean(frameImageUrl.value) ||
			traitArrayMode.value !== 'none' ||
			styleBody.value === 'portrait-ring',
	);

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
		const ctk = ctkFor(props.traitSetID);
		const frameObj = normalizedFrameBase();
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
		ctk.frame = frameObj as any;
		updateCharacter(structuredClone(toRaw(props.character)));
	}

	function resetRingPlacement() {
		const ctk = ctkFor(props.traitSetID);
		const frameObj = normalizedFrameBase();
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
		ctk.frame = frameObj as any;
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
			if (ctk.frame && typeof ctk.frame === 'object' && ctk.frame.image && key === 'url') {
				if (value) ctk.frame.image.url = value;
				else delete ctk.frame.image.url;
			}
			if (key === 'url') {
				props.character.portrait ??= { url: '', alt: '', tags: [] };
				props.character.portrait.alt ??= '';
				props.character.portrait.tags ??= [];
				props.character.portrait.url = value;
			} else if (key === 'alignment') {
				props.character.portrait ??= { url: '', alt: '', tags: [] };
				props.character.portrait.alt ??= '';
				props.character.portrait.tags ??= [];
				ensureView(props.character.portrait).alignment = value;
			} else if (key === 'zoom') {
				props.character.portrait ??= { url: '', alt: '', tags: [] };
				props.character.portrait.alt ??= '';
				props.character.portrait.tags ??= [];
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

	function getDieDisplayValue(value: any, isFilled = false) {
		return characterCurioFunctions.renderDieconSVG(value, isFilled, '', getView(props.character)?.diceConfig);
	}

	function updateCharacter(character?: any) {
		emit('updateCharacter', character);
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
		portraitTags,
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
