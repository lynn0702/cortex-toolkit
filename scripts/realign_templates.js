const fs = require('fs');
const path = require('path');

const templatesPath = path.join(__dirname, '../js/templates.js');
let templates = require(templatesPath);

templates = templates.map(item => {
  // 1. Remove parenthetical explainer text from title
  const cleanTitle = item.title.replace(/\s*\([^)]*\)/g, '').trim();
  item.title = cleanTitle;

  const char = item.character;
  if (!char) return item;

  // 2. Ensure blank character fields
  char.name = '';
  char.description = '';
  char.pronouns = '';
  char.player = '';
  char.isTemplate = true;

  // 3. Spotlight header portrait
  char.portrait = {
    url: '',
    custom: {
      cortexToolkit: {
        size: 'spotlight',
        location: 'header'
      }
    }
  };

  // 4. Custom cortexToolkit metadata
  if (!char.custom) char.custom = {};
  if (!char.custom.cortexToolkit) char.custom.cortexToolkit = {};

  const colCount = item.id === 'spotlight-alien-us' ? 3 : 2;
  char.custom.cortexToolkit.sheetStyle = 'spotlight';
  char.custom.cortexToolkit.columns = colCount;
  char.custom.cortexToolkit.pageCount = item.pages || 1;
  char.custom.cortexToolkit.spotlight = item.spotlight || cleanTitle;
  char.custom.cortexToolkit.style = { hasAttributes: false };
  char.custom.cortexToolkit.columnAlignment = item.id === 'spotlight-alien-us' ? 'full-width' : 'top-base';
  char.custom.cortexToolkit.columnOffsets = { left: 0, center: 0, right: 0 };

  // 5. Realign Trait Sets
  if (Array.isArray(char.traitSets)) {
    char.traitSets.forEach((ts, tsIndex) => {
      if (!ts.custom) ts.custom = {};
      if (!ts.custom.cortexToolkit) ts.custom.cortexToolkit = {};
      const ctk = ts.custom.cortexToolkit;

      // Convert halo/attribute sets to standard column sets
      if (ctk.location === 'attributes' || ctk.style?.body === 'attributes' || ctk.style?.header === 'attributes') {
        ctk.location = 'right';
        if (!ctk.style) ctk.style = {};
        ctk.style.header = 'default';
        ctk.style.body = 'default';
        delete ctk.haloConfig;
        delete ctk.scaleDie;
        ctk.attributesRing = false;
      }

      // Column spanning for specific spotlight layouts
      if (item.id === 'spotlight-alien-us' && ts.name === 'Distinctions') {
        ctk.colSpan = 3;
      }

      // Ensure traits are blank empty slots
      if (Array.isArray(ts.traits)) {
        ts.traits.forEach(tr => {
          tr.value = 0;
          tr.dice = [];
          tr.description = '';
          if (Array.isArray(tr.traits)) {
            tr.traits.forEach(sub => {
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

  return item;
});

const output = `/**\n * Cortex Toolkit - Spotlight Templates Repository (Blank Spotlight Sheets)\n */\nconst cortexSpotlightTemplates = ${JSON.stringify(templates, null, 2)};\n\nif (typeof module !== "undefined" && module.exports) {\n\tmodule.exports = cortexSpotlightTemplates;\n}\n`;

fs.writeFileSync(templatesPath, output, 'utf8');
console.log('Successfully realigned', templates.length, 'templates in js/templates.js');
