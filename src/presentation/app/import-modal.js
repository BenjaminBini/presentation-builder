// src/app/import-modal.js
// Import modal functionality - uses event-driven architecture

import { setProject, setSelectedSlideIndex, setHasUnsavedChanges } from '../../core/state.js';
import { emit, EventTypes } from '../../core/events.js';
import { importFromJSON, validateAllSlides } from '../../projects/import-export.js';
import { closeModal } from './modals.js';
import { refreshEditor } from './ui-refresh.js';

// Store the selected file for import
let _selectedImportFile = null;

// Store error line numbers for highlighting
let _errorLineNumbers = new Set();

/**
 * Scroll textarea to a specific line
 * @param {number} lineNumber - 1-indexed line number
 */
function goToLine(lineNumber) {
    const textarea = document.getElementById('jsonCodeInput');
    if (!textarea) return;

    const lines = textarea.value.split('\n');
    let charIndex = 0;

    // Calculate character position of the target line
    for (let i = 0; i < lineNumber - 1 && i < lines.length; i++) {
        charIndex += lines[i].length + 1; // +1 for newline
    }

    // Focus and set cursor position
    textarea.focus();
    textarea.setSelectionRange(charIndex, charIndex + (lines[lineNumber - 1]?.length || 0));

    // Scroll to make the line visible
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
    const targetScroll = (lineNumber - 3) * lineHeight; // Show a few lines before
    textarea.scrollTop = Math.max(0, targetScroll);

    // Sync line numbers scroll
    const lineNumbers = document.getElementById('jsonLineNumbers');
    if (lineNumbers) lineNumbers.scrollTop = textarea.scrollTop;
}

/**
 * Parse error message into components
 * Format: "Ligne X - Slide Y (Template) - Message"
 * @param {string} error - Error message
 * @returns {Object} { lineNum, slideNum, template, message }
 */
function parseErrorMessage(error) {
    const match = error.match(/^Ligne (\d+) - Slide (\d+)(?: \(([^)]+)\))? - (.+)$/);
    if (match) {
        return {
            lineNum: parseInt(match[1], 10),
            slideNum: parseInt(match[2], 10),
            template: match[3] || null,
            message: match[4]
        };
    }
    // Fallback for errors without line numbers
    const slideMatch = error.match(/^Slide (\d+)(?: \(([^)]+)\))? - (.+)$/);
    if (slideMatch) {
        return {
            lineNum: null,
            slideNum: parseInt(slideMatch[1], 10),
            template: slideMatch[2] || null,
            message: slideMatch[3]
        };
    }
    return { lineNum: null, slideNum: null, template: null, message: error };
}

/**
 * Extract line number from error message (for backwards compat)
 * @param {string} error - Error message
 * @returns {number|null} Line number or null
 */
function extractLineNumber(error) {
    const parsed = parseErrorMessage(error);
    return parsed.lineNum;
}

/**
 * Display error in error panel with header and count
 * @param {HTMLElement} errorEl - The error container element
 * @param {string} title - Error title (e.g., "JSON invalide")
 * @param {string[]} errors - Array of error messages
 */
function showErrorPanel(errorEl, title, errors) {
    if (!errorEl) return;

    // Collect error line numbers for highlighting
    _errorLineNumbers.clear();
    errors.forEach(err => {
        const lineNum = extractLineNumber(err);
        if (lineNum) _errorLineNumbers.add(lineNum);
    });

    // Update line numbers display with error markers
    updateLineNumbers();

    const errorCount = errors.length;
    const countText = errorCount === 1 ? '1 erreur' : `${errorCount} erreurs`;

    // Build clickable error items with structured display
    const errorItems = errors.map(err => {
        const { lineNum, slideNum, template, message } = parseErrorMessage(err);

        const lineAttr = lineNum ? ` data-line="${lineNum}"` : '';
        const lineHtml = lineNum ? `<span class="error-line-number">L.${lineNum}</span>` : '';
        const tagHtml = template
            ? `<span class="error-slide-tag">Slide ${slideNum} · ${template}</span>`
            : slideNum
                ? `<span class="error-slide-tag">Slide ${slideNum}</span>`
                : '';
        const messageHtml = `<span class="error-message">${message}</span>`;

        return `<div class="code-input-error-item"${lineAttr}>${lineHtml}${tagHtml}${messageHtml}</div>`;
    }).join('');

    errorEl.innerHTML = `
        <div class="code-input-error-header">
            <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>${title}</span>
            <span class="error-count">${countText}</span>
        </div>
        <div class="code-input-error-body">${errorItems}</div>
    `;
    errorEl.classList.add('show');

    // Add scroll indicator class if content overflows (more than 3 errors)
    if (errors.length > 3) {
        errorEl.classList.add('has-scroll');
    } else {
        errorEl.classList.remove('has-scroll');
    }

    // Add click handlers for error items
    errorEl.querySelectorAll('.code-input-error-item[data-line]').forEach(item => {
        item.addEventListener('click', () => {
            const line = parseInt(item.dataset.line, 10);
            if (line) goToLine(line);
        });
    });
}

