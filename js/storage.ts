/**
 * Character Curio persistent storage. TypeScript leaf.
 *
 * Primary backend is IndexedDB (large quota, structured data, eviction-safe
 * when persistence is granted). If IndexedDB is unavailable, falls back to
 * localStorage with quota errors surfaced to the caller.
 */
import { cloneDeep } from './clone-deep.ts';

export interface CustomSetPresetRecord {
	id: string;
	label: string;
	blurb?: string;
	preset: Record<string, unknown>;
}

export interface SheetTemplateRecord {
	id: string;
	version?: number;
	userSaved?: boolean;
	character?: { traitSets?: unknown[]; [key: string]: unknown };
	[key: string]: unknown;
}

export interface CharacterPreferences {
	setOrder?: string[];
	traitOrders?: Record<string, string[]>;
	declinedTemplateVersions?: Record<string, number>;
	[k: string]: unknown;
}

export interface PreferencesRecord {
	version: number;
	global: Record<string, unknown>;
	characters: Record<string, CharacterPreferences>;
}

export interface StorageRecord {
	v: number;
	savedAt: string;
	characters: Record<string, unknown>[];
	openCharacterIDs: string[];
	playViewMode: 'split' | 'tabs';
	rollerPosition: 'left' | 'right';
	templates: SheetTemplateRecord[];
	presets: CustomSetPresetRecord[];
	preferences: PreferencesRecord;
}

export interface StorageState {
	characters: Record<string, unknown>[];
	openCharacterIDs: string[];
	playViewMode: 'split' | 'tabs';
	rollerPosition: 'left' | 'right';
	templates: SheetTemplateRecord[];
	presets: CustomSetPresetRecord[];
	preferences: PreferencesRecord;
	loadError?: unknown;
}

// Granular save payload: whole character entries are upserted/deleted by
// id — never field-merged — plus the session fields the app owns. This is
// what makes a stale tab's save a merge instead of a clobber.
export interface SaveChanges {
	upsert: unknown[];
	remove: string[];
	session: {
		openCharacterIDs: string[];
		playViewMode: 'split' | 'tabs';
		rollerPosition: 'left' | 'right';
		templates: unknown[];
		presets?: unknown[];
		preferences: unknown;
	};
}

export interface CharacterCurioStorage {
	DB_NAME: string;
	DB_VERSION: number;
	STORE_NAME: string;
	RECORD_KEY: string;
	FALLBACK_KEY: string;
	_dbPromise: Promise<IDBDatabase> | null;
	_useIDB: boolean;
	_lastSavedAt: string | null;
	_lastTemplates: SheetTemplateRecord[] | null;
	_lastPresets: CustomSetPresetRecord[] | null;
	templateKey(t: unknown): string;
	normalizeTemplates(templates: unknown): SheetTemplateRecord[];
	upsertTemplate(templates: unknown, entry: unknown): SheetTemplateRecord[];
	pruneTemplates(templates: unknown, characters: unknown): SheetTemplateRecord[];
	normalizePresets(presets: unknown): CustomSetPresetRecord[];
	upsertPreset(presets: unknown, entry: unknown): CustomSetPresetRecord[];
	mergePresets(stored: unknown, current: unknown, baseline: unknown): CustomSetPresetRecord[];
	normalizePreferences(prefs: unknown): PreferencesRecord;
	openDB(): Promise<IDBDatabase>;
	normalizeCharacters(characters: unknown): Record<string, unknown>[];
	fallbackRecord(): StorageRecord | null;
	readRecord(): Promise<StorageRecord | null>;
	writeRecord(record: StorageRecord): Promise<{ backend: string }>;
	applyChanges(base: unknown[], upsert: unknown[], remove: string[]): Record<string, unknown>[];
	mergeTemplates(stored: unknown[], current: unknown[], baseline: unknown[]): SheetTemplateRecord[];
	transactReadModifyWrite(
		modify: (current: StorageRecord | null) => { record: StorageRecord; merged: boolean },
	): Promise<{ record: StorageRecord; merged: boolean }>;
	load(): Promise<StorageState>;
	save(state: Partial<StorageState>): Promise<{ backend: string }>;
	saveChanges(changes: SaveChanges): Promise<{ backend: string; merged: boolean; presets?: CustomSetPresetRecord[] }>;
	clear(): Promise<void>;
	requestPersistence(): Promise<boolean>;
}

