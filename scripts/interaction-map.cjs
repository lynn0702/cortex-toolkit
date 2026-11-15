#!/usr/bin/env node
// Feature State Graph, Shortest-Path Calculator & Live Playwright Journey Counter.
//
// Usage:
//   node scripts/interaction-map.cjs                        # Static summary + matrices + hotspots
//   node scripts/interaction-map.cjs --from <id> --to <id>  # Shortest path across input profiles
//   node scripts/interaction-map.cjs --live                 # Static + real Chromium (1440x900 & 390x844) journeys
//   node scripts/interaction-map.cjs --json [--live]        # Machine-readable JSON output

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.INTERACTION_PORT || '3124', 10);

const PROFILES = ['desktopPointer', 'desktopKeyboard', 'mobileTouch'];
const PROFILE_LABELS = {
	desktopPointer: 'Desktop Pointer (1440x900)',
	desktopKeyboard: 'Desktop Keyboard + Pointer (1440x900)',
	mobileTouch: 'Mobile Touch (390x844)',
};

// ---------------------------------------------------------------------------
// 1. Canonical App Locations (22 nodes covering all 43 COMPONENT_CENSUS surfaces)
// ---------------------------------------------------------------------------
const NODES = [
	{
		id: 'splash_preview',
		label: 'Showcase Preview',
		state: "mode='character', isPreview=true",
		censusRefs: [1, 43],
		entrySelector: '.template-preview-banner',
	},
	{
		id: 'roster',
		label: 'Roster Directory',
		state: "mode='roster'",
		censusRefs: [2, 5, 13, 41],
		entrySelector: 'section.roster',
	},
	{
		id: 'roster_library',
		label: 'Template Library Modal',
		state: "mode='roster', showLibrary=true",
		censusRefs: [9, 22, 30, 42],
		entrySelector: 'dialog.modal-library',
	},
	{
		id: 'roster_card_builder',
		label: 'Card Builder Modal (TraitSetMini)',
		state: 'showTraitSetMini=true',
		censusRefs: [37],
		entrySelector: 'dialog.trait-set-mini-dialog',
	},
	{
		id: 'create_canvas',
		label: 'Create Sheet Canvas',
		state: "mode='character', submode='edit', editing=[]",
		censusRefs: [1, 2, 3, 4, 8, 9, 13, 16, 17, 18, 19, 20, 21, 22],
		entrySelector: '.character-sheet.submode-edit',
	},
	{
		id: 'create_sheet_tab',
		label: 'Sheet Identity & Portrait Inspector',
		state: "submode='edit', panelTab='properties', sheetTab='sheet'",
		censusRefs: [6, 23, 31, 38],
		entrySelector: '#studio-tab-sheet[aria-selected="true"]',
	},
	{
		id: 'create_page_tab',
		label: 'Page Band & Column Map (PageLayoutMini)',
		state: "submode='edit', panelTab='properties', sheetTab='page'",
		censusRefs: [6, 23, 28],
		entrySelector: '#studio-tab-page[aria-selected="true"]',
	},
	{
		id: 'create_theme_tab',
		label: 'Theme & Dice Style Inspector',
		state: "submode='edit', panelTab='properties', sheetTab='theme'",
		censusRefs: [6, 23, 31],
		entrySelector: '#studio-tab-theme[aria-selected="true"]',
	},
	{
		id: 'create_set_inspector',
		label: 'Trait Set Inspector (Content & Layout)',
		state: "submode='edit', editing=['traitSet', s]",
		censusRefs: [6, 12, 25, 26, 27, 32, 38, 42],
		entrySelector: '.studio-panel input[name="traitSetName"]',
	},
	{
		id: 'create_trait_inspector',
		label: 'Trait / Subtrait / SFX Inspector',
		state: "submode='edit', editing=['trait', s, t]",
		censusRefs: [6, 11, 38],
		entrySelector: '.studio-panel aside.editor.open .editor-copy',
	},
	{
		id: 'create_json_tab',
		label: 'Raw JSON Inspector',
		state: "submode='edit', panelTab='json'",
		censusRefs: [6, 34],
		entrySelector: '.studio-panel .json-editor',
	},
	{
		id: 'create_inline_presets',
		label: 'Inline Add-Set Preset Drawer',
		state: "submode='edit', showInlineAddSet=true",
		censusRefs: [35],
		entrySelector: '.inline-add-set-area',
	},
	{
		id: 'play_identity',
		label: 'Play Sheet — Identity / Top Band',
		state: "submode='play', drawer='staged', pillar='identity' (mobile) / page top (desktop)",
		censusRefs: [1, 2, 8, 13, 14, 15, 16, 24],
		entrySelector: '.character-sheet.submode-play',
	},
	{
		id: 'play_traits',
		label: 'Play Sheet — Rated Trait Sets / Pillars',
		state: "submode='play', drawer='staged', pillar='prime|plus|play'",
		censusRefs: [1, 3, 4, 9, 14, 15, 17, 18, 19, 20, 21, 22],
		entrySelector: '.character-sheet.submode-play [aria-label^="Stage d"]',
	},
	{
		id: 'play_roller_split',
		label: 'Play Dice Roller (Docked / Split 38.2dvh)',
		state: "submode='play', panelTab='roller', drawer='split' (mobile) / docked (desktop)",
		censusRefs: [6, 7, 40],
		entrySelector: '.dice-roller-sidebar',
	},
	{
		id: 'play_roller_full',
		label: 'Play Dice Roller — Full Workspace (100dvh Mobile)',
		state: "submode='play', panelTab='roller', drawer='full' (mobile) / docked (desktop)",
		censusRefs: [6, 7, 40],
		entrySelector: '.roller-roll-btn',
	},
	{
		id: 'play_outcome',
		label: 'Roll Outcome Breakdown / Dialog',
		state: "submode='play', isRolled=true",
		censusRefs: [10],
		entrySelector: '.outcome-shell, dialog#rollDialog[open]',
	},
	{
		id: 'play_trait_inspector',
		label: 'Play Trait Quick-Stepper Inspector',
		state: "submode='play', editing=['trait', s, t], panelTab='properties'",
		censusRefs: [6, 11],
		entrySelector: '.studio-panel.is-play aside.editor.open',
	},
	{
		id: 'play_preset_gallery',
		label: 'Play Session Card Gallery Modal',
		state: "submode='play', showPlayPresetPicker=true",
		censusRefs: [35, 42],
		entrySelector: 'dialog.modal-style-gallery',
	},
	{
		id: 'mobile_sheet_menu',
		label: 'Mobile Header Sheet Menu Popover',
		state: "mode='character', #mobile-sheet-menu:popover-open",
		censusRefs: [13, 39],
		entrySelector: '#mobile-sheet-menu',
	},
	{
		id: 'session_add_modal',
		label: 'Open Sheet Alongside Modal',
		state: 'isAddCharacterModalOpen=true',
		censusRefs: [36, 42],
		entrySelector: 'dialog.modal-session-add',
	},
	{
		id: 'command_palette',
		label: 'Command Palette (Ctrl+K / /)',
		state: 'isPaletteOpen=true',
		censusRefs: [33, 42],
		entrySelector: 'dialog.modal-command-palette',
	},
	{
		id: 'print_preview',
		label: 'Print Preview & Sticky Toolbar',
		state: "mode='character', submode='print'",
		censusRefs: [1, 29],
		entrySelector: '.character-sheet.submode-print',
	},
	{
		id: 'about',
		label: 'About & Legal Colophon',
		state: "mode='about'",
		censusRefs: [41, 43],
		entrySelector: 'article.about',
	},
];

const NODE_MAP = new Map(NODES.map((n) => [n.id, n]));

