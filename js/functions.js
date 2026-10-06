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
		let fill = isFilled ? '#000000' : '#ffffff';
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
				fill = cfg.unfilledBackground || '#ffffff';
				stroke = cfg.unfilledBorder || '#000000';
				textFill = cfg.unfilledNumeral || '#000000';
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
	isSafeUrl: function( url, allowDataImage ) {
		if ( !url || typeof url !== 'string' ) return false;
		const clean = url.trim();
		if ( /^(https?:\/\/|\/|#)/i.test( clean ) ) return true;
		if ( /^mailto:/i.test( clean ) ) return true;
		if ( allowDataImage && /^data:image\/(png|jpe?g|gif|webp|svg\+xml|bmp|avif);base64,/i.test( clean ) ) return true;
		if ( allowDataImage && /^blob:/i.test( clean ) ) return true;
		return false;
	},

	// Returns a URL safe for CSS url(...) / background bindings, else ''.
	safeImageUrl: function( url ) {
		if ( !url || typeof url !== 'string' ) return '';
		return this.isSafeUrl( url, true ) ? url : '';
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
	sanitizeImportedCharacter: function( data ) {
		if ( !data || typeof data !== 'object' || Array.isArray( data ) ) return null;
		if ( typeof data.id !== 'string' || !data.id.length ) return null;
		const clean = JSON.parse( JSON.stringify( data ) );
		if ( !Array.isArray( clean.traitSets ) ) clean.traitSets = [];
		clean.traitSets.forEach( ts => {
			if ( !ts || typeof ts !== 'object' ) return;
			if ( !Array.isArray( ts.traits ) ) ts.traits = [];
			if ( !ts.custom || typeof ts.custom !== 'object' ) ts.custom = {};
			ts.traits.forEach( tr => {
				if ( !tr || typeof tr !== 'object' ) return;
				if ( typeof tr.name !== 'string' ) tr.name = '';
				if ( !Array.isArray( tr.dice ) ) tr.dice = [];
				if ( !Array.isArray( tr.traits ) ) tr.traits = [];
				if ( !Array.isArray( tr.sfx ) ) tr.sfx = [];
				if ( !tr.custom || typeof tr.custom !== 'object' ) tr.custom = {};
			});
		});
		if ( typeof clean.name !== 'string' ) clean.name = '';
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
