// src/projects/import-export.js
// Import/Export functionality for projects

import { getProject, setProject, setSelectedSlideIndex, markAsChanged } from '../core/state.js';

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

/**
 * Import project from JSON file
 */
export function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const project = JSON.parse(e.target.result);

                // Validate project structure
                if (!project.name || !project.slides) {
                    throw new Error('Format de projet invalide');
                }

                // Set as current project using centralized state
                setProject(project);
                setSelectedSlideIndex(project.slides.length > 0 ? 0 : -1);
                markAsChanged();

                // Update UI
                if (window.renderSlideList) window.renderSlideList();
                if (window.renderEditor) window.renderEditor();
                if (window.updatePreview) window.updatePreview();
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
