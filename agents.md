# Presentation Builder - Agent Configuration

This document describes the specialized agents available for developing and maintaining the Presentation Builder project.

## Project Overview

**Presentation Builder** is a browser-based visual presentation editor built with vanilla JavaScript and modular CSS. Key components include:

- 12 slide templates with live preview
- Inline content editing system
- Theme customization
- JSON/HTML export
- localStorage persistence

### Quick Start

```bash
# No external dependencies - just serve the root folder
npx live-server .

# Or any static server
python -m http.server 8080
```

Open `slide-editor.html` in browser.

---

## Available Agents

### Core Development Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `coder` | General implementation | New features, bug fixes, template creation |
| `frontend-developer` | UI/UX development | Component styling, responsive design, CSS work |
| `tester` | Test creation | Unit tests, integration tests, E2E scenarios |
| `reviewer` | Code review | Quality assurance, architecture consistency |
| `planner` | Task planning | Feature breakdown, implementation strategy |
| `researcher` | Investigation | Explore codebase, find patterns, analyze dependencies |

### Specialized Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `system-architect` | Architecture design | Template system extensions, major refactoring |
| `code-analyzer` | Code analysis | Complexity reduction, pattern identification |
| `performance-benchmarker` | Performance optimization | Export optimization, rendering speed |
| `api-docs` | Documentation | Template docs, LLM instructions |
| `cicd-engineer` | Build automation | Test pipelines, deployment scripts |

### Browser Automation

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `agent-browser` | Browser automation | E2E testing, UI verification, form testing, screenshots |

---

## Browser Automation (agent-browser)

The `agent-browser` skill provides headless browser automation for testing and verification.

### Quick Reference

```bash
# Navigation
agent-browser open <url>          # Navigate to page
agent-browser back                # Go back
agent-browser forward             # Go forward
agent-browser reload              # Reload page
agent-browser close               # Close browser

# Page Analysis
agent-browser snapshot -i         # Get interactive elements with refs (@e1, @e2...)
agent-browser snapshot -c         # Compact output

# Interactions (use @refs from snapshot)
agent-browser click @e1           # Click element
agent-browser fill @e2 "text"     # Fill input field
agent-browser type @e2 "text"     # Type without clearing
agent-browser press Enter         # Press key
agent-browser hover @e1           # Hover over element
agent-browser select @e1 "value"  # Select dropdown option

# Get Information
agent-browser get text @e1        # Get element text
agent-browser get value @e1       # Get input value
agent-browser get title           # Get page title
agent-browser get url             # Get current URL

# Screenshots
agent-browser screenshot          # Screenshot to stdout
agent-browser screenshot path.png # Save to file
agent-browser screenshot --full   # Full page screenshot

# Wait
agent-browser wait @e1            # Wait for element
agent-browser wait 2000           # Wait milliseconds
agent-browser wait --text "text"  # Wait for text to appear
```

### Presentation Builder Testing Examples

#### Test Slide Creation
```bash
# Open the editor
agent-browser open file:///path/to/slide-editor.html
agent-browser snapshot -i

# Click "Add Slide" button
agent-browser click @e1  # ref for .btn-add-slide

# Take screenshot of result
agent-browser screenshot slides-added.png
```

#### Test Project Save Modal
```bash
agent-browser open file:///path/to/slide-editor.html
agent-browser snapshot -i

# Click save status to open modal
agent-browser click @e5  # ref for save-status

# Fill project name
agent-browser snapshot -i
agent-browser fill @e10 "Test Project"
agent-browser click @e11  # Confirm button
```

#### Test Template Selection
```bash
agent-browser open file:///path/to/slide-editor.html
agent-browser snapshot -i

# Open template selector
agent-browser click @e3  # Template dropdown

agent-browser snapshot -i
agent-browser click @e15  # Select "Timeline" template

# Verify template changed
agent-browser screenshot template-changed.png
```

#### Test Inline Editing
```bash
agent-browser open file:///path/to/slide-editor.html
agent-browser snapshot -i

# Click on editable text in preview
agent-browser click @e20  # Editable title element

# Type new content
agent-browser type @e20 "New Slide Title"
agent-browser press Enter

# Verify change
agent-browser get text @e20
```

#### Test Theme Color Change
```bash
agent-browser open file:///path/to/slide-editor.html
agent-browser snapshot -i

# Open settings panel and find color picker
agent-browser click @e8  # Color picker

agent-browser snapshot -i
agent-browser click @e25  # Select new color

# Screenshot to verify
agent-browser screenshot --full theme-changed.png
```

### Workflow Pattern

1. **Navigate**: `agent-browser open <url>`
2. **Snapshot**: `agent-browser snapshot -i` (get element refs)
3. **Interact**: Use refs from snapshot (`@e1`, `@e2`, etc.)
4. **Re-snapshot**: After DOM changes, get new refs
5. **Verify**: Screenshot or get text/values

### Debugging

```bash
agent-browser open example.com --headed  # Show browser window
agent-browser console                    # View console messages
agent-browser errors                     # View page errors
```