const DESKTOP_PROFILES = ['desktopPointer', 'desktopKeyboard'];
const ALL_PROFILES = ['desktopPointer', 'desktopKeyboard', 'mobileTouch'];

// Global header contexts where .header is visible and unobstructed:
// Note: on mobileTouch, play_roller_full (100dvh) collapses .header and modal dialogs trap focus!
const DESKTOP_HEADER_LOCS = [
	'splash_preview',
	'roster',
	'create_canvas',
	'create_sheet_tab',
	'create_page_tab',
	'create_theme_tab',
	'create_set_inspector',
	'create_trait_inspector',
	'create_json_tab',
	'create_inline_presets',
	'play_identity',
	'play_traits',
	'play_roller_split',
	'play_roller_full',
	'play_outcome',
	'play_trait_inspector',
	'print_preview',
	'about',
];

const MOBILE_HEADER_LOCS = [
	'splash_preview',
	'roster',
	'create_canvas',
	'create_sheet_tab',
	'create_page_tab',
	'create_theme_tab',
	'create_set_inspector',
	'create_trait_inspector',
	'create_json_tab',
	'create_inline_presets',
	'play_identity',
	'play_traits',
	'play_roller_split',
	'play_trait_inspector',
	'print_preview',
	'about',
];

const DESKTOP_CHARACTER_HEADER_LOCS = DESKTOP_HEADER_LOCS.filter((id) => id !== 'roster' && id !== 'about');
const MOBILE_CHARACTER_HEADER_LOCS = MOBILE_HEADER_LOCS.filter(
	(id) => id !== 'roster' && id !== 'about' && id !== 'splash_preview',
);

