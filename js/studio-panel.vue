<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
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
	( e: 'settlePP', delta: number ): void;
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

type SheetTab = 'sheet' | 'page' | 'theme';

const SHEET_TABS: { key: SheetTab; icon: string; label: string }[] = [
	{ key: 'sheet', icon: 'fa-id-card', label: 'Sheet' },
	{ key: 'page', icon: 'fa-columns', label: 'Page' },
	{ key: 'theme', icon: 'fa-palette', label: 'Theme & Dice' },
];

const panelEl = ref<HTMLElement | null>( null );
const sheetTab = ref<SheetTab>( 'sheet' );

function pickSheetTab( tab: SheetTab ) {
	sheetTab.value = tab;
	if ( props.panelTab !== 'properties' ) emit( 'update:panelTab', 'properties' );
}

function toggleJson() {
	emit( 'update:panelTab', props.panelTab === 'json' ? 'properties' : 'json' );
}

function goCrumb( selector: any[] ) {
	if ( props.panelTab !== 'properties' ) emit( 'update:panelTab', 'properties' );
	emit( 'selectElement', selector );
}

// Sheet-root selections that open a tab directly: page, theme, dice.
// theme lands at the tab top; dice lands on the same tab with the
// Die Style & Geometry section scrolled into view.
function enterSheetTab( sel: any ) {
	const primary = Array.isArray( sel ) ? sel[ 0 ] : undefined;
	if ( primary === 'page' ) {
		sheetTab.value = 'page';
	} else if ( primary === 'theme' || primary === 'dice' ) {
		sheetTab.value = 'theme';
		nextTick( () => {
			const body = panelEl.value?.querySelector<HTMLElement>( '.studio-panel-body' );
			if ( !body ) return;
			if ( primary === 'dice' ) {
				const anchor = panelEl.value?.querySelector<HTMLElement>( '#die-style-anchor' );
				if ( anchor ) {
					const top = anchor.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop;
					body.scrollTo( { top, behavior: 'auto' } );
					return;
				}
			}
			body.scrollTo( { top: 0, behavior: 'auto' } );
		} );
	}
}

watch( () => props.editing, enterSheetTab, { immediate: true } );

interface Crumb { label: string; selector: any[] | null }

// Crumb links only navigate in Edit; the current item is never a link.
const canNavigate = computed( () => props.submode !== 'play' );

const crumbs = computed<Crumb[]>( () => {
	const list: Crumb[] = [];
	const sheet: Crumb = { label: 'Sheet', selector: [] };
	if ( editingType.value === 'trait' ) {
		if ( canNavigate.value ) list.push( sheet );
		list.push( { label: traitSetName.value, selector: [ 'traitSet', traitSetID.value ] } );
		list.push( { label: traitName.value, selector: null } );
	} else if ( editingType.value === 'traitSet' ) {
		list.push( sheet, { label: traitSetName.value, selector: null } );
	} else if ( editingType.value === 'portrait' ) {
		list.push( sheet, { label: 'Portrait', selector: null } );
	}
	return list;
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
		ref="panelEl"
		class="studio-panel"
		:class="[
			'position-' + position,
			{ 'panel-collapsed': !isOpen }
		]"
	>
		<!-- TOOLBAR: SHEET TABS OR CRUMBS ON THE LEFT, ACTIONS ON THE RIGHT -->
		<div class="studio-panel-header">
			<div class="studio-toolbar-left">
				<!-- EDIT, SHEET ROOT: SHEET TABS -->
				<div v-if="submode !== 'play' && editingType === 'sheet'" class="studio-sheet-tabs" role="tablist">
					<button
						v-for="t in SHEET_TABS"
						:key="t.key"
						type="button"
						role="tab"
						class="studio-tab-btn"
						:class="{ active: panelTab === 'properties' && sheetTab === t.key }"
						:aria-selected="panelTab === 'properties' && sheetTab === t.key"
						@click="pickSheetTab(t.key)"
						:title="t.label"
					>
						<i class="fas" :class="t.icon"></i><span class="studio-tab-text">{{ t.label }}</span>
					</button>
				</div>
				<!-- INSPECTION: CRUMBS (LINKS IN EDIT, PLAIN TEXT IN PLAY) -->
				<div v-else-if="submode !== 'play' || panelTab === 'properties'" class="studio-breadcrumb">
					<template v-for="(c, i) in crumbs" :key="i">
						<span v-if="i > 0" class="crumb-sep">›</span>
						<button v-if="c.selector && canNavigate" type="button" class="crumb-link" @click="goCrumb(c.selector)">{{ c.label }}</button>
						<span v-else class="crumb-current">{{ c.label }}</span>
					</template>
				</div>
			</div>

			<div class="studio-panel-actions">
				<!-- PLAY: PROPERTIES AND ROLLER TOGGLES -->
				<template v-if="submode === 'play'">
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
				</template>
				<!-- EDIT: RAW JSON TOGGLE -->
				<button
					v-else
					type="button"
					class="studio-action-btn studio-action-json"
					:class="{ active: panelTab === 'json' }"
					:aria-pressed="panelTab === 'json'"
					@click="toggleJson"
					title="Raw JSON Editor"
					aria-label="Raw JSON Editor"
				>
					<i class="fas fa-code"></i>
				</button>
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

					<!-- SHEET TABS PANEL (NAME, PAGE, THEME & DICE) -->
					<NameEditor
						v-else
						:character="character"
						:open="true"
						:tab="sheetTab"
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
					@settlePP="emit('settlePP', $event)"
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
