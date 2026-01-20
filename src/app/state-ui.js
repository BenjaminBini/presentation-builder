// src/app/state-ui.js
// DOM helpers for UI state updates - moved from core layer to maintain clean architecture
// Core layer should remain pure (no DOM access)

/**
 * Show the unsaved changes alert banner
 */
export function showUnsavedAlert() {
  const alert = document.getElementById('unsavedAlert');
  if (alert && !alert.classList.contains('visible') && !sessionStorage.getItem('unsavedAlertDismissed')) {
    alert.classList.add('visible');
  }
}

/**
 * Hide the unsaved changes alert banner
 */
export function hideUnsavedAlert() {
  const alert = document.getElementById('unsavedAlert');
  if (alert) {
    alert.classList.remove('visible');
  }
}

/**
 * Dismiss the unsaved alert and remember dismissal for session
 */
export function dismissUnsavedAlert() {
  hideUnsavedAlert();
  sessionStorage.setItem('unsavedAlertDismissed', 'true');
}

/**
 * Update the save button visual state
 * @param {'saved' | 'modifying' | 'saving' | 'unsaved'} state - Save state
 */
export function updateSaveButtonState(state) {
  const saveStatus = document.getElementById('saveStatus');
  const saveLabel = document.getElementById('saveStatusLabel');

  if (saveStatus) {
    saveStatus.classList.remove('state-saved', 'state-modifying', 'state-saving');
    if (state !== 'unsaved') {
      saveStatus.classList.add(`state-${state}`);
    }
  }

  if (saveLabel) {
    switch (state) {
      case 'modifying':
        saveLabel.textContent = 'Modifications en cours';
        break;
      case 'saving':
        saveLabel.textContent = 'Enregistrement...';
        break;
      case 'saved':
        saveLabel.textContent = 'Enregistré';
        break;
      case 'unsaved':
      default:
        saveLabel.textContent = 'Enregistrer';
        break;
    }
  }
}
