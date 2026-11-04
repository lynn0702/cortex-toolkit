#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function run(label, command) {
  const start = Date.now();
  process.stdout.write(`\n[GATE] === ${label} ===\n$ ${command}\n`);
  try {
    execSync(command, { cwd: root, stdio: 'inherit' });
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`[PASS] ${label} (${duration}s)`);
  } catch (err) {
    console.error(`\n[FAIL] ${label} failed!`);
    process.exit(1);
  }
}

// 1. Type Check
run('1. Type Check (vue-tsc)', 'npm run check');

// 2. Production Build
run('2. Production Build (webpack + asset versioning)', 'npm run build');

// 3. Test Suites
run('3. Test Suites (vitest + 10 legacy suites)', 'npm test');

// 4. Schema & Data Validation
run('4. Schema & Corpus Validation', 'npm run validate');

// 5. Security audit (v-html check)
console.log('\n[GATE] === 5. Security Audit: v-html scan ===');
const allowedPatterns = [
  'renderText',
  'renderMarkdown',
  'renderNotesText',
  'renderNameHtml',
  'getDieDisplayValue',
  'renderDieValueForPrint',
  'renderDieValue',
  'renderDate',
  'renderDicePreview',
  'singleDieSVG',
  'bundleDiceSVG',
  'renderDieconSVG'
];

function checkVHtml(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkVHtml(full);
    } else if (/\.(vue|ts|js)$/.test(entry.name) && !entry.name.endsWith('.min.js') && !entry.name.endsWith('.bundle.js')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/v-html\s*=\s*["']/.test(line)) {
          const isSafe = allowedPatterns.some(p => line.includes(p));
          if (!isSafe) {
            console.error(`[FAIL] Unsafe or unvetted v-html found in ${path.relative(root, full)}:${idx + 1}`);
            console.error(`Line: ${line.trim()}`);
            process.exit(1);
          }
        }
      });
    }
  }
}
checkVHtml(path.join(root, 'js'));
console.log('[PASS] Security Audit: all v-html instances use vetted renderers');

console.log('\n=========================================');
console.log(' ALL GATES PASSED (Definition of Done) ');
console.log('=========================================\n');

