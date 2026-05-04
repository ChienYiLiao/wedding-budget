const API = (() => {
  function _url() {
    const url = State.get('gasUrl') || CONFIG.GAS_URL;
    if (!url) throw new Error('GAS_URL 尚未設定');
    return url;
  }

  async function _handleRes(res) {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.ok === false) throw new Error(data.error || '伺服器錯誤');
    return data;
  }

  // 讀取：GET + query params
  async function get(action, params = {}) {
    const url = new URL(_url());
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    return _handleRes(res);
  }

  // 寫入：GET + ?payload=JSON（避免 302 轉址時 POST→GET 問題）
  async function write(action, body = {}) {
    const payload = JSON.stringify({ action, ...body });
    const url = new URL(_url());
    url.searchParams.set('payload', payload);
    const res = await fetch(url.toString());
    return _handleRes(res);
  }

  // 大檔案（圖片）：POST
  async function post(action, body = {}) {
    const res = await fetch(_url(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, ...body }),
    });
    return _handleRes(res);
  }

  // ─── 具名 API 方法 ─────────────────────────────────────────

  async function getDashboard() {
    return get('getDashboard');
  }

  async function getTransactions(yearMonth) {
    return get('getTransactions', { yearMonth });
  }

  async function addTransaction(txn) {
    const result = await write('addTransaction', { txn });
    State.invalidateCache();
    return result;
  }

  async function deleteTransaction(txnId) {
    const result = await write('deleteTransaction', { txnId });
    State.invalidateCache();
    return result;
  }

  async function getStats(yearMonth) {
    return get('getStats', { yearMonth });
  }

  async function getSettings() {
    return get('getSettings');
  }

  async function updateSettings(settings) {
    return write('updateSettings', { settings });
  }

  async function updateAvatar(userId, avatarBase64) {
    return post('updateAvatar', { userId, avatarBase64 });
  }

  async function scanReceipt(imageBase64, mimeType) {
    return post('scanReceipt', { imageBase64, mimeType });
  }

  return {
    get, write, post,
    getDashboard, getTransactions, addTransaction, deleteTransaction,
    getStats, getSettings, updateSettings, updateAvatar, scanReceipt,
  };
})();
