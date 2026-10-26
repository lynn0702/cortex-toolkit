<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, onUpdated, ref, toRaw, watch } from 'vue';
import { cortexFunctions } from './functions.ts';
import { getView, ensureView, getRating, ratingDice, setRatingDie,
isRated, resolveHitches, resolveVisibility, DIE_LADDER, rangeTop, isOutDie } from './model.ts';
import SubtraitEditor from './subtrait-editor.vue';
import SfxEditor from './sfx-editor.vue';
import VisibilityEye from './visibility-eye.vue';

const props = defineProps<{
	character: any;
	traitSetID: number;
	traitID: number;
	open: boolean;
	viewY?: number | null;
}>();

const emit = defineEmits<{
	( e: 'selectElement', selector: any[] ): void;
	( e: 'updateCharacter', character: any ): void;
	( e: 'removeTrait', traitSetID: number, traitID: number ): void;
}>();

const instance = getCurrentInstance();
const rootTemplates = () => ( instance?.proxy as any )?.$root?.sheetTemplates ?? null;

const rootEl = ref<HTMLElement | null>( null );
const inputName = ref<HTMLInputElement | null>( null );

const scrollPosition = ref( 'none' );
const anchorPosition = ref( 'top' );
const confirmDelete = ref( false );
const nameBeforeEdit = ref( '' );

const traitSet = computed( () => props.character?.traitSets?.[ props.traitSetID ] );

const trait = computed( () => props.character?.traitSets?.[ props.traitSetID ]?.traits?.[ props.traitID ] );

const templateEntry = computed( () => cortexFunctions.resolveTemplateFor( props.character, rootTemplates() ) );

const templateTraitMatched = computed( () => templateHasTrait( trait.value ? trait.value.name : '' ) );

const renameWarning = computed( () => Boolean( nameBeforeEdit.value && nameBeforeEdit.value !== name.value &&
	templateHasTrait( nameBeforeEdit.value ) ) );

const name = computed( {
	get() {
		return trait.value?.name ?? '';
	},
	set( val: string ) {
		setProperty( 'name', val );
		if ( isTalentsTable.value && Array.isArray( trait.value?.sfx ) ) {
			const sfx = trait.value.sfx.find( ( e: any ) => e !== 'hinder' );
			if ( sfx && typeof sfx === 'object' ) {
				sfx.name = val;
			}
		}
	},
} );

const isListStyle = computed( () => {
	const b = getView( traitSet.value )?.style?.body;
	return b === 'list' || b === 'notes' || b === 'three-column-table' || b === 'labeled-fields';
} );

const isStatementSet = computed( () => Boolean( getView( traitSet.value )?.statement || traitSet.value?.statement ) );
const hasQuestionedPip = computed( () => Boolean( getView( traitSet.value )?.hasQuestionedPip || traitSet.value?.hasQuestionedPip ) );

const isQuestioned = computed( {
	get() {
		return Boolean( trait.value?.questioned ?? trait.value?.custom?.questioned );
	},
	set( val: any ) {
		setProperty( 'questioned', Boolean( val ) );
		if ( !trait.value.custom ) trait.value.custom = {};
		trait.value.custom.questioned = Boolean( val );
		updateCharacter( props.character );
	},
} );

const hasCounterColumn = computed( () => Boolean( traitSet.value?.hasCounterColumn ?? getView( traitSet.value )?.hasCounterColumn ) );
const counterLabel = computed( () => traitSet.value?.counterLabel || getView( traitSet.value )?.counterLabel || 'XP' );

const counterValue = computed( {
	get() {
		return trait.value?.xp ?? trait.value?.counter ?? trait.value?.custom?.xp ?? trait.value?.custom?.counter ?? '';
	},
	set( val: any ) {
		setProperty( 'xp', val );
		setProperty( 'counter', val );
		if ( !trait.value.custom ) trait.value.custom = {};
		trait.value.custom.counter = val;
		trait.value.custom.xp = val;
		updateCharacter( props.character );
	},
} );

const isPairedSlotsStyle = computed( () => getView( traitSet.value )?.style?.body === 'paired-slots' );

const isLabeledPipsSet = computed( () => {
	const v = getView( traitSet.value );
	return v?.style?.body === 'pips' && ( v as any )?.pips?.labels === true;
} );

const pipRowChecked = computed( {
	get() {
		const rating = getRating( trait.value );
		if ( rating && rating.type === 'Pip' && Array.isArray( rating.value ) && rating.value.length ) {
			return rating.value[0] === true;
		}
		return false;
	},
	set( val: any ) {
		const t = trait.value as unknown as Record<string, any>;
		t.rating = { type: 'Pip', value: [ Boolean( val ) ], range: [ 1 ] };
		updateCharacter( props.character );
	},
} );

const dice = computed( () => cortexFunctions.getTraitDice( trait.value ) );

function firstDieOf( node: any ) {
	return ratingDice( getRating( node ) )[0] || 0;
}

function isDieActiveOf( node: any, size: number ) {
	return firstDieOf( node ) === size;
}

// Rated is the gate: a trait is rated iff it carries a rating. Where it
// has none, the editor offers to add one; the Rating control and its
// range editor render directly beneath.
const isRatedTrait = computed( () => isRated( trait.value ) );

function addRating() {
	if ( !trait.value ) return;
	const scale = availableValues.value;
	const size = Array.isArray( scale ) && scale.length ? scale[0] : 8;
	setRatingDie( trait.value as unknown as Record<string, any>, size, Array.isArray( scale ) && scale.length ? [ ...scale ] : undefined );
	updateCharacter( props.character );
}

// Rating type control: Die | Dice | Counter | Pip. Die<->Dice preserves
// the dice (one becomes a one-item list, a list's first item becomes the
// single die); every other change starts from that type's default. The
// switch itself is explicit, so nothing is silently discarded.
const RATING_TYPES = [ 'Die', 'Dice', 'Counter', 'Pip' ] as const;

const ratingType = computed( () => getRating( trait.value )?.type ?? null );

// Out is a range option for Die/Dice ratings, defaulted off. Surgical:
// setting true opts the range in, false drops the key.
const ratingHasOut = computed( {
	get() {
		const r = getRating( trait.value );
		return !!r && ( r.type === 'Die' || r.type === 'Dice' ) && ( r as any ).out === true;
	},
	set( value: boolean ) {
		const t = trait.value as unknown as Record<string, any>;
		const r = t && t.rating;
		if ( !r || typeof r !== 'object' || ( r.type !== 'Die' && r.type !== 'Dice' ) ) return;
		if ( value ) r.out = true;
		else delete r.out;
		updateCharacter( props.character );
	},
} );

