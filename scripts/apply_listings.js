// Apply DriveThruRPG listing copy to the template corpus (one-shot, then
// regenerate the layered files). Verbatim human copy from the publishers'
// listings (map researched 2026-10-20); code owns structure, words are theirs.
// - Drops entry-level `description` (generated summaries) on all 28 entries.
// - Fixes titles/spotlights: BrighterStars, KitBash, SolarPunk.
// - Adds `listing` per spotlight: full quote/genre/ratings for the 16
//   published settings (variants share their setting's block), URL-only for
//   the core-book settings, none for the Toolkit Reference showcases.
// Usage: node scripts/apply_listings.js  (rewrites js/templates.js)
const fs = require('fs');
const path = require('path');

const MFR = '?manufacturers_id=31866';
const D = 'https://legacy.drivethrurpg.com/product/';
const HANDBOOK_URL = D + '567041/Cortex-Prime-Game-Handbook-2nd-Edition' + MFR;
const HANDBOOK_SPOTLIGHTS = ['Eidolon Alpha', 'Hammerheads', 'TRACE 2.0'];

// Verbatim from the live listings. Genre stored as-is (Safe Zone's pipe is
// data, never a separator).
const LISTINGS = {
  'Alien, Us': {
    url: D + '572304/Alien-Us' + MFR,
    quote: 'You crashed here forty years ago. You learned the language, the customs, the clothes, the way they smile with their teeth showing even when they don\u2019t mean it.',
    genre: 'Cold War Sci-Fi Drama',
    setting: 'd6', prep: 'd6', complexity: 'd8',
  },
  'Brighter Stars': {
    url: D + '568411/Brighter-Stars' + MFR,
    quote: 'The mission was supposed to last ten years. There were supposed to be answers at the end of it.',
    genre: 'Aspirational space opera',
    setting: 'd6', prep: 'd6', complexity: 'd6',
  },
  'Camp Bewilderwood': {
    url: D + '574554/Camp-Bewilderwood' + MFR,
    quote: 'Someone has decided you\u2019re destined for great things. You\u2019re twelve.',
    genre: 'Supernatural summer camp / YA adventure',
    setting: 'd8', prep: 'd6', complexity: 'd8',
  },
  'Cosa Nostra': {
    url: D + '572308/Cosa-Nostra' + MFR,
    quote: 'The Castellammarese War is coming. Everyone in the Five Families knows it.',
    genre: 'Historical Crime Drama',
    setting: 'd8', prep: 'd6', complexity: 'd8',
  },
  'Inheritors': {
    url: D + '572309/Inheritors' + MFR,
    quote: 'Your grandfather stopped an immortal warlord using nothing but a biplane and a stolen amulet. Your great-aunt discovered a lost civilization and barely made it out with her notes.',
    genre: 'Modern Pulp Action-Adventure',
    setting: 'd6', prep: 'd10', complexity: 'd8',
  },
  'Kit Bash!': {
    url: D + '568416/Kit-Bash' + MFR,
    quote: 'You want to run a superhero campaign, but you\u2019re sick of starting with someone else\u2019s universe. What if the table built the world together, from scratch, before the first punch is thrown?',
    genre: 'Superhero',
    setting: 'd6', prep: 'd12', complexity: 'd8',
  },
  'Misty Cove': {
    url: D + '568414/Misty-Cove' + MFR,
    quote: 'The town knows you\u2019re different. They always have.',
    genre: 'Small-town supernatural drama',
    setting: 'd6', prep: 'd6', complexity: 'd8',
  },
  'Necromancer': {
    url: D + '574557/Necromancer' + MFR,
    quote: 'You didn\u2019t ask for this. You were just trying to live your life.',
    genre: 'Urban fantasy',
    setting: 'd8', prep: 'd6', complexity: 'd8',
  },
  'Retired No More': {
    url: D + '567044/Retired-No-More' + MFR,
    quote: 'You had a good run. Crystal artifacts recovered, sky pirates outwitted, ancient ruins plundered.',
    genre: 'Pulp adventure',
    setting: 'd8', prep: 'd6', complexity: 'd8',
  },
  'Safe Zone': {
    url: D + '574559/Safe-Zone' + MFR,
    quote: 'The Rot took the world. The Rotters are still out there, but they\u2019re not the problem anymore.',
    genre: 'Post-apocalyptic zombie survival | Base-building',
    setting: 'd8', prep: 'd8', complexity: 'd8',
  },
  'Snowfall Initiative': {
    url: D + '574560/Snowfall-Initiative' + MFR,
    quote: 'Earth is freezing. Not metaphorically\u2014glaciers are advancing on major cities, temperatures are dropping, and a new ice age has begun.',
    genre: 'Military sci-fi / Norse portal fantasy',
    setting: 'd10', prep: 'd8', complexity: 'd8',
  },
  'Solarpunk': {
    url: D + '568415/Solarpunk' + MFR,
    quote: 'The corporations took everything. The land, the water, the air.',
    genre: 'Near-future eco-punk / hopepunk',
    setting: 'd8', prep: 'd6', complexity: 'd8',
  },
  'Spellcaught': {
    url: D + '572310/Spellcaught' + MFR,
    quote: 'High school is already a crucible. Add magic, and someone\u2019s going to get burned.',
    genre: 'Teenage witches / high school drama',
    setting: 'd6', prep: 'd6', complexity: 'd8',
  },
  'Strange Towns': {
    url: D + '567043/Strange-Towns' + MFR,
    quote: 'There\u2019s something wrong with this town. Maybe it\u2019s the sheriff who never blinks.',
    genre: 'Weird horror / small-town mystery',
    setting: 'd6', prep: 'd6', complexity: 'd6',
  },
  'Terraverse': {
    url: D + '567047/Terraverse' + MFR,
    quote: 'Every world is a version of this one. Some are close \u2014 a step to the left, a slightly different history.',
    genre: 'Science fantasy / multiverse adventure',
    setting: 'd10', prep: 'd10', complexity: 'd10',
  },
  'Titans vs Leviathans': {
    url: D + '567042/Titans-vs-Leviathans' + MFR,
    quote: 'The city shakes. The bay churns.',
    genre: 'Kaiju / mech action',
    setting: 'd8', prep: 'd6', complexity: 'd6',
  },
};

