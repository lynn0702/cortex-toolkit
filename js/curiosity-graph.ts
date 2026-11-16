import { computed, inject, type ComputedRef, type InjectionKey } from 'vue';
import { DIE_LADDER, getIdentityText, setRatingDice } from './model.ts';

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
	node: any;
	hostRoot: any | null;
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
	onCreated?: (newId: string, node: any) => void;
	navigate?: boolean;
}

export interface CuriosityGraphContext {
	activeNode: ComputedRef<any | null>;
	activeHostRoot: ComputedRef<any | null>;
	resolveCuriosity: (refOrName: string | null | undefined) => any | null;
	linkableCuriosities: ComputedRef<any[]>;
	exploreCuriosity: (targetIdOrName: string) => boolean;
	spawnCuriosity: (opts: SpawnCuriosityOptions) => string | null;
	popOutCuriosity: (curiosityId: string) => boolean;
	pullInCuriosity: (curiosityId: string) => boolean;
}

export const CURIOSITY_GRAPH_KEY: InjectionKey<CuriosityGraphContext> = Symbol('curiosityGraph');

export function findCuriosityEverywhere(
	idOrName: string | null | undefined,
	topCuriosities: any[] = [],
	preview?: any,
	allowNameMatch = false,
): FoundCuriosity | null {
	const raw = String(idOrName || '').trim();
	if (!raw) return null;

	const roots: Array<{ root: any; isPreview: boolean }> = [];
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
			for (const child of Object.values(root.curiosities) as any[]) {
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
				for (const child of Object.values(root.curiosities) as any[]) {
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

export function collectAllGraphNodes(activeNode: any, hostRoot: any | null, topCuriosities: any[] = []): any[] {
	const seen = new Set<string>();
	const result: any[] = [];
	const push = (n: any) => {
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

function collectWikiTextsFromNode(node: any): string[] {
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
			if (typeof tr.description === 'string' && tr.description) texts.push(tr.description);
			walkTraits(tr.traits);
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

export function collectOutgoingLinks(node: any, resolveFn: (refOrName: string) => any | null): GraphLinkEdge[] {
	if (!node || typeof node !== 'object') return [];
	const seen = new Set<string>();
	const edges: GraphLinkEdge[] = [];
	const selfId = String(node.id || '');

	const addEdge = (target: any, via: GraphLinkEdge['via']) => {
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
			if (typeof tr.ref === 'string' && tr.ref.trim()) {
				addEdge(resolveFn(tr.ref.trim()), 'trait');
			}
			walkTraits(tr.traits);
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
	targetNode: any,
	allNodes: any[],
	resolveFn: (refOrName: string) => any | null,
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
}): any {
	const now = new Date().toISOString();
	const id = seed.id || fallbackUuid();
	const cleanName = String(seed.name || '').trim();
	const nameSet: Record<string, any> = {
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

export function popOutFromRoot(hostRoot: any, curiosityId: string, topCuriosities: any[]): any | null {
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

export function pullInToRoot(hostRoot: any, curiosityId: string, topCuriosities: any[]): any | null {
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
	localCharacterGetter?: () => any,
	onLocalMutate?: (ch: any) => void,
): CuriosityGraphContext {
	const injected = inject(CURIOSITY_GRAPH_KEY, null);
	if (injected) return injected;

	const activeNode = computed(() => (localCharacterGetter ? localCharacterGetter() : null));
	const activeHostRoot = computed(() => null);

	const resolveCuriosity = (refOrName: string | null | undefined) => {
		const root = activeNode.value;
		if (!root) return null;
		return findCuriosityEverywhere(refOrName, [root], null, true)?.node || null;
	};

	const linkableCuriosities = computed(() => {
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
