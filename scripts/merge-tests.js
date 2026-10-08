// Merge/pruner regression tests (decision brief D3/D4/D6 + reservedSlots).
// Usage: node scripts/merge-tests.js  (exit 1 on failure)
const F = require('../js/functions.js');
const storage = require('../js/storage.js');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return F.deepEqualClean(a, b); }

// ---- Fixtures: template entry (character-shaped blank) + sparse character.
function tpl() {
  return {
    id: 'test-template', title: 'Test', version: 1,
    character: {
      id: 'tpl-char', name: '', game: 'Test Game',
      custom: { cortexToolkit: { columns: 2, sheetStyle: 'spotlight' } },
      traitSets: [
        {
          id: 'distinctions', name: 'Distinctions', description: '', nounSingular: 'Distinction', nounPlural: 'Distinctions',
          traits: [
            { name: 'Heritage', value: 8, dice: [8], description: 'Bold lineage', traits: [], sfx: ['hinder'], tags: [], custom: {} },
            { name: '', value: 0, dice: [], description: '', traits: [], sfx: [], tags: [], custom: {} },
            { name: '', value: 0, dice: [], description: '', traits: [], sfx: [], tags: [], custom: {} },
          ],
          sfx: [], tags: [],
          custom: { cortexToolkit: { location: 'left', style: { header: 'distinctions', body: 'distinctions' }, reservedSlots: 3 } },
        },
        {
          id: 'attributes', name: 'Attributes', description: '', nounSingular: 'Attribute', nounPlural: 'Attributes',
          traits: [
            { name: 'Physical', value: 8, dice: [8], description: '', traits: [{ name: 'Lifting', value: 6, dice: [6], description: '', traits: [], sfx: [], tags: [], custom: {} }], sfx: [], tags: [], custom: {} },
          ],
          sfx: [], tags: [],
          custom: { cortexToolkit: { location: 'right' } },
        },
      ],
    },
  };
}

// ---- D3 three-state at scalar + nested level.
{
  const m = F.mergeTemplateIntoCharacter({ id: 'c1', game: 'My Game', custom: { cortexToolkit: { columns: 3 } }, traitSets: [] }, tpl());
  ok(m.game === 'My Game', 'D3 value wins (game)');
  ok(m.custom.cortexToolkit.columns === 3, 'D3 value wins (nested columns)');
  ok(m.custom.cortexToolkit.sheetStyle === 'spotlight', 'D3 absent inherits (sheetStyle)');
  const m2 = F.mergeTemplateIntoCharacter({ id: 'c1', game: null, traitSets: [] }, tpl());
  ok(m2.game === null, 'D3 null stays cleared (no inherit)');
  const m3 = F.mergeTemplateIntoCharacter({ id: 'c1', custom: { cortexToolkit: { sheetStyle: null } }, traitSets: [] }, tpl());
  ok(m3.custom.cortexToolkit.sheetStyle === null, 'D3 null stays cleared (nested)');
}

// ---- D3 sheet link never merges (D9).
{
  const m = F.mergeTemplateIntoCharacter({ id: 'c1', sheet: { template: { id: 'test-template' } }, traitSets: [] }, tpl());
  ok(m.sheet.template.id === 'test-template' && m.sheet.template.version === 1, 'D9 sheet ref pinned, not merged');
}

// ---- D4 traits join by name; order; append; inherit (pruner-shaped sparse).
{
  const m = F.mergeTemplateIntoCharacter({
    id: 'c1',
    traitSets: [{ id: 'distinctions', traits: [{ name: 'Heritage', description: 'Edited' }, { name: '' }, { name: '' }, { name: 'Custom Made' }] }],
  }, tpl());
  const names = m.traitSets[0].traits.map((t) => t.name);
  ok(eq(names, ['Heritage', '', '', 'Custom Made']), 'D4 template order + override in place + blanks inherit + append', names);
  ok(m.traitSets[0].traits[0].description === 'Edited', 'D4 override wins in place');
  ok(m.traitSets[0].traits[0].value === 8, 'D4 sibling keys inherit');
  ok(m.traitSets[0].traits[3].value === undefined, 'D4 appended trait keeps no inherited keys');
}
// ---- Hand-compacted sparse arrays reinterpret positionally (documented).
{
  const m = F.mergeTemplateIntoCharacter({
    id: 'c1', traitSets: [{ id: 'distinctions', traits: [{ name: 'Heritage', description: 'Edited' }, { name: 'Custom Made' }] }],
  }, tpl());
  ok(eq(m.traitSets[0].traits.map((t) => t.name), ['Heritage', 'Custom Made', '']), 'compacted sparse fills positionally', m.traitSets[0].traits.map((t) => t.name));
}

