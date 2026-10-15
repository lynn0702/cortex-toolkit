/**
 * Safely deep-clone an object or array, unwrapping Vue reactive proxies if present.
 */
export function cloneDeep<T>(v: T): T {
	if (v === null || typeof v !== 'object') return v;
	const unwrap = (obj: unknown): unknown => {
		if (obj === null || typeof obj !== 'object') return obj;
		let cur = obj as Record<string, unknown>;
		while (cur && cur['__v_raw']) {
			cur = cur['__v_raw'] as Record<string, unknown>;
		}
		if (Array.isArray(cur)) return cur.map(unwrap);
		if (cur.constructor && cur.constructor.name !== 'Object') return cur;
		const res: Record<string, unknown> = {};
		for (const k of Object.keys(cur)) {
			res[k] = unwrap(cur[k]);
		}
		return res;
	};
	return structuredClone(unwrap(v)) as T;
}
