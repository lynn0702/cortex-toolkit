import { computed, nextTick, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';

export interface HistoryDeps {
	mode: Ref<string>;
	character: ComputedRef<any>;
	characters: Ref<any[]>;
	characterIndex: ComputedRef<number>;
	editing: Ref<any>;
	isNavigatingHistory: Ref<boolean>;
	history: Ref<string[]>;
	historyIndex: Ref<number>;
	showToast: (msg: string) => void;
	saveLocalData: () => void;
}

export function useHistory(deps: HistoryDeps) {
	const {
		mode,
		character,
		characters,
		characterIndex,
		editing,
		isNavigatingHistory,
		history,
		historyIndex,
		showToast,
		saveLocalData,
	} = deps;

	const hasUncommittedChanges = ref(false);

	function markDirty() {
		hasUncommittedChanges.value = true;
	}

	const canUndo = computed(() => {
		if (mode.value !== 'character') return false;
		if (historyIndex.value > 0) return true;
		return Boolean(character.value && historyIndex.value >= 0 && hasUncommittedChanges.value);
	});

	const canRedo = computed(() => mode.value === 'character' && historyIndex.value < history.value.length - 1);

	function initHistory() {
		hasUncommittedChanges.value = false;
		if (character.value) {
			history.value = [JSON.stringify(character.value)];
			historyIndex.value = 0;
		} else {
			history.value = [];
			historyIndex.value = -1;
		}
	}

	function commitHistorySnapshot() {
		if (isNavigatingHistory.value || !character.value) return;
		hasUncommittedChanges.value = false;
		const snap = JSON.stringify(character.value);
		if (historyIndex.value >= 0 && history.value[historyIndex.value] === snap) return;
		if (historyIndex.value < history.value.length - 1) {
			history.value = history.value.slice(0, historyIndex.value + 1);
		}
		history.value.push(snap);
		if (history.value.length > 50) {
			history.value.shift();
		} else {
			historyIndex.value++;
		}
	}

	function validateEditing(characterData: any) {
		if (!editing.value || !editing.value.length || !characterData) return;
		const [type, s, ...rest] = editing.value;
		if (type === 'traitSet' && !characterData.traitSets?.[s]) {
			editing.value = [];
		} else if (type === 'trait' || type === 'subtrait') {
			const set = characterData.traitSets?.[s];
			if (!set || !Array.isArray(set.traits)) {
				editing.value = [];
				return;
			}
			const indices = type === 'subtrait' && rest.length === 1 ? [0, Number(rest[0])] : rest.map(Number);
			let list: any[] | undefined = set.traits;
			for (const idx of indices) {
				if (!Array.isArray(list) || !list[idx]) {
					editing.value = [];
					return;
				}
				list = list[idx].traits;
			}
		}
	}

	function undo() {
		commitHistorySnapshot();
		if (!canUndo.value) return;
		hasUncommittedChanges.value = false;
		isNavigatingHistory.value = true;
		historyIndex.value--;
		const restored = JSON.parse(history.value[historyIndex.value]);
		characters.value[characterIndex.value] = restored;
		validateEditing(restored);
		saveLocalData();
		showToast('Undo');
		nextTick(() => {
			isNavigatingHistory.value = false;
		});
	}

	function redo() {
		if (!canRedo.value) return;
		hasUncommittedChanges.value = false;
		isNavigatingHistory.value = true;
		historyIndex.value++;
		const restored = JSON.parse(history.value[historyIndex.value]);
		characters.value[characterIndex.value] = restored;
		validateEditing(restored);
		saveLocalData();
		showToast('Redo');
		nextTick(() => {
			isNavigatingHistory.value = false;
		});
	}

	return { canUndo, canRedo, initHistory, commitHistorySnapshot, markDirty, validateEditing, undo, redo };
}
