# Security Audit Report - Presentation Builder
**Date:** 2026-01-20
**Auditor:** Claude Code Review Expert
**Scope:** Security vulnerabilities, XSS risks, data handling, error handling, credential exposure

---

## Executive Summary

This security audit identified **14 security issues** across the presentation-builder codebase, ranging from **HIGH** to **LOW** severity. The most critical findings involve:
- Potential XSS vulnerabilities through unsafe innerHTML usage
- Missing input validation in JSON import functionality
- OAuth token exposure in sessionStorage
- Error handling gaps that could crash the application
- PostMessage security weaknesses in Draw.io integration

**Overall Risk Level:** MEDIUM-HIGH

---

## Critical Findings (HIGH Severity)

### 1. XSS Vulnerability - Unsafe JSON Import without Validation
**File:** `src/presentation/app/import-modal.js`
**Lines:** 124-143
**Severity:** HIGH

**Issue:**
The JSON code import feature parses user input without proper validation before rendering:

```javascript
const project = JSON.parse(jsonInput.value);

// Validate project structure
if (!project.name || !project.slides) {
    throw new Error('Format de projet invalide');
}

// Set as current project using centralized state
setProject(project);
```

**Risk:**
Malicious JSON containing script tags or event handlers in slide data could be executed when rendered via `innerHTML` in template components.

**Attack Vector:**
```json
{
  "name": "malicious",
  "slides": [{
    "template": "title",
    "data": {
      "title": "<img src=x onerror=alert('XSS')>"
    }
  }]
}
```

**Recommendation:**
- Import validation in `import-export.js` (lines 85-109) is insufficient - it validates structure but not content
- Add HTML sanitization for all user-provided strings before setting project data
- Use DOMPurify or similar library to sanitize imported data
- Validate that template fields only contain expected types (string, number, boolean)

---

### 2. XSS Vulnerability - Multiple innerHTML Usages Without Sanitization
**Files:** Multiple
**Severity:** HIGH

**Affected Locations:**

