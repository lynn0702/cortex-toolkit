<script setup lang="ts">
import { ref, watch, onMounted, toRaw } from 'vue';
import { toLayeredEntity } from './layered-materialize.ts';

const props = defineProps<{
	character?: any;
}>();

const emit = defineEmits<{
	( e: 'applyJson', parsed: any ): void;
}>();

const text = ref( '' );
const error = ref( '' );
const copied = ref( false );
const filledId = ref( '' );

function fill() {
	if ( !props.character ) {
		text.value = '';
		error.value = '';
		filledId.value = '';
		return;
	}
	// The stored layered shape (name-keyed maps, dice-string ratings):
	// no materialized slot objects, no internal ids — the document a
	// person can actually hand-edit.
	const raw = JSON.parse( JSON.stringify( toRaw( props.character ) ) );
	let doc: any = null;
	try {
		doc = toLayeredEntity( raw as Record<string, unknown> );
	} catch ( e: any ) {
		error.value = 'JSON error: ' + String( ( e as Error )?.message || e ).slice( 0, 200 );
		return;
	}
	text.value = JSON.stringify( doc, null, 2 );
	// Keep the template pin beside the entity (reference only — the full
	// template object lives in the template store, embedded on file export).
	const tref = props.character && props.character.sheet && props.character.sheet.template;
	if ( tref ) {
		const ref = ( typeof tref === 'string' )
			? { id: tref }
			: ( tref && typeof tref === 'object' && typeof tref.id === 'string' && tref.id.length )
				? { id: tref.id, version: tref.version || 1 }
				: null;
		if ( ref ) {
			const withRef = JSON.parse( text.value );
			withRef.sheet = { template: ref };
			text.value = JSON.stringify( withRef, null, 2 );
		}
	}
	error.value = '';
	filledId.value = props.character.id || '';
}

function apply() {
	error.value = '';
	let parsed: any = null;
	try {
		parsed = JSON.parse( text.value );
	} catch ( e: any ) {
		error.value = 'JSON error: ' + String( ( e as Error )?.message || e ).slice( 0, 200 );
		return;
	}
	if ( !parsed || typeof parsed !== 'object' || Array.isArray( parsed ) ) {
		error.value = 'JSON error: top level must be a character object';
		return;
	}
	emit( 'applyJson', parsed );
	filledId.value = parsed.id || '';
}

function copy() {
	if ( !text.value ) return;
	navigator.clipboard.writeText( text.value ).then( () => {
		copied.value = true;
		setTimeout( () => { copied.value = false; }, 2000 );
	} );
}

onMounted( fill );
watch( () => props.character && props.character.id, ( id ) => {
	if ( ( id || '' ) !== filledId.value ) fill();
} );
</script>

<template>
	<div class="editor json-editor">
		<div class="editor-label">Character JSON</div>
		<div class="editor-hint">Stored layered form: name-keyed maps, dice strings, no slots, no internal ids. Apply runs the import path — a syntax error changes nothing on the sheet.</div>
		<div v-if="error" class="json-error" role="alert">{{ error }}</div>
		<textarea
			v-model="text"
			class="json-text"
			rows="24"
			spellcheck="false"
			autocomplete="off"
			autocapitalize="off"
			aria-label="Character JSON"
		></textarea>
		<div class="editor-button-container">
			<div class="editor-button-container-inner">
				<div class="editor-button" @click.stop="apply">
					<span><i class="fas fa-check"></i> Apply</span>
				</div>
				<div class="editor-button" @click.stop="copy">
					<span><i class="fas fa-copy"></i> {{ copied ? 'Copied!' : 'Copy' }}</span>
				</div>
				<div class="editor-button" @click.stop="fill">
					<span><i class="fas fa-undo"></i> Refresh</span>
				</div>
			</div>
		</div>
	</div>
</template>
