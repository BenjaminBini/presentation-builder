// templates/utilities.js
// Shared utilities for template rendering
// Requires: utils/html-utils.js (escapeHtml)

/**
 * Render code lines with optional line numbers and ellipsis
 */
function renderCodeLines(
  code,
  showLineNumbers,
  startLine,
  showEllipsisBefore,
  showEllipsisAfter
) {
  const lines = (code || "").split("\n");
  const start = startLine || 1;

  const ellipsisLine = `<div class="code-line ellipsis"><span class="line-number">...</span><span class="line-content"></span></div>`;
  const ellipsisLineNoNum = `<div class="code-line ellipsis"><span class="line-content">...</span></div>`;

  const codeLines = lines
    .map((line, i) => {
      const lineNum = start + i;
      if (showLineNumbers) {
        return `<div class="code-line"><span class="line-number">${lineNum}</span><span class="line-content">${
          escapeHtml(line) || " "
        }</span></div>`;
      } else {
        return `<div class="code-line"><span class="line-content">${
          escapeHtml(line) || " "
        }</span></div>`;
      }
    })
    .join("");

  const ellipsisBefore = showEllipsisBefore
    ? showLineNumbers
      ? ellipsisLine
      : ellipsisLineNoNum
    : "";
  const ellipsisAfter = showEllipsisAfter
    ? showLineNumbers
      ? ellipsisLine
      : ellipsisLineNoNum
    : "";

  return ellipsisBefore + codeLines + ellipsisAfter;
}