### Sessions (Parallel Browsers)

```bash
agent-browser --session test1 open site-a.com
agent-browser --session test2 open site-b.com
agent-browser session list
```

---

## Project-Specific Workflows

### 1. New Slide Template

```
Agents: planner → coder → frontend-developer → tester → reviewer
```

**Steps:**
1. **planner**: Design template structure and field schema
2. **coder**: Implement renderer in `/templates/components/`
3. **frontend-developer**: Add styles in `/styles/templates/`
4. **tester**: Create template tests
5. **reviewer**: Validate consistency with existing templates

**Files involved:**
- `/templates/components/*.js` - Template renderer
- `/editor/panel.js` - Field configuration
- `/templates/preview-styles.js` - Preview CSS
- `/styles/templates/` - Editor styles

### 2. Editor Enhancement

```
Agents: researcher → planner → coder → tester
```

**Steps:**
1. **researcher**: Analyze current editor implementation
2. **planner**: Design enhancement approach
3. **coder**: Implement in `/editor/` or `/inline-editing/`
4. **tester**: Validate editor interactions

**Key directories:**
- `/editor/fields/` - Field input components
- `/editor/handlers.js` - Event handlers
- `/inline-editing/` - Live content editing

### 3. Styling & Theme Updates

```
Agents: frontend-developer → reviewer
```

**Steps:**
1. **frontend-developer**: Update CSS variables and components
2. **reviewer**: Check cross-browser consistency

**Key files:**
- `/styles/base/variables.css` - Design tokens
- `/styles/components/` - UI component styles
- `/templates/theme.js` - Template theming

### 4. Export System

```
Agents: coder → tester → performance-benchmarker
```

**Files involved:**
- `/projects/export-*.js` - Export modules
- `/slide-generator/` - Node.js static generator

### 5. Bug Investigation

```
Agents: researcher → coder → tester
```

**Steps:**
1. **researcher**: Identify root cause and affected files
2. **coder**: Implement fix
3. **tester**: Add regression test

---

## Directory Reference

```
presentation-builder/
├── app/                    # Application state & initialization
│   ├── state.js           # Global state management
│   ├── theme.js           # Theme color system
│   └── slides/            # Slide operations
├── editor/                 # Content editor modules
│   ├── panel.js           # Main editor panel
│   ├── handlers.js        # Event handlers
│   ├── template-settings.js
│   └── fields/            # Field input components
├── inline-editing/         # Live content editing
│   ├── core.js
│   ├── text-editor.js
│   └── code-editor.js
├── templates/              # Slide template system
│   ├── components/        # Template renderers
│   ├── theme.js
│   └── preview-styles.js
├── styles/                 # Modular CSS (~4,800 lines)
│   ├── base/              # Design tokens
│   ├── layout/            # Layout system
│   ├── components/        # UI components
│   └── templates/         # Slide-specific styles
├── projects/               # Project management
│   ├── manager.js         # CRUD operations
│   └── export-*.js        # Export modules
├── slide-generator/        # Node.js static generator
├── utils/                  # Shared utilities
└── tests/                  # Test suites
```

---

## Agent Usage Examples

### Create New Feature

```javascript
// Use Task tool with appropriate agent
Task("Implement timeline animation",
     "Add entrance animations to timeline template items in /templates/components/data.js",
     "coder")
```

### Fix Styling Issue

```javascript
Task("Fix button hover states",
     "Update .btn-primary hover styles in /styles/components/buttons.css to match design spec",
     "frontend-developer")
```

### Investigate Bug

```javascript
Task("Find autosave issue",
     "Investigate why autosave fails on large projects. Check app/state.js and projects/manager.js",
     "researcher")
```

### Code Review

```javascript
Task("Review template PR",
     "Review new comparison template for consistency with existing patterns",
     "reviewer")
```

---

## Parallel Agent Execution

For complex tasks, spawn multiple agents in a single message:

```javascript
// Single message with parallel agents
Task("Analyze template system", "...", "researcher")
Task("Review CSS architecture", "...", "code-analyzer")
Task("Check test coverage", "...", "tester")
```

---

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with custom properties
- **Data**: JSON format
- **Storage**: localStorage
- **Generation**: Node.js
- **Diagrams**: Mermaid.js, Draw.io

---

## Best Practices

1. **Always use researcher first** for unfamiliar areas
2. **Spawn agents in parallel** when tasks are independent
3. **Use frontend-developer** for any CSS/styling work
4. **Use coder** for JavaScript logic implementation
5. **Always include tester** for new features
6. **Use reviewer** before merging significant changes

---

## Common Patterns

### Template Registration
Templates are registered in `/templates/components/` and require:
- Renderer function
- Field schema in `editor/panel.js`
- Preview styles in `preview-styles.js`
- Export styles in `projects/export-css.js`

### State Updates
All state changes go through `app/state.js`:
- `currentProject` - Active project data
- `selectedSlideIndex` - Current slide
- UI state flags

### Event Handling
Editor events are managed in:
- `editor/handlers.js` - Panel events
- `inline-editing/core.js` - Live editing events
