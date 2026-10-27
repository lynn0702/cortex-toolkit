<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { cortexFunctions } from './functions.ts';

interface RollResult {
id: string;
size: number;
value: number;
source: string;
isScale: boolean;
hitches: number;
isHitch: boolean;
manualRole: 'total' | 'effect' | 'none';
}

interface SeparateGroup {
name: string;
dice: RollResult[];
keptDie: RollResult;
bonus: number;
}

const props = withDefaults( defineProps<{
	open: boolean;
	pool: any;
	history?: any[];
	position?: string;
}>(), {
	history: () => [],
	position: 'left',
} );

const emit = defineEmits<{
	( e: 'close' ): void;
	( e: 'addDie', die: any ): void;
	( e: 'removeDie', index: number ): void;
	( e: 'clearPool' ): void;
	( e: 'togglePosition' ): void;
	( e: 'settlePP', delta: number ): void;
}>();

const savedCombine = localStorage.getItem( 'cortexCombineResources' );

const keep = ref( 2 );
const combineResources = ref( savedCombine !== null ? savedCombine === 'true' : false );
const isRolled = ref( false );
const lastRollResults = ref<RollResult[]>( [] );
const separateGroupsResults = ref<SeparateGroup[]>( [] );
const cortexPalOutput = ref( '' );
const bestTotalInfo = ref<any>( null );
const bestEffectInfo = ref<any>( null );
const copiedNotice = ref( false );
const activeTab = ref( 'roller' ); // 'roller' | 'log'

const diceSizes = computed( () => [ 4, 6, 8, 10, 12 ] );

const stagedDice = computed<any[]>( () => ( props.pool ? props.pool.items : [] ) );

// Resolved hitches per staged item (sparse data, base default 1).
function itemHitches( d: any ) {
	const h = d && typeof d.hitches === 'number' && Number.isFinite( d.hitches ) && d.hitches >= 0 ? Math.floor( d.hitches ) : 1;
	return h;
}

// The exemption: hitches 0 rolls in its own pool, never hitches.
function isExempt( d: any ) {
	return itemHitches( d ) === 0;
}

function itemKeepsExtra( d: any ) {
	if ( d && typeof d.keepsExtra === 'number' && Number.isFinite( d.keepsExtra ) && d.keepsExtra > 0 ) return Math.floor( d.keepsExtra );
	if ( d && ( d.isScale || ( d.source && d.source.toLowerCase() === 'scale' ) ) ) return 1;
	return 0;
}

const keepsExtraTotal = computed( () => stagedDice.value.reduce( ( sum: number, d: any ) => sum + itemKeepsExtra( d ), 0 ) );

const actionKeepsExtra = computed( () => stagedDice.value
	.filter( ( d: any ) => !isExempt( d ) )
	.reduce( ( sum: number, d: any ) => sum + itemKeepsExtra( d ), 0 ) );

// Hitches flood: a pool hitches at its highest member's hitches,
// because pooled dice are anonymous. Exempt dice roll apart, so they
// never raise the action threshold.
const actionThreshold = computed( () => {
	let top = 1;
	for ( const d of stagedDice.value ) {
		if ( isExempt( d ) ) continue;
		top = Math.max( top, itemHitches( d ) );
	}
	return top;
} );

const hitchLabel = computed( () => actionThreshold.value > 1 ? ( '1–' + actionThreshold.value ) : '1' );

// Apart-rolling dice (hitches 0) roll in their own pool, grouped by
// source, highest kept as a bonus. No kind gate: hitches is the data.
const separateDice = computed( () => stagedDice.value.filter( ( d: any ) => isExempt( d ) ) );

const hasSeparateDice = computed( () => separateDice.value.length > 0 );

const separateSources = computed( () => {
	const set = new Set<string>();
	for ( const d of separateDice.value ) {
		const src = ( d.source || 'Separate' ).trim().toLowerCase();
		if ( src ) set.add( src );
	}
	return Array.from( set );
} );

const separateKeepBonus = computed( () => separateSources.value.length );

const defaultKeep = computed( () => {
	let k = 2;
	k += keepsExtraTotal.value;
	if ( combineResources.value ) {
		k += separateKeepBonus.value;
	}
	return k;
} );

const actionRollResults = computed( () => lastRollResults.value.filter( r => r.hitches > 0 ) );
const separateRollResults = computed( () => lastRollResults.value.filter( r => r.hitches === 0 ) );
const totalHitches = computed( () => lastRollResults.value.filter( r => r.isHitch ).length );
const isBotch = computed( () => lastRollResults.value.length > 0 && lastRollResults.value.every( r => r.isHitch ) );

const manualTotal = computed( () => lastRollResults.value
	.filter( r => r.manualRole === 'total' )
	.reduce( ( sum, r ) => sum + r.value, 0 ) );

