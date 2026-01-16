// app/state.js
// Application state management - all global state variables

window.currentProject = {
    name: 'Nouvelle présentation',
    metadata: {
        title: 'Ma Présentation',
        author: '',
        date: new Date().toLocaleDateString('fr-FR'),
        version: '1.0'
    },
    theme: {
        base: 'gitlab',
        overrides: {}
    },
    slides: []
};

window.selectedSlideIndex = -1;
window.selectedTemplate = null;
window.currentSidebarTab = 'slides'; // 'slides' or 'settings'
window.draggedIndex = null;
window.hasUnsavedChanges = false;
window.autosaveTimeout = null;
window.AUTOSAVE_DELAY = 1500; // 1.5 seconds debounce

// Presentation player state
window.playerSlideIndex = 0;
window.playerResizeObserver = null;

// Panel state
window.sidebarCollapsed = false;
window.editorCollapsed = false;
window.editorHeight = null;
window.isResizingEditor = false;

// ============================================================================
// UNSAVED CHANGES TRACKING
// ============================================================================

window.markAsChanged = function() {
    window.hasUnsavedChanges = true;
    updateSaveButtonState();

    // Debounced autosave
    if (window.autosaveTimeout) {
        clearTimeout(window.autosaveTimeout);
    }
    window.autosaveTimeout = setTimeout(() => {
        autosave();
    }, window.AUTOSAVE_DELAY);
};

window.autosave = function() {
    if (!window.hasUnsavedChanges) return;

    window.currentProject.savedAt = new Date().toISOString();

    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    const existingIndex = projects.findIndex(p => p.name === window.currentProject.name);

    if (existingIndex >= 0) {
        projects[existingIndex] = window.currentProject;
    } else {
        projects.push(window.currentProject);
    }

    localStorage.setItem('slideProjects', JSON.stringify(projects));
    clearUnsavedChanges();
};

window.clearUnsavedChanges = function() {
    window.hasUnsavedChanges = false;
    updateSaveButtonState();
};

function updateSaveButtonState() {
    const saveBtn = document.getElementById('headerSaveBtn');
    if (saveBtn) {
        saveBtn.disabled = !window.hasUnsavedChanges;
        saveBtn.classList.toggle('has-changes', window.hasUnsavedChanges);
    }
}
