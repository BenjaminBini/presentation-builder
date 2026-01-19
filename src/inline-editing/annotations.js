// src/inline-editing/annotations.js
// Annotation management and drag selection

import { emit, EventTypes } from '../core/events.js';
import { getState, getSelectedSlideIndex, set, setHasUnsavedChanges } from '../core/state.js';

/**
 * Delete annotation by index
 * @param {number} annotationIndex - Index of annotation to delete
 */
export function deleteAnnotation(annotationIndex) {
  const selectedSlideIndex = getSelectedSlideIndex();
  const state = getState();

  if (selectedSlideIndex < 0 || !state.project.slides[selectedSlideIndex]) {
    return;
  }

  const slide = state.project.slides[selectedSlideIndex];
  if (!slide.data.annotations || !Array.isArray(slide.data.annotations)) {
    return;
  }

  // Remove the annotation at the specified index
  const annotations = [...slide.data.annotations];
  annotations.splice(annotationIndex, 1);

  // Update slide data
  const slides = [...state.project.slides];
  slides[selectedSlideIndex] = {
    ...slide,
    data: { ...slide.data, annotations }
  };
  set('project.slides', slides);

  // Emit events for UI updates via subscriptions
  emit(EventTypes.CHANGES_MARKED);
  setHasUnsavedChanges(true);
  emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex });

  // Refresh editor panel (keep for now - no subscription exists)
  if (typeof window.renderEditor === 'function') {
    window.renderEditor();
  }
}

/**
 * Add new annotation
 * @param {number} startLine - Starting line number
 * @param {number} endLine - Ending line number
 */
export function addAnnotation(startLine, endLine) {
  const selectedSlideIndex = getSelectedSlideIndex();
  const state = getState();

  if (selectedSlideIndex < 0 || !state.project.slides[selectedSlideIndex]) {
    return;
  }

  const slide = state.project.slides[selectedSlideIndex];
  const annotations = slide.data.annotations ? [...slide.data.annotations] : [];

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
  annotations.push(newAnnotation);
  annotations.sort((a, b) => a.line - b.line);

  // Update slide data
  const slides = [...state.project.slides];
  slides[selectedSlideIndex] = {
    ...slide,
    data: { ...slide.data, annotations }
  };
  set('project.slides', slides);

  // Emit events for UI updates via subscriptions
  emit(EventTypes.CHANGES_MARKED);
  setHasUnsavedChanges(true);
  emit(EventTypes.SLIDE_DATA_CHANGED, { index: selectedSlideIndex });

  // Refresh editor panel (keep for now - no subscription exists)
  if (typeof window.renderEditor === 'function') {
    window.renderEditor();
  }
}

// ============================================================================
// ANNOTATION DRAG SELECTION
// ============================================================================

/**
 * Handle mouse down for annotation drag selection
 * @param {MouseEvent} event
 */
export function handleAnnotationMouseDown(event) {
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
  updateAnnotationSelectionHighlight.call(this);

  event.preventDefault();
}

/**
 * Handle mouse move during annotation drag selection
 * @param {MouseEvent} event
 */
export function handleAnnotationMouseMove(event) {
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
      updateAnnotationSelectionHighlight.call(this);
    }
  }
}

/**
 * Handle mouse up to complete annotation drag selection
 */
export function handleAnnotationMouseUp() {
  if (!this.isSelectingAnnotation) return;

  const startLine = Math.min(this.annotationSelectionStart, this.annotationSelectionEnd);
  const endLine = Math.max(this.annotationSelectionStart, this.annotationSelectionEnd);

  // Clear selection state
  clearAnnotationSelectionHighlight.call(this);
  this.isSelectingAnnotation = false;

  const previewSlide = document.getElementById('previewSlide');
  if (previewSlide) {
    previewSlide.classList.remove('annotation-selecting');
  }

  // Only add annotation if we dragged (not just clicked)
  if (startLine !== endLine) {
    addAnnotation.call(this, startLine, endLine);
    this.justFinishedDragAnnotation = true;
  }

  this.annotationSelectionStart = null;
  this.annotationSelectionEnd = null;
}

/**
 * Cancel annotation drag selection
 */
export function cancelAnnotationSelection() {
  clearAnnotationSelectionHighlight.call(this);
  this.isSelectingAnnotation = false;
  this.annotationSelectionStart = null;
  this.annotationSelectionEnd = null;

  const previewSlide = document.getElementById('previewSlide');
  if (previewSlide) {
    previewSlide.classList.remove('annotation-selecting');
  }
}

/**
 * Update annotation selection highlight
 */
export function updateAnnotationSelectionHighlight() {
  // Clear previous highlights
  clearAnnotationSelectionHighlight.call(this);

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
}

/**
 * Clear annotation selection highlight
 */
export function clearAnnotationSelectionHighlight() {
  const previewSlide = document.getElementById('previewSlide');
  if (!previewSlide) return;

  previewSlide.querySelectorAll('.code-line.selecting').forEach(line => {
    line.classList.remove('selecting', 'selection-start', 'selection-end');
  });
}
