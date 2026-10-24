// Materializer regression tests (render seam: layered entity -> render array).
// Usage: node scripts/materialize-tests.js  (exit 1 on failure)
const fs = require('fs');
const path = require('path');
const M = require('../js/migration.ts').cortexMigration;
const { materializeCharacter, toLayeredEntity } = require('../js/layered-materialize.ts');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

const root = path.join(__dirname, '..');
const cortex = JSON.parse(fs.readFileSync(path.join(root, 'data/templates/Sendak_Eggers.cortex.json'), 'utf8'));
const layered = JSON.parse(fs.readFileSync(path.join(root, 'data/templates/Sendak_Eggers.layered.json'), 'utf8'));

const getDice = (t) => {
  const r = t && typeof t === 'object' ? t.rating : undefined;
  if (r && typeof r === 'object' && !Array.isArray(r) && Array.isArray(r.value)) {
    const nums = r.value.filter((x) => typeof x === 'number' && x > 0);
    if (nums.length) return nums;
  }
  return (Array.isArray(t.dice) && t.dice.length ? t.dice : (typeof t.value === 'number' && t.value > 0 ? [t.value] : []));
};
const byName = (arr, n) => (Array.isArray(arr) ? arr.find((x) => x && x.name === n) : undefined);
const named = (arr) => (Array.isArray(arr) ? arr.filter((x) => x && typeof x.name === 'string' && x.name.length).map((x) => x.name) : []);

function compareRender(render, label) {
  ok(render && Array.isArray(render.traitSets), label + ': renders traitSets');
  ok(JSON.stringify(render.traitSets.map((s) => s.name)) === JSON.stringify(cortex.traitSets.map((s) => s.name)),
    label + ': set names + order match', render.traitSets.map((s) => s.name));

  for (const os of cortex.traitSets) {
    const rs = byName(render.traitSets, os.name);
    ok(!!rs, label + ': set present ' + os.name);
    if (!rs) continue;
    // presentation kept from template
    ok(!!(rs.view || (rs.custom && rs.custom.cortexToolkit)), label + ': presentation kept ' + os.name);
    ok(rs.nounSingular === os.nounSingular, label + ': noun kept ' + os.name);
    // every original named trait survives with the same dice
    for (const ot of os.traits) {
      if (!ot || typeof ot.name !== 'string' || !ot.name.length) continue;
      const rt = byName(rs.traits, ot.name);
      ok(!!rt, label + ': trait present ' + os.name + '/' + ot.name);
      if (!rt) continue;
      ok(JSON.stringify(getDice(rt)) === JSON.stringify(getDice(ot)),
        label + ': dice kept ' + os.name + '/' + ot.name, { got: getDice(rt), want: getDice(ot) });
      ok(JSON.stringify(named(rt.traits)) === JSON.stringify(named(ot.traits)),
        label + ': subtraits kept ' + os.name + '/' + ot.name, named(rt.traits));
      const f = (x) => (Array.isArray(x.sfx) ? x.sfx.length : 0);
      ok(f(rt) === f(ot), label + ': sfx count kept ' + os.name + '/' + ot.name, { got: f(rt), want: f(ot) });
    }
  }
}

// ---- 1. migrate the array source, then materialize with the source as presentation.
{
  const { data } = M.migrateCharacter(cortex);
  compareRender(materializeCharacter(data, cortex), 'migrate->materialize');
}

// ---- 2. the committed layered reference materializes to the same render.
{
  compareRender(materializeCharacter(layered, cortex), 'layered-ref');
}

// ---- 3. specific spot checks (content survived the fold).
{
  const render = materializeCharacter(M.migrateCharacter(cortex).data, cortex);
  const strength = byName(byName(render.traitSets, 'Attributes').traits, 'Strength');
  ok(strength && strength.rating && strength.rating.type === 'Die' && JSON.stringify(strength.rating.value) === '[8]' &&
    strength.value === undefined && strength.dice === undefined, 'Strength folds to a Die rating', strength.rating);
  const halfOrc = byName(byName(render.traitSets, 'Distinctions').traits, 'Half-Orc');
  ok(halfOrc && Array.isArray(halfOrc.sfx) && halfOrc.sfx.includes('hinder'), 'Half-Orc Hinder restored as sfx literal', halfOrc && halfOrc.sfx);
  const ath = byName(byName(render.traitSets, 'Skills').traits, 'Athletics');
  ok(ath && ath.rating && JSON.stringify(ath.rating.value) === '[6]' && ath.traits && named(ath.traits).includes('Jump'), 'Athletics sub-trait map folds back', ath && { v: ath.rating, subs: named(ath.traits) });
}

