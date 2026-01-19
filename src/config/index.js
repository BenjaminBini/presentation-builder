// src/config/index.js
// Theme definitions, icons, and template configurations

// ============================================================================
// THEME DEFINITIONS
// ============================================================================

export const THEMES = {
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
export const GRAY_PALETTE = {
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
export const COLOR_LABELS = {
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

// Gray palette labels
export const GRAY_LABELS = {
  'gray-900': 'Gris 900',
  'gray-800': 'Gris 800',
  'gray-700': 'Gris 700',
  'gray-600': 'Gris 600',
  'gray-500': 'Gris 500',
  'gray-400': 'Gris 400',
  'gray-300': 'Gris 300',
  'gray-200': 'Gris 200',
  'gray-100': 'Gris 100',
  'white': 'Blanc'
};

// Color settings per template type
export const TEMPLATE_COLOR_SETTINGS = {
  title: [
    { key: 'bgColor', label: 'Fond', default: 'bg-main' },
    { key: 'gradientColor', label: 'Dégradé', default: 'accent-main' },
    { key: 'titleColor', label: 'Titre', default: 'accent-main' },
    { key: 'subtitleColor', label: 'Sous-titre', default: 'gray-400' },
    { key: 'authorColor', label: 'Auteur', default: 'gray-500' }
  ],
  section: [
    { key: 'bgColor', label: 'Fond', default: 'accent-main' },
    { key: 'titleColor', label: 'Titre', default: 'white' },
    { key: 'subtitleColor', label: 'Sous-titre', default: 'white' },
    { key: 'numberColor', label: 'Numéro', default: 'white' }
  ],
  bullets: [
    { key: 'bgColor', label: 'Fond', default: 'white' },
    { key: 'titleColor', label: 'Titre', default: 'gray-900' },
    { key: 'tagColor', label: 'Tag', default: 'accent-main' },
    { key: 'bulletColor', label: 'Puces', default: 'accent-main' },
    { key: 'textColor', label: 'Texte', default: 'gray-700' }
  ],
  'two-columns': [
    { key: 'bgColor', label: 'Fond', default: 'white' },
    { key: 'titleColor', label: 'Titre principal', default: 'gray-900' },
    { key: 'columnTitleColor', label: 'Titres colonnes', default: 'gray-800' },
    { key: 'bulletColor', label: 'Puces', default: 'accent-main' },
    { key: 'textColor', label: 'Texte', default: 'gray-600' }
  ],
  'image-text': [
    { key: 'bgColor', label: 'Fond', default: 'white' },
    { key: 'titleColor', label: 'Titre', default: 'gray-900' },
    { key: 'textColor', label: 'Texte', default: 'gray-700' }
  ],
  quote: [
    { key: 'bgColor', label: 'Fond', default: 'bg-main' },
    { key: 'quoteColor', label: 'Citation', default: 'white' },
    { key: 'quoteMarkColor', label: 'Guillemets', default: 'accent-main' },
    { key: 'authorNameColor', label: 'Nom auteur', default: 'white' },
    { key: 'authorTitleColor', label: 'Titre auteur', default: 'gray-400' }
  ],
  stats: [
    { key: 'bgColor', label: 'Fond', default: 'bg-main' },
    { key: 'titleColor', label: 'Titre', default: 'white' },
    { key: 'valueColor', label: 'Valeurs', default: 'accent-main' },
    { key: 'labelColor', label: 'Labels', default: 'gray-400' },
    { key: 'changeColor', label: 'Évolutions', default: 'confirm' },
    { key: 'changeBgColor', label: 'Fond évolutions', default: 'bg-third' }
  ],
  code: [
    { key: 'bgColor', label: 'Fond', default: 'white' },
    { key: 'titleColor', label: 'Titre', default: 'gray-900' },
    { key: 'windowBgColor', label: 'Fond fenêtre', default: 'gray-900' },
    { key: 'descriptionColor', label: 'Description', default: 'gray-600' }
  ],
  'code-annotated': [
    { key: 'bgColor', label: 'Fond', default: 'bg-main' },
    { key: 'titleColor', label: 'Titre', default: 'white' },
    { key: 'windowBgColor', label: 'Fond fenêtre', default: 'gray-900' },
    { key: 'annotationBgColor', label: 'Fond annotations', default: 'bg-alt' },
    { key: 'annotationTextColor', label: 'Texte annotations', default: 'gray-300' }
  ],
  timeline: [
    { key: 'bgColor', label: 'Fond', default: 'white' },
    { key: 'titleColor', label: 'Titre', default: 'gray-900' },
    { key: 'iconColor', label: 'Icônes', default: 'accent-main' },
    { key: 'stepTitleColor', label: 'Titres étapes', default: 'gray-800' },
    { key: 'stepDescColor', label: 'Descriptions', default: 'gray-500' }
  ],
  comparison: [
    { key: 'bgColor', label: 'Fond', default: 'white' },
    { key: 'titleColor', label: 'Titre', default: 'gray-900' },
    { key: 'headerBgColor', label: 'Fond en-tête', default: 'gray-100' },
    { key: 'headerTextColor', label: 'Texte en-tête', default: 'gray-700' },
    { key: 'highlightColor', label: 'Mise en avant', default: 'accent-main' }
  ],
  mermaid: [
    { key: 'bgColor', label: 'Fond', default: 'white' },
    { key: 'titleColor', label: 'Titre', default: 'gray-900' },
    { key: 'descriptionColor', label: 'Description', default: 'gray-600' }
  ],
  agenda: [
    { key: 'bgColor', label: 'Fond', default: 'white' },
    { key: 'titleColor', label: 'Titre', default: 'gray-900' },
    { key: 'numberColor', label: 'Numéros', default: 'accent-main' },
    { key: 'itemColor', label: 'Sujets', default: 'gray-800' },
    { key: 'durationColor', label: 'Durées', default: 'gray-500' }
  ]
};

// ============================================================================
// SVG ICONS FOR TEMPLATES
// ============================================================================

export const ICONS = {
  // Title - centered large heading with subtitle line
  title: '<svg class="template-icon" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="3" rx="1" fill="currentColor" stroke="none"/><rect x="6" y="13" width="12" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/></svg>',

  // Section - hash/pound symbol (slanted)
  section: '<svg class="template-icon" viewBox="0 0 24 24"><path d="M4 9h16M4 15h16" stroke-width="2.5" stroke-linecap="round"/><path d="M9 3l-2 18M17 3l-2 18" stroke-width="2.5" stroke-linecap="round"/></svg>',

  // Bullets - clean list with dots
  bullets: '<svg class="template-icon" viewBox="0 0 24 24"><circle cx="5" cy="7" r="2" fill="currentColor" stroke="none"/><rect x="10" y="6" width="11" height="2" rx="1" fill="currentColor" stroke="none"/><circle cx="5" cy="14" r="2" fill="currentColor" stroke="none"/><rect x="10" y="13" width="9" height="2" rx="1" fill="currentColor" stroke="none"/><circle cx="5" cy="21" r="2" fill="currentColor" stroke="none" opacity="0.4"/><rect x="10" y="20" width="7" height="2" rx="1" fill="currentColor" stroke="none" opacity="0.4"/></svg>',

  // Two columns - simple side by side
  'two-columns': '<svg class="template-icon" viewBox="0 0 24 24"><rect x="2" y="4" width="9" height="16" rx="2" fill="currentColor" stroke="none" opacity="0.15"/><rect x="13" y="4" width="9" height="16" rx="2" fill="currentColor" stroke="none" opacity="0.15"/><rect x="2" y="4" width="9" height="16" rx="2" fill="none"/><rect x="13" y="4" width="9" height="16" rx="2" fill="none"/></svg>',

  // Image + text - photo with paragraphs
  'image-text': '<svg class="template-icon" viewBox="0 0 24 24"><rect x="2" y="4" width="10" height="8" rx="1.5" fill="currentColor" stroke="none" opacity="0.3"/><circle cx="5" cy="7" r="1.5" fill="currentColor" stroke="none"/><path d="M2 10l3-2 3 2 2-1 2 3H2z" fill="currentColor" stroke="none" opacity="0.6"/><rect x="14" y="4" width="8" height="2" rx="0.5" fill="currentColor" stroke="none"/><rect x="14" y="8" width="7" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/><rect x="14" y="11" width="6" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/><rect x="2" y="15" width="20" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.3"/><rect x="2" y="18" width="16" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.3"/></svg>',

  // Quote - large quotation mark
  quote: '<svg class="template-icon" viewBox="0 0 24 24"><path d="M6 10c0-2 1.5-3 3-3V5c-3 0-5 2-5 5v7h5v-5H6v-2zm10 0c0-2 1.5-3 3-3V5c-3 0-5 2-5 5v7h5v-5h-3v-2z" fill="currentColor" stroke="none"/></svg>',

  // Stats - simple bar chart
  stats: '<svg class="template-icon" viewBox="0 0 24 24"><rect x="3" y="13" width="5" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.5"/><rect x="10" y="8" width="5" height="13" rx="1" fill="currentColor" stroke="none" opacity="0.75"/><rect x="17" y="3" width="5" height="18" rx="1" fill="currentColor" stroke="none"/></svg>',

  // Code - terminal with prompt
  code: '<svg class="template-icon" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="2" fill="none"/><circle cx="5" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="11" cy="6" r="1" fill="currentColor" stroke="none"/><path d="M5 11l3 2-3 2" fill="none"/><rect x="10" y="14" width="8" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.5"/></svg>',

  // Code annotated - code editor with annotation bubbles
  'code-annotated': '<svg class="template-icon" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="18" rx="2" fill="none"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" opacity="0.5"/><circle cx="7" cy="6" r="1" fill="currentColor" stroke="none" opacity="0.5"/><rect x="3" y="9" width="7" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.6"/><rect x="3" y="12" width="10" height="1.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="3" y="15" width="5" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.6"/><circle cx="19" cy="10" r="4" fill="currentColor" stroke="none"/><text x="19" y="12" text-anchor="middle" font-size="6" font-weight="bold" fill="white">1</text><path d="M15.5 10h-1" stroke-width="1.5"/></svg>',

  // Timeline - horizontal stepping process
  timeline: '<svg class="template-icon" viewBox="0 0 24 24"><path d="M3 12h18" stroke-width="1.5" stroke-linecap="round"/><circle cx="4" cy="12" r="3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" opacity="0.65"/><circle cx="20" cy="12" r="3" fill="currentColor" stroke="none" opacity="0.35"/><rect x="1" y="17" width="6" height="2" rx="0.5" fill="currentColor" stroke="none"/><rect x="9" y="17" width="6" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.65"/><rect x="17" y="17" width="6" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.35"/></svg>',

  // Comparison - data table with header
  comparison: '<svg class="template-icon" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" fill="none"/><rect x="2" y="4" width="20" height="4" rx="2" fill="currentColor" stroke="none" opacity="0.2"/><path d="M2 8h20" fill="none"/><path d="M2 12h20" fill="none" opacity="0.5"/><path d="M2 16h20" fill="none" opacity="0.5"/><path d="M9 8v12" fill="none" opacity="0.5"/><path d="M16 8v12" fill="none" opacity="0.5"/></svg>',

  // Mermaid - official logo (tail shape only)
  mermaid: '<svg class="template-icon" viewBox="60 90 370 310"><path d="M407.48,111.18C335.587,108.103 269.573,152.338 245.08,220C220.587,152.338 154.573,108.103 82.68,111.18C80.285,168.229 107.577,222.632 154.74,254.82C178.908,271.419 193.35,298.951 193.27,328.27L193.27,379.13L296.9,379.13L296.9,328.27C296.816,298.953 311.255,271.42 335.42,254.82C382.596,222.644 409.892,168.233 407.48,111.18Z" fill="currentColor"/></svg>',

  // Sommaire - table of contents with numbered items
  agenda: '<svg class="template-icon" viewBox="0 0 24 24"><text x="3" y="7" font-size="6" font-weight="600" fill="currentColor">1</text><rect x="10" y="3" width="12" height="2" rx="0.5" fill="currentColor" stroke="none"/><rect x="10" y="6" width="8" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.4"/><text x="3" y="15" font-size="6" font-weight="600" fill="currentColor" opacity="0.7">2</text><rect x="10" y="11" width="11" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.7"/><rect x="10" y="14" width="7" height="1.5" rx="0.5" fill="currentColor" stroke="none" opacity="0.3"/><text x="3" y="23" font-size="6" font-weight="600" fill="currentColor" opacity="0.4">3</text><rect x="10" y="19" width="10" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.4"/></svg>',

  // Draw.io - interactive diagram editor
  drawio: '<svg class="template-icon" viewBox="0 0 24 24"><rect x="2" y="2" width="8" height="6" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="2" width="8" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.6"/><rect x="8" y="16" width="8" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.6"/><path d="M6 8v4h6M18 8v4h-6M12 12v4" fill="none"/></svg>'
};

// ============================================================================
// TEMPLATE DEFINITIONS
// ============================================================================

export const TEMPLATES = {
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
      { key: 'showEllipsisAfter', label: 'Afficher ... à la fin', type: 'checkbox' },
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
    name: 'Mermaid',
    icon: ICONS.mermaid,
    fields: [
      { key: 'title', label: 'Titre', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'diagram', label: 'Code Mermaid', type: 'textarea', required: true, hint: 'flowchart, sequenceDiagram, etc.' }
    ]
  },
  agenda: {
    name: 'Sommaire',
    icon: ICONS.agenda,
    fields: [
      { key: 'title', label: 'Titre', type: 'text', required: true },
      { key: 'items', label: 'Points du sommaire', type: 'agenda-items', hint: 'Ajoutez les sujets avec durée optionnelle' }
    ]
  },
  drawio: {
    name: 'Draw.io',
    icon: ICONS.drawio,
    fields: [
      { key: 'title', label: 'Titre', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'diagram', label: 'Diagramme', type: 'drawio', required: true }
    ]
  }
};

// ============================================================================
// SAMPLE PROJECT DATA - Showcases all available templates
// ============================================================================

export const SAMPLE_PROJECT = {
  name: 'Galerie des Templates',
  metadata: {
    title: 'Galerie des Templates',
    author: 'Slide Editor',
    date: new Date().toLocaleDateString('fr-FR'),
    version: '1.0'
  },
  theme: {
    base: 'gitlab',
    overrides: {}
  },
  slides: [
    // 1. Title slide
    {
      template: 'title',
      data: {
        title: 'Galerie des Templates',
        subtitle: 'Découvrez tous les templates disponibles',
        author: 'Slide Editor',
        date: new Date().toLocaleDateString('fr-FR')
      }
    },
    // 2. Agenda slide
    {
      template: 'agenda',
      data: {
        title: 'Au programme',
        showDuration: true,
        items: [
          { title: 'Templates de structure', subtitle: 'Title, Section, Agenda', duration: '' },
          { title: 'Templates de contenu', subtitle: 'Bullets, Two-columns, Image-text', duration: '' },
          { title: 'Templates de données', subtitle: 'Stats, Comparison, Timeline', duration: '' },
          { title: 'Templates techniques', subtitle: 'Code, Code-annotated, Mermaid', duration: '' },
          { title: 'Autres templates', subtitle: 'Quote, Draw.io', duration: '' }
        ]
      }
    },
    // 3. Section slide
    {
      template: 'section',
      data: {
        number: '01',
        title: 'Templates de contenu',
        subtitle: 'Pour présenter vos idées clairement'
      }
    },
    // 4. Bullets slide
    {
      template: 'bullets',
      data: {
        title: 'Template Liste (Bullets)',
        tag: 'Populaire',
        items: [
          'Présentez vos points clés de manière claire',
          'Ajoutez autant d\'éléments que nécessaire',
          'Personnalisez les couleurs des puces',
          'Ajoutez un tag optionnel en haut à droite',
          'Idéal pour les listes de fonctionnalités'
        ]
      }
    },
    // 5. Two-columns slide
    {
      template: 'two-columns',
      data: {
        title: 'Template Deux Colonnes',
        left: {
          title: 'Avantages',
          items: [
            'Organisation claire',
            'Comparaison visuelle',
            'Équilibre du contenu'
          ]
        },
        right: {
          title: 'Cas d\'usage',
          items: [
            'Avant / Après',
            'Pour / Contre',
            'Problème / Solution'
          ]
        }
      }
    },
    // 6. Image-text slide
    {
      template: 'image-text',
      data: {
        title: 'Template Image + Texte',
        image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
        imageAlt: 'Technologie moderne',
        text: 'Combinez visuels et texte pour un impact maximal.\n\nL\'image peut être une URL externe ou un chemin local.\n\nLe texte s\'adapte automatiquement à l\'espace disponible.'
      }
    },
    // 7. Section for data templates
    {
      template: 'section',
      data: {
        number: '02',
        title: 'Templates de données',
        subtitle: 'Visualisez vos chiffres et processus'
      }
    },
    // 8. Stats slide
    {
      template: 'stats',
      data: {
        title: 'Template Statistiques',
        stats: [
          { value: '14', label: 'Templates disponibles', change: '+2 nouveaux' },
          { value: '100%', label: 'Personnalisable', change: 'Couleurs, polices' },
          { value: '∞', label: 'Possibilités', change: 'Sans limite' }
        ]
      }
    },
    // 9. Timeline slide
    {
      template: 'timeline',
      data: {
        title: 'Template Timeline',
        steps: [
          { icon: '1', title: 'Créer', description: 'Choisissez un template' },
          { icon: '2', title: 'Personnaliser', description: 'Ajoutez votre contenu' },
          { icon: '3', title: 'Styliser', description: 'Adaptez les couleurs' },
          { icon: '4', title: 'Exporter', description: 'Partagez votre travail' }
        ]
      }
    },
    // 10. Comparison/Table slide
    {
      template: 'comparison',
      data: {
        title: 'Template Tableau',
        columns: ['Fonctionnalité', 'Basique', 'Pro'],
        rows: [
          ['Templates', '5', '14'],
          ['Thèmes', '1', 'Illimités'],
          ['Export JSON', '✓', '✓'],
          ['Export HTML', '—', '✓'],
          ['Collaboration', '—', '✓']
        ],
        highlightColumn: 3
      }
    },
    // 11. Section for technical templates
    {
      template: 'section',
      data: {
        number: '03',
        title: 'Templates techniques',
        subtitle: 'Pour les développeurs et architectes'
      }
    },
    // 12. Code slide
    {
      template: 'code',
      data: {
        title: 'Template Code',
        filename: 'example.js',
        code: `// Exemple de code JavaScript
function createPresentation(title) {
  return {
    title: title,
    slides: [],
    addSlide(template, data) {
      this.slides.push({ template, data });
      return this;
    }
  };
}

const pres = createPresentation('Ma présentation');
pres.addSlide('title', { title: 'Hello World' });`,
        description: 'Coloration syntaxique automatique pour de nombreux langages'
      }
    },
    // 13. Code-annotated slide
    {
      template: 'code-annotated',
      data: {
        title: 'Template Code Annoté',
        filename: 'api.js',
        startLine: 1,
        showEllipsisAfter: true,
        code: `async function fetchData(endpoint) {
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}\`);
  }

  return response.json();
}`,
        annotations: [
          { line: 1, lineTo: null, title: 'Fonction async', text: 'Permet l\'utilisation de await' },
          { line: 4, lineTo: 6, title: 'Gestion d\'erreur', text: 'Vérifie le status HTTP' },
          { line: 8, lineTo: null, title: 'Retour', text: 'Parse automatiquement le JSON' }
        ]
      }
    },
    // 14. Mermaid slide
    {
      template: 'mermaid',
      data: {
        title: 'Template Mermaid',
        description: 'Diagrammes générés à partir de code',
        diagram: `flowchart LR
    A[Idée] --> B{Faisable?}
    B -->|Oui| C[Développer]
    B -->|Non| D[Repenser]
    D --> A
    C --> E[Tester]
    E --> F{OK?}
    F -->|Oui| G[Déployer]
    F -->|Non| C`
      }
    },
    // 15. Section for other templates
    {
      template: 'section',
      data: {
        number: '04',
        title: 'Autres templates',
        subtitle: 'Citations et diagrammes interactifs'
      }
    },
    // 16. Quote slide
    {
      template: 'quote',
      data: {
        quote: 'La simplicité est la sophistication suprême.',
        authorName: 'Léonard de Vinci',
        authorTitle: 'Artiste et inventeur',
        authorImage: ''
      }
    },
    // 17. Draw.io slide
    {
      template: 'drawio',
      data: {
        title: 'Template Draw.io',
        description: 'Créez des diagrammes interactifs avec l\'éditeur intégré',
        diagram: ''
      }
    },
    // 18. Final title slide
    {
      template: 'title',
      data: {
        title: 'Merci !',
        subtitle: 'Explorez, créez, partagez',
        author: '',
        date: ''
      }
    }
  ]
};

// ============================================================================
// DEFAULT DATA FOR NEW SLIDES
// ============================================================================

export function getDefaultData(template) {
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
    mermaid: { title: 'Diagramme', description: '', diagram: 'flowchart LR\n    A-->B' },
    agenda: { title: 'Agenda', showDuration: true, items: [{ title: 'Introduction', subtitle: '', duration: '5 min' }, { title: 'Sujet principal', subtitle: '', duration: '15 min' }, { title: 'Questions', subtitle: '', duration: '10 min' }] },
    drawio: { title: 'Diagramme Draw.io', description: '', diagram: '' }
  };
  return defaults[template] || { title: 'Nouvelle slide' };
}
