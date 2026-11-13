<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';

defineProps<{
	mode: string;
	submode: string | null;
	hasCharacter: boolean;
	canPlay?: boolean;
	canUndo: boolean;
	canRedo: boolean;
	isDarkMode?: boolean;
	openCharacters?: any[];
	characterID?: string | null;
	activeCharacterName?: string;
	sessionDirty?: boolean;
	drawerState?: 'staged' | 'split' | 'full';
}>();

const emit = defineEmits<{
	(e: 'navigate', mode: string, submode: string | null): void;
	(e: 'undo'): void;
	(e: 'redo'): void;
	(e: 'toggleTheme'): void;
	(e: 'openPalette'): void;
	(e: 'focusCharacter', id: string): void;
	(e: 'closeCharacter', id: string): void;
	(e: 'addCharacter'): void;
	(e: 'saveSession'): void;
	(e: 'openSheetProperties'): void;
}>();

const supportsNativePopover =
	typeof HTMLElement !== 'undefined' && Object.prototype.hasOwnProperty.call(HTMLElement.prototype, 'popover');
const sheetTriggerRef = ref<HTMLButtonElement | null>(null);
const sheetPopoverRef = ref<HTMLElement | null>(null);
const isFallbackPopoverOpen = ref(false);

function closeSheetPopover() {
	isFallbackPopoverOpen.value = false;
	const el = sheetPopoverRef.value as any;
	if (el && typeof el.hidePopover === 'function') {
		try {
			el.hidePopover();
		} catch (_err) {}
	}
}

function onSheetTriggerClick() {
	if (!supportsNativePopover) {
		isFallbackPopoverOpen.value = !isFallbackPopoverOpen.value;
	}
}

function onAction(fn: () => void) {
	closeSheetPopover();
	fn();
}

function onSelectCharacter(id: string) {
	closeSheetPopover();
	emit('focusCharacter', id);
}

function onFallbackKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape') {
		isFallbackPopoverOpen.value = false;
		sheetTriggerRef.value?.focus();
	}
}

function onFallbackPointerDown(e: Event) {
	const t = e.target as Node | null;
	if (!t) return;
	if (sheetPopoverRef.value?.contains(t) || sheetTriggerRef.value?.contains(t)) return;
	isFallbackPopoverOpen.value = false;
}

watch(isFallbackPopoverOpen, (open) => {
	if (typeof document === 'undefined') return;
	if (open) {
		document.addEventListener('keydown', onFallbackKeydown);
		document.addEventListener('pointerdown', onFallbackPointerDown);
	} else {
		document.removeEventListener('keydown', onFallbackKeydown);
		document.removeEventListener('pointerdown', onFallbackPointerDown);
	}
});

onUnmounted(() => {
	if (typeof document !== 'undefined') {
		document.removeEventListener('keydown', onFallbackKeydown);
		document.removeEventListener('pointerdown', onFallbackPointerDown);
	}
});
</script>

