// src/editor/handlers.js
// All field update and change handler functions - uses proper immutable state updates

import { getDefaultData } from '../config/index.js';
import {
  getProject,
  getSelectedSlideIndex,
  getSlides,
  updateSlideData,
  batch,
  setHasUnsavedChanges
} from '../core/state/index.js';
import { emit, EventTypes } from '../core/events/index.js';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely get the current slide data
 * @returns {{ slide: Object|null, index: number }} Current slide and index
 */
function getCurrentSlideContext() {
  const index = getSelectedSlideIndex();
  const slides = getSlides();

  if (index < 0 || index >= slides.length) {
    return { slide: null, index: -1 };
  }

  return { slide: slides[index], index };
}

/**
 * Update slide data immutably and emit events
 * @param {number} index - Slide index
 * @param {Object} data - Partial data to update
 * @param {string} [key] - Optional key for specific field change event
 */
function updateSlideAndEmit(index, data, key) {
  batch(() => {
    updateSlideData(index, data);
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.SLIDE_DATA_CHANGED, { index, key, ...data });
  if (key) {
    emit(EventTypes.FIELD_CHANGED, { index, key, value: data[key] });
  }
  emit(EventTypes.CHANGES_MARKED);
}

// ============================================================================
// BASIC FIELD HANDLERS
// ============================================================================

export function updateField(key, value) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  updateSlideAndEmit(index, { [key]: value }, key);
}

export function changeTemplate(newTemplate) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const project = getProject();
  const oldData = slide.data;
  const defaultData = getDefaultData(newTemplate);

  // Create new slides array immutably
  const newSlides = [...project.slides];
  newSlides[index] = {
    template: newTemplate,
    data: {
      ...defaultData,
      title: oldData.title || defaultData.title
    }
  };

  batch(() => {
    // Update through proper state action
    const store = project;
    store.slides = newSlides;
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.TEMPLATE_CHANGED, { index, template: newTemplate });
  emit(EventTypes.SLIDE_DATA_CHANGED, { index });
  emit(EventTypes.CHANGES_MARKED);

  // Re-render editor for new template fields
  if (window.renderEditor) window.renderEditor();
}

// ============================================================================
// ARRAY FIELD HANDLERS
// ============================================================================

export function updateArrayItem(key, itemIndex, value) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentArray = slide.data[key];
  if (!Array.isArray(currentArray) || itemIndex >= currentArray.length) return;

  const newArray = [...currentArray];
  newArray[itemIndex] = value;

  updateSlideAndEmit(index, { [key]: newArray }, key);
}

export function addArrayItem(key) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentArray = slide.data[key] || [];
  const newArray = [...currentArray, 'Nouvel element'];

  updateSlideAndEmit(index, { [key]: newArray }, key);

  if (window.renderEditor) window.renderEditor();
}

export function removeArrayItem(key, itemIndex) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentArray = slide.data[key];
  if (!Array.isArray(currentArray) || itemIndex >= currentArray.length) return;

  const newArray = currentArray.filter((_, i) => i !== itemIndex);

  updateSlideAndEmit(index, { [key]: newArray }, key);

  if (window.renderEditor) window.renderEditor();
}

// ============================================================================
// COLUMN FIELD HANDLERS
// ============================================================================

export function updateColumnField(key, field, value) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentColumn = slide.data[key] || { title: '', items: [] };
  const newColumn = { ...currentColumn, [field]: value };

  updateSlideAndEmit(index, { [key]: newColumn }, key);
}

export function updateColumnItem(key, itemIndex, value) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentColumn = slide.data[key];
  if (!currentColumn?.items || itemIndex >= currentColumn.items.length) return;

  const newItems = [...currentColumn.items];
  newItems[itemIndex] = value;
  const newColumn = { ...currentColumn, items: newItems };

  updateSlideAndEmit(index, { [key]: newColumn }, key);
}

