// ===== Google Sheets 操作封裝 =====

function getSheet(name, headers) {
  const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'));
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers) sheet.appendRow(headers);
  } else if (headers && sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else if (headers) {
    const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const match = headers.every((h, i) => existing[i] === h);
    if (!match) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

function readAllRows(sheet) {
  const last = sheet.getLastRow();
  if (last < 2) return [];
  const data = sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).getValues();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return data.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let v = row[i];
      if (v instanceof Date) v = Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      obj[h] = v;
    });
    return obj;
  });
}

function appendRow(sheet, headers, obj) {
  const row = headers.map(h => obj[h] !== undefined ? obj[h] : '');
  sheet.appendRow(row);
}

function updateRow(sheet, headers, colKey, keyVal, patch) {
  const keyCol = headers.indexOf(colKey) + 1;
  const last = sheet.getLastRow();
  if (last < 2) return false;
  const col = sheet.getRange(2, keyCol, last - 1, 1).getValues();
  for (let i = 0; i < col.length; i++) {
    if (String(col[i][0]) === String(keyVal)) {
      const rowNum = i + 2;
      Object.entries(patch).forEach(([k, v]) => {
        const c = headers.indexOf(k) + 1;
        if (c > 0) sheet.getRange(rowNum, c).setValue(v);
      });
      return true;
    }
  }
  return false;
}

function deleteRow(sheet, headers, colKey, keyVal) {
  const keyCol = headers.indexOf(colKey) + 1;
  const last = sheet.getLastRow();
  if (last < 2) return false;
  const col = sheet.getRange(2, keyCol, last - 1, 1).getValues();
  for (let i = col.length - 1; i >= 0; i--) {
    if (String(col[i][0]) === String(keyVal)) {
      sheet.deleteRow(i + 2);
      return true;
    }
  }
  return false;
}

function findRow(sheet, headers, colKey, keyVal) {
  const rows = readAllRows(sheet);
  return rows.find(r => String(r[colKey]) === String(keyVal)) || null;
}
