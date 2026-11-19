import type { ComputedRef, Ref } from 'vue';
import { characterCurioFunctions, type SetPresetEntry } from './functions.ts';
import { characterCurioStorage, type PreferencesRecord } from './storage.ts';
import {
	getCuriosityGame,
	getTemplateTitle,
	getView,
	type Character as CharacterModel,
	type SheetTemplate,
} from './model.ts';
import type { ToastOptions } from './use-toast.ts';

export interface UseRosterActionsDeps {
	characters: Ref<CharacterModel[]>;
	characterID: Ref<string | null>;
	openCharacterIDs: Ref<string[]>;
	webTrailIds: Ref<string[]>;
	submode: Ref<string | null>;
	sheetTemplates: Ref<SheetTemplate[]>;
	customSetPresets: Ref<SetPresetEntry[]>;
	prefs: Ref<PreferencesRecord>;
	previewCharacter: Ref<CharacterModel | null>;
	previewTemplateEntry: Ref<SheetTemplate | null>;
	previewDismissed: Ref<boolean>;
	totalStagedDiceCount: ComputedRef<number>;
	manuallyRemovedPoolKeys: Set<string>;
	cloneDeep: <T>(val: T) => T;
	ensureLibraryTemplates: () => Promise<boolean>;
	resolveTemplateEntry: (id: string, version?: number | null) => SheetTemplate | null;
	sheetTemplateForExport: (c: CharacterModel) => SheetTemplate | null;
	downloadJson: (filename: string, data: unknown) => void;
	recordCharOrder: (c: CharacterModel) => void;
	applyPrefs: (c: CharacterModel) => void;
	saveOpenCharacterIDs: () => void;
	syncSessionPools: (preferredOwnerId?: string | null) => void;
	initHistory: () => void;
	setMode: (m: string, sub: string | null, updateHash?: boolean) => void;
	setPageTitle: () => void;
	touchCharacter: (id: string) => void;
	saveLocalData: () => void;
	persist: () => void;
	showToast: (message: string, opts?: ToastOptions) => void;
}