function buildEdges() {
	const edges = [];
	const add = (from, to, cost, profiles, via, note) => {
		edges.push({ from, to, cost, profiles, via, ...(note ? { note } : {}) });
	};

	// --- Co-visible panes on wide Desktop (>= 1400px / 87.5rem) ---
	add('create_canvas', 'create_sheet_tab', 0, DESKTOP_PROFILES, 'Co-visible docked StudioPanel (>= 1400px)');
	add('create_sheet_tab', 'create_canvas', 0, DESKTOP_PROFILES, 'Co-visible sheet canvas (>= 1400px)');
	add('create_page_tab', 'create_canvas', 0, DESKTOP_PROFILES, 'Co-visible sheet canvas (>= 1400px)');
	add('create_theme_tab', 'create_canvas', 0, DESKTOP_PROFILES, 'Co-visible sheet canvas (>= 1400px)');
	add('create_set_inspector', 'create_canvas', 0, DESKTOP_PROFILES, 'Co-visible sheet canvas (>= 1400px)');
	add('create_trait_inspector', 'create_canvas', 0, DESKTOP_PROFILES, 'Co-visible sheet canvas (>= 1400px)');
	add('create_json_tab', 'create_canvas', 0, DESKTOP_PROFILES, 'Co-visible sheet canvas (>= 1400px)');

	// On Desktop Play (classic page view), Identity header, Trait sets, and docked Roller are all co-visible:
	add('play_identity', 'play_traits', 0, DESKTOP_PROFILES, 'Same page canvas on Desktop Play');
	add('play_traits', 'play_identity', 0, DESKTOP_PROFILES, 'Same page canvas on Desktop Play');
	add('play_identity', 'play_roller_split', 0, DESKTOP_PROFILES, 'Co-visible docked DiceRoller (>= 1400px)');
	add('play_traits', 'play_roller_split', 0, DESKTOP_PROFILES, 'Co-visible docked DiceRoller (>= 1400px)');
	add('play_roller_split', 'play_roller_full', 0, DESKTOP_PROFILES, 'Full roller controls visible in docked sidebar');
	add('play_roller_full', 'play_roller_split', 0, DESKTOP_PROFILES, 'Same docked sidebar on Desktop');
	add('play_roller_split', 'play_traits', 0, DESKTOP_PROFILES, 'Co-visible Play sheet (>= 1400px)');
	add('play_roller_full', 'play_traits', 0, DESKTOP_PROFILES, 'Co-visible Play sheet (>= 1400px)');

	// --- Global Header Navigation (Roster, Create, Play, Print, Search) ---
	for (const loc of DESKTOP_HEADER_LOCS) {
		if (loc !== 'roster') {
			add(loc, 'roster', 1, DESKTOP_PROFILES, 'Click .header button[aria-label="Roster"]');
		}
		add(loc, 'command_palette', 1, ['desktopPointer'], 'Click .header-btn-search');
		add(loc, 'command_palette', 1, ['desktopKeyboard'], 'Press / or Ctrl+K');
		if (loc !== 'about') {
			add(loc, 'about', 1, DESKTOP_PROFILES, 'Click footer.footer button[aria-label="About"]');
		}
	}

	for (const loc of MOBILE_HEADER_LOCS) {
		if (loc !== 'roster') {
			add(loc, 'roster', 1, ['mobileTouch'], 'Tap .header button[aria-label="Roster"]');
		}
		add(loc, 'command_palette', 1, ['mobileTouch'], 'Tap .header-btn-search');
	}
	// On Mobile, footer.footer is unobstructed in Roster, Create (panel closed), Print, About (occluded in Play!)
	for (const loc of ['roster', 'create_canvas', 'print_preview']) {
		add(loc, 'about', 1, ['mobileTouch'], 'Tap footer.footer button[aria-label="About"]');
	}

	// Character-active mode switches in Header:
	for (const loc of DESKTOP_CHARACTER_HEADER_LOCS) {
		if (loc !== 'create_canvas') {
			add(loc, 'create_canvas', 1, DESKTOP_PROFILES, 'Click .header button[aria-label="Create"]', 'cleanSession');
		}
		if (loc !== 'play_identity') {
			add(loc, 'play_identity', 1, DESKTOP_PROFILES, 'Click .header button[aria-label="Play"]');
		}
		if (loc !== 'print_preview') {
			add(loc, 'print_preview', 1, DESKTOP_PROFILES, 'Click .header button[aria-label="Print"]', 'cleanSession');
		}
	}

	for (const loc of MOBILE_CHARACTER_HEADER_LOCS) {
		if (loc !== 'create_canvas') {
			add(loc, 'create_canvas', 1, ['mobileTouch'], 'Tap .header button[aria-label="Create"]', 'cleanSession');
		}
		if (loc !== 'play_identity') {
			add(loc, 'play_identity', 1, ['mobileTouch'], 'Tap .header button[aria-label="Play"]');
		}
		add(loc, 'mobile_sheet_menu', 1, ['mobileTouch'], 'Tap .mobile-sheet-trigger');
	}

	// Mobile #mobile-sheet-menu Popover actions (Print, Open Sheet, Sheet Settings):
	add('mobile_sheet_menu', 'print_preview', 1, ['mobileTouch'], 'Tap #mobile-sheet-menu button[aria-label="Print"]');
	add('mobile_sheet_menu', 'session_add_modal', 1, ['mobileTouch'], 'Tap #mobile-sheet-menu "Open Sheet"');
	add(
		'mobile_sheet_menu',
		'create_sheet_tab',
		1,
		['mobileTouch'],
		'Tap #mobile-sheet-menu "Sheet Settings" (in Create)',
		'inEditSubmode',
	);

	// Desktop SessionNav actions:
	for (const loc of ['create_canvas', 'play_identity', 'play_traits']) {
		add(loc, 'session_add_modal', 1, DESKTOP_PROFILES, 'Click .session-nav .btn-session-add ("Open Sheet")');
	}

	// --- Splash Preview & Roster Flows ---
	add('splash_preview', 'create_canvas', 1, ALL_PROFILES, 'Click .template-preview-banner .btn-update-primary');
	add('splash_preview', 'roster', 1, ALL_PROFILES, 'Click .template-preview-banner .btn-update-secondary');

	add('roster', 'create_canvas', 1, ALL_PROFILES, 'Click .roster-button ("New Sheet") or .roster-item-button ("Open")');
	add('roster', 'play_identity', 1, ALL_PROFILES, 'Click/tap .roster-button-play ("Play")');
	add('roster', 'roster_library', 1, ALL_PROFILES, 'Click .roster-button-library ("Library")');
	add('roster', 'roster_card_builder', 1, ALL_PROFILES, 'Click .roster-button-card-builder ("Card Builder")');

	add('roster_library', 'splash_preview', 1, ALL_PROFILES, 'Click .library-card .btn-library.secondary ("Preview")');
	add('roster_library', 'create_canvas', 1, ALL_PROFILES, 'Click .library-card .btn-library.primary ("Character")');
	add('roster_library', 'print_preview', 1, ALL_PROFILES, 'Click .library-card .btn-library.print ("Print")');
	add('roster_library', 'roster', 1, ALL_PROFILES, 'Click .modal-close (or Escape)');

	add('roster_card_builder', 'roster', 1, ALL_PROFILES, 'Close TraitSetMini dialog');

	// --- Create Mode: Canvas <-> StudioPanel Inspectors ---
	add('create_canvas', 'create_sheet_tab', 1, ['mobileTouch'], 'Tap .sheet-header-meta-box (when at top of sheet)');
	add('create_canvas', 'create_set_inspector', 1, ALL_PROFILES, 'Click/tap .trait-set-header-inner[role="button"]');
	add('create_canvas', 'create_trait_inspector', 1, ALL_PROFILES, 'Click/tap .trait-title-btn');
	add('create_canvas', 'create_inline_presets', 1, ALL_PROFILES, 'Click/tap .btn-presets-toggle ("Presets")');

	add('create_inline_presets', 'create_canvas', 1, ALL_PROFILES, 'Click/tap .btn-inline-close (or add preset)');
	add(
		'create_inline_presets',
		'roster_card_builder',
		1,
		ALL_PROFILES,
		'Click/tap .btn-inline-mini ("New Card in Mini")',
	);

	// Sheet root sub-tabs inside StudioPanel:
	for (const fromTab of ['create_sheet_tab', 'create_page_tab', 'create_theme_tab']) {
		if (fromTab !== 'create_sheet_tab') {
			add(fromTab, 'create_sheet_tab', 1, ALL_PROFILES, 'Click/tap #studio-tab-sheet');
		}
		if (fromTab !== 'create_page_tab') {
			add(fromTab, 'create_page_tab', 1, ALL_PROFILES, 'Click/tap #studio-tab-page');
		}
		if (fromTab !== 'create_theme_tab') {
			add(fromTab, 'create_theme_tab', 1, ALL_PROFILES, 'Click/tap #studio-tab-theme');
		}
	}

	// PageLayoutMini drills directly into TraitSetEditor:
	add('create_page_tab', 'create_set_inspector', 1, ALL_PROFILES, 'Click/tap set block in .place-mini');

	// Breadcrumb links & Escape in StudioPanel (Create):
	add('create_set_inspector', 'create_sheet_tab', 1, ALL_PROFILES, 'Click/tap .crumb-link ("Sheet")');
	add('create_trait_inspector', 'create_set_inspector', 1, ALL_PROFILES, 'Click/tap .crumb-link (parent set)');
	add('create_trait_inspector', 'create_sheet_tab', 1, ALL_PROFILES, 'Click/tap .crumb-link ("Sheet")');
	add('create_set_inspector', 'create_sheet_tab', 1, ['desktopKeyboard'], 'Press Escape');
	add('create_trait_inspector', 'create_sheet_tab', 1, ['desktopKeyboard'], 'Press Escape');

	// Raw JSON toggle available across all Create StudioPanel views:
	for (const insp of [
		'create_sheet_tab',
		'create_page_tab',
		'create_theme_tab',
		'create_set_inspector',
		'create_trait_inspector',
	]) {
		add(insp, 'create_json_tab', 1, ALL_PROFILES, 'Click/tap button[aria-label="Raw JSON Editor"]');
	}
	add('create_json_tab', 'create_sheet_tab', 1, ALL_PROFILES, 'Click/tap button[aria-label="Raw JSON Editor"]');

	// Mobile Create: collapsing full-width StudioPanel overlay returns to uncovered sheet canvas:
	for (const insp of [
		'create_sheet_tab',
		'create_page_tab',
		'create_theme_tab',
		'create_set_inspector',
		'create_trait_inspector',
		'create_json_tab',
	]) {
		add(insp, 'create_canvas', 1, ['mobileTouch'], 'Tap button[aria-label="Collapse panel"]');
	}

	// --- Play Mode: Pillars, Staged Pill Bar, Split/Full Drawer, Outcome ---
	// Mobile 2D Pillar Deck horizontal pillar jump:
	add('play_identity', 'play_traits', 1, ['mobileTouch'], 'Tap .jump-pill[data-pillar-pill="prime"] (or swipe pillar)');
	add('play_traits', 'play_identity', 1, ['mobileTouch'], 'Tap .jump-pill[data-pillar-pill="identity"] (or swipe)');

	// Play Preset Card Gallery (direct + Card in SessionNav on Desktop and Jump Strip on Mobile):
	add('play_identity', 'play_preset_gallery', 1, ['mobileTouch'], 'Tap .jump-pill-add-card ("+ Card")');
	add('play_traits', 'play_preset_gallery', 1, ['mobileTouch'], 'Tap .jump-pill-add-card ("+ Card")');
	add('play_identity', 'play_preset_gallery', 1, DESKTOP_PROFILES, 'Click .session-nav .sheet-bar-add-card ("+ Card")');
	add('play_traits', 'play_preset_gallery', 1, DESKTOP_PROFILES, 'Click .session-nav .sheet-bar-add-card ("+ Card")');
	add('play_preset_gallery', 'play_traits', 1, ALL_PROFILES, 'Close gallery modal or add preset card');

	// Inspecting a trait in Play:
	add('play_traits', 'play_trait_inspector', 1, ALL_PROFILES, 'Click/tap .trait-title-btn');
	add('play_trait_inspector', 'play_roller_split', 1, ALL_PROFILES, 'Click/tap StudioPanel "Roller" tab');
	add('play_trait_inspector', 'play_traits', 1, ['mobileTouch'], 'Tap button[aria-label="Close roller"]');
	add('play_trait_inspector', 'play_traits', 0, DESKTOP_PROFILES, 'Co-visible Play sheet (>= 1400px)');

	// Mobile Play 3-state drawer transitions (staged <-> split <-> full):
	add('play_identity', 'play_roller_split', 1, ['mobileTouch'], 'Tap .btn-pill-expand ("Roller") or swipe pill up');
	add('play_traits', 'play_roller_split', 1, ['mobileTouch'], 'Tap .btn-pill-expand ("Roller") or swipe pill up');
	add('play_roller_split', 'play_roller_full', 1, ['mobileTouch'], 'Tap button[aria-label="Expand roller"]');
	add('play_roller_full', 'play_roller_split', 1, ['mobileTouch'], 'Tap button[aria-label="Split roller"]');
	add('play_roller_split', 'play_traits', 1, ['mobileTouch'], 'Tap button[aria-label="Close roller"]');
	add('play_roller_full', 'play_traits', 1, ['mobileTouch'], 'Tap button[aria-label="Close roller"]');

	// Rolling staged dice -> Outcome:
	// From Play Traits (stage a die +1, then roll +1 = 2 interactions directly from sheet!):
	add(
		'play_traits',
		'play_outcome',
		2,
		['desktopPointer', 'desktopKeyboard'],
		'Click trait die [aria-label^="Stage d"] (1) -> Click .roller-roll-btn (2)',
	);
	add(
		'play_traits',
		'play_outcome',
		2,
		['mobileTouch'],
		'Tap trait die [aria-label^="Stage d"] (1) -> Tap .btn-pill-roll on staged bar (2)',
	);
	// From Split or Full Roller (empty pool baseline: quick-add die +1, then pinned roll +1 = 2):
	add(
		'play_roller_split',
		'play_outcome',
		2,
		ALL_PROFILES,
		'Click/tap .die-btn (+1) -> Click/tap pinned .roller-roll-btn (+1)',
	);
	add(
		'play_roller_full',
		'play_outcome',
		2,
		ALL_PROFILES,
		'Click/tap .die-btn (+1) -> Click/tap .roller-roll-btn (+1)',
	);
	add('play_outcome', 'play_roller_split', 0, DESKTOP_PROFILES, 'Inline outcome lives inside docked DiceRoller');
	add('play_outcome', 'play_roller_full', 0, DESKTOP_PROFILES, 'Inline outcome lives inside docked DiceRoller');
	add('play_outcome', 'play_roller_split', 1, ['mobileTouch'], 'Close #rollDialog when rolled from split drawer');
	add('play_outcome', 'play_roller_full', 1, ['mobileTouch'], 'Close #rollDialog when rolled from full drawer');
	add('play_outcome', 'play_traits', 1, ['mobileTouch'], 'Close #rollDialog when rolled from staged pill bar');

	// --- Session Add Modal & Command Palette Exits ---
	add('session_add_modal', 'play_identity', 1, ALL_PROFILES, 'Select character to open alongside (or close)');
	add('session_add_modal', 'roster', 1, ALL_PROFILES, 'Click "Go to Roster" inside modal');

	// Command Palette exits:
	// Selecting a top action or typing a short query + Enter = 1-2 interactions after opening palette:
	add('command_palette', 'play_identity', 1, ALL_PROFILES, 'Select "Switch to Play Mode" (click or Enter)');
	add('command_palette', 'create_canvas', 1, ALL_PROFILES, 'Select "Switch to Create / Edit Mode"');
	add('command_palette', 'print_preview', 1, ALL_PROFILES, 'Select "Open Print View"');
	add('command_palette', 'roster', 1, ALL_PROFILES, 'Select "Go to Roster"');
	add(
		'command_palette',
		'create_trait_inspector',
		2,
		['desktopKeyboard'],
		'Type trait filter (1) -> Press Enter to jump straight to Create + TraitEditor (2)',
	);
	add(
		'command_palette',
		'create_set_inspector',
		2,
		['desktopKeyboard'],
		'Type set filter (1) -> Press Enter to jump straight to Create + TraitSetEditor (2)',
	);

	return edges;
}

