document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const elements = {
    sidebar: document.getElementById("sidebar"),
    toggleNavBtn: document.getElementById("toggle-nav"),
    closeNavBtn: document.getElementById("close-nav"),
    notesList: document.getElementById("notes-list"),
    notesDisplay: document.getElementById("notes-display"),
    modal: document.getElementById("note-modal"),
    noteArea: document.getElementById("modal-note-area"),
    saveNoteBtn: document.getElementById("save-modal-note"),
    addNoteBtn: document.getElementById("add-note"),
    colorButtons: document.querySelectorAll(".color"),
  };

  // State
  document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const elements = {
      sidebar: document.getElementById("sidebar"),
      toggleNavBtn: document.getElementById("toggle-nav"),
      closeNavBtn: document.getElementById("close-nav"),
      notesList: document.getElementById("notes-list"),
      notesDisplay: document.getElementById("notes-display"),
      modal: document.getElementById("note-modal"),
      noteArea: document.getElementById("modal-note-area"),
      saveNoteBtn: document.getElementById("save-modal-note"),
      addNoteBtn: document.getElementById("add-note"),
      colorButtons: document.querySelectorAll(".color"),
    };

    // State
    const state = {
      notes: localStorage.getItem("notes") || [],
      editingIndex: null,
      selectedColor: "#71dbc4", // Default color
    };

    // Initialize
    function init() {
      renderNotes();
      setupEventListeners();

      // Handle color selection
      elements.colorButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const color = button.getAttribute("data-color");
          selectColor(color, button);
        });

        // Set default selected color
        if (button.getAttribute("data-color") === state.selectedColor) {
          button.classList.add("selected");
        }
      });
    }

    // Event Listeners
    function setupEventListeners() {
      // Navigation
      elements.toggleNavBtn.addEventListener("click", toggleSidebar);
      elements.closeNavBtn.addEventListener("click", toggleSidebar);

      // Modal actions
      elements.addNoteBtn.addEventListener("click", () => openModal());
      elements.saveNoteBtn.addEventListener("click", saveNote);
      elements.modal.addEventListener("click", (e) => {
        if (e.target === elements.modal) closeModal();
      });
      document
        .getElementById("close-modal")
        .addEventListener("click", closeModal);

      // Event delegation for note actions
      elements.notesList.addEventListener("click", handleSidebarNoteActions);
      elements.notesDisplay.addEventListener("click", handleMainNoteActions);

      // Add keyboard shortcuts
      document.addEventListener("keydown", handleKeyboardShortcuts);
    }

    // Helper Functions
    function toggleSidebar() {
      elements.sidebar.classList.toggle("hidden");
    }

    function selectColor(color, selectedButton) {
      // Remove selected class from all buttons
      elements.colorButtons.forEach((btn) => btn.classList.remove("selected"));

      // Add selected class to clicked button
      if (selectedButton) selectedButton.classList.add("selected");

      // Update selected color
      state.selectedColor = color;
    }

    function saveNotes() {
      localStorage.setItem("notes", JSON.stringify(state.notes));
    }

    function createNoteObject(content) {
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // More unique ID
        content: content.trim(),
        color: state.selectedColor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    function renderNotes() {
      // Clear containers
      elements.notesList.innerHTML = "";
      elements.notesDisplay.innerHTML = "";

      if (state.notes.length === 0) {
        elements.notesDisplay.innerHTML = `
          <div class="empty-notes">
            <p>No notes yet. Click "new note" to get started!</p>
          </div>
        `;
        return;
      }

      // Sort notes by updated date (newest first)
      const sortedNotes = [...state.notes].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      sortedNotes.forEach((note, index) => {
        // Sidebar note item - Add delete button with data-id
        const noteItem = document.createElement("div");
        noteItem.className = "sidebar-note-item";
        noteItem.setAttribute("data-id", note.id); // Add data-id to the item itself
        const notePreview = note.content.substring(0, 20).replace(/\n/g, " ");
        noteItem.innerHTML = `
          <span>${notePreview}${notePreview.length >= 20 ? "..." : ""}</span>
          <button class="delete-note" data-id="${note.id}">🗑</button>
        `;
        elements.notesList.appendChild(noteItem);

        // Main note card
        const noteCard = document.createElement("div");
        noteCard.className = "note-card";
        noteCard.style.backgroundColor = note.color;
        noteCard.style.borderColor = note.color;

        // Format date
        const updatedDate = new Date(note.updatedAt);
        const formattedDate =
          updatedDate.toLocaleDateString() +
          " " +
          updatedDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

        // Use data-id for identification
        noteCard.innerHTML = `
          <div class="note-actions">
            <button class="edit-note" data-id="${note.id}">✏️</button>
            <button class="delete-note-card" data-id="${note.id}">🗑</button>
          </div>
          <div class="note-content">${note.content}</div>
          <div class="note-date">Updated: ${formattedDate}</div>
        `;
        elements.notesDisplay.appendChild(noteCard);
      });
    }

    function getNoteById(id) {
      return state.notes.find((note) => note.id === id);
    }

    function getNoteIndexById(id) {
      return state.notes.findIndex((note) => note.id === id);
    }

    function deleteNote(id) {
      const index = getNoteIndexById(id);
      if (index !== -1) {
        state.notes.splice(index, 1);
        saveNotes();
        renderNotes();
      }
    }

    function openModal(id = null) {
      elements.modal.classList.remove("hidden");

      if (id) {
        const note = getNoteById(id);
        if (note) {
          elements.noteArea.innerHTML = note.content;
          state.editingIndex = getNoteIndexById(id);

          // Set the color in the modal
          selectColor(note.color);
          elements.colorButtons.forEach((btn) => {
            if (btn.getAttribute("data-color") === note.color) {
              btn.classList.add("selected");
            }
          });
        }
      } else {
        elements.noteArea.innerHTML = "";
        state.editingIndex = null;

        // Reset to default color for new notes
        selectColor("#71dbc4");
        elements.colorButtons.forEach((btn) => {
          if (btn.getAttribute("data-color") === "#71dbc4") {
            btn.classList.add("selected");
          }
        });
      }

      // Focus the note area
      setTimeout(() => elements.noteArea.focus(), 100);
    }

    function closeModal() {
      elements.modal.classList.add("hidden");
      elements.noteArea.innerHTML = "";
      state.editingIndex = null;
    }

    function saveNote() {
      const content = elements.noteArea.innerHTML.trim();

      if (!content) {
        alert("Note cannot be empty");
        return;
      }

      if (state.editingIndex !== null) {
        // Update existing note
        state.notes[state.editingIndex].content = content;
        state.notes[state.editingIndex].color = state.selectedColor;
        state.notes[state.editingIndex].updatedAt = new Date().toISOString();
      } else {
        // Create new note
        const newNote = createNoteObject(content);
        state.notes.push(newNote);
      }

      saveNotes();
      renderNotes();
      closeModal();
    }

    function handleSidebarNoteActions(e) {
      if (e.target.classList.contains("delete-note")) {
        if (confirm("Are you sure you want to delete this note?")) {
          deleteNote(e.target.dataset.id);
        }
      } else if (e.target.closest(".sidebar-note-item")) {
        // Get the noteItem element and its data-id
        const noteItem = e.target.closest(".sidebar-note-item");
        const noteId = noteItem.getAttribute("data-id");
        if (noteId) {
          openModal(noteId);
        }
      }
    }

    function handleMainNoteActions(e) {
      if (e.target.classList.contains("edit-note")) {
        openModal(e.target.dataset.id);
      } else if (e.target.classList.contains("delete-note-card")) {
        if (confirm("Are you sure you want to delete this note?")) {
          deleteNote(e.target.dataset.id);
        }
      }
    }

    function handleKeyboardShortcuts(e) {
      // Ctrl/Cmd + S to save when modal is open
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "s" &&
        !elements.modal.classList.contains("hidden")
      ) {
        e.preventDefault();
        saveNote();
      }

      // Escape to close modal
      if (e.key === "Escape" && !elements.modal.classList.contains("hidden")) {
        closeModal();
      }

      // Ctrl/Cmd + N to create new note
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        openModal();
      }
    }

    // Search functionality
    function setupSearch() {
      // Create search input if it doesn't exist
      if (!document.getElementById("search-notes")) {
        const searchDiv = document.createElement("div");
        searchDiv.className = "search-container";
        searchDiv.innerHTML = `
          <input type="text" id="search-notes" placeholder="Search notes...">
          <button id="clear-search">✖</button>
        `;

        // Insert before notes list
        elements.sidebar.insertBefore(searchDiv, elements.notesList);

        // Add event listeners
        const searchInput = document.getElementById("search-notes");
        const clearBtn = document.getElementById("clear-search");

        searchInput.addEventListener("input", filterNotes);
        clearBtn.addEventListener("click", () => {
          searchInput.value = "";
          filterNotes();
        });
      }
    }

    function filterNotes() {
      const searchTerm = document
        .getElementById("search-notes")
        .value.toLowerCase();

      // Filter notes in main display
      const noteCards = elements.notesDisplay.querySelectorAll(".note-card");
      noteCards.forEach((card) => {
        const content = card
          .querySelector(".note-content")
          .textContent.toLowerCase();
        if (content.includes(searchTerm)) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });

      // Filter notes in sidebar
      const sidebarItems =
        elements.notesList.querySelectorAll(".sidebar-note-item");
      sidebarItems.forEach((item) => {
        const content = item.querySelector("span").textContent.toLowerCase();
        if (content.includes(searchTerm)) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    }

    // Auto-backup functionality
    function setupAutoBackup() {
      // Auto-backup every 5 minutes
      setInterval(() => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backup = JSON.stringify(state.notes);
        localStorage.setItem(`notes_backup_${timestamp}`, backup);

        // Keep only the last 5 backups
        const allKeys = Object.keys(localStorage).filter((key) =>
          key.startsWith("notes_backup_")
        );
        if (allKeys.length > 5) {
          allKeys
            .sort()
            .slice(0, allKeys.length - 5)
            .forEach((key) => {
              localStorage.removeItem(key);
            });
        }
      }, 5 * 60 * 1000); // 5 minutes
    }

    // Initialize search functionality
    setupSearch();

    // Initialize auto-backup
    setupAutoBackup();

    // Start the app
    init();
  });

  // Initialize
  function init() {
    renderNotes();
    setupEventListeners();

    // Handle color selection
    elements.colorButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const color = button.getAttribute("data-color");
        selectColor(color, button);
      });

      // Set default selected color
      if (button.getAttribute("data-color") === state.selectedColor) {
        button.classList.add("selected");
      }
    });
  }

  // Event Listeners
  function setupEventListeners() {
    // Navigation
    elements.toggleNavBtn.addEventListener("click", toggleSidebar);
    elements.closeNavBtn.addEventListener("click", toggleSidebar);

    // Modal actions
    elements.addNoteBtn.addEventListener("click", () => openModal());
    elements.saveNoteBtn.addEventListener("click", saveNote);
    elements.modal.addEventListener("click", (e) => {
      if (e.target === elements.modal) closeModal();
    });
    document
      .getElementById("close-modal")
      .addEventListener("click", closeModal);

    // Event delegation for note actions
    elements.notesList.addEventListener("click", handleSidebarNoteActions);
    elements.notesDisplay.addEventListener("click", handleMainNoteActions);

    // Add keyboard shortcuts
    document.addEventListener("keydown", handleKeyboardShortcuts);
  }

  // Helper Functions
  function toggleSidebar() {
    elements.sidebar.classList.toggle("hidden");
  }

  function selectColor(color, selectedButton) {
    // Remove selected class from all buttons
    elements.colorButtons.forEach((btn) => btn.classList.remove("selected"));

    // Add selected class to clicked button
    if (selectedButton) selectedButton.classList.add("selected");

    // Update selected color
    state.selectedColor = color;
  }

  function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(state.notes));
  }

  function createNoteObject(content) {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // More unique ID
      content: content.trim(),
      color: state.selectedColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function renderNotes() {
    // Clear containers
    elements.notesList.innerHTML = "";
    elements.notesDisplay.innerHTML = "";

    if (state.notes.length === 0) {
      elements.notesDisplay.innerHTML = `
        <div class="empty-notes">
          <p>No notes yet. Click "new note" to get started!</p>
        </div>
      `;
      return;
    }

    // Sort notes by updated date (newest first)
    const sortedNotes = [...state.notes].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    sortedNotes.forEach((note, index) => {
      // Sidebar note item - Add delete button with data-id
      const noteItem = document.createElement("div");
      noteItem.className = "sidebar-note-item";
      noteItem.setAttribute("data-id", note.id); // Add data-id to the item itself
      const notePreview = note.content.substring(0, 20).replace(/\n/g, " ");
      noteItem.innerHTML = `
        <span>${notePreview}${notePreview.length >= 20 ? "..." : ""}</span>
        <button class="delete-note" data-id="${note.id}">🗑</button>
      `;
      elements.notesList.appendChild(noteItem);

      // Main note card
      const noteCard = document.createElement("div");
      noteCard.className = "note-card";
      noteCard.style.backgroundColor = note.color;
      noteCard.style.borderColor = note.color;

      // Format date
      const updatedDate = new Date(note.updatedAt);
      const formattedDate =
        updatedDate.toLocaleDateString() +
        " " +
        updatedDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

      // Use data-id for identification
      noteCard.innerHTML = `
        <div class="note-actions">
          <button class="edit-note" data-id="${note.id}">✏️</button>
          <button class="delete-note-card" data-id="${note.id}">🗑</button>
        </div>
        <div class="note-content">${note.content}</div>
        <div class="note-date">Updated: ${formattedDate}</div>
      `;
      elements.notesDisplay.appendChild(noteCard);
    });
  }

  function getNoteById(id) {
    return state.notes.find((note) => note.id === id);
  }

  function getNoteIndexById(id) {
    return state.notes.findIndex((note) => note.id === id);
  }

  function deleteNote(id) {
    const index = getNoteIndexById(id);
    if (index !== -1) {
      state.notes.splice(index, 1);
      saveNotes();
      renderNotes();
    }
  }

  function openModal(id = null) {
    elements.modal.classList.remove("hidden");

    if (id) {
      const note = getNoteById(id);
      if (note) {
        elements.noteArea.innerHTML = note.content;
        state.editingIndex = getNoteIndexById(id);

        // Set the color in the modal
        selectColor(note.color);
        elements.colorButtons.forEach((btn) => {
          if (btn.getAttribute("data-color") === note.color) {
            btn.classList.add("selected");
          }
        });
      }
    } else {
      elements.noteArea.innerHTML = "";
      state.editingIndex = null;

      // Reset to default color for new notes
      selectColor("#71dbc4");
      elements.colorButtons.forEach((btn) => {
        if (btn.getAttribute("data-color") === "#71dbc4") {
          btn.classList.add("selected");
        }
      });
    }

    // Focus the note area
    setTimeout(() => elements.noteArea.focus(), 100);
  }

  function closeModal() {
    elements.modal.classList.add("hidden");
    elements.noteArea.innerHTML = "";
    state.editingIndex = null;
  }

  function saveNote() {
    const content = elements.noteArea.innerHTML.trim();

    if (!content) {
      alert("Note cannot be empty");
      return;
    }

    if (state.editingIndex !== null) {
      // Update existing note
      state.notes[state.editingIndex].content = content;
      state.notes[state.editingIndex].color = state.selectedColor;
      state.notes[state.editingIndex].updatedAt = new Date().toISOString();
    } else {
      // Create new note
      const newNote = createNoteObject(content);
      state.notes.push(newNote);
    }

    saveNotes();
    renderNotes();
    closeModal();
  }

  function handleSidebarNoteActions(e) {
    if (e.target.classList.contains("delete-note")) {
      if (confirm("Are you sure you want to delete this note?")) {
        deleteNote(e.target.dataset.id);
      }
    } else if (e.target.closest(".sidebar-note-item")) {
      // Get the noteItem element and its data-id
      const noteItem = e.target.closest(".sidebar-note-item");
      const noteId = noteItem.getAttribute("data-id");
      if (noteId) {
        openModal(noteId);
      }
    }
  }

  function handleMainNoteActions(e) {
    if (e.target.classList.contains("edit-note")) {
      openModal(e.target.dataset.id);
    } else if (e.target.classList.contains("delete-note-card")) {
      if (confirm("Are you sure you want to delete this note?")) {
        deleteNote(e.target.dataset.id);
      }
    }
  }

  function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + S to save when modal is open
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key === "s" &&
      !elements.modal.classList.contains("hidden")
    ) {
      e.preventDefault();
      saveNote();
    }

    // Escape to close modal
    if (e.key === "Escape" && !elements.modal.classList.contains("hidden")) {
      closeModal();
    }

    // Ctrl/Cmd + N to create new note
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      openModal();
    }
  }

  // Search functionality
  function setupSearch() {
    // Create search input if it doesn't exist
    if (!document.getElementById("search-notes")) {
      const searchDiv = document.createElement("div");
      searchDiv.className = "search-container";
      searchDiv.innerHTML = `
        <input type="text" id="search-notes" placeholder="Search notes...">
        <button id="clear-search">✖</button>
      `;

      // Insert before notes list
      elements.sidebar.insertBefore(searchDiv, elements.notesList);

      // Add event listeners
      const searchInput = document.getElementById("search-notes");
      const clearBtn = document.getElementById("clear-search");

      searchInput.addEventListener("input", filterNotes);
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        filterNotes();
      });
    }
  }

  function filterNotes() {
    const searchTerm = document
      .getElementById("search-notes")
      .value.toLowerCase();

    // Filter notes in main display
    const noteCards = elements.notesDisplay.querySelectorAll(".note-card");
    noteCards.forEach((card) => {
      const content = card
        .querySelector(".note-content")
        .textContent.toLowerCase();
      if (content.includes(searchTerm)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });

    // Filter notes in sidebar
    const sidebarItems =
      elements.notesList.querySelectorAll(".sidebar-note-item");
    sidebarItems.forEach((item) => {
      const content = item.querySelector("span").textContent.toLowerCase();
      if (content.includes(searchTerm)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  }

  // Auto-backup functionality
  function setupAutoBackup() {
    // Auto-backup every 5 minutes
    setInterval(() => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backup = JSON.stringify(state.notes);
      localStorage.setItem(`notes_backup_${timestamp}`, backup);

      // Keep only the last 5 backups
      const allKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("notes_backup_")
      );
      if (allKeys.length > 5) {
        allKeys
          .sort()
          .slice(0, allKeys.length - 5)
          .forEach((key) => {
            localStorage.removeItem(key);
          });
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Initialize search functionality
  setupSearch();

  // Initialize auto-backup
  setupAutoBackup();

  // Start the app
  init();
});
