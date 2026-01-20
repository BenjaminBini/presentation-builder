// src/editor/color-selector.js
// Consolidated color selector implementation

import { COLOR_LABELS, GRAY_LABELS } from '../config/index.js';
import { getProject, getSelectedSlideIndex, markAsChanged } from '../core/state.js';
import { registerActions } from '../core/event-delegation.js';

// ============================================================================
// ACTION HANDLERS (for event delegation)
// ============================================================================

/**
 * Handle color selection via event delegation
 */
function handleSelectColor(event, _element, params) {
  event.stopPropagation();
  selectSlideColor(params.key, params.color);
}

/**
 * Handle toggle color picker via event delegation
 */
function handleToggleColorPicker(_event, _element, params) {
  toggleColorPicker(params.key);
}

/**
 * Handle reset color via event delegation
 */
function handleResetColor(event, _element, params) {
  event.stopPropagation();
  resetSlideColor(params.key);
}

/**
 * Handle showing color name on hover
 */
function handleShowColorName(_event, element, _params) {
  showColorName(element);
}

/**
 * Handle hiding color name on hover leave
 */
function handleHideColorName(_event, element, _params) {
  hideColorName(element);
}

// Register color selector actions
registerActions({
  'select-color': handleSelectColor,
  'toggle-inline-color-picker': handleToggleColorPicker,
  'reset-inline-color': handleResetColor,
  'show-color-name': handleShowColorName,
  'hide-color-name': handleHideColorName
});

// Color sections for organized display
export const COLOR_SECTIONS = {
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
export function renderInlineColorSelector(key, label, currentValue, _defaultValue, isCustom) {
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
                                data-action="select-color"
                                data-key="${key}"
                                data-color="${color}"
                                data-hover-action="show-color-name"
                                data-hover-leave-action="hide-color-name">
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    };

    const resetBtn = isCustom ? `
        <button class="inline-color-reset" data-action="reset-inline-color" data-key="${key}" title="Réinitialiser">
            <svg class="icon" viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
        </button>
    ` : '';

    return `
        <div class="inline-color-selector ${isCustom ? 'is-custom' : ''}" data-color-key="${key}">
            <span class="inline-color-label">${label}</span>
            <div class="inline-color-controls">
                <span class="inline-color-btn-wrapper">
                    <button class="inline-color-btn" data-action="toggle-inline-color-picker" data-key="${key}" title="${label}">
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
}

// Show color name on hover
export function showColorName(btn) {
    const section = btn.closest('.color-section');
    const nameEl = section.querySelector('.color-section-name');
    nameEl.textContent = btn.dataset.colorName;
}

// Hide color name
export function hideColorName(btn) {
    const section = btn.closest('.color-section');
    const nameEl = section.querySelector('.color-section-name');
    nameEl.textContent = '';
}

// Toggle color picker dropdown
export function toggleColorPicker(key) {
    // Close theme color picker from sidebar if open
    if (typeof window.closeAllThemeColorPickers === 'function') {
        window.closeAllThemeColorPickers();
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
}

// Select color and close dropdown
export function selectSlideColor(key, value) {
    window.updateSlideColor(key, value);
    // Dropdown will close when editor re-renders
}

// Update slide color setting
export function updateSlideColor(key, value) {
    const selectedSlideIndex = getSelectedSlideIndex();
    const project = getProject();
    if (selectedSlideIndex >= 0) {
        if (!project.slides[selectedSlideIndex].data.colors) {
            project.slides[selectedSlideIndex].data.colors = {};
        }
        project.slides[selectedSlideIndex].data.colors[key] = value;
        window.renderEditor();
        window.updatePreview();
        markAsChanged();
    }
}

// Reset slide color to default
export function resetSlideColor(key) {
    const selectedSlideIndex = getSelectedSlideIndex();
    const project = getProject();
    if (selectedSlideIndex >= 0 && project.slides[selectedSlideIndex].data.colors) {
        delete project.slides[selectedSlideIndex].data.colors[key];
        // Clean up empty colors object to preserve CSS fallbacks (like gradients)
        if (Object.keys(project.slides[selectedSlideIndex].data.colors).length === 0) {
            delete project.slides[selectedSlideIndex].data.colors;
        }
        window.renderEditor();
        window.updatePreview();
        markAsChanged();
    }
}
