// drive/sync.js
// Bidirectional sync logic with conflict resolution
// Requires: drive/config.js, drive/auth.js, drive/api.js

window.DriveSync = (function() {
    let syncTimeout = null;
    let isSyncing = false;
    let pendingSync = null;

    // Sync status enum
    const SyncStatus = {
        IDLE: 'idle',
        SYNCING: 'syncing',
        SYNCED: 'synced',
        CONFLICT: 'conflict',
        ERROR: 'error',
        OFFLINE: 'offline'
    };

    let currentStatus = SyncStatus.IDLE;
    const statusCallbacks = [];

    // Queue a sync operation with debouncing
    function queueSync(project) {
        if (!DriveAuth.isSignedIn()) return;
        if (!isSyncEnabled()) return;

        pendingSync = JSON.parse(JSON.stringify(project)); // Deep clone

        if (syncTimeout) {
            clearTimeout(syncTimeout);
        }

        syncTimeout = setTimeout(() => {
            performSync(pendingSync);
        }, DriveConfig.SYNC.DEBOUNCE_MS);
    }

    // Perform the actual sync
    async function performSync(project, retryCount = 0) {
        if (isSyncing) {
            pendingSync = project;
            return;
        }

        if (!navigator.onLine) {
            setStatus(SyncStatus.OFFLINE);
            savePendingSync(project);
            return;
        }

        isSyncing = true;
        setStatus(SyncStatus.SYNCING);

        try {
            const driveId = project.driveId;

            if (driveId) {
                // Update existing file
                try {
                    const remoteMeta = await DriveAPI.getPresentationMetadata(driveId);
                    const conflict = detectConflict(project, remoteMeta);

                    if (conflict) {
                        setStatus(SyncStatus.CONFLICT);
                        await handleConflict(project, remoteMeta);
                    } else {
                        await DriveAPI.updatePresentation(driveId, project);
                        updateLocalSyncTime(project.name);
                        setStatus(SyncStatus.SYNCED);

                        // Auto-clear synced status after 3 seconds
                        setTimeout(() => {
                            if (currentStatus === SyncStatus.SYNCED) {
                                setStatus(SyncStatus.IDLE);
                            }
                        }, 3000);
                    }
                } catch (error) {
                    // If file not found, create new one
                    if (error.status === 404) {
                        const result = await DriveAPI.createPresentation(project);
                        project.driveId = result.id;
                        updateProjectDriveId(project.name, result.id);
                        updateLocalSyncTime(project.name);
                        setStatus(SyncStatus.SYNCED);
                    } else {
                        throw error;
                    }
                }
            } else {
                // Check if file with same name exists
                const existing = await DriveAPI.findByName(project.name);

                if (existing) {
                    // Link to existing file
                    project.driveId = existing.id;
                    updateProjectDriveId(project.name, existing.id);
                    await DriveAPI.updatePresentation(existing.id, project);
                } else {
                    // Create new file
                    const result = await DriveAPI.createPresentation(project);
                    project.driveId = result.id;
                    updateProjectDriveId(project.name, result.id);
                }

                updateLocalSyncTime(project.name);
                setStatus(SyncStatus.SYNCED);

                // Auto-clear synced status after 3 seconds
                setTimeout(() => {
                    if (currentStatus === SyncStatus.SYNCED) {
                        setStatus(SyncStatus.IDLE);
                    }
                }, 3000);
            }

            clearPendingSync();

        } catch (error) {
            console.error('Sync error:', error);

            if (retryCount < DriveConfig.SYNC.RETRY_ATTEMPTS) {
                const delay = Math.min(
                    DriveConfig.SYNC.RETRY_BASE_DELAY_MS * Math.pow(2, retryCount),
                    DriveConfig.SYNC.RETRY_MAX_DELAY_MS
                );

                setTimeout(() => {
                    performSync(project, retryCount + 1);
                }, delay);
            } else {
                setStatus(SyncStatus.ERROR);
                savePendingSync(project);

                // Show error notification
                if (typeof showToast === 'function') {
                    showToast('Erreur de synchronisation Drive', 'error');
                }
            }
        } finally {
            isSyncing = false;

            // Process any new pending sync
            if (pendingSync && pendingSync !== project) {
                const next = pendingSync;
                pendingSync = null;
                queueSync(next);
            }
        }
    }

    // Detect if there's a conflict between local and remote
    function detectConflict(localProject, remoteMeta) {
        const localTime = new Date(localProject.savedAt || 0).getTime();
        const remoteTime = new Date(remoteMeta.modifiedTime).getTime();
        const lastSyncTime = getLastSyncTime(localProject.name);

        // Conflict if remote changed after our last sync
        // and local also changed after last sync
        if (remoteTime > lastSyncTime && localTime > lastSyncTime) {
            const timeDiff = Math.abs(remoteTime - localTime);
            return timeDiff > DriveConfig.SYNC.CONFLICT_THRESHOLD_MS;
        }

        return false;
    }

    // Handle sync conflict - emit event for UI
    async function handleConflict(localProject, remoteMeta) {
        return new Promise((resolve) => {
            // Emit conflict event for UI to handle
            statusCallbacks.forEach(cb => cb(SyncStatus.CONFLICT, {
                local: localProject,
                remote: remoteMeta,
                resolve: async (choice) => {
                    try {
                        if (choice === 'local') {
                            // Force push local version
                            await DriveAPI.updatePresentation(
                                localProject.driveId,
                                localProject
                            );
                            updateLocalSyncTime(localProject.name);
                        } else if (choice === 'remote') {
                            // Pull remote version
                            const remoteProject = await DriveAPI.getPresentation(
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
                            if (window.currentProject && window.currentProject.name === localProject.name) {
                                window.currentProject = JSON.parse(JSON.stringify(remoteProject));
                                // Trigger UI update
                                if (typeof renderSlideList === 'function') renderSlideList();
                                if (typeof renderSettingsPanel === 'function') renderSettingsPanel();
                                if (typeof renderEditor === 'function') renderEditor();
                                if (typeof updatePreview === 'function') updatePreview();
                                if (typeof updateHeaderTitle === 'function') updateHeaderTitle();
                            }

                            updateLocalSyncTime(localProject.name);
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
                            const result = await DriveAPI.createPresentation(localCopy);
                            localCopy.driveId = result.id;
                            updateProjectDriveId(localCopy.name, result.id);

                            // Keep remote version for original
                            const remoteProject = await DriveAPI.getPresentation(localProject.driveId);
                            remoteProject.driveId = localProject.driveId;

                            const projIndex = projects.findIndex(p => p.name === localProject.name);
                            if (projIndex !== -1) {
                                projects[projIndex] = remoteProject;
                            }
                            localStorage.setItem('slideProjects', JSON.stringify(projects));

                            updateLocalSyncTime(localProject.name);
                            updateLocalSyncTime(localCopy.name);
                        }

                        setStatus(SyncStatus.SYNCED);

                        // Close conflict modal
                        const modal = document.getElementById('driveConflictModal');
                        if (modal) {
                            modal.classList.remove('active');
                        }

                        resolve();
                    } catch (error) {
                        console.error('Conflict resolution error:', error);
                        setStatus(SyncStatus.ERROR);
                        resolve();
                    }
                }
            }));
        });
    }

    // Pull all presentations from Drive
    async function pullFromDrive() {
        if (!DriveAuth.isSignedIn()) return [];

        setStatus(SyncStatus.SYNCING);

        try {
            const driveProjects = await DriveAPI.listPresentations();
            setStatus(SyncStatus.IDLE);
            return driveProjects;
        } catch (error) {
            setStatus(SyncStatus.ERROR);
            throw error;
        }
    }

    // Load a specific presentation from Drive
    async function loadFromDrive(fileId) {
        setStatus(SyncStatus.SYNCING);

        try {
            const project = await DriveAPI.getPresentation(fileId);
            project.driveId = fileId;
            setStatus(SyncStatus.SYNCED);
            return project;
        } catch (error) {
            setStatus(SyncStatus.ERROR);
            throw error;
        }
    }

    // Sync pending changes when coming back online
    function syncPending() {
        const pending = localStorage.getItem(DriveConfig.STORAGE_KEYS.PENDING_SYNC);

        if (pending) {
            try {
                const project = JSON.parse(pending);
                performSync(project);
            } catch (e) {
                clearPendingSync();
            }
        }
    }

    // Helper functions
    function isSyncEnabled() {
        return localStorage.getItem(DriveConfig.STORAGE_KEYS.SYNC_ENABLED) === 'true';
    }

    function enableSync(enabled) {
        localStorage.setItem(DriveConfig.STORAGE_KEYS.SYNC_ENABLED, String(enabled));
    }

    function getLastSyncTime(projectName) {
        const syncTimes = JSON.parse(
            localStorage.getItem(DriveConfig.STORAGE_KEYS.LAST_SYNC) || '{}'
        );
        return syncTimes[projectName] || 0;
    }

    function updateLocalSyncTime(projectName) {
        const syncTimes = JSON.parse(
            localStorage.getItem(DriveConfig.STORAGE_KEYS.LAST_SYNC) || '{}'
        );
        syncTimes[projectName] = Date.now();
        localStorage.setItem(DriveConfig.STORAGE_KEYS.LAST_SYNC, JSON.stringify(syncTimes));
    }

    function updateProjectDriveId(projectName, driveId) {
        const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
        const project = projects.find(p => p.name === projectName);
        if (project) {
            project.driveId = driveId;
            localStorage.setItem('slideProjects', JSON.stringify(projects));
        }

        // Also update current project if active
        if (window.currentProject && window.currentProject.name === projectName) {
            window.currentProject.driveId = driveId;
        }
    }

    function savePendingSync(project) {
        localStorage.setItem(DriveConfig.STORAGE_KEYS.PENDING_SYNC, JSON.stringify(project));
    }

    function clearPendingSync() {
        localStorage.removeItem(DriveConfig.STORAGE_KEYS.PENDING_SYNC);
    }

    function setStatus(status, data) {
        currentStatus = status;
        statusCallbacks.forEach(cb => cb(status, data));
    }

    function getStatus() {
        return currentStatus;
    }

    function onStatusChange(callback) {
        statusCallbacks.push(callback);
    }

    function offStatusChange(callback) {
        const index = statusCallbacks.indexOf(callback);
        if (index > -1) {
            statusCallbacks.splice(index, 1);
        }
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
        if (currentStatus === SyncStatus.OFFLINE) {
            syncPending();
        }
    });

    window.addEventListener('offline', () => {
        setStatus(SyncStatus.OFFLINE);
    });

    return {
        SyncStatus,
        queueSync,
        performSync,
        pullFromDrive,
        loadFromDrive,
        syncPending,
        isSyncEnabled,
        enableSync,
        getStatus,
        onStatusChange,
        offStatusChange
    };
})();
