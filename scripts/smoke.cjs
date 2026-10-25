// Reusable Edit/Print x desktop/phone smoke check (standing rules).
// Usage: node scripts/smoke.cjs [--shots]  (screenshots to ./smoke-shots/)
// Serves the repo root, loads the app, opens the first character when a
// roster is present, captures Edit + Print at both widths, and fails on
// console errors. Exit 1 on failure.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.SMOKE_PORT || '3123', 10);
const SHOTS = process.argv.includes('--shots');
const SHOT_DIR = path.join(ROOT, 'smoke-shots');

const CHROME = path.join(
  process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local'),
  'ms-playwright', 'chromium-1243', 'chrome-win64', 'chrome.exe'
);

async function main() {
  const { chromium } = require('playwright-core');
  const server = spawn(process.execPath, [path.join(__dirname, 'serve.js')], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore',
  });
  const errors = [];
  let browser = null;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      page.on('pageerror', (e) => errors.push(`[${width}] pageerror: ${String(e && e.message || e)}`));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(`[${width}] console: ${m.text()}`);
      });
      await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);
      // Boot to a sheet: open the spotlight library and create from the
      // first template (exercises all renderers), else click New Sheet.
      const opened = await page.evaluate(async () => {
        const app = document.querySelector('#cortex-toolkit');
        if (!app) return 'no-app-root';
        const libBtn = [...document.querySelectorAll('.roster-button')].find((el) => /spotlight library/i.test(el.textContent || ''));
        if (libBtn) {
          libBtn.click();
          await new Promise((r) => setTimeout(r, 1500));
          const first = document.querySelector('.btn-spotlight.primary');
          if (first) { first.click(); await new Promise((r) => setTimeout(r, 1500)); return 'spotlight-created'; }
          return 'library-empty';
        }
        const first = document.querySelector('[data-character-open], .roster-open, .character-open');
        if (first) { first.click(); return 'opened'; }
        const fresh = [...document.querySelectorAll('.roster-button')].find((el) => /new sheet/i.test(el.textContent || ''));
        if (fresh) { fresh.click(); await new Promise((r) => setTimeout(r, 1500)); return 'new-sheet'; }
        return app.textContent.trim().length > 0 ? 'sheet' : 'empty';
      });
      await page.waitForTimeout(1200);
      const tagged = width === 390 ? 'phone' : 'desktop';
      if (SHOTS) {
        fs.mkdirSync(SHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(SHOT_DIR, `edit-${tagged}.png`) });
      }
      const editState = await page.evaluate(() => ({
        url: location.hash,
        body: document.body.innerText.slice(0, 120),
      }));
      // Try print mode via hash if the app uses it, else skip.
      await page.evaluate(() => {
        const printBtn = [...document.querySelectorAll('button, a')].find((el) => /print/i.test(el.textContent || ''));
        if (printBtn) printBtn.click();
      });
      await page.waitForTimeout(1200);
      if (SHOTS) {
        await page.screenshot({ path: path.join(SHOT_DIR, `print-${tagged}.png`), fullPage: true });
      }
      console.log(`${tagged}: boot=${opened} edit=${JSON.stringify(editState.url)} text=${JSON.stringify(editState.body.slice(0, 60))}`);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
  const fatal = errors.filter((e) => !/favicon|fonts\.gstatic|cdnjs|ERR_INTERNET|net::/i.test(e));
  if (fatal.length) {
    console.log('SMOKE ERRORS:');
    fatal.slice(0, 20).forEach((e) => console.log('  ' + e));
    process.exit(1);
  }
  console.log('smoke: clean (no console errors)');
}

main().catch((e) => { console.error('SMOKE FAIL: ' + (e && e.stack || e)); process.exit(1); });