function setRatingType( type: 'Counter' | 'Die' | 'Dice' | 'Pip' ) {
	const t = trait.value as unknown as Record<string, any>;
	if ( !t ) return;
	const cur = getRating( t );
	if ( cur?.type === type ) return;
	const scale = availableValues.value;
	const range = Array.isArray( scale ) && scale.length ? [ ...scale ] : undefined;
	const size = Array.isArray( scale ) && scale.length ? scale[0] : 8;
	const prevRange = cur && Array.isArray( cur.range ) && cur.range.length ? [ ...cur.range ] : range;
	if ( ( cur?.type === 'Die' || cur?.type === 'Dice' ) && ( type === 'Die' || type === 'Dice' ) ) {
		const dice = cur ? ratingDice( cur ) : [];
		const list = dice.length ? dice : [ size ];
		const keepRange = prevRange && prevRange.length ? prevRange : [ ...DIE_LADDER ];
		if ( type === 'Die' ) setRatingDie( t, list[0], keepRange );
		else t.rating = { type: 'Dice', value: list, range: keepRange, ...( cur && ( cur as any ).out === true ? { out: true } : {} ) };
	} else if ( type === 'Die' ) {
		setRatingDie( t, size, range );
	} else if ( type === 'Dice' ) {
		t.rating = { type: 'Dice', value: [ size ], range: range && range.length ? range : [ ...DIE_LADDER ] };
	} else if ( type === 'Counter' ) {
		t.rating = { type: 'Counter', value: [ 0 ], range: [ 0, 20 ] };
	} else {
		t.rating = { type: 'Pip', value: [ false ], range: [ 1 ] };
	}
	updateCharacter( props.character );
}

// Counter inputs: a number field with its [min, max] range.
function counterBounds(): [ number, number ] {
	const r = getRating( trait.value );
	if ( r && r.type === 'Counter' ) {
		const nums = r.range.filter( ( n ): n is number => typeof n === 'number' );
		if ( nums.length >= 2 ) {
			const lo = nums[0], hi = nums[1];
			return lo <= hi ? [ lo, hi ] : [ hi, lo ];
		}
	}
	return [ 0, 20 ];
}

const counterNumber = computed( {
	get() {
		const r = getRating( trait.value );
		if ( r && r.type === 'Counter' && typeof r.value[0] === 'number' ) return r.value[0];
		return 0;
	},
	set( val: any ) {
		const t = trait.value as unknown as Record<string, any>;
		if ( !t ) return;
		const [ lo, hi ] = counterBounds();
		let n = Math.floor( Number( val ) );
		if ( !Number.isFinite( n ) ) n = lo;
		n = Math.max( lo, Math.min( hi, n ) );
		t.rating = { type: 'Counter', value: [ n ], range: [ lo, hi ] };
		updateCharacter( props.character );
	},
} );

function setCounterBound( which: 0 | 1, val: any ) {
	const t = trait.value as unknown as Record<string, any>;
	if ( !t ) return;
	let [ lo, hi ] = counterBounds();
	const n = Math.floor( Number( val ) );
	if ( !Number.isFinite( n ) ) return;
	if ( which === 0 ) {
		lo = n;
		if ( lo > hi ) hi = lo;
	} else {
		hi = n;
		if ( hi < lo ) lo = hi;
	}
	const cur = typeof getRating( t )?.value[0] === 'number' ? ( getRating( t ) as any ).value[0] as number : lo;
	t.rating = { type: 'Counter', value: [ Math.max( lo, Math.min( hi, cur ) ) ], range: [ lo, hi ] };
	updateCharacter( props.character );
}

function commitCounterBound( which: 0 | 1, event: Event ) {
	const el = event && ( event.target as HTMLInputElement | null );
	setCounterBound( which, el ? el.value : NaN );
	if ( el && document.activeElement === el ) el.blur();
}

function commitPipBubbleCount( event: Event ) {
	const el = event && ( event.target as HTMLInputElement | null );
	setPipBubbleCount( el ? Number( el.value ) : NaN );
	if ( el && document.activeElement === el ) el.blur();
}

// Pip inputs: a bubble row; a track is a list of bubbles. The range is
// the bubble count.
const pipBubbleCount = computed( () => {
	const r = getRating( trait.value );
	if ( !r || r.type !== 'Pip' ) return 0;
	if ( r.range.length && typeof r.range[0] === 'number' && r.range[0] > 0 ) return Math.floor( r.range[0] );
	return r.value.length;
} );

function pipBubbleAt( index: number ): boolean {
	const r = getRating( trait.value );
	return Boolean( r && r.type === 'Pip' && r.value[ index ] === true );
}

function togglePipBubble( index: number ) {
	const t = trait.value as unknown as Record<string, any>;
	if ( !t ) return;
	const n = Math.max( pipBubbleCount.value, index + 1 );
	const cur = getRating( t );
	const list: boolean[] = [];
	for ( let i = 0; i < n; i++ ) {
		list.push( Boolean( cur && cur.type === 'Pip' && cur.value[ i ] === true ) );
	}
	list[ index ] = !list[ index ];
	t.rating = { type: 'Pip', value: list, range: [ n ] };
	updateCharacter( props.character );
}

function setPipBubbleCount( count: number ) {
	const t = trait.value as unknown as Record<string, any>;
	if ( !t ) return;
	const n = Math.max( 1, Math.min( 100, Math.floor( Number( count ) ) || 1 ) );
	const cur = getRating( t );
	const list: boolean[] = [];
	for ( let i = 0; i < n; i++ ) {
		list.push( Boolean( cur && cur.type === 'Pip' && cur.value[ i ] === true ) );
	}
	t.rating = { type: 'Pip', value: list, range: [ n ] };
	updateCharacter( props.character );
}

function setTraitRange( scale: number[] ) {
	const t = trait.value as unknown as Record<string, any>;
	const rating = getRating( t );
	if ( !rating ) return;
	t.rating = { type: rating.type, value: [ ...rating.value ], range: [ ...scale ] };
	updateCharacter( props.character );
}

function isRangeIncluded( size: number ) {
	const rating = getRating( trait.value );
	if ( !rating || !Array.isArray( rating.range ) ) return availableValues.value.includes( size );
	return rating.range.includes( size );
}

function toggleRangeOption( size: number ) {
	const rating = getRating( trait.value );
	const base = rating && Array.isArray( rating.range ) && rating.range.length ? [ ...rating.range ] : [ ...availableValues.value ];
	const idx = base.indexOf( size );
	if ( idx !== -1 ) base.splice( idx, 1 );
	else base.push( size );
	base.sort( ( a, b ) => a - b );
	setTraitRange( base );
}

