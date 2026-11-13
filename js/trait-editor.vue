<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, onUpdated, ref, toRaw, watch } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import {
	getView,
	ensureView,
	getRating,
	resolveRating,
	ratingDice,
	setRatingDie,
	setRatingDice,
	isRated,
	resolveHitches,
	resolveRange,
	resolveVisibility,
	nextVisibility,
	DIE_LADDER,
	rangeTop,
	isOutDie,
	applyTypeScopedRange,
	resolveSubtraitNoun,
	resolveSubtraitPlural,
	type Character,
} from './model.ts';
import { buildParts } from './sheet-grid.ts';
import TagEditor from './tag-editor.vue';
import VisibilityEye from './visibility-eye.vue';
import ColorPicker from './color-picker.vue';
import { getCharacterColorTokens } from './color-palette.ts';

const props = defineProps<{
	character: Character;
	traitSetID: number;
	traitID: number;
	subtraitID?: number;
	traitPath?: number[];
	isSetSubtrait?: boolean;
	open: boolean;
	submode?: string | null;
	viewY?: number | null;
}>();

const emit = defineEmits<{
	(e: 'selectElement', selector: any[]): void;
	(e: 'updateCharacter', character: Character): void;
	(e: 'removeTrait', traitSetID: number, traitID: number): void;
}>();

const instance = getCurrentInstance();
const rootTemplates = () => (instance?.proxy as any)?.$root?.sheetTemplates ?? null;

const rootEl = ref<HTMLElement | null>(null);
const inputName = ref<HTMLInputElement | null>(null);

const scrollPosition = ref('none');
const anchorPosition = ref('top');
const confirmDelete = ref(false);
const nameBeforeEdit = ref('');

const traitSet = computed(() => props.character?.traitSets?.[props.traitSetID]);
const badgeColorTokens = computed(() => getCharacterColorTokens(props.character, 'badge'));

const resolvedPath = computed<number[]>(() => {
	if (Array.isArray(props.traitPath) && props.traitPath.length > 0) {
		return props.traitPath
			.slice(0, 3)
			.map((n) => Number(n))
			.filter((n) => Number.isFinite(n) && n >= 0);
	}
	if (typeof props.subtraitID === 'number' && props.subtraitID >= 0) {
		return [props.traitID, props.subtraitID];
	}
	return [props.traitID];
});

const depth = computed(() => resolvedPath.value.length);

const isSubtraitMode = computed(() => depth.value >= 2);

const isSetSubtraitMode = computed(() => Boolean(props.isSetSubtrait && depth.value >= 2));

const canCreateSubtrait = computed(() => depth.value < 3);

const traitChain = computed<any[]>(() => {
	if (!traitSet.value || !Array.isArray(traitSet.value.traits)) return [];
	const chain: any[] = [];
	let list: any[] | undefined = traitSet.value.traits;
	for (const idx of resolvedPath.value) {
		if (!Array.isArray(list) || !list[idx]) return [];
		const node: any = list[idx];
		chain.push(node);
		list = node.traits;
	}
	return chain;
});

const parentTrait = computed(() => traitChain.value[0] ?? null);

const parentNode = computed(() =>
	traitChain.value.length >= 2 ? traitChain.value[traitChain.value.length - 2] : traitSet.value,
);

const trait = computed<any>(() =>
	traitChain.value.length > 0 ? traitChain.value[traitChain.value.length - 1] : undefined,
);

const ancestorFallbacks = computed(() => [...traitChain.value.slice(0, -1).reverse(), traitSet.value]);

const isPlay = computed(() => props.submode === 'play');
const canDeleteInPlay = computed(() => characterCurioFunctions.isPlayMutableSet(traitSet.value));

const templateEntry = computed(() => characterCurioFunctions.resolveTemplateFor(props.character, rootTemplates()));

const templateTraitMatched = computed(
	() => !isSubtraitMode.value && templateHasTrait(trait.value ? trait.value.name : ''),
);

const renameWarning = computed(() =>
	Boolean(
		!isSubtraitMode.value &&
		nameBeforeEdit.value &&
		nameBeforeEdit.value !== name.value &&
		templateHasTrait(nameBeforeEdit.value),
	),
);

const identityLabel = computed(() => {
	if (isSetSubtraitMode.value) return 'Noun';
	if (isLabeledPipsSet.value) return 'Label';
	return 'Trait Name';
});

const subtraitNoun = computed({
	get() {
		return resolveSubtraitNoun(trait.value);
	},
	set(val: string) {
		const target = trait.value as Record<string, any> | undefined;
		if (!target) return;
		const prev = resolveSubtraitNoun(target);
		target.noun = val;
		ensureView(target).noun = val;
		if (!target.name || target.name.trim().toLowerCase() === prev.toLowerCase()) {
			target.name = val;
		}
		syncCompanionSubtraits(prev);
		updateCharacter(props.character);
	},
});

const subtraitPlural = computed({
	get() {
		return resolveSubtraitPlural(trait.value);
	},
	set(val: string) {
		const target = trait.value as Record<string, any> | undefined;
		if (!target) return;
		target.plural = val;
		ensureView(target).plural = val;
		const traits = Array.isArray(traitSet.value?.traits) ? traitSet.value.traits : [];
		const path = resolvedPath.value;
		traits.forEach((tr: any) => {
			if (!tr || typeof tr !== 'object' || tr === parentTrait.value) return;
			if (typeof path[1] === 'number' && tr.traits?.[path[1]]) {
				const sibling = tr.traits[path[1]];
				sibling.plural = val;
				ensureView(sibling).plural = val;
			}
		});
		updateCharacter(props.character);
	},
});

const name = computed({
	get() {
		if (isSetSubtraitMode.value) {
			return resolveSubtraitNoun(trait.value);
		}
		return trait.value?.name ?? '';
	},
	set(val: string) {
		if (isSetSubtraitMode.value) {
			subtraitNoun.value = val;
			return;
		}
		setProperty('name', val);
		if (isThreeColumnTable.value) {
			const entries = characterCurioFunctions.sfxChildren(trait.value);
			const sfx = entries.find((e: any) => String(e.name || '').toLowerCase() !== 'hinder');
			if (sfx && typeof sfx === 'object') {
				sfx.name = val;
			}
		}
	},
});

const isListStyle = computed(() => {
	if (isSubtraitMode.value) return false;
	const b = getView(traitSet.value)?.style?.body;
	const parts = getView(traitSet.value)?.parts;
	return b === 'list' || Boolean(parts && !parts.rating);
});

const hasSfxChildren = computed(
	() =>
		Array.isArray(characterCurioFunctions.sfxChildren(trait.value)) &&
		characterCurioFunctions.sfxChildren(trait.value).length > 0,
);

const counterLabel = computed(() => traitSet.value?.counterLabel || getView(traitSet.value)?.counterLabel || 'XP');

const counterValue = computed({
	get() {
		return trait.value?.counter ?? trait.value?.xp ?? trait.value?.custom?.counter ?? trait.value?.custom?.xp ?? '';
	},
	set(val: any) {
		if (!trait.value) return;
		trait.value.counter = val;
		delete trait.value.xp;
		if (trait.value.custom) {
			delete trait.value.custom.counter;
			delete trait.value.custom.xp;
		}
		updateCharacter(props.character);
	},
});

const isLabeledPipsSet = computed(() => {
	if (isSubtraitMode.value) return false;
	const v = getView(traitSet.value);
	return v?.style?.body === 'pips' && (v as any)?.pips?.labels === true;
});

const pipRowChecked = computed({
	get() {
		const rating = resolveRating(trait.value, ancestorFallbacks.value);
		if (rating && rating.type === 'Pip' && Array.isArray(rating.value) && rating.value.length) {
			return rating.value[0] === true;
		}
		return false;
	},
	set(val: any) {
		const t = trait.value as unknown as Record<string, any>;
		t.rating = { type: 'Pip', value: [Boolean(val)] };
		updateCharacter(props.character);
	},
});

const dice = computed(() => characterCurioFunctions.getTraitDice(trait.value, ancestorFallbacks.value));

function firstDieOf(node: any) {
	return ratingDice(resolveRating(node, ancestorFallbacks.value))[0] || 0;
}

function isDieActiveOf(node: any, size: number) {
	return firstDieOf(node) === size;
}

// Rated is the gate: a trait is rated iff it carries a rating. Where it
// has none, the editor offers to add one; the Rating control and its
// range editor render directly beneath.
const isRatedTrait = computed(() => isRated(trait.value, ancestorFallbacks.value));

function addRating() {
	if (!trait.value) return;
	const scale = availableValues.value;
	const size = Array.isArray(scale) && scale.length ? scale[0] : 8;
	setRatingDie(
		trait.value as unknown as Record<string, any>,
		size,
		Array.isArray(scale) && scale.length ? [...scale] : undefined,
	);
	updateCharacter(props.character);
}

// Rating type control: Die | Dice | Counter | Pip. Die<->Dice preserves
// the dice (one becomes a one-item list, a list's first item becomes the
// single die); every other change starts from that type's default. The
// switch itself is explicit, so nothing is silently discarded.
const RATING_TYPES = ['Die', 'Dice', 'Counter', 'Pip'] as const;

