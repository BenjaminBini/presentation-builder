// app/slides/management.js
// Add, delete, duplicate, reorder slides

window.addSlide = function() {
    window.selectedTemplate = null;
    document.querySelectorAll('.template-option').forEach(el => el.classList.remove('selected'));
    document.getElementById('addSlideModal').classList.add('active');
};

window.selectTemplate = function(template) {
    // Directly add the slide with the selected template
    const newSlide = {
        template: template,
        data: getDefaultData(template)
    };

    window.currentProject.slides.push(newSlide);
    window.selectedSlideIndex = window.currentProject.slides.length - 1;

    closeModal('addSlideModal');
    renderSlideList();
    renderEditor();
    updatePreview();
    window.markAsChanged();
    showToast('Slide ajoutée');
};

window.confirmAddSlide = function() {
    // Legacy function - kept for compatibility but no longer used
    if (!window.selectedTemplate) {
        showToast('Veuillez sélectionner un template', 'error');
        return;
    }
    selectTemplate(window.selectedTemplate);
};

window.deleteSlide = function(index) {
    if (confirm('Supprimer cette slide ?')) {
        window.currentProject.slides.splice(index, 1);
        if (window.selectedSlideIndex >= window.currentProject.slides.length) {
            window.selectedSlideIndex = window.currentProject.slides.length - 1;
        }
        renderSlideList();
        renderEditor();
        updatePreview();
        window.markAsChanged();
        showToast('Slide supprimée');
    }
};

window.duplicateSlide = function(index) {
    const copy = JSON.parse(JSON.stringify(window.currentProject.slides[index]));
    window.currentProject.slides.splice(index + 1, 0, copy);
    window.selectedSlideIndex = index + 1;
    renderSlideList();
    renderEditor();
    updatePreview();
    window.markAsChanged();
    showToast('Slide dupliquée');
};

// ============================================================================
// DRAG AND DROP
// ============================================================================

window.handleDragStart = function(event, index) {
    window.draggedIndex = index;
    event.target.classList.add('dragging');
};

window.handleDragOver = function(event) {
    event.preventDefault();
    const item = event.target.closest('.slide-item');
    if (item) {
        item.classList.add('drag-over');
    }
};

window.handleDrop = function(event, targetIndex) {
    event.preventDefault();
    if (window.draggedIndex !== null && window.draggedIndex !== targetIndex) {
        const [removed] = window.currentProject.slides.splice(window.draggedIndex, 1);
        window.currentProject.slides.splice(targetIndex, 0, removed);
        if (window.selectedSlideIndex === window.draggedIndex) {
            window.selectedSlideIndex = targetIndex;
        }
        renderSlideList();
        updatePreview();
        window.markAsChanged();
    }
    document.querySelectorAll('.slide-item').forEach(el => el.classList.remove('drag-over'));
};

window.handleDragEnd = function() {
    window.draggedIndex = null;
    document.querySelectorAll('.slide-item').forEach(el => {
        el.classList.remove('dragging', 'drag-over');
    });
};
