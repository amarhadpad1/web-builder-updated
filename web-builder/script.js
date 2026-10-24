/* Paste your Google Apps Script Web app URL here (it ends with /exec). */
var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6pk3N0k4u7zTrt1RX3k7Ywn6l6jnCMjn6skQ85LyZ6wlbe5-GFfUI5xnWOEUQCeVB/exec';

(function(){
  var H=['Playfair Display','Montserrat','Poppins','Raleway','Oswald','Merriweather','Lora','Cormorant Garamond','Bebas Neue','DM Serif Display','Abril Fatface','Roboto Slab','Libre Baskerville','Nunito','Josefin Sans','Archivo Black','Cinzel','Space Grotesk','Playfair Display SC','Rubik'];
  var B=['Inter','Open Sans','Roboto','Lato','Nunito','Poppins','Source Sans 3','Work Sans','DM Sans','Mulish','Montserrat','Noto Sans','Karla','Rubik','Raleway','Merriweather'];
  var single=['Bebas Neue','Abril Fatface','Archivo Black','DM Serif Display'];
  var all=[].concat(H,B).filter(function(f,i,a){return a.indexOf(f)===i;});
  var q=all.map(function(f){return 'family='+f.replace(/ /g,'+')+(single.indexOf(f)>-1?'':':wght@400;700');}).join('&');
  var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?'+q+'&display=swap';document.head.appendChild(l);
})();

/* ---------- constants ---------- */
var L={layout:'Layout',logoColors:'Logo colours',id:'Project name',client:'Client name',bizName:'Business name',desc:'Business description',type:'Business type',goal:'Main goal',pages:'Pages',feel:'Overall feel',main:'Main colour',accent:'Accent colour',bg:'Background colour',text:'Text colour',muted:'Muted surface colour',fontH:'Heading font',fontB:'Body font',logo:'Logo',hero:'Hero photo',photos:'Photos',phone:'Phone',address:'Address',email:'Email',whatsapp:'WhatsApp',features:'Extra features',corrections:'Corrections / changes requested'};
var OPT={
 goal:['Phone calls','Bookings','Selling','Other'],
 feel:['Luxury','Classic','Friendly','Modern'],
 pages:['Home','About','Services','Gallery','Pricing','Blog','FAQ','Contact'],
 features:['WhatsApp button','Google Map','Social media links','Testimonials','Online booking','Newsletter signup','Pricing table','FAQ section','Live chat']
};
var FONT_H=['Playfair Display','Montserrat','Poppins','Raleway','Oswald','Merriweather','Lora','Cormorant Garamond','Bebas Neue','DM Serif Display','Abril Fatface','Roboto Slab','Libre Baskerville','Nunito','Josefin Sans','Archivo Black','Cinzel','Space Grotesk','Rubik'];
var FONT_B=['Not sure','Inter','Open Sans','Roboto','Lato','Nunito','Poppins','Source Sans 3','Work Sans','DM Sans','Mulish','Montserrat','Noto Sans','Karla','Rubik','Raleway','Merriweather'];
var COLOR_KEYS=[['main','Main colour (hero, menu text, footer)'],['accent','Accent colour (buttons, card borders)'],['bg','Background colour (page)'],['text','Text colour'],['muted','Muted surfaces (cards, light panels)']];

var LAYOUTS=[
{id:'classic',name:'Classic',note:'Centred hero, cards in a row',spec:'Classic centred layout: a top menu bar with the logo and name on the left and the links on the right. A centred hero with the heading, the line and the button. Three service cards in a row with an accent colour top border. A gallery grid. A centred contact section. A footer in the main colour.'},
{id:'split',name:'Split',note:'Text left, big block right',spec:'Split layout: a top menu bar. The hero has two columns: heading, line and button on the left, and on the right a large block showing the hero photo (or the main colour) with an accent coloured offset shadow. Services as a vertical list of rows, each with a small accent dot, a title and a short description. The gallery as a two column grid. The contact section in two columns: details on the left, form on the right. A left aligned footer in the main colour.'},
{id:'sidebar',name:'Sidebar',note:'Menu fixed on the left',spec:'Sidebar layout: on laptops, a fixed vertical sidebar on the left in the main colour holds the logo, the business name, the page links stacked vertically and the phone number at the bottom. The content scrolls on the right. The hero is left aligned: a large heading in the main colour, the line, the button, and the hero photo as a wide rounded banner below. Services as full width stacked cards with a soft tinted background. The gallery in two columns. The contact form below. A small footer.'},
{id:'editorial',name:'Editorial',note:'Huge type, thin lines',spec:'Editorial layout: a thin top bar with the business name on the left and small uppercase spaced links on the right. A very large left aligned heading (about 4 to 6 rem on laptops) in the main colour with a thin rule under it, then the line, then the button styled as an underlined text link with an arrow. Services as large rows separated by thin lines, with the title on the left and the description on the right. A gallery with one large image and two smaller ones. A left aligned contact section. A thin footer.'},
{id:'bento',name:'Bento',note:'Grid of rounded tiles',spec:'Bento grid layout: the page background is slightly tinted and everything is a grid of rounded tiles of different sizes with even gaps and large corner radius. The first tile is the hero in the main colour with the heading, the line and the button. The three services are tiles with different tint colours. Photos form a mosaic of tiles. The contact form sits in a wide tile with an accent tint. Keep the menu simple at the top.'},
{id:'fullhero',name:'Full screen',note:'Big hero, overlapping cards',spec:'Full screen hero layout: the hero fills the first screen with the hero photo (with a dark overlay) or the main colour. The menu is transparent and sits on top of the hero in light text, and becomes solid when the page scrolls. The heading and the button sit in the lower part of the hero. The three service cards overlap the bottom edge of the hero with a soft shadow. A full width gallery strip follows. The contact section sits on a tinted background in two columns. A footer in the main colour.'},
{id:'story',name:'Story',note:'Alternating rows',spec:'Story layout: a compact left aligned hero with the heading, the line and the button. Below it, each service is a full width row that alternates sides: a block with a photo (or an accent tint block) on one side and the title and text on the other, then reversed on the next row. Any extra photos go in a three column gallery. A centred contact section. A footer in the main colour.'},
{id:'minimal',name:'Minimal',note:'Centred, calm, lots of space',spec:'Minimal centred layout: a narrow single column with a lot of white space. The logo and business name are centred at the top with the page links in small spaced capitals under them. A calm centred hero with a modest heading, the line and an outlined button (no big colour block). Services as a simple centred text list, each separated by a short accent coloured dash. The gallery as a two column grid. A centred contact section and a quiet footer without a colour band.'},
{id:'magazine',name:'Magazine',note:'Feature tile plus a stack',spec:'Magazine layout: a top menu bar. Below it a two column block: on the left one tall feature tile in the main colour (or the hero photo with an overlay) holding the heading, the line and the button, and on the right a stack of three compact service cards with soft tints. A three column gallery follows, then a two column contact section, and a footer in the main colour.'},
{id:'float',name:'Floating card',note:'Card floating over a band',spec:'Floating card layout: a top menu bar, then a wide band in the main colour (or the hero photo) about 200px tall. A centred card in the page background colour with a soft shadow and large corner radius floats over the bottom of the band and holds the heading, the line and the button. Services as three plain cards below it, then the gallery, a centred contact section and a footer in the main colour.'},
{id:'diagonal',name:'Diagonal',note:'Slanted hero edge',spec:'Diagonal layout: the hero uses the hero photo with a dark overlay or the main colour, and its bottom edge is cut at an angle (use clip-path). The heading is left aligned. Services as three centred columns, each with a round accent coloured badge showing the first letter of the service. Then the gallery, a contact section and a footer in the main colour.'},
{id:'bands',name:'Colour bands',note:'Full-width coloured sections',spec:'Colour bands layout: the page is a stack of full width bands. The menu sits on a band in the main colour with light text. The hero band uses the page background and has left aligned text. The services band is in the main colour with the three cards in the page background colour. The gallery band has a soft accent tint. The contact band uses the page background. The footer is in the main colour. Section titles are left aligned.'},
{id:'arch',name:'Arch',note:'Rounded arch picture, soft cards',spec:'Arch layout: a soft, friendly design. The hero has two columns: heading, line and button on the left, and on the right the hero photo (or an accent tint block) cropped into an arch shape (fully rounded top, slightly rounded bottom). Services as three softly rounded cards with generous padding. The gallery has rounded tiles. The contact section is centred with rounded inputs. A footer in the main colour.'},
{id:'mosaic',name:'Photo mosaic',note:'Heading tile plus photo tiles',spec:'Photo mosaic layout: a top menu bar, then a mosaic hero: one large tile in the main colour holding the heading, the line and the button, next to two stacked photo tiles (the first two photos, or accent tint blocks if there are none). Services as three plain columns, each with a thin line in the main colour on top. Then a contact section in two columns and a footer in the main colour.'},
{id:'saas',name:'SaaS showcase',note:'Badge, big headline, app mock-up',spec:'SaaS showcase layout: a clean top menu. A centred hero with a small pill badge, a large headline, one short line and two buttons (one filled, one outlined). Under it a large product or hero image inside a browser-window frame with a soft shadow. Then a grid of three feature cards, each with a small accent square showing the first letter. A full width call to action band in the main colour, then the gallery, a centred contact section and a footer in the main colour.'},
{id:'glass',name:'Floating pill nav',note:'Rounded floating menu over a hero',spec:'Floating pill menu layout: no full width menu bar. Instead a rounded pill shaped menu floats over the top of the hero with a translucent glass look, holding the business name, a few links and a small button. The hero is a soft gradient from the main colour (or the hero photo with a dark overlay) with a centred heading, line and rounded button. Three translucent glass cards with a soft shadow overlap the bottom of the hero. Then the gallery, a centred contact section and a footer in the main colour.'},
{id:'brutal',name:'Neo-brutalist',note:'Thick borders, hard shadows, bold type',spec:'Neo-brutalist layout: flat bold colours, thick 2 to 3px dark borders and hard offset shadows with no blur, and no rounded corners. The menu is a bar in the accent colour with uppercase links. A very large uppercase heading with the business name highlighted in the accent colour, then the line and a boxed button with a hard shadow. Services as three boxed cards in different flat colours. Photos in boxed tiles with hard shadows. The contact form inside a bordered box. A dark footer with uppercase text.'},
{id:'steps',name:'Numbered steps',note:'Hero plus 01 / 02 / 03 process',spec:'Numbered steps layout: a top menu, then a left aligned hero on a lightly tinted band. Below it a section called How it works where the three services are shown as a vertical list numbered 01, 02 and 03 in large accent coloured numerals, separated by thin lines. A gallery grid follows, then a call to action band in the main colour with a button, a contact section and a footer in the main colour.'},
{id:'portfolio',name:'Portfolio grid',note:'Work first, large project tiles',spec:'Portfolio grid layout: a light top menu with no border, then a short left aligned intro (heading and one line). Straight after it a grid of large project tiles: the first spans the full width and the next two sit side by side, each tile a photo (or tinted block) with the title and a small caption underneath. Any extra photos in a three column grid. A single button, a left aligned contact section and a left aligned footer in the main colour.'},
{id:'sticky',name:'Sticky split',note:'Fixed text left, scrolling cards right',spec:'Sticky split layout: a top menu, then a two column section. The left column stays fixed (position sticky) while the page scrolls and holds the heading, the line and the button. The right column scrolls and holds the three services as large soft tinted cards with generous padding, followed by a photo. On phones the columns stack. Then a left aligned contact section and a footer in the main colour.'},
{id:'banner',name:'Announcement bar',note:'Top strip, wide image, icon row',spec:'Announcement bar layout: a thin strip in the accent colour at the very top with the phone number or a short welcome message, then a top menu. A centred hero with the heading, line and button, and below it a wide cinematic banner image (21:9) using the hero photo or the main colour. Services as a row of three centred items, each with a round tinted badge showing the first letter. Then the gallery, a centred contact section and a footer in the main colour.'},
{id:'carousel',name:'Card carousel',note:'Swipeable service cards',spec:'Card carousel layout: a top menu and a left aligned hero with heading, line and button. The services are shown as a horizontally scrolling row of cards (scroll snap, about 60% of the screen wide on phones so the next card peeks in), each with an image on top and the title and text below, with small arrows beside the section title. Extra photos in a three column grid, then a centred contact section and a footer in the main colour.'}
];
function layoutById(id){return LAYOUTS.filter(function(l){return l.id===id;})[0];}
function layoutSpec(){return (layoutById(S.layout)||LAYOUTS[0]).spec;}
function randLayout(skip){var o=LAYOUTS.filter(function(l){return l.id!==skip;});return o[Math.floor(Math.random()*o.length)].id;}
function defaults(){return {id:'',client:'',bizName:'',desc:'',type:'',goal:'Phone calls',pages:['Home','Services','Gallery','Contact'],feel:'Modern',main:'#1f3a5f',accent:'#e8a33d',bg:'#ffffff',text:'',muted:'#f1f3f6',fontH:'Poppins',fontB:'Inter',phone:'',address:'',email:'',whatsapp:'',features:[],corrections:'',nPhotos:4,files:{},logoColors:[],layout:randLayout()};}
var S=defaults(), IMG={}, ORIG={};
var draftReady=false, draftDbPromise=null, draftWriteQueue=Promise.resolve();

