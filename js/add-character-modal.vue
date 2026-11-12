<script setup lang="ts">
import ModalDialog from './modal-dialog.vue';
import { characterCurioFunctions } from './functions.ts';

defineProps<{
	open: boolean;
	items: any[];
	search: string;
}>();

const emit = defineEmits<{
	(e: 'update:open', value: boolean): void;
	(e: 'update:search', value: string): void;
	(e: 'openAlongside', id: string): void;
	(e: 'gotoRoster'): void;
}>();

function safeImageUrl(url: any) {
	return characterCurioFunctions.safeImageUrl(url);
}

function targetValue(e: Event) {
	return (e.target as HTMLInputElement).value;
}
</script>

<template>
	<ModalDialog
		:open="open"
		label="Open character in session"
		dialog-class="modal-session-add"
		@close="emit('update:open', false)"
	>
		<button type="button" class="modal-close" aria-label="Close" @click.prevent="emit('update:open', false)">
			<i class="fas fa-times" aria-hidden="true"></i>
		</button>
		<div class="modal-inner">
			<div class="session-modal-header">
				<h2><i class="fas fa-users" aria-hidden="true"></i> Open Character in Session</h2>
				<p>Select another character, titan mech, vehicle, or companion to open alongside your active sheet.</p>
				<search class="session-modal-search">
					<i class="fas fa-search" aria-hidden="true"></i>
					<input
						type="text"
						id="session-character-search"
						name="sessionCharacterSearch"
						:value="search"
						@input="emit('update:search', targetValue($event))"
						placeholder="Filter characters..."
						aria-label="Filter characters"
					/>
				</search>
			</div>

			<div class="session-modal-list">
				<div v-for="c in items" :key="c.id" class="session-modal-item">
					<div class="session-item-info">
						<img
							v-if="c.portrait && c.portrait.url"
							class="session-item-avatar"
							:src="safeImageUrl(c.portrait.url)"
							alt=""
							width="36"
							height="36"
							loading="lazy"
							decoding="async"
						/>
						<div class="session-item-icon" v-else aria-hidden="true"><i class="fas fa-shield-alt"></i></div>
						<div class="session-item-text">
							<div class="session-item-name">{{ c.name || 'Unnamed' }}</div>
							<div class="session-item-sub">{{ c.game || c.description || 'Character' }}</div>
						</div>
					</div>
					<button type="button" class="btn-session-open" @click.stop="emit('openAlongside', c.id)">
						<i class="fas fa-columns" aria-hidden="true"></i> Open Alongside
					</button>
				</div>

				<div class="session-modal-empty" v-if="items.length === 0">
					<p>No additional characters available in your roster.</p>
					<button type="button" class="btn-session-library" @click.stop="emit('gotoRoster')">
						<i class="fas fa-layer-group" aria-hidden="true"></i> Go to Roster / Library
					</button>
				</div>
			</div>
		</div>
	</ModalDialog>
</template>
