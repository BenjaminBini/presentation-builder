// src/inline-editing/list-table-manager.js
// List item and table row/column operations

import { emit, EventTypes } from '../core/events.js';
import { getState, getSelectedSlideIndex, set, setHasUnsavedChanges } from '../core/state.js';

// ============================================================================
// LIST ITEM MANAGEMENT
// ============================================================================

/**
 * Delete list item by index
 * @param {string} listKey - List field key (supports dot notation)
 * @param {number} itemIndex - Index of item to delete
 */
export function deleteListItem(listKey, itemIndex) {
  const selectedSlideIndex = getSelectedSlideIndex();
  const state = getState();

  if (selectedSlideIndex < 0 || !state.project.slides[selectedSlideIndex]) {
    return;
  }

  const slide = state.project.slides[selectedSlideIndex];
  const data = { ...slide.data };

  // Handle nested keys like 'left.items'
  const keys = listKey.split('.');
  let target = data;

  // Navigate to the array
  for (const key of keys) {
    if (target === undefined || target === null) return;
    target = target[key];
  }

  if (!Array.isArray(target) || itemIndex < 0 || itemIndex >= target.length) {
    return;
  }

  // Don't delete if it's the last item
  if (target.length <= 1) {
    return;
  }

  // Clone the array and remove the item
  const newArray = [...target];
  newArray.splice(itemIndex, 1);

  // Update the data structure
  let dataTarget = data;
  for (let i = 0; i < keys.length - 1; i++) {
    dataTarget[keys[i]] = { ...dataTarget[keys[i]] };
    dataTarget = dataTarget[keys[i]];
  }
  dataTarget[keys[keys.length - 1]] = newArray;

  // Update slide
  const slides = [...state.project.slides];
  slides[selectedSlideIndex] = { ...slide, data };
  set('project.slides', slides);

  // Emit events for UI updates via subscriptions
  emit(EventTypes.CHANGES_MARKED);
  setHasUnsavedChanges(true);
  emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex });

  // Refresh editor panel (refresh required for immediate UI update)
  if (typeof window.renderEditor === 'function') {
    window.renderEditor();
  }
}

/**
 * Add new list item
 * @param {string} listKey - List field key (supports dot notation)
 * @param {string} listType - Type of list items ('string' or 'object')
 */
export function addListItem(listKey, listType) {
  const selectedSlideIndex = getSelectedSlideIndex();
  const state = getState();

  if (selectedSlideIndex < 0 || !state.project.slides[selectedSlideIndex]) {
    return;
  }

  const slide = state.project.slides[selectedSlideIndex];
  const data = { ...slide.data };

  // Handle nested keys like 'left.items'
  const keys = listKey.split('.');
  let target = data;

  // Navigate to the array (or create path if needed)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (i === keys.length - 1) {
      // Last key - this should be the array
      if (!target[key]) {
        target[key] = [];
      } else {
        target[key] = [...target[key]];
      }
      target = target[key];
    } else {
      if (!target[key]) {
        target[key] = {};
      } else {
        target[key] = { ...target[key] };
      }
      target = target[key];
    }
  }

  if (!Array.isArray(target)) {
    return;
  }

  // Create new item based on type and template
  let newItem;
  const template = slide.template;

  if (listKey === 'steps') {
    newItem = {
      icon: String(target.length + 1),
      title: 'Nouvelle étape',
      description: 'Description'
    };
  } else if (listKey === 'stats') {
    newItem = {
      value: '0',
      label: 'Nouveau',
      change: '+0%'
    };
  } else if (listKey === 'items' && template === 'agenda') {
    // Agenda items
    newItem = {
      title: `Point ${target.length + 1}`,
      subtitle: '',
      duration: ''
    };
  } else if (listType === 'object') {
    newItem = {};
  } else {
    // Simple string items (bullets, two-columns, etc.)
    newItem = 'Nouvel élément';
  }

  // Add the item
  target.push(newItem);

  // Update slide
  const slides = [...state.project.slides];
  slides[selectedSlideIndex] = { ...slide, data };
  set('project.slides', slides);

  // Emit events for UI updates via subscriptions
  emit(EventTypes.CHANGES_MARKED);
  setHasUnsavedChanges(true);
  emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex });

  // Refresh editor panel (refresh required for immediate UI update)
  if (typeof window.renderEditor === 'function') {
    window.renderEditor();
  }
}

// ============================================================================
// TABLE MANIPULATION (COMPARISON TEMPLATE)
// ============================================================================

/**
 * Add column to comparison table
 */
