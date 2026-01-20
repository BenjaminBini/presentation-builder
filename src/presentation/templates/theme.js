// src/templates/theme.js
// Theme utilities for template rendering - ES Module version
// This file should receive data as parameters to stay pure (no core state imports)

import { THEMES, GRAY_PALETTE, TEMPLATE_COLOR_SETTINGS } from '../../config/themes.js';
import { getProject } from '../../core/state.js';

// Use imported config
const getThemes = () => THEMES;
const getGrayPalette = () => GRAY_PALETTE;
const getTemplateColorSettings = () => TEMPLATE_COLOR_SETTINGS;

/**
 * Get the current theme colors (base theme + overrides)
 * @param {Object} [projectTheme] - Optional project theme object { base: string, overrides: Object }
 * @returns {Object} Merged theme colors
 */
export function getThemeColors(projectTheme) {
  // If theme is passed, use it directly (preferred pattern)
  // Fall back to getProject() for backwards compatibility
  let theme = projectTheme;
  if (!theme) {
    const project = getProject();
    theme = project?.theme;
  }
  const themes = getThemes();
  const baseTheme = themes[theme?.base || 'gitlab'];
  const overrides = theme?.overrides || {};
  const colors = { ...(baseTheme?.colors || {}), ...overrides };
  return colors;
}

/**
 * Get a specific theme color by name
 * @param {string} colorName - Color name (e.g., 'accent-main', 'gray-500')
 * @returns {string} Hex color value
 */
export function getThemeColor(colorName) {
  const themeColors = getThemeColors();
  const grayPalette = getGrayPalette();
  return themeColors[colorName] || grayPalette[colorName] || colorName;
}

/**
 * Resolve a theme color reference to its actual value
 * @param {string} colorRef - Color reference (name or hex)
 * @returns {string} Resolved hex color value
 */
export function resolveThemeColor(colorRef) {
  if (!colorRef) return '';
  // If it's already a hex color, return as-is
  if (colorRef.startsWith('#')) return colorRef;
  // Otherwise resolve from theme
  return getThemeColor(colorRef);
}

/**
 * Lighten a hex color by a percentage (0-100)
 * @param {string} hex - Hex color value
 * @param {number} percent - Percentage to lighten (0-100)
 * @returns {string} Lightened hex color
 */
export function lightenColor(hex, percent) {
  if (!hex) return hex;
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100));
  const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent / 100));
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Generate a gradient CSS value from a color name
 * @param {string} colorName - Color name from theme
 * @returns {string} CSS gradient or variable
 */
export function generateGradient(colorName) {
  const themeColors = getThemeColors();
  const grayPalette = getGrayPalette();
  const baseColor = themeColors[colorName] || grayPalette[colorName];
  if (!baseColor) return `var(--${colorName})`;

  const endColor = lightenColor(baseColor, 15);
  return `linear-gradient(135deg, ${baseColor} 0%, ${endColor} 100%)`;
}

// Keys that should generate gradients instead of solid colors
export const GRADIENT_COLOR_KEYS = {
  bgColor: true,
  numberColor: ['agenda']
};

/**
 * Check if a color key should generate a gradient for a given template
 * @param {string} key - Color key
 * @param {string} template - Template name
 * @returns {boolean}
 */
export function shouldGenerateGradient(key, template) {
  const config = GRADIENT_COLOR_KEYS[key];
  if (config === true) return true;
  if (Array.isArray(config)) return config.includes(template);
  return false;
}

/**
 * Generate CSS custom properties from slide colors
 * @param {string} template - Template name
 * @param {Object} colors - Slide color overrides
 * @returns {string} Style attribute string or empty
 */
export function getSlideColorStyles(template, colors) {
  const templateColorSettings = getTemplateColorSettings();
  const settings = templateColorSettings[template] || [];
  if (settings.length === 0 || !colors) return '';

  const styles = settings
    .filter((setting) => colors[setting.key])
    .map((setting) => {
      const value = colors[setting.key];
      if (shouldGenerateGradient(setting.key, template)) {
        return `--slide-${setting.key}: ${generateGradient(value)}`;
      }
      return `--slide-${setting.key}: var(--${value})`;
    })
    .join('; ');

  return styles ? `style="${styles}"` : '';
}
