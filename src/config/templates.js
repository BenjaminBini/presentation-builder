// src/config/templates.js
// Template definitions

import { ICONS } from './icons.js';

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
  },
  text: {
    name: 'Texte',
    icon: ICONS.text,
    fields: [
      { key: 'title', label: 'Titre', type: 'text', required: true },
      { key: 'content', label: 'Contenu', type: 'wysiwyg', required: true, hint: 'Cliquez pour ouvrir l\'éditeur de texte riche' }
    ]
  }
};
