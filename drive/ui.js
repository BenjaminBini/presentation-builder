// drive/ui.js
// Drive UI components and state indicators
// Requires: drive/config.js, drive/auth.js, drive/sync.js

window.DriveUI = (function() {

    // Render the sync status indicator in header
    function renderSyncIndicator() {
        const container = document.getElementById('driveSyncStatus');
        if (!container) return;

        const isSignedIn = DriveAuth.isSignedIn();

        if (!isSignedIn) {
            container.innerHTML = `
                <button class="btn btn-ghost drive-connect-btn" onclick="DriveUI.openSettingsModal()">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <span>Drive</span>
                </button>
            `;
            return;
        }

        const status = DriveSync.getStatus();
        const statusConfig = {
            idle: { icon: 'cloud', text: '', class: '' },
            syncing: { icon: 'sync', text: 'Sync...', class: 'syncing' },
            synced: { icon: 'cloud-check', text: 'OK', class: 'synced' },
            conflict: { icon: 'alert', text: 'Conflit', class: 'conflict' },
            error: { icon: 'cloud-off', text: 'Erreur', class: 'error' },
            offline: { icon: 'cloud-off', text: 'Hors ligne', class: 'offline' }
        };

        const config = statusConfig[status] || statusConfig.idle;

        container.innerHTML = `
            <button class="btn btn-ghost drive-status ${config.class}" onclick="DriveUI.openSettingsModal()" title="Google Drive">
                ${getSyncIcon(config.icon)}
                ${config.text ? `<span class="drive-status-text">${config.text}</span>` : ''}
            </button>
        `;
    }

    function getSyncIcon(type) {
        const icons = {
            cloud: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
            </svg>`,
            sync: `<svg class="icon drive-sync-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6"/>
                <path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>`,
            'cloud-check': `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
                <polyline points="9 12 11 14 15 10"/>
            </svg>`,
            'cloud-off': `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"/>
            </svg>`,
            alert: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>`
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
                        ${user.photoLink ? `<img src="${user.photoLink}" alt="" class="drive-avatar">` : `
                            <div class="drive-avatar-placeholder">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                        `}
                        <div class="drive-account-details">
                            <span class="drive-account-name">${escapeHtml(user.displayName || 'Utilisateur')}</span>
                            <span class="drive-account-email">${escapeHtml(user.emailAddress || '')}</span>
                        </div>
                        <button class="btn btn-secondary btn-sm" onclick="DriveUI.handleSignOut()">
                            Deconnecter
                        </button>
                    </div>
                `;
            } else {
                accountSection.innerHTML = `
                    <div class="drive-connect-prompt">
                        <div class="drive-connect-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <p>Connectez votre compte Google Drive pour synchroniser vos presentations automatiquement.</p>
                        <button class="btn btn-primary" onclick="DriveUI.handleSignIn()">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
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
            console.error('Sign in error:', error);
            if (typeof showToast === 'function') {
                showToast('Erreur de connexion Google Drive', 'error');
            }
        }
    }

    // Handle sign out
    function handleSignOut() {
        DriveAuth.signOut();
        DriveSync.enableSync(false);
        updateSettingsModal();
        renderSyncIndicator();
        if (typeof showToast === 'function') {
            showToast('Deconnecte de Google Drive');
        }
    }

    // Handle sync toggle
    function handleSyncToggle(enabled) {
        DriveSync.enableSync(enabled);
        if (enabled && window.currentProject) {
            DriveSync.queueSync(window.currentProject);
        }
        if (typeof showToast === 'function') {
            showToast(enabled ? 'Synchronisation activee' : 'Synchronisation desactivee');
        }
    }

    // Render Drive projects in project modal
    async function renderDriveProjects() {
        const container = document.getElementById('driveProjectList');
        if (!container) return;

        if (!DriveAuth.isSignedIn()) {
            container.innerHTML = `
                <p class="drive-projects-empty">
                    <a href="#" onclick="DriveUI.openSettingsModal(); return false;">Connectez-vous</a> pour voir vos projets Drive
                </p>
            `;
            return;
        }

        container.innerHTML = '<p class="drive-projects-loading">Chargement...</p>';

        try {
            const projects = await DriveSync.pullFromDrive();

            if (projects.length === 0) {
                container.innerHTML = '<p class="drive-projects-empty">Aucun projet sur Drive</p>';
                return;
            }

            container.innerHTML = projects.map(project => `
                <div class="project-item drive-project" onclick="DriveUI.loadDriveProject('${project.id}')">
                    <div class="project-item-info">
                        <h4>
                            <svg class="icon icon-sm drive-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            ${escapeHtml(project.name)}
                        </h4>
                        <span>${new Date(project.modifiedTime).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                    </div>
                    <div class="project-item-actions">
                        <button class="slide-item-btn delete" onclick="event.stopPropagation(); DriveUI.deleteDriveProject('${project.id}')" title="Supprimer de Drive">
                            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading Drive projects:', error);
            container.innerHTML = '<p class="drive-projects-error">Erreur de chargement des projets Drive</p>';
        }
    }

    // Load project from Drive
    async function loadDriveProject(fileId) {
        try {
            const project = await DriveSync.loadFromDrive(fileId);

            // Deep clone to avoid reference issues
            window.currentProject = JSON.parse(JSON.stringify(project));
            window.selectedSlideIndex = project.slides && project.slides.length > 0 ? 0 : -1;

            // Also save to localStorage
            const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
            const existingIndex = projects.findIndex(p => p.driveId === fileId || p.name === project.name);
            if (existingIndex !== -1) {
                projects[existingIndex] = window.currentProject;
            } else {
                projects.push(window.currentProject);
            }
            localStorage.setItem('slideProjects', JSON.stringify(projects));

            // Update UI
            if (typeof renderSlideList === 'function') renderSlideList();
            if (typeof renderSettingsPanel === 'function') renderSettingsPanel();
            if (typeof renderEditor === 'function') renderEditor();
            if (typeof updatePreview === 'function') updatePreview();
            if (typeof updateHeaderTitle === 'function') updateHeaderTitle();
            if (typeof initMermaid === 'function') initMermaid();
            if (typeof clearUnsavedChanges === 'function') clearUnsavedChanges();

            // Close modal
            closeModal('projectsModal');

            if (typeof showToast === 'function') {
                showToast('Projet charge depuis Drive');
            }
        } catch (error) {
            console.error('Error loading project from Drive:', error);
            if (typeof showToast === 'function') {
                showToast('Erreur de chargement du projet', 'error');
            }
        }
    }

    // Delete project from Drive
    async function deleteDriveProject(fileId) {
        if (!confirm('Supprimer ce projet de Google Drive ? Cette action est irreversible.')) return;

        try {
            await DriveAPI.trashPresentation(fileId);

            // Also remove driveId from local project if exists
            const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
            const localProject = projects.find(p => p.driveId === fileId);
            if (localProject) {
                delete localProject.driveId;
                localStorage.setItem('slideProjects', JSON.stringify(projects));
            }

            // Refresh list
            renderDriveProjects();

            if (typeof showToast === 'function') {
                showToast('Projet supprime de Drive');
            }
        } catch (error) {
            console.error('Error deleting from Drive:', error);
            if (typeof showToast === 'function') {
                showToast('Erreur de suppression', 'error');
            }
        }
    }

    // Show conflict resolution modal
    function showConflictModal(localProject, remoteMeta, resolve) {
        const modal = document.getElementById('driveConflictModal');
        if (!modal) return;

        const localTime = new Date(localProject.savedAt).toLocaleString('fr-FR');
        const remoteTime = new Date(remoteMeta.modifiedTime).toLocaleString('fr-FR');

        const localTimeEl = document.getElementById('conflictLocalTime');
        const remoteTimeEl = document.getElementById('conflictRemoteTime');

        if (localTimeEl) localTimeEl.textContent = localTime;
        if (remoteTimeEl) remoteTimeEl.textContent = remoteTime;

        window.resolveConflict = resolve;
        modal.classList.add('active');
    }

    // Initialize UI event listeners
    function init() {
        // Auth state changes
        DriveAuth.on('onSignIn', (user) => {
            renderSyncIndicator();
            updateSettingsModal();

            if (typeof showToast === 'function') {
                showToast(`Connecte en tant que ${user.displayName || user.emailAddress}`);
            }

            // Sync pending if enabled
            if (DriveSync.isSyncEnabled()) {
                DriveSync.syncPending();
            }
        });

        DriveAuth.on('onSignOut', () => {
            renderSyncIndicator();
            updateSettingsModal();
        });

        DriveAuth.on('onError', (error) => {
            console.error('Drive auth error:', error);
            if (typeof showToast === 'function') {
                showToast('Erreur d\'authentification Drive', 'error');
            }
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
        updateSettingsModal,
        handleSignIn,
        handleSignOut,
        handleSyncToggle,
        renderDriveProjects,
        loadDriveProject,
        deleteDriveProject,
        showConflictModal
    };
})();
