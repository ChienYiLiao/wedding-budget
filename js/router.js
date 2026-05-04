const Router = (() => {
  let _routes = {};
  let _current = null;
  let _isDirty = false;

  function register(hash, handlers = {}) {
    _routes[hash] = handlers;
  }

  function setDirty(dirty) {
    _isDirty = dirty;
  }

  function isDirty() {
    return _isDirty;
  }

  function navigate(hash, replace = false) {
    if (_isDirty) {
      Modal.confirm('資料尚未儲存', '離開後未儲存的內容將會消失，確定要離開嗎？', {
        confirmText: '離開',
        cancelText: '繼續編輯',
        onConfirm: () => {
          _isDirty = false;
          _doNavigate(hash, replace);
        },
      });
      return;
    }
    _doNavigate(hash, replace);
  }

  function _doNavigate(hash, replace) {
    if (replace) {
      history.replaceState(null, '', `#${hash}`);
    } else {
      window.location.hash = hash;
    }
  }

  function getCurrent() {
    return _current;
  }

  function _getHash() {
    return window.location.hash.slice(1) || 'dashboard';
  }

  function _handleRouteChange() {
    const hash = _getHash();
    if (hash === _current) return;

    if (_current && _routes[_current] && _routes[_current].onLeave) {
      _routes[_current].onLeave();
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const content = document.getElementById('main-content');
    if (content) content.scrollTop = 0;

    const pageEl = document.getElementById(`page-${hash}`);
    if (pageEl) pageEl.classList.add('active');

    _current = hash;

    if (_routes[hash] && _routes[hash].onEnter) {
      _routes[hash].onEnter();
    }

    if (typeof Navbar !== 'undefined') Navbar.update(hash);
    _updateTopbar(hash);
  }

  const PAGE_TITLES = {
    dashboard: '婚禮記帳',
    history:   '歷史記錄',
    stats:     '統計分析',
    guide:     '使用說明',
  };

  function _updateTopbar(hash) {
    const title = document.getElementById('topbar-title');
    const back  = document.getElementById('topbar-back');
    if (title) title.textContent = PAGE_TITLES[hash] || '婚禮記帳';
    if (back) {
      const showBack = hash !== 'dashboard';
      back.classList.toggle('hidden', !showBack);
    }
  }

  function init() {
    window.addEventListener('hashchange', _handleRouteChange);
    _handleRouteChange();
    const backBtn = document.getElementById('topbar-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => navigate('dashboard'));
    }
  }

  return { register, navigate, init, getCurrent, setDirty, isDirty };
})();
