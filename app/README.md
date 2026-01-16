# App Module Structure

This directory contains the modularized slide editor application, split from the original monolithic `slide-editor-app.js` file (850+ lines) into smaller, maintainable modules.

## Module Overview

### Core Modules

#### `state.js` (83 lines)
- Application state management
- All global state variables (`currentProject`, `selectedSlideIndex`, etc.)
- Unsaved changes tracking
- Autosave functionality
- Exposes: `markAsChanged()`, `autosave()`, `clearUnsavedChanges()`

#### `project.js` (110 lines)
- Project loading and initialization
- Theme management
- Project title editing
- Mermaid initialization
- Exposes: `loadInitialProject()`, `updateHeaderTitle()`, `editProjectTitle()`, `finishEditProjectTitle()`, `handleTitleKeydown()`, `initMermaid()`

#### `theme.js` (75 lines)
- Theme selection UI
- Color customization
- Color override management
- Exposes: `renderThemeSelector()`, `selectTheme()`, `renderColorList()`, `setColorOverride()`, `resetColorOverride()`

#### `sidebar.js` (28 lines)
- Sidebar tab switching
- Settings panel rendering
- Template grid initialization
- Exposes: `switchSidebarTab()`, `renderSettingsPanel()`, `initTemplateGrid()`

### Slides Modules (`slides/` subdirectory)

#### `list.js` (65 lines)
- Slide list rendering
- Slide selection
- Compact slide list for collapsed sidebar
- Exposes: `renderSlideList()`, `selectSlide()`, `renderCompactSlideList()`

#### `preview.js` (64 lines)
- Preview panel rendering
- Preview scaling logic
- Responsive preview updates
- Exposes: `updatePreview()`, `scalePreviewSlide()`

#### `management.js` (99 lines)
- Add, delete, duplicate slides
- Template selection
- Drag and drop reordering
- Exposes: `addSlide()`, `selectTemplate()`, `deleteSlide()`, `duplicateSlide()`, `handleDragStart()`, `handleDragOver()`, `handleDrop()`, `handleDragEnd()`

### Presentation Module

#### `presentation.js` (154 lines)
- Fullscreen presentation player
- Player controls and navigation
- Keyboard shortcuts
- Player scaling logic
- Exposes: `startPresentation()`, `exitPresentation()`, `prevSlidePlayer()`, `nextSlidePlayer()`, `scalePlayerSlide()`

### Panel Management Module

#### `panels.js` (105 lines)
- Sidebar collapse/expand
- Editor panel collapse/expand
- Editor panel resizing
- Panel state persistence
- Exposes: `initPanelStates()`, `toggleSidebar()`, `toggleEditorPanel()`

### Main Initialization

#### `index.js` (41 lines)
- DOMContentLoaded handler
- Application initialization sequence
- Global event listeners setup
- ResizeObserver initialization

## Loading Order

The modules must be loaded in this specific order (as defined in `slide-editor.html`):

1. **State** - Must load first as it defines all global state
2. **Project** - Depends on state
3. **Theme** - Depends on state and project
4. **Sidebar** - Depends on theme
5. **Slides (list, preview, management)** - Depend on state
6. **Presentation** - Depends on slides
7. **Panels** - Depends on state
8. **Index** - Must load last to initialize the app

## Design Principles

### 1. All Functions on Window Object
All functions that need to be accessed globally (including from HTML event handlers) are explicitly attached to the `window` object:
```javascript
window.functionName = function() { ... }
```

### 2. Module Size Limit
Each module is kept under 400 lines for maintainability.

### 3. Clear Separation of Concerns
- **State**: Only state and state management
- **Project**: Only project-level operations
- **Theme**: Only theme and color operations
- **Slides**: Only slide-specific operations
- **Presentation**: Only presentation player
- **Panels**: Only UI panel management

### 4. Backward Compatibility
All existing functionality is preserved. The split is purely organizational - no features were removed or changed.

## File Size Comparison

- **Original**: `slide-editor-app.js` - 846 lines
- **New total**: All modules - 824 lines
- **Largest module**: `presentation.js` - 154 lines
- **Average module size**: ~82 lines

## Testing

To verify all functions are properly exposed:
1. Open `test-modules.html` in a browser
2. Check that all functions are found (green checkmarks)
3. Test the main application at `slide-editor.html`

## Migration Notes

The original `slide-editor-app.js` has been backed up to `slide-editor-app.js.backup` for reference.

## Future Improvements

Potential further refactoring opportunities:
- Split `presentation.js` into player controls and player rendering
- Extract keyboard handler from `presentation.js`
- Consider creating a shared utilities module for common functions
