// src/core/state/actions.js
// State mutations - all state changes go through here

import { store } from './store.js';
import { emit, EventTypes } from '../events/index.js';

// ============================================
// Project Actions
// ============================================

export const setProject = (project) => store.set('project', project);
export const setProjectName = (name) => store.set('project.name', name);
export const setProjectMetadata = (metadata) => store.set('project.metadata', metadata);

// ============================================
// Slide Actions
// ============================================

export const setSlides = (slides) => store.set('project.slides', slides);
export const setSelectedSlideIndex = (index) => store.set('selectedSlideIndex', index);

/**
 * Update a specific slide's data
 * @param {number} index - Slide index
 * @param {Object} data - Partial data to merge
 */
export const updateSlideData = (index, data) => {
  const slides = [...store.get('project.slides')];
  if (slides[index]) {
    slides[index] = {
      ...slides[index],
      data: { ...slides[index].data, ...data }
    };
    store.set('project.slides', slides);
  }
};

/**
 * Add a new slide
 * @param {Object} slide - Slide object with template and data
 * @param {number} [atIndex] - Optional index to insert at
 */
export const addSlide = (slide, atIndex) => {
  const slides = [...store.get('project.slides')];
  if (typeof atIndex === 'number') {
    slides.splice(atIndex, 0, slide);
  } else {
    slides.push(slide);
  }
  store.set('project.slides', slides);
};

/**
 * Remove a slide
 * @param {number} index - Slide index to remove
 */
export const removeSlide = (index) => {
  const slides = [...store.get('project.slides')];
  slides.splice(index, 1);
  store.set('project.slides', slides);
};

/**
 * Duplicate a slide
 * @param {number} index - Slide index to duplicate
 */
export const duplicateSlide = (index) => {
  const slides = [...store.get('project.slides')];
  if (slides[index]) {
    const copy = JSON.parse(JSON.stringify(slides[index]));
    slides.splice(index + 1, 0, copy);
    store.set('project.slides', slides);
  }
};

/**
 * Move a slide from one index to another
 * @param {number} fromIndex - Source index
 * @param {number} toIndex - Destination index
 */
export const moveSlide = (fromIndex, toIndex) => {
  const slides = [...store.get('project.slides')];
  const [slide] = slides.splice(fromIndex, 1);
  slides.splice(toIndex, 0, slide);
  store.set('project.slides', slides);
};

// ============================================
// Theme Actions
// ============================================

export const setTheme = (theme) => store.set('project.theme', theme);
export const setThemeBase = (base) => store.set('project.theme.base', base);
export const setThemeOverrides = (overrides) => store.set('project.theme.overrides', overrides);

/**
 * Set a specific theme color override
 * @param {string} key - Color key (e.g., 'primary', 'background')
 * @param {string} value - Color value
 */
export const setThemeColor = (key, value) => {
  const overrides = { ...store.get('project.theme.overrides'), [key]: value };
  store.set('project.theme.overrides', overrides);
};

/**
 * Remove a specific theme color override
 * @param {string} key - Color key to remove
 */
export const removeThemeColor = (key) => {
  const overrides = { ...store.get('project.theme.overrides') };
  delete overrides[key];
  store.set('project.theme.overrides', overrides);
};

/**
 * Reset all theme color overrides
 */
export const resetThemeColors = () => {
  store.set('project.theme.overrides', {});
};

// ============================================
// UI State Actions
// ============================================

export const setSidebarCollapsed = (collapsed) => store.set('ui.sidebarCollapsed', collapsed);
export const setEditorCollapsed = (collapsed) => store.set('ui.editorCollapsed', collapsed);
export const setEditorHeight = (height) => store.set('ui.editorHeight', height);
export const setCurrentSidebarTab = (tab) => store.set('ui.currentSidebarTab', tab);
export const setCurrentEditorTab = (tab) => store.set('ui.currentEditorTab', tab);
export const setIsResizingEditor = (resizing) => store.set('ui.isResizingEditor', resizing);

// ============================================
// Drag State Actions
// ============================================

export const setDraggedIndex = (index) => store.set('draggedIndex', index);
export const setSelectedTemplate = (template) => store.set('selectedTemplate', template);

// ============================================
// Persistence Actions
// ============================================

/**
 * Set unsaved changes flag - automatically emits appropriate event
 * @param {boolean} value - true for unsaved, false for saved
 */
export const setHasUnsavedChanges = (value) => {
  const oldValue = store.get('hasUnsavedChanges');
  if (oldValue === value) return;

  store.set('hasUnsavedChanges', value);
  emit(value ? EventTypes.CHANGES_MARKED : EventTypes.CHANGES_CLEARED);
};

// ============================================
// Player Actions
// ============================================

export const setPlayerSlideIndex = (index) => store.set('player.slideIndex', index);
export const setPlayerResizeObserver = (observer) => store.set('player.resizeObserver', observer);

// ============================================
// Color Picker Actions
// ============================================

export const setActiveColorPicker = (key) => store.set('colorPicker.active', key);
export const setSpectrumDragging = (dragging) => store.set('colorPicker.spectrumDragging', dragging);
export const setOriginalColorValue = (value) => store.set('colorPicker.originalValue', value);
export const setWasColorOverridden = (value) => store.set('colorPicker.wasOverridden', value);

// ============================================
// Drive Actions
// ============================================

export const setGapiReady = (ready) => store.set('drive.gapiReady', ready);
export const setGisReady = (ready) => store.set('drive.gisReady', ready);
export const setDriveInitialized = (initialized) => store.set('drive.initialized', initialized);
