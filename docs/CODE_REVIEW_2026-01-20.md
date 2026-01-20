# Full Codebase Code Review: presentation-builder

**Date:** 2026-01-20
**Reviewer:** Claude Code (Opus 4.5)
**Codebase:** ~12,139 LOC across 78 ES6 modules

---

## Executive Summary

This is a **vanilla JavaScript ES6 module presentation editor** with Google Drive integration. The codebase shows good architectural intentions but has several issues that need attention.

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Bugs | 3 | 4 | - | - |
| Security | 1 | - | 4 | 3 |
| CLAUDE.md Compliance | - | 2 | 3 | - |
| Architecture | - | 2 | 5 | 3 |

---

## CRITICAL & HIGH SEVERITY ISSUES

### 1. XSS Vulnerability in Template Renderer
**File:** `src/templates/renderer.js:61`
**Severity:** CRITICAL (Security)
**ID:** SEC-001

```javascript
default:
  return `<div class="slide-content">Template inconnu: ${template}</div>`;
```

The `template` variable is directly interpolated without escaping. A malicious imported JSON file could inject arbitrary HTML/JavaScript.

**Fix:** Use `escapeHtml(template)` for the default case.

---

### 2. Race Condition Causing Data Loss in Drive Sync
**File:** `src/drive/sync.js:66-172`
**Severity:** HIGH (Bug)
**ID:** BUG-001

```javascript
if (this.isSyncing) {
  this.pendingSync = project; // Overwrites any previously pending sync
  return;
}
```

If sync is called rapidly (A, B, C), B's changes are overwritten by C and lost.

**Fix:** Implement a proper queue system instead of single pending value.

---

### 3. Array Corruption in State Store
**File:** `src/core/state/store.js:145-163`
**Severity:** HIGH (Bug)
**ID:** BUG-002

```javascript
current[keys[i]] = { ...current[keys[i]] }; // Only clones objects, not arrays
```

Using spread on arrays creates objects with numeric keys, breaking array methods. Setting `'project.slides.0.data'` corrupts the slides array.

**Fix:** Check `Array.isArray()` before spread and use `[...array]` for arrays.

---

### 4. Infinite Loop in Sync Re-queuing
**File:** `src/drive/sync.js:167`
**Severity:** HIGH (Bug)
**ID:** BUG-003

```javascript
if (this.pendingSync && this.pendingSync !== project) {
```

Object reference comparison always returns true for different objects with identical data, causing infinite sync loops.

**Fix:** Compare by project ID or use deep equality check.

---

### 5. Token Expiration Race Condition
**File:** `src/drive/auth.js:263-279`
**Severity:** HIGH (Bug)
**ID:** BUG-004

```javascript
const originalCallback = this.tokenClient.callback;
this.tokenClient.callback = (response) => {
  this.tokenClient.callback = originalCallback;
  // ...
};
```

Concurrent calls to `ensureValidToken()` corrupt the callback chain, causing auth hangs.

**Fix:** Use a promise-based mutex/lock pattern.

---

### 6. CLAUDE.md Violation: Files Over 500 Lines
**Severity:** MEDIUM (Compliance)
**ID:** COMP-001

| File | Lines | Over Limit |
|------|-------|------------|
| `src/projects/manager.js` | 599 | +99 lines |
| `src/app/theme.js` | 591 | +91 lines |

CLAUDE.md requires: "Modular Design: Files under 500 lines"

**Fix:**
- Split `manager.js` - extract modal functions to `src/projects/modals.js`
- Split `theme.js` - extract color picker to `src/app/color-picker.js`

---

### 7. Window Global Anti-Pattern (214 occurrences)
**Severity:** HIGH (Architecture)
**ID:** ARCH-001

The codebase heavily relies on `window.*` globals instead of ES6 imports:

```javascript
// src/app/theme.js
const getCurrentProject = () => window.currentProject;
const markAsChanged = () => window.markAsChanged && window.markAsChanged();
```

