<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import {
	getView,
	isNameSet,
	getTemplateListing,
	hasTemplateListing,
	getTemplateTitle,
	getTemplateSubtitle,
	getTemplateGenre,
	getTemplateVariant,
	getTemplateDescription,
	getTemplateHeroImage,
	characterToSheetTemplate,
} from './model.ts';
import PortraitRing from './portrait-ring.vue';
import TraitSetFrame from './trait-set-frame.vue';
import ModalDialog from './modal-dialog.vue';
import TraitSetMini from './trait-set-mini.vue';
import { SHOWCASE_TEMPLATES, DREAMER_ARCHITECT_SHOWCASE } from './showcase-templates.ts';

declare const characterCurioLibraryTemplates: any;

const props = withDefaults(
	defineProps<{
		characters: any[];
		openCharacterIDs?: string[];
		sheetTemplates?: any[];
	}>(),
	{
		openCharacterIDs: () => [],
		sheetTemplates: () => [],
	},
);

const emit = defineEmits<{
	(e: 'createFromLibrary', tmpl: any, asTemplate: boolean, openPrint: boolean): void;
	(e: 'previewTemplate', tmpl: any): void;
	(e: 'createCharacter', isTemplate: boolean, templateId?: string | null): void;
	(e: 'createFromTemplate', characterID: string): void;
	(e: 'toggleTemplate', characterID: string): void;
	(e: 'loadCharacter', characterID: string): void;
	(e: 'duplicateCharacter', characterID: string): void;
	(e: 'exportCharacter', characterID: string): void;
	(e: 'exportAllCharacters'): void;
	(e: 'deleteCharacter', id: string): void;
	(e: 'deleteAllCharacters'): void;
	(e: 'importSheetTemplate', char: any): void;
	(e: 'deleteSheetTemplate', id: string): void;
	(e: 'importCharacter', character: any): void;
}>();

const instance = getCurrentInstance();

const filterMode = ref('all'); // 'all', 'characters', 'templates'
const rosterSearch = ref('');
const selectedTemplateId = ref('');

const showImportConfirm = ref(false);
const importQueue = ref<any[]>([]);
const importBuffer = ref<any>(null);
const importError = ref('');
const libraryLoading = ref(false);
const libraryError = ref('');
const libraryBundleEpoch = ref(0);
const showDeleteConfirm = ref(false);
const characterToDelete = ref<any>(null);
const showDeleteAllConfirm = ref(false);
const showLibrary = ref(false);
const showTraitSetMini = ref(false);
const librarySearch = ref('');
const libraryCategory = ref<'all' | 'official' | 'reference' | 'saved'>('all');

const inputFile = ref<HTMLInputElement | null>(null);

const templateSheets = computed(() => props.characters.filter((c) => !!c.isTemplate));

const charactersSorted = computed(() =>
	[...props.characters].sort((a, b) => {
		const aDate = Math.max(
			new Date(a.dateCreated).getTime(),
			new Date(a.dateModified).getTime(),
			new Date(a.dateTouched).getTime(),
		);
		const bDate = Math.max(
			new Date(b.dateCreated).getTime(),
			new Date(b.dateModified).getTime(),
			new Date(b.dateTouched).getTime(),
		);
		return bDate - aDate;
	}),
);

const matchingCharacters = computed(() => {
	const q = rosterSearch.value.toLowerCase().trim();
	if (!q) return charactersSorted.value;
	return charactersSorted.value.filter((c: any) => {
		const name = (c.name || '').toLowerCase();
		const game = (c.game || '').toLowerCase();
		const type = (c.type || getView(c)?.type || '').toLowerCase();
		return (
			name.includes(q) || game.includes(q) || type.includes(q) || characterCurioFunctions.characterMatchesTagQuery(c, q)
		);
	});
});

const allCount = computed(() => matchingCharacters.value.length);
const characterCount = computed(() => matchingCharacters.value.filter((c) => !c.isTemplate).length);
const templateCount = computed(() => matchingCharacters.value.filter((c) => !!c.isTemplate).length);

const charactersFiltered = computed(() => {
	const list = matchingCharacters.value;
	if (filterMode.value === 'templates') return list.filter((c) => !!c.isTemplate);
	if (filterMode.value === 'characters') return list.filter((c) => !c.isTemplate);
	return list;
});

const customTemplates = computed(() => (props.sheetTemplates || []).filter((t: any) => Boolean(t?.userSaved)));

