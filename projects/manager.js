// projects/manager.js
// Project CRUD operations
// Requires: projects/notifications.js (showToast)
// Requires: projects/modal.js (closeModal, renderProjectList)

function saveProject() {
    const name = document.getElementById('projectName').value.trim() || 'Sans titre';
    currentProject.name = name;
    currentProject.savedAt = new Date().toISOString();

    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    const existingIndex = projects.findIndex(p => p.name === name);

    if (existingIndex >= 0) {
        projects[existingIndex] = currentProject;
    } else {
        projects.push(currentProject);
    }

    localStorage.setItem('slideProjects', JSON.stringify(projects));
    renderProjectList();
    updateHeaderTitle();
    clearUnsavedChanges();
    showToast('Projet sauvegardé');
}

function saveProjectFromHeader() {
    updateSaveButtonState('saving');
    
    const name = currentProject.name || 'Sans titre';
    currentProject.savedAt = new Date().toISOString();

    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    const existingIndex = projects.findIndex(p => p.name === name);

    if (existingIndex >= 0) {
        projects[existingIndex] = currentProject;
    } else {
        projects.push(currentProject);
    }

    localStorage.setItem('slideProjects', JSON.stringify(projects));
    
    setTimeout(() => {
        clearUnsavedChanges();
        showToast('Projet sauvegardé');
    }, 300);
}

function loadProject(index) {
    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    if (projects[index]) {
        currentProject = JSON.parse(JSON.stringify(projects[index]));
        ensureTheme();
        selectedSlideIndex = currentProject.slides.length > 0 ? 0 : -1;
        updateAppThemeColors(); // Apply loaded theme colors
        renderSlideList();
        renderSettingsPanel();
        renderEditor();
        updatePreview();
        updateHeaderTitle();
        initMermaid();
        clearUnsavedChanges();
        closeModal('projectsModal');
        showToast('Projet chargé');
    }
}

function deleteProject(index) {
    if (confirm('Supprimer ce projet ?')) {
        const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
        projects.splice(index, 1);
        localStorage.setItem('slideProjects', JSON.stringify(projects));
        renderProjectList();
        showToast('Projet supprimé');
    }
}

function newProject() {
    if (confirm('Créer un nouveau projet ? Les modifications non sauvegardées seront perdues.')) {
        currentProject = JSON.parse(JSON.stringify(SAMPLE_PROJECT));
        currentProject.name = null; // Unsaved project has no name
        selectedSlideIndex = currentProject.slides.length > 0 ? 0 : -1;
        updateAppThemeColors(); // Reset to default theme colors
        renderSlideList();
        renderSettingsPanel();
        renderEditor();
        updatePreview();
        updateHeaderTitle();
        initMermaid();
        clearUnsavedChanges();
        resetUnsavedAlert(); // Allow alert to show again for new project
        showToast('Nouveau projet créé');
    }
}

function onSaveStatusClick() {
    // Only handle click for unsaved projects
    if (!window.isProjectSaved()) {
        openSaveProjectModal();
    }
}

function openSaveProjectModal() {
    const input = document.getElementById('saveProjectName');
    const error = document.getElementById('saveProjectError');
    const btn = document.getElementById('saveProjectBtn');

    input.value = '';
    error.textContent = '';
    btn.disabled = true;

    openModal('saveProjectModal');
    setTimeout(() => input.focus(), 100);
}

function validateSaveProjectName() {
    const input = document.getElementById('saveProjectName');
    const error = document.getElementById('saveProjectError');
    const btn = document.getElementById('saveProjectBtn');
    const name = input.value.trim();

    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    const existingNames = new Set(projects.map(p => p.name));

    if (!name) {
        error.textContent = '';
        btn.disabled = true;
        return false;
    }

    if (existingNames.has(name)) {
        error.textContent = 'Un projet avec ce nom existe déjà';
        btn.disabled = true;
        return false;
    }

    error.textContent = '';
    btn.disabled = false;
    return true;
}

function confirmSaveProject() {
    const input = document.getElementById('saveProjectName');
    const name = input.value.trim();

    if (!validateSaveProjectName()) return;

    // Save the project with the chosen name
    currentProject.name = name;
    currentProject.savedAt = new Date().toISOString();

    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    projects.push(currentProject);
    localStorage.setItem('slideProjects', JSON.stringify(projects));

    closeModal('saveProjectModal');
    dismissUnsavedAlert();
    updateHeaderTitle();
    clearUnsavedChanges();
    showToast('Projet enregistré');
}

// Unsaved alert management
let unsavedAlertShown = false;

function showUnsavedAlert() {
    if (unsavedAlertShown) return;

    const alert = document.getElementById('unsavedAlert');
    if (alert) {
        alert.classList.add('visible');
        unsavedAlertShown = true;
    }
}

function dismissUnsavedAlert() {
    const alert = document.getElementById('unsavedAlert');
    if (alert) {
        alert.classList.remove('visible');
    }
}

function resetUnsavedAlert() {
    unsavedAlertShown = false;
}

function exportProject() {
    const exportData = {
        metadata: {
            title: currentProject.name,
            ...currentProject.metadata
        },
        theme: currentProject.theme,
        slides: currentProject.slides
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name.replace(/[^a-z0-9]/gi, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Projet exporté');
}

// Expose to global scope
window.saveProject = saveProject;
window.saveProjectFromHeader = saveProjectFromHeader;
window.loadProject = loadProject;
window.deleteProject = deleteProject;
window.newProject = newProject;
window.exportProject = exportProject;
window.onSaveStatusClick = onSaveStatusClick;
window.openSaveProjectModal = openSaveProjectModal;
window.validateSaveProjectName = validateSaveProjectName;
window.confirmSaveProject = confirmSaveProject;
window.showUnsavedAlert = showUnsavedAlert;
window.dismissUnsavedAlert = dismissUnsavedAlert;
window.resetUnsavedAlert = resetUnsavedAlert;
