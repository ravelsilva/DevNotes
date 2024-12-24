// SELECIONANDO ELEMENTOS DA DOM (Document Object Model)
// Container onde as notas serão exibidas
const notesContainer = document.querySelector('#notes-container');
// Input de texto para adicionar uma nova nota
const noteInput = document.querySelector('#note-content');
// Botão para adicionar uma nova nota
const addNoteBtn = document.querySelector('.add-note');
// Input para buscar notas
const searchInput = document.querySelector('#search-input');
// Botão para exportar as notas como arquivo CSV
const exportBtn = document.querySelector('#export-notes');

// FUNÇÕES PRINCIPAIS

// Exibe todas as notas no container
function showNotes() {
    cleanNotes(); // Limpa o container antes de recriar as notas
    getNotes().forEach((note) => {
        // Cria o elemento da nota para cada item salvo
        const noteElement = createNote(note.id, note.content, note.fixed);
        notesContainer.appendChild(noteElement); // Adiciona ao container
    });
}

// Limpa todas as notas visíveis no container
function cleanNotes() {
    notesContainer.replaceChildren([]); // Remove todos os filhos do container
}

// Adiciona uma nova nota ao sistema
function addNote() {
    const notes = getNotes(); // Recupera as notas existentes

    const noteObject = {
        id: generateId(), // Gera um ID único para a nota
        content: noteInput.value, // Pega o texto do input
        fixed: false, // Define que a nota começa não fixada
    };
    console.log(noteObject); // Exibe o objeto da nota no console (para debug)

    const noteElement = createNote(noteObject.id, noteObject.content);
    notesContainer.appendChild(noteElement); // Adiciona a nota ao container visível

    notes.push(noteObject); // Adiciona a nova nota ao array de notas
    saveNotes(notes); // Salva todas as notas no localStorage
    noteInput.value = ''; // Limpa o campo de input
}

// Gera um ID único para cada nota
function generateId() {
    return Math.floor(Math.random() * 5000); // ID aleatório entre 0 e 4999
}

// Cria o elemento visual de uma nota com suas funcionalidades
function createNote(id, content, fixed) {
    const element = document.createElement('div');
    element.classList.add('note'); // Adiciona a classe CSS "note"

    const textarea = document.createElement('textarea');
    textarea.value = content; // Insere o conteúdo da nota no textarea
    textarea.placeholder = 'Adicione algum texto...';

    const pinIcon = document.createElement('i');
    pinIcon.classList.add('bi', 'bi-pin'); // Ícone de fixar a nota

    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('bi', 'bi-x-lg'); // Ícone de excluir a nota

    const duplicateIcon = document.createElement('i');
    duplicateIcon.classList.add('bi', 'bi-file-earmark-plus'); // Ícone de duplicar a nota

    // Adiciona os elementos ao container da nota
    element.appendChild(textarea);
    element.appendChild(pinIcon);
    element.appendChild(deleteIcon);
    element.appendChild(duplicateIcon);

    if (fixed) {
        element.classList.add('fixed'); // Adiciona a classe CSS "fixed" se a nota estiver fixada
    }

    // EVENTOS DA NOTA
    textarea.addEventListener('keyup', (e) => {
        const noteContent = e.target.value; // Obtém o texto digitado
        updateNote(id, noteContent); // Atualiza a nota no localStorage
    });

    pinIcon.addEventListener('click', () => {
        toggleFixNote(id); // Alterna o status de fixar/desfixar a nota
    });

    deleteIcon.addEventListener('click', () => {
        deleteNote(id, element); // Remove a nota
    });

    duplicateIcon.addEventListener('click', () => {
        copyNote(id); // Duplica a nota
    });

    return element; // Retorna o elemento DOM da nota
}

// Alterna o status de fixar/desfixar uma nota
function toggleFixNote(id) {
    const notes = getNotes();
    const targetNote = notes.filter((note) => note.id === id)[0];
    targetNote.fixed = !targetNote.fixed; // Inverte o estado de fixado
    saveNotes(notes); // Salva a alteração no localStorage
    showNotes(); // Atualiza a interface exibindo as notas novamente
}

// Remove uma nota
function deleteNote(id, element) {
    const notes = getNotes().filter((note) => note.id !== id); // Filtra e remove a nota
    saveNotes(notes); // Salva o novo array de notas
    notesContainer.removeChild(element); // Remove a nota da interface
}

// Duplica uma nota existente
function copyNote(id) {
    const notes = getNotes();
    const targetNote = notes.filter((note) => note.id === id)[0]; // Encontra a nota original
    const noteObject = {
        id: generateId(), // Gera um novo ID
        content: targetNote.content, // Copia o conteúdo da nota original
        fixed: false, // Nota duplicada começa não fixada
    };
    const noteElement = createNote(
        noteObject.id,
        noteObject.content,
        noteObject.fixed
    );
    notesContainer.appendChild(noteElement); // Adiciona à interface
    notes.push(noteObject); // Adiciona ao array de notas
    saveNotes(notes); // Salva no localStorage
}

// Atualiza o conteúdo de uma nota
function updateNote(id, newContent) {
    const notes = getNotes();
    const targetNote = notes.filter((note) => note.id === id)[0];
    targetNote.content = newContent; // Atualiza o conteúdo da nota
    saveNotes(notes); // Salva as alterações
}

// Filtra e exibe notas baseadas na busca
function searchNotes(search) {
    const searchResults = getNotes().filter((note) =>
        note.content.includes(search) // Verifica se o conteúdo inclui o texto buscado
    );
    if (search !== '') {
        cleanNotes(); // Limpa a interface antes de exibir os resultados
        searchResults.forEach((note) => {
            const noteElement = createNote(note.id, note.content, note.fixed);
            notesContainer.appendChild(noteElement);
        });
        return; // Sai da função se a busca estiver ativa
    }
    cleanNotes();
    showNotes(); // Exibe todas as notas novamente se a busca estiver vazia
}

// LOCAL STORAGE

// Recupera todas as notas salvas no localStorage
function getNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]'); // Recupera ou retorna array vazio
    return notes.sort((a, b) => (a.fixed > b.fixed ? -1 : 1)); // Ordena para notas fixadas ficarem primeiro
}

// Salva todas as notas no localStorage
function saveNotes(notes) {
    localStorage.setItem('notes', JSON.stringify(notes)); // Converte para string JSON e salva
}

// Exporta todas as notas como arquivo CSV
function exportData() {
    const notes = getNotes();
    const csvString = [
        ['ID', 'Conteúdo', 'Fixado?'],
        ...notes.map((note) => [note.id, note.content, note.fixed]), // Mapeia os dados
    ]
        .map((e) => e.join(',')) // Concatena com vírgulas
        .join('\n'); // Adiciona quebra de linha
    const element = document.createElement('a');
    element.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString); // Cria um link para download
    element.target = '_blank';
    element.download = 'notes.csv';
    element.click(); // Inicia o download
}

// EVENTOS

// Adiciona uma nota ao clicar no botão
addNoteBtn.addEventListener('click', () => addNote());

// Adiciona uma nota ao pressionar Enter
noteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addNote();
    }
});

// Busca notas ao digitar no campo de busca
searchInput.addEventListener('keyup', (e) => {
    const search = e.target.value;
    searchNotes(search);
});

// Exporta notas ao clicar no botão de exportação
exportBtn.addEventListener('click', () => {
    exportData();
});

// INICIALIZAÇÃO
showNotes(); // Exibe as notas ao carregar a página