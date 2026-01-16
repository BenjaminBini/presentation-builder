# Presentation Builder

A visual slide presentation editor with a GitLab-style theme. Create professional presentations with 12 different slide templates, export to JSON, and generate static HTML.

## Live Demo

**[Try it live on GitHub Pages](https://benjaminbini.github.io/presentation-builder/slide-editor.html)**

## Features

- **12 Slide Templates**: Title, Section, Bullets, Two-Columns, Image+Text, Quote, Stats, Code, Code-Annotated, Timeline, Table, Mermaid Diagrams
- **Visual Editor**: Intuitive drag-and-drop interface with live preview
- **Theme Customization**: GitLab-inspired theme with customizable colors
- **Presentation Mode**: Full-screen presentation with keyboard navigation
- **JSON Export/Import**: Portable data format for sharing and backup
- **Static HTML Generation**: Generate standalone HTML presentations
- **Local Storage**: Auto-save projects in browser

## Quick Start

### Use the Visual Editor

1. Open `slide-editor.html` in your browser
2. Click "+ Ajouter" to add slides
3. Select a template and edit content
4. Click "Présenter" for presentation mode
5. Export to JSON for backup

### Generate Static HTML (Node.js)

```bash
node slide-generator/index.js presentation-data.json output.html
```

## For LLMs / AI Integration

See **[LLM_INSTRUCTIONS.md](LLM_INSTRUCTIONS.md)** for detailed instructions on generating compatible JSON presentations programmatically.

### Quick JSON Example

```json
{
  "name": "My Presentation",
  "metadata": {
    "title": "My Presentation",
    "author": "Author",
    "date": "2025"
  },
  "theme": { "base": "gitlab" },
  "slides": [
    {
      "template": "title",
      "data": {
        "title": "Welcome",
        "subtitle": "Introduction to our topic"
      }
    },
    {
      "template": "bullets",
      "data": {
        "title": "Key Points",
        "items": ["Point 1", "Point 2", "Point 3"]
      }
    }
  ]
}
```

## File Structure

```
├── slide-editor.html      # Main editor interface
├── slide-editor-*.js      # Editor JavaScript modules
├── slide-editor-*.css     # Editor styles
├── slide-generator/       # Static HTML generator (Node.js)
│   ├── index.js          # CLI entry point
│   ├── templates.js      # Template registry
│   ├── renderers.js      # Template renderers
│   ├── styles.js         # CSS styles
│   └── utils.js          # Utility functions
├── presentation-data.json # Example presentation
├── LLM_INSTRUCTIONS.md    # AI/LLM integration guide
└── README.md             # This file
```

## Keyboard Shortcuts (Presentation Mode)

| Key | Action |
|-----|--------|
| `→` `↓` `Space` `PageDown` | Next slide |
| `←` `↑` `PageUp` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |
| `Escape` | Exit presentation |

## Templates Reference

| Template | Description |
|----------|-------------|
| `title` | Cover slide with title, subtitle, author |
| `section` | Section divider with number |
| `bullets` | Bullet point list |
| `two-columns` | Side-by-side columns |
| `image-text` | Image with text |
| `quote` | Featured citation |
| `stats` | Key metrics display |
| `code` | Code block |
| `code-annotated` | Code with annotations |
| `timeline` | Process steps |
| `comparison` | Data table |
| `mermaid` | Mermaid.js diagrams |

## License

MIT License
