<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import ModalDialog from './modal-dialog.vue';
import { availableDice, isHiddenIn, isNameSet, keepsExtraDice, resolveHitches } from './model.ts';
import { formatDiceNotation } from './dice-pool.ts';

interface PaletteItem {
	id: string;
	kind: 'set' | 'trait' | 'sfx' | 'statement' | 'character' | 'action';
	icon: string;
	title: string;
	subtitle: string;
	description: string;
	parentTitle?: string;
	dice: number[];
	notation: string;
	canHinder: boolean;
	hitches: number;
	keepsExtra: number;
	selector?: unknown[];
	setIndex?: number;
	charId?: string;
	actionId?: string;
	tags: string[];
	searchBlob: string;
}

const props = defineProps<{
	open: boolean;
	character?: any | null;
	characters: any[];
	mode: string;
	submode: string | null;
	activePoolSide: 'player' | 'opposition';
	playerPoolCount: number;
	oppositionPoolCount: number;
	isDarkMode?: boolean;
}>();

const emit = defineEmits<{
	(e: 'close'): void;
	(e: 'addDie', dieData: any): void;
	(e: 'rollPool'): void;
	(e: 'clearPools'): void;
	(e: 'togglePoolSide'): void;
	(e: 'selectElement', selector: unknown[]): void;
	(e: 'navigate', mode: string, submode: string | null): void;
	(e: 'loadCharacter', id: string): void;
	(e: 'toggleTheme'): void;
}>();

const query = ref('');
const activeIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);
const listboxRef = ref<HTMLUListElement | null>(null);

watch(
	() => props.open,
	async (isOpen) => {
		if (!isOpen) return;
		query.value = '';
		activeIndex.value = 0;
		await nextTick();
		inputRef.value?.focus();
	},
);

const totalPoolCount = computed(() => (props.playerPoolCount || 0) + (props.oppositionPoolCount || 0));

function normalizeTags(raw: unknown): string[] {
	if (!Array.isArray(raw)) return [];
	return raw.map((t) => String(t || '').trim()).filter((t) => t.length > 0);
}

function hasHinderChild(children: any[]): boolean {
	return children.some((c: any) => {
		const name = String(c?.name || '')
			.trim()
			.toLowerCase();
		if (name === 'hinder') return true;
		return (
			name === 'sfx' &&
			Array.isArray(c?.traits) &&
			c.traits.some(
				(g: any) =>
					String(g?.name || '')
						.trim()
						.toLowerCase() === 'hinder',
			)
		);
	});
}

function buildSearchBlob(parts: Array<string | string[]>): string {
	return parts
		.flat()
		.map((s) =>
			String(s || '')
				.trim()
				.toLowerCase(),
		)
		.filter(Boolean)
		.join(' ');
}

