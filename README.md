# SportsPulse

A clean, documented REST API serving football match and team data. Built from scratch with Node.js, Express, and SQLite — featuring API key authentication, rate limiting, Zod input validation, and interactive Swagger documentation.

**Live API:** https://sportspulse.onrender.com
**Interactive docs:** https://sportspulse.onrender.com/api/docs

> First request after inactivity may take ~30 seconds (free tier cold start).

---

## Features

- **API key auth** — generate a key at `POST /api/keys`, pass it as `x-api-key`
- **Teams** — list all teams, fetch a single team, get all matches for a team
- **Matches** — list and filter by status, team, season, and competition
- **Rate limiting** — 100 requests per 15 minutes per IP
- **Zod validation** — query parameters validated at the API boundary
- **Swagger docs** — live interactive docs at `/api/docs`
- **Consistent response shape** — every endpoint returns `{ data, meta, error }`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js, Express |
| Database | SQLite (`better-sqlite3`) |
| Validation | Zod |
| Auth | API key (`x-api-key` header) |
| Rate limiting | `express-rate-limit` |
| Docs | Swagger UI + swagger-jsdoc |
| Testing | Vitest + Supertest |

---

## Getting Started

```bash
git clone git@github.com:UserD40/SportsPulse.git
cd SportsPulse
npm install
npm run seed   # populates 20 teams, 108 matches
npm run dev    # http://localhost:3000
```

Swagger docs at `http://localhost:3000/api/docs`.

---

## API Reference

### Step 1 — Get an API key

```bash
curl -X POST https://sportspulse.onrender.com/api/keys
```

```json
{
  "data": { "key": "sp_a3f1c2..." },
  "meta": {},
  "error": null
}
```

Use that key in the `x-api-key` header for every subsequent request.

---

### Teams

**List all teams**

```bash
curl -H "x-api-key: sp_a3f1c2..." \
  https://sportspulse.onrender.com/api/teams
```

```json
{
  "data": [
    { "id": 1, "name": "Manchester City", "short_name": "MCI", "country": "England", "stadium": "Etihad Stadium", "founded": 1880 },
    { "id": 2, "name": "Arsenal", "short_name": "ARS", "country": "England", "stadium": "Emirates Stadium", "founded": 1886 }
  ],
  "meta": { "total": 20 },
  "error": null
}
```

**Single team**

```bash
curl -H "x-api-key: sp_a3f1c2..." \
  https://sportspulse.onrender.com/api/teams/1
```

```json
{
  "data": { "id": 1, "name": "Manchester City", "short_name": "MCI", "country": "England", "stadium": "Etihad Stadium", "founded": 1880 },
  "meta": {},
  "error": null
}
```

**All matches for a team**

```bash
curl -H "x-api-key: sp_a3f1c2..." \
  https://sportspulse.onrender.com/api/teams/1/matches
```

```json
{
  "data": [
    {
      "id": 5,
      "home_team_id": 1, "home_team_name": "Manchester City", "home_team_short": "MCI",
      "away_team_id": 3, "away_team_name": "Liverpool",       "away_team_short": "LIV",
      "home_score": 2, "away_score": 1,
      "status": "finished",
      "kickoff": "2025-02-14T15:00:00.000Z",
      "season": "2024-25",
      "competition": "Premier League"
    }
  ],
  "meta": { "total": 18 },
  "error": null
}
```

---

### Matches

**List matches** (paginated, with optional filters)

```bash
curl -H "x-api-key: sp_a3f1c2..." \
  "https://sportspulse.onrender.com/api/matches?status=upcoming&limit=5&offset=0"
```

```json
{
  "data": [
    {
      "id": 12,
      "home_team_id": 2, "home_team_name": "Arsenal",  "home_team_short": "ARS",
      "away_team_id": 4, "away_team_name": "Chelsea",   "away_team_short": "CHE",
      "home_score": null, "away_score": null,
      "status": "upcoming",
      "kickoff": "2025-04-10T15:00:00.000Z",
      "season": "2024-25",
      "competition": "Premier League"
    }
  ],
  "meta": { "total": 22, "limit": 5, "offset": 0 },
  "error": null
}
```

**Query parameters**

| Param | Type | Example |
|---|---|---|
| `status` | `upcoming` \| `live` \| `finished` | `?status=finished` |
| `team_id` | integer | `?team_id=3` |
| `season` | string | `?season=2024-25` |
| `limit` | integer (1–100, default 20) | `?limit=10` |
| `offset` | integer (default 0) | `?offset=20` |

**Single match**

```bash
curl -H "x-api-key: sp_a3f1c2..." \
  https://sportspulse.onrender.com/api/matches/1
```

```json
{
  "data": {
    "id": 1,
    "home_team_id": 1, "home_team_name": "Manchester City", "home_team_short": "MCI",
    "away_team_id": 2, "away_team_name": "Arsenal",         "away_team_short": "ARS",
    "home_score": 3, "away_score": 1,
    "status": "finished",
    "kickoff": "2024-10-03T15:00:00.000Z",
    "season": "2023-24",
    "competition": "Premier League"
  },
  "meta": {},
  "error": null
}
```

---

### Rate Limiting

100 requests per 15 minutes per IP. When exceeded:

```json
{
  "data": null,
  "meta": {},
  "error": "Too many requests — limit is 100 per 15 minutes"
}
```

Response headers on every request:

```
RateLimit-Limit: 100
RateLimit-Remaining: 97
RateLimit-Reset: 1712345678
```

---

## Response Shape

Every endpoint returns the same envelope:

```json
{
  "data":  { } | [ ] | null,
  "meta":  { "total": 50, "limit": 20, "offset": 0 },
  "error": null | "error message"
}
```

---

## Project Structure

```
SportsPulse/
├── src/
│   ├── index.js              Express app, middleware stack
│   ├── db.js                 SQLite connection + schema init
│   ├── seed.js               Seed script (20 teams, 108 matches)
│   ├── middleware/
│   │   ├── apiKey.js         x-api-key validation
│   │   └── rateLimiter.js    express-rate-limit config
│   ├── routes/
│   │   ├── keys.js           POST /api/keys
│   │   ├── teams.js          GET /api/teams, /api/teams/:id
│   │   └── matches.js        GET /api/matches, /api/matches/:id
│   ├── schemas/
│   │   └── query.js          Zod query param schemas
│   └── swagger.js            Swagger/OpenAPI config
├── tests/
│   ├── teams.test.js
│   └── matches.test.js
└── render.yaml               Render deployment config
```

---

## Running Tests

```bash
npm test
```

22 integration tests via Vitest + Supertest covering auth, filtering, pagination, and error cases.
