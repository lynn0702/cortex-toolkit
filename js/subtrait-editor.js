const SubtraitEditor = {

	props: {
		character:  Object,
		selected:   Array,
		traitSetID: Number,
		traitID:    Number,
		subtraitID: Number,
	},

	data() {
		return {
			confirmDelete: false,
		};
	},

	watch: {
		subtraitID() {
			this.confirmDelete = false;
		}
	},

	computed: {
		subtrait() {
			let s = this.traitSetID;
			let t = this.traitID;
			let u = this.subtraitID;
			return this.character.traitSets[s].traits[t].traits[u];
		},

		selector() {
			return [ 'subtrait', this.traitSetID, this.traitID, this.subtraitID ];
		},

		name: {
			get() {
				return this.subtrait.name;
			},
			set( name ) {
				this.setSubtraitProperty( 'name', name );
			}
		},

		value: {
			get() {
				return this.subtrait.value;
			},
			set( value ) {
				this.setSubtraitProperty( 'value', value );
			}
		},

		availableValues() {
			let s = this.traitSetID;
			let traitSet = this.character.traitSets[s];
			return cortexFunctions.getSubtraitRatings( traitSet );
		},

	},

	/*html*/
	template: `<section class="editor-subgroup">
	
		<div class="editor-fields">

			<div class="editor-field">
				<label>Subtrait Name</label>
				<input type="text" v-model="name">
			</div>

			<ul class="editor-values">
				<li
					v-for="value in availableValues"
					:class="{ 'active': value === subtrait.value }"
					@click.stop="toggleSubtraitValue( value )"
				>
					<span class="c" v-html="getDieDisplayValue(value)"></span>
				</li>
			</ul>

			<div class="editor-button-container">
				<div class="editor-button-container-inner">
					<div v-if="!confirmDelete" class="editor-button editor-button-remove editor-button-secondary" @click.prevent="confirmDelete = true">
						<span><i class="fas fa-trash"></i> Remove Subtrait</span>
					</div>
					<div v-else class="editor-button editor-button-remove editor-button-delete-confirm" @click.prevent="removeSubtrait">
						<span><i class="fas fa-exclamation-triangle"></i> Confirm Remove?</span>
					</div>
				</div>
			</div>

		</div>

	</section>`,

	methods: {

		setSubtraitProperty( key, value ) {

			let character = this.character;
			let s = this.traitSetID;
			let t = this.traitID;
			let f = this.subtraitID;

			character.traitSets[s].traits[t].traits[f][ key ] = value;

			this.updateCharacter( character );

		},

		toggleSubtraitValue( value ) {

			if ( value === this.subtrait.value ) {
				value = null;
			}

			this.setSubtraitProperty( 'value', value );

		},

		updateCharacter( character ) {
			this.$emit( 'updateCharacter', character );
		},

		removeSubtrait() {
			this.confirmDelete = false;
			this.$emit( 'removeSubtrait', this.subtraitID );
		},

		getDieDisplayValue( value ) {
			return cortexFunctions.getDieDisplayValue( value );
		},

	}

}
