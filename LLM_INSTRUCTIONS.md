# LLM Instructions for Presentation Builder

This document provides instructions for LLMs (Large Language Models) to generate compatible presentation JSON data for this slide editor system.

## Overview

This presentation builder uses a JSON-based format to define slides. Each presentation consists of metadata and an array of slides, where each slide has a `template` type and corresponding `data` fields.

## JSON Structure

```json
{
  "name": "Presentation Name",
  "metadata": {
    "title": "Presentation Title",
    "author": "Author Name",
    "date": "January 2025",
    "version": "1.0"
  },
  "theme": {
    "base": "gitlab",
    "overrides": {}
  },
  "slides": [
    {
      "template": "template-name",
      "data": { ... }
    }
  ]
}
```

## Available Templates

### 1. `title` - Cover Slide
Opening slide with main title and presentation info.

```json
{
  "template": "title",
  "data": {
    "title": "Main Title",
    "subtitle": "Subtitle text",
    "author": "Author Name",
    "date": "January 2025",
    "logo": "https://url-to-logo.png"
  }
}
```

### 2. `section` - Section Divider
Transition slide to introduce a new section.

```json
{
  "template": "section",
  "data": {
    "number": "01",
    "title": "Section Title",
    "subtitle": "Optional subtitle"
  }
}
```

### 3. `bullets` - Bullet List
List of key points with optional tag badge.

```json
{
  "template": "bullets",
  "data": {
    "title": "Slide Title",
    "tag": "Optional Tag",
    "items": [
      "First bullet point",
      "Second bullet point",
      "Third bullet point"
    ]
  }
}
```

### 4. `two-columns` - Two Column Layout
Content organized in two side-by-side columns.

```json
{
  "template": "two-columns",
  "data": {
    "title": "Slide Title",
    "left": {
      "title": "Left Column Title",
      "items": ["Item 1", "Item 2", "Item 3"]
    },
    "right": {
      "title": "Right Column Title",
      "items": ["Item A", "Item B", "Item C"]
    }
  }
}
```

### 5. `image-text` - Image with Text
Image alongside descriptive text.

```json
{
  "template": "image-text",
  "data": {
    "title": "Slide Title",
    "image": "https://url-to-image.jpg",
    "imageAlt": "Image description for accessibility",
    "text": "Paragraph text here.\nSecond paragraph on new line."
  }
}
```

### 6. `quote` - Citation
Featured quote with attribution.

```json
{
  "template": "quote",
  "data": {
    "quote": "The quote text goes here...",
    "authorName": "Author Name",
    "authorTitle": "Job Title or Role",
    "authorImage": "https://url-to-photo.jpg"
  }
}
```

### 7. `stats` - Statistics Display
Key metrics displayed prominently.

```json
{
  "template": "stats",
  "data": {
    "title": "Key Metrics",
    "stats": [
      {
        "value": "10M+",
        "label": "Users",
        "change": "+25%"
      },
      {
        "value": "99.9%",
        "label": "Uptime",
        "change": "+0.1%"
      },
      {
        "value": "50ms",
        "label": "Response Time",
        "change": "-15%"
      }
    ]
  }
}
```

**Note:** The `change` field is optional. Positive values (starting with +) display in green, negative values (starting with -) display in red.

### 8. `code` - Code Block
Simple code display with syntax highlighting appearance.

```json
{
  "template": "code",
  "data": {
    "title": "Code Example",
    "filename": "example.js",
    "code": "function hello() {\n  console.log('Hello World');\n}",
    "description": "Optional description below the code"
  }
}
```

### 9. `code-annotated` - Annotated Code
Code with side annotations pointing to specific lines.

```json
{
  "template": "code-annotated",
  "data": {
    "title": "Code Walkthrough",
    "filename": "app.js",
    "startLine": 1,
    "notEndOfFile": false,
    "code": "const config = {\n  api: 'https://api.example.com',\n  timeout: 5000\n};\n\nfunction fetchData() {\n  return fetch(config.api);\n}",
    "annotations": [
      {
        "line": 1,
        "lineTo": 4,
        "title": "Configuration",
        "text": "Define API settings in a config object"
      },
      {
        "line": 6,
        "title": "Fetch Function",
        "text": "Main data fetching function"
      }
    ]
  }
}
```

**Fields:**
- `startLine`: Line number offset (default: 1). Useful when showing a code snippet from middle of a file.
- `notEndOfFile`: If `true`, shows "..." at the end to indicate more code exists.
- `annotations[].line`: The line number to annotate (required)
- `annotations[].lineTo`: End line for range highlight (optional, defaults to same as `line`)
- `annotations[].title`: Bold title for annotation (optional)
- `annotations[].text`: Description text (required)

### 10. `timeline` - Process/Timeline
Sequential steps or events.

```json
{
  "template": "timeline",
  "data": {
    "title": "Implementation Process",
    "steps": [
      {
        "icon": "1",
        "title": "Planning",
        "description": "Define requirements and scope"
      },
      {
        "icon": "2",
        "title": "Development",
        "description": "Build the solution"
      },
      {
        "icon": "3",
        "title": "Testing",
        "description": "Verify functionality"
      },
      {
        "icon": "4",
        "title": "Deployment",
        "description": "Launch to production"
      }
    ]
  }
}
```

**Note:** The `icon` field can be a number, emoji, or short text (max 3 characters).

### 11. `comparison` - Table/Comparison
Data table with optional column highlighting.

