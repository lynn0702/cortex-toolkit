<script setup lang="ts">
import { computed, ref } from 'vue';
import TraitEditor from './trait-editor.vue';
import TraitSetEditor from './trait-set-editor.vue';
import PortraitEditor from './portrait-editor.vue';
import NameEditor from './name-editor.vue';
import DiceRoller from './dice-roller.vue';
import JsonEditor from './json-editor.vue';

const props = withDefaults( defineProps<{
	character?: any;
	editing?: any[];
	submode?: string | null;
	mode?: string;
	isOpen?: boolean;
	position?: 'left' | 'right';
	panelTab?: 'properties' | 'roller' | 'json';
	dicePool?: any;
	viewY?: number | null;
}>(), {
	editing: () => [],
	isOpen: true,
	position: 'right',
	panelTab: 'properties',
	submode: 'edit',
	mode: 'character',
} );

const emit = defineEmits<{
	( e: 'update:panelTab', tab: 'properties' | 'roller' | 'json' ): void;
	( e: 'update:isOpen', open: boolean ): void;
	( e: 'togglePosition' ): void;
	( e: 'selectElement', selector: any[] ): void;
	( e: 'updateCharacter', character: any ): void;
	( e: 'applyJson', parsed: any ): void;
	( e: 'removeTrait', traitSetID: number, traitID: number ): void;
	( e: 'removeTraitSet', traitSetID: number ): void;
	( e: 'saveSheetTemplate' ): void;
	( e: 'exportSheetTemplate' ): void;
	( e: 'addDie', die: any ): void;
	( e: 'removeDie', index: number ): void;
	( e: 'clearPool' ): void;
}>();

const editingType = computed( () => {
	const sel = props.editing;
	if ( !Array.isArray( sel ) || !sel.length ) return 'sheet';
	const type = sel[ 0 ];
	if ( type === 'trait' && sel[ 1 ] !== undefined && sel[ 2 ] !== undefined ) return 'trait';
	if ( type === 'traitSet' && sel[ 1 ] !== undefined ) return 'traitSet';
	if ( type === 'portrait' ) return 'portrait';
	return 'sheet';
} );

const traitSetID = computed( () => {
	if ( editingType.value === 'trait' || editingType.value === 'traitSet' ) {
		return Number( props.editing?.[ 1 ] );
	}
	return -1;
} );

const traitID = computed( () => {
	if ( editingType.value === 'trait' ) {
		return Number( props.editing?.[ 2 ] );
	}
	return -1;
} );

const traitSet = computed( () => {
	if ( traitSetID.value >= 0 && props.character?.traitSets ) {
		return props.character.traitSets[ traitSetID.value ];
	}
	return null;
} );

const trait = computed( () => {
	if ( traitSet.value && traitID.value >= 0 && traitSet.value.traits ) {
		return traitSet.value.traits[ traitID.value ];
	}
	return null;
} );

const traitSetName = computed( () => traitSet.value?.name || 'Trait Set' );
const traitName = computed( () => trait.value?.name || ( traitSet.value?.noun ? `New ${traitSet.value.noun}` : 'Trait' ) );

const nameEditorInitialTab = computed( () => {
	const sel = props.editing;
	if ( !Array.isArray( sel ) || !sel.length ) return 'sheet';
	const primary = sel[ 0 ];
	if ( primary === 'page' ) return 'page';
	if ( primary === 'theme' ) return 'theme';
	if ( primary === 'dice' ) return 'dice';
	return 'sheet';
} );

const diceCount = computed( () => props.dicePool?.items?.length || 0 );

const diceRollerRef = ref<any>( null );
defineExpose( {
	diceRoller: diceRollerRef,
	roll: () => diceRollerRef.value?.roll(),
	clearPool: () => diceRollerRef.value?.clearPool()
} );
</script>

