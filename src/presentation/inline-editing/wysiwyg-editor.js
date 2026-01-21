// src/inline-editing/wysiwyg-editor.js
// Inline WYSIWYG editor with floating toolbar
// Uses contenteditable with execCommand for simple, widely supported formatting

import { updateSlideData, getFieldValue } from './data-updates.js';
import { adjustTextTemplateScale } from '../templates/components/layout.js';
import { sanitizeLinkUrl, escapeHtml, trimHtml, sanitizeHtml } from '../../infrastructure/utils/html.js';

// Toolbar button definitions
const TOOLBAR_BUTTONS = [
  { command: 'bold', icon: '<strong>B</strong>', label: 'Gras' },
  { command: 'italic', icon: '<em>I</em>', label: 'Italique' },
  { command: 'underline', icon: '<u>U</u>', label: 'Souligné' },
  { divider: true },
  { command: 'insertUnorderedList', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><line x1="9" y1="6" x2="20" y2="6"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><line x1="9" y1="12" x2="20" y2="12"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/><line x1="9" y1="18" x2="20" y2="18"/></svg>', label: 'Liste à puces' },
  { command: 'insertOrderedList', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none"><text x="2" y="8" font-size="7" font-weight="600">1</text><rect x="9" y="4.5" width="11" height="2" rx="1"/><text x="2" y="14" font-size="7" font-weight="600">2</text><rect x="9" y="10.5" width="11" height="2" rx="1"/><text x="2" y="20" font-size="7" font-weight="600">3</text><rect x="9" y="16.5" width="11" height="2" rx="1"/></svg>', label: 'Liste numérotée' },
  { divider: true },
  { command: 'createLink', icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>', label: 'Lien', handler: 'handleLinkCommand' }
];

// Track state
let currentWysiwygElement = null;
let floatingToolbar = null;
let wysiwygFieldKey = null;
let wysiwygFieldIndex = null;
let originalContent = null;
let inlineEditorRef = null;

// Store event handler references for cleanup
let toolbarMousedownHandler = null;
let toolbarClickHandler = null;

// RAF debouncing for text scaling
let scaleRafId = null;

/**
 * Create floating toolbar element
 */
function createFloatingToolbar() {
  if (floatingToolbar) return floatingToolbar;

  const toolbar = document.createElement('div');
  toolbar.className = 'wysiwyg-floating-toolbar';
  toolbar.innerHTML = TOOLBAR_BUTTONS.map(btn => {
    if (btn.divider) {
      return '<span class="wysiwyg-toolbar-divider"></span>';
    }
    return `<button type="button" class="wysiwyg-toolbar-btn" data-command="${btn.command}" title="${btn.label}"${btn.handler ? ` data-handler="${btn.handler}"` : ''}>${btn.icon}</button>`;
  }).join('');

  // Store event handler references for cleanup
  toolbarMousedownHandler = (e) => {
    e.preventDefault(); // Prevent losing focus from contenteditable
  };
  toolbarClickHandler = handleToolbarClick;

  toolbar.addEventListener('mousedown', toolbarMousedownHandler);
  toolbar.addEventListener('click', toolbarClickHandler);

  document.body.appendChild(toolbar);
  floatingToolbar = toolbar;
  return toolbar;
}

/**
 * Destroy floating toolbar and clean up event listeners
 * Call this when the editor component is being torn down
 */
export function destroyFloatingToolbar() {
  if (floatingToolbar) {
    // Remove event listeners
    if (toolbarMousedownHandler) {
      floatingToolbar.removeEventListener('mousedown', toolbarMousedownHandler);
    }
    if (toolbarClickHandler) {
      floatingToolbar.removeEventListener('click', toolbarClickHandler);
    }

    // Remove from DOM
    floatingToolbar.remove();
    floatingToolbar = null;
  }

  // Clear handler references
  toolbarMousedownHandler = null;
  toolbarClickHandler = null;

  // Cancel any pending RAF
  if (scaleRafId) {
    cancelAnimationFrame(scaleRafId);
    scaleRafId = null;
  }
}

/**
 * Handle toolbar button clicks
 */
function handleToolbarClick(event) {
  const button = event.target.closest('.wysiwyg-toolbar-btn');
  if (!button) return;

  event.preventDefault();
  event.stopPropagation();

  const command = button.dataset.command;
  const handler = button.dataset.handler;

  if (handler === 'handleLinkCommand') {
    handleLinkCommand();
  } else {
    document.execCommand(command, false, null);
  }

  updateToolbarButtonStates();
}

/**
 * Handle link command - prompts for URL with validation
 */
function handleLinkCommand() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const selectedText = selection.toString();
  const url = prompt('URL du lien:', 'https://');

  if (url && url !== 'https://') {
    // Validate URL to prevent javascript: and other dangerous protocols
    const safeUrl = sanitizeLinkUrl(url);
    if (!safeUrl) {
      alert('URL invalide. Utilisez http://, https://, ou un lien relatif.');
      return;
    }

    if (selectedText) {
      document.execCommand('createLink', false, safeUrl);
    } else {
      // Escape the URL for display text, use validated URL for href
      const link = `<a href="${safeUrl}">${escapeHtml(safeUrl)}</a>`;
      document.execCommand('insertHTML', false, link);
    }
  }
}

/**
 * Update toolbar button states based on current selection
 */
function updateToolbarButtonStates() {
  if (!floatingToolbar) return;

  const buttons = floatingToolbar.querySelectorAll('.wysiwyg-toolbar-btn');
  buttons.forEach(btn => {
    const command = btn.dataset.command;
    if (command && document.queryCommandState) {
      try {
        const isActive = document.queryCommandState(command);
        btn.classList.toggle('active', isActive);
      } catch (e) {
        // Some commands don't support queryCommandState
      }
    }
  });
}

/**
 * Position toolbar above the editable element
 */
function positionToolbar(element) {
  if (!floatingToolbar) return;

  const rect = element.getBoundingClientRect();
  const toolbarRect = floatingToolbar.getBoundingClientRect();

  // Position above the element, centered
  let left = rect.left + (rect.width / 2) - (toolbarRect.width / 2);
  let top = rect.top - toolbarRect.height - 10;

  // Keep within viewport
  if (left < 10) left = 10;
  if (left + toolbarRect.width > window.innerWidth - 10) {
    left = window.innerWidth - toolbarRect.width - 10;
  }
  if (top < 10) {
    // Position below if not enough space above
    top = rect.bottom + 10;
  }

  floatingToolbar.style.left = `${left}px`;
  floatingToolbar.style.top = `${top}px`;
}

/**
 * Show floating toolbar
 */
function showToolbar(element) {
  const toolbar = createFloatingToolbar();
  positionToolbar(element);
  toolbar.classList.add('visible');
  updateToolbarButtonStates();
}

/**
 * Hide floating toolbar
 */
function hideToolbar() {
  if (floatingToolbar) {
    floatingToolbar.classList.remove('visible');
  }
}

/**
 * Open WYSIWYG inline editor
 * @param {string} fieldKey - Field key to update
 * @param {number|null} fieldIndex - Array index if applicable
 */
export function openWysiwygEditor(fieldKey, fieldIndex) {
  // If already editing this element, ignore
  if (currentWysiwygElement && this.wysiwygEditorFieldKey === fieldKey) {
    return;
  }

  // Close any existing WYSIWYG edit first
  if (currentWysiwygElement) {
    closeWysiwygEditor.call(this);
  }

  this.wysiwygEditorFieldKey = fieldKey;
  this.wysiwygEditorFieldIndex = fieldIndex !== undefined ? parseInt(fieldIndex) : null;
  wysiwygFieldKey = fieldKey;
  wysiwygFieldIndex = this.wysiwygEditorFieldIndex;

  // Find the element
  const previewSlide = document.getElementById('previewSlide');
  if (!previewSlide) return;

  const element = previewSlide.querySelector(`[data-field-key="${fieldKey}"][data-editable="wysiwyg"]`);
  if (!element) return;

  currentWysiwygElement = element;
  originalContent = element.innerHTML;

  // Make editable
  element.contentEditable = 'true';
  element.classList.add('wysiwyg-editing');

  // Set default paragraph separator to <p>
  document.execCommand('defaultParagraphSeparator', false, 'p');

  // Ensure content is wrapped in <p> if it's plain text
  if (element.innerHTML && !element.innerHTML.trim().startsWith('<')) {
    element.innerHTML = `<p>${element.innerHTML}</p>`;
  }
  if (!element.innerHTML.trim()) {
    element.innerHTML = '<p><br></p>';
  }

  // Focus the element and position cursor inside first <p>
  element.focus();
  const firstP = element.querySelector('p');
  if (firstP) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(firstP);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // Show toolbar
  showToolbar(element);

  // Add event listeners
  element.addEventListener('input', handleWysiwygInput);
  element.addEventListener('keydown', handleWysiwygKeydown);
  element.addEventListener('blur', handleWysiwygBlur);
  element.addEventListener('mouseup', handleWysiwygSelection);
  element.addEventListener('keyup', handleWysiwygSelection);
  element.addEventListener('paste', handleWysiwygPaste);

  // Store reference for event handlers
  inlineEditorRef = this;
}

/**
 * Handle input changes
 */
function handleWysiwygInput() {
  if (!currentWysiwygElement) return;

  // Reposition toolbar on content change
  positionToolbar(currentWysiwygElement);

  // Wrap any orphan text nodes in <p> tags
  const childNodes = Array.from(currentWysiwygElement.childNodes);
  childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      const p = document.createElement('p');
      node.parentNode.insertBefore(p, node);
      p.appendChild(node);
    }
  });

  // Live resize content based on height - use RAF debouncing to avoid layout thrashing
  // Cancel any pending scale calculation
  if (scaleRafId) {
    cancelAnimationFrame(scaleRafId);
  }

  scaleRafId = requestAnimationFrame(() => {
    const previewSlide = document.getElementById('previewSlide');
    if (previewSlide) {
      adjustTextTemplateScale(previewSlide);
    }
    scaleRafId = null;
  });
}

