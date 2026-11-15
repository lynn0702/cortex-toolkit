<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
	ensureView,
	getRating,
	getView,
	isNameSet,
	ratingDice,
	resolvePlotPoints,
	resolveVisibility,
} from './model.ts';
import { characterCurioFunctions } from './functions.ts';
import { normalizeZoom } from './frame-geometry.ts';
import { injectTraitSet } from './use-trait-set.ts';
import InlineRatingBar from './inline-rating-bar.vue';

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
	renderDieValue,
	renderDieValueForPrint,
	stageSetDie,
} = injectTraitSet();

const portraitInputRef = ref<HTMLInputElement | null>(null);

const name = computed(() => character.value?.name ?? '');
const description = computed(() => character.value?.description ?? '');
const player = computed(() => character.value?.player ?? '');
const pronouns = computed(() => character.value?.pronouns ?? '');
const nickname = computed(() => character.value?.nickname ?? getView(character.value)?.nickname ?? '');
const hasNickname = computed(() => Boolean(nickname.value || getView(character.value)?.hasNickname));
const notes = computed(() => character.value?.notes ?? '');
const game = computed(() => character.value?.game ?? '');
const plotPoints = computed(() => resolvePlotPoints(character.value));
const portrait = computed(() => character.value?.portrait ?? null);
const effectivePortraitUrl = computed(() => portrait.value?.url || '');

const nameText = computed({
	get: () => character.value?.name ?? '',
	set: (val: string) => {
		if (!character.value) return;
		character.value.name = val;
		updateCharacter(character.value);
	},
});

const pronounsText = computed({
	get: () => character.value?.pronouns ?? '',
	set: (val: string) => {
		if (!character.value) return;
		character.value.pronouns = val;
		updateCharacter(character.value);
	},
});

const nicknameText = computed({
	get: () => character.value?.nickname ?? (getView(character.value)?.nickname as string) ?? '',
	set: (val: string) => {
		if (!character.value) return;
		character.value.nickname = val;
		ensureView(character.value).nickname = val;
		updateCharacter(character.value);
	},
});

const gameText = computed({
	get: () => character.value?.game ?? '',
	set: (val: string) => {
		if (!character.value) return;
		character.value.game = val;
		updateCharacter(character.value);
	},
});

const playerText = computed({
	get: () => character.value?.player ?? '',
	set: (val: string) => {
		if (!character.value) return;
		character.value.player = val;
		updateCharacter(character.value);
	},
});

const notesText = computed({
	get: () => character.value?.notes ?? '',
	set: (val: string) => {
		if (!character.value) return;
		character.value.notes = val;
		updateCharacter(character.value);
	},
});

function onInlineEnter(event: KeyboardEvent) {
	if (event.isComposing || event.keyCode === 229) return;
	(event.target as HTMLElement | null)?.blur?.();
}

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

function hasExplicitNameTraitShown(key: string) {
	const t = nameTrait(key);
	if (!t) return false;
	return resolveVisibility(t) !== 'hidden';
}

function hideIdentityPart(key: string) {
	if (!character.value) return;
	if (key === 'nickname') {
		delete ensureView(character.value).hasNickname;
	}
	const hasTemplate = Boolean(character.value.sheet?.template);
	const hasVal =
		key === 'portrait'
			? Boolean(character.value.portrait?.url)
			: Boolean((character.value as Record<string, unknown>)[key]);
	const existing = characterCurioFunctions.getNameTrait(character.value, key);
	if (!hasTemplate && !hasVal && !existing?.label) {
		const ns = (character.value.traitSets || []).find((st: any) => isNameSet(st));
		if (ns && Array.isArray(ns.traits)) {
			ns.traits = ns.traits.filter((tr: any) => !(tr && tr.name === key));
		}
		updateCharacter(character.value);
		return;
	}
	const t = characterCurioFunctions.ensureNameTrait(character.value, key);
	if (!t) return;
	ensureView(t).visibility = 'hidden';
	updateCharacter(character.value);
}

const nameHeadingLabel = computed(() => nameLabel('name', 'NAME'));
const hasCustomNameLabel = computed(() => {
	const l = nameTrait('name')?.label?.trim();
	return Boolean(l && l.toUpperCase() !== 'NAME');
});
const nicknameLabel = computed(() => nameLabel('nickname', 'NICKNAME'));
const pronounsLabel = computed(() => nameLabel('pronouns', 'PRONOUNS'));
const descriptionLabel = computed(() => nameLabel('description', 'DESCRIPTION'));
const notesLabel = computed(() => nameLabel('notes', 'NOTES'));
const gameLabel = computed(() => nameLabel('game', 'GAME'));
const playerLabel = computed(() => nameWord('player', 'PLAYER:'));
const plotPointsLabel = computed(() => nameWord('plotPoints', 'PP'));

