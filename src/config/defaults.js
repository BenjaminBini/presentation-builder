// src/config/defaults.js
// Default data for new slides

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
