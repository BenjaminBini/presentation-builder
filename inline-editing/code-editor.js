// inline-editing/code-editor.js
// Code editing modal and handlers
// Extends InlineEditor object from core.js

// ============================================================================
// CODE EDITOR MODAL
// ============================================================================

InlineEditor.openCodeEditor = function(fieldKey, fieldIndex, isAnnotated = false) {
    this.codeEditorFieldKey = fieldKey;
    this.codeEditorFieldIndex = fieldIndex !== undefined ? parseInt(fieldIndex) : null;
    this.codeEditorIsAnnotated = isAnnotated;

    // Check if this is a mermaid diagram (simple mode, no options)
    const isMermaid = fieldKey === 'diagram';

    // Get current code value
    const currentValue = this.getFieldValue(fieldKey, this.codeEditorFieldIndex, null);

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
            if (selectedSlideIndex >= 0) {
                const slideData = currentProject.slides[selectedSlideIndex].data;
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
                    // Support legacy notEndOfFile for backwards compatibility
                    showEllipsisAfterCheckbox.checked = slideData.showEllipsisAfter || slideData.notEndOfFile || false;
                }
            } else {
                if (showLineNumbersCheckbox) showLineNumbersCheckbox.checked = false;
                if (startLineInput) startLineInput.value = 1;
                if (showEllipsisBeforeCheckbox) showEllipsisBeforeCheckbox.checked = false;
                if (showEllipsisAfterCheckbox) showEllipsisAfterCheckbox.checked = false;
            }

            // Update line numbers and ellipsis display
            updateCodeEditorLineNumbers();
            updateCodeEditorEllipsis();
        }

        modal.classList.add('active');
        // Focus and move cursor to end
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
};

InlineEditor.closeCodeEditor = function() {
    const modal = document.getElementById('codeEditorModal');
    if (modal) {
        modal.classList.remove('active');
    }
    this.codeEditorFieldKey = null;
    this.codeEditorFieldIndex = null;
    this.codeEditorIsAnnotated = false;
};

InlineEditor.confirmCodeEdit = function() {
    const textarea = document.getElementById('codeEditorInput');
    if (textarea && this.codeEditorFieldKey) {
        const newValue = textarea.value;
        const isMermaid = this.codeEditorFieldKey === 'diagram';
        this.updateSlideData(this.codeEditorFieldKey, newValue, this.codeEditorFieldIndex, null);

        // Save code options (only for code templates, not mermaid)
        if (!isMermaid && selectedSlideIndex >= 0) {
            const showLineNumbersCheckbox = document.getElementById('codeShowLineNumbers');
            const startLineInput = document.getElementById('codeStartLine');
            const showEllipsisBeforeCheckbox = document.getElementById('codeShowEllipsisBefore');
            const showEllipsisAfterCheckbox = document.getElementById('codeShowEllipsisAfter');

            const slideData = currentProject.slides[selectedSlideIndex].data;

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
                // Remove legacy property
                delete slideData.notEndOfFile;
            }

            renderEditor();
        }

        updatePreview();
        showToast('Code enregistré');
    }
    this.closeCodeEditor();
};
