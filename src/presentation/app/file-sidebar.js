// src/presentation/app/file-sidebar.js
// File sidebar controller - manages right sidebar with Local and Drive tabs

import { emit, on, EventTypes } from '../../core/events.js';
import { getProject, setProject, setSelectedSlideIndex, setHasUnsavedChanges, batch } from '../../core/state.js';
import { storage, generateUUID } from '../../infrastructure/storage/local.js';
import { DriveConfig } from '../../infrastructure/drive/config.js';
import { driveStateMachine, DriveState } from '../../infrastructure/drive/state-machine.js';
import { driveAuth } from '../../infrastructure/drive/auth.js';
import { driveAPI } from '../../infrastructure/drive/api.js';
import { driveStorageService } from '../../infrastructure/drive/storage-service.js';
import { FileList } from './file-list.js';
import { escapeHtml } from '../../infrastructure/utils/html.js';
import { getPendingDriveLoad, clearPendingDriveLoad } from './project.js';

const { SESSION_KEYS } = DriveConfig;

/**
 * FileSidebarController - Manages the right-side file manager sidebar
 */
class FileSidebarController {
  constructor() {
    this.sidebar = null;
    this.content = null;
    this.isInitialized = false;
    this.driveFiles = [];
    this.pickerApiLoaded = false;
  }

  /**
   * Initialize the file sidebar
   */
  init() {
    if (this.isInitialized) return;

    this.sidebar = document.getElementById('fileSidebar');
    this.content = document.getElementById('fileSidebarContent');

    if (!this.sidebar) {
      console.warn('FileSidebar: #fileSidebar not found');
      return;
    }

    // Restore state from session storage
    this._restoreState();

    // Subscribe to Drive state changes
    driveStateMachine.subscribe((newState) => this._onDriveStateChanged(newState));

    // Subscribe to auth events
    driveAuth.on('onSignIn', () => this._onSignIn());
    driveAuth.on('onSignOut', () => this._onSignOut());
    driveAuth.on('onReady', () => this._onAuthReady());

    // Subscribe to project events to refresh file lists
    on(EventTypes.PROJECT_SAVED, () => this._refreshCurrentTab());
    on(EventTypes.PROJECT_LOADED, () => this._refreshCurrentTab());

    // Initialize tab underline
    requestAnimationFrame(() => this._updateTabUnderline());

    // Render initial content
    this._renderLocalFiles();

    // Only render Drive content after auth is ready
    // The _onAuthReady callback will initialize the state machine which triggers _renderDriveContent
    // But if auth is already ready (e.g., on page refresh with session), render now
    if (driveAuth.ready) {
      const isSignedIn = driveAuth.isSignedIn();
      const hasFolder = !!driveStorageService.getSelectedFolder();
      driveStateMachine.initialize(isSignedIn, hasFolder);
    } else {
      // Show loading state until auth is ready
      const container = document.getElementById('driveTabContent');
      if (container) {
        container.innerHTML = `
          <div class="drive-state-container">
            <div class="file-sidebar-spinner"></div>
            <p class="drive-state-text">Chargement...</p>
          </div>
        `;
      }
    }

    this.isInitialized = true;
  }

  /**
   * Toggle sidebar expanded/collapsed
   */
  toggle() {
    if (!this.sidebar) return;

    const isExpanded = !this.sidebar.classList.contains('collapsed');
    const app = document.querySelector('.app');

    if (isExpanded) {
      this.sidebar.classList.add('collapsed');
      app?.classList.remove('file-sidebar-expanded');
    } else {
      this.sidebar.classList.remove('collapsed');
      app?.classList.add('file-sidebar-expanded');
    }

    // Persist state
    this._persistState();

    emit(EventTypes.FILE_SIDEBAR_TOGGLED, { expanded: !isExpanded });
  }

