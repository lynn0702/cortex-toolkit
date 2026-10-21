// Pack validator: schema shape + template join rules (decision brief D1/D2/D8).
// Usage: node scripts/validate.js  (exit 1 on any error)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let errors = [];
let warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ---- 1. Schema: optional fields accept null; id+name required on characters and trait sets; no trait-level id.
const schemaPath = path.join(root, 'schema/0.1/character.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

function allowsNull(prop) {
  if (!prop || typeof prop !== 'object') return false;
  if (prop.type === 'null') return true;
  if (Array.isArray(prop.type) && prop.type.includes('null')) return true;
  if (Array.isArray(prop.enum) && prop.enum.includes(null)) return true;
  for (const k of ['anyOf', 'oneOf']) {
    if (Array.isArray(prop[k]) && prop[k].some(allowsNull)) return true;
  }
  if (prop.$ref) return true; // resolved refs validated separately; assume nullable via union
  return false;
}

function checkDef(name, def) {
  const req = def.required || [];
  const props = def.properties || {};
  for (const [k, sub] of Object.entries(props)) {
    if (req.includes(k)) continue;
    if (!allowsNull(sub)) err(`schema $defs.${name}.${k}: optional field does not accept null`);
  }
}
checkDef('traitSet', schema.$defs.traitSet);
checkDef('trait', schema.$defs.trait);
checkDef('sfx', schema.$defs.sfx);

for (const need of ['id', 'name']) {
  if (!schema.required.includes(need)) err(`schema character: required missing "${need}"`);
  if (!schema.$defs.traitSet.required.includes(need)) err(`schema traitSet: required missing "${need}"`);
}
if (schema.$defs.trait.properties.id) err('schema trait: trait-level id must be forbidden');
if (schema.additionalProperties !== false) warn('schema character: additionalProperties not false');

// ---- 1b. Library card copy (2026-10-20): human copy from the publishers'
// DriveThruRPG listings. Generated entry descriptions are gone; published
// settings carry a listing block, core-book settings a URL-only one, and
// the Toolkit Reference showcases none.
const HANDBOOK_SPOTLIGHTS = ['Eidolon Alpha', 'Hammerheads', 'TRACE 2.0'];
function checkListing(where, entry) {
  if (entry.description !== undefined) {
    err(`${where}: generated entry description removed — cards use listing copy`);
  }
  const sp = entry.spotlight;
  const listing = entry.listing;
  if (sp === 'Toolkit Reference') {
    if (listing !== undefined) err(`${where}: showcase entries carry no listing`);
    return;
  }
  if (!listing || typeof listing !== 'object' || Array.isArray(listing)) {
    err(`${where}: published setting needs a listing block`);
    return;
  }
  if (typeof listing.url !== 'string' || listing.url.indexOf('https://legacy.drivethrurpg.com/product/') !== 0 ||
      listing.url.indexOf('manufacturers_id=') === -1) {
    err(`${where}: listing.url must be the live DriveThruRPG product URL`);
  }
  const textKeys = ['quote', 'genre', 'setting', 'prep', 'complexity'];
  if (HANDBOOK_SPOTLIGHTS.indexOf(sp) !== -1) {
    for (const k of textKeys) {
      if (listing[k] !== undefined) err(`${where}: core-book setting carries only the Handbook URL (no ${k})`);
    }
    if (listing.image !== undefined) err(`${where}: core-book setting has no cover image`);
    return;
  }
  for (const k of textKeys) {
    if (typeof listing[k] !== 'string' || !listing[k].length) {
      err(`${where}: listing.${k} is required verbatim text`);
    }
  }
  for (const k of ['setting', 'prep', 'complexity']) {
    if (typeof listing[k] === 'string' && listing[k].length && !isDiceString(listing[k])) {
      err(`${where}: listing.${k} must be a dice string (${JSON.stringify(listing[k])})`);
    }
  }
  // Cover image: publisher id + the product id from the entry's own url.
  const m = /\/product\/(\d+)\//.exec(listing.url || '');
  const wantImage = m ? 'https://legacy.drivethrurpg.com/images/31866/' + m[1] + '.jpg' : null;
  if (listing.image !== wantImage) {
    err(`${where}: listing.image must be the DriveThruRPG cover for the stored url`);
  }
}

// ---- 2. Templates vs join rules.
const templates = require(path.join(root, 'js/templates.js'));
const seenTplIds = new Set();
templates.forEach((tpl, ti) => {
  const where = `templates[${ti}](${tpl && tpl.id})`;
  if (!tpl || typeof tpl.id !== 'string' || !tpl.id.length) { err(`${where}: missing static template id`); return; }
  if (seenTplIds.has(tpl.id)) err(`${where}: duplicate template id`);
  seenTplIds.add(tpl.id);
  const ch = tpl.character;
  if (!ch || !Array.isArray(ch.traitSets)) { err(`${where}: character.traitSets missing`); return; }
  const setIds = new Set();
  ch.traitSets.forEach((ts, si) => {
    const sw = `${where}.traitSets[${si}]`;
    if (!ts || typeof ts.id !== 'string' || !ts.id.length) { err(`${sw}: missing stable set id`); return; }
    if (setIds.has(ts.id)) err(`${sw}: duplicate set id "${ts.id}"`);
    setIds.add(ts.id);
    const checkTraits = (traits, pw, isSub) => {
      if (!Array.isArray(traits)) { err(`${pw}: traits not an array`); return; }
      const seen = new Set();
      traits.forEach((tr, i) => {
        const tw = `${pw}[${i}]`;
        if (!tr || typeof tr !== 'object') { err(`${tw}: not an object`); return; }
        if (tr.id !== undefined) err(`${tw}: trait-level id forbidden (D1)`);
        if (tr._lid !== undefined) err(`${tw}: internal _lid must never be stored in templates (D10)`);
        const nm = tr.name;
        if (typeof nm === 'string' && nm.length) {
          if (seen.has(nm)) err(`${tw}: duplicate ${isSub ? 'subtrait' : 'trait'} name ${JSON.stringify(nm)} (D8)`);
          seen.add(nm);
        }
        if (Array.isArray(tr.traits)) checkTraits(tr.traits, `${tw}.traits`, true);
      });
    };
    checkTraits(ts.traits, `${sw}.traits`, false);
  });
  // Page-count tripwire (2026-10-18): a pinned pageCount below the highest
  // set page hides whole sets; a top-level pages disagreement means the
  // entry metadata and the sheet disagree. Absent pageCount is legal.
  {
    let maxPage = 1;
    ch.traitSets.forEach((ts) => {
      const p = Number((ts.view || {}).page) || 1;
      if (p > maxPage) maxPage = p;
    });
    const pinned = ch.view && ch.view.pageCount;
    if (pinned !== undefined && pinned !== null) {
      if (Number(pinned) < maxPage) err(`${where}: view.pageCount ${pinned} is below highest set page ${maxPage}`);
      if (tpl.pages !== undefined && tpl.pages !== null && Number(tpl.pages) !== Number(pinned)) {
        err(`${where}: top-level pages ${tpl.pages} disagrees with view.pageCount ${pinned}`);
      }
    }
  }
  checkListing(where, tpl);
});

// ---- 3. data/templates files: must parse; characters validate structurally.
const dataDir = path.join(root, 'data/templates');
if (fs.existsSync(dataDir)) {
  for (const f of fs.readdirSync(dataDir)) {
    if (f === 'desktop.ini') continue;
    const fp = path.join(dataDir, f);
    // Layered template files (presentation layers): complete, not sparse.
    // Presentation keys and custom stay verbatim; set ids are kept for join
    // continuity. Structural old-model keys are still forbidden.
    if (f.endsWith('.template.layered.json')) {
      try {
        checkTemplateFile(`data/templates/${f}`, JSON.parse(fs.readFileSync(fp, 'utf8')));
      } catch (e) {
        err(`data/templates/${f}: invalid JSON (${e.message})`);
      }
      continue;
    }
    // Terse layered format (Phase-1 item 10): real validation, D1/D2/D8 ported
    // to maps. Dupes (D8) are structurally impossible — map keys are unique by
    // construction. Stable set ids (D2) dissolve the same way: the name is key.
    if (f.endsWith('.layered.json')) {
      try {
        checkLayeredFile(`data/templates/${f}`, JSON.parse(fs.readFileSync(fp, 'utf8')));
      } catch (e) {
        err(`data/templates/${f}: invalid JSON (${e.message})`);
      }
      continue;
    }
    try {
      const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
      const isChar = data && typeof data.id === 'string' && Array.isArray(data.traitSets);
      const isEntry = data && typeof data.id === 'string' && data.character && Array.isArray(data.character.traitSets);
      const isBundle = data && Array.isArray(data.characters);
      if (!isChar && !isEntry && !isBundle) err(`data/templates/${f}: unrecognized shape (not character, template entry, or bundle)`);
    } catch (e) {
      err(`data/templates/${f}: invalid JSON (${e.message})`);
    }
  }
}

// ---- 4. Terse layered validation (Phase-1 item 10).
function isDiceString(s) {
  if (typeof s !== 'string' || !s.length) return false;
  const re = /(\d*)d(4|6|8|10|12|20)/g;
  let m, covered = 0, tokens = 0;
  while ((m = re.exec(s)) !== null) { tokens++; covered += m[0].length; }
  const rest = s.replace(/(\d*)d(4|6|8|10|12|20)/g, '').trim();
  return tokens > 0 && covered > 0 && rest.length === 0;
}

function checkLayeredTrait(node, where, depth) {
  if (node === null) return; // local clear, governed by the null-emit rule
  if (typeof node === 'string') {
    if (!isDiceString(node)) err(`${where}: invalid dice string ${JSON.stringify(node)}`);
    return;
  }
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    err(`${where}: trait must be a dice string, object, or null`);
    return;
  }
  for (const k of ['id', '_lid']) {
    if (node[k] !== undefined) err(`${where}: trait-level ${k} forbidden (D1)`);
  }
  for (const k of ['removedTraits', 'removedSets']) {
    if (node[k] !== undefined) err(`${where}: tombstone ${k} is gone, use local nulls`);
  }
  if (node.custom !== undefined) err(`${where}: custom stays app-side, never in entity JSON`);
  if (node.traitSets !== undefined) err(`${where}: array-form traitSets has no map form here`);
  if (Array.isArray(node.traits)) err(`${where}: traits must be a name-keyed map, not an array`);
  if (Array.isArray(node.sfx)) err(`${where}: sfx arrays become traits under an SFX node`);
  for (const k of ['nounSingular', 'ratingPosition', 'statement', 'hasQuestionedPip', 'hasCounterColumn', 'counterLabel']) {
    if (node[k] !== undefined) err(`${where}: presentation key ${k} lives in the type layer`);
  }
  if (node.value !== undefined && !isDiceString(node.value)) err(`${where}: invalid value dice string ${JSON.stringify(node.value)}`);
  if (node.cost !== undefined && (typeof node.cost !== 'object' || node.cost === null || Array.isArray(node.cost))) {
    err(`${where}: cost is an object, never a bare number`);
  }
  if (node.usableBy !== undefined && ['owner', 'anyone', 'opposition'].indexOf(node.usableBy) === -1) {
    err(`${where}: usableBy must be owner|anyone|opposition`);
  }
  if (node.pool !== undefined && typeof node.pool !== 'boolean') err(`${where}: pool must be boolean`);
  if (node.select !== undefined) warn(`${where}: select lives on the set, not the trait`);
  if (node.requiresSelect !== undefined) warn(`${where}: requiresSelect lives on the set, not the trait`);
  if (node.traits !== undefined) {
    if (!node.traits || typeof node.traits !== 'object' || Array.isArray(node.traits)) {
      err(`${where}.traits: must be a name-keyed map`);
    } else {
      for (const name of Object.keys(node.traits)) {
        if (!name.length) err(`${where}.traits: blank names have no map form`);
        else if (depth < 8) checkLayeredTrait(node.traits[name], `${where}/${name}`, depth + 1);
      }
    }
  }
}

