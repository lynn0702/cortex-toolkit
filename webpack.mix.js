const mix = require('laravel-mix');
const webpack = require('webpack');

mix
.options({ processCssUrls: false })
.disableNotifications()
.ts('js/app.js', 'js/app.min.js', { transpileOnly: true })
// Single-file components (Vue 3). Vue is bundled (no CDN): `mix.vue()` wires
// vue-loader, and the alias below resolves `vue` to the runtime-only ESM
// bundler build (templates are precompiled by vue-loader, so the in-browser
// template compiler is not needed). Feature flags let webpack drop the
// Options API (this app is entirely `<script setup>`) and prod devtools.
.vue({ version: 3 })
.webpackConfig({
	resolve: { alias: { 'vue$': 'vue/dist/vue.runtime.esm-bundler.js' } },
	plugins: [
		new webpack.DefinePlugin({
			__VUE_PROD_DEVTOOLS__: false,
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
		})
	]
})
.combine([
	'js/templates.js',
], 'js/templates.bundle.js' )
.sass( 'css/app.scss', 'css/app.min.css', { sassOptions: { outputStyle: mix.inProduction() ? 'compressed' : 'expanded' }} )
.then(() => {
	const fs = require('fs');
	const cssPath = 'css/app.min.css';
	if (fs.existsSync(cssPath)) {
		let css = fs.readFileSync(cssPath, 'utf8');
		if (css.charCodeAt(0) === 0xFEFF || css.includes('\uFEFF')) {
			css = css.replace(/\uFEFF/g, '');
			fs.writeFileSync(cssPath, css);
		}
	}
});
