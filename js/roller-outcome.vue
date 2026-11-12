<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PoolEvaluation, RollResult, SeparateGroup } from './dice-pool.ts';
import { characterCurioFunctions } from './functions.ts';

const props = defineProps<{
	isContest: boolean;
	playerEval: PoolEvaluation | null;
	oppositionEval: PoolEvaluation | null;
	activeSide: 'player' | 'opposition';
	plotPoints: number;
	isModal: boolean;
	dicePoolOutput: string;
}>();

const emit = defineEmits<{
	(e: 'cycleRole', side: 'player' | 'opposition', dieId: string): void;
	(e: 'applyPreset', side: 'player' | 'opposition', preset: 'total' | 'effect'): void;
	(e: 'activateHitch', side: 'player' | 'opposition', dieId: string): void;
	(e: 'reroll'): void;
	(e: 'expandDialog'): void;
	(e: 'closeDialog'): void;
}>();

const viewTab = ref<'roller' | 'log'>('roller');
const copiedNotice = ref(false);

const orderedEvals = computed<PoolEvaluation[]>(() => {
	const list: PoolEvaluation[] = [];
	if (props.isContest) {
		if (props.playerEval && props.playerEval.results.length > 0) list.push(props.playerEval);
		if (props.oppositionEval && props.oppositionEval.results.length > 0) list.push(props.oppositionEval);
		return list;
	}
	const primary =
		props.activeSide === 'opposition'
			? props.oppositionEval || props.playerEval
			: props.playerEval || props.oppositionEval;
	if (primary && primary.results.length > 0) list.push(primary);
	return list;
});

const contestVerdict = computed(() => {
	if (!props.isContest || !props.playerEval || !props.oppositionEval) return null;
	const pTotal = props.playerEval.isBotch ? 0 : props.playerEval.manualTotal;
	const oTotal = props.oppositionEval.isBotch ? 0 : props.oppositionEval.manualTotal;
	const margin = pTotal - oTotal;
	let badge = '';
	let tone = 'loss';
	if (props.playerEval.isBotch) {
		badge = 'Botch';
		tone = 'botch';
	} else if (props.oppositionEval.isBotch) {
		badge = 'Heroic (+' + pTotal + ')';
		tone = 'heroic';
	} else if (margin >= 5) {
		badge = `Heroic (+${margin})`;
		tone = 'heroic';
	} else if (margin > 0) {
		badge = `Success (+${margin})`;
		tone = 'win';
	} else if (margin === 0) {
		badge = 'Tie — Fails';
		tone = 'loss';
	} else {
		badge = `Failed (${margin})`;
		tone = 'loss';
	}
	return {
		pTotal,
		oTotal,
		pEffect: props.playerEval.manualEffectDie,
		oEffect: props.oppositionEval.manualEffectDie,
		pEffectSize: effectSizeFromLabel(props.playerEval.manualEffectDie),
		oEffectSize: effectSizeFromLabel(props.oppositionEval.manualEffectDie),
		badge,
		tone,
	};
});

function effectSizeFromLabel(label: string): number {
	const parsed = parseInt(String(label || '').replace(/[^\d]/g, ''), 10);
	return [4, 6, 8, 10, 12].includes(parsed) ? parsed : 4;
}

function getDieDisplayValue(value: number) {
	return characterCurioFunctions.renderDieconSVG(value, false, '', null);
}

function getGroupKeptValue(group: SeparateGroup) {
	const kept = group.dice.find((d) => d.manualRole === 'total');
	return kept ? kept.value : 0;
}

function hitchesInEval(ev: PoolEvaluation): RollResult[] {
	return ev.results.filter((r) => r.isHitch);
}

function copyOutput() {
	if (!props.dicePoolOutput) return;
	navigator.clipboard?.writeText(props.dicePoolOutput).then(() => {
		copiedNotice.value = true;
		setTimeout(() => {
			copiedNotice.value = false;
		}, 2000);
	});
}
</script>

