<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue';
import type { GraphLinkEdge } from './curiosity-graph.ts';
import type { Character } from './model.ts';

export interface WebTrailCrumb {
	id: string;
	name: string;
}

const props = defineProps<{
	activeNode: Character | null;
	hostRoot: Character | null;
	trail: WebTrailCrumb[];
	incomingBacklinks: GraphLinkEdge[];
	outgoingLinks: GraphLinkEdge[];
	pullableCuriosities: Character[];
	submode?: string | null;
}>();

const emit = defineEmits<{
	(e: 'navigate', targetId: string): void;
	(e: 'popOut', curiosityId: string): void;
	(e: 'pullIn', curiosityId: string): void;
	(e: 'spawnPeer', payload: { name: string; navigate: boolean }): void;
}>();

const peerInputId = useId();
const peerInputRef = ref<HTMLInputElement | null>(null);
const addOpen = ref(false);
const peerDraftName = ref('');
const trailExpanded = ref(false);

watch(
	() => props.activeNode?.id,
	() => {
		trailExpanded.value = false;
		addOpen.value = false;
	},
);

const effectiveTrail = computed<Array<WebTrailCrumb & { isCurrent: boolean }>>(() => {
	const list: WebTrailCrumb[] = [];
	const seen = new Set<string>();
	const push = (id: unknown, name: unknown) => {
		const cleanId = String(id || '').trim();
		if (!cleanId || seen.has(cleanId)) return;
		seen.add(cleanId);
		list.push({
			id: cleanId,
			name: String(name || 'Unnamed').trim() || 'Unnamed',
		});
	};

	const hostRoot = props.hostRoot;
	if (hostRoot && hostRoot.id && (!props.trail.length || props.trail[0]?.id !== hostRoot.id)) {
		if (!props.trail.some((t) => t.id === hostRoot.id)) {
			push(hostRoot.id, hostRoot.name);
		}
	}
	for (const step of props.trail) {
		if (step && step.id) push(step.id, step.name);
	}
	if (props.activeNode?.id) {
		push(props.activeNode.id, props.activeNode.name);
	}

	return list.map((item, idx) => ({
		...item,
		isCurrent: idx === list.length - 1,
	}));
});

interface RenderedTrailStep {
	kind: 'crumb' | 'ellipsis';
	id: string;
	name: string;
	isCurrent: boolean;
}

const renderedTrail = computed<RenderedTrailStep[]>(() => {
	const items = effectiveTrail.value;
	if (items.length <= 4 || trailExpanded.value) {
		return items.map((i) => ({ kind: 'crumb', ...i }));
	}
	const first = items[0];
	const tail = items.slice(-2);
	return [
		{ kind: 'crumb', ...first },
		{ kind: 'ellipsis', id: '__ellipsis__', name: '…', isCurrent: false },
		...tail.map((i) => ({ kind: 'crumb' as const, ...i })),
	];
});

const visibleOutgoing = computed(() => {
	const backIds = new Set(props.incomingBacklinks.map((b) => b.id));
	return props.outgoingLinks.filter((o) => !backIds.has(o.id) || o.via !== 'bundle');
});

function toggleAddDrawer() {
	addOpen.value = !addOpen.value;
	if (addOpen.value) {
		nextTick(() => {
			peerInputRef.value?.focus();
		});
	}
}

function submitNewPeer() {
	const name = peerDraftName.value.trim() || 'New Curiosity';
	emit('spawnPeer', { name, navigate: true });
	peerDraftName.value = '';
	addOpen.value = false;
}

function onPeerKeydown(event: KeyboardEvent) {
	if (event.key === 'Enter') {
		event.preventDefault();
		if (event.isComposing || event.keyCode === 229) return;
		submitNewPeer();
	} else if (event.key === 'Escape') {
		event.preventDefault();
		addOpen.value = false;
	}
}

function handlePullIn(id: string) {
	emit('pullIn', id);
	addOpen.value = false;
}
</script>

