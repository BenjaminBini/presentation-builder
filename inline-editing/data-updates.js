// inline-editing/data-updates.js
// Field value updates and nested field handling
// Extends InlineEditor object from core.js

// ============================================================================
// DATA UPDATES
// ============================================================================

InlineEditor.updateSlideData = function(key, value, index, subkey) {
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
};

InlineEditor.getFieldValue = function(key, index, subkey) {
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
};
