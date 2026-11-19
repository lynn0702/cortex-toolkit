declare const __SELF_HOSTED_FONTS__: string[] | undefined;

function discoverSelfHostedFonts(): string[] {
	if (typeof __SELF_HOSTED_FONTS__ !== 'undefined' && Array.isArray(__SELF_HOSTED_FONTS__)) {
		return __SELF_HOSTED_FONTS__;
	}
	// Node test runner fallback (reads css/fonts.css directly when not bundled by Vite)
	try {
		const proc = (
			globalThis as {
				process?: {
					getBuiltinModule?: (id: string) => unknown;
				};
			}
		).process;
		const getBuiltin = proc && typeof proc.getBuiltinModule === 'function' ? proc.getBuiltinModule : undefined;
		if (typeof getBuiltin === 'function') {
			const fs = getBuiltin('node:fs') as {
				existsSync(p: string): boolean;
				readFileSync(p: string, enc: string): string;
			};
			const path = getBuiltin('node:path') as {
				dirname(p: string): string;
				resolve(...parts: string[]): string;
			};
			const url = getBuiltin('node:url') as {
				fileURLToPath(u: string): string;
			};
			const dir = path.dirname(url.fileURLToPath(import.meta.url));
			const cssPath = path.resolve(dir, '..', 'css', 'fonts.css');
			if (fs.existsSync(cssPath)) {
				const css = fs.readFileSync(cssPath, 'utf8');
				const seen = new Set<string>();
				const list: string[] = [];
				for (const m of css.matchAll(/font-family:\s*['"]([^'"]+)['"]/g)) {
					const fam = m[1].trim();
					const low = fam.toLowerCase();
					if (fam && !seen.has(low)) {
						seen.add(low);
						list.push(fam);
					}
				}
				if (list.length > 0) return list;
			}
		}
	} catch {
		// ignore in browser environments
	}
	return ['Josefin Sans', 'Open Sans', 'Alegreya Sans SC'];
}

export const SELF_HOSTED_FONTS: readonly string[] = discoverSelfHostedFonts();

const SELF_HOSTED_SET = new Set(SELF_HOSTED_FONTS.map((f) => f.trim().toLowerCase()));

export function isSelfHostedFont(fontName: string | null | undefined): boolean {
	if (!fontName || typeof fontName !== 'string') return false;
	return SELF_HOSTED_SET.has(fontName.trim().toLowerCase());
}
