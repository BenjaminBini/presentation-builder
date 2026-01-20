// src/services/theme-service.js
// Theme operations with event emission - no DOM manipulation

import {
  getThemeBase,
  setThemeBase,
  setThemeOverrides,
  setThemeColor,
  removeThemeColor,
  resetThemeColors,
  setHasUnsavedChanges,
  batch
} from '../domain/state/index.js';
import { emit, EventTypes } from '../domain/events/index.js';

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

// Note: Simple getters removed - use domain/state/selectors.js directly:
// - getTheme() for current theme configuration
// - getThemeBase() for base theme key
// - getThemeOverrides() for color overrides
