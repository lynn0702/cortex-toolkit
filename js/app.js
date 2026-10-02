document.addEventListener('DOMContentLoaded', () => {

	app = Vue.createApp({

		name: 'cortex-toolkit',

		data() {
			return {
				localData:          {},
				characters:         [],
				characterID:        null,
				mode:               'roster',
				submode:            null,
				editing:            null,
				viewY:              null,
				dicePool:           new cortexPal.DicePool(),
				isRollerOpen:       false,
				rollerPosition:     localStorage.getItem('cortexRollerPosition') || 'left',
				mobileActiveView:   'sheet',
				toastMessage:       null,
				toastTimeout:       null,
				history:            [],
				historyIndex:       -1,
				isNavigatingHistory:false,
				isHandlingHash:     false,
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
							<li @click.stop="setMode('character', 'print')" :class="{ active: mode === 'character' && submode === 'print', 'disabled': !character }"><div><span class="nav-icon"><i class="fas fa-file"></i></span> <span class="nav-label">Share</span></div></li>
							<li v-if="mode === 'character' && submode === 'edit'" @click.stop="undo" :class="{ disabled: !canUndo }" title="Undo (Ctrl+Z)"><div><span class="nav-icon"><i class="fas fa-undo"></i></span> <span class="nav-label">Undo</span></div></li>
							<li v-if="mode === 'character' && submode === 'edit'" @click.stop="redo" :class="{ disabled: !canRedo }" title="Redo (Ctrl+Y)"><div><span class="nav-icon"><i class="fas fa-redo"></i></span> <span class="nav-label">Redo</span></div></li>
						</ul>
					</nav>
				</div>
			</header>

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
				<transition mode="out-in">

					<roster
						v-if="mode === 'roster'"
						:characters="characters"
						@createCharacter="createCharacter"
						@createTemplate="createTemplate"
						@createFromTemplate="createFromTemplate"
						@toggleTemplate="toggleTemplate"
						@loadCharacter="loadCharacter"
						@duplicateCharacter="duplicateCharacter"
						@exportCharacter="exportCharacter"
						@exportAllCharacters="exportAllCharacters"
						@deleteCharacter="deleteCharacter"
						@deleteAllCharacters="deleteAllCharacters"
						@importCharacter="importCharacter"
					></roster>

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

				</transition>

			</main>

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
		
		mounted() {

			this.setViewY();
			this.loadLocalData();
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
				localStorage.setItem('cortexRollerPosition', this.rollerPosition);
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
				character.name = template.name && template.name.length ? `${template.name} (Copy)` : 'New Character';
				character.dateCreated  = ( new Date() ).toISOString();
				character.dateModified = ( new Date() ).toISOString();
				character.dateTouched  = ( new Date() ).toISOString();

				this.characters.push( character );
				this.characterID = character.id;
				this.initHistory();
				this.setMode( 'character', 'edit', true );

				this.saveLocalData();
				this.showToast('Created character from template');
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
				
				let c = this.characters.findIndex( character => character.id === id );
				if ( c === -1 ) return;

				this.setMode( 'roster', null, true );
				this.characterID = null;
				this.characters.splice( c, 1 );
				this.setPageTitle();

				this.saveLocalData();

			},

			deleteAllCharacters() {

				const count = this.characters.length;
				this.characters = [];
				this.characterID = null;
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

				this.characterID = id;
				this.initHistory();
				this.setMode( 'character', this.submode ?? 'edit', true );

				this.touchCharacter( id );
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

			loadLocalData() {

				let localJSON = localStorage.getItem('cortexToolkitData');
				if ( !localJSON || !localJSON.length ) return;

				let localData = JSON.parse(localJSON);
				if ( !localData || !localData['0.1'] ) return;

				this.localData = localData;

				if ( localData['0.1'].characters ) {
					this.characters = structuredClone( localData['0.1'].characters );
				}

			},

			saveLocalData() {

				this.localData['0.1'] = {
					characters: this.characters,
				}

				localStorage.setItem('cortexToolkitData', JSON.stringify(this.localData));

			},

			clearLocalData() {
				localStorage.setItem('cortexToolkitData', null);
				window.location.reload();
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
	.mount('#cortex-toolkit');

});
