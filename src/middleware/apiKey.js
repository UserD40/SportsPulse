const db = require('../db');

function apiKeyAuth(req, res, next) {
  const key = req.headers['x-api-key'];

  if (!key) {
    return res.status(401).json({ data: null, meta: {}, error: 'Missing x-api-key header' });
  }

  const row = db.prepare('SELECT id FROM api_keys WHERE key = ?').get(key);

  if (!row) {
    return res.status(401).json({ data: null, meta: {}, error: 'Invalid API key' });
  }

  db.prepare("UPDATE api_keys SET last_used = datetime('now') WHERE id = ?").run(row.id);

  next();
}

module.exports = apiKeyAuth;
