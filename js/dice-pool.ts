// dice-pool — dice pool model (CortexPal-compatible). TypeScript leaf.

export const DIE_EXPRESSION = /(\d*(d|D))?(4|6|8|10|12)/;
export const DIE_SIZES = [4, 6, 8, 10, 12];

const uuid = (): string =>
	typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);

export class Die {
	name: string | null;
	size: number;
	qty: number;
	values: number[];
	source: string;

	constructor(
		expression: string | null = null,
		name: string | null = null,
		size = 4,
		qty = 1,
		values: number[] = [],
		source = '',
	) {
		this.name = name;
		this.size = size;
		this.qty = qty;
		this.values = values ? [...values] : [];
		this.source = source || '';

		if (expression) {
			const numbers = String(expression).toLowerCase().split('d');
			if (numbers.length === 1) {
				this.size = parseInt(numbers[0], 10);
			} else {
				if (numbers[0]) {
					this.qty = parseInt(numbers[0], 10);
				}
				this.size = parseInt(numbers[1], 10);
			}
		}
	}

	roll(): number[] {
		this.values = [];
		for (let i = 0; i < this.qty; i++) {
			this.values.push(Math.floor(Math.random() * this.size) + 1);
		}
		return this.values;
	}

	isRolled(): boolean {
		return this.values.length > 0;
	}

	isBotch(): boolean {
		return this.values.length > 0 && this.values.every((v) => v === 1);
	}

	eligibleDice(hitchOn = 1): Die[] {
		const eligible: Die[] = [];
		for (const v of this.values) {
			if (v > hitchOn) {
				eligible.push(new Die(null, 'D' + this.size, this.size, 1, [v], this.source));
			}
		}
		return eligible;
	}

	toString(): string {
		if (this.qty > 1) {
			return `${this.qty}D${this.size}`;
		}
		return `D${this.size}`;
	}

	output(): string {
		return this.toString();
	}
}

export const DEFAULT_D4 = new Die(null, 'D4', 4, 1, [], 'Default');

export interface DiceItem {
	id: string;
	size: number;
	source: string;
	isScale: boolean;
	hitches: number;
	keepsExtra: number;
	ppDelta?: number;
	ppCommitted?: boolean;
}

export type WordBankKind = 'trait' | 'scale' | 'pp' | 'hinder' | 'asset' | 'custom';

export interface WordBankItem {
	id: string;
	label: string;
	kind: WordBankKind;
}

export interface RollResult {
	id: string;
	size: number;
	value: number;
	source: string;
	isScale: boolean;
	hitches: number;
	isHitch: boolean;
	hitchActivated?: boolean;
	manualRole: 'total' | 'effect' | 'none';
}

export interface SeparateGroup {
	name: string;
	dice: RollResult[];
	keptDie: RollResult;
	bonus: number;
}

export interface PoolEvaluation {
	side: 'player' | 'opposition';
	label: string;
	keep: number;
	combineSeparate: boolean;
	results: RollResult[];
	actionResults: RollResult[];
	separateGroups: SeparateGroup[];
	bestTotalInfo: any;
	bestEffectInfo: any;
	manualTotal: number;
	manualActionTotal: number;
	manualSeparateBonus: number;
	manualEffectDie: string;
	totalHitches: number;
	isBotch: boolean;
	log: string;
}

export interface AddPoolOptions {
	skipWordBank?: boolean;
	wordKind?: WordBankKind;
}

export interface ShorthandParseResult {
	label: string;
	dice: { count: number; size: number } | null;
}

export interface FlattenedTraitSuggestion {
	key: string;
	name: string;
	noun: string;
	description: string;
	dice: number[];
	notation: string;
	canHinder: boolean;
	hitches: number;
	keepsExtra: number;
}

const IGNORED_WORD_BANK_LABELS = new Set(['ad-hoc', 'default', 'separate', 'pool']);