function checkLayeredFile(where, data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    err(`${where}: must be an object`);
    return;
  }
  if (Array.isArray(data.traitSets)) err(`${where}: array-form traitSets is old format, migrate to sets map`);
  if (data.removedTraits !== undefined || data.removedSets !== undefined) {
    err(`${where}: tombstone arrays are gone, use local nulls`);
  }
  if (data.custom !== undefined) err(`${where}: custom stays app-side, never in entity JSON`);
  if (typeof data.name !== 'string') err(`${where}: name must be a string`);
  if (data.sets === undefined) {
    err(`${where}: missing sets map`);
    return;
  }
  if (!data.sets || typeof data.sets !== 'object' || Array.isArray(data.sets)) {
    err(`${where}: sets must be a name-keyed map`);
    return;
  }
  for (const name of Object.keys(data.sets)) {
    if (!name.length) {
      err(`${where}: blank set names have no map form`);
      continue;
    }
    const set = data.sets[name];
    if (set === null) continue; // local clear of an inherited set
    if (!set || typeof set !== 'object' || Array.isArray(set)) {
      err(`${where}/${name}: set must be an object or null`);
      continue;
    }
    for (const k of ['id', '_lid']) {
      if (set[k] !== undefined) err(`${where}/${name}: set-level ${k} is old format (D1/D2)`);
    }
    if (set.custom !== undefined) err(`${where}/${name}: custom stays app-side`);
    if (Array.isArray(set.traits)) err(`${where}/${name}: traits must be a name-keyed map, not an array`);
    if (Array.isArray(set.sfx)) err(`${where}/${name}: sfx arrays become traits under an SFX node`);
    for (const k of ['nounSingular', 'ratingPosition', 'statement', 'hasQuestionedPip', 'hasCounterColumn', 'counterLabel']) {
      if (set[k] !== undefined) err(`${where}/${name}: presentation key ${k} lives in the type layer`);
    }
    if (set.usableBy !== undefined && ['owner', 'anyone', 'opposition'].indexOf(set.usableBy) === -1) {
      err(`${where}/${name}: usableBy must be owner|anyone|opposition`);
    }
    if (set.select !== undefined && ['one', 'any'].indexOf(set.select) === -1) {
      err(`${where}/${name}: select must be one|any`);
    }
    if (set.requiresSelect !== undefined && typeof set.requiresSelect !== 'boolean') {
      err(`${where}/${name}: requiresSelect must be boolean`);
    }
    if (set.traits !== undefined && set.traits !== null) {
      if (typeof set.traits !== 'object' || Array.isArray(set.traits)) {
        err(`${where}/${name}: traits must be a name-keyed map`);
      } else {
        for (const tname of Object.keys(set.traits)) {
          if (!tname.length) err(`${where}/${name}: blank trait names have no map form`);
          else checkLayeredTrait(set.traits[tname], `${where}/${name}/${tname}`, 0);
        }
      }
    }
  }
}

