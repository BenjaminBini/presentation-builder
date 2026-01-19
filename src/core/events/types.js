// src/core/events/types.js
// Standard event type constants for type safety and documentation

export const EventTypes = {
  // State events
  STATE_CHANGED: 'state:changed',
  PROJECT_LOADED: 'project:loaded',
  PROJECT_SAVED: 'project:saved',
  PROJECT_CREATED: 'project:created',

  // Slide events
  SLIDE_ADDED: 'slide:added',
  SLIDE_REMOVED: 'slide:removed',
  SLIDE_SELECTED: 'slide:selected',
  SLIDE_UPDATED: 'slide:updated',
  SLIDE_MOVED: 'slide:moved',
  SLIDE_DUPLICATED: 'slide:duplicated',
  SLIDE_DATA_CHANGED: 'slide:data:changed',

  // Editor events
  FIELD_CHANGED: 'field:changed',
  TEMPLATE_CHANGED: 'template:changed',
  COLOR_CHANGED: 'color:changed',

  // UI events
  SIDEBAR_TOGGLED: 'ui:sidebar:toggled',
  EDITOR_TOGGLED: 'ui:editor:toggled',
  TAB_SWITCHED: 'ui:tab:switched',
  MODAL_OPENED: 'ui:modal:opened',
  MODAL_CLOSED: 'ui:modal:closed',

  // Preview events
  PREVIEW_UPDATED: 'preview:updated',
  PREVIEW_SCALED: 'preview:scaled',

  // Presentation events
  PRESENTATION_STARTED: 'presentation:started',
  PRESENTATION_ENDED: 'presentation:ended',
  PRESENTATION_SLIDE_CHANGED: 'presentation:slide:changed',

  // Theme events
  THEME_CHANGED: 'theme:changed',
  THEME_COLOR_CHANGED: 'theme:color:changed',

  // Persistence events
  AUTOSAVE_TRIGGERED: 'persistence:autosave',
  CHANGES_MARKED: 'persistence:changes:marked',
  CHANGES_CLEARED: 'persistence:changes:cleared',

  // Drive events
  DRIVE_SYNC_STARTED: 'drive:sync:started',
  DRIVE_SYNC_COMPLETED: 'drive:sync:completed',
  DRIVE_SYNC_ERROR: 'drive:sync:error',
  DRIVE_CONFLICT: 'drive:conflict',

  // Inline editing events
  INLINE_EDIT_STARTED: 'inline:edit:started',
  INLINE_EDIT_ENDED: 'inline:edit:ended'
};
