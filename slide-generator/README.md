# Slide Generator

Static HTML presentation generator for the Presentation Builder.

## Structure

This module is split into smaller, maintainable files (all under 400 lines):

- **index.js** (132 lines) - CLI entry point, file I/O, main execution
- **templates.js** (66 lines) - Template registry and shared render functions
- **renderers.js** (367 lines) - Individual template renderers (title, bullets, code, etc.)
- **styles.js** (822 lines) - CSS generation for presentations
- **utils.js** (10 lines) - Utility functions (re-exports from ../utils/)

## Usage

### Command Line

```bash
# Basic usage
node slide-generator/index.js input.json output.html

# Default files (examples/presentation-data.json -> presentation.html)
node slide-generator/index.js
```

### Programmatic

```javascript
const { loadPresentationData, generateHtml, writeOutput } = require('./slide-generator');

const data = loadPresentationData('input.json');
const html = generateHtml(data);
writeOutput('output.html', html, data.slides.length);
```

## Module Dependencies

```
index.js
├── utils.js (escapeHtml)
├── templates.js (generateSlidesHtml)
│   ├── utils.js (escapeHtml)
│   └── renderers.js (all render functions)
│       └── utils.js (escapeHtml, getGitLabLogo)
└── styles.js (CSS_STYLES)

utils.js
├── ../utils/html-utils.cjs (escapeHtml)
└── ../utils/svg-utils.cjs (getGitLabLogo)
```

## Template Renderers

All 13 template types are implemented in `renderers.js`:

1. `title` - Cover slide with title, subtitle, author
2. `section` - Section divider with number
3. `bullets` - Bullet point list with optional tag
4. `two-columns` - Side-by-side columns
5. `image-text` - Image with text content
6. `quote` - Featured citation with author
7. `stats` - Key metrics display
8. `code` - Syntax-highlighted code block
9. `code-annotated` - Code with inline annotations
10. `timeline` - Process steps with icons
11. `comparison` - Data comparison table
12. `mermaid` - Mermaid.js diagrams
13. `drawio` - Draw.io SVG diagrams

## Architecture Notes

- Uses CommonJS (require/module.exports) for Node.js compatibility
- No external dependencies beyond Node.js built-ins (fs, path)
- Utility functions imported from shared utils/ directory
- CSS embedded as string for single-file HTML output
- All HTML content is XSS-safe via escapeHtml()
