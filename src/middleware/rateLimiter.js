const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({
      data: null,
      meta: {},
      error: 'Too many requests — limit is 100 per 15 minutes',
    });
  },
});

module.exports = limiter;
