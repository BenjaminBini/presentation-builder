# Fix Prompts for Code Review Issues

Copy-paste these prompts into fresh Claude Code sessions to fix the issues identified in the code review.

---

## PROMPT 1: Critical Security & Bug Fixes (Immediate Priority)

```
Fix critical security and bug issues in the presentation-builder codebase.

Read docs/CODE_REVIEW_2026-01-20.md first for context.

**Issues to fix:**

1. **SEC-001: XSS in renderer.js:61**
   - File: src/templates/renderer.js
   - The default case interpolates `template` without escaping
   - Fix: Use escapeHtml(template) - import from utils/html.js

2. **BUG-002: Array corruption in store.js:145-163**
   - File: src/core/state/store.js
   - The set() method uses object spread on arrays, corrupting them
   - Fix: Check Array.isArray() and use [...array] for arrays

3. **BUG-001: Race condition in sync.js:66-172**
   - File: src/drive/sync.js
   - pendingSync overwrites previous pending changes
   - Fix: Implement a queue array instead of single pendingSync value

4. **BUG-003: Infinite loop in sync.js:167**
   - File: src/drive/sync.js
   - Object reference comparison causes infinite re-queuing
   - Fix: Compare by project.id instead of object reference

After fixing, verify:
- No syntax errors
- escapeHtml is properly imported
- Array operations work correctly in state store
- Sync queue properly accumulates and processes changes
```

---

## PROMPT 2: Drive Auth & Sync Bug Fixes

```
Fix authentication and sync bugs in the presentation-builder codebase.

Read docs/CODE_REVIEW_2026-01-20.md for context.

**Issues to fix:**

1. **BUG-004: Token refresh race condition in auth.js:263-279**
   - File: src/drive/auth.js
   - Concurrent ensureValidToken() calls corrupt callback chain
   - Fix: Implement promise-based mutex pattern:
     - Add a _refreshPromise property
     - If refresh is in progress, return existing promise
     - Only start new refresh if none in progress

2. **BUG-007: Undefined reference in sync.js:227-235**
   - File: src/drive/sync.js
   - Direct references to global functions cause ReferenceError
   - Fix: Import functions properly or use window.functionName with proper guards

3. **SEC-002: Token storage (informational)**
   - File: src/drive/auth.js:113-116
   - Document why sessionStorage is used and security implications
   - Add comment explaining the trade-off

After fixing:
- Test auth flow doesn't hang on concurrent requests
- Verify conflict resolution doesn't throw errors
```

---

## PROMPT 3: Inline Editing Bug Fixes

```
Fix inline editing bugs in the presentation-builder codebase.

Read docs/CODE_REVIEW_2026-01-20.md for context.

**Issues to fix:**

1. **BUG-005: Memory leak in core.js:66-104**
   - File: src/inline-editing/core.js
   - Event listeners accumulate on repeated init/destroy cycles
   - Fix: Move bound handler creation inside the initialization check
   - Ensure destroy() properly removes all listeners

2. **BUG-006: Null check after access in list-table-manager.js:28-35**
   - File: src/inline-editing/list-table-manager.js
   - Null check happens after array access
   - Fix: Check before accessing: if (!target || target[key] === undefined) return;

3. **SEC-005: Prototype pollution in data-updates.js:32-44**
   - File: src/inline-editing/data-updates.js
   - No validation against __proto__, constructor, prototype keys
   - Fix: Add validation at start of function:
     const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
     if (keys.some(k => dangerousKeys.includes(k))) {
       console.warn('Invalid field key detected');
       return data;
     }

After fixing:
- Verify inline editing works correctly
- Test list item deletion with incomplete data structures
```

---

## PROMPT 4: Security Hardening

```
Apply security hardening to the presentation-builder codebase.

Read docs/CODE_REVIEW_2026-01-20.md for context.

**Issues to fix:**

1. **SEC-003: postMessage wildcard origin in drawio-editor.js:63,72**
   - File: src/inline-editing/drawio-editor.js
   - Replace '*' with 'https://embed.diagrams.net' for all postMessage calls

2. **SEC-004: JSON import validation in import-export.js:36-46**
   - File: src/projects/import-export.js
   - Add comprehensive validation:
     - Check maximum file size (e.g., 10MB)
     - Validate slides array length (e.g., max 500)
     - Validate string field lengths
     - Add try-catch with specific error messages

3. **LOW-002: SVG data URL handling in html.js**
   - File: src/utils/html.js
   - Add comment documenting that SVGs are safe in <img> tags
   - Consider adding SVG sanitization if SVGs are ever rendered as HTML

After fixing:
- Test Draw.io integration still works
- Test JSON import with various file sizes
- Verify image loading still works with data URLs
```

---

## PROMPT 5: CLAUDE.md Compliance - Split Large Files

