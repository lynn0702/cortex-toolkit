/**
 * Cortex Toolkit persistent storage.
 *
 * Primary backend is IndexedDB (large quota, structured data, eviction-safe
 * when persistence is granted). First run migrates any legacy localStorage
 * payload, then the legacy keys are removed. If IndexedDB is unavailable,
 * falls back to localStorage with quota errors surfaced to the caller.
 */
const cortexStorage = {

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

	_dbPromise: null,
	_useIDB: ( typeof indexedDB !== 'undefined' ),

	openDB() {
		if ( !this._useIDB ) return Promise.reject( new Error( 'IndexedDB unavailable.' ) );
		if ( !this._dbPromise ) {
			this._dbPromise = new Promise( ( resolve, reject ) => {
				let request;
				try {
					request = indexedDB.open( this.DB_NAME, this.DB_VERSION );
				} catch ( err ) {
					this._useIDB = false;
					reject( err );
					return;
				}
				request.onupgradeneeded = ( event ) => {
					const db = event.target.result;
					if ( !db.objectStoreNames.contains( this.STORE_NAME ) ) {
						db.createObjectStore( this.STORE_NAME );
					}
				};
				request.onsuccess = ( event ) => resolve( event.target.result );
				request.onerror = () => {
					this._useIDB = false;
					this._dbPromise = null;
					reject( request.error || new Error( 'Could not open local database.' ) );
				};
				request.onblocked = () => {
					reject( new Error( 'Local database is blocked by another tab.' ) );
				};
			} );
		}
		return this._dbPromise;
	},

	normalizeCharacters( characters ) {
		if ( !Array.isArray( characters ) ) return [];
		return structuredClone( characters ).map( ( c ) => {
			if ( !c || typeof c !== 'object' ) return null;
			if ( c.isTemplate && c.name ) {
				c.name = String( c.name ).replace( /\s*\([^)]*\)/g, '' ).trim();
			}
			if ( !c.custom ) c.custom = {};
			if ( !c.custom.cortexToolkit ) c.custom.cortexToolkit = {};
			if ( !c.custom.cortexToolkit.columnAlignment ) {
				c.custom.cortexToolkit.columnAlignment = 'top-base';
			}
			if ( !c.custom.cortexToolkit.columnOffsets ) {
				c.custom.cortexToolkit.columnOffsets = { left: 0, center: 0, right: 0 };
			}
			if ( c.custom.cortexToolkit.columnAlignment !== 'custom' ) {
				c.custom.cortexToolkit.columnOffsets.left = 0;
				c.custom.cortexToolkit.columnOffsets.center = 0;
				c.custom.cortexToolkit.columnOffsets.right = 0;
			}
			if ( Array.isArray( c.traitSets ) ) {
				c.traitSets.forEach( ( ts ) => {
					const ctk = ts?.custom?.cortexToolkit;
					if ( !ctk || typeof ctk !== 'object' ) return;
					// Fold legacy per-style label maps into the unified labels store.
					const folded = {};
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
		let characters = [];
		let openCharacterIDs = [];
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

	async load() {
		if ( this._useIDB ) {
			try {
				const db = await this.openDB();
				const record = await new Promise( ( resolve, reject ) => {
					const tx = db.transaction( this.STORE_NAME, 'readonly' );
					const store = tx.objectStore( this.STORE_NAME );
					const req = store.get( this.RECORD_KEY );
					req.onsuccess = () => resolve( req.result || null );
					req.onerror = () => reject( req.error || new Error( 'Could not read local database.' ) );
				} );
				if ( record && Array.isArray( record.characters ) ) {
					return {
						characters: this.normalizeCharacters( record.characters ),
						openCharacterIDs: Array.isArray( record.openCharacterIDs ) ? record.openCharacterIDs : [],
						playViewMode: record.playViewMode === 'tabs' ? 'tabs' : 'split',
						rollerPosition: record.rollerPosition === 'right' ? 'right' : 'left',
						migrated: false,
					};
				}
			} catch ( err ) {
				// Fall through to legacy payload (or empty state) below.
			}
		}
		const legacy = this.readLegacy();
		if ( legacy.error ) {
			return { characters: [], openCharacterIDs: [], playViewMode: 'split', rollerPosition: 'left', loadError: legacy.error, migrated: false };
		}
		if ( legacy.state ) {
			const state = legacy.state;
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
		return { characters: [], openCharacterIDs: [], playViewMode: 'split', rollerPosition: 'left', migrated: false };
	},

	async save( state ) {
		const record = {
			v: 1,
			savedAt: new Date().toISOString(),
			characters: state.characters || [],
			openCharacterIDs: state.openCharacterIDs || [],
			playViewMode: state.playViewMode || 'split',
			rollerPosition: state.rollerPosition || 'left',
		};
		if ( this._useIDB ) {
			const db = await this.openDB();
			await new Promise( ( resolve, reject ) => {
				const tx = db.transaction( this.STORE_NAME, 'readwrite' );
				tx.oncomplete = () => resolve();
				tx.onerror = () => reject( tx.error || new Error( 'Could not write local database.' ) );
				tx.onabort = () => reject( tx.error || new Error( 'Local database write aborted.' ) );
				tx.objectStore( this.STORE_NAME ).put( record, this.RECORD_KEY );
			} );
			return { backend: 'indexeddb' };
		}
		try {
			localStorage.setItem( 'cortexToolkitData', JSON.stringify( { '0.1': { characters: record.characters } } ) );
			localStorage.setItem( 'cortexOpenCharacterIDs', JSON.stringify( record.openCharacterIDs ) );
			localStorage.setItem( 'cortexPlayViewMode', record.playViewMode );
			localStorage.setItem( 'cortexRollerPosition', record.rollerPosition );
			return { backend: 'localstorage' };
		} catch ( err ) {
			err.isQuotaError = err && ( err.name === 'QuotaExceededError' || err.code === 22 );
			throw err;
		}
	},

	async clear() {
		if ( this._useIDB ) {
			try {
				const db = await this.openDB();
				await new Promise( ( resolve, reject ) => {
					const tx = db.transaction( this.STORE_NAME, 'readwrite' );
					tx.oncomplete = () => resolve();
					tx.onerror = () => reject( tx.error || new Error( 'Could not clear local database.' ) );
					tx.objectStore( this.STORE_NAME ).delete( this.RECORD_KEY );
				} );
			} catch ( err ) {
				// Continue to legacy cleanup below.
			}
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
