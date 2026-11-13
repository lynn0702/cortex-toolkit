export type ExternalFontFormat = 'woff2' | 'woff' | 'truetype' | 'opentype' | 'stylesheet';

export interface ParsedExternalFontUrl {
	url: string;
	kind: 'file' | 'stylesheet';
	format: ExternalFontFormat;
	shortFormat: 'woff2' | 'woff' | 'ttf' | 'otf' | 'css';
	host: string;
}

export function sanitizeFontFamilyName(rawName: string): string {
	return (rawName || '')
		.replace(/[\u0000-\u001F\u007F"'\\;{}<>()]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 80);
}

export function parseExternalFontUrl(rawUrl: string): ParsedExternalFontUrl | null {
	const trimmed = (rawUrl || '').trim();
	if (!trimmed) return null;

	let parsed: URL;
	try {
		parsed = new URL(trimmed);
	} catch {
		return null;
	}

	if (parsed.protocol !== 'https:' || parsed.username || parsed.password || !parsed.hostname.includes('.')) {
		return null;
	}

	const pathLower = parsed.pathname.toLowerCase();
	if (pathLower.endsWith('.woff2')) {
		return {
			url: parsed.href,
			kind: 'file',
			format: 'woff2',
			shortFormat: 'woff2',
			host: parsed.hostname,
		};
	}
	if (pathLower.endsWith('.woff')) {
		return {
			url: parsed.href,
			kind: 'file',
			format: 'woff',
			shortFormat: 'woff',
			host: parsed.hostname,
		};
	}
	if (pathLower.endsWith('.ttf')) {
		return {
			url: parsed.href,
			kind: 'file',
			format: 'truetype',
			shortFormat: 'ttf',
			host: parsed.hostname,
		};
	}
	if (pathLower.endsWith('.otf')) {
		return {
			url: parsed.href,
			kind: 'file',
			format: 'opentype',
			shortFormat: 'otf',
			host: parsed.hostname,
		};
	}

	return {
		url: parsed.href,
		kind: 'stylesheet',
		format: 'stylesheet',
		shortFormat: 'css',
		host: parsed.hostname,
	};
}

function prettifySlug(slug: string): string {
	let decoded = slug;
	try {
		decoded = decodeURIComponent(slug);
	} catch {
		decoded = slug;
	}

	const cleaned = decoded
		.split('|')[0]
		.split(':')[0]
		.split('@')[0]
		.replace(/\.(woff2|woff|ttf|otf|css)$/i, '')
		.replace(/[-_](regular|variablefont[a-z0-9_-]*)$/i, '')
		.replace(/[+_-]+/g, ' ');

	const sanitized = sanitizeFontFamilyName(cleaned);
	if (!sanitized) return '';
	if (sanitized === sanitized.toLowerCase()) {
		return sanitized
			.split(' ')
			.filter(Boolean)
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
	}
	return sanitized;
}

export function inferFontFamilyFromUrl(rawUrl: string): string {
	const parsed = parseExternalFontUrl(rawUrl);
	if (!parsed) return '';

	const u = new URL(parsed.url);
	const familyParam = u.searchParams.get('family');
	if (familyParam) {
		const res = prettifySlug(familyParam);
		if (res) return res;
	}

	const fParam = u.searchParams.getAll('f[]')[0] || u.searchParams.get('f');
	if (fParam) {
		const res = prettifySlug(fParam);
		if (res) return res;
	}

	if (u.hostname.toLowerCase().endsWith('typekit.net')) {
		return '';
	}

	if (parsed.kind === 'file') {
		const segments = u.pathname.split('/').filter(Boolean);
		const last = segments[segments.length - 1] || '';
		return prettifySlug(last);
	}

	const cssMatch = u.pathname.match(/\/css\/([^/]+)$/i);
	if (cssMatch && cssMatch[1].toLowerCase() !== 'css') {
		return prettifySlug(cssMatch[1]);
	}

	return '';
}

export function describeExternalFontUrl(rawUrl: string): string {
	const parsed = parseExternalFontUrl(rawUrl);
	if (!parsed) return rawUrl;
	return `${parsed.host} · ${parsed.shortFormat}`;
}

export function customFontDomId(fontName: string): string {
	const normalized = sanitizeFontFamilyName(fontName).toLowerCase();
	return 'cfont-' + normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
