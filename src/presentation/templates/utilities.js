// src/templates/utilities.js
// Shared utilities for template rendering - ES Module version

import { escapeHtml } from '../../infrastructure/utils/html.js';

/**
 * Render code lines with optional line numbers and ellipsis
 * @param {string} code - Code content
 * @param {boolean} showLineNumbers - Whether to show line numbers
 * @param {number} startLine - Starting line number
 * @param {boolean} showEllipsisBefore - Show "..." before code
 * @param {boolean} showEllipsisAfter - Show "..." after code
 * @returns {string} HTML string
 */
export function renderCodeLines(
  code,
  showLineNumbers,
  startLine,
  showEllipsisBefore,
  showEllipsisAfter
) {
  const lines = (code || '').split('\n');
  const start = startLine || 1;

  const ellipsisLine = '<div class="code-line ellipsis"><span class="line-number">...</span><span class="line-content"></span></div>';
  const ellipsisLineNoNum = '<div class="code-line ellipsis"><span class="line-content">...</span></div>';

  const codeLines = lines
    .map((line, i) => {
      const lineNum = start + i;
      if (showLineNumbers) {
        return `<div class="code-line"><span class="line-number">${lineNum}</span><span class="line-content">${
          escapeHtml(line) || ' '
        }</span></div>`;
      } else {
        return `<div class="code-line"><span class="line-content">${
          escapeHtml(line) || ' '
        }</span></div>`;
      }
    })
    .join('');

  const ellipsisBefore = showEllipsisBefore
    ? showLineNumbers
      ? ellipsisLine
      : ellipsisLineNoNum
    : '';
  const ellipsisAfter = showEllipsisAfter
    ? showLineNumbers
      ? ellipsisLine
      : ellipsisLineNoNum
    : '';

  return ellipsisBefore + codeLines + ellipsisAfter;
}

/**
 * Create a code block window with optional filename and dots
 * @param {string} content - HTML content for code block
 * @param {string} filename - Optional filename
 * @returns {string} HTML string
 */
export function createCodeWindow(content, filename) {
  const filenameHtml = filename
    ? `<span class="code-filename">${escapeHtml(filename)}</span>`
    : '';

  return `
    <div class="code-window">
      <div class="code-window-header">
        <div class="code-window-dots">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
        </div>
        ${filenameHtml}
      </div>
      <div class="code-window-content">
        ${content}
      </div>
    </div>
  `;
}
