// src/services/slide-service.js
// Slide operations with event emission - no DOM manipulation

import {
  getProject,
  getSlides,
  getSelectedSlide,
  getSelectedSlideIndex,
  setSelectedSlideIndex,
  addSlide as addSlideToState,
  removeSlide as removeSlideFromState,
  duplicateSlide as duplicateSlideInState,
  moveSlide as moveSlideInState,
  updateSlideData as updateSlideDataInState,
  setHasUnsavedChanges,
  batch
} from '../core/state/index.js';
import { emit, EventTypes } from '../core/events/index.js';

/**
 * Select a slide by index
 * @param {number} index - Slide index to select
 */
export function selectSlide(index) {
  const slides = getSlides();
  if (index < 0 || index >= slides.length) {
    return;
  }

  setSelectedSlideIndex(index);
  emit(EventTypes.SLIDE_SELECTED, { index, slide: slides[index] });
}

/**
 * Add a new slide
 * @param {string} template - Template name
 * @param {Object} data - Slide data
 * @param {number} [atIndex] - Optional index to insert at (defaults to after current)
 * @returns {number} Index of the new slide
 */
export function addSlide(template, data, atIndex) {
  const slides = getSlides();
  const currentIndex = getSelectedSlideIndex();

  const newSlide = { template, data };

  // Determine insertion index
  const insertIndex = typeof atIndex === 'number'
    ? atIndex
    : slides.length === 0
      ? 0
      : currentIndex + 1;

  batch(() => {
    addSlideToState(newSlide, insertIndex);
    setSelectedSlideIndex(insertIndex);
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.SLIDE_ADDED, { index: insertIndex, slide: newSlide });
  emit(EventTypes.SLIDE_SELECTED, { index: insertIndex, slide: newSlide });

  return insertIndex;
}

/**
 * Delete a slide
 * @param {number} index - Slide index to delete
 */
export function deleteSlide(index) {
  const slides = getSlides();
  const selectedIndex = getSelectedSlideIndex();

  if (index < 0 || index >= slides.length) {
    return;
  }

  const deletedSlide = slides[index];

  batch(() => {
    removeSlideFromState(index);

    // Adjust selected index if needed
    const newSlides = getSlides();
    if (selectedIndex >= newSlides.length) {
      setSelectedSlideIndex(newSlides.length - 1);
    }
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.SLIDE_REMOVED, { index, slide: deletedSlide });
}

/**
 * Duplicate a slide
 * @param {number} index - Slide index to duplicate
 * @returns {number} Index of the duplicated slide
 */
export function duplicateSlide(index) {
  const slides = getSlides();

  if (index < 0 || index >= slides.length) {
    return -1;
  }

  batch(() => {
    duplicateSlideInState(index);
    setSelectedSlideIndex(index + 1);
    setHasUnsavedChanges(true);
  });

  const newSlide = getSlides()[index + 1];
  emit(EventTypes.SLIDE_DUPLICATED, { sourceIndex: index, newIndex: index + 1, slide: newSlide });
  emit(EventTypes.SLIDE_SELECTED, { index: index + 1, slide: newSlide });

  return index + 1;
}

/**
 * Move a slide from one position to another
 * @param {number} fromIndex - Source index
 * @param {number} toIndex - Destination index
 */
export function moveSlide(fromIndex, toIndex) {
  const slides = getSlides();
  const selectedIndex = getSelectedSlideIndex();

  if (fromIndex < 0 || fromIndex >= slides.length) {
    return;
  }
  if (toIndex < 0 || toIndex >= slides.length) {
    return;
  }
  if (fromIndex === toIndex) {
    return;
  }

  batch(() => {
    moveSlideInState(fromIndex, toIndex);

    // Update selected index if it was the moved slide
    if (selectedIndex === fromIndex) {
      setSelectedSlideIndex(toIndex);
    }
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.SLIDE_MOVED, { fromIndex, toIndex });
}

/**
 * Update a specific field in the selected slide's data
 * @param {string} key - Field key
 * @param {*} value - New value
 */
export function updateSlideField(key, value) {
  const index = getSelectedSlideIndex();
  if (index < 0) {
    return;
  }

  batch(() => {
    updateSlideDataInState(index, { [key]: value });
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.SLIDE_DATA_CHANGED, { index, key, value });
  emit(EventTypes.FIELD_CHANGED, { index, key, value });
}

/**
 * Update multiple fields in the selected slide's data
 * @param {Object} data - Object with key-value pairs to update
 */
export function updateSlideData(data) {
  const index = getSelectedSlideIndex();
  if (index < 0) {
    return;
  }

  batch(() => {
    updateSlideDataInState(index, data);
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.SLIDE_DATA_CHANGED, { index, data });
}

/**
 * Change the template of the selected slide
 * @param {string} template - New template name
 * @param {Object} [defaultData] - Default data for the new template
 */
export function changeSlideTemplate(template, defaultData = {}) {
  const index = getSelectedSlideIndex();
  if (index < 0) {
    return;
  }

  const slides = [...getSlides()];
  const currentData = slides[index].data || {};

  slides[index] = {
    template,
    data: { ...defaultData, ...currentData }
  };

  batch(() => {
    // We need to directly set the slides since we're changing template
    const project = getProject();
    project.slides = slides;
    setHasUnsavedChanges(true);
  });

  emit(EventTypes.TEMPLATE_CHANGED, { index, template });
  emit(EventTypes.SLIDE_DATA_CHANGED, { index });
}

/**
 * Get slide by index
 * @param {number} index - Slide index
 * @returns {Object|null} Slide object or null
 */
export function getSlide(index) {
  const slides = getSlides();
  return slides[index] || null;
}

/**
 * Get current selected slide
 * @returns {Object|null} Selected slide or null
 */
export function getCurrentSlide() {
  return getSelectedSlide();
}

/**
 * Get current slide index
 * @returns {number} Selected slide index (-1 if none)
 */
export function getCurrentSlideIndex() {
  return getSelectedSlideIndex();
}

/**
 * Get total slide count
 * @returns {number} Number of slides
 */
export function getSlideCount() {
  return getSlides()?.length || 0;
}
