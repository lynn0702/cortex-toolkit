<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	character: any;
	selected?: any[];
	traitSetID: number;
	traitID: number | null;
	effectID: number;
}>();

const emit = defineEmits<{
	( e: 'updateCharacter', character: any ): void;
	( e: 'removeEffect', effectID: number ): void;
}>();

const effect = computed( () => {
	const s = props.traitSetID;
	const t = props.traitID;
	const f = props.effectID;
	if ( t === null ) {
		return props.character.traitSets[ s ].sfx[ f ];
	}
	return props.character.traitSets[ s ].traits[ t ].sfx[ f ];
} );

const selector = computed( () => [ 'sfx', props.traitSetID, props.traitID, props.effectID ] );

const name = computed( {
	get() {
		return effect.value.name;
	},
	set( value: string ) {
		setEffectProperty( 'name', value );
	},
} );

const description = computed( {
	get() {
		return effect.value.description;
	},
	set( value: string ) {
		setEffectProperty( 'description', value );
	},
} );

const POOL_COST_OPTIONS = [
	{ value: '', label: 'None' },
	{ value: 'drop-highest', label: 'Drop highest' },
	{ value: 'drop-die', label: 'Drop a die' },
	{ value: 'split-largest', label: 'Split largest' },
];

function costObject(): Record<string, any> {
	const c = effect.value.cost;
	return c && typeof c === 'object' && !Array.isArray( c ) ? c : {};
}

// Surgical cost writes: other cost keys survive, an emptied cost drops
// off the entry so files stay sparse.
function setCostKey( key: string, value: any ) {
	const character = props.character;
	const s = props.traitSetID;
	const t = props.traitID;
	const f = props.effectID;
	const target = t === null ? character.traitSets[ s ].sfx[ f ] : character.traitSets[ s ].traits[ t ].sfx[ f ];
	const cost: Record<string, any> = { ...costObject() };
	if ( value === undefined || value === null || value === '' || value === false ) delete cost[ key ];
	else cost[ key ] = value;
	if ( Object.keys( cost ).length ) target.cost = cost;
	else delete target.cost;
	emit( 'updateCharacter', character );
}

const costPool = computed( {
	get() {
		const p = costObject().pool;
		return p === 'drop-highest' || p === 'drop-die' || p === 'split-largest' ? p : '';
	},
	set( value: string ) {
		setCostKey( 'pool', value === '' ? undefined : value );
	},
} );

const costPlotPoints = computed( {
	get() {
		const n = costObject().plotPoints;
		return typeof n === 'number' && n > 0 ? n : '';
	},
	set( value: any ) {
		const n = Math.floor( Number( value ) );
		setCostKey( 'plotPoints', Number.isFinite( n ) && n > 0 ? n : undefined );
	},
} );

const costStepUp = computed( {
	get() {
		const v = costObject().stepUp;
		return typeof v === 'string' ? v : '';
	},
	set( value: string ) {
		setCostKey( 'stepUp', typeof value === 'string' && value.trim().length ? value.trim() : undefined );
	},
} );

const costStepDown = computed( {
	get() {
		const v = costObject().stepDown;
		return typeof v === 'string' ? v : '';
	},
	set( value: string ) {
		setCostKey( 'stepDown', typeof value === 'string' && value.trim().length ? value.trim() : undefined );
	},
} );

const costNarrative = computed( {
	get() {
		return costObject().narrative === true;
	},
	set( value: boolean ) {
		setCostKey( 'narrative', value ? true : undefined );
	},
} );

function setEffectProperty( key: string, value: any ) {
	const character = props.character;
	const s = props.traitSetID;
	const t = props.traitID;
	const f = props.effectID;

	if ( t === null ) {
		character.traitSets[ s ].sfx[ f ][ key ] = value;
	} else {
		character.traitSets[ s ].traits[ t ].sfx[ f ][ key ] = value;
	}

	emit( 'updateCharacter', character );
}

function removeEffect() {
	emit( 'removeEffect', props.effectID );
}
</script>

<template>
	<section class="editor-subgroup">

		<div class="editor-fields">

			<div class="editor-field">
				<label :for="'sfx-name-' + traitSetID + '-' + (traitID !== null ? traitID : 'set') + '-' + effectID">SFX Name</label>
				<input type="text" :id="'sfx-name-' + traitSetID + '-' + (traitID !== null ? traitID : 'set') + '-' + effectID" name="sfxName" v-model="name">
			</div>

			<div class="editor-field">
				<label :for="'sfx-desc-' + traitSetID + '-' + (traitID !== null ? traitID : 'set') + '-' + effectID">SFX Description</label>
				<textarea :id="'sfx-desc-' + traitSetID + '-' + (traitID !== null ? traitID : 'set') + '-' + effectID" name="sfxDescription" v-model="description"></textarea>
			</div>

			<div class="editor-field">
				<label>Cost</label>
				<div class="editor-button-group">
					<button
						type="button"
						v-for="opt in POOL_COST_OPTIONS"
						:key="'sfx-cost-' + opt.value"
						class="editor-group-btn"
						:class="{ active: costPool === opt.value }"
						@click.stop="costPool = opt.value"
					>
						{{ opt.label }}
					</button>
				</div>
			</div>

			<div class="editor-field">
				<label :for="'sfx-pp-' + traitSetID + '-' + (traitID !== null ? traitID : 'set') + '-' + effectID">Plot points</label>
				<input type="number" :id="'sfx-pp-' + traitSetID + '-' + (traitID !== null ? traitID : 'set') + '-' + effectID" name="sfxPlotPoints" v-model="costPlotPoints" min="0">
			</div>

			<div class="editor-field">
				<label :for="'sfx-stepup-' + traitSetID + '-' + (traitID !== null ? traitID : 'set') + '-' + effectID">Step up</label>
				<input type="text" :id="'sfx-stepup-' + traitSetID + '-' + (traitID !== null ? traitID : 'set') + '-' + effectID" name="sfxStepUp" v-model="costStepUp">
			</div>

			<div class="editor-field">
				<label :for="'sfx-stepdown-' + traitSetID + '-' + (traitID !== null ? traitID : 'set') + '-' + effectID">Step down</label>
				<input type="text" :id="'sfx-stepdown-' + traitSetID + '-' + (traitID !== null ? traitID : 'set') + '-' + effectID" name="sfxStepDown" v-model="costStepDown">
			</div>

			<div class="editor-field">
				<div class="editor-toggles">
					<div>
						<input
							type="checkbox"
							:id="'sfx-narrative-' + traitSetID + '-' + (traitID !== null ? traitID : 'set') + '-' + effectID"
							name="sfxNarrative"
							v-model="costNarrative"
						>
					</div>
					<div>
						<label :for="'sfx-narrative-' + traitSetID + '-' + (traitID !== null ? traitID : 'set') + '-' + effectID">
							Narrative beat
						</label>
					</div>
				</div>
			</div>

			<div class="editor-button-container">
				<div class="editor-button-container-inner">
					<div class="editor-button editor-button-remove editor-button-secondary" @click.prevent="removeEffect">
						<span><i class="fas fa-trash"></i> Remove SFX</span>
					</div>
				</div>
			</div>

		</div>

	</section>
</template>
