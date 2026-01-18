// editor/handlers.js
// All field update and change handler functions

// ============================================================================
// BASIC FIELD HANDLERS
// ============================================================================

window.updateField = function(key, value) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data[key] = value;
        updatePreview();
        markAsChanged();
        if (key === 'title' || key === 'quote') {
            renderSlideList();
        }
    }
};

window.changeTemplate = function(newTemplate) {
    if (selectedSlideIndex >= 0) {
        const oldData = currentProject.slides[selectedSlideIndex].data;
        currentProject.slides[selectedSlideIndex].template = newTemplate;
        currentProject.slides[selectedSlideIndex].data = {
            ...getDefaultData(newTemplate),
            title: oldData.title || getDefaultData(newTemplate).title
        };
        renderSlideList();
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

// ============================================================================
// ARRAY FIELD HANDLERS
// ============================================================================

window.updateArrayItem = function(key, index, value) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data[key][index] = value;
        updatePreview();
        markAsChanged();
    }
};

window.addArrayItem = function(key) {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data[key]) {
            currentProject.slides[selectedSlideIndex].data[key] = [];
        }
        currentProject.slides[selectedSlideIndex].data[key].push('Nouvel élément');
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

window.removeArrayItem = function(key, index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data[key].splice(index, 1);
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

// ============================================================================
// COLUMN FIELD HANDLERS
// ============================================================================

window.updateColumnField = function(key, field, value) {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data[key]) {
            currentProject.slides[selectedSlideIndex].data[key] = { title: '', items: [] };
        }
        currentProject.slides[selectedSlideIndex].data[key][field] = value;
        updatePreview();
        markAsChanged();
    }
};

window.updateColumnItem = function(key, index, value) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data[key].items[index] = value;
        updatePreview();
        markAsChanged();
    }
};

window.addColumnItem = function(key) {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data[key].items) {
            currentProject.slides[selectedSlideIndex].data[key].items = [];
        }
        currentProject.slides[selectedSlideIndex].data[key].items.push('Nouvel item');
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

window.removeColumnItem = function(key, index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data[key].items.splice(index, 1);
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

// ============================================================================
// STATS FIELD HANDLERS
// ============================================================================

window.updateStatItem = function(index, field, value) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.stats[index][field] = value;
        updatePreview();
        markAsChanged();
    }
};

window.addStatItem = function() {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data.stats) {
            currentProject.slides[selectedSlideIndex].data.stats = [];
        }
        currentProject.slides[selectedSlideIndex].data.stats.push({ value: '0', label: 'Label', change: '' });
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

window.removeStatItem = function(index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.stats.splice(index, 1);
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

// ============================================================================
// ANNOTATION FIELD HANDLERS
// ============================================================================

window.updateAnnotationItem = function(index, field, value) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.annotations[index][field] = value;
        updatePreview();
        markAsChanged();
    }
};

window.addAnnotationItem = function() {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data.annotations) {
            currentProject.slides[selectedSlideIndex].data.annotations = [];
        }
        currentProject.slides[selectedSlideIndex].data.annotations.push({ line: 1, text: 'Annotation' });
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

window.removeAnnotationItem = function(index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.annotations.splice(index, 1);
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

// ============================================================================
// STEP FIELD HANDLERS
// ============================================================================

window.updateStepItem = function(index, field, value) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.steps[index][field] = value;
        updatePreview();
        markAsChanged();
    }
};

window.addStepItem = function() {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data.steps) {
            currentProject.slides[selectedSlideIndex].data.steps = [];
        }
        const num = currentProject.slides[selectedSlideIndex].data.steps.length + 1;
        currentProject.slides[selectedSlideIndex].data.steps.push({ icon: String(num), title: `Étape ${num}`, description: '' });
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

window.removeStepItem = function(index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.steps.splice(index, 1);
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

// ============================================================================
// ROW FIELD HANDLERS (for comparison tables)
// ============================================================================

window.updateRowCell = function(rowIndex, colIndex, value) {
    if (selectedSlideIndex >= 0) {
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        currentProject.slides[selectedSlideIndex].data.rows[rowIndex][colIndex] = value;
        updatePreview();
        markAsChanged();
    }
};

window.addRowItem = function() {
    if (selectedSlideIndex >= 0) {
        const columns = currentProject.slides[selectedSlideIndex].data.columns || [];
        const newRow = columns.map(() => '');
        if (!currentProject.slides[selectedSlideIndex].data.rows) {
            currentProject.slides[selectedSlideIndex].data.rows = [];
        }
        currentProject.slides[selectedSlideIndex].data.rows.push(newRow);
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

window.removeRowItem = function(index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.rows.splice(index, 1);
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

// ============================================================================
// TABLE FIELD HANDLERS (for generic tables)
// ============================================================================

window.updateTableCell = function(rowIndex, colIndex, value) {
    if (selectedSlideIndex >= 0) {
        // Keep as string for tables (no boolean conversion)
        currentProject.slides[selectedSlideIndex].data.rows[rowIndex][colIndex] = value;
        updatePreview();
        markAsChanged();
    }
};

window.addTableRow = function() {
    if (selectedSlideIndex >= 0) {
        const columns = currentProject.slides[selectedSlideIndex].data.columns || [];
        const newRow = columns.map(() => '');
        if (!currentProject.slides[selectedSlideIndex].data.rows) {
            currentProject.slides[selectedSlideIndex].data.rows = [];
        }
        currentProject.slides[selectedSlideIndex].data.rows.push(newRow);
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

window.removeTableRow = function(index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.rows.splice(index, 1);
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

// ============================================================================
// AGENDA ITEM HANDLERS
// ============================================================================

window.updateAgendaItem = function(index, field, value) {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data.items) {
            currentProject.slides[selectedSlideIndex].data.items = [];
        }
        if (!currentProject.slides[selectedSlideIndex].data.items[index]) {
            currentProject.slides[selectedSlideIndex].data.items[index] = {};
        }
        currentProject.slides[selectedSlideIndex].data.items[index][field] = value;
        updatePreview();
        markAsChanged();
    }
};

window.addAgendaItem = function() {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data.items) {
            currentProject.slides[selectedSlideIndex].data.items = [];
        }
        const num = currentProject.slides[selectedSlideIndex].data.items.length + 1;
        currentProject.slides[selectedSlideIndex].data.items.push({ title: `Point ${num}`, subtitle: '', duration: '' });
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};

window.removeAgendaItem = function(index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.items.splice(index, 1);
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};
