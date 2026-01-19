// src/services/presentation-service.js
// Presentation player operations with event emission

import {
  getProject,
  getSlides,
  getSelectedSlideIndex,
  setSelectedSlideIndex,
  getPlayerSlideIndex,
  setPlayerSlideIndex
} from '../core/state/index.js';
import { emit, EventTypes } from '../core/events/index.js';

/**
 * Check if presentation can be started
 * @returns {boolean} True if there are slides to present
 */
export function canStartPresentation() {
  const slides = getSlides();
  return slides && slides.length > 0;
}

/**
 * Start presentation mode
 * @returns {number} Starting slide index
 */
export function startPresentation() {
  const slides = getSlides();
  if (!slides || slides.length === 0) {
    return -1;
  }

  const selectedIndex = getSelectedSlideIndex();
  const startIndex = selectedIndex >= 0 ? selectedIndex : 0;

  setPlayerSlideIndex(startIndex);

  emit(EventTypes.PRESENTATION_STARTED, {
    slideIndex: startIndex,
    totalSlides: slides.length
  });

  return startIndex;
}

/**
 * Stop presentation mode
 * @returns {number} Final slide index
 */
export function stopPresentation() {
  const playerIndex = getPlayerSlideIndex();

  // Sync selected slide with where we stopped
  setSelectedSlideIndex(playerIndex);

  emit(EventTypes.PRESENTATION_ENDED, { slideIndex: playerIndex });

  return playerIndex;
}

/**
 * Navigate to next slide in presentation
 * @returns {number} New slide index (-1 if at end)
 */
export function nextSlide() {
  const slides = getSlides();
  const currentIndex = getPlayerSlideIndex();

  if (currentIndex >= slides.length - 1) {
    return -1;
  }

  const newIndex = currentIndex + 1;
  setPlayerSlideIndex(newIndex);

  emit(EventTypes.PRESENTATION_SLIDE_CHANGED, {
    slideIndex: newIndex,
    direction: 'next',
    totalSlides: slides.length
  });

  return newIndex;
}

/**
 * Navigate to previous slide in presentation
 * @returns {number} New slide index (-1 if at start)
 */
export function prevSlide() {
  const currentIndex = getPlayerSlideIndex();
  const slides = getSlides();

  if (currentIndex <= 0) {
    return -1;
  }

  const newIndex = currentIndex - 1;
  setPlayerSlideIndex(newIndex);

  emit(EventTypes.PRESENTATION_SLIDE_CHANGED, {
    slideIndex: newIndex,
    direction: 'prev',
    totalSlides: slides.length
  });

  return newIndex;
}

/**
 * Jump to a specific slide in presentation
 * @param {number} index - Slide index to jump to
 * @returns {boolean} True if jump was successful
 */
export function goToSlide(index) {
  const slides = getSlides();

  if (index < 0 || index >= slides.length) {
    return false;
  }

  const prevIndex = getPlayerSlideIndex();
  setPlayerSlideIndex(index);

  emit(EventTypes.PRESENTATION_SLIDE_CHANGED, {
    slideIndex: index,
    direction: index > prevIndex ? 'forward' : 'backward',
    totalSlides: slides.length
  });

  return true;
}

/**
 * Jump to first slide
 * @returns {number} Slide index (0)
 */
export function goToFirstSlide() {
  const slides = getSlides();
  if (!slides || slides.length === 0) {
    return -1;
  }

  setPlayerSlideIndex(0);

  emit(EventTypes.PRESENTATION_SLIDE_CHANGED, {
    slideIndex: 0,
    direction: 'start',
    totalSlides: slides.length
  });

  return 0;
}

/**
 * Jump to last slide
 * @returns {number} Last slide index
 */
export function goToLastSlide() {
  const slides = getSlides();
  if (!slides || slides.length === 0) {
    return -1;
  }

  const lastIndex = slides.length - 1;
  setPlayerSlideIndex(lastIndex);

  emit(EventTypes.PRESENTATION_SLIDE_CHANGED, {
    slideIndex: lastIndex,
    direction: 'end',
    totalSlides: slides.length
  });

  return lastIndex;
}

/**
 * Get current presentation state
 * @returns {Object} Presentation state
 */
export function getPresentationState() {
  const slides = getSlides();
  const currentIndex = getPlayerSlideIndex();

  return {
    currentIndex,
    totalSlides: slides?.length || 0,
    currentSlide: slides?.[currentIndex] || null,
    isFirst: currentIndex === 0,
    isLast: currentIndex >= (slides?.length || 0) - 1,
    progress: slides?.length ? ((currentIndex + 1) / slides.length) * 100 : 0
  };
}

/**
 * Get presentation metadata
 * @returns {Object} Presentation metadata
 */
export function getPresentationMetadata() {
  const project = getProject();
  return {
    title: project?.name || 'Presentation',
    metadata: project?.metadata || {},
    slideCount: project?.slides?.length || 0
  };
}
