// src/projects/import-export.js
// Import/Export functionality for projects

import { getProject, setProject, setSelectedSlideIndex, setHasUnsavedChanges } from '../core/state.js';
import { refreshSlideList, refreshEditor, refreshPreview } from '../presentation/app/ui-refresh.js';
import { TEMPLATES } from '../config/index.js';
import { convertPresentation } from '../infrastructure/slides/index.js';
import { driveAuth } from '../infrastructure/drive/auth.js';
import { driveAPI } from '../infrastructure/drive/api.js';

/**
 * Export current project to JSON file
 */
export function exportToJSON() {
    const project = getProject();
    if (!project) {
        return;
    }

    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name || 'presentation'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Validation limits to prevent DoS attacks
const IMPORT_LIMITS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
    MAX_SLIDES: 500,
    MAX_STRING_LENGTH: 100000, // 100KB per string field
    MAX_ARRAY_ITEMS: 100, // Max items in nested arrays (e.g., list items)
    MAX_NESTING_DEPTH: 10
};

/**
 * Recursively validate object structure for DoS prevention
 * @param {any} obj - Object to validate
 * @param {number} depth - Current nesting depth
 * @throws {Error} If validation fails
 */
function validateObjectStructure(obj, depth = 0) {
    if (depth > IMPORT_LIMITS.MAX_NESTING_DEPTH) {
        throw new Error('Structure trop profonde (max: ' + IMPORT_LIMITS.MAX_NESTING_DEPTH + ' niveaux)');
    }

    if (obj === null || typeof obj !== 'object') {
        if (typeof obj === 'string' && obj.length > IMPORT_LIMITS.MAX_STRING_LENGTH) {
            throw new Error('Champ texte trop long (max: ' + IMPORT_LIMITS.MAX_STRING_LENGTH + ' caractères)');
        }
        return;
    }

    if (Array.isArray(obj)) {
        if (obj.length > IMPORT_LIMITS.MAX_ARRAY_ITEMS) {
            throw new Error('Tableau trop grand (max: ' + IMPORT_LIMITS.MAX_ARRAY_ITEMS + ' éléments)');
        }
        for (const item of obj) {
            validateObjectStructure(item, depth + 1);
        }
    } else {
        for (const key of Object.keys(obj)) {
            validateObjectStructure(obj[key], depth + 1);
        }
    }
}

/**
 * Field type validators
 * Maps field types to validation functions
 */
const FIELD_TYPE_VALIDATORS = {
    text: (value) => typeof value === 'string',
    textarea: (value) => typeof value === 'string',
    wysiwyg: (value) => typeof value === 'string',
    number: (value) => typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value))),
    checkbox: (value) => typeof value === 'boolean',
    array: (value) => Array.isArray(value),
    column: (value) => typeof value === 'object' && value !== null,
    stats: (value) => Array.isArray(value),
    steps: (value) => Array.isArray(value),
    annotations: (value) => Array.isArray(value),
    'table-rows': (value) => Array.isArray(value),
    'agenda-items': (value) => Array.isArray(value),
    drawio: (value) => typeof value === 'string',
};

/**
 * Validate slide fields against template schema
 * @param {Object} slide - Slide object with template and data
 * @param {number} slideIndex - Slide index for error messages
 * @returns {Object} { slideNum, templateName, errors: string[], warnings: string[] }
 */
function validateSlideFields(slide, slideIndex) {
    const errors = [];
    const warnings = [];
    const slideNum = slideIndex + 1;
    let templateName = '';

    // Check if slide has required structure
    if (!slide || typeof slide !== 'object') {
        errors.push('Structure invalide');
        return { slideNum, templateName, errors, warnings };
    }

    // Check if template is specified
    if (!slide.template) {
        errors.push('Template non spécifié');
        return { slideNum, templateName, errors, warnings };
    }

    // Check if template exists
    const template = TEMPLATES[slide.template];
    if (!template) {
        warnings.push(`Template inconnu "${slide.template}"`);
        return { slideNum, templateName: slide.template, errors, warnings };
    }

    templateName = template.name;

    // Check if data exists
    if (!slide.data || typeof slide.data !== 'object') {
        errors.push('Données manquantes');
        return { slideNum, templateName, errors, warnings };
    }

    // Validate each field in the schema
    const fields = template.fields || [];
    for (const field of fields) {
        const value = slide.data[field.key];
        const hasValue = value !== undefined && value !== null && value !== '';

        // Check required fields
        if (field.required && !hasValue) {
            errors.push(`Champ "${field.label}" manquant`);
            continue;
        }

        // Skip type validation if no value
        if (!hasValue) continue;

        // Validate field type
        const validator = FIELD_TYPE_VALIDATORS[field.type];
        if (validator && !validator(value)) {
            errors.push(`Champ "${field.label}" - type invalide (attendu: ${field.type})`);
        }
    }

    return { slideNum, templateName, errors, warnings };
}

