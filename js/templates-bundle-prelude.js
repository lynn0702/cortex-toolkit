// Browser prelude for the Spotlight templates bundle.
// js/templates.js is a CommonJS module (module.exports),
// but this bundle loads as a classic script tag, where
// `module` does not exist. Provide it so the module
// assignment below succeeds, then the trailing file
// copies the array onto the window global the app reads.
window.module = { exports: {} };
