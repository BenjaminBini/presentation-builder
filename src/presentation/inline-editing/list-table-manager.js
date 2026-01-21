// src/inline-editing/list-table-manager.js
// List item and table row/column operations

import { getState, getSelectedSlideIndex, set, setHasUnsavedChanges } from '../../core/state.js';
import { refreshEditor, refreshPreview } from '../app/ui-refresh.js';

// ============================================================================
// LIST ITEM MANAGEMENT
// ============================================================================

/**
 * Move list item from one index to another with animation
 * @param {string} listKey - List field key (supports dot notation)
 * @param {number} fromIndex - Index of item to move
 * @param {number} toIndex - Target index
 */
export function moveListItem(listKey, fromIndex, toIndex) {
  if (fromIndex === toIndex) return;

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

  // Navigate to the parent object
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!target || target[key] === undefined) return;
    target[key] = { ...target[key] };
    target = target[key];
  }

  const lastKey = keys[keys.length - 1];
  if (!target || !Array.isArray(target[lastKey])) return;

  // Clone the array and move the item
  const newArray = [...target[lastKey]];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);

  target[lastKey] = newArray;

  // Update slide
  const slides = [...state.project.slides];
  slides[selectedSlideIndex] = { ...slide, data };
  set('project.slides', slides);

  // Update state with event emission
  setHasUnsavedChanges(true);

  // Refresh UI
  refreshEditor();
  refreshPreview();
}

/**
 * Delete list item by index with animation
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
    if (!target || target[key] === undefined) return;
    target = target[key];
  }

  if (!Array.isArray(target) || itemIndex < 0 || itemIndex >= target.length) {
    return;
  }

  // Don't delete if it's the last item
  if (target.length <= 1) {
    return;
  }

  // Find the item element and animate removal
  const listContainer = document.querySelector(`.repeatable-list[data-list-key="${listKey}"]`);
  const itemElement = listContainer?.querySelector(`.repeatable-item[data-item-index="${itemIndex}"]`);

  if (itemElement) {
    // Add removing animation class
    itemElement.classList.add('removing');

    // Wait for animation to complete, then update state
    setTimeout(() => {
      performDelete(itemIndex, data, keys, target, slide, state);
    }, 250);
  } else {
    // No element found, just delete immediately
    performDelete(itemIndex, data, keys, target, slide, state);
  }
}

/**
 * Perform the actual delete operation
 */
function performDelete(itemIndex, data, keys, target, slide, state) {
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
  const selectedSlideIndex = getSelectedSlideIndex();
  slides[selectedSlideIndex] = { ...slide, data };
  set('project.slides', slides);

  // Update state with event emission
  setHasUnsavedChanges(true);

  // Refresh preview only (editor refresh not needed for delete)
  refreshPreview();
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
  const newIndex = target.length;
  target.push(newItem);

  // Update slide
  const slides = [...state.project.slides];
  slides[selectedSlideIndex] = { ...slide, data };
  set('project.slides', slides);

  // Update state with event emission
  setHasUnsavedChanges(true);

  // Refresh UI (editor and preview)
  refreshEditor();
  refreshPreview();

  // Add animation class to newly added item
  requestAnimationFrame(() => {
    const listContainer = document.querySelector(`.repeatable-list[data-list-key="${listKey}"]`);
    if (!listContainer) return;

    const newItem = listContainer.querySelector(`.repeatable-item[data-item-index="${newIndex}"]`);
    if (newItem) {
      newItem.classList.add('item-added');
      setTimeout(() => {
        newItem.classList.remove('item-added');
      }, 300);
    }
  });
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

  // Update state with event emission
  setHasUnsavedChanges(true);

  // Refresh UI (editor and preview)
  refreshEditor();
  refreshPreview();
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

  // Update state with event emission
  setHasUnsavedChanges(true);

  // Refresh UI (editor and preview)
  refreshEditor();
  refreshPreview();
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

  // Update state with event emission
  setHasUnsavedChanges(true);

  // Refresh UI (editor and preview)
  refreshEditor();
  refreshPreview();
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

  // Update state with event emission
  setHasUnsavedChanges(true);

  // Refresh UI (editor and preview)
  refreshEditor();
  refreshPreview();
}

// ============================================================================
// LIST ITEM DRAG AND DROP
// ============================================================================

let dragState = {
  listKey: null,
  draggedIndex: null,
  dropIndex: null,
  draggedElement: null,
  dropIndicator: null
};

/**
 * Get or create drop indicator element
 */
