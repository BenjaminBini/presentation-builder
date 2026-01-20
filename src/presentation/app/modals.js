// src/app/modals.js
// Modal handling functions

/**
 * Close a modal by its ID with animation
 * @param {string} modalId - The ID of the modal element
 */
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal && modal.classList.contains('active')) {
        modal.classList.add('closing');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.remove('closing');
        }, 250);
    }
}

/**
 * Close any currently active modal with animation
 * @returns {boolean} True if a modal was closed, false otherwise
 */
export function closeActiveModal() {
    const activeModal = document.querySelector('.modal-overlay.active');
    if (activeModal) {
        activeModal.classList.add('closing');
        activeModal.classList.remove('active');
        setTimeout(() => {
            activeModal.classList.remove('closing');
        }, 250);
        return true;
    }
    return false;
}

/**
 * Initialize modal behaviors (Escape key and click outside to close)
 */
export function initModalBehaviors() {
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Don't close if we're in presentation mode
            const player = document.getElementById('presentationPlayer');
            if (player && player.classList.contains('active')) return;

            closeActiveModal();
        }
    });

    // Close modal when clicking on overlay (outside modal content)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
            e.target.classList.add('closing');
            e.target.classList.remove('active');
            setTimeout(() => {
                e.target.classList.remove('closing');
            }, 250);
        }
    });
}

/**
 * Open the projects modal
 */
export function openProjectsModal() {
    if (window.openProjectModal) {
        window.openProjectModal();
    }
}

// Prompt modal - stores callback for when confirmed
let promptCallback = null;

export function openPromptModal(title, label, placeholder, callback) {
    const titleEl = document.getElementById('promptModalTitle');
    const labelEl = document.getElementById('promptModalLabel');
    const inputEl = document.getElementById('promptModalInput');
    const errorEl = document.getElementById('promptModalError');

    if (titleEl) titleEl.textContent = title;
    if (labelEl) labelEl.textContent = label;
    if (inputEl) {
        inputEl.value = '';
        inputEl.placeholder = placeholder || '';
    }
    if (errorEl) errorEl.textContent = '';

    promptCallback = callback;
    const modal = document.getElementById('promptModal');
    if (modal) modal.classList.add('active');
}

export function cancelPromptModal() {
    promptCallback = null;
    closeModal('promptModal');
}

export function confirmPromptModal() {
    const inputEl = document.getElementById('promptModalInput');
    const value = inputEl ? inputEl.value.trim() : '';

    if (promptCallback) {
        promptCallback(value);
        promptCallback = null;
    }
    closeModal('promptModal');
}

// Drive conflict - stores resolve callback from sync service
let conflictResolveCallback = null;

export function setConflictResolver(resolver) {
    conflictResolveCallback = resolver;
}

export function resolveConflict(choice) {
    if (conflictResolveCallback) {
        conflictResolveCallback(choice);
        conflictResolveCallback = null;
    }
    closeModal('driveConflictModal');
}
