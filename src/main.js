// src/main.js
// Main entry point for ES6 modules - thin wrapper that wires modules together

// ============================================================================
// IMPORTS FROM EXISTING MODULES
// ============================================================================

// Config
import {
    THEMES, TEMPLATES, ICONS, GRAY_PALETTE, COLOR_LABELS, GRAY_LABELS,
    TEMPLATE_COLOR_SETTINGS, SAMPLE_PROJECT, getDefaultData
} from './config/index.js';

// Utils
import { escapeHtml } from './infrastructure/utils/html.js';
import { getGitLabLogoSvg, getGitLabLogo } from './infrastructure/utils/svg.js';

// Core state (re-exports from state/ subdirectory)
import {
    store, getState, setState, get, set, subscribe, batch, reset,
    getProject, setProject,
    getSelectedSlideIndex, setSelectedSlideIndex,
    hasUnsavedChanges as getHasUnsavedChanges, setHasUnsavedChanges,
    isProjectSaved
} from './core/state.js';

// UI state helpers (DOM manipulation)
import {
    updateSaveButtonState, showUnsavedAlert, hideUnsavedAlert, dismissUnsavedAlert
} from './presentation/app/state-ui.js';

// Project service
import { createEmptyProject as createEmptyProjectFromService } from './services/project-service.js';

// Events (re-exports from events/ subdirectory)
import { emit, on, off, once, EventTypes } from './core/events.js';

// UI refresh utilities
import { refreshSlideList, refreshEditor, refreshPreview } from './presentation/app/ui-refresh.js';

// Error handler
import { initErrorHandler } from './domain/error-handler.js';

// Event delegation
import { initEventDelegation } from './presentation/event-delegation.js';

// Templates
import { renderTemplate } from './presentation/templates/renderer.js';
import { getPreviewStyles } from './presentation/templates/preview-styles.js';
import { getThemeColor, getThemeColors, resolveThemeColor } from './presentation/templates/theme.js';
import { renderCodeLines } from './presentation/templates/utilities.js';
import { adjustTextTemplateScale } from './presentation/templates/components/layout.js';

// Projects
import { showConfirm, hideConfirm, handleConfirmResponse } from './projects/notifications.js';
import {
    saveCurrentProject, loadProject, deleteProject, createNewProject,
    renameProject,
    openSaveProjectModal, closeSaveProjectModal, saveProjectWithName, validateSaveProjectName
} from './projects/manager.js';
import { exportToJSON, importFromJSON, triggerFileInput, exportToGoogleSlides } from './projects/import-export.js';

// Project title editing
import {
    editProjectTitle, finishEditProjectTitle, handleTitleKeydown,
    updateHeaderTitle, loadInitialProject, saveLastOpenedProject
} from './presentation/app/project.js';

// Drive
import { driveAuth, driveAPI, driveStorageService } from './infrastructure/drive/index.js';
import { driveUI } from './presentation/app/drive-ui.js';
import { driveStateMachine, DriveState } from './infrastructure/drive/state-machine.js';

// File sidebar
import { fileSidebar } from './presentation/app/file-sidebar.js';
import { FileList } from './presentation/app/file-list.js';

// Theme (color customization)
import {
    renderThemeSelector,
    renderColorList,
    initThemeColorPickerEvents,
    updateAppThemeColors,
    selectTheme,
    toggleThemeColorPicker, closeAllThemeColorPickers,
    resetColorOverride, resetAllColorOverrides
} from './presentation/app/theme.js';

// Editor - use existing modules
import {
    updateEditorTabUnderline,
    switchEditorTab as switchEditorTabAnimated,
    renderEditor
} from './presentation/editor/panel.js';

// Editor handlers - import from existing module
import {
    updateField,
    changeTemplate,
    updateArrayItem, addArrayItem, removeArrayItem,
    updateColumnField, updateColumnItem, addColumnItem, removeColumnItem,
    updateStatItem, addStatItem, removeStatItem,
    updateAnnotationItem, addAnnotationItem, removeAnnotationItem,
    updateStepItem, addStepItem, removeStepItem,
    updateRowCell, addRowItem, removeRowItem,
    updateTableCell, addTableRow, removeTableRow,
    updateAgendaItem, addAgendaItem, removeAgendaItem
} from './presentation/editor/handlers.js';

