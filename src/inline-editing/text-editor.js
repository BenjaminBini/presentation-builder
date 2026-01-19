// src/inline-editing/text-editor.js
// Text editing functionality: start/end text edit and event handlers
// Extends InlineEditor class with text editing methods

import { emit, EventTypes } from '../core/events.js';
import { getProject, getSelectedSlideIndex, markAsChanged } from '../core/state.js';
import { updateSlideData } from './data-updates.js';

/**
 * Text editing mixin for InlineEditor
 * Contains methods for contenteditable text editing
 */

/**
 * Start inline text editing on an element
 * @param {HTMLElement} element - Element to make editable
 */
export function startTextEdit(element) {
  // End any current edit first
  if (this.currentEditingElement) {
    this.endTextEdit(true);
  }

  this.isEditing = true;
  this.currentEditingElement = element;
  this.originalValue = element.textContent;
  this.editingFieldKey = element.dataset.fieldKey;
  this.editingFieldIndex = element.dataset.fieldIndex !== undefined
    ? parseInt(element.dataset.fieldIndex)
    : null;
  this.editingSubkey = element.dataset.fieldSubkey || null;

  // Make element editable
  element.setAttribute('contenteditable', 'true');
  element.classList.add('inline-editing');
  element.focus();

  // Select all text
  const range = document.createRange();
  range.selectNodeContents(element);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  // Bind event handlers
  this._boundHandleKeydown = this.handleKeydown.bind(this);
  this._boundHandlePaste = this.handlePaste.bind(this);
  this._boundHandleBlur = this.handleBlur.bind(this);

  element.addEventListener('keydown', this._boundHandleKeydown);
  element.addEventListener('paste', this._boundHandlePaste);
  element.addEventListener('blur', this._boundHandleBlur);

  // Add document click listener (delayed to prevent immediate trigger)
  this._boundHandleDocumentClick = this.handleDocumentClick.bind(this);
  setTimeout(() => {
    document.addEventListener('mousedown', this._boundHandleDocumentClick);
  }, 0);

  // Emit event
  emit(EventTypes.INLINE_EDIT_STARTED, {
    element,
    fieldKey: this.editingFieldKey,
    fieldIndex: this.editingFieldIndex,
    fieldSubkey: this.editingSubkey
  });
}

/**
 * End inline text editing
 * @param {boolean} save - Whether to save changes or cancel
 */
