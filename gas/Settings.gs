// ===== 設定讀寫 =====

const SETTINGS_HEADERS = ['key', 'value', 'updatedAt'];
const DEFAULT_SETTINGS = {
  weddingDate: '',
  totalBudget: 0,
  gasVersion:  '1.0.0',
};

function getSettingsSheet() {
  return getSheet('Settings', SETTINGS_HEADERS);
}

function getSettings() {
  const sheet = getSettingsSheet();
  const rows = readAllRows(sheet);
  const result = { ...DEFAULT_SETTINGS };
  rows.forEach(r => {
    if (r.key in result) {
      result[r.key] = r.value;
    }
  });
  return { ok: true, settings: result };
}

function updateSettings(settingsPatch) {
  const sheet = getSettingsSheet();
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  Object.entries(settingsPatch).forEach(([key, value]) => {
    const updated = updateRow(sheet, SETTINGS_HEADERS, 'key', key, { value, updatedAt: now });
    if (!updated) {
      appendRow(sheet, SETTINGS_HEADERS, { key, value, updatedAt: now });
    }
  });
  return { ok: true };
}
