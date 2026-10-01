const NameEditor = {

	props: {
		character: Object,
		open:      Boolean,
	},

	data() {
		return {}
	},

	computed: {

		name: {
			get() {
				return this.character.name;
			},
			set( name ) {
				this.setCharacterProperty( 'name', name );
			}
		},
		
		description: {
			get() {
				return this.character.description;
			},
			set( description ) {
				this.setCharacterProperty( 'description', description );
			}
		},

		pronouns: {
			get() {
				return this.character.pronouns ?? '';
			},
			set( pronouns ) {
				this.setCharacterProperty( 'pronouns', pronouns );
			}
		},

		notes: {
			get() {
				return this.character.notes ?? '';
			},
			set( notes ) {
				this.setCharacterProperty( 'notes', notes );
			}
		},

		plotPoints: {
			get() {
				return Number( this.character.plotPoints ) || 0;
			},
			set( val ) {
				this.setCharacterProperty( 'plotPoints', Math.max(0, Number(val) || 0) );
			}
		},
		
	},

	/*html*/
	template: `<aside :class="{ 'editor': true, 'editor-character': true, 'open': open, 'scrollable': true }" @click.stop="">

		<div class="editor-arrow"></div>

		<div class="editor-controls">
			<button @click.stop="selectElement([])"><i class="fas fa-times"></i></button>
		</div>

		<div class="editor-inner">
			<div>

				<div class="editor-fields">

					<div class="editor-field">
						<label>Character Name</label>
						<input type="text" v-model="name" ref="inputName">
					</div>

					<div class="editor-field">
						<label>Pronouns</label>
						<input type="text" v-model="pronouns">
					</div>

					<div class="editor-field">
						<label>Plot Points (PP)</label>
						<input type="number" min="0" v-model.number="plotPoints">
					</div>

					<div class="editor-field">
						<label>Description</label>
						<textarea v-model="description"></textarea>
					</div>

					<div class="editor-field">
						<label>Notes (Markdown)</label>
						<textarea v-model="notes" rows="4" placeholder="Character notes, backstory, equipment, or house rules in Markdown..."></textarea>
					</div>

				</div>

			</div>
		</div>
		
	</aside>`,

	watch: {
		open( isOpen, wasOpen ) {
			if ( isOpen && !wasOpen ) {
				this.focusFirstInput();
			}
		}
	},

	methods: {

		selectElement( selector ) {
			this.$emit( 'selectElement', selector );
		},

		async focusFirstInput() {
			await Vue.nextTick();
			this.$refs.inputName.focus();
		},
 
		setCharacterProperty( key, value ) {
			let character = this.character;
			character[ key ] = value;
			this.updateCharacter( character );
		},

		updateCharacter( character ) {
			this.$emit( 'updateCharacter', character );
		},

		doNothing() {
			// This is intentional! 
		}

	}

}
