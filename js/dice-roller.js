const DiceRoller = {

	props: {
		open:       Boolean,
		pool:       Object,
		history:    Array,
		position:   {
			type: String,
			default: 'left'
		},
	},

	emits: ['close', 'addDie', 'removeDie', 'clearPool', 'togglePosition'],

	data() {
		let savedCombine = localStorage.getItem('cortexCombineResources');
		return {
			keep: 2,
			hitchOn: 1,
			combineResources: savedCombine !== null ? savedCombine === 'true' : false,
			isRolled: false,
			lastRollResults: [], // { id, size, value, source, isScale, isResource, resourceType, isHitch, manualRole: 'total'|'effect'|'none' }
			resourceGroupsResults: [], // [ { name, dice, keptDie, bonus } ]
			cortexPalOutput: '',
			bestTotalInfo: null,
			bestEffectInfo: null,
			copiedNotice: false,
			activeTab: 'roller', // 'roller' | 'log'
		};
	},

	watch: {
		combineResources(newVal) {
			localStorage.setItem('cortexCombineResources', newVal ? 'true' : 'false');
			this.keep = this.defaultKeep;
			if (this.isRolled) {
				this.evaluateRollDisplay();
			}
		},
		defaultKeep: {
			immediate: true,
			handler(newVal, oldVal) {
				if (oldVal === undefined || this.keep === oldVal || newVal > this.keep) {
					this.keep = newVal;
				}
			}
		}
	},

	computed: {

		diceSizes() {
			return [4, 6, 8, 10, 12];
		},

		stagedDice() {
			return this.pool ? this.pool.items : [];
		},

		hasScaleDie() {
			return Boolean(this.stagedDice && this.stagedDice.some(d => d.isScale || (d.source && d.source.toLowerCase() === 'scale')));
		},

		resourceDice() {
			return this.stagedDice.filter(d => Boolean(d.isResource));
		},

		hasResourceDice() {
			return this.resourceDice.length > 0;
		},

		uniqueResourceSources() {
			const set = new Set();
			for (const d of this.resourceDice) {
				const src = (d.resourceType || d.source || 'Resource').trim().toLowerCase();
				if (src) set.add(src);
			}
			return Array.from(set);
		},

		resourceKeepBonus() {
			return this.uniqueResourceSources.length;
		},

		defaultKeep() {
			let k = 2;
			if (this.hasScaleDie) k += 1;
			if (this.combineResources) {
				k += this.resourceKeepBonus;
			}
			return k;
		},

		actionRollResults() {
			return this.lastRollResults.filter(r => !r.isResource);
		},

		resourceRollResults() {
			return this.lastRollResults.filter(r => r.isResource);
		},

		totalHitches() {
			return this.lastRollResults.filter(r => r.isHitch).length;
		},

		isBotch() {
			return this.lastRollResults.length > 0 && this.lastRollResults.every(r => r.isHitch);
		},

		manualTotal() {
			return this.lastRollResults
				.filter(r => r.manualRole === 'total')
				.reduce((sum, r) => sum + r.value, 0);
		},

		manualActionTotal() {
			return this.lastRollResults
				.filter(r => !r.isResource && r.manualRole === 'total')
				.reduce((sum, r) => sum + r.value, 0);
		},

		manualResourceBonus() {
			return this.lastRollResults
				.filter(r => r.isResource && r.manualRole === 'total')
				.reduce((sum, r) => sum + r.value, 0);
		},

		manualEffectDie() {
			const effects = this.lastRollResults
				.filter(r => r.manualRole === 'effect')
				.sort((a, b) => b.size - a.size);
			return effects.length > 0 ? 'd' + effects[0].size : 'd4';
		}

	},

	methods: {

		getDieDisplayValue(value) {
			return cortexFunctions.getDieDisplayValue(value);
		},

		cleanTraitLabel(source) {
			if (!source) return '';
			const cleaned = source.replace(/\s*\([dD]\d+\)$/, '').replace(/\s+[dD]\d+$/, '').trim();
			if (/^[dD]\d+$/.test(cleaned)) {
				return '';
			}
			return cleaned;
		},

		addAdHoc(size) {
			this.$emit('addDie', {
				size: size,
				qty: 1,
				source: ''
			});
			this.isRolled = false;
		},

		addScaleAdHoc(size) {
			this.$emit('addDie', {
				size: size,
				qty: 1,
				source: 'Scale',
				isScale: true
			});
			this.isRolled = false;
		},

		addResourceAdHoc(size) {
			this.$emit('addDie', {
				size: size,
				qty: 1,
				source: 'Resource',
				isResource: true,
				resourceType: 'Resource'
			});
			this.isRolled = false;
		},

		removeDie(index) {
			this.$emit('removeDie', index);
			this.isRolled = false;
		},

		clearPool() {
			this.$emit('clearPool');
			this.isRolled = false;
			this.lastRollResults = [];
			this.resourceGroupsResults = [];
			this.cortexPalOutput = '';
			this.bestTotalInfo = null;
			this.bestEffectInfo = null;
			this.keep = 2;
		},

		roll() {
			if (!this.pool || this.pool.is_empty()) return;

			const rollResults = [];
			// Roll each staged item
			for (const item of this.pool.items) {
				const val = Math.floor(Math.random() * item.size) + 1;
				// CRITICAL RULE: Resources NEVER hitch!
				const isHitch = !item.isResource && (val <= this.hitchOn);
				rollResults.push({
					id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
					size: item.size,
					value: val,
					source: item.source || '',
					isScale: Boolean(item.isScale),
					isResource: Boolean(item.isResource),
					resourceType: item.resourceType || (item.isResource ? (item.source || 'Resource') : ''),
					isHitch: isHitch,
					manualRole: 'none'
				});
			}

			this.lastRollResults = rollResults;
			this.isRolled = true;
			this.evaluateRollDisplay();
		},

		evaluateRollDisplay() {
			if (!this.isRolled || this.lastRollResults.length === 0) return;

			const resourceResults = this.lastRollResults.filter(r => r.isResource);
			const actionResults = this.lastRollResults.filter(r => !r.isResource);
			const hasRes = resourceResults.length > 0;

			if (!hasRes || this.combineResources) {
				// COMBINED / NORMAL POOL MODE
				this.resourceGroupsResults = [];
				const eligible = this.lastRollResults.filter(r => !r.isHitch);

				if (eligible.length === 0) {
					this.bestTotalInfo = { isBotch: true };
					this.bestEffectInfo = { isBotch: true };
					this.cortexPalOutput = `Normal Pool Roll (Keep ${this.keep}):\nBotch! All dice were hitches.`;
					return;
				}

				// Best Total
				const sortedForTotal = [...eligible].sort((a, b) => b.value - a.value);
				const totalDice = sortedForTotal.slice(0, this.keep);
				const remainingForEffect = sortedForTotal.slice(this.keep).sort((a, b) => b.size - a.size);
				const effectDie = remainingForEffect.length > 0 ? 'd' + remainingForEffect[0].size : 'd4';
				const totalSum = totalDice.reduce((sum, d) => sum + d.value, 0);
				const totalFormula = totalDice.map(d => d.value).join(' + ');

				this.bestTotalInfo = {
					total: totalSum,
					formula: totalFormula,
					effect: effectDie,
					dice: totalDice
				};

				// Best Effect
				const sortedForEffect = [...eligible].sort((a, b) => {
					if (a.size !== b.size) return b.size - a.size;
					return a.value - b.value;
				});
				const effectBest = sortedForEffect.length > 0 ? 'd' + sortedForEffect[0].size : 'd4';
				const totalDiceForEffect = sortedForEffect.slice(1).sort((a, b) => b.value - a.value).slice(0, this.keep);
				const totalSumForEffect = totalDiceForEffect.reduce((sum, d) => sum + d.value, 0);
				const formulaForEffect = totalDiceForEffect.map(d => d.value).join(' + ');

				this.bestEffectInfo = {
					total: totalSumForEffect,
					formula: formulaForEffect,
					effect: effectBest
				};

				// Set manual roles
				for (const r of this.lastRollResults) {
					if (r.isHitch) {
						r.manualRole = 'none';
					} else if (totalDice.some(c => c.id === r.id)) {
						r.manualRole = 'total';
					} else if (remainingForEffect.length > 0 && remainingForEffect[0].id === r.id) {
						r.manualRole = 'effect';
					} else {
						r.manualRole = 'none';
					}
				}

				const resNote = hasRes ? ` (+${this.resourceKeepBonus} keep for ${this.resourceKeepBonus} resource type${this.resourceKeepBonus > 1 ? 's' : ''}; resources cannot hitch)` : '';
				this.cortexPalOutput = `Normal Pool Roll (Keep ${this.keep})${resNote}:\nDice: ${this.lastRollResults.map(r => 'd' + r.size + (r.isResource ? '[res]' : '') + ': ' + r.value + (r.isHitch ? ' (Hitch)' : '')).join(', ')}\nBest Total: ${totalSum} (${totalFormula}) with Effect: ${effectDie}\nBest Effect: ${effectBest} with Total: ${totalSumForEffect} (${formulaForEffect})\nHitches: ${this.totalHitches}`;
			} else {
				// SEPARATE RESOURCES MODE (Standard Cortex Prime)
				const actionKeep = 2 + (this.hasScaleDie ? 1 : 0);
				const actionEligible = actionResults.filter(r => !r.isHitch);

				let actionTotal = 0;
				let actionFormula = '0';
				let actionEffect = 'd4';
				let actionTotalDice = [];
				let actionRemaining = [];

				if (actionEligible.length > 0) {
					const sortedAction = [...actionEligible].sort((a, b) => b.value - a.value);
					actionTotalDice = sortedAction.slice(0, actionKeep);
					actionRemaining = sortedAction.slice(actionKeep).sort((a, b) => b.size - a.size);
					actionEffect = actionRemaining.length > 0 ? 'd' + actionRemaining[0].size : 'd4';
					actionTotal = actionTotalDice.reduce((sum, d) => sum + d.value, 0);
					actionFormula = actionTotalDice.map(d => d.value).join(' + ');
				}

				// Group resources by type
				const groupMap = {};
				for (const r of resourceResults) {
					const name = (r.resourceType || r.source || 'Resource').trim();
					if (!groupMap[name]) groupMap[name] = [];
					groupMap[name].push(r);
				}

				const groups = [];
				let totalResourceBonus = 0;

				for (const [name, dice] of Object.entries(groupMap)) {
					// In each resource group, highest die is kept and added to total
					const sortedRes = [...dice].sort((a, b) => b.value - a.value);
					const keptDie = sortedRes[0];
					totalResourceBonus += keptDie.value;

					for (const d of dice) {
						if (d.id === keptDie.id) {
							d.manualRole = 'total';
						} else {
							d.manualRole = 'none';
						}
					}

					groups.push({
						name: name,
						dice: dice,
						keptDie: keptDie,
						bonus: keptDie.value
					});
				}

				this.resourceGroupsResults = groups;

				// Set action dice roles
				for (const r of actionResults) {
					if (r.isHitch) {
						r.manualRole = 'none';
					} else if (actionTotalDice.some(c => c.id === r.id)) {
						r.manualRole = 'total';
					} else if (actionRemaining.length > 0 && actionRemaining[0].id === r.id) {
						r.manualRole = 'effect';
					} else {
						r.manualRole = 'none';
					}
				}

				const grandTotal = actionTotal + totalResourceBonus;
				const formulaParts = [];
				if (actionTotal > 0) formulaParts.push(`${actionTotal} (Action)`);
				for (const g of groups) {
					formulaParts.push(`${g.bonus} (${g.name})`);
				}
				const grandFormula = formulaParts.length > 0 ? formulaParts.join(' + ') : '0';

				let actionEffectBestDie = 'd4';
				let actionEffectTotal = 0;
				let actionEffectFormula = '0';
				if (actionEligible.length > 0) {
					const sortedActionForEffect = [...actionEligible].sort((a, b) => {
						if (a.size !== b.size) return b.size - a.size;
						return a.value - b.value;
					});
					actionEffectBestDie = 'd' + sortedActionForEffect[0].size;
					const actionEffectTotalDice = sortedActionForEffect.slice(1).sort((a, b) => b.value - a.value).slice(0, actionKeep);
					actionEffectTotal = actionEffectTotalDice.reduce((sum, d) => sum + d.value, 0);
					actionEffectFormula = actionEffectTotalDice.map(d => d.value).join(' + ');
				}

				const grandTotalForEffect = actionEffectTotal + totalResourceBonus;
				const formulaPartsForEffect = [];
				if (actionEffectTotal > 0) formulaPartsForEffect.push(`${actionEffectTotal} (Action)`);
				for (const g of groups) {
					formulaPartsForEffect.push(`${g.bonus} (${g.name})`);
				}
				const grandFormulaForEffect = formulaPartsForEffect.length > 0 ? formulaPartsForEffect.join(' + ') : '0';

				this.bestTotalInfo = {
					total: grandTotal,
					actionTotal: actionTotal,
					resourceBonus: totalResourceBonus,
					formula: grandFormula,
					effect: actionEffect
				};

				this.bestEffectInfo = {
					total: grandTotalForEffect,
					actionTotal: actionEffectTotal,
					resourceBonus: totalResourceBonus,
					formula: grandFormulaForEffect,
					effect: actionEffectBestDie
				};

				let log = `=== ACTION POOL (Keep ${actionKeep}) ===\n`;
				if (actionResults.length > 0) {
					log += `Dice: ${actionResults.map(r => 'd' + r.size + ': ' + r.value + (r.isHitch ? ' (Hitch)' : '')).join(', ')}\n`;
					log += `Action Total: ${actionTotal} (${actionFormula}) | Effect: ${actionEffect}\n`;
					log += `Action Hitches: ${this.totalHitches}\n\n`;
				} else {
					log += `(No action dice in pool)\n\n`;
				}

				log += `=== RESOURCES (Rolled Separately, No Hitches) ===\n`;
				for (const g of groups) {
					log += `• ${g.name} (${g.dice.map(d => 'd' + d.size).join(', ')}): [${g.dice.map(d => d.value).join(', ')}] -> Kept highest: ${g.bonus}\n`;
				}
				log += `Total Resource Bonus: +${totalResourceBonus}\n\n`;

				log += `=== FINAL COMBINED TOTAL ===\n`;
				log += `Grand Total: ${grandTotal} (${grandFormula})\n`;
				log += `Effect Die: ${actionEffect}\n`;
				log += `Total Hitches: ${this.totalHitches} (Resources cannot hitch)`;

				this.cortexPalOutput = log;
			}
		},

		getGroupKeptValue(group) {
			const kept = group.dice.find(d => d.manualRole === 'total');
			return kept ? kept.value : 0;
		},

		cycleDieRole(dieResult) {
			if (dieResult.isHitch) return; // Hitches cannot be used for total or effect

			if (!this.combineResources && dieResult.isResource) {
				const group = this.resourceGroupsResults.find(g => g.name === dieResult.resourceType || g.dice.some(d => d.id === dieResult.id));
				if (group) {
					if (dieResult.manualRole === 'total') {
						dieResult.manualRole = 'none';
					} else {
						for (const d of group.dice) {
							d.manualRole = (d.id === dieResult.id) ? 'total' : 'none';
						}
					}
					return;
				}
			}

			if (dieResult.manualRole === 'none') {
				dieResult.manualRole = 'total';
			} else if (dieResult.manualRole === 'total') {
				dieResult.manualRole = 'effect';
			} else {
				dieResult.manualRole = 'none';
			}
		},

		applyBestTotal() {
			if (!this.bestTotalInfo || this.bestTotalInfo.isBotch) return;
			this.evaluateRollDisplay();
		},

		applyBestEffect() {
			if (!this.bestEffectInfo || this.bestEffectInfo.isBotch) return;

			if (!this.combineResources && this.resourceGroupsResults.length > 0) {
				const actionKeep = 2 + (this.hasScaleDie ? 1 : 0);
				const actionEligible = this.actionRollResults.filter(r => !r.isHitch).sort((a, b) => {
					if (a.size !== b.size) return b.size - a.size;
					return a.value - b.value;
				});
				const effectSlice = actionEligible.slice(0, 1);
				const totalSlice = actionEligible.slice(1).sort((a, b) => b.value - a.value).slice(0, actionKeep);

				for (const r of this.actionRollResults) {
					if (effectSlice.some(e => e.id === r.id)) {
						r.manualRole = 'effect';
					} else if (totalSlice.some(t => t.id === r.id)) {
						r.manualRole = 'total';
					} else {
						r.manualRole = 'none';
					}
				}

				for (const group of this.resourceGroupsResults) {
					const hasKept = group.dice.some(d => d.manualRole === 'total');
					if (!hasKept && group.dice.length > 0) {
						const sortedRes = [...group.dice].sort((a, b) => b.value - a.value);
						sortedRes[0].manualRole = 'total';
					}
				}
				return;
			}

			const eligible = this.lastRollResults.filter(r => !r.isHitch).sort((a, b) => {
				if (a.size !== b.size) return b.size - a.size;
				return a.value - b.value;
			});
			const effectSlice = eligible.slice(0, 1);
			const totalSlice = eligible.slice(1).sort((a, b) => b.value - a.value).slice(0, this.keep);

			for (const r of this.lastRollResults) {
				if (effectSlice.some(e => e.id === r.id)) {
					r.manualRole = 'effect';
				} else if (totalSlice.some(t => t.id === r.id)) {
					r.manualRole = 'total';
				} else {
					r.manualRole = 'none';
				}
			}
		},

		copyOutput() {
			if (!this.cortexPalOutput) return;
			navigator.clipboard.writeText(this.cortexPalOutput).then(() => {
				this.copiedNotice = true;
				setTimeout(() => {
					this.copiedNotice = false;
				}, 2000);
			});
		}

	},

	/*html*/
	template: `<aside class="dice-roller-sidebar" :class="{ 'open': open }">

		<div class="roller-header">
			<div class="roller-title">
				<i class="fas fa-dice"></i> <span>Dice Roller</span>
			</div>
			<div class="roller-header-actions">
				<button class="roller-btn-icon" @click="$emit('togglePosition')" :title="position === 'left' ? 'Move sidebar to right' : 'Move sidebar to left'">
					<i class="fas fa-arrows-left-right"></i>
				</button>
				<button class="roller-btn-icon" @click="clearPool" title="Clear Pool" v-if="stagedDice.length > 0">
					<i class="fas fa-trash-can"></i>
				</button>
				<button class="roller-btn-icon" @click="$emit('close')" title="Close Roller">
					<i class="fas fa-times"></i>
				</button>
			</div>
		</div>

		<div class="roller-body">

			<!-- QUICK ADD AD-HOC DICE -->
			<div class="roller-section">
				<label class="roller-label">Quick Add Dice</label>
				<div class="roller-adhoc-grid">
					<button
						v-for="size in diceSizes"
						:key="'adhoc-d' + size"
						class="roller-adhoc-btn"
						@click="addAdHoc(size)"
					>
						<span class="c">{{ getDieDisplayValue(size) }}</span>
						<span class="die-label">d{{ size }}</span>
					</button>
				</div>
				<div class="roller-scale-row" style="margin-top: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
					<span class="roller-sublabel" style="font-weight: 700; color: #1e293b; font-style: normal; font-size: 0.65rem; text-transform: uppercase;">Scale Die (Keep 3)</span>
					<div style="display: flex; gap: 0.25rem;">
						<button
							v-for="size in diceSizes"
							:key="'scale-quick-d' + size"
							class="roller-btn-scale-quick"
							@click="addScaleAdHoc(size)"
							:title="'Add d' + size + ' Scale Die (Keep 3)'"
							style="background: white; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 5px; cursor: pointer; line-height: 1;"
						>
							<span class="c" style="color: #1e293b; font-size: 0.95rem;">{{ getDieDisplayValue(size) }}</span>
						</button>
					</div>
				</div>
				<div class="roller-scale-row" style="margin-top: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
					<span class="roller-sublabel" style="font-weight: 700; color: #0284c7; font-style: normal; font-size: 0.65rem; text-transform: uppercase;">Resource Die (+Keep, No Hitch)</span>
					<div style="display: flex; gap: 0.25rem;">
						<button
							v-for="size in diceSizes"
							:key="'res-quick-d' + size"
							class="roller-btn-res-quick"
							@click="addResourceAdHoc(size)"
							:title="'Add d' + size + ' Resource Die'"
							style="background: white; border: 1px solid #bae6fd; border-radius: 4px; padding: 2px 5px; cursor: pointer; line-height: 1;"
						>
							<span class="c" style="color: #0284c7; font-size: 0.95rem;">{{ getDieDisplayValue(size) }}</span>
						</button>
					</div>
				</div>
			</div>

			<!-- CURRENT POOL -->
			<div class="roller-section">
				<div class="roller-section-header">
					<label class="roller-label">Dice Pool ({{ stagedDice.length }})</label>
					<span class="roller-sublabel" v-if="stagedDice.length === 0">Tap traits on sheet to add</span>
				</div>

				<div class="roller-pool-chips" v-if="stagedDice.length > 0">
					<div
						v-for="(item, idx) in stagedDice"
						:key="item.id || idx"
						class="roller-chip"
						:class="{
							'chip-scale': item.isScale || (item.source && item.source.toLowerCase() === 'scale'),
							'chip-resource': item.isResource
						}"
					>
						<span class="c">{{ getDieDisplayValue(item.size) }}</span>
						<span class="chip-source" v-if="cleanTraitLabel(item.source)" :title="cleanTraitLabel(item.source)">{{ cleanTraitLabel(item.source) }}</span>
						<span class="chip-tag-res" v-if="item.isResource">RES</span>
						<button class="chip-remove" @click.stop="removeDie(idx)" title="Remove die">×</button>
					</div>
				</div>

				<div class="roller-empty-pool" v-else>
					<p><i class="fas fa-hand-pointer"></i> Click any trait on your sheet or use quick-add above to build a roll pool.</p>
				</div>
			</div>

			<!-- SETTINGS & ROLL BUTTON -->
			<div class="roller-controls" v-if="stagedDice.length > 0">

				<!-- RESOURCE ROLL MODE TOGGLE (when resources are staged) -->
				<div class="roller-toggle-row" v-if="hasResourceDice">
					<label class="roller-toggle-label" title="Toggle between rolling resources in the main action pool vs. rolling them separately">
						<input type="checkbox" v-model="combineResources">
						<span class="toggle-text">Roll Resources in Normal Pool</span>
					</label>
					<span class="toggle-hint">
						{{ combineResources ? 'Combined pool: +' + resourceKeepBonus + ' Keep (' + keep + ' total kept, no hitches on resources)' : 'Standard Cortex: Rolled separately (+1 kept die per resource type, no hitches)' }}
					</span>
				</div>

				<div class="roller-options-row">
					<div class="roller-option">
						<label>Keep</label>
						<select v-model.number="keep">
							<option v-for="n in 8" :key="n" :value="n">{{ n }}{{ n === 2 ? ' (Default)' : '' }}</option>
						</select>
					</div>

					<div class="roller-option">
						<label>Hitch On</label>
						<select v-model.number="hitchOn">
							<option :value="1">1 (Default)</option>
							<option :value="2">1–2</option>
						</select>
					</div>
				</div>

				<button class="roller-roll-btn" @click="roll">
					<i class="fas fa-dice"></i> ROLL POOL
				</button>
			</div>

			<!-- ROLL RESULTS -->
			<div class="roller-results" v-if="isRolled && lastRollResults.length > 0">

				<div class="roller-results-header">
					<label class="roller-label">Results</label>
					<div class="roller-view-tabs">
						<button :class="{ active: activeTab === 'roller' }" @click="activeTab = 'roller'">Interactive</button>
						<button :class="{ active: activeTab === 'log' }" @click="activeTab = 'log'">Text Log</button>
					</div>
				</div>

				<!-- BOTCH ALERT -->
				<div class="roller-botch-banner" v-if="isBotch">
					<i class="fas fa-triangle-exclamation"></i> <strong>BOTCH!</strong> All dice rolled hitches!
				</div>

				<!-- INTERACTIVE RESULTS VIEW -->
				<div v-show="activeTab === 'roller'" class="roller-interactive-view">

					<!-- SEPARATE MODE: ACTION POOL DICE & RESOURCE GROUPS -->
					<template v-if="!combineResources && resourceGroupsResults.length > 0">
						<!-- Action Pool Section -->
						<div class="roller-group-section" v-if="actionRollResults.length > 0">
							<div class="roller-group-header">
								<span>Action Pool</span>
								<span class="group-sub">Keep {{ Math.min(keep, actionRollResults.length) }}</span>
							</div>
							<div class="roller-dice-grid">
								<div
									v-for="die in actionRollResults"
									:key="die.id"
									class="roller-die-card"
									:class="{
										'is-hitch': die.isHitch,
										'role-total': die.manualRole === 'total',
										'role-effect': die.manualRole === 'effect'
									}"
									@click="cycleDieRole(die)"
									:title="die.isHitch ? 'Hitch: cannot be used' : 'Click to cycle: Total / Effect / Unused'"
								>
									<div class="card-top">
										<span class="c">{{ getDieDisplayValue(die.size) }}</span>
										<span class="card-size">d{{ die.size }}</span>
									</div>
									<div class="card-value" :class="{ 'hitch-value': die.isHitch }">
										{{ die.value }}
									</div>
									<div class="card-badge" v-if="die.isHitch">
										<i class="fas fa-exclamation"></i> Hitch
									</div>
									<div class="card-badge badge-total" v-else-if="die.manualRole === 'total'">
										Total
									</div>
									<div class="card-badge badge-effect" v-else-if="die.manualRole === 'effect'">
										Effect
									</div>
									<div class="card-badge badge-unused" v-else>
										Unused
									</div>
									<div class="card-source" v-if="die.source">{{ die.source }}</div>
								</div>
							</div>
						</div>

						<!-- Resources Separately Section -->
						<div class="roller-resources-section">
							<div class="roller-group-header">
								<span><i class="fas fa-cubes-stacked"></i> Resources (Rolled Separately)</span>
								<span class="group-sub">No Hitches • Keep Highest</span>
							</div>

							<div v-for="group in resourceGroupsResults" :key="group.name" class="roller-resource-group-card">
								<div class="resource-group-title">
									<span class="res-name">{{ group.name }}</span>
									<span class="resource-group-tag">+{{ getGroupKeptValue(group) }} to Total</span>
								</div>
								<div class="roller-dice-grid">
									<div
										v-for="die in group.dice"
										:key="die.id"
										class="roller-die-card die-resource-card"
										:class="{
											'role-total': die.manualRole === 'total'
										}"
										@click="cycleDieRole(die)"
										title="Click to toggle as kept die for this resource"
									>
										<div class="card-top">
											<span class="c" style="color: #0284c7;">{{ getDieDisplayValue(die.size) }}</span>
											<span class="card-size">d{{ die.size }}</span>
										</div>
										<div class="card-value">
											{{ die.value }}
										</div>
										<div class="card-badge badge-res-kept" v-if="die.manualRole === 'total'">
											Kept (+{{ die.value }})
										</div>
										<div class="card-badge badge-unused" v-else>
											Unused
										</div>
										<div class="card-source">{{ die.source }}</div>
									</div>
								</div>
							</div>
						</div>
					</template>

					<!-- COMBINED / NORMAL POOL MODE: SINGLE GRID -->
					<div class="roller-dice-grid" v-else>
						<div
							v-for="die in lastRollResults"
							:key="die.id"
							class="roller-die-card"
							:class="{
								'is-hitch': die.isHitch,
								'die-resource-card': die.isResource,
								'role-total': die.manualRole === 'total',
								'role-effect': die.manualRole === 'effect'
							}"
							@click="cycleDieRole(die)"
							:title="die.isHitch ? 'Hitch: cannot be used' : 'Click to cycle: Total / Effect / Unused'"
						>
							<div class="card-top">
								<span class="c" :style="die.isResource ? 'color: #0284c7;' : ''">{{ getDieDisplayValue(die.size) }}</span>
								<span class="card-size">d{{ die.size }}</span>
							</div>

							<div class="card-value" :class="{ 'hitch-value': die.isHitch }">
								{{ die.value }}
							</div>

							<div class="card-badge" v-if="die.isHitch">
								<i class="fas fa-exclamation"></i> Hitch
							</div>
							<div class="card-badge badge-total" v-else-if="die.manualRole === 'total'">
								Total
							</div>
							<div class="card-badge badge-effect" v-else-if="die.manualRole === 'effect'">
								Effect
							</div>
							<div class="card-badge badge-unused" v-else>
								Unused
							</div>

							<div class="card-source" v-if="die.source">
								{{ die.source }}<span v-if="die.isResource" style="color: #0284c7; font-weight: 700;"> (Res)</span>
							</div>
						</div>
					</div>

					<!-- HITCH INDICATOR -->
					<div class="roller-hitch-indicator" v-if="totalHitches > 0">
						<i class="fas fa-bullhorn"></i> <strong>{{ totalHitches }}</strong> Hitch{{ totalHitches > 1 ? 'es' : '' }}! (GM may buy for 1 PP each; resource dice cannot hitch)
					</div>

					<!-- CURRENT SELECTION TOTAL / EFFECT -->
					<div class="roller-calc-box custom-calc" v-if="!isBotch">
						<template v-if="!combineResources && resourceGroupsResults.length > 0">
							<div class="calc-row">
								<span class="calc-label">Action Total</span>
								<span class="calc-val">{{ manualActionTotal }}</span>
							</div>
							<div class="calc-row">
								<span class="calc-label">Resources</span>
								<span class="calc-val" style="color: #0284c7;">+{{ manualResourceBonus }}</span>
							</div>
							<div class="calc-row">
								<span class="calc-label">Grand Total</span>
								<span class="calc-val">{{ manualTotal }}</span>
							</div>
							<div class="calc-row">
								<span class="calc-label">Effect</span>
								<span class="calc-val">{{ manualEffectDie }}</span>
							</div>
						</template>
						<template v-else>
							<div class="calc-row">
								<span class="calc-label">Selected Total</span>
								<span class="calc-val">{{ manualTotal }}</span>
							</div>
							<div class="calc-row">
								<span class="calc-label">Selected Effect</span>
								<span class="calc-val">{{ manualEffectDie }}</span>
							</div>
						</template>
					</div>

					<!-- CORTEXPAL PRESETS -->
					<div class="roller-presets" v-if="!isBotch">
						<div class="preset-card" v-if="bestTotalInfo" @click="applyBestTotal">
							<div class="preset-title"><i class="fas fa-award"></i> Best Total</div>
							<div class="preset-content">
								<strong>{{ bestTotalInfo.total }}</strong> ({{ bestTotalInfo.formula }}) with Effect: <strong>{{ bestTotalInfo.effect }}</strong>
							</div>
							<span class="preset-apply">Apply to selection</span>
						</div>

						<div class="preset-card" v-if="bestEffectInfo" @click="applyBestEffect">
							<div class="preset-title"><i class="fas fa-bolt"></i> Best Effect</div>
							<div class="preset-content">
								Effect: <strong>{{ bestEffectInfo.effect }}</strong> with Total: <strong>{{ bestEffectInfo.total }}</strong>
							</div>
							<span class="preset-apply">Apply to selection</span>
						</div>
					</div>

				</div>

				<!-- PLAIN TEXT CORTEXPAL LOG -->
				<div v-show="activeTab === 'log'" class="roller-log-view">
					<pre class="roller-raw-log">{{ cortexPalOutput }}</pre>
					<button class="roller-copy-btn" @click="copyOutput">
						<i class="fas fa-copy"></i> {{ copiedNotice ? 'Copied!' : 'Copy to Clipboard' }}
					</button>
				</div>

			</div>

		</div>

	</aside>`

};
