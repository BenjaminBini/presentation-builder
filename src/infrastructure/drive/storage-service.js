// src/infrastructure/drive/storage-service.js
// Handles storage location logic for projects (local vs Drive)

import { DriveConfig } from './config.js';
import { driveAuth } from './auth.js';
import { driveAPI } from './api.js';
import { storage, generateUUID } from '../storage/local.js';

/**
 * DriveStorageService - Manages storage location for projects
 * Projects exist in ONE location: either local or Google Drive (not both)
 */
class DriveStorageService {
  constructor() {
    this.statusCallbacks = [];
  }

  /**
   * Get current integration status
   * @returns {string} One of DriveConfig.STATUS values
   */
  getStatus() {
    if (!driveAuth.isSignedIn()) {
      return DriveConfig.STATUS.NOT_CONNECTED;
    }
    if (!driveAPI.isFolderConfigured()) {
      return DriveConfig.STATUS.CONNECTED_NO_FOLDER;
    }
    return DriveConfig.STATUS.READY;
  }

  /**
   * Check if Drive integration is fully configured and ready
   * @returns {boolean}
   */
  isConfigured() {
    return this.getStatus() === DriveConfig.STATUS.READY;
  }

  /**
   * Get selected folder info
   * @returns {{id: string, name: string}|null}
   */
  getSelectedFolder() {
    const id = driveAPI.getSelectedFolderId();
    const name = driveAPI.getSelectedFolderName();
    if (id && name) {
      return { id, name };
    }
    return null;
  }

  /**
   * Set selected folder (called after Google Picker selection)
   * @param {string} folderId
   * @param {string} folderName
   */
  setSelectedFolder(folderId, folderName) {
    driveAPI.setSelectedFolder(folderId, folderName);
    this.notifyStatusChange();
  }

  /**
   * Clear selected folder
   */
  clearSelectedFolder() {
    driveAPI.clearSelectedFolder();
    this.notifyStatusChange();
  }

  /**
   * Get storage location for a project
   * @param {Object} project
   * @returns {'local'|'drive'}
   */
  getProjectStorageLocation(project) {
    // Migration: if no storageLocation set, infer from driveId
    if (!project.storageLocation) {
      return project.driveId ? 'drive' : 'local';
    }
    return project.storageLocation;
  }

  /**
   * Save project to its current storage location
   * @param {Object} project
   * @returns {Promise<Object>} Updated project
   */
  async save(project) {
    const location = this.getProjectStorageLocation(project);

    if (location === 'drive') {
      return this.saveToDrive(project);
    } else {
      return this.saveToLocal(project);
    }
  }

  /**
   * Save project to local storage
   * @param {Object} project
   * @returns {Object} Updated project
   */
  saveToLocal(project) {
    const updatedProject = {
      ...project,
      storageLocation: 'local',
      savedAt: new Date().toISOString()
    };
    // Remove Drive-specific fields - files are either local OR drive
    delete updatedProject.driveId;
    delete updatedProject.driveFolderId;
    // Ensure localId exists for local projects
    if (!updatedProject.localId) {
      updatedProject.localId = generateUUID();
    }

    storage.save(updatedProject);
    return updatedProject;
  }

  /**
   * Save project to Google Drive
   * @param {Object} project
   * @returns {Promise<Object>} Updated project with driveId
   */
  async saveToDrive(project) {
    if (!this.isConfigured()) {
      throw new Error('Drive not configured');
    }

    const folderId = driveAPI.getSelectedFolderId();
    const updatedProject = {
      ...project,
      storageLocation: 'drive',
      driveFolderId: folderId,
      savedAt: new Date().toISOString()
    };
    // Remove local-specific fields - files are either local OR drive
    delete updatedProject.localId;

    let result;
    if (project.driveId) {
      // Update existing file
      result = await driveAPI.updatePresentation(project.driveId, updatedProject);
    } else {
      // Create new file
      result = await driveAPI.createPresentation(updatedProject);
      updatedProject.driveId = result.id;
    }

    return updatedProject;
  }

  /**
   * Move a project from local storage to Google Drive
   * @param {Object} project - Local project to move
   * @returns {Promise<Object>} Project with Drive location
   */
  async moveToProvider(project) {
    if (!this.isConfigured()) {
      throw new Error('Drive not configured');
    }

    // Create on Drive - remove local-specific fields
    const driveProject = {
      ...project,
      storageLocation: 'drive',
      driveFolderId: driveAPI.getSelectedFolderId(),
      savedAt: new Date().toISOString()
    };
    delete driveProject.localId;

    const result = await driveAPI.createPresentation(driveProject);
    driveProject.driveId = result.id;

    // Remove from local storage
    if (project.localId) {
      storage.deleteByLocalId(project.localId);
    } else {
      // Fallback to name-based lookup
      const projects = storage.getAll();
      const localIndex = projects.findIndex(p => p.name === project.name);
      if (localIndex !== -1) {
        storage.delete(localIndex);
      }
    }

    return driveProject;
  }

  /**
   * Move a project from Google Drive to local storage
   * @param {Object} project - Drive project to move
   * @returns {Promise<Object>} Project with local location
   */
  async moveToLocal(project) {
    if (!project.driveId) {
      throw new Error('Project has no Drive ID');
    }

    // Save to local storage - remove Drive-specific fields, add localId
    const localProject = {
      ...project,
      storageLocation: 'local',
      localId: generateUUID(),
      savedAt: new Date().toISOString()
    };
    const driveId = localProject.driveId;
    delete localProject.driveId;
    delete localProject.driveFolderId;

    storage.save(localProject);

    // Trash the Drive file (soft delete)
    try {
      await driveAPI.trashPresentation(driveId);
    } catch (e) {
      console.warn('Could not trash Drive file:', e);
      // Continue anyway - local save succeeded
    }

    return localProject;
  }

  /**
   * Load all Drive projects from selected folder
   * @returns {Promise<Array>}
   */
  async loadDriveProjects() {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      return await driveAPI.listPresentations();
    } catch (e) {
      console.error('Error loading Drive projects:', e);
      return [];
    }
  }

  /**
   * Load a specific project from Drive
   * @param {string} fileId
   * @returns {Promise<Object>}
   */
  async loadFromDrive(fileId) {
    const project = await driveAPI.getPresentation(fileId);
    project.driveId = fileId;
    project.storageLocation = 'drive';
    project.driveFolderId = driveAPI.getSelectedFolderId();
    // Drive files don't have localId - files are either local OR drive
    delete project.localId;
    return project;
  }

  /**
   * Subscribe to status changes
   * @param {Function} callback
   */
  onStatusChange(callback) {
    this.statusCallbacks.push(callback);
  }

  /**
   * Unsubscribe from status changes
   * @param {Function} callback
   */
  offStatusChange(callback) {
    const index = this.statusCallbacks.indexOf(callback);
    if (index > -1) {
      this.statusCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify status change to all subscribers
   */
  notifyStatusChange() {
    const status = this.getStatus();
    this.statusCallbacks.forEach(cb => {
      try {
        cb(status);
      } catch (e) {
        console.error('Status callback error:', e);
      }
    });
  }
}

// Create singleton instance
const storageServiceInstance = new DriveStorageService();

// Export instance and class
export { storageServiceInstance as driveStorageService, DriveStorageService };
export default storageServiceInstance;
