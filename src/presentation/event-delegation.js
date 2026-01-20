// src/core/event-delegation.js
// Centralized event delegation system for replacing inline onclick handlers
// This module provides a pattern for registering action handlers that respond
// to data-action attributes on DOM elements.

const actionHandlers = new Map();

/**
 * Register an action handler
 * @param {string} action - The action name (matches data-action attribute)
 * @param {Function} handler - Handler function receiving (event, element, params)
 */
export function registerAction(action, handler) {
  actionHandlers.set(action, handler);
}

/**
 * Register multiple actions at once
 * @param {Object.<string, Function>} actions - Map of action names to handlers
 */
export function registerActions(actions) {
  for (const [action, handler] of Object.entries(actions)) {
    actionHandlers.set(action, handler);
  }
}

/**
 * Unregister an action handler
 * @param {string} action - The action name to remove
 */
export function unregisterAction(action) {
  actionHandlers.delete(action);
}

/**
 * Parse data attributes from an element into a params object
 * Converts data-param-foo="bar" to { foo: "bar" }
 * Also handles data-index, data-key, etc. as special cases
 * @param {HTMLElement} element - The element to parse
 * @returns {Object} Parsed parameters
 */
function parseParams(element) {
  const params = {};

  // Parse all data-* attributes
  for (const attr of element.attributes) {
    if (attr.name.startsWith('data-')) {
      const key = attr.name.slice(5); // Remove 'data-' prefix

      // Skip 'action' as it's handled separately
      if (key === 'action') continue;

      // Convert 'param-foo' to 'foo'
      const paramKey = key.startsWith('param-') ? key.slice(6) : key;

      // Auto-convert numbers
      const value = attr.value;
      if (/^-?\d+$/.test(value)) {
        params[paramKey] = parseInt(value, 10);
      } else if (/^-?\d+\.\d+$/.test(value)) {
        params[paramKey] = parseFloat(value);
      } else if (value === 'true') {
        params[paramKey] = true;
      } else if (value === 'false') {
        params[paramKey] = false;
      } else {
        params[paramKey] = value;
      }
    }
  }

  return params;
}

/**
 * Handle a delegated click event
 * @param {Event} event - The click event
 */
function handleDelegatedClick(event) {
  // Find the closest element with a data-action attribute
  const actionElement = event.target.closest('[data-action]');

  if (!actionElement) return;

  const action = actionElement.dataset.action;
  const handler = actionHandlers.get(action);

  if (handler) {
    // Parse parameters from data attributes
    const params = parseParams(actionElement);

    // Call the handler
    try {
      handler(event, actionElement, params);
    } catch (error) {
      console.error(`Error in action handler "${action}":`, error);
    }
  } else {
    console.warn(`No handler registered for action: ${action}`);
  }
}

/**
 * Handle delegated input/change events
 * @param {Event} event - The input/change event
 */
function handleDelegatedInput(event) {
  const target = event.target;
  const action = target.dataset.inputAction;

  if (!action) return;

  const handler = actionHandlers.get(action);

  if (handler) {
    const params = parseParams(target);
    params.value = target.value;

    try {
      handler(event, target, params);
    } catch (error) {
      console.error(`Error in input handler "${action}":`, error);
    }
  }
}

/**
 * Handle delegated mouseenter events
 * @param {Event} event - The mouseenter event
 */
function handleDelegatedMouseEnter(event) {
  const target = event.target;
  if (!target.matches('[data-hover-action]')) return;

  const action = target.dataset.hoverAction;
  const handler = actionHandlers.get(action);

  if (handler) {
    const params = parseParams(target);
    try {
      handler(event, target, params);
    } catch (error) {
      console.error(`Error in mouseenter handler "${action}":`, error);
    }
  }
}

/**
 * Handle delegated mouseleave events
 * @param {Event} event - The mouseleave event
 */
function handleDelegatedMouseLeave(event) {
  const target = event.target;
  if (!target.matches('[data-hover-leave-action]')) return;

  const action = target.dataset.hoverLeaveAction;
  const handler = actionHandlers.get(action);

  if (handler) {
    const params = parseParams(target);
    try {
      handler(event, target, params);
    } catch (error) {
      console.error(`Error in mouseleave handler "${action}":`, error);
    }
  }
}

/**
 * Initialize event delegation on a container element
 * @param {HTMLElement} container - The container to delegate events on
 */
export function initEventDelegation(container = document.body) {
  // Click events
  container.addEventListener('click', handleDelegatedClick);

  // Input events (for real-time updates)
  container.addEventListener('input', handleDelegatedInput);

  // Change events (for final value commits)
  container.addEventListener('change', handleDelegatedInput);

  // Mouse enter/leave events (for tooltips, hover states)
  container.addEventListener('mouseenter', handleDelegatedMouseEnter, true);
  container.addEventListener('mouseleave', handleDelegatedMouseLeave, true);
}

/**
 * Remove event delegation from a container
 * @param {HTMLElement} container - The container to remove delegation from
 */
export function destroyEventDelegation(container = document.body) {
  container.removeEventListener('click', handleDelegatedClick);
  container.removeEventListener('input', handleDelegatedInput);
  container.removeEventListener('change', handleDelegatedInput);
  container.removeEventListener('mouseenter', handleDelegatedMouseEnter, true);
  container.removeEventListener('mouseleave', handleDelegatedMouseLeave, true);
}

/**
 * Clear all registered action handlers
 */
export function clearAllActions() {
  actionHandlers.clear();
}