const fix = (s) => typeof s === 'string'
  ? s.replace(/BrighterStars/g, 'Brighter Stars').replace(/KitBash/g, 'Kit Bash!').replace(/SolarPunk/g, 'Solarpunk')
  : s;

// Cover image: DriveThruRPG's public product image — publisher id, then the
// product id from the entry's own listing url. Handbook and showcase entries
// have no cover.
const imageOf = (url) => {
  const m = /\/product\/(\d+)\//.exec(url || '');
  return m ? 'https://legacy.drivethrurpg.com/images/31866/' + m[1] + '.jpg' : null;
};

const templatesPath = path.join(__dirname, '../js/templates.js');
const templates = require(templatesPath);
let listed = 0, handbook = 0, bare = 0;

templates.forEach((entry) => {
  if (!entry || typeof entry !== 'object') return;
  delete entry.description;
  entry.title = fix(entry.title);
  entry.spotlight = fix(entry.spotlight);
  const sp = entry.spotlight;
  delete entry.listing;
  if (sp === 'Toolkit Reference') { bare++; return; }
  if (HANDBOOK_SPOTLIGHTS.indexOf(sp) !== -1) { entry.listing = { url: HANDBOOK_URL }; handbook++; return; }
  if (!LISTINGS[sp]) throw new Error('no listing data for spotlight ' + JSON.stringify(sp) + ' (' + entry.id + ')');
  const L = LISTINGS[sp];
  entry.listing = { url: L.url, quote: L.quote, genre: L.genre, setting: L.setting, prep: L.prep, complexity: L.complexity, image: imageOf(L.url) };
  listed++;
});

const output = `/**\n * Cortex Toolkit - Spotlight Templates Repository (Blank Spotlight Sheets)\n */\nconst cortexSpotlightTemplates = ${JSON.stringify(templates, null, 2)};\n\nif (typeof module !== "undefined" && module.exports) {\n\tmodule.exports = cortexSpotlightTemplates;\n}\n`;
fs.writeFileSync(templatesPath, output, 'utf8');
console.log('entries: ' + templates.length + ', full listings: ' + listed + ', handbook: ' + handbook + ', bare: ' + bare);
