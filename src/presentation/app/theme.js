// src/app/theme.js
// Theme selection and color management - ES6 module version

import { registerActions } from '../event-delegation.js';
import { THEMES, COLOR_LABELS } from '../../config/themes.js';
import { getProject } from '../../core/state.js';
import {
  THEME_COLOR_KEYS,
  changeTheme as changeThemeService,
  setColorOverride as setColorOverrideService,
  resetColorOverride as resetColorOverrideService,
  resetAllColors as resetAllColorsService
} from '../../services/theme-service.js';
import { refreshEditor, refreshPreview } from './ui-refresh.js';
import {
    rgbToHsv,
    hexToRgb,
    drawColorSpectrum,
    updateFromSpectrum as updateFromSpectrumBase,
    updateFromHue as updateFromHueBase,
    validateAndApplyHex as validateAndApplyHexBase,
    renderThemeColorDropdown,
    getActiveColorPicker,
    setActiveColorPicker,
    isSpectrumDragging,
    setSpectrumDragging,
    getOriginalColorValue,
    setOriginalColorValue,
    wasColorOverridden,
    setWasOverridden,
    resetPickerState
} from './color-picker.js';

// Re-export color utilities for backwards compatibility
export {
    hsvToRgb,
    rgbToHsv,
    hexToRgb,
    rgbToHex,
    drawColorSpectrum,
    initColorSpectrum,
    renderThemeColorDropdown
} from './color-picker.js';

// Use proper imports for state access
const getCurrentProject = () => getProject();

// ============================================================================
// ACTION HANDLERS (for event delegation)
// ============================================================================

/**
 * Handle theme selection via event delegation
 */
function handleSelectTheme(_event, _element, params) {
  selectTheme(params.theme);
}

/**
 * Handle theme color picker toggle via event delegation
 */
function handleToggleThemeColorPicker(event, _element, params) {
  // Don't toggle if click originated from inside the dropdown
  if (event.target.closest('.theme-color-dropdown')) {
    return;
  }
  toggleThemeColorPicker(params.key);
}

/**
 * Handle color override reset via event delegation
 */
function handleResetColorOverride(event, _element, params) {
  event.stopPropagation();
  resetColorOverride(params.key);
}

// Register theme actions
registerActions({
  'select-theme': handleSelectTheme,
  'toggle-theme-color-picker': handleToggleThemeColorPicker,
  'reset-color-override': handleResetColorOverride
});

/**
 * Update CSS variables to reflect current theme colors
 * This updates slide colors - UI uses separate --ui-* variables
 */
export function updateAppThemeColors() {
    const baseTheme = THEMES[getCurrentProject()?.theme?.base || 'gitlab'];
    const overrides = getCurrentProject()?.theme?.overrides || {};

    if (!baseTheme) return;

    THEME_COLOR_KEYS.forEach(key => {
        const value = overrides[key] || baseTheme.colors[key];
        document.documentElement.style.setProperty(`--${key}`, value);
    });
}

export function renderThemeSelector() {
    const selector = document.getElementById('themeSelector');
    const currentTheme = getCurrentProject().theme?.base || 'gitlab';

    if (!selector) return;

    selector.innerHTML = Object.entries(THEMES).map(([key, theme]) => `
        <button class="theme-option ${key === currentTheme ? 'active' : ''}" data-action="select-theme" data-theme="${key}">
            ${theme.name}
        </button>
    `).join('');
}

export function selectTheme(themeKey) {
    // Use theme-service - handles state mutation, events, and unsaved changes
    changeThemeService(themeKey);
    updateAppThemeColors();
    if (window.App && window.App.renderSettingsPanel) window.App.renderSettingsPanel();
    refreshEditor();
    refreshPreview();
    if (window.App && window.App.initMermaid) window.App.initMermaid(); // Re-init mermaid with new colors
}

// Wrapper functions that pass setColorOverride callback
export function updateFromSpectrum(colorKey, x, y) {
    updateFromSpectrumBase(colorKey, x, y, setColorOverride);
}

export function updateFromHue(colorKey, hue) {
    updateFromHueBase(colorKey, hue, setColorOverride);
}

