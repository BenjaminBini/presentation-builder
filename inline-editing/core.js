// inline-editing/core.js
// Core InlineEditor object creation, initialization, and main dispatch logic
// Dependencies: slide-editor-app.js (currentProject, selectedSlideIndex, renderEditor, updatePreview, renderSlideList)

// ============================================================================
// INLINE EDITOR CORE MODULE
// ============================================================================

const InlineEditor = {
    // State
    currentEditingElement: null,
    originalValue: null,
    editingFieldKey: null,
    editingFieldIndex: null,
    editingSubkey: null,
    isEditing: false,
    isNavigatingToNextEditable: false,

    // Annotation selection state
    isSelectingAnnotation: false,
    annotationSelectionStart: null,
    annotationSelectionEnd: null,
    justFinishedDragAnnotation: false,

    // Bound event handlers (for cleanup)
    _boundHandleKeydown: null,
    _boundHandlePaste: null,
    _boundHandleDocumentClick: null,
    _boundHandleBlur: null,

    // Image picker state
    imagePickerFieldKey: null,
    imagePickerFieldIndex: null,
    selectedImageData: null,

    // Code editor state
    codeEditorFieldKey: null,
    codeEditorFieldIndex: null,
    codeEditorIsAnnotated: false,

    // Draw.io editor state
    drawioEditorFieldKey: null,
    drawioEditorFieldIndex: null,

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

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

        // Initialize image drop zone
        initImageDropZone();

        console.log('InlineEditor initialized');
    },

    // ========================================================================
    // CLICK HANDLING AND DISPATCH
    // ========================================================================

    handlePreviewClick(event) {
        // Check for annotation control buttons first
        const deleteBtn = event.target.closest('.delete-annotation-btn');
        if (deleteBtn) {
            event.preventDefault();
            event.stopPropagation();
            const annotationIndex = parseInt(deleteBtn.dataset.annotationIndex);
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
            const lineNum = parseInt(addBtn.dataset.line);
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
            const itemIndex = parseInt(deleteItemBtn.dataset.itemIndex);
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
            const colIndex = parseInt(deleteColBtn.dataset.colIndex);
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
            const rowIndex = parseInt(deleteRowBtn.dataset.rowIndex);
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
};

// ============================================================================
// INITIALIZATION ON DOM READY
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize after a small delay to ensure other modules are loaded
    setTimeout(() => {
        InlineEditor.init();
    }, 100);
});
