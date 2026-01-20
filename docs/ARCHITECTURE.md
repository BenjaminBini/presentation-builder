# Architecture Documentation

## Overview

The Presentation Builder uses a clean, event-driven, layered architecture. This design separates concerns into distinct layers: pure domain logic, application services, and UI/DOM handling.

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           PRESENTATION (UI/DOM)                 │
│  app/slides/, editor/, inline-editing/          │
│  Subscribes to events, renders DOM              │
└──────────────────────┬──────────────────────────┘
                       │ subscribes to events
                       ▼
┌─────────────────────────────────────────────────┐
│           APPLICATION (Services)                │
│  services/project-service.js, slide-service.js  │
│  Orchestrates domain + emits events             │
└──────────────────────┬──────────────────────────┘
                       │ calls
                       ▼
┌─────────────────────────────────────────────────┐
│           DOMAIN (Pure Logic)                   │
│  core/state/, core/events/, config/, templates/ │
│  No DOM, no window, pure functions              │
└──────────────────────┬──────────────────────────┘
                       │ uses
                       ▼
┌─────────────────────────────────────────────────┐
│           INFRASTRUCTURE                        │
│  drive/, projects/storage.js, utils/            │
└─────────────────────────────────────────────────┘
```

---

## Directory Structure

```
src/
├── core/                        # Pure domain layer
│   ├── index.js                 # Re-exports from subdirectories
│   ├── state.js                 # Re-exports + DOM helpers
│   ├── events.js                # Re-exports from events/
│   ├── error-handler.js         # Global error handling
│   ├── state/
│   │   ├── index.js             # Public state API
│   │   ├── store.js             # Pure StateStore class (no DOM)
│   │   ├── selectors.js         # Read-only state getters
│   │   └── actions.js           # State mutation functions
│   └── events/
│       ├── index.js             # Public events API
│       ├── bus.js               # Pure EventBus class
│       └── types.js             # Event type constants
│
├── services/                    # Application services layer
│   ├── index.js                 # Public services API
│   ├── project-service.js       # Project CRUD + events
│   ├── slide-service.js         # Slide operations + events
│   ├── theme-service.js         # Theme management + events
│   └── presentation-service.js  # Presentation mode + events
│
├── config/
│   └── index.js                 # Templates, themes, constants
│
├── app/                         # UI components
│   ├── slides/
│   │   ├── list.js              # Slide list with event subscriptions
│   │   ├── preview.js           # Preview with event subscriptions
│   │   └── management.js        # Slide add/delete/duplicate
│   ├── sidebar.js               # Sidebar tabs and settings
│   ├── panels.js                # Panel collapse/expand
│   ├── presentation.js          # Fullscreen presentation mode
│   ├── modals.js                # Modal management
│   ├── import-modal.js          # Import functionality
│   ├── project.js               # Project title editing
│   └── theme.js                 # Theme color picker UI
│
├── editor/                      # Editor panel
│   ├── panel.js                 # Editor panel rendering
│   ├── handlers.js              # Field update handlers + events
│   ├── color-selector.js        # Slide color picker
│   ├── template-settings.js     # Template-specific settings
│   ├── state.js                 # Editor-specific state
│   └── fields/                  # Field type renderers
│       ├── base.js
│       ├── text.js
│       ├── array.js
│       ├── complex.js
│       └── table.js
│
├── inline-editing/              # In-place content editing
│   ├── index.js                 # Auto-initializes on import
│   ├── core.js
│   ├── text-editor.js
│   ├── code-editor.js
│   ├── list-table-manager.js
│   └── ...
│
├── templates/                   # Slide templates
│   ├── renderer.js              # Template rendering
│   ├── theme.js                 # Theme color resolution
│   ├── utilities.js             # Template utilities
│   ├── preview-styles.js        # Preview CSS generation
│   └── components/              # Template components
│
├── projects/                    # Project management
│   ├── manager.js               # Project CRUD operations
│   ├── storage.js               # localStorage operations
│   ├── notifications.js         # Toast notifications
│   └── import-export.js         # JSON import/export
│
├── drive/                       # Google Drive integration
│   ├── index.js                 # Public Drive API
│   ├── auth.js
│   ├── api.js
│   ├── sync.js
│   └── config.js
│
├── utils/
│   ├── html.js                  # HTML utilities
│   └── svg.js                   # SVG utilities
│
└── main.js                      # Entry point, wires everything
```

---

## Core Layer

### State Management (`core/state/`)

The state layer is pure - no DOM manipulation, no side effects.

**store.js** - Central state container:
```javascript
import { store, getState, setState, subscribe, batch } from './core/state/index.js';

