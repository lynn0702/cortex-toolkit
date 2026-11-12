<script setup lang="ts">
import ModalDialog from './modal-dialog.vue';
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const { showDeleteConfirm, cancelDeleteTraitSet, confirmDeleteTraitSet, traitSet } = injectTraitSetEditor();
</script>

<template>
	<!-- DELETE TRAIT SET CONFIRMATION MODAL -->
	<ModalDialog
		:open="showDeleteConfirm"
		label="Delete trait set"
		dialog-class="modal-confirm"
		@close="cancelDeleteTraitSet"
	>
		<button type="button" class="modal-close" aria-label="Close" @click.prevent="cancelDeleteTraitSet">
			<i class="fas fa-times"></i>
		</button>
		<div class="modal-inner">
			<p>
				Are you sure you want to delete the trait set
				<strong>{{ traitSet.name && traitSet.name.length ? traitSet.name : 'this trait set' }}</strong> and all its
				traits?
			</p>
			<p class="modal-warning-text"><i class="fas fa-exclamation-triangle"></i> This action cannot be undone.</p>
			<div class="modal-button-container">
				<div class="modal-button-container-inner">
					<button type="button" class="modal-button modal-button-delete" @click.stop="confirmDeleteTraitSet">
						<span><i class="fas fa-trash"></i> Delete</span>
					</button>
					<button type="button" class="modal-button modal-button-no" @click.stop="cancelDeleteTraitSet">
						<span><i class="fas fa-times"></i> Cancel</span>
					</button>
				</div>
			</div>
		</div>
	</ModalDialog>
</template>
