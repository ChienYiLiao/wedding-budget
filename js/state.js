const State = (() => {
  const LS_KEY = 'wedding_budget_state';

  const defaults = {
    currentUser: null,
    gasUrl: '',
    geminiKey: '',
    avatars: {},      // { pigpig: 'data:...' | null }
    dashboardData: null,
    transactionsCache: {},  // { 'YYYY-MM': [...] }
    statsData: null,
    settings: {
      weddingDate: '2027-05-03',
      totalBudget: 1000000,
    },
  };

  let _state = { ...defaults };
  const _listeners = [];

  function _load() {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedSettings = parsed.settings || {};
        _state = {
          ...defaults,
          ...parsed,
          settings: {
            ...defaults.settings,
            ...(savedSettings.weddingDate ? { weddingDate: savedSettings.weddingDate } : {}),
            ...(savedSettings.totalBudget ? { totalBudget: savedSettings.totalBudget } : {}),
          },
        };
      }
    } catch (_) { /* ignore */ }
  }

  function _persist() {
    try {
      const { dashboardData, transactionsCache, statsData, ...toSave } = _state;
      localStorage.setItem(LS_KEY, JSON.stringify(toSave));
    } catch (_) { /* ignore */ }
  }

  function get(key) {
    return key ? _state[key] : { ..._state };
  }

  function set(patch) {
    _state = { ..._state, ...patch };
    _persist();
    _listeners.forEach(fn => fn(_state));
  }

  function subscribe(fn) {
    _listeners.push(fn);
    return () => _listeners.splice(_listeners.indexOf(fn), 1);
  }

  function getAvatar(userId) {
    return _state.avatars[userId] || null;
  }

  function setAvatar(userId, dataUrl) {
    set({ avatars: { ..._state.avatars, [userId]: dataUrl } });
  }

  function getSettings() {
    return { ...defaults.settings, ..._state.settings };
  }

  function updateSettings(patch) {
    set({ settings: { ..._state.settings, ...patch } });
  }

  function invalidateCache() {
    set({ dashboardData: null, transactionsCache: {}, statsData: null });
  }

  _load();

  return { get, set, subscribe, getAvatar, setAvatar, getSettings, updateSettings, invalidateCache };
})();
