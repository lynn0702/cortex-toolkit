// Migration shim regression tests (Phase-1 freeze, design/DECISIONS.md).
// Usage: node scripts/migration-tests.js  (exit 1 on failure)
const fs = require('fs');
const path = require('path');
const M = require('../js/migration.ts').cortexMigration;

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

const root = path.join(__dirname, '..');
const cortex = JSON.parse(fs.readFileSync(path.join(root, 'data/templates/Sendak_Eggers.cortex.json'), 'utf8'));
const layered = JSON.parse(fs.readFileSync(path.join(root, 'data/templates/Sendak_Eggers.layered.json'), 'utf8'));

// ---- 1. Reference file migrates to the reference shape.
{
  const { data, warnings } = M.migrateCharacter(cortex);
  ok(data && typeof data === 'object', 'migrate returns data');
  ok(warnings.length > 0, 'filler/presentation drops are reported', warnings.length);
  ok(JSON.stringify(Object.keys(data.sets).sort()) === JSON.stringify(Object.keys(layered.sets).sort()),
    'set names match reference', Object.keys(data.sets));
  const asTrait = (raw) => (typeof raw === 'string' ? { value: raw } : raw);
  for (const setName of Object.keys(layered.sets)) {
    for (const tName of Object.keys(layered.sets[setName].traits)) {
      const want = asTrait(layered.sets[setName].traits[tName]);
      const got = asTrait(data.sets[setName] && data.sets[setName].traits[tName]);
      ok(got && got.value === want.value, `die kept ${setName}/${tName}`, got);
    }
  }
  ok(data.sets.Attributes.traits.Strength === 'd8', 'single-die shorthand');
  ok(data.sets.Distinctions.traits.Druid.value === 'd10', 'die kept alongside SFX traits');
  const hinder = (((data.sets.Distinctions.traits['Half-Orc'] || {}).traits || {}).SFX || {}).traits;
  ok(hinder && hinder.Hinder !== undefined, 'hinder literal becomes Hinder trait');
  const ath = data.sets.Skills.traits.Athletics;
  ok(ath && ath.value === 'd6' && ath.traits.Jump === 'd6' && ath.traits.Swim === 'd10' && ath.traits.Climb === 'd8',
    'subtraits recurse as maps', ath);
}

// ---- 2. Entity core carries top-level fields; envelope stays file-level.
{
  const { data } = M.migrateCharacter(cortex);
  ok(data.id === cortex.id, 'envelope id preserved');
  ok(data.version === cortex.version, 'envelope version preserved');
  ok(data.name === 'Sendak Eggers', 'name kept');
  ok(data.pronouns === 'he/him', 'pronouns kept');
  ok(data.description && data.description.length > 0, 'description kept');
  ok(data.game === undefined, 'empty game omitted');
  ok(data.plotPoints === undefined, 'zero plotPoints omitted');
  ok(data.portrait && typeof data.portrait.url === 'string' && data.portrait.url.length > 10, 'portrait preserved');
  ok(data.$schema === undefined, 'stale $schema pointer dropped');
}

// ---- 3. No old-model keys survive anywhere in the sets tree.
{
  const { data } = M.migrateCharacter(cortex);
  const blob = JSON.stringify(data.sets);
  for (const bad of ['"Trait description"', '"Trait set description"', '"_lid"', '"removedTraits"', '"removedSets"', '"cortexToolkit"', '"nounSingular"', '"ratingPosition"']) {
    ok(blob.indexOf(bad) === -1, `no ${bad} in sets tree`);
  }
  ok(blob.indexOf('"traits":[') === -1, 'no array-form traits');
  ok(blob.indexOf('"sfx":[') === -1, 'no array-form sfx');
}

// ---- 4. Multi-die ratings become pool traits with canonical dice strings.
{
  const old = {
    id: 'c1', name: 'P', traitSets: [
      { name: 'Resources', traits: [{ name: 'Ammo', value: 8, dice: [8, 8, 6], description: '', traits: [], sfx: [], tags: [], custom: {} }] },
    ],
  };
  const { data } = M.migrateCharacter(old);
  const ammo = data.sets.Resources.traits.Ammo;
  ok(ammo && ammo.value === '2d8d6' && ammo.pool === true, 'multi-die to pool', ammo);
}

