#!/usr/bin/env node
const { fork } = require('child_process');
const path = require('path');

const scripts = [
	'cortex-pal-tests.js',
	'sheet-grid-tests.js',
	'merge-tests.js',
	'materialize-tests.js',
	'storage-tests.js',
	'export-tests.js',
	'rating-tests.js',
	'functions-tests.js',
];

Promise.all(
	scripts.map(
		(script) =>
			new Promise((resolve, reject) => {
				const fullPath = path.join(__dirname, script);
				const child = fork(fullPath, [], { stdio: 'pipe' });
				let stdout = '';
				let stderr = '';
				child.stdout.on('data', (chunk) => (stdout += chunk));
				child.stderr.on('data', (chunk) => (stderr += chunk));
				child.on('exit', (code) => {
					if (code === 0) {
						resolve(stdout);
					} else {
						reject(new Error(`${script} failed (exit ${code}):\n${stderr || stdout}`));
					}
				});
			}),
	),
)
	.then((results) => {
		for (const output of results) {
			process.stdout.write(output);
		}
	})
	.catch((err) => {
		console.error(err.message || err);
		process.exit(1);
	});
