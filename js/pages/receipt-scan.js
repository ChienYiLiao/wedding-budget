const ReceiptScan = (() => {
  let _overlay, _sheet;
  let _currentImage = null;
  let _scannedData = null;
  let _isDirty = false;

  function _init() {
    _overlay = document.getElementById('scan-sheet-overlay');
    _sheet   = document.getElementById('scan-sheet');

    _overlay.addEventListener('click', _tryClose);
    document.getElementById('scan-sheet-close').addEventListener('click', _tryClose);
    document.getElementById('scan-btn-camera').addEventListener('click', _openCamera);
    document.getElementById('scan-btn-upload').addEventListener('click', _openFile);
    document.getElementById('scan-submit').addEventListener('click', _submit);
  }

  function open() {
    if (!_overlay) _init();
    _reset();
    _overlay.classList.add('visible');
    requestAnimationFrame(() => _sheet.classList.add('open'));
  }

  function close() {
    _sheet.classList.remove('open');
    setTimeout(() => {
      _overlay.classList.remove('visible');
      _isDirty = false;
    }, 300);
  }

  function _tryClose() {
    if (_isDirty) {
      Modal.confirm('放棄此次掃描？', '已辨識的資料將會消失', {
        confirmText: '放棄',
        cancelText: '繼續',
        destructive: true,
        onConfirm: close,
      });
    } else {
      close();
    }
  }

  function _reset() {
    _currentImage = null;
    _scannedData = null;
    _isDirty = false;
    _renderIdle();
  }

  function _renderIdle() {
    document.getElementById('scan-preview').innerHTML = '';
    document.getElementById('scan-result-area').innerHTML = '';
    document.getElementById('scan-submit').style.display = 'none';
    document.getElementById('scan-action-area').style.display = 'flex';
  }

  function _openCamera() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
    input.addEventListener('change', e => _handleFile(e.target.files[0]));
    input.click();
  }

  function _openFile() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.addEventListener('change', e => _handleFile(e.target.files[0]));
    input.click();
  }

  async function _handleFile(file) {
    if (!file) return;
    try {
      const dataUrl = await Utils.compressImage(file, 1600, 0.85);
      _currentImage = dataUrl;
      _showPreview(dataUrl);
      await _scan(dataUrl, file.type);
    } catch (e) {
      Toast.error('圖片處理失敗：' + e.message);
    }
  }

  function _showPreview(dataUrl) {
    const el = document.getElementById('scan-preview');
    el.innerHTML = `<div class="receipt-preview"><img src="${dataUrl}" alt="收據預覽"></div>`;
  }

  async function _scan(dataUrl, mimeType) {
    const geminiKey = State.get('geminiKey');
    if (!geminiKey) {
      document.getElementById('scan-result-area').innerHTML = `
        <div class="receipt-result">
          <div class="receipt-result-title" style="color:var(--color-expense)">尚未設定 Gemini API Key</div>
          <div style="font-size:var(--font-size-sm);color:var(--color-text-muted)">請到「說明」頁的連線設定輸入 Gemini API Key</div>
        </div>`;
      return;
    }

    const parsed = Utils.parseDataUrl(dataUrl);
    if (!parsed) { Toast.error('圖片格式錯誤'); return; }

    document.getElementById('scan-result-area').innerHTML = `
      <div class="receipt-result">
        <div class="receipt-result-title">🤖 AI 辨識中…</div>
        <div class="loader-spinner" style="margin:var(--space-md) auto"></div>
      </div>`;

    const prompt = `你是一個收據辨識助手。請分析這張收據圖片（可能是台灣的雲端發票、紙本發票或一般收據），以繁體中文回傳以下 JSON 格式（只回傳 JSON，不要多餘文字）：
{"merchant":"店名","amount":金額數字,"items":"品項（多個用·分隔）","taxType":"含稅/未稅/免稅","invoiceNo":"發票號碼（若無填空字串）","suggestedCategory":"訂婚戒指/結婚對戒/喜餅訂婚餅/婚宴飯店/聘金/嫁妝/喜帖/結婚小物/婚紗攝影/新娘秘書造型/婚禮布置花藝/蜜月旅遊/婚車/主持人音響/其他（選一個）"}`;

    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-flash-latest'];
    const errs = [];

    try {
      Loader.show();
      for (const model of models) {
        const ep = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        let res;
        try {
          res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [
                { text: prompt },
                { inline_data: { mime_type: parsed.mimeType || mimeType || 'image/jpeg', data: parsed.data } },
              ]}],
              generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
            }),
          });
        } catch (fe) {
          errs.push(`[${model}] 網路錯誤`);
          continue;
        }

        const body = await res.json();
        if (body.error) {
          errs.push(`[${model}] ${body.error.message || 'API 錯誤'}`);
          continue;
        }

        try {
          let text = (body.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
          text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
          const data = JSON.parse(text);
          _scannedData = data;
          _renderResult(data);
          _isDirty = true;
          return;
        } catch (pe) {
          errs.push(`[${model}] JSON 解析失敗`);
        }
      }

      // 所有模型均失敗
      document.getElementById('scan-result-area').innerHTML = `
        <div class="receipt-result">
          <div class="receipt-result-title" style="color:var(--color-expense)">辨識失敗</div>
          <div style="font-size:var(--font-size-sm);color:var(--color-text-muted)">${errs.join('<br>')}</div>
        </div>`;
      document.getElementById('scan-action-area').style.display = 'flex';
    } finally {
      Loader.hide();
    }
  }

  function _renderResult(data) {
    const el = document.getElementById('scan-result-area');
    const userId = State.get('currentUser') || CONFIG.USERS[0].id;

    el.innerHTML = `
      <div class="receipt-result">
        <div class="receipt-result-title">✅ AI 辨識結果（可修改）</div>
      </div>
      <div class="form-group">
        <label class="form-label">店名</label>
        <input class="form-input" id="scan-merchant" value="${_escape(data.merchant || '')}" placeholder="店名">
      </div>
      <div class="form-group">
        <label class="form-label">金額（NT$）</label>
        <div class="amount-input-wrap">
          <span class="amount-prefix">$</span>
          <input type="number" id="scan-amount" value="${data.amount || ''}" placeholder="0" inputmode="decimal">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">品項</label>
        <input class="form-input" id="scan-items" value="${_escape(data.items || '')}" placeholder="品項描述">
      </div>
      <div class="form-group">
        <label class="form-label">稅別</label>
        <input class="form-input" id="scan-tax" value="${_escape(data.taxType || '')}" placeholder="含稅/未稅/免稅">
      </div>
      <div class="form-group">
        <label class="form-label">類別</label>
        <div class="category-grid" id="scan-cat-grid"></div>
      </div>
      <div class="form-group">
        <label class="form-label">支付方式</label>
        <div class="payment-chips" id="scan-payment-chips">
          ${CONFIG.PAYMENT_METHODS.map(p => `
            <button class="pay-chip ${p.key === 'cash' ? 'selected' : ''}" data-pay="${p.key}">${p.emoji} ${p.label}</button>
          `).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">記帳人</label>
        <div class="user-chips" id="scan-user-chips">
          ${CONFIG.USERS.map(u => `
            <button class="user-chip ${u.id === userId ? 'selected' : ''}" data-user="${u.id}">
              <span class="user-chip-avatar">${u.emoji}</span>
              <span>${u.name}</span>
            </button>
          `).join('')}
        </div>
      </div>`;

    _renderScanCategories(data.suggestedCategory || null);

    el.querySelectorAll('.pay-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        el.querySelectorAll('.pay-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
      });
    });

    el.querySelectorAll('.user-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        el.querySelectorAll('.user-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
      });
    });

    document.getElementById('scan-submit').style.display = 'block';
    document.getElementById('scan-action-area').style.display = 'none';
  }

  function _renderScanCategories(suggested) {
    const grid = document.getElementById('scan-cat-grid');
    if (!grid) return;
    let selected = suggested || null;

    grid.innerHTML = CONFIG.EXPENSE_CATEGORIES.map(cat => `
      <button class="cat-btn ${selected === cat.name ? 'selected' : ''}" data-cat="${cat.name}">
        <span class="cat-emoji">${cat.emoji}</span>
        <span class="cat-name">${cat.name}</span>
      </button>`).join('');

    grid.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selected = btn.dataset.cat;
        grid.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  }

  async function _submit() {
    const amount = parseFloat(document.getElementById('scan-amount')?.value);
    if (!amount || amount <= 0) { Toast.error('請輸入有效金額'); return; }

    const catSelected = document.querySelector('#scan-cat-grid .cat-btn.selected');
    if (!catSelected) { Toast.error('請選擇類別'); return; }

    const paySelected  = document.querySelector('#scan-payment-chips .pay-chip.selected');
    const userSelected = document.querySelector('#scan-user-chips .user-chip.selected');

    const txn = {
      txnId:         Utils.uid(),
      date:          Utils.today(),
      time:          new Date().toTimeString().slice(0, 5),
      userId:        userSelected?.dataset.user || State.get('currentUser'),
      type:          'expense',
      category:      catSelected.dataset.cat,
      amount:        amount,
      paymentMethod: paySelected?.dataset.pay || 'cash',
      merchant:      document.getElementById('scan-merchant')?.value.trim() || '',
      note:          [
        document.getElementById('scan-items')?.value.trim(),
        document.getElementById('scan-tax')?.value.trim(),
      ].filter(Boolean).join(' · '),
    };

    const gasUrl = State.get('gasUrl');
    if (!gasUrl) { Toast.error('尚未設定 GAS URL'); return; }

    try {
      Loader.show();
      const res = await API.addTransaction(txn);
      _isDirty = false;
      close();

      Toast.successWithUndo(`已新增 ${txn.category} ${Utils.formatMoney(txn.amount)}`, async () => {
        try {
          await API.deleteTransaction(res.txnId || txn.txnId);
          Toast.success('已撤銷');
          Dashboard.refresh();
        } catch (e) {
          Toast.error('撤銷失敗');
        }
      });

      Dashboard.refresh();
    } catch (e) {
      Toast.error('儲存失敗：' + e.message);
    } finally {
      Loader.hide();
    }
  }

  function _escape(str) {
    return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  }

  return { open, close };
})();
