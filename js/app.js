import { createApp } from 'vue';
import { cortexFunctions } from './functions.ts';
import { cloneDeep } from './clone-deep.ts';
import { SHOWCASE_TEMPLATES } from './showcase-templates.ts';
import TraitSetFrame from './trait-set-frame.vue';
import App from './app.vue';
import '../css/app.css';

function mount() {
	// The mounted proxy is the documented handle for browser-driven tests and
	// debugging (see legacy.md environment gotchas). Components are imported by
	// their consumers (`<script setup>` SFCs), so no global registration is needed.
	window.app = createApp(App).mount('#cortex-toolkit');

	window.cortexTraitHelpers = cortexFunctions.traitHelpers;
	window.cortexMaterialize = cortexFunctions.materializeCharacter;
	window.cortexToLayered = cortexFunctions.toLayeredEntity;
	window.cortexFunctions = cortexFunctions;
	window.cortexSetPresets = cortexFunctions.cortexSetPresets;
	window.cortexCloneDeep = cloneDeep;
	window.cortexShowcaseTemplates = SHOWCASE_TEMPLATES;
	window.cortexTraitSetFrame = TraitSetFrame;
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', mount);
} else {
	mount();
}