// Editor color selector
import {
    toggleColorPicker, selectSlideColor, updateSlideColor, resetSlideColor,
    showColorName, hideColorName
} from './presentation/editor/color-selector.js';

// Sidebar
import {
    updateSidebarTabUnderline,
    switchSidebarTab as switchSidebarTabAnimated,
    initTemplateGrid,
    renderSettingsPanel
} from './presentation/app/sidebar.js';

// Panels
import {
    initPanelStates,
    toggleSidebar as toggleSidebarFromPanels,
    toggleEditorPanel as toggleEditorPanelFromPanels
} from './presentation/app/panels.js';

// Slides - use existing modules
import { renderSlideList, selectSlide, initSlideListSubscriptions } from './presentation/app/slides/list.js';
import {
    addSlide, selectTemplate,
    deleteSlide, duplicateSlide, moveSlide
} from './presentation/app/slides/management.js';
// Note: Drag handlers (handleDragStart, etc.) are now set on window directly in list.js
import { updatePreview, scalePreviewSlide, initPreviewSubscriptions } from './presentation/app/slides/preview.js';

// Presentation mode - use existing module
import {
    startPresentation, exitPresentation,
    prevSlidePlayer, nextSlidePlayer, scalePlayerSlide
} from './presentation/app/presentation.js';

// Modals
import {
    closeModal, initModalBehaviors,
    openPromptModal, cancelPromptModal, confirmPromptModal
} from './presentation/app/modals.js';

// Import modal
import {
    openImportModal, switchImportTab, handleFileSelect, handleImport,
    clearSelectedFile, confirmImport, formatJsonInput, initFileDropZone, initJsonCodeInput
} from './presentation/app/import-modal.js';

// Inline editing (auto-initializes on DOM ready)
import inlineEditor from './presentation/inline-editing/index.js';

// ============================================================================
// THIN WRAPPER FUNCTIONS
// ============================================================================

// Sidebar & panel wrappers
function switchSidebarTab(tab) {
    sessionStorage.setItem('sidebarTab', tab);
    switchSidebarTabAnimated(tab);
}

function switchEditorTab(tab) {
    sessionStorage.setItem('editorTab', tab);
    switchEditorTabAnimated(tab);
}

function toggleSidebar() {
    toggleSidebarFromPanels();
}

function toggleEditorPanel() {
    toggleEditorPanelFromPanels();
}

// Project management wrappers

// Open the new project modal
function newProject() {
    // Show warning only if there are actual unsaved changes
    const warning = document.getElementById('newProjectWarning');
    if (warning) {
        warning.style.display = getHasUnsavedChanges() ? 'flex' : 'none';
    }
    const modal = document.getElementById('newProjectModal');
    if (modal) modal.classList.add('active');
}

// Create an empty project with just a title slide
function createEmptyProject() {
    const project = createEmptyProjectFromService();
    // Add a title slide for the UI version
    project.metadata.title = 'Sans titre';
    project.slides = [
        {
            template: 'title',
            data: {
                title: 'Nouvelle présentation',
                subtitle: '',
                author: '',
                date: new Date().toLocaleDateString('fr-FR')
            }
        }
    ];
    applyNewProject(project);
}

// Create a demo project with all templates
function createDemoProject() {
    const project = JSON.parse(JSON.stringify(SAMPLE_PROJECT));
    project.name = null;
    applyNewProject(project);
}

// Apply a new project (shared logic)
function applyNewProject(project) {
    closeModal('newProjectModal');
    setProject(project);
    setSelectedSlideIndex(0);
    setHasUnsavedChanges(false);
    hideUnsavedAlert();
    sessionStorage.removeItem('unsavedAlertDismissed');
    updateSaveButtonState('unsaved');
    renderSlideList();
    renderEditor();
    updatePreview();
    updateHeaderTitle();
    updateAppThemeColors();
}

function saveProject() {
    saveCurrentProject();
}

