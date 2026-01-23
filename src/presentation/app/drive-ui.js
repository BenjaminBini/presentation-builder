// src/presentation/app/drive-ui.js
// Drive UI - Manages Drive setup modal (file management moved to file-sidebar.js)

import { driveAuth } from '../../infrastructure/drive/auth.js';
import { driveStorageService } from '../../infrastructure/drive/storage-service.js';
import { driveAPI } from '../../infrastructure/drive/api.js';

/**
 * DriveUI - Manages Drive setup modal
 * Note: Storage location dropdown and file management moved to file-sidebar.js
 */
class DriveUI {
  constructor() {
    this.isInitialized = false;
    this.pickerApiLoaded = false;
    this.cachedApiKey = null;
  }

  /**
   * Initialize the Drive UI
   */
  init() {
    if (this.isInitialized) return;

    // Subscribe to auth events
    driveAuth.on('onSignIn', () => this.onSignIn());
    driveAuth.on('onSignOut', () => this.onSignOut());
    driveAuth.on('onReady', () => this.onReady());
    driveAuth.on('onError', (error) => this.onError(error));

    this.isInitialized = true;
  }

  /**
   * Open Drive setup modal
   */
  static openDriveSetupModal() {
    const modal = document.getElementById('driveSetupModal');
    if (modal) {
      modal.classList.add('active');
      driveUIInstance.renderSetupModalContent();
    }
  }

