const GOOGLE_FONTS_CATALOG = [
	{ name: 'Josefin Sans', label: 'Josefin Sans (Display Geometric)' },
	{ name: 'Cinzel', label: 'Cinzel (Mythic / Classical Serif)' },
	{ name: 'Montserrat', label: 'Montserrat (Clean / Modern Sans)' },
	{ name: 'Orbitron', label: 'Orbitron (Sci-Fi / Futuristic)' },
	{ name: 'Rajdhani', label: 'Rajdhani (Tech / Cyberpunk)' },
	{ name: 'MedievalSharp', label: 'MedievalSharp (Fantasy)' },
	{ name: 'Playfair Display', label: 'Playfair Display (Elegant Serif)' },
	{ name: 'Oswald', label: 'Oswald (Condensed / Punchy)' },
	{ name: 'Open Sans', label: 'Open Sans (Neutral / Readable)' },
	{ name: 'Roboto', label: 'Roboto (Modern / Clean)' },
	{ name: 'Lato', label: 'Lato (Warm / Balanced)' },
	{ name: 'Inter', label: 'Inter (Precision UI)' },
	{ name: 'Merriweather', label: 'Merriweather (Literary Serif)' },
	{ name: 'Alegreya Sans SC', label: 'Alegreya Sans SC (Small Caps)' },
	{ name: 'Bebas Neue', label: 'Bebas Neue (Heavy Headline)' }
];

const DICE_PRESETS = [
	{
		name: 'Classic Ink',
		style: 'custom',
		backgroundType: 'solid',
		backgroundColor1: '#ffffff',
		backgroundColor2: '#f1f5f9',
		numeralColor: '#000000',
		borderColor: '#000000',
		borderWidth: 1.7,
		unfilledBackground: '#ffffff',
		unfilledNumeral: '#000000',
		unfilledBorder: '#000000'
	},
	{
		name: 'Inverted Noir',
		style: 'custom',
		backgroundType: 'solid',
		backgroundColor1: '#000000',
		backgroundColor2: '#0f172a',
		numeralColor: '#ffffff',
		borderColor: '#ffffff',
		borderWidth: 1.7,
		unfilledBackground: '#1e293b',
		unfilledNumeral: '#94a3b8',
		unfilledBorder: '#64748b'
	},
	{
		name: 'Cyberpunk Neon',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#06b6d4',
		backgroundColor2: '#d946ef',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#06b6d4',
		borderWidth: 2,
		unfilledBackground: '#0f172a',
		unfilledNumeral: '#38bdf8',
		unfilledBorder: '#0284c7'
	},
	{
		name: 'Solar Flare',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#f59e0b',
		backgroundColor2: '#dc2626',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#f59e0b',
		borderWidth: 1.8,
		unfilledBackground: '#451a03',
		unfilledNumeral: '#fbbf24',
		unfilledBorder: '#d97706'
	},
	{
		name: 'Arcane Violet',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#8b5cf6',
		backgroundColor2: '#3b82f6',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#c084fc',
		borderWidth: 1.8,
		unfilledBackground: '#1e1b4b',
		unfilledNumeral: '#a78bfa',
		unfilledBorder: '#7c3aed'
	},
	{
		name: 'Emerald Forge',
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#10b981',
		backgroundColor2: '#047857',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '#34d399',
		borderWidth: 1.8,
		unfilledBackground: '#064e3b',
		unfilledNumeral: '#6ee7b7',
		unfilledBorder: '#059669'
	}
];

