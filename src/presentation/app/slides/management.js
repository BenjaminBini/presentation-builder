// src/app/slides/management.js
// Add, delete, duplicate, reorder slides - ES6 module version
// Uses slide-service for all slide mutations

import { get, set } from '../../../core/state.js';
import { getDefaultData } from '../../../config/index.js';
import { refreshSlideList, refreshEditor, refreshPreview } from '../ui-refresh.js';
import { closeModal } from '../modals.js';
import {
  addSlide as addSlideService,
  deleteSlide as deleteSlideService,
  duplicateSlide as duplicateSlideService,
  moveSlide as moveSlideService
} from '../../../services/slide-service.js';

// Helper functions for drag state
const getDraggedIndex = () => get('draggedIndex');
const setDraggedIndex = (value) => set('draggedIndex', value);

export function addSlide() {
    if (window.setSelectedTemplate) window.setSelectedTemplate(null);
    document.querySelectorAll('.template-option').forEach(el => el.classList.remove('selected'));
    const modal = document.getElementById('addSlideModal');
    if (modal) modal.classList.add('active');
}

export function selectTemplate(template) {
    // Use slide-service for adding slide - handles state, events, and unsaved changes
    const data = getDefaultData(template);
    const insertIndex = addSlideService(template, data);

    // Store in session for persistence
    sessionStorage.setItem('selectedSlideIndex', insertIndex);

    closeModal('addSlideModal');
    refreshSlideList();
    refreshEditor();
    refreshPreview();
}

export function deleteSlide(index) {
    if (confirm('Supprimer cette slide ?')) {
        // Use slide-service - handles state, index adjustment, events, and unsaved changes
        deleteSlideService(index);
        refreshSlideList();
        refreshEditor();
        refreshPreview();
    }
}

export function duplicateSlide(index) {
    // Use slide-service - handles deep clone, state, events, and unsaved changes
    duplicateSlideService(index);
    refreshSlideList();
    refreshEditor();
    refreshPreview();
}

export function moveSlide(fromIndex, toIndex) {
    // Use slide-service - handles state, selected index update, events, and unsaved changes
    moveSlideService(fromIndex, toIndex);
    refreshSlideList();
    refreshPreview();
}

// ============================================================================
// DRAG AND DROP
// ============================================================================

export function handleDragStart(event, index) {
    setDraggedIndex(index);
    event.target.classList.add('dragging');
}

export function handleDragOver(event) {
    event.preventDefault();
    const item = event.target.closest('.slide-item');
    if (item) {
        // Remove from all others first
        document.querySelectorAll('.slide-item.drag-over').forEach(el => {
            if (el !== item) el.classList.remove('drag-over');
        });
        item.classList.add('drag-over');
    }
}

export function handleDragLeave(event) {
    const item = event.target.closest('.slide-item');
    if (item && !item.contains(event.relatedTarget)) {
        item.classList.remove('drag-over');
    }
}

export function handleDrop(event, targetIndex) {
    event.preventDefault();
    const draggedIndex = getDraggedIndex();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
        // Use slide-service - handles state, selected index update, events, and unsaved changes
        moveSlideService(draggedIndex, targetIndex);
        refreshSlideList();
        refreshPreview();
    }
    document.querySelectorAll('.slide-item').forEach(el => el.classList.remove('drag-over'));
}

export function handleDragEnd() {
    setDraggedIndex(null);
    document.querySelectorAll('.slide-item').forEach(el => {
        el.classList.remove('dragging', 'drag-over');
    });
}
