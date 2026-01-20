// src/app/slides/list.js
// Slide list rendering and selection - event-driven version with event delegation

import { getProject, getSelectedSlideIndex } from '../../../core/state/index.js';
import { on, EventTypes } from '../../../core/events/index.js';
import { selectSlide as selectSlideService } from '../../../services/slide-service.js';
import { registerActions } from '../../../core/event-delegation.js';
import { TEMPLATES } from '../../../config/templates.js';
import { escapeHtml } from '../../../infrastructure/utils/html.js';

// ============================================================================
// ACTION HANDLERS (for event delegation)
// ============================================================================

/**
 * Handle slide selection via event delegation
 */
function handleSelectSlide(_event, _element, params) {
  selectSlide(params.index);
}

/**
 * Handle slide duplication via event delegation
 */
function handleDuplicateSlide(event, _element, params) {
  event.stopPropagation();
  if (typeof window.duplicateSlide === 'function') {
    window.duplicateSlide(params.index);
  }
}

/**
 * Handle slide deletion via event delegation
 */
function handleDeleteSlide(event, _element, params) {
  event.stopPropagation();
  if (typeof window.deleteSlide === 'function') {
    window.deleteSlide(params.index);
  }
}

// Register slide list actions
registerActions({
  'select-slide': handleSelectSlide,
  'duplicate-slide': handleDuplicateSlide,
  'delete-slide': handleDeleteSlide
});

// ============================================================================
// DRAG AND DROP HANDLERS
// ============================================================================

let draggedSlideIndex = null;

function handleDragStart(event, index) {
  draggedSlideIndex = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index.toString());
  event.target.classList.add('dragging');
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const item = event.target.closest('.slide-item');
  if (item && !item.classList.contains('dragging')) {
    item.classList.add('drag-over');
  }
}

function handleDragLeave(event) {
  const item = event.target.closest('.slide-item');
  if (item) {
    item.classList.remove('drag-over');
  }
}

function handleDrop(event, targetIndex) {
  event.preventDefault();
  const item = event.target.closest('.slide-item');
  if (item) {
    item.classList.remove('drag-over');
  }

  if (draggedSlideIndex !== null && draggedSlideIndex !== targetIndex) {
    if (typeof window.moveSlide === 'function') {
      window.moveSlide(draggedSlideIndex, targetIndex);
    }
  }
  draggedSlideIndex = null;
}

function handleDragEnd(event) {
  event.target.classList.remove('dragging');
  document.querySelectorAll('.slide-item').forEach(item => {
    item.classList.remove('drag-over');
  });
  draggedSlideIndex = null;
}

// Expose drag handlers to window for use in HTML attributes
// These are kept as window globals because drag events need special handling
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.handleDragEnd = handleDragEnd;

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

export function renderSlideList() {
  const list = document.getElementById('slideList');

  if (!list) return;

  const currentProject = getProject();
  const selectedSlideIndex = getSelectedSlideIndex();

  if (currentProject.slides.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><svg class="icon icon-xl" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <h3>Aucune slide</h3>
        <p>Cliquez sur "Ajouter" pour creer votre premiere slide</p>
      </div>
    `;
    renderCompactSlideList();
    return;
  }

  list.innerHTML = currentProject.slides.map((slide, index) => {
    const template = TEMPLATES[slide.template];
    const title = slide.data.title || slide.data.quote?.substring(0, 30) || `Slide ${index + 1}`;

    return `
      <div class="slide-item ${index === selectedSlideIndex ? 'active' : ''}"
           data-index="${index}"
           draggable="true"
           ondragstart="window.handleDragStart(event, ${index})"
           ondragover="window.handleDragOver(event)"
           ondragleave="window.handleDragLeave(event)"
           ondrop="window.handleDrop(event, ${index})"
           ondragend="window.handleDragEnd(event)"
           data-action="select-slide">
          <div class="slide-item-number">${index + 1}</div>
          <div class="slide-item-info">
            <div class="slide-item-title">${escapeHtml(title)}</div>
            <div class="slide-item-template">
              ${template?.icon ? `<span class="slide-item-template-icon">${template.icon}</span>` : ''}
              <span>${template?.name || slide.template}</span>
            </div>
          </div>
          <div class="slide-item-actions">
            <button class="slide-item-btn" data-action="duplicate-slide" data-index="${index}" title="Dupliquer"><svg class="icon icon-sm" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
            <button class="slide-item-btn delete" data-action="delete-slide" data-index="${index}" title="Supprimer"><svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
      </div>
    `;
  }).join('');

  // Also update compact slide list
  renderCompactSlideList();
}

export function selectSlide(index) {
  // Use the service which handles state + events
  selectSlideService(index);
  sessionStorage.setItem('selectedSlideIndex', index);
}

export function renderCompactSlideList() {
  const list = document.getElementById('compactSlideList');
  if (!list) return;

  const currentProject = getProject();
  const selectedSlideIndex = getSelectedSlideIndex();

  list.innerHTML = currentProject.slides.map((_, index) => `
    <div class="compact-slide-item ${index === selectedSlideIndex ? 'active' : ''}"
         data-action="select-slide"
         data-index="${index}"
         title="Slide ${index + 1}">
      ${index + 1}
    </div>
  `).join('');
}

// ============================================================================
// EVENT SUBSCRIPTIONS
// ============================================================================

/**
 * Initialize slide list event subscriptions
 */
export function initSlideListSubscriptions() {
  // Re-render list when slides are added
  on(EventTypes.SLIDE_ADDED, () => {
    renderSlideList();
  });

  // Re-render list when slides are removed
  on(EventTypes.SLIDE_REMOVED, () => {
    renderSlideList();
  });

  // Re-render list when slides are duplicated
  on(EventTypes.SLIDE_DUPLICATED, () => {
    renderSlideList();
  });

  // Re-render list when slides are moved
  on(EventTypes.SLIDE_MOVED, () => {
    renderSlideList();
  });

  // Re-render list when slide is selected
  on(EventTypes.SLIDE_SELECTED, () => {
    renderSlideList();
  });

  // Re-render list when project is loaded
  on(EventTypes.PROJECT_LOADED, () => {
    renderSlideList();
  });

  // Re-render list when slide title changes (via field change)
  on(EventTypes.FIELD_CHANGED, ({ key }) => {
    if (key === 'title' || key === 'quote') {
      renderSlideList();
    }
  });
}