// ---- 4. render -> layered -> render is an exact, lossless codec (over
// the normalized shape: legacy value/dice enter canonical ratings once).
{
  const src = JSON.parse(JSON.stringify(cortex));
  M.normalizeView(src);
  const back = materializeCharacter(toLayeredEntity(src), src);
  const a = JSON.parse(JSON.stringify(src));
  const b = JSON.parse(JSON.stringify(back));
  delete a.isTemplate; delete b.isTemplate; // normalized to a boolean on the render shape
  ok(JSON.stringify(a) === JSON.stringify(b), 'toLayeredEntity round-trips the normalized source exactly');
}

// ---- 5. per-entity presentation overrides survive the codec.
{
  const ov = JSON.parse(JSON.stringify(cortex));
  M.normalizeView(ov);
  const ovView = ov.traitSets[0].view || (ov.traitSets[0].custom && ov.traitSets[0].custom.cortexToolkit) || {};
  ovView.style = ovView.style || {};
  ovView.style.body = 'zzz-body';
  if (!ov.traitSets[0].view) ov.traitSets[0].view = ovView;
  ov.traitSets[0].noun = 'ZZZ NOUN';
  const back = materializeCharacter(toLayeredEntity(ov), ov);
  ok((back.traitSets[0].view?.style?.body || back.traitSets[0].custom?.cortexToolkit?.style?.body) === 'zzz-body', 'set style override survives', back.traitSets[0].view?.style?.body);
  ok(back.traitSets[0].noun === 'ZZZ NOUN', 'set noun override survives', back.traitSets[0].noun);
  ok(JSON.stringify(back.traitSets[0].traits) === JSON.stringify(ov.traitSets[0].traits), 'traits unchanged alongside override');
}

// ---- 5b. per-entity view presentation overrides survive the codec.
{
  const ov = JSON.parse(JSON.stringify(cortex));
  M.normalizeView(ov);
  delete ov.traitSets[0].custom;
  ov.traitSets[0].view = { style: { header: 'default', body: 'view-body' } };
  ov.traitSets[0].noun = 'VIEW NOUN';
  const back = materializeCharacter(toLayeredEntity(ov), ov);
  ok(back.traitSets[0].view && back.traitSets[0].view.style.body === 'view-body', 'view set style override survives', back.traitSets[0].view?.style?.body);
  ok(back.traitSets[0].noun === 'VIEW NOUN', 'set noun override survives', back.traitSets[0].noun);
}

// ---- 6. unrated (no rating) round-trips rating-free, not null.
{
  const ch = JSON.parse(JSON.stringify(cortex));
  M.normalizeView(ch);
  const dis = ch.traitSets.find((s) => s.name === 'Distinctions');
  const tr = dis.traits[0];
  delete tr.rating;
  const back = materializeCharacter(toLayeredEntity(ch), ch);
  const backDis = back.traitSets.find((s) => s.name === 'Distinctions');
  ok(backDis.traits[0].rating === undefined && backDis.traits[0].value === undefined, 'unrated round-trips rating-free', backDis.traits[0]);
}

// ---- 7. place and parts round-trip untouched through the codec.
{
  const ch = JSON.parse(JSON.stringify(cortex));
  M.normalizeView(ch);
  const dis = ch.traitSets.find((s) => s.name === 'Distinctions');
  dis.view = {
    ...(dis.view || {}),
    place: { left: '30%', top: 2, width: '60%', height: 1 },
    parts: { name: { left: '0%', top: 0, width: '70%', height: 1 }, rating: { left: '70%', top: 0, width: '30%', height: 1 } },
  };
  const back = materializeCharacter(toLayeredEntity(ch), cortex);
  const backDis = back.traitSets.find((s) => s.name === 'Distinctions');
  ok(JSON.stringify(backDis.view.place) === JSON.stringify({ left: '30%', top: 2, width: '60%', height: 1 }), 'place survives', backDis.view.place);
  ok(JSON.stringify(backDis.view.parts) === JSON.stringify(dis.view.parts), 'parts survive', backDis.view.parts);
  // An unrelated edit (trait rename) leaves coordinates alone.
  backDis.traits[0].name = 'RENAMED';
  const back2 = materializeCharacter(toLayeredEntity(back), cortex);
  const back2Dis = back2.traitSets.find((s) => s.name === 'Distinctions');
  ok(JSON.stringify(back2Dis.view.place) === JSON.stringify({ left: '30%', top: 2, width: '60%', height: 1 }), 'place untouched by unrelated edit');
  ok(JSON.stringify(back2Dis.view.parts) === JSON.stringify(dis.view.parts), 'parts untouched by unrelated edit');
}

console.log(`materialize-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
