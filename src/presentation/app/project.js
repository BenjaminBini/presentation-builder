// src/app/project.js
// Project loading and initialization

import { getProject, setProject, setSelectedSlideIndex, setHasUnsavedChanges, isProjectSaved } from '../../core/state.js';
import { hideUnsavedAlert } from './state-ui.js';

export function loadInitialProject() {
    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    let projectToLoad;

    if (projects.length === 0) {
        projectToLoad = JSON.parse(JSON.stringify(window.SAMPLE_PROJECT || {
            name: null,
            metadata: { title: 'Ma Présentation', author: '', date: '', version: '1.0' },
            theme: { base: 'gitlab', overrides: {} },
            slides: []
        }));
        projectToLoad.name = null;
    } else if (projects.length === 1) {
        projectToLoad = JSON.parse(JSON.stringify(projects[0]));
    } else {
        const sortedProjects = [...projects].sort((a, b) => {
            const dateA = new Date(a.savedAt || 0);
            const dateB = new Date(b.savedAt || 0);
            return dateB - dateA;
        });
        projectToLoad = JSON.parse(JSON.stringify(sortedProjects[0]));
    }

    ensureTheme(projectToLoad);
    setProject(projectToLoad);
    setSelectedSlideIndex(projectToLoad.slides?.length > 0 ? 0 : -1);

    const savedSlideIndex = sessionStorage.getItem('selectedSlideIndex');
    if (savedSlideIndex !== null) {
        const index = parseInt(savedSlideIndex, 10);
        if (index >= 0 && index < projectToLoad.slides.length) {
            setSelectedSlideIndex(index);
        }
    }
}

function ensureTheme(project) {
    if (!project.theme) {
        project.theme = { base: 'gitlab', overrides: {} };
    }
}

export function updateHeaderTitle() {
    const project = getProject();
    const titleElement = document.getElementById('headerProjectName');
    const container = document.querySelector('.header-project-name');
    if (titleElement) {
        if (project?.name) {
            titleElement.textContent = project.name;
            container?.classList.remove('placeholder');
        } else {
            titleElement.textContent = 'Nouveau projet...';
            container?.classList.add('placeholder');
        }
    }
}

export function editProjectTitle() {
    const project = getProject();
    const container = document.querySelector('.header-project-name');
    const input = document.getElementById('headerProjectInput');

    container.classList.add('editing');
    input.value = project?.name || '';
    input.focus();
    input.select();
}

export function finishEditProjectTitle() {
    const project = getProject();
    const container = document.querySelector('.header-project-name');
    const input = document.getElementById('headerProjectInput');
    const newName = input.value.trim();
    const wasUnsaved = !isProjectSaved();

    if (!newName) {
        container.classList.remove('editing');
        return;
    }

    if (newName !== project?.name) {
        const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
        const existingNames = new Set(projects.map(p => p.name));

        if (existingNames.has(newName)) {
            input.focus();
            return;
        }

        const oldName = project.name;
        const updatedProject = { ...project, name: newName };
        setProject(updatedProject);
        updateHeaderTitle();

        if (wasUnsaved) {
            updatedProject.savedAt = new Date().toISOString();
            projects.push(updatedProject);
            localStorage.setItem('slideProjects', JSON.stringify(projects));
            setHasUnsavedChanges(false);
            hideUnsavedAlert();
        } else {
            const existingIndex = projects.findIndex(p => p.name === oldName);
            if (existingIndex >= 0) {
                updatedProject.savedAt = new Date().toISOString();
                projects[existingIndex] = updatedProject;
                localStorage.setItem('slideProjects', JSON.stringify(projects));
            }
            setHasUnsavedChanges(false);
        }
        // Show saved state (localStorage is synchronous)
        if (window.updateSaveButtonState) window.updateSaveButtonState('saved');
    }

    container.classList.remove('editing');
}

export function handleTitleKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        finishEditProjectTitle();
    } else if (event.key === 'Escape') {
        event.preventDefault();
        const container = document.querySelector('.header-project-name');
        container.classList.remove('editing');
    }
}

export function initMermaid() {
    if (typeof window.mermaid === 'undefined' || typeof window.getThemeColors === 'undefined') return;

    const colors = window.getThemeColors();
    window.mermaid.initialize({
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
}
