// spotlight-grid regression tests (pure layout engine).
// Usage: node scripts/spotlight-grid-tests.js  (exit 1 on failure)
const G = require('../js/spotlight-grid.ts');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

const ctk = (o) => ({ custom: { cortexToolkit: o } });

// ---- columnsForPage
{
  ok(G.columnsForPage({ custom: { cortexToolkit: { columnsPage2: 3 } } }, 2, 2) === 3, 'page2 override 3');
  ok(G.columnsForPage({ custom: { cortexToolkit: { columnsPage2: 3 } } }, 1, 2) === 2, 'page1 ignores override');
  ok(G.columnsForPage(null, 2, 2) === 2, 'no override -> default');
}

// ---- column / width helpers
{
  ok(G.getTraitSetColumn(ctk({ location: 'right' })) === 'right', 'right location');
  ok(G.getTraitSetColumn(ctk({ location: 'center' })) === 'left', 'center folds left');
  ok(G.isFullWidthClassic(ctk({ colSpan: 'full' })) === true, 'full span');
  ok(G.isFullWidthClassic(ctk({ columnSpan: 2 })) === true, '2 span');
  ok(G.isFullWidthClassic(ctk({ colSpan: 1 })) === false, 'single span');
}

// ---- sections: two single-track sets in one band
{
  const sets = [ ctk({ location: 'left' }), ctk({ location: 'right' }) ];
  const sections = G.getSpotlightSections(sets, 1, 2);
  ok(sections.length === 1 && sections[0].type === 'columns', 'one column band', sections);
  ok(sections[0].itemsByColumn.left.length === 1 && sections[0].itemsByColumn.right.length === 1, 'items placed per column');
}

// ---- full-width set becomes its own full-width section
{
  const sets = [ ctk({ location: 'left' }), ctk({ colSpan: 'full' }), ctk({ location: 'right' }) ];
  const sections = G.getSpotlightSections(sets, 1, 2);
  ok(sections.length === 3 && sections[1].type === 'full-width', 'full-width split out', sections.map(s => s.type));
}

// ---- rowBreak starts a new band
{
  const sets = [ ctk({ location: 'left' }), ctk({ location: 'right', rowBreak: true }) ];
  const sections = G.getSpotlightSections(sets, 1, 2);
  ok(sections.length === 2, 'row break splits bands', sections.length);
}

// ---- grid cells placement + auto rowspan stretch
{
  const sets = [ ctk({ location: 'left' }), ctk({ location: 'right', rowSpan: 2 }) ];
  const section = G.getSpotlightSections(sets, 1, 2)[0];
  const cells = G.getSpotlightGridCells(section);
  ok(cells[0].row === 1 && cells[0].col === 1 && cells[0].span === 1, 'cell 0 at row1 col1', cells[0]);
  ok(cells[1].row === 1 && cells[1].col === 2 && cells[1].rowspan === 2, 'cell 1 right col rowspan 2', cells[1]);
  ok(typeof cells[0].style === 'string' && cells[0].style.includes('grid-row'), 'style string built');
}

// ---- grid style with an explicit width share
{
  const sets = [ ctk({ location: 'left', colWidth: 66 }), ctk({ location: 'right' }) ];
  const section = G.getSpotlightSections(sets, 1, 2)[0];
  const style = G.getSpotlightGridStyle(section);
  ok(style.startsWith('grid-template-columns:') && style.includes('66fr'), 'explicit track width', style);
}

// ---- equal share when no widths
{
  const sets = [ ctk({ location: 'left' }), ctk({ location: 'right' }) ];
  const section = G.getSpotlightSections(sets, 1, 2)[0];
  ok(G.getSpotlightGridStyle(section) === '', 'no widths -> empty style');
}

console.log(`spotlight-grid-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
