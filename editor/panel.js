// editor/panel.js
// Main editor panel rendering

// Template descriptions for better UX
const TEMPLATE_DESCRIPTIONS = {
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

// Field grouping configuration per template
const FIELD_GROUPS = {
    title: [
        { label: 'Contenu principal', fields: ['title', 'subtitle'] },
        { label: 'Informations', fields: ['author', 'date', 'logo'] }
    ],
    quote: [
        { label: 'Citation', fields: ['quote'] },
        { label: 'Attribution', fields: ['authorName', 'authorTitle', 'authorImage'] }
    ],
    'code-annotated': [
        { label: 'Code', fields: ['title', 'filename', 'code'] },
        { label: 'Affichage', fields: ['startLine', 'notEndOfFile'] },
        { label: 'Annotations', fields: ['annotations'] }
    ],
    'image-text': [
        { label: 'Contenu', fields: ['title', 'text'] },
        { label: 'Image', fields: ['image', 'imageAlt'] }
    ],
    comparison: [
        { label: 'En-tête', fields: ['title'] },
        { label: 'Structure', fields: ['columns', 'highlightColumn'] },
        { label: 'Données', fields: ['rows'] }
    ]
};

window.renderEditor = function() {
    const container = document.getElementById('editorContent');

    if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><svg class="icon icon-xl" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
                <h3>Aucune slide sélectionnée</h3>
                <p>Sélectionnez une slide ou ajoutez-en une nouvelle</p>
            </div>
        `;
        return;
    }

    const slide = currentProject.slides[selectedSlideIndex];
    const template = TEMPLATES[slide.template];

    if (!template) {
        container.innerHTML = '<p>Template inconnu</p>';
        return;
    }

    // Render color settings as inline toolbar
    const colorSettings = TEMPLATE_COLOR_SETTINGS[slide.template] || [];
    const slideColors = slide.data.colors || {};

    const colorItemsHtml = colorSettings.map(setting => {
        const currentValue = slideColors[setting.key] || setting.default;
        const isCustom = setting.key in slideColors;
        return renderInlineColorSelector(setting.key, setting.label, currentValue, setting.default, isCustom);
    }).join('');

    // Render template-specific settings
    const templateSettingsHtml = renderTemplateSettings(slide);

    const colorsSection = colorSettings.length > 0 ? `
        <div class="editor-toolbar-section editor-toolbar-section-block">
            <span class="editor-toolbar-label">Couleurs</span>
            <div class="color-settings-list">
                ${colorItemsHtml}
            </div>
        </div>
    ` : '';

    container.innerHTML = `
        <div class="editor-toolbar">
            ${templateSettingsHtml}
            ${colorsSection}
        </div>
    `;
};
