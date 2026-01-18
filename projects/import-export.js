// projects/import-export.js
// File import/export logic
// Requires: projects/notifications.js (showToast)
// Requires: projects/modal.js (closeModal)

// Store selected file for import
let pendingImportFile = null;

function importProject() {
    // Reset state
    pendingImportFile = null;
    document.getElementById('jsonCodeInput').value = '';
    document.getElementById('jsonError').classList.remove('show');
    document.getElementById('fileSelected').style.display = 'none';
    document.getElementById('importFileInput').value = '';

    // Reset to file tab
    switchImportTab('file');

    // Open modal
    document.getElementById('importModal').classList.add('active');

    // Setup drag and drop
    setupDragAndDrop();
}

function switchImportTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.import-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update tab content
    document.getElementById('importTabFile').classList.toggle('active', tab === 'file');
    document.getElementById('importTabCode').classList.toggle('active', tab === 'code');
}

function setupDragAndDrop() {
    const dropZone = document.getElementById('fileDropZone');

    // Remove old listeners by cloning
    const newDropZone = dropZone.cloneNode(true);
    dropZone.parentNode.replaceChild(newDropZone, dropZone);

    // Re-add click handler
    newDropZone.onclick = () => document.getElementById('importFileInput').click();

    newDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        newDropZone.classList.add('drag-over');
    });

    newDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        newDropZone.classList.remove('drag-over');
    });

    newDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        newDropZone.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.endsWith('.json')) {
                handleDroppedFile(file);
            } else {
                showToast('Veuillez sélectionner un fichier JSON', 'error');
            }
        }
    });
}

function handleDroppedFile(file) {
    pendingImportFile = file;
    document.getElementById('selectedFileName').textContent = file.name;
    document.getElementById('fileSelected').style.display = 'flex';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleDroppedFile(file);
    }
}

function clearSelectedFile(event) {
    event.stopPropagation();
    pendingImportFile = null;
    document.getElementById('fileSelected').style.display = 'none';
    document.getElementById('importFileInput').value = '';
}

function formatJsonInput() {
    const textarea = document.getElementById('jsonCodeInput');
    const errorDiv = document.getElementById('jsonError');

    try {
        const parsed = JSON.parse(textarea.value);
        textarea.value = JSON.stringify(parsed, null, 2);
        errorDiv.classList.remove('show');
    } catch (err) {
        errorDiv.textContent = 'JSON invalide : ' + err.message;
        errorDiv.classList.add('show');
    }
}

function confirmImport() {
    const activeTab = document.querySelector('.import-tab.active').dataset.tab;

    if (activeTab === 'file') {
        if (!pendingImportFile) {
            showToast('Veuillez sélectionner un fichier', 'error');
            return;
        }
        importFromFile(pendingImportFile);
    } else {
        const jsonCode = document.getElementById('jsonCodeInput').value.trim();
        if (!jsonCode) {
            showToast('Veuillez entrer du code JSON', 'error');
            return;
        }
        importFromCode(jsonCode);
    }
}

function importFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            processImportData(data, file.name.replace('.json', ''));
        } catch (err) {
            showToast('Erreur lors de la lecture du fichier', 'error');
        }
    };
    reader.onerror = () => {
        showToast('Erreur de lecture du fichier', 'error');
    };
    reader.readAsText(file);
}

function importFromCode(jsonCode) {
    const errorDiv = document.getElementById('jsonError');

    try {
        const data = JSON.parse(jsonCode);
        errorDiv.classList.remove('show');
        processImportData(data, 'Import JSON');
    } catch (err) {
        errorDiv.textContent = 'JSON invalide : ' + err.message;
        errorDiv.classList.add('show');
    }
}

function processImportData(data, defaultName) {
    if (data.slides) {
        currentProject = {
            name: data.metadata?.title || defaultName,
            metadata: data.metadata || {},
            theme: data.theme || { base: 'gitlab', overrides: {} },
            slides: data.slides
        };
        selectedSlideIndex = currentProject.slides.length > 0 ? 0 : -1;
        updateAppThemeColors(); // Apply imported theme colors
        renderSlideList();
        renderSettingsPanel();
        renderEditor();
        updatePreview();
        updateHeaderTitle();
        initMermaid();
        markAsChanged(); // Imported project has unsaved changes
        closeModal('importModal');
        showToast('Projet importé');
    } else {
        showToast('Format de fichier invalide : propriété "slides" manquante', 'error');
    }
}

// Expose to global scope
window.importProject = importProject;
window.switchImportTab = switchImportTab;
window.setupDragAndDrop = setupDragAndDrop;
window.handleDroppedFile = handleDroppedFile;
window.handleFileSelect = handleFileSelect;
window.clearSelectedFile = clearSelectedFile;
window.formatJsonInput = formatJsonInput;
window.confirmImport = confirmImport;
window.importFromFile = importFromFile;
window.importFromCode = importFromCode;
window.processImportData = processImportData;
