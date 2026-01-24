// src/templates/components/layout.js
// Layout templates: two-column, image-text
import {
  escapeHtml,
  sanitizeHtml,
  sanitizeImageUrl,
  trimHtml,
} from "../../../infrastructure/utils/html.js";
import { adjustTextFieldScale } from "../../components/text-field.js";

/**
 * Render two-columns template with WYSIWYG content
 */
export function renderTwoColumnsTemplate(data, colorStyles) {
  const showTag = data.showTag === true;
  const leftRaw = data.left?.content || "<p>Contenu colonne gauche...</p>";
  const rightRaw = data.right?.content || "<p>Contenu colonne droite...</p>";
  const leftContent = trimHtml(sanitizeHtml(leftRaw));
  const rightContent = trimHtml(sanitizeHtml(rightRaw));

  return `
                <div class="slide-content template-two-columns" ${colorStyles}>
                    <div class="header-bar">
                        <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                          data.title || "",
                        )}</h2>
                        ${showTag ? `<span class="slide-tag" data-editable="text" data-field-key="tag" data-placeholder="Tag">${escapeHtml(data.tag || "")}</span>` : ""}
                    </div>
                    <div class="columns">
                        <div class="column" data-text-field>
                            <div class="text-content-container" data-text-field-area>
                                <div class="text-content text-field-content wysiwyg-editable" data-text-field-content data-editable="wysiwyg" data-field-key="left.content">
                                    ${leftContent}
                                </div>
                            </div>
                        </div>
                        <div class="column" data-text-field>
                            <div class="text-content-container" data-text-field-area>
                                <div class="text-content text-field-content wysiwyg-editable" data-text-field-content data-editable="wysiwyg" data-field-key="right.content">
                                    ${rightContent}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
}

/**
 * Render text template with WYSIWYG content
 * Uses TextFieldComponent for auto-scaling
 */
export function renderTextTemplate(data, colorStyles) {
  const rawContent = data.content || "<p>Votre texte ici...</p>";
  // Sanitize HTML to prevent XSS, then trim trailing whitespace/br tags
  const content = trimHtml(sanitizeHtml(rawContent));
  const showTag = data.showTag === true;

  return `
                <div class="slide-content template-text" ${colorStyles} data-text-field>
                    <div class="header-bar">
                        <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                          data.title || "",
                        )}</h2>
                        ${showTag ? `<span class="slide-tag" data-editable="text" data-field-key="tag" data-placeholder="Tag">${escapeHtml(data.tag || "")}</span>` : ""}
                    </div>
                    <div class="text-content-container" data-text-field-area>
                        <div class="text-content text-field-content wysiwyg-editable" data-text-field-content data-editable="wysiwyg" data-field-key="content">
                            ${content}
                        </div>
                    </div>
                </div>
            `;
}

/**
 * Adjust text template scale based on actual DOM measurements
 * Delegates to TextFieldComponent for the actual scaling logic
 * @deprecated Use adjustTextFieldScale directly for new code
 */
export function adjustTextTemplateScale(container) {
  adjustTextFieldScale(container);
}

/**
 * Render image-text template with WYSIWYG content
 * Uses TextFieldComponent for auto-scaling
 */
export function renderImageTextTemplate(data, colorStyles) {
  // Support both 'content' (new WYSIWYG) and 'text' (legacy) fields
  let rawContent = data.content;
  if (!rawContent) {
    // Convert legacy text field to HTML
    const textArray = Array.isArray(data.text)
      ? data.text
      : (data.text || "").split("\n");
    rawContent = textArray.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  }
  const content = rawContent
    ? trimHtml(sanitizeHtml(rawContent))
    : "<p>Votre texte ici...</p>";
  const showTag = data.showTag === true;
  const imageRight = data.imageRight === true;

  return `
                <div class="slide-content template-image-text${imageRight ? ' image-right' : ''}" ${colorStyles}>
                    <div class="image-side" data-editable="image" data-field-key="image" style="position:relative;cursor:pointer;">
                        ${
                          data.image && sanitizeImageUrl(data.image)
                            ? `<img src="${sanitizeImageUrl(data.image)}" alt="${escapeHtml(
                                data.imageAlt || "",
                              )}">`
                            : '<div class="image-placeholder"><svg style="width:64px;height:64px;stroke:currentColor;stroke-width:1.5;fill:none;" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>'
                        }
                    </div>
                    <div class="text-side" data-text-field>
                        <div class="header-bar">
                            <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                              data.title || "",
                            )}</h2>
                            ${showTag ? `<span class="slide-tag" data-editable="text" data-field-key="tag" data-placeholder="Tag">${escapeHtml(data.tag || "")}</span>` : ""}
                        </div>
                        <div class="text-content-container" data-text-field-area>
                            <div class="text-content text-field-content wysiwyg-editable" data-text-field-content data-editable="wysiwyg" data-field-key="content">
                                ${content}
                            </div>
                        </div>
                    </div>
                </div>
            `;
}
