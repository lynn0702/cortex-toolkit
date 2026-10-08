const TraitEditor = {

	props: {
		character:  Object,
		traitSetID: Number,
		traitID:    Number,
		open:       Boolean,
		viewY:      Number,
	},

	data() {
		return {
			scrollPosition: 'none',
			anchorPosition: 'top',
			confirmDelete:  false,
		}
	},

	computed: {

		traitSet() {
			let s = this.traitSetID;
			return this.character?.traitSets?.[s];
		},

		trait() {
			let s = this.traitSetID;
			let t = this.traitID;
			return this.character?.traitSets?.[s]?.traits?.[t];
		},

		name: {
			get() {
				return this.trait?.name ?? '';
			},
			set( name ) {
				this.setProperty( 'name', name );
				if ( this.isTalentsTable && Array.isArray( this.trait?.sfx ) ) {
					const sfx = this.trait.sfx.find( e => e !== 'hinder' );
					if ( sfx && typeof sfx === 'object' ) {
						sfx.name = name;
					}
				}
			}
		},

		value: {
			get() {
				return this.trait?.value ?? 4;
			},
			set( value ) {
				this.setProperty( 'value', value );
			}
		},

		isListStyle() {
			const b = this.traitSet?.custom?.cortexToolkit?.style?.body;
			return b === 'list' || b === 'notes' || b === 'session-record' || b === 'angled-lines' || b === 'talents-table' || b === 'dossier-fields';
		},

		isStatementSet() {
			return Boolean( this.traitSet?.custom?.cortexToolkit?.statement || this.traitSet?.statement );
		},

		hasQuestionedPip() {
			return Boolean( this.traitSet?.custom?.cortexToolkit?.hasQuestionedPip || this.traitSet?.hasQuestionedPip );
		},

		isQuestioned: {
			get() {
				return Boolean( this.trait?.questioned ?? this.trait?.custom?.questioned );
			},
			set( val ) {
				this.setProperty( 'questioned', Boolean( val ) );
				if ( !this.trait.custom ) this.trait.custom = {};
				this.trait.custom.questioned = Boolean( val );
				this.updateCharacter( this.character );
			}
		},

		hasCounterColumn() {
			return Boolean( this.traitSet?.hasCounterColumn ?? this.traitSet?.custom?.cortexToolkit?.hasCounterColumn );
		},

		counterLabel() {
			return this.traitSet?.counterLabel || this.traitSet?.custom?.cortexToolkit?.counterLabel || 'XP';
		},

		counterValue: {
			get() {
				return this.trait?.xp ?? this.trait?.counter ?? this.trait?.custom?.xp ?? this.trait?.custom?.counter ?? '';
			},
			set( val ) {
				this.setProperty( 'xp', val );
				this.setProperty( 'counter', val );
				if ( !this.trait.custom ) this.trait.custom = {};
				this.trait.custom.counter = val;
				this.trait.custom.xp = val;
				this.updateCharacter( this.character );
			}
		},

		isStandingStyle() {
			return this.traitSet?.custom?.cortexToolkit?.style?.body === 'standing';
		},

		isSessionRecordStyle() {
			const b = this.traitSet?.custom?.cortexToolkit?.style?.body;
			return b === 'session-record' || b === 'angled-lines';
		},

		sessionRecordChecked: {
			get() {
				return Boolean( this.trait?.custom?.checked || this.trait?.value );
			},
			set( val ) {
				if ( !this.trait.custom ) this.trait.custom = {};
				this.trait.custom.checked = Boolean( val );
				this.trait.value = val ? 1 : 0;
				this.updateCharacter( this.character );
			}
		},

		isMultiDie() {
			return Boolean(this.traitSet?.custom?.cortexToolkit?.multiDie) || (this.traitSet?.custom?.cortexToolkit?.style?.body === 'resources') || (Array.isArray(this.trait?.dice) && this.trait.dice.length > 1);
		},

		dice() {
			return cortexFunctions.getTraitDice(this.trait);
		},

		description: {
			get() {
				return this.trait?.statement ?? this.trait?.description ?? '';
			},
			set( description ) {
				this.setProperty( 'description', description );
				this.setProperty( 'statement', description );
			}
		},

		hinder: {
			get() {
				return this.trait.sfx.includes('hinder');
			},
			set( value ) {
				this.setHinder( value );
			}
		},

		editableSFX() {
			return this.trait.sfx
			.filter( effect => effect !== 'hinder' )
			.map( effect => this.trait.sfx.indexOf(effect) );
		},

		scrollable() {
			return Boolean(
				( this.traitSet.custom.cortexToolkit.features.sfx && this.editableSFX.length > 0 && !this.isTalentsTable )
				||
				( this.traitSet.custom.cortexToolkit.features.subtraits && this.trait.traits.length > 0 )
			);
		},

		isTalentsTable() {
			return this.traitSet?.custom?.cortexToolkit?.style?.body === 'talents-table';
		},

		talentCol1Label() {
			const labels = this.traitSet?.custom?.cortexToolkit?.labels;
			if ( labels && labels.col1 ) return labels.col1;
			return ( typeof cortexFunctions !== 'undefined' ? cortexFunctions.labelDefaultForStyle( 'talents-table', 'col1' ) : 'TALENT' ) || 'TALENT';
		},

		talentCol2Label() {
			const labels = this.traitSet?.custom?.cortexToolkit?.labels;
			if ( labels && labels.col2 ) return labels.col2;
			return ( typeof cortexFunctions !== 'undefined' ? cortexFunctions.labelDefaultForStyle( 'talents-table', 'col2' ) : 'ACTIVATION' ) || 'ACTIVATION';
		},

		talentCol3Label() {
			const labels = this.traitSet?.custom?.cortexToolkit?.labels;
			if ( labels && labels.col3 ) return labels.col3;
			return ( typeof cortexFunctions !== 'undefined' ? cortexFunctions.labelDefaultForStyle( 'talents-table', 'col3' ) : 'EFFECT' ) || 'EFFECT';
		},

		talentEffect: {
			get() {
				const sfx = ( this.trait?.sfx || [] ).find( e => e !== 'hinder' );
				if ( !sfx ) return '';
				if ( typeof sfx === 'string' ) return sfx;
				return sfx.description || sfx.name || '';
			},
			set( val ) {
				if ( !Array.isArray( this.trait.sfx ) ) {
					this.trait.sfx = [];
				}
				let sfxIndex = this.trait.sfx.findIndex( e => e !== 'hinder' );
				if ( sfxIndex === -1 ) {
					this.trait.sfx.push({
						name: this.trait.name || '',
						description: val,
						tags: [],
						custom: {}
					});
				} else {
					if ( typeof this.trait.sfx[sfxIndex] === 'string' ) {
						this.trait.sfx[sfxIndex] = {
							name: this.trait.name || '',
							description: val,
							tags: [],
							custom: {}
						};
					} else {
						this.trait.sfx[sfxIndex].description = val;
						this.trait.sfx[sfxIndex].name = this.trait.name || '';
					}
				}
				this.updateCharacter( this.character );
			}
		},

		canHinderTrait() {
			if ( this.isListStyle || this.isTalentsTable ) return false;
			const body = this.traitSet?.custom?.cortexToolkit?.style?.body;
			if ( body === 'talents-table' || body === 'list' || body === 'notes' || body === 'dossier-fields' || body === 'session-record' ) {
				return false;
			}
			return Boolean( this.trait?.value > 0 || ( Array.isArray(this.trait?.dice) && this.trait.dice.length > 0 ) );
		},

		isAttributesTrait() {
			const body = this.traitSet?.custom?.cortexToolkit?.style?.body;
			return this.traitSet?.custom?.cortexToolkit?.location === 'attributes' || body === 'halo' || body === 'attributes';
		},

		isScaleDie: {
			get() {
				return Boolean(
					this.trait?.custom?.isScale ||
					(this.trait?.name && this.trait.name.trim().toLowerCase() === 'scale')
				);
			},
			set( val ) {
				if ( !this.trait.custom ) this.trait.custom = {};
				this.trait.custom.isScale = val;
				if ( val && (!this.trait.name || this.trait.name === 'New trait' || this.trait.name === 'New Attribute') ) {
					this.setProperty( 'name', 'Scale' );
				}
				this.updateCharacter( this.character );
			}
		},

		isStressSet() {
			return this.traitSet?.custom?.cortexToolkit?.style?.body === 'stress';
		},

		shouldShowStressD4() {
			if ( !this.isStressSet ) return true;
			const cfg = this.traitSet?.custom?.cortexToolkit?.stressConfig;
			if ( cfg && typeof cfg.includeD4 === 'boolean' ) return cfg.includeD4;
			return false;
		},

		shouldShowStressOut() {
			if ( !this.isStressSet ) return false;
			const cfg = this.traitSet?.custom?.cortexToolkit?.stressConfig;
			if ( cfg && typeof cfg.includeOut === 'boolean' ) return cfg.includeOut;
			return true;
		},

		isOut() {
			return Boolean( this.trait?.value > 12 || this.trait?.isOut === true );
		},

		availableValues() {
			return cortexFunctions.getTraitSetRatings( this.traitSet );
		},

		hasAttachedStress() {
			return Boolean( this.traitSet?.custom?.cortexToolkit?.attachedStress?.enabled );
		},

		attachedStressLabel() {
			return this.traitSet?.custom?.cortexToolkit?.attachedStress?.label || 'Stress';
		},

		attachedStressScale() {
			return this.traitSet?.custom?.cortexToolkit?.attachedStress?.scale || [ 4, 6, 8, 10, 12 ];
		},

		attachedStressValue: {
			get() {
				return this.trait?.custom?.stress ?? this.trait?.stress ?? 0;
			},
			set( val ) {
				if ( !this.trait.custom ) this.trait.custom = {};
				this.trait.custom.stress = val;
				this.updateCharacter( this.character );
			}
		},

		cssClass() {

			let cssClass = {
				'editor': true,
				'open': this.open,
				'scrollable': this.scrollable
			}

			cssClass[ 'anchor-position-' + this.anchorPosition ] = true;

			if ( this.parentIsFullWidth ) {
				cssClass[ 'dock-' + this.editorDock ] = true;
			}

			if ( this.scrollable ) {
				cssClass[ 'scroll-position-' + this.scrollPosition ] = true;
			}

			return cssClass;

		},

		parentColumnCount() {
			return Number( this.character?.custom?.cortexToolkit?.columns ) || 2;
		},

		parentIsBranch() {
			return this.traitSet?.custom?.cortexToolkit?.style?.body === 'skills-specialties';
		},

		branchRole: {
			get() {
				return this.trait?.custom?.cortexToolkit?.branchRole === 'specialty' ? 'specialty' : 'skill';
			},
			set( val ) {
				if ( !this.trait.custom ) this.trait.custom = {};
				if ( !this.trait.custom.cortexToolkit ) this.trait.custom.cortexToolkit = {};
				this.trait.custom.cortexToolkit.branchRole = val === 'specialty' ? 'specialty' : 'skill';
				if ( val !== 'specialty' ) {
					this.trait.custom.cortexToolkit.linkTo = null;
				}
				this.updateCharacter( this.character );
			}
		},

		branchSkillOptions() {
			const traits = this.traitSet?.traits || [];
			const opts = [];
			traits.forEach( ( tr, idx ) => {
				if ( idx === this.traitID ) return;
				if ( tr?.custom?.cortexToolkit?.branchRole === 'specialty' ) return;
				opts.push({ index: idx, name: tr?.name?.length ? tr.name : ( 'Skill ' + ( idx + 1 ) ) });
			});
			return opts;
		},

		branchLink: {
			get() {
				const v = this.trait?.custom?.cortexToolkit?.linkTo;
				return typeof v === 'number' ? v : null;
			},
			set( val ) {
				if ( !this.trait.custom ) this.trait.custom = {};
				if ( !this.trait.custom.cortexToolkit ) this.trait.custom.cortexToolkit = {};
				this.trait.custom.cortexToolkit.linkTo = ( val === null || val === undefined || val === '' ) ? null : Number(val);
				this.updateCharacter( this.character );
			}
		},

		parentIsFullWidth() {
			const span = this.traitSet?.custom?.cortexToolkit?.colSpan ?? this.traitSet?.custom?.cortexToolkit?.columnSpan;
			return span === 'full' || Number(span) >= this.parentColumnCount;
		},

		editorDock: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.editorDock === 'right' ? 'right' : 'left';
			},
			set( val ) {
				if ( !this.traitSet.custom ) this.traitSet.custom = {};
				if ( !this.traitSet.custom.cortexToolkit ) this.traitSet.custom.cortexToolkit = {};
				this.traitSet.custom.cortexToolkit.editorDock = val === 'right' ? 'right' : 'left';
				this.updateCharacter( this.character );
			}
		},

	},

	/*html*/
	template: `<aside :class="cssClass" @click.stop="">

		<div class="editor-arrow"></div>

		<div class="editor-controls">
			<button type="button" @click.stop="selectElement([])"><i class="fas fa-times"></i></button>
			<button type="button" class="editor-copy" @click.stop="duplicateTrait" title="Duplicate trait"><i class="fas fa-copy"></i></button>
			<button
				v-if="!confirmDelete"
				type="button"
				class="editor-delete"
				@click.stop="confirmDelete = true"
				title="Delete trait"
			><i class="fas fa-trash"></i></button>
			<button
				v-else
				type="button"
				class="editor-delete editor-delete-confirm"
				@click.stop="removeTrait"
				title="Click again to confirm deletion"
			><span>Confirm?</span></button>
		</div>

		<div class="editor-inner">
			<div @scroll="checkScrollPosition">
	
				<div class="editor-fields">

					<div class="editor-field" v-if="parentIsFullWidth">
						<label>Panel Position</label>
						<div class="editor-button-group">
							<button type="button" class="editor-group-btn" :class="{ active: editorDock === 'left' }" @click.stop="editorDock = 'left'">
								<i class="fas fa-arrow-left"></i> Left
							</button>
							<button type="button" class="editor-group-btn" :class="{ active: editorDock === 'right' }" @click.stop="editorDock = 'right'">
								Right <i class="fas fa-arrow-right"></i>
							</button>
						</div>
					</div>

					<template v-if="isTalentsTable">
						<div class="editor-field">
							<label>{{ talentCol1Label }}</label>
							<input type="text" v-model="name" ref="inputName" placeholder="e.g. Look, A Clue!">
						</div>

						<div class="editor-field">
							<label>{{ talentCol2Label }}</label>
							<textarea v-model="description" rows="2" placeholder="e.g. When searching for information in a test..."></textarea>
						</div>

						<div class="editor-field">
							<label>{{ talentCol3Label }}</label>
							<textarea v-model="talentEffect" rows="3" placeholder="e.g. Gain a d8 asset, even on a failure. Counts as a second asset on a success."></textarea>
						</div>
					</template>

					<div class="editor-field" v-else>
						<label>{{ isSessionRecordStyle ? 'Label / Milestone Text' : (isStandingStyle ? 'Standing Name' : 'Trait Name') }}</label>
						<input type="text" v-model="name" ref="inputName" :placeholder="isSessionRecordStyle ? 'e.g. A friendly local delivery' : (isStandingStyle ? 'e.g. Camp Director' : '')">
					</div>

					<!-- STATEMENT FIELD -->
					<div class="editor-field" v-if="isStatementSet || isStandingStyle">
						<label>Statement</label>
						<textarea v-model="description" rows="2" placeholder="e.g. I'll try anything once."></textarea>
					</div>

					<!-- QUESTIONED PIP TOGGLE -->
					<div class="editor-field" v-if="isStatementSet && hasQuestionedPip">
						<div class="editor-toggles">
							<div>
								<input
									type="checkbox"
									:id="'trait-' + traitID + '-questioned'"
									v-model="isQuestioned"
								>
							</div>
							<div>
								<label :for="'trait-' + traitID + '-questioned'">
									Questioned
								</label>
							</div>
						</div>
					</div>

					<!-- COUNTER / XP FIELD -->
					<div class="editor-field" v-if="hasCounterColumn">
						<label>{{ counterLabel }}</label>
						<input type="text" v-model="counterValue" :placeholder="counterLabel">
					</div>

					<!-- SESSION RECORD ROW CHECKBOX -->
					<div class="editor-field" v-if="isSessionRecordStyle">
						<div class="editor-toggles">
							<div>
								<input
									type="checkbox"
									:id="'trait-' + traitID + '-session-checked'"
									v-model="sessionRecordChecked"
								>
							</div>
							<div>
								<label :for="'trait-' + traitID + '-session-checked'">
									Filled / Bubbled In
								</label>
							</div>
						</div>
					</div>

					<!-- SCALE DIE TOGGLE FOR HALO ATTRIBUTES -->
					<div class="editor-field" v-if="isAttributesTrait">
						<div class="editor-toggles">
							<div>
								<input
									type="checkbox"
									:id="'trait-' + traitID + '-is-scale'"
									v-model="isScaleDie"
								>
							</div>
							<div>
								<label :for="'trait-' + traitID + '-is-scale'">
									Scale Die (inset on arc, triggers Keep 3 in roller)
								</label>
							</div>
						</div>
					</div>

					<div class="editor-field" v-if="parentIsBranch">
						<label>Branch Role</label>
						<div class="editor-button-group">
							<button type="button" class="editor-group-btn" :class="{ active: branchRole === 'skill' }" @click.stop="branchRole = 'skill'">
								<i class="fas fa-arrow-right"></i> Skill (Left)
							</button>
							<button type="button" class="editor-group-btn" :class="{ active: branchRole === 'specialty' }" @click.stop="branchRole = 'specialty'">
								Specialty (Right)
							</button>
						</div>
					</div>

					<div class="editor-field" v-if="parentIsBranch && branchRole === 'specialty'">
						<label>Connects To Skill</label>
						<select v-model="branchLink">
							<option :value="null">Unlinked (general pool)</option>
							<option v-for="opt in branchSkillOptions" :key="opt.index" :value="opt.index">{{ opt.name }}</option>
						</select>
						<span class="editor-field-hint" style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.3rem; display: block; line-height: 1.35;">Draws the connecting arrow from this specialty to any skill in the set.</span>
					</div>

					<div class="editor-field" v-if="!isListStyle">

						<label>{{ isMultiDie ? 'Dice Pool' : 'Value' }}</label>

						<!-- SINGLE DIE SELECTOR -->
						<ul class="editor-values" v-if="!isMultiDie">
							<li
								v-for="val in availableValues"
								:class="{ 'active': val === trait.value && !isOut }"
								@click.stop="toggleTraitValue( val )"
							>
								<span class="c" v-html="getDieDisplayValue(val)"></span>
							</li>
							<li
								v-if="shouldShowStressOut"
								class="editor-value-out"
								:class="{ 'active': isOut }"
								@click.stop="toggleOutValue"
								title="Out"
							>
								<span>💥 OUT</span>
							</li>
						</ul>

						<!-- MULTI DIE COUNTERS AND POOL LIST -->
						<div class="editor-multidie-container" v-else>
							<div class="editor-die-steppers">
								<div v-for="size in availableValues" :key="'stepper-' + size" class="die-stepper-item">
									<span class="c">{{ getDieDisplayValue(size) }}</span>
									<span class="stepper-label">d{{ size }}</span>
									<div class="stepper-controls">
										<button type="button" class="btn-step" @click.stop="removeDieFromTrait(size)" :disabled="getDieCount(size) === 0">-</button>
										<span class="stepper-count">{{ getDieCount(size) }}</span>
										<button type="button" class="btn-step" @click.stop="addDieToTrait(size)">+</button>
									</div>
								</div>
							</div>

							<!-- CURRENT DICE IN POOL -->
							<div class="multidie-active-list" v-if="dice.length > 0">
								<label class="sub-label">Current Dice ({{ dice.length }}):</label>
								<div class="multidie-chips">
									<div v-for="(dieSize, dIdx) in dice" :key="dIdx" class="multidie-chip">
										<span class="c">{{ getDieDisplayValue(dieSize) }}</span>
										<span class="chip-text">d{{ dieSize }}</span>
										<button type="button" class="btn-step-down" @click.stop="stepDownDieAtIndex(dIdx)" title="Step down die size">-2</button>
										<button type="button" class="btn-remove-die" @click.stop="removeDieAtIndex(dIdx)" title="Remove die">×</button>
									</div>
								</div>
							</div>
						</div>

					</div>

					<!-- ATTACHED STRESS SELECTOR -->
					<div class="editor-field" v-if="hasAttachedStress">
						<label>Attached {{ attachedStressLabel }}</label>
						<ul class="editor-values">
							<li
								:class="{ 'active': attachedStressValue === 0 }"
								@click.stop="setAttachedStress(0)"
								title="No stress"
							>
								<span style="font-size: 0.75rem; font-weight: 700;">-</span>
							</li>
							<li
								v-for="val in attachedStressScale"
								:class="{ 'active': attachedStressValue === val }"
								@click.stop="setAttachedStress(val)"
							>
								<span class="c" v-html="getDieDisplayValue(val)"></span>
							</li>
						</ul>
					</div>

					<div class="editor-field" v-if="traitSet.custom.cortexToolkit.features.description && !isTalentsTable && !isStatementSet && !isStandingStyle">
						<label>Description</label>
						<textarea v-model="description"></textarea>
					</div>

					<!-- SUBTRAITS -->
					<div class="editor-field" v-if="traitSet.custom.cortexToolkit.features.subtraits">

						<label>Subtraits</label>

						<div class="editor-subgroups">

							<transition-group appear>
								<subtrait-editor
									v-for="(subtrait, subtraitID) in trait.traits"
									:key="traitSetID + '-' + traitID + '-' + subtraitID"
									:character="character"
									:traitSetID="traitSetID"
									:traitID="traitID"
									:subtraitID="subtraitID"
									@updateCharacter="updateCharacter"
									@removeSubtrait="removeSubtrait"
								></subtrait-editor>
							</transition-group>

						</div>

						<div class="editor-button-container">
							<div class="editor-button-container-inner">
								<div class="editor-button" @click.stop="addSubtrait">
									<span><i class="fas fa-plus"></i> New Subtrait</span>
								</div>
							</div>
						</div>

					</div>

					<!-- SFX -->
					<div class="editor-field" v-if="traitSet.custom.cortexToolkit.features.sfx && !isTalentsTable">

						<label>SFX</label>

						<div class="editor-field" v-if="canHinderTrait">
							<div class="editor-toggles">
								<div><input type="checkbox" :id="'trait-' + traitSetID + '-' + traitID + '-hinder'" :true-value="true" :false-value="false" v-model="hinder"></div>
								<div><label :for="'trait-' + traitSetID + '-' + traitID + '-hinder'">Can Hinder</label></div>
							</div>
						</div>

						<div class="editor-subgroups">

							<transition-group appear>
								<sfx-editor
									v-for="effectID in editableSFX"
									:key="traitSetID + '-' + traitID + '-' + effectID"
									:character="character"
									:traitSetID="traitSetID"
									:traitID="traitID"
									:effectID="effectID"
									@updateCharacter="updateCharacter"
									@removeEffect="removeEffect"
								></sfx-editor>
							</transition-group>

						</div>

						<div class="editor-button-container">
							<div class="editor-button-container-inner">
								<div class="editor-button" @click.stop="addEffect">
									<span><i class="fas fa-plus"></i> New SFX</span>
								</div>
							</div>
						</div>

					</div>

				</div>

			</div>
		</div>

	</aside>`,

	mounted() {

		this.checkAnchorPosition();
		this.checkScrollPosition();
		window.addEventListener( 'resize', this.checkAnchorPosition );

		if ( this.open ) {
			this.focusFirstInput();
		}

	},

	unmounted() {
		window.removeEventListener( 'resize', this.checkAnchorPosition );
	},

	updated() {
		if ( this.open ) {
			this.checkAnchorPosition();
		}
	},

	watch: {

		traitID() {
			this.confirmDelete = false;
		},

		character() {
			this.checkAnchorPosition();
		},

		viewY() {
			this.checkAnchorPosition();
		},
		
		open( isOpen, wasOpen ) {
			this.confirmDelete = false;
			if ( isOpen && !wasOpen ) {
				this.focusFirstInput();
				this.$nextTick(() => {
					this.checkAnchorPosition();
					setTimeout(() => {
						this.checkAnchorPosition();
					}, 220);
				});
			} else if ( !isOpen ) {
				if ( this.$el ) {
					this.$el.style.setProperty('--editor-shift-y', '0px');
					this.$el.style.setProperty('--arrow-shift-y', '0px');
				}
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
				this.$refs.inputName.focus( { preventScroll: true } );
			}
		},
 
		setProperty( key, value ) {

			let character = this.character;
			let s = this.traitSetID;
			let t = this.traitID;

			character.traitSets[s].traits[t][ key ] = value;

			this.updateCharacter( character );

		},

		setHinder( value ) {

			let character = this.character;
			let s = this.traitSetID;
			let t = this.traitID;
			let sfx = character.traitSets[s].traits[t].sfx;

			if ( value === false && sfx.includes('hinder') ) {
				sfx.splice( sfx.indexOf('hinder'), 1 );
			} else if ( value === true && !sfx.includes('hinder') ) {
				sfx.unshift( 'hinder' );
			}

			this.updateCharacter( character );

		},

		setAttachedStress( value ) {
			let character = this.character;
			let s = this.traitSetID;
			let t = this.traitID;
			if ( !character.traitSets[s].traits[t].custom ) {
				character.traitSets[s].traits[t].custom = {};
			}
			const current = character.traitSets[s].traits[t].custom.stress ?? character.traitSets[s].traits[t].stress ?? 0;
			character.traitSets[s].traits[t].custom.stress = ( current === value ) ? 0 : value;
			this.updateCharacter( character );
		},

		getDieCount( size ) {
			return this.dice.filter( d => d === size ).length;
		},

		addDieToTrait( size ) {
			const current = [ ...this.dice, size ].sort( (a, b) => b - a );
			cortexFunctions.setTraitDice( this.trait, current );
			this.updateCharacter( this.character );
		},

		removeDieFromTrait( size ) {
			const current = [ ...this.dice ];
			const idx = current.indexOf( size );
			if ( idx !== -1 ) {
				current.splice( idx, 1 );
				cortexFunctions.setTraitDice( this.trait, current );
				this.updateCharacter( this.character );
			}
		},

		removeDieAtIndex( index ) {
			const current = [ ...this.dice ];
			if ( index >= 0 && index < current.length ) {
				current.splice( index, 1 );
				cortexFunctions.setTraitDice( this.trait, current );
				this.updateCharacter( this.character );
			}
		},

		stepDownDieAtIndex( index ) {
			const current = [ ...this.dice ];
			if ( index >= 0 && index < current.length ) {
				const currentSize = current[index];
				const sizes = [12, 10, 8, 6, 4];
				const sIdx = sizes.indexOf( currentSize );
				if ( sIdx !== -1 && sIdx < sizes.length - 1 ) {
					current[index] = sizes[sIdx + 1];
				} else {
					// Stepping down past d4 removes it
					current.splice( index, 1 );
				}
				current.sort( (a, b) => b - a );
				cortexFunctions.setTraitDice( this.trait, current );
				this.updateCharacter( this.character );
			}
		},

		toggleTraitValue( value ) {

			if ( value === this.trait.value && !this.isOut ) {
				value = null;
				this.trait.isOut = false;
				cortexFunctions.setTraitDice( this.trait, [] );
			} else {
				this.trait.isOut = false;
				cortexFunctions.setTraitDice( this.trait, [ value ] );
			}

			this.updateCharacter( this.character );

		},

		toggleOutValue() {

			if ( this.isOut ) {
				this.trait.isOut = false;
				this.trait.value = null;
				cortexFunctions.setTraitDice( this.trait, [] );
			} else {
				this.trait.isOut = true;
				this.trait.value = 14;
				cortexFunctions.setTraitDice( this.trait, [ 14 ] );
			}

			this.updateCharacter( this.character );

		},

		duplicateTrait() {

			let character = this.character;
			let s = this.traitSetID;
			let t = this.traitID;

			let clone = JSON.parse( JSON.stringify( character.traitSets[s].traits[t] ) );
			character.traitSets[s].traits.splice( t + 1, 0, clone );

			this.updateCharacter( character );
			this.selectElement([ 'trait', s, t + 1 ]);

		},

		removeTrait() {
			this.confirmDelete = false;
			this.$emit( 'removeTrait', this.traitSetID, this.traitID );
		},

		addEffect() {

			let character = this.character;
			let s = this.traitSetID;
			let t = this.traitID;

			character.traitSets[s].traits[t].sfx.push(
				structuredClone( cortexFunctions.defaultSFX )
			);

			this.updateCharacter( character );

		},

		removeEffect( effectID ) {

			let character = this.character;
			let s = this.traitSetID;
			let t = this.traitID;
			let f = effectID;

			character.traitSets[s].traits[t].sfx.splice(f, 1);

			this.updateCharacter( character );

		},

		addSubtrait() {

			let subtrait = structuredClone( cortexFunctions.defaultTrait );
			subtrait.name = 'New subtrait';
			const allowed = cortexFunctions.getSubtraitRatings( this.traitSet );
			if ( allowed.length > 0 && !allowed.includes( subtrait.value ) ) {
				subtrait.value = allowed[0];
			}

			let character = this.character;
			let s = this.traitSetID;
			let t = this.traitID;

			character.traitSets[s].traits[t].traits.push(subtrait);

			this.updateCharacter( character );

		},

		removeSubtrait( subtraitID ) {

			let character = this.character;
			let s = this.traitSetID;
			let t = this.traitID;
			let u = subtraitID;

			character.traitSets[s].traits[t].traits.splice(u, 1);

			this.updateCharacter( character );

		},

		updateCharacter( character ) {
			this.$emit( 'updateCharacter', character );
		},

		checkAnchorPosition() {
			if ( !this.$el || !this.$el.parentElement ) return;
			
			let windowHeight = (window.innerHeight || document.documentElement.clientHeight);
			let parentRect = this.$el.parentElement.getBoundingClientRect();
			let traitMidpoint = parentRect.top + (parentRect.height / 2); 

			if ( traitMidpoint < (windowHeight / 2) ) {
				this.anchorPosition = 'top';
			} else {
				this.anchorPosition = 'bottom';
			}

			this.$nextTick(() => {
				if ( !this.$el ) return;
				
				this.$el.style.setProperty('--editor-shift-y', '0px');
				this.$el.style.setProperty('--arrow-shift-y', '0px');

				let rect = this.$el.getBoundingClientRect();
				let pad = 16;
				let shiftY = 0;

				if ( rect.top < pad ) {
					shiftY = pad - rect.top;
				} else if ( rect.bottom > windowHeight - pad ) {
					shiftY = (windowHeight - pad) - rect.bottom;
				}

				if ( Math.abs(shiftY) > 0.5 ) {
					this.$el.style.setProperty('--editor-shift-y', `${shiftY}px`);
					let arrowNaturalY = (this.anchorPosition === 'bottom') ? (rect.height - 16) : 16;
					let targetArrowY = arrowNaturalY - shiftY;
					let clampedArrowY = Math.max( 16, Math.min( rect.height - 16, targetArrowY ) );
					let arrowShift = clampedArrowY - arrowNaturalY;
					this.$el.style.setProperty('--arrow-shift-y', `${arrowShift}px`);
				}
				this.checkScrollPosition();
			});
		},

		checkScrollPosition() {

			let element = this.$el.querySelector('.editor-inner > div');

			let distance = element.scrollTop;
			let max      = element.scrollHeight - element.clientHeight;

			if ( max <= 0 ) {
				this.scrollPosition = 'none';
				return;
			}

			if ( distance === 0 ) {
				this.scrollPosition = 'top';
				return;
			}

			if ( distance >= (max - 1) ) { // slight buffer 
				this.scrollPosition = 'bottom';
				return;
			}

			this.scrollPosition = 'middle';
			return;

		},

		getDieDisplayValue( value ) {
			return cortexFunctions.getDieDisplayValue( value );
		},

	}

};
