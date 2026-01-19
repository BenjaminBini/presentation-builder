// src/editor/fields/array.js
// Array field rendering

import { escapeHtml } from '../../utils/html.js';

export function renderArrayField(field, items) {
    return `
        <div class="form-group">
            <label>${field.label}${field.required ? ' *' : ''}</label>
            <div class="array-field">
                ${items.map((item, i) => `
                    <div class="array-item">
                        <input type="text" value="${escapeHtml(item)}"
                               onchange="updateArrayItem('${field.key}', ${i}, this.value)"
                               oninput="updateArrayItem('${field.key}', ${i}, this.value)">
                        <button onclick="removeArrayItem('${field.key}', ${i})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                `).join('')}
                <button class="array-add-btn" onclick="addArrayItem('${field.key}')">+ Ajouter</button>
            </div>
            ${field.hint ? `<small>${field.hint}</small>` : ''}
        </div>
    `;
}

export function renderColumnField(field, column) {
    const isLeft = field.key === 'left';
    const borderColor = isLeft ? 'var(--info)' : 'var(--confirm)';

    return `
        <div class="form-group full-width">
            <div class="column-editor" style="border-left-color: ${borderColor};">
                <div class="column-editor-header">
                    <span class="column-editor-label">${field.label}</span>
                    <input type="text" class="column-title-input" value="${escapeHtml(column.title || '')}"
                           placeholder="Titre de la colonne"
                           onchange="updateColumnField('${field.key}', 'title', this.value)"
                           oninput="updateColumnField('${field.key}', 'title', this.value)">
                </div>
                <div class="column-editor-items">
                    ${(column.items || []).map((item, i) => `
                        <div class="column-item">
                            <span class="column-item-bullet">•</span>
                            <input type="text" value="${escapeHtml(item)}"
                                   placeholder="Élément ${i + 1}"
                                   onchange="updateColumnItem('${field.key}', ${i}, this.value)"
                                   oninput="updateColumnItem('${field.key}', ${i}, this.value)">
                            <button class="column-item-delete" onclick="removeColumnItem('${field.key}', ${i})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                        </div>
                    `).join('')}
                    <button class="array-add-btn" onclick="addColumnItem('${field.key}')">+ Ajouter un élément</button>
                </div>
            </div>
        </div>
    `;
}

export function renderStatsField(field, stats) {
    return `
        <div class="form-group full-width">
            <label>${field.label}</label>
            ${field.hint ? `<small class="field-hint" style="margin-bottom: 10px;">${field.hint}</small>` : ''}
            <div class="stats-editor">
                ${stats.map((stat, i) => `
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <span class="stat-card-number">#${i + 1}</span>
                            <button class="stat-card-delete" onclick="removeStatItem(${i})" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                        </div>
                        <div class="stat-card-fields">
                            <div class="stat-field stat-field-value">
                                <input type="text" value="${escapeHtml(stat.value || '')}"
                                       placeholder="100K"
                                       onchange="updateStatItem(${i}, 'value', this.value)"
                                       oninput="updateStatItem(${i}, 'value', this.value)">
                                <span class="stat-field-label">Valeur</span>
                            </div>
                            <div class="stat-field">
                                <input type="text" value="${escapeHtml(stat.label || '')}"
                                       placeholder="Utilisateurs"
                                       onchange="updateStatItem(${i}, 'label', this.value)"
                                       oninput="updateStatItem(${i}, 'label', this.value)">
                                <span class="stat-field-label">Label</span>
                            </div>
                            <div class="stat-field stat-field-change">
                                <input type="text" value="${escapeHtml(stat.change || '')}"
                                       placeholder="+15%"
                                       onchange="updateStatItem(${i}, 'change', this.value)"
                                       oninput="updateStatItem(${i}, 'change', this.value)">
                                <span class="stat-field-label">Évolution</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
                <button class="array-add-btn" onclick="addStatItem()">+ Ajouter une statistique</button>
            </div>
        </div>
    `;
}

export function renderStepsField(field, steps) {
    return `
        <div class="form-group full-width">
            <label>${field.label}</label>
            ${field.hint ? `<small class="field-hint" style="margin-bottom: 10px;">${field.hint}</small>` : ''}
            <div class="steps-editor">
                ${steps.map((step, i) => `
                    <div class="step-card">
                        <div class="step-card-icon">
                            <input type="text" value="${escapeHtml(step.icon || '')}"
                                   placeholder="${i + 1}"
                                   onchange="updateStepItem(${i}, 'icon', this.value)"
                                   oninput="updateStepItem(${i}, 'icon', this.value)"
                                   maxlength="3">
                        </div>
                        <div class="step-card-content">
                            <input type="text" class="step-title-input" value="${escapeHtml(step.title || '')}"
                                   placeholder="Titre de l'étape"
                                   onchange="updateStepItem(${i}, 'title', this.value)"
                                   oninput="updateStepItem(${i}, 'title', this.value)">
                            <input type="text" class="step-desc-input" value="${escapeHtml(step.description || '')}"
                                   placeholder="Description optionnelle"
                                   onchange="updateStepItem(${i}, 'description', this.value)"
                                   oninput="updateStepItem(${i}, 'description', this.value)">
                        </div>
                        <button class="step-card-delete" onclick="removeStepItem(${i})" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                `).join('')}
                <button class="array-add-btn" onclick="addStepItem()">+ Ajouter une étape</button>
            </div>
        </div>
    `;
}

export function renderAgendaItemsField(field, items, showDuration = true) {
    return `
        <div class="form-group full-width">
            <label>${field.label}</label>
            ${field.hint ? `<small class="field-hint" style="margin-bottom: 10px;">${field.hint}</small>` : ''}
            <div class="agenda-editor">
                ${items.map((item, i) => `
                    <div class="agenda-item-card">
                        <div class="agenda-item-number">${i + 1}</div>
                        <div class="agenda-item-fields">
                            <input type="text" class="agenda-item-title" value="${escapeHtml(item.title || '')}"
                                   placeholder="Sujet"
                                   onchange="updateAgendaItem(${i}, 'title', this.value)"
                                   oninput="updateAgendaItem(${i}, 'title', this.value)">
                            <div class="agenda-item-row">
                                <input type="text" class="agenda-item-subtitle" value="${escapeHtml(item.subtitle || '')}"
                                       placeholder="Sous-titre (optionnel)"
                                       onchange="updateAgendaItem(${i}, 'subtitle', this.value)"
                                       oninput="updateAgendaItem(${i}, 'subtitle', this.value)">
                                ${showDuration ? `
                                <input type="text" class="agenda-item-duration" value="${escapeHtml(item.duration || '')}"
                                       placeholder="Durée"
                                       onchange="updateAgendaItem(${i}, 'duration', this.value)"
                                       oninput="updateAgendaItem(${i}, 'duration', this.value)">
                                ` : ''}
                            </div>
                        </div>
                        <button class="agenda-item-delete" onclick="removeAgendaItem(${i})" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                `).join('')}
                <button class="array-add-btn" onclick="addAgendaItem()">+ Ajouter un point</button>
            </div>
        </div>
    `;
}