const manualActionTotal = computed( () => lastRollResults.value
	.filter( r => r.hitches > 0 && r.manualRole === 'total' )
	.reduce( ( sum, r ) => sum + r.value, 0 ) );

const manualSeparateBonus = computed( () => lastRollResults.value
	.filter( r => r.hitches === 0 && r.manualRole === 'total' )
	.reduce( ( sum, r ) => sum + r.value, 0 ) );

const manualEffectDie = computed( () => {
	const effects = lastRollResults.value
		.filter( r => r.manualRole === 'effect' )
		.sort( ( a, b ) => b.size - a.size );
	return effects.length > 0 ? 'd' + effects[ 0 ].size : 'd4';
} );

watch( combineResources, ( newVal ) => {
	localStorage.setItem( 'cortexCombineResources', newVal ? 'true' : 'false' );
	keep.value = defaultKeep.value;
	if ( isRolled.value ) {
		evaluateRollDisplay();
	}
} );

watch( defaultKeep, ( newVal, oldVal ) => {
	if ( oldVal === undefined || keep.value === oldVal || newVal > keep.value ) {
		keep.value = newVal;
	}
}, { immediate: true } );

function getDieDisplayValue( value: any ) {
	return cortexFunctions.getDieDisplayValue( value );
}

function cleanTraitLabel( source: any ) {
	if ( !source ) return '';
	const cleaned = source.replace( /\s*\([dD]\d+\)$/, '' ).replace( /\s+[dD]\d+$/, '' ).trim();
	if ( /^[dD]\d+$/.test( cleaned ) ) {
		return '';
	}
	return cleaned;
}

function addAdHoc( size: number ) {
	emit( 'addDie', {
		size: size,
		qty: 1,
		source: ''
	} );
	isRolled.value = false;
}

function addScaleAdHoc( size: number ) {
	emit( 'addDie', {
		size: size,
		qty: 1,
		source: 'Scale',
		isScale: true
	} );
	isRolled.value = false;
}

function addSeparateAdHoc( size: number ) {
	emit( 'addDie', {
		size: size,
		qty: 1,
		source: 'Separate',
		hitches: 0
	} );
	isRolled.value = false;
}

function removeDie( index: number ) {
	emit( 'removeDie', index );
	isRolled.value = false;
}

function clearPool() {
	emit( 'clearPool' );
	isRolled.value = false;
	lastRollResults.value = [];
	separateGroupsResults.value = [];
	cortexPalOutput.value = '';
	bestTotalInfo.value = null;
	bestEffectInfo.value = null;
	keep.value = 2;
}

const DIE_SIZES = [ 4, 6, 8, 10, 12 ];

function stepDownDie( item: any ) {
	const currentIdx = DIE_SIZES.indexOf( item.size );
	if ( currentIdx > 0 ) {
		item.size = DIE_SIZES[ currentIdx - 1 ];
		isRolled.value = false;
	}
}

function stepUpDie( item: any ) {
	const currentIdx = DIE_SIZES.indexOf( item.size );
	if ( currentIdx !== -1 && currentIdx < DIE_SIZES.length - 1 ) {
		item.size = DIE_SIZES[ currentIdx + 1 ];
		isRolled.value = false;
	}
}

function duplicateDie( item: any ) {
	emit( 'addDie', {
		...item,
		id: undefined,
		ppDelta: 0,
		ppCommitted: true
	} );
	isRolled.value = false;
}

function roll() {
	if ( !props.pool || props.pool.is_empty() ) return;

	let ppToSettle = 0;
	for ( const item of props.pool.items ) {
		if ( !item.ppCommitted && item.ppDelta ) {
			ppToSettle += Number( item.ppDelta ) || 0;
		}
		( item as any ).ppCommitted = true;
	}
	if ( ppToSettle > 0 ) {
		emit( 'settlePP', ppToSettle );
	}

	// Thresholds resolve per pool section before rolling: the action
	// section floods to its highest member, apart-rolling dice always
	// resolve 0 and roll apart.
	const actionItems = props.pool.items.filter( ( item: any ) => !isExempt( item ) );
	const actionThreshold = actionItems.reduce( ( top: number, item: any ) => Math.max( top, itemHitches( item ) ), 1 );

	const rollResults: RollResult[] = [];
	// Roll each staged item
	for ( const item of props.pool.items ) {
		const val = Math.floor( Math.random() * item.size ) + 1;
		const h = itemHitches( item );
		const threshold = h === 0 ? 0 : actionThreshold;
		const isHitch = threshold > 0 && ( val <= threshold );
		rollResults.push( {
			id: ( typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ) ? crypto.randomUUID() : Math.random().toString( 36 ).substring( 2, 9 ),
			size: item.size,
			value: val,
			source: item.source || '',
			isScale: Boolean( item.isScale ),
			hitches: h,
			isHitch: isHitch,
			manualRole: 'none'
		} );
	}

	lastRollResults.value = rollResults;
	isRolled.value = true;
	evaluateRollDisplay();
}