export function addColumnItem(key) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentColumn = slide.data[key] || { title: '', items: [] };
  const newItems = [...(currentColumn.items || []), 'Nouvel item'];
  const newColumn = { ...currentColumn, items: newItems };

  updateSlideAndEmit(index, { [key]: newColumn }, key);

  if (window.renderEditor) window.renderEditor();
}

export function removeColumnItem(key, itemIndex) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentColumn = slide.data[key];
  if (!currentColumn?.items || itemIndex >= currentColumn.items.length) return;

  const newItems = currentColumn.items.filter((_, i) => i !== itemIndex);
  const newColumn = { ...currentColumn, items: newItems };

  updateSlideAndEmit(index, { [key]: newColumn }, key);

  if (window.renderEditor) window.renderEditor();
}

// ============================================================================
// STATS FIELD HANDLERS
// ============================================================================

export function updateStatItem(itemIndex, field, value) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentStats = slide.data.stats;
  if (!Array.isArray(currentStats) || itemIndex >= currentStats.length) return;

  const newStats = [...currentStats];
  newStats[itemIndex] = { ...newStats[itemIndex], [field]: value };

  updateSlideAndEmit(index, { stats: newStats }, 'stats');
}

export function addStatItem() {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentStats = slide.data.stats || [];
  const newStats = [...currentStats, { value: '0', label: 'Label', change: '' }];

  updateSlideAndEmit(index, { stats: newStats }, 'stats');

  if (window.renderEditor) window.renderEditor();
}

export function removeStatItem(itemIndex) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentStats = slide.data.stats;
  if (!Array.isArray(currentStats) || itemIndex >= currentStats.length) return;

  const newStats = currentStats.filter((_, i) => i !== itemIndex);

  updateSlideAndEmit(index, { stats: newStats }, 'stats');

  if (window.renderEditor) window.renderEditor();
}

// ============================================================================
// ANNOTATION FIELD HANDLERS
// ============================================================================

export function updateAnnotationItem(itemIndex, field, value) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentAnnotations = slide.data.annotations;
  if (!Array.isArray(currentAnnotations) || itemIndex >= currentAnnotations.length) return;

  const newAnnotations = [...currentAnnotations];
  newAnnotations[itemIndex] = { ...newAnnotations[itemIndex], [field]: value };

  updateSlideAndEmit(index, { annotations: newAnnotations }, 'annotations');
}

export function addAnnotationItem() {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentAnnotations = slide.data.annotations || [];
  const newAnnotations = [...currentAnnotations, { line: 1, text: 'Annotation' }];

  updateSlideAndEmit(index, { annotations: newAnnotations }, 'annotations');

  if (window.renderEditor) window.renderEditor();
}

export function removeAnnotationItem(itemIndex) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentAnnotations = slide.data.annotations;
  if (!Array.isArray(currentAnnotations) || itemIndex >= currentAnnotations.length) return;

  const newAnnotations = currentAnnotations.filter((_, i) => i !== itemIndex);

  updateSlideAndEmit(index, { annotations: newAnnotations }, 'annotations');

  if (window.renderEditor) window.renderEditor();
}

// ============================================================================
// STEP FIELD HANDLERS
// ============================================================================

export function updateStepItem(itemIndex, field, value) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentSteps = slide.data.steps;
  if (!Array.isArray(currentSteps) || itemIndex >= currentSteps.length) return;

  const newSteps = [...currentSteps];
  newSteps[itemIndex] = { ...newSteps[itemIndex], [field]: value };

  updateSlideAndEmit(index, { steps: newSteps }, 'steps');
}

export function addStepItem() {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentSteps = slide.data.steps || [];
  const num = currentSteps.length + 1;
  const newSteps = [...currentSteps, { icon: String(num), title: `Etape ${num}`, description: '' }];

  updateSlideAndEmit(index, { steps: newSteps }, 'steps');

  if (window.renderEditor) window.renderEditor();
}