// ---- 5. Layered template validation (presentation layers are complete).
function checkTemplateTrait(node, where, depth, inSlot) {
  if (node === null) return; // removal record against the wrapped base
  if (typeof node === 'string') {
    if (!isDiceString(node)) err(`${where}: invalid dice string ${JSON.stringify(node)}`);
    return;
  }
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    err(`${where}: trait must be a dice string, object, or null`);
    return;
  }
  if (node.id !== undefined) err(`${where}: trait-level id forbidden (D1)`);
  if (node._lid !== undefined) err(`${where}: _lid is app-local, never in files`);
  for (const k of ['removedTraits', 'removedSets']) {
    if (node[k] !== undefined) err(`${where}: tombstone ${k} is gone, use local nulls`);
  }
  if (node.traitSets !== undefined) err(`${where}: array-form traitSets has no map form here`);
  if (Array.isArray(node.traits)) err(`${where}: traits must be a name-keyed map, not an array`);
  if (Array.isArray(node.sfx)) err(`${where}: sfx arrays become traits under an SFX node`);
  if (node.value !== undefined && !isDiceString(node.value)) err(`${where}: invalid value dice string ${JSON.stringify(node.value)}`);
  if (node.cost !== undefined && (typeof node.cost !== 'object' || node.cost === null || Array.isArray(node.cost))) {
    err(`${where}: cost is an object, never a bare number`);
  }
  if (node.usableBy !== undefined && ['owner', 'anyone', 'opposition'].indexOf(node.usableBy) === -1) {
    err(`${where}: usableBy must be owner|anyone|opposition`);
  }
  if (node.pool !== undefined && typeof node.pool !== 'boolean') err(`${where}: pool must be boolean`);
  const kids = (map, label) => {
    if (map === undefined || map === null) return;
    if (!map || typeof map !== 'object' || Array.isArray(map)) {
      err(`${where}.${label}: must be a name-keyed map`);
      return;
    }
    for (const name of Object.keys(map)) {
      if (!name.length) err(`${where}.${label}: blank names live in slots, not traits`);
      else if (depth < 8) checkTemplateTrait(map[name], `${where}/${name}`, depth + 1, false);
    }
  };
  kids(node.traits, 'traits');
  checkSlots(node, where, depth, (s, i) => checkTemplateTrait(s, `${where}/slot${i}`, depth + 1, true));
}

