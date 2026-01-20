// src/drive/auth.js
// Google OAuth 2.0 authentication module

import { DriveConfig } from './config.js';

/**
 * DriveAuth - Google OAuth authentication manager
 */
class DriveAuth {
  constructor() {
    this.tokenClient = null;
    this.gapiInitialized = false;
    this.gisInitialized = false;
    this.currentUser = null;
    this.tokenExpiresAt = null;

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

      // Check if Google APIs already loaded before this module initialized
      if (window._gapiReady && typeof gapi !== 'undefined') {
        setTimeout(() => this.gapiLoaded(), 0);
      }
      if (window._gisReady && typeof google !== 'undefined') {
        setTimeout(() => this.gisLoaded(), 0);
      }
    }
  }

  /**
   * Called when GAPI library loads
   */
  gapiLoaded() {
    gapi.load('client', () => this.initializeGapiClient());
  }

  /**
   * Called when GIS library loads
   */
  gisLoaded() {
    this.initializeGisClient();
  }

  /**
   * Initialize GAPI client
   */
  async initializeGapiClient() {
    try {
      await gapi.client.init({
        discoveryDocs: DriveConfig.DISCOVERY_DOCS
      });
      this.gapiInitialized = true;
      this.checkReady();
    } catch (error) {
      console.error('GAPI initialization error:', error);
      this.triggerCallbacks('onError', error);
    }
  }

  /**
   * Initialize Google Identity Services
   */
  initializeGisClient() {
    try {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: DriveConfig.CLIENT_ID,
        scope: DriveConfig.SCOPES,
        callback: (response) => this.handleTokenResponse(response)
      });
      this.gisInitialized = true;
      this.checkReady();
    } catch (error) {
      console.error('GIS initialization error:', error);
      this.triggerCallbacks('onError', error);
    }
  }

  /**
   * Check if both libraries are ready
   */
  checkReady() {
    if (this.gapiInitialized && this.gisInitialized) {
      this.triggerCallbacks('onReady');

      // Try to restore session from sessionStorage (more secure than localStorage)
      const savedToken = sessionStorage.getItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN);
      if (savedToken) {
        this.restoreSession(savedToken);
      }
    }
  }

  /**
   * Handle token response from OAuth
   */
  handleTokenResponse(response) {
    if (response.error !== undefined) {
      console.error('Auth error:', response);
      this.triggerCallbacks('onError', response);
      return;
    }

    // Save token to sessionStorage (more secure - cleared on browser close)
    sessionStorage.setItem(
      DriveConfig.STORAGE_KEYS.AUTH_TOKEN,
      JSON.stringify(response)
    );

    // Calculate expiration time
    this.tokenExpiresAt = Date.now() + (response.expires_in * 1000);

    // Fetch user info
    this.fetchUserInfo().then(user => {
      this.currentUser = user;
      this.triggerCallbacks('onSignIn', user);
    }).catch(error => {
      console.error('Error fetching user info:', error);
      this.triggerCallbacks('onError', error);
    });
  }

  /**
   * Restore session from saved token
   */
  async restoreSession(tokenJson) {
    try {
      const token = JSON.parse(tokenJson);

      // Check if token is expired
      if (token.expires_in) {
        const savedAt = sessionStorage.getItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN + '_time');
        if (savedAt) {
          const elapsed = (Date.now() - parseInt(savedAt, 10)) / 1000;
          if (elapsed > token.expires_in) {
            // Token expired, need to re-auth
            sessionStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN);
            sessionStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN + '_time');
            return;
          }
        }
      }

      gapi.client.setToken(token);
      this.currentUser = await this.fetchUserInfo();
      this.triggerCallbacks('onSignIn', this.currentUser);
    } catch (error) {
      console.error('Session restore error:', error);
      sessionStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN);
      sessionStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN + '_time');
    }
  }

  /**
   * Fetch current user information
   */
  async fetchUserInfo() {
    const response = await gapi.client.drive.about.get({
      fields: 'user(displayName,emailAddress,photoLink)'
    });
    return response.result.user;
  }

  /**
   * Initialize the auth system
   */
  async init() {
    return new Promise((resolve, reject) => {
      if (this.gapiInitialized && this.gisInitialized) {
        resolve();
        return;
      }

      // Set up ready callback
      this.on('onReady', resolve);

      // Check if libraries are already loaded
      if (typeof gapi !== 'undefined' && !this.gapiInitialized) {
        this.gapiLoaded();
      }
      if (typeof google !== 'undefined' && google.accounts && !this.gisInitialized) {
        this.gisLoaded();
      }
    });
  }

  /**
   * Sign in user
   */
  signIn() {
    if (!this.tokenClient) {
      console.error('DriveAuth not initialized');
      return;
    }

    // Save current time for token expiration calculation
    sessionStorage.setItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN + '_time', Date.now().toString());

    if (gapi.client.getToken() === null) {
      // First time - prompt for consent
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Already authorized - skip consent if possible
      this.tokenClient.requestAccessToken({ prompt: '' });
    }
  }

  /**
   * Sign out user
   */
  signOut() {
    const token = gapi.client.getToken();
    if (token) {
      google.accounts.oauth2.revoke(token.access_token, () => {
        // Token revoked successfully
      });
      gapi.client.setToken(null);
    }

    // Clear storage
    sessionStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN + '_time');

    this.currentUser = null;
    this.tokenExpiresAt = null;
    this.triggerCallbacks('onSignOut');
  }

  /**
   * Check if user is signed in
   */
  isSignedIn() {
    return this.currentUser !== null && gapi.client.getToken() !== null;
  }

  /**
   * Get current user
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired() {
    if (!this.tokenExpiresAt) return true;
    // Add 5-minute buffer
    return Date.now() > (this.tokenExpiresAt - 5 * 60 * 1000);
  }

  /**
   * Refresh token if needed
   */
  async ensureValidToken() {
    if (this.isTokenExpired() && this.isSignedIn()) {
      return new Promise((resolve, reject) => {
        const originalCallback = this.tokenClient.callback;
        this.tokenClient.callback = (response) => {
          this.tokenClient.callback = originalCallback;
          if (response.error) {
            reject(response);
          } else {
            this.handleTokenResponse(response);
            resolve();
          }
        };
        this.tokenClient.requestAccessToken({ prompt: '' });
      });
    }
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
