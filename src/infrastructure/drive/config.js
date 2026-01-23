// src/drive/config.js
// Google Drive configuration constants

/**
 * Google Drive API configuration
 * Note: OAuth credentials are now handled server-side
 */
export const DriveConfig = {
  // API base URL (all API calls go through the backend)
  API_BASE: '',  // Empty for same-origin requests

  // OAuth scopes (for reference - actual scopes handled server-side)
  SCOPES: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/presentations',

  // File MIME types
  MIME_TYPES: {
    JSON: 'application/json',
    FOLDER: 'application/vnd.google-apps.folder',
    GOOGLE_SLIDES: 'application/vnd.google-apps.presentation'
  },

  // File extension for presentations
  FILE_EXTENSION: '.presentation.json',

  // Local storage keys for Drive state (simplified - no sync-related keys)
  STORAGE_KEYS: {
    SELECTED_FOLDER_ID: 'drive_selected_folder_id',
    SELECTED_FOLDER_NAME: 'drive_selected_folder_name',
    EXPLICIT_STATE: 'drive_explicit_state'
  },

  // Session storage keys for file sidebar
  SESSION_KEYS: {
    FILE_SIDEBAR_COLLAPSED: 'filesidebar_collapsed',
    FILE_SIDEBAR_ACTIVE_TAB: 'filesidebar_active_tab'
  },

  // Drive integration states
  STATUS: {
    NOT_CONNECTED: 'not_connected',
    CONNECTED_NO_FOLDER: 'connected_no_folder',
    READY: 'ready'
  }
};

export default DriveConfig;