```json
{
  "template": "comparison",
  "data": {
    "title": "Feature Comparison",
    "columns": ["Feature", "Basic", "Pro", "Enterprise"],
    "rows": [
      ["Storage", "5GB", "50GB", "Unlimited"],
      ["Users", "1", "10", "Unlimited"],
      ["Support", false, true, true],
      ["API Access", false, false, true]
    ],
    "highlightColumn": 3
  }
}
```

**Fields:**
- `columns`: Array of column headers
- `rows`: 2D array of cell values
- `highlightColumn`: 1-indexed column to highlight (optional)
- Cell values can be:
  - Strings: Displayed as text
  - `true` or `"true"`: Displays as green checkmark (✓)
  - `false` or `"false"`: Displays as red cross (✗)

### 12. `mermaid` - Diagram
Mermaid.js diagram rendering.

```json
{
  "template": "mermaid",
  "data": {
    "title": "System Architecture",
    "description": "Optional description text",
    "diagram": "flowchart LR\n    A[Client] --> B[API Gateway]\n    B --> C[Service A]\n    B --> D[Service B]\n    C --> E[(Database)]"
  }
}
```

**Supported Mermaid diagram types:**
- `flowchart` / `graph` - Flow diagrams
- `sequenceDiagram` - Sequence diagrams
- `classDiagram` - Class diagrams
- `stateDiagram` - State diagrams
- `erDiagram` - Entity relationship diagrams
- `gantt` - Gantt charts
- `pie` - Pie charts
- `journey` - User journey diagrams

## Theme Configuration

The default theme is GitLab-style. You can override specific colors:

```json
{
  "theme": {
    "base": "gitlab",
    "overrides": {
      "orange": "#FF6B35",
      "dark": "#1A1A2E"
    }
  }
}
```

**Available color keys:**
- `orange`, `orange-dark`, `orange-light` - Primary accent colors
- `dark` - Dark background color
- `gray-100` through `gray-900` - Grayscale palette
- `white` - White color
- `purple`, `blue`, `green`, `green-light`, `red` - Secondary colors

## Best Practices for LLMs

1. **Slide Count:** Aim for 8-15 slides for a typical presentation. Start with a `title` slide.

2. **Section Structure:** Use `section` slides to break up content into logical parts (every 3-4 content slides).

3. **Content Density:** Keep bullet points to 4-6 items maximum per slide.

4. **Statistics:** Use 3 stats per `stats` slide for best visual balance.

5. **Code Blocks:** Keep code snippets under 15-20 lines for readability. Use annotations to explain complex code.

6. **Timeline Steps:** Use 3-5 steps for optimal layout.

7. **Tables:** Keep to 4-5 columns and 4-6 rows for readability.

8. **Images:** Always provide `imageAlt` for accessibility.

9. **Mermaid Diagrams:** Test diagram syntax is valid. Keep diagrams simple for slide visibility.

## Example Complete Presentation

```json
{
  "name": "Product Launch 2025",
  "metadata": {
    "title": "Product Launch 2025",
    "author": "Product Team",
    "date": "January 2025",
    "version": "1.0"
  },
  "theme": {
    "base": "gitlab",
    "overrides": {}
  },
  "slides": [
    {
      "template": "title",
      "data": {
        "title": "Introducing ProductX",
        "subtitle": "The Future of Workflow Automation",
        "author": "Product Team",
        "date": "January 2025"
      }
    },
    {
      "template": "section",
      "data": {
        "number": "01",
        "title": "The Problem",
        "subtitle": "Why we built ProductX"
      }
    },
    {
      "template": "bullets",
      "data": {
        "title": "Current Challenges",
        "tag": "Pain Points",
        "items": [
          "Manual processes waste 40% of team time",
          "Data silos prevent collaboration",
          "No visibility into workflow status",
          "Integration complexity grows exponentially"
        ]
      }
    },
    {
      "template": "stats",
      "data": {
        "title": "Market Opportunity",
        "stats": [
          {"value": "$50B", "label": "Market Size", "change": "+15%"},
          {"value": "73%", "label": "Companies Need Automation", "change": ""},
          {"value": "2.5x", "label": "ROI Potential", "change": ""}
        ]
      }
    },
    {
      "template": "section",
      "data": {
        "number": "02",
        "title": "Our Solution",
        "subtitle": "How ProductX transforms workflows"
      }
    },
    {
      "template": "two-columns",
      "data": {
        "title": "Key Features",
        "left": {
          "title": "Automation",
          "items": ["Visual workflow builder", "AI-powered suggestions", "One-click deployment"]
        },
        "right": {
          "title": "Integration",
          "items": ["500+ connectors", "API-first design", "Real-time sync"]
        }
      }
    },
    {
      "template": "timeline",
      "data": {
        "title": "Implementation Roadmap",
        "steps": [
          {"icon": "1", "title": "Setup", "description": "Connect your tools"},
          {"icon": "2", "title": "Design", "description": "Build workflows visually"},
          {"icon": "3", "title": "Test", "description": "Validate with sandbox"},
          {"icon": "4", "title": "Deploy", "description": "Go live in minutes"}
        ]
      }
    },
    {
      "template": "quote",
      "data": {
        "quote": "ProductX reduced our manual work by 60% in the first month. It's transformed how our team operates.",
        "authorName": "Sarah Chen",
        "authorTitle": "VP of Operations, TechCorp"
      }
    }
  ]
}
```

## File Outputs

The system can generate:
1. **JSON Export** - Portable data format for backup/sharing
2. **Static HTML** - Self-contained presentation file via `generate-slides.js`

## Usage with Node.js

To generate static HTML from JSON:

```bash
node generate-slides.js presentation-data.json output.html
```

Or import and use programmatically:

```javascript
const fs = require('fs');
// ... (see generate-slides.js for full implementation)
```
