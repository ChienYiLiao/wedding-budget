const History = (() => {
  let _yearMonth = Utils.currentYearMonth();
  let _filterCat = '';
  let _filterPay = '';
  let _filterUser = '';
  let _data = [];

  function show() {
    _render();
    _loadData();
  }

  function hide() {}

  function _render() {
    const page = document.getElementById('page-history');
    page.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md)">
        <div class="month-picker">
          <button class="month-nav" id="hist-prev">‹</button>
          <span class="month-label" id="hist-month-label"></span>
          <button class="month-nav" id="hist-next">›</button>
        </div>
        <button class="btn btn-ghost btn-sm" id="hist-filter-btn">篩選 ▾</button>
      </div>
      <div class="filter-bar" id="hist-filter-bar" style="display:none;margin-bottom:var(--space-md)">
        <button class="filter-chip active" data-filter="user" data-val="">全部人員</button>
        ${CONFIG.USERS.map(u => `<button class="filter-chip" data-filter="user" data-val="${u.id}">${u.emoji} ${u.name}</button>`).join('')}
        <span style="width:1px;background:var(--color-border);flex-shrink:0"></span>
        <button class="filter-chip active" data-filter="pay" data-val="">全部支付</button>
        ${CONFIG.PAYMENT_METHODS.map(p => `<button class="filter-chip" data-filter="pay" data-val="${p.key}">${p.emoji} ${p.label}</button>`).join('')}
      </div>
      <div id="hist-list"></div>`;

    document.getElementById('hist-prev').addEventListener('click', () => {
      _yearMonth = Utils.addMonths(_yearMonth, -1);
      _loadData();
    });
    document.getElementById('hist-next').addEventListener('click', () => {
      _yearMonth = Utils.addMonths(_yearMonth, 1);
      _loadData();
    });
    document.getElementById('hist-filter-btn').addEventListener('click', () => {
      const bar = document.getElementById('hist-filter-bar');
      bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
    });
    document.querySelectorAll('#hist-filter-bar .filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const group = chip.dataset.filter;
        document.querySelectorAll(`#hist-filter-bar .filter-chip[data-filter="${group}"]`).forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (group === 'user') _filterUser = chip.dataset.val;
        if (group === 'pay')  _filterPay  = chip.dataset.val;
        _renderList();
      });
    });

    _updateMonthLabel();
  }

  function _updateMonthLabel() {
    const el = document.getElementById('hist-month-label');
    if (el) el.textContent = Utils.formatYearMonth(_yearMonth);
  }

  async function _loadData() {
    _updateMonthLabel();
    const cached = State.get('transactionsCache')[_yearMonth];
    if (cached) { _data = cached; _renderList(); return; }

    const gasUrl = State.get('gasUrl');
    if (!gasUrl) { _renderEmpty('尚未連接雲端'); return; }

    try {
      Loader.show();
      const res = await API.getTransactions(_yearMonth);
      _data = res.transactions || [];
      const cache = State.get('transactionsCache');
      cache[_yearMonth] = _data;
      State.set({ transactionsCache: cache });
      _renderList();
    } catch (e) {
      Toast.error('載入失敗：' + e.message);
      _renderEmpty('載入失敗');
    } finally {
      Loader.hide();
    }
  }

  function _renderList() {
    const el = document.getElementById('hist-list');
    if (!el) return;

    let filtered = _data;
    if (_filterUser) filtered = filtered.filter(t => t.userId === _filterUser);
    if (_filterPay)  filtered = filtered.filter(t => t.paymentMethod === _filterPay);

    if (!filtered.length) {
      _renderEmpty('本月無記帳紀錄');
      return;
    }

    // 依日期分組
    const groups = {};
    filtered.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    el.innerHTML = sortedDates.map(date => {
      const dayTotal = groups[date].reduce((s, t) => s + (t.type === 'expense' ? -t.amount : t.amount), 0);
      const items = groups[date].map(t => {
        const isExp = t.type === 'expense';
        const emoji = isExp ? CONFIG.getCategoryEmoji(t.category) : CONFIG.getCategoryEmoji(t.category, 'income');
        return `
          <div class="txn-item" data-id="${t.txnId}">
            <div class="txn-icon">${emoji}</div>
            <div class="txn-info">
              <div class="txn-category">${t.category}</div>
              <div class="txn-meta">
                ${Utils.avatarHtml(t.userId, 16)}
                <span>${t.time || ''}</span>
                ${t.merchant ? `<span>· ${Utils.truncate(t.merchant, 12)}</span>` : ''}
                <span>${CONFIG.getPaymentEmoji(t.paymentMethod)}</span>
              </div>
              ${t.note ? `<div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:2px">${Utils.truncate(t.note, 30)}</div>` : ''}
            </div>
            <div>
              <div class="txn-amount ${isExp ? 'expense' : 'income'}">${isExp ? '-' : '+'}${Utils.formatMoney(t.amount)}</div>
              <button class="btn btn-icon btn-sm" style="width:28px;height:28px;font-size:14px;margin-top:4px" data-del="${t.txnId}">🗑</button>
            </div>
          </div>`;
      }).join('');

      return `
        <div class="divider-label">
          ${Utils.formatDateFull(date)}
          <span style="margin-left:auto;font-size:var(--font-size-xs);color:${dayTotal >= 0 ? 'var(--color-income)' : 'var(--color-expense)'}">${dayTotal >= 0 ? '+' : ''}${Utils.formatMoney(Math.abs(dayTotal))}</span>
        </div>
        ${items}`;
    }).join('');

    el.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.del;
        Modal.confirm('刪除這筆記帳？', '刪除後無法復原', {
          confirmText: '刪除',
          destructive: true,
          onConfirm: () => _delete(id),
        });
      });
    });
  }

  function _renderEmpty(msg) {
    const el = document.getElementById('hist-list');
    if (el) el.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">${msg}</div></div>`;
  }

  async function _delete(txnId) {
    try {
      Loader.show();
      await API.deleteTransaction(txnId);
      _data = _data.filter(t => t.txnId !== txnId);
      const cache = State.get('transactionsCache');
      cache[_yearMonth] = _data;
      State.set({ transactionsCache: cache, dashboardData: null });
      _renderList();
      Toast.success('已刪除');
    } catch (e) {
      Toast.error('刪除失敗：' + e.message);
    } finally {
      Loader.hide();
    }
  }

  return { show, hide };
})();
