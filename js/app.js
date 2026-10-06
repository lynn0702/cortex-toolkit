document.addEventListener('DOMContentLoaded', () => {

	app = Vue.createApp({

		name: 'cortex-toolkit',

		data() {
			return {
				localData:          {},
				characters:         [],
				characterID:        null,
				openCharacterIDs:   [],
				playViewMode:       'split',
				isAddCharacterModalOpen: false,
				sessionCharacterSearch: '',
				mode:               'roster',
				submode:            null,
				editing:            null,
				viewY:              null,
				dicePool:           new cortexPal.DicePool(),
				isRollerOpen:       false,
				rollerPosition:     'left',
				mobileActiveView:   'sheet',
				toastMessage:       null,
				toastTimeout:       null,
				history:            [],
				historyIndex:       -1,
				isNavigatingHistory:false,
				isHandlingHash:     false,
				storeReady:         false,
				storeError:         null,
			}
		},

		computed: {

			baseURL() {
				return window.location.href.replace('/index.html', '/');
			},

			year() {
				return ( new Date() ).getFullYear();
			},

			characterIndex() {
				return this.characters.findIndex( character => character.id === this.characterID );
			},

			character() {
				return this.characters[ this.characterIndex ];
			},

			canUndo() {
				if ( this.mode !== 'character' ) return false;
				if ( this.historyIndex > 0 ) return true;
				if ( this.character && this.historyIndex >= 0 ) {
					return this.history[ this.historyIndex ] !== JSON.stringify( this.character );
				}
				return false;
			},

			canRedo() {
				return this.mode === 'character' && this.historyIndex < this.history.length - 1;
			},

			openCharacters() {
				let list = [];
				for ( let id of this.openCharacterIDs ) {
					let found = this.characters.find( c => c.id === id );
					if ( found ) list.push( found );
				}
				if ( !list.length && this.character ) {
					return [ this.character ];
				}
				return list;
			},

			availableToOpen() {
				let q = (this.sessionCharacterSearch || '').toLowerCase().trim();
				return this.characters.filter( c => {
					if ( c.isTemplate ) return false;
					if ( this.openCharacterIDs.includes( c.id ) ) return false;
					if ( q.length && !c.name?.toLowerCase().includes(q) && !c.game?.toLowerCase().includes(q) ) return false;
					return true;
				});
			},

		},

		/*html*/
		template: `<header class="header">
				<div class="header-inner">
					<nav class="nav-mode">
						<ul>
							<li @click.stop="setMode('roster', null)" :class="{ active: mode === 'roster' }"><div><span class="nav-icon"><i class="fas fa-users"></i></span></div></li>
							<li @click.stop="setMode('character', 'edit')" :class="{ active: mode === 'character' && submode === 'edit', 'disabled': !character }"><div><span class="nav-icon"><i class="fas fa-pencil"></i></span> <span class="nav-label">Create</span></div></li>
							<li @click.stop="setMode('character', 'play')" :class="{ active: mode === 'character' && submode === 'play', 'disabled': !character }"><div><span class="nav-icon"><i class="fas fa-dice"></i></span> <span class="nav-label">Play</span></div></li>
							<li v-if="mode === 'character' && submode === 'play'" @click.stop="toggleRoller" :class="{ active: isRollerOpen }"><div><span class="nav-icon"><i class="fas fa-dice-d20"></i></span> <span class="nav-label">Roller ({{ dicePool.items.length }})</span></div></li>
							<li @click.stop="setMode('character', 'print')" :class="{ active: mode === 'character' && submode === 'print', 'disabled': !character }"><div><span class="nav-icon"><i class="fas fa-print"></i></span> <span class="nav-label">Print</span></div></li>
							<li v-if="mode === 'character' && submode === 'edit'" @click.stop="undo" :class="{ disabled: !canUndo }" title="Undo (Ctrl+Z)"><div><span class="nav-icon"><i class="fas fa-undo"></i></span> <span class="nav-label">Undo</span></div></li>
							<li v-if="mode === 'character' && submode === 'edit'" @click.stop="redo" :class="{ disabled: !canRedo }" title="Redo (Ctrl+Y)"><div><span class="nav-icon"><i class="fas fa-redo"></i></span> <span class="nav-label">Redo</span></div></li>
						</ul>
					</nav>
				</div>
			</header>

			<!-- SESSION / OPEN CHARACTERS BAR -->
			<div class="session-nav" v-if="mode === 'character' && openCharacters.length > 0">
				<div class="session-nav-inner">
					<div class="session-tabs">
						<div
							v-for="c in openCharacters"
							:key="c.id"
							:class="['session-tab', { active: c.id === characterID }]"
							@click.stop="focusCharacter(c.id)"
							:title="'Switch to ' + (c.name || 'Character')"
						>
							<div class="session-tab-avatar" v-if="c.portrait && c.portrait.url" :style="'background-image:url(' + safeImageUrl(c.portrait.url) + ')'"></div>
							<div class="session-tab-icon" v-else><i class="fas fa-shield-alt"></i></div>
							<span class="session-tab-name">{{ c.name || 'Unnamed' }}</span>
							<button
								type="button"
								class="session-tab-close"
								@click.stop="closeOpenCharacter(c.id)"
								v-if="openCharacters.length > 1"
								title="Close from session"
							><i class="fas fa-times"></i></button>
						</div>

						<button
							type="button"
							class="btn-session-add"
							@click.stop="isAddCharacterModalOpen = true"
							title="Open another character alongside"
						>
							<i class="fas fa-plus"></i> <span>Open Sheet</span>
						</button>
					</div>

					<div class="session-view-controls" v-if="submode === 'play' && openCharacters.length > 1">
						<div class="session-view-segmented">
							<button
								type="button"
								:class="{ active: playViewMode === 'split' }"
								@click.stop="setPlayViewMode('split')"
								title="Side-by-side view (all open characters)"
							>
								<i class="fas fa-columns"></i> Side-by-Side ({{ openCharacters.length }})
							</button>
							<button
								type="button"
								:class="{ active: playViewMode === 'tabs' }"
								@click.stop="setPlayViewMode('tabs')"
								title="Single sheet tabbed view"
							>
								<i class="fas fa-window-maximize"></i> Tabbed
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- DICE ROLLER SIDEBAR -->
			<aside class="sidebar" :class="{ 'open': isRollerOpen && mode === 'character' && submode === 'play', 'mobile-visible': mobileActiveView === 'roller', 'position-right': rollerPosition === 'right' }">
				<div class="sidebar-inner">
					<dice-roller
						v-if="mode === 'character' && submode === 'play'"
						:open="isRollerOpen || mobileActiveView === 'roller'"
						:pool="dicePool"
						:position="rollerPosition"
						@close="isRollerOpen = false; mobileActiveView = 'sheet'"
						@togglePosition="toggleRollerPosition"
						@addDie="addDieToRoller"
						@removeDie="removeDieFromRoller"
						@clearPool="clearDicePool"
					></dice-roller>
				</div>
			</aside>

			<main class="main" ref="main" @scroll="setViewY"
				@click.stop="clearSelected"
				:class="{ 'with-sidebar': isRollerOpen && mode === 'character' && submode === 'play', 'sidebar-right': rollerPosition === 'right', 'mobile-show-roller': mobileActiveView === 'roller' }"
			>

				<!-- MOBILE PLAY TABS -->
				<div class="mobile-play-tabs" v-if="mode === 'character' && submode === 'play'">
					<button :class="{ active: mobileActiveView === 'sheet' }" @click.stop="mobileActiveView = 'sheet'">
						<i class="fas fa-id-card"></i> Sheet
					</button>
					<button :class="{ active: mobileActiveView === 'roller' }" @click.stop="mobileActiveView = 'roller'">
						<i class="fas fa-dice"></i> Roller <span class="tab-badge" v-if="dicePool.items.length > 0">{{ dicePool.items.length }}</span>
					</button>
				</div>
			
				<!-- CHARACTER SHEET -->
				<roster
						v-if="mode === 'roster'"
						:characters="characters"
						:openCharacterIDs="openCharacterIDs"
						@createCharacter="createCharacter"
						@createTemplate="createTemplate"
						@createFromTemplate="createFromTemplate"
						@toggleTemplate="toggleTemplate"
						@loadCharacter="loadCharacter"
						@openAlongside="openAlongside"
						@resumeSession="resumeSession"
						@duplicateCharacter="duplicateCharacter"
						@exportCharacter="exportCharacter"
						@exportAllCharacters="exportAllCharacters"
						@deleteCharacter="deleteCharacter"
						@deleteAllCharacters="deleteAllCharacters"
						@importCharacter="importCharacter"
						@createFromSpotlight="createFromSpotlight"
					></roster>

					<!-- PLAY MODE: MULTI-CHARACTER SPLIT VIEW -->
					<div
						class="multi-character-workspace"
						v-else-if="mode === 'character' && submode === 'play' && playViewMode === 'split' && openCharacters.length > 1"
						key="multi-character-split"
					>
						<div
							v-for="char in openCharacters"
							:key="char.id"
							class="multi-character-column"
							:class="{ 'is-active-column': char.id === characterID }"
						>
							<div class="multi-character-banner">
								<div class="banner-title-group" @click="focusCharacter(char.id)">
									<span class="banner-avatar" v-if="char.portrait && char.portrait.url" :style="'background-image:url(' + safeImageUrl(char.portrait.url) + ')'"></span>
									<span class="banner-icon" v-else><i class="fas fa-shield-alt"></i></span>
									<span class="banner-name">{{ char.name || 'Unnamed' }}</span>
									<span class="banner-game" v-if="char.game">{{ char.game }}</span>
								</div>
								<div class="banner-actions">
									<button
										type="button"
										class="btn-banner-action"
										@click.stop="setModeForChar(char.id, 'edit')"
										title="Edit this character"
									>
										<i class="fas fa-pencil"></i>
									</button>
									<button
										type="button"
										class="btn-banner-action"
										@click.stop="setModeForChar(char.id, 'print')"
										title="Print this character"
									>
										<i class="fas fa-print"></i>
									</button>
									<button
										type="button"
										class="btn-banner-action"
										@click.stop="closeOpenCharacter(char.id)"
										title="Close from session"
									>
										<i class="fas fa-times"></i>
									</button>
								</div>
							</div>

							<character
								submode="play"
								:character="char"
								:editing="editing"
								:viewY="viewY"
								@selectElement="selectElement"
								@updateCharacter="updateCharacter"
								@exportCharacter="exportCharacter"
								@addDieToRoller="addDieToRoller"
							></character>
						</div>
					</div>

					<character
						v-else-if="mode === 'character' && character"
						:submode="submode"
						:character="character"
						:editing="editing"
						:viewY="viewY"
						@selectElement="selectElement"
						@updateCharacter="updateCharacter"
						@exportCharacter="exportCharacter"
						@addDieToRoller="addDieToRoller"
					></character>

					<article class="about"
						v-else-if="mode === 'about'"
					>

						<h1>About Cortex Toolkit</h1>
						
						<p>Cortex Prime is the award-winning world-building tabletop RPG system for forging unique, compelling game experiences from a set of modular rules mechanics available at <a href="https://www.cortexrpg.com" target="_blank">CortexRPG.com</a>.</p>

						<p>Cortex is ©️ {{year}} Dire Wolf Digital, LLC. Cortex, Cortex Prime, associated logos and trade dress are the trademarks of Dire Wolf Digital, LLC. Iconography used with permission.</p>

						<p>If you wish to publish or sell what you make using this tool, it is your responsibility to ensure you have the proper license or right for any resources used. No rights are granted through the use of this tool.</p>

					</article>

			</main>

			<!-- ADD CHARACTER TO SESSION MODAL -->
			<transition>
			<div class="modal-veil" v-show="isAddCharacterModalOpen" @click.stop="isAddCharacterModalOpen = false"></div>
			</transition>

			<transition>
			<aside class="modal modal-session-add" v-if="isAddCharacterModalOpen">
				<div class="modal-close" @click.prevent="isAddCharacterModalOpen = false"><i class="fas fa-times"></i></div>
				<div class="modal-inner">
					<div class="session-modal-header">
						<h2><i class="fas fa-users"></i> Open Character in Session</h2>
						<p>Select another character, titan mech, vehicle, or companion to open alongside your active sheet.</p>
						<div class="session-modal-search">
							<i class="fas fa-search"></i>
							<input type="text" v-model="sessionCharacterSearch" placeholder="Filter characters...">
						</div>
					</div>

					<div class="session-modal-list">
						<div
							v-for="c in availableToOpen"
							:key="c.id"
							class="session-modal-item"
						>
							<div class="session-item-info">
								<div class="session-item-avatar" v-if="c.portrait && c.portrait.url" :style="'background-image:url(' + safeImageUrl(c.portrait.url) + ')'"></div>
								<div class="session-item-icon" v-else><i class="fas fa-shield-alt"></i></div>
								<div class="session-item-text">
									<div class="session-item-name">{{ c.name || 'Unnamed' }}</div>
									<div class="session-item-sub">{{ c.game || c.description || 'Character' }}</div>
								</div>
							</div>
							<button
								type="button"
								class="btn-session-open"
								@click.stop="openAlongside(c.id)"
							>
								<i class="fas fa-columns"></i> Open Alongside
							</button>
						</div>

						<div class="session-modal-empty" v-if="availableToOpen.length === 0">
							<p>No additional characters available in your roster.</p>
							<button type="button" class="btn-session-spotlight" @click.stop="isAddCharacterModalOpen = false; setMode('roster', null)">
								<i class="fas fa-layer-group"></i> Go to Roster / Spotlight Library
							</button>
						</div>
					</div>
				</div>
			</aside>
			</transition>

			<!-- TOAST NOTIFICATION -->
			<transition name="toast">
				<div class="toast-notification" v-if="toastMessage">
					<i class="fas fa-check-circle"></i> <span>{{ toastMessage }}</span>
				</div>
			</transition>

			<footer class="footer">
				<div class="footer-inner">

					<div class="footer-colophon">
						<a href="https://www.cortexrpg.com" target="_blank"><img src="images/cortex_prime_logo_light_background.png"></a>
					</div>

					<nav class="footer-nav">
						<ul>
							<li @click.stop="setMode('about', null)" :class="{ active: mode === 'about' }"><div><span class="nav-icon"><i class="far fa-question-circle"></i></span></div></li>
							<li><a href="https://github.com/lynn0702/cortex-toolkit" target="_blank" title="View on GitHub"><div><span class="nav-icon"><i class="fab fa-github"></i></span></div></a></li>
						</ul>
					</nav>

				</div>
			</footer>`,
		
		async mounted() {

			this.setViewY();
			await this.bootFromStorage();
			this.parseRouteHash();
			window.addEventListener('hashchange', () => this.parseRouteHash());
			window.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));

		},

		watch: {

			mode() {
				this.setPageTitle();
			},

			characterID() {
				this.setPageTitle();
			}

		},

		methods: {

			// VIEW

			setMode( mode, submode, updateHash = true ) {
				if ( mode === 'character' && !this.character ) return;
				if ( mode !== 'character' || submode !== 'edit' ) {
					this.commitHistorySnapshot();
					this.editing = [];
				}
				this.mode    = mode;
				this.submode = submode;
				if ( mode === 'character' && submode === 'play' ) {
					this.isRollerOpen = true;
					this.mobileActiveView = 'sheet';
				} else {
					this.isRollerOpen = false;
					this.mobileActiveView = 'sheet';
				}
				if ( updateHash ) {
					this.updateRouteHash();
				}
			},

			parseRouteHash() {
				let hash = window.location.hash || '#/roster';
				this.isHandlingHash = true;
				let clean = hash.replace(/^#\/?/, '');
				let parts = clean.split('/');
				let primary = parts[0] || 'roster';

				if ( primary === 'about' ) {
					this.setMode('about', null, false);
				} else if ( primary === 'character' ) {
					let id = parts[1];
					let sub = parts[2] || 'edit';
					if ( sub !== 'edit' && sub !== 'play' && sub !== 'print' ) sub = 'edit';
					let found = this.characters.find( c => c.id === id );
					if ( found ) {
						this.characterID = id;
						this.setMode('character', sub, false);
						this.initHistory();
					} else {
						this.setMode('roster', null, true);
					}
				} else {
					this.setMode('roster', null, false);
					if ( window.location.hash !== '#/roster' ) {
						window.location.hash = '#/roster';
					}
				}
				Vue.nextTick(() => { this.isHandlingHash = false; });
			},

			updateRouteHash() {
				if ( this.isHandlingHash ) return;
				let target = '#/roster';
				if ( this.mode === 'about' ) {
					target = '#/about';
				} else if ( this.mode === 'character' && this.characterID ) {
					target = `#/character/${this.characterID}/${this.submode || 'edit'}`;
				}
				if ( window.location.hash !== target ) {
					window.location.hash = target;
				}
			},

			toggleRoller() {
				this.isRollerOpen = !this.isRollerOpen;
				if ( this.isRollerOpen ) {
					this.mobileActiveView = 'roller';
				} else {
					this.mobileActiveView = 'sheet';
				}
			},

			toggleRollerPosition() {
				this.rollerPosition = this.rollerPosition === 'left' ? 'right' : 'left';
				this.persist();
			},

			addDieToRoller( dieData ) {
				this.dicePool.add( dieData );
				let label;
				if ( Array.isArray( dieData ) ) {
					const poolName = dieData[0]?.source || 'Challenge Pool';
					label = `${dieData.length} dice (${poolName})`;
				} else {
					label = dieData.source ? dieData.source : `d${dieData.size}`;
				}
				this.showToast(`Added ${label} to dice pool`);
			},

			removeDieFromRoller( index ) {
				this.dicePool.removeAt( index );
			},

			clearDicePool() {
				this.dicePool.clear();
			},

			showToast( msg ) {
				this.toastMessage = msg;
				if ( this.toastTimeout ) {
					clearTimeout( this.toastTimeout );
				}
				this.toastTimeout = setTimeout( () => {
					this.toastMessage = null;
					this.toastTimeout = null;
				}, 2500 );
			},

			safeImageUrl( url ) {
				return cortexFunctions.safeImageUrl( url );
			},

			setViewY() {
				this.viewY = this.$refs.main.scrollTop;
			},

			setPageTitle() {
				let pageTitle = 'Cortex Toolkit';
				if ( this.mode === 'character' && this.character && this.character.name.length ) {
					pageTitle = `${this.character.name} - ${pageTitle}`;
				}
				document.title = pageTitle;
			},

			// SESSION & MULTI-CHARACTER

			saveOpenCharacterIDs() {
				this.persist();
			},

			setPlayViewMode( mode ) {
				this.playViewMode = mode;
				this.saveOpenCharacterIDs();
			},

			focusCharacter( id ) {
				if ( !this.openCharacterIDs.includes( id ) ) {
					this.openCharacterIDs.push( id );
				}
				this.characterID = id;
				this.initHistory();
				this.setPageTitle();
				this.updateRouteHash();
				this.saveOpenCharacterIDs();
			},

			closeOpenCharacter( id ) {
				this.openCharacterIDs = this.openCharacterIDs.filter( x => x !== id );
				if ( this.characterID === id ) {
					this.characterID = this.openCharacterIDs[0] || null;
					if ( !this.characterID ) {
						this.setMode('roster', null, true);
					} else {
						this.initHistory();
						this.updateRouteHash();
					}
				}
				this.saveOpenCharacterIDs();
			},

			openAlongside( id ) {
				if ( !this.openCharacterIDs.includes( id ) ) {
					this.openCharacterIDs.push( id );
				}
				this.characterID = id;
				this.isAddCharacterModalOpen = false;
				this.saveOpenCharacterIDs();
				this.setMode('character', this.submode || 'play', true);
				let char = this.characters.find( c => c.id === id );
				this.showToast(`Opened ${char?.name || 'character'} in session`);
			},

			resumeSession() {
				if ( !this.openCharacterIDs.length && this.characters.length ) {
					this.openCharacterIDs = [ this.characters[0].id ];
				}
				if ( !this.characterID && this.openCharacterIDs.length ) {
					this.characterID = this.openCharacterIDs[0];
				}
				this.setMode('character', 'play', true);
			},

			setModeForChar( charId, submode ) {
				this.focusCharacter( charId );
				this.setMode('character', submode, true);
			},

			// DATA

			createCharacter( isTemplate = false ) {

				let character = structuredClone( cortexFunctions.defaultCharacter );

				character.id = cortexFunctions.generateUUID();
				character.isTemplate = isTemplate;
				if ( isTemplate ) {
					character.name = 'New Template';
				}

				character.dateCreated  = ( new Date() ).toISOString();
				character.dateModified = ( new Date() ).toISOString();
				character.dateTouched  = ( new Date() ).toISOString();

				this.characters.push( character );
				this.characterID = character.id;
				if ( !this.openCharacterIDs.includes( character.id ) ) {
					this.openCharacterIDs.push( character.id );
				}
				this.saveOpenCharacterIDs();
				this.initHistory();
				this.setMode( 'character', this.submode ?? 'edit', true );

				this.saveLocalData();

			},

			createTemplate() {
				this.createCharacter( true );
			},

			createFromTemplate( templateId ) {
				let template = this.characters.find( c => c.id === templateId );
				if ( !template ) return;

				let character = JSON.parse( JSON.stringify( template ) );
				character.id = cortexFunctions.generateUUID();
				character.isTemplate = false;
				character.name = '';
				character.game = template.game || template.name || '';
				character.dateCreated  = ( new Date() ).toISOString();
				character.dateModified = ( new Date() ).toISOString();
				character.dateTouched  = ( new Date() ).toISOString();

				this.characters.push( character );
				this.characterID = character.id;
				if ( !this.openCharacterIDs.includes( character.id ) ) {
					this.openCharacterIDs.push( character.id );
				}
				this.saveOpenCharacterIDs();
				this.initHistory();
				this.setMode( 'character', 'edit', true );

				this.saveLocalData();
				this.showToast('Created character from template');
			},

			createFromSpotlight( spotlightItem, asTemplate = false, openPrint = false ) {
				if ( !spotlightItem || !spotlightItem.character ) return;

				let character = JSON.parse( JSON.stringify( spotlightItem.character ) );
				character.id = cortexFunctions.generateUUID();
				character.isTemplate = asTemplate;
				character.name = asTemplate ? (spotlightItem.title ? spotlightItem.title.replace(/\s*\([^)]*\)/g, '').trim() : 'Template') : '';
				character.game = spotlightItem.spotlight || spotlightItem.title || '';
				character.dateCreated  = ( new Date() ).toISOString();
				character.dateModified = ( new Date() ).toISOString();
				character.dateTouched  = ( new Date() ).toISOString();

				this.characters.push( character );
				this.characterID = character.id;
				if ( !this.openCharacterIDs.includes( character.id ) ) {
					this.openCharacterIDs.push( character.id );
				}
				this.saveOpenCharacterIDs();
				this.initHistory();

				if ( openPrint ) {
					this.setMode( 'character', 'print', true );
				} else {
					this.setMode( 'character', 'edit', true );
				}

				this.saveLocalData();
				this.showToast( asTemplate ? `Added "${spotlightItem.title}" to templates` : `Created character from "${spotlightItem.title}"` );
			},

			toggleTemplate( characterId ) {
				let character = this.characters.find( c => c.id === characterId );
				if ( !character ) return;
				character.isTemplate = !character.isTemplate;
				character.dateModified = ( new Date() ).toISOString();
				this.saveLocalData();
				this.showToast( character.isTemplate ? 'Saved as template' : 'Converted to regular character' );
			},

			deleteCharacter( id ) {
				
				this.openCharacterIDs = this.openCharacterIDs.filter( x => x !== id );
				this.saveOpenCharacterIDs();

				let c = this.characters.findIndex( character => character.id === id );
				if ( c === -1 ) return;

				this.characters.splice( c, 1 );

				if ( this.characterID === id ) {
					if ( this.openCharacterIDs.length ) {
						this.characterID = this.openCharacterIDs[0];
						this.initHistory();
					} else {
						this.characterID = null;
						this.setMode( 'roster', null, true );
					}
				}

				this.setPageTitle();
				this.saveLocalData();

			},

			deleteAllCharacters() {

				const count = this.characters.length;
				this.characters = [];
				this.characterID = null;
				this.openCharacterIDs = [];
				this.saveOpenCharacterIDs();
				this.setMode( 'roster', null, true );
				this.setPageTitle();
				this.saveLocalData();
				this.showToast(`Deleted all ${count} characters`);

			},

			duplicateCharacter( id ) {

				let original = this.characters.find( character => character.id === id );
				if ( !original ) return;

				let character = JSON.parse( JSON.stringify( original ) );
				character.id = cortexFunctions.generateUUID();
				character.name = character.name && character.name.length ? `${character.name} (Copy)` : 'Copy';
				character.dateCreated  = ( new Date() ).toISOString();
				character.dateModified = ( new Date() ).toISOString();
				character.dateTouched  = ( new Date() ).toISOString();

				this.characters.push( character );
				this.saveLocalData();

			},

			loadCharacter( id ) {

				if ( !this.openCharacterIDs.includes( id ) ) {
					this.openCharacterIDs.push( id );
				}
				this.characterID = id;
				this.initHistory();
				this.setMode( 'character', this.submode ?? 'edit', true );

				this.touchCharacter( id );
				this.saveOpenCharacterIDs();
				this.saveLocalData();

			},

			importCharacter( character ) {

				// Save new character.
				let c = this.characters.findIndex( existingCharacter => existingCharacter.id === character.id );

				if ( c !== -1 ) {
					this.characters[c] = character;
				} else {
					this.characters.push( character );
				}

				this.touchCharacter( character.id );
				this.saveLocalData();
				this.showToast(`Imported ${character.name || 'character'}`);

			},

			exportCharacter( id ) {

				let character = this.characters.find( character => character.id === id );

				let uri = encodeURI("data:application/json;charset=utf-8," + JSON.stringify(character, null, 2))
				.replace(/#/g, '%23');

				let name = character.name.length ? character.name : 'Name';
				let timestamp = ( new Date(character.dateModified) ).getTime();
				name = name.replaceAll( /\s+/g, '_' );
				let filename = `${name}_${timestamp}.cortex.json`;

				let link = document.createElement("a");
				document.body.appendChild(link); // Required for Firefox
				link.setAttribute('href', uri);
				link.setAttribute('download', filename);
				link.click();
				link.remove();

			},

			exportAllCharacters() {

				let bundle = {
					version: '0.1',
					type: 'bundle',
					dateExported: ( new Date() ).toISOString(),
					count: this.characters.length,
					characters: this.characters
				};

				let uri = encodeURI("data:application/json;charset=utf-8," + JSON.stringify(bundle, null, 2))
				.replace(/#/g, '%23');

				let timestamp = ( new Date() ).getTime();
				let filename  = `Cortex_Characters_Bundle_${timestamp}.json`;

				let link = document.createElement("a");
				document.body.appendChild(link); // Required for Firefox
				link.setAttribute('href', uri);
				link.setAttribute('download', filename);
				link.click();
				link.remove();
				this.showToast(`Exported ${this.characters.length} characters`);

			},

			updateCharacter( character ) {

				let c = this.characters.findIndex( savedCharacter => savedCharacter.id === character.id );

				if ( c === -1 ) return;

				character.dateModified = ( new Date() ).toISOString();
				character.dateTouched  = ( new Date() ).toISOString();

				this.characters[c] = character;
				this.setPageTitle();

				this.touchCharacter( character.id );
				this.saveLocalData();
				if ( !this.editing || !this.editing.length ) {
					this.commitHistorySnapshot();
				}

			},

			initHistory() {
				if ( this.character ) {
					this.history = [ JSON.stringify( this.character ) ];
					this.historyIndex = 0;
				} else {
					this.history = [];
					this.historyIndex = -1;
				}
			},

			commitHistorySnapshot() {
				if ( this.isNavigatingHistory || !this.character ) return;
				let snap = JSON.stringify( this.character );
				if ( this.historyIndex >= 0 && this.history[this.historyIndex] === snap ) return;
				if ( this.historyIndex < this.history.length - 1 ) {
					this.history = this.history.slice( 0, this.historyIndex + 1 );
				}
				this.history.push( snap );
				if ( this.history.length > 50 ) {
					this.history.shift();
				} else {
					this.historyIndex++;
				}
			},

			validateEditing( character ) {
				if ( !this.editing || !this.editing.length || !character ) return;
				let [ type, s, t ] = this.editing;
				if ( type === 'traitSet' && !character.traitSets?.[s] ) {
					this.editing = [];
				} else if ( type === 'trait' && !character.traitSets?.[s]?.traits?.[t] ) {
					this.editing = [];
				}
			},

			undo() {
				this.commitHistorySnapshot();
				if ( !this.canUndo ) return;
				this.isNavigatingHistory = true;
				this.historyIndex--;
				let restored = JSON.parse( this.history[this.historyIndex] );
				this.characters[this.characterIndex] = restored;
				this.validateEditing( restored );
				this.saveLocalData();
				this.showToast('Undo');
				Vue.nextTick(() => { this.isNavigatingHistory = false; });
			},

			redo() {
				if ( !this.canRedo ) return;
				this.isNavigatingHistory = true;
				this.historyIndex++;
				let restored = JSON.parse( this.history[this.historyIndex] );
				this.characters[this.characterIndex] = restored;
				this.validateEditing( restored );
				this.saveLocalData();
				this.showToast('Redo');
				Vue.nextTick(() => { this.isNavigatingHistory = false; });
			},

			handleGlobalKeydown( event ) {
				if ( this.mode !== 'character' || this.submode !== 'edit' ) return;

				if ( event.key === 'Escape' ) {
					if ( this.editing && this.editing.length ) {
						event.preventDefault();
						if ( event.target && typeof event.target.blur === 'function' ) {
							event.target.blur();
						}
						this.clearSelected();
						return;
					}
				}

				let target = event.target ? event.target.tagName : '';
				if ( target === 'INPUT' || target === 'TEXTAREA' ) return;

				if ( (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z' ) {
					event.preventDefault();
					this.undo();
				} else if ( ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') ||
				            ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'z') ) {
					event.preventDefault();
					this.redo();
				}
			},

			touchCharacter( id ) {

				let c = this.characters.findIndex( savedCharacter => savedCharacter.id === id );

				if ( c === -1 ) return;

				let character = this.characters[c];

				character.dateTouched = ( new Date() ).toISOString();

				this.characters[c] = character;

			},

			selectElement( selector ) {

				let nextSelector = selector;
				if ( cortexFunctions.arraysMatch( this.editing, selector ) ) {
					nextSelector = [];
				}

				this.commitHistorySnapshot();
				this.editing = nextSelector;

			},

			clearSelected() {
				this.selectElement([]);
			},

			async bootFromStorage() {

				this.storeReady = false;
				this.storeError = null;

				try {
					const stored = await cortexStorage.load();
					this.characters = stored.characters || [];
					this.playViewMode = stored.playViewMode || 'split';
					this.rollerPosition = stored.rollerPosition || 'left';
					this.openCharacterIDs = ( stored.openCharacterIDs || [] ).filter(
						id => this.characters.some( c => c.id === id )
					);
					if ( this.characterID && !this.openCharacterIDs.includes( this.characterID ) ) {
						this.openCharacterIDs.push( this.characterID );
					}
					if ( stored.loadError ) {
						this.storeError = stored.loadError;
						this.showToast( 'Saved data was damaged — starting fresh. Export backups regularly.' );
					} else if ( stored.migrationError ) {
						this.showToast( 'Migrated your data, but the old copy could not be removed.' );
					} else if ( stored.migrated ) {
						this.showToast( 'Library upgraded to the new local database.' );
					}
				} catch ( err ) {
					this.storeError = err;
					this.showToast( 'Could not open the local library — starting empty.' );
				}

				this.storeReady = true;
				cortexStorage.requestPersistence();

			},

			persist() {

				let plain;
				try {
					plain = JSON.parse( JSON.stringify( {
						characters: this.characters,
						openCharacterIDs: this.openCharacterIDs,
						playViewMode: this.playViewMode,
						rollerPosition: this.rollerPosition,
					} ) );
				} catch ( err ) {
					this.showToast( 'Could not save changes.' );
					return;
				}

				cortexStorage.save( plain ).catch( ( err ) => {
					if ( err && ( err.name === 'QuotaExceededError' || err.code === 22 ) ) {
						this.showToast( 'Local storage is full — export a backup, then remove large images.' );
					} else {
						this.showToast( 'Could not save changes. Export a backup to be safe.' );
					}
				} );

			},

			saveLocalData() {
				this.persist();
			},

			clearLocalData() {
				cortexStorage.clear().finally( () => {
					window.location.reload();
				} );
			}

		}

	})
	.component('roster',           Roster )
	.component('character',        Character )
	.component('name-editor',      NameEditor )
	.component('portrait-editor',  PortraitEditor )
	.component('trait-editor',     TraitEditor )
	.component('trait-set-editor', TraitSetEditor )
	.component('subtrait-editor',  SubtraitEditor )
	.component('sfx-editor',       SfxEditor )
	.component('dice-roller',      DiceRoller )
	.component('style-gallery',    StyleGallery )
	.mount('#cortex-toolkit');

});
