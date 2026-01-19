// src/editor/fields/complex.js
// Complex field renderers (annotations, timeline steps)

import { escapeHtml } from '../../utils/html.js';

export function renderAnnotationsField(field, annotations) {
    return `
        <div class="form-group full-width">
            <label>${field.label}</label>
            <small class="field-hint" style="margin-bottom: 10px;">Ajoutez des annotations pour expliquer des parties spécifiques du code.</small>
            <div class="annotations-editor">
                ${annotations.map((ann, i) => `
                    <div class="annotation-card">
                        <div class="annotation-card-header">
                            <div class="annotation-lines">
                                <span class="annotation-line-label">L.</span>
                                <input type="number" class="annotation-line-input" value="${ann.line || ''}"
                                       placeholder="1"
                                       onchange="updateAnnotationItem(${i}, 'line', parseInt(this.value))"
                                       oninput="updateAnnotationItem(${i}, 'line', parseInt(this.value))">
                                <span class="annotation-line-sep">→</span>
                                <input type="number" class="annotation-line-input" value="${ann.lineTo || ''}"
                                       placeholder="..."
                                       onchange="updateAnnotationItem(${i}, 'lineTo', this.value ? parseInt(this.value) : null)"
                                       oninput="updateAnnotationItem(${i}, 'lineTo', this.value ? parseInt(this.value) : null)">
                            </div>
                            <button class="annotation-delete" onclick="removeAnnotationItem(${i})" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                        </div>
                        <div class="annotation-card-content">
                            <input type="text" class="annotation-title-input" value="${escapeHtml(ann.title || '')}"
                                   placeholder="Titre (optionnel)"
                                   onchange="updateAnnotationItem(${i}, 'title', this.value)"
                                   oninput="updateAnnotationItem(${i}, 'title', this.value)">
                            <input type="text" class="annotation-text-input" value="${escapeHtml(ann.text || '')}"
                                   placeholder="Texte de l'annotation"
                                   onchange="updateAnnotationItem(${i}, 'text', this.value)"
                                   oninput="updateAnnotationItem(${i}, 'text', this.value)">
                        </div>
                    </div>
                `).join('')}
                <button class="array-add-btn" onclick="addAnnotationItem()">+ Ajouter une annotation</button>
            </div>
        </div>
    `;
}
