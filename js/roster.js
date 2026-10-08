const Roster = {

	props: {
		characters: Array,
		openCharacterIDs: {
			type: Array,
			default: () => []
		},
	},

	data() {
		return {
			filterMode:        'all', // 'all', 'characters', 'templates'
			showImportConfirm: false,
			importQueue:       [],
			importBuffer:      null,
			importError:       '',
			spotlightLoading:  false,
			spotlightError:    '',
			showDeleteConfirm: false,
			characterToDelete: null,
			showDeleteAllConfirm: false,
			showSpotlightLibrary: false,
			spotlightSearch: '',
			spotlightFilter: 'all',
		};
	},

	computed: {

		charactersSorted() {
			return [...this.characters].sort((a, b) => {

				let aDate = Math.max( ( new Date(a.dateCreated)).getTime(), ( new Date(a.dateModified)).getTime(), ( new Date(a.dateTouched) ).getTime() );
				let bDate = Math.max( ( new Date(b.dateCreated)).getTime(), ( new Date(b.dateModified)).getTime(), ( new Date(b.dateTouched) ).getTime() );

				return bDate - aDate;

			});
		},

		templateCount() {
			return this.characters.filter( c => !!c.isTemplate ).length;
		},

		characterCount() {
			return this.characters.filter( c => !c.isTemplate ).length;
		},

		charactersFiltered() {
			let sorted = this.charactersSorted;
			if ( this.filterMode === 'templates' ) {
				return sorted.filter( c => !!c.isTemplate );
			}
			if ( this.filterMode === 'characters' ) {
				return sorted.filter( c => !c.isTemplate );
			}
			return sorted;
		},

		spotlightTemplates() {
			if ( typeof cortexSpotlightTemplates !== 'undefined' ) return cortexSpotlightTemplates;
			this.loadSpotlightTemplates();
			return [];
		},

		spotlightTemplatesFiltered() {
			let list = this.spotlightTemplates;
			if ( this.spotlightFilter === '1page' ) {
				list = list.filter( t => t.pages === 1 );
			} else if ( this.spotlightFilter === '2page' ) {
				list = list.filter( t => t.pages >= 2 );
			}
			if ( this.spotlightSearch && this.spotlightSearch.trim().length ) {
				let q = this.spotlightSearch.toLowerCase().trim();
				list = list.filter( t => 
					t.title.toLowerCase().includes(q) || 
					(t.subtitle && t.subtitle.toLowerCase().includes(q)) || 
					(t.genre && t.genre.toLowerCase().includes(q)) || 
					(t.description && t.description.toLowerCase().includes(q)) 
				);
			}
			return list;
		}

	},

	/*html*/
	template: `<section class="roster">
		<div class="roster-inner">
	
			<!-- BUTTON: ADD/IMPORT CHARACTER -->
			<div class="roster-button-container">
				<div class="roster-button-container-inner">

					<div class="roster-button"
						@click.stop="createCharacter"
					>
						<span><i class="fas fa-plus"></i> New Character</span>
					</div>

					<div class="roster-button roster-button-resume"
						@click.stop="$emit('resumeSession')"
						v-if="openCharacterIDs && openCharacterIDs.length > 0"
						title="Return to your open character sheets"
					>
						<span><i class="fas fa-play"></i> Play Session ({{ openCharacterIDs.length }})</span>
					</div>

					<div class="roster-button roster-button-template"
						@click.stop="createTemplate"
					>
						<span><i class="fas fa-bookmark"></i> New Template</span>
					</div>

					<div class="roster-button roster-button-spotlight"
						@click.stop="openSpotlightLibrary"
					>
						<span><i class="fas fa-layer-group"></i> Spotlight Library</span>
					</div>

					<div class="roster-button roster-button-import"
						@click.stop="importStart"
					>
						<span><i class="fas fa-upload"></i> Import</span>
					</div>

					<div class="roster-import-error" v-if="importError">{{ importError }}</div>

					<div class="roster-button roster-button-export"
						@click.stop="exportAll"
						v-if="characters.length > 0"
					>
						<span><i class="fas fa-file-export"></i> Export All</span>
					</div>

					<div class="roster-button roster-button-delete-all"
						@click.stop="showDeleteAllConfirm = true"
						v-if="characters.length > 0"
					>
						<span><i class="fas fa-trash-alt"></i> Delete All</span>
					</div>

				</div>
			</div>

			<!-- FILTER TABS -->
			<div class="roster-filter-tabs" v-if="characters.length > 0">
				<button :class="{ active: filterMode === 'all' }" @click="filterMode = 'all'">
					All <span class="tab-count">({{ characters.length }})</span>
				</button>
				<button :class="{ active: filterMode === 'characters' }" @click="filterMode = 'characters'">
					Characters <span class="tab-count">({{ characterCount }})</span>
				</button>
				<button :class="{ active: filterMode === 'templates' }" @click="filterMode = 'templates'">
					Templates <span class="tab-count">({{ templateCount }})</span>
				</button>
			</div>

			<!-- CHARACTER LIST -->
			<ul class="roster-list">

				<transition-group appear>
				<li class="roster-item"
					v-for="character in charactersFiltered" :key="character.id"
				>

					<div>

						<div :class="'roster-item-portrait alignment-' + (character.portrait?.custom?.cortexToolkit?.alignment || 'center')"
							:style="'background-image: url(' + safeImageUrl(character.portrait?.url || '') + ');'"
							@click.stop="loadCharacter( character.id )"
						>
							<div class="roster-item-portrait-placeholder" v-if="!character.portrait?.url?.length"><i class="fas fa-user"></i></div>
						</div>

					</div>

					<div>

						<div class="roster-item-title-row">
							<h3 class="roster-item-name" v-text="character.name"
								@click.stop="loadCharacter( character.id )"
							></h3>
							<span class="roster-badge-template" v-if="character.isTemplate"><i class="fas fa-bookmark"></i> Template</span>
						</div>
						
						<div class="roster-description" v-text="character.description"></div>

						<div class="roster-date">
							<span class="roster-date-label">Last modified: </span>
							<span v-html="renderDate(character.dateModified)"></span>
						</div>

						<div class="roster-item-button-container">
							<div class="roster-item-button-container-inner">

								<!-- USE TEMPLATE (IF TEMPLATE) -->
								<div class="roster-item-button roster-button-use-template"
									v-if="character.isTemplate"
									@click.stop="createFromTemplate( character.id )"
									title="Create a new character from this template"
								>
									<span><i class="fas fa-wand-magic-sparkles"></i> Use</span>
								</div>

								<!-- LOAD -->
								<div class="roster-item-button"
									@click.stop="loadCharacter( character.id )"
								>
									<span><i class="fas fa-eye"></i> Open</span>
								</div>

								<!-- OPEN ALONGSIDE -->
								<div class="roster-item-button roster-button-alongside"
									@click.stop="openAlongside( character.id )"
									v-if="openCharacterIDs && openCharacterIDs.length > 0 && !openCharacterIDs.includes(character.id)"
									title="Open alongside your current active session"
								>
									<span><i class="fas fa-columns"></i> Open Alongside</span>
								</div>

								<!-- DUPLICATE -->
								<div class="roster-item-button roster-button-duplicate"
									@click.stop="duplicateCharacter( character.id )"
								>
									<span><i class="fas fa-copy"></i> Duplicate</span>
								</div>

								<!-- TOGGLE TEMPLATE -->
								<div class="roster-item-button roster-button-toggle-template"
									@click.stop="toggleTemplate( character.id )"
									:title="character.isTemplate ? 'Convert to regular character' : 'Save as template'"
								>
									<span><i :class="character.isTemplate ? 'fas fa-bookmark' : 'far fa-bookmark'"></i> {{ character.isTemplate ? 'Template' : 'Set Template' }}</span>
								</div>

								<!-- EXPORT -->
								<div class="roster-item-button roster-button-export"
									@click.stop="exportCharacter( character.id )"
								>
									<span><i class="fas fa-download"></i> Export</span>
								</div>

								<!-- DELETE -->
								<div class="roster-item-button roster-button-delete"
									@click.stop="promptDeleteCharacter( character )"
								>
									<span><i class="fas fa-trash"></i> Delete</span>
								</div>

							</div>
						</div>

					</div>

				</li>
				</transition-group>

			</ul>

			<!-- BUTTON: ADD/IMPORT CHARACTER -->
			<!-- <div class="roster-button-container">
				<div class="roster-button-container-inner">

					<div class="roster-button"
						@click.stop="createCharacter"
					>
						<span><i class="fas fa-plus"></i> New Character</span>
					</div>

					<div class="roster-button roster-button-import"
						@click.stop="importCharacterStart"
					>
						<span><i class="fas fa-upload"></i> Import Character</span>
					</div>

				</div>
			</div> -->

			<!-- FILE INPUT -->
			<input class="roster-input" type="file" ref="inputFile" @change="importGetUploads" multiple>

		</div>
			
		<transition>
		<div class="modal-veil" v-show="showImportConfirm" @click.stop="importCancel()"></div>
		</transition>

		<transition>
		<aside class="modal" v-if="showImportConfirm">
			<div class="modal-close" @click.prevent="importCancel()"><i class="fas fa-times"></i></div>
			<div class="modal-inner">

				<p>A character with this ID already exists. Do you want to replace it?</p>

				<div class="modal-import-details">
					<div>
						<p>
							<span class="modal-import-prefix">Replace this…</span><br>
							{{importBuffer.oldCharacter.name}}<br>
							<span class="modal-import-date">{{renderDate( importBuffer.oldCharacter.dateModified )}}</span>
						</p>
					</div>
					<div>
						<p>
							<span class="modal-import-prefix">…with this?</span><br>
							{{importBuffer.newCharacter.name}}<br>
							<span class="modal-import-date">{{renderDate( importBuffer.newCharacter.dateModified )}} <span class="modal-import-date-suffix">({{ getRelativeDateLabel(importBuffer.oldCharacter.dateModified, importBuffer.newCharacter.dateModified) }})</span></span>
						</p>
					</div>
				</div>

				<div class="modal-button-container">
					<div class="modal-button-container-inner">
						<div class="modal-button modal-button-yes" @click.stop="importConfirm()">
							<span><i class="fas fa-check"></i> Import</span>
						</div>
						<div class="modal-button modal-button-no" @click.stop="importCancel()">
							<span><i class="fas fa-times"></i> Cancel</span>
						</div>
					</div>
				</div>

			</div>
		</aside>
		</transition>

		<!-- DELETE CHARACTER CONFIRMATION MODAL -->
		<transition>
		<div class="modal-veil" v-show="showDeleteConfirm" @click.stop="cancelDeleteCharacter()"></div>
		</transition>

		<transition>
		<aside class="modal modal-confirm" v-if="showDeleteConfirm && characterToDelete">
			<div class="modal-close" @click.prevent="cancelDeleteCharacter()"><i class="fas fa-times"></i></div>
			<div class="modal-inner">
				<p>Are you sure you want to delete <strong>{{ characterToDelete.name && characterToDelete.name.length ? characterToDelete.name : 'this character' }}</strong>?</p>
				<p class="modal-warning-text"><i class="fas fa-exclamation-triangle"></i> This action cannot be undone.</p>
				<div class="modal-button-container">
					<div class="modal-button-container-inner">
						<div class="modal-button modal-button-delete" @click.stop="confirmDeleteCharacter()">
							<span><i class="fas fa-trash"></i> Delete</span>
						</div>
						<div class="modal-button modal-button-no" @click.stop="cancelDeleteCharacter()">
							<span><i class="fas fa-times"></i> Cancel</span>
						</div>
					</div>
				</div>
			</div>
		</aside>
		</transition>

		<!-- DELETE ALL CHARACTERS CONFIRMATION MODAL -->
		<transition>
		<div class="modal-veil" v-show="showDeleteAllConfirm" @click.stop="showDeleteAllConfirm = false"></div>
		</transition>

		<transition>
		<aside class="modal modal-confirm" v-if="showDeleteAllConfirm">
			<div class="modal-close" @click.prevent="showDeleteAllConfirm = false"><i class="fas fa-times"></i></div>
			<div class="modal-inner">
				<p>Are you sure you want to delete <strong>all {{ characters.length }} characters and templates</strong>?</p>
				<p class="modal-warning-text"><i class="fas fa-exclamation-triangle"></i> This action cannot be undone. Consider exporting a backup first.</p>
				<div class="modal-button-container">
					<div class="modal-button-container-inner">
						<div class="modal-button modal-button-delete" @click.stop="confirmDeleteAll()">
							<span><i class="fas fa-trash-alt"></i> Delete All</span>
						</div>
						<div class="modal-button modal-button-no" @click.stop="showDeleteAllConfirm = false">
							<span><i class="fas fa-times"></i> Cancel</span>
						</div>
					</div>
				</div>
			</div>
		</aside>
		</transition>

		<!-- SPOTLIGHT TEMPLATE LIBRARY MODAL -->
		<transition>
		<div class="modal-veil" v-show="showSpotlightLibrary" @click.stop="showSpotlightLibrary = false"></div>
		</transition>

		<transition>
		<aside class="modal modal-spotlight-library" v-if="showSpotlightLibrary">
			<div class="modal-close" @click.prevent="showSpotlightLibrary = false"><i class="fas fa-times"></i></div>
			<div class="modal-inner">
				<div class="spotlight-library-header">
					<h2><i class="fas fa-book-open"></i> Spotlight Templates Library</h2>
					<p>Select a character sheet template from the official Spotlight collections. Create a new character, save to your templates, or print directly.</p>
					
					<div class="spotlight-search-row">
						<div class="spotlight-search-input">
							<i class="fas fa-search"></i>
							<input type="text" v-model="spotlightSearch" placeholder="Search templates by name, genre, or mechanics...">
						</div>
						<div class="spotlight-filter-tabs">
							<button type="button" :class="{ active: spotlightFilter === 'all' }" @click="spotlightFilter = 'all'">All ({{ spotlightTemplates.length }})</button>
							<button type="button" :class="{ active: spotlightFilter === '1page' }" @click="spotlightFilter = '1page'">1 Page</button>
							<button type="button" :class="{ active: spotlightFilter === '2page' }" @click="spotlightFilter = '2page'">2 Pages</button>
						</div>
					</div>
				</div>

				<div class="spotlight-grid">
					<div class="spotlight-loading" v-if="spotlightLoading">
						<i class="fas fa-circle-notch fa-spin"></i> Loading Spotlight library…
					</div>
					<div class="roster-import-error" v-if="spotlightError">{{ spotlightError }}</div>
					<div class="spotlight-card" v-for="tmpl in spotlightTemplatesFiltered" :key="tmpl.id">
						<div class="spotlight-card-header">
							<div class="spotlight-card-title-group">
								<h3 class="spotlight-card-title">{{ tmpl.title }}</h3>
								<div class="spotlight-card-subtitle">{{ tmpl.subtitle }}</div>
							</div>
							<div class="spotlight-card-badges">
								<span class="badge-page-count" :class="{ 'multi-page': tmpl.pages > 1 }">
									<i class="fas" :class="tmpl.pages > 1 ? 'fa-copy' : 'fa-file'"></i> {{ tmpl.pages }} Page{{ tmpl.pages > 1 ? 's' : '' }}
								</span>
								<span class="badge-genre">{{ tmpl.genre }}</span>
							</div>
						</div>
						<p class="spotlight-card-desc">{{ tmpl.description }}</p>
						<div class="spotlight-card-traits">
							<span class="trait-tag" v-for="ts in (tmpl.character.traitSets || [])" :key="ts.name">{{ ts.name }}</span>
						</div>
						<div class="spotlight-card-actions">
							<button type="button" class="btn-spotlight primary" @click="useSpotlight(tmpl, false, false)" title="Create an editable character">
								<i class="fas fa-plus"></i> Character
							</button>
							<button type="button" class="btn-spotlight secondary" @click="useSpotlight(tmpl, true, false)" title="Save template to Roster">
								<i class="fas fa-bookmark"></i> Template
							</button>
							<button type="button" class="btn-spotlight print" @click="useSpotlight(tmpl, false, true)" title="Open in Print Tab">
								<i class="fas fa-print"></i> Print
							</button>
						</div>
					</div>
				</div>
			</div>
		</aside>
		</transition>
		
	</section>`,

	methods: {

		safeImageUrl( url ) {
			return cortexFunctions.safeImageUrl( url );
		},

		openSpotlightLibrary() {
			this.showSpotlightLibrary = true;
			this.loadSpotlightTemplates();
		},

		loadSpotlightTemplates() {
			if ( typeof cortexSpotlightTemplates !== 'undefined' || this.spotlightLoading ) return;
			this.spotlightLoading = true;
			this.spotlightError = '';
			const script = document.createElement( 'script' );
			script.src = 'js/templates.bundle.js?v=33';
			script.onload = () => {
				this.spotlightLoading = false;
				this.$forceUpdate();
			};
			script.onerror = () => {
				this.spotlightLoading = false;
				this.spotlightError = 'Could not load the Spotlight library. Check your connection and try again.';
			};
			document.head.appendChild( script );
		},

		useSpotlight( tmpl, asTemplate = false, openPrint = false ) {
			this.showSpotlightLibrary = false;
			this.$emit('createFromSpotlight', tmpl, asTemplate, openPrint);
		},

		createCharacter() {
			this.$emit('createCharacter');
		},

		createTemplate() {
			this.$emit('createTemplate');
		},

		createFromTemplate( characterID ) {
			this.$emit('createFromTemplate', characterID);
		},

		toggleTemplate( characterID ) {
			this.$emit('toggleTemplate', characterID);
		},

		loadCharacter( characterID ) {
			this.$emit('loadCharacter', characterID);
		},

		openAlongside( characterID ) {
			this.$emit('openAlongside', characterID);
		},

		duplicateCharacter( characterID ) {
			this.$emit('duplicateCharacter', characterID);
		},

		exportCharacter( characterID ) {
			this.$emit('exportCharacter', characterID);
		},

		exportAll() {
			this.$emit('exportAllCharacters');
		},

		promptDeleteCharacter( character ) {
			this.characterToDelete = character;
			this.showDeleteConfirm = true;
		},

		cancelDeleteCharacter() {
			this.characterToDelete = null;
			this.showDeleteConfirm = false;
		},

		confirmDeleteCharacter() {
			if ( this.characterToDelete ) {
				this.$emit('deleteCharacter', this.characterToDelete.id);
			}
			this.characterToDelete = null;
			this.showDeleteConfirm = false;
		},

		confirmDeleteAll() {
			this.showDeleteAllConfirm = false;
			this.$emit('deleteAllCharacters');
		},

		importStart() {
			this.$refs.inputFile.click();
		},

		importGetUploads( event ) {

			if ( !event.target.files || !event.target.files.length ) {
				return;
			}

			this.importError = '';

			for (let i = 0; i < event.target.files.length; i++) {
				const file = event.target.files[i];

				if ( file.size > 25 * 1024 * 1024 ) {
					this.importError = '“' + file.name + '” is larger than 25 MB and was skipped.';
					continue;
				}

				let reader = new FileReader();
				reader.readAsText(file);
				reader.onload = () => {

					try {
						let data = JSON.parse( reader.result );
						let candidates = [];
						if ( Array.isArray(data) ) {
							candidates = data;
						} else if ( data && data.characters && Array.isArray(data.characters) ) {
							candidates = data.characters;
						} else if ( data && typeof data === 'object' && data.id ) {
							candidates = [ data ];
						} else if ( data && data.data && typeof data.data === 'object' ) {
							// Upstream envelope (e.g. { version: 2, data: {...} }):
							// sanitizeImportedCharacter unwraps + mints a fresh
							// UUID when needed, so this imports as new.
							candidates = Array.isArray( data.data ) ? data.data : [ data.data ];
						}
						if ( !candidates.length ) {
							this.importError = 'No characters found in “' + file.name + '”.';
						}
						let added = 0;
						let templatesAdded = 0;
						candidates.forEach( char => {
							// Standalone layout template files reuse the
							// spotlight entry shape; they upsert by static id
							// (replace, never duplicate) instead of importing
							// as characters.
							if ( cortexFunctions.isSheetTemplateFile( char ) ) {
								this.$emit( 'importSheetTemplate', char );
								templatesAdded++;
								return;
							}
							const clean = cortexFunctions.sanitizeImportedCharacter( char );
							if ( clean ) {
								this.importQueue.push( clean );
								added++;
							}
						} );
						candidates = candidates.filter( c => !cortexFunctions.isSheetTemplateFile( c ) );
						if ( added < candidates.length ) {
							this.importError = 'Skipped ' + ( candidates.length - added ) + ' invalid entr' + ( ( candidates.length - added ) === 1 ? 'y' : 'ies' ) + ' in “' + file.name + '”.';
						}
						this.importNextQueueItem();
					} catch ( error ) {
						this.importError = 'Could not read “' + file.name + '” as a character file.';
					}

				};
				reader.onerror = (error) => {
					this.importError = 'Could not read the selected file.';
				};

			}

		},

		importNextQueueItem() {

			if ( !this.importQueue.length || this.importBuffer !== null ) return;

			let newCharacter = this.importQueue.shift();

			let c = this.characters.findIndex( existingCharacter => existingCharacter.id === newCharacter.id );

			this.importBuffer = {
				newCharacter:      newCharacter,
				oldCharacterIndex: c,
				oldCharacter:      null
			}

			if ( c !== -1 ) {

				this.importBuffer.oldCharacter = this.characters[ c ];
				this.showImportConfirm = true;

			} else {

				// Skip the confirmation step if the character doesn’t already exist.
				this.importConfirm( newCharacter );

			}

		},

		async importCancel() {

			this.showImportConfirm     = false;
			this.importBuffer          = null;
			this.$refs.inputFile.value = null;

			await Vue.nextTick();
			this.importNextQueueItem();

		},

		async importConfirm() {

			let character = this.importBuffer.newCharacter;

			this.showImportConfirm     = false;
			this.importBuffer          = null;
			this.$refs.inputFile.value = null;

			// Convert timestamps to strings.
			let dateProperties = [ 'dateCreated', 'dateModified' ];
			for (let i = 0; i < dateProperties.length; i++) {
				const property = dateProperties[i];

				if ( typeof character[property] === 'number' ) {
					character[property] = ( new Date(character[property]) ).toISOString();
				}
				
			}
			
			// Populate custom data sets for this app.
			if ( Array.isArray( character.traitSets ) ) {
				for (let i = 0; i < character.traitSets.length; i++) {
					const traitSet = character.traitSets[i];
					if ( !traitSet.custom ) traitSet.custom = {};
					if ( !traitSet.custom.cortexToolkit ) {
						traitSet.custom.cortexToolkit = structuredClone( cortexFunctions.defaultTraitSet.custom.cortexToolkit );
					}
				}
			} else {
				character.traitSets = [];
			}

			if ( !character.portrait ) {
				character.portrait = structuredClone( cortexFunctions.defaultCharacter.portrait );
			} else {
				if ( !character.portrait.custom ) character.portrait.custom = {};
				if ( !character.portrait.custom.cortexToolkit ) {
					character.portrait.custom.cortexToolkit = structuredClone( cortexFunctions.defaultCharacter.portrait.custom.cortexToolkit );
				}
			}

			this.$emit('importCharacter', character );

			await Vue.nextTick();
			this.importNextQueueItem();

		},

		renderDate( timestamp ) {
			return cortexFunctions.renderDate(timestamp);
		},

		getRelativeDateLabel( date1, date2 ) {
			date1 = new Date(date1).getTime();
			date2 = new Date(date2).getTime();
			if ( date2 > date1 ) return 'newer';
			if ( date2 < date1 ) return 'older';
			return 'same age';
		},

	}

}
