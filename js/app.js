import { cortexFunctions } from './functions.ts';
import { cortexMigration } from './migration.ts';
import App from './app.vue';

document.addEventListener('DOMContentLoaded', () => {

	// The mounted proxy is the documented handle for browser-driven tests and
	// debugging (see legacy.md environment gotchas). Components are imported by
	// their consumers (`<script setup>` SFCs), so no global registration is needed.
	window.app = Vue.createApp( App ).mount('#cortex-toolkit');

	window.cortexTraitHelpers = cortexFunctions.traitHelpers;
	window.cortexMigration = cortexMigration;
	window.cortexMaterialize = cortexFunctions.materializeCharacter;
	window.cortexToLayered = cortexFunctions.toLayeredEntity;
	window.cortexFunctions = cortexFunctions;

});
