<script setup lang="ts">
import { computed } from 'vue';
import { injectTraitSetEditor } from './use-trait-set-editor.ts';
import TagEditor from './tag-editor.vue';
import VisibilityEye from './visibility-eye.vue';

const {
	styleBody,
	isName,
	imageURL,
	imageFileInput,
	uploadError,
	imageAlignment,
	imageZoom,
	imageHeight,
	imageWidth,
	imageCaption,
	portraitTags,
	namePortraitVisibility,
	toggleNamePortraitVisibility,
	uploadImageStart,
	uploadImageProcess,
	removeImage,
	traitSetID,
} = injectTraitSetEditor();

const showImageEditor = computed(() => styleBody.value === 'image' || isName.value);
</script>

<template>
	<!-- IMAGE CONTENT -->
	<div class="editor-field" v-if="showImageEditor">
		<div class="name-heading-row editor-row-between mb-xs">
			<label :for="'trait-set-' + traitSetID + '-image-url'" class="m-0">Illustration</label>
			<VisibilityEye v-if="isName" :state="namePortraitVisibility" @toggle="toggleNamePortraitVisibility" />
		</div>

		<div class="image-set-preview mb-sm" v-if="imageURL">
			<img :src="imageURL" :alt="imageCaption || 'Illustration preview'" class="editor-watermark-preview-img" />
		</div>

		<div class="editor-row-inline mb-sm">
			<button type="button" class="editor-button flex-1" @click.prevent="uploadImageStart">
				<span>
					<i class="fas fa-upload" aria-hidden="true"></i>
					{{ imageURL ? 'Replace' : 'Upload' }}
				</span>
			</button>
			<button
				type="button"
				class="editor-button editor-btn-danger-mini"
				v-if="imageURL"
				@click.prevent="removeImage"
				title="Remove image"
			>
				<span><i class="fas fa-trash-alt" aria-hidden="true"></i> Remove</span>
			</button>
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

		<input
			type="text"
			:id="'trait-set-' + traitSetID + '-image-url'"
			name="imageURL"
			v-model.lazy="imageURL"
			placeholder="Image URL (https://...)"
			autocorrect="off"
			autocapitalize="none"
			spellcheck="false"
		/>
	</div>

	<div class="editor-field" v-if="showImageEditor">
		<div class="editor-focus-zoom-row">
			<div>
				<div class="editor-label">Focus</div>
				<div class="editor-portrait-alignment">
					<button
						v-for="pos in [
							'top-left',
							'top-center',
							'top-right',
							'center-left',
							'center',
							'center-right',
							'bottom-left',
							'bottom-center',
							'bottom-right',
						]"
						:key="pos"
						type="button"
						:aria-label="'Align ' + pos.replace('-', ' ')"
						:aria-pressed="imageAlignment === pos"
						:class="{ active: imageAlignment === pos }"
						@click.stop="imageAlignment = pos"
					></button>
				</div>
			</div>
			<div class="editor-focus-zoom-slider">
				<div class="editor-row-between">
					<label :for="'trait-set-' + traitSetID + '-image-zoom'" class="m-0">Zoom</label>
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
		</div>
	</div>

	<div class="editor-grid-2" v-if="styleBody === 'image'">
		<div class="editor-field">
			<label :for="'trait-set-' + traitSetID + '-image-width'">Width</label>
			<select :id="'trait-set-' + traitSetID + '-image-width'" name="imageWidth" v-model="imageWidth">
				<option value="25%">25%</option>
				<option value="50%">50%</option>
				<option value="75%">75%</option>
				<option value="100%">100%</option>
			</select>
		</div>

		<div class="editor-field">
			<label :for="'trait-set-' + traitSetID + '-image-height'">Height</label>
			<select :id="'trait-set-' + traitSetID + '-image-height'" name="imageHeight" v-model="imageHeight">
				<option value="auto">Auto</option>
				<option value="120px">Small</option>
				<option value="180px">Medium</option>
				<option value="240px">Large</option>
				<option value="320px">Extra Large</option>
			</select>
		</div>
	</div>
	<div class="editor-field" v-else-if="isName">
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
			placeholder="Optional caption"
		/>
	</div>

	<div class="editor-field" v-if="isName">
		<TagEditor v-model="portraitTags" :input-id="'trait-set-' + traitSetID + '-portrait-tags'" label="Portrait Tags" />
	</div>
</template>
