<script setup lang="ts">
import { computed } from 'vue';
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import VisibilityEye from './visibility-eye.vue';

const {
	styleBody,
	isName,
	isRing,
	imageURL,
	imageFileInput,
	uploadError,
	imageAlignment,
	imageZoom,
	imageHeight,
	imageWidth,
	imageCaption,
	namePortraitVisibility,
	toggleNamePortraitVisibility,
	uploadImageStart,
	uploadImageProcess,
	removeImage,
	traitSetID,
} = injectTraitSetEditor();

const showImageEditor = computed(() => styleBody.value === 'image' || isName.value || isRing.value);
</script>

<template>
	<!-- IMAGE CONTENT -->
	<div class="editor-field" v-if="showImageEditor">
		<div class="name-heading-row editor-row-between mb-xs">
			<label class="m-0">Illustration / Image</label>
			<VisibilityEye v-if="isName" :state="namePortraitVisibility" @toggle="toggleNamePortraitVisibility" />
		</div>

		<div class="image-set-preview mb-md" v-if="imageURL">
			<img :src="imageURL" class="editor-watermark-preview-img mb-md" />
		</div>

		<div class="editor-button-container mb-md">
			<div class="editor-button-container-inner">
				<div class="editor-button" @click.prevent="uploadImageStart">
					<span><i class="fas fa-upload"></i> {{ imageURL ? 'Replace' : 'Upload' }} Image</span>
				</div>
				<div
					class="editor-button editor-btn-danger-mini"
					v-if="imageURL"
					@click.prevent="removeImage"
					title="Remove image"
				>
					<span><i class="fas fa-trash-alt"></i> Remove</span>
				</div>
			</div>
		</div>

		<input
			type="file"
			:id="'trait-set-' + traitSetID + '-image-file'"
			name="imageFile"
			ref="imageFileInput"
			class="sr-only"
			@change="uploadImageProcess"
			accept="image/*"
			aria-label="Upload image file"
		/>

		<div class="editor-upload-error" v-if="uploadError">{{ uploadError }}</div>

		<div class="mt-md">
			<label :for="'trait-set-' + traitSetID + '-image-url'" class="editor-sub-label">Or Image URL</label>
			<input
				type="text"
				:id="'trait-set-' + traitSetID + '-image-url'"
				name="imageURL"
				v-model.lazy="imageURL"
				placeholder="https://example.com/illustration.jpg"
			/>
		</div>
	</div>

	<div class="editor-field" v-if="showImageEditor">
		<label>Alignment / Focus</label>
		<div class="editor-portrait-alignment">
			<div @click.stop="imageAlignment = 'top-left'" :class="{ active: imageAlignment === 'top-left' }"></div>
			<div @click.stop="imageAlignment = 'top-center'" :class="{ active: imageAlignment === 'top-center' }"></div>
			<div @click.stop="imageAlignment = 'top-right'" :class="{ active: imageAlignment === 'top-right' }"></div>
			<div @click.stop="imageAlignment = 'center-left'" :class="{ active: imageAlignment === 'center-left' }"></div>
			<div @click.stop="imageAlignment = 'center'" :class="{ active: imageAlignment === 'center' }"></div>
			<div @click.stop="imageAlignment = 'center-right'" :class="{ active: imageAlignment === 'center-right' }"></div>
			<div @click.stop="imageAlignment = 'bottom-left'" :class="{ active: imageAlignment === 'bottom-left' }"></div>
			<div @click.stop="imageAlignment = 'bottom-center'" :class="{ active: imageAlignment === 'bottom-center' }"></div>
			<div @click.stop="imageAlignment = 'bottom-right'" :class="{ active: imageAlignment === 'bottom-right' }"></div>
		</div>
	</div>

	<div class="editor-field" v-if="showImageEditor">
		<div class="editor-row-between">
			<label class="m-0">Zoom</label>
			<span class="slider-val">{{ Math.round((imageZoom ?? 1) * 100) }}%</span>
		</div>
		<input
			type="range"
			:id="'trait-set-' + traitSetID + '-image-zoom'"
			name="imageZoom"
			aria-label="Image Zoom"
			min="0.5"
			max="2"
			step="0.05"
			v-model.number="imageZoom"
		/>
	</div>

	<div class="editor-field" v-if="styleBody === 'image'">
		<label :for="'trait-set-' + traitSetID + '-image-width'">Display Width</label>
		<select :id="'trait-set-' + traitSetID + '-image-width'" name="imageWidth" v-model="imageWidth">
			<option value="25%">25%</option>
			<option value="50%">50%</option>
			<option value="75%">75%</option>
			<option value="100%">100%</option>
		</select>
	</div>

	<div class="editor-field" v-if="styleBody === 'image' || isName">
		<label :for="'trait-set-' + traitSetID + '-image-height'">Display Height</label>
		<select :id="'trait-set-' + traitSetID + '-image-height'" name="imageHeight" v-model="imageHeight">
			<option value="auto">Auto</option>
			<option value="120px">Small</option>
			<option value="180px">Medium</option>
			<option value="240px">Large</option>
			<option value="320px">Extra Large</option>
		</select>
	</div>

	<div class="editor-field" v-if="styleBody === 'image' || isName">
		<label :for="'trait-set-' + traitSetID + '-image-caption'">Caption</label>
		<input
			type="text"
			:id="'trait-set-' + traitSetID + '-image-caption'"
			name="imageCaption"
			v-model="imageCaption"
			placeholder="Optional image caption..."
		/>
	</div>
</template>