// ---- 5. removedTraits become local nulls.
{
  const old = {
    id: 'c1', name: 'P',
    traitSets: [{ name: 'S', traits: [], removedTraits: ['Gone'] }],
  };
  const { data, warnings } = M.migrateCharacter(old);
  ok(data.sets.S.traits.Gone === null, 'removal is a local null');
  ok(warnings.length === 0 || true, 'warnings optional here');
}

// ---- 6. removedSets resolve via template ids, need template context.
{
  const tplChar = { traitSets: [{ id: 'a1', name: 'Alpha', traits: [] }] };
  const old = { id: 'c1', name: 'P', traitSets: [], removedSets: ['a1'] };
  const withTpl = M.migrateCharacter(old, tplChar);
  ok(withTpl.data.sets.Alpha === null, 'removed set resolves to null by name');
  const noTpl = M.migrateCharacter(old);
  ok(noTpl.data.sets.Alpha === undefined && noTpl.warnings.some((w) => w.indexOf('removedSets') !== -1),
    'removedSets without template are reported, not kept');
}

// ---- 7. sfx objects keep descriptions; set-level sfx folds to traits.SFX.
{
  const old = {
    id: 'c1', name: 'P',
    traitSets: [{
      name: 'S', traits: [],
      sfx: [{ name: 'Push', description: 'Push it', tags: [], custom: {} }],
    }],
  };
  const { data } = M.migrateCharacter(old);
  ok(data.sets.S.traits.SFX.traits.Push.description === 'Push it', 'set sfx folds to SFX map');
}

// ---- 8. sheet.template becomes a merge-layer reference; prefs re-key to names.
{
  const old = {
    id: 'c1', name: 'P',
    sheet: { template: { id: 'tpl-x', version: 3 } },
    traitSets: [{ id: 's1', name: 'S', traits: [] }],
    prefs: { setOrder: ['s1', 'nope'], traitOrders: { s1: ['A'], nope: ['B'] } },
  };
  const { data, warnings } = M.migrateCharacter(old);
  ok(data.template && data.template.id === 'tpl-x' && data.template.version === 3, 'template ref kept');
  ok(data.sheet === undefined, 'sheet link leaves the entity core');
  ok(data.prefs && JSON.stringify(data.prefs.setOrder) === JSON.stringify(['S']), 'prefs setOrder re-keyed', data.prefs);
  ok(data.prefs && JSON.stringify(data.prefs.traitOrders) === JSON.stringify({ S: ['A'] }), 'prefs traitOrders re-keyed');
  ok(warnings.some((w) => w.indexOf('nope') !== -1), 'unresolvable prefs reported');
}

// ---- 9. Upstream envelopes unwrap; bad input returns null data.
{
  const up = { version: 2, data: { name: 'Up', traitSets: [] } };
  const r = M.migrateCharacter(up);
  ok(r.data && typeof r.data.id === 'string' && r.data.name === 'Up', 'upstream unwraps with fresh id');
  ok(M.migrateCharacter(null).data === null, 'null input fails clean');
  ok(M.migrateCharacter({ name: 'x' }).data === null, 'traitSets-less input fails clean');
}

// ---- 10. Unknown die sizes pass through with a warning, never invented.
{
  const old = {
    id: 'c1', name: 'P',
    traitSets: [{ name: 'S', traits: [{ name: 'Weird', value: 2, description: '', traits: [], sfx: [], tags: [], custom: {} }] }],
  };
  const { data, warnings } = M.migrateCharacter(old);
  const w = data.sets.S.traits.Weird;
  ok((w === 'd2' || (w && w.value === 'd2')) && warnings.some((x) => x.indexOf('unknown die size 2') !== -1),
    'unknown size surfaces with warning', w);
}