function exportProject() {
    exportToJSON();
}

function importProject() {
    openImportModal();
}

function exportToHtml() {
    // Export HTML not available
}

function confirmSaveProject() {
    saveProjectWithName();
}

function onSaveStatusClick() {
    saveCurrentProject();
}

// Slide management wrappers
function duplicateSlideAt(index) {
    duplicateSlide(index);
}

function deleteSlideAt(index) {
    deleteSlide(index);
}

// ============================================================================
// INITIALIZE
// ============================================================================

function initializeApp() {
    initErrorHandler();

    // Initialize event delegation for data-action handlers
    initEventDelegation();

    // Initialize event subscriptions for event-driven UI
    initPreviewSubscriptions();
    initSlideListSubscriptions();

    // Subscribe to UI refresh events (for modules using refreshSlideList, refreshEditor, refreshPreview)
    on(EventTypes.SLIDE_LIST_CHANGED, () => {
        renderSlideList();
    });
    on(EventTypes.EDITOR_REFRESH_REQUESTED, () => {
        renderEditor();
    });
    on(EventTypes.PREVIEW_REFRESH_REQUESTED, () => {
        updatePreview();
    });
    on(EventTypes.UI_REFRESH_REQUESTED, () => {
        renderSlideList();
        renderEditor();
        updatePreview();
    });

    // Autosave timer for debouncing
    let autosaveTimer = null;

    // Subscribe to persistence events - update UI when changes are marked
    on(EventTypes.CHANGES_MARKED, () => {
        const project = getProject();
        // Only for already-saved projects
        if (project?.name) {
            updateSaveButtonState('modifying');

            // Autosave with debouncing - longer delay for Drive to batch changes
            const delay = project.driveId ? 2000 : 500;

            if (autosaveTimer) {
                clearTimeout(autosaveTimer);
            }
            autosaveTimer = setTimeout(() => {
                updateSaveButtonState('saving');
                saveCurrentProject();
            }, delay);
        } else {
            showUnsavedAlert();
        }
    });

    // Subscribe to slide selection - update editor panel
    on(EventTypes.SLIDE_SELECTED, () => {
        renderEditor();
    });

    // Subscribe to project events - update UI when projects are saved/loaded
    on(EventTypes.PROJECT_SAVED, () => {
        hideUnsavedAlert();
        updateSaveButtonState('saved');
        // Save last opened project (may have new IDs after first save)
        saveLastOpenedProject(getProject());
    });

    on(EventTypes.PROJECT_LOADED, () => {
        hideUnsavedAlert();
        updateSaveButtonState('saved');
        renderSlideList();
        renderEditor();
        updatePreview();
        updateHeaderTitle();
        renderSettingsPanel();
        // Save last opened project for session restore
        saveLastOpenedProject(getProject());
    });


    // Subscribe to modal events - close modals via event
    on(EventTypes.MODAL_CLOSED, ({ modalId }) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    });

    // Initialize Drive Auth (server-side authentication)
    driveAuth.init();

    // Initialize Drive UI
    driveUI.init();

    // Initialize File Sidebar
    fileSidebar.init();

    loadInitialProject();
    updateAppThemeColors();
    initTemplateGrid();

    // Restore editor tab state before rendering
    const savedEditorTab = sessionStorage.getItem('editorTab');
    if (savedEditorTab && ['properties', 'colors'].includes(savedEditorTab)) {
        switchEditorTabAnimated(savedEditorTab);
    }

    renderSlideList();
    renderEditor();
    updatePreview();
    updateHeaderTitle();
    renderSettingsPanel();
    initPanelStates();

    // Initialize save status
    const project = getProject();
    if (project?.name) {
        updateSaveButtonState('saved');
    } else {
        updateSaveButtonState('unsaved');
    }

    // Initialize mermaid
    if (window.mermaid) {
        window.mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    }

    // Resize observer for preview
    const previewPanel = document.querySelector('.preview-panel');
    if (previewPanel) {
        new ResizeObserver(() => scalePreviewSlide()).observe(previewPanel);
    }
    window.addEventListener('resize', scalePreviewSlide);

    // Show "modifying" state immediately on input (before change is committed)
    // Listen on document for both editor panel inputs and inline editing (contenteditable)
    document.addEventListener('input', (e) => {
        const target = e.target;
        // For text inputs, textareas, and contenteditable elements
        if (target.matches('input[type="text"], input[type="number"], textarea, [contenteditable="true"]')) {
            const project = getProject();
            if (project?.name) {
                updateSaveButtonState('modifying');
            }
        }
    });

    // Initialize file drop zone and JSON input for import modal
    initFileDropZone();
    initJsonCodeInput();

    // Initialize modal behaviors
    initModalBehaviors();

    // Initialize tab underlines and restore tab states
    requestAnimationFrame(() => {
        const savedSidebarTab = sessionStorage.getItem('sidebarTab');
        if (savedSidebarTab && ['slides', 'settings'].includes(savedSidebarTab)) {
            switchSidebarTabAnimated(savedSidebarTab);
        }
        updateSidebarTabUnderline();

        if (savedEditorTab) {
            switchEditorTabAnimated(savedEditorTab);
        }
        updateEditorTabUnderline();
    });
}

