// §4 descriptive-cost probe: SFX costs describe, never execute. For each
// vocabulary entry: edit writes the object, sheet/play/print render the
// words, and clicking the cost changes no state and raises no toast.
// Desktop 1440 + phone 390, zero console errors.
const { spawn } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.SMOKE_PORT || '3125', 10);
const CHROME = path.join(
  process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local'),
  'ms-playwright', 'chromium-1243', 'chrome-win64', 'chrome.exe'
);

const ENTRY_DEFS = [
  { set: () => ({ pool: 'drop-highest' }), words: () => '(drop highest die)', poolBtn: 'Drop highest' },
  { set: () => ({ pool: 'drop-die' }), words: () => '(drop a die)', poolBtn: 'Drop a die' },
  { set: () => ({ pool: 'split-largest' }), words: () => '(split largest die)', poolBtn: 'Split largest' },
  { set: () => ({ plotPoints: 2 }), words: () => '(2 PP)', poolBtn: null },
  { set: (t) => ({ stepUp: t }), words: (t) => `(step up ${t})`, poolBtn: null, step: 'up' },
  { set: (t) => ({ stepDown: t }), words: (t) => `(step down ${t})`, poolBtn: null, step: 'down' },
  { set: () => ({ narrative: true }), words: () => '(narrative beat)', poolBtn: null, nar: true },
];

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'ok' : 'FAIL') + ' | ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  if (!cond) failures++;
}

