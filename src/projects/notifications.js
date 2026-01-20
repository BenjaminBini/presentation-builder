// src/projects/notifications.js
// Notification utilities (confirm dialog)

// Store confirm callback
let confirmCallback = null;

/**
 * Show confirmation dialog
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Callback when cancelled
 */
export function showConfirm(message, onConfirm, onCancel) {
  const overlay = document.getElementById('confirmOverlay');
  const messageEl = document.getElementById('confirmMessage');

  if (!overlay || !messageEl) {
    // Fallback to native confirm
    if (confirm(message)) {
      onConfirm && onConfirm();
    } else {
      onCancel && onCancel();
    }
    return;
  }

  messageEl.textContent = message;
  confirmCallback = { onConfirm, onCancel };
  overlay.classList.add('show');
}

/**
 * Hide confirmation dialog
 */
export function hideConfirm() {
  const overlay = document.getElementById('confirmOverlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
  confirmCallback = null;
}

/**
 * Handle confirm dialog response
 * @param {boolean} confirmed - Whether user confirmed
 */
export function handleConfirmResponse(confirmed) {
  if (confirmCallback) {
    if (confirmed && confirmCallback.onConfirm) {
      confirmCallback.onConfirm();
    } else if (!confirmed && confirmCallback.onCancel) {
      confirmCallback.onCancel();
    }
  }
  hideConfirm();
}
