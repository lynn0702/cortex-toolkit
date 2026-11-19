<script setup lang="ts">
import { nextTick } from 'vue';
import { getView, resolveSubtraitNoun, type Trait, type TraitSet } from './model.ts';
import { characterCurioFunctions } from './functions.ts';
import { injectTraitSet, type RenderedTraitItem } from './use-trait-set.ts';

const props = withDefaults(
	defineProps<{
		item: RenderedTraitItem;
		part: 'track-label' | 'track' | 'description' | 'badge' | 'block' | 'subtraits';
		inPartsGrid?: boolean;
	}>(),
	{
		inPartsGrid: false,
	},
);

const {
	traitSet,
	s,
	submode,
	printBlank,
	character,
	updateCharacter,
	getSubtraitRatings,
	renderDieValueForPrint,
	renderText,
	renderNotesText,
	handleSingleDieClick,
	firstDie,
	isDieActive,
	getTraitTrackLabel,
	getTrackScale,
	getTrackValue,
	visibleSubtraits,
	shouldShowTrackOut,
	isTrackOut,
	handleTrackClick,
	handleTrackOutClick,
	getTraitSetLabel,
	isPartsInline,
	stageTrackDie,
	isCanvasTraitActive,
	isInlineTrackLabelOpen,
	openInlineTrackLabel,
	setTraitTrackLabel,
	finalizeTraitTrackLabel,
	isTraitDescInlineOpen,
	getPipChild,
} = injectTraitSet();

function startInlineTrackLabel(tIdx: number | null | undefined, ev: Event) {
	openInlineTrackLabel(tIdx);
	const parent = (ev.currentTarget as HTMLElement | null)?.parentElement;
	nextTick(() => {
		const input = parent?.querySelector<HTMLInputElement>('input.track-label-inline-input');
		input?.focus();
		input?.select();
	});
}

function onTraitDescInlineInput(trait: Trait | null | undefined, event: Event) {
	if (!trait) return;
	trait.description = (event.target as HTMLInputElement).value;
	updateCharacter(character.value);
}

function onSubtraitNameInlineInput(subtrait: Trait | null | undefined, event: Event) {
	if (!subtrait) return;
	subtrait.name = (event.target as HTMLInputElement).value;
	updateCharacter(character.value);
}

function onSfxFieldInlineInput(sfx: Trait | null | undefined, field: 'name' | 'description', event: Event) {
	if (!sfx) return;
	sfx[field] = (event.target as HTMLInputElement).value;
	updateCharacter(character.value);
}

function onInlineEnter(event: KeyboardEvent) {
	if (event.isComposing || event.keyCode === 229) return;
	(event.target as HTMLElement | null)?.blur?.();
}

function hasTraitSetDescription(ts: TraitSet | null | undefined) {
	const list = Array.isArray(ts?.traits) ? ts.traits : [];
	return list.some((t) => typeof t?.description === 'string' && t.description.trim().length > 0);
}

function activateTrack(item: RenderedTraitItem, size: number) {
	if (printBlank.value || item.originalIndex === null) return;
	handleTrackClick(s.value, item.originalIndex, size);
}

function activateTrackOut(item: RenderedTraitItem) {
	if (printBlank.value || item.originalIndex === null) return;
	handleTrackOutClick(s.value, item.originalIndex);
}

function activateSubtrait(subtrait: Trait, size: number | null, parentOriginalIndex: number | null) {
	if (printBlank.value || parentOriginalIndex === null) return;
	handleSingleDieClick(subtrait, size, traitSet.value, s.value, parentOriginalIndex);
}
</script>

