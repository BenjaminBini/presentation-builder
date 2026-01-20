// src/projects/import-export.js
// Import/Export functionality for projects

import { getProject, setProject, setSelectedSlideIndex, setHasUnsavedChanges } from '../core/state.js';
import { refreshSlideList, refreshEditor, refreshPreview } from '../presentation/app/ui-refresh.js';

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
