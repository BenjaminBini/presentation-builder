# Presentation Builder

A visual slide presentation editor with a GitLab-style theme. Create professional presentations with 13 different slide templates and export to JSON.

## Live Demo

**[Try it live on GitHub Pages](https://benjaminbini.github.io/presentation-builder/slide-editor.html)**

## Features

- **13 Slide Templates**: Cover, Title, Section, Bullets, Two-Columns, Image+Text, Quote, Stats, Code, Code-Annotated, Timeline, Table, Mermaid Diagrams
- **Visual Editor**: Intuitive drag-and-drop interface with live preview
- **Theme Customization**: GitLab-inspired theme with customizable colors
- **Presentation Mode**: Full-screen presentation with keyboard navigation
- **JSON Export/Import**: Portable data format for sharing and backup
- **Local Storage**: Auto-save projects in browser

## Quick Start

### Use the Visual Editor

1. Open `slide-editor.html` in your browser
2. Click "+ Ajouter" to add slides
3. Select a template and edit content
4. Click "Présenter" for presentation mode
5. Export to JSON for backup

## For LLMs / AI Integration

See **[docs/LLM_INSTRUCTIONS.md](docs/LLM_INSTRUCTIONS.md)** for detailed instructions on generating compatible JSON presentations programmatically.

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
      "template": "cover",
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
├── src/                   # JavaScript source modules
│   ├── main.js           # Entry point
│   ├── core/             # State and events (pure logic)
│   ├── services/         # Application services
│   ├── app/              # UI components
│   ├── editor/           # Editor panel
│   ├── inline-editing/   # Live content editing
│   ├── templates/        # Slide templates
│   └── projects/         # Project management
├── styles/               # Modular CSS
├── docs/                 # Documentation
│   ├── LLM_INSTRUCTIONS.md  # AI/LLM integration guide
│   ├── ARCHITECTURE.md   # System architecture
│   └── agents.md         # Agent configuration
├── examples/             # Example presentations
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
| `cover` | Opening slide with split layout accent block |
| `title` | Centered title slide (outro or secondary) |
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
