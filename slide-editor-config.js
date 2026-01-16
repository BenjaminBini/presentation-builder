// slide-editor-config.js
// Theme definitions, icons, and template configurations

// ============================================================================
// THEME DEFINITIONS
// ============================================================================

const THEMES = {
    gitlab: {
        name: 'GitLab',
        colors: {
            // Accent colors
            'accent-main': '#FC6D26',
            'accent-alt': '#E24329',
            'accent-third': '#FCA326',
            // Text colors
            'text-main': '#FFFFFF',
            'text-alt': '#BFBFC3',
            'text-third': '#737278',
            // Background colors
            'bg-main': '#171321',
            'bg-alt': '#1F1A24',
            'bg-third': '#2E2A35',
            // Semantic colors
            'confirm': '#108548',
            'info': '#1F75CB',
            'warn': '#FCA326',
            'error': '#DD2B0E'
        }
    }
};

// Static gray palette (not editable, used globally)
const GRAY_PALETTE = {
    'gray-900': '#1F1A24',
    'gray-800': '#2E2A35',
    'gray-700': '#3F3A47',
    'gray-600': '#525059',
    'gray-500': '#737278',
    'gray-400': '#9A99A0',
    'gray-300': '#BFBFC3',
    'gray-200': '#DCDCDE',
    'gray-100': '#ECECEF',
    'white': '#FFFFFF'
};

// Color names for display
const COLOR_LABELS = {
    'accent-main': 'Accent principal',
    'accent-alt': 'Accent secondaire',
    'accent-third': 'Accent tertiaire',
    'text-main': 'Texte principal',
    'text-alt': 'Texte secondaire',
    'text-third': 'Texte tertiaire',
    'bg-main': 'Fond principal',
    'bg-alt': 'Fond secondaire',
    'bg-third': 'Fond tertiaire',
    'confirm': 'Confirmation',
    'info': 'Information',
    'warn': 'Avertissement',
    'error': 'Erreur'
};

// ============================================================================
// SVG ICONS FOR TEMPLATES
// ============================================================================

const ICONS = {
    // Title - centered large heading with subtitle line
    title: '<svg class="template-icon" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="3" rx="1" fill="currentColor" stroke="none"/><rect x="6" y="13" width="12" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/></svg>',

    // Section - hash/pound symbol
    section: '<svg class="template-icon" viewBox="0 0 24 24"><path d="M4 9h16M4 15h16M10 4v16M14 4v16" stroke-width="2.5" stroke-linecap="round"/></svg>',

    // Bullets - clean list with dots
    bullets: '<svg class="template-icon" viewBox="0 0 24 24"><circle cx="5" cy="7" r="2" fill="currentColor" stroke="none"/><rect x="10" y="6" width="11" height="2" rx="1" fill="currentColor" stroke="none"/><circle cx="5" cy="14" r="2" fill="currentColor" stroke="none"/><rect x="10" y="13" width="9" height="2" rx="1" fill="currentColor" stroke="none"/><circle cx="5" cy="21" r="2" fill="currentColor" stroke="none" opacity="0.4"/><rect x="10" y="20" width="7" height="2" rx="1" fill="currentColor" stroke="none" opacity="0.4"/></svg>',

    // Two columns - side by side boxes
    'two-columns': '<svg class="template-icon" viewBox="0 0 24 24"><rect x="2" y="3" width="9" height="18" rx="2" fill="none"/><rect x="13" y="3" width="9" height="18" rx="2" fill="none"/><rect x="4" y="6" width="5" height="1.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="4" y="9" width="4" height="1" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/><rect x="4" y="11" width="5" height="1" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/><rect x="15" y="6" width="5" height="1.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="15" y="9" width="4" height="1" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/><rect x="15" y="11" width="5" height="1" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/></svg>',

    // Image + text - photo with paragraphs
    'image-text': '<svg class="template-icon" viewBox="0 0 24 24"><rect x="2" y="4" width="10" height="8" rx="1.5" fill="currentColor" stroke="none" opacity="0.3"/><circle cx="5" cy="7" r="1.5" fill="currentColor" stroke="none"/><path d="M2 10l3-2 3 2 2-1 2 3H2z" fill="currentColor" stroke="none" opacity="0.6"/><rect x="14" y="4" width="8" height="2" rx="0.5" fill="currentColor" stroke="none"/><rect x="14" y="8" width="7" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/><rect x="14" y="11" width="6" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/><rect x="2" y="15" width="20" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.3"/><rect x="2" y="18" width="16" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.3"/></svg>',

    // Quote - large quotation mark
    quote: '<svg class="template-icon" viewBox="0 0 24 24"><path d="M6 10c0-2 1.5-3 3-3V5c-3 0-5 2-5 5v7h5v-5H6v-2zm10 0c0-2 1.5-3 3-3V5c-3 0-5 2-5 5v7h5v-5h-3v-2z" fill="currentColor" stroke="none"/></svg>',

    // Stats - simple bar chart
    stats: '<svg class="template-icon" viewBox="0 0 24 24"><rect x="3" y="13" width="5" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.5"/><rect x="10" y="8" width="5" height="13" rx="1" fill="currentColor" stroke="none" opacity="0.75"/><rect x="17" y="3" width="5" height="18" rx="1" fill="currentColor" stroke="none"/></svg>',

    // Code - terminal with prompt
    code: '<svg class="template-icon" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="2" fill="none"/><circle cx="5" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="11" cy="6" r="1" fill="currentColor" stroke="none"/><path d="M5 11l3 2-3 2" fill="none"/><rect x="10" y="14" width="8" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/></svg>',

    // Code annotated - code with callout
    'code-annotated': '<svg class="template-icon" viewBox="0 0 24 24"><rect x="2" y="3" width="14" height="18" rx="2" fill="none"/><rect x="4" y="7" width="8" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/><rect x="4" y="10" width="10" height="1.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="4" y="13" width="6" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/><path d="M18 9l2 0 0 6-2 0" fill="none"/><circle cx="21" cy="12" r="2" fill="currentColor" stroke="none"/></svg>',

    // Timeline - horizontal flow with steps
    timeline: '<svg class="template-icon" viewBox="0 0 24 24"><path d="M2 12h20" stroke-dasharray="0"/><circle cx="4" cy="12" r="3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" opacity="0.6"/><circle cx="20" cy="12" r="3" fill="currentColor" stroke="none" opacity="0.3"/><rect x="2" y="17" width="4" height="1" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/><rect x="10" y="17" width="4" height="1" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/><rect x="18" y="17" width="4" height="1" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/></svg>',

    // Comparison - table grid
    comparison: '<svg class="template-icon" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="2" fill="none"/><path d="M2 8h20" fill="none"/><path d="M2 13h20" fill="none"/><path d="M2 18h20" fill="none"/><path d="M9 3v18" fill="none"/><path d="M16 3v18" fill="none"/></svg>',

    // Mermaid - flowchart diagram
    mermaid: '<svg class="template-icon" viewBox="0 0 24 24"><rect x="8" y="2" width="8" height="4" rx="1" fill="currentColor" stroke="none"/><rect x="2" y="18" width="6" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.6"/><rect x="16" y="18" width="6" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.6"/><path d="M12 6v5M12 11L5 18M12 11l7 7" fill="none"/></svg>'
};