<template>
	<!-- DOCKED STUDIO SIDE PANEL -->
	<aside
		class="studio-panel"
		:class="[
			'position-' + position,
			{ 'panel-collapsed': !isOpen }
		]"
	>
		<!-- PANEL HEADER: TABS + ACTIONS -->
		<div class="studio-panel-header">
			<div class="studio-panel-tabs">
				<button
					type="button"
					class="studio-tab-btn"
					:class="{ active: panelTab === 'properties' }"
					@click="emit('update:panelTab', 'properties')"
					title="Properties"
				>
					<i class="fas fa-sliders"></i><span class="studio-tab-label">Properties</span>
				</button>
				<button
					type="button"
					class="studio-tab-btn"
					:class="{ active: panelTab === 'roller' }"
					@click="emit('update:panelTab', 'roller')"
					title="Roller"
				>
					<i class="fas fa-dice-d20"></i><span class="studio-tab-label">Roller</span>
					<span class="studio-tab-badge" v-if="diceCount > 0">{{ diceCount }}</span>
				</button>
				<button
					v-if="submode !== 'play'"
					type="button"
					class="studio-tab-btn"
					:class="{ active: panelTab === 'json' }"
					@click="emit('update:panelTab', 'json')"
					title="JSON"
				>
					<i class="fas fa-code"></i><span class="studio-tab-label">JSON</span>
				</button>
			</div>

			<div class="studio-panel-actions">
				<button
					type="button"
					class="studio-action-btn studio-action-dock"
					@click="emit('togglePosition')"
					:title="position === 'right' ? 'Dock left' : 'Dock right'"
				>
					<i class="fas fa-arrows-left-right"></i>
				</button>
				<button
					type="button"
					class="studio-action-btn"
					@click="emit('update:isOpen', false)"
					title="Collapse panel"
				>
					<i :class="position === 'right' ? 'fas fa-angles-right' : 'fas fa-angles-left'"></i>
				</button>
			</div>
		</div>

		<!-- BREADCRUMB SUB-BAR (PROPERTIES TAB) -->
		<div class="studio-breadcrumb-bar" v-if="panelTab === 'properties'">
			<div class="studio-breadcrumb">
				<template v-if="editingType === 'trait'">
					<span v-if="submode !== 'play'" class="crumb-link" @click="emit('selectElement', ['traitSet', traitSetID])">{{ traitSetName }}</span>
					<span v-else class="crumb-current">{{ traitSetName }}</span>
					<span class="crumb-sep">›</span>
					<span class="crumb-current">{{ traitName }}</span>
				</template>
				<template v-else-if="editingType === 'traitSet'">
					<span v-if="submode !== 'play'" class="crumb-link" @click="emit('selectElement', [])">Sheet</span>
					<span v-else class="crumb-current">Sheet</span>
					<span class="crumb-sep">›</span>
					<span class="crumb-current">{{ traitSetName }}</span>
				</template>
				<template v-else-if="editingType === 'portrait'">
					<span v-if="submode !== 'play'" class="crumb-link" @click="emit('selectElement', [])">Sheet</span>
					<span v-else class="crumb-current">Sheet</span>
					<span class="crumb-sep">›</span>
					<span class="crumb-current">Portrait</span>
				</template>
				<template v-else>
					<span class="crumb-current">Sheet Properties</span>
				</template>
			</div>

			<button
				v-if="editingType !== 'sheet' && submode !== 'play'"
				type="button"
				class="studio-btn-subtle"
				@click="emit('selectElement', [])"
				title="Back to sheet properties"
			>
				<i class="fas fa-check"></i> Done
			</button>
		</div>

		<!-- PANEL BODY -->
		<div class="studio-panel-body">
			<!-- PROPERTIES PANE -->
			<div v-show="panelTab === 'properties'" class="studio-tab-pane">
				<template v-if="character">
					<!-- TRAIT EDITOR -->
					<TraitEditor
						v-if="editingType === 'trait' && trait"
						:key="'trait-' + traitSetID + '-' + traitID"
						:character="character"
						:traitSetID="traitSetID"
						:traitID="traitID"
						:submode="submode"
						:open="true"
						:viewY="viewY"
						@selectElement="emit('selectElement', $event)"
						@updateCharacter="emit('updateCharacter', $event)"
						@removeTrait="(s, t) => emit('removeTrait', s, t)"
					/>

					<!-- PLAY MODE LIGHTWEIGHT PLACEHOLDER WHEN NOT EDITING A TRAIT -->
					<div v-else-if="submode === 'play'" class="studio-empty-state">
						<p>Tap any trait on the sheet to inspect or adjust its rating.</p>
					</div>

					<!-- TRAIT SET EDITOR -->
					<TraitSetEditor
						v-else-if="editingType === 'traitSet' && traitSet"
						:key="'set-' + traitSetID"
						:character="character"
						:traitSetID="traitSetID"
						:open="true"
						:viewY="viewY"
						@selectElement="emit('selectElement', $event)"
						@updateCharacter="emit('updateCharacter', $event)"
						@removeTraitSet="(s) => emit('removeTraitSet', s)"
					/>

					<!-- PORTRAIT EDITOR -->
					<PortraitEditor
						v-else-if="editingType === 'portrait'"
						:character="character"
						:open="true"
						@selectElement="emit('selectElement', $event)"
						@updateCharacter="emit('updateCharacter', $event)"
					/>

					<!-- SHEET PROPERTIES (NAME, PAGE, FONTS & COLORS, DICE) -->
					<NameEditor
						v-else
						:character="character"
						:open="true"
						:initialTab="nameEditorInitialTab"
						:viewY="viewY"
						@selectElement="emit('selectElement', $event)"
						@updateCharacter="emit('updateCharacter', $event)"
						@saveSheetTemplate="emit('saveSheetTemplate')"
						@exportSheetTemplate="emit('exportSheetTemplate')"
					/>
				</template>
				<div v-else class="studio-empty-state">
					<p>No character active.</p>
				</div>
			</div>

			<!-- ROLLER PANE -->
			<div v-show="panelTab === 'roller'" class="studio-tab-pane">
				<DiceRoller
					ref="diceRollerRef"
					:open="true"
					:pool="dicePool"
					:position="position"
					@togglePosition="emit('togglePosition')"
					@close="emit('update:isOpen', false)"
					@addDie="emit('addDie', $event)"
					@removeDie="emit('removeDie', $event)"
					@clearPool="emit('clearPool')"
				/>
			</div>

			<!-- JSON PANE -->
			<div v-show="panelTab === 'json'" class="studio-tab-pane">
				<JsonEditor
					v-if="character"
					:key="'json-' + (character.id || 'none')"
					:character="character"
					:open="panelTab === 'json'"
					@applyJson="emit('applyJson', $event)"
				/>
				<div v-else class="studio-empty-state">
					<p>No character active.</p>
				</div>
			</div>
		</div>
	</aside>
</template>
