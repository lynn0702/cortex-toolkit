import { computed, inject, type ComputedRef, type InjectionKey } from 'vue';
import { DIE_LADDER, getIdentityText, setRatingDice, type Curiosity, type TraitSet } from './model.ts';

function fallbackUuid(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export interface FoundCuriosity {
	node: Curiosity;
	hostRoot: Curiosity | null;
}

export interface GraphLinkEdge {
	id: string;
	name: string;
	via: 'trait' | 'set' | 'wiki' | 'bundle';
}

export interface SpawnCuriosityOptions {
	name: string;
	die?: number | null;
	dice?: number[];
	onCreated?: (newId: string, node: Curiosity) => void;
	navigate?: boolean;
}

export interface CuriosityGraphContext {
	activeNode: ComputedRef<Curiosity | null>;
	activeHostRoot: ComputedRef<Curiosity | null>;
	resolveCuriosity: (refOrName: string | null | undefined) => Curiosity | null;
	linkableCuriosities: ComputedRef<Curiosity[]>;
	exploreCuriosity: (targetIdOrName: string) => boolean;
	spawnCuriosity: (opts: SpawnCuriosityOptions) => string | null;
	popOutCuriosity: (curiosityId: string) => boolean;
	pullInCuriosity: (curiosityId: string) => boolean;
}

export const CURIOSITY_GRAPH_KEY: InjectionKey<CuriosityGraphContext> = Symbol('curiosityGraph');

export function findCuriosityEverywhere(
	idOrName: string | null | undefined,
	topCuriosities: Curiosity[] = [],
	preview?: Curiosity | null,
	allowNameMatch = false,
): FoundCuriosity | null {
	const raw = String(idOrName || '').trim();
	if (!raw) return null;

	const roots: Array<{ root: Curiosity; isPreview: boolean }> = [];
	if (preview && typeof preview === 'object') {
		roots.push({ root: preview, isPreview: true });
	}
	if (Array.isArray(topCuriosities)) {
		for (const c of topCuriosities) {
			if (c && typeof c === 'object') roots.push({ root: c, isPreview: false });
		}
	}

	// 1. Exact ID match first (top-level then embedded maps)
	for (const { root } of roots) {
		if (String(root.id || '') === raw) {
			return { node: root, hostRoot: null };
		}
	}
	for (const { root } of roots) {
		if (root.curiosities && typeof root.curiosities === 'object' && !Array.isArray(root.curiosities)) {
			if (root.curiosities[raw] && typeof root.curiosities[raw] === 'object') {
				return { node: root.curiosities[raw], hostRoot: root };
			}
			for (const child of Object.values(root.curiosities)) {
				if (child && typeof child === 'object' && String(child.id || '') === raw) {
					return { node: child, hostRoot: root };
				}
			}
		}
	}

	// 2. Optional case-insensitive name match (for [[Curiosity Name]] wiki links)
	if (allowNameMatch) {
		const lower = raw.toLowerCase();
		for (const { root } of roots) {
			if (
				!root.isTemplate &&
				String(root.name || '')
					.trim()
					.toLowerCase() === lower
			) {
				return { node: root, hostRoot: null };
			}
			if (root.curiosities && typeof root.curiosities === 'object' && !Array.isArray(root.curiosities)) {
				for (const child of Object.values(root.curiosities)) {
					if (
						child &&
						typeof child === 'object' &&
						String(child.name || '')
							.trim()
							.toLowerCase() === lower
					) {
						return { node: child, hostRoot: root };
					}
				}
			}
		}
	}

	return null;
}

export function collectAllGraphNodes(
	activeNode: Curiosity | null | undefined,
	hostRoot: Curiosity | null | undefined,
	topCuriosities: Curiosity[] = [],
): Curiosity[] {
	const seen = new Set<string>();
	const result: Curiosity[] = [];
	const push = (n: Curiosity | null | undefined) => {
		if (!n || typeof n !== 'object' || n.isTemplate) return;
		const id = String(n.id || '');
		if (id && seen.has(id)) return;
		if (id) seen.add(id);
		result.push(n);
	};

	const bundleRoot = hostRoot || activeNode;
	if (bundleRoot && typeof bundleRoot === 'object') {
		push(bundleRoot);
		if (
			bundleRoot.curiosities &&
			typeof bundleRoot.curiosities === 'object' &&
			!Array.isArray(bundleRoot.curiosities)
		) {
			for (const child of Object.values(bundleRoot.curiosities)) {
				push(child);
			}
		}
	}

	if (Array.isArray(topCuriosities)) {
		for (const root of topCuriosities) {
			push(root);
			if (root?.curiosities && typeof root.curiosities === 'object' && !Array.isArray(root.curiosities)) {
				for (const child of Object.values(root.curiosities)) {
					push(child);
				}
			}
		}
	}

	return result;
}

export function extractWikiLinks(text: unknown): Array<{ target: string; label: string }> {
	if (typeof text !== 'string' || !text.includes('[[')) return [];
	const matches: Array<{ target: string; label: string }> = [];
	const re = /\[\[([^[\]|]+?)(?:\|([^[\]]+?))?\]\]/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(text)) !== null) {
		const target = m[1].trim();
		const label = (m[2] || m[1]).trim();
		if (target) matches.push({ target, label });
	}
	return matches;
}