<template>
	<header class="header" :data-mode="mode" :data-submode="submode || ''" :data-drawer-state="drawerState || 'staged'">
		<div class="header-inner">
			<nav class="nav-mode" aria-label="Sheet view">
				<ul>
					<li class="nav-item-roster" :class="{ active: mode === 'roster' }">
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
					<li
						class="nav-item-create"
						:class="{ active: mode === 'character' && submode === 'edit', disabled: !hasCharacter }"
					>
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
						class="nav-item-play"
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
					<li
						class="nav-item-print"
						:class="{ active: mode === 'character' && submode === 'print', disabled: !hasCharacter }"
					>
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
					<li
						class="nav-item-history"
						v-if="mode === 'character' && submode === 'edit'"
						:class="{ disabled: !canUndo }"
					>
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
					<li
						class="nav-item-history"
						v-if="mode === 'character' && submode === 'edit'"
						:class="{ disabled: !canRedo }"
					>
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

			<div v-if="mode === 'character' && hasCharacter" class="mobile-sheet-switcher">
				<button
					ref="sheetTriggerRef"
					type="button"
					class="mobile-sheet-trigger"
					:popovertarget="supportsNativePopover ? 'mobile-sheet-menu' : undefined"
					aria-label="Sheet actions"
					@click="onSheetTriggerClick"
				>
					<span class="mobile-sheet-trigger-name">{{ activeCharacterName || 'Unnamed' }}</span>
					<span v-if="sessionDirty" class="mobile-sheet-dirty-dot" aria-hidden="true"></span>
					<i class="fas fa-chevron-down mobile-sheet-chevron" aria-hidden="true"></i>
				</button>
				<div
					id="mobile-sheet-menu"
					ref="sheetPopoverRef"
					:popover="supportsNativePopover ? 'auto' : undefined"
					class="mobile-sheet-popover"
					:class="{ 'is-popover-fallback-open': isFallbackPopoverOpen }"
					aria-label="Sheet actions"
				>
					<div class="mobile-sheet-popover-body">
						<div v-if="openCharacters && openCharacters.length > 0" class="mobile-sheet-list">
							<div v-for="c in openCharacters" :key="c.id" class="mobile-sheet-row">
								<button
									type="button"
									class="mobile-sheet-item"
									:class="{ active: c.id === characterID }"
									:aria-current="c.id === characterID ? 'true' : undefined"
									@click="onSelectCharacter(c.id)"
								>
									<span class="mobile-sheet-item-name">{{ c.name || 'Unnamed' }}</span>
								</button>
								<button
									v-if="openCharacters.length > 1"
									type="button"
									class="mobile-sheet-item-close"
									:aria-label="'Close ' + (c.name || 'Unnamed') + ' from session'"
									@click.stop="onAction(() => emit('closeCharacter', c.id))"
								>
									<i class="fas fa-xmark" aria-hidden="true"></i>
								</button>
							</div>
						</div>

						<button type="button" class="mobile-sheet-action-btn" @click="onAction(() => emit('addCharacter'))">
							<i class="fas fa-plus" aria-hidden="true"></i>
							<span>Open Sheet</span>
						</button>

						<hr class="mobile-sheet-sep" />

						<button
							v-if="submode === 'play'"
							type="button"
							class="mobile-sheet-action-btn"
							@click="onAction(() => emit('saveSession'))"
						>
							<i class="fas fa-floppy-disk" aria-hidden="true"></i>
							<span>Save</span>
							<span v-if="sessionDirty" class="mobile-sheet-dirty-pill">Unsaved</span>
						</button>

						<template v-if="submode === 'edit'">
							<button
								type="button"
								class="mobile-sheet-action-btn"
								@click="onAction(() => emit('openSheetProperties'))"
							>
								<i class="fas fa-sliders" aria-hidden="true"></i>
								<span>Sheet Settings</span>
							</button>
							<button
								type="button"
								class="mobile-sheet-action-btn"
								:disabled="!canUndo"
								@click="onAction(() => emit('undo'))"
							>
								<i class="fas fa-undo" aria-hidden="true"></i>
								<span>Undo</span>
							</button>
							<button
								type="button"
								class="mobile-sheet-action-btn"
								:disabled="!canRedo"
								@click="onAction(() => emit('redo'))"
							>
								<i class="fas fa-redo" aria-hidden="true"></i>
								<span>Redo</span>
							</button>
						</template>

						<button
							type="button"
							class="mobile-sheet-action-btn"
							aria-label="Print"
							@click="onAction(() => emit('navigate', 'character', 'print'))"
						>
							<i class="fas fa-print" aria-hidden="true"></i>
							<span>Print</span>
						</button>

						<button
							type="button"
							class="mobile-sheet-action-btn"
							:aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
							@click="onAction(() => emit('toggleTheme'))"
						>
							<i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'" aria-hidden="true"></i>
							<span>{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
						</button>
					</div>
				</div>
			</div>

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
