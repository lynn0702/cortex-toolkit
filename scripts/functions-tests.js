// Shared data-driven helpers: slot ratings, fixed-name sets.
// Usage: node scripts/functions-tests.js  (exit 1 on failure)
const F = require('../js/functions.ts').characterCurioFunctions;

let pass = 0,
	fail = 0;
function ok(cond, name, extra) {
	if (cond) {
		pass++;
	} else {
		fail++;
		console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''));
	}
}

const paired = { view: { style: { body: 'paired-slots' } } };
const plain = { view: { style: { body: 'default' } } };
const customScale = { view: { style: { body: 'paired-slots' }, subtraitRatingLadder: [6, 8, 10] } };

// ---- slot ratings: secondary slots floor at d6 on standard scales.
{
	ok(JSON.stringify(F.getSubtraitSlotRatings(paired, 0)) === '[4,6,8,10,12]', 'slot 0 keeps the full scale');
	ok(
		JSON.stringify(F.getSubtraitSlotRatings(paired, 1)) === '[6,8,10,12]',
		'slot 1 floors at d6',
		F.getSubtraitSlotRatings(paired, 1),
	);
	ok(JSON.stringify(F.getSubtraitSlotRatings(paired, 2)) === '[6,8,10,12]', 'later slots floor too');
	ok(JSON.stringify(F.getSubtraitSlotRatings(plain, 1)) === '[4,6,8,10,12]', 'floor is paired-slots only');
	ok(JSON.stringify(F.getSubtraitSlotRatings(customScale, 1)) === '[6,8,10]', 'custom scales pass through unfloored');
	ok(JSON.stringify(F.getSubtraitSlotRatings({}, 1)) === '[4,6,8,10,12]', 'missing view falls back to full scale');
}

// ---- fixed-name sets: structural flags and layout styles print on blank sheets.
{
	ok(F.isFixedTraitNamesSet({ view: { fixedNames: true } }) === true, 'explicit view.fixedNames matches');
	ok(F.isFixedTraitNamesSet({ view: { style: { body: 'die-track' } } }) === true, 'die-track body matches');
	ok(F.isFixedTraitNamesSet({ view: { style: { body: 'portrait-ring' } } }) === true, 'portrait-ring body matches');
	ok(F.isFixedTraitNamesSet({ view: { traitColumns: 2 } }) === true, 'multi-column trait set matches');
	ok(F.isFixedTraitNamesSet({ view: { parts: { name: {}, track: {} } } }) === true, 'track-part set matches');
	ok(F.isFixedTraitNamesSet({ name: 'Attributes', view: {} }) === false, 'ordinary name alone does not sniff');
	ok(F.isFixedTraitNamesSet(null) === false && F.isFixedTraitNamesSet(undefined) === false, 'non-objects miss');
}

// ---- isPlayMutableSet (playMutable-only carveout)
{
	ok(
		F.isPlayMutableSet({ name: 'Complications', view: { playMutable: true } }) === true,
		'flagged complication set is play-add/removable',
	);
	ok(
		F.isPlayMutableSet({ name: 'Complications', view: { playMutable: false } }) === false,
		'explicit false is not play-add/removable',
	);
	ok(
		F.isPlayMutableSet({ name: 'Complications' }) === false,
		'unflagged complication set is not play-add/removable (no name sniffing)',
	);
	ok(F.isPlayMutableSet({ name: 'Session Complications' }) === false, 'fuzzy complication name does not match');
	ok(
		F.isPlayMutableSet({ name: 'Custom Stress', view: { style: { body: 'die-track' } } }) === false,
		'die-track set is not play-add/removable (no stress fallback)',
	);
	ok(
		F.isPlayMutableSet({ name: 'Skills', view: { playMutable: true } }) === true,
		'explicit playMutable true wins on any set',
	);
	ok(F.isPlayMutableSet({ name: 'Distinctions' }) === false, 'unflagged set returns false');
	ok(F.isPlayMutableSet(null) === false, 'null trait set returns false');
}

// ---- setPlotPoints
{
	const char = {
		plotPoints: 1,
		traitSets: [
			{
				view: { style: { body: 'name' } },
				traits: [{ name: 'plotPoints', rating: { type: 'Counter', value: [1], range: [0, 20] } }],
			},
		],
	};
	F.setPlotPoints(char, 2);
	ok(char.plotPoints === 2, 'character.plotPoints updated to 2');
	ok(char.traitSets[0].traits[0].rating.value[0] === 2, 'Counter trait value updated to 2');
}

