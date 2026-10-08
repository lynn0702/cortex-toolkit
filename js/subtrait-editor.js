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
			let ratings = cortexFunctions.getSubtraitRatings( traitSet );
			if ( traitSet?.custom?.cortexToolkit?.style?.body === 'standing' && this.subtrait?.name && this.subtrait.name.toUpperCase().includes('BONUS') ) {
				if ( Array.isArray(ratings) && ratings.length === 5 && ratings[0] === 4 ) {
					return ratings.filter( size => size >= 6 );
				}
			}
			return ratings;
		},

		templateSubtraitMatched() {
			const s = this.traitSetID, t = this.traitID;
			const ts = this.character?.traitSets?.[s];
			const tr = ts?.traits?.[t];
			if ( !tr || !this.subtrait || !this.subtrait.name || !ts || !ts.id || !tr.name ) return false;
			const entry = cortexFunctions.resolveTemplateFor(
				this.character, this.$root ? this.$root.sheetTemplates : null );
			const base = cortexFunctions.templateSetById( entry, ts.id );
			const btr = base && Array.isArray( base.traits )
				? base.traits.find( b => b && b.name === tr.name ) : null;
			return Boolean( btr && Array.isArray( btr.traits ) &&
				btr.traits.some( b => b && b.name === this.subtrait.name ) );
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
					<div v-if="templateSubtraitMatched" class="editor-button editor-button-remove" @click.prevent="removeFromSheet" title="Remove from sheet — reversible via restore, no confirmation needed">
						<span><i class="fas fa-eraser"></i> Remove from sheet</span>
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

		removeFromSheet() {
			const entry = cortexFunctions.resolveTemplateFor(
				this.character, this.$root ? this.$root.sheetTemplates : null );
			cortexFunctions.removeSubtraitFromSheet(
				this.character, entry, this.traitSetID, this.traitID, this.subtraitID );
			this.confirmDelete = false;
			this.updateCharacter( this.character );
		},

		getDieDisplayValue( value ) {
			return cortexFunctions.getDieDisplayValue( value );
		},

	}

}
