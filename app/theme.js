// app/theme.js
// Theme selection and color management

// Theme color keys that can be overridden
const THEME_COLOR_KEYS = [
    'accent-main', 'accent-alt', 'accent-third',
    'text-main', 'text-alt', 'text-third',
    'bg-main', 'bg-alt', 'bg-third',
    'confirm', 'info', 'warn', 'error'
];

/**
 * Update CSS variables to reflect current theme colors
 * This updates slide colors - UI uses separate --ui-* variables
 */
window.updateAppThemeColors = function() {
    const baseTheme = THEMES[window.currentProject?.theme?.base || 'gitlab'];
    const overrides = window.currentProject?.theme?.overrides || {};

    THEME_COLOR_KEYS.forEach(key => {
        const value = overrides[key] || baseTheme.colors[key];
        document.documentElement.style.setProperty(`--${key}`, value);
    });
};

window.renderThemeSelector = function() {
    const selector = document.getElementById('themeSelector');
    const currentTheme = window.currentProject.theme?.base || 'gitlab';

    selector.innerHTML = Object.entries(THEMES).map(([key, theme]) => `
        <button class="theme-option ${key === currentTheme ? 'active' : ''}" onclick="selectTheme('${key}')">
            ${theme.name}
        </button>
    `).join('');
};

window.selectTheme = function(themeKey) {
    if (!window.currentProject.theme) {
        window.currentProject.theme = { base: 'gitlab', overrides: {} };
    }
    window.currentProject.theme.base = themeKey;
    window.currentProject.theme.overrides = {}; // Reset overrides when changing theme
    updateAppThemeColors();
    renderSettingsPanel();
    renderEditor();
    updatePreview();
    window.initMermaid(); // Re-init mermaid with new colors
    window.markAsChanged();
    showToast('Thème appliqué');
};

// Track active color picker
window._activeColorPicker = null;
window._spectrumDragging = false;
window._originalColorValue = null; // Store original value for Escape revert
window._wasOverridden = false; // Track if color was overridden before opening

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
window.drawColorSpectrum = function(canvas, hue) {
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
};

// Initialize spectrum for a color key
window.initColorSpectrum = function(colorKey) {
    const canvas = document.querySelector(`#themeColorDropdown-${colorKey} .color-spectrum`);
    if (!canvas) return;

    const hueSlider = document.querySelector(`#themeColorDropdown-${colorKey} .hue-slider`);
    const hue = parseFloat(hueSlider?.value || 0);
    drawColorSpectrum(canvas, hue);
};

// Update color from spectrum position
window.updateFromSpectrum = function(colorKey, x, y) {
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
};

// Update from hue slider
window.updateFromHue = function(colorKey, hue) {
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
};

// Validate and apply hex color
window.validateAndApplyHex = function(colorKey, value) {
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
};

// Render dropdown HTML
window.renderThemeColorDropdown = function(colorKey, currentValue) {
    return `
        <div class="theme-color-dropdown" id="themeColorDropdown-${colorKey}" onclick="event.stopPropagation()">
            <div class="color-spectrum-container">
                <canvas class="color-spectrum" width="200" height="150"></canvas>
                <div class="color-spectrum-cursor"></div>
            </div>
            <div class="hue-slider-container">
                <input type="range" class="hue-slider" min="0" max="360" value="0"
                    oninput="updateFromHue('${colorKey}', this.value)">
            </div>
            <div class="hex-input-row">
                <span class="hex-preview-swatch" style="background-color: ${currentValue}" onclick="closeAllThemeColorPickers()"></span>
                <input type="text" class="hex-input" value="${currentValue}" maxlength="7"
                    oninput="validateAndApplyHex('${colorKey}', this.value)"
                    onkeydown="if(event.key === 'Enter') { validateAndApplyHex('${colorKey}', this.value); closeAllThemeColorPickers(); }">
            </div>
        </div>
    `;
};

// Close all dropdowns
window.closeAllThemeColorPickers = function() {
    const wasOpen = window._activeColorPicker !== null;
    document.querySelectorAll('.theme-color-dropdown.open').forEach(el => {
        el.classList.remove('open');
    });
    document.querySelectorAll('.color-item.picker-open').forEach(el => {
        el.classList.remove('picker-open');
    });
    window._activeColorPicker = null;
    window._originalColorValue = null;
    window._wasOverridden = false;

    // Re-render list to update overridden state after picker closes
    if (wasOpen) {
        renderColorList();
    }
};

