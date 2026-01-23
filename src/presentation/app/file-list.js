// src/presentation/app/file-list.js
// Reusable file list component for local and Drive files

import { getProject } from '../../core/state.js';
import { escapeHtml } from '../../infrastructure/utils/html.js';

/**
 * Format relative time string
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time (e.g., "il y a 2h")
 */
function formatRelativeTime(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins}min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/**
 * Render a single file list item
 * @param {Object} file - File object
 * @param {Object} options - Render options
 * @param {string} options.source - 'local' or 'drive'
 * @param {boolean} options.isCurrent - Is this the currently open file
 * @returns {string} HTML string
 */
function renderFileItem(file, options) {
  const { source, isCurrent } = options;

  // For local files, show slide count. For Drive files, we don't have this info without loading each file.
  const slideCount = file.slides?.length;
  const hasSlidesInfo = source === 'local' && typeof slideCount === 'number';
  const slideMeta = hasSlidesInfo ? `${slideCount} slide${slideCount !== 1 ? 's' : ''}` : '';
  const timeInfo = file.savedAt ? formatRelativeTime(file.savedAt) : '';
  const meta = [slideMeta, timeInfo].filter(Boolean).join(' · ');

  const localIdAttr = file.localId ? `data-local-id="${escapeHtml(file.localId)}"` : '';
  const driveIdAttr = file.driveId ? `data-drive-id="${escapeHtml(file.driveId)}"` : '';

  return `
    <div class="file-list-item ${isCurrent ? 'current' : ''}"
         data-source="${source}"
         ${localIdAttr}
         ${driveIdAttr}
         data-name="${escapeHtml(file.name || '')}"
         onclick="FileList.handleClick(this, event)">
      <div class="file-item-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <div class="file-item-info">
        <span class="file-item-name">${escapeHtml(file.name || 'Sans titre')}</span>
        <span class="file-item-meta">${meta}</span>
      </div>
      ${isCurrent ? '<span class="file-current-badge">Ouvert</span>' : `
        <div class="file-item-actions">
          <button class="file-item-btn" onclick="FileList.handleDuplicate(this, event)" title="Dupliquer">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button class="file-item-btn delete" onclick="FileList.handleDelete(this, event)" title="Supprimer">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `}
    </div>
  `;
}

/**
 * Render empty state for file list
 * @param {string} source - 'local' or 'drive'
 * @returns {string} HTML string
 */
function renderEmptyState(source) {
  const isLocal = source === 'local';
  const text = isLocal
    ? 'Aucun projet sauvegardé localement'
    : 'Aucun fichier dans ce dossier';

  return `
    <div class="file-list-empty">
      <div class="file-list-empty-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <p class="file-list-empty-text">${text}</p>
    </div>
  `;
}

/**
 * Render file list
 * @param {Array} files - Array of file objects
 * @param {Object} options - Render options
 * @param {string} options.source - 'local' or 'drive'
 * @param {HTMLElement} container - Container element to render into
 */
function renderFileList(files, options, container) {
  if (!container) return;

  const { source } = options;
  const currentProject = getProject();

  if (!files || files.length === 0) {
    container.innerHTML = renderEmptyState(source);
    return;
  }

  // Determine current file based on identity
  const isCurrentFile = (file) => {
    if (source === 'local') {
      return file.localId && file.localId === currentProject?.localId;
    } else {
      return file.driveId && file.driveId === currentProject?.driveId;
    }
  };

  const html = files.map(file => renderFileItem(file, {
    source,
    isCurrent: isCurrentFile(file)
  })).join('');

  container.innerHTML = html;
}

/**
 * FileList - Public API for file list operations
 */
