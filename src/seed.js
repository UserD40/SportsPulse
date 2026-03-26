const db = require('./db');

// Wipe existing data
db.exec(`DELETE FROM matches; DELETE FROM teams; DELETE FROM sqlite_sequence WHERE name IN ('teams','matches');`);

const teams = [
  { name: 'Manchester City',    short_name: 'MCI', country: 'England', stadium: 'Etihad Stadium',          founded: 1880 },
  { name: 'Arsenal',            short_name: 'ARS', country: 'England', stadium: 'Emirates Stadium',         founded: 1886 },
  { name: 'Liverpool',          short_name: 'LIV', country: 'England', stadium: 'Anfield',                  founded: 1892 },
  { name: 'Chelsea',            short_name: 'CHE', country: 'England', stadium: 'Stamford Bridge',           founded: 1905 },
  { name: 'Manchester United',  short_name: 'MUN', country: 'England', stadium: 'Old Trafford',              founded: 1878 },
  { name: 'Tottenham Hotspur',  short_name: 'TOT', country: 'England', stadium: 'Tottenham Hotspur Stadium', founded: 1882 },
  { name: 'Newcastle United',   short_name: 'NEW', country: 'England', stadium: "St. James' Park",           founded: 1892 },
  { name: 'Aston Villa',        short_name: 'AVL', country: 'England', stadium: 'Villa Park',                founded: 1874 },
  { name: 'West Ham United',    short_name: 'WHU', country: 'England', stadium: 'London Stadium',            founded: 1895 },
  { name: 'Brighton',           short_name: 'BHA', country: 'England', stadium: 'Amex Stadium',              founded: 1901 },
  { name: 'Real Madrid',        short_name: 'RMA', country: 'Spain',   stadium: 'Santiago Bernabéu',         founded: 1902 },
  { name: 'Barcelona',          short_name: 'BAR', country: 'Spain',   stadium: 'Estadi Olímpic',            founded: 1899 },
  { name: 'Atletico Madrid',    short_name: 'ATM', country: 'Spain',   stadium: 'Metropolitano',             founded: 1903 },
  { name: 'Bayern Munich',      short_name: 'BAY', country: 'Germany', stadium: 'Allianz Arena',             founded: 1900 },
  { name: 'Borussia Dortmund',  short_name: 'BVB', country: 'Germany', stadium: 'Signal Iduna Park',         founded: 1909 },
  { name: 'Paris Saint-Germain',short_name: 'PSG', country: 'France',  stadium: 'Parc des Princes',          founded: 1970 },
  { name: 'AC Milan',           short_name: 'MIL', country: 'Italy',   stadium: 'San Siro',                  founded: 1899 },
  { name: 'Inter Milan',        short_name: 'INT', country: 'Italy',   stadium: 'San Siro',                  founded: 1908 },
  { name: 'Juventus',           short_name: 'JUV', country: 'Italy',   stadium: 'Allianz Stadium',           founded: 1897 },
  { name: 'Ajax',               short_name: 'AJX', country: 'Netherlands', stadium: 'Johan Cruyff Arena',    founded: 1900 },
];

const insertTeam = db.prepare(`
  INSERT INTO teams (name, short_name, country, stadium, founded)
  VALUES (@name, @short_name, @country, @stadium, @founded)
`);

db.transaction(() => {
  for (const team of teams) insertTeam.run(team);
})();

const competitions = {
  England:     'Premier League',
  Spain:       'La Liga',
  Germany:     'Bundesliga',
  France:      'Ligue 1',
  Italy:       'Serie A',
  Netherlands: 'Eredivisie',
};

const seasons = ['2023-24', '2024-25'];
const statuses = ['finished', 'finished', 'finished', 'upcoming', 'live'];

const allTeams = db.prepare('SELECT id, country FROM teams').all();

const byCountry = {};
for (const t of allTeams) {
  if (!byCountry[t.country]) byCountry[t.country] = [];
  byCountry[t.country].push(t.id);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isoDate(daysOffset) {
  const d = new Date('2025-01-01T15:00:00Z');
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString();
}

const insertMatch = db.prepare(`
  INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, status, kickoff, season, competition)
  VALUES (@home_team_id, @away_team_id, @home_score, @away_score, @status, @kickoff, @season, @competition)
`);

const matchRows = [];
let dayOffset = -90;

for (const [country, teamIds] of Object.entries(byCountry)) {
  const competition = competitions[country];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      for (const season of seasons) {
        const status = statuses[randomInt(0, statuses.length - 1)];
        const isFinished = status === 'finished';
        matchRows.push({
          home_team_id: teamIds[i],
          away_team_id: teamIds[j],
          home_score:   isFinished ? randomInt(0, 5) : null,
          away_score:   isFinished ? randomInt(0, 5) : null,
          status,
          kickoff:      isoDate(dayOffset),
          season,
          competition,
        });
        dayOffset += 3;
      }
    }
  }
}

// Champions League cross-country fixtures
const clTeams = allTeams.slice(0, 8).map(t => t.id);
for (let i = 0; i < clTeams.length - 1; i += 2) {
  const status = statuses[randomInt(0, statuses.length - 1)];
  const isFinished = status === 'finished';
  matchRows.push({
    home_team_id: clTeams[i],
    away_team_id: clTeams[i + 1],
    home_score:   isFinished ? randomInt(0, 4) : null,
    away_score:   isFinished ? randomInt(0, 4) : null,
    status,
    kickoff:      isoDate(dayOffset),
    season:       '2024-25',
    competition:  'Champions League',
  });
  dayOffset += 7;
}

db.transaction(() => {
  for (const row of matchRows) insertMatch.run(row);
})();

const teamCount  = db.prepare('SELECT COUNT(*) AS n FROM teams').get().n;
const matchCount = db.prepare('SELECT COUNT(*) AS n FROM matches').get().n;

console.log(`Seeded ${teamCount} teams and ${matchCount} matches.`);
