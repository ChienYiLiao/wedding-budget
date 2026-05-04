const Utils = {
  // 格式化金額（NT$1,234）
  formatMoney(amount, showSign = false) {
    const abs = Math.abs(Number(amount) || 0);
    const str = `NT$${abs.toLocaleString('zh-TW')}`;
    if (!showSign) return str;
    return amount < 0 ? `-${str}` : str;
  },

  // 格式化日期（YYYY-MM-DD → M/D）
  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}`;
  },

  formatDateFull(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  },

  // 取得今天 YYYY-MM-DD
  today() {
    return new Date().toISOString().slice(0, 10);
  },

  // 取得當前 YYYY-MM
  currentYearMonth() {
    return new Date().toISOString().slice(0, 7);
  },

  // 計算倒數天數
  daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = target - now;
    return Math.round(diff / 86400000);
  },

  // 壓縮圖片至指定尺寸（返回 base64）
  async compressImage(file, maxDim = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
            else       { w = Math.round(w * maxDim / h); h = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // base64 → mime + data
  parseDataUrl(dataUrl) {
    const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!m) return null;
    return { mimeType: m[1], data: m[2] };
  },

  // 生成唯一 ID
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  // 月份加減（YYYY-MM）
  addMonths(yearMonth, delta) {
    const [y, m] = yearMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  // 格式化月份顯示（YYYY-MM → YYYY 年 M 月）
  formatYearMonth(ym) {
    if (!ym) return '';
    const [y, m] = ym.split('-');
    return `${y} 年 ${parseInt(m)} 月`;
  },

  // 人員頭像 HTML
  avatarHtml(userId, size = 24) {
    const user = CONFIG.getUserById(userId);
    const src = State.getAvatar(userId) || user.defaultAvatar;
    const style = `width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;background:var(--color-border);flex-shrink:0;`;
    const fallback = `this.style.display='none';this.insertAdjacentHTML('afterend','<span style=\\"${style}display:inline-flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.6)}px;\\">${user.emoji}</span>')`;
    return `<img src="${src}" style="${style}" alt="${user.name}" onerror="${fallback}">`;
  },

  // 截斷文字
  truncate(str, max = 20) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '…' : str;
  },
};
