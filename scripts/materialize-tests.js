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

const getDice = (t) => (Array.isArray(t.dice) && t.dice.length ? t.dice : (typeof t.value === 'number' && t.value > 0 ? [t.value] : []));
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
  ok(strength && strength.value === 8 && (!strength.dice || strength.dice.length === 0), 'Strength folds to value 8', strength);
  const halfOrc = byName(byName(render.traitSets, 'Distinctions').traits, 'Half-Orc');
  ok(halfOrc && Array.isArray(halfOrc.sfx) && halfOrc.sfx.includes('hinder'), 'Half-Orc Hinder restored as sfx literal', halfOrc && halfOrc.sfx);
  const ath = byName(byName(render.traitSets, 'Skills').traits, 'Athletics');
  ok(ath && ath.value === 6 && ath.traits && named(ath.traits).includes('Jump'), 'Athletics sub-trait map folds back', ath && { v: ath.value, subs: named(ath.traits) });
}

// ---- 4. render -> layered -> render is an exact, lossless codec.
{
  const back = materializeCharacter(toLayeredEntity(cortex), cortex);
  const a = JSON.parse(JSON.stringify(cortex));
  const b = JSON.parse(JSON.stringify(back));
  delete a.isTemplate; delete b.isTemplate; // normalized to a boolean on the render shape
  ok(JSON.stringify(a) === JSON.stringify(b), 'toLayeredEntity round-trips the source exactly');
}

// ---- 5. per-entity presentation overrides survive the codec.
{
  const ov = JSON.parse(JSON.stringify(cortex));
  ov.traitSets[0].custom.cortexToolkit.style.body = 'zzz-body';
  ov.traitSets[0].nounSingular = 'ZZZ NOUN';
  const back = materializeCharacter(toLayeredEntity(ov), cortex);
  ok((back.traitSets[0].view?.style?.body || back.traitSets[0].custom?.cortexToolkit?.style?.body) === 'zzz-body', 'set style override survives', back.traitSets[0].custom?.cortexToolkit?.style?.body);
  ok(back.traitSets[0].nounSingular === 'ZZZ NOUN', 'set noun override survives', back.traitSets[0].nounSingular);
  ok(JSON.stringify(back.traitSets[0].traits) === JSON.stringify(ov.traitSets[0].traits), 'traits unchanged alongside override');
}

// ---- 5b. per-entity view presentation overrides survive the codec.
{
  const ov = JSON.parse(JSON.stringify(cortex));
  delete ov.traitSets[0].custom;
  ov.traitSets[0].view = { style: { header: 'default', body: 'view-body' } };
  ov.traitSets[0].nounSingular = 'VIEW NOUN';
  const back = materializeCharacter(toLayeredEntity(ov), cortex);
  ok(back.traitSets[0].view && back.traitSets[0].view.style.body === 'view-body', 'view set style override survives', back.traitSets[0].view?.style?.body);
  ok(back.traitSets[0].nounSingular === 'VIEW NOUN', 'set noun override survives', back.traitSets[0].nounSingular);
}

// ---- 6. unrated (value 0) round-trips as 0, not null.
{
  const ch = JSON.parse(JSON.stringify(cortex));
  const tr = ch.traitSets[0].traits[0];
  tr.value = 0; tr.dice = [];
  const back = materializeCharacter(toLayeredEntity(ch), cortex);
  ok(back.traitSets[0].traits[0].value === 0 && (!back.traitSets[0].traits[0].dice || back.traitSets[0].traits[0].dice.length === 0), 'unrated round-trips to value 0', back.traitSets[0].traits[0]);
}

// ---- 7. place and parts round-trip untouched through the codec.
{
  const ch = JSON.parse(JSON.stringify(cortex));
  ch.traitSets[0].view = {
    ...(ch.traitSets[0].view || {}),
    place: { left: '30%', top: 2, width: '60%', height: 1 },
    parts: { name: { left: '0%', top: 0, width: '70%', height: 1 }, rating: { left: '70%', top: 0, width: '30%', height: 1 } },
  };
  const back = materializeCharacter(toLayeredEntity(ch), cortex);
  ok(JSON.stringify(back.traitSets[0].view.place) === JSON.stringify({ left: '30%', top: 2, width: '60%', height: 1 }), 'place survives', back.traitSets[0].view.place);
  ok(JSON.stringify(back.traitSets[0].view.parts) === JSON.stringify(ch.traitSets[0].view.parts), 'parts survive', back.traitSets[0].view.parts);
  // An unrelated edit (trait rename) leaves coordinates alone.
  back.traitSets[0].traits[0].name = 'RENAMED';
  const back2 = materializeCharacter(toLayeredEntity(back), cortex);
  ok(JSON.stringify(back2.traitSets[0].view.place) === JSON.stringify({ left: '30%', top: 2, width: '60%', height: 1 }), 'place untouched by unrelated edit');
  ok(JSON.stringify(back2.traitSets[0].view.parts) === JSON.stringify(ch.traitSets[0].view.parts), 'parts untouched by unrelated edit');
}

console.log(`materialize-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