const EDGES = buildEdges();

// ---------------------------------------------------------------------------
// 2. Dijkstra All-Pairs Shortest-Path Solver (lexicographic: cost, then hops)
// ---------------------------------------------------------------------------
function shortestPath(profile, sourceId, targetId) {
	if (sourceId === targetId) {
		return { cost: 0, hops: 0, path: [sourceId], steps: [] };
	}
	const adj = new Map();
	for (const n of NODES) adj.set(n.id, []);
	for (const e of EDGES) {
		if (e.profiles.includes(profile)) {
			adj.get(e.from).push(e);
		}
	}

	const dist = new Map();
	const prev = new Map();
	const visited = new Set();

	for (const n of NODES) {
		dist.set(n.id, { cost: Infinity, hops: Infinity });
	}
	dist.set(sourceId, { cost: 0, hops: 0 });

	while (visited.size < NODES.length) {
		let u = null;
		let best = { cost: Infinity, hops: Infinity };
		for (const [id, d] of dist.entries()) {
			if (visited.has(id)) continue;
			if (d.cost < best.cost || (d.cost === best.cost && d.hops < best.hops)) {
				best = d;
				u = id;
			}
		}
		if (u === null || best.cost === Infinity) break;
		if (u === targetId) break;
		visited.add(u);

		for (const edge of adj.get(u) || []) {
			const cur = dist.get(edge.to);
			const candCost = best.cost + edge.cost;
			const candHops = best.hops + 1;
			if (candCost < cur.cost || (candCost === cur.cost && candHops < cur.hops)) {
				dist.set(edge.to, { cost: candCost, hops: candHops });
				prev.set(edge.to, { from: u, edge });
			}
		}
	}

	const finalDist = dist.get(targetId);
	if (!finalDist || finalDist.cost === Infinity) {
		return { cost: Infinity, hops: Infinity, path: [], steps: [] };
	}

	const pathNodes = [targetId];
	const steps = [];
	let cur = targetId;
	while (cur !== sourceId) {
		const p = prev.get(cur);
		steps.unshift(p.edge);
		pathNodes.unshift(p.from);
		cur = p.from;
	}
	return { cost: finalDist.cost, hops: finalDist.hops, path: pathNodes, steps };
}

function computeAllPairs() {
	const matrices = {};
	for (const profile of PROFILES) {
		matrices[profile] = {};
		for (const a of NODES) {
			matrices[profile][a.id] = {};
			for (const b of NODES) {
				matrices[profile][a.id][b.id] = shortestPath(profile, a.id, b.id);
			}
		}
	}
	return matrices;
}

