/**
 * Cortex Toolkit migration shim: old-format (0.1 array model) → terse layered entity.
 * TypeScript leaf.
 *
 * Implements the 2026-10-11 Phase-1 freeze (design/DECISIONS.md): null-delete,
 * local-null removals, file-level envelope, top-level entity fields, layout to
 * the type layer, sfx arrays to SFX trait maps, custom app-side, sheet.template
 * as a merge layer, dice-string ratings, terse validation.
 *
 * Pure functions, no dependencies. Node tests `require()` this ESM module.
 */

export const cortexMigration = {

	DIE_SIZES: [4, 6, 8, 10, 12, 20] as number[],

	// Seed filler from the original sample files. The terse reference example
	// (Sendak_Eggers.layered.json) carries no descriptions, so exact-match
	// filler is dropped with a warning rather than stored as real content.
	FILLER_DESCRIPTIONS: ['Trait description', 'Trait set description'] as string[],

	// Presentation keys resolve via the type layer (Phase-1 item 5) and never
	// enter entity JSON. Dropped with a per-set warning.
	PRESENTATION_KEYS: ['nounSingular', 'nounPlural', 'ratingPosition', 'statement',
		'hasQuestionedPip', 'hasCounterColumn', 'counterLabel'] as string[],

	isBlankName: function( name: unknown ) {
		return !( typeof name === 'string' && name.length );
	},

	isFillerDescription: function( text: unknown ) {
		return typeof text === 'string' && this.FILLER_DESCRIPTIONS.indexOf( text ) !== -1;
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

	// Integer dice from the old model to "dX" strings. Uses the same read rule
	// as getTraitDice: a non-empty dice array wins, otherwise the single value.
	// Unknown sizes pass through as "d<n>" with a warning (surfaced, not invented).
	diceStringsFor: function( trait: any, warnings: string[], path: string ): string[] {
		let nums: number[] = [];
		if ( trait && Array.isArray( trait.dice ) && trait.dice.length ) {
			nums = trait.dice.filter( ( d: unknown ) => typeof d === 'number' && d > 0 );
		} else if ( trait && typeof trait.value === 'number' && trait.value > 0 ) {
			nums = [ trait.value ];
		}
		return nums.map( n => {
			if ( this.DIE_SIZES.indexOf( n ) === -1 ) {
				this.warn( warnings, path + ': unknown die size ' + n + ', kept as d' + n );
			}
			return 'd' + n;
		} );
	},

	// Canonical dice form: descending size, count prefix, no separators.
	canonicalDice: function( dice: string[] ): string {
		const counts: Record<string, number> = {};
		dice.forEach( d => { counts[d] = ( counts[d] || 0 ) + 1; } );
		return Object.keys( counts )
			.sort( ( a, b ) => parseInt( b.slice( 1 ), 10 ) - parseInt( a.slice( 1 ), 10 ) )
			.map( d => ( counts[d] > 1 ? counts[d] : '' ) + d )
			.join( '' );
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
					if ( sfx.custom !== undefined ) node.custom = JSON.parse( JSON.stringify( sfx.custom ) );
					slots[String( i )] = node;
					return;
				}
				const node: any = {};
				if ( typeof sfx.description === 'string' && sfx.description.length && !this.isFillerDescription( sfx.description ) ) {
					node.description = sfx.description;
				}
				if ( Array.isArray( sfx.tags ) && sfx.tags.length ) node.tags = sfx.tags.slice();
				if ( sfx.custom !== undefined ) node.custom = JSON.parse( JSON.stringify( sfx.custom ) );
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
		const dice = this.diceStringsFor( old, warnings, here );
		let single: string | null = null;
		if ( dice.length > 1 ) {
			node.value = this.canonicalDice( dice );
			node.pool = true;
		} else if ( dice.length === 1 ) {
			single = dice[0];
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
		if ( keys.length === 0 && single ) return { key: key, raw: single };
		if ( single ) node.value = single;
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
				prefs.declinedTemplateVersions = JSON.parse( JSON.stringify( inner.prefs.declinedTemplateVersions ) );
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
	TEMPLATE_TRAIT_SCALARS: ['description', 'statement', 'questioned', 'xp', 'counter', 'ratingPosition', 'tags'] as string[],

	migrateTemplateTrait: function( old: any, warnings: string[], path: string ): any {
		if ( !old || typeof old !== 'object' || Array.isArray( old ) ) {
			this.warn( warnings, path + ': dropped non-object trait' );
			return null;
		}
		const node: any = {};
		const dice = this.diceStringsFor( old, warnings, path );
		if ( dice.length > 1 ) {
			node.value = this.canonicalDice( dice );
			node.pool = true;
		} else if ( dice.length === 1 ) {
			node.value = dice[0];
		}
		this.TEMPLATE_TRAIT_SCALARS.forEach( ( k: string ) => {
			if ( old[k] !== undefined ) {
				node[k] = ( Array.isArray( old[k] ) ) ? old[k].slice() : old[k];
			}
		} );
		if ( old.custom !== undefined ) node.custom = JSON.parse( JSON.stringify( old.custom ) );
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

	// Positional keys of a traits map: everything except a pure SFX container.
	positionalKeys: function( traits: any ): string[] {
		if ( !traits || typeof traits !== 'object' || Array.isArray( traits ) ) return [];
		return Object.keys( traits ).filter( k => !( k === 'SFX' && this.isPureSfxContainer( traits.SFX ) ) );
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
			set[k] = JSON.parse( JSON.stringify( old[k] ) );
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
		const ch = entry.character;
		if ( !ch || typeof ch !== 'object' || !Array.isArray( ch.traitSets ) ) {
			return { data: null, warnings: ['input: entry has no character.traitSets'] };
		}
		const out: any = {};
		Object.keys( entry ).forEach( ( k: string ) => {
			if ( k === 'character' ) return;
			out[k] = JSON.parse( JSON.stringify( entry[k] ) );
		} );
		const c: any = {};
		Object.keys( ch ).forEach( ( k: string ) => {
			if ( k === '$schema' || k === 'version' || k === 'traitSets' ) return;
			c[k] = JSON.parse( JSON.stringify( ch[k] ) );
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
		out.character = c;
		return { data: out, warnings: warnings };
	},

	// ---------- Unmigrate (layered template back to old form) ----------
	// Mechanical inverse for parity proof. Re-adds old-format markers.

	unmigrateDieString: function( value: any, warnings: string[], path: string ) {
		if ( value === undefined ) return { value: 0, dice: [] };
		if ( typeof value !== 'string' ) {
			this.warn( warnings, path + ': non-string value kept as unrated' );
			return { value: 0, dice: [] };
		}
		const re = /(\d*)d(4|6|8|10|12|20)/g;
		let m: RegExpExecArray | null;
		const dice: number[] = [];
		while ( ( m = re.exec( value ) ) !== null ) {
			const n = parseInt( m[2], 10 );
			const count = m[1] === '' ? 1 : parseInt( m[1], 10 );
			for ( let i = 0; i < count; i++ ) dice.push( n );
		}
		if ( !dice.length ) {
			this.warn( warnings, path + ': unparseable value ' + JSON.stringify( value ) + ', kept as unrated' );
			return { value: 0, dice: [] };
		}
		if ( dice.length === 1 ) return { value: dice[0], dice: [] };
		return { value: dice[0], dice: dice };
	},

	unmigrateTemplateTrait: function( name: string, node: any, warnings: string[], path: string ): any {
		const here = path + '/' + ( name === '' ? 'slot' : name );
		if ( node === null ) {
			this.warn( warnings, here + ': null has no old-form equivalent, dropped' );
			return null;
		}
		if ( typeof node === 'string' ) {
			const d = this.unmigrateDieString( node, warnings, here );
			return { name: name, value: d.value, dice: d.dice, description: '', traits: [], sfx: [], tags: [], custom: {} };
		}
		if ( !node || typeof node !== 'object' || Array.isArray( node ) ) {
			this.warn( warnings, here + ': malformed trait, dropped' );
			return null;
		}
		const d = this.unmigrateDieString( node.value, warnings, here );
		const tr: any = { name: name, value: d.value, dice: d.dice };
		this.TEMPLATE_TRAIT_SCALARS.forEach( ( k: string ) => {
			if ( node[k] !== undefined ) tr[k] = JSON.parse( JSON.stringify( node[k] ) );
		} );
		tr.custom = node.custom !== undefined ? JSON.parse( JSON.stringify( node.custom ) ) : {};
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
		tr.sfx = this.unmigrateSfxArray( node, warnings, here );
		if ( tr.tags === undefined ) tr.tags = [];
		return tr;
	},

	isPureSfxContainer: function( node: any ): boolean {
		if ( !node || typeof node !== 'object' || Array.isArray( node ) ) return false;
		if ( typeof node === 'string' ) return false;
		const keys = Object.keys( node ).filter( k => k !== 'traits' && k !== 'slots' );
		if ( keys.length ) return false;
		if ( !node.traits || typeof node.traits !== 'object' || Array.isArray( node.traits ) ) return false;
		const contentKeys = ( s: any ) => s && typeof s === 'object' && !Array.isArray( s ) &&
			Object.keys( s ).every( ( sk: string ) => sk === 'description' || sk === 'tags' || sk === 'custom' );
		if ( !Object.keys( node.traits ).every( k => contentKeys( node.traits[k] ) ) ) return false;
		const slots = ( node.slots && typeof node.slots === 'object' && !Array.isArray( node.slots ) ) ? node.slots : {};
		return Object.keys( slots ).every( k => contentKeys( slots[k] ) );
	},

	// Presence-preserved sfx rebuild. Named entries without tags/custom stay
	// tagless (as authored); blank slots regain the old required keys.
	unmigrateSfxEntry: function( k: string, s: any, isSlot: boolean ): any {
		if ( !isSlot && s && typeof s === 'object' && !Array.isArray( s ) && Object.keys( s ).length === 0 && k === 'Hinder' ) return 'hinder';
		const o: any = { name: isSlot ? '' : k };
		const src = ( s && typeof s === 'object' && !Array.isArray( s ) ) ? s : {};
		o.description = src.description !== undefined ? src.description : '';
		if ( src.tags !== undefined ) o.tags = JSON.parse( JSON.stringify( src.tags ) );
		else if ( isSlot ) o.tags = [];
		if ( src.custom !== undefined ) o.custom = JSON.parse( JSON.stringify( src.custom ) );
		else if ( isSlot ) o.custom = {};
		return o;
	},

	unmigrateSfxArray: function( node: any, warnings: string[], path: string ): any[] {
		if ( !node.traits || typeof node.traits !== 'object' || Array.isArray( node.traits ) || !node.traits.SFX ) return [];
		const sfx = node.traits.SFX;
		if ( !this.isPureSfxContainer( sfx ) &&
			( ( sfx.traits && Object.keys( sfx.traits ).length ) || ( sfx.slots && Object.keys( sfx.slots ).length ) ) ) {
			this.warn( warnings, path + ': non-container SFX trait kept as trait, sub-traits also exported as sfx' );
		}
		const subs = ( sfx.traits && typeof sfx.traits === 'object' && !Array.isArray( sfx.traits ) ) ? sfx.traits : {};
		const subSlots = ( sfx.slots && typeof sfx.slots === 'object' && !Array.isArray( sfx.slots ) ) ? sfx.slots : {};
		const self = this;
		return this.orderedTraits( subs, subSlots, ( e: any ) => {
			if ( e.slot ) return self.unmigrateSfxEntry( e.key, subSlots[e.key], true );
			if ( subs[e.key] === null ) {
				self.warn( warnings, path + ': null sfx ' + JSON.stringify( e.key ) + ' has no old-form equivalent, dropped' );
				return null;
			}
			return self.unmigrateSfxEntry( e.key, subs[e.key], false );
		} );
	},

	unmigrateTemplateSet: function( name: string, set: any, warnings: string[] ): any {
		const here = 'set/' + name;
		if ( !set || typeof set !== 'object' || Array.isArray( set ) ) {
			this.warn( warnings, here + ': malformed set, dropped' );
			return null;
		}
		const ts: any = { id: set.id, name: name };
		Object.keys( set ).forEach( ( k: string ) => {
			if ( k === 'id' || k === 'name' || k === 'label' || k === 'traits' || k === 'slots' || k === 'sfx' ) return;
			ts[k] = JSON.parse( JSON.stringify( set[k] ) );
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
		ts.sfx = this.unmigrateSfxArray( set, warnings, here );
		if ( ts.tags === undefined ) ts.tags = [];
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
			out[k] = JSON.parse( JSON.stringify( layered[k] ) );
		} );
		const c: any = {
			$schema: 'https://cortex.engard.me/schema/0.1/character.schema.json',
			version: '0.1',
		};
		Object.keys( ch ).forEach( ( k: string ) => {
			if ( k === 'sets' || k === 'slots' ) return;
			c[k] = JSON.parse( JSON.stringify( ch[k] ) );
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

};
