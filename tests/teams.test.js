const request = require('supertest');
const { randomBytes } = require('crypto');
const db = require('../src/db');
const app = require('../src/index');

let apiKey;

beforeAll(() => {
  // Insert a test API key directly
  apiKey = 'sp_test_' + randomBytes(16).toString('hex');
  db.prepare('INSERT OR IGNORE INTO api_keys (key) VALUES (?)').run(apiKey);
});

describe('GET /api/teams', () => {
  it('returns 401 without a key', async () => {
    const res = await request(app).get('/api/teams');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeTruthy();
  });

  it('returns 401 with an invalid key', async () => {
    const res = await request(app).get('/api/teams').set('x-api-key', 'bad_key');
    expect(res.status).toBe(401);
  });

  it('returns all teams with a valid key', async () => {
    const res = await request(app).get('/api/teams').set('x-api-key', apiKey);
    expect(res.status).toBe(200);
    expect(res.body.error).toBeNull();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta.total).toBe(res.body.data.length);
  });

  it('each team has the expected fields', async () => {
    const res = await request(app).get('/api/teams').set('x-api-key', apiKey);
    const team = res.body.data[0];
    expect(team).toHaveProperty('id');
    expect(team).toHaveProperty('name');
    expect(team).toHaveProperty('short_name');
    expect(team).toHaveProperty('country');
  });
});

describe('GET /api/teams/:id', () => {
  it('returns a team by ID', async () => {
    const res = await request(app).get('/api/teams/1').set('x-api-key', apiKey);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(1);
  });

  it('returns 404 for a non-existent team', async () => {
    const res = await request(app).get('/api/teams/99999').set('x-api-key', apiKey);
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });

  it('returns 400 for a non-numeric ID', async () => {
    const res = await request(app).get('/api/teams/abc').set('x-api-key', apiKey);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/teams/:id/matches', () => {
  it('returns matches for a valid team', async () => {
    const res = await request(app).get('/api/teams/1/matches').set('x-api-key', apiKey);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Every match should involve team 1
    for (const m of res.body.data) {
      expect(m.home_team_id === 1 || m.away_team_id === 1).toBe(true);
    }
  });

  it('returns 404 for a non-existent team', async () => {
    const res = await request(app).get('/api/teams/99999/matches').set('x-api-key', apiKey);
    expect(res.status).toBe(404);
  });
});
