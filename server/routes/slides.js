// server/routes/slides.js
// Google Slides API proxy routes

const express = require('express');
const { google } = require('googleapis');
const googleAuth = require('../services/google-auth');

const router = express.Router();

/**
 * Authentication middleware
 */
function requireAuth(req, res, next) {
  if (!req.session.user || !googleAuth.hasValidTokens(req.sessionID)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Apply auth middleware to all routes
router.use(requireAuth);

/**
 * POST /api/slides/presentations
 * Create a new presentation
 */
router.post('/presentations', express.json(), async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const slides = google.slides({ version: 'v1', auth });

    const { title } = req.body;

    const response = await slides.presentations.create({
      requestBody: {
        title: title || 'Sans titre'
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error('Create presentation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/slides/presentations/:id
 * Get presentation details
 */
router.get('/presentations/:id', async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const slides = google.slides({ version: 'v1', auth });

    const response = await slides.presentations.get({
      presentationId: req.params.id
    });

    res.json(response.data);
  } catch (err) {
    console.error('Get presentation error:', err.message);
    if (err.code === 404) {
      return res.status(404).json({ error: 'Presentation not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/slides/presentations/:id/batchUpdate
 * Execute batch update on a presentation
 */
router.post('/presentations/:id/batchUpdate', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const slides = google.slides({ version: 'v1', auth });

    const { requests } = req.body;

    if (!requests || !Array.isArray(requests)) {
      return res.status(400).json({ error: 'requests array is required' });
    }

    const response = await slides.presentations.batchUpdate({
      presentationId: req.params.id,
      requestBody: { requests }
    });

    res.json(response.data);
  } catch (err) {
    console.error('Batch update error:', err.message);
    if (err.code === 404) {
      return res.status(404).json({ error: 'Presentation not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/slides/presentations/:id/pages/:pageId
 * Get a specific page/slide
 */
router.get('/presentations/:id/pages/:pageId', async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const slides = google.slides({ version: 'v1', auth });

    const response = await slides.presentations.pages.get({
      presentationId: req.params.id,
      pageObjectId: req.params.pageId
    });

    res.json(response.data);
  } catch (err) {
    console.error('Get page error:', err.message);
    if (err.code === 404) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/slides/presentations/:id/pages/:pageId/thumbnail
 * Get thumbnail for a page
 */
router.get('/presentations/:id/pages/:pageId/thumbnail', async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const slides = google.slides({ version: 'v1', auth });

    const params = {
      presentationId: req.params.id,
      pageObjectId: req.params.pageId
    };

    if (req.query.thumbnailSize) {
      params.thumbnailProperties = {
        thumbnailSize: req.query.thumbnailSize
      };
    }

    const response = await slides.presentations.pages.getThumbnail(params);

    res.json(response.data);
  } catch (err) {
    console.error('Get thumbnail error:', err.message);
    if (err.code === 404) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
