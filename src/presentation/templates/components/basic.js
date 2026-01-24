// src/templates/components/basic.js
// Basic slide templates: cover, title, section, bullets, quote
import { escapeHtml, sanitizeImageUrl } from '../../../infrastructure/utils/html.js';
import { getGitLabLogo } from '../../../infrastructure/utils/svg.js';

/**
 * Render cover template - opening slide with split layout
 */
export function renderCoverTemplate(data, colorStyles) {
  const logoScale = (data.logoSize || 100) / 100;
  return `
                <div class="slide-content template-cover" ${colorStyles}>
                    <div class="cover-accent">
                        <div class="cover-accent-pattern"></div>
                    </div>
                    <div class="cover-content">
                        <div class="cover-logo" data-editable="image" data-field-key="logo" style="position:relative; transform: scale(${logoScale}); transform-origin: left center;">
                            ${
                              data.logo && sanitizeImageUrl(data.logo)
                                ? `<img src="${sanitizeImageUrl(data.logo)}" class="logo">`
                                : getGitLabLogo()
                            }
                        </div>
                        <div class="cover-text">
                            <h1 data-editable="text" data-field-key="title" data-placeholder="Titre de la présentation">${escapeHtml(
                              data.title || ""
                            )}</h1>
                            <div class="cover-subtitle" data-editable="text" data-field-key="subtitle" data-placeholder="Sous-titre">${escapeHtml(
                              data.subtitle || ""
                            )}</div>
                        </div>
                        <div class="cover-meta">
                            <div class="cover-author" data-editable="text" data-field-key="author" data-placeholder="Auteur">${escapeHtml(
                              data.author || ""
                            )}</div>
                            <div class="cover-date" data-editable="text" data-field-key="date" data-placeholder="Date">${escapeHtml(
                              data.date || ""
                            )}</div>
                        </div>
                    </div>
                </div>
            `;
}

/**
 * Render cover-wide template - wider accent area with geometric shapes
 */
export function renderCoverWideTemplate(data, colorStyles) {
  const logoScale = (data.logoSize || 100) / 100;
  return `
                <div class="slide-content template-cover-wide" ${colorStyles}>
                    <div class="cover-accent">
                        <div class="cover-shape cover-shape-1"></div>
                        <div class="cover-shape cover-shape-2"></div>
                        <div class="cover-shape cover-shape-3"></div>
                    </div>
                    <div class="cover-content">
                        <div class="cover-logo" data-editable="image" data-field-key="logo" style="position:relative; transform: scale(${logoScale}); transform-origin: left center;">
                            ${
                              data.logo && sanitizeImageUrl(data.logo)
                                ? `<img src="${sanitizeImageUrl(data.logo)}" class="logo">`
                                : getGitLabLogo()
                            }
                        </div>
                        <div class="cover-text">
                            <h1 data-editable="text" data-field-key="title" data-placeholder="Titre de la présentation">${escapeHtml(
                              data.title || ""
                            )}</h1>
                            <div class="cover-subtitle" data-editable="text" data-field-key="subtitle" data-placeholder="Sous-titre">${escapeHtml(
                              data.subtitle || ""
                            )}</div>
                        </div>
                        <div class="cover-meta">
                            <div class="cover-author" data-editable="text" data-field-key="author" data-placeholder="Auteur">${escapeHtml(
                              data.author || ""
                            )}</div>
                            <div class="cover-date" data-editable="text" data-field-key="date" data-placeholder="Date">${escapeHtml(
                              data.date || ""
                            )}</div>
                        </div>
                    </div>
                </div>
            `;
}

/**
 * Render cover-gradient template - full gradient background with accent shapes
 */
export function renderCoverGradientTemplate(data, colorStyles) {
  const logoScale = (data.logoSize || 100) / 100;
  return `
                <div class="slide-content template-cover-gradient" ${colorStyles}>
                    <div class="cover-shapes">
                        <div class="cover-shape cover-shape-1"></div>
                        <div class="cover-shape cover-shape-2"></div>
                    </div>
                    <div class="cover-content">
                        <div class="cover-logo" data-editable="image" data-field-key="logo" style="position:relative; transform: scale(${logoScale}); transform-origin: left center;">
                            ${
                              data.logo && sanitizeImageUrl(data.logo)
                                ? `<img src="${sanitizeImageUrl(data.logo)}" class="logo">`
                                : getGitLabLogo()
                            }
                        </div>
                        <div class="cover-text">
                            <h1 data-editable="text" data-field-key="title" data-placeholder="Titre de la présentation">${escapeHtml(
                              data.title || ""
                            )}</h1>
                            <div class="cover-subtitle" data-editable="text" data-field-key="subtitle" data-placeholder="Sous-titre">${escapeHtml(
                              data.subtitle || ""
                            )}</div>
                        </div>
                        <div class="cover-meta">
                            <div class="cover-author" data-editable="text" data-field-key="author" data-placeholder="Auteur">${escapeHtml(
                              data.author || ""
                            )}</div>
                            <div class="cover-date" data-editable="text" data-field-key="date" data-placeholder="Date">${escapeHtml(
                              data.date || ""
                            )}</div>
                        </div>
                    </div>
                </div>
            `;
}