// Options render only what the shape makes meaningful: Pool and
// Spendable require a rating; hitches shows against the inherited value.
const traitPool = computed( {
	get() {
		const t = trait.value as unknown as Record<string, unknown> | undefined;
		return t && typeof t.pool === 'boolean' ? t.pool : false;
	},
	set( val: any ) {
		if ( !trait.value ) return;
		( trait.value as unknown as Record<string, any> ).pool = Boolean( val );
		updateCharacter( props.character );
	},
} );

const traitSpendable = computed( {
	get() {
		const t = trait.value as unknown as Record<string, unknown> | undefined;
		return t && typeof t.spendable === 'boolean' ? t.spendable : false;
	},
	set( val: any ) {
		if ( !trait.value ) return;
		( trait.value as unknown as Record<string, any> ).spendable = Boolean( val );
		updateCharacter( props.character );
	},
} );

const inheritedHitches = computed( () => resolveHitches( undefined, [ trait.value, traitSet.value ] ) );

const traitHitches = computed( {
	get() {
		const t = trait.value as unknown as Record<string, unknown> | undefined;
		return t && typeof t.hitches === 'number' ? t.hitches : inheritedHitches.value;
	},
	set( val: any ) {
		if ( !trait.value ) return;
		const n = Number( val );
		( trait.value as unknown as Record<string, any> ).hitches = Number.isFinite( n ) && n >= 0 ? Math.floor( n ) : undefined;
		updateCharacter( props.character );
	},
} );

const hitchesDiffers = computed( () => {
	const t = trait.value as unknown as Record<string, unknown> | undefined;
	return t && typeof t.hitches === 'number' && t.hitches !== resolveHitches( undefined, [ traitSet.value ] );
} );

const isNameSet = computed( () => cortexFunctions.isNameSet( traitSet.value ) );

// A trait's own label field. Rendered by name sets; stored sparsely
// (absent unless customized).
const traitLabel = computed( {
	get() {
		const v = trait.value?.label;
		return typeof v === 'string' ? v : '';
	},
	set( val: any ) {
		if ( !trait.value ) return;
		if ( typeof val === 'string' && val.trim().length ) trait.value.label = val.trim();
		else delete trait.value.label;
		updateCharacter( props.character );
	},
} );

// Trait visibility (shown | editor-only | hidden): a general trait
// capability, not a name-set special case.
const traitVisibility = computed( {
	get() {
		return resolveVisibility( trait.value );
	},
	set( val: any ) {
		if ( !trait.value ) return;
		const v = ensureView( trait.value ) as Record<string, unknown>;
		if ( val === 'shown' ) {
			delete v.visibility;
		} else {
			v.visibility = val;
		}
		updateCharacter( props.character );
	},
} );

const description = computed( {
	get() {
		return trait.value?.statement ?? trait.value?.description ?? '';
	},
	set( val: string ) {
		setProperty( 'description', val );
		setProperty( 'statement', val );
	},
} );

const hinder = computed( {
	get() {
		return trait.value.sfx.includes( 'hinder' );
	},
	set( val: any ) {
		setHinder( val );
	},
} );

const editableSFX = computed( () => trait.value.sfx
	.filter( ( effect: any ) => effect !== 'hinder' )
	.map( ( effect: any ) => trait.value.sfx.indexOf( effect ) ) );

const scrollable = computed( () => Boolean(
	( getView( traitSet.value )?.features?.sfx && editableSFX.value.length > 0 && !isTalentsTable.value )
	||
	( getView( traitSet.value )?.features?.subtraits && trait.value?.traits?.length > 0 )
) );

const isTalentsTable = computed( () => getView( traitSet.value )?.style?.body === 'three-column-table' );

const talentCol1Label = computed( () => {
	const labels = getView( traitSet.value )?.labels;
	if ( labels && labels.col1 ) return labels.col1;
	return cortexFunctions.labelDefaultForStyle( 'three-column-table', 'col1' ) || 'TALENT';
} );

const talentCol2Label = computed( () => {
	const labels = getView( traitSet.value )?.labels;
	if ( labels && labels.col2 ) return labels.col2;
	return cortexFunctions.labelDefaultForStyle( 'three-column-table', 'col2' ) || 'ACTIVATION';
} );

const talentCol3Label = computed( () => {
	const labels = getView( traitSet.value )?.labels;
	if ( labels && labels.col3 ) return labels.col3;
	return cortexFunctions.labelDefaultForStyle( 'three-column-table', 'col3' ) || 'EFFECT';
} );

const talentEffect = computed( {
	get() {
		const sfx = ( trait.value?.sfx || [] ).find( ( e: any ) => e !== 'hinder' );
		if ( !sfx ) return '';
		if ( typeof sfx === 'string' ) return sfx;
		return sfx.description || sfx.name || '';
	},
	set( val: string ) {
		if ( !Array.isArray( trait.value.sfx ) ) {
			trait.value.sfx = [];
		}
		const sfxIndex = trait.value.sfx.findIndex( ( e: any ) => e !== 'hinder' );
		if ( sfxIndex === -1 ) {
			trait.value.sfx.push( {
				name: trait.value.name || '',
				description: val,
				tags: [],
				custom: {}
			} );
		} else {
			if ( typeof trait.value.sfx[ sfxIndex ] === 'string' ) {
				trait.value.sfx[ sfxIndex ] = {
					name: trait.value.name || '',
					description: val,
					tags: [],
					custom: {}
				};
			} else {
				trait.value.sfx[ sfxIndex ].description = val;
				trait.value.sfx[ sfxIndex ].name = trait.value.name || '';
			}
		}
		updateCharacter( props.character );
	},
} );

const canHinderTrait = computed( () => {
	if ( isListStyle.value || isLabeledPipsSet.value || isTalentsTable.value ) return false;
	const body = getView( traitSet.value )?.style?.body;
	if ( body === 'three-column-table' || body === 'list' || body === 'notes' || body === 'labeled-fields' ) {
		return false;
	}
	return isRated( trait.value );
} );

const isAttributesTrait = computed( () => {
	const body = getView( traitSet.value )?.style?.body;
	return getView( traitSet.value )?.location === 'attributes' || body === 'portrait-ring' || body === 'attributes';
} );

const isScaleDie = computed( {
	get() {
		return Boolean(
			( trait.value && typeof ( trait.value as any ).keepsExtra === 'number' && ( trait.value as any ).keepsExtra > 0 ) ||
			( trait.value?.name && trait.value.name.trim().toLowerCase() === 'scale' )
		);
	},
	set( val: any ) {
		if ( !trait.value ) return;
		const t = trait.value as unknown as Record<string, any>;
		if ( val ) {
			// Scale remains a trait name; its effect is keepsExtra.
			t.keepsExtra = 1;
		} else {
			delete t.keepsExtra;
		}
		if ( val && ( !t.name || t.name === 'New trait' || t.name === 'New Attribute' ) ) {
			setProperty( 'name', 'Scale' );
		}
		updateCharacter( props.character );
	},
} );