const libraryTemplates = computed(() => {
	void libraryBundleEpoch.value;
	const base = typeof characterCurioLibraryTemplates !== 'undefined' ? characterCurioLibraryTemplates : [];
	if (typeof characterCurioLibraryTemplates === 'undefined') {
		loadLibraryTemplates();
	}
	const knownIds = new Set<string>(
		[...customTemplates.value, DREAMER_ARCHITECT_SHOWCASE, ...SHOWCASE_TEMPLATES, ...base]
			.map((t: any) => String(t?.id || ''))
			.filter(Boolean),
	);
	const rosterDemoTemplates = (props.characters || [])
		.filter((c: any) => {
			if (!c || typeof c !== 'object') return false;
			if (!c.isTemplate && !hasTemplateListing(getView(c)?.listing)) return false;
			const tplRef = c.sheet?.template;
			const linkedId = typeof tplRef === 'string' ? tplRef : String(tplRef?.id || '');
			return !linkedId || !knownIds.has(linkedId);
		})
		.map((c: any) => ({ ...characterToSheetTemplate(c), userSaved: true }));
	const merged = [
		...customTemplates.value,
		...rosterDemoTemplates,
		DREAMER_ARCHITECT_SHOWCASE,
		...SHOWCASE_TEMPLATES,
		...base,
	];
	const seen = new Set<string>();
	return merged.filter((t: any) => {
		const id = t?.id;
		if (!id || seen.has(id)) return false;
		seen.add(id);
		return true;
	});
});

function isOfficialEntry(t: any): boolean {
	return !t?.userSaved && Boolean(safeLinkUrl(getTemplateListing(t)?.url));
}

function isReferenceEntry(t: any): boolean {
	return !t?.userSaved && !safeLinkUrl(getTemplateListing(t)?.url);
}

function isSavedSheetTemplate(tmpl: any): boolean {
	return Boolean(tmpl?.userSaved && customTemplates.value.some((ct: any) => ct?.id === tmpl?.id));
}

const libraryCategoryCounts = computed(() => {
	const all = libraryTemplates.value;
	return {
		all: all.length,
		official: all.filter(isOfficialEntry).length,
		reference: all.filter(isReferenceEntry).length,
		saved: all.filter((t: any) => Boolean(t?.userSaved)).length,
	};
});

const effectiveLibraryCategory = computed(() =>
	libraryCategory.value === 'saved' && libraryCategoryCounts.value.saved === 0 ? 'all' : libraryCategory.value,
);

const libraryTemplatesFiltered = computed(() => {
	let list = libraryTemplates.value;
	const cat = effectiveLibraryCategory.value;
	if (cat === 'official') {
		list = list.filter(isOfficialEntry);
	} else if (cat === 'reference') {
		list = list.filter(isReferenceEntry);
	} else if (cat === 'saved') {
		list = list.filter((t: any) => Boolean(t?.userSaved));
	}
	if (librarySearch.value && librarySearch.value.trim().length) {
		const q = librarySearch.value.toLowerCase().trim();
		list = list.filter(
			(t: any) =>
				getTemplateTitle(t).toLowerCase().includes(q) ||
				String(t?.id || '')
					.toLowerCase()
					.includes(q) ||
				getTemplateSubtitle(t).toLowerCase().includes(q) ||
				getTemplateGenre(t).toLowerCase().includes(q) ||
				getTemplateVariant(t).toLowerCase().includes(q) ||
				getTemplateDescription(t).toLowerCase().includes(q) ||
				String(t?.character?.game || '')
					.toLowerCase()
					.includes(q) ||
				(t.character?.traitSets || []).some((s: any) =>
					String(s?.name || '')
						.toLowerCase()
						.includes(q),
				),
		);
	}
	return list;
});

function resetLibraryFilters() {
	librarySearch.value = '';
	libraryCategory.value = 'all';
}

function safeImageUrl(url: any) {
	return characterCurioFunctions.safeImageUrl(url);
}

function safeLinkUrl(url: any) {
	return characterCurioFunctions.safeLinkUrl(url);
}

function cardHeroImage(tmpl: any): string {
	return getTemplateHeroImage(tmpl);
}

function cardRatingTraits(tmpl: any) {
	const listing = getTemplateListing(tmpl) || {};
	const entries: Array<[string, unknown]> = [
		['Setting', listing.setting],
		['Prep', listing.prep],
		['Complexity', listing.complexity],
	];
	const traits: Array<{ name: string; rating: { type: 'Die'; value: number[] } }> = [];
	for (const [label, raw] of entries) {
		const m = /^d(\d+)$/i.exec(String(raw || '').trim());
		if (m) {
			traits.push({
				name: label,
				rating: { type: 'Die', value: [Number(m[1])] },
			});
		}
	}
	return traits;
}

function cardHasRatings(tmpl: any): boolean {
	return cardRatingTraits(tmpl).length > 0;
}

// Mini character for a library card hero: the cover image acts as portrait,
// and real Setting/Prep/Complexity ratings (when present) render on the ring.
function cardRingCharacter(tmpl: any) {
	const ratings = cardRatingTraits(tmpl);
	const charView = getView(tmpl?.character);
	const ringColor =
		typeof charView?.primaryColor === 'string' && charView.primaryColor.trim()
			? charView.primaryColor.trim()
			: 'primary';
	return {
		name: getTemplateTitle(tmpl),
		portrait: { url: cardHeroImage(tmpl) },
		view: charView?.diceConfig ? { diceConfig: charView.diceConfig } : {},
		traitSets: [
			{
				id: 'ratings',
				name: 'Ratings',
				view: {
					border: 'none',
					frame: {
						shape: 'circle',
						array: ratings.length ? 'arc' : 'none',
						span: [0, 360],
						...(ratings.length ? { traitsSpan: [45, 135] } : {}),
						stroke: '4px',
						color: ringColor,
					},
				},
				traits: ratings,
			},
		],
	};
}

