const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '3000', 10);
const ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css':  'text/css; charset=utf-8',
	'.js':   'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png':  'image/png',
	'.jpg':  'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif':  'image/gif',
	'.svg':  'image/svg+xml',
	'.ico':  'image/x-icon',
	'.webp': 'image/webp',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf':  'font/ttf'
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
			res.writeHead(200, { 'Content-Type': contentType });
			res.end(content);
		});
	});
});

server.listen(PORT, () => {
	console.log(`\n  Cortex Toolkit dev server running at:`);
	console.log(`  > Local:   http://localhost:${PORT}/\n`);
});
