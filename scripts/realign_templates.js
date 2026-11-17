const fs = require('fs');
const path = require('path');
const { orderTemplateKeys } = require('../js/layered-materialize.ts');

const templatesPath = path.join(__dirname, '../js/templates.js');
let templates = require(templatesPath);

templates = templates.map((item) => {
	const char = item.character;
	if (!char) return item;

	// 1. Remove parenthetical explainer text from card title / game
	if (char.view && char.view.listing && typeof char.view.listing.title === 'string') {
		char.view.listing.title = char.view.listing.title.replace(/\s*\([^)]*\)/g, '').trim();
	}
	const nameSet = Array.isArray(char.traitSets)
		? char.traitSets.find((s) => s && (s.id === 'name' || (s.view && s.view.style && s.view.style.body === 'name')))
		: null;
	const gameTrait =
		nameSet && Array.isArray(nameSet.traits) ? nameSet.traits.find((t) => t && t.name === 'game') : null;
	const cleanGame = String((gameTrait && gameTrait.description) || '')
		.replace(/\s*\([^)]*\)/g, '')
		.trim();
	if (gameTrait && cleanGame) gameTrait.description = cleanGame;

	// 2. Ensure blank curiosity root fields (0.2)
	char.name = '';
	delete char.description;
	delete char.pronouns;
	delete char.player;
	delete char.game;
	delete char.nickname;
	delete char.notes;
	delete char.portrait;
	char.isTemplate = true;

	// 4. View metadata
	if (!char.view) char.view = {};
	if (char.custom && char.custom.characterCurio) {
		char.view = { ...char.custom.characterCurio, ...char.view };
		delete char.custom.characterCurio;
		if (Object.keys(char.custom).length === 0) delete char.custom;
	}

	delete char.view.columns;
	delete char.view.columnsPage2;
	char.view.pageCount = Number(char.view.pageCount) || 1;
	char.view.template = cleanGame || (char.view.listing && char.view.listing.title) || item.id;
	char.view.columnAlignment = item.id === 'alien-us' ? 'full-width' : 'top-base';
	char.view.columnOffsets = { left: 0, center: 0, right: 0 };

	// 5. Realign Trait Sets
	if (Array.isArray(char.traitSets)) {
		char.traitSets.forEach((ts, tsIndex) => {
			if (!ts.view) ts.view = {};
			if (ts.custom && ts.custom.characterCurio) {
				ts.view = { ...ts.custom.characterCurio, ...ts.view };
				delete ts.custom.characterCurio;
				if (Object.keys(ts.custom).length === 0) delete ts.custom;
			}
			const ctk = ts.view;

			// Convert ring/attribute sets to standard sets (placement-agnostic:
			// coordinates live in view.place, authored per set, not here)
			if (ctk.location === 'attributes' || ctk.style?.body === 'attributes' || ctk.style?.header === 'attributes') {
				if (!ctk.style) ctk.style = {};
				ctk.style.header = 'default';
				ctk.style.body = 'default';
				ctk.ringTrait = false;
			}

			// Ensure traits are blank empty slots
			if (Array.isArray(ts.traits)) {
				ts.traits.forEach((tr) => {
					tr.value = 0;
					tr.dice = [];
					tr.description = '';
					if (Array.isArray(tr.traits)) {
						tr.traits.forEach((sub) => {
							sub.value = 0;
							sub.dice = [];
							sub.description = '';
						});
					}
				});

				// Set reservedSlots to at least current traits length
				if (ctk.reservedSlots === undefined || ctk.reservedSlots === null) {
					ctk.reservedSlots = ts.traits.length;
				} else {
					ctk.reservedSlots = Math.max(Number(ctk.reservedSlots) || 0, ts.traits.length);
				}
			}
		});
	}

	return orderTemplateKeys(item);
});

const output = `/**\n * Character Curio - Library Templates Repository (Blank Sheets)\n */\nconst characterCurioLibraryTemplates = ${JSON.stringify(templates, null, 2)};\n\nif (typeof module !== "undefined" && module.exports) {\n\tmodule.exports = characterCurioLibraryTemplates;\n}\n`;

fs.writeFileSync(templatesPath, output, 'utf8');
console.log('Successfully realigned', templates.length, 'templates in js/templates.js');
