import type {
	DiceItem,
	PoolEvaluation,
	PoolResultSummary,
	RollLogPoolSummary,
	RollLogSideSummary,
	RollResult,
	SeparateGroup,
	WordBankItem,
} from './dice-pool.ts';

export interface ContestSummary {
	playerLabel: string;
	oppLabel: string;
	playerTotal: number;
	playerEffect: string;
	oppTotal: number;
	oppEffect: string;
}

// Staged item resolution helpers (sparse data, base default 1)
export function itemHitches(d: { hitches?: unknown } | null | undefined): number {
	return d && typeof d.hitches === 'number' && Number.isFinite(d.hitches) && d.hitches >= 0 ? Math.floor(d.hitches) : 1;
}

export function isExempt(d: { hitches?: unknown } | null | undefined): boolean {
	return itemHitches(d) === 0;
}

export function itemKeepsExtra(d: { keepsExtra?: unknown; isScale?: unknown } | null | undefined): number {
	if (d && typeof d.keepsExtra === 'number' && Number.isFinite(d.keepsExtra) && d.keepsExtra > 0) {
		return Math.floor(d.keepsExtra);
	}
	if (d && d.isScale) return 1;
	return 0;
}

export function computePoolKeepStats(
	items: DiceItem[],
	words: WordBankItem[],
	combineSep: boolean,
	ppKeep: number,
	offset: number,
) {
	const scaleWords = words.filter((w) => w.kind === 'scale').length;
	const keepsExtraTotal = items.reduce((sum, d) => sum + itemKeepsExtra(d), 0);
	const actionKeepsExtra = items.filter((d) => !isExempt(d)).reduce((sum, d) => sum + itemKeepsExtra(d), 0);
	const separateDiceList = items.filter((d) => isExempt(d));
	const sources = new Set<string>();
	for (const d of separateDiceList) {
		const src = String(d.source || 'Separate')
			.trim()
			.toLowerCase();
		if (src) sources.add(src);
	}
	const sepBonus = sources.size;
	const base = 2 + scaleWords + keepsExtraTotal + ppKeep + (combineSep ? sepBonus : 0);
	const effectiveKeep = Math.min(12, Math.max(1, base + offset));
	return {
		scaleWords,
		keepsExtraTotal,
		actionKeepsExtra,
		sepBonus,
		base,
		effectiveKeep,
	};
}

export function buildRawResults(items: DiceItem[], makeId: () => string): RollResult[] {
	const actionItems = items.filter((item) => !isExempt(item));
	const thresholdMax = actionItems.reduce((top, item) => Math.max(top, itemHitches(item)), 1);

	return items.map((item) => {
		const val = Math.floor(Math.random() * item.size) + 1;
		const h = itemHitches(item);
		const threshold = h === 0 ? 0 : thresholdMax;
		const isHitch = threshold > 0 && val <= threshold;
		return {
			id: makeId(),
			size: item.size,
			value: val,
			source: item.source || '',
			isScale: Boolean(item.isScale),
			hitches: h,
			isHitch,
			hitchActivated: false,
			manualRole: 'none',
		};
	});
}

