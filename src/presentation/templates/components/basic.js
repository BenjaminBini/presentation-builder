// src/templates/components/basic.js
// Basic slide templates: title, section, bullets, quote
import { escapeHtml, sanitizeImageUrl } from '../../../infrastructure/utils/html.js';
import { getGitLabLogo } from '../../../infrastructure/utils/svg.js';

/**
 * Render title template
 */
export function renderTitleTemplate(data, colorStyles) {
  const logoScale = (data.logoSize || 100) / 100;
  return `
                <div class="slide-content template-title" ${colorStyles}>
                    <div class="logo-container" data-editable="image" data-field-key="logo" style="position:relative; transform: scale(${logoScale}); transform-origin: center center;">
                        ${
                          data.logo && sanitizeImageUrl(data.logo)
                            ? `<img src="${sanitizeImageUrl(data.logo)}" class="logo">`
                            : getGitLabLogo()
                        }
                    </div>
                    <h1 data-editable="text" data-field-key="title" data-placeholder="Titre de la présentation">${escapeHtml(
                      data.title || ""
                    )}</h1>
                    <div class="subtitle" data-editable="text" data-field-key="subtitle" data-placeholder="Sous-titre">${escapeHtml(
                      data.subtitle || ""
                    )}</div>
                    <div class="author" data-editable="text" data-field-key="author" data-placeholder="Auteur">${escapeHtml(
                      data.author || ""
                    )}</div>
                    <div class="date" data-editable="text" data-field-key="date" data-placeholder="Date">${escapeHtml(
                      data.date || ""
                    )}</div>
                </div>
            `;
}

/**
 * Render section template
 */
export function renderSectionTemplate(data, colorStyles) {
  return `
                <div class="slide-content template-section" ${colorStyles}>
                    <span class="section-number" data-editable="text" data-field-key="number" data-placeholder="01">${escapeHtml(
                      data.number || ""
                    )}</span>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre de section">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <div class="section-subtitle" data-editable="text" data-field-key="subtitle" data-placeholder="Sous-titre">${escapeHtml(
                      data.subtitle || ""
                    )}</div>
                </div>
            `;
}

/**
 * Render bullets template
 */
export function renderBulletsTemplate(data, colorStyles) {
  const showTag = data.showTag !== false;
  return `
                <div class="slide-content template-bullets" ${colorStyles}>
                    <div class="header-bar">
                        <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                          data.title || ""
                        )}</h2>
                        ${
                          showTag
                            ? `<span class="slide-tag" data-editable="text" data-field-key="tag" data-placeholder="Tag">${escapeHtml(
                                data.tag || ""
                              )}</span>`
                            : ""
                        }
                    </div>
                    <ul class="repeatable-list" data-list-key="items">
                        ${(data.items || [])
                          .map((item, i) => {
                            const isObject = typeof item === "object";
                            const text = isObject ? item.text : item;
                            const level = isObject ? item.level || 0 : 0;
                            return `<li class="repeatable-item" data-item-level="${level}" ${
                              level > 0 ? `data-level="${level}"` : ""
                            }><span class="item-text" data-editable="text" data-field-key="items" data-field-index="${i}" data-placeholder="Point ${
                              i + 1
                            }">${escapeHtml(
                              text || ""
                            )}</span><button class="delete-item-btn" data-list-key="items" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></li>`;
                          })
                          .join("")}
                        <li class="add-item-row"><button class="add-item-btn" data-list-key="items" title="Ajouter un élément">+ Ajouter</button></li>
                    </ul>
                </div>
            `;
}

/**
 * Render quote template
 */
export function renderQuoteTemplate(data, colorStyles) {
  const initials = (data.authorName || "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);
  return `
                <div class="slide-content template-quote" ${colorStyles}>
                    <div class="quote-content">
                        <blockquote data-editable="multiline" data-field-key="quote" data-placeholder="Citation">${escapeHtml(
                          data.quote || ""
                        )}</blockquote>
                        <div class="author-info">
                            <div class="author-avatar-container" data-editable="image" data-field-key="authorImage" style="position:relative;">
                                ${
                                  data.authorImage && sanitizeImageUrl(data.authorImage)
                                    ? `<img src="${sanitizeImageUrl(data.authorImage)}" class="author-avatar">`
                                    : `<div class="author-avatar">${escapeHtml(initials)}</div>`
                                }
                            </div>
                            <div>
                                <div class="author-name" data-editable="text" data-field-key="authorName" data-placeholder="Nom de l'auteur">${escapeHtml(
                                  data.authorName || ""
                                )}</div>
                                <div class="author-title" data-editable="text" data-field-key="authorTitle" data-placeholder="Titre de l'auteur">${escapeHtml(
                                  data.authorTitle || ""
                                )}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
}