function evaluateRollDisplay() {
	if ( !isRolled.value || lastRollResults.value.length === 0 ) return;

	const separateResults = lastRollResults.value.filter( r => r.hitches === 0 );
	const actionResults = lastRollResults.value.filter( r => r.hitches > 0 );
	const hasSeparate = separateResults.length > 0;

	if ( !hasSeparate || combineResources.value ) {
		// COMBINED / NORMAL POOL MODE
		separateGroupsResults.value = [];
		const eligible = lastRollResults.value.filter( r => !r.isHitch );

		if ( eligible.length === 0 ) {
			bestTotalInfo.value = { isBotch: true };
			bestEffectInfo.value = { isBotch: true };
			cortexPalOutput.value = `Normal Pool Roll (Keep ${keep.value}):\nBotch! All dice were hitches.`;
			return;
		}

		// Best Total
		const sortedForTotal = [ ...eligible ].sort( ( a, b ) => b.value - a.value );
		const totalDice = sortedForTotal.slice( 0, keep.value );
		const remainingForEffect = sortedForTotal.slice( keep.value ).sort( ( a, b ) => b.size - a.size );
		const effectDie = remainingForEffect.length > 0 ? 'd' + remainingForEffect[ 0 ].size : 'd4';
		const totalSum = totalDice.reduce( ( sum, d ) => sum + d.value, 0 );
		const totalFormula = totalDice.map( d => d.value ).join( ' + ' );

		bestTotalInfo.value = {
			total: totalSum,
			formula: totalFormula,
			effect: effectDie,
			dice: totalDice
		};

		// Best Effect
		const sortedForEffect = [ ...eligible ].sort( ( a, b ) => {
			if ( a.size !== b.size ) return b.size - a.size;
			return a.value - b.value;
		} );
		const effectBest = sortedForEffect.length > 0 ? 'd' + sortedForEffect[ 0 ].size : 'd4';
		const totalDiceForEffect = sortedForEffect.slice( 1 ).sort( ( a, b ) => b.value - a.value ).slice( 0, keep.value );
		const totalSumForEffect = totalDiceForEffect.reduce( ( sum, d ) => sum + d.value, 0 );
		const formulaForEffect = totalDiceForEffect.map( d => d.value ).join( ' + ' );

		bestEffectInfo.value = {
			total: totalSumForEffect,
			formula: formulaForEffect,
			effect: effectBest
		};

		// Set manual roles
		for ( const r of lastRollResults.value ) {
			if ( r.isHitch ) {
				r.manualRole = 'none';
			} else if ( totalDice.some( c => c.id === r.id ) ) {
				r.manualRole = 'total';
			} else if ( remainingForEffect.length > 0 && remainingForEffect[ 0 ].id === r.id ) {
				r.manualRole = 'effect';
			} else {
				r.manualRole = 'none';
			}
		}

		const resNote = hasSeparate ? ` (+${separateKeepBonus.value} keep for ${separateKeepBonus.value} separate source${separateKeepBonus.value > 1 ? 's' : ''}; separate dice cannot hitch)` : '';
		cortexPalOutput.value = `Normal Pool Roll (Keep ${keep.value})${resNote}:\nDice: ${lastRollResults.value.map( r => 'd' + r.size + ( r.hitches === 0 ? '[sep]' : '' ) + ': ' + r.value + ( r.isHitch ? ' (Hitch)' : '' ) ).join( ', ' )}\nBest Total: ${totalSum} (${totalFormula}) with Effect: ${effectDie}\nBest Effect: ${effectBest} with Total: ${totalSumForEffect} (${formulaForEffect})\nHitches: ${totalHitches.value}`;
	} else {
		// SEPARATE MODE (Standard Cortex Prime)
		const actionKeep = 2 + actionKeepsExtra.value;
		const actionEligible = actionResults.filter( r => !r.isHitch );

		let actionTotal = 0;
		let actionFormula = '0';
		let actionEffect = 'd4';
		let actionTotalDice: RollResult[] = [];
		let actionRemaining: RollResult[] = [];

		if ( actionEligible.length > 0 ) {
			const sortedAction = [ ...actionEligible ].sort( ( a, b ) => b.value - a.value );
			actionTotalDice = sortedAction.slice( 0, actionKeep );
			actionRemaining = sortedAction.slice( actionKeep ).sort( ( a, b ) => b.size - a.size );
			actionEffect = actionRemaining.length > 0 ? 'd' + actionRemaining[ 0 ].size : 'd4';
			actionTotal = actionTotalDice.reduce( ( sum, d ) => sum + d.value, 0 );
			actionFormula = actionTotalDice.map( d => d.value ).join( ' + ' );
		}

		// Group apart-rolling dice by source; in each group the highest
		// die is kept and added to total. All are hitches 0: never hitches.
		const groupMap: Record<string, RollResult[]> = {};
		for ( const r of separateResults ) {
			const name = ( r.source || 'Separate' ).trim() || 'Separate';
			if ( !groupMap[ name ] ) groupMap[ name ] = [];
			groupMap[ name ].push( r );
		}

		const groups: SeparateGroup[] = [];
		let totalSeparateBonus = 0;

		for ( const [ name, dice ] of Object.entries( groupMap ) ) {
			const sortedSep = [ ...dice ].sort( ( a, b ) => b.value - a.value );
			const keptDie = sortedSep[ 0 ];
			totalSeparateBonus += keptDie.value;

			for ( const d of dice ) {
				d.manualRole = ( d.id === keptDie.id ) ? 'total' : 'none';
			}

			groups.push( {
				name: name,
				dice: dice,
				keptDie: keptDie,
				bonus: keptDie.value
			} );
		}

		separateGroupsResults.value = groups;

		// Set action dice roles
		for ( const r of actionResults ) {
			if ( r.isHitch ) {
				r.manualRole = 'none';
			} else if ( actionTotalDice.some( c => c.id === r.id ) ) {
				r.manualRole = 'total';
			} else if ( actionRemaining.length > 0 && actionRemaining[ 0 ].id === r.id ) {
				r.manualRole = 'effect';
			} else {
				r.manualRole = 'none';
			}
		}

		const grandTotal = actionTotal + totalSeparateBonus;
		const formulaParts: string[] = [];
		if ( actionTotal > 0 ) formulaParts.push( `${actionTotal} (Action)` );
		for ( const g of groups ) {
			formulaParts.push( `${g.bonus} (${g.name})` );
		}
		const grandFormula = formulaParts.length > 0 ? formulaParts.join( ' + ' ) : '0';

		let actionEffectBestDie = 'd4';
		let actionEffectTotal = 0;
		let actionEffectFormula = '0';
		if ( actionEligible.length > 0 ) {
			const sortedActionForEffect = [ ...actionEligible ].sort( ( a, b ) => {
				if ( a.size !== b.size ) return b.size - a.size;
				return a.value - b.value;
			} );
			actionEffectBestDie = 'd' + sortedActionForEffect[ 0 ].size;
			const actionEffectTotalDice = sortedActionForEffect.slice( 1 ).sort( ( a, b ) => b.value - a.value ).slice( 0, actionKeep );
			actionEffectTotal = actionEffectTotalDice.reduce( ( sum, d ) => sum + d.value, 0 );
			actionEffectFormula = actionEffectTotalDice.map( d => d.value ).join( ' + ' );
		}

		const grandTotalForEffect = actionEffectTotal + totalSeparateBonus;
		const formulaPartsForEffect: string[] = [];
		if ( actionEffectTotal > 0 ) formulaPartsForEffect.push( `${actionEffectTotal} (Action)` );
		for ( const g of groups ) {
			formulaPartsForEffect.push( `${g.bonus} (${g.name})` );
		}
		const grandFormulaForEffect = formulaPartsForEffect.length > 0 ? formulaPartsForEffect.join( ' + ' ) : '0';

		bestTotalInfo.value = {
			total: grandTotal,
			actionTotal: actionTotal,
			separateBonus: totalSeparateBonus,
			formula: grandFormula,
			effect: actionEffect
		};

		bestEffectInfo.value = {
			total: grandTotalForEffect,
			actionTotal: actionEffectTotal,
			separateBonus: totalSeparateBonus,
			formula: grandFormulaForEffect,
			effect: actionEffectBestDie
		};

		let log = `=== ACTION POOL (Keep ${actionKeep}) ===\n`;
		if ( actionResults.length > 0 ) {
			log += `Dice: ${actionResults.map( r => 'd' + r.size + ': ' + r.value + ( r.isHitch ? ' (Hitch)' : '' ) ).join( ', ' )}\n`;
			log += `Action Total: ${actionTotal} (${actionFormula}) | Effect: ${actionEffect}\n`;
			log += `Action Hitches: ${totalHitches.value}\n\n`;
		} else {
			log += `(No action dice in pool)\n\n`;
		}

		log += `=== SEPARATE (Rolled Separately, No Hitches) ===\n`;
		for ( const g of groups ) {
			log += `• ${g.name} (${g.dice.map( d => 'd' + d.size ).join( ', ' )}): [${g.dice.map( d => d.value ).join( ', ' )}] -> Kept highest: ${g.bonus}\n`;
		}
		log += `Total Separate Bonus: +${totalSeparateBonus}\n\n`;

		log += `=== FINAL COMBINED TOTAL ===\n`;
		log += `Grand Total: ${grandTotal} (${grandFormula})\n`;
		log += `Effect Die: ${actionEffect}\n`;
		log += `Total Hitches: ${totalHitches.value} (separate dice cannot hitch)`;

		cortexPalOutput.value = log;
	}
}

