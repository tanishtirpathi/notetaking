const toggleNav = document.getElementById("toggle-nav");
const closeNav = document.getElementById("close-nav");
const sidebar = document.getElementById("sidebar");
const addNoteButton = document.getElementById("add-note");
const noteModal = document.getElementById("note-modal");
const closeModal = document.getElementById("close-modal");
const saveModalNote = document.getElementById("save-modal-note");
const modalNoteArea = document.getElementById("modal-note-area");
const notesList = document.getElementById("notes-list");
const notesDisplay = document.getElementById("notes-display");
const colorButtons = document.querySelectorAll(".color");

let notes = [];
let currentNoteId = null;
let selectedColor = "#161616"; // Default color

// Initialize app
function init() {
  loadNotes();
  renderNotes();
  setupEventListeners();
}

function setupEventListeners() {
  // Navigation toggle
  toggleNav.addEventListener("click", () => {
    sidebar.classList.remove("hidden");
  });

  closeNav.addEventListener("click", () => {
    sidebar.classList.add("hidden");
  });

  addNoteButton.addEventListener("click", openNewNoteModal);
  closeModal.addEventListener("click", closeNoteModal);
  saveModalNote.addEventListener("click", saveNote);

  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      colorButtons.forEach((btn) => btn.classList.remove("selected"));

      button.classList.add("selected");

      selectedColor = button.dataset.color;
      modalNoteArea.style.backgroundColor = selectedColor;
    });
  });
}

function loadNotes() {
  const savedNotes = localStorage.getItem("notes");

  if (savedNotes) {
    notes = JSON.parse(savedNotes);
  }
}

function saveNotesToStorage() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function renderNotes() {
  renderSidebarNotes();
  renderDisplayNotes();
}

function renderSidebarNotes() {
  notesList.innerHTML = "";

  notes.forEach((note) => {
    const noteItem = document.createElement("div");
    noteItem.className = "sidebar-note-item";
    noteItem.innerHTML = `
      <span>${note.content.substring(0, 25)}${
      note.content.length > 25 ? "..." : ""
    }</span>
      <button class="delete-note" data-id="${note.id}">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;

    noteItem.addEventListener("click", (e) => {
      if (e.target.closest(".delete-note")) {
        return;
      }

      openExistingNoteModal(note);
    });

    notesList.appendChild(noteItem);
  });

  document.querySelectorAll(".delete-note").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = button.dataset.id;
      deleteNote(id);
    });
  });
}

function renderDisplayNotes() {
  notesDisplay.innerHTML = "";

  if (notes.length === 0) {
    notesDisplay.innerHTML =
      "<p class='no-notes'>No notes yet. Click 'new note' to get started!</p>";
    return;
  }

  notes.forEach((note) => {
    const noteCard = document.createElement("div");
    noteCard.className = "note-card";
    noteCard.style.backgroundColor = note.color;

    noteCard.innerHTML = `
      <div class="note-actions">
        <button class="edit-note" data-id="${note.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-note-card" data-id="${note.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
      <div class="note-content">${note.content}</div>
    `;

    notesDisplay.appendChild(noteCard);
  });

  document.querySelectorAll(".edit-note").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = button.dataset.id;
      const note = notes.find((note) => note.id === id);
      openExistingNoteModal(note);
    });
  });

  document.querySelectorAll(".delete-note-card").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = button.dataset.id;
      deleteNote(id);
    });
  });
}

function openNewNoteModal() {
  currentNoteId = null;
  modalNoteArea.innerHTML = "";
  modalNoteArea.style.backgroundColor = "#161616";
  selectedColor = "#161616";

  // Reset color selection
  colorButtons.forEach((btn) => btn.classList.remove("selected"));
  document.querySelector(".color.black").classList.add("selected");

  noteModal.classList.remove("hidden");
}

function openExistingNoteModal(note) {
  currentNoteId = note.id;
  modalNoteArea.innerHTML = note.content;
  modalNoteArea.style.backgroundColor = note.color;
  selectedColor = note.color;

  colorButtons.forEach((btn) => {
    btn.classList.remove("selected");
    if (btn.dataset.color === note.color) {
      btn.classList.add("selected");
    }
  });

  noteModal.classList.remove("hidden");
}

function closeNoteModal() {
  noteModal.classList.add("hidden");
}

function saveNote() {
  const content = modalNoteArea.innerHTML.trim();

  if (!content) {
    alert("Note cannot be empty!");
    return;
  }

  if (currentNoteId) {
    const noteIndex = notes.findIndex((note) => note.id === currentNoteId);

    if (noteIndex !== -1) {
      notes[noteIndex].content = content;
      notes[noteIndex].color = selectedColor;
      notes[noteIndex].updatedAt = new Date().toISOString();
    }
  } else {
    const newNote = {
      id: generateId(),
      content: content,
      color: selectedColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  saveNotesToStorage();
  renderNotes();
  closeNoteModal();
}

function deleteNote(id) {
  if (confirm("Are you sure you want to delete this note?")) {
    notes = notes.filter((note) => note.id !== id);
    saveNotesToStorage();
    renderNotes();
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
