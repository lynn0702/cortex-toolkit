#!/usr/bin/env node
/**
 * Buffer-safe Prettier runner.
 *
 * Checks files with `--list-different` first and only invokes `--write` on files
 * whose formatted output actually differs, avoiding spurious `mtime` bumps on
 * already-formatted files (which cause IDE "content of the file is newer" save
 * conflicts). In `--staged` mode (used by `.githooks/pre-commit`), refuses to
 * modify files that have unstaged working-tree edits.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prettierBin = path.join(root, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
const BATCH_SIZE = 100;
const stagedOnly = process.argv.includes('--staged');

function run(cmd, args) {
	const res = spawnSync(cmd, args, { cwd: root, encoding: 'utf8' });
	if (res.error) {
		throw res.error;
	}
	return res;
}

function runPrettier(args) {
	return run(process.execPath, [prettierBin, ...args]);
}

function chunk(items, size) {
	const batches = [];
	for (let i = 0; i < items.length; i += size) {
		batches.push(items.slice(i, i + size));
	}
	return batches;
}

function parseNullList(stdout) {
	return (stdout || '').split('\0').filter(Boolean);
}

function writeDifferent(files, extraArgs = []) {
	for (const batch of chunk(files, BATCH_SIZE)) {
		const res = runPrettier([...extraArgs, '--write', '--cache', '--', ...batch]);
		if (res.status !== 0) {
			if (res.stderr) process.stderr.write(res.stderr);
			if (res.stdout) process.stdout.write(res.stdout);
			process.exit(res.status || 1);
		}
	}
}

function runWorkspace() {
	const check = runPrettier(['--list-different', '--cache', '.']);
	if (check.status === 0) {
		console.log('format-changed: all files already formatted (0 writes)');
		return;
	}
	if (check.status !== 1) {
		if (check.stderr) process.stderr.write(check.stderr);
		if (check.stdout) process.stdout.write(check.stdout);
		process.exit(check.status || 1);
	}

	const differentFiles = (check.stdout || '')
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);

	if (differentFiles.length === 0) {
		console.log('format-changed: all files already formatted (0 writes)');
		return;
	}

	writeDifferent(differentFiles);
	console.log(`format-changed: formatted ${differentFiles.length} changed file(s)`);
}

function runStaged() {
	const stagedRes = run('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']);
	if (stagedRes.status !== 0) {
		if (stagedRes.stderr) process.stderr.write(stagedRes.stderr);
		process.exit(stagedRes.status || 1);
	}

	const stagedFiles = parseNullList(stagedRes.stdout).filter((rel) => {
		const abs = path.join(root, rel);
		return fs.existsSync(abs) && fs.statSync(abs).isFile();
	});

	if (stagedFiles.length === 0) {
		console.log('format-changed: no staged files');
		return;
	}

	const differentFiles = [];
	for (const batch of chunk(stagedFiles, BATCH_SIZE)) {
		const check = runPrettier(['--ignore-unknown', '--list-different', '--cache', '--', ...batch]);
		if (check.status === 0) continue;
		if (check.status !== 1) {
			if (check.stderr) process.stderr.write(check.stderr);
			if (check.stdout) process.stdout.write(check.stdout);
			process.exit(check.status || 1);
		}
		for (const line of (check.stdout || '').split(/\r?\n/)) {
			const trimmed = line.trim();
			if (trimmed) differentFiles.push(trimmed);
		}
	}

	if (differentFiles.length === 0) {
		console.log('format-changed: staged files already formatted (0 writes)');
		return;
	}

	const unstagedRes = run('git', ['diff', '--name-only', '-z']);
	if (unstagedRes.status !== 0) {
		if (unstagedRes.stderr) process.stderr.write(unstagedRes.stderr);
		process.exit(unstagedRes.status || 1);
	}
	const unstagedSet = new Set(parseNullList(unstagedRes.stdout));
	const dirtyOverlap = differentFiles.filter((file) => unstagedSet.has(file.replace(/\\/g, '/')));
	if (dirtyOverlap.length > 0) {
		console.error(
			`[FAIL] Refusing to auto-format partially staged/dirty file(s): ${dirtyOverlap.join(', ')}. Accept/stage all changes first.`,
		);
		process.exit(1);
	}

	writeDifferent(differentFiles, ['--ignore-unknown']);
	for (const batch of chunk(differentFiles, BATCH_SIZE)) {
		const addRes = run('git', ['add', '--', ...batch]);
		if (addRes.status !== 0) {
			if (addRes.stderr) process.stderr.write(addRes.stderr);
			process.exit(addRes.status || 1);
		}
	}
	console.log(`format-changed: formatted and re-staged ${differentFiles.length} staged file(s)`);
}

if (stagedOnly) {
	runStaged();
} else {
	runWorkspace();
}
