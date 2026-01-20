// src/core/events/bus.js
// Event bus for decoupled UI communication

/**
 * EventBus - Pub/sub event system for UI coordination
 */
class EventBus {
  constructor() {
    this._handlers = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} handler - Handler function
   * @returns {Function} Unsubscribe function
   */
  on(event, handler) {
    if (!this._handlers.has(event)) {
      this._handlers.set(event, new Set());
    }
    this._handlers.get(event).add(handler);

    return () => this.off(event, handler);
  }

  /**
   * Subscribe to an event (runs only once)
   * @param {string} event - Event name
   * @param {Function} handler - Handler function
   * @returns {Function} Unsubscribe function
   */
  once(event, handler) {
    const wrappedHandler = (...args) => {
      this.off(event, wrappedHandler);
      handler(...args);
    };
    return this.on(event, wrappedHandler);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} handler - Handler function
   */
  off(event, handler) {
    const handlers = this._handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    const handlers = this._handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (e) {
          console.error(`Event handler error for "${event}":`, e);
        }
      });
    }
  }

  /**
   * Remove all handlers for an event
   * @param {string} event - Event name (optional, removes all if not provided)
   */
  clear(event) {
    if (event) {
      this._handlers.delete(event);
    } else {
      this._handlers.clear();
    }
  }
}

// Create singleton instance
const events = new EventBus();

// Export instance and class
export { events, EventBus };

// Convenience functions
export const on = (event, handler) => events.on(event, handler);
export const once = (event, handler) => events.once(event, handler);
export const off = (event, handler) => events.off(event, handler);
export const emit = (event, data) => events.emit(event, data);
