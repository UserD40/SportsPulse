const request = require('supertest');
const { randomBytes } = require('crypto');
const db = require('../src/db');
const app = require('../src/index');

let apiKey;

beforeAll(() => {
  apiKey = 'sp_test_' + randomBytes(16).toString('hex');
  db.prepare('INSERT OR IGNORE INTO api_keys (key) VALUES (?)').run(apiKey);
});

describe('GET /api/matches', () => {
  it('returns 401 without a key', async () => {
    const res = await request(app).get('/api/matches');
    expect(res.status).toBe(401);
  });

  it('returns matches with valid key', async () => {
    const res = await request(app).get('/api/matches').set('x-api-key', apiKey);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('limit');
    expect(res.body.meta).toHaveProperty('offset');
  });

  it('filters by status', async () => {
    const res = await request(app)
      .get('/api/matches?status=finished')
      .set('x-api-key', apiKey);
    expect(res.status).toBe(200);
    for (const m of res.body.data) {
      expect(m.status).toBe('finished');
    }
  });

  it('filters by season', async () => {
    const res = await request(app)
      .get('/api/matches?season=2024-25')
      .set('x-api-key', apiKey);
    expect(res.status).toBe(200);
    for (const m of res.body.data) {
      expect(m.season).toBe('2024-25');
    }
  });

  it('filters by team_id', async () => {
    const res = await request(app)
      .get('/api/matches?team_id=1')
      .set('x-api-key', apiKey);
    expect(res.status).toBe(200);
    for (const m of res.body.data) {
      expect(m.home_team_id === 1 || m.away_team_id === 1).toBe(true);
    }
  });

  it('paginates correctly', async () => {
    const page1 = await request(app)
      .get('/api/matches?limit=5&offset=0')
      .set('x-api-key', apiKey);
    const page2 = await request(app)
      .get('/api/matches?limit=5&offset=5')
      .set('x-api-key', apiKey);

    expect(page1.body.data.length).toBe(5);
    expect(page2.body.data.length).toBe(5);
    // Pages should not overlap
    const ids1 = page1.body.data.map(m => m.id);
    const ids2 = page2.body.data.map(m => m.id);
    expect(ids1.some(id => ids2.includes(id))).toBe(false);
  });

  it('returns 400 for invalid status', async () => {
    const res = await request(app)
      .get('/api/matches?status=invalid')
      .set('x-api-key', apiKey);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('each match includes team names', async () => {
    const res = await request(app)
      .get('/api/matches?limit=1')
      .set('x-api-key', apiKey);
    const m = res.body.data[0];
    expect(m).toHaveProperty('home_team_name');
    expect(m).toHaveProperty('away_team_name');
  });
});

describe('GET /api/matches/:id', () => {
  it('returns a match by ID', async () => {
    const res = await request(app).get('/api/matches/1').set('x-api-key', apiKey);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(1);
  });

  it('returns 404 for non-existent match', async () => {
    const res = await request(app).get('/api/matches/99999').set('x-api-key', apiKey);
    expect(res.status).toBe(404);
  });

  it('returns 400 for non-numeric ID', async () => {
    const res = await request(app).get('/api/matches/abc').set('x-api-key', apiKey);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/keys', () => {
  it('returns a new API key', async () => {
    const res = await request(app).post('/api/keys');
    expect(res.status).toBe(201);
    expect(res.body.data.key).toMatch(/^sp_/);
  });

  it('generated key actually works', async () => {
    const createRes = await request(app).post('/api/keys');
    const newKey = createRes.body.data.key;

    const res = await request(app).get('/api/teams').set('x-api-key', newKey);
    expect(res.status).toBe(200);
  });
});