// ---- Blank positional fill (pruner-shaped sparse).
{
  const m = F.mergeTemplateIntoCharacter({
    id: 'c1', traitSets: [{ id: 'distinctions', traits: [{ name: 'Heritage' }, { name: 'Destiny' }, { name: '' }] }],
  }, tpl());
  ok(eq(m.traitSets[0].traits.map((t) => t.name), ['Heritage', 'Destiny', '']), 'blank slot fill stays in place');
}

// ---- Template adds a slot later → inherited.
{
  const t2 = tpl();
  t2.character.traitSets[0].traits.push({ name: '', value: 0, dice: [], description: '', traits: [], sfx: [], tags: [], custom: {} });
  const m = F.mergeTemplateIntoCharacter({
    id: 'c1', traitSets: [{ id: 'distinctions', traits: [{ name: 'Heritage' }, { name: 'Destiny' }, { name: '' }] }],
  }, t2);
  const names = m.traitSets[0].traits.map((t) => t.name);
  ok(names.length === 4 && names[1] === 'Destiny', 'template-added slot inherited', names);
}

// ---- Rename unlinks (D7): old reappears, new appends.
{
  const m = F.mergeTemplateIntoCharacter({
    id: 'c1', traitSets: [{ id: 'distinctions', traits: [{ name: 'Heri' }] }],
  }, tpl());
  ok(eq(m.traitSets[0].traits.map((t) => t.name), ['Heritage', '', '', 'Heri']), 'D7 rename unlinks (duplication expected)', m.traitSets[0].traits.map((t) => t.name));
}

// ---- removedTraits (D6): skipped; survives; re-add clears (editor invariant simulated).
{
  const m = F.mergeTemplateIntoCharacter({
    id: 'c1', traitSets: [{ id: 'distinctions', removedTraits: ['Heritage'], traits: [] }],
  }, tpl());
  ok(!m.traitSets[0].traits.some((t) => t.name === 'Heritage'), 'D6 removed trait skipped');
  ok(eq(m.traitSets[0].removedTraits, ['Heritage']), 'D6 removal list survives merge');
}

// ---- [] clears inherited arrays.
{
  const m = F.mergeTemplateIntoCharacter({
    id: 'c1', traitSets: [{ id: 'distinctions', traits: [{ name: 'Heritage', sfx: [] }] }],
  }, tpl());
  ok(eq(m.traitSets[0].traits[0].sfx, []), '[] clears inherited sfx list');
}

// ---- sfx/tags union.
{
  const m = F.mergeTemplateIntoCharacter({
    id: 'c1', traitSets: [{ id: 'distinctions', traits: [{ name: 'Heritage', sfx: [{ name: 'Push', description: 'x', tags: [], custom: {} }] }] }],
  }, tpl());
  ok(m.traitSets[0].traits[0].sfx.length === 2, 'sfx union adds', m.traitSets[0].traits[0].sfx.length);
}

// ---- Subtrait depth: name-join + removal.
{
  const m = F.mergeTemplateIntoCharacter({
    id: 'c1',
    traitSets: [{ id: 'attributes', traits: [{ name: 'Physical', traits: [{ name: 'Lifting', value: 10 }] }] }],
  }, tpl());
  ok(m.traitSets[1].traits[0].traits[0].value === 10, 'subtrait override in place');
  const m2 = F.mergeTemplateIntoCharacter({
    id: 'c1',
    traitSets: [{ id: 'attributes', traits: [{ name: 'Physical', removedTraits: ['Lifting'], traits: [] }] }],
  }, tpl());
  ok(m2.traitSets[1].traits[0].traits.length === 0, 'subtrait removal honored');
}

// ---- Pruner: inverse; nulls preserved; join keys kept.
{
  const live = F.mergeTemplateIntoCharacter({
    id: 'c1',
    traitSets: [{ id: 'distinctions', traits: [{ name: 'Heritage', description: 'Edited' }, { name: '' }, { name: '' }, { name: 'Custom' }] }],
  }, tpl());
  const sparse = F.stripCharacterToDeltas(live, tpl());
  ok(sparse.traitSets[0].id === 'distinctions', 'pruner keeps set join key');
  const names = sparse.traitSets[0].traits.map((t) => t.name);
  ok(eq(names, ['Heritage', '', '', 'Custom']), 'pruner keeps shape, drops equal keys', names);
  ok(sparse.traitSets[0].traits[0].description === 'Edited', 'pruner keeps differing keys');
  ok(sparse.traitSets[0].traits[0].value === undefined, 'pruner drops equal keys');
  // null that differs is an override → kept
  const live2 = F.mergeTemplateIntoCharacter({
    id: 'c1', traitSets: [{ id: 'distinctions', traits: [{ name: 'Heritage', description: null }] }],
  }, tpl());
  ok(live2.traitSets[0].traits[0].description === null, 'merge keeps explicit null');
  const sparse2 = F.stripCharacterToDeltas(live2, tpl());
  ok(sparse2.traitSets[0].traits[0].description === null, 'pruner preserves differing null');
  // round-trip stability
  const again = F.mergeTemplateIntoCharacter(sparse, tpl());
  ok(eq(again, live), 'strip→merge round-trips');
}

