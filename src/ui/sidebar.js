// src/ui/sidebar.js
// Sidebar state management

import { get, set } from '../core/state.js';
import { emit, EventTypes } from '../core/events.js';

/**
 * Get sidebar collapsed state
 * @returns {boolean}
 */
export function isSidebarCollapsed() {
  return get('ui.sidebarCollapsed') || false;
}

/**
 * Toggle sidebar collapsed state
 */
export function toggleSidebarCollapsed() {
  const current = isSidebarCollapsed();
  set('ui.sidebarCollapsed', !current);
  emit(EventTypes.SIDEBAR_TOGGLED, { collapsed: !current });
}

/**
 * Get current sidebar tab
 * @returns {string} 'slides' or 'settings'
 */
export function getCurrentSidebarTab() {
  return get('ui.currentSidebarTab') || 'slides';
}

/**
 * Set current sidebar tab
 * @param {string} tab - 'slides' or 'settings'
 */
export function setCurrentSidebarTab(tab) {
  set('ui.currentSidebarTab', tab);
  emit(EventTypes.TAB_SWITCHED, { tab, panel: 'sidebar' });
}
