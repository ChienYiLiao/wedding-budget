const Modal = (() => {
  let _overlay, _box, _title, _message, _input, _actions;

  function _init() {
    _overlay = document.getElementById('modal-overlay');
    _box     = document.getElementById('modal-box');
    _title   = document.getElementById('modal-title');
    _message = document.getElementById('modal-message');
    _input   = document.getElementById('modal-input');
    _actions = document.getElementById('modal-actions');
  }

  function _show() {
    _overlay.classList.add('visible');
  }

  function _hide() {
    _overlay.classList.remove('visible');
  }

  function confirm(title, message, {
    confirmText = '確認',
    cancelText  = '取消',
    destructive = false,
    onConfirm   = null,
    onCancel    = null,
  } = {}) {
    _init();
    _title.textContent   = title;
    _message.textContent = message;
    _input.style.display = 'none';
    _actions.innerHTML = '';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = cancelText;
    cancelBtn.addEventListener('click', () => {
      _hide();
      onCancel && onCancel();
    });

    const confirmBtn = document.createElement('button');
    confirmBtn.className = `btn ${destructive ? 'btn-danger' : 'btn-primary'}`;
    confirmBtn.textContent = confirmText;
    confirmBtn.addEventListener('click', () => {
      _hide();
      onConfirm && onConfirm();
    });

    _actions.appendChild(cancelBtn);
    _actions.appendChild(confirmBtn);
    _show();
  }

  function prompt(title, message, {
    placeholder  = '',
    defaultValue = '',
    confirmText  = '確認',
    cancelText   = '取消',
    inputType    = 'text',
    onConfirm    = null,
    onCancel     = null,
  } = {}) {
    _init();
    _title.textContent    = title;
    _message.textContent  = message;
    _input.style.display  = 'block';
    _input.type           = inputType;
    _input.placeholder    = placeholder;
    _input.value          = defaultValue;
    _actions.innerHTML    = '';

    const cancelBtn = document.createElement('button');
    cancelBtn.className   = 'btn btn-secondary';
    cancelBtn.textContent = cancelText;
    cancelBtn.addEventListener('click', () => {
      _hide();
      onCancel && onCancel();
    });

    const confirmBtn = document.createElement('button');
    confirmBtn.className   = 'btn btn-primary';
    confirmBtn.textContent = confirmText;
    confirmBtn.addEventListener('click', () => {
      _hide();
      onConfirm && onConfirm(_input.value);
    });

    _actions.appendChild(cancelBtn);
    _actions.appendChild(confirmBtn);
    _show();

    setTimeout(() => _input.focus(), 100);
  }

  function alert(title, message, { onClose } = {}) {
    _init();
    _title.textContent   = title;
    _message.textContent = message;
    _input.style.display = 'none';
    _actions.innerHTML   = '';

    const btn = document.createElement('button');
    btn.className   = 'btn btn-primary btn-full';
    btn.textContent = '確認';
    btn.addEventListener('click', () => {
      _hide();
      onClose && onClose();
    });
    _actions.appendChild(btn);
    _show();
  }

  return { confirm, prompt, alert };
})();
