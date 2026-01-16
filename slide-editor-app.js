// slide-editor-app.js
// Main application: state, initialization, and core UI functions
// Dependencies: slide-editor-config.js, slide-editor-templates.js

// ============================================================================
// APPLICATION STATE
// ============================================================================

let currentProject = {
    name: 'Nouvelle présentation',
    metadata: {
        title: 'Ma Présentation',
        author: '',
        date: new Date().toLocaleDateString('fr-FR'),
        version: '1.0'
    },
    theme: {
        base: 'gitlab',
        overrides: {}
    },
    slides: []
};
let selectedSlideIndex = -1;
let selectedTemplate = null;
let currentSidebarTab = 'slides'; // 'slides' or 'settings'
let draggedIndex = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load project from localStorage or use sample
    loadInitialProject();

    // Initialize UI components
    initTemplateGrid();
    renderSlideList();
    renderSettingsPanel();
    updatePreview();
    updateHeaderTitle();
    initMermaid();
}

function loadInitialProject() {
    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');

    if (projects.length === 0) {
        // No projects exist - load sample data
        currentProject = JSON.parse(JSON.stringify(SAMPLE_PROJECT));
        selectedSlideIndex = currentProject.slides.length > 0 ? 0 : -1;
        showToast('Projet de démonstration chargé');
    } else if (projects.length === 1) {
        // One project exists - load it
        currentProject = JSON.parse(JSON.stringify(projects[0]));
        ensureTheme();
        selectedSlideIndex = currentProject.slides.length > 0 ? 0 : -1;
    } else {
        // Multiple projects - load most recently modified
        const sortedProjects = [...projects].sort((a, b) => {
            const dateA = new Date(a.savedAt || 0);
            const dateB = new Date(b.savedAt || 0);
            return dateB - dateA;
        });
        currentProject = JSON.parse(JSON.stringify(sortedProjects[0]));
        ensureTheme();
        selectedSlideIndex = currentProject.slides.length > 0 ? 0 : -1;
        showToast(`Projet "${currentProject.name}" chargé`);
    }
}

function ensureTheme() {
    if (!currentProject.theme) {
        currentProject.theme = { base: 'gitlab', overrides: {} };
    }
}

function updateHeaderTitle() {
    const titleElement = document.getElementById('headerProjectName');
    if (titleElement) {
        titleElement.textContent = currentProject.name || 'Sans titre';
    }
}

function editProjectTitle() {
    const container = document.querySelector('.header-project-name');
    const input = document.getElementById('headerProjectInput');

    container.classList.add('editing');
    input.value = currentProject.name || '';
    input.focus();
    input.select();
}

function finishEditProjectTitle() {
    const container = document.querySelector('.header-project-name');
    const input = document.getElementById('headerProjectInput');
    const newName = input.value.trim();

    if (newName && newName !== currentProject.name) {
        currentProject.name = newName;
        updateHeaderTitle();
        showToast('Nom du projet mis à jour');
    }

    container.classList.remove('editing');
}

function handleTitleKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        finishEditProjectTitle();
    } else if (event.key === 'Escape') {
        event.preventDefault();
        const container = document.querySelector('.header-project-name');
        container.classList.remove('editing');
    }
}

function initMermaid() {
    const colors = getThemeColors();
    mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
            primaryColor: colors['orange'],
            primaryTextColor: colors['dark'],
            primaryBorderColor: colors['orange-dark'],
            lineColor: colors['gray-600'],
            secondaryColor: colors['orange-light'],
            tertiaryColor: '#F5F5F5'
        }
    });
}

// ============================================================================
// SIDEBAR TAB SWITCHING
// ============================================================================

