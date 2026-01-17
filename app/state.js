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
    updateSaveButtonState('modifying');

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

    updateSaveButtonState('saving');

    window.currentProject.savedAt = new Date().toISOString();

    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    const existingIndex = projects.findIndex(p => p.name === window.currentProject.name);

    if (existingIndex >= 0) {
        projects[existingIndex] = window.currentProject;
    } else {
        projects.push(window.currentProject);
    }

    localStorage.setItem('slideProjects', JSON.stringify(projects));
    
    // Simulate a short delay to show the saving state
    setTimeout(() => {
        clearUnsavedChanges();
    }, 300);
};

window.clearUnsavedChanges = function() {
    window.hasUnsavedChanges = false;
    updateSaveButtonState('saved');
};

function updateSaveButtonState(state = 'saved') {
    const saveStatus = document.getElementById('saveStatus');
    if (!saveStatus) return;

    // Remove all state classes
    saveStatus.classList.remove('state-saved', 'state-modifying', 'state-saving');
    
    // Add the current state class
    saveStatus.classList.add(`state-${state}`);
    
    // Update text
    const textElement = saveStatus.querySelector('.save-status-text');
    if (textElement) {
        switch(state) {
            case 'saved':
                textElement.textContent = 'Enregistré';
                break;
            case 'modifying':
                textElement.textContent = 'Modification...';
                break;
            case 'saving':
                textElement.textContent = 'Enregistrement...';
                break;
        }
    }
}
