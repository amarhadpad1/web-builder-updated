/* sitegen.js - builds a real multi-page website from the planner's answers.
   Loads AFTER script.js and safety.js. It only adds things: your existing preview ("Layout view")
   is untouched. New: a "Full site" preview with clickable page tabs, and a Download button that
   produces a zip of real pages (index.html, about.html, ... + style.css + script.js + images/).
   The core (buildSite, makeZip) is plain functions so it can be tested outside the browser. */
(function (root) {
'use strict';

var ORDER = ['Home', 'About', 'Services', 'Gallery', 'Pricing', 'Blog', 'FAQ', 'Contact'];
var SINGLE = ['Bebas Neue', 'Abril Fatface', 'Archivo Black', 'DM Serif Display'];

/* ---------- small helpers ---------- */
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function isHex(v) { return /^#[0-9a-f]{6}$/i.test(v || ''); }
function lum(h) { var c = [1, 3, 5].map(function (i) { var v = parseInt(h.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function onC(h) { return lum(h) > 0.45 ? '#111111' : '#ffffff'; }
function slugify(n) { return String(n).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function fontName(f) { return String(f || '').replace(/[^A-Za-z0-9 ]/g, '').trim(); }
function telHref(v) { var p = String(v || '').trim(), d = p.replace(/\D/g, ''); return d.length >= 5 ? 'tel:' + (p.charAt(0) === '+' ? '+' : '') + d : ''; }
function waHref(v) { var d = String(v || '').replace(/\D/g, ''); return d.length >= 8 ? 'https://wa.me/' + d : ''; }
function mailOk(v) { return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(String(v || '').trim()); }
function firstSentence(t, max) { var s = String(t || '').replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s/)[0] || ''; return s.length > max ? s.slice(0, max - 1).trim() + '\u2026' : s; }

/* ---------- which pages exist ---------- */
function pageList(st) {
  var chosen = (st.pages || []).map(String), out = [{ name: 'Home', file: 'index.html' }];
  var used = { 'index.html': 1, '404.html': 1 };
  ORDER.slice(1).forEach(function (n) { if (chosen.indexOf(n) > -1) { var f = slugify(n) + '.html'; used[f] = 1; out.push({ name: n, file: f }); } });
  chosen.forEach(function (n) {
    if (ORDER.indexOf(n) > -1 || !n.trim()) return;
    var s = slugify(n) || 'page', f = s + '.html', i = 2;
    while (used[f]) { f = s + '-' + i + '.html'; i++; }
    used[f] = 1; out.push({ name: n.trim(), file: f });
  });
  return out;
}

/* ---------- the shared design (style.css) ---------- */
function makeCss(c) {
  return [
    ':root{--main:' + c.main + ';--on-main:' + onC(c.main) + ';--accent:' + c.acc + ';--on-accent:' + onC(c.acc) + ';--bg:' + c.bg + ';--muted:' + c.muted + ';--text:' + c.txt + ';--radius:' + c.rad + ';--space:' + c.sp + ';--head:\'' + c.fh + '\',serif;--body:\'' + c.fb + '\',sans-serif}',
    '*{box-sizing:border-box}html{scroll-behavior:smooth}',
    'body{margin:0;background:var(--bg);color:var(--text);font-family:var(--body);line-height:1.6;font-size:17px}',
    'img{max-width:100%;display:block}a{color:inherit}',
    'h1,h2,h3{font-family:var(--head);line-height:1.2;margin:0 0 .5em}',
    '.wrap{max-width:1080px;margin:0 auto;padding:0 20px}',
    '.site-header{background:var(--main);color:var(--on-main);position:sticky;top:0;z-index:10}',
    '.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:64px}',
    '.brand{display:flex;align-items:center;gap:10px;font-family:var(--head);font-weight:700;font-size:20px;text-decoration:none}',
    '.brand img{height:36px;width:auto;max-width:90px;object-fit:contain}',
    '.site-nav{display:flex;gap:6px;flex-wrap:wrap}',
    '.site-nav a{text-decoration:none;padding:8px 12px;border-radius:var(--radius);opacity:.9}',
    '.site-nav a:hover{opacity:1;background:rgba(127,127,127,.22)}',
    '.site-nav a[aria-current="page"]{opacity:1;box-shadow:inset 0 -3px 0 var(--accent);border-radius:0}',
    '.menu-btn{display:none;background:none;border:1px solid currentColor;color:inherit;border-radius:var(--radius);font-size:22px;line-height:1;padding:6px 12px;cursor:pointer}',
    '.hero{background:var(--main) center/cover no-repeat;color:var(--on-main);padding:calc(90px*var(--space)) 0}',
    '.hero.photo{color:#fff}.hero h1{font-size:clamp(2.2rem,6vw,3.6rem)}.hero p{font-size:1.2rem;max-width:620px;margin:0 0 1.4em}',
    '.btn{display:inline-block;background:var(--accent);color:var(--on-accent);padding:13px 26px;border-radius:var(--radius);font-weight:700;text-decoration:none;border:0;font:inherit;font-weight:700;cursor:pointer}',
    '.btn:hover{filter:brightness(.92)}',
    'section.block{padding:calc(56px*var(--space)) 0}section.tint{background:rgba(127,127,127,.08)}',
    '.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}',
    '.card{border:1px solid rgba(127,127,127,.25);border-top:4px solid var(--accent);border-radius:var(--radius);padding:24px;background:var(--muted)}',
    '.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}',
    '.gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius)}',
    '.crumbs{font-size:.9rem;opacity:.75;margin-bottom:10px}',
    '.page-title{padding:calc(48px*var(--space)) 0 0}',
    '.two{display:grid;grid-template-columns:1fr 1fr;gap:32px}',
    '.contact-list{list-style:none;padding:0;margin:0}.contact-list li{margin:0 0 10px}',
    'form label{display:block;font-weight:700;margin:14px 0 4px}',
    'form input,form textarea{width:100%;padding:11px 12px;font:inherit;border:1px solid rgba(127,127,127,.5);border-radius:var(--radius);background:#fff;color:#111}',
    'form textarea{min-height:130px}form .btn{margin-top:16px}',
    '.site-footer{background:var(--main);color:var(--on-main);padding:40px 0 20px;margin-top:40px}',
    '.foot{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px}',
    '.site-footer nav{display:flex;flex-direction:column;gap:6px}.site-footer a{opacity:.9}.site-footer p{margin:.3em 0}',
    '.copy{text-align:center;opacity:.8;font-size:.9rem;border-top:1px solid rgba(127,127,127,.4);margin-top:24px;padding-top:16px}',
    '@media(max-width:760px){.menu-btn{display:block}.site-nav{display:none;flex-direction:column;width:100%;padding-bottom:12px}.site-nav.open{display:flex}.bar{flex-wrap:wrap}.two{grid-template-columns:1fr}}'
  ].join('\n') + '\n';
}

/* ---------- the shared behaviour (script.js): menu button + email form ---------- */
function makeJs() {
  return [
    '(function(){',
    ' var b=document.querySelector(".menu-btn"),n=document.getElementById("site-nav");',
    ' if(b&&n){b.addEventListener("click",function(){var o=n.classList.toggle("open");b.setAttribute("aria-expanded",o?"true":"false");});}',
    ' var f=document.getElementById("contact-form");',
    ' if(f){f.addEventListener("submit",function(e){e.preventDefault();var d=new FormData(f),nl=String.fromCharCode(10);',
    '  var body="Name: "+d.get("name")+nl+"Phone: "+d.get("phone")+nl+nl+d.get("message");',
    '  location.href="mailto:"+f.getAttribute("data-to")+"?subject="+encodeURIComponent("Website enquiry from "+d.get("name"))+"&body="+encodeURIComponent(body);});}',
    '})();'
  ].join('\n') + '\n';
}

/* ---------- build the whole site ---------- */
/* st = the planner's state (S). have = { slot: true } for images whose bytes are available. */
function buildSite(st, have, year) {
  have = have || {};
  var rad = { Luxury: '0px', Classic: '2px', Friendly: '22px', Modern: '8px' }[st.feel] || '8px';
  var bg = isHex(st.bg) ? st.bg : '#ffffff';
  var c = {
    rad: rad, sp: { Luxury: 1.5, Classic: 1.25, Friendly: 1.1, Modern: 1 }[st.feel] || 1,
    muted: isHex(st.muted) ? st.muted : bg, bg: bg, main: isHex(st.main) ? st.main : '#1f3a5f', acc: isHex(st.accent) ? st.accent : '#e8a33d',
    fh: fontName(st.fontH) || 'Poppins', fb: (st.fontB && st.fontB !== 'Not sure' && fontName(st.fontB)) || 'Inter'
  };
  c.txt = isHex(st.text) ? st.text : (lum(bg) > 0.45 ? '#1a1a1a' : '#f5f5f5');
  var name = String(st.bizName || '').trim() || 'Your Business';
  var desc = String(st.desc || '').replace(/\s+/g, ' ').trim();
  var pages = pageList(st);
  var fileOf = {}; pages.forEach(function (p) { fileOf[p.name] = p.file; });
  var phone = String(st.phone || '').trim(), email = String(st.email || '').trim(), address = String(st.address || '').trim();
  var tel = telHref(phone), wa = (st.whatsapp || (st.features || []).indexOf('WhatsApp button') > -1) ? waHref(st.whatsapp) : '';
  var hasMail = mailOk(email);
  var yr = year || new Date().getFullYear();

  /* images: only the ones whose bytes we really have, so no broken pictures */
  var images = [];
  Object.keys(st.files || {}).forEach(function (slot) { if (have[slot] && /^[a-z0-9]+\.[a-z0-9]{2,5}$/i.test(st.files[slot])) images.push({ slot: slot, name: st.files[slot] }); });
  /* logo, hero, then photo1, photo2, ... (not the order they happened to be uploaded in) */
  function rank(s) { var m = /^photo(\d+)$/.exec(s); return s === 'logo' ? 0 : s === 'hero' ? 1 : m ? 1 + parseInt(m[1], 10) : 100000; }
  images.sort(function (a, b) { return rank(a.slot) - rank(b.slot); });
  function img(slot) { for (var i = 0; i < images.length; i++) if (images[i].slot === slot) return 'images/' + images[i].name; return ''; }
  var gallery = images.filter(function (i) { return /^photo\d+$/.test(i.slot); }).map(function (i) { return 'images/' + i.name; });
  var logo = img('logo'), hero = img('hero');

  /* shared header + footer: the same on every page */
  function header(active) {
    var links = pages.map(function (p) { return '<a href="' + p.file + '"' + (p.file === active ? ' aria-current="page"' : '') + '>' + esc(p.name) + '</a>'; }).join('');
    return '<header class="site-header"><div class="wrap bar"><a class="brand" href="index.html">' + (logo ? '<img src="' + logo + '" alt="' + esc(name) + ' logo">' : '') + esc(name) + '</a>' +
      '<button class="menu-btn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="site-nav">&#9776;</button>' +
      '<nav id="site-nav" class="site-nav" aria-label="Main">' + links + '</nav></div></header>';
  }
  function footer() {
    var links = pages.map(function (p) { return '<a href="' + p.file + '">' + esc(p.name) + '</a>'; }).join('');
    var info = [];
    if (phone) info.push(tel ? '<p><a href="' + tel + '">' + esc(phone) + '</a></p>' : '<p>' + esc(phone) + '</p>');
    if (hasMail) info.push('<p><a href="mailto:' + esc(email) + '">' + esc(email) + '</a></p>');
    if (address) info.push('<p>' + esc(address) + '</p>');
    return '<footer class="site-footer"><div class="wrap"><div class="foot"><div><strong>' + esc(name) + '</strong>' + (desc ? '<p>' + esc(firstSentence(desc, 110)) + '</p>' : '') + '</div>' +
      '<nav aria-label="Footer">' + links + '</nav><div>' + info.join('') + '</div></div><p class="copy">&copy; ' + yr + ' ' + esc(name) + '</p></div></footer>';
  }
  function fontsLink() {
    var fam = [c.fh, c.fb].filter(function (f, i, a) { return a.indexOf(f) === i; }).map(function (f) { return 'family=' + f.replace(/ /g, '+') + (SINGLE.indexOf(f) > -1 ? '' : ':wght@400;700'); }).join('&');
    return '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?' + fam + '&display=swap">';
  }
  function shell(active, title, body) {
    var d = firstSentence(desc, 155) || (name + ' website');
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + esc(title) + '</title>\n<meta name="description" content="' + esc(d) + '">\n' + fontsLink() + '\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n' +
      header(active) + '\n<main id="main">\n' + body + '\n</main>\n' + footer() + '\n<script src="script.js"></script>\n</body>\n</html>\n';
  }
  function titleBlock(p) { return '<div class="wrap page-title"><p class="crumbs"><a href="index.html">Home</a> / ' + esc(p.name) + '</p><h1>' + esc(p.name) + '</h1></div>'; }
  function sect(inner, tint) { return '<section class="block' + (tint ? ' tint' : '') + '"><div class="wrap">' + inner + '</div></section>'; }
  function cards() {
    /* placeholder text on purpose: the planner has no services field yet, and we never invent facts about the business */
    return '<div class="cards"><!-- Replace these three cards with the real services -->' + ['one', 'two', 'three'].map(function (n) { return '<div class="card"><h3>Service ' + n + '</h3><p>Add a short description of this service.</p></div>'; }).join('') + '</div>';
  }
  function ctaLink() {
    var label = { 'Phone calls': 'Call now', 'Bookings': 'Book now' }[st.goal] || (st.goal === 'Selling' ? 'Enquire now' : 'Get in touch');
    var href = (st.goal === 'Phone calls' && tel) ? tel : (fileOf.Contact || tel || (hasMail ? 'mailto:' + email : ''));
    return href ? '<a class="btn" href="' + esc(href) + '">' + label + '</a>' : '';
  }
  function galleryHtml(list) { return '<div class="gallery">' + list.map(function (s, i) { return '<img src="' + s + '" alt="' + esc(name) + ' photo ' + (i + 1) + '" loading="lazy">'; }).join('') + '</div>'; }
  function moreLink(pn, text) { return fileOf[pn] ? '<p style="margin-top:20px"><a class="btn" href="' + fileOf[pn] + '">' + text + '</a></p>' : ''; }

  var bodies = {};
  bodies.Home = function () {
    var h = '<section class="hero' + (hero ? ' photo' : '') + '"' + (hero ? ' style="background-image:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),url(' + hero + ')"' : '') + '><div class="wrap"><h1>' + esc(name) + '</h1><p>' + esc(firstSentence(desc, 140) || 'Welcome.') + '</p>' + ctaLink() + '</div></section>';
    h += sect('<h2>' + (fileOf.Services ? 'Our services' : 'What we do') + '</h2>' + cards() + moreLink('Services', 'See all services'));
    if (fileOf.About && desc) h += sect('<h2>About us</h2><p>' + esc(firstSentence(desc, 220)) + '</p>' + moreLink('About', 'Read more'), true);
    if (gallery.length) h += sect('<h2>Gallery</h2>' + galleryHtml(gallery.slice(0, 3)) + moreLink('Gallery', 'See all photos'));
    return h;
  };
  bodies.About = function (p) { return titleBlock(p) + sect('<p>' + (desc ? esc(desc) : 'Tell your visitors who you are and what you do.') + '</p>' + (st.type ? '<p><strong>Business type:</strong> ' + esc(st.type) + '</p>' : '') + moreLink('Contact', 'Contact us')); };
  bodies.Services = function (p) { return titleBlock(p) + sect(cards() + moreLink('Contact', 'Ask about a service')); };
  bodies.Gallery = function (p) { return titleBlock(p) + sect(gallery.length ? galleryHtml(gallery) : '<p>Photos will appear here once they are added.</p>'); };
  bodies.Pricing = function (p) { return titleBlock(p) + sect('<p>Prices depend on what you need. Get in touch and we will give you a clear quote.</p>' + moreLink('Contact', 'Ask for a quote')); };
  bodies.Blog = function (p) { return titleBlock(p) + sect('<p>No articles have been published yet.</p>'); };
  bodies.FAQ = function (p) { return titleBlock(p) + sect('<p>Common questions and answers will appear here.</p>' + moreLink('Contact', 'Ask us a question')); };
  bodies.Contact = function (p) {
    var li = [];
    if (phone) li.push('<li><strong>Phone:</strong> ' + (tel ? '<a href="' + tel + '">' + esc(phone) + '</a>' : esc(phone)) + '</li>');
    if (hasMail) li.push('<li><strong>Email:</strong> <a href="mailto:' + esc(email) + '">' + esc(email) + '</a></li>');
    if (address) li.push('<li><strong>Address:</strong> ' + esc(address) + '</li>');
    if (wa) li.push('<li><a class="btn" href="' + wa + '">WhatsApp us</a></li>');
    var left = li.length ? '<ul class="contact-list">' + li.join('') + '</ul>' : '<p>Contact details will be added here.</p>';
    /* A form is only shown when it can really deliver: it opens the visitor's email app addressed to the business. */
    var form = hasMail ? '<form id="contact-form" data-to="' + esc(email) + '"><label for="f-name">Name</label><input id="f-name" name="name" required><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel"><label for="f-msg">Message</label><textarea id="f-msg" name="message" required></textarea><button class="btn" type="submit">Send by email</button></form>' : '';
    return titleBlock(p) + sect('<div class="' + (form ? 'two' : '') + '"><div>' + left + '</div>' + (form ? '<div>' + form + '</div>' : '') + '</div>');
  };
  var generic = function (p) { return titleBlock(p) + sect('<p>This page is ready for its content.</p>'); };

  var files = {};
  pages.forEach(function (p) {
    var b = (bodies[p.name] || generic)(p);
    files[p.file] = shell(p.file, p.name === 'Home' ? name : p.name + ' | ' + name, b);
  });
  files['404.html'] = shell('', 'Page not found | ' + name, '<div class="wrap page-title"><h1>Page not found</h1><p>The page you asked for does not exist. <a href="index.html">Go to the home page</a>.</p></div>');
  files['style.css'] = makeCss(c);
  files['script.js'] = makeJs();
  return { files: files, pages: pages, images: images };
}

/* ---------- minimal zip writer (no library needed) ---------- */
var CRC = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u8) { var c = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function u16(n) { return [n & 255, (n >>> 8) & 255]; }
function u32(n) { return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }
function makeZip(entries) {
  var enc = new TextEncoder(), parts = [], central = [], offset = 0, now = new Date();
  var dt = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1), dd = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  entries.forEach(function (e) {
    var nm = enc.encode(e.name), crc = crc32(e.data), sz = e.data.length;
    var lh = new Uint8Array([0x50, 0x4b, 3, 4].concat(u16(20), u16(0x0800), u16(0), u16(dt), u16(dd), u32(crc), u32(sz), u32(sz), u16(nm.length), u16(0)));
    parts.push(lh, nm, e.data);
    central.push(new Uint8Array([0x50, 0x4b, 1, 2].concat(u16(20), u16(20), u16(0x0800), u16(0), u16(dt), u16(dd), u32(crc), u32(sz), u32(sz), u16(nm.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset))), nm);
    offset += lh.length + nm.length + sz;
  });
  var cdSize = 0; central.forEach(function (p) { cdSize += p.length; });
  var end = new Uint8Array([0x50, 0x4b, 5, 6].concat(u16(0), u16(0), u16(entries.length), u16(entries.length), u32(cdSize), u32(offset), u16(0)));
  var all = parts.concat(central, [end]), total = 0; all.forEach(function (p) { total += p.length; });
  var out = new Uint8Array(total), pos = 0; all.forEach(function (p) { out.set(p, pos); pos += p.length; });
  return out;
}

var api = { buildSite: buildSite, makeZip: makeZip, pageList: pageList };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.SiteGen = api;

/* ---------- browser part: preview tabs, Full site preview, download ---------- */
if (typeof document === 'undefined' || typeof S === 'undefined') return;

var MODE = 'layout', PAGE = 'index.html', lastDoc = '', frame = null;
function haveBytes() { var h = {}; Object.keys(ORIG).forEach(function (k) { h[k] = true; }); return h; }
function haveShown() { var h = {}; Object.keys(IMG).forEach(function (k) { h[k] = true; }); return h; }

function pageDoc(site, file) {
  var html = site.files[file] || site.files['index.html'];
  html = html.replace('<link rel="stylesheet" href="style.css">', function () { return '<style>' + site.files['style.css'] + '</style>'; })
             .replace('<script src="script.js"></script>', function () { return '<script>' + site.files['script.js'] + '<\/script>'; });
  site.images.forEach(function (i) { if (IMG[i.slot]) html = html.split('images/' + i.name).join(IMG[i.slot]); });
  /* links between pages stay inside the preview: tell the planner which page was clicked */
  var nav = '<script>document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a");if(!a)return;var h=a.getAttribute("href")||"";if(/^[a-z0-9-]+\\.html$/i.test(h)){e.preventDefault();parent.postMessage({siteGoto:h},"*");}});<\/script>';
  return html.replace('</body>', function () { return nav + '</body>'; });
}
function buildNow() { return buildSite(S, haveShown()); }

var _layoutRender = render;
render = function () {
  if (MODE === 'site') drawSite(); else { frame = null; lastDoc = ''; _layoutRender(); }
  drawTabs();
};
function drawSite() {
  var site = buildNow();
  if (!site.files[PAGE]) PAGE = 'index.html';
  var doc = pageDoc(site, PAGE), pv = $('#pv');
  if (!frame || !pv.contains(frame)) {
    pv.innerHTML = ''; frame = document.createElement('iframe');
    frame.title = 'Full site preview'; frame.setAttribute('sandbox', 'allow-scripts');
    frame.style.cssText = 'border:0;width:100%;height:100%;min-height:420px;display:block;background:#fff';
    pv.appendChild(frame); lastDoc = '';
  }
  if (doc !== lastDoc) { frame.srcdoc = doc; lastDoc = doc; }
}
function drawTabs() {
  var box = $('#pvTabs'); if (!box) return;
  var h = '<button type="button" data-mode="layout" class="' + (MODE === 'layout' ? 'on' : '') + '">Layout view</button><button type="button" data-mode="site" class="' + (MODE === 'site' ? 'on' : '') + '">Full site</button>';
  if (MODE === 'site') {
    h += '<span class="sep"></span>' + pageList(S).map(function (p) { return '<button type="button" data-page="' + p.file + '" class="' + (p.file === PAGE ? 'on' : '') + '">' + esc(p.name) + '</button>'; }).join('');
  }
  box.innerHTML = h;
}
$('#pvTabs').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return;
  if (b.dataset.mode) { MODE = b.dataset.mode; if (MODE === 'site') PAGE = 'index.html'; render(); }
  else if (b.dataset.page) { PAGE = b.dataset.page; render(); }
});
window.addEventListener('message', function (e) {
  if (!frame || e.source !== frame.contentWindow || !e.data || typeof e.data.siteGoto !== 'string') return;
  if (pageList(S).some(function (p) { return p.file === e.data.siteGoto; }) || e.data.siteGoto === '404.html') { PAGE = e.data.siteGoto; render(); }
});

function toBytes(s) { return new TextEncoder().encode(s); }
function download() {
  var site = buildSite(S, haveBytes()), entries = [];
  Object.keys(site.files).forEach(function (n) { entries.push({ name: n, data: toBytes(site.files[n]) }); });
  var readme = 'Open index.html in a browser to see the website. Keep all files and the images folder together.\r\nThe contact form opens the visitor\'s email app. Edit the text in each .html file to replace placeholder wording.\r\n';
  entries.push({ name: 'README.txt', data: toBytes(readme) });
  var jobs = site.images.map(function (i) { return ORIG[i.slot].arrayBuffer().then(function (buf) { entries.push({ name: 'images/' + i.name, data: new Uint8Array(buf) }); }); });
  Promise.all(jobs).then(function () {
    var blob = new Blob([makeZip(entries)], { type: 'application/zip' });
    var a = document.createElement('a'), base = slugify(S.bizName || S.id || 'website') || 'website';
    a.href = URL.createObjectURL(blob); a.download = base + '-website.zip'; document.body.appendChild(a); a.click(); a.remove();
    var missing = Object.keys(S.files || {}).filter(function (k) { return !ORIG[k]; });
    toast('Downloaded ' + site.pages.length + ' pages' + (missing.length ? '. Photos not uploaded this session were left out.' : '.'));
  }).catch(function () { toast('Could not build the zip. Try again.'); });
}
$('#bSite').addEventListener('click', download);
drawTabs();
})(typeof window !== 'undefined' ? window : globalThis);
