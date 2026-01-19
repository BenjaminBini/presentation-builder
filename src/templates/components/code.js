// src/templates/components/code.js
// Code templates: code, code-annotated
import { escapeHtml } from '../../utils/html.js';
import { renderCodeLines } from '../utilities.js';

/**
 * Render code template
 */
export function renderCodeTemplate(data, colorStyles) {
  return `
                <div class="slide-content template-code" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <div class="code-container" data-editable="code" data-field-key="code">
                        <div class="code-header">
                            <span class="code-dot red"></span>
                            <span class="code-dot yellow"></span>
                            <span class="code-dot green"></span>
                            <span class="code-filename" data-editable="text" data-field-key="filename" data-placeholder="fichier.js">${escapeHtml(
                              data.filename || "code.js"
                            )}</span>
                        </div>
                        <div class="code-body">${renderCodeLines(
                          data.code || "",
                          data.showLineNumbers,
                          data.startLine || 1,
                          data.showEllipsisBefore,
                          data.showEllipsisAfter
                        )}</div>
                    </div>
                    <p class="code-description" data-editable="text" data-field-key="description" data-placeholder="Description du code">${escapeHtml(
                      data.description || ""
                    )}</p>
                </div>
            `;
}

/**
 * Render code-annotated template
 */
export function renderCodeAnnotatedTemplate(data, colorStyles) {
  const lines = (data.code || "").split("\n");
  const lineHeight = 28;
  const codeStartOffset = 52;
  const startLineNum = data.startLine || 1;
  const showLineNumbers = data.showLineNumbers !== false; // Default true for annotated code
  const showEllipsisBefore = data.showEllipsisBefore || false;
  const showEllipsisAfter = data.showEllipsisAfter || false;

  const highlightedLines = new Set();
  (data.annotations || []).forEach((ann) => {
    const start = ann.line;
    const end = ann.lineTo || ann.line;
    for (let i = start; i <= end; i++) highlightedLines.add(i);
  });

  const ellipsisLine = showLineNumbers
    ? `<div class="code-line ellipsis"><span class="line-number">...</span><span class="line-content"></span></div>`
    : `<div class="code-line ellipsis"><span class="line-content">...</span></div>`;

  // Build a map of which annotation each line belongs to
  const lineToAnnotation = new Map();
  (data.annotations || []).forEach((ann, idx) => {
    const start = ann.line;
    const end = ann.lineTo || ann.line;
    for (let i = start; i <= end; i++) {
      lineToAnnotation.set(i, idx);
    }
  });

  const codeLines = lines
    .map((line, i) => {
      const lineNum = startLineNum + i;
      const isHighlighted = highlightedLines.has(lineNum);
      const canAnnotate = !isHighlighted;
      const addBtn = canAnnotate
        ? `<button class="add-annotation-btn" data-line="${lineNum}" title="Ajouter une annotation"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></button>`
        : "";

      // Check if this is the last line of an annotation and next line starts a different annotation
      const currentAnnotation = lineToAnnotation.get(lineNum);
      const nextAnnotation = lineToAnnotation.get(lineNum + 1);
      const isAnnotationBoundary =
        isHighlighted &&
        nextAnnotation !== undefined &&
        currentAnnotation !== nextAnnotation;

      const classes = ["code-line"];
      if (isHighlighted) classes.push("highlighted");
      if (isAnnotationBoundary) classes.push("annotation-boundary");

      if (showLineNumbers) {
        return `<div class="${classes.join(
          " "
        )}" data-line-num="${lineNum}" data-can-annotate="${canAnnotate}"><span class="line-number">${lineNum}</span><span class="line-content">${
          escapeHtml(line) || " "
        }</span>${addBtn}</div>`;
      } else {
        return `<div class="${classes.join(
          " "
        )}" data-line-num="${lineNum}" data-can-annotate="${canAnnotate}"><span class="line-content">${
          escapeHtml(line) || " "
        }</span>${addBtn}</div>`;
      }
    })
    .join("");

  const allCodeLines = [
    showEllipsisBefore ? ellipsisLine : "",
    codeLines,
    showEllipsisAfter ? ellipsisLine : "",
  ]
    .filter(Boolean)
    .join("");
  const annotationOffset = showEllipsisBefore ? lineHeight : 0;

  const annotationsHtml = (data.annotations || [])
    .map((ann, i) => {
      const startLine = ann.line;
      const endLine = ann.lineTo || ann.line;
      const midLine = (startLine + endLine) / 2;
      const lineIndex = midLine - startLineNum;
      const topPosition =
        codeStartOffset + annotationOffset + lineIndex * lineHeight;
      return `
            <div class="annotation" style="top: ${topPosition}px;" data-annotation-index="${i}">
                <div class="annotation-arrow"></div>
                <div class="annotation-content">
                    <button class="delete-annotation-btn" data-annotation-index="${i}" title="Supprimer l'annotation"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    <div class="annotation-title" data-editable="text" data-field-key="annotations" data-field-index="${i}" data-field-subkey="title" data-placeholder="Titre">${escapeHtml(
        ann.title || ""
      )}</div>
                    <div class="annotation-text" data-editable="text" data-field-key="annotations" data-field-index="${i}" data-field-subkey="text" data-placeholder="Description">${escapeHtml(
        ann.text || ""
      )}</div>
                </div>
            </div>
        `;
    })
    .join("");

  return `
        <div class="slide-content template-code-annotated" ${colorStyles}>
            <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
              data.title || ""
            )}</h2>
            <div class="code-annotated-container">
                <div class="code-panel">
                    <div class="code-container" data-editable="code" data-field-key="code" data-code-annotated="true">
                        <div class="code-header">
                            <span class="code-dot red"></span>
                            <span class="code-dot yellow"></span>
                            <span class="code-dot green"></span>
                            <span class="code-filename" data-editable="text" data-field-key="filename" data-placeholder="fichier.js">${escapeHtml(
                              data.filename || "code.js"
                            )}</span>
                        </div>
                        <div class="code-body">${allCodeLines}</div>
                    </div>
                </div>
                <div class="annotations-panel">${annotationsHtml}</div>
            </div>
        </div>
    `;
}