// ---- play-only visibility, resolveSetPillar, getPillarLabel, characterCurioSetPresets
{
	const Model = require('../js/model.ts');
	const playOnlyNode = { view: { visibility: 'play-only' } };
	ok(Model.resolveVisibility(playOnlyNode) === 'play-only', 'resolveVisibility recognizes play-only');
	ok(Model.isHiddenIn(playOnlyNode, 'edit') === false, 'play-only is visible in edit');
	ok(Model.isHiddenIn(playOnlyNode, 'play') === false, 'play-only is visible in play');
	ok(Model.isHiddenIn(playOnlyNode, 'print') === true, 'play-only is hidden in print');
	ok(Model.nextVisibility('shown') === 'play-only', 'shown cycles to play-only');
	ok(Model.nextVisibility('play-only') === 'editor-only', 'play-only cycles to editor-only');

	ok(F.resolveSetPillar({ view: { pillar: 'cyberware' } }) === 'cyberware', 'explicit custom pillar wins');
	ok(F.resolveSetPillar({ view: { visibility: 'play-only' } }) === 'play', 'play-only defaults to play pillar');
	ok(F.resolveSetPillar({ view: { playMutable: true } }) === 'play', 'playMutable defaults to play pillar');
	ok(F.resolveSetPillar({ view: { pillar: 'play' } }) === 'play', 'explicit play pillar works');
	ok(
		F.resolveSetPillar({ view: { style: { body: 'portrait-ring' } } }) === 'prime',
		'portrait-ring defaults to prime pillar',
	);
	ok(F.resolveSetPillar({ view: { style: { body: 'default' } } }) === 'plus', 'default style defaults to plus pillar');

	const charWithLabels = {
		view: { labels: { pillars: { prime: 'Core', cyberware: 'Augments' }, pillar_play: 'Session' } },
	};
	ok(F.getPillarLabel(charWithLabels, 'prime') === 'Core', 'getPillarLabel reads view.labels.pillars');
	ok(F.getPillarLabel(charWithLabels, 'cyberware') === 'Augments', 'getPillarLabel reads custom pillar label');
	ok(F.getPillarLabel(charWithLabels, 'play') === 'Session', 'getPillarLabel reads flat pillar_ fallback');
	ok(F.getPillarLabel(charWithLabels, 'plus') === 'Plus', 'getPillarLabel capitalizes uncustomized key');

	const presets = F.characterCurioSetPresets;
	ok(
		presets && presets['scene-traits'] && presets['session-notes'] && presets['crisis-pool'] && presets['micro-gmc'],
		'4 built-in set presets exist',
	);
	const inst = F.instantiateSetPreset(presets['scene-traits'], { traitSets: [] }, 1);
	ok(
		inst &&
			inst.name === 'Scene Traits' &&
			inst.view.pillar === 'play' &&
			inst.view.visibility === 'play-only' &&
			inst.view.playMutable === true,
		'instantiateSetPreset clones and assigns id',
	);

	// ---- Phase 3a: derivePresetId, collision check, saveCustomSetPreset, getTrackScale, renderDieGeometrySVG
	const mockStore = {};
	global.localStorage = {
		getItem: (k) => (k in mockStore ? mockStore[k] : null),
		setItem: (k, v) => {
			mockStore[k] = String(v);
		},
		removeItem: (k) => {
			delete mockStore[k];
		},
	};

	ok(
		F.derivePresetId('  Doom Pool & Stress! ') === 'doom-pool-stress',
		'derivePresetId lowercases and hyphenates label',
	);
	ok(F.hasPresetCollision('Scene Traits') === true, 'hasPresetCollision detects built-in preset collision');
	ok(F.hasPresetCollision('Brand New Card') === false, 'hasPresetCollision passes unused label');

	const customCard = {
		name: 'Ship Damage',
		noun: 'System',
		traits: [
			{
				name: 'Engines',
				rating: { type: 'Die', values: [8] },
				traits: [{ name: 'Wear', rating: { type: 'Die', value: 6, range: [6, 8, 10] } }],
			},
		],
		view: {
			pillar: 'ship',
			labels: { pillars: { ship: 'Starship' }, stress: 'Wear' },
			parts: {
				name: { left: '0%', top: 0, width: '50%', height: 1 },
				rating: { left: '50%', top: 0, width: '50%', height: 1 },
				trackLabel: { left: '0%', top: 1, width: '30%', height: 1 },
				track: { left: '30%', top: 1, width: '70%', height: 1 },
			},
		},
	};

	ok(
		JSON.stringify(F.getTrackScale(customCard)) === '[6,8,10]',
		'getTrackScale resolves first companion range [6,8,10]',
	);
	ok(
		JSON.stringify(
			F.getTrackScale({
				name: 'LadderSet',
				view: { subtraitRatingLadder: [12, 6, 8] },
				traits: [{ name: 'A', traits: [{ name: 'Stress', rating: { type: 'Die', range: [4, 6] } }] }],
			}),
		) === '[6,8,12]',
		'getTrackScale prefers view.subtraitRatingLadder when present and returns sorted copy',
	);
	ok(
		JSON.stringify(
			F.getTrackScale({
				name: 'Bare',
				traits: [{ name: 'A', traits: [{ name: 'AnyTrack', rating: { type: 'Die', range: [4, 6, 8] } }] }],
			}),
		) === '[4,6,8]',
		'getTrackScale falls back to first rated companion range even without matching trackLabel',
	);
	ok(
		JSON.stringify(F.getTrackScale({ name: 'NoTrack', traits: [] })) === '[4,6,8,10,12]',
		'getTrackScale falls back to default [4,6,8,10,12]',
	);

	const savedEntry = F.saveCustomSetPreset(customCard, { label: 'Starship Systems' });
	ok(
		savedEntry && savedEntry.id === 'starship-systems' && savedEntry.label === 'Starship Systems',
		'saveCustomSetPreset derives id from creator label',
	);
	ok(savedEntry && !('blurb' in savedEntry), 'saveCustomSetPreset keeps blurb sparse when omitted');
	ok(F.hasPresetCollision('Starship Systems') === true, 'saved custom preset triggers collision on duplicate label');
	ok(
		F.saveCustomSetPreset(customCard, { label: 'Starship Systems' }) === null,
		'saveCustomSetPreset rejects collision without overwriting',
	);

	const targetChar = { name: 'Capt. Kirk', traitSets: [] };
	const addedSet = F.instantiateSetPreset(savedEntry, targetChar, 1);
	targetChar.traitSets.push(addedSet);
	ok(
		F.getPillarLabel(targetChar, 'ship') === 'Starship',
		'instantiateSetPreset propagates custom pillar display label onto character',
	);

	const geomSvg = F.renderDieGeometrySVG(8, true);
	ok(
		geomSvg.includes('<svg') && geomSvg.includes('aria-hidden="true"') && !geomSvg.includes('<text'),
		'renderDieGeometrySVG outputs pure geometry SVG without inner text',
	);
	ok(F.renderDieGeometrySVG(8, true) === geomSvg, 'renderDieGeometrySVG returns deterministic cached SVG strings');

	for (const size of [4, 6, 8, 10, 12, 20]) {
		const svg = F.renderDieconSVG(size, true);
		ok(
			svg.includes('<text ') &&
				svg.includes('stroke="none"') &&
				svg.includes('font-family="\'Open Sans\', sans-serif"') &&
				!svg.includes('dominant-baseline="central"'),
			`renderDieconSVG(${size}) uses self-hosted Open Sans with alphabetic baseline and stroke="none"`,
		);
		ok(F.renderDieconSVG(size, true) === svg, `renderDieconSVG(${size}) returns deterministic cached SVG strings`);
	}

	const customSvg = F.renderDieconSVG(4, true, 'extra" onclick="alert(1)', {
		style: 'custom',
		backgroundType: 'gradient',
		backgroundColor1: '#10b981',
		backgroundColor2: '#047857',
		gradientAngle: 135,
		numeralColor: '#ffffff',
		borderColor: '" onload="alert(1)',
		borderWidth: 3,
	});
	ok(
		customSvg.includes('diecon-custom') &&
			customSvg.includes('<linearGradient') &&
			customSvg.includes('stroke="#000000"') &&
			!customSvg.includes('onclick=') &&
			!customSvg.includes('onload'),
		'renderDieconSVG tags custom styles with diecon-custom, builds gradients, and rejects attribute injection',
	);

	const fs = require('node:fs');
	const path = require('node:path');
	const charCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'character.css'), 'utf8');
	ok(
		/\.trait-set-frame-svg\s*\{[^}]*stroke:\s*var\(--frame-color\)/.test(charCss),
		'.trait-set-frame-svg applies --frame-color stroke to frame SVG only',
	);
	const frameColorBlocks = charCss.match(/\.frame-color-(?:primary|accent|muted|strong|black)\s*\{[^}]*\}/g) || [];
	ok(
		frameColorBlocks.length >= 5 && frameColorBlocks.every((block) => !/\bstroke\s*:/.test(block)),
		'.frame-color-* classes do not declare stroke on container section',
	);

	// ---- Retired usableBy check + 2-arg checkSetPick
	const H = require('../js/character-curio-trait-helpers.ts');
	ok(H.usableBy === undefined, 'usableBy helper is retired from character-curio-trait-helpers');
	ok(
		H.checkSetPick({ name: 'Distinctions', select: 'one', requiresSelect: true }, ['A']).length === 0,
		'checkSetPick validates selection constraints cleanly with 2 args',
	);
	ok(
		H.checkSetPick({ name: 'Distinctions', select: 'one', requiresSelect: true }, ['A', 'B']).length === 1,
		'checkSetPick catches select=one violations',
	);
	ok(
		H.checkSetPick({ name: 'Distinctions', select: 'one', requiresSelect: true }, []).length === 1,
		'checkSetPick catches requiresSelect violations',
	);
}

console.log(`functions-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
