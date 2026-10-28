// spotlight-grid regression tests (nested-grid layout, explicit coordinates).
// Usage: node scripts/spotlight-grid-tests.js  (exit 1 on failure)
const G = require('../js/spotlight-grid.ts');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

const ctk = (o) => ({ view: o });

// ---- parsePct / formatPct: the unit rides in the value
{
  ok(G.parsePct('25%') === 25, 'pct string');
  ok(G.parsePct('32.5%') === 32.5, 'decimal pct');
  ok(G.parsePct(25) === 25, 'bare number accepted on input');
  ok(G.parsePct('25') === null, 'unitless string rejected');
  ok(G.parsePct(null) === null, 'null rejected');
  ok(G.formatPct(25) === '25%', 'stored form carries unit');
  ok(G.formatPct(33.333333) === '33.333%', 'three decimals');
}

// ---- placeOf: sparse full-width stacking + malformed stacks safely
{
  ok(G.placeOf(ctk({})) === null, 'absent place stacks');
  ok(JSON.stringify(G.placeOf(ctk({ place: { left: '25%', top: 1, width: '65%', height: 2 } }))) ===
    JSON.stringify({ left: 25, top: 1, width: 65, height: 2 }), 'place parses');
  ok(G.placeOf(ctk({ place: { left: 25, top: 0, width: 50, height: 1 } })) !== null, 'bare numbers parse (import-time)');
  ok(G.placeOf(ctk({ place: { left: '25%', top: 0, width: 0, height: 1 } })) === null, 'zero width invalid');
  ok(G.placeOf(ctk({ place: { left: '80%', top: 0, width: '30%', height: 1 } })) === null, 'over-wide invalid');
  ok(G.placeOf(ctk({ place: { left: '0%', top: -1, width: '50%', height: 1 } })) === null, 'negative top invalid');
}

// ---- normalizePlace: bare numbers become "%" strings in place
{
  const set = ctk({ place: { left: 25, top: 0, width: 50, height: 1 } });
  ok(G.normalizePlace(set) === true, 'normalization rewrites');
  ok(set.view.place.left === '25%' && set.view.place.width === '50%', 'unit stored');
  ok(G.normalizePlace(ctk({ place: { left: '25%', top: 0, width: '50%', height: 1 } })) === false, 'stored form untouched');
}

// ---- columnsFromEdges: union intervals, gaps legal
{
  ok(JSON.stringify(G.columnsFromEdges([{ left: 0, width: 25 }, { left: 25, width: 75 }])) === JSON.stringify([25, 75]), 'shared edge, no gap');
  ok(JSON.stringify(G.columnsFromEdges([{ left: 0, width: 30 }, { left: 30, width: 60 }, { left: 90, width: 10 }])) === JSON.stringify([30, 60, 10]), 'sidebar edges');
  ok(JSON.stringify(G.columnsFromEdges([{ left: 33, width: 67 }])) === JSON.stringify([33, 67]), 'gap survives as interval');
  ok(JSON.stringify(G.columnsFromEdges([])) === JSON.stringify([100]), 'empty fallback');
}

// ---- four across: no column count, no special case
{
  const sets = [0, 25, 50, 75].map((left) => ctk({ place: { left: left + '%', top: 0, width: '25%', height: 1 } }));
  const sections = G.getSpotlightSections(sets, 1);
  ok(sections.length === 1 && sections[0].type === 'grid', 'one grid section', sections.length);
  ok(G.getSpotlightGridStyle(sections[0]) === 'grid-template-columns: 25% 25% 25% 25%;', 'four equal tracks', G.getSpotlightGridStyle(sections[0]));
  const cells = G.getSpotlightGridCells(sections[0]);
  ok(cells.length === 4 && cells[3].col === 4 && cells[3].span === 1, 'fourth cell placed', cells);
}

// ---- sections: same top groups across document distance, unplaced stack,
// adjacent placed groups merge into one grid with rows from top edges
{
  const sets = [
    ctk({ place: { left: '0%', top: 0, width: '33%', height: 1 } }),
    ctk({ place: { left: '0%', top: 1, width: '33%', height: 1 } }),
    ctk({ place: { left: '33%', top: 0, width: '67%', height: 1 } }),
  ];
  const sections = G.getSpotlightSections(sets, 1);
  ok(sections.length === 1 && sections[0].type === 'grid', 'adjacent tops merge into one grid', sections.length);
  ok(sections[0].ordered.length === 3, 'top mates join across distance', sections[0].ordered.length);
  const cells = G.getSpotlightGridCells(sections[0]);
  ok(cells[0].col === 1 && cells[1].col === 2, 'column lines from union edges', cells);
  ok(cells[0].style.includes('grid-row: 1 / 2') && cells[2].style.includes('grid-row: 2 / 3'), 'rows from top edges', [cells[0].style, cells[2].style]);
}
{
  const sets = [ctk({}), ctk({ place: { left: '0%', top: 0, width: '50%', height: 1 } })];
  const sections = G.getSpotlightSections(sets, 1);
  ok(sections.length === 2 && sections[0].type === 'full-width' && sections[1].type === 'grid', 'unplaced stacks in order', sections.map((s) => s.type));
}
{
  // Unplaced between placed groups splits the grids.
  const sets = [
    ctk({ place: { left: '0%', top: 0, width: '50%', height: 1 } }),
    ctk({}),
    ctk({ place: { left: '0%', top: 1, width: '50%', height: 1 } }),
  ];
  const sections = G.getSpotlightSections(sets, 1);
  ok(sections.length === 3 && sections[1].type === 'full-width', 'unplaced splits grids', sections.map((s) => s.type));
}