// ---------------------------------------------------------------------------
// 3. Canonical User Task Journeys (Location A -> Location B + Action Cost)
// ---------------------------------------------------------------------------
const TASK_JOURNEYS = [
	{
		id: 'T01',
		task: 'Materialize showcase preview into an editable sheet',
		from: 'splash_preview',
		to: 'create_canvas',
		actionCost: { desktopPointer: 0, desktopKeyboard: 0, mobileTouch: 0 },
		actionDesc: 'Arrival completes materialization',
	},
	{
		id: 'T02',
		task: 'Create new character from Template Library (starting at Roster)',
		from: 'roster',
		to: 'roster_library',
		actionCost: { desktopPointer: 1, desktopKeyboard: 1, mobileTouch: 1 },
		actionDesc: 'Click "+ Character" on template card (+1)',
	},
	{
		id: 'T03',
		task: 'Change sheet Theme or Dice style (starting at Create Canvas)',
		from: 'create_canvas',
		to: 'create_theme_tab',
		actionCost: { desktopPointer: 1, desktopKeyboard: 1, mobileTouch: 1 },
		actionDesc: 'Pick swatch / dice preset (+1)',
	},
	{
		id: 'T04',
		task: 'Inspect Set A, then switch to Set B on sheet (starting at Set A Inspector)',
		from: 'create_set_inspector',
		to: 'create_canvas',
		actionCost: { desktopPointer: 1, desktopKeyboard: 1, mobileTouch: 1 },
		actionDesc: 'Click/tap Set B header on sheet (+1)',
	},
	{
		id: 'T05',
		task: 'Change a Trait Set border style from Play mode and return to Play',
		from: 'play_traits',
		to: 'create_set_inspector',
		actionCost: { desktopPointer: 2, desktopKeyboard: 2, mobileTouch: 2 },
		actionDesc: 'Pick border option (+1) -> Click/tap Play header button (+1)',
	},
	{
		id: 'T06',
		task: 'Edit raw JSON and return to uncovered Create sheet',
		from: 'create_set_inspector',
		to: 'create_json_tab',
		actionCost: { desktopPointer: 1, desktopKeyboard: 1, mobileTouch: 1 },
		actionDesc: 'Toggle JSON off / Collapse mobile panel (+1)',
	},
	{
		id: 'T07',
		task: 'Enter Play from Create, stage a rated trait die, and roll',
		from: 'create_canvas',
		to: 'play_outcome',
		actionCost: { desktopPointer: 0, desktopKeyboard: 0, mobileTouch: 0 },
		actionDesc: 'Outcome reached upon roll',
	},
	{
		id: 'T08',
		task: 'Stage a raw quick-add d8 in Play Roller and roll (from Play start)',
		from: 'play_identity',
		to: 'play_roller_split',
		actionCost: { desktopPointer: 2, desktopKeyboard: 2, mobileTouch: 2 },
		actionDesc: 'Tap/click Add d8 (+1) + pinned Roll (+1)',
	},
	{
		id: 'T09',
		task: 'Step Plot Points (+1 PP) on arrival in Play mode',
		from: 'play_identity',
		to: 'play_identity',
		actionCost: { desktopPointer: 1, desktopKeyboard: 1, mobileTouch: 1 },
		actionDesc: 'Click/tap "+" on .character-pp-badge (+1)',
	},
	{
		id: 'T10',
		task: 'Switch from dirty Play session (after PP change) back to Create (Save gate)',
		from: 'play_identity',
		to: 'create_canvas',
		actionCost: { desktopPointer: 1, desktopKeyboard: 1, mobileTouch: 1 },
		actionDesc: 'Confirm "Save session into character" modal (+1 dirty-session gate)',
	},
	{
		id: 'T11',
		task: 'Navigate from Full Dice Roller to Print Preview & trigger Print',
		from: 'play_roller_full',
		to: 'print_preview',
		actionCost: { desktopPointer: 1, desktopKeyboard: 1, mobileTouch: 1 },
		actionDesc: 'Click/tap "Print Sheet" in .print-toolbar (+1)',
	},
	{
		id: 'T12',
		task: 'Export character JSON from Play mode (clean session)',
		from: 'play_traits',
		to: 'print_preview',
		actionCost: { desktopPointer: 1, desktopKeyboard: 1, mobileTouch: 1 },
		actionDesc: 'Click/tap "Export JSON" in .print-toolbar (+1)',
	},
	{
		id: 'T13',
		task: 'Open a second character alongside active Play sheet',
		from: 'play_traits',
		to: 'session_add_modal',
		actionCost: { desktopPointer: 1, desktopKeyboard: 1, mobileTouch: 1 },
		actionDesc: 'Pick character row in modal (+1)',
	},
	{
		id: 'T14',
		task: 'Jump from Print Preview directly into editing a specific Trait',
		from: 'print_preview',
		to: 'create_trait_inspector',
		actionCost: { desktopPointer: 0, desktopKeyboard: 0, mobileTouch: 0 },
		actionDesc: 'TraitEditor focused on arrival',
	},
	{
		id: 'T15',
		task: 'Add a temporary Play session card from Play Traits view',
		from: 'play_traits',
		to: 'play_preset_gallery',
		actionCost: { desktopPointer: 1, desktopKeyboard: 1, mobileTouch: 1 },
		actionDesc: 'Click/tap "Add to Session" on preset card (+1)',
	},
	{
		id: 'T16',
		task: 'Open About / Legal colophon from Play Traits view',
		from: 'play_traits',
		to: 'about',
		actionCost: { desktopPointer: 0, desktopKeyboard: 0, mobileTouch: 0 },
		actionDesc: 'About article visible on arrival',
	},
	{
		id: 'T17',
		task: 'Launch an existing character directly into Play from Roster',
		from: 'roster',
		to: 'play_identity',
		actionCost: { desktopPointer: 0, desktopKeyboard: 0, mobileTouch: 0 },
		actionDesc: 'Play session active on arrival',
	},
];

function evaluateTasks(matrices) {
	return TASK_JOURNEYS.map((t) => {
		const costs = {};
		const paths = {};
		for (const p of PROFILES) {
			const sp = matrices[p][t.from][t.to];
			costs[p] = sp.cost === Infinity ? null : sp.cost + (t.actionCost[p] || 0);
			paths[p] = sp;
		}
		const mobileDelta =
			costs.mobileTouch !== null && costs.desktopPointer !== null ? costs.mobileTouch - costs.desktopPointer : null;
		const keyboardSaving =
			costs.desktopPointer !== null && costs.desktopKeyboard !== null
				? costs.desktopPointer - costs.desktopKeyboard
				: null;
		return {
			...t,
			costs,
			mobileDelta,
			keyboardSaving,
			paths,
		};
	});
}

// ---------------------------------------------------------------------------
// 4. Playwright Live Browser Journey Counter (--live)
// ---------------------------------------------------------------------------
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

async function isInViewport(locator, width, height) {
	const box = await locator.boundingBox().catch(() => null);
	if (!box || box.width <= 0 || box.height <= 0) return false;
	const cx = box.x + box.width / 2;
	const cy = box.y + box.height / 2;
	return cx >= 0 && cx <= width && cy >= 0 && cy <= height;
}

