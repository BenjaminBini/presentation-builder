// templates/theme.js
// Theme utilities for template rendering
// Requires: slide-editor-config.js (THEMES, TEMPLATE_COLOR_SETTINGS)

/**
 * Get the current theme colors (base theme + overrides)
 */
function getThemeColors() {
  const baseTheme = THEMES[currentProject.theme?.base || "gitlab"];
  const overrides = currentProject.theme?.overrides || {};
  const colors = { ...baseTheme.colors, ...overrides };
  return colors;
}

/**
 * Lighten a hex color by a percentage (0-100)
 */
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100));
  const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent / 100));
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Generate a gradient CSS value from a color name
 */
function generateGradient(colorName) {
  const themeColors = getThemeColors();
  const baseColor = themeColors[colorName] || GRAY_PALETTE[colorName];
  if (!baseColor) return `var(--${colorName})`;

  const endColor = lightenColor(baseColor, 15);
  return `linear-gradient(135deg, ${baseColor} 0%, ${endColor} 100%)`;
}

// Keys that should generate gradients instead of solid colors
const GRADIENT_COLOR_KEYS = {
  bgColor: true,           // Background (section, etc.)
  numberColor: ['agenda']  // Number bullets (only for agenda template)
};

/**
 * Check if a color key should generate a gradient for a given template
 */
function shouldGenerateGradient(key, template) {
  const config = GRADIENT_COLOR_KEYS[key];
  if (config === true) return true;
  if (Array.isArray(config)) return config.includes(template);
  return false;
}

/**
 * Generate CSS custom properties from slide colors
 * Only applies explicitly set colors, not defaults (to preserve CSS fallbacks like gradients)
 */
function getSlideColorStyles(template, colors) {
  const settings = TEMPLATE_COLOR_SETTINGS[template] || [];
  if (settings.length === 0 || !colors) return "";

  const styles = settings
    .filter((setting) => colors[setting.key])
    .map((setting) => {
      const value = colors[setting.key];
      // Generate gradient for certain color keys
      if (shouldGenerateGradient(setting.key, template)) {
        return `--slide-${setting.key}: ${generateGradient(value)}`;
      }
      return `--slide-${setting.key}: var(--${value})`;
    })
    .join("; ");

  return styles ? `style="${styles}"` : "";
}
