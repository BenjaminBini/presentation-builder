# Event System Migration Plan

## Overview

Migrate `inline-editing/` modules from legacy `window.*` calls to the event-driven architecture.

---

## Correct Event Mappings

Based on actual subscriptions in `src/app/slides/preview.js` and `src/app/slides/list.js`:

| Window Call | Emit This Event | Subscriber Reaction |
|-------------|-----------------|---------------------|
| `window.updatePreview()` | `SLIDE_DATA_CHANGED` | preview.js calls `updatePreview()` |
| `window.renderSlideList()` | `FIELD_CHANGED` | list.js calls `renderSlideList()` if key is title/quote |
| `window.markAsChanged()` | `CHANGES_MARKED` | Need to add subscriber for save button state |
| `window.showToast()` | `TOAST_SHOW` | Need to add subscriber |
| `window.renderEditor()` | **None yet** | Keep window call OR add subscription |

### Events Already Subscribed

**preview.js** reacts to:
- `SLIDE_DATA_CHANGED`, `SLIDE_SELECTED`, `THEME_CHANGED`, `THEME_COLOR_CHANGED`, `PROJECT_LOADED`, `TEMPLATE_CHANGED`, `PREVIEW_UPDATED`

**list.js** reacts to:
- `SLIDE_ADDED`, `SLIDE_REMOVED`, `SLIDE_DUPLICATED`, `SLIDE_MOVED`, `SLIDE_SELECTED`, `PROJECT_LOADED`, `FIELD_CHANGED`

---

## Files to Migrate

### 1. src/inline-editing/data-updates.js

**Current:**
```javascript
// Line 91 - Legacy support
if (key === 'title' || key === 'quote') {
  if (typeof window.renderSlideList === 'function') window.renderSlideList();
}
// Line 97 - Legacy support
if (typeof window.renderEditor === 'function') window.renderEditor();
```

**Change to:**
- Remove window.renderSlideList() - `FIELD_CHANGED` event already emitted, list.js subscribes
- Keep window.renderEditor() for now (no subscription exists)

---

### 2. src/inline-editing/text-editor.js

**Current:**
```javascript
// Line 137
window.updatePreview();
window.renderSlideList(); // only for title/quote
```

**Change to:**
- Remove both - events already emitted by data-updates.js which text-editor calls

---

### 3. src/inline-editing/code-editor.js

**Legacy wrappers to remove (lines 10-40):**
```javascript
function showToast() { window.showToast?.() }
function updatePreview() { window.updatePreview?.() }
function renderEditor() { window.renderEditor?.() }
```

**Change to:**
- Remove wrappers
- The code already calls updateSlideData() which emits events
- Keep renderEditor() call if needed for editor panel refresh

---

### 4. src/inline-editing/image-picker.js

**Legacy wrappers to remove:**
```javascript
function showToast() { window.showToast?.() }
function updatePreview() { window.updatePreview?.() }
function markAsChanged() { window.markAsChanged?.() }
```

**Change to:**
- Remove updatePreview() wrapper and calls - SLIDE_DATA_CHANGED handles it
- Replace markAsChanged() with `emit(EventTypes.CHANGES_MARKED)`
- Keep showToast as convenience or emit TOAST_SHOW

---

### 5. src/inline-editing/list-table-manager.js

**Legacy wrappers to remove:**
```javascript
function showToast() { window.showToast?.() }
function markAsChanged() { window.markAsChanged?.() }
function renderEditor() { window.renderEditor?.() }
function updatePreview() { window.updatePreview?.() }
```

**Change to:**
- Remove all wrappers
- Import: `import { emit, EventTypes } from '../core/events.js';`
- Replace markAsChanged() with `emit(EventTypes.CHANGES_MARKED)`
- Remove updatePreview() calls - handled by SLIDE_DATA_CHANGED
- Keep renderEditor() call for now

---

### 6. src/inline-editing/annotations.js

Same pattern as list-table-manager.js.

---

### 7. src/inline-editing/drawio-editor.js

**Legacy wrapper:**
```javascript
function updatePreview() { window.updatePreview?.() }
```

**Change to:**
- Remove wrapper and calls - handled by SLIDE_DATA_CHANGED

---

### 8. src/app/import-modal.js

**Current (lines ~138-142):**
```javascript
window.renderSlideList();
window.renderEditor();
window.updatePreview();
window.updateHeaderTitle();
window.updateAppThemeColors();
```

**Change to:**
- Emit `PROJECT_LOADED` - preview.js and list.js already subscribe
- Keep window.renderEditor(), window.updateHeaderTitle(), window.updateAppThemeColors() for now
- OR add subscriptions for those in main.js

---

## Do NOT Migrate

### src/inline-editing/html-adapters.js

Intentionally sets window functions for HTML onclick handlers. Keep as-is.

---

## Migration Pattern

### Before:
```javascript
function updatePreview() {
  if (typeof window.updatePreview === 'function') {
    window.updatePreview();
  }
}

// Usage
updateSlideData(key, value);
updatePreview();
markAsChanged();
```

### After:
```javascript
import { emit, EventTypes } from '../core/events.js';

// Usage - emit events, UI reacts via subscriptions
updateSlideData(key, value);  // This already emits SLIDE_DATA_CHANGED and FIELD_CHANGED
emit(EventTypes.CHANGES_MARKED);
// No need to call updatePreview - preview.js subscribes to SLIDE_DATA_CHANGED
```

---

## Missing Subscriptions to Add

These need subscribers before removing window calls:

1. **CHANGES_MARKED** → update save button state
2. **TOAST_SHOW** → show toast notification
3. **renderEditor()** → either add event or keep window call

Add to `src/main.js` in `initializeApp()`:
```javascript
on(EventTypes.CHANGES_MARKED, () => {
  setHasUnsavedChanges(true);
  updateSaveButtonState('modifying');
});

on(EventTypes.TOAST_SHOW, ({ message, type }) => {
  showToast(message, type);
});
```

---

## Testing Checklist

After migration, test at localhost:8080:

- [ ] Edit text inline → preview updates
- [ ] Edit code → preview updates
- [ ] Change image → preview updates
- [ ] Edit list/table → preview updates
- [ ] Edit annotations → preview updates
- [ ] DrawIO edit → preview updates
- [ ] Import project → all UI updates
- [ ] Changes show "unsaved" state
- [ ] No console errors
