# Google Drive Integration - Architecture Design Document

**Version:** 1.0
**Date:** 2026-01-17
**Status:** Proposed

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [Design Goals and Constraints](#design-goals-and-constraints)
4. [Module Architecture](#module-architecture)
5. [New Files to Create](#new-files-to-create)
6. [Modifications to Existing Files](#modifications-to-existing-files)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [API Design](#api-design)
9. [State Management](#state-management)
10. [UI Components](#ui-components)
11. [Error Handling Strategy](#error-handling-strategy)
12. [Offline Support Strategy](#offline-support-strategy)
13. [File Naming Convention](#file-naming-convention)
14. [Security Considerations](#security-considerations)
15. [Implementation Phases](#implementation-phases)

---

## 1. Executive Summary

This document outlines the architecture for integrating Google Drive storage into the Presentation Builder application. The integration will allow users to:

- Connect their Google Drive account
- Save presentations directly to Drive
- Load presentations from Drive
- Sync changes automatically with conflict resolution
- Work offline with automatic sync on reconnection

The design follows the existing modular pattern with window-attached functions and maintains backward compatibility with localStorage.

---

## 2. Current Architecture Analysis

### Existing Storage Pattern

```
localStorage
    |
    +-- slideProjects (JSON array)
            |
            +-- Project { name, metadata, theme, slides, savedAt }
```

### Key Integration Points

| Module | File | Purpose | Integration Need |
|--------|------|---------|------------------|
| State Management | `/app/state.js` | Global state, autosave | Add Drive sync state |
| Project Manager | `/projects/manager.js` | CRUD operations | Add Drive save/load |
| Import/Export | `/projects/import-export.js` | File operations | Add Drive import |
| Project Loading | `/app/project.js` | Initial load, title | Add Drive source option |
| Notifications | `/projects/notifications.js` | Toast messages | Reuse for Drive status |
| Modal | `/projects/modal.js` | UI dialogs | Add Drive folder picker |

### Current Autosave Flow

```
User Edit -> markAsChanged() -> debounce(1500ms) -> autosave() -> localStorage
```

---

## 3. Design Goals and Constraints

### Goals

1. **Non-breaking**: Existing localStorage functionality must continue to work
2. **Optional**: Drive integration is opt-in, not required
3. **Seamless**: Minimal UI changes for connected users
4. **Resilient**: Graceful degradation when offline or Drive unavailable
5. **Consistent**: Follow existing code patterns (window-attached functions, modular files)

### Constraints

1. No build system or bundler (vanilla JS)
2. No external state management library
3. Must work with existing autosave debouncing
4. Google API libraries loaded via CDN

---

## 4. Module Architecture

### Module Dependency Graph

```
                    +------------------+
                    |   Google API     |
                    |   (External)     |
                    +--------+---------+
                             |
                    +--------v---------+
                    |  drive/auth.js   |
                    |  Authentication  |
                    +--------+---------+
                             |
         +-------------------+-------------------+
         |                   |                   |
+--------v--------+ +--------v--------+ +--------v--------+
| drive/api.js    | | drive/sync.js   | | drive/picker.js |
| API Operations  | | Sync Logic      | | Folder Picker   |
+-----------------+ +--------+--------+ +-----------------+
                             |
                    +--------v---------+
                    | drive/storage.js |
                    | Storage Adapter  |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
     +--------v--------+           +--------v--------+
     | projects/       |           | app/state.js    |
     | manager.js      |           | Drive State     |
     +-----------------+           +-----------------+
```

### Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| `drive/auth.js` | OAuth 2.0 flow, token management, session state |
| `drive/api.js` | Google Drive API wrapper (CRUD operations) |
| `drive/sync.js` | Bidirectional sync, conflict resolution |
| `drive/picker.js` | Google Picker API for folder selection |
| `drive/storage.js` | Storage adapter abstracting localStorage vs Drive |
| `drive/config.js` | Client ID, scopes, folder settings |
| `drive/ui.js` | UI components (status indicator, settings modal) |

---

## 5. New Files to Create

### Directory Structure

```
presentation-builder/
+-- drive/
|   +-- config.js          # Configuration constants
|   +-- auth.js            # Authentication module
|   +-- api.js             # Drive API wrapper
|   +-- sync.js            # Synchronization logic
|   +-- picker.js          # Folder picker integration
|   +-- storage.js         # Storage abstraction layer
|   +-- ui.js              # UI components and state
|   +-- index.js           # Module initialization and exports
|
+-- styles/
    +-- components/
        +-- drive.css      # Drive-specific styles
```

### File Specifications

#### `/drive/config.js`

```javascript
// drive/config.js
// Google Drive configuration constants

window.DriveConfig = {
    // OAuth 2.0 Client ID (to be configured)
    CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',

    // API Key for Picker
    API_KEY: 'YOUR_API_KEY',

    // OAuth scopes
    SCOPES: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.appdata'
    ].join(' '),

    // Discovery docs
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

    // Sync settings
    SYNC: {
        DEBOUNCE_MS: 3000,        // 3 seconds after last change
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY_MS: 1000,
        CONFLICT_THRESHOLD_MS: 5000  // 5 second window for conflicts
    },

    // Local storage keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'drive_auth_token',
        FOLDER_ID: 'drive_folder_id',
        SYNC_ENABLED: 'drive_sync_enabled',
        LAST_SYNC: 'drive_last_sync',
        PENDING_SYNC: 'drive_pending_sync'
    }
};
```

#### `/drive/auth.js`

```javascript
// drive/auth.js
// Google OAuth 2.0 authentication module
// Requires: drive/config.js

window.DriveAuth = (function() {
    let tokenClient = null;
    let isInitialized = false;
    let currentUser = null;

    // Event callbacks
    const callbacks = {
        onSignIn: [],
        onSignOut: [],
        onError: []
    };

    function init() {
        return new Promise((resolve, reject) => {
            if (isInitialized) {
                resolve();
                return;
            }

            // Load Google Identity Services
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: DriveConfig.API_KEY,
                        discoveryDocs: DriveConfig.DISCOVERY_DOCS
                    });

                    tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: DriveConfig.CLIENT_ID,
                        scope: DriveConfig.SCOPES,
                        callback: handleTokenResponse
                    });

                    isInitialized = true;

                    // Check for existing session
                    const savedToken = localStorage.getItem(
                        DriveConfig.STORAGE_KEYS.AUTH_TOKEN
                    );
                    if (savedToken) {
                        await restoreSession(savedToken);
                    }

                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    function handleTokenResponse(response) {
        if (response.error) {
            triggerCallbacks('onError', response);
            return;
        }

        localStorage.setItem(
            DriveConfig.STORAGE_KEYS.AUTH_TOKEN,
            JSON.stringify(response)
        );

        fetchUserInfo().then(user => {
            currentUser = user;
            triggerCallbacks('onSignIn', user);
        });
    }

    async function restoreSession(tokenJson) {
        try {
            const token = JSON.parse(tokenJson);
            gapi.client.setToken(token);
            currentUser = await fetchUserInfo();
            triggerCallbacks('onSignIn', currentUser);
        } catch (error) {
            localStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN);
        }
    }

    async function fetchUserInfo() {
        const response = await gapi.client.drive.about.get({
            fields: 'user(displayName,emailAddress,photoLink)'
        });
        return response.result.user;
    }

    function signIn() {
        if (!isInitialized) {
            console.error('DriveAuth not initialized');
            return;
        }
        tokenClient.requestAccessToken({ prompt: 'consent' });
    }

    function signOut() {
        const token = gapi.client.getToken();
        if (token) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken(null);
        }

        localStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN);
        currentUser = null;
        triggerCallbacks('onSignOut');
    }

    function isSignedIn() {
        return currentUser !== null;
    }

    function getUser() {
        return currentUser;
    }

    function on(event, callback) {
        if (callbacks[event]) {
            callbacks[event].push(callback);
        }
    }

    function off(event, callback) {
        if (callbacks[event]) {
            callbacks[event] = callbacks[event].filter(cb => cb !== callback);
        }
    }

    function triggerCallbacks(event, data) {
        if (callbacks[event]) {
            callbacks[event].forEach(cb => cb(data));
        }
    }

    return {
        init,
        signIn,
        signOut,
        isSignedIn,
        getUser,
        on,
        off
    };
})();
```

#### `/drive/api.js`

```javascript
// drive/api.js
// Google Drive API wrapper for file operations
// Requires: drive/config.js, drive/auth.js

window.DriveAPI = (function() {

    // Get or create app folder
    async function getAppFolder() {
        const folderId = localStorage.getItem(DriveConfig.STORAGE_KEYS.FOLDER_ID);

        if (folderId) {
            try {
                // Verify folder still exists
                await gapi.client.drive.files.get({
                    fileId: folderId,
                    fields: 'id'
                });
                return folderId;
            } catch (e) {
                // Folder deleted, create new one
                localStorage.removeItem(DriveConfig.STORAGE_KEYS.FOLDER_ID);
            }
        }

        // Search for existing folder
        const searchResponse = await gapi.client.drive.files.list({
            q: `name='${DriveConfig.APP_FOLDER_NAME}' and mimeType='${DriveConfig.MIME_TYPES.FOLDER}' and trashed=false`,
            fields: 'files(id)',
            spaces: 'drive'
        });

        if (searchResponse.result.files.length > 0) {
            const id = searchResponse.result.files[0].id;
            localStorage.setItem(DriveConfig.STORAGE_KEYS.FOLDER_ID, id);
            return id;
        }

        // Create new folder
        const createResponse = await gapi.client.drive.files.create({
            resource: {
                name: DriveConfig.APP_FOLDER_NAME,
                mimeType: DriveConfig.MIME_TYPES.FOLDER
            },
            fields: 'id'
        });

        const newId = createResponse.result.id;
        localStorage.setItem(DriveConfig.STORAGE_KEYS.FOLDER_ID, newId);
        return newId;
    }

    // List all presentations in app folder
    async function listPresentations() {
        const folderId = await getAppFolder();

        const response = await gapi.client.drive.files.list({
            q: `'${folderId}' in parents and mimeType='${DriveConfig.MIME_TYPES.JSON}' and trashed=false`,
            fields: 'files(id,name,modifiedTime,size,properties)',
            orderBy: 'modifiedTime desc',
            spaces: 'drive'
        });

        return response.result.files.map(file => ({
            id: file.id,
            name: file.name.replace('.presentation.json', ''),
            modifiedTime: file.modifiedTime,
            size: parseInt(file.size, 10),
            driveId: file.id,
            properties: file.properties || {}
        }));
    }

    // Get presentation content by ID
    async function getPresentation(fileId) {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        });

        return response.result;
    }

    // Get presentation metadata
    async function getPresentationMetadata(fileId) {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            fields: 'id,name,modifiedTime,version,properties'
        });

        return response.result;
    }

    // Create new presentation
    async function createPresentation(project) {
        const folderId = await getAppFolder();
        const fileName = sanitizeFileName(project.name);

        const metadata = {
            name: `${fileName}.presentation.json`,
            mimeType: DriveConfig.MIME_TYPES.JSON,
            parents: [folderId],
            properties: {
                appVersion: '1.0',
                slideCount: String(project.slides.length),
                lastLocalSave: project.savedAt || new Date().toISOString()
            }
        };

        const content = JSON.stringify(project, null, 2);

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], {
            type: 'application/json'
        }));
        form.append('file', new Blob([content], {
            type: DriveConfig.MIME_TYPES.JSON
        }));

        const response = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gapi.client.getToken().access_token}`
                },
                body: form
            }
        );

        return await response.json();
    }

    // Update existing presentation
    async function updatePresentation(fileId, project) {
        const fileName = sanitizeFileName(project.name);

        const metadata = {
            name: `${fileName}.presentation.json`,
            properties: {
                appVersion: '1.0',
                slideCount: String(project.slides.length),
                lastLocalSave: project.savedAt || new Date().toISOString()
            }
        };

        const content = JSON.stringify(project, null, 2);

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], {
            type: 'application/json'
        }));
        form.append('file', new Blob([content], {
            type: DriveConfig.MIME_TYPES.JSON
        }));

        const response = await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id,name,modifiedTime`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${gapi.client.getToken().access_token}`
                },
                body: form
            }
        );

        return await response.json();
    }

    // Delete presentation
    async function deletePresentation(fileId) {
        await gapi.client.drive.files.delete({
            fileId: fileId
        });
    }

    // Move to trash (soft delete)
    async function trashPresentation(fileId) {
        await gapi.client.drive.files.update({
            fileId: fileId,
            resource: { trashed: true }
        });
    }

    // Helper: sanitize file name
    function sanitizeFileName(name) {
        return (name || 'Sans titre')
            .replace(/[<>:"/\\|?*]/g, '-')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 100);
    }

    return {
        getAppFolder,
        listPresentations,
        getPresentation,
        getPresentationMetadata,
        createPresentation,
        updatePresentation,
        deletePresentation,
        trashPresentation,
        sanitizeFileName
    };
})();
```

#### `/drive/sync.js`

```javascript
// drive/sync.js
// Bidirectional sync logic with conflict resolution
// Requires: drive/config.js, drive/api.js

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

        pendingSync = project;

        if (syncTimeout) {
            clearTimeout(syncTimeout);
        }

        setStatus(SyncStatus.IDLE);

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
                const remoteMeta = await DriveAPI.getPresentationMetadata(driveId);
                const conflict = detectConflict(project, remoteMeta);

                if (conflict) {
                    setStatus(SyncStatus.CONFLICT);
                    await handleConflict(project, remoteMeta);
                } else {
                    await DriveAPI.updatePresentation(driveId, project);
                    updateLocalSyncTime(project.name);
                    setStatus(SyncStatus.SYNCED);
                }
            } else {
                // Create new file
                const result = await DriveAPI.createPresentation(project);
                project.driveId = result.id;
                updateProjectDriveId(project.name, result.id);
                updateLocalSyncTime(project.name);
                setStatus(SyncStatus.SYNCED);
            }

            clearPendingSync();

        } catch (error) {
            console.error('Sync error:', error);

            if (retryCount < DriveConfig.SYNC.RETRY_ATTEMPTS) {
                setTimeout(() => {
                    performSync(project, retryCount + 1);
                }, DriveConfig.SYNC.RETRY_DELAY_MS * (retryCount + 1));
            } else {
                setStatus(SyncStatus.ERROR);
                savePendingSync(project);
            }
        } finally {
            isSyncing = false;

            // Process any pending sync
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

    // Handle sync conflict
    async function handleConflict(localProject, remoteMeta) {
        // Emit conflict event for UI to handle
        statusCallbacks.forEach(cb => cb(SyncStatus.CONFLICT, {
            local: localProject,
            remote: remoteMeta,
            resolve: async (choice) => {
                if (choice === 'local') {
                    // Force push local version
                    await DriveAPI.updatePresentation(
                        localProject.driveId,
                        localProject
                    );
                } else if (choice === 'remote') {
                    // Pull remote version
                    const remoteProject = await DriveAPI.getPresentation(
                        localProject.driveId
                    );
                    Object.assign(localProject, remoteProject);
                    window.currentProject = localProject;
                    renderAll();
                } else if (choice === 'both') {
                    // Keep both - create copy
                    localProject.name += ' (local copy)';
                    delete localProject.driveId;
                    await DriveAPI.createPresentation(localProject);
                }
                setStatus(SyncStatus.SYNCED);
            }
        }));
    }

    // Pull all presentations from Drive
    async function pullFromDrive() {
        if (!DriveAuth.isSignedIn()) return [];

        setStatus(SyncStatus.SYNCING);

        try {
            const driveProjects = await DriveAPI.listPresentations();
            setStatus(SyncStatus.SYNCED);
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
        const pending = localStorage.getItem(
            DriveConfig.STORAGE_KEYS.PENDING_SYNC
        );

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
        return localStorage.getItem(
            DriveConfig.STORAGE_KEYS.SYNC_ENABLED
        ) === 'true';
    }

    function enableSync(enabled) {
        localStorage.setItem(
            DriveConfig.STORAGE_KEYS.SYNC_ENABLED,
            String(enabled)
        );
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
        localStorage.setItem(
            DriveConfig.STORAGE_KEYS.LAST_SYNC,
            JSON.stringify(syncTimes)
        );
    }

    function updateProjectDriveId(projectName, driveId) {
        const projects = JSON.parse(
            localStorage.getItem('slideProjects') || '[]'
        );
        const project = projects.find(p => p.name === projectName);
        if (project) {
            project.driveId = driveId;
            localStorage.setItem('slideProjects', JSON.stringify(projects));
        }
    }

    function savePendingSync(project) {
        localStorage.setItem(
            DriveConfig.STORAGE_KEYS.PENDING_SYNC,
            JSON.stringify(project)
        );
    }

    function clearPendingSync() {
        localStorage.removeItem(DriveConfig.STORAGE_KEYS.PENDING_SYNC);
    }

    function setStatus(status) {
        currentStatus = status;
        statusCallbacks.forEach(cb => cb(status));
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
```

#### `/drive/ui.js`

```javascript
// drive/ui.js
// Drive UI components and state indicators
// Requires: drive/config.js, drive/auth.js, drive/sync.js

window.DriveUI = (function() {

    // Render the sync status indicator in header
    function renderSyncIndicator() {
        const container = document.getElementById('driveSyncStatus');
        if (!container) return;

        const status = DriveSync.getStatus();
        const isSignedIn = DriveAuth.isSignedIn();

        if (!isSignedIn) {
            container.innerHTML = `
                <button class="btn btn-ghost drive-connect-btn" onclick="DriveUI.openSettingsModal()">
                    <svg class="icon" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    Connecter Drive
                </button>
            `;
            return;
        }

        const statusConfig = {
            idle: { icon: 'cloud', text: '', class: '' },
            syncing: { icon: 'sync', text: 'Synchronisation...', class: 'syncing' },
            synced: { icon: 'cloud-check', text: 'Synchronise', class: 'synced' },
            conflict: { icon: 'alert', text: 'Conflit', class: 'conflict' },
            error: { icon: 'cloud-off', text: 'Erreur sync', class: 'error' },
            offline: { icon: 'cloud-off', text: 'Hors ligne', class: 'offline' }
        };

        const config = statusConfig[status] || statusConfig.idle;

        container.innerHTML = `
            <div class="drive-status ${config.class}" onclick="DriveUI.openSettingsModal()">
                ${getSyncIcon(config.icon)}
                <span class="drive-status-text">${config.text}</span>
            </div>
        `;
    }

    function getSyncIcon(type) {
        const icons = {
            cloud: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
            sync: '<svg class="icon drive-sync-spinner" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
            'cloud-check': '<svg class="icon" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><path d="M9 12l2 2 4-4"/></svg>',
            'cloud-off': '<svg class="icon" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"/></svg>',
            alert: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
        };
        return icons[type] || icons.cloud;
    }

    // Open settings modal
    function openSettingsModal() {
        const modal = document.getElementById('driveSettingsModal');
        if (modal) {
            updateSettingsModal();
            modal.classList.add('active');
        }
    }

    // Close settings modal
    function closeSettingsModal() {
        const modal = document.getElementById('driveSettingsModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Update settings modal content
    function updateSettingsModal() {
        const isSignedIn = DriveAuth.isSignedIn();
        const user = DriveAuth.getUser();
        const syncEnabled = DriveSync.isSyncEnabled();

        const accountSection = document.getElementById('driveAccountSection');
        const syncSection = document.getElementById('driveSyncSection');

        if (accountSection) {
            if (isSignedIn && user) {
                accountSection.innerHTML = `
                    <div class="drive-account-info">
                        <img src="${user.photoLink || ''}" alt="" class="drive-avatar">
                        <div class="drive-account-details">
                            <span class="drive-account-name">${escapeHtml(user.displayName)}</span>
                            <span class="drive-account-email">${escapeHtml(user.emailAddress)}</span>
                        </div>
                        <button class="btn btn-secondary" onclick="DriveUI.handleSignOut()">
                            Deconnecter
                        </button>
                    </div>
                `;
            } else {
                accountSection.innerHTML = `
                    <div class="drive-connect-prompt">
                        <p>Connectez votre compte Google Drive pour synchroniser vos presentations.</p>
                        <button class="btn btn-primary" onclick="DriveUI.handleSignIn()">
                            <svg class="icon" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            Connecter Google Drive
                        </button>
                    </div>
                `;
            }
        }

        if (syncSection) {
            syncSection.style.display = isSignedIn ? 'block' : 'none';

            if (isSignedIn) {
                const syncToggle = document.getElementById('driveSyncToggle');
                if (syncToggle) {
                    syncToggle.checked = syncEnabled;
                }
            }
        }
    }

    // Handle sign in
    async function handleSignIn() {
        try {
            await DriveAuth.init();
            DriveAuth.signIn();
        } catch (error) {
            showToast('Erreur de connexion Google Drive', 'error');
        }
    }

    // Handle sign out
    function handleSignOut() {
        DriveAuth.signOut();
        DriveSync.enableSync(false);
        updateSettingsModal();
        renderSyncIndicator();
        showToast('Deconnecte de Google Drive');
    }

    // Handle sync toggle
    function handleSyncToggle(enabled) {
        DriveSync.enableSync(enabled);
        if (enabled && window.currentProject) {
            DriveSync.queueSync(window.currentProject);
        }
        showToast(enabled ? 'Synchronisation activee' : 'Synchronisation desactivee');
    }

    // Render folder picker button
    function openFolderPicker() {
        if (window.DrivePicker) {
            DrivePicker.open();
        }
    }

    // Render Drive projects in project list
    async function renderDriveProjects() {
        const container = document.getElementById('driveProjectList');
        if (!container) return;

        if (!DriveAuth.isSignedIn()) {
            container.innerHTML = '<p class="drive-projects-empty">Connectez-vous pour voir vos projets Drive</p>';
            return;
        }

        container.innerHTML = '<p class="drive-projects-loading">Chargement...</p>';

        try {
            const projects = await DriveSync.pullFromDrive();

            if (projects.length === 0) {
                container.innerHTML = '<p class="drive-projects-empty">Aucun projet sur Drive</p>';
                return;
            }

            container.innerHTML = projects.map((project, i) => `
                <div class="project-item drive-project" onclick="DriveUI.loadDriveProject('${project.id}')">
                    <div class="project-item-info">
                        <h4>
                            <svg class="icon icon-sm drive-icon" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            ${escapeHtml(project.name)}
                        </h4>
                        <span>${new Date(project.modifiedTime).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div class="project-item-actions">
                        <button class="slide-item-btn delete" onclick="event.stopPropagation(); DriveUI.deleteDriveProject('${project.id}')" title="Supprimer">
                            <svg class="icon icon-sm" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            container.innerHTML = '<p class="drive-projects-error">Erreur de chargement</p>';
        }
    }

    // Load project from Drive
    async function loadDriveProject(fileId) {
        try {
            const project = await DriveSync.loadFromDrive(fileId);
            window.currentProject = JSON.parse(JSON.stringify(project));
            window.selectedSlideIndex = project.slides.length > 0 ? 0 : -1;

            renderSlideList();
            renderSettingsPanel();
            renderEditor();
            updatePreview();
            updateHeaderTitle();
            initMermaid();
            clearUnsavedChanges();
            closeModal('projectsModal');

            showToast('Projet charge depuis Drive');
        } catch (error) {
            showToast('Erreur de chargement', 'error');
        }
    }

    // Delete project from Drive
    async function deleteDriveProject(fileId) {
        if (!confirm('Supprimer ce projet de Drive ?')) return;

        try {
            await DriveAPI.trashPresentation(fileId);
            renderDriveProjects();
            showToast('Projet supprime de Drive');
        } catch (error) {
            showToast('Erreur de suppression', 'error');
        }
    }

    // Render conflict resolution modal
    function showConflictModal(localProject, remoteMeta, resolve) {
        const modal = document.getElementById('driveConflictModal');
        if (!modal) return;

        const localTime = new Date(localProject.savedAt).toLocaleString('fr-FR');
        const remoteTime = new Date(remoteMeta.modifiedTime).toLocaleString('fr-FR');

        document.getElementById('conflictLocalTime').textContent = localTime;
        document.getElementById('conflictRemoteTime').textContent = remoteTime;

        window.resolveConflict = resolve;
        modal.classList.add('active');
    }

    // Initialize UI event listeners
    function init() {
        // Auth state changes
        DriveAuth.on('onSignIn', () => {
            renderSyncIndicator();
            updateSettingsModal();
            if (DriveSync.isSyncEnabled()) {
                DriveSync.syncPending();
            }
        });

        DriveAuth.on('onSignOut', () => {
            renderSyncIndicator();
            updateSettingsModal();
        });

        // Sync status changes
        DriveSync.onStatusChange((status, data) => {
            renderSyncIndicator();

            if (status === DriveSync.SyncStatus.CONFLICT && data) {
                showConflictModal(data.local, data.remote, data.resolve);
            }
        });

        // Initial render
        renderSyncIndicator();
    }

    return {
        init,
        renderSyncIndicator,
        openSettingsModal,
        closeSettingsModal,
        handleSignIn,
        handleSignOut,
        handleSyncToggle,
        openFolderPicker,
        renderDriveProjects,
        loadDriveProject,
        deleteDriveProject,
        showConflictModal
    };
})();
```

#### `/drive/index.js`

```javascript
// drive/index.js
// Drive module initialization
// Requires: All other drive modules

window.initDrive = async function() {
    // Check if Google API is available
    if (typeof gapi === 'undefined' || typeof google === 'undefined') {
        console.warn('Google API not loaded, Drive features disabled');
        return;
    }

    try {
        // Initialize authentication
        await DriveAuth.init();

        // Initialize UI
        DriveUI.init();

        // Hook into existing autosave
        const originalAutosave = window.autosave;
        window.autosave = function() {
            originalAutosave();

            // Queue Drive sync if enabled
            if (DriveAuth.isSignedIn() && DriveSync.isSyncEnabled()) {
                DriveSync.queueSync(window.currentProject);
            }
        };

        console.log('Google Drive integration initialized');

    } catch (error) {
        console.error('Failed to initialize Drive:', error);
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Google API to load
    if (typeof gapi !== 'undefined') {
        window.initDrive();
    }
});
```

#### `/styles/components/drive.css`

```css
/* Google Drive Integration Styles */

/* Sync Status Indicator */
.drive-status {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    color: var(--gray-400);
    cursor: pointer;
    transition: all 0.2s ease;
}

.drive-status:hover {
    background: var(--gray-800);
}

.drive-status .icon {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
}

.drive-status.syncing {
    color: var(--warning);
}

.drive-status.synced {
    color: var(--confirm);
}

.drive-status.conflict {
    color: var(--error);
}

.drive-status.error {
    color: var(--error);
}

.drive-status.offline {
    color: var(--gray-500);
}

/* Sync spinner animation */
.drive-sync-spinner {
    animation: drive-spin 1s linear infinite;
}

@keyframes drive-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Connect button */
.drive-connect-btn {
    gap: 6px;
}

.drive-connect-btn .icon {
    width: 16px;
    height: 16px;
}

/* Settings Modal */
.drive-account-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--gray-100);
    border-radius: 8px;
    margin-bottom: 20px;
}

.drive-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
}

.drive-account-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.drive-account-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--gray-900);
}

.drive-account-email {
    font-size: 13px;
    color: var(--gray-500);
}

.drive-connect-prompt {
    text-align: center;
    padding: 24px;
}

.drive-connect-prompt p {
    margin-bottom: 16px;
    color: var(--gray-600);
}

/* Sync Toggle */
.drive-sync-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--gray-200);
}

.drive-sync-toggle label {
    font-size: 14px;
    font-weight: 500;
}

.drive-sync-toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
}

.drive-sync-toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.drive-sync-toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--gray-300);
    transition: 0.3s;
    border-radius: 24px;
}

.drive-sync-toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
}

.drive-sync-toggle-switch input:checked + .drive-sync-toggle-slider {
    background-color: var(--accent-main);
}

.drive-sync-toggle-switch input:checked + .drive-sync-toggle-slider:before {
    transform: translateX(20px);
}

/* Drive Project List */
.drive-projects-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--gray-200);
}

.drive-projects-section h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    margin-bottom: 12px;
}

.drive-projects-section h4 .icon {
    width: 16px;
    height: 16px;
    stroke: var(--accent-main);
}

.drive-project .drive-icon {
    stroke: var(--accent-main);
    margin-right: 4px;
    vertical-align: -2px;
}

.drive-projects-empty,
.drive-projects-loading,
.drive-projects-error {
    text-align: center;
    padding: 20px;
    color: var(--gray-500);
    font-size: 13px;
}

.drive-projects-error {
    color: var(--error);
}

/* Conflict Modal */
.conflict-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
}

.conflict-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border: 2px solid var(--gray-200);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.conflict-option:hover {
    border-color: var(--accent-third);
    background: rgba(252, 109, 38, 0.02);
}

.conflict-option.selected {
    border-color: var(--accent-main);
    background: rgba(252, 109, 38, 0.05);
}

.conflict-option-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gray-100);
    border-radius: 8px;
    flex-shrink: 0;
}

.conflict-option-icon .icon {
    width: 20px;
    height: 20px;
    stroke: var(--gray-600);
}

.conflict-option-content h5 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
}

.conflict-option-content p {
    font-size: 13px;
    color: var(--gray-500);
    line-height: 1.4;
}

.conflict-timestamps {
    display: flex;
    gap: 24px;
    margin-top: 16px;
    padding: 12px;
    background: var(--gray-100);
    border-radius: 8px;
}

.conflict-timestamp {
    flex: 1;
}

.conflict-timestamp-label {
    font-size: 11px;
    text-transform: uppercase;
    color: var(--gray-500);
    margin-bottom: 4px;
}

.conflict-timestamp-value {
    font-size: 13px;
    font-weight: 500;
}

/* Folder Info */
.drive-folder-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--gray-100);
    border-radius: 8px;
    margin-top: 12px;
}

.drive-folder-info .icon {
    width: 20px;
    height: 20px;
    stroke: var(--accent-main);
}

.drive-folder-info span {
    flex: 1;
    font-size: 13px;
    color: var(--gray-700);
}
```

---

## 6. Modifications to Existing Files

### `/slide-editor.html`

Add before closing `</head>`:

```html
<!-- Google API Scripts -->
<script src="https://apis.google.com/js/api.js" async defer></script>
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

Add to imports in `<head>`:

```html
<link rel="stylesheet" href="styles/components/drive.css">
```

Add after save-status div in header-actions:

```html
<div id="driveSyncStatus"></div>
```

Add new modals before closing `</body>`:

```html
<!-- Drive Settings Modal -->
<div class="modal-overlay" id="driveSettingsModal">
    <div class="modal">
        <div class="modal-header">
            <h3>Google Drive</h3>
            <button class="modal-close" onclick="DriveUI.closeSettingsModal()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
        <div class="modal-body">
            <div id="driveAccountSection"></div>
            <div id="driveSyncSection">
                <div class="drive-sync-toggle">
                    <label>Synchronisation automatique</label>
                    <div class="drive-sync-toggle-switch">
                        <input type="checkbox" id="driveSyncToggle" onchange="DriveUI.handleSyncToggle(this.checked)">
                        <span class="drive-sync-toggle-slider"></span>
                    </div>
                </div>
                <div class="drive-folder-info" id="driveFolderInfo">
                    <svg class="icon" viewBox="0 0 24 24">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>Dossier: Presentation Builder</span>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Drive Conflict Modal -->
<div class="modal-overlay" id="driveConflictModal">
    <div class="modal modal-lg">
        <div class="modal-header">
            <h3>Conflit de synchronisation</h3>
        </div>
        <div class="modal-body">
            <p>Ce projet a ete modifie a la fois localement et sur Drive.</p>
            <div class="conflict-timestamps">
                <div class="conflict-timestamp">
                    <div class="conflict-timestamp-label">Version locale</div>
                    <div class="conflict-timestamp-value" id="conflictLocalTime"></div>
                </div>
                <div class="conflict-timestamp">
                    <div class="conflict-timestamp-label">Version Drive</div>
                    <div class="conflict-timestamp-value" id="conflictRemoteTime"></div>
                </div>
            </div>
            <div class="conflict-options">
                <div class="conflict-option" onclick="resolveConflict('local')">
                    <div class="conflict-option-icon">
                        <svg class="icon" viewBox="0 0 24 24">
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                    </div>
                    <div class="conflict-option-content">
                        <h5>Garder la version locale</h5>
                        <p>Remplacer la version Drive par votre version locale</p>
                    </div>
                </div>
                <div class="conflict-option" onclick="resolveConflict('remote')">
                    <div class="conflict-option-icon">
                        <svg class="icon" viewBox="0 0 24 24">
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </div>
                    <div class="conflict-option-content">
                        <h5>Garder la version Drive</h5>
                        <p>Remplacer votre version locale par celle de Drive</p>
                    </div>
                </div>
                <div class="conflict-option" onclick="resolveConflict('both')">
                    <div class="conflict-option-icon">
                        <svg class="icon" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                    </div>
                    <div class="conflict-option-content">
                        <h5>Garder les deux</h5>
                        <p>Creer une copie locale et conserver les deux versions</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

Add script imports before `</body>` (after existing scripts):

```html
<!-- Drive modules - load after app modules -->
<script src="drive/config.js"></script>
<script src="drive/auth.js"></script>
<script src="drive/api.js"></script>
<script src="drive/sync.js"></script>
<script src="drive/ui.js"></script>
<script src="drive/index.js"></script>
```

### `/projects/modal.js`

Add Drive projects section to `renderProjectList()`:

```javascript
function renderProjectList() {
    const list = document.getElementById('projectList');
    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');

    // Local projects
    if (projects.length === 0) {
        list.innerHTML = '<p style="color: var(--gray-500); text-align: center;">Aucun projet local</p>';
    } else {
        list.innerHTML = projects.map((project, i) => `
            <div class="project-item" onclick="loadProject(${i})">
                <div class="project-item-info">
                    <h4>${escapeHtml(project.name)}</h4>
                    <span>${project.slides.length} slides - ${new Date(project.savedAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="project-item-actions">
                    <button class="slide-item-btn delete" onclick="event.stopPropagation(); deleteProject(${i})" title="Supprimer">
                        <svg class="icon icon-sm" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Drive projects section (if available)
    if (typeof DriveUI !== 'undefined') {
        const driveSection = document.getElementById('driveProjectsSection');
        if (driveSection) {
            DriveUI.renderDriveProjects();
        }
    }
}
```

### `/app/state.js`

Add Drive sync integration to autosave:

```javascript
// At the end of the file, add:

// Drive sync state
window.driveState = {
    isConnected: false,
    isSyncing: false,
    lastSyncTime: null,
    syncError: null
};

// Extended autosave with Drive sync
const originalAutosave = window.autosave;
window.autosave = function() {
    // Call original localStorage save
    originalAutosave();

    // Trigger Drive sync if available and enabled
    if (typeof DriveSync !== 'undefined' &&
        typeof DriveAuth !== 'undefined' &&
        DriveAuth.isSignedIn() &&
        DriveSync.isSyncEnabled()) {
        DriveSync.queueSync(window.currentProject);
    }
};
```

### `/styles/main.css`

Add import:

```css
@import url('./components/drive.css');
```

---

## 7. Data Flow Diagrams

### Authentication Flow

```
+--------+     +-------------+     +------------------+     +---------------+
|  User  | --> | Click Sign  | --> | Google OAuth     | --> | Token         |
|        |     | In Button   |     | Consent Screen   |     | Returned      |
+--------+     +-------------+     +------------------+     +-------+-------+
                                                                    |
                                                                    v
+--------+     +-------------+     +------------------+     +---------------+
|  UI    | <-- | DriveUI     | <-- | DriveAuth        | <-- | Store Token   |
| Update |     | onSignIn    |     | handleToken      |     | localStorage  |
+--------+     +-------------+     +------------------+     +---------------+
```

### Save/Sync Flow

```
+----------+     +-----------+     +-------------+     +-------------+
| User     | --> | markAs    | --> | debounce    | --> | autosave()  |
| Edit     |     | Changed() |     | 1500ms      |     |             |
+----------+     +-----------+     +-------------+     +------+------+
                                                              |
                      +---------------------------------------+
                      |                                       |
                      v                                       v
               +-------------+                         +-------------+
               | localStorage|                         | DriveSync   |
               | save        |                         | queueSync() |
               +-------------+                         +------+------+
                                                              |
                                                              v
                                                       +-------------+
                                                       | debounce    |
                                                       | 3000ms      |
                                                       +------+------+
                                                              |
                                                              v
                                                       +-------------+
                                                       | DriveAPI    |
                                                       | update/     |
                                                       | create      |
                                                       +-------------+
```

### Load Flow

```
+----------+     +---------------+     +---------------+
| User     | --> | Select        | --> | Source?       |
| clicks   |     | Project       |     |               |
| load     |     |               |     +-------+-------+
+----------+     +---------------+             |
                                               |
                      +------------------------+------------------------+
                      |                                                 |
                      v                                                 v
               +-------------+                                   +-------------+
               | Local       |                                   | Drive       |
               | Storage     |                                   | Source      |
               +------+------+                                   +------+------+
                      |                                                 |
                      v                                                 v
               +-------------+                                   +-------------+
               | loadProject |                                   | DriveSync   |
               | (index)     |                                   | loadFromDrive|
               +------+------+                                   +------+------+
                      |                                                 |
                      +------------------------+------------------------+
                                               |
                                               v
                                        +-------------+
                                        | Render UI   |
                                        | Update      |
                                        | State       |
                                        +-------------+
```

### Conflict Resolution Flow

```
+-------------+     +----------------+     +------------------+
| Sync        | --> | Compare        | --> | Conflict         |
| triggered   |     | timestamps     |     | detected?        |
+-------------+     +----------------+     +--------+---------+
                                                    |
                          +-------------------------+
                          |                         |
                          v No                      v Yes
                   +-------------+           +-------------+
                   | Normal      |           | Show        |
                   | sync        |           | conflict    |
                   |             |           | modal       |
                   +-------------+           +------+------+
                                                    |
                    +-------------------------------+-------------------------------+
                    |                               |                               |
                    v                               v                               v
             +-------------+                 +-------------+                 +-------------+
             | Keep Local  |                 | Keep Remote |                 | Keep Both   |
             | Push to     |                 | Pull to     |                 | Create      |
             | Drive       |                 | local       |                 | copy        |
             +-------------+                 +-------------+                 +-------------+
```

---

## 8. API Design

### DriveAuth API

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `init()` | - | `Promise<void>` | Initialize Google API client |
| `signIn()` | - | `void` | Trigger OAuth sign-in |
| `signOut()` | - | `void` | Sign out and revoke token |
| `isSignedIn()` | - | `boolean` | Check auth status |
| `getUser()` | - | `User \| null` | Get current user info |
| `on(event, cb)` | `string, Function` | `void` | Subscribe to events |
| `off(event, cb)` | `string, Function` | `void` | Unsubscribe from events |

### DriveAPI API

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getAppFolder()` | - | `Promise<string>` | Get/create app folder ID |
| `listPresentations()` | - | `Promise<Array>` | List all presentations |
| `getPresentation(id)` | `string` | `Promise<Object>` | Get presentation content |
| `getPresentationMetadata(id)` | `string` | `Promise<Object>` | Get file metadata |
| `createPresentation(project)` | `Object` | `Promise<Object>` | Create new file |
| `updatePresentation(id, project)` | `string, Object` | `Promise<Object>` | Update file |
| `deletePresentation(id)` | `string` | `Promise<void>` | Permanently delete |
| `trashPresentation(id)` | `string` | `Promise<void>` | Move to trash |

### DriveSync API

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `queueSync(project)` | `Object` | `void` | Queue debounced sync |
| `performSync(project)` | `Object` | `Promise<void>` | Immediate sync |
| `pullFromDrive()` | - | `Promise<Array>` | Get all Drive projects |
| `loadFromDrive(id)` | `string` | `Promise<Object>` | Load specific project |
| `syncPending()` | - | `void` | Sync offline changes |
| `isSyncEnabled()` | - | `boolean` | Check sync setting |
| `enableSync(enabled)` | `boolean` | `void` | Toggle sync |
| `getStatus()` | - | `SyncStatus` | Get current status |
| `onStatusChange(cb)` | `Function` | `void` | Subscribe to status |

### DriveUI API

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `init()` | - | `void` | Initialize UI components |
| `renderSyncIndicator()` | - | `void` | Update status indicator |
| `openSettingsModal()` | - | `void` | Open settings |
| `closeSettingsModal()` | - | `void` | Close settings |
| `handleSignIn()` | - | `void` | Handle sign-in click |
| `handleSignOut()` | - | `void` | Handle sign-out click |
| `handleSyncToggle(enabled)` | `boolean` | `void` | Handle toggle |
| `renderDriveProjects()` | - | `Promise<void>` | Render project list |
| `loadDriveProject(id)` | `string` | `Promise<void>` | Load from Drive |
| `deleteDriveProject(id)` | `string` | `Promise<void>` | Delete from Drive |

---

## 9. State Management

### Global State Extensions

```javascript
// New state variables added to window
window.driveState = {
    // Authentication
    isConnected: boolean,
    currentUser: {
        displayName: string,
        emailAddress: string,
        photoLink: string
    } | null,

    // Sync status
    syncStatus: 'idle' | 'syncing' | 'synced' | 'conflict' | 'error' | 'offline',
    lastSyncTime: Date | null,
    pendingChanges: boolean,

    // Settings
    syncEnabled: boolean,
    folderId: string | null
};
```

### Project Model Extension

```javascript
// Extended project structure
{
    name: string,
    metadata: { ... },
    theme: { ... },
    slides: [ ... ],
    savedAt: string,        // ISO timestamp

    // New Drive-specific fields
    driveId: string | null, // Google Drive file ID
    driveModifiedTime: string | null  // Last known Drive modification
}
```

### localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `slideProjects` | `Array<Project>` | Existing projects (extended with driveId) |
| `drive_auth_token` | `Object` | OAuth token data |
| `drive_folder_id` | `string` | App folder ID in Drive |
| `drive_sync_enabled` | `'true'\|'false'` | Sync preference |
| `drive_last_sync` | `Object` | Map of project names to sync times |
| `drive_pending_sync` | `Object` | Project pending sync (offline) |

---

## 10. UI Components

### 1. Sync Status Indicator

**Location**: Header, after save-status
**States**:
- **Disconnected**: "Connecter Drive" button
- **Idle**: Cloud icon
- **Syncing**: Spinning sync icon + "Synchronisation..."
- **Synced**: Check cloud icon + "Synchronise"
- **Conflict**: Alert icon + "Conflit"
- **Error**: Cloud-off icon + "Erreur sync"
- **Offline**: Cloud-off icon + "Hors ligne"

### 2. Settings Modal

**Sections**:
- Account info (avatar, name, email, disconnect button)
- Sync toggle switch
- Folder info display
- (Optional) Folder picker button

### 3. Conflict Resolution Modal

**Elements**:
- Explanation text
- Timestamp comparison
- Three resolution options with icons and descriptions
- Each option is a clickable card

### 4. Drive Projects Section

**Location**: Inside projects modal
**Elements**:
- Section header with Drive icon
- List of Drive projects with load/delete actions
- Loading and empty states

---

## 11. Error Handling Strategy

### Error Categories

| Category | Examples | Handling |
|----------|----------|----------|
| **Auth Errors** | Token expired, revoked | Auto-refresh or re-prompt sign-in |
| **Network Errors** | Offline, timeout | Queue for later, show offline status |
| **API Errors** | Quota exceeded, file not found | Retry with backoff, notify user |
| **Conflict Errors** | Concurrent edits | Show conflict modal |
| **Permission Errors** | File access denied | Notify user, remove stale driveId |

### Retry Strategy

```javascript
const retryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,  // ms
    backoffMultiplier: 2,
    maxDelay: 10000   // ms
};

async function withRetry(operation, config = retryConfig) {
    let lastError;
    for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (!isRetryable(error)) throw error;

            const delay = Math.min(
                config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
                config.maxDelay
            );
            await sleep(delay);
        }
    }
    throw lastError;
}
```

### User Notifications

| Scenario | Toast Type | Message |
|----------|------------|---------|
| Sign-in success | success | "Connecte a Google Drive" |
| Sign-out | info | "Deconnecte de Google Drive" |
| Sync complete | success | "Synchronise" |
| Sync error | error | "Erreur de synchronisation" |
| Offline | warning | "Mode hors ligne - modifications enregistrees localement" |
| Conflict detected | warning | "Conflit detecte" |

---

## 12. Offline Support Strategy

### Offline Detection

```javascript
// Network status monitoring
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

function handleOffline() {
    DriveSync.setStatus(SyncStatus.OFFLINE);
    // All changes continue to save to localStorage
}

function handleOnline() {
    // Attempt to sync pending changes
    DriveSync.syncPending();
}
```

### Pending Changes Queue

```javascript
// Structure for queued changes
const pendingSync = {
    project: { ... },      // Full project data
    operation: 'update',   // 'create' | 'update' | 'delete'
    timestamp: '2024-...'  // When queued
};

// Stored in localStorage for persistence across sessions
localStorage.setItem('drive_pending_sync', JSON.stringify(pendingSync));
```

### Sync Resume Logic

1. On coming online, check for pending sync
2. Compare pending timestamp with current project
3. If pending is newer than current, sync it
4. If current is newer, use current instead
5. Clear pending after successful sync

---

## 13. File Naming Convention

### Drive File Naming

```
Format: {project-name}.presentation.json

Examples:
- "Ma Presentation.presentation.json"
- "Workshop-2024.presentation.json"
- "Sans-titre.presentation.json"
```

### Sanitization Rules

```javascript
function sanitizeFileName(name) {
    return (name || 'Sans titre')
        // Remove illegal characters
        .replace(/[<>:"/\\|?*]/g, '-')
        // Collapse multiple spaces
        .replace(/\s+/g, ' ')
        // Trim whitespace
        .trim()
        // Limit length
        .substring(0, 100);
}
```

### Duplicate Handling

When a project with the same name exists:
1. For updates: Match by `driveId`, not name
2. For new projects: Append timestamp suffix if needed
3. User can rename projects freely without breaking sync

---

## 14. Security Considerations

### OAuth Scopes

Using minimal scopes:
- `drive.file`: Access only files created by this app
- `drive.appdata`: App-specific hidden folder (alternative)

### Token Storage

- Tokens stored in localStorage (browser-only access)
- Tokens refreshed automatically by Google library
- Tokens revoked on explicit sign-out
- No server-side token storage

### Data Protection

- All data transmitted over HTTPS
- No sensitive data in file properties
- Project content is plain JSON (user's own data)

### CORS and CSP

Ensure Content-Security-Policy allows:
```
script-src: 'self' apis.google.com accounts.google.com
connect-src: 'self' *.googleapis.com
frame-src: accounts.google.com
```

---

## 15. Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Create `/drive/config.js`
- [ ] Create `/drive/auth.js`
- [ ] Add Google API scripts to HTML
- [ ] Implement sign-in/sign-out flow
- [ ] Add sync status indicator UI
- [ ] Add settings modal

### Phase 2: Core Sync (Week 2)

- [ ] Create `/drive/api.js`
- [ ] Create `/drive/sync.js`
- [ ] Implement create/update operations
- [ ] Hook into existing autosave
- [ ] Add sync debouncing

### Phase 3: Full Integration (Week 3)

- [ ] Create `/drive/ui.js`
- [ ] Add Drive projects list
- [ ] Implement load from Drive
- [ ] Implement delete from Drive
- [ ] Add conflict resolution modal

### Phase 4: Polish (Week 4)

- [ ] Add offline support
- [ ] Implement retry logic
- [ ] Add comprehensive error handling
- [ ] Add CSS styles
- [ ] Testing and bug fixes

---

## Appendix A: Configuration Setup

### Google Cloud Console Setup

1. Create project at https://console.cloud.google.com
2. Enable Google Drive API
3. Configure OAuth consent screen
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized JavaScript origins
6. Add authorized redirect URIs
7. Copy Client ID to `/drive/config.js`

### Required API Scopes

```
https://www.googleapis.com/auth/drive.file
```

This scope allows the app to:
- Create files in user's Drive
- Read/modify files created by the app
- Does NOT grant access to user's other files

---

## Appendix B: Testing Strategy

### Unit Tests

- Auth state transitions
- File name sanitization
- Conflict detection logic
- Retry mechanism

### Integration Tests

- Sign-in flow
- Save to Drive
- Load from Drive
- Offline/online transitions

### Manual Tests

- Multi-device sync
- Network interruption during sync
- Token expiration handling
- Large file handling

---

*Document maintained by: Architecture Team*
*Last updated: 2026-01-17*
