// slide-editor-inline.js
// Inline editing functionality for slide preview
// Dependencies: slide-editor-app.js (currentProject, selectedSlideIndex, renderEditor, updatePreview, renderSlideList)

// ============================================================================
// INLINE EDITOR MODULE
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
    // CLICK HANDLING
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
    },

    // ========================================================================
    // TEXT EDITING
    // ========================================================================

    startTextEdit(element) {
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
    },

    endTextEdit(save = true) {
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
            this.updateSlideData(
                this.editingFieldKey,
                newValue,
                this.editingFieldIndex,
                this.editingSubkey
            );
            showToast('Modification enregistrée');
        } else if (!save && newValue !== this.originalValue) {
            // Restore original value
            element.textContent = this.originalValue;
            showToast('Modification annulée');
        }

        // Store field key before resetting (needed for slide list update check)
        const wasEditingTitle = this.editingFieldKey === 'title' || this.editingFieldKey === 'quote';

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

        // Now trigger preview update since editing is complete
        if (save) {
            updatePreview();
            if (wasEditingTitle) {
                renderSlideList();
            }
        }
    },

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    handleKeydown(event) {
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
    },

    changeItemIndentation(element, delta) {
        const index = parseInt(element.dataset.fieldIndex, 10);
        const currentLevel = parseInt(element.dataset.itemLevel || '0', 10);
        const newLevel = Math.max(0, Math.min(3, currentLevel + delta)); // 0-3 (4 levels)

        if (newLevel === currentLevel) return;

        // Get current slide data
        const slide = currentProject.slides[selectedSlideIndex];
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

        markAsChanged();

        // Keep focus on the element
        element.focus();
    },

    handlePaste(event) {
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
    },

    handleDocumentClick(event) {
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
    },

    handleBlur() {
        // Small delay to allow Tab navigation to work
        setTimeout(() => {
            if (this.currentEditingElement && !this.isNavigatingToNextEditable) {
                this.endTextEdit(true);
            }
        }, 100);
    },

    // ========================================================================
    // TAB NAVIGATION
    // ========================================================================

    getEditableElements() {
        const preview = document.getElementById('previewSlide');
        if (!preview) return [];
        return Array.from(preview.querySelectorAll('[data-editable]'));
    },

    focusNextEditable() {
        const elements = this.getEditableElements();
        if (elements.length === 0) return;

        const currentIndex = elements.indexOf(this.currentEditingElement);
        const nextIndex = currentIndex + 1;

        if (nextIndex < elements.length) {
            this.startTextEdit(elements[nextIndex]);
        }
    },

    focusPreviousEditable() {
        const elements = this.getEditableElements();
        if (elements.length === 0) return;

        const currentIndex = elements.indexOf(this.currentEditingElement);
        const prevIndex = currentIndex - 1;

        if (prevIndex >= 0) {
            this.startTextEdit(elements[prevIndex]);
        }
    },

    // ========================================================================
    // DATA UPDATES
    // ========================================================================

    updateSlideData(key, value, index, subkey) {
        if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) {
            return;
        }

        const slide = currentProject.slides[selectedSlideIndex];
        const data = slide.data;

        // Handle nested keys like 'left.items'
        const keys = key.split('.');
        let target = data;

        // Navigate to parent of final key
        for (let i = 0; i < keys.length - 1; i++) {
            if (target[keys[i]] === undefined) {
                target[keys[i]] = {};
            }
            target = target[keys[i]];
        }

        const finalKey = keys[keys.length - 1];

        // Update the value
        if (index !== null && index !== undefined && subkey) {
            // Nested array object: stats[0].value
            if (!target[finalKey]) target[finalKey] = [];
            if (!target[finalKey][index]) target[finalKey][index] = {};
            target[finalKey][index][subkey] = value;
        } else if (index !== null && index !== undefined) {
            // Simple array: items[0]
            if (!target[finalKey]) target[finalKey] = [];
            // Preserve object structure for bullet items with levels
            const existingItem = target[finalKey][index];
            if (typeof existingItem === 'object' && existingItem !== null && 'level' in existingItem) {
                target[finalKey][index] = { ...existingItem, text: value };
            } else {
                target[finalKey][index] = value;
            }
        } else {
            // Direct field: title
            target[finalKey] = value;
        }

        // Mark as changed for save button
        markAsChanged();

        // Sync UI
        renderEditor();

        // Update slide list if title changed
        if (key === 'title' || key === 'quote') {
            renderSlideList();
        }

        // Note: We don't call updatePreview() here to avoid re-rendering during editing
        // The preview will update when the edit ends
    },

    getFieldValue(key, index, subkey) {
        if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) {
            return null;
        }

        const data = currentProject.slides[selectedSlideIndex].data;
        const keys = key.split('.');
        let target = data;

        for (const k of keys) {
            if (target === undefined || target === null) return null;
            target = target[k];
        }

        if (index !== null && index !== undefined && subkey) {
            return target?.[index]?.[subkey] ?? null;
        } else if (index !== null && index !== undefined) {
            const item = target?.[index];
            // If item is object with text property (bullet items with levels), return the text
            if (typeof item === 'object' && item !== null && 'text' in item) {
                return item.text ?? null;
            }
            return item ?? null;
        }
        return target ?? null;
    },

    // ========================================================================
    // IMAGE PICKER (placeholder for Task 6)
    // ========================================================================

    imagePickerFieldKey: null,
    imagePickerFieldIndex: null,
    selectedImageData: null,

    openImagePicker(fieldKey, fieldIndex) {
        this.imagePickerFieldKey = fieldKey;
        this.imagePickerFieldIndex = fieldIndex !== undefined ? parseInt(fieldIndex) : null;
        this.selectedImageData = null;

        // Get current image value
        const currentValue = this.getFieldValue(fieldKey, this.imagePickerFieldIndex, null);

        const modal = document.getElementById('imagePickerModal');
        if (modal) {
            // Reset modal state
            const urlInput = document.getElementById('imageUrlInput');
            const previewContainer = document.getElementById('imagePreviewContainer');
            const sizeWarning = document.getElementById('imageSizeWarning');

            if (urlInput) {
                urlInput.value = currentValue || '';
            }
            if (sizeWarning) {
                sizeWarning.style.display = 'none';
            }

            // Show preview if there's a current value
            if (currentValue) {
                this.selectedImageData = currentValue;
                this.showImagePreview(currentValue);
            } else if (previewContainer) {
                previewContainer.style.display = 'none';
            }

            // Reset to URL tab
            switchImagePickerTab('url');

            modal.classList.add('active');
        }
    },

    closeImagePicker() {
        const modal = document.getElementById('imagePickerModal');
        if (modal) {
            modal.classList.remove('active');
        }

        // Reset state
        this.imagePickerFieldKey = null;
        this.imagePickerFieldIndex = null;
        this.selectedImageData = null;

        // Reset UI
        const urlInput = document.getElementById('imageUrlInput');
        const previewContainer = document.getElementById('imagePreviewContainer');
        const sizeWarning = document.getElementById('imageSizeWarning');

        if (urlInput) urlInput.value = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (sizeWarning) sizeWarning.style.display = 'none';
    },

    showImagePreview(src) {
        const container = document.getElementById('imagePreviewContainer');
        const preview = document.getElementById('imagePreview');
        if (container && preview && src) {
            preview.src = src;
            preview.onload = () => {
                container.style.display = 'block';
            };
            preview.onerror = () => {
                container.style.display = 'none';
            };
        }
    },

    confirmImageSelection() {
        const urlInput = document.getElementById('imageUrlInput');
        const imageData = this.selectedImageData || (urlInput ? urlInput.value : null);

        if (imageData && this.imagePickerFieldKey) {
            this.updateSlideData(this.imagePickerFieldKey, imageData, this.imagePickerFieldIndex, null);
            updatePreview();
            showToast('Image mise à jour');
        }

        this.closeImagePicker();
    },

    clearImage() {
        if (this.imagePickerFieldKey) {
            this.updateSlideData(this.imagePickerFieldKey, '', this.imagePickerFieldIndex, null);
            updatePreview();
            showToast('Image supprimée');
        }
        this.closeImagePicker();
    },

    // ========================================================================
    // CODE EDITOR MODAL
    // ========================================================================

    codeEditorFieldKey: null,
    codeEditorFieldIndex: null,
    codeEditorIsAnnotated: false,

    openCodeEditor(fieldKey, fieldIndex, isAnnotated = false) {
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
    },

    closeCodeEditor() {
        const modal = document.getElementById('codeEditorModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.codeEditorFieldKey = null;
        this.codeEditorFieldIndex = null;
        this.codeEditorIsAnnotated = false;
    },

    confirmCodeEdit() {
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
    },

    // ========================================================================
    // DRAW.IO EDITOR
    // ========================================================================

    drawioEditorFieldKey: null,
    drawioEditorFieldIndex: null,

    openDrawioEditor(fieldKey, fieldIndex) {
        this.drawioEditorFieldKey = fieldKey;
        this.drawioEditorFieldIndex = fieldIndex !== undefined ? parseInt(fieldIndex) : null;

        const currentValue = this.getFieldValue(fieldKey, this.drawioEditorFieldIndex, null) || '';
        const modal = document.getElementById('drawioEditorModal');
        const iframe = document.getElementById('drawioEditorFrame');

        if (!modal || !iframe) return;

        // draw.io embed URL with configuration (dark=0 forces light mode)
        const drawioUrl = 'https://embed.diagrams.net/?embed=1&spin=1&proto=json&ui=kennedy&dark=0';
        iframe.src = drawioUrl;

        // Listen for messages from draw.io
        window.drawioMessageHandler = (event) => {
            if (event.origin !== 'https://embed.diagrams.net') return;

            let msg;
            try {
                msg = JSON.parse(event.data);
            } catch (e) {
                return;
            }

            if (msg.event === 'init') {
                // Send current diagram to editor
                let diagramData = '';
                if (currentValue && currentValue.startsWith('data:image/svg+xml;base64,')) {
                    try {
                        // Properly decode base64 with UTF-8 support
                        const base64 = currentValue.substring('data:image/svg+xml;base64,'.length);
                        const binary = atob(base64);
                        const bytes = new Uint8Array(binary.length);
                        for (let i = 0; i < binary.length; i++) {
                            bytes[i] = binary.charCodeAt(i);
                        }
                        diagramData = new TextDecoder('utf-8').decode(bytes);
                    } catch (e) {
                        console.warn('Failed to decode diagram data:', e);
                    }
                }
                iframe.contentWindow.postMessage(JSON.stringify({
                    action: 'load',
                    xml: diagramData,
                    autosave: 0
                }), '*');
            } else if (msg.event === 'save') {
                // Show saving status
                this.updateDrawioStatus('saving', 'Enregistrement...');
                // Request export as SVG with embedded XML for re-editing
                iframe.contentWindow.postMessage(JSON.stringify({
                    action: 'export',
                    format: 'xmlsvg',
                    background: '#ffffff',
                    spinKey: 'saving'
                }), '*');
            } else if (msg.event === 'export') {
                // Save the SVG data
                this.updateSlideData(this.drawioEditorFieldKey, msg.data, this.drawioEditorFieldIndex, null);
                updatePreview();
                // Close the editor after saving
                this.closeDrawioEditor();
            } else if (msg.event === 'exit') {
                this.closeDrawioEditor();
            }
        };
        window.addEventListener('message', window.drawioMessageHandler);

        // Clear status and show modal
        this.updateDrawioStatus('', '');
        modal.classList.add('active');
    },

    updateDrawioStatus(state, text) {
        const status = document.getElementById('drawioSaveStatus');
        if (status) {
            status.textContent = text;
            status.className = 'drawio-save-status' + (state ? ' ' + state : '');
        }
    },

    closeDrawioEditor() {
        const modal = document.getElementById('drawioEditorModal');
        const iframe = document.getElementById('drawioEditorFrame');

        if (window.drawioMessageHandler) {
            window.removeEventListener('message', window.drawioMessageHandler);
            window.drawioMessageHandler = null;
        }

        if (iframe) {
            iframe.src = '';
        }
        if (modal) {
            modal.classList.remove('active');
        }
        this.updateDrawioStatus('', '');
        this.drawioEditorFieldKey = null;
        this.drawioEditorFieldIndex = null;
    },

    // ========================================================================
    // ANNOTATION MANAGEMENT
    // ========================================================================

    deleteAnnotation(annotationIndex) {
        if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) {
            return;
        }

        const slide = currentProject.slides[selectedSlideIndex];
        if (!slide.data.annotations || !Array.isArray(slide.data.annotations)) {
            return;
        }

        // Remove the annotation at the specified index
        slide.data.annotations.splice(annotationIndex, 1);

        // Mark as changed
        markAsChanged();

        // Update UI
        renderEditor();
        updatePreview();
        showToast('Annotation supprimée');
    },

    addAnnotation(startLine, endLine) {
        if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) {
            return;
        }

        const slide = currentProject.slides[selectedSlideIndex];
        if (!slide.data.annotations) {
            slide.data.annotations = [];
        }

        // Create new annotation
        const newAnnotation = {
            line: Math.min(startLine, endLine),
            lineTo: Math.max(startLine, endLine),
            title: 'Nouvelle annotation',
            text: 'Description de l\'annotation'
        };

        // If single line, don't include lineTo
        if (newAnnotation.line === newAnnotation.lineTo) {
            delete newAnnotation.lineTo;
        }

        // Add the annotation and sort by line number
        slide.data.annotations.push(newAnnotation);
        slide.data.annotations.sort((a, b) => a.line - b.line);

        // Mark as changed
        markAsChanged();

        // Update UI
        renderEditor();
        updatePreview();
        showToast('Annotation ajoutée');
    },

    // ========================================================================
    // ANNOTATION DRAG SELECTION
    // ========================================================================

    handleAnnotationMouseDown(event) {
        // Only start drag selection from the add-annotation button
        const addBtn = event.target.closest('.add-annotation-btn');
        if (!addBtn) return;

        // Check if we're in a code-annotated template
        const codeAnnotatedContainer = event.target.closest('.template-code-annotated');
        if (!codeAnnotatedContainer) return;

        const lineNum = parseInt(addBtn.dataset.line);
        if (isNaN(lineNum)) return;

        this.isSelectingAnnotation = true;
        this.annotationSelectionStart = lineNum;
        this.annotationSelectionEnd = lineNum;

        // Add selecting class to preview
        const previewSlide = document.getElementById('previewSlide');
        if (previewSlide) {
            previewSlide.classList.add('annotation-selecting');
        }

        // Highlight the starting line
        this.updateAnnotationSelectionHighlight();

        event.preventDefault();
    },

    handleAnnotationMouseMove(event) {
        if (!this.isSelectingAnnotation) return;

        const codeLine = event.target.closest('.code-line[data-line-num]');
        if (!codeLine) return;

        const lineNum = parseInt(codeLine.dataset.lineNum);
        if (isNaN(lineNum)) return;

        // Find the range and check if all lines in between can be annotated
        const startLine = Math.min(this.annotationSelectionStart, lineNum);
        const endLine = Math.max(this.annotationSelectionStart, lineNum);

        // Check if all lines in range can be annotated
        const codeBody = codeLine.closest('.code-body');
        if (codeBody) {
            let allCanAnnotate = true;
            for (let i = startLine; i <= endLine; i++) {
                const line = codeBody.querySelector(`.code-line[data-line-num="${i}"]`);
                if (line && line.dataset.canAnnotate !== 'true') {
                    allCanAnnotate = false;
                    break;
                }
            }

            if (allCanAnnotate) {
                this.annotationSelectionEnd = lineNum;
                this.updateAnnotationSelectionHighlight();
            }
        }
    },

    handleAnnotationMouseUp() {
        if (!this.isSelectingAnnotation) return;

        const startLine = Math.min(this.annotationSelectionStart, this.annotationSelectionEnd);
        const endLine = Math.max(this.annotationSelectionStart, this.annotationSelectionEnd);

        // Clear selection state
        this.clearAnnotationSelectionHighlight();
        this.isSelectingAnnotation = false;

        const previewSlide = document.getElementById('previewSlide');
        if (previewSlide) {
            previewSlide.classList.remove('annotation-selecting');
        }

        // Only add annotation if we dragged (not just clicked)
        if (startLine !== endLine) {
            this.addAnnotation(startLine, endLine);
            this.justFinishedDragAnnotation = true;
        }

        this.annotationSelectionStart = null;
        this.annotationSelectionEnd = null;
    },

    cancelAnnotationSelection() {
        this.clearAnnotationSelectionHighlight();
        this.isSelectingAnnotation = false;
        this.annotationSelectionStart = null;
        this.annotationSelectionEnd = null;

        const previewSlide = document.getElementById('previewSlide');
        if (previewSlide) {
            previewSlide.classList.remove('annotation-selecting');
        }
    },

    updateAnnotationSelectionHighlight() {
        // Clear previous highlights
        this.clearAnnotationSelectionHighlight();

        const startLine = Math.min(this.annotationSelectionStart, this.annotationSelectionEnd);
        const endLine = Math.max(this.annotationSelectionStart, this.annotationSelectionEnd);

        const previewSlide = document.getElementById('previewSlide');
        if (!previewSlide) return;

        for (let i = startLine; i <= endLine; i++) {
            const line = previewSlide.querySelector(`.code-line[data-line-num="${i}"]`);
            if (line) {
                line.classList.add('selecting');
                if (i === startLine) line.classList.add('selection-start');
                if (i === endLine) line.classList.add('selection-end');
            }
        }
    },

    clearAnnotationSelectionHighlight() {
        const previewSlide = document.getElementById('previewSlide');
        if (!previewSlide) return;

        previewSlide.querySelectorAll('.code-line.selecting').forEach(line => {
            line.classList.remove('selecting', 'selection-start', 'selection-end');
        });
    },

    // ========================================================================
    // LIST ITEM MANAGEMENT
    // ========================================================================

    deleteListItem(listKey, itemIndex) {
        if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) {
            return;
        }

        const slide = currentProject.slides[selectedSlideIndex];
        const data = slide.data;

        // Handle nested keys like 'left.items'
        const keys = listKey.split('.');
        let target = data;

        // Navigate to the array
        for (const key of keys) {
            if (target === undefined || target === null) return;
            target = target[key];
        }

        if (!Array.isArray(target) || itemIndex < 0 || itemIndex >= target.length) {
            return;
        }

        // Don't delete if it's the last item
        if (target.length <= 1) {
            showToast('Impossible de supprimer le dernier élément');
            return;
        }

        // Remove the item
        target.splice(itemIndex, 1);

        // Mark as changed
        markAsChanged();

        // Update UI
        renderEditor();
        updatePreview();
        showToast('Élément supprimé');
    },

    addListItem(listKey, listType) {
        if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) {
            return;
        }

        const slide = currentProject.slides[selectedSlideIndex];
        const data = slide.data;

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
                }
                target = target[key];
            } else {
                if (!target[key]) {
                    target[key] = {};
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
        target.push(newItem);

        // Mark as changed
        markAsChanged();

        // Update UI
        renderEditor();
        updatePreview();
        showToast('Élément ajouté');
    },

    // Table manipulation methods for comparison template
    addTableColumn() {
        if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) return;
        const slide = currentProject.slides[selectedSlideIndex];
        if (slide.template !== 'comparison') return;

        const data = slide.data;
        if (!data.columns) data.columns = [];
        if (!data.rows) data.rows = [];

        // Add new column header
        data.columns.push(`Colonne ${data.columns.length + 1}`);

        // Add empty cell to each row
        data.rows.forEach(row => row.push(''));

        markAsChanged();
        renderEditor();
        updatePreview();
        showToast('Colonne ajoutée');
    },

    deleteTableColumn(colIndex) {
        if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) return;
        const slide = currentProject.slides[selectedSlideIndex];
        if (slide.template !== 'comparison') return;

        const data = slide.data;
        if (!data.columns || data.columns.length <= 1) {
            showToast('Impossible de supprimer la dernière colonne');
            return;
        }

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

        markAsChanged();
        renderEditor();
        updatePreview();
        showToast('Colonne supprimée');
    },

    addTableRow() {
        if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) return;
        const slide = currentProject.slides[selectedSlideIndex];
        if (slide.template !== 'comparison') return;

        const data = slide.data;
        if (!data.columns) data.columns = ['Colonne 1'];
        if (!data.rows) data.rows = [];

        // Create new row with empty cells matching column count
        const newRow = data.columns.map((_, i) => i === 0 ? `Ligne ${data.rows.length + 1}` : '');
        data.rows.push(newRow);

        markAsChanged();
        renderEditor();
        updatePreview();
        showToast('Ligne ajoutée');
    },

    deleteTableRow(rowIndex) {
        if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) return;
        const slide = currentProject.slides[selectedSlideIndex];
        if (slide.template !== 'comparison') return;

        const data = slide.data;
        if (!data.rows || data.rows.length <= 1) {
            showToast('Impossible de supprimer la dernière ligne');
            return;
        }

        data.rows.splice(rowIndex, 1);

        markAsChanged();
        renderEditor();
        updatePreview();
        showToast('Ligne supprimée');
    }
};

