const CONFIG = {
  VERSION: '1.0.0',
  APP_NAME: '婚禮記帳',

  // GAS Web App URL — 部署後填入，或使用者在首次進入時輸入
  GAS_URL: '',

  USERS: [
    { id: 'pigpig', name: '豬豬', emoji: '🐷', defaultAvatar: 'assets/default-avatars/pigpig.png' },
    { id: 'gungun', name: '滾滾', emoji: '🧚‍♀️', defaultAvatar: 'assets/default-avatars/gungun.png' },
  ],

  EXPENSE_CATEGORIES: [
    { name: '訂婚戒指', emoji: '💍' },
    { name: '結婚對戒', emoji: '💎' },
    { name: '喜餅/訂婚餅', emoji: '🎂' },
    { name: '婚宴飯店', emoji: '🏨' },
    { name: '聘金', emoji: '🧧' },
    { name: '嫁妝', emoji: '🎁' },
    { name: '喜帖', emoji: '✉️' },
    { name: '結婚小物', emoji: '🎀' },
    { name: '婚紗攝影', emoji: '📸' },
    { name: '新娘秘書/造型', emoji: '💄' },
    { name: '婚禮布置/花藝', emoji: '💐' },
    { name: '蜜月旅遊', emoji: '✈️' },
    { name: '婚車', emoji: '🚗' },
    { name: '主持人/音響', emoji: '🎤' },
    { name: '其他', emoji: '📦' },
  ],

  INCOME_CATEGORIES: [
    { name: '贊助', emoji: '🤝' },
    { name: '禮金', emoji: '🧧' },
    { name: '彩禮回禮', emoji: '🎁' },
    { name: '其他', emoji: '💰' },
  ],

  PAYMENT_METHODS: [
    { key: 'cash',          label: '現金',  emoji: '💵' },
    { key: 'credit_card',   label: '信用卡', emoji: '💳' },
    { key: 'easy_card',     label: '悠遊卡', emoji: '🎫' },
    { key: 'bank_transfer', label: '轉帳',  emoji: '🏦' },
  ],

  // Chart.js 顏色 (對應 EXPENSE_CATEGORIES 順序)
  CHART_COLORS: [
    '#C9956A','#D4889A','#8A9EC4','#7AA88A','#C4A87A',
    '#A08EC4','#C28A8A','#8ABCAA','#D4B48A','#9AC8C4',
    '#C4B88A','#A8B8C4','#B8A8C4','#C4A8A0','#B8B8B8',
  ],
};

// helpers
CONFIG.getCategoryEmoji = function(name, type = 'expense') {
  const list = type === 'income' ? CONFIG.INCOME_CATEGORIES : CONFIG.EXPENSE_CATEGORIES;
  return (list.find(c => c.name === name) || {}).emoji || '📦';
};
CONFIG.getPaymentLabel = function(key) {
  return (CONFIG.PAYMENT_METHODS.find(p => p.key === key) || {}).label || key;
};
CONFIG.getPaymentEmoji = function(key) {
  return (CONFIG.PAYMENT_METHODS.find(p => p.key === key) || {}).emoji || '';
};
CONFIG.getUserById = function(id) {
  return CONFIG.USERS.find(u => u.id === id) || CONFIG.USERS[0];
};
