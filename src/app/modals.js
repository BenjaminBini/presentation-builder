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

// Prompt modal stubs
export function cancelPromptModal() {
    closeModal('promptModal');
}

export function confirmPromptModal() {
    closeModal('promptModal');
}

// Drive conflict stub
export function resolveConflict(_choice) {
    closeModal('conflictModal');
}