export function validateAndApplyHex(colorKey, value) {
    validateAndApplyHexBase(colorKey, value, setColorOverride);
}

// Register additional theme color actions
registerActions({
  'close-theme-color-pickers': () => closeAllThemeColorPickers(),
  'confirm-theme-color': (event) => {
    event.stopPropagation();
    closeAllThemeColorPickers();
  },
  'update-hue': (_event, element, params) => updateFromHue(params.key, element.value),
  'validate-hex': (_event, element, params) => validateAndApplyHex(params.key, element.value)
});

// Close all dropdowns
export function closeAllThemeColorPickers() {
    const wasOpen = getActiveColorPicker() !== null;
    document.querySelectorAll('.theme-color-dropdown.open').forEach(el => {
        el.classList.remove('open');
    });
    document.querySelectorAll('.color-item.picker-open').forEach(el => {
        el.classList.remove('picker-open');
    });
    resetPickerState();

    // Re-render list to update overridden state after picker closes
    if (wasOpen) {
        renderColorList();
    }
}

// Revert to original color and close (for Escape key)
export function revertAndCloseThemeColorPicker() {
    const activeKey = getActiveColorPicker();
    if (activeKey) {
        const colorKey = activeKey;

        if (wasColorOverridden() && getOriginalColorValue()) {
            // Was overridden before - restore original override value
            setColorOverride(colorKey, getOriginalColorValue(), true);
        } else {
            // Was not overridden - use service to reset the override to revert to default
            resetColorOverride(colorKey);
        }
    }
    closeAllThemeColorPickers();
}

// Toggle color picker dropdown
export function toggleThemeColorPicker(colorKey) {
    // Close bottom panel color pickers if open
    document.querySelectorAll('.inline-color-dropdown.open, .color-swatches-dropdown.open').forEach(el => {
        el.classList.remove('open');
        el.style.bottom = '';
        el.style.left = '';
        const parent = el.closest('.inline-color-selector') || el.closest('.color-selector-group') || el.closest('.color-item');
        if (parent) parent.classList.remove('picker-open');
    });

    const dropdown = document.getElementById(`themeColorDropdown-${colorKey}`);
    const colorItem = document.querySelector(`.color-item[data-color="${colorKey}"]`);

    if (!dropdown || !colorItem) return;

    const wasOpen = dropdown.classList.contains('open');

    // Close all theme pickers first (without re-render since we're opening a new one)
    document.querySelectorAll('.theme-color-dropdown.open').forEach(el => {
        el.classList.remove('open');
    });
    document.querySelectorAll('#colorList .color-item.picker-open').forEach(el => {
        el.classList.remove('picker-open');
    });

    if (!wasOpen) {
        // Store original color for potential Escape revert
        const currentValue = colorItem.querySelector('.color-value').textContent;
        setOriginalColorValue(currentValue);
        setWasOverridden(colorItem.classList.contains('overridden'));

        // Open this picker
        dropdown.classList.add('open');
        colorItem.classList.add('picker-open');
        setActiveColorPicker(colorKey);

        // Position dropdown
        const rect = colorItem.getBoundingClientRect();
        const dropdownHeight = 260;
        const viewportHeight = window.innerHeight;

        // Position to the right of the color item
        dropdown.style.left = (rect.right + 8) + 'px';

        // Check if dropdown would go below viewport
        if (rect.top + dropdownHeight > viewportHeight) {
            dropdown.style.top = Math.max(8, viewportHeight - dropdownHeight - 8) + 'px';
        } else {
            dropdown.style.top = rect.top + 'px';
        }

        // Initialize spectrum with current color
        const rgb = hexToRgb(currentValue);
        if (rgb) {
            const [h, s, v] = rgbToHsv(...rgb);
            const hueSlider = dropdown.querySelector('.hue-slider');
            if (hueSlider) hueSlider.value = h * 360;

            // Draw spectrum
            setTimeout(() => {
                const canvas = dropdown.querySelector('.color-spectrum');
                if (canvas) {
                    drawColorSpectrum(canvas, h * 360);

                    // Position cursor
                    const cursor = dropdown.querySelector('.color-spectrum-cursor');
                    if (cursor) {
                        cursor.style.left = (s * canvas.width) + 'px';
                        cursor.style.top = ((1 - v) * canvas.height) + 'px';
                    }
                }
            }, 0);
        }
    } else {
        // Clicking same item closes it
        resetPickerState();
        renderColorList();
    }
}