/**
 * Render cover-diagonal template - diagonal split layout
 */
export function renderCoverDiagonalTemplate(data, colorStyles) {
  const logoScale = (data.logoSize || 100) / 100;
  return `
                <div class="slide-content template-cover-diagonal" ${colorStyles}>
                    <div class="cover-accent"></div>
                    <div class="cover-content">
                        <div class="cover-logo" data-editable="image" data-field-key="logo" style="position:relative; transform: scale(${logoScale}); transform-origin: left center;">
                            ${
                              data.logo && sanitizeImageUrl(data.logo)
                                ? `<img src="${sanitizeImageUrl(data.logo)}" class="logo">`
                                : getGitLabLogo()
                            }
                        </div>
                        <div class="cover-text">
                            <h1 data-editable="text" data-field-key="title" data-placeholder="Titre de la présentation">${escapeHtml(
                              data.title || ""
                            )}</h1>
                            <div class="cover-subtitle" data-editable="text" data-field-key="subtitle" data-placeholder="Sous-titre">${escapeHtml(
                              data.subtitle || ""
                            )}</div>
                        </div>
                        <div class="cover-meta">
                            <div class="cover-author" data-editable="text" data-field-key="author" data-placeholder="Auteur">${escapeHtml(
                              data.author || ""
                            )}</div>
                            <div class="cover-date" data-editable="text" data-field-key="date" data-placeholder="Date">${escapeHtml(
                              data.date || ""
                            )}</div>
                        </div>
                    </div>
                </div>
            `;
}

/**
 * Render cover-shapes template - floating accent shapes scattered
 */
export function renderCoverShapesTemplate(data, colorStyles) {
  const logoScale = (data.logoSize || 100) / 100;
  return `
                <div class="slide-content template-cover-shapes" ${colorStyles}>
                    <div class="cover-shapes">
                        <div class="cover-shape cover-shape-1"></div>
                        <div class="cover-shape cover-shape-2"></div>
                        <div class="cover-shape cover-shape-3"></div>
                        <div class="cover-shape cover-shape-4"></div>
                        <div class="cover-shape cover-shape-5"></div>
                    </div>
                    <div class="cover-content">
                        <div class="cover-logo" data-editable="image" data-field-key="logo" style="position:relative; transform: scale(${logoScale}); transform-origin: left center;">
                            ${
                              data.logo && sanitizeImageUrl(data.logo)
                                ? `<img src="${sanitizeImageUrl(data.logo)}" class="logo">`
                                : getGitLabLogo()
                            }
                        </div>
                        <div class="cover-text">
                            <h1 data-editable="text" data-field-key="title" data-placeholder="Titre de la présentation">${escapeHtml(
                              data.title || ""
                            )}</h1>
                            <div class="cover-subtitle" data-editable="text" data-field-key="subtitle" data-placeholder="Sous-titre">${escapeHtml(
                              data.subtitle || ""
                            )}</div>
                        </div>
                        <div class="cover-meta">
                            <div class="cover-author" data-editable="text" data-field-key="author" data-placeholder="Auteur">${escapeHtml(
                              data.author || ""
                            )}</div>
                            <div class="cover-date" data-editable="text" data-field-key="date" data-placeholder="Date">${escapeHtml(
                              data.date || ""
                            )}</div>
                        </div>
                    </div>
                </div>
            `;
}

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
 * Render section-diagonal template - diagonal split with accent color
 */
export function renderSectionDiagonalTemplate(data, colorStyles) {
  return `
                <div class="slide-content template-section-diagonal" ${colorStyles}>
                    <div class="section-accent"></div>
                    <div class="section-content">
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
                </div>
            `;
}

/**
 * Render section-minimal template - white background with accent underline
 */
export function renderSectionMinimalTemplate(data, colorStyles) {
  return `
                <div class="slide-content template-section-minimal" ${colorStyles}>
                    <div class="section-content">
                        <span class="section-number" data-editable="text" data-field-key="number" data-placeholder="01">${escapeHtml(
                          data.number || ""
                        )}</span>
                        <h2 data-editable="text" data-field-key="title" data-placeholder="Titre de section">${escapeHtml(
                          data.title || ""
                        )}</h2>
                        <div class="section-underline"></div>
                        <div class="section-subtitle" data-editable="text" data-field-key="subtitle" data-placeholder="Sous-titre">${escapeHtml(
                          data.subtitle || ""
                        )}</div>
                    </div>
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
