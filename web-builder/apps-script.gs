/*
  GOOGLE SHEET SETUP (one time, about 3 minutes)

  1. Open Google Sheets and create a new blank sheet. Name it "Client Projects".
     Copy its Sheet ID from the address bar. It is the long text between /d/ and /edit:
     https://docs.google.com/spreadsheets/d/THIS_PART_IS_THE_SHEET_ID/edit
  2. Paste the Sheet ID into SHEET_ID below (between the quotes).
     Then open Extensions > Apps Script in that sheet, or go to script.google.com.
  3. Delete everything in the editor and paste ALL of this file. Click Save.
  4. Click Deploy > New deployment.
       Type (gear icon): Web app
       Execute as: Me
       Who has access: Anyone
     Click Deploy and allow the permissions it asks for.
  5. Copy the Web app URL (it ends with /exec).
  6. Open script.js and paste that URL into SCRIPT_URL at the top of the file.
     (You can also paste it into the "Google Sheet connection" box in the planner.)

  After this, "Save to Sheet" adds or updates one row per Project name,
  and "Load from Sheet" brings that row back into the website.
  You can also edit the cells in the sheet, then press "Load from Sheet".
  If you change this code later, use Deploy > Manage deployments > Edit > New version.
*/

var SHEET_ID = '1CQ60wxQ_UVDt_nRTI4FrH8MiDBSK19yN5a6NhKYI9uE';
var TAB = 'Projects';

function getSheet_() {
  var ss = (SHEET_ID && SHEET_ID.indexOf('PASTE_') !== 0)
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(TAB) || ss.insertSheet(TAB);
}

function getHeaders_(sh) {
  if (sh.getLastRow() === 0 || sh.getLastColumn() === 0) return [];
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].filter(String);
}

// Column order in the sheet. Contact details come before the end, and Summary is always the last column.
var ORDER = ['Project name', 'Client name', 'Business name', 'Business description', 'Business type',
  'Main goal', 'Pages', 'Overall feel', 'Layout', 'Main colour', 'Accent colour', 'Background colour', 'Text colour',
  'Heading font', 'Body font', 'Logo', 'Hero photo', 'Photos', 'Logo colours',
  'Phone', 'Email', 'Address', 'WhatsApp',
  'Extra features', 'Colour set', 'Use only colour set', 'Custom design',
  'Corrections / changes requested', 'Updated', 'Summary'];

function buildHeaders_(old, data) {
  var extras = [];
  old.concat(Object.keys(data)).forEach(function (h) {
    if (ORDER.indexOf(h) === -1 && extras.indexOf(h) === -1) extras.push(h);
  });
  var base = ORDER.filter(function (h) { return h !== 'Updated' && h !== 'Summary'; });
  return base.concat(extras, ['Updated', 'Summary']);
}

function doPost(e) {
  if (!e || !e.postData) {
    return ContentService.createTextOutput('Nothing to save. Do not press Run on doPost. Use the Save to Sheet button on your website, or run testSave instead.');
  }
  var data = JSON.parse(e.postData.contents);
  data['Updated'] = new Date();
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = getSheet_();
    var old = getHeaders_(sh);
    var headers = buildHeaders_(old, data);

    // Read the existing rows by their old column names so nothing is lost when the order changes.
    var rows = [];
    if (old.length && sh.getLastRow() > 1) {
      rows = sh.getRange(2, 1, sh.getLastRow() - 1, old.length).getValues().map(function (r) {
        var o = {};
        old.forEach(function (h, i) { o[h] = r[i]; });
        return o;
      });
    }

    var id = String(data['Project name']).trim().toLowerCase();
    var found = -1;
    rows.forEach(function (o, i) {
      if (found < 0 && String(o['Project name']).trim().toLowerCase() === id) found = i;
    });
    if (found > -1) {
      Object.keys(data).forEach(function (k) { rows[found][k] = data[k]; });
    } else {
      rows.push(data);
    }

    sh.clearContents();
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    var out = rows.map(function (o) {
      return headers.map(function (h) { return o[h] === undefined ? '' : o[h]; });
    });
    if (out.length) {
      // Keep every answer as plain text (all columns except the last two: Updated and Summary),
      // otherwise Google Sheets turns a phone number like 0987654321 into the number 987654321.
      if (headers.length > 2) sh.getRange(2, 1, out.length, headers.length - 2).setNumberFormat('@');
      sh.getRange(2, 1, out.length, headers.length).setValues(out);
    }
    sh.setFrozenRows(1);
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput('ok');
}

function doGet(e) {
  var id = String((e && e.parameter && e.parameter.id) || '').trim().toLowerCase();
  var sh = getSheet_();
  var headers = getHeaders_(sh);
  var out = { found: false };
  var idCol = headers.indexOf('Project name');
  if (idCol > -1 && sh.getLastRow() > 1) {
    var vals = sh.getRange(2, 1, sh.getLastRow() - 1, headers.length).getValues();
    for (var i = 0; i < vals.length; i++) {
      if (String(vals[i][idCol]).trim().toLowerCase() === id) {
        var row = {};
        headers.forEach(function (h, c) { row[h] = vals[i][c]; });
        out = { found: true, row: row };
        break;
      }
    }
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/*
  TEST (optional): choose "testSave" in the function list at the top of the Apps Script
  editor and press Run. The first time, it asks you to allow access. Then check your sheet:
  you should see a "Projects" tab with one row named "Test client".
  You can delete that row afterwards.
*/
function testSave() {
  var fake = { postData: { contents: JSON.stringify({
    'Project name': 'Test client',
    'Client name': 'Test',
    'Business name': 'Test Business',
    'Phone': '9999999999',
    'Email': 'test@example.com',
    'Address': 'Test address',
    'Summary': 'Project name: Test client\nBusiness name: Test Business'
  }) } };
  doPost(fake);
}
