// Storage backend tests: IndexedDB primary, full-record localStorage
// fallback, newest-record-wins load, failure honesty (no poison-forever).
// Fakes drive every failure mode; no browser needed.
// Usage: node scripts/storage-tests.js  (exit 1 on failure)

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

function quotaError() {
  const e = new Error('quota');
  e.name = 'QuotaExceededError';
  e.code = 22;
  return e;
}
function securityError() {
  const e = new Error('denied');
  e.name = 'SecurityError';
  return e;
}

// Minimal fake IndexedDB: one store, scripted failure modes.
function makeIDB(mode) {
  // mode: { open: 'ok'|'fail'|'blocked', put: 'ok'|'fail', del: 'ok' }
  const tables = {};
  const fire = (target, handler, arg) => { if (typeof target[handler] === 'function') target[handler](arg); };
  const store = (name) => ({
    get: (key) => {
      const req = {};
      queueMicrotask(() => {
        if (mode.get === 'fail') { fire(req, 'onerror'); req.error = new Error('read fail'); return; }
        req.result = tables[name] && tables[name][key] !== undefined ? tables[name][key] : null;
        fire(req, 'onsuccess', { target: req });
      });
      return req;
    },
    put: (val, key) => {
      const req = {};
      queueMicrotask(() => {
        if (mode.put === 'fail') { fire(req, 'onerror'); req.error = new Error('write fail'); return; }
        (tables[name] = tables[name] || {})[key] = val;
        fire(req, 'onsuccess', { target: req });
      });
      return req;
    },
    delete: (key) => {
      const req = {};
      queueMicrotask(() => {
        if (tables[name]) delete tables[name][key];
        fire(req, 'onsuccess', { target: req });
      });
      return req;
    },
  });
  const db = {
    objectStoreNames: { contains: () => true },
    createObjectStore: () => {},
    transaction: (sname, tmode) => {
      const tx = { error: null, objectStore: (n) => store(n) };
      queueMicrotask(() => fire(tx, 'oncomplete', {}));
      return tx;
    },
    __tables: tables,
  };
  return {
    open: () => {
      const req = {};
      queueMicrotask(() => {
        if (mode.open === 'fail') { fire(req, 'onerror'); req.error = new Error('open fail'); return; }
        if (mode.open === 'blocked') { fire(req, 'onblocked'); return; }
        fire(req, 'onsuccess', { target: { result: db } });
      });
      return req;
    },
    __db: db,
  };
}

// Map-backed localStorage with byte quota and block switch.
function makeLS(limitBytes) {
  const map = new Map();
  let blocked = false;
  return {
    __map: map,
    set blocked(v) { blocked = v; },
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      if (blocked) throw securityError();
      const cur = map.has(k) ? map.get(k).length : 0;
      let total = 0;
      map.forEach((x) => { total += x.length; });
      if (total - cur + String(v).length > limitBytes) throw quotaError();
      map.set(k, String(v));
    },
    removeItem: (k) => { if (blocked) throw securityError(); map.delete(k); },
    get length() { return map.size; },
    key: (i) => [...map.keys()][i],
  };
}

const storagePath = '../js/storage.ts';
const storageMod = require(storagePath);
function freshStore() {
  const S = storageMod.cortexStorage;
  // Module-level open state must reset between scenarios (require cache
  // keeps one module instance): drop the cached DB promise and re-read
  // backend availability from the current globals.
  S._dbPromise = null;
  S._useIDB = (typeof indexedDB !== 'undefined');
  return S;
}

const demoChars = [{ id: 'c1', name: 'Test', traitSets: [], sheet: { template: { id: 't1', version: 1 } } }];
const demoTpls = [{ id: 't1', version: 1, title: 'T', character: { traitSets: [] } }];
const demoState = () => ({
  characters: JSON.parse(JSON.stringify(demoChars)),
  openCharacterIDs: ['c1'],
  playViewMode: 'split',
  rollerPosition: 'left',
  templates: JSON.parse(JSON.stringify(demoTpls)),
  preferences: { version: 1 },
});

async function scenario(name, fn) {
  try {
    await fn();
  } catch (e) {
    fail++;
    console.log('  FAIL ' + name + ' threw :: ' + String((e && e.stack || e)).slice(0, 200));
  }
}

