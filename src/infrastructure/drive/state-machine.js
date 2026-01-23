// src/infrastructure/drive/state-machine.js
// Explicit state machine for Google Drive integration

import { emit, EventTypes } from '../../core/events.js';

/**
 * Drive integration states
 */
export const DriveState = {
  SIGNED_OUT: 'signed_out',
  OAUTH_LOADING: 'oauth_loading',
  SIGNED_IN_NO_FOLDER: 'signed_in_no_folder',
  SIGNED_IN_READY: 'signed_in_ready'
};

/**
 * Storage key for persisting Drive state
 */
const STORAGE_KEY = 'drive_explicit_state';

/**
 * DriveStateMachine - Manages explicit state transitions for Drive integration
 *
 * State Transitions:
 * SIGNED_OUT ──[signIn()]──> OAUTH_LOADING
 * OAUTH_LOADING ──[success + has folder]──> SIGNED_IN_READY
 * OAUTH_LOADING ──[success + no folder]──> SIGNED_IN_NO_FOLDER
 * OAUTH_LOADING ──[error/cancel]──> SIGNED_OUT
 * SIGNED_IN_NO_FOLDER ──[folder selected]──> SIGNED_IN_READY
 * SIGNED_IN_READY ──[folder deleted/access revoked]──> SIGNED_IN_NO_FOLDER
 * ANY ──[signOut() or token revoked]──> SIGNED_OUT
 */
class DriveStateMachine {
  constructor() {
    this._state = DriveState.SIGNED_OUT;
    this._listeners = new Set();
    this._restoreState();
  }

  /**
   * Get current state
   * @returns {string} Current DriveState
   */
  getState() {
    return this._state;
  }

  /**
   * Check if user is signed in (any signed-in state)
   * @returns {boolean}
   */
  isSignedIn() {
    return this._state === DriveState.SIGNED_IN_NO_FOLDER ||
           this._state === DriveState.SIGNED_IN_READY;
  }

  /**
   * Check if Drive is fully ready (signed in with folder selected)
   * @returns {boolean}
   */
  isReady() {
    return this._state === DriveState.SIGNED_IN_READY;
  }

  /**
   * Check if OAuth is in progress
   * @returns {boolean}
   */
  isLoading() {
    return this._state === DriveState.OAUTH_LOADING;
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback(newState, oldState)
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /**
   * Transition to a new state
   * @param {string} newState - Target DriveState
   * @private
   */
  _transition(newState) {
    if (this._state === newState) return;

    const oldState = this._state;
    this._state = newState;
    this._persistState();

    // Notify listeners
    for (const listener of this._listeners) {
      try {
        listener(newState, oldState);
      } catch (e) {
        console.error('DriveStateMachine listener error:', e);
      }
    }

    // Emit event for other parts of the app
    emit(EventTypes.DRIVE_STATE_CHANGED, { state: newState, previousState: oldState });
  }

  /**
   * Persist state to sessionStorage
   * @private
   */
  _persistState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, this._state);
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Restore state from sessionStorage
   * @private
   */
  _restoreState() {
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      if (savedState && Object.values(DriveState).includes(savedState)) {
        // Don't restore OAUTH_LOADING - it's a transient state
        if (savedState === DriveState.OAUTH_LOADING) {
          this._state = DriveState.SIGNED_OUT;
        } else {
          this._state = savedState;
        }
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  // ===== State Transition Methods =====

  /**
   * Start OAuth sign-in flow
   * Valid from: SIGNED_OUT
   */
  startOAuth() {
    if (this._state !== DriveState.SIGNED_OUT) {
      console.warn('DriveStateMachine: startOAuth called from invalid state:', this._state);
      return;
    }
    this._transition(DriveState.OAUTH_LOADING);
  }

  /**
   * Handle successful OAuth completion
   * Valid from: OAUTH_LOADING
   * @param {boolean} hasFolder - Whether a folder is already selected
   */
  oauthSuccess(hasFolder) {
    if (this._state !== DriveState.OAUTH_LOADING) {
      // Can also be called during initialization if already signed in
      if (this._state === DriveState.SIGNED_OUT) {
        this._transition(hasFolder ? DriveState.SIGNED_IN_READY : DriveState.SIGNED_IN_NO_FOLDER);
        return;
      }
      console.warn('DriveStateMachine: oauthSuccess called from invalid state:', this._state);
      return;
    }
    this._transition(hasFolder ? DriveState.SIGNED_IN_READY : DriveState.SIGNED_IN_NO_FOLDER);
  }

  /**
   * Handle OAuth failure or cancellation
   * Valid from: OAUTH_LOADING
   */
  oauthFailed() {
    if (this._state !== DriveState.OAUTH_LOADING) {
      console.warn('DriveStateMachine: oauthFailed called from invalid state:', this._state);
      return;
    }
    this._transition(DriveState.SIGNED_OUT);
  }

  /**
   * Handle folder selection
   * Valid from: SIGNED_IN_NO_FOLDER, SIGNED_IN_READY
   */
  folderSelected() {
    if (!this.isSignedIn()) {
      console.warn('DriveStateMachine: folderSelected called while not signed in');
      return;
    }
    this._transition(DriveState.SIGNED_IN_READY);
  }

  /**
   * Handle folder removed/deleted
   * Valid from: SIGNED_IN_READY
   */
  folderRemoved() {
    if (this._state !== DriveState.SIGNED_IN_READY) {
      console.warn('DriveStateMachine: folderRemoved called from invalid state:', this._state);
      return;
    }
    this._transition(DriveState.SIGNED_IN_NO_FOLDER);
  }

  /**
   * Handle sign out
   * Valid from: ANY state
   */
  signOut() {
    this._transition(DriveState.SIGNED_OUT);
  }

  /**
   * Handle token revocation (e.g., by user in Google account settings)
   * Valid from: ANY signed-in state
   */
  tokenRevoked() {
    if (this.isSignedIn() || this._state === DriveState.OAUTH_LOADING) {
      this._transition(DriveState.SIGNED_OUT);
    }
  }

  /**
   * Initialize state based on current auth status
   * Called when the app loads and auth state is known
   * @param {boolean} isSignedIn - Whether user is signed in
   * @param {boolean} hasFolder - Whether a folder is selected
   */
  initialize(isSignedIn, hasFolder) {
    if (!isSignedIn) {
      this._transition(DriveState.SIGNED_OUT);
    } else if (hasFolder) {
      this._transition(DriveState.SIGNED_IN_READY);
    } else {
      this._transition(DriveState.SIGNED_IN_NO_FOLDER);
    }
  }

  /**
   * Reset state machine (for testing or sign out)
   */
  reset() {
    this._transition(DriveState.SIGNED_OUT);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore storage errors
    }
  }
}

// Create singleton instance
const driveStateMachine = new DriveStateMachine();

export { driveStateMachine };
export default driveStateMachine;
