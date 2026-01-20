// src/drive/sync.js
// Bidirectional sync logic with conflict resolution

import { DriveConfig } from './config.js';
import { driveAuth } from './auth.js';
import { driveAPI } from './api.js';
import { getProject, setProject } from '../../domain/state/index.js';
import { emit, EventTypes } from '../../domain/events/index.js';

/**
 * Sync status enum
 */
export const SyncStatus = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  CONFLICT: 'conflict',
  ERROR: 'error',
  OFFLINE: 'offline'
};

/**
 * DriveSync - Bidirectional synchronization manager
 */
class DriveSync {
  constructor() {
    this.syncTimeout = null;
    this.isSyncing = false;
    this.pendingQueue = [];
    this.currentStatus = SyncStatus.IDLE;
    this.statusCallbacks = [];

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.currentStatus === SyncStatus.OFFLINE) {
          this.syncPending();
        }
      });

      window.addEventListener('offline', () => {
        this.setStatus(SyncStatus.OFFLINE);
      });
    }
  }

  /**
   * Queue a sync operation with debouncing
   */
  queueSync(project) {
    if (!driveAuth.isSignedIn()) return;
    if (!this.isSyncEnabled()) return;

    const clonedProject = JSON.parse(JSON.stringify(project)); // Deep clone

    // Check if this project is already in queue (by id or name), update it if so
    const existingIndex = this.pendingQueue.findIndex(
      p => p.driveId === clonedProject.driveId || p.name === clonedProject.name
    );
    if (existingIndex !== -1) {
      this.pendingQueue[existingIndex] = clonedProject;
    } else {
      this.pendingQueue.push(clonedProject);
    }

    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(() => {
      const nextProject = this.pendingQueue.shift();
      if (nextProject) {
        this.performSync(nextProject);
      }
    }, DriveConfig.SYNC.DEBOUNCE_MS);
  }

  /**
   * Perform the actual sync
   */
  async performSync(project, retryCount = 0) {
    if (this.isSyncing) {
      // Add to queue if not already present (compare by id/name, not reference)
      const alreadyQueued = this.pendingQueue.some(
        p => p.driveId === project.driveId || p.name === project.name
      );
      if (!alreadyQueued) {
        this.pendingQueue.push(JSON.parse(JSON.stringify(project)));
      }
      return;
    }

    if (!navigator.onLine) {
      this.setStatus(SyncStatus.OFFLINE);
      this.savePendingSync(project);
      return;
    }

    this.isSyncing = true;
    this.setStatus(SyncStatus.SYNCING);

    try {
      const driveId = project.driveId;

      if (driveId) {
        // Update existing file
        try {
          const remoteMeta = await driveAPI.getPresentationMetadata(driveId);
          const conflict = this.detectConflict(project, remoteMeta);

          if (conflict) {
            this.setStatus(SyncStatus.CONFLICT);
            await this.handleConflict(project, remoteMeta);
          } else {
            await driveAPI.updatePresentation(driveId, project);
            this.updateLocalSyncTime(project.name);
            this.setStatus(SyncStatus.SYNCED);

            // Auto-clear synced status after 3 seconds
            setTimeout(() => {
              if (this.currentStatus === SyncStatus.SYNCED) {
                this.setStatus(SyncStatus.IDLE);
              }
            }, 3000);
          }
        } catch (error) {
          // If file not found, create new one
          if (error.status === 404) {
            const result = await driveAPI.createPresentation(project);
            project.driveId = result.id;
            this.updateProjectDriveId(project.name, result.id);
            this.updateLocalSyncTime(project.name);
            this.setStatus(SyncStatus.SYNCED);
          } else {
            throw error;
          }
        }
      } else {
        // Check if file with same name exists
        const existing = await driveAPI.findByName(project.name);

        if (existing) {
          // Link to existing file
          project.driveId = existing.id;
          this.updateProjectDriveId(project.name, existing.id);
          await driveAPI.updatePresentation(existing.id, project);
        } else {
          // Create new file
          const result = await driveAPI.createPresentation(project);
          project.driveId = result.id;
          this.updateProjectDriveId(project.name, result.id);
        }

        this.updateLocalSyncTime(project.name);
        this.setStatus(SyncStatus.SYNCED);

        // Auto-clear synced status after 3 seconds
        setTimeout(() => {
          if (this.currentStatus === SyncStatus.SYNCED) {
            this.setStatus(SyncStatus.IDLE);
          }
        }, 3000);
      }

      this.clearPendingSync();

    } catch (error) {
      console.error('Sync error:', error);

      if (retryCount < DriveConfig.SYNC.RETRY_ATTEMPTS) {
        const delay = Math.min(
          DriveConfig.SYNC.RETRY_BASE_DELAY_MS * Math.pow(2, retryCount),
          DriveConfig.SYNC.RETRY_MAX_DELAY_MS
        );

        setTimeout(() => {
          this.performSync(project, retryCount + 1);
        }, delay);
      } else {
        this.setStatus(SyncStatus.ERROR);
        this.savePendingSync(project);

      }
    } finally {
      this.isSyncing = false;

      // Process next item in queue
      if (this.pendingQueue.length > 0) {
        const next = this.pendingQueue.shift();
        this.queueSync(next);
      }
    }
  }

  /**
   * Detect if there's a conflict between local and remote
   */
  detectConflict(localProject, remoteMeta) {
    const localTime = new Date(localProject.savedAt || 0).getTime();
    const remoteTime = new Date(remoteMeta.modifiedTime).getTime();
    const lastSyncTime = this.getLastSyncTime(localProject.name);

    // Conflict if remote changed after our last sync
    // and local also changed after last sync
    if (remoteTime > lastSyncTime && localTime > lastSyncTime) {
      const timeDiff = Math.abs(remoteTime - localTime);
      return timeDiff > DriveConfig.SYNC.CONFLICT_THRESHOLD_MS;
    }

    return false;
  }

  /**
   * Handle sync conflict - emit event for UI
   */
  async handleConflict(localProject, remoteMeta) {
    return new Promise((resolve) => {
      // Emit conflict event for UI to handle
      this.statusCallbacks.forEach(cb => cb(SyncStatus.CONFLICT, {
        local: localProject,
        remote: remoteMeta,
        resolve: async (choice) => {
          try {
            if (choice === 'local') {
              // Force push local version
              await driveAPI.updatePresentation(
                localProject.driveId,
                localProject
              );
              this.updateLocalSyncTime(localProject.name);
            } else if (choice === 'remote') {
              // Pull remote version
              const remoteProject = await driveAPI.getPresentation(
                localProject.driveId
              );
              remoteProject.driveId = localProject.driveId;

              // Update local storage
              const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
              const index = projects.findIndex(p => p.name === localProject.name);
              if (index !== -1) {
                projects[index] = remoteProject;
                localStorage.setItem('slideProjects', JSON.stringify(projects));
              }

              // Update current project if it's the active one
              const currentProject = getProject();
              if (currentProject && currentProject.name === localProject.name) {
                setProject(JSON.parse(JSON.stringify(remoteProject)));
                // Emit sync completed event - UI updates are handled by main.js subscriptions
                emit(EventTypes.DRIVE_SYNC_COMPLETED, { project: remoteProject, resolution: 'remote' });
              }

              this.updateLocalSyncTime(localProject.name);
            } else if (choice === 'both') {
              // Keep both - create copy of local
              const localCopy = JSON.parse(JSON.stringify(localProject));
              localCopy.name += ' (copie locale)';
              delete localCopy.driveId;

              // Save copy to localStorage
              const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
              projects.push(localCopy);
              localStorage.setItem('slideProjects', JSON.stringify(projects));

              // Also save copy to Drive
              const result = await driveAPI.createPresentation(localCopy);
              localCopy.driveId = result.id;
              this.updateProjectDriveId(localCopy.name, result.id);

              // Keep remote version for original
              const remoteProject = await driveAPI.getPresentation(localProject.driveId);
              remoteProject.driveId = localProject.driveId;

              const projIndex = projects.findIndex(p => p.name === localProject.name);
              if (projIndex !== -1) {
                projects[projIndex] = remoteProject;
              }
              localStorage.setItem('slideProjects', JSON.stringify(projects));

              this.updateLocalSyncTime(localProject.name);
              this.updateLocalSyncTime(localCopy.name);
            }

            this.setStatus(SyncStatus.SYNCED);

            // Emit event for conflict resolution - UI handles modal closing
            emit(EventTypes.MODAL_CLOSED, { modalId: 'driveConflictModal' });

            resolve();
          } catch (error) {
            console.error('Conflict resolution error:', error);
            this.setStatus(SyncStatus.ERROR);
            resolve();
          }
        }
      }));
    });
  }

  /**
   * Pull all presentations from Drive
   */
  async pullFromDrive() {
    if (!driveAuth.isSignedIn()) return [];

    this.setStatus(SyncStatus.SYNCING);

    try {
      const driveProjects = await driveAPI.listPresentations();
      this.setStatus(SyncStatus.IDLE);
      return driveProjects;
    } catch (error) {
      this.setStatus(SyncStatus.ERROR);
      throw error;
    }
  }

  /**
   * Load a specific presentation from Drive
   */
  async loadFromDrive(fileId) {
    this.setStatus(SyncStatus.SYNCING);

    try {
      const project = await driveAPI.getPresentation(fileId);
      project.driveId = fileId;
      this.setStatus(SyncStatus.SYNCED);
      return project;
    } catch (error) {
      this.setStatus(SyncStatus.ERROR);
      throw error;
    }
  }

  /**
   * Sync pending changes when coming back online
   */
  syncPending() {
    const pending = localStorage.getItem(DriveConfig.STORAGE_KEYS.PENDING_SYNC);

    if (pending) {
      try {
        const project = JSON.parse(pending);
        this.performSync(project);
      } catch (e) {
        this.clearPendingSync();
      }
    }
  }

  /**
   * Check if sync is enabled
   */
  isSyncEnabled() {
    return localStorage.getItem(DriveConfig.STORAGE_KEYS.SYNC_ENABLED) === 'true';
  }

  /**
   * Enable or disable sync
   */
  enableSync(enabled) {
    localStorage.setItem(DriveConfig.STORAGE_KEYS.SYNC_ENABLED, String(enabled));
  }

  /**
   * Get last sync time for a project
   */
  getLastSyncTime(projectName) {
    const syncTimes = JSON.parse(
      localStorage.getItem(DriveConfig.STORAGE_KEYS.LAST_SYNC) || '{}'
    );
    return syncTimes[projectName] || 0;
  }

  /**
   * Update local sync time for a project
   */
  updateLocalSyncTime(projectName) {
    const syncTimes = JSON.parse(
      localStorage.getItem(DriveConfig.STORAGE_KEYS.LAST_SYNC) || '{}'
    );
    syncTimes[projectName] = Date.now();
    localStorage.setItem(DriveConfig.STORAGE_KEYS.LAST_SYNC, JSON.stringify(syncTimes));
  }

  /**
   * Update project's Drive ID in local storage
   */
  updateProjectDriveId(projectName, driveId) {
    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
    const project = projects.find(p => p.name === projectName);
    if (project) {
      project.driveId = driveId;
      localStorage.setItem('slideProjects', JSON.stringify(projects));
    }

    // Also update current project if active
    const currentProject = getProject();
    if (currentProject && currentProject.name === projectName) {
      currentProject.driveId = driveId;
    }
  }

  /**
   * Save pending sync to local storage
   */
  savePendingSync(project) {
    localStorage.setItem(DriveConfig.STORAGE_KEYS.PENDING_SYNC, JSON.stringify(project));
  }

  /**
   * Clear pending sync from local storage
   */
  clearPendingSync() {
    localStorage.removeItem(DriveConfig.STORAGE_KEYS.PENDING_SYNC);
  }

  /**
   * Set sync status and notify callbacks
   */
  setStatus(status, data) {
    this.currentStatus = status;
    this.statusCallbacks.forEach(cb => cb(status, data));
  }

  /**
   * Get current sync status
   */
  getStatus() {
    return this.currentStatus;
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback) {
    this.statusCallbacks.push(callback);
  }

  /**
   * Unsubscribe from status changes
   */
  offStatusChange(callback) {
    const index = this.statusCallbacks.indexOf(callback);
    if (index > -1) {
      this.statusCallbacks.splice(index, 1);
    }
  }
}

// Create singleton instance
const syncInstance = new DriveSync();

// Export instance and class
export { syncInstance as driveSync, DriveSync };
export default syncInstance;