const ratingType = computed(() => resolveRating(trait.value, ancestorFallbacks.value)?.type ?? null);

// Out is a range option for Die/Dice ratings, defaulted off. Surgical:
// setting true opts the range in, false drops the key.
const ratingHasOut = computed({
	get() {
		const r = resolveRating(trait.value, ancestorFallbacks.value);
		return !!r && (r.type === 'Die' || r.type === 'Dice') && (r as any).out === true;
	},
	set(value: boolean) {
		const t = trait.value as unknown as Record<string, any>;
		const r = t && t.rating;
		const resolved = resolveRating(t, ancestorFallbacks.value);
		if (!r || typeof r !== 'object' || !resolved || (resolved.type !== 'Die' && resolved.type !== 'Dice')) return;
		if (value) {
			r.out = true;
		} else {
			delete r.out;
			if (t.isOut) {
				t.isOut = false;
				characterCurioFunctions.setTraitDice(trait.value, []);
			}
		}
		if (isSetSubtraitMode.value) {
			syncCompanionSubtraits(t.noun || t.name);
		}
		updateCharacter(props.character);
	},
});

const confirmRatingChange = ref<'Counter' | 'Die' | 'Dice' | 'Pip' | null>(null);

function requestRatingType(type: 'Counter' | 'Die' | 'Dice' | 'Pip') {
	const t = trait.value as unknown as Record<string, any>;
	if (!t) return;
	const cur = resolveRating(t, ancestorFallbacks.value);
	if (cur?.type === type) return;
	const hasChildValues =
		Array.isArray(t.traits) &&
		t.traits.some(
			(ct: any) =>
				resolveRating(ct, [t, ...ancestorFallbacks.value]) !== undefined ||
				(Array.isArray(ct?.traits) && ct.traits.length > 0),
		);
	if (hasChildValues) {
		confirmRatingChange.value = type;
	} else {
		setRatingType(type);
	}
}

function setRatingType(type: 'Counter' | 'Die' | 'Dice' | 'Pip') {
	confirmRatingChange.value = null;
	const t = trait.value as unknown as Record<string, any>;
	if (!t) return;
	const cur = resolveRating(t, ancestorFallbacks.value);
	if (cur?.type === type) return;
	if (Array.isArray(t.traits)) {
		t.traits.forEach((ct: any) => {
			if (ct && typeof ct === 'object' && ct.rating) {
				ct.rating.value = [];
			}
		});
	}
	const scale = availableValues.value;
	const size = Array.isArray(scale) && scale.length ? scale[0] : 8;
	// Own range only: an inherited ladder must not be stamped back onto
	// the trait when its rating shape changes.
	const ownPrevRange = cur && Array.isArray(cur.range) && cur.range.length ? [...cur.range] : undefined;
	if ((cur?.type === 'Die' || cur?.type === 'Dice') && (type === 'Die' || type === 'Dice')) {
		const dice = cur ? ratingDice(cur) : [];
		const list = dice.length ? dice : [size];
		if (type === 'Die') setRatingDie(t, list[0], ownPrevRange);
		else
			t.rating = {
				type: 'Dice',
				value: list,
				...(ownPrevRange ? { range: ownPrevRange } : {}),
				...(cur && (cur as any).out === true ? { out: true } : {}),
			};
	} else if (type === 'Die') {
		setRatingDie(t, size);
	} else if (type === 'Dice') {
		t.rating = { type: 'Dice', value: [size] };
	} else if (type === 'Counter') {
		t.rating = { type: 'Counter', value: [0], range: [0, 20] };
	} else {
		t.rating = { type: 'Pip', value: [false] };
	}
	if (isSetSubtraitMode.value) {
		syncCompanionSubtraits(t.noun || t.name);
	}
	updateCharacter(props.character);
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
	set(val: any) {
		const t = trait.value as unknown as Record<string, any>;
		if (!t) return;
		const [lo, hi] = counterBounds();
		let n = Math.floor(Number(val));
		if (!Number.isFinite(n)) n = lo;
		n = Math.max(lo, Math.min(hi, n));
		t.rating = { type: 'Counter', value: [n], range: [lo, hi] };
		updateCharacter(props.character);
	},
});

function setCounterBound(which: 0 | 1, val: any) {
	const t = trait.value as unknown as Record<string, any>;
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
	updateCharacter(props.character);
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
	return r.value.length;
});

function pipBubbleAt(index: number): boolean {
	const r = resolveRating(trait.value, ancestorFallbacks.value);
	return Boolean(r && r.type === 'Pip' && r.value[index] === true);
}

function togglePipBubble(index: number) {
	const t = trait.value as unknown as Record<string, any>;
	if (!t) return;
	const n = Math.max(pipBubbleCount.value, index + 1);
	const cur = resolveRating(t, ancestorFallbacks.value);
	const list: boolean[] = [];
	for (let i = 0; i < n; i++) {
		list.push(Boolean(cur && cur.type === 'Pip' && cur.value[i] === true));
	}
	list[index] = !list[index];
	t.rating = { type: 'Pip', value: list };
	updateCharacter(props.character);
}

function setPipBubbleCount(count: number) {
	const t = trait.value as unknown as Record<string, any>;
	if (!t) return;
	const n = Math.max(1, Math.min(100, Math.floor(Number(count)) || 1));
	const cur = resolveRating(t, ancestorFallbacks.value);
	const list: boolean[] = [];
	for (let i = 0; i < n; i++) {
		list.push(Boolean(cur && cur.type === 'Pip' && cur.value[i] === true));
	}
	t.rating = { type: 'Pip', value: list };
	updateCharacter(props.character);
}

function setTraitRange(scale: number[]) {
	const t = trait.value as unknown as Record<string, any>;
	const rating = resolveRating(t, ancestorFallbacks.value);
	if (!rating) return;
	t.rating = {
		type: rating.type,
		value: [...rating.value],
		range: [...scale],
		...((rating as any).out === true ? { out: true } : {}),
	};
	if (isSetSubtraitMode.value) {
		syncCompanionSubtraits(t.noun || t.name);
	} else if (traitSet.value) {
		// One set-level write: the edited ladder becomes the set's, and
		// the trait stops restating it.
		applyTypeScopedRange(traitSet.value, trait.value);
	}
	updateCharacter(props.character);
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

// Options render only what the shape makes meaningful: Pool and
// Spendable require a rating; hitches shows against the inherited value.
const traitPool = computed({
	get() {
		const t = trait.value as unknown as Record<string, unknown> | undefined;
		return t && typeof t.pool === 'boolean' ? t.pool : false;
	},
	set(val: any) {
		if (!trait.value) return;
		(trait.value as unknown as Record<string, any>).pool = Boolean(val);
		updateCharacter(props.character);
	},
});

const traitSpendable = computed({
	get() {
		const t = trait.value as unknown as Record<string, unknown> | undefined;
		return t && typeof t.spendable === 'boolean' ? t.spendable : false;
	},
	set(val: any) {
		if (!trait.value) return;
		(trait.value as unknown as Record<string, any>).spendable = Boolean(val);
		updateCharacter(props.character);
	},
});

const editableOnSheet = computed({
	get() {
		return Boolean(getView(trait.value)?.editableOnSheet ?? getView(traitSet.value)?.editableOnSheet);
	},
	set(val: boolean) {
		const v = ensureView(trait.value);
		if (val) v.editableOnSheet = true;
		else delete v.editableOnSheet;
		if (isSetSubtraitMode.value) {
			const traits = Array.isArray(traitSet.value?.traits) ? traitSet.value.traits : [];
			const path = resolvedPath.value;
			traits.forEach((tr: any) => {
				if (!tr || typeof tr !== 'object') return;
				if (typeof path[1] === 'number' && tr.traits?.[path[1]]) {
					const sv = ensureView(tr.traits[path[1]]);
					if (val) sv.editableOnSheet = true;
					else delete sv.editableOnSheet;
				}
			});
		}
		updateCharacter(props.character);
	},
});

const inheritedHitches = computed(() => resolveHitches(undefined, [trait.value, traitSet.value]));

const traitHitches = computed({
	get() {
		const t = trait.value as unknown as Record<string, unknown> | undefined;
		return t && typeof t.hitches === 'number' ? t.hitches : inheritedHitches.value;
	},
	set(val: any) {
		if (!trait.value) return;
		const n = Number(val);
		(trait.value as unknown as Record<string, any>).hitches = Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
		updateCharacter(props.character);
	},
});

const hitchesDiffers = computed(() => {
	const t = trait.value as unknown as Record<string, unknown> | undefined;
	return t && typeof t.hitches === 'number' && t.hitches !== resolveHitches(undefined, [traitSet.value]);
});

const isNameSet = computed(() => characterCurioFunctions.isNameSet(traitSet.value));

// A trait's own label field. Rendered by name sets; stored sparsely
// (absent unless customized).
const traitLabel = computed({
	get() {
		const v = trait.value?.label;
		return typeof v === 'string' ? v : '';
	},
	set(val: any) {
		if (!trait.value) return;
		if (typeof val === 'string' && val.trim().length) trait.value.label = val.trim();
		else delete trait.value.label;
		updateCharacter(props.character);
	},
});

// Trait visibility (shown | editor-only | hidden): a general trait
// capability, not a name-set special case.
const traitVisibility = computed({
	get() {
		return resolveVisibility(trait.value);
	},
	set(val: any) {
		if (!trait.value) return;
		const v = ensureView(trait.value) as Record<string, unknown>;
		if (val === 'shown') {
			delete v.visibility;
		} else {
			v.visibility = val;
		}
		updateCharacter(props.character);
	},
});

const description = computed({
	get() {
		return trait.value?.description ?? '';
	},
	set(val: string) {
		setProperty('description', val);
	},
});

const traitTags = computed<string[]>({
	get() {
		return Array.isArray(trait.value?.tags) ? trait.value.tags : [];
	},
	set(val: string[]) {
		setProperty('tags', val);
	},
});

// Child subtraits on the current node (`trait.traits[]`). Every child trait
// (companion track, pip child, specialty, SFX, or nested child) is surfaced
// as a drill-in row that opens this same TraitEditor at `depth + 1`.
const childSubtraits = computed(() => {
	const subs = trait.value?.traits;
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
		const r = resolveRating(sub, [trait.value, ...ancestorFallbacks.value]);
		const label = (isSetSubtraitMode.value ? sub.noun || sub.name : sub.name || sub.noun) || 'Subtrait';
		const summary = r?.type
			? r.type
			: Array.isArray(sub.traits) && sub.traits.length
				? `${sub.traits.length}`
				: 'Unrated';
		result.push({ sub, idx, label: String(label).trim() || 'Subtrait', summary });
	});
	return result;
});

