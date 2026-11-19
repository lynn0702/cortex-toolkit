import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { dicePool as dicePoolModel, type DiceItem, type NamedPool } from './dice-pool.ts';
import { characterCurioFunctions } from './functions.ts';
import { hasPlotPoints, resolveCurrencyLabel, resolvePlotPoints, type Character } from './model.ts';
import type { ToastOptions } from './use-toast.ts';

export interface SessionPoolsDeps {
	mode: Ref<string>;
	submode: Ref<string | null>;
	character: ComputedRef<Character | null>;
	characters: Ref<Character[]>;
	previewCharacter: Ref<Character | null>;
	openCharacters: ComputedRef<Character[]>;
	isStudioPanelOpen: Ref<boolean>;
	studioPanelTab: Ref<'properties' | 'roller' | 'json'>;
	isNarrowViewport: () => boolean;
	updateCharacter: (characterData: Character) => void;
	persist: () => void;
	showToast: (msg: string, options?: ToastOptions) => void;
}

export function useSessionPools(deps: SessionPoolsDeps) {
	const {
		mode,
		submode,
		character,
		characters,
		previewCharacter,
		openCharacters,
		isStudioPanelOpen,
		studioPanelTab,
		isNarrowViewport,
		updateCharacter,
		persist,
		showToast,
	} = deps;

	const fallbackDicePool = ref(new dicePoolModel.DicePool());
	const oppositionPool = ref(new dicePoolModel.DicePool());
	const activeRollerSide = ref<'player' | 'opposition'>('player');
	const namedPools = ref<NamedPool[]>([]);
	const activePoolId = ref<string>('');
	const explicitlyAddedPoolIds = new Set<string>();
	const manuallyRemovedPoolKeys = new Set<string>();

	function resolveOwnerCuriosity(ownerId: string | null | undefined): Character | null {
		if (!ownerId) return null;
		const targetId = String(ownerId);
		if (previewCharacter.value) {
			if (String(previewCharacter.value.id) === targetId) return previewCharacter.value;
			if (previewCharacter.value.curiosities?.[targetId]) return previewCharacter.value.curiosities[targetId];
		}
		for (const c of characters.value) {
			if (!c) continue;
			if (String(c.id) === targetId) return c;
			if (c.curiosities && typeof c.curiosities === 'object' && c.curiosities[targetId]) {
				return c.curiosities[targetId];
			}
		}
		return null;
	}

	const activeNamedPool = computed<NamedPool | null>(
		() => namedPools.value.find((p) => p.id === activePoolId.value) || namedPools.value[0] || null,
	);

	const dicePool = computed(() => activeNamedPool.value?.pool || fallbackDicePool.value);

	const totalStagedDiceCount = computed(() =>
		namedPools.value.reduce((sum, entry) => sum + (entry.pool?.items?.length || 0), 0),
	);

	const nonEmptyNamedPools = computed(() => namedPools.value.filter((entry) => (entry.pool?.items?.length || 0) > 0));

	const activePlayPlotPoints = computed(() => {
		if (submode.value === 'play' && activeNamedPool.value) {
			const owner = resolveOwnerCuriosity(activeNamedPool.value.ownerId);
			if (owner) return resolvePlotPoints(owner);
			if (typeof activeNamedPool.value.plotPoints === 'number') {
				return Math.max(0, Math.floor(activeNamedPool.value.plotPoints));
			}
			return 0;
		}
		return character.value ? resolvePlotPoints(character.value) : 0;
	});

	function resolveEntityPpBaseLabel(entity: Character | null | undefined): string {
		return resolveCurrencyLabel(entity);
	}

	const activePlayPlotPointsLabel = computed(() => {
		if (submode.value === 'play' && activeNamedPool.value) {
			const owner = resolveOwnerCuriosity(activeNamedPool.value.ownerId);
			const base = resolveEntityPpBaseLabel(owner);
			const isSingleMatchingOwner =
				owner &&
				character.value &&
				String(owner.id) === String(character.value.id) &&
				namedPools.value.filter((p) => p.id !== 'opposition').length <= 1;
			if (isSingleMatchingOwner) return base;
			const resolvedOwnerName = owner
				? String(owner.name || 'Unnamed').trim() || 'Unnamed'
				: activeNamedPool.value.ownerName;
			return `${resolvedOwnerName} ${base}`;
		}
		return resolveEntityPpBaseLabel(character.value);
	});

	const showPlayPlotPoints = computed(() => {
		if (mode.value !== 'character' || (submode.value !== 'play' && submode.value !== 'edit')) {
			return false;
		}
		if (submode.value === 'play') {
			if (!activeNamedPool.value) return Boolean(character.value && hasPlotPoints(character.value));
			const owner = resolveOwnerCuriosity(activeNamedPool.value.ownerId);
			if (owner) return hasPlotPoints(owner);
			return typeof activeNamedPool.value.plotPoints === 'number' && Number.isFinite(activeNamedPool.value.plotPoints);
		}
		return Boolean(character.value && hasPlotPoints(character.value));
	});

	const rollerCuriosities = computed(() => {
		const seen = new Set<string>();
		const list: Character[] = [];
		const add = (c: Character | null | undefined) => {
			if (!c || typeof c !== 'object' || c.isTemplate) return;
			const id = String(c.id || '');
			if (id && seen.has(id)) return;
			if (id) seen.add(id);
			list.push(c);
			if (c.curiosities && typeof c.curiosities === 'object') {
				for (const sub of Object.values(c.curiosities)) add(sub);
			}
		};
		for (const oc of openCharacters.value) add(oc);
		for (const c of characters.value) add(c);
		return list;
	});

	function syncSessionPools(preferCharacterId?: string | null): void {
		const targets = openCharacters.value;
		const targetIds = new Set(targets.map((c) => String(c?.id || '')).filter(Boolean));
		const next: NamedPool[] = [];

		// Keep existing pools unless they are empty session pools for closed sheets
		for (const entry of namedPools.value) {
			if (entry.ownerId) {
				const owner = resolveOwnerCuriosity(entry.ownerId);
				if (owner) {
					entry.ownerName = String(owner.name || 'Unnamed').trim() || 'Unnamed';
				}
				const isEmpty = (entry.pool?.items?.length || 0) === 0 && (entry.pool?.wordBank?.length || 0) === 0;
				if (!owner || (!targetIds.has(String(entry.ownerId)) && isEmpty && !explicitlyAddedPoolIds.has(entry.id))) {
					continue;
				}
			}
			next.push(entry);
		}

		// Ensure every open sheet in the session has a NamedPool (inserted before Opposition)
		for (const c of targets) {
			if (!c || !c.id) continue;
			const cid = String(c.id);
			if (manuallyRemovedPoolKeys.has('owner:' + cid)) continue;
			if (!next.some((p) => p.ownerId && String(p.ownerId) === cid)) {
				const created = dicePoolModel.createNamedPool(String(c.name || 'Unnamed').trim() || 'Unnamed', cid);
				const oppIdx = next.findIndex((p) => p.id === 'opposition');
				if (oppIdx !== -1) {
					next.splice(oppIdx, 0, created);
				} else {
					next.push(created);
				}
			}
		}

		// Ensure default Opposition pool exists unless manually removed
		if (!manuallyRemovedPoolKeys.has('opposition') && !next.some((p) => p.id === 'opposition')) {
			next.push({
				id: 'opposition',
				ownerId: null,
				ownerName: 'Opposition',
				pool: oppositionPool.value,
			});
		}

		// Fallback if everything was removed
		if (next.length === 0) {
			next.push({
				id: 'opposition',
				ownerId: null,
				ownerName: 'Opposition',
				pool: oppositionPool.value,
			});
		}

		namedPools.value = next;

		if (preferCharacterId) {
			const preferred = next.find((p) => p.ownerId && String(p.ownerId) === String(preferCharacterId));
			if (preferred) {
				activePoolId.value = preferred.id;
				activeRollerSide.value = 'player';
				return;
			}
		}

		if (!activePoolId.value || !next.some((p) => p.id === activePoolId.value)) {
			const forCurrent =
				character.value && next.find((p) => p.ownerId && String(p.ownerId) === String(character.value?.id));
			const chosen = forCurrent || next[0];
			activePoolId.value = chosen?.id || '';
			activeRollerSide.value = chosen?.id === 'opposition' ? 'opposition' : 'player';
		}
	}

	watch(
		[openCharacters, character, () => character.value?.name],
		() => {
			syncSessionPools();
		},
		{ immediate: true },
	);

	function selectActivePoolId(poolId: string): void {
		if (!poolId) return;
		activePoolId.value = poolId;
		activeRollerSide.value = poolId === 'opposition' ? 'opposition' : 'player';
	}

	function handleActivePoolSideChange(side: 'player' | 'opposition'): void {
		activeRollerSide.value = side;
		if (side === 'opposition') {
			const opp = namedPools.value.find((p) => p.id === 'opposition') || namedPools.value[1];
			if (opp) activePoolId.value = opp.id;
		} else if (activePoolId.value === 'opposition') {
			const primary = namedPools.value.find((p) => p.id !== 'opposition') || namedPools.value[0];
			if (primary) activePoolId.value = primary.id;
		}
	}

	function cycleActiveNamedPool(): void {
		if (namedPools.value.length <= 1) return;
		const idx = Math.max(
			0,
			namedPools.value.findIndex((p) => p.id === activePoolId.value),
		);
		const next = namedPools.value[(idx + 1) % namedPools.value.length];
		if (next) selectActivePoolId(next.id);
	}

	function handleAddNamedPool(payload: { ownerId: string | null; ownerName: string; withPP?: boolean }): void {
		if (payload.ownerId) {
			const cid = String(payload.ownerId);
			manuallyRemovedPoolKeys.delete('owner:' + cid);
			const existing = namedPools.value.find((p) => p.ownerId && String(p.ownerId) === cid);
			if (existing) {
				selectActivePoolId(existing.id);
				return;
			}
			const owner = resolveOwnerCuriosity(cid);
			const created = dicePoolModel.createNamedPool(
				String(owner?.name || payload.ownerName || 'Unnamed').trim() || 'Unnamed',
				cid,
			);
			explicitlyAddedPoolIds.add(created.id);
			const oppIdx = namedPools.value.findIndex((p) => p.id === 'opposition');
			if (oppIdx !== -1) {
				namedPools.value.splice(oppIdx, 0, created);
			} else {
				namedPools.value.push(created);
			}
			selectActivePoolId(created.id);
			return;
		}

		const cleanName = String(payload.ownerName || '').trim();
		if (!cleanName) return;
		if (cleanName.toLowerCase() === 'opposition' && !namedPools.value.some((p) => p.id === 'opposition')) {
			manuallyRemovedPoolKeys.delete('opposition');
			const oppEntry: NamedPool = {
				id: 'opposition',
				ownerId: null,
				ownerName: 'Opposition',
				pool: oppositionPool.value,
				...(payload.withPP ? { plotPoints: 1 } : {}),
			};
			namedPools.value.push(oppEntry);
			selectActivePoolId(oppEntry.id);
			return;
		}
		const created = dicePoolModel.createNamedPool(cleanName, null, payload.withPP ? 1 : undefined);
		explicitlyAddedPoolIds.add(created.id);
		namedPools.value.push(created);
		selectActivePoolId(created.id);
	}

	function handleRemoveNamedPool(poolId: string): void {
		if (namedPools.value.length <= 1) return;
		const idx = namedPools.value.findIndex((p) => p.id === poolId);
		if (idx === -1) return;
		const removed = namedPools.value[idx];
		explicitlyAddedPoolIds.delete(removed.id);
		if (removed.id === 'opposition') {
			manuallyRemovedPoolKeys.add('opposition');
		} else if (removed.ownerId) {
			manuallyRemovedPoolKeys.add('owner:' + String(removed.ownerId));
		}
		removed.pool?.clear?.();
		namedPools.value.splice(idx, 1);
		if (activePoolId.value === poolId) {
			const fallback = namedPools.value[Math.max(0, idx - 1)] || namedPools.value[0];
			if (fallback) selectActivePoolId(fallback.id);
		}
	}

	function persistOwnerMutation(owner: Character | null | undefined): void {
		if (!owner) return;
		if (character.value && String(character.value.id) === String(owner.id)) {
			updateCharacter(owner);
			return;
		}
		const topIdx = characters.value.findIndex((c) => c && String(c.id) === String(owner.id));
		if (topIdx !== -1) {
			owner.dateModified = new Date().toISOString();
			characters.value[topIdx] = characterCurioFunctions.orderCharacterKeys(owner);
			persist();
			return;
		}
		// Nested curiosity inside a parent root
		for (let i = 0; i < characters.value.length; i++) {
			const parent = characters.value[i];
			if (parent?.curiosities && parent.curiosities[owner.id]) {
				parent.dateModified = new Date().toISOString();
				persist();
				return;
			}
		}
		persist();
	}

	function handleTogglePoolPP(poolId: string): void {
		const entry = namedPools.value.find((p) => p.id === poolId);
		if (!entry) return;
		const owner = resolveOwnerCuriosity(entry.ownerId);
		if (owner) {
			characterCurioFunctions.setPlotPoints(owner, hasPlotPoints(owner) ? null : 1);
			persistOwnerMutation(owner);
		} else {
			entry.plotPoints = typeof entry.plotPoints === 'number' ? null : 1;
		}
	}

	function addDieToRoller(dieData: Partial<DiceItem> | Partial<DiceItem>[]): void {
		if (namedPools.value.length === 0) {
			syncSessionPools();
		}
		const targetEntry = activeNamedPool.value;
		const targetPool = targetEntry ? targetEntry.pool : dicePool.value;
		targetPool.add(dieData);
		if (submode.value === 'play' && !isNarrowViewport()) {
			isStudioPanelOpen.value = true;
			studioPanelTab.value = 'roller';
		}
		let label: string;
		if (Array.isArray(dieData)) {
			const poolName = dieData[0]?.source || 'Pool';
			label = `${dieData.length} dice (${poolName})`;
		} else {
			label = dieData.source ? dieData.source : `d${dieData.size}`;
		}
		const ownerTag = targetEntry ? `${targetEntry.ownerName} pool` : 'dice pool';
		showToast(`Added ${label} to ${ownerTag}`);
	}

	function removeDieFromRoller(index: number): void {
		const target = activeNamedPool.value?.pool || dicePool.value;
		target.removeAt(index);
	}

	function clearDicePool(): void {
		for (const entry of namedPools.value) {
			entry.pool.clear();
		}
		fallbackDicePool.value.clear();
	}

	function clearOppositionPool(): void {
		oppositionPool.value.clear();
	}

	function handleSettlePP(delta: number, poolId?: string): void {
		if (delta === 0) return;
		if (submode.value === 'play' || poolId) {
			const target = (poolId ? namedPools.value.find((p) => p.id === poolId) : activeNamedPool.value) || null;
			if (target) {
				const owner = resolveOwnerCuriosity(target.ownerId);
				if (owner) {
					const currentPP = characterCurioFunctions.resolvePlotPoints(owner);
					characterCurioFunctions.setPlotPoints(owner, Math.max(0, currentPP + delta));
					persistOwnerMutation(owner);
					return;
				}
				if (typeof target.plotPoints === 'number') {
					target.plotPoints = Math.max(0, target.plotPoints + delta);
					return;
				}
			}
		}
		if (character.value) {
			const currentPP = characterCurioFunctions.resolvePlotPoints(character.value);
			characterCurioFunctions.setPlotPoints(character.value, Math.max(0, currentPP + delta));
			updateCharacter(character.value);
		}
	}

	return {
		fallbackDicePool,
		oppositionPool,
		activeRollerSide,
		namedPools,
		activePoolId,
		manuallyRemovedPoolKeys,
		activeNamedPool,
		dicePool,
		totalStagedDiceCount,
		nonEmptyNamedPools,
		activePlayPlotPoints,
		activePlayPlotPointsLabel,
		showPlayPlotPoints,
		rollerCuriosities,
		syncSessionPools,
		selectActivePoolId,
		handleActivePoolSideChange,
		cycleActiveNamedPool,
		handleAddNamedPool,
		handleRemoveNamedPool,
		handleTogglePoolPP,
		addDieToRoller,
		removeDieFromRoller,
		clearDicePool,
		clearOppositionPool,
		handleSettlePP,
	};
}