function collectWikiTextsFromNode(node: Curiosity | null | undefined): string[] {
	const texts: string[] = [];
	if (!node || typeof node !== 'object') return texts;
	if (typeof node.description === 'string' && node.description) texts.push(node.description);
	const notes = getIdentityText(node, 'notes');
	if (notes) texts.push(notes);
	const idDesc = getIdentityText(node, 'description');
	if (idDesc) texts.push(idDesc);

	const walkTraits = (traits: unknown) => {
		if (!Array.isArray(traits)) return;
		for (const tr of traits) {
			if (!tr || typeof tr !== 'object') continue;
			const rec = tr as { description?: unknown; traits?: unknown };
			if (typeof rec.description === 'string' && rec.description) texts.push(rec.description);
			walkTraits(rec.traits);
		}
	};

	if (Array.isArray(node.traitSets)) {
		for (const ts of node.traitSets) {
			if (!ts || typeof ts !== 'object') continue;
			if (typeof ts.description === 'string' && ts.description) texts.push(ts.description);
			walkTraits(ts.traits);
		}
	}
	return texts;
}

export function collectOutgoingLinks(
	node: Curiosity | null | undefined,
	resolveFn: (refOrName: string) => Curiosity | null,
): GraphLinkEdge[] {
	if (!node || typeof node !== 'object') return [];
	const seen = new Set<string>();
	const edges: GraphLinkEdge[] = [];
	const selfId = String(node.id || '');

	const addEdge = (target: Curiosity | null | undefined, via: GraphLinkEdge['via']) => {
		if (!target || typeof target !== 'object') return;
		const tid = String(target.id || '');
		if (!tid || tid === selfId || seen.has(tid)) return;
		seen.add(tid);
		edges.push({
			id: tid,
			name: String(target.name || 'Unnamed').trim() || 'Unnamed',
			via,
		});
	};

	const walkTraits = (traits: unknown) => {
		if (!Array.isArray(traits)) return;
		for (const tr of traits) {
			if (!tr || typeof tr !== 'object') continue;
			const rec = tr as { ref?: unknown; traits?: unknown };
			if (typeof rec.ref === 'string' && rec.ref.trim()) {
				addEdge(resolveFn(rec.ref.trim()), 'trait');
			}
			walkTraits(rec.traits);
		}
	};

	if (Array.isArray(node.traitSets)) {
		for (const ts of node.traitSets) {
			if (!ts || typeof ts !== 'object') continue;
			if (typeof ts.ref === 'string' && ts.ref.trim()) {
				addEdge(resolveFn(ts.ref.trim()), 'set');
			}
			walkTraits(ts.traits);
		}
	}

	for (const txt of collectWikiTextsFromNode(node)) {
		for (const wl of extractWikiLinks(txt)) {
			addEdge(resolveFn(wl.target), 'wiki');
		}
	}

	// If this node is itself a bundle root with peer curiosities not yet linked by ref, expose them as bundle peers
	if (node.curiosities && typeof node.curiosities === 'object' && !Array.isArray(node.curiosities)) {
		for (const child of Object.values(node.curiosities)) {
			addEdge(child, 'bundle');
		}
	}

	return edges;
}

export function collectIncomingBacklinks(
	targetNode: Curiosity | null | undefined,
	allNodes: Curiosity[],
	resolveFn: (refOrName: string) => Curiosity | null,
): GraphLinkEdge[] {
	if (!targetNode || !targetNode.id || !Array.isArray(allNodes)) return [];
	const targetId = String(targetNode.id);
	const backlinks: GraphLinkEdge[] = [];
	const seen = new Set<string>();

	for (const candidate of allNodes) {
		if (!candidate || typeof candidate !== 'object') continue;
		const cid = String(candidate.id || '');
		if (!cid || cid === targetId || seen.has(cid)) continue;
		const outgoing = collectOutgoingLinks(candidate, resolveFn);
		const match = outgoing.find((e) => e.id === targetId && e.via !== 'bundle');
		if (match) {
			seen.add(cid);
			backlinks.push({
				id: cid,
				name: String(candidate.name || 'Unnamed').trim() || 'Unnamed',
				via: match.via,
			});
		}
	}

	return backlinks;
}

