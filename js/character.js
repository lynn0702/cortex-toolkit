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
		};
	},

	computed: {

		name() {
			return this.character?.name ?? '';
		},

		description() {
			return this.character?.description ?? '';
		},

		pronouns() {
			return this.character?.pronouns ?? '';
		},

		plotPoints() {
			return Number( this.character?.plotPoints ) || 0;
		},

		portrait() {
			return this.character?.portrait ?? null;
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
			return this.haloTraitSetIndex !== -1;
		},

		attributesID() {
			return this.haloTraitSetIndex;
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
		}

	},

	/*html*/
	template: `<section :class="'character-sheet submode-' + submode">
	
		<!-- BUTTON: ADD ATTRIBUTE -->
		<transition appear>
		<div class="preview-button-container"
			v-show="submode === 'print'"
		>
			<div class="preview-button-container-inner">
				<div class="preview-button"
					@click.stop="print"
				>
					<span><i class="fas fa-print"></i> Print</span>
				</div>
				<div class="preview-button preview-button-export"
					@click.stop="exportCharacter"
				>
					<span><i class="fas fa-download"></i> Export</span>
				</div>
			</div>
		</div>
		</transition>

		<div class="pages">

			<!-- PAGE -->
			<div class="page">
				<div class="page-inner">

					<header class="page-header">

						<div :class="{'page-header-inner': true, 'selected': isSelected(['name'])}"
							@click.stop="selectElement([ 'name' ])"
						>
							<div>

								<!-- CHARACTER NAME -->
								<div class="title-container">

									<div class="title"
										v-html="name"
									></div>

									<div class="title-decoration">
										<svg height="4" width="100%"><line x1="0" y1="0" x2="10000" y2="0" style="stroke:#C50852;stroke-width:4pt"/></svg>
									</div>

								</div>

								<!-- CHARACTER DESCRIPTION -->
								<div class="character-meta">
						
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

									<div class="character-notes-summary" v-if="character.notes && character.notes.length">
										<div class="character-notes-body" v-html="renderNotesText(character.notes)"></div>
									</div>
			
								</div>

							</div>
						</div>

						<transition name="editor" appear>
							<name-editor
								:character="character"
								:open="isSelected(['name'])"
								v-show="submode === 'edit' && isSelected(['name'])"
								@selectElement="selectElement"
								@updateCharacter="updateCharacter"
							></name-editor>
						</transition>

					</header>

					<!-- COLUMNS -->
					<div class="columns">

						<div v-for="pageLocation in ['left', 'right']" :class="'column-' + pageLocation">

							<!-- PORTRAIT -->
							<div :class="{ 'portrait': true, 'portrait-standalone': !hasAttributesRing }" v-if="pageLocation === 'right'">

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
											<span class="c" v-html="renderDieValue(scaleDieValue)"></span>
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
								v-if="s !== attributesID && traitSet.custom.cortexToolkit.location === pageLocation"
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

									<!-- NOTES STYLE -->
									<div class="trait-notes-body"
										v-if="traitSet.custom.cortexToolkit.style.body === 'notes'"
										@click.stop="selectElement([ 'traitSet', s ])"
									>
										<div class="notes-content" v-html="renderNotesText(traitSet.custom.cortexToolkit.notes || traitSet.description || 'Click to edit notes...')"></div>
									</div>

									<div class="trait-list" :class="{ 'trait-list-unrated': traitSet.custom.cortexToolkit.style.body === 'list' }" v-else>

										<template v-for="(trait, t) in traitSet.traits" :key="t">
											<div :class="getTraitClasses(trait)">

												<transition name="trait" appear>
													<div :class="{ 'trait-inner': true, 'selected': isSelected(['trait', s, t]) }"
														@click.stop="selectElement([ 'trait', s, t ])"
													>

														<h2 class="trait-title">

															<span class="list-bullet" v-if="traitSet.custom.cortexToolkit.style.body === 'list'">•</span>

															<span class="trait-name"
																v-html="trait.name"
															></span>
														
															<!-- STRESS VALUE TRACK -->
															<div class="trait-value stress-value" v-if="traitSet.custom.cortexToolkit.style.body === 'stress'">
																<span
																	v-for="size in getTraitSetRatings(traitSet)"
																	:key="size"
																	:class="{ 'c': true, 'active': trait.value === size }"
																	@click.stop="handleStressClick(s, t, size)"
																	v-html="renderDieValue(size)"
																></span>
																<span v-if="shouldShowStressOut(traitSet)" :class="{ 'stress-out-badge': true, 'active': isStressOut(trait) }" @click.stop="handleStressOutClick(s, t)" title="Out">💥 OUT</span>
															</div>

															<!-- LIST STYLE: NO VALUE -->
															<div class="trait-value" v-else-if="traitSet.custom.cortexToolkit.style.body === 'list'"></div>

															<!-- MULTI-DIE TRAIT -->
															<div class="trait-value multidie-value" v-else-if="isMultiDieTrait(traitSet, trait)">
																<div
																	v-for="(dieSize, dIdx) in getTraitDice(trait)"
																	:key="dIdx"
																	class="multidie-badge-wrap"
																	:class="{ 'spent': isDieSpent(trait, dIdx) }"
																>
																	<span
																		class="c active"
																		@click.stop="handleDieClick(trait, dieSize, dIdx, traitSet, s, t)"
																		:title="submode === 'play' ? 'Click to add d' + dieSize + ' to roller pool' : ''"
																		v-html="renderDieValue(dieSize)"
																	></span>
																	<div class="die-play-controls" v-if="submode === 'play'">
																		<button type="button" class="btn-play-spend" @click.stop="toggleDieSpentInPlay(s, t, dIdx)" :title="isDieSpent(trait, dIdx) ? 'Restore die' : 'Spend die'">
																			<i :class="isDieSpent(trait, dIdx) ? 'fas fa-rotate-left' : 'fas fa-xmark'"></i>
																		</button>
																	</div>
																</div>
															</div>

															<!-- STANDARD SINGLE-DIE TRAIT -->
															<div class="trait-value single-die-value" v-else @click.stop="handleSingleDieClick(trait, trait.value, traitSet, s, t)">
																<span
																	v-for="size in getTraitSetRatings(traitSet)"
																	:key="size"
																	:class="{ 'c': true, 'active': trait.value === size }"
																	v-html="renderDieValue(size)"
																></span>
															</div>

														</h2>

														<div
															class="trait-description"
															v-if="traitSet.custom.cortexToolkit.features.description"
															v-html="renderText(trait.description)"
														></div>

														<ul class="subtraits" v-if="traitSet.custom.cortexToolkit.features.subtraits && trait.traits.length">
															<li class="subtrait" v-for="(subtrait, u) in trait.traits" :key="u" @click.stop="handleSingleDieClick(subtrait, subtrait.value, traitSet, s, t)">

																<span class="subtrait-name"
																	v-html="subtrait.name"
																></span>
															
																<div class="subtrait-value">
																	<span
																		v-for="size in getSubtraitRatings(traitSet)"
																		:key="size"
																		:class="{ 'c': true, 'active': subtrait.value === size }"
																		v-html="renderDieValue(size)"
																	></span>
																</div>

															</li>
														</ul>

														<ul class="trait-sfx" v-if="traitSet.custom.cortexToolkit.features.sfx && ( trait.sfx.length )">
															<li v-if="trait.hinder">

															</li>
															<li v-for="(sfx, s) in trait.sfx">

																<template v-if="sfx === 'hinder'">

																	<span class="trait-sfx-name">Hinder</span>:

																	<span class="trait-sfx-description"
																		v-html="renderText('Gain a PP when you switch out this ' + ( traitSet.nounSingular && traitSet.nounSingular.length ? traitSet.nounSingular.toLowerCase() : 'trait' ) + '’s d' + trait.value + ' for a d4.')"
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
														:character="character"
														:open="isSelected(['trait', s, t])"
														v-show="submode === 'edit' && isSelected(['trait', s, t])"
														:traitSetID="s"
														:traitID="t"
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
										@click.stop="addTraitSet( pageLocation )"
									>
										<span><i class="fas fa-plus"></i> Trait Set</span>
									</div>
								</div>
							</div>
							</transition>
							
						</div>

					</div> <!-- .columns -->
				</div> <!-- .page-inner -->
			</div> <!-- .page -->
		</div> <!-- .pages -->
	</section>`,

	methods: {

		// PRESENTATION

		isSelected( selector ) {
			return cortexFunctions.arraysMatch( this.editing, selector );
		},

		renderText( text ) {
			return cortexFunctions.renderText( text );
		},

		renderDieValue( value ) {
			return cortexFunctions.getDieDisplayValue( value );
		},

		getTraitSetClasses( traitSet ) {

			let classes = {
				'trait-set': true
			}

			classes[ 'trait-set-style-' + traitSet.custom.cortexToolkit.style.body ] = true;

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

		addTraitSet( location ) {

			let character = this.character;

			let traitSet = structuredClone( cortexFunctions.defaultTraitSet );
			traitSet.custom.cortexToolkit.location = location ?? 'left';
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

		print() {
			window.print();
		}

	}

}