const allItems = computed<PaletteItem[]>(() => {
	const items: PaletteItem[] = [];
	const visContext = props.submode === 'play' ? 'play' : 'edit';
	const ch = props.character;

	if (ch && Array.isArray(ch.traitSets)) {
		for (let sIdx = 0; sIdx < ch.traitSets.length; sIdx++) {
			const ts = ch.traitSets[sIdx];
			if (!ts || isHiddenIn(ts, visContext)) continue;

			if (isNameSet(ts)) {
				const setTitle = String(ts.name || 'Identity & Name').trim();
				const tags = normalizeTags(ts.tags);
				items.push({
					id: `set-name-${sIdx}`,
					kind: 'set',
					icon: 'fa-bookmark',
					title: setTitle,
					subtitle: 'Identity Block',
					description: String(ts.description || '').trim(),
					dice: [],
					notation: '',
					canHinder: false,
					hitches: 1,
					keepsExtra: 0,
					selector: ['name'],
					setIndex: sIdx,
					tags,
					searchBlob: buildSearchBlob([setTitle, 'identity name header', tags]),
				});
				continue;
			}

			const setName = String(ts.name || ts.noun || `Trait Set ${sIdx + 1}`).trim();
			const setNoun = String(ts.noun || '').trim();
			const isDistinctionSet = setNoun.toLowerCase() === 'distinction';
			const setHitches = resolveHitches(ts);
			const setKeepsExtra = keepsExtraDice(ts);
			const setDice = availableDice(ts);
			const setTags = normalizeTags(ts.tags);

			items.push({
				id: `set-${ts.id || sIdx}`,
				kind: 'set',
				icon: 'fa-layer-group',
				title: setName,
				subtitle: setNoun || 'Trait Set',
				description: String(ts.description || '').trim(),
				dice: setDice,
				notation: setDice.length ? formatDiceNotation(setDice) : '',
				canHinder: false,
				hitches: setHitches,
				keepsExtra: setKeepsExtra,
				selector: ['traitSet', sIdx],
				setIndex: sIdx,
				tags: setTags,
				searchBlob: buildSearchBlob([setName, setNoun, ts.description, formatDiceNotation(setDice), setTags]),
			});

			const traits = Array.isArray(ts.traits) ? ts.traits : [];
			for (let tIdx = 0; tIdx < traits.length; tIdx++) {
				const tr = traits[tIdx];
				if (!tr || isHiddenIn(tr, visContext) || tr.id === 'plotPoints') continue;

				const trName = String(tr.name || tr.label || '').trim();
				const trDesc = String(tr.description || '').trim();
				const trDice = tr.spent === true ? [] : availableDice(tr);
				const children = Array.isArray(tr.traits) ? tr.traits : [];
				if (!trName && !trDesc && trDice.length === 0 && children.length === 0) continue;

				const displayTitle = trName || `${setNoun || setName} ${tIdx + 1}`;
				const canHinder = isDistinctionSet || hasHinderChild(children);
				const trHitches = resolveHitches(tr, [ts]);
				const trKeepsExtra = keepsExtraDice(tr);
				const trTags = normalizeTags(tr.tags);
				const trNotation = trDice.length ? formatDiceNotation(trDice) : '';

				items.push({
					id: `trait-${sIdx}-${tIdx}`,
					kind: 'trait',
					icon: trDice.length ? 'fa-dice' : 'fa-bookmark',
					title: displayTitle,
					subtitle: setName,
					description: trDesc,
					dice: trDice,
					notation: trNotation,
					canHinder,
					hitches: trHitches,
					keepsExtra: trKeepsExtra,
					selector: ['trait', sIdx, tIdx],
					setIndex: sIdx,
					tags: trTags,
					searchBlob: buildSearchBlob([displayTitle, setName, setNoun, trDesc, trNotation, trTags]),
				});

				for (let cIdx = 0; cIdx < children.length; cIdx++) {
					const child = children[cIdx];
					if (!child || isHiddenIn(child, visContext)) continue;
					const childName = String(child.name || '').trim();
					const childLower = childName.toLowerCase();

					if (childLower === 'sfx' && Array.isArray(child.traits)) {
						for (let gIdx = 0; gIdx < child.traits.length; gIdx++) {
							const g = child.traits[gIdx];
							if (!g || isHiddenIn(g, visContext)) continue;
							const gName = String(g.name || '').trim();
							const gDesc = String(g.description || '').trim();
							if (!gName && !gDesc) continue;
							const gTags = normalizeTags(g.tags);
							const sfxCanHinder = gName.toLowerCase() === 'hinder';
							items.push({
								id: `sfx-${sIdx}-${tIdx}-${cIdx}-${gIdx}`,
								kind: 'sfx',
								icon: 'fa-dice',
								title: gName || 'SFX',
								parentTitle: displayTitle,
								subtitle: `${displayTitle} · SFX`,
								description: gDesc,
								dice: [],
								notation: sfxCanHinder ? 'd4 + PP' : '',
								canHinder: sfxCanHinder,
								hitches: 1,
								keepsExtra: 0,
								selector: ['trait', sIdx, tIdx, cIdx, gIdx],
								setIndex: sIdx,
								tags: gTags,
								searchBlob: buildSearchBlob([gName, 'sfx', displayTitle, setName, gDesc, gTags]),
							});
						}
						continue;
					}

					if (childLower === 'statement' && Array.isArray(child.traits)) {
						for (let gIdx = 0; gIdx < child.traits.length; gIdx++) {
							const g = child.traits[gIdx];
							if (!g || isHiddenIn(g, visContext)) continue;
							const gName = String(g.name || g.description || '').trim();
							if (!gName) continue;
							const gTags = normalizeTags(g.tags);
							items.push({
								id: `stmt-${sIdx}-${tIdx}-${cIdx}-${gIdx}`,
								kind: 'statement',
								icon: 'fa-bookmark',
								title: gName,
								parentTitle: displayTitle,
								subtitle: `${displayTitle} · Statement`,
								description: gDescIfDistinct(gName, g.description),
								dice: [],
								notation: '',
								canHinder: false,
								hitches: 1,
								keepsExtra: 0,
								selector: ['trait', sIdx, tIdx, cIdx, gIdx],
								setIndex: sIdx,
								tags: gTags,
								searchBlob: buildSearchBlob([gName, 'statement', displayTitle, setName, g.description, gTags]),
							});
						}
						continue;
					}

					if (!childName) continue;
					const childDice = child.spent === true ? [] : availableDice(child);
					const childNotation = childDice.length ? formatDiceNotation(childDice) : '';
					const childTags = normalizeTags(child.tags);
					const childDesc = String(child.description || '').trim();
					items.push({
						id: `sub-${sIdx}-${tIdx}-${cIdx}`,
						kind: 'trait',
						icon: childDice.length ? 'fa-dice' : 'fa-bookmark',
						title: childName,
						parentTitle: displayTitle,
						subtitle: `${setName} › ${displayTitle}`,
						description: childDesc,
						dice: childDice,
						notation: childNotation,
						canHinder: childLower === 'hinder',
						hitches: resolveHitches(child, [tr, ts]),
						keepsExtra: keepsExtraDice(child),
						selector: ['trait', sIdx, tIdx, cIdx],
						setIndex: sIdx,
						tags: childTags,
						searchBlob: buildSearchBlob([childName, displayTitle, setName, childDesc, childNotation, childTags]),
					});
				}
			}
		}
	}

	// Other roster characters
	for (const c of props.characters || []) {
		if (!c || !c.id || c.id === ch?.id) continue;
		const cName = String(c.name || 'Unnamed Character').trim();
		const cSub = String(c.game || (c.isTemplate ? 'Saved Template' : 'Character')).trim();
		const cTags = normalizeTags(c.tags);
		items.push({
			id: `char-${c.id}`,
			kind: 'character',
			icon: 'fa-users',
			title: cName,
			subtitle: cSub,
			description: '',
			dice: [],
			notation: '',
			canHinder: false,
			hitches: 1,
			keepsExtra: 0,
			charId: c.id,
			tags: cTags,
			searchBlob: buildSearchBlob([cName, cSub, 'switch character', cTags]),
		});
	}

	// Context-aware app actions
	if (ch) {
		if (props.mode !== 'character' || props.submode !== 'play') {
			items.push(
				makeAction('play', 'fa-dice', 'Switch to Play Mode', 'Roll dice and stage pools', ['mode', 'play', 'roller']),
			);
		}
		if (props.mode !== 'character' || props.submode !== 'edit') {
			items.push(
				makeAction('edit', 'fa-pencil', 'Switch to Create / Edit Mode', 'Edit sheet layout and traits', [
					'mode',
					'edit',
					'create',
					'studio',
				]),
			);
		}
		if (props.mode !== 'character' || props.submode !== 'print') {
			items.push(makeAction('print', 'fa-print', 'Open Print View', 'Preview printable sheet', ['mode', 'print']));
		}
	}
	if (props.mode !== 'roster') {
		items.push(
			makeAction('roster', 'fa-users', 'Go to Roster', 'View all characters and templates', ['roster', 'home']),
		);
	}
	if (props.submode === 'play') {
		const nextSideLabel = props.activePoolSide === 'opposition' ? 'Player Pool' : 'Opposition Pool';
		items.push(
			makeAction('toggle-pool-side', 'fa-dice', `Target ${nextSideLabel}`, 'Switch staging destination (Alt+P)', [
				'pool',
				'target',
				'opposition',
				'player',
			]),
		);
		if (totalPoolCount.value > 0) {
			items.push(
				makeAction('roll-pool', 'fa-dice', 'Roll Current Pool', 'Evaluate staged dice now (Ctrl+Enter)', [
					'roll',
					'evaluate',
					'dice',
				]),
			);
			items.push(
				makeAction('clear-pools', 'fa-trash', 'Clear Dice Pools', 'Empty both Player and Opposition pools', [
					'clear',
					'reset',
					'pool',
				]),
			);
		}
	}
	items.push(
		makeAction(
			'toggle-theme',
			props.isDarkMode ? 'fa-sun' : 'fa-moon',
			props.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
			'Toggle interface color scheme',
			['theme', 'dark', 'light', 'appearance'],
		),
	);

	return items;
});