function checkSlots(node, where, depth, check) {
  if (node.slots === undefined) return;
  if (!node.slots || typeof node.slots !== 'object' || Array.isArray(node.slots)) {
    err(`${where}.slots: must be an object keyed by 0-based position`);
    return;
  }
  const named = node.traits && typeof node.traits === 'object' && !Array.isArray(node.traits)
    ? Object.keys(node.traits).length : 0;
  const idx = Object.keys(node.slots);
  if (idx.some((k) => !/^\d+$/.test(k) || Number(k) >= named + idx.length)) {
    err(`${where}.slots: keys must be 0-based positions within the trait order`);
  }
  idx.forEach((k) => {
    const s = node.slots[k];
    if (s && typeof s === 'object' && !Array.isArray(s) && s.name !== undefined) {
      err(`${where}.slots[${k}]: slots carry no name key`);
    } else check(s, k);
  });
}

function checkTemplateFile(where, data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    err(`${where}: must be an object`);
    return;
  }
  checkListing(where, data);
  const ch = data.character;
  if (!ch || typeof ch !== 'object' || Array.isArray(ch)) {
    err(`${where}: entry must wrap character`);
    return;
  }
  if (Array.isArray(ch.traitSets)) err(`${where}: array-form traitSets is old format, migrate to sets map`);
  if (ch.removedSets !== undefined) err(`${where}: tombstone removedSets is gone, use local nulls`);
  if (typeof ch.name !== 'string') err(`${where}: character name must be a string`);
  if (ch.$schema !== undefined || ch.version !== undefined) {
    warn(`${where}: old-format $schema/version markers do not belong in layered form`);
  }
  if (ch.sets === undefined) {
    err(`${where}: missing sets map`);
    return;
  }
  if (!ch.sets || typeof ch.sets !== 'object' || Array.isArray(ch.sets)) {
    err(`${where}: sets must be a name-keyed map`);
    return;
  }
  for (const name of Object.keys(ch.sets)) {
    if (!name.length) {
      err(`${where}: blank set names have no map form`);
      continue;
    }
    const set = ch.sets[name];
    if (set === null) continue; // local clear of an inherited set
    if (!set || typeof set !== 'object' || Array.isArray(set)) {
      err(`${where}/${name}: set must be an object or null`);
      continue;
    }
    if (set._lid !== undefined) err(`${where}/${name}: _lid is app-local, never in files`);
    // Identity (2026-10-20): the map key is the address, the set id the
    // stable identity — rename the key freely, never the id. Suffixed
    // duplicate keys resolve through their label.
    if (typeof set.id !== 'string' || !set.id.length) {
      err(`${where}/${name}: set needs a stable id (join key)`);
    }
    const tilde = name.indexOf('~');
    if (tilde !== -1 && set.label !== name.slice(0, tilde)) {
      err(`${where}/${name}: suffixed duplicate key needs label ${JSON.stringify(name.slice(0, tilde))}`);
    }
    if (set.removedTraits !== undefined || set.removedSets !== undefined) {
      err(`${where}/${name}: tombstones are gone, use local nulls`);
    }
    if (Array.isArray(set.traits)) err(`${where}/${name}: traits must be a name-keyed map, not an array`);
    if (Array.isArray(set.sfx)) err(`${where}/${name}: sfx arrays become traits under an SFX node`);
    if (set.usableBy !== undefined && ['owner', 'anyone', 'opposition'].indexOf(set.usableBy) === -1) {
      err(`${where}/${name}: usableBy must be owner|anyone|opposition`);
    }
    if (set.select !== undefined && ['one', 'any'].indexOf(set.select) === -1) {
      err(`${where}/${name}: select must be one|any`);
    }
    if (set.requiresSelect !== undefined && typeof set.requiresSelect !== 'boolean') {
      err(`${where}/${name}: requiresSelect must be boolean`);
    }
    if (set.traits !== undefined && set.traits !== null) {
      if (typeof set.traits !== 'object' || Array.isArray(set.traits)) {
        err(`${where}/${name}: traits must be a name-keyed map`);
      } else {
        for (const tname of Object.keys(set.traits)) {
          if (!tname.length) err(`${where}/${name}: blank trait names live in slots, not traits`);
          else checkTemplateTrait(set.traits[tname], `${where}/${name}/${tname}`, 0, false);
        }
      }
    }
    checkSlots(set, `${where}/${name}`, 0, (s, i) => checkTemplateTrait(s, `${where}/${name}/slot${i}`, 0, true));
  }
}

