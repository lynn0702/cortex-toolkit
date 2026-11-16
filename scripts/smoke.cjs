// Portable desktop (1440x900) + mobile (390x844) real-browser smoke check.
// Usage: node scripts/smoke.cjs [--shots]  (screenshots to ./smoke-shots/)
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.SMOKE_PORT || '3123', 10);
const SHOTS = process.argv.includes('--shots');
const SHOT_DIR = path.join(ROOT, 'smoke-shots');
const AXE_MIN_PATH = path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js');

function buildSelfHostedFontPattern() {
	try {
		const css = fs.readFileSync(path.join(ROOT, 'css', 'fonts.css'), 'utf8');
		const families = [...new Set([...css.matchAll(/font-family:\s*['"]([^'"]+)['"]/g)].map((m) => m[1].trim()))];
		if (families.length > 0) {
			const alts = families.map((fam) => fam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '(?:\\+|%20|\\s)'));
			return new RegExp(alts.join('|'), 'i');
		}
	} catch {
		// fall back to base defaults
	}
	return /josefin|open(?:\+|%20)sans|alegreya/i;
}

const SELF_HOSTED_FONT_RE = buildSelfHostedFontPattern();

async function runLiveAxeAudit(page, stageLabel, errors) {
	if (!fs.existsSync(AXE_MIN_PATH)) return;
	const hasAxe = await page.evaluate(() => Boolean(window.axe));
	if (!hasAxe) return;
	const violations = await page.evaluate(async () => {
		const res = await window.axe.run(document, {
			runOnly: {
				type: 'tag',
				values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
			},
		});
		return res.violations.map((v) => ({
			id: v.id,
			impact: v.impact,
			help: v.help,
			targets: v.nodes.slice(0, 3).map((n) => n.target),
		}));
	});
	for (const v of violations) {
		errors.push(`[${stageLabel}] axe ${v.id} (${v.impact}): ${v.help} -> ${JSON.stringify(v.targets)}`);
	}
}

async function runBothThemesAxeAudit(page, stageLabel, errors) {
	await page.evaluate(() => {
		document.documentElement.setAttribute('data-theme', 'light');
		document.documentElement.classList.remove('theme-dark');
	});
	await page.waitForTimeout(220);
	await runLiveAxeAudit(page, `${stageLabel}:light`, errors);

	await page.evaluate(() => {
		document.documentElement.setAttribute('data-theme', 'dark');
		document.documentElement.classList.add('theme-dark');
	});
	await page.waitForTimeout(220);
	await runLiveAxeAudit(page, `${stageLabel}:dark`, errors);

	await page.evaluate(() => {
		document.documentElement.setAttribute('data-theme', 'light');
		document.documentElement.classList.remove('theme-dark');
	});
	await page.waitForTimeout(100);
}

function resolvePlaywrightCore() {
	if (process.env.PLAYWRIGHT_CORE_DIR) {
		return require(process.env.PLAYWRIGHT_CORE_DIR);
	}
	try {
		return require('playwright-core');
	} catch {
		// Fall through to npx cache discovery
	}
	const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
	const cacheRoots = [path.join(localAppData, 'npm-cache', '_npx'), path.join(os.homedir(), '.npm', '_npx')];
	for (const root of cacheRoots) {
		if (!fs.existsSync(root)) continue;
		for (const entry of fs.readdirSync(root)) {
			const candidate = path.join(root, entry, 'node_modules', 'playwright-core');
			if (fs.existsSync(candidate)) {
				return require(candidate);
			}
		}
	}
	throw new Error('Could not resolve playwright-core. Install it or set PLAYWRIGHT_CORE_DIR.');
}

function resolveChromeExecutable() {
	if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
		return process.env.CHROME_PATH;
	}
	const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
	const msPlaywrightDir = path.join(localAppData, 'ms-playwright');
	if (fs.existsSync(msPlaywrightDir)) {
		const dirs = fs
			.readdirSync(msPlaywrightDir)
			.filter((d) => /^chromium-/i.test(d))
			.sort()
			.reverse();
		for (const d of dirs) {
			const winExe = path.join(msPlaywrightDir, d, 'chrome-win64', 'chrome.exe');
			if (fs.existsSync(winExe)) return winExe;
			const linExe = path.join(msPlaywrightDir, d, 'chrome-linux64', 'chrome');
			if (fs.existsSync(linExe)) return linExe;
		}
	}
	const commonPaths = [
		'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
		'/usr/bin/google-chrome',
		'/usr/bin/chromium',
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	];
	for (const p of commonPaths) {
		if (fs.existsSync(p)) return p;
	}
	return undefined;
}

