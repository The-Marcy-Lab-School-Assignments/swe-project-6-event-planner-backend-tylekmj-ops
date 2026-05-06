// db/seed.js
const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 8;

const seed = async () => {

  await pool.query('DROP TABLE IF EXISTS rsvps'); 
  await pool.query('DROP TABLE IF EXISTS events'); 
  await pool.query('DROP TABLE IF EXISTS users');

  await pool.query(`
    CREATE TABLE users (
      user_id       SERIAL PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE events (
      event_id     SERIAL  PRIMARY KEY,
      title        TEXT    NOT NULL,
      description  TEXT,
      date         TEXT    NOT NULL,
      location     TEXT    NOT NULL,
      event_type   TEXT    NOT NULL,
      max_capacity INTEGER NOT NULL,
      user_id      INTEGER REFERENCES users(user_id) ON DELETE CASCADE
    );
  `);

    await pool.query(`
    CREATE TABLE rsvps (
      rsvp_id  SERIAL  PRIMARY KEY,
      user_id  INTEGER REFERENCES users(user_id)  ON DELETE CASCADE,
      event_id INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
      UNIQUE (user_id, event_id)
    );
  `);

  const aliceHash = await bcrypt.hash('password123', SALT_ROUNDS);
  const bobHash = await bcrypt.hash('hunter2', SALT_ROUNDS);
  const carolHash = await bcrypt.hash('opensesame', SALT_ROUNDS);

  const insertUserSql = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id;';

  const aliceResponse = await pool.query(insertUserSql, ['alice', aliceHash]);
  const bobResponse = await pool.query(insertUserSql, ['bob', bobHash]);
  const carolResponse = await pool.query(insertUserSql, ['carol', carolHash]);

  const aliceId = aliceResponse.rows[0].user_id;
  const bobId = bobResponse.rows[0].user_id;
  const carolId = carolResponse.rows[0].user_id;

  const eventQuery = `
  INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
`;

  await pool.query(eventQuery, ['React Summit 2025',       'A full-day conference on modern React patterns.',  '2025-09-12', 'New York, NY',      'conference',  300, aliceId]);
  await pool.query(eventQuery, ['CSS Workshop',            'Hands-on workshop covering CSS Grid and Flexbox.',  '2025-08-03', 'Brooklyn, NY',      'workshop',     30, aliceId]);
  await pool.query(eventQuery, ['Dev Networking Mixer',    'Casual mixer for local software engineers.',        '2025-07-18', 'Manhattan, NY',     'networking',   80, bobId]);
  await pool.query(eventQuery, ['Jazz in the Park',        'Live jazz concert in Central Park.',                '2025-08-22', 'Central Park, NY',  'concert',     500, bobId]);
  await pool.query(eventQuery, ['Charity 5K Run',          'Fundraiser run supporting local food banks.',       '2025-10-05', 'Prospect Park, NY', 'fundraiser',  200, carolId]);

  const insertRsvpSql = 'INSERT INTO rsvps (user_id, event_id) VALUES ($1, $2)';

  await pool.query(insertRsvpSql, [aliceId, 3]); // alice RSVPs to Dev Networking Mixer
  await pool.query(insertRsvpSql, [aliceId, 4]); // alice RSVPs to Jazz in the Park
  await pool.query(insertRsvpSql, [bobId, 1]);   // bob RSVPs to React Summit
  await pool.query(insertRsvpSql, [bobId, 2]);   // bob RSVPs to CSS Workshop
  await pool.query(insertRsvpSql, [carolId, 1]); // carol RSVPs to React Summit
  await pool.query(insertRsvpSql, [carolId, 3]); // carol RSVPs to Dev Networking Mixer
  await pool.query(insertRsvpSql, [carolId, 4]); // carol RSVPs to Jazz in the Park

  console.log('Database seeded.');
};

seed()
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