export function useRosterActions(deps: UseRosterActionsDeps) {
	const {
		characters,
		characterID,
		openCharacterIDs,
		webTrailIds,
		submode,
		sheetTemplates,
		customSetPresets,
		prefs,
		previewCharacter,
		previewTemplateEntry,
		previewDismissed,
		totalStagedDiceCount,
		manuallyRemovedPoolKeys,
		cloneDeep,
		ensureLibraryTemplates,
		resolveTemplateEntry,
		sheetTemplateForExport,
		downloadJson,
		recordCharOrder,
		applyPrefs,
		saveOpenCharacterIDs,
		syncSessionPools,
		initHistory,
		setMode,
		setPageTitle,
		touchCharacter,
		saveLocalData,
		persist,
		showToast,
	} = deps;

	function createCharacter(isTemplate: boolean | string = false, templateId?: string | null) {
		if (previewCharacter.value) {
			previewCharacter.value = null;
			previewTemplateEntry.value = null;
			previewDismissed.value = true;
		}
		let asTemplate = false;
		let targetTemplateId: string | null = null;
		if (typeof isTemplate === 'boolean') {
			asTemplate = isTemplate;
			targetTemplateId = templateId || null;
		} else if (typeof isTemplate === 'string') {
			targetTemplateId = isTemplate;
			asTemplate = false;
		}

		if (targetTemplateId) {
			const template = characters.value.find((c) => c.id === targetTemplateId);
			if (template) {
				const currentRef =
					template.sheet && template.sheet.template && typeof template.sheet.template === 'object'
						? template.sheet.template.id
						: null;
				const reuse =
					currentRef && !characterCurioFunctions.findLibraryTemplate(currentRef) ? currentRef : 'custom-' + template.id;
				const entry = characterCurioFunctions.extractSheetTemplate(template, {
					id: reuse,
					version: 1,
					title:
						getView(template)?.listing?.title ||
						(!getCuriosityGame(template) ? template.name || 'Template' : undefined),
				});
				sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, {
					...cloneDeep(entry),
					userSaved: true,
				}) as unknown as SheetTemplate[];

				const now = new Date().toISOString();
				const entity = {
					name: asTemplate ? template.name || 'New Template' : '',
					sets: {},
					template: { id: entry.id, version: entry.version || 1 },
					id: characterCurioFunctions.generateUUID(),
					...(asTemplate ? { isTemplate: true } : {}),
					dateCreated: now,
					dateModified: now,
					dateTouched: now,
				};
				let characterData: CharacterModel = characterCurioFunctions.materializeCharacter(
					entity,
					entry.character,
				) as CharacterModel;
				characterData.sheet = { template: { id: entry.id, version: entry.version || 1 } };
				characterData = characterCurioFunctions.orderCharacterKeys(characterData);
				characterCurioFunctions.ensureTraitSetIds(characterData);
				characterCurioFunctions.assignLids(characterData);
				recordCharOrder(characterData);

				characters.value.push(characterData);
				webTrailIds.value = [characterData.id];
				characterID.value = characterData.id;
				if (!openCharacterIDs.value.includes(characterData.id)) {
					openCharacterIDs.value.push(characterData.id);
				}
				saveOpenCharacterIDs();
				initHistory();
				setMode('character', submode.value ?? 'edit', true);

				saveLocalData();
				showToast(
					asTemplate
						? `Created template from "${template.name || 'Template'}"`
						: `Created sheet from "${template.name || 'Template'}"`,
				);
				return;
			}
		}

		let characterData: CharacterModel = structuredClone(
			characterCurioFunctions.defaultCharacter,
		) as unknown as CharacterModel;

		characterData.id = characterCurioFunctions.generateUUID();
		if (asTemplate) {
			characterData.isTemplate = true;
			characterData.name = 'New Template';
		} else {
			delete characterData.isTemplate;
		}

		const now = new Date().toISOString();
		characterData.dateCreated = now;
		characterData.dateModified = now;
		characterData.dateTouched = now;
		characterData = characterCurioFunctions.orderCharacterKeys(characterData);
		characterCurioFunctions.ensureTraitSetIds(characterData);
		characterCurioFunctions.assignLids(characterData);

		characters.value.push(characterData);
		webTrailIds.value = [characterData.id];
		characterID.value = characterData.id;
		if (!openCharacterIDs.value.includes(characterData.id)) {
			openCharacterIDs.value.push(characterData.id);
		}
		saveOpenCharacterIDs();
		if (totalStagedDiceCount.value === 0) {
			syncSessionPools(characterData.id);
		}
		initHistory();
		setMode('character', templateId ? (submode.value ?? 'edit') : 'edit', true);

		saveLocalData();
	}

	function createTemplate() {
		createCharacter(true);
	}

	function createFromTemplate(templateId: string) {
		createCharacter(false, templateId);
	}

	function createFromLibrary(libraryItem: SheetTemplate | null | undefined, asTemplate = false, openPrint = false) {
		if (!libraryItem || !libraryItem.character) return;

		const itemTitle = getTemplateTitle(libraryItem);
		const now = new Date().toISOString();
		const entity = {
			name: asTemplate ? (itemTitle ? itemTitle.replace(/\s*\([^)]*\)/g, '').trim() : 'Template') : '',
			sets: {},
			template: { id: libraryItem.id, version: libraryItem.version || 1 },
			id: characterCurioFunctions.generateUUID(),
			...(asTemplate ? { isTemplate: true } : {}),
			dateCreated: now,
			dateModified: now,
			dateTouched: now,
		};
		const characterData: CharacterModel = characterCurioFunctions.materializeCharacter(
			entity,
			libraryItem.character,
		) as CharacterModel;
		characterCurioFunctions.ensureTraitSetIds(characterData);
		characterCurioFunctions.assignLids(characterData);
		sheetTemplates.value = characterCurioStorage.upsertTemplate(
			sheetTemplates.value,
			cloneDeep(libraryItem),
		) as unknown as SheetTemplate[];
		recordCharOrder(characterData);

		characters.value.push(characterData);
		webTrailIds.value = [characterData.id];
		characterID.value = characterData.id;
		if (!openCharacterIDs.value.includes(characterData.id)) {
			openCharacterIDs.value.push(characterData.id);
		}
		saveOpenCharacterIDs();
		initHistory();

		if (openPrint) {
			setMode('character', 'print', true);
		} else {
			setMode('character', 'edit', true);
		}

		saveLocalData();
		showToast(asTemplate ? `Added "${itemTitle}" to templates` : `Created character from "${itemTitle}"`);
	}

	function toggleTemplate(characterId: string) {
		const characterIndex = characters.value.findIndex((c) => c.id === characterId);
		if (characterIndex === -1) return;
		const characterData = characters.value[characterIndex];
		if (characterData.isTemplate) {
			delete characterData.isTemplate;
		} else {
			characterData.isTemplate = true;
		}
		characterData.dateModified = new Date().toISOString();
		characters.value[characterIndex] = characterCurioFunctions.orderCharacterKeys(characterData);
		saveLocalData();
		showToast(characterData.isTemplate ? 'Saved as template' : 'Converted to regular character');
	}

	function deleteCharacter(id: string) {
		openCharacterIDs.value = openCharacterIDs.value.filter((x: string) => x !== id);
		saveOpenCharacterIDs();

		const c = characters.value.findIndex((characterData) => characterData.id === id);
		if (c === -1) return;

		characters.value.splice(c, 1);
		if (prefs.value && prefs.value.characters) delete prefs.value.characters[id];

		if (characterID.value === id) {
			if (openCharacterIDs.value.length) {
				characterID.value = openCharacterIDs.value[0];
				initHistory();
			} else {
				characterID.value = null;
				setMode('roster', null, true);
			}
		}

		setPageTitle();
		saveLocalData();
	}

	function deleteAllCharacters() {
		const count = characters.value.length;
		characters.value = [];
		characterID.value = null;
		openCharacterIDs.value = [];
		if (prefs.value) prefs.value.characters = {};
		saveOpenCharacterIDs();
		setMode('roster', null, true);
		setPageTitle();
		saveLocalData();
		showToast(`Deleted all ${count} characters`);
	}

	function duplicateCharacter(id: string) {
		const original = characters.value.find((characterData) => characterData.id === id);
		if (!original) return;

		const characterData = cloneDeep(original);
		characterData.id = characterCurioFunctions.generateUUID();
		characterData.name = characterData.name && characterData.name.length ? `${characterData.name} (Copy)` : 'Copy';
		characterCurioFunctions.stripInternalIds(characterData);
		characterCurioFunctions.ensureTraitSetIds(characterData);
		characterCurioFunctions.assignLids(characterData);
		recordCharOrder(characterData);
		characterData.dateCreated = new Date().toISOString();
		characterData.dateModified = new Date().toISOString();
		characterData.dateTouched = new Date().toISOString();

		characters.value.push(characterData);
		saveLocalData();
	}

	function loadCharacter(id: string, targetSubmode?: string | null) {
		if (previewCharacter.value) {
			previewCharacter.value = null;
			previewTemplateEntry.value = null;
			previewDismissed.value = true;
		}
		const wasAllEmpty = totalStagedDiceCount.value === 0;
		manuallyRemovedPoolKeys.delete('owner:' + String(id));
		if (!openCharacterIDs.value.includes(id)) {
			openCharacterIDs.value.push(id);
		}
		webTrailIds.value = [id];
		characterID.value = id;
		touchCharacter(id);
		saveOpenCharacterIDs();
		syncSessionPools(wasAllEmpty ? id : null);
		persist();
		initHistory();
		setMode('character', targetSubmode ?? submode.value ?? 'edit', true);
	}

	function importCharacter(characterData: unknown) {
		if (!characterCurioFunctions.isValidCurrentCharacter(characterData)) {
			showToast(characterCurioFunctions.INVALID_FILE_MESSAGE, { tone: 'error' });
			return;
		}
		let incoming = characterData as CharacterModel & { prefs?: unknown };
		const tref = incoming && incoming.sheet && incoming.sheet.template;
		if (tref && typeof tref === 'object') {
			let tplEntry: SheetTemplate | null = null;
			if ('character' in tref && tref.character && tref.id) {
				sheetTemplates.value = characterCurioStorage.upsertTemplate(
					sheetTemplates.value,
					tref,
				) as unknown as SheetTemplate[];
				tplEntry = tref as SheetTemplate;
			} else if (tref.id) {
				tplEntry = resolveTemplateEntry(tref.id, tref.version || null);
			}
			const templateChar = tplEntry ? characterCurioFunctions.findTemplateCharacter(tplEntry) : null;
			if (templateChar && tplEntry) {
				const layered =
					incoming &&
					!Array.isArray(incoming.traitSets) &&
					incoming.sets &&
					typeof incoming.sets === 'object' &&
					!Array.isArray(incoming.sets)
						? incoming
						: characterCurioFunctions.toLayeredEntity(incoming);
				incoming = characterCurioFunctions.materializeCharacter(layered, templateChar) as CharacterModel;
				incoming.sheet = { template: { id: tplEntry.id, version: tplEntry.version || 1 } };
			} else if (tplEntry) {
				incoming = characterCurioFunctions.mergeTemplateIntoCharacter(incoming, tplEntry);
			}
		} else if (
			incoming &&
			!Array.isArray(incoming.traitSets) &&
			incoming.sets &&
			typeof incoming.sets === 'object' &&
			!Array.isArray(incoming.sets)
		) {
			incoming = characterCurioFunctions.materializeCharacter(incoming) as CharacterModel;
		}
		if (typeof incoming.id !== 'string' || !incoming.id.length) {
			incoming.id = characterCurioFunctions.generateUUID();
		}
		if (typeof incoming.name !== 'string') {
			incoming.name = '';
		}
		characterCurioFunctions.ensureTraitSetIds(incoming);
		characterCurioFunctions.assignLids(incoming);

		const c = characters.value.findIndex((existingCharacter) => existingCharacter.id === incoming.id);
		const embeddedHostIdx =
			c === -1
				? characters.value.findIndex(
						(root) =>
							root?.curiosities && typeof root.curiosities === 'object' && Boolean(root.curiosities[incoming.id]),
					)
				: -1;
		const now = new Date().toISOString();
		const prev =
			c !== -1
				? characters.value[c]
				: embeddedHostIdx !== -1
					? characters.value[embeddedHostIdx].curiosities?.[incoming.id]
					: null;
		if (!incoming.dateCreated) {
			incoming.dateCreated = prev?.dateCreated || now;
		}
		if (!incoming.dateModified) {
			incoming.dateModified = now;
		}
		if (!incoming.dateTouched) {
			incoming.dateTouched = now;
		}
		incoming = characterCurioFunctions.orderCharacterKeys(incoming);

		if (c !== -1) {
			characters.value[c] = incoming;
		} else if (embeddedHostIdx !== -1) {
			const host = characters.value[embeddedHostIdx];
			if (host.curiosities) {
				host.curiosities[incoming.id] = incoming;
			}
			host.dateModified = now;
		} else {
			characters.value.push(incoming);
		}

		if (incoming.prefs && typeof incoming.prefs === 'object') {
			const live = characterCurioFunctions.prefsFromImport(
				incoming.prefs as Parameters<typeof characterCurioFunctions.prefsFromImport>[0],
				incoming,
			);
			if (live) {
				if (!prefs.value) prefs.value = { version: 1, global: {}, characters: {} };
				prefs.value.characters[incoming.id] = live;
			} else if (prefs.value && prefs.value.characters) {
				delete prefs.value.characters[incoming.id];
			}
			delete incoming.prefs;
		} else {
			recordCharOrder(incoming);
		}
		applyPrefs(incoming);
		touchCharacter(incoming.id);
		saveLocalData();
		showToast(`Imported ${incoming.name || 'character'}`);
	}

	async function exportCharacter(id: string) {
		const characterData = characters.value.find((c) => c.id === id);
		if (!characterData) return;

		await ensureLibraryTemplates();
		const entry = sheetTemplateForExport(characterData);
		let out = characterCurioFunctions.stripCharacterForExport(characterData, entry);
		const filePrefs = characterCurioFunctions.prefsForExport(
			prefs.value && prefs.value.characters ? prefs.value.characters[characterData.id] : null,
			characterData,
		);
		if (filePrefs) out.prefs = filePrefs;
		out = characterCurioFunctions.orderCharacterKeys(out);

		let name = out.name && out.name.length ? out.name : 'Name';
		const timestamp = new Date(out.dateModified || Date.now()).getTime() || Date.now();
		name = name.replaceAll(/\s+/g, '_');
		const filename = `${name}_${timestamp}.curio.json`;

		downloadJson(filename, out);
	}

	function importSetPresets(entries: SetPresetEntry[]) {
		const { importedCount } = characterCurioFunctions.upsertCustomSetPresets(entries);
		if (importedCount > 0) {
			showToast(`Imported ${importedCount} ${importedCount === 1 ? 'preset' : 'presets'}`);
		}
	}

	async function exportAllCharacters() {
		await ensureLibraryTemplates();
		const out = (characters.value || []).map((c) => {
			const entry = sheetTemplateForExport(c);
			const o = characterCurioFunctions.stripCharacterForExport(c, entry);
			const filePrefs = characterCurioFunctions.prefsForExport(
				prefs.value && prefs.value.characters ? prefs.value.characters[c.id] : null,
				c,
			);
			if (filePrefs) o.prefs = filePrefs;
			return characterCurioFunctions.orderCharacterKeys(o);
		});
		const exportedPresets = characterCurioStorage.normalizePresets(customSetPresets.value);

		const bundle = {
			version: '0.2',
			type: 'bundle',
			dateExported: new Date().toISOString(),
			count: out.length,
			characters: out,
			presets: cloneDeep(exportedPresets),
		};

		const timestamp = new Date().getTime();
		const filename = `Character_Curio_Bundle_${timestamp}.json`;

		downloadJson(filename, bundle);
		showToast(
			exportedPresets.length > 0
				? `Exported ${out.length} curiosities and ${exportedPresets.length} ${exportedPresets.length === 1 ? 'preset' : 'presets'}`
				: `Exported ${out.length} curiosities`,
		);
	}

	return {
		createCharacter,
		createTemplate,
		createFromTemplate,
		createFromLibrary,
		toggleTemplate,
		deleteCharacter,
		deleteAllCharacters,
		duplicateCharacter,
		loadCharacter,
		importCharacter,
		exportCharacter,
		importSetPresets,
		exportAllCharacters,
	};
}
