// src/projects/manager.js
// Project CRUD operations with state integration

import { getState, setState, setProject, batch, getProject, setSelectedSlideIndex, setHasUnsavedChanges } from '../core/state.js';
import { createNewProject as createProjectFromService } from '../services/project-service.js';
import { emit, EventTypes } from '../core/events.js';
import { storage, projectExists } from '../infrastructure/storage/local.js';
import { openSaveProjectModal as openSaveModal } from './modals.js';
import { driveStorageService } from '../infrastructure/drive/storage-service.js';
import { driveAPI } from '../infrastructure/drive/api.js';
import { driveAuth } from '../infrastructure/drive/auth.js';

// Re-export modal functions for backwards compatibility
export {
  openSaveProjectModal,
  closeSaveProjectModal,
  saveProjectWithName,
  validateSaveProjectName,
  loadProject,
  deleteProject
} from './modals.js';

/**
 * Save current project to its storage location (local or Drive)
 * @param {string} [name] - Optional project name (uses current if not provided)
 * @returns {Promise<boolean>} Success status
 */
export async function saveCurrentProject(name) {
  // Get project from centralized state
  const sourceProject = getProject();
  const project = { ...sourceProject };

  if (name) {
    project.name = name.trim();
  }

  if (!project.name) {
    // Show save modal to get project name
    openSaveModal();
    return false;
  }

  project.savedAt = new Date().toISOString();

  try {
    // Use driveStorageService to route to correct storage location
    const savedProject = await driveStorageService.save(project);

    batch(() => {
      setProject(savedProject);
      setState({ hasUnsavedChanges: false });
    });

    // Emit event - UI updates are handled by main.js subscriptions
    emit(EventTypes.PROJECT_SAVED, { project: savedProject });
    return true;
  } catch (error) {
    console.error('Error saving project:', error);
    // Handle auth issues for Drive projects
    if (error.message?.includes('Not authenticated') || error.message?.includes('sign in')) {
      if (driveAuth.tokenClient) {
        driveAuth.signIn();
      } else {
        alert('Veuillez rafraîchir la page et vous reconnecter à Google Drive.');
      }
    } else {
      alert('Erreur lors de la sauvegarde: ' + error.message);
    }
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

  // Emit event - UI updates are handled by main.js subscriptions
  emit(EventTypes.PROJECT_LOADED, { project: loadedProject });
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

  // Delegate to project-service.js for core project creation logic
  createProjectFromService(template);
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
 * @returns {Promise<boolean>} Success status
 */
export async function renameCurrentProject(newName) {
  const state = getState();
  const currentName = state.project.name;
  const storageLocation = driveStorageService.getProjectStorageLocation(state.project);

  const validation = validateProjectName(newName, currentName);
  if (!validation.valid) {
    return false;
  }

  const updatedProject = {
    ...state.project,
    name: newName.trim(),
    savedAt: new Date().toISOString()
  };

  // Handle Drive projects
  if (storageLocation === 'drive' && state.project.driveId) {
    try {
      await driveAPI.updatePresentation(state.project.driveId, updatedProject);

      batch(() => {
        setProject(updatedProject);
        setState({ hasUnsavedChanges: false });
      });

      emit(EventTypes.PROJECT_SAVED, { project: updatedProject });
      return true;
    } catch (error) {
      console.error('Error renaming Drive project:', error);
      // Handle auth issues by triggering sign-in
      if (error.message?.includes('Not authenticated') || error.message?.includes('sign in')) {
        if (driveAuth.tokenClient) {
          driveAuth.signIn();
        } else {
          alert('Veuillez rafraîchir la page et vous reconnecter à Google Drive.');
        }
      }
      return false;
    }
  }

  // Handle local projects
  if (currentName) {
    const projects = storage.getAll();
    const index = projects.findIndex(p => p.name === currentName);

    if (index >= 0) {
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
  setHasUnsavedChanges(true);
}

/**
 * Clear unsaved changes flag
 */
export function clearUnsavedChangesWithEvent() {
  setHasUnsavedChanges(false);
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

/**
 * Rename project (alias for UI)
 */
export function renameProject(newName) {
  return renameCurrentProject(newName);
}
