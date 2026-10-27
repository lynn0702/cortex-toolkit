/**
 * Cortex Toolkit migration shim: old-format (0.1 array model) → terse layered entity.
 * TypeScript leaf.
 *
 * Implements the 2026-10-11 Phase-1 freeze (design/DECISIONS.md): null-delete,
 * local-null removals, file-level envelope, top-level entity fields, layout to
 * the type layer, sfx arrays to SFX trait maps, custom app-side, sheet.template
 * as a merge layer, dice-string ratings, terse validation.
 *
 */

import { cloneDeep } from './clone-deep.ts';
import { buildParts, formatPct } from './spotlight-grid.ts';

export const cortexMigration = {

	DIE_SIZES: [4, 6, 8, 10, 12] as number[],

	// Default rating track when no scale is authored (matches getTraitSetRatings).
	DEFAULT_SCALE: [4, 6, 8, 10, 12] as number[],

	// Set bodies whose trait rows are the list-family structure (name /
	// rating / description / sfx / subtraits / attached stress) that
	// view.parts can express. Bespoke bodies keep the legacy flags.
	LIST_FAMILY_BODIES: ['default', 'distinctions', 'stress', 'list',
		'two-columns-compact', 'two-columns-detailed', 'assets', 'resources'] as string[],

	// Seed filler from the original sample files. The terse reference example
	// (Sendak_Eggers.layered.json) carries no descriptions, so exact-match
	// filler is dropped with a warning rather than stored as real content.
	FILLER_DESCRIPTIONS: ['Trait description', 'Trait set description'] as string[],

	// Presentation keys resolve via the type layer (Phase-1 item 5) and never
	// enter entity JSON. Dropped with a per-set warning.
	PRESENTATION_KEYS: ['noun', 'plural', 'ratingPosition', 'statement',
		'hasQuestionedPip', 'hasCounterColumn', 'counterLabel', 'attachedStress'] as string[],

	isBlankName: function( name: unknown ) {
		return !( typeof name === 'string' && name.length );
	},

	// Attached stress lives as an ordinary companion subtrait named for the
	// set's stress label (default "Stress"); absent means no stress.
	stressCompanionLabel: function( set: any ) {
		const bag = ( set && ( set.view || ( set.custom && set.custom.cortexToolkit ) ) ) || {};
		const labels = bag.labels;
		if ( labels && typeof labels.stress === 'string' && labels.stress.length ) return labels.stress;
		const legacy = bag.attachedStress;
		if ( legacy && typeof legacy === 'object' && typeof legacy.label === 'string' && legacy.label.length ) return legacy.label;
		return 'Stress';
	},

	isFillerDescription: function( text: unknown ) {
		return typeof text === 'string' && this.FILLER_DESCRIPTIONS.indexOf( text ) !== -1;
	},

	normalizeView: function( obj: any ) {
		if ( !obj || typeof obj !== 'object' ) return obj;

		if ( Array.isArray( obj ) ) {
			obj.forEach( ( item: any ) => this.normalizeView( item ) );
			return obj;
		}
		if ( Array.isArray( obj.characters ) ) {
			obj.characters.forEach( ( c: any ) => this.normalizeView( c ) );
		}

		const normalizeNode = ( node: any ) => {
			if ( !node || typeof node !== 'object' ) return;
			if ( node.portrait && typeof node.portrait === 'object' ) {
				normalizeNode( node.portrait );
			}
			if ( Array.isArray( node.traitSets ) ) {
				node.traitSets.forEach( ( ts: any ) => normalizeSet( ts ) );
			}
			if ( node.sets && typeof node.sets === 'object' && !Array.isArray( node.sets ) ) {
				Object.values( node.sets ).forEach( ( s: any ) => normalizeLayeredSet( s ) );
			}
		};

		const normalizeTraitsArray = ( traits: any, label: string ) => {
			if ( !Array.isArray( traits ) ) return;
			traits.forEach( ( tr: any ) => {
				if ( !tr || typeof tr !== 'object' ) return;
				normalizeNode( tr );
				this.migrateNodeRating( tr, false );
				if ( Array.isArray( tr.traits ) ) normalizeTraitsArray( tr.traits, label );
			} );
		};

		const normalizeSet = ( set: any ) => {
			if ( !set || typeof set !== 'object' ) return;
			normalizeNode( set );
			this.migrateNodeRating( set, true );
			normalizeTraitsArray( set.traits, this.stressCompanionLabel( set ) );
			this.migrateResourceSet( set );
		};

		const normalizeLayeredTraits = ( traits: any, label: string ) => {
			if ( !traits || typeof traits !== 'object' || Array.isArray( traits ) ) return;
			Object.values( traits ).forEach( ( tr: any ) => {
				if ( !tr || typeof tr !== 'object' ) return;
				normalizeNode( tr );
				this.migrateNodeRating( tr, false );
				if ( tr.traits ) normalizeLayeredTraits( tr.traits, label );
			} );
		};

		const normalizeLayeredSet = ( set: any ) => {
			if ( !set || typeof set !== 'object' ) return;
			normalizeNode( set );
			this.migrateNodeRating( set, true );
			const label = this.stressCompanionLabel( set );
			if ( set.traits ) normalizeLayeredTraits( set.traits, label );
			if ( set.slots ) normalizeLayeredTraits( set.slots, label );
			this.migrateResourceSet( set );
		};

		// The name block is the first trait set (view.style.body "name").
		// Files predating it gain a synthesized one here so every later
		// stage (merge, materialize, render, edit) sees the same shape.
		const isNameSetNode = ( set: any ) => {
			if ( !set || typeof set !== 'object' ) return false;
			const bag = set.view;
			if ( bag && typeof bag === 'object' && !Array.isArray( bag ) &&
				bag.style && typeof bag.style === 'object' && !Array.isArray( bag.style ) &&
				( bag.style as any ).body === 'name' ) return true;
			// Pruned stored sets lose their view bag but keep the stable id.
			// ('name' is reserved: ensureTraitSetIds never assigns it.)
			return typeof set.id === 'string' && set.id === 'name';
		};
		const ensureNameSet = ( holder: any ) => {
			if ( !holder || typeof holder !== 'object' ) return;
			if ( Array.isArray( holder.traitSets ) ) {
				let set = holder.traitSets.find( ( s: any ) => isNameSetNode( s ) );
				if ( !set ) {
					set = { id: 'name', name: 'Name', traits: [], view: { style: { header: 'default', body: 'name' } } };
					holder.traitSets.unshift( set );
				}
				// Array form only: a layered set object riding in an array
				// wrapper (placement pass) keeps its map form untouched.
				if ( !set.traits ) set.traits = [];
			} else if ( holder.sets && typeof holder.sets === 'object' && !Array.isArray( holder.sets ) ) {
				let key = Object.keys( holder.sets ).find( ( k: string ) => isNameSetNode( holder.sets[ k ] ) );
				if ( !key ) {
					key = 'Name';
					holder.sets[ key ] = { id: 'name', traits: {}, view: { style: { header: 'default', body: 'name' } } };
				}
				const set = holder.sets[ key ];
				if ( !set.traits ) set.traits = {};
			} else {
				return;
			}
		};

		normalizeNode( obj );
		if ( obj.character && typeof obj.character === 'object' ) {
			normalizeNode( obj.character );
		}
		ensureNameSet( obj );
		if ( obj.character && typeof obj.character === 'object' ) {
			ensureNameSet( obj.character );
		}
		this.migratePlotPoints( obj );
		if ( obj.character && typeof obj.character === 'object' ) {
			this.migratePlotPoints( obj.character );
		}
		if ( Array.isArray( obj.characters ) ) {
			obj.characters.forEach( ( c: any ) => { ensureNameSet( c ); this.migratePlotPoints( c ); } );
		}
		return obj;
	},

	warn: function( warnings: string[] | undefined, message: string ) {
		if ( Array.isArray( warnings ) ) warnings.push( message );
	},

	generateUUID: function(): string {
		if ( typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ) {
			return crypto.randomUUID();
		}
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c: string) {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	},

	// Integer dice from the old model. Uses the same read rule as
	// getTraitDice: a non-empty dice array wins, otherwise the single value.
	// Unknown sizes pass through with a warning (surfaced, not invented).
	diceIntsFor: function( trait: any, warnings: string[], path: string ): number[] {
		let nums: number[] = [];
		if ( trait && Array.isArray( trait.dice ) && trait.dice.length ) {
			nums = trait.dice.filter( ( d: unknown ) => typeof d === 'number' && d > 0 );
		} else if ( trait && typeof trait.value === 'number' && trait.value > 0 ) {
			nums = [ trait.value ];
		}
		nums.forEach( n => {
			if ( this.DIE_SIZES.indexOf( n ) === -1 ) {
				this.warn( warnings, path + ': unknown die size ' + n + ', kept as d' + n );
			}
		} );
		return nums;
	},

	// Old sfx arrays (objects or the "hinder" literal) to named map + slots
	// object keyed by 0-based position. Nameless sfx objects are blank SFX
	// placeholder rows; the "hinder" literal becomes the "Hinder" trait.
	migrateSfxArray: function( arr: any, warnings: string[], path: string ) {
		const map: any = {}, slots: any = {};
		( Array.isArray( arr ) ? arr : [] ).forEach( ( sfx: any, i: number ) => {
			if ( typeof sfx === 'string' ) {
				if ( !sfx.length ) return;
				const key = /^hinder$/i.test( sfx ) ? 'Hinder' : sfx;
				if ( map[key] === undefined ) map[key] = {};
				return;
			}
			if ( sfx && typeof sfx === 'object' && !Array.isArray( sfx ) ) {
				const key = sfx.name;
			if ( typeof key !== 'string' || !key.length ) {
				const node: any = {};
				if ( typeof sfx.description === 'string' && sfx.description.length ) node.description = sfx.description;
				if ( Array.isArray( sfx.tags ) && sfx.tags.length ) node.tags = sfx.tags.slice();
				if ( sfx.custom !== undefined && !( typeof sfx.custom === 'object' && !Array.isArray( sfx.custom ) && !Object.keys( sfx.custom ).length ) ) node.custom = cloneDeep( sfx.custom );
				slots[String( i )] = node;
				return;
			}
			const node: any = {};
			if ( typeof sfx.description === 'string' && sfx.description.length && !this.isFillerDescription( sfx.description ) ) {
				node.description = sfx.description;
			}
			if ( Array.isArray( sfx.tags ) && sfx.tags.length ) node.tags = sfx.tags.slice();
			if ( sfx.custom !== undefined && !( typeof sfx.custom === 'object' && !Array.isArray( sfx.custom ) && !Object.keys( sfx.custom ).length ) ) node.custom = cloneDeep( sfx.custom );
				if ( map[key] !== undefined ) this.warn( warnings, path + ': duplicate sfx ' + JSON.stringify( key ) + ', last wins' );
				map[key] = node;
				return;
			}
			this.warn( warnings, path + ': dropped non-object sfx entry' );
		} );
		return { map: map, slots: slots };
	},

	mergeSfxIntoTraits: function( traits: any, sfx: any, warnings: string[], path: string ) {
		const sfxMap = sfx && sfx.map ? sfx.map : sfx;
		const sfxSlots = sfx && sfx.slots ? sfx.slots : {};
		if ( !Object.keys( sfxMap ).length && !Object.keys( sfxSlots ).length ) return;
		if ( !traits.SFX || typeof traits.SFX !== 'object' || Array.isArray( traits.SFX ) ) {
			traits.SFX = { traits: {} };
		} else if ( typeof traits.SFX === 'string' ) {
			traits.SFX = { value: traits.SFX, traits: {} };
		} else if ( !traits.SFX.traits || typeof traits.SFX.traits !== 'object' ) {
			traits.SFX.traits = {};
		}
		Object.keys( sfxMap ).forEach( k => {
			if ( traits.SFX.traits[k] !== undefined ) {
				this.warn( warnings, path + ': trait "SFX"/"' + k + '" collides with set sfx, set sfx wins' );
			}
			traits.SFX.traits[k] = sfxMap[k];
		} );
		Object.keys( sfxSlots ).forEach( k => {
			if ( !traits.SFX.slots || typeof traits.SFX.slots !== 'object' ) traits.SFX.slots = {};
			if ( traits.SFX.slots[k] !== undefined ) {
				this.warn( warnings, path + ': SFX slot ' + k + ' collides, incoming wins' );
			}
			traits.SFX.slots[k] = sfxSlots[k];
		} );
		if ( traits.SFX.slots && !Object.keys( traits.SFX.slots ).length ) delete traits.SFX.slots;
	},

	// Old trait object to [key, raw]. Returns null when the trait is dropped
	// (blank print slots have no map form; reservation is presentation).
	// Ratings have one shape (2026-10-23): { type, value: [], range: [] }.
	// migrateNodeRating maps day-1 encodings in place (idempotent):
	// numeric value/dice arrays become Die/Dice ratings, set nouns map
	// onto noun/plural, Dice ratings gain spendable. Post-day-1 keys are
	// not converted — they never shipped, so no file carries them.
	normalizeRatingObject: function( r: any ): any | null {
		if ( !r || typeof r !== 'object' || Array.isArray( r ) ) return null;
		if ( r.type !== 'Counter' && r.type !== 'Die' && r.type !== 'Dice' && r.type !== 'Pip' ) return null;
		const value = Array.isArray( r.value )
			? r.value.filter( ( x: unknown ) => ( typeof x === 'number' && Number.isFinite( x ) ) || typeof x === 'boolean' )
			: [];
		const range = Array.isArray( r.range ) ? r.range.filter( ( x: unknown ) => typeof x === 'number' && Number.isFinite( x ) ) : [];
		return { type: r.type, value: value, range: range.length ? range : [ 4, 6, 8, 10, 12 ] };
	},

	migrateNodeRating: function( node: any, isSet: boolean ) {
		if ( !node || typeof node !== 'object' || Array.isArray( node ) ) return node;
		// Day-1 set nouns map onto the §1 words (noun, plural).
		if ( isSet ) {
			if ( typeof node.noun !== 'string' && typeof node.nounSingular === 'string' ) node.noun = node.nounSingular;
			if ( typeof node.plural !== 'string' && typeof node.nounPlural === 'string' ) node.plural = node.nounPlural;
			delete node.nounSingular;
			delete node.nounPlural;
		}
		const LADDER = [ 4, 6, 8, 10, 12 ];
		const legacyDiceArray = Array.isArray( node.dice ) ? node.dice.filter( ( d: unknown ) => typeof d === 'number' && ( d as number ) > 0 ) : [];
		const legacySingle = typeof node.value === 'number' && node.value > 0 ? [ node.value ] : [];
		// Canonical rating wins; legacy keys go once read.
		let rating = node.rating === null ? null : this.normalizeRatingObject( node.rating );
		if ( rating === null && node.rating !== null ) {
			if ( legacyDiceArray.length > 1 ) {
				const dice = legacyDiceArray.slice().sort( ( a: number, b: number ) => b - a );
				rating = { type: 'Dice', value: dice, range: LADDER.slice() };
			} else if ( legacyDiceArray.length === 1 || legacySingle.length === 1 ) {
				const dice = legacyDiceArray.length ? legacyDiceArray : legacySingle;
				rating = { type: 'Die', value: dice.slice(), range: LADDER.slice() };
			}
		}
		if ( rating ) node.rating = rating;
		else if ( node.rating !== null ) delete node.rating;
		delete node.value;
		delete node.dice;
		// Dice ratings are spendable unless stated otherwise (preserves the
		// spend control wherever multi-die dice exist).
		if ( rating && rating.type === 'Dice' && node.spendable === undefined ) {
			node.spendable = true;
		}
		return node;
	},

	// Resources stage whole and never hitch: rated traits gain spendable
	// (unless stated) and the hitches exemption (unless stated).
	migrateResourceSet: function( set: any ) {
		if ( !set || typeof set !== 'object' || Array.isArray( set ) ) return;
		const bag = set.view && typeof set.view === 'object' && !Array.isArray( set.view ) ? set.view : {};
		const body = bag.style && typeof bag.style === 'object' && !Array.isArray( bag.style ) ? bag.style.body : undefined;
		const hay = ( ( set.name || '' ) + ' ' + ( set.noun || '' ) + ' ' + ( set.plural || '' ) ).toLowerCase();
		if ( body !== 'resources' && body !== 'dice-count' && hay.indexOf( 'resource' ) === -1 ) return;
		const each = ( tr: any ) => {
			if ( !tr || typeof tr !== 'object' || Array.isArray( tr ) ) return;
			const r = this.normalizeRatingObject( tr.rating );
			if ( !r || ( r.type !== 'Die' && r.type !== 'Dice' ) ) return;
			if ( tr.spendable === undefined ) tr.spendable = true;
			if ( tr.hitches === undefined ) tr.hitches = 0;
		};
		if ( Array.isArray( set.traits ) ) set.traits.forEach( each );
		else if ( set.traits && typeof set.traits === 'object' ) Object.values( set.traits ).forEach( each );
	},

	// Plot Points is a Counter on a name-set trait (spendable, [0, 20]).
	// The character field stays the interchange value; the trait is canonical.
	migratePlotPoints: function( holder: any ) {
		if ( !holder || typeof holder !== 'object' || Array.isArray( holder ) ) return;
		if ( typeof holder.plotPoints !== 'number' || !Number.isFinite( holder.plotPoints ) ) return;
		const sets = Array.isArray( holder.traitSets ) ? holder.traitSets : [];
		const nset = sets.find( ( s: any ) => s && typeof s === 'object' &&
			( ( s.view && typeof s.view === 'object' && s.view.style && typeof s.view.style === 'object' && s.view.style.body === 'name' ) || s.id === 'name' ) );
		if ( !nset ) return;
		if ( !Array.isArray( nset.traits ) ) nset.traits = [];
		let tr = nset.traits.find( ( t: any ) => t && typeof t === 'object' && t.name === 'plotPoints' );
		if ( !tr ) {
			tr = { name: 'plotPoints', description: '', traits: [], tags: [] };
			nset.traits.push( tr );
		}
		const n = Math.max( 0, Math.floor( holder.plotPoints ) );
		tr.rating = { type: 'Counter', value: [ n ], range: [ 0, 20 ] };
		if ( tr.spendable === undefined ) tr.spendable = true;
	},

	migrateTrait: function( old: any, warnings: string[], path: string ): { key: string; raw: any } | null {
		if ( !old || typeof old !== 'object' || Array.isArray( old ) ) {
			this.warn( warnings, path + ': dropped non-object trait' );
			return null;
		}
		const key = old.name;
		if ( typeof key !== 'string' || !key.length ) {
			this.warn( warnings, path + ': dropped blank-name trait slot' );
			return null;
		}
		const here = path + '/' + key;
		const node: any = {};
		const nums = this.diceIntsFor( old, warnings, here );
		let single: number | null = null;
		if ( nums.length > 1 ) {
			node.rating = { type: 'Dice', value: nums.slice().sort( ( a: number, b: number ) => b - a ), range: [ 4, 6, 8, 10, 12 ] };
			node.spendable = true;
		} else if ( nums.length === 1 ) {
			single = nums[0];
		}
		const desc = ( typeof old.description === 'string' && old.description.length && !this.isFillerDescription( old.description ) )
			? old.description : null;
		const stmt = ( typeof old.statement === 'string' && old.statement.length ) ? old.statement : null;
		if ( typeof old.description === 'string' && old.description.length && !desc ) {
			this.warn( warnings, here + ': dropped filler description' );
		}
		if ( desc ) node.description = desc;
		else if ( stmt ) node.description = stmt;
		if ( old.questioned === true ) node.questioned = true;
		if ( ( typeof old.xp === 'number' && old.xp !== 0 ) || ( typeof old.xp === 'string' && old.xp.length ) ) node.xp = old.xp;
		if ( ( typeof old.counter === 'number' && old.counter !== 0 ) || ( typeof old.counter === 'string' && old.counter.length ) ) node.counter = old.counter;
		if ( old.ratingPosition !== undefined && old.ratingPosition !== null ) {
			this.warn( warnings, here + ': dropped per-trait ratingPosition (type layer)' );
		}
		if ( Array.isArray( old.tags ) && old.tags.length ) node.tags = old.tags.slice();
		if ( old.custom && typeof old.custom === 'object' && Object.keys( old.custom ).length ) {
			this.warn( warnings, here + ': dropped app-side custom' );
		}
		if ( Array.isArray( old.traits ) && old.traits.length ) {
			const subs: any = {};
			old.traits.forEach( ( st: any ) => {
				const m = this.migrateTrait( st, warnings, here );
				if ( m ) {
					if ( subs[m.key] !== undefined ) this.warn( warnings, here + ': duplicate subtrait ' + JSON.stringify( m.key ) + ', last wins' );
					subs[m.key] = m.raw;
				}
			} );
			if ( Object.keys( subs ).length ) node.traits = subs;
		}
		if ( Array.isArray( old.sfx ) && old.sfx.length ) {
			if ( !node.traits ) node.traits = {};
			this.mergeSfxIntoTraits( node.traits, this.migrateSfxArray( old.sfx, warnings, here ), warnings, here );
			if ( node.traits.SFX && node.traits.SFX.traits && !Object.keys( node.traits.SFX.traits ).length ) delete node.traits.SFX;
			if ( !Object.keys( node.traits ).length ) delete node.traits;
		}
		if ( Array.isArray( old.removedTraits ) && old.removedTraits.length ) {
			if ( !node.traits ) node.traits = {};
			old.removedTraits.forEach( ( n: any ) => {
				if ( typeof n !== 'string' || !n.length ) return;
				if ( node.traits[n] !== undefined ) {
					this.warn( warnings, here + ': removal of live subtrait ' + JSON.stringify( n ) + ' ignored, live wins' );
					return;
				}
				node.traits[n] = null;
			} );
		}
		const keys = Object.keys( node );
		if ( keys.length === 0 && single ) return { key: key, raw: { rating: { type: 'Die', value: [ single ], range: [ 4, 6, 8, 10, 12 ] } } };
		if ( single ) node.rating = { type: 'Die', value: [ single ], range: [ 4, 6, 8, 10, 12 ] };
		return { key: key, raw: node };
	},

	// Old trait-set object to [key, raw]. Set-level sfx folds into traits.SFX.
	migrateSet: function( old: any, warnings: string[] ): { key: string; raw: any } | null {
		if ( !old || typeof old !== 'object' || Array.isArray( old ) ) {
			this.warn( warnings, 'set: dropped non-object set' );
			return null;
		}
		const key = old.name;
		if ( typeof key !== 'string' || !key.length ) {
			this.warn( warnings, 'set: dropped nameless set' );
			return null;
		}
		const here = 'set/' + key;
		const set: any = { traits: {} };
		if ( typeof old.description === 'string' && old.description.length && !this.isFillerDescription( old.description ) ) {
			set.description = old.description;
		} else if ( typeof old.description === 'string' && old.description.length ) {
			this.warn( warnings, here + ': dropped filler description' );
		}
		const droppedPresentation: string[] = [];
		this.PRESENTATION_KEYS.forEach( ( k: string ) => {
			if ( old[k] !== undefined && old[k] !== null ) droppedPresentation.push( k );
		} );
		// Day-1 noun words report under their old names.
		[ 'nounSingular', 'nounPlural' ].forEach( ( k: string ) => {
			if ( old[k] !== undefined && old[k] !== null ) droppedPresentation.push( k );
		} );
		if ( old.custom && typeof old.custom === 'object' && Object.keys( old.custom ).length ) droppedPresentation.push( 'custom' );
		if ( droppedPresentation.length ) this.warn( warnings, here + ': dropped presentation keys (' + droppedPresentation.join( ', ' ) + ') to type layer' );
		if ( Array.isArray( old.tags ) && old.tags.length ) set.tags = old.tags.slice();
		( Array.isArray( old.traits ) ? old.traits : [] ).forEach( ( tr: any ) => {
			const m = this.migrateTrait( tr, warnings, here );
			if ( m ) {
				if ( set.traits[m.key] !== undefined ) this.warn( warnings, here + ': duplicate trait ' + JSON.stringify( m.key ) + ', last wins' );
				set.traits[m.key] = m.raw;
			}
		} );
		if ( Array.isArray( old.sfx ) && old.sfx.length ) {
			this.mergeSfxIntoTraits( set.traits, this.migrateSfxArray( old.sfx, warnings, here ), warnings, here );
		}
		if ( Array.isArray( old.removedTraits ) && old.removedTraits.length ) {
			old.removedTraits.forEach( ( n: any ) => {
				if ( typeof n !== 'string' || !n.length ) return;
				if ( set.traits[n] !== undefined ) {
					this.warn( warnings, here + ': removal of live trait ' + JSON.stringify( n ) + ' ignored, live wins' );
					return;
				}
				set.traits[n] = null;
			} );
		}
		return { key: key, raw: set };
	},

	// Old character (sanitized 0.1 shape) to flat file object: file-level
	// envelope fields beside the terse entity core. removedSets resolve
	// against the template character when supplied; without template context
	// they cannot be keyed and are reported, not silently kept.
	migrateCharacter: function( old: any, templateChar?: any ) {
		const warnings: string[] = [];
		if ( !old || typeof old !== 'object' || Array.isArray( old ) ) {
			return { data: null, warnings: ['input: not a character object'] };
		}
		let inner = old;
		if ( !Array.isArray( inner.traitSets ) && inner.data && typeof inner.data === 'object' && !Array.isArray( inner.data ) ) {
			inner = inner.data;
			this.warn( warnings, 'input: unwrapped upstream envelope' );
		}
		if ( !Array.isArray( inner.traitSets ) ) {
			return { data: null, warnings: warnings.concat( ['input: no traitSets array'] ) };
		}
		const out: any = {};
		if ( typeof inner.id === 'string' && inner.id.length ) out.id = inner.id;
		else {
			out.id = this.generateUUID();
			this.warn( warnings, 'input: missing id, assigned fresh ' + out.id );
		}
		if ( typeof inner.version === 'string' ) out.version = inner.version;
		['dateCreated', 'dateModified', 'dateTouched'].forEach( ( k: string ) => {
			if ( typeof inner[k] === 'string' ) out[k] = inner[k];
		} );
		if ( inner.isTemplate === true ) out.isTemplate = true;
		if ( inner.$schema !== undefined ) this.warn( warnings, 'input: dropped stale $schema pointer' );

		const entity: any = {};
		entity.name = typeof inner.name === 'string' ? inner.name : '';
		if ( typeof inner.game === 'string' && inner.game.length ) entity.game = inner.game;
		if ( typeof inner.type === 'string' && inner.type.length ) entity.type = inner.type;
		if ( typeof inner.challenge === 'string' && inner.challenge.length ) entity.challenge = inner.challenge;
		if ( typeof inner.pronouns === 'string' && inner.pronouns.length ) entity.pronouns = inner.pronouns;
		if ( typeof inner.description === 'string' && inner.description.length ) entity.description = inner.description;
		if ( inner.portrait && typeof inner.portrait === 'object' && typeof inner.portrait.url === 'string' && inner.portrait.url.length ) {
			entity.portrait = { url: inner.portrait.url };
			if ( typeof inner.portrait.alt === 'string' && inner.portrait.alt.length ) entity.portrait.alt = inner.portrait.alt;
			if ( ( Array.isArray( inner.portrait.tags ) && inner.portrait.tags.length ) ||
				( inner.portrait.custom && typeof inner.portrait.custom === 'object' && Object.keys( inner.portrait.custom ).length ) ) {
				this.warn( warnings, 'portrait: dropped tags/custom' );
			}
		}
		if ( typeof inner.plotPoints === 'number' && inner.plotPoints !== 0 ) entity.plotPoints = inner.plotPoints;
		if ( typeof inner.notes === 'string' && inner.notes.length ) entity.notes = inner.notes;
		if ( Array.isArray( inner.tags ) && inner.tags.length ) entity.tags = inner.tags.slice();

		const tpl = inner.sheet && inner.sheet.template;
		if ( typeof tpl === 'string' && tpl.length ) entity.template = { id: tpl };
		else if ( tpl && typeof tpl === 'object' && typeof tpl.id === 'string' && tpl.id.length ) {
			entity.template = { id: tpl.id };
			if ( typeof tpl.version === 'number' ) entity.template.version = tpl.version;
			if ( tpl.character ) this.warn( warnings, 'sheet: embedded template reduced to reference, migrate the template separately' );
		}

		const sets: any = {};
		const seenSetNames: any = {};
		inner.traitSets.forEach( ( ts: any ) => {
			if ( !ts || typeof ts !== 'object' ) {
				this.warn( warnings, 'set: dropped non-object set' );
				return;
			}
			if ( this.isBlankName( ts.name ) ) {
				this.warn( warnings, 'set: dropped nameless set' );
				return;
			}
			if ( seenSetNames[ts.name] ) {
				this.warn( warnings, 'set/' + ts.name + ': duplicate set name, first wins' );
				return;
			}
			const m = this.migrateSet( ts, warnings );
			if ( m ) {
				sets[m.key] = m.raw;
				seenSetNames[m.key] = true;
			}
		} );
		if ( Array.isArray( inner.removedSets ) && inner.removedSets.length ) {
			const ids = inner.removedSets.filter( ( x: unknown ) => typeof x === 'string' && x.length );
			if ( ids.length ) {
				if ( templateChar && Array.isArray( templateChar.traitSets ) ) {
					const byId: any = {};
					templateChar.traitSets.forEach( ( ts: any ) => {
						if ( ts && typeof ts.id === 'string' && typeof ts.name === 'string' ) byId[ts.id] = ts.name;
					} );
					ids.forEach( ( id: string ) => {
						const nm = byId[id];
						if ( !nm ) {
							this.warn( warnings, 'removedSets: unknown set id ' + JSON.stringify( id ) + ', dropped' );
							return;
						}
						if ( sets[nm] !== undefined ) {
							this.warn( warnings, 'removedSets: removal of live set ' + JSON.stringify( nm ) + ' ignored, live wins' );
							return;
						}
						sets[nm] = null;
					} );
				} else {
					this.warn( warnings, 'removedSets: ' + ids.length + ' entr(ies) need template context, dropped' );
				}
			}
		}
		entity.sets = sets;

		if ( inner.prefs && typeof inner.prefs === 'object' && !Array.isArray( inner.prefs ) ) {
			const idToName: any = {};
			inner.traitSets.forEach( ( ts: any ) => {
				if ( ts && typeof ts.id === 'string' && typeof ts.name === 'string' ) idToName[ts.id] = ts.name;
			} );
			const prefs: any = {};
			if ( Array.isArray( inner.prefs.setOrder ) && inner.prefs.setOrder.length ) {
				const order: string[] = [];
				inner.prefs.setOrder.forEach( ( id: any ) => {
					if ( typeof id !== 'string' ) return;
					if ( idToName[id] ) order.push( idToName[id] );
					else this.warn( warnings, 'prefs: dropped unresolvable set order entry ' + JSON.stringify( id ) );
				} );
				if ( order.length ) prefs.setOrder = order;
			}
			if ( inner.prefs.traitOrders && typeof inner.prefs.traitOrders === 'object' ) {
				const orders: any = {};
				Object.keys( inner.prefs.traitOrders ).forEach( ( sid: string ) => {
					const nm = idToName[sid];
					if ( !nm ) {
						this.warn( warnings, 'prefs: dropped trait order for unknown set ' + JSON.stringify( sid ) );
						return;
					}
					if ( Array.isArray( inner.prefs.traitOrders[sid] ) ) orders[nm] = inner.prefs.traitOrders[sid].slice();
				} );
				if ( Object.keys( orders ).length ) prefs.traitOrders = orders;
			}
			if ( inner.prefs.declinedTemplateVersions && typeof inner.prefs.declinedTemplateVersions === 'object' ) {
				prefs.declinedTemplateVersions = cloneDeep( inner.prefs.declinedTemplateVersions );
			}
			if ( Object.keys( prefs ).length ) out.prefs = prefs;
		}

		Object.keys( entity ).forEach( ( k: string ) => { out[k] = entity[k]; } );
		return { data: out, warnings: warnings };
	},

	// ---------- Template (presentation layer) migration ----------
	// Template layers are COMPLETE, not sparse: every scalar key is preserved
	// verbatim and only the structure changes (arrays to maps, dice to
	// strings, sfx arrays to SFX maps). Terseness here is structural, and it
	// is where duplicate-name and positional-blank bugs become impossible.
	// - Sets keep id and all presentation keys plus custom verbatim. Named
	//   traits go to a name-keyed map; blank placeholders go to slots, an
	//   object keyed by 0-based position in the full trait order (position
	//   matters: slot content differs per index, and one corpus set leads
	//   with blanks). Pure SFX containers are addressed, not positional,
	//   and take no index.
	// - Single dice live in value (the template-file convention is dice:[]).
	//   Unmigrate always emits dice:[]; getTraitDice reads both forms as one.
	// - Unmigrate rebuilds source order from slot indices; named traits fill
	//   the remaining positions in map order. Exact for every corpus shape,
	//   including leading blanks.
	// - $schema and version markers are dropped in layered form (they mark
	//   the old representation) and re-added on unmigrate.
	// - custom.cortexToolkit stays verbatim in template layers during the
	//   transition. The app-side split happens when live editing writes
	//   layers; it is future work.

	// Scalar trait keys carried verbatim (presence preserved) in templates.
	TEMPLATE_TRAIT_SCALARS: ['label', 'description', 'statement', 'questioned', 'xp', 'counter', 'ratingPosition', 'tags', 'pool', 'spendable', 'hitches', 'keepsExtra'] as string[],

	migrateTemplateTrait: function( old: any, warnings: string[], path: string ): any {
		if ( !old || typeof old !== 'object' || Array.isArray( old ) ) {
			this.warn( warnings, path + ': dropped non-object trait' );
			return null;
		}
		const node: any = {};
		// normalizeView already converted ratings; read the canonical
		// object, falling back to day-1 numeric keys for un-normalized input.
		const existing = this.normalizeRatingObject( old.rating );
		if ( existing ) {
			node.rating = existing;
		} else {
			const nums = this.diceIntsFor( old, warnings, path );
			if ( nums.length > 1 ) {
				node.rating = { type: 'Dice', value: nums.slice().sort( ( a: number, b: number ) => b - a ), range: [ 4, 6, 8, 10, 12 ] };
				if ( old.spendable === undefined ) node.spendable = true;
			} else if ( nums.length === 1 ) {
				node.rating = { type: 'Die', value: nums.slice(), range: [ 4, 6, 8, 10, 12 ] };
			}
		}
		this.TEMPLATE_TRAIT_SCALARS.forEach( ( k: string ) => {
			if ( old[k] === undefined ) return;
			// Canonical emit: empty scaffolding stays out (absence carries
			// the same meaning); every other scalar keeps presence.
			if ( k === 'tags' && Array.isArray( old[k] ) && !old[k].length ) return;
			if ( k === 'description' && old[k] === '' ) return;
			node[k] = ( Array.isArray( old[k] ) ) ? old[k].slice() : old[k];
		} );
		if ( old.view !== undefined ) node.view = cloneDeep( old.view );
		if ( old.custom !== undefined && !( typeof old.custom === 'object' && !Array.isArray( old.custom ) && !Object.keys( old.custom ).length ) ) {
			node.custom = cloneDeep( old.custom );
		}
		if ( old.id !== undefined ) {
			this.warn( warnings, path + ': dropped trait-level id (D1)' );
		}
		const subs = this.splitTemplateTraits( old.traits, warnings, path );
		if ( subs && ( Object.keys( subs.map ).length || Object.keys( subs.slots ).length ) ) {
			if ( Object.keys( subs.map ).length ) node.traits = subs.map;
			if ( Object.keys( subs.slots ).length ) node.slots = subs.slots;
		}
		if ( Array.isArray( old.sfx ) && old.sfx.length ) {
			if ( !node.traits ) node.traits = {};
			this.mergeSfxIntoTraits( node.traits, this.migrateSfxArray( old.sfx, warnings, path ), warnings, path );
		}
		return node;
	},

	// Split an old traits array into named map (source order) + slots object
	// keyed by 0-based position in the full trait order. Pure SFX containers
	// take no position (addressed, not positional).
	splitTemplateTraits: function( traits: any, warnings: string[], path: string ) {
		const map: any = {}, slots: any = {};
		( Array.isArray( traits ) ? traits : [] ).forEach( ( tr: any, i: number ) => {
			if ( tr && typeof tr === 'object' && !Array.isArray( tr ) && typeof tr.name === 'string' && tr.name.length ) {
				const key = tr.name;
				if ( map[key] !== undefined ) this.warn( warnings, path + ': duplicate trait ' + JSON.stringify( key ) + ', last wins' );
				map[key] = this.migrateTemplateTrait( tr, warnings, path + '/' + key );
			} else if ( tr && typeof tr === 'object' && !Array.isArray( tr ) ) {
				slots[String( i )] = this.migrateTemplateTrait( tr, warnings, path + '/slot' + i );
			} else {
				this.warn( warnings, path + ': dropped non-object trait entry' );
			}
		} );
		return { map: map, slots: slots };
	},

	// Positional keys of a traits map: every child, including the "SFX"
	// container (SFX is a child trait now, not a separate field).
	positionalKeys: function( traits: any ): string[] {
		if ( !traits || typeof traits !== 'object' || Array.isArray( traits ) ) return [];
		return Object.keys( traits );
	},

	// Rebuild the source trait order: slots at their indices, named traits
	// filling the remaining positions in map order.
	orderedTraits: function( traits: any, slots: any, make: ( e: { slot: boolean; key: string } ) => any ): any[] {
		const names = this.positionalKeys( traits );
		const idx = Object.keys( slots || {} ).map( Number ).sort( ( a, b ) => a - b );
		const size = names.length + idx.length;
		const arr: any[] = new Array( size );
		idx.forEach( i => { arr[i] = { slot: true, key: String( i ) }; } );
		let n = 0;
		for ( let i = 0; i < size; i++ ) {
			if ( !arr[i] ) arr[i] = { slot: false, key: names[n++] };
		}
		return arr.map( e => make( e ) ).filter( Boolean );
	},

	migrateTemplateSet: function( old: any, warnings: string[] ): { key: string; raw: any } | null {
		const key = old && old.name;
		if ( !old || typeof old !== 'object' || typeof key !== 'string' || !key.length ) {
			this.warn( warnings, 'set: dropped nameless set' );
			return null;
		}
		const here = 'set/' + key;
		const set: any = {};
		Object.keys( old ).forEach( ( k: string ) => {
			if ( k === 'name' || k === 'traits' || k === 'sfx' || k === 'removedTraits' ) return;
			// Canonical emit: empty scaffolding stays out.
			if ( k === 'tags' && Array.isArray( old[k] ) && !old[k].length ) return;
			if ( k === 'description' && old[k] === '' ) return;
			if ( k === 'custom' && old[k] && typeof old[k] === 'object' && !Object.keys( old[k] ).length ) return;
			set[k] = cloneDeep( old[k] );
		} );
		const split = this.splitTemplateTraits( old.traits, warnings, here );
		set.traits = split.map;
		if ( Object.keys( split.slots ).length ) set.slots = split.slots;
		if ( Array.isArray( old.sfx ) && old.sfx.length ) {
			this.mergeSfxIntoTraits( set.traits, this.migrateSfxArray( old.sfx, warnings, here ), warnings, here );
		}
		if ( Array.isArray( old.removedTraits ) && old.removedTraits.length ) {
			this.warn( warnings, here + ': template carries removedTraits, kept as local nulls' );
			old.removedTraits.forEach( ( n: any ) => {
				if ( typeof n === 'string' && n.length && set.traits[n] === undefined ) set.traits[n] = null;
			} );
		}
		return { key: key, raw: set };
	},

	migrateTemplateEntry: function( entry: any ) {
		const warnings: string[] = [];
		if ( !entry || typeof entry !== 'object' || Array.isArray( entry ) ) {
			return { data: null, warnings: ['input: not a template entry'] };
		}
		this.normalizeView( entry );
		const ch = entry.character;
		if ( !ch || typeof ch !== 'object' || !Array.isArray( ch.traitSets ) ) {
			return { data: null, warnings: ['input: entry has no character.traitSets'] };
		}
		const out: any = {};
		Object.keys( entry ).forEach( ( k: string ) => {
			if ( k === 'character' ) return;
			out[k] = cloneDeep( entry[k] );
		} );
		const c: any = {};
		Object.keys( ch ).forEach( ( k: string ) => {
			if ( k === '$schema' || k === 'version' || k === 'traitSets' ) return;
			c[k] = cloneDeep( ch[k] );
		} );
		if ( ch.$schema !== undefined || ch.version !== undefined ) {
			this.warn( warnings, 'character: dropped old-format $schema/version markers' );
		}
		// Duplicate set names (repeated worksheet blocks) get suffixed keys in
		// source order — bare name first, then Name~2, Name~3 — with the
		// display name in `label` (the universal trait shape already defaults
		// label to name). Parens are avoided: the app strips them as
		// nicknames elsewhere. Each entry keeps its own id and content.
		c.sets = {};
		let dupeCount = 0;
		ch.traitSets.forEach( ( ts: any ) => {
			const m = this.migrateTemplateSet( ts, warnings );
			if ( !m ) return;
			let key = m.key, n = 2;
			while ( c.sets[key] !== undefined ) key = m.key + '~' + ( n++ );
			if ( key !== m.key ) {
				dupeCount++;
				m.raw.label = m.key;
			}
			c.sets[key] = m.raw;
		} );
		if ( dupeCount ) this.warn( warnings, 'character: ' + dupeCount + ' duplicate set name(s) suffixed, display names in label' );
		if ( Array.isArray( ch.removedSets ) && ch.removedSets.length ) {
			this.warn( warnings, 'character: template carries removedSets, dropped' );
		}
		// Nested-grid placement runs over the built map in document order:
		// band keys become view.place, legacy flags become view.parts.
		// The wrapper carries Rule-of-3 track counts (the old engine was
		// always 3); its view is throwaway.
		const placeWarnings = this.migratePlacement( {
			view: { columns: 3, columnsPage2: 3 },
			traitSets: Object.values( c.sets ),
		} );
		placeWarnings.forEach( ( w: string ) => this.warn( warnings, w ) );
		out.character = c;
		return { data: out, warnings: warnings };
	},

	// ---------- Unmigrate (layered template back to old form) ----------
	// Mechanical inverse for parity proof. Re-adds old-format markers.

	// Layered rating objects to the array-model rating. Canonical emit is
	// always the object; anything else reads as unrated with a warning.
	unmigrateRating: function( value: any, warnings: string[], path: string ): any | null {
		if ( value === undefined || value === null ) return null;
		if ( typeof value === 'object' && !Array.isArray( value ) ) {
			const r = this.normalizeRatingObject( value );
			if ( r ) return r;
			this.warn( warnings, path + ': malformed rating kept as unrated' );
			return null;
		}
		this.warn( warnings, path + ': non-object rating kept as unrated' );
		return null;
	},

	unmigrateTemplateTrait: function( name: string, node: any, warnings: string[], path: string ): any {
		const here = path + '/' + ( name === '' ? 'slot' : name );
		if ( node === null ) {
			this.warn( warnings, here + ': null has no old-form equivalent, dropped' );
			return null;
		}
		if ( typeof node === 'string' ) {
			const tr: any = { name: name, traits: [] };
			const r = this.unmigrateRating( node, warnings, here );
			if ( r ) tr.rating = r;
			return tr;
		}
		if ( !node || typeof node !== 'object' || Array.isArray( node ) ) {
			this.warn( warnings, here + ': malformed trait, dropped' );
			return null;
		}
		const tr: any = { name: name };
		const r = this.unmigrateRating( node.rating !== undefined ? node.rating : node.value, warnings, here );
		if ( r ) tr.rating = r;
		this.TEMPLATE_TRAIT_SCALARS.forEach( ( k: string ) => {
			if ( node[k] !== undefined ) tr[k] = cloneDeep( node[k] );
		} );
		if ( node.view !== undefined ) tr.view = cloneDeep( node.view );
		if ( node.custom !== undefined ) tr.custom = cloneDeep( node.custom );
		const subs = ( node.traits && typeof node.traits === 'object' && !Array.isArray( node.traits ) ) ? node.traits : {};
		const subSlots = ( node.slots && typeof node.slots === 'object' && !Array.isArray( node.slots ) ) ? node.slots : {};
		const self = this;
		tr.traits = this.orderedTraits( subs, subSlots, ( e: any ) => {
			if ( e.slot ) return self.unmigrateTemplateTrait( '', subSlots[e.key], warnings, here + '/slot' + e.key );
			if ( subs[e.key] === null ) {
				self.warn( warnings, here + ': null ' + JSON.stringify( e.key ) + ' has no old-form equivalent, dropped' );
				return null;
			}
			return self.unmigrateTemplateTrait( e.key, subs[e.key], warnings, here );
		} );
		return tr;
	},

	unmigrateTemplateSet: function( name: string, set: any, warnings: string[] ): any {
		const here = 'set/' + name;
		if ( !set || typeof set !== 'object' || Array.isArray( set ) ) {
			this.warn( warnings, here + ': malformed set, dropped' );
			return null;
		}
		const ts: any = { id: set.id, name: name };
		Object.keys( set ).forEach( ( k: string ) => {
			if ( k === 'id' || k === 'name' || k === 'label' || k === 'traits' || k === 'slots' ) return;
			ts[k] = cloneDeep( set[k] );
		} );
		const subs = ( set.traits && typeof set.traits === 'object' && !Array.isArray( set.traits ) ) ? set.traits : {};
		const subSlots = ( set.slots && typeof set.slots === 'object' && !Array.isArray( set.slots ) ) ? set.slots : {};
		const self = this;
		ts.traits = this.orderedTraits( subs, subSlots, ( e: any ) => {
			if ( e.slot ) return self.unmigrateTemplateTrait( '', subSlots[e.key], warnings, here + '/slot' + e.key );
			if ( subs[e.key] === null ) {
				self.warn( warnings, here + ': null ' + JSON.stringify( e.key ) + ' has no old-form equivalent, dropped' );
				return null;
			}
			return self.unmigrateTemplateTrait( e.key, subs[e.key], warnings, here );
		} );
		return ts;
	},

	unmigrateTemplateEntry: function( layered: any ) {
		const warnings: string[] = [];
		if ( !layered || typeof layered !== 'object' || Array.isArray( layered ) ) {
			return { data: null, warnings: ['input: not a layered template entry'] };
		}
		const ch = layered.character;
		if ( !ch || typeof ch !== 'object' || !ch.sets || typeof ch.sets !== 'object' || Array.isArray( ch.sets ) ) {
			return { data: null, warnings: ['input: entry has no character.sets map'] };
		}
		const out: any = {};
		Object.keys( layered ).forEach( ( k: string ) => {
			if ( k === 'character' ) return;
			out[k] = cloneDeep( layered[k] );
		} );
		const c: any = {
			$schema: 'https://cortex.engard.me/schema/0.1/character.schema.json',
			version: '0.1',
		};
		Object.keys( ch ).forEach( ( k: string ) => {
			if ( k === 'sets' || k === 'slots' ) return;
			c[k] = cloneDeep( ch[k] );
		} );
		// Display name is the label when present, else the key. Suffixed dupe
		// keys resolve through their labels; unadorned keys are their names.
		c.traitSets = Object.keys( ch.sets ).map( ( key: string ) => {
			const set = ch.sets[key];
			if ( set === null ) {
				this.warn( warnings, 'set/' + key + ': null has no old-form equivalent, dropped' );
				return null;
			}
			const name = ( set && typeof set === 'object' && !Array.isArray( set ) && typeof set.label === 'string' && set.label.length )
				? set.label : key;
			return this.unmigrateTemplateSet( name, set, warnings );
		} ).filter( Boolean );
		out.character = c;
		return { data: out, warnings: warnings };
	},

	// ---------- Nested-grid placement migration (2026-10-19) ----------
	// Replaces the band model (track / span / widths / rowBreak): every set
	// states its own position under view.place {left, top, width, height},
	// and trait-row internals under view.parts. Old files migrate on
	// import; the corpus migrates once through the same helpers.
	//
	// Per set: top from view.row (visual row, header-inclusive — content
	// row 2 → top 0); within a row, left is the sum of the colWidth shares
	// of earlier tracks and width the sum over the spanned tracks, both as
	// "%" strings. height is 1 everywhere (rows are content-sized; taller
	// placements are new authoring, not migration). Full-width sets omit
	// place (sparse stacking in document order). ratingPosition (except
	// vertical ladders) and attachedStress become parts per the additive
	// composition rules and are removed. Sets the rules cannot express
	// (vertical rating, non-default stress scales, bespoke bodies) keep
	// their legacy flags; the renderer reads both.
	BAND_KEYS: ['track', 'span', 'widths', 'rowBreak', 'colWidth', 'rowSpan',
		'colSpan', 'columnSpan', 'row'] as string[],

	hasBandKeys: function( bag: any ): boolean {
		if ( !bag || typeof bag !== 'object' ) return false;
		return this.BAND_KEYS.some( ( k: string ) => bag[k] !== undefined );
	},

	trackOf: function( bag: any, trackCount: number ): 1 | 2 | 3 {
		if ( bag.track === 1 || bag.track === 2 || bag.track === 3 ) return bag.track;
		const loc = String( bag.location || '' ).toLowerCase().trim();
		if ( trackCount === 2 ) return ( loc === 'right' || loc === '2' ) ? 2 : 1;
		if ( loc === 'center' || loc === 'middle' || loc === '2' || loc === 'col-2' ) return 2;
		if ( loc === 'right' || loc === '3' || loc === 'col-3' ) return 3;
		return 1;
	},

	spanOf: function( bag: any, trackCount: number ): 1 | 2 | 3 {
		const raw = bag.span ?? bag.colSpan ?? bag.columnSpan;
		if ( raw === 'full' || Number( raw ) >= Math.max( 3, trackCount ) ) return 3;
		if ( Number( raw ) === 2 ) return 2;
		return 1;
	},

	// Per-track widths from per-set singular colWidth shares (the last band
	// rule, preserved): declared shares win, undeclared tracks split the
	// remainder. Triples on sets are no longer read.
	bandTrackWidths: function( members: { track: number; colWidth: number | null }[] ): [number, number, number] {
		const declared: ( number | null )[] = [ null, null, null ];
		for ( const m of members ) {
			if ( m.colWidth !== null && Number.isFinite( m.colWidth ) && m.colWidth > 0 && m.colWidth <= 100 ) {
				if ( declared[ m.track - 1 ] === null ) declared[ m.track - 1 ] = m.colWidth;
			}
		}
		const hasTrack3 = members.some( m => m.track === 3 );
		if ( !hasTrack3 && declared[2] === null ) {
			if ( declared[0] !== null ) return [ declared[0], 100 - declared[0], 0 ];
			if ( declared[1] !== null ) return [ 100 - declared[1], declared[1], 0 ];
			return [ 50, 50, 0 ];
		}
		const count = declared.filter( d => d !== null ).length;
		if ( count > 0 ) {
			const sum = declared.reduce( ( a: number, b ) => a + ( b || 0 ), 0 );
			const remaining = Math.max( 0, 100 - sum );
			const empty = 3 - count;
			const share = empty > 0 ? Math.round( remaining / empty * 100 ) / 100 : 0;
			return [
				declared[0] !== null ? declared[0] : share,
				declared[1] !== null ? declared[1] : share,
				declared[2] !== null ? declared[2] : share,
			];
		}
		return [ 33.333, 33.333, 33.334 ];
	},

	// Effective rating position across the top-level key and the view bag.
	effectiveRatingPosition: function( set: any, bag: any ): string | undefined {
		const v = ( set && set.ratingPosition !== undefined && set.ratingPosition !== null )
			? set.ratingPosition : bag?.ratingPosition;
		return ( typeof v === 'string' && v.length ) ? v : undefined;
	},

	// Convert one set's legacy flags to view.parts. Returns 'parts',
	// 'legacy', or 'none' (no flags to convert). Non-default stress scales
	// and vertical ladders stay legacy; anything the composition cannot
	// express is kept, never invented.
	migrateSetParts: function( set: any, bag: any ): string {
		// Explicit parts are never clobbered: a set carrying both keeps
		// both and validation surfaces it.
		if ( bag?.parts && typeof bag.parts === 'object' && Object.keys( bag.parts ).length ) return 'none';
		const rating = this.effectiveRatingPosition( set, bag );
		const stress = bag?.attachedStress;
		const stressOn = Boolean( stress && typeof stress === 'object' && stress.enabled );
		if ( rating === undefined && !stressOn ) return 'none';
		const body = bag?.style?.body;
		if ( rating === 'vertical' ) return 'legacy';
		if ( body !== undefined && this.LIST_FAMILY_BODIES.indexOf( body ) === -1 ) return 'legacy';
		const scale = Array.isArray( bag?.ratingScale ) && bag.ratingScale.length
			? bag.ratingScale : this.DEFAULT_SCALE;
		const sScale = stressOn
			? ( Array.isArray( stress.scale ) && stress.scale.length ? stress.scale
				: Array.isArray( stress.ratingScale ) && stress.ratingScale.length ? stress.ratingScale
				: this.DEFAULT_SCALE )
			: [];
		// A customized stress track has no parts form; keep the flags.
		if ( stressOn && JSON.stringify( [ ...sScale ].sort( ( a: number, b: number ) => a - b ) ) !==
			JSON.stringify( [ ...this.DEFAULT_SCALE ].sort( ( a: number, b: number ) => a - b ) ) ) {
			return 'legacy';
		}
		const pos = rating === undefined ? 'inline' : rating;
		if ( pos !== 'inline' && pos !== 'above' && pos !== 'below' && pos !== 'none' ) return 'legacy';
		const statement = Boolean( ( set && set.statement ) ?? bag?.statement );
		const features = bag?.features || {};
		bag.parts = buildParts( {
			rating: pos as 'inline' | 'above' | 'below' | 'none',
			ratingDice: scale.length,
			stressDice: stressOn ? sScale.length : 0,
			description: Boolean( features.description ) && !statement && pos !== 'above',
			sfx: Boolean( features.sfx ),
			subtraits: Boolean( features.subtraits ),
		} );
		// Non-default stress labels ride in the generic labels dict so no
		// content text is lost; the default ("Stress") stays implicit.
		if ( stressOn && typeof stress.label === 'string' && stress.label.length && stress.label !== 'Stress' ) {
			if ( !bag.labels || typeof bag.labels !== 'object' ) bag.labels = {};
			bag.labels.stress = stress.label;
		}
		if ( set && typeof set === 'object' ) delete set.ratingPosition;
		delete bag.ratingPosition;
		delete bag.attachedStress;
		return 'parts';
	},

	migratePlacement: function( charObj: any ): string[] {
		const warnings: string[] = [];
		if ( !charObj || typeof charObj !== 'object' ) return warnings;
		this.normalizeView( charObj );
		const char = charObj.character || charObj;
		const ctkChar = char?.view || char?.custom?.cortexToolkit;

		const setsList: any[] = [];
		if ( Array.isArray( char.traitSets ) ) {
			char.traitSets.forEach( ( ts: any ) => {
				if ( ts && typeof ts === 'object' ) setsList.push( ts );
			} );
		} else if ( char.sets && typeof char.sets === 'object' && !Array.isArray( char.sets ) ) {
			Object.keys( char.sets ).forEach( ( k: string ) => {
				const s = char.sets[k];
				if ( s && typeof s === 'object' && !Array.isArray( s ) ) setsList.push( s );
			} );
		}

		const bagOf = ( set: any ) => set.view || set.custom?.cortexToolkit;
		const pageOf = ( set: any ) => Number( bagOf( set )?.page ) || 1;

		// Normalize import-time bare numbers to "%" strings everywhere.
		setsList.forEach( ( set ) => {
			const bag = bagOf( set );
			if ( bag && typeof bag === 'object' && bag.place && typeof bag.place === 'object' ) {
				for ( const k of [ 'left', 'width' ] ) {
					if ( typeof bag.place[k] === 'number' && Number.isFinite( bag.place[k] ) ) {
						bag.place[k] = formatPct( bag.place[k] );
					}
				}
				if ( bag.parts && typeof bag.parts === 'object' ) {
					Object.values( bag.parts ).forEach( ( cell: any ) => {
						if ( cell && typeof cell === 'object' ) {
							for ( const k of [ 'left', 'width' ] ) {
								if ( typeof cell[k] === 'number' && Number.isFinite( cell[k] ) ) {
									cell[k] = formatPct( cell[k] );
								}
							}
						}
					} );
				}
			}
		} );

		const legacyCols1 = Number( ctkChar?.columns ) || 2;
		const legacyCols2 = Number( ctkChar?.columnsPage2 ) || legacyCols1;

		const byPage: Record<number, any[]> = {};
		setsList.forEach( set => {
			const p = pageOf( set );
			( byPage[p] = byPage[p] || [] ).push( set );
		} );

		Object.keys( byPage ).forEach( pageStr => {
			const p = Number( pageStr );
			const pageSets = byPage[p];
			const trackCount = p === 2 ? legacyCols2 : legacyCols1;

			// Bands are explicit (page, row) pairs; sets without a row but
			// with band keys fall back to rowBreak-delimited bands in
			// document order (pre-row files).
			const bands: { row: number | null; members: any[] }[] = [];
			const explicitRows = pageSets.map( ( set ) => {
				const r = Number( bagOf( set )?.row );
				return Number.isFinite( r ) && r >= 1 ? Math.floor( r ) : null;
			} );
			const anyExplicit = explicitRows.some( r => r !== null );
			if ( anyExplicit ) {
				pageSets.forEach( ( set, i ) => {
					const r = explicitRows[i];
					if ( r === null ) {
						bands.push( { row: null, members: [ set ] } );
						return;
					}
					const band = bands.find( b => b.row === r );
					if ( band ) band.members.push( set );
					else bands.push( { row: r, members: [ set ] } );
				} );
			} else if ( pageSets.some( ( set ) => this.hasBandKeys( bagOf( set ) ) ) ) {
				let current: any[] = [];
				pageSets.forEach( ( set ) => {
					const bag = bagOf( set );
					const rawSpan = bag?.span ?? bag?.colSpan ?? bag?.columnSpan;
					const isFull = rawSpan === 'full' || ( typeof rawSpan === 'number' && rawSpan >= trackCount );
					if ( isFull && current.length ) {
						bands.push( { row: null, members: current } );
						current = [];
					}
					if ( bag?.rowBreak === true && current.length ) {
						bands.push( { row: null, members: current } );
						current = [];
					}
					current.push( set );
					if ( isFull ) {
						bands.push( { row: null, members: current } );
						current = [];
					}
				} );
				if ( current.length ) bands.push( { row: null, members: current } );
			}

			bands.forEach( ( band, bandIdx ) => {
				// top from the visual row (header-inclusive: content row 2
				// → top 0); fallback bands stack in document order from 0.
				// Sets without band keys are never touched here: classic
				// sets keep their columns, placed sets keep their place.
				const keyed = band.members.filter( ( set ) => this.hasBandKeys( bagOf( set ) ) );
				if ( !keyed.length ) return;
				const top = band.row !== null ? Math.max( 0, band.row - 2 ) : bandIdx;
				const members = keyed.map( ( set ) => {
					const bag = bagOf( set ) || {};
					return { set, track: this.trackOf( bag, trackCount ), span: this.spanOf( bag, trackCount ) };
				} );
				members.forEach( ( m ) => {
					if ( m.track + m.span - 1 > 3 ) m.span = ( 4 - m.track ) as 1 | 2 | 3;
				} );
				const widths = this.bandTrackWidths( members.map( ( m ) => {
					const bag = bagOf( m.set ) || {};
					const w = Number( bag.colWidth );
					return { track: m.track, colWidth: Number.isFinite( w ) && w > 0 && w <= 100 ? w : null };
				} ) );
				members.forEach( ( m ) => {
					if ( !bagOf( m.set ) ) m.set.view = {};
					const bag = bagOf( m.set );
					if ( m.span >= 3 ) {
						// Full-width sets stack sparsely in document order.
						delete bag.place;
					} else {
						const left = m.track === 1 ? 0 : m.track === 2 ? widths[0] : Math.round( ( widths[0] + widths[1] ) * 1000 ) / 1000;
						const width = Math.round( widths.slice( m.track - 1, m.track - 1 + m.span ).reduce( ( a: number, b: number ) => a + b, 0 ) * 1000 ) / 1000;
						bag.place = { left: formatPct( left ), top, width: formatPct( width ), height: 1 };
					}
					this.BAND_KEYS.forEach( ( k: string ) => delete bag[k] );
					if ( bag.location !== 'header' && bag.location !== 'attributes' ) delete bag.location;
				} );
			} );

			// Trait-row internals below the set level are greenfield
			// authoring per the composition rules — except the flags they
			// supersede, which convert here.
			pageSets.forEach( ( set ) => {
				const bag = bagOf( set );
				if ( !bag || typeof bag !== 'object' ) return;
				this.migrateSetParts( set, bag );
			} );
		} );

		// Zero horizontal-interval collisions within any (page, top) row.
		const placedByKey: Record<string, { index: number; rect: { left: number; top: number; width: number; height: number } }[]> = {};
		setsList.forEach( ( set, i ) => {
			const pl = bagOf( set )?.place;
			if ( !pl || typeof pl !== 'object' ) return;
			const mL = typeof pl.left === 'string' ? pl.left.match( /^(-?\d+(?:\.\d+)?)\s*%$/ ) : null;
			const mW = typeof pl.width === 'string' ? pl.width.match( /^(-?\d+(?:\.\d+)?)\s*%$/ ) : null;
			if ( !mL || !mW || !Number.isInteger( pl.top ) || !Number.isInteger( pl.height ) ) return;
			const key = pageOf( set ) + ':' + pl.top;
			( placedByKey[key] = placedByKey[key] || [] ).push( {
				index: i,
				rect: { left: Number( mL[1] ), top: pl.top, width: Number( mW[1] ), height: pl.height },
			} );
		} );
		Object.keys( placedByKey ).forEach( ( key ) => {
			const list = placedByKey[key];
			for ( let a = 0; a < list.length; a++ ) {
				for ( let b = a + 1; b < list.length; b++ ) {
					const A = list[a].rect, B = list[b].rect;
					if ( A.left < B.left + B.width - 1e-6 && B.left < A.left + A.width - 1e-6 ) {
						warnings.push( 'page ' + key + ': horizontal collision between sets ' + list[a].index + ' and ' + list[b].index );
					}
				}
			}
		} );

		if ( ctkChar ) {
			delete ctkChar.columns;
			delete ctkChar.columnsPage2;
		}
		return warnings;
	},

};
