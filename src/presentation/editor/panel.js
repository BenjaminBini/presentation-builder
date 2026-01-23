// src/presentation/editor/panel.js
// Main editor panel rendering

import { TEMPLATES, TEMPLATE_COLOR_SETTINGS, COLOR_LABELS, GRAY_LABELS } from '../../config/index.js';
import { renderTemplateSettings } from './template-settings.js';
import { getProject, getSelectedSlideIndex } from '../../core/state.js';
import { registerActions } from '../event-delegation.js';

// ============================================================================
// ACTION HANDLERS (for event delegation)
// ============================================================================

/**
 * Handle toggle color picker via event delegation
 */
function handleToggleColorPicker(_event, _element, params) {
  if (typeof window.toggleColorPicker === 'function') {
    window.toggleColorPicker(params.key);
  }
}

/**
 * Handle select slide color via event delegation
 */
function handleSelectSlideColor(event, _element, params) {
  event.stopPropagation();
  if (typeof window.selectSlideColor === 'function') {
    window.selectSlideColor(params.key, params.color);
  }
}

/**
 * Handle reset slide color via event delegation
 */
function handleResetSlideColor(event, _element, params) {
  event.stopPropagation();
  if (typeof window.resetSlideColor === 'function') {
    window.resetSlideColor(params.key);
  }
}

/**
 * Handle showing color name on hover
 */
function handleShowColorName(_event, element, _params) {
  if (typeof window.showColorName === 'function') {
    window.showColorName(element);
  }
}

/**
 * Handle hiding color name on hover leave
 */
function handleHideColorName(_event, element, _params) {
  if (typeof window.hideColorName === 'function') {
    window.hideColorName(element);
  }
}

// Register panel actions
registerActions({
  'toggle-color-picker': handleToggleColorPicker,
  'select-slide-color': handleSelectSlideColor,
  'reset-slide-color': handleResetSlideColor,
  'show-color-name': handleShowColorName,
  'hide-color-name': handleHideColorName
});

// Current active tab
let currentEditorTab = 'properties';

// Template descriptions for better UX
export const TEMPLATE_DESCRIPTIONS = {
    title: 'Slide de couverture avec titre principal, sous-titre et informations de présentation.',
    section: 'Slide de transition pour introduire une nouvelle partie.',
    bullets: 'Liste à puces pour présenter des points clés.',
    'two-columns': 'Contenu organisé en deux colonnes côte à côte.',
    'image-text': 'Image accompagnée d\'un texte explicatif.',
    quote: 'Citation mise en avant avec attribution.',
    stats: 'Chiffres clés et statistiques visuellement impactants.',
    code: 'Bloc de code avec coloration syntaxique.',
    'code-annotated': 'Code avec annotations explicatives sur le côté.',
    timeline: 'Étapes ou événements présentés chronologiquement.',
    comparison: 'Tableau de données avec possibilité de mise en avant.',
    mermaid: 'Diagramme généré à partir de code Mermaid.'
};

// Helper to render color sections for dropdown
function renderColorSections(key, currentValue) {
    const COLOR_SECTIONS = {
        accent: { label: 'Accent', colors: ['accent-main', 'accent-alt', 'accent-third'] },
        text: { label: 'Texte', colors: ['text-main', 'text-alt', 'text-third'] },
        bg: { label: 'Fond', colors: ['bg-main', 'bg-alt', 'bg-third'] },
        gray: { label: 'Niveaux de gris', colors: ['white', 'gray-100', 'gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800', 'gray-900'] },
        semantic: { label: 'Sémantique', colors: ['confirm', 'info', 'warn', 'error'] }
    };

    const renderSection = (sectionKey, section) => {
        return `
            <div class="color-section" data-section="${sectionKey}">
                <div class="color-section-header">
                    <span class="color-section-label">${section.label}</span>
                    <span class="color-section-name"></span>
                </div>
                <div class="color-swatches-row">
                    ${section.colors.map(color => {
                        const colorLabel = COLOR_LABELS[color] || GRAY_LABELS[color] || color;
                        return `
                            <button type="button"
                                class="color-swatch-btn ${currentValue === color ? 'selected' : ''}"
                                style="background-color: var(--${color});"
                                data-color-name="${colorLabel}"
                                data-action="select-slide-color"
                                data-key="${key}"
                                data-color="${color}"
                                data-hover-action="show-color-name"
                                data-hover-leave-action="hide-color-name">
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    };

    return Object.entries(COLOR_SECTIONS).map(([sectionKey, section]) =>
        renderSection(sectionKey, section)
    ).join('');
}