function switchSidebarTab(tab) {
    currentSidebarTab = tab;
    document.querySelectorAll('.sidebar-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.getElementById('sidebarContent').dataset.tab = tab;
    if (tab === 'settings') {
        renderSettingsPanel();
    }
}

// ============================================================================
// SETTINGS PANEL
// ============================================================================

function renderSettingsPanel() {
    renderThemeSelector();
    renderColorList();
}

function renderThemeSelector() {
    const selector = document.getElementById('themeSelector');
    const currentTheme = currentProject.theme?.base || 'gitlab';

    selector.innerHTML = Object.entries(THEMES).map(([key, theme]) => `
        <button class="theme-option ${key === currentTheme ? 'active' : ''}" onclick="selectTheme('${key}')">
            ${theme.name}
        </button>
    `).join('');
}

function selectTheme(themeKey) {
    if (!currentProject.theme) {
        currentProject.theme = { base: 'gitlab', overrides: {} };
    }
    currentProject.theme.base = themeKey;
    currentProject.theme.overrides = {}; // Reset overrides when changing theme
    renderSettingsPanel();
    updatePreview();
    initMermaid(); // Re-init mermaid with new colors
    showToast('Thème appliqué');
}

function renderColorList() {
    const list = document.getElementById('colorList');
    const baseTheme = THEMES[currentProject.theme?.base || 'gitlab'];
    const overrides = currentProject.theme?.overrides || {};

    list.innerHTML = Object.entries(baseTheme.colors).map(([key, defaultValue]) => {
        const currentValue = overrides[key] || defaultValue;
        const isOverridden = key in overrides;

        return `
            <div class="color-item ${isOverridden ? 'overridden' : ''}" data-color="${key}">
                <div class="color-swatch" style="background-color: ${currentValue};">
                    <input type="color" value="${currentValue}" onchange="setColorOverride('${key}', this.value)">
                </div>
                <div class="color-info">
                    <div class="color-name">${COLOR_LABELS[key] || key}</div>
                    <div class="color-value">${currentValue}</div>
                </div>
                <button class="color-reset" onclick="resetColorOverride('${key}')" title="Réinitialiser">
                    <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
            </div>
        `;
    }).join('');
}

function setColorOverride(colorKey, value) {
    if (!currentProject.theme) {
        currentProject.theme = { base: 'gitlab', overrides: {} };
    }
    if (!currentProject.theme.overrides) {
        currentProject.theme.overrides = {};
    }
    currentProject.theme.overrides[colorKey] = value;
    renderColorList();
    updatePreview();
}

function resetColorOverride(colorKey) {
    if (currentProject.theme?.overrides) {
        delete currentProject.theme.overrides[colorKey];
        renderColorList();
        updatePreview();
        showToast('Couleur réinitialisée');
    }
}

// ============================================================================
// TEMPLATE GRID
// ============================================================================

function initTemplateGrid() {
    const grid = document.getElementById('templateGrid');
    grid.innerHTML = Object.entries(TEMPLATES).map(([key, template]) => `
        <div class="template-option" data-template="${key}" onclick="selectTemplate('${key}')">
            <div class="template-option-icon">${template.icon}</div>
            <div class="template-option-name">${template.name}</div>
        </div>
    `).join('');
}

// ============================================================================
// SLIDE LIST
// ============================================================================

function renderSlideList() {
    const list = document.getElementById('slideList');

    if (currentProject.slides.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><svg class="icon icon-xl" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <h3>Aucune slide</h3>
                <p>Cliquez sur "Ajouter" pour créer votre première slide</p>
            </div>
        `;
        return;
    }

    list.innerHTML = currentProject.slides.map((slide, index) => {
        const template = TEMPLATES[slide.template];
        const title = slide.data.title || slide.data.quote?.substring(0, 30) || `Slide ${index + 1}`;
        return `
            <div class="slide-item ${index === selectedSlideIndex ? 'active' : ''}"
                 data-index="${index}"
                 draggable="true"
                 ondragstart="handleDragStart(event, ${index})"
                 ondragover="handleDragOver(event)"
                 ondrop="handleDrop(event, ${index})"
                 ondragend="handleDragEnd(event)"
                 onclick="selectSlide(${index})">
                <div class="slide-item-number">Slide ${index + 1}</div>
                <div class="slide-item-title">${escapeHtml(title)}</div>
                <div class="slide-item-template">${template?.icon || '?'} ${template?.name || slide.template}</div>
                <div class="slide-item-actions">
                    <button class="slide-item-btn" onclick="event.stopPropagation(); duplicateSlide(${index})" title="Dupliquer"><svg class="icon icon-sm" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                    <button class="slide-item-btn delete" onclick="event.stopPropagation(); deleteSlide(${index})" title="Supprimer"><svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================================
// SLIDE SELECTION & MANIPULATION
// ============================================================================

function selectSlide(index) {
    selectedSlideIndex = index;
    renderSlideList();
    renderEditor();
    updatePreview();
}

function addSlide() {
    selectedTemplate = null;
    document.querySelectorAll('.template-option').forEach(el => el.classList.remove('selected'));
    document.getElementById('addSlideModal').classList.add('active');
}

function selectTemplate(template) {
    selectedTemplate = template;
    document.querySelectorAll('.template-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.template === template);
    });
}

function confirmAddSlide() {
    if (!selectedTemplate) {
        showToast('Veuillez sélectionner un template', 'error');
        return;
    }

    const newSlide = {
        template: selectedTemplate,
        data: getDefaultData(selectedTemplate)
    };

    currentProject.slides.push(newSlide);
    selectedSlideIndex = currentProject.slides.length - 1;

    closeModal('addSlideModal');
    renderSlideList();
    renderEditor();
    updatePreview();
    showToast('Slide ajoutée');
}

function deleteSlide(index) {
    if (confirm('Supprimer cette slide ?')) {
        currentProject.slides.splice(index, 1);
        if (selectedSlideIndex >= currentProject.slides.length) {
            selectedSlideIndex = currentProject.slides.length - 1;
        }
        renderSlideList();
        renderEditor();
        updatePreview();
        showToast('Slide supprimée');
    }
}

function duplicateSlide(index) {
    const copy = JSON.parse(JSON.stringify(currentProject.slides[index]));
    currentProject.slides.splice(index + 1, 0, copy);
    selectedSlideIndex = index + 1;
    renderSlideList();
    renderEditor();
    updatePreview();
    showToast('Slide dupliquée');
}

// ============================================================================
// DRAG AND DROP
// ============================================================================

function handleDragStart(event, index) {
    draggedIndex = index;
    event.target.classList.add('dragging');
}

function handleDragOver(event) {
    event.preventDefault();
    const item = event.target.closest('.slide-item');
    if (item) {
        item.classList.add('drag-over');
    }
}

function handleDrop(event, targetIndex) {
    event.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
        const [removed] = currentProject.slides.splice(draggedIndex, 1);
        currentProject.slides.splice(targetIndex, 0, removed);
        if (selectedSlideIndex === draggedIndex) {
            selectedSlideIndex = targetIndex;
        }
        renderSlideList();
        updatePreview();
    }
    document.querySelectorAll('.slide-item').forEach(el => el.classList.remove('drag-over'));
}

function handleDragEnd(event) {
    draggedIndex = null;
    document.querySelectorAll('.slide-item').forEach(el => {
        el.classList.remove('dragging', 'drag-over');
    });
}

// ============================================================================
// PREVIEW
// ============================================================================

function updatePreview() {
    // Skip re-render if inline editing is active
    if (typeof InlineEditor !== 'undefined' && InlineEditor.isEditing) {
        return;
    }

    const wrapper = document.getElementById('previewWrapper');
    const preview = document.getElementById('previewSlide');

    // Always calculate and apply scale
    const wrapperWidth = wrapper.offsetWidth;
    const scale = Math.min(1, wrapperWidth / 1280);
    preview.style.transform = `scale(${scale})`;

    if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) {
        preview.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--gl-gray-100); color: var(--gl-gray-500);">
                <div style="text-align: center;">
                    <div style="margin-bottom: 16px;"><svg style="width: 48px; height: 48px; stroke: currentColor; stroke-width: 1.5; fill: none; opacity: 0.5;" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                    <div>Sélectionnez une slide</div>
                </div>
            </div>
        `;
        return;
    }

    const slide = currentProject.slides[selectedSlideIndex];
    preview.innerHTML = renderSlidePreview(slide);

    // Re-render mermaid if needed
    if (slide.template === 'mermaid') {
        setTimeout(() => {
            mermaid.run({ nodes: preview.querySelectorAll('.mermaid') });
        }, 100);
    }
}

function renderSlidePreview(slide) {
    const { template, data } = slide;
    const styles = getPreviewStyles();
    return `<style>${styles}</style>${renderTemplate(template, data)}`;
}

// ============================================================================
// RESIZE HANDLER
// ============================================================================

window.addEventListener('resize', () => {
    updatePreview();
    if (document.getElementById('presentationPlayer').classList.contains('active')) {
        updatePlayerSlide();
    }
});

// ============================================================================
// PRESENTATION PLAYER
// ============================================================================

let playerSlideIndex = 0;

function startPresentation() {
    if (currentProject.slides.length === 0) {
        showToast('Ajoutez des slides avant de présenter', 'error');
        return;
    }

    playerSlideIndex = selectedSlideIndex >= 0 ? selectedSlideIndex : 0;
    document.getElementById('presentationPlayer').classList.add('active');
    document.getElementById('playerTitle').textContent = currentProject.name || 'Présentation';

    updatePlayerSlide();
    updatePlayerControls();

    // Add keyboard listener
    document.addEventListener('keydown', handlePlayerKeydown);
}

function exitPresentation() {
    document.getElementById('presentationPlayer').classList.remove('active');
    document.removeEventListener('keydown', handlePlayerKeydown);

    // Sync selected slide with player position
    selectedSlideIndex = playerSlideIndex;
    renderSlideList();
    renderEditor();
    updatePreview();
}

function updatePlayerSlide() {
    const player = document.getElementById('presentationPlayer');
    const slideContainer = document.getElementById('playerSlide');
    const wrapper = slideContainer.parentElement;

    if (!player.classList.contains('active')) return;

    const slide = currentProject.slides[playerSlideIndex];
    if (slide) {
        slideContainer.innerHTML = renderSlidePreview(slide);

        // Calculate scale to fit wrapper
        const wrapperRect = wrapper.getBoundingClientRect();
        const scaleX = wrapperRect.width / 1280;
        const scaleY = wrapperRect.height / 720;
        const scale = Math.min(scaleX, scaleY, 1);
        slideContainer.style.transform = `scale(${scale})`;

        // Re-render mermaid if needed
        if (slide.template === 'mermaid') {
            setTimeout(() => {
                mermaid.run({ nodes: slideContainer.querySelectorAll('.mermaid') });
            }, 100);
        }
    }
}

function updatePlayerControls() {
    const total = currentProject.slides.length;
    const current = playerSlideIndex + 1;

    document.getElementById('playerCounter').textContent = `${current} / ${total}`;
    document.getElementById('playerProgressBar').style.width = `${(current / total) * 100}%`;

    // Update nav button states
    document.querySelector('.player-nav-prev').disabled = playerSlideIndex === 0;
    document.querySelector('.player-nav-next').disabled = playerSlideIndex >= total - 1;
}

function prevSlidePlayer() {
    if (playerSlideIndex > 0) {
        playerSlideIndex--;
        updatePlayerSlide();
        updatePlayerControls();
    }
}

function nextSlidePlayer() {
    if (playerSlideIndex < currentProject.slides.length - 1) {
        playerSlideIndex++;
        updatePlayerSlide();
        updatePlayerControls();
    }
}

function handlePlayerKeydown(event) {
    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
            event.preventDefault();
            prevSlidePlayer();
            break;
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
            event.preventDefault();
            nextSlidePlayer();
            break;
        case 'Home':
            event.preventDefault();
            playerSlideIndex = 0;
            updatePlayerSlide();
            updatePlayerControls();
            break;
        case 'End':
            event.preventDefault();
            playerSlideIndex = currentProject.slides.length - 1;
            updatePlayerSlide();
            updatePlayerControls();
            break;
        case 'Escape':
            event.preventDefault();
            exitPresentation();
            break;
    }
}
