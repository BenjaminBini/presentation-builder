// src/editor/state.js
// Editor-specific state management

import { get, set, subscribe } from '../core/state.js';
import { emit, EventTypes } from '../core/events.js';

/**
 * Get current editor tab
 * @returns {string} 'properties' or 'colors'
 */
export function getCurrentEditorTab() {
  return get('ui.currentEditorTab') || 'properties';
}

/**
 * Set current editor tab
 * @param {string} tab - 'properties' or 'colors'
 */
export function setCurrentEditorTab(tab) {
  set('ui.currentEditorTab', tab);
  emit(EventTypes.TAB_SWITCHED, { tab, panel: 'editor' });
}

/**
 * Get editor collapsed state
 * @returns {boolean}
 */
export function isEditorCollapsed() {
  return get('ui.editorCollapsed') || false;
}

/**
 * Toggle editor collapsed state
 */
export function toggleEditorCollapsed() {
  const current = isEditorCollapsed();
  set('ui.editorCollapsed', !current);
  emit(EventTypes.EDITOR_TOGGLED, { collapsed: !current });
}

/**
 * Get editor height
 * @returns {number|null}
 */
export function getEditorHeight() {
  return get('ui.editorHeight');
}

/**
 * Set editor height
 * @param {number} height
 */
export function setEditorHeight(height) {
  set('ui.editorHeight', height);
}

/**
 * Get resizing state
 * @returns {boolean}
 */
export function isResizingEditor() {
  return get('ui.isResizingEditor') || false;
}

/**
 * Set resizing state
 * @param {boolean} resizing
 */
export function setResizingEditor(resizing) {
  set('ui.isResizingEditor', resizing);
}

/**
 * Subscribe to editor state changes
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export function subscribeToEditorState(callback) {
  return subscribe((state) => {
    callback({
      tab: state.ui.currentEditorTab,
      collapsed: state.ui.editorCollapsed,
      height: state.ui.editorHeight,
      isResizing: state.ui.isResizingEditor
    });
  });
}
