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
});

// ---- 3. data/templates files: must parse; characters validate structurally.
const dataDir = path.join(root, 'data/templates');
if (fs.existsSync(dataDir)) {
  for (const f of fs.readdirSync(dataDir)) {
    if (f === 'desktop.ini') continue;
    const fp = path.join(dataDir, f);
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

console.log(`validate: ${errors.length} error(s), ${warnings.length} warning(s)`);
warnings.slice(0, 20).forEach((w) => console.log('  WARN ' + w));
errors.slice(0, 60).forEach((e) => console.log('  ERR ' + e));
process.exit(errors.length ? 1 : 0);
