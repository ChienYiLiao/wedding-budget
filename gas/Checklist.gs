// ===== Checklist 勾選狀態 + 日期 Override 讀寫 =====
// Sheet: "Checklist"
// 欄位: A=Key, B=Value(true/false), C=UpdatedAt, D=StartDate, E=EndDate, F=IsDateCustom

const CHECKLIST_SHEET = 'Checklist';

function getChecklist() {
  const sheet = _getOrCreateChecklistSheet();
  const rows = sheet.getDataRange().getValues();
  const done = {};
  const dates = {};
  rows.forEach(([key, value, , startDate, endDate, isCustom]) => {
    if (!key || key === 'Key') return;
    done[key] = value === true || value === 'true';
    if (isCustom === true || isCustom === 'true') {
      dates[key] = {
        startDate: startDate ? _formatDate(startDate) : '',
        endDate:   endDate   ? _formatDate(endDate)   : '',
      };
    }
  });
  return { ok: true, data: done, dates };
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
  sheet.appendRow([key, value, now]);
  return { ok: true };
}

function setChecklistDate(key, startDate, endDate) {
  if (!key) return { ok: false, error: 'missing key' };
  const sheet = _getOrCreateChecklistSheet();
  const rows = sheet.getDataRange().getValues();

  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === key) {
      sheet.getRange(i + 1, 4, 1, 3).setValues([[startDate || '', endDate || '', true]]);
      return { ok: true };
    }
  }
  // 該 key 尚無勾選記錄，新增一列
  sheet.appendRow([key, false, new Date(), startDate || '', endDate || '', true]);
  return { ok: true };
}

function resetChecklistDate(key) {
  if (!key) return { ok: false, error: 'missing key' };
  const sheet = _getOrCreateChecklistSheet();
  const rows = sheet.getDataRange().getValues();

  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === key) {
      sheet.getRange(i + 1, 4, 1, 3).setValues([['', '', false]]);
      return { ok: true };
    }
  }
  return { ok: true };
}

function _formatDate(d) {
  if (!d) return '';
  if (typeof d === 'string') return d;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function _getOrCreateChecklistSheet() {
  const ss = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
  );
  let sheet = ss.getSheetByName(CHECKLIST_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CHECKLIST_SHEET);
    sheet.appendRow(['Key', 'Value', 'UpdatedAt', 'StartDate', 'EndDate', 'IsDateCustom']);
  }
  return sheet;
}
