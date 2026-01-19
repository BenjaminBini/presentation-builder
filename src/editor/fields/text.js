// src/editor/fields/text.js
// Text, textarea, number, checkbox, and toggle field renderers

import { escapeHtml } from '../../utils/html.js';

export function renderTextFields(field, value, placeholder, wrapperClass) {
    switch (field.type) {
        case 'text':
            return `
                <div class="${wrapperClass}">
                    <label>${field.label}${field.required ? ' <span class="required-mark">*</span>' : ''}</label>
                    <input type="text" value="${escapeHtml(value || '')}"
                           placeholder="${placeholder}"
                           onchange="updateField('${field.key}', this.value)"
                           oninput="updateField('${field.key}', this.value)">
                    ${field.hint ? `<small class="field-hint">${field.hint}</small>` : ''}
                </div>
            `;

        case 'number':
            return `
                <div class="${wrapperClass}">
                    <label>${field.label}</label>
                    <input type="number" value="${value || ''}"
                           placeholder="${placeholder || '0'}"
                           onchange="updateField('${field.key}', this.value ? parseInt(this.value) : null)"
                           oninput="updateField('${field.key}', this.value ? parseInt(this.value) : null)">
                    ${field.hint ? `<small class="field-hint">${field.hint}</small>` : ''}
                </div>
            `;

        case 'checkbox':
            return `
                <div class="${wrapperClass}">
                    <label class="checkbox-label">
                        <input type="checkbox" ${value ? 'checked' : ''}
                               onchange="updateField('${field.key}', this.checked)">
                        <span class="checkbox-text">${field.label}</span>
                    </label>
                    ${field.hint ? `<small class="field-hint">${field.hint}</small>` : ''}
                </div>
            `;

        case 'toggle':
            const isChecked = value !== false && (value === true || field.default !== false);
            return `
                <div class="${wrapperClass} toggle-field">
                    <label class="toggle-label">
                        <span class="toggle-text">${field.label}</span>
                        <input type="checkbox" class="toggle-input" ${isChecked ? 'checked' : ''}
                               onchange="updateField('${field.key}', this.checked)">
                        <span class="toggle-switch"></span>
                    </label>
                </div>
            `;

        case 'textarea':
            const isCode = field.key === 'code' || field.key === 'diagram';
            return `
                <div class="${wrapperClass}">
                    <label>${field.label}${field.required ? ' <span class="required-mark">*</span>' : ''}</label>
                    <textarea class="${isCode ? 'code-textarea' : ''}"
                              placeholder="${placeholder}"
                              onchange="updateField('${field.key}', this.value)"
                              oninput="updateField('${field.key}', this.value)">${escapeHtml(value || '')}</textarea>
                    ${field.hint ? `<small class="field-hint">${field.hint}</small>` : ''}
                </div>
            `;

        default:
            return '';
    }
}
