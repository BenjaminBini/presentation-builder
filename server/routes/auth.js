// server/routes/auth.js
// OAuth authentication routes

const express = require('express');
const crypto = require('crypto');
const googleAuth = require('../services/google-auth');

const router = express.Router();

/**
 * GET /auth/google
 * Initiate Google OAuth flow
 */
router.get('/google', (req, res) => {
  // Generate state for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = state;

  const authUrl = googleAuth.getAuthUrl(state);
  res.redirect(authUrl);
});

/**
 * GET /auth/callback
 * Handle OAuth callback from Google
 */
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  // Handle user cancellation or errors
  if (error) {
    console.error('OAuth error:', error);
    return res.redirect('/slide-editor.html?auth=error&message=' + encodeURIComponent(error));
  }

  // Verify state for CSRF protection
  if (!state || state !== req.session.oauthState) {
    console.error('Invalid OAuth state');
    return res.redirect('/slide-editor.html?auth=error&message=invalid_state');
  }

  // Clear state from session
  delete req.session.oauthState;

  if (!code) {
    console.error('No authorization code received');
    return res.redirect('/slide-editor.html?auth=error&message=no_code');
  }

  try {
    // Exchange code for tokens
    const tokens = await googleAuth.getTokensFromCode(code);

    // Store tokens with session ID
    googleAuth.storeTokens(req.sessionID, tokens);

    // Get user info
    const user = await googleAuth.getUserInfo(req.sessionID);

    // Store user in session
    req.session.user = user;

    // Redirect back to app
    res.redirect('/slide-editor.html?auth=success');
  } catch (err) {
    console.error('Token exchange error:', err.message);
    res.redirect('/slide-editor.html?auth=error&message=' + encodeURIComponent(err.message));
  }
});

/**
 * POST /auth/logout
 * Sign out user
 */
router.post('/logout', async (req, res) => {
  try {
    if (req.sessionID) {
      await googleAuth.revokeTokens(req.sessionID);
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * GET /auth/status
 * Check authentication status
 */
router.get('/status', (req, res) => {
  const isAuthenticated = req.session.user && googleAuth.hasValidTokens(req.sessionID);

  res.json({
    authenticated: isAuthenticated,
    user: isAuthenticated ? req.session.user : null
  });
});

/**
 * GET /auth/user
 * Get current user info (refreshes from Google)
 */
router.get('/user', async (req, res) => {
  if (!req.session.user || !googleAuth.hasValidTokens(req.sessionID)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await googleAuth.getUserInfo(req.sessionID);
    req.session.user = user;
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

/**
 * GET /auth/api-key
 * Get API key for Google Picker (only if authenticated)
 */
router.get('/api-key', (req, res) => {
  if (!req.session.user || !googleAuth.hasValidTokens(req.sessionID)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Return API key for Picker use
  res.json({
    apiKey: process.env.GOOGLE_API_KEY
  });
});

module.exports = router;
