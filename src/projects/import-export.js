// src/projects/import-export.js
// Import/Export functionality for projects

import { getProject, setProject, setSelectedSlideIndex, setHasUnsavedChanges } from '../core/state.js';
import { refreshSlideList, refreshEditor, refreshPreview } from '../presentation/app/ui-refresh.js';
import { TEMPLATES } from '../config/index.js';

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
 * @returns {Object} { errors: string[], warnings: string[] }
 */
function validateSlideFields(slide, slideIndex) {
    const errors = [];
    const warnings = [];
    const slideNum = slideIndex + 1;

    // Check if slide has required structure
    if (!slide || typeof slide !== 'object') {
        errors.push(`Slide ${slideNum}: Structure invalide`);
        return { errors, warnings };
    }

    // Check if template is specified
    if (!slide.template) {
        errors.push(`Slide ${slideNum}: Template non spécifié`);
        return { errors, warnings };
    }

    // Check if template exists
    const template = TEMPLATES[slide.template];
    if (!template) {
        warnings.push(`Slide ${slideNum}: Template inconnu "${slide.template}"`);
        return { errors, warnings };
    }

    // Check if data exists
    if (!slide.data || typeof slide.data !== 'object') {
        errors.push(`Slide ${slideNum}: Données manquantes`);
        return { errors, warnings };
    }

    // Validate each field in the schema
    const fields = template.fields || [];
    for (const field of fields) {
        const value = slide.data[field.key];
        const hasValue = value !== undefined && value !== null && value !== '';

        // Check required fields
        if (field.required && !hasValue) {
            errors.push(`Slide ${slideNum} (${template.name}): Champ requis "${field.label}" manquant`);
            continue;
        }

        // Skip type validation if no value
        if (!hasValue) continue;

        // Validate field type
        const validator = FIELD_TYPE_VALIDATORS[field.type];
        if (validator && !validator(value)) {
            warnings.push(`Slide ${slideNum} (${template.name}): Type invalide pour "${field.label}" (attendu: ${field.type})`);
        }
    }

    return { errors, warnings };
}

/**
 * Validate all slides in a project
 * @param {Array} slides - Array of slide objects
 * @returns {Object} { errors: string[], warnings: string[] }
 */
function validateAllSlides(slides) {
    const allErrors = [];
    const allWarnings = [];

    slides.forEach((slide, index) => {
        const { errors, warnings } = validateSlideFields(slide, index);
        allErrors.push(...errors);
        allWarnings.push(...warnings);
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