const isStressSet = computed( () => getView( traitSet.value )?.style?.body === 'stress' );

const shouldShowStressOut = computed( () => {
	if ( !isStressSet.value ) return false;
	const cfg = getView( traitSet.value )?.stressConfig;
	if ( cfg && typeof cfg.includeOut === 'boolean' ) return cfg.includeOut;
	return true;
} );

const isOut = computed( () => isOutDie( trait.value, [ traitSet.value ] ) );

const outLabel = computed( () => {
	const labels = getView( traitSet.value )?.labels;
	if ( labels && typeof labels.out === 'string' && labels.out.length ) return labels.out;
	return cortexFunctions.labelDefaultForStyle( getView( traitSet.value )?.style?.body, 'out' ) || '💥 OUT';
} );

const availableValues = computed( () => cortexFunctions.getTraitSetRatings( traitSet.value ) );

const hasAttachedStress = computed( () => Boolean( getView( traitSet.value )?.attachedStress?.enabled ) );
const attachedStressLabel = computed( () => {
	const labels = getView( traitSet.value )?.labels;
	if ( labels && typeof labels.stress === 'string' && labels.stress.length ) return labels.stress;
	return getView( traitSet.value )?.attachedStress?.label || 'Stress';
} );
const attachedStressScale = computed( () => getView( traitSet.value )?.attachedStress?.scale || [ 4, 6, 8, 10, 12 ] );

const attachedStressCompanion = computed( () => {
	const subs = trait.value?.traits;
	if ( !Array.isArray( subs ) ) return undefined;
	return subs.find( ( st: any ) => st && typeof st === 'object' && st.name === attachedStressLabel.value );
} );

const attachedStressValue = computed( {
	get() {
		if ( attachedStressCompanion.value ) {
			const dice = cortexFunctions.getTraitDice( attachedStressCompanion.value );
			return dice[0] || 0;
		}
		return 0;
	},
	set( val: any ) {
		const character = props.character;
		const t = character.traitSets[ props.traitSetID ].traits[ props.traitID ];
		if ( !Array.isArray( t.traits ) ) t.traits = [];
		let companion = t.traits.find( ( st: any ) => st && typeof st === 'object' && st.name === attachedStressLabel.value );
		if ( val ) {
			if ( companion ) cortexFunctions.setTraitDice( companion, [ val ] );
			else t.traits.push( { name: attachedStressLabel.value, rating: { type: 'Die', value: [ val ], range: [ 4, 6, 8, 10, 12 ] } } );
		} else if ( companion ) {
			t.traits.splice( t.traits.indexOf( companion ), 1 );
		}
		updateCharacter( character );
	},
} );

const cssClass = computed( () => {
	const cls: Record<string, boolean> = {
		'editor': true,
		'open': props.open,
		'scrollable': scrollable.value
	};
	cls[ 'anchor-position-' + anchorPosition.value ] = true;
	if ( parentIsFullWidth.value ) {
		cls[ 'dock-' + editorDock.value ] = true;
	}
	if ( scrollable.value ) {
		cls[ 'scroll-position-' + scrollPosition.value ] = true;
	}
	return cls;
} );

const parentIsBranch = computed( () => getView( traitSet.value )?.style?.body === 'subtrait-columns' );

const branchRole = computed( {
	get() {
		return getView( trait.value )?.branchRole === 'specialty' ? 'specialty' : 'skill';
	},
	set( val: any ) {
		ensureView( trait.value ).branchRole = val === 'specialty' ? 'specialty' : 'skill';
		if ( val !== 'specialty' ) {
			ensureView( trait.value ).linkTo = undefined;
		}
		updateCharacter( props.character );
	},
} );

const branchSkillOptions = computed( () => {
	const traits = traitSet.value?.traits || [];
	const opts: any[] = [];
	traits.forEach( ( tr: any, idx: number ) => {
		if ( idx === props.traitID ) return;
		if ( getView( tr )?.branchRole === 'specialty' ) return;
		opts.push( { index: idx, name: tr?.name?.length ? tr.name : ( 'Skill ' + ( idx + 1 ) ) } );
	} );
	return opts;
} );

const branchLink = computed( {
	get() {
		const v = getView( trait.value )?.linkTo;
		return typeof v === 'number' ? v : null;
	},
	set( val: any ) {
		ensureView( trait.value ).linkTo = ( val === null || val === undefined || val === '' ) ? undefined : Number( val );
		updateCharacter( props.character );
	},
} );

const branchSide = computed( {
	get() {
		return getView( trait.value )?.branchSide === 'left' ? 'left' : 'right';
	},
	set( val: any ) {
		ensureView( trait.value ).branchSide = ( val === 'left' ) ? 'left' : 'right';
		updateCharacter( props.character );
	},
} );

// The set-level die is the set node's own Rating; unrated traits fall
// through to it per the layer rules.
const setRating = computed( () => {
	const dice = ratingDice( getRating( traitSet.value ) );
	return dice.length ? dice[0] : null;
} );

const hideSkillDice = computed( () => Boolean( parentIsBranch.value && branchRole.value !== 'specialty' && setRating.value && !isRated( trait.value ) ) );

const parentIsFullWidth = computed( () => {
	const place = getView( traitSet.value )?.place;
	if ( !place || typeof place !== 'object' ) return true;
	const raw = ( place as { width?: unknown } ).width;
	const w = typeof raw === 'string' ? Number( raw.replace( /%/g, '' ) ) : Number( raw );
	return !Number.isFinite( w ) || w >= 99.9;
} );

const editorDock = computed( {
	get() {
		return getView( traitSet.value )?.editorDock === 'right' ? 'right' : 'left';
	},
	set( val: any ) {
		ensureView( traitSet.value ).editorDock = val === 'right' ? 'right' : 'left';
		updateCharacter( props.character );
	},
} );

watch( () => props.traitID, () => { confirmDelete.value = false; } );
watch( () => props.character, () => { checkAnchorPosition(); } );
watch( () => props.viewY, () => { checkAnchorPosition(); } );
watch( () => props.open, ( isOpen, wasOpen ) => {
	confirmDelete.value = false;
	if ( isOpen && !wasOpen ) {
		focusFirstInput();
		nextTick( () => {
			checkAnchorPosition();
			setTimeout( () => {
				checkAnchorPosition();
			}, 220 );
		} );
	} else if ( !isOpen ) {
		if ( rootEl.value ) {
			rootEl.value.style.setProperty( '--editor-shift-y', '0px' );
			rootEl.value.style.setProperty( '--arrow-shift-y', '0px' );
		}
	}
} );

onMounted( () => {
	checkAnchorPosition();
	checkScrollPosition();
	window.addEventListener( 'resize', checkAnchorPosition );

	if ( props.open ) {
		focusFirstInput();
	}
} );

