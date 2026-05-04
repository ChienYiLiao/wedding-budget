const AddTransaction = (() => {
  let _overlay, _sheet;
  let _type = 'expense';
  let _selectedCat = null;
  let _selectedPay = 'cash';
  let _selectedUser = null;
  let _isDirty = false;

  function _init() {
    _overlay = document.getElementById('add-sheet-overlay');
    _sheet   = document.getElementById('add-sheet');

    _overlay.addEventListener('click', _tryClose);
    document.getElementById('add-sheet-close').addEventListener('click', _tryClose);

    document.getElementById('add-type-expense').addEventListener('click', () => _setType('expense'));
    document.getElementById('add-type-income').addEventListener('click',  () => _setType('income'));

    document.getElementById('add-amount').addEventListener('input', _markDirty);
    document.getElementById('add-note').addEventListener('input',   _markDirty);
    document.getElementById('add-merchant').addEventListener('input', _markDirty);

    document.getElementById('add-submit').addEventListener('click', _submit);

    // 支付方式
    document.querySelectorAll('#add-payment-chips .pay-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        _selectedPay = chip.dataset.pay;
        _renderPaymentChips();
        _markDirty();
      });
    });

    // 人員
    document.querySelectorAll('#add-user-chips .user-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        _selectedUser = chip.dataset.user;
        _renderUserChips();
        _markDirty();
      });
    });
  }

  function open(prefill = {}) {
    if (!_overlay) _init();

    _type = prefill.type || 'expense';
    _selectedCat  = prefill.category || null;
    _selectedPay  = prefill.paymentMethod || 'cash';
    _selectedUser = prefill.userId || State.get('currentUser');
    _isDirty      = false;

    document.getElementById('add-amount').value   = prefill.amount || '';
    document.getElementById('add-note').value     = prefill.note || '';
    document.getElementById('add-merchant').value = prefill.merchant || '';
    document.getElementById('add-date').value     = prefill.date || Utils.today();

    _setType(_type, false);
    _renderPaymentChips();
    _renderUserChips();

    _overlay.classList.add('visible');
    requestAnimationFrame(() => _sheet.classList.add('open'));
    setTimeout(() => document.getElementById('add-amount').focus(), 350);
  }

  function close() {
    _sheet.classList.remove('open');
    setTimeout(() => {
      _overlay.classList.remove('visible');
      _isDirty = false;
    }, 300);
  }

  function _tryClose() {
    if (_isDirty) {
      Modal.confirm('放棄此次輸入？', '表單已填寫的內容將會消失', {
        confirmText: '放棄',
        cancelText: '繼續填寫',
        destructive: true,
        onConfirm: close,
      });
    } else {
      close();
    }
  }

  function _markDirty() {
    _isDirty = true;
  }

  function _setType(type, animate = true) {
    _type = type;
    _selectedCat = null;

    document.getElementById('add-type-expense').classList.toggle('active', type === 'expense');
    document.getElementById('add-type-income').classList.toggle('active', type === 'income');
    document.getElementById('add-type-expense').classList.toggle('expense-tab', true);
    document.getElementById('add-type-income').classList.toggle('income-tab',  true);

    _renderCategories();
    if (animate) _markDirty();
  }

  function _renderCategories() {
    const list = _type === 'expense' ? CONFIG.EXPENSE_CATEGORIES : CONFIG.INCOME_CATEGORIES;
    const grid = document.getElementById('add-cat-grid');
    grid.innerHTML = list.map(cat => `
      <button class="cat-btn ${_selectedCat === cat.name ? 'selected' : ''}" data-cat="${cat.name}">
        <span class="cat-emoji">${cat.emoji}</span>
        <span class="cat-name">${cat.name}</span>
      </button>`).join('');

    grid.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _selectedCat = btn.dataset.cat;
        grid.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        _markDirty();
      });
    });
  }

  function _renderPaymentChips() {
    document.querySelectorAll('#add-payment-chips .pay-chip').forEach(chip => {
      chip.classList.toggle('selected', chip.dataset.pay === _selectedPay);
    });
  }

  function _renderUserChips() {
    document.querySelectorAll('#add-user-chips .user-chip').forEach(chip => {
      chip.classList.toggle('selected', chip.dataset.user === _selectedUser);
    });

    document.querySelectorAll('#add-user-chips .user-chip .user-chip-avatar').forEach(el => {
      const uid = el.closest('.user-chip').dataset.user;
      const dataUrl = State.getAvatar(uid);
      const user = CONFIG.getUserById(uid);
      if (dataUrl) {
        el.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover">`;
      } else {
        el.textContent = user.emoji;
      }
    });
  }

  async function _submit() {
    const amount = parseFloat(document.getElementById('add-amount').value);
    if (!amount || amount <= 0) { Toast.error('請輸入有效金額'); return; }
    if (!_selectedCat)          { Toast.error('請選擇類別');   return; }
    if (!_selectedUser)         { Toast.error('請選擇人員');   return; }

    const txn = {
      txnId:         Utils.uid(),
      date:          document.getElementById('add-date').value || Utils.today(),
      time:          new Date().toTimeString().slice(0, 5),
      userId:        _selectedUser,
      type:          _type,
      category:      _selectedCat,
      amount:        amount,
      paymentMethod: _selectedPay,
      merchant:      document.getElementById('add-merchant').value.trim(),
      note:          document.getElementById('add-note').value.trim(),
    };

    const gasUrl = State.get('gasUrl');
    if (!gasUrl) {
      Toast.error('尚未設定 GAS，無法儲存');
      return;
    }

    try {
      Loader.show();
      const res = await API.addTransaction(txn);
      _isDirty = false;
      close();

      Toast.successWithUndo(
        `已新增 ${txn.category} ${Utils.formatMoney(txn.amount)}`,
        async () => {
          try {
            await API.deleteTransaction(res.txnId || txn.txnId);
            Toast.success('已撤銷');
            Dashboard.refresh();
          } catch (e) {
            Toast.error('撤銷失敗：' + e.message);
          }
        }
      );

      Dashboard.refresh();
    } catch (e) {
      Toast.error('儲存失敗：' + e.message);
    } finally {
      Loader.hide();
    }
  }

  return { open, close };
})();
