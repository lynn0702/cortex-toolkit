// One-shot §3 relocation: moves dated entries from design/DECISIONS.md to
// design/DECISIONS-history.md verbatim (byte-identical entry text, original
// line endings preserved, source order kept). Run once, then hand-write the
// distilled law file. Verifies the acceptance count before writing.
// Usage: node scripts/split-decisions.cjs
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'design', 'DECISIONS.md');
const DST = path.join(ROOT, 'design', 'DECISIONS-history.md');

const raw = fs.readFileSync(SRC, 'utf8');
const lines = raw.split('\n'); // keeps trailing \r on CRLF lines
const text = (l) => l.replace(/\r$/, '');
const isStart = (l) => /^(- \d{4}-\d{2}-\d{2}|2026-\d{2}-\d{2} )/.test(text(l));
const isHead = (l) => /^#{1,3} /.test(text(l));

// Collect dated entry blocks: start line through line before next start/head/EOF,
// trimming trailing blank lines (separators, not content).
const entries = [];
let section = '';
let i = 0;
while (i < lines.length) {
  const t = text(lines[i]);
  if (/^#{1,3} /.test(t)) {
    section = t.replace(/^#+\s*/, '');
    i++;
    continue;
  }
  if (isStart(lines[i])) {
    let j = i + 1;
    while (j < lines.length && !isStart(lines[j]) && !isHead(lines[j])) j++;
    let end = j;
    while (end - 1 > i && text(lines[end - 1]).trim() === '') end--;
    entries.push({ section, lines: lines.slice(i, end) });
    i = j;
    continue;
  }
  i++;
}

const EXPECTED = 171;
if (entries.length !== EXPECTED) {
  console.error(`count mismatch: found ${entries.length}, expected ${EXPECTED}; refusing to write`);
  process.exit(1);
}

const header = [
  '# DECISIONS-history.md — cortex-toolkit',
  '',
  'Full chronological log. Append-only, as before.',
  '`DECISIONS.md` holds the law distilled from this log; if',
  'the two disagree, this log is the record and the law file',
  'gets corrected.',
  '',
].join('\n');

let out = header;
let lastSection = null;
for (const e of entries) {
  const label = e.section || '(top)';
  if (label !== lastSection) {
    out += `## ${label}\n\n`;
    lastSection = label;
  }
  out += e.lines.join('\n') + '\n\n';
}
fs.writeFileSync(DST, out, 'utf8');

// Verify: re-parse the written file, compare entry-start keys + full text.
const back = fs.readFileSync(DST, 'utf8').split('\n');
const bStarts = back.filter((l) => isStart(l)).map((l) => text(l));
const sStarts = entries.map((e) => text(e.lines[0]));
const sameOrder = bStarts.length === sStarts.length && bStarts.every((v, k) => v === sStarts[k]);
if (!sameOrder) {
  console.error(`verification failed: history starts ${bStarts.length}, source ${sStarts.length}`);
  process.exit(1);
}
console.log(`relocated ${entries.length} dated entries verbatim (${entries.reduce((n, e) => n + e.lines.length, 0)} lines)`);
