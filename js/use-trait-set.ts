import { computed, provide, inject, type InjectionKey } from 'vue';
import { cortexFunctions } from './functions.ts';
import { getView, ensureView, resolveSheetStyle, getRating, ratingDice, setRatingDice, setRatingDie,
	resolveHitches, rollSeparate, keepsExtraDice, availableDice, getSpentIndices, isRated, isHiddenIn,
	hasOutRange, rangeTop, isOutDie } from './model.ts';
import { KNOWN_PARTS, partsGrid, partCellStyle, partsGridStyle } from './spotlight-grid.ts';
import type { Character, Trait, TraitSet } from './model.ts';

export interface TraitSetApi {
	[ key: string ]: any;
}

export interface TraitSetProps {
	character: Character;
	traitSetID?: number;
	submode?: string | null;
	editing?: unknown[] | null;
	viewY?: number | null;
	printBlank?: boolean;
	printStyle?: string | null;
}

export const TRAIT_SET_KEY: InjectionKey<TraitSetApi> = Symbol( 'traitSetApi' );

export function isPlayAddRemovableSet( traitSetArg: TraitSet ): boolean {
	return cortexFunctions.isPlayAddRemovableSet( traitSetArg );
}

export function useTraitSet( props: TraitSetProps, emit: any ): TraitSetApi {
	const traitSet = computed( () => props.character?.traitSets?.[ props.traitSetID as any ] );
	const s = computed<number>( () => props.traitSetID as number );
	const traitSets = computed( () => props.character?.traitSets ?? [] );
	const character = computed( () => props.character );
	const submode = computed( () => props.submode );
	const editing = computed( () => props.editing );
	const printBlank = computed( () => props.printBlank );
	const printStyle = computed( () => props.printStyle );
	const viewY = computed( () => props.viewY );
	const columnCount = computed( () => {
		const c = Number( getView( props.character )?.columns );
		return ( c >= 2 && c <= 4 ) ? c : 2;
	} );

	const sheetStyle = computed( () => {
		if ( props.submode === 'print' && props.printStyle ) {
			return props.printStyle;
		}
		return resolveSheetStyle( props.character );
	} );

	const isSpotlightStyle = computed( () => sheetStyle.value === 'spotlight' );
	const isSpotlightPrintStyle = computed( () => props.submode === 'print' && isSpotlightStyle.value );

	function getTraitSetLabel( traitSetArg: TraitSet, key: string ) {
		const labels = getView( traitSetArg )?.labels;
		if ( labels && labels[ key ] !== undefined && labels[ key ] !== null && String( labels[ key ] ).length ) {
			return labels[ key ];
		}
		const style = getView( traitSetArg )?.style?.body;
		return cortexFunctions.labelDefaultForStyle( style, key );
	}

	function isSelected( selector: unknown[] ) {
		return cortexFunctions.arraysMatch( props.editing, selector );
	}

	function renderText( text: unknown ) {
		return cortexFunctions.renderText( text );
	}

	function renderNotesText( text: unknown ) {
		if ( !text ) return '';
		return cortexFunctions.renderMarkdown( text );
	}

	function getTraitSetClasses( traitSetArg: TraitSet ) {
		const classes: Record<string, boolean> = { 'trait-set': true };

		const bodyStyle = getView( traitSetArg )?.style?.body || 'default';
		classes[ 'trait-set-style-' + bodyStyle ] = true;

		if ( bodyStyle === 'subtrait-columns' && getView( traitSetArg )?.branchArrows === false ) {
			classes[ 'hide-branch-arrows' ] = true;
		}

		if ( isSpotlightStyle.value ) {
			const rawSpan = getView( traitSetArg )?.span ?? getView( traitSetArg )?.colSpan ?? getView( traitSetArg )?.columnSpan;
			const colSpan = Number( rawSpan ) || 1;
			if ( colSpan >= columnCount.value || rawSpan === 'full' ) {
				classes['span-full'] = true;
				classes['span-' + columnCount.value] = true;
			} else if ( colSpan === 2 ) {
				classes['span-2'] = true;
			} else {
				classes['span-1'] = true;
			}
		}

		const ratingPos = getRatingPosition( traitSetArg );
		if ( ratingPos && ratingPos !== 'inline' ) {
			classes[ 'rating-pos-' + ratingPos ] = true;
		}

		if ( isStatementSet( traitSetArg ) ) {
			classes[ 'trait-set-statement-mode' ] = true;
		}

		if ( hasCounterColumn( traitSetArg ) ) {
			classes[ 'trait-set-has-counter' ] = true;
		}

		if ( getView( traitSetArg )?.features?.description ) {
			classes[ 'trait-set-has-feature-description' ] = true;
		}

		if ( getView( traitSetArg )?.features?.sfx ) {
			classes[ 'trait-set-has-feature-sfx' ] = true;
		}

		if ( getView( traitSetArg )?.features?.subtraits ) {
			classes[ 'trait-set-has-feature-subtraits' ] = true;
		}

		const ctk = getView( traitSetArg );
		if ( ctk?.header === 'top' ) {
			classes[ 'trait-set-header-top' ] = true;
		}
		const align = ctk?.headerAlign;
		classes[ 'trait-set-header-align-' + ( align === 'center' || align === 'right' ? align : 'left' ) ] = true;

		return classes;
	}

	function getRatingPosition( traitSetArg: TraitSet ) {
		const parts = getParts( traitSetArg );
		if ( parts && parts.rating ) {
			const rTop = Number( parts.rating.top ) || 0;
			const nTop = parts.name ? ( Number( parts.name.top ) || 0 ) : 0;
			if ( rTop === 0 && nTop === 0 ) return 'inline';
			if ( rTop === 0 ) return 'above';
			return 'below';
		}
		if ( parts ) return 'none';
		return traitSetArg?.ratingPosition || getView( traitSetArg )?.ratingPosition || 'inline';
	}

	// Trait-part layout (view.parts), or null for legacy flex rows.
	// Unknown part names never reach the grid: validation rejects them.
	function getParts( traitSetArg: TraitSet ) {
		const parts = getView( traitSetArg )?.parts;
		if ( !parts || typeof parts !== 'object' || Array.isArray( parts ) ) return null;
		const known = Object.keys( parts ).filter( ( k ) => ( KNOWN_PARTS as readonly string[] ).includes( k ) );
		if ( !known.length ) return null;
		return parts as Record<string, { left: string; top: number; width: string; height: number }>;
	}

	function partsGridFor( traitSetArg: TraitSet ) {
		const parts = getParts( traitSetArg );
		if ( !parts ) return null;
		return partsGrid( parts );
	}

	// Name and rating share row 0 (inline): the stacked-vs-inline divider rules key off this.
	function isPartsInline( traitSetArg: TraitSet ) {
		const grid = partsGridFor( traitSetArg );
		const name = grid?.cells?.name;
		const rating = grid?.cells?.rating;
		return Boolean( grid && name && rating && name.row === 1 && rating.row === 1 );
	}

	function isStatementSet( traitSetArg: TraitSet ) {
		return Boolean( traitSetArg?.statement ?? getView( traitSetArg )?.statement );
	}

	function hasQuestionedPip( traitSetArg: TraitSet ) {
		return Boolean( traitSetArg?.hasQuestionedPip ?? getView( traitSetArg )?.hasQuestionedPip );
	}

	function isTraitQuestioned( trait: Trait ) {
		return cortexFunctions.isStatementFilled( trait );
	}

	function toggleTraitQuestioned( sArg: any, t: any, traitArg?: Trait ) {
		if ( props.submode === 'print' ) return;
		const trait = traitArg ?? props.character?.traitSets?.[ sArg ]?.traits?.[ t ];
		if ( !trait ) return;
		if ( !cortexFunctions.setStatementFilled( trait, !cortexFunctions.isStatementFilled( trait ) ) ) return;
		updateCharacter( props.character );
	}

	function hasCounterColumn( traitSetArg: TraitSet ) {
		return Boolean( traitSetArg?.hasCounterColumn ?? getView( traitSetArg )?.hasCounterColumn );
	}

	function getCounterLabel( traitSetArg: TraitSet ) {
		return traitSetArg?.counterLabel || getView( traitSetArg )?.counterLabel || 'XP';
	}

	function getTraitCounter( trait: Trait ) {
		return trait?.xp ?? trait?.counter ?? trait?.custom?.xp ?? trait?.custom?.counter ?? getView( trait )?.xp ?? '';
	}

	// Statement boxes read the sentence child only; description is a general
	// fallback for asset-style boxes, not a second statement home.
	function getTraitStatement( trait: Trait, statementOnly = false ) {
		const sentence = cortexFunctions.statementText( trait );
		if ( sentence ) return sentence;
		return statementOnly ? '' : ( trait?.description ?? '' );
	}

	function renderDieValue( value: number ) {
		return cortexFunctions.getDieDisplayValue( value );
	}

	function selectElement( selector: unknown[] ) {
		emit( 'selectElement', selector );
	}

	function updateCharacter( character: Character ) {
		emit( 'updateCharacter', character );
	}

	function addTrait( traitSetID: number ) {
		emit( 'addTrait', traitSetID );
	}

	function removeTrait( traitSetID: number, traitID: number ) {
		emit( 'removeTrait', traitSetID, traitID );
	}

	function removeTraitSet( traitSetID: number ) {
		emit( 'removeTraitSet', traitSetID );
	}

	function getTraitClasses( trait: Trait ) {
		const classes: Record<string, boolean> = { 'trait': true };
		if ( trait?.description?.length ) classes['trait-has-description'] = true;
		if ( cortexFunctions.sfxChildren( trait ).length ) classes['trait-has-sfx'] = true;
		if ( nonSfxSubtraits( trait ).length ) classes['trait-has-subtraits'] = true;
		return classes;
	}

	function getRenderedTraits( traitSetArg: TraitSet, sArg: number ) {
		const existing = traitSetArg?.traits || [];

		if ( props.printBlank ) {
			const targetCount = getTraitSetSlotCount( traitSetArg );
			const list: any[] = [];
			const visible = existing
				.map( ( t, idx: number ) => ({ trait: t, originalIndex: idx }) )
				.filter( ( { trait } ) => isTraitShown( trait ) );
			for ( let i = 0; i < targetCount; i++ ) {
				if ( i < visible.length ) {
					list.push({ trait: visible[i].trait, originalIndex: visible[i].originalIndex, isPlaceholder: false });
				} else {
					list.push({ trait: createBlankSlotTrait( traitSetArg ), originalIndex: null, isPlaceholder: true });
				}
			}
			return list;
		}

		// Slots are not traits: every mode expands trailing blank slots to
		// the slot count (reservedSlots floor). Placeholders are render-time
		// objects — clicking one fills it (openTraitAt); nothing blank is stored.
	// Visibility filters first (hidden traits leave no row), so counts
	// stay stable. Original indices survive the filter for editor routing.
		const mapped = existing.map( ( t, idx: number ) => ({ trait: t, originalIndex: idx, isPlaceholder: false }) );
		const visible = mapped.filter( ( { trait } ) => isTraitShown( trait ) );
		const targetCount = Math.max( getTraitSetSlotCount( traitSetArg ), visible.length );
		const list: any[] = [ ...visible ];
		for ( let i = visible.length; i < targetCount; i++ ) {
			list.push({ trait: createBlankSlotTrait( traitSetArg ), originalIndex: null, isPlaceholder: true });
		}
		return list;
	}

	// Trait visibility (shown | editor-only | hidden): hidden leaves no row
	// anywhere, editor-only renders in Edit only. Editors bypass the
	// filter; only sheet rendering applies it.
	function isTraitShown( trait: Trait ) {
		return !isHiddenIn( trait, props.submode );
	}

	// Open a trait row for editing; a blank placeholder becomes a real
	// (still unnamed) trait first, so pencil rows fill in place.
	function openTraitAt( sArg: any, item: any ) {
		if ( !item ) return;
		if ( item.isPlaceholder ) {
			if ( props.submode === 'play' && !isPlayAddRemovableSet( traitSet.value ) ) {
				return;
			}
			fillPlaceholder( sArg );
			return;
		}
		selectElement([ 'trait', sArg, item.originalIndex ]);
	}

	function fillPlaceholder( sArg: any ) {
		const set = props.character.traitSets[ sArg ];
		if ( !set || !Array.isArray( set.traits ) ) return;
		set.traits.push( createBlankSlotTrait( set ) );
		updateCharacter( props.character );
		selectElement([ 'trait', sArg, set.traits.length - 1 ]);
	}

	function createBlankSlotTrait( traitSetArg: TraitSet ): any {
		const hasSubtraits = Boolean( getView( traitSetArg )?.features?.subtraits );
		return {
			name: '',
			description: '',
			traits: hasSubtraits ? [{ name: '' }] : [],
			tags: [],
			custom: {}
		};
	}

	function isFixedSystemTrait( traitSetArg: TraitSet, trait: Trait ) {
		if ( !trait || !trait.name ) return false;
		const name = trait.name.trim();
		if ( name.endsWith( ':' ) ) return false;
		const tsBody = getView( traitSetArg )?.style?.body;
		const tsName = ( traitSetArg?.name || '' ).toLowerCase();
		if ( tsBody === 'attributes' || tsBody === 'stress' ||
		     cortexFunctions.isFixedNameSet( tsName ) ||
		     ( getView( traitSetArg )?.traitColumns ?? 0 ) > 1 ||
		     Boolean( getView( traitSetArg )?.attachedStress?.enabled ) ) {
			return true;
		}
		const spotlightId = getView( props.character )?.spotlight;
		if ( spotlightId && typeof ( window as any )?.cortexSpotlightTemplates !== 'undefined' ) {
			const tpls = ( window as any ).cortexSpotlightTemplates;
			if ( Array.isArray( tpls ) ) {
				const tpl = tpls.find( ( t: any ) => t.id === spotlightId || t.title === spotlightId || t.spotlight === spotlightId );
				if ( tpl?.sets ) {
					for ( const sKey of Object.keys( tpl.sets ) ) {
						const setDef = tpl.sets[ sKey ];
						if ( setDef?.traits && Object.prototype.hasOwnProperty.call( setDef.traits, name ) ) return true;
					}
				}
			}
		}
		return false;
	}

	function renderDieValueForPrint( size: number, isActive = false ) {
		const isFilled = props.printBlank ? false : Boolean( isActive );
		return cortexFunctions.renderDieconSVG( size, isFilled, '', getView( props.character )?.diceConfig );
	}

	function getTraitSetRatings( traitSetArg: TraitSet ) {
		return cortexFunctions.getTraitSetRatings( traitSetArg );
	}

	function getSubtraitRatings( traitSetArg: TraitSet ) {
		return cortexFunctions.getSubtraitRatings( traitSetArg );
	}

	function getTraitDice( trait: Trait ) {
		return cortexFunctions.getTraitDice( trait );
	}

	// Positional subtrait access: paired slots keep complication at 0
	// and bonus at 1. Index is the truth; names are labels. The SFX
	// container is a child trait, not a subtrait, so positional access
	// reads past it.
	function nonSfxSubtraits( trait: Trait ) {
		const subs = ( trait as any )?.traits;
		return ( Array.isArray( subs ) ? subs : [] )
			.filter( ( st: any ) => !cortexFunctions.isSfxContainer( st ) && !cortexFunctions.isStatementContainer( st ) );
	}

	function getSubtraitAt( trait: Trait, index: number ) {
		return nonSfxSubtraits( trait )[ index ] || null;
	}

	function getSubtraitSlotRatings( traitSetArg: TraitSet, slot: number ) {
		return cortexFunctions.getSubtraitSlotRatings( traitSetArg, slot );
	}

	// A pool set (e.g. Growth Pool) is a plain multi-die pool, not apart-rolling:
	// clicking a trait adds its whole pool to the roller. Apart-rolling
	// derives from hitches (0 rolls apart), never from names.
	function isPoolSet( traitSetArg: TraitSet ) {
		return nodePool( traitSetArg ) === true;
	}

	function isDieSpent( trait: Trait, index: number ) {
		const spent = getView( trait )?.spentDice;
		return Array.isArray( spent ) && spent.includes( index );
	}

	function toggleDieSpentInPlay( sArg: any, t: any, index: number ) {
		const trait = props.character.traitSets[sArg].traits[t];
		const view = ensureView( trait );
		if ( !Array.isArray( view.spentDice ) ) {
			view.spentDice = [];
		}
		const spentList = view.spentDice;
		const idx = spentList.indexOf( index );
		if ( idx !== -1 ) {
			spentList.splice( idx, 1 );
		} else {
			spentList.push( index );
		}
		updateCharacter( props.character );
	}

	// Pool staging (one recursive shape): a trait stages its whole array
	// of available dice when it carries pool itself or inherits it from
	// its set. Challenge/boss pools are not flags — both are Dice ratings
	// with pool and spendable on the set, differing only in size.
	function nodePool( node: unknown ): boolean | undefined {
		const n = ( node && typeof node === 'object' ? node : undefined ) as { pool?: unknown } | undefined;
		if ( n && typeof n.pool === 'boolean' ) return n.pool;
		return undefined;
	}

	function stagesWholePool( trait: Trait, traitSetArg: TraitSet ) {
		return ( nodePool( trait ) ?? nodePool( traitSetArg ) ) === true;
	}

	// Stage entries carry hitches (resolved with inheritance) and keepsExtra
	// so the roller never re-resolves trait data from a source name.
	function stageTraitDice( trait: Trait, traitSetArg: TraitSet ) {
		const dice = availableDice( trait );
		if ( !dice.length ) return [];
		const hitches = resolveHitches( trait, [ traitSetArg ] );
		const keep = keepsExtraDice( trait );
		return dice.map( ( size: number ) => ({
			size: size,
			qty: 1,
			source: trait.name,
			hitches: hitches,
			keepsExtra: keep
		} ) );
	}

	function handleDieClick( trait: Trait, dieSize: number, dIdx: number, traitSetArg: TraitSet, sArg: any, t: any ) {
		if ( props.submode === 'play' ) {
			if ( isDieSpent( trait, dIdx ) ) {
				toggleDieSpentInPlay( sArg, t, dIdx );
				return;
			}
			if ( stagesWholePool( trait, traitSetArg ) ) {
				// Pools add whole: every available die on the trait enters
				// the roller, and the roller sheds dice individually.
				const staged = stageTraitDice( trait, traitSetArg );
				if ( !staged.length ) return;
				emit( 'addDieToRoller', staged );
				return;
			}
			emit( 'addDieToRoller', {
				size: dieSize,
				qty: 1,
				source: trait.name,
				hitches: resolveHitches( trait, [ traitSetArg ] )
			} );
		} else {
			selectElement([ 'trait', sArg, t ]);
		}
	}

	function handleSingleDieClick( trait: Trait, value: number | null | undefined, traitSetArg: TraitSet, sArg: any, t: any ) {
		if ( props.submode === 'play' ) {
			const first = ratingDice( getRating( trait ) )[0];
			const targetVal = value || first;
			if ( !first && value ) {
				setRatingDie( trait as unknown as Record<string, any>, value );
				updateCharacter( props.character );
			}
			if ( targetVal ) {
				if ( stagesWholePool( trait, traitSetArg ) ) {
					const staged = stageTraitDice( trait, traitSetArg );
					if ( !staged.length ) return;
					emit( 'addDieToRoller', staged );
					return;
				}
				emit( 'addDieToRoller', {
					size: targetVal,
					qty: 1,
					source: trait.name,
					hitches: resolveHitches( trait, [ traitSetArg ] ),
					ppDelta: 0
				} );
			}
		} else {
			selectElement([ 'trait', sArg, t ]);
		}
	}

	function traitHasHinder( trait: Trait, traitSetArg: TraitSet ): boolean {
		if ( !trait || !isTraitRated( trait ) ) return false;
		if ( cortexFunctions.hasHinder( trait ) ) return true;
		if ( getView( traitSetArg )?.style?.body === 'distinctions' && getView( traitSetArg )?.sharedHinder ) return true;
		return false;
	}

	function handleHinderDieClick( trait: Trait, traitSetArg: TraitSet, sArg: any, t: any ) {
		if ( props.submode === 'play' ) {
			emit( 'addDieToRoller', {
				size: 4,
				qty: 1,
				source: trait.name ? `${trait.name} (Hinder)` : 'Hinder',
				hitches: resolveHitches( trait, [ traitSetArg ] ),
				ppDelta: 1,
				ppCommitted: false
			} );
			if ( props.character ) {
				const curPP = Number( props.character.plotPoints ) || 0;
				cortexFunctions.setPlotPoints( props.character, curPP + 1 );
				updateCharacter( props.character );
			}
		}
	}

	function stageStressDie( trait: Trait, size: number, label: string, traitSetArg: TraitSet ) {
		if ( props.submode === 'play' && size > 0 ) {
			emit( 'addDieToRoller', {
				size: size,
				qty: 1,
				source: label || 'Stress',
				hitches: resolveHitches( trait, [ traitSetArg ] ),
				ppDelta: 0
			} );
		}
	}

	function handleStressClick( sArg: any, t: any, value: number ) {
		if ( props.submode === 'play' ) {
			const trait = props.character.traitSets[sArg].traits[t];
			const cur = ratingDice( getRating( trait ) )[0];
			if ( cur === value && !trait.isOut ) {
				setRatingDie( trait as unknown as Record<string, any>, null );
			} else {
				setRatingDie( trait as unknown as Record<string, any>, value );
				trait.isOut = false;
			}
			updateCharacter( props.character );
		} else {
			selectElement([ 'trait', sArg, t ]);
		}
	}

	function handleStressOutClick( sArg: any, t: any ) {
		if ( props.submode === 'play' ) {
			const trait = props.character.traitSets[sArg].traits[t];
			trait.isOut = !trait.isOut;
			if ( trait.isOut ) {
				setRatingDie( trait as unknown as Record<string, any>, rangeTop( trait ) + 2 );
				const r = ( trait as any ).rating;
				if ( r && typeof r === 'object' && ( r.type === 'Die' || r.type === 'Dice' ) ) r.out = true;
			} else {
				setRatingDie( trait as unknown as Record<string, any>, null );
			}
			updateCharacter( props.character );
		} else {
			selectElement([ 'trait', sArg, t ]);
		}
	}

	// Generic Out indicator: any stepped track (stress, complications, or any
	// hack's renamed equivalent) may offer an Out badge. Default off — most
	// sets aren't complications. Legacy stressConfig.includeOut still wins
	// when set, so existing templates keep their behavior.
	function shouldShowOut( traitSetArg: TraitSet ) {
		const view = getView( traitSetArg );
		if ( view && typeof view.outIndicator === 'boolean' ) return view.outIndicator;
		const cfg = view?.stressConfig;
		if ( cfg && typeof cfg.includeOut === 'boolean' ) return cfg.includeOut;
		return false;
	}

	function isStressOut( trait: Trait, traitSetArg?: TraitSet ) {
		return isOutDie( trait, traitSetArg ? [ traitSetArg ] : undefined );
	}

	function getSharedHinderLines( traitSetArg: TraitSet ) {
		const text = getSharedHinderText( traitSetArg );
		return text.split( '\n' ).map( ( l: string ) => l.trim() ).filter( Boolean );
	}

	function renderHinderLine( line: string ) {
		const clean = line.replace( /^[•\-\*]\s*/, '' );
		return renderText( clean );
	}

	function getDistinctionSfxText( trait: Trait ) {
		const entries = cortexFunctions.sfxChildren( trait );
		if ( !entries.length ) return '';
		const nonHinder = entries.filter( ( sfx: any ) => String( sfx.name || '' ).toLowerCase() !== 'hinder' );
		if ( !nonHinder.length ) return '';
		const first = nonHinder[0];
		return ( first.name && first.description ) ? `${first.name}: ${first.description}`
			: first.description || first.name || '';
	}

	function getDisplayTraitSfx( traitSetArg: TraitSet, trait: Trait ) {
		const entries = cortexFunctions.sfxChildren( trait );
		if ( !entries.length ) return [];
		const isSharedHinder = Boolean( getView( traitSetArg )?.sharedHinder );
		let list = entries;
		if ( isSharedHinder ) {
			list = list.filter( ( sfx: any ) => String( sfx.name || '' ).toLowerCase() !== 'hinder' );
		}
		return list.map( ( sfx: any ) => {
			if ( String( sfx.name || '' ).toLowerCase() === 'hinder' ) {
				const hasOwn = typeof sfx.description === 'string' && sfx.description.length > 0;
				return {
					name: 'Hinder',
					isHinder: true,
					description: hasOwn ? sfx.description : getHinderSentence( traitSetArg, trait )
				};
			}
			return sfx;
		} );
	}

	// Chrome words with label hooks (view.labels.*); static defaults live
	// in the central label registry, so every on-sheet word is settable
	// in data. Only the hinder sentence keeps a constructed default (it
	// interpolates the live trait), overridable wholesale via
	// labels.hinderSentence.
	function getHinderSentence( traitSetArg: TraitSet, trait: Trait ) {
		const labels = getView( traitSetArg )?.labels;
		if ( labels && typeof labels.hinderSentence === 'string' && labels.hinderSentence.length ) return labels.hinderSentence;
		return 'Gain a PP when you switch out this ' + ( traitSetArg.noun && traitSetArg.noun.length ? traitSetArg.noun.toLowerCase() : 'trait' ) + '’s d' + ( ratingDice( getRating( trait ) )[0] || 8 ) + ' for a d4.';
	}

	function hasAttachedStress( traitSetArg: TraitSet ) {
		return cortexFunctions.hasAttachedStress( traitSetArg );
	}

	function getAttachedStressLabel( traitSetArg: TraitSet ) {
		return cortexFunctions.getAttachedStressLabel( traitSetArg );
	}

	function getAttachedStressScale( traitSetArg: TraitSet ) {
		return cortexFunctions.getAttachedStressScale( traitSetArg );
	}

	function getAttachedStressValue( trait: Trait, traitSetArg?: TraitSet ) {
		const companion = traitSetArg ? getStressCompanion( traitSetArg, trait ) : undefined;
		if ( companion ) return getTraitDice( companion )[0] || 0;
		return 0;
	}

	// The stress companion is an ordinary subtrait named for the set's
	// stress label (default "Stress"). It renders in the stress cells, not
	// in the subtrait list; absent means no stress (sparse).
	function getStressCompanion( traitSetArg: TraitSet, trait: Trait ) {
		const subs = ( trait as any )?.traits;
		if ( !Array.isArray( subs ) ) return undefined;
		const name = getAttachedStressLabel( traitSetArg ).toLowerCase();
		return subs.find( ( st: any ) => st && typeof st === 'object' && typeof st.name === 'string' && st.name.toLowerCase() === name );
	}

	function isStressCompanion( traitSetArg: TraitSet, subName: unknown ) {
		return hasAttachedStress( traitSetArg ) && typeof subName === 'string' && subName.toLowerCase() === getAttachedStressLabel( traitSetArg ).toLowerCase();
	}

	function visibleSubtraits( traitSetArg: TraitSet, trait: Trait ) {
		const subs = nonSfxSubtraits( trait );
		if ( !subs.length ) return [];
		const list = hasAttachedStress( traitSetArg )
			? subs.filter( ( st: any ) => !isStressCompanion( traitSetArg, st?.name ) )
			: subs;
		return list.filter( ( st: any ) => isTraitShown( st ) );
	}

	function shouldShowAttachedStressOut( traitSetArg: TraitSet ) {
		return Boolean( getView( traitSetArg )?.attachedStress?.includeOut );
	}

	function isAttachedStressOut( trait: Trait, traitSetArg?: TraitSet ) {
		const companion = traitSetArg ? getStressCompanion( traitSetArg, trait ) : undefined;
		if ( !companion ) return false;
		return isOutDie( companion, traitSetArg ? [ traitSetArg ] : undefined );
	}

	function handleAttachedStressClick( sArg: any, t: any, size: number ) {
		if ( props.submode === 'print' ) return;
		const set = props.character.traitSets[sArg];
		const trait = set?.traits?.[t];
		if ( !trait ) return;
		const name = getAttachedStressLabel( set );
		const target = name.toLowerCase();
		if ( !Array.isArray( trait.traits ) ) trait.traits = [];
		const idx = trait.traits.findIndex( ( st: any ) => st && typeof st === 'object' && typeof st.name === 'string' && st.name.toLowerCase() === target );
		const cur = idx !== -1 ? ( getTraitDice( trait.traits[idx] )[0] || 0 ) : 0;
		if ( cur === size ) {
			if ( idx !== -1 ) trait.traits.splice( idx, 1 );
		} else if ( idx !== -1 ) {
			cortexFunctions.setTraitDice( trait.traits[idx], [ size ] );
		} else {
			( trait.traits as any[] ).push( { name, rating: { type: 'Die', value: [ size ], range: getAttachedStressScale( set ).slice() } } );
		}
		updateCharacter( props.character );
	}

	function handleAttachedStressOutClick( sArg: any, t: any ) {
		if ( props.submode === 'print' ) return;
		const set = props.character.traitSets[sArg];
		const trait = set?.traits?.[t];
		if ( !trait ) return;
		const name = getAttachedStressLabel( set );
		const target = name.toLowerCase();
		if ( !Array.isArray( trait.traits ) ) trait.traits = [];
		let companion: any = trait.traits.find( ( st: any ) => st && typeof st === 'object' && typeof st.name === 'string' && st.name.toLowerCase() === target );
		if ( !companion ) {
			const scale = getAttachedStressScale( set );
			companion = { name, rating: { type: 'Die', value: [ scale[0] || 4 ], range: scale.slice(), out: true } };
			( trait.traits as any[] ).push( companion );
		} else {
			companion.isOut = !companion.isOut;
			const r = companion.rating;
			if ( r && typeof r === 'object' && ( r.type === 'Die' || r.type === 'Dice' ) ) {
				r.out = Boolean( companion.isOut );
			}
			if ( !companion.isOut && !( ( getTraitDice( companion )[0] || 0 ) > 0 ) ) {
				trait.traits.splice( trait.traits.indexOf( companion ), 1 );
			}
		}
		updateCharacter( props.character );
	}

	function getPipConfig( traitSetArg: TraitSet ) {
		const ctk = getView( traitSetArg );
		const p = ctk?.pips;
		const perRow = ( p as any )?.perRow ?? 5;
		const connected = ( p as any )?.connected !== false;
		return {
			perRow: Math.max( 1, perRow ),
			connected,
			labels: ( p as any )?.labels === true
		};
	}

	function getPipRowCount( traitSetArg: TraitSet ) {
		const cfg = getPipConfig( traitSetArg );
		return Math.ceil( getPipTrack( traitSetArg ).count / cfg.perRow );
	}

	function getPipRowCols( traitSetArg: TraitSet, rowIdx: number ) {
		const cfg = getPipConfig( traitSetArg );
		const remaining = getPipTrack( traitSetArg ).count - ( rowIdx - 1 ) * cfg.perRow;
		return Math.min( cfg.perRow, Math.max( 0, remaining ) );
	}

	function getPipIndex( traitSetArg: TraitSet, rowIdx: number, colIdx: number ) {
		const cfg = getPipConfig( traitSetArg );
		return ( rowIdx - 1 ) * cfg.perRow + ( colIdx - 1 );
	}

	// Pure-track state lives on the set node's own Pip rating: value is
	// the list of bubbles, range[0] the bubble count.
	function getPipTrack( traitSetArg: TraitSet ): { count: number; filled: number } {
		const rating = getRating( traitSetArg );
		let count = 25;
		let filled = 0;
		if ( rating && rating.type === 'Pip' ) {
			if ( Array.isArray( rating.range ) && typeof rating.range[0] === 'number' && rating.range[0] > 0 ) {
				count = Math.floor( rating.range[0] );
			}
			if ( Array.isArray( rating.value ) ) {
				filled = rating.value.filter( ( v ) => v === true ).length;
			}
		}
		return { count, filled };
	}

	function setPipTrack( traitSetIndex: number, count: number, filled: number ) {
		const ts = traitSets.value[ traitSetIndex ];
		if ( !ts ) return;
		const bubbles: boolean[] = [];
		for ( let i = 0; i < count; i++ ) bubbles.push( i < filled );
		( ts as unknown as Record<string, any> ).rating = { type: 'Pip', value: bubbles, range: [ count ] };
		updateCharacter( props.character );
	}

	function isPipFilled( traitSetArg: TraitSet, pipIdx: number ) {
		if ( props.printBlank ) return false;
		return pipIdx < getPipTrack( traitSetArg ).filled;
	}

	function handlePipClick( traitSetIndex: number, pipIdx: number ) {
		if ( props.submode === 'print' ) return;
		const ts = traitSets.value[ traitSetIndex ];
		if ( !ts ) return;
		const track = getPipTrack( ts );
		const curFilled = track.filled;
		const next = ( curFilled === pipIdx + 1 ) ? pipIdx : pipIdx + 1;
		setPipTrack( traitSetIndex, track.count, next );
	}

	// Pip-with-label rows (the unified pips style): row i pairs the count
	// grid with the i-th trait, if any. Named traits render beside their
	// bubble; blank rows render bare. Filled prefers the trait's own Pip
	// rating, then its legacy checked flag, then the filled count.
	function isPipLabels( traitSetArg: TraitSet ) {
		return getPipConfig( traitSetArg ).labels === true;
	}

	function pipRowFilled( t: any, index: number, filledCount: number ): boolean {
		if ( t && typeof t === 'object' ) {
			const rating = getRating( t );
			if ( rating && rating.type === 'Pip' && Array.isArray( rating.value ) && rating.value.length ) {
				return rating.value[0] === true;
			}
		}
		return !props.printBlank && index < filledCount;
	}

	function pipRows( traitSetArg: TraitSet ) {
		const cfg = getPipConfig( traitSetArg );
		const track = getPipTrack( traitSetArg );
		const traits = Array.isArray( traitSetArg?.traits ) ? traitSetArg.traits : [];
		const n = Math.max( track.count, traits.length );
		const rows: { index: number; trait: any; filled: boolean; name: string }[] = [];
		for ( let i = 0; i < n; i++ ) {
			const t = traits[ i ];
			const named = t && typeof t === 'object' && typeof t.name === 'string' && t.name.length ? t : null;
			rows.push({ index: i, trait: named, filled: pipRowFilled( t, i, track.filled ), name: named ? ( named as any ).name : '' });
		}
		return rows;
	}

	function blankPipTrait(): any {
		return { name: '', description: '', traits: [], tags: [], custom: {} };
	}

	function ensurePipTrait( traitSetIndex: number, itemIndex: number ) {
		const ts = traitSets.value[ traitSetIndex ];
		if ( !ts ) return null;
		if ( !ts.traits ) ts.traits = [];
		while ( ts.traits.length <= itemIndex ) {
			ts.traits.push( blankPipTrait() );
		}
		return ts.traits[ itemIndex ];
	}

	function togglePipRow( traitSetIndex: number, itemIndex: number ) {
		if ( props.submode === 'print' ) return;
		const ts = traitSets.value[ traitSetIndex ];
		if ( !ts ) return;
		if ( !isPipLabels( ts ) ) return handlePipClick( traitSetIndex, itemIndex );
		const trait = ensurePipTrait( traitSetIndex, itemIndex );
		if ( !trait ) return;
		const next = !pipRowFilled( trait, itemIndex, 0 );
		( trait as unknown as Record<string, any> ).rating = { type: 'Pip', value: [ next ], range: [ 1 ] };
		updateCharacter( props.character );
	}

	function openPipRow( traitSetIndex: number, itemIndex: number ) {
		if ( props.submode === 'print' ) return;
		ensurePipTrait( traitSetIndex, itemIndex );
		updateCharacter( props.character );
		selectElement([ 'trait', traitSetIndex, itemIndex ]);
	}

	// Inline rename for labeled rows: the name is a write-in line on the
	// row itself. Position (and the Pip rating) is untouched.
	function setPipRowName( traitSetIndex: number, itemIndex: number, name: string ) {
		if ( props.submode === 'print' ) return;
		const trait = ensurePipTrait( traitSetIndex, itemIndex );
		if ( !trait ) return;
		const clean = typeof name === 'string' ? name.trim() : '';
		if ( ( trait as any ).name === clean ) return;
		( trait as any ).name = clean;
		updateCharacter( props.character );
	}

	function addPipRow( traitSetIndex: number ) {
		const ts = traitSets.value[ traitSetIndex ];
		if ( !ts ) return;
		if ( !ts.traits ) ts.traits = [];
		ts.traits.push( blankPipTrait() );
		const track = getPipTrack( ts );
		if ( track.count < ts.traits.length ) {
			setPipTrack( traitSetIndex, ts.traits.length, track.filled );
			const view = ensureView( ts );
			view.reservedSlots = ts.traits.length;
		}
		updateCharacter( props.character );
	}

	function getImageSetContainerStyle( traitSetArg: TraitSet ) {
		const h = getView( traitSetArg )?.imageConfig?.height;
		if ( h && h !== 'auto' ) {
			return { height: h };
		}
		return { minHeight: '140px', height: 'auto' };
	}

	function getImageSetGraphicStyle( traitSetArg: TraitSet ) {
		const url = cortexFunctions.safeImageUrl( getView( traitSetArg )?.imageConfig?.url );
		if ( !url ) return {};
		return {
			backgroundImage: `url("${url}")`,
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat'
		};
	}

	function getBranchGroups( traitSetArg: TraitSet, items: any[] ) {
		const list = items || [];
		const skills = list.filter( ( it: any ) => getBranchRole( it.trait ) !== 'specialty' );
		const flats = list.filter( ( it: any ) => !it.isPlaceholder && getBranchRole( it.trait ) === 'specialty' );
		const skillIdx = new Set( skills.filter( ( sk: any ) => sk.originalIndex !== null && sk.originalIndex !== undefined ).map( ( sk: any ) => sk.originalIndex ) );
		const groups: any[] = skills.map( ( skillItem: any ) => {
			const sIdx = skillItem.originalIndex;
			const nested = ( skillItem.trait?.traits || [] )
				.filter( ( sub: any ) => !cortexFunctions.isStatementContainer( sub ) )
				.map( ( sub: any, u: number ) => ({ kind: 'sub', sub, u }) );
			const linked = flats
				.filter( ( f: any ) => getView( f.trait )?.linkTo === sIdx )
				.map( ( f: any ) => ({ kind: 'flat', item: f }) );
			return { skillItem, subs: [ ...nested, ...linked ] };
		} );
		const orphans = flats.filter( ( f: any ) => {
			const lt = getView( f.trait )?.linkTo;
			return !( typeof lt === 'number' && skillIdx.has( lt ) );
		} ).map( ( f: any ) => ({ kind: 'flat', item: f }) );
		if ( orphans.length ) {
			groups.push({ skillItem: null, subs: orphans });
		}
		const split = groups.some( ( g: any ) => ( g.subs || [] ).some( ( e: any ) => {
			const t = e.kind === 'sub' ? e.sub : ( e.item ? e.item.trait : null );
			return getBranchSide( t ) === 'left';
		} ) );
		groups.forEach( ( g: any ) => { g.split = split; } );
		return groups;
	}

	function hasBranchSplit( traitSetArg: TraitSet, items: any[] ) {
		if ( getView( traitSetArg )?.style?.body !== 'subtrait-columns' ) return false;
		return getBranchGroups( traitSetArg, items ).some( ( g: any ) => g.split );
	}

	// Flank layout (e.g. Solarpunk skills): a subtrait-columns set with
	// traitColumns 2 spreads skills across outer columns with specialties
	// down the middle. Explicit left-side specialties (split) win over it.
	function hasBranchFlank( traitSetArg: TraitSet, items: any[] ) {
		if ( getView( traitSetArg )?.style?.body !== 'subtrait-columns' ) return false;
		if ( Number( getView( traitSetArg )?.traitColumns ) !== 2 ) return false;
		return !hasBranchSplit( traitSetArg, items );
	}

	function getFlankColumns( traitSetArg: TraitSet, items: any[] ) {
		const groups = getBranchGroups( traitSetArg, items );
		const skills = groups.filter( ( g: any ) => g.skillItem );
		const mid = Math.ceil( skills.length / 2 );
		const center: any[] = [];
		groups.forEach( ( g: any ) => {
			const sIdx = g.skillItem ? g.skillItem.originalIndex : null;
			( g.subs || [] ).forEach( ( e: any ) => {
				center.push({ ...e, skillIndex: sIdx, skillItem: g.skillItem });
			} );
		} );
		return { left: skills.slice( 0, mid ), right: skills.slice( mid ), center: center };
	}

	function getBranchRole( trait: Trait ) {
		return getView( trait )?.branchRole === 'specialty' ? 'specialty' : 'skill';
	}

	// The set-level die is the set node's own Rating; traits without a
	// rating of their own fall through to it.
	function getSetRatingDie( traitSetArg: TraitSet ) {
		const dice = ratingDice( getRating( traitSetArg ) );
		if ( dice.length ) return dice[0];
		return null;
	}

	function getBranchSide( trait: Trait ) {
		return getView( trait )?.branchSide === 'left' ? 'left' : 'right';
	}

	function branchSubs( subs: any[], side: string ) {
		return ( subs || [] ).filter( ( e: any ) => {
			const t = e.kind === 'sub' ? e.sub : ( e.item ? e.item.trait : null );
			const sd = getBranchSide( t );
			return side === 'left' ? sd === 'left' : sd !== 'left';
		} );
	}

	function handleBranchFlatClick( sArg: any, t: any, trait: Trait ) {
		if ( props.submode === 'play' ) {
			const first = ratingDice( getRating( trait ) )[0];
			if ( first ) {
				const traitSetArg = props.character.traitSets[sArg];
				handleSingleDieClick( trait, first, traitSetArg, sArg, t );
			}
		} else {
			selectElement([ 'trait', sArg, t ]);
		}
	}

	function getSubtraitNameOr( trait: Trait, traitSetArg: TraitSet, index: number ) {
		const sub = nonSfxSubtraits( trait )[ index ];
		if ( sub && sub.name && String( sub.name ).trim().length ) {
			return sub.name;
		}
		return getTraitSetLabel( traitSetArg, 'slot' + index );
	}

	function getTalentEffect( trait: Trait ) {
		const entries = cortexFunctions.sfxChildren( trait );
		const sfx = entries.find( ( e: any ) => String( e.name || '' ).toLowerCase() !== 'hinder' );
		if ( !sfx ) return '';
		return sfx.description || sfx.name || '';
	}

	function getExplicitPoolCount( trait: Trait ) {
		const raw = getView( trait )?.poolCount;
		if ( raw === undefined || raw === null || raw === '' ) return null;
		const n = Number( raw );
		if ( !Number.isFinite( n ) || n < 0 ) return null;
		return Math.floor( n );
	}

	function getResourceDiceCount( trait: Trait ) {
		const dice = cortexFunctions.getTraitDice( trait );
		if ( dice.length > 1 ) return dice.length;
		const poolCount = getExplicitPoolCount( trait );
		if ( poolCount !== null ) return poolCount;
		return dice.length;
	}

	function getResourcePoolDice( trait: Trait, traitSetArg?: TraitSet ) {
		if ( !trait ) return [];
		const dice = cortexFunctions.getTraitDice( trait );
		if ( dice.length > 1 ) return dice;
		const poolCount = getExplicitPoolCount( trait );
		const val = dice[0] || ( traitSetArg ? getTraitSetRatings( traitSetArg )[0] : 6 ) || 6;
		if ( poolCount !== null ) {
			const res: number[] = [];
			for ( let i = 0; i < poolCount; i++ ) res.push( val );
			return res;
		}
		return dice.length > 0 ? dice : [ val ];
	}

	// Print tally pips: the fixed 1–5 track saturates, so extend the track
	// to the live count for bigger pools (growth pools grow past 5).
	function getPrintTallyPips( trait: Trait ) {
		const count = getResourceDiceCount( trait );
		const total = Math.max( 5, count );
		const list: number[] = [];
		for ( let n = 1; n <= total; n++ ) list.push( n );
		return list;
	}

	function setResourceDiceCount( sArg: any, t: any, count: number ) {
		const traitSetArg = props.character.traitSets[sArg];
		const trait = traitSetArg?.traits?.[t];
		if ( !trait ) return;
		const clamped = Math.max( 1, Math.min( 5, Number( count ) || 1 ) );
		const ratings = getTraitSetRatings( traitSetArg );
		const size = ratingDice( getRating( trait ) )[0] || ( ratings[0] || 6 );
		const dice = [];
		for ( let i = 0; i < clamped; i++ ) dice.push( size );
		cortexFunctions.setTraitDice( trait, dice );
		ensureView( trait ).poolCount = clamped;
		updateCharacter( props.character );
	}

	function addTraitSetDiceToRoller( traitSetArg: TraitSet ) {
		if ( !traitSetArg ) return;
		const diceToAdd: any[] = [];
		const poolName = traitSetArg.name || props.character.name || 'Challenge Pool';
		for ( const tr of ( traitSetArg.traits || [] ) ) {
			const dice = availableDice( tr );
			const hitches = resolveHitches( tr, [ traitSetArg ] );
			const keep = keepsExtraDice( tr );
			for ( const d of dice ) {
				diceToAdd.push({ size: d, qty: 1, source: tr.name || poolName, hitches: hitches, keepsExtra: keep });
			}
		}
		if ( diceToAdd.length > 0 ) {
			emit( 'addDieToRoller', diceToAdd );
		}
	}

	function getSharedHinderText( traitSetArg: TraitSet ) {
		const hinderText = getView( traitSetArg )?.sharedHinderText?.trim();
		if ( hinderText ) {
			return hinderText;
		}
		const noun = ( traitSetArg?.noun && traitSetArg.noun.length ) ? traitSetArg.noun.toLowerCase() : 'distinction';
		return `Gain a PP when you trade out your ${noun}'s d8 rating for a d4.`;
	}

	// Template-facing rating reads (one shape; no value/dice in templates).
	function firstDie( trait: Trait ) {
		return ratingDice( getRating( trait ) )[0] || 0;
	}

	function isDieActive( trait: Trait, size: number ) {
		return firstDie( trait ) === size;
	}

	function isTraitRated( trait: Trait ) {
		return isRated( trait );
	}

	// Spendable drives the spend control (trait wins, set inherits).
	function nodeSpendable( node: unknown ): boolean | undefined {
		const n = ( node && typeof node === 'object' ? node : undefined ) as { spendable?: unknown } | undefined;
		if ( n && typeof n.spendable === 'boolean' ) return n.spendable;
		return undefined;
	}

	function isSpendable( trait: Trait, traitSetArg?: TraitSet ) {
		const t = nodeSpendable( trait );
		if ( t !== undefined ) return t;
		if ( traitSetArg ) {
			const s = nodeSpendable( traitSetArg );
			if ( s !== undefined ) return s;
		}
		return false;
	}

	function getTraitSetSlotCount( traitSetArg: TraitSet ) {
		const custom = getView( traitSetArg );
		const bodyStyle = custom?.style?.body;
		if ( bodyStyle === 'notes' || bodyStyle === 'image' ) return 0;

		const configured = custom?.reservedSlots ?? custom?.blankSlots;
		if ( configured !== undefined && configured !== null && String( configured ) !== '' ) {
			return Math.max( Number( configured ) || 0, ( traitSetArg.traits || [] ).length );
		}

		return ( traitSetArg.traits || [] ).length;
	}

	const api: TraitSetApi = {
		traitSet, s, traitSets, character, submode, editing, printBlank, printStyle, viewY,
		columnCount, sheetStyle, isSpotlightPrintStyle, getView, ensureView,
		getTraitSetLabel, isSpotlightStyle, isSelected, renderText, renderNotesText, getTraitSetClasses,
		getRatingPosition, isStatementSet, hasQuestionedPip, isTraitQuestioned, toggleTraitQuestioned,
		getParts, partsGridFor, partCellStyle, partsGridStyle, isPartsInline,
		hasCounterColumn, getCounterLabel, getTraitCounter, getTraitStatement, renderDieValue,
		selectElement, updateCharacter, addTrait, removeTrait, removeTraitSet, getTraitClasses,
		getRenderedTraits, createBlankSlotTrait, isFixedSystemTrait, renderDieValueForPrint, openTraitAt, fillPlaceholder, isTraitShown,
		getTraitSetRatings, getSubtraitRatings, getTraitDice,
		isDieSpent, toggleDieSpentInPlay, handleDieClick, handleSingleDieClick, handleStressClick,
		handleStressOutClick, shouldShowOut, isStressOut, getSharedHinderLines, renderHinderLine,
		getDistinctionSfxText, getDisplayTraitSfx, getHinderSentence,
		hasAttachedStress, getAttachedStressLabel, getAttachedStressScale, getAttachedStressValue,
		getStressCompanion, isStressCompanion, visibleSubtraits,
		shouldShowAttachedStressOut, isAttachedStressOut, handleAttachedStressClick, handleAttachedStressOutClick,
		getPipConfig, getPipRowCount, getPipRowCols, getPipIndex, isPipFilled, handlePipClick,
		getPipTrack, setPipTrack, pipRowFilled,
		isPipLabels, pipRows, ensurePipTrait, togglePipRow, openPipRow, addPipRow, setPipRowName,
		getImageSetContainerStyle, getImageSetGraphicStyle,
		getBranchGroups, hasBranchSplit, hasBranchFlank, getFlankColumns, getBranchRole, getSetRatingDie, getBranchSide, branchSubs, handleBranchFlatClick,
		getSubtraitAt, getSubtraitSlotRatings, getSubtraitNameOr,
		getTalentEffect, getResourceDiceCount, setResourceDiceCount, getResourcePoolDice, getPrintTallyPips, isPoolSet, addTraitSetDiceToRoller,
		nodePool, stagesWholePool, stageTraitDice, nodeSpendable, isSpendable,
		firstDie, isDieActive, isTraitRated,
		getRating, ratingDice, isRated, availableDice, resolveHitches, rollSeparate, keepsExtraDice, isHiddenIn,
		getSharedHinderText, getTraitSetSlotCount,
		isPlayAddRemovableSet, traitHasHinder, handleHinderDieClick, stageStressDie
	};

	provide( TRAIT_SET_KEY, api );
	return api;
}

export function injectTraitSet(): TraitSetApi {
	const api = inject( TRAIT_SET_KEY );
	if ( !api ) throw new Error( 'use-trait-set: injectTraitSet() called outside a TraitSetBlock' );
	return api;
}