function gDescIfDistinct(title: string, desc: unknown): string {
	const clean = String(desc || '').trim();
	return clean && clean !== title ? clean : '';
}

function makeAction(actionId: string, icon: string, title: string, subtitle: string, keywords: string[]): PaletteItem {
	return {
		id: `action-${actionId}`,
		kind: 'action',
		icon,
		title,
		subtitle,
		description: '',
		dice: [],
		notation: '',
		canHinder: false,
		hitches: 1,
		keepsExtra: 0,
		actionId,
		tags: [],
		searchBlob: buildSearchBlob([title, subtitle, ...keywords]),
	};
}

const filteredItems = computed<PaletteItem[]>(() => {
	const raw = query.value.trim().toLowerCase();
	if (!raw) return allItems.value.slice(0, 40);
	const tokens = raw.split(/\s+/).filter(Boolean);

	const scored: Array<{ item: PaletteItem; score: number }> = [];
	for (const item of allItems.value) {
		let matchedAll = true;
		let score = 0;
		const titleLower = item.title.toLowerCase();

		for (const tok of tokens) {
			if (tok.startsWith('#')) {
				const tagNeedle = tok.slice(1);
				if (!tagNeedle) continue;
				const hasTag = item.tags.some((t) => t.toLowerCase().includes(tagNeedle));
				if (!hasTag) {
					matchedAll = false;
					break;
				}
				score += 40;
				continue;
			}
			if (!item.searchBlob.includes(tok)) {
				matchedAll = false;
				break;
			}
			if (titleLower === tok) score += 100;
			else if (titleLower.startsWith(tok)) score += 60;
			else if (titleLower.includes(tok)) score += 35;
			else score += 15;
		}
		if (matchedAll) {
			if (item.dice.length) score += 5;
			scored.push({ item, score });
		}
	}
	scored.sort((a, b) => b.score - a.score);
	return scored.slice(0, 40).map((s) => s.item);
});

