const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SportsPulse API',
      version: '1.0.0',
      description:
        'A clean REST API serving football match and team data. ' +
        'All endpoints (except POST /api/keys) require an API key in the `x-api-key` header.',
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
      schemas: {
        Response: {
          type: 'object',
          properties: {
            data:  { description: 'Response payload — object, array, or null' },
            meta:  { type: 'object', description: 'Pagination metadata when applicable' },
            error: { type: 'string', nullable: true, description: 'Error message, or null on success' },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid API key',
          content: {
            'application/json': {
              example: { data: null, meta: {}, error: 'Invalid API key' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              example: { data: null, meta: {}, error: 'Not found' },
            },
          },
        },
        BadRequest: {
          description: 'Invalid query parameters',
          content: {
            'application/json': {
              example: { data: null, meta: {}, error: 'Validation error message' },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth',    description: 'API key management' },
      { name: 'Teams',   description: 'Football clubs' },
      { name: 'Matches', description: 'Match fixtures and results' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
