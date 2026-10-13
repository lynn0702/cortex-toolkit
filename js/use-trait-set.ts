import { computed, provide, inject, type InjectionKey } from 'vue';
import { cortexFunctions } from './functions.ts';
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
	designerPrintPreview?: boolean;
	printStyle?: string | null;
}

export const TRAIT_SET_KEY: InjectionKey<TraitSetApi> = Symbol( 'traitSetApi' );

export function useTraitSet( props: TraitSetProps, emit: any ): TraitSetApi {
	const traitSet = computed( () => props.character?.traitSets?.[ props.traitSetID as any ] );
	const s = computed<number>( () => props.traitSetID as number );
	const traitSets = computed( () => props.character?.traitSets ?? [] );
	const character = computed( () => props.character );
	const submode = computed( () => props.submode );
	const editing = computed( () => props.editing );
	const printBlank = computed( () => props.printBlank );
	const designerPrintPreview = computed( () => props.designerPrintPreview );
	const printStyle = computed( () => props.printStyle );
	const viewY = computed( () => props.viewY );
	const columnCount = computed( () => ( Number( props.character?.custom?.cortexToolkit?.columns ) === 3 ? 3 : 2 ) );

	const sheetStyle = computed( () => {
		if ( props.submode === 'print' && props.printStyle ) {
			return props.printStyle;
		}
		const explicit = props.character?.custom?.cortexToolkit?.sheetStyle;
		if ( explicit ) return explicit;
		if ( props.character?.custom?.cortexToolkit?.style?.hasAttributes === false ) {
			return 'spotlight';
		}
		return 'classic';
	} );

	const isSpotlightPrintStyle = computed( () => ( props.submode === 'print' || props.designerPrintPreview ) && isSpotlightStyle() );

	function getTraitSetLabel( traitSetArg: TraitSet, key: string ) {
		const labels = traitSetArg?.custom?.cortexToolkit?.labels;
		if ( labels && labels[ key ] !== undefined && labels[ key ] !== null && String( labels[ key ] ).length ) {
			return labels[ key ];
		}
		const style = traitSetArg?.custom?.cortexToolkit?.style?.body;
		return cortexFunctions.labelDefaultForStyle( style, key );
	}

	function isSpotlightStyle() {
		return sheetStyle.value === 'spotlight';
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

		const bodyStyle = traitSetArg?.custom?.cortexToolkit?.style?.body || 'default';
		classes[ 'trait-set-style-' + bodyStyle ] = true;

		if ( bodyStyle === 'skills-specialties' && traitSetArg?.custom?.cortexToolkit?.branchArrows === false ) {
			classes[ 'hide-branch-arrows' ] = true;
		}

		if ( isSpotlightStyle() ) {
			const colSpan = Number( traitSetArg?.custom?.cortexToolkit?.colSpan ?? traitSetArg?.custom?.cortexToolkit?.columnSpan ) || 1;
			if ( colSpan >= columnCount.value || traitSetArg?.custom?.cortexToolkit?.colSpan === 'full' || traitSetArg?.custom?.cortexToolkit?.columnSpan === 'full' ) {
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

		if ( traitSetArg?.custom?.cortexToolkit?.features?.description ) {
			classes[ 'trait-set-has-feature-description' ] = true;
		}

		if ( traitSetArg?.custom?.cortexToolkit?.features?.sfx ) {
			classes[ 'trait-set-has-feature-sfx' ] = true;
		}

		if ( traitSetArg?.custom?.cortexToolkit?.features?.subtraits ) {
			classes[ 'trait-set-has-feature-subtraits' ] = true;
		}

		return classes;
	}

	function getRatingPosition( traitSetArg: TraitSet ) {
		return traitSetArg?.ratingPosition || traitSetArg?.custom?.cortexToolkit?.ratingPosition || 'inline';
	}

	function isStatementSet( traitSetArg: TraitSet ) {
		return Boolean( traitSetArg?.statement ?? traitSetArg?.custom?.cortexToolkit?.statement );
	}

	function hasQuestionedPip( traitSetArg: TraitSet ) {
		return Boolean( traitSetArg?.hasQuestionedPip ?? traitSetArg?.custom?.cortexToolkit?.hasQuestionedPip );
	}

	function isTraitQuestioned( trait: Trait ) {
		return Boolean( trait?.questioned ?? trait?.custom?.questioned ?? trait?.custom?.cortexToolkit?.questioned );
	}

	function toggleTraitQuestioned( sArg: any, t: any ) {
		if ( props.submode === 'print' ) return;
		const trait = props.character?.traitSets?.[ sArg ]?.traits?.[ t ];
		if ( !trait ) return;
		const newVal = !isTraitQuestioned( trait );
		trait.questioned = newVal;
		if ( !trait.custom ) trait.custom = {};
		trait.custom.questioned = newVal;
		updateCharacter( props.character );
	}

	function hasCounterColumn( traitSetArg: TraitSet ) {
		return Boolean( traitSetArg?.hasCounterColumn ?? traitSetArg?.custom?.cortexToolkit?.hasCounterColumn );
	}

	function getCounterLabel( traitSetArg: TraitSet ) {
		return traitSetArg?.counterLabel || traitSetArg?.custom?.cortexToolkit?.counterLabel || 'XP';
	}

	function getTraitCounter( trait: Trait ) {
		return trait?.xp ?? trait?.counter ?? trait?.custom?.xp ?? trait?.custom?.counter ?? trait?.custom?.cortexToolkit?.xp ?? '';
	}

	function getTraitStatement( trait: Trait ) {
		return trait?.statement ?? trait?.description ?? '';
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
		if ( trait?.sfx?.length ) classes['trait-has-sfx'] = true;
		if ( trait?.traits?.length ) classes['trait-has-subtraits'] = true;
		return classes;
	}

	function getRenderedTraits( traitSetArg: TraitSet, sArg: number ) {
		const existing = traitSetArg?.traits || [];
		const isPrintMode = props.submode === 'print' || props.designerPrintPreview;

		if ( !isPrintMode ) {
			return existing.map( ( t, idx: number ) => ({ trait: t, originalIndex: idx, isPlaceholder: false }) );
		}

		if ( props.printBlank ) {
			const targetCount = getTraitSetSlotCount( traitSetArg );
			const list: any[] = [];
			for ( let i = 0; i < targetCount; i++ ) {
				if ( i < existing.length ) {
					list.push({ trait: existing[i], originalIndex: i, isPlaceholder: false });
				} else {
					list.push({ trait: createBlankSlotTrait( traitSetArg ), originalIndex: null, isPlaceholder: true });
				}
			}
			return list;
		}

		const reserved = Number( traitSetArg?.custom?.cortexToolkit?.reservedSlots );
		const targetCount = ( !isNaN( reserved ) && reserved > 0 ) ? Math.max( reserved, existing.length ) : existing.length;
		const list: any[] = existing.map( ( t, idx: number ) => ({ trait: t, originalIndex: idx, isPlaceholder: false }) );
		for ( let i = existing.length; i < targetCount; i++ ) {
			list.push({ trait: createBlankSlotTrait( traitSetArg ), originalIndex: null, isPlaceholder: true });
		}
		return list;
	}

	function createBlankSlotTrait( traitSetArg: TraitSet ) {
		const hasSubtraits = Boolean( traitSetArg?.custom?.cortexToolkit?.features?.subtraits );
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
	}

	function isFixedSystemTrait( traitSetArg: TraitSet, trait: Trait ) {
		if ( !trait || !trait.name ) return false;
		const name = trait.name.trim();
		if ( name.endsWith( ':' ) ) return false;
		const tsBody = traitSetArg?.custom?.cortexToolkit?.style?.body;
		const tsName = ( traitSetArg?.name || '' ).toLowerCase();
		if ( tsBody === 'attributes' || tsBody === 'stress' ||
		     tsName.includes( 'attribute' ) || tsName.includes( 'value' ) ||
		     tsName.includes( 'drive' ) || tsName.includes( 'role' ) ||
		     tsName.includes( 'affiliation' ) || tsName.includes( 'branch' ) ||
		     ( traitSetArg?.custom?.cortexToolkit?.traitColumns ?? 0 ) > 1 ||
		     Boolean( traitSetArg?.custom?.cortexToolkit?.attachedStress?.enabled ) ) {
			return true;
		}
		return false;
	}

	function renderDieValueForPrint( size: number, isActive = false ) {
		if ( isSpotlightPrintStyle.value ) {
			const isFilled = props.printBlank ? false : Boolean( isActive );
			return cortexFunctions.renderDieconSVG( size, isFilled, '', props.character?.custom?.cortexToolkit?.diceConfig );
		}
		return renderDieValue( size );
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

	function isMultiDieTrait( traitSetArg: TraitSet, trait: Trait ) {
		if ( !traitSetArg?.custom?.cortexToolkit?.style?.body ) return false;
		const style = traitSetArg.custom.cortexToolkit.style.body;
		if ( style === 'stress' || style === 'list' || style === 'notes' ) {
			return false;
		}
		return Boolean( traitSetArg?.custom?.cortexToolkit?.multiDie ) || ( style === 'resources' ) || ( getTraitDice( trait ).length > 1 );
	}

	function isResourceTrait( traitSetArg: TraitSet, trait: Trait ) {
		if ( trait?.custom?.cortexToolkit?.isResource || trait?.isResource ) return true;
		if ( !traitSetArg ) return false;
		const body = traitSetArg?.custom?.cortexToolkit?.style?.body;
		if ( body === 'resources' || body === 'resources-count' ) return true;
		const name = ( traitSetArg?.name || '' ).trim().toLowerCase();
		const nounSingular = ( traitSetArg?.nounSingular || '' ).trim().toLowerCase();
		const nounPlural = ( traitSetArg?.nounPlural || '' ).trim().toLowerCase();
		if ( name.includes( 'resource' ) || nounSingular === 'resource' || nounPlural === 'resources' ) {
			return true;
		}
		return false;
	}

	function isDieSpent( trait: Trait, index: number ) {
		const spent = trait?.custom?.cortexToolkit?.spentDice;
		return Array.isArray( spent ) && spent.includes( index );
	}

	function toggleDieSpentInPlay( sArg: any, t: any, index: number ) {
		const trait = props.character.traitSets[sArg].traits[t];
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
		updateCharacter( props.character );
	}

	function handleDieClick( trait: Trait, dieSize: number, dIdx: number, traitSetArg: TraitSet, sArg: any, t: any ) {
		if ( props.submode === 'play' ) {
			if ( isDieSpent( trait, dIdx ) ) {
				toggleDieSpentInPlay( sArg, t, dIdx );
				return;
			}
			const isChallenge = Boolean( traitSetArg?.custom?.cortexToolkit?.isChallengePool || traitSetArg?.custom?.cortexToolkit?.challengePool );
			if ( isChallenge ) {
				addTraitSetDiceToRoller( traitSetArg );
				return;
			}
			const isRes = isResourceTrait( traitSetArg, trait );
			emit( 'addDieToRoller', {
				size: dieSize,
				qty: 1,
				source: trait.name,
				isResource: isRes,
				resourceType: isRes ? ( trait.name || 'Resource' ) : undefined
			} );
		} else {
			selectElement([ 'trait', sArg, t ]);
		}
	}

	function handleSingleDieClick( trait: Trait, value: number | null | undefined, traitSetArg: TraitSet, sArg: any, t: any ) {
		if ( props.submode === 'play' ) {
			if ( value ) {
				const isChallenge = Boolean( traitSetArg?.custom?.cortexToolkit?.isChallengePool || traitSetArg?.custom?.cortexToolkit?.challengePool );
				if ( isChallenge ) {
					addTraitSetDiceToRoller( traitSetArg );
					return;
				}
				const isRes = isResourceTrait( traitSetArg, trait );
				emit( 'addDieToRoller', {
					size: value,
					qty: 1,
					source: trait.name,
					isResource: isRes,
					resourceType: isRes ? ( trait.name || 'Resource' ) : undefined
				} );
			}
		} else {
			selectElement([ 'trait', sArg, t ]);
		}
	}

	function handleStressClick( sArg: any, t: any, value: number ) {
		if ( props.submode === 'play' ) {
			const trait = props.character.traitSets[sArg].traits[t];
			if ( trait.value === value && !trait.isOut ) {
				trait.value = null;
			} else {
				trait.value = value;
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
				trait.value = 14;
			} else {
				trait.value = null;
			}
			updateCharacter( props.character );
		} else {
			selectElement([ 'trait', sArg, t ]);
		}
	}

	function shouldShowStressOut( traitSetArg: TraitSet ) {
		const cfg = traitSetArg?.custom?.cortexToolkit?.stressConfig;
		if ( cfg && typeof cfg.includeOut === 'boolean' ) return cfg.includeOut;
		return true;
	}

	function isStressOut( trait: Trait ) {
		return Number( trait.value ) > 12 || trait.isOut === true;
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
		if ( !trait?.sfx || !trait.sfx.length ) return '';
		const nonHinder = trait.sfx.filter( ( sfx: any ) => sfx !== 'hinder' && ( typeof sfx !== 'object' || sfx.name?.toLowerCase() !== 'hinder' ) );
		if ( !nonHinder.length ) return '';
		const first = nonHinder[0];
		if ( typeof first === 'string' ) return first;
		if ( first.name && first.description ) {
			return `${first.name}: ${first.description}`;
		}
		return first.description || first.name || '';
	}

	function getDisplayTraitSfx( traitSetArg: TraitSet, trait: Trait ) {
		if ( props.printBlank ) {
			return [];
		}
		if ( !trait?.sfx || !Array.isArray( trait.sfx ) || !trait.sfx.length ) return [];
		const isSharedHinder = Boolean( traitSetArg?.custom?.cortexToolkit?.sharedHinder );
		let list = trait.sfx;
		if ( isSharedHinder ) {
			list = list.filter( ( sfx: any ) => sfx !== 'hinder' && ( typeof sfx !== 'object' || sfx.name?.toLowerCase() !== 'hinder' ) );
		}
		return list.map( ( sfx: any ) => {
			if ( sfx === 'hinder' || ( typeof sfx === 'object' && sfx.name?.toLowerCase() === 'hinder' ) ) {
				return {
					name: 'Hinder',
					isHinder: true,
					description: 'Gain a PP when you switch out this ' + ( traitSetArg.nounSingular && traitSetArg.nounSingular.length ? traitSetArg.nounSingular.toLowerCase() : 'trait' ) + '’s d' + ( trait.value || 8 ) + ' for a d4.'
				};
			}
			return typeof sfx === 'object' ? sfx : { name: sfx, description: '' };
		} );
	}

	function hasAttachedStress( traitSetArg: TraitSet ) {
		return Boolean( traitSetArg?.custom?.cortexToolkit?.attachedStress?.enabled );
	}

	function getAttachedStressLabel( traitSetArg: TraitSet ) {
		return traitSetArg?.custom?.cortexToolkit?.attachedStress?.label || 'Stress';
	}

	function getAttachedStressScale( traitSetArg: TraitSet ) {
		return traitSetArg?.custom?.cortexToolkit?.attachedStress?.scale || [ 4, 6, 8, 10, 12 ];
	}

	function getAttachedStressValue( trait: Trait ) {
		return trait?.custom?.stress ?? trait?.stress ?? 0;
	}

	function shouldShowAttachedStressOut( traitSetArg: TraitSet ) {
		return Boolean( traitSetArg?.custom?.cortexToolkit?.attachedStress?.includeOut );
	}

	function isAttachedStressOut( trait: Trait ) {
		return Boolean( trait?.custom?.isStressOut || ( getAttachedStressValue( trait ) > 12 ) );
	}

	function handleAttachedStressClick( sArg: any, t: any, size: number ) {
		if ( props.submode === 'print' ) return;
		const trait = props.character.traitSets[sArg]?.traits?.[t];
		if ( !trait ) return;
		if ( !trait.custom ) trait.custom = {};
		const cur = trait.custom.stress ?? trait.stress ?? 0;
		trait.custom.stress = ( cur === size ) ? 0 : size;
		updateCharacter( props.character );
	}

	function handleAttachedStressOutClick( sArg: any, t: any ) {
		if ( props.submode === 'print' ) return;
		const trait = props.character.traitSets[sArg]?.traits?.[t];
		if ( !trait ) return;
		if ( !trait.custom ) trait.custom = {};
		trait.custom.isStressOut = !trait.custom.isStressOut;
		updateCharacter( props.character );
	}

	function getPipConfig( traitSetArg: TraitSet ) {
		const p = traitSetArg?.custom?.cortexToolkit?.pips;
		return {
			count: Math.max( 1, p?.count || 25 ),
			perRow: Math.max( 1, p?.perRow || 5 ),
			connected: p?.connected !== false,
			filled: Math.max( 0, p?.filled || 0 )
		};
	}

	function getPipRowCount( traitSetArg: TraitSet ) {
		const cfg = getPipConfig( traitSetArg );
		return Math.ceil( cfg.count / cfg.perRow );
	}

	function getPipRowCols( traitSetArg: TraitSet, rowIdx: number ) {
		const cfg = getPipConfig( traitSetArg );
		const remaining = cfg.count - ( rowIdx - 1 ) * cfg.perRow;
		return Math.min( cfg.perRow, Math.max( 0, remaining ) );
	}

	function getPipIndex( traitSetArg: TraitSet, rowIdx: number, colIdx: number ) {
		const cfg = getPipConfig( traitSetArg );
		return ( rowIdx - 1 ) * cfg.perRow + ( colIdx - 1 );
	}

	function isPipFilled( traitSetArg: TraitSet, pipIdx: number ) {
		if ( props.printBlank ) return false;
		const cfg = getPipConfig( traitSetArg );
		return pipIdx < cfg.filled;
	}

	function handlePipClick( traitSetIndex: number, pipIdx: number ) {
		if ( props.submode === 'print' ) return;
		const ts = traitSets.value[ traitSetIndex ];
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
		updateCharacter( props.character );
	}

	function getSessionRecordCount( traitSetArg: TraitSet ) {
		return getSessionRecordConfig( traitSetArg ).count;
	}

	function isSessionHorizontal( traitSetArg: TraitSet ) {
		return traitSetArg?.custom?.cortexToolkit?.sessionRecord?.orientation === 'horizontal';
	}

	function sessionViewBox( traitSetArg: TraitSet ) {
		const n = getSessionRecordCount( traitSetArg );
		if ( isSessionHorizontal( traitSetArg ) ) {
			return '0 0 ' + ( 55 + ( n - 1 ) * 28 + 60 ) + ' 140';
		}
		return '0 0 260 ' + ( 55 + ( n - 1 ) * 28 + 25 );
	}

	function sessionSpine( traitSetArg: TraitSet ) {
		const n = getSessionRecordCount( traitSetArg );
		if ( isSessionHorizontal( traitSetArg ) ) {
			return { x1: 55, y1: 118, x2: 55 + ( n - 1 ) * 28, y2: 118 };
		}
		return { x1: 24, y1: 55, x2: 24, y2: 55 + ( n - 1 ) * 28 };
	}

	function sessionBubble( traitSetArg: TraitSet, index: number ) {
		if ( isSessionHorizontal( traitSetArg ) ) {
			return { cx: 55 + index * 28, cy: 118 };
		}
		return { cx: 24, cy: 55 + index * 28 };
	}

	function sessionLine( traitSetArg: TraitSet, index: number ) {
		if ( isSessionHorizontal( traitSetArg ) ) {
			const x = 55 + index * 28;
			return { x1: x - 3, y1: 111.5, x2: x + 34, y2: 16 };
		}
		const y = 55 + index * 28;
		return { x1: 30.5, y1: y, x2: 252, y2: y - 56 };
	}

	function sessionHit( traitSetArg: TraitSet, index: number ) {
		if ( isSessionHorizontal( traitSetArg ) ) {
			return { x: ( 55 + index * 28 ) - 14, y: 0, width: 28, height: 140 };
		}
		const y = 55 + index * 28;
		return { x: 20, y: y - 14, width: 232, height: 28 };
	}

	function sessionLabelTransform( traitSetArg: TraitSet, index: number ) {
		if ( isSessionHorizontal( traitSetArg ) ) {
			const x = 55 + index * 28;
			return 'translate(' + ( x + 4 ) + ', 106) rotate(-66.5)';
		}
		const y = 55 + index * 28;
		return 'translate(36, ' + ( y - 4 ) + ') rotate(-14.2)';
	}

	function getSessionRecordItems( traitSetArg: TraitSet ) {
		const count = getSessionRecordCount( traitSetArg );
		const traits = traitSetArg?.traits || [];
		const items: any[] = [];
		for ( let i = 0; i < count; i++ ) {
			const t = traits[ i ];
			const isFilled = !props.printBlank && ( Boolean( t?.custom?.checked ) || Boolean( t?.value ) );
			const name = t?.name || '';
			items.push({ index: i, trait: t, isFilled: isFilled, name: name });
		}
		return items;
	}

	function handleSessionBubbleClick( traitSetIndex: number, itemIndex: number ) {
		if ( props.submode === 'print' ) return;
		const trait = ensureSessionRecordTrait( traitSetIndex, itemIndex );
		if ( !trait ) return;
		if ( !trait.custom ) trait.custom = {};
		const currentlyChecked = Boolean( trait.custom.checked || trait.value );
		trait.custom.checked = !currentlyChecked;
		trait.value = !currentlyChecked ? 1 : 0;
		updateCharacter( props.character );
	}

	function handleSessionLineClick( traitSetIndex: number, itemIndex: number ) {
		if ( props.submode === 'print' ) return;
		ensureSessionRecordTrait( traitSetIndex, itemIndex );
		updateCharacter( props.character );
		selectElement([ 'trait', traitSetIndex, itemIndex ]);
	}

	function ensureSessionRecordTrait( traitSetIndex: number, itemIndex: number ) {
		const ts = props.character.traitSets?.[ traitSetIndex ];
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
	}

	function addSessionRecordRow( traitSetIndex: number ) {
		const ts = props.character.traitSets?.[ traitSetIndex ];
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
		if ( ( Number( ctk.sessionRecord.count ) || 0 ) < needed ) {
			ctk.sessionRecord.count = needed;
		}
		if ( ( Number( ctk.reservedSlots ) || 0 ) < needed ) {
			ctk.reservedSlots = needed;
		}
		updateCharacter( props.character );
	}

	function getImageSetContainerStyle( traitSetArg: TraitSet ) {
		const h = traitSetArg?.custom?.cortexToolkit?.imageConfig?.height;
		if ( h && h !== 'auto' ) {
			return { height: h };
		}
		return { minHeight: '140px', height: 'auto' };
	}

	function getImageSetGraphicStyle( traitSetArg: TraitSet ) {
		const url = cortexFunctions.safeImageUrl( traitSetArg?.custom?.cortexToolkit?.imageConfig?.url );
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
			const nested = ( skillItem.trait?.traits || [] ).map( ( sub: any, u: number ) => ({ kind: 'sub', sub, u }) );
			const linked = flats
				.filter( ( f: any ) => f.trait?.custom?.cortexToolkit?.linkTo === sIdx )
				.map( ( f: any ) => ({ kind: 'flat', item: f }) );
			return { skillItem, subs: [ ...nested, ...linked ] };
		} );
		const orphans = flats.filter( ( f: any ) => {
			const lt = f.trait?.custom?.cortexToolkit?.linkTo;
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
		if ( traitSetArg?.custom?.cortexToolkit?.style?.body !== 'skills-specialties' ) return false;
		return getBranchGroups( traitSetArg, items ).some( ( g: any ) => g.split );
	}

	function getBranchRole( trait: Trait ) {
		return trait?.custom?.cortexToolkit?.branchRole === 'specialty' ? 'specialty' : 'skill';
	}

	function getSetDie( traitSetArg: TraitSet ) {
		const d = Number( traitSetArg?.custom?.cortexToolkit?.setDie );
		return ( d > 0 ) ? d : null;
	}

	function getBranchSide( trait: Trait ) {
		return trait?.custom?.cortexToolkit?.branchSide === 'left' ? 'left' : 'right';
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
			if ( trait?.value ) {
				const traitSetArg = props.character.traitSets[sArg];
				handleSingleDieClick( trait, trait.value, traitSetArg, sArg, t );
			}
		} else {
			selectElement([ 'trait', sArg, t ]);
		}
	}

	function getStandingComplication( trait: Trait ) {
		return trait?.traits?.[0] || null;
	}

	function getStandingBonus( trait: Trait ) {
		return trait?.traits?.[1] || null;
	}

	function getStandingBonusRatings( traitSetArg: TraitSet ) {
		const ratings = getSubtraitRatings( traitSetArg );
		if ( Array.isArray( ratings ) && ratings.length === 5 && ratings[0] === 4 ) {
			return ratings.filter( ( size: number ) => size >= 6 );
		}
		return ratings;
	}

	function getSubtraitNameOr( trait: Trait, traitSetArg: TraitSet, index: number ) {
		const sub = trait?.traits?.[ index ];
		if ( sub && sub.name && String( sub.name ).trim().length ) {
			return sub.name;
		}
		const style = traitSetArg?.custom?.cortexToolkit?.style?.body;
		return cortexFunctions.labelDefaultForStyle( style, 'slot' + index );
	}

	function getTalentEffect( trait: Trait ) {
		const sfx = ( trait?.sfx || [] ).find( ( e: any ) => e !== 'hinder' );
		if ( !sfx ) return '';
		if ( typeof sfx === 'string' ) return sfx;
		return sfx.description || sfx.name || '';
	}

	function getResourceDiceCount( trait: Trait ) {
		const dice = cortexFunctions.getTraitDice( trait );
		return dice.length;
	}

	function setResourceDiceCount( sArg: any, t: any, count: number ) {
		const traitSetArg = props.character.traitSets[sArg];
		const trait = traitSetArg?.traits?.[t];
		if ( !trait ) return;
		const clamped = Math.max( 1, Math.min( 5, Number( count ) || 1 ) );
		const ratings = getTraitSetRatings( traitSetArg );
		const size = ( trait.value && trait.value > 0 ) ? trait.value : ( ratings[0] || 6 );
		const dice = [];
		for ( let i = 0; i < clamped; i++ ) dice.push( size );
		cortexFunctions.setTraitDice( trait, dice );
		updateCharacter( props.character );
	}

	function addTraitSetDiceToRoller( traitSetArg: TraitSet ) {
		if ( !traitSetArg ) return;
		const diceToAdd: any[] = [];
		const poolName = traitSetArg.name || props.character.name || 'Challenge Pool';
		for ( const tr of ( traitSetArg.traits || [] ) ) {
			if ( Array.isArray( tr.dice ) && tr.dice.length > 0 ) {
				for ( const d of tr.dice ) {
					if ( d > 0 ) {
						diceToAdd.push({ size: d, qty: 1, source: tr.name || poolName });
					}
				}
			} else if ( tr.value && tr.value > 0 ) {
				diceToAdd.push({ size: tr.value, qty: 1, source: tr.name || poolName });
			}
		}
		if ( diceToAdd.length > 0 ) {
			emit( 'addDieToRoller', diceToAdd );
		}
	}

	function getSessionRecordConfig( traitSetArg: TraitSet ) {
		const srec = traitSetArg?.custom?.cortexToolkit?.sessionRecord;
		const reserved = traitSetArg?.custom?.cortexToolkit?.reservedSlots;
		const traitsLen = traitSetArg?.traits ? traitSetArg.traits.length : 0;
		const count = Math.max( 1, srec?.count || reserved || traitsLen || 20 );
		return { count: count };
	}

	function getSharedHinderText( traitSetArg: TraitSet ) {
		if ( traitSetArg?.custom?.cortexToolkit?.sharedHinderText?.trim() ) {
			return traitSetArg.custom.cortexToolkit.sharedHinderText.trim();
		}
		const noun = ( traitSetArg?.nounSingular && traitSetArg.nounSingular.length ) ? traitSetArg.nounSingular.toLowerCase() : 'distinction';
		return `Gain a PP when you trade out your ${noun}'s d8 rating for a d4.`;
	}

	function getTraitSetSlotCount( traitSetArg: TraitSet ) {
		const custom = traitSetArg?.custom?.cortexToolkit;
		const bodyStyle = custom?.style?.body;
		if ( bodyStyle === 'notes' || bodyStyle === 'image' || bodyStyle === 'session-record' || bodyStyle === 'angled-lines' ) return 0;

		const configured = custom?.reservedSlots ?? custom?.blankSlots;
		if ( configured !== undefined && configured !== null && String( configured ) !== '' ) {
			return Math.max( Number( configured ) || 0, ( traitSetArg.traits || [] ).length );
		}

		return ( traitSetArg.traits || [] ).length;
	}

	const api: TraitSetApi = {
		traitSet, s, traitSets, character, submode, editing, printBlank, designerPrintPreview, printStyle, viewY,
		columnCount, sheetStyle, isSpotlightPrintStyle,
		getTraitSetLabel, isSpotlightStyle, isSelected, renderText, renderNotesText, getTraitSetClasses,
		getRatingPosition, isStatementSet, hasQuestionedPip, isTraitQuestioned, toggleTraitQuestioned,
		hasCounterColumn, getCounterLabel, getTraitCounter, getTraitStatement, renderDieValue,
		selectElement, updateCharacter, addTrait, removeTrait, removeTraitSet, getTraitClasses,
		getRenderedTraits, createBlankSlotTrait, isFixedSystemTrait, renderDieValueForPrint,
		getTraitSetRatings, getSubtraitRatings, getTraitDice, isMultiDieTrait, isResourceTrait,
		isDieSpent, toggleDieSpentInPlay, handleDieClick, handleSingleDieClick, handleStressClick,
		handleStressOutClick, shouldShowStressOut, isStressOut, getSharedHinderLines, renderHinderLine,
		getDistinctionSfxText, getDisplayTraitSfx,
		hasAttachedStress, getAttachedStressLabel, getAttachedStressScale, getAttachedStressValue,
		shouldShowAttachedStressOut, isAttachedStressOut, handleAttachedStressClick, handleAttachedStressOutClick,
		getPipConfig, getPipRowCount, getPipRowCols, getPipIndex, isPipFilled, handlePipClick,
		getSessionRecordCount, isSessionHorizontal, sessionViewBox, sessionSpine, sessionBubble, sessionLine,
		sessionHit, sessionLabelTransform, getSessionRecordItems, handleSessionBubbleClick, handleSessionLineClick,
		ensureSessionRecordTrait, addSessionRecordRow,
		getImageSetContainerStyle, getImageSetGraphicStyle,
		getBranchGroups, hasBranchSplit, getBranchRole, getSetDie, getBranchSide, branchSubs, handleBranchFlatClick,
		getStandingComplication, getStandingBonus, getStandingBonusRatings, getSubtraitNameOr,
		getTalentEffect, getResourceDiceCount, setResourceDiceCount, addTraitSetDiceToRoller,
		getSessionRecordConfig, getSharedHinderText, getTraitSetSlotCount
	};

	provide( TRAIT_SET_KEY, api );
	return api;
}

export function injectTraitSet(): TraitSetApi {
	const api = inject( TRAIT_SET_KEY );
	if ( !api ) throw new Error( 'use-trait-set: injectTraitSet() called outside a TraitSetBlock' );
	return api;
}
