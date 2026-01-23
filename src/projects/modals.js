// src/projects/modals.js
// Modal UI functions for project management

import { setState, setProject, batch, getProject, setSelectedSlideIndex } from '../core/state.js';
import { hideUnsavedAlert, updateSaveButtonState } from '../presentation/app/state-ui.js';
import { emit, EventTypes } from '../core/events.js';
import { storage, projectExists } from '../infrastructure/storage/local.js';
import { refreshSlideList, refreshEditor, refreshPreview } from '../presentation/app/ui-refresh.js';
import { driveStorageService } from '../infrastructure/drive/storage-service.js';

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
    return success;
  }
  return false;
}

/**
 * Load project from Drive by fileId
 * @param {string} fileId - Drive file ID
 * @returns {Promise<boolean>} Success status
 */
export async function loadDriveProject(fileId) {
  try {
    const project = await driveStorageService.loadFromDrive(fileId);

    // Deep clone to avoid mutations
    const loadedProject = JSON.parse(JSON.stringify(project));
    const newSlideIndex = loadedProject.slides?.length > 0 ? 0 : -1;

    batch(() => {
      setProject(loadedProject);
      setSelectedSlideIndex(newSlideIndex);
      setState({ hasUnsavedChanges: false });
    });

    emit(EventTypes.PROJECT_LOADED, { project: loadedProject });
    hideUnsavedAlert();
    updateSaveButtonState('saved');

    // Update UI
    refreshSlideList();
    refreshEditor();
    refreshPreview();
    if (window.updateHeaderTitle) window.updateHeaderTitle();
    if (window.updateAppThemeColors) window.updateAppThemeColors();

    return true;
  } catch (error) {
    console.error('Error loading Drive project:', error);
    alert('Erreur lors du chargement du projet: ' + error.message);
    return false;
  }
}
