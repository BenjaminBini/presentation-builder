// server/routes/drive.js
// Google Drive API proxy routes

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
 * GET /api/drive/about
 * Get user's Drive about info (used for user info display)
 */
router.get('/about', async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.about.get({
      fields: 'user(displayName,emailAddress,photoLink)'
    });

    res.json(response.data);
  } catch (err) {
    console.error('Drive about error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/drive/files
 * List files with optional query parameters
 */
router.get('/files', async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const drive = google.drive({ version: 'v3', auth });

    const params = {
      q: req.query.q,
      fields: req.query.fields || 'files(id,name,modifiedTime,size,properties)',
      orderBy: req.query.orderBy || 'modifiedTime desc',
      spaces: req.query.spaces || 'drive',
      pageSize: parseInt(req.query.pageSize) || 100
    };

    // Remove undefined params
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    const response = await drive.files.list(params);
    res.json(response.data);
  } catch (err) {
    console.error('List files error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/drive/files/:id
 * Get file metadata
 */
router.get('/files/:id', async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.get({
      fileId: req.params.id,
      fields: req.query.fields || 'id,name,modifiedTime,version,properties,trashed'
    });

    res.json(response.data);
  } catch (err) {
    console.error('Get file error:', err.message);
    if (err.code === 404) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/drive/files/:id/content
 * Get file content (download)
 */
router.get('/files/:id/content', async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.get({
      fileId: req.params.id,
      alt: 'media'
    }, { responseType: 'json' });

    res.json(response.data);
  } catch (err) {
    console.error('Get file content error:', err.message);
    if (err.code === 404) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/drive/files
 * Create a new file (multipart upload)
 */
router.post('/files', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const drive = google.drive({ version: 'v3', auth });

    const { metadata, content } = req.body;

    const response = await drive.files.create({
      requestBody: metadata,
      media: {
        mimeType: metadata.mimeType || 'application/json',
        body: typeof content === 'string' ? content : JSON.stringify(content)
      },
      fields: 'id,name,modifiedTime'
    });

    res.json(response.data);
  } catch (err) {
    console.error('Create file error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/drive/files/:id
 * Update a file (metadata and/or content)
 */
router.patch('/files/:id', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const drive = google.drive({ version: 'v3', auth });

    const { metadata, content } = req.body;

    const params = {
      fileId: req.params.id,
      fields: 'id,name,modifiedTime'
    };

    if (metadata) {
      params.requestBody = metadata;
    }

    if (content !== undefined) {
      params.media = {
        mimeType: (metadata && metadata.mimeType) || 'application/json',
        body: typeof content === 'string' ? content : JSON.stringify(content)
      };
    }

    const response = await drive.files.update(params);
    res.json(response.data);
  } catch (err) {
    console.error('Update file error:', err.message);
    if (err.code === 404) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/drive/files/:id
 * Delete a file permanently
 */
router.delete('/files/:id', async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const drive = google.drive({ version: 'v3', auth });

    await drive.files.delete({
      fileId: req.params.id
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Delete file error:', err.message);
    if (err.code === 404) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/drive/files/:id/trash
 * Move a file to trash
 */
router.post('/files/:id/trash', async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.update({
      fileId: req.params.id,
      requestBody: { trashed: true }
    });

    res.json(response.data);
  } catch (err) {
    console.error('Trash file error:', err.message);
    if (err.code === 404) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/drive/files/:id/move
 * Move a file to a different folder
 */
router.post('/files/:id/move', express.json(), async (req, res) => {
  try {
    const auth = await googleAuth.getAuthClient(req.sessionID);
    const drive = google.drive({ version: 'v3', auth });

    const { folderId } = req.body;

    if (!folderId) {
      return res.status(400).json({ error: 'folderId is required' });
    }

    // Get current parents
    const file = await drive.files.get({
      fileId: req.params.id,
      fields: 'parents'
    });

    const previousParents = file.data.parents ? file.data.parents.join(',') : '';

    // Move to new folder
    const response = await drive.files.update({
      fileId: req.params.id,
      addParents: folderId,
      removeParents: previousParents,
      fields: 'id,parents'
    });

    res.json(response.data);
  } catch (err) {
    console.error('Move file error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
