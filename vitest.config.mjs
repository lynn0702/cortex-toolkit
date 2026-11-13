import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [
		vue({
			template: {
				transformAssetUrls: false,
				compilerOptions: {
					isCustomElement: (tag) => tag === 'search',
				},
			},
		}),
	],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/setup.ts'],
	},
});
