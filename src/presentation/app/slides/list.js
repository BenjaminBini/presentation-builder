// src/app/slides/list.js
// Slide list rendering and selection - event-driven version with event delegation

import { getProject, getSelectedSlideIndex } from '../../../core/state.js';
import { on, EventTypes } from '../../../core/events.js';
import { selectSlide as selectSlideService } from '../../../services/slide-service.js';
import { registerActions } from '../../event-delegation.js';
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
let dropIndicator = null;
let currentDropIndex = null;
let draggedSlideElement = null;

/**
 * Create or get the drop indicator element (ghost of the slide)
 */
function getDropIndicator() {
  if (!dropIndicator) {
    dropIndicator = document.createElement('div');
    dropIndicator.className = 'slide-drop-indicator';
  }
  return dropIndicator;
}

/**
 * Update the ghost indicator content to match the dragged slide
 */
function updateGhostContent(sourceSlide) {
  const indicator = getDropIndicator();
  // Clone the slide content for the ghost
  const clone = sourceSlide.cloneNode(true);
  clone.classList.remove('dragging', 'active');
  clone.classList.add('slide-ghost-content');
  clone.removeAttribute('draggable');
  clone.removeAttribute('ondragstart');
  clone.removeAttribute('ondragend');
  clone.removeAttribute('data-action');
  indicator.innerHTML = '';
  indicator.appendChild(clone);
}

/**
 * Calculate drop position based on mouse position
 * Returns the DOM element to insert before, or null for end
 */
function calculateDropTarget(event, slideList) {
  const items = Array.from(slideList.querySelectorAll('.slide-item:not(.dragging):not(.slide-ghost-content)'));
  const mouseY = event.clientY;

  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;

    if (mouseY < midpoint) {
      return { element: items[i], index: parseInt(items[i].dataset.index, 10) };
    }
  }

  // Mouse is below all items - drop at end
  if (items.length > 0) {
    const lastIndex = parseInt(items[items.length - 1].dataset.index, 10);
    return { element: null, index: lastIndex + 1 };
  }

  return { element: null, index: 0 };
}

/**
 * Position the drop indicator at the correct location
 * Always show ghost to maintain consistent item count and avoid UI jumps
 */
function positionDropIndicator(targetElement, targetIndex, slideList) {
  const indicator = getDropIndicator();

  // Always show the ghost - if at original position, show it there
  // This maintains consistent item count and prevents UI jumps
  if (targetIndex === draggedSlideIndex || targetIndex === draggedSlideIndex + 1) {
    // Show ghost at the original position (right after the hidden dragged item)
    const draggedItem = slideList.querySelector('.slide-item.dragging');
    if (draggedItem) {
      // Insert after the dragged item (which is hidden)
      if (draggedItem.nextSibling) {
        slideList.insertBefore(indicator, draggedItem.nextSibling);
      } else {
        slideList.appendChild(indicator);
      }
    }
  } else {
    // Insert at the target position
    if (targetElement) {
      slideList.insertBefore(indicator, targetElement);
    } else {
      slideList.appendChild(indicator);
    }
  }

  indicator.classList.add('visible');
}

/**
 * Update which items should shift to make room
 */
function updateShiftedItems(dropIndex, slideList) {
  const items = Array.from(slideList.querySelectorAll('.slide-item'));

  items.forEach(item => {
    const itemIndex = parseInt(item.dataset.index, 10);
    item.classList.remove('shift-down', 'shift-up');

    if (draggedSlideIndex === null) return;

    // Items between drag source and drop target should shift
    if (draggedSlideIndex < dropIndex) {
      // Dragging down: items between source and target shift up
      if (itemIndex > draggedSlideIndex && itemIndex < dropIndex) {
        item.classList.add('shift-up');
      }
    } else if (draggedSlideIndex > dropIndex) {
      // Dragging up: items between target and source shift down
      if (itemIndex >= dropIndex && itemIndex < draggedSlideIndex) {
        item.classList.add('shift-down');
      }
    }
  });
}

