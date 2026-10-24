/* safety.js - checks everything that enters the app from outside (pasted text, sheet rows, restored drafts, cloud projects).
   Loads AFTER script.js. */
(function(){
function sanitizeState(){
  var str=function(v,n){return (typeof v==='string'?v:v==null?'':String(v)).slice(0,n);};
  var d=defaults();
  S.fontH=safeFont(S.fontH,d.fontH||'Poppins');
  S.fontB=(S.fontB==='Not sure')?'Not sure':safeFont(S.fontB,d.fontB||'Inter');
  ['main','accent','bg'].forEach(function(k){if(!isHex(S[k]))S[k]=d[k];});
  if(S.text&&!isHex(S.text))S.text='';
  if(!isHex(S.muted))S.muted=d.muted;
  ['id','client','bizName','type','goal','feel','phone','email','address','whatsapp'].forEach(function(k){if(k in S)S[k]=str(S[k],200);});
  ['desc','corrections'].forEach(function(k){if(k in S)S[k]=str(S[k],5000);});
  S.pages=(Array.isArray(S.pages)?S.pages:[]).map(function(x){return str(x,60).trim();}).filter(Boolean).slice(0,30);
  S.features=(Array.isArray(S.features)?S.features:[]).map(function(x){return str(x,80).trim();}).filter(Boolean).slice(0,40);
  S.logoColors=(Array.isArray(S.logoColors)?S.logoColors:[]).filter(isHex).slice(0,12);
  var ids=LAYOUTS.map(function(l){return l.id;});if(ids.indexOf(S.layout)<0)S.layout=d.layout;
  var files={};if(S.files&&typeof S.files==='object')Object.keys(S.files).forEach(function(k){
    if(/^(logo|hero|photo\d{1,2})$/.test(k)&&typeof S.files[k]==='string'&&/^[A-Za-z0-9._ -]{1,100}$/.test(S.files[k]))files[k]=S.files[k];});
  S.files=files;
  var n=parseInt(S.nPhotos,10);S.nPhotos=isFinite(n)?Math.max(0,Math.min(30,n)):d.nPhotos;
  return S;
}
var _afSafe=applyFields;applyFields=function(o){var n=_afSafe(o);sanitizeState();return n;};
var _adrSafe=applyDraftRecord;applyDraftRecord=function(r){var ok=_adrSafe(r);if(ok)sanitizeState();return ok;};
var _afSafe=applyFields;applyFields=function(o){var n=_afSafe(o);sanitizeState();return n;};
var _adrSafe=applyDraftRecord;applyDraftRecord=function(r){var ok=_adrSafe(r);if(ok)sanitizeState();return ok;};
window.sanitizeState=sanitizeState; /* also used by the cloud save/load code */
})();
