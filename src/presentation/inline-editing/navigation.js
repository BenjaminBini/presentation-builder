// src/inline-editing/navigation.js
// Tab focus management and editable element traversal
// Converted to ES6 module

/**
 * Get all editable elements in the preview slide
 * @returns {HTMLElement[]} Array of editable elements
 */
export function getEditableElements() {
  const preview = document.getElementById('previewSlide');
  if (!preview) return [];
  return Array.from(preview.querySelectorAll('[data-editable]'));
}

/**
 * Focus the next editable element after current
 */
export function focusNextEditable() {
  const elements = getEditableElements();
  if (elements.length === 0) return;

  const currentIndex = elements.indexOf(this.currentEditingElement);
  const nextIndex = currentIndex + 1;

  if (nextIndex < elements.length) {
    this.startTextEdit(elements[nextIndex]);
  }
}

/**
 * Focus the previous editable element before current
 */
export function focusPreviousEditable() {
  const elements = getEditableElements();
  if (elements.length === 0) return;

  const currentIndex = elements.indexOf(this.currentEditingElement);
  const prevIndex = currentIndex - 1;

  if (prevIndex >= 0) {
    this.startTextEdit(elements[prevIndex]);
  }
}
