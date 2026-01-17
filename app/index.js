// app/index.js
// Main initialization - loads after all other modules

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load project from localStorage or use sample
    window.loadInitialProject();

    // Initialize UI components
    window.initTemplateGrid();
    window.renderSlideList();
    renderEditor();
    window.renderSettingsPanel();
    window.updatePreview();
    window.updateHeaderTitle();
    window.initMermaid();
    window.initPanelStates();

    // Close color picker dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.color-selector-group') && !e.target.closest('.inline-color-selector')) {
            document.querySelectorAll('.color-swatches-dropdown.open, .inline-color-dropdown.open').forEach(el => {
                el.classList.remove('open');
                const parent = el.closest('.color-selector-group') || el.closest('.inline-color-selector');
                if (parent) parent.classList.remove('picker-open');
            });
        }
    });

    // Update scaling dynamically when container size changes
    const previewPanel = document.querySelector('.preview-panel');
    if (previewPanel) {
        new ResizeObserver(() => window.scalePreviewSlide()).observe(previewPanel);
    }

    // Also listen to window resize as fallback
    window.addEventListener('resize', window.scalePreviewSlide);
}
