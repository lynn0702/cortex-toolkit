/* Character Curio — Auto-versioned Offline Service Worker */
const CACHE_PREFIX = 'character-curio-';
const CACHE_VERSION = '__CURIO_SW_VERSION__';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;

// Populated by scripts/version-assets.js --site _site during deploy.
const PRECACHE_URLS = ['__CURIO_SW_PRECACHE__'];

self.addEventListener('install', (event) => {
	const urls = PRECACHE_URLS.filter((u) => typeof u === 'string' && !u.includes('__CURIO_SW_'));
	if (urls.length === 0) {
		self.skipWaiting();
		return;
	}
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(urls))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;

	const url = new URL(req.url);
	if (url.origin !== self.location.origin) return;

	if (req.mode === 'navigate') {
		event.respondWith(
			fetch(req)
				.then((res) => {
					if (res && res.ok) {
						const copy = res.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
					}
					return res;
				})
				.catch(() => caches.match('./index.html').then((cached) => cached || caches.match('./'))),
		);
		return;
	}

	event.respondWith(
		caches.match(req).then((cached) => {
			if (cached) return cached;
			return fetch(req).then((res) => {
				if (res && res.ok && res.type === 'basic') {
					const copy = res.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
				}
				return res;
			});
		}),
	);
});