function getGroupKeptValue( group: SeparateGroup ) {
	const kept = group.dice.find( d => d.manualRole === 'total' );
	return kept ? kept.value : 0;
}

function cycleDieRole( dieResult: RollResult ) {
	if ( dieResult.isHitch ) return; // Hitches cannot be used for total or effect

	if ( !combineResources.value && dieResult.hitches === 0 ) {
		const group = separateGroupsResults.value.find( g => g.dice.some( d => d.id === dieResult.id ) );
		if ( group ) {
			if ( dieResult.manualRole === 'total' ) {
				dieResult.manualRole = 'none';
			} else {
				for ( const d of group.dice ) {
					d.manualRole = ( d.id === dieResult.id ) ? 'total' : 'none';
				}
			}
			return;
		}
	}

	if ( dieResult.manualRole === 'none' ) {
		dieResult.manualRole = 'total';
	} else if ( dieResult.manualRole === 'total' ) {
		dieResult.manualRole = 'effect';
	} else {
		dieResult.manualRole = 'none';
	}
}

function applyBestTotal() {
	if ( !bestTotalInfo.value || bestTotalInfo.value.isBotch ) return;
	evaluateRollDisplay();
}

function applyBestEffect() {
	if ( !bestEffectInfo.value || bestEffectInfo.value.isBotch ) return;

	if ( !combineResources.value && separateGroupsResults.value.length > 0 ) {
		const actionKeep = 2 + actionKeepsExtra.value;
		const actionEligible = actionRollResults.value.filter( r => !r.isHitch ).sort( ( a, b ) => {
			if ( a.size !== b.size ) return b.size - a.size;
			return a.value - b.value;
		} );
		const effectSlice = actionEligible.slice( 0, 1 );
		const totalSlice = actionEligible.slice( 1 ).sort( ( a, b ) => b.value - a.value ).slice( 0, actionKeep );

		for ( const r of actionRollResults.value ) {
			if ( effectSlice.some( e => e.id === r.id ) ) {
				r.manualRole = 'effect';
			} else if ( totalSlice.some( t => t.id === r.id ) ) {
				r.manualRole = 'total';
			} else {
				r.manualRole = 'none';
			}
		}

		for ( const group of separateGroupsResults.value ) {
			const hasKept = group.dice.some( d => d.manualRole === 'total' );
			if ( !hasKept && group.dice.length > 0 ) {
				const sortedSep = [ ...group.dice ].sort( ( a, b ) => b.value - a.value );
				sortedSep[ 0 ].manualRole = 'total';
			}
		}
		return;
	}

	const eligible = lastRollResults.value.filter( r => !r.isHitch ).sort( ( a, b ) => {
		if ( a.size !== b.size ) return b.size - a.size;
		return a.value - b.value;
	} );
	const effectSlice = eligible.slice( 0, 1 );
	const totalSlice = eligible.slice( 1 ).sort( ( a, b ) => b.value - a.value ).slice( 0, keep.value );

	for ( const r of lastRollResults.value ) {
		if ( effectSlice.some( e => e.id === r.id ) ) {
			r.manualRole = 'effect';
		} else if ( totalSlice.some( t => t.id === r.id ) ) {
			r.manualRole = 'total';
		} else {
			r.manualRole = 'none';
		}
	}
}

