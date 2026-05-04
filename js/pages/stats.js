const Stats = (() => {
  let _yearMonth = Utils.currentYearMonth();
  let _trendChart = null;
  let _pieChart   = null;

  function show() {
    _render();
    _loadData();
  }

  function hide() {
    if (_trendChart) { _trendChart.destroy(); _trendChart = null; }
    if (_pieChart)   { _pieChart.destroy();   _pieChart   = null; }
  }

  function _render() {
    const page = document.getElementById('page-stats');
    page.innerHTML = `
      <div style="display:flex;justify-content:center;margin-bottom:var(--space-lg)">
        <div class="month-picker">
          <button class="month-nav" id="stats-prev">‹</button>
          <span class="month-label" id="stats-month-label"></span>
          <button class="month-nav" id="stats-next">›</button>
        </div>
      </div>
      <div class="stats-row" id="stats-summary"></div>
      <div class="card" style="margin-bottom:var(--space-md)">
        <div class="card-header"><span class="card-title">逐月趨勢</span></div>
        <div class="chart-container" style="height:200px">
          <canvas id="stats-trend-chart"></canvas>
        </div>
      </div>
      <div class="card" style="margin-bottom:var(--space-md)">
        <div class="card-header"><span class="card-title">支出類別分布</span></div>
        <div class="chart-container" style="height:200px">
          <canvas id="stats-pie-chart"></canvas>
        </div>
        <div class="chart-legend" id="stats-pie-legend"></div>
      </div>
      <div class="card" style="margin-bottom:var(--space-md)">
        <div class="card-header"><span class="card-title">人員分析</span></div>
        <div id="stats-user-breakdown"></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">支付方式分布</span></div>
        <div class="chart-container" style="height:160px">
          <canvas id="stats-pay-chart"></canvas>
        </div>
      </div>`;

    document.getElementById('stats-prev').addEventListener('click', () => {
      _yearMonth = Utils.addMonths(_yearMonth, -1);
      _loadData();
    });
    document.getElementById('stats-next').addEventListener('click', () => {
      _yearMonth = Utils.addMonths(_yearMonth, 1);
      _loadData();
    });
    _updateLabel();
  }

  function _updateLabel() {
    const el = document.getElementById('stats-month-label');
    if (el) el.textContent = Utils.formatYearMonth(_yearMonth);
  }

  async function _loadData() {
    _updateLabel();
    const gasUrl = State.get('gasUrl');
    if (!gasUrl) return;

    try {
      Loader.show();
      const res = await API.getStats(_yearMonth);
      _renderAll(res);
    } catch (e) {
      Toast.error('載入失敗：' + e.message);
    } finally {
      Loader.hide();
    }
  }

  function _renderAll(data) {
    _renderSummary(data);
    _renderTrend(data.monthlyTrend || []);
    _renderPie(data.categoryBreakdown || []);
    _renderUserBreakdown(data.userBreakdown || []);
    _renderPayChart(data.paymentBreakdown || []);
  }

  function _renderSummary(data) {
    const el = document.getElementById('stats-summary');
    if (!el) return;
    el.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">本月支出</div>
        <div class="stat-value expense">${Utils.formatMoney(data.monthExpense || 0)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本月收入</div>
        <div class="stat-value income">${Utils.formatMoney(data.monthIncome || 0)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">筆數</div>
        <div class="stat-value">${data.count || 0} 筆</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">平均每筆</div>
        <div class="stat-value">${Utils.formatMoney(data.avgAmount || 0)}</div>
      </div>`;
  }

  function _renderTrend(trend) {
    const canvas = document.getElementById('stats-trend-chart');
    if (!canvas) return;
    if (_trendChart) { _trendChart.destroy(); _trendChart = null; }
    if (!trend.length) return;

    _trendChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: trend.map(t => t.yearMonth.slice(5)),
        datasets: [
          { label: '支出', data: trend.map(t => t.expense), backgroundColor: 'rgba(194,138,138,0.7)', borderRadius: 4 },
          { label: '收入', data: trend.map(t => t.income),  backgroundColor: 'rgba(122,168,138,0.7)', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 }, color: '#8A7060' } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#8A7060', font: { size: 11 } } },
          y: { grid: { color: 'rgba(237,227,216,0.8)' }, ticks: { color: '#8A7060', font: { size: 11 },
                callback: v => `$${(v/1000).toFixed(0)}k` } },
        },
      },
    });
  }

  function _renderPie(breakdown) {
    const canvas = document.getElementById('stats-pie-chart');
    const legendEl = document.getElementById('stats-pie-legend');
    if (!canvas) return;
    if (_pieChart) { _pieChart.destroy(); _pieChart = null; }

    if (!breakdown.length) {
      canvas.parentElement.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-title">本月尚無支出</div></div>';
      return;
    }

    const labels = breakdown.map(b => b.category);
    const values = breakdown.map(b => b.amount);
    const colors = breakdown.map((_, i) => CONFIG.CHART_COLORS[i % CONFIG.CHART_COLORS.length]);
    const total  = values.reduce((a, b) => a + b, 0);

    _pieChart = new Chart(canvas, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#FFF9F5' }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${Utils.formatMoney(ctx.parsed)}（${Math.round(ctx.parsed/total*100)}%）` } } },
        cutout: '60%',
      },
    });

    if (legendEl) {
      legendEl.innerHTML = breakdown.map((b, i) => {
        const pct = Math.round(b.amount / total * 100);
        return `
          <div class="legend-item" style="width:calc(50% - 4px)">
            <span class="legend-dot" style="background:${colors[i]}"></span>
            <span style="flex:1">${CONFIG.getCategoryEmoji(b.category)} ${b.category}</span>
            <span style="color:var(--color-text);font-weight:600">${pct}%</span>
          </div>`;
      }).join('');
    }
  }

  function _renderUserBreakdown(users) {
    const el = document.getElementById('stats-user-breakdown');
    if (!el) return;
    if (!users.length) { el.innerHTML = '<div class="empty-state" style="padding:var(--space-lg)"><div class="empty-icon">👥</div><div class="empty-title">無資料</div></div>'; return; }

    el.innerHTML = users.map(u => {
      const user = CONFIG.getUserById(u.userId);
      return `
        <div style="display:flex;align-items:center;gap:var(--space-md);padding:var(--space-sm) 0;border-bottom:1px solid var(--color-border)">
          <div style="font-size:28px">${user.emoji}</div>
          <div style="flex:1">
            <div style="font-weight:600">${user.name}</div>
            <div style="font-size:var(--font-size-xs);color:var(--color-text-muted)">${u.count} 筆</div>
          </div>
          <div style="text-align:right">
            <div style="color:var(--color-expense);font-weight:700">${Utils.formatMoney(u.expense)}</div>
            <div style="color:var(--color-income);font-size:var(--font-size-sm)">+${Utils.formatMoney(u.income)}</div>
          </div>
        </div>`;
    }).join('');
  }

  function _renderPayChart(breakdown) {
    const canvas = document.getElementById('stats-pay-chart');
    if (!canvas || !breakdown.length) return;

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: breakdown.map(b => CONFIG.getPaymentLabel(b.method)),
        datasets: [{ data: breakdown.map(b => b.amount), backgroundColor: breakdown.map(b => {
          const map = { cash:'rgba(196,168,122,0.8)', credit_card:'rgba(138,158,196,0.8)', easy_card:'rgba(122,168,138,0.8)', bank_transfer:'rgba(160,142,196,0.8)' };
          return map[b.method] || 'rgba(180,160,144,0.8)';
        }), borderRadius: 4 }],
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(237,227,216,0.8)' }, ticks: { color: '#8A7060', font: { size: 11 }, callback: v => `$${(v/1000).toFixed(0)}k` } },
          y: { grid: { display: false }, ticks: { color: '#8A7060', font: { size: 11 } } },
        },
      },
    });
  }

  return { show, hide };
})();