// Handle spectrum mouse events
function handleSpectrumMouseDown(e) {
    if (e.target.classList.contains('color-spectrum')) {
        e.stopPropagation();
        setSpectrumDragging(true);
        const colorKey = e.target.closest('.theme-color-dropdown').id.replace('themeColorDropdown-', '');
        updateFromSpectrum(colorKey, e.clientX, e.clientY);
    }
}

function handleSpectrumMouseMove(e) {
    if (isSpectrumDragging() && getActiveColorPicker()) {
        updateFromSpectrum(getActiveColorPicker(), e.clientX, e.clientY);
    }
}

function handleSpectrumMouseUp() {
    setSpectrumDragging(false);
}

// Initialize event listeners
export function initThemeColorPickerEvents() {
    // Close picker only when clicking outside
    document.addEventListener('click', function(e) {
        if (!getActiveColorPicker()) return;

        // Only close if clicking outside both .color-item and .theme-color-dropdown
        const isInsideColorItem = e.target.closest('.color-item');
        const isInsideDropdown = e.target.closest('.theme-color-dropdown');

        if (!isInsideColorItem && !isInsideDropdown) {
            closeAllThemeColorPickers();
        }
    });

    // Revert and close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && getActiveColorPicker()) {
            revertAndCloseThemeColorPicker();
        }
    });

    // Handle spectrum mouse events
    document.addEventListener('mousedown', handleSpectrumMouseDown);
    document.addEventListener('mousemove', handleSpectrumMouseMove);
    document.addEventListener('mouseup', handleSpectrumMouseUp);
}

export function renderColorList() {
    const list = document.getElementById('colorList');
    const baseTheme = THEMES[getCurrentProject().theme?.base || 'gitlab'];
    const overrides = getCurrentProject().theme?.overrides || {};

    if (!list || !baseTheme) return;

    // Show/hide reset all button based on whether there are overrides
    const resetAllBtn = document.getElementById('resetAllColorsBtn');
    if (resetAllBtn) {
        const hasOverrides = Object.keys(overrides).length > 0;
        resetAllBtn.style.display = hasOverrides ? 'flex' : 'none';
    }

    list.innerHTML = Object.entries(baseTheme.colors).map(([key, defaultValue]) => {
        const currentValue = overrides[key] || defaultValue;
        const isOverridden = key in overrides;

        return `
            <div class="color-item ${isOverridden ? 'overridden' : ''}" data-color="${key}" data-action="toggle-theme-color-picker" data-key="${key}">
                <div class="color-swatch" style="background-color: ${currentValue};"></div>
                <div class="color-info">
                    <div class="color-name">${COLOR_LABELS[key] || key}</div>
                    <div class="color-value">${currentValue}</div>
                </div>
                <button class="color-reset" data-action="reset-color-override" data-key="${key}" title="Réinitialiser">
                    <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
                </button>
                ${renderThemeColorDropdown(key, currentValue)}
            </div>
        `;
    }).join('');
}

export function setColorOverride(colorKey, value, skipListRender = false) {
    // Use theme-service - handles state mutation, events, and unsaved changes
    setColorOverrideService(colorKey, value);
    updateAppThemeColors();
    if (!skipListRender) {
        renderColorList();
    }
    refreshEditor();
    refreshPreview();
}

export function resetColorOverride(colorKey) {
    // Use theme-service - handles state mutation, events, and unsaved changes
    resetColorOverrideService(colorKey);
    updateAppThemeColors();
    renderColorList();
    refreshEditor();
    refreshPreview();
}

export function resetAllColorOverrides() {
    // Use theme-service - handles state mutation, events, and unsaved changes
    resetAllColorsService();
    updateAppThemeColors();
    renderColorList();
    refreshEditor();
    refreshPreview();
}
