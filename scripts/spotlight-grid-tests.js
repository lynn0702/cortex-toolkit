// spotlight-grid regression tests (banded layout engine - rule of 3).
// Usage: node scripts/spotlight-grid-tests.js  (exit 1 on failure)
const G = require('../js/spotlight-grid.ts');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

const ctk = (o) => ({ view: o });

// ---- columnsForPage: always 3 under banded layout engine
{
  ok(G.columnsForPage({ view: { columnsPage2: 3 } }, 2, 2) === 3, 'track count is 3');
  ok(G.columnsForPage({ view: { columnsPage2: 2 } }, 1, 2) === 3, 'page1 track count is 3');
  ok(G.columnsForPage(null, 2, 2) === 3, 'default track count is 3');
}

// ---- spotlightTrackForSet and spotlightSpanForSet
{
  ok(G.spotlightTrackForSet(ctk({ track: 1 })) === 1, 'explicit track 1');
  ok(G.spotlightTrackForSet({ custom: { cortexToolkit: { track: 1 } } }) === 1, 'legacy custom.cortexToolkit track 1 fallback');
  ok(G.spotlightTrackForSet(ctk({ track: 2 })) === 2, 'explicit track 2');
  ok(G.spotlightTrackForSet(ctk({ track: 3 })) === 3, 'explicit track 3');
  ok(G.spotlightTrackForSet(ctk({ location: 'left' })) === 1, 'legacy left -> 1');
  ok(G.spotlightTrackForSet(ctk({ location: 'center' })) === 2, 'legacy center -> 2');
  ok(G.spotlightTrackForSet(ctk({ location: 'right' })) === 3, 'legacy right -> 3');

  ok(G.spotlightSpanForSet(ctk({ span: 1 })) === 1, 'span 1');
  ok(G.spotlightSpanForSet(ctk({ span: 2 })) === 2, 'span 2');
  ok(G.spotlightSpanForSet(ctk({ span: 3 })) === 3, 'span 3');
  ok(G.spotlightSpanForSet(ctk({ colSpan: 'full' })) === 3, 'legacy full -> 3');
  ok(G.spotlightSpanForSet(ctk({ columnSpan: 2 })) === 2, 'legacy 2 -> 2');
}

// ---- sections: sets in tracks placed by track index
{
  const sets = [
    ctk({ track: 1, widths: [30, 50, 20] }),
    ctk({ track: 2 }),
    ctk({ track: 3 })
  ];
  const sections = G.getSpotlightSections(sets, 1);
  ok(sections.length === 1 && sections[0].type === 'columns', 'one column band', sections);
  ok(sections[0].trackCount === 3, 'section trackCount is 3');
  ok(sections[0].itemsByColumn[1].length === 1, 'item in track 1');
  ok(sections[0].itemsByColumn[2].length === 1, 'item in track 2');
  ok(sections[0].itemsByColumn[3].length === 1, 'item in track 3');
  ok(JSON.stringify(sections[0].widths) === JSON.stringify([30, 50, 20]), 'anchor set widths carried', sections[0].widths);
}

// ---- full-width set (span 3) becomes its own full-width section
{
  const sets = [ ctk({ track: 1 }), ctk({ span: 3 }), ctk({ track: 2 }) ];
  const sections = G.getSpotlightSections(sets, 1);
  ok(sections.length === 3 && sections[1].type === 'full-width', 'span 3 split out', sections.map(s => s.type));
}

// ---- rowBreak starts a new band
{
  const sets = [ ctk({ track: 1 }), ctk({ track: 2, rowBreak: true }) ];
  const sections = G.getSpotlightSections(sets, 1);
  ok(sections.length === 2, 'row break splits bands', sections.length);
}

// ---- grid cells placement (track, span, content-sized rows, no rowspans)
{
  const sets = [ ctk({ track: 1, span: 1 }), ctk({ track: 2, span: 2 }) ];
  const section = G.getSpotlightSections(sets, 1)[0];
  const cells = G.getSpotlightGridCells(section);
  ok(cells[0].track === 1 && cells[0].span === 1 && cells[0].col === 1, 'cell 0 track 1 span 1', cells[0]);
  ok(cells[1].track === 2 && cells[1].span === 2 && cells[1].col === 2, 'cell 1 track 2 span 2', cells[1]);
  ok(typeof cells[0].style === 'string' && cells[0].style.includes('grid-column: 1 / span 1'), 'grid-column track 1');
  ok(typeof cells[1].style === 'string' && cells[1].style.includes('grid-column: 2 / span 2'), 'grid-column track 2 span 2');
  ok(cells[0].rowspan === undefined && cells[1].rowspan === undefined, 'rowspan retired per banded engine');
}

// ---- grid style with explicit widths
{
  const sets = [ ctk({ track: 1, widths: [30, 50, 20] }), ctk({ track: 2 }) ];
  const section = G.getSpotlightSections(sets, 1)[0];
  const style = G.getSpotlightGridStyle(section);
  ok(style === 'grid-template-columns: 30% 50% 20%;', 'grid style emits percentages from band widths', style);
}

// ---- default equal thirds when no widths declared
{
  const sets = [ ctk({ track: 1 }), ctk({ track: 2 }), ctk({ track: 3 }) ];
  const section = G.getSpotlightSections(sets, 1)[0];
  const style = G.getSpotlightGridStyle(section);
  ok(style === 'grid-template-columns: 33.333% 33.333% 33.334%;', 'default equal thirds', style);
}

// ---- cluster groups
{
  const items = [
    { traitSet: ctk({ name: 'A' }), index: 0 },
    { traitSet: ctk({ name: 'B', cluster: 'c1' }), index: 1 },
    { traitSet: ctk({ name: 'C', cluster: 'c1' }), index: 2 },
    { traitSet: ctk({ name: 'D' }), index: 3 },
  ];
  const groups = G.getTrackClusterGroups(items);
  ok(groups.length === 3, 'cluster groups count', groups.length);
  ok(groups[0].isCluster === false && groups[0].items.length === 1, 'first standalone');
  ok(groups[1].isCluster === true && groups[1].clusterId === 'c1' && groups[1].items.length === 2, 'cluster grouped');
  ok(groups[2].isCluster === false && groups[2].items.length === 1, 'last standalone');
}

console.log(`spotlight-grid-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
