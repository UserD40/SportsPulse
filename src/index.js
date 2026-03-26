const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const rateLimiter = require('./middleware/rateLimiter');
const apiKeyAuth = require('./middleware/apiKey');
const keysRouter = require('./routes/keys');
const teamsRouter = require('./routes/teams');
const matchesRouter = require('./routes/matches');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(rateLimiter);

// Health check — Render pings this to verify the service is up
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Swagger docs — no auth required
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Public: generate API keys
app.use('/api/keys', keysRouter);

// Protected routes
app.use('/api/teams',   apiKeyAuth, teamsRouter);
app.use('/api/matches', apiKeyAuth, matchesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ data: null, meta: {}, error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ data: null, meta: {}, error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SportsPulse running on http://localhost:${PORT}`);
    console.log(`Docs: http://localhost:${PORT}/api/docs`);
  });
}

module.exports = app;