export function endTextEdit(save = true) {
  if (!this.currentEditingElement) return;

  const element = this.currentEditingElement;
  const newValue = element.textContent.trim();

  // Remove contenteditable
  element.removeAttribute('contenteditable');
  element.classList.remove('inline-editing');

  // Remove event listeners
  if (this._boundHandleKeydown) {
    element.removeEventListener('keydown', this._boundHandleKeydown);
  }
  if (this._boundHandlePaste) {
    element.removeEventListener('paste', this._boundHandlePaste);
  }
  if (this._boundHandleBlur) {
    element.removeEventListener('blur', this._boundHandleBlur);
  }
  if (this._boundHandleDocumentClick) {
    document.removeEventListener('mousedown', this._boundHandleDocumentClick);
  }

  if (save && newValue !== this.originalValue) {
    // Update slide data
    updateSlideData(
      this.editingFieldKey,
      newValue,
      this.editingFieldIndex,
      this.editingSubkey
    );
  } else if (!save && newValue !== this.originalValue) {
    // Restore original value
    element.textContent = this.originalValue;
  }

  // Store field key before resetting
  const fieldKey = this.editingFieldKey;
  const fieldIndex = this.editingFieldIndex;
  const fieldSubkey = this.editingSubkey;

  // Reset state
  this.currentEditingElement = null;
  this.originalValue = null;
  this.editingFieldKey = null;
  this.editingFieldIndex = null;
  this.editingSubkey = null;
  this.isEditing = false;
  this._boundHandleKeydown = null;
  this._boundHandlePaste = null;
  this._boundHandleBlur = null;
  this._boundHandleDocumentClick = null;

  // Emit event - UI updates happen via subscriptions to SLIDE_DATA_CHANGED and FIELD_CHANGED
  emit(EventTypes.INLINE_EDIT_ENDED, {
    element,
    saved: save,
    fieldKey,
    fieldIndex,
    fieldSubkey
  });
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle keydown events during text editing
 * @param {KeyboardEvent} event
 */
export function handleKeydown(event) {
  switch (event.key) {
    case 'Enter':
      // For single-line fields, save and exit
      // For multiline, allow newline with Shift+Enter
      if (!event.shiftKey && this.currentEditingElement.dataset.editable !== 'multiline') {
        event.preventDefault();
        this.endTextEdit(true);
      }
      break;
    case 'Escape':
      event.preventDefault();
      this.endTextEdit(false); // Cancel edit
      break;
    case 'Tab':
      event.preventDefault();
      // Check if this is a bullet list item that supports indentation
      const element = this.currentEditingElement;
      const isBulletItem = element.closest('.template-bullets') &&
                           element.dataset.fieldKey === 'items' &&
                           element.dataset.fieldIndex !== undefined;

      if (isBulletItem) {
        // Change indentation level
        this.changeItemIndentation(element, event.shiftKey ? -1 : 1);
      } else {
        // Default tab behavior: navigate to next/previous editable
        this.isNavigatingToNextEditable = true;
        this.endTextEdit(true);
        if (event.shiftKey) {
          this.focusPreviousEditable();
        } else {
          this.focusNextEditable();
        }
        this.isNavigatingToNextEditable = false;
      }
      break;
  }
}

/**
 * Change indentation level of a bullet list item
 * @param {HTMLElement} element - The list item element
 * @param {number} delta - Change amount (-1 or +1)
 */
export function changeItemIndentation(element, delta) {
  const index = parseInt(element.dataset.fieldIndex, 10);
  const currentLevel = parseInt(element.dataset.itemLevel || '0', 10);
  const newLevel = Math.max(0, Math.min(3, currentLevel + delta)); // 0-3 (4 levels)

  if (newLevel === currentLevel) return;

  // Get current slide data from centralized state
  const project = getProject();
  const selectedSlideIndex = getSelectedSlideIndex();

  if (!project || !project.slides[selectedSlideIndex]) {
    return;
  }

  const slide = project.slides[selectedSlideIndex];
  if (!slide || !slide.data.items) return;

  // Get the current item
  let item = slide.data.items[index];

  // Convert string item to object if needed
  if (typeof item === 'string') {
    item = { text: item, level: newLevel };
  } else {
    item = { ...item, level: newLevel };
  }

  // Update the slide data
  slide.data.items[index] = item;

  // Update the element attributes
  element.dataset.itemLevel = newLevel;
  if (newLevel > 0) {
    element.dataset.level = newLevel;
    element.setAttribute('data-level', newLevel);
  } else {
    delete element.dataset.level;
    element.removeAttribute('data-level');
  }

  // Mark as changed using centralized state
  markAsChanged();

  // Keep focus on the element
  element.focus();
}

/**
 * Handle paste events to insert plain text only
 * @param {ClipboardEvent} event
 */
export function handlePaste(event) {
  event.preventDefault();

  // Get plain text from clipboard
  const text = (event.clipboardData || window.clipboardData).getData('text/plain');

  // For single-line fields, remove newlines
  const fieldType = this.currentEditingElement.dataset.editable;
  const cleanText = fieldType === 'multiline' ? text : text.replace(/[\r\n]+/g, ' ');

  // Insert at cursor position
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();
  const textNode = document.createTextNode(cleanText);
  range.insertNode(textNode);

  // Move cursor to end of pasted text
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Handle document clicks to end editing when clicking outside
 * @param {MouseEvent} event
 */
export function handleDocumentClick(event) {
  if (!this.currentEditingElement) return;

  // Check if click is inside the editing element
  if (this.currentEditingElement.contains(event.target)) {
    return;
  }

  // Check if click is on image picker modal
  if (event.target.closest('#imagePickerModal')) {
    return;
  }

  // End edit with save
  this.endTextEdit(true);
}

/**
 * Handle blur event on editing element
 */
export function handleBlur() {
  // Small delay to allow Tab navigation to work
  setTimeout(() => {
    if (this.currentEditingElement && !this.isNavigatingToNextEditable) {
      this.endTextEdit(true);
    }
  }, 100);
}

