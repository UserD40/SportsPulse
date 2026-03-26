const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'sportspulse.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    short_name TEXT,
    country    TEXT,
    stadium    TEXT,
    founded    INTEGER
  );

  CREATE TABLE IF NOT EXISTS matches (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    home_team_id INTEGER REFERENCES teams(id),
    away_team_id INTEGER REFERENCES teams(id),
    home_score   INTEGER,
    away_score   INTEGER,
    status       TEXT CHECK(status IN ('upcoming', 'live', 'finished')) NOT NULL,
    kickoff      TEXT NOT NULL,
    season       TEXT NOT NULL,
    competition  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    key        TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    last_used  TEXT
  );
`);

module.exports = db;
