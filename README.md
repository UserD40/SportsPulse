# SportsPulse

A clean, documented REST API serving football match and team data. Built from scratch with Node.js, Express, and SQLite — featuring API key authentication, rate limiting, Zod input validation, and interactive Swagger documentation.

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
| Testing | Vitest + supertest |

---

## Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
git clone git@github.com:UserD40/SportsPulse.git
cd SportsPulse
npm install
```

### Seed the database

```bash
npm run seed
```

Populates 20 teams and 100 matches with realistic data.

### Run the server

```bash
npm run dev
```

API runs at `http://localhost:3001`.
Swagger docs at `http://localhost:3001/api/docs`.

---

## API Reference

### Authentication

Generate an API key (no auth required):

```bash
curl -X POST http://localhost:3001/api/keys
# → { "data": { "key": "sk_..." }, "error": null }
```

Pass the key in all subsequent requests:

```bash
curl -H "x-api-key: sk_..." http://localhost:3001/api/teams
```

### Endpoints

```
POST  /api/keys                      Generate an API key

GET   /api/teams                     List all teams
GET   /api/teams/:id                 Single team
GET   /api/teams/:id/matches         All matches for a team

GET   /api/matches                   List matches
GET   /api/matches/:id               Single match
```

### Query Parameters — `GET /api/matches`

| Param | Type | Example |
|---|---|---|
| `status` | string | `upcoming` \| `live` \| `finished` |
| `team_id` | integer | `3` |
| `season` | string | `2024-25` |
| `limit` | integer | `20` (default) |
| `offset` | integer | `0` (default) |

### Response Shape

```json
{
  "data": [ ... ],
  "meta": { "total": 100, "limit": 20, "offset": 0 },
  "error": null
}
```

### Example

```bash
curl -H "x-api-key: sk_..." \
  "http://localhost:3001/api/matches?status=upcoming&limit=5"
```

---

## Project Structure

```
SportsPulse/
├── src/
│   ├── index.js              Express app, middleware stack
│   ├── db.js                 SQLite connection + schema init
│   ├── seed.js               Seed script
│   ├── middleware/
│   │   ├── apiKey.js         API key validation
│   │   └── rateLimiter.js    Rate limit config
│   ├── routes/
│   │   ├── keys.js
│   │   ├── teams.js
│   │   └── matches.js
│   ├── schemas/
│   │   └── query.js          Zod schemas for query params
│   └── swagger.js            Swagger config
└── tests/
    ├── teams.test.js
    └── matches.test.js
```

---

## Running Tests

```bash
npm test
```

---

## Notes

- The database is SQLite for zero-config setup. Swapping to PostgreSQL requires one import change in `db.js`.
- Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`) are included in every response.
- Interactive Swagger docs at `/api/docs` allow testing every endpoint directly in the browser.