(async () => {
  // 1. Healthy IndexedDB round-trip.
  await scenario('healthy', async () => {
    globalThis.indexedDB = makeIDB({ open: 'ok', put: 'ok' });
    globalThis.localStorage = makeLS(5 * 1024 * 1024);
    globalThis.navigator = { storage: { persist: async () => true } };
    const S = freshStore();
    const r = await S.save(demoState());
    ok(r.backend === 'indexeddb', 'healthy save uses indexeddb', r);
    const loaded = await S.load();
    ok(loaded.characters.length === 1 && loaded.characters[0].id === 'c1', 'characters round-trip');
    ok(loaded.templates.length === 1 && loaded.templates[0].id === 't1', 'snapshots round-trip');
    ok(loaded.openCharacterIDs[0] === 'c1', 'ids round-trip');
  });

  // 2. Transient open failure falls back losslessly, then recovers (no poison).
  await scenario('transient', async () => {
    const idb = makeIDB({ open: 'ok', put: 'ok' });
    let failOpen = true;
    const realOpen = idb.open;
    idb.open = () => {
      if (failOpen) {
        return { onsuccess: null, onerror: null, onblocked: null, __fail: true };
      }
      return realOpen();
    };
    // fail-open request: fires onerror on next tick
    const failingOpen = () => {
      const req = {};
      queueMicrotask(() => { req.error = new Error('open fail'); if (req.onerror) req.onerror({}); });
      return req;
    };
    idb.open = () => (failOpen ? failingOpen() : realOpen());
    globalThis.indexedDB = idb;
    globalThis.localStorage = makeLS(5 * 1024 * 1024);
    globalThis.navigator = {};
    const S = freshStore();
    const r1 = await S.save(demoState());
    ok(r1.backend === 'localstorage', 'failed IDB falls back', r1);
    const fb = JSON.parse(globalThis.localStorage.getItem('cortexToolkitFallback'));
    ok(fb && fb.characters.length === 1 && fb.templates.length === 1 && fb.preferences.version === 1, 'fallback record is complete (templates + prefs kept)', !!fb && fb.templates && fb.templates.length);
    failOpen = false;
    const r2 = await S.save(demoState());
    ok(r2.backend === 'indexeddb', 'recovers on next save (no poison-forever)', r2);
    ok(globalThis.localStorage.getItem('cortexToolkitFallback') === null, 'fallback key cleared after IDB save');
  });

  // 3. Blocked database retries instead of wedging.
  await scenario('blocked', async () => {
    let blocked = true;
    const idb = makeIDB({ open: 'ok', put: 'ok' });
    const realOpen = idb.open;
    idb.open = () => {
      if (!blocked) return realOpen();
      const req = {};
      queueMicrotask(() => { if (req.onblocked) req.onblocked({}); });
      return req;
    };
    globalThis.indexedDB = idb;
    globalThis.localStorage = makeLS(5 * 1024 * 1024);
    globalThis.navigator = {};
    const S = freshStore();
    const r1 = await S.save(demoState());
    ok(r1.backend === 'localstorage', 'blocked IDB falls back');
    blocked = false;
    const r2 = await S.save(demoState());
    ok(r2.backend === 'indexeddb', 'unblocked recovers (dbPromise reset)');
  });

  // 4. Everything down: quota surfaces as quota, not generic.
  await scenario('quota', async () => {
    globalThis.indexedDB = makeIDB({ open: 'fail', put: 'fail' });
    globalThis.localStorage = makeLS(10); // tiny: forces quota
    globalThis.navigator = {};
    const S = freshStore();
    let err = null;
    try { await S.save(demoState()); } catch (e) { err = e; }
    ok(!!err && !!err.isQuotaError, 'quota flagged on total failure', err && err.name);
  });

  // 5. clear() removes IDB record, fallback, and legacy keys.
  await scenario('clear', async () => {
    globalThis.indexedDB = makeIDB({ open: 'ok', put: 'ok' });
    const ls = makeLS(5 * 1024 * 1024);
    globalThis.localStorage = ls;
    globalThis.navigator = {};
    const S = freshStore();
    await S.save(demoState());
    ls.setItem('cortexToolkitData', '{}');
    await S.clear();
    const loaded = await S.load();
    ok(loaded.characters.length === 0, 'IDB record cleared');
    ok(ls.getItem('cortexToolkitFallback') === null, 'fallback key cleared');
    ok(ls.getItem('cortexToolkitData') === null, 'legacy keys cleared');
  });

  // 6. Newest record wins between stale IDB and newer fallback.
  await scenario('newest-wins', async () => {
    globalThis.indexedDB = makeIDB({ open: 'ok', put: 'ok' });
    globalThis.localStorage = makeLS(5 * 1024 * 1024);
    globalThis.navigator = {};
    const S = freshStore();
    const old = demoState();
    await S.save(old);
    const fb = JSON.parse(globalThis.localStorage.getItem('cortexToolkitFallback') || 'null');
    const newer = demoState();
    newer.characters[0].name = 'Newer';
    const stamped = { v: 1, savedAt: new Date(Date.now() + 60000).toISOString(), characters: newer.characters, openCharacterIDs: [], playViewMode: 'split', rollerPosition: 'left', templates: newer.templates, preferences: {} };
    globalThis.localStorage.setItem('cortexToolkitFallback', JSON.stringify(stamped));
    void fb;
    const loaded = await S.load();
    ok(loaded.characters[0] && loaded.characters[0].name === 'Newer', 'newer fallback beats stale IDB');
  });

  console.log(`storage-tests: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
