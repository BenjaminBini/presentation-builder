// src/app/theme.js
// Theme selection and color management - ES6 module version

import { registerActions } from '../core/event-delegation.js';

// Use window globals for state access (set by main.js)
const getCurrentProject = () => window.currentProject;
const markAsChanged = () => window.markAsChanged && window.markAsChanged();

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
function handleToggleThemeColorPicker(_event, _element, params) {
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

// Theme color keys that can be overridden
const THEME_COLOR_KEYS = [
    'accent-main', 'accent-alt', 'accent-third',
    'text-main', 'text-alt', 'text-third',
    'bg-main', 'bg-alt', 'bg-third',
    'confirm', 'info', 'warn', 'error'
];

// Track active color picker
let _activeColorPicker = null;
let _spectrumDragging = false;
let _originalColorValue = null; // Store original value for Escape revert
let _wasOverridden = false; // Track if color was overridden before opening

/**
 * Update CSS variables to reflect current theme colors
 * This updates slide colors - UI uses separate --ui-* variables
 */
export function updateAppThemeColors() {
    const THEMES = window.THEMES || {};
    const baseTheme = THEMES[getCurrentProject()?.theme?.base || 'gitlab'];
    const overrides = getCurrentProject()?.theme?.overrides || {};

    if (!baseTheme) return;

    THEME_COLOR_KEYS.forEach(key => {
        const value = overrides[key] || baseTheme.colors[key];
        document.documentElement.style.setProperty(`--${key}`, value);
    });
}

export function renderThemeSelector() {
    const THEMES = window.THEMES || {};
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
    if (!getCurrentProject().theme) {
        getCurrentProject().theme = { base: 'gitlab', overrides: {} };
    }
    getCurrentProject().theme.base = themeKey;
    getCurrentProject().theme.overrides = {}; // Reset overrides when changing theme
    updateAppThemeColors();
    if (window.renderSettingsPanel) window.renderSettingsPanel();
    if (window.renderEditor) window.renderEditor();
    if (window.updatePreview) window.updatePreview();
    if (window.initMermaid) window.initMermaid(); // Re-init mermaid with new colors
    markAsChanged();
}

// HSV to RGB conversion
function hsvToRgb(h, s, v) {
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// RGB to HSV conversion
function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, v];
}

// Hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

// RGB to Hex
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

// Draw color spectrum canvas
export function drawColorSpectrum(canvas, hue) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Draw saturation/brightness gradient
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const s = x / width;
            const v = 1 - (y / height);
            const [r, g, b] = hsvToRgb(hue / 360, s, v);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

// Initialize spectrum for a color key
export function initColorSpectrum(colorKey) {
    const canvas = document.querySelector(`#themeColorDropdown-${colorKey} .color-spectrum`);
    if (!canvas) return;

    const hueSlider = document.querySelector(`#themeColorDropdown-${colorKey} .hue-slider`);
    const hue = parseFloat(hueSlider?.value || 0);
    drawColorSpectrum(canvas, hue);
}

// Update color from spectrum position
export function updateFromSpectrum(colorKey, x, y) {
    const canvas = document.querySelector(`#themeColorDropdown-${colorKey} .color-spectrum`);
    const cursor = document.querySelector(`#themeColorDropdown-${colorKey} .color-spectrum-cursor`);
    const hueSlider = document.querySelector(`#themeColorDropdown-${colorKey} .hue-slider`);
    const hexInput = document.querySelector(`#themeColorDropdown-${colorKey} .hex-input`);
    const previewSwatch = document.querySelector(`#themeColorDropdown-${colorKey} .hex-preview-swatch`);

    if (!canvas || !cursor || !hueSlider) return;

    const rect = canvas.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(x - rect.left, rect.width));
    const clampedY = Math.max(0, Math.min(y - rect.top, rect.height));

    const s = clampedX / rect.width;
    const v = 1 - (clampedY / rect.height);
    const hue = parseFloat(hueSlider.value) / 360;

    const [r, g, b] = hsvToRgb(hue, s, v);
    const hex = rgbToHex(r, g, b);

    // Update cursor position
    cursor.style.left = clampedX + 'px';
    cursor.style.top = clampedY + 'px';

    // Update hex input and preview
    if (hexInput) hexInput.value = hex;
    if (previewSwatch) previewSwatch.style.backgroundColor = hex;

    // Update color swatch in list
    const colorItem = document.querySelector(`.color-item[data-color="${colorKey}"]`);
    if (colorItem) {
        colorItem.querySelector('.color-swatch').style.backgroundColor = hex;
        colorItem.querySelector('.color-value').textContent = hex;
    }

    // Apply color (skip list re-render to keep picker open)
    setColorOverride(colorKey, hex, true);
}