const hasDescBox = computed(
	() => nameShown('description') && (Boolean(description.value) || hasExplicitNameTraitShown('description')),
);
const showPronouns = computed(
	() => nameShown('pronouns') && (Boolean(pronouns.value) || hasExplicitNameTraitShown('pronouns')),
);
const hasNameSetPortrait = computed(() => nameShown('portrait') && Boolean(effectivePortraitUrl.value));
const showPortraitDropSlot = computed(
	() =>
		submode.value === 'edit' &&
		!effectivePortraitUrl.value &&
		!hasDescBox.value &&
		hasExplicitNameTraitShown('portrait'),
);
const hasPortraitColumn = computed(() => hasNameSetPortrait.value || showPortraitDropSlot.value);
const isCompactHeader = computed(() => !hasDescBox.value && !hasPortraitColumn.value);

const showGameFieldInEdit = computed(
	() => submode.value === 'edit' && nameShown('game') && (Boolean(game.value) || hasExplicitNameTraitShown('game')),
);
const showPlayerFieldInEdit = computed(
	() =>
		submode.value === 'edit' &&
		nameShown('player') &&
		(Boolean(player.value) || (!hasDescBox.value && hasExplicitNameTraitShown('player'))),
);
const showNotesFieldInEdit = computed(
	() => submode.value === 'edit' && nameShown('notes') && (Boolean(notes.value) || hasExplicitNameTraitShown('notes')),
);

const nameSetRating = computed(() => getRating(traitSet.value));
const nameSetDice = computed(() => ratingDice(nameSetRating.value));
const hasRatedNameSet = computed(() => Boolean(nameSetRating.value));
const showNameRatingBar = ref(false);

watch(
	() => submode.value,
	(mode) => {
		if (mode !== 'edit') {
			showNameRatingBar.value = false;
		}
	},
);

const nameSetPips = computed<boolean[]>(() => {
	if (nameSetRating.value?.type !== 'Pip') return [];
	const vals = nameSetRating.value.value;
	return Array.isArray(vals) && vals.length ? vals.map((v) => Boolean(v)) : [false];
});

const nameSetCounter = computed<number>(() => {
	if (nameSetRating.value?.type !== 'Counter') return 0;
	const v = nameSetRating.value.value?.[0];
	return typeof v === 'number' && Number.isFinite(v) ? v : 0;
});

function toggleNamePip(index: number) {
	const ts = traitSet.value as Record<string, any> | undefined;
	if (!ts || !character.value || submode.value === 'print') return;
	const next = [...nameSetPips.value];
	if (index < 0 || index >= next.length) return;
	next[index] = !next[index];
	ts.rating = { type: 'Pip', value: next };
	updateCharacter(character.value);
}

function stepNameCounter(delta: number) {
	const ts = traitSet.value as Record<string, any> | undefined;
	if (!ts || !character.value || submode.value === 'print') return;
	const r = nameSetRating.value;
	if (r?.type !== 'Counter') return;
	const bounds =
		Array.isArray(r.range) && r.range.length >= 2 ? [Number(r.range[0]) || 0, Number(r.range[1]) || 20] : [0, 20];
	const lo = Math.min(bounds[0], bounds[1]);
	const hi = Math.max(bounds[0], bounds[1]);
	const next = Math.max(lo, Math.min(hi, nameSetCounter.value + delta));
	ts.rating = { type: 'Counter', value: [next], range: [lo, hi] };
	updateCharacter(character.value);
}

const portraitAlignment = computed(
	() => getView(portrait.value)?.alignment || (portrait.value as any)?.alignment || 'top-center',
);

const portraitAlignmentClass = computed(() => {
	const a = portraitAlignment.value;
	return typeof a === 'string' && /^(top|center|bottom)(-(left|center|right))?$/.test(a)
		? `portrait-alignment-${a}`
		: undefined;
});

