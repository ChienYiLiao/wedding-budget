// ===== 統計分析 =====

function getStats(yearMonth) {
  const sheet = getTxnSheet();
  const all = readAllRows(sheet);

  // 指定月份資料
  const monthly = all.filter(t => String(t.date || '').startsWith(yearMonth));

  let monthExpense = 0, monthIncome = 0;
  const catMap = {}, payMap = {}, userMap = {};

  monthly.forEach(t => {
    const amt = Number(t.amount) || 0;
    const isExp = t.type === 'expense';
    if (isExp) { monthExpense += amt; catMap[t.category] = (catMap[t.category] || 0) + amt; }
    else         monthIncome += amt;
    payMap[t.paymentMethod] = (payMap[t.paymentMethod] || 0) + amt;
    if (!userMap[t.userId]) userMap[t.userId] = { expense: 0, income: 0, count: 0 };
    if (isExp) userMap[t.userId].expense += amt;
    else       userMap[t.userId].income  += amt;
    userMap[t.userId].count++;
  });

  const count = monthly.length;
  const avgAmount = count > 0 ? Math.round(monthExpense / monthly.filter(t => t.type === 'expense').length || 0) : 0;

  // 逐月趨勢（最近 6 個月）
  const monthlyTrend = _getMonthlyTrend(all, yearMonth, 6);

  return {
    ok: true,
    monthExpense, monthIncome, count,
    avgAmount: monthly.filter(t => t.type === 'expense').length ? Math.round(monthExpense / monthly.filter(t => t.type === 'expense').length) : 0,
    categoryBreakdown: Object.entries(catMap).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount),
    paymentBreakdown:  Object.entries(payMap).map(([method, amount]) => ({ method, amount })).sort((a, b) => b.amount - a.amount),
    userBreakdown:     Object.entries(userMap).map(([userId, v]) => ({ userId, ...v })).sort((a, b) => b.expense - a.expense),
    monthlyTrend,
  };
}

function _getMonthlyTrend(all, currentYM, months) {
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const ym = _addMonths(currentYM, -i);
    const rows = all.filter(t => String(t.date || '').startsWith(ym));
    let expense = 0, income = 0;
    rows.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'expense') expense += amt;
      else                      income  += amt;
    });
    result.push({ yearMonth: ym, expense, income });
  }
  return result;
}

function _addMonths(ym, delta) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