/**
 * Clear error panel
 * @param {HTMLElement} errorEl - The error container element
 */
function clearErrorPanel(errorEl) {
    if (!errorEl) return;
    errorEl.innerHTML = '';
    errorEl.classList.remove('show', 'has-scroll');
    _errorLineNumbers.clear();
    updateLineNumbers();
}

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
        clearErrorPanel(document.getElementById('jsonError'));
        clearErrorPanel(document.getElementById('fileError'));
        // Reset line numbers
        const lineNumbers = document.getElementById('jsonLineNumbers');
        if (lineNumbers) lineNumbers.textContent = '1';
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
            const fileError = document.getElementById('fileError');
            clearErrorPanel(fileError);

            importFromJSON(_selectedImportFile).then(() => {
                closeModal('importModal');
                _selectedImportFile = null;
            }).catch(err => {
                console.error('Import error:', err);
                const errors = err.message.split('\n').filter(e => e.trim());
                showErrorPanel(fileError, 'Import invalide', errors);
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
                    throw { validationErrors: ['Format de projet invalide: champs "name" et "slides" requis'] };
                }

                // Validate slides array
                if (!Array.isArray(project.slides)) {
                    throw { validationErrors: ['Le champ "slides" doit être un tableau'] };
                }

                // Validate template-specific fields
                const { errors, warnings } = validateAllSlides(project.slides);

                // Log warnings but don't block import
                if (warnings.length > 0) {
                    console.warn('Import warnings:', warnings);
                }

                // Block import if there are errors
                if (errors.length > 0) {
                    throw { validationErrors: errors };
                }

                // Set as current project using centralized state
                setProject(project);
                setSelectedSlideIndex(project.slides.length > 0 ? 0 : -1);
                setHasUnsavedChanges(true);

                // Emit PROJECT_LOADED - list.js and preview.js subscribe to this event
                emit(EventTypes.PROJECT_LOADED, { project });

                // Update editor, header, and theme (refresh required for immediate UI update)
                refreshEditor();
                if (window.updateHeaderTitle) window.updateHeaderTitle();
                if (window.updateAppThemeColors) window.updateAppThemeColors();

                closeModal('importModal');
            } catch (err) {
                if (err.validationErrors) {
                    showErrorPanel(jsonError, 'Validation échouée', err.validationErrors);
                } else {
                    // JSON parse error
                    showErrorPanel(jsonError, 'JSON invalide', [err.message]);
                }
            }
        }
    }
}

/**
 * Find line numbers where each slide starts in formatted JSON
 * @param {string} jsonText - The formatted JSON text
 * @returns {number[]} Array of line numbers (1-indexed) for each slide
 */
function findSlideLineNumbers(jsonText) {
    const lines = jsonText.split('\n');
    const slideLines = [];
    let inSlidesArray = false;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect start of slides array
        if (line.includes('"slides"') && line.includes('[')) {
            inSlidesArray = true;
            braceDepth = 0;
            continue;
        }

        if (inSlidesArray) {
            // Count braces to track nesting
            for (const char of line) {
                if (char === '{') {
                    if (braceDepth === 0) {
                        // This is the start of a slide object
                        slideLines.push(i + 1); // 1-indexed
                    }
                    braceDepth++;
                } else if (char === '}') {
                    braceDepth--;
                } else if (char === ']' && braceDepth === 0) {
                    // End of slides array
                    inSlidesArray = false;
                    break;
                }
            }
        }
    }

    return slideLines;
}

/**
 * Format and validate the JSON in the input textarea
 */
