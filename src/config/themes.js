// src/config/themes.js
// Theme definitions, color palettes, and color labels

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
