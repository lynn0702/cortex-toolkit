<script setup lang="ts">
import { getView, resolveSubtraitNoun } from './model.ts';
import { useCuriosityGraph } from './curiosity-graph.ts';
import { injectTraitSet } from './use-trait-set.ts';

const props = withDefaults(
	defineProps<{
		item: any;
		inPartsGrid?: boolean;
		mode?: 'auto' | 'asset' | 'pip-box' | 'pip-checkbox';
	}>(),
	{
		inPartsGrid: false,
		mode: 'auto',
	},
);

const {
	traitSet,
	s,
	submode,
	printBlank,
	character,
	selectElement,
	openTraitAt,
	updateCharacter,
	getRatingPlacement,
	renderText,
	isFixedSystemTrait,
	getPipChild,
	isChildPipFilled,
	togglePip,
	canEditChildOnSheet,
	setPipChildName,
	hasChildPartCell,
	isPlayMutableSet,
	isCanvasTraitActive,
	closeCanvasTrait,
} = injectTraitSet();

const graph = useCuriosityGraph(
	() => character.value,
	(ch) => updateCharacter(ch),
);

function resolveTraitRefTitle(tr: any): string {
	return graph.resolveCuriosity(tr?.ref)?.name || tr?.name || 'Curiosity';
}

function onTraitNameInlineInput(trait: any, event: Event) {
	if (!trait) return;
	trait.name = (event.target as HTMLInputElement).value;
	updateCharacter(character.value);
}

function onTraitNameInlineEnter(event: KeyboardEvent) {
	if (event.isComposing || event.keyCode === 229) return;
	(event.target as HTMLElement | null)?.blur?.();
}

function pipPlaceholder(trait: any): string {
	const child = getPipChild(trait);
	const noun = child ? resolveSubtraitNoun(child, traitSet.value) : 'Detail';
	return `${noun || 'Detail'}...`;
}

function titleAriaLabel(item: any, assetFallback = false): string {
	if (!item.isPlaceholder && item.trait.name) {
		return item.trait.name + (submode.value === 'play' ? ' options' : ' edit');
	}
	return assetFallback ? 'Edit asset' : (traitSet.value.noun || 'Name') + ' edit';
}
</script>

