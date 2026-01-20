// src/app/state.js
// Re-exports state functions for app-level modules

export {
  // Core
  store,
  getState,
  setState,
  get,
  set,
  subscribe,
  batch,
  reset,

  // Project
  getProject,
  setProject,
  getSlides,
  setSlides,
  getSelectedSlide,
  getSelectedSlideIndex,
  setSelectedSlideIndex,
  getTheme,

  // Slide operations
  updateSlideData,
  addSlide,
  removeSlide,
  duplicateSlide,
  moveSlide,

  // Unsaved changes
  hasUnsavedChanges,
  setHasUnsavedChanges,
  isProjectSaved
} from '../../core/state.js';

// UI state helpers - re-export for convenience
export {
  showUnsavedAlert,
  hideUnsavedAlert,
  dismissUnsavedAlert,
  updateSaveButtonState
} from './state-ui.js';
