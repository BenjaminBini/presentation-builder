// src/core/state/store.js
// Pure state store - no DOM manipulation

/**
 * @typedef {Object} ProjectMetadata
 * @property {string} title
 * @property {string} author
 * @property {string} date
 * @property {string} version
 */

/**
 * @typedef {Object} ProjectTheme
 * @property {string} base
 * @property {Object} overrides
 */

/**
 * @typedef {Object} Project
 * @property {string|null} name
 * @property {ProjectMetadata} metadata
 * @property {ProjectTheme} theme
 * @property {Array} slides
 * @property {string} [driveId]
 * @property {string} [savedAt]
 */

/**
 * @typedef {Object} UIState
 * @property {boolean} sidebarCollapsed
 * @property {boolean} editorCollapsed
 * @property {number|null} editorHeight
 * @property {string} currentSidebarTab
 * @property {string} currentEditorTab
 * @property {boolean} isResizingEditor
 */

/**
 * @typedef {Object} AppState
 * @property {Project} project
 * @property {number} selectedSlideIndex
 * @property {string|null} selectedTemplate
 * @property {number|null} draggedIndex
 * @property {boolean} hasUnsavedChanges
 * @property {UIState} ui
 * @property {Object} player
 */

export const createInitialState = () => ({
  project: {
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
  },
  selectedSlideIndex: -1,
  selectedTemplate: null,
  draggedIndex: null,
  hasUnsavedChanges: false,
  ui: {
    sidebarCollapsed: false,
    editorCollapsed: false,
    editorHeight: null,
    currentSidebarTab: 'slides',
    currentEditorTab: 'properties',
    isResizingEditor: false
  },
  player: {
    slideIndex: 0,
    resizeObserver: null
  },
  colorPicker: {
    active: null,
    spectrumDragging: false,
    originalValue: null,
    wasOverridden: false
  },
  drive: {
    gapiReady: false,
    gisReady: false,
    initialized: false
  }
});

/**
 * StateStore - Centralized state management with subscriptions
 * Pure data store - no DOM manipulation
 */
class StateStore {
  constructor(initialState) {
    this._state = initialState;
    this._listeners = new Set();
    this._batchDepth = 0;
    this._pendingNotify = false;
  }

  /**
   * Get current state
   * @returns {AppState}
   */
  getState() {
    return this._state;
  }

  /**
   * Get a specific part of state by path
   * @param {string} path - Dot-separated path (e.g., 'project.slides')
   * @returns {*}
   */
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this._state);
  }

  /**
   * Update state with a partial update or updater function
   * @param {Object|Function} updater - Partial state object or updater function
   */
  setState(updater) {
    const newState = typeof updater === 'function'
      ? updater(this._state)
      : this._deepMerge(this._state, updater);

    this._state = newState;

    if (this._batchDepth === 0) {
      this._notify();
    } else {
      this._pendingNotify = true;
    }
  }

  /**
   * Set a specific path in state
   * @param {string} path - Dot-separated path
   * @param {*} value - New value
   */
  set(path, value) {
    const keys = path.split('.');
    const newState = { ...this._state };
    let current = newState;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    this._state = newState;

    if (this._batchDepth === 0) {
      this._notify();
    } else {
      this._pendingNotify = true;
    }
  }

  /**
   * Batch multiple state updates into one notification
   * @param {Function} fn - Function containing multiple state updates
   */
  batch(fn) {
    this._batchDepth++;
    try {
      fn();
    } finally {
      this._batchDepth--;
      if (this._batchDepth === 0 && this._pendingNotify) {
        this._pendingNotify = false;
        this._notify();
      }
    }
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /**
   * Reset state to initial values
   */
  reset() {
    this._state = createInitialState();
    this._notify();
  }

  _notify() {
    this._listeners.forEach(fn => {
      try {
        fn(this._state);
      } catch (e) {
        console.error('State listener error:', e);
      }
    });
  }

  _deepMerge(target, source) {
    const output = { ...target };

    for (const key of Object.keys(source)) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          output[key] = this._deepMerge(target[key], source[key]);
        } else {
          output[key] = { ...source[key] };
        }
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }
}

// Create singleton instance
const store = new StateStore(createInitialState());

// Export store and class
export { store, StateStore };

// Low-level state access (used by selectors and actions)
export const getState = () => store.getState();
export const setState = (updater) => store.setState(updater);
export const get = (path) => store.get(path);
export const set = (path, value) => store.set(path, value);
export const subscribe = (listener) => store.subscribe(listener);
export const batch = (fn) => store.batch(fn);
export const reset = () => store.reset();