export function removeStepItem(itemIndex) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentSteps = slide.data.steps;
  if (!Array.isArray(currentSteps) || itemIndex >= currentSteps.length) return;

  const newSteps = currentSteps.filter((_, i) => i !== itemIndex);

  updateSlideAndEmit(index, { steps: newSteps }, 'steps');

  if (window.renderEditor) window.renderEditor();
}

// ============================================================================
// ROW FIELD HANDLERS (for comparison tables)
// ============================================================================

export function updateRowCell(rowIndex, colIndex, value) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentRows = slide.data.rows;
  if (!Array.isArray(currentRows) || rowIndex >= currentRows.length) return;

  let cellValue = value;
  if (value === 'true') cellValue = true;
  else if (value === 'false') cellValue = false;

  const newRows = [...currentRows];
  newRows[rowIndex] = [...newRows[rowIndex]];
  newRows[rowIndex][colIndex] = cellValue;

  updateSlideAndEmit(index, { rows: newRows }, 'rows');
}

export function addRowItem() {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const columns = slide.data.columns || [];
  const newRow = columns.map(() => '');
  const currentRows = slide.data.rows || [];
  const newRows = [...currentRows, newRow];

  updateSlideAndEmit(index, { rows: newRows }, 'rows');

  if (window.renderEditor) window.renderEditor();
}

export function removeRowItem(rowIndex) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentRows = slide.data.rows;
  if (!Array.isArray(currentRows) || rowIndex >= currentRows.length) return;

  const newRows = currentRows.filter((_, i) => i !== rowIndex);

  updateSlideAndEmit(index, { rows: newRows }, 'rows');

  if (window.renderEditor) window.renderEditor();
}

// ============================================================================
// TABLE FIELD HANDLERS (for generic tables)
// ============================================================================

export function updateTableCell(rowIndex, colIndex, value) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentRows = slide.data.rows;
  if (!Array.isArray(currentRows) || rowIndex >= currentRows.length) return;

  const newRows = [...currentRows];
  newRows[rowIndex] = [...newRows[rowIndex]];
  newRows[rowIndex][colIndex] = value;

  updateSlideAndEmit(index, { rows: newRows }, 'rows');
}

export function addTableRow() {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const columns = slide.data.columns || [];
  const newRow = columns.map(() => '');
  const currentRows = slide.data.rows || [];
  const newRows = [...currentRows, newRow];

  updateSlideAndEmit(index, { rows: newRows }, 'rows');

  if (window.renderEditor) window.renderEditor();
}

export function removeTableRow(rowIndex) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentRows = slide.data.rows;
  if (!Array.isArray(currentRows) || rowIndex >= currentRows.length) return;

  const newRows = currentRows.filter((_, i) => i !== rowIndex);

  updateSlideAndEmit(index, { rows: newRows }, 'rows');

  if (window.renderEditor) window.renderEditor();
}

// ============================================================================
// AGENDA ITEM HANDLERS
// ============================================================================

export function updateAgendaItem(itemIndex, field, value) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentItems = slide.data.items || [];
  const newItems = [...currentItems];

  // Ensure item exists
  if (!newItems[itemIndex]) {
    newItems[itemIndex] = {};
  } else {
    newItems[itemIndex] = { ...newItems[itemIndex] };
  }

  newItems[itemIndex][field] = value;

  updateSlideAndEmit(index, { items: newItems }, 'items');
}

export function addAgendaItem() {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentItems = slide.data.items || [];
  const num = currentItems.length + 1;
  const newItems = [...currentItems, { title: `Point ${num}`, subtitle: '', duration: '' }];

  updateSlideAndEmit(index, { items: newItems }, 'items');

  if (window.renderEditor) window.renderEditor();
}

export function removeAgendaItem(itemIndex) {
  const { slide, index } = getCurrentSlideContext();
  if (!slide) return;

  const currentItems = slide.data.items;
  if (!Array.isArray(currentItems) || itemIndex >= currentItems.length) return;

  const newItems = currentItems.filter((_, i) => i !== itemIndex);

  updateSlideAndEmit(index, { items: newItems }, 'items');

  if (window.renderEditor) window.renderEditor();
}
