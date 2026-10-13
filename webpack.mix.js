const mix = require('laravel-mix');

mix
.options({ processCssUrls: false })
.disableNotifications()
.ts('js/app.js', 'js/app.min.js', { transpileOnly: true })
// Single-file components (Vue 3). mix.vue() wires vue-loader correctly; the
// externals entry maps `import ... from 'vue'` (SFC script + compiled render
// helpers) to the CDN global so Vue is never bundled.
.vue({ version: 3 })
.webpackConfig({ externals: { vue: 'Vue' } })
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