function cardDescription(tmpl: any): string {
	return getTemplateDescription(tmpl);
}

function cardMetaBadges(tmpl: any): string[] {
	const badges: string[] = [];
	const charView = getView(tmpl?.character);
	const pages = Number(charView?.pageCount || (tmpl as any)?.pages || 0);
	if (pages > 0) {
		badges.push(pages === 1 ? '1 Page' : `${pages} Pages`);
	}
	if ((charView?.pageOrientation || charView?.orientation) === 'landscape') {
		badges.push('Landscape');
	}
	const variant = getTemplateVariant(tmpl);
	if (variant && variant !== 'Character File' && variant !== 'Showcase') {
		badges.push(variant);
	}
	return badges;
}

function cardTraitTags(tmpl: any): { visible: string[]; overflow: number } {
	const seen = new Set<string>();
	const names: string[] = [];
	for (const s of tmpl?.character?.traitSets || []) {
		const rawName = String(s?.name || '').trim();
		if (!rawName) continue;
		if (isNameSet(s)) continue;
		if (seen.has(rawName)) continue;
		seen.add(rawName);
		names.push(rawName);
	}
	return {
		visible: names.slice(0, 8),
		overflow: Math.max(0, names.length - 8),
	};
}

function cardSchematicBlocks(tmpl: any): Array<'ring' | 'cut' | 'half' | 'full'> {
	const sets = (tmpl?.character?.traitSets || []).filter((s: any) => Boolean(s?.name) && !isNameSet(s));
	return sets.slice(0, 6).map((s: any) => {
		const view = getView(s);
		const frame = typeof view?.frame === 'object' && view.frame !== null ? view.frame : null;
		const border = typeof view?.border === 'object' && view.border !== null ? view.border : null;
		if (frame?.shape === 'circle' || view?.frame === 'ring') return 'ring';
		if (border?.corner === 'cut') return 'cut';
		if (view?.place?.width === '50%') return 'half';
		return 'full';
	});
}

function openLibrary() {
	showLibrary.value = true;
	loadLibraryTemplates();
}

function loadLibraryTemplates() {
	if (typeof characterCurioLibraryTemplates !== 'undefined' || libraryLoading.value) return;
	libraryLoading.value = true;
	libraryError.value = '';
	const script = document.createElement('script');
	// `?v=` is rewritten to the content hash of js/templates.bundle.js by
	// scripts/version-assets.js during `npm run build`.
	script.src = 'js/templates.bundle.js?v=33';
	script.onload = () => {
		libraryLoading.value = false;
		libraryBundleEpoch.value++;
		(instance?.proxy as any)?.$forceUpdate();
	};
	script.onerror = () => {
		libraryLoading.value = false;
		libraryError.value = 'Could not load the Library. Check your connection and try again.';
	};
	document.head.appendChild(script);
}

function useLibrary(tmpl: any, asTemplate = false, openPrint = false) {
	showLibrary.value = false;
	emit('createFromLibrary', tmpl, asTemplate, openPrint);
}

function createCharacter() {
	if (selectedTemplateId.value && selectedTemplateId.value.startsWith('library:')) {
		const id = selectedTemplateId.value.slice('library:'.length);
		const tmpl = libraryTemplates.value.find((t) => t.id === id);
		if (tmpl) {
			useLibrary(tmpl, false, false);
			return;
		}
	}
	emit('createCharacter', false, selectedTemplateId.value || null);
}

function createFromTemplate(characterID: string) {
	emit('createFromTemplate', characterID);
}

function toggleTemplate(characterID: string) {
	emit('toggleTemplate', characterID);
}

function loadCharacter(characterID: string) {
	emit('loadCharacter', characterID);
}

function duplicateCharacter(characterID: string) {
	emit('duplicateCharacter', characterID);
}

function exportCharacter(characterID: string) {
	emit('exportCharacter', characterID);
}

function exportAll() {
	emit('exportAllCharacters');
}

function promptDeleteCharacter(character: any) {
	characterToDelete.value = character;
	showDeleteConfirm.value = true;
}

function cancelDeleteCharacter() {
	characterToDelete.value = null;
	showDeleteConfirm.value = false;
}

function confirmDeleteCharacter() {
	if (characterToDelete.value) {
		emit('deleteCharacter', characterToDelete.value.id);
	}
	characterToDelete.value = null;
	showDeleteConfirm.value = false;
}

function confirmDeleteAll() {
	showDeleteAllConfirm.value = false;
	emit('deleteAllCharacters');
}

function importStart() {
	inputFile.value?.click();
}