onUnmounted( () => {
	window.removeEventListener( 'resize', checkAnchorPosition );
} );

onUpdated( () => {
	if ( props.open ) {
		checkAnchorPosition();
	}
} );

function selectElement( selector: any[] ) {
	emit( 'selectElement', selector );
}

async function focusFirstInput() {
	await nextTick();
	if ( inputName.value ) {
		inputName.value.focus( { preventScroll: true } );
	}
}

function setProperty( key: string, val: any ) {
	const character = props.character;
	const s = props.traitSetID;
	const t = props.traitID;
	character.traitSets[ s ].traits[ t ][ key ] = val;
	updateCharacter( character );
}

function setHinder( val: any ) {
	const character = props.character;
	const s = props.traitSetID;
	const t = props.traitID;
	const sfx = character.traitSets[ s ].traits[ t ].sfx;

	if ( val === false && sfx.includes( 'hinder' ) ) {
		sfx.splice( sfx.indexOf( 'hinder' ), 1 );
	} else if ( val === true && !sfx.includes( 'hinder' ) ) {
		sfx.unshift( 'hinder' );
	}

	updateCharacter( character );
}

function setAttachedStress( val: any ) {
	const character = props.character;
	const t = character.traitSets[ props.traitSetID ].traits[ props.traitID ];
	if ( !Array.isArray( t.traits ) ) t.traits = [];
	const label = attachedStressLabel.value;
	const companion = t.traits.find( ( st: any ) => st && typeof st === 'object' && st.name === label );
	const current = companion ? ( cortexFunctions.getTraitDice( companion )[0] || 0 ) : 0;
	if ( current === val ) {
		if ( companion ) t.traits.splice( t.traits.indexOf( companion ), 1 );
	} else if ( companion ) {
		cortexFunctions.setTraitDice( companion, [ val ] );
	} else {
		t.traits.push( { name: label, rating: { type: 'Die', value: [ val ], range: [ 4, 6, 8, 10, 12 ] } } );
	}
	updateCharacter( character );
}

function getDieCount( size: number ) {
	return dice.value.filter( ( d: number ) => d === size ).length;
}

function syncPoolCount( count: number ) {
	if ( getView( traitSet.value )?.style?.body === 'dice-count' ) {
		ensureView( trait.value ).poolCount = count;
	}
}

function addDieToTrait( size: number ) {
	const current = [ ...dice.value, size ].sort( ( a, b ) => b - a );
	cortexFunctions.setTraitDice( trait.value, current );
	syncPoolCount( current.length );
	updateCharacter( props.character );
}

function removeDieFromTrait( size: number ) {
	const current = [ ...dice.value ];
	const idx = current.indexOf( size );
	if ( idx !== -1 ) {
		current.splice( idx, 1 );
		cortexFunctions.setTraitDice( trait.value, current );
		syncPoolCount( current.length );
		updateCharacter( props.character );
	}
}

function removeDieAtIndex( index: number ) {
	const current = [ ...dice.value ];
	if ( index >= 0 && index < current.length ) {
		current.splice( index, 1 );
		cortexFunctions.setTraitDice( trait.value, current );
		syncPoolCount( current.length );
		updateCharacter( props.character );
	}
}

function stepDownDieAtIndex( index: number ) {
	const current = [ ...dice.value ];
	if ( index >= 0 && index < current.length ) {
		const currentSize = current[ index ];
		const sizes = [ 12, 10, 8, 6, 4 ];
		const sIdx = sizes.indexOf( currentSize );
		if ( sIdx !== -1 && sIdx < sizes.length - 1 ) {
			current[ index ] = sizes[ sIdx + 1 ];
		} else {
			// Stepping down past d4 removes it
			current.splice( index, 1 );
		}
		current.sort( ( a, b ) => b - a );
		cortexFunctions.setTraitDice( trait.value, current );
		updateCharacter( props.character );
	}
}

function toggleTraitValue( val: any ) {
	const t = trait.value as unknown as Record<string, any>;
	const cur = ratingDice( getRating( t ) )[0] || 0;
	if ( val === cur && !isOut.value ) {
		t.isOut = false;
		cortexFunctions.setTraitDice( trait.value, [] );
	} else {
		t.isOut = false;
		cortexFunctions.setTraitDice( trait.value, [ val ] );
	}
	updateCharacter( props.character );
}

function toggleOutValue() {
	const t = trait.value as unknown as Record<string, any>;
	if ( isOut.value ) {
		t.isOut = false;
		cortexFunctions.setTraitDice( trait.value, [] );
	} else {
		t.isOut = true;
		setRatingDie( t, rangeTop( t ) + 2 );
		const r = t.rating;
		if ( r && typeof r === 'object' && ( r.type === 'Die' || r.type === 'Dice' ) ) r.out = true;
	}
	updateCharacter( props.character );
}

function duplicateTrait() {
	const character = props.character;
	const s = props.traitSetID;
	const t = props.traitID;

	const clone = structuredClone( toRaw( character.traitSets[ s ].traits[ t ] ) );
	// A duplicate is a new instance: drop internal ids so keys and
	// preferences never collide with the original (fresh ones are
	// assigned on update).
	delete clone._lid;
	delete clone.id;
	cortexFunctions.stripInternalIds( { traits: [ clone ] } );
	character.traitSets[ s ].traits.splice( t + 1, 0, clone );

	updateCharacter( character );
	selectElement( [ 'trait', s, t + 1 ] );
}

function removeTrait() {
	confirmDelete.value = false;
	emit( 'removeTrait', props.traitSetID, props.traitID );
}

function templateHasTrait( name: string ) {
	if ( !name ) return false;
	const setId = traitSet.value ? traitSet.value.id : null;
	const entry = templateEntry.value;
	const base = setId ? cortexFunctions.templateSetById( entry, setId ) : null;
	return Boolean( base && Array.isArray( base.traits ) && base.traits.some( ( b: any ) => b && b.name === name ) );
}

function removeFromSheet() {
	const entry = templateEntry.value;
	cortexFunctions.removeTraitFromSheet( props.character, entry, props.traitSetID, props.traitID );
	confirmDelete.value = false;
	selectElement( [] );
	updateCharacter( props.character );
}

function addEffect() {
	const character = props.character;
	const s = props.traitSetID;
	const t = props.traitID;
	character.traitSets[ s ].traits[ t ].sfx.push(
		structuredClone( cortexFunctions.defaultSFX )
	);
	updateCharacter( character );
}

function removeEffect( effectID: number ) {
	const character = props.character;
	const s = props.traitSetID;
	const t = props.traitID;
	const f = effectID;
	character.traitSets[ s ].traits[ t ].sfx.splice( f, 1 );
	updateCharacter( character );
}

