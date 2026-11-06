import { defineConfig, createLogger } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logger = createLogger();
const originalWarn = logger.warn;
logger.warn = (msg, options) => {
	if (msg.includes('build.outDir must not be the same directory of root')) return;
	originalWarn(msg, options);
};

export default defineConfig(({ mode }) => ({
	customLogger: logger,
	plugins: [
		vue({
			template: {
				transformAssetUrls: false,
			},
		}),
	],
	define: {
		'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
		'process.env': {},
		__VUE_OPTIONS_API__: false,
		__VUE_PROD_DEVTOOLS__: false,
		__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
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
		chunkSizeWarningLimit: 2000,
		lib: {
			entry: path.resolve(__dirname, 'js/app.js'),
			name: 'CortexApp',
			formats: ['iife'],
			fileName: () => 'js/app.min.js',
			cssFileName: 'css/app.min',
		},
	},
}));
