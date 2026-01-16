// editor/color-selector.js
// Consolidated color selector implementation

// Render an inline color selector (compact toolbar style)
window.renderInlineColorSelector = function(key, label, currentValue) {
    const themeColors = Object.keys(COLOR_LABELS);
    const grayColors = Object.keys(GRAY_PALETTE);

    return `
        <div class="inline-color-selector" data-color-key="${key}">
            <button class="inline-color-btn" onclick="toggleColorPicker('${key}')" title="${label}">
                <span class="inline-color-swatch" style="background-color: var(--${currentValue});"></span>
                <span class="inline-color-label">${label}</span>
            </button>
            <div class="inline-color-dropdown" id="colorDropdown-${key}">
                <div class="color-swatches-row">
                    ${themeColors.map(color => `
                        <button type="button"
                            class="color-swatch-btn ${currentValue === color ? 'selected' : ''}"
                            style="background-color: var(--${color});"
                            onclick="selectSlideColor('${key}', '${color}')">
                            <span class="color-tooltip">${COLOR_LABELS[color]}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="color-swatches-row">
                    ${grayColors.map(color => `
                        <button type="button"
                            class="color-swatch-btn ${currentValue === color ? 'selected' : ''}"
                            style="background-color: var(--${color});"
                            onclick="selectSlideColor('${key}', '${color}')">
                            <span class="color-tooltip">${GRAY_LABELS[color]}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
};

// Legacy color selector (keeping for compatibility)
window.renderColorSelector = function(key, label, currentValue) {
    return window.renderInlineColorSelector(key, label, currentValue);
};

// Toggle color picker dropdown
window.toggleColorPicker = function(key) {
    const dropdown = document.getElementById(`colorDropdown-${key}`);
    const selector = dropdown.closest('.inline-color-selector') || dropdown.closest('.color-selector-group');
    const isOpen = dropdown.classList.contains('open');

    // Close all other dropdowns
    document.querySelectorAll('.inline-color-dropdown.open, .color-swatches-dropdown.open').forEach(el => {
        el.classList.remove('open');
        const parent = el.closest('.inline-color-selector') || el.closest('.color-selector-group');
        if (parent) parent.classList.remove('picker-open');
    });

    // Toggle this one
    if (!isOpen) {
        dropdown.classList.add('open');
        if (selector) selector.classList.add('picker-open');
    }
};

// Select color and close dropdown
window.selectSlideColor = function(key, value) {
    updateSlideColor(key, value);
    // Dropdown will close when editor re-renders
};

// Update slide color setting
window.updateSlideColor = function(key, value) {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data.colors) {
            currentProject.slides[selectedSlideIndex].data.colors = {};
        }
        currentProject.slides[selectedSlideIndex].data.colors[key] = value;
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};
