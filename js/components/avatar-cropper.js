const AvatarCropper = (() => {
  let _modal, _imgEl, _cropper;
  let _onDone, _userId;

  function _init() {
    _modal = document.getElementById('cropper-modal');
    _imgEl = document.getElementById('cropper-img');

    document.getElementById('cropper-cancel')?.addEventListener('click', close);
    document.getElementById('cropper-confirm')?.addEventListener('click', _confirm);
  }

  function open(userId, onDone) {
    _onDone = onDone;
    _userId = userId;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => _showCropper(ev.target.result);
      reader.readAsDataURL(file);
    });
    input.click();
  }

  function openCamera(userId, onDone) {
    _onDone = onDone;
    _userId = userId;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user';
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => _showCropper(ev.target.result);
      reader.readAsDataURL(file);
    });
    input.click();
  }

  function _showCropper(src) {
    if (!_modal) _init();
    _modal.classList.add('visible');

    if (_cropper) { _cropper.destroy(); _cropper = null; }
    _imgEl.src = src;

    _imgEl.onload = () => {
      _cropper = new Cropper(_imgEl, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        background: false,
        autoCropArea: 0.8,
        responsive: true,
      });
    };
  }

  function _confirm() {
    if (!_cropper) return;

    const canvas = _cropper.getCroppedCanvas({
      width: 280, height: 280,
      imageSmoothingQuality: 'high',
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    State.setAvatar(_userId, dataUrl);

    close();
    _onDone && _onDone(dataUrl);
  }

  function close() {
    if (_cropper) { _cropper.destroy(); _cropper = null; }
    if (_modal) _modal.classList.remove('visible');
  }

  return { open, openCamera, close };
})();