1. **`src/presentation/editor/panel.js:184`**
   ```javascript
   container.innerHTML = `
       <div class="editor-content">
   ```
   Uses template data without escaping in some code paths.

2. **`src/presentation/app/slides/list.js:133`**
   ```javascript
   list.innerHTML = currentProject.slides.map((slide, index) => {
   ```
   Generates slide thumbnails with project data.

3. **`src/presentation/app/slides/preview.js:31`**
   ```javascript
   preview.innerHTML = renderSlidePreview(slide);
   ```
   Renders slide content directly.

**Risk:**
While most template components properly use `escapeHtml()`, the rendering pipeline creates multiple points where malicious content could bypass sanitization.

**Recommendation:**
- Audit ALL innerHTML assignments for proper escaping
- Consider using textContent for user-provided strings
- Implement Content Security Policy (CSP) headers
- Add integration tests for XSS prevention

---

### 3. Insufficient Input Validation - Import File Size Only
**File:** `src/projects/import-export.js`
**Lines:** 76-99
**Severity:** HIGH

**Issue:**
File import validates size (10MB) but allows excessive slide counts and nested structures:

```javascript
if (project.slides.length > IMPORT_LIMITS.MAX_SLIDES) {
    throw new Error('Trop de slides (max: ' + IMPORT_LIMITS.MAX_SLIDES + ')');
}
```

**Missing Validations:**
- No validation of data types for critical fields (e.g., template names)
- String length validation (100KB) may still allow DoS via rendering
- No validation that template field names match expected schema
- Missing validation for special characters in project names

**Attack Vector:**
```json
{
  "name": "../../../etc/passwd",
  "slides": [{
    "template": "malicious_template",
    "data": {"field": "A".repeat(100000)}
  }]
}
```

**Recommendation:**
- Validate template names against whitelist (title, section, bullets, etc.)
- Validate all field names match template schema
- Sanitize project names to prevent path traversal
- Reduce MAX_STRING_LENGTH to reasonable UI limits (e.g., 10KB)

---

## High Findings (MEDIUM-HIGH Severity)

### 4. PostMessage Security - Draw.io Integration
**File:** `src/presentation/inline-editing/drawio-editor.js`
**Lines:** 36-86
**Severity:** MEDIUM-HIGH

**Issue:**
PostMessage handler only validates origin but doesn't validate message structure:

```javascript
window.drawioMessageHandler = (event) => {
    if (event.origin !== 'https://embed.diagrams.net') return;

    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (e) {
      return;
    }
```

**Risks:**
1. No validation that `msg.data` contains safe SVG content
2. Embedded SVG from Draw.io could contain JavaScript (via `<script>` or event handlers)
3. SVG data stored as base64 data URL without sanitization

**Attack Vector:**
Compromised Draw.io iframe could send malicious SVG:
```javascript
{
  "event": "export",
  "data": "data:image/svg+xml;base64,<base64 of SVG with onclick='alert(1)'>"
}
```

**Recommendation:**
- Validate and sanitize SVG content before storing
- Strip JavaScript from SVG using DOMPurify with SVG profile
- Consider using `<img>` tags only (which don't execute scripts) instead of inline SVG
- Add CSP directive: `img-src 'self' data: https://embed.diagrams.net;`

---

### 5. OAuth Token Storage in sessionStorage
**File:** `src/infrastructure/drive/auth.js`
**Lines:** 113-126
**Severity:** MEDIUM-HIGH (Informational - documented tradeoff)

**Issue:**
OAuth tokens stored in sessionStorage are accessible to JavaScript:

```javascript
// SEC-002: Token Storage Security Considerations
sessionStorage.setItem(
  DriveConfig.STORAGE_KEYS.AUTH_TOKEN,
  JSON.stringify(response)
);
```

**Risk:**
XSS attacks can steal OAuth tokens and access user's Google Drive.

**Current Mitigations (Documented):**
- sessionStorage (not localStorage) limits exposure to single tab
- Tokens expire (managed by Google OAuth)
- escapeHtml used throughout codebase
- Comments indicate this is standard for client-side SPAs

**Recommendation:**
- This is an acceptable tradeoff for client-only app (no backend)
- **MUST implement Content Security Policy (CSP)** to prevent XSS:
  ```html
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' https://apis.google.com https://accounts.google.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://www.googleapis.com https://apis.google.com;
    frame-src https://embed.diagrams.net;
  ">
  ```
- Add Subresource Integrity (SRI) for external scripts
- Consider token encryption at rest (client-side key derived from user interaction)

---

### 6. Google Drive Client ID Exposure
**File:** `src/infrastructure/drive/config.js`
**Lines:** 10-13
**Severity:** MEDIUM

**Issue:**
Client ID and API Key stored in source code:

```javascript
CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
API_KEY: '',
```

**Risk:**
- Placeholder indicates keys should be configured by users
- If real keys committed, they enable quota abuse and API billing attacks
- Keys visible in browser developer tools

**Current State:**
- Placeholder values suggest proper deployment process
- No actual credentials found in repository

**Recommendation:**
- Document in README that users must obtain their own OAuth credentials
- Add `.env` support for local development (never commit .env)
- For production, inject credentials at build time from environment variables
- Add pre-commit hook to prevent committing real credentials
- Consider using GitHub Secrets for deployment

---

### 7. LocalStorage Data Injection
**File:** `src/infrastructure/drive/sync.js`
**Lines:** 239-244, 262-264
**Severity:** MEDIUM

**Issue:**
Direct parsing of localStorage data without validation:

```javascript
const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');
const index = projects.findIndex(p => p.name === localProject.name);
if (index !== -1) {
    projects[index] = remoteProject;
    localStorage.setItem('slideProjects', JSON.stringify(projects));
}
```

**Risk:**
If attacker gains XSS access, they can corrupt localStorage with malicious project data that persists across sessions.

**Recommendation:**
- Validate localStorage data structure before parsing
- Add version field to detect format changes
- Implement data migration/validation on app load
- Consider localStorage quota exhaustion DoS (catch QuotaExceededError)

---

## Medium Findings (MEDIUM Severity)

### 8. Error Handling - Silent Failures in Drive Sync
**File:** `src/infrastructure/drive/sync.js`
**Lines:** 168-183
**Severity:** MEDIUM

**Issue:**
Sync errors logged but not shown to user:

```javascript
} catch (error) {
    console.error('Sync error:', error);

    if (retryCount < DriveConfig.SYNC.RETRY_ATTEMPTS) {
        // ... retry logic
    } else {
        this.setStatus(SyncStatus.ERROR);
        this.savePendingSync(project);
    }
}
```

**Risk:**
Users may lose data without realizing sync failed. Only status indicator changes but no modal/alert shown.

**Recommendation:**
- Add user-visible error notifications for sync failures
- Implement retry with exponential backoff (already present)
- Show detailed error messages for auth failures vs network failures
- Add manual retry button in UI

---

### 9. Missing Error Handling - Drive API Calls
**File:** `src/infrastructure/drive/api.js`
**Lines:** 22-30, 92-107
**Severity:** MEDIUM

**Issue:**
Some API calls have minimal error handling:

```javascript
try {
    // Verify folder still exists
    await gapi.client.drive.files.get({
        fileId: folderId,
        fields: 'id,trashed'
    });
    return folderId;
} catch (e) {
    // Folder deleted or inaccessible, create new one
    localStorage.removeItem(DriveConfig.STORAGE_KEYS.FOLDER_ID);
}
```

**Risk:**
Network errors, quota exceeded, and permission errors treated the same as deleted files.

**Recommendation:**
- Check error.status and error.code for specific handling
- 403 = permission denied (show auth prompt)
- 429 = quota exceeded (show rate limit message)
- 5xx = server error (retry with backoff)
- Network errors (no response) = offline mode

---

### 10. Query Injection - Drive File Search
**File:** `src/infrastructure/drive/api.js`
**Lines:** 34-38, 266-270
**Severity:** MEDIUM

**Issue:**
Folder name and file name used in query without sanitization:

```javascript
const searchResponse = await gapi.client.drive.files.list({
    q: `name='${DriveConfig.APP_FOLDER_NAME}' and mimeType='${DriveConfig.MIME_TYPES.FOLDER}' and trashed=false`,
    fields: 'files(id)',
    spaces: 'drive'
});
```

**Risk:**
If APP_FOLDER_NAME or project name contains single quotes, query breaks or could be manipulated.

**Attack Vector:**
```javascript
project.name = "Test' or '1'='1"
// Query becomes: name='Test' or '1'='1' and ...
```

**Recommendation:**
- Escape single quotes in query values: `name.replace(/'/g, "\\'")`
- Use parameterized queries if Google Drive API supports them
- Validate project names to disallow special characters: `/^[a-zA-Z0-9\s\-_]+$/`

---

## Low Findings (LOW Severity)

### 11. Missing Content Security Policy
**File:** `index.html` (not reviewed but inferred)
**Severity:** LOW (but enables other HIGH issues)

**Issue:**
No CSP headers detected in codebase. This allows:
- Inline scripts to execute (XSS vector)
- Data exfiltration to arbitrary domains
- Loading scripts from compromised CDNs

**Recommendation:**
Add CSP meta tag or HTTP headers:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'nonce-{random}' https://apis.google.com https://accounts.google.com https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://www.googleapis.com https://apis.google.com;
  frame-src https://embed.diagrams.net;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

---

### 12. Unsafe Image URL Handling
**File:** `src/infrastructure/utils/html.js`
**Lines:** 25-65
**Severity:** LOW

**Issue:**
SVG data URLs allowed without sanitization:

```javascript
// Allow safe data URLs for images only
const safeDataPrefixes = [
    'data:image/svg+xml',
    // ...
];
```

**Risk:**
SVG data URLs can contain JavaScript when used in `<img>` tags (browser blocks execution), but if used in other contexts (innerHTML, object, embed), scripts execute.

**Current Mitigations:**
- Code comment indicates SVGs only used in `<img src>` where scripts don't execute
- Browser same-origin policy prevents script execution in `<img>`

**Recommendation:**
- Add assertion that sanitizeImageUrl() only used for `<img src>` attributes
- Add DOMPurify sanitization for SVG content if ever used outside `<img>`
- Document security assumptions in code comments

---

### 13. Race Condition - Token Refresh
**File:** `src/infrastructure/drive/auth.js`
**Lines:** 275-302
**Severity:** LOW (Functionality bug, minimal security impact)

**Issue:**
Mutex pattern implemented but could still have timing issues:

```javascript
if (this._refreshPromise) {
    return this._refreshPromise;
}

this._refreshPromise = new Promise((resolve, reject) => {
    const originalCallback = this.tokenClient.callback;
    this.tokenClient.callback = (response) => {
        this.tokenClient.callback = originalCallback;
        this._refreshPromise = null; // Clear mutex
```

**Risk:**
If multiple concurrent API calls occur during token refresh, they may use expired tokens before refresh completes.

**Recommendation:**
- Queue API calls during token refresh
- Add integration tests for concurrent refresh scenarios
- Consider using async/await mutex library

---

### 14. Missing Input Sanitization - File Names
**File:** `src/infrastructure/drive/api.js`
**Lines:** 244-255
**Severity:** LOW

**Issue:**
File name sanitization removes illegal characters but allows very long names:

```javascript
sanitizeFileName(name) {
    return (name || 'Sans titre')
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, ' ')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 200);
}
```

**Risk:**
- 200 character limit may still cause UI issues
- No validation of Unicode control characters
- No normalization of Unicode (e.g., combining characters)

**Recommendation:**
- Reduce limit to 100 characters
- Strip Unicode control characters: `.replace(/[\x00-\x1F\x7F-\x9F]/g, '')`
- Normalize Unicode: `.normalize('NFC')`
- Validate against null bytes and path separators

---

## Summary Table

| ID | Severity | Issue | File | Lines | Status |
|----|----------|-------|------|-------|--------|
| SEC-001 | HIGH | XSS - Unsafe JSON import | `import-modal.js` | 124-143 | Open |
| SEC-002 | HIGH | XSS - Multiple innerHTML usages | Multiple files | Various | Open |
| SEC-003 | HIGH | Insufficient input validation | `import-export.js` | 76-99 | Open |
| SEC-004 | MED-HIGH | PostMessage security - Draw.io | `drawio-editor.js` | 36-86 | Open |
| SEC-005 | MED-HIGH | OAuth token in sessionStorage | `auth.js` | 113-126 | Documented |
| SEC-006 | MEDIUM | Client ID in source code | `config.js` | 10-13 | Open |
| SEC-007 | MEDIUM | LocalStorage data injection | `sync.js` | 239-264 | Open |
| SEC-008 | MEDIUM | Silent error handling | `sync.js` | 168-183 | Open |
| SEC-009 | MEDIUM | Missing Drive API error handling | `api.js` | 22-107 | Open |
| SEC-010 | MEDIUM | Drive query injection | `api.js` | 34-38, 266-270 | Open |
| SEC-011 | LOW | Missing CSP headers | `index.html` | N/A | Open |
| SEC-012 | LOW | SVG data URL handling | `html.js` | 25-65 | Documented |
| SEC-013 | LOW | Token refresh race condition | `auth.js` | 275-302 | Open |
| SEC-014 | LOW | File name sanitization | `api.js` | 244-255 | Open |

---

## Positive Security Findings

The codebase demonstrates several **security best practices**:

1. **Consistent HTML Escaping:** `escapeHtml()` used throughout template components
2. **Image URL Sanitization:** `sanitizeImageUrl()` prevents javascript: and data:text/html URLs
3. **Import Size Limits:** 10MB file size and 500 slide limits prevent basic DoS
4. **Session Storage:** OAuth tokens use sessionStorage (not localStorage) for better isolation
5. **Structure Validation:** Import validates basic project structure before loading
6. **Origin Validation:** PostMessage handler checks Draw.io origin
7. **Token Refresh Mutex:** Prevents some race conditions in auth
8. **No eval() Usage:** No dangerous dynamic code execution found

---

## Recommended Action Plan

### Immediate (Fix within 1 week):
1. **Implement Content Security Policy** (SEC-011) - Blocks many XSS attacks
2. **Sanitize JSON import data** (SEC-001, SEC-003) - Prevents malicious project injection
3. **Add SVG sanitization for Draw.io** (SEC-004) - Use DOMPurify
4. **Validate template names** (SEC-003) - Whitelist allowed templates

### Short-term (Fix within 1 month):
5. **Audit all innerHTML usages** (SEC-002) - Comprehensive XSS review
6. **Improve Drive error handling** (SEC-008, SEC-009) - Better user feedback
7. **Sanitize Drive queries** (SEC-010) - Escape single quotes
8. **Add localStorage validation** (SEC-007) - Validate on read

### Long-term (Fix within 3 months):
9. **Document credential management** (SEC-006) - README + .env support
10. **Fix token refresh race** (SEC-013) - Request queue
11. **Enhanced file name validation** (SEC-014) - Unicode normalization
12. **Security testing** - Add XSS/injection test suite

---

## Testing Recommendations

1. **XSS Test Suite:**
   - Import malicious JSON with script tags
   - Test all template fields with XSS payloads
   - Verify CSP blocks inline scripts

2. **Input Validation Tests:**
   - Oversized files and slide counts
   - Invalid template names
   - Path traversal in project names
   - Unicode edge cases

3. **Drive Integration Tests:**
   - Network failures during sync
   - Quota exceeded scenarios
   - Permission denied errors
   - Concurrent token refresh

4. **PostMessage Security:**
   - Malicious Draw.io messages
   - SVG with embedded scripts
   - Origin spoofing attempts

---

## References

- OWASP XSS Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- Content Security Policy Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- DOMPurify Library: https://github.com/cure53/DOMPurify
- Google OAuth Best Practices: https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#security

---

**End of Security Audit Report**
