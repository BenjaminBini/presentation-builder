// src/templates/components/comparison.js
// Comparison and table templates: comparison, mermaid, drawio
import { escapeHtml } from '../../utils/html.js';

/**
 * Render comparison template
 */
export function renderComparisonTemplate(data, colorStyles) {
  const highlightIdx = data.highlightColumn
    ? parseInt(data.highlightColumn) - 1
    : -1;
  const columns = data.columns || [];
  const rows = data.rows || [];
  return `
                <div class="slide-content template-comparison" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <div class="table-wrapper">
                        <div class="table-col-controls">
                            ${columns
                              .map(
                                (_, i) =>
                                  `<div class="table-col-control"><button class="table-delete-col-btn" data-col-index="${i}" title="Supprimer la colonne"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`
                              )
                              .join("")}
                        </div>
                        <button class="table-add-col-btn" title="Ajouter une colonne">+</button>
                        <button class="table-add-row-btn" title="Ajouter une ligne">+ Ajouter</button>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        ${columns
                                          .map(
                                            (col, i) =>
                                              `<th class="${
                                                i === highlightIdx
                                                  ? "highlight-col"
                                                  : ""
                                              }" data-editable="text" data-field-key="columns" data-field-index="${i}" data-placeholder="Colonne ${
                                                i + 1
                                              }">${escapeHtml(col)}</th>`
                                          )
                                          .join("")}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows
                                      .map(
                                        (row, rowIdx) => `
                                        <tr>
                                            ${row
                                              .map((cell, colIdx) => {
                                                let content = cell;
                                                let isBoolean =
                                                  cell === true ||
                                                  cell === "true" ||
                                                  cell === false ||
                                                  cell === "false";
                                                if (
                                                  cell === true ||
                                                  cell === "true"
                                                )
                                                  content =
                                                    '<span class="check">✓</span>';
                                                else if (
                                                  cell === false ||
                                                  cell === "false"
                                                )
                                                  content =
                                                    '<span class="cross">✗</span>';
                                                else
                                                  content = escapeHtml(
                                                    String(cell)
                                                  );
                                                const editableAttr = isBoolean
                                                  ? ""
                                                  : `data-editable="text" data-field-key="rows" data-field-index="${rowIdx}" data-field-subkey="${colIdx}" data-placeholder="Cellule"`;
                                                return `<td class="${
                                                  colIdx === highlightIdx
                                                    ? "highlight-col"
                                                    : ""
                                                }" ${editableAttr}>${content}</td>`;
                                              })
                                              .join("")}
                                        </tr>
                                    `
                                      )
                                      .join("")}
                                </tbody>
                            </table>
                            <div class="table-row-controls">
                                <div class="row-control-header"><div class="row-control-header-cell"></div></div>
                                ${rows
                                  .map(
                                    (_, rowIdx) =>
                                      `<div class="row-control"><div class="row-control-cell"><button class="table-delete-row-btn" data-row-index="${rowIdx}" title="Supprimer la ligne"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div></div>`
                                  )
                                  .join("")}
                            </div>
                        </div>
                    </div>
                </div>
            `;
}

/**
 * Render mermaid template
 */
export function renderMermaidTemplate(data, colorStyles) {
  return `
                <div class="slide-content template-mermaid" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <p class="mermaid-description" data-editable="text" data-field-key="description" data-placeholder="Description du diagramme">${escapeHtml(
                      data.description || ""
                    )}</p>
                    <div class="mermaid-container" data-editable="code" data-field-key="diagram">
                        <pre class="mermaid">${escapeHtml(
                          data.diagram || ""
                        )}</pre>
                    </div>
                </div>
            `;
}

/**
 * Render draw.io template
 */
export function renderDrawioTemplate(data, colorStyles) {
  const placeholderSvg =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="8" height="6" rx="1"/><rect x="14" y="2" width="8" height="6" rx="1"/><rect x="8" y="16" width="8" height="6" rx="1"/><path d="M6 8v4h6M18 8v4h-6M12 12v4"/></svg>';
  return `
                <div class="slide-content template-drawio" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <p class="drawio-description" data-editable="text" data-field-key="description" data-placeholder="Description">${escapeHtml(
                      data.description || ""
                    )}</p>
                    <div class="drawio-container" data-editable="drawio" data-field-key="diagram">
                        ${
                          data.diagram
                            ? `<img class="drawio-svg" src="${escapeHtml(
                                data.diagram
                              )}" alt="Diagram">`
                            : `<div class="drawio-placeholder">${placeholderSvg}<p>Cliquez pour créer un diagramme</p></div>`
                        }
                    </div>
                </div>
            `;
}
