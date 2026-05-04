const Toast = (() => {
  let _container;

  function _init() {
    if (!_container) {
      _container = document.getElementById('toast-container');
    }
  }

  function show(message, { type = 'default', duration = 3000, undoCallback = null } = {}) {
    _init();
    if (!_container) return;

    const el = document.createElement('div');
    el.className = `toast-item toast-${type}`;

    const msg = document.createElement('span');
    msg.className = 'toast-msg';
    msg.textContent = message;
    el.appendChild(msg);

    let timer;

    if (undoCallback) {
      const undoBtn = document.createElement('button');
      undoBtn.className = 'toast-undo';
      undoBtn.textContent = '撤銷';
      undoBtn.addEventListener('click', () => {
        clearTimeout(timer);
        el.remove();
        undoCallback();
      });
      el.appendChild(undoBtn);
    }

    _container.appendChild(el);

    timer = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  function success(msg, opts) { show(msg, { type: 'success', ...opts }); }
  function error(msg, opts)   { show(msg, { type: 'error',   duration: 4000, ...opts }); }

  // 帶撤銷的成功提示（5 秒）
  function successWithUndo(msg, undoCallback) {
    show(msg, { type: 'success', duration: 5000, undoCallback });
  }

  return { show, success, error, successWithUndo };
})();
