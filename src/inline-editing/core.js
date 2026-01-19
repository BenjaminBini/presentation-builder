// src/inline-editing/core.js
// Core InlineEditor class - main dispatch logic and initialization
// Converted from legacy InlineEditor object to ES6 module

import { getState, getSelectedSlideIndex, getSelectedSlide } from '../core/state.js';
import { emit, EventTypes } from '../core/events.js';

/**
 * InlineEditor - Manages inline editing functionality for slide content
 * Handles click dispatch, text editing, image picking, code editing, etc.
 */
class InlineEditor {
  constructor() {
    // State
    this.currentEditingElement = null;
    this.originalValue = null;
    this.editingFieldKey = null;
    this.editingFieldIndex = null;
    this.editingSubkey = null;
    this.isEditing = false;
    this.isNavigatingToNextEditable = false;

    // Annotation selection state
    this.isSelectingAnnotation = false;
    this.annotationSelectionStart = null;
    this.annotationSelectionEnd = null;
    this.justFinishedDragAnnotation = false;

    // Bound event handlers (for cleanup)
    this._boundHandleKeydown = null;
    this._boundHandlePaste = null;
    this._boundHandleDocumentClick = null;
    this._boundHandleBlur = null;

    // Image picker state
    this.imagePickerFieldKey = null;
    this.imagePickerFieldIndex = null;
    this.selectedImageData = null;

    // Code editor state
    this.codeEditorFieldKey = null;
    this.codeEditorFieldIndex = null;
    this.codeEditorIsAnnotated = false;

    // Draw.io editor state
    this.drawioEditorFieldKey = null;
    this.drawioEditorFieldIndex = null;
  }

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  /**
   * Initialize inline editor with event listeners
   */
  init() {
    const previewContainer = document.getElementById('previewSlide');
    if (!previewContainer) {
      console.warn('InlineEditor: Preview container not found');
      return;
    }

    // Add click listener for inline editing
    previewContainer.addEventListener('click', (event) => {
      this.handlePreviewClick(event);
    });

    // Add mousedown/mousemove/mouseup for annotation drag selection
    previewContainer.addEventListener('mousedown', (event) => {
      this.handleAnnotationMouseDown(event);
    });

    previewContainer.addEventListener('mousemove', (event) => {
      this.handleAnnotationMouseMove(event);
    });

    previewContainer.addEventListener('mouseup', () => {
      this.handleAnnotationMouseUp();
    });

    // Cancel selection if mouse leaves the preview
    previewContainer.addEventListener('mouseleave', () => {
      if (this.isSelectingAnnotation) {
        this.cancelAnnotationSelection();
      }
    });

    // Initialize image drop zone (if available globally)
    if (typeof window.initImageDropZone === 'function') {
      window.initImageDropZone();
    }

    console.log('InlineEditor initialized');
  }

  // ========================================================================
  // CLICK HANDLING AND DISPATCH
  // ========================================================================

