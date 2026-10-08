const Character = {

	props: {
		submode:   String,
		character: Object,
		editing:   Array,
		viewY:     Number,
	},

	data() {
		return {
			isHaloDragging: false,
			dragArcAngle: null,
			dragScaleAngle: null,
			printPageView: 'all',
			printStyle: null,
			printBlank: false,
			designerPrintPreview: false,
			showStyleGallery: false,
		};
	},

	computed: {

		name() {
			return this.character?.name ?? '';
		},

		description() {
			return this.character?.description ?? '';
		},

		player() {
			return this.character?.player ?? '';
		},

		pronouns() {
			return this.character?.pronouns ?? '';
		},

		nickname() {
			return this.character?.nickname ?? this.character?.custom?.cortexToolkit?.nickname ?? '';
		},

		hasNickname() {
			return Boolean( this.nickname || (this.isSpotlightStyle && this.character?.custom?.cortexToolkit?.hasNickname) );
		},

		plotPoints() {
			return Number( this.character?.plotPoints ) || 0;
		},

		portrait() {
			return this.character?.portrait ?? null;
		},

		effectivePortraitUrl() {
			return this.portrait?.url || '';
		},


		notes() {
			return this.character?.notes ?? '';
		},

		game() {
			return this.character?.game ?? '';
		},

		traitSets() {
			return this.character?.traitSets ?? [];
		},

		haloTraitSetIndex() {
			// 1. Check if any trait set explicitly has style === 'halo' or 'attributes', or location === 'attributes' with ring not disabled
			let idx = this.traitSets.findIndex( ts => {
				const body = ts.custom?.cortexToolkit?.style?.body;
				if ( body === 'halo' || body === 'attributes' ) return true;
				if ( ts.custom?.cortexToolkit?.attributesRing === true ) return true;
				if ( ts.custom?.cortexToolkit?.location === 'attributes' && ts.custom?.cortexToolkit?.attributesRing !== false ) return true;
				return false;
			});
			if ( idx !== -1 ) return idx;

			// 2. Backwards compatibility: default Attributes trait set to Halo when no style (or default) is specified
			idx = this.traitSets.findIndex( ts => {
				const isAttr = ts.custom?.cortexToolkit?.isAttributes ||
					ts.nounSingular?.toLowerCase() === 'attribute' ||
					ts.name?.trim().toLowerCase() === 'attributes';
				if ( !isAttr ) return false;
				if ( ts.custom?.cortexToolkit?.attributesRing === false ) return false;
				const body = ts.custom?.cortexToolkit?.style?.body;
				return !body || body === 'default' || body === 'attributes' || body === 'halo';
			});
			return idx;
		},

		// Explicit halo intent: style/body halo|attributes, the ring flag, or
		// attributes location without an opt-out. Name-based back-compat
		// matches do NOT count here.
		explicitHaloSetIndex() {
			return this.traitSets.findIndex( ts => {
				const body = ts.custom?.cortexToolkit?.style?.body;
				if ( body === 'halo' || body === 'attributes' ) return true;
				if ( ts.custom?.cortexToolkit?.attributesRing === true ) return true;
				if ( ts.custom?.cortexToolkit?.location === 'attributes' && ts.custom?.cortexToolkit?.attributesRing !== false ) return true;
				return false;
			});
		},

		hasAttributesRing() {
			if ( this.isSpotlightStyle ) return false;
			if ( this.explicitHaloSetIndex !== -1 ) return true;
			const pSize = this.portrait?.custom?.cortexToolkit?.size;
			if ( pSize === 'spotlight' || pSize === 'none' ) return false;
			return this.haloTraitSetIndex !== -1;
		},

		attributesID() {
			return this.hasAttributesRing ? this.haloTraitSetIndex : -1;
		},

		haloTraitSet() {
			return this.hasAttributesRing ? this.traitSets[this.attributesID] : null;
		},

		isHaloChallengePool() {
			const ts = this.haloTraitSet;
			return Boolean( ts?.custom?.cortexToolkit?.isChallengePool || ts?.custom?.cortexToolkit?.challengePool );
		},

		haloNounSingular() {
			const ts = this.haloTraitSet;
			return ( ts?.nounSingular && ts.nounSingular.length ) ? ts.nounSingular : 'Attribute';
		},

		scaleTrait() {
			const attrSet = this.haloTraitSet;
			if ( !attrSet || !Array.isArray( attrSet.traits ) ) return null;
			return attrSet.traits.find( t => t.name?.trim().toLowerCase() === 'scale' || t.custom?.isScale );
		},

		attributes() {
			if ( !this.hasAttributesRing ) return [];
			const all = this.haloTraitSet?.traits || [];
			return all.filter( t => !(t.name?.trim().toLowerCase() === 'scale' || t.custom?.isScale) );
		},

		scaleDieValue() {
			const st = this.scaleTrait;
			if ( st ) return Number( st.value ) || 8;
			const attrSet = this.haloTraitSet;
			if ( attrSet?.custom?.cortexToolkit?.scaleDie ) {
				return Number( attrSet.custom.cortexToolkit.scaleDie );
			}
			if ( this.character?.custom?.cortexToolkit?.scale ) {
				return Number( this.character.custom.cortexToolkit.scale );
			}
			return 0;
		},

		isAttributeEditorOpen() {
			return Boolean( this.editing && this.editing[0] === 'trait' && this.editing[1] === this.attributesID );
		},

		isOtherEditorOpen() {
			return Boolean( this.editing && this.editing.length > 0 && !this.isSelected(['scaleDie']) );
		},

		haloConfig() {
			const attrSet = this.haloTraitSet;
			const cfg = attrSet?.custom?.cortexToolkit?.haloConfig;
			const baseArcAngle = cfg?.arcAngle ?? (cfg?.arcSlide !== undefined ? cfg.arcSlide * 3 : -90);
			const baseScaleAngle = cfg?.scaleAngle ?? 0;
			return {
				arcAngle: this.dragArcAngle !== null ? this.dragArcAngle : baseArcAngle,
				arcSpread: cfg?.arcSpread ?? 100,
				arcDistance: cfg?.arcDistance ?? 0,
				scaleAngle: this.dragScaleAngle !== null ? this.dragScaleAngle : baseScaleAngle,
				scaleDistance: cfg?.scaleDistance ?? 0,
				scaleDieX: cfg?.scaleDieX ?? 0,
				scaleDieY: cfg?.scaleDieY ?? 0
			};
		},

		pageCount() {
			if ( this.character?.custom?.cortexToolkit?.pageCount ) {
				return Math.max( 1, parseInt(this.character.custom.cortexToolkit.pageCount) );
			}
			let maxPage = 1;
			for ( let ts of (this.character?.traitSets || []) ) {
				if ( ts.custom?.cortexToolkit?.page && ts.custom.cortexToolkit.page > maxPage ) {
					maxPage = ts.custom.cortexToolkit.page;
				}
			}
			return maxPage;
		},

		sheetStyle() {
			if ( this.submode === 'print' && this.printStyle ) {
				return this.printStyle;
			}
			const explicit = this.character?.custom?.cortexToolkit?.sheetStyle;
			if ( explicit ) return explicit;

			if ( this.character?.custom?.cortexToolkit?.style?.hasAttributes === false ) {
				return 'spotlight';
			}
			return 'classic';
		},

		isSpotlightStyle() {
			return this.sheetStyle === 'spotlight';
		},

		isSpotlightPrintStyle() {
			return (this.submode === 'print' || this.designerPrintPreview) && this.isSpotlightStyle;
		},

		pageJustification() {
			return this.character?.custom?.cortexToolkit?.pageJustification || 'top-base';
		},

		nameEditorInitialTab() {
			if ( this.isSelected(['page']) ) return 'page';
			if ( this.isSelected(['theme']) ) return 'theme';
			if ( this.isSelected(['dice']) ) return 'dice';
			return 'sheet';
		},

		columnCount() {
			return Number( this.character?.custom?.cortexToolkit?.columns ) === 3 ? 3 : 2;
		},

		hasHeaderPortrait() {
			if ( !this.isSpotlightStyle ) return false;
			const size = this.portrait?.custom?.cortexToolkit?.size;
			if ( size === 'none' ) return false;
			const loc = this.portrait?.custom?.cortexToolkit?.location;
			if ( loc && loc !== 'header' ) return false;
			return true;
		},

		descriptionText: {
			get() {
				return this.character?.description ?? '';
			},
			set( val ) {
				if ( !this.character ) return;
				this.character.description = val;
				this.updateCharacter( this.character );
			}
		},

		printPages() {
			if ( this.submode === 'print' && this.printPageView !== 'all' ) {
				return [ Number(this.printPageView) ];
			}
			let pages = [];
			for ( let i = 1; i <= this.pageCount; i++ ) {
				pages.push( i );
			}
			return pages;
		},

		hasAnyWatermark() {
			const wm = this.character?.custom?.cortexToolkit?.watermark;
			return Boolean( wm?.enabled && wm?.url );
		},

		columnAlignmentMode() {
			return this.character?.custom?.cortexToolkit?.columnAlignment || 'top-base';
		},

		characterSheetStyle() {
			const ctk = this.character?.custom?.cortexToolkit || {};
			const offsets = ctk.columnOffsets || {};
			const style = {};
			
			if ( ctk.columnAlignment === 'custom' ) {
				style['--column-left-offset'] = (Number(offsets.left) || 0) + 'px';
				style['--column-center-offset'] = (Number(offsets.center) || 0) + 'px';
				style['--column-right-offset'] = (Number(offsets.right) || 0) + 'px';
			} else {
				// Strict top base alignment by default (0px offset)
				style['--column-left-offset'] = '0px';
				style['--column-center-offset'] = '0px';
				style['--column-right-offset'] = '0px';
			}

			if ( ctk.accentColor ) {
				style['--color-interactive'] = ctk.accentColor;
			}
			if ( ctk.primaryColor ) {
				style['--color-primary'] = ctk.primaryColor;
			}
			if ( ctk.secondaryColor ) {
				style['--color-secondary'] = ctk.secondaryColor;
			}

			if ( ctk.theme?.fonts?.heading ) {
				style['--font-heading'] = `'${ctk.theme.fonts.heading}', sans-serif`;
			}
			if ( ctk.theme?.fonts?.primary ) {
				style['--font-primary'] = `'${ctk.theme.fonts.primary}', sans-serif`;
			}
			if ( ctk.theme?.fonts?.secondary ) {
				style['--font-secondary'] = `'${ctk.theme.fonts.secondary}', sans-serif`;
			}

			return style;
		}

	},

	/*html*/
	template: `<section :class="['character-sheet', 'submode-' + submode, { 'spotlight-print-style': isSpotlightPrintStyle, 'spotlight-style': isSpotlightStyle, 'print-blank-mode': printBlank, 'has-watermark': hasAnyWatermark, 'designer-print-preview': designerPrintPreview }]" :style="characterSheetStyle">
	
		<!-- PRINT TOOLBAR -->
		<div class="print-toolbar" v-if="submode === 'print'">
			<div class="toolbar-group">
				<button type="button" class="btn-print-action primary" @click.stop="print">
					<i class="fas fa-print"></i> Print Sheet
				</button>
				<button type="button" class="btn-print-action secondary" @click.stop="exportCharacter">
					<i class="fas fa-download"></i> Export JSON
				</button>
			</div>

			<div class="toolbar-group">
				<div class="toolbar-segmented">
					<button type="button" :class="{ active: (printStyle || sheetStyle) === 'spotlight' }" @click.stop="printStyle = 'spotlight'">
						<i class="fas fa-id-card"></i> Spotlight Style
					</button>
					<button type="button" :class="{ active: (printStyle || sheetStyle) === 'classic' }" @click.stop="printStyle = 'classic'">
						<i class="fas fa-file"></i> Classic Style
					</button>
				</div>
 
				<label class="toolbar-checkbox">
					<input type="checkbox" v-model="printBlank">
					<span><i class="fas fa-pencil-alt"></i> Blank Sheet (For Pencil)</span>
				</label>
			</div>

			<div class="toolbar-group" v-if="pageCount > 1">
				<div class="toolbar-segmented">
					<button type="button" :class="{ active: printPageView === 'all' }" @click.stop="printPageView = 'all'">
						All Pages ({{ pageCount }})
					</button>
					<button type="button" :class="{ active: printPageView === 1 }" @click.stop="printPageView = 1">
						Page 1
					</button>
					<button type="button" :class="{ active: printPageView === 2 }" @click.stop="printPageView = 2">
						Page 2
					</button>
				</div>
			</div>
		</div>

		<!-- EDIT / THEME TOOLBAR -->
		<div class="edit-toolbar" v-if="submode === 'edit'">
			<div class="toolbar-group">
				<button type="button" class="btn-toolbar-theme" :class="{ active: isSelected(['name']) }" @click.stop="openSheetEditor" title="Sheet Details &amp; Watermark">
					<i class="fas fa-id-card"></i> Sheet
				</button>
				<button type="button" class="btn-toolbar-theme" :class="{ active: isSelected(['page']) }" @click.stop="openPageEditor" title="Page Justification &amp; Layout">
					<i class="fas fa-columns"></i> Page
				</button>
				<button type="button" class="btn-toolbar-theme" :class="{ active: isSelected(['theme']) }" @click.stop="openThemeEditor" title="Typography &amp; Theme Colors">
					<i class="fas fa-font"></i> Fonts &amp; Colors
				</button>
				<button type="button" class="btn-toolbar-theme" :class="{ active: isSelected(['dice']) }" @click.stop="openDiceEditor" title="Visual Dice Appearance Editor">
					<i class="fas fa-dice-d20"></i> Dice
				</button>
				<button type="button" class="btn-toolbar-theme" v-if="!designerPrintPreview" @click.stop="showStyleGallery = true" title="Browse trait set styles and add one to the sheet">
					<i class="fas fa-plus"></i> Add Set
				</button>
			</div>

			<div class="toolbar-group">
				<!-- DESIGNER PRINT VIEW TOGGLE -->
				<button
					type="button"
					class="btn-toolbar-theme"
					:class="{ active: designerPrintPreview }"
					@click.stop="toggleDesignerPrintPreview"
					title="Toggle Live Print View Preview in Designer"
				>
					<i class="fas fa-eye"></i> {{ designerPrintPreview ? 'Exit Print View' : 'Print View' }}
				</button>
			</div>
		</div>

		<!-- DESIGNER PRINT VIEW BANNER -->
		<div class="designer-print-banner" v-if="designerPrintPreview && submode === 'edit'">
			<span><i class="fas fa-eye"></i> Designer Print Preview Active — Showing exact print version layout &amp; reserved slots</span>
		</div>

		<div class="pages">

			<!-- PAGE (SUPPORTS MULTI-PAGE) -->
			<div
				v-for="pageIndex in printPages"
				:key="'page-' + pageIndex"
				:class="['page', 'page-' + pageIndex, 'page-justification-' + pageJustification]"
			>
				<div
					v-if="hasWatermark(pageIndex)"
					class="page-watermark"
					:style="getWatermarkStyle(pageIndex)"
				></div>

				<div class="page-inner">

					<header class="page-header" v-if="pageIndex === 1">

						<!-- SPOTLIGHT HEADER (EDIT, PLAY, PRINT) -->
						<div
							v-if="isSpotlightStyle"
							class="page-header-inner spotlight-header-card"
							:class="{ 'has-portrait': hasHeaderPortrait, 'selected': isSelected(['name']) }"
						>
							<!-- LEFT BOX: NAME | PRONOUNS (TRAIT SET STYLE) -->
							<div class="spotlight-header-meta-box trait-set-box" @click.stop="selectElement(['name'])">
								<div class="spotlight-meta-name-cell">
									<div class="spotlight-cell-header">
										<span class="spotlight-cell-label">NAME</span>
										<span class="spotlight-cell-sublabel" v-if="player && !printBlank">PLAYER: {{ player }}</span>
									</div>
									<div class="spotlight-cell-content name-content" v-if="!printBlank && name" v-html="renderNameHtml(name)"></div>
									<div class="spotlight-blank-line" v-else-if="printBlank"></div>
									<div class="spotlight-cell-content name-content placeholder-dim" v-else-if="submode === 'edit'">Click to set name...</div>
									<div class="spotlight-blank-line" v-else></div>
								</div>

								<div class="spotlight-meta-divider"></div>

								<div class="spotlight-meta-nickname-cell" v-if="hasNickname">
									<span class="spotlight-cell-label">NICKNAME</span>
									<span class="spotlight-nickname-val" v-if="!printBlank && nickname" v-html="renderText(nickname)"></span>
									<span class="spotlight-blank-line" v-else-if="printBlank"></span>
									<span class="spotlight-nickname-val placeholder-dim" v-else-if="submode === 'edit'">Click to set...</span>
									<span class="spotlight-blank-line" v-else></span>
								</div>

								<div class="spotlight-meta-divider" v-if="hasNickname"></div>

								<div class="spotlight-meta-pronoun-cell">
									<span class="spotlight-cell-label">PRONOUNS</span>
									<span class="spotlight-pronoun-val" v-if="!printBlank && pronouns" v-html="renderText(pronouns)"></span>
									<span class="spotlight-blank-line" v-else-if="printBlank"></span>
									<span class="spotlight-pronoun-val placeholder-dim" v-else-if="submode === 'edit'">Click to set...</span>
									<span class="spotlight-blank-line" v-else></span>
								</div>
							</div>

							<!-- CENTER BOX: DESCRIPTION (TRAIT SET STYLE) -->
							<div class="spotlight-header-desc-box trait-set-box" @click.stop="selectElement(['name'])">
								<div class="spotlight-cell-header">
									<span class="spotlight-cell-label">DESCRIPTION</span>
									<button
										v-if="!hasHeaderPortrait && submode === 'edit' && !designerPrintPreview"
										type="button"
										class="spotlight-add-portrait-link"
										@click.stop="addHeaderPortrait"
										title="Add Portrait to Header"
									>
										<i class="fas fa-plus"></i> Add Portrait
									</button>
								</div>
								<textarea
									v-if="submode === 'edit' && !designerPrintPreview"
									class="spotlight-desc-textarea"
									v-model="descriptionText"
									placeholder="Character description..."
									@click.stop
								></textarea>
								<div class="desc-content" v-else-if="!printBlank && description" v-html="renderText(description)"></div>
								<div class="desc-blank-area" v-else>
									<div class="desc-blank-line"></div>
									<div class="desc-blank-line"></div>
									<div class="desc-blank-line"></div>
								</div>
							</div>

							<!-- RIGHT BOX: PORTRAIT (25% OF HEADER WIDTH, HALF SIZE, REMOVABLE) -->
							<div
								v-if="hasHeaderPortrait"
								class="spotlight-header-portrait-box"
								:class="{ 'selected': isSelected(['portrait']), 'has-image': Boolean(effectivePortraitUrl) }"
								@click.stop="selectElement(['portrait'])"
								title="Click to edit portrait"
							>
								<img
									v-if="effectivePortraitUrl"
									class="portrait-small-image"
									:class="'portrait-alignment-' + (portrait?.custom?.cortexToolkit?.alignment || 'center')"
									:src="safeImageUrl(effectivePortraitUrl)"
									alt="Portrait / Logo"
								/>
								<div v-else class="portrait-small-placeholder" @click.stop="(submode === 'edit' && !designerPrintPreview) ? selectElement(['name']) : null" title="Click to edit title or upload logo">
									<span class="spotlight-game-tag" v-if="game">{{ game }}</span>
									<span class="spotlight-logo-icon" v-else><i class="fas fa-id-badge"></i></span>
									<span class="spotlight-add-hint" v-if="submode === 'edit' && !designerPrintPreview">Click to edit title</span>
								</div>

								<button
									v-if="submode === 'edit' && !designerPrintPreview"
									type="button"
									class="btn-remove-header-portrait"
									@click.stop="removeHeaderPortrait"
									title="Remove portrait"
								>
									<i class="fas fa-trash-alt"></i>
								</button>
							</div>
						</div>

						<!-- CLASSIC HEADER -->
						<div
							v-else
							:class="{'page-header-inner': true, 'selected': isSelected(['name'])}"
							@click.stop="selectElement([ 'name' ])"
						>
							<div>

								<!-- CHARACTER NAME -->
								<div class="title-container">

									<div class="character-game-title" v-if="game" v-html="renderText(game)"></div>

									<div class="title">{{ name }}</div>

									<div class="title-decoration">
										<svg height="4" width="100%"><line x1="0" y1="0" x2="10000" y2="0" style="stroke:#C50852;stroke-width:4pt"/></svg>
									</div>

								</div>

								<!-- CHARACTER DESCRIPTION -->
								<div class="character-meta">
						
									<div class="character-player" v-if="player && player.length">
										<span class="meta-label">Player:</span> <span>{{ player }}</span>
									</div>

									<div class="character-pronouns" v-if="pronouns.length">
										<span v-html="renderText(pronouns)"></span>
									</div>

									<div class="character-description" v-if="description.length">
										<span v-html="renderText(description)"></span>
									</div>

									<div class="character-pp-badge" v-if="submode === 'play'">
										<span class="pp-badge-label">PP</span>
										<button type="button" class="btn-pp-step" @click.stop="adjustPlotPoints(-1)" :disabled="plotPoints <= 0" title="Spend Plot Point">-</button>
										<span class="pp-count">{{ plotPoints }}</span>
										<button type="button" class="btn-pp-step" @click.stop="adjustPlotPoints(1)" title="Gain Plot Point">+</button>
									</div>

									<div class="character-notes-summary" v-if="notes && notes.length">
										<div class="character-notes-body" v-html="renderNotesText(notes)"></div>
									</div>
			
								</div>

							</div>
						</div>

						<transition name="editor" appear>
							<name-editor
								:character="character"
								:open="isSelected(['name']) || isSelected(['theme']) || isSelected(['page']) || isSelected(['dice'])"
								v-show="submode === 'edit' && (isSelected(['name']) || isSelected(['theme']) || isSelected(['page']) || isSelected(['dice']))"
								:initialTab="nameEditorInitialTab"
								@selectElement="selectElement"
								@updateCharacter="updateCharacter"
								@saveSheetTemplate="$emit('saveSheetTemplate')"
								@exportSheetTemplate="$emit('exportSheetTemplate')"
							></name-editor>
						</transition>

						<transition name="editor" appear>
							<portrait-editor
								v-if="isSpotlightStyle"
								:character="character"
								:open="isSelected(['portrait'])"
								v-show="submode === 'edit' && isSelected(['portrait'])"
								@selectElement="selectElement"
								@updateCharacter="updateCharacter"
							></portrait-editor>
						</transition>

					</header>

					<!-- PAGE 2+ HEADER -->
					<header class="page-header page-2-header" v-if="pageIndex > 1">
						<div class="page-2-header-inner">
							<div class="page-2-title">{{ name }}</div>
							<div class="page-2-badge">{{ game ? game + ' — ' : '' }}Page {{ pageIndex }} of {{ pageCount }}</div>
						</div>
					</header>

					<!-- SPOTLIGHT MODE LAYOUT (INDEPENDENT COLUMN STACKING & FULL-WIDTH SECTIONS) -->
					<div v-if="isSpotlightStyle" class="spotlight-layout">
						<template v-for="(section, secIdx) in getSpotlightSections(pageIndex)" :key="secIdx">
							<div
								v-if="section.type === 'full-width'"
								:class="['columns', 'spotlight-columns', 'spotlight-full-width']"
							>
								<div :class="['spotlight-column', 'spotlight-full-column']">
									<template v-for="{ traitSet, index: s } in section.itemsByColumn.full" :key="s">
										<trait-set-block :character="character" :traitSetID="s" :submode="submode" :editing="editing" :viewY="viewY" :printBlank="printBlank" :designerPrintPreview="designerPrintPreview" :printStyle="printStyle" @selectElement="selectElement" @updateCharacter="updateCharacter" @removeTrait="removeTrait" @removeTraitSet="removeTraitSet" @addTrait="addTrait" 											@addDieToRoller="$emit('addDieToRoller', $event)"></trait-set-block>
						</template>
								</div>
							</div>
							<div
								v-else
								:class="['columns', 'spotlight-columns', 'spotlight-grid', 'columns-' + section.trackCount]"
								:style="getSpotlightGridStyle(section)"
							>
								<trait-set-block
									v-for="cell in getSpotlightGridCells(section)"
									:key="cell.s"
									:character="character" :traitSetID="cell.s" :submode="submode" :editing="editing" :viewY="viewY" :printBlank="printBlank" :designerPrintPreview="designerPrintPreview" :printStyle="printStyle" :style="cell.style" @selectElement="selectElement" @updateCharacter="updateCharacter" @removeTrait="removeTrait" @removeTraitSet="removeTraitSet" @addTrait="addTrait" @addDieToRoller="$emit('addDieToRoller', $event)"
								></trait-set-block>
							</div>
						</template>

						<!-- BUTTON: ADD TRAIT SET IN SPOTLIGHT MODE -->
						<div class="spotlight-add-set-bar" v-if="submode === 'edit' && !designerPrintPreview">
							<button type="button" class="btn-spotlight-add" @click.stop="addTraitSet('left', pageIndex, 1)">
								<i class="fas fa-plus"></i> Col 1 Set
							</button>
							<button type="button" class="btn-spotlight-add" v-if="columnCount === 3" @click.stop="addTraitSet('center', pageIndex, 1)">
								<i class="fas fa-plus"></i> Col 2 Set
							</button>
							<button type="button" class="btn-spotlight-add" @click.stop="addTraitSet('right', pageIndex, 1)">
								<i class="fas fa-plus"></i> {{ columnCount === 3 ? 'Col 3' : 'Col 2' }} Set
							</button>
							<button type="button" class="btn-spotlight-add span-full-btn" @click.stop="addTraitSet('left', pageIndex, 'full')">
								<i class="fas fa-arrows-alt-h"></i> Full Width Set
							</button>
						</div>
					</div>

					<!-- COLUMNS: CLASSIC MODE -->
					<div class="columns" v-else>

						<div v-for="pageLocation in ['left', 'right']" :class="'column-' + pageLocation">

							<!-- SMALL PORTRAIT (COLUMN PLACEMENT) -->
							<div
								class="portrait-small-card"
								:class="{ 'selected': isSelected(['portrait']) }"
								v-if="shouldShowColumnSmallPortrait(pageLocation, pageIndex)"
								@click.stop="selectElement([ 'portrait' ])"
								title="Click to edit portrait"
							>
								<img
									v-if="effectivePortraitUrl"
									class="portrait-small-image"
									:class="'portrait-alignment-' + (portrait?.custom?.cortexToolkit?.alignment || 'top-center')"
									:src="safeImageUrl(effectivePortraitUrl)"
									alt="Portrait"
								/>
								<div v-else class="portrait-small-placeholder">
									<i class="fas fa-user"></i>
								</div>
							</div>

							<!-- CLASSIC PORTRAIT & HALO (PAGE 1 RIGHT ONLY) -->
							<div :class="{ 'portrait': true, 'portrait-standalone': !hasAttributesRing }" v-if="pageIndex === 1 && pageLocation === 'right' && shouldShowClassicPortrait()">

								<div :class="{ 'portrait-inner': true, 'selected': isSelected(['portrait']) }"
									@click.stop="selectElement([ 'portrait' ])"
								>
									<div :class="'portrait-circle portrait-alignment-' + (portrait?.custom?.cortexToolkit?.alignment || 'top-center')" width="100%" height="100%" :style="'background-image: url(' + safeImageUrl(effectivePortraitUrl) + ');'">
										<div class="portrait-placeholder" v-if="!effectivePortraitUrl"><i class="fas fa-user"></i></div>
									</div>
								</div>

								<!-- ATTRIBUTES GRID (HALO OVERLAY) -->
								<div class="attributes-grid" v-if="hasAttributesRing && attributesID > -1">

									<div class="attributes-items"
										:class="{ 'has-open-editor': isAttributeEditorOpen }"
									>
										<div v-for="( attribute, a ) in attributes"
											class="attribute"
											:class="{ 'has-open-editor': isSelected(['trait', attributesID, a]), 'is-draggable': submode === 'edit' }"
											:style="getAttributeStyle( a )"
											@mousedown="startHaloDrag($event, 'traits')"
											@touchstart="startHaloDrag($event, 'traits')"
										>

											<div class="attribute-inner"
												:class="{ 'attribute-inner': true, 'selected': isSelected(['trait', attributesID, a]) }"
												@click.stop="handleAttributeClick( attributesID, a, attribute )"
												:title="submode === 'play' ? (isHaloChallengePool ? 'Challenge Pool: Click to add all dice to roller' : 'Click to add d' + attribute.value + ' to roller') : ''"
											>

												<span class="c"
													:class="['die-' + (attribute.value || 8), { 'die-empty': !attribute.value }]"
													v-html="renderDieValue(attribute.value)"
													:title="!attribute.value && submode === 'edit' ? 'Unrated — click to set a die rating' : ''"
												></span>

												<div class="attribute-name"
													:style="getAttributeNameStyle( a )"
												>{{ attribute.name }}</div>

											</div>

											<transition name="editor" appear>
												<trait-editor
													:character="character"
													:open="isSelected(['trait', attributesID, a])"
													v-show="submode === 'edit' && isSelected(['trait', attributesID, a])"
													:traitSetID="attributesID"
													:traitID="a"
													:viewY="viewY"
													@selectElement="selectElement"
													@updateCharacter="updateCharacter"
													@removeTrait="removeTrait"
												></trait-editor>
											</transition>

										</div>

									</div>

									<!-- SCALE DIE -->
									<div
										class="scale-die"
										:class="{ 'under-editor': isOtherEditorOpen, 'is-draggable': submode === 'edit' }"
										v-if="scaleDieValue > 0"
										:style="getScaleDieStyle()"
										@mousedown="startHaloDrag($event, 'scale')"
										@touchstart="startHaloDrag($event, 'scale')"
									>
										<div
											class="scale-die-inner"
											:class="{ 'selected': isSelected(['scaleDie']) }"
											@click.stop="handleScaleDieClick()"
											:title="submode === 'play' ? 'Click to add d' + scaleDieValue + ' Scale die to pool (Keep 3)' : 'Click to edit Scale die'"
										>
											<span class="c" :class="'die-' + (scaleDieValue || 8)" v-html="renderDieValue(scaleDieValue)"></span>
											<div class="scale-name">SCALE</div>
										</div>

										<transition name="editor" appear>
											<aside
												class="editor scale-die-editor open"
												v-show="submode === 'edit' && isSelected(['scaleDie'])"
												@click.stop
											>
												<div class="editor-arrow"></div>
												<div class="editor-controls">
													<button type="button" @click.stop="selectElement([])"><i class="fas fa-times"></i></button>
													<button type="button" class="editor-delete" @click.stop="setScaleDieValue(0); selectElement([])" title="Remove Scale Die"><i class="fas fa-trash"></i></button>
												</div>
												<div class="editor-fields">
													<div class="editor-field">
														<label>Scale Die Rating</label>
														<div class="scale-stepper">
															<button
																v-for="s in [4, 6, 8, 10, 12]"
																:key="'scale-' + s"
																type="button"
																class="btn-step"
																:class="{ active: scaleDieValue === s }"
																@click.stop="setScaleDieValue(s)"
															>
																<span class="c">{{ renderDieValue(s) }}</span>
																<span class="step-label">d{{ s }}</span>
															</button>
														</div>
													</div>
												</div>
											</aside>
										</transition>
									</div>

								</div>

								<transition name="editor" appear>
									<portrait-editor
										:character="character"
										:open="isSelected(['portrait'])"
										v-show="submode === 'edit' && isSelected(['portrait'])"
										@selectElement="selectElement"
										@updateCharacter="updateCharacter"
									></portrait-editor>
								</transition>
	
							</div>

							<!-- ATTRIBUTES -->
							<div :class="{ 'attributes': true, 'vertical': attributes.length > 5 }" v-if="pageLocation === 'right' && hasAttributesRing && attributesID > -1">

								<!-- BUTTON: ADD ATTRIBUTE / SCALE DIE (EDIT) OR CHALLENGE POOL (PLAY) -->
								<transition appear>
								<div class="preview-button-container"
									v-if="pageLocation === 'right' && !designerPrintPreview"
								>
									<div class="preview-button-container-inner" v-show="submode === 'edit' && !designerPrintPreview">
										<div class="preview-button"
											@click.stop="addTrait( attributesID )"
										>
											<span><i class="fas fa-plus"></i> {{ haloNounSingular }}</span>
										</div>
										<div class="preview-button"
											v-if="!scaleDieValue"
											@click.stop="setScaleDieValue(8); selectElement(['scaleDie'])"
										>
											<span><i class="fas fa-plus"></i> Scale Die</span>
										</div>
										<div class="preview-button"
											@click.stop="selectElement(['traitSet', attributesID])"
										>
											<span><i class="fas fa-cog"></i> Settings</span>
										</div>
									</div>
									<div class="preview-button-container-inner" v-if="submode === 'play' && isHaloChallengePool && attributes.length > 0">
										<div class="preview-button"
											@click.stop="handleAttributeClick( attributesID, 0, attributes[0] )"
											title="Add all Challenge Pool dice to roller"
										>
											<span><i class="fas fa-dice-d20"></i> Roll Challenge Pool ({{ attributes.length }} dice)</span>
										</div>
									</div>
								</div>
								</transition>

								<transition name="editor" appear>
									<trait-set-editor
										:character="character"
										:open="isSelected(['traitSet', attributesID])"
										v-show="submode === 'edit' && isSelected(['traitSet', attributesID])"
										:traitSetID="attributesID"
										:viewY="viewY"
										@selectElement="selectElement"
										@updateCharacter="updateCharacter"
										@removeTraitSet="removeTraitSet"
									></trait-set-editor>
								</transition>

							</div>
								

							<template v-for="(traitSet, s) in traitSets" :key="s">
								<trait-set-block
									v-if="s !== attributesID && ((traitSet.custom?.cortexToolkit?.page || 1) === pageIndex) && getTraitSetColumn(traitSet) === pageLocation && !isFullWidthClassic(traitSet)"
									:character="character" :traitSetID="s" :submode="submode" :editing="editing" :viewY="viewY" :printBlank="printBlank" :designerPrintPreview="designerPrintPreview" :printStyle="printStyle" @selectElement="selectElement" @updateCharacter="updateCharacter" @removeTrait="removeTrait" @removeTraitSet="removeTraitSet" @addTrait="addTrait" @addDieToRoller="$emit('addDieToRoller', $event)"
								></trait-set-block>
							</template>

							<!-- BUTTON: ADD TRAIT SET -->
							<transition appear>
							<div class="preview-button-container"
								v-show="submode === 'edit' && !designerPrintPreview"
							>
								<div class="preview-button-container-inner">
									<div class="preview-button"
										@click.stop="addTraitSet( pageLocation, pageIndex )"
									>
										<span><i class="fas fa-plus"></i> Trait Set{{ pageCount > 1 ? ' (P' + pageIndex + ')' : '' }}</span>
									</div>
								</div>
							</div>
							</transition>
							
						</div>

					</div> <!-- .columns -->

					<!-- CLASSIC FULL-WIDTH SETS -->
					<div class="classic-full-band" v-if="!isSpotlightStyle && hasClassicFullSets(pageIndex)">
						<template v-for="(traitSet, s) in traitSets" :key="'full-' + s">
							<trait-set-block
								v-if="s !== attributesID && ((traitSet.custom?.cortexToolkit?.page || 1) === pageIndex) && isFullWidthClassic(traitSet)"
								:character="character" :traitSetID="s" :submode="submode" :editing="editing" :viewY="viewY" :printBlank="printBlank" :designerPrintPreview="designerPrintPreview" :printStyle="printStyle" @selectElement="selectElement" @updateCharacter="updateCharacter" @removeTrait="removeTrait" @removeTraitSet="removeTraitSet" @addTrait="addTrait" @addDieToRoller="$emit('addDieToRoller', $event)"
							></trait-set-block>
						</template>
					</div>

					<!-- FOOTER (PRINT SUBMODE) -->
					<footer class="spotlight-page-footer" v-if="submode === 'print'">
						<span class="pencil-note">For best results, use pencil.</span>
						<span class="page-num" v-if="pageCount > 1">Page {{ pageIndex }} of {{ pageCount }}</span>
					</footer>

				</div> <!-- .page-inner -->
			</div> <!-- .page -->
		</div> <!-- .pages -->

		<style-gallery
			v-if="submode === 'edit'"
			:open="showStyleGallery"
			:columnCount="columnCount"
			:pageCount="pageCount"
			:allowCenter="isSpotlightStyle && columnCount === 3"
			@close="showStyleGallery = false"
			@addGallerySet="addGallerySet"
		></style-gallery>
	</section>`,

	methods: {

		// PRESENTATION

		isSelected( selector ) {
			return cortexFunctions.arraysMatch( this.editing, selector );
		},

		openThemeEditor() {
			this.selectElement(['theme']);
		},

		openNameEditor( tab = 'sheet' ) {
			this.selectElement(['name']);
		},

		openSheetEditor() {
			this.selectElement(['name']);
		},

		openPageEditor() {
			this.selectElement(['page']);
		},

		openDiceEditor() {
			this.selectElement(['dice']);
		},

		toggleDesignerPrintPreview() {
			this.designerPrintPreview = !this.designerPrintPreview;
		},

		applyFonts() {
			const ctk = this.character?.custom?.cortexToolkit;
			if ( !ctk || typeof cortexFunctions === 'undefined' ) return;
			if ( ctk.theme?.fonts ) {
				if ( ctk.theme.fonts.heading && cortexFunctions.loadGoogleFont ) cortexFunctions.loadGoogleFont( ctk.theme.fonts.heading );
				if ( ctk.theme.fonts.primary && cortexFunctions.loadGoogleFont ) cortexFunctions.loadGoogleFont( ctk.theme.fonts.primary );
				if ( ctk.theme.fonts.secondary && cortexFunctions.loadGoogleFont ) cortexFunctions.loadGoogleFont( ctk.theme.fonts.secondary );
			}
			if ( Array.isArray(ctk.customFonts) && cortexFunctions.applyCustomFont ) {
				ctk.customFonts.forEach( f => {
					if ( f.name && f.data ) {
						cortexFunctions.applyCustomFont( f.name, f.data );
					}
				});
			}
			if ( ctk.diceConfig && typeof window !== 'undefined' ) {
				window.__cortexActiveDiceConfig = ctk.diceConfig;
			}
		},

		setSheetStyle( style ) {
			if ( !this.character ) return;
			if ( !this.character.custom ) this.character.custom = {};
			if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
			this.character.custom.cortexToolkit.sheetStyle = style;
			this.updateCharacter( this.character );
		},

		setColumnCount( count ) {
			if ( !this.character ) return;
			if ( !this.character.custom ) this.character.custom = {};
			if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
			this.character.custom.cortexToolkit.columns = Number(count) || 2;
			this.updateCharacter( this.character );
		},

		setColumnAlignmentMode( mode ) {
			if ( !this.character ) return;
			if ( !this.character.custom ) this.character.custom = {};
			if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
			this.character.custom.cortexToolkit.columnAlignment = mode;

			if ( mode === 'top-base' ) {
				this.character.custom.cortexToolkit.columnOffsets = { left: 0, center: 0, right: 0 };
				const topSet = (this.character.traitSets || []).find( ts => (ts.custom?.cortexToolkit?.page || 1) === 1 );
				if ( topSet && topSet.custom?.cortexToolkit?.colSpan > 1 ) {
					topSet.custom.cortexToolkit.colSpan = 1;
				}
			} else if ( mode === 'full-width' ) {
				this.character.custom.cortexToolkit.columnOffsets = { left: 0, center: 0, right: 0 };
				const topSet = (this.character.traitSets || []).find( ts => (ts.custom?.cortexToolkit?.page || 1) === 1 );
				if ( topSet ) {
					if ( !topSet.custom ) topSet.custom = {};
					if ( !topSet.custom.cortexToolkit ) topSet.custom.cortexToolkit = {};
					topSet.custom.cortexToolkit.colSpan = this.columnCount;
				}
			}
			this.updateCharacter( this.character );
		},

		renderText( text ) {
			return cortexFunctions.renderText( text );
		},

		renderDieValue( value ) {
			return cortexFunctions.getDieDisplayValue( value );
		},






		getTraitSetColumn( traitSet ) {
			// Classic flow has left/right tracks only; 'center' (and anything
			// unexpected) folds left so no set ever vanishes. Full-width sets
			// are handled separately by isFullWidthClassic.
			if ( traitSet?.custom?.cortexToolkit?.location === 'right' ) {
				return 'right';
			}
			return 'left';
		},

		isFullWidthClassic( traitSet ) {
			const ctk = traitSet?.custom?.cortexToolkit;
			const span = ctk?.colSpan ?? ctk?.columnSpan;
			return span === 'full' || Number( span ) >= 2;
		},

		hasClassicFullSets( pageIndex ) {
			return ( this.traitSets || [] ).some( ( traitSet, s ) =>
				s !== this.attributesID &&
				( ( traitSet.custom?.cortexToolkit?.page || 1 ) === pageIndex ) &&
				this.isFullWidthClassic( traitSet )
			);
		},

		// Classic-mode flow placement. Unlike the old per-column loop, sets
		// render in array order: full-width sets span the whole row, every
		// other set takes its column track ('center' folds into left —
		// classic has no center track and previously hid those sets).
		shouldShowClassicPortrait() {
			if ( this.isSpotlightStyle ) return false;
			// An explicitly halo-styled set needs its portrait circle even
			// when the portrait itself is sized for spotlight (or removed).
			if ( this.explicitHaloSetIndex !== -1 ) return true;
			const s = this.portrait?.custom?.cortexToolkit?.size;
			if ( s === 'none' || s === 'spotlight' ) return false;
			return true;
		},

		shouldShowColumnSmallPortrait( pageLocation, pageIndex ) {
			if ( this.isSpotlightStyle ) return false;
			if ( pageIndex !== 1 ) return false;
			const s = this.portrait?.custom?.cortexToolkit?.size;
			const loc = this.portrait?.custom?.cortexToolkit?.location;
			if ( s === 'spotlight' && loc === pageLocation ) return true;
			return false;
		},

		getTraitSetClasses( traitSet ) {

			let classes = {
				'trait-set': true
			}

			const bodyStyle = traitSet?.custom?.cortexToolkit?.style?.body || 'default';
			classes[ 'trait-set-style-' + bodyStyle ] = true;

			// Optional branched-Skills connectors.
			if ( bodyStyle === 'skills-specialties' && traitSet?.custom?.cortexToolkit?.branchArrows === false ) {
				classes[ 'hide-branch-arrows' ] = true;
			}

			if ( this.isSpotlightStyle ) {
				const colSpan = Number(traitSet?.custom?.cortexToolkit?.colSpan ?? traitSet?.custom?.cortexToolkit?.columnSpan) || 1;
				if ( colSpan >= this.columnCount || traitSet?.custom?.cortexToolkit?.colSpan === 'full' || traitSet?.custom?.cortexToolkit?.columnSpan === 'full' ) {
					classes['span-full'] = true;
					classes['span-' + this.columnCount] = true;
				} else if ( colSpan === 2 ) {
					classes['span-2'] = true;
				} else {
					classes['span-1'] = true;
				}
			}

			if ( traitSet?.custom?.cortexToolkit?.features?.description ) {
				classes[ 'trait-set-has-feature-description' ] = true;
			}

			if ( traitSet?.custom?.cortexToolkit?.features?.sfx ) {
				classes[ 'trait-set-has-feature-sfx' ] = true;
			}

			if ( traitSet?.custom?.cortexToolkit?.features?.subtraits ) {
				classes[ 'trait-set-has-feature-subtraits' ] = true;
			}

			return classes;

		},

		// Track count for a page: an optional per-page override
		// (columnsPage2) lets page 2 run a different grid than page 1.
		columnsForPage( pageIndex ) {
			if ( Number( pageIndex ) === 2 ) {
				const override = Number( this.character?.custom?.cortexToolkit?.columnsPage2 );
				if ( override === 2 || override === 3 ) return override;
			}
			return this.columnCount;
		},

		getSpotlightSections( pageIndex ) {
			const maxCols = this.columnsForPage( pageIndex );
			const pageSets = [];
			(this.traitSets || []).forEach( ( traitSet, s ) => {
				const page = traitSet.custom?.cortexToolkit?.page || 1;
				if ( page === pageIndex ) {
					pageSets.push({ traitSet, index: s });
				}
			});

			const newSection = () => ({
				type: 'columns',
				trackCount: maxCols,
				ordered: [],
				itemsByColumn: maxCols === 3 ? { left: [], center: [], right: [] } : { left: [], right: [] }
			});

			const columnKeyFor = ( loc ) => {
				if ( maxCols === 3 ) {
					if ( loc === 'center' || loc === 'middle' || loc === 2 ) return 'center';
					if ( loc === 'right' || loc === 3 ) return 'right';
					return 'left';
				}
				return ( loc === 'right' || loc === 2 ) ? 'right' : 'left';
			};

			const sections = [];
			let currentCols = null;

			pageSets.forEach( item => {
				const ctk = item.traitSet?.custom?.cortexToolkit || {};
				const rawSpan = ctk.colSpan ?? ctk.columnSpan;
				const isFullWidth = ( rawSpan === 'full' || Number( rawSpan ) >= maxCols );

				if ( isFullWidth ) {
					if ( currentCols ) {
						sections.push( currentCols );
						currentCols = null;
					}
					sections.push({
						type: 'full-width',
						trackCount: maxCols,
						ordered: [ item ],
						itemsByColumn: {
							full: [ item ]
						}
					});
					return;
				}

				// A row break starts a fresh band so consecutive bands can
				// carry different column shares (e.g. 66/34 above 40/60).
				if ( !currentCols ) currentCols = newSection();
				else if ( ctk.rowBreak === true ) {
					sections.push( currentCols );
					currentCols = newSection();
				}
				currentCols.ordered.push( item );
				currentCols.itemsByColumn[ columnKeyFor( ctk.location ) ].push( item );
			});

			if ( currentCols ) {
				sections.push( currentCols );
			}

			return sections;
		},

		// 1-based grid track for a set location within trackCount tracks.
		spotlightTrackForLocation( location, trackCount ) {
			if ( trackCount === 3 ) {
				if ( location === 'center' || location === 'middle' || location === 2 ) return 2;
				if ( location === 'right' || location === 3 ) return 3;
				return 1;
			}
			return ( location === 'right' || location === 2 ) ? 2 : 1;
		},

		// Grid column span for a set: full width, 2-of-3, or a single track.
		// (Full-width sets are split into their own sections above.)
		spotlightSpanForSet( traitSet, trackCount ) {
			const raw = traitSet?.custom?.cortexToolkit?.colSpan ?? traitSet?.custom?.cortexToolkit?.columnSpan;
			if ( raw === 'full' || Number( raw ) >= trackCount ) return trackCount;
			if ( trackCount === 3 && Number( raw ) === 2 ) return 2;
			return 1;
		},

		// Explicit width share (10–90) for a grid track: first value found in
		// array order among single-track sets placed in that track. Spanning
		// sets never set track widths. Returns 0 for an equal share.
		spotlightTrackWidth( section, track ) {
			const n = section.trackCount || 2;
			for ( const entry of ( section.ordered || [] ) ) {
				const ts = entry.traitSet;
				if ( this.spotlightSpanForSet( ts, n ) !== 1 ) continue;
				if ( this.spotlightTrackForLocation( ts?.custom?.cortexToolkit?.location, n ) !== track ) continue;
				const w = Number( ts?.custom?.cortexToolkit?.colWidth );
				if ( w >= 10 && w <= 90 ) return Math.round( w );
			}
			return 0;
		},

		// grid-template-columns value for a band section, e.g.
		// "25fr 50fr 25fr". Tracks without a width split the remainder, so
		// e.g. 66% on one column leaves ~33% for its mate.
		getSpotlightGridStyle( section ) {
			const n = section.trackCount || 2;
			const grows = [];
			for ( let t = 1; t <= n; t++ ) grows.push( this.spotlightTrackWidth( section, t ) );
			if ( !grows.some( g => g > 0 ) ) return '';
			const explicit = grows.reduce( (a, g) => a + ( g > 0 ? g : 0 ), 0 );
			const autoIdx = grows.map( (g, i) => g > 0 ? -1 : i ).filter( i => i >= 0 );
			let final = grows;
			if ( autoIdx.length ) {
				const rest = 100 - explicit;
				if ( rest < autoIdx.length * 5 ) return ''; // Over-constrained: equal shares.
				final = grows.map( g => g > 0 ? g : Math.round( rest / autoIdx.length * 100 ) / 100 );
			}
			return `grid-template-columns: ${final.map( g => `minmax(0, ${g}fr)` ).join( ' ' )};`;
		},

		// Explicit grid placement for every set in a band section, in array
		// order. Spanning sets occupy adjacent tracks; a lone set in a track
		// stretches the full band height so bands read as solid blocks.
		getSpotlightGridCells( section ) {
			const n = section.trackCount || 2;
			const cursors = {};
			for ( let t = 1; t <= n; t++ ) cursors[t] = 1;
			const cells = [];
			( section.ordered || [] ).forEach( entry => {
				const ts = entry.traitSet;
				let span = this.spotlightSpanForSet( ts, n );
				if ( span > n ) span = n;
				const home = this.spotlightTrackForLocation( ts?.custom?.cortexToolkit?.location, n );
				let tracks;
				if ( span >= n ) tracks = Array.from( { length: n }, (_, i) => i + 1 );
				else if ( span === 2 ) tracks = ( home >= n ) ? [n - 1, n] : [home, home + 1];
				else tracks = [home];
				let row = 0;
				tracks.forEach( t => { row = Math.max( row, cursors[t] ); } );
				tracks.forEach( t => { cursors[t] = row + 1; } );
				cells.push({ s: entry.index, row, col: tracks[0], span: tracks.length, rowspan: 1 });
			});
			const maxRow = cells.reduce( (a, c) => Math.max( a, c.row ), 1 );
			if ( maxRow > 1 ) {
				const perTrack = {};
				cells.forEach( c => {
					for ( let t = c.col; t < c.col + c.span; t++ ) {
						( perTrack[t] = perTrack[t] || [] ).push( c );
					}
				});
				Object.keys( perTrack ).forEach( t => {
					if ( perTrack[t].length === 1 && perTrack[t][0].rowspan === 1 ) {
						perTrack[t][0].rowspan = maxRow - perTrack[t][0].row + 1;
					}
				});
			}
			cells.forEach( c => {
				let st = `grid-row: ${c.row} / span ${c.rowspan}; grid-column: ${c.col} / span ${c.span}; min-width: 0;`;
				if ( c.row > 1 ) st += ' margin-top: -2px;';
				if ( c.col > 1 ) st += ' margin-left: -2px;';
				c.style = st;
			});
			return cells;
		},

		renderNameHtml( name ) {
			if ( !name ) return '';
			return cortexFunctions.renderText( name );
		},

		setColumnCount( cols ) {
			if ( !this.character ) return;
			if ( !this.character.custom ) this.character.custom = {};
			if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
			this.character.custom.cortexToolkit.columns = cols;
			this.updateCharacter( this.character );
		},

		removeHeaderPortrait() {
			if ( !this.character.portrait ) this.character.portrait = {};
			if ( !this.character.portrait.custom ) this.character.portrait.custom = {};
			if ( !this.character.portrait.custom.cortexToolkit ) this.character.portrait.custom.cortexToolkit = {};
			this.character.portrait.url = '';
			this.character.portrait.custom.cortexToolkit.size = 'none';
			this.updateCharacter( this.character );
			if ( this.isSelected(['portrait']) ) {
				this.selectElement([]);
			}
		},

		addHeaderPortrait() {
			if ( !this.character.portrait ) this.character.portrait = {};
			if ( !this.character.portrait.custom ) this.character.portrait.custom = {};
			if ( !this.character.portrait.custom.cortexToolkit ) this.character.portrait.custom.cortexToolkit = {};
			this.character.portrait.custom.cortexToolkit.size = 'spotlight';
			this.character.portrait.custom.cortexToolkit.location = 'header';
			this.updateCharacter( this.character );
			this.selectElement(['portrait']);
		},




		getAttributeAngle( a ) {
			const cfg = this.haloConfig;
			const centerAngle = 90 + (cfg.arcAngle ?? -90);
			const spreadFactor = (cfg.arcSpread ?? 100) / 100;
			const totalSpan = 85 * spreadFactor;

			let alpha;
			if ( this.attributes.length === 1 ) {
				alpha = 0.5;
			} else {
				alpha = a / ( this.attributes.length - 1 );
			}

			return centerAngle + (alpha - 0.5) * totalSpan;
		},

		getAttributeStyle( a ) {
			const cfg = this.haloConfig;
			const angleDeg = this.getAttributeAngle( a );
			const rad = angleDeg * Math.PI / 180;
			const cos = Math.cos( rad );
			const sin = Math.sin( rad );
			const arcDistance = cfg.arcDistance ?? 0;

			const percentX = ( 50 * cos ).toFixed( 4 );
			const percentY = ( 50 * sin ).toFixed( 4 );

			if ( arcDistance !== 0 ) {
				const mmX = ( arcDistance * cos ).toFixed( 4 );
				const mmY = ( arcDistance * sin ).toFixed( 4 );
				return `left: calc(50% + ${percentX}% + ${mmX}mm); top: calc(50% + ${percentY}% + ${mmY}mm);`;
			}

			return `left: calc(50% + ${percentX}%); top: calc(50% + ${percentY}%);`;
		},

		getAttributeNameStyle( a ) {
			const angleDeg = this.getAttributeAngle( a );
			const rad = angleDeg * Math.PI / 180;

			const cos = Math.cos(rad);

			// Radial distance gap from die center to label anchor
			const distMm = 6;
			const offX = cos * distMm;

			// Labels sit to the outward side of the die, vertically centered
			// on it (core-book placement).
			if ( cos > 0.35 ) {
				return `position: absolute; left: calc(50% + ${offX.toFixed(2)}mm); top: 50%; transform: translate(0, -50%); text-align: left;`;
			} else if ( cos < -0.35 ) {
				return `position: absolute; left: calc(50% + ${offX.toFixed(2)}mm); top: 50%; transform: translate(-100%, -50%); text-align: right;`;
			}

			// Top / bottom of the ring: centered under the die.
			const sin = Math.sin(rad);
			const offY = sin * distMm;
			return `position: absolute; left: 50%; top: calc(50% + ${offY.toFixed(2)}mm); transform: translate(-50%, 0); text-align: center;`;
		},
		
		// SELECTING

		selectElement( selector ) {
			if ( this.submode === 'edit' ) {
				this.$emit( 'selectElement', selector );
			}
		},

		clearSelected() {
			this.$emit('selectElement', []);
		},

		// EDITING

		addTraitSet( location, page = 1, span = 1 ) {

			let character = this.character;

			let traitSet = structuredClone( cortexFunctions.defaultTraitSet );
			traitSet.custom.cortexToolkit.location = location ?? 'left';
			traitSet.custom.cortexToolkit.page = page ?? 1;
			if ( span === 'full' || Number(span) >= this.columnCount ) {
				traitSet.custom.cortexToolkit.colSpan = 'full';
				traitSet.custom.cortexToolkit.columnSpan = 'full';
			}
			cortexFunctions.ensureTraitSetIds({ traitSets: [...( character.traitSets || [] ), traitSet] });
			traitSet.traits.push( structuredClone( cortexFunctions.defaultTrait ) );

			character.traitSets.push( traitSet );

			this.updateCharacter( character );

			let newTraitSetID = character.traitSets.length - 1;
			this.selectElement([ 'traitSet', newTraitSetID ]);

		},

		removeTraitSet( traitSetID ) {

			// if ( this.isSelected(['traitSet', traitSetID]) ) {
				this.clearSelected();
			// }

			let character = this.character;

			character.traitSets.splice(traitSetID, 1);

			this.updateCharacter( character );

		},

		addGallerySet( styleEntry, location, page ) {

			let character = this.character;
			if ( !character || !styleEntry ) return;

			const styleId = styleEntry.id || 'default';
			let traitSet = structuredClone( cortexFunctions.defaultTraitSet );
			const styleDefaults = cortexFunctions.defaultFeaturesForStyle( styleId );
			traitSet.name = styleEntry.name || 'New trait set';
			traitSet.nounSingular = styleEntry.sing || 'Trait';
			traitSet.nounPlural = styleEntry.plur || 'Traits';
			traitSet.custom.cortexToolkit.style = { header: styleId, body: styleId };
			Object.assign( traitSet.custom.cortexToolkit.features, styleDefaults.features );
			if ( styleDefaults.multiDie ) {
				traitSet.custom.cortexToolkit.multiDie = true;
			}
			traitSet.custom.cortexToolkit.location = location ?? 'left';
			traitSet.custom.cortexToolkit.page = page ?? 1;
			cortexFunctions.ensureTraitSetIds({ traitSets: [...( character.traitSets || [] ), traitSet] });
			if ( styleId === 'pips' ) {
				traitSet.custom.cortexToolkit.pips = { count: 25, perRow: 5, connected: true, filled: 0 };
			}
			if ( styleId === 'session-record' || styleId === 'angled-lines' ) {
				traitSet.custom.cortexToolkit.sessionRecord = { count: 20 };
				traitSet.custom.cortexToolkit.reservedSlots = 20;
			}
			if ( styleId !== 'pips' && styleId !== 'notes' && styleId !== 'image' &&
			     styleId !== 'session-record' && styleId !== 'angled-lines' ) {
				let blank = structuredClone( cortexFunctions.defaultTrait );
				blank.name = '';
				blank.value = 0;
				blank.dice = [];
				blank.description = '';
				traitSet.traits.push( blank );
			}

			character.traitSets.push( traitSet );

			this.updateCharacter( character );
			this.showStyleGallery = false;

			let newTraitSetID = character.traitSets.length - 1;
			this.selectElement([ 'traitSet', newTraitSetID ]);

		},
		
		addTrait( traitSetID ) {

			let character = this.character;
			let traitSet = character.traitSets[traitSetID];
			let noun = ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait';

			let trait = structuredClone( cortexFunctions.defaultTrait );
			trait.name = 'New ' + noun;
			const allowed = this.getTraitSetRatings( traitSet );
			if ( allowed.length > 0 && !allowed.includes( trait.value ) ) {
				trait.value = allowed[0];
			}

			character.traitSets[traitSetID].traits.push(trait);

			this.updateCharacter( character );
			
			let newTraitID = character.traitSets[traitSetID].traits.length - 1;
			this.selectElement([ 'trait', traitSetID, newTraitID ]);

		},

		removeTrait( traitSetID, traitID ) {

			/*// If we’re removing the trait that is currently selected, switch to the previous trait, or the parent trait set if no other traits remain.
			if ( this.isSelected(['trait', traitSetID, traitID]) ) {
				if ( this.character.traitSets[traitSetID].traits.length > 1) {
					this.selectElement([ 'trait', traitSetID, traitID - 1 ]);
				} else {
					this.select( 'traitSet', traitSetID );
				}
			} else {*/
				this.clearSelected();
			/*}*/

			setTimeout( () => {
				let character = this.character;
				character.traitSets[traitSetID].traits.splice(traitID, 1);
				this.updateCharacter( character );
			}, 200 );

		},

		updateCharacter( character ) {
			this.$emit( 'updateCharacter', character );
		},

		adjustPlotPoints( delta ) {
			if ( !this.character ) return;
			const current = Number( this.character.plotPoints ) || 0;
			this.character.plotPoints = Math.max( 0, current + delta );
			this.updateCharacter( this.character );
		},

		exportCharacter() {
			this.$emit('exportCharacter', this.character.id);
		},








		// SPOTLIGHT PDF STYLES: Skills & Specialties, Talents, Standing, Badges, Resources w/ dice count.






		// Generic trait-set label store. Styles read their named regions
		// through this single getter; custom text lives in
		// custom.cortexToolkit.labels and defaults in
		// cortexFunctions.defaultTraitSetLabels. Missing keys render as ''.

		// Generic subtrait-name-or-default reader (standing rows pass the
		// trait set so positional defaults resolve centrally).


		// Groups rendered skill rows with their specialties. Specialties come
		// from nested sub-traits AND from flat specialty-role traits linked to
		// any skill via linkTo (original trait index). Unlinked flats collect
		// in a trailing group under the right-hand heading.


		shouldShowStressD4( traitSet ) {
			const cfg = traitSet?.custom?.cortexToolkit?.stressConfig;
			if ( cfg && typeof cfg.includeD4 === 'boolean' ) return cfg.includeD4;
			return false;
		},








		handleAttributeClick( attributesID, a, attribute ) {
			if ( this.isHaloDragging ) return;
			if ( this.submode === 'play' ) {
				const ts = this.traitSets[attributesID];
				const isChallenge = Boolean( ts?.custom?.cortexToolkit?.isChallengePool || ts?.custom?.cortexToolkit?.challengePool );
				if ( isChallenge ) {
					const diceToAdd = [];
					const poolName = (ts?.name && ts.name !== 'Attributes') ? ts.name : (this.character.name || 'Challenge Pool');
					for ( const attr of this.attributes ) {
						if ( attr.value && attr.value > 0 ) {
							diceToAdd.push({
								size: attr.value,
								qty: 1,
								source: attr.name || poolName
							});
						}
					}
					if ( diceToAdd.length > 0 ) {
						this.$emit( 'addDieToRoller', diceToAdd );
					}
				} else {
					if ( attribute.value ) {
						this.$emit( 'addDieToRoller', {
							size: attribute.value,
							qty: 1,
							source: attribute.name
						});
					}
				}
			} else {
				this.selectElement([ 'trait', attributesID, a ]);
			}
		},

		handleScaleDieClick() {
			if ( this.isHaloDragging ) return;
			if ( this.submode === 'play' ) {
				if ( this.scaleDieValue > 0 ) {
					this.$emit( 'addDieToRoller', {
						size: this.scaleDieValue,
						qty: 1,
						source: 'Scale',
						isScale: true
					});
				}
			} else {
				if ( this.isOtherEditorOpen ) {
					return;
				}
				if ( this.scaleTrait ) {
					const attrSetID = this.attributesID;
					const traitIdx = this.character.traitSets[attrSetID].traits.indexOf( this.scaleTrait );
					if ( traitIdx !== -1 ) {
						this.selectElement([ 'trait', attrSetID, traitIdx ]);
						return;
					}
				}
				this.selectElement([ 'scaleDie' ]);
			}
		},

		startHaloDrag( event, targetType ) {
			if ( this.submode !== 'edit' ) return;

			const portraitEl = this.$el.querySelector('.portrait-circle') || this.$el.querySelector('.portrait-inner');
			if ( !portraitEl ) return;

			const pRect = portraitEl.getBoundingClientRect();
			const centerX = pRect.left + pRect.width / 2;
			const centerY = pRect.top + pRect.height / 2;

			const startX = event.clientX ?? event.touches?.[0]?.clientX;
			const startY = event.clientY ?? event.touches?.[0]?.clientY;

			const initialRad = Math.atan2( startY - centerY, startX - centerX );
			const initialDeg = initialRad * 180 / Math.PI;

			const startArcAngle = this.haloConfig.arcAngle ?? -90;
			const startScaleAngle = this.haloConfig.scaleAngle ?? 0;

			let hasMoved = false;

			const onMove = ( e ) => {
				const clientX = e.clientX ?? e.touches?.[0]?.clientX;
				const clientY = e.clientY ?? e.touches?.[0]?.clientY;
				if ( clientX === undefined || clientY === undefined ) return;

				const dist = Math.hypot( clientX - startX, clientY - startY );
				if ( dist > 4 ) {
					hasMoved = true;
					this.isHaloDragging = true;
				}

				if ( !hasMoved ) return;

				e.preventDefault();

				const currRad = Math.atan2( clientY - centerY, clientX - centerX );
				const currDeg = currRad * 180 / Math.PI;

				let deltaDeg = currDeg - initialDeg;
				while ( deltaDeg > 180 ) deltaDeg -= 360;
				while ( deltaDeg < -180 ) deltaDeg += 360;

				if ( targetType === 'traits' ) {
					let newAngle = Math.round( startArcAngle + deltaDeg );
					while ( newAngle > 180 ) newAngle -= 360;
					while ( newAngle < -180 ) newAngle += 360;
					this.dragArcAngle = newAngle;
				} else if ( targetType === 'scale' ) {
					let newAngle = Math.round( startScaleAngle + deltaDeg );
					while ( newAngle > 180 ) newAngle -= 360;
					while ( newAngle < -180 ) newAngle += 360;
					this.dragScaleAngle = newAngle;
				}
			};

			const onUp = () => {
				window.removeEventListener( 'mousemove', onMove );
				window.removeEventListener( 'mouseup', onUp );
				window.removeEventListener( 'touchmove', onMove );
				window.removeEventListener( 'touchend', onUp );

				if ( hasMoved ) {
					if ( targetType === 'traits' && this.dragArcAngle !== null ) {
						this.setHaloConfigProp( 'arcAngle', this.dragArcAngle );
					} else if ( targetType === 'scale' && this.dragScaleAngle !== null ) {
						this.setHaloConfigProp( 'scaleAngle', this.dragScaleAngle );
					}
					this.dragArcAngle = null;
					this.dragScaleAngle = null;
					this.updateCharacter( JSON.parse( JSON.stringify( this.character ) ) );
					setTimeout(() => {
						this.isHaloDragging = false;
					}, 60);
				} else {
					this.dragArcAngle = null;
					this.dragScaleAngle = null;
					this.isHaloDragging = false;
				}
			};

			window.addEventListener( 'mousemove', onMove, { passive: false } );
			window.addEventListener( 'mouseup', onUp );
			window.addEventListener( 'touchmove', onMove, { passive: false } );
			window.addEventListener( 'touchend', onUp );
		},

		setHaloConfigProp( key, value ) {
			const attrSet = this.haloTraitSet;
			if ( attrSet ) {
				if ( !attrSet.custom ) attrSet.custom = {};
				if ( !attrSet.custom.cortexToolkit ) attrSet.custom.cortexToolkit = {};
				if ( !attrSet.custom.cortexToolkit.haloConfig ) {
					attrSet.custom.cortexToolkit.haloConfig = {
						arcAngle: -90,
						arcSpread: 100,
						arcDistance: 0,
						scaleAngle: 0,
						scaleDistance: 0,
						scaleDieX: 0,
						scaleDieY: 0
					};
				}
				attrSet.custom.cortexToolkit.haloConfig[ key ] = value;
			}
		},

		setScaleDieValue( val ) {
			const num = Number( val ) || 0;
			const attrSet = this.haloTraitSet;
			if ( attrSet ) {
				if ( !attrSet.custom ) attrSet.custom = {};
				if ( !attrSet.custom.cortexToolkit ) attrSet.custom.cortexToolkit = {};
				attrSet.custom.cortexToolkit.scaleDie = num;

				const stIndex = attrSet.traits.findIndex( t => t.name?.trim().toLowerCase() === 'scale' || t.custom?.isScale );
				if ( num === 0 ) {
					if ( stIndex !== -1 ) {
						attrSet.traits.splice( stIndex, 1 );
					}
				} else if ( stIndex !== -1 ) {
					attrSet.traits[stIndex].value = num;
				}
			}
			if ( !this.character.custom ) this.character.custom = {};
			if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
			this.character.custom.cortexToolkit.scale = num;
			this.updateCharacter( JSON.parse( JSON.stringify( this.character ) ) );
		},

		getScaleDieStyle() {
			const cfg = this.haloConfig;
			const R_percent = (29 / 84) * 100;
			const angleDeg = 90 + (cfg.scaleAngle ?? 0);
			const rad = angleDeg * Math.PI / 180;
			const cos = Math.cos( rad );
			const sin = Math.sin( rad );

			const percentX = ( R_percent * cos ).toFixed( 4 );
			const percentY = ( R_percent * sin ).toFixed( 4 );

			const extraMmX = ( (cfg.scaleDistance ?? 0) * cos + (cfg.scaleDieX ?? 0) ).toFixed( 4 );
			const extraMmY = ( (cfg.scaleDistance ?? 0) * sin + (cfg.scaleDieY ?? 0) ).toFixed( 4 );

			return `left: calc(50% + ${percentX}% + ${extraMmX}mm); top: calc(50% + ${percentY}% + ${extraMmY}mm);`;
		},

		renderNotesText( text ) {
			if ( !text ) return '';
			return cortexFunctions.renderMarkdown( text );
		},

		hasWatermark( pageIndex ) {
			const wm = this.character?.custom?.cortexToolkit?.watermark;
			if ( !wm || !wm.enabled || !wm.url ) return false;
			if ( !wm.page || wm.page === 'all' ) return true;
			return Number(wm.page) === Number(pageIndex);
		},

		getWatermarkStyle( pageIndex ) {
			const wm = this.character?.custom?.cortexToolkit?.watermark;
			if ( !wm ) return '';
			const url = cortexFunctions.safeImageUrl( wm.url );
			if ( !url ) return '';
			const opacity = Number( wm.opacity );
			const scale = Number( wm.scale );
			return `background-image: url('${url}'); opacity: ${isNaN(opacity) ? 0.08 : opacity}; background-size: ${isNaN(scale) ? 75 : scale}%;`;
		},

		safeImageUrl( url ) {
			return cortexFunctions.safeImageUrl( url );
		},


























		print() {
			window.print();
		}

	},

	mounted() {
		this.applyFonts();
	},

	watch: {
		character: {
			immediate: true,
			deep: true,
			handler() {
				this.applyFonts();
			}
		}
	}

}
