/**
 * Cortex Toolkit persistent storage. TypeScript leaf.
 *
 * Primary backend is IndexedDB (large quota, structured data, eviction-safe
 * when persistence is granted). First run migrates any legacy localStorage
 * payload, then the legacy keys are removed. If IndexedDB is unavailable,
 * falls back to localStorage with quota errors surfaced to the caller.
 */

import { cortexMigration } from './migration.ts';

export interface StorageState {
	characters: unknown[];
	openCharacterIDs: string[];
	playViewMode: 'split' | 'tabs';
	rollerPosition: 'left' | 'right';
	templates: unknown[];
	preferences: unknown;
	migrated: boolean;
	loadError?: unknown;
	migrationError?: unknown;
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
		preferences: unknown;
	};
}

export interface CortexStorage {
	DB_NAME: string;
	DB_VERSION: number;
	STORE_NAME: string;
	RECORD_KEY: string;
	LEGACY_KEYS: string[];
	FALLBACK_KEY: string;
	_dbPromise: Promise<IDBDatabase> | null;
	_useIDB: boolean;
	_lastSavedAt: string | null;
	_lastTemplates: unknown[] | null;
	templateKey( t: any ): string;
	normalizeTemplates( templates: any ): any[];
	upsertTemplate( templates: any, entry: any ): any[];
	pruneTemplates( templates: any, characters: any ): any[];
	normalizePreferences( prefs: any ): any;
	openDB(): Promise<IDBDatabase>;
	normalizeCharacters( characters: any ): any[];
	readLegacy(): { error: unknown; state: any };
	clearLegacy(): void;
	fallbackRecord(): any;
	readRecord(): Promise<any>;
	writeRecord( record: any ): Promise<{ backend: string }>;
	applyChanges( base: unknown[], upsert: unknown[], remove: string[] ): unknown[];
	mergeTemplates( stored: unknown[], current: unknown[], baseline: unknown[] ): unknown[];
	transactReadModifyWrite( modify: ( current: any ) => { record: any; merged: boolean } ): Promise<{ record: any; merged: boolean }>;
	load(): Promise<StorageState>;
	save( state: any ): Promise<{ backend: string }>;
	saveChanges( changes: SaveChanges ): Promise<{ backend: string; merged: boolean }>;
	clear(): Promise<void>;
	requestPersistence(): Promise<boolean>;
}

