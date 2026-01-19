// src/editor/handlers.js
// All field update and change handler functions - uses services

import { getDefaultData } from '../config/index.js';
import { getProject, getSelectedSlideIndex } from '../core/state/index.js';
import { emit, EventTypes } from '../core/events/index.js';

// ============================================================================
// BASIC FIELD HANDLERS
// ============================================================================

export function updateField(key, value) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    // Direct state mutation for now (services emit events)
    const project = getProject();
    project.slides[selectedSlideIndex].data[key] = value;

    // Emit events for UI updates
    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key, value });
    emit(EventTypes.FIELD_CHANGED, { index: selectedSlideIndex, key, value });
    emit(EventTypes.CHANGES_MARKED);
  }
}

export function changeTemplate(newTemplate) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    const oldData = project.slides[selectedSlideIndex].data;
    const defaultData = getDefaultData(newTemplate);

    project.slides[selectedSlideIndex].template = newTemplate;
    project.slides[selectedSlideIndex].data = {
      ...defaultData,
      title: oldData.title || defaultData.title
    };

    emit(EventTypes.TEMPLATE_CHANGED, { index: selectedSlideIndex, template: newTemplate });
    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex });
    emit(EventTypes.CHANGES_MARKED);

    // Re-render editor for new template fields
    if (window.renderEditor) window.renderEditor();
  }
}

// ============================================================================
// ARRAY FIELD HANDLERS
// ============================================================================

export function updateArrayItem(key, index, value) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data[key][index] = value;

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key, value });
    emit(EventTypes.CHANGES_MARKED);
  }
}

export function addArrayItem(key) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    if (!project.slides[selectedSlideIndex].data[key]) {
      project.slides[selectedSlideIndex].data[key] = [];
    }
    project.slides[selectedSlideIndex].data[key].push('Nouvel element');

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

export function removeArrayItem(key, index) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data[key].splice(index, 1);

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

// ============================================================================
// COLUMN FIELD HANDLERS
// ============================================================================

export function updateColumnField(key, field, value) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    if (!project.slides[selectedSlideIndex].data[key]) {
      project.slides[selectedSlideIndex].data[key] = { title: '', items: [] };
    }
    project.slides[selectedSlideIndex].data[key][field] = value;

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key });
    emit(EventTypes.CHANGES_MARKED);
  }
}

export function updateColumnItem(key, index, value) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data[key].items[index] = value;

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key });
    emit(EventTypes.CHANGES_MARKED);
  }
}

export function addColumnItem(key) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    if (!project.slides[selectedSlideIndex].data[key].items) {
      project.slides[selectedSlideIndex].data[key].items = [];
    }
    project.slides[selectedSlideIndex].data[key].items.push('Nouvel item');

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

export function removeColumnItem(key, index) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data[key].items.splice(index, 1);

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

// ============================================================================
// STATS FIELD HANDLERS
// ============================================================================

export function updateStatItem(index, field, value) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data.stats[index][field] = value;

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'stats' });
    emit(EventTypes.CHANGES_MARKED);
  }
}

export function addStatItem() {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    if (!project.slides[selectedSlideIndex].data.stats) {
      project.slides[selectedSlideIndex].data.stats = [];
    }
    project.slides[selectedSlideIndex].data.stats.push({ value: '0', label: 'Label', change: '' });

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'stats' });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

export function removeStatItem(index) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data.stats.splice(index, 1);

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'stats' });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

// ============================================================================
// ANNOTATION FIELD HANDLERS
// ============================================================================

export function updateAnnotationItem(index, field, value) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data.annotations[index][field] = value;

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'annotations' });
    emit(EventTypes.CHANGES_MARKED);
  }
}

export function addAnnotationItem() {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    if (!project.slides[selectedSlideIndex].data.annotations) {
      project.slides[selectedSlideIndex].data.annotations = [];
    }
    project.slides[selectedSlideIndex].data.annotations.push({ line: 1, text: 'Annotation' });

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'annotations' });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

export function removeAnnotationItem(index) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data.annotations.splice(index, 1);

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'annotations' });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

// ============================================================================
// STEP FIELD HANDLERS
// ============================================================================

export function updateStepItem(index, field, value) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data.steps[index][field] = value;

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'steps' });
    emit(EventTypes.CHANGES_MARKED);
  }
}

export function addStepItem() {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    if (!project.slides[selectedSlideIndex].data.steps) {
      project.slides[selectedSlideIndex].data.steps = [];
    }
    const num = project.slides[selectedSlideIndex].data.steps.length + 1;
    project.slides[selectedSlideIndex].data.steps.push({ icon: String(num), title: `Etape ${num}`, description: '' });

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'steps' });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

export function removeStepItem(index) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data.steps.splice(index, 1);

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'steps' });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

// ============================================================================
// ROW FIELD HANDLERS (for comparison tables)
// ============================================================================

export function updateRowCell(rowIndex, colIndex, value) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    project.slides[selectedSlideIndex].data.rows[rowIndex][colIndex] = value;

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'rows' });
    emit(EventTypes.CHANGES_MARKED);
  }
}

export function addRowItem() {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    const columns = project.slides[selectedSlideIndex].data.columns || [];
    const newRow = columns.map(() => '');
    if (!project.slides[selectedSlideIndex].data.rows) {
      project.slides[selectedSlideIndex].data.rows = [];
    }
    project.slides[selectedSlideIndex].data.rows.push(newRow);

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'rows' });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

export function removeRowItem(index) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data.rows.splice(index, 1);

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'rows' });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

// ============================================================================
// TABLE FIELD HANDLERS (for generic tables)
// ============================================================================

export function updateTableCell(rowIndex, colIndex, value) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data.rows[rowIndex][colIndex] = value;

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'rows' });
    emit(EventTypes.CHANGES_MARKED);
  }
}

export function addTableRow() {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    const columns = project.slides[selectedSlideIndex].data.columns || [];
    const newRow = columns.map(() => '');
    if (!project.slides[selectedSlideIndex].data.rows) {
      project.slides[selectedSlideIndex].data.rows = [];
    }
    project.slides[selectedSlideIndex].data.rows.push(newRow);

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'rows' });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

export function removeTableRow(index) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data.rows.splice(index, 1);

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'rows' });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

// ============================================================================
// AGENDA ITEM HANDLERS
// ============================================================================

export function updateAgendaItem(index, field, value) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    if (!project.slides[selectedSlideIndex].data.items) {
      project.slides[selectedSlideIndex].data.items = [];
    }
    if (!project.slides[selectedSlideIndex].data.items[index]) {
      project.slides[selectedSlideIndex].data.items[index] = {};
    }
    project.slides[selectedSlideIndex].data.items[index][field] = value;

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'items' });
    emit(EventTypes.CHANGES_MARKED);
  }
}

export function addAgendaItem() {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    if (!project.slides[selectedSlideIndex].data.items) {
      project.slides[selectedSlideIndex].data.items = [];
    }
    const num = project.slides[selectedSlideIndex].data.items.length + 1;
    project.slides[selectedSlideIndex].data.items.push({ title: `Point ${num}`, subtitle: '', duration: '' });

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'items' });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}

export function removeAgendaItem(index) {
  const selectedSlideIndex = getSelectedSlideIndex();
  if (selectedSlideIndex >= 0) {
    const project = getProject();
    project.slides[selectedSlideIndex].data.items.splice(index, 1);

    emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex, key: 'items' });
    emit(EventTypes.CHANGES_MARKED);

    if (window.renderEditor) window.renderEditor();
  }
}