  /**
   * Handle click events on preview slide elements
   * Dispatches to appropriate editor based on data-editable type
   * @param {MouseEvent} event
   */
  handlePreviewClick(event) {
    // Check for annotation control buttons first
    const deleteBtn = event.target.closest('.delete-annotation-btn');
    if (deleteBtn) {
      event.preventDefault();
      event.stopPropagation();
      const annotationIndex = parseInt(deleteBtn.dataset.annotationIndex, 10);
      if (isNaN(annotationIndex)) return;
      this.deleteAnnotation(annotationIndex);
      return;
    }

    const addBtn = event.target.closest('.add-annotation-btn');
    if (addBtn) {
      event.preventDefault();
      event.stopPropagation();
      // Skip if we just finished a drag selection
      if (this.justFinishedDragAnnotation) {
        this.justFinishedDragAnnotation = false;
        return;
      }
      const lineNum = parseInt(addBtn.dataset.line, 10);
      if (isNaN(lineNum)) return;
      this.addAnnotation(lineNum, lineNum);
      return;
    }

    // Check for list item controls
    const deleteItemBtn = event.target.closest('.delete-item-btn');
    if (deleteItemBtn) {
      event.preventDefault();
      event.stopPropagation();
      // Save any pending inline edit before deleting
      if (this.currentEditingElement) {
        this.endTextEdit(true);
      }
      const listKey = deleteItemBtn.dataset.listKey;
      const itemIndex = parseInt(deleteItemBtn.dataset.itemIndex, 10);
      if (isNaN(itemIndex)) return;
      this.deleteListItem(listKey, itemIndex);
      return;
    }

    const addItemBtn = event.target.closest('.add-item-btn');
    if (addItemBtn) {
      event.preventDefault();
      event.stopPropagation();
      // Save any pending inline edit before adding
      if (this.currentEditingElement) {
        this.endTextEdit(true);
      }
      const listKey = addItemBtn.dataset.listKey;
      const listType = addItemBtn.dataset.listType || 'string';
      this.addListItem(listKey, listType);
      return;
    }

    // Table controls (comparison template)
    const addColBtn = event.target.closest('.table-add-col-btn');
    if (addColBtn) {
      event.preventDefault();
      event.stopPropagation();
      if (this.currentEditingElement) this.endTextEdit(true);
      this.addTableColumn();
      return;
    }

    const deleteColBtn = event.target.closest('.table-delete-col-btn');
    if (deleteColBtn) {
      event.preventDefault();
      event.stopPropagation();
      if (this.currentEditingElement) this.endTextEdit(true);
      const colIndex = parseInt(deleteColBtn.dataset.colIndex, 10);
      if (isNaN(colIndex)) return;
      this.deleteTableColumn(colIndex);
      return;
    }

    const addRowBtn = event.target.closest('.table-add-row-btn');
    if (addRowBtn) {
      event.preventDefault();
      event.stopPropagation();
      if (this.currentEditingElement) this.endTextEdit(true);
      this.addTableRow();
      return;
    }

    const deleteRowBtn = event.target.closest('.table-delete-row-btn');
    if (deleteRowBtn) {
      event.preventDefault();
      event.stopPropagation();
      if (this.currentEditingElement) this.endTextEdit(true);
      const rowIndex = parseInt(deleteRowBtn.dataset.rowIndex, 10);
      if (isNaN(rowIndex)) return;
      this.deleteTableRow(rowIndex);
      return;
    }

    // closest() finds the nearest ancestor (including self) with data-editable
    // This naturally prioritizes the innermost editable element when nested
    const editableElement = event.target.closest('[data-editable]');

    if (!editableElement) {
      // Clicked outside editable element - end any current edit
      if (this.currentEditingElement) {
        this.endTextEdit(true);
      }
      return;
    }

    const editType = editableElement.dataset.editable;
    const fieldKey = editableElement.dataset.fieldKey;
    const fieldIndex = editableElement.dataset.fieldIndex;

    if (editType === 'image') {
      event.preventDefault();
      this.openImagePicker(fieldKey, fieldIndex);
    } else if (editType === 'code') {
      event.preventDefault();
      const isAnnotated = editableElement.dataset.codeAnnotated === 'true';
      this.openCodeEditor(fieldKey, fieldIndex, isAnnotated);
    } else if (editType === 'drawio') {
      event.preventDefault();
      this.openDrawioEditor(fieldKey, fieldIndex);
    } else if (editType === 'text' || editType === 'multiline') {
      // Don't restart edit if clicking same element
      if (this.currentEditingElement === editableElement) {
        return;
      }
      this.startTextEdit(editableElement);
    }
  }

}

// Create singleton instance
const inlineEditor = new InlineEditor();

// Export instance and class
export { inlineEditor, InlineEditor };

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize after a small delay to ensure other modules are loaded
  setTimeout(() => {
    inlineEditor.init();
  }, 100);
});