function getDropIndicator() {
  if (!dragState.dropIndicator) {
    dragState.dropIndicator = document.createElement('li');
    dragState.dropIndicator.className = 'list-drop-indicator';
  }
  return dragState.dropIndicator;
}

/**
 * Update ghost content to match dragged item
 */
function updateGhostContent(sourceItem) {
  const indicator = getDropIndicator();
  const clone = sourceItem.cloneNode(true);
  clone.classList.remove('dragging');
  clone.classList.add('list-ghost-content');
  clone.removeAttribute('draggable');
  indicator.innerHTML = '';
  indicator.appendChild(clone);
}

/**
 * Calculate drop position based on mouse position
 */
function calculateDropTarget(event, listContainer) {
  const items = Array.from(listContainer.querySelectorAll('.repeatable-item:not(.dragging):not(.list-ghost-content)'));
  const mouseY = event.clientY;

  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;

    if (mouseY < midpoint) {
      return { element: items[i], index: parseInt(items[i].dataset.itemIndex, 10) };
    }
  }

  // Mouse is below all items - drop at end
  if (items.length > 0) {
    const lastIndex = parseInt(items[items.length - 1].dataset.itemIndex, 10);
    return { element: null, index: lastIndex + 1 };
  }

  return { element: null, index: 0 };
}

/**
 * Position drop indicator at correct location
 * Uses offsetTop to get position without CSS transforms
 */
function positionDropIndicator(targetElement, targetIndex, listContainer) {
  const indicator = getDropIndicator();

  // Ensure indicator is in the container
  if (!listContainer.contains(indicator)) {
    listContainer.appendChild(indicator);
  }

  // Calculate top position using offsetTop (ignores transforms)
  let topPosition = 0;
  const draggedItem = listContainer.querySelector('.repeatable-item.dragging');

  if (targetIndex === dragState.draggedIndex || targetIndex === dragState.draggedIndex + 1) {
    // At or near original position - position at dragged item's location
    if (draggedItem) {
      topPosition = draggedItem.offsetTop;
    }
  } else if (dragState.draggedIndex < targetIndex) {
    // Dragging DOWN - ghost appears one slot above the target
    // (because the dragged item will end up at targetIndex - 1 after removal)
    const prevIndex = targetIndex - 1;
    const prevItem = listContainer.querySelector(`.repeatable-item[data-item-index="${prevIndex}"]`);
    if (prevItem && prevItem !== draggedItem) {
      topPosition = prevItem.offsetTop;
    } else if (draggedItem) {
      // prevItem is the dragged item, use the one before that
      const beforePrevItem = listContainer.querySelector(`.repeatable-item[data-item-index="${prevIndex - 1}"]`);
      if (beforePrevItem) {
        topPosition = beforePrevItem.offsetTop + beforePrevItem.offsetHeight;
      }
    }
  } else if (targetElement) {
    // Dragging UP - ghost appears at target position
    topPosition = targetElement.offsetTop;
  } else {
    // Position at end - calculate from last item's original position + height
    const items = listContainer.querySelectorAll('.repeatable-item:not(.dragging)');
    if (items.length > 0) {
      const lastItem = items[items.length - 1];
      topPosition = lastItem.offsetTop + lastItem.offsetHeight;
    }
  }

  indicator.style.top = `${topPosition}px`;
  indicator.classList.add('visible');
}

/**
 * Handle drag start on list item
 */
export function handleListItemDragStart(event, listKey, itemIndex) {
  dragState.listKey = listKey;
  dragState.draggedIndex = itemIndex;
  dragState.dropIndex = itemIndex;
  dragState.draggedElement = event.target.closest('.repeatable-item');

  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', itemIndex.toString());

  // Hide browser's default drag ghost image
  const emptyImg = new Image();
  emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  event.dataTransfer.setDragImage(emptyImg, 0, 0);

  // Create ghost content
  updateGhostContent(dragState.draggedElement);

  // Get list container
  const listContainer = dragState.draggedElement.closest('.repeatable-list');

  // Collapse dragged item and show ghost simultaneously
  const indicator = getDropIndicator();

  // Insert ghost after the dragged item
  if (dragState.draggedElement.nextSibling) {
    listContainer.insertBefore(indicator, dragState.draggedElement.nextSibling);
  } else {
    const addRow = listContainer.querySelector('.add-item-row');
    if (addRow) {
      listContainer.insertBefore(indicator, addRow);
    } else {
      listContainer.appendChild(indicator);
    }
  }

  // Apply all changes at once
  dragState.draggedElement.classList.add('dragging');
  document.body.classList.add('is-dragging-list-item');

  // Set initial ghost position at dragged item's location (using offsetTop to ignore transforms)
  indicator.style.top = `${dragState.draggedElement.offsetTop}px`;
  indicator.classList.add('visible');
}

