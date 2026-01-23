// src/drive/api.js
// Google Drive API wrapper for file operations (server-based)

import { DriveConfig } from './config.js';
import { driveAuth } from './auth.js';

/**
 * DriveAPI - Google Drive file operations (via server proxy)
 */
class DriveAPI {
  /**
   * Get the selected folder ID (user picks this via Google Picker)
   * @returns {string|null} Folder ID or null if not configured
   */
  getSelectedFolderId() {
    return localStorage.getItem(DriveConfig.STORAGE_KEYS.SELECTED_FOLDER_ID) || null;
  }

  /**
   * Get the selected folder name
   * @returns {string|null} Folder name or null if not configured
   */
  getSelectedFolderName() {
    return localStorage.getItem(DriveConfig.STORAGE_KEYS.SELECTED_FOLDER_NAME) || null;
  }

  /**
   * Set the selected folder (called after user picks via Google Picker)
   * @param {string} folderId - Folder ID from Picker
   * @param {string} folderName - Folder name from Picker
   */
  setSelectedFolder(folderId, folderName) {
    localStorage.setItem(DriveConfig.STORAGE_KEYS.SELECTED_FOLDER_ID, folderId);
    localStorage.setItem(DriveConfig.STORAGE_KEYS.SELECTED_FOLDER_NAME, folderName);
  }

  /**
   * Clear the selected folder
   */
  clearSelectedFolder() {
    localStorage.removeItem(DriveConfig.STORAGE_KEYS.SELECTED_FOLDER_ID);
    localStorage.removeItem(DriveConfig.STORAGE_KEYS.SELECTED_FOLDER_NAME);
  }

  /**
   * Check if a folder is configured
   * @returns {boolean}
   */
  isFolderConfigured() {
    return !!this.getSelectedFolderId();
  }

  /**
   * Verify the selected folder still exists and is accessible
   * @returns {Promise<boolean>}
   */
  async verifySelectedFolder() {
    const folderId = this.getSelectedFolderId();
    if (!folderId) return false;

    await driveAuth.ensureValidToken();

    try {
      const response = await fetch(`/api/drive/files/${folderId}?fields=id,name,trashed`);
      if (!response.ok) {
        throw new Error('Folder not found');
      }
      const data = await response.json();
      return !data.trashed;
    } catch (e) {
      // Folder deleted or inaccessible
      this.clearSelectedFolder();
      return false;
    }
  }

