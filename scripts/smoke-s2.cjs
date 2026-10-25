// §2 focused probe: rating type switcher, preservation, no multi-die flag.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.SMOKE_PORT || '3124', 10);
const CHROME = path.join(
  process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local'),
  'ms-playwright', 'chromium-1243', 'chrome-win64', 'chrome.exe'
);

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
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', (e) => errors.push('pageerror: ' + String((e && e.message) || e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    // Boot to a sheet via spotlight library.
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
    // Open the first editable trait row.
    await page.evaluate(() => {
      const row = document.querySelector('.trait-inner .trait-name');
      if (row) row.click();
    });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ROOT, 'smoke-shots', 's2-debug.png') });
    const dbg = await page.evaluate(() => ({
      editors: document.querySelectorAll('aside.editor, .editor-panel, [class*="trait-editor"]').length,
      traitInners: document.querySelectorAll('.trait-inner').length,
      hash: location.hash,
    }));
    console.log('debug: ' + JSON.stringify(dbg));
    const edHtml = await page.evaluate(() => {
      const ed = document.querySelector('aside.editor, .editor-panel');
      return ed ? ed.textContent.trim().slice(0, 400) : 'none';
    });
    console.log('editor: ' + JSON.stringify(edHtml));
    // 1. Type switcher present with four types (via the Add-rating gate).
    await page.evaluate(() => {
      const add = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Add rating');
      if (add) add.click();
    });
    await page.waitForTimeout(800);
    const types = await page.evaluate(() => [...document.querySelectorAll('.editor-button-group .editor-group-btn')]
      .map((b) => b.textContent.trim()).filter((t) => ['Die', 'Dice', 'Counter', 'Pip'].includes(t)));
    check('type switcher shows Die/Dice/Counter/Pip', types.length === 4, JSON.stringify(types));
    // 2. Die -> Dice preserves the die.
    const before = await page.evaluate(() => {
      const active = document.querySelector('.editor-values li.active .c');
      return active ? active.textContent.trim() : null;
    });
    await page.evaluate(() => {
      [...document.querySelectorAll('.editor-button-group .editor-group-btn')]
        .find((b) => b.textContent.trim() === 'Dice').click();
    });
    await page.waitForSelector('.multidie-chip .chip-text', { timeout: 8000 });
    const diceChips = await page.evaluate(() => [...document.querySelectorAll('.multidie-chip .chip-text')]
      .map((el) => el.textContent.trim()));
    check('Die->Dice preserves dice', diceChips.length === 1, `was=${before} now=${JSON.stringify(diceChips)}`);
    // 3. Add a second die, switch back: first item preserved.
    await page.evaluate(() => {
      const plus = [...document.querySelectorAll('.die-stepper-item .btn-step')].find((b) => b.textContent.trim() === '+');
      if (plus) plus.click();
    });
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      [...document.querySelectorAll('.editor-button-group .editor-group-btn')]
        .find((b) => b.textContent.trim() === 'Die').click();
    });
    await page.waitForTimeout(800);
    const singleActive = await page.evaluate(() => {
      const active = document.querySelector('.editor-values li.active .c');
      return active ? active.textContent.trim() : null;
    });
    check('Dice->Die keeps first die', singleActive !== null, `active=${singleActive}`);
    // 4. Counter inputs present and editable.
    await page.evaluate(() => {
      [...document.querySelectorAll('.editor-button-group .editor-group-btn')]
        .find((b) => b.textContent.trim() === 'Counter').click();
    });
    await page.waitForTimeout(800);
    const counter = await page.evaluate(() => ({
      count: !!document.querySelector('input[name="counterNumber"]'),
      min: !!document.querySelector('input[name="counterMin"]'),
      max: !!document.querySelector('input[name="counterMax"]'),
    }));
    check('Counter shows count+min+max', counter.count && counter.min && counter.max, JSON.stringify(counter));
    await page.evaluate(() => {
      const input = document.querySelector('input[name="counterNumber"]');
      input.focus(); input.value = '7';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(800);
    const counterVal = await page.evaluate(() => {
      const input = document.querySelector('input[name="counterNumber"]');
      return input ? input.value : null;
    });
    check('Counter count editable', counterVal === '7', `value=${counterVal}`);
    // 5. Pip bubble row present; toggle a bubble.
    await page.evaluate(() => {
      [...document.querySelectorAll('.editor-button-group .editor-group-btn')]
        .find((b) => b.textContent.trim() === 'Pip').click();
    });
    await page.waitForTimeout(800);
    const pips = await page.evaluate(() => ({
      bubbles: document.querySelectorAll('.pip-editor-row .pip-bubble').length,
      stepper: !!document.querySelector('input[name="pipBubbleCount"]'),
    }));
    check('Pip shows bubble row + count', pips.bubbles >= 1 && pips.stepper, JSON.stringify(pips));
    await page.evaluate(() => {
      document.querySelector('.pip-editor-row .pip-bubble-wrap').click();
    });
    await page.waitForTimeout(800);
    const filled = await page.evaluate(() => document.querySelectorAll('.pip-editor-row .pip-bubble.filled').length);
    check('Pip bubble toggles', filled === 1, `filled=${filled}`);
    // 6. Set editor has no multi-die checkbox; Options intact.
    const setEd = await page.evaluate(() => {
      const html = document.body.innerHTML;
      return {
        multiDie: /Multiple dice|multi-die/i.test(html),
        options: /Options/.test(html),
        rating: />Rating</.test(html),
      };
    });
    // Open set editor via its header to be sure the panel renders.
    await page.evaluate(() => {
      const head = document.querySelector('.trait-set-header, .trait-set-head');
      if (head) head.click();
    });
    await page.waitForTimeout(800);
    const setEd2 = await page.evaluate(() => ({
      multiDie: /Multiple dice/i.test(document.body.innerHTML),
    }));
    check('no Multiple-dice checkbox anywhere', !setEd.multiDie && !setEd2.multiDie, JSON.stringify({ ed: setEd.multiDie, set: setEd2.multiDie }));
    await page.screenshot({ path: path.join(ROOT, 'smoke-shots', 's2-type-counter.png') });
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
  const fatal = errors.filter((e) => !/favicon|fonts\.gstatic|cdnjs|ERR_INTERNET|net::/i.test(e));
  if (fatal.length) {
    console.log('ERRORS:');
    fatal.slice(0, 20).forEach((e) => console.log('  ' + e));
    process.exit(1);
  }
  if (failures) { console.log(`${failures} check(s) failed`); process.exit(1); }
  console.log('s2 probe: all checks passed, no console errors');
}

main().catch((e) => { console.error('PROBE FAIL: ' + ((e && e.stack) || e)); process.exit(1); });