// ---- height is a floor: grid-row span plus min-height, full-height strip
{
  const sets = [
    ctk({ place: { left: '0%', top: 0, width: '30%', height: 1 } }),
    ctk({ place: { left: '30%', top: 0, width: '60%', height: 1 } }),
    ctk({ place: { left: '0%', top: 1, width: '30%', height: 1 } }),
    ctk({ place: { left: '90%', top: 0, width: '10%', height: 4 } }),
  ];
  const sections = G.getSpotlightSections(sets, 1);
  ok(sections.length === 1, 'one merged grid', sections.length);
  const cells = G.getSpotlightGridCells(sections[0]);
  const strip = cells[2];
  ok(strip.rowSpan === 4 && strip.style.includes('grid-row: 1 / 4') && strip.style.includes('min-height'), 'strip spans the full height', strip);
}

// ---- findPlaceOverlaps: strict 2D, shared edges fine, gaps legal
{
  const at = (left, top, width, height, index) => ({ index, place: { left, top, width, height } });
  ok(G.findPlaceOverlaps([at(0, 0, 50, 1, 0), at(50, 0, 50, 1, 1)]).length === 0, 'shared edge, no overlap');
  ok(G.findPlaceOverlaps([at(0, 0, 60, 1, 0), at(50, 0, 50, 1, 1)]).length === 1, 'horizontal overlap');
  ok(G.findPlaceOverlaps([at(0, 0, 50, 1, 0), at(0, 1, 50, 1, 1)]).length === 0, 'stacked rows, no overlap');
  ok(G.findPlaceOverlaps([at(0, 0, 50, 2, 0), at(0, 1, 50, 1, 1)]).length === 1, 'tall overlap');
}

// ---- buildParts: additive composition
{
  const inline = G.buildParts({ rating: 'inline', ratingDice: 5, trackDice: 0, description: false, block: false, subtraits: false });
  ok(inline.name.width === '70%' && inline.rating.width === '30%' && inline.rating.top === 0, 'inline row', inline);
  const track = G.buildParts({ rating: 'inline', ratingDice: 5, trackDice: 5, description: false, block: false, subtraits: false });
  ok(track.name.width === '30%' && track.rating.width === '30%' && track.trackLabel.width === '13%' && track.track.width === '27%', 'four columns', track);
  ok(track.track.left === '73%', 'track starts at 73', track.track.left);
  const below = G.buildParts({ rating: 'below', ratingDice: 5, trackDice: 0, description: true, block: false, subtraits: false });
  ok(below.name.top === 0 && below.rating.top === 1 && below.description.top === 2, 'below adds rows, description after', below);
  const above = G.buildParts({ rating: 'above', ratingDice: 4, trackDice: 0, description: false, block: true, subtraits: false });
  ok(above.rating.top === 0 && above.name.top === 1 && above.block.top === 2, 'above pushes name down, block after', above);
  const none = G.buildParts({ rating: 'none', ratingDice: 0, trackDice: 0, description: false, block: false, subtraits: false });
  ok(none.rating === undefined && none.name.width === '100%', 'none has no rating cell', none);
  const stacked = G.buildParts({ rating: 'below', ratingDice: 5, trackDice: 5, description: false, block: false, subtraits: false });
  ok(stacked.trackLabel.top === 2 && stacked.track.top === 3, 'stacked track rows below', stacked);
}

// ---- partsGridStyle: data-exact tracks plus the min-content name floor
{
  const grid = G.partsGrid({ name: { left: '0%', top: 0, width: '30%', height: 1 }, rating: { left: '30%', top: 0, width: '30%', height: 1 }, trackLabel: { left: '60%', top: 0, width: '13%', height: 1 }, track: { left: '73%', top: 0, width: '27%', height: 1 } });
  ok(G.partsGridStyle(grid) === 'grid-template-columns: 30% 30% 13% 27%;', 'plain percent tracks', G.partsGridStyle(grid));
  ok(G.partsGridStyle(grid, true) === 'grid-template-columns: minmax(min-content, 1fr) 30% 13% 27%;', 'name track floors at min-content', G.partsGridStyle(grid, true));
  const stacked = G.partsGrid({ name: { left: '0%', top: 0, width: '100%', height: 1 }, rating: { left: '0%', top: 1, width: '100%', height: 1 } });
  ok(G.partsGridStyle(stacked, true) === 'grid-template-columns: 100%;', 'single-track rows unaffected', G.partsGridStyle(stacked, true));
  ok(G.partCellStyle(grid, 'track') === 'grid-column: 4 / span 1; grid-row: 1 / span 1; min-width: 0;', 'part cell lines', G.partCellStyle(grid, 'track'));
}

console.log(`spotlight-grid-tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