function copyOutput() {
	if ( !cortexPalOutput.value ) return;
	navigator.clipboard.writeText( cortexPalOutput.value ).then( () => {
		copiedNotice.value = true;
		setTimeout( () => {
			copiedNotice.value = false;
		}, 2000 );
	} );
}

defineExpose( {
	roll,
	clearPool,
	isRolled,
	lastRollResults,
	bestTotalInfo,
	bestEffectInfo
} );
</script>

<template>
	<aside class="dice-roller-sidebar" :class="{ 'open': open }">

		<div class="roller-header">
			<div class="roller-title">
				<i class="fas fa-dice"></i> <span>Dice Roller</span>
			</div>
			<div class="roller-header-actions">
				<button class="roller-btn-icon" @click="emit('togglePosition')" :title="position === 'left' ? 'Move sidebar to right' : 'Move sidebar to left'">
					<i class="fas fa-arrows-left-right"></i>
				</button>
				<button class="roller-btn-icon" @click="clearPool" title="Clear Pool" v-if="stagedDice.length > 0">
					<i class="fas fa-trash-can"></i>
				</button>
				<button class="roller-btn-icon" @click="emit('close')" title="Close Roller">
					<i class="fas fa-times"></i>
				</button>
			</div>
		</div>

		<div class="roller-body">

			<!-- QUICK ADD AD-HOC DICE -->
			<div class="roller-section">
				<div class="roller-label">Quick Add Dice</div>
				<div class="roller-adhoc-grid">
					<button
						v-for="size in diceSizes"
						:key="'adhoc-d' + size"
						class="roller-adhoc-btn"
						@click="addAdHoc(size)"
					>
						<span class="c">{{ getDieDisplayValue(size) }}</span>
						<span class="die-label">d{{ size }}</span>
					</button>
				</div>
				<div class="roller-scale-row" style="margin-top: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
					<span class="roller-sublabel" style="font-weight: 700; color: #1e293b; font-style: normal; font-size: 0.65rem; text-transform: uppercase;">Scale Die</span>
					<div style="display: flex; gap: 0.25rem;">
						<button
							v-for="size in diceSizes"
							:key="'scale-quick-d' + size"
							class="roller-btn-scale-quick"
							@click="addScaleAdHoc(size)"
							:title="'Add d' + size + ' Scale Die (Keep 3)'"
							style="background: white; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 5px; cursor: pointer; line-height: 1;"
						>
							<span class="c" style="color: #1e293b; font-size: 1.3rem; line-height: 1;">{{ getDieDisplayValue(size) }}</span>
						</button>
					</div>
				</div>
				<div class="roller-scale-row" style="margin-top: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
					<span class="roller-sublabel" style="font-weight: 700; color: #0284c7; font-style: normal; font-size: 0.65rem; text-transform: uppercase;">Separate Die</span>
					<div style="display: flex; gap: 0.25rem;">
						<button
							v-for="size in diceSizes"
							:key="'res-quick-d' + size"
							class="roller-btn-res-quick"
							@click="addSeparateAdHoc(size)"
							:title="'Add d' + size + ' Separate Die'"
							style="background: white; border: 1px solid #bae6fd; border-radius: 4px; padding: 2px 5px; cursor: pointer; line-height: 1;"
						>
							<span class="c" style="color: #0284c7; font-size: 1.3rem; line-height: 1;">{{ getDieDisplayValue(size) }}</span>
						</button>
					</div>
				</div>
			</div>

			<!-- CURRENT POOL -->
			<div class="roller-section">
				<div class="roller-section-header">
					<span class="roller-label">Dice Pool ({{ stagedDice.length }})</span>
					<span class="roller-sublabel" v-if="stagedDice.length === 0">Tap traits on sheet to add</span>
				</div>

				<div class="roller-pool-chips" v-if="stagedDice.length > 0">
					<div
						v-for="(item, idx) in stagedDice"
						:key="item.id || idx"
						class="roller-chip"
						:class="{
							'chip-scale': item.isScale || (item.source && item.source.toLowerCase() === 'scale'),
							'chip-resource': isExempt(item)
						}"
					>
						<span class="c">{{ getDieDisplayValue(item.size) }}</span>
						<span class="chip-source" v-if="cleanTraitLabel(item.source)" :title="cleanTraitLabel(item.source)">{{ cleanTraitLabel(item.source) }}</span>
						<span class="chip-tag-res" v-if="isExempt(item)">SEP</span>
						<div class="chip-actions">
							<button type="button" class="chip-btn chip-step-down" :disabled="item.size <= 4" @click.stop="stepDownDie(item)" title="Step down">▼</button>
							<button type="button" class="chip-btn chip-step-up" :disabled="item.size >= 12" @click.stop="stepUpDie(item)" title="Step up">▲</button>
							<button type="button" class="chip-btn chip-dup" @click.stop="duplicateDie(item)" title="Duplicate die">×2</button>
							<button type="button" class="chip-remove" @click.stop="removeDie(Number(idx))" title="Remove die">×</button>
						</div>
					</div>
				</div>

				<div class="roller-empty-pool" v-else>
					<p><i class="fas fa-hand-pointer"></i> Click any trait on your sheet or use quick-add above to build a roll pool.</p>
				</div>
			</div>

			<!-- SETTINGS & ROLL BUTTON -->
			<div class="roller-controls" v-if="stagedDice.length > 0">

					<!-- SEPARATE ROLL MODE TOGGLE (when apart-rolling dice are staged) -->
					<div class="roller-toggle-row" v-if="hasSeparateDice">
						<label class="roller-toggle-label" title="Toggle between rolling separate dice in the main action pool vs. rolling them separately">
						<input type="checkbox" id="roller-combine-resources" name="combineResources" v-model="combineResources">
						<span class="toggle-text">Roll Separate Dice in Normal Pool</span>
					</label>
					<span class="toggle-hint">
						{{ combineResources ? '+' + separateKeepBonus + ' Keep' : 'Rolled separately' }}
					</span>
				</div>

				<div class="roller-options-row">
					<div class="roller-option">
						<label for="roller-keep-count">Keep</label>
						<select id="roller-keep-count" name="keepCount" v-model.number="keep" aria-label="Dice to keep">
							<option v-for="n in 8" :key="n" :value="n">{{ n }}</option>
						</select>
					</div>

					<div class="roller-option">
						<label>Hitches</label>
						<span class="roller-hitch-readout" :title="'Faces ' + hitchLabel + ' hitch, from the staged dice (highest member wins)'">{{ hitchLabel }}</span>
					</div>
				</div>

				<button class="roller-roll-btn" @click="roll">
					<i class="fas fa-dice"></i> ROLL POOL
				</button>
			</div>

			<!-- ROLL RESULTS -->
			<div class="roller-results" v-if="isRolled && lastRollResults.length > 0">

				<div class="roller-results-header">
					<label class="roller-label">Results</label>
					<div class="roller-view-tabs">
						<button :class="{ active: activeTab === 'roller' }" @click="activeTab = 'roller'">Interactive</button>
						<button :class="{ active: activeTab === 'log' }" @click="activeTab = 'log'">Text Log</button>
					</div>
				</div>

				<!-- BOTCH ALERT -->
				<div class="roller-botch-banner" v-if="isBotch">
					<i class="fas fa-triangle-exclamation"></i> <strong>BOTCH!</strong> All dice rolled hitches!
				</div>

				<!-- INTERACTIVE RESULTS VIEW -->
				<div v-show="activeTab === 'roller'" class="roller-interactive-view">

					<!-- SEPARATE MODE: ACTION POOL DICE AND APART-ROLLING GROUPS -->
					<template v-if="!combineResources && separateGroupsResults.length > 0">
						<!-- Action Pool Section -->
						<div class="roller-group-section" v-if="actionRollResults.length > 0">
							<div class="roller-group-header">
								<span>Action Pool</span>
								<span class="group-sub">Keep {{ Math.min(keep, actionRollResults.length) }}</span>
							</div>
							<div class="roller-dice-grid">
								<div
									v-for="die in actionRollResults"
									:key="die.id"
									class="roller-die-card"
									:class="{
										'is-hitch': die.isHitch,
										'role-total': die.manualRole === 'total',
										'role-effect': die.manualRole === 'effect'
									}"
									@click="cycleDieRole(die)"
									:title="die.isHitch ? 'Hitch: cannot be used' : 'Click to cycle: Total / Effect / Unused'"
								>
									<div class="card-top">
										<span class="c">{{ getDieDisplayValue(die.size) }}</span>
										<span class="card-size">d{{ die.size }}</span>
									</div>
									<div class="card-value" :class="{ 'hitch-value': die.isHitch }">
										{{ die.value }}
									</div>
									<div class="card-badge" v-if="die.isHitch">
										<i class="fas fa-exclamation"></i> Hitch
									</div>
									<div class="card-badge badge-total" v-else-if="die.manualRole === 'total'">
										Total
									</div>
									<div class="card-badge badge-effect" v-else-if="die.manualRole === 'effect'">
										Effect
									</div>
									<div class="card-badge badge-unused" v-else>
										Unused
									</div>
									<div class="card-source" v-if="die.source">{{ die.source }}</div>
								</div>
							</div>
						</div>

						<!-- Separate Section (hitches 0: own pool, no hitches) -->
						<div class="roller-resources-section" v-if="separateGroupsResults.length > 0">
							<div class="roller-group-header">
								<span><i class="fas fa-shield-halved"></i> Separate</span>
								<span class="group-sub">No Hitches • Keep Highest</span>
							</div>
							<div v-for="group in separateGroupsResults" :key="group.name" class="roller-resource-group-card">
								<div class="resource-group-title">
									<span class="res-name">{{ group.name }}</span>
									<span class="resource-group-tag">+{{ getGroupKeptValue(group) }} to Total</span>
								</div>
								<div class="roller-dice-grid">
									<div
										v-for="die in group.dice"
										:key="die.id"
										class="roller-die-card die-resource-card"
										:class="{
											'role-total': die.manualRole === 'total'
										}"
										@click="cycleDieRole(die)"
										title="Click to toggle as kept die for this group"
									>
										<div class="card-top">
											<span class="c" style="color: #0284c7;">{{ getDieDisplayValue(die.size) }}</span>
											<span class="card-size">d{{ die.size }}</span>
										</div>
										<div class="card-value">
											{{ die.value }}
										</div>
										<div class="card-badge badge-res-kept" v-if="die.manualRole === 'total'">
											Kept (+{{ die.value }})
										</div>
										<div class="card-badge badge-unused" v-else>
											Unused
										</div>
										<div class="card-source">{{ die.source }}</div>
									</div>
								</div>
							</div>
						</div>
					</template>

					<!-- COMBINED / NORMAL POOL MODE: SINGLE GRID -->
					<div class="roller-dice-grid" v-else>
						<div
							v-for="die in lastRollResults"
							:key="die.id"
							class="roller-die-card"
							:class="{
								'is-hitch': die.isHitch,
								'die-resource-card': die.hitches === 0,
								'role-total': die.manualRole === 'total',
								'role-effect': die.manualRole === 'effect'
							}"
							@click="cycleDieRole(die)"
							:title="die.isHitch ? 'Hitch: cannot be used' : 'Click to cycle: Total / Effect / Unused'"
						>
							<div class="card-top">
								<span class="c" :style="die.hitches === 0 ? 'color: #0284c7;' : ''">{{ getDieDisplayValue(die.size) }}</span>
								<span class="card-size">d{{ die.size }}</span>
							</div>

							<div class="card-value" :class="{ 'hitch-value': die.isHitch }">
								{{ die.value }}
							</div>

							<div class="card-badge" v-if="die.isHitch">
								<i class="fas fa-exclamation"></i> Hitch
							</div>
							<div class="card-badge badge-total" v-else-if="die.manualRole === 'total'">
								Total
							</div>
							<div class="card-badge badge-effect" v-else-if="die.manualRole === 'effect'">
								Effect
							</div>
							<div class="card-badge badge-unused" v-else>
								Unused
							</div>

							<div class="card-source" v-if="die.source">
								{{ die.source }}<span v-if="die.hitches === 0" style="color: #0284c7; font-weight: 700;"> (Sep)</span>
							</div>
						</div>
					</div>

					<!-- HITCH INDICATOR -->
					<div class="roller-hitch-indicator" v-if="totalHitches > 0">
						<i class="fas fa-bullhorn"></i> <strong>{{ totalHitches }}</strong> Hitch{{ totalHitches > 1 ? 'es' : '' }}
					</div>

					<!-- CURRENT SELECTION TOTAL / EFFECT -->
					<div class="roller-calc-box custom-calc" v-if="!isBotch">
						<template v-if="!combineResources && separateGroupsResults.length > 0">
							<div class="calc-row">
								<span class="calc-label">Action Total</span>
								<span class="calc-val">{{ manualActionTotal }}</span>
							</div>
							<div class="calc-row" v-if="separateGroupsResults.length > 0">
								<span class="calc-label">Separate</span>
								<span class="calc-val" style="color: #0284c7;">+{{ manualSeparateBonus }}</span>
							</div>
							<div class="calc-row">
								<span class="calc-label">Grand Total</span>
								<span class="calc-val">{{ manualTotal }}</span>
							</div>
							<div class="calc-row">
								<span class="calc-label">Effect</span>
								<span class="calc-val">{{ manualEffectDie }}</span>
							</div>
						</template>
						<template v-else>
							<div class="calc-row">
								<span class="calc-label">Selected Total</span>
								<span class="calc-val">{{ manualTotal }}</span>
							</div>
							<div class="calc-row">
								<span class="calc-label">Selected Effect</span>
								<span class="calc-val">{{ manualEffectDie }}</span>
							</div>
						</template>
					</div>

					<!-- CORTEXPAL PRESETS -->
					<div class="roller-presets" v-if="!isBotch">
						<div class="preset-card" v-if="bestTotalInfo" @click="applyBestTotal">
							<div class="preset-title"><i class="fas fa-award"></i> Best Total</div>
							<div class="preset-content">
								<strong>{{ bestTotalInfo.total }}</strong> ({{ bestTotalInfo.formula }}) with Effect: <strong>{{ bestTotalInfo.effect }}</strong>
							</div>
							<span class="preset-apply">Apply to selection</span>
						</div>

						<div class="preset-card" v-if="bestEffectInfo" @click="applyBestEffect">
							<div class="preset-title"><i class="fas fa-bolt"></i> Best Effect</div>
							<div class="preset-content">
								Effect: <strong>{{ bestEffectInfo.effect }}</strong> with Total: <strong>{{ bestEffectInfo.total }}</strong>
							</div>
							<span class="preset-apply">Apply to selection</span>
						</div>
					</div>

				</div>

				<!-- PLAIN TEXT CORTEXPAL LOG -->
				<div v-show="activeTab === 'log'" class="roller-log-view">
					<pre class="roller-raw-log">{{ cortexPalOutput }}</pre>
					<button class="roller-copy-btn" @click="copyOutput">
						<i class="fas fa-copy"></i> {{ copiedNotice ? 'Copied!' : 'Copy to Clipboard' }}
					</button>
				</div>

			</div>

		</div>

	</aside>
</template>