watch(filteredItems, () => {
	if (activeIndex.value >= filteredItems.value.length) {
		activeIndex.value = Math.max(0, filteredItems.value.length - 1);
	}
});

const activeItem = computed(() => filteredItems.value[activeIndex.value] || null);
const activeOptionId = computed(() => (activeItem.value ? `palette-option-${activeIndex.value}` : ''));

function buildStagePayload(item: PaletteItem, asHinder = false): any | null {
	if (asHinder || (item.dice.length === 0 && item.canHinder)) {
		if (!item.canHinder) return null;
		const baseName = item.parentTitle || item.title;
		return {
			size: 4,
			source: `${baseName} (Hinder)`,
			hitches: 1,
			keepsExtra: 0,
			ppDelta: 1,
			ppCommitted: false,
		};
	}
	if (item.dice.length === 1) {
		return {
			size: item.dice[0],
			source: item.title,
			hitches: item.hitches,
			keepsExtra: item.keepsExtra,
		};
	}
	if (item.dice.length > 1) {
		return item.dice.map((d) => ({
			size: d,
			source: item.title,
			hitches: item.hitches,
			keepsExtra: item.keepsExtra,
		}));
	}
	return null;
}

function stageItem(item: PaletteItem, closeAfter = false, asHinder = false): boolean {
	const payload = buildStagePayload(item, asHinder);
	if (!payload) return false;
	emit('addDie', payload);
	if (closeAfter) emit('close');
	else inputRef.value?.focus();
	return true;
}

