import { characterCurioFunctions } from './functions.ts';
import { normalizeZoom } from './frame-geometry.ts';
import { getRating, getView, ratingDice, resolveRating, type Trait, type TraitSet } from './model.ts';

export interface RenderedTraitItem {
	trait: Trait;
	originalIndex: number | null;
	isPlaceholder: boolean;
}

export type BranchSubEntry =
	| {
			kind: 'sub';
			sub: Trait;
			u: number;
			traitIndex?: number | null;
			traitItem?: RenderedTraitItem | null;
			_lid?: string;
	  }
	| {
			kind: 'flat';
			item: RenderedTraitItem;
			traitIndex?: number | null;
			traitItem?: RenderedTraitItem | null;
			_lid?: string;
	  };

export interface BranchGroup {
	traitItem: RenderedTraitItem | null;
	subs: BranchSubEntry[];
	split?: boolean;
}

export function getImageSetContainerStyle(traitSetArg: TraitSet) {
	const view = getView(traitSetArg);
	const cfg = view?.imageConfig;
	const h = cfg?.height;
	const w = cfg?.width;
	const widthStyle = w && w !== '100%' ? { width: w, marginInline: 'auto' } : {};
	const layout = cfg?.layout || 'overlay';
	const parts = view?.parts;
	const hasParts = Boolean(
		parts && typeof parts === 'object' && !Array.isArray(parts) && Object.keys(parts).length > 0,
	);
	const hasTraitContent = Boolean(traitSetArg?.traits?.length) || Number(view?.reservedSlots) > 0 || hasParts;
	if (h && h !== 'auto') {
		const hVal = typeof h === 'number' ? `${h}px` : h;
		if (layout === 'overlay' && hasTraitContent) {
			return { minHeight: hVal, height: 'auto', ...widthStyle };
		}
		return { height: hVal, ...widthStyle };
	}
	return { minHeight: '8.75rem', height: 'auto', ...widthStyle };
}

export function getImageSetGraphicStyle(traitSetArg: TraitSet) {
	const cfg = getView(traitSetArg)?.imageConfig;
	const rawUrl = cfg?.url || '';
	const url = characterCurioFunctions.safeImageUrl(rawUrl);
	if (!url) return {};
	const rawZoom = normalizeZoom(cfg?.zoom) ?? 1;
	const bgSize = rawZoom !== 1 ? `${Math.round(rawZoom * 100)}%` : 'cover';
	const style: Record<string, string> = {
		backgroundImage: `url("${url}")`,
		backgroundSize: bgSize,
		backgroundRepeat: 'no-repeat',
	};
	const align = cfg?.alignment;
	if (typeof align === 'string' && align.includes('%') && /^[0-9.%\s-]+$/.test(align)) {
		style.backgroundPosition = align.trim();
	}
	return style;
}

export function getBranchRole(trait: Trait) {
	return getView(trait)?.branchRole === 'specialty' ? 'specialty' : 'skill';
}

export function getSetRatingDie(traitSetArg: TraitSet) {
	const dice = ratingDice(getRating(traitSetArg));
	if (dice.length) return dice[0];
	return null;
}

export function getBranchSide(trait: Trait | null | undefined) {
	return trait && getView(trait)?.branchSide === 'left' ? 'left' : 'right';
}

export function branchSubs(subs: BranchSubEntry[], side: string) {
	return (subs || []).filter((e) => {
		const t = e.kind === 'sub' ? e.sub : e.item ? e.item.trait : null;
		const sd = getBranchSide(t);
		return side === 'left' ? sd === 'left' : sd !== 'left';
	});
}

export function getBranchGroups(traitSetArg: TraitSet, items: RenderedTraitItem[]): BranchGroup[] {
	const list = items || [];
	const parents = list.filter((it) => getBranchRole(it.trait) !== 'specialty');
	const flats = list.filter((it) => !it.isPlaceholder && getBranchRole(it.trait) === 'specialty');
	const parentIdx = new Set(
		parents
			.filter((p): p is RenderedTraitItem & { originalIndex: number } => typeof p.originalIndex === 'number')
			.map((p) => p.originalIndex),
	);
	const groups: BranchGroup[] = parents.map((traitItem) => {
		const tIdx = traitItem.originalIndex;
		const nested: BranchSubEntry[] = (traitItem.trait?.traits || [])
			.filter((sub) => resolveRating(sub, [traitItem.trait, traitSetArg])?.type !== 'Pip')
			.map((sub, u) => ({ kind: 'sub' as const, sub, u }));
		const linked: BranchSubEntry[] = flats
			.filter((f) => getView(f.trait)?.linkTo === tIdx)
			.map((f) => ({ kind: 'flat' as const, item: f }));
		return { traitItem, subs: [...nested, ...linked] };
	});
	const orphans: BranchSubEntry[] = flats
		.filter((f) => {
			const lt = getView(f.trait)?.linkTo;
			return !(typeof lt === 'number' && parentIdx.has(lt));
		})
		.map((f) => ({ kind: 'flat' as const, item: f }));
	if (orphans.length) {
		groups.push({ traitItem: null, subs: orphans });
	}
	const split = groups.some((g) => {
		const hasLeftSub = (g.subs || []).some((e) => {
			const t = e.kind === 'sub' ? e.sub : e.item ? e.item.trait : null;
			return t ? getBranchSide(t) === 'left' : false;
		});
		if (hasLeftSub) return true;
		const slots = (g.traitItem?.trait as Record<string, unknown> | undefined)?.slots;
		if (slots && typeof slots === 'object' && !Array.isArray(slots)) {
			return Object.values(slots as Record<string, unknown>).some((sl) => getBranchSide(sl as Trait) === 'left');
		}
		return false;
	});
	groups.forEach((g) => {
		g.split = split;
	});
	return groups;
}

export function hasBranchSplit(traitSetArg: TraitSet, items: RenderedTraitItem[]) {
	if (getView(traitSetArg)?.style?.body !== 'subtrait-columns') return false;
	return getBranchGroups(traitSetArg, items).some((g) => g.split);
}

export function hasBranchFlank(traitSetArg: TraitSet, items: RenderedTraitItem[]) {
	if (getView(traitSetArg)?.style?.body !== 'subtrait-columns') return false;
	if (Number(getView(traitSetArg)?.traitColumns) !== 2) return false;
	return !hasBranchSplit(traitSetArg, items);
}

export function getFlankColumns(traitSetArg: TraitSet, items: RenderedTraitItem[]) {
	const groups = getBranchGroups(traitSetArg, items);
	const parents = groups.filter((g) => g.traitItem);
	const mid = Math.ceil(parents.length / 2);
	const center: BranchSubEntry[] = [];
	groups.forEach((g) => {
		const tIdx = g.traitItem ? g.traitItem.originalIndex : null;
		(g.subs || []).forEach((e) => {
			center.push({ ...e, traitIndex: tIdx, traitItem: g.traitItem });
		});
	});
	return { left: parents.slice(0, mid), right: parents.slice(mid), center };
}
