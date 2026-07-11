// app.js — manejo de notas en memoria (preparado para Supabase)
(function(){
  // Datos en memoria
  let notes = [
    { id: '1', title: 'Comprar más café', content: 'Necesitamos combustible para funcionar.', tag: 'Hoy', category: 'Trabajo' },
    { id: '2', title: 'Grabar contenido', content: 'Tema: cómo construir tu primera aplicación web.', tag: 'Ayer', category: 'Ideas' },
    { id: '3', title: 'Idea para reunión', content: 'PowerPoint Party.', tag: 'Lunes', category: 'Personal' }
  ];

  // Placeholder Supabase client (lista para configurar)
  // const SUPABASE_URL = 'https://...';
  // const SUPABASE_KEY = 'public-anon-key';
  // const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const notesGrid = document.getElementById('notesGrid');
  const noteForm = document.getElementById('noteForm');
  const noteIdInput = document.getElementById('noteId');
  const titleInput = document.getElementById('noteTitle');
  const contentInput = document.getElementById('noteContent');

  function renderNotes(){
    notesGrid.innerHTML = '';
    if(!notes.length){
      notesGrid.innerHTML = '<p style="color:var(--muted)">No hay notas aún. Crea una nueva.</p>';
      return;
    }

    notes.forEach(n => {
      const card = document.createElement('article');
      card.className = 'note-card';
      card.dataset.id = n.id;
      card.innerHTML = `
        <h3>${escapeHtml(n.title)}</h3>
        <p>${escapeHtml(n.content)}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <span class="tag">${escapeHtml(n.tag || '')}</span>
          <div class="note-actions">
            <button class="action edit" data-id="${n.id}" aria-label="Editar">Editar</button>
            <button class="action delete" data-id="${n.id}" aria-label="Borrar">Borrar</button>
          </div>
        </div>
      `;
      notesGrid.appendChild(card);
    });
  }

  function escapeHtml(str){
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Crear nota nueva en memoria
  function createNote(data){
    const id = Date.now().toString();
    const note = Object.assign({ id, tag: 'Hoy' }, data);
    notes.unshift(note);
    renderNotes();
    // TODO: enviar a Supabase
  }

  function updateNote(id, data){
    const idx = notes.findIndex(x=>x.id===id);
    if(idx === -1) return;
    notes[idx] = Object.assign({}, notes[idx], data);
    renderNotes();
    // TODO: actualizar en Supabase
  }

  function deleteNote(id){
    notes = notes.filter(x=>x.id!==id);
    renderNotes();
    // TODO: borrar en Supabase
  }

  // Manejo del submit del formulario
  noteForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const id = noteIdInput.value;
    const payload = { title: titleInput.value.trim(), content: contentInput.value.trim(), category: getSelectedCategory() };
    if(!payload.title){
      titleInput.focus();
      return;
    }

    if(id){
      updateNote(id, payload);
    } else {
      createNote(payload);
    }

    clearForm();
    window.modal.close();
  });

  function getSelectedCategory(){
    const el = document.querySelector('input[name="category"]:checked');
    return el ? el.value : '';
  }

  function clearForm(){
    noteIdInput.value = '';
    titleInput.value = '';
    contentInput.value = '';
    const firstCat = document.querySelector('input[name="category"]');
    if(firstCat) firstCat.checked = true;
  }

  // Delegación de eventos para editar / borrar
  notesGrid.addEventListener('click', (e)=>{
    const editBtn = e.target.closest('.action.edit');
    const delBtn = e.target.closest('.action.delete');
    if(editBtn){
      const id = editBtn.dataset.id;
      startEdit(id);
      return;
    }
    if(delBtn){
      const id = delBtn.dataset.id;
      if(confirm('¿Borrar esta nota?')) deleteNote(id);
    }
  });

  function startEdit(id){
    const note = notes.find(x=>x.id===id);
    if(!note) return;
    noteIdInput.value = note.id;
    titleInput.value = note.title;
    contentInput.value = note.content;
    const cat = document.querySelector(`input[name="category"][value="${note.category}"]`);
    if(cat) cat.checked = true;
    window.modal.open();
  }

  // Inicializar
  renderNotes();

})();
