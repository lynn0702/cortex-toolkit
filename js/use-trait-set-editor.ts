import { ref, computed, onMounted, onUnmounted, onUpdated, watch, nextTick, provide, inject, getCurrentInstance, type InjectionKey } from 'vue';
import { cortexFunctions } from './functions.ts';
import { getSpotlightSections } from './spotlight-grid.ts';
import { getView, ensureView } from './model.ts';
import type { Character, TraitSet, CortexToolkitCustom, RingConfig, SetFeatures, StressConfig, ImageConfig, PipsConfig, AttachedStressConfig } from './model.ts';

export interface TraitSetEditorApi {
	[ key: string ]: any;
}

export interface TraitSetEditorProps {
	character: Character;
	traitSetID: number;
	open?: boolean;
	viewY?: number | null;
}

export const TRAIT_SET_EDITOR_KEY: InjectionKey<TraitSetEditorApi> = Symbol( 'traitSetEditorApi' );

export function useTraitSetEditor( props: TraitSetEditorProps, emit: any ): TraitSetEditorApi {
	const inst = getCurrentInstance();

	const rootEl = ref<any>( null );
	const inputName = ref<any>( null );
	const imageFileInput = ref<any>( null );

	const scrollPosition = ref( 'none' );
	const anchorPosition = ref( 'top' );
	const showDeleteConfirm = ref( false );
	const uploadError = ref( '' );

	const styleOptions = [
		{ id: 'default',              label: 'Default' },
		{ id: 'portrait-ring',        label: 'Portrait Ring' },
		{ id: 'two-columns-compact',  label: 'Compact Columns' },
		{ id: 'two-columns-detailed', label: 'Detailed Columns' },
		{ id: 'distinctions',         label: 'Distinctions' },
		{ id: 'assets',               label: 'Assets' },
		{ id: 'resources',            label: 'Resources' },
		{ id: 'dice-count',           label: 'Dice Count' },
		{ id: 'subtrait-columns',     label: 'Subtrait Columns' },
		{ id: 'paired-slots',         label: 'Paired Slots' },
		{ id: 'die-rows',             label: 'Die Rows' },
		{ id: 'three-column-table',   label: 'Three Column Table' },
		{ id: 'dice-ladder',          label: 'Dice Ladder' },
		{ id: 'labeled-fields',       label: 'Labeled Fields' },
		{ id: 'stress',               label: 'Stress' },
		{ id: 'list',                 label: 'List' },
		{ id: 'notes',                label: 'Notes' },
		{ id: 'image',                label: 'Image' },
		{ id: 'pips',                 label: 'Pips' },
		{ id: 'session-record',       label: 'Session Record' },
	];

	const traitSet = computed( () => props.character?.traitSets?.[ props.traitSetID ] || null );
	const character = computed( () => props.character );
	const traitSetID = computed( () => props.traitSetID );

	const name = computed({
		get: () => traitSet.value?.name ?? '',
		set: ( v: string ) => setProperty( 'name', v )
	});

	const description = computed({
		get: () => traitSet.value?.description ?? '',
		set: ( v: string ) => setProperty( 'description', v )
	});

	const nounSingular = computed({
		get: () => traitSet.value?.nounSingular ?? '',
		set: ( v: string ) => setProperty( 'nounSingular', v )
	});

	const nounPlural = computed({
		get: () => {
			const stored = traitSet.value?.nounPlural;
			if ( stored !== undefined && stored !== null && stored !== '' ) return stored;
			const singular = traitSet.value?.nounSingular;
			return ( singular && singular.length ) ? singular + 's' : '';
		},
		set: ( v: string ) => setProperty( 'nounPlural', v )
	});

	const styleBody = computed({
		get: () => {
			const body = getView( traitSet.value )?.style?.body;
			if ( body === 'portrait-ring' || body === 'attributes' ) {
				return 'portrait-ring';
			}
			// Backwards compatibility: default Attributes trait set to Ring when no style (or default) is specified
			if ( !body || body === 'default' ) {
				if ( getView( traitSet.value )?.location === 'attributes' ||
					( isAttributesSet.value && cortexFunctions.getRingTrait( traitSet.value ) !== false ) ) {
					return 'portrait-ring';
				}
			}
			return body || 'default';
		},
		set: ( value: string ) => {
			if ( value === 'portrait-ring' ) {
				// 1. Unset ring on any other trait sets in this character
				props.character.traitSets.forEach( ( ts: any, idx: number ) => {
					if ( idx !== props.traitSetID ) {
						const tsBody = getView( ts )?.style?.body;
						if ( tsBody === 'portrait-ring' || tsBody === 'attributes' || getView( ts )?.location === 'attributes' || cortexFunctions.getRingTrait( ts ) ) {
							const view = ensureView( ts );
							if ( !view.style ) view.style = {};
							view.style.body = 'default';
							view.style.header = 'default';
							view.location = 'right';
							view.ringTrait = false;
						}
					}
				});

				// 2. Set ring on this trait set
				const view = ensureView( traitSet.value );
				if ( !view.style ) view.style = {};
				view.style.body = 'portrait-ring';
				view.style.header = 'portrait-ring';
				view.location = 'attributes';
				view.ringTrait = true;
				view.isAttributes = true;
			} else {
				const view = ensureView( traitSet.value );
				if ( !view.style ) view.style = {};
				view.style.body = value;
				view.style.header = value;
				if ( view.location === 'attributes' ) {
					view.location = 'right';
				}
				view.ringTrait = false;
				// Spotlight PDF styles: seed the feature flags their layouts need.
				if ( !view.features ) {
					view.features = { description: false, sfx: false, subtraits: false };
				}
				const styleDefaults = cortexFunctions.defaultFeaturesForStyle( value );
				Object.assign( view.features, styleDefaults.features );
				if ( styleDefaults.multiDie ) {
					view.multiDie = true;
				}
			}
			updateCharacter( props.character );
		}
	});

	const isRing = computed( () => styleBody.value === 'portrait-ring' );

	const isAttributesSet = computed( () => Boolean(
		getView( traitSet.value )?.location === 'attributes' ||
		getView( traitSet.value )?.isAttributes ||
		getView( traitSet.value )?.style?.body === 'attributes' ||
		getView( traitSet.value )?.style?.body === 'portrait-ring' ||
		traitSet.value?.nounSingular?.toLowerCase() === 'attribute' ||
		traitSet.value?.name?.trim().toLowerCase() === 'attributes'
	) );

	const ringTrait = computed({
		get: () => isRing.value,
		set: ( value: boolean ) => { styleBody.value = value ? 'portrait-ring' : 'default'; }
	});

	const pageNumber = computed({
		get: () => getView( traitSet.value )?.page ?? 1,
		set: ( val: number ) => {
			ensureView( traitSet.value ).page = val;
			if ( val > 1 && ( !getView( props.character )?.pageCount || Number( getView( props.character )?.pageCount ) < val ) ) {
				ensureView( props.character ).pageCount = val;
			}
			updateCharacter();
		}
	});

	const characterColumnCount = computed( () => {
		const c = Number( getView( props.character )?.columns );
		return ( c === 2 || c === 3 ) ? c : 2;
	} );

	const columnLocation = computed( () => {
		const loc = String( getView( traitSet.value )?.location || '' ).toLowerCase().trim();
		if ( characterColumnCount.value === 3 ) {
			if ( loc === 'center' || loc === '2' || loc === 'col-2' ) return 'center';
			if ( loc === 'right' || loc === '3' || loc === 'col-3' ) return 'right';
			return 'left';
		}
		return ( loc === 'right' || loc === '2' ) ? 'right' : 'left';
	});

	// Track count for THIS set's page (page 2 may override via columnsPage2).
	const setTrackCount = computed( () => {
		if ( ( getView( traitSet.value )?.page ?? 1 ) === 2 ) {
			const override = Number( getView( props.character )?.columnsPage2 );
			if ( override === 2 || override === 3 ) return override;
		}
		return characterColumnCount.value;
	});

	const isFullWidthSpan = computed({
		get: () => {
			const span = getView( traitSet.value )?.span ?? getView( traitSet.value )?.colSpan ?? getView( traitSet.value )?.columnSpan;
			return span === 'full' || Number( span ) >= setTrackCount.value;
		},
		set: ( val: boolean ) => {
			if ( val ) {
				setCustomProperty( 'colSpan', 'full' );
			} else {
				setCustomProperty( 'colSpan', 1 );
			}
		}
	});

	const colSpan = computed({
		get: () => {
			const span = getView( traitSet.value )?.span ?? getView( traitSet.value )?.colSpan ?? getView( traitSet.value )?.columnSpan;
			if ( span === 'full' ) return setTrackCount.value;
			return Number( span ) || 1;
		},
		set: ( val: number | 'full' ) => {
			setCustomProperty( 'colSpan', val === 'full' ? 'full' : Math.max( 1, Number( val ) || 1 ) );
		}
	});

	// Starts a fresh row band before this set so consecutive bands can
	// carry different column shares (e.g. 66/34 above 40/60).
	const rowBreak = computed({
		get: () => getView( traitSet.value )?.rowBreak === true,
		set: ( val: boolean ) => { setCustomProperty( 'rowBreak', val ? true : null ); }
	});

	const templateEntry = computed( () => {
		const root = inst?.proxy?.$root as any;
		return cortexFunctions.resolveTemplateFor( props.character, root ? root.sheetTemplates : null );
	});

	// Template traits by name not currently on this sheet (D19 restore menu).
	const restorableTraitNames = computed( () => cortexFunctions.restorableTraits( props.character, templateEntry.value, props.traitSetID ) );

	// Track (1 | 2 | 3), Span (1 | 2 | 3), Band Widths ([w1, w2, w3]), Flex (filler)
	function getBandAnchorSet(): TraitSet | null {
		const sets = props.character?.traitSets || [];
		const p = getView( traitSet.value )?.page || 1;
		const sections = getSpotlightSections( sets, p );
		for ( const sec of sections ) {
			if ( sec.ordered.some( ( item: any ) => item.index === props.traitSetID ) ) {
				return sec.ordered[0]?.traitSet || null;
			}
		}
		return traitSet.value;
	}

	const track = computed({
		get: (): 1 | 2 | 3 => {
			const tr = getView( traitSet.value )?.track;
			if ( tr === 1 || tr === 2 || tr === 3 ) return tr;
			const loc = String( getView( traitSet.value )?.location || '' ).toLowerCase().trim();
			if ( loc === 'center' || loc === 'middle' || loc === '2' || loc === 'col-2' ) return 2;
			if ( loc === 'right' || loc === '3' || loc === 'col-3' ) return 3;
			return 1;
		},
		set: ( val: number ) => {
			const tr = ( val === 2 || val === 3 ) ? val : 1;
			setCustomProperty( 'track', tr );
			const ctk = getView( traitSet.value );
			if ( ctk && ctk.location !== 'header' && ctk.location !== undefined ) {
				delete ctk.location;
			}
		}
	});

	const span = computed({
		get: (): 1 | 2 | 3 => {
			const sp = getView( traitSet.value )?.span;
			if ( sp === 1 || sp === 2 || sp === 3 ) return sp;
			const raw = getView( traitSet.value )?.colSpan ?? getView( traitSet.value )?.columnSpan;
			if ( raw === 'full' || Number( raw ) >= 3 ) return 3;
			if ( Number( raw ) === 2 ) return 2;
			return 1;
		},
		set: ( val: number ) => {
			const sp = ( val === 2 || val === 3 ) ? val : 1;
			setCustomProperty( 'span', sp );
			const ctk = getView( traitSet.value );
			if ( ctk ) {
				delete ctk.colSpan;
				delete ctk.columnSpan;
			}
		}
	});

	const bandWidths = computed({
		get: (): [number, number, number] => {
			const anchor = getBandAnchorSet();
			const w = getView( anchor )?.widths;
			if ( Array.isArray( w ) && w.length === 3 ) {
				return [ Number( w[0] ), Number( w[1] ), Number( w[2] ) ];
			}
			return [ 33.333, 33.333, 33.334 ];
		},
		set: ( val: [number, number, number] ) => {
			const anchor = getBandAnchorSet() || traitSet.value;
			if ( anchor ) {
				ensureView( anchor ).widths = [ Number( val[0] ), Number( val[1] ), Number( val[2] ) ];
				updateCharacter( props.character );
			}
		}
	});

	const flex = computed({
		get: () => getView( traitSet.value )?.flex !== false,
		set: ( val: boolean ) => { setCustomProperty( 'flex', val ? null : false ); }
	});

	const headerRight = computed({
		get: () => getView( traitSet.value )?.headerRight ?? '',
		set: ( val: string ) => { setCustomProperty( 'headerRight', val ); }
	});

	const canMoveUp = computed( () => findMoveTarget( -1 ) !== -1 );
	const canMoveDown = computed( () => findMoveTarget( 1 ) !== -1 );

	const isSpotlightSheet = computed( () => {
		const explicit = getView( props.character )?.sheetStyle;
		if ( explicit ) return explicit === 'spotlight';
		return getView( props.character )?.style?.hasAttributes === false;
	});

	const ringSpread = computed({
		get: () => getView( traitSet.value )?.ringConfig?.arcSpread ?? 100,
		set: ( val: number ) => { setRingConfig( 'arcSpread', Number( val ) ); }
	});

	const ringDistance = computed({
		get: () => getView( traitSet.value )?.ringConfig?.arcDistance ?? 0,
		set: ( val: number ) => { setRingConfig( 'arcDistance', Number( val ) ); }
	});

	const ringAngle = computed({
		get: () => {
			const cfg = getView( traitSet.value )?.ringConfig;
			return cfg?.arcAngle ?? ( cfg?.arcSlide !== undefined ? cfg.arcSlide * 3 : -90 );
		},
		set: ( val: number ) => { setRingConfig( 'arcAngle', Number( val ) ); }
	});

	const ringAngleLabel = computed( () => {
		const a = ringAngle.value;
		if ( a === 0 ) return 'Bottom';
		if ( a === -90 ) return 'Right';
		if ( a === 90 ) return 'Left';
		if ( a === 180 || a === -180 ) return 'Top';
		return ( a > 0 ? '+' + a : a ) + '°';
	});

	const scaleAngle = computed({
		get: () => getView( traitSet.value )?.ringConfig?.scaleAngle ?? 0,
		set: ( val: number ) => { setRingConfig( 'scaleAngle', Number( val ) ); }
	});

	const scaleAngleLabel = computed( () => {
		const a = scaleAngle.value;
		if ( a === 0 ) return 'Bottom';
		if ( a === -90 ) return 'Right';
		if ( a === 90 ) return 'Left';
		if ( a === 180 || a === -180 ) return 'Top';
		return ( a > 0 ? '+' + a : a ) + '°';
	});

	const scaleDistance = computed({
		get: () => getView( traitSet.value )?.ringConfig?.scaleDistance ?? 0,
		set: ( val: number ) => { setRingConfig( 'scaleDistance', Number( val ) ); }
	});

	const ringScaleY = computed({
		get: () => getView( traitSet.value )?.ringConfig?.scaleDieY ?? 0,
		set: ( val: number ) => { setRingConfig( 'scaleDieY', Number( val ) ); }
	});

	const ringScaleX = computed({
		get: () => getView( traitSet.value )?.ringConfig?.scaleDieX ?? 0,
		set: ( val: number ) => { setRingConfig( 'scaleDieX', Number( val ) ); }
	});

	const scaleDieValue = computed({
		get: () => getView( traitSet.value )?.scaleDie || getView( props.character )?.scale || 0,
		set: ( val: number ) => {
			ensureView( traitSet.value ).scaleDie = val;
			ensureView( props.character ).scale = val;
			updateCharacter( props.character );
		}
	});

	const imageURL = computed({
		get: () => getView( traitSet.value )?.imageConfig?.url ?? '',
		set: ( val: string ) => { setImageConfig( 'url', val ); }
	});

	const imageAlignment = computed({
		get: () => getView( traitSet.value )?.imageConfig?.alignment ?? 'center',
		set: ( val: string ) => { setImageConfig( 'alignment', val ); }
	});

	const imageHeight = computed({
		get: () => getView( traitSet.value )?.imageConfig?.height ?? 'auto',
		set: ( val: string ) => { setImageConfig( 'height', val ); }
	});

	const imageCaption = computed({
		get: () => getView( traitSet.value )?.imageConfig?.caption ?? '',
		set: ( val: string ) => { setImageConfig( 'caption', val ); }
	});

	const featureDescription = computed({
		get: () => Boolean( getView( traitSet.value )?.features?.description ),
		set: ( value: boolean ) => { setFeature( 'description', value ); }
	});

	const featureSubtraits = computed({
		get: () => Boolean( getView( traitSet.value )?.features?.subtraits ),
		set: ( value: boolean ) => { setFeature( 'subtraits', value ); }
	});

	const featureSFX = computed({
		get: () => Boolean( getView( traitSet.value )?.features?.sfx ),
		set: ( value: boolean ) => { setFeature( 'sfx', value ); }
	});

	const includeOut = computed({
		get: () => {
			const cfg = getView( traitSet.value )?.stressConfig;
			if ( cfg && typeof cfg.includeOut === 'boolean' ) return cfg.includeOut;
			return true;
		},
		set: ( value: boolean ) => { setStressConfig( 'includeOut', value ); }
	});

	const ratingScale = computed({
		get: () => cortexFunctions.getTraitSetRatings( traitSet.value ),
		set: ( scale: number[] ) => {
			let s = props.traitSetID;
			ctkFor( s ).ratingScale = scale;
			updateCharacter( JSON.parse( JSON.stringify( props.character ) ) );
		}
	});

	const subtraitRatingScale = computed({
		get: () => cortexFunctions.getSubtraitRatings( traitSet.value ),
		set: ( scale: number[] ) => {
			let s = props.traitSetID;
			ctkFor( s ).subtraitRatingScale = scale;
			updateCharacter( JSON.parse( JSON.stringify( props.character ) ) );
		}
	});

	const multiDie = computed({
		get: () => Boolean( getView( traitSet.value )?.multiDie ),
		set: ( value: boolean ) => { setCustomProperty( 'multiDie', value ); }
	});

	// Pool sets add a whole trait pool to the roller on click, and their
	// dice are never flagged as resources (e.g. Growth Pool).
	const isPool = computed({
		get: () => Boolean( getView( traitSet.value )?.pool ),
		set: ( value: boolean ) => { setCustomProperty( 'pool', value ? true : null ); }
	});

	const setDie = computed({
		get: () => {
			const d = Number( getView( traitSet.value )?.setDie );
			return ( d > 0 ) ? d : null;
		},
		set: ( value: number | null ) => { setCustomProperty( 'setDie', ( Number( value ) > 0 ) ? value : null ); }
	});

	const isChallengePool = computed({
		get: () => Boolean(
			getView( traitSet.value )?.isChallengePool ||
			getView( traitSet.value )?.challengePool
		),
		set: ( value: boolean ) => {
			setCustomProperty( 'isChallengePool', value );
			setCustomProperty( 'challengePool', value );
		}
	});

	const notesContent = computed({
		get: () => getView( traitSet.value )?.notes ?? ( traitSet.value?.description ?? '' ),
		set: ( value: string ) => { setCustomProperty( 'notes', value ); }
	});

	const reservedSlots = computed({
		get: () => {
			const val = getView( traitSet.value )?.reservedSlots;
			return ( val !== undefined && val !== null && String( val ) !== '' ) ? Number( val ) : '';
		},
		set: ( val: number | '' ) => {
			const num = ( val === '' || val === null || isNaN( val ) ) ? null : Math.max( 0, parseInt( String( val ), 10 ) );
			setCustomProperty( 'reservedSlots', num );
		}
	});

	const sharedHinder = computed({
		get: () => Boolean( getView( traitSet.value )?.sharedHinder ),
		set: ( val: boolean ) => { setCustomProperty( 'sharedHinder', Boolean( val ) ); }
	});

	const sharedHinderText = computed({
		get: () => getView( traitSet.value )?.sharedHinderText ?? '',
		set: ( val: string ) => { setCustomProperty( 'sharedHinderText', val ); }
	});

	const traitColumns = computed({
		get: () => getView( traitSet.value )?.traitColumns ?? 1,
		set: ( val: number ) => { setCustomProperty( 'traitColumns', parseInt( String( val ), 10 ) || 1 ); }
	});

	const hasAttachedStress = computed({
		get: () => Boolean( getView( traitSet.value )?.attachedStress?.enabled ),
		set: ( val: boolean ) => { setAttachedStressProperty( 'enabled', Boolean( val ) ); }
	});

	const attachedStressLabel = computed({
		get: () => getView( traitSet.value )?.attachedStress?.label ?? 'Stress',
		set: ( val: string ) => { setAttachedStressProperty( 'label', val ); }
	});

	const attachedStressScale = computed({
		get: () => getView( traitSet.value )?.attachedStress?.scale ?? [ 4, 6, 8, 10, 12 ],
		set: ( scale: number[] ) => { setAttachedStressProperty( 'scale', scale ); }
	});

	const attachedStressOut = computed({
		get: () => Boolean( getView( traitSet.value )?.attachedStress?.includeOut ),
		set: ( val: boolean ) => { setAttachedStressProperty( 'includeOut', Boolean( val ) ); }
	});

	const ratingPosition = computed({
		get: () => traitSet.value?.ratingPosition || getView( traitSet.value )?.ratingPosition || 'inline',
		set: ( val: 'inline' | 'above' | 'below' | 'none' ) => {
			setProperty( 'ratingPosition', val );
			setCustomProperty( 'ratingPosition', val );
		}
	});

	const isStatementSet = computed({
		get: () => Boolean( traitSet.value?.statement ?? getView( traitSet.value )?.statement ),
		set: ( val: boolean ) => {
			setProperty( 'statement', Boolean( val ) );
			setCustomProperty( 'statement', Boolean( val ) );
		}
	});

	const hasQuestionedPip = computed({
		get: () => Boolean( traitSet.value?.hasQuestionedPip ?? getView( traitSet.value )?.hasQuestionedPip ),
		set: ( val: boolean ) => {
			setProperty( 'hasQuestionedPip', Boolean( val ) );
			setCustomProperty( 'hasQuestionedPip', Boolean( val ) );
		}
	});

	const hasCounterColumn = computed({
		get: () => Boolean( traitSet.value?.hasCounterColumn ?? getView( traitSet.value )?.hasCounterColumn ),
		set: ( val: boolean ) => {
			setProperty( 'hasCounterColumn', Boolean( val ) );
			setCustomProperty( 'hasCounterColumn', Boolean( val ) );
		}
	});

	const counterLabel = computed({
		get: () => traitSet.value?.counterLabel || getView( traitSet.value )?.counterLabel || 'XP',
		set: ( val: string ) => {
			setProperty( 'counterLabel', val );
			setCustomProperty( 'counterLabel', val );
		}
	});

	const pipCount = computed({
		get: () => getView( traitSet.value )?.pips?.count ?? 25,
		set: ( val: number ) => { setPipProperty( 'count', Math.max( 1, parseInt( String( val ), 10 ) || 25 ) ); }
	});

	const pipsPerRow = computed({
		get: () => getView( traitSet.value )?.pips?.perRow ?? 5,
		set: ( val: number ) => { setPipProperty( 'perRow', Math.max( 1, parseInt( String( val ), 10 ) || 5 ) ); }
	});

	const pipsConnected = computed({
		get: () => getView( traitSet.value )?.pips?.connected !== false,
		set: ( val: any ) => { setPipProperty( 'connected', Boolean( val ) ); }
	});

	const pipsFilled = computed({
		get: () => getView( traitSet.value )?.pips?.filled ?? 0,
		set: ( val: number ) => { setPipProperty( 'filled', Math.max( 0, parseInt( String( val ), 10 ) || 0 ) ); }
	});

	const sessionRecordCount = computed({
		get: () => {
			const v = getView( traitSet.value );
			const configured = Number( v?.sessionRecord?.count ?? v?.sessionRecord?.boxCount ?? v?.reservedSlots ) || 0;
			const traitsLen = traitSet.value?.traits ? traitSet.value.traits.length : 0;
			return configured || Math.max( 20, traitsLen );
		},
		set: ( val: number ) => {
			const count = Math.max( 1, parseInt( String( val ), 10 ) || 20 );
			const view = ensureView( traitSet.value );
			if ( !view.sessionRecord ) {
				view.sessionRecord = {};
			}
			view.sessionRecord.count = count;
			view.reservedSlots = count;
			updateCharacter( props.character );
		}
	});

	const sessionRecordOrientation = computed({
		get: () => getView( traitSet.value )?.sessionRecord?.orientation === 'horizontal' ? 'horizontal' : 'vertical',
		set: ( val: 'horizontal' | 'vertical' ) => {
			const view = ensureView( traitSet.value );
			if ( !view.sessionRecord ) {
				view.sessionRecord = {};
			}
			view.sessionRecord.orientation = ( val === 'horizontal' ) ? 'horizontal' : 'vertical';
			updateCharacter( props.character );
		}
	});

	const scrollable = computed( () => true );

	// Styles sampled from the official Spotlight character sheet PDFs.
	// Talents rows and dossier fields carry no dice.
	const needsDiceUI = computed( () => styleBody.value !== 'three-column-table' && styleBody.value !== 'labeled-fields' );

	// Fixed-layout styles manage their own internal columns.
	const allowsTraitColumns = computed( () => ![ 'subtrait-columns', 'three-column-table', 'paired-slots', 'die-rows', 'dice-count', 'dice-ladder', 'labeled-fields' ].includes( styleBody.value ) );

	const editorDock = computed({
		get: () => getView( traitSet.value )?.editorDock === 'right' ? 'right' : 'left',
		set: ( val: 'left' | 'right' ) => { setCustomProperty( 'editorDock', val === 'right' ? 'right' : 'left' ); }
	});

	// Set header placement + alignment (generic; applies to every style).
	const headerMode = computed({
		get: () => ( getView( traitSet.value )?.header === 'top' ? 'top' : 'sidebar' ),
		set: ( val: 'sidebar' | 'top' ) => { setCustomProperty( 'header', val === 'top' ? 'top' : 'sidebar' ); }
	});

	const headerAlign = computed({
		get: () => {
			const a = getView( traitSet.value )?.headerAlign;
			return a === 'center' || a === 'right' ? a : 'left';
		},
		set: ( val: 'left' | 'center' | 'right' ) => { setCustomProperty( 'headerAlign', val === 'center' || val === 'right' ? val : 'left' ); }
	});

	// Branched Skills connectors (per-specialty arrows) are optional.
	const branchArrows = computed({
		get: () => {
			const v = getView( traitSet.value )?.branchArrows;
			return v !== false;
		},
		set: ( val: boolean ) => { setCustomProperty( 'branchArrows', Boolean( val ) ); }
	});

	const cssClass = computed( () => {
		let css: Record<string, boolean> = {
			'editor':     true,
			'open':       props.open === true,
			'scrollable': scrollable.value,
		};

		css[ 'anchor-position-' + anchorPosition.value ] = true;

		if ( isFullWidthSpan.value ) {
			css[ 'dock-' + editorDock.value ] = true;
		}

		if ( scrollable.value ) {
			css[ 'scroll-position-' + scrollPosition.value ] = true;
		}

		return css;
	});

	function selectElement( selector: any ) {
		emit( 'selectElement', selector );
	}

	function targetValue( event: any ) {
		return ( event?.target as any )?.value;
	}

	async function focusFirstInput() {
		await nextTick();
		if ( inputName.value ) {
			inputName.value.focus( { preventScroll: true } );
		}
	}

	// Ensure + return this set's view bag (typed).
	function ctkFor( s: number ): CortexToolkitCustom {
		return ensureView( props.character.traitSets[ s ] );
	}

	function setProperty( key: keyof TraitSet, value: any ) {
		let character = props.character;
		let s = props.traitSetID;

		character.traitSets[s][ key ] = value as never;

		updateCharacter( character );
	}

	function promptDeleteTraitSet() {
		showDeleteConfirm.value = true;
	}

	function cancelDeleteTraitSet() {
		showDeleteConfirm.value = false;
	}

	function confirmDeleteTraitSet() {
		showDeleteConfirm.value = false;
		emit( 'removeTraitSet', props.traitSetID );
	}

	function duplicateTraitSet() {
		let character = props.character;
		let s = props.traitSetID;

		let clone = JSON.parse( JSON.stringify( character.traitSets[s] ) );
		// A duplicate is a new set: fresh stable id + fresh internal ids
		// so it never collides with (or shadows) the original in merges.
		delete clone.id;
		cortexFunctions.stripInternalIds({ traitSets: [ clone ] });
		character.traitSets.splice( s + 1, 0, clone );
		cortexFunctions.ensureTraitSetIds( character );
		cortexFunctions.assignLids( character );

		updateCharacter( character );
		selectElement([ 'traitSet', s + 1 ]);
	}

	function restoreTrait( name: string ) {
		if ( cortexFunctions.restoreTraitOnSheet( props.character, templateEntry.value, props.traitSetID, name ) ) {
			updateCharacter( props.character );
		}
	}

	function setColumn( col: any ) {
		let s = props.traitSetID;
		ctkFor( s ).location = col;
		updateCharacter( props.character );
	}

	function moveTraitSetUp() {
		let s = props.traitSetID;
		let targetIdx = findMoveTarget( -1 );
		if ( targetIdx === -1 ) return;

		let character = props.character;
		let temp = character.traitSets[s];
		character.traitSets[s] = character.traitSets[targetIdx];
		character.traitSets[targetIdx] = temp;

		updateCharacter( character );
		selectElement([ 'traitSet', targetIdx ]);
	}

	function moveTraitSetDown() {
		let s = props.traitSetID;
		let targetIdx = findMoveTarget( 1 );
		if ( targetIdx === -1 ) return;

		let character = props.character;
		let temp = character.traitSets[s];
		character.traitSets[s] = character.traitSets[targetIdx];
		character.traitSets[targetIdx] = temp;

		updateCharacter( character );
		selectElement([ 'traitSet', targetIdx ]);
	}

	function isFullWidthSetByIndex( idx: any ) {
		if ( !isSpotlightSheet.value ) return false;
		const ctk = getView( props.character?.traitSets?.[ idx ] );
		const span = ctk?.span ?? ctk?.colSpan ?? ctk?.columnSpan;
		return span === 'full' || Number( span ) >= characterColumnCount.value;
	}

	function pageOfSet( idx: any ) {
		const page = getView( props.character?.traitSets?.[ idx ] )?.page;
		return page === undefined || page === null ? 1 : page;
	}

	function columnOfSet( idx: any ) {
		const loc = getView( props.character?.traitSets?.[ idx ] )?.location;
		if ( loc === 'center' && characterColumnCount.value === 3 ) return 'center';
		return loc === 'right' ? 'right' : 'left';
	}

	// Reorder target for Move Up (-1) / Move Down (+1). Full-width sets
	// are row breaks: column sets can never cross them (or pages), and a
	// full-width set moves one adjacent step so breaks stay deliberate.
	function findMoveTarget( dir: any ) {
		const sets = props.character?.traitSets || [];
		const s = props.traitSetID;
		if ( s === null || s === undefined || s < 0 || s >= sets.length ) return -1;
		const selfPage = pageOfSet( s );
		if ( isFullWidthSetByIndex( s ) ) {
			const n = s + dir;
			if ( n < 0 || n >= sets.length ) return -1;
			if ( pageOfSet( n ) !== selfPage ) return -1;
			return n;
		}
		const col = columnOfSet( s );
		for ( let i = s + dir; i >= 0 && i < sets.length; i += dir ) {
			if ( pageOfSet( i ) !== selfPage ) return -1;
			if ( isFullWidthSetByIndex( i ) ) return -1;
			if ( columnOfSet( i ) === col ) return i;
		}
		return -1;
	}

	function setRingConfig( key: keyof RingConfig, value: any ) {
		let s = props.traitSetID;
		const ctk = ctkFor( s );
		if ( !ctk.ringConfig ) {
			ctk.ringConfig = {
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
		ctk.ringConfig[ key ] = value;
		updateCharacter( JSON.parse( JSON.stringify( props.character ) ) );
	}

	function resetRingPlacement() {
		let s = props.traitSetID;
		ctkFor( s ).ringConfig = {
			arcAngle: -90,
			arcSpread: 100,
			arcDistance: 0,
			scaleAngle: 0,
			scaleDistance: 0,
			scaleDieX: 0,
			scaleDieY: 0,
			arcSlide: 0
		};
		updateCharacter( JSON.parse( JSON.stringify( props.character ) ) );
	}

	function setFeature( featureID: keyof SetFeatures, value: any ) {
		let s = props.traitSetID;
		const ctk = ctkFor( s );
		if ( !ctk.features ) {
			ctk.features = {
				description: false,
				sfx: false,
				subtraits: false
			};
		}
		ctk.features[ featureID ] = value;

		updateCharacter( props.character );
	}

	function setCustomProperty( key: string, value: any ) {
		let s = props.traitSetID;
		ctkFor( s )[ key ] = value;
		updateCharacter( props.character );
	}

	// Generic trait-set label store: one flat dictionary for every
	// style's named regions; defaults resolve centrally per style.
	// Inputs bind :value/@change (and placeholder) to it.
	function styleLabel( key: string ) {
		const labels = getView( traitSet.value )?.labels;
		if ( labels && labels[ key ] !== undefined && labels[ key ] !== null && String( labels[ key ] ).length ) {
			return labels[ key ];
		}
		return cortexFunctions.labelDefaultForStyle( styleBody.value, key );
	}

	function setStyleLabel( key: string, value: any ) {
		let s = props.traitSetID;
		const ctk = ctkFor( s );
		if ( !ctk.labels || typeof ctk.labels !== 'object' ) {
			ctk.labels = {};
		}
		ctk.labels[ key ] = value;

		updateCharacter( props.character );
	}

	function setStressConfig( key: keyof StressConfig, value: any ) {
		let s = props.traitSetID;
		const ctk = ctkFor( s );
		if ( !ctk.stressConfig ) {
			ctk.stressConfig = {};
		}
		ctk.stressConfig[ key ] = value;

		updateCharacter( props.character );
	}

	function setImageConfig( key: keyof ImageConfig, value: any ) {
		let s = props.traitSetID;
		const ctk = ctkFor( s );
		if ( !ctk.imageConfig ) {
			ctk.imageConfig = {};
		}
		ctk.imageConfig[ key ] = value;

		updateCharacter( props.character );
	}

	function uploadImageStart() {
		if ( imageFileInput.value ) {
			imageFileInput.value.click();
		}
	}

	function uploadImageProcess( event: any ) {
		uploadError.value = '';
		if ( !event.target.files || !event.target.files.length ) {
			imageURL.value = '';
			return;
		}
		cortexFunctions.processImageFile( event.target.files[0], 1280, 0.85 ).then(
			( dataURL: string ) => {
				imageURL.value = dataURL;
				event.target.value = null;
			},
			( error: any ) => {
				uploadError.value = error?.message || 'Could not process that image.';
				event.target.value = null;
			}
		);
	}

	function removeImage() {
		imageURL.value = '';
	}

	function isRatingIncluded( size: any ) {
		return ratingScale.value.includes( size );
	}

	function toggleRatingOption( size: any ) {
		let current = [ ...ratingScale.value ];
		if ( current.includes( size ) ) {
			if ( current.length > 1 ) {
				current = current.filter( ( s: number ) => s !== size );
			}
		} else {
			current.push( size );
			current.sort( ( a, b ) => a - b );
		}
		ratingScale.value = current;
	}

	function setRatingPreset( preset: string ) {
		switch ( preset ) {
			case 'skills':
				ratingScale.value = [ 4, 6 ];
				break;
			case 'specialties':
				ratingScale.value = [ 8, 10, 12 ];
				break;
			case 'stress':
				ratingScale.value = [ 6, 8, 10, 12 ];
				break;
			case 'all':
			default:
				ratingScale.value = [ 4, 6, 8, 10, 12 ];
				break;
		}
	}

	function isSubtraitRatingIncluded( size: any ) {
		return subtraitRatingScale.value.includes( size );
	}

	function toggleSubtraitRatingOption( size: any ) {
		let current = [ ...subtraitRatingScale.value ];
		if ( current.includes( size ) ) {
			if ( current.length > 1 ) {
				current = current.filter( ( s: number ) => s !== size );
			}
		} else {
			current.push( size );
			current.sort( ( a, b ) => a - b );
		}
		subtraitRatingScale.value = current;
	}

	function setSubtraitRatingPreset( preset: string ) {
		switch ( preset ) {
			case 'skills':
				subtraitRatingScale.value = [ 4, 6 ];
				break;
			case 'specialties':
				subtraitRatingScale.value = [ 8, 10, 12 ];
				break;
			case 'all':
			default:
				subtraitRatingScale.value = [ 4, 6, 8, 10, 12 ];
				break;
		}
	}

	function getDieDisplayValue( value: any ) {
		return cortexFunctions.getDieDisplayValue( value );
	}

	function addEffect() {
		let character = props.character;
		let s = props.traitSetID;

		character.traitSets[s].sfx!.push(
			structuredClone( cortexFunctions.defaultSFX )
		);

		updateCharacter( character );
	}

	function removeEffect( effectID: any ) {
		let character = props.character;
		let s = props.traitSetID;
		let f = effectID;

		character.traitSets[s].sfx!.splice( f, 1 );

		updateCharacter( character );
	}

	function updateCharacter( character?: any ) {
		emit( 'updateCharacter', character );
	}

	function ensurePipStruct() {
		const ctk = ctkFor( props.traitSetID );
		if ( !ctk.pips ) {
			ctk.pips = {
				count: 25,
				perRow: 5,
				connected: true,
				filled: 0
			};
		}
	}

	function setPipProperty( key: keyof PipsConfig, value: any ) {
		ensurePipStruct();
		let s = props.traitSetID;
		ctkFor( s ).pips![ key ] = value;
		updateCharacter( props.character );
	}

	function ensureAttachedStressStruct() {
		const ctk = ctkFor( props.traitSetID );
		if ( !ctk.attachedStress ) {
			ctk.attachedStress = {
				enabled: false,
				label: 'Stress',
				scale: [ 4, 6, 8, 10, 12 ],
				includeOut: false
			};
		}
	}

	function setAttachedStressProperty( key: keyof AttachedStressConfig, value: any ) {
		ensureAttachedStressStruct();
		let s = props.traitSetID;
		ctkFor( s ).attachedStress![ key ] = value;
		updateCharacter( props.character );
	}

	function toggleAttachedStressScale( dieSize: any ) {
		ensureAttachedStressStruct();
		let s = props.traitSetID;
		let currentScale = [ ...( ctkFor( s ).attachedStress!.scale || [ 4, 6, 8, 10, 12 ] ) ];
		let idx = currentScale.indexOf( dieSize );
		if ( idx > -1 ) {
			if ( currentScale.length > 1 ) {
				currentScale.splice( idx, 1 );
			}
		} else {
			currentScale.push( dieSize );
			currentScale.sort( ( a, b ) => a - b );
		}
		ctkFor( s ).attachedStress!.scale = currentScale;
		updateCharacter( props.character );
	}

	function checkAnchorPosition() {
		if ( !rootEl.value || !rootEl.value.parentElement ) return;

		let windowHeight = ( window.innerHeight || document.documentElement.clientHeight );
		let parentRect = rootEl.value.parentElement.getBoundingClientRect();
		let traitMidpoint = parentRect.top + ( parentRect.height / 2 );

		if ( traitMidpoint < ( windowHeight / 2 ) ) {
			anchorPosition.value = 'top';
		} else {
			anchorPosition.value = 'bottom';
		}

		nextTick( () => {
			if ( !rootEl.value ) return;

			rootEl.value.style.setProperty( '--editor-shift-y', '0px' );
			rootEl.value.style.setProperty( '--arrow-shift-y', '0px' );

			let rect = rootEl.value.getBoundingClientRect();
			let pad = 16;
			let shiftY = 0;

			if ( rect.top < pad ) {
				shiftY = pad - rect.top;
			} else if ( rect.bottom > windowHeight - pad ) {
				shiftY = ( windowHeight - pad ) - rect.bottom;
			}

			if ( Math.abs( shiftY ) > 0.5 ) {
				rootEl.value.style.setProperty( '--editor-shift-y', `${shiftY}px` );
				let arrowNaturalY = ( anchorPosition.value === 'bottom' ) ? ( rect.height - 16 ) : 16;
				let targetArrowY = arrowNaturalY - shiftY;
				let clampedArrowY = Math.max( 16, Math.min( rect.height - 16, targetArrowY ) );
				let arrowShift = clampedArrowY - arrowNaturalY;
				rootEl.value.style.setProperty( '--arrow-shift-y', `${arrowShift}px` );
			}
			checkScrollPosition();
		});
	}

	function checkScrollPosition() {
		if ( !rootEl.value || typeof rootEl.value.querySelector !== 'function' ) return;
		let element = rootEl.value.querySelector( '.editor-inner > div' );
		if ( !element ) return;

		let distance = element.scrollTop;
		let max = element.scrollHeight - element.clientHeight;

		if ( max <= 0 ) {
			scrollPosition.value = 'none';
			return;
		}

		if ( distance === 0 ) {
			scrollPosition.value = 'top';
			return;
		}

		if ( distance >= max ) {
			scrollPosition.value = 'bottom';
			return;
		}

		scrollPosition.value = 'middle';
	}

	function clearAllSessionBubbles() {
		if ( !traitSet.value || !traitSet.value.traits ) return;
		traitSet.value.traits.forEach( ( t: any ) => {
			if ( !t.custom ) t.custom = {};
			t.custom.checked = false;
			t.value = 0;
		});
		updateCharacter( props.character );
	}

	function fillAllSessionBubbles() {
		if ( !traitSet.value ) return;
		const count = sessionRecordCount.value;
		if ( !traitSet.value.traits ) traitSet.value.traits = [];
		while ( traitSet.value.traits.length < count ) {
			traitSet.value.traits.push({
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
		traitSet.value.traits.forEach( ( t: any ) => {
			if ( !t.custom ) t.custom = {};
			t.custom.checked = true;
			t.value = 1;
		});
		updateCharacter( props.character );
	}

	const api: TraitSetEditorApi = {
		rootEl, inputName, imageFileInput, scrollPosition, anchorPosition, showDeleteConfirm, uploadError, styleOptions,
		traitSet, character, traitSetID, name, description, nounSingular, nounPlural, styleBody, isRing, isAttributesSet,
		ringTrait, pageNumber, columnLocation, characterColumnCount, setTrackCount, isFullWidthSpan, colSpan,
		track, span, bandWidths, flex,
		rowBreak, templateEntry, restorableTraitNames, headerRight, canMoveUp, canMoveDown, isSpotlightSheet,
		ringSpread, ringDistance, ringAngle, ringAngleLabel, scaleAngle, scaleAngleLabel, scaleDistance,
		ringScaleY, ringScaleX, scaleDieValue, imageURL, imageAlignment, imageHeight, imageCaption,
		featureDescription, featureSubtraits, featureSFX, includeOut, ratingScale, subtraitRatingScale,
		multiDie, isPool, setDie, isChallengePool, notesContent, reservedSlots, sharedHinder, sharedHinderText, traitColumns,
		hasAttachedStress, attachedStressLabel, attachedStressScale, attachedStressOut, ratingPosition, isStatementSet,
		hasQuestionedPip, hasCounterColumn, counterLabel, pipCount, pipsPerRow, pipsConnected, pipsFilled,
		sessionRecordCount, sessionRecordOrientation, scrollable, needsDiceUI, allowsTraitColumns,
		editorDock, branchArrows, headerMode, headerAlign, cssClass,
		selectElement, focusFirstInput, targetValue, setProperty, promptDeleteTraitSet, cancelDeleteTraitSet, confirmDeleteTraitSet,
		duplicateTraitSet, restoreTrait, setColumn, moveTraitSetUp, moveTraitSetDown, isFullWidthSetByIndex,
		pageOfSet, columnOfSet, findMoveTarget, setRingConfig, resetRingPlacement, setFeature,
		setCustomProperty, styleLabel, setStyleLabel, setStressConfig, setImageConfig, uploadImageStart,
		uploadImageProcess, removeImage, isRatingIncluded, toggleRatingOption, setRatingPreset,
		isSubtraitRatingIncluded, toggleSubtraitRatingOption, setSubtraitRatingPreset, getDieDisplayValue,
		addEffect, removeEffect, updateCharacter, ensurePipStruct, setPipProperty, ensureAttachedStressStruct,
		setAttachedStressProperty, toggleAttachedStressScale, checkAnchorPosition, checkScrollPosition,
		clearAllSessionBubbles, fillAllSessionBubbles
	};

	onMounted( () => {
		checkAnchorPosition();
		window.addEventListener( 'resize', checkAnchorPosition );
	});

	onUnmounted( () => {
		window.removeEventListener( 'resize', checkAnchorPosition );
	});

	onUpdated( () => {
		if ( props.open ) {
			checkAnchorPosition();
		}
	});

	watch( () => props.traitSetID, () => { showDeleteConfirm.value = false; } );
	watch( () => props.character, () => { checkAnchorPosition(); } );
	watch( () => props.viewY, () => { checkAnchorPosition(); } );
	watch( () => props.open, ( isOpen: boolean | undefined, wasOpen: boolean | undefined ) => {
		showDeleteConfirm.value = false;
		if ( isOpen && !wasOpen ) {
			focusFirstInput();
			nextTick( () => {
				checkAnchorPosition();
				setTimeout( () => {
					checkAnchorPosition();
				}, 220 );
			});
		} else if ( !isOpen ) {
			if ( rootEl.value ) {
				rootEl.value.style.setProperty( '--editor-shift-y', '0px' );
				rootEl.value.style.setProperty( '--arrow-shift-y', '0px' );
			}
		}
	});

	provide( TRAIT_SET_EDITOR_KEY, api );
	return api;
}

export function injectTraitSetEditor(): TraitSetEditorApi {
	const api = inject( TRAIT_SET_EDITOR_KEY );
	if ( !api ) throw new Error( 'use-trait-set-editor: injectTraitSetEditor() called outside TraitSetEditor' );
	return api;
}
