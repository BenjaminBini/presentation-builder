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
    clearUnsavedChanges();
    showToast('Projet sauvegardé');
}

function loadProject(index) {
    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    if (projects[index]) {
        currentProject = JSON.parse(JSON.stringify(projects[index]));
        ensureTheme();
        selectedSlideIndex = currentProject.slides.length > 0 ? 0 : -1;
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
        currentProject.name = 'Nouvelle présentation';
        selectedSlideIndex = currentProject.slides.length > 0 ? 0 : -1;
        renderSlideList();
        renderSettingsPanel();
        renderEditor();
        updatePreview();
        updateHeaderTitle();
        initMermaid();
        clearUnsavedChanges();
        showToast('Nouveau projet créé');
    }
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
