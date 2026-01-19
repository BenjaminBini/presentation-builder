// src/core/state.js
// Re-exports pure state functions + DOM helpers for UI state updates

export * from './state/index.js';

// DOM helpers for UI state updates (kept separate from pure state layer)
export function showUnsavedAlert() {
  const alert = document.getElementById('unsavedAlert');
  if (alert && !alert.classList.contains('visible') && !sessionStorage.getItem('unsavedAlertDismissed')) {
    alert.classList.add('visible');
  }
}

export function hideUnsavedAlert() {
  const alert = document.getElementById('unsavedAlert');
  if (alert) {
    alert.classList.remove('visible');
  }
}

export function dismissUnsavedAlert() {
  hideUnsavedAlert();
  sessionStorage.setItem('unsavedAlertDismissed', 'true');
}

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
