// ===== Checklist 勾選狀態讀寫 =====
// Sheet: "Checklist"
// 欄位: A=Key, B=Value(true/false), C=UpdatedAt

const CHECKLIST_SHEET = 'Checklist';

function getChecklist() {
  const sheet = _getOrCreateChecklistSheet();
  const rows = sheet.getDataRange().getValues();
  const result = {};
  rows.forEach(([key, value]) => {
    if (key) result[key] = value === true || value === 'true';
  });
  return { ok: true, data: result };
}

function setChecklistItem(key, value) {
  if (!key) return { ok: false, error: 'missing key' };
  const sheet = _getOrCreateChecklistSheet();
  const rows = sheet.getDataRange().getValues();
  const now = new Date();

  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === key) {
      sheet.getRange(i + 1, 2, 1, 2).setValues([[value, now]]);
      return { ok: true };
    }
  }
  // 找不到就新增一列
  sheet.appendRow([key, value, now]);
  return { ok: true };
}

function _getOrCreateChecklistSheet() {
  const ss = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
  );
  let sheet = ss.getSheetByName(CHECKLIST_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CHECKLIST_SHEET);
    sheet.appendRow(['Key', 'Value', 'UpdatedAt']);
  }
  return sheet;
}