// Update from hue slider
export function updateFromHue(colorKey, hue) {
    const canvas = document.querySelector(`#themeColorDropdown-${colorKey} .color-spectrum`);
    const cursor = document.querySelector(`#themeColorDropdown-${colorKey} .color-spectrum-cursor`);
    const hexInput = document.querySelector(`#themeColorDropdown-${colorKey} .hex-input`);
    const previewSwatch = document.querySelector(`#themeColorDropdown-${colorKey} .hex-preview-swatch`);

    if (!canvas) return;

    // Redraw spectrum with new hue
    drawColorSpectrum(canvas, hue);

    // Get current cursor position and recalculate color
    if (cursor) {
        const rect = canvas.getBoundingClientRect();
        const cursorLeft = parseFloat(cursor.style.left) || rect.width / 2;
        const cursorTop = parseFloat(cursor.style.top) || 0;

        const s = cursorLeft / rect.width;
        const v = 1 - (cursorTop / rect.height);

        const [r, g, b] = hsvToRgb(hue / 360, s, v);
        const hex = rgbToHex(r, g, b);

        if (hexInput) hexInput.value = hex;
        if (previewSwatch) previewSwatch.style.backgroundColor = hex;

        // Update color swatch in list
        const colorItem = document.querySelector(`.color-item[data-color="${colorKey}"]`);
        if (colorItem) {
            colorItem.querySelector('.color-swatch').style.backgroundColor = hex;
            colorItem.querySelector('.color-value').textContent = hex;
        }

        // Skip list re-render to keep picker open
        setColorOverride(colorKey, hex, true);
    }
}

// Validate and apply hex color
export function validateAndApplyHex(colorKey, value) {
    const hexInput = document.querySelector(`#themeColorDropdown-${colorKey} .hex-input`);
    const previewSwatch = document.querySelector(`#themeColorDropdown-${colorKey} .hex-preview-swatch`);

    // Normalize: add # if missing
    let hex = value.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;

    // Validate hex format
    const isValid = /^#[0-9A-Fa-f]{6}$/.test(hex);

    if (hexInput) {
        hexInput.classList.toggle('invalid', !isValid);
    }

    if (isValid) {
        hex = hex.toUpperCase();
        if (hexInput) hexInput.value = hex;
        if (previewSwatch) previewSwatch.style.backgroundColor = hex;

        // Update spectrum cursor position based on hex
        const rgb = hexToRgb(hex);
        if (rgb) {
            const [h, s, v] = rgbToHsv(...rgb);
            const hueSlider = document.querySelector(`#themeColorDropdown-${colorKey} .hue-slider`);
            const canvas = document.querySelector(`#themeColorDropdown-${colorKey} .color-spectrum`);
            const cursor = document.querySelector(`#themeColorDropdown-${colorKey} .color-spectrum-cursor`);

            if (hueSlider) {
                hueSlider.value = h * 360;
                drawColorSpectrum(canvas, h * 360);
            }

            if (cursor && canvas) {
                const rect = canvas.getBoundingClientRect();
                cursor.style.left = (s * rect.width) + 'px';
                cursor.style.top = ((1 - v) * rect.height) + 'px';
            }
        }

        // Update color swatch in list
        const colorItem = document.querySelector(`.color-item[data-color="${colorKey}"]`);
        if (colorItem) {
            colorItem.querySelector('.color-swatch').style.backgroundColor = hex;
            colorItem.querySelector('.color-value').textContent = hex;
        }

        // Skip list re-render to keep picker open
        setColorOverride(colorKey, hex, true);
    }
}

// Render dropdown HTML
export function renderThemeColorDropdown(colorKey, currentValue) {
    return `
        <div class="theme-color-dropdown" id="themeColorDropdown-${colorKey}" data-color-key="${colorKey}">
            <div class="color-spectrum-container">
                <canvas class="color-spectrum" width="200" height="150"></canvas>
                <div class="color-spectrum-cursor"></div>
            </div>
            <div class="hue-slider-container">
                <input type="range" class="hue-slider" min="0" max="360" value="0"
                    data-input-action="update-hue" data-key="${colorKey}">
            </div>
            <div class="hex-input-row">
                <span class="hex-preview-swatch" style="background-color: ${currentValue}" data-action="close-theme-color-pickers"></span>
                <input type="text" class="hex-input" value="${currentValue}" maxlength="7"
                    data-input-action="validate-hex" data-key="${colorKey}">
            </div>
        </div>
    `;
}

