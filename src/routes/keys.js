const express = require('express');
const { randomBytes } = require('crypto');
const db = require('../db');

const router = express.Router();

/**
 * @swagger
 * /api/keys:
 *   post:
 *     summary: Generate a new API key
 *     description: Public endpoint — no auth required. Returns a key to use in the x-api-key header for all other requests.
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: API key created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               data: { key: "sp_abc123..." }
 *               meta: {}
 *               error: null
 */
router.post('/', (req, res) => {
  const key = 'sp_' + randomBytes(24).toString('hex');
  db.prepare('INSERT INTO api_keys (key) VALUES (?)').run(key);
  res.status(201).json({ data: { key }, meta: {}, error: null });
});

module.exports = router;