/**
 * Update which items should shift to make room during drag
 */
function updateShiftedItems(dropIndex, listContainer) {
  const items = Array.from(listContainer.querySelectorAll('.repeatable-item'));

  items.forEach(item => {
    const itemIndex = parseInt(item.dataset.itemIndex, 10);
    item.classList.remove('shift-down', 'shift-up');

    if (dragState.draggedIndex === null) return;

    // Items between drag source and drop target should shift
    if (dragState.draggedIndex < dropIndex) {
      // Dragging down: items between source and target shift up
      if (itemIndex > dragState.draggedIndex && itemIndex < dropIndex) {
        item.classList.add('shift-up');
      }
    } else if (dragState.draggedIndex > dropIndex) {
      // Dragging up: items between target and source shift down
      if (itemIndex >= dropIndex && itemIndex < dragState.draggedIndex) {
        item.classList.add('shift-down');
      }
    }
  });
}

/**
 * Handle drag over on list container
 */
export function handleListItemDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';

  if (dragState.draggedIndex === null) return;

  const listContainer = event.target.closest('.repeatable-list');
  if (!listContainer) return;

  const { element: targetElement, index: dropIndex } = calculateDropTarget(event, listContainer);

  if (dropIndex !== dragState.dropIndex) {
    dragState.dropIndex = dropIndex;
    positionDropIndicator(targetElement, dropIndex, listContainer);
    updateShiftedItems(dropIndex, listContainer);
  }
}

/**
 * Handle drag leave on list container
 */
export function handleListItemDragLeave(event) {
  const listContainer = event.target.closest('.repeatable-list');
  if (!listContainer) return;

  const relatedTarget = event.relatedTarget;
  if (!relatedTarget || !listContainer.contains(relatedTarget)) {
    const indicator = getDropIndicator();
    indicator.classList.remove('visible');

    // Remove shift classes when leaving
    listContainer.querySelectorAll('.repeatable-item').forEach(item => {
      item.classList.remove('shift-down', 'shift-up');
    });
  }
}

/**
 * Handle drop on list container
 */
export function handleListItemDrop(event) {
  event.preventDefault();

  if (dragState.draggedIndex === null || dragState.listKey === null) {
    cleanupListDragState();
    return;
  }

  let finalDropIndex = dragState.dropIndex;
  if (finalDropIndex === null) {
    const listContainer = event.target.closest('.repeatable-list');
    if (listContainer) {
      const { index } = calculateDropTarget(event, listContainer);
      finalDropIndex = index;
    }
  }

  // Adjust index for move operation
  if (dragState.draggedIndex !== null && finalDropIndex !== null) {
    let adjustedIndex = finalDropIndex;
    if (finalDropIndex > dragState.draggedIndex) {
      adjustedIndex = finalDropIndex - 1;
    }

    if (dragState.draggedIndex !== adjustedIndex) {
      moveListItem(dragState.listKey, dragState.draggedIndex, adjustedIndex);
    }
  }

  cleanupListDragState();
}

/**
 * Handle drag end on list item
 */
export function handleListItemDragEnd(_event) {
  if (dragState.draggedElement) {
    dragState.draggedElement.classList.remove('dragging');
  }
  cleanupListDragState();
}

/**
 * Clean up drag state
 */
function cleanupListDragState() {
  const indicator = getDropIndicator();
  indicator.classList.remove('visible');
  if (indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
  }

  // Remove all drag-related classes
  document.querySelectorAll('.repeatable-item').forEach(item => {
    item.classList.remove('dragging', 'shift-down', 'shift-up');
  });

  document.body.classList.remove('is-dragging-list-item');

  dragState.listKey = null;
  dragState.draggedIndex = null;
  dragState.dropIndex = null;
  dragState.draggedElement = null;
}

// Expose drag handlers to window for HTML attributes
window.handleListItemDragStart = handleListItemDragStart;
window.handleListItemDragOver = handleListItemDragOver;
window.handleListItemDragLeave = handleListItemDragLeave;
window.handleListItemDrop = handleListItemDrop;
window.handleListItemDragEnd = handleListItemDragEnd;