export const cortexStorage: CortexStorage = {

	DB_NAME: 'cortex-toolkit',
	DB_VERSION: 1,
	STORE_NAME: 'state',
	RECORD_KEY: 'app',

	LEGACY_KEYS: [
		'cortexToolkitData',
		'cortexOpenCharacterIDs',
		'cortexPlayViewMode',
		'cortexRollerPosition',
	],

	// localStorage fallback holding the FULL record (same shape as the IDB
	// record) when IndexedDB is unavailable. Unlike the legacy split keys
	// it keeps snapshots and preferences, so a fallback save loses nothing.
	FALLBACK_KEY: 'cortexToolkitFallback',

	_dbPromise: null as Promise<IDBDatabase> | null,
	_useIDB: ( typeof indexedDB !== 'undefined' ),
	_lastSavedAt: null as string | null,
	_lastTemplates: null as unknown[] | null,

	// Sheet-template registry (entry shape, same as the spotlight library:
	// { id (static), version, title, ..., character: {...} }). Snapshots are
	// keyed by (id, version): re-imports replace the same version instead
	// of duplicating, and pinned older versions survive bundle updates.
	// Built-ins resolve live from the bundle and are never stored here.
	templateKey( t ) {
		return ( t && t.id ) + '@' + ( ( t && t.version ) || 1 );
	},

	normalizeTemplates( templates ) {
		if ( !Array.isArray( templates ) ) return [];
		const seen = new Set();
		const out = [];
		for ( const t of templates ) {
			if ( !t || typeof t !== 'object' || typeof t.id !== 'string' || !t.id.length ) continue;
			if ( !t.character || typeof t.character !== 'object' || !Array.isArray( t.character.traitSets ) ) continue;
			const key = this.templateKey( t );
			if ( seen.has( key ) ) continue;
			seen.add( key );
			if ( t.version === undefined || t.version === null ) t.version = 1;
			out.push( t );
		}
		return out;
	},

	upsertTemplate( templates, entry ) {
		const list = this.normalizeTemplates( templates );
		if ( !entry || typeof entry.id !== 'string' || !entry.id.length ) return list;
		if ( entry.version === undefined || entry.version === null ) entry.version = 1;
		const key = this.templateKey( entry );
		const i = list.findIndex( t => this.templateKey( t ) === key );
		const clean = JSON.parse( JSON.stringify( entry ) );
		if ( i === -1 ) list.push( clean );
		else list[i] = clean;
		return list;
	},

	// Drop stored snapshots no character pins. Keeps the registry (and
	// future switch prompts) exact across bundle updates.
	pruneTemplates( templates, characters ) {
		const list = this.normalizeTemplates( templates );
		const pinned = new Set();
		( Array.isArray( characters ) ? characters : [] ).forEach( c => {
			const t = c && c.sheet && c.sheet.template;
			const id = t ? ( typeof t === 'string' ? t : t.id ) : null;
			if ( !id ) return;
			const ver = ( t && typeof t === 'object' && t.version ) || 1;
			pinned.add( id + '@' + ver );
		} );
		return list.filter( t => pinned.has( this.templateKey( t ) ) );
	},

	// Preference layer (brief D11): per-character arrangement + declines.
	// Applied after the merge — user arrangement always wins. Shape:
	// { version: 1, global: {}, characters: { charId: {
	//   setOrder: [setId...], traitOrders: { setId: [lid...] },
	//   declinedTemplateVersions: { tplId: version } } } }
	normalizePreferences( prefs ) {
		const out: any = { version: 1, global: {}, characters: {} };
		if ( !prefs || typeof prefs !== 'object' ) return out;
		if ( prefs.global && typeof prefs.global === 'object' ) out.global = prefs.global;
		if ( prefs.characters && typeof prefs.characters === 'object' ) {
			for ( const cid of Object.keys( prefs.characters ) ) {
				const cp = prefs.characters[cid];
				if ( !cp || typeof cp !== 'object' ) continue;
				const clean: any = {};
				if ( Array.isArray( cp.setOrder ) ) clean.setOrder = cp.setOrder.filter( ( x: unknown ) => typeof x === 'string' );
				if ( cp.traitOrders && typeof cp.traitOrders === 'object' ) {
					clean.traitOrders = {};
					for ( const sid of Object.keys( cp.traitOrders ) ) {
						const arr = cp.traitOrders[sid];
						if ( Array.isArray( arr ) ) clean.traitOrders[sid] = arr.filter( ( x: unknown ) => typeof x === 'string' );
					}
				}
				if ( cp.declinedTemplateVersions && typeof cp.declinedTemplateVersions === 'object' ) {
					clean.declinedTemplateVersions = {};
					for ( const tid of Object.keys( cp.declinedTemplateVersions ) ) {
						if ( typeof cp.declinedTemplateVersions[tid] === 'number' ) clean.declinedTemplateVersions[tid] = cp.declinedTemplateVersions[tid];
					}
				}
				out.characters[cid] = clean;
			}
		}
		return out;
	},

	openDB() {
		if ( !this._useIDB ) return Promise.reject( new Error( 'IndexedDB unavailable.' ) );
		if ( !this._dbPromise ) {
			this._dbPromise = new Promise<IDBDatabase>( ( resolve, reject ) => {
				let request: IDBOpenDBRequest;
				try {
					request = indexedDB.open( this.DB_NAME, this.DB_VERSION );
				} catch ( err ) {
					// Never poison future saves: a failed open rejects this
					// attempt only, so a transient lock heals on the next
					// save instead of failing every save after it.
					this._dbPromise = null;
					reject( err );
					return;
				}
				request.onupgradeneeded = ( event ) => {
					const db = ( event.target as IDBOpenDBRequest ).result;
					if ( !db.objectStoreNames.contains( this.STORE_NAME ) ) {
						db.createObjectStore( this.STORE_NAME );
					}
				};
				request.onsuccess = ( event ) => resolve( ( event.target as IDBOpenDBRequest ).result );
				request.onerror = () => {
					this._dbPromise = null;
					reject( request.error || new Error( 'Could not open local database.' ) );
				};
				request.onblocked = () => {
					this._dbPromise = null;
					reject( new Error( 'Local database is blocked by another tab.' ) );
				};
			} );
		}
		return this._dbPromise;
	},

	normalizeCharacters( characters ) {
		if ( !Array.isArray( characters ) ) return [];
		return structuredClone( characters ).map( ( c: any ) => {
			if ( !c || typeof c !== 'object' ) return null;
			cortexMigration.normalizeView( c );
			if ( c.isTemplate && c.name ) {
				c.name = String( c.name ).replace( /\s*\([^)]*\)/g, '' ).trim();
			}
			// D5: load must not materialize defaults (columnAlignment /
			// offsets resolve via renderer fallbacks). Only legacy
			// migrations below may rewrite.
			if ( c.portrait?.url ) {
				const pUrl = c.portrait.url;
				if ( pUrl.includes( 'camp_bewilderwood_logo' ) || pUrl.includes( 'cosa_nostra_logo' ) || pUrl.includes( 'brighter_stars_logo' ) ) {
					c.portrait.url = '';
				}
			}

			if ( Array.isArray( c.traitSets ) ) {
				c.traitSets.forEach( ( ts: any ) => {
					const ctk = ts?.view || ts?.custom?.cortexToolkit;
					// Normalize Distinctions with 'none' ratingPosition to 'inline'
					if ( ( ctk?.style?.body === 'distinctions' || ts.name?.toLowerCase() === 'distinctions' ) &&
						( ts.ratingPosition === 'none' || ctk?.ratingPosition === 'none' ) ) {
						ts.ratingPosition = 'inline';
						if ( ctk ) ctk.ratingPosition = 'inline';
					}

					if ( !ctk || typeof ctk !== 'object' ) return;
					// Fold legacy per-style label maps into the unified labels store.
					const folded: any = {};
					if ( ctk.branchLabels && typeof ctk.branchLabels === 'object' ) {
						if ( ctk.branchLabels.left ) folded.left = ctk.branchLabels.left;
						if ( ctk.branchLabels.right ) folded.right = ctk.branchLabels.right;
						delete ctk.branchLabels;
					}
					if ( ctk.talentLabels && typeof ctk.talentLabels === 'object' ) {
						if ( ctk.talentLabels.talent ) folded.col1 = ctk.talentLabels.talent;
						if ( ctk.talentLabels.activation ) folded.col2 = ctk.talentLabels.activation;
						if ( ctk.talentLabels.effect ) folded.col3 = ctk.talentLabels.effect;
						delete ctk.talentLabels;
					}
					if ( ctk.resourceLabels && typeof ctk.resourceLabels === 'object' ) {
						if ( ctk.resourceLabels.rating ) folded.rating = ctk.resourceLabels.rating;
						if ( ctk.resourceLabels.dice ) folded.dice = ctk.resourceLabels.dice;
						delete ctk.resourceLabels;
					}
					if ( Object.keys( folded ).length ) {
						if ( !ctk.labels || typeof ctk.labels !== 'object' ) ctk.labels = {};
						Object.assign( ctk.labels, folded );
					}
				} );
			}
			return c;
		} ).filter( Boolean );
	},

	readLegacy() {
		let characters: any = [];
		let openCharacterIDs: any = [];
		let playViewMode = 'split';
		let rollerPosition = 'left';
		let found = false;
		try {
			const raw = localStorage.getItem( 'cortexToolkitData' );
			if ( raw && raw.length ) {
				const parsed = JSON.parse( raw );
				if ( parsed && parsed['0.1'] && Array.isArray( parsed['0.1'].characters ) ) {
					characters = parsed['0.1'].characters;
					found = true;
				}
			}
			const idsRaw = localStorage.getItem( 'cortexOpenCharacterIDs' );
			if ( idsRaw ) {
				const ids = JSON.parse( idsRaw );
				if ( Array.isArray( ids ) ) {
					openCharacterIDs = ids;
					found = true;
				}
			}
			const pvm = localStorage.getItem( 'cortexPlayViewMode' );
			if ( pvm === 'split' || pvm === 'tabs' ) {
				playViewMode = pvm;
				found = true;
			}
			const rp = localStorage.getItem( 'cortexRollerPosition' );
			if ( rp === 'left' || rp === 'right' ) {
				rollerPosition = rp;
				found = true;
			}
		} catch ( err ) {
			return { error: err, state: null };
		}
		if ( !found ) return { error: null, state: null };
		return {
			error: null,
			state: {
				characters: this.normalizeCharacters( characters ),
				openCharacterIDs: openCharacterIDs,
				playViewMode: playViewMode,
				rollerPosition: rollerPosition,
			}
		};
	},

	clearLegacy() {
		try {
			this.LEGACY_KEYS.forEach( ( k ) => localStorage.removeItem( k ) );
		} catch ( err ) {
			// Best effort; legacy keys are inert once migrated.
		}
	},

	// Synchronous full-record read of the localStorage fallback. The fallback
	// has no transactions, so its read-modify-write is atomic by construction.
	fallbackRecord(): any {
		try {
			const raw = localStorage.getItem( this.FALLBACK_KEY );
			if ( !raw ) return null;
			return JSON.parse( raw );
		} catch ( err ) {
			return null;
		}
	},

	// Newest complete record wins across the two backends: a fallback save
	// written while IDB was down supersedes a stale IDB copy, and vice versa.
	async readRecord(): Promise<any> {
		let idb: any = null;
		if ( this._useIDB ) {
			try {
				const db = await this.openDB();
				idb = await new Promise( ( resolve, reject ) => {
					const tx = db.transaction( this.STORE_NAME, 'readonly' );
					const store = tx.objectStore( this.STORE_NAME );
					const req = store.get( this.RECORD_KEY );
					req.onsuccess = () => resolve( req.result || null );
					req.onerror = () => reject( req.error || new Error( 'Could not read local database.' ) );
				} );
			} catch ( err ) {
				idb = null;
			}
		}
		const fallback = this.fallbackRecord();
		if ( idb && fallback ) {
			return String( fallback.savedAt || '' ) > String( idb.savedAt || '' ) ? fallback : idb;
		}
		return idb || fallback;
	},

	async writeRecord( record: any ): Promise<{ backend: string }> {
		if ( this._useIDB ) {
			try {
				const db = await this.openDB();
				await new Promise<void>( ( resolve, reject ) => {
					const tx = db.transaction( this.STORE_NAME, 'readwrite' );
					tx.oncomplete = () => resolve();
					tx.onerror = () => reject( tx.error || new Error( 'Could not write local database.' ) );
					tx.onabort = () => reject( tx.error || new Error( 'Local database write aborted.' ) );
					tx.objectStore( this.STORE_NAME ).put( record, this.RECORD_KEY );
				} );
				try {
					localStorage.removeItem( this.FALLBACK_KEY );
				} catch ( err ) {
					// Best effort; a stale fallback is ignored while IDB reads back.
				}
				return { backend: 'indexeddb' };
			} catch ( err ) {
				// Fall through to the full-record localStorage fallback below.
			}
		}
		try {
			localStorage.setItem( this.FALLBACK_KEY, JSON.stringify( record ) );
			return { backend: 'localstorage' };
		} catch ( err: any ) {
			err.isQuotaError = err && ( err.name === 'QuotaExceededError' || err.code === 22 );
			throw err;
		}
	},

	// Merge granular save changes into a base character list: delete by id,
	// then upsert by id (whole entries — never field-merged). Base order is
	// preserved; new characters append at the end.
	applyChanges( base: unknown[], upsert: unknown[], remove: string[] ): unknown[] {
		const removeSet = new Set( Array.isArray( remove ) ? remove : [] );
		const map = new Map<any, unknown>();
		const order: any[] = [];
		( Array.isArray( base ) ? base : [] ).forEach( ( c: any ) => {
			if ( !c || typeof c !== 'object' || c.id === undefined || c.id === null || removeSet.has( c.id ) ) return;
			map.set( c.id, c );
			order.push( c.id );
		} );
		( Array.isArray( upsert ) ? upsert : [] ).forEach( ( c: any ) => {
			if ( !c || typeof c !== 'object' || c.id === undefined || c.id === null ) return;
			if ( !map.has( c.id ) ) order.push( c.id );
			map.set( c.id, c );
		} );
		return order.map( ( id: any ) => map.get( id ) );
	},

	// Template registry merge, keyed by template id@version: written =
	// (S ∪ C) − (T0 − C). Keep stored and current; drop only templates this
	// tab loaded (T0) and no longer has (not in C). A template another tab
	// pinned is kept — a stale tab has no standing to delete what it never saw.
	mergeTemplates( stored: unknown[], current: unknown[], baseline: unknown[] ): unknown[] {
		const key = ( t: any ) => this.templateKey( t );
		const currentKeys = new Set( ( Array.isArray( current ) ? current : [] ).map( key ) );
		const baselineKeys = new Set( ( Array.isArray( baseline ) ? baseline : [] ).map( key ) );
		const out: unknown[] = [];
		const seen = new Set();
		( Array.isArray( stored ) ? stored : [] ).forEach( ( t: any ) => {
			if ( !t || typeof t !== 'object' ) return;
			const k = key( t );
			if ( baselineKeys.has( k ) && !currentKeys.has( k ) ) return;
			out.push( t );
			seen.add( k );
		} );
		( Array.isArray( current ) ? current : [] ).forEach( ( t: any ) => {
			if ( !t || typeof t !== 'object' ) return;
			const k = key( t );
			if ( !seen.has( k ) ) { out.push( t ); seen.add( k ); }
		} );
		return out;
	},

	// Atomic read-modify-write on the IndexedDB path: a single readwrite
	// transaction does get → modify → put, so overlapping saves serialize
	// instead of racing. No await yields between the read and the write.
	transactReadModifyWrite( modify: ( current: any ) => { record: any; merged: boolean } ): Promise<{ record: any; merged: boolean }> {
		return this.openDB().then( ( db ) => new Promise( ( resolve, reject ) => {
			const tx = db.transaction( this.STORE_NAME, 'readwrite' );
			const store = tx.objectStore( this.STORE_NAME );
			const getReq = store.get( this.RECORD_KEY );
			getReq.onsuccess = () => {
				const result = modify( getReq.result || null );
				const putReq = store.put( result.record, this.RECORD_KEY );
				putReq.onsuccess = () => resolve( result );
				putReq.onerror = () => reject( putReq.error || new Error( 'Could not write local database.' ) );
			};
			getReq.onerror = () => reject( getReq.error || new Error( 'Could not read local database.' ) );
			tx.onerror = () => reject( tx.error || new Error( 'Could not write local database.' ) );
			tx.onabort = () => reject( tx.error || new Error( 'Local database write aborted.' ) );
		} ) );
	},

	async load(): Promise<StorageState> {
		const empty = (): StorageState => ( { characters: [], openCharacterIDs: [], playViewMode: 'split', rollerPosition: 'left', templates: [], preferences: this.normalizePreferences( null ), migrated: false } );
		const fromRecord = ( record: any ): StorageState | null => {
			if ( !record || !Array.isArray( record.characters ) ) return null;
			return {
				characters: this.normalizeCharacters( record.characters ),
				openCharacterIDs: Array.isArray( record.openCharacterIDs ) ? record.openCharacterIDs : [],
				playViewMode: record.playViewMode === 'tabs' ? 'tabs' : 'split',
				rollerPosition: record.rollerPosition === 'right' ? 'right' : 'left',
				templates: this.normalizeTemplates( record.templates ),
				preferences: this.normalizePreferences( record.preferences ),
				migrated: false,
			};
		};
		const pick = await this.readRecord();
		this._lastSavedAt = ( pick && pick.savedAt ) ? String( pick.savedAt ) : null;
		this._lastTemplates = ( pick && Array.isArray( pick.templates ) ) ? pick.templates : null;
		if ( pick ) {
			const state = fromRecord( pick );
			if ( state ) return state;
		}
		const legacy = this.readLegacy();
		if ( legacy.error ) {
			return { characters: [], openCharacterIDs: [], playViewMode: 'split', rollerPosition: 'left', templates: [], preferences: this.normalizePreferences( null ), loadError: legacy.error, migrated: false };
		}
		if ( legacy.state ) {
			const state = legacy.state;
			state.templates = [];
			state.preferences = this.normalizePreferences( null );
			try {
				await this.save( state );
				this.clearLegacy();
				state.migrated = true;
			} catch ( err ) {
				state.migrated = false;
				state.migrationError = err;
			}
			return state;
		}
		return empty();
	},

	async save( state ) {
		const record = {
			v: 1,
			savedAt: new Date().toISOString(),
			characters: state.characters || [],
			openCharacterIDs: state.openCharacterIDs || [],
			playViewMode: state.playViewMode || 'split',
			rollerPosition: state.rollerPosition || 'left',
			templates: this.normalizeTemplates( state.templates ),
			preferences: this.normalizePreferences( state.preferences ),
		};
		const result = await this.writeRecord( record );
		this._lastSavedAt = record.savedAt;
		this._lastTemplates = record.templates;
		return result;
	},

	async saveChanges( changes: SaveChanges ) {
		const upsert = Array.isArray( changes && changes.upsert ) ? changes.upsert : [];
		const remove = Array.isArray( changes && changes.remove ) ? changes.remove : [];
		const session = ( changes && changes.session ) || ( {} as SaveChanges['session'] );
		const fallbackNow = this.fallbackRecord();

		// The merge is a pure transform of (current record) → (new record).
		// It is identical for both backends; only the transaction boundary
		// differs (atomic readwrite on IDB, synchronous on the fallback).
		const modify = ( idbCurrent: any ): { record: any; merged: boolean } => {
			const current = ( idbCurrent && fallbackNow )
				? ( String( fallbackNow.savedAt || '' ) > String( idbCurrent.savedAt || '' ) ? fallbackNow : idbCurrent )
				: ( idbCurrent || fallbackNow );
			// Another tab wrote since we last loaded or saved: our upserts merge
			// into the newer store instead of replacing it. Loud, never silent.
			const merged = Boolean( current && current.savedAt && this._lastSavedAt && String( current.savedAt ) > String( this._lastSavedAt ) );
			const base = ( current && Array.isArray( current.characters ) ) ? current.characters : [];
			const record = {
				v: 1,
				savedAt: new Date().toISOString(),
				characters: this.applyChanges( base, upsert, remove ),
				openCharacterIDs: Array.isArray( session.openCharacterIDs ) ? session.openCharacterIDs : [],
				playViewMode: session.playViewMode === 'tabs' ? 'tabs' : 'split',
				rollerPosition: session.rollerPosition === 'right' ? 'right' : 'left',
				templates: this.mergeTemplates(
					( current && Array.isArray( current.templates ) ) ? current.templates : [],
					this.normalizeTemplates( session.templates ),
					this._lastTemplates || []
				),
				preferences: this.normalizePreferences( session.preferences ),
			};
			return { record, merged };
		};

		if ( this._useIDB ) {
			try {
				const result = await this.transactReadModifyWrite( modify );
				if ( result && result.record ) {
					this._lastSavedAt = result.record.savedAt;
					this._lastTemplates = result.record.templates;
				}
				try {
					localStorage.removeItem( this.FALLBACK_KEY );
				} catch ( err ) {
					// Best effort; a stale fallback is ignored while IDB reads back.
				}
				return { backend: 'indexeddb', merged: result ? result.merged : false };
			} catch ( err ) {
				// Fall through to the full-record localStorage fallback below.
			}
		}
		// Fallback path: localStorage is synchronous, so read-modify-write is
		// atomic by construction — documented as sequential-only, not atomic.
		const result = modify( fallbackNow );
		try {
			localStorage.setItem( this.FALLBACK_KEY, JSON.stringify( result.record ) );
		} catch ( err: any ) {
			err.isQuotaError = err && ( err.name === 'QuotaExceededError' || err.code === 22 );
			throw err;
		}
		this._lastSavedAt = result.record.savedAt;
		this._lastTemplates = result.record.templates;
		return { backend: 'localstorage', merged: result.merged };
	},

	async clear() {
		if ( this._useIDB ) {
			try {
				const db = await this.openDB();
				await new Promise<void>( ( resolve, reject ) => {
					const tx = db.transaction( this.STORE_NAME, 'readwrite' );
					tx.oncomplete = () => resolve();
					tx.onerror = () => reject( tx.error || new Error( 'Could not clear local database.' ) );
					tx.objectStore( this.STORE_NAME ).delete( this.RECORD_KEY );
				} );
			} catch ( err ) {
				// Continue to legacy cleanup below.
			}
		}
		try {
			localStorage.removeItem( this.FALLBACK_KEY );
		} catch ( err ) {
			// Best effort; a stale fallback is ignored while IDB reads back.
		}
		this.clearLegacy();
	},

	async requestPersistence() {
		try {
			if ( navigator && navigator.storage && typeof navigator.storage.persist === 'function' ) {
				return await navigator.storage.persist();
			}
		} catch ( err ) {
			// Best effort only.
		}
		return false;
	},

};
