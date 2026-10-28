<script setup lang="ts">
import { computed, ref } from 'vue';
import { cortexFunctions } from './functions.ts';
import { getView, ensureView, nextVisibility, type Character, type Visibility } from './model.ts';
import VisibilityEye from './visibility-eye.vue';

const props = defineProps<{
	character: Character;
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
		return getView( props.character?.portrait )?.size ?? 'classic';
	},
	set( value: string ) {
		setCustomProperty( 'size', value );
	},
} );

const location = computed( {
	get() {
		return getView( props.character?.portrait )?.location ?? 'header';
	},
	set( value: string ) {
		setCustomProperty( 'location', value );
	},
} );

const alignment = computed( {
	get() {
		return getView( props.character?.portrait )?.alignment ?? 'top-center';
	},
	set( value: string ) {
		setAlignment( value );
	},
} );

function selectElement( selector: any[] ) {
	emit( 'selectElement', selector );
}

function targetValue( e: Event ) {
	return ( e?.target as HTMLInputElement )?.value ?? '';
}

// Caption text lives on the caption name-trait's label (the trait has no
// separate label word); portrait visibility gates the portrait zone.
function captionText() {
	const t = cortexFunctions.getNameTrait( props.character, 'caption' );
	const v = t?.label;
	return typeof v === 'string' ? v : '';
}

function setCaptionText( val: string ) {
	const t = cortexFunctions.ensureNameTrait( props.character, 'caption' );
	if ( !t ) return;
	if ( typeof val === 'string' && val.trim().length ) t.label = val.trim();
	else delete t.label;
	updateCharacter( props.character );
}

function portraitVisibility() {
	const t = cortexFunctions.getNameTrait( props.character, 'portrait' );
	const v = getView( t ) as Record<string, unknown> | undefined;
	const word = v?.visibility;
	if ( word === 'hidden' || word === 'editor-only' || word === 'play-only' || word === 'shown' ) return word;
	return 'shown';
}

function togglePortraitVisibility() {
	const cur = portraitVisibility();
	const next = nextVisibility( cur as Visibility );
	const t = cortexFunctions.ensureNameTrait( props.character, 'portrait' );
	if ( !t ) return;
	const v = ensureView( t ) as Record<string, unknown>;
	if ( next === 'shown' ) {
		delete v.visibility;
	} else {
		v.visibility = next;
	}
	updateCharacter( props.character );
}

function ensurePortraitStruct() {
	if ( !props.character ) return;
	if ( !props.character.portrait ) {
		props.character.portrait = structuredClone( cortexFunctions.defaultCharacter.portrait || { url: '', view: {} } );
	}
	ensureView( props.character.portrait );
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
	ensureView( props.character.portrait ).size = 'none';
	updateCharacter( props.character );
	selectElement( [] );
}

function setCustomProperty( key: string, value: any ) {
	ensurePortraitStruct();
	ensureView( props.character.portrait )[ key ] = value;
	updateCharacter( props.character );
}

function setAlignment( value: string ) {
	ensurePortraitStruct();
	ensureView( props.character.portrait ).alignment = value;
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
						<label for="portrait-field-size">Portrait Size / Style</label>
						<select id="portrait-field-size" name="portraitSize" v-model="size">
							<option value="classic">Classic</option>
							<option value="spotlight">Small Portrait</option>
							<option value="none">Hidden</option>
						</select>
					</div>

					<div class="editor-field" v-if="size !== 'none'">
						<label for="portrait-field-location">Placement</label>
						<select id="portrait-field-location" name="portraitLocation" v-model="location">
							<option value="header">Header</option>
							<option value="right">Right Column</option>
							<option value="left">Left Column</option>
						</select>
					</div>

					<div class="editor-field" v-if="size !== 'none'">

						<div class="editor-label">Image Source</div>

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

						<input id="portrait-field-file" name="portraitFile" class="portrait-input" type="file" ref="inputFile" @change="uploadProcess" accept="image/*">

						<div class="editor-upload-error" v-if="uploadError">{{ uploadError }}</div>

						<div style="margin-top: 0.5rem;">
							<label for="portrait-field-url" style="font-size: 0.75rem; color: #64748b;">Or Image URL</label>
							<input id="portrait-field-url" name="portraitUrl" type="text" v-model.lazy="imageURL" placeholder="https://example.com/portrait.jpg">
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

						<div class="editor-label">Alignment / Focus</div>

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

					<div class="editor-field">
						<div class="name-heading-row">
							<label for="portrait-field-caption">Caption</label>
							<visibility-eye :state="portraitVisibility()" @toggle="togglePortraitVisibility()" title="Portrait visibility" />
						</div>
						<input type="text" id="portrait-field-caption" name="portraitCaption" :value="captionText()" @change="setCaptionText(targetValue($event))" placeholder="Caption under the portrait">
					</div>

				</div>

			</div>
		</div>

	</aside>
</template>