// Switch editor tab
export function switchEditorTab(tab) {
    const previousTab = currentEditorTab;
    currentEditorTab = tab;

    // Determine animation direction
    const tabOrder = ['properties', 'colors'];
    const prevIndex = tabOrder.indexOf(previousTab);
    const newIndex = tabOrder.indexOf(tab);
    const direction = newIndex > prevIndex ? 'slide-left' : 'slide-right';

    // Update tab active state
    document.querySelectorAll('.editor-tab').forEach(tabEl => {
        if (tabEl.dataset.tab === tab) {
            tabEl.classList.add('active');
        } else {
            tabEl.classList.remove('active');
        }
    });

    // Animate underline
    updateEditorTabUnderline();

    // Re-render editor content with animation
    renderEditor(direction);
}

// Update tab underline position
export function updateEditorTabUnderline() {
    const activeTab = document.querySelector('.editor-tab.active');
    const tabsContainer = document.querySelector('.editor-tabs');

    if (!activeTab || !tabsContainer) return;

    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();

    const left = tabRect.left - containerRect.left;
    const width = tabRect.width;

    tabsContainer.style.setProperty('--underline-left', `${left}px`);
    tabsContainer.style.setProperty('--underline-width', `${width}px`);
}

export function renderEditor(animationDirection = null) {
    const container = document.getElementById('editorContent');
    const selectedSlideIndex = getSelectedSlideIndex();
    const project = getProject();

    // Remove previous animation classes
    container.classList.remove('slide-left', 'slide-right');

    // Show loading state when waiting for Drive project
    if (project._pendingDriveLoad) {
        container.innerHTML = `
            <div class="empty-state loading-state">
                <div class="empty-state-icon">
                    <svg class="icon icon-xl spinning" viewBox="0 0 24 24">
                        <path d="M12 2v4m0 12v4m-10-10h4m12 0h4m-3.5-6.5l-2.8 2.8m-7.4 7.4l-2.8 2.8m0-13l2.8 2.8m7.4 7.4l2.8 2.8"/>
                    </svg>
                </div>
                <h3>Chargement...</h3>
                <p>Récupération du projet depuis Google Drive</p>
            </div>
        `;
        return;
    }

    if (selectedSlideIndex < 0 || !project.slides[selectedSlideIndex]) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><svg class="icon icon-xl" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
                <h3>Aucune slide sélectionnée</h3>
                <p>Sélectionnez une slide ou ajoutez-en une nouvelle</p>
            </div>
        `;
        return;
    }

    const slide = project.slides[selectedSlideIndex];
    const template = TEMPLATES[slide.template];

    if (!template) {
        container.innerHTML = '<p>Template inconnu</p>';
        return;
    }

    if (currentEditorTab === 'colors') {
        // Render colors tab
        const colorSettings = TEMPLATE_COLOR_SETTINGS[slide.template] || [];
        const slideColors = slide.data.colors || {};

        const colorItemsHtml = colorSettings.map(setting => {
            const currentValue = slideColors[setting.key] || setting.default;
            const isCustom = setting.key in slideColors;
            const colorName = COLOR_LABELS[currentValue] || GRAY_LABELS[currentValue] || currentValue;

            return `
                <div class="color-item ${isCustom ? 'overridden' : ''}" data-color="${setting.key}" data-action="toggle-color-picker" data-key="${setting.key}">
                    <div class="color-swatch" style="background-color: var(--${currentValue});"></div>
                    <div class="color-info">
                        <div class="color-name">${setting.label}</div>
                        <div class="color-value">${colorName}</div>
                    </div>
                    ${isCustom ? `
                        <button class="color-reset" data-action="reset-slide-color" data-key="${setting.key}" title="Réinitialiser">
                            <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
                        </button>
                    ` : ''}
                    <div class="inline-color-dropdown" id="colorDropdown-${setting.key}">
                        ${renderColorSections(setting.key, currentValue)}
                    </div>
                </div>
            `;
        }).join('');

        if (colorSettings.length > 0) {
            container.innerHTML = `
                <div class="editor-toolbar">
                    <div class="editor-toolbar-section editor-toolbar-section-block">
                        <div class="color-list">
                            ${colorItemsHtml}
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎨</div>
                    <h3>Pas de couleurs personnalisables</h3>
                    <p>Ce template n'a pas de paramètres de couleur</p>
                </div>
            `;
        }
    } else {
        // Render properties tab
        const templateSettingsHtml = renderTemplateSettings(slide);

        container.innerHTML = `
            <div class="editor-toolbar">
                ${templateSettingsHtml}
            </div>
        `;
    }

    // Apply animation if direction is specified
    if (animationDirection) {
        void container.offsetWidth; // Trigger reflow
        container.classList.add(animationDirection);
    }
}

// Getter for currentEditorTab (for external access)
export function getCurrentEditorTab() {
    return currentEditorTab;
}