<template>
	<div class="outcome-shell" :class="{ 'is-modal': isModal }">
		<div class="roller-results-header">
			<div class="outcome-title-group">
				<h2 v-if="isModal" id="rollDialogTitle" class="outcome-heading">
					{{ isContest ? 'Contest Outcome' : 'Roll Outcome' }}
				</h2>
				<span v-else class="roller-label">
					{{ isContest ? 'Contest Outcome' : 'Results' }}
				</span>
			</div>

			<div class="outcome-header-controls">
				<div class="roller-view-tabs" role="tablist" aria-label="Result view">
					<button
						type="button"
						role="tab"
						:aria-selected="viewTab === 'roller'"
						:class="{ active: viewTab === 'roller' }"
						@click="viewTab = 'roller'"
					>
						Dice
					</button>
					<button
						type="button"
						role="tab"
						:aria-selected="viewTab === 'log'"
						:class="{ active: viewTab === 'log' }"
						@click="viewTab = 'log'"
					>
						Log
					</button>
				</div>

				<button
					v-if="!isModal"
					type="button"
					class="outcome-icon-btn"
					aria-label="Open outcome dialog"
					title="Open dialog"
					@click="emit('expandDialog')"
				>
					<i class="fas fa-window-maximize" aria-hidden="true"></i>
				</button>

				<button
					v-if="isModal"
					type="button"
					class="outcome-close-btn"
					aria-label="Close outcome dialog"
					@click="emit('closeDialog')"
				>
					<i class="fas fa-times" aria-hidden="true"></i>
				</button>
			</div>
		</div>

		<!-- CONTEST BANNER -->
		<div v-if="contestVerdict" class="contest-banner" :class="'tone-' + contestVerdict.tone">
			<div class="contest-side contest-player">
				<span class="contest-side-label">Player</span>
				<span class="contest-side-score">{{ contestVerdict.pTotal }}</span>
				<span class="contest-side-effect" aria-label="Player effect">
					<span
						class="contest-effect-glyph"
						aria-hidden="true"
						v-html="getDieDisplayValue(contestVerdict.pEffectSize)"
					></span>
					<span>{{ contestVerdict.pEffect }}</span>
				</span>
			</div>
			<div class="contest-verdict-badge">{{ contestVerdict.badge }}</div>
			<div class="contest-side contest-opposition">
				<span class="contest-side-label">Opposition</span>
				<span class="contest-side-score">{{ contestVerdict.oTotal }}</span>
				<span class="contest-side-effect" aria-label="Opposition effect">
					<span
						class="contest-effect-glyph"
						aria-hidden="true"
						v-html="getDieDisplayValue(contestVerdict.oEffectSize)"
					></span>
					<span>{{ contestVerdict.oEffect }}</span>
				</span>
			</div>
		</div>

		<!-- INTERACTIVE DICE BREAKDOWN -->
		<div v-show="viewTab === 'roller'" class="roller-interactive-view">
			<section v-for="ev in orderedEvals" :key="ev.side" class="outcome-pool-section" :class="'side-' + ev.side">
				<div class="outcome-pool-bar" v-if="isContest">
					<span class="outcome-pool-name">{{ ev.label }}</span>
					<span class="outcome-pool-summary">
						{{ ev.isBotch ? 'Botch' : ev.manualTotal + ' • ' + ev.manualEffectDie }}
					</span>
				</div>

				<div class="roller-botch-banner" v-if="ev.isBotch">
					<i class="fas fa-triangle-exclamation" aria-hidden="true"></i>
					<strong>BOTCH</strong>
				</div>

				<!-- SEPARATE MODE -->
				<template v-if="!ev.combineSeparate && ev.separateGroups.length > 0">
					<div class="roller-group-section" v-if="ev.actionResults.length > 0">
						<div class="roller-group-header">
							<span>Action Pool</span>
							<span class="group-sub">Keep {{ Math.min(ev.keep, ev.actionResults.length) }}</span>
						</div>
						<div class="roller-dice-grid">
							<button
								v-for="die in ev.actionResults"
								:key="die.id"
								type="button"
								class="roller-die-card"
								:class="{
									'is-hitch': die.isHitch,
									'role-total': die.manualRole === 'total',
									'role-effect': die.manualRole === 'effect',
								}"
								:disabled="die.isHitch"
								@click="emit('cycleRole', ev.side, die.id)"
								:aria-label="
									'd' + die.size + ' rolled ' + die.value + (die.isHitch ? ', hitch' : ', role ' + die.manualRole)
								"
							>
								<div class="card-top">
									<span aria-hidden="true" v-html="getDieDisplayValue(die.size)"></span>
									<span class="card-size">d{{ die.size }}</span>
								</div>
								<div class="card-value" :class="{ 'hitch-value': die.isHitch }">{{ die.value }}</div>
								<div class="card-badge" v-if="die.isHitch">Hitch</div>
								<div class="card-badge badge-total" v-else-if="die.manualRole === 'total'">Total</div>
								<div class="card-badge badge-effect" v-else-if="die.manualRole === 'effect'">Effect</div>
								<div class="card-badge badge-unused" v-else>Unused</div>
							</button>
						</div>
					</div>

					<div class="roller-resources-section">
						<div class="roller-group-header">
							<span>Separate</span>
							<span class="group-sub">No Hitches • Keep Highest</span>
						</div>
						<div v-for="group in ev.separateGroups" :key="group.name" class="roller-resource-group-card">
							<div class="resource-group-title">
								<span class="res-name">{{ group.name }}</span>
								<span class="resource-group-tag">+{{ getGroupKeptValue(group) }}</span>
							</div>
							<div class="roller-dice-grid">
								<button
									v-for="die in group.dice"
									:key="die.id"
									type="button"
									class="roller-die-card die-resource-card"
									:class="{ 'role-total': die.manualRole === 'total' }"
									@click="emit('cycleRole', ev.side, die.id)"
									:aria-label="'Separate d' + die.size + ' rolled ' + die.value"
								>
									<div class="card-top">
										<span aria-hidden="true" v-html="getDieDisplayValue(die.size)"></span>
										<span class="card-size">d{{ die.size }}</span>
									</div>
									<div class="card-value">{{ die.value }}</div>
									<div class="card-badge badge-res-kept" v-if="die.manualRole === 'total'">Kept +{{ die.value }}</div>
									<div class="card-badge badge-unused" v-else>Unused</div>
								</button>
							</div>
						</div>
					</div>
				</template>

				<!-- STANDARD / COMBINED MODE -->
				<div class="roller-dice-grid" v-else>
					<button
						v-for="die in ev.results"
						:key="die.id"
						type="button"
						class="roller-die-card"
						:class="{
							'is-hitch': die.isHitch,
							'die-resource-card': die.hitches === 0,
							'role-total': die.manualRole === 'total',
							'role-effect': die.manualRole === 'effect',
						}"
						:disabled="die.isHitch"
						@click="emit('cycleRole', ev.side, die.id)"
						:aria-label="
							'd' + die.size + ' rolled ' + die.value + (die.isHitch ? ', hitch' : ', role ' + die.manualRole)
						"
					>
						<div class="card-top">
							<span aria-hidden="true" v-html="getDieDisplayValue(die.size)"></span>
							<span class="card-size">d{{ die.size }}</span>
						</div>
						<div class="card-value" :class="{ 'hitch-value': die.isHitch }">{{ die.value }}</div>
						<div class="card-badge" v-if="die.isHitch">Hitch</div>
						<div class="card-badge badge-total" v-else-if="die.manualRole === 'total'">Total</div>
						<div class="card-badge badge-effect" v-else-if="die.manualRole === 'effect'">Effect</div>
						<div class="card-badge badge-unused" v-else>Unused</div>
					</button>
				</div>

				<!-- INTERACTIVE HITCH TRIGGERS -->
				<div class="roller-hitch-actions" v-if="hitchesInEval(ev).length > 0">
					<div class="roller-hitch-indicator">
						<i class="fas fa-bolt" aria-hidden="true"></i>
						<strong>{{ ev.totalHitches }}</strong>
						<span>Hitch{{ ev.totalHitches > 1 ? 'es' : '' }}</span>
					</div>
					<div class="hitch-btn-row">
						<button
							v-for="hDie in hitchesInEval(ev)"
							:key="'hitch-' + hDie.id"
							type="button"
							class="hitch-act-btn"
							:class="ev.side === 'player' ? 'hitch-act-player' : 'hitch-act-opp'"
							:disabled="Boolean(hDie.hitchActivated) || (ev.side === 'opposition' && plotPoints < 1)"
							@click="emit('activateHitch', ev.side, hDie.id)"
						>
							<template v-if="ev.side === 'player'">
								{{ hDie.hitchActivated ? '✓ +1 PP' : '⚡ d' + hDie.size + ': +1 PP' }}
							</template>
							<template v-else>
								{{ hDie.hitchActivated ? '✓ Asset d6' : '⚡ d' + hDie.size + ': -1 PP' }}
							</template>
						</button>
					</div>
				</div>

				<!-- CALC SUMMARY -->
				<div class="roller-calc-box custom-calc" v-if="!ev.isBotch">
					<template v-if="!ev.combineSeparate && ev.separateGroups.length > 0">
						<div class="calc-row">
							<span class="calc-label">Action</span>
							<span class="calc-val">{{ ev.manualActionTotal }}</span>
						</div>
						<div class="calc-row">
							<span class="calc-label">Separate</span>
							<span class="calc-val calc-val-separate">+{{ ev.manualSeparateBonus }}</span>
						</div>
						<div class="calc-row">
							<span class="calc-label">Total</span>
							<span class="calc-val">{{ ev.manualTotal }}</span>
						</div>
						<div class="calc-row">
							<span class="calc-label">Effect</span>
							<span class="calc-val">{{ ev.manualEffectDie }}</span>
						</div>
					</template>
					<template v-else>
						<div class="calc-row">
							<span class="calc-label">Total</span>
							<span class="calc-val">{{ ev.manualTotal }}</span>
						</div>
						<div class="calc-row">
							<span class="calc-label">Effect</span>
							<span class="calc-val">{{ ev.manualEffectDie }}</span>
						</div>
					</template>
				</div>

				<!-- PRESETS -->
				<div class="roller-presets" v-if="!ev.isBotch">
					<button
						type="button"
						class="preset-card"
						v-if="ev.bestTotalInfo && !ev.bestTotalInfo.isBotch"
						@click="emit('applyPreset', ev.side, 'total')"
					>
						<span class="preset-title"><i class="fas fa-award" aria-hidden="true"></i> Best Total</span>
						<span class="preset-content">
							<strong>{{ ev.bestTotalInfo.total }}</strong>
							<span>• {{ ev.bestTotalInfo.effect }}</span>
						</span>
					</button>

					<button
						type="button"
						class="preset-card"
						v-if="ev.bestEffectInfo && !ev.bestEffectInfo.isBotch"
						@click="emit('applyPreset', ev.side, 'effect')"
					>
						<span class="preset-title"><i class="fas fa-bolt" aria-hidden="true"></i> Best Effect</span>
						<span class="preset-content">
							<strong>{{ ev.bestEffectInfo.effect }}</strong>
							<span>• {{ ev.bestEffectInfo.total }}</span>
						</span>
					</button>
				</div>
			</section>
		</div>

		<!-- PLAIN TEXT LOG -->
		<div v-show="viewTab === 'log'" class="roller-log-view">
			<pre class="roller-raw-log">{{ dicePoolOutput }}</pre>
			<button type="button" class="roller-copy-btn" @click="copyOutput">
				<i class="fas fa-copy" aria-hidden="true"></i> {{ copiedNotice ? 'Copied' : 'Copy Log' }}
			</button>
		</div>

		<div v-if="isModal" class="outcome-modal-footer">
			<button type="button" class="action-btn outcome-reroll-btn" @click="emit('reroll')">
				<i class="fas fa-rotate-right" aria-hidden="true"></i> Reroll
			</button>
			<button type="button" class="action-btn outcome-done-btn" @click="emit('closeDialog')">Done</button>
		</div>
	</div>
</template>