export function createBlankEmbeddedCuriosity(seed: {
	id?: string;
	name: string;
	die?: number | null;
	dice?: number[];
}): Curiosity {
	const now = new Date().toISOString();
	const id = seed.id || fallbackUuid();
	const cleanName = String(seed.name || '').trim();
	const nameSet: TraitSet = {
		id: 'name',
		name: cleanName || 'Name',
		view: { style: { header: 'default', body: 'name' } },
		traits: [],
	};

	const validDice = Array.isArray(seed.dice)
		? seed.dice.filter((d) => DIE_LADDER.includes(Number(d))).map(Number)
		: typeof seed.die === 'number' && DIE_LADDER.includes(seed.die)
			? [seed.die]
			: [];

	if (validDice.length > 0) {
		setRatingDice(nameSet, validDice);
	}

	return {
		name: cleanName,
		traitSets: [nameSet],
		id,
		dateCreated: now,
		dateModified: now,
		dateTouched: now,
		version: '0.2',
		$schema: '../schema/0.2/curiosity.schema.json',
	};
}

export function popOutFromRoot(
	hostRoot: Curiosity | null | undefined,
	curiosityId: string,
	topCuriosities: Curiosity[],
): Curiosity | null {
	if (!hostRoot || !hostRoot.curiosities || typeof hostRoot.curiosities !== 'object') return null;
	const id = String(curiosityId || '').trim();
	const target = hostRoot.curiosities[id];
	if (!target || typeof target !== 'object') return null;

	delete hostRoot.curiosities[id];
	if (Object.keys(hostRoot.curiosities).length === 0) {
		delete hostRoot.curiosities;
	}
	hostRoot.dateModified = new Date().toISOString();

	if (!topCuriosities.some((c) => c && String(c.id) === id)) {
		target.dateModified = new Date().toISOString();
		topCuriosities.push(target);
	}
	return target;
}

export function pullInToRoot(
	hostRoot: Curiosity | null | undefined,
	curiosityId: string,
	topCuriosities: Curiosity[],
): Curiosity | null {
	if (!hostRoot || !curiosityId || String(hostRoot.id) === String(curiosityId)) return null;
	const id = String(curiosityId).trim();
	const idx = topCuriosities.findIndex((c) => c && String(c.id) === id);
	if (idx === -1) return null;
	const [picked] = topCuriosities.splice(idx, 1);
	if (!hostRoot.curiosities || typeof hostRoot.curiosities !== 'object' || Array.isArray(hostRoot.curiosities)) {
		hostRoot.curiosities = {};
	}
	// Flatten any sub-curiosities carried by the pulled-in root into the host's peer map
	if (picked.curiosities && typeof picked.curiosities === 'object' && !Array.isArray(picked.curiosities)) {
		for (const [subId, subNode] of Object.entries(picked.curiosities)) {
			if (subNode && typeof subNode === 'object' && !hostRoot.curiosities[subId]) {
				hostRoot.curiosities[subId] = subNode;
			}
		}
		delete picked.curiosities;
	}
	picked.dateModified = new Date().toISOString();
	hostRoot.curiosities[id] = picked;
	hostRoot.dateModified = new Date().toISOString();
	return picked;
}

export function useCuriosityGraph(
	localCharacterGetter?: () => Curiosity | null | undefined,
	onLocalMutate?: (ch: Curiosity) => void,
): CuriosityGraphContext {
	const injected = inject(CURIOSITY_GRAPH_KEY, null);
	if (injected) return injected;

	const activeNode = computed<Curiosity | null>(() => (localCharacterGetter ? (localCharacterGetter() ?? null) : null));
	const activeHostRoot = computed<Curiosity | null>(() => null);

	const resolveCuriosity = (refOrName: string | null | undefined): Curiosity | null => {
		const root = activeNode.value;
		if (!root) return null;
		return findCuriosityEverywhere(refOrName, [root], null, true)?.node || null;
	};

	const linkableCuriosities = computed<Curiosity[]>(() => {
		const root = activeNode.value;
		if (!root) return [];
		const all = collectAllGraphNodes(root, null, [root]);
		return all.filter((c) => c && String(c.id) !== String(root.id));
	});

	return {
		activeNode,
		activeHostRoot,
		resolveCuriosity,
		linkableCuriosities,
		exploreCuriosity: () => false,
		spawnCuriosity: (opts: SpawnCuriosityOptions) => {
			const root = activeNode.value;
			if (!root) return null;
			const created = createBlankEmbeddedCuriosity({
				name: opts.name,
				die: opts.die,
				dice: opts.dice,
			});
			if (!root.curiosities || typeof root.curiosities !== 'object' || Array.isArray(root.curiosities)) {
				root.curiosities = {};
			}
			root.curiosities[created.id] = created;
			opts.onCreated?.(created.id, created);
			onLocalMutate?.(root);
			return created.id;
		},
		popOutCuriosity: () => false,
		pullInCuriosity: () => false,
	};
}
