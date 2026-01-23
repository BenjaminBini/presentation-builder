// src/presentation/editor/template-settings.js
// Template-specific settings rendering (sliders, toggles, etc.)

// Render template-specific settings (sliders, toggles, etc.)
export function renderTemplateSettings(slide) {
    const settings = [];

    if (slide.template === 'title' || slide.template === 'section') {
        const logoSize = slide.data.logoSize || 100;
        settings.push(`
            <div class="editor-toolbar-section editor-toolbar-section-block">
                <span class="editor-toolbar-label">Affichage</span>
                <div class="color-settings-list">
                    <div class="inline-slider-control">
                        <span class="inline-color-label">Taille du logo</span>
                        <div class="slider-control">
                            <input type="range" min="50" max="200" value="${logoSize}"
                                   oninput="App.updateField('logoSize', parseInt(this.value)); this.nextElementSibling.textContent = this.value + '%'">
                            <span class="slider-value">${logoSize}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    if (slide.template === 'bullets') {
        const showTag = slide.data.showTag !== false;
        settings.push(`
            <div class="editor-toolbar-section editor-toolbar-section-block">
                <span class="editor-toolbar-label">Affichage</span>
                <div class="settings-list">
                    <label class="toolbar-toggle">
                        <span class="toolbar-toggle-label">Tag</span>
                        <input type="checkbox" ${showTag ? 'checked' : ''}
                               onchange="App.updateField('showTag', this.checked); App.updatePreview();">
                    </label>
                </div>
            </div>
        `);
    }

    if (slide.template === 'agenda') {
        const showDuration = slide.data.showDuration !== false;
        const showSubtitle = slide.data.showSubtitle === true;
        settings.push(`
            <div class="editor-toolbar-section editor-toolbar-section-block">
                <span class="editor-toolbar-label">Affichage</span>
                <div class="settings-list">
                    <label class="toolbar-toggle">
                        <span class="toolbar-toggle-label">Durées</span>
                        <input type="checkbox" ${showDuration ? 'checked' : ''}
                               onchange="App.updateField('showDuration', this.checked); App.renderEditor(); App.updatePreview();">
                    </label>
                    <label class="toolbar-toggle">
                        <span class="toolbar-toggle-label">Sous-titres</span>
                        <input type="checkbox" ${showSubtitle ? 'checked' : ''}
                               onchange="App.updateField('showSubtitle', this.checked); App.renderEditor(); App.updatePreview();">
                    </label>
                </div>
            </div>
        `);
    }

    return settings.join('');
}
