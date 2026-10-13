<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const {
	styleBody, imageURL, imageFileInput, uploadError, imageAlignment, imageHeight, imageCaption,
	uploadImageStart, uploadImageProcess, removeImage
} = injectTraitSetEditor();
</script>

<template>
	<!-- IMAGE CONTENT -->
	<div class="editor-field" v-if="styleBody === 'image'">
		<label>Illustration / Image</label>

		<div class="image-set-preview" v-if="imageURL" style="margin-bottom: 0.5rem;">
			<img :src="imageURL" style="max-height: 120px; border-radius: 4px; display: block; border: 1px solid #cbd5e1; margin-bottom: 0.5rem;">
		</div>

		<div class="editor-button-container" style="margin-bottom: 0.5rem;">
			<div class="editor-button-container-inner">
				<div class="editor-button" @click.prevent="uploadImageStart">
					<span><i class="fas fa-upload"></i> {{ imageURL ? 'Replace' : 'Upload' }} Image</span>
				</div>
				<div class="editor-button" v-if="imageURL" style="background: #ef4444; color: #ffffff;" @click.prevent="removeImage" title="Remove image">
					<span><i class="fas fa-trash-alt"></i> Remove</span>
				</div>
			</div>
		</div>

		<input type="file" ref="imageFileInput" style="display:none" @change="uploadImageProcess" accept="image/*">

		<div class="editor-upload-error" v-if="uploadError">{{ uploadError }}</div>

		<div style="margin-top: 0.5rem;">
			<label style="font-size: 0.75rem; color: #64748b;">Or Image URL</label>
			<input type="text" v-model.lazy="imageURL" placeholder="https://example.com/illustration.jpg">
		</div>
	</div>

	<div class="editor-field" v-if="styleBody === 'image'">
		<label>Alignment / Focus</label>
		<div class="editor-portrait-alignment">
			<div @click.stop="imageAlignment = 'top-left'"      :class="{'active': imageAlignment === 'top-left' }"></div>
			<div @click.stop="imageAlignment = 'top-center'"    :class="{'active': imageAlignment === 'top-center' }"></div>
			<div @click.stop="imageAlignment = 'top-right'"     :class="{'active': imageAlignment === 'top-right' }"></div>
			<div @click.stop="imageAlignment = 'center-left'"   :class="{'active': imageAlignment === 'center-left' }"></div>
			<div @click.stop="imageAlignment = 'center'"        :class="{'active': imageAlignment === 'center' }"></div>
			<div @click.stop="imageAlignment = 'center-right'"  :class="{'active': imageAlignment === 'center-right' }"></div>
			<div @click.stop="imageAlignment = 'bottom-left'"   :class="{'active': imageAlignment === 'bottom-left' }"></div>
			<div @click.stop="imageAlignment = 'bottom-center'" :class="{'active': imageAlignment === 'bottom-center' }"></div>
			<div @click.stop="imageAlignment = 'bottom-right'"  :class="{'active': imageAlignment === 'bottom-right' }"></div>
		</div>
	</div>

	<div class="editor-field" v-if="styleBody === 'image'">
		<label>Display Height</label>
		<select v-model="imageHeight">
			<option value="auto">Auto / Proportional</option>
			<option value="120px">Small (120px)</option>
			<option value="180px">Medium (180px)</option>
			<option value="240px">Large (240px)</option>
			<option value="320px">Extra Large (320px)</option>
		</select>
	</div>

	<div class="editor-field" v-if="styleBody === 'image'">
		<label>Caption</label>
		<input type="text" v-model="imageCaption" placeholder="Optional image caption...">
	</div>
</template>