<template>
	<template v-if="props.part === 'track-label'">
		<div class="attached-stress-divider" v-if="props.inPartsGrid && !isPartsInline(traitSet)"></div>
		<template v-if="submode === 'play' && !printBlank && !item.isPlaceholder">
			<input
				v-if="isInlineTrackLabelOpen(item.originalIndex)"
				type="text"
				class="track-label-inline-input"
				:value="getTraitTrackLabel(traitSet, item.trait)"
				:placeholder="getTraitSetLabel(traitSet, 'track')"
				:aria-label="`Track label for ${item.trait.name || 'trait'}`"
				@click.stop
				@input="setTraitTrackLabel(s, item.originalIndex, ($event.target as HTMLInputElement).value)"
				@keydown.enter="onInlineEnter($event)"
				@keydown.escape.prevent="finalizeTraitTrackLabel(s, item.originalIndex)"
				@blur="finalizeTraitTrackLabel(s, item.originalIndex)"
			/>
			<button
				v-else
				type="button"
				class="attached-stress-label attached-stress-label-btn"
				:aria-label="`Edit track label for ${item.trait.name || 'trait'}`"
				title="Edit track label"
				@click.stop="startInlineTrackLabel(item.originalIndex, $event)"
			>
				{{ getTraitTrackLabel(traitSet, item.trait) }}
			</button>
		</template>
		<span v-else class="attached-stress-label">{{ getTraitTrackLabel(traitSet, item.trait) }}</span>
	</template>

	<div v-else-if="props.part === 'track'" class="attached-stress-track">
		<span
			v-for="size in getTrackScale(traitSet)"
			:key="size"
			:class="{ 'attached-stress-die': true, active: !printBlank && getTrackValue(item.trait, traitSet) === size }"
			role="button"
			tabindex="0"
			:aria-label="
				props.inPartsGrid
					? `Stage d${size}${getTraitTrackLabel(traitSet, item.trait) ? ' ' + getTraitTrackLabel(traitSet, item.trait) : ''} from ${item.trait.name || 'trait'}`
					: `Stage d${size} from ${getTraitTrackLabel(traitSet, item.trait) || 'track'}`
			"
			:aria-pressed="getTrackValue(item.trait, traitSet) === size ? 'true' : 'false'"
			@click.stop="activateTrack(item, size)"
			@keydown.enter.prevent="activateTrack(item, size)"
			@keydown.space.prevent="activateTrack(item, size)"
			v-html="renderDieValueForPrint(size, !printBlank && getTrackValue(item.trait, traitSet) === size)"
		></span>
		<span
			v-if="shouldShowTrackOut(traitSet)"
			:class="{ 'out-badge': true, active: !printBlank && isTrackOut(item.trait, traitSet) }"
			role="button"
			tabindex="0"
			:aria-label="
				props.inPartsGrid
					? `Out for ${item.trait.name || 'trait'}`
					: `Out for ${getTraitTrackLabel(traitSet, item.trait) || 'track'}`
			"
			:aria-pressed="isTrackOut(item.trait, traitSet) ? 'true' : 'false'"
			@click.stop="activateTrackOut(item)"
			@keydown.enter.prevent="activateTrackOut(item)"
			@keydown.space.prevent="activateTrackOut(item)"
			title="Out"
			>{{ getTraitSetLabel(traitSet, 'out') }}</span
		>
		<button
			v-if="submode === 'play' && !printBlank && !item.isPlaceholder && getTrackValue(item.trait, traitSet) > 0"
			type="button"
			class="btn-stage-stress"
			@click.stop="
				stageTrackDie(
					item.trait,
					getTrackValue(item.trait, traitSet),
					getTraitTrackLabel(traitSet, item.trait),
					traitSet,
				)
			"
			title="Stage track die into pool"
			aria-label="Stage track die into pool"
		>
			+<i class="fas fa-dice" aria-hidden="true"></i>
		</button>
	</div>

	<div
		v-else-if="
			props.part === 'description' &&
			(props.inPartsGrid ||
				(!getPipChild(item.trait) &&
					(item.trait.description ||
						hasTraitSetDescription(traitSet) ||
						(submode === 'edit' && isTraitDescInlineOpen(item.trait, item.originalIndex)))))
		"
		class="trait-description"
	>
		<span
			v-if="props.inPartsGrid && getView(traitSet)?.pipSeparator && item.trait.description"
			class="trait-pip-separator"
			>{{ getView(traitSet)?.pipSeparator }}</span
		>
		<input
			v-if="
				submode === 'edit' &&
				!printBlank &&
				!item.isPlaceholder &&
				(isTraitDescInlineOpen(item.trait, item.originalIndex) ||
					(props.inPartsGrid
						? isCanvasTraitActive(s, item.originalIndex)
						: isCanvasTraitActive(s, item.originalIndex) && Boolean(item.trait.description)))
			"
			type="text"
			class="trait-desc-inline-input"
			:value="item.trait.description || ''"
			placeholder="Description..."
			aria-label="Trait description"
			@click.stop
			@input="onTraitDescInlineInput(item.trait, $event)"
			@keydown.enter="onInlineEnter"
		/>
		<component
			:is="props.inPartsGrid ? 'span' : 'div'"
			v-else-if="!printBlank && !item.isPlaceholder && item.trait.description"
			v-html="
				getView(traitSet)?.notesMarkdown ? renderNotesText(item.trait.description) : renderText(item.trait.description)
			"
		></component>
		<component :is="props.inPartsGrid ? 'span' : 'div'" class="desc-hint" v-else-if="submode === 'edit'">
			Description...
		</component>
		<div class="desc-blank-area" v-else-if="printBlank || item.isPlaceholder">
			<div class="desc-blank-line"></div>
		</div>
		<div class="desc-blank-line" v-else></div>
	</div>

	<span
		v-else-if="props.part === 'badge' && getView(item.trait)?.badge"
		class="badge"
		:class="[
			'badge--' + (getView(item.trait)?.badge?.shape || 'vertical-bar'),
			'badge--' + (getView(item.trait)?.badge?.color || 'black'),
		]"
	>
		<i v-if="getView(item.trait)?.badge?.icon" :class="['fa', getView(item.trait)?.badge?.icon]" aria-hidden="true"></i>
		<span class="badge-label">{{ getView(item.trait)?.badge?.text }}</span>
	</span>

	<ul
		v-else-if="props.part === 'block' && characterCurioFunctions.blockChildren(item.trait, traitSet).length"
		class="trait-sfx"
	>
		<li
			v-for="(sfx, sfIdx) in characterCurioFunctions.blockChildren(item.trait, traitSet)"
			:key="(sfx && sfx._lid) || 'sfx' + sfIdx"
		>
			<span class="block-prefix" v-if="getView(item.trait)?.prefix?.text"
				>{{ getView(item.trait)?.prefix?.text }}
			</span>
			<template
				v-if="submode === 'edit' && !printBlank && !item.isPlaceholder && isCanvasTraitActive(s, item.originalIndex)"
			>
				<input
					type="text"
					class="sfx-name-inline-input"
					:value="sfx.name || ''"
					placeholder="SFX"
					aria-label="SFX name"
					@click.stop
					@input="onSfxFieldInlineInput(sfx, 'name', $event)"
					@keydown.enter="onInlineEnter"
				/>
				<input
					type="text"
					class="sfx-desc-inline-input"
					:value="sfx.description || ''"
					placeholder="Effect..."
					aria-label="SFX detail"
					@click.stop
					@input="onSfxFieldInlineInput(sfx, 'description', $event)"
					@keydown.enter="onInlineEnter"
				/>
			</template>
			<template v-else>
				<span class="trait-sfx-name" v-if="sfx.name">{{ sfx.name }}</span
				><span v-if="sfx.name && sfx.description">: </span>
				<span class="trait-sfx-description" v-if="sfx.description" v-html="renderText(sfx.description)"></span>
				<span class="sfx-blank-line" v-else-if="submode === 'print'"></span>
				<span class="sfx-placeholder-hint" v-else-if="submode === 'edit'">Detail...</span>
			</template>
		</li>
	</ul>

	<ul
		v-else-if="props.part === 'subtraits' && (visibleSubtraits(traitSet, item.trait).length || printBlank)"
		class="subtraits"
	>
		<li
			class="subtrait"
			v-for="(subtrait, u) in visibleSubtraits(traitSet, item.trait).length
				? visibleSubtraits(traitSet, item.trait)
				: printBlank
					? [{ name: '' }]
					: []"
			:key="subtrait._lid || 'u' + u"
			@click.stop="activateSubtrait(subtrait, firstDie(subtrait), item.originalIndex)"
		>
			<input
				v-if="submode === 'edit' && !printBlank && !item.isPlaceholder && isCanvasTraitActive(s, item.originalIndex)"
				type="text"
				class="subtrait-name-inline-input"
				:value="subtrait.name || ''"
				:placeholder="(resolveSubtraitNoun(subtrait, traitSet) || 'Subtrait') + ' name'"
				:aria-label="(resolveSubtraitNoun(subtrait, traitSet) || 'Subtrait') + ' name'"
				@click.stop
				@input="onSubtraitNameInlineInput(subtrait, $event)"
				@keydown.enter="onInlineEnter"
			/>
			<span class="subtrait-name" v-else-if="subtrait.name">{{ subtrait.name }}</span>
			<span class="subtrait-name" v-else>
				<span class="trait-blank-line subtrait-blank-line"></span>
			</span>
			<div class="subtrait-value">
				<span
					v-for="size in getSubtraitRatings(traitSet)"
					:key="size"
					:class="{ active: !printBlank && isDieActive(subtrait, size) }"
					role="button"
					tabindex="0"
					:aria-label="`Stage d${size} from ${subtrait.name || 'subtrait'}`"
					:aria-pressed="isDieActive(subtrait, size) ? 'true' : 'false'"
					@keydown.enter.prevent="activateSubtrait(subtrait, size, item.originalIndex)"
					@keydown.space.prevent="activateSubtrait(subtrait, size, item.originalIndex)"
					v-html="renderDieValueForPrint(size, !printBlank && isDieActive(subtrait, size))"
				></span>
			</div>
		</li>
	</ul>
</template>