export const characterCurioStorage: CharacterCurioStorage = {
	DB_NAME: 'character-curio',
	DB_VERSION: 1,
	STORE_NAME: 'state',
	RECORD_KEY: 'app',

	// localStorage fallback holding the FULL record (same shape as the IDB
	// record) when IndexedDB is unavailable, keeping snapshots and
	// preferences intact across saves.
	FALLBACK_KEY: 'characterCurioFallback',

	_dbPromise: null as Promise<IDBDatabase> | null,
	_useIDB: typeof indexedDB !== 'undefined',
	_lastSavedAt: null as string | null,
	_lastTemplates: null as SheetTemplateRecord[] | null,
	_lastPresets: null as CustomSetPresetRecord[] | null,

	// Sheet-template registry (entry shape, same as the built-in library:
	// { id (static), version, title, ..., character: {...} }). Snapshots are
	// keyed by (id, version): re-imports replace the same version instead
	// of duplicating, and pinned older versions survive bundle updates.
	// Built-ins resolve live from the bundle and are never stored here.
	templateKey(t) {
		const rec = t as { id?: unknown; version?: unknown } | null | undefined;
		return (rec && rec.id) + '@' + ((rec && rec.version) || 1);
	},

	normalizeTemplates(templates) {
		if (!Array.isArray(templates)) return [];
		const seen = new Set<string>();
		const out: SheetTemplateRecord[] = [];
		for (const raw of templates) {
			if (!raw || typeof raw !== 'object') continue;
			const t = raw as SheetTemplateRecord;
			if (typeof t.id !== 'string' || !t.id.length) continue;
			if (!t.character || typeof t.character !== 'object' || !Array.isArray(t.character.traitSets)) continue;
			const key = this.templateKey(t);
			if (seen.has(key)) continue;
			seen.add(key);
			t.version ??= 1;
			out.push(t);
		}
		return out;
	},

	upsertTemplate(templates, entry) {
		const list = this.normalizeTemplates(templates);
		if (!entry || typeof entry !== 'object') return list;
		const rec = entry as SheetTemplateRecord;
		if (typeof rec.id !== 'string' || !rec.id.length) return list;
		rec.version ??= 1;
		const key = this.templateKey(rec);
		const i = list.findIndex((t) => this.templateKey(t) === key);
		const clean = cloneDeep(rec);
		if (i === -1) list.push(clean);
		else list[i] = clean;
		return list;
	},

	// Drop stored snapshots no character pins unless explicitly user-saved.
	pruneTemplates(templates, characters) {
		const list = this.normalizeTemplates(templates);
		const pinned = new Set<string>();
		(Array.isArray(characters) ? characters : []).forEach((raw) => {
			const c = raw as { sheet?: { template?: { id?: string; version?: number } } } | null | undefined;
			const t = c && c.sheet && c.sheet.template;
			if (!t || typeof t !== 'object' || !t.id) return;
			const ver = t.version || 1;
			pinned.add(t.id + '@' + ver);
		});
		return list.filter((t) => Boolean(t && t.userSaved) || pinned.has(this.templateKey(t)));
	},

	normalizePresets(presets) {
		if (!Array.isArray(presets)) return [];
		const seen = new Set<string>();
		const out: CustomSetPresetRecord[] = [];
		for (const raw of presets) {
			if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
			const p = raw as Record<string, unknown>;
			const id = typeof p.id === 'string' ? p.id.trim() : '';
			const label = typeof p.label === 'string' ? p.label.trim() : '';
			if (!id.length || !label.length) continue;
			if (!p.preset || typeof p.preset !== 'object' || Array.isArray(p.preset)) continue;
			if (seen.has(id)) continue;
			seen.add(id);
			const blurb = typeof p.blurb === 'string' ? p.blurb.trim() : '';
			out.push({
				id,
				label,
				...(blurb.length ? { blurb } : {}),
				preset: cloneDeep(p.preset as Record<string, unknown>),
			});
		}
		return out;
	},

	upsertPreset(presets, entry) {
		const list = this.normalizePresets(presets);
		const normalized = this.normalizePresets([entry]);
		if (!normalized.length) return list;
		const clean = normalized[0];
		const idx = list.findIndex((p) => p.id === clean.id);
		if (idx === -1) list.push(clean);
		else list[idx] = clean;
		return list;
	},

	mergePresets(stored, current, baseline) {
		const storedList = this.normalizePresets(stored);
		const currentList = this.normalizePresets(current);
		const currentById = new Map(currentList.map((p) => [p.id, p]));
		const baselineIds = new Set(
			(Array.isArray(baseline) ? baseline : [])
				.map((raw) => {
					const p = raw as { id?: unknown } | null | undefined;
					return p && typeof p.id === 'string' ? p.id.trim() : '';
				})
				.filter(Boolean),
		);
		const out: CustomSetPresetRecord[] = [];
		const seen = new Set<string>();
		for (const s of storedList) {
			if (currentById.has(s.id)) {
				out.push(currentById.get(s.id)!);
				seen.add(s.id);
			} else if (!baselineIds.has(s.id)) {
				out.push(s);
				seen.add(s.id);
			}
		}
		for (const c of currentList) {
			if (!seen.has(c.id)) {
				out.push(c);
				seen.add(c.id);
			}
		}
		return out;
	},

	// Preference layer (brief D11): per-character arrangement + declines.
	// Applied after the merge — user arrangement always wins. Shape:
	// { version: 1, global: {}, characters: { charId: {
	//   setOrder: [setId...], traitOrders: { setId: [lid...] },
	//   declinedTemplateVersions: { tplId: version } } } }
	normalizePreferences(prefs) {
		const out: PreferencesRecord = { version: 1, global: {}, characters: {} };
		if (!prefs || typeof prefs !== 'object') return out;
		const raw = prefs as {
			global?: Record<string, unknown>;
			characters?: Record<string, Record<string, unknown>>;
		};
		if (raw.global && typeof raw.global === 'object') out.global = raw.global;
		if (raw.characters && typeof raw.characters === 'object') {
			for (const cid of Object.keys(raw.characters)) {
				const cp = raw.characters[cid];
				if (!cp || typeof cp !== 'object') continue;
				const clean: CharacterPreferences = {};
				if (Array.isArray(cp.setOrder)) clean.setOrder = cp.setOrder.filter((x): x is string => typeof x === 'string');
				if (cp.traitOrders && typeof cp.traitOrders === 'object') {
					const traitOrders = cp.traitOrders as Record<string, unknown>;
					clean.traitOrders = {};
					for (const sid of Object.keys(traitOrders)) {
						const arr = traitOrders[sid];
						if (Array.isArray(arr)) clean.traitOrders[sid] = arr.filter((x): x is string => typeof x === 'string');
					}
				}
				if (cp.declinedTemplateVersions && typeof cp.declinedTemplateVersions === 'object') {
					const declined = cp.declinedTemplateVersions as Record<string, unknown>;
					clean.declinedTemplateVersions = {};
					for (const tid of Object.keys(declined)) {
						if (typeof declined[tid] === 'number') clean.declinedTemplateVersions[tid] = declined[tid];
					}
				}
				out.characters[cid] = clean;
			}
		}
		return out;
	},

	openDB() {
		if (!this._useIDB) return Promise.reject(new Error('IndexedDB unavailable.'));
		if (!this._dbPromise) {
			this._dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
				let request: IDBOpenDBRequest;
				try {
					request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
				} catch (err) {
					// Never poison future saves: a failed open rejects this
					// attempt only, so a transient lock heals on the next
					// save instead of failing every save after it.
					this._dbPromise = null;
					reject(err);
					return;
				}
				request.onupgradeneeded = (event) => {
					const db = (event.target as IDBOpenDBRequest).result;
					if (!db.objectStoreNames.contains(this.STORE_NAME)) {
						db.createObjectStore(this.STORE_NAME);
					}
				};
				request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
				request.onerror = () => {
					this._dbPromise = null;
					reject(new Error('Could not open local database.', { cause: request.error }));
				};
				request.onblocked = () => {
					this._dbPromise = null;
					reject(new Error('Local database is blocked by another tab.'));
				};
			});
		}
		return this._dbPromise;
	},

	normalizeCharacters(characters) {
		if (!Array.isArray(characters)) return [];
		return (structuredClone(characters) as unknown[])
			.map((raw) => {
				if (!raw || typeof raw !== 'object') return null;
				const c = raw as Record<string, unknown>;
				if (c.isTemplate && c.name) {
					c.name = String(c.name)
						.replace(/\s*\([^)]*\)/g, '')
						.trim();
				}
				return c;
			})
			.filter((c): c is Record<string, unknown> => c !== null);
	},

	// Synchronous full-record read of the localStorage fallback. The fallback
	// has no transactions, so its read-modify-write is atomic by construction.
	fallbackRecord(): StorageRecord | null {
		try {
			const raw = localStorage.getItem(this.FALLBACK_KEY);
			if (!raw) return null;
			return JSON.parse(raw) as StorageRecord;
		} catch {
			return null;
		}
	},

	// Newest complete record wins across the two backends: a fallback save
	// written while IDB was down supersedes a stale IDB copy, and vice versa.
	async readRecord(): Promise<StorageRecord | null> {
		let idb: StorageRecord | null = null;
		if (this._useIDB) {
			try {
				const db = await this.openDB();
				idb = await new Promise<StorageRecord | null>((resolve, reject) => {
					const tx = db.transaction(this.STORE_NAME, 'readonly');
					const store = tx.objectStore(this.STORE_NAME);
					const req = store.get(this.RECORD_KEY);
					req.onsuccess = () => resolve((req.result as StorageRecord | undefined) || null);
					req.onerror = () => reject(req.error || new Error('Could not read local database.'));
				});
			} catch {
				idb = null;
			}
		}
		const fallback = this.fallbackRecord();
		if (idb && fallback) {
			return String(fallback.savedAt || '') > String(idb.savedAt || '') ? fallback : idb;
		}
		return idb || fallback;
	},

	async writeRecord(record: StorageRecord): Promise<{ backend: string }> {
		if (this._useIDB) {
			try {
				const db = await this.openDB();
				await new Promise<void>((resolve, reject) => {
					const tx = db.transaction(this.STORE_NAME, 'readwrite');
					tx.oncomplete = () => resolve();
					tx.onerror = () => reject(new Error('Could not write local database.', { cause: tx.error }));
					tx.onabort = () => reject(new Error('Local database write aborted.', { cause: tx.error }));
					tx.objectStore(this.STORE_NAME).put(record, this.RECORD_KEY);
				});
				try {
					localStorage.removeItem(this.FALLBACK_KEY);
				} catch {
					// Best effort; a stale fallback is ignored while IDB reads back.
				}
				return { backend: 'indexeddb' };
			} catch {
				// Fall through to the full-record localStorage fallback below.
			}
		}
		try {
			localStorage.setItem(this.FALLBACK_KEY, JSON.stringify(record));
			return { backend: 'localstorage' };
		} catch (err: unknown) {
			const e = err as { name?: string; code?: number; isQuotaError?: boolean } | null;
			if (e && typeof e === 'object') {
				e.isQuotaError = e.name === 'QuotaExceededError' || e.code === 22;
			}
			throw err;
		}
	},

	// Merge granular save changes into a base character list: delete by id,
	// then upsert by id (whole entries — never field-merged). Base order is
	// preserved; new characters append at the end.
	applyChanges(base: unknown[], upsert: unknown[], remove: string[]): Record<string, unknown>[] {
		const removeSet = new Set(Array.isArray(remove) ? remove : []);
		const map = new Map<string | number, Record<string, unknown>>();
		const order: (string | number)[] = [];
		(Array.isArray(base) ? base : []).forEach((raw) => {
			if (!raw || typeof raw !== 'object') return;
			const c = raw as Record<string, unknown>;
			const id = c.id as string | number | null | undefined;
			if (id === undefined || id === null || removeSet.has(String(id))) return;
			map.set(id, c);
			order.push(id);
		});
		(Array.isArray(upsert) ? upsert : []).forEach((raw) => {
			if (!raw || typeof raw !== 'object') return;
			const c = raw as Record<string, unknown>;
			const id = c.id as string | number | null | undefined;
			if (id === undefined || id === null) return;
			if (!map.has(id)) order.push(id);
			map.set(id, c);
		});
		return order.map((id) => map.get(id)!);
	},

	// Template registry merge, keyed by template id@version: written =
	// (S ∪ C) − (T0 − C). Keep stored and current; drop only templates this
	// tab loaded (T0) and no longer has (not in C). A template another tab
	// pinned is kept — a stale tab has no standing to delete what it never saw.
	mergeTemplates(stored: unknown[], current: unknown[], baseline: unknown[]): SheetTemplateRecord[] {
		const key = (t: unknown) => this.templateKey(t);
		const currentKeys = new Set((Array.isArray(current) ? current : []).map(key));
		const baselineKeys = new Set((Array.isArray(baseline) ? baseline : []).map(key));
		const out: SheetTemplateRecord[] = [];
		const seen = new Set<string>();
		(Array.isArray(stored) ? stored : []).forEach((raw) => {
			if (!raw || typeof raw !== 'object') return;
			const k = key(raw);
			if (baselineKeys.has(k) && !currentKeys.has(k)) return;
			out.push(raw as SheetTemplateRecord);
			seen.add(k);
		});
		(Array.isArray(current) ? current : []).forEach((raw) => {
			if (!raw || typeof raw !== 'object') return;
			const k = key(raw);
			if (!seen.has(k)) {
				out.push(raw as SheetTemplateRecord);
				seen.add(k);
			}
		});
		return out;
	},

	// Atomic read-modify-write on the IndexedDB path: a single readwrite
	// transaction does get → modify → put, so overlapping saves serialize
	// instead of racing. No await yields between the read and the write.
	transactReadModifyWrite(
		modify: (current: StorageRecord | null) => { record: StorageRecord; merged: boolean },
	): Promise<{ record: StorageRecord; merged: boolean }> {
		return this.openDB().then(
			(db) =>
				new Promise((resolve, reject) => {
					const tx = db.transaction(this.STORE_NAME, 'readwrite');
					const store = tx.objectStore(this.STORE_NAME);
					const getReq = store.get(this.RECORD_KEY);
					getReq.onsuccess = () => {
						const result = modify((getReq.result as StorageRecord | undefined) || null);
						const putReq = store.put(result.record, this.RECORD_KEY);
						putReq.onsuccess = () => resolve(result);
						putReq.onerror = () => reject(new Error('Could not write local database.', { cause: putReq.error }));
					};
					getReq.onerror = () => reject(new Error('Could not read local database.', { cause: getReq.error }));
					tx.onerror = () => reject(new Error('Could not write local database.', { cause: tx.error }));
					tx.onabort = () => reject(tx.error || new Error('Local database write aborted.'));
				}),
		);
	},

	async load(): Promise<StorageState> {
		const empty = (): StorageState => ({
			characters: [],
			openCharacterIDs: [],
			playViewMode: 'split',
			rollerPosition: 'left',
			templates: [],
			presets: [],
			preferences: this.normalizePreferences(null),
		});
		const fromRecord = (record: StorageRecord | null): StorageState | null => {
			if (!record || record.v !== 2 || !Array.isArray(record.characters)) return null;
			return {
				characters: this.normalizeCharacters(record.characters),
				openCharacterIDs: Array.isArray(record.openCharacterIDs) ? record.openCharacterIDs : [],
				playViewMode: record.playViewMode === 'tabs' ? 'tabs' : 'split',
				rollerPosition: record.rollerPosition === 'right' ? 'right' : 'left',
				templates: this.normalizeTemplates(record.templates),
				presets: this.normalizePresets(record.presets),
				preferences: this.normalizePreferences(record.preferences),
			};
		};
		const pick = await this.readRecord();
		this._lastSavedAt = pick && pick.savedAt ? String(pick.savedAt) : null;
		this._lastTemplates = pick && Array.isArray(pick.templates) ? pick.templates : null;
		this._lastPresets = pick && Array.isArray(pick.presets) ? pick.presets : null;
		if (pick) {
			const state = fromRecord(pick);
			if (state) return state;
		}
		return empty();
	},

	async save(state) {
		const record: StorageRecord = {
			v: 2,
			savedAt: new Date().toISOString(),
			characters: state.characters || [],
			openCharacterIDs: state.openCharacterIDs || [],
			playViewMode: state.playViewMode || 'split',
			rollerPosition: state.rollerPosition || 'left',
			templates: this.normalizeTemplates(state.templates),
			presets: this.normalizePresets(state.presets),
			preferences: this.normalizePreferences(state.preferences),
		};
		const result = await this.writeRecord(record);
		this._lastSavedAt = record.savedAt;
		this._lastTemplates = record.templates;
		this._lastPresets = record.presets;
		return result;
	},

	async saveChanges(changes: SaveChanges) {
		const upsert = Array.isArray(changes && changes.upsert) ? changes.upsert : [];
		const remove = Array.isArray(changes && changes.remove) ? changes.remove : [];
		const session = (changes && changes.session) || ({} as SaveChanges['session']);
		const fallbackNow = this.fallbackRecord();

		// The merge is a pure transform of (current record) → (new record).
		// It is identical for both backends; only the transaction boundary
		// differs (atomic readwrite on IDB, synchronous on the fallback).
		const modify = (idbCurrent: StorageRecord | null): { record: StorageRecord; merged: boolean } => {
			const current =
				idbCurrent && fallbackNow
					? String(fallbackNow.savedAt || '') > String(idbCurrent.savedAt || '')
						? fallbackNow
						: idbCurrent
					: idbCurrent || fallbackNow;
			// Another tab wrote since we last loaded or saved: our upserts merge
			// into the newer store instead of replacing it. Loud, never silent.
			const merged = Boolean(
				current && current.savedAt && this._lastSavedAt && String(current.savedAt) > String(this._lastSavedAt),
			);
			const base = current && Array.isArray(current.characters) ? current.characters : [];
			const record: StorageRecord = {
				v: 2,
				savedAt: new Date().toISOString(),
				characters: this.applyChanges(base, upsert, remove),
				openCharacterIDs: Array.isArray(session.openCharacterIDs) ? session.openCharacterIDs : [],
				playViewMode: session.playViewMode === 'tabs' ? 'tabs' : 'split',
				rollerPosition: session.rollerPosition === 'right' ? 'right' : 'left',
				templates: this.mergeTemplates(
					current && Array.isArray(current.templates) ? current.templates : [],
					this.normalizeTemplates(session.templates),
					this._lastTemplates || [],
				),
				presets: Array.isArray(session.presets)
					? this.mergePresets(
							current && Array.isArray(current.presets) ? current.presets : [],
							session.presets,
							this._lastPresets || [],
						)
					: this.normalizePresets(current && current.presets),
				preferences: this.normalizePreferences(session.preferences),
			};
			return { record, merged };
		};

		if (this._useIDB) {
			try {
				const result = await this.transactReadModifyWrite(modify);
				if (result && result.record) {
					this._lastSavedAt = result.record.savedAt;
					this._lastTemplates = result.record.templates;
					this._lastPresets = result.record.presets;
				}
				try {
					localStorage.removeItem(this.FALLBACK_KEY);
				} catch {
					// Best effort; a stale fallback is ignored while IDB reads back.
				}
				return {
					backend: 'indexeddb',
					merged: result ? result.merged : false,
					presets: result?.record?.presets,
				};
			} catch {
				// Fall through to the full-record localStorage fallback below.
			}
		}
		// Fallback path: localStorage is synchronous, so read-modify-write is
		// atomic by construction — documented as sequential-only, not atomic.
		const result = modify(fallbackNow);
		try {
			localStorage.setItem(this.FALLBACK_KEY, JSON.stringify(result.record));
		} catch (err: unknown) {
			const e = err as { name?: string; code?: number; isQuotaError?: boolean } | null;
			if (e && typeof e === 'object') {
				e.isQuotaError = e.name === 'QuotaExceededError' || e.code === 22;
			}
			throw err;
		}
		this._lastSavedAt = result.record.savedAt;
		this._lastTemplates = result.record.templates;
		this._lastPresets = result.record.presets;
		return { backend: 'localstorage', merged: result.merged, presets: result.record.presets };
	},

	async clear() {
		if (this._useIDB) {
			try {
				const db = await this.openDB();
				await new Promise<void>((resolve, reject) => {
					const tx = db.transaction(this.STORE_NAME, 'readwrite');
					tx.oncomplete = () => resolve();
					tx.onerror = () => reject(new Error('Could not clear local database.', { cause: tx.error }));
					tx.objectStore(this.STORE_NAME).delete(this.RECORD_KEY);
				});
			} catch (err) {
				// Continue to localStorage cleanup below.
			}
		}
		try {
			localStorage.removeItem(this.FALLBACK_KEY);
		} catch (err) {
			// Best effort; a stale fallback is ignored while IDB reads back.
		}
	},

	async requestPersistence() {
		try {
			if (navigator && navigator.storage && typeof navigator.storage.persist === 'function') {
				return await navigator.storage.persist();
			}
		} catch (err) {
			// Best effort only.
		}
		return false;
	},
};
