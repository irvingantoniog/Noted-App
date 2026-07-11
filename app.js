// app.js — manejo de notas en Supabase
(function(){
  // Inicializar cliente Supabase
  const SUPABASE_URL = 'https://lohrinneyotergkdocde.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_PvJv4N5RvpmQwkZ6sTdB1Q_ZwmBkgnK';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  let notes = [];

  const notesGrid = document.getElementById('notesGrid');
  const noteForm = document.getElementById('noteForm');
  const noteIdInput = document.getElementById('noteId');
  const titleInput = document.getElementById('noteTitle');
  const contentInput = document.getElementById('noteContent');

  // Generar UUID v4
  function generateUUID(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async function renderNotes(){
    notesGrid.innerHTML = '<p style="color:var(--muted)">Cargando...</p>';
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      notes = data || [];
      
      if(!notes.length){
        notesGrid.innerHTML = '<p style="color:var(--muted)">No hay notas aún. Crea una nueva.</p>';
        return;
      }

      notesGrid.innerHTML = '';
      notes.forEach(n => {
        const card = document.createElement('article');
        card.className = 'note-card';
        card.dataset.id = n.id;
        card.innerHTML = `
          <h3>${escapeHtml(n.title)}</h3>
          <p>${escapeHtml(n.content)}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
            <span class="tag">${escapeHtml(n.category || 'General')}</span>
            <div class="note-actions">
              <button class="action edit" data-id="${n.id}" aria-label="Editar">Editar</button>
              <button class="action delete" data-id="${n.id}" aria-label="Borrar">Borrar</button>
            </div>
          </div>
        `;
        notesGrid.appendChild(card);
      });
    } catch(err) {
      notesGrid.innerHTML = `<p style="color:#ef4444">Error cargando notas: ${err.message}</p>`;
    }
  }

  function escapeHtml(str){
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Crear nota nueva en Supabase
  async function createNote(data){
    try {
      const newNote = { id: generateUUID(), ...data };
      const { error } = await supabase
        .from('notes')
        .insert([newNote]);
      if(error) throw error;
      await renderNotes();
    } catch(err) {
      console.error('Error creando nota:', err);
      alert('Error al guardar la nota');
    }
  }

  async function updateNote(id, data){
    try {
      const { error } = await supabase
        .from('notes')
        .update(data)
        .eq('id', id);
      if(error) throw error;
      await renderNotes();
    } catch(err) {
      console.error('Error actualizando nota:', err);
      alert('Error al actualizar la nota');
    }
  }

  async function deleteNote(id){
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      if(error) throw error;
      await renderNotes();
    } catch(err) {
      console.error('Error borrando nota:', err);
      alert('Error al borrar la nota');
    }
  }

  // Manejo del submit del formulario
  noteForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const id = noteIdInput.value;
    const payload = { title: titleInput.value.trim(), content: contentInput.value.trim(), category: getSelectedCategory() };
    if(!payload.title){
      titleInput.focus();
      return;
    }

    if(id){
      await updateNote(id, payload);
    } else {
      await createNote(payload);
    }

    clearForm();
    document.body.focus(); // Quitar focus antes de cerrar modal
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
  notesGrid.addEventListener('click', async (e)=>{
    const editBtn = e.target.closest('.action.edit');
    const delBtn = e.target.closest('.action.delete');
    if(editBtn){
      const id = editBtn.dataset.id;
      startEdit(id);
      return;
    }
    if(delBtn){
      const id = delBtn.dataset.id;
      if(confirm('¿Borrar esta nota?')) await deleteNote(id);
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
