// src/app/slides/management.js
// Add, delete, duplicate, reorder slides - ES6 module version

import { getProject, getSelectedSlideIndex, setSelectedSlideIndex, get, set, markAsChanged } from '../../core/state.js';

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
    const getDefaultData = window.getDefaultData || (() => ({}));

    // Directly add the slide with the selected template
    const newSlide = {
        template: template,
        data: getDefaultData(template)
    };

    // Insert after current slide (or at end if no slides)
    const currentProject = getProject();
    const selectedSlideIndex = getSelectedSlideIndex();
    const insertIndex = currentProject.slides.length === 0
        ? 0
        : selectedSlideIndex + 1;
    currentProject.slides.splice(insertIndex, 0, newSlide);
    setSelectedSlideIndex(insertIndex);
    sessionStorage.setItem('selectedSlideIndex', insertIndex);

    if (window.closeModal) window.closeModal('addSlideModal');
    if (window.renderSlideList) window.renderSlideList();
    if (window.renderEditor) window.renderEditor();
    if (window.updatePreview) window.updatePreview();
    markAsChanged();
}

export function deleteSlide(index) {
    if (confirm('Supprimer cette slide ?')) {
        const currentProject = getProject();
        const selectedSlideIndex = getSelectedSlideIndex();
        currentProject.slides.splice(index, 1);
        if (selectedSlideIndex >= currentProject.slides.length) {
            setSelectedSlideIndex(currentProject.slides.length - 1);
        }
        if (window.renderSlideList) window.renderSlideList();
        if (window.renderEditor) window.renderEditor();
        if (window.updatePreview) window.updatePreview();
        markAsChanged();
    }
}

export function duplicateSlide(index) {
    const currentProject = getProject();
    const copy = JSON.parse(JSON.stringify(currentProject.slides[index]));
    currentProject.slides.splice(index + 1, 0, copy);
    setSelectedSlideIndex(index + 1);
    if (window.renderSlideList) window.renderSlideList();
    if (window.renderEditor) window.renderEditor();
    if (window.updatePreview) window.updatePreview();
    markAsChanged();
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
    const selectedSlideIndex = getSelectedSlideIndex();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
        const currentProject = getProject();
        const [removed] = currentProject.slides.splice(draggedIndex, 1);
        currentProject.slides.splice(targetIndex, 0, removed);
        if (selectedSlideIndex === draggedIndex) {
            setSelectedSlideIndex(targetIndex);
        }
        if (window.renderSlideList) window.renderSlideList();
        if (window.updatePreview) window.updatePreview();
        markAsChanged();
    }
    document.querySelectorAll('.slide-item').forEach(el => el.classList.remove('drag-over'));
}

export function handleDragEnd() {
    setDraggedIndex(null);
    document.querySelectorAll('.slide-item').forEach(el => {
        el.classList.remove('dragging', 'drag-over');
    });
}