async function runViewportJourneys(browser, width, height, tag, errors, fontRequests) {
	const isMobile = width <= 768;
	const profile = isMobile ? 'mobileTouch' : 'desktopPointer';
	const context = await browser.newContext({ viewport: { width, height } });
	const page = await context.newPage();

	page.on('pageerror', (e) => errors.push(`[${tag}] pageerror: ${String((e && e.message) || e)}`));
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(`[${tag}] console: ${m.text()}`);
	});
	page.on('request', (req) => {
		const url = req.url();
		if (/fonts\.googleapis\.com/i.test(url) && /josefin|open(?:\+|%20)sans|alegreya/i.test(url)) {
			fontRequests.push(`[${tag}] blocked remote base-font request: ${url}`);
		}
	});

	await page.addInitScript(() => {
		const lastScroll = new WeakMap();
		window.__curioMetrics = {
			domClicks: 0,
			domKeydowns: 0,
			scrollPx: 0,
			reset() {
				this.domClicks = 0;
				this.domKeydowns = 0;
				this.scrollPx = 0;
			},
		};
		window.addEventListener(
			'click',
			() => {
				window.__curioMetrics.domClicks += 1;
			},
			true,
		);
		window.addEventListener(
			'keydown',
			() => {
				window.__curioMetrics.domKeydowns += 1;
			},
			true,
		);
		window.addEventListener(
			'scroll',
			(ev) => {
				const t = ev.target === document ? document.scrollingElement || document.documentElement : ev.target;
				if (!t || typeof t.scrollTop !== 'number') return;
				const prev = lastScroll.get(t) || { top: t.scrollTop, left: t.scrollLeft || 0 };
				const dy = Math.abs(t.scrollTop - prev.top);
				const dx = Math.abs((t.scrollLeft || 0) - prev.left);
				lastScroll.set(t, { top: t.scrollTop, left: t.scrollLeft || 0 });
				window.__curioMetrics.scrollPx += Math.round(dx + dy);
			},
			true,
		);
	});

	const results = [];

	async function measureJourney(id, label, staticExpected, fn) {
		await page.waitForTimeout(120);
		await page.evaluate(() => window.__curioMetrics.reset());
		let steps = 0;
		const trace = [];
		const act = {
			async click(loc, desc) {
				const target = typeof loc === 'string' ? page.locator(loc).first() : loc.first();
				await target.waitFor({ state: 'visible', timeout: 6000 });
				await target.click();
				steps += 1;
				trace.push(desc || (typeof loc === 'string' ? `click ${loc}` : 'click'));
			},
			async press(key, desc) {
				await page.keyboard.press(key);
				steps += 1;
				trace.push(desc || `press ${key}`);
			},
		};
		await fn(act);
		await page.waitForTimeout(120);
		const metrics = await page.evaluate(() => ({
			domClicks: window.__curioMetrics.domClicks,
			domKeydowns: window.__curioMetrics.domKeydowns,
			scrollPx: window.__curioMetrics.scrollPx,
		}));
		results.push({
			id,
			viewport: `${width}x${height}`,
			profile,
			label,
			observedSteps: steps,
			staticExpected,
			deltaVsStatic: staticExpected !== null ? steps - staticExpected : null,
			domClicks: metrics.domClicks,
			domKeydowns: metrics.domKeydowns,
			scrollPx: metrics.scrollPx,
			trace,
		});
	}

	try {
		await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle', timeout: 30000 });
		await page.waitForSelector('.template-preview-banner .btn-update-primary', { timeout: 10000 });

		// J01: splash_preview -> create_canvas
		await measureJourney('J01', 'Splash Preview -> Editable Sheet (Create)', 1, async (act) => {
			await act.click('.template-preview-banner .btn-update-primary', 'Use this template');
			await page.waitForSelector('.character-sheet.submode-edit', { timeout: 8000 });
		});

		// J02: create_canvas -> create_theme_tab (universal header path on mobile; direct docked tab on desktop)
		await measureJourney('J02', 'Create Canvas -> Sheet Theme & Dice Tab', isMobile ? 3 : 1, async (act) => {
			if (isMobile) {
				await act.click('.mobile-sheet-trigger', 'Open #mobile-sheet-menu');
				await act.click(
					page.locator('#mobile-sheet-menu .mobile-sheet-action-btn', { hasText: 'Sheet Settings' }),
					'Tap Sheet Settings',
				);
			}
			await act.click('#studio-tab-theme', 'Select Theme & Dice tab');
			await page.waitForSelector('#studio-tab-theme[aria-selected="true"]', { timeout: 5000 });
		});

		// Reset to uncovered create_canvas on mobile before J03
		if (isMobile) {
			await page.locator('button[aria-label="Collapse panel"]').first().click();
			await page.waitForTimeout(150);
		}

		// J03: Inspect Set A -> Switch to Set B on sheet canvas
		await measureJourney('J03', 'Create Canvas -> Inspect Set A -> Inspect Set B', isMobile ? 3 : 2, async (act) => {
			const headers = page.locator('.trait-set-header-inner[role="button"]');
			await act.click(headers.nth(0), 'Inspect Trait Set 1');
			await page.waitForSelector('.studio-panel input[name="traitSetName"]', { timeout: 5000 });
			if (isMobile) {
				await act.click('button[aria-label="Collapse panel"]', 'Collapse mobile StudioPanel overlay');
			}
			await act.click(headers.nth(1), 'Inspect Trait Set 2');
			await page.waitForSelector('.studio-panel input[name="traitSetName"]', { timeout: 5000 });
		});

		// J04: Set Inspector -> Raw JSON -> Return to Sheet Canvas
		await measureJourney('J04', 'Set Inspector -> Raw JSON -> Uncovered Sheet', 2, async (act) => {
			await act.click('button[aria-label="Raw JSON Editor"]', 'Open Raw JSON tab');
			await page.waitForSelector('.studio-panel .json-editor', { timeout: 5000 });
			if (isMobile) {
				await act.click('button[aria-label="Collapse panel"]', 'Collapse mobile StudioPanel');
			} else {
				await act.click('button[aria-label="Raw JSON Editor"]', 'Toggle back to Properties w/ co-visible sheet');
			}
		});

		// J05: Create Canvas -> Play Mode -> Stage a rated trait die -> Roll Outcome
		// Note: Dreamer_Architect has no 'identity' pillar (Prime is col 0 -> 3 taps); sheets with an 'identity' pillar need +1 pillar jump (tested in J11).
		await measureJourney('J05', 'Create -> Play -> Stage Trait Die -> Roll (No-Id Sheet)', 3, async (act) => {
			await act.click('.header button[aria-label="Play"]', 'Switch to Play mode');
			await page.waitForSelector('.character-sheet.submode-play', { timeout: 5000 });

			const firstStageable = page.locator('.character-sheet.submode-play [aria-label^="Stage d"]').first();
			if (isMobile && !(await isInViewport(firstStageable, width, height))) {
				const primePill = page.locator('.jump-pill[data-pillar-pill="prime"]');
				if ((await primePill.count()) > 0) {
					await act.click(primePill, 'Jump from Identity pillar to Prime pillar');
					await page.waitForTimeout(250);
				}
			}
			await act.click(firstStageable, 'Stage rated trait die');

			if (isMobile) {
				await act.click('.btn-pill-roll', 'Roll directly from .mobile-roller-pill-bar');
				await page.waitForSelector('dialog#rollDialog[open]', { timeout: 5000 });
			} else {
				await act.click('.roller-roll-btn', 'Click Roll in docked DiceRoller');
				await page.waitForSelector('.outcome-shell', { timeout: 5000 });
			}
		});

		// Cleanly reset pool & outcome dialog back to Play arrival state (play_identity) before J06
		if (isMobile) {
			await page.evaluate(() => {
				const dlg = document.querySelector('#rollDialog');
				if (dlg && typeof dlg.close === 'function' && dlg.hasAttribute('open')) dlg.close();
			});
			const clearBtn = page.locator('.btn-pill-clear');
			if ((await clearBtn.count()) > 0 && (await clearBtn.first().isVisible())) {
				await clearBtn.first().click();
			}
		} else {
			await page.evaluate(() => window.app?.clearDicePool?.());
		}

		// J06: Play Sheet -> Quick-Add raw d8 inside Split/Docked Roller -> Roll
		await measureJourney('J06', 'Play Sheet -> Quick-Add Raw d8 -> Roll', isMobile ? 3 : 2, async (act) => {
			if (isMobile) {
				await act.click('.btn-pill-expand', 'Open split roller drawer');
				await page.locator('.studio-panel.is-play[data-state="split"]').waitFor({ state: 'visible', timeout: 5000 });
				// Verify Player/Opposition tabs are also directly reachable in split without expanding to 100dvh
				await page.locator('#tabOpposition').waitFor({ state: 'visible', timeout: 3000 });
				await act.click('.die-btn[aria-label="Add d8"]', 'Add raw d8');
				await act.click('.roller-roll-btn', 'Roll pool from pinned split bar');
				await page.waitForSelector('dialog#rollDialog[open]', { timeout: 5000 });
			} else {
				await act.click('.die-btn[aria-label="Add d8"]', 'Add raw d8 in docked roller');
				await act.click('.roller-roll-btn', 'Roll pool');
				await page.waitForSelector('.outcome-shell', { timeout: 5000 });
			}
		});

		// Dismiss mobile #rollDialog so we start J07 cleanly at play_roller_split (38.2dvh drawer on mobile; docked on desktop)
		if (isMobile) {
			await page.evaluate(() => {
				const dlg = document.querySelector('#rollDialog');
				if (dlg && typeof dlg.close === 'function' && dlg.hasAttribute('open')) dlg.close();
			});
		}

		// J07: Active Split/Docked Roller -> Print Preview (.header stays visible in split!)
		await measureJourney('J07', 'Active Split/Docked Roller -> Print Preview', isMobile ? 2 : 1, async (act) => {
			if (isMobile) {
				await act.click('.mobile-sheet-trigger', 'Open #mobile-sheet-menu directly over split roller');
				await act.click('#mobile-sheet-menu button[aria-label="Print"]', 'Select Print');
			} else {
				await act.click('.header button[aria-label="Print"]', 'Click Print in .header');
			}
			await page.waitForSelector('.character-sheet.submode-print', { timeout: 5000 });
		});

		// J08: Print Preview -> Roster -> Template Library -> Preview Template
		await measureJourney('J08', 'Print -> Roster -> Library -> Preview Template', 3, async (act) => {
			await act.click('.header button[aria-label="Roster"]', 'Navigate to Roster');
			await page.waitForSelector('section.roster', { timeout: 5000 });
			const rosterGeom = await page.evaluate((mobile) => {
				const box = document.querySelector('.roster-button-container');
				const lib = document.querySelector('.roster-button-library');
				const create = document.querySelector('.roster-button-new');
				const picker = document.querySelector('.roster-template-picker');
				const imp = document.querySelector('.roster-button-import');
				if (!box || !lib || !create || !picker || !imp) return { ok: false, reason: 'missing roster controls' };
				const bRect = box.getBoundingClientRect();
				for (const [name, el] of [
					['library', lib],
					['new', create],
					['picker', picker],
					['import', imp],
				]) {
					const r = el.getBoundingClientRect();
					if (r.width < 40 || r.height < (mobile ? 43 : 36)) {
						return { ok: false, reason: `${name} undersized (${r.width}x${r.height})` };
					}
					if (r.bottom > bRect.bottom + 2 || r.top < bRect.top - 2) {
						return { ok: false, reason: `${name} clipped outside container` };
					}
				}
				if (box.scrollHeight > box.clientHeight + 2) {
					return { ok: false, reason: `container clipped (${box.scrollHeight} > ${box.clientHeight})` };
				}
				return { ok: true, reason: '' };
			}, isMobile);
			if (!rosterGeom.ok) {
				throw new Error(`[${tag}] Roster toolbar geometry check failed: ${rosterGeom.reason}`);
			}
			await act.click('.roster-button-library', 'Open Template Library');
			await page.waitForSelector('dialog.modal-library .library-card', { timeout: 10000 });
			await act.click('dialog.modal-library .library-card .btn-library.secondary', 'Preview first library template');
			await page.waitForSelector('.template-preview-banner', { timeout: 5000 });
		});

		// Prepare J09–J11: Close preview -> create standard New Sheet (Identity Name set + rated Prime Attribute) -> switch to Play
		await page.locator('.template-preview-banner .btn-update-secondary').first().click();
		const newSheetBtn = page.locator('.roster .roster-button', { hasText: 'New Sheet' }).first();
		await newSheetBtn.waitFor({ state: 'visible', timeout: 5000 });
		await newSheetBtn.click();
		await page.waitForSelector('.character-sheet.submode-edit', { timeout: 5000 });
		await page.evaluate(async () => {
			const ch = window.app.character;
			const nameSet = ch.traitSets.find((s) => s && s.id === 'name');
			if (nameSet) delete nameSet.rating;
			let attrSet = ch.traitSets.find((s) => s && s.name === 'Attributes');
			if (!attrSet) {
				attrSet = {
					id: 'attributes',
					name: 'Attributes',
					noun: 'Attribute',
					plural: 'Attributes',
					traits: [
						{
							name: 'Physical',
							description: '',
							traits: [],
							tags: [],
							rating: { type: 'Die', value: [8], range: [4, 6, 8, 10, 12] },
						},
					],
					tags: [],
					view: { pillar: 'prime', style: { header: 'default', body: 'default' } },
				};
				ch.traitSets.push(attrSet);
			}
			await window.app.updateCharacter(ch);
		});
		await page.locator('.header button[aria-label="Play"]').first().click();
		await page.waitForSelector('.character-sheet.submode-play', { timeout: 5000 });

		// J09: Step Plot Point (+1 PP) in Play -> Navigate to Create (Dirty-Session Confirm Gate)
		await measureJourney('J09', 'Play (+1 PP Dirty Session) -> Save Gate -> Create', 3, async (act) => {
			await act.click('button[title="Gain Plot Point"]', 'Gain +1 Plot Point');
			await act.click('.header button[aria-label="Create"]', 'Click Create (triggers dirty-session modal)');
			await page.waitForSelector('dialog.modal-confirm .modal-button-primary', { timeout: 5000 });
			await act.click('dialog.modal-confirm .modal-button-primary', 'Confirm Save session into character');
			await page.waitForSelector('.character-sheet.submode-edit', { timeout: 5000 });
		});

		// J10: Command Palette mode jump (Create -> Command Palette -> Play)
		await measureJourney('J10', 'Create -> Command Palette -> Play Mode', 2, async (act) => {
			if (isMobile) {
				await act.click('.header-btn-search', 'Tap Command Palette search button');
			} else {
				await act.press('/', 'Press / shortcut to open Command Palette');
			}
			await page.waitForSelector('#command-palette-input', { timeout: 5000 });
			await act.click(
				page.locator('.modal-command-palette [role="option"]', { hasText: 'Switch to Play Mode' }),
				'Select Switch to Play Mode',
			);
			await page.waitForSelector('.character-sheet.submode-play', { timeout: 5000 });
		});

		// J11: Multi-Pillar Play (Identity col 0 -> Rated Trait col 1) -> Stage Trait Die -> Roll
		await measureJourney('J11', 'Multi-Pillar Play (Identity) -> Stage Die -> Roll', isMobile ? 3 : 2, async (act) => {
			const firstStageable = page.locator('.character-sheet.submode-play [aria-label^="Stage d"]').first();
			if (isMobile && !(await isInViewport(firstStageable, width, height))) {
				await act.click(
					'.mobile-set-jump-strip .jump-pill[data-pillar-pill]:not([data-pillar-pill="identity"])',
					'Jump from Identity col 0 to rated Trait pillar',
				);
				await page.waitForTimeout(250);
			}
			await act.click(firstStageable, 'Stage rated trait die');
			if (isMobile) {
				await act.click('.btn-pill-roll', 'Roll directly from .mobile-roller-pill-bar');
				await page.waitForSelector('dialog#rollDialog[open]', { timeout: 5000 });
			} else {
				await act.click('.roller-roll-btn', 'Click Roll in docked DiceRoller');
				await page.waitForSelector('.outcome-shell', { timeout: 5000 });
			}
		});

		if (isMobile) {
			await page.evaluate(() => {
				const dlg = document.querySelector('#rollDialog');
				if (dlg && typeof dlg.close === 'function' && dlg.hasAttribute('open')) dlg.close();
			});
		}

		// J12: Play Sheet -> Add Temporary Play Session Card (2 interactions on both Desktop Page & Mobile Pillars!)
		await measureJourney('J12', 'Play Sheet -> Add Play Session Card', 2, async (act) => {
			if (isMobile) {
				await act.click('.jump-pill-add-card', 'Tap + Card in Jump Strip');
			} else {
				await act.click('.session-nav .sheet-bar-add-card', 'Click + Card in SessionNav');
			}
			await page.waitForSelector('dialog.modal-style-gallery[open]', { timeout: 5000 });
			await act.click(
				page.locator('dialog.modal-style-gallery[open] button', { hasText: 'Add to Session' }),
				'Add first Play preset card to session',
			);
		});

		// Reset to Roster cleanly (discarding temporary play card) before J13
		await page.locator('.header button[aria-label="Roster"]').first().click();
		const discardBtn = page.locator('dialog.modal-confirm button', { hasText: 'Discard' });
		if (
			(await discardBtn.count()) > 0 &&
			(await discardBtn
				.first()
				.isVisible()
				.catch(() => false))
		) {
			await discardBtn.first().click();
		}
		await page.waitForSelector('section.roster', { timeout: 5000 });

		// J13: Roster -> Direct Play Entry (1 click/tap on .roster-button-play, zero spurious save modals)
		await measureJourney('J13', 'Roster -> Direct Play Mode', 1, async (act) => {
			await act.click('.roster-item .roster-button-play', 'Click/tap Play on Roster card');
			await page.waitForSelector('.character-sheet.submode-play', { timeout: 5000 });
			if ((await page.locator('dialog.modal-confirm[open]').count()) > 0) {
				throw new Error(`[${tag}] Spurious Save session state modal opened during Roster -> Play`);
			}
		});
	} finally {
		await context.close();
	}

	return results;
}

