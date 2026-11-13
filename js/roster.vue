<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import { getView } from './model.ts';
import PortraitRing from './portrait-ring.vue';
import ModalDialog from './modal-dialog.vue';
import TraitSetMini from './trait-set-mini.vue';
import { SHOWCASE_TEMPLATES, DREAMER_ARCHITECT_SHOWCASE } from './showcase-templates.ts';

declare const characterCurioLibraryTemplates: any;

const props = withDefaults(
	defineProps<{
		characters: any[];
		openCharacterIDs?: string[];
	}>(),
	{
		openCharacterIDs: () => [],
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
const showDeleteConfirm = ref(false);
const characterToDelete = ref<any>(null);
const showDeleteAllConfirm = ref(false);
const showLibrary = ref(false);
const showTraitSetMini = ref(false);
const librarySearch = ref('');

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

const libraryTemplates = computed(() => {
	const base = typeof characterCurioLibraryTemplates !== 'undefined' ? characterCurioLibraryTemplates : [];
	if (typeof characterCurioLibraryTemplates === 'undefined') {
		loadLibraryTemplates();
	}
	const firstRun = !props.characters || props.characters.length === 0;
	return firstRun ? [DREAMER_ARCHITECT_SHOWCASE, ...SHOWCASE_TEMPLATES, ...base] : [...SHOWCASE_TEMPLATES, ...base];
});

const libraryTemplatesFiltered = computed(() => {
	let list = libraryTemplates.value;
	if (librarySearch.value && librarySearch.value.trim().length) {
		const q = librarySearch.value.toLowerCase().trim();
		list = list.filter(
			(t: any) =>
				t.title.toLowerCase().includes(q) ||
				(t.subtitle && t.subtitle.toLowerCase().includes(q)) ||
				(t.genre && t.genre.toLowerCase().includes(q)) ||
				(t.listing && t.listing.genre && t.listing.genre.toLowerCase().includes(q)) ||
				(t.listing && t.listing.quote && t.listing.quote.toLowerCase().includes(q)),
		);
	}
	return list;
});

function safeImageUrl(url: any) {
	return characterCurioFunctions.safeImageUrl(url);
}

// Mini character for a library card hero: the listing cover is the
// portrait, Setting/Prep/Complexity are a three-trait set rendered on
// the ring by the sheet's own ring component + die icons.
function cardRingCharacter(tmpl: any) {
	const sizeOf = (v: unknown) => {
		const m = /^d(\d+)$/.exec(String(v || ''));
		return m ? Number(m[1]) : 0;
	};
	const listing = (tmpl && tmpl.listing) || {};
	return {
		name: tmpl.title,
		portrait: { url: listing.image || '' },
		traitSets: [
			{
				id: 'ratings',
				name: 'Ratings',
				traits: [
					{
						name: 'Setting',
						value: sizeOf(listing.setting),
						rating: { type: 'Die', value: [sizeOf(listing.setting)] },
						dice: [],
					},
					{
						name: 'Prep',
						value: sizeOf(listing.prep),
						rating: { type: 'Die', value: [sizeOf(listing.prep)] },
						dice: [],
					},
					{
						name: 'Complexity',
						value: sizeOf(listing.complexity),
						rating: { type: 'Die', value: [sizeOf(listing.complexity)] },
						dice: [],
					},
				],
			},
		],
	};
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
				let legacySkipped = 0;
				candidates.forEach((char: any) => {
					if (characterCurioFunctions.isLegacyFile(char)) {
						legacySkipped++;
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
				if (legacySkipped) importError.value = characterCurioFunctions.LEGACY_FILE_MESSAGE;
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
									{{ tmpl.title || tmpl.id }}
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
				<div class="library-header">
					<h2><i class="fas fa-book-open" aria-hidden="true"></i> Library</h2>
					<p>
						Select a character sheet template from the official collections. Create a new character, save to your
						templates, or print directly.
					</p>

					<search class="library-search-row">
						<div class="library-search-input">
							<i class="fas fa-search" aria-hidden="true"></i>
							<input
								type="text"
								id="library-search"
								name="librarySearch"
								v-model="librarySearch"
								placeholder="Search templates by name, genre, or mechanics..."
								aria-label="Search templates"
							/>
						</div>
					</search>
				</div>

				<div class="library-grid">
					<div class="library-loading" v-if="libraryLoading">
						<i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i> Loading Library…
					</div>
					<div class="roster-import-error" v-if="libraryError">{{ libraryError }}</div>
					<div class="library-card" v-for="tmpl in libraryTemplatesFiltered" :key="tmpl.id">
						<div class="library-card-header">
							<div class="library-card-title-group">
								<h3 class="library-card-title">
									<a v-if="tmpl.listing && tmpl.listing.url" :href="tmpl.listing.url" target="_blank" rel="noopener">{{
										tmpl.title
									}}</a>
									<template v-else>{{ tmpl.title }}</template>
								</h3>
								<div class="library-card-subtitle">{{ tmpl.subtitle }}</div>
							</div>
							<div class="library-card-badges">
								<span class="badge-genre">{{ (tmpl.listing && tmpl.listing.genre) || tmpl.genre }}</span>
							</div>
						</div>
						<div class="library-card-hero" v-if="tmpl.listing && tmpl.listing.image">
							<div class="portrait">
								<div class="portrait-inner">
									<div
										class="portrait-circle portrait-alignment-top-center"
										:style="'background-image: url(' + safeImageUrl(tmpl.listing.image) + ');'"
									></div>
								</div>
								<PortraitRing :character="cardRingCharacter(tmpl)" :editing="[]" :ringTraitID="0" />
							</div>
						</div>
						<p class="library-card-desc" v-if="tmpl.listing && tmpl.listing.quote">{{ tmpl.listing.quote }}</p>
						<div class="library-card-traits">
							<span class="trait-tag" v-for="ts in tmpl.character.traitSets || []" :key="ts.name">{{ ts.name }}</span>
						</div>
						<div class="library-card-actions">
							<button
								type="button"
								class="btn-library secondary"
								v-if="tmpl.character"
								@click="emit('previewTemplate', tmpl)"
								title="Preview template"
							>
								<i class="fas fa-eye" aria-hidden="true"></i> Preview
							</button>
							<button
								type="button"
								class="btn-library primary"
								@click="useLibrary(tmpl, false, false)"
								title="Create an editable character"
							>
								<i class="fas fa-plus" aria-hidden="true"></i> Character
							</button>
							<button
								type="button"
								class="btn-library secondary"
								@click="useLibrary(tmpl, true, false)"
								title="Save template to Roster"
							>
								<i class="fas fa-bookmark" aria-hidden="true"></i> Template
							</button>
							<button
								type="button"
								class="btn-library print"
								@click="useLibrary(tmpl, false, true)"
								title="Open in Print Tab"
							>
								<i class="fas fa-print" aria-hidden="true"></i> Print
							</button>
						</div>
					</div>
				</div>
			</div>
		</ModalDialog>

		<TraitSetMini v-if="showTraitSetMini" @close="showTraitSetMini = false" />
	</section>
</template>
