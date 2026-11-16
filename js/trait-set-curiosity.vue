<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { characterCurioFunctions } from './functions.ts';
import {
	DIE_LADDER,
	getCuriosityThumbnailUrl,
	getIdentityText,
	getNameSet,
	getRating,
	isNameSet,
	keepsExtraDice,
	ratingDice,
	resolveHitches,
	resolveRating,
} from './model.ts';
import { useCuriosityGraph } from './curiosity-graph.ts';
import { injectTraitSet } from './use-trait-set.ts';

const {
	traitSet,
	s,
	character,
	submode,
	printBlank,
	selectElement,
	updateCharacter,
	renderText,
	renderDieValueForPrint,
	stageRawDie,
	isPlayMutableSet,
} = injectTraitSet();

const graph = useCuriosityGraph(
	() => character.value,
	(ch) => updateCharacter(ch),
);

const spawnInputId = useId();
const draftName = ref('');
const draftDie = ref<number | null>(8);

const targetCuriosity = computed(() => {
	const refId = traitSet.value?.ref;
	if (typeof refId !== 'string' || !refId.trim()) return null;
	return graph.resolveCuriosity(refId.trim());
});

const canConfigureLink = computed(
	() =>
		submode.value === 'edit' ||
		(submode.value === 'play' && Boolean(traitSet.value && isPlayMutableSet(traitSet.value))),
);

const targetThumbUrl = computed(() => {
	if (!targetCuriosity.value) return '';
	return characterCurioFunctions.safeImageUrl(getCuriosityThumbnailUrl(targetCuriosity.value));
});

const targetSubtitle = computed(() => {
	const t = targetCuriosity.value;
	if (!t) return '';
	return getIdentityText(t, 'description') || (typeof t.description === 'string' ? t.description.trim() : '');
});

const targetNameDice = computed<number[]>(() => {
	const t = targetCuriosity.value;
	if (!t) return [];
	const ns = getNameSet(t);
	return ns ? ratingDice(getRating(ns)) : [];
});

interface CuriosityTraitPill {
	key: string;
	name: string;
	dice: number[];
	hitches: number;
	keepsExtra: number;
}

const targetTraitPills = computed<CuriosityTraitPill[]>(() => {
	const t = targetCuriosity.value;
	if (!t || !Array.isArray(t.traitSets)) return [];
	const pills: CuriosityTraitPill[] = [];
	for (let si = 0; si < t.traitSets.length; si++) {
		const ts = t.traitSets[si];
		if (!ts || isNameSet(ts)) continue;
		const setDice = ratingDice(getRating(ts));
		if (setDice.length > 0 && ts.name) {
			pills.push({
				key: `set-${si}`,
				name: ts.name,
				dice: setDice,
				hitches: resolveHitches(ts, []),
				keepsExtra: keepsExtraDice(ts),
			});
		}
		const traits = Array.isArray(ts.traits) ? ts.traits : [];
		for (let ti = 0; ti < traits.length; ti++) {
			const tr = traits[ti];
			if (!tr || !tr.name || tr.spent) continue;
			const trDice = ratingDice(resolveRating(tr, [ts]));
			if (trDice.length === 0) continue;
			pills.push({
				key: `tr-${si}-${ti}`,
				name: tr.name,
				dice: trDice,
				hitches: resolveHitches(tr, [ts]),
				keepsExtra: keepsExtraDice(tr) || keepsExtraDice(ts),
			});
			if (pills.length >= 6) return pills;
		}
		if (pills.length >= 6) return pills;
	}
	return pills;
});

function cycleDraftDie() {
	const order: Array<number | null> = [null, ...DIE_LADDER];
	const idx = order.indexOf(draftDie.value);
	draftDie.value = order[(idx + 1) % order.length];
}

function applyRefToSet(refId: string, displayName?: string) {
	if (!traitSet.value || !character.value) return;
	traitSet.value.ref = refId;
	if (displayName && (!traitSet.value.name || /^Curiosity(\s+\d+)?$/i.test(String(traitSet.value.name).trim()))) {
		traitSet.value.name = displayName;
	}
	updateCharacter(character.value);
}

function createAndLinkCuriosity() {
	if (!traitSet.value || !character.value) return;
	const fallbackTitle =
		traitSet.value.name && !/^Curiosity(\s+\d+)?$/i.test(String(traitSet.value.name).trim())
			? String(traitSet.value.name).trim()
			: 'New Curiosity';
	const chosenName = draftName.value.trim() || fallbackTitle;
	graph.spawnCuriosity({
		name: chosenName,
		die: draftDie.value,
		onCreated: (newId, created) => {
			applyRefToSet(newId, created.name || chosenName);
		},
	});
	draftName.value = '';
}

function onDraftKeydown(event: KeyboardEvent) {
	if (event.key === 'Enter') {
		event.preventDefault();
		if (event.isComposing || event.keyCode === 229) return;
		createAndLinkCuriosity();
	}
}

function unlinkCuriosity() {
	if (!traitSet.value || !character.value) return;
	traitSet.value.ref = null;
	updateCharacter(character.value);
}

function stageTargetNameDie(size: number) {
	if (submode.value !== 'play' || !targetCuriosity.value) return;
	stageRawDie({
		size,
		qty: 1,
		source: targetCuriosity.value.name || traitSet.value?.name || 'Curiosity',
		hitches: 1,
	});
}

