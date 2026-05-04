const Dashboard = (() => {
  let _chart = null;

  function show() {
    _render();
    _loadData();
  }

  function hide() {}

  function _render() {
    const page = document.getElementById('page-dashboard');
    page.innerHTML = `
      <div id="dash-countdown"></div>
      <div id="dash-budget"></div>
      <div class="stats-row" id="dash-stats"></div>
      <div class="card" style="margin-bottom:var(--space-md)">
        <div class="card-header">
          <span class="card-title">本月支出分布</span>
          <span id="dash-chart-month" style="font-size:var(--font-size-xs);color:var(--color-text-muted)"></span>
        </div>
        <div class="chart-container" style="height:200px">
          <canvas id="dash-pie-chart"></canvas>
        </div>
        <div class="chart-legend" id="dash-legend"></div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">最近記帳</span>
          <button class="btn btn-ghost btn-sm" onclick="Router.navigate('history')">全部 →</button>
        </div>
        <div id="dash-recent-list"></div>
      </div>
    `;
  }

  async function _loadData() {
    _renderCountdown();

    const cached = State.get('dashboardData');
    if (cached) { _renderData(cached); return; }

    const gasUrl = State.get('gasUrl');
    if (!gasUrl) { _renderNoGas(); return; }

    try {
      Loader.show();
      const data = await API.getDashboard();
      State.set({ dashboardData: data });
      _renderData(data);
    } catch (e) {
      Toast.error('載入失敗：' + e.message);
      _renderEmpty();
    } finally {
      Loader.hide();
    }
  }

  function _renderCountdown() {
    const el = document.getElementById('dash-countdown');
    if (!el) return;
    const settings = State.getSettings();
    const days = Utils.daysUntil(settings.weddingDate);

    if (days === null) {
      el.innerHTML = `
        <div class="countdown-hero" style="cursor:pointer" onclick="Dashboard.setWeddingDate()">
          <div class="countdown-emoji">💍</div>
          <div class="countdown-days" style="font-size:var(--font-size-xl);color:var(--color-text-muted)">設定婚禮日期</div>
          <div class="countdown-label">點擊設定，開始倒數</div>
        </div>`;
      return;
    }

    const emoji = days > 0 ? '💍' : (days === 0 ? '💒' : '🎉');
    const label = days > 0 ? '距離婚禮還有' : (days === 0 ? '今天是婚禮！' : '婚禮已結束');
    const dateStr = settings.weddingDate ? Utils.formatDateFull(settings.weddingDate) : '';

    el.innerHTML = `
      <div class="countdown-hero" style="cursor:pointer" onclick="Dashboard.setWeddingDate()">
        <div class="countdown-emoji">${emoji}</div>
        ${days > 0 || days < 0 ? `
          <div class="countdown-days">${Math.abs(days)}</div>
          <div class="countdown-label">${label}天</div>
        ` : `<div class="countdown-days" style="font-size:32px">${label}</div>`}
        ${dateStr ? `<div class="countdown-date">${dateStr}</div>` : ''}
      </div>`;
  }

  function _renderData(data) {
    _renderBudget(data);
    _renderStats(data);
    _renderChart(data.categoryBreakdown || []);
    _renderRecent(data.recentTransactions || []);
  }

  function _renderBudget(data) {
    const el = document.getElementById('dash-budget');
    if (!el) return;
    const settings = State.getSettings();
    const total = settings.totalBudget || 0;
    const spent = data.totalExpense || 0;
    const pct = total > 0 ? Math.min(100, Math.round(spent / total * 100)) : 0;
    const barClass = pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : '';

    if (total === 0) {
      el.innerHTML = `
        <div class="budget-card" style="cursor:pointer" onclick="Dashboard.setBudget()">
          <div style="text-align:center;padding:var(--space-sm) 0">
            <span style="font-size:var(--font-size-sm);color:var(--color-text-muted)">🎯 點擊設定婚禮總預算</span>
          </div>
        </div>`;
      return;
    }

    el.innerHTML = `
      <div class="budget-card">
        <div class="budget-header">
          <span class="budget-title">🎯 婚禮總預算</span>
          <button class="budget-edit-btn" onclick="Dashboard.setBudget()">修改</button>
        </div>
        <div class="budget-numbers">
          <span class="budget-spent">${Utils.formatMoney(spent)}</span>
          <span class="budget-total">/ ${Utils.formatMoney(total)}</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-bar ${barClass}" style="width:${pct}%"></div>
        </div>
        <div style="text-align:right;font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:4px">${pct}% 已使用</div>
      </div>`;
  }

  function _renderStats(data) {
    const el = document.getElementById('dash-stats');
    if (!el) return;
    el.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">今日支出</div>
        <div class="stat-value expense">${Utils.formatMoney(data.todayExpense || 0)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本月收入</div>
        <div class="stat-value income">${Utils.formatMoney(data.monthIncome || 0)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本月支出</div>
        <div class="stat-value expense">${Utils.formatMoney(data.monthExpense || 0)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">累計支出</div>
        <div class="stat-value">${Utils.formatMoney(data.totalExpense || 0)}</div>
      </div>`;
  }

  function _renderChart(breakdown) {
    const canvas = document.getElementById('dash-pie-chart');
    const legendEl = document.getElementById('dash-legend');
    const monthEl = document.getElementById('dash-chart-month');
    if (!canvas) return;

    if (monthEl) monthEl.textContent = Utils.formatYearMonth(Utils.currentYearMonth());

    if (_chart) { _chart.destroy(); _chart = null; }

    if (!breakdown.length) {
      canvas.parentElement.innerHTML = '<div class="empty-state"><div class="empty-icon">🍰</div><div class="empty-title">本月尚無支出</div></div>';
      if (legendEl) legendEl.innerHTML = '';
      return;
    }

    const labels = breakdown.map(b => b.category);
    const values = breakdown.map(b => b.amount);
    const colors = breakdown.map((_, i) => CONFIG.CHART_COLORS[i % CONFIG.CHART_COLORS.length]);

    _chart = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#FFF9F5' }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${Utils.formatMoney(ctx.parsed)}（${Math.round(ctx.parsed / values.reduce((a,b)=>a+b,0) * 100)}%）`,
            },
          },
        },
        cutout: '60%',
      },
    });

    if (legendEl) {
      const total = values.reduce((a, b) => a + b, 0);
      legendEl.innerHTML = breakdown.map((b, i) => {
        const emoji = CONFIG.getCategoryEmoji(b.category);
        const pct = Math.round(b.amount / total * 100);
        return `<div class="legend-item">
          <span class="legend-dot" style="background:${colors[i]}"></span>
          <span>${emoji} ${b.category}</span>
          <span style="margin-left:auto;color:var(--color-text)">${pct}%</span>
        </div>`;
      }).join('');
    }
  }

  function _renderRecent(transactions) {
    const el = document.getElementById('dash-recent-list');
    if (!el) return;

    if (!transactions.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">✨</div><div class="empty-title">尚無記帳紀錄</div><div class="empty-desc">點下方 ＋ 開始記帳</div></div>';
      return;
    }

    el.innerHTML = transactions.slice(0, 5).map(t => {
      const isExp = t.type === 'expense';
      const emoji = isExp ? CONFIG.getCategoryEmoji(t.category) : CONFIG.getCategoryEmoji(t.category, 'income');
      return `
        <div class="txn-item">
          <div class="txn-icon">${emoji}</div>
          <div class="txn-info">
            <div class="txn-category">${t.category}</div>
            <div class="txn-meta">
              ${Utils.avatarHtml(t.userId, 16)}
              <span>${Utils.formatDate(t.date)}</span>
              ${t.merchant ? `<span>· ${Utils.truncate(t.merchant, 10)}</span>` : ''}
              <span class="chip ${isExp ? 'expense' : 'income'}" style="padding:2px 6px;font-size:10px">${isExp ? '支出' : '收入'}</span>
            </div>
          </div>
          <div class="txn-amount ${isExp ? 'expense' : 'income'}">${isExp ? '-' : '+'}${Utils.formatMoney(t.amount)}</div>
        </div>`;
    }).join('');
  }

  function _renderNoGas() {
    const page = document.getElementById('page-dashboard');
    page.innerHTML = `
      <div class="empty-state" style="min-height:60vh">
        <div class="empty-icon">⚙️</div>
        <div class="empty-title">尚未連接雲端</div>
        <div class="empty-desc">請先完成 GAS 設定才能使用記帳功能</div>
        <button class="btn btn-primary" onclick="Router.navigate('guide')">查看設定說明</button>
      </div>`;
  }

  function _renderEmpty() {
    document.getElementById('dash-recent-list').innerHTML =
      '<div class="empty-state"><div class="empty-icon">🔄</div><div class="empty-title">載入失敗，請稍後重試</div></div>';
  }

  function setWeddingDate() {
    const current = State.getSettings().weddingDate || '';
    Modal.prompt('設定婚禮日期', '請輸入婚禮日期', {
      placeholder: 'YYYY-MM-DD',
      defaultValue: current,
      inputType: 'date',
      confirmText: '儲存',
      onConfirm: val => {
        if (!val) return;
        State.updateSettings({ weddingDate: val });
        if (State.get('gasUrl')) {
          API.updateSettings({ weddingDate: val }).catch(() => {});
        }
        _renderCountdown();
        Toast.success('婚禮日期已設定');
      },
    });
  }

  function setBudget() {
    const current = State.getSettings().totalBudget || '';
    Modal.prompt('設定婚禮總預算', '請輸入預算金額（新台幣）', {
      placeholder: '例：1000000',
      defaultValue: current ? String(current) : '',
      inputType: 'number',
      confirmText: '儲存',
      onConfirm: val => {
        const n = parseInt(val);
        if (!n || n <= 0) { Toast.error('請輸入有效金額'); return; }
        State.updateSettings({ totalBudget: n });
        if (State.get('gasUrl')) {
          API.updateSettings({ totalBudget: n }).catch(() => {});
        }
        Toast.success('總預算已設定');
        _loadData();
      },
    });
  }

  function refresh() {
    State.set({ dashboardData: null });
    _loadData();
  }

  return { show, hide, setWeddingDate, setBudget, refresh };
})();
