// src/projects/modals.js
// Modal UI functions for project management

import { setState, setProject, batch, getProject } from '../core/state.js';
import { hideUnsavedAlert, updateSaveButtonState } from '../presentation/app/state-ui.js';
import { emit, EventTypes } from '../core/events.js';
import { storage, projectExists } from '../infrastructure/storage/local.js';
import { escapeHtml } from '../infrastructure/utils/html.js';
import { registerActions } from '../presentation/event-delegation.js';
import { refreshSlideList, refreshEditor, refreshPreview } from '../presentation/app/ui-refresh.js';

// ============================================================================
// ACTION HANDLERS (for event delegation)
// ============================================================================

/**
 * Handle project loading via event delegation
 */
function handleLoadProject(_event, _element, params) {
  loadProject(params.index);
}

/**
 * Handle project deletion via event delegation
 */
function handleDeleteProject(_event, _element, params) {
  deleteProject(params.index);
}

// Register project modal actions
registerActions({
  'load-project': handleLoadProject,
  'delete-project': handleDeleteProject
});

/**
 * Open project modal
 */
export function openProjectModal() {
  const modal = document.getElementById('projectsModal');
  if (modal) {
    modal.classList.add('active');
    renderProjectList();
  }
}

/**
 * Close project modal
 */
export function closeProjectModal() {
  const modal = document.getElementById('projectsModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Open save project modal (for naming new projects)
 */
export function openSaveProjectModal() {
  const modal = document.getElementById('saveProjectModal');
  const input = document.getElementById('saveProjectName');
  const btn = document.getElementById('saveProjectBtn');
  const error = document.getElementById('saveProjectError');

  if (modal) {
    modal.classList.add('active');
    if (input) {
      input.value = '';
      input.focus();
    }
    if (btn) btn.disabled = true;
    if (error) error.textContent = '';
  }
}

/**
 * Close save project modal
 */
export function closeSaveProjectModal() {
  const modal = document.getElementById('saveProjectModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Save project with name from modal input
 * @returns {boolean} Success status
 */
export function saveProjectWithName() {
  const input = document.getElementById('saveProjectName');
  const name = input?.value?.trim();

  if (!name) {
    return false;
  }

  // Check if name already exists
  if (projectExists(name)) {
    const error = document.getElementById('saveProjectError');
    if (error) error.textContent = 'Un projet avec ce nom existe déjà';
    return false;
  }

  // Get current project and save with new name
  const project = getProject();
  project.name = name;
  project.savedAt = new Date().toISOString();

  const success = storage.save(project);

  if (success) {
    batch(() => {
      setProject(project);
      setState({ hasUnsavedChanges: false });
    });

    emit(EventTypes.PROJECT_SAVED, { project });
    closeSaveProjectModal();
    hideUnsavedAlert();
    updateSaveButtonState('saved');

    // Update header title
    if (window.updateHeaderTitle) window.updateHeaderTitle();

    return true;
  } else {
    return false;
  }
}

/**
 * Validate save project name input (called on input change)
 */
export function validateSaveProjectName() {
  const input = document.getElementById('saveProjectName');
  const btn = document.getElementById('saveProjectBtn');
  const error = document.getElementById('saveProjectError');

  const name = input?.value?.trim();

  if (!name) {
    if (btn) btn.disabled = true;
    if (error) error.textContent = '';
    return;
  }

  if (projectExists(name)) {
    if (btn) btn.disabled = true;
    if (error) error.textContent = 'Un projet avec ce nom existe déjà';
    return;
  }

  if (btn) btn.disabled = false;
  if (error) error.textContent = '';
}

/**
 * Render project list in modal
 */
export function renderProjectList() {
  const list = document.getElementById('projectList');
  if (!list) return;

  const projects = storage.getAll();
  const currentProject = getProject();

  if (projects.length === 0) {
    list.innerHTML = '<p class="no-projects">Aucun projet sauvegardé</p>';
    return;
  }

  list.innerHTML = projects.map((project, index) => {
    const isCurrentProject = currentProject?.name && project.name === currentProject.name;
    const slideCount = project.slides?.length || 0;
    const safeName = escapeHtml(project.name || 'Sans nom');
    return `
    <div class="project-item ${isCurrentProject ? 'current' : ''}" data-index="${index}">
      <div class="project-info">
        <span class="project-name">${safeName}${isCurrentProject ? '<span class="project-current-badge">Ouvert</span>' : ''}</span>
        <span class="project-meta">
          <svg class="project-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
          </svg>
          ${slideCount} slide${slideCount !== 1 ? 's' : ''}
        </span>
      </div>
      <div class="project-actions">
        <button class="project-btn project-btn-open" data-action="load-project" data-index="${index}" ${isCurrentProject ? 'disabled' : ''} title="Ouvrir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
          </svg>
        </button>
        <button class="project-btn project-btn-delete" data-action="delete-project" data-index="${index}" ${isCurrentProject ? 'disabled' : ''} title="Supprimer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  }).join('');
}

/**
 * Load project by index (for UI)
 * @param {number} index - Project index in storage
 * @returns {boolean} Success status
 */
export function loadProject(index) {
  const project = storage.get(index);

  if (!project) {
    return false;
  }

  // Deep clone to avoid mutations
  const loadedProject = JSON.parse(JSON.stringify(project));
  const newSlideIndex = loadedProject.slides.length > 0 ? 0 : -1;

  batch(() => {
    setProject(loadedProject);
    setState({
      selectedSlideIndex: newSlideIndex,
      hasUnsavedChanges: false
    });
  });

  emit(EventTypes.PROJECT_LOADED, { project: loadedProject });
  closeProjectModal();
  hideUnsavedAlert();
  updateSaveButtonState('saved');

  // Update UI
  refreshSlideList();
  refreshEditor();
  refreshPreview();
  if (window.updateHeaderTitle) window.updateHeaderTitle();
  if (window.updateAppThemeColors) window.updateAppThemeColors();

  return true;
}

/**
 * Delete project by index (for UI)
 * @param {number} index - Project index in storage
 * @returns {boolean} Success status
 */
export function deleteProject(index) {
  // Prevent deleting the currently opened project
  const currentProject = getProject();
  const projects = storage.getAll();
  const projectToDelete = projects[index];

  if (projectToDelete && currentProject?.name && projectToDelete.name === currentProject.name) {
    return false;
  }

  if (confirm('Supprimer ce projet ?')) {
    const success = storage.delete(index);
    if (success) {
      renderProjectList();
    }
    return success;
  }
  return false;
}
