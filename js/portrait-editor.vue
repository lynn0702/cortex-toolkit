<script setup lang="ts">
import { computed, ref } from 'vue';
import { cortexFunctions } from './functions.ts';

const props = defineProps<{
	character: any;
	open: boolean;
}>();

const emit = defineEmits<{
	( e: 'selectElement', selector: any[] ): void;
	( e: 'updateCharacter', character: any ): void;
}>();

const uploadError = ref( '' );
const inputFile = ref<HTMLInputElement | null>( null );

const hasImage = computed( () => Boolean( props.character?.portrait?.url?.length ) );

const imageURL = computed( {
	get() {
		return props.character?.portrait?.url ?? '';
	},
	set( value: string ) {
		setImageURL( value );
	},
} );

const size = computed( {
	get() {
		return props.character?.portrait?.custom?.cortexToolkit?.size ?? 'classic';
	},
	set( value: string ) {
		setCustomProperty( 'size', value );
	},
} );

const location = computed( {
	get() {
		return props.character?.portrait?.custom?.cortexToolkit?.location ?? 'header';
	},
	set( value: string ) {
		setCustomProperty( 'location', value );
	},
} );

const alignment = computed( {
	get() {
		return props.character?.portrait?.custom?.cortexToolkit?.alignment ?? 'top-center';
	},
	set( value: string ) {
		setAlignment( value );
	},
} );

function selectElement( selector: any[] ) {
	emit( 'selectElement', selector );
}

function ensurePortraitStruct() {
	if ( !props.character ) return;
	if ( !props.character.portrait ) {
		props.character.portrait = structuredClone( cortexFunctions.defaultCharacter.portrait || { url: '', custom: { cortexToolkit: {} } } );
	}
	if ( !props.character.portrait.custom ) props.character.portrait.custom = {};
	if ( !props.character.portrait.custom.cortexToolkit ) props.character.portrait.custom.cortexToolkit = {};
}

function uploadStart() {
	inputFile.value?.click();
}

function setImageURL( url: string ) {
	ensurePortraitStruct();
	props.character.portrait.url = url;
	updateCharacter( props.character );
}

function removePortrait() {
	ensurePortraitStruct();
	props.character.portrait.url = '';
	props.character.portrait.custom.cortexToolkit.size = 'none';
	updateCharacter( props.character );
	selectElement( [] );
}

function setCustomProperty( key: string, value: any ) {
	ensurePortraitStruct();
	props.character.portrait.custom.cortexToolkit[ key ] = value;
	updateCharacter( props.character );
}

function setAlignment( value: string ) {
	ensurePortraitStruct();
	props.character.portrait.custom.cortexToolkit.alignment = value;
	updateCharacter( props.character );
}

function uploadProcess( event: Event ) {
	const input = event.target as HTMLInputElement;

	uploadError.value = '';

	if ( !input.files || !input.files.length ) {
		setImageURL( '' );
		setAlignment( 'center' );
		return;
	}

	cortexFunctions.processImageFile( input.files[ 0 ], 1024, 0.85 ).then(
		( dataURL: string ) => {
			setImageURL( dataURL );
			input.value = null as any;
		},
		( error: any ) => {
			uploadError.value = error?.message || 'Could not process that image.';
			input.value = null as any;
		}
	);
}

function updateCharacter( character: any ) {
	emit( 'updateCharacter', character );
}
</script>

<template>
	<aside :class="{ 'editor': true, 'editor-portrait': true, 'open': open, 'scrollable': true, 'anchor-position-top': true }" @click.stop="">

		<div class="editor-arrow"></div>

		<div class="editor-controls">
			<button @click.stop="selectElement([])"><i class="fas fa-times"></i></button>
			<button v-if="hasImage" class="editor-delete" @click.stop="setImageURL('')" title="Remove Image"><i class="fas fa-trash"></i></button>
		</div>

		<div class="editor-inner">
			<div>

				<div class="editor-fields">

					<div class="editor-field">
						<label>Portrait Size / Style</label>
						<select v-model="size">
							<option value="classic">Classic</option>
							<option value="spotlight">Small Portrait</option>
							<option value="none">Hidden</option>
						</select>
					</div>

					<div class="editor-field" v-if="size !== 'none'">
						<label>Placement</label>
						<select v-model="location">
							<option value="header">Header</option>
							<option value="right">Right Column</option>
							<option value="left">Left Column</option>
						</select>
					</div>

					<div class="editor-field" v-if="size !== 'none'">

						<label>Image Source</label>

						<img class="portrait-preview"
							v-if="hasImage"
							:src="character?.portrait?.url"
							@click.prevent="uploadStart"
						>

						<div class="editor-button-container">
							<div class="editor-button-container-inner">
								<div
									class="editor-button"
									@click.prevent="uploadStart"
								>
									<span><i class="fas fa-upload"></i> Upload {{ hasImage ? 'New' : '' }} Image</span>
								</div>
							</div>
						</div>

						<input class="portrait-input" type="file" ref="inputFile" @change="uploadProcess" accept="image/*">

						<div class="editor-upload-error" v-if="uploadError">{{ uploadError }}</div>

						<div style="margin-top: 0.5rem;">
							<label style="font-size: 0.75rem; color: #64748b;">Or Image URL</label>
							<input type="text" v-model.lazy="imageURL" placeholder="https://example.com/portrait.jpg">
						</div>

						<div class="editor-button-container" v-if="hasImage" style="margin-top: 0.75rem;">
							<div class="editor-button-container-inner">
								<div class="editor-button" style="background: #ef4444; color: #ffffff;" @click.prevent="removePortrait">
									<span><i class="fas fa-trash-alt"></i> Remove Portrait</span>
								</div>
							</div>
						</div>

					</div>

					<div class="editor-field" v-if="hasImage && size !== 'none'">

						<label>Alignment / Focus</label>

						<div class="editor-portrait-alignment">
							<div @click.stop="setAlignment('top-left')"      :class="{'active': alignment === 'top-left' }"></div>
							<div @click.stop="setAlignment('top-center')"    :class="{'active': alignment === 'top-center' }"></div>
							<div @click.stop="setAlignment('top-right')"     :class="{'active': alignment === 'top-right' }"></div>
							<div @click.stop="setAlignment('center-left')"   :class="{'active': alignment === 'center-left' }"></div>
							<div @click.stop="setAlignment('center')"        :class="{'active': alignment === 'center' }"></div>
							<div @click.stop="setAlignment('center-right')"  :class="{'active': alignment === 'center-right' }"></div>
							<div @click.stop="setAlignment('bottom-left')"   :class="{'active': alignment === 'bottom-left' }"></div>
							<div @click.stop="setAlignment('bottom-center')" :class="{'active': alignment === 'bottom-center' }"></div>
							<div @click.stop="setAlignment('bottom-right')"  :class="{'active': alignment === 'bottom-right' }"></div>
						</div>

					</div>

				</div>

			</div>
		</div>

	</aside>
</template>
