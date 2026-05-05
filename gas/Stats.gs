// ===== 統計分析（支援單月與日期範圍）=====

function getStats(params) {
  const sheet = getTxnSheet();
  const all = readAllRows(sheet);

  // 相容舊版單月呼叫 / 新版 startYM+endYM 範圍呼叫
  let startYM, endYM;
  if (typeof params === 'string') {
    startYM = endYM = params;
  } else {
    const ym = (params && params.yearMonth) ? params.yearMonth : _currentYearMonth();
    startYM = (params && params.startYM) ? params.startYM : ym;
    endYM   = (params && params.endYM)   ? params.endYM   : ym;
  }

  const months = _getMonthRange(startYM, endYM);

  // 範圍內交易
  const inRange = all.filter(t => months.includes(String(t.date || '').slice(0, 7)));

  let totalExpense = 0, totalIncome = 0;
  const catMap = {}, payMap = {}, userMap = {};

  inRange.forEach(t => {
    const amt = Number(t.amount) || 0;
    const isExp = t.type === 'expense';
    if (isExp) {
      totalExpense += amt;
      catMap[t.category] = (catMap[t.category] || 0) + amt;
    } else {
      totalIncome += amt;
    }
    payMap[t.paymentMethod] = (payMap[t.paymentMethod] || 0) + amt;
    if (!userMap[t.userId]) userMap[t.userId] = { expense: 0, income: 0, count: 0 };
    if (isExp) userMap[t.userId].expense += amt;
    else       userMap[t.userId].income  += amt;
    userMap[t.userId].count++;
  });

  const expTxns = inRange.filter(t => t.type === 'expense');

  return {
    ok: true,
    monthExpense: totalExpense,
    monthIncome:  totalIncome,
    count:        inRange.length,
    avgAmount:    expTxns.length ? Math.round(totalExpense / expTxns.length) : 0,
    categoryBreakdown: Object.entries(catMap).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount),
    paymentBreakdown:  Object.entries(payMap).map(([method,   amount]) => ({ method,   amount })).sort((a, b) => b.amount - a.amount),
    userBreakdown:     Object.entries(userMap).map(([userId,  v])      => ({ userId, ...v })).sort((a, b) => b.expense - a.expense),
    monthlyTrend:      _buildTrend(all, months),
  };
}

function _getMonthRange(startYM, endYM) {
  const months = [];
  let cur = startYM;
  while (cur <= endYM) {
    months.push(cur);
    cur = _addMonths(cur, 1);
    if (months.length > 60) break; // 安全上限 5 年
  }
  return months;
}

function _buildTrend(all, months) {
  return months.map(ym => {
    const rows = all.filter(t => String(t.date || '').startsWith(ym));
    let expense = 0, income = 0;
    rows.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'expense') expense += amt;
      else                      income  += amt;
    });
    return { yearMonth: ym, expense, income };
  });
}

function _addMonths(ym, delta) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
