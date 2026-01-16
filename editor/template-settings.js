// editor/template-settings.js
// Template-specific settings rendering (sliders, toggles, etc.)

// Render template-specific settings (sliders, toggles, etc.)
window.renderTemplateSettings = function(slide) {
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
};
