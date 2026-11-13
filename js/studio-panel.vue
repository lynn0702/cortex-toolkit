<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { resolveSubtraitNoun } from './model.ts';
import TraitEditor from './trait-editor.vue';
import TraitSetEditor from './trait-set-editor.vue';
import NameEditor from './name-editor.vue';
import DiceRoller from './dice-roller.vue';
import JsonEditor from './json-editor.vue';

const props = withDefaults(
	defineProps<{
		character?: any;
		editing?: any[];
		submode?: string | null;
		mode?: string;
		isOpen?: boolean;
		position?: 'left' | 'right';
		panelTab?: 'properties' | 'roller' | 'json';
		dicePool?: any;
		oppositionPool?: any;
		activePoolSide?: 'player' | 'opposition';
		viewY?: number | null;
		drawerState?: 'staged' | 'split' | 'full';
	}>(),
	{
		editing: () => [],
		isOpen: true,
		position: 'right',
		panelTab: 'properties',
		submode: 'edit',
		mode: 'character',
	},
);

const emit = defineEmits<{
	(e: 'update:panelTab', tab: 'properties' | 'roller' | 'json'): void;
	(e: 'update:isOpen', open: boolean): void;
	(e: 'togglePosition'): void;
	(e: 'selectElement', selector: any[]): void;
	(e: 'updateCharacter', character: any): void;
	(e: 'applyJson', parsed: any): void;
	(e: 'removeTrait', traitSetID: number, traitID: number): void;
	(e: 'removeTraitSet', traitSetID: number): void;
	(e: 'saveSheetTemplate'): void;
	(e: 'exportSheetTemplate'): void;
	(e: 'addDie', die: any): void;
	(e: 'removeDie', index: number): void;
	(e: 'clearPool'): void;
	(e: 'clearOppositionPool'): void;
	(e: 'settlePP', delta: number): void;
	(e: 'update:activePoolSide', side: 'player' | 'opposition'): void;
	(e: 'update:drawerState', state: 'staged' | 'split' | 'full'): void;
}>();

let headerTouchStartY = 0;

function onHeaderTouchStart(event: TouchEvent): void {
	if (props.submode !== 'play') return;
	if ((event.target as HTMLElement | null)?.closest('button')) return;
	headerTouchStartY = event.touches[0]?.clientY ?? 0;
}

function onHeaderTouchEnd(event: TouchEvent): void {
	if (props.submode !== 'play' || !headerTouchStartY) return;
	const endY = event.changedTouches[0]?.clientY ?? headerTouchStartY;
	const deltaY = endY - headerTouchStartY;
	headerTouchStartY = 0;
	const current = props.drawerState ?? 'staged';
	if (deltaY < -32 && current === 'split') {
		emit('update:drawerState', 'full');
	} else if (deltaY > 32) {
		emit('update:drawerState', current === 'full' ? 'split' : 'staged');
	}
}

const editingType = computed(() => {
	const sel = props.editing;
	if (!Array.isArray(sel) || !sel.length) return 'sheet';
	const type = sel[0];
	if (type === 'subtrait' && sel[1] !== undefined && sel[2] !== undefined) return 'subtrait';
	if (type === 'trait' && sel[1] !== undefined && sel[2] !== undefined) return 'trait';
	if (type === 'traitSet' && sel[1] !== undefined) return 'traitSet';
	return 'sheet';
});

const traitSetID = computed(() => {
	if (editingType.value === 'trait' || editingType.value === 'subtrait' || editingType.value === 'traitSet') {
		return Number(props.editing?.[1]);
	}
	return -1;
});

const traitPath = computed<number[]>(() => {
	const sel = props.editing;
	if (!Array.isArray(sel)) return [];
	if (editingType.value === 'trait') {
		return sel
			.slice(2, 5)
			.map((n) => Number(n))
			.filter((n) => Number.isFinite(n) && n >= 0);
	}
	if (editingType.value === 'subtrait') {
		if (sel.length >= 4) {
			return sel
				.slice(2, 5)
				.map((n) => Number(n))
				.filter((n) => Number.isFinite(n) && n >= 0);
		}
		const u = Number(sel[2]);
		return Number.isFinite(u) && u >= 0 ? [0, u] : [];
	}
	return [];
});

const traitID = computed(() => (traitPath.value.length >= 1 ? traitPath.value[0] : -1));

