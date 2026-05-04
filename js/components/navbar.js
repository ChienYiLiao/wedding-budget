const Navbar = (() => {
  const ITEMS = [
    { hash: 'dashboard', icon: '🏠', label: '首頁' },
    { hash: 'history',   icon: '📋', label: '記錄' },
    { hash: 'add',       icon: null, label: '',      fab: true },
    { hash: 'stats',     icon: '📊', label: '統計' },
    { hash: 'guide',     icon: '📖', label: '說明' },
  ];

  function render() {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    nav.innerHTML = ITEMS.map(item => {
      if (item.fab) {
        return `<button class="nav-fab" id="nav-fab-add" aria-label="新增記帳">＋</button>`;
      }
      return `
        <button class="nav-item" data-hash="${item.hash}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </button>`;
    }).join('');

    nav.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => Router.navigate(btn.dataset.hash));
    });

    document.getElementById('nav-fab-add')?.addEventListener('click', () => {
      if (typeof AddTransaction !== 'undefined') AddTransaction.open();
    });
  }

  function update(hash) {
    document.querySelectorAll('#navbar .nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.hash === hash);
    });
  }

  return { render, update };
})();