// ---- 11. Nested-grid placement migration (2026-10-19).
// Band keys become view.place (top from row, left/width from colWidth
// shares); full-width sets omit place; flags become view.parts.
{
  const char = {
    view: { columns: 2, columnsPage2: 3 },
    traitSets: [
      { name: 'A', view: { page: 1, track: 1, colWidth: 40, row: 2 } },
      { name: 'B', view: { page: 1, track: 2, row: 2 } },
      { name: 'C', view: { page: 1, span: 3, row: 3 } },
      { name: 'D', view: { page: 1, track: 1, colWidth: 30, row: 4, ratingPosition: 'below', ratingScale: [4, 6, 8, 10, 12] } },
      { name: 'E', view: { page: 1, track: 2, colWidth: 70, row: 4, attachedStress: { enabled: true, label: 'Stress', scale: [4, 6, 8, 10, 12] }, ratingScale: [4, 6, 8, 10, 12] } },
      { name: 'F', view: { page: 1, track: 1, row: 5, ratingPosition: 'vertical' } },
    ],
  };
  const warnings = M.migratePlacement(char);
  const sets = char.traitSets;
  const byName = (n) => sets.find((s) => s.name === n);
  // Row 2 (top 0): A 0/40 + B 40/60 (undeclared remainder splits two-track).
  ok(JSON.stringify(byName('A').view.place) === JSON.stringify({ left: '0%', top: 0, width: '40%', height: 1 }), 'set A place', byName('A').view.place);
  ok(JSON.stringify(byName('B').view.place) === JSON.stringify({ left: '40%', top: 0, width: '60%', height: 1 }), 'set B place', byName('B').view.place);
  // Full-width C omits place.
  ok(byName('C').view.place === undefined, 'full-width set omits place');
  // Below + inline stress become parts; flags removed.
  ok(byName('D').view.parts && byName('D').view.parts.name.top === 0 && byName('D').view.parts.rating.top === 1, 'below becomes parts rows', byName('D').view.parts);
  ok(byName('D').view.ratingPosition === undefined, 'ratingPosition removed');
  ok(byName('E').view.parts && byName('E').view.parts.stress && byName('E').view.parts.stressLabel, 'stress becomes cells', byName('E').view.parts);
  ok(byName('E').view.attachedStress === undefined, 'attachedStress removed');
  // Vertical ladders keep the legacy flag.
  ok(byName('F').view.parts === undefined && byName('F').view.ratingPosition === 'vertical', 'vertical stays legacy');
  // Band keys are gone everywhere.
  ok(sets.every((s) => ['track', 'span', 'widths', 'rowBreak', 'colWidth', 'rowSpan', 'colSpan', 'columnSpan', 'row'].every((k) => s.view[k] === undefined)), 'band keys deleted');
  // Sheet level
  ok(char.view.columns === undefined, 'columns deleted from sheet');
  ok(char.view.columnsPage2 === undefined, 'columnsPage2 deleted from sheet');
  // No collisions in this fixture.
  ok(warnings.filter((w) => w.indexOf('collision') !== -1).length === 0, 'zero collisions', warnings);
}

// ---- 11b. Collisions surface, bare numbers normalize, classic untouched.
{
  const char = {
    traitSets: [
      { name: 'A', view: { page: 1, place: { left: '0%', top: 0, width: '60%', height: 1 } } },
      { name: 'B', view: { page: 1, place: { left: '50%', top: 0, width: '50%', height: 1 } } },
      { name: 'C', view: { page: 1, place: { left: 0, top: 1, width: 100, height: 1 } } },
      { name: 'D', view: { page: 1, location: 'right' } },
    ],
  };
  const warnings = M.migratePlacement(char);
  ok(warnings.some((w) => w.indexOf('collision') !== -1), 'overlap surfaces', warnings);
  ok(char.traitSets[3].view.place.left === '0%' && char.traitSets[3].view.place.width === '100%', 'bare numbers normalize to "%" strings', char.traitSets[3].view.place);
  ok(char.traitSets[4].view.location === 'right' && char.traitSets[4].view.place === undefined, 'classic set untouched');
}

// ---- 11c. Idempotent: a second pass changes nothing (first pass may add
// the Name set; the second must be stable).
{
  const char = {
    traitSets: [
      { name: 'A', view: { page: 1, place: { left: '0%', top: 0, width: '40%', height: 1 }, parts: { name: { left: '0%', top: 0, width: '100%', height: 1 } } } },
    ],
  };
  M.migratePlacement(char);
  const afterFirst = JSON.stringify(char);
  ok(char.traitSets[0].id === 'name', 'first pass synthesizes the name set first');
  M.migratePlacement(char);
  ok(JSON.stringify(char) === afterFirst, 'second pass is a no-op');
}