// ---- reservedSlots: inherited, overridden, stripped when equal.
{
  const m = F.mergeTemplateIntoCharacter({ id: 'c1', traitSets: [{ id: 'distinctions' }] }, tpl());
  ok(m.traitSets[0].custom.cortexToolkit.reservedSlots === 3, 'reservedSlots inherited (print rows intact)');
  const m2 = F.mergeTemplateIntoCharacter({ id: 'c1', traitSets: [{ id: 'distinctions', custom: { cortexToolkit: { reservedSlots: 5 } } }] }, tpl());
  ok(m2.traitSets[0].custom.cortexToolkit.reservedSlots === 5, 'reservedSlots override wins');
  const s2 = F.stripCharacterToDeltas(m2, tpl());
  ok(s2.traitSets[0].custom.cortexToolkit.reservedSlots === 5, 'reservedSlots override survives strip');
  const s1 = F.stripCharacterToDeltas(m, tpl());
  ok(s1.traitSets === undefined, 'pristine sets vanish entirely (maximal sparseness)');
}

// ---- Sets join by id; template-only inherited; char-only appended whole.
{
  const m = F.mergeTemplateIntoCharacter({
    id: 'c1', traitSets: [{ id: 'custom-set', name: 'Mine', traits: [] }],
  }, tpl());
  ok(m.traitSets.length === 3, 'template sets inherited + custom appended', m.traitSets.length);
  ok(m.traitSets[2].id === 'custom-set', 'custom set appended whole');
  const m2 = F.mergeTemplateIntoCharacter({
    id: 'c1', removedSets: ['attributes'], traitSets: [],
  }, tpl());
  ok(!m2.traitSets.some((ts) => ts.id === 'attributes'), 'removedSets respected');
  ok(eq(m2.removedSets, ['attributes']), 'removedSets survives merge');
}

// ---- strip → export shape: sparse + embedded full template.
{
  const live = F.mergeTemplateIntoCharacter({
    id: 'c1', name: 'Hero', traitSets: [{ id: 'distinctions', traits: [{ name: 'Heritage', description: 'Edited' }] }],
  }, tpl());
  const out = F.stripCharacterForExport(live, tpl());
  ok(out.sheet.template.id === 'test-template' && Array.isArray(out.sheet.template.character.traitSets), 'export embeds full template');
  ok(out.traitSets[0].traits[0].description === 'Edited', 'export keeps override');
  ok(out.traitSets[0].traits[0].value === undefined, 'export drops inherited');
}

// ---- extract: static id once; never carries removals/_lid; blanks kept.
{
  const live = F.mergeTemplateIntoCharacter({
    id: 'c1', traitSets: [{ id: 'distinctions', removedTraits: ['Heritage'], traits: [{ name: '' }, { name: '' }] }],
  }, tpl());
  const e1 = F.extractSheetTemplate(live, { title: 'X' });
  const e2 = F.extractSheetTemplate(live, { id: e1.id, title: 'X' });
  ok(e1.id === e2.id && e1.id.length > 0, 'static id reused, never regenerated');
  ok(e1.character.traitSets[0].removedTraits === undefined, 'extract drops removal lists');
  ok(e1.character.traitSets[0].traits.length === 2, 'extract keeps surviving blank slots', e1.character.traitSets[0].traits.length);
  ok(e1.character.traitSets[0].traits.every((t) => F.isBlankName(t.name)), 'extracted slots are blank');
}

// ---- Legacy: no template → untouched.
{
  const ch = { id: 'legacy', name: 'Old', traitSets: [{ id: 's1', name: 'S', traits: [] }] };
  ok(eq(F.mergeTemplateIntoCharacter(ch, null), ch), 'legacy merge skipped');
  ok(eq(F.stripCharacterToDeltas(ch, null), ch), 'legacy strip untouched');
}

// ---- Store dedupe by static id.
{
  const a = tpl();
  let store = storage.upsertTemplate([], a);
  store = storage.upsertTemplate(store, JSON.parse(JSON.stringify(a)));
  ok(store.length === 1, 're-import replaces, never duplicates');
  const b = tpl(); b.title = 'Changed';
  store = storage.upsertTemplate(store, b);
  ok(store.length === 1 && store[0].title === 'Changed', 'same id updates in place');
}

// ---- sanitize: dupe names rejected; set ids ensured.
{
  ok(F.sanitizeImportedCharacter({ id: 'x', traitSets: [{ name: 'S', traits: [{ name: 'A' }, { name: 'A' }] }] }) === null, 'dupe trait names rejected');
  const c = F.sanitizeImportedCharacter({ id: 'x', traitSets: [{ name: 'S' }] });
  ok(c && typeof c.traitSets[0].id === 'string' && c.traitSets[0].id.length > 0, 'import assigns set ids');
}

