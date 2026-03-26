const express = require('express');
const db = require('../db');
const { matchesQuerySchema } = require('../schemas/query');

const router = express.Router();

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: List matches with optional filters
 *     tags: [Matches]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, live, finished]
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: season
 *         schema:
 *           type: string
 *           example: "2024-25"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Paginated list of matches
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', (req, res) => {
  const parsed = matchesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      data: null,
      meta: {},
      error: parsed.error.issues.map(i => i.message).join(', '),
    });
  }

  const { status, team_id, season, limit, offset } = parsed.data;

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('m.status = ?');
    params.push(status);
  }
  if (team_id) {
    conditions.push('(m.home_team_id = ? OR m.away_team_id = ?)');
    params.push(team_id, team_id);
  }
  if (season) {
    conditions.push('m.season = ?');
    params.push(season);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const total = db.prepare(`
    SELECT COUNT(*) AS n FROM matches m ${where}
  `).get(...params).n;

  const matches = db.prepare(`
    SELECT m.*,
      ht.name AS home_team_name, ht.short_name AS home_team_short,
      at.name AS away_team_name, at.short_name AS away_team_short
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    ${where}
    ORDER BY m.kickoff DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({
    data: matches,
    meta: { total, limit, offset },
    error: null,
  });
});

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get a single match by ID
 *     tags: [Matches]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Match object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ data: null, meta: {}, error: 'Invalid match ID' });
  }

  const match = db.prepare(`
    SELECT m.*,
      ht.name AS home_team_name, ht.short_name AS home_team_short,
      at.name AS away_team_name, at.short_name AS away_team_short
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    WHERE m.id = ?
  `).get(id);

  if (!match) {
    return res.status(404).json({ data: null, meta: {}, error: 'Match not found' });
  }

  res.json({ data: match, meta: {}, error: null });
});

module.exports = router;
