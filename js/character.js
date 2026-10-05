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

		hasAttributesRing() {
			if ( this.isSpotlightStyle ) return false;
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
			if ( this.submode === 'edit' ) return true;
			return Boolean( this.portrait?.url );
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
			</div>

			<div class="toolbar-group">
				<div class="toolbar-segmented">
					<button type="button" :class="{ active: sheetStyle === 'spotlight' }" @click.stop="setSheetStyle('spotlight')">
						<i class="fas fa-columns"></i> Spotlight
					</button>
					<button type="button" :class="{ active: sheetStyle === 'classic' }" @click.stop="setSheetStyle('classic')">
						<i class="fas fa-circle-notch"></i> Classic
					</button>
				</div>

				<div class="toolbar-segmented">
					<button type="button" :class="{ active: columnCount === 2 }" @click.stop="setColumnCount(2)">
						2 Cols
					</button>
					<button type="button" :class="{ active: columnCount === 3 }" @click.stop="setColumnCount(3)">
						3 Cols
					</button>
				</div>

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
			<button type="button" @click.stop="toggleDesignerPrintPreview" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 0.25rem 0.6rem; border-radius: 3px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">
				Exit Print View
			</button>
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
										v-if="!hasHeaderPortrait && submode === 'edit'"
										type="button"
										class="spotlight-add-portrait-link"
										@click.stop="addHeaderPortrait"
										title="Add Portrait to Header"
									>
										<i class="fas fa-plus"></i> Add Portrait
									</button>
								</div>
								<textarea
									v-if="submode === 'edit'"
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
								:class="{ 'selected': isSelected(['portrait']), 'has-image': Boolean(portrait?.url) }"
								@click.stop="selectElement(['portrait'])"
								title="Click to edit portrait"
							>
								<div
									v-if="portrait?.url"
									class="portrait-small-image"
									:class="'portrait-alignment-' + (portrait?.custom?.cortexToolkit?.alignment || 'top-center')"
									:style="'background-image: url(' + portrait.url + ');'"
								></div>
								<div v-else class="portrait-small-placeholder" @click.stop="submode === 'edit' ? selectElement(['name']) : null" title="Click to edit title or upload logo">
									<span class="spotlight-game-tag" v-if="game">{{ game }}</span>
									<span class="spotlight-logo-icon" v-else><i class="fas fa-id-badge"></i></span>
									<span class="spotlight-add-hint" v-if="submode === 'edit'">Click to edit title</span>
								</div>

								<button
									v-if="submode === 'edit'"
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

									<div class="title"
										v-html="name"
									></div>

									<div class="title-decoration">
										<svg height="4" width="100%"><line x1="0" y1="0" x2="10000" y2="0" style="stroke:#C50852;stroke-width:4pt"/></svg>
									</div>

								</div>

								<!-- CHARACTER DESCRIPTION -->
								<div class="character-meta">
						
									<div class="character-player" v-if="player && player.length">
										<span class="meta-label">Player:</span> <span v-html="player"></span>
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
							<div class="page-2-title" v-html="name"></div>
							<div class="page-2-badge">{{ game ? game + ' — ' : '' }}Page {{ pageIndex }} of {{ pageCount }}</div>
						</div>
					</header>

					<!-- SPOTLIGHT MODE LAYOUT (INDEPENDENT COLUMN STACKING & FULL-WIDTH SECTIONS) -->
					<div v-if="isSpotlightStyle" class="spotlight-layout">
						<template v-for="(section, secIdx) in getSpotlightSections(pageIndex)" :key="secIdx">
							<div
								:class="[
									'columns',
									'spotlight-columns',
									section.type === 'full-width' ? 'spotlight-full-width' : ('columns-' + columnCount)
								]"
							>
								<div
									v-for="(colSets, colKey) in section.itemsByColumn"
									:key="colKey"
									:class="[
										'spotlight-column',
										'spotlight-column-' + colKey,
										colKey === 'right' ? 'column-right' : (colKey === 'center' ? 'column-center' : 'column-left'),
										section.type === 'full-width' ? 'spotlight-full-column' : ''
									]"
								>
									<template v-for="{ traitSet, index: s } in colSets" :key="s">
										<div :class="getTraitSetClasses(traitSet)">
								<div class="trait-set-header">
									<transition appear>
										<div :class="{'trait-set-header-inner': true, 'selected': isSelected(['traitSet', s])}"
											@click.stop="selectElement([ 'traitSet', s ])"
										>
											<div v-html="traitSet.name"></div>
										</div>
									</transition>

									<transition name="editor" appear>
										<trait-set-editor
											:character="character"
											:open="isSelected(['traitSet', s])"
											v-show="submode === 'edit' && isSelected(['traitSet', s])"
											:traitSetID="s"
											:viewY="viewY"
											@selectElement="selectElement"
											@updateCharacter="updateCharacter"
											@removeTraitSet="removeTraitSet"
										></trait-set-editor>
									</transition>
								</div>

								<div class="trait-set-body">
									<!-- IMAGE STYLE -->
									<div class="trait-image-body"
										v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'image'"
										@click.stop="selectElement([ 'traitSet', s ])"
										title="Click to edit image settings"
									>
										<div class="image-set-container" :style="getImageSetContainerStyle(traitSet)">
											<div
												v-if="traitSet?.custom?.cortexToolkit?.imageConfig?.url"
												class="image-set-graphic"
												:class="'portrait-alignment-' + (traitSet?.custom?.cortexToolkit?.imageConfig?.alignment || 'center')"
												:style="getImageSetGraphicStyle(traitSet)"
											></div>
											<div v-else class="image-set-placeholder">
												<i class="fas fa-image"></i>
												<span>Click to add illustration or image</span>
											</div>
											<div class="image-set-caption" v-if="traitSet?.custom?.cortexToolkit?.imageConfig?.caption">
												{{ traitSet.custom.cortexToolkit.imageConfig.caption }}
											</div>
										</div>
									</div>

									<!-- NOTES STYLE -->
									<div class="trait-notes-body"
										v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'notes'"
										@click.stop="selectElement([ 'traitSet', s ])"
									>
										<div class="notes-content" v-html="renderNotesText(traitSet?.custom?.cortexToolkit?.notes || traitSet?.description || 'Click to edit notes...')"></div>
									</div>

									<!-- PIPS STYLE (XP / TRACK) -->
									<div class="trait-pips-body"
										v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'pips'"
										@click.stop="submode === 'edit' ? selectElement([ 'traitSet', s ]) : null"
									>
										<div class="pips-track-container" :class="{ 'connected': getPipConfig(traitSet).connected }">
											<div
												v-for="rowIdx in getPipRowCount(traitSet)"
												:key="'prow-' + rowIdx"
												class="pip-row"
											>
												<div class="pip-row-line" v-if="getPipConfig(traitSet).connected"></div>
												<div
													v-for="colIdx in getPipRowCols(traitSet, rowIdx)"
													:key="'pcol-' + colIdx"
													class="pip-bubble-wrap"
													@click.stop="handlePipClick(s, getPipIndex(traitSet, rowIdx, colIdx))"
													:title="submode === 'play' ? ('XP: ' + (getPipIndex(traitSet, rowIdx, colIdx) + 1)) : ''"
												>
													<div
														class="pip-bubble"
														:class="{ 'filled': isPipFilled(traitSet, getPipIndex(traitSet, rowIdx, colIdx)) }"
													></div>
												</div>
											</div>
										</div>
									</div>

									<!-- SESSION RECORD / ANGLED LINES STYLE -->
									<div class="trait-session-record-body"
										v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'session-record' || traitSet?.custom?.cortexToolkit?.style?.body === 'angled-lines'"
										@click="submode === 'edit' ? selectElement([ 'traitSet', s ]) : null"
									>
										<svg
											class="session-record-svg"
											:viewBox="'0 0 260 ' + (55 + (getSessionRecordCount(traitSet) - 1) * 28 + 25)"
											preserveAspectRatio="xMidYMin meet"
										>
											<line
												x1="24"
												y1="55"
												x2="24"
												:y2="55 + (getSessionRecordCount(traitSet) - 1) * 28"
												class="session-spine"
											/>

											<g
												v-for="item in getSessionRecordItems(traitSet)"
												:key="'srec-' + item.index"
												class="session-record-row"
												:class="{ 'filled': item.isFilled, 'selected': isSelected(['trait', s, item.index]) }"
											>
												<line
													x1="30.5"
													:y1="55 + item.index * 28"
													x2="252"
													:y2="(55 + item.index * 28) - 56"
													class="session-line"
													@click.stop="handleSessionLineClick(s, item.index)"
												/>

												<circle
													cx="24"
													:cy="55 + item.index * 28"
													r="6.5"
													class="session-bubble"
													:class="{ 'filled': item.isFilled }"
													@click.stop="handleSessionBubbleClick(s, item.index)"
													:title="submode === 'play' ? (item.isFilled ? 'Uncheck' : 'Check') : 'Click to toggle'"
												/>

												<text
													v-if="item.name && (!printBlank || submode !== 'print')"
													:transform="'translate(36, ' + ((55 + item.index * 28) - 4) + ') rotate(-14.2)'"
													class="session-label"
													@click.stop="handleSessionLineClick(s, item.index)"
												>
													{{ item.name }}
												</text>
											</g>
										</svg>

										<transition name="editor" appear>
											<trait-editor
												v-if="editing && editing[0] === 'trait' && editing[1] === s"
												:character="character"
												:open="isSelected(['trait', s, editing[2]])"
												v-show="submode === 'edit' && isSelected(['trait', s, editing[2]])"
												:traitSetID="s"
												:traitID="editing[2]"
												:viewY="viewY"
												@selectElement="selectElement"
												@updateCharacter="updateCharacter"
												@removeTrait="removeTrait"
											></trait-editor>
										</transition>
									</div>

									<div class="trait-list" :class="[ traitSet?.custom?.cortexToolkit?.style?.body === 'list' ? 'trait-list-unrated' : '', traitSet?.custom?.cortexToolkit?.traitColumns > 1 ? ('trait-list-cols-' + traitSet.custom.cortexToolkit.traitColumns) : '' ]" v-else>
										<!-- SHARED HINDER BANNER (COMPACT DISTINCTIONS) -->
										<div
											class="distinctions-shared-hinder"
											v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions' && traitSet?.custom?.cortexToolkit?.sharedHinder"
										>
											<div v-for="(ruleLine, rIdx) in getSharedHinderLines(traitSet)" :key="rIdx" class="hinder-rule-line">
												<span class="hinder-bullet">•</span>
												<span class="hinder-text" v-html="renderHinderLine(ruleLine)"></span>
											</div>
										</div>

										<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="t">
											<div :class="getTraitClasses(item.trait)">
												<transition name="trait" appear>
													<div :class="{ 'trait-inner': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
														@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null"
													>
														<h2 class="trait-title">
															<span class="list-bullet" v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'list'">•</span>
															<span
																class="distinction-die"
																v-if="isSpotlightPrintStyle && traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions' && getTraitSetRatings(traitSet).length <= 1"
																v-html="renderDieValueForPrint(item.trait.value || 8, !printBlank && !item.isPlaceholder && item.trait.value > 0)"
															></span>
															<span class="trait-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name" v-html="item.trait.name"></span>
															<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder">
																<template v-if="item.trait.name && item.trait.name.endsWith(':') && !item.isPlaceholder">
																	{{ item.trait.name }} <span class="trait-blank-line"></span>
																</template>
																<template v-else-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
																	{{ item.trait.name }}
																</template>
																<template v-else>
																	<span class="trait-blank-line"></span>
																</template>
															</span>
															<span class="trait-name" v-else v-html="item.trait.name || ''"></span>

															<!-- STRESS VALUE TRACK -->
															<div class="trait-value stress-value" v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'stress'">
																<span
																	v-for="size in getTraitSetRatings(traitSet)"
																	:key="size"
																	:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
																	@click.stop="!printBlank && !item.isPlaceholder ? handleStressClick(s, item.originalIndex, size) : null"
																	v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"
																></span>
																<span v-if="shouldShowStressOut(traitSet)" :class="{ 'stress-out-badge': true, 'active': !printBlank && !item.isPlaceholder && isStressOut(item.trait) }" @click.stop="!printBlank && !item.isPlaceholder ? handleStressOutClick(s, item.originalIndex) : null" title="Out">💥 OUT</span>
															</div>

															<!-- LIST STYLE: NO VALUE -->
															<div class="trait-value" v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'list'"></div>

															<!-- DISTINCTIONS STYLE IN SPOTLIGHT: VALUE IS IN TITLE ONLY IF SINGLE FIXED RATING -->
															<div class="trait-value" v-else-if="isSpotlightPrintStyle && traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions' && getTraitSetRatings(traitSet).length <= 1"></div>

															<!-- MULTI-DIE TRAIT -->
															<div class="trait-value multidie-value" v-else-if="isMultiDieTrait(traitSet, item.trait)">
																<div
																	v-for="(dieSize, dIdx) in (printBlank || item.isPlaceholder ? getTraitSetRatings(traitSet) : getTraitDice(item.trait))"
																	:key="dIdx"
																	class="multidie-badge-wrap"
																	:class="{ 'spent': !printBlank && !item.isPlaceholder && isDieSpent(item.trait, dIdx) }"
																>
																	<span
																		:class="{ 'c active': !isSpotlightPrintStyle && !printBlank && !item.isPlaceholder }"
																		@click.stop="!printBlank && !item.isPlaceholder ? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex) : null"
																		:title="submode === 'play' && !printBlank && !item.isPlaceholder ? 'Click to add d' + dieSize + ' to roller pool' : ''"
																		v-html="renderDieValueForPrint(dieSize, !printBlank && !item.isPlaceholder)"
																	></span>
																	<div class="die-play-controls" v-if="submode === 'play' && !printBlank && !item.isPlaceholder">
																		<button type="button" class="btn-play-spend" @click.stop="toggleDieSpentInPlay(s, item.originalIndex, dIdx)" :title="isDieSpent(item.trait, dIdx) ? 'Restore die' : 'Spend die'">
																			<i :class="isDieSpent(item.trait, dIdx) ? 'fas fa-rotate-left' : 'fas fa-xmark'"></i>
																		</button>
																	</div>
																</div>
															</div>

															<!-- STANDARD SINGLE-DIE TRAIT -->
															<div class="trait-value single-die-value" v-else @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
																<span
																	v-for="size in getTraitSetRatings(traitSet)"
																	:key="size"
																	:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
																	v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"
																></span>
															</div>
														</h2>

														<div
															class="trait-description"
															v-if="traitSet?.custom?.cortexToolkit?.features?.description"
														>
															<div v-if="!printBlank && !item.isPlaceholder && item.trait.description" v-html="renderText(item.trait.description)"></div>
															<div class="desc-blank-area" v-else-if="printBlank || item.isPlaceholder">
																<div class="desc-blank-line"></div>
															</div>
														</div>

														<ul class="subtraits" v-if="traitSet?.custom?.cortexToolkit?.features?.subtraits && (item.trait.traits?.length || printBlank)">
															<li class="subtrait" v-for="(subtrait, u) in (item.trait.traits?.length ? item.trait.traits : (printBlank ? [{ name: '', value: 0 }] : []))" :key="u" @click.stop="!printBlank ? handleSingleDieClick(subtrait, subtrait.value, traitSet, s, item.originalIndex) : null">
																<span class="subtrait-name" v-if="!printBlank && subtrait.name" v-html="subtrait.name"></span>
																<span class="subtrait-name" v-else-if="printBlank">
																	<span class="trait-blank-line subtrait-blank-line"></span>
																</span>
																<div class="subtrait-value">
																	<span
																		v-for="size in getSubtraitRatings(traitSet)"
																		:key="size"
																		:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && subtrait.value === size }"
																		v-html="renderDieValueForPrint(size, !printBlank && subtrait.value === size)"
																	></span>
																</div>
															</li>
														</ul>

														<!-- COMPACT SFX SLOT FOR DISTINCTIONS WITH SHARED HINDER -->
														<div class="distinction-sfx-slot" v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions' && traitSet?.custom?.cortexToolkit?.sharedHinder && traitSet?.custom?.cortexToolkit?.features?.sfx !== false">
															<div class="distinction-sfx-badge">SFX</div>
															<div class="distinction-sfx-line">
																<span class="sfx-bullet">•</span>
																<span class="sfx-prefix">SFX:</span>
																<span class="sfx-content" v-if="!printBlank && getDistinctionSfxText(item.trait)" v-html="renderText(getDistinctionSfxText(item.trait))"></span>
																<span class="sfx-blank-line" v-else-if="printBlank"></span>
																<span class="sfx-placeholder-hint" v-else-if="submode === 'edit'" @click.stop="selectElement(['trait', s, item.originalIndex])">Click to set SFX...</span>
																<span class="sfx-blank-line" v-else></span>
															</div>
														</div>

														<!-- ATTACHED STRESS / TRACK -->
														<div class="attached-stress-block" v-if="hasAttachedStress(traitSet)">
															<div class="attached-stress-divider"></div>
															<div class="attached-stress-header">
																<span class="attached-stress-label">{{ getAttachedStressLabel(traitSet) }}</span>
															</div>
															<div class="attached-stress-track">
																<span
																	v-for="size in getAttachedStressScale(traitSet)"
																	:key="size"
																	:class="{
																		'attached-stress-die': true,
																		'c': !isSpotlightPrintStyle,
																		'active': !printBlank && getAttachedStressValue(item.trait) === size
																	}"
																	@click.stop="!printBlank ? handleAttachedStressClick(s, item.originalIndex, size) : null"
																	v-html="renderDieValueForPrint(size, !printBlank && getAttachedStressValue(item.trait) === size)"
																></span>
																<span
																	v-if="shouldShowAttachedStressOut(traitSet)"
																	:class="{ 'stress-out-badge': true, 'active': !printBlank && isAttachedStressOut(item.trait) }"
																	@click.stop="!printBlank ? handleAttachedStressOutClick(s, item.originalIndex) : null"
																	title="Out"
																>💥 OUT</span>
															</div>
														</div>

														<ul class="trait-sfx" v-else-if="traitSet?.custom?.cortexToolkit?.features?.sfx && ( item.trait.sfx?.length || (printBlank && traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions') )">
															<li v-for="(sfx, sfIdx) in (item.trait.sfx?.length ? item.trait.sfx : (printBlank ? ['hinder'] : []))" :key="sfIdx">
																<template v-if="sfx === 'hinder'">
																	<span class="trait-sfx-name">Hinder</span>:
																	<span class="trait-sfx-description"
																		v-html="renderText('Gain a PP when you switch out this ' + ( traitSet.nounSingular && traitSet.nounSingular.length ? traitSet.nounSingular.toLowerCase() : 'trait' ) + '’s d' + (item.trait.value || 8) + ' for a d4.')"
																	></span>
																</template>
																<template v-else>
																	<span class="trait-sfx-name" v-html="sfx.name || sfx"></span>:
																	<span class="trait-sfx-description" v-html="renderText(sfx.description || '')"></span>
																</template>
															</li>
														</ul>
													</div>
												</transition>

												<transition name="editor" appear>
													<trait-editor
														v-if="!item.isPlaceholder"
														:character="character"
														:open="isSelected(['trait', s, item.originalIndex])"
														v-show="submode === 'edit' && isSelected(['trait', s, item.originalIndex])"
														:traitSetID="s"
														:traitID="item.originalIndex"
														:viewY="viewY"
														@selectElement="selectElement"
														@updateCharacter="updateCharacter"
														@removeTrait="removeTrait"
													></trait-editor>
												</transition>
											</div>
										</template>

										<!-- BUTTON: ADD TRAIT -->
										<transition appear>
											<div class="preview-button-container"
												v-show="submode === 'edit'"
											>
												<div class="preview-button-container-inner">
													<div class="preview-button"
														@click.stop="addTrait( s )"
													>
														<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait' }}</span>
													</div>
												</div>
											</div>
										</transition>
									</div>

									<ul class="sfx" v-if="traitSet?.custom?.cortexToolkit?.features?.sfx && traitSet?.sfx?.length">
										<li v-for="(sfx, sfId) in traitSet.sfx" :key="sfId">
											<span class="sfx-name" v-html="sfx.name"></span>:
											<span class="sfx-description" v-html="renderText(sfx.description)"></span>
										</li>
									</ul>
								</div>

								<!-- RIGHT HEADER (OPTIONAL VERTICAL LABEL) -->
								<div class="trait-set-header trait-set-header-right" v-if="traitSet?.custom?.cortexToolkit?.headerRight">
									<div class="trait-set-header-inner">
										<div v-html="traitSet.custom.cortexToolkit.headerRight"></div>
									</div>
								</div>
							</div>
						</template>
								</div>
							</div>
						</template>

						<!-- BUTTON: ADD TRAIT SET IN SPOTLIGHT MODE -->
						<div class="spotlight-add-set-bar" v-if="submode === 'edit'">
							<button type="button" class="btn-spotlight-add" @click.stop="addTraitSet('left', pageIndex, 1)">
								<i class="fas fa-plus"></i> Col 1 Set
							</button>
							<button type="button" class="btn-spotlight-add" v-if="columnCount === 3" @click.stop="addTraitSet('center', pageIndex, 1)">
								<i class="fas fa-plus"></i> Col 2 Set
							</button>
							<button type="button" class="btn-spotlight-add" @click.stop="addTraitSet('right', pageIndex, 1)">
								<i class="fas fa-plus"></i> {{ columnCount === 3 ? 'Col 3' : 'Col 2' }} Set
							</button>
							<button type="button" class="btn-spotlight-add span-full-btn" @click.stop="addTraitSet('left', pageIndex, columnCount)">
								<i class="fas fa-arrows-alt-h"></i> Full Width Set (Span {{ columnCount }})
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
								<div
									v-if="portrait?.url"
									class="portrait-small-image"
									:class="'portrait-alignment-' + (portrait?.custom?.cortexToolkit?.alignment || 'top-center')"
									:style="'background-image: url(' + portrait.url + ');'"
								></div>
								<div v-else class="portrait-small-placeholder">
									<i class="fas fa-user"></i>
								</div>
							</div>

							<!-- CLASSIC PORTRAIT & HALO (PAGE 1 RIGHT ONLY) -->
							<div :class="{ 'portrait': true, 'portrait-standalone': !hasAttributesRing }" v-if="pageIndex === 1 && pageLocation === 'right' && shouldShowClassicPortrait()">

								<div :class="{ 'portrait-inner': true, 'selected': isSelected(['portrait']) }"
									@click.stop="selectElement([ 'portrait' ])"
								>
									<div :class="'portrait-circle portrait-alignment-' + (portrait?.custom?.cortexToolkit?.alignment || 'top-center')" width="100%" height="100%" :style="'background-image: url(' + (portrait?.url || '') + ');'">
										<div class="portrait-placeholder" v-if="!portrait?.url?.length"><i class="fas fa-user"></i></div>
									</div>
								</div>

								<!-- ATTRIBUTES GRID (HALO OVERLAY) -->
								<div class="attributes-grid" v-if="hasAttributesRing && attributesID > -1">

									<div class="attribute-curve"
										:style="getAttributeCurveStyle()"
										@mousedown="startHaloDrag($event, 'traits')"
										@touchstart="startHaloDrag($event, 'traits')"
										v-if="attributes.length >= 2"
									>
										<svg viewBox="0 0 100 100" width="100%" height="100%" style="overflow: visible; pointer-events: none;">
											<path :d="getAttributeCurvePath()" stroke="transparent" stroke-width="12mm" fill="transparent" vector-effect="non-scaling-stroke" style="pointer-events: stroke; cursor: grab;" />
										</svg>

									</div>

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
													:class="'die-' + (attribute.value || 8)"
													v-html="renderDieValue(attribute.value)"
												></span>

												<div class="attribute-name"
													:style="getAttributeNameStyle( a )"
													v-html="attribute.name"
												></div>

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
									v-if="pageLocation === 'right'"
								>
									<div class="preview-button-container-inner" v-show="submode === 'edit'">
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
								
							<!-- TRAIT SETS -->
							<template v-for="(traitSet, s) in traitSets" :key="s">
							
							<div :class="getTraitSetClasses(traitSet)"
								v-if="s !== attributesID && ((traitSet.custom?.cortexToolkit?.page || 1) === pageIndex) && getTraitSetColumn(traitSet) === pageLocation"
							>

								<div class="trait-set-header">

									<transition appear>
										<div :class="{'trait-set-header-inner': true, 'selected': isSelected(['traitSet', s])}"
											@click.stop="selectElement([ 'traitSet', s ])"
										>
											<div v-html="traitSet.name"></div>
										</div>
									</transition>

									<transition name="editor" appear>
										<trait-set-editor
											:character="character"
											:open="isSelected(['traitSet', s])"
											v-show="submode === 'edit' && isSelected(['traitSet', s])"
											:traitSetID="s"
											:viewY="viewY"
											@selectElement="selectElement"
											@updateCharacter="updateCharacter"
											@removeTraitSet="removeTraitSet"
										></trait-set-editor>
									</transition>

								</div>

								<div class="trait-set-body">

									<!-- IMAGE STYLE -->
									<div class="trait-image-body"
										v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'image'"
										@click.stop="selectElement([ 'traitSet', s ])"
										title="Click to edit image settings"
									>
										<div class="image-set-container" :style="getImageSetContainerStyle(traitSet)">
											<div
												v-if="traitSet?.custom?.cortexToolkit?.imageConfig?.url"
												class="image-set-graphic"
												:class="'portrait-alignment-' + (traitSet?.custom?.cortexToolkit?.imageConfig?.alignment || 'center')"
												:style="getImageSetGraphicStyle(traitSet)"
											></div>
											<div v-else class="image-set-placeholder">
												<i class="fas fa-image"></i>
												<span>Click to add illustration or image</span>
											</div>
											<div class="image-set-caption" v-if="traitSet?.custom?.cortexToolkit?.imageConfig?.caption">
												{{ traitSet.custom.cortexToolkit.imageConfig.caption }}
											</div>
										</div>
									</div>

									<!-- NOTES STYLE -->
									<div class="trait-notes-body"
										v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'notes'"
										@click.stop="selectElement([ 'traitSet', s ])"
									>
										<div class="notes-content" v-html="renderNotesText(traitSet?.custom?.cortexToolkit?.notes || traitSet?.description || 'Click to edit notes...')"></div>
									</div>

									<!-- PIPS STYLE (XP / TRACK) -->
									<div class="trait-pips-body"
										v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'pips'"
										@click.stop="submode === 'edit' ? selectElement([ 'traitSet', s ]) : null"
									>
										<div class="pips-track-container" :class="{ 'connected': getPipConfig(traitSet).connected }">
											<div
												v-for="rowIdx in getPipRowCount(traitSet)"
												:key="'prow-' + rowIdx"
												class="pip-row"
											>
												<div class="pip-row-line" v-if="getPipConfig(traitSet).connected"></div>
												<div
													v-for="colIdx in getPipRowCols(traitSet, rowIdx)"
													:key="'pcol-' + colIdx"
													class="pip-bubble-wrap"
													@click.stop="handlePipClick(s, getPipIndex(traitSet, rowIdx, colIdx))"
													:title="submode === 'play' ? ('XP: ' + (getPipIndex(traitSet, rowIdx, colIdx) + 1)) : ''"
												>
													<div
														class="pip-bubble"
														:class="{ 'filled': isPipFilled(traitSet, getPipIndex(traitSet, rowIdx, colIdx)) }"
													></div>
												</div>
											</div>
										</div>
									</div>

									<!-- SESSION RECORD / ANGLED LINES STYLE -->
									<div class="trait-session-record-body"
										v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'session-record' || traitSet?.custom?.cortexToolkit?.style?.body === 'angled-lines'"
										@click="submode === 'edit' ? selectElement([ 'traitSet', s ]) : null"
									>
										<svg
											class="session-record-svg"
											:viewBox="'0 0 260 ' + (55 + (getSessionRecordCount(traitSet) - 1) * 28 + 25)"
											preserveAspectRatio="xMidYMin meet"
										>
											<line
												x1="24"
												y1="55"
												x2="24"
												:y2="55 + (getSessionRecordCount(traitSet) - 1) * 28"
												class="session-spine"
											/>

											<g
												v-for="item in getSessionRecordItems(traitSet)"
												:key="'srec-' + item.index"
												class="session-record-row"
												:class="{ 'filled': item.isFilled, 'selected': isSelected(['trait', s, item.index]) }"
											>
												<line
													x1="30.5"
													:y1="55 + item.index * 28"
													x2="252"
													:y2="(55 + item.index * 28) - 56"
													class="session-line"
													@click.stop="handleSessionLineClick(s, item.index)"
												/>

												<circle
													cx="24"
													:cy="55 + item.index * 28"
													r="6.5"
													class="session-bubble"
													:class="{ 'filled': item.isFilled }"
													@click.stop="handleSessionBubbleClick(s, item.index)"
													:title="submode === 'play' ? (item.isFilled ? 'Uncheck' : 'Check') : 'Click to toggle'"
												/>

												<text
													v-if="item.name && (!printBlank || submode !== 'print')"
													:transform="'translate(36, ' + ((55 + item.index * 28) - 4) + ') rotate(-14.2)'"
													class="session-label"
													@click.stop="handleSessionLineClick(s, item.index)"
												>
													{{ item.name }}
												</text>
											</g>
										</svg>

										<transition name="editor" appear>
											<trait-editor
												v-if="editing && editing[0] === 'trait' && editing[1] === s"
												:character="character"
												:open="isSelected(['trait', s, editing[2]])"
												v-show="submode === 'edit' && isSelected(['trait', s, editing[2]])"
												:traitSetID="s"
												:traitID="editing[2]"
												:viewY="viewY"
												@selectElement="selectElement"
												@updateCharacter="updateCharacter"
												@removeTrait="removeTrait"
											></trait-editor>
										</transition>
									</div>

									<div class="trait-list" :class="{ 'trait-list-unrated': traitSet?.custom?.cortexToolkit?.style?.body === 'list' }" v-else>
										<!-- SHARED HINDER BANNER (COMPACT DISTINCTIONS) -->
										<div
											class="distinctions-shared-hinder"
											v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions' && traitSet?.custom?.cortexToolkit?.sharedHinder"
										>
											<span class="hinder-bullet">•</span>
											<span class="hinder-label">Hinder:</span>
											<span class="hinder-text" v-html="renderText(getSharedHinderText(traitSet))"></span>
										</div>

										<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="t">
											<div :class="getTraitClasses(item.trait)">

												<transition name="trait" appear>
													<div :class="{ 'trait-inner': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
														@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null"
													>

														<h2 class="trait-title">

															<span class="list-bullet" v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'list'">•</span>

															<span
																class="distinction-die"
																v-if="isSpotlightPrintStyle && traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions'"
																v-html="renderDieValueForPrint(item.trait.value || 8, !printBlank && !item.isPlaceholder && item.trait.value > 0)"
															></span>

															<!-- TRAIT NAME -->
															<span class="trait-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name" v-html="item.trait.name"></span>
															<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder">
																<template v-if="item.trait.name && item.trait.name.endsWith(':') && !item.isPlaceholder">
																	{{ item.trait.name }} <span class="trait-blank-line"></span>
																</template>
																<template v-else-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
																	{{ item.trait.name }}
																</template>
																<template v-else>
																	<span class="trait-blank-line"></span>
																</template>
															</span>
															<span class="trait-name" v-else v-html="item.trait.name || ''"></span>
														
															<!-- STRESS VALUE TRACK -->
															<div class="trait-value stress-value" v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'stress'">
																<span
																	v-for="size in getTraitSetRatings(traitSet)"
																	:key="size"
																	:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
																	@click.stop="!printBlank && !item.isPlaceholder ? handleStressClick(s, item.originalIndex, size) : null"
																	v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"
																></span>
																<span v-if="shouldShowStressOut(traitSet)" :class="{ 'stress-out-badge': true, 'active': !printBlank && !item.isPlaceholder && isStressOut(item.trait) }" @click.stop="!printBlank && !item.isPlaceholder ? handleStressOutClick(s, item.originalIndex) : null" title="Out">💥 OUT</span>
															</div>

															<!-- LIST STYLE: NO VALUE -->
															<div class="trait-value" v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'list'"></div>

															<!-- DISTINCTIONS STYLE IN SPOTLIGHT: VALUE IS IN TITLE -->
															<div class="trait-value" v-else-if="isSpotlightPrintStyle && traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions'"></div>

															<!-- MULTI-DIE TRAIT -->
															<div class="trait-value multidie-value" v-else-if="isMultiDieTrait(traitSet, item.trait)">
																<div
																	v-for="(dieSize, dIdx) in (printBlank || item.isPlaceholder ? getTraitSetRatings(traitSet) : getTraitDice(item.trait))"
																	:key="dIdx"
																	class="multidie-badge-wrap"
																	:class="{ 'spent': !printBlank && !item.isPlaceholder && isDieSpent(item.trait, dIdx) }"
																>
																	<span
																		:class="{ 'c active': !isSpotlightPrintStyle && !printBlank && !item.isPlaceholder }"
																		@click.stop="!printBlank && !item.isPlaceholder ? handleDieClick(item.trait, dieSize, dIdx, traitSet, s, item.originalIndex) : null"
																		:title="submode === 'play' && !printBlank && !item.isPlaceholder ? 'Click to add d' + dieSize + ' to roller pool' : ''"
																		v-html="renderDieValueForPrint(dieSize, !printBlank && !item.isPlaceholder)"
																	></span>
																	<div class="die-play-controls" v-if="submode === 'play' && !printBlank && !item.isPlaceholder">
																		<button type="button" class="btn-play-spend" @click.stop="toggleDieSpentInPlay(s, item.originalIndex, dIdx)" :title="isDieSpent(item.trait, dIdx) ? 'Restore die' : 'Spend die'">
																			<i :class="isDieSpent(item.trait, dIdx) ? 'fas fa-rotate-left' : 'fas fa-xmark'"></i>
																		</button>
																	</div>
																</div>
															</div>

															<!-- STANDARD SINGLE-DIE TRAIT -->
															<div class="trait-value single-die-value" v-else @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
																<span
																	v-for="size in getTraitSetRatings(traitSet)"
																	:key="size"
																	:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
																	v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"
																></span>
															</div>

														</h2>

														<div
															class="trait-description"
															v-if="traitSet?.custom?.cortexToolkit?.features?.description"
														>
															<div v-if="!printBlank && !item.isPlaceholder && item.trait.description" v-html="renderText(item.trait.description)"></div>
															<div class="desc-blank-area" v-else-if="printBlank || item.isPlaceholder">
																<div class="desc-blank-line"></div>
															</div>
														</div>

														<ul class="subtraits" v-if="traitSet?.custom?.cortexToolkit?.features?.subtraits && (item.trait.traits?.length || printBlank)">
															<li class="subtrait" v-for="(subtrait, u) in (item.trait.traits?.length ? item.trait.traits : (printBlank ? [{ name: '', value: 0 }] : []))" :key="u" @click.stop="!printBlank ? handleSingleDieClick(subtrait, subtrait.value, traitSet, s, item.originalIndex) : null">

																<span class="subtrait-name" v-if="!printBlank && subtrait.name"
																	v-html="subtrait.name"
																></span>
																<span class="subtrait-name" v-else-if="printBlank">
																	<span class="trait-blank-line subtrait-blank-line"></span>
																</span>
															
																<div class="subtrait-value">
																	<span
																		v-for="size in getSubtraitRatings(traitSet)"
																		:key="size"
																		:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && subtrait.value === size }"
																		v-html="renderDieValueForPrint(size, !printBlank && subtrait.value === size)"
																	></span>
																</div>

															</li>
														</ul>

														<!-- COMPACT SFX SLOT FOR DISTINCTIONS WITH SHARED HINDER -->
														<div class="distinction-sfx-slot" v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions' && traitSet?.custom?.cortexToolkit?.sharedHinder">
															<div class="distinction-sfx-badge">SFX</div>
															<div class="distinction-sfx-line">
																<span class="sfx-bullet">•</span>
																<span class="sfx-prefix">SFX:</span>
																<span class="sfx-content" v-if="!printBlank && getDistinctionSfxText(item.trait)" v-html="renderText(getDistinctionSfxText(item.trait))"></span>
																<span class="sfx-blank-line" v-else-if="printBlank"></span>
																<span class="sfx-placeholder-hint" v-else-if="submode === 'edit'" @click.stop="selectElement(['trait', s, item.originalIndex])">Click to set SFX...</span>
																<span class="sfx-blank-line" v-else></span>
															</div>
														</div>

														<ul class="trait-sfx" v-else-if="traitSet?.custom?.cortexToolkit?.features?.sfx && ( item.trait.sfx?.length || (printBlank && traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions') )">
															<li v-for="(sfx, sfIdx) in (item.trait.sfx?.length ? item.trait.sfx : (printBlank ? ['hinder'] : []))" :key="sfIdx">

																<template v-if="sfx === 'hinder'">

																	<span class="trait-sfx-name">Hinder</span>:

																	<span class="trait-sfx-description"
																		v-html="renderText('Gain a PP when you switch out this ' + ( traitSet.nounSingular && traitSet.nounSingular.length ? traitSet.nounSingular.toLowerCase() : 'trait' ) + '’s d' + (item.trait.value || 8) + ' for a d4.')"
																	></span>

																</template>

																<template v-else>

																	<span class="trait-sfx-name"
																		v-html="sfx.name"
																	></span>:

																	<span class="trait-sfx-description"
																		v-html="renderText(sfx.description)"
																	></span>

																</template>

															</li>
														</ul>

													</div>
												</transition>

												<transition name="editor" appear>
													<trait-editor
														v-if="!item.isPlaceholder"
														:character="character"
														:open="isSelected(['trait', s, item.originalIndex])"
														v-show="submode === 'edit' && isSelected(['trait', s, item.originalIndex])"
														:traitSetID="s"
														:traitID="item.originalIndex"
														:viewY="viewY"
														@selectElement="selectElement"
														@updateCharacter="updateCharacter"
														@removeTrait="removeTrait"
													></trait-editor>
												</transition>

											</div>
										</template>

									</div> <!-- .trait-list -->

									<!-- BUTTON: ADD TRAIT -->
									<transition appear>
									<div class="preview-button-container"
										v-show="submode === 'edit'"
									>
										<div class="preview-button-container-inner">
											<div class="preview-button"
												@click.stop="addTrait( s )"
											>
												<span><i class="fas fa-plus"></i> {{ traitSet.nounSingular && traitSet.nounSingular.length ? traitSet.nounSingular : 'Trait' }}</span>
											</div>
										</div>
									</div>
									</transition>

									<ul class="sfx" v-if="traitSet.custom.cortexToolkit.features.sfx && traitSet.sfx.length">
										<li v-for="(sfx, s) in traitSet.sfx">

											<span class="sfx-name"
												v-html="sfx.name"
											></span>:

											<span class="sfx-description"
												v-html="renderText(sfx.description)"
											></span>

										</li>
									</ul>

								</div> <!-- .traits -->

							</div>
							</template>

							<!-- BUTTON: ADD TRAIT SET -->
							<transition appear>
							<div class="preview-button-container"
								v-show="submode === 'edit'"
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

					<!-- FOOTER (PRINT SUBMODE) -->
					<footer class="spotlight-page-footer" v-if="submode === 'print'">
						<span class="pencil-note">For best results, use pencil.</span>
						<span class="page-num" v-if="pageCount > 1">Page {{ pageIndex }} of {{ pageCount }}</span>
					</footer>

				</div> <!-- .page-inner -->
			</div> <!-- .page -->
		</div> <!-- .pages -->
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

		renderDieValueForPrint( size, isActive = false ) {
			if ( this.isSpotlightPrintStyle ) {
				const isFilled = this.printBlank ? false : Boolean( isActive );
				return cortexFunctions.renderDieconSVG( size, isFilled, '', this.character?.custom?.cortexToolkit?.diceConfig );
			}
			return this.renderDieValue( size );
		},

		getTraitSetSlotCount( traitSet ) {
			const custom = traitSet?.custom?.cortexToolkit;
			const bodyStyle = custom?.style?.body;
			if ( bodyStyle === 'notes' || bodyStyle === 'image' || bodyStyle === 'session-record' || bodyStyle === 'angled-lines' ) return 0;

			const configured = custom?.reservedSlots ?? custom?.blankSlots;
			if ( configured !== undefined && configured !== null && configured !== '' ) {
				return Math.max( Number(configured) || 0, (traitSet.traits || []).length );
			}

			// Backwards compatibility: fallback to current traits length
			return (traitSet.traits || []).length;
		},

		getRenderedTraits( traitSet, s ) {
			const existing = traitSet?.traits || [];
			const isPrintMode = this.submode === 'print' || this.designerPrintPreview;

			if ( !isPrintMode ) {
				return existing.map((t, idx) => ({ trait: t, originalIndex: idx, isPlaceholder: false }));
			}

			// In print mode or designer print preview:
			if ( this.printBlank ) {
				const targetCount = this.getTraitSetSlotCount( traitSet );
				const list = [];
				for ( let i = 0; i < targetCount; i++ ) {
					if ( i < existing.length ) {
						list.push({ trait: existing[i], originalIndex: i, isPlaceholder: false });
					} else {
						list.push({
							trait: this.createBlankSlotTrait( traitSet ),
							originalIndex: null,
							isPlaceholder: true
						});
					}
				}
				return list;
			}

			// Filled sheet print version: render existing traits PLUS any reserved blank slots!
			const reserved = Number( traitSet?.custom?.cortexToolkit?.reservedSlots );
			const targetCount = (!isNaN(reserved) && reserved > 0) ? Math.max(reserved, existing.length) : existing.length;
			const list = existing.map((t, idx) => ({ trait: t, originalIndex: idx, isPlaceholder: false }));
			for ( let i = existing.length; i < targetCount; i++ ) {
				list.push({
					trait: this.createBlankSlotTrait( traitSet ),
					originalIndex: null,
					isPlaceholder: true
				});
			}
			return list;
		},

		createBlankSlotTrait( traitSet ) {
			const hasSubtraits = Boolean( traitSet?.custom?.cortexToolkit?.features?.subtraits );
			const isDistinction = traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions';
			return {
				name: '',
				value: 0,
				dice: [],
				description: '',
				traits: hasSubtraits ? [{ name: '', value: 0, dice: [] }] : [],
				sfx: isDistinction ? ['hinder'] : [],
				tags: [],
				custom: {}
			};
		},

		isFixedSystemTrait( traitSet, trait ) {
			if ( !trait || !trait.name ) return false;
			const name = trait.name.trim();
			if ( name.endsWith(':') ) return false;
			const tsBody = traitSet?.custom?.cortexToolkit?.style?.body;
			const tsName = (traitSet?.name || '').toLowerCase();
			if ( tsBody === 'attributes' || tsBody === 'stress' ||
			     tsName.includes('attribute') || tsName.includes('value') ||
			     tsName.includes('drive') || tsName.includes('role') ||
			     tsName.includes('affiliation') || tsName.includes('branch') ||
			     traitSet?.custom?.cortexToolkit?.traitColumns > 1 ||
			     Boolean(traitSet?.custom?.cortexToolkit?.attachedStress?.enabled) ) {
				return true;
			}
			return false;
		},

		getTraitSetColumn( traitSet ) {
			let loc = traitSet?.custom?.cortexToolkit?.location;
			if ( !loc || loc === 'attributes' ) {
				return 'left';
			}
			return loc;
		},

		shouldShowClassicPortrait() {
			if ( this.isSpotlightStyle ) return false;
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

		getSpotlightSections( pageIndex ) {
			const maxCols = this.columnCount;
			const pageSets = [];
			(this.traitSets || []).forEach( ( traitSet, s ) => {
				const page = traitSet.custom?.cortexToolkit?.page || 1;
				if ( page === pageIndex ) {
					pageSets.push({ traitSet, index: s });
				}
			});

			const sections = [];
			let currentCols = null;

			pageSets.forEach( item => {
				const colSpan = Number( item.traitSet?.custom?.cortexToolkit?.colSpan ?? item.traitSet?.custom?.cortexToolkit?.columnSpan ) || 1;
				const isFullWidth = ( colSpan >= maxCols || item.traitSet?.custom?.cortexToolkit?.colSpan === 'full' || item.traitSet?.custom?.cortexToolkit?.columnSpan === 'full' );

				if ( isFullWidth ) {
					if ( currentCols ) {
						sections.push( currentCols );
						currentCols = null;
					}
					sections.push({
						type: 'full-width',
						itemsByColumn: {
							full: [ item ]
						}
					});
				} else {
					if ( !currentCols ) {
						currentCols = {
							type: 'columns',
							itemsByColumn: maxCols === 3 ? { left: [], center: [], right: [] } : { left: [], right: [] }
						};
					}
					const loc = item.traitSet?.custom?.cortexToolkit?.location;
					if ( maxCols === 3 ) {
						if ( loc === 'center' || loc === 'middle' || loc === 2 ) {
							currentCols.itemsByColumn.center.push( item );
						} else if ( loc === 'right' || loc === 3 ) {
							currentCols.itemsByColumn.right.push( item );
						} else {
							currentCols.itemsByColumn.left.push( item );
						}
					} else {
						if ( loc === 'right' || loc === 2 ) {
							currentCols.itemsByColumn.right.push( item );
						} else {
							currentCols.itemsByColumn.left.push( item );
						}
					}
				}
			});

			if ( currentCols ) {
				sections.push( currentCols );
			}

			return sections;
		},

		getTraitSetGridStyle( traitSet ) {
			if ( !this.isSpotlightStyle ) return {};
			const colSpan = Number(traitSet?.custom?.cortexToolkit?.colSpan ?? traitSet?.custom?.cortexToolkit?.columnSpan) || 1;
			const maxCols = this.columnCount;
			if ( colSpan >= maxCols || traitSet?.custom?.cortexToolkit?.colSpan === 'full' || traitSet?.custom?.cortexToolkit?.columnSpan === 'full' ) {
				return { gridColumn: '1 / -1' };
			}
			if ( colSpan === 2 && maxCols === 3 ) {
				const loc = traitSet?.custom?.cortexToolkit?.location;
				if ( loc === 'right' ) {
					return { gridColumn: '2 / span 2' };
				}
				return { gridColumn: '1 / span 2' };
			}
			const loc = traitSet?.custom?.cortexToolkit?.location;
			if ( maxCols === 3 ) {
				if ( loc === 'center' || loc === 'middle' || loc === 2 ) return { gridColumn: '2' };
				if ( loc === 'right' || loc === 3 ) return { gridColumn: '3' };
				return { gridColumn: '1' };
			}
			if ( loc === 'right' || loc === 2 ) return { gridColumn: '2' };
			return { gridColumn: '1' };
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

		getImageSetContainerStyle( traitSet ) {
			const h = traitSet?.custom?.cortexToolkit?.imageConfig?.height;
			if ( h && h !== 'auto' ) {
				return { height: h };
			}
			return { minHeight: '140px', height: 'auto' };
		},

		getImageSetGraphicStyle( traitSet ) {
			const url = traitSet?.custom?.cortexToolkit?.imageConfig?.url;
			if ( !url ) return {};
			const escaped = url.replace(/"/g, '\\"');
			return {
				backgroundImage: `url("${escaped}")`,
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat'
			};
		},

		getTraitClasses( trait ) {

			let classes = {
				'trait': true
			}

			if ( trait?.description?.length ) {
				classes['trait-has-description'] = true;
			}

			if ( trait?.sfx?.length ) {
				classes['trait-has-sfx'] = true;
			}

			if ( trait?.traits?.length ) {
				classes['trait-has-subtraits'] = true;
			}

			return classes;

		},

		getAttributeCurveStyle() {
			return `display: ${this.attributes.length >= 2 ? 'block' : 'none'};`;
		},

		getAttributeCurvePath() {
			if ( this.attributes.length < 2 ) return '';
			const cfg = this.haloConfig;
			const Xc = 50;
			const Yc = 50;
			const arcDistanceUnits = (cfg.arcDistance ?? 0) * (100 / 84);
			const R = 50 + arcDistanceUnits;

			const centerAngle = 90 + (cfg.arcAngle ?? -90);
			const spreadFactor = (cfg.arcSpread ?? 100) / 100;
			const totalSpan = 85 * spreadFactor;

			const padAngle = (8 / (R * 0.84)) * (180 / Math.PI);
			const startAngle = centerAngle - (totalSpan / 2) - padAngle;
			const endAngle = centerAngle + (totalSpan / 2) + padAngle;

			const a1 = startAngle * Math.PI / 180;
			const a2 = endAngle * Math.PI / 180;

			const x1 = Xc + R * Math.cos(a1);
			const y1 = Yc + R * Math.sin(a1);
			const x2 = Xc + R * Math.cos(a2);
			const y2 = Yc + R * Math.sin(a2);

			let diff = endAngle - startAngle;
			while ( diff < 0 ) diff += 360;
			const largeArc = diff > 180 ? 1 : 0;

			return `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`;
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
			const sin = Math.sin(rad);

			// Radial distance gap from die center to label anchor
			const distMm = 6;
			const offX = cos * distMm;
			const offY = sin * distMm;

			// Translation so label expands outward away from circle
			const transX = -50 + 50 * cos;
			const transY = -50 + 50 * sin;

			let textAlign = 'center';
			if ( cos > 0.35 ) {
				textAlign = 'left';
			} else if ( cos < -0.35 ) {
				textAlign = 'right';
			}

			return `position: absolute; left: calc(50% + ${offX.toFixed(2)}mm); top: calc(50% + ${offY.toFixed(2)}mm); transform: translate(${transX.toFixed(1)}%, ${transY.toFixed(1)}%); text-align: ${textAlign};`;
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

		addTraitSet( location, page = 1 ) {

			let character = this.character;

			let traitSet = structuredClone( cortexFunctions.defaultTraitSet );
			traitSet.custom.cortexToolkit.location = location ?? 'left';
			traitSet.custom.cortexToolkit.page = page ?? 1;
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

		getTraitDice( trait ) {
			return cortexFunctions.getTraitDice( trait );
		},

		isMultiDieTrait( traitSet, trait ) {
			if ( !traitSet?.custom?.cortexToolkit?.style?.body ) return false;
			const style = traitSet.custom.cortexToolkit.style.body;
			if ( style === 'stress' || style === 'list' || style === 'notes' ) {
				return false;
			}
			return Boolean( traitSet?.custom?.cortexToolkit?.multiDie ) || ( style === 'resources' ) || ( this.getTraitDice( trait ).length > 1 );
		},

		isResourceTrait( traitSet, trait ) {
			if ( trait?.custom?.cortexToolkit?.isResource || trait?.isResource ) return true;
			if ( !traitSet ) return false;
			const body = traitSet?.custom?.cortexToolkit?.style?.body;
			if ( body === 'resources' ) return true;
			const name = ( traitSet?.name || '' ).trim().toLowerCase();
			const nounSingular = ( traitSet?.nounSingular || '' ).trim().toLowerCase();
			const nounPlural = ( traitSet?.nounPlural || '' ).trim().toLowerCase();
			if ( name.includes( 'resource' ) || nounSingular === 'resource' || nounPlural === 'resources' ) {
				return true;
			}
			return false;
		},

		isDieSpent( trait, index ) {
			const spent = trait?.custom?.cortexToolkit?.spentDice;
			return Array.isArray( spent ) && spent.includes( index );
		},

		toggleDieSpentInPlay( s, t, index ) {
			const trait = this.character.traitSets[s].traits[t];
			if ( !trait.custom ) trait.custom = {};
			if ( !trait.custom.cortexToolkit ) trait.custom.cortexToolkit = {};
			if ( !Array.isArray( trait.custom.cortexToolkit.spentDice ) ) {
				trait.custom.cortexToolkit.spentDice = [];
			}
			const spentList = trait.custom.cortexToolkit.spentDice;
			const idx = spentList.indexOf( index );
			if ( idx !== -1 ) {
				spentList.splice( idx, 1 );
			} else {
				spentList.push( index );
			}
			this.updateCharacter( this.character );
		},

		getTraitSetRatings( traitSet ) {
			return cortexFunctions.getTraitSetRatings( traitSet );
		},

		getSubtraitRatings( traitSet ) {
			return cortexFunctions.getSubtraitRatings( traitSet );
		},

		shouldShowStressD4( traitSet ) {
			const cfg = traitSet?.custom?.cortexToolkit?.stressConfig;
			if ( cfg && typeof cfg.includeD4 === 'boolean' ) return cfg.includeD4;
			return false;
		},

		shouldShowStressOut( traitSet ) {
			const cfg = traitSet?.custom?.cortexToolkit?.stressConfig;
			if ( cfg && typeof cfg.includeOut === 'boolean' ) return cfg.includeOut;
			return true;
		},

		isStressOut( trait ) {
			return trait.value > 12 || trait.isOut === true;
		},

		handleStressClick( s, t, value ) {
			if ( this.submode === 'play' ) {
				const trait = this.character.traitSets[s].traits[t];
				if ( trait.value === value && !trait.isOut ) {
					trait.value = null;
				} else {
					trait.value = value;
					trait.isOut = false;
				}
				this.updateCharacter( this.character );
			} else {
				this.selectElement([ 'trait', s, t ]);
			}
		},

		handleStressOutClick( s, t ) {
			if ( this.submode === 'play' ) {
				const trait = this.character.traitSets[s].traits[t];
				trait.isOut = !trait.isOut;
				if ( trait.isOut ) {
					trait.value = 14;
				} else {
					trait.value = null;
				}
				this.updateCharacter( this.character );
			} else {
				this.selectElement([ 'trait', s, t ]);
			}
		},

		addTraitSetDiceToRoller( traitSet ) {
			if ( !traitSet ) return;
			const diceToAdd = [];
			const poolName = traitSet.name || this.character.name || 'Challenge Pool';
			for ( const tr of (traitSet.traits || []) ) {
				if ( Array.isArray( tr.dice ) && tr.dice.length > 0 ) {
					for ( const d of tr.dice ) {
						if ( d > 0 ) {
							diceToAdd.push({
								size: d,
								qty: 1,
								source: tr.name || poolName
							});
						}
					}
				} else if ( tr.value && tr.value > 0 ) {
					diceToAdd.push({
						size: tr.value,
						qty: 1,
						source: tr.name || poolName
					});
				}
			}
			if ( diceToAdd.length > 0 ) {
				this.$emit( 'addDieToRoller', diceToAdd );
			}
		},

		handleDieClick( trait, dieSize, dIdx, traitSet, s, t ) {
			if ( this.submode === 'play' ) {
				if ( this.isDieSpent( trait, dIdx ) ) {
					this.toggleDieSpentInPlay( s, t, dIdx );
					return;
				}
				const isChallenge = Boolean( traitSet?.custom?.cortexToolkit?.isChallengePool || traitSet?.custom?.cortexToolkit?.challengePool );
				if ( isChallenge ) {
					this.addTraitSetDiceToRoller( traitSet );
					return;
				}
				const isRes = this.isResourceTrait( traitSet, trait );
				this.$emit( 'addDieToRoller', {
					size: dieSize,
					qty: 1,
					source: trait.name,
					isResource: isRes,
					resourceType: isRes ? ( trait.name || 'Resource' ) : undefined
				});
			} else {
				this.selectElement([ 'trait', s, t ]);
			}
		},

		handleSingleDieClick( trait, value, traitSet, s, t ) {
			if ( this.submode === 'play' ) {
				if ( value ) {
					const isChallenge = Boolean( traitSet?.custom?.cortexToolkit?.isChallengePool || traitSet?.custom?.cortexToolkit?.challengePool );
					if ( isChallenge ) {
						this.addTraitSetDiceToRoller( traitSet );
						return;
					}
					const isRes = this.isResourceTrait( traitSet, trait );
					this.$emit( 'addDieToRoller', {
						size: value,
						qty: 1,
						source: trait.name,
						isResource: isRes,
						resourceType: isRes ? ( trait.name || 'Resource' ) : undefined
					});
				}
			} else {
				this.selectElement([ 'trait', s, t ]);
			}
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
			const opacity = wm.opacity !== undefined ? wm.opacity : 0.08;
			const scale = wm.scale !== undefined ? wm.scale : 75;
			return `background-image: url('${wm.url}'); opacity: ${opacity}; background-size: ${scale}%;`;
		},

		getPipConfig( traitSet ) {
			const p = traitSet?.custom?.cortexToolkit?.pips;
			return {
				count: Math.max( 1, p?.count || 25 ),
				perRow: Math.max( 1, p?.perRow || 5 ),
				connected: p?.connected !== false,
				filled: Math.max( 0, p?.filled || 0 )
			};
		},

		getPipRowCount( traitSet ) {
			const cfg = this.getPipConfig( traitSet );
			return Math.ceil( cfg.count / cfg.perRow );
		},

		getPipRowCols( traitSet, rowIdx ) {
			const cfg = this.getPipConfig( traitSet );
			const remaining = cfg.count - (rowIdx - 1) * cfg.perRow;
			return Math.min( cfg.perRow, Math.max( 0, remaining ) );
		},

		getPipIndex( traitSet, rowIdx, colIdx ) {
			const cfg = this.getPipConfig( traitSet );
			return (rowIdx - 1) * cfg.perRow + (colIdx - 1);
		},

		isPipFilled( traitSet, pipIdx ) {
			if ( this.printBlank ) return false;
			const cfg = this.getPipConfig( traitSet );
			return pipIdx < cfg.filled;
		},

		handlePipClick( traitSetIndex, pipIdx ) {
			if ( this.submode === 'print' ) return;
			const ts = this.traitSets[ traitSetIndex ];
			if ( !ts ) return;
			if ( !ts.custom ) ts.custom = {};
			if ( !ts.custom.cortexToolkit ) ts.custom.cortexToolkit = {};
			if ( !ts.custom.cortexToolkit.pips ) {
				ts.custom.cortexToolkit.pips = { count: 25, perRow: 5, connected: true, filled: 0 };
			}
			const curFilled = ts.custom.cortexToolkit.pips.filled || 0;
			if ( curFilled === pipIdx + 1 ) {
				ts.custom.cortexToolkit.pips.filled = pipIdx;
			} else {
				ts.custom.cortexToolkit.pips.filled = pipIdx + 1;
			}
			this.updateCharacter( this.character );
		},

		getSessionRecordConfig( traitSet ) {
			const srec = traitSet?.custom?.cortexToolkit?.sessionRecord;
			const reserved = traitSet?.custom?.cortexToolkit?.reservedSlots;
			const traitsLen = traitSet?.traits ? traitSet.traits.length : 0;
			const count = Math.max( 1, srec?.count || reserved || traitsLen || 20 );
			return {
				count: count
			};
		},

		getSessionRecordCount( traitSet ) {
			return this.getSessionRecordConfig( traitSet ).count;
		},

		getSessionRecordItems( traitSet ) {
			const count = this.getSessionRecordCount( traitSet );
			const traits = traitSet?.traits || [];
			const items = [];
			for ( let i = 0; i < count; i++ ) {
				const t = traits[ i ];
				const isFilled = !this.printBlank && ( Boolean( t?.custom?.checked ) || Boolean( t?.value ) );
				const name = t?.name || '';
				items.push({
					index: i,
					trait: t,
					isFilled: isFilled,
					name: name
				});
			}
			return items;
		},

		ensureSessionRecordTrait( traitSetIndex, itemIndex ) {
			const ts = this.character.traitSets?.[ traitSetIndex ];
			if ( !ts ) return null;
			if ( !ts.traits ) ts.traits = [];
			while ( ts.traits.length <= itemIndex ) {
				ts.traits.push({
					name: '',
					value: 0,
					dice: [],
					description: '',
					traits: [],
					sfx: [],
					tags: [],
					custom: {}
				});
			}
			return ts.traits[ itemIndex ];
		},

		handleSessionBubbleClick( traitSetIndex, itemIndex ) {
			if ( this.submode === 'print' ) return;
			const trait = this.ensureSessionRecordTrait( traitSetIndex, itemIndex );
			if ( !trait ) return;
			if ( !trait.custom ) trait.custom = {};
			const currentlyChecked = Boolean( trait.custom.checked || trait.value );
			trait.custom.checked = !currentlyChecked;
			trait.value = !currentlyChecked ? 1 : 0;
			this.updateCharacter( this.character );
		},

		handleSessionLineClick( traitSetIndex, itemIndex ) {
			if ( this.submode === 'print' ) return;
			this.ensureSessionRecordTrait( traitSetIndex, itemIndex );
			this.updateCharacter( this.character );
			this.selectElement([ 'trait', traitSetIndex, itemIndex ]);
		},

		getSharedHinderText( traitSet ) {
			if ( traitSet?.custom?.cortexToolkit?.sharedHinderText?.trim() ) {
				return traitSet.custom.cortexToolkit.sharedHinderText.trim();
			}
			const noun = ( traitSet?.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular.toLowerCase() : 'distinction';
			return `Gain a PP when you trade out your ${noun}'s d8 rating for a d4.`;
		},

		getDistinctionSfxText( trait ) {
			if ( !trait?.sfx || !trait.sfx.length ) return '';
			const nonHinder = trait.sfx.filter( s => s !== 'hinder' && (typeof s !== 'object' || s.name?.toLowerCase() !== 'hinder') );
			if ( !nonHinder.length ) return '';
			const first = nonHinder[0];
			if ( typeof first === 'string' ) return first;
			if ( first.name && first.description ) {
				return `${first.name}: ${first.description}`;
			}
			return first.description || first.name || '';
		},

		getSharedHinderLines( traitSet ) {
			const text = this.getSharedHinderText( traitSet );
			return text.split('\n').map(l => l.trim()).filter(Boolean);
		},

		renderHinderLine( line ) {
			let clean = line.replace(/^[•\-\*]\s*/, '');
			return this.renderText( clean );
		},

		hasAttachedStress( traitSet ) {
			return Boolean( traitSet?.custom?.cortexToolkit?.attachedStress?.enabled );
		},

		getAttachedStressLabel( traitSet ) {
			return traitSet?.custom?.cortexToolkit?.attachedStress?.label || 'Stress';
		},

		getAttachedStressScale( traitSet ) {
			return traitSet?.custom?.cortexToolkit?.attachedStress?.scale || [ 4, 6, 8, 10, 12 ];
		},

		getAttachedStressValue( trait ) {
			return trait?.custom?.stress ?? trait?.stress ?? 0;
		},

		shouldShowAttachedStressOut( traitSet ) {
			return Boolean( traitSet?.custom?.cortexToolkit?.attachedStress?.includeOut );
		},

		isAttachedStressOut( trait ) {
			return Boolean( trait?.custom?.isStressOut || (this.getAttachedStressValue(trait) > 12) );
		},

		handleAttachedStressClick( s, t, size ) {
			if ( this.submode === 'print' ) return;
			const trait = this.character.traitSets[s]?.traits?.[t];
			if ( !trait ) return;
			if ( !trait.custom ) trait.custom = {};
			const cur = trait.custom.stress ?? trait.stress ?? 0;
			trait.custom.stress = ( cur === size ) ? 0 : size;
			this.updateCharacter( this.character );
		},

		handleAttachedStressOutClick( s, t ) {
			if ( this.submode === 'print' ) return;
			const trait = this.character.traitSets[s]?.traits?.[t];
			if ( !trait ) return;
			if ( !trait.custom ) trait.custom = {};
			trait.custom.isStressOut = !trait.custom.isStressOut;
			this.updateCharacter( this.character );
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
