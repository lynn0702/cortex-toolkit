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
	<footer class="footer">
		<div class="footer-inner">
			<div class="footer-colophon">
				<a href="#" @click.prevent="emit('navigate', 'about', null)"
					><img src="images/favicon.ico" alt="Character Curio"
				/></a>
			</div>

			<nav class="footer-nav">
				<ul>
					<li @click.stop="emit('navigate', 'about', null)" :class="{ active: mode === 'about' }">
						<div>
							<span class="nav-icon"><i class="far fa-question-circle"></i></span>
						</div>
					</li>
					<li>
						<a href="https://github.com/lynn0702/cortex-toolkit" target="_blank" title="View on GitHub"
							><div>
								<span class="nav-icon"><i class="fab fa-github"></i></span></div
						></a>
					</li>
				</ul>
			</nav>
		</div>
	</footer>
</template>