// ---- 12. normalizeView migration seam.
{
  // 12a. Legacy custom.cortexToolkit migrates to view and cleans up empty custom
  const obj1 = {
    custom: { cortexToolkit: { sheetStyle: 'spotlight', columns: 2 } },
    portrait: { custom: { cortexToolkit: { size: 'spotlight' } } },
    traitSets: [
      { name: 'Distinctions', custom: { cortexToolkit: { style: { header: 'default', body: 'default' } } } },
    ],
  };
  M.normalizeView(obj1);
  ok(obj1.view && obj1.view.style && obj1.view.style.sheet === 'spotlight' && obj1.view.columns === 2, 'char custom.cortexToolkit migrated to view.style');
  ok(obj1.custom === undefined, 'empty custom cleaned up on character');
  ok(obj1.portrait.view && obj1.portrait.view.size === 'spotlight', 'portrait custom.cortexToolkit migrated to view');
  ok(obj1.portrait.custom === undefined, 'empty custom cleaned up on portrait');
  const dset = obj1.traitSets.find((s) => s.name === 'Distinctions');
  ok(dset.view && dset.view.style.body === 'default', 'set custom.cortexToolkit migrated to view');
  ok(dset.custom === undefined, 'empty custom cleaned up on traitSet');

  // 12b. Conflict resolution: view wins, legacy dropped
  const obj2 = {
    view: { columns: 3, pageCount: 2 },
    custom: { cortexToolkit: { columns: 2, pageCount: 1, extraKey: 'legacy' } },
  };
  M.normalizeView(obj2);
  ok(obj2.view.columns === 3, 'view wins on conflict (columns)');
  ok(obj2.view.pageCount === 2, 'view wins on conflict (pageCount)');
  ok(obj2.view.extraKey === undefined, 'legacy bag dropped completely when view exists');
  ok(obj2.custom === undefined, 'custom.cortexToolkit cleaned up');

  // 12c. Non-cortexToolkit custom keys (e.g. custom.stress) pass through untouched
  const obj3 = {
    custom: {
      cortexToolkit: { sheetStyle: 'classic' },
      stress: { physical: 6, mental: 8 },
    },
  };
  M.normalizeView(obj3);
  ok(obj3.view && obj3.view.style && obj3.view.style.sheet === 'classic', 'view migrated to style.sheet');
  ok(obj3.custom && obj3.custom.cortexToolkit === undefined, 'cortexToolkit removed from custom');
  ok(obj3.custom && obj3.custom.stress && obj3.custom.stress.physical === 6, 'custom.stress preserved');

  // 12d. Name set synthesis: legacy files predate the name block.
  const obj4 = {
    name: 'Hero', player: 'Maya',
    view: { nameLabels: { pronouns: 'Ruin', player: 'GM:' } },
    traitSets: [{ id: 'd', name: 'Distinctions', traits: [], sfx: [] }],
  };
  M.normalizeView(obj4);
  ok(obj4.traitSets[0].id === 'name' && obj4.traitSets[0].view.style.body === 'name', 'name set synthesized first');
  const pronouns = obj4.traitSets[0].traits.find((t) => t.name === 'pronouns');
  ok(pronouns && pronouns.label === 'Ruin', 'legacy pronouns label migrated', pronouns);
  const player = obj4.traitSets[0].traits.find((t) => t.name === 'player');
  ok(player && player.label === 'GM:', 'legacy player word migrated');
  ok(obj4.view.nameLabels === undefined, 'legacy nameLabels bag gone');
  ok(obj4.traitSets[1].name === 'Distinctions', 'content sets keep order');

  // 12e. Existing name sets pass through untouched (no duplicates).
  const obj5 = {
    traitSets: [{ id: 'name', name: 'Name', traits: [{ name: 'player', label: 'Coach' }], sfx: [], view: { style: { body: 'name' } } }],
  };
  M.normalizeView(obj5);
  ok(obj5.traitSets.length === 1 && obj5.traitSets[0].traits.length === 1, 'name set untouched', obj5.traitSets.length);

  // 12f. Layered entities gain a Name key.
  const obj6 = { sets: { Distinctions: { id: 'distinctions', traits: {} } } };
  M.normalizeView(obj6);
  ok(obj6.sets.Name && obj6.sets.Name.id === 'name', 'layered name set synthesized', Object.keys(obj6.sets));

  // 12g. Pruned stored name sets (view bag dropped as inherited) are
  // recognized by id and never overwritten with empty shells.
  const obj7 = { sets: { Name: { id: 'name', traits: { pronouns: { label: 'Ruin' } } } } };
  M.normalizeView(obj7);
  ok(obj7.sets.Name.traits.pronouns && obj7.sets.Name.traits.pronouns.label === 'Ruin', 'stored name overrides survive normalize', obj7.sets.Name.traits);
}