const subtraitID = computed(() => (traitPath.value.length >= 2 ? traitPath.value[1] : -1));

const traitSet = computed(() => {
	if (traitSetID.value >= 0 && props.character?.traitSets) {
		return props.character.traitSets[traitSetID.value];
	}
	return null;
});

const resolvedTraitChain = computed<any[]>(() => {
	if (!traitSet.value || !Array.isArray(traitSet.value.traits) || !traitPath.value.length) return [];
	const chain: any[] = [];
	let currentList: any[] | undefined = traitSet.value.traits;
	for (const idx of traitPath.value) {
		if (!Array.isArray(currentList) || !currentList[idx]) return [];
		const node = currentList[idx];
		chain.push(node);
		currentList = node.traits;
	}
	return chain;
});

const trait = computed(() => resolvedTraitChain.value[0] ?? null);

const subtrait = computed(() =>
	resolvedTraitChain.value.length >= 2 ? resolvedTraitChain.value[resolvedTraitChain.value.length - 1] : null,
);

const activeTraitNode = computed(() =>
	resolvedTraitChain.value.length ? resolvedTraitChain.value[resolvedTraitChain.value.length - 1] : null,
);

const traitSetName = computed(() => traitSet.value?.name || 'Trait Set');

type SheetTab = 'sheet' | 'page' | 'theme';

const SHEET_TABS: { key: SheetTab; icon: string; label: string }[] = [
	{ key: 'sheet', icon: 'fa-id-card', label: 'Sheet' },
	{ key: 'page', icon: 'fa-columns', label: 'Page' },
	{ key: 'theme', icon: 'fa-palette', label: 'Theme & Dice' },
];

const panelEl = ref<HTMLElement | null>(null);
const sheetTab = ref<SheetTab>('sheet');

function pickSheetTab(tab: SheetTab) {
	sheetTab.value = tab;
	if (props.panelTab !== 'properties') emit('update:panelTab', 'properties');
}

function onSheetTabKeydown(e: KeyboardEvent, idx: number) {
	const len = SHEET_TABS.length;
	let nextIdx = -1;
	if (e.key === 'ArrowRight') {
		nextIdx = (idx + 1) % len;
	} else if (e.key === 'ArrowLeft') {
		nextIdx = (idx - 1 + len) % len;
	} else if (e.key === 'Home') {
		nextIdx = 0;
	} else if (e.key === 'End') {
		nextIdx = len - 1;
	} else {
		return;
	}
	e.preventDefault();
	const nextTab = SHEET_TABS[nextIdx];
	pickSheetTab(nextTab.key);
	nextTick(() => {
		panelEl.value?.querySelector<HTMLButtonElement>('#studio-tab-' + nextTab.key)?.focus();
	});
}

function toggleJson() {
	emit('update:panelTab', props.panelTab === 'json' ? 'properties' : 'json');
}

function goCrumb(selector: any[]) {
	if (props.panelTab !== 'properties') emit('update:panelTab', 'properties');
	emit('selectElement', selector);
}

// Sheet-root selections that open a tab directly: page, theme, dice.
// theme lands at the tab top; dice lands on the same tab with the
// Die Style & Geometry section scrolled into view.
function enterSheetTab(sel: any) {
	const primary = Array.isArray(sel) ? sel[0] : undefined;
	if (primary === 'page') {
		sheetTab.value = 'page';
	} else if (primary === 'theme' || primary === 'dice') {
		sheetTab.value = 'theme';
		nextTick(() => {
			const body = panelEl.value?.querySelector<HTMLElement>('.studio-panel-body');
			if (!body) return;
			if (primary === 'dice') {
				const anchor = panelEl.value?.querySelector<HTMLElement>('#die-style-anchor');
				if (anchor) {
					const top = anchor.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop;
					body.scrollTo({ top, behavior: 'auto' });
					return;
				}
			}
			body.scrollTo({ top: 0, behavior: 'auto' });
		});
	}
}

watch(() => props.editing, enterSheetTab, { immediate: true });

interface Crumb {
	label: string;
	selector: any[] | null;
}

// Crumb links only navigate in Edit; the current item is never a link.
const canNavigate = computed(() => props.submode !== 'play');

