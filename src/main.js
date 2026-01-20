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

// Projects
import { showConfirm, hideConfirm, handleConfirmResponse } from './projects/notifications.js';
import {
    saveCurrentProject, loadProject, deleteProject, createNewProject,
    openProjectModal, closeProjectModal, renameProject,
    openSaveProjectModal, closeSaveProjectModal, saveProjectWithName, validateSaveProjectName
} from './projects/manager.js';
import { exportToJSON, importFromJSON, triggerFileInput } from './projects/import-export.js';

// Project title editing
import {
    editProjectTitle, finishEditProjectTitle, handleTitleKeydown,
    updateHeaderTitle, loadInitialProject
} from './presentation/app/project.js';

// Drive
import { driveAuth, driveAPI, driveSync } from './infrastructure/drive/index.js';

// Theme (color customization)
import {
    renderThemeSelector,
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
    closeModal, initModalBehaviors, openProjectsModal,
    openPromptModal, cancelPromptModal, confirmPromptModal,
    setConflictResolver, resolveConflict
} from './presentation/app/modals.js';

// Import modal
import {
    openImportModal, switchImportTab, handleFileSelect, handleImport,
    clearSelectedFile, confirmImport, formatJsonInput, initFileDropZone
} from './presentation/app/import-modal.js';

// Inline editing (auto-initializes on DOM ready)
import './presentation/inline-editing/index.js';

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

            // Autosave after 0.5s of inactivity
            if (autosaveTimer) {
                clearTimeout(autosaveTimer);
            }
            autosaveTimer = setTimeout(() => {
                updateSaveButtonState('saving');
                saveCurrentProject();
            }, 500);
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
    });

    on(EventTypes.PROJECT_LOADED, () => {
        hideUnsavedAlert();
        updateSaveButtonState('saved');
        renderSlideList();
        renderEditor();
        updatePreview();
        updateHeaderTitle();
        renderSettingsPanel();
    });

    // Subscribe to drive sync events - refresh UI after sync
    on(EventTypes.DRIVE_SYNC_COMPLETED, () => {
        renderSlideList();
        renderEditor();
        updatePreview();
        updateHeaderTitle();
        renderSettingsPanel();
    });

    // Subscribe to modal events - close modals via event
    on(EventTypes.MODAL_CLOSED, ({ modalId }) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    });

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

    // Initialize file drop zone for import modal
    initFileDropZone();

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
// EXPOSE TO WINDOW
// ============================================================================

// Note: window.* exports are kept for HTML onclick handlers and legacy compatibility
// New code should import directly from modules instead of using window globals
Object.assign(window, {
    // Templates - needed for presentation.js which uses window.renderTemplate and window.getPreviewStyles
    renderTemplate, getPreviewStyles,

    // UI functions - needed for HTML onclick handlers
    renderSlideList, selectSlide, renderEditor, updatePreview, scalePreviewSlide,
    updateHeaderTitle, editProjectTitle, finishEditProjectTitle, handleTitleKeydown,
    switchSidebarTab, toggleSidebar, toggleEditorPanel, switchEditorTab,
    renderSettingsPanel, initTemplateGrid, updateAppThemeColors, renderThemeSelector, selectTheme,
    updateSidebarTabUnderline, updateEditorTabUnderline,

    // Slide management - needed for HTML onclick handlers
    addSlide, selectTemplate, deleteSlide, duplicateSlide, moveSlide, duplicateSlideAt, deleteSlideAt,

    // Drag and drop - handlers are set on window directly in list.js

    // Presentation - needed for HTML onclick handlers
    startPresentation, exitPresentation, prevSlidePlayer, nextSlidePlayer, scalePlayerSlide,

    // Field updates - needed for HTML onchange/onclick handlers in editor
    updateField, changeTemplate,
    updateArrayItem, removeArrayItem, addArrayItem,
    updateColumnField, updateColumnItem, removeColumnItem, addColumnItem,
    updateStatItem, removeStatItem, addStatItem,
    updateStepItem, removeStepItem, addStepItem,
    updateAgendaItem, removeAgendaItem, addAgendaItem,
    updateRowCell, removeRowItem, addRowItem,
    updateTableCell, removeTableRow, addTableRow,
    updateAnnotationItem, removeAnnotationItem, addAnnotationItem,

    // Projects - needed for HTML onclick handlers
    showConfirm, hideConfirm, handleConfirmResponse,
    openProjectModal, closeProjectModal, saveCurrentProject, loadProject, deleteProject, createNewProject, renameProject,
    openSaveProjectModal, closeSaveProjectModal, saveProjectWithName, validateSaveProjectName,
    exportToJSON, importFromJSON, triggerFileInput,

    // Modal & UI functions - needed for HTML onclick handlers
    closeModal, openProjectsModal, newProject, createEmptyProject, createDemoProject,
    saveProject, exportProject, importProject,
    exportToHtml, confirmImport, confirmSaveProject, onSaveStatusClick,
    clearSelectedFile, switchImportTab, formatJsonInput,
    openPromptModal, cancelPromptModal, confirmPromptModal,
    setConflictResolver, resolveConflict, handleFileSelect, handleImport,

    // Theme color picker functions - needed for HTML onclick handlers
    toggleThemeColorPicker, closeAllThemeColorPickers,
    resetColorOverride, resetAllColorOverrides,

    // Editor color selector functions - needed for HTML onclick handlers
    toggleColorPicker, selectSlideColor, updateSlideColor, resetSlideColor,
    showColorName, hideColorName,

    // State functions - needed for sidebar.js window.renderSettingsPanel check
    dismissUnsavedAlert,

    // Drive - needed for external access
    driveAuth, driveAPI, driveSync,

    // Mermaid initialization - kept for window.initMermaid call in theme.js
    initMermaid: () => {
        if (window.mermaid) {
            window.mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
        }
    },

    // Initialize
    initializeApp, loadInitialProject
});

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