function addSubtrait() {
	const subtrait: any = structuredClone( cortexFunctions.defaultTrait );
	subtrait.name = 'New subtrait';
	const allowed = cortexFunctions.getSubtraitRatings( traitSet.value );
	const cur = subtrait.rating && subtrait.rating.type === 'Die' && Array.isArray( subtrait.rating.value ) ? subtrait.rating.value[0] : 0;
	if ( allowed.length > 0 && !allowed.includes( cur ) ) {
		subtrait.rating = { type: 'Die', value: [ allowed[ 0 ] ], range: allowed.slice() };
	}

	const character = props.character;
	const s = props.traitSetID;
	const t = props.traitID;
	character.traitSets[ s ].traits[ t ].traits.push( subtrait );
	updateCharacter( character );
}

function removeSubtrait( subtraitID: number ) {
	const character = props.character;
	const s = props.traitSetID;
	const t = props.traitID;
	const u = subtraitID;
	const entry = cortexFunctions.resolveTemplateFor( character, rootTemplates() );
	cortexFunctions.removeSubtraitFromSheet( character, entry, s, t, u );
	updateCharacter( character );
}

function updateCharacter( character: any ) {
	emit( 'updateCharacter', character );
}

function checkAnchorPosition() {
	if ( !rootEl.value || !rootEl.value.parentElement ) return;

	const windowHeight = ( window.innerHeight || document.documentElement.clientHeight );
	const parentRect = rootEl.value.parentElement.getBoundingClientRect();
	const traitMidpoint = parentRect.top + ( parentRect.height / 2 );

	if ( traitMidpoint < ( windowHeight / 2 ) ) {
		anchorPosition.value = 'top';
	} else {
		anchorPosition.value = 'bottom';
	}

	nextTick( () => {
		if ( !rootEl.value ) return;

		rootEl.value.style.setProperty( '--editor-shift-y', '0px' );
		rootEl.value.style.setProperty( '--arrow-shift-y', '0px' );

		const rect = rootEl.value.getBoundingClientRect();
		const pad = 16;
		let shiftY = 0;

		if ( rect.top < pad ) {
			shiftY = pad - rect.top;
		} else if ( rect.bottom > windowHeight - pad ) {
			shiftY = ( windowHeight - pad ) - rect.bottom;
		}

		if ( Math.abs( shiftY ) > 0.5 ) {
			rootEl.value.style.setProperty( '--editor-shift-y', `${shiftY}px` );
			const arrowNaturalY = ( anchorPosition.value === 'bottom' ) ? ( rect.height - 16 ) : 16;
			const targetArrowY = arrowNaturalY - shiftY;
			const clampedArrowY = Math.max( 16, Math.min( rect.height - 16, targetArrowY ) );
			const arrowShift = clampedArrowY - arrowNaturalY;
			rootEl.value.style.setProperty( '--arrow-shift-y', `${arrowShift}px` );
		}
		checkScrollPosition();
	} );
}

function checkScrollPosition() {
	if ( !rootEl.value || typeof rootEl.value.querySelector !== 'function' ) return;
	const element = rootEl.value.querySelector( '.editor-inner > div' ) as HTMLElement | null;
	if ( !element ) return;

	const distance = element.scrollTop;
	const max = element.scrollHeight - element.clientHeight;

	if ( max <= 0 ) {
		scrollPosition.value = 'none';
		return;
	}

	if ( distance === 0 ) {
		scrollPosition.value = 'top';
		return;
	}

	if ( distance >= ( max - 1 ) ) { // slight buffer
		scrollPosition.value = 'bottom';
		return;
	}

	scrollPosition.value = 'middle';
}

function getDieDisplayValue( val: any ) {
	return cortexFunctions.getDieDisplayValue( val );
}
</script>

