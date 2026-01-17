# Modular CSS Architecture

This directory contains the refactored, modular CSS structure for the Slide Editor application.

## Overview

The original monolithic `slide-editor-styles.css` (3,452 lines) has been split into 19 modular CSS files organized by function and purpose. All files are under 400 lines for better maintainability.

## Directory Structure

```
styles/
├── base/                   # Foundation styles
│   ├── reset.css          # CSS reset and base element styles (32 lines)
│   ├── typography.css     # Font styles and icon definitions (34 lines)
│   └── variables.css      # CSS custom properties (31 lines)
├── layout/                 # Layout components
│   ├── grid.css           # Grid and flexbox utilities (83 lines)
│   ├── header.css         # Header and toolbar styles (130 lines)
│   ├── panels.css         # Preview and editor panel styles (230 lines)
│   ├── sidebar-main.css   # Main sidebar navigation (366 lines)
│   └── sidebar-settings.css # Sidebar settings panel (140 lines)
├── components/             # Reusable UI components
│   ├── buttons.css        # Button styles (113 lines)
│   ├── code-editors.css   # Code editor components (287 lines)
│   ├── color-pickers.css  # Color picker widgets (212 lines)
│   ├── forms.css          # Form inputs and controls (317 lines)
│   ├── modals.css         # Modal dialogs (359 lines)
│   └── tabs.css           # Tab navigation (44 lines)
├── templates/              # Slide template-specific styles
│   ├── slides-editors-basic.css     # Basic editors (table, stats, steps) (264 lines)
│   ├── slides-editors-advanced.css  # Advanced editors (agenda, annotations, columns) (309 lines)
│   ├── slides-inline.css  # Inline editing features (335 lines)
│   └── slides-player.css  # Presentation player mode (159 lines)
└── main.css               # Central import file (27 lines)
```

## Import Order

The `main.css` file imports all modules in this order:

1. **Base** - Variables, reset, typography
2. **Layout** - Grid, header, sidebar, panels
3. **Components** - Buttons, modals, forms, color pickers, code editors, tabs
4. **Templates** - Slide editors, player, inline editing

## File Organization Principles

### Base Layer
- **variables.css**: All CSS custom properties (colors, spacing)
- **reset.css**: Browser normalization and utility classes
- **typography.css**: Font definitions and icon styles

### Layout Layer
- **grid.css**: Grid systems and layout utilities
- **header.css**: Top navigation and project header
- **sidebar-main.css**: Slide list and navigation sidebar
- **sidebar-settings.css**: Settings panel and color overrides
- **panels.css**: Preview and editor panel containers

### Components Layer
- **buttons.css**: All button variants (primary, secondary, ghost, icon, danger)
- **modals.css**: Modal dialogs, overlays, and toasts
- **forms.css**: Basic form elements (inputs, textareas, checkboxes, toggles, sliders)
- **color-pickers.css**: Color selection components
- **code-editors.css**: Code input and editing interfaces
- **tabs.css**: Tab navigation components

### Templates Layer
- **slides-editors-basic.css**: Table, stats, and steps editors
- **slides-editors-advanced.css**: Agenda, annotations, and column editors
- **slides-player.css**: Presentation player mode styles
- **slides-inline.css**: Inline editing and interactive controls

## Benefits of Modular Architecture

1. **Maintainability**: Each file focuses on a specific concern
2. **Readability**: All files are under 400 lines
3. **Reusability**: Components can be understood and modified independently
4. **Performance**: Browser caching for individual modules
5. **Team Collaboration**: Reduced merge conflicts
6. **Debugging**: Easier to locate and fix issues

## Usage

The application loads only `styles/main.css`, which uses `@import` to load all modules:

```html
<link rel="stylesheet" href="styles/main.css">
```

## Migration Notes

- Original file: `slide-editor-styles.css` (3,452 lines) - DELETED
- New structure: 19 modular files (3,472 total lines)
- All styles preserved - no functionality lost
- File size increase (+20 lines) is due to section headers and import statements
- All individual files are under 400 lines as required

## Development Guidelines

When adding new styles:

1. Identify the appropriate layer (base/layout/components/templates)
2. Add to existing file if relevant, or create new module
3. Keep files under 400 lines
4. Update imports in `main.css` if adding new files
5. Document major sections with comments

## Browser Compatibility

The `@import` statements are supported by all modern browsers:
- Chrome/Edge 1+
- Firefox 1+
- Safari 1+
- Opera 3.5+

For production, consider using a CSS bundler (PostCSS, webpack) to combine files for optimal performance.