async function runLiveHarness() {
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
	let desktop = [];
	let mobile = [];
	try {
		await new Promise((resolve) => setTimeout(resolve, 1200));
		browser = await chromium.launch({
			...(executablePath ? { executablePath } : {}),
			args: ['--no-sandbox'],
		});
		desktop = await runViewportJourneys(browser, 1440, 900, 'desktop', errors, fontRequests);
		mobile = await runViewportJourneys(browser, 390, 844, 'mobile', errors, fontRequests);
	} finally {
		if (browser) await browser.close();
		server.kill();
	}

	const fatal = errors.filter((e) => !/favicon|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/i.test(e));
	if (fontRequests.length) {
		throw new Error('Remote font requests detected:\n' + fontRequests.join('\n'));
	}
	if (fatal.length) {
		throw new Error('Console/page errors during live journeys:\n' + fatal.slice(0, 15).join('\n'));
	}

	return { desktop, mobile };
}

// ---------------------------------------------------------------------------
// 5. CLI Formatting & Output
// ---------------------------------------------------------------------------
const HUB_IDS = [
	'roster',
	'roster_library',
	'create_canvas',
	'create_theme_tab',
	'create_set_inspector',
	'create_trait_inspector',
	'play_identity',
	'play_traits',
	'play_roller_full',
	'print_preview',
	'about',
];

