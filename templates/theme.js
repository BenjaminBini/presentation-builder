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
 * Generate CSS custom properties from slide colors
 */
function getSlideColorStyles(template, colors) {
  const settings = TEMPLATE_COLOR_SETTINGS[template] || [];
  if (settings.length === 0 || !colors) return "";

  const styles = settings
    .map((setting) => {
      const value = colors[setting.key] || setting.default;
      return `--slide-${setting.key}: var(--${value})`;
    })
    .join("; ");

  return styles ? `style="${styles}"` : "";
}
