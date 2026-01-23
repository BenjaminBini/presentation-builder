// server/index.js
// Express server for serving static files and handling Google OAuth

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const googleAuth = require('./services/google-auth');

// Import routes
const authRoutes = require('./routes/auth');
const driveRoutes = require('./routes/drive');
const slidesRoutes = require('./routes/slides');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Auth
try {
  googleAuth.init();
  console.log('Google Auth initialized');
} catch (err) {
  console.error('Failed to initialize Google Auth:', err.message);
  console.error('Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env');
  process.exit(1);
}

// Trust proxy for secure cookies behind reverse proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Parse JSON bodies for API routes
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/auth', authRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/slides', slidesRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from project root
const projectRoot = path.join(__dirname, '..');
app.use(express.static(projectRoot, {
  // Don't serve .env or other sensitive files
  dotfiles: 'deny',
  index: false
}));

// Explicit routes for main files
app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

app.get('/slide-editor.html', (req, res) => {
  res.sendFile(path.join(projectRoot, 'slide-editor.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
===========================================
  Presentation Builder Server
===========================================

  Server running at: http://localhost:${PORT}

  Open http://localhost:${PORT}/slide-editor.html

  Auth endpoints:
    GET  /auth/google     - Start OAuth flow
    GET  /auth/callback   - OAuth callback
    POST /auth/logout     - Sign out
    GET  /auth/status     - Check auth status
    GET  /auth/user       - Get user info

  API endpoints:
    /api/drive/*          - Drive API proxy
    /api/slides/*         - Slides API proxy
===========================================
  `);
});
