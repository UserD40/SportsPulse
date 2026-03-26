const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: List all teams
 *     tags: [Teams]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Array of teams
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', (req, res) => {
  const teams = db.prepare('SELECT * FROM teams ORDER BY name').all();
  res.json({ data: teams, meta: { total: teams.length }, error: null });
});

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get a single team by ID
 *     tags: [Teams]
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
 *         description: Team object
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
    return res.status(400).json({ data: null, meta: {}, error: 'Invalid team ID' });
  }

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
  if (!team) {
    return res.status(404).json({ data: null, meta: {}, error: 'Team not found' });
  }

  res.json({ data: team, meta: {}, error: null });
});

/**
 * @swagger
 * /api/teams/{id}/matches:
 *   get:
 *     summary: Get all matches for a team
 *     tags: [Teams]
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
 *         description: Array of matches
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/matches', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ data: null, meta: {}, error: 'Invalid team ID' });
  }

  const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(id);
  if (!team) {
    return res.status(404).json({ data: null, meta: {}, error: 'Team not found' });
  }

  const matches = db.prepare(`
    SELECT m.*,
      ht.name AS home_team_name, ht.short_name AS home_team_short,
      at.name AS away_team_name, at.short_name AS away_team_short
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    WHERE m.home_team_id = ? OR m.away_team_id = ?
    ORDER BY m.kickoff DESC
  `).all(id, id);

  res.json({ data: matches, meta: { total: matches.length }, error: null });
});

module.exports = router;
