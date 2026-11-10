import { createApp } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import { cloneDeep } from './clone-deep.ts';
import { SHOWCASE_TEMPLATES } from './showcase-templates.ts';
import TraitSetFrame from './trait-set-frame.vue';
import App from './app.vue';
import '../css/app.css';

function mount() {
	// The mounted proxy is the documented handle for browser-driven tests and
	// debugging (see legacy.md environment gotchas). Components are imported by
	// their consumers (`<script setup>` SFCs), so no global registration is needed.
	window.app = createApp(App).mount('#character-curio');

	window.characterCurioTraitHelpers = characterCurioFunctions.traitHelpers;
	window.characterCurioMaterialize = characterCurioFunctions.materializeCharacter;
	window.characterCurioToLayered = characterCurioFunctions.toLayeredEntity;
	window.characterCurioFunctions = characterCurioFunctions;
	window.characterCurioSetPresets = characterCurioFunctions.characterCurioSetPresets;
	window.characterCurioCloneDeep = cloneDeep;
	window.characterCurioShowcaseTemplates = SHOWCASE_TEMPLATES;
	window.characterCurioTraitSetFrame = TraitSetFrame;
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', mount);
} else {
	mount();
}
