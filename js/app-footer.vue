<script setup lang="ts">
defineProps<{
	mode: string;
	year: number;
}>();

const emit = defineEmits<{
	( e: 'navigate', mode: string, submode: string | null ): void;
}>();
</script>

<template>
	<footer class="footer">
		<div class="footer-inner">

			<div class="footer-colophon">
				<a href="https://www.cortexrpg.com" target="_blank"><picture><source srcset="images/cortex_prime_logo_light_background.webp" type="image/webp"><img src="images/cortex_prime_logo_light_background.png" alt="Cortex Prime"></picture></a>
			</div>

			<nav class="footer-nav">
				<ul>
					<li @click.stop="emit('navigate', 'about', null)" :class="{ active: mode === 'about' }"><div><span class="nav-icon"><i class="far fa-question-circle"></i></span></div></li>
					<li><a href="https://github.com/lynn0702/cortex-toolkit" target="_blank" title="View on GitHub"><div><span class="nav-icon"><i class="fab fa-github"></i></span></div></a></li>
				</ul>
			</nav>

		</div>
	</footer>
</template>