const crumbs = computed<Crumb[]>(() => {
	const list: Crumb[] = [];
	const sheet: Crumb = { label: 'Sheet', selector: [] };
	if (editingType.value === 'subtrait') {
		if (canNavigate.value) list.push(sheet);
		list.push({ label: traitSetName.value, selector: ['traitSet', traitSetID.value] });
		const chain = resolvedTraitChain.value;
		const path = traitPath.value;
		for (let k = 1; k < chain.length; k++) {
			const node = chain[k];
			const label = resolveSubtraitNoun(node);
			const isLast = k === chain.length - 1;
			list.push({
				label,
				selector: isLast ? null : ['subtrait', traitSetID.value, ...path.slice(0, k + 1)],
			});
		}
	} else if (editingType.value === 'trait') {
		if (canNavigate.value) list.push(sheet);
		list.push({ label: traitSetName.value, selector: ['traitSet', traitSetID.value] });
		const chain = resolvedTraitChain.value;
		const path = traitPath.value;
		for (let k = 0; k < chain.length; k++) {
			const node = chain[k];
			const label =
				k === 0
					? node?.name || (traitSet.value?.noun ? `New ${traitSet.value.noun}` : 'Trait')
					: node?.name || node?.noun || 'Subtrait';
			const isLast = k === chain.length - 1;
			list.push({
				label,
				selector: isLast ? null : ['trait', traitSetID.value, ...path.slice(0, k + 1)],
			});
		}
	} else if (editingType.value === 'traitSet') {
		list.push(sheet, { label: traitSetName.value, selector: null });
	}
	return list;
});

const diceCount = computed(() => (props.dicePool?.items?.length || 0) + (props.oppositionPool?.items?.length || 0));

const diceRollerRef = ref<any>(null);
defineExpose({
	diceRoller: diceRollerRef,
	roll: (opts?: { forceDialog?: boolean }) => diceRollerRef.value?.roll(opts),
	clearPool: () => diceRollerRef.value?.clearPool(),
	openOutcomeDialog: () => diceRollerRef.value?.openOutcomeDialog(),
});
</script>