// ---- 6. Nested-grid placement (2026-10-19): view.place + view.parts.
const KNOWN_PARTS = ['name', 'rating', 'description', 'sfx', 'subtraits', 'stressLabel', 'stress'];

function parseStoredPct(v) {
  if (typeof v !== 'string') return null;
  const m = v.trim().match(/^(-?\d+(?:\.\d+)?)\s*%$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function checkCell(where, cell, label) {
  if (!cell || typeof cell !== 'object' || Array.isArray(cell)) {
    err(`${where}: ${label} must be an object`);
    return null;
  }
  let bad = false;
  for (const k of ['left', 'width']) {
    if (typeof cell[k] === 'number') {
      err(`${where}: ${label}.${k} is a bare number, stored form carries the "%" unit`);
      bad = true;
    }
  }
  const left = parseStoredPct(cell.left);
  const width = parseStoredPct(cell.width);
  if (left === null || left < 0 || left > 100) { err(`${where}: ${label}.left must be a "%" string parsing to 0-100`); bad = true; }
  if (width === null || width <= 0 || width > 100) { err(`${where}: ${label}.width must be a "%" string parsing to 0-100 with width > 0`); bad = true; }
  if (!Number.isInteger(cell.top) || cell.top < 0) { err(`${where}: ${label}.top must be an integer >= 0`); bad = true; }
  if (!Number.isInteger(cell.height) || cell.height < 1) { err(`${where}: ${label}.height must be an integer >= 1`); bad = true; }
  if (left !== null && width !== null && left + width > 100 + 1e-6) { err(`${where}: ${label} exceeds its parent (left + width <= 100)`); bad = true; }
  return bad ? null : { left, top: cell.top, width, height: cell.height };
}

function checkSetPlacement(where, setName, set, pageOf) {
  if (!set || typeof set !== 'object' || Array.isArray(set)) return null;
  const view = set.view;
  const hasParts = view && typeof view === 'object' && view.parts && typeof view.parts === 'object' && !Array.isArray(view.parts);
  const legacyRating = (set.ratingPosition !== undefined && set.ratingPosition !== null)
    || (view && view.ratingPosition !== undefined && view.ratingPosition !== null);
  const legacyStress = view && view.attachedStress && typeof view.attachedStress === 'object' && view.attachedStress.enabled;
  if (hasParts && (legacyRating || legacyStress)) {
    err(`${where}/${setName}: carries parts and legacy flags (ratingPosition/attachedStress), never both`);
  }
  let rect = null;
  if (view && view.place !== undefined) {
    rect = checkCell(where, view.place, `place (${setName})`);
  }
  if (hasParts) {
    for (const part of Object.keys(view.parts)) {
      if (KNOWN_PARTS.indexOf(part) === -1) {
        err(`${where}/${setName}: unknown part ${JSON.stringify(part)}`);
        continue;
      }
      checkCell(where, view.parts[part], `parts.${part} (${setName})`);
    }
  }
  if (rect) {
    const page = pageOf(set);
    return { page, rect, setName };
  }
  return null;
}

function checkOverlaps(where, placed) {
  const byKey = {};
  placed.forEach((e) => {
    const key = e.page + ':' + e.rect.top;
    (byKey[key] = byKey[key] || []).push(e);
  });
  Object.keys(byKey).forEach((key) => {
    const list = byKey[key];
    for (let a = 0; a < list.length; a++) {
      for (let b = a + 1; b < list.length; b++) {
        const A = list[a].rect, B = list[b].rect;
        const h = A.left < B.left + B.width - 1e-6 && B.left < A.left + A.width - 1e-6;
        const v = A.top < B.top + B.height && B.top < A.top + A.height;
        if (h && v) err(`${where}: overlap on page ${list[a].page} between ${JSON.stringify(list[a].setName)} and ${JSON.stringify(list[b].setName)}`);
      }
    }
  });
}

// js/templates.js sets.
{
  templates.forEach((tpl, ti) => {
    const ch = tpl && tpl.character;
    if (!ch || !Array.isArray(ch.traitSets)) return;
    const where = `templates[${ti}](${tpl.id})`;
    const placed = [];
    ch.traitSets.forEach((ts) => {
      if (!ts || typeof ts !== 'object') return;
      const hit = checkSetPlacement(where, ts.name || '?', ts, (s) => Number((s.view || {}).page) || 1);
      if (hit) placed.push(hit);
    });
    checkOverlaps(where, placed);
  });
}

// data/templates layered sets.
if (fs.existsSync(dataDir)) {
  for (const f of fs.readdirSync(dataDir)) {
    if (!f.endsWith('.template.layered.json')) continue;
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
    } catch (e) { continue; }
    const ch = data && data.character;
    if (!ch || !ch.sets || typeof ch.sets !== 'object' || Array.isArray(ch.sets)) continue;
    const where = `data/templates/${f}`;
    const placed = [];
    let maxPage = 1;
    for (const name of Object.keys(ch.sets)) {
      const set = ch.sets[name];
      if (set && typeof set === 'object' && !Array.isArray(set)) {
        const p = Number((set.view || {}).page) || 1;
        if (p > maxPage) maxPage = p;
      }
      const hit = checkSetPlacement(where, name, set, (s) => Number((s.view || {}).page) || 1);
      if (hit) placed.push(hit);
    }
    checkOverlaps(where, placed);
    const pinned = ch.view && ch.view.pageCount;
    if (pinned !== undefined && pinned !== null) {
      if (Number(pinned) < maxPage) err(`${where}: view.pageCount ${pinned} is below highest set page ${maxPage}`);
      if (data.pages !== undefined && data.pages !== null && Number(data.pages) !== Number(pinned)) {
        err(`${where}: top-level pages ${data.pages} disagrees with view.pageCount ${pinned}`);
      }
    }
  }
}

console.log(`validate: ${errors.length} error(s), ${warnings.length} warning(s)`);
warnings.slice(0, 20).forEach((w) => console.log('  WARN ' + w));
errors.slice(0, 60).forEach((e) => console.log('  ERR ' + e));
process.exit(errors.length ? 1 : 0);
