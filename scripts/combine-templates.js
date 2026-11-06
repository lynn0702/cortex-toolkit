const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const prelude = fs.readFileSync(path.join(root, 'js/templates-bundle-prelude.js'), 'utf8');
const templates = fs.readFileSync(path.join(root, 'js/templates.js'), 'utf8');
const assign = fs.readFileSync(path.join(root, 'js/templates-bundle-assign.js'), 'utf8');

const combined = `${prelude}\n${templates}\n${assign}\n`;
fs.writeFileSync(path.join(root, 'js/templates.bundle.js'), combined, 'utf8');
console.log('combine-templates: wrote js/templates.bundle.js');
