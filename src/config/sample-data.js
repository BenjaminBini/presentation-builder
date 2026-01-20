// src/config/sample-data.js
// Sample project data - Showcases all available templates

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