<template>
	<span
		v-if="props.mode === 'pip-checkbox' && getPipChild(item.trait)"
		class="pip"
		:class="{ questioned: !printBlank && isChildPipFilled(item.trait) }"
		role="checkbox"
		tabindex="0"
		:aria-checked="isChildPipFilled(item.trait) ? 'true' : 'false'"
		:aria-label="`Toggle ${resolveSubtraitNoun(getPipChild(item.trait), traitSet).toLowerCase()} for ${item.trait.name || 'trait'}`"
		@keydown.enter.prevent="togglePip(s, item.originalIndex)"
		@keydown.space.prevent="togglePip(s, item.originalIndex)"
		@click.stop="togglePip(s, item.originalIndex)"
		:title="
			submode === 'play' ? (isChildPipFilled(item.trait) ? 'Questioned (click to reset)' : 'Click to question') : ''
		"
	></span>

	<template v-else-if="props.mode === 'pip-box'">
		<span v-if="getView(traitSet)?.pipSeparator" class="trait-pip-separator">{{
			getView(traitSet)?.pipSeparator
		}}</span>
		<span class="trait-pip-box" @click.stop="openTraitAt(s, item)">
			<input
				v-if="!printBlank && !item.isPlaceholder && canEditChildOnSheet(item.trait, traitSet)"
				type="text"
				class="trait-pip-input"
				:value="getPipChild(item.trait)?.name || item.trait?.description || ''"
				@input="setPipChildName(item.trait, ($event.target as HTMLInputElement).value)"
				@click.stop="openTraitAt(s, item)"
				:placeholder="pipPlaceholder(item.trait)"
			/>
			<span
				class="trait-pip-text"
				v-else-if="!printBlank && !item.isPlaceholder && getPipChild(item.trait)?.name"
				v-html="renderText(getPipChild(item.trait)?.name ?? '')"
			></span>
			<span class="trait-pip-blank" v-else-if="printBlank || item.isPlaceholder"></span>
			<span class="trait-pip-hint" v-else-if="submode === 'edit'">{{ pipPlaceholder(item.trait) }}</span>
			<span class="trait-pip-blank" v-else></span>
		</span>
	</template>

	<button
		v-else-if="props.mode === 'asset' || (props.mode === 'auto' && getRatingPlacement(traitSet) === 'above')"
		type="button"
		class="trait-title-btn trait-asset-box"
		:aria-label="titleAriaLabel(item, true)"
		@click.stop="openTraitAt(s, item)"
	>
		<div class="trait-asset-name" v-if="!printBlank && !item.isPlaceholder && item.trait.name">
			{{ item.trait.name }}
		</div>
		<div
			class="trait-asset-desc"
			v-if="!printBlank && !item.isPlaceholder && (getPipChild(item.trait)?.name || item.trait.description)"
			v-html="renderText(getPipChild(item.trait)?.name || item.trait.description || '')"
		></div>
		<div class="trait-asset-empty" v-else-if="printBlank || item.isPlaceholder"></div>
		<div class="trait-asset-hint" v-else-if="submode === 'edit'">Click to edit asset...</div>
		<div class="trait-asset-empty" v-else></div>
	</button>

	<template v-else-if="Boolean(getPipChild(item.trait))">
		<button type="button" class="trait-title-btn" :aria-label="titleAriaLabel(item)" @click.stop="openTraitAt(s, item)">
			<span
				class="trait-name"
				v-if="(!printBlank || isFixedSystemTrait(traitSet, item.trait)) && !item.isPlaceholder && item.trait.name"
				>{{ item.trait.name }}</span
			>
			<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
				<template v-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
					{{ item.trait.name }}
				</template>
				<template v-else-if="(submode === 'edit' || isPlayMutableSet(traitSet)) && !printBlank">
					<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
				</template>
				<template v-else>
					<span class="trait-blank-line"></span>
				</template>
			</span>
			<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
		</button>
		<span
			v-if="getPipChild(item.trait) && (!props.inPartsGrid || !hasChildPartCell(traitSet, 'pip', 'rating'))"
			class="pip"
			:class="{ questioned: !printBlank && isChildPipFilled(item.trait) }"
			role="checkbox"
			tabindex="0"
			:aria-checked="isChildPipFilled(item.trait) ? 'true' : 'false'"
			:aria-label="`Toggle ${resolveSubtraitNoun(getPipChild(item.trait), traitSet).toLowerCase()} for ${item.trait.name || 'trait'}`"
			@keydown.enter.prevent="togglePip(s, item.originalIndex)"
			@keydown.space.prevent="togglePip(s, item.originalIndex)"
			@click.stop="togglePip(s, item.originalIndex)"
			:title="
				submode === 'play' ? (isChildPipFilled(item.trait) ? 'Questioned (click to reset)' : 'Click to question') : ''
			"
		></span>
		<span
			v-if="getView(traitSet)?.pipSeparator && (!props.inPartsGrid || !hasChildPartCell(traitSet, 'pip', 'label'))"
			class="trait-pip-separator"
			>{{ getView(traitSet)?.pipSeparator }}</span
		>
		<span
			v-if="!props.inPartsGrid || !hasChildPartCell(traitSet, 'pip', 'label')"
			class="trait-pip-box"
			@click.stop="openTraitAt(s, item)"
		>
			<input
				v-if="!printBlank && !item.isPlaceholder && canEditChildOnSheet(item.trait, traitSet)"
				type="text"
				class="trait-pip-input"
				:value="getPipChild(item.trait)?.name || item.trait?.description || ''"
				@input="setPipChildName(item.trait, ($event.target as HTMLInputElement).value)"
				@click.stop="openTraitAt(s, item)"
				:placeholder="pipPlaceholder(item.trait)"
			/>
			<span
				class="trait-pip-text"
				v-else-if="!printBlank && !item.isPlaceholder && getPipChild(item.trait)?.name"
				v-html="renderText(getPipChild(item.trait)?.name ?? '')"
			></span>
			<span class="trait-pip-blank" v-else-if="printBlank || item.isPlaceholder"></span>
			<span class="trait-pip-hint" v-else-if="submode === 'edit'">{{ pipPlaceholder(item.trait) }}</span>
			<span class="trait-pip-blank" v-else></span>
		</span>
	</template>

	<template v-else>
		<div
			v-if="
				(submode === 'edit' || isPlayMutableSet(traitSet)) &&
				!printBlank &&
				!item.isPlaceholder &&
				isCanvasTraitActive(s, item.originalIndex)
			"
			class="trait-name-inline-wrap"
			@click.stop
		>
			<input
				type="text"
				class="trait-name-inline-input"
				:value="item.trait.name"
				:placeholder="(traitSet.noun || 'Trait') + ' name'"
				:aria-label="(traitSet.noun || 'Trait') + ' name'"
				@click.stop
				@input="onTraitNameInlineInput(item.trait, $event)"
				@keydown.enter="onTraitNameInlineEnter"
				@keydown.escape.stop.prevent="closeCanvasTrait()"
				@blur="submode === 'play' ? closeCanvasTrait() : null"
			/>
			<button
				v-if="submode === 'play'"
				type="button"
				class="btn-inline-rating-icon"
				title="Trait options"
				aria-label="Trait options"
				@mousedown.prevent
				@click.stop="
					closeCanvasTrait();
					selectElement(['trait', s, item.originalIndex]);
				"
			>
				<i class="fas fa-sliders" aria-hidden="true"></i>
			</button>
		</div>
		<button
			v-else
			type="button"
			class="trait-title-btn"
			:aria-label="titleAriaLabel(item)"
			@click.stop="openTraitAt(s, item)"
		>
			<span
				class="trait-name"
				v-if="(!printBlank || isFixedSystemTrait(traitSet, item.trait)) && !item.isPlaceholder && item.trait.name"
				>{{ item.trait.name }}</span
			>
			<span class="trait-name trait-name-blank" v-else-if="printBlank || item.isPlaceholder || !item.trait.name">
				<template v-if="item.trait.name && getView(item.trait)?.prompt && !item.isPlaceholder">
					{{ item.trait.name }} <span class="trait-blank-line"></span>
				</template>
				<template v-else-if="isFixedSystemTrait(traitSet, item.trait) && !item.isPlaceholder">
					{{ item.trait.name }}
				</template>
				<template v-else-if="(submode === 'edit' || isPlayMutableSet(traitSet)) && !printBlank">
					<span class="trait-name-hint">{{ traitSet.noun || 'Name' }}...</span>
				</template>
				<template v-else>
					<span class="trait-blank-line"></span>
				</template>
			</span>
			<span class="trait-name" v-else>{{ item.trait.name || '' }}</span>
		</button>
		<button
			v-if="!printBlank && !item.isPlaceholder && item.trait.ref && submode !== 'print'"
			type="button"
			class="trait-explore-btn"
			:title="'Explore ' + resolveTraitRefTitle(item.trait)"
			:aria-label="'Explore ' + resolveTraitRefTitle(item.trait)"
			@click.stop="graph.exploreCuriosity(item.trait.ref)"
		>
			<i class="fas fa-lightbulb" aria-hidden="true"></i>
		</button>
	</template>
</template>
