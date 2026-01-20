# Presentation Builder

Browser-based slide editor. Vanilla JavaScript (ES6+), no build tools.

## Quick Start

```bash
npx live-server .
# Open slide-editor.html
```

## Commands

```bash
# Generate static HTML
node slide-generator/index.js examples/presentation-data.json output.html
```

## Architecture

Event-driven, layered architecture:

```
UI (app/, editor/, inline-editing/) → subscribes to events
Services (services/)                → orchestrates + emits events
Domain (core/state/, core/events/)  → pure logic, no DOM
Infrastructure (projects/, utils/)
```

## Key Imports

```javascript
// State operations
import { getState, setState, getProject, getSlides } from './core/state/index.js';

// Event operations
import { emit, on, EventTypes } from './core/events/index.js';

// Services
import { loadProject, saveProject } from './services/project-service.js';
import { selectSlide, addSlide, updateSlideField } from './services/slide-service.js';
```

## Code Style

- Vanilla JS only (no frameworks)
- ES6+ modules with native import/export
- Event-driven component communication
- Files under 500 lines
- CSS files under 400 lines

## Key Directories

| Path | Purpose |
|------|---------|
| `src/core/` | Pure domain logic (state, events) |
| `src/services/` | Application services layer |
| `src/app/` | UI components |
| `src/editor/` | Editor panel modules |
| `src/templates/` | Slide template system |
| `styles/` | Modular CSS |

## Common Tasks

### Add New Slide Template
1. Create renderer in `src/templates/components/`
2. Add field schema in `src/editor/panel.js`
3. Add preview styles in `src/templates/preview-styles.js`
4. Add export styles in `src/projects/export-css.js`

### Fix Styling
- Design tokens: `styles/base/variables.css`
- UI components: `styles/components/`
- Slide templates: `styles/templates/`

## Rules

See `.claude/rules/` for detailed patterns:
- `testing.md` - Browser testing with Claude in Chrome MCP
- `templates.md` - Slide template creation checklist
- `events.md` - Event system usage patterns
- `layers.md` - Layer boundaries and imports
- `css.md` - CSS conventions and file locations

## References

- @docs/LLM_INSTRUCTIONS.md - JSON format for AI-generated presentations
- @README.md - User-facing documentation
