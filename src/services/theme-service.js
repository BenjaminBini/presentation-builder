// src/services/theme-service.js
// Theme operations with event emission - no DOM manipulation

import {
  getTheme,
  getThemeBase,
  getThemeOverrides,
  setThemeBase,
  setThemeOverrides,
  setThemeColor,
  removeThemeColor,
  resetThemeColors,
  setHasUnsavedChanges,
  batch
} from '../core/state/index.js';
import { emit, EventTypes } from '../core/events/index.js';

// Theme color keys that can be overridden
export const THEME_COLOR_KEYS = [
  'accent-main', 'accent-alt', 'accent-third',
  'text-main', 'text-alt', 'text-third',
  'bg-main', 'bg-alt', 'bg-third',
  'confirm', 'info', 'warn', 'error'
];

/**
 * Change the base theme
 * @param {string} themeKey - Theme key (e.g., 'gitlab', 'dark', 'light')
 */
export function changeTheme(themeKey) {
  batch(() => {
    setThemeBase(themeKey);
    setThemeOverrides({}); // Reset overrides when changing theme
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.THEME_CHANGED, { theme: themeKey, overrides: {} });
}

/**
 * Set a color override
 * @param {string} colorKey - Color key (e.g., 'accent-main')
 * @param {string} value - Color value (hex)
 */
export function setColorOverride(colorKey, value) {
  batch(() => {
    setThemeColor(colorKey, value);
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.THEME_COLOR_CHANGED, { key: colorKey, value });
  emit(EventTypes.COLOR_CHANGED, { key: colorKey, value });
}

/**
 * Remove a color override (revert to default)
 * @param {string} colorKey - Color key to reset
 */
export function resetColorOverride(colorKey) {
  batch(() => {
    removeThemeColor(colorKey);
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.THEME_COLOR_CHANGED, { key: colorKey, value: null, reset: true });
}

/**
 * Reset all color overrides
 */
export function resetAllColors() {
  batch(() => {
    resetThemeColors();
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.THEME_CHANGED, {
    theme: getThemeBase(),
    overrides: {},
    reset: true
  });
}

/**
 * Get the current effective color value for a key
 * @param {string} colorKey - Color key
 * @param {Object} themes - Available themes object
 * @returns {string|null} Color value or null
 */
export function getEffectiveColor(colorKey, themes) {
  const theme = getTheme();
  const baseTheme = themes?.[theme?.base];
  const overrides = theme?.overrides || {};

  return overrides[colorKey] || baseTheme?.colors?.[colorKey] || null;
}

/**
 * Get all current color values (merged base + overrides)
 * @param {Object} themes - Available themes object
 * @returns {Object} Color key-value pairs
 */
export function getAllColors(themes) {
  const theme = getTheme();
  const baseTheme = themes?.[theme?.base];
  const overrides = theme?.overrides || {};

  if (!baseTheme) {
    return {};
  }

  const colors = {};
  THEME_COLOR_KEYS.forEach(key => {
    colors[key] = overrides[key] || baseTheme.colors[key];
  });

  return colors;
}

/**
 * Check if a color is overridden
 * @param {string} colorKey - Color key
 * @returns {boolean} True if overridden
 */
export function isColorOverridden(colorKey) {
  const overrides = getThemeOverrides() || {};
  return colorKey in overrides;
}

/**
 * Check if any colors are overridden
 * @returns {boolean} True if any overrides exist
 */
export function hasColorOverrides() {
  const overrides = getThemeOverrides() || {};
  return Object.keys(overrides).length > 0;
}

/**
 * Get current theme configuration
 * @returns {Object} Theme configuration
 */
export function getCurrentTheme() {
  return getTheme();
}

/**
 * Get current base theme key
 * @returns {string} Theme key
 */
export function getCurrentThemeBase() {
  return getThemeBase() || 'gitlab';
}

/**
 * Get all color overrides
 * @returns {Object} Color overrides
 */
export function getColorOverrides() {
  return getThemeOverrides() || {};
}
