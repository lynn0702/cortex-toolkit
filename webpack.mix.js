const mix = require('laravel-mix');

mix
.options({ processCssUrls: false })
.disableNotifications()
.combine([
	'js/functions.js',
	'js/storage.js',
	'js/cortex-pal.js',
	'js/roster.js',
	'js/character.js',
	'js/name-editor.js',
	'js/trait-set-editor.js',
	'js/trait-editor.js',
	'js/subtrait-editor.js',
	'js/sfx-editor.js',
	'js/portrait-editor.js',
	'js/dice-roller.js',
	'js/style-gallery.js',
	'js/app.js'
], 'js/app.min.js' )
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
