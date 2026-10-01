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

	renderInlineMarkdown: function( text ) {
		if ( !text || typeof text !== 'string' ) return '';
		let str = text;
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
		// Links: [label](url)
		str = str.replace( /\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>' );
		return str;
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
		'name': 'Name',
		'game': '',
		'description': 'Description',
		'pronouns': '',
		'traitSets': [
			{
				'name': 'Distinctions',
				'description': 'Trait set description',
				'nounSingular': 'Distinction',
				'nounPlural': 'Distinctions',
				'traits': [
					{
						'name': 'Distinction 1',
						'value': 8,
						'description': 'Trait description',
						'traits': [],
						'sfx': [ 'hinder' ],
						'tags': [],
						'custom': {},
					},
					{
						'name': 'Distinction 2',
						'value': 8,
						'description': 'Trait description',
						'traits': [],
						'sfx': [ 'hinder' ],
						'tags': [],
						'custom': {},
					},
					{
						'name': 'Distinction 3',
						'value': 8,
						'description': 'Trait description',
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
						'name': 'Attribute 1',
						'value': 8,
						'description': 'Trait description',
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
						'location': 'attributes',
						'scaleDie': 0,
						'style': {
							'header': 'attributes',
							'body': 'attributes',
						},
						'haloConfig': {
							'arcAngle': -90,
							'arcSpread': 100,
							'arcDistance': 0,
							'scaleAngle': 0,
							'scaleDistance': 0,
							'scaleDieX': 0,
							'scaleDieY': 0
						}
					}
				},
			},
			{
				'name': 'New trait set',
				'description': 'Trait set description',
				'nounSingular': '',
				'nounPlural': '',
				'traits': [
					{
						'name': 'New trait',
						'value': 6,
						'description': 'Trait description',
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
						'location': 'left',
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
					'alignment': 'top-center'
				}
			}
		},
		'plotPoints': 0,
		'notes': '',
		'tags': [],
		'custom': {
			'cortexToolkit': {
				'scale': 0,
				'style': {
					'hasAttributes': true,
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