const scrollable = computed(() => Boolean(childSubtraits.value.length > 0));

const isThreeColumnTable = computed(() => {
	if (isSubtraitMode.value) return false;
	const parts = getView(traitSet.value)?.parts;
	return Boolean(parts && (parts['child:SFX'] || (parts as any)['child_sfx']));
});

const tableCol1Label = computed(() => {
	const labels = getView(traitSet.value)?.labels;
	if (labels && labels.col1) return labels.col1;
	return characterCurioFunctions.labelDefaultForStyle('three-column-table', 'col1') || 'TALENT';
});

const tableCol2Label = computed(() => {
	const labels = getView(traitSet.value)?.labels;
	if (labels && labels.col2) return labels.col2;
	return characterCurioFunctions.labelDefaultForStyle('three-column-table', 'col2') || 'ACTIVATION';
});

const tableCol3Label = computed(() => {
	const labels = getView(traitSet.value)?.labels;
	if (labels && labels.col3) return labels.col3;
	return characterCurioFunctions.labelDefaultForStyle('three-column-table', 'col3') || 'EFFECT';
});

const tableCol3Text = computed({
	get() {
		const entries = characterCurioFunctions.sfxChildren(trait.value);
		const sfx = entries.find((e: any) => String(e.name || '').toLowerCase() !== 'hinder');
		if (!sfx) return '';
		return sfx.description || sfx.name || '';
	},
	set(val: string) {
		const container = characterCurioFunctions.ensureSfxContainer(trait.value);
		if (!container || !Array.isArray(container.traits)) return;
		const idx = container.traits.findIndex((e: any) => String(e.name || '').toLowerCase() !== 'hinder');
		if (idx === -1) {
			container.traits.push({
				name: trait.value.name || '',
				description: val,
				tags: [],
				custom: {},
			});
		} else {
			container.traits[idx].description = val;
			container.traits[idx].name = trait.value.name || '';
		}
		updateCharacter(props.character);
	},
});

const isRingSet = computed(() => {
	const body = getView(traitSet.value)?.style?.body;
	return body === 'portrait-ring';
});

const isScaleDie = computed({
	get() {
		return Boolean(
			(trait.value && typeof (trait.value as any).keepsExtra === 'number' && (trait.value as any).keepsExtra > 0) ||
			(trait.value?.name && trait.value.name.trim().toLowerCase() === 'scale'),
		);
	},
	set(val: any) {
		if (!trait.value) return;
		const t = trait.value as unknown as Record<string, any>;
		if (val) {
			// Scale remains a trait name; its effect is keepsExtra.
			t.keepsExtra = 1;
		} else {
			delete t.keepsExtra;
		}
		if (
			val &&
			(!t.name ||
				t.name === 'New ' + (traitSet.value?.noun || 'Trait') ||
				t.name === 'New trait' ||
				t.name === 'New Attribute')
		) {
			setProperty('name', 'Scale');
		}
		updateCharacter(props.character);
	},
});

const isSteppedTrackSet = computed(() => getView(traitSet.value)?.style?.body === 'die-track');

const shouldShowTrackOut = computed(() => {
	return isSteppedTrackSet.value || ratingHasOut.value;
});

const isOut = computed(() => isOutDie(trait.value, ancestorFallbacks.value));

const outLabel = computed(() => {
	const labels = getView(traitSet.value)?.labels;
	if (labels && typeof labels.out === 'string' && labels.out.length) return labels.out;
	return 'OUT';
});

const availableValues = computed(() => characterCurioFunctions.getTraitSetRatings(traitSet.value));

const cssClass = computed(() => {
	const cls: Record<string, boolean> = {
		editor: true,
		open: props.open,
		scrollable: scrollable.value,
	};
	cls['anchor-position-' + anchorPosition.value] = true;
	if (parentIsFullWidth.value) {
		cls['dock-' + editorDock.value] = true;
	}
	if (scrollable.value) {
		cls['scroll-position-' + scrollPosition.value] = true;
	}
	return cls;
});

const parentIsBranch = computed(() => getView(traitSet.value)?.style?.body === 'subtrait-columns');

const branchRole = computed({
	get() {
		return getView(trait.value)?.branchRole === 'specialty' ? 'specialty' : 'skill';
	},
	set(val: any) {
		ensureView(trait.value).branchRole = val === 'specialty' ? 'specialty' : 'skill';
		if (val !== 'specialty') {
			ensureView(trait.value).linkTo = undefined;
		}
		updateCharacter(props.character);
	},
});

const branchParentOptions = computed(() => {
	const traits = traitSet.value?.traits || [];
	const fallbackNoun = traitSet.value?.noun || 'Trait';
	const opts: any[] = [];
	traits.forEach((tr: any, idx: number) => {
		if (idx === props.traitID) return;
		if (getView(tr)?.branchRole === 'specialty') return;
		opts.push({ index: idx, name: tr?.name?.length ? tr.name : fallbackNoun + ' ' + (idx + 1) });
	});
	return opts;
});

const branchLink = computed({
	get() {
		const v = getView(trait.value)?.linkTo;
		return typeof v === 'number' ? v : null;
	},
	set(val: any) {
		ensureView(trait.value).linkTo = val === null || val === undefined || val === '' ? undefined : Number(val);
		updateCharacter(props.character);
	},
});

const branchSide = computed({
	get() {
		return getView(trait.value)?.branchSide === 'left' ? 'left' : 'right';
	},
	set(val: any) {
		ensureView(trait.value).branchSide = val === 'left' ? 'left' : 'right';
		updateCharacter(props.character);
	},
});

// The set-level die is the set node's own Rating; unrated traits fall
// through to it per the layer rules.
const setRating = computed(() => {
	const dice = ratingDice(getRating(traitSet.value));
	return dice.length ? dice[0] : null;
});

const hideUnratedSetDie = computed(() =>
	Boolean(
		!isSubtraitMode.value &&
		parentIsBranch.value &&
		branchRole.value !== 'specialty' &&
		setRating.value &&
		!isRated(trait.value, ancestorFallbacks.value),
	),
);

const parentIsFullWidth = computed(() => {
	const place = getView(traitSet.value)?.place;
	if (!place || typeof place !== 'object') return true;
	const raw = (place as { width?: unknown }).width;
	const w = typeof raw === 'string' ? Number(raw.replace(/%/g, '')) : Number(raw);
	return !Number.isFinite(w) || w >= 99.9;
});

const editorDock = computed({
	get() {
		return getView(traitSet.value)?.editorDock === 'right' ? 'right' : 'left';
	},
	set(val: any) {
		ensureView(traitSet.value).editorDock = val === 'right' ? 'right' : 'left';
		updateCharacter(props.character);
	},
});

watch(
	() => props.traitID,
	() => {
		confirmDelete.value = false;
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
let currentShiftY = 0;
let currentArrowShiftY = 0;

watch(
	() => props.open,
	(isOpen, wasOpen) => {
		confirmDelete.value = false;
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
				if (currentShiftY !== 0) {
					rootEl.value.style.setProperty('--editor-shift-y', '0px');
					currentShiftY = 0;
				}
				if (currentArrowShiftY !== 0) {
					rootEl.value.style.setProperty('--arrow-shift-y', '0px');
					currentArrowShiftY = 0;
				}
			}
		}
	},
);

