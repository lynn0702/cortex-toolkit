import { computed, ref, type ComputedRef } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import {
	applyTypeScopedRange,
	ensureView,
	getView,
	hasOutRange,
	isOutDie,
	isRated,
	keepsExtraDice,
	rangeTop,
	ratingDice,
	resolveHitches,
	resolvePpDelta,
	resolveRange,
	resolveRating,
	setRatingDice,
	setRatingDie,
	type Character,
	type Trait,
	type TraitSet,
} from './model.ts';

export const RATING_TYPES = ['Die', 'Dice', 'Counter', 'Pip'] as const;
export type TraitRatingKind = (typeof RATING_TYPES)[number];

export interface UseTraitRatingDeps {
	character: ComputedRef<Character>;
	traitSet: ComputedRef<TraitSet | undefined>;
	trait: ComputedRef<Trait | undefined>;
	ancestorFallbacks: ComputedRef<Array<Trait | TraitSet | undefined>>;
	isSubtraitMode: ComputedRef<boolean>;
	isSetSubtraitMode: ComputedRef<boolean>;
	syncCompanionSubtraits: (prevName?: string) => void;
	updateCharacter: (character: Character) => void;
}

export function useTraitRating(deps: UseTraitRatingDeps) {
	const {
		character,
		traitSet,
		trait,
		ancestorFallbacks,
		isSubtraitMode,
		isSetSubtraitMode,
		syncCompanionSubtraits,
		updateCharacter,
	} = deps;

	const isLabeledPipsSet = computed(() => {
		if (isSubtraitMode.value) return false;
		const v = getView(traitSet.value);
		return v?.style?.body === 'pips' && v?.pips?.labels === true;
	});

	const pipRowChecked = computed({
		get() {
			const rating = resolveRating(trait.value, ancestorFallbacks.value);
			if (rating && rating.type === 'Pip' && Array.isArray(rating.value) && rating.value.length) {
				return rating.value[0] === true;
			}
			return false;
		},
		set(val: boolean) {
			const t = trait.value;
			if (!t) return;
			t.rating = { type: 'Pip', value: [Boolean(val)] };
			updateCharacter(character.value);
		},
	});

	const dice = computed(() =>
		trait.value ? characterCurioFunctions.getTraitDice(trait.value, ancestorFallbacks.value) : [],
	);

	function firstDieOf(node: unknown) {
		return ratingDice(resolveRating(node, ancestorFallbacks.value))[0] || 0;
	}

	function isDieActiveOf(node: unknown, size: number) {
		return firstDieOf(node) === size;
	}

	const availableValues = computed(() =>
		traitSet.value ? characterCurioFunctions.getTraitSetRatings(traitSet.value) : [],
	);

	// Effective ladder: own range -> set rating range -> set ratingLadder -> base.
	const dieRange = computed(() => resolveRange(trait.value, ancestorFallbacks.value));

	// True when the trait states no Die/Dice range of its own and inherits.
	const isRangeInherited = computed(() => {
		const resolved = resolveRating(trait.value, ancestorFallbacks.value);
		const ownRange = trait.value?.rating?.range;
		return (
			!resolved ||
			(resolved.type !== 'Die' && resolved.type !== 'Dice') ||
			!Array.isArray(ownRange) ||
			ownRange.length === 0
		);
	});

	// Rated is the gate: a trait is rated iff it carries a rating.
	const isRatedTrait = computed(() => isRated(trait.value, ancestorFallbacks.value));

	const confirmRatingChange = ref<TraitRatingKind | null>(null);

	function addRating() {
		if (!trait.value) return;
		const scale = availableValues.value;
		const size = Array.isArray(scale) && scale.length ? scale[0] : 8;
		setRatingDie(trait.value, size, Array.isArray(scale) && scale.length ? [...scale] : undefined);
		updateCharacter(character.value);
	}

	function clearRating() {
		const t = trait.value;
		if (!t) return;
		confirmRatingChange.value = null;
		delete t.rating;
		delete t.pool;
		if (t.isOut) t.isOut = false;
		updateCharacter(character.value);
	}

	const ratingType = computed(() => resolveRating(trait.value, ancestorFallbacks.value)?.type ?? null);

	const isSteppedTrackSet = computed(() => getView(traitSet.value)?.style?.body === 'die-track');

	const isOut = computed(() => isOutDie(trait.value, ancestorFallbacks.value));

	const outLabel = computed(() => {
		const labels = getView(traitSet.value)?.labels;
		if (labels && typeof labels.out === 'string') return labels.out;
		const endWord = getView(traitSet.value)?.endWord;
		if (typeof endWord === 'string') return endWord;
		return 'OUT';
	});

	// Out is a range option for Die/Dice ratings, defaulted off.
	const ratingHasOut = computed({
		get() {
			const r = resolveRating(trait.value, ancestorFallbacks.value);
			if (!r || (r.type !== 'Die' && r.type !== 'Dice')) return false;
			return hasOutRange(trait.value, ancestorFallbacks.value);
		},
		set(value: boolean) {
			const t = trait.value;
			if (!t) return;
			const resolved = resolveRating(t, ancestorFallbacks.value);
			if (!resolved || (resolved.type !== 'Die' && resolved.type !== 'Dice')) return;
			if (!t.rating || typeof t.rating !== 'object') {
				t.rating = {
					type: resolved.type,
					value: Array.isArray(resolved.value) ? [...resolved.value] : [],
				};
			}
			const r = t.rating as unknown as Record<string, unknown>;
			if (value) {
				if (!hasOutRange(undefined, ancestorFallbacks.value)) {
					r.out = true;
				}
			} else {
				delete r.out;
				if (!isSubtraitMode.value && traitSet.value && getView(traitSet.value)?.outIndicator === true) {
					ensureView(traitSet.value).outIndicator = false;
				}
				if (isOutDie(t, ancestorFallbacks.value) || t.isOut) {
					t.isOut = false;
					const fallbackDie = dieRange.value[0] || 8;
					setRatingDie(t, fallbackDie);
				}
			}
			if (isSetSubtraitMode.value) {
				syncCompanionSubtraits(t.noun || t.name);
			}
			updateCharacter(character.value);
		},
	});

	const shouldShowTrackOut = computed(() => isSteppedTrackSet.value || ratingHasOut.value);

	function requestRatingType(type: TraitRatingKind) {
		const t = trait.value;
		if (!t) return;
		const cur = resolveRating(t, ancestorFallbacks.value);
		if (cur?.type === type) return;
		const hasChildValues =
			Array.isArray(t.traits) &&
			t.traits.some(
				(ct) =>
					resolveRating(ct, [t, ...ancestorFallbacks.value]) !== undefined ||
					(Array.isArray(ct?.traits) && ct.traits.length > 0),
			);
		if (hasChildValues) {
			confirmRatingChange.value = type;
		} else {
			setRatingType(type);
		}
	}

	function setRatingType(type: TraitRatingKind) {
		confirmRatingChange.value = null;
		const t = trait.value;
		if (!t) return;
		const cur = resolveRating(t, ancestorFallbacks.value);
		if (cur?.type === type) return;
		if (Array.isArray(t.traits)) {
			t.traits.forEach((ct) => {
				if (ct && typeof ct === 'object' && ct.rating) {
					ct.rating.value = [];
				}
			});
		}
		const scale = availableValues.value;
		const size = Array.isArray(scale) && scale.length ? scale[0] : 8;
		const ownPrevRange = cur && Array.isArray(cur.range) && cur.range.length ? [...cur.range] : undefined;
		if ((cur?.type === 'Die' || cur?.type === 'Dice') && (type === 'Die' || type === 'Dice')) {
			const prevDice = cur && !isOut.value ? ratingDice(cur) : [];
			const list = prevDice.length ? prevDice : [size];
			if (type === 'Die') {
				t.isOut = false;
				delete t.pool;
				setRatingDie(t, list[0], ownPrevRange);
			} else {
				t.isOut = false;
				t.rating = {
					type: 'Dice',
					value: list,
					...(ownPrevRange ? { range: ownPrevRange } : {}),
					...(cur && (cur as { out?: unknown }).out === true ? { out: true } : {}),
				} as Trait['rating'];
				t.pool = true;
			}
		} else if (type === 'Die') {
			delete t.rating;
			delete t.pool;
			t.isOut = false;
			setRatingDie(t, size);
		} else if (type === 'Dice') {
			t.isOut = false;
			t.rating = { type: 'Dice', value: [size] };
			t.pool = true;
		} else if (type === 'Counter') {
			delete t.pool;
			t.isOut = false;
			t.rating = { type: 'Counter', value: [0], range: [0, 20] };
		} else {
			delete t.pool;
			t.isOut = false;
			t.rating = { type: 'Pip', value: [false] };
		}
		if (isSetSubtraitMode.value) {
			syncCompanionSubtraits(t.noun || t.name);
		}
		updateCharacter(character.value);
	}

	// Counter inputs: a number field with its [min, max] range.
	function counterBounds(): [number, number] {
		const r = resolveRating(trait.value, ancestorFallbacks.value);
		if (r && r.type === 'Counter') {
			const nums = (r.range || []).filter((n): n is number => typeof n === 'number');
			if (nums.length >= 2) {
				const lo = nums[0],
					hi = nums[1];
				return lo <= hi ? [lo, hi] : [hi, lo];
			}
		}
		return [0, 20];
	}

	const counterNumber = computed({
		get() {
			const r = resolveRating(trait.value, ancestorFallbacks.value);
			if (r && r.type === 'Counter' && typeof r.value[0] === 'number') return r.value[0];
			return 0;
		},
		set(val: number | string) {
			const t = trait.value;
			if (!t) return;
			const [lo, hi] = counterBounds();
			let n = Math.floor(Number(val));
			if (!Number.isFinite(n)) n = lo;
			n = Math.max(lo, Math.min(hi, n));
			t.rating = { type: 'Counter', value: [n], range: [lo, hi] };
			updateCharacter(character.value);
		},
	});

	function setCounterBound(which: 0 | 1, val: number | string) {
		const t = trait.value;
		if (!t) return;
		let [lo, hi] = counterBounds();
		const n = Math.floor(Number(val));
		if (!Number.isFinite(n)) return;
		if (which === 0) {
			lo = n;
			if (lo > hi) hi = lo;
		} else {
			hi = n;
			if (hi < lo) lo = hi;
		}
		const resolved = resolveRating(t, ancestorFallbacks.value);
		const cur = typeof resolved?.value[0] === 'number' ? (resolved.value[0] as number) : lo;
		t.rating = { type: 'Counter', value: [Math.max(lo, Math.min(hi, cur))], range: [lo, hi] };
		if (isSetSubtraitMode.value) {
			syncCompanionSubtraits(t.noun || t.name);
		} else if (traitSet.value) {
			applyTypeScopedRange(traitSet.value, trait.value);
		}
		updateCharacter(character.value);
	}

	function commitCounterBound(which: 0 | 1, event: Event) {
		const el = event && (event.target as HTMLInputElement | null);
		setCounterBound(which, el ? el.value : NaN);
		if (el && document.activeElement === el) el.blur();
	}

	function commitPipBubbleCount(event: Event) {
		const el = event && (event.target as HTMLInputElement | null);
		setPipBubbleCount(el ? Number(el.value) : NaN);
		if (el && document.activeElement === el) el.blur();
	}

	// Pip inputs: a bubble row; a track is a list of bubbles.
	const pipBubbleCount = computed(() => {
		const r = resolveRating(trait.value, ancestorFallbacks.value);
		if (!r || r.type !== 'Pip') return 0;
		if (Array.isArray(r.range) && r.range[0]) return r.range[0];
		const setR = traitSet.value?.rating;
		const inheritedSetCount =
			setR?.type === 'Pip'
				? Array.isArray(setR.range) && setR.range[0]
					? Number(setR.range[0])
					: Array.isArray(setR.value)
						? setR.value.length
						: 0
				: 0;
		if (trait.value?.rating?.type === 'Pip') {
			return r.value.length || inheritedSetCount || 1;
		}
		return inheritedSetCount || r.value.length || 1;
	});

	function pipBubbleAt(index: number): boolean {
		const r = resolveRating(trait.value, ancestorFallbacks.value);
		return Boolean(r && r.type === 'Pip' && r.value[index] === true);
	}

	function togglePipBubble(index: number) {
		const t = trait.value;
		if (!t) return;
		const n = Math.max(pipBubbleCount.value, index + 1);
		const cur = resolveRating(t, ancestorFallbacks.value);
		const list: boolean[] = [];
		for (let i = 0; i < n; i++) {
			list.push(Boolean(cur && cur.type === 'Pip' && cur.value[i] === true));
		}
		list[index] = !list[index];
		t.rating = { type: 'Pip', value: list };
		updateCharacter(character.value);
	}

	function setPipBubbleCount(count: number) {
		const t = trait.value;
		if (!t) return;
		const n = Math.max(1, Math.min(100, Math.floor(Number(count)) || 1));
		const cur = resolveRating(t, ancestorFallbacks.value);
		const list: boolean[] = [];
		for (let i = 0; i < n; i++) {
			list.push(Boolean(cur && cur.type === 'Pip' && cur.value[i] === true));
		}
		t.rating = { type: 'Pip', value: list };
		updateCharacter(character.value);
	}

	function setTraitRange(scale: number[]) {
		const t = trait.value;
		if (!t) return;
		const rating = resolveRating(t, ancestorFallbacks.value);
		if (!rating) return;
		t.rating = {
			type: rating.type,
			value: [...rating.value],
			range: [...scale],
			...((rating as { out?: unknown }).out === true ? { out: true } : {}),
		} as Trait['rating'];
		if (isSetSubtraitMode.value) {
			syncCompanionSubtraits(t.noun || t.name);
		} else if (traitSet.value) {
			applyTypeScopedRange(traitSet.value, trait.value);
		}
		updateCharacter(character.value);
	}

	function isRangeIncluded(size: number) {
		return dieRange.value.includes(size);
	}

	function toggleRangeOption(size: number) {
		const base = [...dieRange.value];
		const idx = base.indexOf(size);
		if (idx !== -1) base.splice(idx, 1);
		else base.push(size);
		base.sort((a, b) => a - b);
		setTraitRange(base);
	}

	const traitPool = computed({
		get() {
			const t = trait.value;
			if (t && typeof t.pool === 'boolean') return t.pool;
			return Boolean(!isSubtraitMode.value && traitSet.value && traitSet.value.pool === true);
		},
		set(val: boolean) {
			const t = trait.value;
			if (!t) return;
			const next = Boolean(val);
			t.pool = next;
			if (next) {
				const cur = resolveRating(t, ancestorFallbacks.value);
				if (!cur || cur.type !== 'Dice') {
					const scale = availableValues.value;
					const defaultSize = Array.isArray(scale) && scale.length ? scale[0] : 8;
					const prevDice = cur && !isOut.value ? ratingDice(cur) : [];
					const ownPrevRange =
						cur && (cur.type === 'Die' || cur.type === 'Dice') && Array.isArray(cur.range) && cur.range.length
							? [...cur.range]
							: undefined;
					t.isOut = false;
					t.rating = {
						type: 'Dice',
						value: prevDice.length ? prevDice : [defaultSize],
						...(ownPrevRange ? { range: ownPrevRange } : {}),
						...(cur && (cur as { out?: unknown }).out === true ? { out: true } : {}),
					} as Trait['rating'];
				}
			}
			updateCharacter(character.value);
		},
	});

	const traitSpendable = computed({
		get() {
			const t = trait.value;
			return t && typeof t.spendable === 'boolean' ? t.spendable : false;
		},
		set(val: boolean) {
			if (!trait.value) return;
			trait.value.spendable = Boolean(val);
			updateCharacter(character.value);
		},
	});

	const inheritedHitches = computed(() => resolveHitches(undefined, [trait.value, traitSet.value]));

	const traitHitches = computed({
		get() {
			const t = trait.value;
			return t && typeof t.hitches === 'number' ? t.hitches : inheritedHitches.value;
		},
		set(val: number | string | null | undefined) {
			if (!trait.value) return;
			const n = Number(val);
			trait.value.hitches = Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
			updateCharacter(character.value);
		},
	});

	const hitchesDiffers = computed(() => {
		const t = trait.value;
		return t && typeof t.hitches === 'number' && t.hitches !== resolveHitches(undefined, [traitSet.value]);
	});

	const traitKeepsExtra = computed({
		get() {
			return keepsExtraDice(trait.value);
		},
		set(val: number) {
			const t = trait.value;
			if (!t) return;
			const n = Math.max(0, Math.min(4, Math.floor(Number(val) || 0)));
			if (n > 0) t.keepsExtra = n;
			else delete t.keepsExtra;
			updateCharacter(character.value);
		},
	});

	const traitPpDelta = computed({
		get() {
			return resolvePpDelta(trait.value);
		},
		set(val: number) {
			const t = trait.value;
			if (!t) return;
			const n = Math.max(-5, Math.min(5, Math.trunc(Number(val) || 0)));
			if (n !== 0) t.ppDelta = n;
			else delete t.ppDelta;
			updateCharacter(character.value);
		},
	});

	function getDieCount(size: number) {
		return dice.value.filter((d: number) => d === size).length;
	}

	function syncPoolCount(count: number) {
		if (getView(traitSet.value)?.style?.body === 'dice-count') {
			ensureView(trait.value).poolCount = count;
		}
	}

	function addDieToTrait(size: number) {
		if (!trait.value) return;
		const current = [...dice.value, size].sort((a, b) => b - a);
		characterCurioFunctions.setTraitDice(trait.value, current);
		if (trait.value.rating && typeof trait.value.rating === 'object') {
			trait.value.rating.type = 'Dice';
		}
		syncPoolCount(current.length);
		updateCharacter(character.value);
	}

	function removeDieFromTrait(size: number) {
		if (!trait.value) return;
		const current = [...dice.value];
		const idx = current.indexOf(size);
		if (idx !== -1) {
			current.splice(idx, 1);
			characterCurioFunctions.setTraitDice(trait.value, current);
			if (current.length > 0 && trait.value.rating && typeof trait.value.rating === 'object') {
				trait.value.rating.type = 'Dice';
			}
			const viewBag = getView(trait.value);
			if (viewBag && Array.isArray(viewBag.spentDice)) {
				viewBag.spentDice = viewBag.spentDice
					.filter((i: number) => i !== idx)
					.map((i: number) => (i > idx ? i - 1 : i));
				if (!viewBag.spentDice.length) delete viewBag.spentDice;
			}
			syncPoolCount(current.length);
			updateCharacter(character.value);
		}
	}

	function removeDieAtIndex(index: number) {
		if (!trait.value) return;
		const current = [...dice.value];
		if (index >= 0 && index < current.length) {
			current.splice(index, 1);
			characterCurioFunctions.setTraitDice(trait.value, current);
			if (current.length > 0 && trait.value.rating && typeof trait.value.rating === 'object') {
				trait.value.rating.type = 'Dice';
			}
			const viewBag = getView(trait.value);
			if (viewBag && Array.isArray(viewBag.spentDice)) {
				viewBag.spentDice = viewBag.spentDice
					.filter((i: number) => i !== index)
					.map((i: number) => (i > index ? i - 1 : i));
				if (!viewBag.spentDice.length) delete viewBag.spentDice;
			}
			syncPoolCount(current.length);
			updateCharacter(character.value);
		}
	}

	function stepDownDieAtIndex(index: number) {
		if (!trait.value) return;
		const current = [...dice.value];
		if (index >= 0 && index < current.length) {
			const currentSize = current[index];
			const sizes = [12, 10, 8, 6, 4];
			const sIdx = sizes.indexOf(currentSize);
			if (sIdx !== -1 && sIdx < sizes.length - 1) {
				current[index] = sizes[sIdx + 1];
			} else {
				current.splice(index, 1);
			}
			current.sort((a, b) => b - a);
			characterCurioFunctions.setTraitDice(trait.value, current);
			updateCharacter(character.value);
		}
	}

	function toggleTraitValue(val: number) {
		const t = trait.value;
		if (!t) return;
		const cur = ratingDice(resolveRating(t, ancestorFallbacks.value))[0] || 0;
		if (val === cur && !isOut.value) {
			t.isOut = false;
			characterCurioFunctions.setTraitDice(t, []);
		} else {
			t.isOut = false;
			characterCurioFunctions.setTraitDice(t, [val]);
		}
		updateCharacter(character.value);
	}

	function toggleOutValue() {
		const t = trait.value;
		if (!t) return;
		if (isOut.value) {
			t.isOut = false;
			characterCurioFunctions.setTraitDice(t, []);
		} else {
			t.isOut = true;
			setRatingDie(t, rangeTop(t, ancestorFallbacks.value) + 2);
			const r = t.rating as Record<string, unknown> | null | undefined;
			if (r && typeof r === 'object' && (r.type === 'Die' || r.type === 'Dice')) r.out = true;
		}
		updateCharacter(character.value);
	}

	function getDieStepPrev(currentSize: number, range: number[] = dieRange.value): number | null {
		if (!range.length) return null;
		const idx = range.indexOf(currentSize);
		if (idx !== -1) return idx > 0 ? range[idx - 1] : null;
		const smaller = range.filter((s) => s < currentSize);
		return smaller.at(-1) ?? null;
	}

	function getDieStepNext(currentSize: number, range: number[] = dieRange.value): number | null {
		if (!range.length) return null;
		const idx = range.indexOf(currentSize);
		if (idx !== -1) return idx < range.length - 1 ? range[idx + 1] : null;
		const larger = range.filter((s) => s > currentSize);
		return larger.length ? larger[0] : null;
	}

	const singleDieStepPrev = computed<number | null>(() => {
		if (isOut.value) return rangeTop(trait.value, ancestorFallbacks.value);
		return getDieStepPrev(firstDieOf(trait.value));
	});

	const singleDieStepNext = computed<number | 'out' | null>(() => {
		if (isOut.value) return null;
		const next = getDieStepNext(firstDieOf(trait.value));
		if (next !== null) return next;
		if (shouldShowTrackOut.value && firstDieOf(trait.value) > 0) {
			return 'out';
		}
		return null;
	});

	function stepSingleDieDown() {
		const prev = singleDieStepPrev.value;
		if (prev !== null && trait.value) {
			const t = trait.value;
			t.isOut = false;
			setRatingDie(t, prev);
			updateCharacter(character.value);
		}
	}

	function stepSingleDieUp() {
		const next = singleDieStepNext.value;
		if (next !== null && trait.value) {
			const t = trait.value;
			if (next === 'out') {
				t.isOut = true;
				setRatingDie(t, rangeTop(t, ancestorFallbacks.value) + 2);
			} else {
				t.isOut = false;
				setRatingDie(t, next);
			}
			updateCharacter(character.value);
		}
	}

	function stepDownDieAtIndexAlongRange(index: number) {
		const current = [...dice.value];
		if (index >= 0 && index < current.length && trait.value) {
			const curSize = current[index];
			const prev = getDieStepPrev(curSize);
			if (prev !== null) {
				current[index] = prev;
				setRatingDice(trait.value, current);
				syncPoolCount(current.length);
				updateCharacter(character.value);
			}
		}
	}

	function stepUpDieAtIndexAlongRange(index: number) {
		const current = [...dice.value];
		if (index >= 0 && index < current.length && trait.value) {
			const curSize = current[index];
			const next = getDieStepNext(curSize);
			if (next !== null) {
				current[index] = next;
				setRatingDice(trait.value, current);
				syncPoolCount(current.length);
				updateCharacter(character.value);
			}
		}
	}

	function stepCounterDown() {
		const [lo] = counterBounds();
		if (counterNumber.value > lo) {
			counterNumber.value = counterNumber.value - 1;
		}
	}

	function stepCounterUp() {
		const [, hi] = counterBounds();
		if (counterNumber.value < hi) {
			counterNumber.value = counterNumber.value + 1;
		}
	}

	const isCustomTraitRange = computed(() => {
		if (isRangeInherited.value) return false;
		const r = trait.value?.rating?.range;
		if (!Array.isArray(r)) return false;
		if (ratingType.value === 'Counter') {
			return !(r.length === 2 && r[0] === 0 && r[1] === 20);
		}
		const std = [4, 6, 8, 10, 12];
		return !(r.length === std.length && r.every((v: number, i: number) => v === std[i]));
	});

	return {
		RATING_TYPES,
		isLabeledPipsSet,
		pipRowChecked,
		dice,
		firstDieOf,
		isDieActiveOf,
		availableValues,
		dieRange,
		isRangeInherited,
		isRatedTrait,
		confirmRatingChange,
		addRating,
		clearRating,
		ratingType,
		isSteppedTrackSet,
		isOut,
		outLabel,
		ratingHasOut,
		shouldShowTrackOut,
		requestRatingType,
		setRatingType,
		counterBounds,
		counterNumber,
		setCounterBound,
		commitCounterBound,
		commitPipBubbleCount,
		pipBubbleCount,
		pipBubbleAt,
		togglePipBubble,
		setPipBubbleCount,
		setTraitRange,
		isRangeIncluded,
		toggleRangeOption,
		traitPool,
		traitSpendable,
		inheritedHitches,
		traitHitches,
		hitchesDiffers,
		traitKeepsExtra,
		traitPpDelta,
		getDieCount,
		syncPoolCount,
		addDieToTrait,
		removeDieFromTrait,
		removeDieAtIndex,
		stepDownDieAtIndex,
		toggleTraitValue,
		toggleOutValue,
		getDieStepPrev,
		getDieStepNext,
		singleDieStepPrev,
		singleDieStepNext,
		stepSingleDieDown,
		stepSingleDieUp,
		stepDownDieAtIndexAlongRange,
		stepUpDieAtIndexAlongRange,
		stepCounterDown,
		stepCounterUp,
		isCustomTraitRange,
	};
}
