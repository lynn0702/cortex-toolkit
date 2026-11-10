<script setup lang="ts">
import { computed } from 'vue';
import { getView, resolveVisibility } from './model.ts';
import { characterCurioFunctions } from './functions.ts';
import { injectTraitSet } from './use-trait-set.ts';
import TraitSetImage from './trait-set-image.vue';

const {
	traitSet,
	s,
	character,
	submode,
	printBlank,
	isSelected,
	selectElement,
	updateCharacter,
	renderText,
	renderNotesText,
} = injectTraitSet();

const name = computed(() => character.value?.name ?? '');
const description = computed(() => character.value?.description ?? '');
const player = computed(() => character.value?.player ?? '');
const pronouns = computed(() => character.value?.pronouns ?? '');
const nickname = computed(() => character.value?.nickname ?? getView(character.value)?.nickname ?? '');
const hasNickname = computed(() => Boolean(nickname.value || getView(character.value)?.hasNickname));
const notes = computed(() => character.value?.notes ?? '');
const game = computed(() => character.value?.game ?? '');
const plotPoints = computed(() => Number(character.value?.plotPoints) || 0);
const portrait = computed(() => character.value?.portrait ?? null);
const effectivePortraitUrl = computed(() => getView(traitSet.value)?.imageConfig?.url || portrait.value?.url || '');

function nameTrait(key: string) {
	return characterCurioFunctions.getNameTrait(character.value, key);
}

function nameLabel(key: string, fallback: string) {
	const custom = nameTrait(key)?.label;
	if (typeof custom === 'string' && custom.trim().length) return custom.trim().toUpperCase();
	return fallback;
}

function nameWord(key: string, fallback: string) {
	const custom = nameTrait(key)?.label;
	if (typeof custom === 'string' && custom.trim().length) return custom.trim();
	return fallback;
}

function nameShown(key: string) {
	const t = nameTrait(key);
	if (!t) return true;
	const vis = resolveVisibility(t);
	if (vis === 'hidden') return false;
	if (vis === 'play-only') return submode.value !== 'print';
	if (vis === 'editor-only') return submode.value === 'edit';
	return true;
}

const nicknameLabel = computed(() => nameLabel('nickname', 'NICKNAME'));
const pronounsLabel = computed(() => nameLabel('pronouns', 'PRONOUNS'));
const descriptionLabel = computed(() => nameLabel('description', 'DESCRIPTION'));
const playerLabel = computed(() => nameWord('player', 'PLAYER:'));
const plotPointsLabel = computed(() => nameWord('plotPoints', 'PP'));

const ringSetIndex = computed(() =>
	(character.value?.traitSets || []).findIndex((ts: any) => {
		const view = getView(ts);
		const body = view?.style?.body;
		if (body === 'portrait-ring') return true;
		return false;
	}),
);

// The Name set renders an image element (via TraitSetImage) when:
// 1. The portrait trait is not hidden (nameShown('portrait')),
// 2. Not exclusively claimed by a portrait-ring set (unless the Name set has its own imageConfig.url), AND
// 3. effectivePortraitUrl is non-empty (so a Name set with no image renders cleanly with no empty portrait box or missing-image frame).
const hasNameSetPortrait = computed(() => {
	if (!nameShown('portrait')) return false;
	const hasOwnCfgUrl = Boolean(getView(traitSet.value)?.imageConfig?.url);
	if (!hasOwnCfgUrl && ringSetIndex.value !== -1) return false;
	return Boolean(effectivePortraitUrl.value);
});

const descriptionText = computed({
	get() {
		return character.value?.description ?? '';
	},
	set(val: string) {
		if (!character.value) return;
		character.value.description = val;
		updateCharacter(character.value);
	},
});

function adjustPlotPoints(delta: number) {
	if (!character.value) return;
	const current = Number(character.value.plotPoints) || 0;
	character.value.plotPoints = Math.max(0, current + delta);
	updateCharacter(character.value);
}
</script>

