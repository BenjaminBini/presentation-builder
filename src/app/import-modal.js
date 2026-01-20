// src/app/import-modal.js
// Import modal functionality - uses event-driven architecture

import { setProject, setSelectedSlideIndex, markAsChanged } from '../core/state.js';
import { emit, EventTypes } from '../core/events.js';
import { importFromJSON } from '../projects/import-export.js';
import { closeModal } from './modals.js';

// Store the selected file for import
let _selectedImportFile = null;

/**
 * Open the import modal
 */
export function openImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.add('active');
        // Reset the modal state
        switchImportTab('file');
        clearSelectedFile();
        const jsonInput = document.getElementById('jsonCodeInput');
        if (jsonInput) jsonInput.value = '';
        const jsonError = document.getElementById('jsonError');
        if (jsonError) jsonError.textContent = '';
    }
}

/**
 * Switch between file and code tabs in import modal
 * @param {string} tab - 'file' or 'code'
 */
export function switchImportTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.import-tab').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tab);
    });

    // Update tab content visibility
    const fileTab = document.getElementById('importTabFile');
    const codeTab = document.getElementById('importTabCode');

    if (fileTab) {
        fileTab.classList.toggle('active', tab === 'file');
        fileTab.style.display = tab === 'file' ? 'block' : 'none';
    }
    if (codeTab) {
        codeTab.classList.toggle('active', tab === 'code');
        codeTab.style.display = tab === 'code' ? 'block' : 'none';
    }
}

/**
 * Handle file selection from input
 * @param {Event} event - The change event from file input
 */
export function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        _selectedImportFile = file;
        const fileSelected = document.getElementById('fileSelected');
        const selectedFileName = document.getElementById('selectedFileName');
        const fileDropZone = document.getElementById('fileDropZone');

        if (fileSelected) fileSelected.style.display = 'flex';
        if (selectedFileName) selectedFileName.textContent = file.name;
        if (fileDropZone) fileDropZone.style.display = 'none';
    }
}

/**
 * Legacy handler - redirect to handleFileSelect
 * @param {Event} event - The change event
 */
export function handleImport(event) {
    handleFileSelect(event);
}

/**
 * Clear the selected file
 * @param {Event} [event] - Optional event to stop propagation
 */
export function clearSelectedFile(event) {
    if (event) event.stopPropagation();

    // Clear the selected import file
    _selectedImportFile = null;

    // Reset the file input
    const importFileInput = document.getElementById('importFileInput');
    if (importFileInput) importFileInput.value = '';

    // Hide the file selected display and show the drop zone
    const fileSelected = document.getElementById('fileSelected');
    const fileDropZone = document.getElementById('fileDropZone');

    if (fileSelected) fileSelected.style.display = 'none';
    if (fileDropZone) fileDropZone.style.display = 'flex';
}

/**
 * Confirm and execute the import
 */
export function confirmImport() {
    const activeTab = document.querySelector('.import-tab.active')?.dataset.tab || 'file';

    if (activeTab === 'file') {
        // Import from file
        if (_selectedImportFile) {
            importFromJSON(_selectedImportFile).then(() => {
                closeModal('importModal');
                _selectedImportFile = null;
            }).catch(err => {
                console.error('Import error:', err);
            });
        }
    } else {
        // Import from JSON code
        const jsonInput = document.getElementById('jsonCodeInput');
        const jsonError = document.getElementById('jsonError');
        if (jsonInput && jsonInput.value.trim()) {
            try {
                const project = JSON.parse(jsonInput.value);

                // Validate project structure
                if (!project.name || !project.slides) {
                    throw new Error('Format de projet invalide');
                }

                // Set as current project using centralized state
                setProject(project);
                setSelectedSlideIndex(project.slides.length > 0 ? 0 : -1);
                markAsChanged();

                // Emit PROJECT_LOADED - list.js and preview.js subscribe to this event
                emit(EventTypes.PROJECT_LOADED, { project });

                // Update editor, header, and theme (refresh required for immediate UI update)
                if (window.renderEditor) window.renderEditor();
                if (window.updateHeaderTitle) window.updateHeaderTitle();
                if (window.updateAppThemeColors) window.updateAppThemeColors();

                closeModal('importModal');
            } catch (err) {
                if (jsonError) {
                    jsonError.textContent = 'JSON invalide: ' + err.message;
                }
            }
        }
    }
}

/**
 * Format the JSON in the input textarea
 */
export function formatJsonInput() {
    const textarea = document.getElementById('jsonCodeInput');
    if (textarea) {
        try {
            const parsed = JSON.parse(textarea.value);
            textarea.value = JSON.stringify(parsed, null, 2);
            const jsonError = document.getElementById('jsonError');
            if (jsonError) jsonError.textContent = '';
        } catch (e) {
            const jsonError = document.getElementById('jsonError');
            if (jsonError) jsonError.textContent = 'JSON invalide: ' + e.message;
        }
    }
}

/**
 * Prevent default event behavior
 * @param {Event} e - The event to prevent
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Handle file drop on the drop zone
 * @param {DragEvent} e - The drop event
 */
function handleFileDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        const file = files[0];
        if (file.name.endsWith('.json')) {
            _selectedImportFile = file;
            const fileSelected = document.getElementById('fileSelected');
            const selectedFileName = document.getElementById('selectedFileName');
            const fileDropZone = document.getElementById('fileDropZone');

            if (fileSelected) fileSelected.style.display = 'flex';
            if (selectedFileName) selectedFileName.textContent = file.name;
            if (fileDropZone) fileDropZone.style.display = 'none';
        }
    }
}

/**
 * Initialize the file drop zone for import modal
 */
export function initFileDropZone() {
    const dropZone = document.getElementById('fileDropZone');
    if (!dropZone) return;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone on drag
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        }, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleFileDrop, false);
}