function importGetUploads(event: Event) {
	const input = event.target as HTMLInputElement;

	if (!input.files || !input.files.length) {
		return;
	}

	importError.value = '';

	for (let i = 0; i < input.files.length; i++) {
		const file = input.files[i];

		if (file.size > 25 * 1024 * 1024) {
			importError.value = '“' + file.name + '” is larger than 25 MB and was skipped.';
			continue;
		}

		const reader = new FileReader();
		reader.readAsText(file);
		reader.onload = () => {
			try {
				const data = JSON.parse(reader.result as string);
				let candidates: any[] = [];
				if (Array.isArray(data)) {
					candidates = data;
				} else if (data && data.characters && Array.isArray(data.characters)) {
					candidates = data.characters;
				} else if (data && typeof data === 'object' && data.id) {
					candidates = [data];
				} else if (data && data.data && typeof data.data === 'object') {
					// Upstream envelope (e.g. { version: 2, data: {...} }): pass the
					// whole envelope through - sanitizeImportedCharacter unwraps it
					// and mints a fresh UUID when the payload has no id, so this
					// imports as new. (Passing data.data directly bypasses the unwrap
					// guard and gets rejected as an id-less object.)
					candidates = Array.isArray(data.data) ? data.data : [data];
				}
				if (!candidates.length) {
					importError.value = 'No characters found in “' + file.name + '”.';
				}
				let added = 0;
				let templatesAdded = 0;
				let invalidSkipped = 0;
				candidates.forEach((char: any) => {
					if (!characterCurioFunctions.isValidCurrentCharacter(char)) {
						invalidSkipped++;
						return;
					}
					// Standalone layout template files reuse the
					// library entry shape; they upsert by static id
					// (replace, never duplicate) instead of importing
					// as characters.
					if (characterCurioFunctions.isSheetTemplateFile(char)) {
						emit('importSheetTemplate', char);
						templatesAdded++;
						return;
					}
					const clean = characterCurioFunctions.sanitizeImportedCharacter(char);
					if (clean) {
						importQueue.value.push(clean);
						added++;
					}
				});
				candidates = candidates.filter((c: any) => !characterCurioFunctions.isSheetTemplateFile(c));
				if (added < candidates.length) {
					importError.value =
						'Skipped ' +
						(candidates.length - added) +
						' invalid entr' +
						(candidates.length - added === 1 ? 'y' : 'ies') +
						' in “' +
						file.name +
						'”.';
				}
				if (invalidSkipped && added === 0 && templatesAdded === 0) {
					importError.value = characterCurioFunctions.INVALID_FILE_MESSAGE;
				}
				importNextQueueItem();
			} catch (error) {
				importError.value = 'Could not read “' + file.name + '” as a character file.';
			}
		};
		reader.onerror = () => {
			importError.value = 'Could not read the selected file.';
		};
	}
}

function importNextQueueItem() {
	if (!importQueue.value.length || importBuffer.value !== null) return;

	const newCharacter = importQueue.value.shift();

	const c = props.characters.findIndex((existingCharacter: any) => existingCharacter.id === newCharacter.id);

	importBuffer.value = {
		newCharacter: newCharacter,
		oldCharacterIndex: c,
		oldCharacter: null,
	};

	if (c !== -1) {
		importBuffer.value.oldCharacter = props.characters[c];
		showImportConfirm.value = true;
	} else {
		// Skip the confirmation step if the character doesn’t already exist.
		importConfirm();
	}
}

async function importCancel() {
	showImportConfirm.value = false;
	importBuffer.value = null;
	if (inputFile.value) inputFile.value.value = '';

	await nextTick();
	importNextQueueItem();
}

async function importConfirm() {
	const character = importBuffer.value.newCharacter;

	showImportConfirm.value = false;
	importBuffer.value = null;
	if (inputFile.value) inputFile.value.value = '';

	// Convert timestamps to strings.
	const dateProperties = ['dateCreated', 'dateModified'];
	for (let i = 0; i < dateProperties.length; i++) {
		const property = dateProperties[i];

		if (typeof character[property] === 'number') {
			character[property] = new Date(character[property]).toISOString();
		}
	}

	// D5: import must not materialize defaults — layout inherits from
	// the linked template at merge; the renderer treats absence as
	// empty. Identity (set ids) was ensured at sanitize time.
	emit('importCharacter', character);

	await nextTick();
	importNextQueueItem();
}

function renderDate(timestamp: any) {
	return characterCurioFunctions.renderDate(timestamp);
}

function getRelativeDateLabel(date1: any, date2: any) {
	const d1 = new Date(date1).getTime();
	const d2 = new Date(date2).getTime();
	if (d2 > d1) return 'newer';
	if (d2 < d1) return 'older';
	return 'same age';
}
</script>

