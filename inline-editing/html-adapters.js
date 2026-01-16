// inline-editing/html-adapters.js
// Global wrapper functions for HTML onclick handlers
// These functions provide a global API that HTML elements can call via onclick attributes

// ============================================================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK HANDLERS
// ============================================================================

// Image Picker
function closeImagePicker() {
    InlineEditor.closeImagePicker();
}

function confirmImageSelection() {
    InlineEditor.confirmImageSelection();
}

function clearImage() {
    InlineEditor.clearImage();
}

function switchImagePickerTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.image-picker-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Show/hide content
    document.getElementById('imagePickerUrl').style.display = tab === 'url' ? 'block' : 'none';
    document.getElementById('imagePickerUpload').style.display = tab === 'upload' ? 'block' : 'none';
}

function handleImageUrlInput(url) {
    if (!url) {
        document.getElementById('imagePreviewContainer').style.display = 'none';
        return;
    }

    // Validate and preview URL
    const img = new Image();
    img.onload = function() {
        InlineEditor.selectedImageData = url;
        InlineEditor.showImagePreview(url);
    };
    img.onerror = function() {
        document.getElementById('imagePreviewContainer').style.display = 'none';
    };
    img.src = url;
}

function handleImageFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processImageFile(file);
    }
}

function processImageFile(file) {
    const maxSize = 1024 * 1024; // 1MB
    const reader = new FileReader();

    reader.onload = function(e) {
        InlineEditor.selectedImageData = e.target.result;
        InlineEditor.showImagePreview(e.target.result);

        if (file.size > maxSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const warning = document.getElementById('imageSizeWarning');
            if (warning) {
                warning.textContent = `Taille: ${sizeMB}MB. Considérez utiliser une URL pour de meilleures performances.`;
                warning.style.display = 'block';
            }
        } else {
            const warning = document.getElementById('imageSizeWarning');
            if (warning) {
                warning.style.display = 'none';
            }
        }
    };

    reader.onerror = function() {
        showToast('Erreur lors de la lecture du fichier', 'error');
    };

    reader.readAsDataURL(file);
}

function initImageDropZone() {
    const dropZone = document.getElementById('imageDropZone');
    const fileInput = document.getElementById('imageFileInput');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processImageFile(file);
        }
    });
}

// Code Editor
function closeCodeEditor() {
    InlineEditor.closeCodeEditor();
}

function confirmCodeEdit() {
    InlineEditor.confirmCodeEdit();
}

function updateCodeEditorLineNumbers() {
    const textarea = document.getElementById('codeEditorInput');
    const lineNumbers = document.getElementById('codeEditorLineNumbers');
    const startLineInput = document.getElementById('codeStartLine');
    const showLineNumbersCheckbox = document.getElementById('codeShowLineNumbers');

    if (!textarea || !lineNumbers) return;

    // Check if line numbers should be shown
    const showLineNumbers = showLineNumbersCheckbox ? showLineNumbersCheckbox.checked : false;

    if (!showLineNumbers) {
        lineNumbers.style.display = 'none';
        return;
    }

    lineNumbers.style.display = 'block';

    const lines = textarea.value.split('\n');
    const startLine = startLineInput ? parseInt(startLineInput.value) || 1 : 1;

    let html = '';

    // Add line numbers
    for (let i = 0; i < lines.length; i++) {
        html += `<div>${startLine + i}</div>`;
    }

    // Ensure at least one line number
    if (lines.length === 0) {
        html = `<div>${startLine}</div>`;
    }

    lineNumbers.innerHTML = html;
}

function syncLineNumbersScroll() {
    const textarea = document.getElementById('codeEditorInput');
    const lineNumbers = document.getElementById('codeEditorLineNumbers');

    if (textarea && lineNumbers) {
        lineNumbers.scrollTop = textarea.scrollTop;
    }
}

function updateCodeEditorEllipsis() {
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

    // Update line numbers to include/exclude ellipsis markers
    updateCodeEditorLineNumbers();
}

// Draw.io Editor
function closeDrawioEditor() {
    InlineEditor.closeDrawioEditor();
}
