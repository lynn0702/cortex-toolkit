import { computed, toRaw, type ComputedRef } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import { buildParts, formatPct, parsePct, KNOWN_PARTS } from './sheet-grid.ts';
import { ensureView, getView, resolveRating, type Character, type Trait, type TraitSet } from './model.ts';
import { resolveFrame } from './frame-geometry.ts';

export type PartCellRecord = {
	left: string;
	top: number;
	width: string;
	height: number;
	marker?: string;
	ratingType?: string;
	range?: number[];
};

export type PartCellEdit = { key: string; left: number; width: number; top: number; height: number };

export const FLEX_BODIES = ['pips', 'subtrait-columns', 'die-rows', 'dice-count'] as const;
const NON_ROW_BODIES = ['pips'] as const;

// Pure branch-share normalization shared by the editor miniature and the
// subtrait-columns renderer: finite numbers >= 0 win, else the CSS
// defaults (1.4 / 1 / 1.4). Null when no branch object is stored.
export function resolveBranchShares(branch: unknown): { left: number; center: number; right: number } | null {
	const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback);
	if (!branch || typeof branch !== 'object' || Array.isArray(branch)) return null;
	const r = branch as Record<string, unknown>;
	return { left: num(r.left, 1.4), center: num(r.center, 1), right: num(r.right, 1.4) };
}

export interface UseTraitSetPartsDeps {
	character: ComputedRef<Character>;
	traitSet: ComputedRef<TraitSet | null>;
	styleBody: ComputedRef<string>;
	getRatingLadder: () => number[];
	toggleTrackPart: () => void;
	partsHaveTrack: () => boolean;
	currentPartRatingPlacement: () => 'inline' | 'above' | 'below' | 'none';
	rebuildParts: (rating: 'inline' | 'above' | 'below' | 'none', track?: boolean) => void;
	updateCharacter: (character?: Character) => void;
}

