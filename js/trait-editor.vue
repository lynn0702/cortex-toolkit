<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, onUpdated, ref, toRaw, watch } from 'vue';
import { cortexFunctions } from './functions.ts';
import { getView, ensureView, getRating, ratingDice, setRatingDie, setRatingDice,
isRated, resolveHitches, resolveVisibility, nextVisibility, DIE_LADDER, rangeTop, isOutDie, type Character } from './model.ts';
import SubtraitEditor from './subtrait-editor.vue';
import SfxEditor from './sfx-editor.vue';
import VisibilityEye from './visibility-eye.vue';

const props = defineProps<{
	character: Character;
	traitSetID: number;
	traitID: number;
	open: boolean;
	submode?: string | null;
	viewY?: number | null;
}>();

const emit = defineEmits<{
	( e: 'selectElement', selector: any[] ): void;
	( e: 'updateCharacter', character: Character ): void;
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

const isPlay = computed( () => props.submode === 'play' );
const canDeleteInPlay = computed( () => cortexFunctions.isPlayAddRemovableSet( traitSet.value ) );

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
		if ( isThreeColumnTable.value ) {
			const entries = cortexFunctions.sfxChildren( trait.value );
			const sfx = entries.find( ( e: any ) => String( e.name || '' ).toLowerCase() !== 'hinder' );
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
		return cortexFunctions.isStatementFilled( trait.value );
	},
	set( val: any ) {
		if ( !trait.value ) return;
		if ( !cortexFunctions.setStatementFilled( trait.value, Boolean( val ) ) ) return;
		updateCharacter( props.character );
	},
} );

const hasCounterColumn = computed( () => Boolean( traitSet.value?.hasCounterColumn ?? getView( traitSet.value )?.hasCounterColumn ) );
const counterLabel = computed( () => traitSet.value?.counterLabel || getView( traitSet.value )?.counterLabel || 'XP' );

const counterValue = computed( {
	get() {
		return trait.value?.counter ?? trait.value?.xp ?? trait.value?.custom?.counter ?? trait.value?.custom?.xp ?? '';
	},
	set( val: any ) {
		if ( !trait.value ) return;
		trait.value.counter = val;
		delete trait.value.xp;
		if ( trait.value.custom ) {
			delete trait.value.custom.counter;
			delete trait.value.custom.xp;
		}
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
		const nums = ( r.range || [] ).filter( ( n ): n is number => typeof n === 'number' );
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
	const range = r.range || [];
	if ( range.length && typeof range[0] === 'number' && range[0] > 0 ) return Math.floor( range[0] );
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
		return trait.value?.description ?? '';
	},
	set( val: string ) {
		setProperty( 'description', val );
	},
} );

// The statement is a child trait: its name is the sentence and its Pip is
// the questioned state. Editing here creates/renames/removes that child.
const statementText = computed( {
	get() {
		return cortexFunctions.statementText( trait.value );
	},
	set( val: string ) {
		if ( !trait.value ) return;
		cortexFunctions.setStatementText( trait.value, val );
		updateCharacter( props.character );
	},
} );

const hinder = computed( {
	get() {
		return cortexFunctions.hasHinder( trait.value );
	},
	set( val: any ) {
		setHinder( val );
	},
} );

const editableSFX = computed( () => {
	const entries = cortexFunctions.sfxChildren( trait.value );
	return entries
		.map( ( effect: any, idx: number ) => ( String( effect.name || '' ).toLowerCase() === 'hinder' ? -1 : idx ) )
		.filter( ( idx: number ) => idx !== -1 );
} );

// Child traits that are subtraits, not the SFX or statement containers.
// Index is the real position in `trait.traits`, so the subtrait editor
// reads correctly.
const subtraits = computed( () => {
	const subs = trait.value?.traits;
	if ( !Array.isArray( subs ) ) return [];
	return subs
		.map( ( sub: any, idx: number ) => ( { sub, idx } ) )
		.filter( ( item: any ) => !cortexFunctions.isSfxContainer( item.sub ) && !cortexFunctions.isStatementContainer( item.sub ) );
} );

