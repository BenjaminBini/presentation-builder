// src/projects/manager.js
// Project CRUD operations with state integration

import { getState, setState, setProject, batch, getProject, setSelectedSlideIndex, markAsChanged, clearUnsavedChanges as clearChanges, hideUnsavedAlert, updateSaveButtonState } from '../core/state.js';
import { emit, EventTypes } from '../core/events.js';
import { storage, projectExists } from './storage.js';

/**
 * Save current project to localStorage
 * @param {string} [name] - Optional project name (uses current if not provided)
 * @returns {boolean} Success status
 */
export function saveCurrentProject(name) {
  // Get project from centralized state
  const sourceProject = getProject();
  const project = { ...sourceProject };

  if (name) {
    project.name = name.trim();
  }

  if (!project.name) {
    // Show save modal to get project name
    openSaveProjectModal();
    return false;
  }

  project.savedAt = new Date().toISOString();

  const success = storage.save(project);

  if (success) {
    batch(() => {
      setProject(project);
      setState({ hasUnsavedChanges: false });
    });

    emit(EventTypes.PROJECT_SAVED, { project });
    hideUnsavedAlert();
    updateSaveButtonState('saved');
    return true;
  } else {
    return false;
  }
}

/**
 * Load a project by index
 * @param {number} index - Project index in storage
 * @returns {boolean} Success status
 */
export function loadProjectByIndex(index) {
  const project = storage.get(index);

  if (!project) {
    return false;
  }

  // Deep clone to avoid mutations
  const loadedProject = JSON.parse(JSON.stringify(project));
  const newSlideIndex = loadedProject.slides.length > 0 ? 0 : -1;

  batch(() => {
    setProject(loadedProject);
    setSelectedSlideIndex(newSlideIndex);
    setState({ hasUnsavedChanges: false });
  });

  emit(EventTypes.PROJECT_LOADED, { project: loadedProject });
  hideUnsavedAlert();
  updateSaveButtonState('saved');
  return true;
}

/**
 * Load a project by name
 * @param {string} name - Project name
 * @returns {boolean} Success status
 */
export function loadProjectByName(name) {
  const projects = storage.getAll();
  const index = projects.findIndex(p => p.name === name);

  if (index < 0) {
    return false;
  }

  return loadProjectByIndex(index);
}

/**
 * Delete a project by index
 * @param {number} index - Project index
 * @param {boolean} [confirm=true] - Whether to show confirmation dialog
 * @returns {boolean} Success status
 */
export function deleteProjectByIndex(index, confirm = true) {
  if (confirm && !window.confirm('Supprimer ce projet ?')) {
    return false;
  }

  const success = storage.delete(index);

  return success;
}

/**
 * Create a new project
 * @param {Project} [template] - Optional template project
 * @param {boolean} [confirm=true] - Whether to show confirmation for unsaved changes
 * @returns {boolean} Success status
 */
export function createNewProject(template, confirm = true) {
  const state = getState();

  if (confirm && state.hasUnsavedChanges) {
    if (!window.confirm('Créer un nouveau projet ? Les modifications non sauvegardées seront perdues.')) {
      return false;
    }
  }

  const newProject = template
    ? JSON.parse(JSON.stringify(template))
    : {
        name: null,
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

  // New projects are always unnamed until explicitly saved
  newProject.name = null;

  const newSlideIndex = newProject.slides.length > 0 ? 0 : -1;

  batch(() => {
    setProject(newProject);
    setSelectedSlideIndex(newSlideIndex);
    setState({ hasUnsavedChanges: false });
  });

  emit(EventTypes.PROJECT_LOADED, { project: newProject });
  return true;
}

/**
 * Export current project as JSON file
 * @returns {boolean} Success status
 */
export function exportCurrentProject() {
  const project = getProject();

  const exportData = {
    metadata: {
      title: project.name,
      ...project.metadata
    },
    theme: project.theme,
    slides: project.slides
  };

  try {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = project.name
      ? `${project.name.replace(/[^a-z0-9]/gi, '-')}.json`
      : 'presentation.json';

    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    return true;
  } catch (e) {
    console.error('Error exporting project:', e);
    return false;
  }
}

/**
 * Import a project from JSON file
 * @param {File} file - File object
 * @returns {Promise<boolean>} Success status
 */
export async function importProject(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate basic structure
    if (!data.slides || !Array.isArray(data.slides)) {
      throw new Error('Invalid project format');
    }

    const importedProject = {
      name: data.metadata?.title || 'Imported Project',
      metadata: data.metadata || {},
      theme: data.theme || { base: 'gitlab', overrides: {} },
      slides: data.slides
    };

    batch(() => {
      setProject(importedProject);
      setState({
        selectedSlideIndex: importedProject.slides.length > 0 ? 0 : -1,
        hasUnsavedChanges: true
      });
    });

    emit(EventTypes.PROJECT_LOADED, { project: importedProject });
    return true;
  } catch (e) {
    console.error('Error importing project:', e);
    return false;
  }
}

