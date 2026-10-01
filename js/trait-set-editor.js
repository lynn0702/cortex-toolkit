const TraitSetEditor = {

	props: {
		character:  Object,
		traitSetID: Number,
		open:       Boolean,
		viewY:      Number,
	},

	data() {
		return {
			scrollPosition:    'none',
			anchorPosition:    'top',
			showDeleteConfirm: false,
			styleOptions: [
				{ id: 'default',              label: 'Default' },
				{ id: 'halo',                 label: 'Portrait Halo' },
				{ id: 'two-columns-compact',  label: 'Two Columns (Compact)' },
				{ id: 'two-columns-detailed', label: 'Two Columns (Detailed)' },
				{ id: 'distinctions',         label: 'Distinctions' },
				{ id: 'assets',               label: 'Assets' },
				{ id: 'resources',            label: 'Resources' },
				{ id: 'stress',               label: 'Stress' },
				{ id: 'list',                 label: 'List (Unrated)' },
				{ id: 'notes',                label: 'Notes (Text Area)' },
			]
		}
	},

	computed: {

		traitSet() {
			let s = this.traitSetID;
			return this.character?.traitSets?.[s] || null;
		},

		name: {
			get() {
				return this.traitSet?.name ?? '';
			},
			set( name ) {
				this.setProperty( 'name', name );
			}
		},

		description: {
			get() {
				return this.traitSet?.description ?? '';
			},
			set( description ) {
				this.setProperty( 'description', description );
			}
		},

		nounSingular: {
			get() {
				return this.traitSet?.nounSingular ?? '';
			},
			set( nounSingular ) {
				this.setProperty( 'nounSingular', nounSingular );
			}
		},

		nounPlural: {
			get() {
				return this.traitSet?.nounPlural ?? '';
			},
			set( nounPlural ) {
				this.setProperty( 'nounPlural', nounPlural );
			}
		},

		styleHeader: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.style?.header ?? 'default';
			},
			set( value ) {
				this.setStyle( 'header', value );
			}
		},

		styleBody: {
			get() {
				const body = this.traitSet?.custom?.cortexToolkit?.style?.body;
				if ( body === 'halo' || body === 'attributes' ) {
					return 'halo';
				}
				// Backwards compatibility: default Attributes trait set to Halo when no style (or default) is specified
				if ( !body || body === 'default' ) {
					if ( this.traitSet?.custom?.cortexToolkit?.location === 'attributes' ||
						( this.isAttributesSet && this.traitSet?.custom?.cortexToolkit?.attributesRing !== false ) ) {
						return 'halo';
					}
				}
				return body || 'default';
			},
			set( value ) {
				if ( value === 'halo' ) {
					// 1. Unset halo on any other trait sets in this character
					this.character.traitSets.forEach( (ts, idx) => {
						if ( idx !== this.traitSetID ) {
							const tsBody = ts.custom?.cortexToolkit?.style?.body;
							if ( tsBody === 'halo' || tsBody === 'attributes' || ts.custom?.cortexToolkit?.location === 'attributes' || ts.custom?.cortexToolkit?.attributesRing ) {
								if ( !ts.custom ) ts.custom = {};
								if ( !ts.custom.cortexToolkit ) ts.custom.cortexToolkit = {};
								if ( !ts.custom.cortexToolkit.style ) ts.custom.cortexToolkit.style = {};
								ts.custom.cortexToolkit.style.body = 'default';
								ts.custom.cortexToolkit.style.header = 'default';
								ts.custom.cortexToolkit.location = 'right';
								ts.custom.cortexToolkit.attributesRing = false;
							}
						}
					});

					// 2. Set halo on this trait set
					if ( !this.traitSet.custom ) this.traitSet.custom = {};
					if ( !this.traitSet.custom.cortexToolkit ) this.traitSet.custom.cortexToolkit = {};
					if ( !this.traitSet.custom.cortexToolkit.style ) this.traitSet.custom.cortexToolkit.style = {};
					this.traitSet.custom.cortexToolkit.style.body = 'halo';
					this.traitSet.custom.cortexToolkit.style.header = 'halo';
					this.traitSet.custom.cortexToolkit.location = 'attributes';
					this.traitSet.custom.cortexToolkit.attributesRing = true;
					this.traitSet.custom.cortexToolkit.isAttributes = true;
				} else {
					if ( !this.traitSet.custom ) this.traitSet.custom = {};
					if ( !this.traitSet.custom.cortexToolkit ) this.traitSet.custom.cortexToolkit = {};
					if ( !this.traitSet.custom.cortexToolkit.style ) this.traitSet.custom.cortexToolkit.style = {};
					this.traitSet.custom.cortexToolkit.style.body = value;
					this.traitSet.custom.cortexToolkit.style.header = value;
					if ( this.traitSet.custom.cortexToolkit.location === 'attributes' ) {
						this.traitSet.custom.cortexToolkit.location = 'right';
					}
					this.traitSet.custom.cortexToolkit.attributesRing = false;
				}
				this.updateCharacter( this.character );
			}
		},

		isHalo() {
			return this.styleBody === 'halo';
		},

		isAttributesSet() {
			return Boolean(
				this.traitSet?.custom?.cortexToolkit?.location === 'attributes' ||
				this.traitSet?.custom?.cortexToolkit?.isAttributes ||
				this.traitSet?.custom?.cortexToolkit?.style?.body === 'attributes' ||
				this.traitSet?.custom?.cortexToolkit?.style?.body === 'halo' ||
				this.traitSet?.nounSingular?.toLowerCase() === 'attribute' ||
				this.traitSet?.name?.trim().toLowerCase() === 'attributes'
			);
		},

		attributesRing: {
			get() {
				return this.isHalo;
			},
			set( value ) {
				this.styleBody = value ? 'halo' : 'default';
			}
		},

		columnLocation() {
			return this.traitSet?.custom?.cortexToolkit?.location === 'right' ? 'right' : 'left';
		},

		canMoveUp() {
			let s = this.traitSetID;
			let col = this.columnLocation;
			for (let i = s - 1; i >= 0; i--) {
				if ( this.character.traitSets[i]?.custom?.cortexToolkit?.location === col ) {
					return true;
				}
			}
			return false;
		},

		canMoveDown() {
			let s = this.traitSetID;
			let col = this.columnLocation;
			for (let i = s + 1; i < this.character.traitSets.length; i++) {
				if ( this.character.traitSets[i]?.custom?.cortexToolkit?.location === col ) {
					return true;
				}
			}
			return false;
		},

		haloSpread: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.haloConfig?.arcSpread ?? 100;
			},
			set( val ) {
				this.setHaloConfig( 'arcSpread', Number(val) );
			}
		},

		haloDistance: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.haloConfig?.arcDistance ?? 0;
			},
			set( val ) {
				this.setHaloConfig( 'arcDistance', Number(val) );
			}
		},

		haloAngle: {
			get() {
				const cfg = this.traitSet?.custom?.cortexToolkit?.haloConfig;
				return cfg?.arcAngle ?? ((cfg?.arcSlide ?? 0) * 3) ?? 0;
			},
			set( val ) {
				this.setHaloConfig( 'arcAngle', Number(val) );
			}
		},

		haloAngleLabel() {
			const a = this.haloAngle;
			if ( a === 0 ) return '0° (Bottom)';
			if ( a === -90 ) return '-90° (Right)';
			if ( a === 90 ) return '+90° (Left)';
			if ( a === 180 || a === -180 ) return '180° (Top)';
			return (a > 0 ? '+' + a : a) + '°';
		},

		haloSlide: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.haloConfig?.arcSlide ?? 0;
			},
			set( val ) {
				this.setHaloConfig( 'arcSlide', Number(val) );
			}
		},

		scaleAngle: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.haloConfig?.scaleAngle ?? 0;
			},
			set( val ) {
				this.setHaloConfig( 'scaleAngle', Number(val) );
			}
		},

		scaleAngleLabel() {
			const a = this.scaleAngle;
			if ( a === 0 ) return '0° (Bottom)';
			if ( a === -90 ) return '-90° (Right)';
			if ( a === 90 ) return '+90° (Left)';
			if ( a === 180 || a === -180 ) return '180° (Top)';
			return (a > 0 ? '+' + a : a) + '°';
		},

		scaleDistance: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.haloConfig?.scaleDistance ?? 0;
			},
			set( val ) {
				this.setHaloConfig( 'scaleDistance', Number(val) );
			}
		},

		haloScaleY: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.haloConfig?.scaleDieY ?? 0;
			},
			set( val ) {
				this.setHaloConfig( 'scaleDieY', Number(val) );
			}
		},

		haloScaleX: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.haloConfig?.scaleDieX ?? 0;
			},
			set( val ) {
				this.setHaloConfig( 'scaleDieX', Number(val) );
			}
		},

		scaleDieValue: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.scaleDie || this.character?.custom?.cortexToolkit?.scale || 0;
			},
			set( val ) {
				if ( !this.traitSet.custom ) this.traitSet.custom = {};
				if ( !this.traitSet.custom.cortexToolkit ) this.traitSet.custom.cortexToolkit = {};
				this.traitSet.custom.cortexToolkit.scaleDie = val;
				if ( !this.character.custom ) this.character.custom = {};
				if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
				this.character.custom.cortexToolkit.scale = val;
				this.updateCharacter( this.character );
			}
		},

		featureDescription: {
			get() {
				return Boolean( this.traitSet?.custom?.cortexToolkit?.features?.description );
			},
			set( value ) {
				this.setFeature( 'description', value );
			}
		},

		featureSubtraits: {
			get() {
				return Boolean( this.traitSet?.custom?.cortexToolkit?.features?.subtraits );
			},
			set( value ) {
				this.setFeature( 'subtraits', value );
			}
		},

		featureSFX: {
			get() {
				return Boolean( this.traitSet?.custom?.cortexToolkit?.features?.sfx );
			},
			set( value ) {
				this.setFeature( 'sfx', value );
			}
		},

		includeD4: {
			get() {
				return Boolean( this.traitSet?.custom?.cortexToolkit?.stressConfig?.includeD4 );
			},
			set( value ) {
				this.setStressConfig( 'includeD4', value );
			}
		},

		includeOut: {
			get() {
				const cfg = this.traitSet?.custom?.cortexToolkit?.stressConfig;
				if ( cfg && typeof cfg.includeOut === 'boolean' ) return cfg.includeOut;
				return true;
			},
			set( value ) {
				this.setStressConfig( 'includeOut', value );
			}
		},

		multiDie: {
			get() {
				return Boolean( this.traitSet?.custom?.cortexToolkit?.multiDie );
			},
			set( value ) {
				this.setCustomProperty( 'multiDie', value );
			}
		},

		notesContent: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.notes ?? ( this.traitSet?.description ?? '' );
			},
			set( value ) {
				this.setCustomProperty( 'notes', value );
			}
		},

		scrollable() {
			return Boolean(
				( this.traitSet?.custom?.cortexToolkit?.features?.sfx && (this.traitSet?.sfx?.length || 0) > 0 )
				|| this.isHalo
			);
		},

		cssClass() {

			let cssClass = {
				'editor':     true,
				'open':       this.open,
				'scrollable': this.scrollable,
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
			<button type="button" class="editor-copy" @click.stop="duplicateTraitSet" title="Duplicate trait set"><i class="fas fa-copy"></i></button>
			<button type="button" class="editor-delete" @click.stop="promptDeleteTraitSet" title="Delete trait set"><i class="fas fa-trash"></i></button>
		</div>

		<div class="editor-inner">
			<div @scroll="checkScrollPosition">

				<div class="editor-fields">

					<div class="editor-field">
						<label>Trait Set Name</label>
						<input type="text" v-model="name" ref="inputName">
					</div>

					<div class="editor-field">
						<label>Style</label>
						<select v-model="styleBody">
							<option v-for="option in styleOptions" :value="option.id" :selected="option.id === styleBody">{{ option.label }}</option>
						</select>
					</div>

					<!-- HALO & SCALE DIE POSITIONING CONTROLS -->
					<div class="editor-field" v-if="isHalo">
						<label>Halo & Scale Die Placement</label>
						
						<div class="halo-sliders">
							<div class="slider-row">
								<div class="slider-header">
									<span>Arc Position (Angle)</span>
									<span class="slider-val">{{ haloAngleLabel }}</span>
								</div>
								<div class="halo-presets">
									<button type="button" class="btn-preset" :class="{ active: haloAngle === 0 }" @click.stop="haloAngle = 0">Bottom (0°)</button>
									<button type="button" class="btn-preset" :class="{ active: haloAngle === 90 }" @click.stop="haloAngle = 90">Left (+90°)</button>
									<button type="button" class="btn-preset" :class="{ active: haloAngle === -90 }" @click.stop="haloAngle = -90">Right (-90°)</button>
									<button type="button" class="btn-preset" :class="{ active: Math.abs(haloAngle) === 180 }" @click.stop="haloAngle = 180">Top (180°)</button>
								</div>
								<input type="range" min="-180" max="180" step="5" v-model.number="haloAngle">
							</div>

							<div class="slider-row">
								<div class="slider-header">
									<span>Arc Spread (Width)</span>
									<span class="slider-val">{{ haloSpread }}%</span>
								</div>
								<input type="range" min="40" max="160" step="5" v-model.number="haloSpread">
							</div>

							<div class="slider-row">
								<div class="slider-header">
									<span>Arc Distance</span>
									<span class="slider-val">{{ haloDistance > 0 ? '+' + haloDistance : haloDistance }} mm</span>
								</div>
								<input type="range" min="-15" max="25" step="1" v-model.number="haloDistance">
							</div>

							<div class="slider-row">
								<div class="slider-header">
									<span>Scale Die Angle</span>
									<span class="slider-val">{{ scaleAngleLabel }}</span>
								</div>
								<div class="halo-presets">
									<button type="button" class="btn-preset" :class="{ active: scaleAngle === 0 }" @click.stop="scaleAngle = 0">Bottom (0°)</button>
									<button type="button" class="btn-preset" :class="{ active: scaleAngle === 90 }" @click.stop="scaleAngle = 90">Left (+90°)</button>
									<button type="button" class="btn-preset" :class="{ active: scaleAngle === -90 }" @click.stop="scaleAngle = -90">Right (-90°)</button>
									<button type="button" class="btn-preset" :class="{ active: Math.abs(scaleAngle) === 180 }" @click.stop="scaleAngle = 180">Top (180°)</button>
								</div>
								<input type="range" min="-180" max="180" step="5" v-model.number="scaleAngle">
							</div>

							<div class="slider-row">
								<div class="slider-header">
									<span>Scale Die Distance</span>
									<span class="slider-val">{{ scaleDistance > 0 ? '+' + scaleDistance : scaleDistance }} mm</span>
								</div>
								<input type="range" min="-15" max="25" step="1" v-model.number="scaleDistance">
							</div>

							<div class="slider-actions">
								<button type="button" class="btn-reset-halo" @click.stop="resetHaloPlacement">
									<i class="fas fa-rotate-left"></i> Reset to Defaults
								</button>
							</div>
						</div>
					</div>

					<!-- SCALE DIE OPTION FOR HALO -->
					<div class="editor-field" v-if="isHalo">
						<label>Scale Die</label>
						<select v-model.number="scaleDieValue">
							<option :value="0">None</option>
							<option :value="4">d4</option>
							<option :value="6">d6</option>
							<option :value="8">d8</option>
							<option :value="10">d10</option>
							<option :value="12">d12</option>
						</select>
					</div>

					<!-- COLUMN & REORDER CONTROLS -->
					<div class="editor-field" v-if="!isHalo">
						<label>Column & Position</label>
						<div class="editor-position-controls">
							<div class="editor-button-group">
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: columnLocation === 'left' }"
									@click.stop="setColumn('left')"
								>
									<i class="fas fa-arrow-left"></i> Left Column
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: columnLocation === 'right' }"
									@click.stop="setColumn('right')"
								>
									Right Column <i class="fas fa-arrow-right"></i>
								</button>
							</div>
							<div class="editor-reorder-buttons">
								<button
									type="button"
									class="editor-step-btn"
									:disabled="!canMoveUp"
									@click.stop="moveTraitSetUp"
								>
									<i class="fas fa-arrow-up"></i> Move Up
								</button>
								<button
									type="button"
									class="editor-step-btn"
									:disabled="!canMoveDown"
									@click.stop="moveTraitSetDown"
								>
									<i class="fas fa-arrow-down"></i> Move Down
								</button>
							</div>
						</div>
					</div>

					<div class="editor-field">
						<label>Description</label>
						<textarea v-model="description"></textarea>
					</div>

					<!-- STRESS OPTIONS -->
					<div class="editor-field" v-if="styleBody === 'stress'">
						<label>Stress Options</label>
						<div class="editor-toggles">
							<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-stress-d4'" :true-value="true" :false-value="false" v-model="includeD4"></div>
							<div><label :for="'trait-set-' + traitSetID + '-stress-d4'">Include d4 Stress</label></div>

							<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-stress-out'" :true-value="true" :false-value="false" v-model="includeOut"></div>
							<div><label :for="'trait-set-' + traitSetID + '-stress-out'">Include 💥 Out Marker</label></div>
						</div>
					</div>

					<!-- RATING OPTIONS -->
					<div class="editor-field" v-if="styleBody !== 'stress' && styleBody !== 'list' && styleBody !== 'notes' && !isHalo">
						<label>Rating Options</label>
						<div class="editor-toggles">
							<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-multi-die'" :true-value="true" :false-value="false" v-model="multiDie"></div>
							<div><label :for="'trait-set-' + traitSetID + '-multi-die'">Allow multiple dice per trait (e.g. 3d6 or Mob pool)</label></div>
						</div>
					</div>

					<!-- NOTES CONTENT -->
					<div class="editor-field" v-if="styleBody === 'notes'">
						<label>Notes Content</label>
						<textarea v-model="notesContent" placeholder="Enter notes or text here..." rows="6"></textarea>
					</div>

					<div class="editor-field" v-if="styleBody !== 'notes'">
						<label>Singular Noun</label>
						<input type="text" v-model="nounSingular" placeholder="Trait">
					</div>

					<div class="editor-field" v-if="styleBody !== 'notes'">
						<label>Trait Features</label>
						<div class="editor-toggles">

							<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-feature-description'" :true-value="true" :false-value="false" v-model="featureDescription"></div>
							<div><label :for="'trait-set-' + traitSetID + '-feature-description'">Description</label></div>

							<div v-if="styleBody !== 'list'"><input type="checkbox" :id="'trait-set-' + traitSetID + '-feature-subtraits'" :true-value="true" :false-value="false" v-model="featureSubtraits"></div>
							<div v-if="styleBody !== 'list'"><label :for="'trait-set-' + traitSetID + '-feature-subtraits'">Sub-Traits</label></div>

							<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-feature-sfx'" :true-value="true" :false-value="false" v-model="featureSFX"></div>
							<div><label :for="'trait-set-' + traitSetID + '-feature-sfx'">SFX</label></div>

						</div>
					</div>

					<!-- SFX -->
					<div class="editor-field" v-if="traitSet.custom.cortexToolkit.features.sfx">

						<label>Trait Set SFX</label>

						<div class="editor-subgroups">

							<transition-group appear>
								<sfx-editor
									v-for="(effect, effectID) in traitSet.sfx"
									:key="traitSetID + '-' + effectID"
									:character="character"
									:traitSetID="traitSetID"
									:traitID="null"
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

		<!-- DELETE TRAIT SET CONFIRMATION MODAL -->
		<teleport to="body">
			<transition>
				<div class="modal-veil" v-if="showDeleteConfirm" @click.stop="cancelDeleteTraitSet"></div>
			</transition>
			<transition>
				<aside class="modal modal-confirm" v-if="showDeleteConfirm">
					<div class="modal-close" @click.prevent="cancelDeleteTraitSet"><i class="fas fa-times"></i></div>
					<div class="modal-inner">
						<p>Are you sure you want to delete the trait set <strong>{{ traitSet.name && traitSet.name.length ? traitSet.name : 'this trait set' }}</strong> and all its traits?</p>
						<p class="modal-warning-text"><i class="fas fa-exclamation-triangle"></i> This action cannot be undone.</p>
						<div class="modal-button-container">
							<div class="modal-button-container-inner">
								<div class="modal-button modal-button-delete" @click.stop="confirmDeleteTraitSet">
									<span><i class="fas fa-trash"></i> Delete</span>
								</div>
								<div class="modal-button modal-button-no" @click.stop="cancelDeleteTraitSet">
									<span><i class="fas fa-times"></i> Cancel</span>
								</div>
							</div>
						</div>
					</div>
				</aside>
			</transition>
		</teleport>

	</aside>`,

	mounted() {
		this.checkAnchorPosition();
		window.addEventListener( 'resize', this.checkAnchorPosition );
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

		traitSetID() {
			this.showDeleteConfirm = false;
		},

		character() {
			this.checkAnchorPosition();
		},

		viewY() {
			this.checkAnchorPosition();
		},
		
		open( isOpen, wasOpen ) {
			this.showDeleteConfirm = false;
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

			character.traitSets[s][ key ] = value;

			this.updateCharacter( character );

		},

		promptDeleteTraitSet() {
			this.showDeleteConfirm = true;
		},

		cancelDeleteTraitSet() {
			this.showDeleteConfirm = false;
		},

		confirmDeleteTraitSet() {
			this.showDeleteConfirm = false;
			this.$emit( 'removeTraitSet', this.traitSetID );
		},

		duplicateTraitSet() {
			let character = this.character;
			let s = this.traitSetID;

			let clone = JSON.parse( JSON.stringify( character.traitSets[s] ) );
			character.traitSets.splice( s + 1, 0, clone );

			this.updateCharacter( character );
			this.selectElement([ 'traitSet', s + 1 ]);
		},

		setColumn( col ) {
			let s = this.traitSetID;
			if ( !this.character.traitSets[s].custom ) this.character.traitSets[s].custom = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit ) this.character.traitSets[s].custom.cortexToolkit = {};
			this.character.traitSets[s].custom.cortexToolkit.location = col;
			this.updateCharacter( this.character );
		},

		moveTraitSetUp() {
			let s = this.traitSetID;
			let col = this.columnLocation;
			let targetIdx = -1;
			for (let i = s - 1; i >= 0; i--) {
				if ( this.character.traitSets[i]?.custom?.cortexToolkit?.location === col ) {
					targetIdx = i;
					break;
				}
			}
			if ( targetIdx === -1 ) return;

			let character = this.character;
			let temp = character.traitSets[s];
			character.traitSets[s] = character.traitSets[targetIdx];
			character.traitSets[targetIdx] = temp;

			this.updateCharacter( character );
			this.selectElement([ 'traitSet', targetIdx ]);
		},

		moveTraitSetDown() {
			let s = this.traitSetID;
			let col = this.columnLocation;
			let targetIdx = -1;
			for (let i = s + 1; i < this.character.traitSets.length; i++) {
				if ( this.character.traitSets[i]?.custom?.cortexToolkit?.location === col ) {
					targetIdx = i;
					break;
				}
			}
			if ( targetIdx === -1 ) return;

			let character = this.character;
			let temp = character.traitSets[s];
			character.traitSets[s] = character.traitSets[targetIdx];
			character.traitSets[targetIdx] = temp;

			this.updateCharacter( character );
			this.selectElement([ 'traitSet', targetIdx ]);
		},

		setHaloConfig( key, value ) {
			let s = this.traitSetID;
			if ( !this.character.traitSets[s].custom ) this.character.traitSets[s].custom = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit ) this.character.traitSets[s].custom.cortexToolkit = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit.haloConfig ) {
				this.character.traitSets[s].custom.cortexToolkit.haloConfig = {
					arcAngle: 0,
					arcSpread: 100,
					arcDistance: 0,
					scaleAngle: 0,
					scaleDistance: 0,
					scaleDieX: 0,
					scaleDieY: 0,
					arcSlide: 0
				};
			}
			this.character.traitSets[s].custom.cortexToolkit.haloConfig[ key ] = value;
			this.updateCharacter( JSON.parse( JSON.stringify( this.character ) ) );
		},

		resetHaloPlacement() {
			let s = this.traitSetID;
			if ( !this.character.traitSets[s].custom ) this.character.traitSets[s].custom = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit ) this.character.traitSets[s].custom.cortexToolkit = {};
			this.character.traitSets[s].custom.cortexToolkit.haloConfig = {
				arcAngle: 0,
				arcSpread: 100,
				arcDistance: 0,
				scaleAngle: 0,
				scaleDistance: 0,
				scaleDieX: 0,
				scaleDieY: 0,
				arcSlide: 0
			};
			this.updateCharacter( JSON.parse( JSON.stringify( this.character ) ) );
		},

		setFeature( featureID, value ) {

			let s = this.traitSetID;
			if ( !this.character.traitSets[s].custom ) this.character.traitSets[s].custom = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit ) this.character.traitSets[s].custom.cortexToolkit = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit.features ) {
				this.character.traitSets[s].custom.cortexToolkit.features = {
					description: false,
					sfx: false,
					subtraits: false
				};
			}
			this.character.traitSets[s].custom.cortexToolkit.features[ featureID ] = value;

			this.updateCharacter( this.character );

		},

		setStyle( styleID, value ) {

			let s = this.traitSetID;
			if ( !this.character.traitSets[s].custom ) this.character.traitSets[s].custom = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit ) this.character.traitSets[s].custom.cortexToolkit = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit.style ) {
				this.character.traitSets[s].custom.cortexToolkit.style = {
					header: 'default',
					body: 'default'
				};
			}
			this.character.traitSets[s].custom.cortexToolkit.style[ styleID ] = value;

			this.updateCharacter( this.character );

		},

		setCustomProperty( key, value ) {

			let s = this.traitSetID;
			if ( !this.character.traitSets[s].custom ) {
				this.character.traitSets[s].custom = {};
			}
			if ( !this.character.traitSets[s].custom.cortexToolkit ) {
				this.character.traitSets[s].custom.cortexToolkit = {};
			}
			this.character.traitSets[s].custom.cortexToolkit[ key ] = value;

			this.updateCharacter( this.character );

		},

		setStressConfig( key, value ) {

			let s = this.traitSetID;
			if ( !this.character.traitSets[s].custom ) {
				this.character.traitSets[s].custom = {};
			}
			if ( !this.character.traitSets[s].custom.cortexToolkit ) {
				this.character.traitSets[s].custom.cortexToolkit = {};
			}
			if ( !this.character.traitSets[s].custom.cortexToolkit.stressConfig ) {
				this.character.traitSets[s].custom.cortexToolkit.stressConfig = {};
			}
			this.character.traitSets[s].custom.cortexToolkit.stressConfig[ key ] = value;

			this.updateCharacter( this.character );

		},

		addEffect() {

			let character = this.character;
			let s = this.traitSetID;

			character.traitSets[s].sfx.push(
				structuredClone( cortexFunctions.defaultSFX )
			);

			this.updateCharacter( character );

		},

		removeEffect( effectID ) {

			let character = this.character;
			let s = this.traitSetID;
			let f = effectID;

			character.traitSets[s].sfx.splice(f, 1);

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
			if ( !element ) return;

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

			if ( distance >= max ) {
				this.scrollPosition = 'bottom';
				return;
			}

			this.scrollPosition = 'middle';
		},

	}

}
