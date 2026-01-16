// slide-editor-editor.js
// Editor panel and form field rendering functions

// ============================================================================
// MAIN EDITOR RENDERING
// ============================================================================

// Template descriptions for better UX
const TEMPLATE_DESCRIPTIONS = {
    title: 'Slide de couverture avec titre principal, sous-titre et informations de présentation.',
    section: 'Slide de transition pour introduire une nouvelle partie.',
    bullets: 'Liste à puces pour présenter des points clés.',
    'two-columns': 'Contenu organisé en deux colonnes côte à côte.',
    'image-text': 'Image accompagnée d\'un texte explicatif.',
    quote: 'Citation mise en avant avec attribution.',
    stats: 'Chiffres clés et statistiques visuellement impactants.',
    code: 'Bloc de code avec coloration syntaxique.',
    'code-annotated': 'Code avec annotations explicatives sur le côté.',
    timeline: 'Étapes ou événements présentés chronologiquement.',
    comparison: 'Tableau de données avec possibilité de mise en avant.',
    mermaid: 'Diagramme généré à partir de code Mermaid.'
};

// Field grouping configuration per template
const FIELD_GROUPS = {
    title: [
        { label: 'Contenu principal', fields: ['title', 'subtitle'] },
        { label: 'Informations', fields: ['author', 'date', 'logo'] }
    ],
    quote: [
        { label: 'Citation', fields: ['quote'] },
        { label: 'Attribution', fields: ['authorName', 'authorTitle', 'authorImage'] }
    ],
    'code-annotated': [
        { label: 'Code', fields: ['title', 'filename', 'code'] },
        { label: 'Affichage', fields: ['startLine', 'notEndOfFile'] },
        { label: 'Annotations', fields: ['annotations'] }
    ],
    'image-text': [
        { label: 'Contenu', fields: ['title', 'text'] },
        { label: 'Image', fields: ['image', 'imageAlt'] }
    ],
    comparison: [
        { label: 'En-tête', fields: ['title'] },
        { label: 'Structure', fields: ['columns', 'highlightColumn'] },
        { label: 'Données', fields: ['rows'] }
    ]
};