async function runViewportSmoke(browser, width, height, tag, errors, fontRequests) {
	const context = await browser.newContext({ viewport: { width, height } });
	if (fs.existsSync(AXE_MIN_PATH)) {
		await context.addInitScript({ path: AXE_MIN_PATH });
	}
	const page = await context.newPage();
	await page.addInitScript(() => {
		window.__smokeCls = 0;
		try {
			const po = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (!entry.hadRecentInput) window.__smokeCls += entry.value || 0;
				}
			});
			po.observe({ type: 'layout-shift', buffered: true });
		} catch (_e) {}
	});
	page.on('pageerror', (e) => errors.push(`[${tag}] pageerror: ${String((e && e.message) || e)}`));
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(`[${tag}] console: ${m.text()}`);
	});
	page.on('request', (req) => {
		const url = req.url();
		if (/fonts\.googleapis\.com/i.test(url) && SELF_HOSTED_FONT_RE.test(url)) {
			fontRequests.push(`[${tag}] blocked remote self-hosted font request: ${url}`);
		}
	});

	try {
		await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle', timeout: 30000 });
		await page.waitForSelector('.character-sheet', { timeout: 10000 });
		await page.waitForTimeout(400);
		await runBothThemesAxeAudit(page, `${tag}:splash`, errors);

		const initialCls = await page.evaluate(() => Number(window.__smokeCls || 0));
		if (initialCls > 0.1) {
			errors.push(`[${tag}] Initial load CLS ${initialCls.toFixed(3)} exceeds Core Web Vitals 0.10 threshold`);
		}

		// 1. Splash preview -> "Use this template"
		const useTemplateBtn = page.locator('.btn-update-primary', { hasText: /use this template/i });
		let splashAction = 'already-loaded';
		if ((await useTemplateBtn.count()) > 0) {
			await useTemplateBtn.first().click();
			splashAction = 'used-template';
			await page.waitForSelector('.character-sheet.submode-edit', { timeout: 10000 });
		}

		const editHasSheet = await page.evaluate(() => Boolean(document.querySelector('.character-sheet')));
		if (!editHasSheet) {
			throw new Error(`[${tag}] Edit mode did not render .character-sheet`);
		}
		await page.waitForTimeout(300);
		await runBothThemesAxeAudit(page, `${tag}:edit`, errors);
		if (SHOTS) {
			fs.mkdirSync(SHOT_DIR, { recursive: true });
			await page.screenshot({ path: path.join(SHOT_DIR, `edit-${tag}.png`) });
		}

		// 2. Switch to Play -> open Command Palette on desktop -> open Roller -> stage a die -> Roll -> verify Roll Log
		await page.locator('button[aria-label="Play"]').first().click();
		await page.waitForSelector('.character-sheet.submode-play', { timeout: 5000 });
		await page.waitForTimeout(300);
		await runBothThemesAxeAudit(page, `${tag}:play`, errors);

		if (width >= 1024) {
			await page.keyboard.press('Control+k');
			const paletteInput = page.locator('#command-palette-input');
			await paletteInput.waitFor({ state: 'visible', timeout: 5000 });
			await paletteInput.fill('Data');
			await page.keyboard.press('Escape');
			await paletteInput.waitFor({ state: 'hidden', timeout: 5000 });
		}

		const expandPill = page.locator('.btn-pill-expand');
		if (width <= 768) {
			if (await page.locator('.session-nav').isVisible()) {
				throw new Error(`[${tag}] .session-nav should be hidden on mobile (${width}px)`);
			}
			await expandPill.first().click();
			await page.locator('.studio-panel.is-play[data-state="split"]').waitFor({ state: 'visible', timeout: 5000 });

			const d8Btn = page.locator('.die-btn[aria-label="Add d8"]').first();
			await d8Btn.waitFor({ state: 'visible', timeout: 5000 });
			await d8Btn.click();

			await page.locator('button[aria-label="Expand roller"]').first().click();
			await page.locator('.studio-panel.is-play[data-state="full"]').waitFor({ state: 'visible', timeout: 5000 });

			await page.locator('.roller-roll-btn').first().click();
			await page.locator('.roller-log-section').waitFor({ state: 'attached', timeout: 5000 });
			var hasRollLog = true;

			await page.keyboard.press('Escape').catch(() => {});
			await page.waitForTimeout(200);
			await page.evaluate(() => {
				const dlg = document.querySelector('#rollDialog');
				if (dlg && typeof dlg.close === 'function' && dlg.hasAttribute('open')) dlg.close();
			});

			await page.locator('button[aria-label="Close roller"]').first().click();
			await page.locator('.mobile-roller-pill-bar').waitFor({ state: 'visible', timeout: 5000 });

			await page.locator('.mobile-sheet-trigger').first().click();
			await page.locator('#mobile-sheet-menu button[aria-label="Print"]').first().click();
			await page.waitForSelector('.character-sheet.submode-print', { timeout: 5000 });
		} else {
			if ((await expandPill.count()) > 0 && (await expandPill.first().isVisible())) {
				await expandPill.first().click();
				await page.waitForTimeout(250);
			}

			const d8Btn = page.locator('.die-btn[aria-label="Add d8"]').first();
			await d8Btn.waitFor({ state: 'visible', timeout: 5000 });
			await d8Btn.click();
			await page.locator('.roller-roll-btn').first().click();
			await page.locator('.roller-log-section').waitFor({ state: 'attached', timeout: 5000 });
			var hasRollLog = true;

			await page.keyboard.press('Escape').catch(() => {});
			await page.waitForTimeout(250);
			await page.evaluate(() => {
				const dlg = document.querySelector('#rollDialog');
				if (dlg && typeof dlg.close === 'function' && dlg.hasAttribute('open')) dlg.close();
			});
			const closeDrawer = page.locator(
				'.dice-roller-sidebar .roller-close-btn, .dice-roller-sidebar button[aria-label*="Close" i]',
			);
			if ((await closeDrawer.count()) > 0 && (await closeDrawer.first().isVisible())) {
				await closeDrawer.first().click();
				await page.waitForTimeout(200);
			}

			// 3. Switch to Print view
			await page.locator('button[aria-label="Print"]').first().click();
			await page.waitForSelector('.character-sheet.submode-print', { timeout: 5000 });
		}
		if (SHOTS) {
			await page.screenshot({ path: path.join(SHOT_DIR, `print-${tag}.png`), fullPage: true });
		}

		// 4. Navigate to Roster
		await page.locator('.header button[aria-label="Roster"]').first().click();
		await page.waitForSelector('.roster-item', { timeout: 5000 });
		const rosterItems = await page.locator('.roster-item').count();
		if (rosterItems < 1) {
			throw new Error(`[${tag}] Roster rendered 0 items after template use`);
		}
		await runBothThemesAxeAudit(page, `${tag}:roster`, errors);

		console.log(
			`${tag} (${width}x${height}): splash=${splashAction}, rollLog=${hasRollLog}, rosterItems=${rosterItems}, initialCLS=${initialCls.toFixed(3)}`,
		);
	} finally {
		await context.close();
	}
}