const FileList = {
  /**
   * Render local files list
   * @param {Array} files - Array of local project objects
   * @param {HTMLElement} [container] - Optional container, defaults to #localFileList
   */
  renderLocal(files, container) {
    container = container || document.getElementById('localFileList');
    renderFileList(files, { source: 'local' }, container);
  },

  /**
   * Render Drive files list
   * @param {Array} files - Array of Drive file objects
   * @param {HTMLElement} [container] - Optional container, defaults to #driveFileList
   */
  renderDrive(files, container) {
    container = container || document.getElementById('driveFileList');
    renderFileList(files, { source: 'drive' }, container);
  },

  /**
   * Handle click on file item
   * @param {HTMLElement} element - Clicked element
   * @param {Event} event - Click event
   */
  handleClick(element, event) {
    // Don't handle if clicking on action buttons
    if (event.target.closest('.file-item-actions')) return;

    const source = element.dataset.source;
    const localId = element.dataset.localId;
    const driveId = element.dataset.driveId;

    // Check if already current
    if (element.classList.contains('current')) return;

    // Emit event for file selection (handled by file-sidebar.js)
    if (window.FileSidebar) {
      window.FileSidebar.openFile(source, { localId, driveId, name: element.dataset.name });
    }
  },

  /**
   * Handle open button click
   * @param {HTMLElement} button - Clicked button
   * @param {Event} event - Click event
   */
  handleOpen(button, event) {
    event.stopPropagation();
    const item = button.closest('.file-list-item');
    if (item) {
      this.handleClick(item, event);
    }
  },

  /**
   * Handle duplicate button click
   * @param {HTMLElement} button - Clicked button
   * @param {Event} event - Click event
   */
  handleDuplicate(button, event) {
    event.stopPropagation();
    const item = button.closest('.file-list-item');
    if (!item) return;

    const source = item.dataset.source;
    const localId = item.dataset.localId;
    const driveId = item.dataset.driveId;

    if (window.FileSidebar) {
      window.FileSidebar.duplicateFile(source, { localId, driveId, name: item.dataset.name });
    }
  },

  /**
   * Handle delete button click
   * @param {HTMLElement} button - Clicked button
   * @param {Event} event - Click event
   */
  handleDelete(button, event) {
    event.stopPropagation();
    const item = button.closest('.file-list-item');
    if (!item) return;

    // Can't delete current file (but button should be hidden anyway)
    if (item.classList.contains('current')) return;

    const source = item.dataset.source;
    const localId = item.dataset.localId;
    const driveId = item.dataset.driveId;
    const name = item.dataset.name;

    if (window.FileSidebar) {
      window.FileSidebar.deleteFile(source, { localId, driveId, name });
    }
  },

  /**
   * Handle move button click (move to other storage)
   * @param {HTMLElement} button - Clicked button
   * @param {Event} event - Click event
   */
  handleMove(button, event) {
    event.stopPropagation();
    const item = button.closest('.file-list-item');
    if (!item) return;

    const source = item.dataset.source;
    const localId = item.dataset.localId;
    const driveId = item.dataset.driveId;
    const name = item.dataset.name;

    if (window.FileSidebar) {
      window.FileSidebar.moveToOtherStorage(source, { localId, driveId, name });
    }
  },

  /**
   * Set loading state on a file item
   * @param {string} driveId - Drive file ID
   * @param {boolean} isLoading - Whether the item is loading
   */
  setItemLoading(driveId, isLoading) {
    const item = document.querySelector(`.file-list-item[data-drive-id="${driveId}"]`);
    if (!item) return;

    if (isLoading) {
      item.classList.add('loading');
      // Add spinner to the item
      const icon = item.querySelector('.file-item-icon');
      if (icon) {
        icon.dataset.originalHtml = icon.innerHTML;
        icon.innerHTML = '<div class="file-item-spinner"></div>';
      }
    } else {
      item.classList.remove('loading');
      // Restore original icon
      const icon = item.querySelector('.file-item-icon');
      if (icon && icon.dataset.originalHtml) {
        icon.innerHTML = icon.dataset.originalHtml;
        delete icon.dataset.originalHtml;
      }
    }
  }
};

// Export for window access
if (typeof window !== 'undefined') {
  window.FileList = FileList;
}

export { FileList, renderFileList, renderFileItem, renderEmptyState };
export default FileList;
