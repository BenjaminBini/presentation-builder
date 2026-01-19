// src/app/slides/preview.js
// Preview scaling and rendering - event-driven version

import { getProject, getSelectedSlideIndex } from '../../core/state/index.js';
import { on, EventTypes } from '../../core/events/index.js';

export function updatePreview() {
  if (typeof window.InlineEditor !== 'undefined' && window.InlineEditor.isEditing) {
    return;
  }

  const preview = document.getElementById('previewSlide');
  if (!preview) return;

  const project = getProject();
  const selectedSlideIndex = getSelectedSlideIndex();

  if (selectedSlideIndex < 0 || !project?.slides?.[selectedSlideIndex]) {
    preview.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--gray-100); color: var(--gray-500);">
        <div style="text-align: center;">
          <div style="margin-bottom: 16px;"><svg style="width: 48px; height: 48px; stroke: currentColor; stroke-width: 1.5; fill: none; opacity: 0.5;" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <div>Selectionnez une slide</div>
        </div>
      </div>
    `;
    return;
  }

  const slide = project.slides[selectedSlideIndex];
  preview.innerHTML = renderSlidePreview(slide);

  scalePreviewSlide();

  if (slide.template === 'mermaid' && window.mermaid) {
    setTimeout(() => {
      window.mermaid.run({ nodes: preview.querySelectorAll('.mermaid') });
    }, 100);
  }
}

export function scalePreviewSlide() {
  const panel = document.querySelector('.preview-panel');
  const wrapper = document.getElementById('previewWrapper');
  const preview = document.getElementById('previewSlide');
  if (!panel || !wrapper || !preview) return;

  const availableWidth = panel.clientWidth - 40;
  const availableHeight = panel.clientHeight - 40;

  const scaleX = availableWidth / 1280;
  const scaleY = availableHeight / 720;
  const scale = Math.min(1, scaleX, scaleY);

  preview.style.transform = `scale(${scale})`;
  wrapper.style.width = `${1280 * scale}px`;
  wrapper.style.height = `${720 * scale}px`;
}

function renderSlidePreview(slide) {
  const { template, data } = slide;
  const getPreviewStyles = window.getPreviewStyles || (() => '');
  const renderTemplate = window.renderTemplate || (() => '');
  const styles = getPreviewStyles();
  return `<style>${styles}</style>${renderTemplate(template, data)}`;
}

// ============================================================================
// EVENT SUBSCRIPTIONS
// ============================================================================

/**
 * Initialize preview event subscriptions
 */
export function initPreviewSubscriptions() {
  // Update preview when slide data changes
  on(EventTypes.SLIDE_DATA_CHANGED, () => {
    updatePreview();
  });

  // Update preview when a slide is selected
  on(EventTypes.SLIDE_SELECTED, () => {
    updatePreview();
  });

  // Update preview when theme changes
  on(EventTypes.THEME_CHANGED, () => {
    updatePreview();
  });

  on(EventTypes.THEME_COLOR_CHANGED, () => {
    updatePreview();
  });

  // Update preview when project is loaded
  on(EventTypes.PROJECT_LOADED, () => {
    updatePreview();
  });

  // Update preview when template changes
  on(EventTypes.TEMPLATE_CHANGED, () => {
    updatePreview();
  });

  // Scale preview when preview is updated (after DOM changes)
  on(EventTypes.PREVIEW_UPDATED, () => {
    scalePreviewSlide();
  });
}
