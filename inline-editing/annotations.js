// inline-editing/annotations.js
// Annotation management and drag selection
// Extends InlineEditor object from core.js

// ============================================================================
// ANNOTATION MANAGEMENT
// ============================================================================

InlineEditor.deleteAnnotation = function(annotationIndex) {
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
};

InlineEditor.addAnnotation = function(startLine, endLine) {
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
};

// ============================================================================
// ANNOTATION DRAG SELECTION
// ============================================================================

InlineEditor.handleAnnotationMouseDown = function(event) {
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
};

InlineEditor.handleAnnotationMouseMove = function(event) {
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
};

InlineEditor.handleAnnotationMouseUp = function() {
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
};

InlineEditor.cancelAnnotationSelection = function() {
    this.clearAnnotationSelectionHighlight();
    this.isSelectingAnnotation = false;
    this.annotationSelectionStart = null;
    this.annotationSelectionEnd = null;

    const previewSlide = document.getElementById('previewSlide');
    if (previewSlide) {
        previewSlide.classList.remove('annotation-selecting');
    }
};

InlineEditor.updateAnnotationSelectionHighlight = function() {
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
};

InlineEditor.clearAnnotationSelectionHighlight = function() {
    const previewSlide = document.getElementById('previewSlide');
    if (!previewSlide) return;

    previewSlide.querySelectorAll('.code-line.selecting').forEach(line => {
        line.classList.remove('selecting', 'selection-start', 'selection-end');
    });
};
