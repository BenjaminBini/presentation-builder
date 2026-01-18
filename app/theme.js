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

window.renderColorList = function() {
    const list = document.getElementById('colorList');
    const baseTheme = THEMES[window.currentProject.theme?.base || 'gitlab'];
    const overrides = window.currentProject.theme?.overrides || {};

    list.innerHTML = Object.entries(baseTheme.colors).map(([key, defaultValue]) => {
        const currentValue = overrides[key] || defaultValue;
        const isOverridden = key in overrides;

        return `
            <div class="color-item ${isOverridden ? 'overridden' : ''}" data-color="${key}">
                <div class="color-swatch" style="background-color: ${currentValue};">
                    <input type="color" value="${currentValue}" oninput="setColorOverride('${key}', this.value)">
                </div>
                <div class="color-info">
                    <div class="color-name">${COLOR_LABELS[key] || key}</div>
                    <div class="color-value">${currentValue}</div>
                </div>
                <button class="color-reset" onclick="resetColorOverride('${key}')" title="Réinitialiser">
                    <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
            </div>
        `;
    }).join('');
};

window.setColorOverride = function(colorKey, value) {
    if (!window.currentProject.theme) {
        window.currentProject.theme = { base: 'gitlab', overrides: {} };
    }
    if (!window.currentProject.theme.overrides) {
        window.currentProject.theme.overrides = {};
    }
    window.currentProject.theme.overrides[colorKey] = value;
    updateAppThemeColors();
    renderColorList();
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
