<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from 'vue';
import { cortexFunctions } from './functions.ts';
import { getView, ensureView } from './model.ts';

const props = defineProps<{
	character: any;
	selected?: any[];
	traitSetID: number;
	traitID: number;
	subtraitID: number;
}>();

const emit = defineEmits<{
	( e: 'updateCharacter', character: any ): void;
	( e: 'removeSubtrait', subtraitID: number ): void;
}>();

const instance = getCurrentInstance();
const rootTemplates = () => ( instance?.proxy as any )?.$root?.sheetTemplates ?? null;

const confirmDelete = ref( false );

watch( () => props.subtraitID, () => { confirmDelete.value = false; } );

const subtrait = computed( () => {
	const s = props.traitSetID;
	const t = props.traitID;
	const u = props.subtraitID;
	return props.character.traitSets[ s ].traits[ t ].traits[ u ];
} );

const selector = computed( () => [ 'subtrait', props.traitSetID, props.traitID, props.subtraitID ] );

const name = computed( {
	get() {
		return subtrait.value.name;
	},
	set( value: string ) {
		setSubtraitProperty( 'name', value );
	},
} );

const value = computed( {
	get() {
		return subtrait.value.value;
	},
	set( value: any ) {
		setSubtraitProperty( 'value', value );
	},
} );

const availableValues = computed( () => {
	const s = props.traitSetID;
	const traitSet = props.character.traitSets[ s ];
	const ratings = cortexFunctions.getSubtraitRatings( traitSet );
	if ( getView( traitSet )?.style?.body === 'paired-slots' && subtrait.value?.name && subtrait.value.name.toUpperCase().includes( 'BONUS' ) ) {
		if ( Array.isArray( ratings ) && ratings.length === 5 && ratings[ 0 ] === 4 ) {
			return ratings.filter( ( size: number ) => size >= 6 );
		}
	}
	return ratings;
} );

const parentIsBranch = computed( () => {
	const s = props.traitSetID;
	const traitSet = props.character?.traitSets?.[ s ];
	return getView( traitSet )?.style?.body === 'subtrait-columns';
} );

const branchSide = computed( {
	get() {
		return getView( subtrait.value )?.branchSide === 'left' ? 'left' : 'right';
	},
	set( val: string ) {
		ensureView( subtrait.value ).branchSide = ( val === 'left' ) ? 'left' : 'right';
		updateCharacter( props.character );
	},
} );

const templateSubtraitMatched = computed( () => {
	const s = props.traitSetID, t = props.traitID;
	const ts = props.character?.traitSets?.[ s ];
	const tr = ts?.traits?.[ t ];
	if ( !tr || !subtrait.value || !subtrait.value.name || !ts || !ts.id || !tr.name ) return false;
	const entry = cortexFunctions.resolveTemplateFor( props.character, rootTemplates() );
	const base = cortexFunctions.templateSetById( entry, ts.id );
	const btr = base && Array.isArray( base.traits )
		? base.traits.find( ( b: any ) => b && b.name === tr.name ) : null;
	return Boolean( btr && Array.isArray( btr.traits ) &&
		btr.traits.some( ( b: any ) => b && b.name === subtrait.value.name ) );
} );

function setSubtraitProperty( key: string, value: any ) {
	const character = props.character;
	const s = props.traitSetID;
	const t = props.traitID;
	const f = props.subtraitID;

	character.traitSets[ s ].traits[ t ].traits[ f ][ key ] = value;

	updateCharacter( character );
}

function toggleSubtraitValue( val: any ) {
	let v = val;
	if ( v === subtrait.value.value ) {
		v = null;
	}
	setSubtraitProperty( 'value', v );
}

function updateCharacter( character: any ) {
	emit( 'updateCharacter', character );
}

function removeSubtrait() {
	confirmDelete.value = false;
	emit( 'removeSubtrait', props.subtraitID );
}

function removeFromSheet() {
	const entry = cortexFunctions.resolveTemplateFor( props.character, rootTemplates() );
	cortexFunctions.removeSubtraitFromSheet(
		props.character, entry, props.traitSetID, props.traitID, props.subtraitID );
	confirmDelete.value = false;
	updateCharacter( props.character );
}

function getDieDisplayValue( value: any ) {
	return cortexFunctions.getDieDisplayValue( value );
}
</script>

<template>
	<section class="editor-subgroup">

		<div class="editor-fields">

			<div class="editor-field">
				<label :for="'subtrait-name-' + traitSetID + '-' + traitID + '-' + subtraitID">Subtrait Name</label>
				<input type="text" :id="'subtrait-name-' + traitSetID + '-' + traitID + '-' + subtraitID" name="subtraitName" v-model="name">
			</div>

			<ul class="editor-values">
				<li
					v-for="value in availableValues"
					:class="{ 'active': value === subtrait.value }"
					tabindex="0"
					role="button"
					@keydown.enter.prevent="toggleSubtraitValue( value )"
					@keydown.space.prevent="toggleSubtraitValue( value )"
					@click.stop="toggleSubtraitValue( value )"
				>
					<span class="c" v-html="getDieDisplayValue(value)"></span>
				</li>
			</ul>

			<div class="editor-field" v-if="parentIsBranch">
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

			<div class="editor-button-container">
				<div class="editor-button-container-inner">
					<div v-if="!confirmDelete" class="editor-button editor-button-remove editor-button-secondary" @click.prevent="confirmDelete = true">
						<span><i class="fas fa-trash"></i> Remove Subtrait</span>
					</div>
					<div v-else class="editor-button editor-button-remove editor-button-delete-confirm" @click.prevent="removeSubtrait">
						<span><i class="fas fa-exclamation-triangle"></i> Confirm Remove?</span>
					</div>
					<div v-if="templateSubtraitMatched" class="editor-button editor-button-remove" @click.prevent="removeFromSheet" title="Remove from sheet — reversible via restore, no confirmation needed">
						<span><i class="fas fa-eraser"></i> Remove from sheet</span>
					</div>
				</div>
			</div>

		</div>

	</section>
</template>