export function evaluatePoolResults(
	poolId: string,
	label: string,
	side: 'player' | 'opposition',
	results: RollResult[],
	items: DiceItem[],
	words: WordBankItem[],
	combineSep: boolean,
	ppKeep: number,
	offset: number,
	preserveManualRoles = false,
): PoolEvaluation {
	const stats = computePoolKeepStats(items, words, combineSep, ppKeep, offset);
	const keepCount = stats.effectiveKeep;
	const actionResults = results.filter((r) => r.hitches > 0);
	const separateResults = results.filter((r) => r.hitches === 0);
	const hasSeparate = separateResults.length > 0;

	const separateGroups: SeparateGroup[] = [];
	let bestTotal: PoolResultSummary | null = null;
	let bestEffect: PoolResultSummary | null = null;
	let log = '';
	const hitchesTotal = results.filter((r) => r.isHitch).length;
	const botch = results.length > 0 && results.every((r) => r.isHitch);

	if (!hasSeparate || combineSep) {
		const eligible = results.filter((r) => !r.isHitch);
		if (eligible.length === 0) {
			bestTotal = { total: 0, formula: '', effect: 'd4', isBotch: true };
			bestEffect = { total: 0, formula: '', effect: 'd4', isBotch: true };
			log = `${label} (Keep ${keepCount}): Botch`;
		} else {
			const sortedForTotal = eligible.toSorted((a, b) => b.value - a.value);
			const totalDice = sortedForTotal.slice(0, keepCount);
			const remainingForEffect = sortedForTotal.slice(keepCount).sort((a, b) => b.size - a.size);
			const effectDie = remainingForEffect.length > 0 ? 'd' + remainingForEffect[0].size : 'd4';
			const totalSum = totalDice.reduce((sum, d) => sum + d.value, 0);
			const totalFormula = totalDice.map((d) => d.value).join(' + ');

			bestTotal = { total: totalSum, formula: totalFormula, effect: effectDie, dice: totalDice };

			const sortedForEffect = eligible.toSorted((a, b) => (a.size !== b.size ? b.size - a.size : a.value - b.value));
			const effectBest = sortedForEffect.length > 0 ? 'd' + sortedForEffect[0].size : 'd4';
			const totalDiceForEffect = sortedForEffect
				.slice(1)
				.sort((a, b) => b.value - a.value)
				.slice(0, keepCount);
			const totalSumForEffect = totalDiceForEffect.reduce((sum, d) => sum + d.value, 0);
			const formulaForEffect = totalDiceForEffect.map((d) => d.value).join(' + ');

			bestEffect = { total: totalSumForEffect, formula: formulaForEffect, effect: effectBest };

			if (!preserveManualRoles) {
				for (const r of results) {
					if (r.isHitch) r.manualRole = 'none';
					else if (totalDice.some((c) => c.id === r.id)) r.manualRole = 'total';
					else if (remainingForEffect.length > 0 && remainingForEffect[0].id === r.id) r.manualRole = 'effect';
					else r.manualRole = 'none';
				}
			}

			log = `${label} (Keep ${keepCount}): ${results.map((r) => 'd' + r.size + ':' + r.value + (r.isHitch ? '(H)' : '')).join(', ')} | Best ${totalSum} (${effectDie}) | Hitches ${hitchesTotal}`;
		}
	} else {
		const actionKeep = Math.max(1, 2 + stats.actionKeepsExtra + stats.scaleWords + ppKeep + offset);
		const actionEligible = actionResults.filter((r) => !r.isHitch);
		let actionTotal = 0;
		let actionEffect = 'd4';
		let actionTotalDice: RollResult[] = [];
		let actionRemaining: RollResult[] = [];

		if (actionEligible.length > 0) {
			const sortedAction = actionEligible.toSorted((a, b) => b.value - a.value);
			actionTotalDice = sortedAction.slice(0, actionKeep);
			actionRemaining = sortedAction.slice(actionKeep).sort((a, b) => b.size - a.size);
			actionEffect = actionRemaining.length > 0 ? 'd' + actionRemaining[0].size : 'd4';
			actionTotal = actionTotalDice.reduce((sum, d) => sum + d.value, 0);
		}

		const groupMap = Object.groupBy(separateResults, (r) => (r.source || 'Separate').trim() || 'Separate');

		let totalSeparateBonus = 0;
		for (const [name, dice] of Object.entries(groupMap)) {
			if (!dice || dice.length === 0) continue;
			const sortedSep = dice.toSorted((a, b) => b.value - a.value);
			const keptDie = sortedSep[0];
			totalSeparateBonus += keptDie.value;
			if (!preserveManualRoles) {
				for (const d of dice) {
					d.manualRole = d.id === keptDie.id ? 'total' : 'none';
				}
			}
			separateGroups.push({ name, dice, keptDie, bonus: keptDie.value });
		}

		if (!preserveManualRoles) {
			for (const r of actionResults) {
				if (r.isHitch) r.manualRole = 'none';
				else if (actionTotalDice.some((c) => c.id === r.id)) r.manualRole = 'total';
				else if (actionRemaining.length > 0 && actionRemaining[0].id === r.id) r.manualRole = 'effect';
				else r.manualRole = 'none';
			}
		}

		const grandTotal = actionTotal + totalSeparateBonus;
		let actionEffectBestDie = 'd4';
		let actionEffectTotal = 0;
		if (actionEligible.length > 0) {
			const sortedActionForEffect = actionEligible.toSorted((a, b) =>
				a.size !== b.size ? b.size - a.size : a.value - b.value,
			);
			actionEffectBestDie = 'd' + sortedActionForEffect[0].size;
			const actionEffectTotalDice = sortedActionForEffect
				.slice(1)
				.sort((a, b) => b.value - a.value)
				.slice(0, actionKeep);
			actionEffectTotal = actionEffectTotalDice.reduce((sum, d) => sum + d.value, 0);
		}

		bestTotal = {
			total: grandTotal,
			actionTotal,
			separateBonus: totalSeparateBonus,
			formula: `${actionTotal} + ${totalSeparateBonus}`,
			effect: actionEffect,
		};
		bestEffect = {
			total: actionEffectTotal + totalSeparateBonus,
			actionTotal: actionEffectTotal,
			separateBonus: totalSeparateBonus,
			formula: `${actionEffectTotal} + ${totalSeparateBonus}`,
			effect: actionEffectBestDie,
		};
		log = `${label} (Keep ${actionKeep} + Separate): Grand ${grandTotal} (${actionEffect}) | Hitches ${hitchesTotal}`;
	}

	const mAction = results.filter((r) => r.hitches > 0 && r.manualRole === 'total').reduce((s, r) => s + r.value, 0);
	const mSep = results.filter((r) => r.hitches === 0 && r.manualRole === 'total').reduce((s, r) => s + r.value, 0);
	const mTotal = results.filter((r) => r.manualRole === 'total').reduce((s, r) => s + r.value, 0);
	const mEffects = results.filter((r) => r.manualRole === 'effect').sort((a, b) => b.size - a.size);
	const mEffectDie = mEffects.length > 0 ? 'd' + mEffects[0].size : 'd4';

	return {
		poolId,
		side,
		label,
		keep: keepCount,
		combineSeparate: combineSep,
		results,
		actionResults,
		separateGroups,
		bestTotalInfo: bestTotal,
		bestEffectInfo: bestEffect,
		manualTotal: mTotal,
		manualActionTotal: mAction,
		manualSeparateBonus: mSep,
		manualEffectDie: mEffectDie,
		totalHitches: hitchesTotal,
		isBotch: botch,
		log,
	};
}

