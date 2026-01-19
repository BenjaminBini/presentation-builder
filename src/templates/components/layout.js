// src/templates/components/layout.js
// Layout templates: two-column, image-text
import { escapeHtml } from '../../utils/html.js';

/**
 * Render two-columns template
 */
export function renderTwoColumnsTemplate(data, colorStyles) {
  return `
                <div class="slide-content template-two-columns" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <div class="columns">
                        <div class="column">
                            <h3 data-editable="text" data-field-key="left.title" data-placeholder="Titre colonne gauche">${escapeHtml(
                              data.left?.title || ""
                            )}</h3>
                            <ul class="repeatable-list" data-list-key="left.items">
                                ${(data.left?.items || [])
                                  .map(
                                    (item, i) =>
                                      `<li class="repeatable-item"><span class="item-text" data-editable="text" data-field-key="left.items" data-field-index="${i}" data-placeholder="Point ${
                                        i + 1
                                      }">${escapeHtml(
                                        item
                                      )}</span><button class="delete-item-btn" data-list-key="left.items" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></li>`
                                  )
                                  .join("")}
                                <li class="add-item-row"><button class="add-item-btn" data-list-key="left.items" title="Ajouter un élément">+ Ajouter</button></li>
                            </ul>
                        </div>
                        <div class="column">
                            <h3 data-editable="text" data-field-key="right.title" data-placeholder="Titre colonne droite">${escapeHtml(
                              data.right?.title || ""
                            )}</h3>
                            <ul class="repeatable-list" data-list-key="right.items">
                                ${(data.right?.items || [])
                                  .map(
                                    (item, i) =>
                                      `<li class="repeatable-item"><span class="item-text" data-editable="text" data-field-key="right.items" data-field-index="${i}" data-placeholder="Point ${
                                        i + 1
                                      }">${escapeHtml(
                                        item
                                      )}</span><button class="delete-item-btn" data-list-key="right.items" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></li>`
                                  )
                                  .join("")}
                                <li class="add-item-row"><button class="add-item-btn" data-list-key="right.items" title="Ajouter un élément">+ Ajouter</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
}

/**
 * Render image-text template
 */
export function renderImageTextTemplate(data, colorStyles) {
  const textArray = Array.isArray(data.text)
    ? data.text
    : (data.text || "").split("\n");
  return `
                <div class="slide-content template-image-text" ${colorStyles}>
                    <div class="image-side" data-editable="image" data-field-key="image" style="position:relative;cursor:pointer;">
                        ${
                          data.image
                            ? `<img src="${data.image}" alt="${escapeHtml(
                                data.imageAlt || ""
                              )}">`
                            : '<div class="image-placeholder"><svg style="width:64px;height:64px;stroke:currentColor;stroke-width:1.5;fill:none;" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>'
                        }
                    </div>
                    <div class="text-side">
                        <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                          data.title || ""
                        )}</h2>
                        ${textArray
                          .map(
                            (p, i) =>
                              `<p data-editable="text" data-field-key="text" data-field-index="${i}" data-placeholder="Paragraphe ${
                                i + 1
                              }">${escapeHtml(p)}</p>`
                          )
                          .join("")}
                    </div>
                </div>
            `;
}