export function useTraitSetParts(deps: UseTraitSetPartsDeps) {
	const {
		character,
		traitSet,
		styleBody,
		getRatingLadder,
		toggleTrackPart,
		partsHaveTrack,
		currentPartRatingPlacement,
		rebuildParts,
		updateCharacter,
	} = deps;

	function partsSpec() {
		const view = getView(traitSet.value) || {};
		const scale = Array.isArray(view.ratingLadder) && view.ratingLadder.length ? view.ratingLadder : [4, 6, 8, 10, 12];
		const traits: Trait[] = Array.isArray(traitSet.value?.traits)
			? traitSet.value.traits
			: traitSet.value?.traits
				? Object.values(traitSet.value.traits as Record<string, Trait>)
				: [];
		const configuredTrack = typeof view.labels?.track === 'string' ? view.labels.track.trim().toLowerCase() : '';
		const hasImplicitTrackSub = Boolean(
			!view.parts &&
			configuredTrack &&
			traits.some(
				(t) =>
					Array.isArray(t?.traits) &&
					t.traits.some(
						(st) =>
							st &&
							typeof st === 'object' &&
							String(st.noun || st.name || '')
								.trim()
								.toLowerCase() === configuredTrack &&
							resolveRating(st, [t, traitSet.value])?.type === 'Die',
					),
			),
		);
		const trackOn = partsHaveTrack() || hasImplicitTrackSub;
		const tScale = characterCurioFunctions.getTrackScale(traitSet.value);
		const rating = currentPartRatingPlacement();
		const statement = Boolean((traitSet.value as { statement?: unknown } | null)?.statement);
		const hasDesc = traits.some((t) => typeof t?.description === 'string' && t.description.trim().length > 0);
		const hasSfx = traits.some((t) => characterCurioFunctions.blockChildren(t, traitSet.value).length > 0);
		const hasSub = traits.some((t) =>
			characterCurioFunctions.ratedSubtraits(t, traitSet.value).some((st) => {
				const key = String(st?.noun || st?.name || '')
					.trim()
					.toLowerCase();
				if (trackOn && configuredTrack && key === configuredTrack) return false;
				const r = resolveRating(st, [t, traitSet.value]);
				if (r?.type === 'Pip' && (!Array.isArray(r.value) || r.value.length <= 1)) return false;
				return true;
			}),
		);
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
		rawParts: Record<string, PartCellRecord> | null | undefined,
	): Record<string, PartCellRecord> {
		const spec = partsSpec();
		const base: Record<string, PartCellRecord> =
			rawParts && typeof rawParts === 'object' && !Array.isArray(rawParts)
				? (structuredClone(toRaw(rawParts)) as Record<string, PartCellRecord>)
				: (buildParts(spec) as Record<string, PartCellRecord>);
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
		let pipChildNoun = '';
		for (const t of traits) {
			if (!Array.isArray(t?.traits)) continue;
			const match = t.traits.find((sub) => {
				const r = resolveRating(sub, [t, traitSet.value]);
				return r?.type === 'Pip' && (!Array.isArray(r.value) || r.value.length <= 1);
			});
			if (match) {
				pipChildNoun = String(match.noun || match.name || 'Pip').trim() || 'Pip';
				break;
			}
		}
		const hasExistingChildPart = Object.keys(base).some((k) => k.startsWith('child:') || k.startsWith('child_'));
		if (
			pipChildNoun &&
			base.name &&
			base.rating &&
			Number(base.name.top || 0) === 0 &&
			Number(base.rating.top || 0) === 0 &&
			!hasExistingChildPart
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
			base[`child:${pipChildNoun}:rating`] = { left: '40%', top: 0, width: '10%', height: 1 };
			base.rating = { ...base.rating, left: '50%', top: 0, width: '50%', height: 1 };
			base[`child:${pipChildNoun}:label`] = { left: '0%', top: nextTop, width: '100%', height: 1 };
		}
		return base;
	}

	const partCells = computed((): PartCellEdit[] => {
		const rawParts = getView(traitSet.value)?.parts;
		if (!rawParts || typeof rawParts !== 'object') return [];
		const parts = normalizeEffectiveParts(rawParts as Record<string, PartCellRecord>);
		const out: PartCellEdit[] = [];
		const orderedKeys = [
			...(KNOWN_PARTS as readonly string[]),
			...Object.keys(parts).filter((k) => !(KNOWN_PARTS as readonly string[]).includes(k)),
		];
		for (const key of orderedKeys) {
			const cell = parts[key];
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

	const hasParts = computed(() => {
		const parts = getView(traitSet.value)?.parts;
		return Boolean(parts && typeof parts === 'object' && Object.keys(parts).length);
	});

	function isPartsDriven() {
		const body = getView(traitSet.value)?.style?.body;
		if (typeof body === 'string' && (FLEX_BODIES as readonly string[]).includes(body)) return false;
		if (body === 'image') {
			const hasTraits = Boolean(traitSet.value?.traits?.length) || Number(getView(traitSet.value)?.reservedSlots) > 0;
			return hasTraits || hasParts.value;
		}
		return true;
	}

	function isRowBody() {
		const body = getView(traitSet.value)?.style?.body;
		if (typeof body === 'string' && (NON_ROW_BODIES as readonly string[]).includes(body)) return false;
		return true;
	}

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
			const cell = gen[key];
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

	const isPartsPreview = computed(() => partCells.value.length === 0 && effectivePartCells.value.length > 0);

	const hasCustomParts = computed(() => {
		const parts = getView(traitSet.value)?.parts;
		if (!parts || typeof parts !== 'object' || Array.isArray(parts)) return false;
		if (
			styleBody.value === 'image' &&
			!traitSet.value?.traits?.length &&
			!(Number(getView(traitSet.value)?.reservedSlots) > 0)
		) {
			return Object.keys(parts).length > 0;
		}
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

	function editablePartCells(seedEmptyOnBlankImage = false): Record<string, PartCellRecord> {
		const blankImage = seedEmptyOnBlankImage && styleBody.value === 'image' && !isPartsDriven();
		const view = ensureView(traitSet.value);
		view.parts = blankImage ? {} : normalizeEffectiveParts(view.parts as Record<string, PartCellRecord> | undefined);
		return view.parts as Record<string, PartCellRecord>;
	}

	function setPartCell(key: string, field: 'left' | 'width' | 'top' | 'height', val: number) {
		const cells = editablePartCells();
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
		updateCharacter(character.value);
	}

	function removePartCell(key: string) {
		const view = ensureView(traitSet.value);
		const cells = editablePartCells();
		if (!cells[key]) return;
		delete cells[key];
		if (styleBody.value === 'image' && Object.keys(cells).length === 0) {
			delete (view as Record<string, unknown>).parts;
		}
		updateCharacter(character.value);
	}

	const activePartKeys = computed(() => new Set(effectivePartCells.value.map((c) => c.key)));

	function togglePartCell(partKey: string) {
		if (!traitSet.value) return;
		if (partKey === 'track') {
			toggleTrackPart();
			return;
		}
		const view = ensureView(traitSet.value);
		const cells = editablePartCells(true);
		if (cells[partKey]) {
			if (Object.keys(cells).length <= 1) {
				if (styleBody.value === 'image') {
					delete (view as Record<string, unknown>).parts;
					updateCharacter(character.value);
				}
				return;
			}
			delete cells[partKey];
			updateCharacter(character.value);
			return;
		}
		const maxTop = Object.values(cells).reduce((m: number, c) => Math.max(m, Number(c?.top) || 0), -1);
		if (partKey === 'rating' && cells.name && Number(cells.name.top || 0) === 0 && parsePct(cells.name.width) === 100) {
			cells.name.width = '65%';
			cells.rating = {
				left: '65%',
				top: 0,
				width: '35%',
				height: 1,
				ratingType: 'Die',
				range: getRatingLadder(),
			};
		} else {
			const cell: PartCellRecord = { left: '0%', top: maxTop + 1, width: '100%', height: 1 };
			if (partKey === 'name' || partKey === 'badge') {
				cell.marker = 'L';
			} else if (partKey === 'description' || partKey === 'block') {
				cell.marker = 'T';
			} else if (partKey === 'rating') {
				cell.ratingType = 'Die';
				cell.range = getRatingLadder();
			}
			cells[partKey] = cell;
		}
		updateCharacter(character.value);
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
		const rawParts = getView(traitSet.value)?.parts as Record<string, PartCellRecord> | undefined;
		const cell = rawParts?.[key];
		if (cell?.marker === 'L' || cell?.marker === 'T') return cell.marker;
		return key === 'description' || key === 'block' || key.startsWith('child:') ? 'T' : 'L';
	}

	function setPartMarker(key: string, marker: 'L' | 'T') {
		if (!traitSet.value || !key) return;
		const cells = editablePartCells();
		if (!cells[key]) return;
		cells[key].marker = marker;
		updateCharacter(character.value);
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
		const cells = editablePartCells(true);
		const nextTop = Object.values(cells).reduce((m: number, c) => Math.max(m, Number(c?.top) || 0), -1) + 1;
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
			for (const tr of traitSet.value.traits) {
				if (!tr || typeof tr !== 'object') continue;
				if (!Array.isArray(tr.traits)) tr.traits = [];
				const hasMatch = tr.traits.some(
					(st) =>
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
					const defaultRating: Trait['rating'] =
						ratingType === 'Pip'
							? { type: 'Pip', value: [false] }
							: ratingType === 'Counter'
								? { type: 'Counter', value: [0] }
								: { type: 'Die', value: [8], range: getRatingLadder() };
					tr.traits.push({ name: '', noun, rating: defaultRating });
				}
			}
		}
		updateCharacter(character.value);
	}

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
		updateCharacter(character.value);
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
		const emptyImageSet =
			body === 'image' && !traitSet.value?.traits?.length && !(Number(getView(traitSet.value)?.reservedSlots) > 0);
		if (emptyImageSet || (typeof body === 'string' && (FLEX_BODIES as readonly string[]).includes(body))) {
			if (view && typeof view === 'object') {
				delete (view as Record<string, unknown>).parts;
				updateCharacter(character.value);
			}
			return;
		}
		if (isRingFrame() && partsHaveTrack()) {
			rebuildParts('below');
			return;
		}
		rebuildParts(currentPartRatingPlacement());
		const refreshed = ensureView(traitSet.value);
		refreshed.parts = normalizeEffectiveParts(refreshed.parts as Record<string, PartCellRecord> | undefined);
		updateCharacter(character.value);
	}

	return {
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
	};
}