<template>
	<aside :class="cssClass" ref="rootEl" @click.stop="">

		<div class="editor-arrow"></div>

		<div class="editor-controls">
			<button type="button" @click.stop="selectElement([])" title="Done"><i class="fas fa-times"></i></button>
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
			<button
				v-if="templateTraitMatched"
				type="button"
				class="editor-delete"
				@click.stop="removeFromSheet"
				title="Remove from sheet — reversible via restore, no confirmation needed"
			><i class="fas fa-eraser"></i></button>
		</div>

		<div class="editor-inner">
			<div @scroll="checkScrollPosition">
	
				<div class="editor-fields">

					<template v-if="isTalentsTable">
						<div class="editor-field">
							<label :for="'trait-talent-col1-' + traitID">{{ talentCol1Label }}</label>
							<input type="text" :id="'trait-talent-col1-' + traitID" name="talentName" v-model="name" ref="inputName" @focus="nameBeforeEdit = name" placeholder="e.g. Look, A Clue!">
						</div>

						<div class="editor-field">
							<label :for="'trait-talent-col2-' + traitID">{{ talentCol2Label }}</label>
							<textarea :id="'trait-talent-col2-' + traitID" name="talentDescription" v-model="description" rows="2" placeholder="e.g. When searching for information in a test..."></textarea>
						</div>

						<div class="editor-field">
							<label :for="'trait-talent-col3-' + traitID">{{ talentCol3Label }}</label>
							<textarea :id="'trait-talent-col3-' + traitID" name="talentEffect" v-model="talentEffect" rows="3" placeholder="e.g. Gain a d8 asset, even on a failure. Counts as a second asset on a success."></textarea>
						</div>
					</template>

					<div class="editor-field" v-else>
						<label :for="'trait-name-' + traitID">{{ isLabeledPipsSet ? 'Label' : (isPairedSlotsStyle ? 'Standing Name' : 'Trait Name') }}</label>
						<input type="text" :id="'trait-name-' + traitID" name="traitName" v-model="name" ref="inputName" @focus="nameBeforeEdit = name" :placeholder="isLabeledPipsSet ? 'e.g. A friendly local delivery' : (isPairedSlotsStyle ? 'e.g. Camp Director' : '')">
					</div>

					<div class="editor-hint" v-if="renameWarning">Renaming unlinks this trait from template updates — the original name will reappear as inherited.</div>

					<div class="editor-field" v-if="isNameSet">
						<label :for="'trait-label-' + traitID">Label</label>
						<input type="text" :id="'trait-label-' + traitID" name="traitLabel" v-model="traitLabel" placeholder="Label shown on the sheet">
					</div>

					<div class="editor-field">
						<div class="name-heading-row">
							<label>Visibility</label>
							<visibility-eye :state="traitVisibility" @toggle="traitVisibility = traitVisibility === 'shown' ? 'editor-only' : traitVisibility === 'editor-only' ? 'hidden' : 'shown'" />
						</div>
					</div>

					<!-- STATEMENT FIELD -->
					<div class="editor-field" v-if="isStatementSet || isPairedSlotsStyle">
						<label :for="'trait-statement-' + traitID">Statement</label>
						<textarea :id="'trait-statement-' + traitID" name="traitStatement" v-model="description" rows="2" placeholder="e.g. I'll try anything once."></textarea>
					</div>

					<!-- QUESTIONED PIP TOGGLE -->
					<div class="editor-field" v-if="isStatementSet && hasQuestionedPip">
						<div class="editor-toggles">
							<div>
								<input
									type="checkbox"
									:id="'trait-' + traitID + '-questioned'"
									name="traitQuestioned"
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
						<label :for="'trait-counter-' + traitID">{{ counterLabel }}</label>
						<input type="text" :id="'trait-counter-' + traitID" name="traitCounter" v-model="counterValue" :placeholder="counterLabel">
					</div>

					<!-- PIP ROW CHECKBOX -->
					<div class="editor-field" v-if="isLabeledPipsSet">
						<div class="editor-toggles">
							<div>
								<input
									type="checkbox"
									:id="'trait-' + traitID + '-pip-checked'"
									name="pipRowChecked"
									v-model="pipRowChecked"
								>
							</div>
							<div>
								<label :for="'trait-' + traitID + '-pip-checked'">
									Filled
								</label>
							</div>
						</div>
					</div>

					<!-- SCALE DIE TOGGLE FOR RING ATTRIBUTES -->
					<div class="editor-field" v-if="isAttributesTrait">
						<div class="editor-toggles">
							<div>
								<input
									type="checkbox"
									:id="'trait-' + traitID + '-is-scale'"
									name="isScaleDie"
									v-model="isScaleDie"
								>
							</div>
							<div>
								<label :for="'trait-' + traitID + '-is-scale'">
									Scale Die
								</label>
							</div>
						</div>
					</div>

					<div class="editor-field" v-if="parentIsBranch">
						<div class="editor-label">Branch Role</div>
						<div class="editor-button-group">
							<button type="button" class="editor-group-btn" :class="{ active: branchRole === 'skill' }" @click.stop="branchRole = 'skill'">
								<i class="fas fa-arrow-right"></i> Skill
							</button>
							<button type="button" class="editor-group-btn" :class="{ active: branchRole === 'specialty' }" @click.stop="branchRole = 'specialty'">
								Specialty
							</button>
						</div>
					</div>

					<div class="editor-field" v-if="parentIsBranch && branchRole === 'specialty'">
						<label :for="'trait-branch-link-' + traitID">Connects To Skill</label>
						<select :id="'trait-branch-link-' + traitID" name="branchLink" v-model="branchLink">
							<option :value="null">Unlinked</option>
							<option v-for="opt in branchSkillOptions" :key="opt.index" :value="opt.index">{{ opt.name }}</option>
						</select>
						<span class="editor-field-hint" style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.3rem; display: block; line-height: 1.35;">Draws the connecting arrow from this specialty to any skill in the set.</span>
					</div>

					<div class="editor-field" v-if="parentIsBranch && branchRole === 'specialty'">
						<div class="editor-label">Side</div>
						<div class="editor-button-group">
							<button type="button" class="editor-group-btn" :class="{ active: branchSide === 'left' }" @click.stop="branchSide = 'left'">
								<i class="fas fa-arrow-left"></i> Left
							</button>
							<button type="button" class="editor-group-btn" :class="{ active: branchSide === 'right' }" @click.stop="branchSide = 'right'">
								Right <i class="fas fa-arrow-right"></i>
							</button>
						</div>
					</div>

					<div class="editor-field" v-if="!isListStyle && !isLabeledPipsSet && !hideSkillDice">

						<div class="editor-label">Rating</div>

						<!-- UNRATED: the gate offers to add one -->
						<div class="editor-toggles" v-if="!isRatedTrait">
							<div><span class="trait-blank-line"></span></div>
							<div><button type="button" class="btn-step" @click.stop="addRating()">Add rating</button></div>
						</div>

						<!-- TYPE (Die | Dice | Counter | Pip) -->
						<div class="editor-button-group" v-if="isRatedTrait">
							<button
								type="button"
								v-for="rt in RATING_TYPES"
								:key="'rating-type-' + rt"
								class="editor-group-btn"
								:class="{ active: ratingType === rt }"
								@click.stop="setRatingType(rt)"
							>
								{{ rt }}
							</button>
						</div>

						<!-- OUT (range option for Die/Dice, default off) -->
						<div class="editor-toggles" v-if="isRatedTrait && (ratingType === 'Die' || ratingType === 'Dice')">
							<div>
								<input
									type="checkbox"
									:id="'trait-' + traitID + '-out'"
									name="ratingOut"
									v-model="ratingHasOut"
								>
							</div>
							<div>
								<label :for="'trait-' + traitID + '-out'">
									Out
								</label>
							</div>
						</div>

						<!-- SINGLE DIE SELECTOR -->
						<ul class="editor-values" v-if="ratingType === 'Die'">
							<li
								v-for="val in availableValues"
								:class="{ 'active': isDieActiveOf(trait, val) && !isOut }"
								tabindex="0"
								role="button"
								@keydown.enter.prevent="toggleTraitValue( val )"
								@keydown.space.prevent="toggleTraitValue( val )"
								@click.stop="toggleTraitValue( val )"
							>
								<span class="c" v-html="getDieDisplayValue(val)"></span>
							</li>
							<li
								v-if="shouldShowStressOut"
								class="editor-value-out"
								:class="{ 'active': isOut }"
								tabindex="0"
								role="button"
								@keydown.enter.prevent="toggleOutValue"
								@keydown.space.prevent="toggleOutValue"
								@click.stop="toggleOutValue"
								title="Out"
							>
								<span>{{ outLabel }}</span>
							</li>
						</ul>

						<!-- DICE LIST EDITOR -->
						<div class="editor-multidie-container" v-else-if="ratingType === 'Dice'">
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
								<span class="sub-label">Current Dice ({{ dice.length }}):</span>
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

						<!-- COUNTER NUMBER + RANGE -->
						<div v-else-if="ratingType === 'Counter'">
							<div style="display: flex; gap: 0.5rem; align-items: flex-end; flex-wrap: wrap;">
								<div style="flex: 1; min-width: 5rem;">
									<label :for="'trait-' + traitID + '-counter-number'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Count</label>
									<input type="number" :id="'trait-' + traitID + '-counter-number'" name="counterNumber" v-model.number="counterNumber" inputmode="numeric" style="width: 100%;">
								</div>
								<div style="flex: 1; min-width: 4rem;">
									<label :for="'trait-' + traitID + '-counter-min'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Min</label>
									<input type="number" :id="'trait-' + traitID + '-counter-min'" name="counterMin" :value="counterBounds()[0]" @change="commitCounterBound(0, $event)" inputmode="numeric" style="width: 100%;">
								</div>
								<div style="flex: 1; min-width: 4rem;">
									<label :for="'trait-' + traitID + '-counter-max'" style="font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.2rem;">Max</label>
									<input type="number" :id="'trait-' + traitID + '-counter-max'" name="counterMax" :value="counterBounds()[1]" @change="commitCounterBound(1, $event)" inputmode="numeric" style="width: 100%;">
								</div>
							</div>
						</div>

						<!-- PIP BUBBLE ROW -->
						<div v-else-if="ratingType === 'Pip'">
							<div class="pip-editor-row">
								<div
									v-for="bubbleIndex in pipBubbleCount"
									:key="'pip-' + bubbleIndex"
									class="pip-bubble-wrap"
									tabindex="0"
									role="button"
									@keydown.enter.prevent="togglePipBubble(bubbleIndex - 1)"
									@keydown.space.prevent="togglePipBubble(bubbleIndex - 1)"
									@click.stop="togglePipBubble(bubbleIndex - 1)"
									:title="pipBubbleAt(bubbleIndex - 1) ? 'Unfill bubble' : 'Fill bubble'"
								>
									<div class="pip-bubble" :class="{ 'filled': pipBubbleAt(bubbleIndex - 1) }"></div>
								</div>
								<span class="pip-editor-count" v-if="pipBubbleCount === 0">No bubbles</span>
							</div>
							<div class="num-stepper" style="margin-top: 0.4rem;">
								<button type="button" class="btn-step" @click.stop="setPipBubbleCount(pipBubbleCount - 1)" :disabled="pipBubbleCount <= 1" title="Fewer bubbles" aria-label="Fewer bubbles">-</button>
								<input type="number" :id="'trait-' + traitID + '-pip-count'" name="pipBubbleCount" min="1" max="100" :value="pipBubbleCount" @change="commitPipBubbleCount($event)" inputmode="numeric" aria-label="Bubble count" style="width: 4rem;">
								<button type="button" class="btn-step" @click.stop="setPipBubbleCount(pipBubbleCount + 1)" title="More bubbles" aria-label="More bubbles">+</button>
							</div>
						</div>

					</div>

					<!-- RATING RANGE (the die ladder Die/Dice ratings may take) -->
					<div class="editor-field" v-if="isRatedTrait && ( ratingType === 'Die' || ratingType === 'Dice' ) && !isListStyle && !isLabeledPipsSet && !hideSkillDice">
						<div class="editor-label">Range</div>
						<div class="rating-scale-container">
							<div class="rating-scale-chips">
								<button
									type="button"
									v-for="size in [4, 6, 8, 10, 12]"
									:key="'range-' + size"
									class="rating-scale-chip"
									:class="{ active: isRangeIncluded(size) }"
									@click.stop="toggleRangeOption(size)"
									:title="(isRangeIncluded(size) ? 'Exclude d' : 'Include d') + size"
								>
									<span class="c" v-html="getDieDisplayValue(size)"></span>
									<span class="chip-label">d{{ size }}</span>
								</button>
							</div>
						</div>
					</div>

					<!-- OPTIONS (only what the shape makes meaningful) -->
					<div class="editor-field" v-if="isRatedTrait && !isListStyle && !isLabeledPipsSet">
						<div class="editor-label">Options</div>
						<div class="editor-toggles">
							<div><input type="checkbox" :id="'trait-' + traitID + '-pool'" :true-value="true" :false-value="false" v-model="traitPool"></div>
							<div><label :for="'trait-' + traitID + '-pool'" title="Adding the trait stages its whole array of available dice">Pool</label></div>

							<div><input type="checkbox" :id="'trait-' + traitID + '-spendable'" :true-value="true" :false-value="false" v-model="traitSpendable"></div>
							<div><label :for="'trait-' + traitID + '-spendable'">Spendable</label></div>
						</div>
						<div class="editor-toggles" v-if="hitchesDiffers" style="margin-top: 0.4rem;">
							<div><label :for="'trait-' + traitID + '-hitches'">Hitches</label></div>
							<div><input type="number" :id="'trait-' + traitID + '-hitches'" name="traitHitches" min="0" max="12" v-model.number="traitHitches" style="width: 4rem;"></div>
						</div>
					</div>

					<!-- ATTACHED STRESS SELECTOR -->
					<div class="editor-field" v-if="hasAttachedStress">
						<div class="editor-label">Attached {{ attachedStressLabel }}</div>
						<ul class="editor-values">
							<li
								:class="{ 'active': attachedStressValue === 0 }"
								tabindex="0"
								role="button"
								@keydown.enter.prevent="setAttachedStress(0)"
								@keydown.space.prevent="setAttachedStress(0)"
								@click.stop="setAttachedStress(0)"
								title="No stress"
							>
								<span style="font-size: 0.75rem; font-weight: 700;">-</span>
							</li>
							<li
								v-for="val in attachedStressScale"
								:class="{ 'active': attachedStressValue === val }"
								tabindex="0"
								role="button"
								@keydown.enter.prevent="setAttachedStress(val)"
								@keydown.space.prevent="setAttachedStress(val)"
								@click.stop="setAttachedStress(val)"
							>
								<span class="c" v-html="getDieDisplayValue(val)"></span>
							</li>
						</ul>
					</div>

					<div class="editor-field" v-if="getView( traitSet )?.features?.description && !isTalentsTable && !isStatementSet && !isPairedSlotsStyle && !isLabeledPipsSet">
						<label :for="'trait-desc-' + traitID">Description</label>
						<textarea :id="'trait-desc-' + traitID" name="traitDescription" v-model="description"></textarea>
					</div>

					<!-- SUBTRAITS -->
					<div class="editor-field" v-if="getView( traitSet )?.features?.subtraits">

						<div class="editor-label">Subtraits</div>

						<div class="editor-subgroups">

							<transition-group appear>
								<subtrait-editor
									v-for="(subtrait, subtraitID) in trait.traits"
									:key="traitSetID + '-' + traitID + '-' + subtraitID"
									:character="character"
									:traitSetID="traitSetID"
									:traitID="traitID"
									:subtraitID="Number(subtraitID)"
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
					<div class="editor-field" v-if="getView( traitSet )?.features?.sfx && !isTalentsTable">

						<div class="editor-label">SFX</div>

						<div class="editor-field" v-if="canHinderTrait">
							<div class="editor-toggles">
								<div><input type="checkbox" :id="'trait-' + traitSetID + '-' + traitID + '-hinder'" name="canHinder" :true-value="true" :false-value="false" v-model="hinder"></div>
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

	</aside>
</template>
