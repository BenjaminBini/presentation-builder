// src/services/project-service.js
// Project operations with event emission - no DOM manipulation

import {
  getProject,
  setProject,
  setSelectedSlideIndex,
  setHasUnsavedChanges,
  batch
} from '../domain/state/index.js';
import { emit, EventTypes } from '../domain/events/index.js';
import { generateUUID } from '../infrastructure/storage/local.js';

/**
 * Create initial project state
 * @returns {Object} New project object
 */
export function createEmptyProject() {
  return {
    localId: generateUUID(), // Stable identity for local projects
    driveId: null,           // Set when saved to Google Drive
    name: null,
    metadata: {
      title: 'Ma Presentation',
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
}

/**
 * Load a project into state
 * @param {Object} projectData - Project data to load
 * @returns {boolean} Success status
 */
export function loadProject(projectData) {
  if (!projectData) {
    return false;
  }

  // Deep clone to avoid mutations
  const project = JSON.parse(JSON.stringify(projectData));
  const newSlideIndex = project.slides?.length > 0 ? 0 : -1;

  batch(() => {
    setProject(project);
    setSelectedSlideIndex(newSlideIndex);
    setHasUnsavedChanges(false);
  });

  emit(EventTypes.PROJECT_LOADED, { project });
  return true;
}

/**
 * Create a new empty project
 * @param {Object} [template] - Optional template to base project on
 * @returns {Object} The new project
 */
export function createNewProject(template) {
  const newProject = template
    ? JSON.parse(JSON.stringify(template))
    : createEmptyProject();

  // New projects are always unnamed until explicitly saved
  newProject.name = null;

  // Ensure new project gets a fresh localId
  newProject.localId = generateUUID();
  newProject.driveId = null;

  const newSlideIndex = newProject.slides?.length > 0 ? 0 : -1;

  batch(() => {
    setProject(newProject);
    setSelectedSlideIndex(newSlideIndex);
    setHasUnsavedChanges(false);
  });

  emit(EventTypes.PROJECT_CREATED, { project: newProject });
  emit(EventTypes.PROJECT_LOADED, { project: newProject });
  return newProject;
}

/**
 * Save current project with a name
 * @param {string} name - Project name
 * @returns {Object} The saved project data
 */
export function saveProject(name) {
  const project = { ...getProject() };

  if (name) {
    project.name = name.trim();
  }

  project.savedAt = new Date().toISOString();

  batch(() => {
    setProject(project);
    setHasUnsavedChanges(false);
  });

  emit(EventTypes.PROJECT_SAVED, { project });
  return project;
}

/**
 * Update project metadata
 * @param {Object} metadata - Partial metadata to merge
 */
export function updateProjectMetadata(metadata) {
  const project = getProject();
  const updatedProject = {
    ...project,
    metadata: { ...project.metadata, ...metadata }
  };

  setProject(updatedProject);
  emit(EventTypes.STATE_CHANGED, { key: 'metadata', value: metadata });
}

// Note: Removed simple wrappers - use domain/state directly:
// - setHasUnsavedChanges(true) for marking changes
// - setHasUnsavedChanges(false) for clearing changes
// - getProject() and extract needed fields for export

/**
 * Import project from external data
 * @param {Object} data - Imported project data
 * @returns {boolean} Success status
 */
export function importProject(data) {
  if (!data?.slides || !Array.isArray(data.slides)) {
    return false;
  }

  const importedProject = {
    localId: generateUUID(), // New localId for imported project
    driveId: null,
    name: data.metadata?.title || 'Imported Project',
    metadata: data.metadata || {},
    theme: data.theme || { base: 'gitlab', overrides: {} },
    slides: data.slides
  };

  batch(() => {
    setProject(importedProject);
    setSelectedSlideIndex(importedProject.slides.length > 0 ? 0 : -1);
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.PROJECT_LOADED, { project: importedProject });
  return true;
}
