// src/inline-editing/code-editor.js
// Code editing modal and handlers
// Converted to ES6 module - uses event-driven architecture

import { updateSlideData, getFieldValue } from './data-updates.js';
import { getState, getSelectedSlideIndex } from '../../core/state.js';
import { refreshEditor } from '../app/ui-refresh.js';

/**
 * Open code editor modal
 * @param {string} fieldKey - Field key to update
 * @param {number|null} fieldIndex - Array index if applicable
 * @param {boolean} isAnnotated - Whether code has annotations
 */
export function openCodeEditor(fieldKey, fieldIndex, isAnnotated = false) {
  this.codeEditorFieldKey = fieldKey;
  this.codeEditorFieldIndex = fieldIndex !== undefined ? parseInt(fieldIndex) : null;
  this.codeEditorIsAnnotated = isAnnotated;

  // Check if this is a mermaid diagram (simple mode, no options)
  const isMermaid = fieldKey === 'diagram';

  // Get current code value
  const currentValue = getFieldValue(fieldKey, this.codeEditorFieldIndex, null);

  const modal = document.getElementById('codeEditorModal');
  const textarea = document.getElementById('codeEditorInput');
  const optionsPanel = document.getElementById('codeEditorOptions');
  const lineNumbers = document.getElementById('codeEditorLineNumbers');
  const showLineNumbersCheckbox = document.getElementById('codeShowLineNumbers');
  const startLineInput = document.getElementById('codeStartLine');
  const showEllipsisBeforeCheckbox = document.getElementById('codeShowEllipsisBefore');
  const showEllipsisAfterCheckbox = document.getElementById('codeShowEllipsisAfter');
  const ellipsisBefore = document.getElementById('codeEllipsisBefore');
  const ellipsisAfter = document.getElementById('codeEllipsisAfter');

  if (modal && textarea) {
    textarea.value = currentValue || '';

    if (isMermaid) {
      // Mermaid: hide all options and line numbers
      if (optionsPanel) optionsPanel.style.display = 'none';
      if (lineNumbers) lineNumbers.style.display = 'none';
      if (ellipsisBefore) ellipsisBefore.classList.remove('visible');
      if (ellipsisAfter) ellipsisAfter.classList.remove('visible');
    } else {
      // Code: show options panel and load settings
      if (optionsPanel) optionsPanel.style.display = 'flex';

      // Load code options from slide data
      const selectedSlideIndex = getSelectedSlideIndex();
      if (selectedSlideIndex >= 0) {
        const state = getState();
        const slideData = state.project.slides[selectedSlideIndex].data;
        if (showLineNumbersCheckbox) {
          showLineNumbersCheckbox.checked = slideData.showLineNumbers || false;
        }
        if (startLineInput) {
          startLineInput.value = slideData.startLine || 1;
        }
        if (showEllipsisBeforeCheckbox) {
          showEllipsisBeforeCheckbox.checked = slideData.showEllipsisBefore || false;
        }
        if (showEllipsisAfterCheckbox) {
          showEllipsisAfterCheckbox.checked = slideData.showEllipsisAfter || false;
        }
      } else {
        if (showLineNumbersCheckbox) showLineNumbersCheckbox.checked = false;
        if (startLineInput) startLineInput.value = 1;
        if (showEllipsisBeforeCheckbox) showEllipsisBeforeCheckbox.checked = false;
        if (showEllipsisAfterCheckbox) showEllipsisAfterCheckbox.checked = false;
      }

      // Update line numbers and ellipsis display
      if (typeof window.updateCodeEditorLineNumbers === 'function') {
        window.updateCodeEditorLineNumbers();
      }
      if (typeof window.updateCodeEditorEllipsis === 'function') {
        window.updateCodeEditorEllipsis();
      }
    }

    modal.classList.add('active');
    // Focus and move cursor to end
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }
}

/**
 * Close code editor modal
 */
export function closeCodeEditor() {
  const modal = document.getElementById('codeEditorModal');
  if (modal) {
    modal.classList.remove('active');
  }
  this.codeEditorFieldKey = null;
  this.codeEditorFieldIndex = null;
  this.codeEditorIsAnnotated = false;
}

/**
 * Confirm code edit and save changes
 */
export function confirmCodeEdit() {
  const textarea = document.getElementById('codeEditorInput');
  if (textarea && this.codeEditorFieldKey) {
    const newValue = textarea.value;
    const isMermaid = this.codeEditorFieldKey === 'diagram';
    updateSlideData(this.codeEditorFieldKey, newValue, this.codeEditorFieldIndex, null);

    // Save code options (only for code templates, not mermaid)
    if (!isMermaid) {
      const selectedSlideIndex = getSelectedSlideIndex();
      if (selectedSlideIndex >= 0) {
        const showLineNumbersCheckbox = document.getElementById('codeShowLineNumbers');
        const startLineInput = document.getElementById('codeStartLine');
        const showEllipsisBeforeCheckbox = document.getElementById('codeShowEllipsisBefore');
        const showEllipsisAfterCheckbox = document.getElementById('codeShowEllipsisAfter');

        const state = getState();
        const slideData = state.project.slides[selectedSlideIndex].data;

        if (showLineNumbersCheckbox) {
          slideData.showLineNumbers = showLineNumbersCheckbox.checked;
        }
        if (startLineInput) {
          slideData.startLine = parseInt(startLineInput.value) || 1;
        }
        if (showEllipsisBeforeCheckbox) {
          slideData.showEllipsisBefore = showEllipsisBeforeCheckbox.checked;
        }
        if (showEllipsisAfterCheckbox) {
          slideData.showEllipsisAfter = showEllipsisAfterCheckbox.checked;
        }

        // Refresh editor panel (refresh required for immediate UI update)
        refreshEditor();
      }
    }

    // Preview updates via SLIDE_DATA_CHANGED event emitted by updateSlideData()
  }
  closeCodeEditor.call(this);
}
