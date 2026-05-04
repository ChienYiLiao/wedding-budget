const Loader = (() => {
  let _el;
  let _count = 0;

  function _init() {
    if (!_el) _el = document.getElementById('loader-overlay');
  }

  function show() {
    _init();
    _count++;
    if (_el) _el.classList.add('visible');
  }

  function hide() {
    _init();
    _count = Math.max(0, _count - 1);
    if (_count === 0 && _el) _el.classList.remove('visible');
  }

  function wrap(fn) {
    return async (...args) => {
      show();
      try {
        return await fn(...args);
      } finally {
        hide();
      }
    };
  }

  return { show, hide, wrap };
})();