function renderEditor() {
    const container = document.getElementById('editorContent');

    if (selectedSlideIndex < 0 || !currentProject.slides[selectedSlideIndex]) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><svg class="icon icon-xl" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
                <h3>Aucune slide sélectionnée</h3>
                <p>Sélectionnez une slide ou ajoutez-en une nouvelle</p>
            </div>
        `;
        return;
    }

    const slide = currentProject.slides[selectedSlideIndex];
    const template = TEMPLATES[slide.template];

    if (!template) {
        container.innerHTML = '<p>Template inconnu</p>';
        return;
    }

    // Render color settings as inline toolbar
    const colorSettings = TEMPLATE_COLOR_SETTINGS[slide.template] || [];
    const slideColors = slide.data.colors || {};

    const colorItemsHtml = colorSettings.map(setting => {
        const currentValue = slideColors[setting.key] || setting.default;
        return renderInlineColorSelector(setting.key, setting.label, currentValue);
    }).join('');

    // Render template-specific settings
    const templateSettingsHtml = renderTemplateSettings(slide);

    container.innerHTML = `
        <div class="editor-toolbar">
            <div class="editor-toolbar-section">
                <span class="editor-toolbar-label">Couleurs</span>
                <div class="color-toolbar">
                    ${colorItemsHtml}
                </div>
            </div>
            ${templateSettingsHtml}
        </div>
    `;
}

// Render template-specific settings (sliders, toggles, etc.)
function renderTemplateSettings(slide) {
    const settings = [];

    if (slide.template === 'title') {
        const logoSize = slide.data.logoSize || 100;
        settings.push(`
            <div class="editor-toolbar-section">
                <span class="editor-toolbar-label">Logo</span>
                <div class="slider-control">
                    <input type="range" min="50" max="200" value="${logoSize}"
                           oninput="updateField('logoSize', parseInt(this.value)); this.nextElementSibling.textContent = this.value + '%'">
                    <span class="slider-value">${logoSize}%</span>
                </div>
            </div>
        `);
    }

    if (slide.template === 'bullets') {
        const showTag = slide.data.showTag !== false;
        settings.push(`
            <div class="editor-toolbar-section">
                <label class="toolbar-toggle">
                    <input type="checkbox" ${showTag ? 'checked' : ''}
                           onchange="updateField('showTag', this.checked); updatePreview();">
                    <span class="toolbar-toggle-label">Tag</span>
                </label>
            </div>
        `);
    }

    if (slide.template === 'agenda') {
        const showDuration = slide.data.showDuration !== false;
        settings.push(`
            <div class="editor-toolbar-section editor-toolbar-section-block">
                <span class="editor-toolbar-label">Affichage</span>
                <label class="toolbar-toggle">
                    <input type="checkbox" ${showDuration ? 'checked' : ''}
                           onchange="updateField('showDuration', this.checked); updatePreview();">
                    <span class="toolbar-toggle-label">Durées</span>
                </label>
            </div>
        `);
    }

    return settings.join('');
}

// Render an inline color selector (compact toolbar style)
function renderInlineColorSelector(key, label, currentValue) {
    const themeColors = Object.keys(COLOR_LABELS);
    const grayColors = Object.keys(GRAY_PALETTE);

    return `
        <div class="inline-color-selector" data-color-key="${key}">
            <button class="inline-color-btn" onclick="toggleColorPicker('${key}')" title="${label}">
                <span class="inline-color-swatch" style="background-color: var(--${currentValue});"></span>
                <span class="inline-color-label">${label}</span>
            </button>
            <div class="inline-color-dropdown" id="colorDropdown-${key}">
                <div class="color-swatches-row">
                    ${themeColors.map(color => `
                        <button type="button"
                            class="color-swatch-btn ${currentValue === color ? 'selected' : ''}"
                            style="background-color: var(--${color});"
                            onclick="selectSlideColor('${key}', '${color}')">
                            <span class="color-tooltip">${COLOR_LABELS[color]}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="color-swatches-row">
                    ${grayColors.map(color => `
                        <button type="button"
                            class="color-swatch-btn ${currentValue === color ? 'selected' : ''}"
                            style="background-color: var(--${color});"
                            onclick="selectSlideColor('${key}', '${color}')">
                            <span class="color-tooltip">${GRAY_LABELS[color]}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Legacy color selector (keeping for compatibility)
function renderColorSelector(key, label, currentValue) {
    return renderInlineColorSelector(key, label, currentValue);
}

// Toggle color picker dropdown
function toggleColorPicker(key) {
    const dropdown = document.getElementById(`colorDropdown-${key}`);
    const selector = dropdown.closest('.inline-color-selector') || dropdown.closest('.color-selector-group');
    const isOpen = dropdown.classList.contains('open');

    // Close all other dropdowns
    document.querySelectorAll('.inline-color-dropdown.open, .color-swatches-dropdown.open').forEach(el => {
        el.classList.remove('open');
        const parent = el.closest('.inline-color-selector') || el.closest('.color-selector-group');
        if (parent) parent.classList.remove('picker-open');
    });

    // Toggle this one
    if (!isOpen) {
        dropdown.classList.add('open');
        if (selector) selector.classList.add('picker-open');
    }
}

// Select color and close dropdown
function selectSlideColor(key, value) {
    updateSlideColor(key, value);
    // Dropdown will close when editor re-renders
}

// Update slide color setting
function updateSlideColor(key, value) {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data.colors) {
            currentProject.slides[selectedSlideIndex].data.colors = {};
        }
        currentProject.slides[selectedSlideIndex].data.colors[key] = value;
        renderEditor();
        updatePreview();
        markAsChanged();
    }
}

// ============================================================================
// FIELD RENDERING
// ============================================================================

// Placeholders for better UX
const FIELD_PLACEHOLDERS = {
    title: 'Entrez le titre...',
    subtitle: 'Sous-titre optionnel',
    author: 'Nom de l\'auteur',
    date: 'Ex: Janvier 2025',
    logo: 'https://example.com/logo.png',
    number: '01',
    tag: 'Ex: Feature, Important...',
    image: 'https://example.com/image.jpg',
    imageAlt: 'Description de l\'image',
    text: 'Votre texte ici...',
    quote: 'Entrez la citation...',
    authorName: 'Nom de l\'auteur',
    authorTitle: 'Fonction ou titre',
    authorImage: 'URL de la photo',
    filename: 'fichier.js',
    code: '// Votre code ici...',
    description: 'Description optionnelle',
    diagram: 'flowchart LR\n    A-->B'
};

function renderField(field, data) {
    const value = data[field.key];
    const placeholder = FIELD_PLACEHOLDERS[field.key] || '';
    const isFullWidth = ['textarea', 'array', 'stats', 'steps', 'annotations', 'rows', 'table-rows', 'column'].includes(field.type);
    const wrapperClass = isFullWidth ? 'form-group full-width' : 'form-group';

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

        case 'array':
            return renderArrayField(field, value || []);

        case 'column':
            return renderColumnField(field, value || { title: '', items: [] });

        case 'stats':
            return renderStatsField(field, value || []);

        case 'annotations':
            return renderAnnotationsField(field, value || []);

        case 'steps':
            return renderStepsField(field, value || []);

        case 'rows':
            return renderRowsField(field, value || []);

        case 'table-rows':
            return renderTableRowsField(field, value || []);

        case 'agenda-items':
            return renderAgendaItemsField(field, value || []);

        default:
            return '';
    }
}

