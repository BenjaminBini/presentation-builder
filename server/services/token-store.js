// server/services/token-store.js
// File-based refresh token storage

const fs = require('fs');
const path = require('path');

const TOKENS_FILE = path.join(__dirname, '..', '..', '.tokens.json');

/**
 * TokenStore - Manages persistent storage of refresh tokens
 * Uses file-based storage for simplicity (replace with database in production)
 */
class TokenStore {
  constructor() {
    this.tokens = this._loadTokens();
  }

  /**
   * Load tokens from file
   * @private
   */
  _loadTokens() {
    try {
      if (fs.existsSync(TOKENS_FILE)) {
        const data = fs.readFileSync(TOKENS_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading tokens:', error.message);
    }
    return {};
  }

  /**
   * Save tokens to file
   * @private
   */
  _saveTokens() {
    try {
      fs.writeFileSync(TOKENS_FILE, JSON.stringify(this.tokens, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving tokens:', error.message);
    }
  }

  /**
   * Store tokens for a user
   * @param {string} sessionId - Session ID
   * @param {Object} tokens - Token object containing refresh_token, access_token, etc.
   */
  setTokens(sessionId, tokens) {
    this.tokens[sessionId] = {
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      expiry_date: tokens.expiry_date,
      scope: tokens.scope,
      token_type: tokens.token_type,
      updatedAt: Date.now()
    };
    this._saveTokens();
  }

  /**
   * Get tokens for a session
   * @param {string} sessionId - Session ID
   * @returns {Object|null} Token object or null
   */
  getTokens(sessionId) {
    return this.tokens[sessionId] || null;
  }

  /**
   * Update access token for a session
   * @param {string} sessionId - Session ID
   * @param {string} accessToken - New access token
   * @param {number} expiryDate - Token expiry timestamp
   */
  updateAccessToken(sessionId, accessToken, expiryDate) {
    if (this.tokens[sessionId]) {
      this.tokens[sessionId].access_token = accessToken;
      this.tokens[sessionId].expiry_date = expiryDate;
      this.tokens[sessionId].updatedAt = Date.now();
      this._saveTokens();
    }
  }

  /**
   * Remove tokens for a session
   * @param {string} sessionId - Session ID
   */
  removeTokens(sessionId) {
    if (this.tokens[sessionId]) {
      delete this.tokens[sessionId];
      this._saveTokens();
    }
  }

  /**
   * Check if session has valid tokens
   * @param {string} sessionId - Session ID
   * @returns {boolean}
   */
  hasTokens(sessionId) {
    const tokens = this.tokens[sessionId];
    return tokens && tokens.refresh_token;
  }

  /**
   * Clean up expired sessions (older than 30 days)
   */
  cleanup() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    let cleaned = false;

    for (const sessionId in this.tokens) {
      if (this.tokens[sessionId].updatedAt < thirtyDaysAgo) {
        delete this.tokens[sessionId];
        cleaned = true;
      }
    }

    if (cleaned) {
      this._saveTokens();
    }
  }
}

// Create singleton instance
const tokenStore = new TokenStore();

// Run cleanup on startup
tokenStore.cleanup();

module.exports = tokenStore;
