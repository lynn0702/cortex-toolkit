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
				<label>SFX Name</label>
				<input type="text" v-model="name">
			</div>

			<div class="editor-field">
				<label>SFX Description</label>
				<textarea v-model="description"></textarea>
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
