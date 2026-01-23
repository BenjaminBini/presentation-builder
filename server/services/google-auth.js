// server/services/google-auth.js
// Google OAuth token management using googleapis library

const { google } = require('googleapis');
const tokenStore = require('./token-store');

// OAuth scopes
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

/**
 * GoogleAuth - Manages Google OAuth 2.0 authentication
 */
class GoogleAuth {
  constructor() {
    this.oauth2Client = null;
  }

  /**
   * Initialize OAuth2 client
   */
  init() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment');
    }

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BASE_URL}/auth/callback`
    );

    return this;
  }

  /**
   * Generate authorization URL for user to sign in
   * @param {string} state - CSRF protection state
   * @returns {string} Authorization URL
   */
  getAuthUrl(state) {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state,
      prompt: 'consent' // Force refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   * @param {string} code - Authorization code from callback
   * @returns {Promise<Object>} Token object
   */
  async getTokensFromCode(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Get a fresh access token using stored refresh token
   * @param {string} sessionId - Session ID
   * @returns {Promise<string>} Access token
   */
  async getAccessToken(sessionId) {
    const storedTokens = tokenStore.getTokens(sessionId);

    if (!storedTokens || !storedTokens.refresh_token) {
      throw new Error('No refresh token available');
    }

    // Check if current token is still valid (with 5 min buffer)
    if (storedTokens.access_token && storedTokens.expiry_date) {
      const now = Date.now();
      const buffer = 5 * 60 * 1000; // 5 minutes

      if (storedTokens.expiry_date > now + buffer) {
        return storedTokens.access_token;
      }
    }

    // Token expired or expiring soon, refresh it
    this.oauth2Client.setCredentials({
      refresh_token: storedTokens.refresh_token
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();

    // Update stored tokens
    tokenStore.updateAccessToken(
      sessionId,
      credentials.access_token,
      credentials.expiry_date
    );

    return credentials.access_token;
  }

  /**
   * Get authenticated OAuth client for a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<OAuth2Client>} Authenticated OAuth client
   */
  async getAuthClient(sessionId) {
    const accessToken = await this.getAccessToken(sessionId);

    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    client.setCredentials({ access_token: accessToken });

    return client;
  }

  /**
   * Get user info from Google
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} User info
   */
  async getUserInfo(sessionId) {
    const auth = await this.getAuthClient(sessionId);
    const oauth2 = google.oauth2({ version: 'v2', auth });

    const { data } = await oauth2.userinfo.get();

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture
    };
  }

  /**
   * Store tokens for a session
   * @param {string} sessionId - Session ID
   * @param {Object} tokens - Token object from OAuth flow
   */
  storeTokens(sessionId, tokens) {
    tokenStore.setTokens(sessionId, tokens);
  }

  /**
   * Remove tokens for a session (logout)
   * @param {string} sessionId - Session ID
   */
  removeTokens(sessionId) {
    tokenStore.removeTokens(sessionId);
  }

  /**
   * Check if session has valid tokens
   * @param {string} sessionId - Session ID
   * @returns {boolean}
   */
  hasValidTokens(sessionId) {
    return tokenStore.hasTokens(sessionId);
  }

  /**
   * Revoke tokens (optional, for full sign out)
   * @param {string} sessionId - Session ID
   */
  async revokeTokens(sessionId) {
    try {
      const storedTokens = tokenStore.getTokens(sessionId);
      if (storedTokens && storedTokens.access_token) {
        await this.oauth2Client.revokeToken(storedTokens.access_token);
      }
    } catch (error) {
      console.error('Error revoking token:', error.message);
    }
    tokenStore.removeTokens(sessionId);
  }
}

// Create and export singleton
const googleAuth = new GoogleAuth();

module.exports = googleAuth;
