import { toRaw, type ComputedRef, type Ref } from 'vue';
import { cloneDeep } from './clone-deep.ts';
import { characterCurioFunctions, type SetPresetEntry } from './functions.ts';
import type { SheetTemplate } from './model.ts';
import { characterCurioStorage, type CustomSetPresetRecord, type PreferencesRecord } from './storage.ts';
import type { ToastOptions } from './use-toast.ts';

export interface PersistOptions {
	allowSessionCharacterSave?: boolean;
	allowSessionOnlyInPreview?: boolean;
}

export interface PersistenceDeps {
	characters: Ref<Record<string, unknown>[]>;
	characterID: Ref<string | null>;
	openCharacterIDs: Ref<string[]>;
	isPreview: ComputedRef<boolean>;
	submode: Ref<string | null>;
	sheetTemplates: Ref<Record<string, unknown>[]>;
	customSetPresets: Ref<SetPresetEntry[]>;
	prefs: Ref<PreferencesRecord>;
	playViewMode: Ref<string>;
	panelPosition: Ref<'left' | 'right'>;
	storeReady: Ref<boolean>;
	storeError: Ref<unknown>;
	showPlaySaveConfirm: Ref<boolean>;
	baselineCharacters: Map<string, string>;
	ensureLibraryTemplates: () => Promise<boolean>;
	resolveTemplateEntry: (id: string | null, version?: number | null) => SheetTemplate | null;
	resolveStoredCharacter: (raw: unknown) => Record<string, unknown>;
	initBaseline: (chars: Record<string, unknown>[]) => void;
	cancelDeferredSave: () => void;
	showToast: (msg: string, options?: ToastOptions) => void;
}

function normalizePlayViewMode(mode: unknown): 'split' | 'tabs' {
	return mode === 'tabs' ? 'tabs' : 'split';
}

