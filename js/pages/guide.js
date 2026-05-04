const Guide = (() => {
  function show() {
    const page = document.getElementById('page-guide');
    page.innerHTML = `
      <div class="guide-section">
        <h2>🚀 快速開始</h2>
        <h3>首次設定</h3>
        <p>使用本 App 前需完成以下設定：</p>
        <ul>
          <li>依照 <strong>GAS 部署指南</strong>（gas/setup-guide.md）建立後端</li>
          <li>取得 GAS Web App URL 後，在說明書底部的「⚙️ 連線設定」輸入</li>
          <li>設定婚禮日期與總預算（在首頁點擊倒數區塊）</li>
        </ul>
        <div class="guide-tip">💡 所有資料儲存在你自己的 Google Sheets，完全掌握在自己手中</div>
      </div>

      <div class="guide-section">
        <h2>👥 使用者切換</h2>
        <p>首頁有「豬豬」和「滾滾」兩個帳號，點擊即可切換使用者。</p>
        <h3>自訂頭像</h3>
        <ul>
          <li><strong>長按</strong>使用者卡片，選擇「拍攝」或「從相簿選擇」</li>
          <li>使用裁切工具將圖片調整為正方形</li>
          <li>頭像儲存於裝置本機，不會上傳至雲端</li>
        </ul>
      </div>

      <div class="guide-section">
        <h2>➕ 新增記帳</h2>
        <p>點擊底部導覽列中間的 <strong>＋</strong> 按鈕，開啟記帳表單。</p>
        <h3>支出類別</h3>
        <p>訂婚戒指 💍 · 結婚對戒 💎 · 喜餅/訂婚餅 🎂 · 婚宴飯店 🏨 · 聘金 🧧 · 嫁妝 🎁 · 喜帖 ✉️ · 結婚小物 🎀 · 婚紗攝影 📸 · 新娘秘書/造型 💄 · 婚禮布置/花藝 💐 · 蜜月旅遊 ✈️ · 婚車 🚗 · 主持人/音響 🎤 · 其他 📦</p>
        <h3>收入類別</h3>
        <p>贊助 🤝 · 禮金 🧧 · 彩禮回禮 🎁 · 其他 💰</p>
        <h3>退回功能</h3>
        <ul>
          <li>表單空白時：直接向下滑或點右上角 ✕ 關閉</li>
          <li>已填寫時：離開前會跳出確認視窗，避免誤刪</li>
          <li>儲存後：5 秒內可點 Toast 通知中的「撤銷」取消</li>
        </ul>
      </div>

      <div class="guide-section">
        <h2>📷 掃描收據</h2>
        <p>點擊底部導覽列的「記錄」→ 右上角掃描按鈕，或在首頁下拉後進入掃描頁。</p>
        <h3>支援格式</h3>
        <ul>
          <li><strong>雲端發票載具</strong>：自動擷取統一編號、品項、稅別、金額</li>
          <li><strong>紙本發票</strong>：同上，額外擷取發票號碼</li>
          <li><strong>一般收據</strong>：擷取店名、金額、品項</li>
        </ul>
        <div class="guide-tip">💡 AI 辨識結果為建議值，請確認後再儲存</div>
        <h3>所需設定</h3>
        <p>掃描功能需要 Gemini API Key，請在 GAS Script Properties 設定 <code>GEMINI_API_KEY</code>。</p>
      </div>

      <div class="guide-section">
        <h2>📊 統計分析</h2>
        <ul>
          <li>點擊上方月份箭頭切換查看任意月份</li>
          <li>逐月趨勢圖：支出（藕荷紅）+ 收入（鼠尾草綠）對比</li>
          <li>類別圓餅圖：各項目占比與金額</li>
          <li>人員分析：豬豬 vs 滾滾 個人消費統計</li>
          <li>支付方式分布：現金、信用卡、悠遊卡、轉帳占比</li>
        </ul>
      </div>

      <div class="guide-section">
        <h2>🏠 首頁 Dashboard</h2>
        <ul>
          <li><strong>倒數天數</strong>：顯示距婚禮天數，點擊可修改婚禮日期</li>
          <li><strong>總預算進度條</strong>：顯示預算使用狀況（橙色 ≥70%，紅色 ≥90%），點擊可修改</li>
          <li><strong>今日支出 / 本月收支 / 累計支出</strong>：即時數字卡片</li>
          <li><strong>本月支出圓餅圖</strong>：類別占比</li>
          <li><strong>最近 5 筆</strong>：快速瀏覽最新記帳</li>
        </ul>
      </div>

      <div class="guide-section">
        <h2>📋 歷史記錄</h2>
        <ul>
          <li>按月份瀏覽，使用箭頭切換</li>
          <li>點「篩選 ▾」展開篩選列，可依人員或支付方式過濾</li>
          <li>每日小計顯示於日期標題</li>
          <li>點 🗑 按鈕刪除記帳（需確認）</li>
        </ul>
      </div>

      <div class="guide-section">
        <h2>⚙️ 連線設定</h2>
        <div class="form-group">
          <label class="form-label">GAS Web App URL</label>
          <input class="form-input" id="guide-gas-input" type="url" placeholder="https://script.google.com/macros/s/.../exec">
        </div>
        <button class="btn btn-primary btn-full" id="guide-gas-save">儲存並測試連線</button>
        <div id="guide-gas-status" style="margin-top:var(--space-sm);font-size:var(--font-size-sm);color:var(--color-text-muted)"></div>

        <div class="form-group" style="margin-top:var(--space-lg)">
          <label class="form-label">Gemini API Key（AI 收據辨識）</label>
          <input class="form-input" id="guide-gemini-input" type="password" placeholder="AIza...">
          <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:4px">
            至 <a href="https://aistudio.google.com/apikey" target="_blank" style="color:var(--color-primary)">Google AI Studio</a> 免費取得，儲存於本機不會上傳
          </div>
        </div>
        <button class="btn btn-secondary btn-full" id="guide-gemini-save">儲存 Gemini API Key</button>
        <div id="guide-gemini-status" style="margin-top:var(--space-sm);font-size:var(--font-size-sm);color:var(--color-text-muted)"></div>
      </div>

      <div style="text-align:center;padding:var(--space-xl) 0;color:var(--color-text-light);font-size:var(--font-size-xs)">
        ${CONFIG.APP_NAME} v${CONFIG.VERSION} · 豬豬 & 滾滾 💍
      </div>`;

    // GAS 設定
    const gasInput = document.getElementById('guide-gas-input');
    gasInput.value = State.get('gasUrl') || '';

    // Gemini API Key 設定
    const geminiInput = document.getElementById('guide-gemini-input');
    geminiInput.value = State.get('geminiKey') || '';
    document.getElementById('guide-gemini-save').addEventListener('click', () => {
      const key = geminiInput.value.trim();
      if (!key) { Toast.error('請輸入 Gemini API Key'); return; }
      State.set({ geminiKey: key });
      const st = document.getElementById('guide-gemini-status');
      st.style.color = 'var(--color-income)';
      st.textContent = '✅ Gemini API Key 已儲存';
      Toast.success('Gemini API Key 已儲存');
    });

    document.getElementById('guide-gas-save').addEventListener('click', async () => {
      const url = gasInput.value.trim();
      if (!url) { Toast.error('請輸入 GAS URL'); return; }

      const status = document.getElementById('guide-gas-status');
      status.textContent = '測試連線中…';
      try {
        State.set({ gasUrl: url });
        const res = await API.getSettings();
        if (res.settings) {
          const remote = res.settings;
          if (remote.weddingDate) State.updateSettings({ weddingDate: remote.weddingDate });
          if (remote.totalBudget) State.updateSettings({ totalBudget: remote.totalBudget });
        }
        status.style.color = 'var(--color-income)';
        status.textContent = '✅ 連線成功！';
        Toast.success('連線設定已儲存');
        State.invalidateCache();
      } catch (e) {
        status.style.color = 'var(--color-expense)';
        status.textContent = '❌ 連線失敗：' + e.message;
      }
    });
  }

  function hide() {}

  return { show, hide };
})();
