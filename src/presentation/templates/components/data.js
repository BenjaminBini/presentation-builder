// src/templates/components/data.js
// Data visualization templates: stats, timeline, agenda
import { escapeHtml } from '../../../infrastructure/utils/html.js';

/**
 * Render stats template
 */
export function renderStatsTemplate(data, colorStyles) {
  return `
                <div class="slide-content template-stats" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <div class="stats-grid repeatable-list" data-list-key="stats" data-list-type="object">
                        ${(data.stats || [])
                          .map(
                            (stat, i) => `
                            <div class="stat-card repeatable-item" data-item-index="${i}">
                                <button class="delete-item-btn" data-list-key="stats" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                                <div class="stat-value" data-editable="text" data-field-key="stats" data-field-index="${i}" data-field-subkey="value" data-placeholder="Valeur">${escapeHtml(
                              stat.value || ""
                            )}</div>
                                <div class="stat-label" data-editable="text" data-field-key="stats" data-field-index="${i}" data-field-subkey="label" data-placeholder="Label">${escapeHtml(
                              stat.label || ""
                            )}</div>
                                <span class="stat-change ${
                                  (stat.change || "").startsWith("-")
                                    ? "negative"
                                    : "positive"
                                }" data-editable="text" data-field-key="stats" data-field-index="${i}" data-field-subkey="change" data-placeholder="+0%">${escapeHtml(
                              stat.change || ""
                            )}</span>
                            </div>
                        `
                          )
                          .join("")}
                        <div class="stat-card add-item-row"><button class="add-item-btn" data-list-key="stats" data-list-type="object" title="Ajouter une statistique">+</button></div>
                    </div>
                </div>
            `;
}

/**
 * Render timeline template
 */
export function renderTimelineTemplate(data, colorStyles) {
  const stepCount = (data.steps || []).length;
  return `
                <div class="slide-content template-timeline" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <div class="timeline-wrapper">
                        <div class="timeline-line" style="left: calc(50% / ${
                          stepCount || 1
                        }); right: calc(50% / ${stepCount || 1});"></div>
                        <div class="timeline repeatable-list" data-list-key="steps" data-list-type="object">
                            ${(data.steps || [])
                              .map(
                                (step, i) => `
                                <div class="timeline-item repeatable-item" data-item-index="${i}">
                                    <button class="delete-item-btn" data-list-key="steps" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                                    <div class="timeline-icon" data-editable="text" data-field-key="steps" data-field-index="${i}" data-field-subkey="icon" data-placeholder="${
                                  i + 1
                                }">${escapeHtml(
                                  step.icon || String(i + 1)
                                )}</div>
                                    <div class="timeline-title" data-editable="text" data-field-key="steps" data-field-index="${i}" data-field-subkey="title" data-placeholder="Étape ${
                                  i + 1
                                }">${escapeHtml(step.title || "")}</div>
                                    <div class="timeline-desc" data-editable="text" data-field-key="steps" data-field-index="${i}" data-field-subkey="description" data-placeholder="Description">${escapeHtml(
                                  step.description || ""
                                )}</div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                        <div class="timeline-add-btn-wrapper">
                            <button class="add-item-btn" data-list-key="steps" data-list-type="object" title="Ajouter une étape">+</button>
                        </div>
                    </div>
                </div>
            `;
}

/**
 * Render agenda template
 */
export function renderAgendaTemplate(data, colorStyles) {
  const agendaItems = data.items || [];
  const showDuration = data.showDuration !== false;
  const itemCount = Math.max(1, agendaItems.length);

  // Calculate scale factor to fit items in available height
  // Slide: 720px, title area: ~110px, padding: ~100px, button: ~60px = ~450px available
  const availableHeight = 450;
  const idealItemHeight = 88; // Comfortable height per item at scale 1
  const naturalHeight = itemCount * idealItemHeight;
  const scale = Math.min(1, availableHeight / naturalHeight);
  // Clamp scale to reasonable bounds (0.45 to 1)
  const clampedScale = Math.max(0.45, Math.min(1, scale));
  // Add compact class when items are small (subtitle goes inline)
  const compactClass = clampedScale < 0.7 ? 'agenda-compact' : '';

  return `
                <div class="slide-content template-agenda ${compactClass}" ${colorStyles} style="--agenda-scale: ${clampedScale.toFixed(3)}; --agenda-items: ${itemCount};" data-item-count="${itemCount}">
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Agenda">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <ul class="agenda-list repeatable-list" data-list-key="items"
                        ondragover="window.handleListItemDragOver(event)"
                        ondragleave="window.handleListItemDragLeave(event)"
                        ondrop="window.handleListItemDrop(event)">
                        ${agendaItems
                          .map(
                            (item, i) => `
                            <li class="agenda-item repeatable-item" data-item-index="${i}">
                                <button class="delete-item-btn" data-list-key="items" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                                <div class="agenda-number"
                                     draggable="true"
                                     ondragstart="window.handleListItemDragStart(event, 'items', ${i})"
                                     ondragend="window.handleListItemDragEnd(event)">${i + 1}</div>
                                <div class="agenda-content">
                                    <div class="agenda-title" data-editable="text" data-field-key="items" data-field-index="${i}" data-field-subkey="title" data-placeholder="Sujet ${
                              i + 1
                            }">${escapeHtml(item.title || "")}</div>
                                    ${
                                      item.subtitle
                                        ? `<div class="agenda-subtitle">${escapeHtml(
                                            item.subtitle
                                          )}</div>`
                                        : ""
                                    }
                                </div>
                                ${
                                  showDuration
                                    ? `<div class="agenda-duration" data-editable="text" data-field-key="items" data-field-index="${i}" data-field-subkey="duration" data-placeholder="Durée">${escapeHtml(
                                        item.duration || ""
                                      )}</div>`
                                    : ""
                                }
                            </li>
                        `
                          )
                          .join("")}
                    </ul>
                    <button class="add-item-btn agenda-add-btn" data-list-key="items" title="Ajouter un point">+ Ajouter</button>
                </div>
            `;
}