// ============================================================================
// TEMPLATE DEFINITIONS
// ============================================================================

const TEMPLATES = {
    title: {
        name: 'Titre',
        icon: ICONS.title,
        fields: [
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'subtitle', label: 'Sous-titre', type: 'text' },
            { key: 'author', label: 'Auteur', type: 'text' },
            { key: 'date', label: 'Date', type: 'text' },
            { key: 'logo', label: 'URL du logo', type: 'text', hint: 'Laisser vide pour le logo GitLab' }
        ]
    },
    section: {
        name: 'Section',
        icon: ICONS.section,
        fields: [
            { key: 'number', label: 'Numéro', type: 'text', hint: 'Ex: 01, 02...' },
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'subtitle', label: 'Sous-titre', type: 'text' }
        ]
    },
    bullets: {
        name: 'Liste',
        icon: ICONS.bullets,
        fields: [
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'tag', label: 'Tag', type: 'text', hint: 'Badge en haut à droite' },
            { key: 'items', label: 'Éléments', type: 'array', required: true }
        ]
    },
    'two-columns': {
        name: 'Deux colonnes',
        icon: ICONS['two-columns'],
        fields: [
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'left', label: 'Colonne gauche', type: 'column' },
            { key: 'right', label: 'Colonne droite', type: 'column' }
        ]
    },
    'image-text': {
        name: 'Image + Texte',
        icon: ICONS['image-text'],
        fields: [
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'image', label: 'URL de l\'image', type: 'text' },
            { key: 'imageAlt', label: 'Description image', type: 'text' },
            { key: 'text', label: 'Texte', type: 'textarea', hint: 'Un paragraphe par ligne' }
        ]
    },
    quote: {
        name: 'Citation',
        icon: ICONS.quote,
        fields: [
            { key: 'quote', label: 'Citation', type: 'textarea', required: true },
            { key: 'authorName', label: 'Nom de l\'auteur', type: 'text' },
            { key: 'authorTitle', label: 'Titre/Fonction', type: 'text' },
            { key: 'authorImage', label: 'URL photo auteur', type: 'text' }
        ]
    },
    stats: {
        name: 'Statistiques',
        icon: ICONS.stats,
        fields: [
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'stats', label: 'Statistiques', type: 'stats', hint: '3 stats recommandées' }
        ]
    },
    code: {
        name: 'Code',
        icon: ICONS.code,
        fields: [
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'filename', label: 'Nom du fichier', type: 'text' },
            { key: 'code', label: 'Code', type: 'textarea', required: true },
            { key: 'description', label: 'Description', type: 'text' }
        ]
    },
    'code-annotated': {
        name: 'Code annoté',
        icon: ICONS['code-annotated'],
        fields: [
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'filename', label: 'Nom du fichier', type: 'text' },
            { key: 'startLine', label: 'Ligne de départ', type: 'number', hint: 'Défaut: 1' },
            { key: 'notEndOfFile', label: 'Afficher ... à la fin', type: 'checkbox' },
            { key: 'code', label: 'Code', type: 'textarea', required: true },
            { key: 'annotations', label: 'Annotations', type: 'annotations' }
        ]
    },
    timeline: {
        name: 'Timeline',
        icon: ICONS.timeline,
        fields: [
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'steps', label: 'Étapes', type: 'steps', hint: '3-5 étapes recommandées' }
        ]
    },
    comparison: {
        name: 'Tableau',
        icon: ICONS.comparison,
        fields: [
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'columns', label: 'Colonnes', type: 'array', hint: 'En-têtes des colonnes' },
            { key: 'rows', label: 'Lignes', type: 'table-rows', hint: 'Données du tableau' },
            { key: 'highlightColumn', label: 'Colonne mise en avant', type: 'number', hint: 'Index (1, 2, 3...) ou vide' }
        ]
    },
    mermaid: {
        name: 'Diagramme',
        icon: ICONS.mermaid,
        fields: [
            { key: 'title', label: 'Titre', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'text' },
            { key: 'diagram', label: 'Code Mermaid', type: 'textarea', required: true, hint: 'flowchart, sequenceDiagram, etc.' }
        ]
    }
};

