# PRD — SportsPulse

**Tagline:** A clean, documented REST API for football match data — built from scratch.

**Why it punches above its weight:** Anyone can consume an API. Building one — with proper
REST design, input validation, auth, rate limiting, error handling, and Swagger docs —
is a completely different skill level. This project signals backend maturity.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js + Express | Standard backend choice |
| Database | SQLite (via `better-sqlite3`) | SQL skills without Postgres setup friction |
| Validation | Zod | Schema-first, great error messages |
| Docs | Swagger UI (`swagger-ui-express` + `swagger-jsdoc`) | Industry standard API docs |
| Auth | API key (in `x-api-key` header) | Simple, appropriate for a data API |
| Rate limiting | `express-rate-limit` | Production practice, one-liner to add |
| Testing | Vitest + supertest | Fast, modern testing |

---

## Domain — What Data Does It Serve?

Football (soccer) match and team data. Seed the database with realistic static data —
no external API dependency needed. The data is not the point; the API design is.

---

## Core Features (MVP — build only these)

### API Key Auth
- Generate a key with `POST /api/keys` (public endpoint, no auth)
- All other endpoints require `x-api-key: <key>` in the request header
- Invalid/missing key → `401 Unauthorized`

### Endpoints

```
GET  /api/teams                       List all teams
GET  /api/teams/:id                   Single team
GET  /api/teams/:id/matches           All matches for a team

GET  /api/matches                     List matches (supports filters below)
GET  /api/matches/:id                 Single match

Query params for GET /api/matches:
  ?status=upcoming|live|finished
  ?team_id=123
  ?season=2024
  ?limit=20&offset=0
```

### Rate Limiting
- 100 requests per 15 minutes per IP
- Returns `429 Too Many Requests` with a `Retry-After` header when exceeded

### Standard Response Shape
Every response:
```json
{
  "data": { ... } | [ ... ] | null,
  "meta": { "total": 50, "limit": 20, "offset": 0 },
  "error": null | "message string"
}
```

### Swagger Docs
- Auto-generated from JSDoc comments on routes
- Served at `/api/docs`
- Shows all endpoints, request params, response shapes, auth header

### What to cut
- Live score updates (no WebSockets needed)
- User accounts beyond API keys
- Admin panel / CMS
- External data source / scraping

---

## Data Model

### `teams`
```sql
id          INTEGER PRIMARY KEY AUTOINCREMENT
name        TEXT NOT NULL
short_name  TEXT          -- e.g. "MCI"
country     TEXT
stadium     TEXT
founded     INTEGER
```

### `matches`
```sql
id            INTEGER PRIMARY KEY AUTOINCREMENT
home_team_id  INTEGER REFERENCES teams(id)
away_team_id  INTEGER REFERENCES teams(id)
home_score    INTEGER
away_score    INTEGER
status        TEXT    -- upcoming | live | finished
kickoff       TEXT    -- ISO 8601 datetime
season        TEXT    -- e.g. "2024-25"
competition   TEXT    -- e.g. "Premier League"
```

### `api_keys`
```sql
id          INTEGER PRIMARY KEY AUTOINCREMENT
key         TEXT UNIQUE NOT NULL
created_at  TEXT DEFAULT (datetime('now'))
last_used   TEXT
```

---

## File Structure

```
SportsPulse/
├── src/
│   ├── index.js              App entry, middleware stack
│   ├── db.js                 SQLite connection + schema init
│   ├── seed.js               Seed script — realistic dummy data
│   ├── middleware/
│   │   ├── apiKey.js         API key validation
│   │   └── rateLimiter.js    express-rate-limit config
│   ├── routes/
│   │   ├── keys.js           POST /api/keys
│   │   ├── teams.js          GET /api/teams, GET /api/teams/:id
│   │   └── matches.js        GET /api/matches, GET /api/matches/:id
│   ├── schemas/
│   │   └── query.js          Zod schemas for query param validation
│   └── swagger.js            Swagger config
├── tests/
│   ├── teams.test.js
│   └── matches.test.js
├── package.json
└── README.md
```

---

## What Makes This Impressive

1. **You built the API** — schema, auth, rate limiting, validation, docs. Not a tutorial copy.
2. **Swagger docs** — `/api/docs` is live and interactive. Shows professionalism.
3. **Consistent response shape** — every endpoint follows the same contract. Shows API design thinking.
4. **Rate limiting** — one line in most tutorials, but most portfolios skip it.
5. **Zod validation** — query params validated at the boundary, not inside route handlers.
6. **Tests** — even a handful of route tests signal you take quality seriously.
7. **Seed script** — `npm run seed` populates realistic data. Reviewer can run it instantly.

---

## README Must Include

- Live docs link (deploy to Render — just the API, no frontend needed)
- `curl` examples for every endpoint
- How to get an API key
- Rate limit info
- How to run locally + seed data
- Example response JSON for each endpoint

---

## Build Order

1. `db.js` — schema + connection
2. `seed.js` — populate 20 teams, 100 matches
3. API key middleware
4. `GET /api/teams` + `GET /api/teams/:id`
5. `GET /api/matches` with query param filtering
6. Rate limiting middleware
7. Swagger JSDoc comments + `/api/docs`
8. Tests for teams + matches routes
9. Deploy, README with curl examples