// Revert to original color and close (for Escape key)
window.revertAndCloseThemeColorPicker = function() {
    if (window._activeColorPicker) {
        const colorKey = window._activeColorPicker;

        if (window._wasOverridden && window._originalColorValue) {
            // Was overridden before - restore original override value
            setColorOverride(colorKey, window._originalColorValue, true);
        } else {
            // Was not overridden - delete the override to revert to default
            if (window.currentProject.theme?.overrides) {
                delete window.currentProject.theme.overrides[colorKey];
                updateAppThemeColors();
                renderEditor();
                updatePreview();
            }
        }
    }
    closeAllThemeColorPickers();
};

// Toggle color picker dropdown
window.toggleThemeColorPicker = function(colorKey) {
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
        window._originalColorValue = currentValue;
        window._wasOverridden = colorItem.classList.contains('overridden');

        // Open this picker
        dropdown.classList.add('open');
        colorItem.classList.add('picker-open');
        window._activeColorPicker = colorKey;

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
        window._activeColorPicker = null;
        window._originalColorValue = null;
        window._wasOverridden = false;
        renderColorList();
    }
};

// Close picker only when clicking outside
document.addEventListener('click', function(e) {
    if (!window._activeColorPicker) return;

    // Only close if clicking outside both .color-item and .theme-color-dropdown
    const isInsideColorItem = e.target.closest('.color-item');
    const isInsideDropdown = e.target.closest('.theme-color-dropdown');

    if (!isInsideColorItem && !isInsideDropdown) {
        closeAllThemeColorPickers();
    }
});

// Revert and close on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && window._activeColorPicker) {
        revertAndCloseThemeColorPicker();
    }
});

// Handle spectrum mouse events
document.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('color-spectrum')) {
        window._spectrumDragging = true;
        const colorKey = e.target.closest('.theme-color-dropdown').id.replace('themeColorDropdown-', '');
        updateFromSpectrum(colorKey, e.clientX, e.clientY);
    }
});

document.addEventListener('mousemove', function(e) {
    if (window._spectrumDragging && window._activeColorPicker) {
        updateFromSpectrum(window._activeColorPicker, e.clientX, e.clientY);
    }
});

document.addEventListener('mouseup', function() {
    window._spectrumDragging = false;
});

window.renderColorList = function() {
    const list = document.getElementById('colorList');
    const baseTheme = THEMES[window.currentProject.theme?.base || 'gitlab'];
    const overrides = window.currentProject.theme?.overrides || {};

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
            <div class="color-item ${isOverridden ? 'overridden' : ''}" data-color="${key}" onclick="toggleThemeColorPicker('${key}')">
                <div class="color-swatch" style="background-color: ${currentValue};"></div>
                <div class="color-info">
                    <div class="color-name">${COLOR_LABELS[key] || key}</div>
                    <div class="color-value">${currentValue}</div>
                </div>
                <button class="color-reset" onclick="event.stopPropagation(); resetColorOverride('${key}')" title="Réinitialiser">
                    <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
                </button>
                ${renderThemeColorDropdown(key, currentValue)}
            </div>
        `;
    }).join('');
};

window.setColorOverride = function(colorKey, value, skipListRender = false) {
    if (!window.currentProject.theme) {
        window.currentProject.theme = { base: 'gitlab', overrides: {} };
    }
    if (!window.currentProject.theme.overrides) {
        window.currentProject.theme.overrides = {};
    }
    window.currentProject.theme.overrides[colorKey] = value;
    updateAppThemeColors();
    if (!skipListRender) {
        renderColorList();
    }
    renderEditor();
    updatePreview();
    window.markAsChanged();
};

window.resetColorOverride = function(colorKey) {
    if (window.currentProject.theme?.overrides) {
        delete window.currentProject.theme.overrides[colorKey];
        updateAppThemeColors();
        renderColorList();
        renderEditor();
        updatePreview();
        window.markAsChanged();
        showToast('Couleur réinitialisée');
    }
};

window.resetAllColorOverrides = function() {
    if (window.currentProject.theme?.overrides && Object.keys(window.currentProject.theme.overrides).length > 0) {
        window.currentProject.theme.overrides = {};
        updateAppThemeColors();
        renderColorList();
        renderEditor();
        updatePreview();
        window.markAsChanged();
        showToast('Toutes les couleurs réinitialisées');
    }
};