// Register additional theme color actions
registerActions({
  'close-theme-color-pickers': () => closeAllThemeColorPickers(),
  'update-hue': (_event, element, params) => updateFromHue(params.key, element.value),
  'validate-hex': (_event, element, params) => validateAndApplyHex(params.key, element.value)
});

// Close all dropdowns
export function closeAllThemeColorPickers() {
    const wasOpen = _activeColorPicker !== null;
    document.querySelectorAll('.theme-color-dropdown.open').forEach(el => {
        el.classList.remove('open');
    });
    document.querySelectorAll('.color-item.picker-open').forEach(el => {
        el.classList.remove('picker-open');
    });
    _activeColorPicker = null;
    _originalColorValue = null;
    _wasOverridden = false;

    // Re-render list to update overridden state after picker closes
    if (wasOpen) {
        renderColorList();
    }
}

// Revert to original color and close (for Escape key)
export function revertAndCloseThemeColorPicker() {
    if (_activeColorPicker) {
        const colorKey = _activeColorPicker;

        if (_wasOverridden && _originalColorValue) {
            // Was overridden before - restore original override value
            setColorOverride(colorKey, _originalColorValue, true);
        } else {
            // Was not overridden - delete the override to revert to default
            if (getCurrentProject().theme?.overrides) {
                delete getCurrentProject().theme.overrides[colorKey];
                updateAppThemeColors();
                if (window.renderEditor) window.renderEditor();
                if (window.updatePreview) window.updatePreview();
            }
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
        _originalColorValue = currentValue;
        _wasOverridden = colorItem.classList.contains('overridden');

        // Open this picker
        dropdown.classList.add('open');
        colorItem.classList.add('picker-open');
        _activeColorPicker = colorKey;

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
        _activeColorPicker = null;
        _originalColorValue = null;
        _wasOverridden = false;
        renderColorList();
    }
}

// Handle spectrum mouse events
function handleSpectrumMouseDown(e) {
    if (e.target.classList.contains('color-spectrum')) {
        _spectrumDragging = true;
        const colorKey = e.target.closest('.theme-color-dropdown').id.replace('themeColorDropdown-', '');
        updateFromSpectrum(colorKey, e.clientX, e.clientY);
    }
}

function handleSpectrumMouseMove(e) {
    if (_spectrumDragging && _activeColorPicker) {
        updateFromSpectrum(_activeColorPicker, e.clientX, e.clientY);
    }
}

function handleSpectrumMouseUp() {
    _spectrumDragging = false;
}

// Initialize event listeners
export function initThemeColorPickerEvents() {
    // Close picker only when clicking outside
    document.addEventListener('click', function(e) {
        if (!_activeColorPicker) return;

        // Only close if clicking outside both .color-item and .theme-color-dropdown
        const isInsideColorItem = e.target.closest('.color-item');
        const isInsideDropdown = e.target.closest('.theme-color-dropdown');

        if (!isInsideColorItem && !isInsideDropdown) {
            closeAllThemeColorPickers();
        }
    });

    // Revert and close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && _activeColorPicker) {
            revertAndCloseThemeColorPicker();
        }
    });

    // Handle spectrum mouse events
    document.addEventListener('mousedown', handleSpectrumMouseDown);
    document.addEventListener('mousemove', handleSpectrumMouseMove);
    document.addEventListener('mouseup', handleSpectrumMouseUp);
}

export function renderColorList() {
    const THEMES = window.THEMES || {};
    const COLOR_LABELS = window.COLOR_LABELS || {};
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
    if (!getCurrentProject().theme) {
        getCurrentProject().theme = { base: 'gitlab', overrides: {} };
    }
    if (!getCurrentProject().theme.overrides) {
        getCurrentProject().theme.overrides = {};
    }
    getCurrentProject().theme.overrides[colorKey] = value;
    updateAppThemeColors();
    if (!skipListRender) {
        renderColorList();
    }
    if (window.renderEditor) window.renderEditor();
    if (window.updatePreview) window.updatePreview();
    markAsChanged();
}

export function resetColorOverride(colorKey) {
    if (getCurrentProject().theme?.overrides) {
        delete getCurrentProject().theme.overrides[colorKey];
        updateAppThemeColors();
        renderColorList();
        if (window.renderEditor) window.renderEditor();
        if (window.updatePreview) window.updatePreview();
        markAsChanged();
    }
}

export function resetAllColorOverrides() {
    if (getCurrentProject().theme?.overrides && Object.keys(getCurrentProject().theme.overrides).length > 0) {
        getCurrentProject().theme.overrides = {};
        updateAppThemeColors();
        renderColorList();
        if (window.renderEditor) window.renderEditor();
        if (window.updatePreview) window.updatePreview();
        markAsChanged();
    }
}
