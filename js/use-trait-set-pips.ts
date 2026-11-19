import type { ComputedRef } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import {
	ensureView,
	getRating,
	getView,
	resolvePpDelta,
	type Character,
	type Rating,
	type Trait,
	type TraitSet,
} from './model.ts';

export interface UseTraitSetPipsDeps {
	character: ComputedRef<Character>;
	traitSet: ComputedRef<TraitSet>;
	traitSets: ComputedRef<TraitSet[]>;
	submode: ComputedRef<string | null | undefined>;
	printBlank: ComputedRef<boolean | undefined>;
	resolveTraitRating: (node: unknown, extra?: Array<unknown>) => Rating | undefined;
	getParts: (traitSetArg: TraitSet) => Record<string, unknown> | null | undefined;
	partsGridFor: (traitSetArg: TraitSet) => { cells?: Record<string, unknown> } | null;
	getPipChild: (node: unknown) => Trait | undefined;
	selectElement: (selector: Array<string | number | null | undefined>) => void;
	updateCharacter: (character: Character) => void;
}

export function useTraitSetPips(deps: UseTraitSetPipsDeps) {
	const {
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
	} = deps;

	function getPipConfig(traitSetArg: TraitSet) {
		const ctk = getView(traitSetArg);
		const p = ctk?.pips && typeof ctk.pips === 'object' ? ctk.pips : undefined;
		const perRow = p?.perRow ?? 5;
		const connected = p?.connected !== false;
		return {
			perRow: Math.max(1, perRow),
			connected,
			labels: p?.labels === true,
		};
	}

	function getPipTrack(traitSetArg: TraitSet): { count: number; filled: number } {
		const rating = getRating(traitSetArg);
		let count = 5;
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

	function setPipTrack(traitSetIndex: number, count: number, filled: number) {
		const ts = traitSets.value[traitSetIndex];
		if (!ts) return;
		const bubbles: boolean[] = [];
		for (let i = 0; i < count; i++) bubbles.push(i < filled);
		ts.rating = { type: 'Pip', value: bubbles };
		updateCharacter(character.value);
	}

	function isPipFilled(traitSetArg: TraitSet, pipIdx: number) {
		if (printBlank.value) return false;
		return pipIdx < getPipTrack(traitSetArg).filled;
	}

	function handlePipClick(traitSetIndex: number, pipIdx: number) {
		if (submode.value === 'print') return;
		const ts = traitSets.value[traitSetIndex];
		if (!ts) return;
		const track = getPipTrack(ts);
		const curFilled = track.filled;
		const next = curFilled === pipIdx + 1 ? pipIdx : pipIdx + 1;
		setPipTrack(traitSetIndex, track.count, next);
	}

	function isPipLabels(traitSetArg: TraitSet) {
		return getPipConfig(traitSetArg).labels === true;
	}

	function pipRowFilled(t: unknown, index: number, filledCount: number): boolean {
		if (t && typeof t === 'object') {
			const rating = resolveTraitRating(t);
			if (rating && rating.type === 'Pip' && Array.isArray(rating.value) && rating.value.length) {
				return rating.value[0] === true;
			}
		}
		return !printBlank.value && index < filledCount;
	}

	function pipRows(traitSetArg: TraitSet) {
		const track = getPipTrack(traitSetArg);
		const traits = Array.isArray(traitSetArg?.traits) ? traitSetArg.traits : [];
		const n = Math.max(track.count, traits.length);
		const rows: { index: number; trait: Trait | null; filled: boolean; name: string }[] = [];
		for (let i = 0; i < n; i++) {
			const t = traits[i];
			const named = t && typeof t === 'object' && typeof t.name === 'string' && t.name.length ? t : null;
			rows.push({
				index: i,
				trait: named,
				filled: pipRowFilled(t, i, track.filled),
				name: named ? named.name || '' : '',
			});
		}
		return rows;
	}

	function resolvePipBubbleCount(
		trait: Trait | undefined,
		r: { value: Array<number | boolean>; range?: number[] },
	): number {
		if (Array.isArray(r.range) && r.range[0]) return r.range[0];
		const setR = getRating(traitSet.value);
		const inheritedSetCount =
			setR?.type === 'Pip' ? (Array.isArray(setR.range) && setR.range[0] ? setR.range[0] : setR.value.length) : 0;
		if (getRating(trait)?.type === 'Pip') {
			return r.value.length || inheritedSetCount || 5;
		}
		return inheritedSetCount || r.value.length || 1;
	}

	function getTraitPipBubbles(trait: Trait | undefined): boolean[] {
		const r = resolveTraitRating(trait);
		if (r && r.type === 'Pip' && Array.isArray(r.value)) {
			const count = resolvePipBubbleCount(trait, r);
			const bubbles: boolean[] = [];
			for (let i = 0; i < count; i++) bubbles.push(Boolean(r.value[i] === true));
			return bubbles;
		}
		return [];
	}

	function toggleTraitPipBubble(trait: Trait | undefined, pipIndex: number) {
		if (submode.value === 'print' || !trait) return;
		const r = resolveTraitRating(trait);
		if (!r || r.type !== 'Pip') return;
		const count = resolvePipBubbleCount(trait, r);
		const bubbles: boolean[] = [];
		for (let i = 0; i < count; i++) bubbles.push(Boolean(r.value[i] === true));
		bubbles[pipIndex] = !bubbles[pipIndex];
		const hasExplicitType = getRating(trait)?.type === 'Pip';
		trait.rating = {
			...(hasExplicitType ? { type: 'Pip' as const } : {}),
			value: bubbles,
			...(Array.isArray(r.range) && r.range.length ? { range: [...r.range] } : {}),
		} as Trait['rating'];
		updateCharacter(character.value);
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

	function pipChildNouns(traitSetArg?: TraitSet): Set<string> {
		const nouns = new Set<string>(['pip']);
		const vLabel = getView(traitSetArg)?.labels?.pip;
		if (typeof vLabel === 'string' && vLabel.trim()) nouns.add(vLabel.trim().toLowerCase());
		const checkList = Array.isArray(traitSetArg?.traits) ? traitSetArg.traits : [];
		for (const t of checkList) {
			const child = getPipChild(t);
			if (!child) continue;
			if (typeof child.noun === 'string' && child.noun.trim()) nouns.add(child.noun.trim().toLowerCase());
			if (typeof child.name === 'string' && child.name.trim()) nouns.add(child.name.trim().toLowerCase());
		}
		return nouns;
	}

	function isPipChildPart(partKey: string, traitSetArg?: TraitSet): boolean {
		const n = parseChildPartKey(partKey).noun.toLowerCase();
		return pipChildNouns(traitSetArg || traitSet.value).has(n);
	}

	function hasChildPartCell(traitSetArg: TraitSet, noun: string, kind?: 'label' | 'rating'): boolean {
		const grid = partsGridFor(traitSetArg);
		if (!grid?.cells) return false;
		const n = noun.toLowerCase();
		const pipNouns = n === 'pip' ? pipChildNouns(traitSetArg) : null;
		return Object.keys(grid.cells).some((k) => {
			const parsed = parseChildPartKey(k);
			const cellNoun = parsed.noun.toLowerCase();
			if (cellNoun !== n && !(pipNouns && pipNouns.has(cellNoun))) return false;
			if (kind && parsed.kind !== kind) return false;
			return true;
		});
	}

	function getChildTraitByNoun(trait: Trait | undefined, noun: string): Trait | undefined {
		if (!trait || !Array.isArray(trait.traits)) return undefined;
		const n = noun.trim().toLowerCase();
		const matches = trait.traits.filter((t: Trait) => {
			if (!t || typeof t !== 'object') return false;
			const tNoun = typeof t.noun === 'string' ? t.noun.trim().toLowerCase() : '';
			const tName = typeof t.name === 'string' ? t.name.trim().toLowerCase() : '';
			return tNoun === n || tName === n;
		});
		if (matches.length) {
			return matches.find((e: Trait) => resolvePpDelta(e) <= 0 && !getView(e)?.altRoll) || matches[0];
		}
		const blocks = characterCurioFunctions.blockChildren(trait, traitSet.value);
		return blocks.find((e) => resolvePpDelta(e) <= 0 && !getView(e)?.altRoll);
	}

	function blankPipTrait(): Trait {
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
		if (submode.value === 'print') return;
		const ts = traitSets.value[traitSetIndex];
		if (!ts) return;
		if (!isPipLabels(ts)) return handlePipClick(traitSetIndex, itemIndex);
		const trait = ensurePipTrait(traitSetIndex, itemIndex);
		if (!trait) return;
		const next = !pipRowFilled(trait, itemIndex, 0);
		trait.rating = { type: 'Pip', value: [next] };
		updateCharacter(character.value);
	}

	function openPipRow(traitSetIndex: number, itemIndex: number) {
		if (submode.value === 'print') return;
		ensurePipTrait(traitSetIndex, itemIndex);
		updateCharacter(character.value);
		selectElement(['trait', traitSetIndex, itemIndex]);
	}

	function setPipRowName(traitSetIndex: number, itemIndex: number, name: string) {
		if (submode.value === 'print') return;
		const trait = ensurePipTrait(traitSetIndex, itemIndex);
		if (!trait) return;
		const clean = typeof name === 'string' ? name.trim() : '';
		if (trait.name === clean) return;
		trait.name = clean;
		updateCharacter(character.value);
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
		updateCharacter(character.value);
	}

	return {
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
	};
}