// ============================================================================
// COMPLEX FIELD RENDERERS
// ============================================================================

function renderArrayField(field, items) {
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

function renderColumnField(field, column) {
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

function renderStatsField(field, stats) {
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

function renderAnnotationsField(field, annotations) {
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

function renderStepsField(field, steps) {
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

function renderRowsField(field, rows) {
    const slide = currentProject.slides[selectedSlideIndex];
    const columns = slide.data.columns || ['Col 1', 'Col 2'];

    return `
        <div class="form-group">
            <label>${field.label}</label>
            <div class="array-field">
                ${rows.map((row, i) => `
                    <div class="object-item">
                        <div class="object-item-header">
                            <span class="object-item-title">Ligne ${i + 1}</span>
                            <button class="slide-item-btn delete" onclick="removeRowItem(${i})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                        </div>
                        ${columns.map((col, j) => `
                            <div class="form-group">
                                <label>${escapeHtml(col)}</label>
                                <input type="text" value="${escapeHtml(String(row[j] ?? ''))}"
                                       onchange="updateRowCell(${i}, ${j}, this.value)"
                                       oninput="updateRowCell(${i}, ${j}, this.value)"
                                       placeholder="true/false ou texte">
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
                <button class="array-add-btn" onclick="addRowItem()">+ Ajouter une ligne</button>
            </div>
        </div>
    `;
}

function renderTableRowsField(field, rows) {
    const slide = currentProject.slides[selectedSlideIndex];
    const columns = slide.data.columns || ['Col 1', 'Col 2', 'Col 3'];

    return `
        <div class="form-group">
            <label>${field.label}</label>
            ${field.hint ? `<small style="display: block; color: var(--gray-500); margin-bottom: 8px;">${field.hint}</small>` : ''}
            <div class="table-editor">
                <table class="table-editor-grid">
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${escapeHtml(col)}</th>`).join('')}
                            <th class="table-actions-col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map((row, i) => `
                            <tr>
                                ${columns.map((_, j) => `
                                    <td>
                                        <input type="text"
                                               value="${escapeHtml(String(row[j] ?? ''))}"
                                               onchange="updateTableCell(${i}, ${j}, this.value)"
                                               oninput="updateTableCell(${i}, ${j}, this.value)"
                                               placeholder="...">
                                    </td>
                                `).join('')}
                                <td class="table-actions-col">
                                    <button class="slide-item-btn delete" onclick="removeTableRow(${i})" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="array-add-btn" onclick="addTableRow()">+ Ajouter une ligne</button>
            </div>
        </div>
    `;
}

function renderAgendaItemsField(field, items) {
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
                                <input type="text" class="agenda-item-duration" value="${escapeHtml(item.duration || '')}"
                                       placeholder="Durée"
                                       onchange="updateAgendaItem(${i}, 'duration', this.value)"
                                       oninput="updateAgendaItem(${i}, 'duration', this.value)">
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

// ============================================================================
// FIELD UPDATE HANDLERS
// ============================================================================

function updateField(key, value) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data[key] = value;
        updatePreview();
        if (key === 'title' || key === 'quote') {
            renderSlideList();
        }
    }
}

function changeTemplate(newTemplate) {
    if (selectedSlideIndex >= 0) {
        const oldData = currentProject.slides[selectedSlideIndex].data;
        currentProject.slides[selectedSlideIndex].template = newTemplate;
        currentProject.slides[selectedSlideIndex].data = {
            ...getDefaultData(newTemplate),
            title: oldData.title || getDefaultData(newTemplate).title
        };
        renderSlideList();
        renderEditor();
        updatePreview();
    }
}

// Array field functions
function updateArrayItem(key, index, value) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data[key][index] = value;
        updatePreview();
    }
}

function addArrayItem(key) {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data[key]) {
            currentProject.slides[selectedSlideIndex].data[key] = [];
        }
        currentProject.slides[selectedSlideIndex].data[key].push('Nouvel élément');
        renderEditor();
        updatePreview();
    }
}

function removeArrayItem(key, index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data[key].splice(index, 1);
        renderEditor();
        updatePreview();
    }
}

// Column field functions
function updateColumnField(key, field, value) {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data[key]) {
            currentProject.slides[selectedSlideIndex].data[key] = { title: '', items: [] };
        }
        currentProject.slides[selectedSlideIndex].data[key][field] = value;
        updatePreview();
    }
}

function updateColumnItem(key, index, value) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data[key].items[index] = value;
        updatePreview();
    }
}

function addColumnItem(key) {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data[key].items) {
            currentProject.slides[selectedSlideIndex].data[key].items = [];
        }
        currentProject.slides[selectedSlideIndex].data[key].items.push('Nouvel item');
        renderEditor();
        updatePreview();
    }
}

function removeColumnItem(key, index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data[key].items.splice(index, 1);
        renderEditor();
        updatePreview();
    }
}

// Stats field functions
function updateStatItem(index, field, value) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.stats[index][field] = value;
        updatePreview();
    }
}

function addStatItem() {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data.stats) {
            currentProject.slides[selectedSlideIndex].data.stats = [];
        }
        currentProject.slides[selectedSlideIndex].data.stats.push({ value: '0', label: 'Label', change: '' });
        renderEditor();
        updatePreview();
    }
}

function removeStatItem(index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.stats.splice(index, 1);
        renderEditor();
        updatePreview();
    }
}

// Annotation field functions
function updateAnnotationItem(index, field, value) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.annotations[index][field] = value;
        updatePreview();
    }
}

function addAnnotationItem() {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data.annotations) {
            currentProject.slides[selectedSlideIndex].data.annotations = [];
        }
        currentProject.slides[selectedSlideIndex].data.annotations.push({ line: 1, text: 'Annotation' });
        renderEditor();
        updatePreview();
    }
}

function removeAnnotationItem(index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.annotations.splice(index, 1);
        renderEditor();
        updatePreview();
    }
}

// Step field functions
function updateStepItem(index, field, value) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.steps[index][field] = value;
        updatePreview();
    }
}

function addStepItem() {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data.steps) {
            currentProject.slides[selectedSlideIndex].data.steps = [];
        }
        const num = currentProject.slides[selectedSlideIndex].data.steps.length + 1;
        currentProject.slides[selectedSlideIndex].data.steps.push({ icon: String(num), title: `Étape ${num}`, description: '' });
        renderEditor();
        updatePreview();
    }
}

function removeStepItem(index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.steps.splice(index, 1);
        renderEditor();
        updatePreview();
    }
}

// Row field functions
function updateRowCell(rowIndex, colIndex, value) {
    if (selectedSlideIndex >= 0) {
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        currentProject.slides[selectedSlideIndex].data.rows[rowIndex][colIndex] = value;
        updatePreview();
    }
}

function addRowItem() {
    if (selectedSlideIndex >= 0) {
        const columns = currentProject.slides[selectedSlideIndex].data.columns || [];
        const newRow = columns.map(() => '');
        if (!currentProject.slides[selectedSlideIndex].data.rows) {
            currentProject.slides[selectedSlideIndex].data.rows = [];
        }
        currentProject.slides[selectedSlideIndex].data.rows.push(newRow);
        renderEditor();
        updatePreview();
    }
}

function removeRowItem(index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.rows.splice(index, 1);
        renderEditor();
        updatePreview();
    }
}

// Table field functions (for generic tables)
function updateTableCell(rowIndex, colIndex, value) {
    if (selectedSlideIndex >= 0) {
        // Keep as string for tables (no boolean conversion)
        currentProject.slides[selectedSlideIndex].data.rows[rowIndex][colIndex] = value;
        updatePreview();
    }
}

function addTableRow() {
    if (selectedSlideIndex >= 0) {
        const columns = currentProject.slides[selectedSlideIndex].data.columns || [];
        const newRow = columns.map(() => '');
        if (!currentProject.slides[selectedSlideIndex].data.rows) {
            currentProject.slides[selectedSlideIndex].data.rows = [];
        }
        currentProject.slides[selectedSlideIndex].data.rows.push(newRow);
        renderEditor();
        updatePreview();
    }
}

function removeTableRow(index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.rows.splice(index, 1);
        renderEditor();
        updatePreview();
    }
}

// Agenda item functions
function updateAgendaItem(index, field, value) {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data.items) {
            currentProject.slides[selectedSlideIndex].data.items = [];
        }
        if (!currentProject.slides[selectedSlideIndex].data.items[index]) {
            currentProject.slides[selectedSlideIndex].data.items[index] = {};
        }
        currentProject.slides[selectedSlideIndex].data.items[index][field] = value;
        updatePreview();
    }
}

function addAgendaItem() {
    if (selectedSlideIndex >= 0) {
        if (!currentProject.slides[selectedSlideIndex].data.items) {
            currentProject.slides[selectedSlideIndex].data.items = [];
        }
        const num = currentProject.slides[selectedSlideIndex].data.items.length + 1;
        currentProject.slides[selectedSlideIndex].data.items.push({ title: `Point ${num}`, subtitle: '', duration: '' });
        renderEditor();
        updatePreview();
        markAsChanged();
    }
}

function removeAgendaItem(index) {
    if (selectedSlideIndex >= 0) {
        currentProject.slides[selectedSlideIndex].data.items.splice(index, 1);
        renderEditor();
        updatePreview();
        markAsChanged();
    }
}
