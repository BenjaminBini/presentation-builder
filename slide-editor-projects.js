// slide-editor-projects.js
// Project management, import/export, and modal functions

// ============================================================================
// MODAL FUNCTIONS
// ============================================================================

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function openProjectsModal() {
    document.getElementById('projectName').value = currentProject.name;
    renderProjectList();
    document.getElementById('projectsModal').classList.add('active');
}

function renderProjectList() {
    const list = document.getElementById('projectList');
    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');

    if (projects.length === 0) {
        list.innerHTML = '<p style="color: var(--gl-gray-500); text-align: center;">Aucun projet sauvegardé</p>';
        return;
    }

    list.innerHTML = projects.map((project, i) => `
        <div class="project-item" onclick="loadProject(${i})">
            <div class="project-item-info">
                <h4>${escapeHtml(project.name)}</h4>
                <span>${project.slides.length} slides • ${new Date(project.savedAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div class="project-item-actions">
                <button class="slide-item-btn delete" onclick="event.stopPropagation(); deleteProject(${i})" title="Supprimer"><svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
        </div>
    `).join('');
}

// ============================================================================
// PROJECT MANAGEMENT
// ============================================================================

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
        showToast('Nouveau projet créé');
    }
}

// ============================================================================
// IMPORT / EXPORT
// ============================================================================

function importProject() {
    document.getElementById('importInput').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.slides) {
                    currentProject = {
                        name: data.metadata?.title || file.name.replace('.json', ''),
                        metadata: data.metadata || {},
                        theme: data.theme || { base: 'gitlab', overrides: {} },
                        slides: data.slides
                    };
                    selectedSlideIndex = currentProject.slides.length > 0 ? 0 : -1;
                    renderSlideList();
                    renderSettingsPanel();
                    renderEditor();
                    updatePreview();
                    updateHeaderTitle();
                    initMermaid();
                    showToast('Projet importé');
                } else {
                    showToast('Format de fichier invalide', 'error');
                }
            } catch (err) {
                showToast('Erreur lors de l\'import', 'error');
            }
        };
        reader.readAsText(file);
    }
    event.target.value = '';
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

function exportHTML() {
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
    a.download = 'presentation-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON exporté - Utilisez generate-slides.js pour créer le HTML');
}

// ============================================================================
// TOAST NOTIFICATION
// ============================================================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