export function buildContestSummary(orderedEvaluations: PoolEvaluation[], isContest: boolean): ContestSummary | null {
	if (!isContest || orderedEvaluations.length < 2) return null;
	const pEval = orderedEvaluations[0];
	const challengers = orderedEvaluations.slice(1);
	const oEval = challengers.reduce((best, cur) => {
		const curScore = cur.isBotch ? 0 : cur.manualTotal;
		const bestScore = best.isBotch ? 0 : best.manualTotal;
		return curScore > bestScore ? cur : best;
	}, challengers[0]);
	return {
		playerLabel: pEval.label.replace(/\s+Pool$/i, '') || 'Player',
		oppLabel: oEval.label.replace(/\s+Pool$/i, '') || 'Opp',
		playerTotal: pEval.isBotch ? 0 : pEval.manualTotal,
		playerEffect: pEval.manualEffectDie,
		oppTotal: oEval.isBotch ? 0 : oEval.manualTotal,
		oppEffect: oEval.manualEffectDie,
	};
}

export function buildSideLogSummary(ev: PoolEvaluation | null | undefined): RollLogSideSummary | undefined {
	if (!ev) return undefined;
	return {
		total: ev.isBotch ? 0 : ev.manualTotal,
		effectDie: ev.manualEffectDie,
		hitches: ev.totalHitches,
		isBotch: ev.isBotch,
		diceSummary: ev.results.map((r) => `d${r.size}:${r.value}${r.isHitch ? '!' : ''}`).join(' '),
		log: ev.log,
	};
}

export function buildPoolsLogSummary(orderedEvaluations: PoolEvaluation[]): RollLogPoolSummary[] {
	return orderedEvaluations
		.map((ev) => {
			const base = buildSideLogSummary(ev);
			if (!base) return null;
			return {
				poolId: ev.poolId || ev.side,
				label: ev.label.replace(/\s+Pool$/i, '') || ev.label,
				...base,
			};
		})
		.filter((x): x is RollLogPoolSummary => Boolean(x));
}

export function formatLogTime(ts: number): string {
	try {
		return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	} catch {
		return '';
	}
}
