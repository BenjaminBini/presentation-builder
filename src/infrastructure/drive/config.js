// src/drive/config.js
// Google Drive configuration constants

/**
 * Google Drive API configuration
 */
export const DriveConfig = {
  // OAuth 2.0 Client ID (to be configured by user)
  // Get yours at: https://console.cloud.google.com/apis/credentials
  CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',

  // API Key for Picker (optional)
  API_KEY: '',

  // OAuth scopes - minimal permissions
  SCOPES: 'https://www.googleapis.com/auth/drive.file',

  // Discovery docs for GAPI
  DISCOVERY_DOCS: [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
  ],

  // App folder name in user's Drive
  APP_FOLDER_NAME: 'Presentation Builder',

  // File MIME types
  MIME_TYPES: {
    JSON: 'application/json',
    FOLDER: 'application/vnd.google-apps.folder'
  },

  // File extension for presentations
  FILE_EXTENSION: '.presentation.json',

  // Sync settings
  SYNC: {
    DEBOUNCE_MS: 3000,           // 3 seconds after last change
    RETRY_ATTEMPTS: 3,
    RETRY_BASE_DELAY_MS: 1000,
    RETRY_MAX_DELAY_MS: 10000,
    CONFLICT_THRESHOLD_MS: 5000  // 5 second window for conflicts
  },

  // Local storage keys for Drive state
  STORAGE_KEYS: {
    AUTH_TOKEN: 'drive_auth_token',
    FOLDER_ID: 'drive_folder_id',
    SYNC_ENABLED: 'drive_sync_enabled',
    LAST_SYNC: 'drive_last_sync',
    PENDING_SYNC: 'drive_pending_sync'
  }
};

export default DriveConfig;
