<script setup lang="ts">
defineProps<{
	mode: string;
	year: number;
	showPlotPoints?: boolean;
	plotPoints?: number;
	plotPointsLabel?: string;
}>();

const emit = defineEmits<{
	(e: 'navigate', mode: string, submode: string | null): void;
	(e: 'adjustPlotPoints', delta: number): void;
}>();
</script>

<template>
	<footer class="footer" :class="'footer-mode-' + (mode || 'roster')">
		<div class="footer-inner">
			<div class="footer-left">
				<div class="character-pp-badge footer-pp-badge" v-if="showPlotPoints" @click.stop>
					<span class="pp-badge-label">{{ plotPointsLabel || 'PP' }}</span>
					<button
						type="button"
						class="btn-pp-step"
						@click.stop="emit('adjustPlotPoints', -1)"
						:disabled="(plotPoints ?? 0) <= 0"
						title="Spend Plot Point"
						aria-label="Spend Plot Point"
					>
						-
					</button>
					<span class="pp-count">{{ plotPoints ?? 0 }}</span>
					<button
						type="button"
						class="btn-pp-step"
						@click.stop="emit('adjustPlotPoints', 1)"
						title="Gain Plot Point"
						aria-label="Gain Plot Point"
					>
						+
					</button>
				</div>
				<div class="footer-colophon">
					<a href="#" @click.prevent="emit('navigate', 'about', null)"
						><img src="images/favicon.ico" alt="Character Curio" width="32" height="32" decoding="async"
					/></a>
				</div>
			</div>

			<nav class="footer-nav" aria-label="App navigation">
				<ul>
					<li :class="{ active: mode === 'about' }">
						<button
							type="button"
							class="nav-item-btn"
							aria-label="About"
							:aria-current="mode === 'about' ? 'page' : undefined"
							@click.stop="emit('navigate', 'about', null)"
						>
							<span class="nav-icon"><i class="far fa-question-circle" aria-hidden="true"></i></span>
						</button>
					</li>
				</ul>
			</nav>
		</div>
	</footer>
</template>
