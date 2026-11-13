<script setup lang="ts">
defineProps<{
	mode: string;
	year: number;
}>();

const emit = defineEmits<{
	(e: 'navigate', mode: string, submode: string | null): void;
}>();
</script>

<template>
	<footer class="footer" :class="'footer-mode-' + (mode || 'roster')">
		<div class="footer-inner">
			<div class="footer-colophon">
				<a href="#" @click.prevent="emit('navigate', 'about', null)"
					><img src="images/favicon.ico" alt="Character Curio" width="32" height="32" decoding="async"
				/></a>
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