// Get current state
const state = getState();

// Update state
setState({ selectedSlideIndex: 2 });

// Subscribe to changes
const unsubscribe = subscribe((newState) => {
  console.log('State changed:', newState);
});

// Batch multiple updates
batch(() => {
  setState({ project: newProject });
  setState({ selectedSlideIndex: 0 });
});
```

**selectors.js** - Read-only getters:
```javascript
import {
  getProject,
  getSlides,
  getSelectedSlide,
  getSelectedSlideIndex,
  getTheme,
  hasUnsavedChanges
} from './core/state/index.js';
```

**actions.js** - State mutations:
```javascript
import {
  setProject,
  setSelectedSlideIndex,
  addSlide,
  removeSlide,
  updateSlideData,
  setThemeColor,
  markAsChanged
} from './core/state/index.js';
```

### Event System (`core/events/`)

Pub/sub system for decoupled communication.

**types.js** - Event constants:
```javascript
export const EventTypes = {
  // State
  STATE_CHANGED: 'state:changed',
  PROJECT_LOADED: 'project:loaded',
  PROJECT_SAVED: 'project:saved',

  // Slides
  SLIDE_ADDED: 'slide:added',
  SLIDE_REMOVED: 'slide:removed',
  SLIDE_SELECTED: 'slide:selected',
  SLIDE_DATA_CHANGED: 'slide:data:changed',

  // Theme
  THEME_CHANGED: 'theme:changed',
  THEME_COLOR_CHANGED: 'theme:color:changed',

  // ... 30+ event types
};
```

**bus.js** - EventBus class:
```javascript
import { emit, on, off, once, EventTypes } from './core/events/index.js';

// Subscribe to events
on(EventTypes.SLIDE_SELECTED, ({ index, slide }) => {
  console.log('Slide selected:', index);
});

// Emit events
emit(EventTypes.SLIDE_DATA_CHANGED, { index: 0, key: 'title', value: 'New Title' });

// One-time subscription
once(EventTypes.PROJECT_LOADED, () => {
  console.log('Project loaded once');
});
```

---

## Services Layer

Services orchestrate domain operations and emit events. They contain business logic but no DOM manipulation.

### Project Service
```javascript
import {
  loadProject,
  createNewProject,
  saveProject,
  importProject,
  markProjectChanged
} from './services/project-service.js';

// Load a project - emits PROJECT_LOADED
loadProject(projectData);

// Create new - emits PROJECT_CREATED, PROJECT_LOADED
createNewProject();
```

### Slide Service
```javascript
import {
  selectSlide,
  addSlide,
  deleteSlide,
  duplicateSlide,
  updateSlideField
} from './services/slide-service.js';

// Select slide - emits SLIDE_SELECTED
selectSlide(2);

// Add slide - emits SLIDE_ADDED, SLIDE_SELECTED
addSlide('title', { title: 'New Slide' });

// Update field - emits SLIDE_DATA_CHANGED, FIELD_CHANGED
updateSlideField('title', 'Updated Title');
```

### Theme Service
```javascript
import {
  changeTheme,
  setColorOverride,
  resetAllColors
} from './services/theme-service.js';

