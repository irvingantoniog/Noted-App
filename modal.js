// modal.js — control mínimo para abrir/cerrar el modal
(function(){
  const modal = document.getElementById('modal');
  const openBtn = document.getElementById('newNoteBtn');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');

  function openModal(){
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    // focus primero campo
    const title = document.getElementById('noteTitle');
    if(title) title.focus();
  }
  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  }

  // Exponer API simple para que otras partes (app.js) puedan usarlo
  window.modal = { open: openModal, close: closeModal };

  // manejadores básicos
  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();
