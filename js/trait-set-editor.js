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
			uploadError:       '',
			styleOptions: [
				{ id: 'default',              label: 'Default' },
				{ id: 'halo',                 label: 'Portrait Halo' },
				{ id: 'two-columns-compact',  label: 'Two Columns (Compact)' },
				{ id: 'two-columns-detailed', label: 'Two Columns (Detailed)' },
				{ id: 'distinctions',         label: 'Distinctions' },
				{ id: 'assets',               label: 'Assets' },
				{ id: 'resources',            label: 'Resources' },
				{ id: 'resources-count',      label: 'Resources (Rating + Dice Count)' },
				{ id: 'skills-specialties',   label: 'Skills & Specialties (Branched)' },
				{ id: 'standing',             label: 'Standing (Complication & Bonus Dice)' },
				{ id: 'badges-table',         label: 'Badges / Checklist Table' },
				{ id: 'talents-table',        label: 'Talents Table (Talent / Activation / Effect)' },
				{ id: 'growth-ladder',        label: 'Growth Ladder (Vertical Dice, e.g. Growth Pool)' },
				{ id: 'dossier-fields',       label: 'Dossier Fields (Labeled Blocks, e.g. Forces)' },
				{ id: 'stress',               label: 'Stress' },
				{ id: 'list',                 label: 'List (Unrated)' },
				{ id: 'notes',                label: 'Notes (Text Area)' },
				{ id: 'image',                label: 'Image (Illustration / Portrait)' },
				{ id: 'pips',                 label: 'Pips / Track (e.g. XP)' },
				{ id: 'session-record',       label: 'Session Record (Angled Lines / Leaf)' },
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
					// Spotlight PDF styles: seed the feature flags their layouts need.
					if ( !this.traitSet.custom.cortexToolkit.features ) {
						this.traitSet.custom.cortexToolkit.features = { description: false, sfx: false, subtraits: false };
					}
					const styleDefaults = cortexFunctions.defaultFeaturesForStyle( value );
					Object.assign( this.traitSet.custom.cortexToolkit.features, styleDefaults.features );
					if ( styleDefaults.multiDie ) {
						this.traitSet.custom.cortexToolkit.multiDie = true;
					}
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

		pageNumber: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.page ?? 1;
			},
			set( val ) {
				if ( !this.traitSet.custom ) this.traitSet.custom = {};
				if ( !this.traitSet.custom.cortexToolkit ) this.traitSet.custom.cortexToolkit = {};
				this.traitSet.custom.cortexToolkit.page = val;
				if ( val > 1 && (!this.character.custom?.cortexToolkit?.pageCount || this.character.custom.cortexToolkit.pageCount < val) ) {
					if ( !this.character.custom ) this.character.custom = {};
					if ( !this.character.custom.cortexToolkit ) this.character.custom.cortexToolkit = {};
					this.character.custom.cortexToolkit.pageCount = val;
				}
				this.updateCharacter();
			}
		},

		columnLocation() {
			let loc = this.traitSet?.custom?.cortexToolkit?.location;
			if ( loc === 'center' && this.characterColumnCount === 3 ) return 'center';
			return loc === 'right' ? 'right' : 'left';
		},

		characterColumnCount() {
			return Number( this.character?.custom?.cortexToolkit?.columns ) === 3 ? 3 : 2;
		},

		// Track count for THIS set's page (page 2 may override via columnsPage2).
		setTrackCount() {
			if ( ( this.traitSet?.custom?.cortexToolkit?.page ?? 1 ) === 2 ) {
				const override = Number( this.character?.custom?.cortexToolkit?.columnsPage2 );
				if ( override === 2 || override === 3 ) return override;
			}
			return this.characterColumnCount;
		},

		isFullWidthSpan: {
			get() {
				const span = this.traitSet?.custom?.cortexToolkit?.colSpan ?? this.traitSet?.custom?.cortexToolkit?.columnSpan;
				return span === 'full' || Number(span) >= this.setTrackCount;
			},
			set( val ) {
				if ( val ) {
					this.setCustomProperty( 'colSpan', 'full' );
				} else {
					this.setCustomProperty( 'colSpan', 1 );
				}
			}
		},

		colSpan: {
			get() {
				const span = this.traitSet?.custom?.cortexToolkit?.colSpan ?? this.traitSet?.custom?.cortexToolkit?.columnSpan;
				if ( span === 'full' ) return this.setTrackCount;
				return Number( span ) || 1;
			},
			set( val ) {
				this.setCustomProperty( 'colSpan', val === 'full' ? 'full' : Math.max(1, Number(val) || 1) );
			}
		},

		// Starts a fresh row band before this set so consecutive bands can
		// carry different column shares (e.g. 66/34 above 40/60).
		rowBreak: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.rowBreak === true;
			},
			set( val ) {
				this.setCustomProperty( 'rowBreak', val ? true : null );
			}
		},

		templateEntry() {
			return cortexFunctions.resolveTemplateFor(
				this.character, this.$root ? this.$root.sheetTemplates : null );
		},

		// Template traits by name not currently on this sheet (D19 restore menu).
		restorableTraitNames() {
			return cortexFunctions.restorableTraits( this.character, this.templateEntry, this.traitSetID );
		},

		// Column width share for Spotlight rows (percent of the row this
		// set's column takes; unset/null = equal share). Mates in the other
		// column(s) flex to fill whatever is left, forming a row band.
		colWidth: {
			get() {
				const w = Number( this.traitSet?.custom?.cortexToolkit?.colWidth );
				return ( w >= 10 && w <= 90 ) ? Math.round( w ) : null;
			},
			set( val ) {
				if ( val === null || val === undefined || val === '' ) {
					this.setCustomProperty( 'colWidth', null );
					return;
				}
				const w = Math.min( 90, Math.max( 10, Math.round( Number( val ) || 50 ) ) );
				this.setCustomProperty( 'colWidth', w );
			}
		},

		headerRight: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.headerRight ?? '';
			},
			set( val ) {
				this.setCustomProperty( 'headerRight', val );
			}
		},

		canMoveUp() {
			return this.findMoveTarget( -1 ) !== -1;
		},

		canMoveDown() {
			return this.findMoveTarget( 1 ) !== -1;
		},

		isSpotlightSheet() {
			const explicit = this.character?.custom?.cortexToolkit?.sheetStyle;
			if ( explicit ) return explicit === 'spotlight';
			return this.character?.custom?.cortexToolkit?.style?.hasAttributes === false;
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
				return cfg?.arcAngle ?? (cfg?.arcSlide !== undefined ? cfg.arcSlide * 3 : -90);
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

		imageURL: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.imageConfig?.url ?? '';
			},
			set( val ) {
				this.setImageConfig( 'url', val );
			}
		},

		imageAlignment: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.imageConfig?.alignment ?? 'center';
			},
			set( val ) {
				this.setImageConfig( 'alignment', val );
			}
		},

		imageHeight: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.imageConfig?.height ?? 'auto';
			},
			set( val ) {
				this.setImageConfig( 'height', val );
			}
		},

		imageCaption: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.imageConfig?.caption ?? '';
			},
			set( val ) {
				this.setImageConfig( 'caption', val );
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
				return this.isRatingIncluded( 4 );
			},
			set( value ) {
				this.toggleRatingOption( 4 );
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

		ratingScale: {
			get() {
				return cortexFunctions.getTraitSetRatings( this.traitSet );
			},
			set( scale ) {
				let s = this.traitSetID;
				if ( !this.character.traitSets[s].custom ) this.character.traitSets[s].custom = {};
				if ( !this.character.traitSets[s].custom.cortexToolkit ) this.character.traitSets[s].custom.cortexToolkit = {};
				this.character.traitSets[s].custom.cortexToolkit.ratingScale = scale;

				if ( !this.character.traitSets[s].custom.cortexToolkit.stressConfig ) {
					this.character.traitSets[s].custom.cortexToolkit.stressConfig = {};
				}
				this.character.traitSets[s].custom.cortexToolkit.stressConfig.includeD4 = scale.includes( 4 );

				this.updateCharacter( JSON.parse( JSON.stringify( this.character ) ) );
			}
		},

		subtraitRatingScale: {
			get() {
				return cortexFunctions.getSubtraitRatings( this.traitSet );
			},
			set( scale ) {
				let s = this.traitSetID;
				if ( !this.character.traitSets[s].custom ) this.character.traitSets[s].custom = {};
				if ( !this.character.traitSets[s].custom.cortexToolkit ) this.character.traitSets[s].custom.cortexToolkit = {};
				this.character.traitSets[s].custom.cortexToolkit.subtraitRatingScale = scale;
				this.updateCharacter( JSON.parse( JSON.stringify( this.character ) ) );
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

		isChallengePool: {
			get() {
				return Boolean(
					this.traitSet?.custom?.cortexToolkit?.isChallengePool ||
					this.traitSet?.custom?.cortexToolkit?.challengePool
				);
			},
			set( value ) {
				this.setCustomProperty( 'isChallengePool', value );
				this.setCustomProperty( 'challengePool', value );
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

		reservedSlots: {
			get() {
				const val = this.traitSet?.custom?.cortexToolkit?.reservedSlots;
				return (val !== undefined && val !== null && val !== '') ? Number(val) : '';
			},
			set( val ) {
				const num = (val === '' || val === null || isNaN(val)) ? null : Math.max(0, parseInt(val, 10));
				this.setCustomProperty( 'reservedSlots', num );
			}
		},

		sharedHinder: {
			get() {
				return Boolean( this.traitSet?.custom?.cortexToolkit?.sharedHinder );
			},
			set( val ) {
				this.setCustomProperty( 'sharedHinder', Boolean(val) );
			}
		},

		sharedHinderText: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.sharedHinderText ?? '';
			},
			set( val ) {
				this.setCustomProperty( 'sharedHinderText', val );
			}
		},

		traitColumns: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.traitColumns ?? 1;
			},
			set( val ) {
				this.setCustomProperty( 'traitColumns', parseInt(val, 10) || 1 );
			}
		},

		hasAttachedStress: {
			get() {
				return Boolean( this.traitSet?.custom?.cortexToolkit?.attachedStress?.enabled );
			},
			set( val ) {
				this.setAttachedStressProperty( 'enabled', Boolean(val) );
			}
		},

		attachedStressLabel: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.attachedStress?.label ?? 'Stress';
			},
			set( val ) {
				this.setAttachedStressProperty( 'label', val );
			}
		},

		attachedStressScale: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.attachedStress?.scale ?? [4, 6, 8, 10, 12];
			},
			set( scale ) {
				this.setAttachedStressProperty( 'scale', scale );
			}
		},

		attachedStressOut: {
			get() {
				return Boolean( this.traitSet?.custom?.cortexToolkit?.attachedStress?.includeOut );
			},
			set( val ) {
				this.setAttachedStressProperty( 'includeOut', Boolean(val) );
			}
		},

		ratingPosition: {
			get() {
				return this.traitSet?.ratingPosition || this.traitSet?.custom?.cortexToolkit?.ratingPosition || 'inline';
			},
			set( val ) {
				this.setProperty( 'ratingPosition', val );
				this.setCustomProperty( 'ratingPosition', val );
			}
		},

		isStatementSet: {
			get() {
				return Boolean( this.traitSet?.statement ?? this.traitSet?.custom?.cortexToolkit?.statement );
			},
			set( val ) {
				this.setProperty( 'statement', Boolean(val) );
				this.setCustomProperty( 'statement', Boolean(val) );
			}
		},

		hasQuestionedPip: {
			get() {
				return Boolean( this.traitSet?.hasQuestionedPip ?? this.traitSet?.custom?.cortexToolkit?.hasQuestionedPip );
			},
			set( val ) {
				this.setProperty( 'hasQuestionedPip', Boolean(val) );
				this.setCustomProperty( 'hasQuestionedPip', Boolean(val) );
			}
		},

		hasCounterColumn: {
			get() {
				return Boolean( this.traitSet?.hasCounterColumn ?? this.traitSet?.custom?.cortexToolkit?.hasCounterColumn );
			},
			set( val ) {
				this.setProperty( 'hasCounterColumn', Boolean(val) );
				this.setCustomProperty( 'hasCounterColumn', Boolean(val) );
			}
		},

		counterLabel: {
			get() {
				return this.traitSet?.counterLabel || this.traitSet?.custom?.cortexToolkit?.counterLabel || 'XP';
			},
			set( val ) {
				this.setProperty( 'counterLabel', val );
				this.setCustomProperty( 'counterLabel', val );
			}
		},

		pipCount: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.pips?.count ?? 25;
			},
			set( val ) {
				this.setPipProperty( 'count', Math.max( 1, parseInt(val, 10) || 25 ) );
			}
		},

		pipsPerRow: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.pips?.perRow ?? 5;
			},
			set( val ) {
				this.setPipProperty( 'perRow', Math.max( 1, parseInt(val, 10) || 5 ) );
			}
		},

		pipsConnected: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.pips?.connected !== false;
			},
			set( val ) {
				this.setPipProperty( 'connected', Boolean(val) );
			}
		},

		pipsFilled: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.pips?.filled ?? 0;
			},
			set( val ) {
				this.setPipProperty( 'filled', Math.max( 0, parseInt(val, 10) || 0 ) );
			}
		},

		sessionRecordCount: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.sessionRecord?.count ??
					this.traitSet?.custom?.cortexToolkit?.reservedSlots ??
					(this.traitSet?.traits ? this.traitSet.traits.length : 0) ?? 20;
			},
			set( val ) {
				const count = Math.max( 1, parseInt( val, 10 ) || 20 );
				if ( !this.traitSet.custom ) this.traitSet.custom = {};
				if ( !this.traitSet.custom.cortexToolkit ) this.traitSet.custom.cortexToolkit = {};
				if ( !this.traitSet.custom.cortexToolkit.sessionRecord ) {
					this.traitSet.custom.cortexToolkit.sessionRecord = {};
				}
				this.traitSet.custom.cortexToolkit.sessionRecord.count = count;
				this.traitSet.custom.cortexToolkit.reservedSlots = count;
				this.updateCharacter( this.character );
			}
		},

		scrollable() {
			return true;
		},

		// Styles sampled from the official Spotlight character sheet PDFs.
		// Talents rows and dossier fields carry no dice.
		needsDiceUI() {
			return this.styleBody !== 'talents-table' && this.styleBody !== 'dossier-fields';
		},

		// Fixed-layout styles manage their own internal columns.
		allowsTraitColumns() {
			return ![ 'skills-specialties', 'talents-table', 'standing', 'badges-table', 'resources-count', 'growth-ladder', 'dossier-fields' ].includes( this.styleBody );
		},

		styleHint() {
			switch ( this.styleBody ) {
				case 'skills-specialties':
					return 'Branched Skills layout (Alien Us, Safe Zone, SolarPunk): each skill die links to its specialties. Enable Sub-Traits below; each sub-trait is a specialty of its skill.';
				case 'talents-table':
					return 'Talents table (Talent | Activation | Effect). Trait name = Talent, description = Activation, first SFX = Effect. No dice on this style.';
				case 'standing':
					return 'Standing rows (Camp Bewilderwood): standing die plus Complication and Bonus dice. Enable Sub-Traits below; each sub-trait’s name becomes its row label (Complication, then Bonus).';
				case 'badges-table':
					return 'Checklist table (name + die per row). Rating scale sets the dice offered for each row.';
				case 'resources-count':
					return 'Syndicate-style resources (Cosa Nostra): a rating die plus a dice-count track. Enable multiple dice per trait below; the number of dice is the count.';
				case 'growth-ladder':
					return 'Vertical die ladder (Safe Zone Growth Pool): one die per row, d4 at top through d12. Rating scale sets which dice appear.';
				case 'dossier-fields':
					return 'Dossier blocks (KitBash Forces): stacked labeled fields. Trait name = field label, description = field text.';
				default:
					return '';
			}
		},

		editorDock: {
			get() {
				return this.traitSet?.custom?.cortexToolkit?.editorDock === 'right' ? 'right' : 'left';
			},
			set( val ) {
				this.setCustomProperty( 'editorDock', val === 'right' ? 'right' : 'left' );
			}
		},

		// Branched Skills connectors (per-specialty arrows) are optional.
		branchArrows: {
			get() {
				const v = this.traitSet?.custom?.cortexToolkit?.branchArrows;
				return v !== false;
			},
			set( val ) {
				this.setCustomProperty( 'branchArrows', Boolean(val) );
			}
		},

		cssClass() {

			let cssClass = {
				'editor':     true,
				'open':       this.open,
				'scrollable': this.scrollable,
			}

			cssClass[ 'anchor-position-' + this.anchorPosition ] = true;

			if ( this.isFullWidthSpan ) {
				cssClass[ 'dock-' + this.editorDock ] = true;
			}

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

					<div class="editor-field" v-if="!isHalo">
						<label>Right Header Label (Optional)</label>
						<input type="text" v-model="headerRight" placeholder="e.g. Character File">
					</div>

					<div class="editor-field">
						<label>Style</label>
						<select v-model="styleBody">
							<option v-for="option in styleOptions" :value="option.id" :selected="option.id === styleBody">{{ option.label }}</option>
						</select>
						<div class="editor-checkbox-row" v-if="styleBody === 'skills-specialties'" style="display: flex; align-items: center; gap: 0.4rem; margin-top: 0.4rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-branch-arrows'" v-model="branchArrows">
							<label :for="'trait-set-' + traitSetID + '-branch-arrows'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Show connecting arrows</label>
						</div>
						<div v-if="styleBody === 'skills-specialties'" style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
							<div style="flex: 1;">
								<label style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Left Heading</label>
								<input type="text" :value="styleLabel('left')" @change="setStyleLabel('left', $event.target.value)" :placeholder="styleLabel('left')">
							</div>
							<div style="flex: 1;">
								<label style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Right Heading</label>
								<input type="text" :value="styleLabel('right')" @change="setStyleLabel('right', $event.target.value)" :placeholder="styleLabel('right')">
							</div>
						</div>
						<div v-if="styleBody === 'talents-table'" style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
							<div style="flex: 1;">
								<label style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Column 1</label>
								<input type="text" :value="styleLabel('col1')" @change="setStyleLabel('col1', $event.target.value)" :placeholder="styleLabel('col1')">
							</div>
							<div style="flex: 1;">
								<label style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Column 2</label>
								<input type="text" :value="styleLabel('col2')" @change="setStyleLabel('col2', $event.target.value)" :placeholder="styleLabel('col2')">
							</div>
							<div style="flex: 1;">
								<label style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Column 3</label>
								<input type="text" :value="styleLabel('col3')" @change="setStyleLabel('col3', $event.target.value)" :placeholder="styleLabel('col3')">
							</div>
						</div>
						<div v-if="styleBody === 'resources-count'" style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
							<div style="flex: 1;">
								<label style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Rating Label</label>
								<input type="text" :value="styleLabel('rating')" @change="setStyleLabel('rating', $event.target.value)" :placeholder="styleLabel('rating')">
							</div>
							<div style="flex: 1;">
								<label style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Count Label</label>
								<input type="text" :value="styleLabel('dice')" @change="setStyleLabel('dice', $event.target.value)" :placeholder="styleLabel('dice')">
							</div>
						</div>
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
									<i class="fas fa-arrow-left" v-if="characterColumnCount === 2"></i> Left{{ characterColumnCount === 3 ? ' (Col 1)' : ' Column' }}
								</button>
								<button
									type="button"
									class="editor-group-btn"
									v-if="characterColumnCount === 3"
									:class="{ active: columnLocation === 'center' }"
									@click.stop="setColumn('center')"
								>
									Center (Col 2)
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: columnLocation === 'right' }"
									@click.stop="setColumn('right')"
								>
									Right{{ characterColumnCount === 3 ? ' (Col 3)' : ' Column' }} <i class="fas fa-arrow-right" v-if="characterColumnCount === 2"></i>
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

					<!-- COLUMN SPAN -->
					<div class="editor-field" v-if="!isHalo">
						<label>Column Span</label>
						<div class="editor-button-group">
							<button
								type="button"
								class="editor-group-btn"
								:class="{ active: !isFullWidthSpan && colSpan === 1 }"
								@click.stop="colSpan = 1"
							>
								1 Column
							</button>
							<button
								type="button"
								class="editor-group-btn"
								v-if="setTrackCount === 3"
								:class="{ active: !isFullWidthSpan && colSpan === 2 }"
								@click.stop="colSpan = 2"
								title="Span two of the three columns (e.g. a wide set beside a narrow one)"
							>
								Span 2 Cols
							</button>
							<button
								type="button"
								class="editor-group-btn"
								:class="{ active: isFullWidthSpan }"
								@click.stop="isFullWidthSpan = !isFullWidthSpan"
							>
								<i class="fas fa-arrows-alt-h"></i> Full Width Span
							</button>
						</div>
					</div>

					<!-- COLUMN WIDTH (SPOTLIGHT ROWS) -->
					<div class="editor-field" v-if="!isHalo && !isFullWidthSpan && isSpotlightSheet">
						<label>Column Width — Row Share</label>
						<div class="editor-button-group">
							<button
								type="button"
								class="editor-group-btn"
								:class="{ active: colWidth === null }"
								@click.stop="colWidth = null"
								title="Share the row equally with the other column(s)"
							>
								Equal
							</button>
							<button
								v-for="w in [25, 33, 50, 66, 75]"
								:key="'colw-' + w"
								type="button"
								class="editor-group-btn"
								:class="{ active: colWidth === w }"
								@click.stop="colWidth = (colWidth === w ? null : w)"
								:title="'Take ' + w + '% of the row; the other column(s) share the rest'"
							>
								{{ w }}%
							</button>
						</div>
						<div class="slider-row" style="margin-top: 0.4rem;">
							<div class="slider-header">
								<span>Fine tune</span>
								<span class="slider-val">{{ colWidth === null ? 'Equal' : colWidth + '%' }}</span>
							</div>
							<input type="range" min="10" max="90" step="1" :value="colWidth || 50" @input.stop="colWidth = Number($event.target.value)" @click.stop title="Exact column width percent">
						</div>
						<div class="editor-hint">Set 66% here and the other column takes ~33%, forming a row band like the source sheets.</div>
					</div>

					<!-- ROW BREAK (SPOTLIGHT BANDS) -->
					<div class="editor-field" v-if="!isHalo && !isFullWidthSpan && isSpotlightSheet">
						<label>Row Band</label>
						<div class="editor-button-group">
							<button
								type="button"
								class="editor-group-btn"
								:class="{ active: !rowBreak }"
								@click.stop="rowBreak = false"
								title="Keep flowing in the current row band"
							>
								Continue band
							</button>
							<button
								type="button"
								class="editor-group-btn"
								:class="{ active: rowBreak }"
								@click.stop="rowBreak = true"
								title="Start a fresh row band here, so this band can use different column shares"
							>
								<i class="fas fa-grip-lines"></i> New band
							</button>
						</div>
					</div>

					<!-- PANEL POSITION (FULL-WIDTH SETS) -->
					<div class="editor-field" v-if="isFullWidthSpan">
						<label>Panel Position</label>

						<div class="editor-button-group">
							<button
								type="button"
								class="editor-group-btn"
								:class="{ active: editorDock === 'left' }"
								@click.stop="editorDock = 'left'"
							>
								<i class="fas fa-arrow-left"></i> Left
							</button>
							<button
								type="button"
								class="editor-group-btn"
								:class="{ active: editorDock === 'right' }"
								@click.stop="editorDock = 'right'"
							>
								Right <i class="fas fa-arrow-right"></i>
							</button>
						</div>
					</div>

					<!-- PAGE SELECTOR -->
					<div class="editor-field" v-if="!isHalo">
						<label>Page</label>
						<div class="editor-position-controls">
							<div class="editor-button-group">
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: pageNumber === 1 }"
									@click.stop="pageNumber = 1"
								>
									<i class="fas fa-file"></i> Page 1
								</button>
								<button
									type="button"
									class="editor-group-btn"
									:class="{ active: pageNumber === 2 }"
									@click.stop="pageNumber = 2"
								>
									Page 2 <i class="fas fa-copy"></i>
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
						<label>Stress Markers</label>
						<div class="editor-toggles">
							<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-stress-out'" :true-value="true" :false-value="false" v-model="includeOut"></div>
							<div><label :for="'trait-set-' + traitSetID + '-stress-out'">Include 💥 Out Marker</label></div>
						</div>
					</div>

					<!-- RATING SCALE (OPT IN/OUT OF RATINGS) -->
					<div class="editor-field" v-if="needsDiceUI">
						<label>Rating Scale Options</label>
						<div class="rating-scale-container">
							<div class="rating-scale-chips">
								<button
									type="button"
									v-for="size in [4, 6, 8, 10, 12]"
									:key="size"
									class="rating-scale-chip"
									:class="{ active: isRatingIncluded(size) }"
									@click.stop="toggleRatingOption(size)"
									:title="(isRatingIncluded(size) ? 'Exclude d' : 'Include d') + size"
								>
									<span class="c" v-html="getDieDisplayValue(size)"></span>
									<span class="chip-label">d{{ size }}</span>
								</button>
							</div>
							<div class="rating-scale-presets">
								<span class="preset-label">Presets:</span>
								<button type="button" class="btn-scale-preset" @click.stop="setRatingPreset('all')">All (d4–d12)</button>
								<button type="button" class="btn-scale-preset" @click.stop="setRatingPreset('skills')">Skills (d4–d6)</button>
								<button type="button" class="btn-scale-preset" @click.stop="setRatingPreset('specialties')">Specialties (d8–d12)</button>
								<button type="button" class="btn-scale-preset" @click.stop="setRatingPreset('stress')">Stress (d6–d12)</button>
							</div>
						</div>
					</div>

					<!-- SUB-TRAIT RATING SCALE -->
					<div class="editor-field" v-if="needsDiceUI && featureSubtraits">
						<label>Sub-Trait Rating Scale (e.g. Specialties)</label>
						<div class="rating-scale-container">
							<div class="rating-scale-chips">
								<button
									type="button"
									v-for="size in [4, 6, 8, 10, 12]"
									:key="size"
									class="rating-scale-chip"
									:class="{ active: isSubtraitRatingIncluded(size) }"
									@click.stop="toggleSubtraitRatingOption(size)"
									:title="(isSubtraitRatingIncluded(size) ? 'Exclude d' : 'Include d') + size"
								>
									<span class="c" v-html="getDieDisplayValue(size)"></span>
									<span class="chip-label">d{{ size }}</span>
								</button>
							</div>
							<div class="rating-scale-presets">
								<span class="preset-label">Presets:</span>
								<button type="button" class="btn-scale-preset" @click.stop="setSubtraitRatingPreset('all')">All (d4–d12)</button>
								<button type="button" class="btn-scale-preset" @click.stop="setSubtraitRatingPreset('specialties')">Specialties (d8–d12)</button>
								<button type="button" class="btn-scale-preset" @click.stop="setSubtraitRatingPreset('skills')">Skills (d4–d6)</button>
							</div>
						</div>
					</div>

					<!-- POOL & MULTI-DIE OPTIONS -->
					<div class="editor-field" v-if="needsDiceUI">
						<label>Pool Options</label>
						<div class="editor-toggles">
							<template v-if="!isHalo">
								<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-multi-die'" :true-value="true" :false-value="false" v-model="multiDie"></div>
								<div><label :for="'trait-set-' + traitSetID + '-multi-die'">Allow multiple dice per trait (e.g. 3d6 or Mob pool)</label></div>
							</template>

							<div><input type="checkbox" :id="'trait-set-' + traitSetID + '-challenge-pool'" :true-value="true" :false-value="false" v-model="isChallengePool"></div>
							<div><label :for="'trait-set-' + traitSetID + '-challenge-pool'">Challenge Pool (adds all dice at current rating to roller)</label></div>
						</div>
					</div>

					<!-- IMAGE CONTENT -->
					<div class="editor-field" v-if="styleBody === 'image'">
						<label>Illustration / Image</label>
						
						<div class="image-set-preview" v-if="imageURL" style="margin-bottom: 0.5rem;">
							<img :src="imageURL" style="max-height: 120px; border-radius: 4px; display: block; border: 1px solid #cbd5e1; margin-bottom: 0.5rem;">
						</div>

						<div class="editor-button-container" style="margin-bottom: 0.5rem;">
							<div class="editor-button-container-inner">
								<div class="editor-button" @click.prevent="uploadImageStart">
									<span><i class="fas fa-upload"></i> {{ imageURL ? 'Replace' : 'Upload' }} Image</span>
								</div>
								<div class="editor-button" v-if="imageURL" style="background: #ef4444; color: #ffffff;" @click.prevent="removeImage" title="Remove image">
									<span><i class="fas fa-trash-alt"></i> Remove</span>
								</div>
							</div>
						</div>

						<input type="file" ref="imageFileInput" style="display:none" @change="uploadImageProcess" accept="image/*">

						<div class="editor-upload-error" v-if="uploadError">{{ uploadError }}</div>

						<div style="margin-top: 0.5rem;">
							<label style="font-size: 0.75rem; color: #64748b;">Or Image URL</label>
							<input type="text" v-model.lazy="imageURL" placeholder="https://example.com/illustration.jpg">
						</div>
					</div>

					<div class="editor-field" v-if="styleBody === 'image'">
						<label>Alignment / Focus</label>
						<div class="editor-portrait-alignment">
							<div @click.stop="imageAlignment = 'top-left'"      :class="{'active': imageAlignment === 'top-left' }"></div>
							<div @click.stop="imageAlignment = 'top-center'"    :class="{'active': imageAlignment === 'top-center' }"></div>
							<div @click.stop="imageAlignment = 'top-right'"     :class="{'active': imageAlignment === 'top-right' }"></div>
							<div @click.stop="imageAlignment = 'center-left'"   :class="{'active': imageAlignment === 'center-left' }"></div>
							<div @click.stop="imageAlignment = 'center'"        :class="{'active': imageAlignment === 'center' }"></div>
							<div @click.stop="imageAlignment = 'center-right'"  :class="{'active': imageAlignment === 'center-right' }"></div>
							<div @click.stop="imageAlignment = 'bottom-left'"   :class="{'active': imageAlignment === 'bottom-left' }"></div>
							<div @click.stop="imageAlignment = 'bottom-center'" :class="{'active': imageAlignment === 'bottom-center' }"></div>
							<div @click.stop="imageAlignment = 'bottom-right'"  :class="{'active': imageAlignment === 'bottom-right' }"></div>
						</div>
					</div>

					<div class="editor-field" v-if="styleBody === 'image'">
						<label>Display Height</label>
						<select v-model="imageHeight">
							<option value="auto">Auto / Proportional</option>
							<option value="120px">Small (120px)</option>
							<option value="180px">Medium (180px)</option>
							<option value="240px">Large (240px)</option>
							<option value="320px">Extra Large (320px)</option>
						</select>
					</div>

					<div class="editor-field" v-if="styleBody === 'image'">
						<label>Caption</label>
						<input type="text" v-model="imageCaption" placeholder="Optional image caption...">
					</div>

					<!-- NOTES CONTENT -->
					<div class="editor-field" v-if="styleBody === 'notes'">
						<label>Notes Content</label>
						<textarea v-model="notesContent" placeholder="Enter notes or text here..." rows="6"></textarea>
					</div>

					<!-- DISTINCTIONS COMPACT SFX & SHARED HINDER -->
					<div class="editor-field" v-if="styleBody === 'distinctions'">
						<label>Distinctions Layout</label>
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-shared-hinder'" v-model="sharedHinder">
							<label :for="'trait-set-' + traitSetID + '-shared-hinder'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Use Shared Set-Level Hinder Banner (Compact SFX)</label>
						</div>
						<div v-if="sharedHinder" style="margin-top: 0.35rem;">
							<label style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Hinder Banner Text</label>
							<textarea v-model="sharedHinderText" placeholder="Gain a PP when you trade out your distinction's [d8] rating for a [d4]." rows="2"></textarea>
						</div>
					</div>

					<!-- COLUMNS WITHIN SET -->
					<div class="editor-field" v-if="allowsTraitColumns && styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
						<label>Columns Within Set</label>
						<select v-model.number="traitColumns">
							<option :value="1">1 Column (Default)</option>
							<option :value="2">2 Columns</option>
							<option :value="3">3 Columns</option>
						</select>
					</div>

					<!-- ATTACHED STRESS / TRACK -->
					<div class="editor-field" v-if="allowsTraitColumns && styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'stress' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
						<label>Attached Stress / Track</label>
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-attached-stress'" v-model="hasAttachedStress">
							<label :for="'trait-set-' + traitSetID + '-attached-stress'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Enable Attached Stress to Traits</label>
						</div>
						<div v-if="hasAttachedStress" style="margin-top: 0.4rem; background: #0f172a; padding: 0.5rem; border-radius: 4px; border: 1px solid #334155;">
							<div style="margin-bottom: 0.4rem;">
								<label style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Track Label</label>
								<input type="text" v-model="attachedStressLabel" placeholder="Stress">
							</div>
							<div style="margin-bottom: 0.4rem;">
								<label style="font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.2rem;">Dice Rating Scale</label>
								<div class="editor-scale-options" style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
									<button
										v-for="d in [4, 6, 8, 10, 12]"
										:key="d"
										type="button"
										class="btn-scale-step"
										:class="{ active: attachedStressScale.includes(d) }"
										@click.stop="toggleAttachedStressScale(d)"
										style="padding: 0.2rem 0.45rem; font-size: 0.75rem;"
									>
										d{{ d }}
									</button>
								</div>
							</div>
							<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem;">
								<input type="checkbox" :id="'trait-set-' + traitSetID + '-attached-stress-out'" v-model="attachedStressOut">
								<label :for="'trait-set-' + traitSetID + '-attached-stress-out'" style="margin: 0; font-size: 0.75rem; color: #cbd5e1; cursor: pointer;">Include 💥 Out Marker</label>
							</div>
						</div>
					</div>

					<!-- PIPS TRACK SETTINGS -->
					<div class="editor-field" v-if="styleBody === 'pips'">
						<label>Pip Track Settings</label>
						<div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
							<div style="flex: 1;">
								<label style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Total Pips</label>
								<input type="number" min="1" max="100" v-model.number="pipCount">
							</div>
							<div style="flex: 1;">
								<label style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Pips Per Row</label>
								<input type="number" min="1" max="20" v-model.number="pipsPerRow">
							</div>
						</div>
						<div style="margin-bottom: 0.5rem;">
							<label style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Filled Pips (Play State)</label>
							<input type="number" min="0" :max="pipCount" v-model.number="pipsFilled">
						</div>
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-pips-connected'" v-model="pipsConnected">
							<label :for="'trait-set-' + traitSetID + '-pips-connected'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Connect Pips with Horizontal Line</label>
						</div>
					</div>

					<!-- SESSION RECORD (ANGLED LINES / LEAF) SETTINGS -->
					<div class="editor-field" v-if="styleBody === 'session-record' || styleBody === 'angled-lines'">
						<label>Session Record Settings</label>
						<div style="margin-bottom: 0.5rem;">
							<label style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Total Rows / Bubbles</label>
							<input type="number" min="1" max="40" v-model.number="sessionRecordCount">
						</div>
						<div class="rating-scale-presets" style="margin-bottom: 0.5rem;">
							<span class="preset-label">Presets:</span>
							<button type="button" class="btn-scale-preset" :class="{ active: sessionRecordCount === 10 }" @click.stop="sessionRecordCount = 10">10 Rows</button>
							<button type="button" class="btn-scale-preset" :class="{ active: sessionRecordCount === 15 }" @click.stop="sessionRecordCount = 15">15 Rows</button>
							<button type="button" class="btn-scale-preset" :class="{ active: sessionRecordCount === 20 }" @click.stop="sessionRecordCount = 20">20 Rows (Default)</button>
						</div>
						<div style="display: flex; gap: 0.5rem;">
							<button type="button" class="btn-scale-preset" style="flex: 1; padding: 0.35rem 0.5rem;" @click.stop="clearAllSessionBubbles">
								<i class="fas fa-undo"></i> Clear All Bubbles
							</button>
							<button type="button" class="btn-scale-preset" style="flex: 1; padding: 0.35rem 0.5rem;" @click.stop="fillAllSessionBubbles">
								<i class="fas fa-check"></i> Fill All
							</button>
						</div>
					</div>

					<div class="editor-field" v-if="styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
						<label>Singular Noun</label>
						<input type="text" v-model="nounSingular" placeholder="Trait">
					</div>

					<div class="editor-field" v-if="styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
						<label><i class="fas fa-pencil-alt"></i> Reserved Slots for Print</label>
						<input type="number" min="0" max="25" v-model.number="reservedSlots" placeholder="Automatic (matches current traits)">
					</div>

					<div class="editor-field" v-if="styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
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

					<!-- RATING POSITION -->
					<div class="editor-field" v-if="needsDiceUI && styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines'">
						<label>Rating Position</label>
						<select v-model="ratingPosition">
							<option value="inline">Inline with Name (Default)</option>
							<option value="above">Above Name / Box (e.g. Signature Assets)</option>
							<option value="below">Below Name (Centered, e.g. Attributes)</option>
							<option value="none">None (Hide Trait Dice, e.g. Distinctions)</option>
						</select>
					</div>

					<!-- STATEMENT MODE -->
					<div class="editor-field" v-if="styleBody !== 'notes' && styleBody !== 'image' && styleBody !== 'pips' && styleBody !== 'session-record' && styleBody !== 'angled-lines' && styleBody !== 'talents-table' && styleBody !== 'standing'">
						<label>Statement Mode (e.g. Values)</label>
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-statement-mode'" v-model="isStatementSet">
							<label :for="'trait-set-' + traitSetID + '-statement-mode'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Enable Statement Field on Traits</label>
						</div>
						<div class="editor-checkbox-row" v-if="isStatementSet" style="display: flex; align-items: center; gap: 0.4rem; margin-left: 1.25rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-questioned-pip'" v-model="hasQuestionedPip">
							<label :for="'trait-set-' + traitSetID + '-questioned-pip'" style="margin: 0; font-size: 0.75rem; cursor: pointer;">Questioned</label>
						</div>
					</div>

					<!-- COUNTER COLUMN (e.g. BADGES XP) -->
					<div class="editor-field" v-if="styleBody === 'badges-table' || styleBody === 'default' || styleBody === 'list'">
						<label>Counter Column (e.g. Badges XP)</label>
						<div class="editor-checkbox-row" style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem;">
							<input type="checkbox" :id="'trait-set-' + traitSetID + '-counter-col'" v-model="hasCounterColumn">
							<label :for="'trait-set-' + traitSetID + '-counter-col'" style="margin: 0; font-size: 0.8rem; cursor: pointer;">Enable Counter / XP Column</label>
						</div>
						<div v-if="hasCounterColumn" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.35rem;">
							<label style="font-size: 0.75rem; color: #64748b; margin: 0;">Header Label:</label>
							<input type="text" v-model="counterLabel" placeholder="XP" style="width: 5rem;">
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

					<!-- RESTORE TEMPLATE TRAITS (D19) -->
					<div class="editor-field" v-if="restorableTraitNames.length">
						<label>Restore Removed Traits</label>
						<div class="editor-button-group" style="flex-wrap: wrap;">
							<button
								v-for="tname in restorableTraitNames"
								:key="'restore-' + tname"
								type="button"
								class="editor-group-btn"
								@click.stop="restoreTrait(tname)"
								:title="'Restore ‘' + tname + '’ from the template'"
							>
								<i class="fas fa-undo"></i> {{ tname }}
							</button>
						</div>
						<div class="editor-hint">Template traits not on this sheet — restoring clears the removal.</div>
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
			if ( this.$refs.inputName ) {
				this.$refs.inputName.focus( { preventScroll: true } );
			}
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
			// A duplicate is a new set: fresh stable id + fresh internal ids
			// so it never collides with (or shadows) the original in merges.
			delete clone.id;
			cortexFunctions.stripInternalIds({ traitSets: [ clone ] });
			character.traitSets.splice( s + 1, 0, clone );
			cortexFunctions.ensureTraitSetIds( character );
			cortexFunctions.assignLids( character );

			this.updateCharacter( character );
			this.selectElement([ 'traitSet', s + 1 ]);
		},

		restoreTrait( name ) {
			if ( cortexFunctions.restoreTraitOnSheet( this.character, this.templateEntry, this.traitSetID, name ) ) {
				this.updateCharacter( this.character );
			}
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
			let targetIdx = this.findMoveTarget( -1 );
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
			let targetIdx = this.findMoveTarget( 1 );
			if ( targetIdx === -1 ) return;

			let character = this.character;
			let temp = character.traitSets[s];
			character.traitSets[s] = character.traitSets[targetIdx];
			character.traitSets[targetIdx] = temp;

			this.updateCharacter( character );
			this.selectElement([ 'traitSet', targetIdx ]);
		},

		isFullWidthSetByIndex( idx ) {
			if ( !this.isSpotlightSheet ) return false;
			const ctk = this.character?.traitSets?.[ idx ]?.custom?.cortexToolkit;
			const span = ctk?.colSpan ?? ctk?.columnSpan;
			return span === 'full' || Number( span ) >= this.characterColumnCount;
		},

		pageOfSet( idx ) {
			const page = this.character?.traitSets?.[ idx ]?.custom?.cortexToolkit?.page;
			return page === undefined || page === null ? 1 : page;
		},

		columnOfSet( idx ) {
			const loc = this.character?.traitSets?.[ idx ]?.custom?.cortexToolkit?.location;
			if ( loc === 'center' && this.characterColumnCount === 3 ) return 'center';
			return loc === 'right' ? 'right' : 'left';
		},

		// Reorder target for Move Up (-1) / Move Down (+1). Full-width sets
		// are row breaks: column sets can never cross them (or pages), and a
		// full-width set moves one adjacent step so breaks stay deliberate.
		findMoveTarget( dir ) {
			const sets = this.character?.traitSets || [];
			const s = this.traitSetID;
			if ( s === null || s === undefined || s < 0 || s >= sets.length ) return -1;
			const selfPage = this.pageOfSet( s );
			if ( this.isFullWidthSetByIndex( s ) ) {
				const n = s + dir;
				if ( n < 0 || n >= sets.length ) return -1;
				if ( this.pageOfSet( n ) !== selfPage ) return -1;
				return n;
			}
			const col = this.columnOfSet( s );
			for ( let i = s + dir; i >= 0 && i < sets.length; i += dir ) {
				if ( this.pageOfSet( i ) !== selfPage ) return -1;
				if ( this.isFullWidthSetByIndex( i ) ) return -1;
				if ( this.columnOfSet( i ) === col ) return i;
			}
			return -1;
		},

		setHaloConfig( key, value ) {
			let s = this.traitSetID;
			if ( !this.character.traitSets[s].custom ) this.character.traitSets[s].custom = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit ) this.character.traitSets[s].custom.cortexToolkit = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit.haloConfig ) {
				this.character.traitSets[s].custom.cortexToolkit.haloConfig = {
					arcAngle: -90,
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
				arcAngle: -90,
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

		// Generic trait-set label store: one flat dictionary for every
		// style's named regions; defaults resolve centrally per style.
		// Inputs bind :value/@change (and placeholder) to it.
		styleLabel( key ) {
			const labels = this.traitSet?.custom?.cortexToolkit?.labels;
			if ( labels && labels[ key ] !== undefined && labels[ key ] !== null && String( labels[ key ] ).length ) {
				return labels[ key ];
			}
			return cortexFunctions.labelDefaultForStyle( this.styleBody, key );
		},

		setStyleLabel( key, value ) {

			let s = this.traitSetID;
			if ( !this.character.traitSets[s].custom ) {
				this.character.traitSets[s].custom = {};
			}
			if ( !this.character.traitSets[s].custom.cortexToolkit ) {
				this.character.traitSets[s].custom.cortexToolkit = {};
			}
			if ( !this.character.traitSets[s].custom.cortexToolkit.labels ||
			     typeof this.character.traitSets[s].custom.cortexToolkit.labels !== 'object' ) {
				this.character.traitSets[s].custom.cortexToolkit.labels = {};
			}
			this.character.traitSets[s].custom.cortexToolkit.labels[ key ] = value;

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

		setImageConfig( key, value ) {

			let s = this.traitSetID;
			if ( !this.character.traitSets[s].custom ) {
				this.character.traitSets[s].custom = {};
			}
			if ( !this.character.traitSets[s].custom.cortexToolkit ) {
				this.character.traitSets[s].custom.cortexToolkit = {};
			}
			if ( !this.character.traitSets[s].custom.cortexToolkit.imageConfig ) {
				this.character.traitSets[s].custom.cortexToolkit.imageConfig = {};
			}
			this.character.traitSets[s].custom.cortexToolkit.imageConfig[ key ] = value;

			this.updateCharacter( this.character );

		},

		uploadImageStart() {
			if ( this.$refs.imageFileInput ) {
				this.$refs.imageFileInput.click();
			}
		},

		uploadImageProcess( event ) {
			this.uploadError = '';
			if ( !event.target.files || !event.target.files.length ) {
				this.imageURL = '';
				return;
			}
			cortexFunctions.processImageFile( event.target.files[0], 1280, 0.85 ).then(
				( dataURL ) => {
					this.imageURL = dataURL;
					event.target.value = null;
				},
				( error ) => {
					this.uploadError = error?.message || 'Could not process that image.';
					event.target.value = null;
				}
			);
		},

		removeImage() {
			this.imageURL = '';
		},

		isRatingIncluded( size ) {
			return this.ratingScale.includes( size );
		},

		toggleRatingOption( size ) {
			let current = [...this.ratingScale];
			if ( current.includes( size ) ) {
				if ( current.length > 1 ) {
					current = current.filter( s => s !== size );
				}
			} else {
				current.push( size );
				current.sort( ( a, b ) => a - b );
			}
			this.ratingScale = current;
		},

		setRatingPreset( preset ) {
			switch ( preset ) {
				case 'skills':
					this.ratingScale = [ 4, 6 ];
					break;
				case 'specialties':
					this.ratingScale = [ 8, 10, 12 ];
					break;
				case 'stress':
					this.ratingScale = [ 6, 8, 10, 12 ];
					break;
				case 'all':
				default:
					this.ratingScale = [ 4, 6, 8, 10, 12 ];
					break;
			}
		},

		isSubtraitRatingIncluded( size ) {
			return this.subtraitRatingScale.includes( size );
		},

		toggleSubtraitRatingOption( size ) {
			let current = [...this.subtraitRatingScale];
			if ( current.includes( size ) ) {
				if ( current.length > 1 ) {
					current = current.filter( s => s !== size );
				}
			} else {
				current.push( size );
				current.sort( ( a, b ) => a - b );
			}
			this.subtraitRatingScale = current;
		},

		setSubtraitRatingPreset( preset ) {
			switch ( preset ) {
				case 'skills':
					this.subtraitRatingScale = [ 4, 6 ];
					break;
				case 'specialties':
					this.subtraitRatingScale = [ 8, 10, 12 ];
					break;
				case 'all':
				default:
					this.subtraitRatingScale = [ 4, 6, 8, 10, 12 ];
					break;
			}
		},

		getDieDisplayValue( value ) {
			return cortexFunctions.getDieDisplayValue( value );
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

		ensurePipStruct() {
			let s = this.traitSetID;
			if ( !this.character.traitSets[s].custom ) this.character.traitSets[s].custom = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit ) this.character.traitSets[s].custom.cortexToolkit = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit.pips ) {
				this.character.traitSets[s].custom.cortexToolkit.pips = {
					count: 25,
					perRow: 5,
					connected: true,
					filled: 0
				};
			}
		},

		setPipProperty( key, value ) {
			this.ensurePipStruct();
			let s = this.traitSetID;
			this.character.traitSets[s].custom.cortexToolkit.pips[ key ] = value;
			this.updateCharacter( this.character );
		},

		ensureAttachedStressStruct() {
			let s = this.traitSetID;
			if ( !this.character.traitSets[s].custom ) this.character.traitSets[s].custom = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit ) this.character.traitSets[s].custom.cortexToolkit = {};
			if ( !this.character.traitSets[s].custom.cortexToolkit.attachedStress ) {
				this.character.traitSets[s].custom.cortexToolkit.attachedStress = {
					enabled: false,
					label: 'Stress',
					scale: [ 4, 6, 8, 10, 12 ],
					includeOut: false
				};
			}
		},

		setAttachedStressProperty( key, value ) {
			this.ensureAttachedStressStruct();
			let s = this.traitSetID;
			this.character.traitSets[s].custom.cortexToolkit.attachedStress[ key ] = value;
			this.updateCharacter( this.character );
		},

		toggleAttachedStressScale( dieSize ) {
			this.ensureAttachedStressStruct();
			let s = this.traitSetID;
			let currentScale = [ ...(this.character.traitSets[s].custom.cortexToolkit.attachedStress.scale || [ 4, 6, 8, 10, 12 ]) ];
			let idx = currentScale.indexOf( dieSize );
			if ( idx > -1 ) {
				if ( currentScale.length > 1 ) {
					currentScale.splice( idx, 1 );
				}
			} else {
				currentScale.push( dieSize );
				currentScale.sort( ( a, b ) => a - b );
			}
			this.character.traitSets[s].custom.cortexToolkit.attachedStress.scale = currentScale;
			this.updateCharacter( this.character );
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
			if ( !this.$el || typeof this.$el.querySelector !== 'function' ) return;
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

		clearAllSessionBubbles() {
			if ( !this.traitSet || !this.traitSet.traits ) return;
			this.traitSet.traits.forEach( t => {
				if ( !t.custom ) t.custom = {};
				t.custom.checked = false;
				t.value = 0;
			});
			this.updateCharacter( this.character );
		},

		fillAllSessionBubbles() {
			if ( !this.traitSet ) return;
			const count = this.sessionRecordCount;
			if ( !this.traitSet.traits ) this.traitSet.traits = [];
			while ( this.traitSet.traits.length < count ) {
				this.traitSet.traits.push({
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
			this.traitSet.traits.forEach( t => {
				if ( !t.custom ) t.custom = {};
				t.custom.checked = true;
				t.value = 1;
			});
			this.updateCharacter( this.character );
		},

	}

}
