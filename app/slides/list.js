// app/slides/list.js
// Slide list rendering and selection

window.renderSlideList = function() {
    const list = document.getElementById('slideList');

    if (window.currentProject.slides.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><svg class="icon icon-xl" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <h3>Aucune slide</h3>
                <p>Cliquez sur "Ajouter" pour créer votre première slide</p>
            </div>
        `;
        window.renderCompactSlideList();
        return;
    }

    list.innerHTML = window.currentProject.slides.map((slide, index) => {
        const template = TEMPLATES[slide.template];
        const title = slide.data.title || slide.data.quote?.substring(0, 30) || `Slide ${index + 1}`;
        return `
            <div class="slide-item ${index === window.selectedSlideIndex ? 'active' : ''}"
                 data-index="${index}"
                 draggable="true"
                 ondragstart="handleDragStart(event, ${index})"
                 ondragover="handleDragOver(event)"
                 ondrop="handleDrop(event, ${index})"
                 ondragend="handleDragEnd(event)"
                 onclick="selectSlide(${index})">
                <div class="slide-item-number">${index + 1}</div>
                <div class="slide-item-info">
                    <div class="slide-item-title">${escapeHtml(title)}</div>
                    <div class="slide-item-template">${template?.name || slide.template}</div>
                </div>
                <div class="slide-item-actions">
                    <button class="slide-item-btn" onclick="event.stopPropagation(); duplicateSlide(${index})" title="Dupliquer"><svg class="icon icon-sm" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                    <button class="slide-item-btn delete" onclick="event.stopPropagation(); deleteSlide(${index})" title="Supprimer"><svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div>
            </div>
        `;
    }).join('');

    // Also update compact slide list
    window.renderCompactSlideList();
};

window.selectSlide = function(index) {
    window.selectedSlideIndex = index;
    sessionStorage.setItem('selectedSlideIndex', index);
    renderSlideList();
    renderEditor();
    updatePreview();
};

window.renderCompactSlideList = function() {
    const list = document.getElementById('compactSlideList');
    if (!list) return;

    list.innerHTML = window.currentProject.slides.map((_, index) => `
        <div class="compact-slide-item ${index === window.selectedSlideIndex ? 'active' : ''}"
             onclick="selectSlide(${index})"
             title="Slide ${index + 1}">
            ${index + 1}
        </div>
    `).join('');
};