onMounted(() => {
	checkAnchorPosition();
	checkScrollPosition();
	window.addEventListener('resize', checkAnchorPosition);

	if (props.open) {
		focusFirstInput();
	}
});

onUnmounted(() => {
	window.removeEventListener('resize', checkAnchorPosition);
});

onUpdated(() => {
	if (props.open) {
		checkAnchorPosition();
	}
});

function selectElement(selector: any[]) {
	emit('selectElement', selector);
}

async function focusFirstInput() {
	await nextTick();
	if (inputName.value) {
		inputName.value.focus({ preventScroll: true });
	}
}

function targetValue(e: Event) {
	return (e?.target as HTMLInputElement)?.value ?? '';
}

function syncCompanionSubtraits(prevName?: string) {
	if (!isSetSubtraitMode.value || !traitSet.value || !trait.value) return;
	const src = trait.value as any;
	const targetNoun = resolveSubtraitNoun(src);
	const targetPlural = resolveSubtraitPlural(src);
	const prevLower = String(prevName ?? targetNoun)
		.trim()
		.toLowerCase();
	const path = resolvedPath.value;
	const traits = Array.isArray(traitSet.value.traits) ? traitSet.value.traits : [];
	traits.forEach((tr: any) => {
		if (!tr || typeof tr !== 'object' || tr === parentTrait.value) return;
		if (!Array.isArray(tr.traits)) tr.traits = [];
		let sibling = tr.traits.find(
			(st: any) =>
				st &&
				typeof st === 'object' &&
				(String(st.name || '')
					.trim()
					.toLowerCase() === prevLower ||
					String(st.noun || '')
						.trim()
						.toLowerCase() === prevLower),
		);
		if (!sibling && typeof path[1] === 'number' && tr.traits[path[1]]) {
			sibling = tr.traits[path[1]];
		}
		if (depth.value === 3 && sibling && typeof path[2] === 'number') {
			if (!Array.isArray(sibling.traits)) sibling.traits = [];
			sibling = sibling.traits[path[2]];
		}
		if (sibling && typeof sibling === 'object') {
			sibling.noun = targetNoun;
			sibling.plural = targetPlural;
			ensureView(sibling).noun = targetNoun;
			ensureView(sibling).plural = targetPlural;
			if (!sibling.name || sibling.name.trim().toLowerCase() === prevLower) {
				sibling.name = targetNoun;
			}
			if (src.rating) {
				sibling.rating = structuredClone(toRaw(src.rating));
			}
		}
	});
	const trackTarget = characterCurioFunctions.getTrackLabel(traitSet.value).toLowerCase();
	if (targetNoun.toLowerCase() === trackTarget) {
		const view = ensureView(traitSet.value);
		const body = view.style?.body;
		if (body !== 'portrait-ring' && body !== 'image' && body !== 'pips' && body !== 'die-track') {
			const existingParts = view.parts && typeof view.parts === 'object' ? view.parts : null;
			if (!existingParts || !(existingParts as any).track) {
				const frameShape = typeof view.frame === 'string' ? view.frame : view.frame?.shape;
				view.parts = buildParts({
					rating: frameShape === 'ring' ? 'below' : 'inline',
					ratingDice: characterCurioFunctions.getTraitSetRatings(traitSet.value).length || 5,
					trackDice: Array.isArray(src.rating?.range) && src.rating.range.length ? src.rating.range.length : 5,
					description: Boolean((view.features as any)?.description),
					block: false,
					subtraits: false,
				});
			}
		}
	}
}

function setProperty(key: string, val: any) {
	const character = props.character;
	const target = trait.value as Record<string, any> | undefined;
	if (!target) return;
	const prevName = target.name;
	target[key] = val;
	if (isSetSubtraitMode.value && key === 'name') {
		target.noun = val;
		syncCompanionSubtraits(prevName);
	}
	updateCharacter(character);
}

function badgeValue(key: string): any {
	return (getView(trait.value) as any)?.badge?.[key];
}

function setBadgeValue(key: string, val: any) {
	const t = trait.value;
	if (!t) return;
	const v = ensureView(t) as Record<string, any>;
	if (!v.badge || typeof v.badge !== 'object') v.badge = {};
	if (val === '' || val === null || val === undefined) {
		delete v.badge[key];
		if (Object.keys(v.badge).length === 0) delete v.badge;
	} else {
		v.badge[key] = val;
	}
	updateCharacter(props.character);
}

function prefixValue(): string {
	return (getView(trait.value) as any)?.prefix?.text ?? '';
}

function setPrefixValue(val: any) {
	const t = trait.value;
	if (!t) return;
	const v = ensureView(t) as Record<string, any>;
	if (!val) {
		delete v.prefix;
	} else {
		if (!v.prefix || typeof v.prefix !== 'object') v.prefix = {};
		v.prefix.text = val;
	}
	updateCharacter(props.character);
}

function getDieCount(size: number) {
	return dice.value.filter((d: number) => d === size).length;
}

function syncPoolCount(count: number) {
	if (getView(traitSet.value)?.style?.body === 'dice-count') {
		ensureView(trait.value).poolCount = count;
	}
}

function addDieToTrait(size: number) {
	const current = [...dice.value, size].sort((a, b) => b - a);
	characterCurioFunctions.setTraitDice(trait.value, current);
	syncPoolCount(current.length);
	updateCharacter(props.character);
}

function removeDieFromTrait(size: number) {
	const current = [...dice.value];
	const idx = current.indexOf(size);
	if (idx !== -1) {
		current.splice(idx, 1);
		characterCurioFunctions.setTraitDice(trait.value, current);
		syncPoolCount(current.length);
		updateCharacter(props.character);
	}
}

function removeDieAtIndex(index: number) {
	const current = [...dice.value];
	if (index >= 0 && index < current.length) {
		current.splice(index, 1);
		characterCurioFunctions.setTraitDice(trait.value, current);
		syncPoolCount(current.length);
		updateCharacter(props.character);
	}
}

function stepDownDieAtIndex(index: number) {
	const current = [...dice.value];
	if (index >= 0 && index < current.length) {
		const currentSize = current[index];
		const sizes = [12, 10, 8, 6, 4];
		const sIdx = sizes.indexOf(currentSize);
		if (sIdx !== -1 && sIdx < sizes.length - 1) {
			current[index] = sizes[sIdx + 1];
		} else {
			// Stepping down past d4 removes it
			current.splice(index, 1);
		}
		current.sort((a, b) => b - a);
		characterCurioFunctions.setTraitDice(trait.value, current);
		updateCharacter(props.character);
	}
}

function toggleTraitValue(val: any) {
	const t = trait.value as unknown as Record<string, any>;
	const cur = ratingDice(resolveRating(t, ancestorFallbacks.value))[0] || 0;
	if (val === cur && !isOut.value) {
		t.isOut = false;
		characterCurioFunctions.setTraitDice(trait.value, []);
	} else {
		t.isOut = false;
		characterCurioFunctions.setTraitDice(trait.value, [val]);
	}
	updateCharacter(props.character);
}

function toggleOutValue() {
	const t = trait.value as unknown as Record<string, any>;
	if (isOut.value) {
		t.isOut = false;
		characterCurioFunctions.setTraitDice(trait.value, []);
	} else {
		t.isOut = true;
		setRatingDie(t, rangeTop(t, ancestorFallbacks.value) + 2);
		const r = t.rating;
		if (r && typeof r === 'object' && (r.type === 'Die' || r.type === 'Dice')) r.out = true;
	}
	updateCharacter(props.character);
}

// Effective ladder: own range → set rating range → set ratingLadder → base.
const dieRange = computed(() => resolveRange(trait.value, ancestorFallbacks.value));

// True when the trait states no Die/Dice range of its own and inherits.
const isRangeInherited = computed(() => {
	const resolved = resolveRating(trait.value, ancestorFallbacks.value);
	const ownRange = (trait.value as any)?.rating?.range;
	return (
		!resolved ||
		(resolved.type !== 'Die' && resolved.type !== 'Dice') ||
		!Array.isArray(ownRange) ||
		ownRange.length === 0
	);
});

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

const singleDieStepPrev = computed(() => getDieStepPrev(firstDieOf(trait.value)));
const singleDieStepNext = computed(() => getDieStepNext(firstDieOf(trait.value)));

function stepSingleDieDown() {
	const prev = singleDieStepPrev.value;
	if (prev !== null && trait.value) {
		setRatingDie(trait.value as unknown as Record<string, any>, prev);
		updateCharacter(props.character);
	}
}

function stepSingleDieUp() {
	const next = singleDieStepNext.value;
	if (next !== null && trait.value) {
		setRatingDie(trait.value as unknown as Record<string, any>, next);
		updateCharacter(props.character);
	}
}

