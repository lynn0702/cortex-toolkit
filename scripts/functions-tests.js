// Shared data-driven helpers: slot ratings, fixed-name sets.
// Usage: node scripts/functions-tests.js  (exit 1 on failure)
const F = require('../js/functions.ts').cortexFunctions;

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

const paired = { view: { style: { body: 'paired-slots' } } };
const plain = { view: { style: { body: 'default' } } };
const customScale = { view: { style: { body: 'paired-slots' }, subtraitRatingScale: [6, 8, 10] } };

// ---- slot ratings: secondary slots floor at d6 on standard scales.
{
  ok(JSON.stringify(F.getSubtraitSlotRatings(paired, 0)) === '[4,6,8,10,12]', 'slot 0 keeps the full scale');
  ok(JSON.stringify(F.getSubtraitSlotRatings(paired, 1)) === '[6,8,10,12]', 'slot 1 floors at d6', F.getSubtraitSlotRatings(paired, 1));
  ok(JSON.stringify(F.getSubtraitSlotRatings(paired, 2)) === '[6,8,10,12]', 'later slots floor too');
  ok(JSON.stringify(F.getSubtraitSlotRatings(plain, 1)) === '[4,6,8,10,12]', 'floor is paired-slots only');
  ok(JSON.stringify(F.getSubtraitSlotRatings(customScale, 1)) === '[6,8,10]', 'custom scales pass through unfloored');
  ok(JSON.stringify(F.getSubtraitSlotRatings({}, 1)) === '[4,6,8,10,12]', 'missing view falls back to full scale');
}

// ---- fixed-name sets: system labels print on blank sheets.
{
  ok(F.isFixedNameSet('Attributes') === true, 'attribute set matches');
  ok(F.isFixedNameSet('ROLES') === true, 'match is case-insensitive');
  ok(F.isFixedNameSet('Signature Assets') === false, 'ordinary sets miss');
  ok(F.isFixedNameSet('') === false, 'blank misses');
  ok(F.isFixedNameSet(null) === false && F.isFixedNameSet(undefined) === false, 'non-strings miss');
  ok(F.isFixedNameSet('Eidolon Strain') === true, 'eidolon matches', F.fixedNameSetKeys.length);
}

// ---- isPlayAddRemovableSet (playMutable-only carveout)
{
  ok(F.isPlayAddRemovableSet({ name: 'Complications', view: { playMutable: true } }) === true, 'flagged complication set is play-add/removable');
  ok(F.isPlayAddRemovableSet({ name: 'Complications', view: { playMutable: false } }) === false, 'explicit false is not play-add/removable');
  ok(F.isPlayAddRemovableSet({ name: 'Complications' }) === false, 'unflagged complication set is not play-add/removable (no name sniffing)');
  ok(F.isPlayAddRemovableSet({ name: 'Session Complications' }) === false, 'fuzzy complication name does not match');
  ok(F.isPlayAddRemovableSet({ name: 'Custom Stress', view: { style: { body: 'die-track' } } }) === false, 'die-track set is not play-add/removable (no stress fallback)');
  ok(F.isPlayAddRemovableSet({ name: 'Skills', view: { playMutable: true } }) === true, 'explicit playMutable true wins on any set');
  ok(F.isPlayAddRemovableSet({ name: 'Distinctions' }) === false, 'unflagged set returns false');
  ok(F.isPlayAddRemovableSet(null) === false, 'null trait set returns false');
}

// ---- setPlotPoints
{
  const char = {
    plotPoints: 1,
    traitSets: [
      {
        view: { style: { body: 'name' } },
        traits: [
          { name: 'plotPoints', rating: { type: 'Counter', value: [1], range: [0, 20] } }
        ]
      }
    ]
  };
  F.setPlotPoints(char, 2);
  ok(char.plotPoints === 2, 'character.plotPoints updated to 2');
  ok(char.traitSets[0].traits[0].rating.value[0] === 2, 'Counter trait value updated to 2');
}

// ---- play-only visibility, resolveSetPillar, getPillarLabel, cortexSetPresets
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
  ok(F.resolveSetPillar({ view: { style: { body: 'notes' } } }) === 'play', 'notes style defaults to play pillar');
  ok(F.resolveSetPillar({ view: { style: { body: 'sfx-rows' } } }) === 'prime', 'sfx-rows defaults to prime pillar');
  ok(F.resolveSetPillar({ view: { style: { body: 'portrait-ring' } } }) === 'prime', 'portrait-ring defaults to prime pillar');
  ok(F.resolveSetPillar({ view: { style: { body: 'default' } } }) === 'plus', 'default style defaults to plus pillar');

  const charWithLabels = { view: { labels: { pillars: { prime: 'Core', cyberware: 'Augments' }, pillar_play: 'Session' } } };
  ok(F.getPillarLabel(charWithLabels, 'prime') === 'Core', 'getPillarLabel reads view.labels.pillars');
  ok(F.getPillarLabel(charWithLabels, 'cyberware') === 'Augments', 'getPillarLabel reads custom pillar label');
  ok(F.getPillarLabel(charWithLabels, 'play') === 'Session', 'getPillarLabel reads flat pillar_ fallback');
  ok(F.getPillarLabel(charWithLabels, 'plus') === 'Plus', 'getPillarLabel capitalizes uncustomized key');

  const presets = F.cortexSetPresets;
  ok(presets && presets['scene-traits'] && presets['session-notes'] && presets['crisis-pool'] && presets['micro-gmc'], '4 built-in set presets exist');
  const inst = F.instantiateSetPreset(presets['scene-traits'], { traitSets: [] }, 1);
  ok(inst && inst.name === 'Scene Traits' && inst.view.pillar === 'play' && inst.view.visibility === 'play-only' && inst.view.playMutable === true, 'instantiateSetPreset clones and assigns id');
}

console.log(`functions-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
