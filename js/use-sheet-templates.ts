import { computed, type ComputedRef, type Ref } from 'vue';
import { cloneDeep } from './clone-deep.ts';
import { characterCurioFunctions } from './functions.ts';
import {
	getCuriosityGame,
	getTemplateTitle,
	getView,
	type Character,
	type SheetTemplate,
	type Trait,
	type TraitSet,
} from './model.ts';
import { characterCurioStorage, type PreferencesRecord } from './storage.ts';
import type { ToastOptions } from './use-toast.ts';

declare const characterCurioLibraryTemplates: SheetTemplate[] | undefined;

export interface SheetTemplatesDeps {
	mode: Ref<string>;
	character: ComputedRef<Character | null>;
	characters: Ref<Character[]>;
	characterIndex: ComputedRef<number>;
	sheetTemplates: Ref<SheetTemplate[]>;
	prefs: Ref<PreferencesRecord>;
	initHistory: () => void;
	saveLocalData: () => void;
	showToast: (msg: string, options?: ToastOptions) => void;
}

export function downloadJson(filename: string, payload: unknown): void {
	const uri = encodeURI('data:application/json;charset=utf-8,' + JSON.stringify(payload, null, 2)).replace(/#/g, '%23');

	const link = document.createElement('a');
	document.body.appendChild(link); // Required for Firefox
	link.setAttribute('href', uri);
	link.setAttribute('download', filename);
	link.click();
	link.remove();
}

export function useSheetTemplates(deps: SheetTemplatesDeps) {
	const { mode, character, characters, characterIndex, sheetTemplates, prefs, initHistory, saveLocalData, showToast } =
		deps;

	let _libraryLoading: Promise<boolean> | null = null;

	// Templates resolve store-first, then the built-in library.
	// Static ids dedupe: re-imports replace, never append.
	function ensureLibraryTemplates(): Promise<boolean> {
		if (typeof characterCurioLibraryTemplates !== 'undefined') return Promise.resolve(true);
		if (_libraryLoading) return _libraryLoading;
		_libraryLoading = new Promise<boolean>((resolve) => {
			const script = document.createElement('script');
			// `?v=` is rewritten to the content hash of js/templates.bundle.js by
			// scripts/version-assets.js during `npm run build`.
			script.src = 'js/templates.bundle.js?v=33';
			script.onload = () => resolve(true);
			script.onerror = () => resolve(false);
			document.head.appendChild(script);
		});
		return _libraryLoading;
	}

	function resolveTemplateEntry(id: string | null, version?: number | null): SheetTemplate | null {
		if (!id) return null;
		const store = sheetTemplates.value || [];
		if (version) {
			const snap = store.find((t) => t.id === id && (t.version || 1) === version);
			if (snap) return snap;
			const builtin = characterCurioFunctions.findLibraryTemplate(id);
			if (builtin && (builtin.version || 1) === version) return builtin;
			if (builtin) return builtin; // degraded: snapshot lost, use current
			const matches = store.filter((t) => t.id === id).sort((a, b) => (b.version || 1) - (a.version || 1));
			return matches[0] || null;
		}
		const matches = store.filter((t) => t.id === id).sort((a, b) => (b.version || 1) - (a.version || 1));
		if (matches.length) return matches[0];
		const builtin = characterCurioFunctions.findLibraryTemplate(id);
		if (builtin) return builtin;
		return null;
	}

	// Preference layer (D11): arrangement lives here, applied
	// after every merge so user arrangement always wins.
	function charPrefs(charId: string) {
		if (!prefs.value) prefs.value = { version: 1, global: {}, characters: {} };
		if (!prefs.value.characters[charId]) prefs.value.characters[charId] = {};
		return prefs.value.characters[charId];
	}

	function applyPrefs(characterData: Character): Character {
		if (!characterData || !characterData.id) return characterData;
		const cp = prefs.value && prefs.value.characters ? prefs.value.characters[characterData.id] : null;
		if (!cp) return characterData;
		if (Array.isArray(cp.setOrder) && cp.setOrder.length && Array.isArray(characterData.traitSets)) {
			const byId = new Map<string, TraitSet>();
			characterData.traitSets.forEach((ts) => {
				if (ts && ts.id && !byId.has(ts.id)) byId.set(ts.id, ts);
			});
			const ordered: TraitSet[] = [];
			cp.setOrder.forEach((id) => {
				const match = byId.get(id);
				if (match) {
					ordered.push(match);
					byId.delete(id);
				}
			});
			byId.forEach((ts) => ordered.push(ts));
			characterData.traitSets.forEach((ts) => {
				if (!ordered.includes(ts)) ordered.push(ts);
			});
			characterData.traitSets = ordered;
		}
		if (cp.traitOrders && Array.isArray(characterData.traitSets)) {
			characterData.traitSets.forEach((ts) => {
				const order = ts && ts.id ? cp.traitOrders?.[ts.id] : null;
				if (!Array.isArray(order) || !order.length || !Array.isArray(ts.traits)) return;
				const byLid = new Map<string, Trait>();
				ts.traits.forEach((tr) => {
					if (tr && tr._lid && !byLid.has(tr._lid)) byLid.set(tr._lid, tr);
				});
				const ordered: Trait[] = [];
				order.forEach((lid) => {
					const match = byLid.get(lid);
					if (match) {
						ordered.push(match);
						byLid.delete(lid);
					}
				});
				byLid.forEach((tr) => ordered.push(tr));
				ts.traits.forEach((tr) => {
					if (!ordered.includes(tr)) ordered.push(tr);
				});
				ts.traits = ordered;
			});
		}
		return characterData;
	}

	function recordCharOrder(characterData: Character): void {
		if (!characterData || !characterData.id) return;
		const cp = charPrefs(characterData.id);
		if (!Array.isArray(characterData.traitSets)) return;
		cp.setOrder = characterData.traitSets.map((ts) => ts && ts.id).filter((id): id is string => Boolean(id));
		cp.traitOrders = cp.traitOrders || {};
		characterData.traitSets.forEach((ts) => {
			if (ts && ts.id && Array.isArray(ts.traits)) {
				cp.traitOrders![ts.id] = ts.traits.map((tr) => tr && tr._lid).filter((lid): lid is string => Boolean(lid));
			}
		});
	}

	// Normalize one stored character: stable set ids, sheet.template
	// forms (full embed -> upsert + collapse to a pinned { id, version }),
	// snapshot-on-first-see for unversioned refs (D16), then merge +
	// internal ids + preferences.
	function resolveStoredCharacter(raw: unknown): Character {
		if (!raw || typeof raw !== 'object') return raw as Character;
		let c = raw as Character;
		characterCurioFunctions.ensureTraitSetIds(c);
		let ref: { id: string; version: number | null } | null = null;
		const t = c.sheet && c.sheet.template;
		if (t && typeof t === 'object') {
			if ('character' in t && t.character && t.id) {
				sheetTemplates.value = characterCurioStorage.upsertTemplate(
					sheetTemplates.value,
					t,
				) as unknown as SheetTemplate[];
				ref = { id: t.id, version: t.version || 1 };
				c.sheet = { template: { id: t.id, version: t.version || 1 } };
			} else if (t.id) {
				ref = { id: t.id, version: t.version || null };
				c.sheet = { template: t.version ? { id: t.id, version: t.version } : { id: t.id } };
			}
		}
		if (ref) {
			let entry = resolveTemplateEntry(ref.id, ref.version);
			if (entry) {
				const ver = ref.version || entry.version || 1;
				// Snapshot the exact pinned base into the store (D16):
				// a later bundle update must never move existing
				// characters until the user accepts the switch.
				const inStore = (sheetTemplates.value || []).some((s) => s.id === entry!.id && (s.version || 1) === ver);
				if (!inStore && characterCurioFunctions.findLibraryTemplate(entry.id) === entry) {
					sheetTemplates.value = characterCurioStorage.upsertTemplate(
						sheetTemplates.value,
						entry,
					) as unknown as SheetTemplate[];
				}
				ref = { id: ref.id, version: ver };
				c.sheet = { template: { id: ref.id, version: ver } };
				entry = resolveTemplateEntry(ref.id, ref.version) || entry;
			}
			if (entry) {
				const templateChar = characterCurioFunctions.findTemplateCharacter(entry);
				if (templateChar && c.sets) {
					// Layered storage form: fold content onto the template.
					c = characterCurioFunctions.materializeCharacter(c, templateChar) as Character;
					c.sheet = ref.version ? { template: { id: ref.id, version: ref.version } } : { template: { id: ref.id } };
				} else {
					c = characterCurioFunctions.mergeTemplateIntoCharacter(c, entry);
				}
			} else if (c.sets) {
				c = characterCurioFunctions.materializeCharacter(c, null) as Character;
			}
		} else if (c.sets && !Array.isArray(c.traitSets)) {
			c = characterCurioFunctions.materializeCharacter(c, null) as Character;
		}
		if (c.curiosities && typeof c.curiosities === 'object' && !Array.isArray(c.curiosities)) {
			for (const [cid, sub] of Object.entries(c.curiosities)) {
				const subObj = sub as Character | null | undefined;
				if (subObj && typeof subObj === 'object') {
					if (subObj.sets && !Array.isArray(subObj.traitSets)) {
						c.curiosities[cid] = characterCurioFunctions.materializeCharacter(subObj, null) as Character;
					}
					if (!c.curiosities[cid].id) c.curiosities[cid].id = cid;
				}
			}
		}
		characterCurioFunctions.ensureTraitSetIds(c);
		characterCurioFunctions.assignLids(c);
		applyPrefs(c);
		return c;
	}

	// Template version switch prompt (D16): the bundle moved on but
	// this character still resolves against its pinned snapshot.
	const pendingTemplateUpdate = computed(() => {
		if (mode.value !== 'character' || !character.value) return null;
		const t = character.value.sheet && character.value.sheet.template;
		const id = t && typeof t === 'object' ? t.id : null;
		if (!id) return null;
		const pinned = (t && typeof t === 'object' && t.version) || 1;
		if (typeof characterCurioLibraryTemplates === 'undefined') return null;
		const builtin = characterCurioFunctions.findLibraryTemplate(id);
		if (!builtin) return null;
		const current = builtin.version || 1;
		if (current <= pinned) return null;
		const declined =
			prefs.value && prefs.value.characters && prefs.value.characters[character.value.id]
				? prefs.value.characters[character.value.id].declinedTemplateVersions
				: null;
		if (declined && declined[id] && declined[id] >= current) return null;
		return { id: id, pinned: pinned, current: current };
	});

	function importSheetTemplate(entry: SheetTemplate | null | undefined): void {
		if (!entry || !entry.id) return;
		if (!characterCurioFunctions.isValidCurrentCharacter(entry)) {
			showToast(characterCurioFunctions.INVALID_FILE_MESSAGE, { tone: 'error' });
			return;
		}
		sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, {
			...cloneDeep(entry),
			userSaved: true,
		}) as unknown as SheetTemplate[];
		saveLocalData();
		showToast(`Saved layout template “${getTemplateTitle(entry) || entry.id}”`);
	}

	function deleteSheetTemplate(id: string): void {
		if (!id) return;
		const removed = (sheetTemplates.value || []).find((t) => t?.id === id);
		sheetTemplates.value = (sheetTemplates.value || []).filter((t) => t?.id !== id);
		saveLocalData();
		showToast(
			'Removed saved template',
			removed
				? {
						actionLabel: 'Undo',
						onAction: () => {
							sheetTemplates.value = characterCurioStorage.upsertTemplate(
								sheetTemplates.value,
								removed,
							) as unknown as SheetTemplate[];
							saveLocalData();
						},
					}
				: undefined,
		);
	}

	// D16 switch: rebase pure overrides (strip vs pinned snapshot)
	// onto the newer bundle version, then re-merge and re-apply
	// preferences. Stay records a decline so it stops nagging.
	async function applyTemplateUpdate(): Promise<void> {
		const u = pendingTemplateUpdate.value;
		if (!u || !character.value) return;
		await ensureLibraryTemplates();
		const oldEntry = resolveTemplateEntry(u.id, u.pinned);
		const newEntry = characterCurioFunctions.findLibraryTemplate(u.id);
		if (!newEntry) return;
		const stripped = oldEntry
			? characterCurioFunctions.stripCharacterToDeltas(character.value, oldEntry)
			: cloneDeep(character.value);
		const rebased = characterCurioFunctions.mergeTemplateIntoCharacter(stripped, newEntry);
		rebased.sheet = { template: { id: u.id, version: newEntry.version || 1 } };
		characterCurioFunctions.assignLids(rebased);
		characters.value[characterIndex.value] = rebased;
		applyPrefs(rebased);
		recordCharOrder(rebased);
		initHistory();
		saveLocalData();
		showToast('Layout updated — your content and arrangement were kept');
	}

	function stayOnTemplateSnapshot(): void {
		const u = pendingTemplateUpdate.value;
		if (!u || !character.value) return;
		const cp = charPrefs(character.value.id);
		cp.declinedTemplateVersions = cp.declinedTemplateVersions || {};
		cp.declinedTemplateVersions[u.id] = u.current;
		saveLocalData();
		showToast('Staying on your saved layout version');
	}

	function sheetTemplateForExport(characterData: Character | null | undefined): SheetTemplate | null {
		if (!characterData) return null;
		const t = characterData.sheet && characterData.sheet.template;
		const ref = t && typeof t === 'object' ? { id: t.id, version: t.version || null } : null;
		if (!ref || !ref.id) return null;
		if (t && typeof t === 'object' && 'character' in t && t.character) return t as SheetTemplate;
		return resolveTemplateEntry(ref.id, ref.version);
	}

	function fallbackTemplateTitle(characterData: Character): string | undefined {
		return (
			getView(characterData)?.listing?.title ||
			(getCuriosityGame(characterData)
				? undefined
				: characterData.name
					? `${characterData.name} Layout`
					: 'Custom Layout')
		);
	}

	function saveSheetTemplate(): void {
		const characterData = character.value;
		if (!characterData) return;
		const currentRef =
			characterData.sheet && characterData.sheet.template && typeof characterData.sheet.template === 'object'
				? characterData.sheet.template.id
				: null;
		// Re-saving a custom template updates it in place (version bump);
		// forking off a built-in (or nothing) mints a fresh static id.
		const reuse = currentRef && !characterCurioFunctions.findLibraryTemplate(currentRef) ? currentRef : null;
		const prev = reuse ? resolveTemplateEntry(reuse) : null;
		const entry = characterCurioFunctions.extractSheetTemplate(characterData, {
			id: reuse || undefined,
			version: reuse ? ((prev && prev.version) || 1) + 1 : 1,
			title: fallbackTemplateTitle(characterData),
		});
		sheetTemplates.value = characterCurioStorage.upsertTemplate(sheetTemplates.value, {
			...cloneDeep(entry),
			userSaved: true,
		}) as unknown as SheetTemplate[];
		characterData.sheet = { template: { id: entry.id, version: entry.version } };
		saveLocalData();
		showToast(`Saved layout as reusable template`);
	}

	function exportSheetTemplate(): void {
		const characterData = character.value;
		if (!characterData) return;
		const ref =
			characterData.sheet && characterData.sheet.template && typeof characterData.sheet.template === 'object'
				? characterData.sheet.template.id
				: null;
		let entry = ref ? resolveTemplateEntry(ref) : null;
		if (!entry)
			entry = characterCurioFunctions.extractSheetTemplate(characterData, {
				title: fallbackTemplateTitle(characterData),
			});
		const slug = String(getTemplateTitle(entry) || entry.id || 'template').replace(/\s+/g, '_');
		downloadJson(`${slug}.curio-template.json`, entry);
	}

	return {
		ensureLibraryTemplates,
		resolveTemplateEntry,
		charPrefs,
		applyPrefs,
		recordCharOrder,
		resolveStoredCharacter,
		pendingTemplateUpdate,
		importSheetTemplate,
		deleteSheetTemplate,
		applyTemplateUpdate,
		stayOnTemplateSnapshot,
		sheetTemplateForExport,
		fallbackTemplateTitle,
		saveSheetTemplate,
		exportSheetTemplate,
	};
}