```
Verify and complete file splitting for CLAUDE.md 500-line compliance. Execute without stopping.

**COMP-001: Files must be under 500 lines**

**STEP 1: Check current line counts**
Run: wc -l src/projects/manager.js src/app/theme.js

**STEP 2: If manager.js > 500 lines, split it**
- Create src/projects/modals.js if it doesn't exist
- Move these functions to modals.js:
  - openProjectModal, closeProjectModal
  - openSaveProjectModal, closeSaveProjectModal
  - saveProjectWithName, validateSaveProjectName
  - renderProjectList, loadProject, deleteProject
- Add proper imports/exports
- Update manager.js to import and re-export from modals.js

**STEP 3: If theme.js > 500 lines, split it**
- Create src/app/color-picker.js if it doesn't exist
- Move these functions to color-picker.js:
  - hsvToRgb, rgbToHsv, hexToRgb, rgbToHex
  - drawColorSpectrum, initColorSpectrum
  - updateFromSpectrum, updateFromHue
  - validateAndApplyHex, renderThemeColorDropdown
  - toggleThemeColorPicker and related handlers
  - All color picker state variables
- Add proper imports/exports
- Update theme.js to import and re-export from color-picker.js

**STEP 4: Verify final line counts**
Run: wc -l src/projects/manager.js src/app/theme.js
Both must be under 500 lines.

If files are already under 500 lines, report success and skip splitting.
```

---

## PROMPT 6: CLAUDE.md Compliance - File Organization

```
Fix file organization to comply with CLAUDE.md rules.

Read docs/CODE_REVIEW_2026-01-20.md for context.

**COMP-002: Working files in root folder**

CLAUDE.md states: "NEVER save working files to root folder"

1. **Move demo-all-templates.json**
   - From: /demo-all-templates.json
   - To: /examples/demo-all-templates.json
   - Update any references in code

2. **Move presentation-data.json**
   - From: /presentation-data.json
   - To: /examples/presentation-data.json
   - Update any references in code

3. **Move remove.sh**
   - From: /remove.sh
   - To: /scripts/remove.sh
   - Update any references

4. **Create directories if needed**
   - mkdir -p examples scripts

After moving:
- Verify the app still loads sample data correctly
- Update any hardcoded paths in the codebase
- Check .gitignore if needed
```

---

## PROMPT 7: Architecture - Eliminate Window Globals (Large Task)

```
Refactor to eliminate window global anti-pattern in presentation-builder. Execute ALL phases without stopping.

Read docs/CODE_REVIEW_2026-01-20.md for context.

**ARCH-001: Eliminate window.* globals - EXECUTE ALL STEPS**

**PHASE 1: Replace config constants (do this first)**
Files using window.TEMPLATES or window.THEMES:
- Add: import { TEMPLATES } from '../config/templates.js';
- Add: import { THEMES } from '../config/themes.js';
- Replace all window.TEMPLATES with TEMPLATES
- Replace all window.THEMES with THEMES

**PHASE 2: Replace state access**
Files using window.currentProject or window.getProject:
- Add: import { getProject } from '../core/state/index.js';
- Replace window.currentProject with getProject()
- Replace window.getProject?.() with getProject()

**PHASE 3: Create and use UI refresh utility**
1. Create src/app/ui-refresh.js:
   import { emit, EventTypes } from '../core/events/index.js';
   export function refreshUI() { emit(EventTypes.UI_REFRESH_REQUESTED); }
   export function refreshSlideList() { emit(EventTypes.SLIDE_LIST_CHANGED); }
   export function refreshEditor() { emit(EventTypes.EDITOR_REFRESH_REQUESTED); }
   export function refreshPreview() { emit(EventTypes.PREVIEW_REFRESH_REQUESTED); }

2. In files with window.renderSlideList, window.renderEditor, window.updatePreview:
   - Import from ui-refresh.js
   - Replace window.renderSlideList?.() with refreshSlideList()
   - Replace window.renderEditor?.() with refreshEditor()
   - Replace window.updatePreview?.() with refreshPreview()

**PHASE 4: Replace remaining function calls**
For window.markAsChanged:
- Import: import { markAsChanged } from '../core/state/actions.js';
- Replace window.markAsChanged?.() with markAsChanged()

For window.closeModal:
- Import from appropriate module or keep with guard if truly global

**PHASE 5: Clean up main.js exports**
- Remove unnecessary window.* assignments from main.js
- Keep only those needed for HTML onclick handlers

Execute all phases. Do not stop to ask. Fix all occurrences systematically file by file.
```

---

## PROMPT 8: Architecture - Consolidate Duplicates