function stepDownDieAtIndexAlongRange(index: number) {
	const current = [...dice.value];
	if (index >= 0 && index < current.length && trait.value) {
		const curSize = current[index];
		const prev = getDieStepPrev(curSize);
		if (prev !== null) {
			current[index] = prev;
			setRatingDice(trait.value as unknown as Record<string, any>, current);
			syncPoolCount(current.length);
			updateCharacter(props.character);
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
			setRatingDice(trait.value as unknown as Record<string, any>, current);
			syncPoolCount(current.length);
			updateCharacter(props.character);
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

function duplicateTrait() {
	const character = props.character;
	const s = props.traitSetID;
	const path = resolvedPath.value;
	const current = trait.value;
	const container = parentNode.value;
	if (!current || !container || !Array.isArray(container.traits)) return;
	const lastIdx = path[path.length - 1];

	const clone = structuredClone(toRaw(current));
	delete clone._lid;
	delete clone.id;
	characterCurioFunctions.stripInternalIds({ traits: [clone] });
	container.traits.splice(lastIdx + 1, 0, clone);

	updateCharacter(character);
	const nextPath = [...path.slice(0, -1), lastIdx + 1];
	selectElement([isSetSubtraitMode.value ? 'subtrait' : 'trait', s, ...nextPath]);
}

function removeTrait() {
	confirmDelete.value = false;
	const path = resolvedPath.value;
	const s = props.traitSetID;
	if (depth.value >= 2) {
		const lastIdx = path[path.length - 1];
		removeSubtraitAtCurrentParent(lastIdx);
		if (isSetSubtraitMode.value && depth.value === 2) {
			selectElement(['traitSet', s]);
		} else {
			selectElement([isSetSubtraitMode.value ? 'subtrait' : 'trait', s, ...path.slice(0, -1)]);
		}
		return;
	}
	emit('removeTrait', s, props.traitID);
}

function templateHasTrait(name: string) {
	if (!name) return false;
	const setId = traitSet.value ? traitSet.value.id : null;
	const entry = templateEntry.value;
	const base = setId ? characterCurioFunctions.templateSetById(entry, setId) : null;
	return Boolean(base && Array.isArray(base.traits) && base.traits.some((b: any) => b && b.name === name));
}

function removeFromSheet() {
	const entry = templateEntry.value;
	characterCurioFunctions.removeTraitFromSheet(props.character, entry, props.traitSetID, props.traitID);
	confirmDelete.value = false;
	selectElement([]);
	updateCharacter(props.character);
}

function openChildSubtrait(item: any) {
	const s = props.traitSetID;
	const path = resolvedPath.value;
	if (path.length >= 3) return;
	const targetItem = typeof item === 'number' ? childSubtraits.value[item] || { idx: item } : item;
	if (targetItem?.isSfx && targetItem.sfxIdx !== undefined) {
		selectElement([isSetSubtraitMode.value ? 'subtrait' : 'trait', s, ...path, targetItem.idx, targetItem.sfxIdx]);
	} else {
		selectElement([isSetSubtraitMode.value ? 'subtrait' : 'trait', s, ...path, targetItem.idx]);
	}
}

function addSubtrait() {
	if (!canCreateSubtrait.value) return;
	const tr = trait.value;
	if (!tr) return;
	if (!Array.isArray(tr.traits)) tr.traits = [];

	const subtrait: any = structuredClone(characterCurioFunctions.defaultTrait);
	const nextNum = tr.traits.length + 1;
	subtrait.name = nextNum === 1 ? 'New subtrait' : `New subtrait ${nextNum}`;
	subtrait.noun = nextNum === 1 ? 'Subtrait' : `Subtrait ${nextNum}`;
	const allowed = characterCurioFunctions.getSubtraitRatings(traitSet.value);
	const cur =
		subtrait.rating && subtrait.rating.type === 'Die' && Array.isArray(subtrait.rating.value)
			? subtrait.rating.value[0]
			: 0;
	if (allowed.length > 0 && !allowed.includes(cur)) {
		const isDefaultLadder = allowed.length === DIE_LADDER.length && allowed.every((x, i) => x === DIE_LADDER[i]);
		subtrait.rating = { type: 'Die', value: [allowed[0]], ...(isDefaultLadder ? {} : { range: allowed.slice() }) };
	}

	const character = props.character;
	const s = props.traitSetID;
	const path = resolvedPath.value;
	tr.traits.push(subtrait);
	const newIdx = tr.traits.length - 1;

	if (isSetSubtraitMode.value && depth.value === 2 && traitSet.value && Array.isArray(traitSet.value.traits)) {
		const u = path[1];
		traitSet.value.traits.forEach((setTrait: any, tIdx: number) => {
			if (tIdx === path[0] || !setTrait || typeof setTrait !== 'object') return;
			const comp = Array.isArray(setTrait.traits) ? setTrait.traits[u] : null;
			if (comp && typeof comp === 'object') {
				if (!Array.isArray(comp.traits)) comp.traits = [];
				comp.traits.push(structuredClone(toRaw(subtrait)));
			}
		});
	}

	updateCharacter(character);
	selectElement([isSetSubtraitMode.value ? 'subtrait' : 'trait', s, ...path, newIdx]);
}

function removeSubtraitAtCurrentParent(targetIdx: number) {
	const character = props.character;
	const s = props.traitSetID;
	const path = resolvedPath.value;
	if (isSetSubtraitMode.value && depth.value === 2 && traitSet.value && Array.isArray(traitSet.value.traits)) {
		const target = parentNode.value?.traits?.[targetIdx];
		const targetKey = String(target?.noun || target?.name || '')
			.trim()
			.toLowerCase();
		traitSet.value.traits.forEach((tr: any) => {
			if (!tr || typeof tr !== 'object' || !Array.isArray(tr.traits)) return;
			if (targetKey) {
				const hit = tr.traits.findIndex(
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
				if (hit !== -1) {
					tr.traits.splice(hit, 1);
					return;
				}
			}
			if (targetIdx >= 0 && targetIdx < tr.traits.length) {
				tr.traits.splice(targetIdx, 1);
			}
		});
		updateCharacter(character);
		return;
	}
	if (depth.value === 2) {
		const entry = characterCurioFunctions.resolveTemplateFor(character, rootTemplates());
		characterCurioFunctions.removeSubtraitFromSheet(character, entry, s, path[0], targetIdx);
		updateCharacter(character);
		return;
	}
	if (parentNode.value && Array.isArray(parentNode.value.traits)) {
		parentNode.value.traits.splice(targetIdx, 1);
		updateCharacter(character);
	}
}

function removeSubtrait(item: any) {
	const character = props.character;
	const s = props.traitSetID;
	const path = resolvedPath.value;
	const targetItem = typeof item === 'number' ? childSubtraits.value[item] || { idx: item } : item;
	if (targetItem?.isSfx && targetItem.sfxIdx !== undefined) {
		if (trait.value) {
			characterCurioFunctions.removeSfxAt(trait.value, targetItem.sfxIdx);
			updateCharacter(character);
		}
		return;
	}
	const subtraitID = targetItem?.idx ?? 0;
	if (depth.value === 1) {
		const entry = characterCurioFunctions.resolveTemplateFor(character, rootTemplates());
		characterCurioFunctions.removeSubtraitFromSheet(character, entry, s, path[0], subtraitID);
		updateCharacter(character);
		return;
	}
	if (trait.value && Array.isArray(trait.value.traits)) {
		trait.value.traits.splice(subtraitID, 1);
		if (isSetSubtraitMode.value && depth.value === 2 && traitSet.value && Array.isArray(traitSet.value.traits)) {
			const u = path[1];
			traitSet.value.traits.forEach((setTrait: any, tIdx: number) => {
				if (tIdx === path[0] || !setTrait || typeof setTrait !== 'object') return;
				const comp = Array.isArray(setTrait.traits) ? setTrait.traits[u] : null;
				if (comp && Array.isArray(comp.traits) && subtraitID < comp.traits.length) {
					comp.traits.splice(subtraitID, 1);
				}
			});
		}
		updateCharacter(character);
	}
}

function updateCharacter(character: any) {
	emit('updateCharacter', character);
}

function checkAnchorPosition() {
	if (!rootEl.value || !rootEl.value.parentElement) return;

	const windowHeight = window.innerHeight || document.documentElement.clientHeight;
	const parentRect = rootEl.value.parentElement.getBoundingClientRect();
	const traitMidpoint = parentRect.top + parentRect.height / 2;

	if (traitMidpoint < windowHeight / 2) {
		anchorPosition.value = 'top';
	} else {
		anchorPosition.value = 'bottom';
	}

	nextTick(() => {
		if (!rootEl.value) return;

		const rect = rootEl.value.getBoundingClientRect();
		const naturalTop = rect.top - currentShiftY;
		const naturalBottom = rect.bottom - currentShiftY;
		const pad = 16;
		let shiftY = 0;

		if (naturalTop < pad) {
			shiftY = pad - naturalTop;
		} else if (naturalBottom > windowHeight - pad) {
			shiftY = windowHeight - pad - naturalBottom;
		}

		const nextShift = Math.abs(shiftY) > 0.5 ? shiftY : 0;
		let nextArrowShift = 0;
		if (nextShift !== 0) {
			const arrowNaturalY = anchorPosition.value === 'bottom' ? rect.height - 16 : 16;
			const targetArrowY = arrowNaturalY - nextShift;
			const clampedArrowY = Math.max(16, Math.min(rect.height - 16, targetArrowY));
			nextArrowShift = clampedArrowY - arrowNaturalY;
		}

		if (nextShift !== currentShiftY) {
			rootEl.value.style.setProperty('--editor-shift-y', `${nextShift}px`);
			currentShiftY = nextShift;
		}
		if (nextArrowShift !== currentArrowShiftY) {
			rootEl.value.style.setProperty('--arrow-shift-y', `${nextArrowShift}px`);
			currentArrowShiftY = nextArrowShift;
		}
		checkScrollPosition();
	});
}

function checkScrollPosition() {
	if (!rootEl.value || typeof rootEl.value.querySelector !== 'function') return;
	const element = rootEl.value.querySelector('.editor-inner > div') as HTMLElement | null;
	if (!element) return;

	const distance = element.scrollTop;
	const max = element.scrollHeight - element.clientHeight;

	if (max <= 0) {
		scrollPosition.value = 'none';
		return;
	}

	if (distance === 0) {
		scrollPosition.value = 'top';
		return;
	}

	if (distance >= max - 1) {
		// slight buffer
		scrollPosition.value = 'bottom';
		return;
	}

	scrollPosition.value = 'middle';
}

function getDieDisplayValue(val: any, isFilled = false) {
	return characterCurioFunctions.renderDieconSVG(val, isFilled, '', getView(props.character)?.diceConfig);
}
</script>

<template>
	<aside :class="cssClass" ref="rootEl" @click.stop="">
		<div class="editor-controls">
			<button
				v-if="!isPlay"
				type="button"
				class="editor-copy"
				@click.stop="duplicateTrait"
				title="Duplicate trait"
				aria-label="Duplicate trait"
			>
				<i class="fas fa-copy"></i>
			</button>
			<template v-if="!isPlay || canDeleteInPlay">
				<button
					v-if="!confirmDelete"
					type="button"
					class="editor-delete"
					@click.stop="confirmDelete = true"
					title="Delete trait"
					aria-label="Delete trait"
				>
					<i class="fas fa-trash"></i>
				</button>
				<button
					v-else
					type="button"
					class="editor-delete editor-delete-confirm"
					@click.stop="removeTrait"
					title="Click again to confirm deletion"
					aria-label="Confirm delete trait"
				>
					<span>Confirm?</span>
				</button>
			</template>
			<button
				v-if="templateTraitMatched && !isPlay"
				type="button"
				class="editor-delete"
				@click.stop="removeFromSheet"
				title="Remove from sheet — reversible via restore, no confirmation needed"
				aria-label="Remove trait from sheet"
			>
				<i class="fas fa-eraser"></i>
			</button>
		</div>

		<div class="editor-inner">
			<div @scroll="checkScrollPosition">
				<div class="editor-fields">
					<template v-if="isThreeColumnTable">
						<div class="editor-field">
							<label :for="'trait-col1-' + traitID">{{ tableCol1Label }}</label>
							<div class="editor-readonly-title" v-if="isPlay">{{ name }}</div>
							<input
								v-else
								type="text"
								:id="'trait-col1-' + traitID"
								name="col1Name"
								v-model="name"
								ref="inputName"
								@focus="nameBeforeEdit = name"
							/>
						</div>

						<div class="editor-field">
							<label :for="'trait-col2-' + traitID">{{ tableCol2Label }}</label>
							<div class="editor-readonly-text" v-if="isPlay">{{ description }}</div>
							<textarea
								v-else
								:id="'trait-col2-' + traitID"
								name="col2Description"
								v-model="description"
								rows="2"
							></textarea>
						</div>

						<div class="editor-field">
							<label :for="'trait-col3-' + traitID">{{ tableCol3Label }}</label>
							<div class="editor-readonly-text" v-if="isPlay">{{ tableCol3Text }}</div>
							<textarea
								v-else
								:id="'trait-col3-' + traitID"
								name="col3Text"
								v-model="tableCol3Text"
								rows="3"
							></textarea>
						</div>
					</template>

					<div class="editor-field" v-else-if="isSetSubtraitMode">
						<div class="editor-label">Nouns</div>
						<div class="editor-row-inline">
							<div class="flex-1">
								<label :for="'trait-name-' + traitID" class="editor-sub-label">Noun</label>
								<input
									type="text"
									:id="'trait-name-' + traitID"
									name="subtraitNoun"
									v-model="subtraitNoun"
									placeholder="Statement"
									ref="inputName"
								/>
							</div>
							<div class="flex-1">
								<label :for="'subtrait-noun-plural-' + traitID" class="editor-sub-label">Plural</label>
								<input
									type="text"
									:id="'subtrait-noun-plural-' + traitID"
									name="subtraitPlural"
									v-model="subtraitPlural"
									placeholder="Statements"
								/>
							</div>
						</div>
					</div>

					<div class="editor-field" v-else>
						<label :for="'trait-name-' + traitID">{{ identityLabel }}</label>
						<div class="editor-readonly-title" v-if="isPlay && !canDeleteInPlay">{{ name }}</div>
						<input
							v-else
							type="text"
							:id="'trait-name-' + traitID"
							name="traitName"
							v-model="name"
							ref="inputName"
							@focus="nameBeforeEdit = name"
						/>
					</div>

					<div class="editor-hint" v-if="renameWarning && !isPlay">
						Renaming unlinks this trait from template updates — the original name will reappear as inherited.
					</div>

					<div class="editor-field" v-if="isNameSet && !isSubtraitMode && !isPlay">
						<label :for="'trait-label-' + traitID">Label</label>
						<input
							type="text"
							:id="'trait-label-' + traitID"
							name="traitLabel"
							v-model="traitLabel"
							placeholder="Label shown on the sheet"
						/>
					</div>

					<div class="editor-field" v-if="!isPlay && !isThreeColumnTable && !isLabeledPipsSet">
						<label :for="'trait-desc-' + traitID">Description</label>
						<textarea :id="'trait-desc-' + traitID" name="traitDescription" v-model="description"></textarea>
					</div>

					<div class="editor-field" v-if="!isPlay">
						<TagEditor
							v-model="traitTags"
							:input-id="
								'trait-tags-' +
								traitSetID +
								'-' +
								traitID +
								(subtraitID !== null && subtraitID !== undefined ? '-' + subtraitID : '')
							"
							label="Tags"
						/>
					</div>

					<div class="editor-field" v-if="!isPlay">
						<div class="name-heading-row">
							<label>Visibility</label>
							<visibility-eye :state="traitVisibility" @toggle="traitVisibility = nextVisibility(traitVisibility)" />
						</div>
					</div>

					<!-- COUNTER / XP FIELD -->
					<div class="editor-field" v-if="ratingType === 'Counter'">
						<label :for="'trait-counter-' + traitID">{{ counterLabel }}</label>
						<input
							type="text"
							:id="'trait-counter-' + traitID"
							name="traitCounter"
							v-model="counterValue"
							:placeholder="counterLabel"
						/>
					</div>

					<!-- PIP ROW CHECKBOX -->
					<div class="editor-field" v-if="isLabeledPipsSet">
						<div class="editor-toggles">
							<div>
								<input
									type="checkbox"
									:id="'trait-' + traitID + '-pip-checked'"
									name="pipRowChecked"
									v-model="pipRowChecked"
								/>
							</div>
							<div>
								<label :for="'trait-' + traitID + '-pip-checked'"> Filled </label>
							</div>
						</div>
					</div>

					<!-- SCALE DIE TOGGLE FOR PORTRAIT RING -->
					<div class="editor-field" v-if="isRingSet && !isPlay">
						<div class="editor-toggles">
							<div>
								<input type="checkbox" :id="'trait-' + traitID + '-is-scale'" name="isScaleDie" v-model="isScaleDie" />
							</div>
							<div>
								<label :for="'trait-' + traitID + '-is-scale'"> Scale Die </label>
							</div>
						</div>
					</div>

					<div class="editor-field" v-if="parentIsBranch && !isPlay">
						<div class="editor-label">Branch Role</div>
						<div class="editor-button-group">
							<button
								type="button"
								class="editor-group-btn"
								:class="{ active: branchRole === 'skill' }"
								@click.stop="branchRole = 'skill'"
							>
								<i class="fas fa-arrow-right"></i> {{ traitSet?.noun || 'Trait' }}
							</button>
							<button
								type="button"
								class="editor-group-btn"
								:class="{ active: branchRole === 'specialty' }"
								@click.stop="branchRole = 'specialty'"
							>
								Subtrait
							</button>
						</div>
					</div>

					<div class="editor-field" v-if="parentIsBranch && branchRole === 'specialty' && !isPlay">
						<label :for="'trait-branch-link-' + traitID">Connects To {{ traitSet?.noun || 'Trait' }}</label>
						<select :id="'trait-branch-link-' + traitID" name="branchLink" v-model="branchLink">
							<option :value="null">Unlinked</option>
							<option v-for="opt in branchParentOptions" :key="opt.index" :value="opt.index">{{ opt.name }}</option>
						</select>
						<span class="editor-field-hint mt-xs"
							>Draws the connecting arrow from this subtrait to any parent trait in the set.</span
						>
					</div>

					<div class="editor-field" v-if="parentIsBranch && branchRole === 'specialty' && !isPlay">
						<div class="editor-label">Side</div>
						<div class="editor-button-group">
							<button
								type="button"
								class="editor-group-btn"
								:class="{ active: branchSide === 'left' }"
								@click.stop="branchSide = 'left'"
							>
								<i class="fas fa-arrow-left"></i> Left
							</button>
							<button
								type="button"
								class="editor-group-btn"
								:class="{ active: branchSide === 'right' }"
								@click.stop="branchSide = 'right'"
							>
								Right <i class="fas fa-arrow-right"></i>
							</button>
						</div>
					</div>

					<div class="editor-field" v-if="!isListStyle && !isLabeledPipsSet && !hideUnratedSetDie">
						<div class="editor-label" v-if="!isPlay || isRatedTrait">Rating</div>

						<!-- UNRATED: the gate offers to add one -->
						<div class="editor-button-container my-2" v-if="!isRatedTrait && !isPlay">
							<div class="editor-button-container-inner">
								<button type="button" class="editor-button" @click.stop="addRating()">
									<span><i class="fas fa-plus me-1"></i> Add Rating</span>
								</button>
							</div>
						</div>

						<!-- Warning Prompt if child values would be cleared -->
						<div class="editor-warning-prompt editor-warning-banner mb-sm" v-if="confirmRatingChange">
							<span>Changing rating type will clear existing ratings. Proceed?</span>
							<div class="mt-xs">
								<button
									type="button"
									class="btn-step btn-warning-confirm px-2"
									@click.stop="setRatingType(confirmRatingChange)"
								>
									Proceed
								</button>
								<button type="button" class="btn-step px-2 ms-2" @click.stop="confirmRatingChange = null">
									Cancel
								</button>
							</div>
						</div>

						<!-- TYPE (Die | Dice | Counter | Pip) -->
						<div class="editor-button-group" v-if="isRatedTrait && !isPlay">
							<button
								type="button"
								v-for="rt in RATING_TYPES"
								:key="'rating-type-' + rt"
								class="editor-group-btn"
								:class="{ active: ratingType === rt }"
								:aria-pressed="ratingType === rt"
								@click.stop="requestRatingType(rt)"
							>
								{{ rt }}
							</button>
						</div>

						<!-- SINGLE DIE SELECTOR (EDIT MODE) -->
						<div class="rating-scale-container editor-rating-chips" v-if="ratingType === 'Die' && !isPlay">
							<div class="rating-scale-chips" :class="{ 'has-out-chip': shouldShowTrackOut }">
								<button
									type="button"
									v-for="val in dieRange"
									:key="'rating-die-' + val"
									class="rating-scale-chip"
									:class="{ active: isDieActiveOf(trait, val) && !isOut }"
									:aria-pressed="isDieActiveOf(trait, val) && !isOut"
									:aria-label="(isDieActiveOf(trait, val) && !isOut ? 'Clear d' : 'Set d') + val"
									@click.stop="toggleTraitValue(val)"
									:title="(isDieActiveOf(trait, val) ? 'Clear d' : 'Set d') + val"
								>
									<span v-html="getDieDisplayValue(val, isDieActiveOf(trait, val) && !isOut)"></span>
								</button>
								<button
									type="button"
									v-if="shouldShowTrackOut"
									class="rating-scale-chip rating-scale-chip-out"
									:class="{ active: isOut }"
									:aria-pressed="isOut"
									@click.stop="toggleOutValue"
									title="Out"
								>
									<span class="chip-label chip-out-label">{{ outLabel }}</span>
								</button>
							</div>
						</div>

						<!-- SINGLE DIE STEPPER (PLAY MODE) -->
						<div class="die-rating-stepper" v-else-if="ratingType === 'Die' && isPlay">
							<button
								type="button"
								class="btn-step"
								:disabled="singleDieStepPrev === null"
								@click.stop="stepSingleDieDown()"
								title="Step down"
								aria-label="Step down"
							>
								-
							</button>
							<div class="die-rating-current">
								<span v-html="getDieDisplayValue(firstDieOf(trait), firstDieOf(trait) > 0)"></span>
								<span class="die-rating-text">d{{ firstDieOf(trait) }}</span>
							</div>
							<button
								type="button"
								class="btn-step"
								:disabled="singleDieStepNext === null"
								@click.stop="stepSingleDieUp()"
								title="Step up"
								aria-label="Step up"
							>
								+
							</button>
							<button
								type="button"
								class="btn-unset-rating"
								v-if="firstDieOf(trait) > 0"
								@click.stop="
									setRatingDie(trait as unknown as Record<string, any>, null);
									updateCharacter(props.character);
								"
								title="Clear rating"
								aria-label="Clear rating"
							>
								<i class="fas fa-xmark" aria-hidden="true"></i>
							</button>
						</div>

						<!-- DICE LIST EDITOR -->
						<div class="editor-multidie-container" v-else-if="ratingType === 'Dice'">
							<div class="editor-die-steppers" v-if="!isPlay">
								<div
									v-for="size in dieRange"
									:key="'stepper-' + size"
									class="die-stepper-item"
									:class="{ active: getDieCount(size) > 0 }"
								>
									<span v-html="getDieDisplayValue(size, getDieCount(size) > 0)"></span>
									<div class="stepper-controls">
										<button
											type="button"
											class="btn-step"
											@click.stop="removeDieFromTrait(size)"
											:disabled="getDieCount(size) === 0"
											:aria-label="'Remove d' + size"
											:title="'Remove d' + size"
										>
											-
										</button>
										<span class="stepper-count">{{ getDieCount(size) }}</span>
										<button
											type="button"
											class="btn-step"
											@click.stop="addDieToTrait(size)"
											:aria-label="'Add d' + size"
											:title="'Add d' + size"
										>
											+
										</button>
									</div>
								</div>
							</div>

							<!-- CURRENT DICE IN POOL -->
							<div class="multidie-active-list" v-if="dice.length > 0">
								<span class="sub-label">Pool ({{ dice.length }})</span>
								<div class="multidie-chips">
									<div v-for="(dieSize, dIdx) in dice" :key="dIdx" class="multidie-chip">
										<span v-html="getDieDisplayValue(dieSize, true)"></span>
										<template v-if="isPlay">
											<button
												type="button"
												class="btn-step-play"
												:disabled="getDieStepPrev(dieSize) === null"
												@click.stop="stepDownDieAtIndexAlongRange(dIdx)"
												title="Step down"
												aria-label="Step down"
											>
												-
											</button>
											<button
												type="button"
												class="btn-step-play"
												:disabled="getDieStepNext(dieSize) === null"
												@click.stop="stepUpDieAtIndexAlongRange(dIdx)"
												title="Step up"
												aria-label="Step up"
											>
												+
											</button>
										</template>
										<template v-else>
											<button
												type="button"
												class="btn-step-down"
												@click.stop="stepDownDieAtIndex(dIdx)"
												title="Step down die size"
											>
												-2
											</button>
											<button
												type="button"
												class="btn-remove-die"
												@click.stop="removeDieAtIndex(dIdx)"
												title="Remove die"
											>
												×
											</button>
										</template>
									</div>
								</div>
							</div>
						</div>

						<!-- COUNTER NUMBER + RANGE -->
						<div v-else-if="ratingType === 'Counter'">
							<div v-if="!isPlay" class="editor-row-inline flex-wrap">
								<div class="flex-1 min-w-5rem">
									<label :for="'trait-' + traitID + '-counter-number'" class="editor-sub-label">Count</label>
									<input
										type="number"
										:id="'trait-' + traitID + '-counter-number'"
										name="counterNumber"
										v-model.number="counterNumber"
										inputmode="numeric"
										class="w-full"
									/>
								</div>
								<div class="flex-1 min-w-4rem">
									<label :for="'trait-' + traitID + '-counter-min'" class="editor-sub-label">Min</label>
									<input
										type="number"
										:id="'trait-' + traitID + '-counter-min'"
										name="counterMin"
										:value="counterBounds()[0]"
										@change="commitCounterBound(0, $event)"
										inputmode="numeric"
										class="w-full"
									/>
								</div>
								<div class="flex-1 min-w-4rem">
									<label :for="'trait-' + traitID + '-counter-max'" class="editor-sub-label">Max</label>
									<input
										type="number"
										:id="'trait-' + traitID + '-counter-max'"
										name="counterMax"
										:value="counterBounds()[1]"
										@change="commitCounterBound(1, $event)"
										inputmode="numeric"
										class="w-full"
									/>
								</div>
							</div>
							<div v-else class="num-stepper">
								<button
									type="button"
									class="btn-step"
									:disabled="counterNumber <= counterBounds()[0]"
									@click.stop="stepCounterDown()"
									title="Decrease count"
									aria-label="Decrease count"
								>
									-
								</button>
								<span class="stepper-count">{{ counterNumber }}</span>
								<button
									type="button"
									class="btn-step"
									:disabled="counterNumber >= counterBounds()[1]"
									@click.stop="stepCounterUp()"
									title="Increase count"
									aria-label="Increase count"
								>
									+
								</button>
							</div>
						</div>

						<!-- PIP BUBBLE ROW -->
						<div v-else-if="ratingType === 'Pip'">
							<div class="pip-editor-row">
								<div
									v-for="bubbleIndex in pipBubbleCount"
									:key="'pip-' + bubbleIndex"
									class="pip-bubble-wrap"
									tabindex="0"
									role="checkbox"
									:aria-checked="pipBubbleAt(bubbleIndex - 1) ? 'true' : 'false'"
									:aria-label="'Pip ' + bubbleIndex"
									@keydown.enter.prevent="togglePipBubble(bubbleIndex - 1)"
									@keydown.space.prevent="togglePipBubble(bubbleIndex - 1)"
									@click.stop="togglePipBubble(bubbleIndex - 1)"
									:title="pipBubbleAt(bubbleIndex - 1) ? 'Unfill bubble' : 'Fill bubble'"
								>
									<div class="pip-bubble" :class="{ filled: pipBubbleAt(bubbleIndex - 1) }"></div>
								</div>
								<span class="pip-editor-count" v-if="pipBubbleCount === 0">No bubbles</span>
							</div>
							<div class="num-stepper mt-sm" v-if="!isPlay">
								<button
									type="button"
									class="btn-step"
									@click.stop="setPipBubbleCount(pipBubbleCount - 1)"
									:disabled="pipBubbleCount <= 1"
									title="Fewer bubbles"
									aria-label="Fewer bubbles"
								>
									-
								</button>
								<input
									type="number"
									:id="'trait-' + traitID + '-pip-count'"
									name="pipBubbleCount"
									min="1"
									max="100"
									:value="pipBubbleCount"
									@change="commitPipBubbleCount($event)"
									inputmode="numeric"
									aria-label="Bubble count"
									class="editor-input-short"
								/>
								<button
									type="button"
									class="btn-step"
									@click.stop="setPipBubbleCount(pipBubbleCount + 1)"
									title="More bubbles"
									aria-label="More bubbles"
								>
									+
								</button>
							</div>
						</div>
					</div>

					<!-- RATING RANGE (the die ladder Die/Dice ratings may take) -->
					<div
						class="editor-field"
						v-if="
							!isPlay &&
							isRatedTrait &&
							(ratingType === 'Die' || ratingType === 'Dice') &&
							!isListStyle &&
							!isLabeledPipsSet &&
							!hideUnratedSetDie
						"
					>
						<div class="editor-label">Range<template v-if="isRangeInherited"> · inherited</template></div>
						<div class="rating-scale-container">
							<div class="rating-scale-chips">
								<button
									type="button"
									v-for="size in [4, 6, 8, 10, 12]"
									:key="'range-' + size"
									class="rating-scale-chip"
									:class="{ active: isRangeIncluded(size) }"
									@click.stop="toggleRangeOption(size)"
									:title="(isRangeIncluded(size) ? 'Exclude d' : 'Include d') + size"
								>
									<span v-html="getDieDisplayValue(size)"></span>
									<span class="chip-label">d{{ size }}</span>
								</button>
								<button
									type="button"
									class="rating-scale-chip rating-scale-chip-out"
									:class="{ active: ratingHasOut }"
									@click.stop="ratingHasOut = !ratingHasOut"
									:title="(ratingHasOut ? 'Disable' : 'Enable') + ' Out marker'"
								>
									<span class="chip-label chip-out-label">OUT</span>
								</button>
							</div>
						</div>
					</div>

					<!-- OPTIONS (only what the shape makes meaningful) -->
					<div class="editor-field" v-if="!isPlay && isRatedTrait && !isListStyle && !isLabeledPipsSet">
						<div class="editor-label">Options</div>
						<div class="editor-row-inline flex-wrap">
							<div class="editor-checkbox-row">
								<input
									type="checkbox"
									:id="'trait-' + traitID + '-pool'"
									:true-value="true"
									:false-value="false"
									v-model="traitPool"
								/>
								<label
									:for="'trait-' + traitID + '-pool'"
									title="Adding the trait stages its whole array of available dice"
									>Pool</label
								>
							</div>
							<div class="editor-checkbox-row">
								<input
									type="checkbox"
									:id="'trait-' + traitID + '-spendable'"
									:true-value="true"
									:false-value="false"
									v-model="traitSpendable"
								/>
								<label :for="'trait-' + traitID + '-spendable'">Spendable</label>
							</div>
							<div class="editor-checkbox-row">
								<input
									type="checkbox"
									:id="'trait-' + traitID + '-editable-sheet'"
									:true-value="true"
									:false-value="false"
									v-model="editableOnSheet"
								/>
								<label
									:for="'trait-' + traitID + '-editable-sheet'"
									title="Allow this trait or its statement/text to be edited directly on the sheet in play/edit mode"
									>Editable on sheet</label
								>
							</div>
						</div>
						<div class="editor-toggles mt-sm" v-if="hitchesDiffers">
							<div><label :for="'trait-' + traitID + '-hitches'">Hitches</label></div>
							<div>
								<input
									type="number"
									:id="'trait-' + traitID + '-hitches'"
									name="traitHitches"
									min="0"
									max="12"
									v-model.number="traitHitches"
									class="editor-input-short"
								/>
							</div>
						</div>
					</div>

					<!-- SUBTRAITS -->
					<div class="editor-field" v-if="!isPlay || childSubtraits.length > 0">
						<div class="editor-label">Subtraits</div>

						<div class="editor-subtrait-list" v-if="childSubtraits.length > 0">
							<div
								v-for="(item, itemIdx) in childSubtraits"
								:key="'child-sub-' + item.idx + '-' + (item.sfxIdx ?? itemIdx)"
								class="editor-subtrait-row"
							>
								<button
									type="button"
									class="editor-subtrait-drill"
									@click.stop="openChildSubtrait(item)"
									:title="(isPlay ? 'Inspect ' : 'Edit ') + item.label"
								>
									<span class="editor-subtrait-name">{{ item.label }}</span>
									<span class="editor-subtrait-meta">
										<span class="editor-subtrait-badge">{{ item.summary }}</span>
										<i class="fas fa-chevron-right editor-subtrait-chevron" aria-hidden="true"></i>
									</span>
								</button>
								<button
									v-if="!isPlay"
									type="button"
									class="editor-subtrait-delete"
									@click.stop="removeSubtrait(item)"
									:title="'Delete ' + item.label"
									:aria-label="'Delete ' + item.label"
								>
									<i class="fas fa-trash" aria-hidden="true"></i>
								</button>
							</div>
						</div>

						<div class="editor-button-container" v-if="!isPlay">
							<div class="editor-button-container-inner">
								<button
									type="button"
									class="editor-button"
									:disabled="!canCreateSubtrait"
									:title="canCreateSubtrait ? 'Create subtrait' : 'Maximum subtrait depth (3 levels) reached'"
									@click.stop="addSubtrait"
								>
									<span><i class="fas fa-plus"></i> Create subtrait</span>
								</button>
							</div>
						</div>
					</div>

					<!-- BADGE -->
					<div class="editor-field" v-if="!isPlay && hasSfxChildren">
						<div class="editor-label">Badge</div>
						<div class="editor-row-inline flex-wrap mb-sm">
							<div class="flex-1 min-w-8rem">
								<label class="editor-sub-label">Text</label>
								<input
									type="text"
									:value="badgeValue('text')"
									@change="setBadgeValue('text', targetValue($event))"
									:placeholder="badgeValue('text') || 'SFX'"
								/>
							</div>
							<div class="min-w-7rem">
								<label class="editor-sub-label">Shape</label>
								<select
									:value="badgeValue('shape') || 'vertical-bar'"
									@change="setBadgeValue('shape', targetValue($event))"
								>
									<option value="vertical-bar">Vertical bar</option>
									<option value="pill">Pill</option>
									<option value="square">Square</option>
									<option value="chamfer">Chamfer</option>
								</select>
							</div>
							<div class="w-full">
								<div class="editor-sub-label">Color</div>
								<ColorPicker
									compact
									:allow-custom="false"
									:show-swatches="false"
									:model-value="badgeValue('color') || 'black'"
									:input-id="'trait-' + traitSetID + '-' + traitID + '-badge-color'"
									label="Badge Color"
									:tokens="badgeColorTokens"
									@update:model-value="setBadgeValue('color', $event)"
								/>
							</div>
							<div class="flex-1 min-w-8rem">
								<label class="editor-sub-label">Icon</label>
								<input
									type="text"
									:value="badgeValue('icon')"
									@change="setBadgeValue('icon', targetValue($event))"
									placeholder="fa-bolt"
								/>
							</div>
						</div>
						<div class="mb-sm">
							<label class="editor-sub-label">Prefix</label>
							<input
								type="text"
								:value="prefixValue()"
								@change="setPrefixValue(targetValue($event))"
								:placeholder="prefixValue()"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</aside>
</template>