const NameEditor = {

	props: {
		character:  Object,
		open:       Boolean,
		initialTab: {
			type: String,
			default: 'sheet'
		}
	},

	data() {
		return {
			currentTab: 'sheet',
			googleFontsCatalog: GOOGLE_FONTS_CATALOG,
			dicePresets: DICE_PRESETS,
			customGoogleFontInput: '',
			presetColors: [
				{ name: 'Cortex Sky', hex: '#0ea5e9' },
				{ name: 'Crimson Ruby', hex: '#e11d48' },
				{ name: 'Emerald', hex: '#10b981' },
				{ name: 'Indigo Purple', hex: '#6366f1' },
				{ name: 'Amber Gold', hex: '#f59e0b' },
				{ name: 'Rose Coral', hex: '#f43f5e' },
				{ name: 'Teal Cyan', hex: '#14b8a6' },
				{ name: 'Slate Dark', hex: '#475569' }
			]
		}
	},

	computed: {

		name: {
			get() {
				return this.character?.name ?? '';
			},
			set( name ) {
				this.setCharacterProperty( 'name', name );
			}
		},

		game: {
			get() {
				return this.character?.game ?? '';
			},
			set( game ) {
				this.setCharacterProperty( 'game', game );
			}
		},

		player: {
			get() {
				return this.character?.player ?? '';
			},
			set( player ) {
				this.setCharacterProperty( 'player', player );
			}
		},

		nickname: {
			get() {
				return this.character?.nickname ?? this.character?.custom?.cortexToolkit?.nickname ?? '';
			},
			set( nickname ) {
				this.setCharacterProperty( 'nickname', nickname );
				if ( !this.character.custom ) this.character.custom = {};
				if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
				this.character.custom.cortexToolkit.nickname = nickname;
			}
		},
		
		description: {
			get() {
				return this.character?.description ?? '';
			},
			set( description ) {
				this.setCharacterProperty( 'description', description );
			}
		},

		pronouns: {
			get() {
				return this.character?.pronouns ?? '';
			},
			set( pronouns ) {
				this.setCharacterProperty( 'pronouns', pronouns );
			}
		},

		notes: {
			get() {
				return this.character?.notes ?? '';
			},
			set( notes ) {
				this.setCharacterProperty( 'notes', notes );
			}
		},

		plotPoints: {
			get() {
				return Number( this.character?.plotPoints ) || 0;
			},
			set( val ) {
				this.setCharacterProperty( 'plotPoints', Math.max(0, parseInt(val, 10) || 0) );
			}
		},

		sheetStyle: {
			get() {
				if ( this.character?.custom?.cortexToolkit?.style?.body === 'spotlight' ) return 'spotlight';
				if ( this.character?.custom?.cortexToolkit?.style?.hasAttributes === false ) return 'spotlight';
				return 'classic';
			},
			set( style ) {
				if ( !this.character ) return;
				if ( !this.character.custom ) this.character.custom = {};
				if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
				if ( !this.character.custom.cortexToolkit.style ) this.character.custom.cortexToolkit.style = {};
				this.character.custom.cortexToolkit.style.body = style;
				this.character.custom.cortexToolkit.style.hasAttributes = (style !== 'spotlight');
				this.$emit('updateCharacter', this.character);
			}
		},

		pageCount: {
			get() {
				return Number( this.character?.pages ) || 1;
			},
			set( count ) {
				this.setCharacterProperty( 'pages', count );
			}
		},

		columnCount: {
			get() {
				return Number( this.character?.custom?.cortexToolkit?.columns ) === 3 ? 3 : 2;
			},
			set( count ) {
				if ( !this.character ) return;
				if ( !this.character.custom ) this.character.custom = {};
				if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
				this.character.custom.cortexToolkit.columns = count;
				this.$emit('updateCharacter', this.character);
			}
		},

		pageJustification: {
			get() {
				return this.character?.custom?.cortexToolkit?.pageJustification || 'top-base';
			},
			set( mode ) {
				if ( !this.character ) return;
				if ( !this.character.custom ) this.character.custom = {};
				if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
				this.character.custom.cortexToolkit.pageJustification = mode;
				this.$emit('updateCharacter', this.character);
			}
		},

		accentColor: {
			get() {
				return this.character?.custom?.cortexToolkit?.accentColor || '#0ea5e9';
			},
			set( val ) {
				if ( !this.character ) return;
				if ( !this.character.custom ) this.character.custom = {};
				if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
				this.character.custom.cortexToolkit.accentColor = val;
				this.$emit('updateCharacter', this.character);
			}
		},

		primaryColor: {
			get() {
				return this.character?.custom?.cortexToolkit?.primaryColor || this.accentColor;
			},
			set( val ) {
				if ( !this.character ) return;
				if ( !this.character.custom ) this.character.custom = {};
				if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
				this.character.custom.cortexToolkit.primaryColor = val;
				this.$emit('updateCharacter', this.character);
			}
		},

		headingFont: {
			get() {
				return this.character?.custom?.cortexToolkit?.theme?.fonts?.heading || 'Josefin Sans';
			},
			set( val ) {
				this.setThemeFont('heading', val);
			}
		},

		primaryFont: {
			get() {
				return this.character?.custom?.cortexToolkit?.theme?.fonts?.primary || 'Open Sans';
			},
			set( val ) {
				this.setThemeFont('primary', val);
			}
		},

		secondaryFont: {
			get() {
				return this.character?.custom?.cortexToolkit?.theme?.fonts?.secondary || 'Alegreya Sans SC';
			},
			set( val ) {
				this.setThemeFont('secondary', val);
			}
		},

		customFontsList() {
			return (this.character?.custom?.cortexToolkit?.customFonts || []).map(f => f.name);
		},

		diceConfig: {
			get() {
				return this.character?.custom?.cortexToolkit?.diceConfig || {
					style: 'default',
					backgroundType: 'solid',
					backgroundColor1: '#ffffff',
					backgroundColor2: '#f1f5f9',
					gradientAngle: 135,
					numeralColor: '#000000',
					borderColor: '#000000',
					borderWidth: 1.7,
					unfilledBackground: '#ffffff',
					unfilledNumeral: '#000000',
					unfilledBorder: '#000000'
				};
			},
			set( cfg ) {
				if ( !this.character ) return;
				if ( !this.character.custom ) this.character.custom = {};
				if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
				this.character.custom.cortexToolkit.diceConfig = { ...cfg };
				if ( typeof window !== 'undefined' ) {
					window.__cortexActiveDiceConfig = { ...cfg };
				}
				this.$emit('updateCharacter', this.character);
			}
		},

		watermarkEnabled: {
			get() {
				return Boolean( this.character?.custom?.cortexToolkit?.watermark?.enabled );
			},
			set( val ) {
				this.setWatermarkProperty( 'enabled', Boolean(val) );
			}
		},

		watermarkURL: {
			get() {
				return this.character?.custom?.cortexToolkit?.watermark?.url ?? '';
			},
			set( val ) {
				this.setWatermarkProperty( 'url', val );
				if ( val && !this.watermarkEnabled ) {
					this.setWatermarkProperty( 'enabled', true );
				}
			}
		},

		watermarkOpacity: {
			get() {
				return this.character?.custom?.cortexToolkit?.watermark?.opacity ?? 0.08;
			},
			set( val ) {
				this.setWatermarkProperty( 'opacity', Number(val) || 0.08 );
			}
		},

		watermarkScale: {
			get() {
				return this.character?.custom?.cortexToolkit?.watermark?.scale ?? 75;
			},
			set( val ) {
				this.setWatermarkProperty( 'scale', Number(val) || 75 );
			}
		},

		watermarkPage: {
			get() {
				return this.character?.custom?.cortexToolkit?.watermark?.page ?? 'all';
			},
			set( val ) {
				this.setWatermarkProperty( 'page', val );
			}
		}
		
	},

	/*html*/
	template: `<aside :class="{ 'editor': true, 'editor-character': true, 'open': open, 'scrollable': true }" @click.stop="">

		<div class="editor-arrow"></div>

		<div class="editor-controls">
			<button @click.stop="selectElement([])" title="Close"><i class="fas fa-times"></i></button>
		</div>

		<div class="editor-inner">
			<div>

				<!-- 4-TIER INSPECTOR TAB NAVIGATION -->
				<div class="editor-tabs">
					<button type="button" class="editor-tab-btn" :class="{ active: currentTab === 'sheet' }" @click.stop="currentTab = 'sheet'" title="Sheet Details">
						<i class="fas fa-id-card"></i> Sheet
					</button>
					<button type="button" class="editor-tab-btn" :class="{ active: currentTab === 'page' }" @click.stop="currentTab = 'page'" title="Page &amp; Columns Justification">
						<i class="fas fa-columns"></i> Page
					</button>
					<button type="button" class="editor-tab-btn" :class="{ active: currentTab === 'theme' }" @click.stop="currentTab = 'theme'" title="Fonts &amp; Colors">
						<i class="fas fa-font"></i> Fonts &amp; Colors
					</button>
					<button type="button" class="editor-tab-btn" :class="{ active: currentTab === 'dice' }" @click.stop="currentTab = 'dice'" title="Dice Editor">
						<i class="fas fa-dice-d20"></i> Dice
					</button>
				</div>

				<div class="editor-fields">

					<!-- ================= TAB 1: SHEET LEVEL ================= -->
					<template v-if="currentTab === 'sheet'">
						<div class="editor-field">
							<label>Character Name</label>
							<input type="text" v-model="name" ref="inputName" placeholder="e.g. Maya Lin, Vance Astro">
						</div>

						<div class="editor-field">
							<label>Game / Campaign Title</label>
							<input type="text" v-model="game" placeholder="e.g. Terraverse, Dragon Brigade...">
						</div>

						<div class="editor-field">
							<label>Nickname / Call-Sign</label>
							<input type="text" v-model="nickname" placeholder="e.g. Apex, Kid">
						</div>

						<div class="editor-field">
							<label>Player Name</label>
							<input type="text" v-model="player" placeholder="Player name...">
						</div>

						<div class="editor-field">
							<label>Pronouns</label>
							<input type="text" v-model="pronouns" placeholder="e.g. she/her, they/them">
						</div>

						<div class="editor-field">
							<label>Plot Points (PP)</label>
							<input type="number" min="0" v-model.number="plotPoints">
						</div>

						<div class="editor-field">
							<label>Description / Bio</label>
							<textarea v-model="description" rows="3" placeholder="Character narrative background..."></textarea>
						</div>

						<div class="editor-field">
							<label>Sheet Layout Style</label>
							<select v-model="sheetStyle">
								<option value="spotlight">Spotlight Style (Modern Grid &amp; Print)</option>
								<option value="classic">Classic Style (Attributes Ring)</option>
							</select>
						</div>

						<!-- WATERMARK CONFIGURATION -->
						<div class="editor-field">
							<label>Watermark Image</label>
							<div class="editor-checkbox-row" style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
								<input type="checkbox" id="name-editor-watermark-enabled" v-model="watermarkEnabled">
								<label for="name-editor-watermark-enabled" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Enable Background Watermark</label>
							</div>

							<div v-if="watermarkEnabled" class="watermark-settings" style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 4px;">
								<div v-if="watermarkURL" style="text-align: center; padding: 0.25rem;">
									<img :src="watermarkURL" style="max-height: 70px; max-width: 100%; object-fit: contain; border-radius: 3px; border: 1px solid #cbd5e1;">
								</div>

								<div class="editor-button-container">
									<div class="editor-button-container-inner">
										<div class="editor-button" @click.prevent="uploadWatermarkStart">
											<span><i class="fas fa-upload"></i> {{ watermarkURL ? 'Change' : 'Upload' }} Watermark</span>
										</div>
										<div class="editor-button" v-if="watermarkURL" style="background: #ef4444; color: #ffffff;" @click.prevent="removeWatermark">
											<span><i class="fas fa-trash-alt"></i> Remove</span>
										</div>
									</div>
								</div>

								<input type="file" ref="watermarkFileInput" style="display:none" @change="uploadWatermarkProcess" accept="image/*">

								<div>
									<label style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Image URL</label>
									<input type="text" v-model.lazy="watermarkURL" placeholder="https://example.com/watermark.png">
								</div>

								<div class="slider-row">
									<div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.2rem;">
										<span>Opacity</span>
										<span>{{ Math.round(watermarkOpacity * 100) }}%</span>
									</div>
									<input type="range" min="0.02" max="0.35" step="0.01" v-model.number="watermarkOpacity">
								</div>

								<div class="slider-row">
									<div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.2rem;">
										<span>Scale</span>
										<span>{{ watermarkScale }}%</span>
									</div>
									<input type="range" min="30" max="130" step="5" v-model.number="watermarkScale">
								</div>
							</div>
						</div>
					</template>

					<!-- ================= TAB 2: PAGE LEVEL ================= -->
					<template v-else-if="currentTab === 'page'">
						<div class="editor-field">
							<label>Page Justification</label>
							<div class="editor-segmented-wrap" style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem;">
								<label style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem; cursor: pointer; color: #f1f5f9;">
									<input type="radio" value="top-base" v-model="pageJustification">
									<strong>Top Base (Level Columns)</strong>
								</label>
								<p style="font-size: 0.7rem; color: #94a3b8; margin: 0 0 0 1.4rem; line-height: 1.3;">
									Columns start strictly level at the top base with flush vertical baselines.
								</p>

								<label style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem; cursor: pointer; color: #f1f5f9;">
									<input type="radio" value="distributed" v-model="pageJustification">
									<strong>Distributed (Justify Height)</strong>
								</label>
								<p style="font-size: 0.7rem; color: #94a3b8; margin: 0 0 0 1.4rem; line-height: 1.3;">
									Sections distribute vertically to fill the full printable page height.
								</p>
							</div>
						</div>

						<div class="editor-field">
							<label>Columns Layout</label>
							<select v-model.number="columnCount">
								<option :value="2">2 Columns</option>
								<option :value="3">3 Columns</option>
							</select>
							<span class="editor-field-hint" style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.25rem; display: block;">
								Sets whether the printable sheet layout divides into 2 or 3 parallel columns.
							</span>
						</div>

						<div class="editor-field">
							<label>Page Count</label>
							<select v-model.number="pageCount">
								<option :value="1">1 Page</option>
								<option :value="2">2 Pages</option>
							</select>
						</div>
					</template>

					<!-- ================= TAB 3: THEME & FONTS ================= -->
					<template v-else-if="currentTab === 'theme'">
						<div class="editor-field">
							<label>Theme Accent Color</label>
							<div class="theme-accent-swatches">
								<button
									v-for="swatch in presetColors"
									:key="swatch.hex"
									type="button"
									class="color-swatch-btn"
									:class="{ active: accentColor === swatch.hex }"
									:style="{ backgroundColor: swatch.hex }"
									:title="swatch.name + ' (' + swatch.hex + ')'"
									@click.stop="setAccent(swatch.hex)"
								></button>
							</div>
							<div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.35rem;">
								<input type="color" v-model="accentColor" style="width: 2.2rem; height: 1.8rem; padding: 0; border: none; cursor: pointer; border-radius: 4px;">
								<input type="text" v-model="accentColor" placeholder="#0ea5e9" style="font-family: monospace; font-size: 0.8rem;">
								<button type="button" class="editor-tab-btn" style="border: 1px solid rgba(255,255,255,0.2);" @click.stop="resetAccent" title="Reset">
									Reset
								</button>
							</div>
						</div>

						<!-- TYPOGRAPHY SELECTION -->
						<div class="editor-field">
							<label>Heading Font</label>
							<select v-model="headingFont" @change="onFontSelected(headingFont)">
								<optgroup label="Curated Google Fonts">
									<option v-for="f in googleFontsCatalog" :key="f.name" :value="f.name">{{ f.label }}</option>
								</optgroup>
								<optgroup label="Custom Uploaded Fonts" v-if="customFontsList.length">
									<option v-for="cf in customFontsList" :key="cf" :value="cf">{{ cf }} (Custom)</option>
								</optgroup>
							</select>
						</div>

						<div class="editor-field">
							<label>Body Font (Readability)</label>
							<select v-model="primaryFont" @change="onFontSelected(primaryFont)">
								<optgroup label="Curated Google Fonts">
									<option v-for="f in googleFontsCatalog" :key="f.name" :value="f.name">{{ f.label }}</option>
								</optgroup>
								<optgroup label="Custom Uploaded Fonts" v-if="customFontsList.length">
									<option v-for="cf in customFontsList" :key="cf" :value="cf">{{ cf }} (Custom)</option>
								</optgroup>
							</select>
						</div>

						<div class="editor-field">
							<label>Trait / Label Font</label>
							<select v-model="secondaryFont" @change="onFontSelected(secondaryFont)">
								<optgroup label="Curated Google Fonts">
									<option v-for="f in googleFontsCatalog" :key="f.name" :value="f.name">{{ f.label }}</option>
								</optgroup>
								<optgroup label="Custom Uploaded Fonts" v-if="customFontsList.length">
									<option v-for="cf in customFontsList" :key="cf" :value="cf">{{ cf }} (Custom)</option>
								</optgroup>
							</select>
						</div>

						<!-- PULL ANY GOOGLE FONT -->
						<div class="editor-field" style="background: rgba(255,255,255,0.05); padding: 0.6rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15);">
							<label style="font-size: 0.75rem;"><i class="fab fa-google"></i> Pull Any Google Font</label>
							<div style="display: flex; gap: 0.4rem; margin-top: 0.25rem;">
								<input type="text" v-model="customGoogleFontInput" placeholder="e.g. Syne, Cinzel Decorative, Poppins" style="font-size: 0.8rem;">
								<button type="button" class="editor-tab-btn" style="border: 1px solid rgba(255,255,255,0.25); white-space: nowrap;" @click.stop="pullGoogleFont">
									Load
								</button>
							</div>
							<span class="editor-field-hint" style="font-size: 0.68rem; color: #94a3b8; margin-top: 0.25rem; display: block;">
								Fetches any font family from fonts.google.com and sets it as the heading font.
							</span>
						</div>

						<!-- CUSTOM FONT UPLOAD -->
						<div class="editor-field" style="background: rgba(255,255,255,0.05); padding: 0.6rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15);">
							<label style="font-size: 0.75rem;"><i class="fas fa-file-arrow-up"></i> Upload Custom Font</label>
							<input type="file" ref="fontFileInput" style="display:none" @change="handleFontUpload" accept=".woff,.woff2,.ttf,.otf">
							<button type="button" class="editor-tab-btn" style="width: 100%; margin-top: 0.3rem; border: 1px solid rgba(255,255,255,0.25); text-align: center;" @click.stop="triggerFontUpload">
								<i class="fas fa-upload"></i> Choose Font File (.woff2, .woff, .ttf)
							</button>
							<span class="editor-field-hint" style="font-size: 0.68rem; color: #94a3b8; margin-top: 0.25rem; display: block;">
								Uploaded fonts are embedded into the character JSON and available immediately.
							</span>
						</div>
					</template>

					<!-- ================= TAB 4: VISUAL DICE EDITOR ================= -->
					<template v-else-if="currentTab === 'dice'">
						<!-- LIVE SVG PREVIEW OF ALL 5 DICE -->
						<div class="editor-field" style="text-align: center; background: rgba(0,0,0,0.5); padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2);">
							<label style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.4rem; display: block;">Live Dice Appearance Preview</label>
							<div style="display: flex; justify-content: center; gap: 0.6rem; align-items: center; margin-bottom: 0.5rem;">
								<span v-for="d in [4, 6, 8, 10, 12]" :key="'filled-' + d" v-html="renderDicePreview(d, true)" :title="'d' + d + ' (Active / Filled)'"></span>
							</div>
							<div style="font-size: 0.68rem; color: #94a3b8; margin-top: 0.2rem;">Unfilled / Reserved Slots Preview:</div>
							<div style="display: flex; justify-content: center; gap: 0.6rem; align-items: center; margin-top: 0.3rem;">
								<span v-for="d in [4, 6, 8, 10, 12]" :key="'unfilled-' + d" v-html="renderDicePreview(d, false)" :title="'d' + d + ' (Unfilled / Inactive)'"></span>
							</div>
						</div>

						<!-- PRESET PALETTES -->
						<div class="editor-field">
							<label>Dice Themes &amp; Presets</label>
							<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-top: 0.25rem;">
								<button
									v-for="p in dicePresets"
									:key="p.name"
									type="button"
									class="editor-tab-btn"
									style="font-size: 0.75rem; padding: 0.35rem; border: 1px solid rgba(255,255,255,0.2); text-align: left; display: flex; align-items: center; gap: 0.4rem;"
									@click.stop="applyDicePreset(p)"
								>
									<span :style="{ width: '12px', height: '12px', borderRadius: '2px', background: p.backgroundColor1, display: 'inline-block', border: '1px solid ' + p.borderColor }"></span>
									{{ p.name }}
								</button>
							</div>
						</div>

						<!-- BACKGROUND TYPE: SOLID VS GRADIENT -->
						<div class="editor-field">
							<label>Die Fill Background</label>
							<div class="editor-button-group" style="margin-bottom: 0.5rem;">
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: diceConfig.backgroundType === 'solid' }"
									@click.stop="updateDiceProp('backgroundType', 'solid')"
								>
									Solid Color
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: diceConfig.backgroundType === 'gradient' }"
									@click.stop="updateDiceProp('backgroundType', 'gradient')"
								>
									Linear Gradient
								</button>
							</div>

							<div style="display: flex; flex-direction: column; gap: 0.5rem;">
								<div style="display: flex; align-items: center; justify-content: space-between;">
									<span style="font-size: 0.75rem; color: #cbd5e1;">{{ diceConfig.backgroundType === 'gradient' ? 'Start Color' : 'Fill Color' }}</span>
									<div style="display: flex; align-items: center; gap: 0.4rem;">
										<input type="color" :value="diceConfig.backgroundColor1 || '#ffffff'" @input="updateDiceProp('backgroundColor1', $event.target.value)" style="width: 2rem; height: 1.6rem; border: none; cursor: pointer; border-radius: 3px;">
										<input type="text" :value="diceConfig.backgroundColor1 || '#ffffff'" @input="updateDiceProp('backgroundColor1', $event.target.value)" style="font-family: monospace; font-size: 0.75rem; width: 5.5rem;">
									</div>
								</div>

								<div v-if="diceConfig.backgroundType === 'gradient'" style="display: flex; align-items: center; justify-content: space-between;">
									<span style="font-size: 0.75rem; color: #cbd5e1;">End Color</span>
									<div style="display: flex; align-items: center; gap: 0.4rem;">
										<input type="color" :value="diceConfig.backgroundColor2 || '#f1f5f9'" @input="updateDiceProp('backgroundColor2', $event.target.value)" style="width: 2rem; height: 1.6rem; border: none; cursor: pointer; border-radius: 3px;">
										<input type="text" :value="diceConfig.backgroundColor2 || '#f1f5f9'" @input="updateDiceProp('backgroundColor2', $event.target.value)" style="font-family: monospace; font-size: 0.75rem; width: 5.5rem;">
									</div>
								</div>

								<div v-if="diceConfig.backgroundType === 'gradient'" class="slider-row">
									<div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.2rem;">
										<span>Gradient Angle</span>
										<span>{{ diceConfig.gradientAngle || 135 }}°</span>
									</div>
									<input type="range" min="0" max="360" step="15" :value="diceConfig.gradientAngle || 135" @input="updateDiceProp('gradientAngle', Number($event.target.value))">
								</div>
							</div>
						</div>

						<!-- NUMERAL COLOR -->
						<div class="editor-field">
							<div style="display: flex; align-items: center; justify-content: space-between;">
								<label style="margin: 0;">Numeral / Text Color</label>
								<div style="display: flex; align-items: center; gap: 0.4rem;">
									<input type="color" :value="diceConfig.numeralColor || '#000000'" @input="updateDiceProp('numeralColor', $event.target.value)" style="width: 2rem; height: 1.6rem; border: none; cursor: pointer; border-radius: 3px;">
									<input type="text" :value="diceConfig.numeralColor || '#000000'" @input="updateDiceProp('numeralColor', $event.target.value)" style="font-family: monospace; font-size: 0.75rem; width: 5.5rem;">
								</div>
							</div>
						</div>

						<!-- BORDER COLOR & WIDTH -->
						<div class="editor-field">
							<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
								<label style="margin: 0;">Border Color</label>
								<div style="display: flex; align-items: center; gap: 0.4rem;">
									<input type="color" :value="diceConfig.borderColor || '#000000'" @input="updateDiceProp('borderColor', $event.target.value)" style="width: 2rem; height: 1.6rem; border: none; cursor: pointer; border-radius: 3px;">
									<input type="text" :value="diceConfig.borderColor || '#000000'" @input="updateDiceProp('borderColor', $event.target.value)" style="font-family: monospace; font-size: 0.75rem; width: 5.5rem;">
								</div>
							</div>
							<div class="slider-row">
								<div class="slider-header" style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.2rem;">
									<span>Border Width</span>
									<span>{{ diceConfig.borderWidth || 1.7 }}px</span>
								</div>
								<input type="range" min="1" max="3" step="0.2" :value="diceConfig.borderWidth || 1.7" @input="updateDiceProp('borderWidth', Number($event.target.value))">
							</div>
						</div>

						<!-- RESET DICE BUTTON -->
						<div class="editor-field" style="margin-top: 0.75rem;">
							<button type="button" class="editor-tab-btn" style="width: 100%; border: 1px solid rgba(255,255,255,0.25); text-align: center;" @click.stop="resetDiceConfig">
								<i class="fas fa-undo"></i> Reset to Default Dice Appearance
							</button>
						</div>
					</template>

				</div>

			</div>
		</div>
		
	</aside>`,

	watch: {
		open( isOpen, wasOpen ) {
			if ( isOpen && !wasOpen ) {
				if ( this.initialTab ) {
					this.currentTab = this.initialTab;
				}
				if ( this.currentTab === 'sheet' ) {
					this.focusFirstInput();
				}
			}
		},
		initialTab( newTab ) {
			if ( newTab ) {
				this.currentTab = newTab;
			}
		}
	},

	methods: {

		selectElement( selector ) {
			this.$emit( 'selectElement', selector );
		},

		async focusFirstInput() {
			await Vue.nextTick();
			if ( this.$refs.inputName ) {
				this.$refs.inputName.focus();
			}
		},
 
		setCharacterProperty( key, value ) {
			let character = this.character;
			character[ key ] = value;
			this.updateCharacter( character );
		},

		ensureWatermarkStruct() {
			if ( !this.character ) return;
			if ( !this.character.custom ) this.character.custom = {};
			if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
			if ( !this.character.custom.cortexToolkit.watermark ) {
				this.character.custom.cortexToolkit.watermark = {
					enabled: false,
					url: '',
					opacity: 0.08,
					scale: 75,
					page: 'all'
				};
			}
		},

		setWatermarkProperty( key, value ) {
			this.ensureWatermarkStruct();
			this.character.custom.cortexToolkit.watermark[ key ] = value;
			this.updateCharacter( this.character );
		},

		uploadWatermarkStart() {
			this.$refs.watermarkFileInput.click();
		},

		uploadWatermarkProcess( event ) {
			if ( !event.target.files || !event.target.files.length ) return;
			const file = event.target.files[0];
			const reader = new FileReader();
			reader.onload = () => {
				this.watermarkURL = reader.result;
				this.watermarkEnabled = true;
			};
			reader.readAsDataURL( file );
		},

		removeWatermark() {
			this.watermarkURL = '';
			this.watermarkEnabled = false;
		},

		setAccent( hex ) {
			this.accentColor = hex;
		},

		resetAccent() {
			if ( !this.character ) return;
			if ( !this.character.custom ) this.character.custom = {};
			if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
			delete this.character.custom.cortexToolkit.accentColor;
			this.$emit( 'updateCharacter', this.character );
		},

		setThemeFont( target, fontName ) {
			if ( !this.character ) return;
			if ( !this.character.custom ) this.character.custom = {};
			if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
			if ( !this.character.custom.cortexToolkit.theme ) this.character.custom.cortexToolkit.theme = {};
			if ( !this.character.custom.cortexToolkit.theme.fonts ) this.character.custom.cortexToolkit.theme.fonts = {};
			this.character.custom.cortexToolkit.theme.fonts[ target ] = fontName;
			if ( typeof cortexFunctions !== 'undefined' && cortexFunctions.loadGoogleFont ) {
				cortexFunctions.loadGoogleFont( fontName );
			}
			this.$emit( 'updateCharacter', this.character );
		},

		onFontSelected( fontName ) {
			if ( typeof cortexFunctions !== 'undefined' && cortexFunctions.loadGoogleFont ) {
				cortexFunctions.loadGoogleFont( fontName );
			}
		},

		pullGoogleFont() {
			const font = this.customGoogleFontInput?.trim();
			if ( !font ) return;
			if ( typeof cortexFunctions !== 'undefined' && cortexFunctions.loadGoogleFont ) {
				cortexFunctions.loadGoogleFont( font );
			}
			this.headingFont = font;
			this.customGoogleFontInput = '';
		},

		triggerFontUpload() {
			this.$refs.fontFileInput?.click();
		},

		handleFontUpload( event ) {
			const file = event.target.files?.[0];
			if ( !file ) return;
			const fontName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, ' ').trim();
			const reader = new FileReader();
			reader.onload = (e) => {
				const base64Data = e.target.result;
				if ( typeof cortexFunctions !== 'undefined' && cortexFunctions.applyCustomFont ) {
					cortexFunctions.applyCustomFont( fontName, base64Data );
				}
				if ( !this.character.custom ) this.character.custom = {};
				if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
				if ( !this.character.custom.cortexToolkit.customFonts ) this.character.custom.cortexToolkit.customFonts = [];
				this.character.custom.cortexToolkit.customFonts.push({ name: fontName, data: base64Data });
				this.headingFont = fontName;
				this.$emit( 'updateCharacter', this.character );
			};
			reader.readAsDataURL( file );
		},

		updateDiceProp( key, val ) {
			const newCfg = { ...this.diceConfig, style: 'custom', [key]: val };
			this.diceConfig = newCfg;
		},

		applyDicePreset( preset ) {
			const newCfg = { ...this.diceConfig, ...preset, style: 'custom' };
			this.diceConfig = newCfg;
		},

		resetDiceConfig() {
			const defaultCfg = {
				style: 'default',
				backgroundType: 'solid',
				backgroundColor1: '#ffffff',
				backgroundColor2: '#f1f5f9',
				gradientAngle: 135,
				numeralColor: '#000000',
				borderColor: '#000000',
				borderWidth: 1.7,
				unfilledBackground: '#ffffff',
				unfilledNumeral: '#000000',
				unfilledBorder: '#000000'
			};
			this.diceConfig = defaultCfg;
		},

		renderDicePreview( size, isFilled ) {
			if ( typeof cortexFunctions !== 'undefined' && cortexFunctions.renderDieconSVG ) {
				return cortexFunctions.renderDieconSVG( size, isFilled, '', this.diceConfig );
			}
			return size;
		},

		updateCharacter( character ) {
			this.$emit( 'updateCharacter', character );
		},

		doNothing() {
			// This is intentional! 
		}

	}

}
