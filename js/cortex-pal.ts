// cortex-pal — dice pool model (CortexPal-compatible). TypeScript leaf.

export const DIE_EXPRESSION = /(\d*(d|D))?(4|6|8|10|12)/;
export const DIE_SIZES = [4, 6, 8, 10, 12];

const uuid = (): string =>
	typeof crypto !== "undefined" && crypto.randomUUID
		? crypto.randomUUID()
		: Math.random().toString(36).substring(2, 9);

export class CortexDie {
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
		source = "",
	) {
		this.name = name;
		this.size = size;
		this.qty = qty;
		this.values = values ? [...values] : [];
		this.source = source || "";

		if (expression) {
			const numbers = String(expression).toLowerCase().split("d");
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

	eligibleDice(hitchOn = 1): CortexDie[] {
		const eligible: CortexDie[] = [];
		for (const v of this.values) {
			if (v > hitchOn) {
				eligible.push(new CortexDie(null, "D" + this.size, this.size, 1, [v], this.source));
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

export const CORTEX_D4 = new CortexDie(null, "D4", 4, 1, [], "Default");

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

export class CortexDicePool {
	dice: (CortexDie | null)[];
	items: DiceItem[];

	constructor(incoming_dice: unknown = []) {
		this.dice = [null, null, null, null, null];
		this.items = []; // List of individual staged dice with id and source
		if (Array.isArray(incoming_dice) && incoming_dice.length > 0) {
			this.add(incoming_dice);
		}
	}

	add(dice: unknown): void {
		const list = Array.isArray(dice) ? dice : [dice];
		for (const d of list) {
			let dieObj: CortexDie | undefined;
			const props: Record<string, unknown> = d && typeof d === "object" ? (d as Record<string, unknown>) : {};
			if (d instanceof CortexDie) {
				dieObj = d;
			} else if (typeof d === "number") {
				dieObj = new CortexDie(null, "D" + d, d, 1, [], "");
			} else if (typeof d === "object" && d !== null) {
				const o = d as { size?: number; qty?: number; source?: string };
				dieObj = new CortexDie(null, "D" + (o.size || 4), o.size || 4, o.qty || 1, [], o.source || "");
			} else if (typeof d === "string") {
				dieObj = new CortexDie(d);
			}

			if (dieObj && DIE_SIZES.includes(dieObj.size)) {
				const index = DIE_SIZES.indexOf(dieObj.size);
				const slot = this.dice[index];
				if (slot) {
					slot.qty += dieObj.qty;
				} else {
					this.dice[index] = new CortexDie(null, "D" + dieObj.size, dieObj.size, dieObj.qty, [], dieObj.source);
				}

				for (let i = 0; i < dieObj.qty; i++) {
					this.items.push({
						id: uuid(),
						size: dieObj.size,
						source: dieObj.source || "",
						isScale: Boolean(props.isScale || (dieObj.source && dieObj.source.toLowerCase() === "scale")),
						hitches: (typeof props.hitches === "number" && Number.isFinite(props.hitches) && (props.hitches as number) >= 0)
							? Math.floor(props.hitches as number) : 1,
						keepsExtra: (typeof props.keepsExtra === "number" && Number.isFinite(props.keepsExtra) && (props.keepsExtra as number) > 0)
							? Math.floor(props.keepsExtra as number) : 0,
						ppDelta: (typeof props.ppDelta === "number") ? props.ppDelta : 0,
						ppCommitted: Boolean(props.ppCommitted),
					});
				}
			}
		}
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
					this.dice[index] = new CortexDie(null, "D" + item.size, item.size, 1, [], item.source);
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

	eligibleDice(hitchOn = 1): CortexDie[] {
		if (!this.isRolled()) {
			this.rollDice();
		}
		let eligible: CortexDie[] = [];
		for (const die of this.dice) {
			if (die) {
				eligible = eligible.concat(die.eligibleDice(hitchOn));
			}
		}
		return eligible;
	}

	rollDice(): (CortexDie | null)[] {
		for (const die of this.dice) {
			if (die) die.roll();
		}
		return this.dice;
	}

	getHitchesDisplay(hitchOn = 1): string {
		return `\nHitches: ` + this.hitchCount(hitchOn);
	}

	getOnlyTotal(rolls: CortexDie[] | null = null, keep = 2, hitchOn = 1, displayHitches = false): string {
		if (!rolls) {
			rolls = this.eligibleDice(hitchOn);
			displayHitches = true;
		}
		let output = "";
		const only_total_addition = rolls.map((d) => d.values[0]).join(" + ");
		const only_total_1 = rolls.slice(0, keep).reduce((sum, d) => sum + d.values[0], 0);
		output += `Only Total: ${only_total_1} (${only_total_addition}) with Effect: D4`;
		if (displayHitches) {
			output += this.getHitchesDisplay(hitchOn);
		}
		return output;
	}

	getBestTotal(rolls: CortexDie[] | null = null, keep = 2, hitchOn = 1, displayHitches = false): string {
		if (!rolls) {
			rolls = this.eligibleDice(hitchOn);
			displayHitches = true;
		}
		let output = "";
		const rollsSorted = [...rolls].sort((a, b) => b.values[0] - a.values[0]);
		const best_total_dice = rollsSorted.slice(0, keep);
		const best_effect_dice = rollsSorted.slice(keep).sort((a, b) => b.size - a.size);
		best_effect_dice.push(CORTEX_D4);
		const best_effect_1 = `D${best_effect_dice[0].size}`;
		const best_total_addition = best_total_dice.map((d) => d.values[0]).join(" + ");
		const best_total_1 = best_total_dice.reduce((sum, d) => sum + d.values[0], 0);
		output += `Best Total: ${best_total_1} (${best_total_addition}) with Effect: ${best_effect_1}`;
		if (displayHitches) {
			output += this.getHitchesDisplay(hitchOn);
		}
		return output;
	}

	getBestEffect(rolls: CortexDie[] | null = null, keep = 2, hitchOn = 1, displayHitches = false): string {
		if (!rolls) {
			rolls = this.eligibleDice(hitchOn);
			displayHitches = true;
		}
		let output = "";
		const rollsSorted = [...rolls].sort((a, b) => {
			if (a.size !== b.size) {
				return b.size - a.size;
			}
			return a.values[0] - b.values[0];
		});
		const best_effect_2 = `D${rollsSorted[0].size}`;
		const best_total_dice_2 = rollsSorted.slice(1).sort((a, b) => b.values[0] - a.values[0]).slice(0, keep);
		const best_total_addition_2 = best_total_dice_2.map((d) => d.values[0]).join(" + ");
		const best_total_2 = best_total_dice_2.reduce((sum, d) => sum + d.values[0], 0);
		output += `Best Effect: ${best_effect_2} with Total: ${best_total_2} (${best_total_addition_2})`;
		if (displayHitches) {
			output += this.getHitchesDisplay(hitchOn);
		}
		return output;
	}

	getBest(rolls: CortexDie[] | null = null, keep = 2, hitchOn = 1, displayHitches = false): string {
		if (!rolls) {
			rolls = this.eligibleDice(hitchOn);
			displayHitches = true;
		}
		let output = "";
		if (this.isBotch()) {
			output += "\nBotch!";
			return output;
		} else if (rolls.length <= keep) {
			output += "\n";
			output += this.getOnlyTotal(rolls, keep, hitchOn, displayHitches);
		} else {
			if (!displayHitches) output += "\n";
			output += this.getBestTotal(rolls, keep, hitchOn, false);
			output += "\n";
			output += this.getBestEffect(rolls, keep, hitchOn, displayHitches);
		}
		return output;
	}

	results(dice: (CortexDie | null)[] | null = null, hitchOn = 1): string {
		if (!dice) {
			dice = this.dice;
		}
		let output = "";
		let separator = "";
		for (const die of dice) {
			if (die) {
				output += `${separator}D${die.size} : `;
				for (let i = 0; i < die.values.length; i++) {
					let roll_str = die.values[i].toString();
					if (die.values[i] <= hitchOn) {
						roll_str = "(" + roll_str + ")";
					}
					output += `${roll_str} `;
				}
				separator = "\n";
			}
		}
		return output;
	}

	roll(suggest_best = true, keep = 2, hitchOn = 1, displayHitches = true): string {
		this.rollDice();
		let output = this.results(this.dice, hitchOn);
		const rolls = this.eligibleDice(hitchOn);
		if (suggest_best) {
			output += "\n" + this.getBest(rolls, keep, hitchOn, displayHitches);
		} else if (displayHitches) {
			output += this.getHitchesDisplay(hitchOn);
		}
		return output;
	}

	output(): string {
		if (this.is_empty()) {
			return "empty";
		}
		return (this.dice.filter(Boolean) as CortexDie[]).map((die) => die.output()).join(", ");
	}
}

export const cortexPal = {
	Die: CortexDie,
	DicePool: CortexDicePool,
	DIE_SIZES: DIE_SIZES,
};
