/* cloud.js - accounts and online saving through Supabase (PostgreSQL database + file storage).

   Loads AFTER script.js, safety.js and sitegen.js. It only adds things. If config.js is empty, this file does
   nothing at all and the builder works exactly as before (local drafts + optional Google Sheet).

   It talks to Supabase's standard web endpoints directly (no extra library):
     /auth/v1/...     sign up, sign in, password reset
     /rest/v1/...     projects, revisions, photo records   (protected by the Row Level Security rules in supabase/migrations)
     /storage/v1/...  the photo files                      (protected by the storage rules in supabase/migrations)
   Only the PUBLIC anon key is used here. Access control lives in the database, not in this file. */
(function () {
'use strict';

var CFG = window.WB_CONFIG || {};
var BUCKET = 'project-assets', MAX_FILE = 10 * 1024 * 1024;
var SESSION_KEY = 'wb_session', OPEN_KEY = 'wb_open_project';
var MIME_EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };
var DELAY = Math.max(200, Math.min(30000, +CFG.autosaveDelayMs || 2000));

/* ---------- is it configured, and safely? ---------- */
function keyRole(k) { try { var p = String(k).split('.')[1]; return JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/'))).role || ''; } catch (e) { return ''; } }
function urlOk(u) { try { var x = new URL(u); return x.protocol === 'https:' || (x.protocol === 'http:' && (x.hostname === 'localhost' || x.hostname === '127.0.0.1')); } catch (e) { return false; } }
var wanted = !!(CFG.supabaseUrl || CFG.supabaseAnonKey), problem = '';
if (wanted) {
  if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) problem = 'Both supabaseUrl and supabaseAnonKey must be filled in config.js.';
  else if (!urlOk(CFG.supabaseUrl)) problem = 'supabaseUrl in config.js must start with https://';
  else if (/^sb_secret_/.test(CFG.supabaseAnonKey) || keyRole(CFG.supabaseAnonKey) === 'service_role')
    problem = 'config.js contains a SECRET key (service_role). Remove it now and rotate it in Supabase: anyone who opens this website can copy it. Use the public anon key instead.';
}
var enabled = wanted && !problem;
if (problem) { try { console.error('[cloud.js] ' + problem); } catch (e) {} }
if (!wanted) return; /* nothing configured: add no buttons, change nothing */
var base = enabled ? String(CFG.supabaseUrl).replace(/\/+$/, '') : '';

/* ---------- session (kept in this browser; cleared on sign out) ---------- */
var session = null;
function loadSession() { try { var s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); if (s && s.access_token && s.refresh_token && s.user && s.user.id) session = s; } catch (e) {} }
function storeSession(r) {
  session = { access_token: r.access_token, refresh_token: r.refresh_token, expires_at: Date.now() + (+r.expires_in || 3600) * 1000, user: { id: r.user && r.user.id, email: r.user && r.user.email } };
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) {}
}
function clearSession() { session = null; try { localStorage.removeItem(SESSION_KEY); } catch (e) {} }

/* ---------- talking to Supabase ---------- */
function fail(status, message, code, offline) { var e = new Error(message); e.status = status; e.code = code || ''; e.offline = !!offline; return e; }
function send(method, path, o) {
  o = o || {};
  var token = o.anon ? CFG.supabaseAnonKey : (session ? session.access_token : CFG.supabaseAnonKey);
  var headers = { apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + token }, body;
  if (o.raw !== undefined) body = o.raw; else if (o.json !== undefined) { body = JSON.stringify(o.json); headers['Content-Type'] = 'application/json'; }
  if (o.headers) Object.keys(o.headers).forEach(function (k) { headers[k] = o.headers[k]; });
  return fetch(base + path, { method: method, headers: headers, body: body }).then(function (res) {
    if (o.blob && res.ok) return res.blob();
    return res.text().then(function (t) {
      var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
      if (!res.ok) throw fail(res.status, (j && (j.message || j.msg || j.error_description || j.error)) || ('Request failed (' + res.status + ')'), (j && (j.code || j.error_code)) || '');
      return j;
    });
  }, function () { throw fail(0, 'Could not reach the server. Check your internet connection.', 'offline', true); });
}
var refreshing = null;
function refresh() {
  if (refreshing) return refreshing;
  if (!session) return Promise.reject(fail(401, 'Please sign in again.', 'no_session'));
  refreshing = send('POST', '/auth/v1/token?grant_type=refresh_token', { json: { refresh_token: session.refresh_token }, anon: true })
    .then(function (r) { storeSession(r); refreshing = null; return r; })
    .catch(function (e) { refreshing = null; if (!e.offline) { clearSession(); sessionLost(); } throw e; });
  return refreshing;
}
function api(method, path, o) {
  o = o || {};
  var pre = (session && session.expires_at - Date.now() < 60000) ? refresh().catch(function () {}) : Promise.resolve();
  return pre.then(function () {
    return send(method, path, o).catch(function (e) {
      if (e.status === 401 && session && !o.retried) { o.retried = true; return refresh().then(function () { return send(method, path, o); }); }
      throw e;
    });
  });
}
function enc(v) { return encodeURIComponent(v); }
function rest(method, table, query, body, prefer) {
  return api(method, '/rest/v1/' + table + (query ? '?' + query : ''), { json: body, headers: prefer ? { Prefer: prefer } : {} });
}
var WRITE = 'return=representation';