// ============================================================================
// EXPOSE TO WINDOW VIA App CONTROLLER
// ============================================================================

// Single global entry point for HTML onclick handlers
// Usage: onclick="App.closeModal('save')" instead of onclick="closeModal('save')"
window.App = {
    // UI functions
    renderSlideList, selectSlide, renderEditor, updatePreview, scalePreviewSlide,
    updateHeaderTitle, editProjectTitle, finishEditProjectTitle, handleTitleKeydown,
    switchSidebarTab, toggleSidebar, toggleEditorPanel, switchEditorTab,
    renderSettingsPanel, initTemplateGrid, updateAppThemeColors, renderThemeSelector, renderColorList, initThemeColorPickerEvents, selectTheme,
    updateSidebarTabUnderline, updateEditorTabUnderline,

    // Slide management
    addSlide, selectTemplate, deleteSlide, duplicateSlide, moveSlide, duplicateSlideAt, deleteSlideAt,

    // Presentation
    startPresentation, exitPresentation, prevSlidePlayer, nextSlidePlayer, scalePlayerSlide,

    // Field updates (editor handlers)
    updateField, changeTemplate,
    updateArrayItem, removeArrayItem, addArrayItem,
    updateColumnField, updateColumnItem, removeColumnItem, addColumnItem,
    updateStatItem, removeStatItem, addStatItem,
    updateStepItem, removeStepItem, addStepItem,
    updateAgendaItem, removeAgendaItem, addAgendaItem,
    updateRowCell, removeRowItem, addRowItem,
    updateTableCell, removeTableRow, addTableRow,
    updateAnnotationItem, removeAnnotationItem, addAnnotationItem,

    // Projects
    showConfirm, hideConfirm, handleConfirmResponse,
    saveCurrentProject, loadProject, deleteProject, createNewProject, renameProject,
    openSaveProjectModal, closeSaveProjectModal, saveProjectWithName, validateSaveProjectName,
    exportToJSON, importFromJSON, triggerFileInput,

    // Modal & UI
    closeModal, newProject, createEmptyProject, createDemoProject,
    saveProject, exportProject, importProject, exportToGoogleSlides,
    exportToHtml, confirmImport, confirmSaveProject, onSaveStatusClick,
    clearSelectedFile, switchImportTab, formatJsonInput,
    openPromptModal, cancelPromptModal, confirmPromptModal,
    handleFileSelect, handleImport,

    // Theme color picker
    toggleThemeColorPicker, closeAllThemeColorPickers,
    resetColorOverride, resetAllColorOverrides,

    // Editor color selector
    toggleColorPicker, selectSlideColor, updateSlideColor, resetSlideColor,
    showColorName, hideColorName,

    // State
    dismissUnsavedAlert,

    // Drive
    driveAuth, driveAPI, driveStorageService, driveStateMachine, DriveState,

    // File sidebar
    toggleFileSidebar: () => fileSidebar.toggle(),
    switchFileSidebarTab: (tab) => fileSidebar.switchTab(tab),
    FileSidebar: window.FileSidebar,
    FileList,

    // Inline editing - Image Picker
    closeImagePicker: () => inlineEditor.closeImagePicker(),
    confirmImageSelection: () => inlineEditor.confirmImageSelection(),
    clearImage: () => inlineEditor.clearImage(),
    switchImagePickerTab: (tab) => {
        document.querySelectorAll('.image-picker-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        document.getElementById('imagePickerUrl').style.display = tab === 'url' ? 'block' : 'none';
        document.getElementById('imagePickerUpload').style.display = tab === 'upload' ? 'block' : 'none';
    },
    handleImageUrlInput: (url) => {
        if (!url) {
            document.getElementById('imagePreviewContainer').style.display = 'none';
            return;
        }
        const img = new Image();
        img.onload = () => {
            inlineEditor.selectedImageData = url;
            inlineEditor.showImagePreview(url);
        };
        img.onerror = () => {
            document.getElementById('imagePreviewContainer').style.display = 'none';
        };
        img.src = url;
    },
    handleImageFileSelect: (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                inlineEditor.selectedImageData = e.target.result;
                inlineEditor.showImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    },

    // Inline editing - Code Editor
    closeCodeEditor: () => inlineEditor.closeCodeEditor(),
    confirmCodeEdit: () => inlineEditor.confirmCodeEdit(),
    updateCodeEditorLineNumbers: () => {
        const textarea = document.getElementById('codeEditorInput');
        const lineNumbers = document.getElementById('codeEditorLineNumbers');
        const startLineInput = document.getElementById('codeStartLine');
        const showLineNumbersCheckbox = document.getElementById('codeShowLineNumbers');
        if (!textarea || !lineNumbers) return;
        const showLineNumbers = showLineNumbersCheckbox ? showLineNumbersCheckbox.checked : false;
        if (!showLineNumbers) {
            lineNumbers.style.display = 'none';
            return;
        }
        lineNumbers.style.display = 'block';
        const lines = textarea.value.split('\n');
        const startLine = startLineInput ? parseInt(startLineInput.value) || 1 : 1;
        let html = '';
        for (let i = 0; i < lines.length; i++) {
            html += `<div>${startLine + i}</div>`;
        }
        if (lines.length === 0) {
            html = `<div>${startLine}</div>`;
        }
        lineNumbers.innerHTML = html;
    },
    syncLineNumbersScroll: () => {
        const textarea = document.getElementById('codeEditorInput');
        const lineNumbers = document.getElementById('codeEditorLineNumbers');
        if (textarea && lineNumbers) {
            lineNumbers.scrollTop = textarea.scrollTop;
        }
    },
    updateCodeEditorEllipsis: () => {
        const showEllipsisBeforeCheckbox = document.getElementById('codeShowEllipsisBefore');
        const showEllipsisAfterCheckbox = document.getElementById('codeShowEllipsisAfter');
        const ellipsisBefore = document.getElementById('codeEllipsisBefore');
        const ellipsisAfter = document.getElementById('codeEllipsisAfter');
        if (ellipsisBefore) {
            ellipsisBefore.classList.toggle('visible', showEllipsisBeforeCheckbox?.checked || false);
        }
        if (ellipsisAfter) {
            ellipsisAfter.classList.toggle('visible', showEllipsisAfterCheckbox?.checked || false);
        }
        window.App.updateCodeEditorLineNumbers();
    },

    // Inline editing - Draw.io
    closeDrawioEditor: () => inlineEditor.closeDrawioEditor(),

    // Drive Setup Modal
    closeDriveSetupModal: () => window.DriveUI?.closeSetupModal(),

    // Mermaid
    initMermaid: () => {
        if (window.mermaid) {
            window.mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
        }
    },

    // Initialize
    initializeApp, loadInitialProject
};

// Also expose templates globally (used by presentation.js and other modules)
window.renderTemplate = renderTemplate;
window.getPreviewStyles = getPreviewStyles;
window.adjustTextTemplateScale = adjustTextTemplateScale;
window.getThemeColors = getThemeColors;

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
