// src/core/state.js
// Re-exports pure state functions
// DOM helpers have been moved to src/app/state-ui.js (proper UI layer)

export * from './state/index.js';

// Re-export DOM helpers from UI layer for backwards compatibility
// These should be imported directly from '../app/state-ui.js' in new code
export {
  showUnsavedAlert,
  hideUnsavedAlert,
  dismissUnsavedAlert,
  updateSaveButtonState
} from '../app/state-ui.js';