/**
 * Validate all slides in a project
 * @param {Array} slides - Array of slide objects
 * @param {number[]} [lineNumbers] - Optional array of line numbers for each slide
 * @returns {Object} { errors: string[], warnings: string[] }
 */
export function validateAllSlides(slides, lineNumbers = []) {
    const allErrors = [];
    const allWarnings = [];

    slides.forEach((slide, index) => {
        const { slideNum, templateName, errors, warnings } = validateSlideFields(slide, index);
        const lineNum = lineNumbers[index];

        // Build prefix: "Ligne X - Slide Y (Template)" or "Slide Y" if no line
        const buildPrefix = () => {
            const slidePart = templateName
                ? `Slide ${slideNum} (${templateName})`
                : `Slide ${slideNum}`;
            return lineNum ? `Ligne ${lineNum} - ${slidePart}` : slidePart;
        };

        // Add each error as separate line
        errors.forEach(err => {
            allErrors.push(`${buildPrefix()} - ${err}`);
        });

        // Add each warning as separate line
        warnings.forEach(warn => {
            allWarnings.push(`${buildPrefix()} - ${warn}`);
        });
    });

    return { errors: allErrors, warnings: allWarnings };
}

/**
 * Import project from JSON file
 */
export function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        // Validate file size before reading
        if (file.size > IMPORT_LIMITS.MAX_FILE_SIZE) {
            reject(new Error('Fichier trop volumineux (max: ' + (IMPORT_LIMITS.MAX_FILE_SIZE / 1024 / 1024) + ' MB)'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const project = JSON.parse(e.target.result);

                // Validate project structure
                if (!project.name || !project.slides) {
                    throw new Error('Format de projet invalide');
                }

                // Validate slides array
                if (!Array.isArray(project.slides)) {
                    throw new Error('Le champ slides doit être un tableau');
                }

                if (project.slides.length > IMPORT_LIMITS.MAX_SLIDES) {
                    throw new Error('Trop de slides (max: ' + IMPORT_LIMITS.MAX_SLIDES + ')');
                }

                // Validate string lengths and nested structures
                if (typeof project.name !== 'string' || project.name.length > 1000) {
                    throw new Error('Nom de projet invalide');
                }

                // Deep validation of all slide data
                for (const slide of project.slides) {
                    validateObjectStructure(slide);
                }

                // Validate template-specific fields
                const { errors, warnings } = validateAllSlides(project.slides);

                // Log warnings but don't block import
                if (warnings.length > 0) {
                    console.warn('Import warnings:', warnings);
                }

                // Block import if there are errors
                if (errors.length > 0) {
                    throw new Error(errors.join('\n'));
                }

                // Set as current project using centralized state
                setProject(project);
                setSelectedSlideIndex(project.slides.length > 0 ? 0 : -1);
                setHasUnsavedChanges(true);

                // Update UI
                refreshSlideList();
                refreshEditor();
                refreshPreview();
                if (window.updateHeaderTitle) window.updateHeaderTitle();
                if (window.updateAppThemeColors) window.updateAppThemeColors();

                resolve(project);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = () => {
            reject(new Error('File read error'));
        };

        reader.readAsText(file);
    });
}

/**
 * Trigger file input for import
 */
export function triggerFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            importFromJSON(file);
        }
    };

    input.click();
}

/**
 * Export state for Google Slides export button
 */
let googleSlidesExportState = {
    isExporting: false,
    button: null
};

/**
 * Update the Google Slides export button UI
 * @param {'idle' | 'exporting' | 'success' | 'error'} state
 */