const portraitGraphicStyle = computed(() => {
	const url = characterCurioFunctions.safeImageUrl(effectivePortraitUrl.value);
	if (!url) return {};
	const zoom = normalizeZoom(getView(portrait.value)?.zoom) ?? 1;
	const bgSize = zoom !== 1 ? `${Math.round(zoom * 100)}%` : 'cover';
	const style: Record<string, string> = {
		backgroundImage: `url("${url}")`,
		backgroundSize: bgSize,
		backgroundRepeat: 'no-repeat',
	};
	const align = portraitAlignment.value;
	if (typeof align === 'string' && align.includes('%') && /^[0-9.%\s-]+$/.test(align)) {
		style.backgroundPosition = align.trim();
	}
	return style;
});

const portraitCaption = computed(() => {
	const lbl = nameTrait('caption')?.label;
	return typeof lbl === 'string' ? lbl : '';
});

const isCaptionShown = computed(() => Boolean(portraitCaption.value) && nameShown('caption'));

function triggerPortraitUpload() {
	portraitInputRef.value?.click();
}

function onPortraitFileChange(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file || !character.value) return;
	characterCurioFunctions.processImageFile(file, 1280, 0.85).then(
		(dataURL: string) => {
			if (!character.value.portrait) character.value.portrait = {};
			character.value.portrait.url = dataURL;
			const pt = characterCurioFunctions.ensureNameTrait(character.value, 'portrait');
			if (pt) delete ensureView(pt).visibility;
			updateCharacter(character.value);
		},
		() => {},
	);
	input.value = '';
}

function clearPortrait() {
	if (!character.value) return;
	if (!character.value.portrait) character.value.portrait = {};
	character.value.portrait.url = '';
	updateCharacter(character.value);
}

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
	const current = resolvePlotPoints(character.value);
	character.value.plotPoints = Math.max(0, current + delta);
	updateCharacter(character.value);
}
</script>