function cleanWordBankLabel(raw: string): string {
	return String(raw || '')
		.replace(/\s*\([dD]\d+\)\s*$/, '')
		.replace(/\s+[dD]\d+\s*$/, '')
		.replace(/\(\s*\)/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function formatDiceNotation(dice: number[]): string {
	if (!dice || dice.length === 0) return '';
	if (dice.length === 1) return `d${dice[0]}`;
	const first = dice[0];
	if (dice.every((d) => d === first)) {
		return `${dice.length}d${first}`;
	}
	return dice.map((d) => `d${d}`).join(' + ');
}

export function parseTraitShorthand(input: string): ShorthandParseResult {
	const trimmed = String(input || '').trim();
	if (!trimmed) return { label: '', dice: null };
	const match = /^(.*?)\s*\b(?:(\d+)?d(4|6|8|10|12))\b\s*(.*)$/i.exec(trimmed);
	if (!match) {
		return { label: trimmed, dice: null };
	}
	const countRaw = match[2] ? parseInt(match[2], 10) : 1;
	const count = Math.min(20, Math.max(1, Number.isFinite(countRaw) ? countRaw : 1));
	const size = parseInt(match[3], 10);
	const label = `${match[1] || ''} ${match[4] || ''}`
		.replace(/\(\s*\)/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	return { label, dice: { count, size } };
}

function extractValidDice(rating: any): number[] {
	if (!rating || rating.type === 'Counter' || rating.type === 'Empty') return [];
	if (!Array.isArray(rating.value)) return [];
	return rating.value.map((v: any) => Number(v)).filter((n: number) => DIE_SIZES.includes(n));
}

function resolveNumericHitches(node: any, fallback = 1): number {
	if (node && typeof node.hitches === 'number' && Number.isFinite(node.hitches) && node.hitches >= 0) {
		return Math.floor(node.hitches);
	}
	return fallback;
}

function resolveNumericKeepsExtra(node: any, fallback = 0): number {
	if (node && typeof node.keepsExtra === 'number' && Number.isFinite(node.keepsExtra) && node.keepsExtra > 0) {
		return Math.floor(node.keepsExtra);
	}
	return fallback;
}

export function flattenCharacterTraits(character: any): FlattenedTraitSuggestion[] {
	if (!character || !Array.isArray(character.traitSets)) return [];
	const results: FlattenedTraitSuggestion[] = [];

	for (let sIdx = 0; sIdx < character.traitSets.length; sIdx++) {
		const ts = character.traitSets[sIdx];
		if (!ts) continue;
		const styleLayout = ts.view?.style?.layout;
		if (ts.id === 'name' || styleLayout === 'identity' || styleLayout === 'name') continue;

		const setKey = ts.id || `set-${sIdx}`;
		const setNoun = String(ts.noun || '').trim();
		const isDistinctionSet = setNoun.toLowerCase() === 'distinction';
		const setHitches = resolveNumericHitches(ts, 1);
		const setKeepsExtra = resolveNumericKeepsExtra(ts, 0);

		const setDice = extractValidDice(ts.rating);
		if (setDice.length > 0) {
			const setName = String(ts.name || setNoun || `Set ${sIdx + 1}`).trim();
			const setDesc = String(ts.description || '').trim();
			if (setDice.length > 1) {
				results.push({
					key: `${setKey}-single`,
					name: setName,
					noun: setNoun,
					description: setDesc,
					dice: [setDice[0]],
					notation: `1d${setDice[0]}`,
					canHinder: false,
					hitches: setHitches,
					keepsExtra: setKeepsExtra,
				});
				results.push({
					key: `${setKey}-pool`,
					name: setName,
					noun: setNoun,
					description: setDesc,
					dice: [...setDice],
					notation: formatDiceNotation(setDice),
					canHinder: false,
					hitches: setHitches,
					keepsExtra: setKeepsExtra,
				});
			} else {
				results.push({
					key: `${setKey}-set`,
					name: setName,
					noun: setNoun,
					description: setDesc,
					dice: [...setDice],
					notation: formatDiceNotation(setDice),
					canHinder: false,
					hitches: setHitches,
					keepsExtra: setKeepsExtra,
				});
			}
		}

		const traits = Array.isArray(ts.traits) ? ts.traits : [];
		for (let tIdx = 0; tIdx < traits.length; tIdx++) {
			const tr = traits[tIdx];
			if (!tr || tr.spent === true || tr.id === 'plotPoints') continue;

			const trDice = extractValidDice(tr.rating);
			const children = Array.isArray(tr.traits) ? tr.traits : [];
			const hasHinderChild = children.some(
				(c: any) =>
					String(c?.name || '')
						.trim()
						.toLowerCase() === 'hinder',
			);
			const canHinder = isDistinctionSet || hasHinderChild;
			const trHitches = resolveNumericHitches(tr, setHitches);
			const trKeepsExtra = resolveNumericKeepsExtra(tr, setKeepsExtra);

			if (trDice.length > 0 && tr.name) {
				results.push({
					key: `${setKey}-t-${tr.id || tIdx}`,
					name: String(tr.name).trim(),
					noun: setNoun,
					description: String(tr.description || '').trim(),
					dice: trDice,
					notation: formatDiceNotation(trDice),
					canHinder,
					hitches: trHitches,
					keepsExtra: trKeepsExtra,
				});
			}

			for (let subIdx = 0; subIdx < children.length; subIdx++) {
				const sub = children[subIdx];
				if (!sub || sub.spent === true) continue;
				const subName = String(sub.name || '').trim();
				if (!subName || subName.toLowerCase() === 'hinder' || sub.type === 'sfx') continue;
				const subDice = extractValidDice(sub.rating);
				if (subDice.length === 0) continue;
				results.push({
					key: `${setKey}-t-${tr.id || tIdx}-sub-${sub.id || subIdx}`,
					name: subName,
					noun: setNoun,
					description: String(sub.description || '').trim(),
					dice: subDice,
					notation: formatDiceNotation(subDice),
					canHinder: false,
					hitches: resolveNumericHitches(sub, trHitches),
					keepsExtra: resolveNumericKeepsExtra(sub, trKeepsExtra),
				});
			}
		}
	}

	return results;
}

export class DicePool {
	dice: (Die | null)[];
	items: DiceItem[];
	wordBank: WordBankItem[];

	constructor(incoming_dice: unknown = []) {
		this.dice = [null, null, null, null, null];
		this.items = []; // List of individual staged dice with id and source
		this.wordBank = [];
		if (Array.isArray(incoming_dice) && incoming_dice.length > 0) {
			this.add(incoming_dice);
		}
	}

	addWord(label: string, kind: WordBankKind = 'trait'): WordBankItem | null {
		const cleaned = cleanWordBankLabel(label);
		if (!cleaned || IGNORED_WORD_BANK_LABELS.has(cleaned.toLowerCase())) return null;
		const entry: WordBankItem = { id: uuid(), label: cleaned, kind };
		this.wordBank.push(entry);
		return entry;
	}

	removeWord(idOrIndex: string | number): WordBankItem | null {
		const idx = typeof idOrIndex === 'number' ? idOrIndex : this.wordBank.findIndex((w) => w.id === idOrIndex);
		if (idx >= 0 && idx < this.wordBank.length) {
			return this.wordBank.splice(idx, 1)[0];
		}
		return null;
	}

	add(dice: unknown, options: AddPoolOptions = {}): void {
		const list = Array.isArray(dice) ? dice : [dice];
		const seenWords = new Map<string, WordBankKind>();

		for (const d of list) {
			let dieObj: Die | undefined;
			const props: Record<string, unknown> = d && typeof d === 'object' ? (d as Record<string, unknown>) : {};
			if (d instanceof Die) {
				dieObj = d;
			} else if (typeof d === 'number') {
				dieObj = new Die(null, 'D' + d, d, 1, [], '');
			} else if (typeof d === 'object' && d !== null) {
				const o = d as { size?: number; qty?: number; source?: string };
				dieObj = new Die(null, 'D' + (o.size || 4), o.size || 4, o.qty || 1, [], o.source || '');
			} else if (typeof d === 'string') {
				dieObj = new Die(d);
			}

			if (dieObj && DIE_SIZES.includes(dieObj.size)) {
				const index = DIE_SIZES.indexOf(dieObj.size);
				const slot = this.dice[index];
				if (slot) {
					slot.qty += dieObj.qty;
				} else {
					this.dice[index] = new Die(null, 'D' + dieObj.size, dieObj.size, dieObj.qty, [], dieObj.source);
				}

				const isScale = Boolean(props.isScale || (dieObj.source && dieObj.source.toLowerCase() === 'scale'));
				const ppDelta = typeof props.ppDelta === 'number' ? props.ppDelta : 0;

				if (!options.skipWordBank && dieObj.source) {
					const rawSource = String(dieObj.source).trim();
					const isHinder = ppDelta > 0 || /\(hinder\)/i.test(rawSource);
					const clean = cleanWordBankLabel(rawSource.replace(/\s*\(hinder\)\s*/i, isHinder ? ' (Hinder)' : ''));
					if (clean && !IGNORED_WORD_BANK_LABELS.has(clean.toLowerCase()) && !seenWords.has(clean)) {
						const inferredKind: WordBankKind = isHinder
							? 'hinder'
							: isScale || clean.toLowerCase() === 'scale'
								? 'scale'
								: options.wordKind || 'trait';
						seenWords.set(clean, inferredKind);
					}
				}

				for (let i = 0; i < dieObj.qty; i++) {
					this.items.push({
						id: uuid(),
						size: dieObj.size,
						source: dieObj.source || '',
						isScale,
						hitches:
							typeof props.hitches === 'number' && Number.isFinite(props.hitches) && (props.hitches as number) >= 0
								? Math.floor(props.hitches as number)
								: 1,
						keepsExtra:
							typeof props.keepsExtra === 'number' &&
							Number.isFinite(props.keepsExtra) &&
							(props.keepsExtra as number) > 0
								? Math.floor(props.keepsExtra as number)
								: 0,
						ppDelta,
						ppCommitted: Boolean(props.ppCommitted),
					});
				}
			}
		}

		for (const [label, kind] of seenWords.entries()) {
			this.addWord(label, kind);
		}
	}

	stepDownAt(index: number): boolean {
		const item = this.items[index];
		if (!item) return false;
		const currentIdx = DIE_SIZES.indexOf(item.size);
		if (currentIdx > 0) {
			item.size = DIE_SIZES[currentIdx - 1];
			this._syncDiceFromItems();
			return true;
		}
		return false;
	}

	stepUpAt(index: number): boolean {
		const item = this.items[index];
		if (!item) return false;
		const currentIdx = DIE_SIZES.indexOf(item.size);
		if (currentIdx !== -1 && currentIdx < DIE_SIZES.length - 1) {
			item.size = DIE_SIZES[currentIdx + 1];
			this._syncDiceFromItems();
			return true;
		}
		return false;
	}

	duplicateAt(index: number): DiceItem | null {
		const item = this.items[index];
		if (!item) return null;
		const clone: DiceItem = {
			...item,
			id: uuid(),
			ppDelta: 0,
			ppCommitted: true,
		};
		this.items.splice(index + 1, 0, clone);
		this._syncDiceFromItems();
		return clone;
	}

	removeAt(index: number): DiceItem | null {
		if (index >= 0 && index < this.items.length) {
			const removed = this.items.splice(index, 1)[0];
			this._syncDiceFromItems();
			return removed;
		}
		return null;
	}

	removeBySize(size: number): DiceItem | null {
		const idx = this.items.findIndex((item) => item.size === size);
		if (idx !== -1) {
			return this.removeAt(idx);
		}
		return null;
	}

	clear(): void {
		this.dice = [null, null, null, null, null];
		this.items = [];
		this.wordBank = [];
	}

	_syncDiceFromItems(): void {
		this.dice = [null, null, null, null, null];
		for (const item of this.items) {
			const index = DIE_SIZES.indexOf(item.size);
			if (index !== -1) {
				const slot = this.dice[index];
				if (slot) {
					slot.qty += 1;
				} else {
					this.dice[index] = new Die(null, 'D' + item.size, item.size, 1, [], item.source);
				}
			}
		}
	}

	isRolled(): boolean {
		return this.dice.some((die) => die && die.isRolled());
	}

	isBotch(): boolean {
		return this.dice.some((die) => die !== null) && this.dice.every((die) => !die || die.isBotch());
	}

	is_empty(): boolean {
		return !this.dice.some((die) => die !== null);
	}

	hitchCount(hitchOn = 1): number {
		return this.dice.reduce((sum, die) => sum + (die ? die.values.filter((v) => v <= hitchOn).length : 0), 0);
	}

	eligibleDice(hitchOn = 1): Die[] {
		if (!this.isRolled()) {
			this.rollDice();
		}
		let eligible: Die[] = [];
		for (const die of this.dice) {
			if (die) {
				eligible = eligible.concat(die.eligibleDice(hitchOn));
			}
		}
		return eligible;
	}

	rollDice(): (Die | null)[] {
		for (const die of this.dice) {
			if (die) die.roll();
		}
		return this.dice;
	}

	getHitchesDisplay(hitchOn = 1): string {
		return `\nHitches: ` + this.hitchCount(hitchOn);
	}

	getOnlyTotal(rolls: Die[] | null = null, keep = 2, hitchOn = 1, displayHitches = false): string {
		if (!rolls) {
			rolls = this.eligibleDice(hitchOn);
			displayHitches = true;
		}
		let output = '';
		const only_total_addition = rolls.map((d) => d.values[0]).join(' + ');
		const only_total_1 = rolls.slice(0, keep).reduce((sum, d) => sum + d.values[0], 0);
		output += `Only Total: ${only_total_1} (${only_total_addition}) with Effect: D4`;
		if (displayHitches) {
			output += this.getHitchesDisplay(hitchOn);
		}
		return output;
	}

	getBestTotal(rolls: Die[] | null = null, keep = 2, hitchOn = 1, displayHitches = false): string {
		if (!rolls) {
			rolls = this.eligibleDice(hitchOn);
			displayHitches = true;
		}
		let output = '';
		const rollsSorted = [...rolls].sort((a, b) => b.values[0] - a.values[0]);
		const best_total_dice = rollsSorted.slice(0, keep);
		const best_effect_dice = rollsSorted.slice(keep).sort((a, b) => b.size - a.size);
		best_effect_dice.push(DEFAULT_D4);
		const best_effect_1 = `D${best_effect_dice[0].size}`;
		const best_total_addition = best_total_dice.map((d) => d.values[0]).join(' + ');
		const best_total_1 = best_total_dice.reduce((sum, d) => sum + d.values[0], 0);
		output += `Best Total: ${best_total_1} (${best_total_addition}) with Effect: ${best_effect_1}`;
		if (displayHitches) {
			output += this.getHitchesDisplay(hitchOn);
		}
		return output;
	}

	getBestEffect(rolls: Die[] | null = null, keep = 2, hitchOn = 1, displayHitches = false): string {
		if (!rolls) {
			rolls = this.eligibleDice(hitchOn);
			displayHitches = true;
		}
		let output = '';
		const rollsSorted = [...rolls].sort((a, b) => {
			if (a.size !== b.size) {
				return b.size - a.size;
			}
			return a.values[0] - b.values[0];
		});
		const best_effect_2 = `D${rollsSorted[0].size}`;
		const best_total_dice_2 = rollsSorted
			.slice(1)
			.sort((a, b) => b.values[0] - a.values[0])
			.slice(0, keep);
		const best_total_addition_2 = best_total_dice_2.map((d) => d.values[0]).join(' + ');
		const best_total_2 = best_total_dice_2.reduce((sum, d) => sum + d.values[0], 0);
		output += `Best Effect: ${best_effect_2} with Total: ${best_total_2} (${best_total_addition_2})`;
		if (displayHitches) {
			output += this.getHitchesDisplay(hitchOn);
		}
		return output;
	}

	getBest(rolls: Die[] | null = null, keep = 2, hitchOn = 1, displayHitches = false): string {
		if (!rolls) {
			rolls = this.eligibleDice(hitchOn);
			displayHitches = true;
		}
		let output = '';
		if (this.isBotch()) {
			output += '\nBotch!';
			return output;
		} else if (rolls.length <= keep) {
			output += '\n';
			output += this.getOnlyTotal(rolls, keep, hitchOn, displayHitches);
		} else {
			if (!displayHitches) output += '\n';
			output += this.getBestTotal(rolls, keep, hitchOn, false);
			output += '\n';
			output += this.getBestEffect(rolls, keep, hitchOn, displayHitches);
		}
		return output;
	}

	results(dice: (Die | null)[] | null = null, hitchOn = 1): string {
		if (!dice) {
			dice = this.dice;
		}
		let output = '';
		let separator = '';
		for (const die of dice) {
			if (die) {
				output += `${separator}D${die.size} : `;
				for (let i = 0; i < die.values.length; i++) {
					let roll_str = die.values[i].toString();
					if (die.values[i] <= hitchOn) {
						roll_str = '(' + roll_str + ')';
					}
					output += `${roll_str} `;
				}
				separator = '\n';
			}
		}
		return output;
	}

	roll(suggest_best = true, keep = 2, hitchOn = 1, displayHitches = true): string {
		this.rollDice();
		let output = this.results(this.dice, hitchOn);
		const rolls = this.eligibleDice(hitchOn);
		if (suggest_best) {
			output += '\n' + this.getBest(rolls, keep, hitchOn, displayHitches);
		} else if (displayHitches) {
			output += this.getHitchesDisplay(hitchOn);
		}
		return output;
	}

	output(): string {
		if (this.is_empty()) {
			return 'empty';
		}
		return (this.dice.filter(Boolean) as Die[]).map((die) => die.output()).join(', ');
	}
}

export const ROLL_LOG_STORAGE_KEY = 'characterCurioRollLog';
export const MAX_ROLL_LOG_ENTRIES = 50;

export interface RollLogStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

export interface RollLogSideSummary {
	total: number;
	effectDie: string;
	hitches: number;
	isBotch: boolean;
	diceSummary: string;
	log: string;
}

export interface RollLogEntry {
	id: string;
	timestamp: number;
	characterName: string;
	contest: boolean;
	player?: RollLogSideSummary;
	opposition?: RollLogSideSummary;
	summaryText: string;
}

function defaultRollLogStorage(): RollLogStorage | null {
	return typeof localStorage !== 'undefined' ? localStorage : null;
}

function isValidSideSummary(s: any): s is RollLogSideSummary {
	return Boolean(
		s &&
		typeof s === 'object' &&
		typeof s.total === 'number' &&
		typeof s.effectDie === 'string' &&
		typeof s.hitches === 'number' &&
		typeof s.isBotch === 'boolean' &&
		typeof s.diceSummary === 'string' &&
		typeof s.log === 'string',
	);
}

export function loadRollLog(storage: RollLogStorage | null | undefined = defaultRollLogStorage()): RollLogEntry[] {
	if (!storage) return [];
	try {
		const raw = storage.getItem(ROLL_LOG_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter((entry): entry is RollLogEntry =>
				Boolean(
					entry &&
					typeof entry === 'object' &&
					typeof entry.id === 'string' &&
					typeof entry.timestamp === 'number' &&
					typeof entry.characterName === 'string' &&
					typeof entry.contest === 'boolean' &&
					typeof entry.summaryText === 'string' &&
					(entry.player === undefined || isValidSideSummary(entry.player)) &&
					(entry.opposition === undefined || isValidSideSummary(entry.opposition)),
				),
			)
			.slice(0, MAX_ROLL_LOG_ENTRIES);
	} catch {
		return [];
	}
}

export function saveRollLog(
	entries: RollLogEntry[],
	storage: RollLogStorage | null | undefined = defaultRollLogStorage(),
): void {
	if (!storage) return;
	try {
		const trimmed = Array.isArray(entries) ? entries.slice(0, MAX_ROLL_LOG_ENTRIES) : [];
		storage.setItem(ROLL_LOG_STORAGE_KEY, JSON.stringify(trimmed));
	} catch {
		// Ignore quota / unavailable storage errors
	}
}

export const dicePool = {
	Die: Die,
	DicePool: DicePool,
	DIE_SIZES: DIE_SIZES,
	parseTraitShorthand: parseTraitShorthand,
	flattenCharacterTraits: flattenCharacterTraits,
	ROLL_LOG_STORAGE_KEY: ROLL_LOG_STORAGE_KEY,
	MAX_ROLL_LOG_ENTRIES: MAX_ROLL_LOG_ENTRIES,
	loadRollLog: loadRollLog,
	saveRollLog: saveRollLog,
};