function updateGoogleSlidesButton(state) {
    const button = document.getElementById('exportGoogleSlidesBtn');
    if (!button) return;

    const label = button.querySelector('.btn-label');
    const spinner = button.querySelector('.export-spinner');
    const icon = button.querySelector('.icon-slides');

    switch (state) {
        case 'exporting':
            button.disabled = true;
            button.classList.add('exporting');
            if (label) label.textContent = 'Exportation...';
            if (spinner) spinner.style.display = 'inline-block';
            if (icon) icon.style.display = 'none';
            break;
        case 'success':
            button.disabled = false;
            button.classList.remove('exporting');
            if (label) label.textContent = 'Google Slides';
            if (spinner) spinner.style.display = 'none';
            if (icon) icon.style.display = '';
            break;
        case 'error':
            button.disabled = false;
            button.classList.remove('exporting');
            if (label) label.textContent = 'Google Slides';
            if (spinner) spinner.style.display = 'none';
            if (icon) icon.style.display = '';
            break;
        default:
            button.disabled = false;
            button.classList.remove('exporting');
            if (label) label.textContent = 'Google Slides';
            if (spinner) spinner.style.display = 'none';
            if (icon) icon.style.display = '';
    }
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success' | 'error' | 'info'} type
 * @param {number} duration
 */
function showToast(message, type = 'info', duration = 5000) {
    // Remove existing toast
    const existing = document.querySelector('.export-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `export-toast export-toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    return toast;
}

/**
 * Export current project to Google Slides
 * @returns {Promise<Object>} Result with URL or error
 */
export async function exportToGoogleSlides() {
    const project = getProject();
    if (!project) {
        showToast('Aucun projet à exporter', 'error');
        return { success: false, error: 'No project' };
    }

    if (!project.slides || project.slides.length === 0) {
        showToast('Le projet ne contient aucune slide', 'error');
        return { success: false, error: 'No slides' };
    }

    // Check if already exporting
    if (googleSlidesExportState.isExporting) {
        return { success: false, error: 'Export in progress' };
    }

    googleSlidesExportState.isExporting = true;
    updateGoogleSlidesButton('exporting');

    try {
        // Ensure Google authentication with presentations scope
        const isSignedIn = driveAuth.isSignedIn();
        if (!isSignedIn) {
            // Need to sign in first - signIn() triggers OAuth popup
            showToast('Connexion à Google requise - authentifiez-vous dans la fenêtre popup', 'info', 5000);
            driveAuth.signIn();

            // Wait for sign-in to complete via callback
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    driveAuth.off('onSignIn', onSignIn);
                    driveAuth.off('onError', onError);
                    reject(new Error('Authentication timeout'));
                }, 120000); // 2 minute timeout for OAuth popup

                const onSignIn = () => {
                    clearTimeout(timeout);
                    driveAuth.off('onSignIn', onSignIn);
                    driveAuth.off('onError', onError);
                    resolve();
                };

                const onError = (error) => {
                    clearTimeout(timeout);
                    driveAuth.off('onSignIn', onSignIn);
                    driveAuth.off('onError', onError);
                    reject(error);
                };

                driveAuth.on('onSignIn', onSignIn);
                driveAuth.on('onError', onError);
            });
        }

        // Ensure valid token
        await driveAuth.ensureValidToken();

        // Convert and create presentation
        const result = await convertPresentation(project);

        // Move to Drive folder if configured
        const folderId = driveAPI.getSelectedFolderId();
        if (folderId && result.presentationId) {
            try {
                // Move to the selected folder using server API
                const moveResponse = await fetch(`/api/drive/files/${result.presentationId}/move`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ folderId })
                });
                if (!moveResponse.ok) {
                    const error = await moveResponse.json();
                    throw new Error(error.error || 'Failed to move presentation');
                }
            } catch (e) {
                console.warn('Could not move presentation to folder:', e);
            }
        }

        googleSlidesExportState.isExporting = false;
        updateGoogleSlidesButton('success');

        // Show success with link
        showToast(`
            <a href="${result.url}" target="_blank" rel="noopener noreferrer">
                Présentation créée - Cliquez pour ouvrir
            </a>
        `, 'success', 10000);

        // Also open in new tab
        window.open(result.url, '_blank');

        return { success: true, url: result.url, presentationId: result.presentationId };

    } catch (error) {
        console.error('Google Slides export error:', error);
        googleSlidesExportState.isExporting = false;
        updateGoogleSlidesButton('error');

        let errorMessage = 'Erreur lors de l\'export';
        if (error.message) {
            if (error.message.includes('popup')) {
                errorMessage = 'Connexion Google annulée';
            } else if (error.message.includes('scope') || error.message.includes('permission')) {
                errorMessage = 'Permissions Google Slides requises. Reconnectez-vous.';
            } else {
                errorMessage = `Erreur: ${error.message}`;
            }
        }

        showToast(errorMessage, 'error');
        return { success: false, error: error.message };
    }
}
