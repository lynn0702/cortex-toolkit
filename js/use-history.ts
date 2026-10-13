import { computed, nextTick } from 'vue';
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
	showToast: ( msg: string ) => void;
	saveLocalData: () => void;
}

export function useHistory( deps: HistoryDeps ) {
	const {
		mode, character, characters, characterIndex, editing,
		isNavigatingHistory, history, historyIndex, showToast, saveLocalData,
	} = deps;

	const canUndo = computed( () => {
		if ( mode.value !== 'character' ) return false;
		if ( historyIndex.value > 0 ) return true;
		if ( character.value && historyIndex.value >= 0 ) {
			return history.value[ historyIndex.value ] !== JSON.stringify( character.value );
		}
		return false;
	} );

	const canRedo = computed( () => mode.value === 'character' && historyIndex.value < history.value.length - 1 );

	function initHistory() {
		if ( character.value ) {
			history.value = [ JSON.stringify( character.value ) ];
			historyIndex.value = 0;
		} else {
			history.value = [];
			historyIndex.value = -1;
		}
	}

	function commitHistorySnapshot() {
		if ( isNavigatingHistory.value || !character.value ) return;
		const snap = JSON.stringify( character.value );
		if ( historyIndex.value >= 0 && history.value[ historyIndex.value ] === snap ) return;
		if ( historyIndex.value < history.value.length - 1 ) {
			history.value = history.value.slice( 0, historyIndex.value + 1 );
		}
		history.value.push( snap );
		if ( history.value.length > 50 ) {
			history.value.shift();
		} else {
			historyIndex.value++;
		}
	}

	function validateEditing( characterData: any ) {
		if ( !editing.value || !editing.value.length || !characterData ) return;
		const [ type, s, t ] = editing.value;
		if ( type === 'traitSet' && !characterData.traitSets?.[ s ] ) {
			editing.value = [];
		} else if ( type === 'trait' && !characterData.traitSets?.[ s ]?.traits?.[ t ] ) {
			editing.value = [];
		}
	}

	function undo() {
		commitHistorySnapshot();
		if ( !canUndo.value ) return;
		isNavigatingHistory.value = true;
		historyIndex.value--;
		const restored = JSON.parse( history.value[ historyIndex.value ] );
		characters.value[ characterIndex.value ] = restored;
		validateEditing( restored );
		saveLocalData();
		showToast( 'Undo' );
		nextTick( () => { isNavigatingHistory.value = false; } );
	}

	function redo() {
		if ( !canRedo.value ) return;
		isNavigatingHistory.value = true;
		historyIndex.value++;
		const restored = JSON.parse( history.value[ historyIndex.value ] );
		characters.value[ characterIndex.value ] = restored;
		validateEditing( restored );
		saveLocalData();
		showToast( 'Redo' );
		nextTick( () => { isNavigatingHistory.value = false; } );
	}

	return { canUndo, canRedo, initHistory, commitHistorySnapshot, validateEditing, undo, redo };
}