/* ---------- friendly messages ---------- */
function nice(e) {
  var m = String((e && e.message) || e || ''), l = m.toLowerCase();
  if (e && e.offline) return m;
  if (/invalid login credentials/.test(l)) return 'The email or password is not correct.';
  if (/email not confirmed/.test(l)) return 'Please confirm your email first. Check your inbox for the link we sent.';
  if (/already registered|already been registered/.test(l)) return 'An account with this email may already exist. Try signing in, or use "Forgot password".';
  if (/password should be|at least \d+ char|weak/.test(l)) return 'Choose a stronger password (at least 8 characters).';
  if (/rate limit|too many/.test(l)) return 'Too many attempts. Please wait a few minutes and try again.';
  if (e && e.status === 413) return 'That is too large to save.';
  return m || 'Something went wrong. Please try again.';
}

/* ---------- account actions ---------- */
function signUp(email, pw) {
  return send('POST', '/auth/v1/signup', { json: { email: email, password: pw }, anon: true }).then(function (r) {
    if (r && r.access_token) { storeSession(r); return { signedIn: true }; }
    return { needsConfirm: true };
  });
}
function signIn(email, pw) { return send('POST', '/auth/v1/token?grant_type=password', { json: { email: email, password: pw }, anon: true }).then(function (r) { storeSession(r); return r; }); }
function resetPassword(email) { return send('POST', '/auth/v1/recover?redirect_to=' + enc(location.origin + location.pathname), { json: { email: email }, anon: true }); }
function updatePassword(pw) { return api('PUT', '/auth/v1/user', { json: { password: pw } }); }
function readHash() {
  var h = location.hash.replace(/^#/, ''); if (!/(^|&)(access_token|error)=/.test(h)) return null;
  var p = {}; h.split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) { try { p[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')); } catch (e) {} } });
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  return p;
}

/* ---------- app state helpers (these reach into script.js's globals) ---------- */
function stateSnapshot() { return JSON.stringify(S); }
function assetSig() {
  return Object.keys(ORIG).sort().map(function (k) { var f = ORIG[k] || {}; return k + ':' + f.name + ':' + f.size + ':' + f.lastModified; }).join('|');
}
function snapshot() { return stateSnapshot() + '#' + assetSig(); }
function isBlank() {
  var any = ['id', 'client', 'bizName', 'desc', 'type', 'phone', 'email', 'address', 'whatsapp', 'corrections'].some(function (k) { return String(S[k] || '').trim(); });
  return !any && !Object.keys(S.files || {}).length && !Object.keys(ORIG).length ;
}
/* The reset below mirrors the "New client" button in script.js. Used for "New website" and for signing out. */
function resetApp() {
  S = defaults(); IMG = {}; ORIG = {};
  try { knownId = ''; } catch (e) {}
  try { pickedLogoColor = ''; } catch (e) {}
  try { ST = {}; } catch (e) {}
  try { localStorage.removeItem('wp_state'); localStorage.removeItem('wp_state_time'); } catch (e) {}
  fill(); onChange(); try { saveImgs(); } catch (e) {} window.scrollTo(0, 0);
}
function waitFor(test, ms) { return new Promise(function (res) { var t0 = Date.now(); (function poll() { if (test() || Date.now() - t0 > ms) res(); else setTimeout(poll, 40); })(); }); }

/* ---------- the open project ---------- */
var cur = { id: null, name: '', version: 0, savedSnap: '', savedAt: 0, status: 'signedout', detail: '', theirVersion: 0 };
var loading = false, busy = false, uploaded = new WeakMap(), lastSeen = '', stableSince = 0, nextRetry = 0, skippedNote = '';
function saveMeta() { try { localStorage.setItem(OPEN_KEY, JSON.stringify({ uid: session && session.user.id, id: cur.id, version: cur.version, savedSnap: cur.savedSnap, name: cur.name })); } catch (e) {} }
function readMeta() { try { return JSON.parse(localStorage.getItem(OPEN_KEY) || 'null'); } catch (e) { return null; } }
function clearMeta() { try { localStorage.removeItem(OPEN_KEY); } catch (e) {} }
function detach() { cur.id = null; cur.name = ''; cur.version = 0; cur.savedSnap = ''; clearMeta(); setStatus(session ? 'nopro' : 'signedout'); }

var STATUS_TEXT = { signedout: 'Sign in to save online', nopro: 'Not saved online yet', loading: 'Loading\u2026', saved: 'Saved', dirty: 'Unsaved changes', saving: 'Saving\u2026', error: 'Could not save. Retrying\u2026', offline: 'Offline. Will retry', conflict: 'Conflict: action needed' };
function setStatus(s, detail) { cur.status = s; cur.detail = detail ? nice(detail) : ''; paintChip(); if (dlg && dlg.open) paint(); }
function chipText() {
  var t = STATUS_TEXT[cur.status] || '';
  if (cur.status === 'saved' && cur.savedAt) t = 'Saved ' + new Date(cur.savedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return t;
}

/* ---------- building and reading project data ---------- */
function stateForCloud() { var s = JSON.parse(JSON.stringify(S)); return { schema: 1, state: s }; }
function applyCloudState(data) {
  var st = (data && typeof data === 'object' && data.state && typeof data.state === 'object') ? data.state : {};
  var next = defaults(); Object.keys(st).forEach(function (k) { if (k in next) next[k] = st[k]; });
  S = next; IMG = {}; ORIG = {}; sanitizeState(); /* never trust stored data: same checks as pasted text */
}
function projectName() { return (S.id || S.bizName || 'Untitled website').toString().slice(0, 120); }

/* ---------- photos: files go to Storage, a small record goes to the database ---------- */
function assetRows(pid) { return rest('GET', 'project_assets', 'project_id=eq.' + enc(pid) + '&select=id,slot,storage_path,file_name,mime_type,size_bytes'); }
function newPath(pid, slot, ext) { return session.user.id + '/' + pid + '/' + slot + '-' + Math.random().toString(36).slice(2, 10) + '.' + ext; }
function storageDelete(paths) { return paths.length ? api('DELETE', '/storage/v1/object/' + BUCKET, { json: { prefixes: paths } }) : Promise.resolve(); }
function syncAssets(pid) {
  var skipped = [];
  return assetRows(pid).then(function (rows) {
    var bySlot = {}; rows.forEach(function (r) { bySlot[r.slot] = r; });
    var chain = Promise.resolve(), removeObjs = [];
    Object.keys(ORIG).forEach(function (slot) {
      var f = ORIG[slot]; if (!f || !S.files[slot]) return;
      var ext = MIME_EXT[f.type];
      if (!ext || f.size > MAX_FILE || !f.size) { skipped.push(slot + (ext ? ' (over 10 MB)' : ' (' + (f.type || 'unknown type') + ' is not supported online)')); return; }
      var prev = uploaded.get(f), row = bySlot[slot];
      if (prev && prev.pid === pid && row && row.storage_path === prev.path) return;
      chain = chain.then(function () {
        var path = newPath(pid, slot, ext);
        return api('POST', '/storage/v1/object/' + BUCKET + '/' + path, { raw: f, headers: { 'Content-Type': f.type, 'x-upsert': 'false', 'cache-control': '3600' } }).then(function () {
          return rest('POST', 'project_assets', 'on_conflict=project_id,slot', { project_id: pid, slot: slot, storage_path: path, file_name: String(f.name || slot).slice(0, 120), mime_type: f.type, size_bytes: f.size }, 'resolution=merge-duplicates,' + WRITE);
        }).then(function () { uploaded.set(f, { pid: pid, path: path }); if (row && row.storage_path !== path) removeObjs.push(row.storage_path); });
      });
    });
    rows.forEach(function (r) { if (!S.files[r.slot]) { removeObjs.push(r.storage_path); chain = chain.then(function () { return rest('DELETE', 'project_assets', 'id=eq.' + enc(r.id)); }); } });
    return chain.then(function () { return storageDelete(removeObjs).catch(function () {}); });
  }).then(function () { skippedNote = skipped.length ? 'Not saved online: ' + skipped.join(', ') + '. They stay on this device.' : ''; });
}
function hydratePhotos(pid, onlyMissing) {
  return assetRows(pid).then(function (rows) {
    var chain = Promise.resolve();
    rows.forEach(function (r) {
      if (!/^(logo|hero|photo\d{1,2})$/.test(r.slot)) return;
      var have = ORIG[r.slot]; if (have && have.size === r.size_bytes && have.name === r.file_name && !uploaded.has(have)) uploaded.set(have, { pid: pid, path: r.storage_path });
      if (onlyMissing && (IMG[r.slot] || !S.files[r.slot])) return;
      chain = chain.then(function () {
        return api('GET', '/storage/v1/object/authenticated/' + BUCKET + '/' + r.storage_path, { blob: true }).then(function (blob) {
          var file = new File([blob], /^[A-Za-z0-9._ -]{1,100}$/.test(r.file_name) ? r.file_name : r.slot + '.jpg', { type: r.mime_type || blob.type });
          uploaded.set(file, { pid: pid, path: r.storage_path });
          delete IMG[r.slot]; loadPhoto(r.slot, file);
          return waitFor(function () { return IMG[r.slot]; }, 8000);
        }).catch(function () { /* one missing picture must not block the project */ });
      });
    });
    return chain;
  });
}

/* ---------- open / create / save ---------- */
function loadProject(id) {
  loading = true; setStatus('loading');
  return rest('GET', 'projects', 'id=eq.' + enc(id) + '&deleted_at=is.null&select=id,name,version,data').then(function (rows) {
    var row = rows && rows[0]; if (!row) throw fail(404, 'That project was not found. It may have been deleted.');
    applyCloudState(row.data);
    cur.id = row.id; cur.name = row.name; cur.version = row.version;
    try { knownId = normId(S.id); } catch (e) {}
    fill(); onChange();
    return hydratePhotos(row.id, false).then(function () {
      fill(); onChange(); cur.savedSnap = snapshot(); cur.savedAt = Date.now(); lastSeen = cur.savedSnap; saveMeta(); setStatus('saved');
    });
  }).catch(function (e) { setStatus(cur.id ? 'saved' : (session ? 'nopro' : 'signedout')); throw e; }).then(function (r) { loading = false; return r; }, function (e) { loading = false; throw e; });
}
function createProject(name) {
  loading = true; setStatus('saving'); var snap = snapshot();
  return rest('POST', 'projects', '', { name: name || projectName(), data: stateForCloud() }, WRITE).then(function (rows) {
    var row = rows[0]; cur.id = row.id; cur.name = row.name; cur.version = row.version;
    return syncAssets(row.id).then(function () { cur.savedSnap = snap; cur.savedAt = Date.now(); lastSeen = snap; saveMeta(); setStatus('saved'); return row; });
  }).catch(function (e) { setStatus(session ? 'nopro' : 'signedout', e); throw e; }).then(function (r) { loading = false; return r; }, function (e) { loading = false; throw e; });
}
function saveNow() {
  if (busy || !cur.id || loading) return Promise.resolve();
  busy = true; setStatus('saving'); var snap = snapshot(), id = cur.id;
  return syncAssets(id).then(function () {
    return rest('PATCH', 'projects', 'id=eq.' + enc(id) + '&version=eq.' + cur.version + '&deleted_at=is.null', { name: cur.name, data: stateForCloud() }, WRITE);
  }).then(function (rows) {
    if (!rows || !rows.length) return checkConflict(id);
    cur.version = rows[0].version; cur.savedSnap = snap; cur.savedAt = Date.now(); saveMeta();
    if (skippedNote) { toast(skippedNote); skippedNote = ''; }
    setStatus(snapshot() === snap ? 'saved' : 'dirty'); nextRetry = 0;
  }).catch(function (e) { nextRetry = Date.now() + 8000; setStatus(e.offline ? 'offline' : 'error', e); }).then(function () { busy = false; });
}
function checkConflict(id) {
  return rest('GET', 'projects', 'id=eq.' + enc(id) + '&select=id,version,deleted_at').then(function (rows) {
    var r = rows && rows[0];
    if (!r || r.deleted_at) { setStatus('error', { message: 'This project was deleted or you no longer have access to it.' }); nextRetry = Date.now() + 60000; return; }
    cur.theirVersion = r.version; setStatus('conflict'); openDialog();
  });
}
function keepMine() {
  return rest('GET', 'projects', 'id=eq.' + enc(cur.id) + '&select=version').then(function (rows) { if (rows && rows[0]) { cur.version = rows[0].version; } return saveNow(); });
}
function useTheirs() { return loadProject(cur.id); }
function saveAsCopy() {
  var nm = (cur.name || projectName()) + ' (my edits)';
  cur.id = null; clearMeta(); return createProject(nm);
}

/* The saving loop: a change is noticed, waits until typing has settled, then is saved. */
function tick() {
  if (!session || !cur.id || loading || busy) return;
  if (cur.status === 'conflict' || cur.status === 'loading') return;
  var s = snapshot();
  if (s === cur.savedSnap) { lastSeen = s; if (cur.status === 'dirty') setStatus('saved'); return; }
  if (s !== lastSeen) { lastSeen = s; stableSince = Date.now(); if (cur.status !== 'dirty') setStatus('dirty'); return; }
  if (Date.now() - stableSince >= DELAY && Date.now() >= nextRetry) saveNow();
}
setInterval(tick, 400);
window.addEventListener('beforeunload', function (e) {
  if (session && cur.id && (cur.status === 'dirty' || cur.status === 'saving' || cur.status === 'error' || cur.status === 'offline' || cur.status === 'conflict')) { e.preventDefault(); e.returnValue = ''; }
});

/* ---------- project list, rename, duplicate, delete, history ---------- */
function listProjects(search, trash) {
  var q = 'select=id,name,version,updated_at&order=updated_at.desc&limit=100&deleted_at=' + (trash ? 'not.is.null' : 'is.null');
  var term = String(search || '').replace(/[*,()%\\]/g, ' ').trim().slice(0, 60);
  if (term) q += '&name=ilike.' + enc('*' + term + '*');
  return rest('GET', 'projects', q);
}
function renameProject(id, name) {
  name = String(name || '').trim().slice(0, 120); if (!name) return Promise.reject(fail(0, 'The name cannot be empty.'));
  if (id === cur.id) { if (busy) return Promise.reject(fail(0, 'Saving right now. Try again in a moment.')); cur.name = name; return saveNow(); }
  return rest('PATCH', 'projects', 'id=eq.' + enc(id), { name: name }, WRITE);
}
function duplicateProject(id) {
  return rest('GET', 'projects', 'id=eq.' + enc(id) + '&deleted_at=is.null&select=name,data').then(function (rows) {
    var src = rows && rows[0]; if (!src) throw fail(404, 'That project was not found.');
    return rest('POST', 'projects', '', { name: ('Copy of ' + src.name).slice(0, 120), data: src.data }, WRITE).then(function (made) {
      var nid = made[0].id;
      return assetRows(id).then(function (assets) {
        var chain = Promise.resolve();
        assets.forEach(function (a) {
          var ext = String(a.storage_path).split('.').pop(), dst = newPath(nid, a.slot, ext);
          chain = chain.then(function () {
            return api('POST', '/storage/v1/object/copy', { json: { bucketId: BUCKET, sourceKey: a.storage_path, destinationKey: dst } }).then(function () {
              return rest('POST', 'project_assets', '', { project_id: nid, slot: a.slot, storage_path: dst, file_name: a.file_name, mime_type: a.mime_type, size_bytes: a.size_bytes }, WRITE);
            });
          });
        });
        return chain.then(function () { return made[0]; });
      });
    });
  });
}
function trashProject(id) { return rest('PATCH', 'projects', 'id=eq.' + enc(id), { deleted_at: new Date().toISOString() }, WRITE).then(function () { if (id === cur.id) detach(); }); }
function restoreProject(id) { return rest('PATCH', 'projects', 'id=eq.' + enc(id), { deleted_at: null }, WRITE); }
function deleteForever(id) {
  return assetRows(id).then(function (rows) { return storageDelete(rows.map(function (r) { return r.storage_path; })); })
    .then(function () { return rest('DELETE', 'projects', 'id=eq.' + enc(id)); }).then(function () { if (id === cur.id) detach(); });
}
function listRevisions() { return rest('GET', 'project_revisions', 'project_id=eq.' + enc(cur.id) + '&select=id,version,created_at,name&order=created_at.desc&limit=30'); }
function restoreRevision(rid) {
  return rest('GET', 'project_revisions', 'id=eq.' + enc(rid) + '&select=data').then(function (rows) {
    if (!rows || !rows[0]) throw fail(404, 'That earlier version was not found.');
    var keepIMG = IMG, keepORIG = ORIG; applyCloudState(rows[0].data); IMG = keepIMG; ORIG = keepORIG; /* the pictures stay as they are now */
    try { knownId = normId(S.id); } catch (e) {} fill(); onChange();
  });
}

/* ---------- the dashboard (a dialog) ---------- */
var dlg, body, chip, btn, ui = { mode: 'signin', list: [], search: '', trash: false, hist: [], histOpen: false, msg: '', ok: '', busy: false, recovery: false };
var TIMER = null;
function fmt(d) { try { return new Date(d).toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; } }
function paintChip() {
  if (!chip) return;
  chip.textContent = chipText(); chip.className = 'cloudchip ' + cur.status;
  btn.textContent = session ? 'My websites' : 'Sign in';
}
function msgHtml() { return (ui.msg ? '<p class="wbmsg err" role="alert">' + esc(ui.msg) + '</p>' : '') + (ui.ok ? '<p class="wbmsg ok" role="status">' + esc(ui.ok) + '</p>' : ''); }
function authForm(mode) {
  var t = mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Sign in';
  return '<h3>' + t + '</h3>' + msgHtml() +
    '<form id="wbAuth" data-mode="' + mode + '" novalidate><label for="wbEmail">Email</label><input id="wbEmail" type="email" autocomplete="email" required>' +
    (mode === 'forgot' ? '' : '<label for="wbPw">Password' + (mode === 'signup' ? ' (at least 8 characters)' : '') + '</label><input id="wbPw" type="password" autocomplete="' + (mode === 'signup' ? 'new-password' : 'current-password') + '" required minlength="8">') +
    '<button class="btn" type="submit"' + (ui.busy ? ' disabled' : '') + '>' + (mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Email me a reset link' : 'Sign in') + '</button></form>' +
    '<p class="wblinks">' + (mode !== 'signin' ? '<a href="#" data-mode="signin">Sign in</a> ' : '') + (mode !== 'signup' ? '<a href="#" data-mode="signup">Create account</a> ' : '') + (mode !== 'forgot' ? '<a href="#" data-mode="forgot">Forgot password?</a>' : '') + '</p>';
}
function projectsView() {
  var h = '<p class="wbwho">Signed in as <b>' + esc(session.user.email || '') + '</b> <button type="button" class="btn alt sm" data-act="signout">Sign out</button></p>' + msgHtml();
  if (cur.status === 'conflict') {
    h += '<div class="wbconflict" role="alert"><b>This website was changed somewhere else</b> (another tab or device saved version ' + esc(cur.theirVersion) + ' while you were editing version ' + esc(cur.version) + '). Nothing has been overwritten. Choose what to do:' +
      '<div class="wbrow"><button class="btn" data-act="theirs">Load the saved version</button><button class="btn alt" data-act="copy">Save my edits as a copy</button><button class="btn alt" data-act="mine">Keep my edits and overwrite</button></div></div>';
  }
  if (cur.id) h += '<p class="wbcur">Open: <b>' + esc(cur.name) + '</b> <span class="wbst ' + cur.status + '">' + esc(chipText()) + '</span>' + (cur.detail ? ' <span class="err">' + esc(cur.detail) + '</span>' : '') + '</p>';
  else h += '<p class="wbcur">This website is not saved online yet. <button type="button" class="btn sm" data-act="savenew">Save it to my account</button></p>';
  h += '<div class="wbrow"><button type="button" class="btn alt sm" data-act="newsite">New website</button>' + (cur.id ? '<button type="button" class="btn alt sm" data-act="history">' + (ui.histOpen ? 'Hide history' : 'Version history') + '</button>' : '') + '</div>';
  if (ui.histOpen && cur.id) {
    h += '<div class="wbhist"><b>Earlier versions</b>' + (ui.hist.length ? '<ul>' + ui.hist.map(function (r) { return '<li><span>' + esc(fmt(r.created_at)) + ' (v' + esc(r.version) + ')</span><button class="btn alt sm" data-act="revert" data-id="' + esc(r.id) + '">Restore</button></li>'; }).join('') + '</ul>' : '<p>No earlier versions yet. They are kept automatically as you edit.</p>') + '<p class="wbnote">Restoring brings back the text and design. Photos you removed since then are not restored.</p></div>';
  }
  h += '<div class="wbsearch"><label for="wbSearch">Search my websites</label><input id="wbSearch" type="search" value="' + esc(ui.search) + '"> <label class="wbchk"><input type="checkbox" id="wbTrash"' + (ui.trash ? ' checked' : '') + '> Show deleted</label></div>';
  h += ui.list.length ? '<ul class="wblist">' + ui.list.map(function (p) {
    return '<li><div><b>' + esc(p.name) + '</b><span>Changed ' + esc(fmt(p.updated_at)) + '</span></div><div class="wbrow">' +
      (ui.trash ? '<button class="btn alt sm" data-act="undelete" data-id="' + esc(p.id) + '">Restore</button><button class="btn alt sm" data-act="purge" data-id="' + esc(p.id) + '">Delete forever</button>'
        : '<button class="btn sm" data-act="open" data-id="' + esc(p.id) + '">' + (p.id === cur.id ? 'Open (current)' : 'Open') + '</button><button class="btn alt sm" data-act="rename" data-id="' + esc(p.id) + '" data-name="' + esc(p.name) + '">Rename</button><button class="btn alt sm" data-act="dup" data-id="' + esc(p.id) + '">Duplicate</button><button class="btn alt sm" data-act="trash" data-id="' + esc(p.id) + '" data-name="' + esc(p.name) + '">Delete</button>') + '</div></li>';
  }).join('') + '</ul>' : '<p class="wbempty">' + (ui.search ? 'No websites match your search.' : ui.trash ? 'Nothing deleted.' : 'You have no saved websites yet.') + '</p>';
  return '<h3>My websites</h3>' + h;
}
function paint() {
  if (!body) return;
  var h;
  if (problem) h = '<h3>Accounts are switched off</h3><p class="wbmsg err" role="alert">' + esc(problem) + '</p>';
  else if (ui.recovery && session) h = '<h3>Choose a new password</h3>' + msgHtml() + '<form id="wbNewPw" novalidate><label for="wbPw1">New password (at least 8 characters)</label><input id="wbPw1" type="password" autocomplete="new-password" required minlength="8"><button class="btn" type="submit">Save new password</button></form>';
  else if (!session) h = authForm(ui.mode);
  else h = projectsView();
  var keep = document.activeElement && document.activeElement.id, val = keep === 'wbSearch' ? document.activeElement.value : null;
  body.innerHTML = h;
  if (keep === 'wbSearch') { var s = document.getElementById('wbSearch'); if (s) { s.focus(); try { s.setSelectionRange(val.length, val.length); } catch (e) {} } }
}
function refreshList() { return listProjects(ui.search, ui.trash).then(function (rows) { ui.list = rows || []; paint(); }).catch(function (e) { ui.msg = nice(e); paint(); }); }
function openDialog() { if (!dlg) return; ui.msg = ''; ui.ok = ''; if (!dlg.open) dlg.showModal(); paint(); if (session && !problem) refreshList(); }
function guard(fn) {
  ui.msg = ''; ui.ok = ''; ui.busy = true;
  return Promise.resolve().then(fn).catch(function (e) { ui.msg = nice(e); }).then(function () { ui.busy = false; paint(); });
}
function confirmLeave(what) {
  if (cur.id && (cur.status === 'dirty' || cur.status === 'error' || cur.status === 'offline')) return confirm('You have changes that are not saved online yet. ' + what + ' anyway?');
  if (!cur.id && !isBlank()) return confirm('The website you are working on is not saved to your account. ' + what + ' anyway?');
  return true;
}
function onClick(e) {
  var a = e.target.closest('[data-mode],[data-act]'); if (!a) return;
  if (a.dataset.mode) { e.preventDefault(); ui.mode = a.dataset.mode; ui.msg = ''; ui.ok = ''; paint(); return; }
  var act = a.dataset.act, id = a.dataset.id;
  if (act === 'signout') return doSignOut();
  if (act === 'savenew') return guard(function () { return createProject().then(function () { ui.ok = 'Saved to your account. Changes now save automatically.'; return refreshList(); }); });
  if (act === 'newsite') { if (!confirmLeave('Start a new website')) return; return guard(function () { return (cur.status === 'dirty' ? saveNow() : Promise.resolve()).then(function () { detach(); resetApp(); return refreshList(); }); }); }
  if (act === 'open') { if (id === cur.id && cur.status !== 'conflict') { dlg.close(); return; } if (!confirmLeave('Open another website')) return; return guard(function () { return loadProject(id).then(function () { dlg.close(); toast('Opened ' + cur.name); }); }); }
  if (act === 'rename') { var nn = prompt('New name for this website:', a.dataset.name || ''); if (nn === null) return; return guard(function () { return renameProject(id, nn).then(function () { ui.ok = 'Renamed.'; return refreshList(); }); }); }
  if (act === 'dup') return guard(function () { return duplicateProject(id).then(function (r) { ui.ok = 'Created "' + r.name + '".'; return refreshList(); }); });
  if (act === 'trash') { if (!confirm('Delete "' + (a.dataset.name || 'this website') + '"? You can restore it from "Show deleted".')) return; return guard(function () { return trashProject(id).then(refreshList); }); }
  if (act === 'undelete') return guard(function () { return restoreProject(id).then(refreshList); });
  if (act === 'purge') { if (!confirm('Delete this website and its photos forever? This cannot be undone.')) return; return guard(function () { return deleteForever(id).then(refreshList); }); }
  if (act === 'history') { ui.histOpen = !ui.histOpen; if (ui.histOpen) return guard(function () { return listRevisions().then(function (r) { ui.hist = r || []; }); }); paint(); return; }
  if (act === 'revert') { if (!confirm('Go back to this earlier version? Your current version stays in the history.')) return; return guard(function () { return restoreRevision(id).then(function () { ui.ok = 'Restored. It will save as a new version.'; }); }); }
  if (act === 'theirs') return guard(function () { return useTheirs().then(function () { ui.ok = 'Loaded the saved version.'; return refreshList(); }); });
  if (act === 'mine') return guard(function () { return keepMine().then(function () { ui.ok = 'Your edits were saved.'; }); });
  if (act === 'copy') return guard(function () { return saveAsCopy().then(function () { ui.ok = 'Saved as a new website.'; return refreshList(); }); });
}
function onSubmit(e) {
  var f = e.target; e.preventDefault();
  if (f.id === 'wbAuth') {
    var mode = f.dataset.mode, email = (document.getElementById('wbEmail').value || '').trim(), pwEl = document.getElementById('wbPw'), pw = pwEl ? pwEl.value : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { ui.msg = 'Enter a valid email address.'; paint(); return; }
    if (mode !== 'forgot' && (mode === 'signup' ? pw.length < 8 : !pw)) { ui.msg = mode === 'signup' ? 'Use at least 8 characters for the password.' : 'Enter your password.'; paint(); return; }
    return guard(function () {
      if (mode === 'forgot') return resetPassword(email).then(function () { ui.ok = 'If that email has an account, a reset link is on its way. Check your inbox.'; });
      var p = mode === 'signup' ? signUp(email, pw) : signIn(email, pw).then(function () { return { signedIn: true }; });
      return p.then(function (r) { if (r.signedIn) return afterSignIn(); ui.ok = 'Almost done! We sent a confirmation link to ' + email + '. Open it, then come back and sign in.'; ui.mode = 'signin'; });
    });
  }
  if (f.id === 'wbNewPw') {
    var np = document.getElementById('wbPw1').value; if (np.length < 8) { ui.msg = 'Use at least 8 characters.'; paint(); return; }
    return guard(function () { return updatePassword(np).then(function () { ui.recovery = false; ui.ok = 'Your password was changed.'; return afterSignIn(); }); });
  }
}
function afterSignIn() { setStatus('nopro'); paintChip(); return resume().then(function () { paint(); if (session && !problem) return refreshList(); }); }
function doSignOut() {
  if (!confirmLeave('Sign out')) return;
  var go = (cur.id && cur.status === 'dirty') ? saveNow() : Promise.resolve();
  go.then(function () { return send('POST', '/auth/v1/logout', {}).catch(function () {}); }).then(function () {
    clearSession(); detach(); resetApp(); ui.list = []; ui.mode = 'signin'; ui.ok = 'You are signed out. This browser\u2019s copy of the website was cleared.'; setStatus('signedout'); paint();
  });
}
function sessionLost() { detach(); setStatus('signedout'); ui.msg = 'Your session ended. Please sign in again.'; if (dlg && dlg.open) paint(); }

/* ---------- resume after a page refresh ---------- */
function resume() {
  if (!session) { setStatus('signedout'); return Promise.resolve(); }
  var meta = readMeta();
  if (!meta || meta.uid !== session.user.id || !meta.id) { setStatus('nopro'); return Promise.resolve(); }
  return rest('GET', 'projects', 'id=eq.' + enc(meta.id) + '&deleted_at=is.null&select=id,name,version').then(function (rows) {
    var row = rows && rows[0]; if (!row) { clearMeta(); setStatus('nopro'); return; }
    if (isBlank()) return loadProject(row.id);
    cur.id = row.id; cur.name = row.name;
    if (row.version === meta.version) {
      cur.version = row.version; cur.savedSnap = meta.savedSnap || ''; lastSeen = ''; setStatus('saved');
      var textPart = function () { return String(cur.savedSnap).split('#')[0]; }, untouched = stateSnapshot() === textPart();
      loading = true;
      return hydratePhotos(row.id, true).then(function () {
        loading = false; fill(); onChange();
        if (untouched && stateSnapshot() === textPart()) { cur.savedSnap = snapshot(); saveMeta(); } /* only pictures were fetched back: that is not an edit */
      });
    }
    if (snapshot() === meta.savedSnap) return loadProject(row.id); /* nothing of mine to lose: take the newer saved version */
    cur.version = meta.version; cur.theirVersion = row.version; setStatus('conflict'); openDialog();
  }).catch(function (e) { loading = false; setStatus(cur.id ? 'offline' : 'nopro', e); });
}

/* ---------- wire it into the page ---------- */
function build() {
  var anchor = document.getElementById('bSite') || document.getElementById('bNew'); if (!anchor) return;
  btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn alt'; btn.id = 'bAccount'; btn.textContent = 'Sign in';
  chip = document.createElement('span'); chip.id = 'cloudChip'; chip.className = 'cloudchip'; chip.setAttribute('role', 'status'); chip.setAttribute('aria-live', 'polite');
  anchor.parentNode.appendChild(btn); anchor.parentNode.appendChild(chip);
  dlg = document.createElement('dialog'); dlg.id = 'wbDlg'; dlg.setAttribute('aria-labelledby', 'wbDlgTitle');
  dlg.innerHTML = '<div class="wbhead"><h2 id="wbDlgTitle">Your account</h2><button type="button" class="btn alt sm" id="wbClose" aria-label="Close">Close</button></div><div id="wbBody"></div>';
  document.body.appendChild(dlg); body = dlg.querySelector('#wbBody');
  dlg.querySelector('#wbClose').onclick = function () { dlg.close(); };
  body.addEventListener('click', onClick); body.addEventListener('submit', onSubmit);
  body.addEventListener('input', function (e) {
    if (e.target.id === 'wbSearch') { ui.search = e.target.value; clearTimeout(TIMER); TIMER = setTimeout(refreshList, 250); }
  });
  body.addEventListener('change', function (e) { if (e.target.id === 'wbTrash') { ui.trash = e.target.checked; refreshList(); } });
  btn.onclick = chip.onclick = openDialog;
  /* "New client" while a website is open must not leave the old website attached (it would be overwritten with a blank form). */
  var nb = document.getElementById('bNew');
  if (nb) nb.addEventListener('click', function (e) {
    if (!session || !cur.id) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if (!confirmLeave('Start a new client')) return;
    (cur.status === 'dirty' ? saveNow() : Promise.resolve()).then(function () { detach(); resetApp(); });
  }, true);
  paintChip();
}
function start() {
  if (!enabled) return; /* accounts are not set up: show no sign-in button */
  build();
  loadSession();
  var h = readHash();
  var pre = Promise.resolve();
  if (h && h.error) { ui.msg = (h.error_description || h.error); }
  if (h && h.access_token && h.refresh_token) {
    pre = send('GET', '/auth/v1/user', { headers: { Authorization: 'Bearer ' + h.access_token } }).then(function (u) {
      storeSession({ access_token: h.access_token, refresh_token: h.refresh_token, expires_in: h.expires_in, user: u }); ui.recovery = h.type === 'recovery';
    }).catch(function (e) { ui.msg = nice(e); });
  }
  pre.then(resume).then(function () { paintChip(); if (ui.recovery || ui.msg) openDialog(); });
}
/* wait until script.js has restored the local draft, so we compare against the real current state */
(function wait(n) { if (typeof draftReady !== 'undefined' && draftReady || n > 100) start(); else setTimeout(function () { wait(n + 1); }, 50); })(0);

window.Cloud = { enabled: enabled, status: function () { return cur.status; }, project: function () { return { id: cur.id, version: cur.version, name: cur.name }; } };
})();