/* ---------- helpers ---------- */
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function toast(m){var t=$('#toast');t.textContent=m;t.className='on';clearTimeout(toast.t);toast.t=setTimeout(function(){t.className='';},2600);}
function isHex(v){return /^#[0-9a-f]{6}$/i.test(v||'');}
function lum(h){if(!isHex(h))return 1;var c=[1,3,5].map(function(i){var v=parseInt(h.substr(i,2),16)/255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function onC(h){return lum(h)>0.45?'#111111':'#ffffff';}
function hsl2hex(h,s,l){s/=100;l/=100;var a=s*Math.min(l,1-l);var f=function(n){var k=(n+h/30)%12;var c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0');};return '#'+f(0)+f(8)+f(4);}
function slots(){var a=['logo','hero'];for(var i=1;i<=S.nPhotos;i++)a.push('photo'+i);return a;}
function slotLabel(s){return s==='logo'?'Logo':s==='hero'?'Hero photo (big banner)':'Photo '+s.replace('photo','');}
/* Local draft recovery. IndexedDB stores full state and image files; localStorage is a
   small fallback for form state only, so large photos do not hit its storage quota. */
function openDraftDB(){
  if(!window.indexedDB)return Promise.reject(new Error('IndexedDB unavailable'));
  if(draftDbPromise)return draftDbPromise;
  draftDbPromise=new Promise(function(resolve,reject){
    var req=window.indexedDB.open('webBuilderDrafts',1);
    req.onupgradeneeded=function(){var db=req.result;if(!db.objectStoreNames.contains('drafts'))db.createObjectStore('drafts',{keyPath:'key'});};
    req.onsuccess=function(){resolve(req.result);};
    req.onerror=function(){reject(req.error||new Error('Could not open local draft storage'));};
    req.onblocked=function(){reject(new Error('Local draft storage is blocked'));};
  });
  return draftDbPromise;
}
function draftSnapshot(){
  var state;try{state=JSON.parse(JSON.stringify(S));}catch(e){state={};}
  var images={};Object.keys(IMG).forEach(function(k){if(typeof IMG[k]==='string'&&IMG[k].indexOf('data:image/')===0)images[k]=IMG[k];});
  var originals={};Object.keys(ORIG).forEach(function(k){if(ORIG[k])originals[k]=ORIG[k];});
  return {key:'current',state:state,images:images,originals:originals,updated:Date.now()};
}
function writeDraftRecord(record){
  return openDraftDB().then(function(db){return new Promise(function(resolve,reject){
    var tx=db.transaction(['drafts'],'readwrite');tx.objectStore('drafts').put(record);
    tx.oncomplete=function(){resolve();};tx.onerror=function(){reject(tx.error||new Error('Draft save failed'));};tx.onabort=function(){reject(tx.error||new Error('Draft save was cancelled'));};
  });});
}
function save(){
  if(!draftReady)return;
  var record=draftSnapshot();
  draftWriteQueue=draftWriteQueue.then(function(){return writeDraftRecord(record).then(function(){try{localStorage.removeItem('wp_state');localStorage.removeItem('wp_state_time');}catch(e){}});}).catch(function(){
    /* Keep form data recoverable if IndexedDB is unavailable; image data stays out of localStorage. */
    try{localStorage.setItem('wp_state',JSON.stringify(record.state));localStorage.setItem('wp_state_time',String(record.updated));}catch(e){}
  });
}
function saveImgs(){save();}
function blobFromDataURL(data){
  var m=String(data).match(/^data:([^;,]+)?(;base64)?,(.*)$/);if(!m)return null;
  try{var raw=m[2]?atob(m[3]):decodeURIComponent(m[3]),a=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)a[i]=raw.charCodeAt(i);return new Blob([a],{type:m[1]||'application/octet-stream'});}catch(e){return null;}
}
function restoreDraft(){
  function fromLocal(){
    try{var raw=localStorage.getItem('wp_state');if(raw){var state=JSON.parse(raw);if(state&&typeof state==='object')return {state:state,images:{},originals:{},localOnly:true,updated:Number(localStorage.getItem('wp_state_time'))||0};}}catch(e){}
    return null;
  }
  return openDraftDB().then(function(db){return new Promise(function(resolve){
    var tx=db.transaction(['drafts'],'readonly'),req=tx.objectStore('drafts').get('current');
    req.onsuccess=function(){var local=fromLocal(),stored=req.result;resolve(local&&(!stored||(local.updated||0)>(stored.updated||0))?local:(stored||local));};req.onerror=function(){resolve(fromLocal());};
  });}).catch(fromLocal);
}
function applyDraftRecord(record){
  if(!record||!record.state||typeof record.state!=='object')return false;
  var next=defaults();Object.keys(record.state).forEach(function(k){next[k]=record.state[k];});
  if(!next.files||typeof next.files!=='object')next.files={};
  if(!Array.isArray(next.pages))next.pages=[];
  if(!Array.isArray(next.features))next.features=[];
  if(!Array.isArray(next.logoColors))next.logoColors=[];
  S=next;IMG=record.images&&typeof record.images==='object'?record.images:{};
  ORIG=record.originals&&typeof record.originals==='object'?record.originals:{};
  Object.keys(IMG).forEach(function(k){
    if(!ORIG[k]){var b=blobFromDataURL(IMG[k]);if(b){try{ORIG[k]=typeof File!=='undefined'?new File([b],S.files[k]||k+'.jpg',{type:b.type}):b;}catch(e){ORIG[k]=b;}}}
  });
  knownId=normId(S.id);return true;
}


/* ---------- palette ---------- */
var PALETTE=['#000000','#1a1a1a','#333333','#4d4d4d','#666666','#808080','#999999','#b3b3b3','#cccccc','#e6e6e6','#f5f5f5','#ffffff'];
[20,35,50,65,80,92].forEach(function(l){for(var h=0;h<360;h+=30)PALETTE.push(hsl2hex(h,l<30||l>85?55:75,l));});
PALETTE=PALETTE.concat(['#f5efe6','#e8dcc8','#c9b79c','#8b6f47','#3e2723','#0b1f3a','#14532d','#7f1d1d','#d4af37','#c0c0c0','#b76e79','#40e0d0']);

/* ---------- build UI ---------- */
function buildChips(){
  $$('[data-single]').forEach(function(box){var k=box.dataset.single;box.innerHTML='';OPT[k].forEach(function(o){var b=document.createElement('button');b.className='chip';b.textContent=o;b.dataset.v=o;b.onclick=function(){S[k]=o;onChange();refreshChips();};box.appendChild(b);});});
  $$('[data-multi]').forEach(function(box){var k=box.dataset.multi;box.innerHTML='';OPT[k].forEach(function(o){var b=document.createElement('button');b.className='chip';b.textContent=o;b.dataset.v=o;b.onclick=function(){var i=S[k].indexOf(o);if(i>-1)S[k].splice(i,1);else S[k].push(o);onChange();refreshChips();};box.appendChild(b);});});
}
function refreshChips(){
  $$('[data-single]').forEach(function(box){$$('.chip',box).forEach(function(b){b.classList.toggle('sel',S[box.dataset.single]===b.dataset.v);});});
  $$('[data-multi]').forEach(function(box){$$('.chip',box).forEach(function(b){b.classList.toggle('sel',S[box.dataset.multi].indexOf(b.dataset.v)>-1);});});
}
var ST={};
var QUICK=['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#14b8a6','#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e','#7f1d1d','#14532d','#0b1f3a','#8b6f47','#d4af37','#b76e79','#f5efe6','#000000','#808080','#ffffff'];
var SHADES=[96,90,82,74,66,58,50,42,34,26,18,10];
function hex2hsl(hx){var r=parseInt(hx.substr(1,2),16)/255,g=parseInt(hx.substr(3,2),16)/255,b=parseInt(hx.substr(5,2),16)/255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,hh=0,s=0,d=mx-mn;if(d){s=d/(1-Math.abs(2*l-1));if(mx===r)hh=((g-b)/d)%6;else if(mx===g)hh=(b-r)/d+2;else hh=(r-g)/d+4;hh*=60;if(hh<0)hh+=360;}return {h:hh,s:s*100,l:l*100};}
function hsl2rgb(h,s,l){s/=100;l/=100;var a=s*Math.min(l,1-l);var f=function(n){var k=(n+h/30)%12;return (l-a*Math.max(Math.min(k-3,9-k,1),-1))*255;};return [f(0),f(8),f(4)];}
/* name, main (primary), accent, background (secondary), text, muted surfaces */
var PALS=[
['Luxury Black & Gold','#111318','#C6A15B','#F7F4EE','#252525','#EAE7E0'],
['Modern Blue & White','#1E3A8A','#3B82F6','#FFFFFF','#1F2937','#EFF4FF'],
['Deep Teal & Mint','#0F4C4A','#5ED6B0','#F0FBF7','#16302F','#D9F2E9'],
['Sage Green & Cream','#5C7457','#9DB58F','#FAF6EA','#2B3328','#E9E6D6'],
['Orange & Cream','#9A3412','#F97316','#FFF7ED','#2B1B12','#FDE7CF'],
['Purple & Lavender','#4C1D95','#A78BFA','#F5F0FF','#231B35','#E6DBFF'],
['Burgundy & Blush','#6B1D2E','#E8A3AE','#FDF0F0','#2B1519','#F6DADA'],
['Monochrome Black & White','#111111','#8A8A8A','#FFFFFF','#1A1A1A','#EDEDED']];
function buildPals(){
  var b=$('#palettes');if(!b)return;
  var btn=function(p,i){return '<button type="button" class="pal" data-i="'+i+'"><span class="dots4">'+p.slice(1).map(function(c){return '<i style="background:'+c+'"></i>';}).join('')+'</span>'+p[0]+'</button>';};
  b.innerHTML=PALS.map(btn).join('');
  b.onclick=function(e){var t=e.target;while(t&&t!==b&&!(t.dataset&&t.dataset.i))t=t.parentNode;if(!t||t===b)return;
    var p=PALS[+t.dataset.i];S.main=p[1];S.accent=p[2];S.bg=p[3];S.text=p[4];S.muted=p[5];ST={};onChange();refreshColors();toast(p[0]+' palette applied');};
}
function markPals(){$$('#palettes .pal').forEach(function(b){var p=PALS[+b.dataset.i];b.classList.toggle('sel',S.main===p[1]&&S.accent===p[2]&&S.bg===p[3]&&S.text===p[4]&&S.muted===p[5]);});}
/* ---------- colours from the logo ---------- */
function rgb2hex(r,g,b){return '#'+[r,g,b].map(function(v){return Math.round(v).toString(16).padStart(2,'0');}).join('');}
function extractColors(im){
  var m=140,sc=Math.min(1,m/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*sc)),h=Math.max(1,Math.round(im.height*sc));
  var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');x.drawImage(im,0,0,w,h);
  var d;try{d=x.getImageData(0,0,w,h).data;}catch(e){return [];}
  var bk={},total=0;
  for(var i=0;i<d.length;i+=4){
    if(d[i+3]<128)continue;
    var r=d[i],g=d[i+1],b=d[i+2];
    if(r>235&&g>235&&b>235)continue;
    var k=((r>>4)<<8)|((g>>4)<<4)|(b>>4),e=bk[k]||(bk[k]={n:0,r:0,g:0,b:0});
    e.n++;e.r+=r;e.g+=g;e.b+=b;total++;
  }
  var list=Object.keys(bk).map(function(k){var e=bk[k];return {n:e.n,r:e.r/e.n,g:e.g/e.n,b:e.b/e.n};}).sort(function(a,b){return b.n-a.n;});
  var out=[];
  list.forEach(function(e){
    if(out.length>=6||e.n<total*0.01)return;
    var far=out.every(function(o){var dr=o.r-e.r,dg=o.g-e.g,db=o.b-e.b;return Math.sqrt(dr*dr+dg*dg+db*db)>60;});
    if(far)out.push(e);
  });
  return out.map(function(e){return rgb2hex(e.r,e.g,e.b);});
}
var pickedLogoColor='';
function renderLogoPal(){
  var p=$('#logoPal');if(!p)return;
  var cols=S.logoColors||[];
  if(!cols.length||!S.files.logo){p.hidden=true;return;}
  p.hidden=false;
  p.innerHTML='<div class="mini" style="margin-top:0">Colours found in the client logo</div>'+
    '<div class="lp-row">'+(IMG.logo?'<img class="lp-img" alt="Client logo" src="'+IMG.logo+'">':'')+
    '<div class="dots lp">'+cols.map(function(c){return '<button type="button" data-lc="'+c+'" class="'+(c===pickedLogoColor?'sel':'')+'" style="background:'+c+'" title="'+c+'" aria-label="Logo colour '+c+'"></button>';}).join('')+'</div></div>'+
    '<div class="row" style="margin-top:8px"><button type="button" class="btn" id="bUseLogo">Use logo colours</button><span class="sub" style="margin:0">Sets main and accent from the logo. Tap one colour to choose where it goes.</span></div>'+
    '<div class="row useas" style="margin-top:8px"'+(pickedLogoColor?'':' hidden')+'><span class="sub" style="margin:0">Use '+pickedLogoColor+' as:</span>'+
    COLOR_KEYS.map(function(ck){return '<button type="button" class="btn alt sm" data-use="'+ck[0]+'">'+ck[1].split(' (')[0]+'</button>';}).join('')+'</div>';
  p.onclick=function(e){var t=e.target;
    if(t.dataset&&t.dataset.lc){pickedLogoColor=t.dataset.lc;renderLogoPal();return;}
    if(t.dataset&&t.dataset.use&&pickedLogoColor){setColor(t.dataset.use,pickedLogoColor);toast(pickedLogoColor+' set as '+t.textContent.toLowerCase());return;}
    if(t.id==='bUseLogo'){useLogoColors();}
  };
}
function useLogoColors(){
  var cols=(S.logoColors||[]).slice();if(!cols.length)return;
  function hs(c){return hex2hsl(c);}
  var main=cols.filter(function(c){var t=hs(c);return t.s>15&&lum(c)<0.6;})[0]||cols.filter(function(c){return lum(c)<0.6;})[0]||cols[0];
  var rest=cols.filter(function(c){return c!==main;});
  var acc=rest.filter(function(c){return lum(c)>0.08&&lum(c)<0.9;})[0]||rest[0];
  if(!acc){var t=hs(main);acc=hsl2hex((t.h+30)%360,Math.max(55,t.s),55);}
  S.main=main;S.accent=acc;
  var tl=hex2hsl(S.bg||'#ffffff');
  ST={};onChange();refreshColors();
  toast('Main '+main+' and accent '+acc+' taken from the logo');
}
function buildColors(){
  var box=$('#colors');box.innerHTML='';
  COLOR_KEYS.forEach(function(ck){
    var k=ck[0],d=document.createElement('div');d.className='cp';
    d.innerHTML='<label class="l" style="margin-top:0">'+ck[1]+'</label><div class="cwrap">'+
      '<div class="wheelbox"><canvas width="300" height="300" data-wheel="'+k+'" aria-label="Colour wheel"></canvas><span class="mk" data-mk="'+k+'"></span></div>'+
      '<div class="cside">'+
        '<div class="cprow"><span class="cur" data-cur="'+k+'"></span><input type="color" id="pick-'+k+'" data-pick="'+k+'" aria-label="Open colour picker"><input type="text" id="hex-'+k+'" data-hex="'+k+'" placeholder="#RRGGBB" maxlength="7">'+(k==='text'?'<button class="btn alt sm" data-auto="1">Auto</button>':'')+'</div>'+
        '<div class="mini">Lighter / darker</div><input type="range" class="lite" id="lite-'+k+'" data-lite="'+k+'" min="3" max="97" step="1">'+
        '<div class="mini">Shades of this colour</div><div class="shades" data-shades="'+k+'"></div>'+
        '<div class="mini">Quick colours</div><div class="dots" data-dots="'+k+'">'+QUICK.map(function(c){return '<button type="button" data-c="'+c+'" style="background:'+c+'" title="'+c+'" aria-label="'+c+'"></button>';}).join('')+'</div>'+
      '</div></div>';
    box.appendChild(d);
    var cv=$('[data-wheel="'+k+'"]',d);
    function pick(e){var r=cv.getBoundingClientRect();var x=(e.clientX-r.left)/r.width*2-1,y=(e.clientY-r.top)/r.height*2-1;var rad=Math.min(1,Math.sqrt(x*x+y*y));
      var t=ST[k]||hex2hsl('#808080');t.h=(Math.atan2(y,x)*180/Math.PI+360)%360;t.s=rad*100;ST[k]=t;S[k]=hsl2hex(t.h,t.s,t.l);onChange();refreshOne(k,false);}
    cv.addEventListener('pointerdown',function(e){cv.setPointerCapture(e.pointerId);cv._d=1;pick(e);});
    cv.addEventListener('pointermove',function(e){if(cv._d)pick(e);});
    cv.addEventListener('pointerup',function(){cv._d=0;});cv.addEventListener('pointercancel',function(){cv._d=0;});
    $('[data-lite="'+k+'"]',d).addEventListener('input',function(){var t=ST[k]||hex2hsl('#808080');t.l=+this.value;ST[k]=t;S[k]=hsl2hex(t.h,t.s,t.l);onChange();refreshOne(k,true);});
    $('[data-pick="'+k+'"]',d).addEventListener('input',function(){setColor(k,this.value);});
    $('[data-hex="'+k+'"]',d).addEventListener('input',function(){var v=this.value.trim();if(v&&v[0]!=='#')v='#'+v;if(isHex(v))setColor(k,v.toLowerCase(),true);});
    d.addEventListener('click',function(e){var t=e.target;
      if(t.dataset&&t.dataset.auto){setColor('text','');return;}
      if(t.parentNode&&t.parentNode.dataset&&t.parentNode.dataset.dots&&t.dataset.c){setColor(k,t.dataset.c);return;}
      if(t.parentNode&&t.parentNode.dataset&&t.parentNode.dataset.shades&&t.dataset.l){var s=ST[k]||hex2hsl('#808080');s.l=+t.dataset.l;ST[k]=s;S[k]=hsl2hex(s.h,s.s,s.l);onChange();refreshOne(k,true);}
    });
  });
}
function setColor(k,v,keepHex){S[k]=v;ST[k]=null;onChange();refreshOne(k,true,keepHex);}
function drawWheel(k,l){
  var cv=$('[data-wheel="'+k+'"]'),ctx=cv.getContext('2d'),N=cv.width,img=ctx.createImageData(N,N),dt=img.data;
  for(var y=0;y<N;y++){for(var x=0;x<N;x++){var dx=(x+.5-N/2)/(N/2),dy=(y+.5-N/2)/(N/2),r=Math.sqrt(dx*dx+dy*dy);if(r>1)continue;
    var c=hsl2rgb((Math.atan2(dy,dx)*180/Math.PI+360)%360,r*100,l),i=(y*N+x)*4;dt[i]=c[0];dt[i+1]=c[1];dt[i+2]=c[2];dt[i+3]=255;}}
  ctx.putImageData(img,0,0);
}
function refreshOne(k,redraw,skipHex){
  var v=S[k],t=ST[k];
  if(isHex(v)){if(!t||hsl2hex(t.h,t.s,t.l)!==v){t=hex2hsl(v);ST[k]=t;redraw=true;}}
  else if(!t){t=hex2hsl(k==='text'?(lum(S.bg)>0.45?'#1a1a1a':'#f5f5f5'):'#808080');ST[k]=t;redraw=true;}
  var box=$('#colors');
  var cv=$('[data-wheel="'+k+'"]',box);
  if(redraw||cv._l!==Math.round(t.l)){drawWheel(k,t.l);cv._l=Math.round(t.l);}
  var mk=$('[data-mk="'+k+'"]',box),a=t.h*Math.PI/180,rr=t.s/100*50;
  mk.style.left=(50+Math.cos(a)*rr)+'%';mk.style.top=(50+Math.sin(a)*rr)+'%';
  var cur=hsl2hex(t.h,t.s,t.l);mk.style.background=isHex(v)?v:cur;
  var cc=$('[data-cur="'+k+'"]',box);cc.style.background=v||'transparent';cc.title=v||'Auto';
  var p=$('[data-pick="'+k+'"]',box);p.value=isHex(v)?v:cur;
  var hx=$('[data-hex="'+k+'"]',box);if(skipHex!==true)hx.value=v||'';if(k==='text')hx.placeholder='Auto';
  var lt=$('[data-lite="'+k+'"]',box);lt.value=Math.round(t.l);
  lt.style.background='linear-gradient(to right,'+hsl2hex(t.h,t.s,3)+','+hsl2hex(t.h,t.s,50)+','+hsl2hex(t.h,t.s,97)+')';
  var sh=$('[data-shades="'+k+'"]',box);
  var best=0;SHADES.forEach(function(l,i){if(Math.abs(l-t.l)<Math.abs(SHADES[best]-t.l))best=i;});
  sh.innerHTML=SHADES.map(function(l,i){var c=hsl2hex(t.h,t.s,l);return '<button type="button" data-l="'+l+'" style="background:'+c+'" title="'+c+'" aria-label="'+c+'"'+(i===best&&isHex(v)?' class="sel"':'')+'></button>';}).join('');
  $$('[data-dots="'+k+'"] button',box).forEach(function(b){b.classList.toggle('sel',b.dataset.c===(v||'').toLowerCase());});
}
function refreshColors(skip){COLOR_KEYS.forEach(function(ck){refreshOne(ck[0],false,skip===ck[0]);});}
function buildFonts(){
  [['fontH',FONT_H],['fontB',FONT_B]].forEach(function(p){var box=$('#'+p[0]);box.innerHTML='';
    p[1].forEach(function(f){var b=document.createElement('button');b.dataset.f=f;b.style.fontFamily=f==='Not sure'?'Inter':"'"+f+"'";b.innerHTML=(f==='Not sure'?'Not sure':'Aa Quick brown')+'<small>'+f+'</small>';b.onclick=function(){S[p[0]]=f;onChange();refreshFonts();};box.appendChild(b);});});
}
function refreshFonts(){['fontH','fontB'].forEach(function(k){$$('#'+k+' button').forEach(function(b){b.classList.toggle('sel',b.dataset.f===S[k]);});});}

function buildPhotos(){
  var box=$('#photos');box.innerHTML='';
  slots().forEach(function(s){
    var d=document.createElement('div');d.className='ph';
    var fn=S.files[s]||'';
    d.innerHTML='<div class="th" style="'+(IMG[s]?'background-image:url('+IMG[s]+')':'')+'"></div><div class="nm"><b>'+slotLabel(s)+'</b><span>'+(fn?'Saved as '+esc(fn):'Placeholder: '+s)+'</span></div><input type="file" accept="image/*">'+(fn?'<button class="btn alt sm">Remove</button>':'');
    $('input',d).onchange=function(e){var f=e.target.files[0];if(f)loadPhoto(s,f);};
    var rm=$('button',d);if(rm)rm.onclick=function(){delete S.files[s];delete IMG[s];delete ORIG[s];if(s==='logo')S.logoColors=[];saveImgs();onChange();buildPhotos();renderLogoPal();};
    box.appendChild(d);
  });
}
var IMG_EXT={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/avif':'avif','image/bmp':'bmp','image/svg+xml':'svg'};
function photoExt(file){
  /* use the file's own extension; if it has none (or a silly one), fall back to its type, never to the whole file name */
  var n=file.name||'',i=n.lastIndexOf('.'),e=i>0?n.slice(i+1).toLowerCase():'';
  return /^[a-z0-9]{2,5}$/.test(e)?e:(IMG_EXT[file.type]||'jpg');
}
var photoTok={};
function loadPhoto(slot,file){
  var tok=photoTok[slot]=(photoTok[slot]||0)+1;
  /* nothing is stored until the picture has really been read, so a bad file never leaves a half-filled slot */
  function fail(){if(tok!==photoTok[slot])return;toast('Could not use "'+(file.name||'that file')+'". Please choose a JPG, PNG or WebP picture.');buildPhotos();}
  var r=new FileReader();r.onerror=fail;
  r.onload=function(){var im=new Image();im.onerror=fail;im.onload=function(){
    if(tok!==photoTok[slot])return;
    var iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;if(!iw||!ih){fail();return;}
    var m=900,sc=Math.min(1,m/Math.max(iw,ih)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(iw*sc));c.height=Math.max(1,Math.round(ih*sc));
    var cx=c.getContext('2d');if(slot!=='logo'){cx.fillStyle='#ffffff';cx.fillRect(0,0,c.width,c.height);} /* JPEG has no transparency: without this, see-through PNGs turn black */
    cx.drawImage(im,0,0,c.width,c.height);
    S.files[slot]=slot+'.'+photoExt(file);ORIG[slot]=file;
    IMG[slot]=slot==='logo'?c.toDataURL('image/png'):c.toDataURL('image/jpeg',.8);saveImgs();
    if(slot==='logo'){S.logoColors=extractColors(im);renderLogoPal();}
    onChange();buildPhotos();};im.src=r.result;};r.readAsDataURL(file);
}

/* ---------- preview ---------- */
/* Font names end up inside style="..." attributes all over the previews, so only plain names are allowed (letters, digits, spaces). */
function safeFont(v,fallback){v=String(v==null?'':v).trim();return /^[A-Za-z0-9 ]{1,40}$/.test(v)?v:fallback;}
function pvCtx(){
  var c={};
  c.rad={Luxury:'0px',Classic:'2px',Friendly:'22px',Modern:'8px'}[S.feel]||'8px';
  c.sp={Luxury:1.5,Classic:1.25,Friendly:1.1,Modern:1}[S.feel]||1;
  c.bg=isHex(S.bg)?S.bg:'#ffffff';c.main=isHex(S.main)?S.main:'#1f3a5f';c.acc=isHex(S.accent)?S.accent:'#e8a33d';
  c.txt=isHex(S.text)?S.text:(lum(c.bg)>0.45?'#1a1a1a':'#f5f5f5');
  c.muted=isHex(S.muted)?S.muted:c.main+'14';
  c.fh=safeFont(S.fontH,'Poppins');c.fb=(S.fontB&&S.fontB!=='Not sure')?safeFont(S.fontB,'Inter'):'Inter';
  c.name=S.bizName||'Your Business';
  c.btn={'Phone calls':'Call now','Bookings':'Book now','Selling':'Shop now'}[S.goal]||'Get in touch';
  c.line=S.desc?S.desc.split(/[.\n]/)[0].slice(0,110):'A short line about what the business does';
  c.pages=S.pages.length?S.pages:['Home'];
  c.hero=IMG.hero||'';c.logo=IMG.logo||'';
  c.heroBg=c.hero?'linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),url('+c.hero+') center/cover':c.main;
  c.heroTxt=c.hero?'#ffffff':onC(c.main);
  c.svc=[['Service one','A short description of the first thing you offer.'],['Service two','A short description of the second thing you offer.'],['Service three','A short description of the third thing you offer.']];
  c.gal=[];for(var i=1;i<=S.nPhotos;i++){if(IMG['photo'+i]||S.files['photo'+i])c.gal.push(IMG['photo'+i]);}
  c.wa=S.whatsapp||S.features.indexOf('WhatsApp button')>-1;
  c.big=c.rad==='0px'?'0px':(c.rad==='2px'?'4px':(c.rad==='22px'?'28px':'16px'));
  return c;
}
function pvBtn(c,label,bgc,fg,extra){return '<span class="p-btn" style="background:'+bgc+';color:'+fg+';border-radius:'+c.rad+';'+(extra||'')+'">'+label+'</span>';}
function pvLogo(c){return c.logo?'<img src="'+c.logo+'" alt="" style="height:22px;max-width:60px;object-fit:contain">':'';}
function pvLinks(c){return c.pages.map(function(p){return '<span>'+esc(p)+'</span>';}).join('');}
function pvNav(c,bg,col,border){return '<div class="p-nav" style="background:'+bg+';color:'+col+';'+(border?'border-bottom:1px solid rgba(127,127,127,.2)':'')+'"><div class="logo" style="font-family:\''+c.fh+'\'">'+pvLogo(c)+esc(c.name)+'</div><div class="links">'+pvLinks(c)+'</div></div>';}
function pvH(c,t,align,color,size){return '<h3 style="font-family:\''+c.fh+'\';text-align:'+(align||'center')+';color:'+(color||'inherit')+';font-size:'+(size||16)+'px;margin:0 0 10px">'+t+'</h3>';}
function pvTile(c,g){return 'background-color:'+c.acc+'33;'+(g?'background-image:url('+g+');background-size:cover;background-position:center':'');}
function pvGal(c,cols,list){list=list||c.gal;if(!list.length)return '';return '<div style="display:grid;grid-template-columns:repeat('+cols+',1fr);gap:6px">'+list.map(function(g){return '<div style="aspect-ratio:4/3;border-radius:'+c.rad+';'+pvTile(c,g)+'"></div>';}).join('')+'</div>';}
function pvForm(c,align,w){
  var f='<div class="p-form" style="margin:'+(align==='left'?'0':'0 auto')+';max-width:'+(w||260)+'px"><div style="border-radius:'+c.rad+'">Name</div><div style="border-radius:'+c.rad+'">Phone</div><div style="border-radius:'+c.rad+';padding-bottom:18px">Message</div>';
  if(S.phone)f+='<div style="border:0;padding:2px;opacity:1">Phone: '+esc(S.phone)+'</div>';
  if(S.address)f+='<div style="border:0;padding:2px;opacity:1">'+esc(S.address)+'</div>';
  return f+pvBtn(c,'Send',c.acc,onC(c.acc))+(c.wa?' '+pvBtn(c,'WhatsApp','#25d366','#fff'):'')+'</div>';
}
function pvFoot(c,align){return '<div class="p-foot" style="background:'+c.main+';color:'+onC(c.main)+';text-align:'+(align||'center')+'">&copy; '+new Date().getFullYear()+' '+esc(c.name)+'</div>';}
function pvSvcCards(c){return '<div class="p-cards">'+c.svc.map(function(s){return '<div class="p-card" style="border-top-color:'+c.acc+';border-radius:'+c.rad+'"><b style="font-family:\''+c.fh+'\'">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+'</div>';}
function pvContactInfo(c){return '<p style="margin:0">'+(S.phone||S.address?esc((S.phone||'')+(S.phone&&S.address?' | ':'')+(S.address||'')):'Tell us how we can help.')+'</p>';}

function pvClassic(c){
  var h=pvNav(c,c.bg,c.main,true);
  h+='<div class="p-hero" style="background:'+c.heroBg+';color:'+c.heroTxt+';padding:'+(34*c.sp)+'px 14px"><h1 style="font-family:\''+c.fh+'\'">'+esc(c.name)+'</h1><p>'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>';
  h+='<div class="p-sec" style="padding:'+(18*c.sp)+'px 14px">'+pvH(c,'Our Services')+pvSvcCards(c)+'</div>';
  if(c.gal.length)h+='<div class="p-sec" style="padding:'+(14*c.sp)+'px 14px">'+pvH(c,'Gallery')+pvGal(c,3)+'</div>';
  h+='<div class="p-sec" style="padding:'+(16*c.sp)+'px 14px">'+pvH(c,'Contact')+pvForm(c,'center')+'</div>';
  return h+pvFoot(c);
}
function pvSplit(c){
  var h=pvNav(c,c.bg,c.main,true);
  h+='<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:16px;align-items:center;padding:'+(26*c.sp)+'px 16px;text-align:left"><div><h1 style="font-family:\''+c.fh+'\';font-size:24px;line-height:1.1;color:'+c.main+';margin:0 0 8px">'+esc(c.name)+'</h1><p style="margin:0 0 12px">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>'+
    '<div style="aspect-ratio:1/1;border-radius:'+c.rad+';background:'+(c.hero?'url('+c.hero+') center/cover':c.main)+';box-shadow:8px 8px 0 '+c.acc+'"></div></div>';
  h+='<div style="padding:'+(8*c.sp)+'px 16px;text-align:left">'+pvH(c,'Our Services','left',c.main)+c.svc.map(function(s){return '<div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid rgba(127,127,127,.25)"><i style="flex:none;width:8px;height:8px;border-radius:50%;background:'+c.acc+';margin-top:4px"></i><div><b style="font-family:\''+c.fh+'\'">'+s[0]+'</b><br>'+s[1]+'</div></div>';}).join('')+'</div>';
  if(c.gal.length)h+='<div style="padding:'+(14*c.sp)+'px 16px">'+pvGal(c,2)+'</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1.2fr;gap:14px;padding:'+(16*c.sp)+'px 16px;text-align:left">'+'<div>'+pvH(c,'Contact','left',c.main)+pvContactInfo(c)+'</div>'+pvForm(c,'left',300)+'</div>';
  return h+pvFoot(c,'left');
}
function pvSidebar(c){
  var side='<div style="background:'+c.main+';color:'+onC(c.main)+';padding:12px 10px;display:flex;flex-direction:column;gap:9px;font-size:10px"><div style="font-family:\''+c.fh+'\';font-weight:700;font-size:12px;line-height:1.2">'+pvLogo(c)+'<div>'+esc(c.name)+'</div></div>'+c.pages.map(function(p){return '<span>'+esc(p)+'</span>';}).join('')+'<span style="margin-top:auto;opacity:.8">'+esc(S.phone||'')+'</span></div>';
  var main='<div style="padding:'+(16*c.sp)+'px 14px;text-align:left"><h1 style="font-family:\''+c.fh+'\';font-size:24px;line-height:1.1;color:'+c.main+';margin:0 0 8px">'+esc(c.name)+'</h1><p style="margin:0 0 10px">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+
    '<div style="height:80px;margin:12px 0;border-radius:'+c.big+';background:'+(c.hero?'url('+c.hero+') center/cover':c.acc+'55')+'"></div>'+
    pvH(c,'Our Services','left',c.main)+c.svc.map(function(s){return '<div style="background:'+c.main+'14;border-radius:'+c.rad+';padding:9px 10px;margin-bottom:6px"><b style="font-family:\''+c.fh+'\';display:block">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+
    (c.gal.length?'<div style="margin:10px 0">'+pvGal(c,2)+'</div>':'')+
    '<div style="margin-top:12px">'+pvH(c,'Contact','left',c.main)+pvForm(c,'left',280)+'</div><div style="margin-top:12px;font-size:9px;opacity:.7">&copy; '+new Date().getFullYear()+' '+esc(c.name)+'</div></div>';
  return '<div style="display:grid;grid-template-columns:96px 1fr;min-height:100%">'+side+main+'</div>';
}
function pvEditorial(c){
  var line='1px solid '+c.txt+'33';
  var h='<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:'+line+'"><span style="font-family:\''+c.fh+'\';font-weight:700">'+pvLogo(c)+esc(c.name)+'</span><span style="display:flex;gap:8px;flex-wrap:wrap;text-transform:uppercase;letter-spacing:.12em;font-size:8px">'+pvLinks(c)+'</span></div>';
  h+='<div style="padding:'+(26*c.sp)+'px 16px;text-align:left"><h1 style="font-family:\''+c.fh+'\';font-size:40px;line-height:.95;color:'+c.main+';margin:0 0 12px;letter-spacing:-.02em">'+esc(c.name)+'</h1><div style="border-top:2px solid '+c.main+';width:60px;margin-bottom:10px"></div><p style="margin:0 0 12px;max-width:80%">'+esc(c.line)+'</p><span style="font-weight:700;color:'+c.main+';border-bottom:2px solid '+c.acc+';padding-bottom:2px">'+c.btn+' &rarr;</span></div>';
  h+='<div style="padding:0 16px;text-align:left">'+c.svc.map(function(s){return '<div style="display:grid;grid-template-columns:1fr 1.5fr;gap:10px;padding:12px 0;border-top:'+line+'"><b style="font-family:\''+c.fh+'\';font-size:14px;color:'+c.main+'">'+s[0]+'</b><span>'+s[1]+'</span></div>';}).join('')+'</div>';
  if(c.gal.length){var g=c.gal;h+='<div style="padding:12px 16px;display:grid;grid-template-columns:1fr 1fr;gap:6px"><div style="grid-column:span 2;aspect-ratio:16/8;border-radius:'+c.rad+';'+pvTile(c,g[0])+'"></div>'+g.slice(1,3).map(function(x){return '<div style="aspect-ratio:4/3;border-radius:'+c.rad+';'+pvTile(c,x)+'"></div>';}).join('')+'</div>';}
  h+='<div style="padding:'+(16*c.sp)+'px 16px;text-align:left;border-top:'+line+'">'+pvH(c,'Contact','left',c.main,20)+pvForm(c,'left',300)+'</div>';
  return h+'<div style="padding:12px 16px;border-top:'+line+';font-size:9px;opacity:.7">&copy; '+new Date().getFullYear()+' '+esc(c.name)+'</div>';
}
function pvBento(c){
  var t=function(span,bgc,fg,inner,extra){return '<div style="grid-column:span '+span+';background:'+bgc+';color:'+fg+';border-radius:'+c.big+';padding:12px;text-align:left;'+(extra||'')+'">'+inner+'</div>';};
  var tints=[c.acc+'40',c.main+'22',c.main],fgs=[c.txt,c.txt,onC(c.main)];
  var g='<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;padding:10px;background:'+c.main+'12">';
  g+=t(6,c.bg,c.main,'<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap"><b style="font-family:\''+c.fh+'\'">'+pvLogo(c)+esc(c.name)+'</b><span style="display:flex;gap:8px;flex-wrap:wrap">'+pvLinks(c)+'</span></div>','padding:9px 12px');
  g+=t(6,c.heroBg,c.heroTxt,'<h1 style="font-family:\''+c.fh+'\';font-size:24px;line-height:1.1;margin:'+(14*c.sp)+'px 0 6px;color:inherit">'+esc(c.name)+'</h1><p style="margin:0 0 12px">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc)),'padding:'+(14*c.sp)+'px 14px');
  c.svc.forEach(function(s,i){g+=t(2,tints[i],fgs[i],'<b style="font-family:\''+c.fh+'\';display:block;margin-bottom:3px">'+s[0]+'</b>'+s[1]);});
  var spans=[4,2,2,4];c.gal.slice(0,4).forEach(function(x,i){g+='<div style="grid-column:span '+spans[i]+';aspect-ratio:'+(spans[i]===4?'2/1':'1/1')+';border-radius:'+c.big+';'+pvTile(c,x)+'"></div>';});
  g+=t(6,c.acc+'33',c.txt,pvH(c,'Contact','left',c.main)+pvForm(c,'left',300));
  g+=t(6,'transparent',c.txt,'&copy; '+new Date().getFullYear()+' '+esc(c.name),'font-size:9px;padding:2px 6px;opacity:.7');
  return g+'</div>';
}
function pvFull(c){
  var h='<div style="background:'+c.heroBg+';color:'+c.heroTxt+';min-height:250px;display:flex;flex-direction:column;justify-content:space-between">'+
    '<div class="p-nav" style="color:inherit"><div class="logo" style="font-family:\''+c.fh+'\'">'+pvLogo(c)+esc(c.name)+'</div><div class="links">'+pvLinks(c)+'</div></div>'+
    '<div style="padding:20px 16px '+(56*c.sp)+'px;text-align:center"><h1 style="font-family:\''+c.fh+'\';font-size:30px;line-height:1.05;margin:0 0 8px;color:inherit">'+esc(c.name)+'</h1><p style="margin:0 auto 12px;max-width:80%">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div></div>';
  h+='<div style="margin-top:-34px;padding:0 14px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;position:relative">'+c.svc.map(function(s){return '<div style="background:'+c.bg+';color:'+c.txt+';border-top:3px solid '+c.acc+';border-radius:'+c.rad+';padding:10px 8px;text-align:left;box-shadow:0 6px 16px rgba(0,0,0,.2)"><b style="font-family:\''+c.fh+'\';display:block;margin-bottom:3px">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+'</div>';
  if(c.gal.length){var n=Math.min(c.gal.length,4);h+='<div style="margin-top:18px;display:grid;grid-template-columns:repeat('+n+',1fr)">'+c.gal.slice(0,4).map(function(x){return '<div style="aspect-ratio:1/1;'+pvTile(c,x)+'"></div>';}).join('')+'</div>';}
  h+='<div style="margin-top:18px;background:'+c.main+'14;padding:'+(16*c.sp)+'px 16px;display:grid;grid-template-columns:1fr 1.2fr;gap:14px;text-align:left"><div>'+pvH(c,'Contact','left',c.main)+pvContactInfo(c)+'</div>'+pvForm(c,'left',300)+'</div>';
  return h+pvFoot(c);
}
function pvStory(c){
  var h=pvNav(c,c.bg,c.main,true);
  h+='<div style="padding:'+(20*c.sp)+'px 16px;text-align:left;background:'+c.main+'14"><h1 style="font-family:\''+c.fh+'\';font-size:24px;line-height:1.1;color:'+c.main+';margin:0 0 6px">'+esc(c.name)+'</h1><p style="margin:0 0 10px">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>';
  c.svc.forEach(function(s,i){
    var blk='<div style="aspect-ratio:4/3;border-radius:'+c.rad+';'+pvTile(c,c.gal[i])+'"></div>';
    var txt='<div><b style="font-family:\''+c.fh+'\';font-size:13px;color:'+c.main+'">'+s[0]+'</b><p style="margin:4px 0 0">'+s[1]+'</p></div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:center;padding:'+(10*c.sp)+'px 16px;text-align:left">'+(i%2?txt+blk:blk+txt)+'</div>';
  });
  if(c.gal.length>3)h+='<div style="padding:10px 16px">'+pvGal(c,3,c.gal.slice(3))+'</div>';
  h+='<div class="p-sec" style="padding:'+(16*c.sp)+'px 14px">'+pvH(c,'Contact')+pvForm(c,'center')+'</div>';
  return h+pvFoot(c);
}
function pvMinimal(c){
  var h='<div style="text-align:center;padding:16px 16px 8px"><div style="font-family:\''+c.fh+'\';font-weight:700;font-size:15px;color:'+c.main+'">'+pvLogo(c)+esc(c.name)+'</div><div style="display:flex;justify-content:center;gap:10px;margin-top:6px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;flex-wrap:wrap;color:'+c.main+'">'+pvLinks(c)+'</div></div>';
  h+='<div style="text-align:center;padding:'+(34*c.sp)+'px 24px"><h1 style="font-family:\''+c.fh+'\';font-size:28px;line-height:1.1;font-weight:500;margin:0 0 8px;color:'+c.main+'">'+esc(c.name)+'</h1><p style="margin:0 auto 14px;max-width:75%">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,'transparent',c.main,'border:2px solid '+c.main)+'</div>';
  h+='<div style="padding:4px 24px;text-align:center">'+c.svc.map(function(s){return '<div style="padding:10px 0"><div style="width:26px;height:2px;background:'+c.acc+';margin:0 auto 8px"></div><b style="font-family:\''+c.fh+'\'">'+s[0]+'</b><p style="margin:3px 0 0">'+s[1]+'</p></div>';}).join('')+'</div>';
  if(c.gal.length)h+='<div style="padding:12px 24px">'+pvGal(c,2)+'</div>';
  h+='<div class="p-sec" style="padding:'+(16*c.sp)+'px 24px">'+pvH(c,'Contact','center',c.main)+pvForm(c,'center')+'</div>';
  return h+'<div style="padding:14px;text-align:center;font-size:9px;opacity:.7">&copy; '+new Date().getFullYear()+' '+esc(c.name)+'</div>';
}
function pvMagazine(c){
  var h=pvNav(c,c.bg,c.main,true);
  h+='<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:8px;padding:10px"><div style="background:'+c.heroBg+';color:'+c.heroTxt+';border-radius:'+c.rad+';padding:'+(24*c.sp)+'px 14px;display:flex;flex-direction:column;justify-content:flex-end;text-align:left;min-height:190px"><h1 style="font-family:\''+c.fh+'\';font-size:24px;line-height:1.1;margin:0 0 6px;color:inherit">'+esc(c.name)+'</h1><p style="margin:0 0 10px">'+esc(c.line)+'</p><div>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div></div>'+
    '<div style="display:flex;flex-direction:column;gap:8px">'+c.svc.map(function(s,i){return '<div style="flex:1;background:'+(i===1?c.main+'22':c.acc+'40')+';color:'+c.txt+';border-radius:'+c.rad+';padding:8px;text-align:left"><b style="font-family:\''+c.fh+'\';display:block">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+'</div></div>';
  if(c.gal.length)h+='<div style="padding:4px 10px 10px">'+pvGal(c,3)+'</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1.2fr;gap:14px;padding:'+(16*c.sp)+'px 16px;text-align:left">'+'<div>'+pvH(c,'Contact','left',c.main)+pvContactInfo(c)+'</div>'+pvForm(c,'left',300)+'</div>';
  return h+pvFoot(c);
}
function pvFloat(c){
  var h=pvNav(c,c.bg,c.main,true);
  h+='<div style="background:'+c.heroBg+';height:'+(130*c.sp)+'px"></div>';
  h+='<div style="margin:-62px auto 0;width:80%;background:'+c.bg+';color:'+c.txt+';border-radius:'+c.big+';box-shadow:0 8px 24px rgba(0,0,0,.18);padding:'+(18*c.sp)+'px 14px;text-align:center;position:relative"><h1 style="font-family:\''+c.fh+'\';font-size:24px;line-height:1.1;margin:0 0 6px;color:'+c.main+'">'+esc(c.name)+'</h1><p style="margin:0 0 10px">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>';
  h+='<div class="p-sec" style="padding:'+(18*c.sp)+'px 14px">'+pvH(c,'Our Services','center',c.main)+pvSvcCards(c)+'</div>';
  if(c.gal.length)h+='<div style="padding:0 14px 14px">'+pvGal(c,3)+'</div>';
  h+='<div class="p-sec" style="padding:'+(14*c.sp)+'px 14px">'+pvH(c,'Contact','center',c.main)+pvForm(c,'center')+'</div>';
  return h+pvFoot(c);
}
function pvDiagonal(c){
  var h=pvNav(c,c.bg,c.main,false);
  h+='<div style="background:'+c.heroBg+';color:'+c.heroTxt+';clip-path:polygon(0 0,100% 0,100% 84%,0 100%);padding:'+(32*c.sp)+'px 16px '+(58*c.sp)+'px;text-align:left"><h1 style="font-family:\''+c.fh+'\';font-size:28px;line-height:1.05;margin:0 0 8px;color:inherit">'+esc(c.name)+'</h1><p style="margin:0 0 12px;max-width:70%">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>';
  h+='<div style="padding:4px 14px 14px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center">'+c.svc.map(function(s){return '<div><div style="width:28px;height:28px;border-radius:50%;background:'+c.acc+';color:'+onC(c.acc)+';display:grid;place-items:center;margin:0 auto 6px;font-weight:700;font-family:\''+c.fh+'\'">'+s[0].charAt(0)+'</div><b style="font-family:\''+c.fh+'\';display:block;margin-bottom:3px">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+'</div>';
  if(c.gal.length)h+='<div style="padding:0 14px 14px">'+pvGal(c,3)+'</div>';
  h+='<div class="p-sec" style="padding:'+(14*c.sp)+'px 14px">'+pvH(c,'Contact','center',c.main)+pvForm(c,'center')+'</div>';
  return h+pvFoot(c);
}
function pvBands(c){
  var h='<div class="p-nav" style="background:'+c.main+';color:'+onC(c.main)+'"><div class="logo" style="font-family:\''+c.fh+'\'">'+pvLogo(c)+esc(c.name)+'</div><div class="links">'+pvLinks(c)+'</div></div>';
  h+='<div style="padding:'+(28*c.sp)+'px 16px;text-align:left"><h1 style="font-family:\''+c.fh+'\';font-size:26px;line-height:1.1;margin:0 0 8px;color:'+c.main+'">'+esc(c.name)+'</h1><p style="margin:0 0 12px;max-width:75%">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>';
  h+='<div style="background:'+c.main+';color:'+onC(c.main)+';padding:'+(18*c.sp)+'px 16px;text-align:left">'+pvH(c,'Our Services','left','inherit')+'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+c.svc.map(function(s){return '<div style="background:'+c.bg+';color:'+c.txt+';border-radius:'+c.rad+';padding:9px 8px"><b style="font-family:\''+c.fh+'\';display:block;margin-bottom:3px;color:'+c.main+'">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+'</div></div>';
  if(c.gal.length)h+='<div style="background:'+c.acc+'33;padding:'+(16*c.sp)+'px 16px;text-align:left">'+pvH(c,'Gallery','left',c.main)+pvGal(c,3)+'</div>';
  h+='<div style="padding:'+(18*c.sp)+'px 16px;text-align:left">'+pvH(c,'Contact','left',c.main)+pvForm(c,'left',300)+'</div>';
  return h+pvFoot(c);
}
function pvArch(c){
  var h=pvNav(c,c.bg,c.main,true);
  h+='<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:16px;align-items:center;padding:'+(22*c.sp)+'px 16px;text-align:left"><div><h1 style="font-family:\''+c.fh+'\';font-size:24px;line-height:1.1;color:'+c.main+';margin:0 0 8px">'+esc(c.name)+'</h1><p style="margin:0 0 12px">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc),'border-radius:999px')+'</div>'+
    '<div style="aspect-ratio:3/4;border-radius:999px 999px '+c.big+' '+c.big+';background:'+(c.hero?'url('+c.hero+') center/cover':c.acc+'66')+'"></div></div>';
  h+='<div class="p-sec" style="padding:'+(10*c.sp)+'px 16px">'+pvH(c,'Our Services','center',c.main)+'<div class="p-cards">'+c.svc.map(function(s){return '<div style="background:'+c.main+'14;border-radius:'+c.big+';padding:14px 10px;text-align:center"><b style="font-family:\''+c.fh+'\';display:block;margin-bottom:3px">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+'</div></div>';
  if(c.gal.length)h+='<div style="padding:0 16px 14px">'+pvGal(c,3)+'</div>';
  h+='<div class="p-sec" style="padding:'+(14*c.sp)+'px 16px">'+pvH(c,'Contact','center',c.main)+pvForm(c,'center')+'</div>';
  return h+pvFoot(c);
}
function pvMosaic(c){
  var h=pvNav(c,c.bg,c.main,true);
  h+='<div style="display:grid;grid-template-columns:1.3fr 1fr;grid-template-rows:1fr 1fr;gap:6px;padding:10px;height:'+(190*c.sp)+'px"><div style="grid-row:span 2;background:'+c.heroBg+';color:'+c.heroTxt+';border-radius:'+c.rad+';padding:12px;display:flex;flex-direction:column;justify-content:flex-end;text-align:left"><h1 style="font-family:\''+c.fh+'\';font-size:22px;line-height:1.1;margin:0 0 6px;color:inherit">'+esc(c.name)+'</h1><p style="margin:0 0 8px">'+esc(c.line)+'</p><div>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div></div>'+
    [0,1].map(function(i){return '<div style="border-radius:'+c.rad+';'+pvTile(c,c.gal[i])+'"></div>';}).join('')+'</div>';
  h+='<div style="padding:'+(10*c.sp)+'px 16px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:left">'+c.svc.map(function(s){return '<div style="border-top:2px solid '+c.main+';padding-top:6px"><b style="font-family:\''+c.fh+'\';display:block;margin-bottom:3px;color:'+c.main+'">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+'</div>';
  if(c.gal.length>2)h+='<div style="padding:4px 16px 12px">'+pvGal(c,3,c.gal.slice(2))+'</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1.2fr;gap:14px;padding:'+(14*c.sp)+'px 16px;text-align:left">'+'<div>'+pvH(c,'Contact','left',c.main)+pvContactInfo(c)+'</div>'+pvForm(c,'left',300)+'</div>';
  return h+pvFoot(c);
}
/* ---------- 2026 layouts (added) ---------- */
function pvSaas(c){
  var h=pvNav(c,c.bg,c.main,true);
  h+='<div style="padding:'+(24*c.sp)+'px 16px 10px;text-align:center"><span style="display:inline-block;font-size:8px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;padding:3px 9px;border-radius:999px;background:'+c.acc+'33;color:'+c.main+';margin-bottom:8px">'+esc(c.type||'Welcome')+'</span>'+
    '<h1 style="font-family:\''+c.fh+'\';font-size:28px;line-height:1.05;color:'+c.main+';margin:0 0 8px;letter-spacing:-.02em">'+esc(c.name)+'</h1><p style="margin:0 auto 12px;max-width:80%">'+esc(c.line)+'</p>'+
    pvBtn(c,c.btn,c.acc,onC(c.acc))+' '+pvBtn(c,'Learn more','transparent',c.main,'border:1.5px solid '+c.main)+'</div>';
  h+='<div style="margin:6px 16px 0;border:1px solid rgba(127,127,127,.35);border-radius:'+c.big+';overflow:hidden;box-shadow:0 10px 26px rgba(0,0,0,.16)"><div style="display:flex;gap:4px;padding:6px 8px;background:rgba(127,127,127,.15)"><i style="width:6px;height:6px;border-radius:50%;background:#e66"></i><i style="width:6px;height:6px;border-radius:50%;background:#eb4"></i><i style="width:6px;height:6px;border-radius:50%;background:#5b5"></i></div><div style="aspect-ratio:16/9;'+(c.hero?'background:url('+c.hero+') center/cover':'background:linear-gradient(135deg,'+c.main+','+c.acc+')')+'"></div></div>';
  h+='<div style="padding:'+(18*c.sp)+'px 16px 6px">'+pvH(c,'Features','center',c.main)+'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:left">'+c.svc.map(function(s){return '<div style="background:'+c.main+'10;border-radius:'+c.big+';padding:10px 8px"><div style="width:20px;height:20px;border-radius:'+c.rad+';background:'+c.acc+';color:'+onC(c.acc)+';display:grid;place-items:center;font-weight:700;font-size:10px;margin-bottom:6px">'+s[0].charAt(0)+'</div><b style="font-family:\''+c.fh+'\';display:block;margin-bottom:3px">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+'</div></div>';
  h+='<div style="margin:12px 16px;background:'+c.main+';color:'+onC(c.main)+';border-radius:'+c.big+';padding:'+(16*c.sp)+'px 12px;text-align:center"><b style="font-family:\''+c.fh+'\';font-size:15px;display:block;margin-bottom:8px;color:inherit">Ready to get started?</b>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>';
  if(c.gal.length)h+='<div style="padding:0 16px 12px">'+pvGal(c,3)+'</div>';
  h+='<div class="p-sec" style="padding:'+(12*c.sp)+'px 16px">'+pvH(c,'Contact','center',c.main)+pvForm(c,'center')+'</div>';
  return h+pvFoot(c);
}
function pvGlass(c){
  var navLinks=c.pages.slice(0,4).map(function(p){return '<span>'+esc(p)+'</span>';}).join('');
  var h='<div style="background:'+(c.hero?'linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)),url('+c.hero+') center/cover':'linear-gradient(160deg,'+c.main+' 0%,'+c.acc+' 140%)')+';color:'+(c.hero?'#fff':onC(c.main))+';padding:10px 10px '+(36*c.sp)+'px">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 8px 6px 12px;border-radius:999px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);backdrop-filter:blur(8px);font-size:9px"><b style="font-family:\''+c.fh+'\';font-size:11px">'+pvLogo(c)+esc(c.name)+'</b><span style="display:flex;gap:8px">'+navLinks+'</span>'+pvBtn(c,c.btn,c.acc,onC(c.acc),'border-radius:999px;padding:4px 10px;font-size:9px')+'</div>'+
    '<div style="text-align:center;padding:'+(30*c.sp)+'px 8px 0"><h1 style="font-family:\''+c.fh+'\';font-size:28px;line-height:1.05;margin:0 0 8px;color:inherit">'+esc(c.name)+'</h1><p style="margin:0 auto 12px;max-width:80%">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc),'border-radius:999px')+'</div></div>';
  h+='<div style="margin:-18px 12px 0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;position:relative">'+c.svc.map(function(s){return '<div style="background:'+c.bg+'ee;color:'+c.txt+';border:1px solid rgba(127,127,127,.25);border-radius:'+c.big+';padding:10px 8px;box-shadow:0 8px 20px rgba(0,0,0,.14);text-align:left"><b style="font-family:\''+c.fh+'\';display:block;margin-bottom:3px;color:'+c.main+'">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+'</div>';
  if(c.gal.length)h+='<div style="padding:'+(14*c.sp)+'px 12px 0">'+pvGal(c,3)+'</div>';
  h+='<div class="p-sec" style="padding:'+(16*c.sp)+'px 14px">'+pvH(c,'Contact','center',c.main)+pvForm(c,'center')+'</div>';
  return '<div>'+h+pvFoot(c)+'</div>';
}
function pvBrutal(c){
  var bd='2.5px solid '+c.txt,sh=function(col){return 'box-shadow:4px 4px 0 '+col+';';};
  var h='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 12px;border-bottom:'+bd+';background:'+c.acc+';color:'+onC(c.acc)+'"><b style="font-family:\''+c.fh+'\';text-transform:uppercase">'+pvLogo(c)+esc(c.name)+'</b><span style="display:flex;gap:8px;font-weight:700;text-transform:uppercase;font-size:8px">'+pvLinks(c)+'</span></div>';
  h+='<div style="padding:'+(24*c.sp)+'px 14px;text-align:left"><h1 style="font-family:\''+c.fh+'\';font-size:34px;line-height:.95;text-transform:uppercase;margin:0 0 10px;color:'+c.txt+'"><span style="background:'+c.acc+';color:'+onC(c.acc)+';padding:0 4px">'+esc(c.name)+'</span></h1><p style="margin:0 0 12px;max-width:85%;font-weight:600">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.main,onC(c.main),'border:'+bd+';'+sh(c.txt)+'border-radius:0')+'</div>';
  h+='<div style="padding:4px 14px 14px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:left">'+c.svc.map(function(s,i){return '<div style="background:'+[c.acc,c.muted,c.main+'33'][i]+';color:'+(i===0?onC(c.acc):c.txt)+';border:'+bd+';'+sh(c.txt)+'padding:9px 8px"><b style="font-family:\''+c.fh+'\';display:block;margin-bottom:3px;text-transform:uppercase">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+'</div>';
  if(c.gal.length)h+='<div style="padding:0 14px 14px;display:grid;grid-template-columns:repeat(2,1fr);gap:10px">'+c.gal.slice(0,4).map(function(x){return '<div style="aspect-ratio:4/3;border:'+bd+';'+sh(c.txt)+pvTile(c,x)+'"></div>';}).join('')+'</div>';
  h+='<div style="margin:0 14px 14px;border:'+bd+';'+sh(c.txt)+'background:'+c.muted+';padding:'+(12*c.sp)+'px 12px;text-align:left">'+pvH(c,'Contact','left',c.txt)+pvForm(c,'left',300)+'</div>';
  return h+'<div style="background:'+c.txt+';color:'+c.bg+';padding:12px;text-align:center;font-weight:700;text-transform:uppercase;font-size:9px">&copy; '+new Date().getFullYear()+' '+esc(c.name)+'</div>';
}
function pvSteps(c){
  var h=pvNav(c,c.bg,c.main,true);
  h+='<div style="padding:'+(26*c.sp)+'px 16px;text-align:left;background:'+c.main+'10"><h1 style="font-family:\''+c.fh+'\';font-size:26px;line-height:1.08;color:'+c.main+';margin:0 0 8px">'+esc(c.name)+'</h1><p style="margin:0 0 12px;max-width:80%">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>';
  h+='<div style="padding:'+(16*c.sp)+'px 16px;text-align:left">'+pvH(c,'How it works','left',c.main)+c.svc.map(function(s,i){return '<div style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid rgba(127,127,127,.25)"><span style="flex:none;font-family:\''+c.fh+'\';font-size:20px;font-weight:700;color:'+c.acc+';width:28px;line-height:1">0'+(i+1)+'</span><div><b style="font-family:\''+c.fh+'\'">'+s[0]+'</b><br>'+s[1]+'</div></div>';}).join('')+'</div>';
  if(c.gal.length)h+='<div style="padding:0 16px 14px">'+pvGal(c,3)+'</div>';
  h+='<div style="margin:0 16px 14px;background:'+c.main+';color:'+onC(c.main)+';border-radius:'+c.big+';padding:'+(14*c.sp)+'px 12px;text-align:center"><b style="font-family:\''+c.fh+'\';display:block;margin-bottom:8px;font-size:14px;color:inherit">Let\'s start</b>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>';
  h+='<div class="p-sec" style="padding:'+(10*c.sp)+'px 16px">'+pvH(c,'Contact','center',c.main)+pvForm(c,'center')+'</div>';
  return h+pvFoot(c);
}
function pvPortfolio(c){
  var h=pvNav(c,c.bg,c.main,false);
  h+='<div style="padding:'+(18*c.sp)+'px 16px 10px;text-align:left"><h1 style="font-family:\''+c.fh+'\';font-size:24px;line-height:1.1;color:'+c.main+';margin:0 0 6px">'+esc(c.name)+'</h1><p style="margin:0 0 8px;max-width:80%">'+esc(c.line)+'</p></div>';
  var items=c.svc.map(function(s,i){return '<div><div style="aspect-ratio:'+(i===0?'16/9':'4/3')+';border-radius:'+c.rad+';'+pvTile(c,c.gal[i])+(i===0?';grid-column:span 2':'')+'"></div><div style="padding:5px 1px;text-align:left"><b style="font-family:\''+c.fh+'\';color:'+c.main+'">'+s[0]+'</b><div style="opacity:.75;font-size:9px">'+s[1]+'</div></div></div>';});
  h+='<div style="padding:0 16px;display:grid;grid-template-columns:1fr 1fr;gap:8px 8px"><div style="grid-column:span 2">'+items[0]+'</div>'+items[1]+items[2]+'</div>';
  if(c.gal.length>3)h+='<div style="padding:8px 16px 0">'+pvGal(c,3,c.gal.slice(3))+'</div>';
  h+='<div style="padding:'+(14*c.sp)+'px 16px;text-align:left">'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>';
  h+='<div style="padding:'+(10*c.sp)+'px 16px;text-align:left;border-top:1px solid rgba(127,127,127,.25)">'+pvH(c,'Contact','left',c.main)+pvForm(c,'left',300)+'</div>';
  return h+pvFoot(c,'left');
}
function pvSticky(c){
  var h=pvNav(c,c.bg,c.main,true);
  var left='<div style="text-align:left;position:sticky;top:8px;align-self:start"><h1 style="font-family:\''+c.fh+'\';font-size:22px;line-height:1.08;color:'+c.main+';margin:0 0 8px">'+esc(c.name)+'</h1><p style="margin:0 0 10px">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>';
  var right='<div style="display:flex;flex-direction:column;gap:8px">'+c.svc.map(function(s,i){return '<div style="background:'+(i%2?c.main+'12':c.acc+'33')+';border-radius:'+c.big+';padding:'+(14*c.sp)+'px 10px;text-align:left"><b style="font-family:\''+c.fh+'\';display:block;margin-bottom:3px;color:'+c.main+'">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+(c.gal.length?'<div style="aspect-ratio:4/3;border-radius:'+c.big+';'+pvTile(c,c.gal[0])+'"></div>':'')+'</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1.25fr;gap:14px;padding:'+(20*c.sp)+'px 16px">'+left+right+'</div>';
  h+='<div style="padding:'+(14*c.sp)+'px 16px;text-align:left;border-top:1px solid rgba(127,127,127,.25)">'+pvH(c,'Contact','left',c.main)+pvForm(c,'left',300)+'</div>';
  return h+pvFoot(c);
}
function pvBanner(c){
  var h='<div style="background:'+c.acc+';color:'+onC(c.acc)+';text-align:center;padding:5px 8px;font-size:9px;font-weight:700">'+(S.phone?'Call us: '+esc(S.phone):'Welcome to '+esc(c.name))+' &rarr;</div>';
  h+=pvNav(c,c.bg,c.main,true);
  h+='<div style="padding:'+(22*c.sp)+'px 16px 10px;text-align:center"><h1 style="font-family:\''+c.fh+'\';font-size:26px;line-height:1.08;color:'+c.main+';margin:0 0 8px">'+esc(c.name)+'</h1><p style="margin:0 auto 12px;max-width:80%">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>';
  h+='<div style="margin:6px 14px 0;aspect-ratio:21/9;border-radius:'+c.big+';background:'+(c.hero?'url('+c.hero+') center/cover':c.main)+'"></div>';
  h+='<div style="padding:'+(16*c.sp)+'px 14px">'+pvH(c,'What we offer','center',c.main)+'<div class="p-cards">'+c.svc.map(function(s){return '<div style="text-align:center;padding:6px 4px"><div style="width:30px;height:30px;border-radius:50%;background:'+c.main+'18;color:'+c.main+';display:grid;place-items:center;margin:0 auto 6px;font-weight:700;font-family:\''+c.fh+'\'">'+s[0].charAt(0)+'</div><b style="font-family:\''+c.fh+'\';display:block;margin-bottom:3px">'+s[0]+'</b>'+s[1]+'</div>';}).join('')+'</div></div>';
  if(c.gal.length)h+='<div style="padding:0 14px 14px">'+pvGal(c,3)+'</div>';
  h+='<div class="p-sec" style="padding:'+(12*c.sp)+'px 14px">'+pvH(c,'Contact','center',c.main)+pvForm(c,'center')+'</div>';
  return h+pvFoot(c);
}
function pvCarousel(c){
  var h=pvNav(c,c.bg,c.main,true);
  h+='<div style="padding:'+(24*c.sp)+'px 16px 10px;text-align:left"><h1 style="font-family:\''+c.fh+'\';font-size:26px;line-height:1.08;color:'+c.main+';margin:0 0 8px">'+esc(c.name)+'</h1><p style="margin:0 0 12px;max-width:80%">'+esc(c.line)+'</p>'+pvBtn(c,c.btn,c.acc,onC(c.acc))+'</div>';
  var cards=c.svc.map(function(s,i){return '<div style="flex:none;width:62%;scroll-snap-align:start;background:'+c.muted+';border-radius:'+c.big+';overflow:hidden;text-align:left"><div style="aspect-ratio:16/10;'+pvTile(c,c.gal[i])+'"></div><div style="padding:8px"><b style="font-family:\''+c.fh+'\';display:block;margin-bottom:3px;color:'+c.main+'">'+s[0]+'</b>'+s[1]+'</div></div>';}).join('');
  h+='<div style="padding:'+(8*c.sp)+'px 0 0 16px;text-align:left"><div style="display:flex;justify-content:space-between;align-items:center;padding-right:16px">'+pvH(c,'Our Services','left',c.main)+'<span style="font-size:11px;color:'+c.main+';margin-bottom:10px">&larr; &rarr;</span></div><div style="display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 16px 8px 0">'+cards+'</div></div>';
  if(c.gal.length>3)h+='<div style="padding:8px 16px 0">'+pvGal(c,3,c.gal.slice(3))+'</div>';
  h+='<div class="p-sec" style="padding:'+(14*c.sp)+'px 16px">'+pvH(c,'Contact','center',c.main)+pvForm(c,'center')+'</div>';
  return h+pvFoot(c);
}
function render(){
  var c=pvCtx();
  var fn={classic:pvClassic,split:pvSplit,sidebar:pvSidebar,editorial:pvEditorial,bento:pvBento,fullhero:pvFull,story:pvStory,minimal:pvMinimal,magazine:pvMagazine,float:pvFloat,diagonal:pvDiagonal,bands:pvBands,arch:pvArch,mosaic:pvMosaic,saas:pvSaas,glass:pvGlass,brutal:pvBrutal,steps:pvSteps,portfolio:pvPortfolio,sticky:pvSticky,banner:pvBanner,carousel:pvCarousel}[S.layout]||pvClassic;
  $('#pv').innerHTML='<div style="background:'+c.bg+';color:'+c.txt+';font-family:\''+c.fb+'\',sans-serif;min-height:100%">'+fn(c)+'</div>';
}

/* ---------- layout picker ---------- */
function wire(id){
  var R=function(x,y,w,h,f){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="1.5" fill="'+(f?'var(--brand)':'currentColor')+'" opacity="'+(f?'.9':'.3')+'"/>';};
  var p={
    saas:[R(4,4,72,4),R(28,11,24,3,1),R(18,16,44,5,1),R(26,24,12,4,1),R(42,24,12,4,1),R(10,31,60,12,1),R(4,47,22,9),R(29,47,22,9),R(54,47,22,9)],
    glass:[R(0,0,80,32,1),R(8,3,64,6,1),R(22,15,36,5,1),R(32,23,16,4,1),R(6,30,20,14),R(30,30,20,14),R(54,30,20,14),R(4,50,72,6,1)],
    brutal:[R(0,0,80,7,1),R(4,11,52,8,1),R(4,22,34,3),R(4,29,16,6,1),R(4,40,22,14,1),R(29,40,22,14,1),R(54,40,22,14,1)],
    steps:[R(4,4,72,4),R(4,12,40,5,1),R(4,20,14,4,1),R(4,30,6,5,1),R(14,31,40,3),R(4,40,6,5,1),R(14,41,40,3),R(4,50,6,5,1),R(14,51,40,3)],
    portfolio:[R(4,4,72,3),R(4,10,30,4),R(4,17,72,18,1),R(4,38,35,14,1),R(41,38,35,14,1)],
    sticky:[R(4,4,72,4),R(4,13,26,5,1),R(4,21,20,3),R(4,27,12,5,1),R(36,12,40,12,1),R(36,27,40,12,1),R(36,42,40,12,1)],
    banner:[R(0,0,80,3,1),R(4,6,72,4),R(24,14,32,5,1),R(32,22,16,4,1),R(4,29,72,13,1),R(8,46,16,9),R(32,46,16,9),R(56,46,16,9)],
    carousel:[R(4,4,72,4),R(4,12,36,5,1),R(4,20,16,4,1),R(4,30,34,22,1),R(42,30,34,22,1),R(68,30,12,22,1)],
    classic:[R(4,4,72,5),R(4,12,72,18,1),R(4,34,22,14),R(29,34,22,14),R(54,34,22,14),R(4,52,72,4,1)],
    split:[R(4,4,72,5),R(4,14,30,4),R(4,21,24,3),R(4,27,12,5,1),R(42,12,34,22,1),R(4,40,72,4),R(4,47,72,4),R(4,54,72,3)],
    sidebar:[R(4,4,16,52,1),R(24,6,40,6),R(24,15,30,3),R(24,21,14,5,1),R(24,30,52,10),R(24,43,52,12)],
    editorial:[R(4,4,72,2),R(4,10,64,9,1),R(4,22,44,9,1),R(4,35,72,1),R(4,40,72,3),R(4,46,72,3),R(4,52,72,3)],
    bento:[R(4,4,44,26,1),R(52,4,24,12),R(52,18,24,12),R(4,34,24,22),R(32,34,44,10),R(32,46,44,10)],
    fullhero:[R(0,0,80,34,1),R(8,28,20,16),R(30,28,20,16),R(52,28,20,16),R(4,50,72,6,1)],
    minimal:[R(28,4,24,4,1),R(14,11,52,2),R(16,20,48,6,1),R(30,30,20,5,1),R(20,40,40,3),R(20,46,40,3),R(24,52,32,3)],
    magazine:[R(4,4,72,4),R(4,11,44,30,1),R(52,11,24,9),R(52,22,24,9),R(52,33,24,8),R(4,45,22,10),R(29,45,22,10),R(54,45,22,10)],
    float:[R(0,0,80,26,1),R(14,16,52,22),R(6,42,20,12),R(30,42,20,12),R(54,42,20,12)],
    diagonal:['<polygon points="0,0 80,0 80,24 0,34" fill="var(--brand)" opacity=".9"/>',R(8,40,18,12),R(31,40,18,12),R(54,40,18,12)],
    bands:[R(0,0,80,7,1),R(4,11,40,4),R(4,17,24,3),R(0,24,80,16,1),R(4,43,72,4),R(4,50,72,6,1)],
    arch:[R(4,4,72,4),R(4,14,30,4),R(4,21,24,3),R(4,28,12,5,1),'<path d="M46 40 V22 a15 15 0 0 1 30 0 V40 Z" fill="var(--brand)" opacity=".9"/>',R(4,46,22,10),R(29,46,22,10),R(54,46,22,10)],
    mosaic:[R(4,4,72,4),R(4,12,34,32,1),R(42,12,34,15),R(42,29,34,15),R(4,48,22,8),R(29,48,22,8),R(54,48,22,8)],
    story:[R(4,4,72,8,1),R(4,16,30,14,1),R(40,19,36,3),R(40,25,28,3),R(4,36,34,3),R(4,42,26,3),R(44,34,32,14,1),R(4,52,72,4,1)]
  }[id]||[];
  return '<svg viewBox="0 0 80 60" width="100%" aria-hidden="true">'+p.join('')+'</svg>';
}
function buildLayouts(){
  var b=$('#layouts');if(!b)return;
  b.innerHTML=LAYOUTS.map(function(l){return '<button type="button" class="lay" data-l="'+l.id+'">'+wire(l.id)+'<b>'+l.name+'</b><small>'+l.note+'</small></button>';}).join('')+'<button type="button" class="lay" data-l="__rand"><span class="dice" aria-hidden="true">?</span><b>Surprise me</b><small>Pick a different layout</small></button>';
  b.onclick=function(e){var t=e.target;while(t&&t!==b&&!(t.dataset&&t.dataset.l))t=t.parentNode;if(!t||t===b)return;
    S.layout=t.dataset.l==='__rand'?randLayout(S.layout):t.dataset.l;onChange();toast('Layout: '+layoutById(S.layout).name);};
}
function markLayouts(){$$('#layouts .lay').forEach(function(b){b.classList.toggle('sel',b.dataset.l===S.layout);});}

/* ---------- summary / prompt ---------- */
function summaryObj(){
  var o={};
  o[L.id]=S.id;o[L.client]=S.client;o[L.bizName]=S.bizName;o[L.desc]=S.desc.replace(/\n/g,' ');o[L.type]=S.type;o[L.goal]=S.goal;
  o[L.pages]=S.pages.join(', ');o[L.feel]=S.feel;o[L.layout]=(layoutById(S.layout)||LAYOUTS[0]).name;o[L.main]=S.main;o[L.accent]=S.accent;o[L.bg]=S.bg;o[L.text]=S.text||'Not given';o[L.muted]=S.muted||'Not given';
  o[L.fontH]=S.fontH;o[L.fontB]=S.fontB;
  o[L.logo]=S.files.logo||'Not provided';o[L.hero]=S.files.hero||'Not provided';
  var ph=[];for(var i=1;i<=S.nPhotos;i++)if(S.files['photo'+i])ph.push(S.files['photo'+i]);
  o[L.photos]=ph.length?ph.join(', '):'None';
  o[L.logoColors]=(S.logoColors&&S.logoColors.length)?S.logoColors.join(', '):'None';
  o[L.phone]=S.phone;o[L.address]=S.address;o[L.email]=S.email;o[L.whatsapp]=S.whatsapp||'No';
  o[L.features]=S.features.length?S.features.join(', '):'None';
  o[L.corrections]=S.corrections||'None';
  return o;
}
function summaryText(){var o=summaryObj();return Object.keys(o).map(function(k){return k+': '+o[k];}).join('\n');}
var PROMPT='You are a professional web designer and front-end developer. Build a complete, ready-to-use website for my client using the requirements below.\n\nREQUIREMENTS FROM THE CLIENT FORM:\n[PASTE SUMMARY HERE]\n\nCOLOUR PALETTE\n[PALETTE]\n\nPREMIUM DESIGN REQUIREMENTS\n1. Use the colours consistently across the logo, website, buttons, navigation, backgrounds, cards, icons and footer.\n2. Create a clean, premium and professional visual identity that feels custom-designed rather than like a generic AI template.\n3. Use strong typography, balanced spacing, clear visual hierarchy and a distinctive logo that remains recognizable at small sizes.\n4. Use the accent colour sparingly for important actions and visual details.\n5. Maintain excellent text contrast and accessibility.\n6. Avoid excessive gradients, too many colours, unnecessary animations, generic icons and cluttered layouts.\n7. Ensure the logo works on both light and dark backgrounds and remains recognizable in monochrome.\n8. Make the website fully responsive on mobile, tablet and desktop.\n9. Use the exact HEX colour codes provided. Do not introduce additional colours unless required for accessibility or functional states.\n10. Aim for a polished, cohesive result comparable to a carefully art-directed professional design studio.\nThe final result should feel intentional, distinctive, trustworthy and visually consistent.\n\nWHAT TO BUILD\nCreate a responsive website in plain HTML, CSS and JavaScript (no frameworks), as three files: index.html, style.css and script.js.\n\nThe layout must match the preview I showed the client. The layout style is named in the Layout line of the summary and is described here. Follow it exactly. Do not fall back to a generic template, because every client website must look different from the others.\n\n[LAYOUT DETAILS]\n\nEvery layout includes these parts, arranged as the layout describes: the menu with the logo (if provided), the business name and the pages the client chose; a hero with the business name, one short line from the business description and a button; a services section with three cards, with service names and short descriptions written from what the business does; a gallery only if photos are provided; a contact section with a form (name, phone, message), the address and phone if given, and a WhatsApp button if the client asked for one; and a footer with a copyright line and the business name.\n\nThe button text depends on the goal: "Call now" for phone calls, "Book now" for bookings, "Shop now" for selling, otherwise "Get in touch". If a hero photo is provided, use it with a dark overlay so the text stays readable. If not, use the main colour as the hero background. On phones, turn the menu into a hamburger button (for the sidebar layout, turn the sidebar into a top bar with a hamburger).\n\nDESIGN RULES\n- Use exactly the colours from the COLOUR PALETTE section above, as CSS variables at the top of style.css. Roles: Primary for the hero, menu text and footer. Secondary for the page background. Accent only for buttons, links and highlights. Muted surfaces for cards and light panels. A good ratio is about 60% background, 30% secondary surfaces and 10% accent. If a colour is not given, choose one that keeps the text easy to read. The Logo colours line lists the colours found in the client logo; keep the website consistent with it.\n- Use the heading font and the body font from the summary, loaded from Google Fonts. If the body font says "Not sure", use Inter.\n- Follow the "Overall feel" answer. Luxury and Classic mean sharp corners and more spacing. Friendly means very round corners. Modern means clean and simple.\n- Use lots of white space and consistent spacing, and no more than two fonts.\n- Use these image file names exactly: logo, hero, photo1, photo2, photo3, photo4, and any further photos, with the extensions listed in the summary. Put them in an images/ folder. Never use other stock photos. If a photo is missing, use a plain colour block instead.\n- It must look good and work on phones, tablets and laptops.\n\nEXTRA FEATURES\n- Add the features listed in the summary and skip the ones not listed.\n- The contact form must send its data to a Google Sheet. Write the form submit code in script.js using a placeholder called GOOGLE_SCRIPT_URL, and also give me the Google Apps Script code to paste into the sheet.\n- Add basic SEO: page title, meta description, and alt text for every image.\n- Apply every item written under "Corrections / changes requested" in the summary.\n\nOUTPUT\n1. Give me the full code of each file, one after the other, with the file name above each.\n2. Then give me short, simple steps to open the website on my computer and to put it online.\n3. Do not explain the code. Assume I do not know coding.';
function promptText(){return PROMPT.split('[PASTE SUMMARY HERE]').join(summaryText()).split('[LAYOUT DETAILS]').join(layoutSpec()).split('[PALETTE]').join(paletteText());}
function paletteText(){var n=function(c,f){return isHex(c)?c.toUpperCase():f;};return '- Primary: '+n(S.main,'not set')+'\n- Secondary (page background): '+n(S.bg,'not set')+'\n- Accent: '+n(S.accent,'not set')+'\n- Main text: '+(isHex(S.text)?S.text.toUpperCase():'choose a readable dark or light colour')+'\n- Muted surfaces: '+(isHex(S.muted)?S.muted.toUpperCase():'a very light tint of the secondary colour');}
function copy(t,msg){
  function done(){toast(msg);}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,fallback);}else fallback();
  function fallback(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');done();}catch(e){toast('Could not copy');}a.remove();}
}

/* ---------- apply values (import / sheet load) ---------- */
function applyFields(obj){
  var rev={};Object.keys(L).forEach(function(k){rev[L[k].toLowerCase()]=k;});
  var cnt=0;
  Object.keys(obj).forEach(function(label){
    var k=rev[label.trim().toLowerCase()];if(!k)return;var v=String(obj[label]==null?'':obj[label]).trim();cnt++;
    if(k==='pages'||k==='features'){S[k]=(v&&!/^none$/i.test(v))?v.split(',').map(function(x){return x.trim();}).filter(Boolean):[];}
    else if(k==='main'||k==='accent'||k==='bg'){if(v&&v[0]!=='#')v='#'+v;if(isHex(v))S[k]=v.toLowerCase();}
    else if(k==='muted'){if(v&&v[0]!=='#'&&/^[0-9a-f]{6}$/i.test(v))v='#'+v;if(isHex(v))S.muted=v.toLowerCase();}
    else if(k==='text'){if(v&&v[0]!=='#'&&/^[0-9a-f]{6}$/i.test(v))v='#'+v;S.text=isHex(v)?v.toLowerCase():'';}
    else if(k==='logo'||k==='hero'){if(!v||/not provided|none/i.test(v))delete S.files[k];else S.files[k]=v;}
    else if(k==='photos'){for(var i=1;i<=30;i++)delete S.files['photo'+i];
      if(v&&!/^none$/i.test(v)){v.split(',').forEach(function(f){f=f.trim();var m=f.match(/^(photo\d+)/i);if(m){S.files[m[1].toLowerCase()]=f;var n=parseInt(m[1].slice(5),10);if(n>S.nPhotos)S.nPhotos=n;}});}}
    else if(k==='layout'){var lm=LAYOUTS.filter(function(l){return l.name.toLowerCase()===v.toLowerCase()||l.id===v.toLowerCase();})[0];if(lm)S.layout=lm.id;}
    else if(k==='logoColors'){S.logoColors=(v&&!/^none$/i.test(v))?v.split(',').map(function(x){return x.trim().toLowerCase();}).filter(isHex):[];}
    else if(k==='whatsapp'){S.whatsapp=/^(no|none)$/i.test(v)?'':v;}
    else if(k==='corrections'){S.corrections=/^none$/i.test(v)?'':v;}
    else S[k]=v;
  });
  return cnt;
}
function parseText(t){
  var labels=Object.keys(L).map(function(k){return L[k];}),obj={},cur=null;
  t.split(/\r?\n/).forEach(function(line){
    var m=line.match(/^\s*([^:]+?)\s*:\s*(.*)$/),hit=null;
    if(m)labels.forEach(function(l){if(l.toLowerCase()===m[1].toLowerCase())hit=l;});
    if(hit){cur=hit;obj[cur]=m[2];}else if(cur&&line.trim()){obj[cur]+='\n'+line;}
  });
  return obj;
}

/* ---------- sheet sync ---------- */
function sheetUrl(){var v=($('#sheetUrl').value||'').trim();if(v)return v;return SCRIPT_URL.indexOf('PASTE_')===0?'':SCRIPT_URL;}
function saveSheet(){
  var u=sheetUrl();if(!u){toast('Paste your Google Sheet web app URL first (Google Sheet connection)');$('details').open=true;return;}
  if(!S.id){toast('Enter a Project name first');return;}
  /* every answer goes into its own column, so the sheet can be read and edited cell by cell; Summary keeps the full text */
  var o=summaryObj();o['Project name']=S.id;o['Corrections / changes requested']=S.corrections||'None';o['Summary']=summaryText();var body=JSON.stringify(o);
  toast('Saving...');
  function stamp(){var t=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});$$('.saveStat').forEach(function(x){x.textContent='Last saved to sheet at '+t;});}
  fetch(u,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:body}).then(function(r){return r.text();}).then(function(t){
    if(t.trim()==='ok'){knownId=normId(S.id);stamp();toast('Saved to your sheet');}
    else if(/<html|sign in|accounts\.google/i.test(t)){toast('Google blocked the save. In Apps Script set "Who has access" to Anyone, then Deploy a New version.');}
    else{toast('The script answered: '+t.replace(/<[^>]*>/g,' ').trim().slice(0,120));}
  }).catch(function(){
    fetch(u,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:body}).then(function(){toast('Sent, but I cannot confirm it. Check the Projects tab in your sheet, and the Executions page in Apps Script.');},function(){toast('Could not reach Google. Check the web app URL and your internet.');});
  });
}
var knownId='';
function normId(v){return String(v==null?'':v).trim().toLowerCase();}
/* After values are replaced from outside (Load from sheet, pasted changes), forget picture data that no longer belongs to its slot.
   A picture is kept only when the slot still has the same file name and we are still on the same client. */
function syncImages(prev,sameClient){
  var all={};Object.keys(IMG).concat(Object.keys(ORIG)).forEach(function(k){all[k]=1;});
  Object.keys(all).forEach(function(k){
    if(!(sameClient&&S.files[k]&&prev&&prev[k]===S.files[k])){delete IMG[k];delete ORIG[k];}
  });
}
/* Turns a sheet row into labelled values. The Summary text is the base; any cell that was changed by hand
   (it no longer matches the Summary) wins over it. Numbers that Sheets turned into digits (0987... -> 987...) do not count as a change. */
function sheetRowToFields(row){
  var obj=row['Summary']?parseText(String(row['Summary'])):{},canon={};
  Object.keys(L).forEach(function(k){canon[L[k].toLowerCase()]=L[k];});
  function same(a,b){a=String(a).trim();b=String(b).trim();if(a===b)return true;var n=/^[-+]?\d+(\.\d+)?$/;return n.test(a)&&n.test(b)&&Number(a)===Number(b);}
  Object.keys(row).forEach(function(h){
    var lab=canon[String(h).trim().toLowerCase()];if(!lab)return;
    var v=row[h];if(v===''||v==null||typeof v==='object')return;
    v=String(v);if(!(lab in obj)||!same(obj[lab],v))obj[lab]=v;
  });
  return obj;
}
function loadSheet(){
  var u=sheetUrl();if(!u){toast('Paste your Google Sheet web app URL first');$('details').open=true;return;}
  if(!S.id){toast('Type the Project name you want to load');return;}
  fetch(u+(u.indexOf('?')>-1?'&':'?')+'id='+encodeURIComponent(S.id)).then(function(r){return r.json();}).then(function(j){
    if(!j.found){toast('No client with that project name in the sheet');return;}
    var row=j.row,obj=sheetRowToFields(row),prev={},same=normId(S.id)===knownId;Object.keys(S.files).forEach(function(k){prev[k]=S.files[k];});
    if(!obj['Project name'])obj['Project name']=row['Project name'];applyFields(obj);syncImages(prev,same);knownId=normId(S.id);onChange();fill();toast('Loaded from sheet');
  }).catch(function(){toast('Could not read the sheet. Check the URL and that it allows "Anyone".');});
}

/* ---------- state plumbing ---------- */
var saveT;
function updSum(){var b=$('#sumBox');if(b)b.value=summaryText();}
function onChange(){render();updSum();markPals();markLayouts();clearTimeout(saveT);saveT=setTimeout(save,300);}
function fill(){
  $$('[data-k]').forEach(function(el){el.value=S[el.dataset.k]||'';});
  refreshChips();refreshColors();refreshFonts();buildPhotos();renderLogoPal();markLayouts();render();updSum();save();
}
function init(){
  try{$('#sheetUrl').value=localStorage.getItem('wp_url')||'';}catch(e){}
  buildChips();buildPals();buildLayouts();buildColors();buildFonts();
  $$('[data-k]').forEach(function(el){el.addEventListener('input',function(){S[el.dataset.k]=el.value;onChange();});});
  $('#sheetUrl').addEventListener('input',function(){try{localStorage.setItem('wp_url',this.value.trim());}catch(e){}});
  $$('.saveBtn').forEach(function(b){b.onclick=saveSheet;});$('#bSave').onclick=saveSheet;$('#bLoad').onclick=loadSheet;
  $('#bSummary').onclick=function(){$('#sumCard').scrollIntoView({behavior:'smooth'});copy(summaryText(),'Summary copied. It is also shown in the Summary box.');};
  $('#bSummary2').onclick=function(){var b=$('#sumBox');b.select();copy(summaryText(),'Summary copied');};
  $('#bPrompt2').onclick=function(){copy(promptText(),'AI prompt copied. Paste it into Claude or ChatGPT.');};
  $('#bPrompt').onclick=function(){copy(promptText(),'AI prompt copied. Paste it into Claude or ChatGPT.');};
  $('#bNew').onclick=function(){if(confirm('Start a new client? The form will be cleared (saved sheet rows stay safe).')){S=defaults();IMG={};ORIG={};knownId='';pickedLogoColor='';ST={};saveImgs();fill();window.scrollTo(0,0);}};
  $('#bImport').onclick=function(){var t=$('#importBox').value,prev={};Object.keys(S.files).forEach(function(k){prev[k]=S.files[k];});var n=applyFields(parseText(t));if(n){syncImages(prev,true);onChange();fill();$('#importBox').value='';toast('Updated '+n+' item(s). Tap Save to Sheet to store them.');}else toast('Nothing recognised. Use lines like "Main colour: #aa0000"');};
  $('#addPhoto').onclick=function(){S.nPhotos++;onChange();buildPhotos();};
  $('#dlPhotos').onclick=function(){var k=Object.keys(ORIG);if(!k.length){toast('Upload photos in this session first');return;}k.forEach(function(s,i){setTimeout(function(){var a=document.createElement('a');a.href=URL.createObjectURL(ORIG[s]);a.download=S.files[s]||s+'.jpg';document.body.appendChild(a);a.click();a.remove();},i*400);});};
  /* Restore after all page scripts have initialised the  */
  restoreDraft().then(function(record){
    var restored=applyDraftRecord(record);
    draftReady=true;
    fill();
    if(restored)toast('Your last local draft was restored');
  }).catch(function(){draftReady=true;fill();});
}
init();