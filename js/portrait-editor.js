const PortraitEditor = {

	props: {
		character: Object,
		open:      Boolean,
	},

	data() {
		return {}
	},

	computed: {

		hasImage() {
			return Boolean( this.character?.portrait?.url?.length );
		},

		imageURL: {
			get() {
				return this.character?.portrait?.url ?? '';
			},
			set( value ) {
				this.setImageURL( value );
			}
		},

		size: {
			get() {
				return this.character?.portrait?.custom?.cortexToolkit?.size ?? 'classic';
			},
			set( value ) {
				this.setCustomProperty( 'size', value );
			}
		},

		location: {
			get() {
				return this.character?.portrait?.custom?.cortexToolkit?.location ?? 'header';
			},
			set( value ) {
				this.setCustomProperty( 'location', value );
			}
		},

		alignment: {
			get() {
				return this.character?.portrait?.custom?.cortexToolkit?.alignment ?? 'top-center';
			},
			set( value ) {
				this.setAlignment( value );
			}
		},

	},

	/*html*/
	template: `<aside :class="{ 'editor': true, 'editor-portrait': true, 'open': open, 'scrollable': true, 'anchor-position-top': true }" @click.stop="">

		<div class="editor-arrow"></div>

		<div class="editor-controls">
			<button @click.stop="selectElement([])"><i class="fas fa-times"></i></button>
			<button v-if="hasImage" class="editor-delete" @click.stop="setImageURL('')" title="Remove Image"><i class="fas fa-trash"></i></button>
		</div>

		<div class="editor-inner">
			<div>

				<div class="editor-fields">

					<div class="editor-field">
						<label>Portrait Size / Style</label>
						<select v-model="size">
							<option value="classic">Classic (Large Portrait)</option>
							<option value="spotlight">Small Portrait (Spotlight Size)</option>
							<option value="none">Hidden (No Portrait)</option>
						</select>
					</div>

					<div class="editor-field" v-if="size !== 'none'">
						<label>Placement</label>
						<select v-model="location">
							<option value="header">Header (Top-Right Corner)</option>
							<option value="right">Right Column</option>
							<option value="left">Left Column</option>
						</select>
					</div>

					<div class="editor-field" v-if="size !== 'none'">

						<label>Image Source</label>

						<img class="portrait-preview"
							v-if="hasImage"
							:src="character?.portrait?.url"
							@click.prevent="uploadStart"
						>

						<div class="editor-button-container">
							<div class="editor-button-container-inner">
								<div
									class="editor-button"
									@click.prevent="uploadStart"
								>
									<span><i class="fas fa-upload"></i> Upload {{ hasImage ? 'New' : '' }} Image</span>
								</div>
							</div>
						</div>

						<input class="portrait-input" type="file" ref="inputFile" @change="uploadProcess">

						<div style="margin-top: 0.5rem;">
							<label style="font-size: 0.75rem; color: #64748b;">Or Image URL</label>
							<input type="text" v-model.lazy="imageURL" placeholder="https://example.com/portrait.jpg">
						</div>

						<div class="editor-button-container" v-if="hasImage" style="margin-top: 0.75rem;">
							<div class="editor-button-container-inner">
								<div class="editor-button" style="background: #ef4444; color: #ffffff;" @click.prevent="removePortrait">
									<span><i class="fas fa-trash-alt"></i> Remove Portrait</span>
								</div>
							</div>
						</div>

					</div>

					<div class="editor-field" v-if="hasImage && size !== 'none'">

						<label>Alignment / Focus</label>

						<div class="editor-portrait-alignment">
							<div @click.stop="setAlignment('top-left')"      :class="{'active': alignment === 'top-left' }"></div>
							<div @click.stop="setAlignment('top-center')"    :class="{'active': alignment === 'top-center' }"></div>
							<div @click.stop="setAlignment('top-right')"     :class="{'active': alignment === 'top-right' }"></div>
							<div @click.stop="setAlignment('center-left')"   :class="{'active': alignment === 'center-left' }"></div>
							<div @click.stop="setAlignment('center')"        :class="{'active': alignment === 'center' }"></div>
							<div @click.stop="setAlignment('center-right')"  :class="{'active': alignment === 'center-right' }"></div>
							<div @click.stop="setAlignment('bottom-left')"   :class="{'active': alignment === 'bottom-left' }"></div>
							<div @click.stop="setAlignment('bottom-center')" :class="{'active': alignment === 'bottom-center' }"></div>
							<div @click.stop="setAlignment('bottom-right')"  :class="{'active': alignment === 'bottom-right' }"></div>
						</div>

					</div>

				</div>
				
			</div>
		</div>

	</aside>`,

	methods: {

		selectElement( selector ) {
			this.$emit( 'selectElement', selector );
		},

		ensurePortraitStruct() {
			if ( !this.character ) return;
			if ( !this.character.portrait ) {
				this.character.portrait = structuredClone( cortexFunctions.defaultCharacter.portrait || { url: '', custom: { cortexToolkit: {} } } );
			}
			if ( !this.character.portrait.custom ) this.character.portrait.custom = {};
			if ( !this.character.portrait.custom.cortexToolkit ) this.character.portrait.custom.cortexToolkit = {};
		},

		uploadStart() {
			this.$refs.inputFile.click();
		},

		setImageURL( url ) {
			this.ensurePortraitStruct();
			this.character.portrait.url = url;
			this.updateCharacter( this.character );
		},

		removePortrait() {
			this.ensurePortraitStruct();
			this.character.portrait.url = '';
			this.character.portrait.custom.cortexToolkit.size = 'none';
			this.updateCharacter( this.character );
			this.selectElement([]);
		},

		setCustomProperty( key, value ) {
			this.ensurePortraitStruct();
			this.character.portrait.custom.cortexToolkit[ key ] = value;
			this.updateCharacter( this.character );
		},

		setAlignment( alignment ) {
			this.ensurePortraitStruct();
			this.character.portrait.custom.cortexToolkit.alignment = alignment;
			this.updateCharacter( this.character );
		},

		uploadProcess( event ) {

			if ( !event.target.files || !event.target.files.length ) {
				this.setImageURL( '' );
				this.setAlignment( 'center' );
				return;
			}
			
			let file = event.target.files[0];

			let reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				this.setImageURL( reader.result );
			};
			reader.onerror = (error) => {
				console.error('Portrait error: ', error);
			};

		},

		updateCharacter( character ) {
			this.$emit( 'updateCharacter', character );
		}

	}

}
