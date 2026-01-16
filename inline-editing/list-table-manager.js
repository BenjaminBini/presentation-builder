// inline-editing/list-table-manager.js
// List item and table row/column operations
// Extends InlineEditor object from core.js

// ============================================================================
// LIST ITEM MANAGEMENT
// ============================================================================

InlineEditor.deleteListItem = function(listKey, itemIndex) {
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
};

InlineEditor.addListItem = function(listKey, listType) {
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
};

// ============================================================================
// TABLE MANIPULATION (COMPARISON TEMPLATE)
// ============================================================================

InlineEditor.addTableColumn = function() {
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
};

InlineEditor.deleteTableColumn = function(colIndex) {
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
};

InlineEditor.addTableRow = function() {
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
};

InlineEditor.deleteTableRow = function(rowIndex) {
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
};