<template>
	<!-- DOCKED STUDIO SIDE PANEL -->
	<aside
		ref="panelEl"
		class="studio-panel"
		:class="['position-' + position, { 'panel-collapsed': !isOpen, 'is-play': submode === 'play' }]"
		:data-state="submode === 'play' ? (drawerState ?? 'staged') : undefined"
	>
		<!-- TOOLBAR: SHEET TABS OR CRUMBS ON THE LEFT, ACTIONS ON THE RIGHT -->
		<div class="studio-panel-header" @touchstart.passive="onHeaderTouchStart" @touchend.passive="onHeaderTouchEnd">
			<div class="studio-toolbar-left">
				<!-- EDIT, SHEET ROOT: SHEET TABS -->
				<div
					v-if="submode !== 'play' && editingType === 'sheet'"
					class="studio-sheet-tabs"
					role="tablist"
					aria-label="Sheet sections"
				>
					<button
						v-for="(t, idx) in SHEET_TABS"
						:key="t.key"
						:id="'studio-tab-' + t.key"
						type="button"
						role="tab"
						class="studio-tab-btn"
						:class="{ active: panelTab === 'properties' && sheetTab === t.key }"
						:aria-selected="panelTab === 'properties' && sheetTab === t.key"
						:tabindex="panelTab === 'properties' && sheetTab === t.key ? 0 : -1"
						aria-controls="studio-panel-body"
						@click="pickSheetTab(t.key)"
						@keydown="onSheetTabKeydown($event, idx)"
						:title="t.label"
					>
						<i class="fas" :class="t.icon" aria-hidden="true"></i><span class="studio-tab-text">{{ t.label }}</span>
					</button>
				</div>
				<!-- INSPECTION: CRUMBS (LINKS IN EDIT, PLAIN TEXT IN PLAY) -->
				<div v-else-if="submode !== 'play' || panelTab === 'properties'" class="studio-breadcrumb">
					<template v-for="(c, i) in crumbs" :key="i">
						<span v-if="i > 0" class="crumb-sep">›</span>
						<button v-if="c.selector && canNavigate" type="button" class="crumb-link" @click="goCrumb(c.selector)">
							{{ c.label }}
						</button>
						<span v-else class="crumb-current">{{ c.label }}</span>
					</template>
				</div>
				<span v-else-if="submode === 'play' && panelTab === 'roller'" class="studio-roller-heading">Dice Pool</span>
			</div>

			<div class="studio-panel-actions">
				<!-- PLAY: PROPERTIES AND ROLLER TOGGLES -->
				<template v-if="submode === 'play'">
					<button
						type="button"
						class="studio-tab-btn"
						:class="{ active: panelTab === 'properties', 'is-empty-play-inspector': editingType === 'sheet' }"
						@click="emit('update:panelTab', 'properties')"
						title="Properties"
					>
						<i class="fas fa-sliders" aria-hidden="true"></i><span class="studio-tab-label">Properties</span>
					</button>
					<button
						type="button"
						class="studio-tab-btn"
						:class="{ active: panelTab === 'roller' }"
						@click="emit('update:panelTab', 'roller')"
						title="Roller"
					>
						<i class="fas fa-dice" aria-hidden="true"></i><span class="studio-tab-label">Roller</span>
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
					<i class="fas fa-code" aria-hidden="true"></i>
				</button>
				<button
					type="button"
					class="studio-action-btn studio-action-dock"
					@click="emit('togglePosition')"
					:title="position === 'right' ? 'Dock left' : 'Dock right'"
					:aria-label="position === 'right' ? 'Dock left' : 'Dock right'"
				>
					<i class="fas fa-arrows-left-right" aria-hidden="true"></i>
				</button>
				<span v-if="submode === 'play'" class="studio-mobile-drawer-controls">
					<button
						v-if="(drawerState ?? 'staged') === 'split'"
						type="button"
						class="studio-action-btn"
						@click="emit('update:drawerState', 'full')"
						title="Expand roller"
						aria-label="Expand roller"
					>
						<i class="fas fa-chevron-up" aria-hidden="true"></i>
					</button>
					<button
						v-else
						type="button"
						class="studio-action-btn"
						@click="emit('update:drawerState', 'split')"
						title="Split roller"
						aria-label="Split roller"
					>
						<i class="fas fa-chevron-down" aria-hidden="true"></i>
					</button>
					<button
						type="button"
						class="studio-action-btn"
						@click="emit('update:drawerState', 'staged')"
						title="Close roller"
						aria-label="Close roller"
					>
						<i
							class="fas"
							:class="(drawerState ?? 'staged') === 'full' ? 'fa-xmark' : 'fa-chevron-down'"
							aria-hidden="true"
						></i>
					</button>
				</span>
				<button
					type="button"
					class="studio-action-btn studio-action-collapse-desktop"
					@click="emit('update:isOpen', false)"
					title="Collapse panel"
					aria-label="Collapse panel"
				>
					<i :class="position === 'right' ? 'fas fa-angles-right' : 'fas fa-angles-left'" aria-hidden="true"></i>
				</button>
			</div>
		</div>

		<!-- PANEL BODY -->
		<div
			id="studio-panel-body"
			class="studio-panel-body"
			:class="{ 'is-roller-tab': panelTab === 'roller' }"
			:role="submode !== 'play' && editingType === 'sheet' && panelTab === 'properties' ? 'tabpanel' : undefined"
			:aria-labelledby="
				submode !== 'play' && editingType === 'sheet' && panelTab === 'properties'
					? 'studio-tab-' + sheetTab
					: undefined
			"
		>
			<!-- PROPERTIES PANE -->
			<div v-show="panelTab === 'properties'" class="studio-tab-pane">
				<template v-if="character">
					<!-- TRAIT EDITOR -->
					<TraitEditor
						v-if="(editingType === 'trait' || editingType === 'subtrait') && activeTraitNode"
						:key="editingType + '-' + traitSetID + '-' + traitPath.join('-')"
						:character="character"
						:traitSetID="traitSetID"
						:traitID="traitID"
						:subtraitID="traitPath.length >= 2 ? subtraitID : undefined"
						:traitPath="traitPath"
						:isSetSubtrait="editingType === 'subtrait'"
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
					:oppositionPool="oppositionPool"
					:activePoolSide="activePoolSide"
					:character="character"
					:position="position"
					@togglePosition="emit('togglePosition')"
					@close="emit('update:isOpen', false)"
					@addDie="emit('addDie', $event)"
					@removeDie="emit('removeDie', $event)"
					@clearPool="emit('clearPool')"
					@clearOppositionPool="emit('clearOppositionPool')"
					@settlePP="emit('settlePP', $event)"
					@update:activePoolSide="emit('update:activePoolSide', $event)"
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
