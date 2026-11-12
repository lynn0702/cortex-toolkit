<script setup lang="ts">
import { characterCurioFunctions } from './functions.ts';

defineProps<{
	openCharacters: any[];
	characterID: string | null;
	submode: string | null;
	playViewMode: string;
	isStudioPanelOpen?: boolean;
	studioPanelTab?: string;
	rollerCount?: number;
	isDesktopPillars?: boolean;
}>();

const emit = defineEmits<{
	(e: 'focus', id: string): void;
	(e: 'close', id: string): void;
	(e: 'add'): void;
	(e: 'setPlayView', mode: string): void;
	(e: 'toggleStudio', tab: 'properties' | 'roller' | 'json'): void;
	(e: 'saveSession'): void;
	(e: 'togglePillars'): void;
}>();

function safeImageUrl(url: any) {
	return characterCurioFunctions.safeImageUrl(url);
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
				<i class="fas fa-sliders" aria-hidden="true"></i>
				<span class="sheet-bar-btn-label">Properties</span>
			</button>

			<div class="session-tabs">
				<div v-for="c in openCharacters" :key="c.id" :class="['session-tab', { active: c.id === characterID }]">
					<button
						type="button"
						class="session-tab-trigger"
						:aria-current="c.id === characterID ? 'true' : undefined"
						:title="'Switch to ' + (c.name || 'Character')"
						@click.stop="emit('focus', c.id)"
					>
						<img
							v-if="c.portrait && c.portrait.url"
							class="session-tab-avatar"
							:src="safeImageUrl(c.portrait.url)"
							alt=""
							width="22"
							height="22"
							loading="lazy"
							decoding="async"
						/>
						<span v-else class="session-tab-icon" aria-hidden="true"><i class="fas fa-shield-alt"></i></span>
						<span class="session-tab-name">{{ c.name || 'Unnamed' }}</span>
					</button>
					<button
						v-if="openCharacters.length > 1"
						type="button"
						class="session-tab-close"
						:aria-label="'Close ' + (c.name || 'Unnamed') + ' from session'"
						title="Close from session"
						@click.stop="emit('close', c.id)"
					>
						<i class="fas fa-times" aria-hidden="true"></i>
					</button>
				</div>

				<button
					type="button"
					class="btn-session-add"
					@click.stop="emit('add')"
					title="Open another character alongside"
				>
					<i class="fas fa-plus" aria-hidden="true"></i> <span>Open Sheet</span>
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
							<i class="fas fa-columns" aria-hidden="true"></i> Side-by-Side ({{ openCharacters.length }})
						</button>
						<button
							type="button"
							:class="{ active: playViewMode === 'tabs' }"
							@click.stop="emit('setPlayView', 'tabs')"
							title="Single sheet tabbed view"
						>
							<i class="fas fa-window-maximize" aria-hidden="true"></i> Tabbed
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
					<i class="fas fa-dice" aria-hidden="true"></i>
					<span class="sheet-bar-btn-label">Roller</span>
					<span class="sheet-bar-dice-count" v-if="rollerCount && rollerCount > 0">{{ rollerCount }}</span>
				</button>

				<button
					type="button"
					class="sheet-bar-btn sheet-bar-pillars"
					:class="{ active: isDesktopPillars }"
					@click.stop="emit('togglePillars')"
					title="Toggle Pillars deck view"
					v-if="submode === 'play'"
				>
					<i class="fas fa-building-columns" aria-hidden="true"></i>
					<span class="sheet-bar-btn-label">Pillars</span>
				</button>

				<button
					type="button"
					class="sheet-bar-btn sheet-bar-save"
					@click.stop="emit('saveSession')"
					title="Save session"
					v-if="submode === 'play'"
				>
					<i class="fas fa-floppy-disk" aria-hidden="true"></i>
					<span class="sheet-bar-btn-label">Save</span>
				</button>
			</div>
		</div>
	</div>
</template>
