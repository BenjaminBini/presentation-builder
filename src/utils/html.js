// src/utils/html.js
// HTML utility functions

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML string
 */
export function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Create an HTML element from a string template
 * @param {string} html - HTML string
 * @returns {Element} DOM element
 */
export function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

/**
 * Sanitize a string for use in CSS (remove potentially dangerous characters)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeForCss(str) {
  if (str == null) return '';
  return String(str).replace(/[^a-zA-Z0-9-_]/g, '');
}
