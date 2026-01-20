// src/config/index.js
// Re-exports all configuration modules
// This file has been split into smaller focused modules for better maintainability

// Theme definitions and color settings
export {
  THEMES,
  GRAY_PALETTE,
  COLOR_LABELS,
  GRAY_LABELS,
  TEMPLATE_COLOR_SETTINGS
} from './themes.js';

// SVG icons for templates
export { ICONS } from './icons.js';

// Template definitions
export { TEMPLATES } from './templates.js';

// Default data for new slides
export { getDefaultData } from './defaults.js';

// Sample project data
export { SAMPLE_PROJECT } from './sample-data.js';
