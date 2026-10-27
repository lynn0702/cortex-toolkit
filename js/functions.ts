import * as traitHelpers from './cortex-toolkit-trait-helpers.ts';
import { materializeCharacter, toLayeredEntity } from './layered-materialize.ts';
import { cloneDeep } from './clone-deep.ts';
import { VIEW_KEY, getView, ensureView, isNameSet as isNameSetModel, resolveSheetStyle,
defaultNameHidden, getRating, ratingDice, setRatingDice } from './model.ts';
import type { Character, TraitSet, Trait, SetFeatures, DiceConfig, SheetTemplate, CharacterPrefs } from './model.ts';

declare const cortexSpotlightTemplates: any;

export const cortexFunctions = {

	cloneDeep: cloneDeep,
	VIEW_KEY: VIEW_KEY,
	getView: getView,
	ensureView: ensureView,

	// Layered-model helpers (TS pilot). Imported here so the TypeScript
	// toolchain compiles it into the bundle; consumers land during the UI pass.
	traitHelpers: traitHelpers,

	// Layered <-> legacy render seam (UI pass).
	materializeCharacter: materializeCharacter,
	toLayeredEntity: toLayeredEntity,

	arraysMatch: function( a: unknown, b: unknown ) {
		if ( !Array.isArray(a) || !Array.isArray(b) ) return false;
		if ( a.length !== b.length ) return false;
		for (let i = 0; i < a.length; i++) {
			if ( a[i] !== b[i] ) return false;
		}
		return true;
	},

	generateUUID: function() {
		if ( typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ) {
			return crypto.randomUUID();
		}
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c: string) {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	},

	getDieDisplayValue: function( dieValue: number ) {
		switch ( dieValue ) {
			case 4:  return '4';
			case 6:  return '6';
			case 8:  return '8';
			case 10: return '0';
			case 12: return '2';
			default: return '';
		}
	},

	loadGoogleFont: function( fontName: string ) {
		if ( !fontName || typeof document === 'undefined' ) return;
		const safeId = 'gfont-' + fontName.toLowerCase().replace(/[^a-z0-9]/g, '-');
		if ( document.getElementById(safeId) ) return;
		const link = document.createElement('link');
		link.id = safeId;
		link.rel = 'stylesheet';
		link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:ital,wght@0,400;0,600;0,700;1,400&display=swap`;
		document.head.appendChild(link);
	},

	applyCustomFont: function( fontName: string, base64Data: string ) {
		if ( !fontName || !base64Data || typeof document === 'undefined' ) return;
		const safeId = 'cfont-' + fontName.toLowerCase().replace(/[^a-z0-9]/g, '-');
		let style = document.getElementById(safeId);
		if ( !style ) {
			style = document.createElement('style');
			style.id = safeId;
			document.head.appendChild(style);
		}
		style.textContent = `@font-face { font-family: '${fontName}'; src: url('${base64Data}') format('woff2'), url('${base64Data}') format('woff'), url('${base64Data}') format('truetype'); font-weight: normal; font-style: normal; }`;
	},

	renderDieconSVG: function( dieValue: number, isFilled = false, extraClass = '', diceConfig: DiceConfig | null = null ) {
		const s = Number( dieValue ) || 8;
		const filledClass = isFilled ? 'diecon-filled' : 'diecon-unfilled';
		const cls = `diecon diecon-d${s} ${filledClass} ${extraClass}`.trim();

		const cfg = diceConfig || (typeof window !== 'undefined' ? (window as any).__cortexActiveDiceConfig : null);
		let fill = isFilled ? '#000000' : 'none';
		let stroke = '#000000';
		let textFill = isFilled ? '#ffffff' : '#000000';
		let strokeWidth = 1;
		let defs = '';

		if ( cfg && (cfg.style === 'custom' || cfg.backgroundType) ) {
			strokeWidth = Number(cfg.borderWidth) || 1;
			if ( isFilled ) {
				stroke = cfg.borderColor || '#000000';
				textFill = cfg.numeralColor || '#ffffff';
				if ( cfg.backgroundType === 'gradient' && cfg.backgroundColor1 && cfg.backgroundColor2 ) {
					const gradKey = `${s}-${cfg.backgroundColor1}-${cfg.backgroundColor2}-${cfg.gradientAngle || 135}`;
					let hash = 0;
					for ( let i = 0; i < gradKey.length; i++ ) {
						hash = ( ( hash << 5 ) - hash ) + gradKey.charCodeAt( i );
						hash |= 0;
					}
					const gradSlug = Math.abs( hash ).toString( 36 );
					const gradId = `die-grad-${s}-${gradSlug}`;
					const angle = Number(cfg.gradientAngle) || 135;
					const rad = (angle - 90) * (Math.PI / 180);
					const x1 = Math.round(50 + Math.cos(rad + Math.PI) * 50);
					const y1 = Math.round(50 + Math.sin(rad + Math.PI) * 50);
					const x2 = Math.round(50 + Math.cos(rad) * 50);
					const y2 = Math.round(50 + Math.sin(rad) * 50);
					defs = `<defs><linearGradient id="${gradId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%"><stop offset="0%" stop-color="${cfg.backgroundColor1}"/><stop offset="100%" stop-color="${cfg.backgroundColor2}"/></linearGradient></defs>`;
					fill = `url(#${gradId})`;
				} else {
					fill = cfg.backgroundColor1 || cfg.background || '#000000';
				}
			} else {
				// Unset / unfilled dice: must remain unfilled (transparent) and only show border outline + numeral
				fill = 'none';
				stroke = (cfg.unfilledBorder && cfg.unfilledBorder !== 'none') ? cfg.unfilledBorder : (cfg.borderColor || '#000000');
				if ( stroke.toLowerCase() === '#ffffff' || stroke.toLowerCase() === '#fff' ) {
					stroke = '#334155';
				}
				textFill = stroke;
			}
		} else {
			if ( !isFilled ) {
				fill = 'none';
				stroke = '#000000';
				textFill = '#000000';
			}
		}

		let shape = '';
		let text = '';

		if ( s === 4 ) {
			// Inverted triangle pointing down
			shape = `<polygon points="2.5,4 21.5,4 12,20" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-linejoin="round"/>`;
			text = `<text aria-hidden="true" x="12" y="9.8" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="900" font-family="Roboto, sans-serif" fill="${textFill}">4</text>`;
		} else if ( s === 6 ) {
			// Square
			shape = `<rect x="3.5" y="3.5" width="17" height="17" rx="1" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}"/>`;
			text = `<text aria-hidden="true" x="12" y="12" text-anchor="middle" dominant-baseline="central" font-size="10.5" font-weight="900" font-family="Roboto, sans-serif" fill="${textFill}">6</text>`;
		} else if ( s === 8 ) {
			// Diamond
			shape = `<polygon points="12,2.5 21.5,12 12,21.5 2.5,12" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-linejoin="round"/>`;
			text = `<text aria-hidden="true" x="12" y="12" text-anchor="middle" dominant-baseline="central" font-size="10.5" font-weight="900" font-family="Roboto, sans-serif" fill="${textFill}">8</text>`;
		} else if ( s === 10 ) {
			// Kite / Hexagon
			shape = `<polygon points="12,2.5 21.5,7.5 21.5,16.5 12,21.5 2.5,16.5 2.5,7.5" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-linejoin="round"/>`;
			text = `<text aria-hidden="true" x="12" y="12" text-anchor="middle" dominant-baseline="central" font-size="9.5" font-weight="900" letter-spacing="-0.02em" font-family="Roboto, sans-serif" fill="${textFill}">10</text>`;
		} else if ( s === 12 ) {
			// Regular pentagon pointing up
			shape = `<polygon points="12,2.7 21.7,9.8 18,21.3 6,21.3 2.3,9.8" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-linejoin="round"/>`;
			text = `<text aria-hidden="true" x="12" y="12.2" text-anchor="middle" dominant-baseline="central" font-size="9.5" font-weight="900" letter-spacing="-0.02em" font-family="Roboto, sans-serif" fill="${textFill}">12</text>`;
		} else {
			shape = `<rect x="3.5" y="3.5" width="17" height="17" rx="1" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}"/>`;
			text = `<text aria-hidden="true" x="12" y="12" text-anchor="middle" dominant-baseline="central" font-size="10.5" font-weight="900" font-family="Roboto, sans-serif" fill="${textFill}">${s}</text>`;
		}

		return `<svg role="img" aria-label="d${s}" class="${cls}" viewBox="0 0 24 24" width="1.45rem" height="1.45rem" style="display:inline-block; vertical-align:middle; overflow:visible; width:var(--diecon-size, 1.45rem); height:var(--diecon-size, 1.45rem);">${defs}${shape}${text}</svg>`;
	},

	getTraitSetRatings: function( traitSet: TraitSet ) {
		const custom = getView( traitSet );
		if ( Array.isArray(custom?.ratingScale) && custom.ratingScale.length > 0 ) {
			return [...custom.ratingScale].sort((a, b) => a - b);
		}
		return [4, 6, 8, 10, 12];
	},

	getRingTrait: function( traitSet: TraitSet ) {
		const ctk = getView( traitSet );
		if ( !ctk ) return undefined;
		return ctk.ringTrait !== undefined ? ctk.ringTrait : ctk.attributesRing;
	},

	getSubtraitRatings: function( traitSet: TraitSet ) {
		const custom = getView( traitSet );
		if ( Array.isArray(custom?.subtraitRatingScale) && custom.subtraitRatingScale.length > 0 ) {
			return [...custom.subtraitRatingScale].sort((a, b) => a - b);
		}
		return [4, 6, 8, 10, 12];
	},

	// Paired-slots convention: secondary slots floor at d6 on a standard
	// scale. Slot-indexed so sheet and editor share one rule instead of
	// the sheet keying off position and the editor name-sniffing BONUS.
	getSubtraitSlotRatings: function( traitSet: TraitSet, slot: number ) {
		const ratings = this.getSubtraitRatings( traitSet );
		const body = getView( traitSet )?.style?.body;
		if ( body === 'paired-slots' && slot >= 1 && ratings.length === 5 && ratings[0] === 4 ) {
			return ratings.filter( ( size: number ) => size >= 6 );
		}
		return ratings;
	},

	// Set names whose trait names are system labels: they print on blank
	// sheets. Central list so the check is data, not inline sniffing.
	fixedNameSetKeys: [ 'attribute', 'value', 'drive', 'role', 'affiliation', 'branch', 'eidolon', 'power', 'system', 'chassis' ],
	isFixedNameSet: function( setName: unknown ) {
		const n = typeof setName === 'string' ? setName.toLowerCase() : '';
		if ( !n.length ) return false;
		return this.fixedNameSetKeys.some( ( k: string ) => n.includes( k ) );
	},

	isPlayAddRemovableSet: function( traitSetArg: any ): boolean {
		if ( !traitSetArg ) return false;
		const view = getView( traitSetArg );
		if ( typeof ( view as any )?.playMutable === 'boolean' ) return ( view as any ).playMutable;
		const body = view?.style?.body;
		const name = ( traitSetArg.name || '' ).trim().toLowerCase();
		if ( name.includes( 'complication' ) ) return true;
		if ( body === 'stress' && !this.isFixedNameSet( name ) ) return true;
		return false;
	},

	setPlotPoints: function( char: any, val: number ) {
		if ( !char ) return;
		const n = Math.max( 0, Math.floor( val ) );
		char.plotPoints = n;
		const t = this.ensureNameTrait( char, 'plotPoints' );
		if ( t ) {
			t.rating = { type: 'Counter', value: [ n ], range: [ 0, 20 ] };
		}
	},

	hasAttachedStress: function( traitSetArg: any ): boolean {
		if ( !traitSetArg ) return false;
		const view = getView( traitSetArg );
		const parts = view?.parts;
		if ( parts && typeof parts === 'object' && !Array.isArray( parts ) ) {
			if ( ( parts as any ).stress ) return true;
		}
		return Boolean( view?.attachedStress?.enabled );
	},

	getAttachedStressLabel: function( traitSetArg: any ): string {
		if ( !traitSetArg ) return 'Stress';
		const view = getView( traitSetArg );
		const labels = view?.labels;
		if ( labels && typeof labels.stress === 'string' && labels.stress.length ) return labels.stress;
		return view?.attachedStress?.label || 'Stress';
	},

	getAttachedStressScale: function( traitSetArg: any ): number[] {
		if ( !traitSetArg ) return [ 4, 6, 8, 10, 12 ];
		const view = getView( traitSetArg );
		const legacy = view?.attachedStress;
		if ( legacy && typeof legacy === 'object' ) {
			if ( Array.isArray( legacy.scale ) && legacy.scale.length ) return legacy.scale;
			if ( Array.isArray( legacy.ratingScale ) && legacy.ratingScale.length ) return legacy.ratingScale;
		}
		return [ 4, 6, 8, 10, 12 ];
	},

	// The SFX container is a child trait literally named "SFX" with no
	// rating of its own; its children are the SFX entries. Shape + name,
	// never a field — this is the dissolve of the old `sfx` array.
	isSfxContainer: function( t: unknown ) {
		return Boolean( t && typeof t === 'object' && !Array.isArray( t ) && ( t as any ).name === 'SFX' && getRating( t ) === undefined );
	},
	sfxChildren: function( node: unknown ) {
		const subs = node && typeof node === 'object' ? ( node as any ).traits : undefined;
		if ( !Array.isArray( subs ) ) return [];
		const container = subs.find( ( st: any ) => this.isSfxContainer( st ) );
		return ( container && Array.isArray( container.traits ) ) ? container.traits : [];
	},

	// The SFX container child, created on demand (sparse: absent until an
	// SFX exists).
	ensureSfxContainer: function( node: unknown ) {
		if ( !node || typeof node !== 'object' ) return null;
		const rec = node as any;
		if ( !Array.isArray( rec.traits ) ) rec.traits = [];
		let container = rec.traits.find( ( st: any ) => this.isSfxContainer( st ) );
		if ( !container ) {
			container = { name: 'SFX', traits: [] };
			rec.traits.push( container );
		}
		return container;
	},

	// Drop an SFX entry by index, removing the container when it empties.
	removeSfxAt: function( node: unknown, index: number ) {
		if ( !node || typeof node !== 'object' ) return;
		const rec = node as any;
		if ( !Array.isArray( rec.traits ) ) return;
		const container = rec.traits.find( ( st: any ) => this.isSfxContainer( st ) );
		if ( !container || !Array.isArray( container.traits ) ) return;
		container.traits.splice( index, 1 );
		if ( !container.traits.length ) {
			const ci = rec.traits.indexOf( container );
			if ( ci !== -1 ) rec.traits.splice( ci, 1 );
		}
	},

	// Hinder is a child trait named "Hinder" in the SFX container.
	hasHinder: function( node: unknown ) {
		return this.sfxChildren( node ).some( ( e: any ) => String( e.name || '' ).toLowerCase() === 'hinder' );
	},
	setHinder: function( node: unknown, present: boolean ) {
		if ( !node || typeof node !== 'object' ) return;
		const rec = node as any;
		if ( !present ) {
			if ( !Array.isArray( rec.traits ) ) return;
			const container = rec.traits.find( ( st: any ) => this.isSfxContainer( st ) );
			if ( !container || !Array.isArray( container.traits ) ) return;
			const idx = container.traits.findIndex( ( e: any ) => String( e.name || '' ).toLowerCase() === 'hinder' );
			if ( idx === -1 ) return;
			container.traits.splice( idx, 1 );
			if ( !container.traits.length ) {
				const ci = rec.traits.indexOf( container );
				if ( ci !== -1 ) rec.traits.splice( ci, 1 );
			}
			return;
		}
		const container = this.ensureSfxContainer( node );
		if ( !container || !Array.isArray( container.traits ) ) return;
		const idx = container.traits.findIndex( ( e: any ) => String( e.name || '' ).toLowerCase() === 'hinder' );
		if ( idx === -1 ) container.traits.unshift( { name: 'Hinder' } );
	},

	// The statement container is a child trait literally named "Statement"
	// with no rating of its own; its single child is the sentence, carrying
	// the questioned state as a Pip rating. Shape + name, never a field —
	// this is the dissolve of the old `statement`/`questioned` pair.
	isStatementContainer: function( t: unknown ) {
		return Boolean( t && typeof t === 'object' && !Array.isArray( t ) && ( t as any ).name === 'Statement' && getRating( t ) === undefined );
	},
	statementContainer: function( node: unknown ) {
		const subs = node && typeof node === 'object' ? ( node as any ).traits : undefined;
		if ( !Array.isArray( subs ) ) return undefined;
		return subs.find( ( st: any ) => this.isStatementContainer( st ) );
	},
	statementChild: function( node: unknown ) {
		const container = this.statementContainer( node );
		return ( container && Array.isArray( container.traits ) ) ? ( container.traits[ 0 ] || undefined ) : undefined;
	},
	statementText: function( node: unknown ) {
		const child = this.statementChild( node );
		return ( child && typeof child.name === 'string' ) ? child.name : '';
	},
	isStatementFilled: function( node: unknown ) {
		const child = this.statementChild( node );
		const rating = child ? getRating( child ) : undefined;
		return Boolean( rating && rating.type === 'Pip' && rating.value[ 0 ] === true );
	},
	// The container child, created on demand (sparse: absent until a
	// statement exists). The sentence is the child's name.
	ensureStatementContainer: function( node: unknown ) {
		if ( !node || typeof node !== 'object' ) return null;
		const rec = node as any;
		if ( !Array.isArray( rec.traits ) ) rec.traits = [];
		let container = rec.traits.find( ( st: any ) => this.isStatementContainer( st ) );
		if ( !container ) {
			container = { name: 'Statement', traits: [] };
			rec.traits.push( container );
		}
		if ( !Array.isArray( container.traits ) ) container.traits = [];
		return container;
	},
	// Write the questioned state onto the existing sentence pip. Returns
	// false when no statement exists (a state without text has no home).
	setStatementFilled: function( node: unknown, filled: boolean ) {
		const child = this.statementChild( node );
		if ( !child ) return false;
		( child as any ).rating = { type: 'Pip', value: [ Boolean( filled ) ] };
		return true;
	},
	// Rename / create / remove the sentence pip. Blank text dissolves the
	// container (questioned state cannot outlive its sentence).
	setStatementText: function( node: unknown, text: unknown ) {
		if ( !node || typeof node !== 'object' ) return;
		const rec = node as any;
		const sentence = typeof text === 'string' ? text.trim() : '';
		if ( !sentence ) {
			if ( !Array.isArray( rec.traits ) ) return;
			const idx = rec.traits.findIndex( ( st: any ) => this.isStatementContainer( st ) );
			if ( idx !== -1 ) rec.traits.splice( idx, 1 );
			return;
		}
		const container = this.ensureStatementContainer( node );
		if ( !container || !Array.isArray( container.traits ) ) return;
		let child = container.traits[ 0 ];
		if ( !child || typeof child !== 'object' ) {
			child = { name: sentence };
			container.traits.push( child );
		} else {
			child.name = sentence;
		}
		const rating = getRating( child );
		if ( !rating || rating.type !== 'Pip' ) {
			child.rating = { type: 'Pip', value: [ false ] };
		} else {
			child.rating = { type: 'Pip', value: [ rating.value[ 0 ] === true ] };
		}
	},

	// Feature defaults seeded when a trait-set style is chosen.
	// Used by the trait set editor and the style gallery alike.
	defaultFeaturesForStyle: function( style: string ) {
		const map: Record<string, { features: SetFeatures }> = {
			'three-column-table':      { features: { description: true,  sfx: true,  subtraits: false } },
			'paired-slots':           { features: { description: false, sfx: false, subtraits: true  } },
			'subtrait-columns': { features: { description: false, sfx: false, subtraits: true  } },
			'die-rows':       { features: { description: false, sfx: false, subtraits: false } },
			'dice-count':    { features: { description: false, sfx: false, subtraits: false } },
			'dice-ladder':      { features: { description: false, sfx: false, subtraits: false } },
			'labeled-fields':     { features: { description: true,  sfx: false, subtraits: false } },
		};
		if ( map[ style ] ) return map[ style ];
		return { features: { description: false, sfx: false, subtraits: false } };
	},

	// Central registry of default labels for trait-set style regions.
	// Custom labels live in custom.cortexToolkit.labels under the same keys;
	// anything absent here (or unset there) renders as ''.
	defaultTraitSetLabels: {
		'subtrait-columns': { left: 'SKILL', right: 'SPECIALTIES' },
		'three-column-table':      { col1: 'TALENT', col2: 'ACTIVATION', col3: 'EFFECT' },
		'dice-count':    { rating: 'RATING', dice: '/ DICE' },
		'paired-slots':           { slot0: 'COMPLICATION', slot1: 'BONUS' },
	} as Record<string, Record<string, string>>,

	labelDefaultForStyle: function( style: string | undefined, key: string ) {
		const map = style ? this.defaultTraitSetLabels[ style ] : undefined;
		if ( map && map[ key ] !== undefined ) return map[ key ];
		if ( ( this.commonLabelDefaults as Record<string, string> )[ key ] !== undefined ) {
			return ( this.commonLabelDefaults as Record<string, string> )[ key ];
		}
		return '';
	},

	// Chrome words shared by every set body; settable via view.labels.*.
	commonLabelDefaults: {
		out: '💥 OUT',
		sfxBadge: 'SFX',
		sfxPrefix: 'SFX:',
		hinderSentence: '',
	} as Record<string, string>,

	// The name block is the first trait set — see model.isNameSet.
	isNameSet: function( set: any ) {
		return isNameSetModel( set );
	},

	// Read a name-set trait without creating anything (render path).
	getNameTrait: function( character: any, key: string ) {
		const sets = character && Array.isArray( character.traitSets ) ? character.traitSets : [];
		const set = sets.find( ( s: any ) => isNameSetModel( s ) );
		if ( !set || !Array.isArray( set.traits ) ) return undefined;
		return set.traits.find( ( t: any ) => t && typeof t === 'object' && t.name === key );
	},

	// Resolve a name-set trait for editing, creating the set and trait
	// when absent (legacy files predate the set). Values stay on the
	// character fields; only label/hidden live here. Created traits hide
	// only where the style renders no zone for them (game/PP/notes in
	// spotlight); shown is absence, never a stored word.
	ensureNameTrait: function( character: any, key: string ) {
		if ( !character || !Array.isArray( character.traitSets ) ) return null;
		let set = character.traitSets.find( ( s: any ) => isNameSetModel( s ) );
		if ( !set ) {
			set = { id: 'name', name: 'Name', traits: [], view: { style: { header: 'default', body: 'name' } } };
			character.traitSets.unshift( set );
		}
		if ( !Array.isArray( set.traits ) ) set.traits = [];
		let trait = set.traits.find( ( t: any ) => t && typeof t === 'object' && t.name === key );
		if ( !trait ) {
			trait = { name: key, description: '', traits: [], tags: [] };
			if ( defaultNameHidden( key, character ) ) trait.view = { visibility: 'hidden' };
			set.traits.push( trait );
		}
		return trait;
	},

	getTraitDice: function( trait: Trait ) {
		if ( !trait ) return [];
		const rating = getRating( trait );
		if ( rating ) return ratingDice( rating );
		return [];
	},

	setTraitDice: function( trait: Trait, diceArray: number[] ) {
		if ( !trait ) return;
		setRatingDice( trait as unknown as Record<string, any>, diceArray );
	},

	renderDate( timestamp: string | number | Date ) {
		let date = new Date( timestamp );
		return date.toLocaleString();
	},

	renderText: function( text: unknown ) {
		if ( !text || typeof text !== 'string' ) return '';
		return this.renderInlineMarkdown( text ).replace( /\n/g, '<br>' );
	},
	escapeHtml: function( text: unknown ) {
		if ( text === null || text === undefined ) return '';
		return String( text )
			.replace( /&/g, '&amp;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&#39;' );
	},

	// Only these URL schemes are safe to render (links and images).
	// Scheme-less URLs (relative paths, fragments) cannot execute script
	// and are always allowed here.
	isSafeUrl: function( url: unknown, allowDataImage: boolean ) {
		if ( !url || typeof url !== 'string' ) return false;
		// Browsers strip ASCII tab/newline from URLs before parsing, so an
		// attacker could smuggle a scheme past a naive check. Strip first.
		const clean = url.replace( /[\t\n\r]/g, '' ).trim();
		if ( !clean.length ) return false;
		const scheme = clean.match( /^([a-zA-Z][a-zA-Z0-9+.-]*):/ );
		if ( !scheme ) return true;
		const s = scheme[1].toLowerCase();
		if ( s === 'http' || s === 'https' || s === 'mailto' ) return true;
		if ( allowDataImage && s === 'data' && /^data:image\/(png|jpe?g|gif|webp|svg\+xml|bmp|avif);base64,/i.test( clean ) ) return true;
		if ( allowDataImage && s === 'blob' ) return true;
		return false;
	},

	// Returns a URL safe for CSS url(...) / background bindings, else ''.
	// On top of the scheme check this rejects whitespace, quotes, parens
	// and angle brackets, which could otherwise break out of the url()
	// token (quoted or not) into arbitrary CSS.
	safeImageUrl: function( url: unknown ) {
		if ( !url || typeof url !== 'string' ) return '';
		const clean = url.trim();
		if ( !clean.length || /[\s'"()\\<>`]/.test( clean ) ) return '';
		return this.isSafeUrl( clean, true ) ? clean : '';
	},

	// Downscales an uploaded image to a data URL (caps localStorage/IDB bloat).
	processImageFile: function( file: File, maxDimension: number, quality: number ): Promise<string> {
		maxDimension = maxDimension || 1024;
		quality = ( quality === undefined || quality === null ) ? 0.85 : quality;
		return new Promise( ( resolve, reject ) => {
			if ( !file ) return reject( new Error( 'No file provided.' ) );
			if ( file.type && file.type.indexOf( 'image/' ) !== 0 ) {
				return reject( new Error( 'That file is not an image.' ) );
			}
			if ( file.size > 8 * 1024 * 1024 ) {
				return reject( new Error( 'Image is larger than 8 MB.' ) );
			}
			const reader = new FileReader();
			reader.onerror = () => reject( new Error( 'Could not read that file.' ) );
			reader.onload = () => {
				const img = new Image();
				img.onerror = () => reject( new Error( 'Could not decode that image.' ) );
				img.onload = () => {
					try {
						let w = img.naturalWidth || img.width;
						let h = img.naturalHeight || img.height;
						const scale = Math.min( 1, maxDimension / Math.max( w, h, 1 ) );
						w = Math.max( 1, Math.round( w * scale ) );
						h = Math.max( 1, Math.round( h * scale ) );
						const canvas = document.createElement( 'canvas' );
						canvas.width = w;
						canvas.height = h;
						canvas.getContext( '2d' )!.drawImage( img, 0, 0, w, h );
						resolve( canvas.toDataURL( 'image/jpeg', quality ) );
					} catch ( e ) {
						reject( e );
					}
				};
				img.src = reader.result as string;
			};
			reader.readAsDataURL( file );
		});
	},

	// Minimal shape check + normalization for imported characters.
	// Also unwraps upstream envelopes such as { version: 2, data: {...} }:
	// the inner payload is imported as a NEW character (fresh UUID when the
	// inner payload has none, so it can never overwrite an existing entry
	// by accident). Unknown inner shapes are still safely defaulted below.
	sanitizeImportedCharacter: function( data: any ) {
		if ( !data || typeof data !== 'object' || Array.isArray( data ) ) return null;
		let inner = data;
		let unwrapped = false;
		if ( ( typeof inner.id !== 'string' || !inner.id.length ) && inner.data && typeof inner.data === 'object' && !Array.isArray( inner.data ) ) {
			inner = inner.data;
			unwrapped = true;
		}
		if ( ( typeof inner.id !== 'string' || !inner.id.length ) ) {
			if ( !unwrapped ) return null;
			inner = Object.assign( {}, inner );
			inner.id = this.generateUUID();
		}
		const clean = cloneDeep( inner );
		// D5: import must not materialize defaults — missing lists/objects
		// inherit from the template at merge; the renderer treats absence
		// as empty. Only identity (set ids) is ensured below.
		// D8: no duplicate non-blank trait/subtrait names (ambiguous join).
		// Blank slots are positional and exempt.
		const dupes = ( traits: any ) => {
			if ( !Array.isArray( traits ) ) return false;
			const seen = new Set();
			for ( const tr of traits ) {
				if ( !tr || typeof tr !== 'object' ) continue;
				if ( typeof tr.name === 'string' && tr.name.length ) {
					if ( seen.has( tr.name ) ) return true;
					seen.add( tr.name );
				}
				if ( dupes( tr.traits ) ) return true;
			}
			return false;
		};
		for ( const ts of ( Array.isArray( clean.traitSets ) ? clean.traitSets : [] ) ) {
			if ( ts && dupes( ts.traits ) ) return null;
		}
		this.ensureTraitSetIds( clean );
		return clean;
	},

	// ---------- Sheet template layer (layout/data split) ----------
	// A sheet template is a character-shaped blank (same shape as a
	// character: { id, title, ..., character: {...} }, exactly like the
	// spotlight library entries). The character keeps the same shape but
	// sparse: any layout value it doesn't set resolves from its template
	// (sheet.template.id). Resolution materializes at load (merge) and
	// prunes at persist/export (strip), so the renderer reads full inline
	// layout untouched while stored/exported JSON stays hand-editable.
	// Template ids are static strings so imports dedupe instead of
	// duplicating. Join key between the two shapes: stable trait-set ids.

	TEMPLATE_FORMAT_VERSION: 1,

	TEMPLATE_SCHEMA_URL: 'https://cortex.engard.me/schema/0.1/sheet-template.schema.json',

	deepEqual: function( a: unknown, b: unknown ) {
		if ( a === b ) return true;
		if ( typeof a !== typeof b || a === null || b === null || a === undefined || b === undefined ) return false;
		if ( Array.isArray( a ) !== Array.isArray( b ) ) return false;
		if ( Array.isArray( a ) ) {
			const arrA = a, arrB = b as unknown[];
			if ( arrA.length !== arrB.length ) return false;
			for ( let i = 0; i < arrA.length; i++ ) {
				if ( !this.deepEqual( arrA[i], arrB[i] ) ) return false;
			}
			return true;
		}
		if ( typeof a === 'object' ) {
			const recA = a as Record<string, unknown>, recB = b as Record<string, unknown>;
			const ka = Object.keys( recA ), kb = Object.keys( recB );
			if ( ka.length !== kb.length ) return false;
			for ( const k of ka ) {
				if ( !Object.prototype.hasOwnProperty.call( recB, k ) || !this.deepEqual( recA[k], recB[k] ) ) return false;
			}
			return true;
		}
		return false;
	},

	slugifySetId: function( name: string, taken: Set<string> ) {
		let base = String( name || '' ).toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /^-+|-+$/g, '' ).slice( 0, 40 ) || 'set';
		let id = base, i = 2;
		while ( taken.has( id ) ) id = base + '-' + ( i++ );
		taken.add( id );
		return id;
	},

	// App-local instance ids for traits/subtraits (D10): stable Vue :keys
	// and rename-proof preference keys. Stored at rest (IndexedDB), NEVER
	// exported (stripped with the layout deltas). Assigned at creation and
	// import; load fills gaps only — existing ids are never rewritten.
	// Structural mutators over loose character-like objects (defaults, drafts,
	// templates): params stay `any` on purpose — the shape is not yet a Character.
	assignLids: function( character: any ) {
		if ( !character || !Array.isArray( character.traitSets ) ) return character;
		const lid = () => ( typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' )
			? crypto.randomUUID()
			: ( 'lid-' + Math.random().toString( 36 ).slice( 2 ) + Date.now().toString( 36 ) );
		const walk = ( traits: Trait[] | undefined ) => {
			if ( !Array.isArray( traits ) ) return;
			traits.forEach( ( tr ) => {
				if ( !tr || typeof tr !== 'object' ) return;
				if ( typeof tr._lid !== 'string' || !tr._lid.length ) tr._lid = lid();
				walk( tr.traits );
			} );
		};
		character.traitSets.forEach( ( ts: any ) => { if ( ts ) walk( ts.traits ); } );
		return character;
	},

	// Strip app-local and forbidden-below-set keys for export: _lid
	// everywhere below set level, plus any stray trait-level `id` (D1).
	// Set-level ids are the stable join key and are always kept: the array
	// merge joins sets by id, and the layered materializer heals renames by
	// id (name is the address, id the identity — rename the name freely,
	// never the id).
	stripInternalIds: function( node: { traitSets?: TraitSet[]; traits?: Trait[] } ) {
		const walkTraits = ( traits: Trait[] | undefined ) => {
			if ( !Array.isArray( traits ) ) return;
			traits.forEach( ( tr ) => {
				if ( !tr || typeof tr !== 'object' ) return;
				delete tr._lid;
				delete tr.id;
				walkTraits( tr.traits );
			} );
		};
		if ( !node || typeof node !== 'object' ) return;
		if ( Array.isArray( node.traitSets ) ) {
			node.traitSets.forEach( ( ts ) => { if ( ts ) walkTraits( ts.traits ); } );
		}
		if ( Array.isArray( node.traits ) ) walkTraits( node.traits );
	},

	// Stable per-set ids are the join key between a character and its sheet
	// template. Slugs stay readable in raw JSON; uniqueness is per character.
	ensureTraitSetIds: function( character: any ) {
		if ( !character || !Array.isArray( character.traitSets ) ) return character;
		// 'name' is reserved for the name block (identity fallback when a
		// stored set's view bag prunes away); never assign it elsewhere.
		const taken = new Set<string>( [ 'name' ] );
		character.traitSets.forEach( ( ts: any ) => {
			if ( ts && typeof ts.id === 'string' && ts.id.length ) taken.add( ts.id );
		} );
		character.traitSets.forEach( ( ts: any ) => {
			if ( ts && ( typeof ts.id !== 'string' || !ts.id.length ) ) {
				ts.id = this.isNameSet( ts ) ? 'name' : this.slugifySetId( ts.name, taken );
			}
		} );
		return character;
	},

	findSpotlightTemplate: function( id: string ) {
		if ( !id || typeof cortexSpotlightTemplates === 'undefined' ) return null;
		return cortexSpotlightTemplates.find( ( t: any ) => t.id === id ) || null;
	},

	// Resolve the template entry for a character: live store array first
	// (passed in by editors via $root), then the built-in library.
	resolveTemplateFor: function( character: Character, storeTemplates: SheetTemplate[] | null ): SheetTemplate | null {
		const t = character && character.sheet && character.sheet.template;
		const id = t ? ( typeof t === 'string' ? t : t.id ) : null;
		if ( !id ) return null;
		const ver = ( t && typeof t === 'object' && t.version ) || null;
		if ( Array.isArray( storeTemplates ) ) {
			const pool = storeTemplates.filter( x => x && x.id === id );
			if ( pool.length ) {
				if ( ver ) {
					const exact = pool.find( x => ( x.version || 1 ) === ver );
					if ( exact ) return exact;
				}
				pool.sort( ( a, b ) => ( Number( b.version || 1 ) - Number( a.version || 1 ) ) );
				return pool[0];
			}
		}
		return this.findSpotlightTemplate( id );
	},

	templateSetById: function( templateEntry: SheetTemplate | null, setId: string ): TraitSet | null {
		const ch = this.findTemplateCharacter( templateEntry );
		if ( !ch || !Array.isArray( ch.traitSets ) ) return null;
		return ch.traitSets.find( ( ts ) => ts && ts.id === setId ) || null;
	},

	// D19 removal core: drop the trait from the live sheet and remember its
	// name on the parent set's removedTraits (no confirmation — explicit and
	// reversible via restore). Returns true when a template-inherited trait
	// was removed (plain deletes return false and splice only).
	removeTraitFromSheet: function( character: Character, templateEntry: SheetTemplate | null, s: number, t: number ): boolean {
		const ts = character && character.traitSets ? character.traitSets[s] : null;
		const tr = ts && Array.isArray( ts.traits ) ? ts.traits[t] : null;
		if ( !tr ) return false;
		let inherited = false;
		if ( tr.name && templateEntry && ts && ts.id ) {
			const base = this.templateSetById( templateEntry, ts.id );
			inherited = Boolean( base && Array.isArray( base.traits ) &&
				base.traits.some( ( b ) => b && b.name === tr.name ) );
			if ( inherited ) {
				if ( !Array.isArray( ts.removedTraits ) ) ts.removedTraits = [];
				if ( !ts.removedTraits.includes( tr.name ) ) ts.removedTraits.push( tr.name );
			}
		}
		ts!.traits.splice( t, 1 );
		return inherited;
	},

	// Subtrait removal: same, against the parent trait's removedTraits.
	removeSubtraitFromSheet: function( character: Character, templateEntry: SheetTemplate | null, s: number, t: number, u: number ): boolean {
		const ts = character && character.traitSets ? character.traitSets[s] : null;
		const tr = ts && Array.isArray( ts.traits ) ? ts.traits[t] : null;
		const st = tr && Array.isArray( tr.traits ) ? tr.traits[u] : null;
		if ( !st ) return false;
		let inherited = false;
		if ( st.name && templateEntry && ts && ts.id && tr && tr.name ) {
			const base = this.templateSetById( templateEntry, ts.id );
			const btr = base && Array.isArray( base.traits )
				? base.traits.find( ( b ) => b && b.name === tr.name ) : null;
			inherited = Boolean( btr && Array.isArray( btr.traits ) &&
				btr.traits.some( ( b ) => b && b.name === st.name ) );
			if ( inherited ) {
				if ( !Array.isArray( tr.removedTraits ) ) tr.removedTraits = [];
				if ( !tr.removedTraits.includes( st.name ) ) tr.removedTraits.push( st.name );
			}
		}
		tr!.traits!.splice( u, 1 );
		return inherited;
	},

	// Template traits (by name) not currently on the live sheet, including
	// removed ones — the restore menu (D19). Editor maintains the invariant:
	// restoring clears the name from removedTraits (D6).
	restorableTraits: function( character: Character, templateEntry: SheetTemplate | null, s: number ): string[] {
		const ts = character && character.traitSets ? character.traitSets[s] : null;
		if ( !ts ) return [];
		const base = ( ts.id && templateEntry ) ? this.templateSetById( templateEntry, ts.id ) : null;
		if ( !base || !Array.isArray( base.traits ) ) return [];
		const live = new Set(
			( Array.isArray( ts.traits ) ? ts.traits : [] )
				.filter( ( x ) => x && typeof x.name === 'string' && x.name.length )
				.map( ( x ) => x.name )
		);
		return base.traits
			.filter( ( b ) => b && typeof b.name === 'string' && b.name.length && !live.has( b.name ) )
			.map( ( b ) => b.name );
	},

	restoreTraitOnSheet: function( character: Character, templateEntry: SheetTemplate | null, s: number, name: string ): boolean {
		const ts = character && character.traitSets ? character.traitSets[s] : null;
		if ( !ts || !name ) return false;
		if ( Array.isArray( ts.removedTraits ) ) {
			ts.removedTraits = ts.removedTraits.filter( ( n ) => n !== name );
		}
		if ( !Array.isArray( ts.traits ) ) ts.traits = [];
		if ( ts.traits.some( ( x ) => x && x.name === name ) ) return true;
		const base = ( ts.id && templateEntry ) ? this.templateSetById( templateEntry, ts.id ) : null;
		const btrait = base && Array.isArray( base.traits ) ? base.traits.find( ( b ) => b && b.name === name ) : null;
		if ( btrait ) {
			const clone = cloneDeep( btrait );
			delete clone._lid;
			delete clone.id;
			ts.traits.push( clone );
			this.assignLids( character );
			return true;
		}
		return false;
	},

	// Set-level removal analog (brief: removedSets similarly needed).
	// Template-derived sets are remembered by id; custom sets just splice.
	removeTraitSetFromSheet: function( character: Character, templateEntry: SheetTemplate | null, s: number ): boolean {
		const ts = character && character.traitSets ? character.traitSets[s] : null;
		if ( !ts ) return false;
		let inherited = false;
		if ( ts.id && templateEntry ) {
			inherited = Boolean( this.templateSetById( templateEntry, ts.id ) );
			if ( inherited ) {
				if ( !Array.isArray( character.removedSets ) ) character.removedSets = [];
				if ( !character.removedSets.includes( ts.id ) ) character.removedSets.push( ts.id );
			}
		}
		character.traitSets.splice( s, 1 );
		return inherited;
	},

	// A standalone template file/entry: same shape as the spotlight
	// library ({ id (static), title, ..., character: {...} }).
	isSheetTemplateFile: function( data: unknown ): boolean {
		const d = data as Record<string, unknown> | null;
		return Boolean( d && typeof d === 'object' && !Array.isArray( d ) &&
			typeof d.id === 'string' && ( d.id as string ).length &&
			d.character && typeof d.character === 'object' &&
			Array.isArray( ( d.character as Record<string, unknown> ).traitSets ) );
	},

	findTemplateCharacter: function( templateEntry: SheetTemplate | null ): Character | null {
		return templateEntry && templateEntry.character ? templateEntry.character : null;
	},

	// Preference export/import (brief D18): arrangement travels in the file
	// in name-keyed form (stable across _lid regeneration); live prefs stay
	// _lid-keyed. Blank slots export as '' and resolve positionally.
	prefsForExport: function( prefsEntry: CharacterPrefs | null, character: Character ): CharacterPrefs | null {
		if ( !prefsEntry || typeof prefsEntry !== 'object' ) return null;
		const out: CharacterPrefs = {};
		if ( Array.isArray( prefsEntry.setOrder ) && prefsEntry.setOrder.length ) {
			out.setOrder = prefsEntry.setOrder.slice();
		}
		if ( prefsEntry.traitOrders && typeof prefsEntry.traitOrders === 'object' ) {
			const bySet: Record<string, string[]> = {};
			( character && Array.isArray( character.traitSets ) ? character.traitSets : [] ).forEach( ( ts ) => {
				if ( !ts || !ts.id || !Array.isArray( ts.traits ) ) return;
				const lids = prefsEntry.traitOrders![ ts.id ];
				if ( !Array.isArray( lids ) || !lids.length ) return;
				const byLid = new Map<string, Trait>();
				ts.traits.forEach( ( tr ) => {
					if ( tr && tr._lid && !byLid.has( tr._lid ) ) byLid.set( tr._lid, tr );
				} );
				const names: string[] = [];
				lids.forEach( ( lid ) => {
					const tr = byLid.get( lid );
					if ( tr ) names.push( typeof tr.name === 'string' ? tr.name : '' );
				} );
				if ( names.length ) bySet[ ts.id ] = names;
			} );
			if ( Object.keys( bySet ).length ) out.traitOrders = bySet;
		}
		if ( prefsEntry.declinedTemplateVersions && typeof prefsEntry.declinedTemplateVersions === 'object' ) {
			out.declinedTemplateVersions = cloneDeep( prefsEntry.declinedTemplateVersions );
		}
		return Object.keys( out ).length ? out : null;
	},

	// Convert file (name-keyed) prefs back to live (_lid-keyed) form against
	// a merged character. Unresolvable entries are dropped (D12 limits).
	prefsFromImport: function( filePrefs: CharacterPrefs | null, character: Character ): CharacterPrefs | null {
		if ( !filePrefs || typeof filePrefs !== 'object' ) return null;
		const out: CharacterPrefs = {};
		if ( Array.isArray( filePrefs.setOrder ) && filePrefs.setOrder.length ) {
			out.setOrder = filePrefs.setOrder.filter( ( x ) => typeof x === 'string' );
		}
		if ( filePrefs.traitOrders && typeof filePrefs.traitOrders === 'object' ) {
			out.traitOrders = {};
			( character && Array.isArray( character.traitSets ) ? character.traitSets : [] ).forEach( ( ts ) => {
				if ( !ts || !ts.id || !Array.isArray( ts.traits ) ) return;
				const names = filePrefs.traitOrders![ ts.id ];
				if ( !Array.isArray( names ) || !names.length ) return;
				const pool = ts.traits.slice();
				const take = ( pred: ( t: Trait ) => boolean ): Trait | null => {
					for ( let i = 0; i < pool.length; i++ ) {
						if ( pred( pool[i] ) ) return pool.splice( i, 1 )[0];
					}
					return null;
				};
				const lids: string[] = [];
				names.forEach( ( nm ) => {
					let tr: Trait | null = null;
					if ( typeof nm === 'string' && nm.length ) tr = take( ( t ) => Boolean( t && t.name === nm && t._lid ) );
					else tr = take( ( t ) => Boolean( t && !( typeof t.name === 'string' && t.name.length ) && t._lid ) );
					if ( tr && tr._lid ) lids.push( tr._lid );
				} );
				if ( lids.length ) out.traitOrders![ ts.id ] = lids;
			} );
			if ( !Object.keys( out.traitOrders ).length ) delete out.traitOrders;
		}
		if ( filePrefs.declinedTemplateVersions && typeof filePrefs.declinedTemplateVersions === 'object' ) {
			out.declinedTemplateVersions = {};
			for ( const k of Object.keys( filePrefs.declinedTemplateVersions ) ) {
				const v = filePrefs.declinedTemplateVersions[ k ];
				if ( typeof v === 'number' ) {
					out.declinedTemplateVersions[ k ] = v;
				}
			}
			if ( !Object.keys( out.declinedTemplateVersions ).length ) delete out.declinedTemplateVersions;
		}
		return Object.keys( out ).length ? out : null;
	},

	isBlankName: function( name: unknown ) {
		return !( typeof name === 'string' && name.length );
	},

	// Deep equality ignoring app-local _lid keys (internal ids live at rest
	// only and must never block delta pruning).
	deepEqualClean: function( a: unknown, b: unknown ) {
		const strip = ( v: unknown ): unknown => {
			if ( Array.isArray( v ) ) return v.map( strip );
			if ( v && typeof v === 'object' ) {
				const rec = v as Record<string, unknown>;
				const o: Record<string, unknown> = {};
				for ( const k of Object.keys( rec ) ) {
					if ( k === '_lid' ) continue;
					o[k] = strip( rec[k] );
				}
				return o;
			}
			return v;
		};
		return this.deepEqual( strip( a ), strip( b ) );
	},

	unionArrays: function( baseArr: unknown, overArr: unknown ): unknown[] {
		if ( !Array.isArray( overArr ) || !overArr.length ) return [];
		const out: unknown[] = [];
		const push = ( v: unknown ) => {
			if ( !out.some( e => this.deepEqualClean( e, v ) ) ) out.push( cloneDeep( v ) );
		};
		( Array.isArray( baseArr ) ? baseArr : [] ).forEach( push );
		overArr.forEach( push );
		return out;
	},

	findTraitByName: function( list: unknown, name: unknown ) {
		if ( !Array.isArray( list ) || this.isBlankName( name ) ) return -1;
		for ( let j = 0; j < list.length; j++ ) {
			const o = list[j];
			if ( o && typeof o === 'object' && o.name === name ) return j;
		}
		return -1;
	},

	// Array merge for traits/subtraits (brief D4): join by name (template
	// order wins, overrides replace in place); blank slots join
	// positionally; character-only names append; template-only names are
	// inherited unless listed in removedNames. Rename unlinks by design
	// (old name reappears as inherited — D7).
	mergeTraitArrays: function( tBase: any, tOver: any, removedNames: any ) {
		const base = Array.isArray( tBase ) ? tBase : [];
		const over = Array.isArray( tOver ) ? tOver : [];
		if ( !over.length && base.length ) return []; // Present-but-empty clears.
		const rem = new Set( ( removedNames || [] ).filter( ( n: any ) => typeof n === 'string' && n.length ) );
		const consumed = new Set();
		const result: any[] = [];
		const mergeOne = ( b: any, o: any ) => {
			const c = cloneDeep( b );
			this.applyOverrides( c, o, false );
			return c;
		};
		// Blank slots fill positionally from index-aligned overrides (the
		// pruner preserves live shape, so sparse arrays stay index-aligned).
		// An override whose name matches a base trait elsewhere is left for
		// the name-join. Hand-compacted arrays (deleted stubs) reinterpret
		// positionally — documented; the pruner never emits that shape.
		for ( let i = 0; i < base.length; i++ ) {
			const b = base[i];
			if ( !b || typeof b !== 'object' ) { result.push( cloneDeep( b ) ); continue; }
			if ( !this.isBlankName( b.name ) && rem.has( b.name ) ) continue; // D6 removal wins.
			let m = -1;
			if ( !this.isBlankName( b.name ) ) {
				for ( let j = 0; j < over.length; j++ ) {
					if ( consumed.has( j ) ) continue;
					const o = over[j];
					if ( o && typeof o === 'object' && o.name === b.name ) { m = j; break; }
				}
			} else if ( i < over.length && !consumed.has( i ) ) {
				const o = over[i];
				if ( o && typeof o === 'object' ) {
					if ( this.isBlankName( o.name ) ) m = i;
					else if ( this.findTraitByName( base, o.name ) === -1 ) m = i; // positional slot fill
				}
			}
			if ( m >= 0 ) { consumed.add( m ); result.push( mergeOne( b, over[m] ) ); }
			else result.push( cloneDeep( b ) );
		}
		for ( let j = 0; j < over.length; j++ ) {
			if ( consumed.has( j ) ) continue;
			const o = over[j];
			if ( !o || typeof o !== 'object' ) { result.push( cloneDeep( o ) ); continue; }
			if ( !this.isBlankName( o.name ) ) {
				if ( this.findTraitByName( base, o.name ) === -1 ) result.push( cloneDeep( o ) );
			} else if ( j >= base.length ) {
				result.push( cloneDeep( o ) ); // genuinely extra blank slot
			}
		}
		return result;
	},

	// Set arrays join by stable id (D2). Template-only ids are inherited
	// (so template additions propagate); character-only ids append; ids in
	// removedSetIds stay deleted (set-level removal analog of D6).
	mergeSetArrays: function( bSets: any, oSets: any, removedSetIds: any ) {
		const base = Array.isArray( bSets ) ? bSets : [];
		const over = Array.isArray( oSets ) ? oSets : [];
		if ( !over.length && base.length ) return []; // Present-but-empty clears.
		const rem = new Set( ( removedSetIds || [] ).filter( ( x: any ) => typeof x === 'string' && x.length ) );
		const byId = new Map();
		over.forEach( ( o: any, j: number ) => {
			if ( o && typeof o === 'object' && typeof o.id === 'string' && o.id.length && !byId.has( o.id ) ) byId.set( o.id, j );
		} );
		const consumed = new Set();
		const result: any[] = [];
		for ( const b of base ) {
			if ( !b || typeof b !== 'object' ) { result.push( cloneDeep( b ) ); continue; }
			if ( typeof b.id === 'string' && b.id.length && rem.has( b.id ) ) continue;
			const j = ( typeof b.id === 'string' && b.id.length && byId.has( b.id ) ) ? byId.get( b.id ) : -1;
			if ( j >= 0 ) {
				consumed.add( j );
				const c = cloneDeep( b );
				this.applyOverrides( c, over[j], false );
				result.push( c );
			} else {
				result.push( cloneDeep( b ) );
			}
		}
		over.forEach( ( o, j ) => {
			if ( !consumed.has( j ) ) result.push( cloneDeep( o ) );
		} );
		return result;
	},

	// Three-state recursive merge (brief D3): absent inherits, null clears,
	// values win. Mutates base (callers pass a clone). The top-level
	// `sheet` link never participates (D9); removedTraits/removedSets are
	// character-local and replace wholesale (D6). The sheet guard is
	// root-only so a nested key literally named `sheet` (view.style.sheet)
	// still merges.
	applyOverrides: function( base: any, over: any, isRoot?: boolean ) {
		if ( !over || typeof over !== 'object' || Array.isArray( over ) ) return base;
		if ( !base || typeof base !== 'object' || Array.isArray( base ) ) return base;
		// Removals apply even when the array itself is absent from the
		// overlay (fully pruned): a missing array with a removal list means
		// "everything except these", not "everything".
		if ( !Array.isArray( over.traitSets ) && Array.isArray( over.removedSets ) && over.removedSets.length && Array.isArray( base.traitSets ) ) {
			base.traitSets = base.traitSets.filter( ( ts: any ) => !( ts && ts.id && over.removedSets.includes( ts.id ) ) );
		}
		if ( !Array.isArray( over.traits ) && Array.isArray( over.removedTraits ) && over.removedTraits.length && Array.isArray( base.traits ) ) {
			base.traits = base.traits.filter( ( tr: any ) => !( tr && tr.name && over.removedTraits.includes( tr.name ) ) );
		}
		for ( const key of Object.keys( over ) ) {
			if ( key === 'sheet' && isRoot !== false ) continue;
			const val = over[key];
			if ( val === null ) { base[key] = null; continue; }
			if ( key === 'removedTraits' || key === 'removedSets' ) {
				base[key] = cloneDeep( val );
				continue;
			}
			const bval = base[key];
			if ( key === 'traitSets' && Array.isArray( val ) && Array.isArray( bval ) ) {
				base[key] = this.mergeSetArrays( bval, val, over.removedSets || [] );
			} else if ( key === 'traits' && Array.isArray( val ) && Array.isArray( bval ) ) {
				base[key] = this.mergeTraitArrays( bval, val, over.removedTraits || [] );
			} else if ( ( key === 'sfx' || key === 'tags' ) && Array.isArray( val ) && Array.isArray( bval ) ) {
				base[key] = val.length ? this.unionArrays( bval, val ) : [];
			} else if ( val && typeof val === 'object' && !Array.isArray( val ) && bval && typeof bval === 'object' && !Array.isArray( bval ) ) {
				this.applyOverrides( bval, val, false );
			} else {
				base[key] = cloneDeep( val );
			}
		}
		return base;
	},

	// Full merge: character sparse overlay onto template base (brief merge
	// pseudocode). No template → character as-is (D9/D17). Live form keeps
	// a pinned { id, version } reference in sheet.template.
	mergeTemplateIntoCharacter: function( charData: any, templateEntry: any ) {
		const base = this.findTemplateCharacter( templateEntry );
		if ( !base ) return cloneDeep( charData );
		const out = this.applyOverrides( cloneDeep( base ), charData || {} );
		if ( templateEntry.id ) {
			out.sheet = { template: { id: templateEntry.id, version: templateEntry.version || 1 } };
		}
		this.ensureTraitSetIds( out );
		return out;
	},

	// Snapshot a character into a standalone template entry (static id
	// assigned once at creation, never regenerated). Same shape as the
	// spotlight library so all tooling applies unchanged.
	extractSheetTemplate: function( character: any, meta: any ) {
		this.ensureTraitSetIds( character );
		const id = meta && meta.id ? String( meta.id ) : ( 'custom-' + this.generateUUID().slice( 0, 8 ) );
		const snapshot = cloneDeep( character );
		delete snapshot.sheet;
		snapshot.isTemplate = true;
		snapshot.name = '';
		if ( snapshot.view ) {
			delete snapshot.view.nickname; // Character data, not layout.
		}
		if ( snapshot.custom && snapshot.custom.cortexToolkit ) {
			delete snapshot.custom.cortexToolkit.nickname;
		}
		// Templates must never carry removals or internal ids: removals are
		// character-local (they would otherwise infect every character) and
		// _lid is app-local bookkeeping. Blank slots (reserved print rows)
		// are structural and are always kept.
		const cleanNode = ( node: any ) => {
			if ( Array.isArray( node ) ) { node.forEach( cleanNode ); return; }
			if ( !node || typeof node !== 'object' ) return;
			delete node.removedTraits;
			delete node.removedSets;
			delete node._lid;
			if ( Array.isArray( node.traitSets ) ) node.traitSets.forEach( cleanNode );
			if ( Array.isArray( node.traits ) ) node.traits.forEach( cleanNode );
		};
		cleanNode( snapshot );
		return {
			'$schema': this.TEMPLATE_SCHEMA_URL,
			id: id,
			title: ( meta && meta.title ) || character?.game || 'Custom Layout',
			version: ( meta && typeof meta.version === 'number' ) ? meta.version : this.TEMPLATE_FORMAT_VERSION,
			updatedAt: new Date().toISOString(),
			character: snapshot
		};
	},

	// Pruner: inverse of the merge. Drops every value deep-equal to the
	// template base (ignoring _lid), leaving sparse overrides. Explicit
	// nulls that differ are overrides and are KEPT. Join keys (set id,
	// trait/subtrait name) are always kept. removedTraits/removedSets and
	// the sheet link are character-local and never pruned. Blank traits
	// survive only where they hold alignment (leading/interior) — trailing
	// fully-inherited blanks are dropped.
	pruneValue: function( bval: any, oval: any, removed: any ) {
		if ( this.deepEqualClean( bval, oval ) ) return { drop: true };
		if ( oval === null || oval === undefined ) {
			return ( bval === null || bval === undefined ) ? { drop: true } : { keep: null };
		}
		if ( oval && typeof oval === 'object' && !Array.isArray( oval ) &&
		     bval && typeof bval === 'object' && !Array.isArray( bval ) ) {
			let out: any = {};
			for ( const k of Object.keys( oval ) ) {
				if ( k === 'sheet' || k === 'removedTraits' || k === 'removedSets' || k === 'id' || k === 'name' ) {
					out[k] = cloneDeep( oval[k] );
					continue;
				}
				if ( k === 'traitSets' && Array.isArray( oval[k] ) && Array.isArray( bval[k] ) ) {
					const s = this.pruneSetArrays( bval[k], oval[k] );
					if ( s.length ) out[k] = s;
					else if ( oval[k].length === 0 && bval[k].length > 0 ) out[k] = [];
					// else: fully inherited → dropped (absent = inherit whole)
					continue;
				}
				if ( k === 'traits' && Array.isArray( oval[k] ) && Array.isArray( bval[k] ) ) {
					const t = this.pruneTraitArrays( bval[k], oval[k], oval.removedTraits );
					if ( t.length ) out[k] = t;
					else if ( oval[k].length === 0 && bval[k].length > 0 ) out[k] = [];
					continue;
				}
				if ( ( k === 'sfx' || k === 'tags' ) && Array.isArray( oval[k] ) && Array.isArray( bval[k] ) ) {
					const kept = oval[k].filter( ( el: any ) => !bval[k].some( ( be: any ) => this.deepEqualClean( be, el ) ) );
					if ( kept.length ) out[k] = kept;
					else if ( oval[k].length === 0 && bval[k].length > 0 ) out[k] = [];
					continue;
				}
				const r = this.pruneValue( bval[k], oval[k], null );
				if ( !r.drop ) out[k] = r.keep;
			}
		if ( !Object.keys( out ).length ) return { drop: true };
		if ( Object.keys( out ).every( kk => kk === 'id' || kk === 'name' ) ) {
			// Join keys + name alone still drop — unless the name moved. A
			// rename is display truth, not inheritance, and must survive.
			const bName = ( bval && typeof bval === 'object' && !Array.isArray( bval ) ) ? ( bval as any ).name : undefined;
			if ( out.name !== undefined && bName !== undefined && out.name !== bName ) return { keep: out };
			return { drop: true };
		}
		return { keep: out };
		}
		return { keep: cloneDeep( oval ) };
	},

	pruneTraitArrays: function( bTraits: any, oTraits: any, removed: any ) {
		const base = Array.isArray( bTraits ) ? bTraits : [];
		const over = Array.isArray( oTraits ) ? oTraits : [];
		void removed;
		const sparse: any[] = [];
		const baseByName = new Map();
		base.forEach( ( b: any ) => {
			if ( b && typeof b === 'object' && !this.isBlankName( b.name ) && !baseByName.has( b.name ) ) baseByName.set( b.name, b );
		} );
		over.forEach( ( o: any, i: number ) => {
			if ( !o || typeof o !== 'object' ) { sparse.push( cloneDeep( o ) ); return; }
			if ( !this.isBlankName( o.name ) ) {
				const b = baseByName.get( o.name );
				if ( !b ) { sparse.push( cloneDeep( o ) ); return; } // char-only
				// Shape-preserving: fully-inherited named traits stay as
				// {name} stubs so live indices survive the round-trip.
				const r = this.pruneValue( b, o, null );
				const pruned = r.drop ? { name: o.name } : r.keep;
				pruned.name = o.name;
				sparse.push( pruned );
			} else {
				// Blank traits are positional print slots: always kept so
				// index alignment (and reserved print rows) survives the
				// round-trip. Fully-inherited ones prune to a bare stub.
				const b = ( i < base.length && base[i] && typeof base[i] === 'object' && this.isBlankName( base[i].name ) ) ? base[i] : null;
				if ( !b ) { sparse.push( cloneDeep( o ) ); return; } // extra blank slot
				const r = this.pruneValue( b, o, null );
				sparse.push( r.drop ? { name: ( typeof o.name === 'string' ? o.name : '' ) } : r.keep );
			}
		} );
		return sparse;
	},

	pruneSetArrays: function( bSets: any, oSets: any ) {
		const base = Array.isArray( bSets ) ? bSets : [];
		const over = Array.isArray( oSets ) ? oSets : [];
		const baseById = new Map();
		base.forEach( ( b: any ) => {
			if ( b && typeof b === 'object' && typeof b.id === 'string' && b.id.length && !baseById.has( b.id ) ) baseById.set( b.id, b );
		} );
		const sparse: any[] = [];
		// Recursively bare = join keys + name-only stubs all the way down.
		// Fully-inherited subtrees drop entirely (absent = inherit whole).
		const bare = ( t: any ): boolean => {
			if ( !t || typeof t !== 'object' ) return true;
			if ( Array.isArray( t ) ) return t.every( bare );
			return Object.keys( t ).every( k => {
				if ( k === 'id' || k === 'name' ) return true;
				if ( k === 'traits' && Array.isArray( t[k] ) ) return t[k].every( bare );
				return false;
			} );
		};
		const stubOnly = ( p: any ) => bare( p );
		over.forEach( ( o: any ) => {
			if ( !o || typeof o !== 'object' ) { sparse.push( cloneDeep( o ) ); return; }
			const b = ( typeof o.id === 'string' && o.id.length ) ? baseById.get( o.id ) : null;
			if ( !b ) { sparse.push( cloneDeep( o ) ); return; } // custom set: whole
		const r = this.pruneValue( b, o, null );
		const pruned = r.drop ? { id: o.id } : r.keep;
		pruned.id = o.id;
		// Fully-inherited sets (join keys + bare name stubs only) drop
		// entirely — absent means inherit whole. Arrangement order lives
		// in the preference layer, not here. A renamed set is never bare:
		// the name is display truth and must survive even with no other
		// overrides, or the rename silently vanishes on save.
		if ( !stubOnly( pruned ) || o.name !== b.name ) sparse.push( pruned );
		} );
		return sparse;
	},

	// Strip a (cloned) character to its sparse overlay against a template
	// entry's character base.
	stripCharacterToDeltas: function( character: any, templateEntry: any ) {
		const base = this.findTemplateCharacter( templateEntry );
		if ( !base ) return cloneDeep( character );
	 const r = this.pruneValue( base, cloneDeep( character ), null );
		return r.drop ? {} : r.keep;
	},

	// Canonical file emit: drop empty custom/tags everywhere in a delta
	// tree. description "" is KEPT: in a delta it is an explicit clear of
	// an inherited description. Explicit nulls, join keys, and name stubs
	// are kept.
	pruneEmptyScaffolding: function( node: any ) {
		if ( !node || typeof node !== 'object' ) return node;
		if ( Array.isArray( node ) ) {
			node.forEach( ( el: any ) => this.pruneEmptyScaffolding( el ) );
			return node;
		}
		if ( node.custom && typeof node.custom === 'object' && !Array.isArray( node.custom ) &&
			!Object.keys( node.custom ).length ) {
			delete node.custom;
		}
		if ( Array.isArray( node.tags ) && !node.tags.length ) delete node.tags;
		Object.keys( node ).forEach( ( k: string ) => {
			if ( node[k] && typeof node[k] === 'object' ) this.pruneEmptyScaffolding( node[k] );
		} );
		return node;
	},

	// Export form: sparse character (overrides only) + embedded full
	// template object, so the file is self-contained and hand-editable.
	// Without a resolvable template the character exports exactly as today.
	stripCharacterForExport: function( character: any, templateEntry: any ) {
		const clean = this.stripCharacterToDeltas( character, templateEntry );
		this.stripInternalIds( clean );
		this.pruneEmptyScaffolding( clean );
		if ( templateEntry && templateEntry.id ) {
			clean.sheet = { template: cloneDeep( templateEntry ) };
		}
		return clean;
	},

	renderInlineMarkdown: function( text: any ) {
		if ( !text || typeof text !== 'string' ) return '';
		// Escape user HTML first: everything below re-adds only our own safe tags.
		let str = this.escapeHtml( text );
		// Dice tokens
		str = str.replace( /\bd(4|6|8)\b/gi, '<span class="c" role="img" aria-label="d$1">$1</span>' );
		str = str.replace( /\bd10\b/gi, '<span class="c" role="img" aria-label="d10">0</span>' );
		str = str.replace( /\bd12\b/gi, '<span class="c" role="img" aria-label="d12">2</span>' );
		// Plot points
		str = str.replace( /(^|\W)PP(\W|$)/g, '$1<span class="pp">PP</span>$2' );
		// Bold: **text** or __text__
		str = str.replace( /\*\*(.*?)\*\*/g, '<strong>$1</strong>' );
		str = str.replace( /__(.*?)__/g, '<strong>$1</strong>' );
		// Italic: *text* or _text_
		str = str.replace( /\*([^*]+)\*/g, '<em>$1</em>' );
		str = str.replace( /_([^_]+)_/g, '<em>$1</em>' );
		// Inline code: `code`
		str = str.replace( /`([^`]+)`/g, '<code>$1</code>' );
		// Links: [label](url) — safe schemes only, otherwise plain label text.
		// Balanced-paren scanner so URLs containing (...) survive intact.
		str = this.renderMarkdownLinks( str );
		return str;
	},

	renderMarkdownLinks: function( str: any ) {
		let out = '';
		let i = 0;
		while ( i < str.length ) {
			const open = str.indexOf( '[', i );
			if ( open === -1 ) {
				out += str.slice( i );
				break;
			}
			const closeLabel = str.indexOf( '](', open );
			if ( closeLabel === -1 ) {
				out += str.slice( i );
				break;
			}
			let depth = 1;
			let j = closeLabel + 2;
			while ( j < str.length && depth > 0 ) {
				if ( str[j] === '(' ) depth++;
				else if ( str[j] === ')' ) depth--;
				j++;
			}
			if ( depth !== 0 ) {
				out += str.slice( i, closeLabel + 2 );
				i = closeLabel + 2;
				continue;
			}
			const label = str.slice( open + 1, closeLabel );
			const url = str.slice( closeLabel + 2, j - 1 );
			const clean = String( url ).trim().replace( /&quot;/g, '"' ).replace( /&#39;/g, "'" );
			out += str.slice( i, open );
			out += this.isSafeUrl( clean, false )
				? '<a href="' + this.escapeHtml( clean ) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>'
				: label;
			i = j;
		}
		return out;
	},

	renderMarkdown: function( text: any ) {
		if ( !text || typeof text !== 'string' ) return '';
		let lines = text.split(/\r?\n/);
		let output = [];
		let inList = false;

		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			let trimmed = line.trim();

			// List items
			let listMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
			if (listMatch) {
				if (!inList) {
					output.push('<ul>');
					inList = true;
				}
				output.push('<li>' + this.renderInlineMarkdown(listMatch[2]) + '</li>');
				continue;
			} else if (inList) {
				output.push('</ul>');
				inList = false;
			}

			// Headings
			if (/^###\s+/.test(trimmed)) {
				output.push('<h3>' + this.renderInlineMarkdown(trimmed.replace(/^###\s+/, '')) + '</h3>');
				continue;
			}
			if (/^##\s+/.test(trimmed)) {
				output.push('<h2>' + this.renderInlineMarkdown(trimmed.replace(/^##\s+/, '')) + '</h2>');
				continue;
			}
			if (/^#\s+/.test(trimmed)) {
				output.push('<h1>' + this.renderInlineMarkdown(trimmed.replace(/^#\s+/, '')) + '</h1>');
				continue;
			}

			// Blockquote
			if (/^>\s+/.test(trimmed)) {
				output.push('<blockquote>' + this.renderInlineMarkdown(trimmed.replace(/^>\s+/, '')) + '</blockquote>');
				continue;
			}

			// Empty line -> paragraph break
			if (!trimmed) {
				continue;
			}

			// Paragraph
			output.push('<p>' + this.renderInlineMarkdown(line) + '</p>');
		}

		if (inList) {
			output.push('</ul>');
		}

		return output.join('\n');
	},

	defaultCharacter: {
		'$schema': 'https://cortex.engard.me/schema/0.1/character.schema.json',
		'version': '0.1',
		'id': '',
		'isTemplate': false,
		'dateCreated': '',
		'dateModified': '',
		'dateTouched': '',
		'name': '',
		'player': '',
		'game': '',
		'description': '',
		'pronouns': '',
		'traitSets': [
			{
				'name': 'Distinctions',
				'description': '',
				'noun': 'Distinction',
				'plural': 'Distinctions',
				'traits': [
					{
						'name': '',
						'description': '',
						'traits': [],
						'sfx': [ 'hinder' ],
						'tags': [],
						'custom': {},
					},
					{
						'name': '',
						'description': '',
						'traits': [],
						'sfx': [ 'hinder' ],
						'tags': [],
						'custom': {},
					},
					{
						'name': '',
						'description': '',
						'traits': [],
						'sfx': [ 'hinder' ],
						'tags': [],
						'custom': {},
					}
				],
				'sfx': [],
				'tags': [],
				'view': {
					'features': {
						'description': true,
						'sfx': true,
						'subtraits': false
					},
					'location': 'left',
					'reservedSlots': 3,
					'style': {
						'header': 'distinctions',
						'body': 'distinctions',
					}
				},
			},
			{
				'name': 'Attributes',
				'description': '',
				'noun': 'Attribute',
				'plural': 'Attributes',
				'traits': [
					{
						'name': 'Physical',
						'description': '',
						'traits': [],
						'sfx': [],
						'tags': [],
					},
					{
						'name': 'Mental',
						'description': '',
						'traits': [],
						'sfx': [],
						'tags': [],
					},
					{
						'name': 'Social',
						'description': '',
						'traits': [],
						'sfx': [],
						'tags': [],
					}
				],
				'sfx': [],
				'tags': [],
				'view': {
					'features': {
						'description': false,
						'sfx': false,
						'subtraits': false
					},
					'location': 'right',
					'reservedSlots': 3,
					'style': {
						'header': 'default',
						'body': 'default',
					}
				},
			},
			{
				'name': 'Skills',
				'description': '',
				'noun': 'Skill',
				'plural': 'Skills',
				'traits': [
					{
						'name': '',
						'description': '',
						'traits': [],
						'sfx': [],
						'tags': [],
					}
				],
				'sfx': [],
				'tags': [],
				'view': {
					'features': {
						'description': false,
						'sfx': false,
						'subtraits': false
					},
					'location': 'right',
					'reservedSlots': 4,
					'style': {
						'header': 'default',
						'body': 'default',
					}
				},
			}
		],
		'portrait': {
			'url': '',
			'alt': '',
			'tags': [],
			'view': {
				'alignment': 'top-center',
				'size': 'spotlight',
				'location': 'header'
			}
		},
		'plotPoints': 1,
		'notes': '',
		'tags': [],
		'view': {
			'columns': 2,
			'pageCount': 1,
			'columnAlignment': 'top-base',
			'columnOffsets': {
				'left': 0,
				'center': 0,
				'right': 0
			},
			'style': {
				'sheet': 'spotlight',
			}
		}
	},
	
	defaultTraitSet: {
		name: 'New trait set',
		description: 'Trait set description',
		noun: '',
		plural: '',
		traits: [],
		tags: [],
		view: {
			features: {
				description: false,
				sfx: false,
				subtraits: false
			},
			location: 'left',
			style: {
				header: 'default',
				body: 'default',
			},
				stressConfig: {
					includeOut: true
				},
				notes: ''
			}
	},
	
	defaultTrait: {
		name: 'New trait',
		rating: { type: 'Die', value: [6], range: [4, 6, 8, 10, 12] },
		description: 'Trait description',
		traits: [],
		tags: [],
		custom: {}
	},
	
	defaultSFX: {
		name: 'New SFX',
		description: 'SFX description',
		tags: [],
		custom: {}
	},
	
}
