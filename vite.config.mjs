import { defineConfig, createLogger } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readSelfHostedFonts() {
	try {
		const css = fs.readFileSync(path.resolve(__dirname, 'css/fonts.css'), 'utf8');
		const seen = new Set();
		const list = [];
		for (const m of css.matchAll(/font-family:\s*['"]([^'"]+)['"]/g)) {
			const fam = m[1].trim();
			const low = fam.toLowerCase();
			if (fam && !seen.has(low)) {
				seen.add(low);
				list.push(fam);
			}
		}
		if (list.length > 0) return list;
	} catch {
		// fall back to base defaults
	}
	return ['Josefin Sans', 'Open Sans', 'Alegreya Sans SC'];
}

const logger = createLogger();
const originalWarn = logger.warn;
logger.warn = (msg, options) => {
	if (msg.includes('build.outDir must not be the same directory of root')) return;
	originalWarn(msg, options);
};

export default defineConfig(({ mode, command }) => ({
	customLogger: logger,
	plugins: [
		{
			name: 'clean-js-chunks',
			buildStart() {
				if (command === 'build') {
					fs.rmSync(path.resolve(__dirname, 'js/chunks'), { recursive: true, force: true });
				}
			},
		},
		vue({
			template: {
				transformAssetUrls: false,
				compilerOptions: {
					isCustomElement: (tag) => tag === 'search',
				},
			},
		}),
	],
	define: {
		'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
		'process.env': {},
		__VUE_OPTIONS_API__: false,
		__VUE_PROD_DEVTOOLS__: false,
		__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
		__SELF_HOSTED_FONTS__: JSON.stringify(readSelfHostedFonts()),
	},
	resolve: {
		alias: {
			vue: 'vue/dist/vue.runtime.esm-bundler.js',
		},
	},
	build: {
		target: 'es2022',
		outDir: '.',
		emptyOutDir: false,
		sourcemap: mode === 'development',
		cssMinify: true,
		cssCodeSplit: false,
		chunkSizeWarningLimit: 2000,
		lib: {
			entry: path.resolve(__dirname, 'js/app.js'),
			formats: ['es'],
			fileName: () => 'js/app.min.js',
			cssFileName: 'css/app.min',
		},
		rollupOptions: {
			output: {
				chunkFileNames: 'js/chunks/[name]-[hash].js',
				manualChunks(id) {
					const norm = id.replace(/\\/g, '/');
					if (norm.includes('/node_modules/')) return 'core';
					if (
						/\/js\/(?:functions|model|model\.generated|layered-materialize|character-curio-trait-helpers|clone-deep|dice-pool|curiosity-graph|sheet-grid|color-palette|frame-geometry|font-url|self-hosted-fonts|showcase-templates|storage|use-toast|use-history|use-trait-set)\.(?:ts|js)$/.test(
							norm,
						) ||
						/\/js\/(?:modal-dialog|visibility-eye|inline-rating-bar|preset-gallery-card|portrait-ring|trait-row-title|trait-row-rating|trait-row-part|trait-set-frame|trait-set-block|trait-set-name|trait-set-pips|trait-set-list|trait-set-image|trait-set-die-rows|trait-set-dice-count|trait-set-subtrait-columns|trait-set-curiosity)\.vue(?:\?|$)/.test(
							norm,
						)
					) {
						return 'core';
					}
					if (
						/\/js\/(?:use-trait-set-editor\.ts|(?:tag-editor|color-picker|font-picker|page-layout-mini|trait-set-editor-(?:confirm|dice|image|layout|ring|row-mini))\.vue)(?:\?|$)/.test(
							norm,
						)
					) {
						return 'editor-shared';
					}
				},
			},
		},
	},
}));