const scrollable = computed( () => Boolean(
	( getView( traitSet.value )?.features?.sfx && editableSFX.value.length > 0 && !isThreeColumnTable.value )
	||
	( getView( traitSet.value )?.features?.subtraits && subtraits.value.length > 0 )
) );

const isThreeColumnTable = computed( () => getView( traitSet.value )?.style?.body === 'three-column-table' );

const tableCol1Label = computed( () => {
	const labels = getView( traitSet.value )?.labels;
	if ( labels && labels.col1 ) return labels.col1;
	return cortexFunctions.labelDefaultForStyle( 'three-column-table', 'col1' ) || 'TALENT';
} );

const tableCol2Label = computed( () => {
	const labels = getView( traitSet.value )?.labels;
	if ( labels && labels.col2 ) return labels.col2;
	return cortexFunctions.labelDefaultForStyle( 'three-column-table', 'col2' ) || 'ACTIVATION';
} );

const tableCol3Label = computed( () => {
	const labels = getView( traitSet.value )?.labels;
	if ( labels && labels.col3 ) return labels.col3;
	return cortexFunctions.labelDefaultForStyle( 'three-column-table', 'col3' ) || 'EFFECT';
} );

const tableCol3Text = computed( {
	get() {
		const entries = cortexFunctions.sfxChildren( trait.value );
		const sfx = entries.find( ( e: any ) => String( e.name || '' ).toLowerCase() !== 'hinder' );
		if ( !sfx ) return '';
		return sfx.description || sfx.name || '';
	},
	set( val: string ) {
		const container = cortexFunctions.ensureSfxContainer( trait.value );
		if ( !container || !Array.isArray( container.traits ) ) return;
		const idx = container.traits.findIndex( ( e: any ) => String( e.name || '' ).toLowerCase() !== 'hinder' );
		if ( idx === -1 ) {
			container.traits.push( {
				name: trait.value.name || '',
				description: val,
				tags: [],
				custom: {}
			} );
		} else {
			container.traits[ idx ].description = val;
			container.traits[ idx ].name = trait.value.name || '';
		}
		updateCharacter( props.character );
	},
} );

const canHinderTrait = computed( () => {
	if ( isListStyle.value || isLabeledPipsSet.value || isThreeColumnTable.value ) return false;
	const body = getView( traitSet.value )?.style?.body;
	if ( body === 'three-column-table' || body === 'list' || body === 'notes' || body === 'labeled-fields' ) {
		return false;
	}
	return isRated( trait.value );
} );

const isRingTrait = computed( () => {
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
		if ( val && ( !t.name || t.name === 'New ' + ( traitSet.value?.noun || 'Trait' ) || t.name === 'New trait' || t.name === 'New Attribute' ) ) {
			setProperty( 'name', 'Scale' );
		}
		updateCharacter( props.character );
	},
} );

const isSteppedTrackSet = computed( () => getView( traitSet.value )?.style?.body === 'die-track' );

const shouldShowTrackOut = computed( () => {
	return isSteppedTrackSet.value;
} );

const isOut = computed( () => isOutDie( trait.value, [ traitSet.value ] ) );

const outLabel = computed( () => {
	const labels = getView( traitSet.value )?.labels;
	if ( labels && typeof labels.out === 'string' && labels.out.length ) return labels.out;
	return cortexFunctions.labelDefaultForStyle( getView( traitSet.value )?.style?.body, 'out' ) || '💥 OUT';
} );

const availableValues = computed( () => cortexFunctions.getTraitSetRatings( traitSet.value ) );

const hasTrackPart = computed( () => cortexFunctions.hasTrackPart( traitSet.value ) );
const trackLabel = computed( () => cortexFunctions.getTrackLabel( traitSet.value ) );
const trackScale = computed( () => cortexFunctions.getTrackScale( traitSet.value ) );

const trackCompanion = computed( () => {
	const subs = trait.value?.traits;
	if ( !Array.isArray( subs ) ) return undefined;
	const target = trackLabel.value.toLowerCase();
	return subs.find( ( st: any ) => st && typeof st === 'object' && typeof st.name === 'string' && st.name.toLowerCase() === target );
} );

