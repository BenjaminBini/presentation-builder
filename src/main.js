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
import { escapeHtml } from './utils/html.js';
import { getGitLabLogoSvg, getGitLabLogo } from './utils/svg.js';

// Core state (re-exports from state/ subdirectory + DOM helpers)
import {
    store, getState, setState, get, set, subscribe, batch, reset,
    getProject, setProject,
    getSelectedSlideIndex, setSelectedSlideIndex,
    hasUnsavedChanges as getHasUnsavedChanges, setHasUnsavedChanges,
    markAsChanged, clearUnsavedChanges, isProjectSaved,
    updateSaveButtonState, showUnsavedAlert, hideUnsavedAlert, dismissUnsavedAlert
} from './core/state.js';

// Events (re-exports from events/ subdirectory)
import { emit, on, off, once, EventTypes } from './core/events.js';

// Error handler
import { initErrorHandler } from './core/error-handler.js';

// Templates
import { renderTemplate } from './templates/renderer.js';
import { getPreviewStyles } from './templates/preview-styles.js';
import { getThemeColor, getThemeColors, resolveThemeColor } from './templates/theme.js';
import { renderCodeLines } from './templates/utilities.js';

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
} from './app/project.js';

// Drive
import { driveAuth, driveAPI, driveSync } from './drive/index.js';

// Theme (color customization)
import {
    renderThemeSelector,
    updateAppThemeColors,
    selectTheme,
    toggleThemeColorPicker, closeAllThemeColorPickers,
    resetColorOverride, resetAllColorOverrides
} from './app/theme.js';

// Editor - use existing modules
import {
    updateEditorTabUnderline,
    switchEditorTab as switchEditorTabAnimated,
    renderEditor
} from './editor/panel.js';

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
} from './editor/handlers.js';

// Editor color selector
import {
    toggleColorPicker, selectSlideColor, updateSlideColor, resetSlideColor,
    showColorName, hideColorName
} from './editor/color-selector.js';

// Sidebar
import {
    updateSidebarTabUnderline,
    switchSidebarTab as switchSidebarTabAnimated,
    initTemplateGrid,
    renderSettingsPanel
} from './app/sidebar.js';

// Panels
import {
    initPanelStates,
    toggleSidebar as toggleSidebarFromPanels,
    toggleEditorPanel as toggleEditorPanelFromPanels
} from './app/panels.js';

// Slides - use existing modules
import { renderSlideList, selectSlide, initSlideListSubscriptions } from './app/slides/list.js';
import {
    addSlide, selectTemplate,
    deleteSlide, duplicateSlide,
    handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd
} from './app/slides/management.js';
import { updatePreview, scalePreviewSlide, initPreviewSubscriptions } from './app/slides/preview.js';

// Presentation mode - use existing module
import {
    startPresentation, exitPresentation,
    prevSlidePlayer, nextSlidePlayer, scalePlayerSlide
} from './app/presentation.js';

// Modals
import {
    closeModal, initModalBehaviors, openProjectsModal,
    cancelPromptModal, confirmPromptModal, resolveConflict
} from './app/modals.js';

// Import modal
import {
    openImportModal, switchImportTab, handleFileSelect, handleImport,
    clearSelectedFile, confirmImport, formatJsonInput, initFileDropZone
} from './app/import-modal.js';

// Inline editing (auto-initializes on DOM ready)
import './inline-editing/index.js';

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
    const project = {
        name: null,
        metadata: {
            title: 'Sans titre',
            author: '',
            date: new Date().toLocaleDateString('fr-FR'),
            version: '1.0'
        },
        theme: {
            base: 'gitlab',
            overrides: {}
        },
        slides: [
            {
                template: 'title',
                data: {
                    title: 'Nouvelle présentation',
                    subtitle: '',
                    author: '',
                    date: new Date().toLocaleDateString('fr-FR')
                }
            }
        ]
    };
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

    // Initialize event subscriptions for event-driven UI
    initPreviewSubscriptions();
    initSlideListSubscriptions();

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

Object.assign(window, {
    // Config
    THEMES, TEMPLATES, ICONS, GRAY_PALETTE, COLOR_LABELS, GRAY_LABELS,
    TEMPLATE_COLOR_SETTINGS, SAMPLE_PROJECT, getDefaultData,

    // Utils
    escapeHtml, getGitLabLogoSvg, getGitLabLogo,

    // Templates
    renderTemplate, getPreviewStyles, getThemeColor, getThemeColors, resolveThemeColor, renderCodeLines,

    // State (window.* access via getters/setters)
    get currentProject() { return getProject(); },
    set currentProject(v) { setProject(v); },
    get selectedSlideIndex() { return getSelectedSlideIndex(); },
    set selectedSlideIndex(v) { setSelectedSlideIndex(v); },
    get hasUnsavedChanges() { return getHasUnsavedChanges(); },
    set hasUnsavedChanges(v) { setHasUnsavedChanges(v); },

    // State functions
    markAsChanged, clearUnsavedChanges, updateSaveButtonState, isProjectSaved,
    dismissUnsavedAlert, showUnsavedAlert, hideUnsavedAlert,

    // UI functions
    renderSlideList, selectSlide, renderEditor, updatePreview, scalePreviewSlide,
    updateHeaderTitle, editProjectTitle, finishEditProjectTitle, handleTitleKeydown,
    switchSidebarTab, toggleSidebar, toggleEditorPanel, switchEditorTab,
    renderSettingsPanel, initTemplateGrid, updateAppThemeColors, renderThemeSelector, selectTheme,
    updateSidebarTabUnderline, updateEditorTabUnderline,

    // Slide management
    addSlide, selectTemplate, deleteSlide, duplicateSlide, duplicateSlideAt, deleteSlideAt,

    // Drag and drop
    handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd,

    // Presentation
    startPresentation, exitPresentation, prevSlidePlayer, nextSlidePlayer, scalePlayerSlide,

    // Field updates
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
    openProjectModal, closeProjectModal, saveCurrentProject, loadProject, deleteProject, createNewProject, renameProject,
    openSaveProjectModal, closeSaveProjectModal, saveProjectWithName, validateSaveProjectName,
    exportToJSON, importFromJSON, triggerFileInput,

    // Modal & UI functions
    closeModal, openProjectsModal, newProject, createEmptyProject, createDemoProject,
    saveProject, exportProject, importProject,
    exportToHtml, confirmImport, confirmSaveProject, onSaveStatusClick,
    clearSelectedFile, switchImportTab, formatJsonInput, cancelPromptModal, confirmPromptModal,
    resolveConflict, handleFileSelect, handleImport,

    // Theme color picker functions
    toggleThemeColorPicker, closeAllThemeColorPickers,
    resetColorOverride, resetAllColorOverrides,

    // Editor color selector functions
    toggleColorPicker, selectSlideColor, updateSlideColor, resetSlideColor,
    showColorName, hideColorName,

    // Core state exports
    store, getState, setState, get, set, subscribe, batch, reset,
    emit, on, off, once, EventTypes,

    // Drive
    driveAuth, driveAPI, driveSync,

    // Initialize
    initializeApp, loadInitialProject
});

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('Presentation Builder loaded (ES6 modules)');