async function main() {
  const { chromium } = require('playwright-core');
  const server = spawn(process.execPath, [path.join(__dirname, 'serve.js')], {
    env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore',
  });
  const errors = [];
  let browser = null;
  try {
    await new Promise((r) => setTimeout(r, 1200));
    browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push('pageerror: ' + String((e && e.message) || e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.evaluate(async () => {
      const libBtn = [...document.querySelectorAll('.roster-button')].find((el) => /spotlight library/i.test(el.textContent || ''));
      if (libBtn) {
        libBtn.click();
        await new Promise((r) => setTimeout(r, 1500));
        const first = document.querySelector('.btn-spotlight.primary');
        if (first) first.click();
        await new Promise((r) => setTimeout(r, 1500));
      }
    });
    // Host trait: prefer a default-body set, else distinctions, else first.
    const loc = await page.evaluate(() => {
      const ch = window.app && window.app.character;
      if (!ch || !Array.isArray(ch.traitSets)) return null;
      const bodyOf = (ts) => ts && ts.view && ts.view.style && ts.view.style.body;
      let first = null, def = null, dist = null;
      for (let s = 0; s < ch.traitSets.length; s++) {
        const ts = ch.traitSets[s];
        if (!ts || !Array.isArray(ts.traits) || !ts.traits.length) continue;
        if (!first) first = { s, t: 0 };
        const b = bodyOf(ts);
        if (b === 'default' && !def) def = { s, t: 0 };
        if (b === 'distinctions' && !dist) dist = { s, t: 0 };
      }
      const pick = def || dist || first;
      if (!pick) return null;
      const trait = ch.traitSets[pick.s].traits[pick.t];
      return { ...pick, trait: trait && trait.name, set: ch.traitSets[pick.s].name };
    });
    check('probe trait located', !!loc, JSON.stringify(loc));
    if (!loc) throw new Error('no probe trait');
    // Enable the set's SFX feature, reset the row layout, add an SFX.
    await page.evaluate((l) => { window.app.selectElement(['traitSet', l.s]); }, loc);
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      const box = document.querySelector('input[name="featureSFX"]');
      if (box && !box.checked) box.click();
    });
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      [...document.querySelectorAll('.editor-group-btn')]
        .find((b) => b.textContent.trim() === 'Reset' && /preset arrangement/i.test(b.title || ''))?.click();
    });
    await page.waitForTimeout(800);
    await page.evaluate((l) => { window.app.selectElement(['trait', l.s, l.t]); }, loc);
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      [...document.querySelectorAll('.editor-button')].find((b) => /new sfx/i.test(b.textContent || ''))?.click();
    });
    await page.waitForTimeout(1000);
    check('sfx editor opens with Cost section', await page.evaluate(() =>
      !!document.querySelector('input[name="sfxName"]') && !!document.querySelector('input[name="sfxPlotPoints"]')));
    for (const def of ENTRY_DEFS) {
      const want = def.set(loc.trait);
      const words = def.words(loc.trait);
      // Author the entry through the real editor controls.
      await page.evaluate(() => { window.app.setMode('character', 'edit'); });
      await page.waitForTimeout(900);
      await page.evaluate((l) => { window.app.selectElement(['trait', l.s, l.t]); }, loc);
      await page.waitForTimeout(1000);
      await page.evaluate((btn) => {
        const btns = [...document.querySelectorAll('.editor-subgroup .editor-button-group .editor-group-btn')];
        const byName = (t) => btns.find((b) => b.textContent.trim() === t);
        byName('None')?.click();
        if (btn) byName(btn)?.click();
      }, def.poolBtn);
      await page.waitForTimeout(400);
      await page.fill('input[name="sfxPlotPoints"]', want.plotPoints !== undefined ? String(want.plotPoints) : '');
      await page.waitForTimeout(300);
      await page.fill('input[name="sfxStepUp"]', want.stepUp || '');
      await page.waitForTimeout(300);
      await page.fill('input[name="sfxStepDown"]', want.stepDown || '');
      await page.waitForTimeout(300);
      const nar = await page.evaluate(() => document.querySelector('input[name="sfxNarrative"]')?.checked || false);
      if (!!want.narrative !== nar) {
        await page.evaluate(() => { document.querySelector('input[name="sfxNarrative"]').click(); });
        await page.waitForTimeout(300);
      }
      const stored = await page.evaluate((l) => {
        const list = window.app.character.traitSets[l.s].traits[l.t].sfx;
        const e = list.find((x) => x && typeof x === 'object' && x.name === 'New SFX');
        return e && e.cost ? JSON.parse(JSON.stringify(e.cost)) : null;
      }, loc);
      const keys = Object.keys(want);
      check(`editor writes ${keys.join('+')}`, stored && keys.every((k) => JSON.stringify(stored[k]) === JSON.stringify(want[k])) && Object.keys(stored).length === keys.length, JSON.stringify(stored));
      const sheetCost = await page.evaluate((w) =>
        (document.querySelector('.trait-sfx-cost')?.textContent.trim() ||
          [...document.querySelectorAll('.sfx-content')].map((el) => el.textContent.trim()).find((t) => t.includes(w)) || null), words);
      check(`sheet renders ${words}`, sheetCost !== null && sheetCost.includes(words), sheetCost);
      // Play: the player stages dice by hand, then uses the SFX. Using
      // changes nothing by itself: pool, cost object, and toast all idle.
      await page.evaluate(() => { window.app.setMode('character', 'play'); });
      await page.waitForTimeout(1000);
      await page.evaluate(() => {
        window.app.clearDicePool();
        window.app.addDieToRoller([{ size: 8, source: 'Kind' }, { size: 12, source: 'Strength' }]);
      });
      await page.waitForTimeout(800);
      const before = await page.evaluate((l) => ({
        pool: JSON.stringify(window.app.dicePool.items.map((i) => ({ size: i.size, source: i.source }))),
        cost: JSON.stringify((window.app.character.traitSets[l.s].traits[l.t].sfx.find((x) => x && x.name === 'New SFX') || {}).cost || null),
        toast: document.querySelector('.toast-notification span')?.textContent.trim() || null,
      }), loc);
      const clicked = await page.evaluate((w) => {
        const els = [...document.querySelectorAll('.trait-sfx-cost, .sfx-content')];
        const el = els.find((e) => (e.textContent || '').includes(w));
        if (el) el.click();
        return !!el;
      }, words);
      check(`cost row ${words} clickable for the test`, clicked);
      await page.waitForTimeout(900);
      const after = await page.evaluate((l) => ({
        pool: JSON.stringify(window.app.dicePool.items.map((i) => ({ size: i.size, source: i.source }))),
        cost: JSON.stringify((window.app.character.traitSets[l.s].traits[l.t].sfx.find((x) => x && x.name === 'New SFX') || {}).cost || null),
        toast: document.querySelector('.toast-notification span')?.textContent.trim() || null,
      }), loc);
      check(`using ${words} changes no state`, before.pool === after.pool && before.cost === after.cost, `[${before.pool}] vs [${after.pool}]`);
      check(`using ${words} raises no toast`, after.toast === null || after.toast === before.toast, after.toast);
    }
    // The player's own controls still work by hand.
    await page.evaluate(() => {
      window.app.removeDieFromRoller(0);
    });
    await page.waitForTimeout(500);
    const handPool = await page.evaluate(() => window.app.dicePool.items.map((i) => i.size).join(','));
    check('player removes a staged die by hand', handPool === '12', handPool);
    // Print renders the words.
    await page.evaluate(() => { location.hash = location.hash.replace(/\/(edit|play|print)$/, '/print'); });
    await page.waitForTimeout(1200);
    const printCost = await page.evaluate(() => document.querySelector('.trait-sfx-cost')?.textContent.trim() || null);
    check('print renders cost words', printCost !== null && printCost.length > 0, printCost);
    // Phone (shared storage): cost renders.
    const phone = await ctx.newPage();
    await phone.setViewportSize({ width: 390, height: 844 });
    phone.on('pageerror', (e) => errors.push('[phone] pageerror: ' + String((e && e.message) || e)));
    phone.on('console', (m) => { if (m.type() === 'error') errors.push('[phone] console: ' + m.text()); });
    await phone.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await phone.waitForTimeout(1500);
    await phone.evaluate(async () => {
      if (!document.querySelector('.trait-set')) {
        const open = document.querySelector('.roster-item-name, .roster-item-portrait');
        if (open) open.click();
        await new Promise((r) => setTimeout(r, 2000));
      }
    });
    const phoneCost = await phone.evaluate(() => document.querySelector('.trait-sfx-cost')?.textContent.trim() || null);
    check('phone renders cost', phoneCost !== null && phoneCost.length > 0, phoneCost);
    check('zero console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
  console.log(`smoke-s4: ${failures} failure(s)`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error('smoke-s4 crashed: ' + (e && e.stack || e)); process.exit(1); });
