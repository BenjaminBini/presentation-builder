// app/project.js
// Project loading and initialization

window.loadInitialProject = function() {
    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');

    if (projects.length === 0) {
        // No projects exist - load sample data as unsaved
        window.currentProject = JSON.parse(JSON.stringify(SAMPLE_PROJECT));
        window.currentProject.name = null; // Start as unsaved
        window.selectedSlideIndex = window.currentProject.slides.length > 0 ? 0 : -1;
        showToast('Projet de démonstration chargé');
    } else if (projects.length === 1) {
        // One project exists - load it
        window.currentProject = JSON.parse(JSON.stringify(projects[0]));
        ensureTheme();
        window.selectedSlideIndex = window.currentProject.slides.length > 0 ? 0 : -1;
    } else {
        // Multiple projects - load most recently modified
        const sortedProjects = [...projects].sort((a, b) => {
            const dateA = new Date(a.savedAt || 0);
            const dateB = new Date(b.savedAt || 0);
            return dateB - dateA;
        });
        window.currentProject = JSON.parse(JSON.stringify(sortedProjects[0]));
        ensureTheme();
        window.selectedSlideIndex = window.currentProject.slides.length > 0 ? 0 : -1;
        showToast(`Projet "${window.currentProject.name}" chargé`);
    }

    // Restore selected slide index from session storage
    const savedSlideIndex = sessionStorage.getItem('selectedSlideIndex');
    if (savedSlideIndex !== null) {
        const index = parseInt(savedSlideIndex, 10);
        if (index >= 0 && index < window.currentProject.slides.length) {
            window.selectedSlideIndex = index;
        }
    }
};

function ensureTheme() {
    if (!window.currentProject.theme) {
        window.currentProject.theme = { base: 'gitlab', overrides: {} };
    }
}

window.updateHeaderTitle = function() {
    const titleElement = document.getElementById('headerProjectName');
    const container = document.querySelector('.header-project-name');
    if (titleElement) {
        if (window.currentProject.name) {
            titleElement.textContent = window.currentProject.name;
            container?.classList.remove('placeholder');
        } else {
            titleElement.textContent = 'Sans titre';
            container?.classList.add('placeholder');
        }
    }
};

window.editProjectTitle = function() {
    const container = document.querySelector('.header-project-name');
    const input = document.getElementById('headerProjectInput');

    container.classList.add('editing');
    input.value = window.currentProject.name || '';
    input.focus();
    input.select();
};

window.finishEditProjectTitle = function() {
    const container = document.querySelector('.header-project-name');
    const input = document.getElementById('headerProjectInput');
    const newName = input.value.trim();
    const wasUnsaved = !window.isProjectSaved();

    if (!newName) {
        container.classList.remove('editing');
        return;
    }

    if (newName !== window.currentProject.name) {
        // Check if name already exists
        const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
        const existingNames = new Set(projects.map(p => p.name));

        if (existingNames.has(newName)) {
            showToast('Un projet avec ce nom existe déjà');
            input.focus();
            return;
        }

        const oldName = window.currentProject.name;
        window.currentProject.name = newName;
        updateHeaderTitle();

        if (wasUnsaved) {
            // First save of a new project
            window.currentProject.savedAt = new Date().toISOString();
            projects.push(window.currentProject);
            localStorage.setItem('slideProjects', JSON.stringify(projects));
            clearUnsavedChanges();
            showToast('Projet enregistré');
        } else {
            // Rename existing project
            const existingIndex = projects.findIndex(p => p.name === oldName);
            if (existingIndex >= 0) {
                projects[existingIndex] = window.currentProject;
                localStorage.setItem('slideProjects', JSON.stringify(projects));
            }
            window.markAsChanged();
            showToast('Nom du projet mis à jour');
        }
    }

    container.classList.remove('editing');
};

window.handleTitleKeydown = function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        finishEditProjectTitle();
    } else if (event.key === 'Escape') {
        event.preventDefault();
        const container = document.querySelector('.header-project-name');
        container.classList.remove('editing');
    }
};

window.initMermaid = function() {
    const colors = getThemeColors();
    mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        fontSize: 20,
        flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            nodeSpacing: 85,
            rankSpacing: 68
        },
        themeVariables: {
            primaryColor: colors['accent-main'],
            primaryTextColor: colors['text-main'],
            primaryBorderColor: colors['accent-alt'],
            lineColor: '#525059',
            secondaryColor: colors['accent-third'],
            tertiaryColor: '#F5F5F5'
        }
    });
};