**Fix:** Replace with proper ES6 imports from state/services.

---

## MEDIUM SEVERITY ISSUES

### Security Issues

| ID | Issue | File | Line |
|----|-------|------|------|
| SEC-002 | OAuth tokens stored in sessionStorage (XSS accessible) | `src/drive/auth.js` | 113-116 |
| SEC-003 | postMessage uses wildcard origin `'*'` | `src/inline-editing/drawio-editor.js` | 63, 72 |
| SEC-004 | Minimal JSON import validation (DoS risk) | `src/projects/import-export.js` | 36-46 |
| SEC-005 | Prototype pollution risk in nested updates | `src/inline-editing/data-updates.js` | 32-44 |

### Bug Issues

| ID | Issue | File | Line |
|----|-------|------|------|
| BUG-005 | Memory leak - event listeners accumulate | `src/inline-editing/core.js` | 66-104 |
| BUG-006 | Null check after access in list operations | `src/inline-editing/list-table-manager.js` | 28-35 |
| BUG-007 | Undefined reference in conflict resolution | `src/drive/sync.js` | 227-235 |

### Architecture Issues

| ID | Issue | Description |
|----|-------|-------------|
| ARCH-002 | Duplicate THEME_COLOR_KEYS | Defined in both `src/services/theme-service.js` and `src/app/theme.js` |
| ARCH-003 | Duplicate project creation logic | Three implementations in `main.js`, `project-service.js`, `manager.js` |
| ARCH-004 | Service layer bypassed | App layer directly mutates state instead of using services |
| ARCH-005 | Core layer imports UI functions | `src/core/state.js` re-exports DOM helpers |
| ARCH-006 | Code comment violation | `src/templates/theme.js` violates its own "pure" design comment |

### CLAUDE.md Compliance

| ID | Issue | Files |
|----|-------|-------|
| COMP-002 | Working files in root folder | `demo-all-templates.json`, `presentation-data.json`, `remove.sh` |

---

## LOW SEVERITY ISSUES

| ID | Issue | File |
|----|-------|------|
| LOW-001 | Placeholder OAuth credentials | `src/drive/config.js` |
| LOW-002 | SVG data URLs allowed (potential XSS) | `src/utils/html.js` |
| LOW-003 | Empty `exportToHtml()` function | `src/main.js` |
| LOW-004 | Unused service functions | `src/services/slide-service.js` |
| LOW-005 | @ts-ignore comments (global coupling) | `src/templates/theme.js` |

---

## POSITIVE OBSERVATIONS

1. **Good HTML escaping** - `escapeHtml()` consistently used in template components
2. **URL sanitization** - `sanitizeImageUrl()` blocks javascript: URLs
3. **postMessage origin validation** - Draw.io validates message origins
4. **Clean event system** - EventBus is well-implemented
5. **Proper state immutability** - StateStore uses immutable update patterns
6. **JSDoc documentation** - Type definitions present in state modules

---

## PRIORITY RECOMMENDATIONS

### Immediate (Security/Data Loss)
1. Fix XSS in `renderer.js:61` - escape template name (SEC-001)
2. Fix race condition in `sync.js` - use queue instead of overwrite (BUG-001)
3. Fix array corruption in `store.js` - check `Array.isArray()` (BUG-002)

### High Priority
4. Replace window globals with ES6 imports (ARCH-001)
5. Split files over 500 lines per CLAUDE.md (COMP-001)
6. Add prototype pollution protection (SEC-005)
7. Use specific postMessage target origin (SEC-003)

### Medium Priority
8. Consolidate duplicate code (ARCH-002, ARCH-003)
9. Consistently use service layer (ARCH-004)
10. Move working files from root to `/examples/` (COMP-002)

---

## FIX PROMPTS FOR FRESH SESSIONS

See `docs/FIX_PROMPTS.md` for copy-paste prompts to fix each issue category.
