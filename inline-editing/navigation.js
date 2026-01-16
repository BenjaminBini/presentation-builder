// inline-editing/navigation.js
// Tab focus management and editable element traversal
// Extends InlineEditor object from core.js

// ============================================================================
// TAB NAVIGATION
// ============================================================================

InlineEditor.getEditableElements = function() {
    const preview = document.getElementById('previewSlide');
    if (!preview) return [];
    return Array.from(preview.querySelectorAll('[data-editable]'));
};

InlineEditor.focusNextEditable = function() {
    const elements = this.getEditableElements();
    if (elements.length === 0) return;

    const currentIndex = elements.indexOf(this.currentEditingElement);
    const nextIndex = currentIndex + 1;

    if (nextIndex < elements.length) {
        this.startTextEdit(elements[nextIndex]);
    }
};

InlineEditor.focusPreviousEditable = function() {
    const elements = this.getEditableElements();
    if (elements.length === 0) return;

    const currentIndex = elements.indexOf(this.currentEditingElement);
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
        this.startTextEdit(elements[prevIndex]);
    }
};
