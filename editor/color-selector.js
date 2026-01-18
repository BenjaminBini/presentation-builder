// editor/color-selector.js
// Consolidated color selector implementation

// Color sections for organized display
const COLOR_SECTIONS = {
    accent: {
        label: 'Accent',
        colors: ['accent-main', 'accent-alt', 'accent-third']
    },
    text: {
        label: 'Texte',
        colors: ['text-main', 'text-alt', 'text-third']
    },
    bg: {
        label: 'Fond',
        colors: ['bg-main', 'bg-alt', 'bg-third']
    },
    gray: {
        label: 'Niveaux de gris',
        colors: ['white', 'gray-100', 'gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800', 'gray-900']
    },
    semantic: {
        label: 'Sémantique',
        colors: ['confirm', 'info', 'warn', 'error']
    }
};

// Render an inline color selector (compact toolbar style)
window.renderInlineColorSelector = function(key, label, currentValue, defaultValue, isCustom) {
    const colorName = COLOR_LABELS[currentValue] || GRAY_LABELS[currentValue] || currentValue;

    const renderSection = (sectionKey, section) => {
        return `
            <div class="color-section" data-section="${sectionKey}">
                <div class="color-section-header">
                    <span class="color-section-label">${section.label}</span>
                    <span class="color-section-name"></span>
                </div>
                <div class="color-swatches-row">
                    ${section.colors.map(color => {
                        const colorLabel = COLOR_LABELS[color] || GRAY_LABELS[color] || color;
                        return `
                            <button type="button"
                                class="color-swatch-btn ${currentValue === color ? 'selected' : ''}"
                                style="background-color: var(--${color});"
                                data-color-name="${colorLabel}"
                                onclick="selectSlideColor('${key}', '${color}')"
                                onmouseenter="showColorName(this)"
                                onmouseleave="hideColorName(this)">
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    };

    const resetBtn = isCustom ? `
        <button class="inline-color-reset" onclick="event.stopPropagation(); resetSlideColor('${key}')" title="Réinitialiser">
            <svg class="icon" viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
        </button>
    ` : '';

    return `
        <div class="inline-color-selector ${isCustom ? 'is-custom' : ''}" data-color-key="${key}">
            <span class="inline-color-label">${label}</span>
            <div class="inline-color-controls">
                <span class="inline-color-btn-wrapper">
                    <button class="inline-color-btn" onclick="toggleColorPicker('${key}')" title="${label}">
                        <span class="inline-color-swatch" style="background-color: var(--${currentValue});"></span>
                    </button>
                    ${resetBtn}
                </span>
                <span class="inline-color-name">${colorName}</span>
            </div>
            <div class="inline-color-dropdown" id="colorDropdown-${key}">
                ${renderSection('accent', COLOR_SECTIONS.accent)}
                ${renderSection('text', COLOR_SECTIONS.text)}
                ${renderSection('bg', COLOR_SECTIONS.bg)}
                ${renderSection('gray', COLOR_SECTIONS.gray)}
                ${renderSection('semantic', COLOR_SECTIONS.semantic)}
            </div>
        </div>
    `;
};

// Show color name on hover
window.showColorName = function(btn) {
    const section = btn.closest('.color-section');
    const nameEl = section.querySelector('.color-section-name');
    nameEl.textContent = btn.dataset.colorName;
};

// Hide color name
window.hideColorName = function(btn) {
    const section = btn.closest('.color-section');
    const nameEl = section.querySelector('.color-section-name');
    nameEl.textContent = '';
};

// Legacy color selector (keeping for compatibility)
window.renderColorSelector = function(key, label, currentValue) {
    return window.renderInlineColorSelector(key, label, currentValue);
};

// Toggle color picker dropdown
window.toggleColorPicker = function(key) {
    // Close theme color picker from sidebar if open
    if (typeof closeAllThemeColorPickers === 'function') {
        closeAllThemeColorPickers();
    }

    const dropdown = document.getElementById(`colorDropdown-${key}`);
    const selector = dropdown.closest('.inline-color-selector') || dropdown.closest('.color-selector-group') || dropdown.closest('.color-item');
    const trigger = selector.querySelector('.inline-color-btn') || selector.querySelector('.color-swatch');
    const isOpen = dropdown.classList.contains('open');

    // Close all other dropdowns
    document.querySelectorAll('.inline-color-dropdown.open, .color-swatches-dropdown.open').forEach(el => {
        el.classList.remove('open');
        el.style.bottom = '';
        el.style.left = '';
        const parent = el.closest('.inline-color-selector') || el.closest('.color-selector-group') || el.closest('.color-item');
        if (parent) parent.classList.remove('picker-open');
    });

    // Toggle this one
    if (!isOpen) {
        dropdown.classList.add('open');
        if (selector) selector.classList.add('picker-open');

        // Position dropdown above the trigger
        const triggerRect = trigger.getBoundingClientRect();
        dropdown.style.bottom = (window.innerHeight - triggerRect.top + 4) + 'px';
        dropdown.style.left = triggerRect.left + 'px';
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

// Reset slide color to default
window.resetSlideColor = function(key) {
    if (selectedSlideIndex >= 0 && currentProject.slides[selectedSlideIndex].data.colors) {
        delete currentProject.slides[selectedSlideIndex].data.colors[key];
        // Clean up empty colors object to preserve CSS fallbacks (like gradients)
        if (Object.keys(currentProject.slides[selectedSlideIndex].data.colors).length === 0) {
            delete currentProject.slides[selectedSlideIndex].data.colors;
        }
        renderEditor();
        updatePreview();
        markAsChanged();
    }
};