export function usePersistence(deps: PersistenceDeps) {
	const {
		characters,
		characterID,
		openCharacterIDs,
		isPreview,
		submode,
		sheetTemplates,
		customSetPresets,
		prefs,
		playViewMode,
		panelPosition,
		storeReady,
		storeError,
		showPlaySaveConfirm,
		baselineCharacters,
		ensureLibraryTemplates,
		resolveTemplateEntry,
		resolveStoredCharacter,
		initBaseline,
		cancelDeferredSave,
		showToast,
	} = deps;

	// Last successful save: characters keyed by id (storage form as JSON) and
	// the session JSON. The next save skips no-ops and upserts only what changed.
	let lastSavedCharacters: Record<string, string> | null = null;
	let lastSavedSession: string | null = null;

	async function bootFromStorage(): Promise<void> {
		storeReady.value = false;
		storeError.value = null;

		try {
			const stored = await characterCurioStorage.load();
			sheetTemplates.value = characterCurioStorage.normalizeTemplates(stored.templates) as Record<string, unknown>[];
			const loadedPresets: CustomSetPresetRecord[] = characterCurioStorage.normalizePresets(stored.presets);
			customSetPresets.value = cloneDeep(loadedPresets);
			characterCurioFunctions.setCustomSetPresets(loadedPresets, { notify: false });
			prefs.value = characterCurioStorage.normalizePreferences(stored.preferences);
			await ensureLibraryTemplates();
			const storedChars = (stored.characters || []) as Record<string, unknown>[];
			characters.value = storedChars.map((c) => resolveStoredCharacter(c));
			initBaseline(characters.value);
			lastSavedCharacters = {};
			storedChars.forEach((c) => {
				if (c && c.id != null) {
					lastSavedCharacters![String(c.id)] = JSON.stringify(c);
				}
			});
			playViewMode.value = stored.playViewMode || 'split';
			panelPosition.value =
				stored.rollerPosition === 'left' || stored.rollerPosition === 'right' ? stored.rollerPosition : 'right';
			openCharacterIDs.value = (stored.openCharacterIDs || []).filter((id: string) =>
				characters.value.some((c) => c.id === id),
			);
			if (characterID.value && !openCharacterIDs.value.includes(characterID.value)) {
				openCharacterIDs.value.push(characterID.value);
			}
			lastSavedSession = JSON.stringify({
				openCharacterIDs: openCharacterIDs.value,
				playViewMode: normalizePlayViewMode(playViewMode.value),
				rollerPosition: panelPosition.value,
				templates: characterCurioStorage.pruneTemplates(sheetTemplates.value, characters.value),
				presets: customSetPresets.value,
				preferences: prefs.value,
			});
			if (stored.loadError) {
				storeError.value = stored.loadError;
				showToast('Saved data was damaged — starting fresh. Export backups regularly.', { tone: 'warn' });
			}
		} catch (err: unknown) {
			storeError.value = err;
			showToast('Could not open the local library — starting empty.', { tone: 'error' });
		}

		characterCurioStorage.requestPersistence();
	}

	async function persist(options?: PersistOptions): Promise<void> {
		if (isPreview.value && !options?.allowSessionOnlyInPreview) return;
		let upsert: Record<string, unknown>[] = [];
		let remove: string[] = [];
		let session: {
			openCharacterIDs: string[];
			playViewMode: 'split' | 'tabs';
			rollerPosition: 'left' | 'right';
			templates: unknown[];
			presets: CustomSetPresetRecord[];
			preferences: unknown;
		};
		let snapshot: Record<string, string> | null = null;
		let sessionJson: string | null = null;

		try {
			await ensureLibraryTemplates();
			const sparse = (characters.value || []).map((c) => {
				const sheet = c.sheet as { template?: { id?: string; version?: number | null } } | undefined;
				const ct = sheet && sheet.template;
				const ref = ct && typeof ct === 'object' && ct.id ? { id: ct.id, version: ct.version || null } : null;
				// Strip against the PINNED version (the base this
				// character was merged from), never the newer bundle.
				const entry = ref ? resolveTemplateEntry(ref.id, ref.version) : null;
				const templateChar = entry ? characterCurioFunctions.findTemplateCharacter(entry) : null;
				let out: Record<string, unknown>;
				if (entry && templateChar) {
					// Layered storage: lossless content + per-entity
					// override entity (presentation is preserved), pinned ref.
					const delta = characterCurioFunctions.stripCharacterToDeltas(c, entry);
					out = characterCurioFunctions.toLayeredEntity(delta) as Record<string, unknown>;
				} else {
					// Standalone / no template: keep the array form.
					out = cloneDeep(c);
				}
				// Storage form keeps a pinned { id, version } reference —
				// the full template object lives in the template store
				// (embedded only on file export).
				if (ref && ref.id) {
					out.sheet = ref.version ? { template: { id: ref.id, version: ref.version } } : { template: { id: ref.id } };
				} else {
					delete out.sheet;
				}
				return characterCurioFunctions.orderCharacterKeys(out) as Record<string, unknown>;
			});

			session = cloneDeep({
				openCharacterIDs: openCharacterIDs.value,
				playViewMode: normalizePlayViewMode(playViewMode.value),
				rollerPosition: panelPosition.value,
				templates: characterCurioStorage.pruneTemplates(sheetTemplates.value, characters.value),
				presets: customSetPresets.value,
				preferences: prefs.value,
			});

			// Dirty diff against the last save: whole entries by id, never
			// field-merged. New ids are upserts; vanished ids are deletes.
			const curr: Record<string, string> = {};
			const currObj: Record<string, Record<string, unknown>> = {};
			sparse.forEach((c) => {
				if (c && c.id != null) {
					const id = String(c.id);
					curr[id] = JSON.stringify(c);
					currObj[id] = c;
				}
			});
			if (lastSavedCharacters) {
				for (const id of Object.keys(curr)) {
					if (lastSavedCharacters[id] !== curr[id]) upsert.push(currObj[id]);
				}
				for (const id of Object.keys(lastSavedCharacters)) {
					if (curr[id] === undefined) remove.push(id);
				}
			} else {
				// No baseline yet (first save since boot): upsert the roster,
				// then the merge keeps anything this tab does not know about.
				upsert = sparse.filter((c) => c && c.id != null);
			}

			// Persist gating in Play or Preview:
			const isCharacterGated = isPreview.value || (submode.value === 'play' && !options?.allowSessionCharacterSave);
			if (isCharacterGated) {
				upsert = [];
				remove = [];
			}

			sessionJson = JSON.stringify(session);
			// No-op gate: nothing changed since the last save, no write.
			if (!upsert.length && !remove.length && lastSavedSession === sessionJson) return;
			snapshot = isCharacterGated ? lastSavedCharacters || {} : curr;
		} catch {
			showToast('Could not save changes.', { tone: 'error' });
			return;
		}

		try {
			const result = await characterCurioStorage.saveChanges({ upsert, remove, session });
			if (result.merged && Array.isArray(result.presets)) {
				customSetPresets.value = cloneDeep(result.presets);
				characterCurioFunctions.setCustomSetPresets(result.presets, { notify: false });
				session.presets = result.presets;
				sessionJson = JSON.stringify(session);
			}
			lastSavedCharacters = snapshot;
			lastSavedSession = sessionJson;
			if (!isPreview.value && (submode.value !== 'play' || options?.allowSessionCharacterSave)) {
				const changedIds = new Set(upsert.filter((u) => u && u.id != null).map((u) => String(u.id)));
				for (const c of characters.value) {
					if (c && c.id != null) {
						const id = String(c.id);
						if (changedIds.has(id) || !baselineCharacters.has(id)) {
							baselineCharacters.set(id, JSON.stringify(toRaw(c)));
						}
					}
				}
			}
			if (result.merged) showToast('Merged changes from another tab.');
		} catch (err: unknown) {
			const e = err as { name?: string; code?: number; message?: string } | null;
			if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
				showToast('Local storage is full — export a backup, then remove large images.', { tone: 'error' });
			} else if (
				e &&
				/blocked|unavailable|security|denied|invalidstate/i.test((e.name || '') + ' ' + (e.message || ''))
			) {
				showToast('Browser storage is blocked — check site settings, then export a backup.', { tone: 'error' });
			} else {
				showToast('Could not save changes. Export a backup to be safe.', { tone: 'error' });
			}
		}
	}

	function saveLocalData(): Promise<void> {
		cancelDeferredSave();
		if (submode.value === 'play') {
			showPlaySaveConfirm.value = true;
			return Promise.resolve();
		}
		return persist();
	}

	return {
		bootFromStorage,
		persist,
		saveLocalData,
	};
}
