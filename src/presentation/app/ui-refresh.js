// src/app/ui-refresh.js
// UI refresh utilities - centralized event-based UI refresh functions
// Replaces window.renderSlideList, window.renderEditor, window.updatePreview patterns

import { emit, EventTypes } from '../../core/events/index.js';

/**
 * Request a full UI refresh
 * Emits UI_REFRESH_REQUESTED event for components to respond to
 */
export function refreshUI() {
  emit(EventTypes.UI_REFRESH_REQUESTED);
}

/**
 * Request slide list refresh
 * Components subscribed to SLIDE_LIST_CHANGED will re-render
 */
export function refreshSlideList() {
  emit(EventTypes.SLIDE_LIST_CHANGED);
}

/**
 * Request editor panel refresh
 * Components subscribed to EDITOR_REFRESH_REQUESTED will re-render
 */
export function refreshEditor() {
  emit(EventTypes.EDITOR_REFRESH_REQUESTED);
}

/**
 * Request preview refresh
 * Components subscribed to PREVIEW_REFRESH_REQUESTED will re-render
 */
export function refreshPreview() {
  emit(EventTypes.PREVIEW_REFRESH_REQUESTED);
}

/**
 * Request all UI components to refresh (slide list, editor, preview)
 * Convenience function that emits all refresh events
 */
export function refreshAll() {
  refreshSlideList();
  refreshEditor();
  refreshPreview();
}