// Change theme - emits THEME_CHANGED
changeTheme('dark');

// Override color - emits THEME_COLOR_CHANGED
setColorOverride('accent-main', '#FF5500');
```

### Presentation Service
```javascript
import {
  startPresentation,
  stopPresentation,
  nextSlide,
  prevSlide
} from './services/presentation-service.js';

// Start - emits PRESENTATION_STARTED
startPresentation();

// Navigate - emits PRESENTATION_SLIDE_CHANGED
nextSlide();
```

---

## UI Layer

UI components subscribe to events and update the DOM in response.

### Event Subscriptions Pattern

```javascript
// app/slides/preview.js
import { on, EventTypes } from '../../core/events/index.js';

export function initPreviewSubscriptions() {
  on(EventTypes.SLIDE_DATA_CHANGED, () => updatePreview());
  on(EventTypes.SLIDE_SELECTED, () => updatePreview());
  on(EventTypes.THEME_CHANGED, () => updatePreview());
  on(EventTypes.PROJECT_LOADED, () => updatePreview());
}
```

```javascript
// app/slides/list.js
import { on, EventTypes } from '../../core/events/index.js';

export function initSlideListSubscriptions() {
  on(EventTypes.SLIDE_ADDED, () => renderSlideList());
  on(EventTypes.SLIDE_REMOVED, () => renderSlideList());
  on(EventTypes.SLIDE_SELECTED, () => renderSlideList());
  on(EventTypes.PROJECT_LOADED, () => renderSlideList());
  on(EventTypes.FIELD_CHANGED, ({ key }) => {
    if (key === 'title') renderSlideList();
  });
}
```

### Initialization

In `main.js`, subscriptions are initialized at startup:

```javascript
function initializeApp() {
  initErrorHandler();

  // Initialize event subscriptions
  initPreviewSubscriptions();
  initSlideListSubscriptions();

  // Load project and render
  loadInitialProject();
  renderSlideList();
  renderEditor();
  updatePreview();
}
```

---

## Event Flow Example

When a user edits a slide title:

```
1. User types in title field
         │
         ▼
2. editor/handlers.js: updateField('title', 'New Title')
         │
         ├─► emit(SLIDE_DATA_CHANGED, { key: 'title' })
         └─► emit(FIELD_CHANGED, { key: 'title' })
         │
         ▼
3. Event subscriptions fire:
         │
         ├─► preview.js receives SLIDE_DATA_CHANGED
         │   └─► updatePreview() - re-renders preview
         │
         └─► list.js receives FIELD_CHANGED
             └─► renderSlideList() - updates slide title in list
```

---

## Module Re-exports

The `core/state.js` and `core/events.js` files provide convenient re-exports:

```javascript
// core/state.js - re-exports pure state + adds DOM helpers
export * from './state/index.js';
export { updateSaveButtonState, showUnsavedAlert, hideUnsavedAlert, dismissUnsavedAlert };

// core/events.js - re-exports event system
export * from './events/index.js';
```

This allows importing from `core/state.js` or `core/events.js` as a shorthand for the subdirectory modules.

---

## Key Benefits

1. **Testability** - Pure state/events can be unit tested without DOM
2. **Decoupling** - Components don't know about each other, only events
3. **Maintainability** - Clear separation of concerns
4. **Extensibility** - Easy to add new event subscribers
5. **Debugging** - Event flow is traceable and predictable

---

## Adding New Features

### Adding a new event type:
1. Add to `core/events/types.js`
2. Emit from appropriate service
3. Subscribe in relevant UI components

### Adding a new service:
1. Create `services/my-service.js`
2. Import state selectors/actions as needed
3. Emit events for state changes
4. Export from `services/index.js`

### Adding a new UI component:
1. Create component with render function
2. Create `initMyComponentSubscriptions()` function
3. Subscribe to relevant events
4. Call init function from `main.js`
