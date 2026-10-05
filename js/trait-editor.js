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
			return b === 'list' || b === 'notes' || b === 'session-record' || b === 'angled-lines';
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
				return this.trait.description;
			},
			set( description ) {
				this.setProperty( 'description', description );
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
				( this.traitSet.custom.cortexToolkit.features.sfx && this.editableSFX.length > 0 )
				||
				( this.traitSet.custom.cortexToolkit.features.subtraits && this.trait.traits.length > 0 )
			);
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

			if ( this.scrollable ) {
				cssClass[ 'scroll-position-' + this.scrollPosition ] = true;
			}

			return cssClass;

		}

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

					<div class="editor-field">
						<label>{{ isSessionRecordStyle ? 'Label / Milestone Text' : 'Trait Name' }}</label>
						<input type="text" v-model="name" ref="inputName" :placeholder="isSessionRecordStyle ? 'e.g. A friendly local delivery' : ''">
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

					<div class="editor-field" v-if="traitSet.custom.cortexToolkit.features.description">
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
					<div class="editor-field" v-if="traitSet.custom.cortexToolkit.features.sfx">

						<label>SFX</label>

						<div class="editor-field">
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
			this.$refs.inputName.focus();
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
