import { dicePool, type DiceItem, type DicePool } from '../js/dice-pool.ts';
import type { Character, Trait, TraitSet } from '../js/model.ts';

export function asRecord(value: unknown): Record<string, unknown> {
	return (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
}

export function makeTrait(overrides: Partial<Trait> & Record<string, unknown> = {}): Trait {
	return {
		name: 'Trait',
		traits: [],
		...overrides,
	} as Trait;
}

export function makeTraitSet(overrides: Partial<TraitSet> & Record<string, unknown> = {}): TraitSet {
	return {
		id: typeof overrides.id === 'string' ? overrides.id : 'set-1',
		name: 'Set',
		traits: [],
		...overrides,
	} as TraitSet;
}

export function makeCharacter(overrides: Partial<Character> & Record<string, unknown> = {}): Character {
	return {
		id: typeof overrides.id === 'string' ? overrides.id : 'char-1',
		name: 'Test Character',
		traitSets: [],
		...overrides,
	} as Character;
}

export function makePool(items: Array<Partial<DiceItem>> = []): DicePool {
	const pool = new dicePool.DicePool();
	for (const item of items) {
		pool.add(item);
	}
	return pool;
}