<template>
	<div class="curiosity-web-bar">
		<div class="curiosity-web-main">
			<!-- SEMANTIC BREADCRUMB TRAIL -->
			<nav v-if="effectiveTrail.length > 1" class="curiosity-breadcrumb" aria-label="Curiosity trail">
				<ol class="curiosity-trail-list">
					<li v-for="step in renderedTrail" :key="step.id" class="curiosity-trail-item">
						<button
							v-if="step.kind === 'ellipsis'"
							type="button"
							class="curiosity-crumb-more"
							aria-label="Show full trail"
							@click="trailExpanded = true"
						>
							…
						</button>
						<a
							v-else
							:href="'#/character/' + step.id + '/' + (submode || 'edit')"
							class="curiosity-crumb-link"
							:aria-current="step.isCurrent ? 'page' : undefined"
							@click.prevent="emit('navigate', step.id)"
						>
							{{ step.name }}
						</a>
					</li>
				</ol>
			</nav>

			<!-- NON-LINEAR WEB CONNECTIONS (BACKLINKS + OUTGOING / BUNDLE PEERS) -->
			<div
				v-if="incomingBacklinks.length > 0 || visibleOutgoing.length > 0"
				class="curiosity-connections"
				role="group"
				aria-label="Connected curiosities"
			>
				<button
					v-for="back in incomingBacklinks"
					:key="'back-' + back.id"
					type="button"
					class="curiosity-edge-chip is-backlink"
					:title="'Backlink from ' + back.name"
					@click="emit('navigate', back.id)"
				>
					<i class="fas fa-arrow-left" aria-hidden="true"></i>
					<span>{{ back.name }}</span>
				</button>

				<button
					v-for="out in visibleOutgoing"
					:key="'out-' + out.id"
					type="button"
					class="curiosity-edge-chip is-outgoing"
					:title="'Explore ' + out.name"
					@click="emit('navigate', out.id)"
				>
					<i class="fas fa-lightbulb" aria-hidden="true"></i>
					<span>{{ out.name }}</span>
				</button>
			</div>

			<!-- BUNDLE ACTIONS: POP OUT + ADD / PULL IN -->
			<div class="curiosity-web-actions">
				<button
					v-if="hostRoot && activeNode?.id"
					type="button"
					class="curiosity-web-btn"
					title="Promote to Roster"
					@click="emit('popOut', activeNode.id)"
				>
					<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
					<span>Pop Out</span>
				</button>

				<button
					type="button"
					class="curiosity-web-btn"
					:class="{ 'is-active': addOpen }"
					:aria-expanded="addOpen ? 'true' : 'false'"
					@click="toggleAddDrawer"
				>
					<i class="fas fa-lightbulb" aria-hidden="true"></i>
					<span>+ Curiosity</span>
				</button>
			</div>
		</div>

		<!-- INLINE + CURIOSITY / PULL IN DRAWER -->
		<div v-if="addOpen" class="curiosity-web-drawer">
			<form class="curiosity-web-add-form" @submit.prevent="submitNewPeer">
				<label :for="peerInputId" class="sr-only">Curiosity name</label>
				<input
					:id="peerInputId"
					ref="peerInputRef"
					v-model="peerDraftName"
					type="text"
					class="curiosity-set-input"
					placeholder="Curiosity name"
					@keydown="onPeerKeydown"
				/>
				<button type="submit" class="btn-curiosity-explore">
					<i class="fas fa-plus" aria-hidden="true"></i>
					<span>Create</span>
				</button>
			</form>

			<div v-if="pullableCuriosities.length > 0" class="curiosity-link-existing">
				<span class="curiosity-link-hint">Pull In:</span>
				<button
					v-for="c in pullableCuriosities"
					:key="'pull-' + c.id"
					type="button"
					class="curiosity-existing-chip"
					@click="handlePullIn(c.id)"
				>
					<i class="fas fa-lightbulb" aria-hidden="true"></i>
					<span>{{ c.name || 'Unnamed' }}</span>
				</button>
			</div>
		</div>
	</div>
</template>