export function formatJsonInput() {
    const textarea = document.getElementById('jsonCodeInput');
    const jsonError = document.getElementById('jsonError');
    if (!textarea || !textarea.value.trim()) {
        clearErrorPanel(jsonError);
        updateLineNumbers();
        return;
    }

    try {
        const parsed = JSON.parse(textarea.value);
        const formatted = JSON.stringify(parsed, null, 2);
        textarea.value = formatted;
        updateLineNumbers();

        // Also validate structure
        const allErrors = [];

        if (!parsed.name || !parsed.slides) {
            allErrors.push('Format de projet invalide: champs "name" et "slides" requis');
        } else if (!Array.isArray(parsed.slides)) {
            allErrors.push('Le champ "slides" doit être un tableau');
        } else {
            // Find line numbers for each slide
            const slideLineNumbers = findSlideLineNumbers(formatted);

            // Validate template-specific fields with line numbers
            const { errors } = validateAllSlides(parsed.slides, slideLineNumbers);
            allErrors.push(...errors);
        }

        if (allErrors.length > 0) {
            showErrorPanel(jsonError, 'Validation échouée', allErrors);
        } else {
            clearErrorPanel(jsonError);
        }
    } catch (e) {
        showErrorPanel(jsonError, 'JSON invalide', [e.message]);
        updateLineNumbers();
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
 * Update line numbers display with error indicators
 */
function updateLineNumbers() {
    const jsonInput = document.getElementById('jsonCodeInput');
    const lineNumbers = document.getElementById('jsonLineNumbers');
    if (!jsonInput || !lineNumbers) return;

    const lines = jsonInput.value.split('\n').length;
    const lineElements = [];

    for (let i = 1; i <= Math.max(lines, 1); i++) {
        const hasError = _errorLineNumbers.has(i);
        if (hasError) {
            lineElements.push(`<span class="line-number-error">${i}</span>`);
        } else {
            lineElements.push(`<span>${i}</span>`);
        }
    }

    lineNumbers.innerHTML = lineElements.join('');

    // Update code highlights
    updateCodeHighlights();
}

/**
 * Update code highlights to show error lines in red
 */
function updateCodeHighlights() {
    const jsonInput = document.getElementById('jsonCodeInput');
    const highlights = document.getElementById('jsonHighlights');
    if (!jsonInput || !highlights) return;

    const lines = jsonInput.value.split('\n');
    const highlightLines = lines.map((line, index) => {
        const lineNum = index + 1;
        const hasError = _errorLineNumbers.has(lineNum);
        // Use non-breaking space for empty lines to maintain height
        const content = escapeHighlightHtml(line) || '\u00A0';
        if (hasError) {
            return `<div class="error-line">${content}</div>`;
        }
        return `<div class="normal-line">${content}</div>`;
    });

    highlights.innerHTML = highlightLines.join('');
    highlights.scrollTop = jsonInput.scrollTop;
}

/**
 * Escape HTML for highlight display
 */
function escapeHighlightHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Sync scroll between textarea, line numbers, and highlights
 */
function syncLineNumbersScroll() {
    const jsonInput = document.getElementById('jsonCodeInput');
    const lineNumbers = document.getElementById('jsonLineNumbers');
    const highlights = document.getElementById('jsonHighlights');
    if (!jsonInput) return;

    if (lineNumbers) lineNumbers.scrollTop = jsonInput.scrollTop;
    if (highlights) highlights.scrollTop = jsonInput.scrollTop;
}

// Debounce timer for validation
let _validationTimer = null;

/**
 * Initialize the JSON code input with debounced validation and line numbers
 */
export function initJsonCodeInput() {
    const jsonInput = document.getElementById('jsonCodeInput');
    if (!jsonInput) return;

    // Debounced auto-format and validate on input
    jsonInput.addEventListener('input', () => {
        updateLineNumbers();

        // Clear previous timer
        if (_validationTimer) {
            clearTimeout(_validationTimer);
        }

        // Validate after 500ms of inactivity
        _validationTimer = setTimeout(() => {
            if (jsonInput.value.trim()) {
                formatJsonInput();
            }
        }, 500);
    });

    // Sync scroll
    jsonInput.addEventListener('scroll', syncLineNumbersScroll);

    // Initial line numbers
    updateLineNumbers();
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
