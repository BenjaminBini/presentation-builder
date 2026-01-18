// templates/components/data.js
// Data visualization templates: stats, timeline, agenda
// Requires: utils/html-utils.js (escapeHtml)
// Requires: templates/theme.js (getSlideColorStyles)

/**
 * Render stats template
 */
function renderStatsTemplate(data, colorStyles) {
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
function renderTimelineTemplate(data, colorStyles) {
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
function renderAgendaTemplate(data, colorStyles) {
  const agendaItems = data.items || [];
  const showDuration = data.showDuration !== false;
  return `
                <div class="slide-content template-agenda" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Agenda">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <ul class="agenda-list repeatable-list" data-list-key="items">
                        ${agendaItems
                          .map(
                            (item, i) => `
                            <li class="agenda-item repeatable-item">
                                <div class="agenda-number">${i + 1}</div>
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
                                <button class="delete-item-btn" data-list-key="items" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                            </li>
                        `
                          )
                          .join("")}
                        <li class="add-item-row"><button class="add-item-btn" data-list-key="items" title="Ajouter un point">+ Ajouter</button></li>
                    </ul>
                </div>
            `;
}
