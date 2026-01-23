// src/core/state/selectors.js
// Read-only getters for state - pure functions, no side effects

import { store } from './store.js';

// Project selectors
export const getProject = () => store.get('project');
export const getProjectName = () => store.get('project.name');
export const getProjectMetadata = () => store.get('project.metadata');

// Slide selectors
export const getSlides = () => store.get('project.slides');
export const getSlideCount = () => store.get('project.slides')?.length ?? 0;
export const getSlideAt = (index) => store.get('project.slides')?.[index] ?? null;

export const getSelectedSlide = () => {
  const index = store.get('selectedSlideIndex');
  const slides = store.get('project.slides');
  return index >= 0 && slides ? slides[index] : null;
};

export const getSelectedSlideIndex = () => store.get('selectedSlideIndex');

// Theme selectors
export const getTheme = () => store.get('project.theme');
export const getThemeBase = () => store.get('project.theme.base');
export const getThemeOverrides = () => store.get('project.theme.overrides');

// UI state selectors
export const getUIState = () => store.get('ui');
export const isSidebarCollapsed = () => store.get('ui.sidebarCollapsed');
export const isEditorCollapsed = () => store.get('ui.editorCollapsed');
export const getEditorHeight = () => store.get('ui.editorHeight');
export const getCurrentSidebarTab = () => store.get('ui.currentSidebarTab');
export const getCurrentEditorTab = () => store.get('ui.currentEditorTab');
export const isResizingEditor = () => store.get('ui.isResizingEditor');

// Drag state selectors
export const getDraggedIndex = () => store.get('draggedIndex');
export const getSelectedTemplate = () => store.get('selectedTemplate');

// Persistence selectors
export const hasUnsavedChanges = () => store.get('hasUnsavedChanges');

/**
 * Check if project is saved (either locally or on Drive)
 * @param {string} [name] - Project name to check, defaults to current project
 * @returns {boolean}
 */
export const isProjectSaved = (name) => {
  const project = store.get('project');
  const projectName = name || project?.name;

  // If project has a driveId, it's saved on Drive
  if (project?.driveId) return true;

  // If project has a localId and exists in localStorage, it's saved locally
  if (project?.localId) {
    try {
      const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
      return projects.some(p => p.localId === project.localId);
    } catch (e) {
      // Fall through to name-based check
    }
  }

  // Fallback: check by name in localStorage
  if (!projectName) return false;

  try {
    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    return projects.some(p => p.name === projectName);
  } catch (e) {
    return false;
  }
};

// Player selectors
export const getPlayerSlideIndex = () => store.get('player.slideIndex');
export const getPlayerResizeObserver = () => store.get('player.resizeObserver');

// Color picker selectors
export const getActiveColorPicker = () => store.get('colorPicker.active');
export const isSpectrumDragging = () => store.get('colorPicker.spectrumDragging');
export const getOriginalColorValue = () => store.get('colorPicker.originalValue');
export const wasColorOverridden = () => store.get('colorPicker.wasOverridden');

// Drive selectors
export const isGapiReady = () => store.get('drive.gapiReady');
export const isGisReady = () => store.get('drive.gisReady');
export const isDriveInitialized = () => store.get('drive.initialized');
