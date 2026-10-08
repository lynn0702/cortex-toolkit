const TraitSetBlock = {

	props: {
		character:            Object,
		traitSetID:           Number,
		submode:              String,
		editing:              Array,
		viewY:                Number,
		printBlank:           Boolean,
		designerPrintPreview:  Boolean,
		printStyle:           String,
	},

	emits: [ 'selectElement', 'updateCharacter', 'removeTrait', 'removeTraitSet', 'addTrait', 'addDieToRoller' ],

	computed: {

		traitSet() {
			return this.character?.traitSets?.[ this.traitSetID ];
		},

		s() {
			return this.traitSetID;
		},

		traitSets() {
			return this.character?.traitSets ?? [];
		},








		columnCount() {
			return Number( this.character?.custom?.cortexToolkit?.columns ) === 3 ? 3 : 2;
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


		isSpotlightPrintStyle() {
			return (this.submode === 'print' || this.designerPrintPreview) && this.isSpotlightStyle;
		},





	},

	methods: {

		getTraitSetLabel( traitSet, key ) {
			const labels = traitSet?.custom?.cortexToolkit?.labels;
			if ( labels && labels[ key ] !== undefined && labels[ key ] !== null && String( labels[ key ] ).length ) {
				return labels[ key ];
			}
			const style = traitSet?.custom?.cortexToolkit?.style?.body;
			return cortexFunctions.labelDefaultForStyle( style, key );
		},
		isSpotlightStyle() {
			return this.sheetStyle === 'spotlight';
		},


		isSelected( selector ) {
			return cortexFunctions.arraysMatch( this.editing, selector );
		},

		renderText( text ) {
			return cortexFunctions.renderText( text );
		},

		renderNotesText( text ) {
			if ( !text ) return '';
			return cortexFunctions.renderMarkdown( text );
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

			const ratingPos = this.getRatingPosition( traitSet );
			if ( ratingPos && ratingPos !== 'inline' ) {
				classes[ 'rating-pos-' + ratingPos ] = true;
			}

			if ( this.isStatementSet( traitSet ) ) {
				classes[ 'trait-set-statement-mode' ] = true;
			}

			if ( this.hasCounterColumn( traitSet ) ) {
				classes[ 'trait-set-has-counter' ] = true;
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

		getRatingPosition( traitSet ) {
			return traitSet?.ratingPosition || traitSet?.custom?.cortexToolkit?.ratingPosition || 'inline';
		},

		isStatementSet( traitSet ) {
			return Boolean( traitSet?.statement ?? traitSet?.custom?.cortexToolkit?.statement );
		},

		hasQuestionedPip( traitSet ) {
			return Boolean( traitSet?.hasQuestionedPip ?? traitSet?.custom?.cortexToolkit?.hasQuestionedPip );
		},

		isTraitQuestioned( trait ) {
			return Boolean( trait?.questioned ?? trait?.custom?.questioned ?? trait?.custom?.cortexToolkit?.questioned );
		},

		toggleTraitQuestioned( s, t ) {
			if ( this.submode === 'print' ) return;
			const trait = this.character?.traitSets?.[s]?.traits?.[t];
			if ( !trait ) return;
			const newVal = !this.isTraitQuestioned( trait );
			trait.questioned = newVal;
			if ( !trait.custom ) trait.custom = {};
			trait.custom.questioned = newVal;
			this.updateCharacter( this.character );
		},

		hasCounterColumn( traitSet ) {
			return Boolean( traitSet?.hasCounterColumn ?? traitSet?.custom?.cortexToolkit?.hasCounterColumn );
		},

		getCounterLabel( traitSet ) {
			return traitSet?.counterLabel || traitSet?.custom?.cortexToolkit?.counterLabel || 'XP';
		},

		getTraitCounter( trait ) {
			return trait?.xp ?? trait?.counter ?? trait?.custom?.xp ?? trait?.custom?.counter ?? trait?.custom?.cortexToolkit?.xp ?? '';
		},

		getTraitStatement( trait ) {
			return trait?.statement ?? trait?.description ?? '';
		},

		renderDieValue( value ) {
			return cortexFunctions.getDieDisplayValue( value );
		},
		selectElement( selector ) {
			this.$emit( 'selectElement', selector );
		},

		updateCharacter( character ) {
			this.$emit( 'updateCharacter', character );
		},

		addTrait( traitSetID ) {
			this.$emit( 'addTrait', traitSetID );
		},

		removeTrait( traitSetID, traitID ) {
			this.$emit( 'removeTrait', traitSetID, traitID );
		},

		removeTraitSet( traitSetID ) {
			this.$emit( 'removeTraitSet', traitSetID );
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
			return {
				name: '',
				value: 0,
				dice: [],
				description: '',
				traits: hasSubtraits ? [{ name: '', value: 0, dice: [] }] : [],
				sfx: [],
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


		renderDieValueForPrint( size, isActive = false ) {
			if ( this.isSpotlightPrintStyle ) {
				const isFilled = this.printBlank ? false : Boolean( isActive );
				return cortexFunctions.renderDieconSVG( size, isFilled, '', this.character?.custom?.cortexToolkit?.diceConfig );
			}
			return this.renderDieValue( size );
		},


		getTraitSetRatings( traitSet ) {
			return cortexFunctions.getTraitSetRatings( traitSet );
		},


		getSubtraitRatings( traitSet ) {
			return cortexFunctions.getSubtraitRatings( traitSet );
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
			if ( body === 'resources' || body === 'resources-count' ) return true;
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


		shouldShowStressOut( traitSet ) {
			const cfg = traitSet?.custom?.cortexToolkit?.stressConfig;
			if ( cfg && typeof cfg.includeOut === 'boolean' ) return cfg.includeOut;
			return true;
		},


		isStressOut( trait ) {
			return trait.value > 12 || trait.isOut === true;
		},


		getSharedHinderLines( traitSet ) {
			const text = this.getSharedHinderText( traitSet );
			return text.split('\n').map(l => l.trim()).filter(Boolean);
		},


		renderHinderLine( line ) {
			let clean = line.replace(/^[•\-\*]\s*/, '');
			return this.renderText( clean );
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


		getDisplayTraitSfx( traitSet, trait ) {
			if ( this.printBlank ) {
				return [];
			}
			if ( !trait?.sfx || !Array.isArray( trait.sfx ) || !trait.sfx.length ) return [];
			const isSharedHinder = Boolean( traitSet?.custom?.cortexToolkit?.sharedHinder );
			let list = trait.sfx;
			if ( isSharedHinder ) {
				list = list.filter( s => s !== 'hinder' && ( typeof s !== 'object' || s.name?.toLowerCase() !== 'hinder' ) );
			}
			return list.map( s => {
				if ( s === 'hinder' || ( typeof s === 'object' && s.name?.toLowerCase() === 'hinder' ) ) {
					return {
						name: 'Hinder',
						isHinder: true,
						description: 'Gain a PP when you switch out this ' + ( traitSet.nounSingular && traitSet.nounSingular.length ? traitSet.nounSingular.toLowerCase() : 'trait' ) + '’s d' + (trait.value || 8) + ' for a d4.'
					};
				}
				return typeof s === 'object' ? s : { name: s, description: '' };
			});
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


		addSessionRecordRow( traitSetIndex ) {
			const ts = this.character.traitSets?.[ traitSetIndex ];
			if ( !ts ) return;
			if ( !ts.traits ) ts.traits = [];
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
			if ( !ts.custom ) ts.custom = {};
			if ( !ts.custom.cortexToolkit ) ts.custom.cortexToolkit = {};
			const ctk = ts.custom.cortexToolkit;
			const needed = ts.traits.length;
			if ( !ctk.sessionRecord ) ctk.sessionRecord = {};
			if ( ( Number(ctk.sessionRecord.count) || 0 ) < needed ) {
				ctk.sessionRecord.count = needed;
			}
			if ( ( Number(ctk.reservedSlots) || 0 ) < needed ) {
				ctk.reservedSlots = needed;
			}
			this.updateCharacter( this.character );
		},


		getImageSetContainerStyle( traitSet ) {
			const h = traitSet?.custom?.cortexToolkit?.imageConfig?.height;
			if ( h && h !== 'auto' ) {
				return { height: h };
			}
			return { minHeight: '140px', height: 'auto' };
		},


		getImageSetGraphicStyle( traitSet ) {
			const url = cortexFunctions.safeImageUrl( traitSet?.custom?.cortexToolkit?.imageConfig?.url );
			if ( !url ) return {};
			return {
				backgroundImage: `url("${url}")`,
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat'
			};
		},


		getBranchGroups( traitSet, items ) {
			const list = items || [];
			const skills = list.filter( it => this.getBranchRole( it.trait ) !== 'specialty' );
			const flats = list.filter( it => !it.isPlaceholder && this.getBranchRole( it.trait ) === 'specialty' );
			const skillIdx = new Set( skills.filter( s => s.originalIndex !== null && s.originalIndex !== undefined ).map( s => s.originalIndex ) );
			const groups = skills.map( skillItem => {
				const sIdx = skillItem.originalIndex;
				const nested = ( skillItem.trait?.traits || [] ).map( ( sub, u ) => ({ kind: 'sub', sub, u }) );
				const linked = flats
					.filter( f => f.trait?.custom?.cortexToolkit?.linkTo === sIdx )
					.map( f => ({ kind: 'flat', item: f }) );
				return { skillItem, subs: [ ...nested, ...linked ] };
			});
			const orphans = flats.filter( f => {
				const lt = f.trait?.custom?.cortexToolkit?.linkTo;
				return !( typeof lt === 'number' && skillIdx.has( lt ) );
			}).map( f => ({ kind: 'flat', item: f }) );
			if ( orphans.length ) {
				groups.push({ skillItem: null, subs: orphans });
			}
			return groups;
		},


		getBranchRole( trait ) {
			return trait?.custom?.cortexToolkit?.branchRole === 'specialty' ? 'specialty' : 'skill';
		},


		handleBranchFlatClick( s, t, trait ) {
			if ( this.submode === 'play' ) {
				if ( trait?.value ) {
					const traitSet = this.character.traitSets[s];
					this.handleSingleDieClick( trait, trait.value, traitSet, s, t );
				}
			} else {
				this.selectElement([ 'trait', s, t ]);
			}
		},


		getStandingComplication( trait ) {
			return trait?.traits?.[0] || null;
		},


		getStandingBonus( trait ) {
			return trait?.traits?.[1] || null;
		},

		getStandingBonusRatings( traitSet ) {
			const ratings = this.getSubtraitRatings( traitSet );
			if ( Array.isArray(ratings) && ratings.length === 5 && ratings[0] === 4 ) {
				return ratings.filter( size => size >= 6 );
			}
			return ratings;
		},


		getSubtraitNameOr( trait, traitSet, index ) {
			const sub = trait?.traits?.[ index ];
			if ( sub && sub.name && String( sub.name ).trim().length ) {
				return sub.name;
			}
			const style = traitSet?.custom?.cortexToolkit?.style?.body;
			return cortexFunctions.labelDefaultForStyle( style, 'slot' + index );
		},


		getTalentEffect( trait ) {
			const sfx = ( trait?.sfx || [] ).find( e => e !== 'hinder' );
			if ( !sfx ) return '';
			if ( typeof sfx === 'string' ) return sfx;
			return sfx.description || sfx.name || '';
		},


		getResourceDiceCount( trait ) {
			const dice = cortexFunctions.getTraitDice( trait );
			return dice.length;
		},


		setResourceDiceCount( s, t, count ) {
			const traitSet = this.character.traitSets[s];
			const trait = traitSet?.traits?.[t];
			if ( !trait ) return;
			const clamped = Math.max( 1, Math.min( 5, Number(count) || 1 ) );
			const ratings = this.getTraitSetRatings( traitSet );
			const size = ( trait.value && trait.value > 0 ) ? trait.value : ( ratings[0] || 6 );
			const dice = [];
			for ( let i = 0; i < clamped; i++ ) dice.push( size );
			cortexFunctions.setTraitDice( trait, dice );
			this.updateCharacter( this.character );
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


		getSessionRecordConfig( traitSet ) {
			const srec = traitSet?.custom?.cortexToolkit?.sessionRecord;
			const reserved = traitSet?.custom?.cortexToolkit?.reservedSlots;
			const traitsLen = traitSet?.traits ? traitSet.traits.length : 0;
			const count = Math.max( 1, srec?.count || reserved || traitsLen || 20 );
			return {
				count: count
			};
		},

		getSharedHinderText( traitSet ) {
			if ( traitSet?.custom?.cortexToolkit?.sharedHinderText?.trim() ) {
				return traitSet.custom.cortexToolkit.sharedHinderText.trim();
			}
			const noun = ( traitSet?.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular.toLowerCase() : 'distinction';
			return `Gain a PP when you trade out your ${noun}'s d8 rating for a d4.`;
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
	},

	/*html*/
	template: `<div :class="getTraitSetClasses(traitSet)">
								<div class="trait-set-header">
									<transition appear>
										<div :class="{'trait-set-header-inner': true, 'selected': isSelected(['traitSet', s])}"
											@click.stop="selectElement([ 'traitSet', s ])"
										>
											<div>{{ traitSet.name }}</div>
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
												@click.stop="handleSessionLineClick(s, item.index)"
											>
												<rect x="20" :y="(55 + item.index * 28) - 14" width="232" height="28" fill="transparent" class="session-hit-area" />
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

										<transition appear>
											<div class="preview-button-container" v-show="submode === 'edit' && !designerPrintPreview">
												<div class="preview-button-container-inner">
													<div class="preview-button" @click.stop="addSessionRecordRow( s )">
														<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Row' }}</span>
													</div>
												</div>
											</div>
										</transition>

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

									<!-- GROWTH LADDER (VERTICAL DICE TRACK, e.g. Safe Zone Growth Pool) -->
									<div class="trait-growth-ladder" v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'growth-ladder'">
										<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="t">
											<div :class="getTraitClasses(item.trait)">
												<div :class="{ 'trait-inner': true, 'growth-rung': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
													@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
													<span class="growth-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
													<span class="growth-name growth-blank" v-else-if="(printBlank || item.isPlaceholder) && item.trait.name"><span class="trait-blank-line"></span></span>
													<div class="trait-value single-die-value" @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
														<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
															:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
															v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"></span>
													</div>
												</div>
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
										<transition appear>
											<div class="preview-button-container" v-show="submode === 'edit' && !designerPrintPreview">
												<div class="preview-button-container-inner">
													<div class="preview-button" @click.stop="addTrait( s )">
														<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait' }}</span>
													</div>
												</div>
											</div>
										</transition>
									</div>

									<!-- DOSSIER FIELDS (STACKED LABELED BLOCKS, e.g. KitBash Forces) -->
									<div class="trait-dossier" v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'dossier-fields'">
										<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="t">
											<div :class="getTraitClasses(item.trait)">
												<div :class="{ 'trait-inner': true, 'dossier-field': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
													@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
													<span class="dossier-label" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
													<span class="dossier-label dossier-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
													<span class="dossier-label" v-else>{{ item.trait.name || '' }}</span>
													<span class="dossier-text" v-if="!printBlank && !item.isPlaceholder && item.trait.description" v-html="renderText(item.trait.description)"></span>
													<span class="dossier-text dossier-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
													<span class="dossier-text dossier-hint" v-else-if="submode === 'edit' && !designerPrintPreview">Click to add text...</span>
													<span class="dossier-text" v-else></span>
												</div>
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
										<transition appear>
											<div class="preview-button-container" v-show="submode === 'edit' && !designerPrintPreview">
												<div class="preview-button-container-inner">
													<div class="preview-button" @click.stop="addTrait( s )">
														<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait' }}</span>
													</div>
												</div>
											</div>
										</transition>
									</div>

																		<!-- SKILLS & SPECIALTIES (BRANCHED SKILL GRID, e.g. Alien Us / Safe Zone / SolarPunk) -->
									<div class="trait-skills-branch" v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'skills-specialties'">
										<div class="skills-branch-head"><span>{{ getTraitSetLabel(traitSet, 'left') }}</span><span>{{ getTraitSetLabel(traitSet, 'right') }}</span></div>
										<template v-for="(group, gi) in getBranchGroups(traitSet, getRenderedTraits(traitSet, s))" :key="gi">
											<div :class="group.skillItem ? getTraitClasses(group.skillItem.trait) : {}" v-if="group.skillItem">
												<div :class="{ 'trait-inner': true, 'selected': !group.skillItem.isPlaceholder && isSelected(['trait', s, group.skillItem.originalIndex]), 'trait-placeholder-slot': group.skillItem.isPlaceholder }" @click.stop="!group.skillItem.isPlaceholder ? selectElement([ 'trait', s, group.skillItem.originalIndex ]) : null">
													<div class="skill-branch-row">
														<div class="skill-branch-skill">
															<span class="trait-name" v-if="!printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.name">{{ group.skillItem.trait.name }}</span>
															<span class="trait-name trait-name-blank" v-else-if="printBlank || group.skillItem.isPlaceholder"><span class="trait-blank-line"></span></span>
															<span class="trait-name" v-else>{{ group.skillItem.trait.name || '' }}</span>
															<div class="trait-value single-die-value" @click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(group.skillItem.trait, group.skillItem.trait.value, traitSet, s, group.skillItem.originalIndex) : null">
																<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
																	:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.value === size }"
																	v-html="renderDieValueForPrint(size, !printBlank && !group.skillItem.isPlaceholder && group.skillItem.trait.value === size)"></span>
															</div>
														</div>
														<div class="skill-branch-link" aria-hidden="true"></div>
														<div class="skill-branch-specialties">
															<template v-for="(entry, ei) in group.subs" :key="'sub-' + ei">
																<div class="specialty-row" v-if="entry.kind === 'sub'"
																	@click.stop="!printBlank && !group.skillItem.isPlaceholder ? handleSingleDieClick(entry.sub, entry.sub.value, traitSet, s, group.skillItem.originalIndex) : null">
																	<span class="subtrait-name" v-if="!printBlank && entry.sub.name">{{ entry.sub.name }}</span>
																	<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
																	<div class="subtrait-value">
																		<span v-for="size in getSubtraitRatings(traitSet)" :key="size"
																			:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && entry.sub.value === size }"
																			v-html="renderDieValueForPrint(size, !printBlank && entry.sub.value === size)"></span>
																	</div>
																</div>
																<div class="specialty-row" v-if="entry.kind === 'flat'"
																	@click.stop="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null">
																	<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
																	<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
																	<div class="subtrait-value">
																		<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
																			:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && entry.item.trait.value === size }"
																			v-html="renderDieValueForPrint(size, !printBlank && entry.item.trait.value === size)"></span>
																	</div>
																	<transition name="editor" appear>
																		<trait-editor
																			:character="character"
																			:open="isSelected(['trait', s, entry.item.originalIndex])"
																			v-show="submode === 'edit' && isSelected(['trait', s, entry.item.originalIndex])"
																			:traitSetID="s"
																			:traitID="entry.item.originalIndex"
																			:viewY="viewY"
																			@selectElement="selectElement"
																			@updateCharacter="updateCharacter"
																			@removeTrait="removeTrait"
																		></trait-editor>
																	</transition>
																</div>
															</template>
															<div class="specialty-row specialty-blank-row" v-if="printBlank && !group.subs.length">
																<span class="subtrait-name"><span class="trait-blank-line subtrait-blank-line"></span></span>
																<div class="subtrait-value">
																	<span v-for="size in getSubtraitRatings(traitSet)" :key="size" class="c" v-html="renderDieValueForPrint(size, false)"></span>
																</div>
															</div>
															<div class="specialty-empty" v-if="!group.subs.length && !printBlank && !group.skillItem.isPlaceholder && submode === 'edit' && !designerPrintPreview">Select to add specialties</div>
														</div>
													</div>
												</div>
												<transition name="editor" appear>
													<trait-editor
														v-if="!group.skillItem.isPlaceholder"
														:character="character"
														:open="isSelected(['trait', s, group.skillItem.originalIndex])"
														v-show="submode === 'edit' && isSelected(['trait', s, group.skillItem.originalIndex])"
														:traitSetID="s"
														:traitID="group.skillItem.originalIndex"
														:viewY="viewY"
														@selectElement="selectElement"
														@updateCharacter="updateCharacter"
														@removeTrait="removeTrait"
													></trait-editor>
												</transition>
											</div>
											<div class="skill-branch-orphans" v-else>
												<div class="skill-branch-row">
													<div class="skill-branch-skill"></div>
													<div class="skill-branch-link" aria-hidden="true"></div>
													<div class="skill-branch-specialties">
														<template v-for="(entry, ei) in group.subs" :key="'orph-' + ei">
															<div class="specialty-row" v-if="entry.kind === 'flat'"
																@click.stop="!printBlank ? handleBranchFlatClick(s, entry.item.originalIndex, entry.item.trait) : null">
																<span class="subtrait-name" v-if="!printBlank && entry.item.trait.name">{{ entry.item.trait.name }}</span>
																<span class="subtrait-name" v-else-if="printBlank"><span class="trait-blank-line subtrait-blank-line"></span></span>
																<div class="subtrait-value">
																	<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
																		:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && entry.item.trait.value === size }"
																		v-html="renderDieValueForPrint(size, !printBlank && entry.item.trait.value === size)"></span>
																</div>
																<transition name="editor" appear>
																	<trait-editor
																		:character="character"
																		:open="isSelected(['trait', s, entry.item.originalIndex])"
																		v-show="submode === 'edit' && isSelected(['trait', s, entry.item.originalIndex])"
																		:traitSetID="s"
																		:traitID="entry.item.originalIndex"
																		:viewY="viewY"
																		@selectElement="selectElement"
																		@updateCharacter="updateCharacter"
																		@removeTrait="removeTrait"
																	></trait-editor>
																</transition>
															</div>
														</template>
													</div>
												</div>
											</div>
										</template>
										<transition appear>
											<div class="preview-button-container" v-show="submode === 'edit' && !designerPrintPreview">
												<div class="preview-button-container-inner">
													<div class="preview-button" @click.stop="addTrait( s )">
														<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait' }}</span>
													</div>
												</div>
											</div>
										</transition>
									</div>
									
									<!-- TALENTS TABLE (TALENT / ACTIVATION / EFFECT) -->
									<div class="trait-talents-table" v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'talents-table'">
										<div class="talents-head"><span>{{ getTraitSetLabel(traitSet, 'col1') }}</span><span>{{ getTraitSetLabel(traitSet, 'col2') }}</span><span>{{ getTraitSetLabel(traitSet, 'col3') }}</span></div>
										<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="t">
											<div :class="getTraitClasses(item.trait)">
												<div :class="{ 'trait-inner': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
													@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
													<div class="talent-row">
														<span class="talent-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
														<span class="talent-name talent-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
														<span class="talent-name" v-else>{{ item.trait.name || '' }}</span>
														<span class="talent-activation" v-if="!printBlank && !item.isPlaceholder && item.trait.description" v-html="renderText(item.trait.description)"></span>
														<span class="talent-activation talent-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
														<span class="talent-activation" v-else></span>
														<span class="talent-effect" v-if="!printBlank && !item.isPlaceholder && getTalentEffect(item.trait)" v-html="renderText(getTalentEffect(item.trait))"></span>
														<span class="talent-effect talent-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
														<span class="talent-effect" v-else></span>
													</div>
												</div>
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
										<transition appear>
											<div class="preview-button-container" v-show="submode === 'edit' && !designerPrintPreview">
												<div class="preview-button-container-inner">
													<div class="preview-button" @click.stop="addTrait( s )">
														<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait' }}</span>
													</div>
												</div>
											</div>
										</transition>
									</div>

									<!-- STANDING (STANDING DIE + COMPLICATION & BONUS DICE, e.g. Camp Bewilderwood) -->
									<div class="trait-standing" v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'standing'">
										<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="t">
											<div :class="getTraitClasses(item.trait)">
												<div :class="{ 'trait-inner': true, 'standing-row-wrap': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
													@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
													<div class="standing-header-row">
														<span class="standing-name-box">
															<span class="standing-name-text" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
															<span class="standing-blank-line" v-else-if="printBlank || item.isPlaceholder"></span>
															<span class="standing-placeholder-hint" v-else-if="submode === 'edit' && !designerPrintPreview">Name</span>
															<span class="standing-blank-line" v-else></span>
														</span>
														<span class="standing-statement-box">
															<span class="standing-statement-text" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait)" v-html="renderText(getTraitStatement(item.trait))"></span>
															<span class="standing-blank-line" v-else-if="printBlank || item.isPlaceholder"></span>
															<span class="standing-placeholder-hint" v-else-if="submode === 'edit' && !designerPrintPreview">Statement</span>
															<span class="standing-blank-line" v-else></span>
														</span>
													</div>
													<div class="standing-dice-row">
														<div class="standing-main-dice single-die-value" @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
															<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
																:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
																v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"></span>
														</div>
														<div class="standing-sub-group">
															<div class="standing-sub-row">
																<span class="standing-sub-label">{{ getSubtraitNameOr(item.trait, traitSet, 0) }} •</span>
																<div class="subtrait-value" v-if="!item.isPlaceholder && getStandingComplication(item.trait)"
																	@click.stop="!printBlank ? handleSingleDieClick(getStandingComplication(item.trait), getStandingComplication(item.trait).value, traitSet, s, item.originalIndex) : null">
																	<span v-for="size in getSubtraitRatings(traitSet)" :key="size"
																		:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && getStandingComplication(item.trait).value === size }"
																		v-html="renderDieValueForPrint(size, !printBlank && getStandingComplication(item.trait).value === size)"></span>
																</div>
																<div class="subtrait-value" v-else>
																	<span v-for="size in getSubtraitRatings(traitSet)" :key="size"
																		:class="{ 'c': !isSpotlightPrintStyle, 'active': false }"
																		v-html="renderDieValueForPrint(size, false)"></span>
																</div>
															</div>
															<div class="standing-sub-row">
																<span class="standing-sub-label">{{ getSubtraitNameOr(item.trait, traitSet, 1) }} •</span>
																<div class="subtrait-value" v-if="!item.isPlaceholder && getStandingBonus(item.trait)"
																	@click.stop="!printBlank ? handleSingleDieClick(getStandingBonus(item.trait), getStandingBonus(item.trait).value, traitSet, s, item.originalIndex) : null">
																	<span v-for="size in getStandingBonusRatings(traitSet)" :key="size"
																		:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && getStandingBonus(item.trait).value === size }"
																		v-html="renderDieValueForPrint(size, !printBlank && getStandingBonus(item.trait).value === size)"></span>
																</div>
																<div class="subtrait-value" v-else>
																	<span v-for="size in getStandingBonusRatings(traitSet)" :key="size"
																		:class="{ 'c': !isSpotlightPrintStyle, 'active': false }"
																		v-html="renderDieValueForPrint(size, false)"></span>
																</div>
															</div>
														</div>
													</div>
												</div>
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
										<transition appear>
											<div class="preview-button-container" v-show="submode === 'edit' && !designerPrintPreview">
												<div class="preview-button-container-inner">
													<div class="preview-button" @click.stop="addTrait( s )">
														<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait' }}</span>
													</div>
												</div>
											</div>
										</transition>
									</div>

									<!-- BADGES / CHECKLIST TABLE (NAME + DIE PER ROW, OPTIONAL COUNTER/XP COLUMN) -->
									<div class="trait-badges-table" v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'badges-table'">
										<div class="badges-head" v-if="hasCounterColumn(traitSet)">
											<span class="badges-head-name">{{ traitSet.name }}</span>
											<span class="badges-head-counter">{{ getCounterLabel(traitSet) }}</span>
										</div>
										<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="t">
											<div :class="getTraitClasses(item.trait)">
												<div :class="{ 'trait-inner': true, 'badge-row': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
													@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
													<span class="badge-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
													<span class="badge-name badge-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
													<span class="badge-name" v-else>{{ item.trait.name || '' }}</span>
													<div class="trait-value single-die-value" @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
														<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
															:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
															v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"></span>
													</div>
													<span class="badge-counter-box" v-if="hasCounterColumn(traitSet)">
														{{ (!printBlank && !item.isPlaceholder) ? getTraitCounter(item.trait) : '' }}
													</span>
												</div>
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
										<transition appear>
											<div class="preview-button-container" v-show="submode === 'edit' && !designerPrintPreview">
												<div class="preview-button-container-inner">
													<div class="preview-button" @click.stop="addTrait( s )">
														<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait' }}</span>
													</div>
												</div>
											</div>
										</transition>
									</div>

									<!-- RESOURCES WITH DICE COUNT (RATING DIE + DICE 1-5, e.g. Cosa Nostra) -->
									<div class="trait-resources-count" v-else-if="traitSet?.custom?.cortexToolkit?.style?.body === 'resources-count'">
										<template v-for="(item, t) in getRenderedTraits(traitSet, s)" :key="t">
											<div :class="getTraitClasses(item.trait)">
												<div :class="{ 'trait-inner': true, 'resource-row': true, 'selected': !item.isPlaceholder && isSelected(['trait', s, item.originalIndex]), 'trait-placeholder-slot': item.isPlaceholder }"
													@click.stop="!item.isPlaceholder ? selectElement([ 'trait', s, item.originalIndex ]) : null">
													<span class="trait-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
													<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder"><span class="trait-blank-line"></span></span>
													<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
													<span class="resource-rating-label">{{ getTraitSetLabel(traitSet, 'rating') }}</span>
													<div class="trait-value single-die-value" @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
														<span v-for="size in getTraitSetRatings(traitSet)" :key="size"
															:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
															v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"></span>
													</div>
													<span class="resource-count-label">{{ getTraitSetLabel(traitSet, 'dice') }}</span>
													<div class="resource-count">
														<span v-for="n in [1, 2, 3, 4, 5]" :key="n" class="count-pip"
															:class="{ 'filled': !printBlank && !item.isPlaceholder && getResourceDiceCount(item.trait) >= n }"
															@click.stop="submode === 'edit' && !printBlank && !item.isPlaceholder ? setResourceDiceCount(s, item.originalIndex, n) : null"
															:title="submode === 'edit' && !item.isPlaceholder ? 'Set dice count to ' + n : ''">{{ n }}</span>
													</div>
												</div>
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
										<transition appear>
											<div class="preview-button-container" v-show="submode === 'edit' && !designerPrintPreview">
												<div class="preview-button-container-inner">
													<div class="preview-button" @click.stop="addTrait( s )">
														<span><i class="fas fa-plus"></i> {{ ( traitSet.nounSingular && traitSet.nounSingular.length ) ? traitSet.nounSingular : 'Trait' }}</span>
													</div>
												</div>
											</div>
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
														<!-- RATING POSITION ABOVE (e.g. Signature Assets) -->
														<template v-if="getRatingPosition(traitSet) === 'above'">
															<div class="trait-asset-card">
																<div class="trait-value single-die-value" @click.stop="!printBlank && !item.isPlaceholder ? handleSingleDieClick(item.trait, item.trait.value, traitSet, s, item.originalIndex) : null">
																	<span
																		v-for="size in getTraitSetRatings(traitSet)"
																		:key="size"
																		:class="{ 'c': !isSpotlightPrintStyle, 'active': !printBlank && !item.isPlaceholder && item.trait.value === size }"
																		v-html="renderDieValueForPrint(size, !printBlank && !item.isPlaceholder && item.trait.value === size)"
																	></span>
																</div>
																<div class="trait-asset-box">
																	<div class="trait-asset-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</div>
																	<div class="trait-asset-desc" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait)" v-html="renderText(getTraitStatement(item.trait))"></div>
																	<div class="trait-asset-empty" v-else-if="printBlank || item.isPlaceholder"></div>
																	<div class="trait-asset-hint" v-else-if="submode === 'edit' && !designerPrintPreview">Click to edit asset...</div>
																	<div class="trait-asset-empty" v-else></div>
																</div>
															</div>
														</template>

														<!-- STANDARD OR OTHER RATING POSITIONS (INLINE, BELOW, NONE) -->
														<template v-else>
															<h2 class="trait-title" :class="{ 'trait-title-statement': isStatementSet(traitSet), 'trait-title-stacked': getRatingPosition(traitSet) === 'below' }">
																<span class="list-bullet" v-if="traitSet?.custom?.cortexToolkit?.style?.body === 'list'">•</span>
																<span
																	class="distinction-die"
																	v-if="isSpotlightPrintStyle && traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions' && getTraitSetRatings(traitSet).length <= 1 && getRatingPosition(traitSet) !== 'none'"
																	v-html="renderDieValueForPrint(item.trait.value || 8, !printBlank && !item.isPlaceholder && item.trait.value > 0)"
																></span>

																<!-- STATEMENT MODE (e.g. Values) -->
																<template v-if="isStatementSet(traitSet)">
																	<span class="trait-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
																	<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder">
																		<template v-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
																			{{ item.trait.name }}
																		</template>
																		<template v-else>
																			<span class="trait-blank-line"></span>
																		</template>
																	</span>
																	<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
																	<span v-if="hasQuestionedPip(traitSet)" class="statement-pip" :class="{ 'questioned': isTraitQuestioned(item.trait) }" @click.stop="toggleTraitQuestioned(s, item.originalIndex)" :title="submode === 'play' ? (isTraitQuestioned(item.trait) ? 'Questioned (click to reset)' : 'Click to question') : ''"></span>
																	<span class="trait-statement-box">
																		<span class="trait-statement-text" v-if="!printBlank && !item.isPlaceholder && getTraitStatement(item.trait)" v-html="renderText(getTraitStatement(item.trait))"></span>
																		<span class="trait-statement-blank" v-else-if="printBlank || item.isPlaceholder"></span>
																		<span class="trait-statement-hint" v-else-if="submode === 'edit' && !designerPrintPreview">Statement...</span>
																		<span class="trait-statement-blank" v-else></span>
																	</span>
																</template>

																<!-- NORMAL TRAIT NAME -->
																<template v-else>
																	<span class="trait-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">{{ item.trait.name }}</span>
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
																	<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
																</template>

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

																<!-- DISTINCTIONS STYLE IN SPOTLIGHT: VALUE IS IN TITLE ONLY IF SINGLE FIXED RATING (EXCEPT ON BLANK PRINT SHEET WHERE FILLABLE DICE ARRAY IS EXPECTED) -->
																<div class="trait-value" v-else-if="!printBlank && isSpotlightPrintStyle && traitSet?.custom?.cortexToolkit?.style?.body === 'distinctions' && getTraitSetRatings(traitSet).length <= 1"></div>

																<!-- NONE RATING POSITION: NO VALUE (EXCEPT ON BLANK PRINT SHEET WHERE FILLABLE DICE ARRAY IS EXPECTED) -->
																<div class="trait-value" v-else-if="!printBlank && getRatingPosition(traitSet) === 'none'"></div>

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
																v-if="traitSet?.custom?.cortexToolkit?.features?.description && !isStatementSet(traitSet)"
															>
																<div v-if="!printBlank && !item.isPlaceholder && item.trait.description" v-html="renderText(item.trait.description)"></div>
																<div class="desc-blank-area" v-else-if="printBlank || item.isPlaceholder">
																	<div class="desc-blank-line"></div>
																</div>
															</div>
														</template>

														<ul class="subtraits" v-if="traitSet?.custom?.cortexToolkit?.features?.subtraits && (item.trait.traits?.length || printBlank)">
															<li class="subtrait" v-for="(subtrait, u) in (item.trait.traits?.length ? item.trait.traits : (printBlank ? [{ name: '', value: 0 }] : []))" :key="u" @click.stop="!printBlank ? handleSingleDieClick(subtrait, subtrait.value, traitSet, s, item.originalIndex) : null">
																<span class="subtrait-name" v-if="!printBlank && subtrait.name">{{ subtrait.name }}</span>
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
																<span class="sfx-placeholder-hint" v-else-if="submode === 'edit' && !designerPrintPreview" @click.stop="selectElement(['trait', s, item.originalIndex])">Click to set SFX...</span>
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

														<ul class="trait-sfx" v-else-if="!traitSet?.custom?.cortexToolkit?.sharedHinder && traitSet?.custom?.cortexToolkit?.features?.sfx && getDisplayTraitSfx(traitSet, item.trait).length">
															<li v-for="(sfx, sfIdx) in getDisplayTraitSfx(traitSet, item.trait)" :key="sfIdx">
																<template v-if="sfx.isHinder">
																	<span class="trait-sfx-name">Hinder</span>:
																	<span class="trait-sfx-description"
																		v-html="renderText(sfx.description)"
																	></span>
																</template>
																<template v-else>
																	<span class="trait-sfx-name">{{ sfx.name || sfx }}</span>:
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
												v-show="submode === 'edit' && !designerPrintPreview"
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
											<span class="sfx-name">{{ sfx.name }}</span>:
											<span class="sfx-description" v-html="renderText(sfx.description)"></span>
										</li>
									</ul>
								</div>

								<!-- RIGHT HEADER (OPTIONAL VERTICAL LABEL) -->
								<div class="trait-set-header trait-set-header-right" v-if="traitSet?.custom?.cortexToolkit?.headerRight">
									<div class="trait-set-header-inner">
										<div>{{ traitSet.custom.cortexToolkit.headerRight }}</div>
									</div>
								</div>
							</div>`,

};