<template>
	<div class="page-header">
		<div
			class="page-header-inner sheet-header-card"
			:class="{
				'has-portrait': hasNameSetPortrait,
				selected: isSelected(['name']) || isSelected(['traitSet', s]),
			}"
		>
			<!-- LEFT BOX: NAME | NICKNAME | PRONOUNS -->
			<div class="sheet-header-meta-box trait-set-box" @click.stop="selectElement(['name'])">
				<div class="sheet-meta-name-cell">
					<div class="sheet-cell-header">
						<span class="sheet-cell-label">NAME</span>
						<span class="sheet-cell-sublabel" v-if="player && !printBlank && nameShown('player')"
							>{{ playerLabel }} {{ player }}</span
						>
					</div>
					<div
						class="character-game-title"
						v-if="game && !printBlank && nameShown('game')"
						v-html="renderText(game)"
					></div>
					<div class="sheet-cell-content name-content" v-if="!printBlank && name" v-html="renderText(name)"></div>
					<div class="sheet-blank-line" v-else-if="printBlank"></div>
					<div class="sheet-cell-content name-content placeholder-dim" v-else-if="submode === 'edit'">
						Click to set name...
					</div>
					<div class="sheet-blank-line" v-else></div>
					<div class="character-pp-badge" v-if="submode === 'play' && nameShown('plotPoints')">
						<span class="pp-badge-label">{{ plotPointsLabel }}</span>
						<button
							type="button"
							class="btn-pp-step"
							@click.stop="adjustPlotPoints(-1)"
							:disabled="plotPoints <= 0"
							title="Spend Plot Point"
						>
							-
						</button>
						<span class="pp-count">{{ plotPoints }}</span>
						<button type="button" class="btn-pp-step" @click.stop="adjustPlotPoints(1)" title="Gain Plot Point">
							+
						</button>
					</div>
				</div>

				<div class="sheet-meta-divider" v-if="(hasNickname && nameShown('nickname')) || nameShown('pronouns')"></div>

				<div class="sheet-meta-nickname-cell" v-if="hasNickname && nameShown('nickname')">
					<span class="sheet-cell-label">{{ nicknameLabel }}</span>
					<span class="sheet-nickname-val" v-if="!printBlank && nickname" v-html="renderText(nickname)"></span>
					<span class="sheet-blank-line" v-else-if="printBlank"></span>
					<span class="sheet-nickname-val placeholder-dim" v-else-if="submode === 'edit'">Click to set...</span>
					<span class="sheet-blank-line" v-else></span>
				</div>

				<div class="sheet-meta-divider" v-if="hasNickname && nameShown('nickname') && nameShown('pronouns')"></div>

				<div class="sheet-meta-pronoun-cell" v-if="nameShown('pronouns')">
					<span class="sheet-cell-label">{{ pronounsLabel }}</span>
					<span class="sheet-pronoun-val" v-if="!printBlank && pronouns" v-html="renderText(pronouns)"></span>
					<span class="sheet-blank-line" v-else-if="printBlank"></span>
					<span class="sheet-pronoun-val placeholder-dim" v-else-if="submode === 'edit'">Click to set...</span>
					<span class="sheet-blank-line" v-else></span>
				</div>
			</div>

			<!-- CENTER BOX: DESCRIPTION -->
			<div
				class="sheet-header-desc-box trait-set-box"
				v-if="nameShown('description')"
				@click.stop="selectElement(['name'])"
			>
				<div class="sheet-cell-header">
					<label :for="'sheet-header-desc-' + (character?.id || 'char')" class="sheet-cell-label">{{
						descriptionLabel
					}}</label>
					<button
						v-if="submode === 'edit'"
						type="button"
						class="sheet-add-portrait-link"
						@click.stop="selectElement(['traitSet', s])"
						title="Edit Name Set / Image"
					>
						<i class="fas fa-sliders"></i> {{ hasNameSetPortrait ? 'Set / Image' : 'Add Image' }}
					</button>
				</div>
				<textarea
					v-if="submode === 'edit'"
					:id="'sheet-header-desc-' + (character?.id || 'char')"
					name="sheetHeaderDesc"
					class="sheet-desc-textarea"
					v-model="descriptionText"
					placeholder="Character description..."
					aria-label="Character description"
					@click.stop
				></textarea>
				<div class="desc-content" v-else-if="!printBlank && description" v-html="renderText(description)"></div>
				<div class="desc-blank-area" v-else>
					<div class="desc-blank-line"></div>
					<div class="desc-blank-line"></div>
				</div>
				<div class="character-notes-summary" v-if="notes && notes.length && nameShown('notes')">
					<div class="character-notes-body" v-html="renderNotesText(notes)"></div>
				</div>
			</div>

			<!-- RIGHT BOX: IMAGE ELEMENT (VIA TRAIT-SET-IMAGE, ONLY WHEN PRESENT AND VISIBLE) -->
			<div v-if="hasNameSetPortrait" class="sheet-header-portrait-wrap">
				<TraitSetImage />
			</div>
		</div>
	</div>
</template>
