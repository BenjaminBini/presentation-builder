// app/state.js
// Application state management - all global state variables

window.currentProject = {
    name: null, // null = unsaved project
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

window.isProjectSaved = function() {
    if (!window.currentProject.name) return false;
    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    return projects.some(p => p.name === window.currentProject.name);
};

window.markAsChanged = function() {
    window.hasUnsavedChanges = true;

    // Only autosave if project has been saved before
    if (window.isProjectSaved()) {
        updateSaveButtonState('modifying');

        // Debounced autosave
        if (window.autosaveTimeout) {
            clearTimeout(window.autosaveTimeout);
        }
        window.autosaveTimeout = setTimeout(() => {
            autosave();
        }, window.AUTOSAVE_DELAY);
    } else {
        updateSaveButtonState('unsaved');
        // Show alert on first edit of unsaved project
        if (window.showUnsavedAlert) {
            window.showUnsavedAlert();
        }
    }
};

window.autosave = function() {
    if (!window.hasUnsavedChanges) return;
    if (!window.isProjectSaved()) return; // Don't autosave unsaved projects

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
    if (window.isProjectSaved()) {
        updateSaveButtonState('saved');
    } else {
        updateSaveButtonState('unsaved');
    }
};

function updateSaveButtonState(state = 'saved') {
    const saveStatus = document.getElementById('saveStatus');
    if (!saveStatus) return;

    // Remove all state classes
    saveStatus.classList.remove('state-saved', 'state-modifying', 'state-saving', 'state-unsaved');

    // Add the current state class
    saveStatus.classList.add(`state-${state}`);

    // Update text and tooltip
    const textElement = saveStatus.querySelector('.save-status-text');
    const tooltipElement = saveStatus.querySelector('.save-status-tooltip');
    switch(state) {
        case 'saved':
            if (textElement) textElement.textContent = 'Enregistré';
            if (tooltipElement) tooltipElement.textContent = 'Toutes les modifications sont enregistrées';
            break;
        case 'modifying':
            if (textElement) textElement.textContent = 'Modification...';
            if (tooltipElement) tooltipElement.textContent = 'Modifications en cours...';
            break;
        case 'saving':
            if (textElement) textElement.textContent = 'Enregistrement...';
            if (tooltipElement) tooltipElement.textContent = 'Enregistrement en cours...';
            break;
        case 'unsaved':
            if (textElement) textElement.textContent = 'Enregistrer';
            if (tooltipElement) tooltipElement.textContent = 'Cliquer pour enregistrer le projet';
            break;
    }
}