function scrollSetIntoView(setIndex: number | undefined) {
	if (setIndex === undefined || setIndex < 0) return;
	nextTick(() => {
		const el = document.querySelector(`.trait-set[data-set-index="${setIndex}"]`);
		if (el && typeof el.scrollIntoView === 'function') {
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	});
}

function activateItem(item: PaletteItem, keepOpen = false) {
	if (item.kind === 'action') {
		if (item.actionId === 'play') emit('navigate', 'character', 'play');
		else if (item.actionId === 'edit') emit('navigate', 'character', 'edit');
		else if (item.actionId === 'print') emit('navigate', 'character', 'print');
		else if (item.actionId === 'roster') emit('navigate', 'roster', null);
		else if (item.actionId === 'toggle-pool-side') emit('togglePoolSide');
		else if (item.actionId === 'roll-pool') emit('rollPool');
		else if (item.actionId === 'clear-pools') emit('clearPools');
		else if (item.actionId === 'toggle-theme') emit('toggleTheme');
		if (!keepOpen) emit('close');
		return;
	}

	if (item.kind === 'character' && item.charId) {
		emit('loadCharacter', item.charId);
		emit('close');
		return;
	}

	if (props.submode === 'play') {
		const isStageable = item.dice.length > 0 || item.canHinder;
		if (isStageable) {
			stageItem(item, !keepOpen, item.dice.length === 0 && item.canHinder);
			return;
		}
		if (item.selector) {
			emit('selectElement', item.selector);
			scrollSetIntoView(item.setIndex);
			emit('close');
		}
		return;
	}

	if (keepOpen) return;

	if (props.mode !== 'character' || props.submode !== 'edit') {
		emit('navigate', 'character', 'edit');
	}
	if (item.selector) {
		nextTick(() => {
			emit('selectElement', item.selector!);
			scrollSetIntoView(item.setIndex);
		});
	}
	emit('close');
}

function handleOptionClick(item: PaletteItem, event: MouseEvent) {
	activateItem(item, event.shiftKey);
}

function clearQuery() {
	query.value = '';
	activeIndex.value = 0;
	inputRef.value?.focus();
}

function scrollActiveOptionIntoView() {
	nextTick(() => {
		const el = listboxRef.value?.children[activeIndex.value] as HTMLElement | undefined;
		el?.scrollIntoView?.({ block: 'nearest' });
	});
}

function handleKeydown(event: KeyboardEvent) {
	if (event.altKey && event.key.toLowerCase() === 'p') {
		event.preventDefault();
		emit('togglePoolSide');
		return;
	}
	if (event.key === 'ArrowDown') {
		if (!filteredItems.value.length) return;
		event.preventDefault();
		activeIndex.value = (activeIndex.value + 1) % filteredItems.value.length;
		scrollActiveOptionIntoView();
		return;
	}
	if (event.key === 'ArrowUp') {
		if (!filteredItems.value.length) return;
		event.preventDefault();
		activeIndex.value = (activeIndex.value - 1 + filteredItems.value.length) % filteredItems.value.length;
		scrollActiveOptionIntoView();
		return;
	}
	if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
		if (props.submode === 'play') {
			event.preventDefault();
			const item = activeItem.value;
			if (totalPoolCount.value === 0 && item && (item.dice.length > 0 || item.canHinder)) {
				stageItem(item, false, item.dice.length === 0 && item.canHinder);
			}
			if (totalPoolCount.value > 0 || (item && (item.dice.length > 0 || item.canHinder))) {
				emit('rollPool');
				emit('close');
			}
		}
		return;
	}
	if (event.key === 'Enter') {
		if (!activeItem.value) return;
		event.preventDefault();
		activateItem(activeItem.value, event.shiftKey);
	}
}
</script>