// ---- _lid: assigned at rest, stripped on export, never blocks prune.
{
  const live = F.mergeTemplateIntoCharacter({ id: 'c1', traitSets: [{ id: 'distinctions', traits: [{ name: 'X' }] }] }, tpl());
  F.assignLids(live);
  ok(live.traitSets[0].traits.every((t) => typeof t._lid === 'string'), '_lids assigned');
  const lids = live.traitSets[0].traits.map((t) => t._lid);
  F.assignLids(live);
  ok(eq(live.traitSets[0].traits.map((t) => t._lid), lids), '_lids never rewritten');
  const out = F.stripCharacterForExport(live, tpl());
  let found = false;
  JSON.stringify(out, (k, v) => { if (k === '_lid') found = true; return v; });
  ok(!found, '_lid stripped on export');
}

// ---- Removal round-trip: remove → export → clean store → stays gone; re-add clears.
{
  const live = F.mergeTemplateIntoCharacter({ id: 'c1', traitSets: [{ id: 'distinctions', traits: [{ name: 'Heritage' }, { name: '' }, { name: '' }] }] }, tpl());
  F.assignLids(live);
  ok(F.removeTraitFromSheet(live, tpl(), 0, 0) === true, 'remove returns inherited=true');
  ok(!live.traitSets[0].traits.some((t) => t.name === 'Heritage'), 'removed from live');
  ok(eq(live.traitSets[0].removedTraits, ['Heritage']), 'removal remembered');
  const out = F.stripCharacterForExport(live, tpl());
  ok(eq(out.traitSets[0].removedTraits, ['Heritage']), 'removal survives export');
  const reimport = F.mergeTemplateIntoCharacter(out, tpl());
  ok(!reimport.traitSets[0].traits.some((t) => t.name === 'Heritage'), 'removal survives clean-store import');
  F.restoreTraitOnSheet(reimport, tpl(), 0, 'Heritage');
  ok(reimport.traitSets[0].traits.some((t) => t.name === 'Heritage'), 'restore brings it back');
  ok(!reimport.traitSets[0].removedTraits.length, 'restore clears the removal');
  ok(eq(F.restorableTraits(reimport, tpl(), 0), []), 'nothing left to restore');
}

// ---- removedSets round-trip.
{
  const live = F.mergeTemplateIntoCharacter({ id: 'c1', traitSets: [{ id: 'distinctions' }, { id: 'attributes' }] }, tpl());
  F.removeTraitSetFromSheet(live, tpl(), 1);
  ok(!live.traitSets.some((ts) => ts.id === 'attributes'), 'set removed from live');
  const out = F.stripCharacterForExport(live, tpl());
  const reimport = F.mergeTemplateIntoCharacter(out, tpl());
  ok(!reimport.traitSets.some((ts) => ts.id === 'attributes'), 'set removal survives round-trip');
}

// ---- Snapshot isolation helpers: versioned upsert + resolve.
{
  const a = tpl(); a.version = 1;
  const b = tpl(); b.version = 2;
  let store = storage.upsertTemplate([], a);
  store = storage.upsertTemplate(store, b);
  ok(store.length === 2, 'versions coexist by (id, version)');
  store = storage.upsertTemplate(store, JSON.parse(JSON.stringify(b)));
  ok(store.length === 2, 'same version replaces, never duplicates');
}

// ---- Prefs travel name-keyed and resolve back to lids.
{
  const live = F.mergeTemplateIntoCharacter({ id: 'c1', traitSets: [{ id: 'distinctions', traits: [{ name: 'Heritage' }, { name: '' }, { name: '' }] }] }, tpl());
  F.assignLids(live);
  const lids = live.traitSets[0].traits.map((t) => t._lid);
  const file = F.prefsForExport({ setOrder: ['distinctions'], traitOrders: { distinctions: [lids[0]] } }, live);
  ok(file && eq(file.traitOrders.distinctions, ['Heritage']), 'prefs export name-keyed', file);
  F.stripInternalIds(live);
  F.assignLids(live); // fresh ids, as on import
  const back = F.prefsFromImport(file, live);
  ok(back && back.traitOrders.distinctions.length === 1, 'prefs resolve back to fresh lids');
}

// ---- Legacy import shape: upstream envelope unwraps with fresh id, no linkage.
{
  const up = { version: 2, data: { name: 'Up', traitSets: [] } };
  const c = F.sanitizeImportedCharacter(up);
  ok(!!c && typeof c.id === 'string' && c.sheet === undefined, 'upstream unwraps id-fresh with no template link');
}

console.log(`merge-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
