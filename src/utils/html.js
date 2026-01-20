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
 * Validate URL for safe usage in image src attributes
 * Prevents javascript:, data:text/html and other dangerous protocols
 * @param {string} url - URL to validate
 * @returns {string} Safe URL or empty string if invalid
 */
export function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();

  // Allow http and https protocols
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Allow relative URLs (paths starting with / or not containing :)
  if (trimmed.startsWith('/') || !trimmed.includes(':')) {
    return trimmed;
  }

  // Allow safe data URLs for images only
  const safeDataPrefixes = [
    'data:image/png',
    'data:image/jpeg',
    'data:image/jpg',
    'data:image/gif',
    'data:image/svg+xml',
    'data:image/webp',
    'data:image/avif'
  ];

  const lowerUrl = trimmed.toLowerCase();
  for (const prefix of safeDataPrefixes) {
    if (lowerUrl.startsWith(prefix)) {
      return trimmed;
    }
  }

  // Reject all other protocols (javascript:, data:text/html, etc.)
  return '';
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
