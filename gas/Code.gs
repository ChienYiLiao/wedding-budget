// ===== 婚禮記帳 GAS 後端 v1.0.0 =====
// 架構：GET ?action=... 讀取 / GET ?payload=JSON 寫入（避免 302 轉址時 POST→GET 問題）

function doGet(e) {
  // 寫入操作：GET + ?payload=JSON
  if (e.parameter && e.parameter.payload) {
    try {
      const body = JSON.parse(e.parameter.payload);
      return _handleAction(body);
    } catch (err) {
      return _jsonRes({ ok: false, error: 'payload parse error: ' + err.message });
    }
  }

  // 讀取操作：GET + ?action=...
  const action = e.parameter.action;
  try {
    switch (action) {
      case 'getDashboard':
        return _jsonRes(getDashboard());
      case 'getTransactions':
        return _jsonRes(getTransactions(e.parameter.yearMonth || ''));
      case 'getStats':
        return _jsonRes(getStats({
          yearMonth: e.parameter.yearMonth || _currentYearMonth(),
          startYM:   e.parameter.startYM   || '',
          endYM:     e.parameter.endYM     || '',
        }));
      case 'getSettings':
        return _jsonRes(getSettings());
      case 'getChecklist':
        return _jsonRes(getChecklist());
      default:
        return _jsonRes({ ok: false, error: `Unknown action: ${action}` });
    }
  } catch (err) {
    return _jsonRes({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    return _handleAction(body);
  } catch (err) {
    return _jsonRes({ ok: false, error: err.message });
  }
}

function _handleAction(body) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    switch (body.action) {
      case 'addTransaction':
        return _jsonRes(addTransaction(body.txn));
      case 'deleteTransaction':
        return _jsonRes(deleteTransaction(body.txnId));
      case 'updateSettings':
        return _jsonRes(updateSettings(body.settings));
      case 'setChecklistItem':
        return _jsonRes(setChecklistItem(body.key, body.value));
      case 'setChecklistDate':
        return _jsonRes(setChecklistDate(body.key, body.startDate, body.endDate));
      case 'resetChecklistDate':
        return _jsonRes(resetChecklistDate(body.key));
      case 'updateAvatar':
        return _jsonRes(_updateAvatar(body.userId, body.avatarBase64));
      case 'scanReceipt':
        return _jsonRes(scanReceipt(body.imageBase64, body.mimeType));
      default:
        return _jsonRes({ ok: false, error: `Unknown action: ${body.action}` });
    }
  } catch (err) {
    return _jsonRes({ ok: false, error: err.message });
  } finally {
    lock.releaseLock();
  }
}

function _updateAvatar(userId, avatarBase64) {
  if (!userId || !avatarBase64) return { ok: false, error: 'missing params' };
  const folderId = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
  if (!folderId) return { ok: false, error: 'DRIVE_FOLDER_ID 未設定' };

  const folder = DriveApp.getFolderById(folderId);
  const filename = `avatar_${userId}.jpg`;

  // 刪除舊頭像
  const existing = folder.getFilesByName(filename);
  while (existing.hasNext()) existing.next().setTrashed(true);

  const blob = Utilities.newBlob(Utilities.base64Decode(avatarBase64.replace(/^data:[^;]+;base64,/, '')), 'image/jpeg', filename);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);

  return { ok: true, avatarUrl: `https://drive.google.com/uc?id=${file.getId()}` };
}

function _jsonRes(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function _currentYearMonth() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
}