<template>
	<section class="roster">
		<div class="roster-inner">
			<h1 class="sr-only">Character Roster</h1>
			<!-- BUTTON: ADD/IMPORT CHARACTER -->
			<div class="roster-button-container">
				<div class="roster-button-container-inner">
					<button type="button" class="roster-button" @click.stop="createCharacter">
						<span><i class="fas fa-plus" aria-hidden="true"></i> New Sheet</span>
					</button>

					<label class="roster-template-picker">
						<span class="picker-label">Template</span>
						<select
							id="roster-template-picker"
							name="selectedTemplateId"
							v-model="selectedTemplateId"
							class="picker-select"
							aria-label="Template"
						>
							<option value="">None</option>
							<optgroup v-if="templateSheets.length" label="Saved Templates">
								<option v-for="tmpl in templateSheets" :key="tmpl.id" :value="tmpl.id">
									{{ tmpl.name || 'Unnamed Template' }}
								</option>
							</optgroup>
							<optgroup label="Library Templates">
								<option v-for="tmpl in libraryTemplates" :key="tmpl.id" :value="'library:' + tmpl.id">
									{{ getTemplateTitle(tmpl) }}
								</option>
							</optgroup>
						</select>
					</label>

					<button type="button" class="roster-button roster-button-library" @click.stop="openLibrary">
						<span><i class="fas fa-layer-group" aria-hidden="true"></i> Library</span>
					</button>

					<button type="button" class="roster-button roster-button-card-builder" @click.stop="showTraitSetMini = true">
						<span><i class="fas fa-th-large" aria-hidden="true"></i> Card Builder</span>
					</button>

					<button type="button" class="roster-button roster-button-import" @click.stop="importStart">
						<span><i class="fas fa-upload" aria-hidden="true"></i> Import</span>
					</button>

					<div class="roster-import-error" v-if="importError">{{ importError }}</div>

					<button
						type="button"
						class="roster-button roster-button-export"
						@click.stop="exportAll"
						v-if="characters.length > 0"
					>
						<span><i class="fas fa-file-export" aria-hidden="true"></i> Export All</span>
					</button>

					<button
						type="button"
						class="roster-button roster-button-delete-all"
						@click.stop="showDeleteAllConfirm = true"
						v-if="characters.length > 0"
					>
						<span><i class="fas fa-trash-alt" aria-hidden="true"></i> Delete All</span>
					</button>
				</div>
			</div>

			<!-- SEARCH -->
			<search class="roster-search" v-if="characters.length > 0">
				<div class="roster-search-input">
					<i class="fas fa-search" aria-hidden="true"></i>
					<input
						type="text"
						id="roster-search"
						name="rosterSearch"
						v-model="rosterSearch"
						placeholder="Search"
						aria-label="Search characters"
					/>
				</div>
			</search>

			<!-- FILTER TABS -->
			<div class="roster-filter-tabs" v-if="characters.length > 0">
				<button
					type="button"
					:class="{ active: filterMode === 'all' }"
					:aria-pressed="filterMode === 'all'"
					@click="filterMode = 'all'"
				>
					All <span class="tab-count">({{ allCount }})</span>
				</button>
				<button
					type="button"
					:class="{ active: filterMode === 'characters' }"
					:aria-pressed="filterMode === 'characters'"
					@click="filterMode = 'characters'"
				>
					Characters <span class="tab-count">({{ characterCount }})</span>
				</button>
				<button
					type="button"
					:class="{ active: filterMode === 'templates' }"
					:aria-pressed="filterMode === 'templates'"
					@click="filterMode = 'templates'"
				>
					Templates <span class="tab-count">({{ templateCount }})</span>
				</button>
			</div>

			<div class="roster-empty" v-if="charactersFiltered.length === 0">No sheets found.</div>

			<!-- CHARACTER LIST -->
			<ul class="roster-list">
				<transition-group appear>
					<li class="roster-item" v-for="character in charactersFiltered" :key="character.id">
						<div>
							<button
								type="button"
								:class="'roster-item-portrait alignment-' + (getView(character.portrait)?.alignment || 'center')"
								:aria-label="'Open ' + (character.name || 'Unnamed')"
								@click.stop="loadCharacter(character.id)"
							>
								<img
									v-if="character.portrait?.url?.length"
									:src="safeImageUrl(character.portrait.url)"
									alt=""
									width="160"
									height="160"
									loading="lazy"
									decoding="async"
								/>
								<span class="roster-item-portrait-placeholder" v-if="!character.portrait?.url?.length">
									<i class="fas fa-user" aria-hidden="true"></i>
								</span>
							</button>
						</div>

						<div>
							<div class="roster-item-title-row">
								<h2 class="roster-item-name">
									<button
										type="button"
										class="roster-item-name-btn"
										@click.stop="loadCharacter(character.id)"
										v-text="character.name"
									></button>
								</h2>
								<span class="roster-badge-template" v-if="character.isTemplate"
									><i class="fas fa-bookmark" aria-hidden="true"></i> Template</span
								>
							</div>

							<div class="roster-description" v-text="character.description"></div>

							<div class="roster-tags" v-if="Array.isArray(character.tags) && character.tags.length > 0">
								<button
									type="button"
									class="roster-tag-chip"
									v-for="(tag, tIdx) in character.tags"
									:key="character.id + '-tag-' + tIdx"
									@click.stop="rosterSearch = tag"
									:title="'Filter by tag ' + tag"
								>
									<i class="fas fa-tag" aria-hidden="true"></i>
									<span>{{ tag }}</span>
								</button>
							</div>

							<div class="roster-date">
								<span class="roster-date-label">Last modified: </span>
								<span v-html="renderDate(character.dateModified)"></span>
							</div>

							<div class="roster-item-button-container">
								<div class="roster-item-button-container-inner">
									<!-- USE TEMPLATE (IF TEMPLATE) -->
									<button
										type="button"
										class="roster-item-button roster-button-use-template"
										v-if="character.isTemplate"
										@click.stop="createFromTemplate(character.id)"
										title="Create a new character from this template"
									>
										<span><i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i> Use</span>
									</button>

									<!-- LOAD -->
									<button type="button" class="roster-item-button" @click.stop="loadCharacter(character.id)">
										<span><i class="fas fa-eye" aria-hidden="true"></i> Open</span>
									</button>

									<!-- DUPLICATE -->
									<button
										type="button"
										class="roster-item-button roster-button-duplicate"
										@click.stop="duplicateCharacter(character.id)"
									>
										<span><i class="fas fa-copy" aria-hidden="true"></i> Duplicate</span>
									</button>

									<!-- TOGGLE TEMPLATE -->
									<button
										type="button"
										class="roster-item-button roster-button-toggle-template"
										@click.stop="toggleTemplate(character.id)"
										:title="character.isTemplate ? 'Convert to regular character' : 'Save as template'"
									>
										<span
											><i :class="character.isTemplate ? 'fas fa-bookmark' : 'far fa-bookmark'" aria-hidden="true"></i>
											{{ character.isTemplate ? 'Template' : 'Set Template' }}</span
										>
									</button>

									<!-- EXPORT -->
									<button
										type="button"
										class="roster-item-button roster-button-export"
										@click.stop="exportCharacter(character.id)"
									>
										<span><i class="fas fa-download" aria-hidden="true"></i> Export</span>
									</button>

									<!-- DELETE -->
									<button
										type="button"
										class="roster-item-button roster-button-delete"
										@click.stop="promptDeleteCharacter(character)"
									>
										<span><i class="fas fa-trash" aria-hidden="true"></i> Delete</span>
									</button>
								</div>
							</div>
						</div>
					</li>
				</transition-group>
			</ul>

			<!-- FILE INPUT -->
			<input
				class="roster-input"
				id="roster-import-file"
				name="importFile"
				type="file"
				ref="inputFile"
				@change="importGetUploads"
				multiple
				accept=".json,.curio.json,.layered.json,application/json"
				aria-label="Import character files"
			/>
		</div>

		<ModalDialog
			v-if="showImportConfirm"
			:open="showImportConfirm"
			label="Replace existing character"
			@close="importCancel()"
		>
			<button type="button" class="modal-close" aria-label="Close" @click.prevent="importCancel()">
				<i class="fas fa-times" aria-hidden="true"></i>
			</button>
			<div class="modal-inner">
				<p>A character with this ID already exists. Do you want to replace it?</p>

				<div class="modal-import-details">
					<div>
						<p>
							<span class="modal-import-prefix">Replace this…</span><br />
							{{ importBuffer.oldCharacter.name }}<br />
							<span class="modal-import-date">{{ renderDate(importBuffer.oldCharacter.dateModified) }}</span>
						</p>
					</div>
					<div>
						<p>
							<span class="modal-import-prefix">…with this?</span><br />
							{{ importBuffer.newCharacter.name }}<br />
							<span class="modal-import-date"
								>{{ renderDate(importBuffer.newCharacter.dateModified) }}
								<span class="modal-import-date-suffix"
									>({{
										getRelativeDateLabel(
											importBuffer.oldCharacter.dateModified,
											importBuffer.newCharacter.dateModified,
										)
									}})</span
								></span
							>
						</p>
					</div>
				</div>

				<div class="modal-button-container">
					<div class="modal-button-container-inner">
						<button type="button" class="modal-button modal-button-yes" @click.stop="importConfirm()">
							<span><i class="fas fa-check" aria-hidden="true"></i> Import</span>
						</button>
						<button type="button" class="modal-button modal-button-no" @click.stop="importCancel()">
							<span><i class="fas fa-times" aria-hidden="true"></i> Cancel</span>
						</button>
					</div>
				</div>
			</div>
		</ModalDialog>

		<!-- DELETE CHARACTER CONFIRMATION MODAL -->
		<ModalDialog
			v-if="showDeleteConfirm && characterToDelete"
			:open="showDeleteConfirm"
			label="Delete character"
			dialog-class="modal-confirm"
			@close="cancelDeleteCharacter()"
		>
			<button type="button" class="modal-close" aria-label="Close" @click.prevent="cancelDeleteCharacter()">
				<i class="fas fa-times" aria-hidden="true"></i>
			</button>
			<div class="modal-inner">
				<p>
					Are you sure you want to delete
					<strong>{{
						characterToDelete.name && characterToDelete.name.length ? characterToDelete.name : 'this character'
					}}</strong
					>?
				</p>
				<p class="modal-warning-text">
					<i class="fas fa-exclamation-triangle" aria-hidden="true"></i> This action cannot be undone.
				</p>
				<div class="modal-button-container">
					<div class="modal-button-container-inner">
						<button type="button" class="modal-button modal-button-delete" @click.stop="confirmDeleteCharacter()">
							<span><i class="fas fa-trash" aria-hidden="true"></i> Delete</span>
						</button>
						<button type="button" class="modal-button modal-button-no" @click.stop="cancelDeleteCharacter()">
							<span><i class="fas fa-times" aria-hidden="true"></i> Cancel</span>
						</button>
					</div>
				</div>
			</div>
		</ModalDialog>

		<!-- DELETE ALL CHARACTERS CONFIRMATION MODAL -->
		<ModalDialog
			v-if="showDeleteAllConfirm"
			:open="showDeleteAllConfirm"
			label="Delete all characters"
			dialog-class="modal-confirm"
			@close="showDeleteAllConfirm = false"
		>
			<button type="button" class="modal-close" aria-label="Close" @click.prevent="showDeleteAllConfirm = false">
				<i class="fas fa-times" aria-hidden="true"></i>
			</button>
			<div class="modal-inner">
				<p>
					Are you sure you want to delete <strong>all {{ characters.length }} characters and templates</strong>?
				</p>
				<p class="modal-warning-text">
					<i class="fas fa-exclamation-triangle" aria-hidden="true"></i> This action cannot be undone. Consider
					exporting a backup first.
				</p>
				<div class="modal-button-container">
					<div class="modal-button-container-inner">
						<button type="button" class="modal-button modal-button-delete" @click.stop="confirmDeleteAll()">
							<span><i class="fas fa-trash-alt" aria-hidden="true"></i> Delete All</span>
						</button>
						<button type="button" class="modal-button modal-button-no" @click.stop="showDeleteAllConfirm = false">
							<span><i class="fas fa-times" aria-hidden="true"></i> Cancel</span>
						</button>
					</div>
				</div>
			</div>
		</ModalDialog>

		<!-- LIBRARY MODAL -->
		<ModalDialog
			v-if="showLibrary"
			:open="showLibrary"
			label="Template library"
			dialog-class="modal-library"
			@close="showLibrary = false"
		>
			<button type="button" class="modal-close" aria-label="Close" @click.prevent="showLibrary = false">
				<i class="fas fa-times" aria-hidden="true"></i>
			</button>
			<div class="modal-inner">
				<header class="library-header">
					<div class="library-title-row">
						<h2><i class="fas fa-book-open" aria-hidden="true"></i> Library</h2>
						<span class="library-count" aria-label="Visible templates">
							{{ libraryTemplatesFiltered.length
							}}<template v-if="libraryTemplatesFiltered.length !== libraryTemplates.length">
								/ {{ libraryTemplates.length }}</template
							>
						</span>
					</div>

					<search class="library-controls">
						<div class="library-search-input">
							<i class="fas fa-search" aria-hidden="true"></i>
							<input
								type="text"
								id="library-search"
								name="librarySearch"
								v-model="librarySearch"
								placeholder="Search name, genre, or trait sets..."
								aria-label="Search templates"
								autocorrect="off"
								autocapitalize="none"
								spellcheck="false"
							/>
							<button
								v-if="librarySearch"
								type="button"
								class="library-search-clear"
								aria-label="Clear search"
								@click="librarySearch = ''"
							>
								<i class="fas fa-times" aria-hidden="true"></i>
							</button>
						</div>

						<div class="library-filter-pills" role="group" aria-label="Filter templates">
							<button
								type="button"
								class="library-filter-pill"
								:class="{ active: effectiveLibraryCategory === 'all' }"
								:aria-pressed="effectiveLibraryCategory === 'all'"
								@click="libraryCategory = 'all'"
							>
								All <span class="library-filter-count">{{ libraryCategoryCounts.all }}</span>
							</button>
							<button
								type="button"
								class="library-filter-pill"
								:class="{ active: effectiveLibraryCategory === 'official' }"
								:aria-pressed="effectiveLibraryCategory === 'official'"
								@click="libraryCategory = 'official'"
							>
								Official <span class="library-filter-count">{{ libraryCategoryCounts.official }}</span>
							</button>
							<button
								type="button"
								class="library-filter-pill"
								:class="{ active: effectiveLibraryCategory === 'reference' }"
								:aria-pressed="effectiveLibraryCategory === 'reference'"
								@click="libraryCategory = 'reference'"
							>
								Reference <span class="library-filter-count">{{ libraryCategoryCounts.reference }}</span>
							</button>
							<button
								v-if="libraryCategoryCounts.saved > 0"
								type="button"
								class="library-filter-pill"
								:class="{ active: effectiveLibraryCategory === 'saved' }"
								:aria-pressed="effectiveLibraryCategory === 'saved'"
								@click="libraryCategory = 'saved'"
							>
								Saved <span class="library-filter-count">{{ libraryCategoryCounts.saved }}</span>
							</button>
						</div>
					</search>
				</header>

				<div class="library-body">
					<div class="library-loading" v-if="libraryLoading">
						<i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i> Loading Library…
					</div>
					<div class="roster-import-error" v-if="libraryError">{{ libraryError }}</div>
					<div class="library-empty" v-if="!libraryLoading && !libraryError && libraryTemplatesFiltered.length === 0">
						<p>No matching templates.</p>
						<button type="button" class="btn-library secondary" @click="resetLibraryFilters">Reset</button>
					</div>
					<div class="library-grid" v-if="libraryTemplatesFiltered.length > 0">
						<article class="library-card" v-for="tmpl in libraryTemplatesFiltered" :key="tmpl.id">
							<header class="library-card-header">
								<div
									class="library-card-badges"
									v-if="getTemplateGenre(tmpl) || tmpl.userSaved || cardMetaBadges(tmpl).length"
								>
									<span class="badge-genre" v-if="getTemplateGenre(tmpl) || tmpl.userSaved">{{
										getTemplateGenre(tmpl) || 'Saved'
									}}</span>
									<span class="badge-meta" v-for="badge in cardMetaBadges(tmpl)" :key="badge">{{ badge }}</span>
								</div>
								<h3 class="library-card-title">
									<a
										v-if="safeLinkUrl(getTemplateListing(tmpl)?.url)"
										:href="safeLinkUrl(getTemplateListing(tmpl)?.url)"
										target="_blank"
										rel="noopener noreferrer"
										>{{ getTemplateTitle(tmpl) }}</a
									>
									<template v-else>{{ getTemplateTitle(tmpl) }}</template>
								</h3>
								<div class="library-card-subtitle" v-if="getTemplateSubtitle(tmpl)">
									{{ getTemplateSubtitle(tmpl) }}
								</div>
							</header>

							<div
								v-if="cardHeroImage(tmpl)"
								class="library-card-hero"
								:class="{ 'is-portrait-only': !cardHasRatings(tmpl) }"
							>
								<div class="portrait portrait-shape-circle">
									<div class="portrait-inner">
										<div
											class="portrait-circle portrait-alignment-top-center"
											:style="'background-image: url(' + safeImageUrl(cardHeroImage(tmpl)) + ');'"
										></div>
										<TraitSetFrame mode="portrait" :trait-set="cardRingCharacter(tmpl).traitSets[0]" />
									</div>
									<PortraitRing
										v-if="cardHasRatings(tmpl)"
										:character="cardRingCharacter(tmpl)"
										:editing="[]"
										:ringTraitID="0"
									/>
								</div>
							</div>
							<div v-else class="library-card-schematic" aria-hidden="true">
								<div
									class="schematic-page"
									:class="{
										'is-landscape':
											(getView(tmpl.character)?.pageOrientation || getView(tmpl.character)?.orientation) ===
											'landscape',
									}"
								>
									<span
										v-for="(kind, idx) in cardSchematicBlocks(tmpl)"
										:key="idx"
										class="schematic-block"
										:class="'schematic-' + kind"
									></span>
								</div>
								<span class="schematic-caption"
									>{{ cardTraitTags(tmpl).visible.length + cardTraitTags(tmpl).overflow }} trait sets</span
								>
							</div>

							<p class="library-card-desc" v-if="cardDescription(tmpl)">{{ cardDescription(tmpl) }}</p>

							<footer class="library-card-footer">
								<div class="library-card-traits" v-if="cardTraitTags(tmpl).visible.length">
									<span class="trait-tag" v-for="name in cardTraitTags(tmpl).visible" :key="name">{{ name }}</span>
									<span class="trait-tag trait-tag-more" v-if="cardTraitTags(tmpl).overflow > 0"
										>+{{ cardTraitTags(tmpl).overflow }}</span
									>
								</div>
								<div class="library-card-actions">
									<div class="library-actions-primary">
										<button
											type="button"
											class="btn-library secondary"
											v-if="tmpl.character"
											@click="emit('previewTemplate', tmpl)"
											title="Preview sheet"
										>
											<i class="fas fa-eye" aria-hidden="true"></i> Preview
										</button>
										<button
											type="button"
											class="btn-library primary"
											@click="useLibrary(tmpl, false, false)"
											title="Create character"
										>
											<i class="fas fa-plus" aria-hidden="true"></i> Character
										</button>
									</div>
									<div class="library-actions-utility">
										<button
											type="button"
											class="btn-library subtle"
											@click="useLibrary(tmpl, true, false)"
											title="Save template"
										>
											<i class="fas fa-bookmark" aria-hidden="true"></i> Template
										</button>
										<button
											type="button"
											class="btn-library subtle print"
											@click="useLibrary(tmpl, false, true)"
											title="Print sheet"
										>
											<i class="fas fa-print" aria-hidden="true"></i> Print
										</button>
										<button
											v-if="isSavedSheetTemplate(tmpl)"
											type="button"
											class="btn-library subtle danger"
											@click="emit('deleteSheetTemplate', tmpl.id)"
											title="Remove template"
										>
											<i class="fas fa-trash" aria-hidden="true"></i> Remove
										</button>
									</div>
								</div>
							</footer>
						</article>
					</div>
				</div>
			</div>
		</ModalDialog>

		<TraitSetMini v-if="showTraitSetMini" @close="showTraitSetMini = false" />
	</section>
</template>
