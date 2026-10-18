<script setup lang="ts">
import { cortexFunctions } from './functions.ts';

defineProps<{
	openCharacters: any[];
	characterID: string | null;
	submode: string | null;
	playViewMode: string;
	isStudioPanelOpen?: boolean;
	studioPanelTab?: string;
	rollerCount?: number;
}>();

const emit = defineEmits<{
	( e: 'focus', id: string ): void;
	( e: 'close', id: string ): void;
	( e: 'add' ): void;
	( e: 'setPlayView', mode: string ): void;
	( e: 'toggleStudio', tab: 'properties' | 'roller' ): void;
}>();

function safeImageUrl( url: any ) {
	return cortexFunctions.safeImageUrl( url );
}
</script>

<template>
	<div class="session-nav" v-if="openCharacters.length > 0">
		<div class="session-nav-inner">
			<!-- LEFT ANCHOR: PROPERTIES HANDLE -->
			<button
				type="button"
				class="sheet-bar-btn sheet-bar-properties"
				:class="{ active: isStudioPanelOpen && studioPanelTab === 'properties' }"
				@click.stop="emit('toggleStudio', 'properties')"
				title="Properties"
				v-if="!isStudioPanelOpen"
			>
				<i class="fas fa-sliders"></i>
				<span class="sheet-bar-btn-label">Properties</span>
			</button>

			<div class="session-tabs">
				<div
					v-for="c in openCharacters"
					:key="c.id"
					:class="['session-tab', { active: c.id === characterID }]"
					@click.stop="emit('focus', c.id)"
					:title="'Switch to ' + (c.name || 'Character')"
				>
					<div class="session-tab-avatar" v-if="c.portrait && c.portrait.url" :style="'background-image:url(' + safeImageUrl(c.portrait.url) + ')'"></div>
					<div class="session-tab-icon" v-else><i class="fas fa-shield-alt"></i></div>
					<span class="session-tab-name">{{ c.name || 'Unnamed' }}</span>
					<button
						type="button"
						class="session-tab-close"
						@click.stop="emit('close', c.id)"
						v-if="openCharacters.length > 1"
						title="Close from session"
					><i class="fas fa-times"></i></button>
				</div>

				<button
					type="button"
					class="btn-session-add"
					@click.stop="emit('add')"
					title="Open another character alongside"
				>
					<i class="fas fa-plus"></i> <span>Open Sheet</span>
				</button>
			</div>

			<!-- RIGHT ANCHOR: ROLLER HANDLE & VIEW CONTROLS -->
			<div class="session-nav-right">
				<div class="session-view-controls" v-if="submode === 'play' && openCharacters.length > 1">
					<div class="session-view-segmented">
						<button
							type="button"
							:class="{ active: playViewMode === 'split' }"
							@click.stop="emit('setPlayView', 'split')"
							title="Side-by-side view (all open characters)"
						>
							<i class="fas fa-columns"></i> Side-by-Side ({{ openCharacters.length }})
						</button>
						<button
							type="button"
							:class="{ active: playViewMode === 'tabs' }"
							@click.stop="emit('setPlayView', 'tabs')"
							title="Single sheet tabbed view"
						>
							<i class="fas fa-window-maximize"></i> Tabbed
						</button>
					</div>
				</div>

				<button
					type="button"
					class="sheet-bar-btn sheet-bar-roller"
					:class="{ active: isStudioPanelOpen && studioPanelTab === 'roller' }"
					@click.stop="emit('toggleStudio', 'roller')"
					title="Dice Roller"
					v-if="!isStudioPanelOpen"
				>
					<i class="fas fa-dice-d20"></i>
					<span class="sheet-bar-btn-label">Roller</span>
					<span class="sheet-bar-dice-count" v-if="rollerCount && rollerCount > 0">{{ rollerCount }}</span>
				</button>
			</div>
		</div>
	</div>
</template>