<template>
	<ModalDialog :open="open" label="Quick palette" dialog-class="modal-command-palette" @close="emit('close')">
		<div class="palette-shell">
			<div class="palette-search-row">
				<i class="fas fa-search palette-search-icon" aria-hidden="true"></i>
				<input
					id="command-palette-input"
					ref="inputRef"
					name="commandPaletteQuery"
					v-model="query"
					type="text"
					class="palette-input"
					role="combobox"
					autocomplete="off"
					aria-autocomplete="list"
					:aria-expanded="filteredItems.length > 0"
					aria-controls="command-palette-listbox"
					:aria-activedescendant="activeOptionId || undefined"
					aria-label="Search traits, SFX, tags, characters, and actions"
					placeholder="Search traits, SFX, #tags, characters, or actions..."
					@keydown="handleKeydown"
				/>
				<button v-if="query" type="button" class="palette-icon-btn" aria-label="Clear search" @click.stop="clearQuery">
					<i class="fas fa-times" aria-hidden="true"></i>
				</button>
				<button
					type="button"
					class="palette-icon-btn"
					aria-label="Close palette"
					title="Close (Esc)"
					@click.stop="emit('close')"
				>
					<i class="fas fa-times" aria-hidden="true"></i>
				</button>
			</div>

			<div v-if="submode === 'play'" class="palette-play-bar">
				<span class="palette-pool-summary">
					Pool: <strong>{{ activePoolSide === 'opposition' ? 'Opposition' : 'Player' }}</strong>
					<span class="palette-pool-counts"> ({{ playerPoolCount }} / {{ oppositionPoolCount }})</span>
				</span>
				<button
					type="button"
					class="palette-chip-btn"
					@click.stop="emit('togglePoolSide')"
					title="Switch target pool (Alt+P)"
				>
					Target {{ activePoolSide === 'opposition' ? 'Player' : 'Opposition' }}
				</button>
			</div>

			<ul
				v-if="filteredItems.length"
				id="command-palette-listbox"
				ref="listboxRef"
				role="listbox"
				aria-label="Results"
				class="palette-results"
			>
				<li
					v-for="(item, idx) in filteredItems"
					:key="item.id"
					:id="'palette-option-' + idx"
					role="option"
					:aria-selected="idx === activeIndex"
					class="palette-option"
					:class="{ 'is-active': idx === activeIndex }"
					@mouseenter="activeIndex = idx"
					@click.stop="handleOptionClick(item, $event)"
				>
					<span class="palette-option-icon"><i :class="['fas', item.icon]" aria-hidden="true"></i></span>
					<span class="palette-option-body">
						<span class="palette-option-head">
							<span class="palette-option-title">{{ item.title }}</span>
							<span v-if="item.subtitle" class="palette-option-sub">{{ item.subtitle }}</span>
						</span>
						<span v-if="item.description" class="palette-option-desc">{{ item.description }}</span>
						<span v-if="item.tags.length" class="palette-option-tags">
							<span v-for="tag in item.tags" :key="tag" class="palette-tag">#{{ tag }}</span>
						</span>
					</span>
					<span class="palette-option-meta">
						<span v-if="item.notation" class="palette-badge-die">{{ item.notation }}</span>
						<span v-else-if="item.kind === 'sfx'" class="palette-badge-kind">SFX</span>
						<span v-else-if="item.kind === 'statement'" class="palette-badge-kind">Statement</span>
						<span v-else-if="item.kind === 'character'" class="palette-badge-kind">Sheet</span>
						<span v-else-if="item.kind === 'action'" class="palette-badge-kind">Action</span>
					</span>
				</li>
			</ul>

			<div v-else class="palette-empty" role="status">No matching traits, SFX, characters, or commands.</div>

			<div class="palette-footer">
				<div class="palette-footer-actions" v-if="submode === 'play'">
					<button
						v-if="activeItem && activeItem.dice.length"
						type="button"
						class="palette-action-btn"
						@click.stop="stageItem(activeItem, false, false)"
					>
						<i class="fas fa-plus" aria-hidden="true"></i> Stage {{ activeItem.notation }}
					</button>
					<button
						v-if="activeItem && activeItem.canHinder"
						type="button"
						class="palette-action-btn"
						@click.stop="stageItem(activeItem, false, true)"
					>
						<i class="fas fa-dice" aria-hidden="true"></i> Hinder d4
					</button>
					<button
						v-if="totalPoolCount > 0"
						type="button"
						class="palette-action-btn palette-action-primary"
						@click.stop="
							emit('rollPool');
							emit('close');
						"
					>
						<i class="fas fa-dice" aria-hidden="true"></i> Roll ({{ totalPoolCount }})
					</button>
				</div>
				<div class="palette-hints">
					<span><kbd>↑↓</kbd> Move</span>
					<span><kbd>Enter</kbd> {{ submode === 'play' ? 'Stage & Close' : 'Select' }}</span>
					<span v-if="submode === 'play'"><kbd>Shift+Enter</kbd> Stage</span>
					<span v-if="submode === 'play'"><kbd>Ctrl+Enter</kbd> Roll</span>
				</div>
			</div>
		</div>
	</ModalDialog>
</template>