function handleDragStart(event, index) {
  draggedSlideIndex = index;
  currentDropIndex = index;
  draggedSlideElement = event.target;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index.toString());

  // Create ghost content from the dragged slide
  updateGhostContent(event.target);

  // Get the slide list for positioning
  const slideList = document.getElementById('slideList');

  // Add dragging class and insert ghost immediately to prevent UI jump
  requestAnimationFrame(() => {
    event.target.classList.add('dragging');
    document.body.classList.add('is-dragging-slide');

    // Insert ghost right after the dragged item (which is now hidden)
    const indicator = getDropIndicator();
    if (event.target.nextSibling) {
      slideList.insertBefore(indicator, event.target.nextSibling);
    } else {
      slideList.appendChild(indicator);
    }
    indicator.classList.add('visible');
  });
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';

  const slideList = document.getElementById('slideList');
  if (!slideList || draggedSlideIndex === null) return;

  const { element: targetElement, index: dropIndex } = calculateDropTarget(event, slideList);

  if (dropIndex !== currentDropIndex) {
    currentDropIndex = dropIndex;
    positionDropIndicator(targetElement, dropIndex, slideList);
    updateShiftedItems(dropIndex, slideList);
  }
}

function handleDragLeave(event) {
  // Only hide indicator if leaving the slide list entirely
  const slideList = document.getElementById('slideList');
  if (!slideList) return;

  const relatedTarget = event.relatedTarget;
  if (!relatedTarget || !slideList.contains(relatedTarget)) {
    const indicator = getDropIndicator();
    indicator.classList.remove('visible');

    // Remove shift classes
    slideList.querySelectorAll('.slide-item').forEach(item => {
      item.classList.remove('shift-down', 'shift-up');
    });
  }
}

function handleDrop(event, _targetIndex) {
  event.preventDefault();

  const slideList = document.getElementById('slideList');

  // Calculate final drop position
  let finalDropIndex = currentDropIndex;
  if (finalDropIndex === null && slideList) {
    const { index } = calculateDropTarget(event, slideList);
    finalDropIndex = index;
  }

  // Adjust index for move operation
  if (draggedSlideIndex !== null && finalDropIndex !== null) {
    // If dropping after the dragged item's original position, adjust
    let adjustedIndex = finalDropIndex;
    if (finalDropIndex > draggedSlideIndex) {
      adjustedIndex = finalDropIndex - 1;
    }

    if (draggedSlideIndex !== adjustedIndex) {
      if (typeof window.moveSlide === 'function') {
        window.moveSlide(draggedSlideIndex, adjustedIndex);
      }
    }
  }

  cleanupDragState();
}

function handleDragEnd(event) {
  event.target.classList.remove('dragging');
  cleanupDragState();
}

/**
 * Clean up all drag state and visual indicators
 */
function cleanupDragState() {
  const slideList = document.getElementById('slideList');

  // Remove indicator
  const indicator = getDropIndicator();
  indicator.classList.remove('visible');
  if (indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
  }

  // Remove all drag-related classes
  if (slideList) {
    slideList.querySelectorAll('.slide-item').forEach(item => {
      item.classList.remove('dragging', 'drag-over', 'shift-down', 'shift-up');
    });
  }

  document.body.classList.remove('is-dragging-slide');
  draggedSlideIndex = null;
  currentDropIndex = null;
  draggedSlideElement = null;
}

// Handle drag over on the list container itself
function handleListDragOver(event) {
  event.preventDefault();
  handleDragOver(event);
}

// Handle drop on the list container
function handleListDrop(event) {
  event.preventDefault();
  handleDrop(event, currentDropIndex);
}

// Expose drag handlers to window for use in HTML attributes
// These are kept as window globals because drag events need special handling
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.handleDragEnd = handleDragEnd;
window.handleListDragOver = handleListDragOver;
window.handleListDrop = handleListDrop;

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

  // Add list-level drag handlers for better drop detection
  list.setAttribute('ondragover', 'window.handleListDragOver(event)');
  list.setAttribute('ondrop', 'window.handleListDrop(event)');
  list.setAttribute('ondragleave', 'window.handleDragLeave(event)');

  list.innerHTML = currentProject.slides.map((slide, index) => {
    const template = TEMPLATES[slide.template];
    const title = slide.data.title || slide.data.quote?.substring(0, 30) || `Slide ${index + 1}`;

    return `
      <div class="slide-item ${index === selectedSlideIndex ? 'active' : ''}"
           data-index="${index}"
           draggable="true"
           ondragstart="window.handleDragStart(event, ${index})"
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