const trackValue = computed( {
	get() {
		if ( trackCompanion.value ) {
			const dice = cortexFunctions.getTraitDice( trackCompanion.value );
			return dice[0] || 0;
		}
		return 0;
	},
	set( val: any ) {
		const character = props.character;
		const t = character.traitSets[ props.traitSetID ].traits[ props.traitID ];
		if ( !Array.isArray( t.traits ) ) t.traits = [];
		const label = trackLabel.value;
		const target = label.toLowerCase();
		let companion = t.traits.find( ( st: any ) => st && typeof st === 'object' && typeof st.name === 'string' && st.name.toLowerCase() === target );
		if ( val ) {
			if ( companion ) cortexFunctions.setTraitDice( companion, [ val ] );
			else t.traits.push( { name: label, description: '', tags: [], rating: { type: 'Die', value: [ val ], range: trackScale.value.slice() } } );
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

const branchParentOptions = computed( () => {
	const traits = traitSet.value?.traits || [];
	const fallbackNoun = traitSet.value?.noun || 'Trait';
	const opts: any[] = [];
	traits.forEach( ( tr: any, idx: number ) => {
		if ( idx === props.traitID ) return;
		if ( getView( tr )?.branchRole === 'specialty' ) return;
		opts.push( { index: idx, name: tr?.name?.length ? tr.name : ( fallbackNoun + ' ' + ( idx + 1 ) ) } );
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

const hideUnratedSetDie = computed( () => Boolean( parentIsBranch.value && branchRole.value !== 'specialty' && setRating.value && !isRated( trait.value ) ) );

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
	( character.traitSets[ s ].traits[ t ] as Record<string, any> )[ key ] = val;
	updateCharacter( character );
}

function setHinder( val: any ) {
	const character = props.character;
	const s = props.traitSetID;
	const t = props.traitID;
	cortexFunctions.setHinder( character.traitSets[ s ].traits[ t ], Boolean( val ) );
	updateCharacter( character );
}

function setTrackValue( val: any ) {
	const character = props.character;
	const t = character.traitSets[ props.traitSetID ].traits[ props.traitID ];
	if ( !Array.isArray( t.traits ) ) t.traits = [];
	const label = trackLabel.value;
	const target = label.toLowerCase();
	const companion = t.traits.find( ( st: any ) => st && typeof st === 'object' && typeof st.name === 'string' && st.name.toLowerCase() === target );
	const current = companion ? ( cortexFunctions.getTraitDice( companion )[0] || 0 ) : 0;
	if ( current === val ) {
		if ( companion ) t.traits.splice( t.traits.indexOf( companion ), 1 );
	} else if ( companion ) {
		cortexFunctions.setTraitDice( companion, [ val ] );
	} else {
		t.traits.push( { name: label, description: '', tags: [], rating: { type: 'Die', value: [ val ], range: trackScale.value.slice() } } );
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

const dieRange = computed( () => {
	const r = getRating( trait.value );
	if ( r && Array.isArray( r.range ) && r.range.length ) {
		return [ ...r.range ].sort( ( a, b ) => a - b );
	}
	const av = availableValues.value;
	if ( Array.isArray( av ) && av.length ) {
		return [ ...av ].sort( ( a, b ) => a - b );
	}
	return [ ...DIE_LADDER ];
} );

function getDieStepPrev( currentSize: number, range: number[] = dieRange.value ): number | null {
	if ( !range.length ) return null;
	const idx = range.indexOf( currentSize );
	if ( idx !== -1 ) return idx > 0 ? range[ idx - 1 ] : null;
	const smaller = range.filter( s => s < currentSize );
	return smaller.length ? smaller[ smaller.length - 1 ] : null;
}

function getDieStepNext( currentSize: number, range: number[] = dieRange.value ): number | null {
	if ( !range.length ) return null;
	const idx = range.indexOf( currentSize );
	if ( idx !== -1 ) return idx < range.length - 1 ? range[ idx + 1 ] : null;
	const larger = range.filter( s => s > currentSize );
	return larger.length ? larger[ 0 ] : null;
}

const singleDieStepPrev = computed( () => getDieStepPrev( firstDieOf( trait.value ) ) );
const singleDieStepNext = computed( () => getDieStepNext( firstDieOf( trait.value ) ) );

function stepSingleDieDown() {
	const prev = singleDieStepPrev.value;
	if ( prev !== null && trait.value ) {
		setRatingDie( trait.value as unknown as Record<string, any>, prev, dieRange.value );
		updateCharacter( props.character );
	}
}

function stepSingleDieUp() {
	const next = singleDieStepNext.value;
	if ( next !== null && trait.value ) {
		setRatingDie( trait.value as unknown as Record<string, any>, next, dieRange.value );
		updateCharacter( props.character );
	}
}

function stepDownDieAtIndexAlongRange( index: number ) {
	const current = [ ...dice.value ];
	if ( index >= 0 && index < current.length && trait.value ) {
		const curSize = current[ index ];
		const prev = getDieStepPrev( curSize );
		if ( prev !== null ) {
			current[ index ] = prev;
			setRatingDice( trait.value as unknown as Record<string, any>, current, dieRange.value );
			syncPoolCount( current.length );
			updateCharacter( props.character );
		}
	}
}

function stepUpDieAtIndexAlongRange( index: number ) {
	const current = [ ...dice.value ];
	if ( index >= 0 && index < current.length && trait.value ) {
		const curSize = current[ index ];
		const next = getDieStepNext( curSize );
		if ( next !== null ) {
			current[ index ] = next;
			setRatingDice( trait.value as unknown as Record<string, any>, current, dieRange.value );
			syncPoolCount( current.length );
			updateCharacter( props.character );
		}
	}
}

function stepCounterDown() {
	const [ lo ] = counterBounds();
	if ( counterNumber.value > lo ) {
		counterNumber.value = counterNumber.value - 1;
	}
}

function stepCounterUp() {
	const [ , hi ] = counterBounds();
	if ( counterNumber.value < hi ) {
		counterNumber.value = counterNumber.value + 1;
	}
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
	const container = cortexFunctions.ensureSfxContainer( character.traitSets[ s ].traits[ t ] );
	if ( container && Array.isArray( container.traits ) ) {
		container.traits.push( structuredClone( cortexFunctions.defaultSFX ) );
	}
	updateCharacter( character );
}

function removeEffect( effectID: number ) {
	const character = props.character;
	const s = props.traitSetID;
	const t = props.traitID;
	cortexFunctions.removeSfxAt( character.traitSets[ s ].traits[ t ], effectID );
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
	const tr = character.traitSets[ s ].traits[ t ];
	if ( !Array.isArray( tr.traits ) ) tr.traits = [];
	tr.traits.push( subtrait );
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
			<button type="button" @click.stop="selectElement([])" title="Done" aria-label="Close trait editor"><i class="fas fa-times"></i></button>
			<button v-if="!isPlay" type="button" class="editor-copy" @click.stop="duplicateTrait" title="Duplicate trait" aria-label="Duplicate trait"><i class="fas fa-copy"></i></button>
			<template v-if="!isPlay || canDeleteInPlay">
				<button
					v-if="!confirmDelete"
					type="button"
					class="editor-delete"
					@click.stop="confirmDelete = true"
					title="Delete trait"
					aria-label="Delete trait"
				><i class="fas fa-trash"></i></button>
				<button
					v-else
					type="button"
					class="editor-delete editor-delete-confirm"
					@click.stop="removeTrait"
					title="Click again to confirm deletion"
					aria-label="Confirm delete trait"
				><span>Confirm?</span></button>
			</template>
			<button
				v-if="templateTraitMatched && !isPlay"
				type="button"
				class="editor-delete"
				@click.stop="removeFromSheet"
				title="Remove from sheet — reversible via restore, no confirmation needed"
				aria-label="Remove trait from sheet"
			><i class="fas fa-eraser"></i></button>
		</div>

		<div class="editor-inner">
			<div @scroll="checkScrollPosition">
	
				<div class="editor-fields">

					<template v-if="isThreeColumnTable">
						<div class="editor-field">
							<label :for="'trait-col1-' + traitID">{{ tableCol1Label }}</label>
							<div class="editor-readonly-title" v-if="isPlay">{{ name }}</div>
							<input v-else type="text" :id="'trait-col1-' + traitID" name="col1Name" v-model="name" ref="inputName" @focus="nameBeforeEdit = name">
						</div>

						<div class="editor-field">
							<label :for="'trait-col2-' + traitID">{{ tableCol2Label }}</label>
							<div class="editor-readonly-text" v-if="isPlay">{{ description }}</div>
							<textarea v-else :id="'trait-col2-' + traitID" name="col2Description" v-model="description" rows="2"></textarea>
						</div>

						<div class="editor-field">
							<label :for="'trait-col3-' + traitID">{{ tableCol3Label }}</label>
							<div class="editor-readonly-text" v-if="isPlay">{{ tableCol3Text }}</div>
							<textarea v-else :id="'trait-col3-' + traitID" name="col3Text" v-model="tableCol3Text" rows="3"></textarea>
						</div>
					</template>

					<div class="editor-field" v-else>
						<label :for="'trait-name-' + traitID">{{ isLabeledPipsSet ? 'Label' : 'Trait Name' }}</label>
						<div class="editor-readonly-title" v-if="isPlay && !canDeleteInPlay">{{ name }}</div>
						<input v-else type="text" :id="'trait-name-' + traitID" name="traitName" v-model="name" ref="inputName" @focus="nameBeforeEdit = name">
					</div>

					<div class="editor-hint" v-if="renameWarning && !isPlay">Renaming unlinks this trait from template updates — the original name will reappear as inherited.</div>

					<div class="editor-field" v-if="isNameSet && !isPlay">
						<label :for="'trait-label-' + traitID">Label</label>
						<input type="text" :id="'trait-label-' + traitID" name="traitLabel" v-model="traitLabel" placeholder="Label shown on the sheet">
					</div>

					<div class="editor-field" v-if="!isPlay">
						<div class="name-heading-row">
							<label>Visibility</label>
							<visibility-eye :state="traitVisibility" @toggle="traitVisibility = nextVisibility(traitVisibility)" />
						</div>
					</div>

					<!-- STATEMENT FIELD -->
					<div class="editor-field" v-if="isStatementSet || isPairedSlotsStyle">
						<label :for="'trait-statement-' + traitID">Statement</label>
						<textarea :id="'trait-statement-' + traitID" name="traitStatement" v-model="statementText" rows="2"></textarea>
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
									:disabled="!statementText"
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

					<!-- SCALE DIE TOGGLE FOR PORTRAIT RING -->
					<div class="editor-field" v-if="isRingTrait && !isPlay">
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

					<div class="editor-field" v-if="parentIsBranch && !isPlay">
						<div class="editor-label">Branch Role</div>
						<div class="editor-button-group">
							<button type="button" class="editor-group-btn" :class="{ active: branchRole === 'skill' }" @click.stop="branchRole = 'skill'">
								<i class="fas fa-arrow-right"></i> {{ traitSet?.noun || 'Trait' }}
							</button>
							<button type="button" class="editor-group-btn" :class="{ active: branchRole === 'specialty' }" @click.stop="branchRole = 'specialty'">
								Subtrait
							</button>
						</div>
					</div>

					<div class="editor-field" v-if="parentIsBranch && branchRole === 'specialty' && !isPlay">
						<label :for="'trait-branch-link-' + traitID">Connects To {{ traitSet?.noun || 'Trait' }}</label>
						<select :id="'trait-branch-link-' + traitID" name="branchLink" v-model="branchLink">
							<option :value="null">Unlinked</option>
							<option v-for="opt in branchParentOptions" :key="opt.index" :value="opt.index">{{ opt.name }}</option>
						</select>
						<span class="editor-field-hint" style="font-size: 0.72rem; color: #94a3b8; margin-top: 0.3rem; display: block; line-height: 1.35;">Draws the connecting arrow from this subtrait to any parent trait in the set.</span>
					</div>

					<div class="editor-field" v-if="parentIsBranch && branchRole === 'specialty' && !isPlay">
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

					<div class="editor-field" v-if="!isListStyle && !isLabeledPipsSet && !hideUnratedSetDie">

						<div class="editor-label" v-if="!isPlay || isRatedTrait">Rating</div>

						<!-- UNRATED: the gate offers to add one -->
						<div class="editor-button-container my-2" v-if="!isRatedTrait && !isPlay">
							<div class="editor-button-container-inner">
								<button type="button" class="editor-button" @click.stop="addRating()">
									<span><i class="fas fa-plus me-1"></i> Add Rating</span>
								</button>
							</div>
						</div>

						<!-- TYPE (Die | Dice | Counter | Pip) -->
						<div class="editor-button-group" v-if="isRatedTrait && !isPlay">
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
						<div class="editor-toggles" v-if="isRatedTrait && (ratingType === 'Die' || ratingType === 'Dice') && !isPlay">
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

						<!-- SINGLE DIE SELECTOR (EDIT MODE) -->
						<ul class="editor-values" v-if="ratingType === 'Die' && !isPlay">
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
								v-if="shouldShowTrackOut"
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

						<!-- SINGLE DIE STEPPER (PLAY MODE) -->
						<div class="die-rating-stepper" v-else-if="ratingType === 'Die' && isPlay">
							<button
								type="button"
								class="btn-step"
								:disabled="singleDieStepPrev === null"
								@click.stop="stepSingleDieDown()"
								title="Step down"
								aria-label="Step down"
							>-</button>
							<div class="die-rating-current">
								<span class="c" v-html="getDieDisplayValue(firstDieOf(trait))"></span>
								<span class="die-rating-text">d{{ firstDieOf(trait) }}</span>
							</div>
							<button
								type="button"
								class="btn-step"
								:disabled="singleDieStepNext === null"
								@click.stop="stepSingleDieUp()"
								title="Step up"
								aria-label="Step up"
							>+</button>
							<button
								type="button"
								class="btn-unset-rating"
								v-if="firstDieOf(trait) > 0"
								@click.stop="setRatingDie(trait as unknown as Record<string, any>, null); updateCharacter(props.character)"
								title="Clear rating"
								aria-label="Clear rating"
							><i class="fas fa-xmark" aria-hidden="true"></i></button>
						</div>

						<!-- DICE LIST EDITOR -->
						<div class="editor-multidie-container" v-else-if="ratingType === 'Dice'">
							<div class="editor-die-steppers" v-if="!isPlay">
								<div v-for="size in availableValues" :key="'stepper-' + size" class="die-stepper-item">
									<span class="c" v-html="getDieDisplayValue(size)"></span>
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
										<span class="c" v-html="getDieDisplayValue(dieSize)"></span>
										<span class="chip-text">d{{ dieSize }}</span>
										<template v-if="isPlay">
											<button
												type="button"
												class="btn-step-play"
												:disabled="getDieStepPrev(dieSize) === null"
												@click.stop="stepDownDieAtIndexAlongRange(dIdx)"
												title="Step down"
												aria-label="Step down"
											>-</button>
											<button
												type="button"
												class="btn-step-play"
												:disabled="getDieStepNext(dieSize) === null"
												@click.stop="stepUpDieAtIndexAlongRange(dIdx)"
												title="Step up"
												aria-label="Step up"
											>+</button>
										</template>
										<template v-else>
											<button type="button" class="btn-step-down" @click.stop="stepDownDieAtIndex(dIdx)" title="Step down die size">-2</button>
											<button type="button" class="btn-remove-die" @click.stop="removeDieAtIndex(dIdx)" title="Remove die">×</button>
										</template>
									</div>
								</div>
							</div>
						</div>

						<!-- COUNTER NUMBER + RANGE -->
						<div v-else-if="ratingType === 'Counter'">
							<div v-if="!isPlay" style="display: flex; gap: 0.5rem; align-items: flex-end; flex-wrap: wrap;">
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
							<div v-else class="num-stepper">
								<button
									type="button"
									class="btn-step"
									:disabled="counterNumber <= counterBounds()[0]"
									@click.stop="stepCounterDown()"
									title="Decrease count"
									aria-label="Decrease count"
								>-</button>
								<span class="stepper-count" style="font-size: 1rem; font-weight: bold; min-width: 2.2rem; text-align: center; color: white;">{{ counterNumber }}</span>
								<button
									type="button"
									class="btn-step"
									:disabled="counterNumber >= counterBounds()[1]"
									@click.stop="stepCounterUp()"
									title="Increase count"
									aria-label="Increase count"
								>+</button>
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
							<div class="num-stepper" v-if="!isPlay" style="margin-top: 0.4rem;">
								<button type="button" class="btn-step" @click.stop="setPipBubbleCount(pipBubbleCount - 1)" :disabled="pipBubbleCount <= 1" title="Fewer bubbles" aria-label="Fewer bubbles">-</button>
								<input type="number" :id="'trait-' + traitID + '-pip-count'" name="pipBubbleCount" min="1" max="100" :value="pipBubbleCount" @change="commitPipBubbleCount($event)" inputmode="numeric" aria-label="Bubble count" style="width: 4rem;">
								<button type="button" class="btn-step" @click.stop="setPipBubbleCount(pipBubbleCount + 1)" title="More bubbles" aria-label="More bubbles">+</button>
							</div>
						</div>

					</div>

					<!-- RATING RANGE (the die ladder Die/Dice ratings may take) -->
					<div class="editor-field" v-if="!isPlay && isRatedTrait && ( ratingType === 'Die' || ratingType === 'Dice' ) && !isListStyle && !isLabeledPipsSet && !hideUnratedSetDie">
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
					<div class="editor-field" v-if="!isPlay && isRatedTrait && !isListStyle && !isLabeledPipsSet">
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

					<!-- ATTACHED TRACK SELECTOR -->
					<div class="editor-field" v-if="hasTrackPart">
						<div class="editor-label">Attached {{ trackLabel }}</div>
						<ul class="editor-values">
							<li
								:class="{ 'active': trackValue === 0 }"
								tabindex="0"
								role="button"
								@keydown.enter.prevent="setTrackValue(0)"
								@keydown.space.prevent="setTrackValue(0)"
								@click.stop="setTrackValue(0)"
								title="None"
							>
								<span style="font-size: 0.75rem; font-weight: 700;">-</span>
							</li>
							<li
								v-for="val in trackScale"
								:class="{ 'active': trackValue === val }"
								tabindex="0"
								role="button"
								@keydown.enter.prevent="setTrackValue(val)"
								@keydown.space.prevent="setTrackValue(val)"
								@click.stop="setTrackValue(val)"
							>
								<span class="c" v-html="getDieDisplayValue(val)"></span>
							</li>
						</ul>
					</div>

					<div class="editor-field" v-if="!isPlay && getView( traitSet )?.features?.description && !isThreeColumnTable && !isStatementSet && !isPairedSlotsStyle && !isLabeledPipsSet">
						<label :for="'trait-desc-' + traitID">Description</label>
						<textarea :id="'trait-desc-' + traitID" name="traitDescription" v-model="description"></textarea>
					</div>

					<!-- SUBTRAITS -->
					<div class="editor-field" v-if="getView( traitSet )?.features?.subtraits">

						<div class="editor-label">Subtraits</div>

						<div class="editor-subgroups">

							<transition-group appear>
								<subtrait-editor
									v-for="item in subtraits"
									:key="traitSetID + '-' + traitID + '-' + item.idx"
									:character="character"
									:traitSetID="traitSetID"
									:traitID="traitID"
									:subtraitID="Number(item.idx)"
									:submode="submode"
									@updateCharacter="updateCharacter"
									@removeSubtrait="removeSubtrait"
								></subtrait-editor>
							</transition-group>

						</div>

						<div class="editor-button-container" v-if="!isPlay">
							<div class="editor-button-container-inner">
								<div class="editor-button" @click.stop="addSubtrait">
									<span><i class="fas fa-plus"></i> New Subtrait</span>
								</div>
							</div>
						</div>

					</div>

					<!-- SFX -->
					<div class="editor-field" v-if="!isPlay && getView( traitSet )?.features?.sfx && !isThreeColumnTable">

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