  /**
   * List folders in user's Drive root (for fallback if Picker unavailable)
   * @returns {Promise<Array>}
   */
  async listFolders() {
    await driveAuth.ensureValidToken();

    const query = encodeURIComponent(`mimeType='${DriveConfig.MIME_TYPES.FOLDER}' and trashed=false and 'root' in parents`);
    const response = await fetch(`/api/drive/files?q=${query}&fields=files(id,name)&orderBy=name&pageSize=50`);

    if (!response.ok) {
      throw new Error(`Failed to list folders: ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
  }

  /**
   * List all presentations in selected folder
   * @returns {Promise<Array>} Array of presentation metadata
   */
  async listPresentations() {
    const folderId = this.getSelectedFolderId();
    if (!folderId) {
      return [];
    }

    await driveAuth.ensureValidToken();

    const query = encodeURIComponent(`'${folderId}' in parents and mimeType='${DriveConfig.MIME_TYPES.JSON}' and trashed=false`);
    const response = await fetch(`/api/drive/files?q=${query}&fields=files(id,name,modifiedTime,size,properties)&orderBy=modifiedTime desc&pageSize=100`);

    if (!response.ok) {
      throw new Error(`Failed to list presentations: ${response.status}`);
    }

    const data = await response.json();

    return (data.files || []).map(file => ({
      id: file.id,
      name: file.name.replace(DriveConfig.FILE_EXTENSION, ''),
      modifiedTime: file.modifiedTime,
      size: parseInt(file.size || '0', 10),
      driveId: file.id,
      storageLocation: 'drive',
      driveFolderId: folderId,
      properties: file.properties || {}
    }));
  }

  /**
   * Get presentation content by ID
   */
  async getPresentation(fileId) {
    await driveAuth.ensureValidToken();

    const response = await fetch(`/api/drive/files/${fileId}/content`);

    if (!response.ok) {
      throw new Error(`Failed to get presentation: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get presentation metadata only
   */
  async getPresentationMetadata(fileId) {
    await driveAuth.ensureValidToken();

    const response = await fetch(`/api/drive/files/${fileId}?fields=id,name,modifiedTime,version,properties`);

    if (!response.ok) {
      throw new Error(`Failed to get presentation metadata: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Create new presentation in Drive
   * @param {Object} project - Project to create
   * @param {string} [folderId] - Optional folder ID (uses selected folder if not provided)
   * @returns {Promise<Object>} Created file metadata
   */
  async createPresentation(project, folderId) {
    const targetFolderId = folderId || this.getSelectedFolderId();
    if (!targetFolderId) {
      throw new Error('No folder selected for Drive storage');
    }

    await driveAuth.ensureValidToken();

    const fileName = this.sanitizeFileName(project.name);

    const metadata = {
      name: `${fileName}${DriveConfig.FILE_EXTENSION}`,
      mimeType: DriveConfig.MIME_TYPES.JSON,
      parents: [targetFolderId],
      properties: {
        appVersion: '1.0',
        slideCount: String(project.slides ? project.slides.length : 0),
        lastLocalSave: project.savedAt || new Date().toISOString()
      }
    };

    const response = await fetch('/api/drive/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metadata,
        content: project
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create presentation');
    }

    return await response.json();
  }

  /**
   * Update existing presentation in Drive
   */
  async updatePresentation(fileId, project) {
    await driveAuth.ensureValidToken();

    const fileName = this.sanitizeFileName(project.name);

    const metadata = {
      name: `${fileName}${DriveConfig.FILE_EXTENSION}`,
      properties: {
        appVersion: '1.0',
        slideCount: String(project.slides ? project.slides.length : 0),
        lastLocalSave: project.savedAt || new Date().toISOString()
      }
    };

    const response = await fetch(`/api/drive/files/${fileId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metadata,
        content: project
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update presentation');
    }

    return await response.json();
  }

  /**
   * Delete presentation permanently
   */
  async deletePresentation(fileId) {
    await driveAuth.ensureValidToken();

    const response = await fetch(`/api/drive/files/${fileId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete presentation');
    }
  }

  /**
   * Move presentation to trash (soft delete)
   */
  async trashPresentation(fileId) {
    await driveAuth.ensureValidToken();

    const response = await fetch(`/api/drive/files/${fileId}/trash`, {
      method: 'POST'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to trash presentation');
    }
  }

  /**
   * Sanitize file name for Drive
   */
  sanitizeFileName(name) {
    return (name || 'Sans titre')
      // Remove illegal characters for Drive
      .replace(/[<>:"/\\|?*]/g, '-')
      // Collapse multiple spaces/dashes
      .replace(/\s+/g, ' ')
      .replace(/-+/g, '-')
      // Trim whitespace
      .trim()
      // Limit length (Drive has 255 char limit, leave room for extension)
      .substring(0, 200);
  }

  /**
   * Check if a file with the same name exists in the selected folder
   * @param {string} projectName - Project name to search for
   * @returns {Promise<Object|null>} File metadata or null
   */
  async findByName(projectName) {
    const folderId = this.getSelectedFolderId();
    if (!folderId) {
      return null;
    }

    await driveAuth.ensureValidToken();

    const fileName = this.sanitizeFileName(projectName) + DriveConfig.FILE_EXTENSION;
    const query = encodeURIComponent(`'${folderId}' in parents and name='${fileName}' and trashed=false`);

    const response = await fetch(`/api/drive/files?q=${query}&fields=files(id,name,modifiedTime)`);

    if (!response.ok) {
      throw new Error(`Failed to search files: ${response.status}`);
    }

    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
  }
}

// Create singleton instance
const apiInstance = new DriveAPI();

// Export instance and class
export { apiInstance as driveAPI, DriveAPI };
export default apiInstance;
