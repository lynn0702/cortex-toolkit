import { ref, computed, onMounted, onUnmounted, onUpdated, watch, nextTick, provide, inject, getCurrentInstance, type InjectionKey } from 'vue';
import { cortexFunctions } from './functions.ts';
import type { Character, TraitSet, CortexToolkitCustom, HaloConfig, SetFeatures, StressConfig, ImageConfig, PipsConfig, AttachedStressConfig } from './model.ts';

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
		{ id: 'halo',                 label: 'Portrait Halo' },
		{ id: 'two-columns-compact',  label: 'Compact Columns' },
		{ id: 'two-columns-detailed', label: 'Detailed Columns' },
		{ id: 'distinctions',         label: 'Distinctions' },
		{ id: 'assets',               label: 'Assets' },
		{ id: 'resources',            label: 'Resources' },
		{ id: 'resources-count',      label: 'Resources Count' },
		{ id: 'skills-specialties',   label: 'Skills & Specialties' },
		{ id: 'standing',             label: 'Standing' },
		{ id: 'badges-table',         label: 'Badges Table' },
		{ id: 'talents-table',        label: 'Talents Table' },
		{ id: 'growth-ladder',        label: 'Growth Ladder' },
		{ id: 'dossier-fields',       label: 'Dossier Fields' },
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
			const body = traitSet.value?.custom?.cortexToolkit?.style?.body;
			if ( body === 'halo' || body === 'attributes' ) {
				return 'halo';
			}
			// Backwards compatibility: default Attributes trait set to Halo when no style (or default) is specified
			if ( !body || body === 'default' ) {
				if ( traitSet.value?.custom?.cortexToolkit?.location === 'attributes' ||
					( isAttributesSet.value && cortexFunctions.getHaloTraitRing( traitSet.value ) !== false ) ) {
					return 'halo';
				}
			}
			return body || 'default';
		},
		set: ( value: string ) => {
			if ( value === 'halo' ) {
				// 1. Unset halo on any other trait sets in this character
				props.character.traitSets.forEach( ( ts: any, idx: number ) => {
					if ( idx !== props.traitSetID ) {
						const tsBody = ts.custom?.cortexToolkit?.style?.body;
						if ( tsBody === 'halo' || tsBody === 'attributes' || ts.custom?.cortexToolkit?.location === 'attributes' || cortexFunctions.getHaloTraitRing( ts ) ) {
							if ( !ts.custom ) ts.custom = {};
							if ( !ts.custom.cortexToolkit ) ts.custom.cortexToolkit = {};
							if ( !ts.custom.cortexToolkit.style ) ts.custom.cortexToolkit.style = {};
							ts.custom.cortexToolkit.style.body = 'default';
							ts.custom.cortexToolkit.style.header = 'default';
							ts.custom.cortexToolkit.location = 'right';
							ts.custom.cortexToolkit.haloTraitRing = false;
						}
					}
				});

				// 2. Set halo on this trait set
				if ( !traitSet.value.custom ) traitSet.value.custom = {};
				if ( !traitSet.value.custom.cortexToolkit ) traitSet.value.custom.cortexToolkit = {};
				if ( !traitSet.value.custom.cortexToolkit.style ) traitSet.value.custom.cortexToolkit.style = {};
				traitSet.value.custom.cortexToolkit.style.body = 'halo';
				traitSet.value.custom.cortexToolkit.style.header = 'halo';
				traitSet.value.custom.cortexToolkit.location = 'attributes';
				traitSet.value.custom.cortexToolkit.haloTraitRing = true;
				traitSet.value.custom.cortexToolkit.isAttributes = true;
			} else {
				if ( !traitSet.value.custom ) traitSet.value.custom = {};
				if ( !traitSet.value.custom.cortexToolkit ) traitSet.value.custom.cortexToolkit = {};
				if ( !traitSet.value.custom.cortexToolkit.style ) traitSet.value.custom.cortexToolkit.style = {};
				traitSet.value.custom.cortexToolkit.style.body = value;
				traitSet.value.custom.cortexToolkit.style.header = value;
				if ( traitSet.value.custom.cortexToolkit.location === 'attributes' ) {
					traitSet.value.custom.cortexToolkit.location = 'right';
				}
				traitSet.value.custom.cortexToolkit.haloTraitRing = false;
				// Spotlight PDF styles: seed the feature flags their layouts need.
				if ( !traitSet.value.custom.cortexToolkit.features ) {
					traitSet.value.custom.cortexToolkit.features = { description: false, sfx: false, subtraits: false };
				}
				const styleDefaults = cortexFunctions.defaultFeaturesForStyle( value );
				Object.assign( traitSet.value.custom.cortexToolkit.features, styleDefaults.features );
				if ( styleDefaults.multiDie ) {
					traitSet.value.custom.cortexToolkit.multiDie = true;
				}
			}
			updateCharacter( props.character );
		}
	});

	const isHalo = computed( () => styleBody.value === 'halo' );

	const isAttributesSet = computed( () => Boolean(
		traitSet.value?.custom?.cortexToolkit?.location === 'attributes' ||
		traitSet.value?.custom?.cortexToolkit?.isAttributes ||
		traitSet.value?.custom?.cortexToolkit?.style?.body === 'attributes' ||
		traitSet.value?.custom?.cortexToolkit?.style?.body === 'halo' ||
		traitSet.value?.nounSingular?.toLowerCase() === 'attribute' ||
		traitSet.value?.name?.trim().toLowerCase() === 'attributes'
	) );

	const haloTraitRing = computed({
		get: () => isHalo.value,
		set: ( value: boolean ) => { styleBody.value = value ? 'halo' : 'default'; }
	});

	const pageNumber = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.page ?? 1,
		set: ( val: number ) => {
			if ( !traitSet.value.custom ) traitSet.value.custom = {};
			if ( !traitSet.value.custom.cortexToolkit ) traitSet.value.custom.cortexToolkit = {};
			traitSet.value.custom.cortexToolkit.page = val;
			if ( val > 1 && ( !props.character.custom?.cortexToolkit?.pageCount || props.character.custom.cortexToolkit.pageCount < val ) ) {
				if ( !props.character.custom ) props.character.custom = {};
				if ( !props.character.custom.cortexToolkit ) props.character.custom.cortexToolkit = {};
				props.character.custom.cortexToolkit.pageCount = val;
			}
			updateCharacter();
		}
	});

	const columnLocation = computed( () => {
		const loc = traitSet.value?.custom?.cortexToolkit?.location;
		if ( loc === 'center' && characterColumnCount.value === 3 ) return 'center';
		return loc === 'right' ? 'right' : 'left';
	});

	const characterColumnCount = computed( () => Number( props.character?.custom?.cortexToolkit?.columns ) === 3 ? 3 : 2 );

	// Track count for THIS set's page (page 2 may override via columnsPage2).
	const setTrackCount = computed( () => {
		if ( ( traitSet.value?.custom?.cortexToolkit?.page ?? 1 ) === 2 ) {
			const override = Number( props.character?.custom?.cortexToolkit?.columnsPage2 );
			if ( override === 2 || override === 3 ) return override;
		}
		return characterColumnCount.value;
	});

	const isFullWidthSpan = computed({
		get: () => {
			const span = traitSet.value?.custom?.cortexToolkit?.colSpan ?? traitSet.value?.custom?.cortexToolkit?.columnSpan;
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
			const span = traitSet.value?.custom?.cortexToolkit?.colSpan ?? traitSet.value?.custom?.cortexToolkit?.columnSpan;
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
		get: () => traitSet.value?.custom?.cortexToolkit?.rowBreak === true,
		set: ( val: boolean ) => { setCustomProperty( 'rowBreak', val ? true : null ); }
	});

	const templateEntry = computed( () => {
		const root = inst?.proxy?.$root as any;
		return cortexFunctions.resolveTemplateFor( props.character, root ? root.sheetTemplates : null );
	});

	// Template traits by name not currently on this sheet (D19 restore menu).
	const restorableTraitNames = computed( () => cortexFunctions.restorableTraits( props.character, templateEntry.value, props.traitSetID ) );

	// Column width share for Spotlight rows (percent of the row this
	// set's column takes; unset/null = equal share). Mates in the other
	// column(s) flex to fill whatever is left, forming a row band.
	const colWidth = computed({
		get: () => {
			const w = Number( traitSet.value?.custom?.cortexToolkit?.colWidth );
			return ( w >= 10 && w <= 90 ) ? Math.round( w ) : null;
		},
		set: ( val: number | null ) => {
			if ( val === null || val === undefined || String( val ) === '' ) {
				setCustomProperty( 'colWidth', null );
				return;
			}
			const w = Math.min( 90, Math.max( 10, Math.round( Number( val ) || 50 ) ) );
			setCustomProperty( 'colWidth', w );
		}
	});

	const headerRight = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.headerRight ?? '',
		set: ( val: string ) => { setCustomProperty( 'headerRight', val ); }
	});

	const canMoveUp = computed( () => findMoveTarget( -1 ) !== -1 );
	const canMoveDown = computed( () => findMoveTarget( 1 ) !== -1 );

	const isSpotlightSheet = computed( () => {
		const explicit = props.character?.custom?.cortexToolkit?.sheetStyle;
		if ( explicit ) return explicit === 'spotlight';
		return props.character?.custom?.cortexToolkit?.style?.hasAttributes === false;
	});

	const haloSpread = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.haloConfig?.arcSpread ?? 100,
		set: ( val: number ) => { setHaloConfig( 'arcSpread', Number( val ) ); }
	});

	const haloDistance = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.haloConfig?.arcDistance ?? 0,
		set: ( val: number ) => { setHaloConfig( 'arcDistance', Number( val ) ); }
	});

	const haloAngle = computed({
		get: () => {
			const cfg = traitSet.value?.custom?.cortexToolkit?.haloConfig;
			return cfg?.arcAngle ?? ( cfg?.arcSlide !== undefined ? cfg.arcSlide * 3 : -90 );
		},
		set: ( val: number ) => { setHaloConfig( 'arcAngle', Number( val ) ); }
	});

	const haloAngleLabel = computed( () => {
		const a = haloAngle.value;
		if ( a === 0 ) return 'Bottom';
		if ( a === -90 ) return 'Right';
		if ( a === 90 ) return 'Left';
		if ( a === 180 || a === -180 ) return 'Top';
		return ( a > 0 ? '+' + a : a ) + '°';
	});

	const scaleAngle = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.haloConfig?.scaleAngle ?? 0,
		set: ( val: number ) => { setHaloConfig( 'scaleAngle', Number( val ) ); }
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
		get: () => traitSet.value?.custom?.cortexToolkit?.haloConfig?.scaleDistance ?? 0,
		set: ( val: number ) => { setHaloConfig( 'scaleDistance', Number( val ) ); }
	});

	const haloScaleY = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.haloConfig?.scaleDieY ?? 0,
		set: ( val: number ) => { setHaloConfig( 'scaleDieY', Number( val ) ); }
	});

	const haloScaleX = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.haloConfig?.scaleDieX ?? 0,
		set: ( val: number ) => { setHaloConfig( 'scaleDieX', Number( val ) ); }
	});

	const scaleDieValue = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.scaleDie || props.character?.custom?.cortexToolkit?.scale || 0,
		set: ( val: number ) => {
			if ( !traitSet.value.custom ) traitSet.value.custom = {};
			if ( !traitSet.value.custom.cortexToolkit ) traitSet.value.custom.cortexToolkit = {};
			traitSet.value.custom.cortexToolkit.scaleDie = val;
			if ( !props.character.custom ) props.character.custom = {};
			if ( !props.character.custom.cortexToolkit ) props.character.custom.cortexToolkit = {};
			props.character.custom.cortexToolkit.scale = val;
			updateCharacter( props.character );
		}
	});

	const imageURL = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.imageConfig?.url ?? '',
		set: ( val: string ) => { setImageConfig( 'url', val ); }
	});

	const imageAlignment = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.imageConfig?.alignment ?? 'center',
		set: ( val: string ) => { setImageConfig( 'alignment', val ); }
	});

	const imageHeight = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.imageConfig?.height ?? 'auto',
		set: ( val: string ) => { setImageConfig( 'height', val ); }
	});

	const imageCaption = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.imageConfig?.caption ?? '',
		set: ( val: string ) => { setImageConfig( 'caption', val ); }
	});

	const featureDescription = computed({
		get: () => Boolean( traitSet.value?.custom?.cortexToolkit?.features?.description ),
		set: ( value: boolean ) => { setFeature( 'description', value ); }
	});

	const featureSubtraits = computed({
		get: () => Boolean( traitSet.value?.custom?.cortexToolkit?.features?.subtraits ),
		set: ( value: boolean ) => { setFeature( 'subtraits', value ); }
	});

	const featureSFX = computed({
		get: () => Boolean( traitSet.value?.custom?.cortexToolkit?.features?.sfx ),
		set: ( value: boolean ) => { setFeature( 'sfx', value ); }
	});

	const includeOut = computed({
		get: () => {
			const cfg = traitSet.value?.custom?.cortexToolkit?.stressConfig;
			if ( cfg && typeof cfg.includeOut === 'boolean' ) return cfg.includeOut;
			return true;
		},
		set: ( value: boolean ) => { setStressConfig( 'includeOut', value ); }
	});

	const ratingScale = computed({
		get: () => cortexFunctions.getTraitSetRatings( traitSet.value ),
		set: ( scale: number[] ) => {
			let s = props.traitSetID;
			if ( !props.character.traitSets[s].custom ) props.character.traitSets[s].custom = {};
			if ( !props.character.traitSets[s].custom.cortexToolkit ) props.character.traitSets[s].custom.cortexToolkit = {};
			props.character.traitSets[s].custom.cortexToolkit.ratingScale = scale;

			updateCharacter( JSON.parse( JSON.stringify( props.character ) ) );
		}
	});

	const subtraitRatingScale = computed({
		get: () => cortexFunctions.getSubtraitRatings( traitSet.value ),
		set: ( scale: number[] ) => {
			let s = props.traitSetID;
			if ( !props.character.traitSets[s].custom ) props.character.traitSets[s].custom = {};
			if ( !props.character.traitSets[s].custom.cortexToolkit ) props.character.traitSets[s].custom.cortexToolkit = {};
			props.character.traitSets[s].custom.cortexToolkit.subtraitRatingScale = scale;
			updateCharacter( JSON.parse( JSON.stringify( props.character ) ) );
		}
	});

	const multiDie = computed({
		get: () => Boolean( traitSet.value?.custom?.cortexToolkit?.multiDie ),
		set: ( value: boolean ) => { setCustomProperty( 'multiDie', value ); }
	});

	const setDie = computed({
		get: () => {
			const d = Number( traitSet.value?.custom?.cortexToolkit?.setDie );
			return ( d > 0 ) ? d : null;
		},
		set: ( value: number | null ) => { setCustomProperty( 'setDie', ( Number( value ) > 0 ) ? value : null ); }
	});

	const isChallengePool = computed({
		get: () => Boolean(
			traitSet.value?.custom?.cortexToolkit?.isChallengePool ||
			traitSet.value?.custom?.cortexToolkit?.challengePool
		),
		set: ( value: boolean ) => {
			setCustomProperty( 'isChallengePool', value );
			setCustomProperty( 'challengePool', value );
		}
	});

	const notesContent = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.notes ?? ( traitSet.value?.description ?? '' ),
		set: ( value: string ) => { setCustomProperty( 'notes', value ); }
	});

	const reservedSlots = computed({
		get: () => {
			const val = traitSet.value?.custom?.cortexToolkit?.reservedSlots;
			return ( val !== undefined && val !== null && String( val ) !== '' ) ? Number( val ) : '';
		},
		set: ( val: number | '' ) => {
			const num = ( val === '' || val === null || isNaN( val ) ) ? null : Math.max( 0, parseInt( String( val ), 10 ) );
			setCustomProperty( 'reservedSlots', num );
		}
	});

	const sharedHinder = computed({
		get: () => Boolean( traitSet.value?.custom?.cortexToolkit?.sharedHinder ),
		set: ( val: boolean ) => { setCustomProperty( 'sharedHinder', Boolean( val ) ); }
	});

	const sharedHinderText = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.sharedHinderText ?? '',
		set: ( val: string ) => { setCustomProperty( 'sharedHinderText', val ); }
	});

	const traitColumns = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.traitColumns ?? 1,
		set: ( val: number ) => { setCustomProperty( 'traitColumns', parseInt( String( val ), 10 ) || 1 ); }
	});

	const hasAttachedStress = computed({
		get: () => Boolean( traitSet.value?.custom?.cortexToolkit?.attachedStress?.enabled ),
		set: ( val: boolean ) => { setAttachedStressProperty( 'enabled', Boolean( val ) ); }
	});

	const attachedStressLabel = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.attachedStress?.label ?? 'Stress',
		set: ( val: string ) => { setAttachedStressProperty( 'label', val ); }
	});

	const attachedStressScale = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.attachedStress?.scale ?? [ 4, 6, 8, 10, 12 ],
		set: ( scale: number[] ) => { setAttachedStressProperty( 'scale', scale ); }
	});

	const attachedStressOut = computed({
		get: () => Boolean( traitSet.value?.custom?.cortexToolkit?.attachedStress?.includeOut ),
		set: ( val: boolean ) => { setAttachedStressProperty( 'includeOut', Boolean( val ) ); }
	});

	const ratingPosition = computed({
		get: () => traitSet.value?.ratingPosition || traitSet.value?.custom?.cortexToolkit?.ratingPosition || 'inline',
		set: ( val: 'inline' | 'above' | 'below' | 'none' ) => {
			setProperty( 'ratingPosition', val );
			setCustomProperty( 'ratingPosition', val );
		}
	});

	const isStatementSet = computed({
		get: () => Boolean( traitSet.value?.statement ?? traitSet.value?.custom?.cortexToolkit?.statement ),
		set: ( val: boolean ) => {
			setProperty( 'statement', Boolean( val ) );
			setCustomProperty( 'statement', Boolean( val ) );
		}
	});

	const hasQuestionedPip = computed({
		get: () => Boolean( traitSet.value?.hasQuestionedPip ?? traitSet.value?.custom?.cortexToolkit?.hasQuestionedPip ),
		set: ( val: boolean ) => {
			setProperty( 'hasQuestionedPip', Boolean( val ) );
			setCustomProperty( 'hasQuestionedPip', Boolean( val ) );
		}
	});

	const hasCounterColumn = computed({
		get: () => Boolean( traitSet.value?.hasCounterColumn ?? traitSet.value?.custom?.cortexToolkit?.hasCounterColumn ),
		set: ( val: boolean ) => {
			setProperty( 'hasCounterColumn', Boolean( val ) );
			setCustomProperty( 'hasCounterColumn', Boolean( val ) );
		}
	});

	const counterLabel = computed({
		get: () => traitSet.value?.counterLabel || traitSet.value?.custom?.cortexToolkit?.counterLabel || 'XP',
		set: ( val: string ) => {
			setProperty( 'counterLabel', val );
			setCustomProperty( 'counterLabel', val );
		}
	});

	const pipCount = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.pips?.count ?? 25,
		set: ( val: number ) => { setPipProperty( 'count', Math.max( 1, parseInt( String( val ), 10 ) || 25 ) ); }
	});

	const pipsPerRow = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.pips?.perRow ?? 5,
		set: ( val: number ) => { setPipProperty( 'perRow', Math.max( 1, parseInt( String( val ), 10 ) || 5 ) ); }
	});

	const pipsConnected = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.pips?.connected !== false,
		set: ( val: any ) => { setPipProperty( 'connected', Boolean( val ) ); }
	});

	const pipsFilled = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.pips?.filled ?? 0,
		set: ( val: number ) => { setPipProperty( 'filled', Math.max( 0, parseInt( String( val ), 10 ) || 0 ) ); }
	});

	const sessionRecordCount = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.sessionRecord?.count ??
			traitSet.value?.custom?.cortexToolkit?.reservedSlots ??
			( traitSet.value?.traits ? traitSet.value.traits.length : 0 ) ?? 20,
		set: ( val: number ) => {
			const count = Math.max( 1, parseInt( String( val ), 10 ) || 20 );
			if ( !traitSet.value.custom ) traitSet.value.custom = {};
			if ( !traitSet.value.custom.cortexToolkit ) traitSet.value.custom.cortexToolkit = {};
			if ( !traitSet.value.custom.cortexToolkit.sessionRecord ) {
				traitSet.value.custom.cortexToolkit.sessionRecord = {};
			}
			traitSet.value.custom.cortexToolkit.sessionRecord.count = count;
			traitSet.value.custom.cortexToolkit.reservedSlots = count;
			updateCharacter( props.character );
		}
	});

	const sessionRecordOrientation = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.sessionRecord?.orientation === 'horizontal' ? 'horizontal' : 'vertical',
		set: ( val: 'horizontal' | 'vertical' ) => {
			if ( !traitSet.value.custom ) traitSet.value.custom = {};
			if ( !traitSet.value.custom.cortexToolkit ) traitSet.value.custom.cortexToolkit = {};
			if ( !traitSet.value.custom.cortexToolkit.sessionRecord ) {
				traitSet.value.custom.cortexToolkit.sessionRecord = {};
			}
			traitSet.value.custom.cortexToolkit.sessionRecord.orientation = ( val === 'horizontal' ) ? 'horizontal' : 'vertical';
			updateCharacter( props.character );
		}
	});

	const scrollable = computed( () => true );

	// Styles sampled from the official Spotlight character sheet PDFs.
	// Talents rows and dossier fields carry no dice.
	const needsDiceUI = computed( () => styleBody.value !== 'talents-table' && styleBody.value !== 'dossier-fields' );

	// Fixed-layout styles manage their own internal columns.
	const allowsTraitColumns = computed( () => ![ 'skills-specialties', 'talents-table', 'standing', 'badges-table', 'resources-count', 'growth-ladder', 'dossier-fields' ].includes( styleBody.value ) );

	const editorDock = computed({
		get: () => traitSet.value?.custom?.cortexToolkit?.editorDock === 'right' ? 'right' : 'left',
		set: ( val: 'left' | 'right' ) => { setCustomProperty( 'editorDock', val === 'right' ? 'right' : 'left' ); }
	});

	// Branched Skills connectors (per-specialty arrows) are optional.
	const branchArrows = computed({
		get: () => {
			const v = traitSet.value?.custom?.cortexToolkit?.branchArrows;
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

	// Ensure + return this set's `custom.cortexToolkit` compartment (typed).
	function ctkFor( s: number ): CortexToolkitCustom {
		const ts = props.character.traitSets[ s ];
		if ( !ts.custom ) ts.custom = {};
		if ( !ts.custom.cortexToolkit ) ts.custom.cortexToolkit = {};
		return ts.custom.cortexToolkit;
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
		if ( !props.character.traitSets[s].custom ) props.character.traitSets[s].custom = {};
		if ( !props.character.traitSets[s].custom.cortexToolkit ) props.character.traitSets[s].custom.cortexToolkit = {};
		props.character.traitSets[s].custom.cortexToolkit.location = col;
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
		const ctk = props.character?.traitSets?.[ idx ]?.custom?.cortexToolkit;
		const span = ctk?.colSpan ?? ctk?.columnSpan;
		return span === 'full' || Number( span ) >= characterColumnCount.value;
	}

	function pageOfSet( idx: any ) {
		const page = props.character?.traitSets?.[ idx ]?.custom?.cortexToolkit?.page;
		return page === undefined || page === null ? 1 : page;
	}

	function columnOfSet( idx: any ) {
		const loc = props.character?.traitSets?.[ idx ]?.custom?.cortexToolkit?.location;
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

	function setHaloConfig( key: keyof HaloConfig, value: any ) {
		let s = props.traitSetID;
		if ( !props.character.traitSets[s].custom ) props.character.traitSets[s].custom = {};
		if ( !props.character.traitSets[s].custom.cortexToolkit ) props.character.traitSets[s].custom.cortexToolkit = {};
		if ( !props.character.traitSets[s].custom.cortexToolkit.haloConfig ) {
			props.character.traitSets[s].custom.cortexToolkit.haloConfig = {
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
		ctkFor( s ).haloConfig![ key ] = value;
		updateCharacter( JSON.parse( JSON.stringify( props.character ) ) );
	}

	function resetHaloPlacement() {
		let s = props.traitSetID;
		if ( !props.character.traitSets[s].custom ) props.character.traitSets[s].custom = {};
		if ( !props.character.traitSets[s].custom.cortexToolkit ) props.character.traitSets[s].custom.cortexToolkit = {};
		props.character.traitSets[s].custom.cortexToolkit.haloConfig = {
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
		if ( !props.character.traitSets[s].custom ) props.character.traitSets[s].custom = {};
		if ( !props.character.traitSets[s].custom.cortexToolkit ) props.character.traitSets[s].custom.cortexToolkit = {};
		if ( !props.character.traitSets[s].custom.cortexToolkit.features ) {
			props.character.traitSets[s].custom.cortexToolkit.features = {
				description: false,
				sfx: false,
				subtraits: false
			};
		}
		ctkFor( s ).features![ featureID ] = value;

		updateCharacter( props.character );
	}

	function setCustomProperty( key: string, value: any ) {
		let s = props.traitSetID;
		if ( !props.character.traitSets[s].custom ) {
			props.character.traitSets[s].custom = {};
		}
		if ( !props.character.traitSets[s].custom.cortexToolkit ) {
			props.character.traitSets[s].custom.cortexToolkit = {};
		}
		props.character.traitSets[s].custom.cortexToolkit[ key ] = value;

		updateCharacter( props.character );
	}

	// Generic trait-set label store: one flat dictionary for every
	// style's named regions; defaults resolve centrally per style.
	// Inputs bind :value/@change (and placeholder) to it.
	function styleLabel( key: string ) {
		const labels = traitSet.value?.custom?.cortexToolkit?.labels;
		if ( labels && labels[ key ] !== undefined && labels[ key ] !== null && String( labels[ key ] ).length ) {
			return labels[ key ];
		}
		return cortexFunctions.labelDefaultForStyle( styleBody.value, key );
	}

	function setStyleLabel( key: string, value: any ) {
		let s = props.traitSetID;
		if ( !props.character.traitSets[s].custom ) {
			props.character.traitSets[s].custom = {};
		}
		if ( !props.character.traitSets[s].custom.cortexToolkit ) {
			props.character.traitSets[s].custom.cortexToolkit = {};
		}
		if ( !props.character.traitSets[s].custom.cortexToolkit.labels ||
		     typeof props.character.traitSets[s].custom.cortexToolkit.labels !== 'object' ) {
			props.character.traitSets[s].custom.cortexToolkit.labels = {};
		}
		props.character.traitSets[s].custom.cortexToolkit.labels[ key ] = value;

		updateCharacter( props.character );
	}

	function setStressConfig( key: keyof StressConfig, value: any ) {
		let s = props.traitSetID;
		if ( !props.character.traitSets[s].custom ) {
			props.character.traitSets[s].custom = {};
		}
		if ( !props.character.traitSets[s].custom.cortexToolkit ) {
			props.character.traitSets[s].custom.cortexToolkit = {};
		}
		if ( !props.character.traitSets[s].custom.cortexToolkit.stressConfig ) {
			props.character.traitSets[s].custom.cortexToolkit.stressConfig = {};
		}
		ctkFor( s ).stressConfig![ key ] = value;

		updateCharacter( props.character );
	}

	function setImageConfig( key: keyof ImageConfig, value: any ) {
		let s = props.traitSetID;
		if ( !props.character.traitSets[s].custom ) {
			props.character.traitSets[s].custom = {};
		}
		if ( !props.character.traitSets[s].custom.cortexToolkit ) {
			props.character.traitSets[s].custom.cortexToolkit = {};
		}
		if ( !props.character.traitSets[s].custom.cortexToolkit.imageConfig ) {
			props.character.traitSets[s].custom.cortexToolkit.imageConfig = {};
		}
		ctkFor( s ).imageConfig![ key ] = value;

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
		traitSet, character, traitSetID, name, description, nounSingular, nounPlural, styleBody, isHalo, isAttributesSet,
		haloTraitRing, pageNumber, columnLocation, characterColumnCount, setTrackCount, isFullWidthSpan, colSpan,
		rowBreak, templateEntry, restorableTraitNames, colWidth, headerRight, canMoveUp, canMoveDown, isSpotlightSheet,
		haloSpread, haloDistance, haloAngle, haloAngleLabel, scaleAngle, scaleAngleLabel, scaleDistance,
		haloScaleY, haloScaleX, scaleDieValue, imageURL, imageAlignment, imageHeight, imageCaption,
		featureDescription, featureSubtraits, featureSFX, includeOut, ratingScale, subtraitRatingScale,
		multiDie, setDie, isChallengePool, notesContent, reservedSlots, sharedHinder, sharedHinderText, traitColumns,
		hasAttachedStress, attachedStressLabel, attachedStressScale, attachedStressOut, ratingPosition, isStatementSet,
		hasQuestionedPip, hasCounterColumn, counterLabel, pipCount, pipsPerRow, pipsConnected, pipsFilled,
		sessionRecordCount, sessionRecordOrientation, scrollable, needsDiceUI, allowsTraitColumns,
		editorDock, branchArrows, cssClass,
		selectElement, focusFirstInput, targetValue, setProperty, promptDeleteTraitSet, cancelDeleteTraitSet, confirmDeleteTraitSet,
		duplicateTraitSet, restoreTrait, setColumn, moveTraitSetUp, moveTraitSetDown, isFullWidthSetByIndex,
		pageOfSet, columnOfSet, findMoveTarget, setHaloConfig, resetHaloPlacement, setFeature,
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