// ============================================================================
// SAMPLE PROJECT DATA
// ============================================================================

const SAMPLE_PROJECT = {
    name: 'Présentation de démonstration',
    metadata: {
        title: 'Présentation de démonstration',
        author: 'Slide Editor',
        date: new Date().toLocaleDateString('fr-FR'),
        version: '1.0'
    },
    theme: {
        base: 'gitlab',
        overrides: {}
    },
    slides: [
        {
            template: 'title',
            data: {
                title: 'Bienvenue dans Slide Editor',
                subtitle: 'Créez des présentations professionnelles',
                author: 'Votre nom',
                date: new Date().toLocaleDateString('fr-FR')
            }
        },
        {
            template: 'bullets',
            data: {
                title: 'Fonctionnalités principales',
                tag: 'Features',
                items: [
                    '12 templates de slides professionnels',
                    'Personnalisation des couleurs du thème',
                    'Export JSON pour generate-slides.js',
                    'Sauvegarde locale automatique',
                    'Interface intuitive drag & drop'
                ]
            }
        },
        {
            template: 'section',
            data: {
                number: '01',
                title: 'Pour commencer',
                subtitle: 'Explorez les différents templates disponibles'
            }
        }
    ]
};

// ============================================================================
// DEFAULT DATA FOR NEW SLIDES
// ============================================================================

function getDefaultData(template) {
    const defaults = {
        title: { title: 'Nouveau titre', subtitle: '', author: '', date: '' },
        section: { number: '01', title: 'Nouvelle section', subtitle: '' },
        bullets: { title: 'Liste', items: ['Premier élément', 'Deuxième élément'] },
        'two-columns': { title: 'Deux colonnes', left: { title: 'Gauche', items: ['Item 1'] }, right: { title: 'Droite', items: ['Item 1'] } },
        'image-text': { title: 'Image et texte', image: '', text: 'Description ici...' },
        quote: { quote: 'Votre citation ici...', authorName: '', authorTitle: '' },
        stats: { title: 'Statistiques', stats: [{ value: '100', label: 'Métrique', change: '+10%' }] },
        code: { title: 'Code', filename: 'example.js', code: '// Votre code ici', description: '' },
        'code-annotated': { title: 'Code annoté', filename: 'example.js', code: '// Code\nconst x = 1;', annotations: [] },
        timeline: { title: 'Timeline', steps: [{ icon: '1', title: 'Étape 1', description: '' }] },
        comparison: { title: 'Tableau', columns: ['Colonne 1', 'Colonne 2', 'Colonne 3'], rows: [['Ligne 1', 'Valeur', 'Valeur'], ['Ligne 2', 'Valeur', 'Valeur']] },
        mermaid: { title: 'Diagramme', description: '', diagram: 'flowchart LR\n    A-->B' }
    };
    return defaults[template] || { title: 'Nouvelle slide' };
}