// ============================================================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK HANDLERS
// ============================================================================

function closeImagePicker() {
    InlineEditor.closeImagePicker();
}

function confirmImageSelection() {
    InlineEditor.confirmImageSelection();
}

function clearImage() {
    InlineEditor.clearImage();
}

function closeCodeEditor() {
    InlineEditor.closeCodeEditor();
}

function confirmCodeEdit() {
    InlineEditor.confirmCodeEdit();
}

function closeDrawioEditor() {
    InlineEditor.closeDrawioEditor();
}

function updateCodeEditorLineNumbers() {
    const textarea = document.getElementById('codeEditorInput');
    const lineNumbers = document.getElementById('codeEditorLineNumbers');
    const startLineInput = document.getElementById('codeStartLine');
    const showLineNumbersCheckbox = document.getElementById('codeShowLineNumbers');

    if (!textarea || !lineNumbers) return;

    // Check if line numbers should be shown
    const showLineNumbers = showLineNumbersCheckbox ? showLineNumbersCheckbox.checked : false;

    if (!showLineNumbers) {
        lineNumbers.style.display = 'none';
        return;
    }

    lineNumbers.style.display = 'block';

    const lines = textarea.value.split('\n');
    const startLine = startLineInput ? parseInt(startLineInput.value) || 1 : 1;

    let html = '';

    // Add line numbers
    for (let i = 0; i < lines.length; i++) {
        html += `<div>${startLine + i}</div>`;
    }

    // Ensure at least one line number
    if (lines.length === 0) {
        html = `<div>${startLine}</div>`;
    }

    lineNumbers.innerHTML = html;
}