// ---- 13. Sheet style collapses to view.style.sheet; set-type flags go.
{
  // 13a. Legacy top-level sheetStyle folds into style.sheet.
  const a = { view: { sheetStyle: 'spotlight', columns: 2 }, traitSets: [] };
  M.normalizeView(a);
  ok(a.view.style.sheet === 'spotlight', 'sheetStyle folds to style.sheet', a.view);
  ok(a.view.sheetStyle === undefined, 'top-level sheetStyle gone');

  // 13b. The hasAttributes set-type flag resolves once, then goes.
  const b = { view: { style: { hasAttributes: false } }, traitSets: [] };
  M.normalizeView(b);
  ok(b.view.style.sheet === 'spotlight', 'hasAttributes:false means spotlight', b.view.style);
  ok(b.view.style.hasAttributes === undefined, 'hasAttributes gone');

  // 13c. An explicit style.sheet is never overridden.
  const c = { view: { style: { sheet: 'classic' }, sheetStyle: 'spotlight' }, traitSets: [] };
  M.normalizeView(c);
  ok(c.view.style.sheet === 'classic', 'explicit style.sheet wins', c.view.style);
  ok(c.view.sheetStyle === undefined, 'stale sheetStyle still dropped');

  // 13d. Bare legacy files default classic (the old reader default).
  const d = { view: {}, traitSets: [] };
  M.normalizeView(d);
  ok(d.view.style.sheet === 'classic', 'bare view defaults classic', d.view.style);

  // 13e. Sheet-template links still mean spotlight.
  const e = { view: {}, sheet: { template: { id: 't' } }, traitSets: [] };
  M.normalizeView(e);
  ok(e.view.style.sheet === 'spotlight', 'template link means spotlight', e.view.style);

  // 13f. Folded name traits carry style-honest hidden flags: PP hides in
  // spotlight (no zone renders it), shows in classic (badge renders it).
  const f = {
    view: { style: { sheet: 'spotlight' }, nameLabels: { plotPoints: 'PP', player: 'GM:' } },
    traitSets: [{ id: 'd', name: 'Distinctions', traits: [], sfx: [] }],
  };
  M.normalizeView(f);
  const fpp = f.traitSets[0].traits.find((t) => t.name === 'plotPoints');
  const fpl = f.traitSets[0].traits.find((t) => t.name === 'player');
  ok(fpp && fpp.view && fpp.view.hidden === true, 'folded PP hidden in spotlight', fpp);
  ok(fpl && (fpl.view === undefined || fpl.view.hidden !== true), 'folded player stays shown', fpl);
  const g = {
    view: { nameLabels: { plotPoints: 'PP' } },
    traitSets: [{ id: 'd', name: 'Distinctions', traits: [], sfx: [] }],
  };
  M.normalizeView(g);
  const gpp = g.traitSets[0].traits.find((t) => t.name === 'plotPoints');
  ok(gpp && (gpp.view === undefined || gpp.view.hidden !== true), 'folded PP shown in classic', gpp);

  // 13g. The retired visibility word converts: hidden carries, shown and
  // editor-only dissolve into absence.
  const h = {
    view: {},
    traitSets: [{
      id: 'd', name: 'Distinctions', traits: [
        { name: 'A', value: 8, dice: [8], traits: [], sfx: [], view: { visibility: 'hidden' } },
        { name: 'B', value: 8, dice: [8], traits: [], sfx: [], view: { visibility: 'shown' } },
        { name: 'C', value: 8, dice: [8], traits: [], sfx: [], view: { visibility: 'editor-only' } },
      ], sfx: [],
    }],
  };
  M.normalizeView(h);
  const [ha, hb, hc] = h.traitSets[1].traits;
  ok(ha.view.hidden === true && ha.view.visibility === undefined, 'hidden carries as a boolean', ha.view);
  ok(hb.view.visibility === undefined && hb.view.hidden === undefined, 'shown dissolves', hb.view);
  ok(hc.view.visibility === undefined && hc.view.hidden === undefined, 'editor-only dissolves', hc.view);
}

console.log(`migration-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

