// src/inline-editing/data-updates.js
// Field value updates and nested field handling
// Converted from InlineEditor methods to standalone functions

import { getState, getSelectedSlideIndex, set, markAsChanged } from '../core/state.js';
import { emit, EventTypes } from '../core/events.js';

/**
 * Update slide data with support for nested keys and array indices
 * Handles patterns like:
 * - Direct fields: 'title'
 * - Nested keys: 'left.items'
 * - Array items: 'items[0]'
 * - Nested array objects: 'stats[0].value'
 *
 * @param {string} key - Field key (supports dot notation)
 * @param {*} value - New value
 * @param {number|null} index - Array index (optional)
 * @param {string|null} subkey - Subkey for nested array objects (optional)
 */
export function updateSlideData(key, value, index = null, subkey = null) {
  const selectedSlideIndex = getSelectedSlideIndex();
  const state = getState();

  if (selectedSlideIndex < 0 || !state.project.slides[selectedSlideIndex]) {
    return;
  }

  const slide = state.project.slides[selectedSlideIndex];
  const data = { ...slide.data };

  // Handle nested keys like 'left.items'
  const keys = key.split('.');
  let target = data;

  // Navigate to parent of final key
  for (let i = 0; i < keys.length - 1; i++) {
    if (target[keys[i]] === undefined) {
      target[keys[i]] = {};
    } else {
      target[keys[i]] = { ...target[keys[i]] };
    }
    target = target[keys[i]];
  }

  const finalKey = keys[keys.length - 1];

  // Update the value
  if (index !== null && index !== undefined && subkey) {
    // Nested array object: stats[0].value
    if (!target[finalKey]) target[finalKey] = [];
    else target[finalKey] = [...target[finalKey]];

    if (!target[finalKey][index]) target[finalKey][index] = {};
    else target[finalKey][index] = { ...target[finalKey][index] };

    target[finalKey][index][subkey] = value;
  } else if (index !== null && index !== undefined) {
    // Simple array: items[0]
    if (!target[finalKey]) target[finalKey] = [];
    else target[finalKey] = [...target[finalKey]];

    // Preserve object structure for bullet items with levels
    const existingItem = target[finalKey][index];
    if (typeof existingItem === 'object' && existingItem !== null && 'level' in existingItem) {
      target[finalKey][index] = { ...existingItem, text: value };
    } else {
      target[finalKey][index] = value;
    }
  } else {
    // Direct field: title
    target[finalKey] = value;
  }

  // Update state with new slide data
  const slides = [...state.project.slides];
  slides[selectedSlideIndex] = { ...slide, data };
  set('project.slides', slides);

  // Trigger autosave mechanism
  markAsChanged();

  // Emit events for UI updates via subscriptions
  emit(EventTypes.FIELD_CHANGED, { key, value, index, subkey });
  emit(EventTypes.SLIDE_UPDATED, { index: selectedSlideIndex, slide: slides[selectedSlideIndex] });
  emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key, value });

  // Update editor panel (refresh required for immediate UI update yet)
  if (typeof window.renderEditor === 'function') {
    window.renderEditor();
  }

  // Note: Preview updates via SLIDE_DATA_CHANGED subscription when editing ends
  // List updates via FIELD_CHANGED subscription (for title/quote changes)
}

/**
 * Get field value from current slide data
 * Supports nested keys and array indices
 *
 * @param {string} key - Field key (supports dot notation)
 * @param {number|null} index - Array index (optional)
 * @param {string|null} subkey - Subkey for nested array objects (optional)
 * @returns {*} Field value or null if not found
 */
export function getFieldValue(key, index = null, subkey = null) {
  const selectedSlideIndex = getSelectedSlideIndex();
  const state = getState();

  if (selectedSlideIndex < 0 || !state.project.slides[selectedSlideIndex]) {
    return null;
  }

  const data = state.project.slides[selectedSlideIndex].data;
  const keys = key.split('.');
  let target = data;

  for (const k of keys) {
    if (target === undefined || target === null) return null;
    target = target[k];
  }

  if (index !== null && index !== undefined && subkey) {
    return target?.[index]?.[subkey] ?? null;
  } else if (index !== null && index !== undefined) {
    const item = target?.[index];
    // If item is object with text property (bullet items with levels), return the text
    if (typeof item === 'object' && item !== null && 'text' in item) {
      return item.text ?? null;
    }
    return item ?? null;
  }
  return target ?? null;
}