function stageTargetTraitPill(pill: CuriosityTraitPill) {
	if (submode.value !== 'play') return;
	if (pill.dice.length > 1) {
		stageRawDie(
			pill.dice.map((size) => ({
				size,
				qty: 1,
				source: pill.name,
				hitches: pill.hitches,
				keepsExtra: pill.keepsExtra,
			})),
		);
	} else if (pill.dice.length === 1) {
		stageRawDie({
			size: pill.dice[0],
			qty: 1,
			source: pill.name,
			hitches: pill.hitches,
			keepsExtra: pill.keepsExtra,
		});
	}
}

function onCardClick() {
	if (submode.value === 'edit') {
		selectElement(['traitSet', s.value]);
	}
}
</script>

<template>
	<div class="trait-curiosity-body" @click.stop="onCardClick">
		<!-- LINKED CURIOSITY SUMMARY CARD -->
		<div v-if="targetCuriosity" class="curiosity-card">
			<div class="curiosity-card-head">
				<div class="curiosity-card-identity">
					<img
						v-if="targetThumbUrl && !printBlank"
						:src="targetThumbUrl"
						alt=""
						class="curiosity-card-avatar"
						width="36"
						height="36"
						loading="lazy"
						decoding="async"
					/>
					<span v-else class="curiosity-card-emblem" aria-hidden="true">
						<i class="fas fa-lightbulb"></i>
					</span>
					<div class="curiosity-card-titles">
						<span class="curiosity-card-name">{{ targetCuriosity.name || 'Unnamed' }}</span>
						<span
							v-if="!printBlank && targetSubtitle"
							class="curiosity-card-subtitle"
							v-html="renderText(targetSubtitle)"
						></span>
					</div>
				</div>

				<div class="curiosity-card-actions">
					<span
						v-for="(dieSize, dIdx) in targetNameDice"
						:key="'cur-nd-' + dIdx"
						class="curiosity-card-die diecon-wrapper"
						:role="submode === 'play' ? 'button' : undefined"
						:tabindex="submode === 'play' ? 0 : undefined"
						:aria-label="
							submode === 'play' ? `Stage d${dieSize} from ${targetCuriosity.name || 'Curiosity'}` : undefined
						"
						@click.stop="stageTargetNameDie(dieSize)"
						@keydown.enter.prevent="stageTargetNameDie(dieSize)"
						@keydown.space.prevent="stageTargetNameDie(dieSize)"
						v-html="renderDieValueForPrint(dieSize, !printBlank)"
					></span>

					<button
						v-if="submode !== 'print'"
						type="button"
						class="btn-curiosity-explore"
						:aria-label="'Explore ' + (targetCuriosity.name || 'Curiosity')"
						@click.stop="graph.exploreCuriosity(targetCuriosity.id)"
					>
						<i class="fas fa-lightbulb" aria-hidden="true"></i>
						<span>Explore</span>
					</button>

					<button
						v-if="canConfigureLink && submode !== 'print'"
						type="button"
						class="btn-curiosity-unlink"
						title="Unlink curiosity"
						:aria-label="'Unlink ' + (targetCuriosity.name || 'Curiosity')"
						@click.stop="unlinkCuriosity"
					>
						<i class="fas fa-xmark" aria-hidden="true"></i>
					</button>
				</div>
			</div>

			<!-- INLINE STAGEABLE TRAIT PILLS -->
			<div v-if="!printBlank && targetTraitPills.length > 0" class="curiosity-card-traits">
				<button
					v-for="pill in targetTraitPills"
					:key="pill.key"
					type="button"
					class="curiosity-trait-pill"
					:disabled="submode !== 'play'"
					:aria-label="`Stage ${pill.name}`"
					@click.stop="stageTargetTraitPill(pill)"
				>
					<span class="curiosity-pill-label">{{ pill.name }}</span>
					<span
						v-for="(dSize, pdIdx) in pill.dice"
						:key="pill.key + '-d-' + pdIdx"
						class="curiosity-pill-die"
						v-html="renderDieValueForPrint(dSize, true)"
					></span>
				</button>
			</div>
		</div>

		<!-- UNLINKED / INLINE SETUP PICKER -->
		<div v-else-if="submode !== 'print'" class="curiosity-empty-setup" @click.stop>
			<div class="curiosity-create-row">
				<label :for="spawnInputId" class="sr-only">Curiosity name</label>
				<input
					:id="spawnInputId"
					v-model="draftName"
					type="text"
					class="curiosity-set-input"
					placeholder="Curiosity name"
					@keydown="onDraftKeydown"
				/>
				<button
					type="button"
					class="curiosity-die-cycle-btn"
					:aria-label="draftDie ? `Initial die d${draftDie}` : 'No initial die'"
					title="Cycle initial die"
					@click.stop="cycleDraftDie"
				>
					<span v-if="draftDie" v-html="renderDieValueForPrint(draftDie, true)"></span>
					<span v-else class="curiosity-no-die-label">No die</span>
				</button>
				<button type="button" class="btn-curiosity-explore" @click.stop="createAndLinkCuriosity">
					<i class="fas fa-lightbulb" aria-hidden="true"></i>
					<span>Create</span>
				</button>
			</div>

			<div v-if="graph.linkableCuriosities.value.length > 0" class="curiosity-link-existing">
				<span class="curiosity-link-hint">Link:</span>
				<button
					v-for="existing in graph.linkableCuriosities.value"
					:key="'link-cur-' + existing.id"
					type="button"
					class="curiosity-existing-chip"
					@click.stop="applyRefToSet(existing.id, existing.name)"
				>
					<i class="fas fa-lightbulb" aria-hidden="true"></i>
					<span>{{ existing.name || 'Unnamed' }}</span>
				</button>
			</div>
		</div>
	</div>
</template>
