const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = parseInt(process.env.PORT || '3000', 10);
const ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.webp': 'image/webp',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
	// Parse pathname and strip query parameters or hashes
	let reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
	if (reqPath === '/' || reqPath === '') {
		reqPath = '/index.html';
	}

	// Resolve target file and prevent directory traversal outside ROOT
	const safePath = path.normalize(path.join(ROOT, reqPath));
	if (!safePath.startsWith(ROOT)) {
		res.writeHead(403, { 'Content-Type': 'text/plain' });
		res.end('403 Forbidden');
		return;
	}

	fs.stat(safePath, (err, stats) => {
		if (err) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('404 Not Found');
			return;
		}

		let filePath = safePath;
		if (stats.isDirectory()) {
			filePath = path.join(safePath, 'index.html');
		}

		const ext = path.extname(filePath).toLowerCase();
		const contentType = MIME_TYPES[ext] || 'application/octet-stream';

		fs.readFile(filePath, (readErr, content) => {
			if (readErr) {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end('500 Internal Server Error');
				return;
			}
			res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
			res.end(content);
		});
	});
});

let watcher = null;

function cleanup() {
	if (watcher && !watcher.killed) {
		try {
			watcher.kill();
		} catch {
			// ignore
		}
	}
	server.close();
	process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', () => {
	if (watcher && !watcher.killed) {
		try {
			watcher.kill();
		} catch {
			// ignore
		}
	}
});

server.listen(PORT, () => {
	console.log(`\n  Character Curio dev server running at:`);
	console.log(`  > Local:   http://localhost:${PORT}/\n`);

	const shouldWatch = !process.env.NO_WATCH && !process.argv.includes('--no-watch');
	if (shouldWatch) {
		if (!fs.existsSync(path.join(ROOT, 'js/templates.bundle.js'))) {
			require('./combine-templates.js');
		}
		const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
		if (fs.existsSync(viteBin)) {
			console.log(`  > Watcher: starting vite build --watch...\n`);
			watcher = spawn(process.execPath, [viteBin, 'build', '--watch'], {
				cwd: ROOT,
				stdio: 'inherit',
				env: { ...process.env },
			});
			watcher.on('error', (err) => {
				console.error(`[watch error] Failed to start Vite watcher:`, err.message);
			});
			watcher.on('exit', (code) => {
				if (code && code !== 0) {
					console.warn(`[watch] Vite watcher exited with code ${code}`);
				}
			});
		} else {
			console.warn(`  > Watcher: vite binary not found at ${viteBin}`);
		}
	}
});
