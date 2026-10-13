<script setup lang="ts">
import { cortexFunctions } from './functions.ts';

defineProps<{
	open: boolean;
	items: any[];
	search: string;
}>();

const emit = defineEmits<{
	( e: 'update:open', value: boolean ): void;
	( e: 'update:search', value: string ): void;
	( e: 'openAlongside', id: string ): void;
	( e: 'gotoRoster' ): void;
}>();

function safeImageUrl( url: any ) {
	return cortexFunctions.safeImageUrl( url );
}

function targetValue( e: Event ) {
	return ( e.target as HTMLInputElement ).value;
}
</script>

<template>
	<transition>
	<div class="modal-veil" v-show="open" @click.stop="emit('update:open', false)"></div>
	</transition>

	<transition>
	<aside class="modal modal-session-add" v-if="open">
		<div class="modal-close" @click.prevent="emit('update:open', false)"><i class="fas fa-times"></i></div>
		<div class="modal-inner">
			<div class="session-modal-header">
				<h2><i class="fas fa-users"></i> Open Character in Session</h2>
				<p>Select another character, titan mech, vehicle, or companion to open alongside your active sheet.</p>
				<div class="session-modal-search">
					<i class="fas fa-search"></i>
					<input type="text" :value="search" @input="emit('update:search', targetValue($event))" placeholder="Filter characters...">
				</div>
			</div>

			<div class="session-modal-list">
				<div
					v-for="c in items"
					:key="c.id"
					class="session-modal-item"
				>
					<div class="session-item-info">
						<div class="session-item-avatar" v-if="c.portrait && c.portrait.url" :style="'background-image:url(' + safeImageUrl(c.portrait.url) + ')'"></div>
						<div class="session-item-icon" v-else><i class="fas fa-shield-alt"></i></div>
						<div class="session-item-text">
							<div class="session-item-name">{{ c.name || 'Unnamed' }}</div>
							<div class="session-item-sub">{{ c.game || c.description || 'Character' }}</div>
						</div>
					</div>
					<button
						type="button"
						class="btn-session-open"
						@click.stop="emit('openAlongside', c.id)"
					>
						<i class="fas fa-columns"></i> Open Alongside
					</button>
				</div>

				<div class="session-modal-empty" v-if="items.length === 0">
					<p>No additional characters available in your roster.</p>
					<button type="button" class="btn-session-spotlight" @click.stop="emit('gotoRoster')">
						<i class="fas fa-layer-group"></i> Go to Roster / Spotlight Library
					</button>
				</div>
			</div>
		</div>
	</aside>
	</transition>
</template>
