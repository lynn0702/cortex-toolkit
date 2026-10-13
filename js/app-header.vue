<script setup lang="ts">
defineProps<{
	mode: string;
	submode: string | null;
	hasCharacter: boolean;
	canUndo: boolean;
	canRedo: boolean;
	isRollerOpen: boolean;
	rollerCount: number;
}>();

const emit = defineEmits<{
	( e: 'navigate', mode: string, submode: string | null ): void;
	( e: 'toggleRoller' ): void;
	( e: 'undo' ): void;
	( e: 'redo' ): void;
}>();
</script>

<template>
	<header class="header">
		<div class="header-inner">
			<nav class="nav-mode">
				<ul>
					<li @click.stop="emit('navigate', 'roster', null)" :class="{ active: mode === 'roster' }"><div><span class="nav-icon"><i class="fas fa-users"></i></span></div></li>
					<li @click.stop="emit('navigate', 'character', 'edit')" :class="{ active: mode === 'character' && submode === 'edit', 'disabled': !hasCharacter }"><div><span class="nav-icon"><i class="fas fa-pencil"></i></span> <span class="nav-label">Create</span></div></li>
					<li @click.stop="emit('navigate', 'character', 'play')" :class="{ active: mode === 'character' && submode === 'play', 'disabled': !hasCharacter }"><div><span class="nav-icon"><i class="fas fa-dice"></i></span> <span class="nav-label">Play</span></div></li>
					<li v-if="mode === 'character' && submode === 'play'" @click.stop="emit('toggleRoller')" :class="{ active: isRollerOpen }"><div><span class="nav-icon"><i class="fas fa-dice-d20"></i></span> <span class="nav-label">Roller ({{ rollerCount }})</span></div></li>
					<li @click.stop="emit('navigate', 'character', 'print')" :class="{ active: mode === 'character' && submode === 'print', 'disabled': !hasCharacter }"><div><span class="nav-icon"><i class="fas fa-print"></i></span> <span class="nav-label">Print</span></div></li>
					<li v-if="mode === 'character' && submode === 'edit'" @click.stop="emit('undo')" :class="{ disabled: !canUndo }" title="Undo (Ctrl+Z)"><div><span class="nav-icon"><i class="fas fa-undo"></i></span> <span class="nav-label">Undo</span></div></li>
					<li v-if="mode === 'character' && submode === 'edit'" @click.stop="emit('redo')" :class="{ disabled: !canRedo }" title="Redo (Ctrl+Y)"><div><span class="nav-icon"><i class="fas fa-redo"></i></span> <span class="nav-label">Redo</span></div></li>
				</ul>
			</nav>
		</div>
	</header>
</template>
