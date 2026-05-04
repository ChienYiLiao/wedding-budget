// ===== 收支記帳 CRUD =====

const TXN_HEADERS = ['txnId','date','time','userId','type','category','amount','paymentMethod','merchant','note','receiptUrl','createdAt'];

function getTxnSheet() {
  return getSheet('Transactions', TXN_HEADERS);
}

function addTransaction(txn) {
  const sheet = getTxnSheet();
  const existing = readAllRows(sheet);
  if (txn.txnId && existing.find(r => r.txnId === txn.txnId)) {
    return { ok: true, txnId: txn.txnId, duplicate: true };
  }
  const row = {
    txnId:         txn.txnId || Utilities.getUuid(),
    date:          txn.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    time:          txn.time || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm'),
    userId:        txn.userId || '',
    type:          txn.type || 'expense',
    category:      txn.category || '',
    amount:        Number(txn.amount) || 0,
    paymentMethod: txn.paymentMethod || 'cash',
    merchant:      txn.merchant || '',
    note:          txn.note || '',
    receiptUrl:    txn.receiptUrl || '',
    createdAt:     Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
  };
  appendRow(sheet, TXN_HEADERS, row);
  return { ok: true, txnId: row.txnId };
}

function deleteTransaction(txnId) {
  const sheet = getTxnSheet();
  const deleted = deleteRow(sheet, TXN_HEADERS, 'txnId', txnId);
  return { ok: deleted };
}

function getTransactions(yearMonth) {
  const sheet = getTxnSheet();
  let rows = readAllRows(sheet);
  if (yearMonth) {
    rows = rows.filter(r => String(r.date || '').startsWith(yearMonth));
  }
  rows.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  return { ok: true, transactions: rows };
}
