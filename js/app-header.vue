<script setup lang="ts">
defineProps<{
	mode: string;
	submode: string | null;
	hasCharacter: boolean;
	canPlay?: boolean;
	canUndo: boolean;
	canRedo: boolean;
	isDarkMode?: boolean;
}>();

const emit = defineEmits<{
	(e: 'navigate', mode: string, submode: string | null): void;
	(e: 'undo'): void;
	(e: 'redo'): void;
	(e: 'toggleTheme'): void;
	(e: 'openPalette'): void;
}>();
</script>

<template>
	<header class="header">
		<div class="header-inner">
			<nav class="nav-mode" aria-label="Sheet view">
				<ul>
					<li :class="{ active: mode === 'roster' }">
						<button
							type="button"
							class="nav-item-btn"
							:aria-current="mode === 'roster' ? 'page' : undefined"
							aria-label="Roster"
							@click.stop="emit('navigate', 'roster', null)"
						>
							<span class="nav-icon"><i class="fas fa-users" aria-hidden="true"></i></span>
						</button>
					</li>
					<li :class="{ active: mode === 'character' && submode === 'edit', disabled: !hasCharacter }">
						<button
							type="button"
							class="nav-item-btn"
							:disabled="!hasCharacter"
							:aria-current="mode === 'character' && submode === 'edit' ? 'page' : undefined"
							aria-label="Create"
							@click.stop="emit('navigate', 'character', 'edit')"
						>
							<span class="nav-icon"><i class="fas fa-pencil" aria-hidden="true"></i></span>
							<span class="nav-label">Create</span>
						</button>
					</li>
					<li
						:class="{
							active: mode === 'character' && submode === 'play',
							disabled: canPlay !== undefined ? !canPlay : !hasCharacter,
						}"
					>
						<button
							type="button"
							class="nav-item-btn"
							:disabled="canPlay !== undefined ? !canPlay : !hasCharacter"
							:aria-current="mode === 'character' && submode === 'play' ? 'page' : undefined"
							aria-label="Play"
							@click.stop="emit('navigate', 'character', 'play')"
						>
							<span class="nav-icon"><i class="fas fa-dice" aria-hidden="true"></i></span>
							<span class="nav-label">Play</span>
						</button>
					</li>
					<li :class="{ active: mode === 'character' && submode === 'print', disabled: !hasCharacter }">
						<button
							type="button"
							class="nav-item-btn"
							:disabled="!hasCharacter"
							:aria-current="mode === 'character' && submode === 'print' ? 'page' : undefined"
							aria-label="Print"
							@click.stop="emit('navigate', 'character', 'print')"
						>
							<span class="nav-icon"><i class="fas fa-print" aria-hidden="true"></i></span>
							<span class="nav-label">Print</span>
						</button>
					</li>
					<li v-if="mode === 'character' && submode === 'edit'" :class="{ disabled: !canUndo }">
						<button
							type="button"
							class="nav-item-btn"
							:disabled="!canUndo"
							aria-label="Undo"
							title="Undo (Ctrl+Z)"
							@click.stop="emit('undo')"
						>
							<span class="nav-icon"><i class="fas fa-undo" aria-hidden="true"></i></span>
							<span class="nav-label">Undo</span>
						</button>
					</li>
					<li v-if="mode === 'character' && submode === 'edit'" :class="{ disabled: !canRedo }">
						<button
							type="button"
							class="nav-item-btn"
							:disabled="!canRedo"
							aria-label="Redo"
							title="Redo (Ctrl+Y)"
							@click.stop="emit('redo')"
						>
							<span class="nav-icon"><i class="fas fa-redo" aria-hidden="true"></i></span>
							<span class="nav-label">Redo</span>
						</button>
					</li>
				</ul>
			</nav>
			<div class="header-actions">
				<button
					type="button"
					class="header-btn-search"
					@click.stop="emit('openPalette')"
					aria-label="Quick search and command palette"
					title="Quick search (Ctrl+K)"
				>
					<i class="fas fa-search" aria-hidden="true"></i>
				</button>
				<button
					type="button"
					class="header-btn-theme"
					@click.stop="emit('toggleTheme')"
					:aria-pressed="Boolean(isDarkMode)"
					:aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
					:title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
				>
					<i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'" aria-hidden="true"></i>
				</button>
			</div>
		</div>
	</header>
</template>