  /**
   * Switch to a tab
   * @param {string} tab - 'local', 'drive', or 'file'
   */
  switchTab(tab) {
    if (!this.content) return;

    const currentTab = this.content.dataset.tab;
    if (currentTab === tab) return;

    // Update active tab button
    const tabs = this.sidebar.querySelectorAll('.file-sidebar-tab');
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));

    // Animate panel transition
    const panels = this.sidebar.querySelectorAll('.file-sidebar-panel');
    const tabOrder = ['local', 'drive', 'file'];
    const currentIndex = tabOrder.indexOf(currentTab);
    const newIndex = tabOrder.indexOf(tab);
    const isMovingRight = newIndex > currentIndex;

    panels.forEach(panel => {
      panel.classList.remove('slide-left', 'slide-right');
      panel.classList.add(isMovingRight ? 'slide-left' : 'slide-right');
    });

    // Switch content
    this.content.dataset.tab = tab;

    // Update underline
    this._updateTabUnderline();

    // Persist state
    this._persistState();

    emit(EventTypes.FILE_SIDEBAR_TAB_CHANGED, { tab });

    // Refresh the tab content
    if (tab === 'local') {
      this._renderLocalFiles();
    } else if (tab === 'drive') {
      this._renderDriveContent();
    } else if (tab === 'file') {
      this._renderFileDetails();
    }
  }

  /**
   * Open a file
   * @param {string} source - 'local' or 'drive'
   * @param {Object} fileInfo - File identification info
   */
  async openFile(source, fileInfo) {
    const currentProject = getProject();

    // Check for unsaved changes
    if (currentProject?.name && getProject()?.hasUnsavedChanges) {
      if (!confirm('Ouvrir ce projet ? Les modifications non sauvegardées seront perdues.')) {
        return;
      }
    }

    if (source === 'local') {
      const project = storage.getByLocalId(fileInfo.localId);
      if (project) {
        const loadedProject = JSON.parse(JSON.stringify(project));
        batch(() => {
          setProject(loadedProject);
          setSelectedSlideIndex(loadedProject.slides.length > 0 ? 0 : -1);
          setHasUnsavedChanges(false);
        });
        emit(EventTypes.PROJECT_LOADED, { project: loadedProject });
      }
    } else {
      // Load from Drive - show loading spinner on the item
      FileList.setItemLoading(fileInfo.driveId, true);
      try {
        const presentation = await driveAPI.getPresentation(fileInfo.driveId);
        if (presentation) {
          // Set Drive-specific fields - Drive files don't have localId
          presentation.driveId = fileInfo.driveId;
          presentation.storageLocation = 'drive';
          delete presentation.localId;
          batch(() => {
            setProject(presentation);
            setSelectedSlideIndex(presentation.slides.length > 0 ? 0 : -1);
            setHasUnsavedChanges(false);
          });
          emit(EventTypes.PROJECT_LOADED, { project: presentation });
        }
      } catch (error) {
        console.error('Error loading Drive file:', error);
        alert('Erreur lors du chargement du fichier: ' + error.message);
      } finally {
        FileList.setItemLoading(fileInfo.driveId, false);
      }
    }
  }

  /**
   * Duplicate a file
   * @param {string} source - 'local' or 'drive'
   * @param {Object} fileInfo - File identification info
   */
  async duplicateFile(source, fileInfo) {
    if (source === 'local') {
      const project = storage.getByLocalId(fileInfo.localId);
      if (project) {
        const duplicate = JSON.parse(JSON.stringify(project));
        // Local duplicate: new localId, no driveId
        duplicate.localId = generateUUID();
        duplicate.storageLocation = 'local';
        delete duplicate.driveId;
        delete duplicate.driveFolderId;
        duplicate.name = `${project.name} (copie)`;
        duplicate.savedAt = new Date().toISOString();

        storage.save(duplicate);
        this._renderLocalFiles();
      }
    } else {
      // Duplicate in Drive - load content and create new file
      try {
        const presentation = await driveAPI.getPresentation(fileInfo.driveId);
        if (presentation) {
          const duplicate = JSON.parse(JSON.stringify(presentation));
          // Drive duplicate: new driveId, no localId
          delete duplicate.localId;
          delete duplicate.driveId; // Will be set by createPresentation
          duplicate.storageLocation = 'drive';
          duplicate.name = `${fileInfo.name} (copie)`;
          duplicate.savedAt = new Date().toISOString();

          const created = await driveAPI.createPresentation(duplicate);
          duplicate.driveId = created.id;

          this._loadDriveFiles();
        }
      } catch (error) {
        console.error('Error duplicating Drive file:', error);
        alert('Erreur lors de la duplication: ' + error.message);
      }
    }
  }

  /**
   * Delete a file
   * @param {string} source - 'local' or 'drive'
   * @param {Object} fileInfo - File identification info
   */
  async deleteFile(source, fileInfo) {
    if (!confirm(`Supprimer "${fileInfo.name || 'ce projet'}" ?`)) {
      return;
    }

    if (source === 'local') {
      storage.deleteByLocalId(fileInfo.localId);
      this._renderLocalFiles();
    } else {
      try {
        await driveAPI.deletePresentation(fileInfo.driveId);
        this._loadDriveFiles();
      } catch (error) {
        console.error('Error deleting Drive file:', error);
        alert('Erreur lors de la suppression: ' + error.message);
      }
    }
  }

  /**
   * Move a file to the other storage location
   * @param {string} source - Current source: 'local' or 'drive'
   * @param {Object} fileInfo - File identification info
   */
  async moveToOtherStorage(source, fileInfo) {
    if (source === 'local') {
      // Move from local to Drive
      if (!driveAuth.isSignedIn()) {
        alert('Connectez-vous à Google Drive pour déplacer ce fichier.');
        return;
      }
      if (!driveStorageService.getSelectedFolder()) {
        alert('Sélectionnez d\'abord un dossier Drive.');
        return;
      }

      try {
        // Load the local project
        const localProject = storage.getByLocalId(fileInfo.localId);
        if (!localProject) {
          throw new Error('Projet local non trouvé');
        }

        // Create version for Drive
        const driveProject = JSON.parse(JSON.stringify(localProject));
        const oldLocalId = driveProject.localId;
        delete driveProject.localId;
        delete driveProject.driveId;
        driveProject.storageLocation = 'drive';
        driveProject.savedAt = new Date().toISOString();

        // Upload to Drive
        const created = await driveAPI.createPresentation(driveProject);
        driveProject.driveId = created.id;

        // Delete from local storage
        storage.deleteByLocalId(oldLocalId);

        // If this was the current project, update it to reference Drive
        const currentProject = getProject();
        if (currentProject?.localId === oldLocalId) {
          driveProject.driveId = created.id;
          setProject(driveProject);
          emit(EventTypes.PROJECT_LOADED, { project: driveProject });
        }

        // Refresh both file lists
        this._renderLocalFiles();
        this._loadDriveFiles();

        // Switch to Drive tab to show the moved file
        this.switchTab('drive');
      } catch (error) {
        console.error('Error moving to Drive:', error);
        alert('Erreur lors du déplacement vers Drive: ' + error.message);
      }
    } else {
      // Move from Drive to local
      try {
        // Load the Drive project
        const driveProject = await driveAPI.getPresentation(fileInfo.driveId);
        if (!driveProject) {
          throw new Error('Projet Drive non trouvé');
        }

        // Create version for local storage
        const localProject = JSON.parse(JSON.stringify(driveProject));
        const oldDriveId = fileInfo.driveId;
        delete localProject.driveId;
        localProject.localId = generateUUID();
        localProject.storageLocation = 'local';
        localProject.savedAt = new Date().toISOString();

        // Save to local storage
        storage.save(localProject);

        // Delete from Drive
        await driveAPI.deletePresentation(oldDriveId);

        // If this was the current project, update it to reference local
        const currentProject = getProject();
        if (currentProject?.driveId === oldDriveId) {
          setProject(localProject);
          emit(EventTypes.PROJECT_LOADED, { project: localProject });
        }

        // Refresh both file lists
        this._renderLocalFiles();
        this._loadDriveFiles();

        // Switch to local tab to show the moved file
        this.switchTab('local');
      } catch (error) {
        console.error('Error moving to local:', error);
        alert('Erreur lors du déplacement en local: ' + error.message);
      }
    }
  }

  // ===== Private Methods =====

  /**
   * Restore state from session storage
   * @private
   */
  _restoreState() {
    const collapsed = sessionStorage.getItem(SESSION_KEYS.FILE_SIDEBAR_COLLAPSED);
    const activeTab = sessionStorage.getItem(SESSION_KEYS.FILE_SIDEBAR_ACTIVE_TAB);

    if (collapsed === 'false') {
      this.sidebar.classList.remove('collapsed');
      document.querySelector('.app')?.classList.add('file-sidebar-expanded');
    }

    if (activeTab && ['local', 'drive', 'file'].includes(activeTab)) {
      if (this.content) {
        this.content.dataset.tab = activeTab;
        const tabs = this.sidebar.querySelectorAll('.file-sidebar-tab');
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === activeTab));
      }
    }
  }

  /**
   * Persist state to session storage
   * @private
   */
  _persistState() {
    const isCollapsed = this.sidebar.classList.contains('collapsed');
    const activeTab = this.content?.dataset.tab || 'local';

    sessionStorage.setItem(SESSION_KEYS.FILE_SIDEBAR_COLLAPSED, isCollapsed ? 'true' : 'false');
    sessionStorage.setItem(SESSION_KEYS.FILE_SIDEBAR_ACTIVE_TAB, activeTab);
  }

  /**
   * Update tab underline position
   * @private
   */
  _updateTabUnderline() {
    const tabsContainer = this.sidebar?.querySelector('.file-sidebar-tabs');
    const activeTab = this.sidebar?.querySelector('.file-sidebar-tab.active');

    if (!tabsContainer || !activeTab) return;

    const containerRect = tabsContainer.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    tabsContainer.style.setProperty('--underline-left', `${tabRect.left - containerRect.left}px`);
    tabsContainer.style.setProperty('--underline-width', `${tabRect.width}px`);
  }

  /**
   * Refresh current tab content
   * @private
   */
  _refreshCurrentTab() {
    const activeTab = this.content?.dataset.tab || 'local';
    if (activeTab === 'local') {
      this._renderLocalFiles();
    } else if (activeTab === 'drive') {
      // If already in ready state, just refresh the file list without re-rendering container
      const state = driveStateMachine.getState();
      if (state === DriveState.SIGNED_IN_READY) {
        this._loadDriveFiles();
      } else {
        this._renderDriveContent();
      }
    } else if (activeTab === 'file') {
      this._renderFileDetails();
    }
  }

  /**
   * Render local files list
   * @private
   */
  _renderLocalFiles() {
    const container = document.getElementById('localFileList');
    if (!container) return;

    const projects = storage.getAll();
    // Sort by savedAt descending (most recent first)
    projects.sort((a, b) => {
      const dateA = a.savedAt ? new Date(a.savedAt) : new Date(0);
      const dateB = b.savedAt ? new Date(b.savedAt) : new Date(0);
      return dateB - dateA;
    });

    FileList.renderLocal(projects, container);
  }

  /**
   * Render file details panel
   * @private
   */
  _renderFileDetails() {
    const container = document.getElementById('fileDetailsContent');
    if (!container) return;

    const project = getProject();

    if (!project) {
      container.innerHTML = `
        <div class="file-details-empty">
          <div class="file-details-empty-icon">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <p>Aucun fichier ouvert</p>
        </div>
      `;
      return;
    }

    const storageLocation = driveStorageService.getProjectStorageLocation(project);
    const isLocal = storageLocation === 'local';
    const isDrive = storageLocation === 'drive';
    const isUnsaved = !project.name;

    const slideCount = project.slides?.length || 0;
    const savedAt = project.savedAt ? new Date(project.savedAt) : null;
    const createdAt = project.createdAt ? new Date(project.createdAt) : null;

    const formatDate = (date) => {
      if (!date) return '—';
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const storageIcon = isLocal
      ? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>'
      : isDrive
        ? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>'
        : '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

    const storageLabel = isLocal ? 'Local' : isDrive ? 'Google Drive' : 'Non enregistré';

    container.innerHTML = `
      <div class="file-details">
        <div class="file-details-header">
          <div class="file-details-icon">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div class="file-details-title">
            <h3>${escapeHtml(project.name || 'Sans titre')}</h3>
            ${isUnsaved ? '<span class="file-details-unsaved">Non enregistré</span>' : ''}
          </div>
        </div>

        <div class="file-details-actions">
          <button class="btn btn-secondary btn-sm" onclick="App.exportToJSON()">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Exporter JSON
          </button>
          <button class="btn btn-secondary btn-sm" onclick="App.exportToGoogleSlides()">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18"/>
              <path d="M9 21V9"/>
            </svg>
            Exporter Google Slides
          </button>
          ${!isUnsaved && isLocal && driveAuth.isSignedIn() && driveStorageService.getSelectedFolder() ? `
            <button class="btn btn-secondary btn-sm btn-move" onclick="FileSidebar.moveCurrentToDrive()">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
                <polyline points="9 12 12 15 15 12"/>
                <line x1="12" y1="8" x2="12" y2="15"/>
              </svg>
              Déplacer vers Drive
            </button>
          ` : ''}
          ${!isUnsaved && isDrive ? `
            <button class="btn btn-secondary btn-sm btn-move" onclick="FileSidebar.moveCurrentToLocal()">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8"/><path d="M12 17v4"/>
                <polyline points="9 10 12 7 15 10"/>
                <line x1="12" y1="7" x2="12" y2="14"/>
              </svg>
              Déplacer en local
            </button>
          ` : ''}
        </div>

        <div class="file-details-list">
          <div class="file-details-item">
            <span class="file-details-label">Emplacement</span>
            <span class="file-details-value">
              ${storageIcon}
              ${storageLabel}
            </span>
          </div>

          <div class="file-details-item">
            <span class="file-details-label">Slides</span>
            <span class="file-details-value">${slideCount}</span>
          </div>

          <div class="file-details-item">
            <span class="file-details-label">Dernière modification</span>
            <span class="file-details-value">${formatDate(savedAt)}</span>
          </div>

          ${createdAt ? `
          <div class="file-details-item">
            <span class="file-details-label">Créé le</span>
            <span class="file-details-value">${formatDate(createdAt)}</span>
          </div>
          ` : ''}

          ${project.metadata?.author ? `
          <div class="file-details-item">
            <span class="file-details-label">Auteur</span>
            <span class="file-details-value">${escapeHtml(project.metadata.author)}</span>
          </div>
          ` : ''}

          ${project.metadata?.version ? `
          <div class="file-details-item">
            <span class="file-details-label">Version</span>
            <span class="file-details-value">${escapeHtml(project.metadata.version)}</span>
          </div>
          ` : ''}

          ${project.driveId ? `
          <div class="file-details-item">
            <span class="file-details-label">ID Drive</span>
            <span class="file-details-value file-details-id">${escapeHtml(project.driveId)}</span>
          </div>
          ` : ''}

          ${project.localId ? `
          <div class="file-details-item">
            <span class="file-details-label">ID Local</span>
            <span class="file-details-value file-details-id">${escapeHtml(project.localId)}</span>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Move current project to Drive
   */
  async moveCurrentToDrive() {
    const project = getProject();
    if (!project || !project.localId) return;

    // Show loading state on button
    this._setMoveButtonLoading(true);

    try {
      await this.moveToOtherStorage('local', {
        localId: project.localId,
        name: project.name
      });
    } finally {
      this._setMoveButtonLoading(false);
    }
  }

  /**
   * Move current project to local storage
   */
  async moveCurrentToLocal() {
    const project = getProject();
    if (!project || !project.driveId) return;

    // Show loading state on button
    this._setMoveButtonLoading(true);

    try {
      await this.moveToOtherStorage('drive', {
        driveId: project.driveId,
        name: project.name
      });
    } finally {
      this._setMoveButtonLoading(false);
    }
  }

  /**
   * Set loading state on move button in file details
   * @private
   */
  _setMoveButtonLoading(isLoading) {
    const container = document.getElementById('fileDetailsContent');
    if (!container) return;

    const moveBtn = container.querySelector('.file-details-actions .btn-move');
    if (!moveBtn) return;

    if (isLoading) {
      moveBtn.disabled = true;
      moveBtn.dataset.originalHtml = moveBtn.innerHTML;
      moveBtn.innerHTML = `
        <div class="file-item-spinner"></div>
        Déplacement...
      `;
    } else {
      moveBtn.disabled = false;
      if (moveBtn.dataset.originalHtml) {
        moveBtn.innerHTML = moveBtn.dataset.originalHtml;
        delete moveBtn.dataset.originalHtml;
      }
    }
  }

  /**
   * Render Drive content based on state
   * @private
   */
  _renderDriveContent() {
    const container = document.getElementById('driveTabContent');
    if (!container) return;

    const state = driveStateMachine.getState();

    switch (state) {
      case DriveState.SIGNED_OUT:
        this._renderDriveSignedOut(container);
        break;
      case DriveState.OAUTH_LOADING:
        this._renderDriveLoading(container);
        break;
      case DriveState.SIGNED_IN_NO_FOLDER:
        this._renderDriveNoFolder(container);
        break;
      case DriveState.SIGNED_IN_READY:
        this._renderDriveReady(container);
        break;
    }
  }

  /**
   * Render signed out state
   * @private
   */
  _renderDriveSignedOut(container) {
    container.innerHTML = `
      <div class="drive-state-container">
        <div class="drive-state-icon">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
          </svg>
        </div>
        <p class="drive-state-text">Connectez-vous avec Google pour accéder à vos présentations sur Drive.</p>
        <div class="drive-state-cta">
          <button class="btn btn-primary" onclick="FileSidebar.signIn()">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Se connecter avec Google
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render OAuth loading state
   * @private
   */
  _renderDriveLoading(container) {
    container.innerHTML = `
      <div class="drive-state-container">
        <div class="drive-state-icon loading">
          <div class="file-sidebar-spinner"></div>
        </div>
        <p class="drive-state-text">Connexion en cours...</p>
      </div>
    `;
  }

  /**
   * Render signed in but no folder selected state
   * @private
   */
  _renderDriveNoFolder(container) {
    const user = driveAuth.getUser();

    container.innerHTML = `
      <div class="drive-user-info">
        ${user?.photoLink
          ? `<img src="${user.photoLink}" class="drive-user-avatar" alt="">`
          : '<div class="drive-user-avatar-placeholder"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'}
        <div class="drive-user-details">
          <span class="drive-user-name">${user?.displayName || 'Utilisateur'}</span>
          <span class="drive-user-email">${user?.emailAddress || ''}</span>
        </div>
      </div>
      <div class="drive-state-container">
        <p class="drive-state-text">Sélectionnez un dossier Google Drive pour stocker vos présentations.</p>
        <div class="drive-state-cta">
          <button class="btn btn-primary" onclick="FileSidebar.openFolderPicker()">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Sélectionner un dossier
          </button>
        </div>
        <div class="drive-state-secondary">
          <button class="btn btn-ghost" onclick="FileSidebar.signOut()">Déconnecter</button>
        </div>
      </div>
    `;
  }

  /**
   * Render ready state with file list
   * @private
   */
  _renderDriveReady(container) {
    const folder = driveStorageService.getSelectedFolder();

    container.innerHTML = `
      <div class="drive-folder-header">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="drive-folder-name">${folder?.name || 'Drive'}</span>
        <button class="drive-folder-change-btn" onclick="FileSidebar.openFolderPicker()">Changer</button>
      </div>
      <div class="file-list" id="driveFileList">
        <div class="drive-state-container">
          <div class="file-sidebar-spinner"></div>
          <p class="drive-state-text">Chargement...</p>
        </div>
      </div>
      <button class="drive-disconnect-btn" onclick="FileSidebar.signOut()">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Déconnecter
      </button>
    `;

    // Load Drive files (initial load, show full loading state)
    this._loadDriveFiles(true);
  }

  /**
   * Load files from Google Drive
   * @private
   * @param {boolean} showFullLoading - Show full loading state (default: false for refresh)
   */
  async _loadDriveFiles(showFullLoading = false) {
    const container = document.getElementById('driveFileList');
    if (!container) return;

    // Show loading spinner in folder header (subtle indicator)
    const folderHeader = this.sidebar?.querySelector('.drive-folder-header');
    const changeBtn = folderHeader?.querySelector('.drive-folder-change-btn');
    if (changeBtn && !showFullLoading) {
      changeBtn.dataset.originalText = changeBtn.textContent;
      changeBtn.innerHTML = '<div class="file-item-spinner"></div>';
      changeBtn.disabled = true;
    }

    // Only show full loading state if container is empty or explicitly requested
    if (showFullLoading || !container.querySelector('.file-list-item')) {
      container.innerHTML = `
        <div class="drive-state-container">
          <div class="file-sidebar-spinner"></div>
          <p class="drive-state-text">Chargement...</p>
        </div>
      `;
    }

    try {
      const files = await driveAPI.listPresentations();
      this.driveFiles = files;

      // Transform Drive files to match local file format
      const formattedFiles = files.map(file => ({
        driveId: file.id,
        name: file.name.replace(DriveConfig.FILE_EXTENSION, ''),
        savedAt: file.modifiedTime,
        slides: [] // We don't have slide count without loading each file
      }));

      FileList.renderDrive(formattedFiles, container);
    } catch (error) {
      console.error('Error loading Drive files:', error);
      container.innerHTML = `
        <div class="drive-state-container">
          <p class="drive-state-text">Erreur lors du chargement des fichiers.</p>
          <div class="drive-state-cta">
            <button class="btn btn-secondary" onclick="FileSidebar._loadDriveFiles(true)">Réessayer</button>
          </div>
        </div>
      `;
    } finally {
      // Restore change button
      if (changeBtn && changeBtn.dataset.originalText) {
        changeBtn.textContent = changeBtn.dataset.originalText;
        changeBtn.disabled = false;
        delete changeBtn.dataset.originalText;
      }
    }
  }

  /**
   * Handle Drive state change
   * @private
   */
  _onDriveStateChanged() {
    this._renderDriveContent();
  }

  /**
   * Handle sign in
   * @private
   */
  _onSignIn() {
    const hasFolder = !!driveStorageService.getSelectedFolder();
    driveStateMachine.oauthSuccess(hasFolder);
  }

  /**
   * Handle sign out
   * @private
   */
  _onSignOut() {
    driveStateMachine.signOut();
  }

  /**
   * Handle auth ready
   * @private
   */
  async _onAuthReady() {
    const isSignedIn = driveAuth.isSignedIn();
    const hasFolder = !!driveStorageService.getSelectedFolder();
    driveStateMachine.initialize(isSignedIn, hasFolder);
    // Always render Drive content when auth is ready
    // (state machine might not transition if state is already correct)
    this._renderDriveContent();

    // Check for pending Drive project load (session restore)
    const pendingLoad = getPendingDriveLoad();
    if (pendingLoad && pendingLoad.driveId) {
      clearPendingDriveLoad();

      if (isSignedIn) {
        try {
          const presentation = await driveAPI.getPresentation(pendingLoad.driveId);
          if (presentation) {
            presentation.driveId = pendingLoad.driveId;
            presentation.storageLocation = 'drive';
            delete presentation.localId;
            batch(() => {
              setProject(presentation);
              setSelectedSlideIndex(presentation.slides?.length > 0 ? 0 : -1);
              setHasUnsavedChanges(false);
            });
            emit(EventTypes.PROJECT_LOADED, { project: presentation });
          }
        } catch (error) {
          console.warn('Could not restore Drive project from session:', error);
          // Fallback: load most recent local project if available
          this._loadFallbackLocalProject();
        }
      } else {
        // Not signed in - load most recent local project as fallback
        this._loadFallbackLocalProject();
      }
    }
  }

  /**
   * Load the most recent local project as fallback
   * @private
   */
  _loadFallbackLocalProject() {
    const projects = storage.getAll();
    if (projects.length > 0) {
      // Sort by savedAt and load most recent
      projects.sort((a, b) => {
        const dateA = a.savedAt ? new Date(a.savedAt) : new Date(0);
        const dateB = b.savedAt ? new Date(b.savedAt) : new Date(0);
        return dateB - dateA;
      });
      const project = JSON.parse(JSON.stringify(projects[0]));
      batch(() => {
        setProject(project);
        setSelectedSlideIndex(project.slides?.length > 0 ? 0 : -1);
        setHasUnsavedChanges(false);
      });
      emit(EventTypes.PROJECT_LOADED, { project });
    }
  }

  // ===== Public Static Methods (for onclick handlers) =====

  /**
   * Sign in to Google
   */
  signIn() {
    driveStateMachine.startOAuth();
    driveAuth.signIn();
  }

  /**
   * Sign out from Google
   */
  signOut() {
    if (confirm('Se déconnecter de Google Drive ?')) {
      driveStorageService.clearSelectedFolder();
      driveAuth.signOut();
    }
  }

  /**
   * Open folder picker (uses fallback selector since we use server-side auth)
   */
  async openFolderPicker() {
    // With server-side auth, we use the fallback folder selector
    await this._showFallbackFolderSelector();
  }

  /**
   * Show fallback folder selector
   * @private
   */
  async _showFallbackFolderSelector() {
    const container = document.getElementById('driveTabContent');
    if (!container) return;

    container.innerHTML = `
      <div class="drive-state-container">
        <div class="file-sidebar-spinner"></div>
        <p class="drive-state-text">Chargement des dossiers...</p>
      </div>
    `;

    try {
      const folders = await driveAPI.listFolders();

      if (folders.length === 0) {
        container.innerHTML = `
          <div class="drive-state-container">
            <p class="drive-state-text">Aucun dossier trouvé.</p>
            <div class="drive-state-cta">
              <button class="btn btn-primary" onclick="FileSidebar.createNewFolder()">Créer un dossier</button>
            </div>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="file-list">
          ${folders.map(folder => `
            <div class="file-list-item" onclick="FileSidebar.selectFolder('${folder.id}', '${folder.name.replace(/'/g, "\\'")}')">
              <div class="file-item-icon">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="file-item-info">
                <span class="file-item-name">${folder.name}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      console.error('Error loading folders:', error);
      container.innerHTML = `
        <div class="drive-state-container">
          <p class="drive-state-text">Erreur lors du chargement.</p>
          <div class="drive-state-cta">
            <button class="btn btn-secondary" onclick="FileSidebar.openFolderPicker()">Réessayer</button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Select a folder from fallback list
   */
  selectFolder(folderId, folderName) {
    driveStorageService.setSelectedFolder(folderId, folderName);
    driveStateMachine.folderSelected();
  }

  /**
   * Create a new folder in Drive
   */
  async createNewFolder() {
    const folderName = prompt('Nom du nouveau dossier:', 'Presentation Builder');
    if (!folderName) return;

    try {
      await driveAuth.ensureValidToken();

      // Create folder via server API
      const response = await fetch('/api/drive/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metadata: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create folder');
      }

      const folder = await response.json();
      driveStorageService.setSelectedFolder(folder.id, folder.name);
      driveStateMachine.folderSelected();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Erreur lors de la création du dossier: ' + error.message);
    }
  }
}

// Create singleton instance
const fileSidebar = new FileSidebarController();

// Export for window access (used by onclick handlers in HTML)
if (typeof window !== 'undefined') {
  window.FileSidebar = {
    init: () => fileSidebar.init(),
    toggle: () => fileSidebar.toggle(),
    switchTab: (tab) => fileSidebar.switchTab(tab),
    openFile: (source, fileInfo) => fileSidebar.openFile(source, fileInfo),
    duplicateFile: (source, fileInfo) => fileSidebar.duplicateFile(source, fileInfo),
    deleteFile: (source, fileInfo) => fileSidebar.deleteFile(source, fileInfo),
    moveToOtherStorage: (source, fileInfo) => fileSidebar.moveToOtherStorage(source, fileInfo),
    moveCurrentToDrive: () => fileSidebar.moveCurrentToDrive(),
    moveCurrentToLocal: () => fileSidebar.moveCurrentToLocal(),
    signIn: () => fileSidebar.signIn(),
    signOut: () => fileSidebar.signOut(),
    openFolderPicker: () => fileSidebar.openFolderPicker(),
    selectFolder: (id, name) => fileSidebar.selectFolder(id, name),
    createNewFolder: () => fileSidebar.createNewFolder(),
    _loadDriveFiles: (showFullLoading) => fileSidebar._loadDriveFiles(showFullLoading)
  };

  // Global toggle function for HTML onclick
  window.toggleFileSidebar = () => fileSidebar.toggle();
  window.switchFileSidebarTab = (tab) => fileSidebar.switchTab(tab);
}

export { fileSidebar, FileSidebarController };
export default fileSidebar;