<template>
	<div class="page-header">
		<div
			class="page-header-inner sheet-header-card"
			:class="{
				'has-portrait': hasPortraitColumn,
				'no-desc-box': !hasDescBox,
				'is-compact-header': isCompactHeader,
				selected: isSelected(['name']) || isSelected(['traitSet', s]),
			}"
		>
			<!-- LEFT / PRIMARY BOX: NAME + RATING + OPTIONAL IDENTITY PARTS -->
			<div class="sheet-header-meta-box trait-set-box" @click.stop="selectElement(['name'])">
				<div class="sheet-meta-name-cell">
					<div
						class="sheet-cell-header"
						v-if="
							!isCompactHeader ||
							submode !== 'edit' ||
							hasCustomNameLabel ||
							(player && !printBlank && nameShown('player'))
						"
					>
						<span class="sheet-cell-label" v-if="nameShown('name')">{{ nameHeadingLabel }}</span>
						<span class="sheet-cell-sublabel" v-if="submode !== 'edit' && player && !printBlank && nameShown('player')"
							>{{ playerLabel }} {{ player }}</span
						>
						<button
							v-if="submode === 'edit'"
							type="button"
							class="sheet-header-settings-btn"
							title="Sheet & theme settings"
							aria-label="Sheet and theme settings"
							@click.stop="selectElement(['name'])"
						>
							<i class="fas fa-sliders" aria-hidden="true"></i>
						</button>
					</div>

					<div class="sheet-inline-part-row" v-if="showGameFieldInEdit" @click.stop>
						<span class="sheet-cell-label">{{ gameLabel }}</span>
						<input
							type="text"
							class="sheet-part-inline-input"
							v-model="gameText"
							placeholder="Game or campaign"
							aria-label="Game title"
							@keydown.enter="onInlineEnter"
						/>
						<button
							type="button"
							class="btn-hide-identity-part"
							title="Hide game"
							aria-label="Hide game"
							@click.stop="hideIdentityPart('game')"
						>
							<i class="fas fa-times" aria-hidden="true"></i>
						</button>
					</div>
					<div
						class="character-game-title"
						v-else-if="game && !printBlank && nameShown('game')"
						v-html="renderText(game)"
					></div>

					<!-- NAME + RATING ROW -->
					<div class="sheet-name-rating-row" v-if="nameShown('name') || hasRatedNameSet || submode === 'edit'">
						<template v-if="submode === 'edit'">
							<input
								v-if="nameShown('name')"
								type="text"
								class="sheet-name-inline-input"
								v-model="nameText"
								placeholder="Name"
								aria-label="Character name"
								@click.stop
								@keydown.enter="onInlineEnter"
							/>
							<button
								v-if="hasRatedNameSet"
								type="button"
								class="sheet-name-rating-trigger"
								:class="{ active: showNameRatingBar }"
								:aria-expanded="showNameRatingBar"
								aria-label="Edit sheet rating"
								title="Edit rating"
								@click.stop="showNameRatingBar = !showNameRatingBar"
							>
								<template
									v-if="(nameSetRating?.type === 'Die' || nameSetRating?.type === 'Dice') && nameSetDice.length > 0"
								>
									<span
										v-for="(dieSize, dIdx) in nameSetDice"
										:key="'edit-nd-' + dIdx"
										class="sheet-name-rating-badge diecon-wrapper"
										v-html="renderDieValue(dieSize, true)"
									></span>
								</template>
								<span v-else-if="nameSetRating?.type === 'Pip'" class="sheet-name-pip-group">
									<span
										v-for="(filled, pIdx) in nameSetPips"
										:key="'edit-np-' + pIdx"
										class="pip-bubble"
										:class="{ filled }"
									></span>
								</span>
								<span v-else-if="nameSetRating?.type === 'Counter'" class="counter-display">
									{{ nameSetCounter }}
								</span>
							</button>
							<button
								v-if="isCompactHeader && !hasCustomNameLabel"
								type="button"
								class="sheet-header-settings-btn"
								title="Sheet & theme settings"
								aria-label="Sheet and theme settings"
								@click.stop="selectElement(['name'])"
							>
								<i class="fas fa-sliders" aria-hidden="true"></i>
							</button>
						</template>

						<template v-else>
							<div class="sheet-cell-content name-content" v-if="!printBlank && name" v-html="renderText(name)"></div>
							<div class="sheet-blank-line" v-else></div>

							<div
								v-if="(nameSetRating?.type === 'Die' || nameSetRating?.type === 'Dice') && nameSetDice.length > 0"
								class="sheet-name-play-dice"
							>
								<span
									v-for="(dieSize, dIdx) in nameSetDice"
									:key="'play-nd-' + dIdx"
									class="sheet-name-rating-badge diecon-wrapper"
									:role="submode === 'play' ? 'button' : undefined"
									:tabindex="submode === 'play' ? 0 : undefined"
									:aria-label="submode === 'play' ? `Stage d${dieSize} ${name || 'Sheet'}` : undefined"
									@click.stop="submode === 'play' ? stageSetDie(dieSize, name || 'Sheet') : null"
									@keydown.enter.stop.prevent="submode === 'play' ? stageSetDie(dieSize, name || 'Sheet') : null"
									@keydown.space.stop.prevent="submode === 'play' ? stageSetDie(dieSize, name || 'Sheet') : null"
									v-html="
										submode === 'print' ? renderDieValueForPrint(dieSize, !printBlank) : renderDieValue(dieSize, true)
									"
								></span>
							</div>
							<div v-else-if="nameSetRating?.type === 'Pip'" class="trait-value pip-value" @click.stop>
								<span
									v-for="(filled, pIdx) in nameSetPips"
									:key="'play-np-' + pIdx"
									class="pip-bubble"
									:class="{ filled: !printBlank && filled }"
									:role="submode === 'play' ? 'checkbox' : undefined"
									:tabindex="submode === 'play' ? 0 : undefined"
									:aria-checked="submode === 'play' ? (filled ? 'true' : 'false') : undefined"
									:aria-label="submode === 'play' ? `Sheet pip ${pIdx + 1}` : undefined"
									@click.stop="submode === 'play' ? toggleNamePip(pIdx) : null"
									@keydown.enter.stop.prevent="submode === 'play' ? toggleNamePip(pIdx) : null"
									@keydown.space.stop.prevent="submode === 'play' ? toggleNamePip(pIdx) : null"
								></span>
							</div>
							<div v-else-if="nameSetRating?.type === 'Counter'" class="trait-value counter-value" @click.stop>
								<template v-if="submode === 'play'">
									<button
										type="button"
										class="btn-canvas-counter-step"
										aria-label="Decrease sheet counter"
										@click.stop="stepNameCounter(-1)"
									>
										-
									</button>
									<span class="counter-display">{{ nameSetCounter }}</span>
									<button
										type="button"
										class="btn-canvas-counter-step"
										aria-label="Increase sheet counter"
										@click.stop="stepNameCounter(1)"
									>
										+
									</button>
								</template>
								<span v-else class="counter-display">{{ !printBlank ? nameSetCounter : '' }}</span>
							</div>
						</template>

						<div class="character-pp-badge" v-if="submode === 'play' && nameShown('plotPoints')" @click.stop>
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

					<InlineRatingBar
						v-if="submode === 'edit' && showNameRatingBar && traitSet"
						:node="traitSet"
						:dice-config="getView(character)?.diceConfig"
						:subject-label="name || 'Sheet'"
						@change="updateCharacter(character)"
						@close="showNameRatingBar = false"
					/>

					<div class="sheet-inline-part-row" v-if="showPlayerFieldInEdit" @click.stop>
						<span class="sheet-cell-label">{{ playerLabel }}</span>
						<input
							type="text"
							class="sheet-part-inline-input"
							v-model="playerText"
							placeholder="Player"
							aria-label="Player name"
							@keydown.enter="onInlineEnter"
						/>
						<button
							type="button"
							class="btn-hide-identity-part"
							title="Hide player"
							aria-label="Hide player"
							@click.stop="hideIdentityPart('player')"
						>
							<i class="fas fa-times" aria-hidden="true"></i>
						</button>
					</div>
				</div>

				<div class="sheet-meta-divider" v-if="(hasNickname && nameShown('nickname')) || showPronouns"></div>

				<div class="sheet-meta-nickname-cell" v-if="hasNickname && nameShown('nickname')" @click.stop>
					<span class="sheet-cell-label">{{ nicknameLabel }}</span>
					<template v-if="submode === 'edit'">
						<input
							type="text"
							class="sheet-part-inline-input"
							v-model="nicknameText"
							placeholder="Nickname"
							aria-label="Nickname"
							@keydown.enter="onInlineEnter"
						/>
						<button
							type="button"
							class="btn-hide-identity-part"
							title="Hide nickname"
							aria-label="Hide nickname"
							@click.stop="hideIdentityPart('nickname')"
						>
							<i class="fas fa-times" aria-hidden="true"></i>
						</button>
					</template>
					<span class="sheet-nickname-val" v-else-if="!printBlank && nickname" v-html="renderText(nickname)"></span>
					<span class="sheet-blank-line" v-else></span>
				</div>

				<div class="sheet-meta-divider" v-if="hasNickname && nameShown('nickname') && showPronouns"></div>

				<div class="sheet-meta-pronoun-cell" v-if="showPronouns" @click.stop>
					<span class="sheet-cell-label">{{ pronounsLabel }}</span>
					<template v-if="submode === 'edit'">
						<input
							type="text"
							class="sheet-part-inline-input"
							v-model="pronounsText"
							placeholder="Pronouns"
							aria-label="Pronouns"
							@keydown.enter="onInlineEnter"
						/>
						<button
							type="button"
							class="btn-hide-identity-part"
							title="Hide pronouns"
							aria-label="Hide pronouns"
							@click.stop="hideIdentityPart('pronouns')"
						>
							<i class="fas fa-times" aria-hidden="true"></i>
						</button>
					</template>
					<span class="sheet-pronoun-val" v-else-if="!printBlank && pronouns" v-html="renderText(pronouns)"></span>
					<span class="sheet-blank-line" v-else></span>
				</div>

				<!-- INLINE NOTES WHEN DESCRIPTION BOX IS HIDDEN -->
				<div
					class="sheet-meta-notes-inline"
					v-if="!hasDescBox && (showNotesFieldInEdit || (notes && nameShown('notes')))"
					@click.stop
				>
					<div class="sheet-meta-divider"></div>
					<div class="sheet-cell-header" v-if="submode === 'edit'">
						<span class="sheet-cell-label">{{ notesLabel }}</span>
						<button
							type="button"
							class="btn-hide-identity-part"
							title="Hide notes"
							aria-label="Hide notes"
							@click.stop="hideIdentityPart('notes')"
						>
							<i class="fas fa-times" aria-hidden="true"></i>
						</button>
					</div>
					<textarea
						v-if="submode === 'edit'"
						class="sheet-desc-textarea"
						v-model="notesText"
						placeholder="Notes..."
						aria-label="Notes"
					></textarea>
					<div class="character-notes-summary" v-else-if="notes && nameShown('notes')">
						<div class="character-notes-body" v-html="renderNotesText(notes)"></div>
					</div>
				</div>
			</div>

			<!-- CENTER BOX: DESCRIPTION -->
			<div class="sheet-header-desc-box trait-set-box" v-if="hasDescBox" @click.stop="selectElement(['name'])">
				<div class="sheet-cell-header">
					<label :for="'sheet-header-desc-' + (character?.id || 'char')" class="sheet-cell-label">{{
						descriptionLabel
					}}</label>
					<div class="sheet-desc-header-actions" v-if="submode === 'edit'">
						<button
							type="button"
							class="sheet-add-portrait-link"
							@click.stop="selectElement(['name'])"
							title="Edit Character Portrait"
						>
							<i class="fas fa-sliders" aria-hidden="true"></i> {{ hasNameSetPortrait ? 'Portrait' : 'Add Portrait' }}
						</button>
						<button
							type="button"
							class="btn-hide-identity-part"
							title="Hide description"
							aria-label="Hide description"
							@click.stop="hideIdentityPart('description')"
						>
							<i class="fas fa-times" aria-hidden="true"></i>
						</button>
					</div>
				</div>
				<textarea
					v-if="submode === 'edit'"
					:id="'sheet-header-desc-' + (character?.id || 'char')"
					name="sheetHeaderDesc"
					class="sheet-desc-textarea"
					v-model="descriptionText"
					placeholder="Description..."
					aria-label="Character description"
					@click.stop
				></textarea>
				<div class="desc-content" v-else-if="!printBlank && description" v-html="renderText(description)"></div>
				<div class="desc-blank-area" v-else>
					<div class="desc-blank-line"></div>
					<div class="desc-blank-line"></div>
				</div>
				<div class="character-notes-summary" v-if="showNotesFieldInEdit" @click.stop>
					<div class="sheet-cell-header">
						<span class="sheet-cell-label">{{ notesLabel }}</span>
						<button
							type="button"
							class="btn-hide-identity-part"
							title="Hide notes"
							aria-label="Hide notes"
							@click.stop="hideIdentityPart('notes')"
						>
							<i class="fas fa-times" aria-hidden="true"></i>
						</button>
					</div>
					<textarea
						class="sheet-desc-textarea"
						v-model="notesText"
						placeholder="Notes..."
						aria-label="Notes"
					></textarea>
				</div>
				<div class="character-notes-summary" v-else-if="notes && notes.length && nameShown('notes')">
					<div class="character-notes-body" v-html="renderNotesText(notes)"></div>
				</div>
			</div>

			<!-- RIGHT BOX: CHARACTER PORTRAIT -->
			<div v-if="hasPortraitColumn" class="sheet-header-portrait-wrap">
				<input
					ref="portraitInputRef"
					type="file"
					class="sr-only"
					accept="image/*"
					aria-label="Upload character portrait"
					@change="onPortraitFileChange"
				/>
				<div
					v-if="hasNameSetPortrait"
					class="sheet-header-portrait-box has-image"
					:role="submode === 'edit' ? 'button' : undefined"
					:tabindex="submode === 'edit' ? 0 : undefined"
					:aria-label="submode === 'edit' ? 'Edit character portrait' : undefined"
					@click.stop="selectElement(['name'])"
					@keydown.enter.stop.prevent="submode === 'edit' && selectElement(['name'])"
					@keydown.space.stop.prevent="submode === 'edit' && selectElement(['name'])"
					:title="
						submode === 'edit' ? 'Click to edit character portrait' : portrait?.alt || name || 'Character portrait'
					"
				>
					<div class="portrait-small-image" :class="portraitAlignmentClass" :style="portraitGraphicStyle"></div>
					<button
						v-if="submode === 'edit'"
						type="button"
						class="btn-remove-header-portrait"
						@click.stop="clearPortrait"
						title="Remove portrait"
						aria-label="Remove portrait"
					>
						<i class="fas fa-trash-alt" aria-hidden="true"></i>
					</button>
				</div>
				<div v-else-if="showPortraitDropSlot" class="sheet-header-portrait-box is-empty-slot">
					<button
						type="button"
						class="btn-upload-portrait-slot"
						@click.stop="triggerPortraitUpload"
						aria-label="Upload portrait image"
					>
						<i class="fas fa-image" aria-hidden="true"></i>
						<span>Portrait</span>
					</button>
					<button
						type="button"
						class="btn-remove-header-portrait"
						@click.stop="hideIdentityPart('portrait')"
						title="Hide portrait"
						aria-label="Hide portrait"
					>
						<i class="fas fa-times" aria-hidden="true"></i>
					</button>
				</div>
				<div class="sheet-portrait-caption" v-if="isCaptionShown">
					{{ portraitCaption }}
				</div>
			</div>
		</div>
	</div>
</template>
