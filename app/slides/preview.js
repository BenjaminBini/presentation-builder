// app/slides/preview.js
// Preview scaling and rendering

window.updatePreview = function() {
    // Skip re-render if inline editing is active
    if (typeof InlineEditor !== 'undefined' && InlineEditor.isEditing) {
        return;
    }

    const preview = document.getElementById('previewSlide');

    if (window.selectedSlideIndex < 0 || !window.currentProject.slides[window.selectedSlideIndex]) {
        preview.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--gray-100); color: var(--gray-500);">
                <div style="text-align: center;">
                    <div style="margin-bottom: 16px;"><svg style="width: 48px; height: 48px; stroke: currentColor; stroke-width: 1.5; fill: none; opacity: 0.5;" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                    <div>Sélectionnez une slide</div>
                </div>
            </div>
        `;
        return;
    }

    const slide = window.currentProject.slides[window.selectedSlideIndex];
    preview.innerHTML = renderSlidePreview(slide);

    // Apply scaling after content is rendered
    window.scalePreviewSlide();

    // Re-render mermaid if needed
    if (slide.template === 'mermaid') {
        setTimeout(() => {
            mermaid.run({ nodes: preview.querySelectorAll('.mermaid') });
        }, 100);
    }
};

window.scalePreviewSlide = function() {
    const panel = document.querySelector('.preview-panel');
    const wrapper = document.getElementById('previewWrapper');
    const preview = document.getElementById('previewSlide');
    if (!panel || !wrapper || !preview) return;

    // Account for panel padding (20px on each side)
    const availableWidth = panel.clientWidth - 40;
    const availableHeight = panel.clientHeight - 40;

    // Calculate scale to fit within available space while maintaining aspect ratio
    const scaleX = availableWidth / 1280;
    const scaleY = availableHeight / 720;
    const scale = Math.min(1, scaleX, scaleY);

    preview.style.transform = `scale(${scale})`;

    // Size the wrapper to match scaled dimensions
    wrapper.style.width = `${1280 * scale}px`;
    wrapper.style.height = `${720 * scale}px`;
};

function renderSlidePreview(slide) {
    const { template, data } = slide;
    const styles = getPreviewStyles();
    return `<style>${styles}</style>${renderTemplate(template, data)}`;
}
