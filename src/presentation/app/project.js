// src/app/project.js
// Project loading and initialization

import { getProject, setProject, setSelectedSlideIndex, setHasUnsavedChanges, isProjectSaved } from '../../core/state.js';
import { hideUnsavedAlert } from './state-ui.js';
import { SAMPLE_PROJECT } from '../../config/index.js';
import { renameCurrentProject } from '../../projects/manager.js';
import { driveStorageService } from '../../infrastructure/drive/storage-service.js';
import { storage } from '../../infrastructure/storage/local.js';

const SESSION_KEY_LAST_PROJECT = 'lastOpenedProject';

/**
 * Save the current project identifier to sessionStorage
 * Called when a project is loaded/switched
 */
export function saveLastOpenedProject(project) {
    if (!project) {
        sessionStorage.removeItem(SESSION_KEY_LAST_PROJECT);
        return;
    }

    const lastProject = {};
    if (project.driveId) {
        lastProject.type = 'drive';
        lastProject.driveId = project.driveId;
    } else if (project.localId) {
        lastProject.type = 'local';
        lastProject.localId = project.localId;
    } else {
        // Unsaved project - don't persist
        sessionStorage.removeItem(SESSION_KEY_LAST_PROJECT);
        return;
    }

    sessionStorage.setItem(SESSION_KEY_LAST_PROJECT, JSON.stringify(lastProject));
}

/**
 * Get the last opened project info from sessionStorage
 */
export function getLastOpenedProject() {
    const stored = sessionStorage.getItem(SESSION_KEY_LAST_PROJECT);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

/**
 * Flag to indicate we're waiting to load a Drive project
 */
let pendingDriveLoad = null;

/**
 * Get pending Drive load info (used by file-sidebar after auth ready)
 */
export function getPendingDriveLoad() {
    return pendingDriveLoad;
}

/**
 * Clear pending Drive load
 */
export function clearPendingDriveLoad() {
    pendingDriveLoad = null;
}

export function loadInitialProject() {
    const lastProject = getLastOpenedProject();
    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    let projectToLoad;

    // Check if we have a stored last project
    if (lastProject) {
        if (lastProject.type === 'local' && lastProject.localId) {
            // Try to load the specific local project
            const localProject = storage.getByLocalId(lastProject.localId);
            if (localProject) {
                projectToLoad = JSON.parse(JSON.stringify(localProject));
            }
        } else if (lastProject.type === 'drive' && lastProject.driveId) {
            // Store Drive project info for deferred loading after auth
            pendingDriveLoad = { driveId: lastProject.driveId };
            // Create a minimal loading placeholder - will be replaced when Drive auth is ready
            projectToLoad = {
                name: null,
                metadata: { title: '' },
                theme: { base: 'gitlab', overrides: {} },
                slides: [],
                _pendingDriveLoad: true
            };
        }
    }

    // Fallback to previous behavior if no last project found
    if (!projectToLoad) {
        if (projects.length === 0) {
            projectToLoad = JSON.parse(JSON.stringify(SAMPLE_PROJECT));
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
    const badgeElement = document.getElementById('headerStorageBadge');
    const container = document.querySelector('.header-project-name');

    if (titleElement) {
        if (project?._pendingDriveLoad) {
            titleElement.textContent = 'Chargement...';
            container?.classList.add('placeholder', 'loading');
        } else if (project?.name) {
            titleElement.textContent = project.name;
            container?.classList.remove('placeholder', 'loading');
        } else {
            titleElement.textContent = 'Nouveau projet...';
            container?.classList.add('placeholder');
            container?.classList.remove('loading');
        }
    }

    // Update storage location badge
    if (badgeElement) {
        const storageLocation = driveStorageService.getProjectStorageLocation(project);
        if (storageLocation === 'drive') {
            badgeElement.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
                </svg>
            `;
            badgeElement.className = 'header-storage-badge storage-drive';
        } else {
            badgeElement.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
                </svg>
            `;
            badgeElement.className = 'header-storage-badge storage-local';
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

// Guard to prevent re-entry during async operations
let isRenamingInProgress = false;

export async function finishEditProjectTitle() {
    // Prevent re-entry (e.g., from blur during sign-in popup)
    if (isRenamingInProgress) return;

    const project = getProject();
    const container = document.querySelector('.header-project-name');
    const input = document.getElementById('headerProjectInput');
    const newName = input.value.trim();
    const wasUnsaved = !isProjectSaved();
    const storageLocation = driveStorageService.getProjectStorageLocation(project);

    if (!newName) {
        container.classList.remove('editing');
        return;
    }

    if (newName !== project?.name) {
        // For Drive projects, check Drive for existing names handled by renameCurrentProject
        // For local projects, check localStorage
        if (storageLocation === 'local') {
            const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
            const existingNames = new Set(projects.map(p => p.name));

            if (existingNames.has(newName)) {
                input.focus();
                return;
            }
        }

        // Use the centralized rename function that handles both local and Drive
        if (wasUnsaved) {
            // For unsaved projects, save as new
            const updatedProject = { ...project, name: newName, savedAt: new Date().toISOString() };
            const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
            projects.push(updatedProject);
            localStorage.setItem('slideProjects', JSON.stringify(projects));
            setProject(updatedProject);
            setHasUnsavedChanges(false);
            hideUnsavedAlert();
        } else {
            // For saved projects (local or Drive), use rename function
            if (window.updateSaveButtonState) window.updateSaveButtonState('saving');
            isRenamingInProgress = true;
            try {
                const success = await renameCurrentProject(newName);
                if (!success) {
                    if (window.updateSaveButtonState) window.updateSaveButtonState('saved');
                    // Don't refocus - might cause loop if auth popup opens
                    container.classList.remove('editing');
                    return;
                }
            } finally {
                isRenamingInProgress = false;
            }
        }

        updateHeaderTitle();
        if (window.updateSaveButtonState) window.updateSaveButtonState('saved');
    }

    container.classList.remove('editing');
}

export function handleTitleKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        finishEditProjectTitle(); // async, but fire-and-forget is fine here
    } else if (event.key === 'Escape') {
        event.preventDefault();
        const container = document.querySelector('.header-project-name');
        container.classList.remove('editing');
    }
}

export function initMermaid() {
    if (typeof window.mermaid === 'undefined') return;

    window.mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        flowchart: {
            useMaxWidth: false,
            htmlLabels: false
        }
    });
}