```
Remove duplicate code in the presentation-builder codebase. Execute ALL steps without stopping.

**ARCH-002: Fix duplicate THEME_COLOR_KEYS**

1. In src/app/theme.js around line 73:
   - DELETE the local THEME_COLOR_KEYS array definition
   - ADD at top: import { THEME_COLOR_KEYS } from '../services/theme-service.js';
   - Keep the single source in theme-service.js

**ARCH-003: Fix duplicate project creation functions**

1. In src/main.js around line 179:
   - DELETE the local createEmptyProject() function
   - ADD at top imports: import { createEmptyProject } from './services/project-service.js';
   - Update window.createEmptyProject assignment to use imported function

2. In src/projects/manager.js around line 127:
   - Modify createNewProject() to use project-service.js:
   - ADD: import { createEmptyProject, createNewProject as createProjectFromService } from '../services/project-service.js';
   - Replace internal project creation logic with call to createProjectFromService()
   - Keep only the UI confirmation logic in manager.js

**ARCH-006: Fix core layer importing UI functions**

1. In src/core/state.js:
   - REMOVE re-exports of: showUnsavedAlert, hideUnsavedAlert, dismissUnsavedAlert, updateSaveButtonState
   - These should NOT be exported from core layer

2. Find all files importing these from core/state.js:
   - grep -r "showUnsavedAlert\|hideUnsavedAlert\|dismissUnsavedAlert\|updateSaveButtonState" src/ --include="*.js"
   - Update each to import from '../app/state-ui.js' instead

**VERIFICATION:**
Run these to confirm no duplicates:
- grep -r 'THEME_COLOR_KEYS.*=' src/ --include='*.js' | grep -v import
- grep -r 'function createEmptyProject' src/ --include='*.js'

Execute all steps. Do not stop to ask.
```

---

## PROMPT 9: Architecture - Service Layer Consistency

```
Make the app layer consistently use the service layer. Execute ALL steps without stopping.

**ARCH-004: App layer must use services instead of direct state mutation**

**FILE 1: src/app/slides/management.js**

1. Update imports at top:
   import { addSlide, deleteSlide, duplicateSlide, moveSlide } from '../../services/slide-service.js';

2. In addSlideToPresentation() around line 29-33:
   - REMOVE: currentProject.slides.splice(insertIndex, 0, newSlide);
   - REMOVE: setSelectedSlideIndex(insertIndex);
   - REPLACE WITH: addSlide(template, defaultData, insertIndex);
   - The service handles state and events

3. In deleteSlideFromPresentation() around line 47-49:
   - REMOVE: currentProject.slides.splice(index, 1);
   - REMOVE: the selectedSlideIndex adjustment
   - REPLACE WITH: deleteSlide(index);

4. In duplicateCurrentSlide() around line 60-62:
   - REMOVE: const copy = JSON.parse(...); currentProject.slides.splice(...)
   - REPLACE WITH: duplicateSlide(index);

5. In handleDrop() around line 103-104:
   - REMOVE: const [removed] = currentProject.slides.splice(draggedIndex, 1);
   - REMOVE: currentProject.slides.splice(targetIndex, 0, removed);
   - REPLACE WITH: moveSlide(draggedIndex, targetIndex);

6. Remove redundant markAsChanged() calls - services handle this

**FILE 2: src/app/theme.js**

1. Update imports:
   import { setThemeColor, applyTheme, getThemeColorValue } from '../services/theme-service.js';

2. Replace direct theme mutations with service calls:
   - Use setThemeColor(colorKey, hexValue) instead of direct override assignment
   - Use applyTheme(themeName) instead of direct theme switching

**FILE 3: src/projects/manager.js**

1. Verify it uses project-service.js for:
   - createEmptyProject() - should import from service
   - Project save/load - can stay in manager for now (storage concerns)

**VERIFICATION:**
After changes, grep should find NO direct .splice() on slides:
grep -n 'slides.splice' src/app/slides/management.js

Execute all steps. Do not stop to ask.
```

---

## Quick Reference: Issue IDs

| ID | File | Line | Severity |
|----|------|------|----------|
| SEC-001 | src/templates/renderer.js | 61 | CRITICAL |
| BUG-001 | src/drive/sync.js | 66-172 | HIGH |
| BUG-002 | src/core/state/store.js | 145-163 | HIGH |
| BUG-003 | src/drive/sync.js | 167 | HIGH |
| BUG-004 | src/drive/auth.js | 263-279 | HIGH |
| BUG-005 | src/inline-editing/core.js | 66-104 | MEDIUM |
| BUG-006 | src/inline-editing/list-table-manager.js | 28-35 | MEDIUM |
| BUG-007 | src/drive/sync.js | 227-235 | MEDIUM |
| SEC-002 | src/drive/auth.js | 113-116 | MEDIUM |
| SEC-003 | src/inline-editing/drawio-editor.js | 63, 72 | MEDIUM |
| SEC-004 | src/projects/import-export.js | 36-46 | MEDIUM |
| SEC-005 | src/inline-editing/data-updates.js | 32-44 | MEDIUM |
| COMP-001 | src/projects/manager.js, src/app/theme.js | - | MEDIUM |
| COMP-002 | root folder files | - | MEDIUM |
| ARCH-001 | 30 files | - | HIGH |
| ARCH-002 | theme-service.js, theme.js | - | MEDIUM |
| ARCH-003 | main.js, project-service.js, manager.js | - | MEDIUM |
| ARCH-004 | app layer files | - | MEDIUM |