function pad(str, len) {
	const s = String(str);
	return s.length >= len ? s : s + ' '.repeat(len - s.length);
}

function printQueryPath(fromId, toId) {
	if (!NODE_MAP.has(fromId)) {
		console.error(`Unknown --from node '${fromId}'. Valid nodes: ${NODES.map((n) => n.id).join(', ')}`);
		process.exit(1);
	}
	if (!NODE_MAP.has(toId)) {
		console.error(`Unknown --to node '${toId}'. Valid nodes: ${NODES.map((n) => n.id).join(', ')}`);
		process.exit(1);
	}
	console.log(`\nShortest Interaction Paths: ${fromId} -> ${toId}`);
	console.log('='.repeat(72));
	for (const p of PROFILES) {
		const res = shortestPath(p, fromId, toId);
		console.log(`\n[${PROFILE_LABELS[p]}]  Cost = ${res.cost} interaction(s), Hops = ${res.hops}`);
		if (!res.steps.length) {
			console.log('  (Already at target or unreachable)');
			continue;
		}
		res.steps.forEach((s, idx) => {
			console.log(`  ${idx + 1}. ${s.from} -> ${s.to} [cost +${s.cost}] via ${s.via}`);
		});
	}
}

function printReport(matrices, tasks, live) {
	console.log(`\nCharacter Curio — Feature Graph & Interaction Map`);
	console.log(`Nodes: ${NODES.length} canonical locations | Directed Edges: ${EDGES.length} | Profiles: 3`);
	console.log('='.repeat(94));

	console.log('\n1. Hub-to-Hub Shortest Interaction Matrix (Desktop Pointer / Mobile Touch):');
	const colW = 8;
	const rowLabelW = 22;
	const shortNames = {
		roster: 'Roster',
		roster_library: 'Library',
		create_canvas: 'Create',
		create_theme_tab: 'Theme',
		create_set_inspector: 'SetEd',
		create_trait_inspector: 'TraitEd',
		play_identity: 'PlayId',
		play_traits: 'PlayTr',
		play_roller_full: 'Roller',
		print_preview: 'Print',
		about: 'About',
	};
	const header = pad('From \\ To', rowLabelW) + HUB_IDS.map((id) => pad(shortNames[id], colW)).join('');
	console.log(header);
	console.log('-'.repeat(header.length));
	for (const r of HUB_IDS) {
		const cells = HUB_IDS.map((c) => {
			if (r === c) return pad('-', colW);
			const d = matrices.desktopPointer[r][c].cost;
			const m = matrices.mobileTouch[r][c].cost;
			const ds = d === Infinity ? 'inf' : String(d);
			const ms = m === Infinity ? 'inf' : String(m);
			return pad(`${ds}/${ms}`, colW);
		}).join('');
		console.log(pad(shortNames[r] + ` (${r.slice(0, 10)})`, rowLabelW) + cells);
	}

	console.log('\n2. Canonical Task Journeys (Static Graph Costs):');
	console.log(pad('ID', 5) + pad('Task', 62) + pad('DeskPtr', 9) + pad('DeskKey', 9) + pad('MobTch', 8) + 'MobDelta');
	console.log('-'.repeat(100));
	for (const t of tasks) {
		const dStr = t.mobileDelta === null ? 'n/a' : t.mobileDelta > 0 ? `+${t.mobileDelta}` : String(t.mobileDelta);
		console.log(
			pad(t.id, 5) +
				pad(t.task.slice(0, 60), 62) +
				pad(t.costs.desktopPointer, 9) +
				pad(t.costs.desktopKeyboard, 9) +
				pad(t.costs.mobileTouch, 8) +
				dStr,
		);
	}

	const hotspots = tasks.filter((t) => (t.costs.mobileTouch || 0) >= 4 || (t.mobileDelta || 0) >= 2);
	console.log(`\n3. Friction Hotspots (Mobile cost >= 4 or Mobile-vs-Desktop delta >= +2): ${hotspots.length}`);
	for (const h of hotspots) {
		console.log(
			`  - ${h.id}: ${h.task} -> Desktop ${h.costs.desktopPointer} vs Mobile ${h.costs.mobileTouch} (delta +${h.mobileDelta})`,
		);
	}

	if (live) {
		console.log('\n4. Live Playwright Journey Measurements (1440x900 Desktop & 390x844 Mobile):');
		console.log(
			pad('ID', 5) +
				pad('Journey', 46) +
				pad('DeskObs(Exp)', 14) +
				pad('DeskScrl', 10) +
				pad('MobObs(Exp)', 13) +
				'MobScrl',
		);
		console.log('-'.repeat(100));
		for (let i = 0; i < live.desktop.length; i++) {
			const d = live.desktop[i];
			const m = live.mobile[i];
			console.log(
				pad(d.id, 5) +
					pad(d.label.slice(0, 44), 46) +
					pad(`${d.observedSteps} (${d.staticExpected})`, 14) +
					pad(`${d.scrollPx}px`, 10) +
					pad(`${m.observedSteps} (${m.staticExpected})`, 13) +
					`${m.scrollPx}px`,
			);
		}
	}
}

async function main() {
	const args = process.argv.slice(2);
	const asJson = args.includes('--json');
	const runLive = args.includes('--live');
	const fromIdx = args.indexOf('--from');
	const toIdx = args.indexOf('--to');

	if (fromIdx !== -1 && toIdx !== -1) {
		printQueryPath(args[fromIdx + 1], args[toIdx + 1]);
		return;
	}

	const matrices = computeAllPairs();
	const tasks = evaluateTasks(matrices);
	const live = runLive ? await runLiveHarness() : null;

	if (live) {
		const mismatches = [...live.desktop, ...live.mobile].filter((r) => r.deltaVsStatic !== 0);
		if (mismatches.length > 0 && args.includes('--strict')) {
			console.error('Static vs Live journey mismatch:', JSON.stringify(mismatches, null, 2));
			process.exit(1);
		}
	}

	if (asJson) {
		console.log(
			JSON.stringify(
				{
					nodeCount: NODES.length,
					edgeCount: EDGES.length,
					nodes: NODES,
					tasks: tasks.map(({ paths, ...rest }) => rest),
					live,
				},
				null,
				2,
			),
		);
		return;
	}

	printReport(matrices, tasks, live);
}

main().catch((err) => {
	console.error('INTERACTION MAP ERROR: ' + ((err && err.stack) || err));
	process.exit(1);
});