async function main() {
	if (
		!fs.existsSync(path.join(ROOT, 'js/app.min.js')) ||
		!fs.existsSync(path.join(ROOT, 'css/app.min.css')) ||
		!fs.existsSync(path.join(ROOT, 'js/templates.bundle.js'))
	) {
		execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
	}
	const { chromium } = resolvePlaywrightCore();
	const executablePath = resolveChromeExecutable();
	const server = spawn(process.execPath, [path.join(__dirname, 'serve.js')], {
		env: { ...process.env, PORT: String(PORT), NO_WATCH: '1' },
		stdio: 'ignore',
	});
	const errors = [];
	const fontRequests = [];
	let browser = null;
	try {
		await new Promise((resolve) => setTimeout(resolve, 1200));
		browser = await chromium.launch({
			...(executablePath ? { executablePath } : {}),
			args: ['--no-sandbox'],
		});
		await runViewportSmoke(browser, 1440, 900, 'desktop', errors, fontRequests);
		await runViewportSmoke(browser, 390, 844, 'mobile', errors, fontRequests);
	} finally {
		if (browser) await browser.close();
		server.kill();
	}

	const fatal = errors.filter((e) => !/favicon/i.test(e));
	if (fontRequests.length) {
		console.log('REMOTE FONT REQUESTS DETECTED:');
		fontRequests.forEach((r) => console.log('  ' + r));
		process.exit(1);
	}
	if (fatal.length) {
		console.log('SMOKE ERRORS:');
		fatal.slice(0, 20).forEach((e) => console.log('  ' + e));
		process.exit(1);
	}
	console.log(
		'smoke: clean (desktop 1440x900 + mobile 390x844, light+dark WCAG 2.2 AA axe + contrast, CLS <= 0.10, 0 console errors, 0 remote font requests)',
	);
}

main().catch((e) => {
	console.error('SMOKE FAIL: ' + ((e && e.stack) || e));
	process.exit(1);
});
