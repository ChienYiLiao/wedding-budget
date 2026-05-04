// ===== Dashboard 資料聚合 =====

function getDashboard() {
  const sheet = getTxnSheet();
  const all = readAllRows(sheet);

  const tz = Session.getScriptTimeZone();
  const today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const thisMonth = today.slice(0, 7);

  let todayExpense = 0, monthExpense = 0, monthIncome = 0, totalExpense = 0, totalIncome = 0;
  const catMap = {};

  all.forEach(t => {
    const amt = Number(t.amount) || 0;
    const isExp = t.type === 'expense';
    if (isExp) totalExpense += amt;
    else       totalIncome += amt;

    if (String(t.date).startsWith(thisMonth)) {
      if (isExp) { monthExpense += amt; catMap[t.category] = (catMap[t.category] || 0) + amt; }
      else       { monthIncome += amt; }
    }
    if (t.date === today && isExp) todayExpense += amt;
  });

  const categoryBreakdown = Object.entries(catMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const recent = all
    .filter(t => String(t.date).startsWith(thisMonth))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 5);

  return {
    ok: true,
    todayExpense, monthExpense, monthIncome, totalExpense, totalIncome,
    categoryBreakdown,
    recentTransactions: recent,
  };
}
