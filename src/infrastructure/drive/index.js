// src/drive/index.js
// Main entry point for Drive integration module

// Import for use in default export
import { DriveConfig } from './config.js';
import { driveAuth, DriveAuth } from './auth.js';
import { driveAPI, DriveAPI } from './api.js';
import { driveStorageService, DriveStorageService } from './storage-service.js';

// Re-export all
export { DriveConfig } from './config.js';
export { driveAuth, DriveAuth } from './auth.js';
export { driveAPI, DriveAPI } from './api.js';
export { driveStorageService, DriveStorageService } from './storage-service.js';

// Default export with all instances
export default {
  config: DriveConfig,
  auth: driveAuth,
  api: driveAPI,
  storageService: driveStorageService
};
