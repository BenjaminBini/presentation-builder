// editor/fields/table.js
// Table and comparison field renderers

window.renderRowsField = function(field, rows) {
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
};

window.renderTableRowsField = function(field, rows) {
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
};
