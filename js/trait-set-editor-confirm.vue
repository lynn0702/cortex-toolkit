<script setup lang="ts">
import { injectTraitSetEditor } from './use-trait-set-editor.ts';

const { showDeleteConfirm, cancelDeleteTraitSet, confirmDeleteTraitSet, traitSet } = injectTraitSetEditor();
</script>

<template>
	<!-- DELETE TRAIT SET CONFIRMATION MODAL -->
	<teleport to="body">
		<transition>
			<div class="modal-veil" v-if="showDeleteConfirm" @click.stop="cancelDeleteTraitSet"></div>
		</transition>
		<transition>
			<aside class="modal modal-confirm" v-if="showDeleteConfirm">
				<div class="modal-close" @click.prevent="cancelDeleteTraitSet"><i class="fas fa-times"></i></div>
				<div class="modal-inner">
					<p>Are you sure you want to delete the trait set <strong>{{ traitSet.name && traitSet.name.length ? traitSet.name : 'this trait set' }}</strong> and all its traits?</p>
					<p class="modal-warning-text"><i class="fas fa-exclamation-triangle"></i> This action cannot be undone.</p>
					<div class="modal-button-container">
						<div class="modal-button-container-inner">
							<div class="modal-button modal-button-delete" @click.stop="confirmDeleteTraitSet">
								<span><i class="fas fa-trash"></i> Delete</span>
							</div>
							<div class="modal-button modal-button-no" @click.stop="cancelDeleteTraitSet">
								<span><i class="fas fa-times"></i> Cancel</span>
							</div>
						</div>
					</div>
				</div>
			</aside>
		</transition>
	</teleport>
</template>