/**
 * Check if cursor is inside a list item
 */
function isInListItem() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;

  let node = selection.anchorNode;
  while (node && node !== currentWysiwygElement) {
    if (node.nodeName === 'LI') return true;
    node = node.parentNode;
  }
  return false;
}

/**
 * Handle keydown events
 */
function handleWysiwygKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    // Restore original content
    if (currentWysiwygElement && originalContent !== null) {
      currentWysiwygElement.innerHTML = originalContent;
    }
    if (inlineEditorRef) {
      closeWysiwygEditor.call(inlineEditorRef);
    }
  }

  // Cmd+Enter (Mac) or Ctrl+Enter (PC): save and close
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    if (inlineEditorRef) {
      confirmWysiwygEdit.call(inlineEditorRef);
    }
    return;
  }

  // Handle Enter key (except in lists where default behavior is needed)
  if (event.key === 'Enter' && !isInListItem()) {
    event.preventDefault();
    if (event.shiftKey) {
      // Shift+Enter: insert <br> and move cursor after it
      const selection = window.getSelection();
      if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Insert <br> followed by empty text node for cursor positioning
        const br = document.createElement('br');
        const textNode = document.createTextNode('\u200B'); // Zero-width space
        range.insertNode(textNode);
        range.insertNode(br);

        // Move cursor to the text node after <br>
        range.setStart(textNode, 1);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      // Enter: create new <p> after current paragraph
      const selection = window.getSelection();
      if (selection.rangeCount) {
        const range = selection.getRangeAt(0);

        // Find the parent paragraph
        let currentP = range.startContainer;
        while (currentP && currentP.nodeName !== 'P' && currentP !== currentWysiwygElement) {
          currentP = currentP.parentNode;
        }

        // Create new paragraph
        const newP = document.createElement('p');
        newP.innerHTML = '<br>';

        if (currentP && currentP.nodeName === 'P') {
          // Insert new <p> after the current <p>
          currentP.parentNode.insertBefore(newP, currentP.nextSibling);
        } else {
          // No parent <p>, append to container
          currentWysiwygElement.appendChild(newP);
        }

        // Move cursor into new paragraph
        const newRange = document.createRange();
        newRange.setStart(newP, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
  }

  // Handle Tab/Shift+Tab for list indentation
  if (event.key === 'Tab' && isInListItem()) {
    event.preventDefault();
    if (event.shiftKey) {
      document.execCommand('outdent', false, null);
    } else {
      document.execCommand('indent', false, null);
    }
  }

  // Update button states after formatting shortcuts
  setTimeout(updateToolbarButtonStates, 10);
}

/**
 * Handle blur event
 */
function handleWysiwygBlur(event) {
  // Check if focus moved to toolbar - if so, don't close
  if (event.relatedTarget && event.relatedTarget.closest('.wysiwyg-floating-toolbar')) {
    // Refocus the editable element
    setTimeout(() => {
      if (currentWysiwygElement) {
        currentWysiwygElement.focus();
      }
    }, 0);
    return;
  }

  // Small delay to allow clicking toolbar buttons
  setTimeout(() => {
    if (currentWysiwygElement && document.activeElement !== currentWysiwygElement && inlineEditorRef) {
      confirmWysiwygEdit.call(inlineEditorRef);
    }
  }, 150);
}

/**
 * Handle selection changes for toolbar state
 */
function handleWysiwygSelection() {
  updateToolbarButtonStates();
}

/**
 * Handle paste event - sanitize and trim pasted HTML content
 */
function handleWysiwygPaste(event) {
  event.preventDefault();

  // Get pasted data
  const clipboardData = event.clipboardData || window.clipboardData;
  if (!clipboardData) return;

  // Try to get HTML first, fallback to plain text
  let pastedContent = clipboardData.getData('text/html');

  if (pastedContent) {
    // Sanitize and trim HTML content
    pastedContent = sanitizeHtml(pastedContent);
    pastedContent = trimHtml(pastedContent);
  } else {
    // Plain text - escape and wrap in paragraph
    const plainText = clipboardData.getData('text/plain');
    if (plainText) {
      // Convert line breaks to <br> and wrap in <p>
      pastedContent = '<p>' + escapeHtml(plainText).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
    }
  }

  if (pastedContent) {
    // Insert the sanitized content
    document.execCommand('insertHTML', false, pastedContent);
  }
}

/**
 * Close WYSIWYG editor without saving
 */
export function closeWysiwygEditor() {
  if (currentWysiwygElement) {
    // Remove event listeners
    currentWysiwygElement.removeEventListener('input', handleWysiwygInput);
    currentWysiwygElement.removeEventListener('keydown', handleWysiwygKeydown);
    currentWysiwygElement.removeEventListener('blur', handleWysiwygBlur);
    currentWysiwygElement.removeEventListener('mouseup', handleWysiwygSelection);
    currentWysiwygElement.removeEventListener('keyup', handleWysiwygSelection);
    currentWysiwygElement.removeEventListener('paste', handleWysiwygPaste);

    // Remove editable state
    currentWysiwygElement.contentEditable = 'false';
    currentWysiwygElement.classList.remove('wysiwyg-editing');

    currentWysiwygElement = null;
  }

  hideToolbar();

  this.wysiwygEditorFieldKey = null;
  this.wysiwygEditorFieldIndex = null;
  wysiwygFieldKey = null;
  wysiwygFieldIndex = null;
  originalContent = null;
  inlineEditorRef = null;
}

/**
 * Confirm WYSIWYG edit and save changes
 */
export function confirmWysiwygEdit() {
  if (currentWysiwygElement && wysiwygFieldKey) {
    // Clean up the HTML content - trim whitespace, br tags, empty paragraphs
    let newValue = trimHtml(currentWysiwygElement.innerHTML);

    // Ensure at least one paragraph if empty
    if (!newValue.trim() || newValue === '<br>') {
      newValue = '<p></p>';
    }

    // Only save if content changed
    if (newValue !== originalContent) {
      updateSlideData(wysiwygFieldKey, newValue, wysiwygFieldIndex, null);
    }
  }

  closeWysiwygEditor.call(this);
}

/**
 * Get toolbar HTML for external use if needed
 */
export function getWysiwygToolbarHTML() {
  return TOOLBAR_BUTTONS.map(btn => {
    if (btn.divider) {
      return '<span class="wysiwyg-toolbar-divider"></span>';
    }
    return `<button type="button" class="wysiwyg-toolbar-btn" data-command="${btn.command}" title="${btn.label}"${btn.handler ? ` data-handler="${btn.handler}"` : ''}>${btn.icon}</button>`;
  }).join('');
}
