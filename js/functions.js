const cortexFunctions = {

	arraysMatch: function( a, b ) {
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
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	},

	getDieDisplayValue: function( dieValue ) {
		switch ( dieValue ) {
			case 4:  return '4';
			case 6:  return '6';
			case 8:  return '8';
			case 10: return '0';
			case 12: return '2';
			default: return '';
		}
	},

	loadGoogleFont: function( fontName ) {
		if ( !fontName || typeof document === 'undefined' ) return;
		const safeId = 'gfont-' + fontName.toLowerCase().replace(/[^a-z0-9]/g, '-');
		if ( document.getElementById(safeId) ) return;
		const link = document.createElement('link');
		link.id = safeId;
		link.rel = 'stylesheet';
		link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:ital,wght@0,400;0,600;0,700;1,400&display=swap`;
		document.head.appendChild(link);
	},

	applyCustomFont: function( fontName, base64Data ) {
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

	renderDieconSVG: function( dieValue, isFilled = false, extraClass = '', diceConfig = null ) {
		const s = Number( dieValue ) || 8;
		const filledClass = isFilled ? 'diecon-filled' : 'diecon-unfilled';
		const cls = `diecon diecon-d${s} ${filledClass} ${extraClass}`.trim();

		const cfg = diceConfig || (typeof window !== 'undefined' ? window.__cortexActiveDiceConfig : null);
		let fill = isFilled ? '#000000' : 'none';
		let stroke = '#000000';
		let textFill = isFilled ? '#ffffff' : '#000000';
		let strokeWidth = 1.7;
		let defs = '';

		if ( cfg && (cfg.style === 'custom' || cfg.backgroundType) ) {
			strokeWidth = Number(cfg.borderWidth) || 1.7;
			if ( isFilled ) {
				stroke = cfg.borderColor || '#000000';
				textFill = cfg.numeralColor || '#ffffff';
				if ( cfg.backgroundType === 'gradient' && cfg.backgroundColor1 && cfg.backgroundColor2 ) {
					const gradId = `die-grad-${s}-${Math.abs(Math.sin(s)).toString(36).substr(2, 5)}`;
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
			text = `<text x="12" y="9.8" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="${textFill}">4</text>`;
		} else if ( s === 6 ) {
			// Square
			shape = `<rect x="3.5" y="3.5" width="17" height="17" rx="1.5" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}"/>`;
			text = `<text x="12" y="12" text-anchor="middle" dominant-baseline="central" font-size="10.5" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="${textFill}">6</text>`;
		} else if ( s === 8 ) {
			// Diamond
			shape = `<polygon points="12,2.5 21.5,12 12,21.5 2.5,12" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-linejoin="round"/>`;
			text = `<text x="12" y="12" text-anchor="middle" dominant-baseline="central" font-size="10.5" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="${textFill}">8</text>`;
		} else if ( s === 10 ) {
			// Kite / Hexagon
			shape = `<polygon points="12,2.5 21.5,7.5 21.5,16.5 12,21.5 2.5,16.5 2.5,7.5" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-linejoin="round"/>`;
			text = `<text x="12" y="12" text-anchor="middle" dominant-baseline="central" font-size="8.75" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="${textFill}">10</text>`;
		} else if ( s === 12 ) {
			// 12-sided regular dodecagon
			shape = `<polygon points="12,2.5 16.75,3.77 20.23,7.25 21.5,12 20.23,16.75 16.75,20.23 12,21.5 7.25,20.23 3.77,16.75 2.5,12 3.77,7.25 7.25,3.77" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" stroke-linejoin="round"/>`;
			text = `<text x="12" y="12" text-anchor="middle" dominant-baseline="central" font-size="8.75" font-weight="900" letter-spacing="-0.03em" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="${textFill}">12</text>`;
		} else {
			shape = `<rect x="3.5" y="3.5" width="17" height="17" rx="1.5" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}"/>`;
			text = `<text x="12" y="12" text-anchor="middle" dominant-baseline="central" font-size="10.5" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="${textFill}">${s}</text>`;
		}

		return `<svg class="${cls}" viewBox="0 0 24 24" width="1.35rem" height="1.35rem" style="display:inline-block; vertical-align:middle; overflow:visible;">${defs}${shape}${text}</svg>`;
	},

	getTraitSetRatings: function( traitSet ) {
		const custom = traitSet?.custom?.cortexToolkit;
		if ( Array.isArray(custom?.ratingScale) && custom.ratingScale.length > 0 ) {
			return [...custom.ratingScale].sort((a, b) => a - b);
		}
		// Backwards compatibility for Stress sets with includeD4: false
		if ( custom?.style?.body === 'stress' && custom?.stressConfig?.includeD4 === false ) {
			return [6, 8, 10, 12];
		}
		return [4, 6, 8, 10, 12];
	},

	getSubtraitRatings: function( traitSet ) {
		const custom = traitSet?.custom?.cortexToolkit;
		if ( Array.isArray(custom?.subtraitRatingScale) && custom.subtraitRatingScale.length > 0 ) {
			return [...custom.subtraitRatingScale].sort((a, b) => a - b);
		}
		return [4, 6, 8, 10, 12];
	},

	// Feature + multi-die defaults seeded when a trait-set style is chosen.
	// Used by the trait set editor and the style gallery alike.
	defaultFeaturesForStyle: function( style ) {
		const map = {
			'talents-table':      { features: { description: true,  sfx: true,  subtraits: false }, multiDie: false },
			'standing':           { features: { description: false, sfx: false, subtraits: true  }, multiDie: false },
			'skills-specialties': { features: { description: false, sfx: false, subtraits: true  }, multiDie: false },
			'badges-table':       { features: { description: false, sfx: false, subtraits: false }, multiDie: false },
			'resources-count':    { features: { description: false, sfx: false, subtraits: false }, multiDie: true  },
			'growth-ladder':      { features: { description: false, sfx: false, subtraits: false }, multiDie: false },
			'dossier-fields':     { features: { description: true,  sfx: false, subtraits: false }, multiDie: false },
		};
		if ( map[ style ] ) return map[ style ];
		return { features: { description: false, sfx: false, subtraits: false }, multiDie: false };
	},

	// Central registry of default labels for trait-set style regions.
	// Custom labels live in custom.cortexToolkit.labels under the same keys;
	// anything absent here (or unset there) renders as ''.
	defaultTraitSetLabels: {
		'skills-specialties': { left: 'SKILL', right: 'SPECIALTIES' },
		'talents-table':      { col1: 'TALENT', col2: 'ACTIVATION', col3: 'EFFECT' },
		'resources-count':    { rating: 'RATING', dice: '/ DICE' },
		'standing':           { slot0: 'COMPLICATION', slot1: 'BONUS' },
	},

	labelDefaultForStyle: function( style, key ) {
		const map = this.defaultTraitSetLabels[ style ];
		if ( map && map[ key ] !== undefined ) return map[ key ];
		return '';
	},

	getTraitDice: function( trait ) {
		if ( !trait ) return [];
		if ( Array.isArray(trait.dice) && trait.dice.length > 0 ) {
			return trait.dice.filter( d => typeof d === 'number' && d > 0 );
		}
		if ( typeof trait.value === 'number' && trait.value > 0 ) {
			return [ trait.value ];
		}
		return [];
	},

	setTraitDice: function( trait, diceArray ) {
		if ( !trait ) return;
		trait.dice = Array.isArray(diceArray) ? diceArray.filter( d => typeof d === 'number' && d > 0 ) : [];
		trait.value = trait.dice.length > 0 ? trait.dice[0] : null;
	},

	renderDate( timestamp ) {
		let date = new Date( timestamp );
		return date.toLocaleString();
	},

	renderText: function( text ) {
		if ( !text || typeof text !== 'string' ) return '';
		return this.renderInlineMarkdown( text ).replace( /\n/g, '<br>' );
	},

	escapeHtml: function( text ) {
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
	isSafeUrl: function( url, allowDataImage ) {
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
	safeImageUrl: function( url ) {
		if ( !url || typeof url !== 'string' ) return '';
		const clean = url.trim();
		if ( !clean.length || /[\s'"()\\<>`]/.test( clean ) ) return '';
		return this.isSafeUrl( clean, true ) ? clean : '';
	},

	// Downscales an uploaded image to a data URL (caps localStorage/IDB bloat).
	processImageFile: function( file, maxDimension, quality ) {
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
						canvas.getContext( '2d' ).drawImage( img, 0, 0, w, h );
						resolve( canvas.toDataURL( 'image/jpeg', quality ) );
					} catch ( e ) {
						reject( e );
					}
				};
				img.src = reader.result;
			};
			reader.readAsDataURL( file );
		});
	},

	// Minimal shape check + normalization for imported characters.
	// Also unwraps upstream envelopes such as { version: 2, data: {...} }:
	// the inner payload is imported as a NEW character (fresh UUID when the
	// inner payload has none, so it can never overwrite an existing entry
	// by accident). Unknown inner shapes are still safely defaulted below.
	sanitizeImportedCharacter: function( data ) {
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
		const clean = JSON.parse( JSON.stringify( inner ) );
		// D5: import must not materialize defaults — missing lists/objects
		// inherit from the template at merge; the renderer treats absence
		// as empty. Only identity (set ids) is ensured below.
		// D8: no duplicate non-blank trait/subtrait names (ambiguous join).
		// Blank slots are positional and exempt.
		const dupes = ( traits ) => {
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

	deepEqual: function( a, b ) {
		if ( a === b ) return true;
		if ( typeof a !== typeof b || a === null || b === null || a === undefined || b === undefined ) return false;
		if ( Array.isArray( a ) !== Array.isArray( b ) ) return false;
		if ( Array.isArray( a ) ) {
			if ( a.length !== b.length ) return false;
			for ( let i = 0; i < a.length; i++ ) {
				if ( !this.deepEqual( a[i], b[i] ) ) return false;
			}
			return true;
		}
		if ( typeof a === 'object' ) {
			const ka = Object.keys( a ), kb = Object.keys( b );
			if ( ka.length !== kb.length ) return false;
			for ( const k of ka ) {
				if ( !Object.prototype.hasOwnProperty.call( b, k ) || !this.deepEqual( a[k], b[k] ) ) return false;
			}
			return true;
		}
		return false;
	},

	slugifySetId: function( name, taken ) {
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
	assignLids: function( character ) {
		if ( !character || !Array.isArray( character.traitSets ) ) return character;
		const lid = () => ( typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' )
			? crypto.randomUUID()
			: ( 'lid-' + Math.random().toString( 36 ).slice( 2 ) + Date.now().toString( 36 ) );
		const walk = ( traits ) => {
			if ( !Array.isArray( traits ) ) return;
			traits.forEach( tr => {
				if ( !tr || typeof tr !== 'object' ) return;
				if ( typeof tr._lid !== 'string' || !tr._lid.length ) tr._lid = lid();
				walk( tr.traits );
			} );
		};
		character.traitSets.forEach( ts => { if ( ts ) walk( ts.traits ); } );
		return character;
	},

	// Strip app-local and forbidden-below-set keys for export: _lid
	// everywhere below set level, plus any stray trait-level `id` (D1).
	// Set-level ids are the join key and are always kept.
	stripInternalIds: function( node ) {
		const walkTraits = ( traits ) => {
			if ( !Array.isArray( traits ) ) return;
			traits.forEach( tr => {
				if ( !tr || typeof tr !== 'object' ) return;
				delete tr._lid;
				delete tr.id;
				walkTraits( tr.traits );
			} );
		};
		if ( !node || typeof node !== 'object' ) return;
		if ( Array.isArray( node.traitSets ) ) {
			node.traitSets.forEach( ts => { if ( ts ) walkTraits( ts.traits ); } );
		}
		if ( Array.isArray( node.traits ) ) walkTraits( node.traits );
	},

	// Stable per-set ids are the join key between a character and its sheet
	// template. Slugs stay readable in raw JSON; uniqueness is per character.
	ensureTraitSetIds: function( character ) {
		if ( !character || !Array.isArray( character.traitSets ) ) return character;
		const taken = new Set();
		character.traitSets.forEach( ts => {
			if ( ts && typeof ts.id === 'string' && ts.id.length ) taken.add( ts.id );
		} );
		character.traitSets.forEach( ts => {
			if ( ts && ( typeof ts.id !== 'string' || !ts.id.length ) ) {
				ts.id = this.slugifySetId( ts.name, taken );
			}
		} );
		return character;
	},

	findSpotlightTemplate: function( id ) {
		if ( !id || typeof cortexSpotlightTemplates === 'undefined' ) return null;
		return cortexSpotlightTemplates.find( t => t.id === id ) || null;
	},

	// Resolve the template entry for a character: live store array first
	// (passed in by editors via $root), then the built-in library.
	resolveTemplateFor: function( character, storeTemplates ) {
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
				pool.sort( ( a, b ) => ( ( b.version || 1 ) - ( a.version || 1 ) ) );
				return pool[0];
			}
		}
		return this.findSpotlightTemplate( id );
	},

	templateSetById: function( templateEntry, setId ) {
		const ch = this.findTemplateCharacter( templateEntry );
		if ( !ch || !Array.isArray( ch.traitSets ) ) return null;
		return ch.traitSets.find( ts => ts && ts.id === setId ) || null;
	},

	// D19 removal core: drop the trait from the live sheet and remember its
	// name on the parent set's removedTraits (no confirmation — explicit and
	// reversible via restore). Returns true when a template-inherited trait
	// was removed (plain deletes return false and splice only).
	removeTraitFromSheet: function( character, templateEntry, s, t ) {
		const ts = character && character.traitSets ? character.traitSets[s] : null;
		const tr = ts && Array.isArray( ts.traits ) ? ts.traits[t] : null;
		if ( !tr ) return false;
		let inherited = false;
		if ( tr.name && templateEntry && ts && ts.id ) {
			const base = this.templateSetById( templateEntry, ts.id );
			inherited = Boolean( base && Array.isArray( base.traits ) &&
				base.traits.some( b => b && b.name === tr.name ) );
			if ( inherited ) {
				if ( !Array.isArray( ts.removedTraits ) ) ts.removedTraits = [];
				if ( !ts.removedTraits.includes( tr.name ) ) ts.removedTraits.push( tr.name );
			}
		}
		ts.traits.splice( t, 1 );
		return inherited;
	},

	// Subtrait removal: same, against the parent trait's removedTraits.
	removeSubtraitFromSheet: function( character, templateEntry, s, t, u ) {
		const ts = character && character.traitSets ? character.traitSets[s] : null;
		const tr = ts && Array.isArray( ts.traits ) ? ts.traits[t] : null;
		const st = tr && Array.isArray( tr.traits ) ? tr.traits[u] : null;
		if ( !st ) return false;
		let inherited = false;
		if ( st.name && templateEntry && ts && ts.id && tr && tr.name ) {
			const base = this.templateSetById( templateEntry, ts.id );
			const btr = base && Array.isArray( base.traits )
				? base.traits.find( b => b && b.name === tr.name ) : null;
			inherited = Boolean( btr && Array.isArray( btr.traits ) &&
				btr.traits.some( b => b && b.name === st.name ) );
			if ( inherited ) {
				if ( !Array.isArray( tr.removedTraits ) ) tr.removedTraits = [];
				if ( !tr.removedTraits.includes( st.name ) ) tr.removedTraits.push( st.name );
			}
		}
		tr.traits.splice( u, 1 );
		return inherited;
	},

	// Template traits (by name) not currently on the live sheet, including
	// removed ones — the restore menu (D19). Editor maintains the invariant:
	// restoring clears the name from removedTraits (D6).
	restorableTraits: function( character, templateEntry, s ) {
		const ts = character && character.traitSets ? character.traitSets[s] : null;
		if ( !ts ) return [];
		const base = ( ts.id && templateEntry ) ? this.templateSetById( templateEntry, ts.id ) : null;
		if ( !base || !Array.isArray( base.traits ) ) return [];
		const live = new Set(
			( Array.isArray( ts.traits ) ? ts.traits : [] )
				.filter( x => x && typeof x.name === 'string' && x.name.length )
				.map( x => x.name )
		);
		return base.traits
			.filter( b => b && typeof b.name === 'string' && b.name.length && !live.has( b.name ) )
			.map( b => b.name );
	},

	restoreTraitOnSheet: function( character, templateEntry, s, name ) {
		const ts = character && character.traitSets ? character.traitSets[s] : null;
		if ( !ts || !name ) return false;
		if ( Array.isArray( ts.removedTraits ) ) {
			ts.removedTraits = ts.removedTraits.filter( n => n !== name );
		}
		if ( !Array.isArray( ts.traits ) ) ts.traits = [];
		if ( ts.traits.some( x => x && x.name === name ) ) return true;
		const base = ( ts.id && templateEntry ) ? this.templateSetById( templateEntry, ts.id ) : null;
		const btrait = base && Array.isArray( base.traits ) ? base.traits.find( b => b && b.name === name ) : null;
		if ( btrait ) {
			const clone = JSON.parse( JSON.stringify( btrait ) );
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
	removeTraitSetFromSheet: function( character, templateEntry, s ) {
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
	isSheetTemplateFile: function( data ) {
		return Boolean( data && typeof data === 'object' && !Array.isArray( data ) &&
			typeof data.id === 'string' && data.id.length &&
			data.character && typeof data.character === 'object' &&
			Array.isArray( data.character.traitSets ) );
	},

	findTemplateCharacter: function( templateEntry ) {
		return templateEntry && templateEntry.character ? templateEntry.character : null;
	},

	// Preference export/import (brief D18): arrangement travels in the file
	// in name-keyed form (stable across _lid regeneration); live prefs stay
	// _lid-keyed. Blank slots export as '' and resolve positionally.
	prefsForExport: function( prefsEntry, character ) {
		if ( !prefsEntry || typeof prefsEntry !== 'object' ) return null;
		const out = {};
		if ( Array.isArray( prefsEntry.setOrder ) && prefsEntry.setOrder.length ) {
			out.setOrder = prefsEntry.setOrder.slice();
		}
		if ( prefsEntry.traitOrders && typeof prefsEntry.traitOrders === 'object' ) {
			const bySet = {};
			( character && Array.isArray( character.traitSets ) ? character.traitSets : [] ).forEach( ts => {
				if ( !ts || !ts.id || !Array.isArray( ts.traits ) ) return;
				const lids = prefsEntry.traitOrders[ts.id];
				if ( !Array.isArray( lids ) || !lids.length ) return;
				const byLid = new Map();
				ts.traits.forEach( tr => {
					if ( tr && tr._lid && !byLid.has( tr._lid ) ) byLid.set( tr._lid, tr );
				} );
				const names = [];
				lids.forEach( lid => {
					const tr = byLid.get( lid );
					if ( tr ) names.push( typeof tr.name === 'string' ? tr.name : '' );
				} );
				if ( names.length ) bySet[ts.id] = names;
			} );
			if ( Object.keys( bySet ).length ) out.traitOrders = bySet;
		}
		if ( prefsEntry.declinedTemplateVersions && typeof prefsEntry.declinedTemplateVersions === 'object' ) {
			out.declinedTemplateVersions = JSON.parse( JSON.stringify( prefsEntry.declinedTemplateVersions ) );
		}
		return Object.keys( out ).length ? out : null;
	},

	// Convert file (name-keyed) prefs back to live (_lid-keyed) form against
	// a merged character. Unresolvable entries are dropped (D12 limits).
	prefsFromImport: function( filePrefs, character ) {
		if ( !filePrefs || typeof filePrefs !== 'object' ) return null;
		const out = {};
		if ( Array.isArray( filePrefs.setOrder ) && filePrefs.setOrder.length ) {
			out.setOrder = filePrefs.setOrder.filter( x => typeof x === 'string' );
		}
		if ( filePrefs.traitOrders && typeof filePrefs.traitOrders === 'object' ) {
			out.traitOrders = {};
			( character && Array.isArray( character.traitSets ) ? character.traitSets : [] ).forEach( ts => {
				if ( !ts || !ts.id || !Array.isArray( ts.traits ) ) return;
				const names = filePrefs.traitOrders[ts.id];
				if ( !Array.isArray( names ) || !names.length ) return;
				const pool = ts.traits.slice();
				const take = ( pred ) => {
					for ( let i = 0; i < pool.length; i++ ) {
						if ( pred( pool[i] ) ) return pool.splice( i, 1 )[0];
					}
					return null;
				};
				const lids = [];
				names.forEach( nm => {
					let tr = null;
					if ( typeof nm === 'string' && nm.length ) tr = take( t => t && t.name === nm && t._lid );
					else tr = take( t => t && !( typeof t.name === 'string' && t.name.length ) && t._lid );
					if ( tr && tr._lid ) lids.push( tr._lid );
				} );
				if ( lids.length ) out.traitOrders[ts.id] = lids;
			} );
			if ( !Object.keys( out.traitOrders ).length ) delete out.traitOrders;
		}
		if ( filePrefs.declinedTemplateVersions && typeof filePrefs.declinedTemplateVersions === 'object' ) {
			out.declinedTemplateVersions = {};
			for ( const k of Object.keys( filePrefs.declinedTemplateVersions ) ) {
				if ( typeof filePrefs.declinedTemplateVersions[k] === 'number' ) {
					out.declinedTemplateVersions[k] = filePrefs.declinedTemplateVersions[k];
				}
			}
			if ( !Object.keys( out.declinedTemplateVersions ).length ) delete out.declinedTemplateVersions;
		}
		return Object.keys( out ).length ? out : null;
	},

	isBlankName: function( name ) {
		return !( typeof name === 'string' && name.length );
	},

	// Deep equality ignoring app-local _lid keys (internal ids live at rest
	// only and must never block delta pruning).
	deepEqualClean: function( a, b ) {
		const strip = ( v ) => {
			if ( Array.isArray( v ) ) return v.map( strip );
			if ( v && typeof v === 'object' ) {
				const o = {};
				for ( const k of Object.keys( v ) ) {
					if ( k === '_lid' ) continue;
					o[k] = strip( v[k] );
				}
				return o;
			}
			return v;
		};
		return this.deepEqual( strip( a ), strip( b ) );
	},

	unionArrays: function( baseArr, overArr ) {
		if ( !Array.isArray( overArr ) || !overArr.length ) return [];
		const out = [];
		const push = ( v ) => {
			if ( !out.some( e => this.deepEqualClean( e, v ) ) ) out.push( JSON.parse( JSON.stringify( v ) ) );
		};
		( Array.isArray( baseArr ) ? baseArr : [] ).forEach( push );
		overArr.forEach( push );
		return out;
	},

	findTraitByName: function( list, name ) {
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
	mergeTraitArrays: function( tBase, tOver, removedNames ) {
		const base = Array.isArray( tBase ) ? tBase : [];
		const over = Array.isArray( tOver ) ? tOver : [];
		if ( !over.length && base.length ) return []; // Present-but-empty clears.
		const rem = new Set( ( removedNames || [] ).filter( n => typeof n === 'string' && n.length ) );
		const consumed = new Set();
		const result = [];
		const mergeOne = ( b, o ) => {
			const c = JSON.parse( JSON.stringify( b ) );
			this.applyOverrides( c, o );
			return c;
		};
		// Blank slots fill positionally from index-aligned overrides (the
		// pruner preserves live shape, so sparse arrays stay index-aligned).
		// An override whose name matches a base trait elsewhere is left for
		// the name-join. Hand-compacted arrays (deleted stubs) reinterpret
		// positionally — documented; the pruner never emits that shape.
		for ( let i = 0; i < base.length; i++ ) {
			const b = base[i];
			if ( !b || typeof b !== 'object' ) { result.push( JSON.parse( JSON.stringify( b ) ) ); continue; }
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
			else result.push( JSON.parse( JSON.stringify( b ) ) );
		}
		for ( let j = 0; j < over.length; j++ ) {
			if ( consumed.has( j ) ) continue;
			const o = over[j];
			if ( !o || typeof o !== 'object' ) { result.push( JSON.parse( JSON.stringify( o ) ) ); continue; }
			if ( !this.isBlankName( o.name ) ) {
				if ( this.findTraitByName( base, o.name ) === -1 ) result.push( JSON.parse( JSON.stringify( o ) ) );
			} else if ( j >= base.length ) {
				result.push( JSON.parse( JSON.stringify( o ) ) ); // genuinely extra blank slot
			}
		}
		return result;
	},

	// Set arrays join by stable id (D2). Template-only ids are inherited
	// (so template additions propagate); character-only ids append; ids in
	// removedSetIds stay deleted (set-level removal analog of D6).
	mergeSetArrays: function( bSets, oSets, removedSetIds ) {
		const base = Array.isArray( bSets ) ? bSets : [];
		const over = Array.isArray( oSets ) ? oSets : [];
		if ( !over.length && base.length ) return []; // Present-but-empty clears.
		const rem = new Set( ( removedSetIds || [] ).filter( x => typeof x === 'string' && x.length ) );
		const byId = new Map();
		over.forEach( ( o, j ) => {
			if ( o && typeof o === 'object' && typeof o.id === 'string' && o.id.length && !byId.has( o.id ) ) byId.set( o.id, j );
		} );
		const consumed = new Set();
		const result = [];
		for ( const b of base ) {
			if ( !b || typeof b !== 'object' ) { result.push( JSON.parse( JSON.stringify( b ) ) ); continue; }
			if ( typeof b.id === 'string' && b.id.length && rem.has( b.id ) ) continue;
			const j = ( typeof b.id === 'string' && b.id.length && byId.has( b.id ) ) ? byId.get( b.id ) : -1;
			if ( j >= 0 ) {
				consumed.add( j );
				const c = JSON.parse( JSON.stringify( b ) );
				this.applyOverrides( c, over[j] );
				result.push( c );
			} else {
				result.push( JSON.parse( JSON.stringify( b ) ) );
			}
		}
		over.forEach( ( o, j ) => {
			if ( !consumed.has( j ) ) result.push( JSON.parse( JSON.stringify( o ) ) );
		} );
		return result;
	},

	// Three-state recursive merge (brief D3): absent inherits, null clears,
	// values win. Mutates base (callers pass a clone). The `sheet` link
	// never participates (D9); removedTraits/removedSets are character-local
	// and replace wholesale (D6).
	applyOverrides: function( base, over ) {
		if ( !over || typeof over !== 'object' || Array.isArray( over ) ) return base;
		if ( !base || typeof base !== 'object' || Array.isArray( base ) ) return base;
		// Removals apply even when the array itself is absent from the
		// overlay (fully pruned): a missing array with a removal list means
		// "everything except these", not "everything".
		if ( !Array.isArray( over.traitSets ) && Array.isArray( over.removedSets ) && over.removedSets.length && Array.isArray( base.traitSets ) ) {
			base.traitSets = base.traitSets.filter( ts => !( ts && ts.id && over.removedSets.includes( ts.id ) ) );
		}
		if ( !Array.isArray( over.traits ) && Array.isArray( over.removedTraits ) && over.removedTraits.length && Array.isArray( base.traits ) ) {
			base.traits = base.traits.filter( tr => !( tr && tr.name && over.removedTraits.includes( tr.name ) ) );
		}
		for ( const key of Object.keys( over ) ) {
			if ( key === 'sheet' ) continue;
			const val = over[key];
			if ( val === null ) { base[key] = null; continue; }
			if ( key === 'removedTraits' || key === 'removedSets' ) {
				base[key] = JSON.parse( JSON.stringify( val ) );
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
				this.applyOverrides( bval, val );
			} else {
				base[key] = JSON.parse( JSON.stringify( val ) );
			}
		}
		return base;
	},

	// Full merge: character sparse overlay onto template base (brief merge
	// pseudocode). No template → character as-is (D9/D17). Live form keeps
	// a pinned { id, version } reference in sheet.template.
	mergeTemplateIntoCharacter: function( charData, templateEntry ) {
		const base = this.findTemplateCharacter( templateEntry );
		if ( !base ) return JSON.parse( JSON.stringify( charData ) );
		const out = this.applyOverrides( JSON.parse( JSON.stringify( base ) ), charData || {} );
		if ( templateEntry.id ) {
			out.sheet = { template: { id: templateEntry.id, version: templateEntry.version || 1 } };
		}
		this.ensureTraitSetIds( out );
		return out;
	},

	// Snapshot a character into a standalone template entry (static id
	// assigned once at creation, never regenerated). Same shape as the
	// spotlight library so all tooling applies unchanged.
	extractSheetTemplate: function( character, meta ) {
		this.ensureTraitSetIds( character );
		const id = meta && meta.id ? String( meta.id ) : ( 'custom-' + this.generateUUID().slice( 0, 8 ) );
		const snapshot = JSON.parse( JSON.stringify( character ) );
		delete snapshot.sheet;
		snapshot.isTemplate = true;
		snapshot.name = '';
		if ( snapshot.custom && snapshot.custom.cortexToolkit ) {
			delete snapshot.custom.cortexToolkit.nickname; // Character data, not layout.
		}
		// Templates must never carry removals or internal ids: removals are
		// character-local (they would otherwise infect every character) and
		// _lid is app-local bookkeeping. Blank slots (reserved print rows)
		// are structural and are always kept.
		const cleanNode = ( node ) => {
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
	pruneValue: function( bval, oval, removed ) {
		if ( this.deepEqualClean( bval, oval ) ) return { drop: true };
		if ( oval === null || oval === undefined ) {
			return ( bval === null || bval === undefined ) ? { drop: true } : { keep: null };
		}
		if ( oval && typeof oval === 'object' && !Array.isArray( oval ) &&
		     bval && typeof bval === 'object' && !Array.isArray( bval ) ) {
			const out = {};
			for ( const k of Object.keys( oval ) ) {
				if ( k === 'sheet' || k === 'removedTraits' || k === 'removedSets' || k === 'id' || k === 'name' ) {
					out[k] = JSON.parse( JSON.stringify( oval[k] ) );
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
					const kept = oval[k].filter( el => !bval[k].some( be => this.deepEqualClean( be, el ) ) );
					if ( kept.length ) out[k] = kept;
					else if ( oval[k].length === 0 && bval[k].length > 0 ) out[k] = [];
					continue;
				}
				const r = this.pruneValue( bval[k], oval[k], null );
				if ( !r.drop ) out[k] = r.keep;
			}
			if ( !Object.keys( out ).length ) return { drop: true };
			if ( Object.keys( out ).every( kk => kk === 'id' || kk === 'name' ) ) return { drop: true };
			return { keep: out };
		}
		return { keep: JSON.parse( JSON.stringify( oval ) ) };
	},

	pruneTraitArrays: function( bTraits, oTraits, removed ) {
		const base = Array.isArray( bTraits ) ? bTraits : [];
		const over = Array.isArray( oTraits ) ? oTraits : [];
		void removed;
		const sparse = [];
		const baseByName = new Map();
		base.forEach( b => {
			if ( b && typeof b === 'object' && !this.isBlankName( b.name ) && !baseByName.has( b.name ) ) baseByName.set( b.name, b );
		} );
		over.forEach( ( o, i ) => {
			if ( !o || typeof o !== 'object' ) { sparse.push( JSON.parse( JSON.stringify( o ) ) ); return; }
			if ( !this.isBlankName( o.name ) ) {
				const b = baseByName.get( o.name );
				if ( !b ) { sparse.push( JSON.parse( JSON.stringify( o ) ) ); return; } // char-only
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
				if ( !b ) { sparse.push( JSON.parse( JSON.stringify( o ) ) ); return; } // extra blank slot
				const r = this.pruneValue( b, o, null );
				sparse.push( r.drop ? { name: ( typeof o.name === 'string' ? o.name : '' ) } : r.keep );
			}
		} );
		return sparse;
	},

	pruneSetArrays: function( bSets, oSets ) {
		const base = Array.isArray( bSets ) ? bSets : [];
		const over = Array.isArray( oSets ) ? oSets : [];
		const baseById = new Map();
		base.forEach( b => {
			if ( b && typeof b === 'object' && typeof b.id === 'string' && b.id.length && !baseById.has( b.id ) ) baseById.set( b.id, b );
		} );
		const sparse = [];
		// Recursively bare = join keys + name-only stubs all the way down.
		// Fully-inherited subtrees drop entirely (absent = inherit whole).
		const bare = ( t ) => {
			if ( !t || typeof t !== 'object' ) return true;
			if ( Array.isArray( t ) ) return t.every( bare );
			return Object.keys( t ).every( k => {
				if ( k === 'id' || k === 'name' ) return true;
				if ( k === 'traits' && Array.isArray( t[k] ) ) return t[k].every( bare );
				return false;
			} );
		};
		const stubOnly = ( p ) => bare( p );
		over.forEach( o => {
			if ( !o || typeof o !== 'object' ) { sparse.push( JSON.parse( JSON.stringify( o ) ) ); return; }
			const b = ( typeof o.id === 'string' && o.id.length ) ? baseById.get( o.id ) : null;
			if ( !b ) { sparse.push( JSON.parse( JSON.stringify( o ) ) ); return; } // custom set: whole
			const r = this.pruneValue( b, o, null );
			const pruned = r.drop ? { id: o.id } : r.keep;
			pruned.id = o.id;
			// Fully-inherited sets (join keys + bare name stubs only) drop
			// entirely — absent means inherit whole. Arrangement order lives
			// in the preference layer, not here.
			if ( !stubOnly( pruned ) ) sparse.push( pruned );
		} );
		return sparse;
	},

	// Strip a (cloned) character to its sparse overlay against a template
	// entry's character base.
	stripCharacterToDeltas: function( character, templateEntry ) {
		const base = this.findTemplateCharacter( templateEntry );
		if ( !base ) return JSON.parse( JSON.stringify( character ) );
	 const r = this.pruneValue( base, JSON.parse( JSON.stringify( character ) ), null );
		return r.drop ? {} : r.keep;
	},

	// Export form: sparse character (overrides only) + embedded full
	// template object, so the file is self-contained and hand-editable.
	// Without a resolvable template the character exports exactly as today.
	stripCharacterForExport: function( character, templateEntry ) {
		const clean = this.stripCharacterToDeltas( character, templateEntry );
		this.stripInternalIds( clean );
		if ( templateEntry && templateEntry.id ) {
			clean.sheet = { template: JSON.parse( JSON.stringify( templateEntry ) ) };
		}
		return clean;
	},

	renderInlineMarkdown: function( text ) {
		if ( !text || typeof text !== 'string' ) return '';
		// Escape user HTML first: everything below re-adds only our own safe tags.
		let str = this.escapeHtml( text );
		// Dice tokens
		str = str.replace( /\bd(4|6|8)\b/gi, '<span class="c">$1</span>' );
		str = str.replace( /\bd10\b/gi, '<span class="c">0</span>' );
		str = str.replace( /\bd12\b/gi, '<span class="c">2</span>' );
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

	renderMarkdownLinks: function( str ) {
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

	renderMarkdown: function( text ) {
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
				'nounSingular': 'Distinction',
				'nounPlural': 'Distinctions',
				'traits': [
					{
						'name': '',
						'value': 0,
						'dice': [],
						'description': '',
						'traits': [],
						'sfx': [ 'hinder' ],
						'tags': [],
						'custom': {},
					},
					{
						'name': '',
						'value': 0,
						'dice': [],
						'description': '',
						'traits': [],
						'sfx': [ 'hinder' ],
						'tags': [],
						'custom': {},
					},
					{
						'name': '',
						'value': 0,
						'dice': [],
						'description': '',
						'traits': [],
						'sfx': [ 'hinder' ],
						'tags': [],
						'custom': {},
					}
				],
				'sfx': [],
				'tags': [],
				'custom': {
					'cortexToolkit': {
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
					}
				},
			},
			{
				'name': 'Attributes',
				'description': '',
				'nounSingular': 'Attribute',
				'nounPlural': 'Attributes',
				'traits': [
					{
						'name': 'Physical',
						'value': 0,
						'dice': [],
						'description': '',
						'traits': [],
						'sfx': [],
						'tags': [],
						'custom': {},
					},
					{
						'name': 'Mental',
						'value': 0,
						'dice': [],
						'description': '',
						'traits': [],
						'sfx': [],
						'tags': [],
						'custom': {},
					},
					{
						'name': 'Social',
						'value': 0,
						'dice': [],
						'description': '',
						'traits': [],
						'sfx': [],
						'tags': [],
						'custom': {},
					}
				],
				'sfx': [],
				'tags': [],
				'custom': {
					'cortexToolkit': {
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
					}
				},
			},
			{
				'name': 'Skills',
				'description': '',
				'nounSingular': 'Skill',
				'nounPlural': 'Skills',
				'traits': [
					{
						'name': '',
						'value': 0,
						'dice': [],
						'description': '',
						'traits': [],
						'sfx': [],
						'tags': [],
						'custom': {},
					}
				],
				'sfx': [],
				'tags': [],
				'custom': {
					'cortexToolkit': {
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
					}
				},
			}
		],
		'portrait': {
			'url': '',
			'alt': '',
			'tags': [],
			'custom': {
				'cortexToolkit': {
					'alignment': 'top-center',
					'size': 'spotlight',
					'location': 'header'
				}
			}
		},
		'plotPoints': 1,
		'notes': '',
		'tags': [],
		'custom': {
			'cortexToolkit': {
				'sheetStyle': 'spotlight',
				'columns': 2,
				'pageCount': 1,
				'columnAlignment': 'top-base',
				'columnOffsets': {
					'left': 0,
					'center': 0,
					'right': 0
				},
				'style': {
					'hasAttributes': false,
				}
			}
		}
	},
	
	defaultTraitSet: {
		name: 'New trait set',
		description: 'Trait set description',
		nounSingular: '',
		nounPlural: '',
		traits: [],
		sfx: [],
		tags: [],
		custom: {
			'cortexToolkit': {
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
				multiDie: false,
				stressConfig: {
					includeD4: false,
					includeOut: true
				},
				notes: ''
			}
		}
	},
	
	defaultTrait: {
		name: 'New trait',
		value: 6,
		dice: [6],
		description: 'Trait description',
		traits: [],
		sfx: [],
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

if (typeof module !== "undefined" && module.exports) {
	module.exports = cortexFunctions;
}
