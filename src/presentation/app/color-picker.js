// src/app/color-picker.js
// Color conversion utilities and color picker UI for theme customization


// Track active color picker state
let _activeColorPicker = null;
let _spectrumDragging = false;
let _originalColorValue = null;
let _wasOverridden = false;

// ============================================================================
// COLOR CONVERSION UTILITIES
// ============================================================================

/**
 * HSV to RGB conversion
 * @param {number} h - Hue (0-1)
 * @param {number} s - Saturation (0-1)
 * @param {number} v - Value (0-1)
 * @returns {number[]} RGB values [0-255, 0-255, 0-255]
 */
export function hsvToRgb(h, s, v) {
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

/**
 * RGB to HSV conversion
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {number[]} HSV values [0-1, 0-1, 0-1]
 */
export function rgbToHsv(r, g, b) {
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

/**
 * Hex to RGB conversion
 * @param {string} hex - Hex color string (#RRGGBB)
 * @returns {number[]|null} RGB values or null if invalid
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

/**
 * RGB to Hex conversion
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string (#RRGGBB)
 */
export function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

// ============================================================================
// COLOR SPECTRUM RENDERING
// ============================================================================

/**
 * Draw color spectrum canvas
 * @param {HTMLCanvasElement} canvas - Canvas element to draw on
 * @param {number} hue - Current hue value (0-360)
 */
export function drawColorSpectrum(canvas, hue) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

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

/**
 * Initialize spectrum for a color key
 * @param {string} colorKey - The color key identifier
 */
export function initColorSpectrum(colorKey) {
    const canvas = document.querySelector(`#themeColorDropdown-${colorKey} .color-spectrum`);
    if (!canvas) return;

    const hueSlider = document.querySelector(`#themeColorDropdown-${colorKey} .hue-slider`);
    const hue = parseFloat(hueSlider?.value || 0);
    drawColorSpectrum(canvas, hue);
}

// ============================================================================
// COLOR PICKER INTERACTIONS
// ============================================================================

/**
 * Update color from spectrum position
 * @param {string} colorKey - The color key identifier
 * @param {number} x - Mouse X position
 * @param {number} y - Mouse Y position
 * @param {Function} setColorOverride - Callback to set color override
 */
export function updateFromSpectrum(colorKey, x, y, setColorOverride) {
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

    cursor.style.left = clampedX + 'px';
    cursor.style.top = clampedY + 'px';

    if (hexInput) hexInput.value = hex;
    if (previewSwatch) previewSwatch.style.backgroundColor = hex;

    const colorItem = document.querySelector(`.color-item[data-color="${colorKey}"]`);
    if (colorItem) {
        colorItem.querySelector('.color-swatch').style.backgroundColor = hex;
        colorItem.querySelector('.color-value').textContent = hex;
    }

    setColorOverride(colorKey, hex, true);
}

/**
 * Update from hue slider
 * @param {string} colorKey - The color key identifier
 * @param {number} hue - New hue value (0-360)
 * @param {Function} setColorOverride - Callback to set color override
 */
export function updateFromHue(colorKey, hue, setColorOverride) {
    const canvas = document.querySelector(`#themeColorDropdown-${colorKey} .color-spectrum`);
    const cursor = document.querySelector(`#themeColorDropdown-${colorKey} .color-spectrum-cursor`);
    const hexInput = document.querySelector(`#themeColorDropdown-${colorKey} .hex-input`);
    const previewSwatch = document.querySelector(`#themeColorDropdown-${colorKey} .hex-preview-swatch`);

    if (!canvas) return;

    drawColorSpectrum(canvas, hue);

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

        const colorItem = document.querySelector(`.color-item[data-color="${colorKey}"]`);
        if (colorItem) {
            colorItem.querySelector('.color-swatch').style.backgroundColor = hex;
            colorItem.querySelector('.color-value').textContent = hex;
        }

        setColorOverride(colorKey, hex, true);
    }
}

/**
 * Validate and apply hex color
 * @param {string} colorKey - The color key identifier
 * @param {string} value - Hex value from input
 * @param {Function} setColorOverride - Callback to set color override
 */
export function validateAndApplyHex(colorKey, value, setColorOverride) {
    const hexInput = document.querySelector(`#themeColorDropdown-${colorKey} .hex-input`);
    const previewSwatch = document.querySelector(`#themeColorDropdown-${colorKey} .hex-preview-swatch`);

    let hex = value.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;

    const isValid = /^#[0-9A-Fa-f]{6}$/.test(hex);

    if (hexInput) {
        hexInput.classList.toggle('invalid', !isValid);
    }

    if (isValid) {
        hex = hex.toUpperCase();
        if (hexInput) hexInput.value = hex;
        if (previewSwatch) previewSwatch.style.backgroundColor = hex;

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

        const colorItem = document.querySelector(`.color-item[data-color="${colorKey}"]`);
        if (colorItem) {
            colorItem.querySelector('.color-swatch').style.backgroundColor = hex;
            colorItem.querySelector('.color-value').textContent = hex;
        }

        setColorOverride(colorKey, hex, true);
    }
}

// ============================================================================
// COLOR PICKER DROPDOWN UI
// ============================================================================

/**
 * Render dropdown HTML
 * @param {string} colorKey - The color key identifier
 * @param {string} currentValue - Current hex color value
 * @returns {string} HTML string for the dropdown
 */
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

// ============================================================================
// COLOR PICKER STATE MANAGEMENT
// ============================================================================

/**
 * Get active color picker key
 * @returns {string|null} Active color picker key or null
 */
export function getActiveColorPicker() {
    return _activeColorPicker;
}

/**
 * Set active color picker key
 * @param {string|null} key - Color key or null to clear
 */
export function setActiveColorPicker(key) {
    _activeColorPicker = key;
}

/**
 * Get spectrum dragging state
 * @returns {boolean} Whether spectrum is being dragged
 */
export function isSpectrumDragging() {
    return _spectrumDragging;
}

/**
 * Set spectrum dragging state
 * @param {boolean} dragging - Dragging state
 */
export function setSpectrumDragging(dragging) {
    _spectrumDragging = dragging;
}

/**
 * Get original color value (for Escape revert)
 * @returns {string|null} Original color value
 */
export function getOriginalColorValue() {
    return _originalColorValue;
}

/**
 * Set original color value
 * @param {string|null} value - Original color value
 */
export function setOriginalColorValue(value) {
    _originalColorValue = value;
}

/**
 * Get was overridden state
 * @returns {boolean} Whether color was overridden before opening
 */
export function wasColorOverridden() {
    return _wasOverridden;
}

/**
 * Set was overridden state
 * @param {boolean} overridden - Overridden state
 */
export function setWasOverridden(overridden) {
    _wasOverridden = overridden;
}

/**
 * Reset all picker state
 */
export function resetPickerState() {
    _activeColorPicker = null;
    _originalColorValue = null;
    _wasOverridden = false;
}