export function addTableColumn() {
  const selectedSlideIndex = getSelectedSlideIndex();
  const state = getState();

  if (selectedSlideIndex < 0 || !state.project.slides[selectedSlideIndex]) return;

  const slide = state.project.slides[selectedSlideIndex];
  if (slide.template !== 'comparison') return;

  const data = { ...slide.data };
  if (!data.columns) data.columns = [];
  if (!data.rows) data.rows = [];

  // Clone arrays
  data.columns = [...data.columns];
  data.rows = data.rows.map(row => [...row]);

  // Add new column header
  data.columns.push(`Colonne ${data.columns.length + 1}`);

  // Add empty cell to each row
  data.rows.forEach(row => row.push(''));

  // Update slide
  const slides = [...state.project.slides];
  slides[selectedSlideIndex] = { ...slide, data };
  set('project.slides', slides);

  // Emit events for UI updates via subscriptions
  emit(EventTypes.CHANGES_MARKED);
  setHasUnsavedChanges(true);
  emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex });

  // Refresh editor panel (refresh required for immediate UI update)
  if (typeof window.renderEditor === 'function') {
    window.renderEditor();
  }
}

/**
 * Delete column from comparison table
 * @param {number} colIndex - Column index to delete
 */
export function deleteTableColumn(colIndex) {
  const selectedSlideIndex = getSelectedSlideIndex();
  const state = getState();

  if (selectedSlideIndex < 0 || !state.project.slides[selectedSlideIndex]) return;

  const slide = state.project.slides[selectedSlideIndex];
  if (slide.template !== 'comparison') return;

  const data = { ...slide.data };
  if (!data.columns || data.columns.length <= 1) {
    return;
  }

  // Clone arrays
  data.columns = [...data.columns];
  data.rows = data.rows.map(row => [...row]);

  // Remove column header
  data.columns.splice(colIndex, 1);

  // Remove cell from each row
  data.rows.forEach(row => row.splice(colIndex, 1));

  // Adjust highlight column if needed
  if (data.highlightColumn) {
    const highlightIdx = parseInt(data.highlightColumn);
    if (highlightIdx === colIndex + 1) {
      data.highlightColumn = null;
    } else if (highlightIdx > colIndex + 1) {
      data.highlightColumn = highlightIdx - 1;
    }
  }

  // Update slide
  const slides = [...state.project.slides];
  slides[selectedSlideIndex] = { ...slide, data };
  set('project.slides', slides);

  // Emit events for UI updates via subscriptions
  emit(EventTypes.CHANGES_MARKED);
  setHasUnsavedChanges(true);
  emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex });

  // Refresh editor panel (refresh required for immediate UI update)
  if (typeof window.renderEditor === 'function') {
    window.renderEditor();
  }
}

/**
 * Add row to comparison table
 */
export function addTableRow() {
  const selectedSlideIndex = getSelectedSlideIndex();
  const state = getState();

  if (selectedSlideIndex < 0 || !state.project.slides[selectedSlideIndex]) return;

  const slide = state.project.slides[selectedSlideIndex];
  if (slide.template !== 'comparison') return;

  const data = { ...slide.data };
  if (!data.columns) data.columns = ['Colonne 1'];
  if (!data.rows) data.rows = [];

  // Clone arrays
  data.columns = [...data.columns];
  data.rows = [...data.rows];

  // Create new row with empty cells matching column count
  const newRow = data.columns.map((_, i) => i === 0 ? `Ligne ${data.rows.length + 1}` : '');
  data.rows.push(newRow);

  // Update slide
  const slides = [...state.project.slides];
  slides[selectedSlideIndex] = { ...slide, data };
  set('project.slides', slides);

  // Emit events for UI updates via subscriptions
  emit(EventTypes.CHANGES_MARKED);
  setHasUnsavedChanges(true);
  emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex });

  // Refresh editor panel (refresh required for immediate UI update)
  if (typeof window.renderEditor === 'function') {
    window.renderEditor();
  }
}

/**
 * Delete row from comparison table
 * @param {number} rowIndex - Row index to delete
 */
export function deleteTableRow(rowIndex) {
  const selectedSlideIndex = getSelectedSlideIndex();
  const state = getState();

  if (selectedSlideIndex < 0 || !state.project.slides[selectedSlideIndex]) return;

  const slide = state.project.slides[selectedSlideIndex];
  if (slide.template !== 'comparison') return;

  const data = { ...slide.data };
  if (!data.rows || data.rows.length <= 1) {
    return;
  }

  // Clone array
  data.rows = [...data.rows];
  data.rows.splice(rowIndex, 1);

  // Update slide
  const slides = [...state.project.slides];
  slides[selectedSlideIndex] = { ...slide, data };
  set('project.slides', slides);

  // Emit events for UI updates via subscriptions
  emit(EventTypes.CHANGES_MARKED);
  setHasUnsavedChanges(true);
  emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex });

  // Refresh editor panel (refresh required for immediate UI update)
  if (typeof window.renderEditor === 'function') {
    window.renderEditor();
  }
}