  /**
   * Close Drive setup modal
   */
  static closeSetupModal() {
    const modal = document.getElementById('driveSetupModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
   * Render setup modal content based on current state
   */
  renderSetupModalContent() {
    const content = document.getElementById('driveSetupContent');
    if (!content) return;

    const isSignedIn = driveAuth.isSignedIn();
    const user = driveAuth.getUser();
    const folder = driveStorageService.getSelectedFolder();

    if (!isSignedIn) {
      // State 1: Not logged in
      content.innerHTML = `
        <div class="drive-connect-prompt">
          <div class="drive-connect-icon">
            ${this.getGoogleDriveColorIcon()}
          </div>
          <p>Connectez-vous avec Google pour sauvegarder vos présentations sur Drive.</p>
          <button class="btn btn-primary" onclick="DriveUI.signIn()">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Se connecter avec Google
          </button>
        </div>
      `;
    } else if (!folder) {
      // State 2: Logged in but no folder selected
      content.innerHTML = `
        <div class="drive-account-info">
          ${user?.photoLink ? `<img src="${user.photoLink}" class="drive-avatar" alt="">` : '<div class="drive-avatar-placeholder"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'}
          <div class="drive-account-details">
            <span class="drive-account-name">${user?.displayName || 'Utilisateur'}</span>
            <span class="drive-account-email">${user?.emailAddress || ''}</span>
          </div>
        </div>
        <div class="drive-folder-selection">
          <p>Choisissez un dossier Google Drive pour stocker vos présentations.</p>
          <button class="btn btn-primary" onclick="DriveUI.openFolderPicker()">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Sélectionner un dossier
          </button>
        </div>
      `;
    } else {
      // State 3: Ready - folder selected
      content.innerHTML = `
        <div class="drive-account-info">
          ${user?.photoLink ? `<img src="${user.photoLink}" class="drive-avatar" alt="">` : '<div class="drive-avatar-placeholder"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'}
          <div class="drive-account-details">
            <span class="drive-account-name">${user?.displayName || 'Utilisateur'}</span>
            <span class="drive-account-email">${user?.emailAddress || ''}</span>
          </div>
        </div>
        <div class="drive-folder-info drive-folder-configured">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <span>${folder.name}</span>
          <button class="btn btn-ghost btn-sm" onclick="DriveUI.openFolderPicker()" title="Changer de dossier">
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
        <div class="drive-status-success">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Google Drive est configuré</span>
        </div>
        <div class="drive-setup-actions">
          <button class="btn btn-ghost btn-danger" onclick="DriveUI.signOut()">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Se déconnecter
          </button>
        </div>
      `;
    }
  }

  /**
   * Open Google Picker for folder selection (or fallback UI if no API key)
   * Note: Picker requires client-side access token, so we use fallback selector
   */
  static async openFolderPicker() {
    // With server-side auth, we use the fallback folder selector
    // The Google Picker requires a client-side access token which we don't expose
    await DriveUI.showFallbackFolderSelector();
  }

  /**
   * Show fallback folder selector using server API
   */
  static async showFallbackFolderSelector() {
    const content = document.getElementById('driveSetupContent');
    if (!content) return;

    content.innerHTML = `
      <div class="drive-folder-list-loading">
        <div class="drive-spinner"></div>
        <p>Chargement des dossiers...</p>
      </div>
    `;

    try {
      const folders = await driveAPI.listFolders();

      if (folders.length === 0) {
        content.innerHTML = `
          <div class="drive-folder-list-empty">
            <p>Aucun dossier trouvé dans votre Drive.</p>
            <button class="btn btn-primary" onclick="DriveUI.createNewFolder()">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Créer un dossier
            </button>
            <button class="btn btn-secondary" onclick="DriveUI.refreshFolderList()">Actualiser</button>
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div class="drive-folder-list">
          <div class="drive-folder-list-header">
            <h4>Sélectionner un dossier</h4>
            <button class="btn btn-ghost btn-sm" onclick="DriveUI.createNewFolder()" title="Créer un dossier">
              <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
          <div class="drive-folder-list-items">
            ${folders.map(folder => `
              <div class="drive-folder-item" onclick="DriveUI.selectFolder('${folder.id}', '${folder.name.replace(/'/g, "\\'")}')">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <span>${folder.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error loading folders:', error);
      content.innerHTML = `
        <div class="drive-folder-list-error">
          <p>Erreur lors du chargement des dossiers.</p>
          <button class="btn btn-secondary" onclick="DriveUI.refreshFolderList()">Réessayer</button>
        </div>
      `;
    }
  }

  /**
   * Select a folder from the fallback list
   */
  static selectFolder(folderId, folderName) {
    driveStorageService.setSelectedFolder(folderId, folderName);
    driveUIInstance.renderSetupModalContent();
  }

  /**
   * Refresh folder list
   */
  static async refreshFolderList() {
    await DriveUI.showFallbackFolderSelector();
  }

  /**
   * Create a new folder in Drive using server API
   */
  static async createNewFolder() {
    const folderName = prompt('Nom du nouveau dossier:', 'Presentation Builder');
    if (!folderName) return;

    const content = document.getElementById('driveSetupContent');
    if (content) {
      content.innerHTML = `
        <div class="drive-folder-list-loading">
          <div class="drive-spinner"></div>
          <p>Création du dossier...</p>
        </div>
      `;
    }

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
      driveUIInstance.renderSetupModalContent();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Erreur lors de la création du dossier: ' + error.message);
      await DriveUI.showFallbackFolderSelector();
    }
  }

  /**
   * Sign in to Google
   */
  static signIn() {
    driveAuth.signIn();
  }

  /**
   * Sign out from Google
   */
  static signOut() {
    if (confirm('Se déconnecter de Google Drive ? Vos projets locaux seront conservés.')) {
      driveStorageService.clearSelectedFolder();
      driveAuth.signOut();
      DriveUI.closeSetupModal();
    }
  }

  // Auth event handlers (no-op since file-sidebar handles UI updates)
  onReady() {}
  onSignIn() {
    this.renderSetupModalContent();
  }
  onSignOut() {}
  onError(error) {
    console.error('DriveUI auth error:', error);
  }

  // Icon generators
  getGoogleDriveColorIcon() {
    return `<svg viewBox="0 0 87.3 78" width="40" height="36">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>`;
  }
}

// Create singleton instance
const driveUIInstance = new DriveUI();

// Export for window access (used by onclick handlers in HTML)
if (typeof window !== 'undefined') {
  window.DriveUI = {
    signIn: DriveUI.signIn,
    signOut: DriveUI.signOut,
    openDriveSetupModal: DriveUI.openDriveSetupModal,
    closeSetupModal: DriveUI.closeSetupModal,
    openFolderPicker: DriveUI.openFolderPicker,
    selectFolder: DriveUI.selectFolder,
    refreshFolderList: DriveUI.refreshFolderList,
    createNewFolder: DriveUI.createNewFolder
  };
}

export { driveUIInstance as driveUI, DriveUI };
export default driveUIInstance;