/**
 * Check if a project name is valid and available
 * @param {string} name - Project name to validate
 * @param {string} [currentName] - Current project name (for updates)
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProjectName(name, currentName) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { valid: false, error: 'Le nom ne peut pas être vide' };
  }

  if (trimmedName !== currentName && projectExists(trimmedName)) {
    return { valid: false, error: 'Un projet avec ce nom existe déjà' };
  }

  return { valid: true, error: null };
}

/**
 * Rename current project
 * @param {string} newName - New project name
 * @returns {boolean} Success status
 */
export function renameCurrentProject(newName) {
  const state = getState();
  const currentName = state.project.name;

  const validation = validateProjectName(newName, currentName);
  if (!validation.valid) {
    return false;
  }

  // If project was previously saved, update it in storage
  if (currentName) {
    const projects = storage.getAll();
    const index = projects.findIndex(p => p.name === currentName);

    if (index >= 0) {
      const updatedProject = {
        ...state.project,
        name: newName.trim(),
        savedAt: new Date().toISOString()
      };

      projects[index] = updatedProject;
      localStorage.setItem('slideProjects', JSON.stringify(projects));

      batch(() => {
        setProject(updatedProject);
        setState({ hasUnsavedChanges: false });
      });

      emit(EventTypes.PROJECT_SAVED, { project: updatedProject });
      return true;
    }
  }

  // For unsaved projects, just update the name
  setState({
    project: {
      ...state.project,
      name: newName.trim()
    }
  });

  return true;
}

/**
 * Mark current project as having unsaved changes
 */
export function markUnsavedChanges() {
  markAsChanged();
  emit(EventTypes.CHANGES_MARKED);
}

/**
 * Clear unsaved changes flag (re-export with event emission)
 */
export function clearUnsavedChangesWithEvent() {
  clearChanges();
  emit(EventTypes.CHANGES_CLEARED);
}

/**
 * Get project statistics
 * @param {number} [index] - Project index (uses current if not provided)
 * @returns {Object} Project stats
 */
export function getProjectStats(index) {
  const project = typeof index === 'number' ? storage.get(index) : getProject();

  if (!project) {
    return null;
  }

  return {
    name: project.name,
    slideCount: project.slides.length,
    savedAt: project.savedAt,
    hasDriveId: !!project.driveId,
    theme: project.theme.base
  };
}

/**
 * Get all projects with statistics
 * @returns {Array<Object>} Array of project stats
 */
export function getAllProjectStats() {
  const projects = storage.getAll();
  return projects.map((project, index) => ({
    index,
    name: project.name,
    slideCount: project.slides.length,
    savedAt: project.savedAt,
    hasDriveId: !!project.driveId,
    theme: project.theme.base
  }));
}

// ============================================================================
// MODAL FUNCTIONS (for UI compatibility)
// ============================================================================

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
function renderProjectList() {
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
    return `
    <div class="project-item ${isCurrentProject ? 'current' : ''}" data-index="${index}">
      <div class="project-info">
        <span class="project-name">${project.name || 'Sans nom'}${isCurrentProject ? '<span class="project-current-badge">Ouvert</span>' : ''}</span>
        <span class="project-meta">
          <svg class="project-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
          </svg>
          ${slideCount} slide${slideCount !== 1 ? 's' : ''}
        </span>
      </div>
      <div class="project-actions">
        <button class="project-btn project-btn-open" onclick="loadProject(${index})" ${isCurrentProject ? 'disabled' : ''} title="Ouvrir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
          </svg>
        </button>
        <button class="project-btn project-btn-delete" onclick="deleteProject(${index})" ${isCurrentProject ? 'disabled' : ''} title="Supprimer">
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
 * Load project by index (alias for UI)
 */
export function loadProject(index) {
  const success = loadProjectByIndex(index);
  if (success) {
    closeProjectModal();
    // Update UI
    if (window.renderSlideList) window.renderSlideList();
    if (window.renderEditor) window.renderEditor();
    if (window.updatePreview) window.updatePreview();
    if (window.updateHeaderTitle) window.updateHeaderTitle();
    if (window.updateAppThemeColors) window.updateAppThemeColors();
    // Set save status to saved since project was loaded from storage
    if (window.updateSaveButtonState) window.updateSaveButtonState('saved');
  }
  return success;
}

/**
 * Delete project by index (alias for UI)
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
    const success = deleteProjectByIndex(index, false);
    if (success) {
      renderProjectList();
    }
    return success;
  }
  return false;
}

/**
 * Rename project (alias for UI)
 */
export function renameProject(newName) {
  return renameCurrentProject(newName);
}
