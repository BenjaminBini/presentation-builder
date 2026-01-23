// src/drive/auth.js
// Google OAuth 2.0 authentication module (server-based)

/**
 * DriveAuth - Google OAuth authentication manager (server-based)
 * Authentication is handled by the server; this module manages the client-side state
 */
class DriveAuth {
  constructor() {
    this.currentUser = null;
    this.ready = false;
    this.apiKey = null;

    // Event callbacks
    this.callbacks = {
      onSignIn: [],
      onSignOut: [],
      onError: [],
      onReady: []
    };

    // Store reference for external callers
    if (typeof window !== 'undefined') {
      window.driveAuth = this;
    }
  }

  /**
   * Initialize the auth system
   */
  async init() {
    try {
      // Check authentication status with server
      const response = await fetch('/auth/status');
      const data = await response.json();

      if (data.authenticated && data.user) {
        this.currentUser = {
          displayName: data.user.name,
          emailAddress: data.user.email,
          photoLink: data.user.picture
        };
        this.triggerCallbacks('onSignIn', this.currentUser);
      }

      this.ready = true;
      this.triggerCallbacks('onReady');

      // Handle auth callback from URL params
      this.handleAuthCallback();
    } catch (error) {
      console.error('Auth init error:', error);
      this.ready = true;
      this.triggerCallbacks('onReady');
    }
  }

  /**
   * Handle auth callback from URL parameters
   */
  handleAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');

    if (authStatus === 'success') {
      // Refresh auth status to get user info
      this.refreshAuthStatus();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (authStatus === 'error') {
      const message = params.get('message') || 'Authentication failed';
      console.error('Auth callback error:', message);
      this.triggerCallbacks('onError', { error: message });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  /**
   * Refresh authentication status from server
   */
  async refreshAuthStatus() {
    try {
      const response = await fetch('/auth/status');
      const data = await response.json();

      if (data.authenticated && data.user) {
        this.currentUser = {
          displayName: data.user.name,
          emailAddress: data.user.email,
          photoLink: data.user.picture
        };
        this.triggerCallbacks('onSignIn', this.currentUser);
      } else {
        this.currentUser = null;
        this.triggerCallbacks('onSignOut');
      }
    } catch (error) {
      console.error('Refresh auth status error:', error);
    }
  }

  /**
   * Sign in user - redirects to server OAuth flow
   */
  signIn() {
    // Redirect to server OAuth endpoint
    window.location.href = '/auth/google';
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      await fetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local state
    this.currentUser = null;
    this.apiKey = null;
    this.triggerCallbacks('onSignOut');
  }

  /**
   * Check if user is signed in
   */
  isSignedIn() {
    return this.currentUser !== null;
  }

  /**
   * Get current user
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Ensure we have a valid session (server handles token refresh)
   * @throws {Error} If not authenticated
   */
  async ensureValidToken() {
    if (!this.isSignedIn()) {
      throw new Error('Not authenticated. Please sign in to Google Drive.');
    }

    // Server handles token refresh automatically
    // Just verify session is still valid
    try {
      const response = await fetch('/auth/status');
      const data = await response.json();

      if (!data.authenticated) {
        this.currentUser = null;
        this.triggerCallbacks('onSignOut');
        throw new Error('Session expired. Please sign in again.');
      }
    } catch (error) {
      if (error.message.includes('Session expired')) {
        throw error;
      }
      // Network error - assume session is still valid
      console.warn('Could not verify session:', error.message);
    }
  }

  /**
   * Get API key for Google Picker
   * @returns {Promise<string|null>}
   */
  async getApiKey() {
    if (this.apiKey) {
      return this.apiKey;
    }

    try {
      const response = await fetch('/auth/api-key');
      if (response.ok) {
        const data = await response.json();
        this.apiKey = data.apiKey;
        return this.apiKey;
      }
    } catch (error) {
      console.error('Failed to get API key:', error);
    }

    return null;
  }

  /**
   * Subscribe to events
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  /**
   * Unsubscribe from events
   */
  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Trigger callbacks
   */
  triggerCallbacks(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error('Callback error:', e);
        }
      });
    }
  }
}

// Create singleton instance
const authInstance = new DriveAuth();

// Export instance and class
export { authInstance as driveAuth, DriveAuth };
export default authInstance;