function syncLineNumbersScroll() {
    const textarea = document.getElementById('codeEditorInput');
    const lineNumbers = document.getElementById('codeEditorLineNumbers');

    if (textarea && lineNumbers) {
        lineNumbers.scrollTop = textarea.scrollTop;
    }
}

function updateCodeEditorEllipsis() {
    const showEllipsisBeforeCheckbox = document.getElementById('codeShowEllipsisBefore');
    const showEllipsisAfterCheckbox = document.getElementById('codeShowEllipsisAfter');
    const ellipsisBefore = document.getElementById('codeEllipsisBefore');
    const ellipsisAfter = document.getElementById('codeEllipsisAfter');

    if (ellipsisBefore) {
        ellipsisBefore.classList.toggle('visible', showEllipsisBeforeCheckbox?.checked || false);
    }
    if (ellipsisAfter) {
        ellipsisAfter.classList.toggle('visible', showEllipsisAfterCheckbox?.checked || false);
    }

    // Update line numbers to include/exclude ellipsis markers
    updateCodeEditorLineNumbers();
}

function switchImagePickerTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.image-picker-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Show/hide content
    document.getElementById('imagePickerUrl').style.display = tab === 'url' ? 'block' : 'none';
    document.getElementById('imagePickerUpload').style.display = tab === 'upload' ? 'block' : 'none';
}

function handleImageUrlInput(url) {
    if (!url) {
        document.getElementById('imagePreviewContainer').style.display = 'none';
        return;
    }

    // Validate and preview URL
    const img = new Image();
    img.onload = function() {
        InlineEditor.selectedImageData = url;
        InlineEditor.showImagePreview(url);
    };
    img.onerror = function() {
        document.getElementById('imagePreviewContainer').style.display = 'none';
    };
    img.src = url;
}

function handleImageFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processImageFile(file);
    }
}

function processImageFile(file) {
    const maxSize = 1024 * 1024; // 1MB
    const reader = new FileReader();

    reader.onload = function(e) {
        InlineEditor.selectedImageData = e.target.result;
        InlineEditor.showImagePreview(e.target.result);

        if (file.size > maxSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const warning = document.getElementById('imageSizeWarning');
            if (warning) {
                warning.textContent = `Taille: ${sizeMB}MB. Considérez utiliser une URL pour de meilleures performances.`;
                warning.style.display = 'block';
            }
        } else {
            const warning = document.getElementById('imageSizeWarning');
            if (warning) {
                warning.style.display = 'none';
            }
        }
    };

    reader.onerror = function() {
        showToast('Erreur lors de la lecture du fichier', 'error');
    };

    reader.readAsDataURL(file);
}

function initImageDropZone() {
    const dropZone = document.getElementById('imageDropZone');
    const fileInput = document.getElementById('imageFileInput');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processImageFile(file);
        }
    });
}

// ============================================================================
// INITIALIZATION ON DOM READY
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize after a small delay to ensure other modules are loaded
    setTimeout(() => {
        InlineEditor.init();
    }, 100);
});
